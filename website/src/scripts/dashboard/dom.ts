/**
 * Dashboard 的浏览器端小工具：减弱动效判定、一次性动画重放、带提示的复制与统一时长的 toast。
 * 只在事件处理或挂载后调用（Astro SSR 也会执行组件模块，模块顶层不能访问 DOM）。
 */

import { showSiteToast, type SiteToastType } from '../site/toast'

/** Dashboard toast 停留时长。 */
const TOAST_DURATION_MS = 4200

export function reducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 弹窗（含站级登录弹窗）或原生浮层打开时，Dashboard 的全局快捷键与 Esc 收抽屉都让位。 */
export function overlayOpen(): boolean {
  if (document.querySelector('dialog[open], [data-download-auth-modal]:not([hidden])')) return true
  try {
    return document.querySelector(':popover-open') !== null
  } catch {
    // 不支持 :popover-open 的浏览器也没有原生浮层
    return false
  }
}

/** 重放一次性动画类：移除、强制回流后重新加上；动画结束移除，不残留 transform。只认本元素自己的动画。 */
export function replayClass(element: Element, className: string): void {
  element.classList.remove(className)
  element.getBoundingClientRect()
  element.classList.add(className)
  const done = (event: Event): void => {
    if (event.target !== element) return
    element.classList.remove(className)
    element.removeEventListener('animationend', done)
  }
  element.addEventListener('animationend', done)
}

/** 分段控件滑块对齐到选中项（aria-selected 或 aria-checked）；instant 跳过过渡，用于首次定位与尺寸变化。 */
export function placeSegThumb(group: HTMLElement, instant = false): void {
  const active = group.querySelector<HTMLElement>('[aria-selected="true"], [aria-checked="true"]')
  const thumb = group.querySelector<HTMLElement>('.seg-thumb')
  if (!active || !thumb || !active.offsetWidth) return
  if (instant) thumb.style.transition = 'none'
  thumb.style.width = `${active.offsetWidth}px`
  thumb.style.transform = `translateX(${active.offsetLeft}px)`
  if (!instant) return
  thumb.getBoundingClientRect()
  thumb.style.transition = ''
}

export function toast(title: string, type: SiteToastType, description?: string): void {
  showSiteToast(title, { type, description, durationMs: TOAST_DURATION_MS })
}

/** 写入剪贴板并给出成功或失败提示；返回是否成功，供按钮显示短暂的已复制状态。 */
export async function copyText(value: string, labels: { copied: string; copyFailed: string }): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    toast(labels.copied, 'success')
    return true
  } catch (error) {
    console.error(new Error('[dashboard] clipboard write failed', { cause: error }))
    toast(labels.copyFailed, 'error')
    return false
  }
}
