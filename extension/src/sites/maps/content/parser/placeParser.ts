/**
 * 商家列表行解析器（V1/V2 双形态 + schema 驱动字段下标 + cid 衍生）。
 *
 * 列表定位（013 逆向 03 §3.1，实测 20/20 命中）：
 * - V2（现行）：根数组倒数第 8 个元素是列表，每项 `[key, detail]`，详情在 `[1]`；
 * - V1（旧）：根数组 `[0][1]` 是行数组，每行第 15 个元素（下标 14）才是详情。
 *
 * 字段下标全部由远程配置 parseSchema.fields 驱动，Google 改版改配置即生效。
 */

import type { MapsParseSchemaConfig } from '../../config/contract'
import type { JsonValue } from '@/core/rpc/types'
import { compileSchemaPath, getValueAt, parseListLocator } from './path'
import type { MapsPlaceRow, MapsRpcParseResult } from './types'
import { unwrapRpcPayload } from './shell'

/** 完整地址超长置空阈值（A5 规则：防脏数据）。 */
const MAX_ADDRESS_LENGTH = 200

/**
 * About 项名在项对象内的下标路径（逆向 03/04 文档化的协议内部结构：
 * `item[2][1][0][1]`，含否定形态如 "No delivery"；黄金样本双格式 1291 项
 * 逐一勘验）。分组名/项列表的组内下标（[1]/[2]）与营业时间日条目内部
 * 下标同理为协议常量，改版随整个列的解析规则一并调整。
 */
const ABOUT_ITEM_NAME_PATH: readonly number[] = [2, 1, 0, 1]

/**
 * 解析一次搜索 RPC 响应为商家行集合（未去重）。
 *
 * @param raw 完整响应文本（injected 转发）。
 * @param schema 远程配置驱动解析 schema。
 * @returns 关键词 + 本批商家行 + 命中格式。
 * @throws 剥壳失败、列表定位失败（V1/V2 均未命中）时抛三要素错误（失败可见）。
 */
export function parseSearchRpcResponse(
  raw: string,
  schema: MapsParseSchemaConfig
): MapsRpcParseResult {
  const { format, data } = unwrapRpcPayload(raw, schema)

  const query = jsonToText(getValueAt(data, compileSchemaPath(schema.queryPath, 0)))
  const details = locateDetailArrays(data, schema)

  return { query, rows: details.map(detail => parsePlaceRow(detail, schema)), format }
}

/** 从商家详情数组解析单行（schema 下标 + 清洗规则，逐列对照 A5/逆向 04）。 */
export function parsePlaceRow(
  detail: readonly JsonValue[],
  schema: MapsParseSchemaConfig
): MapsPlaceRow {
  const fields = schema.fields
  const fid = extractText(detail, fields.fid)

  return {
    name: extractText(detail, fields.name),
    categories: extractTextList(detail, fields.categories),
    fullAddress: sanitizeAddress(extractText(detail, fields.fullAddress)),
    street: joinTextList(extractTextList(detail, fields.street), ', '),
    municipality: joinTextList(extractTextList(detail, fields.municipality), ', '),
    description: extractDescription(detail, fields.description, fields.descriptionExtra),
    about: formatAboutGroups(getValueAt(detail, fields.about)),
    timeZone: extractText(detail, fields.timeZone),
    price: orElseText(extractText(detail, fields.price), extractText(detail, fields.priceFallback)),
    note: extractText(detail, fields.note),
    amenities: joinTextList(
      extractItemListTexts(detail, fields.amenities, schema.amenitiesItemNameIndex),
      ','
    ),
    hotelClass: extractText(detail, fields.hotelClass),
    phone: extractText(detail, fields.phone),
    phones: joinTextList(
      extractItemListTexts(detail, fields.phones, schema.phonesItemTextIndex),
      ', '
    ),
    claimed: extractClaimed(detail, fields.claimed, schema.claimedUnclaimedMarker),
    owner: extractText(detail, fields.owner),
    ownerId: extractText(detail, fields.ownerId),
    reviewUrl: sanitizeHttpsUrl(extractText(detail, fields.reviewUrl)),
    rating: extractNumberText(detail, fields.rating),
    reviewCount: extractNumberText(detail, fields.reviewsCount),
    latitude: extractNumberText(detail, fields.lat),
    longitude: extractNumberText(detail, fields.lng),
    website: sanitizeWebsite(extractText(detail, fields.website)),
    domain: extractText(detail, fields.domain),
    openingHours: formatOpeningHours(
      getValueAt(detail, fields.openingHours),
      schema.openingHoursClosedFlagIndex,
      schema.openingHoursClosedFlagValue
    ),
    featuredImage: sanitizeWebsite(extractText(detail, fields.featuredImage)),
    cid: deriveCidFromFid(fid),
    fid,
    placeId: extractText(detail, fields.placeId),
    kgmid: extractText(detail, fields.kgmid),
    // Email/Social Medias 的数据源在服务端（013 A4，U8 enrich）：解析态恒空，
    // 采集完成边沿由 enrichClient 写回行对象
    email: '',
    socialMedias: ''
  }
}

