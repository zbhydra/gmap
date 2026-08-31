/**
 * CSV 文本序列化原语（RFC4180：CRLF 行尾、双引号转义）。
 *
 * 搜索/评论/照片三路导出共用；BOM 由各构建函数自行添加。
 */

/** 单行序列化：字段含逗号/引号/换行时加引号并双写内部引号（RFC4180）。 */
export function serializeCsvRow(cells: readonly string[]): string {
  return cells.map(escapeCsvCell).join(',')
}

/** 单元格转义。 */
function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** 构建带 BOM 的完整 CSV 文本（表头 + 数据行，RFC4180 行尾）。 */
export function buildCsvText(
  header: readonly string[],
  rows: readonly (readonly string[])[]
): string {
  const lines = [header.join(','), ...rows.map(serializeCsvRow)]
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

/** 文件名中的日期段（本地时区 `YYYY-MM-DD`）。 */
export function csvDateSegment(now: Date): string {
  return [
    String(now.getFullYear()).padStart(4, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-')
}

/** 文件系统安全化：非法字符与控制符替换为 `-` 并修剪。 */
export function sanitizeFilenamePart(value: string): string {
  return value.replace(/[/\\:*?"<>|]/g, '-').trim()
}
