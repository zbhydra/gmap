/**
 * CSV 解析 / 序列化 / 多文件合并纯函数（W4 工具矩阵，自实现，零依赖）。
 *
 * 解析遵循 RFC 4180：双引号包裹字段、字段内 `""` 转义引号、字段内允许
 * 逗号与换行；换行兼容 CRLF / LF / CR。列对齐策略 = 表头并集（plans 钉死）：
 * 首个文件的列序在前，其余文件新列按出现顺序追加，缺失列留空。
 */

/** 一次 CSV 解析结果：首行为表头。 */
export interface ParsedCsv {
  /** 表头行（列名，保持文件内顺序）。 */
  header: readonly string[]
  /** 数据行（不含表头）。 */
  rows: readonly (readonly string[])[]
}

/** CSV 合并失败原因。 */
export type MergeCsvErrorCode = 'no-files' | 'empty-file'

/** CSV 合并结果。 */
export type MergeCsvResult =
  | {
      ok: true
      /** 并集表头（首个文件列序优先，新列按出现顺序追加）。 */
      header: readonly string[]
      /** 合并后的数据行（已按并集列序对齐）。 */
      rows: readonly (readonly string[])[]
    }
  | { ok: false; error: MergeCsvErrorCode; fileName: string }

/** 单文件解析统计（供结果摘要展示）。 */
export interface MergeFileSummary {
  name: string
  rowCount: number
}

/** 解析一段 CSV 文本（首行为表头；空文本视为空文件）。 */
export function parseCsv(text: string): ParsedCsv | null {
  const records = parseCsvRecords(text)
  if (records.length === 0) {
    return null
  }
  const [header, ...rows] = records
  return { header: header ?? [], rows }
}

/** RFC 4180 记录切分：返回全部记录（含表头）。 */
function parseCsvRecords(text: string): string[][] {
  const records: string[][] = []
  let record: string[] = []
  let field = ''
  let index = 0

  // 状态机：逐字符扫描，引号态内的分隔符按内容处理；连续引号为转义引号。
  let inQuotes = false
  const pushField = () => {
    record.push(field)
    field = ''
  }
  const pushRecord = () => {
    pushField()
    // 尾部全空记录（文件末尾多余换行）不入结果。
    if (record.length > 1 || (record[0] ?? '').length > 0) {
      records.push(record)
    }
    record = []
  }

  while (index < text.length) {
    const char = text[index] as string
    if (inQuotes) {
      if (char === '"') {
        const next = text[index + 1]
        if (next === '"') {
          field += '"'
          index += 2
          continue
        }
        inQuotes = false
        index += 1
        continue
      }
      field += char
      index += 1
      continue
    }
    if (char === '"' && field.length === 0) {
      inQuotes = true
      index += 1
      continue
    }
    if (char === ',') {
      pushField()
      index += 1
      continue
    }
    if (char === '\r' || char === '\n') {
      pushRecord()
      index += char === '\r' && text[index + 1] === '\n' ? 2 : 1
      continue
    }
    field += char
    index += 1
  }
  if (field.length > 0 || record.length > 0) {
    pushRecord()
  }
  return records
}

/** 序列化记录为 CSV 文本（RFC 4180：含逗号/引号/换行的字段加引号转义）。 */
export function toCsv(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const lines = [header, ...rows].map(record => record.map(field => formatCsvField(field)).join(','))
  return `${lines.join('\r\n')}\r\n`
}

/** 单字段序列化：仅特殊字符触发引号包裹。 */
function formatCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

/**
 * 合并多份 CSV 文本：表头并集对齐，数据行顺序拼接。
 *
 * @param files 已读取的文件（name + 文本内容）。
 */
export function mergeCsvFiles(files: readonly { name: string; text: string }[]): MergeCsvResult {
  if (files.length === 0) {
    return { ok: false, error: 'no-files', fileName: '' }
  }

  // 两遍处理：先并齐全部表头，再按最终表头对齐行——单遍会在后续文件追加
  // 新列时，已对齐的行缺少新增列的空位。
  const parsedFiles: { name: string; parsed: ParsedCsv }[] = []
  const mergedHeader: string[] = []
  const headerIndex = new Map<string, number>()

  for (const file of files) {
    const parsed = parseCsv(file.text)
    if (parsed === null) {
      return { ok: false, error: 'empty-file', fileName: file.name }
    }
    parsedFiles.push({ name: file.name, parsed })
    for (const column of parsed.header) {
      if (!headerIndex.has(column)) {
        headerIndex.set(column, mergedHeader.length)
        mergedHeader.push(column)
      }
    }
  }

  const mergedRows: string[][] = []
  for (const { parsed } of parsedFiles) {
    for (const row of parsed.rows) {
      const aligned = new Array<string>(mergedHeader.length).fill('')
      row.forEach((value, columnIndex) => {
        const columnName = parsed.header[columnIndex]
        if (columnName === undefined) {
          return
        }
        const targetIndex = headerIndex.get(columnName)
        if (targetIndex !== undefined) {
          aligned[targetIndex] = value
        }
      })
      mergedRows.push(aligned)
    }
  }

  return { ok: true, header: mergedHeader, rows: mergedRows }
}
