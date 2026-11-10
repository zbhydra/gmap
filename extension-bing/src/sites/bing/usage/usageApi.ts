import { API, httpClient } from '@/core/api'
import type { AuthTokens } from '@/core/api/auth/session'
import type { BingUsageSnapshot } from './types'

function isUsageSnapshot(value: unknown): value is BingUsageSnapshot {
  return (
    typeof value === 'object' &&
    value !== null &&
    'used' in value &&
    typeof value.used === 'number' &&
    Number.isSafeInteger(value.used) &&
    value.used >= 0 &&
    'total' in value &&
    typeof value.total === 'number' &&
    Number.isSafeInteger(value.total) &&
    value.total >= 0 &&
    'period' in value &&
    typeof value.period === 'string' &&
    /^\d{4}-\d{2}$/.test(value.period) &&
    'exhausted' in value &&
    typeof value.exhausted === 'boolean'
  )
}

export async function fetchBingUsage(
  expectedAuthTokens: AuthTokens,
  expectedUserId: number
): Promise<BingUsageSnapshot> {
  const data = await httpClient.get<unknown>(API.ENDPOINTS.MAPS_USAGE, {
    skipErrorToast: true,
    expectedAuthTokens,
    params: { expected_user_id: expectedUserId }
  })
  if (!isUsageSnapshot(data)) {
    throw new Error('[BingUsage] GET /maps/usage 返回无效月用量')
  }
  return { used: data.used, total: data.total, period: data.period, exhausted: data.exhausted }
}

export async function reportBingUsage(
  records: number,
  requestId: string,
  expectedAuthTokens: AuthTokens,
  expectedUserId: number
): Promise<void> {
  const data = await httpClient.post<unknown>(
    API.ENDPOINTS.MAPS_USAGE_REPORT,
    { records, request_id: requestId },
    { skipErrorToast: true, expectedAuthTokens, params: { expected_user_id: expectedUserId } }
  )
  if (!isUsageSnapshot(data) || !('deducted' in data) || typeof data.deducted !== 'boolean') {
    throw new Error('[BingUsage] POST /maps/usage/report 返回无效扣量结果')
  }
}
