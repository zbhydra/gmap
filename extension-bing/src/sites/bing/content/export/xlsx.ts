/**
 * Bing 导出 XLSX 构建（SheetJS，依赖已有）。
 *
 * 013 域簿记口径：aoa_to_sheet 首行列名、单元格全部文本化（防长数字与高精度
 * 坐标被 Excel 数值化丢精度）。免费档末行提示与 CSV 同源，追加为首列文本行。
 */

import * as XLSX from 'xlsx'
import { BING_EXPORT_COLUMNS, type BingExportRow } from '../parser'
import { getFreeLimitNote } from './csvText'

/** 工作表名（竞品 json_to_sheet 默认 Sheet1，调研 §8）。 */
const SHEET_NAME = 'Sheet1'

/**
 * 构建完整 XLSX 工作簿字节（18 列表头 + 数据行 [+ 免费档末行提示]）。
 *
 * @param rows 导出行。
 * @param includeFreeNote 是否追加免费档末行提示（免费档恒 true，Pro 不追加）。
 */
export function buildBingXlsx(
  rows: readonly BingExportRow[],
  includeFreeNote: boolean
): Uint8Array {
  const rowsAoa: string[][] = rows.map(row =>
    BING_EXPORT_COLUMNS.map(column => cellText(row[column.key]))
  )
  if (includeFreeNote) {
    rowsAoa.push([getFreeLimitNote()])
  }
  const sheet = XLSX.utils.aoa_to_sheet<string>([
    BING_EXPORT_COLUMNS.map(column => column.header),
    ...rowsAoa
  ])
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, SHEET_NAME)
  // SheetJS write 的返回类型未随 type 参数收窄（库类型为弱签名），xlsx/array
  // 形态恒为 ArrayBuffer，这里显式收窄
  return new Uint8Array(XLSX.write(book, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer)
}

/** 行列值文本化：null 写空串，数值走 String（不参与 Excel 数值化）。 */
function cellText(value: string | number | null): string {
  return value === null ? '' : String(value)
}
