/**
 * 关键词 × 地点批量组合纯函数（W4 工具矩阵）。
 *
 * 竞品场景（D1）：如 100 keywords design agency——把同一批关键词铺到全部
 * 服务地点，生成搜索词矩阵。逐行去重 + 空行剔除，组合顺序可选。
 */

/** 组合顺序：keywordFirst = "keyword location"；locationFirst = "location keyword"。 */
export type KeywordOrder = 'keyword-first' | 'location-first'

/**
 * 生成关键词 × 地点全组合。
 *
 * @param keywords 关键词列表（自动 trim、去空行、逐行去重）。
 * @param locations 地点列表（同上）。
 * @param order 组合顺序，默认关键词在前。
 * @returns 组合文本列表（每对只出现一次，保持输入顺序）。
 */
export function generateKeywordCombinations(
  keywords: readonly string[],
  locations: readonly string[],
  order: KeywordOrder = 'keyword-first'
): string[] {
  const cleanKeywords = cleanLines(keywords)
  const cleanLocations = cleanLines(locations)
  const combinations: string[] = []

  for (const keyword of cleanKeywords) {
    for (const location of cleanLocations) {
      combinations.push(order === 'keyword-first' ? `${keyword} ${location}` : `${location} ${keyword}`)
    }
  }
  return combinations
}

/** 逐行 trim、剔除空行并去重（保持首次出现顺序）。 */
function cleanLines(lines: readonly string[]): string[] {
  const seen = new Set<string>()
  const cleaned: string[] = []
  for (const line of lines) {
    const value = line.trim()
    if (value.length === 0 || seen.has(value)) {
      continue
    }
    seen.add(value)
    cleaned.push(value)
  }
  return cleaned
}
