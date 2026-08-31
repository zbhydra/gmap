/**
 * Bulk Keywords Generator 工具交互（W4）。
 *
 * 关键词列表 × 地点列表 → generateKeywordCombinations 纯函数 → 结果文本 +
 * 组合计数 + 复制 / 下载 CSV。
 */

import { generateKeywordCombinations, type KeywordOrder } from './lib/keywords'
import { copyTextWithFeedback, queryRequired, reportToolView } from './toolDom'
import { showSiteToast } from '../site/toast'
import type { BulkKeywordsContent, ToolCommonMessage } from '../../i18n/schema'

interface ToolCopy {
  common: ToolCommonMessage
  content: BulkKeywordsContent
}

function initBulkKeywords(root: HTMLElement): void {
  const copy = getToolCopy(root)
  const form = queryRequired<HTMLFormElement>(root, '[data-tool-form]')
  const keywordsInput = queryRequired<HTMLTextAreaElement>(root, '[data-keywords]')
  const locationsInput = queryRequired<HTMLTextAreaElement>(root, '[data-locations]')
  const orderInput = queryRequired<HTMLSelectElement>(root, '[data-order]')
  const errorBox = queryRequired<HTMLElement>(root, '[data-tool-error]')
  const resultSection = queryRequired<HTMLElement>(root, '[data-tool-result]')
  const countSummary = queryRequired<HTMLElement>(root, '[data-count-summary]')
  const output = queryRequired<HTMLTextAreaElement>(root, '[data-combinations]')

  reportToolView('bulk-keywords')

  form.addEventListener('submit', event => {
    event.preventDefault()
    setError(errorBox, '')

    const keywords = keywordsInput.value.split('\n')
    const locations = locationsInput.value.split('\n')
    if (cleanedLength(keywords) === 0) {
      setError(errorBox, copy.content.form.errorKeywords)
      resultSection.hidden = true
      return
    }
    if (cleanedLength(locations) === 0) {
      setError(errorBox, copy.content.form.errorLocations)
      resultSection.hidden = true
      return
    }

    const order = (orderInput.value === 'location-first' ? 'location-first' : 'keyword-first') as KeywordOrder
    const combinations = generateKeywordCombinations(keywords, locations, order)
    output.value = combinations.join('\n')
    countSummary.textContent = copy.content.form.resultCount.replace('{count}', String(combinations.length))
    resultSection.hidden = false
  })

  root.querySelector<HTMLButtonElement>('[data-copy-combinations]')?.addEventListener('click', () => {
    void copyTextWithFeedback(output.value, copy.common.copied)
  })
  root.querySelector<HTMLButtonElement>('[data-download-combinations]')?.addEventListener('click', () => {
    downloadCsv(output.value.split('\n'), copy.common)
  })
}

/** 非空行计数（与 lib 的清洗口径一致：trim 后非空才算有效行）。 */
function cleanedLength(lines: readonly string[]): number {
  return lines.map(line => line.trim()).filter(line => line.length > 0).length
}

/** 组合列表下载为单列 CSV（keyword 列名，便于直接进批处理工具）。 */
function downloadCsv(combinations: readonly string[], common: ToolCommonMessage): void {
  const csv = ['keyword', ...combinations].map(value => (/[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value)).join('\r\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'bulk-keywords.csv'
  anchor.click()
  URL.revokeObjectURL(url)
  showSiteToast(common.copied, { type: 'success' })
}

function getToolCopy(root: HTMLElement): ToolCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-tool-copy]')
  if (!element?.textContent) {
    throw new Error('[bulk-keywords] Missing tool copy payload.')
  }
  return JSON.parse(element.textContent) as ToolCopy
}

function setError(box: HTMLElement, message: string): void {
  box.textContent = message
  box.hidden = message.length === 0
}

const root = document.querySelector<HTMLElement>('[data-tool-page="bulk-keywords-generator"]')
if (root) {
  initBulkKeywords(root)
}
