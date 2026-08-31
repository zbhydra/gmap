/**
 * Bing 导出 CSV 文本序列化原语。
 *
 * 分隔符/行尾/BOM 来自导出契约组（contract.ts export 组，可远程覆盖）；
 * 转义规则与 013 域 csvText 同构（RFC4180：含分隔符/引号/换行的单元格加引号
 * 并双写内部引号）。行拼接不追加行尾换行（与竞品 sheet_to_csv 的 RS join 一致）。
 */

import { BING_EXPORT_COLUMNS, type BingColumnKey, type BingExportRow } from '../parser'
import type { BingExportConfig } from '@/sites/bing/config/contract'

/**
 * 免费档导出末行提示（竞品导出实测逐字抄录，调研 §3/§5；非 UI 文案，不走 i18n）。
 */
export const FREE_LIMIT_NOTE = 'Free accounts can export up to 20 data entries.'

/** 单元格值：解析行的列值（坐标为 number，缺失为 null）。 */
export type BingCsvCell = string | number | null

/** 单元格转义：命中分隔符/引号/换行即加引号并双写内部引号。 */
export function escapeCsvCell(value: BingCsvCell, delimiter: string): string {
  const text = value === null ? '' : String(value)
  if (
    text.includes(delimiter) ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r')
  ) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * 构建完整 CSV 文本（表头 + 数据行 [+ 免费档末行提示]）。
 *
 * @param rows 导出行（采集去重后的 18 列行）。
 * @param config 导出契约组（分隔符/行尾/BOM 开关）。
 * @param includeFreeNote 是否追加免费档末行提示（免费档恒 true，Pro 不追加）。
 */
export function buildBingCsv(
  rows: readonly BingExportRow[],
  config: BingExportConfig,
  includeFreeNote: boolean
): string {
  const delimiter = config.csvDelimiter
  const lines = [
    BING_EXPORT_COLUMNS.map(column => escapeCsvCell(column.header, delimiter)).join(delimiter),
    ...rows.map(row => serializeRowCells(row, delimiter))
  ]
  if (includeFreeNote) {
    lines.push(escapeCsvCell(FREE_LIMIT_NOTE, delimiter))
  }
  const body = lines.join(config.csvNewline)
  return config.csvBomEnabled ? `\uFEFF${body}` : body
}

/** 按列序序列化一行。 */
function serializeRowCells(row: BingExportRow, delimiter: string): string {
  return BING_EXPORT_COLUMNS.map(column =>
    escapeCsvCell(row[column.key as BingColumnKey], delimiter)
  ).join(delimiter)
}
