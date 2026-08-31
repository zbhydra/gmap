/**
 * Merge CSV Files Online 工具交互（W4）。
 *
 * 多文件选择 → FileReader 本地读取 → mergeCsvFiles 纯前端合并（表头并集）
 * → 结果预览 + 统计 + 下载。文件全程不离开浏览器（D1 交互口径）。
 */

import { mergeCsvFiles, parseCsv, toCsv, type MergeFileSummary } from './lib/csv'
import { queryRequired, reportToolView } from './toolDom'
import { showSiteToast } from '../site/toast'
import type { MergeCsvContent, ToolCommonMessage } from '../../i18n/schema'

interface ToolCopy {
  common: ToolCommonMessage
  content: MergeCsvContent
}

/** FileReader 的 Promise 包装。 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')))
    reader.addEventListener('error', () => reject(reader.error ?? new Error(`[merge-csv] Failed to read file: ${file.name}`)))
    reader.readAsText(file)
  })
}

function initMergeCsv(root: HTMLElement): void {
  const copy = getToolCopy(root)
  const form = queryRequired<HTMLFormElement>(root, '[data-tool-form]')
  const fileInput = queryRequired<HTMLInputElement>(root, '[data-tool-files]')
  const errorBox = queryRequired<HTMLElement>(root, '[data-tool-error]')
  const fileSummaries = queryRequired<HTMLElement>(root, '[data-file-summaries]')
  const resultSection = queryRequired<HTMLElement>(root, '[data-tool-result]')
  const resultSummary = queryRequired<HTMLElement>(root, '[data-result-summary]')
  const preview = queryRequired<HTMLTextAreaElement>(root, '[data-merged-preview]')
  // 下载用的原始 CSV（textarea 的 value 会把 CRLF 归一化为 LF，不能读回）。
  let mergedCsvText = ''

  reportToolView('merge-csv')

  fileInput.addEventListener('change', () => {
    setError(errorBox, '')
    resultSection.hidden = true
  })

  form.addEventListener('submit', event => {
    event.preventDefault()
    setError(errorBox, '')
    resultSection.hidden = true

    const files = [...(fileInput.files ?? [])]
    if (files.length < 2) {
      setError(errorBox, copy.content.form.errorNoFiles)
      return
    }

    void (async () => {
      try {
        const contents = await Promise.all(
          files.map(async file => ({ name: file.name, text: await readFileAsText(file) }))
        )
        const summaries = contents.map(file => {
          const parsed = parseCsv(file.text)
          return { name: file.name, rowCount: parsed?.rows.length ?? 0 }
        })
        const merged = mergeCsvFiles(contents)
        if (!merged.ok) {
          setError(
            errorBox,
            merged.error === 'empty-file'
              ? copy.content.form.errorEmptyFile.replace('{name}', merged.fileName)
              : copy.content.form.errorNoFiles
          )
          renderFileSummaries(fileSummaries, [], copy)
          return
        }

        renderFileSummaries(fileSummaries, summaries, copy)
        resultSummary.textContent = copy.content.form.resultSummary
          .replace('{files}', String(contents.length))
          .replace('{rows}', String(merged.rows.length))
          .replace('{columns}', String(merged.header.length))
        mergedCsvText = toCsv(merged.header, merged.rows)
        preview.value = mergedCsvText
        resultSection.hidden = false
      } catch (error) {
        console.error('[merge-csv] Failed to read uploaded files.', error)
        setError(errorBox, copy.common.genericError)
      }
    })()
  })

  root.querySelector<HTMLButtonElement>('[data-download-merged]')?.addEventListener('click', () => {
    if (mergedCsvText.length === 0) {
      return
    }
    const blob = new Blob([`\ufeff${mergedCsvText}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'merged.csv'
    anchor.click()
    URL.revokeObjectURL(url)
    showSiteToast(copy.common.copied, { type: 'success' })
  })
}

/** 渲染每文件行数摘要。 */
function renderFileSummaries(host: HTMLElement, summaries: readonly MergeFileSummary[], copy: ToolCopy): void {
  host.textContent = ''
  for (const summary of summaries) {
    const item = document.createElement('li')
    item.textContent = copy.content.form.fileSummary
      .replace('{name}', summary.name)
      .replace('{rows}', String(summary.rowCount))
    host.append(item)
  }
}

/** 从 JSON script 读取工具文案。 */
function getToolCopy(root: HTMLElement): ToolCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-tool-copy]')
  if (!element?.textContent) {
    throw new Error('[merge-csv] Missing tool copy payload.')
  }
  return JSON.parse(element.textContent) as ToolCopy
}

/** 写入并同步错误框 hidden 态。 */
function setError(box: HTMLElement, message: string): void {
  box.textContent = message
  box.hidden = message.length === 0
}

const root = document.querySelector<HTMLElement>('[data-tool-page="merge-csv"]')
if (root) {
  initMergeCsv(root)
}
