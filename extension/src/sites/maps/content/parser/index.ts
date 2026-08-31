/**
 * Maps 搜索 RPC 解析器统一出口：响应解析 + 采集批内去重。
 *
 * 去重规则（A5 拍板）：解析批内按 Cid+Name（滚动加载重复批），导出层
 * 按 Place Id（先到先得）由 U4 落地。
 */

import type { MapsPlaceRow, MapsRpcParseResult } from './types'
import { parseSearchRpcResponse } from './placeParser'
import type { MapsParseSchemaConfig } from '../../config/contract'

export type { MapsPlaceRow, MapsRpcParseResult, MapsRpcFormat, UnwrappedRpcPayload } from './types'
export { parseSearchRpcResponse, parsePlaceRow, deriveCidFromFid } from './placeParser'
export { unwrapRpcPayload } from './shell'
export { compileSchemaPath, getValueAt, parseListLocator } from './path'

/**
 * 构造 Cid+Name 去重键；cid 缺失时退化为 PlaceId+Name。
 */
export function buildRowDedupeKey(row: MapsPlaceRow): string {
  return row.cid.length > 0 ? `${row.cid}|${row.name}` : `${row.placeId}|${row.name}`
}

/**
 * 用已见键集合过滤出新增行（先到先得），并把新行键写入集合。
 *
 * @param rows 本批解析行。
 * @param seenKeys 跨批共享的已见键集合（采集会话持有）。
 */
export function filterNewRows(rows: MapsPlaceRow[], seenKeys: Set<string>): MapsPlaceRow[] {
  const fresh: MapsPlaceRow[] = []
  for (const row of rows) {
    const key = buildRowDedupeKey(row)
    if (seenKeys.has(key)) {
      continue
    }
    seenKeys.add(key)
    fresh.push(row)
  }
  return fresh
}

/** 便捷封装：解析 + 一次性批内去重（测试与单批场景使用）。 */
export function parseAndDedupe(
  raw: string,
  schema: MapsParseSchemaConfig,
  seenKeys: Set<string>
): MapsRpcParseResult & { newRows: MapsPlaceRow[] } {
  const parsed = parseSearchRpcResponse(raw, schema)
  const newRows = filterNewRows(parsed.rows, seenKeys)
  return { ...parsed, newRows }
}
