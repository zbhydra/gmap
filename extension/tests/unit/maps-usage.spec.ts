/**
 * Maps 月度配额单元测试（013 A11，U7 验收行为直接覆盖）。
 *
 * 覆盖面：批量配额前置校验纯函数（预估 = 条目数 × 单批上限、剩余判定、
 * 快照缺失 fail-open）、usage 门控判定（exhausted / 快照缺失放行）、
 * usageService（缓存命中、force 现拉、拉取失败回退旧快照、完成上报更新
 * 快照且失败仅记录不抛）。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  checkBulkQuota,
  estimateBulkRecords,
  isBulkQuotaExceeded
} from '../../src/background/batch/quota'
import { isUsageExhausted } from '../../src/sites/maps/usage/types'
import type { MapsUsageSnapshot } from '../../src/sites/maps/usage/types'
import { MapsUsageService } from '../../src/sites/maps/usage/usageService'
import type { MapsUsageReportResponse } from '../../src/sites/maps/usage/usageApi'
import { getRunLimit } from '../../src/sites/maps/usage/usageClient'
import { httpClient } from '@/core/api'
import { API, STORAGE_KEYS } from '@/core/api/config'

vi.mock('../../src/sites/maps/usage/usageApi', () => ({
  fetchMapsUsage: vi.fn(),
  reportMapsUsage: vi.fn()
}))

import { fetchMapsUsage, reportMapsUsage } from '../../src/sites/maps/usage/usageApi'

const mockFetch = vi.mocked(fetchMapsUsage)
const mockReport = vi.mocked(reportMapsUsage)

/** 快照工厂。 */
function snapshot(overrides: Partial<MapsUsageSnapshot> = {}): MapsUsageSnapshot {
  return {
    plan_name: 'Free',
    used: 0,
    total: 1000,
    period: '2026-09',
    exhausted: false,
    run_limits: { search: 10, reviews: 20, photos: 10 },
    ...overrides
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('批量配额前置校验（quota 纯函数）', () => {
  it('关键词任务预估 = 条目数 × 单批搜索上限（包内默认 10）', () => {
    expect(estimateBulkRecords(5, 'keywords', null, 10)).toBe(50)
    expect(estimateBulkRecords(0, 'keywords', null, 10)).toBe(0)
    // 远程调高上限时按生效值预估
    expect(estimateBulkRecords(5, 'keywords', null, 20)).toBe(100)
  })

  it('评论任务预估 = 条目数 × 每店上限（未配用默认 300）', () => {
    expect(estimateBulkRecords(3, 'review-urls', null, 10)).toBe(900)
    expect(estimateBulkRecords(3, 'review-urls', 50, 10)).toBe(150)
  })

  it('checkBulkQuota：预估超剩余拒绝；快照缺失（null）fail-open 放行', () => {
    expect(checkBulkQuota({ used: 995, total: 1000 }, 50)).toEqual({
      estimate: 50,
      remaining: 5,
      exceeded: true
    })
    expect(checkBulkQuota({ used: 995, total: 1000 }, 5).exceeded).toBe(false)
    // exhausted（remaining<=0）：任意正预估都拒绝
    expect(checkBulkQuota({ used: 1000, total: 1000 }, 1).exceeded).toBe(true)
    // usage 不可得：放行
    expect(checkBulkQuota(null, 100_000).exceeded).toBe(false)
    expect(isBulkQuotaExceeded(11, 10)).toBe(true)
  })
})

describe('usage 门控判定（isUsageExhausted）', () => {
  it('exhausted=true 判定耗尽；快照缺失放行', () => {
    expect(isUsageExhausted(snapshot({ exhausted: true }))).toBe(true)
    expect(isUsageExhausted(snapshot({ exhausted: false }))).toBe(false)
    expect(isUsageExhausted(null)).toBe(false)
  })

  it('本次上限消费服务端权益并受月余额约束，批量评论目标独立于单店上限', () => {
    const paid = snapshot({
      total: 100_000,
      run_limits: { search: 99999, reviews: 250, photos: 100 }
    })
    expect(getRunLimit(paid, 'search')).toBe(99999)
    expect(getRunLimit(paid, 'reviews')).toBe(250)
    expect(getRunLimit(paid, 'photos')).toBe(100)
    expect(getRunLimit(paid, 'reviews', 300)).toBe(300)
    const lowBalance = { ...paid, used: 99_997 }
    expect(getRunLimit(lowBalance, 'search')).toBe(3)
    expect(getRunLimit(lowBalance, 'reviews', 300)).toBe(3)
    expect(getRunLimit({ ...paid, used: 100_001, exhausted: true }, 'photos')).toBe(0)
    expect(getRunLimit(null, 'search')).toBe(10)
  })
})

describe('usage HTTP 权益边界', () => {
  it('查询与上报经现有拦截器携带登录 token，无 token 时仍走匿名设备路径', async () => {
    const api = await vi.importActual<typeof import('../../src/sites/maps/usage/usageApi')>(
      '../../src/sites/maps/usage/usageApi'
    )
    const current = snapshot({
      total: 100_000,
      run_limits: { search: 99999, reviews: 250, photos: 100 }
    })
    const fetch = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(Response.json({ code: 10000, data: current, msg: '' }))
      .mockResolvedValueOnce(Response.json({ code: 10000, data: { ...current, deducted: true }, msg: '' }))
      .mockResolvedValueOnce(Response.json({ code: 10000, data: snapshot(), msg: '' }))
    const previousFetch = globalThis.fetch
    await chrome.storage.local.set({
      [STORAGE_KEYS.DEVICE_ID]: 'maps-usage-device',
      [STORAGE_KEYS.ACCESS_TOKEN]: 'maps-usage-access'
    })
    vi.stubGlobal('fetch', fetch)
    try {
      expect((await api.fetchMapsUsage()).run_limits.search).toBe(99999)
      await api.reportMapsUsage(15, 'request-1')
      for (const call of fetch.mock.calls) {
        expect(new Headers(call[1]?.headers).get('Authorization')).toBe('Bearer maps-usage-access')
      }
      expect(fetch).toHaveBeenCalledTimes(2)
      await chrome.storage.local.remove(STORAGE_KEYS.ACCESS_TOKEN)
      expect((await api.fetchMapsUsage()).run_limits.search).toBe(10)
      const anonymousHeaders = new Headers(fetch.mock.calls[2]?.[1]?.headers)
      expect(anonymousHeaders.has('Authorization')).toBe(false)
      expect(anonymousHeaders.get('X-Device-Id')).toBe('maps-usage-device')
    } finally {
      vi.stubGlobal('fetch', previousFetch)
      await chrome.storage.local.remove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.DEVICE_ID])
    }
  })

  it('查询与上报都验证完整权益，拒绝缺失或无效上限', async () => {
    const api = await vi.importActual<typeof import('../../src/sites/maps/usage/usageApi')>(
      '../../src/sites/maps/usage/usageApi'
    )
    const current = snapshot({ run_limits: { search: 99999, reviews: 2500, photos: 1000 } })
    const get = vi.spyOn(httpClient, 'get')
      .mockResolvedValueOnce(current)
      .mockResolvedValueOnce({ used: 0, total: 1000, period: '2026-09', exhausted: false })
    const post = vi.spyOn(httpClient, 'post')
      .mockResolvedValueOnce({ ...current, deducted: true })
      .mockResolvedValueOnce({ ...current, run_limits: { search: 0, reviews: 20, photos: 10 }, deducted: true })
    try {
      expect(await api.fetchMapsUsage()).toEqual(current)
      expect(await api.reportMapsUsage(15, 'request-1')).toEqual({ ...current, deducted: true })
      expect(post).toHaveBeenNthCalledWith(
        1,
        API.ENDPOINTS.MAPS_USAGE_REPORT,
        { records: 15, request_id: 'request-1' },
        { skipErrorToast: true }
      )
      await expect(api.fetchMapsUsage()).rejects.toThrow('GET /maps/usage')
      await expect(api.reportMapsUsage(15, 'request-2')).rejects.toThrow('POST /maps/usage/report')
    } finally {
      get.mockRestore()
      post.mockRestore()
    }
  })
})

