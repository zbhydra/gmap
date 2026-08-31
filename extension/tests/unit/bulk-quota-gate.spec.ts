/**
 * 批量任务配额前置校验单元测试（013 A11，U7：U5 遗留的 createBulkTask /
 * startBulkTask 前置检查）。
 *
 * 覆盖面：预估消耗（关键词条目 × 单批上限）超剩余额度时 createTask 拒绝并
 * 返回 quota-exceeded（不落状态）；额度充足或 usage 不可得（fail-open）时
 * 正常创建。usage 服务与 IndexedDB store 均为模块级 mock，被测对象是
 * controller 的校验接线。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BulkSchedulerController } from '../../src/background/batch/controller'
import { bulkStateStore } from '../../src/background/batch/store'
import type { MapsUsageSnapshot } from '../../src/sites/maps/usage/types'

vi.mock('../../src/sites/maps/usage/usageService', () => ({
  mapsUsageService: { getSnapshot: vi.fn() }
}))

vi.mock('../../src/background/batch/store', async importOriginal => ({
  ...(await importOriginal<object>()),
  bulkStateStore: {
    load: vi.fn(async () => null),
    save: vi.fn(async () => undefined)
  }
}))

import { mapsUsageService } from '../../src/sites/maps/usage/usageService'

const mockGetSnapshot = vi.mocked(mapsUsageService.getSnapshot)

/** 快照工厂。 */
function snapshot(overrides: Partial<MapsUsageSnapshot>): MapsUsageSnapshot {
  return { used: 0, total: 1000, period: '2026-09', exhausted: false, ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(bulkStateStore.load).mockResolvedValue(null)
})

describe('批量前置配额校验（controller 接线）', () => {
  it('预估消耗（3 条关键词 × 上限 10）超剩余额度 20 → 拒绝 quota-exceeded，不落盘', async () => {
    mockGetSnapshot.mockResolvedValueOnce(snapshot({ used: 980, total: 1000, exhausted: false }))

    const controller = new BulkSchedulerController()
    const result = await controller.createTask({
      name: 't',
      type: 'keywords',
      values: ['a', 'b', 'c'],
      reviewsPerStoreLimit: null
    })

    expect(result.ok).toBe(false)
    expect(result.code).toBe('quota-exceeded')
    expect(result.state.tasks).toHaveLength(0)
    expect(bulkStateStore.save).not.toHaveBeenCalled()
  })

  it('额度充足时正常创建（校验不误伤）', async () => {
    mockGetSnapshot.mockResolvedValueOnce(snapshot({ used: 5, total: 1000, exhausted: false }))

    const controller = new BulkSchedulerController()
    const result = await controller.createTask({
      name: 't',
      type: 'keywords',
      values: ['a'],
      reviewsPerStoreLimit: null
    })

    expect(result.ok).toBe(true)
    expect(result.code).toBeNull()
    expect(result.state.tasks).toHaveLength(1)
  })

  it('usage 不可得（null）时 fail-open 放行创建', async () => {
    mockGetSnapshot.mockResolvedValueOnce(null)

    const controller = new BulkSchedulerController()
    const result = await controller.createTask({
      name: 't',
      type: 'keywords',
      values: ['a', 'b'],
      reviewsPerStoreLimit: null
    })

    expect(result.ok).toBe(true)
    expect(result.state.tasks).toHaveLength(1)
  })
})
