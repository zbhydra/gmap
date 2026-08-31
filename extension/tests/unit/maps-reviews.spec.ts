/**
 * 评论解析器与采集控制器单元测试（013 A2）。
 *
 * 诚实标注：评论 RPC 响应没有实录黄金样本（scratch 只 archived 了搜索
 * 样本），本 spec 的响应 fixture 按 03 号协议文档 §3.2 的下标结构手工
 * 构造（构造样本，非实录），用于验证解析/翻页/截断逻辑；实录下标校准
 * 走远程配置覆盖。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import type { JsonValue } from '@/core/rpc/types'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { getMapsConfig, resetMapsConfigForTests } from '@/sites/maps/config/loader'
import { parseReviewsRpcResponse } from '@/sites/maps/content/parser/reviewsParser'
import {
  ReviewsScraper,
  REVIEWS_PANEL_HOST_ID
} from '@/sites/maps/content/reviews/reviewsScraper'
import {
  buildReviewsCsv,
  buildReviewsExport,
  buildReviewsExportFilename,
  REVIEWS_CSV_COLUMNS
} from '@/sites/maps/content/export/reviewsCsv'

/** 构造评论响应（构造样本，非实录）：split('\n')[2] 为 JSON 根数组。 */
function buildReviewsResponse(reviews: JsonValue[], token: string | null): string {
  const d: JsonValue[] = []
  d[1] = []
  // 列表 d[1][10][2]、翻页 token d[1][10][6]（03 逆向 §3.2 txtToJson）
  ;(d[1] as JsonValue[])[10] = [null, null, reviews, null, null, null, token]
  const json = JSON.stringify(d)
  return [")]}'", String(json.length), json].join('\n')
}

/** 构造单条评论（下标按 03 逆向 §3.2；构造样本，非实录）。 */
function makeReview(index: number): JsonValue[] {
  const review: JsonValue[] = []
  review[1] = 4
  review[2] = ['3 weeks ago', 'en', 1724419200000]
  review[3] = [`Alice ${index}`, 'https://lh3.example/avatar.jpg', 'https://maps.example/contrib/1']
  review[4] = [null, 'Aug 1, 2026', 'Thanks for visiting!']
  review[5] = `review_${index}`
  review[11] = index
  review[12] = 'https://search.google.com/local/reviews?placeid=x'
  review[14] = [['https://lh3.example/p/AB=w203-h152'], ['https://lh3.example/p/CD']]
  review[27] = 'Great coffee, cozy place.'
  return review
}

/** 与真实 schema 相同的默认配置（JSON 行为 2 → 第三行）。 */
function defaultSchema(): typeof DEFAULT_MAPS_CONFIG.parseSchema {
  return DEFAULT_MAPS_CONFIG.parseSchema
}

beforeEach(() => {
  resetMapsConfigForTests()
})

describe('评论 txtToJson 解析（构造样本，非实录）', () => {
  it('按行 split 第 3 行解析：字段下标、照片统一尺寸、翻页 token', () => {
    const result = parseReviewsRpcResponse(
      buildReviewsResponse([makeReview(0), makeReview(1)], 'next-token-1'),
      defaultSchema(),
      DEFAULT_MAPS_CONFIG.reviewsDom
    )

    expect(result.rows).toHaveLength(2)
    expect(result.nextToken).toBe('next-token-1')
    expect(result.viaFallback).toBe(false)

    const first = result.rows[0]
    expect(first?.rating).toBe('4')
    expect(first?.date).toBe('3 weeks ago')
    expect(first?.author).toBe('Alice 0')
    expect(first?.avatar).toBe('https://lh3.example/avatar.jpg')
    expect(first?.authorUrl).toBe('https://maps.example/contrib/1')
    expect(first?.likes).toBe('0')
    expect(first?.comment).toBe('Great coffee, cozy place.')
    expect(first?.reply).toBe('Thanks for visiting!')
    expect(first?.replyDate).toBe('Aug 1, 2026')
    expect(first?.reviewUrl).toBe('https://search.google.com/local/reviews?placeid=x')
    // 照片 URL 统一补 =w1000（split('=')[0] + 配置尺寸）
    expect(first?.photos).toEqual([
      'https://lh3.example/p/AB=w1000',
      'https://lh3.example/p/CD=w1000'
    ])
  })

  it('无 token 时 nextToken 为 null（到底判定依据）', () => {
    const result = parseReviewsRpcResponse(
      buildReviewsResponse([makeReview(0)], null),
      defaultSchema(),
      DEFAULT_MAPS_CONFIG.reviewsDom
    )
    expect(result.nextToken).toBeNull()
  })

  it('响应第 3 行缺失/非 JSON 时抛错（失败必须可见）', () => {
    expect(() =>
      parseReviewsRpcResponse('only-one-line', defaultSchema(), DEFAULT_MAPS_CONFIG.reviewsDom)
    ).toThrow(/无法解析评论列表/)
    expect(() =>
      parseReviewsRpcResponse(
        [")]}'", '5', 'not-json'].join('\n'),
        defaultSchema(),
        DEFAULT_MAPS_CONFIG.reviewsDom
      )
    ).toThrow(/JSON 解析失败/)
  })
})

