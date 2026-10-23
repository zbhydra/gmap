/**
 * Online 关键词输入的统计：逐行规范化（去首尾空白、内部连续空白合并）后去重保序，
 * 与提交给后端的条目口径一致；重复行只计数提示，不报错。
 */

/** 单个关键词的长度上限（与后端校验一致）。 */
export const KEYWORD_MAX_LENGTH = 500

export function normalizeKeyword(line: string): string {
  return line.trim().replace(/\s+/g, ' ')
}

export interface KeywordStats {
  unique: string[]
  duplicates: number
  tooLong: boolean
}

export function keywordStats(text: string): KeywordStats {
  const lines = text.split(/\r?\n/).map(normalizeKeyword).filter(Boolean)
  const unique = [...new Set(lines)]
  return { unique, duplicates: lines.length - unique.length, tooLong: unique.some(keyword => keyword.length > KEYWORD_MAX_LENGTH) }
}
