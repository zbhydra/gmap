/**
 * 评论/照片工作页的小面板（Shadow DOM，复用 panel.css 的 design token）。
 *
 * 两态渲染（竞品评论区/照片页 UI 语义）：
 * - extracting：Extracting {count}…（实时计数）；
 * - complete：Export Reviews/Photos - {count} (.CSV) + Reset（重采）。
 *
 * 与搜索面板（MapsPanel）分离：本面板无 Pause/Resume——评论/照片采集是
 * 单地点短流程，竞品同形态。文案全部走 i18n。
 */

import panelStyles from './panel.css?inline'
import { I18nService } from '@/locales/index'
import { I18N_KEYS } from '@/core/constants/i18n'
import { searchExportExtLabel, type SearchExportFormat } from '../export/engine'

/** 工作面板宿主元素 id 前缀（reviews/photos 各自拼接）。 */
export const EXTRACTION_PANEL_HOST_PREFIX = 'gmap-extractor-work-panel'

/** 工作面板状态。 */
export type ExtractionStatus = 'extracting' | 'complete'

/** 面板回调。 */
export interface ExtractionPanelCallbacks {
  /** 导出当前结果。 */
  onExport: () => void
  /** 重置并重新开始采集。 */
  onReset: () => void
}

/** 面板渲染输入。 */
export interface ExtractionPanelState {
  status: ExtractionStatus
  count: number
  /** 导出格式（决定导出按钮后缀文案，来自用户设置）。 */
  format: SearchExportFormat
}

/**
 * 评论/照片工作页面板。
 *
 * @param hostId 宿主元素 id（reviews/photos 区分，防同页重复挂载）。
 * @param exportLabelKey 导出按钮文案 key（评论/照片各自列数不同）。
 */
export class ExtractionPanel {
  private readonly callbacks: ExtractionPanelCallbacks

  private readonly hostId: string

  private readonly exportLabelKey: string

  private host: HTMLElement | null = null

  private panelElement: HTMLElement | null = null

  private hintElement: HTMLElement | null = null

  private errorElement: HTMLElement | null = null

  private exportButton: HTMLButtonElement | null = null

  private resetButton: HTMLButtonElement | null = null

  constructor(hostId: string, exportLabelKey: string, callbacks: ExtractionPanelCallbacks) {
    this.hostId = hostId
    this.exportLabelKey = exportLabelKey
    this.callbacks = callbacks
  }

  /**
   * 挂载面板（等待 body 可用即挂；工作页结构简单，无需等业务容器）。
   */
  async mount(): Promise<void> {
    if (document.getElementById(this.hostId)) {
      return
    }

    const host = document.createElement('div')
    host.id = this.hostId
    document.body.appendChild(host)

    const shadow = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = panelStyles
    shadow.appendChild(style)

    const panel = document.createElement('div')
    panel.className = 'panel panel-side-left'
    shadow.appendChild(panel)

    this.host = host
    this.panelElement = panel
    this.buildStructure()
    this.render({ status: 'extracting', count: 0, format: 'csv' })
  }

  /** 按状态渲染两态 UI。 */
  render(state: ExtractionPanelState): void {
    if (!this.panelElement || !this.hintElement || !this.exportButton || !this.resetButton) {
      return
    }

    if (state.status === 'extracting') {
      this.hintElement.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.EXTRACTING, {
        count: state.count
      })
      this.hintElement.style.display = 'block'
      this.exportButton.style.display = 'none'
      this.resetButton.style.display = 'none'
      return
    }

    this.hintElement.style.display = 'none'
    this.exportButton.textContent = I18nService.t(this.exportLabelKey, {
      count: state.count,
      ext: searchExportExtLabel(state.format)
    })
    this.exportButton.style.display = 'block'
    this.exportButton.onclick = this.callbacks.onExport
    this.resetButton.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.RESET)
    this.resetButton.style.display = 'block'
    this.resetButton.onclick = this.callbacks.onReset
  }

  /** 显示/隐藏错误行（失败不静默：UI 可见）。 */
  setError(message: string | null): void {
    if (!this.errorElement) {
      return
    }
    if (message === null) {
      this.errorElement.classList.remove('visible')
      this.errorElement.textContent = ''
      return
    }
    this.errorElement.textContent = message
    this.errorElement.classList.add('visible')
  }

  /** 卸载面板。 */
  destroy(): void {
    this.host?.remove()
    this.host = null
    this.panelElement = null
  }

  /** 构建 Shadow DOM 内部结构（结构只建一次，render 只改文案/显隐）。 */
  private buildStructure(): void {
    const panel = this.panelElement
    if (!panel) {
      return
    }

    const header = document.createElement('div')
    header.className = 'panel-header'

    const title = document.createElement('span')
    title.className = 'panel-title'
    title.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.TITLE)

    header.appendChild(title)

    const hint = document.createElement('p')
    hint.className = 'panel-hint'
    this.hintElement = hint

    const error = document.createElement('p')
    error.className = 'panel-error'
    this.errorElement = error

    const actions = document.createElement('div')
    actions.className = 'panel-actions'

    const exportButton = document.createElement('button')
    exportButton.type = 'button'
    exportButton.className = 'panel-button panel-button-primary'
    exportButton.style.display = 'none'
    this.exportButton = exportButton

    const resetButton = document.createElement('button')
    resetButton.type = 'button'
    resetButton.className = 'panel-button panel-button-outline'
    resetButton.style.display = 'none'
    this.resetButton = resetButton

    actions.appendChild(exportButton)
    actions.appendChild(resetButton)

    panel.appendChild(header)
    panel.appendChild(hint)
    panel.appendChild(error)
    panel.appendChild(actions)
  }
}

/**
 * 等待 document.body 就绪（document_start 注入时 body 尚未解析完）。
 */
export async function waitForBody(timeoutMs = 10_000): Promise<void> {
  const pollIntervalMs = 100
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (document.body) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }
  throw new Error('[ExtractionPanel] document.body 等待超时，无法挂载工作面板')
}
