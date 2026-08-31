/**
 * Bing 导出 CSV 组装与 DOM 适配器探测单测（016 U3）。
 *
 * - CSV：18 列表头基线、RFC4180 转义、BOM 开关、免费档末行提示；
 * - detector：(priority, name) 排序、detectors→fallbackDetectors→URL 兜底、
 *   listItems→listItemsAlt 条目回退。
 */

import { describe, expect, it } from 'vitest'
import { DEFAULT_BING_CONFIG } from '@/sites/bing/config/contract'
import { detectAdapter, resolveElement, resolveItems } from '@/sites/bing/content/detector'
import { BING_EXPORT_COLUMNS, type BingExportRow } from '@/sites/bing/content/parser'
import { FREE_LIMIT_NOTE, buildBingCsv } from '@/sites/bing/content/export/csvText'

/** 构造最小合法导出行（字段值可覆盖）。 */
function makeRow(overrides: Partial<BingExportRow> = {}): BingExportRow {
  return {
    id: 'ypid:YN0000000000000001',
    name: 'Test Business',
    address: '1 Main St',
    featuredImage: '',
    bingMapsUrl: '',
    latitude: null,
    longitude: null,
    rating: null,
    ratingInfo: '',
    category: '',
    openHours: '',
    website: '',
    phone: '',
    emails: '###PRO###',
    socialMedias: '###PRO###',
    facebook: '###PRO###',
    instagram: '###PRO###',
    twitter: '###PRO###',
    ...overrides
  }
}

describe('bing csv 组装', () => {
  it('表头为 18 列基线且顺序与 BING_EXPORT_COLUMNS 一致', () => {
    const csv = buildBingCsv([], DEFAULT_BING_CONFIG.export, false)
    const firstLine = csv.replace(/^\uFEFF/, '').split('\n')[0]
    expect(firstLine).toBe(BING_EXPORT_COLUMNS.map(column => column.header).join(','))
    expect(BING_EXPORT_COLUMNS).toHaveLength(18)
  })

  it('免费路径写入 UTF-8 BOM，并可按配置关闭', () => {
    const withBom = buildBingCsv([], DEFAULT_BING_CONFIG.export, false)
    expect(withBom.charCodeAt(0)).toBe(0xfeff)

    const noBom = buildBingCsv([], { ...DEFAULT_BING_CONFIG.export, csvBomEnabled: false }, false)
    expect(noBom.charCodeAt(0)).not.toBe(0xfeff)
  })

  it('含逗号/引号/换行的单元格按 RFC4180 加引号转义', () => {
    const csv = buildBingCsv(
      [makeRow({ name: 'A,B "C"\nD' })],
      DEFAULT_BING_CONFIG.export,
      false
    )
    // 引号内换行不可按 \n 切行断言，直接对全文断言转义形态
    expect(csv).toContain('"A,B ""C""\nD"')
  })

  it('免费档末行追加提示，Pro（includeFreeNote=false）不追加', () => {
    const freeCsv = buildBingCsv([makeRow()], DEFAULT_BING_CONFIG.export, true)
    const freeLines = freeCsv.replace(/^\uFEFF/, '').split('\n')
    expect(freeLines).toHaveLength(3) // header + 1 行 + 提示行
    expect(freeLines[2]).toBe(FREE_LIMIT_NOTE)

    const proCsv = buildBingCsv([makeRow()], DEFAULT_BING_CONFIG.export, false)
    expect(proCsv.replace(/^\uFEFF/, '').split('\n')).toHaveLength(2)
    expect(proCsv).not.toContain(FREE_LIMIT_NOTE)
  })

  it('数值列字符串化，缺失坐标写空串', () => {
    const csv = buildBingCsv(
      [makeRow({ latitude: 40.742977142333984, longitude: null })],
      DEFAULT_BING_CONFIG.export,
      false
    )
    const cells = csv.replace(/^\uFEFF/, '').split('\n')[1].split(',')
    const latIndex = BING_EXPORT_COLUMNS.findIndex(column => column.key === 'latitude')
    const lonIndex = BING_EXPORT_COLUMNS.findIndex(column => column.key === 'longitude')
    expect(cells[latIndex]).toBe('40.742977142333984')
    expect(cells[lonIndex]).toBe('')
  })
})

describe('bing 适配器探测', () => {
  const adapters = DEFAULT_BING_CONFIG.adapters

  it('legacy 优先级高：命中 .b_vList 时选 legacy', () => {
    const doc = new DOMParser().parseFromString(
      '<html><body><ul class="b_vList"><li><a data-entity="{}"></a></li></ul></body></html>',
      'text/html'
    )
    expect(detectAdapter(adapters, doc, 'https://www.bing.com/maps?q=x')?.name).toBe('legacy')
  })

  it('new 版：主探测器 .b_lstcards / #appShellRoot 命中即选', () => {
    const doc = new DOMParser().parseFromString(
      '<html><body><div id="appShellRoot"><ul class="b_lstcards"></ul></div></body></html>',
      'text/html'
    )
    expect(detectAdapter(adapters, doc, 'https://www.bing.com/maps?q=x')?.name).toBe('new')
  })

  it('主探测器全空时按序试 fallbackDetectors', () => {
    const doc = new DOMParser().parseFromString(
      '<html><body><div data-automation-id="resultsList"></div></body></html>',
      'text/html'
    )
    expect(detectAdapter(adapters, doc, 'https://www.bing.com/maps?q=x')?.name).toBe('new')
  })

  it('选择器全不命中时走 Bing Maps URL 兜底，取排序首位（legacy）', () => {
    const doc = new DOMParser().parseFromString('<html><body></body></html>', 'text/html')
    expect(detectAdapter(adapters, doc, 'https://www.bing.com/maps?q=x')?.name).toBe('legacy')
  })

  it('非 Bing Maps 页且无探测器命中返回 null', () => {
    const doc = new DOMParser().parseFromString('<html><body></body></html>', 'text/html')
    expect(detectAdapter(adapters, doc, 'https://example.com/other')).toBeNull()
  })
})

describe('bing 选择器解析', () => {
  const newAdapter = DEFAULT_BING_CONFIG.adapters.find(adapter => adapter.name === 'new')

  it('listItems 命中即用，全空回退 listItemsAlt', () => {
    const doc = new DOMParser().parseFromString(
      '<html><body><ul class="b_lstcards">' +
        '<li data-key="1"><button class="b_split_card"></button></li>' +
        '</ul></body></html>',
      'text/html'
    )
    const adapter = newAdapter
    if (!adapter) {
      throw new Error('new 适配器缺失')
    }
    // 主候选 [data-entity] 未命中 → listItemsAlt 首个命中 li .b_split_card
    const items = resolveItems(doc, adapter)
    expect(items).toHaveLength(1)
    expect(items[0].tagName.toLowerCase()).toBe('button')
  })

  it('resolveElement 按候选序返回首个命中，全空返回 null', () => {
    const doc = new DOMParser().parseFromString(
      '<html><body><div class="listingsPanel"><ul class="b_lstcards"></ul></div></body></html>',
      'text/html'
    )
    const hit = resolveElement(doc, [
      '.b_lstcards',
      '.listingsPanel',
      '[data-automation-id="resultsList"]'
    ])
    expect(hit?.className).toBe('b_lstcards')
    expect(resolveElement(doc, ['.not-exist'])).toBeNull()
    expect(resolveElement(doc, undefined)).toBeNull()
  })
})
