/**
 * 菜单按钮（WAI-ARIA APG Menu Button，Dashboard 设计稿 README §3.8）：开合、焦点、子面板与键盘的唯一实现，
 * Dashboard 的 PopMenu.vue 与站点头部的静态标记（bindPopMenu）共用。
 *
 * - 标记约定：触发器 `${id}-btn`，浮层 `${id}-pop`（.pop > .pop-panels > .pop-panel，首个面板是根），根 role="menu" 为 `${id}`；
 *   条目是 menuitem / menuitemradio / menuitemcheckbox（tabindex="-1"），子面板入口带 aria-haspopup + aria-controls，
 *   子面板头的返回按钮带 data-pop-back。
 * - 每次打开都从根面板开始。键盘：↑↓ 循环、Home / End；data-pop-row 横排组内 ←→；→ 或 Enter 进子面板，← 或 Esc 返回，
 *   根层 Esc 关闭；Tab 关闭并让焦点从触发器继续，表单面板只在越过首尾时关闭。
 * - 激活：Enter 一律激活并关闭；点击与 Space 对 data-pop-stay 条目保持打开。aria-disabled 的目标在捕获阶段拦下，
 *   可以聚焦但不触发使用方的点击处理。
 *
 * 展开状态由使用方在 onOpen / onClose 里反映（Vue 的响应式状态、静态标记的 aria-expanded）。模块顶层不访问 DOM。
 */
import { closePop, isPopOpen, openPop, resetPanels, slidePanel, type PopAlign, type PopRect, type PopSide } from './pop'

/** 打开位置与初始焦点，每次打开时读取。 */
export interface PopMenuPlacement {
  /** 首选方向：账户菜单展开态为 top，图标栏为 right，其余为 bottom。 */
  side: PopSide
  align: PopAlign
  /** 定位矩形，缺省为触发器的矩形。 */
  anchor?: () => PopRect | null
  /** 打开时聚焦当前项（选中的单选项或 .is-current），否则聚焦首项。 */
  focusChecked: boolean
}

export interface PopMenuOptions extends PopMenuPlacement {
  /** 打开前调用：使用方在此标记展开、重建草稿（如丢掉上次没有 Apply 的日期）。 */
  onOpen: () => void
  /** 任何原因关闭后调用（激活条目、Esc、Tab、外部点击、另一个浮层打开）。 */
  onClose: () => void
}

/** 一个菜单按钮的操作与事件处理：Vue 在模板上绑定，静态标记由 bindPopMenu 挂好。 */
export interface PopMenu {
  /** 打开并聚焦首项（last 时为末项，focusChecked 时为当前项）。 */
  open: (options?: { last?: boolean }) => void
  close: () => void
  toggle: () => void
  /** 触发器 keydown：↓ / ↑ 打开。 */
  onTriggerKeydown: (event: KeyboardEvent) => void
  /** 浮层 keydown。 */
  onKeydown: (event: KeyboardEvent) => void
  /** 浮层 click 的捕获阶段：拦下 aria-disabled 的目标。 */
  onClickCapture: (event: MouseEvent) => void
  /** 浮层 click：返回、进子面板，或激活后关闭。 */
  onClick: (event: MouseEvent) => void
}

const ITEMS = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]'
const FOCUSABLE = 'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [tabindex="0"]'

