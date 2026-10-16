/**
 * 站级组件交互（声明式：页面只写标记，Layout 统一初始化，组件样式在 styles/components.css）。
 *
 * - [data-tabs]：分段 tab。容器内 [role=tablist] > [role=tab][aria-controls] 对应 [role=tabpanel]，
 *   可选 .seg-thumb 滑块；方向键切换，切换时在容器上派发 tabchange（detail: { index, key }，
 *   key 取 tab 的 data-tab）。程序化切换直接对 tab 按钮调用 click()。
 * - details.acc：手风琴（summary + .acc-body）高度动画；减弱动效下走原生开合。
 * - [data-copy]：复制属性值到剪贴板并提示（文案取 toast 容器的 data-copied-label）。
 * - [data-cta-pins]：收尾 CTA 面板背景的 pin 雨，离屏 / 后台 / 减弱动效下不落点。
 */
import { inView, reducedMotion } from './motion'
import { showSiteToast } from './toast'

/** tabchange 事件载荷。 */
export interface TabChangeDetail {
  index: number
  key: string
}

/** pin 雨落点（面板内百分比坐标），按顺序循环。 */
const CTA_PIN_SPOTS: ReadonlyArray<readonly [number, number]> = [
  [8, 30], [14, 72], [22, 46], [80, 26], [88, 64], [74, 78], [92, 38], [30, 84], [68, 18], [6, 58]
]
const CTA_PIN_INTERVAL_MS = 650
const CTA_PIN_LIFETIME_MS = 4200

/** 读取动效 token（如 --dur-3 → 360），保证脚本动画与 CSS 同一刻度。 */
function motionToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function setupTabs(): void {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach(tabs => {
    const list = tabs.querySelector<HTMLElement>('[role="tablist"]')
    if (!list) throw new Error('[site-components] [data-tabs] 缺少 [role="tablist"]。')
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    const thumb = list.querySelector<HTMLElement>('.seg-thumb')
    const selectedIndex = () => Math.max(0, buttons.findIndex(button => button.getAttribute('aria-selected') === 'true'))
    const placeThumb = () => {
      const button = buttons[selectedIndex()]
      if (!thumb || !button) return
      thumb.style.width = `${button.offsetWidth}px`
      thumb.style.transform = `translateX(${button.offsetLeft}px)`
    }
    const select = (index: number, focus: boolean) => {
      buttons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === index
        button.setAttribute('aria-selected', String(selected))
        button.tabIndex = selected ? 0 : -1
        const panelId = button.getAttribute('aria-controls')
        const panel = panelId ? document.getElementById(panelId) : null
        if (panel) panel.hidden = !selected
      })
      placeThumb()
      if (focus) buttons[index].focus()
      tabs.dispatchEvent(new CustomEvent<TabChangeDetail>('tabchange', { detail: { index, key: buttons[index].dataset.tab ?? '' } }))
    }
    buttons.forEach((button, index) => button.addEventListener('click', () => select(index, false)))
    list.addEventListener('keydown', event => {
      const index = buttons.findIndex(button => button === document.activeElement)
      if (index < 0) return
      if (event.key === 'ArrowRight') select((index + 1) % buttons.length, true)
      if (event.key === 'ArrowLeft') select((index - 1 + buttons.length) % buttons.length, true)
    })
    if (buttons.length) select(selectedIndex(), false)
    // 字体加载完成与窗口尺寸变化都会改变按钮宽度，滑块重新对齐。
    void document.fonts.ready.then(placeThumb)
    window.addEventListener('resize', placeThumb)
  })
}

function setupAccordions(): void {
  document.querySelectorAll<HTMLDetailsElement>('details.acc').forEach(details => {
    const summary = details.querySelector('summary')
    const body = details.querySelector<HTMLElement>('.acc-body')
    if (!summary || !body) return
    summary.addEventListener('click', event => {
      if (reducedMotion()) return
      event.preventDefault()
      const duration = parseFloat(motionToken('--dur-3'))
      if (details.open) {
        const closing = body.animate(
          [{ height: `${body.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration, easing: motionToken('--ease-in-out') }
        )
        closing.onfinish = () => {
          details.open = false
        }
        return
      }
      details.open = true
      body.animate(
        [{ height: '0px', opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }],
        { duration, easing: motionToken('--ease-out') }
      )
    })
  })
}

function setupCopy(): void {
  const copiedLabel = document.querySelector<HTMLElement>('[data-site-toast-stack]')?.dataset.copiedLabel ?? ''
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    const trigger = event.target.closest<HTMLElement>('[data-copy]')
    if (!trigger) return
    navigator.clipboard.writeText(trigger.dataset.copy ?? '').then(
      () => showSiteToast(copiedLabel, { type: 'success' }),
      error => console.error(new Error('[site-components] Clipboard write failed.', { cause: error }))
    )
  })
}

function setupCtaPins(): void {
  document.querySelectorAll<HTMLElement>('[data-cta-pins]').forEach(layer => {
    let visible = false
    let spot = 0
    inView(layer, active => {
      visible = active
    }, { once: false, threshold: 0.1 })
    window.setInterval(() => {
      if (!visible || document.hidden || reducedMotion()) return
      const [x, y] = CTA_PIN_SPOTS[spot++ % CTA_PIN_SPOTS.length]
      const pin = document.createElement('i')
      pin.className = 'map-pin is-dropped'
      pin.style.setProperty('--x', `${x}%`)
      pin.style.setProperty('--y', `${y}%`)
      const ring = document.createElement('span')
      ring.className = 'pin-ring'
      pin.append(ring)
      layer.append(pin)
      window.setTimeout(() => {
        pin.classList.add('is-leaving')
        window.setTimeout(() => pin.remove(), parseFloat(motionToken('--dur-4')))
      }, CTA_PIN_LIFETIME_MS)
    }, CTA_PIN_INTERVAL_MS)
  })
}

/** Layout 在每页调用一次；页面没有对应标记时各项都是空操作。 */
export function initSiteComponents(): void {
  setupTabs()
  setupAccordions()
  setupCopy()
  setupCtaPins()
}
