/**
 * Bing 采集结果导出引擎：18 列 CSV（BOM）/ XLSX 组装 + 下载 + export_results 打点。
 *
 * 文件名与竞品一致：`{fileNamePrefix}{条数}_{本地时间 YYYYMMDDHHmmss}.{ext}`
 * （竞品 chunk-f9c87a6a + chunk-a2f8d0e6 逐字对照，调研 §5）；条数 = 数据行数，
 * 不含免费档末行提示。下载在 content 上下文触发（download.ts）。
 */

import { MARK_TYPE } from '@/core/api/mark/types'
import { getBingConfig } from '@/sites/bing/config/loader'
import type { BingExportRow } from '../parser'
import { recordContentMark } from '../marks'
import { buildBingCsv } from './csvText'
import { buildBingXlsx } from './xlsx'
import { downloadFile } from './download'

/** 导出格式（面板下拉两项，feat.md 界面表）。 */
export type BingExportFormat = 'csv' | 'xlsx'

/** CSV 的 MIME 类型。 */
const CSV_MIME = 'text/csv'
/** XLSX 的 MIME 类型（OOXML 标准）。 */
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** 导出入口参数。 */
export interface BingExportOptions {
  /** 是否追加免费档末行提示（免费档恒 true；Pro 无末行，U4 接入门控后传 false）。 */
  includeFreeNote: boolean
}

/**
 * 组装并下载导出文件，并记录 export_results 打点（含格式、条数、免费/Pro）。
 *
 * @param rows 采集去重后的 18 列行。
 * @param format 导出格式。
 * @param options 导出入口参数。
 */
export function exportRows(
  rows: readonly BingExportRow[],
  format: BingExportFormat,
  options: BingExportOptions
): void {
  const exportConfig = getBingConfig().export
  const filename = `${exportConfig.fileNamePrefix}${rows.length}_${formatTimestamp(new Date())}.${format}`

  if (format === 'xlsx') {
    downloadFile(buildBingXlsx(rows, options.includeFreeNote), filename, XLSX_MIME)
  } else {
    downloadFile(buildBingCsv(rows, exportConfig, options.includeFreeNote), filename, CSV_MIME)
  }

  // 埋点表（feat.md）：export_results 含格式、条数、免费/Pro；免费/Pro 以是否
  // 有行数上限为准（本期恒免费路径，U4 接入门控后由 Pro 判定翻转）
  recordContentMark(
    MARK_TYPE.EXPORT_RESULTS,
    `format=${format}, count=${rows.length}, plan=${options.includeFreeNote ? 'free' : 'pro'}`
  )
}

/** 文件名时间戳段：本地时间 `YYYYMMDDHHmmss`（竞品 downloadFile 同构）。 */
function formatTimestamp(now: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0')
  return (
    `${now.getFullYear()}` +
    `${pad(now.getMonth() + 1)}` +
    `${pad(now.getDate())}` +
    `${pad(now.getHours())}` +
    `${pad(now.getMinutes())}` +
    `${pad(now.getSeconds())}`
  )
}
