/**
 * Website 全局 toast。
 *
 * 右下角堆叠（Layout 的 .toast-stack），结构与样式沿用组件目录的 .toast：图标 + 标题（+ 说明）；
 * 同时最多保留 3 条，超出时移除最早的一条；每条按各自时限播放退场动画后移除，减弱动效下没有动画则立即移除。
 */

/** toast 视觉类型：success 成功绿、info 主色说明、error 错误红。 */
export type SiteToastType = 'error' | 'success' | 'info'

/** 全局 toast 展示选项。 */
export interface SiteToastOptions {
  /** toast 视觉类型，默认 error。 */
  type?: SiteToastType
  /** 自动隐藏延迟，毫秒。 */
  durationMs?: number
  /** 标题下方的补充说明，按纯文本写入。 */
  description?: string
}

const SITE_TOAST_SELECTOR = '[data-site-toast-stack]'
const SITE_TOAST_DEFAULT_DURATION_MS = 3600
/** 同时可见的 toast 上限：批量提示时不堆满屏幕。 */
const SITE_TOAST_MAX_VISIBLE = 3
const TOAST_VARIANTS: Record<SiteToastType, { className: string; icon: string }> = {
  success: { className: 'toast', icon: 'check' },
  info: { className: 'toast toast--note', icon: 'info' },
  error: { className: 'toast toast--error', icon: 'x' }
}
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

function getOrCreateSiteToastStack(): HTMLElement {
  const existing = document.querySelector<HTMLElement>(SITE_TOAST_SELECTOR)
  if (existing) {
    return existing
  }

  const element = document.createElement('div')
  element.className = 'toast-stack'
  element.setAttribute('aria-live', 'polite')
  element.dataset.siteToastStack = ''
  document.body.append(element)
  return element
}

function createToastIcon(name: string): HTMLElement {
  const wrapper = document.createElement('span')
  wrapper.className = 'toast-icon'
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
  svg.setAttribute('class', 'icon')
  svg.setAttribute('aria-hidden', 'true')
  const use = document.createElementNS(SVG_NAMESPACE, 'use')
  use.setAttribute('href', `/img/icons.svg#i-${name}`)
  svg.append(use)
  wrapper.append(svg)
  return wrapper
}

/** 文案由调用方提供 i18n 文本，按纯文本写入，不解析 HTML。 */
export function showSiteToast(message: string, options: SiteToastOptions = {}): void {
  const type = options.type ?? 'error'
  const variant = TOAST_VARIANTS[type]
  const toast = document.createElement('div')
  toast.className = variant.className
  toast.dataset.siteToast = type
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status')
  const title = document.createElement('div')
  title.className = 'toast-title'
  title.textContent = message
  const body = document.createElement('div')
  body.append(title)
  if (options.description) {
    const description = document.createElement('div')
    description.className = 'toast-desc'
    description.textContent = options.description
    body.append(description)
  }
  toast.append(createToastIcon(variant.icon), body)
  const stack = getOrCreateSiteToastStack()
  stack.append(toast)
  while (stack.children.length > SITE_TOAST_MAX_VISIBLE) {
    stack.firstElementChild?.remove()
  }

  window.setTimeout(() => {
    toast.classList.add('is-leaving')
    void Promise.allSettled(toast.getAnimations().map(animation => animation.finished)).then(() => toast.remove())
  }, options.durationMs ?? SITE_TOAST_DEFAULT_DURATION_MS)
}
