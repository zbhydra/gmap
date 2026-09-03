/**
 * Maps 搜索 RPC 解析器单元测试（黄金样本基线）。
 *
 * 基线事实（013 动态验证报告 + fixture 脚本实测）：
 * - format-B-spa-xhr-20places.txt 与 parsed-rows-from-format-A.json 的 20 个
 *   place_id 及行序完全一致，可做逐字段对照；
 * - format-A-direct-nav-20places.txt 是另一批 20 个商家的直接导航响应；
 * - 两种样本顶层均 72 段，列表定位 data[64]（len-8）。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { JsonValue } from '@/core/rpc/types'
import { DEFAULT_MAPS_CONFIG, type MapsParseSchemaConfig } from '@/sites/maps/config/contract'
import {
  buildRowDedupeKey,
  compileSchemaPath,
  deriveCidFromFid,
  filterNewRows,
  parseListLocator,
  parseSearchRpcResponse,
  type MapsPlaceRow
} from '@/sites/maps/content/parser'

// vitest 环境下 import.meta.url 非 file scheme，用进程 cwd（= 包根）拼 fixture 路径
const GOLDEN_DIR = resolve(process.cwd(), 'tests/fixtures/golden-samples')

function readGolden(name: string): string {
  return readFileSync(resolve(GOLDEN_DIR, name), 'utf-8')
}

interface GoldenParsedRow {
  name: string
  categories: string[] | null
  address: string
  phone_1: string | null
  website?: string | null
  rating: number | null
  reviews: number | null
  lat: number
  long: number
  fid: string
  place_id: string
}

function readParsedRows(): GoldenParsedRow[] {
  return JSON.parse(readGolden('parsed-rows-from-format-A.json')) as GoldenParsedRow[]
}

function defaultSchema(): MapsParseSchemaConfig {
  return DEFAULT_MAPS_CONFIG.parseSchema
}

/** 断言解析行与黄金 fixture 行在基础列集上逐字段一致。 */
function expectRowMatchesGolden(row: MapsPlaceRow, golden: GoldenParsedRow): void {
  expect(row.name).toBe(golden.name)
  expect(row.categories).toEqual(golden.categories ?? [])
  expect(row.fullAddress).toBe(golden.address)
  expect(row.phone).toBe(golden.phone_1 ?? '')
  expect(row.website).toBe(golden.website ?? '')
  expect(row.rating).toBe(golden.rating === null ? '' : String(golden.rating))
  expect(row.reviewCount).toBe(golden.reviews === null ? '' : String(golden.reviews))
  expect(row.latitude).toBe(String(golden.lat))
  expect(row.longitude).toBe(String(golden.long))
  expect(row.fid).toBe(golden.fid)
  expect(row.placeId).toBe(golden.place_id)
  // cid 由 fid 第二段 hex 衍生，黄金样本不含该字段，单独断言衍生正确性
  expect(row.cid).toBe(BigInt(golden.fid.split(':')[1] as string).toString(10))
}

describe('格式 B（SPA XHR）黄金样本解析', () => {
  const raw = readGolden('format-B-spa-xhr-20places.txt')
  const goldenRows = readParsedRows()

  it('剥壳后解析出 20 行，与黄金 fixture 行序与基础列逐字段一致', () => {
    const result = parseSearchRpcResponse(raw, defaultSchema())

    expect(result.format).toBe('B')
    expect(result.query).toBe('coffee in manhattan')
    expect(result.rows).toHaveLength(goldenRows.length)

    result.rows.forEach((row, index) => {
      expectRowMatchesGolden(row, goldenRows[index] as GoldenParsedRow)
    })
  })
})

describe('格式 A（直接导航）黄金样本解析', () => {
  const raw = readGolden('format-A-direct-nav-20places.txt')

  it('无尾哨兵响应按格式 A 剥壳，解析出 20 行', () => {
    const result = parseSearchRpcResponse(raw, defaultSchema())

    expect(result.format).toBe('A')
    expect(result.query).toBe('coffee in manhattan')
    expect(result.rows).toHaveLength(20)
  })

  it('首行关键逐字段断言（实测样本第一条为 Gold coffee）', () => {
    const [first] = parseSearchRpcResponse(raw, defaultSchema()).rows

    expect(first?.name).toBe('Gold coffee')
    expect(first?.fullAddress).toBe('491 3rd Ave, New York, NY 10016')
    expect(first?.categories).toEqual(['Coffee shop'])
    expect(first?.rating).toBe('4.9')
    expect(first?.reviewCount).toBe('1828')
    expect(first?.latitude).toBe('40.7451277')
    expect(first?.longitude).toBe('-73.9783508')
    expect(first?.placeId).toBe('ChIJm-xEoHxZwokRTStZFhfbrKA')
    expect(first?.fid).toBe('0x89c2597ca044ec9b:0xa0acdb1716592b4d')
    expect(first?.cid).toBe('11577869634268375885')
    expect(first?.website).toBe('https://service-page-help.web.app/gold-coffee')
  })
})

