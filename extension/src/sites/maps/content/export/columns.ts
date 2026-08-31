/**
 * 搜索结果导出列 schema（A5 字段字典 36 列，U4）。
 *
 * 单一事实来源：列名/列序 = CSV 表头序 = JSON 键序（驼峰化）；12 个 Pro 列
 * 在导出层按 exportConfig.proColumnsEnabled 剔除（与竞品 generateFields 一致，
 * 免费勾选 → 生成时静默剔除）。列名、Pro 划分、衍生规则逐列对照
 * docs/feat/013.Maps插件/references/竞品逆向/04-数据字段字典.md。
 *
 * 三列中 Email / Social Medias 的数据源归 U8 enrich（服务端官网代抓，采集
 * 完成边沿写回行，未补全为空值）；Plus Code 数据源后置（列位已锁，导出恒空、
 * 不报错）。
 */

import type { MapsPlaceRow } from '../parser'
import { deriveCidFromFid } from '../parser'

/** 导出列定义。 */
export interface SearchExportColumn {
  /** 列名（CSV 表头原文；驼峰化 JSON 键由 camelizeColumnHeader 派生）。 */
  readonly header: string
  /** 是否 Pro 专属列（免费导出时剔除）。 */
  readonly pro: boolean
  /** JSON 导出时是否按数值还原类型（竞品「值类型保持」口径）。 */
  readonly numeric: boolean
  /** 从解析行取单元格值（衍生列在此现算）。 */
  readonly value: (row: MapsPlaceRow) => string
}

/** 36 列全部定义（顺序 = 导出列序，禁止调整）。 */
export const SEARCH_EXPORT_COLUMNS: readonly SearchExportColumn[] = [
  { header: 'Name', pro: false, numeric: false, value: row => row.name },
  { header: 'Description', pro: false, numeric: false, value: row => row.description },
  { header: 'Fulladdress', pro: false, numeric: false, value: row => row.fullAddress },
  { header: 'Street', pro: false, numeric: false, value: row => row.street },
  { header: 'Municipality', pro: false, numeric: false, value: row => row.municipality },
  {
    header: 'Categories',
    pro: false,
    numeric: false,
    value: row => row.categories.join(', ')
  },
  { header: 'About', pro: true, numeric: false, value: row => row.about },
  // 后置：数据源未实现，列位与 Pro 门控已锁（当前恒空）
  { header: 'Plus Code', pro: true, numeric: false, value: () => '' },
  { header: 'Time Zone', pro: false, numeric: false, value: row => row.timeZone },
  { header: 'Price', pro: true, numeric: false, value: row => row.price },
  { header: 'Note', pro: true, numeric: false, value: row => row.note },
  { header: 'Amenities', pro: false, numeric: false, value: row => row.amenities },
  { header: 'Hotel Class', pro: true, numeric: false, value: row => row.hotelClass },
  { header: 'Phone', pro: false, numeric: false, value: row => row.phone },
  { header: 'Phones', pro: false, numeric: false, value: row => row.phones },
  { header: 'Claimed', pro: false, numeric: false, value: row => row.claimed },
  { header: 'Owner', pro: true, numeric: false, value: row => row.owner },
  { header: 'Owner Id', pro: true, numeric: false, value: row => row.ownerId },
  {
    header: 'Owner Link',
    pro: true,
    numeric: false,
    // 衍生 contrib 链接（逆向 04）；ownerId 缺失置空
    value: row =>
      row.ownerId.length > 0 ? `https://www.google.com/maps/contrib/${row.ownerId}` : ''
  },
  // 数据源归 U8 enrich（服务端官网代抓，逗号分隔）；未补全/无官网为空
  { header: 'Email', pro: true, numeric: false, value: row => row.email },
  // 数据源归 U8 enrich（`平台: url` 多行）；未补全/无官网为空
  { header: 'Social Medias', pro: true, numeric: false, value: row => row.socialMedias },
  { header: 'Review Count', pro: false, numeric: true, value: row => row.reviewCount },
  { header: 'Average Rating', pro: false, numeric: true, value: row => row.rating },
  { header: 'Review URL', pro: false, numeric: false, value: row => row.reviewUrl },
  {
    header: 'Google Maps URL',
    pro: false,
    numeric: false,
    // 衍生稳定短链；cid 缺失时从 fid 重衍生，仍缺失置空
    value: row => {
      const cid = row.cid.length > 0 ? row.cid : deriveCidFromFid(row.fid)
      return cid.length > 0 ? `https://www.google.com/maps?cid=${cid}` : ''
    }
  },
  {
    header: 'Google Knowledge URL',
    pro: true,
    numeric: false,
    // 衍生 `search?kgmid=`；kgmid 缺失置空
    value: row => (row.kgmid.length > 0 ? `https://www.google.com/search?kgmid=${row.kgmid}` : '')
  },
  { header: 'Latitude', pro: false, numeric: true, value: row => row.latitude },
  { header: 'Longitude', pro: false, numeric: true, value: row => row.longitude },
  { header: 'Website', pro: false, numeric: false, value: row => row.website },
  { header: 'Domain', pro: false, numeric: false, value: row => row.domain },
  { header: 'Opening Hours', pro: false, numeric: false, value: row => row.openingHours },
  { header: 'Featured Image', pro: false, numeric: false, value: row => row.featuredImage },
  {
    header: 'Cid',
    pro: false,
    numeric: false,
    // 超出 Number.MAX_SAFE_INTEGER，所有格式均保持字符串
    value: row => (row.cid.length > 0 ? row.cid : deriveCidFromFid(row.fid))
  },
  { header: 'Fid', pro: false, numeric: false, value: row => row.fid },
  { header: 'Place Id', pro: false, numeric: false, value: row => row.placeId },
  { header: 'Kgmid', pro: true, numeric: false, value: row => row.kgmid }
]

