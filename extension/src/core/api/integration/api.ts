/**
 * Maps 集成 API（013 A10，U9）：backend 代理端点封装。
 */

import { httpClient } from '../index'
import { API_ENDPOINTS } from '../config'
import type { IntegrationHubspotSyncPayload, IntegrationHubspotSyncResult } from './types'

/**
 * 集成 API 函数集合。
 */
export const integrationApi = {
  /**
   * 同步商家到 HubSpot（backend 转发 HubSpot API）。
   *
   * 注意：传的 token 是用户的 HubSpot access token，不是插件登录 token——
   * 放请求体而非 Authorization 头，避开 tokenInjector 的插件凭证语义。
   */
  syncBusinessesToHubspot: async (
    payload: IntegrationHubspotSyncPayload
  ): Promise<IntegrationHubspotSyncResult> => {
    return httpClient.post<IntegrationHubspotSyncResult>(API_ENDPOINTS.MAPS_HUBSPOT_SYNC, payload, {
      skipErrorToast: true,
      skipRequestLog: true
    })
  }
}
