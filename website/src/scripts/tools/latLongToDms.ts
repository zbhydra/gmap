/**
 * Convert Lat Long to DMS 工具交互（W4）。
 *
 * 十经纬度十进制度输入 → ddToDms 纯函数 → DMS 双轴文本 + 复制。
 */

import { ddToDms, formatDms } from './lib/coordinates'
import { copyTextWithFeedback, queryRequired, reportToolView } from './toolDom'
import type { LatLongToDmsContent, ToolCommonMessage } from '../../i18n/schema'

interface ToolCopy {
  common: ToolCommonMessage
  content: LatLongToDmsContent
}

function initLatLongToDms(root: HTMLElement): void {
  const copy = getToolCopy(root)
  const form = queryRequired<HTMLFormElement>(root, '[data-tool-form]')
  const latitudeInput = queryRequired<HTMLInputElement>(root, '[data-latitude]')
  const longitudeInput = queryRequired<HTMLInputElement>(root, '[data-longitude]')
  const errorBox = queryRequired<HTMLElement>(root, '[data-tool-error]')
  const resultSection = queryRequired<HTMLElement>(root, '[data-tool-result]')
  const dmsValue = queryRequired<HTMLElement>(root, '[data-dms-value]')

  reportToolView('lat-long-to-dms')

  form.addEventListener('submit', event => {
    event.preventDefault()
    setError(errorBox, '')

    const latitude = Number(latitudeInput.value.trim())
    const longitude = Number(longitudeInput.value.trim())
    let hasError = false
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setError(errorBox, copy.content.form.errorLatitude)
      hasError = true
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError(errorBox, hasError ? `${copy.content.form.errorLatitude} ${copy.content.form.errorLongitude}` : copy.content.form.errorLongitude)
      hasError = true
    }
    if (hasError) {
      resultSection.hidden = true
      return
    }

    dmsValue.textContent = `${formatDms(ddToDms(latitude, 'lat'))}, ${formatDms(ddToDms(longitude, 'lng'))}`
    resultSection.hidden = false
  })

  root.querySelector<HTMLButtonElement>('[data-copy-dms]')?.addEventListener('click', () => {
    void copyTextWithFeedback(dmsValue.textContent ?? '', copy.common.copied)
  })
}

function getToolCopy(root: HTMLElement): ToolCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-tool-copy]')
  if (!element?.textContent) {
    throw new Error('[lat-long-to-dms] Missing tool copy payload.')
  }
  return JSON.parse(element.textContent) as ToolCopy
}

function setError(box: HTMLElement, message: string): void {
  box.textContent = message
  box.hidden = message.length === 0
}

const root = document.querySelector<HTMLElement>('[data-tool-page="lat-long-to-dms"]')
if (root) {
  initLatLongToDms(root)
}
