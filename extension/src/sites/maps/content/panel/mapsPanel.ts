/**
 * Maps 采集面板（Shadow DOM 隔离宿主页面样式）。
 *
 * 三模式（竞品 onUrlChange 语义，SPA 内按 URL 自动切换，互斥）：
 * - list（URL 命中列表触发标记 dom.listModeUrlMark，013 A7/U10）：列表模式
 *   采集——状态行显示已采集列表项计数，按钮三态与 search 同构；List Mode
 *   标签区分形态；
 * - search（默认）：三态渲染——idle：Start Extracting；extracting：
 *   Extracting N… + Pause；paused 同屏换 Resume；complete：Export + Reset。
 * - place（pathname 含 /place/ 且非列表形态）：Reviews & Photos 区块——两个
 *   Start 按钮（Start Extracting Reviews / Start Extracting Photos），点击后
 *   各自切换为「采集中（新标签）」状态；实时计数与导出在评论页/照片页的
 *   工作面板。
 *
 * 运营区（A12，模式无关，挂在 header 与内容区之间）：公告（远端 HTML 片段
 * innerHTML 注入，竞品同构，来源为本仓库 backend 可信通道）+ 新版本提示
 * （operations.minPluginVersion > 本地版本时出现）。
 *
 * 配额门控（A11，U7；W7 接线订阅跳转）：setQuotaExhausted(true) 后待命态
 * Start 与 place 两 Start 按钮禁用，hint/错误行显示「额度用尽 + 订阅引导」；
 * 远程已下发 operations.pricingUrl 时提示旁出现「查看方案」按钮（经 background
 * 新标签打开落地页；未配置则保持纯文案降级）；采集中/完成态不拦（暂停恢复
 * 与导出不受影响）。
 *
 * 样式消费 design.md / design.dark.md token（panel.css 内 CSS 变量，
 * 亮暗响应 prefers-color-scheme）；文案全部走 i18n（I18nService）。
 * 面板挂载点与挂载时机（等 dom.main 就绪）由远程配置驱动。
 */

import panelStyles from './panel.css?inline'
import { I18nService } from '@/locales/index'
import { I18N_KEYS } from '@/core/constants/i18n'
import { getMapsConfig } from '../../config/loader'
import { buildMapsPricingUrl } from '../../config/pricing'
import { detectMapsListMode } from '../listMode'
import type { MapsScraperStatus } from '../scraper/searchScraper'
import { searchExportExtLabel, type SearchExportFormat } from '../export/engine'

/** 面板宿主元素 id（light DOM 唯一锚点）。 */
export const PANEL_HOST_ID = 'gmap-extractor-panel-host'

/** 面板模式（互斥：列表形态优先于 place / search）。 */
export type MapsPanelMode = 'search' | 'place' | 'list'

/** place 模式区块标识。 */
export type PlaceSectionKey = 'reviews' | 'photos'

/** place 模式单区块状态。 */
export interface PlaceSectionState {
  /** 是否已发起采集（按钮禁用、显示状态文案）。 */
  working: boolean
}

/** place 模式渲染输入。 */
export interface PlacePanelState {
  reviews: PlaceSectionState
  photos: PlaceSectionState
}

/** 面板按钮动作回调集合。 */
export interface MapsPanelCallbacks {
  /** 搜索采集开始（search 模式）。 */
  onStart: () => void
  /** 搜索采集暂停。 */
  onPause: () => void
  /** 搜索采集恢复。 */
  onResume: () => void
  /** 搜索结果导出。 */
  onExport: () => void
  /** 搜索会话重置。 */
  onReset: () => void
  /** 发起评论采集（place 模式，打开评论工作页）。 */
  onStartReviews: () => void
  /** 发起照片采集（place 模式，打开照片工作页）。 */
  onStartPhotos: () => void
  /** 打开订阅落地页（额度用尽引导，W7；bootstrap 经 background 代开新标签）。 */
  onOpenPricing: () => void
}

