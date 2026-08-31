/**
 * Maps 列表模式单元测试（013 A7，U10）。
 *
 * 覆盖：触发标记两种 URL 形态 + 反例 + 远程覆盖、深层页区分子串、容器
 * 选择器分流（聚合/深层/回退/未命中）、列表项过滤首尾、结束判定、步进
 * 滚动、列表会话的行为级滚动终止（无增长兜底 / 末项结束提示 / 逐项点击
 * 推进与 <2 完成判定的形态豁免）。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { resetMapsConfigForTests, getMapsConfig } from '@/sites/maps/config/loader'
import { detectDeepListMode, detectMapsListMode } from '@/sites/maps/content/listMode'
import { parseSearchRpcResponse } from '@/sites/maps/content/parser'
import {
  findListContainer,
  findListItems
} from '@/sites/maps/content/scraper/listScroll'
import { animateScrollBy, isFeedEndReached } from '@/sites/maps/content/scraper/feedScroll'
import {
  MapsSearchScraper,
  type MapsScraperStatus
} from '@/sites/maps/content/scraper/searchScraper'
import type { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import type { JsonValue } from '@/core/rpc/types'

/** 聚合页实测形态（A7 实测表第 1 行）。 */
const AGGREGATED_URL =
  'https://www.google.com/maps/@40.745,-73.978,13z/data=!4m2!10m1!1e1?hl=en'

/** 深层列表页实测形态（A7 实测表第 2 行，带列表 token 段）。 */
const DEEP_URL =
  'https://www.google.com/maps/@40.745,-73.978,13z/data=!4m6!1m2!10m1!1e1!11m2!2sLISTTOKEN!3e1'

/** 同源相对形态：happy-dom 的 history.pushState 不接受跨源 URL，SPA 推栈用。 */
const AGGREGATED_PATH = '/maps/@40.745,-73.978,13z/data=!4m2!10m1!1e1?hl=en'

describe('列表模式触发标记（宽松匹配）', () => {
  beforeEach(() => {
    resetMapsConfigForTests()
  })

  it('两种实测 URL 形态均命中（聚合 4m2 / 深层 4m6!1m2）', () => {
    expect(detectMapsListMode(AGGREGATED_URL)).toBe(true)
    expect(detectMapsListMode(DEEP_URL)).toBe(true)
    // 竞品精确子串在深层页失效的根因：`4m2` 段变为 `4m6!1m2`，仅尾段共有
    expect(AGGREGATED_URL.includes('data=!4m2!10m1!1e1')).toBe(true)
    expect(DEEP_URL.includes('data=!4m2!10m1!1e1')).toBe(false)
  })

  it('反例：普通搜索页 / place 页 / 无 data 页不命中', () => {
    expect(detectMapsListMode('https://www.google.com/maps/search/coffee+in+manhattan')).toBe(false)
    expect(
      detectMapsListMode(
        'https://www.google.com/maps/place/Gold+coffee/@40.7,17z/data=!4m2!3m1!1s0xa:0xb'
      )
    ).toBe(false)
    expect(detectMapsListMode('https://www.google.com/maps/@40.7,13z')).toBe(false)
  })

  it('远程覆盖：dom.listModeUrlMark 可替换触发标记（含空串禁用）', () => {
    const dom = getMapsConfig().dom
    expect(detectMapsListMode(AGGREGATED_URL, dom.listModeUrlMark)).toBe(true)

    dom.listModeUrlMark = '11m2!2s'
    expect(detectMapsListMode(DEEP_URL, dom.listModeUrlMark)).toBe(true)
    expect(detectMapsListMode(AGGREGATED_URL, dom.listModeUrlMark)).toBe(false)

    dom.listModeUrlMark = ''
    expect(detectMapsListMode(DEEP_URL, dom.listModeUrlMark)).toBe(false)
  })

  it('深层区分子串：仅深层形态含列表 token 段', () => {
    expect(detectDeepListMode(DEEP_URL)).toBe(true)
    expect(detectDeepListMode(AGGREGATED_URL)).toBe(false)
    expect(detectDeepListMode(DEEP_URL, '')).toBe(false)
  })
})

