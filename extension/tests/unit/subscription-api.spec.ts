/** 主扩展订阅状态 API 合同测试（U1 后端六字段真实响应）。 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('../../src/core/api/index', () => ({
  httpClient: { get: mocks.get }
}))

import { subscriptionApi } from '../../src/core/api/subscription/api'

function subscriptionStatus(period: 'quarter' | 'year') {
  return {
    status: 'active',
    period,
    display_name: 'Unlimited',
    expires_at: 1_905_076_800_000,
    auto_renew: false,
    payment_method: 'paypal'
  }
}

describe('subscriptionApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('parses quarter/year from the six-field status response and rejects bad periods', async () => {
    for (const period of ['quarter', 'year'] as const) {
      mocks.get.mockResolvedValueOnce({ ...subscriptionStatus(period), extra: 'ignored' })
      await expect(subscriptionApi.getStatus()).resolves.toMatchObject({
        status: 'active',
        period,
        auto_renew: false,
        payment_method: 'paypal'
      })
    }

    mocks.get.mockResolvedValueOnce({ ...subscriptionStatus('year'), period: 'week' })
    await expect(subscriptionApi.getStatus()).rejects.toThrow('返回合同不完整')

    const { status: _missing, ...withoutStatus } = subscriptionStatus('year')
    mocks.get.mockResolvedValueOnce(withoutStatus)
    await expect(subscriptionApi.getStatus()).rejects.toThrow('返回合同不完整')
  })
})
