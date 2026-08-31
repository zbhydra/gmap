/**
 * Review Link Generator 工具交互（W4）。
 *
 * 输入完整 Maps 链接 → 本地解析 Place ID → 构造
 * `https://search.google.com/local/reviews?placeid=…` 评论直链，附复制/打开。
 * fid → Place ID 换算与 Place Id Finder 同源（lib/placeUrl）。
 */

import { parsePlaceUrl } from './lib/placeUrl'
import { copyTextWithFeedback, queryRequired, reportToolView } from './toolDom'
import type { PlaceUrlErrorCode } from './lib/placeUrl'
import type { ReviewLinkGeneratorContent, ToolCommonMessage } from '../../i18n/schema'

/** Google 评论直链模板（placeid 为唯一参数）。 */
const REVIEW_LINK_TEMPLATE = 'https://search.google.com/local/reviews?placeid='

interface ToolCopy {
  common: ToolCommonMessage
  content: ReviewLinkGeneratorContent
}

function initReviewLinkGenerator(root: HTMLElement): void {
  const copy = getToolCopy(root)
  const form = queryRequired<HTMLFormElement>(root, '[data-tool-form]')
  const urlInput = queryRequired<HTMLInputElement>(root, '[data-tool-input]')
  const errorBox = queryRequired<HTMLElement>(root, '[data-tool-error]')
  const resultSection = queryRequired<HTMLElement>(root, '[data-tool-result]')
  const linkValue = queryRequired<HTMLElement>(root, '[data-review-link]')
  const openLink = queryRequired<HTMLAnchorElement>(root, '[data-review-open]')

  reportToolView('review-link-generator')

  form.addEventListener('submit', event => {
    event.preventDefault()
    setError(errorBox, '')
    const outcome = parsePlaceUrl(urlInput.value)
    if (!outcome.ok || outcome.placeId.length === 0) {
      setError(errorBox, getErrorMessage(copy, outcome.ok ? 'no-ids' : outcome.error))
      resultSection.hidden = true
      return
    }

    const reviewLink = `${REVIEW_LINK_TEMPLATE}${outcome.placeId}`
    linkValue.textContent = reviewLink
    openLink.href = reviewLink
    resultSection.hidden = false
  })

  root.querySelector<HTMLButtonElement>('[data-copy-review-link]')?.addEventListener('click', () => {
    void copyTextWithFeedback(linkValue.textContent ?? '', copy.common.copied)
  })
}

function getErrorMessage(copy: ToolCopy, error: PlaceUrlErrorCode): string {
  if (error === 'short-link') {
    return copy.content.form.errorShortLink
  }
  if (error === 'no-ids') {
    return copy.content.form.errorNoIds
  }
  return copy.content.form.errorInvalidUrl
}

function getToolCopy(root: HTMLElement): ToolCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-tool-copy]')
  if (!element?.textContent) {
    throw new Error('[review-link-generator] Missing tool copy payload.')
  }
  return JSON.parse(element.textContent) as ToolCopy
}

function setError(box: HTMLElement, message: string): void {
  box.textContent = message
  box.hidden = message.length === 0
}

const root = document.querySelector<HTMLElement>('[data-tool-page="review-link-generator"]')
if (root) {
  initReviewLinkGenerator(root)
}
