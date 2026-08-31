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

vi.mock('../../src/sites/maps/usage/usageApi', () => ({
  fetchMapsUsage: vi.fn(),
  reportMapsUsage: vi.fn()
}))

import { fetchMapsUsage, reportMapsUsage } from '../../src/sites/maps/usage/usageApi'

const mockFetch = vi.mocked(fetchMapsUsage)
const mockReport = vi.mocked(reportMapsUsage)

/** 快照工厂。 */
function snapshot(overrides: Partial<MapsUsageSnapshot> = {}): MapsUsageSnapshot {
  return { used: 0, total: 1000, period: '2026-09', exhausted: false, ...overrides }
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
      used: 20,
      total: 1000,
      period: '2026-09',
      exhausted: false,
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
    expect((await service.getSnapshot(false))?.used).toBe(20)
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
