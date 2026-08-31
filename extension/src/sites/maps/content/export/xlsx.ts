/**
 * 搜索结果 XLSX 导出构建（A8，U4）。
 *
 * SheetJS（xlsx，基线 #8 已批准）仅用于本文件：竞品口径（逆向 07）
 * `aoa_to_sheet` 按生效列取值成数组、列名为首行 → 工作簿字节。单元格全部
 * 文本化（与 CSV 单元格同源），避免 Cid 19 位长数字被 Excel 数值化丢精度。
 */

import * as XLSX from 'xlsx'
import type { MapsPlaceRow } from '../parser'
import { buildExportRowCells, type SearchExportColumn } from './columns'

/** 工作表名（Excel 首表默认惯例，竞品未定制）。 */
const SHEET_NAME = 'Sheet1'

/**
 * 通用表格式 XLSX 工作簿字节（headers + 字符串单元格行，013 簿记 2）。
 *
 * 评论/照片工作页导出与搜索共用 U4 的 XLSX 语义：aoa_to_sheet 首行列名、
 * 单元格全文本化（防长数字被 Excel 数值化丢精度）。
 *
 * @param headers 列名（首行表头）。
 * @param rows 字符串单元格行（与 headers 对齐）。
 * @returns xlsx 文件字节（ZIP 容器，二进制下载）。
 */
export function buildTabularXlsx(
  headers: readonly string[],
  rows: readonly string[][]
): Uint8Array {
  // aoa_to_sheet 的泛型是单元格类型（data: T[][]），单元格恒为字符串
  const sheet = XLSX.utils.aoa_to_sheet<string>([[...headers], ...rows])
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, SHEET_NAME)
  // SheetJS write 的返回类型未随 type 参数收窄（库类型为弱签名），xlsx/array
  // 形态恒为 ArrayBuffer，这里显式收窄
  return new Uint8Array(XLSX.write(book, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer)
}

/**
 * 构建完整 XLSX 工作簿字节。
 *
 * @param rows 导出行。
 * @param columns 生效列（已按 Pro 门控筛选）。
 * @returns xlsx 文件字节（ZIP 容器，二进制下载）。
 */
export function buildSearchXlsx(
  rows: readonly MapsPlaceRow[],
  columns: readonly SearchExportColumn[]
): Uint8Array {
  return buildTabularXlsx(
    columns.map(column => column.header),
    rows.map(row => buildExportRowCells(row, columns))
  )
}
