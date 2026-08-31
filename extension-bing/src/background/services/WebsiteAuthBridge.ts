/**
 * 官网登录桥（016 §5 / feat.md 登录同步子流程）。
 *
 * 官网页（website auth.ts）经 chrome.runtime.sendMessage 直发本扩展，
 * 由 background onMessageExternal 接收并校验 sender.origin——外部消息不进
 * content script、不授予 host access（spec-extension §7 口径）。白名单与
 * manifest externally_connectable 同源（构建期 WEBSITE_AUTH_ORIGINS，域名
 * 未定前统一指向占位官网域，见 feat.md 待决项）。
 *
 * 消息两种（常量与 website scripts/homepage/auth.ts 已发布值逐字一致，不得另造）：
 * - AUTH_CHANGED：取 payload.web_access_token 走既有 HTTP 用户信息校验
 *   （等价官网 getCurrentUser），有效则持久化并更新 authStore，无效丢弃并 warn；
 * - LOGIN_RETURN：按 sender.tab.id 关闭登录 tab（chrome.tabs 操作 tab 无需
 *   "tabs" 权限，该权限仅控制读取 url/title 等元数据）。
 *
 * 隐私红线：token 不进日志（warn 只记 stage，不记 token 值）。
 */

import { WEBSITE_AUTH_ORIGINS } from '@/core/api/config'
import { logger } from '@/core/utils/logger'
import { getBackgroundAuthStore } from './backgroundStores'

/** 网页 → Bing 插件：website 登录态变更，消息体携带 web_access_token。 */
export const BING_MAPS_EXTENSION_AUTH_CHANGED = 'BING_MAPS_EXTENSION_AUTH_CHANGED'
/** 网页 → Bing 插件：登录页请求关闭当前登录 tab。 */
export const BING_MAPS_EXTENSION_LOGIN_RETURN = 'BING_MAPS_EXTENSION_LOGIN_RETURN'

/** 桥接消息形状（website sendMessage 第二参，Record<string, string>）。 */
interface WebsiteBridgeMessage {
  type?: unknown
  web_access_token?: unknown
}

/** 桥接回执（website 侧 callback 读取；收到回执即 lastError 为空）。 */
interface WebsiteBridgeAck {
  ok: boolean
}

/** 判断 sender 是否来自官网白名单 origin。 */
export function isTrustedWebsiteOrigin(origin: string | undefined): boolean {
  return origin !== undefined && WEBSITE_AUTH_ORIGINS.includes(origin)
}

/** 官网登录桥：onMessageExternal 接收与登录 tab 收尾。 */
export class WebsiteAuthBridge {
  /** chrome 事件监听器引用（destroy 用）。 */
  private readonly messageListener = (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: WebsiteBridgeAck) => void
  ): boolean => {
    void this.handleMessage(message, sender).then(sendResponse)
    // 异步校验期间保持消息通道开放（MV3 sendResponse 语义）
    return true
  }

  /** 注册 onMessageExternal 监听（幂等由 Chrome 去重保证，setup 只调一次）。 */
  setup(): void {
    chrome.runtime.onMessageExternal.addListener(this.messageListener)
    logger.info('[WebsiteAuthBridge] onMessageExternal 监听已注册')
  }

  /** SW 卸载清理监听。 */
  destroy(): void {
    chrome.runtime.onMessageExternal.removeListener(this.messageListener)
  }

  /** 单条外部消息处理：origin 白名单 → 按类型分派。 */
  async handleMessage(
    message: unknown,
    sender: chrome.runtime.MessageSender
  ): Promise<WebsiteBridgeAck> {
    if (!isTrustedWebsiteOrigin(sender.origin)) {
      logger.warn('[WebsiteAuthBridge] 拒绝非白名单来源的外部消息:', sender.origin ?? 'unknown')
      return { ok: false }
    }

    const payload = message as WebsiteBridgeMessage
    switch (payload?.type) {
      case BING_MAPS_EXTENSION_AUTH_CHANGED:
        return this.handleAuthChanged(payload)
      case BING_MAPS_EXTENSION_LOGIN_RETURN:
        return this.handleLoginReturn(sender)
      default:
        logger.warn('[WebsiteAuthBridge] 忽略未知类型的外部消息')
        return { ok: false }
    }
  }

  /**
   * 登录态同步：web token 校验收编（authStore.applyWebsiteToken）。
   * 校验失败（无效/过期 token、网络失败）丢弃并 warn，不广播账号态。
   */
  private async handleAuthChanged(payload: WebsiteBridgeMessage): Promise<WebsiteBridgeAck> {
    const webAccessToken = payload.web_access_token
    if (typeof webAccessToken !== 'string' || webAccessToken.trim().length === 0) {
      logger.warn('[WebsiteAuthBridge] AUTH_CHANGED 缺少有效 web_access_token，丢弃')
      return { ok: false }
    }

    try {
      await getBackgroundAuthStore().applyWebsiteToken(webAccessToken)
      logger.info('[WebsiteAuthBridge] 官网登录态同步完成')
      return { ok: true }
    } catch (error) {
      // 无效 token 丢弃：warn 不携带 token 值（隐私红线）
      logger.warn('[WebsiteAuthBridge] web_access_token 校验未通过，已丢弃:', error)
      return { ok: false }
    }
  }

  /** 登录页收尾：按来源 tab 关闭登录 tab（无 tab 上下文则忽略）。 */
  private async handleLoginReturn(sender: chrome.runtime.MessageSender): Promise<WebsiteBridgeAck> {
    const tabId = sender.tab?.id
    if (tabId === undefined) {
      logger.warn('[WebsiteAuthBridge] LOGIN_RETURN 缺少 sender.tab.id，忽略')
      return { ok: false }
    }

    try {
      await chrome.tabs.remove(tabId)
      logger.info('[WebsiteAuthBridge] 登录 tab 已关闭:', tabId)
      return { ok: true }
    } catch (error) {
      // tab 已被用户手动关闭等场景：收尾动作失败不影响登录态
      logger.warn('[WebsiteAuthBridge] 关闭登录 tab 失败:', error)
      return { ok: false }
    }
  }
}
