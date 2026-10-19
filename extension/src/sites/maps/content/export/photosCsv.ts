/**
 * 照片导出：过滤街景后的媒体按 Photo URL / Video URL 两列输出，支持三种格式。
 */

import { buildCsvText, csvDateSegment, sanitizeFilenamePart } from './csvText'
import { CSV_FILENAME_PREFIX } from './csv'
import { buildTabularJsonText } from './json'
import { buildTabularXlsx } from './xlsx'
import { searchExportMime, type SearchExportFormat } from './engine'
import type { PhotoRow } from '../parser/photosParser'

export const PHOTOS_CSV_COLUMNS = ['Photo URL', 'Video URL'] as const

/** 构建完整照片 CSV 文本（BOM + 表头 + URL 行，RFC4180 转义）。 */
export function buildPhotosCsv(rows: readonly PhotoRow[]): string {
  return buildCsvText(
    PHOTOS_CSV_COLUMNS,
    rows.map(row => [row.photoUrl, row.videoUrl])
  )
}

/** 构建照片导出文件名；页面标题分段超长截断到 80 字符。 */
export function buildPhotosExportFilename(
  rowCount: number,
  pageTitle: string,
  now: Date,
  format: SearchExportFormat
): string {
  const safeTitle = sanitizeFilenamePart(pageTitle).slice(0, 80)
  return `${CSV_FILENAME_PREFIX}-Photos-${safeTitle}-${rowCount}-${csvDateSegment(now)}.${format}`
}

/** 照片导出产物（content 侧下载所需信息）。 */
export interface PhotosExportArtifact {
  /** 文件内容（CSV/JSON 为文本，XLSX 为字节）。 */
  content: string | Uint8Array
  /** 下载文件名。 */
  filename: string
  /** MIME 类型。 */
  mime: string
}

/**
 * 按用户设置格式构建照片导出产物（013 簿记 2）。
 *
 * @param rows 媒体行（已过滤 streetview）。
 * @param pageTitle 照片页 document.title（文件名分段）。
 * @param now 导出时刻（文件名日期段）。
 * @param format 用户设置 exportFormat。
 */
export function buildPhotosExport(
  rows: readonly PhotoRow[],
  pageTitle: string,
  now: Date,
  format: SearchExportFormat
): PhotosExportArtifact {
  const filename = buildPhotosExportFilename(rows.length, pageTitle, now, format)

  if (format === 'json') {
    return {
      content: buildTabularJsonText(
        PHOTOS_CSV_COLUMNS,
        rows.map(row => [row.photoUrl, row.videoUrl])
      ),
      filename,
      mime: searchExportMime(format)
    }
  }
  if (format === 'xlsx') {
    return {
      content: buildTabularXlsx(
        PHOTOS_CSV_COLUMNS,
        rows.map(row => [row.photoUrl, row.videoUrl])
      ),
      filename,
      mime: searchExportMime(format)
    }
  }
  return { content: buildPhotosCsv(rows), filename, mime: searchExportMime(format) }
}
