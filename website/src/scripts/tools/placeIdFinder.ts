/**
 * Place ID Finder 工具交互（设计稿 place-id-finder ①③）。
 *
 * 逻辑：完整 Maps 链接 → parsePlaceUrl 纯前端解析 → Place ID / CID / FID 各自可复制；失败按原因码就地报错，可重试。
 * 视觉：URL 扫描 → 标识段点亮 → 按推导顺序 FID → CID → Place ID 逐行解码，新一次解析打断上一次；
 * 首屏自动键入城市示例演示一次，用户先聚焦输入框即取消，演示不点提交按钮、不上报 tool_use；
 * 推导图是 T4 循环（离屏或后台时停在下一拍），每次解析成功后换成该链接的 FID。减弱动效下一律直接给终态。
 */
import { BASE64URL_ALPHABET, deriveCidFromLrd, derivePlaceIdFromFid, parsePlaceUrl, placeIdBytes } from './lib/placeUrl'
import type { PlaceUrlErrorCode, PlaceUrlMark, PlaceUrlResult } from './lib/placeUrl'
import { copyTextWithFeedback, queryRequired, reportToolView } from './toolDom'
import { copyOf } from '../pages/product-page'
import { reducedMotion, tween, visibilityGate, wait } from '../site/motion'

type Decoded = Extract<PlaceUrlResult, { ok: true }>
type Alive = () => boolean

interface ResultRow {
  row: HTMLElement
  value: HTMLOutputElement
  copy: HTMLButtonElement
}

const DIGITS = '0123456789'
const MARK_TONES: Record<PlaceUrlMark['part'], string> = { 'fid-high': 'is-a', 'fid-low': 'is-b', 'place-id': 'is-place' }

