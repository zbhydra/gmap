/**
 * Convert DMS to DD 工具交互（W4）。
 *
 * 度/分/秒 + 半球输入 → validateDmsInput + dmsToDd 纯函数 → 双轴十进制度文本 + 复制。
 * 半球字母与负号冲突（如 S + 负值）就地报错，不做猜测。
 */

import { dmsToDd, validateDmsInput, type DmsInput } from './lib/coordinates'
import { copyTextWithFeedback, queryRequired, reportToolView } from './toolDom'
import type { DmsToDdContent, ToolCommonMessage } from '../../i18n/schema'

interface ToolCopy {
  common: ToolCommonMessage
  content: DmsToDdContent
}

/** 读取一个轴的 度/分/秒 + 半球 输入；非法返回 null（负值/越界按 values 非法）。 */
function readAxis(root: ParentNode, axis: 'lat' | 'lng'): DmsInput | null {
  const degreesRaw = queryRequired<HTMLInputElement>(root, `[data-${axis}-degrees]`).value.trim()
  const minutesRaw = queryRequired<HTMLInputElement>(root, `[data-${axis}-minutes]`).value.trim()
  const secondsRaw = queryRequired<HTMLInputElement>(root, `[data-${axis}-seconds]`).value.trim()
  const hemisphere = queryRequired<HTMLSelectElement>(root, `[data-${axis}-hemisphere]`).value as DmsInput['hemisphere']

  const degrees = Number(degreesRaw)
  const minutes = minutesRaw.length === 0 ? 0 : Number(minutesRaw)
  const seconds = secondsRaw.length === 0 ? 0 : Number(secondsRaw)
  const validation = validateDmsInput(degrees, minutes, seconds)
  if (!validation.ok) {
    return null
  }
  return { degrees, minutes, seconds, hemisphere }
}

function initDmsToDd(root: HTMLElement): void {
  const copy = getToolCopy(root)
  const form = queryRequired<HTMLFormElement>(root, '[data-tool-form]')
  const errorBox = queryRequired<HTMLElement>(root, '[data-tool-error]')
  const resultSection = queryRequired<HTMLElement>(root, '[data-tool-result]')
  const ddValue = queryRequired<HTMLElement>(root, '[data-dd-value]')

  reportToolView('dms-to-dd')

  form.addEventListener('submit', event => {
    event.preventDefault()
    setError(errorBox, '')

    const latitudeInput = readAxis(root, 'lat')
    const longitudeInput = readAxis(root, 'lng')
    if (latitudeInput === null || longitudeInput === null) {
      setError(errorBox, copy.content.form.errorValues)
      resultSection.hidden = true
      return
    }

    const latitudeValue = dmsToDd(latitudeInput)
    const longitudeValue = dmsToDd(longitudeInput)
    ddValue.textContent = `${latitudeValue.toFixed(6)}, ${longitudeValue.toFixed(6)}`
    resultSection.hidden = false
  })

  root.querySelector<HTMLButtonElement>('[data-copy-dd]')?.addEventListener('click', () => {
    void copyTextWithFeedback(ddValue.textContent ?? '', copy.common.copied)
  })
}

function getToolCopy(root: HTMLElement): ToolCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-tool-copy]')
  if (!element?.textContent) {
    throw new Error('[dms-to-dd] Missing tool copy payload.')
  }
  return JSON.parse(element.textContent) as ToolCopy
}

function setError(box: HTMLElement, message: string): void {
  box.textContent = message
  box.hidden = message.length === 0
}

const root = document.querySelector<HTMLElement>('[data-tool-page="dms-to-dd"]')
if (root) {
  initDmsToDd(root)
}
