/**
 * Maps 内部 RPC 响应的双格式剥壳（013 逆向 03 §3.1 / 10 号实测结论二）。
 *
 * - 格式 A（直接导航页面数据）：`)]}'` 前缀 + 纯数组，无尾哨兵；
 * - 格式 B（SPA XHR）：`{"c":0,"d":")]}'…"}` 包裹 + 尾部哨兵（6 字符）。
 *
 * 竞品只处理格式 B（slice(0,-6) 会破坏格式 A），复刻两者都处理。
 */

import type { MapsParseSchemaConfig } from '../../config/contract'
import type { JsonArray, JsonValue } from '@/core/rpc/types'
import type { MapsRpcFormat, UnwrappedRpcPayload } from './types'

/** XSSI 防护前缀 `)]}'`（4 字符，其后紧跟换行 + JSON 数组）。 */
const XSSI_PREFIX = ")]}'"

/** 哨兵长度：竞品固定 slice(0,-6)，兼容尾部带换行或不带换行两种实测形态。 */
const SENTINEL_TAIL_LENGTH = 6

/**
 * 按响应格式剥壳并解析出根大数组。
 *
 * @param raw 完整响应文本。
 * @param schema 解析 schema（决定允许的格式分支）。
 * @returns 剥壳结果（格式标记 + 根数组）。
 * @throws 响应既不是格式 A 也不是格式 B、格式分支被配置禁用、或 JSON 解析失败时抛错（三要素消息，失败必须可见）。
 */
export function unwrapRpcPayload(raw: string, schema: MapsParseSchemaConfig): UnwrappedRpcPayload {
  if (raw.endsWith('/*""*/') || raw.endsWith('\n/*""*/')) {
    if (!schema.formatBSpaXhrEnabled) {
      throw new Error('[MapsParser] 检测到格式 B 响应但 formatBSpaXhrEnabled 已禁用')
    }
    return { format: 'B', data: parseFormatB(raw, 'B') }
  }

  if (raw.startsWith(XSSI_PREFIX)) {
    if (!schema.formatADirectNavEnabled) {
      throw new Error('[MapsParser] 检测到格式 A 响应但 formatADirectNavEnabled 已禁用')
    }
    return { format: 'A', data: parseFormatA(raw) }
  }

  const head = raw.slice(0, 32)
  throw new Error(
    `[MapsParser] 响应既非格式 A（${XSSI_PREFIX} 前缀）也非格式 B（哨兵结尾），head=${head}`
  )
}

/** 格式 B 剥壳：去尾哨兵 → 取 `d` 字符串 → 去 XSSI 前缀 → parse。 */
function parseFormatB(raw: string, format: MapsRpcFormat): JsonArray {
  const inner = JSON.parse(raw.slice(0, -SENTINEL_TAIL_LENGTH)) as { d?: unknown }
  if (typeof inner.d !== 'string') {
    throw new Error(`[MapsParser] 格式 ${format} 响应缺少 d 字符串字段，无法剥壳`)
  }
  return parseInnerArray(inner.d, format)
}

/** 格式 A 剥壳：整体即 XSSI 前缀 + 数组文本。 */
function parseFormatA(raw: string): JsonArray {
  return parseInnerArray(raw, 'A')
}

/** 去掉 XSSI 前缀后 JSON.parse，非数组视为协议漂移并抛错。 */
function parseInnerArray(inner: string, format: MapsRpcFormat): JsonArray {
  const withoutPrefix = inner.startsWith(XSSI_PREFIX) ? inner.slice(XSSI_PREFIX.length) : inner
  const parsed: JsonValue = JSON.parse(withoutPrefix) as JsonValue
  if (!Array.isArray(parsed)) {
    throw new Error(`[MapsParser] 格式 ${format} 剥壳后根节点不是数组: type=${typeof parsed}`)
  }
  return parsed
}
