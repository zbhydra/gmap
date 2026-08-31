/**
 * Maps 集成 API 类型（013 A10，U9）。
 *
 * HubSpot 同步走 backend 代理端点（`POST /api/client/maps/hubspot/sync`）：
 * 插件传用户授权的 access token 与商家数组，服务端转发 HubSpot API——
 * 与竞品云函数代理同构（避免插件直连、便于服务端治理）。
 */

/** 同步到 HubSpot companies 的单条商家（缺失字段为空串，服务端剔除空属性）。 */
export interface IntegrationHubspotBusiness {
  /** 商家名（HubSpot company.name）。 */
  name: string
  /** 官网域名（HubSpot company.domain）。 */
  domain: string
  /** 主电话（HubSpot company.phone）。 */
  phone: string
  /** 街道地址，缺街道时回退完整地址（HubSpot company.address）。 */
  address: string
  /** 市镇（HubSpot company.city）。 */
  city: string
}

/** HubSpot 同步请求体。 */
export interface IntegrationHubspotSyncPayload {
  /** 用户 HubSpot OAuth access token（插件侧持有，服务端不落库）。 */
  token: string
  /** 商家数组（Place Id 去重后）。 */
  businesses: IntegrationHubspotBusiness[]
}

/** HubSpot 同步响应。 */
export interface IntegrationHubspotSyncResult {
  /** 成功建到 HubSpot 的 companies 条数。 */
  synced: number
}
