/**
 * 首页叙事区交互：⑤ 字段浏览器、⑥ 补全轨道、⑦ 开发者代码台。
 *
 * 标记由 HomePage.astro 在构建期全部输出（字段数据挂在 chip 的 data-* 上，代码示例是 Shiki 高亮后的面板），
 * 这里只切换状态。tab 的选中、面板显隐与方向键由站级 [data-tabs]（scripts/site/components.ts）负责，
 * 本文件监听 tabchange 后从 DOM 读当前选中项。循环只在可见时运行（inView 已含页面可见性），减弱动效下直接给终态。
 */
import { inView, reducedMotion, wait } from '../../scripts/site/motion'

const FIELD_AUTOPLAY_MS = 2300
const FIELD_PAUSE_MS = 6000
const ORBIT_STEP_MS = 650
const ORBIT_FOUND_MS = 450
const ORBIT_HOLD_MS = 2600
const ORBIT_RESET_MS = 900
const ORBIT_MAX_RESULTS = 4
const DEV_REQUEST_LINE_MS = 28
const DEV_SEND_MS = 420
const DEV_RESPONSE_LINE_MS = 55

/** 取模板必有的标记；缺失说明模板与脚本不同步，直接报错。 */
function required<T extends Element = HTMLElement>(scope: ParentNode, selector: string): T {
  const element = scope.querySelector<T>(selector)
  if (!element) throw new Error(`[home] Missing markup: ${selector}`)
  return element
}

/** [data-tabs] 容器当前选中 tab 的 data-tab。 */
function selectedTab(tabs: HTMLElement): string {
  return required(tabs, '[role="tablist"]').querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.dataset.tab ?? ''
}

/** ⑤ 字段浏览器：hover / focus / 筛选切换检查器，可见且无操作时自动轮播。 */
function setupFields(root: HTMLElement): void {
  const inspector = required(root, '[data-inspector]')
  const filters = required(root, '[data-field-filters]')
  const cloud = required(root, '[data-field-cloud]')
  const chips = Array.from(cloud.querySelectorAll<HTMLButtonElement>('.field-chip'))
  const icon = required<SVGUseElement>(inspector, '[data-insp-icon] use')
  const name = required(inspector, '[data-insp-name]')
  const group = required(inspector, '[data-insp-group]')
  const position = required(inspector, '[data-insp-index]')
  const description = required(inspector, '[data-insp-desc]')
  const sample = required(inspector, '[data-insp-sample]')
  let current = chips.findIndex(chip => chip.classList.contains('is-active'))
  let filter = 'all'
  let pausedUntil = 0

  const inspect = (next: number, announce: boolean) => {
    if (next === current) return
    current = next
    const chip = chips[next]
    chips.forEach((item, index) => item.classList.toggle('is-active', index === next))
    // 自动轮播不播报，免得读屏每两秒被打断；用户操作触发的切换照常播报
    inspector.setAttribute('aria-live', announce ? 'polite' : 'off')
    inspector.classList.remove('is-swapping')
    void inspector.offsetWidth
    inspector.classList.add('is-swapping')
    icon.setAttribute('href', `/img/icons.svg#i-${chip.dataset.icon}`)
    name.textContent = chip.textContent?.trim() ?? ''
    group.textContent = chip.dataset.groupLabel ?? ''
    position.textContent = `${next + 1} / ${chips.length}`
    description.textContent = chip.dataset.desc ?? ''
    sample.textContent = chip.dataset.sample ?? ''
  }
  const visibleIndexes = () => chips.flatMap((chip, index) => (filter === 'all' || chip.dataset.group === filter ? [index] : []))
  const pause = () => {
    pausedUntil = Date.now() + FIELD_PAUSE_MS
  }
  const onChip = (event: Event) => {
    if (!(event.target instanceof Element)) return
    const chip = event.target.closest<HTMLButtonElement>('.field-chip')
    if (!chip) return
    pause()
    inspect(chips.indexOf(chip), true)
  }

  cloud.addEventListener('pointerover', onChip)
  cloud.addEventListener('focusin', onChip)
  // 站级 tabs 初始化时也会派发一次 tabchange（值等于当前筛选），忽略即可
  filters.addEventListener('tabchange', () => {
    const next = selectedTab(filters)
    if (next === filter) return
    filter = next
    pause()
    chips.forEach(chip => chip.classList.toggle('is-dim', next !== 'all' && chip.dataset.group !== next))
    inspect(visibleIndexes()[0], true)
  })

  let visible = false
  inView(cloud, active => {
    visible = active
  }, { once: false, threshold: 0.3 })
  window.setInterval(() => {
    if (!visible || reducedMotion() || Date.now() < pausedUntil) return
    const indexes = visibleIndexes()
    inspect(indexes[(indexes.indexOf(current) + 1) % indexes.length], false)
  }, FIELD_AUTOPLAY_MS)
}

