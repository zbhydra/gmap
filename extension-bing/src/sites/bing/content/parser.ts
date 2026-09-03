/**
 * Bing Maps data-entity 解析器。
 *
 * 输入：列表项元素（其 `data-entity` 属性承载可能双重 JSON.stringify 的结构化
 * 商家对象，结构见竞品调研 §4.1 与 golden-samples/data-entity-samples.json）。
 * 输出：18 列导出行（列名与顺序以 references/golden-samples/export.csv 表头为
 * 唯一基线，映射合同见 T1 §3）。
 *
 * 解析流程：
 *   data-entity 属性 → 逐层 JSON.parse（最多 3 层，实测 1~2 层）→ 形状校验
 *   → 18 列映射（结构化字段优先）→ infoboxHtml 星级 / .opHours DOM 兜底。
 *
 * 失败语义：单条解析失败抛 BingParseError 由采集循环按单条记败，绝不静默吞、
 * 也绝不中断整页采集。
 */

import { DEFAULT_BING_CONFIG, type BingParseConfig } from '@/sites/bing/config/contract'

/**
 * 18 列导出契约：header 与行字段 key 按列序一一对应。
 * header 逐列基线 = docs/feat/016.Bing插件/references/golden-samples/export.csv。
 */
export const BING_EXPORT_COLUMNS = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'address', header: 'Address' },
  { key: 'featuredImage', header: 'Featured image' },
  { key: 'bingMapsUrl', header: 'Bing Maps URL' },
  { key: 'latitude', header: 'Latitude' },
  { key: 'longitude', header: 'Longitude' },
  { key: 'rating', header: 'Rating' },
  { key: 'ratingInfo', header: 'Rating Info' },
  { key: 'category', header: 'Category' },
  { key: 'openHours', header: 'Open Hours' },
  { key: 'website', header: 'Website' },
  { key: 'phone', header: 'Phone' },
  { key: 'emails', header: 'Emails' },
  { key: 'socialMedias', header: 'Social Medias' },
  { key: 'facebook', header: 'Facebook' },
  { key: 'instagram', header: 'Instagram' },
  { key: 'twitter', header: 'Twitter' }
] as const

/** 18 列行字段 key（列序与 BING_EXPORT_COLUMNS 一致）。 */
export type BingColumnKey = (typeof BING_EXPORT_COLUMNS)[number]['key']

/** 18 列导出行。坐标/评分为 null 表示源数据缺失，导出层写空串。 */
export interface BingExportRow {
  /** entity.id（`ypid:YN…`，行去重键，调研 §4.2）。 */
  id: string
  /** entity.title。 */
  name: string
  /** entity.address。 */
  address: string
  /** entity.imageUrl。 */
  featuredImage: string
  /** 本地拼接的 Bing Maps 详情链接（调研 §4.2 `cp={lat}~{lon}&lvl=16.0&q={title, address}`）。 */
  bingMapsUrl: string
  /** routablePoint.latitude。 */
  latitude: number | null
  /** routablePoint.longitude。 */
  longitude: number | null
  /** 评分（结构化 entity.ratingValue 优先，infoboxHtml 星级图兜底）。 */
  rating: number | null
  /** 评分来源信息（结构化 ratingSourceName+ratingCount 优先，infobox 文本兜底；竞品导出形态如 "Yelp (76)"）。 */
  ratingInfo: string
  /** entity.primaryCategoryName。 */
  category: string
  /** 营业时间（entity.openHoursText 优先，条目 DOM .opHours 兜底）。 */
  openHours: string
  /** entity.website。 */
  website: string
  /** entity.phone。 */
  phone: string
  /** 邮箱（云端挖掘列，一期免费档占位）。 */
  emails: string
  /** 社媒聚合（云端挖掘列，一期免费档占位）。 */
  socialMedias: string
  /** Facebook（云端挖掘列，一期免费档占位）。 */
  facebook: string
  /** Instagram（云端挖掘列，一期免费档占位）。 */
  instagram: string
  /** Twitter（云端挖掘列，一期免费档占位）。 */
  twitter: string
}

/** 免费（非 Pro）账号在云端挖掘列的占位符（调研 §5：免费行填 `###PRO###`，Pro 行留空）。 */
export const PRO_ENHANCEMENT_PLACEHOLDER = '###PRO###'

/** data-entity 属性可嵌套 JSON 字符串的最大层数（实测 1~2 层，留 1 层余量）。 */
const MAX_JSON_LAYERS = 3

/** Bing Maps 详情链接基座与层级参数（调研 §4.2）。 */
const BING_MAPS_URL_BASE = 'https://www.bing.com/maps'
const BING_MAPS_URL_LEVEL = '16.0'
/** q 参数里 title 与 address 的连接符（黄金样本实测为「空格 逗号 空格」）。 */
const MAPS_URL_QUERY_SEPARATOR = ' , '