describe('MapsUsageService（background 配额服务）', () => {
  it('首次拉取后 60s 内走缓存，force 跳过缓存现拉', async () => {
    mockFetch.mockResolvedValueOnce(snapshot({ used: 10 }))
    mockFetch.mockResolvedValueOnce(snapshot({ used: 20 }))

    const service = new MapsUsageService()
    const first = await service.getSnapshot(false)
    const cached = await service.getSnapshot(false)
    const forced = await service.getSnapshot(true)

    expect(first?.used).toBe(10)
    expect(cached?.used).toBe(10)
    expect(forced?.used).toBe(20)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    service.destroy()
  })

  it('拉取失败返回缓存旧快照，无缓存返回 null（fail-open 语义）', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'))

    const service = new MapsUsageService()
    expect(await service.getSnapshot(false)).toBeNull()

    // 成功一次后再次失败：回退旧快照
    mockFetch.mockResolvedValueOnce(snapshot({ used: 30 }))
    expect((await service.getSnapshot(true))?.used).toBe(30)
    mockFetch.mockRejectedValueOnce(new Error('network down'))
    expect((await service.getSnapshot(true))?.used).toBe(30)
    service.destroy()
  })

  it('完成上报更新快照并回传 deducted；上报失败仅记录不抛出', async () => {
    const reported: MapsUsageReportResponse = {
      plan_name: 'Pro',
      used: 20,
      total: 1000,
      period: '2026-09',
      exhausted: false,
      run_limits: { search: 99999, reviews: 250, photos: 100 },
      deducted: true
    }
    mockFetch.mockResolvedValue(snapshot({ used: 0 }))
    mockReport.mockResolvedValueOnce(reported)
    mockReport.mockRejectedValueOnce(new Error('report failed'))

    const service = new MapsUsageService()
    service.setup()
    await service.getSnapshot(false)
    // 经上报通道触发：deducted=true 更新快照，失败路径静默
    await service.handleReport({
      records: 20,
      requestId: 'req-1',
      source: 'search',
      pageUrl: 'https://www.google.com/maps'
    })
    expect(mockReport).toHaveBeenCalledWith(20, 'req-1')
    // 上报成功会刷新缓存快照（used=20），无需再打网络
    const updated = await service.getSnapshot(false)
    expect(updated?.used).toBe(20)
    expect(updated?.run_limits).toEqual(reported.run_limits)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    await expect(
      service.handleReport({
        records: 30,
        requestId: 'req-2',
        source: 'search',
        pageUrl: 'https://www.google.com/maps'
      })
    ).resolves.toBeUndefined()
    service.destroy()
  })
})