describe('评论 HTML 回退解析（默认关，远程配置开关治理）', () => {
  const html = `<!doctype html><html><body>
    <div class="gws-localreviews__google-review">
      <div class="gws-localreviews__google-review__author">Bob</div>
      <span role="img" aria-label="5 stars"></span>
      <div class="review-full-text">Solid espresso.</div>
      <div data-orc="lororc">Reply from owner</div>
    </div>
    <div data-next-page-token="html-token-9"></div>
  </body></html>`

  it('开关打开时走 DOM 回退并解析出行与 token', () => {
    const schema = { ...defaultSchema(), reviewsHtmlFallbackEnabled: true }
    const result = parseReviewsRpcResponse(html, schema, DEFAULT_MAPS_CONFIG.reviewsDom)

    expect(result.viaFallback).toBe(true)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]?.author).toBe('Bob')
    expect(result.rows[0]?.rating).toBe('5')
    expect(result.rows[0]?.comment).toBe('Solid espresso.')
    expect(result.rows[0]?.reply).toBe('Reply from owner')
    expect(result.nextToken).toBe('html-token-9')
  })

  it('开关关闭（默认）时同样本按主解析处理并抛错', () => {
    expect(() =>
      parseReviewsRpcResponse(html, defaultSchema(), DEFAULT_MAPS_CONFIG.reviewsDom)
    ).toThrow()
  })
})

describe('评论 11 列 CSV 导出', () => {
  it('列名/列序符合 A5 评论字段字典，文件名按 Reviews 规则', () => {
    const result = parseReviewsRpcResponse(
      buildReviewsResponse([makeReview(0)], null),
      defaultSchema(),
      DEFAULT_MAPS_CONFIG.reviewsDom
    )
    const rows = result.rows

    expect(REVIEWS_CSV_COLUMNS).toEqual([
      'Author',
      'Review Text',
      'Review Rating',
      'Date',
      'Photos',
      'Likes',
      'Owner Answer',
      'Owner Answer Date',
      'Author Profile',
      'Author Image',
      'Review URL'
    ])
    // 首个数据行含作者与统一尺寸后的照片 URL
    const csv = buildReviewsCsv(rows)
    const firstDataRow = csv.split('\r\n')[1] ?? ''
    expect(firstDataRow).toContain('Alice 0')
    expect(firstDataRow).toContain('https://lh3.example/p/AB=w1000')

    const filename = buildReviewsExportFilename(
      20,
      'Gold coffee - Google Search',
      new Date(2026, 7, 30),
      'csv'
    )
    expect(filename).toBe('MapsGrab-Extractor-Reviews-Gold coffee - Google Search-20-2026-08-30.csv')
  })

  it('json 导出（用户设置格式）：键驼峰化、照片换行保留、扩展名随格式', () => {
    const { rows } = parseReviewsRpcResponse(
      buildReviewsResponse([makeReview(0), makeReview(1)], null),
      defaultSchema(),
      DEFAULT_MAPS_CONFIG.reviewsDom
    )

    const artifact = buildReviewsExport(rows, 'Gold coffee', new Date(2026, 7, 30), 'json')
    expect(artifact.filename).toBe('MapsGrab-Extractor-Reviews-Gold coffee-2-2026-08-30.json')
    expect(artifact.mime).toBe('application/json')
    const records = JSON.parse(artifact.content as string) as Array<Record<string, unknown>>
    expect(Object.keys(records[0])).toEqual([
      'author',
      'reviewText',
      'reviewRating',
      'date',
      'photos',
      'likes',
      'ownerAnswer',
      'ownerAnswerDate',
      'authorProfile',
      'authorImage',
      'reviewURL'
    ])
    // 照片列多条 URL 以换行连接（与 CSV 单元格同源）
    expect(String(records[0].photos)).toContain('https://lh3.example/p/AB=w1000')
    expect(String(records[0].author)).toBe('Alice 0')
  })
})