describe('列表容器选择与终止判定', () => {
  /** 聚合页同构 DOM：role=main 末子 div 是列表容器，项 = 子 div 过滤首尾。 */
  function mountAggregatedDom(): void {
    document.body.innerHTML = `
      <div role="main">
        <div class="sidebar-top">not a list</div>
        <div id="agg-list">
          <div class="list-header">Saved places</div>
          <div class="list-item">place A</div>
          <div class="list-item">place B</div>
          <div class="list-footer"></div>
        </div>
      </div>`
  }

  /** 深层页漂移形态 DOM：容器外多一层包装（listContainerDeep 假设形态）。 */
  function mountDeepDom(): void {
    document.body.innerHTML = `
      <div role="main">
        <div class="deep-wrapper">
          <div id="deep-list">
            <div class="list-header">Favorite places</div>
            <div class="list-item">place C</div>
            <div class="list-item">place D</div>
            <div class="list-footer"></div>
          </div>
        </div>
      </div>`
  }

  beforeEach(() => {
    resetMapsConfigForTests()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('聚合页 URL → 命中聚合容器；深层页 URL → 命中深层容器', () => {
    mountAggregatedDom()
    const aggregated = findListContainer(AGGREGATED_URL, getMapsConfig().dom)
    expect(aggregated?.id).toBe('agg-list')

    mountDeepDom()
    const deep = findListContainer(DEEP_URL, getMapsConfig().dom)
    expect(deep?.id).toBe('deep-list')
  })

  it('深层页 deep 选择器未命中返回 null（严格按 URL 形态二选一，不相互回退）', () => {
    // 单层 role=main：deep 选择器（嵌套两层）无法命中 → null，不用聚合容器顶替
    document.body.innerHTML = '<div role="main"><div>only child</div></div>'
    expect(findListContainer(DEEP_URL, getMapsConfig().dom)).toBeNull()
    // 同一 DOM 上聚合选择器可命中，证明未命中时确实没有发生相互回退
    expect(findListContainer(AGGREGATED_URL, getMapsConfig().dom)).not.toBeNull()
  })

  it('列表项过滤首尾（默认选择器）', () => {
    mountAggregatedDom()
    const container = findListContainer(AGGREGATED_URL, getMapsConfig().dom)
    expect(container).not.toBeNull()
    const items = findListItems(container as HTMLElement, getMapsConfig().dom.listItem)
    expect(items.map(item => item.textContent)).toEqual(['place A', 'place B'])
  })

  it('结束判定：容器末子元素（提示位）含提示片段命中；空串配置永不命中', () => {
    document.body.innerHTML =
      '<div id="c"><div>place A</div><div>You\'ve reached the end.</div></div>'
    const container = document.querySelector('#c') as HTMLElement
    expect(isFeedEndReached(container, 'reached the end')).toBe(true)
    expect(isFeedEndReached(container, 'REACHED THE END')).toBe(true)
    expect(isFeedEndReached(container, 'no match')).toBe(false)
    expect(isFeedEndReached(container, '')).toBe(false)
  })

  it('步进滚动：无可滚量时快速完成且不抛错（happy-dom 无布局）', async () => {
    const element = document.createElement('div')
    await expect(animateScrollBy(element, 500, 200, () => false)).resolves.toBe(true)
  })
})

describe('列表会话行为（MapsSearchScraper 列表分支）', () => {
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

  /** 构造格式 B 合成响应（单行详情；同 maps-scraper.spec 的 V2 形态）。 */
  function buildResponse(name: string, keyword = 'saved list'): string {
    const detail: JsonValue[] = []
    detail[10] = `0xa:${name.length.toString(16)}`
    detail[11] = name
    detail[78] = `place_${name}`
    const root: JsonValue[] = new Array(9)
    root[0] = [keyword]
    root[1] = [[`k_${name}`, detail]]
    const envelope = JSON.stringify({ c: 0, d: `)]}'\n${JSON.stringify(root)}` })
    return `${envelope}/*""*/`
  }

  /** 挂列表同构 DOM 并把 SPA URL 推到列表形态（endMarkerText 放容器末子元素提示位）。 */
  function mountListPage(items: string[], endMarkerText = ''): HTMLElement[] {
    document.body.innerHTML = `
      <div role="main">
        <div id="list">
          <div class="list-header">header</div>
          ${items.map(name => `<div class="list-item">${name}</div>`).join('\n')}
          <div class="list-footer">${endMarkerText}</div>
        </div>
      </div>`
    history.pushState(null, '', AGGREGATED_PATH)
    const container = findListContainer(location.href, getMapsConfig().dom) as HTMLElement
    return findListItems(container, getMapsConfig().dom.listItem)
  }

  beforeEach(() => {
    resetMapsConfigForTests()
    // interval=0 → 每轮等待恒为 2000ms（nextScrollDelayMs 公式固定项），
    // 配合 2100ms 步进可确定性地一次推进一轮；动画取 0 走快速路径；
    // noGrowth 上限调大：注入滞后一轮的模拟时序不应触发无增长兜底
    getMapsConfig().scrape.scrollIntervalSec = 0
    getMapsConfig().scrape.scrollAnimMinMs = 0
    getMapsConfig().scrape.scrollAnimMaxMs = 0
    getMapsConfig().scrape.noGrowthRetryLimit = 5
  })

  afterEach(() => {
    document.body.innerHTML = ''
    history.pushState(null, '', '/')
  })

  it('列表会话豁免「<2 条完成」：单行详情入库后仍在采集中', () => {
    history.pushState(null, '', AGGREGATED_PATH)
    const scraper = buildScraper()
    scraper.start()
    expect(scraper.getStatus()).toBe('extracting')

    scraper.handleRpcResponse(buildResponse('Only One'))
    expect(scraper.getStatus()).toBe('extracting')
    expect(scraper.getCount()).toBe(1)

    // 对照：搜索会话（非列表 URL）单行即完成；挂搜索按钮避免重放报错噪音
    document.body.innerHTML =
      '<div role="main"><div role="search"><button aria-label="Search"></button></div></div>'
    history.pushState(null, '', '/maps/search/coffee')
    const searchScraper = buildScraper()
    searchScraper.start()
    searchScraper.handleRpcResponse(buildResponse('Only One'))
    expect(searchScraper.getStatus()).toBe('complete')
  })

  it('列表会话无容器 → 无增长兜底终止（滚动终止一）', async () => {
    document.body.innerHTML = '<div role="main"><div>no list</div></div>'
    history.pushState(null, '', AGGREGATED_PATH)

    vi.useFakeTimers()
    try {
      const scraper = buildScraper()
      scraper.start()
      await vi.advanceTimersByTimeAsync(30_000)
      expect(scraper.getStatus()).toBe('complete')
    } finally {
      vi.useRealTimers()
    }
  })

  it('逐项点击推进 + 末项结束提示完成（滚动终止二）', async () => {
    const names = ['A', 'B', 'C']
    const items = mountListPage(names, "You've reached the end of the list.")
    const clicked: string[] = []
    for (const [index, item] of items.entries()) {
      item.addEventListener('click', () => clicked.push(names[index]))
    }

    vi.useFakeTimers()
    try {
      const scraper = buildScraper()
      // start 同步进入轮 1 顶部（点击 A）后卡在延时；响应在轮间注入模拟详情 RPC 到达
      scraper.start()
      scraper.handleRpcResponse(buildResponse('A'))
      for (const name of ['B', 'C']) {
        // 一次步进恰好走完当前轮延时并到达下一轮顶部（该轮点击发生）
        await vi.advanceTimersByTimeAsync(2_100)
        scraper.handleRpcResponse(buildResponse(name))
      }
      expect(clicked).toEqual(['A', 'B', 'C'])
      expect(scraper.getStatus()).toBe('extracting')

      // 轮 4：可见项全部点击过 + 末项结束提示命中 → 立即完成（不等无增长）
      await vi.advanceTimersByTimeAsync(2_100)
      expect(scraper.getStatus()).toBe('complete')
      expect(clicked).toEqual(['A', 'B', 'C'])
    } finally {
      vi.useRealTimers()
    }
  })

  it('默认契约中列表配置符合 A7 实测基线', () => {
    expect(DEFAULT_MAPS_CONFIG.dom.listModeUrlMark).toBe('10m1!1e1')
    expect(DEFAULT_MAPS_CONFIG.dom.listModeDeepUrlMark).toBe('!11m2!2s')
    expect(DEFAULT_MAPS_CONFIG.dom.listContainer).toBe('div[role=main] > div:last-child')
    expect(DEFAULT_MAPS_CONFIG.dom.listEndMarker).toBe('reached the end')
  })

  it('详情黄金样本（格式 B 裁剪单 place）解析出 1 行且字段下标命中', () => {
    // 裁剪自 format-B 黄金样本（真实响应）：列表取首项、query 段替换为列表页名，
    // 作为列表模式逐项详情 RPC 的响应基线；实录详情样本缺位，实录校准走远程配置
    const raw = readFileSync(
      resolve(process.cwd(), 'tests/fixtures/golden-samples/place-detail-single.txt'),
      'utf-8'
    )
    const parsed = parseSearchRpcResponse(raw, getMapsConfig().parseSchema)
    expect(parsed.query).toBe('My Saved Places')
    expect(parsed.rows).toHaveLength(1)
    expect(parsed.rows[0].name).toBe('Le Cafe Coffee')
    expect(parsed.rows[0].placeId).toBe('ChIJU2cGwuRYwokR1yb7K2YK9WQ')
    // fid 第二段 0x64f50a662bfb26d7 的十进制衍生（换算逻辑由 maps-placeid.spec 护航）
    expect(parsed.rows[0].cid).toBe('7274732207027726039')
  })
})