/** 面板渲染输入（search 模式）。 */
export interface MapsPanelRenderState {
  status: MapsScraperStatus
  count: number
  /** 导出格式（决定导出按钮的格式后缀文案，来自用户设置）。 */
  format: SearchExportFormat
}

/** 面板运营区渲染输入（A12）。 */
export interface MapsPanelOperationsState {
  /** 公告 HTML 片段（空串 = 无公告，公告区隐藏）。 */
  announcementHtml: string
  /** 是否提示有新版本（operations.minPluginVersion > 本地版本）。 */
  newVersionAvailable: boolean
}

/** SPA 模式轮询间隔（竞品 onUrlChange 用 MutationObserver，轮询等价且更轻）。 */
const MODE_POLL_INTERVAL_MS = 1000

/**
 * Maps 采集面板。
 *
 * 生命周期：`await mount()` 完成后即可 `renderSearch()/renderPlace()`；
 * SPA 存续期内复用同一实例，模式切换自动重建内容区。
 */
export class MapsPanel {
  private readonly callbacks: MapsPanelCallbacks

  private host: HTMLElement | null = null

  private panelElement: HTMLElement | null = null

  private contentElement: HTMLElement | null = null

  private mode: MapsPanelMode | null = null

  private modePollTimer: number | null = null

  /** search 模式 UI 引用。 */
  private searchHint: HTMLElement | null = null

  private searchError: HTMLElement | null = null

  private searchPrimary: HTMLButtonElement | null = null

  private searchSecondary: HTMLButtonElement | null = null

  /** 运营区（模式无关）：公告容器 + 新版本提示行。 */
  private announcementElement: HTMLElement | null = null

  private versionNoticeElement: HTMLElement | null = null

  /**
   * 配额耗尽门控（U7）：true 时禁用待命态 Start（与 place 两按钮）并在 hint
   * 显示「额度用尽 + 订阅引导」。采集中/完成态不受影响（暂停恢复、导出不拦）。
   */
  private quotaExhausted = false

  /** 订阅引导按钮（W7）：门控生效且远程已配置 pricingUrl 时可见。 */
  private upgradeButton: HTMLButtonElement | null = null

  /** place 模式 UI 引用。 */
  private placeSections: Record<
    PlaceSectionKey,
    { error: HTMLElement; button: HTMLButtonElement } | null
  > = {
    reviews: null,
    photos: null
  }

  /** 两模式最近一次渲染状态（模式切换回显）。 */
  private lastSearchState: MapsPanelRenderState = { status: 'idle', count: 0, format: 'csv' }

  private lastPlaceState: PlacePanelState = {
    reviews: { working: false },
    photos: { working: false }
  }

  private side: 'left' | 'right' = 'left'

  constructor(callbacks: MapsPanelCallbacks) {
    this.callbacks = callbacks
  }

  /**
   * 挂载面板：等待挂载点出现后创建宿主 + Shadow Root，按 URL 渲染初始模式，
   * 并启动 SPA 模式轮询。
   *
   * @param mountSelector 面板挂载点选择器（远程配置 dom.panelMount）。
   * @param mainSelector Maps 主渲染区存在性检测选择器（远程配置 dom.main）。
   */
  async mount(mountSelector: string, mainSelector: string): Promise<void> {
    const mountPoint = await waitForMountPoint(mountSelector, mainSelector)
    const host = document.createElement('div')
    host.id = PANEL_HOST_ID
    mountPoint.appendChild(host)

    const shadow = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = panelStyles
    shadow.appendChild(style)

    const panel = document.createElement('div')
    panel.className = 'panel panel-side-left'
    shadow.appendChild(panel)

    const header = document.createElement('div')
    header.className = 'panel-header'

    const title = document.createElement('span')
    title.className = 'panel-title'
    title.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.TITLE)

    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'panel-toggle'
    toggle.textContent = this.side === 'left' ? '→' : '←'
    toggle.setAttribute('aria-label', I18nService.t(I18N_KEYS.MAPS_PANEL.TOGGLE_POSITION))
    toggle.onclick = () => {
      this.toggleSide()
      toggle.textContent = this.side === 'left' ? '→' : '←'
    }

