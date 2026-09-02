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
import { markApi } from '@/core/api/mark'
import { MARK_TYPE, type MarkType } from '@/core/api/mark/types'
import { getRuntimeConfig } from '../runtimeConfig'
import { fetchMapsRemoteConfig } from '@/sites/maps/config/remoteFetch'
import { mapsUsageService } from '@/sites/maps/usage/usageService'
import { enrichMapsBusinesses } from '@/sites/maps/enrich/enrichApi'
import { openExtensionLogin } from '../services/extensionLogin'
import { bulkScheduler } from '../batch/controller'
import type { BulkCreateTaskParams } from '../batch/types'

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
      getMapsConfig: () => fetchMapsRemoteConfig(),
      recordMark: (params, context) => {
        const request = parseRecordMarkRequest(params)
        return this.recordMark(request.mark_type, request.mark_msg, context)
      },
      // UI 门控入口（面板挂载/Start 门控/popup 账号区）总现拉：对齐竞品
      // 「每次 boot 现拉 quota、只进内存」语义，避免缓存陈旧误放行。
      getMapsUsage: () => mapsUsageService.getSnapshot(true),
      // v3 插件登录（popup 账号区入口）：登录 owner 在 background，失败
      // 统一收敛为 opened=false，不抛 RPC 错误（完整登录常态超默认 30s 超时）
      openExtensionLogin: () => openExtensionLogin(),
      // Email/社媒补全代理（U8）：透传商家数组给后端 enrich 端点，配额
      // 已由采集侧计量（服务端不重复扣减），身份由 httpClient 拦截器注入
      enrichMapsBusinesses: params => enrichMapsBusinesses(parseEnrichBusinesses(params)),
      // 订阅落地页代开（U7 遗留接线，W7）：content 无 tabs 能力，校验后
      // chrome.tabs.create 新标签打开；失败返回 opened=false 不抛 RPC 错误
      openPricingPage: params => this.openPricingPage(parseOpenPricingPageUrl(params)),
      getBulkState: () => bulkScheduler.getState(),
      createBulkTask: params => bulkScheduler.createTask(parseCreateBulkTaskRequest(params)),
      startBulkTask: params => bulkScheduler.startTask(parseBulkTaskIdRequest(params)),
      stopBulkTask: params => bulkScheduler.stopTask(parseBulkTaskIdRequest(params)),
      deleteBulkTask: params => bulkScheduler.deleteTask(parseBulkTaskIdRequest(params))
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
   * 打开订阅落地页（013 U7 遗留接线，W7）：chrome.tabs.create 新标签打开
   * content 组装好的 URL（含归因参数）。URL 已在 RPC 边界做 http(s) 校验；
   * 创建失败仅记录并返回 opened=false（局部可失败，不抛 RPC 错误）。
   */
  private async openPricingPage(url: string): Promise<{ opened: boolean }> {
    try {
      await chrome.tabs.create({ url })
      return { opened: true }
    } catch (error) {
      logger.error('[BackgroundMessageRouter] 打开订阅落地页失败:', error)
      return { opened: false }
    }
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
    logger.info('[BackgroundMessageRouter] 消息监听器已设置')
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.rpcRegistration?.stop()
    this.rpcRegistration = null
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

/**
 * 解析补全请求：逐字段校验商家数组形状（上限 50 的切片在调用方 enrichClient）。
 */
function parseEnrichBusinesses(params: JsonValue | undefined): Array<{
  domain: string
  website: string
  name: string
  address: string
}> {
  if (!isJsonObject(params) || !Array.isArray(params.businesses)) {
    throw new Error('[BackgroundMessageRouter] enrichMapsBusinesses 请求缺少 businesses 数组')
  }
  return params.businesses.map(business => {
    if (!isJsonObject(business)) {
      throw new Error('[BackgroundMessageRouter] enrichMapsBusinesses 商家项必须是对象')
    }
    return {
      domain: requireEnrichString(business, 'domain'),
      website: requireEnrichString(business, 'website'),
      name: requireEnrichString(business, 'name'),
      address: requireEnrichString(business, 'address')
    }
  })
}

/** 读取对象中的字符串字段，缺失或非串抛错（RPC 边界契约校验）。 */
function requireEnrichString(source: JsonObject, field: string): string {
  const value = source[field]
  if (typeof value !== 'string') {
    throw new Error(`[BackgroundMessageRouter] enrichMapsBusinesses 商家项 ${field} 必须是字符串`)
  }
  return value
}

/**
 * 解析订阅落地页打开请求：校验 url 是合法 http(s) 绝对地址（tabs.create
 * 只接受浏览器可导航协议，拒绝其余 scheme 的脏载荷）。
 */
function parseOpenPricingPageUrl(params: JsonValue | undefined): string {
  if (!isJsonObject(params) || typeof params.url !== 'string') {
    throw new Error('[BackgroundMessageRouter] openPricingPage 请求缺少合法 url')
  }

  let parsed: URL
  try {
    parsed = new URL(params.url)
  } catch {
    throw new Error('[BackgroundMessageRouter] openPricingPage url 不是合法绝对地址')
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('[BackgroundMessageRouter] openPricingPage 仅允许 http(s) URL')
  }
  return parsed.toString()
}

/**
 * 解析创建批量任务请求：逐字段校验形状（业务规则校验在状态机内）。
 */
function parseCreateBulkTaskRequest(params: JsonValue | undefined): BulkCreateTaskParams {
  if (!isJsonObject(params)) {
    throw new Error('[BackgroundMessageRouter] createBulkTask 请求缺少参数对象')
  }
  if (typeof params.name !== 'string') {
    throw new Error('[BackgroundMessageRouter] createBulkTask 请求 name 必须是字符串')
  }
  if (params.type !== 'keywords' && params.type !== 'review-urls') {
    throw new Error('[BackgroundMessageRouter] createBulkTask 请求 type 非法')
  }
  if (!Array.isArray(params.values) || params.values.some(value => typeof value !== 'string')) {
    throw new Error('[BackgroundMessageRouter] createBulkTask 请求 values 必须是字符串数组')
  }
  const limit = params.reviewsPerStoreLimit
  if (limit !== null && (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1)) {
    throw new Error('[BackgroundMessageRouter] createBulkTask 请求 reviewsPerStoreLimit 非法')
  }

  return {
    name: params.name,
    type: params.type,
    values: params.values,
    reviewsPerStoreLimit: limit
  }
}

/**
 * 解析任务 id 命令请求（start/stop/delete 共用）。
 */
function parseBulkTaskIdRequest(params: JsonValue | undefined): string {
  if (!isJsonObject(params) || typeof params.taskId !== 'string' || params.taskId.length === 0) {
    throw new Error('[BackgroundMessageRouter] 批量任务命令缺少合法 taskId')
  }
  return params.taskId
}