/** ⑥ 补全轨道：辐条逐个点亮渠道节点，中心卡只保留最近 4 条结果。 */
function setupOrbit(orbit: HTMLElement): void {
  const spokes = Array.from(orbit.querySelectorAll<HTMLElement>('.orbit-spoke'))
  const nodes = Array.from(orbit.querySelectorAll<HTMLElement>('.orbit-node'))
  const rows = Array.from(orbit.querySelectorAll<HTMLElement>('.or-row'))
  const showResults = (found: number) => {
    rows.forEach((row, index) => {
      row.hidden = index >= found || index < found - ORBIT_MAX_RESULTS
    })
  }
  const settle = (found: number) => {
    spokes.forEach((spoke, index) => spoke.classList.toggle('is-active', index < found))
    nodes.forEach((node, index) => node.classList.toggle('is-found', index < found))
    showResults(Math.min(found, ORBIT_MAX_RESULTS))
  }

  if (reducedMotion()) {
    settle(nodes.length)
    return
  }

  let visible = false
  let wake: (() => void) | null = null
  inView(orbit, active => {
    visible = active
    if (!active || !wake) return
    wake()
    wake = null
  }, { once: false, threshold: 0.35 })
  const whenVisible = () => (visible ? Promise.resolve() : new Promise<void>(resolve => {
    wake = resolve
  }))

  const loop = async () => {
    for (;;) {
      for (const [index, spoke] of spokes.entries()) {
        await whenVisible()
        spoke.classList.add('is-active')
        await wait(ORBIT_STEP_MS)
        nodes[index].classList.add('is-found')
        showResults(index + 1)
        await wait(ORBIT_FOUND_MS)
      }
      await wait(ORBIT_HOLD_MS)
      settle(0)
      await wait(ORBIT_RESET_MS)
    }
  }
  void loop()
}

/** ⑦ 代码台：切换产品 / 语言时请求逐行打出、响应逐行流入；复制按钮始终复制当前语言的请求。 */
function setupDeveloperConsole(dev: HTMLElement): void {
  const panels = Array.from(dev.querySelectorAll<HTMLElement>('[data-dev-panel]'))
  let token = 0
  let started = false

  const resetLines = (lines: HTMLElement[]) => lines.forEach(line => {
    line.classList.remove('caret')
    line.classList.add('is-pending')
  })
  const revealLines = async (lines: HTMLElement[], delay: number, alive: () => boolean) => {
    for (const [index, line] of lines.entries()) {
      if (!alive()) return
      lines[index - 1]?.classList.remove('caret')
      line.classList.remove('is-pending')
      line.classList.add('caret')
      await wait(delay)
    }
    lines.at(-1)?.classList.remove('caret')
  }

  const play = async (panel: HTMLElement) => {
    const id = ++token
    const alive = () => id === token
    const request = required(panel, '[data-dev-request]:not([hidden])')
    const status = required(panel, '[data-dev-status]')
    const requestLines = Array.from(request.querySelectorAll<HTMLElement>('.line'))
    const responseLines = Array.from(required(panel, '[data-dev-response]').querySelectorAll<HTMLElement>('.line'))
    required(panel, '[data-dev-copy]').dataset.copy = request.textContent ?? ''
    status.dataset.done ??= status.textContent ?? ''
    if (!started) return
    if (reducedMotion()) {
      for (const line of [...requestLines, ...responseLines]) line.classList.remove('is-pending', 'caret')
      status.textContent = status.dataset.done
      return
    }
    resetLines(requestLines)
    resetLines(responseLines)
    status.textContent = status.dataset.sending ?? ''
    await revealLines(requestLines, DEV_REQUEST_LINE_MS, alive)
    await wait(DEV_SEND_MS)
    if (!alive()) return
    status.textContent = status.dataset.done
    await revealLines(responseLines, DEV_RESPONSE_LINE_MS, alive)
  }
  const playCurrent = () => {
    const panel = panels.find(item => !item.hidden)
    if (panel) void play(panel)
  }

  // 站级 tabs 的 tabchange 不冒泡：产品列表挂在 dev 容器上，各语言 tab 挂在各自代码窗上
  dev.addEventListener('tabchange', playCurrent)
  panels.forEach(panel => required(panel, '.codewin[data-tabs]').addEventListener('tabchange', () => void play(panel)))
  // 与代码窗的滚动显现同一阈值触发首播，避免先整段显示再清空重播
  inView(required(dev, '.dev-code'), () => {
    started = true
    playCurrent()
  })
}

/** HomePage.astro 的页面脚本入口。 */
export function initHomePage(): void {
  setupFields(required(document, '[data-fields]'))
  setupOrbit(required(document, '[data-orbit]'))
  setupDeveloperConsole(required(document, '[data-dev]'))
}
