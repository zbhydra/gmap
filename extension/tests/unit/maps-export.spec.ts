/**
 * 搜索结果导出引擎单元测试（A8，U4）。
 *
 * 覆盖：36 列 schema（列序/Pro 12 列/驼峰化）、CSV 列序与转义、JSON 形状
 * （键驼峰化 + 数值类型保持）、XLSX 生成（SheetJS 读回校验）、Place Id
 * 导出去重、文件命名、Pro 门控剔除（exportConfig.proColumnsEnabled 语义）。
 */

import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import type { MapsPlaceRow } from '@/sites/maps/content/parser'
import {
  SEARCH_EXPORT_COLUMN_GROUPS,
  SEARCH_EXPORT_COLUMNS,
  camelizeColumnHeader,
  selectEnabledExportColumns,
  selectExportColumns
} from '@/sites/maps/content/export/columns'
import { buildSearchCsv, buildSearchExportFilename } from '@/sites/maps/content/export/csv'
import { buildSearchJson, buildSearchJsonRecords } from '@/sites/maps/content/export/json'
import { buildSearchXlsx } from '@/sites/maps/content/export/xlsx'
import {
  buildSearchExport,
  dedupeRowsForExport
} from '@/sites/maps/content/export/engine'

/** 36 列期望列序（A5/逆向 04，独立于实现的回归锁）。 */
const EXPECTED_HEADERS = [
  'Name',
  'Description',
  'Fulladdress',
  'Street',
  'Municipality',
  'Categories',
  'About',
  'Plus Code',
  'Time Zone',
  'Price',
  'Note',
  'Amenities',
  'Hotel Class',
  'Phone',
  'Phones',
  'Claimed',
  'Owner',
  'Owner Id',
  'Owner Link',
  'Email',
  'Social Medias',
  'Review Count',
  'Average Rating',
  'Review URL',
  'Google Maps URL',
  'Google Knowledge URL',
  'Latitude',
  'Longitude',
  'Website',
  'Domain',
  'Opening Hours',
  'Featured Image',
  'Cid',
  'Fid',
  'Place Id',
  'Kgmid'
]

/** 12 个 Pro 列（逆向 04 PRO_FIELDS，按 36 列序排列）。 */
const EXPECTED_PRO_HEADERS = [
  'About',
  'Plus Code',
  'Price',
  'Note',
  'Hotel Class',
  'Owner',
  'Owner Id',
  'Owner Link',
  'Email',
  'Social Medias',
  'Google Knowledge URL',
  'Kgmid'
]

function makeRow(partial: Partial<MapsPlaceRow> = {}): MapsPlaceRow {
  return {
    name: 'Cafe',
    categories: ['Coffee shop'],
    fullAddress: '1 Test St',
    street: '1 Test St',
    municipality: 'New York, NY 10001',
    description: 'desc',
    about: 'Highlights: [Great coffee]',
    timeZone: 'America/New_York',
    price: '$1–10',
    note: 'note',
    amenities: 'Wi-Fi,Outdoor seating',
    hotelClass: '',
    phone: '(212) 555-0000',
    phones: '(212) 555-0000, +1 212-555-0001',
    claimed: 'YES',
    owner: 'Cafe (Owner)',
    ownerId: 'owner_1',
    reviewUrl: 'https://search.google.com/local/reviews?placeid=p1',
    rating: '4.5',
    reviewCount: '12',
    latitude: '40.1',
    longitude: '-73.1',
    website: 'https://example.com',
    domain: 'example.com',
    openingHours: 'Friday(2026-08-28): [07:00-18:00]',
    featuredImage: 'https://img.example.com/1.jpg',
    cid: '123',
    fid: '0xa:0x7b',
    placeId: 'place_1',
    kgmid: '/g/abc',
    // U8 enrich 数据列：未补全默认空，导出按列位写入空串
    email: '',
    socialMedias: '',
    ...partial
  }
}

/** 全选列集合（用户设置默认全选语义）。 */
function enabledHeaders(): string[] {
  return SEARCH_EXPORT_COLUMNS.map(column => column.header)
}