/** infoboxHtml 气泡内星级图容器（调研 §4.1 `.infoBoxLink .bm_ib_ratings span.csrc > span`）。 */
const INFOBOX_STAR_SELECTOR = '.infoBoxLink .bm_ib_ratings span.csrc'
/** 星级图类语义：满星 / 半星 / 终止标记（调研 §4.1）。 */
const STAR_FULL_CLASS = 'sw_st'
const STAR_HALF_CLASS = 'sw_sth'
/** 命中即终止计数，其后星形不计入。 */
const STAR_TERMINATOR_CLASS = 'sw_ste'
/** 条目 DOM 营业时间兜底节点（T1 §3）。 */
const OPEN_HOURS_FALLBACK_SELECTOR = '.opHours'

/** 单条 data-entity 解析失败（属性缺失/JSON 非法/形状不符/缺 entity.id）。 */
export class BingParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BingParseError'
  }
}

/**
 * 解析单个列表项为 18 列导出行。
 *
 * @param item 含 data-entity 属性的列表项元素（营业时间 DOM 兜底也在其内查找）。
 * @param parse 解析契约组（默认包内值；采集循环应传当前生效配置）。
 * @throws BingParseError 属性缺失、JSON 解析失败、形状不符或缺 entity.id 时。
 */
export function parseBingRow(
  item: Element,
  parse: BingParseConfig = DEFAULT_BING_CONFIG.parse
): BingExportRow {
  const attrName = parse.dataEntityAttr
  const rawAttr = item.getAttribute(attrName)
  if (!rawAttr) {
    throw new BingParseError(`[BingParser] 列表项缺少 ${attrName} 属性: ${describeItem(item)}`)
  }

  const payload = unwrapDataEntity(rawAttr, attrName)
  const entity = readObjectMember(payload, 'entity')
  if (!entity) {
    throw new BingParseError(
      `[BingParser] ${attrName} 顶层缺少 entity 对象: ${describeRaw(rawAttr)}`
    )
  }

  const id = readStringMember(entity, 'id')
  if (!id) {
    // id 是去重键与导出主键，缺失即该条不可用
    throw new BingParseError(`[BingParser] entity.id 缺失或为空: ${describeRaw(rawAttr)}`)
  }

  const name = readStringMember(entity, 'title')
  const address = readStringMember(entity, 'address')
  const routablePoint = readObjectMember(payload, 'routablePoint')
  const latitude = readFiniteNumberMember(routablePoint, 'latitude')
  const longitude = readFiniteNumberMember(routablePoint, 'longitude')

  const { rating, ratingInfo } = resolveRating(entity, parse)

  let openHours = readStringMember(entity, 'openHoursText')
  if (!openHours) {
    openHours = item.querySelector(OPEN_HOURS_FALLBACK_SELECTOR)?.textContent?.trim() ?? ''
  }

  return {
    id,
    name,
    address,
    featuredImage: readStringMember(entity, 'imageUrl'),
    bingMapsUrl: buildBingMapsUrl(latitude, longitude, name, address),
    latitude,
    longitude,
    rating,
    ratingInfo,
    category: readStringMember(entity, 'primaryCategoryName'),
    openHours,
    website: readStringMember(entity, 'website'),
    phone: readStringMember(entity, 'phone'),
    // 云端挖掘列：一期免费档统一占位，Pro 留空与回填在二期接入（T1 §3）
    emails: PRO_ENHANCEMENT_PLACEHOLDER,
    socialMedias: PRO_ENHANCEMENT_PLACEHOLDER,
    facebook: PRO_ENHANCEMENT_PLACEHOLDER,
    instagram: PRO_ENHANCEMENT_PLACEHOLDER,
    twitter: PRO_ENHANCEMENT_PLACEHOLDER
  }
}

/** 逐层 JSON.parse 解开 data-entity（可能被双重 stringify，竞品调研 §4.1）。 */
function unwrapDataEntity(raw: string, attrName: string): Record<string, unknown> {
  let value: unknown = raw
  try {
    for (let layer = 0; layer < MAX_JSON_LAYERS && typeof value === 'string'; layer++) {
      value = JSON.parse(value)
    }
  } catch (error) {
    console.error('[BingParser] data-entity JSON 解析失败:', error)
    const reason = error instanceof Error ? error.message : String(error)
    throw new BingParseError(
      `[BingParser] ${attrName} JSON 解析失败(最多 ${MAX_JSON_LAYERS} 层): ${describeRaw(raw)}（原始错误: ${reason}）`
    )
  }

  if (!isPlainObject(value)) {
    throw new BingParseError(
      `[BingParser] ${attrName} 解开 ${MAX_JSON_LAYERS} 层后不是 JSON 对象: ${describeRaw(raw)}`
    )
  }
  return value
}