/**
 * 由 fid 衍生 cid（fid 第二段 hex 转十进制；实测样本 fid 自带 `0x` 前缀）。
 *
 * @param fid 形如 `0x89c2…:0x64f5…`；缺失或非法时返回空串（容错，不中断整批解析）。
 */
export function deriveCidFromFid(fid: string): string {
  const second = fid.split(':')[1]?.trim()
  if (!second) {
    return ''
  }

  const hexLiteral = /^(?:0[xX])?([0-9a-fA-F]+)$/.exec(second)
  if (!hexLiteral) {
    return ''
  }

  try {
    return BigInt(`0x${hexLiteral[1]}`).toString(10)
  } catch {
    return ''
  }
}

/**
 * 在根大数组中定位商家详情数组集合：先试 V2（len-N + [i][1]），不命中再退 V1。
 *
 * @throws 两种形态均未命中时抛错（协议漂移必须可见）。
 */
function locateDetailArrays(
  data: readonly JsonValue[],
  schema: MapsParseSchemaConfig
): JsonValue[][] {
  const offsetFromEnd = parseListLocator(schema.listLocator)
  const listNode = data[data.length - offsetFromEnd]

  if (Array.isArray(listNode)) {
    const v2Items = filterV2Items(listNode)
    if (v2Items !== null) {
      // detailPath（如 `[i][1]`）相对列表根：i 为列表项索引占位，逐项编译取详情
      return v2Items.map((_item, index) => {
        const detail = getValueAt(v2Items, compileSchemaPath(schema.detailPath, index))
        return Array.isArray(detail) ? detail : []
      })
    }
  }

  const v1Rows = locateV1Rows(data, schema)
  if (v1Rows) {
    return v1Rows
  }

  throw new Error(
    `[MapsParser] 商家列表定位失败: listLocator=${schema.listLocator}, rootLen=${data.length}, ` +
      `listNodeType=${describeNode(listNode)}`
  )
}

/**
 * V2 形态项过滤：合法项形如 `[key, detail]`（第 2 个元素是详情数组）。
 * 真实批次偶发在末位混入非商家异形项（2026-09-02 真实 e2e 实测 21 项批次，
 * 异形项使 `every` 全有或全无判定整批判死、采集归零）——只剔除异形项，
 * 保留合法项继续解析（容错轴：局部可失败）；全异形才视为未命中。
 */
function filterV2Items(listNode: readonly JsonValue[]): JsonValue[][] | null {
  const items = listNode.filter(
    (item): item is JsonValue[] => Array.isArray(item) && item.length >= 2 && Array.isArray(item[1])
  )
  return items.length > 0 ? items : null
}

