/**
 * 批量模式 content 侧单元测试（013 A6，U5）。
 *
 * 覆盖面：
 * - 批量工作页 URL 参数解析（gme_bulk 契约：task/item 匹配键 + 评论上限）；
 * - ReviewsScraper 按开始入口传入的本次目标截断完成。
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import type { JsonValue } from '@/core/rpc/types'
import { getMapsConfig, resetMapsConfigForTests } from '@/sites/maps/config/loader'
import {
  readBulkReviewsMax,
  readBulkWorkParams,
  registerBulkWorkIdentity
} from '@/sites/maps/content/bulkAuto'
import { MapsSearchScraper } from '@/sites/maps/content/scraper/searchScraper'
import {
  isFeedEndReached,
  isFeedEndVisible
} from '@/sites/maps/content/scraper/feedScroll'
import { bootReviewsPage, ReviewsScraper } from '@/sites/maps/content/reviews/reviewsScraper'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { checkBulkWorkOwner } from '@/sites/maps/content/bulkAuto'
import { bootstrapMapsContent } from '@/sites/maps/content/bootstrap'
import { MapsPanel, PANEL_HOST_ID } from '@/sites/maps/content/panel/mapsPanel'
import { ExtractionPanel } from '@/sites/maps/content/panel/extractionPanel'
import * as configLoader from '@/sites/maps/config/loader'
import * as userSettings from '@/sites/maps/settings/userSettings'
import * as usageClient from '@/sites/maps/usage/usageClient'
import * as download from '@/sites/maps/content/export/download'
import { MAPS_RPC_RESPONSE_EVENT } from '@/sites/maps/content/rpcEvents'
import { logger } from '@/core/utils/logger'

beforeEach(() => {
  resetMapsConfigForTests()
})

describe('批量工作页初始身份回报', () => {
  it('清参和快照对象变化后仍同步回复注册时的 task/item', () => {
    const work = { taskId: 'initial-task', itemIndex: 2 }
    const remove = registerBulkWorkIdentity(work)
    const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)![0]
    const respond = vi.fn()
    const initialUrl = location.href
    try {
      location.href = 'https://www.google.com/maps/search/tea?entry=ttu'
      work.taskId = 'changed'
      work.itemIndex = 3
      listener({ __bulkWorkIdentity__: true }, { id: chrome.runtime.id }, respond)
      expect(respond).toHaveBeenCalledWith({ taskId: 'initial-task', itemIndex: 2 })
    } finally {
      location.href = initialUrl
      remove?.()
    }
    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(listener)
  })

  it('忽略伪造 sender、子 frame 与其他消息', () => {
    const remove = registerBulkWorkIdentity({ taskId: 't1', itemIndex: 0 })
    const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)![0]
    const respond = vi.fn()
    listener({ __bulkWorkIdentity__: true }, { id: 'other-extension' }, respond)
    listener({ __bulkWorkIdentity__: true }, {}, respond)
    listener({ __bulkWorkIdentity__: true }, { id: chrome.runtime.id, frameId: 1 }, respond)
    listener({ __bulkWorkIdentity__: false }, { id: chrome.runtime.id }, respond)
    listener({ __event__: true, event: 'other' }, { id: chrome.runtime.id }, respond)
    expect(respond).not.toHaveBeenCalled()
    remove?.()
  })

  it('普通页与子 frame 不注册身份 listener', () => {
    const add = vi.mocked(chrome.runtime.onMessage.addListener)
    add.mockClear()
    expect(registerBulkWorkIdentity(null)).toBeUndefined()
    const originalWindow = window
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    try {
      vi.stubGlobal('window', frame.contentWindow)
      expect(registerBulkWorkIdentity({ taskId: 't1', itemIndex: 0 })).toBeUndefined()
    } finally {
      vi.stubGlobal('window', originalWindow)
      frame.remove()
    }
    expect(add).not.toHaveBeenCalled()
  })
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
    const params = readBulkWorkParams(parse('gme_bulk=1&gme_bulk_task=t1&gme_bulk_item=3&gme_bulk_total=4'))
    expect(params).toEqual({ taskId: 't1', itemIndex: 3, itemCount: 4 })
  })

  it('非批量页 / 参数残缺 / 下标非法 → null（按普通页面处理）', () => {
    expect(readBulkWorkParams(parse('gme_bulk_task=t1&gme_bulk_item=3&gme_bulk_total=4'))).toBeNull()
    expect(readBulkWorkParams(parse('gme_bulk=0&gme_bulk_task=t1&gme_bulk_item=3&gme_bulk_total=4'))).toBeNull()
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

it('工作页 owner 复核使用 RPC；拒绝或 RPC 失败都不许可自动采集', async () => {
  const check = vi.spyOn(BackgroundChannel.prototype, 'checkBulkWorkPage')
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(false)
    .mockRejectedValueOnce(new Error('background 不可达'))
  const destroy = vi.spyOn(BackgroundChannel.prototype, 'destroy')
  const work = { taskId: 'task-1', itemIndex: 2 }
  try {
    expect(await checkBulkWorkOwner(work)).toBe(true)
    expect(await checkBulkWorkOwner(work)).toBe(false)
    expect(await checkBulkWorkOwner(work)).toBe(false)
    expect(check).toHaveBeenCalledWith(work)
    expect(destroy).toHaveBeenCalledTimes(3)
  } finally {
    check.mockRestore()
    destroy.mockRestore()
  }
})

describe('工作页自动采集前的 owner 门控', () => {
  const originalUrl = location.href
  const mountSearchPanel = MapsPanel.prototype.mount

  beforeEach(() => {
    vi.spyOn(document.documentElement, 'appendChild').mockImplementation(child => child)
    vi.spyOn(configLoader, 'loadMapsConfig').mockResolvedValue()
    vi.spyOn(userSettings, 'initializeMapsUserSettings').mockResolvedValue()
    vi.spyOn(MapsPanel.prototype, 'mount').mockResolvedValue()
    vi.spyOn(MapsPanel.prototype, 'checkQuota').mockResolvedValue(null)
    vi.spyOn(ExtractionPanel.prototype, 'mount').mockResolvedValue()
    vi.spyOn(usageClient, 'fetchUsageSnapshot').mockResolvedValue(null)
  })

  afterEach(() => {
    location.href = originalUrl
    document.querySelectorAll('script').forEach(script => script.remove())
    vi.restoreAllMocks()
  })

  it.each([true, false])('搜索页清参后仍用初始身份复核；owner=%s 决定是否启动', async allowed => {
    location.href = 'https://www.google.com/maps/search/tea?gme_bulk=1&gme_bulk_task=t1&gme_bulk_item=0&gme_bulk_total=2'
    const owner = vi.spyOn(BackgroundChannel.prototype, 'checkBulkWorkPage').mockResolvedValue(allowed)
    const start = vi.spyOn(MapsSearchScraper.prototype, 'start').mockImplementation(() => undefined)
    const info = vi.spyOn(logger, 'info')
    bootstrapMapsContent()
    history.replaceState(null, '', '/maps/search/tea')
    await vi.waitFor(() => expect(info).toHaveBeenCalledWith('[MapsContent] 采集面板已挂载'))
    expect(owner).toHaveBeenCalledWith({ taskId: 't1', itemIndex: 0 })
    expect(start).toHaveBeenCalledTimes(allowed ? 1 : 0)
  })

  it.each(['search', 'reviews'])('%s 在配置加载挂起前已能回复初始身份', async kind => {
    const path = kind === 'search' ? '/maps/search/tea' : '/maps/place/'
    location.href = `https://www.google.com${path}?gme_fid=0x89c2597ca044ec9b:0xa0acdb1716592b4d&gme_bulk=1&gme_bulk_task=early&gme_bulk_item=0&gme_bulk_total=2`
    let release: () => void = () => undefined
    const config = new Promise<void>(resolve => { release = resolve })
    vi.mocked(configLoader.loadMapsConfig).mockReturnValue(config)
    const owner = vi.spyOn(BackgroundChannel.prototype, 'checkBulkWorkPage').mockResolvedValue(false)
    bootstrapMapsContent()
    const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)![0]
    history.replaceState(null, '', `${path}?entry=ttu`)
    const respond = vi.fn()
    listener({ __bulkWorkIdentity__: true }, { id: chrome.runtime.id }, respond)
    expect(respond).toHaveBeenCalledWith({ taskId: 'early', itemIndex: 0 })
    expect(owner).not.toHaveBeenCalled()
    release()
    await vi.waitFor(() => expect(owner).toHaveBeenCalledWith({ taskId: 'early', itemIndex: 0 }))
  })

  it('评论旧页被 owner 复核拒绝时不发起采集', async () => {
    location.href = 'https://www.google.com/maps/place/?gme_fid=0x89c2597ca044ec9b:0xa0acdb1716592b4d&gme_bulk=1&gme_bulk_task=t1&gme_bulk_item=0&gme_bulk_total=2'
    const owner = vi.spyOn(BackgroundChannel.prototype, 'checkBulkWorkPage').mockResolvedValue(false)
    const start = vi.spyOn(ReviewsScraper.prototype, 'start').mockResolvedValue()
    await bootReviewsPage({ emit: vi.fn() } as never as ChromeEventEmitter<ExtensionEvents>)
    expect(owner).toHaveBeenCalledWith({ taskId: 't1', itemIndex: 0 })
    expect(start).not.toHaveBeenCalled()
  })

  it.each(['search', 'reviews'])('普通 %s 页额度耗尽不发送批量额度事件', async kind => {
    const exhausted = {
      plan_name: 'Free' as const,
      used: 1000,
      total: 1000,
      period: '2026-11',
      exhausted: true,
      run_limits: { search: 10, reviews: 20, photos: 10 }
    }
    vi.mocked(MapsPanel.prototype.checkQuota).mockResolvedValue(exhausted)
    vi.mocked(usageClient.fetchUsageSnapshot).mockResolvedValue(exhausted)
    const emit = vi.spyOn(ChromeEventEmitter.prototype, 'emit')
    const start = vi.spyOn(ReviewsScraper.prototype, 'start').mockResolvedValue()
    const searchStart = vi
      .spyOn(MapsSearchScraper.prototype, 'start')
      .mockImplementation(() => undefined)
    if (kind === 'search') {
      location.href = 'https://www.google.com/maps/search/tea'
      const info = vi.spyOn(logger, 'info')
      const main = document.createElement('div')
      main.setAttribute('role', 'main')
      document.body.appendChild(main)
      let cleanup = (): void => undefined
      vi.mocked(MapsPanel.prototype.mount).mockImplementation(function (this: MapsPanel, ...args) {
        cleanup = () => this.destroy()
        return mountSearchPanel.apply(this, args)
      })
      try {
        bootstrapMapsContent()
        await vi.waitFor(() => expect(info).toHaveBeenCalledWith('[MapsContent] 采集面板已挂载'))
        document
          .getElementById(PANEL_HOST_ID)!
          .shadowRoot!.querySelector<HTMLButtonElement>('[data-primary]')!
          .click()
        await vi.waitFor(() =>
          expect(emit).toHaveBeenCalledWith('mapsUiActionMark', {
            markMsg: 'action=quota_blocked, source=search',
            pageUrl: location.href
          })
        )
      } finally {
        cleanup()
        main.remove()
      }
    } else {
      location.href =
        'https://www.google.com/maps/place/?gme_fid=0x89c2597ca044ec9b:0xa0acdb1716592b4d'
      await bootReviewsPage(new ChromeEventEmitter<ExtensionEvents>())
    }
    expect(start).not.toHaveBeenCalled()
    expect(searchStart).not.toHaveBeenCalled()
    expect(emit.mock.calls.some(([event]) => event === 'mapsBulkQuotaBlocked')).toBe(false)
  })
})

describe('ReviewsScraper：批量每店请求目标', () => {
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

  function buildScraper(): ReviewsScraper {
    const emit = vi.fn()
    return new ReviewsScraper(
      { fid: '0x89c2597ca044ec9b:0xa0acdb1716592b4d', hl: 'en', gl: 'us' },
      { emit } as never as ChromeEventEmitter<ExtensionEvents>,
      { onStateChanged: () => undefined, onError: () => undefined }
    )
  }

  it('本次目标 15：两页 10+10 → 达 15 截断完成', async () => {
    getMapsConfig().scrape.reviewsPageDelayMs = 0
    const page = Array.from({ length: 10 }, (_, i) => makeReview(i))
    const fetcher = stubFetch([
      { reviews: page, token: 't1' },
      { reviews: page, token: null }
    ])

    const scraper = buildScraper()
    await scraper.start(15)

    expect(scraper.getCount()).toBe(15)
    expect(scraper.getStatus()).toBe('complete')
    expect(fetcher.calls()).toBe(2)
  })

  it('传入离线默认目标时按该目标停止', async () => {
    getMapsConfig().scrape.reviewsPageDelayMs = 0
    const page = Array.from({ length: 10 }, (_, i) => makeReview(i))
    const fetcher = stubFetch([
      { reviews: page, token: 't1' },
      { reviews: page, token: null }
    ])

    const scraper = buildScraper()
    await scraper.start(getMapsConfig().scrape.reviewsPageLimit)

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
      { fid: '0x89c2597ca044ec9b:0xa0acdb1716592b4d', hl: 'en', gl: 'us' },
      { emit: vi.fn() } as never as ChromeEventEmitter<ExtensionEvents>,
      { onStateChanged: () => undefined, onError: () => undefined, onProgress }
    )

    await scraper.start(getMapsConfig().scrape.reviewsPageLimit)

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
    scraper.start(getMapsConfig().scrape.freeExportRowLimit)

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

  describe('批量搜索的无增长完成边界', () => {
    const originalUrl = location.href
    const start = MapsSearchScraper.prototype.start
    let scraper: MapsSearchScraper | undefined

    beforeEach(() => {
      vi.useFakeTimers()
      scraper = undefined
      location.href =
        'https://www.google.com/maps/search/coffee?gme_bulk=1&gme_bulk_task=t1&gme_bulk_item=0&gme_bulk_total=2'
      document.body.innerHTML = '<button id="search"></button><div role="feed"></div>'
      const { dom, scrape } = getMapsConfig()
      dom.searchSubmitButton = '#search'
      scrape.scrollIntervalSec = 0
      scrape.scrollAnimMinMs = 0
      scrape.scrollAnimMaxMs = 0
      vi.spyOn(document.documentElement, 'appendChild').mockImplementation(child => child)
      vi.spyOn(configLoader, 'loadMapsConfig').mockResolvedValue()
      vi.spyOn(userSettings, 'initializeMapsUserSettings').mockResolvedValue()
      vi.spyOn(MapsPanel.prototype, 'mount').mockResolvedValue()
      vi.spyOn(MapsPanel.prototype, 'checkQuota').mockResolvedValue(null)
      vi.spyOn(document, 'addEventListener')
      vi.spyOn(MapsPanel.prototype, 'setSearchError')
      vi.spyOn(BackgroundChannel.prototype, 'checkBulkWorkPage').mockResolvedValue(true)
      vi.spyOn(download, 'downloadFile').mockImplementation(() => undefined)
      vi.spyOn(MapsSearchScraper.prototype, 'start').mockImplementation(function (
        this: MapsSearchScraper,
        rowLimit
      ) {
        scraper = this
        start.call(this, rowLimit)
      })
    })

    afterEach(() => {
      scraper?.reset()
      for (const [type, listener] of vi.mocked(document.addEventListener).mock.calls) {
        if (type === MAPS_RPC_RESPONSE_EVENT) document.removeEventListener(type, listener)
      }
      vi.clearAllTimers()
      vi.useRealTimers()
      vi.restoreAllMocks()
      location.href = originalUrl
      document.body.innerHTML = ''
    })

    function dispatchSearchResponse(names: string[]): void {
      document.dispatchEvent(
        new CustomEvent(MAPS_RPC_RESPONSE_EVENT, { detail: { str: buildSearchResponse(names) } })
      )
    }

    async function bootSearchWithRows(names: string[]): Promise<void> {
      bootstrapMapsContent()
      history.replaceState(null, '', '/maps/search/coffee')
      await vi.waitFor(() => expect(scraper).toBeDefined())
      if (names.length > 0) dispatchSearchResponse(names)
    }

    it('初始化和 owner 等待期间的有效响应在开始时各消费一次；已有数据不依赖重放', async () => {
      let configReady = (): void => undefined
      vi.mocked(configLoader.loadMapsConfig).mockReturnValue(
        new Promise<void>(resolve => {
          configReady = resolve
        })
      )
      let ownerReady = (_allowed: boolean): void => undefined
      vi.mocked(BackgroundChannel.prototype.checkBulkWorkPage).mockReturnValue(
        new Promise<boolean>(resolve => {
          ownerReady = resolve
        })
      )
      const handle = vi.spyOn(MapsSearchScraper.prototype, 'handleRpcResponse')
      const click = vi.spyOn(document.querySelector<HTMLElement>('#search')!, 'click')
      const early = buildSearchResponse(['A', 'B'])
      const idle = buildSearchResponse(['C', 'D'])
      const dispatch = (str: string): void => {
        document.dispatchEvent(new CustomEvent(MAPS_RPC_RESPONSE_EVENT, { detail: { str } }))
      }
      bootstrapMapsContent()
      dispatch(early)
      dispatch(early)
      dispatch('不完整的响应')
      configReady()
      await vi.waitFor(() =>
        expect(BackgroundChannel.prototype.checkBulkWorkPage).toHaveBeenCalled()
      )
      dispatch(idle)
      ownerReady(true)
      await vi.waitFor(() => expect(scraper?.getCount()).toBe(4))

      expect(scraper?.getRows().map(row => row.name)).toEqual(['A', 'B', 'C', 'D'])
      expect(
        handle.mock.calls.filter((_, index) => handle.mock.contexts[index] === scraper)
      ).toEqual([[early], [idle]])
      expect(click).not.toHaveBeenCalled()
      expect(MapsPanel.prototype.setSearchError).not.toHaveBeenCalledWith('google')
    })

    it('远程配置的重放按钮延迟出现后只点击一次并消费响应', async () => {
      document.querySelector('#search')!.remove()
      getMapsConfig().dom.searchSubmitButton = '#remote-replay'
      document.querySelector('[role="feed"]')!.innerHTML = '<div role="article">Coffee</div>'
      await bootSearchWithRows([])
      const click = vi.fn(() => {
        document.dispatchEvent(
          new CustomEvent(MAPS_RPC_RESPONSE_EVENT, {
            detail: { str: buildSearchResponse(['A', 'B']) }
          })
        )
      })
      const button = document.createElement('button')
      button.id = 'remote-replay'
      button.addEventListener('click', click)
      await vi.advanceTimersByTimeAsync(500)
      document.body.appendChild(button)
      await vi.advanceTimersByTimeAsync(100)

      expect(click).toHaveBeenCalledTimes(1)
      expect(scraper?.getCount()).toBe(2)
      expect(scraper?.getStatus()).toBe('extracting')
      expect(MapsPanel.prototype.setSearchError).not.toHaveBeenCalledWith('parse')
      expect(MapsPanel.prototype.setSearchError).not.toHaveBeenCalledWith('google')
    })

    it('B2：feed 已有卡片、rows=0 时仍点击一次重放，取得首批响应', async () => {
      document.querySelector('[role="feed"]')!.innerHTML = '<div role="article">Coffee</div>'
      const click = vi
        .spyOn(document.querySelector<HTMLElement>('#search')!, 'click')
        .mockImplementation(() => dispatchSearchResponse(['A', 'B']))

      await bootSearchWithRows([])
      await vi.advanceTimersByTimeAsync(6000)

      expect(click).toHaveBeenCalledTimes(1)
      expect(scraper?.getRows().map(row => row.name)).toEqual(['A', 'B'])
      expect(scraper?.getStatus()).toBe('extracting')
      expect(MapsPanel.prototype.setSearchError).not.toHaveBeenCalledWith('parse')
      expect(MapsPanel.prototype.setSearchError).not.toHaveBeenCalledWith('google')
    })

    it.each([
      ['远程卡片', '<div data-remote-place>Coffee</div>', 'extracting', 'parse'],
      ['旧选择器卡片', '<div role="article">Coffee</div>', 'paused', 'google']
    ])('B3：远程覆盖卡片选择器决定失败出口（%s）', async (_, cards, status, error) => {
      vi.mocked(configLoader.loadMapsConfig).mockRestore()
      vi.spyOn(BackgroundChannel.prototype, 'getMapsConfig').mockResolvedValue({
        dom: { feedCardSelector: '[data-remote-place]' }
      })
      document.querySelector('#search')!.remove()
      const feed = document.querySelector<HTMLElement>('[role="feed"]')!
      Object.defineProperties(feed, {
        scrollHeight: { value: 1000 },
        clientHeight: { value: 500 }
      })
      feed.innerHTML = cards

      await bootSearchWithRows([])
      await vi.advanceTimersByTimeAsync(3100)

      expect(getMapsConfig().dom.feedCardSelector).toBe('[data-remote-place]')
      expect(scraper?.getStatus()).toBe(status)
      expect(MapsPanel.prototype.setSearchError).toHaveBeenCalledWith(error)
      expect(feed.scrollTop).toBe(status === 'extracting' ? 500 : 0)
    })

    it.each([
      ['按钮缺失', '初始'],
      ['点击抛错', '初始'],
      ['响应超 5s', '初始'],
      ['按钮缺失', '等待时'],
      ['点击抛错', '点击时'],
      ['响应超 5s', '等待时']
    ])('feed 有卡片（%s，%s出现）：重放失败仍滚动示错，后续响应正常入库', async (failure, timing) => {
      const feed = document.querySelector<HTMLElement>('[role="feed"]')!
      Object.defineProperties(feed, {
        scrollHeight: { value: 1000 },
        clientHeight: { value: 500 }
      })
      const showCards = (): void => {
        feed.innerHTML =
          failure === '响应超 5s'
            ? '<a href="https://www.google.com/maps/place/Coffee">Coffee</a>'
            : '<div role="article">Coffee</div>'
      }
      const button = document.querySelector<HTMLElement>('#search')!
      const click = vi.spyOn(button, 'click')
      if (failure === '按钮缺失') button.remove()
      else if (failure === '点击抛错') {
        click.mockImplementation(() => {
          if (timing === '点击时') showCards()
          throw new Error('点击失败')
        })
      }
      if (timing === '初始') showCards()
      const emit = vi.spyOn(ChromeEventEmitter.prototype, 'emit')
      await bootSearchWithRows([])
      if (timing === '等待时') {
        await vi.advanceTimersByTimeAsync(500)
        showCards()
        await vi.advanceTimersByTimeAsync(100)
      }
      await vi.advanceTimersByTimeAsync(6000)

      expect(feed.scrollTop).toBe(500)
      expect(scraper?.getStatus()).toBe('extracting')
      expect(scraper?.getCount()).toBe(0)
      expect(MapsPanel.prototype.setSearchError).toHaveBeenCalledWith('parse')
      expect(MapsPanel.prototype.setSearchError).not.toHaveBeenCalledWith('google')
      expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemDone')).toBe(false)
      expect(click).toHaveBeenCalledTimes(failure === '按钮缺失' ? 0 : 1)

      dispatchSearchResponse(['A', 'B'])
      expect(scraper?.getRows().map(row => row.name)).toEqual(['A', 'B'])
      expect(scraper?.getStatus()).toBe('extracting')
      expect(emit.mock.calls.filter(([event]) => event === 'mapsBulkItemProgress')).toHaveLength(1)
      expect(MapsPanel.prototype.setSearchError).toHaveBeenLastCalledWith(null)
    })

    it.each(['无结束提示', '英文结束提示', '中文结束提示'])(
      'feed 有卡片且持续零条（%s）：失败可见，等待 90s 且不回报完成',
      async ending => {
        document.querySelector('#search')!.remove()
        const feed = document.querySelector<HTMLElement>('[role="feed"]')!
        Object.defineProperties(feed, {
          scrollHeight: { value: 1000 },
          clientHeight: { value: 500 }
        })
        feed.scrollTop = 500
        feed.innerHTML = '<div role="article">Coffee</div>'
        if (ending !== '无结束提示') {
          feed.insertAdjacentHTML(
            'beforeend',
            `<div><p><span><span class="HlvSq">${ending === '英文结束提示' ? "You've reached the end of the list." : '没有其他结果了。'}</span></span></p></div>`
          )
        }
        const emit = vi.spyOn(ChromeEventEmitter.prototype, 'emit')
        await bootSearchWithRows([])
        if (ending !== '无结束提示') dispatchSearchResponse([])
        await vi.advanceTimersByTimeAsync(91_000)

        expect(scraper?.getCount()).toBe(0)
        expect(scraper?.getStatus()).toBe('extracting')
        expect(MapsPanel.prototype.setSearchError).toHaveBeenCalledWith('parse')
        expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemDone')).toBe(false)
        expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemProgress')).toBe(false)
        expect(download.downloadFile).not.toHaveBeenCalled()
      }
    )

    it.each([
      ['按钮缺失', '空容器'],
      ['点击抛错', '空容器'],
      ['无响应', '空容器'],
      ['按钮缺失', '容器缺失']
    ])(
      '%s 且 feed 无数据（%s）：暂停报错，超过 90s 仍不回报完成',
      async (failure, feedState) => {
        if (feedState === '容器缺失') {
          document.querySelector('[role="feed"]')!.remove()
          document.body.insertAdjacentHTML('beforeend', '<div role="article">feed 外卡片</div>')
        }
        const button = document.querySelector<HTMLElement>('#search')!
        if (failure === '按钮缺失') button.remove()
        else if (failure === '点击抛错') {
          vi.spyOn(button, 'click').mockImplementation(() => {
            throw new Error('点击失败')
          })
        }
        const emit = vi.spyOn(ChromeEventEmitter.prototype, 'emit')
        await bootSearchWithRows([])
        await vi.advanceTimersByTimeAsync(10_000)

        expect(scraper?.getCount()).toBe(0)
        expect(scraper?.getStatus()).toBe('paused')
        expect(MapsPanel.prototype.setSearchError).toHaveBeenCalledWith('google')
        scraper?.resume()
        await vi.advanceTimersByTimeAsync(91_000)
        expect(scraper?.getStatus()).toBe('paused')
        expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemDone')).toBe(false)
        expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemProgress')).toBe(false)
        expect(download.downloadFile).not.toHaveBeenCalled()
      }
    )

    it('已有两条且未到底：超过无增长轮数仍采集中、不回报完成；到底后才完成', async () => {
      const emit = vi.spyOn(ChromeEventEmitter.prototype, 'emit')
      await bootSearchWithRows(['A', 'B'])
      await vi.advanceTimersByTimeAsync((getMapsConfig().scrape.noGrowthRetryLimit + 2) * 2000)

      expect(scraper?.getCount()).toBe(2)
      expect(scraper?.getStatus()).toBe('extracting')
      expect(emit.mock.calls.filter(([event]) => event === 'mapsBulkItemProgress')).toHaveLength(1)
      expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemDone')).toBe(false)

      const feed = document.querySelector<HTMLElement>('[role="feed"]')!
      Object.defineProperties(feed, {
        scrollHeight: { value: 1000 },
        clientHeight: { value: 500 }
      })
      feed.scrollTop = 500
      feed.innerHTML =
        '<div><p><span><span class="HlvSq">You\'ve reached the end of the list.</span></span></p></div>'
      await vi.advanceTimersByTimeAsync(2000)
      expect(scraper?.getStatus()).toBe('complete')
      expect(emit).toHaveBeenCalledWith('mapsBulkItemDone', {
        taskId: 't1',
        itemIndex: 0,
        collected: 2,
        pageUrl: location.href
      })
    })

    it.each([
      ['中文', '没有其他结果了。', '当前仅展示了 Google 地图的部分信息。', 'HlvSq'],
      [
        '英文',
        "You've reached the end of the list.",
        "You're seeing a limited view of Google Maps.",
        'HlvSq'
      ],
      ['远程选择器', '没有其他结果了。', '当前仅展示了 Google 地图的部分信息。', 'remote-end']
    ])('%s limited view：非末项结束结构须触底才导出，加载中不完成', async (_, text, notice, endClass) => {
      const emit = vi.spyOn(ChromeEventEmitter.prototype, 'emit')
      const feed = document.querySelector<HTMLElement>('[role="feed"]')!
      const { dom } = getMapsConfig()
      if (endClass !== 'HlvSq') {
        dom.feedEndSelector = `p > span > span.${endClass}`
      }
      // 真实中文末页：结束结构出现时尚差 709.5px，最终触底仍有 0.5px 舍入差。
      let scrollTop = 2580.5
      Object.defineProperties(feed, {
        scrollHeight: { value: 3858 },
        clientHeight: { value: 568 },
        scrollTop: { get: () => scrollTop, set: () => undefined }
      })
      const terminal =
        `<div class="m6QErb XiKgde tLjsW X39k4d"><div class="PbZDve"><p class="fontBodyMedium"><span><span class="${endClass}">${text}</span></span></p></div></div>` +
        `<div class="m6QErb XiKgde"><div>${notice}</div></div>`
      feed.innerHTML = terminal
      await bootSearchWithRows(['A', 'B'])
      await vi.advanceTimersByTimeAsync((getMapsConfig().scrape.noGrowthRetryLimit + 2) * 2000)
      expect(isFeedEndVisible(feed, dom.feedEndSelector)).toBe(false)
      expect(scraper?.getStatus()).toBe('extracting')

      scrollTop = 3289.5
      // feed 外的完整结束结构和商家内同名 span 均不得命中。
      document.body.insertAdjacentHTML('beforeend', terminal)
      feed.innerHTML =
        `<div role="article"><span class="HlvSq">${text}</span></div>` +
        '<div><div class="lXJj5c Hk4XGb"></div></div>'
      await vi.advanceTimersByTimeAsync(2000)
      expect(isFeedEndVisible(feed, dom.feedEndSelector)).toBe(false)
      expect(scraper?.getStatus()).toBe('extracting')
      expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemDone')).toBe(false)
      expect(download.downloadFile).not.toHaveBeenCalled()

      feed.innerHTML = terminal
      expect(feed.lastElementChild?.querySelector(dom.feedEndSelector)).toBeNull()
      expect(isFeedEndVisible(feed, dom.feedEndSelector)).toBe(true)
      expect(isFeedEndReached(feed.querySelector(dom.feedEndSelector), dom.feedEndMarker)).toBe(
        text.includes('reached the end')
      )
      await vi.advanceTimersByTimeAsync(2000)
      expect(scraper?.getStatus()).toBe('complete')
      expect(emit).toHaveBeenCalledWith('mapsBulkItemDone', {
        taskId: 't1',
        itemIndex: 0,
        collected: 2,
        pageUrl: location.href
      })
      expect(download.downloadFile).toHaveBeenCalledTimes(1)
      const [content, filename] = vi.mocked(download.downloadFile).mock.calls[0]!
      expect(content).toContain('\nA,')
      expect(content).toContain('\nB,')
      expect(filename).toMatch(/\.csv$/)
    })

    it('普通搜索不消费早到和 idle 响应；开始后即时重放，无增长达限仍完成（N2）', async () => {
      location.href = 'https://www.google.com/maps/search/coffee'
      const handle = vi.spyOn(MapsSearchScraper.prototype, 'handleRpcResponse')
      const info = vi.spyOn(logger, 'info')
      const click = vi.spyOn(document.querySelector<HTMLElement>('#search')!, 'click')
      const emit = vi.spyOn(ChromeEventEmitter.prototype, 'emit')
      bootstrapMapsContent()
      dispatchSearchResponse(['早到 A', '早到 B'])
      await vi.waitFor(() => expect(info).toHaveBeenCalledWith('[MapsContent] 采集面板已挂载'))
      dispatchSearchResponse(['Idle'])
      const ordinaryScraper = handle.mock.contexts.at(-1)!
      if (!(ordinaryScraper instanceof MapsSearchScraper)) throw new Error('普通搜索采集器未捕获')
      expect(ordinaryScraper.getStatus()).toBe('idle')
      ordinaryScraper.start(getMapsConfig().scrape.freeExportRowLimit)
      expect(scraper?.getCount()).toBe(0)
      expect(click).toHaveBeenCalledTimes(1)
      dispatchSearchResponse(['A', 'B'])
      await vi.advanceTimersByTimeAsync((getMapsConfig().scrape.noGrowthRetryLimit + 2) * 2000)

      expect(scraper?.getCount()).toBe(2)
      expect(scraper?.getStatus()).toBe('complete')
      expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemProgress')).toBe(false)
      expect(emit.mock.calls.some(([event]) => event === 'mapsBulkItemDone')).toBe(false)
    })

    it.each([1, 10])('已有 %i 条：不足两条或达到本次上限仍直接完成', async count => {
      if (count === 1) {
        document.querySelector('[role="feed"]')!.innerHTML = '<div role="article">Place 0</div>'
        document.querySelector('#search')!.remove()
      }
      await bootSearchWithRows(Array.from({ length: count }, (_, index) => `Place ${index}`))
      expect(scraper?.getCount()).toBe(count)
      expect(scraper?.getStatus()).toBe('complete')
    })
  })
})
