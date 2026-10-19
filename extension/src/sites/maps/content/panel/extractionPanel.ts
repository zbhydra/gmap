/** 评论与照片工作页固定左侧；保留结果供提前停止或额度不足时导出。 */
import { I18nService } from '@/locales'
import { MapsUserSettingsManager } from '../../settings/userSettings'
import { getRunLimit } from '../../usage/usageClient'
import { isUsageExhausted, type MapsUsageSnapshot } from '../../usage/types'
import type { BulkWorkParams } from '../bulkAuto'
import { searchExportExtLabel, type SearchExportFormat } from '../export/engine'
import {
  createPanel,
  IconName,
  K,
  node,
  number,
  openPanelPricing,
  renderButton,
  renderContext,
  renderFooter,
  renderHeader,
  renderMessage,
  renderStatus,
  renderUpgrade
} from './panelView'

export const EXTRACTION_PANEL_HOST_PREFIX = 'gmap-extractor-work-panel'
export type ExtractionStatus = 'extracting' | 'complete' | 'stopped' | 'empty'
export interface ExtractionPanelCallbacks {
  onExport: () => void
  onReset: () => Promise<void>
}
export interface ExtractionPanelState {
  status: ExtractionStatus
  count: number
  format: SearchExportFormat
}

export class ExtractionPanel {
  private host: HTMLElement | null = null
  private panel: HTMLElement | null = null
  private checking = false
  private exported = false
  private exportedTimer: number | null = null
  private unsubscribeSettings: (() => void) | null = null
  private unsubscribeLanguage: (() => void) | null = null
  private error: 'quota' | 'unknown-place' | null = null
  private quotaRechecked = false
  private usage: MapsUsageSnapshot | null = null
  private limit = 0
  private bulk: BulkWorkParams | null = null
  private lastState: ExtractionPanelState = { status: 'extracting', count: 0, format: 'csv' }
  private readonly mode: 'reviews' | 'photos'

  constructor(
    private readonly hostId: string,
    private readonly exportLabelKey: string,
    private readonly callbacks: ExtractionPanelCallbacks
  ) {
    this.mode = exportLabelKey === K.REVIEWS_EXPORT ? 'reviews' : 'photos'
    this.limit = getRunLimit(null, this.mode)
  }

  async mount(): Promise<void> {
    if (document.getElementById(this.hostId)) return
    this.panel = await createPanel(this.hostId, document.body)
    this.host = document.getElementById(this.hostId)
    this.panel.className = 'mgp mgp--work'
    node(this.panel, '[data-dock]').hidden = true
    node<HTMLButtonElement>(this.panel, '[data-pricing]').onclick = () => {
      void openPanelPricing()
    }
    node<HTMLButtonElement>(this.panel, '[data-check]').onclick = () => {
      void this.reset()
    }
    this.unsubscribeSettings = MapsUserSettingsManager.onSettingsChanged(settings => {
      if (this.host) this.host.dataset.theme = settings.theme
      this.lastState.format = settings.exportFormat
      this.refresh()
    })
    this.unsubscribeLanguage = I18nService.onLanguageChange(() => this.refresh())
    this.refresh()
  }

  render(state: ExtractionPanelState): void {
    this.lastState = state
    this.refresh()
  }

  setUsage(usage: MapsUsageSnapshot | null, limit: number): void {
    this.usage = usage
    this.limit = limit
    this.refresh()
  }

  setBulkContext(bulk: BulkWorkParams | null): void {
    this.bulk = bulk
    this.refresh()
  }

  setChecking(checking: boolean): void {
    this.checking = checking
    this.refresh()
  }

  setError(error: 'quota' | 'unknown-place' | null): void {
    this.error = error
    this.quotaRechecked = false
    this.refresh()
  }

  showExported(): void {
    if (this.exportedTimer !== null) window.clearTimeout(this.exportedTimer)
    this.exported = true
    this.refresh()
    this.exportedTimer = window.setTimeout(() => {
      this.exported = false
      this.exportedTimer = null
      this.refresh()
    }, 1600)
  }

  destroy(): void {
    if (this.exportedTimer !== null) window.clearTimeout(this.exportedTimer)
    this.unsubscribeSettings?.()
    this.unsubscribeLanguage?.()
    this.host?.remove()
    this.host = null
    this.panel = null
  }