describe('36 列 schema', () => {
  it('列序固定且与 A5 字段字典一致', () => {
    expect(SEARCH_EXPORT_COLUMNS.map(column => column.header)).toEqual(EXPECTED_HEADERS)
    expect(SEARCH_EXPORT_COLUMNS).toHaveLength(36)
  })

  it('Pro 列恰为逆向 04 的 12 列，且列名不重复', () => {
    const proHeaders = SEARCH_EXPORT_COLUMNS.filter(c => c.pro).map(c => c.header)
    expect(proHeaders).toEqual(EXPECTED_PRO_HEADERS)
    expect(new Set(SEARCH_EXPORT_COLUMNS.map(c => c.header)).size).toBe(36)
  })

  it('门控开启全列可用，关闭剔除全部 Pro 列（免费 24 列）', () => {
    expect(selectExportColumns(true)).toHaveLength(36)
    const freeColumns = selectExportColumns(false)
    expect(freeColumns).toHaveLength(24)
    expect(freeColumns.map(c => c.header)).toEqual(
      EXPECTED_HEADERS.filter(header => !EXPECTED_PRO_HEADERS.includes(header))
    )
  })

  it('默认契约 Pro 门控为全开（无账号体系期语义）', () => {
    expect(DEFAULT_MAPS_CONFIG.exportConfig.proColumnsEnabled).toBe(true)
  })

  it('列名驼峰化：首词小写 + 去空格（逆向 07 规则）', () => {
    expect(camelizeColumnHeader('Business Leads')).toBe('businessLeads')
    expect(camelizeColumnHeader('Google Maps URL')).toBe('googleMapsURL')
    expect(camelizeColumnHeader('Google Knowledge URL')).toBe('googleKnowledgeURL')
    expect(camelizeColumnHeader('Review Count')).toBe('reviewCount')
    expect(camelizeColumnHeader('Fulladdress')).toBe('fulladdress')
    expect(camelizeColumnHeader('Name')).toBe('name')
  })
})

