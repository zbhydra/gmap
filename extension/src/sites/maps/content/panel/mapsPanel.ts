/** Maps 页内面板；采集状态由 scraper 持有，面板只保存展示所需的会话快照。 */
import { I18nService } from '@/locales'
import { getMapsConfig } from '../../config/loader'
import { MapsUserSettingsManager } from '../../settings/userSettings'
import { fetchUsageSnapshot, getRunLimit } from '../../usage/usageClient'
import { isUsageExhausted, type MapsUsageSnapshot } from '../../usage/types'
import { detectMapsListMode } from '../listMode'
import type { MapsScraperStatus } from '../scraper/searchScraper'
import { searchExportExtLabel, type SearchExportFormat } from '../export/engine'
import type { BulkWorkParams } from '../bulkAuto'
import {
  createPanel,
  icon,
  IconName,
  K,
  node,
  number,
  renderButton,
  renderContext,
  renderFooter,
  renderHeader,
  renderMessage,
  renderStatus,
  renderUpgrade,
  text,
  type PanelError
} from './panelView'

export const PANEL_HOST_ID = 'gmap-extractor-panel-host'
export type MapsPanelMode = 'search' | 'place' | 'list'
export type PlaceSectionKey = 'reviews' | 'photos'
export interface PlaceSectionState {
  working: boolean
}
export interface PlacePanelState {
  reviews: PlaceSectionState
  photos: PlaceSectionState
}
export interface MapsPanelCallbacks {
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onExport: () => void
  onReset: () => void
  onStartReviews: () => void
  onStartPhotos: () => void
  onOpenPricing: () => void
}
export interface MapsPanelRenderState {
  status: MapsScraperStatus
  count: number
  limit: number
  format: SearchExportFormat
}
export interface MapsPanelOperationsState {
  announcementHtml: string
  newVersionAvailable: boolean
}

export class MapsPanel {
  private host: HTMLElement | null = null
  private panel: HTMLElement | null = null
  private mode: MapsPanelMode = 'search'
  private side: 'left' | 'right' = 'left'
  private modePollTimer: number | null = null
  private reopenTimer: number | null = null
  private exportedTimer: number | null = null
  private unsubscribeSettings: (() => void) | null = null
  private unsubscribeLanguage: (() => void) | null = null
  private usage: MapsUsageSnapshot | null = null
  private checking = false
  private finishing: { done: number; total: number } | null = null
  private exported = false
  private error: PanelError | null = null
  private quotaMessage: string | null = null
  private placeError: PanelError | null = null
  private bulk: BulkWorkParams | null = null
  private operations: MapsPanelOperationsState = {
    announcementHtml: '',
    newVersionAvailable: false
  }
  private lastSearch: MapsPanelRenderState = {
    status: 'idle',
    count: 0,
    limit: getRunLimit(null, 'search'),
    format: 'csv'
  }
  private lastPlace: PlacePanelState = { reviews: { working: false }, photos: { working: false } }

  constructor(private readonly callbacks: MapsPanelCallbacks) {}

  async mount(mountSelector: string, mainSelector: string): Promise<void> {
    const mountPoint = await waitForMountPoint(mountSelector, mainSelector)
    this.panel = await createPanel(PANEL_HOST_ID, mountPoint)
    this.host = document.getElementById(PANEL_HOST_ID)
    const section = node(this.panel, '.mgp-section')
    for (const key of ['reviews', 'photos'] as const) {
      const row = document.createElement('div')
      row.className = 'mgp-row'
      row.dataset.row = key
      row.innerHTML = `<span class="mgp-row-icon${key === 'reviews' ? ' mgp-row-icon--star' : ''}">${icon(key === 'reviews' ? IconName.STAR : IconName.IMAGE)}</span>
        <span class="mgp-row-text"><span class="mgp-row-title"></span><span class="mgp-row-sub"></span></span>
        <button class="mgp-btn mgp-btn--secondary mgp-btn--sm" type="button" data-row-action></button>
        <span class="mgp-row-timer" aria-hidden="true"></span>`
      section.appendChild(row)
    }
    node<HTMLButtonElement>(this.panel, '[data-dock]').onclick = () => this.toggleSide()
    node<HTMLButtonElement>(this.panel, '[data-pricing]').onclick = this.callbacks.onOpenPricing
    node<HTMLButtonElement>(this.panel, '[data-check]').onclick = () => {
      if (!this.checking) void this.checkQuota()
    }
    this.syncMode(true)
    this.modePollTimer = window.setInterval(() => this.syncMode(), 1000)
    this.unsubscribeSettings = MapsUserSettingsManager.onSettingsChanged(settings => {
      if (this.host) this.host.dataset.theme = settings.theme
      this.lastSearch.format = settings.exportFormat
      this.render()
    })
    this.unsubscribeLanguage = I18nService.onLanguageChange(() => this.render())
  }

