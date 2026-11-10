/** HTTP 解析边界拒绝非法月用量及扣量结果，不把异常载荷当无限额。 */
import { beforeEach, expect, it, vi } from 'vitest'
import { fetchBingUsage, reportBingUsage } from '@/sites/bing/usage/usageApi'

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/core/api', async importOriginal => ({
  ...await importOriginal<typeof import('@/core/api')>(), httpClient: http
}))
const tokens = { accessToken: null, refreshToken: null }
const snapshot = { used: 1, total: 1000, period: '2026-11', exhausted: false }
beforeEach(() => vi.clearAllMocks())

it('只消费共享月账本字段，不沿用 Google 的单次权益', async () => {
  http.get.mockResolvedValue({ ...snapshot, run_limits: { search: 500 } })
  expect(await fetchBingUsage(tokens, 0)).toEqual(snapshot)
})

it.each([{ used: -1 }, { total: null }, { period: 11 }, { exhausted: 'false' }])('拒绝非法快照 %j', async invalid => {
  http.get.mockResolvedValue({ ...snapshot, ...invalid })
  await expect(fetchBingUsage(tokens, 0)).rejects.toThrow(/无效月用量/)
})

it('上报保留同一 request_id，缺失 deducted 的响应不能算成功', async () => {
  http.post.mockResolvedValue(snapshot)
  await expect(reportBingUsage(3, 'session-test-id', tokens, 0)).rejects.toThrow(/无效扣量结果/)
  http.post.mockResolvedValue({ ...snapshot, deducted: false })
  await reportBingUsage(3, 'session-test-id', tokens, 0)
  expect(http.post).toHaveBeenLastCalledWith('/api/client/maps/usage/report',
    { records: 3, request_id: 'session-test-id' }, { skipErrorToast: true, expectedAuthTokens: tokens, params: { expected_user_id: 0 } })
})