describe('评论采集控制器：翻页/截断/终止', () => {
  function buildScraper(emit: ReturnType<typeof vi.fn>): ReviewsScraper {
    return new ReviewsScraper('0xa0acdb1716592b4d', { emit } as never as ChromeEventEmitter<ExtensionEvents>, {
      onStateChanged: () => undefined,
      onError: () => undefined
    })
  }

  /** 构造 fetch mock：按调用序返回页面响应，记录 URL。 */
  function stubFetch(pages: Array<{ reviews: JsonValue[]; token: string | null }>): {
    urls: string[]
  } {
    const urls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        urls.push(String(input))
        const page = pages[urls.length - 1]
        if (!page) {
          throw new Error('测试用例未预期的额外请求')
        }
        return { ok: true, status: 200, text: async () => buildReviewsResponse(page.reviews, page.token) }
      })
    )
    return { urls }
  }

  it('采集开始即上报 scrape_reviews_content 埋点', async () => {
    const emit = vi.fn()
    stubFetch([{ reviews: [makeReview(0)], token: null }])
    await buildScraper(emit).start()

    const events = emit.mock.calls.map(call => String(call[0]))
    expect(events).toContain('mapsScrapeReviewsContentMark')
  })

  it('有 token 翻页；不足一页（<pageSize）提前完成', async () => {
    getMapsConfig().scrape.reviewsPageDelayMs = 0
    const page1 = Array.from({ length: 10 }, (_, i) => makeReview(i))
    const page2 = Array.from({ length: 4 }, (_, i) => makeReview(i))
    const { urls } = stubFetch([
      { reviews: page1, token: 't1' },
      { reviews: page2, token: null }
    ])
    const scraper = buildScraper(vi.fn())

    await scraper.start()

    expect(urls).toHaveLength(2)
    expect(urls[0]).toContain('/httpservice/web/PrivateLocalSearchUiDataService/GetLocalBoqProxy')
    expect(urls[0]).toContain('opi=89978449')
    expect(urls[0]).toContain(encodeURIComponent('0xa0acdb1716592b4d'))
    expect(urls[1]).toContain(encodeURIComponent('t1'))
    expect(scraper.getCount()).toBe(14)
    expect(scraper.getStatus()).toBe('complete')
  })

  it('达到上限截断并停止翻页（配置驱动，免费档默认 20）', async () => {
    getMapsConfig().scrape.reviewsPageDelayMs = 0
    const page = Array.from({ length: 10 }, (_, i) => makeReview(i))
    const { urls } = stubFetch([
      { reviews: page, token: 't1' },
      { reviews: page, token: 't2' },
      { reviews: page, token: 't3' }
    ])
    const scraper = buildScraper(vi.fn())

    await scraper.start()

    // 20 条达到上限即截断完成，不再请求第 3 页
    expect(scraper.getCount()).toBe(20)
    expect(scraper.getStatus()).toBe('complete')
    expect(urls).toHaveLength(2)
  })

  it('fetch 失败保留已采结果并进入完成态（失败可见）', async () => {
    getMapsConfig().scrape.reviewsPageDelayMs = 0
    const errors: string[] = []
    const scraper = new ReviewsScraper('0xa0acdb1716592b4d', { emit: vi.fn() } as never as ChromeEventEmitter<ExtensionEvents>, {
      onStateChanged: () => undefined,
      onError: message => errors.push(message)
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })))

    await scraper.start()

    expect(scraper.getCount()).toBe(0)
    expect(scraper.getStatus()).toBe('complete')
    expect(errors[0]).toContain('500')
  })
})

describe('评论页兜底判定', () => {
  it('标题含 500 时 0 条完成（依赖 ReviewsScraper 的 DOM 判定）', async () => {
    document.title = '500 Internal Server Error'
    try {
      const errors: string[] = []
      const scraper = new ReviewsScraper('0xa0acdb1716592b4d', { emit: vi.fn() } as never as ChromeEventEmitter<ExtensionEvents>, {
        onStateChanged: () => undefined,
        onError: message => errors.push(message)
      })
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      await scraper.start()

      // 兜底命中：不发起任何 RPC，0 条完成并给出可见原因
      expect(fetchMock).not.toHaveBeenCalled()
      expect(scraper.getCount()).toBe(0)
      expect(scraper.getStatus()).toBe('complete')
      expect(errors[0]).toContain('500')
    } finally {
      document.title = ''
    }
  })
})

describe('评论页面板宿主 id', () => {
  it('与照片页面板 id 区分（挂载防重）', () => {
    expect(REVIEWS_PANEL_HOST_ID).not.toContain('photos')
  })
})
