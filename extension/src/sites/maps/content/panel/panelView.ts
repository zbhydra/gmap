import panelStyles from './panel.css?inline'
import { IconName } from '@/core/components/icons/iconTypes'
import { iconPaths } from '@/core/components/icons/iconPaths'
import { I18N_KEYS } from '@/core/constants/i18n'
import { I18nService } from '@/locales'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { buildPricingUrl } from '@/core/utils/navigation'
import { logger } from '@/core/utils/logger'
import { WEBSITE } from '@/core/api/config'
import { getMapsConfig } from '../../config/loader'
import { buildMapsPricingUrl } from '../../config/pricing'
import { getCurrentTheme } from '../../settings/theme'
import type { MapsUsageSnapshot } from '../../usage/types'
import type { BulkWorkParams } from '../bulkAuto'

export { IconName }
export const K = I18N_KEYS.MAPS_PANEL
export type PanelMode = 'search' | 'list' | 'place' | 'reviews' | 'photos'
export type PanelStatus =
  | 'idle'
  | 'extracting'
  | 'paused'
  | 'complete'
  | 'blocked'
  | 'stopped'
  | 'empty'
export type PanelError = 'not-searched' | 'parse' | 'google' | 'unknown-place' | 'open-tab'

export function icon(name: IconName): string {
  return `<svg class="mgp-icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]}</svg>`
}

export function node<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  return root.querySelector<T>(selector)!
}

export function text(root: ParentNode, selector: string, value: string): void {
  node(root, selector).textContent = value
}

export function number(value: number): string {
  return value.toLocaleString(I18nService.getCurrentLanguage())
}

/** 同一外壳供搜索与工作页使用；图标内联，避免宿主跨源加载扩展资源。 */
export async function createPanel(hostId: string, mountPoint: HTMLElement): Promise<HTMLElement> {
  const host = document.createElement('div')
  host.id = hostId
  host.dataset.theme = await getCurrentTheme()
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = panelStyles
  const panel = document.createElement('section')
  panel.className = 'mgp mgp--left'
  panel.setAttribute('role', 'region')
  panel.innerHTML = `
    <header class="mgp-head">
      <span class="mgp-mark">${icon(IconName.PIN)}</span>
      <span class="mgp-title"></span><span class="mgp-mode"></span>
      <button class="mgp-icon-btn" type="button" data-dock></button>
    </header>
    <a class="mgp-context" data-context hidden>
      ${icon(IconName.STACK)}<span class="mgp-context-label"></span>
      <span class="mgp-context-count"></span><span class="mgp-context-link"></span>
      <span class="mgp-context-bar" aria-hidden="true"></span>
    </a>
    <div class="mgp-body">
      <div class="mgp-notice" data-version hidden></div>
      <div class="mgp-notice mgp-notice--announce" data-announcement hidden></div>
      <div class="mgp-status" data-state="idle">
        <div class="mgp-ring" role="progressbar" aria-valuemin="0">
          <svg class="mgp-ring-svg" viewBox="0 0 48 48" aria-hidden="true">
            <circle class="mgp-ring-track" cx="24" cy="24" r="20" pathLength="100"/>
            <circle class="mgp-ring-fill" cx="24" cy="24" r="20" pathLength="100"/>
          </svg><span class="mgp-ring-scan" aria-hidden="true"></span>
          <span class="mgp-ring-core" aria-hidden="true"></span>
        </div>
        <div class="mgp-readout">
          <span class="mgp-state"><span class="mgp-dot" aria-hidden="true"></span><span data-state-label></span></span>
          <span class="mgp-count"><span class="mgp-roll"></span><span class="mgp-of"></span></span>
          <span class="mgp-caption"></span>
        </div>
      </div>
      <div class="mgp-task" hidden>
        <span class="mgp-task-icon">${icon(IconName.MAIL)}</span>
        <span class="mgp-task-title"></span><span class="mgp-task-sub"></span>
        <span class="mgp-task-bar" aria-hidden="true"><span></span></span>
      </div>
      <p class="mgp-msg" data-message hidden></p>
      <div class="mgp-upgrade" hidden>
        <span class="mgp-upgrade-title"></span><span class="mgp-upgrade-text"></span>
        <div class="mgp-upgrade-actions">
          <button class="mgp-btn mgp-btn--secondary mgp-btn--sm" type="button" data-pricing></button>
          <button class="mgp-btn mgp-btn--ghost mgp-btn--sm" type="button" data-check></button>
        </div>
      </div>
      <div class="mgp-actions">
        <button class="mgp-btn mgp-btn--primary" type="button" data-primary></button>
        <button class="mgp-btn mgp-btn--secondary" type="button" data-secondary hidden></button>
      </div>
      <div class="mgp-section" role="group" hidden>
        <span class="mgp-section-label"></span><p class="mgp-msg" data-place-message hidden></p>
      </div>
    </div>
    <footer class="mgp-foot"><span data-limit></span><a data-help target="_blank" rel="noopener noreferrer"></a></footer>
    <span class="mgp-sr" aria-live="polite"></span>`
  shadow.append(style, panel)
  mountPoint.appendChild(host)
  return panel
}

