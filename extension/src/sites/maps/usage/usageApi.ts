/**
 * Maps 月度配额 HTTP 通道（013 A11，U7，background 侧）。
 *
 * GET  /api/client/maps/usage        查询当月用量（used/total/period/exhausted）
 * POST /api/client/maps/usage/report 采集完成上报扣减（request_id 幂等）
 *
 * 身份由服务端从请求头推导（拦截器自动注入 X-Device-Id 与 Bearer）；调用
 * 失败一律抛错，由 usageService 决定失败语义（查询 null、上报仅记录）。
 */

import { API } from '@/core/api/config'
import { httpClient } from '@/core/api'
import type { MapsUsageSnapshot } from './types'

/** 上报响应载荷：最新用量 + 本次是否实际扣减（幂等命中为 false）。 */
export interface MapsUsageReportResponse extends MapsUsageSnapshot {
  /** 本次上报是否实际扣减（同 request_id 重放为 false）。 */
  deducted: boolean
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

/** HTTP 边界验证后，采集入口直接信任有效权益，不重复按套餐名推算。 */
function isMapsUsageSnapshot(value: unknown): value is MapsUsageSnapshot {
  if (typeof value !== 'object' || value === null || !('run_limits' in value)) {
    return false
  }
  const limits = value.run_limits
  return (
    'plan_name' in value &&
    (value.plan_name === 'Free' || value.plan_name === 'Pro' || value.plan_name === 'Business') &&
    'used' in value &&
    typeof value.used === 'number' &&
    Number.isSafeInteger(value.used) &&
    value.used >= 0 &&
    'total' in value &&
    isPositiveInteger(value.total) &&
    'period' in value &&
    typeof value.period === 'string' &&
    'exhausted' in value &&
    typeof value.exhausted === 'boolean' &&
    typeof limits === 'object' &&
    limits !== null &&
    'search' in limits &&
    isPositiveInteger(limits.search) &&
    'reviews' in limits &&
    isPositiveInteger(limits.reviews) &&
    'photos' in limits &&
    isPositiveInteger(limits.photos)
  )
}

/** 拉取当月用量快照。 */
export async function fetchMapsUsage(): Promise<MapsUsageSnapshot> {
  const data = await httpClient.get<unknown>(API.ENDPOINTS.MAPS_USAGE, {
    skipErrorToast: true
  })
  if (!isMapsUsageSnapshot(data)) {
    throw new Error('[MapsUsage] GET /maps/usage 响应缺少有效用量或采集上限')
  }
  return data
}

/**
 * 上报一次采集会话的记录数扣减，返回扣减后的最新用量。
 *
 * @param records 本会话采集记录数（搜索行/评论条/照片张）。
 * @param requestId 会话幂等 ID（UUID），同 ID 重放只扣一次。
 */
export async function reportMapsUsage(
  records: number,
  requestId: string
): Promise<MapsUsageReportResponse> {
  const data = await httpClient.post<unknown>(
    API.ENDPOINTS.MAPS_USAGE_REPORT,
    {
      records,
      request_id: requestId
    },
    {
      skipErrorToast: true
    }
  )
  if (!isMapsUsageSnapshot(data) || !('deducted' in data) || typeof data.deducted !== 'boolean') {
    throw new Error('[MapsUsage] POST /maps/usage/report 响应缺少有效用量或采集上限')
  }
  return { ...data, deducted: data.deducted }
}
