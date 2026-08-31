/**
 * 搜索结果 JSON 导出构建（A8，U4）。
 *
 * 竞品口径（逆向 07）：仅保留生效列，键 = 列名驼峰化，`JSON.stringify(arr)`
 * 紧凑输出；numeric 列（评分/评论数/经纬度）在单元格可解析为有限数值时还原
 * 数值类型（值类型保持），缺失仍为空串。Cid/Fid 等超安全整数或文本列恒为
 * 字符串。
 */

import type { MapsPlaceRow } from '../parser'
import {
  buildExportJsonValue,
  buildExportRowCells,
  camelizeColumnHeader,
  type SearchExportColumn
} from './columns'

/** JSON 记录：键 = 驼峰化列名，值 = 字符串或还原后的数值。 */
export type SearchExportRecord = Record<string, string | number>

/**
 * 由导出行构建 JSON 记录数组（键序 = 列序）。
 *
 * @param rows 导出行。
 * @param columns 生效列（已按 Pro 门控筛选）。
 */
export function buildSearchJsonRecords(
  rows: readonly MapsPlaceRow[],
  columns: readonly SearchExportColumn[]
): SearchExportRecord[] {
  return rows.map(row => {
    const cells = buildExportRowCells(row, columns)
    const record: SearchExportRecord = {}
    columns.forEach((column, index) => {
      const key = camelizeColumnHeader(column.header)
      record[key] = buildExportJsonValue(cells[index], column)
    })
    return record
  })
}

/** 构建完整 JSON 文本（紧凑序列化，与竞品 JSON.stringify(arr) 一致）。 */
export function buildSearchJson(
  rows: readonly MapsPlaceRow[],
  columns: readonly SearchExportColumn[]
): string {
  return JSON.stringify(buildSearchJsonRecords(rows, columns))
}

/**
 * 通用表格式 JSON 文本（headers + 字符串单元格行，013 簿记 2）。
 *
 * 评论/照片工作页导出与搜索共用 U4 的 JSON 语义：键 = 列名驼峰化、
 * 紧凑序列化；工作页列无 numeric 还原语义，值恒为字符串。
 *
 * @param headers 列名（键由驼峰化派生）。
 * @param rows 字符串单元格行（与 headers 对齐）。
 */
export function buildTabularJsonText(
  headers: readonly string[],
  rows: readonly string[][]
): string {
  const records = rows.map(row => {
    const record: SearchExportRecord = {}
    headers.forEach((header, index) => {
      record[camelizeColumnHeader(header)] = row[index] ?? ''
    })
    return record
  })
  return JSON.stringify(records)
}