/** 列名驼峰化（逆向 07：首词小写 + 去空格，`"Business Leads"→"businessLeads"`）。 */
export function camelizeColumnHeader(header: string): string {
  const words = header.split(/\s+/).filter(word => word.length > 0)
  if (words.length === 0) {
    return ''
  }
  return words[0].toLowerCase() + words.slice(1).join('')
}

/**
 * 导出列分组（013 U6 设置页勾选 UI 的展示元数据）。
 *
 * 分组只是 36 列的展示切分，不改变导出列序（列序恒为 SEARCH_EXPORT_COLUMNS）；
 * 各组 headers 的并集必须等于 36 列全集且不重复（单测守卫，防分组漂移）。
 * 标题走 i18n（optionsOptions.fieldGroup.<key>），列名本身是导出表头原文不翻译。
 */
export interface SearchExportColumnGroup {
  /** 分组标识（同时是 i18n key 尾段）。 */
  readonly key: string
  /** 该组包含的列 header（引用 SEARCH_EXPORT_COLUMNS 的原文）。 */
  readonly headers: readonly string[]
}

/** 36 列的语义分组：基础 6 + 地址 6 + 联系 6 + 经营 6 + 评分评论 3 + 标识关联 9。 */
export const SEARCH_EXPORT_COLUMN_GROUPS: readonly SearchExportColumnGroup[] = [
  {
    key: 'basic',
    headers: ['Name', 'Description', 'Categories', 'Time Zone', 'Claimed', 'Note']
  },
  {
    key: 'address',
    headers: ['Fulladdress', 'Street', 'Municipality', 'Latitude', 'Longitude', 'Plus Code']
  },
  {
    key: 'contact',
    headers: ['Phone', 'Phones', 'Website', 'Domain', 'Email', 'Social Medias']
  },
  {
    key: 'business',
    headers: ['Price', 'Amenities', 'Hotel Class', 'About', 'Opening Hours', 'Featured Image']
  },
  {
    key: 'reviews',
    headers: ['Review Count', 'Average Rating', 'Review URL']
  },
  {
    key: 'identifiers',
    headers: [
      'Owner',
      'Owner Id',
      'Owner Link',
      'Google Maps URL',
      'Google Knowledge URL',
      'Cid',
      'Fid',
      'Place Id',
      'Kgmid'
    ]
  }
]

/** 按门控开关取生效列：proColumnsEnabled=false 时剔除全部 Pro 列。 */
export function selectExportColumns(proColumnsEnabled: boolean): readonly SearchExportColumn[] {
  return proColumnsEnabled ? SEARCH_EXPORT_COLUMNS : SEARCH_EXPORT_COLUMNS.filter(c => !c.pro)
}

/**
 * 按门控开关 + 用户字段勾选取导出列（013 U6）。
 *
 * 过滤顺序（竞品 generateFields 语义）：先 Pro 门控剔除，再与用户勾选集
 * 取交集——免费用户勾选的 Pro 列不会因勾选而复活。enabledHeaders 缺省
 * （未初始化的设置快照场景不会发生，设置默认全选）按全选处理。
 *
 * @param proColumnsEnabled Pro 门控开关（远程 exportConfig）。
 * @param enabledHeaders 用户勾选的列 header 集合（用户设置 exportFieldHeaders）。
 */
export function selectEnabledExportColumns(
  proColumnsEnabled: boolean,
  enabledHeaders: readonly string[]
): readonly SearchExportColumn[] {
  const selected = new Set(enabledHeaders)
  return selectExportColumns(proColumnsEnabled).filter(column => selected.has(column.header))
}

/** 单行各列取值（与传入列序对齐）。 */
export function buildExportRowCells(
  row: MapsPlaceRow,
  columns: readonly SearchExportColumn[]
): string[] {
  return columns.map(column => column.value(row))
}

/** JSON 单元格取值：numeric 列可解析为有限数值时还原数值，否则保持字符串。 */
export function buildExportJsonValue(cell: string, column: SearchExportColumn): string | number {
  if (!column.numeric) {
    return cell
  }
  const parsed = Number(cell)
  return cell.length > 0 && Number.isFinite(parsed) ? parsed : cell
}
