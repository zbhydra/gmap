/**
 * Website 共享浮层运行时（Dashboard 设计稿 README §3.8）：菜单、listbox、combobox 共用一个 `.pop`。
 *
 * - 同一时间只开一个；`popover="manual"` 进入顶层，不会被侧栏滚动区或卡片裁剪。
 * - 按锚点矩形定位：方向只在打开时决定（首选一侧放不下自然高度、另一侧更宽时翻转），之后滚动只更新坐标；
 *   左右夹在视口内，最大高度取所在一侧的剩余空间（`--pop-max`）。
 * - 外部 pointerdown、焦点移出、窗口宽度变化时关闭；从浮层内关闭时焦点回到触发器。
 * - 子面板在同一浮层内横向切换，容器高度同步过渡（T2，WAAPI）；减弱动效时直接切换。
 *
 * 键盘语义由各模式的使用方实现。模块顶层不访问 DOM（Astro SSR 会执行引用它的组件模块），全局监听只在打开期间挂载。
 */

/** 首选方向：right 只用于宽屏图标栏里的账户菜单（贴侧栏右侧、底边对齐）。 */
export type PopSide = 'top' | 'bottom' | 'right'

/** 水平对齐：start 与锚点左缘对齐，center 居中（站点头部的 API 菜单），end 与右缘对齐。 */
export type PopAlign = 'start' | 'center' | 'end'

/** 定位矩形：DOMRect，或使用方合成的矩形（图标栏里的账户菜单：纵向取触发器，右缘取侧栏）。 */
export interface PopRect {
  top: number
  bottom: number
  left: number
  right: number
  width: number
}

/** 打开选项。 */
export interface PopOpenOptions {
  /** 关闭时焦点归还的目标。 */
  trigger: HTMLElement
  /** 每次定位时读取；返回 null 表示锚点已离开文档，直接关闭。 */
  anchor: () => PopRect | null
  /** 视作浮层一部分的目标：在其上按下或聚焦不算外部（触发器、combobox 的输入框与箭头按钮）。 */
  owns: (target: Node) => boolean
  side: PopSide
  align: PopAlign
  /** 与锚点的间距，默认 8（combobox 为 4）。 */
  gap?: number
  /** 有值时宽度跟随锚点，且不小于该值（px）。 */
  matchWidth?: number
  /** 任何原因关闭后调用（外部点击、另一个浮层打开、closePop），使用方据此同步自身的展开状态。 */
  onClose: () => void
}

/** 与锚点的默认间距（--s-2）。 */
const GAP = 8
/** 与视口边缘的最小距离（--s-4）。 */
const EDGE = 16
/** 所在一侧空间极小时仍保留的可用高度，避免浮层被压成一条线。 */
const MIN_ROOM = 120

interface OpenPop {
  el: HTMLElement
  options: PopOpenOptions
  side: PopSide
  /** 方向已定：只在打开后的首次定位时测量。 */
  resolved: boolean
  /** 打开时的窗口宽度：只有宽度变化才关闭，移动端地址栏伸缩只改高度。 */
  viewportWidth: number
}

let current: OpenPop | null = null
let frame = 0
/** 正在进行的子面板切换：再次切换或复位前先一起结束，避免中间态残留。 */
const settles = new WeakMap<HTMLElement, () => void>()

/** 打开浮层（已打开的其他浮层先无焦点归还地关闭）；同一个浮层重复打开不做处理。 */
export function openPop(el: HTMLElement, options: PopOpenOptions): void {
  if (current?.el === el) return
  closePop({ focus: false })
  current = { el, options, side: options.side, resolved: false, viewportWidth: window.innerWidth }
  el.dataset.side = options.side
  el.inert = false
  // 容器显式 tabindex=-1（不进 Tab 顺序）：点击内部不可聚焦处时焦点停在浮层上，不会交给外层可聚焦祖先而被判为移出
  // （WebKit 点击没有 tabindex 的按钮也走这条：焦点给最近的可聚焦祖先，如 Dashboard 的 main#main）
  el.tabIndex = -1
  el.showPopover()
  place()
  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('focusin', handleFocusIn)
  window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
  window.addEventListener('resize', handleResize)
}

/**
 * 关闭当前浮层。focus 默认 true，但只有焦点原本在浮层内时才回到触发器；
 * 点击外部关闭时传 false，焦点跟随点击位置。
 */
export function closePop({ focus = true }: { focus?: boolean } = {}): void {
  const closing = current
  if (!closing) return
  current = null
  cancelAnimationFrame(frame)
  frame = 0
  document.removeEventListener('pointerdown', handlePointerDown, true)
  document.removeEventListener('focusin', handleFocusIn)
  window.removeEventListener('scroll', handleScroll, { capture: true })
  window.removeEventListener('resize', handleResize)
  const inside = closing.el.contains(document.activeElement)
  if (closing.el.matches(':popover-open')) closing.el.hidePopover()
  // 退场过渡期间浮层仍在渲染：置 inert 后其中内容不可聚焦、不可点击（WebKit 的默认 Tab 会落进正在淡出的浮层）
  closing.el.inert = true
  closing.options.onClose()
  if (focus && inside && closing.options.trigger.isConnected) closing.options.trigger.focus({ preventScroll: true })
}

/** 给定浮层（缺省为任意浮层）是否打开。 */
export function isPopOpen(el?: HTMLElement): boolean {
  return el ? current?.el === el : current !== null
}

