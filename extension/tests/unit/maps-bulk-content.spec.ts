/**
 * 批量模式 content 侧单元测试（013 A6，U5）。
 *
 * 覆盖面：
 * - 批量工作页 URL 参数解析（gme_bulk 契约：task/item 匹配键 + 评论上限）；
 * - ReviewsScraper 的 maxReviews 覆盖（批量每店上限，默认 300 可配）：
 *   达覆盖上限截断完成，优先于远程配置的 reviewsPageLimit。
 */

import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import type { JsonValue } from '@/core/rpc/types'
import { getMapsConfig, resetMapsConfigForTests } from '@/sites/maps/config/loader'
import {
  readBulkReviewsMax,
  readBulkWorkParams
} from '@/sites/maps/content/bulkAuto'
import { MapsSearchScraper } from '@/sites/maps/content/scraper/searchScraper'
import { ReviewsScraper } from '@/sites/maps/content/reviews/reviewsScraper'

beforeEach(() => {
  resetMapsConfigForTests()
})

/** 构造单条评论（构造样本，与 maps-reviews.spec 同构；多 describe 共用）。 */
function makeReview(index: number): JsonValue[] {
  const review: JsonValue[] = []
  review[1] = 4
  review[2] = ['3 weeks ago', 'en', 1724419200000]
  review[3] = [`Alice ${index}`, 'https://lh3.example/a.jpg', 'https://maps.example/c1']
  review[4] = [null, 'Aug 1, 2026', 'Reply']
  review[5] = `review_${index}`
  review[11] = index
  review[12] = 'https://search.google.com/local/reviews?placeid=x'
  review[14] = [['https://lh3.example/p/AB=w203-h152']]
  review[27] = 'Body'
  return review
}

describe('批量工作页 URL 参数解析', () => {
  function parse(query: string): URL {
    return new URL(`https://www.google.com/maps/search/x/@1,2,3z?${query}`)
  }

  it('完整参数：返回 task/item 匹配键', () => {
    const params = readBulkWorkParams(parse('gme_bulk=1&gme_bulk_task=t1&gme_bulk_item=3'))
    expect(params).toEqual({ taskId: 't1', itemIndex: 3 })
  })

  it('非批量页 / 参数残缺 / 下标非法 → null（按普通页面处理）', () => {
    expect(readBulkWorkParams(parse('gme_bulk_task=t1&gme_bulk_item=3'))).toBeNull()
    expect(readBulkWorkParams(parse('gme_bulk=0&gme_bulk_task=t1&gme_bulk_item=3'))).toBeNull()
    expect(readBulkWorkParams(parse('gme_bulk=1&gme_bulk_item=3'))).toBeNull()
    expect(readBulkWorkParams(parse('gme_bulk=1&gme_bulk_task=t1'))).toBeNull()
    expect(readBulkWorkParams(parse('gme_bulk=1&gme_bulk_task=t1&gme_bulk_item=-1'))).toBeNull()
    expect(readBulkWorkParams(parse('gme_bulk=1&gme_bulk_task=t1&gme_bulk_item=abc'))).toBeNull()
  })

  it('评论每店上限解析：非法值或缺参回 null（回退远程配置）', () => {
    expect(readBulkReviewsMax(parse('gme_bulk=1&gme_bulk_max=300'))).toBe(300)
    expect(readBulkReviewsMax(parse('gme_bulk=1&gme_bulk_max=0'))).toBeNull()
    expect(readBulkReviewsMax(parse('gme_bulk=1&gme_bulk_max=x'))).toBeNull()
    expect(readBulkReviewsMax(parse('gme_bulk=1'))).toBeNull()
    expect(readBulkReviewsMax(parse('gme_bulk_max=300'))).toBeNull()
  })
})