describe('36 列全 schema 逐列解析（黄金样本，U4）', () => {
  // —— 黄金样本逐列勘验基线（两样本 40 行全部勘验核对，契约默认下标的回归锁）——
  // 格式 B 20 行的非空率：20 列全满 / 7 列部分命中 / 3 列样本无数据恒空。
  // Note/Amenities/Hotel Class 在两个黄金样本中均无数据（响应恒缺该段），
  // 断言恒空锁「缺失解析为空串不抛错」；实录数据校准走远程配置覆盖。

  /** 统计某列在全部行中的非空行数（categories 按数组非空判定）。 */
  function nonEmptyCount(rows: MapsPlaceRow[], key: keyof MapsPlaceRow): number {
    return rows.filter(row => {
      const value = row[key]
      return Array.isArray(value) ? value.length > 0 : value.length > 0
    }).length
  }

  /** 全满列（20/20）。 */
  const FULL_COLUMNS: ReadonlyArray<keyof MapsPlaceRow> = [
    'name',
    'categories',
    'fullAddress',
    'street',
    'municipality',
    'about',
    'timeZone',
    'claimed',
    'owner',
    'reviewUrl',
    'rating',
    'reviewCount',
    'latitude',
    'longitude',
    'openingHours',
    'featuredImage',
    'cid',
    'fid',
    'placeId',
    'kgmid'
  ]

  /** 部分命中列：格式 B 样本实测非空行数（样本即基线）。 */
  const PARTIAL_COLUMNS: ReadonlyArray<[keyof MapsPlaceRow, number]> = [
    ['description', 4],
    ['price', 19],
    ['phone', 11],
    ['phones', 11],
    ['website', 18],
    ['domain', 18],
    ['ownerId', 19]
  ]

  /** 样本无数据列：RPC 响应不含该段，解析须恒为空串而非抛错。 */
  const EMPTY_COLUMNS: ReadonlyArray<keyof MapsPlaceRow> = ['note', 'amenities', 'hotelClass']

  it('格式 B 全部 20 行逐列非空率与勘验基线一致', () => {
    const { rows } = parseSearchRpcResponse(
      readGolden('format-B-spa-xhr-20places.txt'),
      defaultSchema()
    )
    expect(rows).toHaveLength(20)
    for (const key of FULL_COLUMNS) {
      expect(nonEmptyCount(rows, key)).toBe(20)
    }
    for (const [key, count] of PARTIAL_COLUMNS) {
      expect(nonEmptyCount(rows, key)).toBe(count)
    }
    for (const key of EMPTY_COLUMNS) {
      expect(rows.every(row => row[key] === '')).toBe(true)
    }
  })

  it('格式 B 首行（Le Cafe Coffee）RPC 直取列逐字段精确值', () => {
    const [first] = parseSearchRpcResponse(
      readGolden('format-B-spa-xhr-20places.txt'),
      defaultSchema()
    ).rows

    expect(first?.name).toBe('Le Cafe Coffee')
    expect(first?.categories).toEqual(['Coffee shop', 'Delivery Restaurant', 'Restaurant'])
    expect(first?.fullAddress).toBe('661 Lexington Ave, New York, NY 10022')
    expect(first?.street).toBe('661 Lexington Ave')
    expect(first?.municipality).toBe('New York, NY 10022')
    // 首行无简介（4/20 命中），简介文本在非空集合断言中锁定
    expect(first?.description).toBe('')
    // About 分组：11 组，首组/末组精确断言（组间换行、项在方括号内）
    const aboutLines = first?.about.split('\n') ?? []
    expect(aboutLines).toHaveLength(11)
    expect(aboutLines[0]).toBe('Service options: [Delivery, Onsite services, Takeout, Dine-in]')
    expect(aboutLines[aboutLines.length - 1]).toBe(
      'Payments: [Credit cards, Debit cards, NFC mobile payments]'
    )
    expect(first?.timeZone).toBe('America/New_York')
    expect(first?.price).toBe('$1–10')
    expect(first?.note).toBe('')
    expect(first?.amenities).toBe('')
    expect(first?.hotelClass).toBe('')
    expect(first?.phone).toBe('(646) 682-7384')
    expect(first?.phones).toBe('(646) 682-7384, +1 646-682-7384')
    expect(first?.claimed).toBe('YES')
    expect(first?.owner).toBe('Le Cafe Coffee (Owner)')
    expect(first?.ownerId).toBe('113382345532764537477')
    expect(first?.reviewUrl).toBe(
      'https://search.google.com/local/reviews?placeid=ChIJU2cGwuRYwokR1yb7K2YK9WQ&q=coffee+in+manhattan&authuser=0&hl=en&gl=US'
    )
    expect(first?.rating).toBe('4.5')
    expect(first?.reviewCount).toBe('261')
    expect(first?.latitude).toBe('40.7597355')
    expect(first?.longitude).toBe('-73.9697968')
    expect(first?.website).toBe('http://lecafecoffee.com/')
    expect(first?.domain).toBe('lecafecoffee.com')
    // 营业时间：7 天逐行 `周几(日期): [HH:mm-HH:mm]`
    const hoursLines = first?.openingHours.split('\n') ?? []
    expect(hoursLines).toHaveLength(7)
    expect(hoursLines[0]).toBe('Friday(2026-08-28): [07:00-18:00]')
    // 封面图：http(s) URL 原样保留
    expect(first?.featuredImage.startsWith('https://lh3.googleusercontent.com/')).toBe(true)
    expect(first?.featuredImage.endsWith('=w80-h120-k-no')).toBe(true)
    expect(first?.cid).toBe('7274732207027726039')
    expect(first?.fid).toBe('0x89c258e4c2066753:0x64f50a662bfb26d7')
    expect(first?.placeId).toBe('ChIJU2cGwuRYwokR1yb7K2YK9WQ')
    expect(first?.kgmid).toBe('/g/11c1pcnzbf')
  })

  it('格式 B 简介与价位命中行断言（部分命中列的具体值）', () => {
    const { rows } = parseSearchRpcResponse(
      readGolden('format-B-spa-xhr-20places.txt'),
      defaultSchema()
    )
    const descriptions = rows.map(row => row.description).filter(text => text.length > 0)
    expect(descriptions).toContain(
      'Loungey joint providing coffee & tea beverages, sandwiches, pastries & light fare in stylish digs.'
    )
    // 价位区间文本（price 主路径缺失时走 fallback [4][2]，en-dash 保留）
    expect(rows.map(row => row.price)).toContain('$1–10')
  })

  it('格式 B 第二行营业时间含歇业日（Closed 标记）', () => {
    const [, second] = parseSearchRpcResponse(
      readGolden('format-B-spa-xhr-20places.txt'),
      defaultSchema()
    ).rows
    expect(second?.openingHours).toContain('Saturday(2026-08-29): Closed')
    expect(second?.openingHours).toContain('Sunday(2026-08-30): Closed')
  })

  it('格式 A 首行（Gold coffee）扩展列逐字段精确值（双格式下标一致）', () => {
    const [first] = parseSearchRpcResponse(
      readGolden('format-A-direct-nav-20places.txt'),
      defaultSchema()
    ).rows

    expect(first?.street).toBe('491 3rd Ave')
    expect(first?.municipality).toBe('New York, NY 10016')
    // 首行无简介、无电话（部分命中列），具体值在第二行断言
    expect(first?.description).toBe('')
    expect(first?.about.split('\n')[0]).toBe(
      'Service options: [Outdoor seating, No-contact delivery, Delivery, Onsite services, Takeout, Dine-in]'
    )
    expect(first?.timeZone).toBe('America/New_York')
    expect(first?.price).toBe('$1–10')
    expect(first?.note).toBe('')
    expect(first?.amenities).toBe('')
    expect(first?.hotelClass).toBe('')
    expect(first?.phone).toBe('')
    expect(first?.phones).toBe('')
    expect(first?.claimed).toBe('YES')
    expect(first?.owner).toBe('Gold coffee (Owner)')
    expect(first?.ownerId).toBe('116200377115211769459')
    expect(first?.reviewUrl).toBe(
      'https://search.google.com/local/reviews?placeid=ChIJm-xEoHxZwokRTStZFhfbrKA&q=coffee+in+manhattan&authuser=0&hl=en&gl=US'
    )
    expect(first?.domain).toBe('service-page-help.web.app')
    expect((first?.openingHours.split('\n') ?? [])[0]).toBe('Friday(2026-08-28): [06:45-01:00]')
    expect(first?.featuredImage.startsWith('https://lh3.googleusercontent.com/')).toBe(true)
    expect(first?.kgmid).toBe('/g/11kqkzz1cl')
  })

  it('格式 A 第二行（GRIND）电话列与价位档精确值', () => {
    const [, second] = parseSearchRpcResponse(
      readGolden('format-A-direct-nav-20places.txt'),
      defaultSchema()
    ).rows
    expect(second?.phone).toBe('(646) 755-8073')
    expect(second?.phones).toBe('(646) 755-8073, +1 646-755-8073')
    expect(second?.price).toBe('$10–20')
  })
})

