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
import { fetchBingRemoteConfig } from '@/sites/bing/config/remoteFetch'
import { enrichBusinesses } from '@/sites/bing/enrich/enrichApi'
import { getBackgroundAuthStore, ensureAuthStoreHydrated } from './backgroundStores'
import { handleOpenExtensionLogin } from './openExtensionLogin'
import type { BackgroundGetGateStateResponse } from '../types'
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
      getBingConfig: () => fetchBingRemoteConfig(),
      getGateState: () => this.getGateState(),
      openExtensionLogin: (params, context) => handleOpenExtensionLogin(params, context),
      recordMark: (params, context) => {
        const request = parseRecordMarkRequest(params)
        return this.recordMark(request.mark_type, request.mark_msg, context)
      },
      enrichBusinesses: params => enrichBusinesses(parseEnrichBusinesses(params))
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
   * 查询免费/Pro 门控态（016 §5）：登录态 + 订阅判定经 authStore（缓存口径
   * 由 store 内 TTL 决定）；未登录直接匿名免费，不发订阅请求。SW 冷启动
   * 先从持久化恢复账号态，避免内存态丢失误判为匿名。
   */
  private async getGateState(): Promise<BackgroundGetGateStateResponse> {
    await ensureAuthStoreHydrated()
    const store = getBackgroundAuthStore()
    if (!store.isAuthenticated) {
      return { authenticated: false, isPro: false, displayName: null }
    }
    await store.refreshSubscription()
    return {
      authenticated: true,
      isPro: store.isPro,
      displayName: store.displayName || null
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
    throw new Error('[BackgroundMessageRouter] enrichBusinesses 请求缺少 businesses 数组')
  }
  return params.businesses.map(business => {
    if (!isJsonObject(business)) {
      throw new Error('[BackgroundMessageRouter] enrichBusinesses 商家项必须是对象')
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
    throw new Error(`[BackgroundMessageRouter] enrichBusinesses 商家项 ${field} 必须是字符串`)
  }
  return value
}
