/**
 * 列表模式（013 A7，U10）的容器定位与终止判定原语。
 *
 * 依据（A7 实测 2026-08-30）：聚合页列表容器 = `role=main` 末子 div（与
 * 竞品时代同构）；深层列表页容器结构漂移，选择器由远程配置独立下发
 * （listContainerDeep，实录校准点）。列表项 = 容器直接子 div 过滤首尾。
 * 终止判定与 feed 同语义：末项出现结束提示文字（小写包含）。
 */

import type { MapsDomConfig } from '../../config/contract'
import { detectDeepListMode } from '../listMode'

/**
 * 按页面 URL 形态定位列表滚动容器。
 *
 * 深层页（URL 含 listModeDeepUrlMark）与聚合页各用一组独立选择器，严格
 * 二选一——不做相互回退：深层选择器在聚合同构 DOM 上几乎总能嵌套误命中
 * （末子 div 的末子 div），回退反而引入错容器；URL 形态判定是实测驱动的
 * 可靠信号（A7 实测两形态），未命中返回 null（该轮无进展，由调用方的
 * 无增长兜底终止）。
 *
 * @param url 当前页面 URL（决定选择器组）。
 * @param dom 远程配置 dom 组。
 */
export function findListContainer(url: string, dom: MapsDomConfig): HTMLElement | null {
  const selector = detectDeepListMode(url, dom.listModeDeepUrlMark)
    ? dom.listContainerDeep
    : dom.listContainer
  const element = document.querySelector(selector)
  return element instanceof HTMLElement ? element : null
}

/**
 * 取容器内的列表项：容器直接子元素中匹配相对选择器者（默认排除首尾，
 * 远程配置 listItem 驱动；不用 :scope 前缀查询，children 遍历 + matches
 * 在 Chrome 与测试环境行为一致）。首尾不在此列——末子元素是结束提示位，
 * 由 feedScroll.isFeedEndReached 做完成判定（与 feed 同构）。
 */
export function findListItems(container: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(container.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.matches(selector)
  )
}
