/**
 * 订阅 API
 *
 * Bing 插件（016 域）的订阅权益在 maps_extension 产品线（C2 分产品订阅），
 * 后端 /subscription/status 缺省查 extension（TG 下载线），必须显式传
 * product_line 才能拿到本插件的 Pro 判定。
 */

import { httpClient } from '../index'
import { API } from '../config'
import type { SubscriptionStatus } from './types'

/** 本插件订阅所属产品线（与后端 SUBSCRIPTION_PRODUCT_LINES 白名单同值）。 */
const PRODUCT_LINE = 'maps_extension'

export const subscriptionApi = {
  /**
   * 获取当前账号在 maps_extension 产品线的订阅状态
   */
  async getStatus(): Promise<SubscriptionStatus> {
    return httpClient.get(`${API.ENDPOINTS.SUBSCRIPTION_STATUS}?product_line=${PRODUCT_LINE}`)
  }
}