function initPlaceIdFinder(root: HTMLElement): void {
  const panel = queryRequired<HTMLElement>(root, '[data-pid]')
  const form = queryRequired<HTMLFormElement>(panel, '[data-tool-form]')
  const input = queryRequired<HTMLInputElement>(panel, '[data-tool-input]')
  const bar = queryRequired<HTMLElement>(panel, '[data-pid-bar]')
  const errorBox = queryRequired<HTMLElement>(panel, '[data-tool-error]')
  const errorText = queryRequired<HTMLElement>(errorBox, '[data-pid-error-text]')
  const result = queryRequired<HTMLElement>(panel, '[data-pid-result]')
  const scan = queryRequired<HTMLElement>(panel, '[data-pid-scan]')
  const urlEmpty = queryRequired<HTMLElement>(panel, '[data-pid-url-empty]')
  const urlCode = queryRequired<HTMLElement>(panel, '[data-pid-url]')
  const examples = [...panel.querySelectorAll<HTMLButtonElement>('[data-pid-example]')]
  const rows = { fid: resultRow(panel, 'fid'), cid: resultRow(panel, 'cid'), place: resultRow(panel, 'place') }
  const errors: Record<PlaceUrlErrorCode, string> = {
    'short-link': copyOf(panel, 'errorShortLink'),
    'invalid-url': copyOf(panel, 'errorInvalidUrl'),
    'no-ids': copyOf(panel, 'errorNoIds')
  }
  const missing = copyOf(panel, 'missing')
  const copied = copyOf(panel, 'copied')
  const derive = deriveLoop(queryRequired<HTMLElement>(root, '[data-derive]'))
  let run = 0
  let demoPending = input.value.length === 0

  reportToolView('place-id-finder')

  const setActiveExample = (active: HTMLButtonElement | null) => {
    for (const example of examples) example.classList.toggle('is-active', example === active)
  }

  const showError = (code: PlaceUrlErrorCode | null) => {
    errorText.textContent = code ? errors[code] : ''
    errorBox.hidden = code === null
    if (!code) return
    // 重新触发抖动：先移除类并强制一次样式计算
    bar.classList.remove('is-shake')
    void bar.offsetWidth
    bar.classList.add('is-shake')
  }

  const renderUrl = (decoded: Decoded | null) => {
    urlCode.replaceChildren()
    urlEmpty.hidden = decoded !== null
    urlCode.hidden = decoded === null
    if (!decoded) return
    let cursor = 0
    for (const mark of decoded.marks) {
      if (mark.start < cursor) continue
      const highlight = document.createElement('mark')
      highlight.className = `pid-mark ${MARK_TONES[mark.part]}`
      highlight.textContent = decoded.url.slice(mark.start, mark.end)
      urlCode.append(decoded.url.slice(cursor, mark.start), highlight)
      cursor = mark.end
    }
    urlCode.append(decoded.url.slice(cursor))
    // 长 URL 时把第一个标识段滚到框内
    const first = urlCode.querySelector<HTMLElement>('.pid-mark')
    if (first) urlCode.scrollTop = Math.max(0, first.offsetTop - urlCode.offsetTop - urlCode.clientHeight / 2)
  }

  const decode = async (raw: string) => {
    const id = ++run
    const alive = () => id === run
    demoPending = false
    for (const row of Object.values(rows)) resetRow(row)
    result.removeAttribute('aria-busy')
    const outcome = parsePlaceUrl(raw)
    if (!outcome.ok) {
      showError(outcome.error)
      renderUrl(null)
      return
    }
    showError(null)
    renderUrl(outcome)
    result.setAttribute('aria-busy', 'true')
    if (!reducedMotion()) {
      scan.classList.remove('is-scanning')
      void scan.offsetWidth
      scan.classList.add('is-scanning')
    }
    for (const mark of urlCode.querySelectorAll('.pid-mark')) {
      await wait(reducedMotion() ? 0 : 260)
      if (!alive()) return
      mark.classList.add('is-lit')
    }
    await decodeRow(rows.fid, outcome.fid, '', 520, missing, alive)
    if (!alive()) return
    await decodeRow(rows.cid, outcome.cid, DIGITS, 640, missing, alive)
    if (!alive()) return
    await decodeRow(rows.place, outcome.placeId, BASE64URL_ALPHABET, 820, missing, alive)
    if (!alive()) return
    result.removeAttribute('aria-busy')
    if (outcome.fid) derive.show(outcome.fid)
  }

  form.addEventListener('submit', event => {
    event.preventDefault()
    setActiveExample(null)
    void decode(input.value)
  })

  for (const example of examples) {
    example.addEventListener('click', () => {
      setActiveExample(example)
      input.value = copyOf(example, 'pidExample')
      void decode(input.value)
    })
  }

  // 聚焦即全选，粘贴直接覆盖演示内容
  input.addEventListener('focus', () => {
    demoPending = false
    input.select()
  })

  for (const button of panel.querySelectorAll<HTMLButtonElement>('[data-copy-target]')) {
    button.addEventListener('click', () => {
      const source = queryRequired<HTMLElement>(panel, `#${copyOf(button, 'copyTarget')}`)
      void copyTextWithFeedback(source.textContent ?? '', copied)
      button.classList.add('is-copied')
      window.setTimeout(() => button.classList.remove('is-copied'), 1400)
    })
  }

  // 首屏演示：面板显现后逐段键入城市示例并解析
  const demo = async () => {
    const example = examples.find(item => item.dataset.pidExampleKey === 'city')
    if (!example || !demoPending) return
    const url = copyOf(example, 'pidExample')
    if (reducedMotion()) {
      setActiveExample(example)
      input.value = url
      void decode(url)
      return
    }
    await wait(1300)
    if (!demoPending) return
    setActiveExample(example)
    for (let length = 0; length <= url.length; length += 4) {
      if (!demoPending) return
      input.value = url.slice(0, length)
      input.scrollLeft = input.scrollWidth
      await wait(14)
    }
    input.value = url
    input.scrollLeft = 0
    await wait(260)
    if (demoPending) void decode(url)
  }
  void demo()
}

function resultRow(panel: HTMLElement, key: 'place' | 'cid' | 'fid'): ResultRow {
  const row = queryRequired<HTMLElement>(panel, `[data-pid-row="${key}"]`)
  return {
    row,
    value: queryRequired<HTMLOutputElement>(row, 'output'),
    copy: queryRequired<HTMLButtonElement>(row, '[data-copy-target]')
  }
}

function resetRow(row: ResultRow): void {
  row.row.classList.remove('is-done', 'is-decoding')
  row.value.textContent = '—'
  row.value.removeAttribute('aria-busy')
  row.copy.disabled = true
  row.copy.classList.remove('is-copied')
}