const modeLabels = {
  search: [K.MODE_SEARCH, IconName.SEARCH],
  list: [K.LIST_SECTION, IconName.LIST],
  place: [K.MODE_PLACE, IconName.PIN],
  reviews: [K.REVIEWS_SECTION, IconName.REVIEW],
  photos: [K.PHOTOS_SECTION, IconName.IMAGE]
} as const

export function renderHeader(panel: HTMLElement, mode: PanelMode): void {
  panel.setAttribute('aria-label', I18nService.t(K.TITLE))
  text(panel, '.mgp-title', I18nService.t(K.TITLE))
  const [label, glyph] = modeLabels[mode]
  const tag = node(panel, '.mgp-mode')
  tag.innerHTML = icon(glyph)
  tag.append(I18nService.t(label))
  const help = node<HTMLAnchorElement>(panel, '[data-help]')
  help.href = new URL('/help/', WEBSITE.BASE_URL).href
  help.textContent = I18nService.t(K.HELP)
}

export function renderContext(
  panel: HTMLElement,
  bulk: BulkWorkParams | null,
  reviews: boolean
): void {
  const context = node<HTMLAnchorElement>(panel, '[data-context]')
  context.hidden = bulk === null
  if (bulk === null) return
  context.href = `${chrome.runtime.getURL('src/dashboard.html')}?type=${reviews ? '1' : '0'}`
  context.target = '_blank'
  context.rel = 'noopener noreferrer'
  context.onclick = async event => {
    event.preventDefault()
    const channel = new BackgroundChannel()
    try {
      await channel.openBulkDashboard({ type: reviews ? '1' : '0' })
    } catch (error) {
      logger.error('[MapsPanel] 打开批量任务页失败:', error)
    } finally {
      channel.destroy()
    }
  }
  text(context, '.mgp-context-label', I18nService.t(K.BULK_TASK))
  text(context, '.mgp-context-count', `${bulk.itemIndex + 1} / ${bulk.itemCount}`)
  text(context, '.mgp-context-link', I18nService.t(K.DASHBOARD))
  node(context, '.mgp-context-link').insertAdjacentHTML('beforeend', icon(IconName.ARROW_UP_RIGHT))
  context.style.setProperty('--p', String((bulk.itemIndex / bulk.itemCount) * 100))
}

export function renderCount(panel: HTMLElement, count: number): void {
  const roll = node(panel, '.mgp-roll')
  const digits = number(count)
  if (roll.dataset.value === digits) return
  if (roll.children.length !== digits.length) {
    roll.replaceChildren()
    for (const char of digits) {
      const digit = document.createElement('span')
      digit.className = 'mgp-roll-digit'
      if (/\d/.test(char)) {
        digit.innerHTML =
          '<span class="mgp-roll-ghost">0</span><span class="mgp-roll-strip">' +
          Array.from({ length: 10 }, (_, n) => `<span>${n}</span>`).join('') +
          '</span>'
      } else digit.textContent = char
      roll.appendChild(digit)
    }
  }
  Array.from(roll.children).forEach((digit, index) => {
    const strip = digit.querySelector<HTMLElement>('.mgp-roll-strip')
    if (strip) strip.style.setProperty('--d', digits[index] ?? '0')
    else digit.textContent = digits[index] ?? ''
  })
  roll.dataset.value = digits
  roll.setAttribute('aria-hidden', 'true')
}