  renderSearch(state: MapsPanelRenderState): void {
    this.lastSearch = state
    this.render()
  }

  setSearchError(reason: PanelError | null): void {
    this.error = reason
    if (reason === null) {
      this.quotaMessage = null
      this.placeError = null
    }
    this.render()
  }

  renderOperations(state: MapsPanelOperationsState): void {
    this.operations = state
    this.render()
  }

  setBulkContext(bulk: BulkWorkParams | null): void {
    this.bulk = bulk
    this.render()
  }

  setUsage(snapshot: MapsUsageSnapshot | null): void {
    this.usage = snapshot
    if (this.lastSearch.status === 'idle') this.lastSearch.limit = getRunLimit(snapshot, 'search')
    this.render()
  }

  async checkQuota(announce = true): Promise<MapsUsageSnapshot | null> {
    this.checking = true
    this.render()
    try {
      const snapshot = await fetchUsageSnapshot()
      this.setUsage(snapshot)
      if (announce)
        this.quotaMessage =
          snapshot === null ? null : isUsageExhausted(snapshot) ? K.STILL_OUT : K.UNLOCKED
      return snapshot
    } finally {
      this.checking = false
      this.render()
      const root = this.panel?.getRootNode()
      if (
        root instanceof ShadowRoot &&
        root.activeElement?.hasAttribute('data-check') &&
        !isUsageExhausted(this.usage)
      ) {
        node<HTMLButtonElement>(this.panel!, '[data-primary]').focus()
      }
    }
  }

  setFinishing(progress: { done: number; total: number } | null): void {
    this.finishing = progress
    this.render()
  }

  showExported(): void {
    if (this.exportedTimer !== null) window.clearTimeout(this.exportedTimer)
    this.exported = true
    this.render()
    this.exportedTimer = window.setTimeout(() => {
      this.exported = false
      this.exportedTimer = null
      this.render()
    }, 1600)
  }

  renderPlace(state: PlacePanelState): void {
    this.lastPlace = state
    this.render()
  }

  setPlaceSectionWorking(section: PlaceSectionKey, working: boolean): void {
    this.lastPlace[section].working = working
    if (working) {
      this.placeError = null
      if (this.reopenTimer !== null) window.clearTimeout(this.reopenTimer)
      this.reopenTimer = window.setTimeout(() => {
        this.lastPlace = { reviews: { working: false }, photos: { working: false } }
        this.reopenTimer = null
        this.render()
      }, 4000)
    }
    this.render()
  }

  setPlaceSectionError(_section: PlaceSectionKey, reason: PanelError | null): void {
    this.placeError = reason
    this.render()
  }

