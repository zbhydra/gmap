/**
 * 订阅 API
 */

import { httpClient } from '../index'
import { API } from '../config'
import type { SubscriptionStatus } from './types'

export const subscriptionApi = {
  /**
   * 获取订阅状态
   */
  async getStatus(): Promise<SubscriptionStatus> {
    return httpClient.get(API.ENDPOINTS.SUBSCRIPTION_STATUS)
  }
}
