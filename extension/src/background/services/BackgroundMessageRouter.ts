/**
 * BackgroundMessageRouter - Background Script 消息路由器
 *
 * 使用新的 RPC 系统处理来自 popup 的消息
 */

import { logger } from '@/core/utils/logger'
import { serve } from '@/core/rpc/serve'
import type {
  JsonObject,
  JsonValue,
  RpcContext,
  RpcServeHandlers,
  RpcServeRegistration
} from '@/core/rpc/types'
import {
  CHANNEL,
  METHOD_REQUEST_LIMITS,
  METHOD_RESPONSE_LIMITS,
  METHOD_TARGETS,
  METHOD_TRANSPORTS
} from '@/background/background-register'
import { authApi } from '@/core/api'
import {
  EXTENSION_AUTH_CHANGED_MESSAGE_TYPE,
  EXTENSION_RETURN_MESSAGE_TYPE,
  buildExtensionLoginUrl,
  isAllowedWebsiteAuthOrigin,
  type ExternalBridgeResponse
} from '@/core/api/auth/websiteOrigin'
import { markApi } from '@/core/api/mark'
import { MARK_TYPE, type MarkType } from '@/core/api/mark/types'
import { getRuntimeConfig } from '../runtimeConfig'

const MARK_TYPE_VALUES: readonly string[] = Object.values(MARK_TYPE)

// ============ 消息路由器 ============

/**
 * BackgroundMessageRouter - Background Script 消息处理器
 */
export class BackgroundMessageRouter {
  private rpcRegistration: RpcServeRegistration | null = null

  /**
   * 注册 RPC v2 方法处理器。
   */
  private createRpcHandlers(): RpcServeHandlers {
    return {
      ping: () => this.ping(),
      getState: () => this.getState(),
      getRuntimeConfig: () => getRuntimeConfig(),
      openExtensionLogin: () => this.openExtensionLogin(),
      recordMark: (params, context) => {
        const request = parseRecordMarkRequest(params)
        return this.recordMark(request.mark_type, request.mark_msg, context)
      }
    }
  }

  /**
   * background 连通性检查。
   */
  private ping(): { pong: boolean; from: string } {
    logger.info('[BackgroundMessageRouter] 收到 PING')
    return { pong: true, from: 'background' }
  }

  /**
   * 获取 background 状态。
   */
  private getState(): { state: string } {
    logger.info('[BackgroundMessageRouter] 获取状态')
    return { state: 'active' }
  }

  /**
   * 打开官网插件登录页。
   *
   * 恒新开 tab；返回时 background 从消息 sender 取得 tabId 并关闭，无需提前记账。
   */
  private async openExtensionLogin(): Promise<{ opened: boolean }> {
    const loginUrl = buildExtensionLoginUrl()

    try {
      await chrome.tabs.create({ url: loginUrl })
      logger.info('[BackgroundMessageRouter] 已打开官网插件登录页')
      return { opened: true }
    } catch (error) {
      logger.error('[BackgroundMessageRouter] 打开官网插件登录页失败:', error)
      return { opened: false }
    }
  }

  /**
   * 由 background 代页面脚本记录打点。
   */
  private async recordMark(
    markType: MarkType,
    markMsg: string,
    context: RpcContext
  ): Promise<{ recorded: boolean }> {
    try {
      return await markApi.record(markType, markMsg, { pageUrl: context.origin })
    } catch (error) {
      logger.error('[BackgroundMessageRouter] 记录 SLS 打点失败:', error)
      return { recorded: false }
    }
  }

