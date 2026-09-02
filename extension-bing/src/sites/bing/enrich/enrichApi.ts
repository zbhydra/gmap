/**
 * Email/社媒补全 HTTP 通道（016 E6 二期，background 侧）。
 *
 * POST /api/client/maps/enrich  官网 Email/社媒补全（013 A4 自研服务端，
 * gmap/bing 两线共享；Bing 行无独立 domain，服务端以 website 主机名归属）。
 *
 * 身份由服务端从请求头推导（拦截器自动注入 X-Device-Id 与 Bearer）；配额在
 * 采集完成边沿已按会话计量（U7 口径），本端点服务端不重复扣减。调用失败一律
 * 抛错，由 enrichClient 决定失败语义（收敛为空结果 + 失败打点）。
 */

import { API } from '@/core/api/config'
import { httpClient } from '@/core/api'
import type { EnrichBusinessInput, EnrichResponse } from './types'

/**
 * 批量补全：单批上限 50（服务端 pydantic 同款校验，超出 422）。
 *
 * @param businesses 商家数组（调用方已按 website 主机名去重分批）。
 */
export async function enrichBusinesses(businesses: EnrichBusinessInput[]): Promise<EnrichResponse> {
  return httpClient.post<EnrichResponse>(
    API.ENDPOINTS.MAPS_ENRICH,
    { businesses },
    {
      requireAuth: false,
      skipErrorToast: true
    }
  )
}
