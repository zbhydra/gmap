/**
 * Bing data-entity 解析器单测（黄金样本基线）。
 *
 * 基线事实：
 * - tests/fixtures/golden-samples/data-entity-samples.json 与
 *   docs/feat/016.Bing插件/references/golden-samples/export.csv 前 3 行是同批
 *   3 个商家（黄金样本 README），实体列可逐列对照竞品真实导出产物；
 * - 刻意差异：Open Hours 取 entity.openHoursText（T1 §3 优先级，竞品走 .opHours）、
 *   经纬度不截断（格式化属导出层）、云端挖掘列填 ###PRO### 占位（免费档）。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BING_EXPORT_COLUMNS,
  BingParseError,
  PRO_ENHANCEMENT_PLACEHOLDER,
  parseBingRow,
  type BingExportRow
} from '@/sites/bing/content/parser'

// vitest 环境下 import.meta.url 非 file scheme，用进程 cwd（= 包根）拼基线路径
const FIXTURE_DIR = resolve(process.cwd(), 'tests/fixtures/golden-samples')
const GOLDEN_CSV_PATH = resolve(
  process.cwd(),
  '../docs/feat/016.Bing插件/references/golden-samples/export.csv'
)

/** 黄金样本：3 条 data-entity 属性原文（每条是可能双重 stringify 的 JSON 字符串）。 */
function readGoldenSamples(): string[] {
  const raw = readFileSync(resolve(FIXTURE_DIR, 'data-entity-samples.json'), 'utf-8')
  return JSON.parse(raw) as string[]
}

/** 读取竞品导出 CSV：返回表头与数据行（每行为单元格数组，已剥引号、BOM 与空行）。 */
function readGoldenCsv(): { header: string[]; rows: string[][] } {
  const lines = readFileSync(GOLDEN_CSV_PATH, 'utf-8')
    .split('\n')
    .filter(line => line.trim() !== '')
  // 首行表头带 UTF-8 BOM（CSV 自身的 Excel 兼容字节），比对前剥掉
  const header = parseCsvLine((lines[0] as string).replace(/^\ufeff/, ''))
  return { header, rows: lines.slice(1).map(parseCsvLine) }
}

/** 最小 RFC4180 行解析（引号转义 + 逗号分隔，仅满足黄金 CSV 结构）。 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells
}

/** 构造带 data-entity 属性的列表项，innerHtml 作为条目内 DOM（兜底解析用）。 */
function createListItem(attrJson: string, innerHtml = ''): HTMLElement {
  const item = document.createElement('li')
  item.setAttribute('data-entity', attrJson)
  if (innerHtml) {
    item.innerHTML = innerHtml
  }
  return item
}

function parseGoldenSample(index: number): BingExportRow {
  const samples = readGoldenSamples()
  return parseBingRow(createListItem(samples[index] as string))
}

/** 去掉结构化评分字段后的样本属性（强制走 infoboxHtml 兜底路径）。 */
function sampleWithoutStructuredRating(sampleAttr: string): string {
  const payload = JSON.parse(sampleAttr) as { entity: Record<string, unknown> }
  delete payload.entity.ratingValue
  delete payload.entity.ratingCount
  delete payload.entity.ratingSourceName
  return JSON.stringify(payload)
}

/** 去掉 openHoursText 后的样本属性（强制走 .opHours DOM 兜底路径）。 */
function sampleWithoutOpenHours(sampleAttr: string): string {
  const payload = JSON.parse(sampleAttr) as { entity: Record<string, unknown> }
  delete payload.entity.openHoursText
  return JSON.stringify(payload)
}

describe('18 列契约（对照 golden-samples/export.csv 表头）', () => {
  it('列名与顺序和竞品导出 CSV 表头逐列一致', () => {
    const { header } = readGoldenCsv()
    expect(header).toEqual(BING_EXPORT_COLUMNS.map(column => column.header))
    expect(header).toHaveLength(18)
  })

  it('行字段 key 与 18 列一一对应', () => {
    const row = parseGoldenSample(0)
    expect(Object.keys(row)).toEqual(BING_EXPORT_COLUMNS.map(column => column.key))
  })
})

