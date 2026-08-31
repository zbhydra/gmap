/**
 * 评论导出构建（013 A2，11 列；簿记 2 起支持用户设置的三格式）。
 *
 * 列名/列序 = A5 评论区字段字典（竞品 rsScript exportToFile 的 11 列）；
 * 文件名 `MapsGrab-Extractor-Reviews-{页面标题}-{条数}-{YYYY-MM-DD}.{扩展名}`
 * （竞品 `G-Maps-Extractor-Reviews-…` 前缀随产品名「MapsGrab」，
 * 前缀规则不随格式变化）。格式语义与 U4 搜索导出引擎同构：CSV 走 BOM +
 * RFC4180，JSON 键驼峰化（值恒为字符串），XLSX 单元格全文本化。
 */

import type { ReviewRow } from '../parser/reviewsParser'
import { buildCsvText, csvDateSegment, sanitizeFilenamePart } from './csvText'
import { CSV_FILENAME_PREFIX } from './csv'
import { buildTabularJsonText } from './json'
import { buildTabularXlsx } from './xlsx'
import { searchExportMime, type SearchExportFormat } from './engine'

/** 评论导出列名（固定顺序，A5 字段字典）。 */
export const REVIEWS_CSV_COLUMNS = [
  'Author',
  'Review Text',
  'Review Rating',
  'Date',
  'Photos',
  'Likes',
  'Owner Answer',
  'Owner Answer Date',
  'Author Profile',
  'Author Image',
  'Review URL'
] as const

/** 由评论行生成导出行（列序与 REVIEWS_CSV_COLUMNS 对齐；照片列换行连接）。 */
export function buildReviewsCsvRows(rows: readonly ReviewRow[]): string[][] {
  return rows.map(row => [
    row.author,
    row.comment,
    row.rating,
    row.date,
    row.photos.join('\n'),
    row.likes,
    row.reply,
    row.replyDate,
    row.authorUrl,
    row.avatar,
    row.reviewUrl
  ])
}

/** 构建完整评论 CSV 文本（BOM + 表头 + 数据行，RFC4180 转义）。 */
export function buildReviewsCsv(rows: readonly ReviewRow[]): string {
  return buildCsvText(REVIEWS_CSV_COLUMNS, buildReviewsCsvRows(rows))
}

/**
 * 构建评论导出文件名：`{前缀}-Reviews-{页面标题}-{条数}-{YYYY-MM-DD}.{扩展名}`。
 *
 * 页面标题取评论页 document.title，文件名分段超长截断到 80 字符（防文件
 * 系统路径超限；竞品未做，我方声明）。
 */
export function buildReviewsExportFilename(
  rowCount: number,
  pageTitle: string,
  now: Date,
  format: SearchExportFormat
): string {
  const safeTitle = sanitizeFilenamePart(pageTitle).slice(0, 80)
  return `${CSV_FILENAME_PREFIX}-Reviews-${safeTitle}-${rowCount}-${csvDateSegment(now)}.${format}`
}

/** 评论导出产物（content 侧下载所需信息）。 */
export interface ReviewsExportArtifact {
  /** 文件内容（CSV/JSON 为文本，XLSX 为字节）。 */
  content: string | Uint8Array
  /** 下载文件名。 */
  filename: string
  /** MIME 类型。 */
  mime: string
}

/**
 * 按用户设置格式构建评论导出产物（013 簿记 2）。
 *
 * @param rows 评论行。
 * @param pageTitle 评论页 document.title（文件名分段）。
 * @param now 导出时刻（文件名日期段）。
 * @param format 用户设置 exportFormat。
 */
export function buildReviewsExport(
  rows: readonly ReviewRow[],
  pageTitle: string,
  now: Date,
  format: SearchExportFormat
): ReviewsExportArtifact {
  const filename = buildReviewsExportFilename(rows.length, pageTitle, now, format)

  if (format === 'json') {
    return {
      content: buildTabularJsonText(REVIEWS_CSV_COLUMNS, buildReviewsCsvRows(rows)),
      filename,
      mime: searchExportMime(format)
    }
  }
  if (format === 'xlsx') {
    return {
      content: buildTabularXlsx(REVIEWS_CSV_COLUMNS, buildReviewsCsvRows(rows)),
      filename,
      mime: searchExportMime(format)
    }
  }
  return { content: buildReviewsCsv(rows), filename, mime: searchExportMime(format) }
}
