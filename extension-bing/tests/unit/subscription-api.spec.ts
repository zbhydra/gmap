import { expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('../../src/core/api/index', () => ({ httpClient: { get: mocks.get } }))

import { subscriptionApi } from '../../src/core/api/subscription/api'

it('显式查询双插件共享的 maps_extension 产品类别', async () => {
  mocks.get.mockResolvedValueOnce({ period: 'free' })
  await subscriptionApi.getStatus()
  expect(mocks.get).toHaveBeenCalledWith(
    '/api/client/subscription/status?product_kind=maps_extension'
  )
})
