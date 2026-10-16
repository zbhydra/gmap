/**
 * Pricing 页视觉交互：② 价格滚动与用量估算条、③ 对比表跟随、④ 额度单位动画。
 *
 * 当前产品线以产品切换 [data-pricing-tabs]（站级 [data-tabs]）的选中态为准；URL 预选、hash 同步与
 * 购买在 pricing-page-controller.ts，且须先于本文件求值（PricingPageShell 的导入顺序保证）。
 * 本文件监听 tabchange 派生视图，对比表分段按钮切换时点击对应产品 tab。循环只在可见时运行
 * （inView 已含页面可见性），减弱动效下直接给终态。
 */
import { ease, formatNumber, inView, reducedMotion, tween, wait } from '../../scripts/site/motion'
import { finderMatch, finderPosition, finderScale, finderVolume } from './pricing-finder'

const PRICE_ROLL_MS = 900
const PRICE_ROLL_DELAY_MS = 120
const PRICE_ROLL_STAGGER_MS = 70
const RECORD_MAX_ROWS = 3
const RECORD_SETTLE_MS = 650
const RECORD_ATTACH_MS = 300
const RECORD_HOLD_MS = 1500
const REQUEST_MAX_LINES = 5
const REQUEST_STEP_MS = 1400
const USAGE_THRESHOLD = 0.25

/** 取模板必有的标记；缺失说明模板与脚本不同步，直接报错。 */
function required<T extends Element = HTMLElement>(scope: ParentNode, selector: string): T {
  const element = scope.querySelector<T>(selector)
  if (!element) throw new Error(`[pricing] Missing markup: ${selector}`)
  return element
}

/** 产品切换当前选中 tab 的 data-tab。 */
function selectedKey(tabs: HTMLElement): string {
  return tabs.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.dataset.tab ?? ''
}

/** ② 切到某产品线时卡面金额从 0 滚到卡面价；同一面板重复切换时旧的滚动让位。 */
const rollRuns = new WeakMap<HTMLElement, number>()
function rollPrices(panel: HTMLElement): void {
  if (reducedMotion()) return
  const run = (rollRuns.get(panel) ?? 0) + 1
  rollRuns.set(panel, run)
  panel.querySelectorAll<HTMLElement>('[data-price]').forEach((element, index) => {
    const target = Number(element.dataset.price)
    if (target === 0) return
    element.textContent = '0'
    window.setTimeout(() => {
      void tween(PRICE_ROLL_MS, progress => {
        if (rollRuns.get(panel) === run) element.textContent = String(Math.round(target * progress))
      }, ease.outExpo)
    }, PRICE_ROLL_DELAY_MS + index * PRICE_ROLL_STAGGER_MS)
  })
}

/** 5 档在中屏转为横向滑动时，把推荐档滚到中间。 */
function centerFeatured(panel: HTMLElement): void {
  const grid = required(panel, '[data-plan-grid]')
  const card = grid.querySelector<HTMLElement>('.is-featured')
  if (!card || grid.scrollWidth <= grid.clientWidth + 2) return
  grid.scrollLeft = card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2
}

/** ② 用量估算条：拖动时标出满足月用量的最小档位（刻度与初值由构建期按同一套函数输出）。 */
function setupFinder(panel: HTMLElement): void {
  const finder = required(panel, '[data-finder]')
  const range = required<HTMLInputElement>(finder, '.finder-range')
  const track = required(finder, '.finder-track')
  const value = required(finder, '[data-finder-value]')
  const plan = required(finder, '[data-finder-plan]')
  const ticks = Array.from(finder.querySelectorAll<HTMLElement>('[data-tick]'))
  const cards = Array.from(panel.querySelectorAll<HTMLElement>('[data-plan-card]'))
  const names = cards.map(card => required(card, '.price-name').textContent ?? '')
  const quotas = ticks.map(tick => Number(tick.dataset.quota))
  const scale = finderScale(quotas)
  const positions = quotas.map(quota => finderPosition(scale, quota))
  const valueText = finder.dataset.valueText ?? ''

  range.addEventListener('input', () => {
    const position = Number(range.value) / 1000
    const volume = finderVolume(scale, position)
    const match = finderMatch(quotas, volume)
    track.style.setProperty('--p', String(position))
    value.textContent = formatNumber(volume)
    plan.textContent = names[match]
    range.setAttribute('aria-valuetext', valueText.replace('{value}', formatNumber(volume)).replace('{plan}', names[match]))
    ticks.forEach((tick, index) => {
      tick.classList.toggle('is-reached', positions[index] <= position + 0.0005)
      tick.classList.toggle('is-match', index === match)
    })
    cards.forEach((card, index) => card.classList.toggle('is-match', index === match))
  })
}

/** ③ 对比表：分段按钮、导语与表格跟随当前产品线；返回同步函数。 */
function setupCompare(tabs: HTMLElement, compare: HTMLElement): (key: string, animate: boolean) => void {
  const seg = required(compare, '[data-compare-seg]')
  const thumb = required(seg, '.seg-thumb')
  const buttons = Array.from(seg.querySelectorAll<HTMLButtonElement>('[data-compare-key]'))
  const leads = Array.from(compare.querySelectorAll<HTMLElement>('[data-compare-lead]'))
  const tables = Array.from(compare.querySelectorAll<HTMLElement>('[data-compare-table]'))
  const placeThumb = () => {
    const button = buttons.find(item => item.getAttribute('aria-pressed') === 'true')
    if (!button) return
    thumb.style.width = `${button.offsetWidth}px`
    thumb.style.transform = `translateX(${button.offsetLeft}px)`
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    tabs.querySelector<HTMLButtonElement>(`[role="tab"][data-tab="${button.dataset.compareKey}"]`)?.click()
  }))
  // 字体加载完成与窗口尺寸变化都会改变按钮宽度，滑块重新对齐
  void document.fonts.ready.then(placeThumb)
  window.addEventListener('resize', placeThumb)

  return (key, animate) => {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.compareKey === key)))
    leads.forEach(lead => {
      lead.hidden = lead.dataset.compareLead !== key
    })
    tables.forEach(table => {
      table.hidden = table.dataset.compareTable !== key
      if (table.hidden || !animate || reducedMotion()) return
      table.classList.remove('is-swapping')
      void table.offsetWidth
      table.classList.add('is-swapping')
    })
    placeThumb()
  }
}