/** 逐行解码：解码期间 output（隐式 status 区域）标记 aria-busy，读屏只播最终值。 */
async function decodeRow(row: ResultRow, text: string, charset: string, duration: number, missing: string, alive: Alive): Promise<void> {
  row.row.classList.add('is-decoding')
  row.value.setAttribute('aria-busy', 'true')
  await scramble(row.value, text, charset, duration, alive)
  if (!alive()) return
  row.row.classList.remove('is-decoding')
  row.value.removeAttribute('aria-busy')
  if (text) {
    row.row.classList.add('is-done')
    row.copy.disabled = false
  } else {
    row.value.textContent = missing
  }
}

/** 字符解码：左侧字符逐个落定，其余位置用 charset 的随机字符占位（charset 为空即逐字打出）。 */
function scramble(element: HTMLElement, text: string, charset: string, duration: number, alive: Alive): Promise<void> {
  if (reducedMotion() || !text) {
    element.textContent = text
    return Promise.resolve()
  }
  return tween(duration, progress => {
    if (!alive()) return
    const settled = Math.floor(progress * text.length)
    let output = text.slice(0, settled)
    if (charset) {
      for (let index = settled; index < text.length; index++) output += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    element.textContent = output
  })
}

/**
 * 推导图：FID 点亮 → protobuf 字节展开 → base64url / 十进制 → 输出落定，停留后重播（T4 循环）。
 * 构建期已按城市示例输出终态；脚本在离屏时先复位，可见后开播。
 */
function deriveLoop(card: HTMLElement): { show: (fid: string) => void } {
  const gate = visibilityGate(card, 0.3)
  const highs = [...card.querySelectorAll<HTMLElement>('[data-dv-high]')]
  const lows = [...card.querySelectorAll<HTMLElement>('[data-dv-low]')]
  const bytes = [...card.querySelectorAll<HTMLElement>('[data-dv-byte]')]
  const steps = [...card.querySelectorAll<HTMLElement>('[data-dv-step]')]
  const placeOut = queryRequired<HTMLElement>(card, '[data-dv-place]')
  const cidOut = queryRequired<HTMLElement>(card, '[data-dv-cid]')
  let fid = copyOf(card, 'derive')
  let run = 0

  // 0 复位，1 FID 点亮，2 字节展开，3 编码，4 输出落定
  const setStage = (stage: number) => {
    card.classList.toggle('is-s1', stage >= 1)
    card.classList.toggle('is-s2', stage >= 2)
    card.classList.toggle('is-s3', stage >= 4)
    for (const step of steps) step.classList.toggle('is-on', stage >= (step.dataset.dvStep === '1' ? 2 : 3))
  }

  const fill = () => {
    const [high = '', low = ''] = fid.split(':')
    for (const element of highs) element.textContent = high
    for (const element of lows) element.textContent = low
    const values = placeIdBytes(fid) ?? []
    bytes.forEach((element, index) => {
      element.textContent = (values[index] ?? 0).toString(16).padStart(2, '0')
    })
  }

  const play = async () => {
    const id = ++run
    const alive = () => id === run
    const placeId = derivePlaceIdFromFid(fid)
    const cid = deriveCidFromLrd(fid.split(':')[1] ?? '')
    fill()
    if (reducedMotion()) {
      setStage(4)
      placeOut.textContent = placeId
      cidOut.textContent = cid
      return
    }
    for (;;) {
      setStage(0)
      placeOut.textContent = '—'
      cidOut.textContent = '—'
      await gate.wait()
      if (!alive()) return
      await gate.nap(500)
      if (!alive()) return
      setStage(1)
      await gate.nap(700)
      if (!alive()) return
      setStage(2)
      await gate.nap(1100)
      if (!alive()) return
      setStage(3)
      await Promise.all([
        scramble(placeOut, placeId, BASE64URL_ALPHABET, 1100, alive),
        scramble(cidOut, cid, DIGITS, 1100, alive)
      ])
      if (!alive()) return
      setStage(4)
      await gate.nap(4200)
      if (!alive()) return
    }
  }

  if (!reducedMotion()) void play()
  return {
    show: next => {
      if (next === fid) return
      fid = next
      void play()
    }
  }
}

const root = document.querySelector<HTMLElement>('[data-tool-page="place-id-finder"]')
if (root) {
  initPlaceIdFinder(root)
}