/** V1 形态定位：根数组 `[0][1]` 行数组，每行固定下标取详情；不命中返回 null。 */
function locateV1Rows(
  data: readonly JsonValue[],
  schema: MapsParseSchemaConfig
): JsonValue[][] | null {
  const rowsPath = compileSchemaPath(schema.v1ListPath, 0)
  const rows = getValueAt(data, rowsPath)
  if (!Array.isArray(rows) || rows.length === 0) {
    return null
  }

  const detailIndex = schema.v1DetailIndex
  const hasDetailEveryRow = rows.every(row => {
    return Array.isArray(row) && Array.isArray(row[detailIndex])
  })
  if (!hasDetailEveryRow) {
    return null
  }

  return rows.map(row => {
    const detail = (row as readonly JsonValue[])[detailIndex]
    return Array.isArray(detail) ? (detail as JsonValue[]) : []
  })
}

/** 文本取值：字符串原样；数值/布尔转字符串；其余（缺失/嵌套结构）为空串。 */
function extractText(node: readonly JsonValue[] | undefined, path: readonly number[]): string {
  return jsonToText(getValueAt(node, path))
}

/** 列表取值：目标位置是数组时逐项转文本并过滤空串，否则空数组。 */
function extractTextList(
  node: readonly JsonValue[] | undefined,
  path: readonly number[]
): string[] {
  const value = getValueAt(node, path)
  if (!Array.isArray(value)) {
    return []
  }
  return value.map(jsonToText).filter(text => text.length > 0)
}

/** 数值取值：仅有限数值转字符串（竞品 NaN→'' 语义），其余空串。 */
function extractNumberText(
  node: readonly JsonValue[] | undefined,
  path: readonly number[]
): string {
  const value = getValueAt(node, path)
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
}

/**
 * 「主路径 or 回退路径」文本取值（竞品 Price `a[35][9] 或 a[4][2]` 语义）。
 */
function orElseText(primary: string, fallback: string): string {
  return primary.length > 0 ? primary : fallback
}

/** 列表逐项转文本后按分隔符拼接。 */
function joinTextList(texts: readonly string[], separator: string): string {
  return texts.join(separator)
}

/**
 * 「结构化项列表」取文本：目标位置是数组、每项内嵌套一层，取项内固定下标
 * 的文本（如 Phones `a[178][0][1][*][0]`、Amenities 项名 `[2]`）。
 */
function extractItemListTexts(
  node: readonly JsonValue[] | undefined,
  path: readonly number[],
  itemTextIndex: number
): string[] {
  const value = getValueAt(node, path)
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map(item => jsonToText(Array.isArray(item) ? item[itemTextIndex] : undefined))
    .filter(text => text.length > 0)
}

/** 认领状态：claimed 源 URL 含未认领标记 → NO（未认领），否则 YES。 */
function extractClaimed(
  node: readonly JsonValue[] | undefined,
  path: readonly number[],
  unclaimedMarker: string
): string {
  return extractText(node, path).includes(unclaimedMarker) ? 'NO' : 'YES'
}

/**
 * 商家简介：主文本与附加段拼接（逆向 04：`a[32][1][1]` + 附加段数组逐行
 * join），空段跳过；两段皆空为空串。
 */
function extractDescription(
  node: readonly JsonValue[] | undefined,
  mainPath: readonly number[],
  extraPath: readonly number[]
): string {
  const main = extractText(node, mainPath)
  const extraNode = getValueAt(node, extraPath)
  const extra = Array.isArray(extraNode)
    ? extraNode
        .map(jsonToText)
        .filter(text => text.length > 0)
        .join('\n')
    : jsonToText(extraNode)
  return [main, extra].filter(text => text.length > 0).join('\n')
}

/**
 * About 分组解析（逆向 03/04）：节点为分组数组，每组 `[1]` 是组名、`[2]` 是
 * 项列表，项名在项内 ABOUT_ITEM_NAME_PATH；输出 `组名: [项, 项]`，组间换行，
 * 空组跳过。
 */