describe('cid 衍生（fid 第二段 hex 转十进制）', () => {
  it('标准 0x 前缀 fid', () => {
    expect(deriveCidFromFid('0x89c258e4c2066753:0x64f50a662bfb26d7')).toBe(
      '7274732207027726039'
    )
  })

  it('无 0x 前缀的第二段按 hex 处理', () => {
    expect(deriveCidFromFid('0xabc:ff')).toBe('255')
  })

  it('缺失或非法 fid 返回空串', () => {
    expect(deriveCidFromFid('')).toBe('')
    expect(deriveCidFromFid('no-colon')).toBe('')
    expect(deriveCidFromFid('0xabc:zzzz')).toBe('')
  })
})

describe('去重（Cid+Name，缺失时 PlaceId+Name 兜底）', () => {
  function makeRow(partial: Partial<MapsPlaceRow>): MapsPlaceRow {
    return {
      name: 'Cafe',
      categories: [],
      fullAddress: '',
      street: '',
      municipality: '',
      description: '',
      about: '',
      timeZone: '',
      price: '',
      note: '',
      amenities: '',
      hotelClass: '',
      phone: '',
      phones: '',
      claimed: '',
      owner: '',
      ownerId: '',
      reviewUrl: '',
      rating: '',
      reviewCount: '',
      latitude: '',
      longitude: '',
      website: '',
      domain: '',
      openingHours: '',
      featuredImage: '',
      cid: '',
      fid: '',
      placeId: '',
      kgmid: '',
      email: '',
      socialMedias: '',
      ...partial
    }
  }

  it('滚动重复批：相同 Cid+Name 的行被丢弃', () => {
    const seen = new Set<string>()
    const batch1 = [makeRow({ cid: '1', placeId: 'p1' }), makeRow({ cid: '2', placeId: 'p2' })]

    expect(filterNewRows(batch1, seen)).toHaveLength(2)
    expect(filterNewRows(batch1, seen)).toHaveLength(0)
  })

  it('cid 相同但 name 不同视为两条；cid 缺失退化为 PlaceId+Name', () => {
    const seen = new Set<string>()
    const fresh = filterNewRows(
      [makeRow({ cid: '9', name: 'A' }), makeRow({ cid: '9', name: 'B' }), makeRow({ placeId: 'p' })],
      seen
    )

    expect(fresh).toHaveLength(3)
    expect(buildRowDedupeKey(makeRow({ cid: '' }))).toBe('|Cafe')
  })
})

