/**
 * Maps 搜索采集控制器单元测试。
 *
 * 覆盖：免费行数截断、状态机步进（extracting → complete，暂停态丢弃响应）、
 * 重复批去重、search 埋点单发、代际隔离防双循环。
 * 导出引擎（36 列 CSV/JSON/门控/命名/去重）见 maps-export.spec.ts。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { resetMapsConfigForTests, getMapsConfig } from '@/sites/maps/config/loader'
import {
  MapsSearchScraper,
  type MapsScraperStatus
} from '@/sites/maps/content/scraper/searchScraper'
import type { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import type { JsonValue } from '@/core/rpc/types'

describe('MapsSearchScraper 状态机与截断', () => {
  const statusHistory: MapsScraperStatus[] = []

  function buildScraper(): MapsSearchScraper {
    statusHistory.length = 0
    const markEmitter = {
      emit: vi.fn()
    } as never as ChromeEventEmitter<ExtensionEvents>
    return new MapsSearchScraper(markEmitter, {
      onStateChanged: status => {
        statusHistory.push(status)
      },
      onError: () => undefined
    })
  }

  /** 构造格式 B 合成响应：data[1] 为 V2 列表，data[0] 为关键词段（JSON.stringify 保证 d 字段转义）。 */
  function buildResponse(names: string[], keyword = 'coffee'): string {
    const list = names.map(name => {
      const detail: JsonValue[] = []
      detail[10] = `0xa:${name.length.toString(16)}`
      detail[11] = name
      detail[78] = `place_${name}`
      return [`k_${name}`, detail]
    })
    const root: JsonValue[] = new Array(9)
    root[0] = [keyword]
    root[1] = list
    const envelope = JSON.stringify({ c: 0, d: `)]}'\n${JSON.stringify(root)}` })
    return `${envelope}/*""*/`
  }

  beforeEach(() => {
    resetMapsConfigForTests()
  })

  it('结果 <2 条直接完成；暂停/完成态丢弃响应', () => {
    const scraper = buildScraper()
    scraper.start()
    expect(scraper.getStatus()).toBe('extracting')

    scraper.handleRpcResponse(buildResponse(['Only One']))
    expect(scraper.getStatus()).toBe('complete')
    expect(scraper.getCount()).toBe(1)
    expect(scraper.getKeyword()).toBe('coffee')

    scraper.handleRpcResponse(buildResponse(['A', 'B', 'C']))
    expect(scraper.getCount()).toBe(1)

    scraper.reset()
    expect(scraper.getStatus()).toBe('idle')
    expect(scraper.getCount()).toBe(0)

    scraper.handleRpcResponse(buildResponse(['X', 'Y']))
    expect(scraper.getStatus()).toBe('idle')
  })

  it('达到免费行数上限时截断并完成（配置驱动）', () => {
    getMapsConfig().scrape.freeExportRowLimit = 3
    const scraper = buildScraper()
    scraper.start()

    scraper.handleRpcResponse(buildResponse(['A', 'B', 'C', 'D', 'E']))
    expect(scraper.getStatus()).toBe('complete')
    expect(scraper.getCount()).toBe(3)
    expect(scraper.getRows().map(row => row.name)).toEqual(['A', 'B', 'C'])
  })

  it('重复批去重后计数不涨；search 埋点只发一次', () => {
    const emit = vi.fn()
    const markEmitter = { emit } as never as ChromeEventEmitter<ExtensionEvents>
    const scraper = new MapsSearchScraper(markEmitter, {
      onStateChanged: () => undefined,
      onError: () => undefined
    })
    scraper.start()

    scraper.handleRpcResponse(buildResponse(['A', 'B']))
    scraper.handleRpcResponse(buildResponse(['A', 'B', 'C']))
    expect(scraper.getCount()).toBe(3)
    expect(emit).toHaveBeenCalledTimes(1)
    // bulk 标志（feat.md 埋点表）：单测环境 URL 无批量参数 → false
    expect(emit).toHaveBeenCalledWith('mapsSearchMark', {
      markMsg: 'kw=coffee, bulk=false',
      pageUrl: location.href
    })
  })

  it('解析失败回调 onError 且不改变状态（失败可见）', () => {
    // 预置搜索按钮，避免 triggerSearchReplay 失败产生第二条错误
    document.body.innerHTML = '<div role="main"><div role="search"><button aria-label="Search"></button></div></div>'
    const errors: string[] = []
    const markEmitter = {
      emit: vi.fn()
    } as never as ChromeEventEmitter<ExtensionEvents>
    const scraper = new MapsSearchScraper(markEmitter, {
      onStateChanged: () => undefined,
      onError: message => errors.push(message)
    })
    scraper.start()

    scraper.handleRpcResponse('not-a-maps-response')
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('[MapsParser]')
    expect(scraper.getStatus()).toBe('extracting')
    document.body.innerHTML = ''
  })

  it('默认契约中免费上限为 10（U7 配额门控的前置常量）', () => {
    expect(DEFAULT_MAPS_CONFIG.scrape.freeExportRowLimit).toBe(10)
  })

  it('代际隔离：start/resume 递增 loopGeneration，卡在检查点的旧循环被取消（F2）', async () => {
    // 直接断言代际递增。重入窗口取「pause 后快速 start」：旧循环此刻仍卡在
    // 延时分片检查点，若不递增代际会在恢复后复活（start 在 extracting 中
    // 是幂等 no-op，故重入须经 pause）。
    const scraper = buildScraper()
    const initial = scraper.getLoopGenerationForTests()
    scraper.start()
    const afterStart = scraper.getLoopGenerationForTests()
    scraper.pause()
    scraper.start()
    const afterRestart = scraper.getLoopGenerationForTests()
    scraper.pause()
    scraper.resume()
    const afterResume = scraper.getLoopGenerationForTests()
    expect(afterStart).toBe(initial + 1)
    expect(afterRestart).toBe(afterStart + 1)
    expect(afterResume).toBe(afterRestart + 1)

    // 行为兜底：推进 fake timers，仅最新代循环存活并走 noGrowth 兜底完成，
    // 全程恰好一次 complete（若旧代复活会提前触发多次终态回写）
    vi.useFakeTimers()
    try {
      statusHistory.length = 0
      const restarted = buildScraper()
      restarted.start()
      restarted.pause()
      restarted.start()
      await vi.advanceTimersByTimeAsync(30_000)
      expect(restarted.getStatus()).toBe('complete')
      expect(statusHistory.filter(status => status === 'complete')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