  toggleSide(): void {
    if (!this.panel) return
    const before = this.panel.getBoundingClientRect().left
    this.side = this.side === 'left' ? 'right' : 'left'
    this.render()
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.panel.animate(
        [
          { transform: `translateX(${before - this.panel.getBoundingClientRect().left}px)` },
          { transform: 'translateX(0)' }
        ],
        { duration: 280, easing: 'cubic-bezier(0.2, 0, 0, 1)' }
      )
    }
  }

  destroy(): void {
    if (this.modePollTimer !== null) window.clearInterval(this.modePollTimer)
    if (this.reopenTimer !== null) window.clearTimeout(this.reopenTimer)
    if (this.exportedTimer !== null) window.clearTimeout(this.exportedTimer)
    this.unsubscribeSettings?.()
    this.unsubscribeLanguage?.()
    this.host?.remove()
    this.host = null
    this.panel = null
  }

  private syncMode(initial = false): void {
    const next = detectMapsListMode(location.href, getMapsConfig().dom.listModeUrlMark)
      ? 'list'
      : location.pathname.includes('/place/')
        ? 'place'
        : 'search'
    if (next === this.mode && !initial) return
    this.mode = next
    this.side = next === 'place' ? 'right' : 'left'
    this.placeError = null
    this.lastPlace = { reviews: { working: false }, photos: { working: false } }
    this.render()
  }

  private render(): void {
    const panel = this.panel
    if (!panel) return
    const { status, count, limit, format } = this.lastSearch
    const blocked = isUsageExhausted(this.usage) && status === 'idle'
    const state = blocked ? 'blocked' : status
    panel.classList.toggle('mgp--left', this.side === 'left')
    panel.classList.toggle('mgp--right', this.side === 'right')
    renderHeader(panel, this.mode)
    renderContext(panel, this.bulk, false)
    const dock = node<HTMLButtonElement>(panel, '[data-dock]')
    dock.innerHTML = icon(this.side === 'left' ? IconName.DOCK_RIGHT : IconName.DOCK_LEFT)
    dock.setAttribute('aria-label', I18nService.t(K.TOGGLE_POSITION))
    const labels = {
      idle: K.READY,
      extracting: K.EXTRACTING,
      paused: K.PAUSED,
      complete: K.COMPLETE,
      blocked: K.QUOTA_EXHAUSTED
    }
    const idle =
      this.mode === 'list' ? K.LIST_IDLE_HINT : this.mode === 'place' ? K.PLACE_HINT : K.IDLE_HINT
    const caption = blocked
      ? K.QUOTA_HINT
      : status === 'idle'
        ? idle
        : status === 'extracting'
          ? this.mode === 'list'
            ? K.LIST_LIVE
            : K.SEARCH_LIVE
          : status === 'paused'
            ? K.PAUSED_HINT
            : count >= limit
              ? K.LIMIT_REACHED
              : K.END_REACHED
    const cores = {
      idle: IconName.PIN,
      extracting: IconName.SCAN,
      paused: IconName.PAUSE,
      complete: IconName.CHECK,
      blocked: IconName.LOCK
    }
    renderStatus(
      panel,
      state,
      blocked ? this.usage!.used : count,
      blocked ? this.usage!.total : limit,
      I18nService.t(labels[state], { count: number(count) }),
      I18nService.t(caption, { limit: number(limit) }),
      cores[state]
    )
    renderFooter(panel, this.usage, this.usage?.run_limits.search ?? limit)
    const version = node(panel, '[data-version]')
    version.hidden = !this.operations.newVersionAvailable
    version.textContent = I18nService.t(K.NEW_VERSION)
    const announcement = node(panel, '[data-announcement]')
    announcement.hidden = this.operations.announcementHtml.trim().length === 0
    if (announcement.innerHTML !== this.operations.announcementHtml)
      announcement.innerHTML = this.operations.announcementHtml
    const errorKeys = {
      'not-searched': K.NOT_SEARCHED,
      parse: K.PARSE_ERROR,
      google: K.GOOGLE_ERROR,
      'unknown-place': K.PLACE_ERROR,
      'open-tab': K.OPEN_TAB_ERROR
    }
    renderMessage(
      panel,
      this.error ? errorKeys[this.error] : this.quotaMessage,
      this.error === 'google' ? 'warn' : this.quotaMessage === K.UNLOCKED ? 'ok' : 'bad'
    )
    renderUpgrade(
      panel,
      blocked || (this.mode === 'place' && isUsageExhausted(this.usage)),
      this.checking
    )
    const task = node(panel, '.mgp-task')
    task.hidden = this.finishing === null
    if (this.finishing) {
      text(task, '.mgp-task-title', I18nService.t(K.CONTACTS_TITLE))
      text(
        task,
        '.mgp-task-sub',
        I18nService.t(K.CONTACTS_PROGRESS, {
          done: this.finishing.done,
          total: this.finishing.total
        })
      )
      node(task, '.mgp-task-bar > span').style.setProperty(
        '--p',
        String(this.finishing.total ? (this.finishing.done / this.finishing.total) * 100 : 0)
      )
    }
    const primary = node<HTMLButtonElement>(panel, '[data-primary]')
    const action = this.checking
      ? 'checking'
      : this.finishing
        ? 'finishing'
        : this.exported
          ? 'exported'
          : status === 'idle'
            ? 'start'
            : 'export'
    const actionKeys = {
      checking: K.CHECKING,
      finishing: K.CONTACTS_WAIT,
      exported: K.EXPORTED,
      start: K.START,
      export: K.EXPORT
    }
    renderButton(
      primary,
      action,
      I18nService.t(actionKeys[action], { count: number(count) }),
      status === 'idle' ? IconName.PLAY : this.exported ? IconName.CHECK : IconName.DOWNLOAD,
      this.checking || this.finishing !== null,
      status !== 'idle' && count === 0,
      action === 'export' ? searchExportExtLabel(format) : ''
    )
    primary.disabled = blocked && !this.checking
    primary.onclick = () => {
      if (primary.getAttribute('aria-disabled') === 'true') return
      if (status === 'idle') this.callbacks.onStart()
      else {
        this.callbacks.onExport()
        this.showExported()
        this.setSearchError(null)
      }
    }
    const secondary = node<HTMLButtonElement>(panel, '[data-secondary]')
    secondary.hidden = status === 'idle'
    if (status !== 'idle') {
      const actions = {
        extracting: [K.PAUSE, IconName.PAUSE, this.callbacks.onPause],
        paused: [K.RESUME, IconName.RESUME, this.callbacks.onResume],
        complete: [K.RESET, IconName.RESET, this.callbacks.onReset]
      } as const
      const [label, glyph, callback] = actions[status]
      renderButton(
        secondary,
        status,
        I18nService.t(label),
        glyph,
        false,
        this.finishing !== null || this.checking
      )
      secondary.onclick = () => {
        if (secondary.getAttribute('aria-disabled') === 'true') return
        callback()
        this.setSearchError(null)
        if (status === 'complete') primary.focus()
      }
    }
    const section = node(panel, '.mgp-section')
    section.hidden = this.mode !== 'place'
    section.setAttribute('aria-label', I18nService.t(K.THIS_PLACE))
    text(section, '.mgp-section-label', I18nService.t(K.THIS_PLACE))
    renderMessage(panel, this.placeError ? errorKeys[this.placeError] : null, 'neutral', true)
    for (const key of ['reviews', 'photos'] as const) {
      const row = node(panel, `[data-row="${key}"]`)
      const opened = this.lastPlace[key].working
      const rowBlocked = isUsageExhausted(this.usage)
      row.dataset.state =
        this.placeError === 'unknown-place'
          ? 'error'
          : opened
            ? 'opened'
            : rowBlocked
              ? 'blocked'
              : 'ready'
      text(
        row,
        '.mgp-row-title',
        I18nService.t(key === 'reviews' ? K.REVIEWS_SECTION : K.PHOTOS_SECTION)
      )
      text(
        row,
        '.mgp-row-sub',
        I18nService.t(
          opened ? K.COLLECTING_NEW_TAB : rowBlocked ? K.QUOTA_EXHAUSTED : K.NEW_TAB_HINT
        )
      )
      const button = node<HTMLButtonElement>(row, '[data-row-action]')
      button.classList.toggle('mgp-btn--icon', opened)
      button.disabled = rowBlocked || this.checking || this.placeError === 'unknown-place'
      button.setAttribute(
        'aria-label',
        I18nService.t(opened ? K.REOPEN : key === 'reviews' ? K.START_REVIEWS : K.START_PHOTOS)
      )
      button.innerHTML = opened ? icon(IconName.EXTERNAL_LINK) : ''
      if (!opened) button.textContent = I18nService.t(K.ROW_START)
      button.onclick =
        key === 'reviews' ? this.callbacks.onStartReviews : this.callbacks.onStartPhotos
    }
  }
}

async function waitForMountPoint(
  mountSelector: string,
  mainSelector: string
): Promise<HTMLElement> {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline && !document.querySelector(mainSelector)) {
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  const mountPoint = document.querySelector(mountSelector)
  if (mountPoint instanceof HTMLElement) return mountPoint
  throw new Error(`[MapsPanel] 面板挂载点未找到: selector=${mountSelector}`)
}