describe('V1 旧形态与 schema 行为', () => {
  /** 构造稀疏详情数组（只填用到的下标），返回其浅拷贝。 */
  function makeDetail(name: string, fid: string): JsonValue[] {
    const detail: JsonValue[] = []
    detail[10] = fid
    detail[11] = name
    detail[13] = ['Coffee shop']
    detail[9] = [null, null, 40.5, -73.5]
    detail[4] = [null, null, null, null, null, null, null, 4.2, 33]
    detail[39] = '1 Test St, New York, NY 10001'
    detail[78] = `place_${name}`
    detail[178] = [[null]]
    detail[178] = [['(212) 555-0000']]
    return detail
  }

  /** 构造根数组：长度 9，data[0]=关键词段，data[len-8]=V2 列表。 */
  function buildRootV2(details: JsonValue[][]): JsonValue[] {
    const root: JsonValue[] = new Array(9)
    root[0] = ['coffee in manhattan']
    root[1] = details.map(detail => [`key_${detail[11]}`, detail])
    return root
  }

  function wrapFormatB(root: JsonValue[]): string {
    const envelope = JSON.stringify({ c: 0, d: `)]}'\n${JSON.stringify(root)}` })
    return `${envelope}/*""*/`
  }

  function wrapFormatA(root: JsonValue[]): string {
    return `)]}'\n${JSON.stringify(root)}`
  }

  it('schema 下标变更（远程覆盖模拟）直接生效', () => {
    const schema = defaultSchema()
    const detail = makeDetail('Original', '0xa:10')
    detail[12] = 'Renamed By Override'
    const overridden: MapsParseSchemaConfig = {
      ...schema,
      fields: { ...schema.fields, name: [12] }
    }

    const result = parseSearchRpcResponse(wrapFormatB(buildRootV2([detail])), overridden)
    expect(result.rows[0]?.name).toBe('Renamed By Override')
  })

  it('V1 形态：V2 定位失败时退回 data[0][1] 行数组取行内固定下标', () => {
    const detail = makeDetail('V1 Place', '0xb:11')
    const row: JsonValue[] = new Array(16)
    row[14] = detail
    const rows: JsonValue[] = [row]
    const root: JsonValue[] = new Array(9)
    root[0] = [null, rows] // v1ListPath `[0][1]` 命中行数组
    root[1] = null // V2 定位点故意非法，触发 V1 分支

    const result = parseSearchRpcResponse(wrapFormatA(root), defaultSchema())
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]?.name).toBe('V1 Place')
    expect(result.rows[0]?.cid).toBe('17')
  })

  it('字段路径缺失容错：整段缺失解析为空值而非抛错', () => {
    const result = parseSearchRpcResponse(
      wrapFormatB(buildRootV2([[]])),
      defaultSchema()
    )
    const row = result.rows[0]
    expect(row?.name).toBe('')
    expect(row?.cid).toBe('')
    expect(row?.categories).toEqual([])
  })

  it('非法 listLocator 与禁用格式分支抛三要素错误', () => {
    expect(() => parseListLocator('len-x')).toThrow(/\[MapsParser\] listLocator 非法/)
    expect(() =>
      parseSearchRpcResponse(wrapFormatB(buildRootV2([])), {
        ...defaultSchema(),
        formatBSpaXhrEnabled: false
      })
    ).toThrow(/formatBSpaXhrEnabled 已禁用/)
    expect(() =>
      parseSearchRpcResponse(")]}'\n[]", {
        ...defaultSchema(),
        formatADirectNavEnabled: false
      })
    ).toThrow(/formatADirectNavEnabled 已禁用/)
    expect(() => parseSearchRpcResponse('not-a-maps-response', defaultSchema())).toThrow(
      /也非格式 B/
    )
  })

  it('路径模板编译', () => {
    expect(compileSchemaPath('[i][1]', 3)).toEqual([3, 1])
    expect(compileSchemaPath('[0][0]', 0)).toEqual([0, 0])
    expect(parseListLocator('len-8')).toBe(8)
  })
})

