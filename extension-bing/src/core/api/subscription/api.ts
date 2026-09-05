/**
 * 订阅 API
 *
 * Bing 与 Google Maps 插件共享 maps_extension 产品类别，查询必须显式传 product_kind。
 */

import { httpClient } from '../index'
import { API } from '../config'
import type { SubscriptionStatus } from './types'

export const subscriptionApi = {
  /**
   * 获取当前账号在 maps_extension 产品类别的订阅状态
   */
  async getStatus(): Promise<SubscriptionStatus> {
    return httpClient.get(`${API.ENDPOINTS.SUBSCRIPTION_STATUS}?product_kind=maps_extension`)
  }
}