describe('黄金样本解析（实体列对照竞品导出产物）', () => {
  it('3 条样本逐条解析，实体列与 CSV 对应行逐列一致', () => {
    const { rows } = readGoldenCsv()
    const samples = readGoldenSamples()
    expect(samples).toHaveLength(3)
    // CSV 单元格列序：0=ID 1=Name 2=Address 3=Featured image 4=Bing Maps URL 8=Rating Info 9=Category 12=Phone 7=Rating
    rows.slice(0, 3).forEach((cells, index) => {
      const row = parseBingRow(createListItem(samples[index] as string))
      expect(row.id).toBe(cells[0])
      expect(row.name).toBe(cells[1])
      expect(row.address).toBe(cells[2])
      expect(row.featuredImage).toBe(cells[3])
      expect(row.bingMapsUrl).toBe(cells[4])
      expect(row.rating).toBe(Number(cells[7]))
      expect(row.ratingInfo).toBe(cells[8])
      expect(row.category).toBe(cells[9])
      expect(row.website).toBe(cells[11])
      expect(row.phone).toBe(cells[12])
    })
  })

  it('首条样本的 Bing Maps URL 为 cp=lat~lon&lvl=16.0&q=title , address 拼接', () => {
    const row = parseGoldenSample(0)
    expect(row.bingMapsUrl).toBe(
      'https://www.bing.com/maps?cp=40.742977142333984%7E-73.92790985107422&lvl=16.0&' +
        'q=Sunnyside%20Auto%20Repair%2C%20General%20Auto%20Repair%2C%20Auto%20Body%20Shop%20%2C%20' +
        '4533%2037th%20St%2C%20Long%20Island%20City%2C%20NY%2011101'
    )
  })

  it('Open Hours 取 openHoursText（T1 §3 优先级），经纬度取 routablePoint 原值', () => {
    const row = parseGoldenSample(0)
    // 竞品导出该列为 .opHours 文本（"营业 · 歇业时间: 17:00"）；我方合同结构化字段优先
    expect(row.openHours).toBe('5 下午 结束营业')
    expect(row.latitude).toBe(40.742977142333984)
    expect(row.longitude).toBe(-73.92790985107422)
  })

  it('免费档云端挖掘列统一填 ###PRO### 占位', () => {
    const row = parseGoldenSample(1)
    expect(row.emails).toBe(PRO_ENHANCEMENT_PLACEHOLDER)
    expect(row.socialMedias).toBe(PRO_ENHANCEMENT_PLACEHOLDER)
    expect(row.facebook).toBe(PRO_ENHANCEMENT_PLACEHOLDER)
    expect(row.instagram).toBe(PRO_ENHANCEMENT_PLACEHOLDER)
    expect(row.twitter).toBe(PRO_ENHANCEMENT_PLACEHOLDER)
  })

  it('去重键 = entity.id：同源条目行 id 一致且等于 entity.id 原值', () => {
    const samples = readGoldenSamples()
    const firstPayload = JSON.parse(samples[0] as string) as { entity: { id: string } }
    const rowA = parseGoldenSample(0)
    const rowB = parseBingRow(createListItem(samples[0] as string))
    expect(rowA.id).toBe(firstPayload.entity.id)
    expect(rowB.id).toBe(rowA.id)
    // 3 条样本 id 互不相同（黄金样本可作去重集正例）
    const ids = new Set([0, 1, 2].map(index => parseGoldenSample(index).id))
    expect(ids.size).toBe(3)
  })
})

describe('兜底路径', () => {
  it('结构化评分缺失时走 infoboxHtml 星级图：4 满星 + 1 半星 = 4.5，来源文本兜底 Rating Info', () => {
    const samples = readGoldenSamples()
    const row = parseBingRow(createListItem(sampleWithoutStructuredRating(samples[0] as string)))
    expect(row.rating).toBe(4.5)
    expect(row.ratingInfo).toBe('Yelp (76)')
  })

  it('星级图 sw_ste 为终止标记：其后星形不计入（4 满星 + sw_ste + 3 满星 = 4）', () => {
    const infoboxHtml =
      '<a class="infoBoxLink"><div class="bm_ib_ratings">' +
      '<span class="csrc" role="img">' +
      '<span class="sw_st"></span><span class="sw_st"></span>' +
      '<span class="sw_st"></span><span class="sw_st"></span>' +
      '<span class="sw_ste"></span>' +
      '<span class="sw_st"></span><span class="sw_st"></span><span class="sw_st"></span>' +
      '</span> Yelp (77)</div></a>'
    const attr = JSON.stringify({
      entity: { id: 'ypid:TEST', infoboxHtml }
    })
    const row = parseBingRow(createListItem(attr))
    expect(row.rating).toBe(4)
    expect(row.ratingInfo).toBe('Yelp (77)')
  })

  it('openHoursText 缺失时走条目 DOM .opHours 兜底', () => {
    const samples = readGoldenSamples()
    const row = parseBingRow(
      createListItem(sampleWithoutOpenHours(samples[0] as string), '<div class="opHours">营业 · 歇业时间: 17:00</div>')
    )
    expect(row.openHours).toBe('营业 · 歇业时间: 17:00')
  })
})

describe('失败语义（单条抛可识别错误，不静默吞）', () => {
  it('data-entity 属性缺失抛 BingParseError', () => {
    const item = document.createElement('li')
    expect(() => parseBingRow(item)).toThrow(BingParseError)
    expect(() => parseBingRow(item)).toThrow(/data-entity/)
  })

  it('属性 JSON 非法抛 BingParseError', () => {
    const item = createListItem('{"entity": {broken')
    expect(() => parseBingRow(item)).toThrow(BingParseError)
  })

  it('解开层数用尽仍不是 JSON 对象抛 BingParseError', () => {
    const item = createListItem(JSON.stringify(JSON.stringify('123')))
    expect(() => parseBingRow(item)).toThrow(BingParseError)
  })

  it('缺 entity.id（去重键）抛 BingParseError', () => {
    const item = createListItem(JSON.stringify({ entity: { title: 'no id' } }))
    expect(() => parseBingRow(item)).toThrow(BingParseError)
  })
})