function formatAboutGroups(groups: JsonValue | undefined): string {
  if (!Array.isArray(groups)) {
    return ''
  }
  const lines: string[] = []
  for (const group of groups) {
    if (!Array.isArray(group)) {
      continue
    }
    const groupName = jsonToText(group[1])
    const itemNodes = Array.isArray(group[2]) ? group[2] : []
    const items = itemNodes
      .map(item => jsonToText(getValueAt(item, ABOUT_ITEM_NAME_PATH)))
      .filter(text => text.length > 0)
    if (groupName.length > 0 && items.length > 0) {
      lines.push(`${groupName}: [${items.join(', ')}]`)
    }
  }
  return lines.join('\n')
}

/**
 * 营业时间结构化解析（逆向 04）：日条目 `[0]` 周几、`[2]` 日期 `[y,m,d]`
 * （m/d 为 1-based 原值直接补零）、`[3]` 时段数组；时段 `[1]` 是时刻元组
 * 数组（`[h]` 或 `[h,m]`），输出 `周几(YYYY-MM-DD): [HH:mm-HH:mm, …]`，
 * 日间换行；休业标记命中时输出 `周几(YYYY-MM-DD): Closed`。
 */
function formatOpeningHours(
  days: JsonValue | undefined,
  closedFlagIndex: number,
  closedFlagValue: number
): string {
  if (!Array.isArray(days)) {
    return ''
  }
  const lines: string[] = []
  for (const entry of days) {
    if (!Array.isArray(entry)) {
      continue
    }
    const dayName = jsonToText(entry[0])
    const dateNode = entry[2]
    const date = Array.isArray(dateNode)
      ? [dateNode[0], dateNode[1], dateNode[2]]
          .map(part => (typeof part === 'number' ? pad2(part) : ''))
          .join('-')
      : ''
    if (entry[closedFlagIndex] === closedFlagValue) {
      lines.push(`${dayName}(${date}): Closed`)
      continue
    }
    const segmentNodes = Array.isArray(entry[3]) ? entry[3] : []
    const segments = segmentNodes
      .map(segment => formatTimeRange(Array.isArray(segment) ? segment[1] : undefined))
      .filter(text => text.length > 0)
    if (dayName.length > 0) {
      lines.push(`${dayName}(${date}): [${segments.join(', ')}]`)
    }
  }
  return lines.join('\n')
}

/** 时段格式化：时刻元组数组（`[[7],[18]]`）→ `07:00-18:00`；无有效时刻为空。 */
function formatTimeRange(times: JsonValue | undefined): string {
  if (!Array.isArray(times)) {
    return ''
  }
  const parts = times
    .map(tuple => {
      if (!Array.isArray(tuple) || typeof tuple[0] !== 'number') {
        return ''
      }
      const minute = typeof tuple[1] === 'number' ? tuple[1] : 0
      return `${pad2(tuple[0])}:${pad2(minute)}`
    })
    .filter(text => text.length > 0)
  return parts.join('-')
}

/** 两位补零（时刻/日期段）。 */
function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/** 单值转文本。 */
function jsonToText(value: JsonValue | undefined): string {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

/** URL 清洗（官网/封面图）：不含 http(s) 的脏值置空（03 逆向 parseDetails 规则）。 */
function sanitizeWebsite(website: string): string {
  return website.includes('http://') || website.includes('https://') ? website : ''
}

/** 评论页链接清洗（04：非 https 置空）。 */
function sanitizeHttpsUrl(url: string): string {
  return url.includes('https://') ? url : ''
}

/** 地址清洗：超 200 字符置空（A5 规则）。 */
function sanitizeAddress(address: string): string {
  return address.length > MAX_ADDRESS_LENGTH ? '' : address
}

/** 错误消息里对节点类型的简短描述。 */
function describeNode(node: JsonValue | undefined): string {
  if (Array.isArray(node)) {
    return `array(len=${node.length})`
  }
  if (node === null || node === undefined) {
    return 'null'
  }
  return typeof node
}