/** 进入视口才放行的闸门：离屏或后台时循环停在 await 上。 */
function visibleGate(element: Element): () => Promise<void> {
  let visible = false
  let waiting: Array<() => void> = []
  inView(element, active => {
    visible = active
    if (!active) return
    waiting.forEach(resolve => resolve())
    waiting = []
  }, { once: false, threshold: USAGE_THRESHOLD })
  return () => (visible ? Promise.resolve() : new Promise<void>(resolve => waiting.push(resolve)))
}

/** 用量表：已用量 +1 时数字弹跳、进度条前进。 */
function meterBump(visual: HTMLElement): () => void {
  const meter = required(visual, '[data-meter]')
  const value = required(meter, '[data-meter-value]')
  const bar = required(meter, '[data-meter-bar]')
  const limit = Number(meter.dataset.limit)
  let used = Number(meter.dataset.used)
  return () => {
    used += 1
    value.textContent = formatNumber(used)
    value.classList.remove('is-bump')
    void value.offsetWidth
    value.classList.add('is-bump')
    bar.style.setProperty('--p', String(used / limit))
  }
}

/** 模板里的样例行与首屏预置下标（data-preset）。 */
function samplesOf(visual: HTMLElement, list: HTMLElement, template: string, row: string) {
  const samples = Array.from(required<HTMLTemplateElement>(visual, template).content.querySelectorAll<HTMLElement>(row))
  const preset = (list.dataset.preset ?? '').split(',').map(Number)
  return { samples, preset }
}

/** ④ records：每入列一行商户 +1；评论 / 照片 / 补全挂在行上，+0。 */
function setupRecords(visual: HTMLElement): void {
  const list = required(visual, '[data-ur-list]')
  const { samples, preset } = samplesOf(visual, list, '[data-ur-samples]', '.ur-row')
  preset.forEach(index => list.append(document.importNode(samples[index], true)))
  if (reducedMotion()) return

  const bump = meterBump(visual)
  const ready = visibleGate(visual)
  const leaveMs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-3'))
  void (async () => {
    for (let index = 0; ; index++) {
      await ready()
      const row = document.importNode(samples[index % samples.length], true)
      const attach = required(row, '.ur-attach')
      const chips = Array.from(attach.children)
      attach.replaceChildren()
      list.prepend(row)
      bump()
      // 旧行淡出，最多保留 3 行
      const rows = list.querySelectorAll<HTMLElement>('.ur-row:not(.is-leaving)')
      if (rows.length > RECORD_MAX_ROWS) {
        const old = rows[rows.length - 1]
        old.classList.add('is-leaving')
        window.setTimeout(() => old.remove(), leaveMs)
      }
      await wait(RECORD_SETTLE_MS)
      for (const chip of chips) {
        attach.append(chip)
        await wait(RECORD_ATTACH_MS)
      }
      await wait(RECORD_HOLD_MS)
    }
  })()
}

/** ④ requests：成功调用 +1，失败调用不计。 */
function setupRequests(visual: HTMLElement): void {
  const list = required(visual, '[data-ul-list]')
  const { samples, preset } = samplesOf(visual, list, '[data-ul-samples]', '.ul-line')
  preset.forEach(index => list.append(document.importNode(samples[index], true)))
  if (reducedMotion()) return

  const bump = meterBump(visual)
  const ready = visibleGate(visual)
  void (async () => {
    for (let index = 0; ; index++) {
      await ready()
      const line = document.importNode(samples[index % samples.length], true)
      list.prepend(line)
      if (line.dataset.counted === 'true') bump()
      const lines = list.querySelectorAll('.ul-line')
      if (lines.length > REQUEST_MAX_LINES) lines[lines.length - 1].remove()
      await wait(REQUEST_STEP_MS)
    }
  })()
}

/** 页面入口：面板估算条、对比表跟随、价格滚动与用量动画。 */
function initPricingPage(root: HTMLElement): void {
  const tabs = required(root, '[data-pricing-tabs]')
  const panels = new Map(Array.from(root.querySelectorAll<HTMLElement>('[data-pricing-panel]'), panel => [panel.dataset.pricingPanel ?? '', panel]))
  panels.forEach(setupFinder)
  const showCompare = setupCompare(tabs, required(root, '#compare'))

  let current = selectedKey(tabs)
  showCompare(current, false)
  const initialPanel = panels.get(current)
  if (initialPanel) requestAnimationFrame(() => centerFeatured(initialPanel))
  // 站级 tabs 初始化时也会派发一次 tabchange（值等于预选的产品线），忽略即可
  tabs.addEventListener('tabchange', () => {
    const key = selectedKey(tabs)
    if (key === current) return
    current = key
    const panel = panels.get(key)
    if (panel) {
      rollPrices(panel)
      requestAnimationFrame(() => centerFeatured(panel))
    }
    showCompare(key, true)
  })

  setupRecords(required(root, '[data-usage-records]'))
  setupRequests(required(root, '[data-usage-requests]'))
}

const root = document.querySelector<HTMLElement>('[data-pricing-page]')
if (root) initPricingPage(root)