/** 创建菜单按钮。元素每次按 id 现取（触发器可能随布局重新渲染），options 每次打开时读取（Vue 由此拿到最新的 props）。 */
export function createPopMenu(id: string, options: () => PopMenuOptions): PopMenu {
  /** 最近一次激活方式：Enter、Space 转成 click 后，点击处理据此决定是否关闭。 */
  let via: 'click' | 'enter' | 'space' = 'click'

  const trigger = (): HTMLElement | null => document.getElementById(`${id}-btn`)
  const pop = (): HTMLElement | null => document.getElementById(`${id}-pop`)

  function isOpen(): boolean {
    const el = pop()
    return el !== null && isPopOpen(el)
  }

  function panelEls(): HTMLElement[] {
    const el = pop()
    return el ? Array.from(el.querySelectorAll<HTMLElement>(':scope > .pop-panels > .pop-panel')) : []
  }

  function activePanel(): HTMLElement | undefined {
    const panels = panelEls()
    return panels.find(panel => !panel.hidden && !panel.inert) ?? panels[0]
  }

  function itemsIn(panel: HTMLElement | undefined): HTMLElement[] {
    return panel ? Array.from(panel.querySelectorAll<HTMLElement>(ITEMS)) : []
  }

  function open({ last = false }: { last?: boolean } = {}): void {
    const el = pop()
    const button = trigger()
    if (!el || !button || isPopOpen(el)) return
    const { side, align, anchor, focusChecked, onOpen, onClose } = options()
    onOpen()
    resetPanels(el)
    openPop(el, {
      trigger: button,
      anchor: anchor ?? (() => (button.isConnected ? button.getBoundingClientRect() : null)),
      owns: target => button.contains(target),
      side,
      align,
      onClose
    })
    const items = itemsIn(panelEls()[0])
    const checked = focusChecked
      ? items.find(item => item.getAttribute('aria-checked') === 'true' || item.classList.contains('is-current'))
      : undefined
    ;(last ? items.at(-1) : (checked ?? items[0]))?.focus()
  }

  function close(): void {
    if (isOpen()) closePop()
  }

  function toggle(): void {
    if (isOpen()) close()
    else open()
  }

  function onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    open({ last: event.key === 'ArrowUp' })
  }

  function enter(item: HTMLElement): void {
    const panelId = item.getAttribute('aria-controls')
    const panel = panelId ? document.getElementById(panelId)?.closest<HTMLElement>('.pop-panel') : null
    if (!panel || !pop()?.contains(panel)) return
    item.setAttribute('aria-expanded', 'true')
    slidePanel(panel, 1)
    const target = panel.querySelector<HTMLElement>('[aria-checked="true"], [data-autofocus]') ?? itemsIn(panel)[0] ?? panel.querySelector<HTMLElement>(FOCUSABLE)
    // 滑入途中面板带 transform：先不滚动地聚焦，再只在面板内部滚到可见
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'nearest' })
  }

  function back(): boolean {
    const root = panelEls()[0]
    const entry = root?.querySelector<HTMLElement>('[aria-haspopup][aria-expanded="true"]')
    if (!root || !entry) return false
    entry.setAttribute('aria-expanded', 'false')
    slidePanel(root, -1)
    entry.focus({ preventScroll: true })
    return true
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!isOpen() || !(event.target instanceof HTMLElement)) return
    const item = event.target.closest<HTMLElement>(ITEMS)
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (!back()) close()
      return
    }
    if (event.key === 'Tab') {
      // 菜单里 Tab 关闭菜单，焦点回到触发器后由默认行为继续移动；表单面板只在越过首尾时关闭
      const focusables = Array.from(activePanel()?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (item || event.target === (event.shiftKey ? focusables[0] : focusables.at(-1))) close()
      return
    }
    if (!item) return
    const items = itemsIn(activePanel())
    const index = items.indexOf(item)
    const go = (to: number): void => {
      event.preventDefault()
      items[(to + items.length) % items.length]?.focus()
    }
    switch (event.key) {
      case 'ArrowDown':
        go(index + 1)
        return
      case 'ArrowUp':
        go(index - 1)
        return
      case 'Home':
        go(0)
        return
      case 'End':
        go(items.length - 1)
        return
      case 'ArrowRight':
      case 'ArrowLeft': {
        // 横排单选组（主题）内左右移动；其余右键进子面板、左键返回上一层
        const row = item.closest<HTMLElement>('[data-pop-row]')
        if (row) {
          const group = Array.from(row.querySelectorAll<HTMLElement>(ITEMS))
          const at = group.indexOf(item) + (event.key === 'ArrowRight' ? 1 : -1)
          event.preventDefault()
          group[(at + group.length) % group.length]?.focus()
        } else if (event.key === 'ArrowRight' && item.hasAttribute('aria-haspopup')) {
          event.preventDefault()
          enter(item)
        } else if (event.key === 'ArrowLeft' && back()) {
          event.preventDefault()
        }
        return
      }
      case 'Enter':
      case ' ':
        event.preventDefault()
        via = event.key === 'Enter' ? 'enter' : 'space'
        item.click()
    }
  }

  function onClickCapture(event: MouseEvent): void {
    if (!(event.target instanceof Element) || !event.target.closest('[aria-disabled="true"]')) return
    via = 'click'
    event.preventDefault()
    event.stopPropagation()
  }

  function onClick(event: MouseEvent): void {
    const how = via
    via = 'click'
    if (!(event.target instanceof Element)) return
    if (event.target.closest('[data-pop-back]')) {
      back()
      return
    }
    const item = event.target.closest<HTMLElement>(ITEMS)
    if (!item) return
    if (item.hasAttribute('aria-haspopup')) {
      event.preventDefault()
      enter(item)
      return
    }
    if (!item.hasAttribute('data-pop-stay') || how === 'enter') close()
  }

  return { open, close, toggle, onTriggerKeydown, onKeydown, onClickCapture, onClick }
}

/** 静态标记上的菜单按钮（站点头部）：挂好触发器与浮层上的监听，aria-expanded 随开合写回触发器。 */
export function bindPopMenu(id: string, placement: PopMenuPlacement): void {
  const button = document.getElementById(`${id}-btn`)
  const el = document.getElementById(`${id}-pop`)
  if (!button || !el) throw new Error(`[pop-menu] 缺少 #${id}-btn 或 #${id}-pop。`)
  const menu = createPopMenu(id, () => ({
    ...placement,
    onOpen: () => button.setAttribute('aria-expanded', 'true'),
    onClose: () => button.setAttribute('aria-expanded', 'false')
  }))
  button.addEventListener('click', menu.toggle)
  button.addEventListener('keydown', menu.onTriggerKeydown)
  el.addEventListener('keydown', menu.onKeydown)
  el.addEventListener('click', menu.onClickCapture, true)
  el.addEventListener('click', menu.onClick)
}