    header.appendChild(title)
    header.appendChild(toggle)

    const content = document.createElement('div')
    this.contentElement = content

    const versionNotice = document.createElement('p')
    versionNotice.className = 'panel-version-notice'
    this.versionNoticeElement = versionNotice

    const announcement = document.createElement('div')
    announcement.className = 'panel-announcement'
    this.announcementElement = announcement

    const footer = document.createElement('div')
    footer.className = 'panel-footer'
    footer.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.TITLE)

    panel.appendChild(header)
    panel.appendChild(versionNotice)
    panel.appendChild(announcement)
    panel.appendChild(content)
    panel.appendChild(footer)

    this.host = host
    this.panelElement = panel
    this.syncMode()
    this.startModePolling()
  }

  /** 渲染 search/list 模式三态 UI（place 模式时仅缓存，切换后回显）。 */
  renderSearch(state: MapsPanelRenderState): void {
    this.lastSearchState = state
    if (this.mode === 'place' || !this.searchPrimary || !this.searchSecondary || !this.searchHint) {
      return
    }

    const { status, count } = state
    const extractingText = I18nService.t(I18N_KEYS.MAPS_PANEL.EXTRACTING, { count })
    const exportText = I18nService.t(I18N_KEYS.MAPS_PANEL.EXPORT, {
      count,
      ext: searchExportExtLabel(state.format)
    })

    // 门控优先：待命态配额耗尽时 hint 显示「额度用尽 + 订阅引导」，Start 禁用
    const quotaBlocked = this.quotaExhausted && status === 'idle'
    if (quotaBlocked) {
      this.searchHint.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.QUOTA_EXHAUSTED)
      this.searchHint.style.display = 'block'
    } else if (status === 'idle') {
      const idleKey =
        this.mode === 'list' ? I18N_KEYS.MAPS_PANEL.LIST_IDLE_HINT : I18N_KEYS.MAPS_PANEL.IDLE_HINT
      this.searchHint.textContent = I18nService.t(idleKey)
      this.searchHint.style.display = 'block'
    } else if (status === 'extracting' || status === 'paused') {
      this.searchHint.textContent = extractingText
      this.searchHint.style.display = 'block'
    } else {
      this.searchHint.style.display = 'none'
    }
    this.syncUpgradeButton(quotaBlocked)

    const primaryByStatus: Record<MapsScraperStatus, { text: string; action: () => void }> = {
      idle: { text: I18nService.t(I18N_KEYS.MAPS_PANEL.START), action: this.callbacks.onStart },
      extracting: {
        text: I18nService.t(I18N_KEYS.MAPS_PANEL.PAUSE),
        action: this.callbacks.onPause
      },
      paused: {
        text: I18nService.t(I18N_KEYS.MAPS_PANEL.RESUME),
        action: this.callbacks.onResume
      },
      complete: { text: exportText, action: this.callbacks.onExport }
    }
    const primary = primaryByStatus[status]
    this.searchPrimary.textContent = primary.text
    this.searchPrimary.onclick = primary.action
    this.searchPrimary.disabled = quotaBlocked

    const showSecondary = status === 'complete'
    this.searchSecondary.style.display = showSecondary ? 'block' : 'none'
    if (showSecondary) {
      this.searchSecondary.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.RESET)
      this.searchSecondary.onclick = this.callbacks.onReset
    }
  }

  /** 显示/隐藏 search 模式解析错误行（失败不静默：UI 可见）。 */
  setSearchError(message: string | null): void {
    if (!this.searchError) {
      return
    }
    if (message === null) {
      this.searchError.classList.remove('visible')
      this.searchError.textContent = ''
      return
    }
    const prefix = I18nService.t(I18N_KEYS.MAPS_PANEL.PARSE_ERROR)
    this.searchError.textContent = `${prefix}: ${message}`
    this.searchError.classList.add('visible')
  }

  /**
   * 渲染运营区（A12）：公告 HTML 片段 innerHTML 注入（竞品同构；来源为
   * 本仓库 backend 运营配置，可信通道），版本提示按需出现。模式无关，
   * mount 后调用一次即可；空公告且无版本提示时两容器均隐藏。
   */
  renderOperations(state: MapsPanelOperationsState): void {
    if (!this.announcementElement || !this.versionNoticeElement) {
      return
    }

    if (state.announcementHtml.trim().length > 0) {
      this.announcementElement.innerHTML = state.announcementHtml
      this.announcementElement.classList.add('visible')
    } else {
      this.announcementElement.classList.remove('visible')
    }

    if (state.newVersionAvailable) {
      this.versionNoticeElement.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.NEW_VERSION)
      this.versionNoticeElement.classList.add('visible')
    } else {
      this.versionNoticeElement.classList.remove('visible')
    }
  }

  /**
   * 设置配额门控状态并重放当前模式渲染（mount 前调用只缓存，挂载后回显）。
   * true：待命态 Start 禁用 + 「额度用尽」提示与订阅引导；place 模式
   * 两个 Start 按钮同步禁用。远程已配置 pricingUrl 时提示旁出现跳转按钮
   * （W7 接线），未配置保持纯文案（优雅降级）。
   */
  setQuotaExhausted(exhausted: boolean): void {
    if (this.quotaExhausted === exhausted) {
      return
    }
    this.quotaExhausted = exhausted
    if (this.mode === 'place') {
      this.renderPlace(this.lastPlaceState)
      return
    }
    this.renderSearch(this.lastSearchState)
  }

  /** 渲染 place 模式 Reviews & Photos 区块（模式未在 place 时仅缓存）。 */
  renderPlace(state: PlacePanelState): void {
    this.lastPlaceState = state
    if (this.mode !== 'place') {
      return
    }

    const buttonByKey: Record<PlaceSectionKey, { text: string; action: () => void }> = {
      reviews: {
        text: I18nService.t(I18N_KEYS.MAPS_PANEL.START_REVIEWS),
        action: this.callbacks.onStartReviews
      },
      photos: {
        text: I18nService.t(I18N_KEYS.MAPS_PANEL.START_PHOTOS),
        action: this.callbacks.onStartPhotos
      }
    }
    const collectingText = I18nService.t(I18N_KEYS.MAPS_PANEL.COLLECTING_NEW_TAB)
    const quotaText = I18nService.t(I18N_KEYS.MAPS_PANEL.QUOTA_EXHAUSTED)

    for (const key of ['reviews', 'photos'] as const) {
      const section = this.placeSections[key]
      if (!section) {
        continue
      }
      const sectionState = state[key]
      // 区块状态由按钮承载：待命 = Start 按钮；已发起 = 禁用 + 采集状态文案；
      // 配额耗尽 = 待命按钮禁用（U7 门控，错误行提示额度用尽）
      const quotaBlocked = this.quotaExhausted && !sectionState.working
      section.button.textContent = sectionState.working ? collectingText : buttonByKey[key].text
      section.button.disabled = sectionState.working || quotaBlocked
      section.button.onclick = sectionState.working || quotaBlocked ? null : buttonByKey[key].action
      // 门控提示独占错误行：出现时写入；解除时仅清除本模块写入的文案
      //（不覆盖 setPlaceSectionError 写入的业务错误）
      if (quotaBlocked) {
        section.error.textContent = quotaText
        section.error.classList.add('visible')
      } else if (section.error.textContent === quotaText) {
        section.error.textContent = ''
        section.error.classList.remove('visible')
      }
    }
    // 任一区块被门控（待命即禁用）即出现订阅引导（按钮可见性见 syncUpgradeButton）
    this.syncUpgradeButton(this.quotaExhausted && (!state.reviews.working || !state.photos.working))
  }

  /** 切换单个 place 区块的采集状态（保留另一区块状态）。 */
  setPlaceSectionWorking(section: PlaceSectionKey, working: boolean): void {
    this.renderPlace({ ...this.lastPlaceState, [section]: { working } })
  }

  /** 显示/隐藏 place 模式区块错误行（如 place URL 缺少 hex 标识）。 */
  setPlaceSectionError(section: PlaceSectionKey, message: string | null): void {
    const element = this.placeSections[section]?.error
    if (!element) {
      return
    }
    if (message === null) {
      element.classList.remove('visible')
      element.textContent = ''
      return
    }
    element.textContent = message
    element.classList.add('visible')
  }

  /** 切换面板左/右停靠位置。 */
  toggleSide(): void {
    this.side = this.side === 'left' ? 'right' : 'left'
    if (!this.panelElement) {
      return
    }
    this.panelElement.classList.toggle('panel-side-left', this.side === 'left')
    this.panelElement.classList.toggle('panel-side-right', this.side === 'right')
  }

  /**
   * 同步订阅引导按钮可见性（W7）：单一事实源 = buildMapsPricingUrl（可见性
   * 判定与点击打开同源，保证「按钮可见 ⇔ 点击有效」）；返回空串（未配置或
   * 脏 URL）时保持 display:none，降级为纯文案（与 U7 旧行为一致）。
   */
  private syncUpgradeButton(visible: boolean): void {
    if (!this.upgradeButton) {
      return
    }
    const show = visible && buildMapsPricingUrl(getMapsConfig().operations.pricingUrl).length > 0
    this.upgradeButton.style.display = show ? 'block' : 'none'
  }

  /** 卸载面板。 */
  destroy(): void {
    if (this.modePollTimer !== null) {
      window.clearInterval(this.modePollTimer)
      this.modePollTimer = null
    }
    this.host?.remove()
    this.host = null
    this.panelElement = null
    this.contentElement = null
    this.announcementElement = null
    this.versionNoticeElement = null
    this.upgradeButton = null
    this.placeSections = { reviews: null, photos: null }
  }

  /** 按 URL 同步模式（SPA 导航后内容区重建并回显各自状态；列表形态互斥优先）。 */
  private syncMode(): void {
    const next = this.resolveMode()
    if (next === this.mode) {
      return
    }
    this.mode = next
    this.rebuildContent()

    if (next === 'place') {
      this.renderPlace(this.lastPlaceState)
    } else {
      this.renderSearch(this.lastSearchState)
    }
  }

  /** URL 形态判定：列表标记命中 → list；place 路径 → place；其余 → search。 */
  private resolveMode(): MapsPanelMode {
    if (detectMapsListMode(location.href, getMapsConfig().dom.listModeUrlMark)) {
      return 'list'
    }
    return location.pathname.includes('/place/') ? 'place' : 'search'
  }

  /** 启动 SPA 模式轮询。 */
  private startModePolling(): void {
    this.modePollTimer = window.setInterval(() => this.syncMode(), MODE_POLL_INTERVAL_MS)
  }

  /** 清空并按当前模式重建内容区结构。 */
  private rebuildContent(): void {
    const content = this.contentElement
    if (!content) {
      return
    }
    content.replaceChildren()
    this.searchHint = null
    this.searchError = null
    this.searchPrimary = null
    this.searchSecondary = null
    this.upgradeButton = null
    this.placeSections = { reviews: null, photos: null }

    if (this.mode === 'place') {
      this.buildPlaceStructure(content)
    } else {
      // search 与 list 共用三态结构；list 形态多一个 List Mode 标签行
      this.buildSearchStructure(content, this.mode === 'list')
    }
  }

  /** 构建 search/list 模式内容结构（listMode 时顶部加形态标签）。 */
  private buildSearchStructure(content: HTMLElement, listMode: boolean): void {
    if (listMode) {
      const section = document.createElement('div')
      section.className = 'panel-section-label'
      section.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.LIST_SECTION)
      content.appendChild(section)
    }

    const hint = document.createElement('p')
    hint.className = 'panel-hint'
    this.searchHint = hint

    const error = document.createElement('p')
    error.className = 'panel-error'
    this.searchError = error

    const actions = document.createElement('div')
    actions.className = 'panel-actions'

    const primary = document.createElement('button')
    primary.type = 'button'
    primary.className = 'panel-button panel-button-primary'
    this.searchPrimary = primary

    const secondary = document.createElement('button')
    secondary.type = 'button'
    secondary.className = 'panel-button panel-button-outline'
    secondary.style.display = 'none'
    this.searchSecondary = secondary

    // 订阅引导按钮（W7）：门控生效且远程配置 pricingUrl 时可见（默认隐藏）
    const upgrade = this.buildUpgradeButton()
    this.upgradeButton = upgrade

    actions.appendChild(primary)
    actions.appendChild(secondary)
    actions.appendChild(upgrade)

    content.appendChild(hint)
    content.appendChild(error)
    content.appendChild(actions)
  }

  /** 构建 place 模式内容结构：Reviews 与 Photos 两个独立区块 + 共享订阅引导。 */
  private buildPlaceStructure(content: HTMLElement): void {
    content.appendChild(
      this.buildPlaceSection('reviews', I18nService.t(I18N_KEYS.MAPS_PANEL.REVIEWS_SECTION))
    )
    content.appendChild(
      this.buildPlaceSection('photos', I18nService.t(I18N_KEYS.MAPS_PANEL.PHOTOS_SECTION))
    )
    // 订阅引导按钮（W7）：place 双区块共享一个，门控生效且已配置时可见
    const upgrade = this.buildUpgradeButton()
    this.upgradeButton = upgrade
    content.appendChild(upgrade)
  }

  /** 创建订阅引导按钮：点击动作由 bootstrap 接线（background 代开新标签）。 */
  private buildUpgradeButton(): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'panel-button panel-button-outline panel-upgrade-button'
    button.textContent = I18nService.t(I18N_KEYS.MAPS_PANEL.UPGRADE_PLAN)
    button.onclick = this.callbacks.onOpenPricing
    button.style.display = 'none'
    return button
  }

  /** 构建单个 place 区块（标签 + 错误行 + Start 按钮，状态由按钮承载）。 */
  private buildPlaceSection(key: PlaceSectionKey, label: string): HTMLElement {
    const section = document.createElement('div')
    section.className = 'panel-section'

    const heading = document.createElement('div')
    heading.className = 'panel-section-label'
    heading.textContent = label

    const error = document.createElement('p')
    error.className = 'panel-error'

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'panel-button panel-button-primary'

    section.appendChild(heading)
    section.appendChild(error)
    section.appendChild(button)
    this.placeSections[key] = { error, button }
    return section
  }
}

/**
 * 等待挂载点就绪：优先等 Maps 主渲染区（dom.main）出现再挂到 dom.panelMount；
 * 超时（页面形态未知）直接尝试挂载点本身。
 */
async function waitForMountPoint(
  mountSelector: string,
  mainSelector: string,
  timeoutMs = 10_000
): Promise<HTMLElement> {
  const pollIntervalMs = 250
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (document.querySelector(mainSelector)) {
      break
    }
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  const mountPoint = document.querySelector(mountSelector)
  if (mountPoint instanceof HTMLElement) {
    return mountPoint
  }
  throw new Error(`[MapsPanel] 面板挂载点未找到: selector=${mountSelector}`)
}