  /**
   * 处理官网页面经 externally_connectable 发来的消息。
   *
   * 对端是网页而非扩展，不进 RPC register；用 sender.origin 白名单隔离攻击面。
   */
  private readonly handleExternalMessage = (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExternalBridgeResponse) => void
  ): boolean => {
    if (!sender.origin || !isAllowedWebsiteAuthOrigin(sender.origin)) {
      logger.warn('[BackgroundMessageRouter] 拒绝非官网来源的 externally_connectable 消息', {
        origin: sender.origin
      })
      return false
    }

    if (!isExternalBridgeMessage(message)) {
      logger.warn('[BackgroundMessageRouter] 忽略未知类型的 externally_connectable 消息')
      return false
    }

    if (message.type === EXTENSION_AUTH_CHANGED_MESSAGE_TYPE) {
      if (typeof message.web_access_token !== 'string' || message.web_access_token.length === 0) {
        sendResponse({ ok: false, message: 'AUTH_CHANGED 缺少 web_access_token' })
        return false
      }
      // 换 token 是异步的，返回 true 保持消息通道直至 sendResponse 回执。
      void this.exchangeExternalAuth(message.web_access_token, sendResponse)
      return true
    }

    void this.closeLoginTabFromExternal(sender, sendResponse)
    return true
  }

  /**
   * 用官网登录态换取并保存插件登录态，并完成 external message 回调。
   */
  private async exchangeExternalAuth(
    webAccessToken: string,
    sendResponse: (response: ExternalBridgeResponse) => void
  ): Promise<void> {
    try {
      await authApi.exchangeWebsiteTokenForExtensionAuth(webAccessToken)
      logger.info('[BackgroundMessageRouter] 已通过 externally_connectable 同步官网登录态到插件')
      sendResponse({ ok: true })
    } catch (error) {
      logger.error('[BackgroundMessageRouter] 同步官网登录态到插件失败:', error)
      sendResponse({ ok: false, message: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * 处理官网 v2 登录页的完成回执：关闭登录页并回执。
   *
   * 页面侧 window.close() 可能被 Chrome 拒绝（例如 Google redirect 回跳后，tab
   * 不再满足 script-closable 条件），所以由 background 用 sender.tab.id 关闭；
   * sender.tab 来自消息信封，无需记账。tab 已被用户手关时 remove 报错，忽略即可。
   */
  private async closeLoginTabFromExternal(
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExternalBridgeResponse) => void
  ): Promise<void> {
    const loginTabId = sender.tab?.id
    if (loginTabId !== undefined) {
      try {
        await chrome.tabs.remove(loginTabId)
      } catch (error) {
        logger.warn('[BackgroundMessageRouter] 关闭登录页 tab 失败（可能已被用户关闭）:', error)
      }
    }
    sendResponse({ ok: true })
  }

  /**
   * 设置消息监听器
   */
  setupListener(): void {
    this.rpcRegistration = serve(CHANNEL, this.createRpcHandlers(), {
      transports: ['chrome'],
      methodTargets: METHOD_TARGETS,
      methodTransports: METHOD_TRANSPORTS,
      requestLimits: METHOD_REQUEST_LIMITS,
      responseLimits: METHOD_RESPONSE_LIMITS
    })
    // 与 RPC 监听器同生命周期管理，避免单测重建 router 时累积 external 监听器。
    chrome.runtime.onMessageExternal.addListener(this.handleExternalMessage)
    logger.info('[BackgroundMessageRouter] 消息监听器已设置')
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.rpcRegistration?.stop()
    this.rpcRegistration = null
    chrome.runtime.onMessageExternal.removeListener(this.handleExternalMessage)
    logger.info('[BackgroundMessageRouter] 消息监听器已移除')
  }
}

/**
 * 解析 recordMark 请求参数。
 */
function parseRecordMarkRequest(params: JsonValue | undefined): {
  mark_type: MarkType
  mark_msg: string
} {
  if (!isJsonObject(params) || !isMarkType(params.mark_type)) {
    throw new Error('[BackgroundMessageRouter] recordMark 请求缺少合法 mark_type')
  }

  if (params.mark_msg !== undefined && typeof params.mark_msg !== 'string') {
    throw new Error('[BackgroundMessageRouter] recordMark 请求 mark_msg 必须是字符串')
  }

  return { mark_type: params.mark_type, mark_msg: params.mark_msg ?? '' }
}

/**
 * 判断值是否为已声明打点类型。
 */
function isMarkType(value: JsonValue | undefined): value is MarkType {
  return typeof value === 'string' && MARK_TYPE_VALUES.includes(value)
}

/**
 * 判断值是否为 JSON 对象。
 */
function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 官网页面经 externally_connectable 发送的消息。 */
interface ExternalBridgeMessage {
  /** 消息类型（仅白名单内的两种）。 */
  readonly type: typeof EXTENSION_AUTH_CHANGED_MESSAGE_TYPE | typeof EXTENSION_RETURN_MESSAGE_TYPE
  /** AUTH_CHANGED 载荷：官网 access token。 */
  readonly web_access_token?: unknown
}

/** 判断外部消息是否属于官网桥接契约内的类型。 */
function isExternalBridgeMessage(value: unknown): value is ExternalBridgeMessage {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const type = (value as { readonly type?: unknown }).type
  return type === EXTENSION_AUTH_CHANGED_MESSAGE_TYPE || type === EXTENSION_RETURN_MESSAGE_TYPE
}
