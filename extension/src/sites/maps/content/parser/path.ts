/**
 * parseSchema 的路径模板工具。
 *
 * 路径模板形如 `[0][0]`、`[i][1]`：方括号段要么是非负整数下标，要么是
 * 索引占位 `i`（由调用方替换为实际列表项索引）。listLocator 是另一模板
 * 形态 `len-N`（根数组倒数第 N 个元素）。
 */

import type { JsonValue } from '@/core/rpc/types'

/** 编译路径模板：把索引占位替换为实际值，得到逐层下标序列。 */
export function compileSchemaPath(template: string, indexValue: number): number[] {
  const segments = parseSegments(template, 'path')
  return segments.map(segment => (segment === 'i' ? indexValue : Number.parseInt(segment, 10)))
}

/** 解析 listLocator（`len-N`），返回「从尾部数起的偏移量」N。 */
export function parseListLocator(locator: string): number {
  const match = /^len-(\d+)$/.exec(locator.trim())
  if (!match) {
    throw new Error(`[MapsParser] listLocator 非法（期望 len-N 形态）: ${locator}`)
  }
  return Number.parseInt(match[1] as string, 10)
}

/**
 * 按下标序列逐层取值；任一层缺失/非数组即返回 undefined（getValues 容错语义）。
 */
export function getValueAt(
  value: JsonValue | undefined,
  path: readonly number[]
): JsonValue | undefined {
  let current: JsonValue | undefined = value
  for (const index of path) {
    if (!Array.isArray(current)) {
      return undefined
    }
    current = current[index]
  }
  return current
}

/** 拆出方括号段；段既非 `i` 也非整数字时抛错（schema 非法必须可见）。 */
function parseSegments(template: string, kind: 'path'): string[] {
  const match = template.trim().match(/^(?:\[\s*(\d+|i)\s*\])+$/)
  if (!match) {
    throw new Error(`[MapsParser] ${kind} 模板非法（期望 [n] 或 [i] 段序列）: ${template}`)
  }
  const segments: string[] = []
  const segmentRegex = /\[\s*(\d+|i)\s*\]/g
  let captured: RegExpExecArray | null = segmentRegex.exec(template)
  while (captured) {
    segments.push(captured[1] as string)
    captured = segmentRegex.exec(template)
  }
  return segments
}
