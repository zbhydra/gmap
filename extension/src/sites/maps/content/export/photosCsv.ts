/**
 * 照片导出构建（013 A3，URL 列表；簿记 2 起支持用户设置的三格式）。
 *
 * 竞品只导出过滤 streetview 后的媒体 URL（photoUrl/videoUrl），不下载
 * 二进制；文件名 `MapsGrab-Extractor-Photos-{页面标题}-{条数}-{YYYY-MM-DD}.{扩展名}`
 * （对称评论命名，竞品未给出照片文件名规则，我方声明；前缀规则不随格式
 * 变化）。格式语义与 U4 搜索导出引擎同构。
 */

import { buildCsvText, csvDateSegment, sanitizeFilenamePart } from './csvText'
import { CSV_FILENAME_PREFIX } from './csv'
import { buildTabularJsonText } from './json'
import { buildTabularXlsx } from './xlsx'
import { searchExportMime, type SearchExportFormat } from './engine'

/** 照片导出列名（单列 URL 列表）。 */
export const PHOTOS_CSV_COLUMNS = ['Photo URL'] as const

/** 构建完整照片 CSV 文本（BOM + 表头 + URL 行，RFC4180 转义）。 */
export function buildPhotosCsv(urls: readonly string[]): string {
  return buildCsvText(
    PHOTOS_CSV_COLUMNS,
    urls.map(url => [url])
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
 * @param urls 照片 URL（已过滤 streetview）。
 * @param pageTitle 照片页 document.title（文件名分段）。
 * @param now 导出时刻（文件名日期段）。
 * @param format 用户设置 exportFormat。
 */
export function buildPhotosExport(
  urls: readonly string[],
  pageTitle: string,
  now: Date,
  format: SearchExportFormat
): PhotosExportArtifact {
  const filename = buildPhotosExportFilename(urls.length, pageTitle, now, format)

  if (format === 'json') {
    return {
      content: buildTabularJsonText(
        PHOTOS_CSV_COLUMNS,
        urls.map(url => [url])
      ),
      filename,
      mime: searchExportMime(format)
    }
  }
  if (format === 'xlsx') {
    return {
      content: buildTabularXlsx(
        PHOTOS_CSV_COLUMNS,
        urls.map(url => [url])
      ),
      filename,
      mime: searchExportMime(format)
    }
  }
  return { content: buildPhotosCsv(urls), filename, mime: searchExportMime(format) }
}
