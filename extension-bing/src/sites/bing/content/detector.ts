/**
 * Bing Maps DOM 适配器探测与选择器解析。
 *
 * 探测算法对齐竞品 chunk-f1caaee2 的 detect 实现（调研 §4.2）：
 *   1. 适配器按 (priority 升序, name 字典序) 稳定排序；
 *   2. 主探测器 detectors 按序试探，querySelector 命中即选定该版本；
 *   3. 主探测器全不命中时按序试探 fallbackDetectors；
 *   4. URL 兜底：仍在 Bing Maps 页（竞品 urlPatterns = `bing.com/maps`，两版本
 *      同值，命中即取排序首位适配器）时回退排序首位；非 Bing Maps 页返回 null。
 *
 * 选择器组语义（contract.ts）：数组 = 按顺序试探，querySelector 命中即用；
 * 采集条目 = listItems 各候选按序试探，命中数 > 0 即采用；全空再试 listItemsAlt。
 */

import type { BingAdapterConfig } from '@/sites/bing/config/contract'

/** Bing Maps 页 URL 兜底判定片段（竞品适配器 urlPatterns 逐字抄录，调研 §4.2）。 */
const BING_MAPS_URL_PATTERN = 'bing.com/maps'

/**
 * 探测当前页面命中的 DOM 适配器版本。
 *
 * @param adapters 候选适配器（取 getBingConfig().adapters，每次现读）。
 * @param doc 探测根（默认 document；单测传 DOMParser 文档）。
 * @param url 当前页 URL（默认 location.href；单测显式传入）。
 * @returns 命中的适配器；页面无任何探测器命中且不在 Bing Maps URL 上时为 null。
 */
export function detectAdapter(
  adapters: BingAdapterConfig[],
  doc: Document = document,
  url: string = window.location.href
): BingAdapterConfig | null {
  const sorted = sortAdapters(adapters)
  if (sorted.length === 0) {
    return null
  }

  const probe = (selector: string): boolean => {
    try {
      return doc.querySelector(selector) !== null
    } catch {
      // 远程下发的非法选择器按未命中处理，不中断探测
      return false
    }
  }

  for (const adapter of sorted) {
    if (adapter.detectors.some(probe)) {
      return adapter
    }
  }
  for (const adapter of sorted) {
    if (adapter.fallbackDetectors.some(probe)) {
      return adapter
    }
  }
  if (url.includes(BING_MAPS_URL_PATTERN)) {
    return sorted[0]
  }
  return null
}

/**
 * 在候选选择器组中解析出首个命中的元素。
 *
 * @returns 命中元素；全部未命中或候选为空返回 null（列表容器缺失按采集失败轮计）。
 */
export function resolveElement(root: ParentNode, candidates: string[] | undefined): Element | null {
  if (!candidates) {
    return null
  }
  for (const selector of candidates) {
    try {
      const hit = root.querySelector(selector)
      if (hit) {
        return hit
      }
    } catch {
      // 非法选择器按未命中处理
    }
  }
  return null
}

/**
 * 采集条目解析：listItems 候选按序试探，取首个命中数 > 0 的候选的全量匹配；
 * 主候选全空时按序试 listItemsAlt（contract.ts 的兜底语义）。
 *
 * @param root 查询根（采集循环传列表容器解析出的静态文档）。
 */
export function resolveItems(root: ParentNode, adapter: BingAdapterConfig): Element[] {
  const primary = queryFirstNonEmpty(root, adapter.selectors.listItems)
  if (primary.length > 0) {
    return primary
  }
  return queryFirstNonEmpty(root, adapter.selectors.listItemsAlt)
}

/** 按候选顺序试出首个匹配数 > 0 的选择器并返回其全部匹配。 */
function queryFirstNonEmpty(root: ParentNode, candidates: string[] | undefined): Element[] {
  if (!candidates) {
    return []
  }
  for (const selector of candidates) {
    try {
      const matches = Array.from(root.querySelectorAll(selector))
      if (matches.length > 0) {
        return matches
      }
    } catch {
      // 非法选择器按空匹配处理
    }
  }
  return []
}

/** (priority 升序, name 字典序) 稳定排序，与竞品排序函数一致。 */
function sortAdapters(adapters: BingAdapterConfig[]): BingAdapterConfig[] {
  return [...adapters].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority
    }
    return left.name.localeCompare(right.name)
  })
}