export function renderStatus(
  panel: HTMLElement,
  state: PanelStatus,
  count: number,
  limit: number,
  label: string,
  caption: string,
  core: IconName
): void {
  node(panel, '.mgp-status').dataset.state = state
  const ring = node(panel, '.mgp-ring')
  ring.setAttribute('aria-label', I18nService.t(K.PROGRESS))
  ring.setAttribute('aria-valuemax', String(limit))
  ring.setAttribute('aria-valuenow', String(count))
  ring.style.setProperty('--p', String(limit > 0 ? Math.min(100, (count / limit) * 100) : 0))
  const center = node(panel, '.mgp-ring-core')
  if (center.dataset.icon !== core) {
    center.innerHTML = icon(core)
    center.dataset.icon = core
  }
  text(panel, '[data-state-label]', label)
  renderCount(panel, count)
  text(panel, '.mgp-of', `/ ${number(limit)}`)
  text(panel, '.mgp-caption', caption)
  const live = node(panel, '.mgp-sr')
  const last = Number(live.dataset.updated ?? 0)
  if (live.dataset.state !== state || Date.now() - last >= 3000) {
    live.textContent = `${label} · ${number(count)} / ${number(limit)}. ${caption}`
    live.dataset.updated = String(Date.now())
    live.dataset.state = state
  }
}

export function renderButton(
  button: HTMLButtonElement,
  key: string,
  label: string,
  glyph: IconName,
  busy = false,
  unavailable = false,
  ext = ''
): void {
  button.hidden = false
  button.setAttribute('aria-busy', String(busy))
  button.setAttribute('aria-disabled', String(busy || unavailable))
  if (button.dataset.action !== key) {
    const morph = document.createElement('span')
    morph.className = 'mgp-morph'
    const current = button.firstElementChild?.querySelector('.is-active')
    if (current) {
      current.className = 'is-leaving'
      current.setAttribute('aria-hidden', 'true')
      morph.append(current)
    }
    const active = document.createElement('span')
    active.className = 'is-active'
    active.innerHTML =
      (busy ? '<span class="mgp-spinner" aria-hidden="true"></span>' : icon(glyph)) +
      '<span data-button-label></span><span class="mgp-btn-tag" hidden></span>'
    morph.append(active)
    button.replaceChildren(morph)
    button.dataset.action = key
  }
  const active = node(button, '.is-active')
  text(active, '[data-button-label]', label)
  const tag = node(active, '.mgp-btn-tag')
  tag.textContent = ext
  tag.hidden = ext.length === 0
}

export function renderMessage(
  panel: HTMLElement,
  key: string | null,
  tone = 'bad',
  place = false
): void {
  const message = node(panel, place ? '[data-place-message]' : '[data-message]')
  message.hidden = key === null
  message.dataset.tone = tone
  message.setAttribute('role', tone === 'bad' ? 'alert' : 'status')
  const signature = `${key}:${I18nService.getCurrentLanguage()}`
  if (message.dataset.key === signature) return
  message.dataset.key = signature
  message.replaceChildren()
  if (key !== null) {
    message.innerHTML = icon(tone === 'ok' ? IconName.CHECK : IconName.ALERT_CIRCLE)
    const label = document.createElement('span')
    label.textContent = I18nService.t(key)
    message.appendChild(label)
    if (key === K.PARSE_ERROR || key === K.PLACE_ERROR) {
      const reload = document.createElement('button')
      reload.type = 'button'
      reload.className = 'mgp-msg-action'
      reload.textContent = I18nService.t(K.RELOAD)
      reload.onclick = () => location.reload()
      label.append(' ', reload)
    }
  }
}

export function renderUpgrade(panel: HTMLElement, visible: boolean, checking: boolean): void {
  node(panel, '.mgp-upgrade').hidden = !visible
  text(panel, '.mgp-upgrade-title', I18nService.t(K.UPGRADE_TITLE))
  text(panel, '.mgp-upgrade-text', I18nService.t(K.UPGRADE_HINT))
  renderButton(
    node(panel, '[data-pricing]'),
    'pricing',
    I18nService.t(K.UPGRADE_PLAN),
    IconName.ARROW_UP_RIGHT
  )
  renderButton(
    node(panel, '[data-check]'),
    checking ? 'checking' : 'check',
    I18nService.t(checking ? K.CHECKING : K.CHECK_AGAIN),
    IconName.REFRESH,
    checking
  )
}

export function renderFooter(
  panel: HTMLElement,
  usage: MapsUsageSnapshot | null,
  limit: number
): void {
  text(
    panel,
    '[data-limit]',
    `${usage ? `${usage.plan_name} · ` : ''}${I18nService.t(K.RUN_LIMIT, { limit: number(limit) })}`
  )
}

export async function openPanelPricing(): Promise<void> {
  const url =
    buildMapsPricingUrl(getMapsConfig().operations.pricingUrl) ||
    buildPricingUrl('quota_upgrade_button')
  const channel = new BackgroundChannel()
  try {
    await channel.openPricingPage({ url })
  } catch (error) {
    logger.error('[MapsPanel] 打开订阅页失败:', error)
  } finally {
    channel.destroy()
  }
}
