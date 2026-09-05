/**
 * 订阅 API
 */

import { httpClient } from '../index'
import { API } from '../config'
import type { SubscriptionStatus } from './types'
import type { JsonObject, JsonValue } from '../../rpc/types'

export const subscriptionApi = {
  /**
   * 获取订阅状态
   */
  async getStatus(): Promise<SubscriptionStatus> {
    return parseSubscriptionStatus(
      await httpClient.get<JsonValue>(API.ENDPOINTS.SUBSCRIPTION_STATUS)
    )
  }
}

/**
 * 收窄订阅状态响应为 U1 六字段合同；响应允许多余字段，六字段类型错误拒绝。
 */
function parseSubscriptionStatus(value: JsonValue): SubscriptionStatus {
  if (
    !isJsonObject(value) ||
    (value.status !== 'active' && value.status !== 'unavailable') ||
    (value.period !== 'free' &&
      value.period !== 'month' &&
      value.period !== 'quarter' &&
      value.period !== 'year' &&
      value.period !== 'unavailable') ||
    typeof value.display_name !== 'string' ||
    (value.expires_at !== null && typeof value.expires_at !== 'number') ||
    typeof value.auto_renew !== 'boolean' ||
    (value.payment_method !== null && typeof value.payment_method !== 'string')
  ) {
    throw new Error('[subscriptionApi.getStatus] /api/client/subscription/status 返回合同不完整')
  }

  return {
    status: value.status,
    period: value.period,
    display_name: value.display_name,
    expires_at: value.expires_at,
    auto_renew: value.auto_renew,
    payment_method: value.payment_method
  }
}

/** 判断 JSON 值是否为可按字段读取的对象。 */
function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
