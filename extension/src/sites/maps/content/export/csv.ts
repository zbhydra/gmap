/**
 * 搜索结果 CSV 导出构建（A5 字段字典 36 列，U4）。
 *
 * 列名/列序由 columns.ts 的 SEARCH_EXPORT_COLUMNS 驱动（36 列固定顺序）；
 * 文件名 `MapsGrab-Extractor-{条数}-{关键词}-{YYYY-MM-DD}.{扩展名}`（竞品
 * `G-Maps-Extractor-…` 前缀随产品名「MapsGrab」）。CSV 采用 RFC4180：
 * CRLF 行尾、双引号转义，并加 UTF-8 BOM 保证 Excel 中文不乱码。
 */

import type { MapsPlaceRow } from '../parser'
import { buildExportRowCells, type SearchExportColumn } from './columns'
import { buildCsvText, csvDateSegment, sanitizeFilenamePart } from './csvText'

/** 导出文件名前缀（产品名「MapsGrab」的文件系统安全形态）。 */
export const CSV_FILENAME_PREFIX = 'MapsGrab-Extractor'

/**
 * 构建完整 CSV 文本（BOM + 表头 + 数据行，RFC4180 转义）。
 *
 * @param rows 导出行。
 * @param columns 生效列（已按 Pro 门控筛选）。
 */
export function buildSearchCsv(
  rows: readonly MapsPlaceRow[],
  columns: readonly SearchExportColumn[]
): string {
  return buildCsvText(
    columns.map(column => column.header),
    rows.map(row => buildExportRowCells(row, columns))
  )
}

/**
 * 构建导出文件名：`{前缀}-{条数}-{关键词}-{YYYY-MM-DD}.{扩展名}`。
 *
 * 关键词中的文件系统非法字符与控制符替换为 `-`、空格转 `+`（逆向 07
 * formatExtractData 口径「空格转 +」），空关键词置 `search`。
 *
 * @param rowCount 导出行数（按 Place Id 去重后的条数，竞品 formatExtractData 口径）。
 * @param keyword 搜索关键词（解析自 RPC 响应，非 DOM）。
 * @param now 导出时刻（本地时区日期）。
 * @param extension 文件扩展名（csv/json）。
 */
export function buildSearchExportFilename(
  rowCount: number,
  keyword: string,
  now: Date,
  extension: string
): string {
  const safeKeyword = sanitizeFilenamePart(keyword).replace(/ /g, '+')
  return `${CSV_FILENAME_PREFIX}-${rowCount}-${safeKeyword.length > 0 ? safeKeyword : 'search'}-${csvDateSegment(now)}.${extension}`
}