describe('V2 列表异形项容错（真实 e2e 回归）', () => {
  /** 构造仅含商家名下标的最小详情数组（其余下标留空,字段按缺失容错为空）。 */
  const detail = (name: string): JsonValue[] => {
    const node: JsonValue[] = new Array(120).fill(null)
    node[11] = name
    return node
  }

  it('批次混入异形项（第 2 元素非数组）时仅剔除该项，合法项照常解析', () => {
    // 2026-09-02 真实 e2e 实测:偶发 21 项批次(如末位混入推广/哨兵异形项)
    // 曾使 every 全有或全无判定整批判死、采集归零
    const validItems = Array.from(
      { length: 20 },
      (_, index) => ['key' + index, detail('shop ' + index)] as JsonValue
    )
    const malformedItems = [['promo', null] as JsonValue, 'sentinel' as JsonValue]
    const root: JsonValue[] = new Array(72).fill(null)
    root[0] = ['synthetic']
    root[64] = [...validItems, ...malformedItems]
    const raw = ")]}'\n" + JSON.stringify(root)

    const result = parseSearchRpcResponse(raw, defaultSchema())

    expect(result.format).toBe('A')
    expect(result.rows).toHaveLength(20)
    expect(result.rows[0]?.name).toBe('shop 0')
    expect(result.rows.map(row => row.name)).not.toContain('')
  })

  it('全部为异形项时仍抛列表定位错误（协议漂移可见不降级）', () => {
    const root: JsonValue[] = new Array(72).fill(null)
    root[0] = ['synthetic']
    root[64] = [['promo', null] as JsonValue]
    const raw = ")]}'\n" + JSON.stringify(root)

    expect(() => parseSearchRpcResponse(raw, defaultSchema())).toThrow(/商家列表定位失败/)
  })
})