describe('ReviewsScraper：批量每店上限覆盖', () => {
  /** 构造评论响应（构造样本，与 maps-reviews.spec 同构）。 */
  function buildReviewsResponse(reviews: JsonValue[], token: string | null): string {
    const d: JsonValue[] = []
    d[1] = []
    ;(d[1] as JsonValue[])[10] = [null, null, reviews, null, null, null, token]
    const json = JSON.stringify(d)
    return [")]}'", String(json.length), json].join('\n')
  }

  /** 构造 fetch mock：按调用序返回页面响应，记录调用次数。 */
  function stubFetch(pages: Array<{ reviews: JsonValue[]; token: string | null }>): {
    calls: () => number
  } {
    let count = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const page = pages[count]
        count += 1
        if (!page) {
          throw new Error('测试用例未预期的额外请求')
        }
        return { ok: true, status: 200, text: async () => buildReviewsResponse(page.reviews, page.token) }
      })
    )
    return { calls: () => count }
  }

  function buildScraper(maxReviews?: number): ReviewsScraper {
    const emit = vi.fn()
    return new ReviewsScraper(
      '0xa0acdb1716592b4d',
      { emit } as never as ChromeEventEmitter<ExtensionEvents>,
      { onStateChanged: () => undefined, onError: () => undefined },
      maxReviews === undefined ? {} : { maxReviews }
    )
  }

  it('maxReviews=15：两页 10+10 → 达 15 截断完成（优先于远程配置 20）', async () => {
    getMapsConfig().scrape.reviewsPageDelayMs = 0
    const page = Array.from({ length: 10 }, (_, i) => makeReview(i))
    const fetcher = stubFetch([
      { reviews: page, token: 't1' },
      { reviews: page, token: null }
    ])

    const scraper = buildScraper(15)
    await scraper.start()

    expect(scraper.getCount()).toBe(15)
    expect(scraper.getStatus()).toBe('complete')
    expect(fetcher.calls()).toBe(2)
  })

  it('缺省不传 maxReviews：保持远程配置上限（既有行为不回归）', async () => {
    getMapsConfig().scrape.reviewsPageDelayMs = 0
    const page = Array.from({ length: 10 }, (_, i) => makeReview(i))
    const fetcher = stubFetch([
      { reviews: page, token: 't1' },
      { reviews: page, token: null }
    ])

    const scraper = buildScraper()
    await scraper.start()

    expect(scraper.getCount()).toBe(getMapsConfig().scrape.reviewsPageLimit)
    expect(scraper.getStatus()).toBe('complete')
    expect(fetcher.calls()).toBe(2)
  })
})

describe('采集器进展回报（F1：批量卡死时钟重置的内容侧发射）', () => {
  /** 构造格式 B 合法响应（maps-scraper.spec 同构的最小形态）。 */
  function buildSearchResponse(names: string[]): string {
    const list = names.map(name => {
      const detail: JsonValue[] = []
      detail[10] = `0xa:${name.length.toString(16)}`
      detail[11] = name
      detail[78] = `place_${name}`
      return [`k_${name}`, detail]
    })
    const root: JsonValue[] = new Array(9)
    root[0] = ['coffee']
    root[1] = list
    return `${JSON.stringify({ c: 0, d: `)]}'\n${JSON.stringify(root)}` })}/*""*/`
  }

  function buildReviewsResponse(pages: Array<{ count: number; token: string | null }>): {
    calls: () => number
  } {
    let count = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const page = pages[count]
        count += 1
        const d: JsonValue[] = []
        d[1] = []
        ;(d[1] as JsonValue[])[10] = [
          null,
          null,
          Array.from({ length: page?.count ?? 0 }, (_, i) => makeReview(i)),
          null,
          null,
          null,
          page?.token ?? null
        ]
        const json = JSON.stringify(d)
        return { ok: true, status: 200, text: async () => `)]}'\n${String(json.length)}\n${json}` }
      })
    )
    return { calls: () => count }
  }

  it('ReviewsScraper 每页新数据入库触发 onProgress（两页两次；0 新数据不触发）', async () => {
    getMapsConfig().scrape.reviewsPageDelayMs = 0
    const onProgress = vi.fn()
    const fetcher = buildReviewsResponse([{ count: 10, token: 't1' }, { count: 4, token: null }])
    const scraper = new ReviewsScraper(
      '0xa0acdb1716592b4d',
      { emit: vi.fn() } as never as ChromeEventEmitter<ExtensionEvents>,
      { onStateChanged: () => undefined, onError: () => undefined, onProgress },
      {}
    )

    await scraper.start()

    expect(fetcher.calls()).toBe(2)
    expect(onProgress).toHaveBeenCalledTimes(2)
    expect(scraper.getStatus()).toBe('complete')
  })

  it('MapsSearchScraper 每批新数据入库触发 onProgress（去重空批不触发）', () => {
    const onProgress = vi.fn()
    const scraper = new MapsSearchScraper(
      { emit: vi.fn() } as never as ChromeEventEmitter<ExtensionEvents>,
      { onStateChanged: () => undefined, onError: () => undefined, onProgress }
    )
    scraper.start()

    // 批 1：3 条新数据 → 1 次进展
    scraper.handleRpcResponse(buildSearchResponse(['A', 'B', 'C']))
    expect(onProgress).toHaveBeenCalledTimes(1)
    // 批 2：与批 1 完全相同（全部去重）→ 0 新数据 → 不触发
    scraper.handleRpcResponse(buildSearchResponse(['A', 'B', 'C']))
    expect(onProgress).toHaveBeenCalledTimes(1)
    // 批 3：2 条新数据 → 第 2 次进展
    scraper.handleRpcResponse(buildSearchResponse(['A', 'B', 'C', 'D', 'E']))
    expect(onProgress).toHaveBeenCalledTimes(2)
  })
})