  private async reset(): Promise<void> {
    if (this.checking) return
    this.setChecking(true)
    try {
      await this.callbacks.onReset()
      this.quotaRechecked = this.error === 'quota'
    } finally {
      this.setChecking(false)
    }
  }

  private refresh(): void {
    const panel = this.panel
    if (!panel) return
    const { status, count, format } = this.lastState
    const blocked = this.error === 'quota'
    const state = blocked ? 'blocked' : status
    renderHeader(panel, this.mode)
    renderContext(panel, this.bulk, this.mode === 'reviews')
    const labels = {
      extracting: K.EXTRACTING,
      complete: K.COMPLETE,
      stopped: K.STOPPED,
      empty: this.mode === 'reviews' ? K.NO_REVIEWS : K.NO_PHOTOS,
      blocked: K.QUOTA_EXHAUSTED
    }
    const caption = blocked
      ? K.QUOTA_HINT
      : status === 'stopped'
        ? K.STOPPED_HINT
        : status === 'empty'
          ? K.EMPTY_HINT
          : status === 'extracting'
            ? this.mode === 'reviews'
              ? K.REVIEWS_LIVE
              : K.PHOTOS_LIVE
            : count >= this.limit
              ? K.LIMIT_REACHED
              : K.END_REACHED
    const cores = {
      extracting: IconName.SCAN,
      complete: IconName.CHECK,
      stopped: IconName.ALERT,
      empty: IconName.MINUS,
      blocked: IconName.LOCK
    }
    renderStatus(
      panel,
      state,
      blocked && this.usage ? this.usage.used : count,
      blocked && this.usage ? this.usage.total : this.limit,
      I18nService.t(labels[state]),
      I18nService.t(caption, { limit: number(this.limit) }),
      cores[state]
    )
    renderFooter(
      panel,
      this.usage,
      this.bulk === null ? (this.usage?.run_limits[this.mode] ?? this.limit) : this.limit
    )
    const message = blocked
      ? this.quotaRechecked
        ? K.STILL_OUT
        : K.QUOTA_HINT
      : this.error === 'unknown-place'
        ? K.PLACE_ERROR
        : status === 'stopped'
          ? this.mode === 'reviews'
            ? K.REVIEWS_STOPPED
            : K.PHOTOS_STOPPED
          : status === 'empty'
            ? this.mode === 'reviews'
              ? K.NO_REVIEWS_HINT
              : K.NO_PHOTOS_HINT
            : null
    renderMessage(panel, message, status === 'stopped' ? 'warn' : 'neutral')
    renderUpgrade(panel, blocked, this.checking)
    const primary = node<HTMLButtonElement>(panel, '[data-primary]')
    renderButton(
      primary,
      this.exported ? 'exported' : 'export',
      I18nService.t(this.exported ? K.EXPORTED : this.exportLabelKey, { count: number(count) }),
      this.exported ? IconName.CHECK : IconName.DOWNLOAD,
      false,
      this.checking || count === 0,
      this.exported ? '' : searchExportExtLabel(format)
    )
    primary.hidden = status === 'empty' || (blocked && count === 0)
    primary.onclick = () => {
      if (primary.getAttribute('aria-disabled') === 'true') return
      this.callbacks.onExport()
      this.showExported()
    }
    const secondary = node<HTMLButtonElement>(panel, '[data-secondary]')
    renderButton(
      secondary,
      this.checking ? 'checking' : 'reset',
      I18nService.t(this.checking ? K.CHECKING : K.RESET),
      IconName.RESET,
      this.checking
    )
    secondary.hidden = blocked || status === 'extracting'
    secondary.onclick = () => {
      void this.reset()
    }
    if (
      !isUsageExhausted(this.usage) &&
      !blocked &&
      status === 'extracting' &&
      panel.getRootNode() instanceof ShadowRoot
    ) {
      const root = panel.getRootNode() as ShadowRoot
      if (root.activeElement?.hasAttribute('data-check')) primary.focus()
    }
  }
}

export async function waitForBody(timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (document.body) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('[ExtractionPanel] document.body 等待超时，无法挂载工作面板')
}