describe('CSV 构建（36 列）', () => {
  it('表头与行值按列序一一对齐，衍生列现算', () => {
    const columns = selectExportColumns(true)
    const csv = buildSearchCsv([makeRow()], columns)
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe(`\uFEFF${EXPECTED_HEADERS.join(',')}`)
    expect(lines[1]).toBe(
      [
        'Cafe',
        'desc',
        '1 Test St',
        '1 Test St',
        '"New York, NY 10001"', // 含逗号 → RFC4180 引号包裹
        'Coffee shop',
        'Highlights: [Great coffee]',
        '', // Plus Code（U8）
        'America/New_York',
        '$1–10',
        'note',
        '"Wi-Fi,Outdoor seating"',
        '', // Hotel Class（样本无数据列同样按列位写入）
        '(212) 555-0000',
        '"(212) 555-0000, +1 212-555-0001"',
        'YES',
        'Cafe (Owner)',
        'owner_1',
        'https://www.google.com/maps/contrib/owner_1',
        '', // Email（U8）
        '', // Social Medias（U8）
        '12',
        '4.5',
        'https://search.google.com/local/reviews?placeid=p1',
        'https://www.google.com/maps?cid=123',
        'https://www.google.com/search?kgmid=/g/abc',
        '40.1',
        '-73.1',
        'https://example.com',
        'example.com',
        'Friday(2026-08-28): [07:00-18:00]',
        'https://img.example.com/1.jpg',
        '123',
        '0xa:0x7b',
        'place_1',
        '/g/abc'
      ].join(',')
    )
  })

  it('cid 缺失时衍生列从 fid 重衍生；kgmid/ownerId 缺失衍生 URL 置空', () => {
    const columns = selectExportColumns(true)
    const csv = buildSearchCsv(
      [makeRow({ cid: '', fid: '0xa:0xff', kgmid: '', ownerId: '' })],
      columns
    )
    const header = columns.map(c => c.header)
    const row = csvToRow(csv, header)
    expect(row['Cid']).toBe('255')
    expect(row['Google Maps URL']).toBe('https://www.google.com/maps?cid=255')
    expect(row['Google Knowledge URL']).toBe('')
    expect(row['Owner Link']).toBe('')
  })

  it('U8 enrich 数据列：Email 逗号分隔、Social Medias 多行文本写入列位；未补全为空', () => {
    const columns = selectExportColumns(true)
    const csv = buildSearchCsv(
      [
        makeRow({
          email: 'info@cafe.com,hello@cafe.com',
          socialMedias:
            'instagram: https://www.instagram.com/cafe\nfacebook: https://facebook.com/cafe'
        }),
        makeRow({ placeId: '', email: '', socialMedias: '' })
      ],
      columns
    )
    const header = columns.map(c => c.header)
    const dataLines = csv.replace(/^\uFEFF/, '').split('\r\n').slice(1)

    /** 按行解析（RFC4180 引号感知）。 */
    const parseLine = (line: string): string[] => {
      const cells: string[] = []
      let current = ''
      let inQuotes = false
      for (let index = 0; index < line.length; index++) {
        const char = line[index]
        if (inQuotes) {
          if (char === '"' && line[index + 1] === '"') {
            current += '"'
            index += 1
          } else if (char === '"') {
            inQuotes = false
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

    const enriched = parseLine(dataLines[0] ?? '')
    expect(enriched[header.indexOf('Email')]).toBe('info@cafe.com,hello@cafe.com')
    expect(enriched[header.indexOf('Social Medias')]).toBe(
      'instagram: https://www.instagram.com/cafe\nfacebook: https://facebook.com/cafe'
    )
    // 未补全行：两列按列位写入空串（列数不塌缩）
    const plain = parseLine(dataLines[1] ?? '')
    expect(plain[header.indexOf('Email')]).toBe('')
    expect(plain[header.indexOf('Social Medias')]).toBe('')
    expect(plain).toHaveLength(header.length)
  })

  it('含逗号/引号/换行的字段按 RFC4180 转义，BOM 与 CRLF 齐备', () => {
    const csv = buildSearchCsv([makeRow({ name: 'Cafe, "Alpha"\nBeta' })], selectExportColumns(true))
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"Cafe, ""Alpha""\nBeta"')
    expect(csv.endsWith('\r\n')).toBe(true)
  })
})

describe('JSON 构建（36 列）', () => {
  it('键 = 驼峰化列名，全列导出时 36 键且顺序 = 列序', () => {
    const records = buildSearchJsonRecords([makeRow()], selectExportColumns(true))
    expect(Object.keys(records[0] as SearchRecord)).toEqual(EXPECTED_HEADERS.map(camelizeColumnHeader))
  })

  it('数值列类型保持（评分/评论数/经纬度），缺失保持空串，Cid 恒字符串', () => {
    const record = buildSearchJsonRecords(
      [makeRow({ rating: '', reviewCount: '261', latitude: '40.7597355' })],
      selectExportColumns(true)
    )[0] as SearchRecord
    expect(record.averageRating).toBe('')
    expect(record.reviewCount).toBe(261)
    expect(record.latitude).toBe(40.7597355)
    expect(record.longitude).toBe(-73.1)
    expect(record.cid).toBe('123')
  })

  it('门控关闭时 Pro 列整体消失（键与值），文本列保持字符串', () => {
    const records = buildSearchJsonRecords([makeRow()], selectExportColumns(false))
    expect(Object.keys(records[0] as SearchRecord)).toHaveLength(24)
    expect(records[0]).not.toHaveProperty('about')
    expect(records[0]).not.toHaveProperty('price')
    expect(records[0]).toHaveProperty('name', 'Cafe')
  })

  it('buildSearchJson 输出紧凑 JSON 文本', () => {
    const json = buildSearchJson([makeRow()], selectExportColumns(false))
    const parsed = JSON.parse(json) as SearchRecord[]
    expect(parsed).toHaveLength(1)
    expect(Object.keys(parsed[0] as SearchRecord)).toHaveLength(24)
    expect(parsed[0]).toHaveProperty('name', 'Cafe')
    expect(parsed[0]).toHaveProperty('cid', '123')
  })
})

describe('文件命名与导出去重', () => {
  it('命名：{前缀}-{条数}-{关键词}-{YYYY-MM-DD}.{扩展名}，非法字符替换', () => {
    const date = new Date(2026, 7, 30) // 2026-08-30（本地时区）
    expect(buildSearchExportFilename(20, 'coffee in manhattan', date, 'csv')).toBe(
      'MapsGrab-Extractor-20-coffee+in+manhattan-2026-08-30.csv'
    )
    expect(buildSearchExportFilename(3, 'a/b:c*d', date, 'csv')).toBe(
      'MapsGrab-Extractor-3-a-b-c-d-2026-08-30.csv'
    )
    expect(buildSearchExportFilename(1, '', date, 'csv')).toBe(
      'MapsGrab-Extractor-1-search-2026-08-30.csv'
    )
    expect(buildSearchExportFilename(2, 'kw', date, 'json')).toBe(
      'MapsGrab-Extractor-2-kw-2026-08-30.json'
    )
    expect(buildSearchExportFilename(5, 'kw', date, 'xlsx')).toBe(
      'MapsGrab-Extractor-5-kw-2026-08-30.xlsx'
    )
  })

  it('导出去重：Place Id 先到先得；空 Place Id 不参与碰撞', () => {
    const deduped = dedupeRowsForExport([
      makeRow({ name: 'A', placeId: 'p1' }),
      makeRow({ name: 'B', placeId: 'p1' }),
      makeRow({ name: 'C', placeId: 'p2' }),
      makeRow({ name: 'D', placeId: '' }),
      makeRow({ name: 'E', placeId: '' })
    ])
    expect(deduped.map(row => row.name)).toEqual(['A', 'C', 'D', 'E'])
  })
})

describe('XLSX 构建（SheetJS 读回校验）', () => {
  it('生成可读回的工作簿：首行 36 列表头，数据行按列序对齐', () => {
    const aoa = readXlsxAoa(buildSearchXlsx([makeRow()], selectExportColumns(true)))
    expect(aoa).toHaveLength(2)
    expect(aoa[0]).toEqual(EXPECTED_HEADERS)
    expect(aoa[1]).toEqual([
      'Cafe',
      'desc',
      '1 Test St',
      '1 Test St',
      'New York, NY 10001',
      'Coffee shop',
      'Highlights: [Great coffee]',
      '', // Plus Code（U8）
      'America/New_York',
      '$1–10',
      'note',
      'Wi-Fi,Outdoor seating',
      '', // Hotel Class（样本无数据列同样按列位写入）
      '(212) 555-0000',
      '(212) 555-0000, +1 212-555-0001',
      'YES',
      'Cafe (Owner)',
      'owner_1',
      'https://www.google.com/maps/contrib/owner_1',
      '', // Email（U8）
      '', // Social Medias（U8）
      '12',
      '4.5',
      'https://search.google.com/local/reviews?placeid=p1',
      'https://www.google.com/maps?cid=123',
      'https://www.google.com/search?kgmid=/g/abc',
      '40.1',
      '-73.1',
      'https://example.com',
      'example.com',
      'Friday(2026-08-28): [07:00-18:00]',
      'https://img.example.com/1.jpg',
      '123',
      '0xa:0x7b',
      'place_1',
      '/g/abc'
    ])
  })

  it('单元格全部文本化：Cid 19 位长数字读回不丢精度', () => {
    const bigCid = '11577869634268375885'
    const aoa = readXlsxAoa(
      buildSearchXlsx([makeRow({ cid: bigCid, fid: '0xa:0xa0acdb1716592b4d' })], selectExportColumns(true))
    )
    const header = EXPECTED_HEADERS
    expect(aoa[1]?.[header.indexOf('Cid')]).toBe(bigCid)
    expect(aoa[1]?.[header.indexOf('Cid')]).not.toBe(Number(bigCid).toString())
  })

  it('门控关闭：首行 24 列表头，Pro 列整体不出现', () => {
    const aoa = readXlsxAoa(buildSearchXlsx([makeRow()], selectExportColumns(false)))
    expect(aoa[0]).toHaveLength(24)
    expect(aoa[0]).not.toContain('About')
    expect(aoa[0]).not.toContain('Email')
    expect(aoa[0]).toContain('Name')
  })
})

describe('导出列分组与用户字段勾选（U6）', () => {
  it('分组 headers 并集恰为 36 列全集且组间不重复（防分组漂移）', () => {
    const grouped = SEARCH_EXPORT_COLUMN_GROUPS.flatMap(group => group.headers)
    expect(grouped).toHaveLength(36)
    expect(new Set(grouped).size).toBe(36)
    expect(new Set(grouped)).toEqual(new Set(SEARCH_EXPORT_COLUMNS.map(c => c.header)))
  })

  it('selectEnabledExportColumns：门控与用户勾选取交集，Pro 列不因勾选复活', () => {
    const all = SEARCH_EXPORT_COLUMNS.map(c => c.header)
    expect(selectEnabledExportColumns(true, all)).toHaveLength(36)

    // 只勾 3 列 → 只出 3 列，且保持 schema 列序
    const picked = selectEnabledExportColumns(true, ['Kgmid', 'Name', 'Cid'])
    expect(picked.map(c => c.header)).toEqual(['Name', 'Cid', 'Kgmid'])

    // 免费档勾选含 Pro 列 → Pro 列在门控层先剔除
    const freeWithPro = selectEnabledExportColumns(false, ['Name', 'Price', 'Cid'])
    expect(freeWithPro.map(c => c.header)).toEqual(['Name', 'Cid'])
  })

  it('buildSearchExport 按勾选子集输出（CSV 表头与 JSON 键同步收窄）', () => {
    const artifact = buildSearchExport([makeRow()], 'kw', new Date(2026, 7, 30), {
      format: 'csv',
      proColumnsEnabled: true,
      enabledHeaders: ['Name', 'Cid']
    })
    expect(artifact.rowCount).toBe(1)
    if (typeof artifact.content !== 'string') {
      throw new Error('csv 产物内容应为文本')
    }
    expect(artifact.content.startsWith('\uFEFFName,Cid\r\n')).toBe(true)
  })
})

describe('导出引擎（buildSearchExport）', () => {
  it('csv 产物：内容、文件名、MIME、去重后条数', () => {
    const artifact = buildSearchExport(
      [makeRow({ placeId: 'p1' }), makeRow({ placeId: 'p1' }), makeRow({ placeId: 'p2' })],
      'kw with space',
      new Date(2026, 7, 30),
      { format: 'csv', proColumnsEnabled: false, enabledHeaders: enabledHeaders() }
    )
    expect(artifact.format).toBe('csv')
    expect(artifact.rowCount).toBe(2)
    expect(artifact.filename).toBe('MapsGrab-Extractor-2-kw+with+space-2026-08-30.csv')
    expect(artifact.mime).toBe('text/csv')
    if (typeof artifact.content !== 'string') {
      throw new Error('csv 产物内容应为文本')
    }
    expect(artifact.content.startsWith('\uFEFFName,Description')).toBe(true)
  })

  it('json 产物：扩展名与 MIME 随格式切换', () => {
    const artifact = buildSearchExport([makeRow()], 'kw', new Date(2026, 7, 30), {
      format: 'json',
      proColumnsEnabled: true,
      enabledHeaders: enabledHeaders()
    })
    expect(artifact.format).toBe('json')
    expect(artifact.filename).toBe('MapsGrab-Extractor-1-kw-2026-08-30.json')
    expect(artifact.mime).toBe('application/json')
    if (typeof artifact.content !== 'string') {
      throw new Error('json 产物内容应为文本')
    }
    expect(JSON.parse(artifact.content)).toHaveLength(1)
  })

  it('xlsx 产物：二进制内容可读回，扩展名与 MIME 正确，命名含去重条数', () => {
    const artifact = buildSearchExport(
      [makeRow({ placeId: 'p1' }), makeRow({ placeId: 'p1' })],
      'kw',
      new Date(2026, 7, 30),
      { format: 'xlsx', proColumnsEnabled: true, enabledHeaders: enabledHeaders() }
    )
    expect(artifact.format).toBe('xlsx')
    expect(artifact.filename).toBe('MapsGrab-Extractor-1-kw-2026-08-30.xlsx')
    expect(artifact.mime).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    expect(artifact.rowCount).toBe(1)
    if (!(artifact.content instanceof Uint8Array)) {
      throw new Error('xlsx 产物内容应为二进制')
    }
    expect(readXlsxAoa(artifact.content)[0]).toEqual(EXPECTED_HEADERS)
  })
})

/** 从导出产物字节读回首行列出的 AOA（SheetJS 弱类型签名的显式收窄入口）。 */
function readXlsxAoa(bytes: Uint8Array): (string | number | boolean | undefined)[][] {
  const book = XLSX.read(bytes, { type: 'array' })
  expect(book.SheetNames).toEqual(['Sheet1'])
  const sheet = book.Sheets[book.SheetNames[0] ?? '']
  if (!sheet) {
    throw new Error('工作表缺失')
  }
  // sheet_to_json 的泛型是行类型（header:1 模式下每行为单元格数组）
  return XLSX.utils.sheet_to_json<(string | number | boolean | undefined)[]>(sheet, {
    header: 1
  })
}

/** 从 CSV 文本解析出首条数据行的键值视图（RFC4180 感知，测试断言辅助）。 */
function csvToRow(csv: string, header: readonly string[]): Record<string, string> {
  const dataLine = csv.split('\r\n')[1] ?? ''
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let index = 0; index < dataLine.length; index++) {
    const char = dataLine[index]
    if (inQuotes) {
      if (char === '"') {
        if (dataLine[index + 1] === '"') {
          current += '"'
          index += 1
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
  const row: Record<string, string> = {}
  header.forEach((name, index) => {
    row[name] = cells[index] ?? ''
  })
  return row
}

/** 测试断言用的 JSON 记录视图。 */
type SearchRecord = Record<string, string | number>
