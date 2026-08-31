/**
 * 搜索结果导出引擎（A8，U4）：formatExtractData 等价物。
 *
 * 流程（逆向 07）：Place Id 去重（先到先得）→ 按 Pro 门控取生效列 →
 * 按格式生成内容与文件名。命名 `{前缀}-{去重后条数}-{关键词}-{日期}.{扩展名}`。
 *
 * 三格式引擎层齐备：CSV（BOM + RFC4180）/ JSON（驼峰键 + 数值类型保持）/
 * XLSX（SheetJS，基线 #8 已批准）。格式与字段勾选来自用户设置（013 A9，
 * U6 options 页），经 SearchExportOptions 传入。
 */

import type { MapsPlaceRow } from '../parser'
import { selectEnabledExportColumns } from './columns'
import { buildSearchCsv, buildSearchExportFilename } from './csv'
import { buildSearchJson } from './json'
import { buildSearchXlsx } from './xlsx'

/** CSV 的 MIME 类型（downloadFile 默认值即它，显式传参保持引擎自洽）。 */
const CSV_MIME = 'text/csv'

/** JSON 的 MIME 类型。 */
const JSON_MIME = 'application/json'

/** XLSX 的 MIME 类型（OOXML 标准）。 */
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** 导出格式（与竞品 storage `export_data_format` 三值一致）。 */
export type SearchExportFormat = 'csv' | 'json' | 'xlsx'

/** 格式 → MIME 类型。 */
export function searchExportMime(format: SearchExportFormat): string {
  if (format === 'json') {
    return JSON_MIME
  }
  if (format === 'xlsx') {
    return XLSX_MIME
  }
  return CSV_MIME
}

/** 格式 → 面板按钮后缀文案（竞品「(.CSV)」形态，全大写）。 */
export function searchExportExtLabel(format: SearchExportFormat): string {
  return format.toUpperCase()
}

/** 导出产物内容：文本格式为字符串，XLSX 为二进制。 */
export type SearchExportContent = string | Uint8Array

/** 导出产物（content 侧下载所需的全量信息）。 */
export interface SearchExportArtifact {
  /** 产物格式。 */
  format: SearchExportFormat
  /** 文件内容（含 BOM 的 CSV / 紧凑 JSON 文本，或 XLSX 字节）。 */
  content: SearchExportContent
  /** 下载文件名。 */
  filename: string
  /** MIME 类型。 */
  mime: string
  /** 导出行数（Place Id 去重后）。 */
  rowCount: number
}

/** 导出入口参数。 */
export interface SearchExportOptions {
  /** 导出格式。 */
  format: SearchExportFormat
  /** Pro 门控开关（exportConfig.proColumnsEnabled）；false 时剔除 12 个 Pro 列。 */
  proColumnsEnabled: boolean
  /** 用户勾选的导出列 header 集合（用户设置 exportFieldHeaders，U6）。 */
  enabledHeaders: readonly string[]
}

/**
 * 按 Place Id 去重（先到先得，竞品 formatExtractData 规则）。
 *
 * Place Id 为空的行不参与碰撞（无键不可判定重复，全部保留）——竞品空键
 * 会相互吞并，属于其实现副作用，我方显式声明不采纳。
 */
export function dedupeRowsForExport(rows: readonly MapsPlaceRow[]): MapsPlaceRow[] {
  const seenPlaceIds = new Set<string>()
  const result: MapsPlaceRow[] = []
  for (const row of rows) {
    if (row.placeId.length === 0) {
      result.push(row)
      continue
    }
    if (seenPlaceIds.has(row.placeId)) {
      continue
    }
    seenPlaceIds.add(row.placeId)
    result.push(row)
  }
  return result
}

/**
 * 构建搜索结果导出产物。
 *
 * @param rows 采集行（未去重）。
 * @param keyword 搜索关键词（RPC 解析值）。
 * @param now 导出时刻（文件名日期段取本地时区）。
 * @param options 格式、Pro 门控开关与用户字段勾选。
 */
export function buildSearchExport(
  rows: readonly MapsPlaceRow[],
  keyword: string,
  now: Date,
  options: SearchExportOptions
): SearchExportArtifact {
  const deduped = dedupeRowsForExport(rows)
  const columns = selectEnabledExportColumns(options.proColumnsEnabled, options.enabledHeaders)
  const mime = searchExportMime(options.format)

  if (options.format === 'json') {
    return {
      format: 'json',
      content: buildSearchJson(deduped, columns),
      filename: buildSearchExportFilename(deduped.length, keyword, now, options.format),
      mime,
      rowCount: deduped.length
    }
  }

  if (options.format === 'xlsx') {
    return {
      format: 'xlsx',
      content: buildSearchXlsx(deduped, columns),
      filename: buildSearchExportFilename(deduped.length, keyword, now, options.format),
      mime,
      rowCount: deduped.length
    }
  }

  return {
    format: 'csv',
    content: buildSearchCsv(deduped, columns),
    filename: buildSearchExportFilename(deduped.length, keyword, now, options.format),
    mime,
    rowCount: deduped.length
  }
}
