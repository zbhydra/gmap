/**
 * Place Id Finder 工具交互（W4）。
 *
 * 输入完整 Maps 链接 → parsePlaceUrl 纯前端解析 → 展示 Place ID / CID / FID，
 * 每字段独立复制。解析失败按稳定原因码就地报错，可重试。
 */

import { parsePlaceUrl } from './lib/placeUrl'
import { copyTextWithFeedback, queryRequired, reportToolView } from './toolDom'
import type { PlaceIdFinderContent, ToolCommonMessage } from '../../i18n/schema'

interface ToolCopy {
  common: ToolCommonMessage
  content: PlaceIdFinderContent
}

function initPlaceIdFinder(root: HTMLElement): void {
  const copy = getToolCopy(root)
  const form = queryRequired<HTMLFormElement>(root, '[data-tool-form]')
  const urlInput = queryRequired<HTMLInputElement>(root, '[data-tool-input]')
  const errorBox = queryRequired<HTMLElement>(root, '[data-tool-error]')
  const resultSection = queryRequired<HTMLElement>(root, '[data-tool-result]')
  const placeIdValue = queryRequired<HTMLElement>(root, '[data-place-id]')
  const cidValue = queryRequired<HTMLElement>(root, '[data-cid]')
  const fidValue = queryRequired<HTMLElement>(root, '[data-fid]')

  reportToolView('place-id-finder')

  form.addEventListener('submit', event => {
    event.preventDefault()
    setError(errorBox, '')
    const outcome = parsePlaceUrl(urlInput.value)
    if (!outcome.ok) {
      setError(errorBox, getErrorMessage(copy, outcome.error))
      resultSection.hidden = true
      return
    }

    placeIdValue.textContent = outcome.placeId
    cidValue.textContent = outcome.cid
    fidValue.textContent = outcome.fid
    resultSection.hidden = false
  })

  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-copy-target]')) {
    button.addEventListener('click', () => {
      const source = queryRequired<HTMLElement>(root, `#${button.getAttribute('data-copy-target') ?? ''}`)
      void copyTextWithFeedback(source.textContent ?? '', copy.common.copied)
    })
  }
}

/** 原因码 → 用户可见文案。 */
function getErrorMessage(copy: ToolCopy, error: 'short-link' | 'invalid-url' | 'no-ids'): string {
  if (error === 'short-link') {
    return copy.content.form.errorShortLink
  }
  if (error === 'no-ids') {
    return copy.content.form.errorNoIds
  }
  return copy.content.form.errorInvalidUrl
}

/** 从 JSON script 读取工具文案。 */
function getToolCopy(root: HTMLElement): ToolCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-tool-copy]')
  if (!element?.textContent) {
    throw new Error('[place-id-finder] Missing tool copy payload.')
  }
  return JSON.parse(element.textContent) as ToolCopy
}

/** 写入并同步错误框 hidden 态。 */
function setError(box: HTMLElement, message: string): void {
  box.textContent = message
  box.hidden = message.length === 0
}

const root = document.querySelector<HTMLElement>('[data-tool-page="place-id-finder"]')
if (root) {
  initPlaceIdFinder(root)
}
