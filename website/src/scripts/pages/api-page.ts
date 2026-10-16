/**
 * API 落地页交互（components/pages/ApiPage.astro）：
 * - 首屏代码台：请求逐字打出 → 发送 → 响应逐行流入；切换请求语言或点重放时重来，复制按钮始终复制当前语言的完整请求。
 * - fid 串联：Search 结果出现 → 选中首条 → fid 令牌沿连线移动 → 填入 Reviews 请求 → 评论出现，在视口内循环。
 * 两处的终态都直接写在 HTML 里：无 JS 与减弱动效下原样展示，脚本只清空 Shiki 输出的文本节点再按进度还原，不重建高亮。
 */
import { inView, reducedMotion, wait } from '../site/motion'

/** 打字总时长（与请求长度无关，长样例打得更快）、发送停顿与响应逐行间隔（ms）。 */
const TYPE_DURATION_MS = 1500
const TYPE_TICK_MS = 16
const SEND_MS = 900
const LINE_MS = 42
/** 首屏代码台在 data-reveal-onload（520ms）显现之后再开始打字。 */
const START_DELAY_MS = 760

/** 串联各相位的停留时长（ms），相位类与 ApiPage.astro 的 .chain.is-* 样式一一对应。 */
const CHAIN_PHASES: ReadonlyArray<readonly [string, number]> = [
  ['is-search', 1400],
  ['is-pick', 800],
  ['is-travel', 1300],
  ['is-fill', 700],
  ['is-reviews', 3400]
]
const CHAIN_RESET_MS = 700

/** 文本节点进度显示器：show(n) 只显示前 n 个字符，光标（可选）跟在最后一个可见字符之后。 */
interface Revealer {
  /** 完整文本（复制与逐行流入的依据）。 */
  readonly text: string
  show(count: number, caret?: HTMLElement): void
}

function createRevealer(root: HTMLElement): Revealer {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof Text) nodes.push(node)
  }
  const texts = nodes.map(node => node.data)
  return {
    text: texts.join(''),
    show(count, caret) {
      let rest = count
      let anchor: Text | null = null
      for (let index = 0; index < nodes.length; index++) {
        const visible = Math.max(0, Math.min(texts[index].length, rest))
        nodes[index].data = texts[index].slice(0, visible)
        if (visible > 0) anchor = nodes[index]
        rest -= texts[index].length
      }
      if (!caret) return
      if (anchor) anchor.after(caret)
      else root.prepend(caret)
    }
  }
}

function initConsole(consoleEl: HTMLElement): void {
  const requestPanels = Array.from(consoleEl.querySelectorAll<HTMLElement>('[data-api-request]'))
  const response = consoleEl.querySelector<HTMLElement>('[data-api-response]')
  const status = consoleEl.querySelector<HTMLElement>('[data-api-status]')
  const statusText = consoleEl.querySelector<HTMLElement>('[data-api-status-text]')
  const copyButton = consoleEl.querySelector<HTMLElement>('[data-api-copy]')
  const replay = consoleEl.querySelector<HTMLButtonElement>('[data-api-replay]')
  const responsePre = response?.querySelector<HTMLElement>('pre')
  if (!response || !status || !statusText || !copyButton || !replay || !responsePre) {
    throw new Error('[api-page] Console markup is incomplete.')
  }
  const requests = new Map(requestPanels.map(panel => {
    const pre = panel.querySelector<HTMLElement>('pre')
    if (!pre) throw new Error('[api-page] Request panel has no code block.')
    return [panel, createRevealer(pre)] as const
  }))
  const output = createRevealer(responsePre)
  const labels = consoleEl.dataset
  const currentRequest = () => {
    const panel = requestPanels.find(item => !item.hidden) ?? requestPanels[0]
    const revealer = requests.get(panel)
    if (!revealer) throw new Error('[api-page] Request panel has no revealer.')
    return revealer
  }
  const setStatus = (state: 'ready' | 'composing' | 'sending' | 'done') => {
    const text = { ready: labels.statusReady, composing: labels.statusComposing, sending: labels.statusSending, done: labels.statusDone }[state]
    statusText.textContent = text ?? ''
    status.classList.toggle('is-sending', state === 'sending')
    status.classList.toggle('is-ok', state === 'done')
  }

  const caret = document.createElement('span')
  caret.className = 'caret'
  caret.setAttribute('aria-hidden', 'true')
  const reset = () => {
    requests.forEach(revealer => revealer.show(0))
    output.show(0)
    response.classList.add('is-waiting')
  }

  let started = false
  let run = 0
  const play = async (): Promise<void> => {
    const id = ++run
    const request = currentRequest()
    reset()
    setStatus('composing')
    const total = request.text.length
    const step = Math.max(1, Math.ceil(total / (TYPE_DURATION_MS / TYPE_TICK_MS)))
    for (let count = 0; count < total; count += step) {
      request.show(count, caret)
      await wait(TYPE_TICK_MS)
      if (id !== run) return
    }
    request.show(total)
    caret.remove()
    setStatus('sending')
    await wait(SEND_MS)
    if (id !== run) return
    response.classList.remove('is-waiting')
    setStatus('done')
    const breaks = [...output.text.matchAll(/\n/g)].map(match => (match.index ?? 0) + 1)
    for (const end of breaks) {
      output.show(end)
      await wait(LINE_MS)
      if (id !== run) return
    }
    output.show(output.text.length)
  }

  // 复制按钮跟随当前语言（初次派发的 tabchange 也会走到这里）；开播后切换语言即重放。
  consoleEl.addEventListener('tabchange', () => {
    copyButton.dataset.copy = currentRequest().text
    if (started) void play()
  })
  if (reducedMotion()) return

  reset()
  setStatus('ready')
  replay.hidden = false
  replay.addEventListener('click', () => void play())
  inView(consoleEl, visible => {
    if (!visible) return
    started = true
    void wait(START_DELAY_MS).then(play)
  }, { threshold: 0.3 })
}

function initChain(chain: HTMLElement): void {
  if (reducedMotion()) return
  const phases = CHAIN_PHASES.map(([name]) => name)
  let run = 0
  const clear = () => chain.classList.remove(...phases)
  const loop = async (id: number) => {
    while (id === run) {
      for (const [phase, hold] of CHAIN_PHASES) {
        chain.classList.add(phase)
        await wait(hold)
        if (id !== run) return
      }
      chain.classList.add('is-reset')
      clear()
      await wait(CHAIN_RESET_MS)
      chain.classList.remove('is-reset')
    }
  }
  chain.classList.add('is-armed')
  inView(chain, visible => {
    run += 1
    clear()
    if (visible) void loop(run)
  }, { once: false, threshold: 0.35 })
}

/** ApiPage.astro 调用一次。 */
export function initApiPage(): void {
  const consoleEl = document.querySelector<HTMLElement>('[data-api-console]')
  if (consoleEl) initConsole(consoleEl)
  const chain = document.querySelector<HTMLElement>('[data-chain]')
  if (chain) initChain(chain)
}