/** 子面板切换：新面板从 dir 一侧滑入，旧面板向另一侧淡出，容器高度同步过渡。面板是 `.pop-panels` 的直接子元素。 */
export function slidePanel(next: HTMLElement, dir: 1 | -1): void {
  const box = next.parentElement
  if (!box) return
  settles.get(box)?.()
  const prev = panelsOf(box).find(panel => !panel.hidden)
  if (!prev || prev === next) return
  const from = box.offsetHeight
  prev.hidden = true
  next.hidden = false
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const to = box.offsetHeight
  prev.hidden = false
  prev.inert = true
  const tokens = getComputedStyle(document.documentElement)
  // 三段同时结束并都保持终态，直到 settle 一起撤掉：避免某一帧两个面板同时撑开容器
  const timing: KeyframeAnimationOptions = {
    duration: parseFloat(tokens.getPropertyValue('--dur-3')),
    easing: tokens.getPropertyValue('--ease-out').trim(),
    fill: 'forwards'
  }
  const leave = prev.animate([{ transform: 'none', opacity: 1 }, { transform: `translateX(${dir * -30}%)`, opacity: 0 }], timing)
  const animations = [
    box.animate([{ height: `${from}px` }, { height: `${to}px` }], timing),
    next.animate([{ transform: `translateX(${dir * 100}%)` }, { transform: 'none' }], timing),
    leave
  ]
  const settle = (): void => {
    settles.delete(box)
    for (const animation of animations) animation.cancel()
    prev.hidden = true
    prev.inert = false
  }
  settles.set(box, settle)
  leave.finished.then(
    () => {
      if (settles.get(box) === settle) settle()
    },
    () => {}
  )
}

/** 回到根面板：每次打开浮层都从根面板开始，子面板入口一并收起。 */
export function resetPanels(el: HTMLElement): void {
  const box = el.querySelector<HTMLElement>(':scope > .pop-panels')
  if (!box) return
  settles.get(box)?.()
  panelsOf(box).forEach((panel, index) => {
    panel.hidden = index > 0
    panel.inert = false
  })
  for (const entry of box.querySelectorAll('[aria-haspopup][aria-controls]')) entry.setAttribute('aria-expanded', 'false')
}

function panelsOf(box: HTMLElement): HTMLElement[] {
  return Array.from(box.querySelectorAll<HTMLElement>(':scope > .pop-panel'))
}

function place(): void {
  const open = current
  if (!open) return
  const { el, options } = open
  const anchor = options.anchor()
  if (!anchor) {
    closePop({ focus: false })
    return
  }
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = window.innerHeight
  if (options.matchWidth !== undefined) {
    el.style.width = `${Math.round(Math.min(Math.max(anchor.width, options.matchWidth), viewportWidth - 2 * EDGE))}px`
  }
  const width = el.offsetWidth
  if (open.side === 'right') {
    // 图标栏里的账户菜单：贴侧栏右侧向上展开，底边与锚点对齐（至少离视口底边 EDGE）
    const bottom = Math.max(EDGE, viewportHeight - anchor.bottom)
    el.style.setProperty('--pop-max', `${Math.round(viewportHeight - bottom - EDGE)}px`)
    el.style.left = `${Math.round(Math.min(anchor.right + GAP, viewportWidth - width - EDGE))}px`
    el.style.top = 'auto'
    el.style.bottom = `${Math.round(bottom)}px`
    return
  }
  const gap = options.gap ?? GAP
  const room = { bottom: viewportHeight - anchor.bottom - gap - EDGE, top: anchor.top - gap - EDGE }
  let side = open.side
  if (!open.resolved) {
    // 放开 --pop-max 量自然高度（列表型仍受 --pop-cap 限制）
    el.style.setProperty('--pop-max', '100000px')
    const other = side === 'top' ? 'bottom' : 'top'
    if (el.offsetHeight > room[side] && room[other] > room[side]) side = other
    open.side = side
    open.resolved = true
    el.dataset.side = side
  }
  el.style.setProperty('--pop-max', `${Math.round(Math.max(room[side], MIN_ROOM))}px`)
  el.style.top = side === 'bottom' ? `${Math.round(anchor.bottom + gap)}px` : 'auto'
  el.style.bottom = side === 'top' ? `${Math.round(viewportHeight - anchor.top + gap)}px` : 'auto'
  const left = { start: anchor.left, center: anchor.left + (anchor.width - width) / 2, end: anchor.right - width }[options.align]
  el.style.left = `${Math.round(Math.min(Math.max(left, EDGE), viewportWidth - width - EDGE))}px`
}

function isOutside(target: EventTarget | null): boolean {
  return Boolean(current && target instanceof Node && !current.el.contains(target) && !current.options.owns(target))
}

function handlePointerDown(event: PointerEvent): void {
  if (isOutside(event.target)) closePop({ focus: false })
}

function handleFocusIn(event: FocusEvent): void {
  if (isOutside(event.target)) closePop({ focus: false })
}

// 页面或祖先滚动后按锚点重新定位（每帧至多一次）；浮层内部列表的滚动不处理
function handleScroll(event: Event): void {
  if (!current || frame || (event.target instanceof Node && current.el.contains(event.target))) return
  frame = requestAnimationFrame(() => {
    frame = 0
    place()
  })
}

function handleResize(): void {
  if (current && window.innerWidth !== current.viewportWidth) closePop()
}
