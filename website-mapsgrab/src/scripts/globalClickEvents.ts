/**
 * 全局 data-ga-event 委派：任何带 `data-ga-event` 的元素被点击时，
 * 自动向 GA4 上报对应事件。其他 data-ga-* 属性会作为 event params 一并带上。
 *
 * 新 CTA 只需在元素上加 `data-ga-event="xxx"`，不需要额外 JS。
 */

import { collectUtmParams } from './homepage/ga4'

type GA4EventParamValue = string | number | boolean | undefined

type GtagFn = (command: 'event', name: string, params?: Record<string, GA4EventParamValue>) => void

declare global {
  interface Window {
    gtag?: GtagFn
  }
}

const GA_EVENT_ATTR = 'data-ga-event'
const GA_PARAM_PREFIX = 'data-ga-'
const CTA_ATTR = 'data-cta'
const CHROME_WEB_STORE_HOST = 'chromewebstore.google.com'
const MARK_RECORD_PATH = '/api/client/mark/record'

/** 事件元素的自归因地址：链接元素取其 href，其余（表单按钮等）取当前页面地址。 */
function resolveAttributionHref(element: HTMLElement): string {
  if (element instanceof HTMLAnchorElement && element.href) {
    return element.href
  }
  return window.location.href
}

/**
 * 合并 utm 归因参数（015 feat 埋点表：CTA 点击/工具使用带 utm）。
 * 优先级：显式 params > 被点链接 utm > 当前页面 utm。
 */
function withUtmAttribution(
  params: Record<string, GA4EventParamValue>,
  element: HTMLElement
): Record<string, GA4EventParamValue> {
  const pageUtm = collectUtmParams(window.location.href)
  const linkUtm = collectUtmParams(resolveAttributionHref(element))
  return { ...pageUtm, ...linkUtm, ...params }
}

function collectParams(element: HTMLElement): Record<string, GA4EventParamValue> {
  const params: Record<string, GA4EventParamValue> = {}
  for (const attr of Array.from(element.attributes)) {
    if (!attr.name.startsWith(GA_PARAM_PREFIX) || attr.name === GA_EVENT_ATTR) {
      continue
    }
    // data-ga-foo-bar -> foo_bar
    const key = attr.name.slice(GA_PARAM_PREFIX.length).replace(/-/g, '_')
    if (key.length === 0) {
      continue
    }
    params[key] = attr.value
  }

  if (element instanceof HTMLAnchorElement && element.href && params.href === undefined) {
    params.href = element.href
  }

  return params
}

function findChromeWebStoreAnchor(element: HTMLElement): HTMLAnchorElement | null {
  const anchor = element.closest<HTMLAnchorElement>('a[href]')
  if (!anchor) {
    return null
  }

  try {
    return new URL(anchor.href).hostname === CHROME_WEB_STORE_HOST ? anchor : null
  } catch {
    return null
  }
}

async function dispatchInstallClickMark(target: HTMLElement): Promise<void> {
  const anchor = findChromeWebStoreAnchor(target)
  if (!anchor) {
    return
  }

  const [markModule, authModule, deviceModule, apiModule, slsModule] = await Promise.all([
    import('./homepage/mark'),
    import('./homepage/auth'),
    import('./homepage/device'),
    import('./homepage/api'),
    import('./homepage/sls-mark')
  ])
  const deviceId = await deviceModule.ensureDeviceId()
  const context = {
    deviceId,
    token: authModule.getStoredAccessToken()
  }
  const source = target.getAttribute('data-ga-source') ?? ''
  const markMsg = markModule.buildHomepageMarkMessage(anchor.href, [
    {
      sourceId: source || 'chrome_web_store',
      filename: document.title,
      type: target.getAttribute(GA_EVENT_ATTR) ?? 'chrome_web_store_click',
      size: 0,
      link: anchor.href
    }
  ])

  slsModule.reportHomepageMarkToSls(
    markModule.HOMEPAGE_MARK_TYPE.WEB_EXTENSION_INSTALL_CLICK,
    context,
    markMsg
  )
  apiModule.postJsonKeepalive(
    MARK_RECORD_PATH,
    context,
    {
      mark_type: markModule.HOMEPAGE_MARK_TYPE.WEB_EXTENSION_INSTALL_CLICK,
      mark_msg: markMsg,
      first_opened_at: deviceModule.ensureFirstOpenedAt()
    }
  )
}

function dispatchGAEvent(target: HTMLElement): void {
  const eventName = target.getAttribute(GA_EVENT_ATTR)
  if (!eventName) {
    return
  }

  const gtag = window.gtag
  if (typeof gtag !== 'function') {
    return
  }

  try {
    gtag('event', eventName, withUtmAttribution(collectParams(target), target))
  } catch {
    // 防止埋点异常影响主流程。
  }
}

/**
 * data-cta 统一漏斗事件（015 feat 埋点表 cta_click）：带 cta_id（data-cta 值）与 utm 归因。
 * 与 data-ga-event 业务事件并存；同元素双属性时两条事件都会上报（漏斗聚合 + 业务明细各取所需）。
 */
function dispatchCtaClick(target: HTMLElement): void {
  const gtag = window.gtag
  if (typeof gtag !== 'function') {
    return
  }

  try {
    gtag(
      'event',
      'cta_click',
      withUtmAttribution({ cta_id: target.getAttribute(CTA_ATTR) ?? '' }, target)
    )
  } catch {
    // 防止埋点异常影响主流程。
  }
}

document.addEventListener(
  'click',
  event => {
    const origin = event.target
    if (!(origin instanceof Element)) {
      return
    }
    const target = origin.closest<HTMLElement>(`[${GA_EVENT_ATTR}]`)
    if (!target) {
      return
    }
    void dispatchInstallClickMark(target).catch(error => {
      console.error(
        new Error('[global-click-events] Failed to report a Chrome Web Store click.', {
          cause: error
        })
      )
    })
    dispatchGAEvent(target)
  },
  { capture: true }
)

document.addEventListener(
  'click',
  event => {
    const origin = event.target
    if (!(origin instanceof Element)) {
      return
    }
    const target = origin.closest<HTMLElement>(`[${CTA_ATTR}]`)
    if (!target) {
      return
    }
    dispatchCtaClick(target)
  },
  { capture: true }
)