/** 评分来源开关裁决：结构化 ratingValue/ratingSourceName 优先，infoboxHtml 星级图/文本兜底。 */
function resolveRating(
  entity: Record<string, unknown>,
  parse: BingParseConfig
): { rating: number | null; ratingInfo: string } {
  let rating: number | null = null
  let ratingInfo = ''

  if (parse.ratingFromEntityEnabled) {
    rating = readFiniteNumberMember(entity, 'ratingValue')
    ratingInfo = composeRatingInfo(entity)
  }

  if ((rating === null || ratingInfo === '') && parse.ratingInfoboxFallbackEnabled) {
    const fallback = parseInfoboxRating(readStringMember(entity, 'infoboxHtml'))
    if (rating === null) {
      rating = fallback.rating
    }
    if (ratingInfo === '') {
      ratingInfo = fallback.ratingInfo
    }
  }

  return { rating, ratingInfo }
}

/** 结构化 Rating Info = 来源名 + 评分条数（黄金样本导出形态 "Yelp (76)"，调研 §11.2）。 */
function composeRatingInfo(entity: Record<string, unknown>): string {
  const sourceName = readStringMember(entity, 'ratingSourceName')
  if (!sourceName) {
    return ''
  }
  const count = readStringMember(entity, 'ratingCount')
  return count ? `${sourceName} (${count})` : sourceName
}

/**
 * infoboxHtml 气泡二次解析兜底（竞品 legacy 评分路径，调研 §4.1）。
 *
 * 星级：容器内逐个 span 计分，满星 +1、半星 +0.5、命中终止类立即停止；
 * Rating Info：星级容器之后的兄弟文本（即 " Yelp (76)" 这段来源计数）。
 */
function parseInfoboxRating(html: string): { rating: number | null; ratingInfo: string } {
  if (!html) {
    return { rating: null, ratingInfo: '' }
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const starContainer = doc.querySelector(INFOBOX_STAR_SELECTOR)
  if (!starContainer) {
    return { rating: null, ratingInfo: '' }
  }

  let score = 0
  for (const star of Array.from(starContainer.children)) {
    if (star.classList.contains(STAR_TERMINATOR_CLASS)) {
      break
    }
    if (star.classList.contains(STAR_HALF_CLASS)) {
      score += 0.5
    } else if (star.classList.contains(STAR_FULL_CLASS)) {
      score += 1
    }
  }

  const siblingText = starContainer.nextSibling?.textContent?.trim() ?? ''
  return { rating: score > 0 ? score : null, ratingInfo: siblingText }
}

/** 拼接 Bing Maps 详情链接（调研 §4.2：`cp={lat}~{lon}&lvl=16.0&q={title , address}`）。 */
function buildBingMapsUrl(
  latitude: number | null,
  longitude: number | null,
  title: string,
  address: string
): string {
  if (latitude === null || longitude === null) {
    return ''
  }
  const query = encodeURIComponent(`${title}${MAPS_URL_QUERY_SEPARATOR}${address}`)
  return `${BING_MAPS_URL_BASE}?cp=${latitude}%7E${longitude}&lvl=${BING_MAPS_URL_LEVEL}&q=${query}`
}

/** 读对象成员中的有限数值，缺失/非数值返回 null。 */
function readFiniteNumberMember(
  source: Record<string, unknown> | null,
  key: string
): number | null {
  const value = source?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** 读对象成员中的字符串，缺失/非字符串返回空串。 */
function readStringMember(source: Record<string, unknown> | null, key: string): string {
  const value = source?.[key]
  return typeof value === 'string' ? value : ''
}

/** 读对象成员中的子对象，缺失或非普通对象返回 null。 */
function readObjectMember(
  source: Record<string, unknown>,
  key: string
): Record<string, unknown> | null {
  const value = source[key]
  return isPlainObject(value) ? value : null
}

/** 判断值为普通 JSON 对象（排除数组与 null）。 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 错误消息用的条目描述（tag + class 截断）。 */
function describeItem(item: Element): string {
  const className = typeof item.className === 'string' ? item.className : ''
  const classPart = className ? ` class="${truncate(className)}"` : ''
  return `<${item.tagName.toLowerCase()}${classPart}>`
}

/** 错误消息用的属性原文片段（截断，避免整页属性刷屏）。 */
function describeRaw(raw: string): string {
  return `"${truncate(raw)}"`
}

/** 文本截断到指定长度，超出以 … 结尾。 */
function truncate(text: string, maxLength = 120): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}
