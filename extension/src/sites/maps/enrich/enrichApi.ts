/**
 * Maps Email/社媒补全 HTTP 通道（013 A4，U8，background 侧）。
 *
 * POST /api/client/maps/enrich  官网 Email/社媒补全（服务端自研，基线 #4）
 *
 * 身份由服务端从请求头推导（拦截器自动注入 X-Device-Id 与 Bearer）；配额已在
 * 采集侧计量（U7），本端点服务端不重复扣减，故无上报参数。调用失败一律抛错，
 * 由 enrichClient 决定失败语义（收敛为空结果 + 失败打点）。
 */

import { API } from '@/core/api/config'
import { httpClient } from '@/core/api'
import type { MapsEnrichBusinessInput, MapsEnrichResponse } from './types'

/**
 * 批量补全：单批上限 50（服务端 pydantic 同款校验，超出 422）。
 *
 * @param businesses 商家数组（调用方已按 domain 去重分批）。
 */
export async function enrichMapsBusinesses(
  businesses: MapsEnrichBusinessInput[]
): Promise<MapsEnrichResponse> {
  return httpClient.post<MapsEnrichResponse>(
    API.ENDPOINTS.MAPS_ENRICH,
    { businesses },
    {
      requireAuth: false,
      skipErrorToast: true
    }
  )
}
