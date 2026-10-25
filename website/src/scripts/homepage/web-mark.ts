/**
 * website 埋点辅助（只写 SLS）。
 *
 * 页面浏览、CTA、导航、工具与工作区动作都在这里统一出口，不各自拼字段：
 * - 所有事件自动带 `page_path` / `utm_*` / `referrer_host`，靠 SLS 侧公共字段
 *   做漏斗，不要求每次调用都手工传一遍；
 * - 全部 fire-and-forget，打点失败不影响任何用户操作。
 */

import { trackWebMark, formatMarkMessage, HOMEPAGE_MARK_TYPE } from './mark'

/** 归因参数，与 GA4 侧 `collectUtmParams` 同源口径。 */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

/** 记录页面浏览。每次 SSG 页面加载调用一次。 */
export function trackPageView(): void {
  trackWebMark(
    HOMEPAGE_MARK_TYPE.WEB_PAGE_VIEW,
    formatMarkMessage({
      path: location.pathname,
      locale: document.documentElement.lang,
      ref_host: readReferrerHost(),
      ...readUtm()
    })
  )
}

/**
 * 记录 CTA 点击。
 *
 * `cta_id` 取自 `data-cta`；`data-ga-*` 上的业务字段一并带入，避免同一元素
 * 在 GA4 与 SLS 两处各写一份参数。
 */
export function trackCtaClick(ctaId: string, element: HTMLElement): void {
  const gaFields = collectGaFields(element)
  trackWebMark(
    HOMEPAGE_MARK_TYPE.WEB_CTA_CLICK,
    formatMarkMessage({
      cta_id: ctaId,
      tag: element.tagName.toLowerCase(),
      href: readLinkPath(element),
      ...gaFields,
      ...readUtm()
    })
  )
}

/** 记录界面动作（导航、语言切换、主题等）；`action` 用蛇形短名。 */
export function trackUiAction(
  action: string,
  details: Record<string, string | number | boolean | null | undefined> = {}
): void {
  trackWebMark(
    HOMEPAGE_MARK_TYPE.WEB_UI_ACTION,
    formatMarkMessage({ action, ...details, ...readUtm() })
  )
}

/** 登录流程阶段（open / send_code / code_login / google_start / google_success / ...）。 */
export function trackAuthEvent(
  stage: string,
  details: Record<string, string | number | boolean | null | undefined> = {}
): void {
  trackWebMark(HOMEPAGE_MARK_TYPE.WEB_AUTH_EVENT, formatMarkMessage({ stage, ...details }))
}

/** 商业化流程阶段（pricing_view / plan_click / checkout_submit / checkout_success / ...）。 */
export function trackCheckoutEvent(
  stage: string,
  details: Record<string, string | number | boolean | null | undefined> = {}
): void {
  trackWebMark(HOMEPAGE_MARK_TYPE.WEB_CHECKOUT_EVENT, formatMarkMessage({ stage, ...details }))
}

/** Dashboard 工作区动作（view_switch / job_submit / job_download / filter_apply / ...）。 */
export function trackDashboardAction(
  action: string,
  details: Record<string, string | number | boolean | null | undefined> = {}
): void {
  trackWebMark(HOMEPAGE_MARK_TYPE.WEB_DASHBOARD_ACTION, formatMarkMessage({ action, ...details }))
}

/** 免费工具使用（view / use / error / copy / download / open_link）。 */
export function trackToolEvent(
  action: string,
  toolId: string,
  details: Record<string, string | number | boolean | null | undefined> = {}
): void {
  trackWebMark(
    HOMEPAGE_MARK_TYPE.WEB_TOOL_EVENT,
    formatMarkMessage({ action, tool_id: toolId, ...details })
  )
}

/** MCP 授权流程（consent_view / consent_decide）。 */
export function trackMcpEvent(
  action: string,
  details: Record<string, string | number | boolean | null | undefined> = {}
): void {
  trackWebMark(HOMEPAGE_MARK_TYPE.WEB_MCP_EVENT, formatMarkMessage({ action, ...details }))
}

/**
 * 记录接口业务错误（4xx/5xx 与业务码）。
 *
 * 与 `web_backend_connect_failed` 互补：后者只覆盖连不上/超时，这里覆盖
 * 「服务器已响应但结果是错误」，两者合起来才是完整的失败面。
 */
export function trackApiError(
  method: string,
  path: string,
  httpStatus: number,
  businessCode: string | number | undefined,
  message: string
): void {
  trackWebMark(
    HOMEPAGE_MARK_TYPE.WEB_API_ERROR,
    formatMarkMessage({
      method,
      api_path: sanitizePath(path),
      http_status: httpStatus,
      code: businessCode,
      message: message.slice(0, 200)
    })
  )
}

/** 读取 `data-ga-*` 业务字段（排除事件名本身）。 */
function collectGaFields(element: HTMLElement): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const attr of Array.from(element.attributes)) {
    if (!attr.name.startsWith('data-ga-') || attr.name === 'data-ga-event') {
      continue
    }
    fields[attr.name.slice('data-ga-'.length).replace(/-/g, '_')] = attr.value
  }
  return fields
}

/** 链接元素取 path（不含 query，避免把跟踪参数写进日志），非链接取空。 */
function readLinkPath(element: HTMLElement): string {
  if (!(element instanceof HTMLAnchorElement) || !element.href) {
    return ''
  }
  try {
    const url = new URL(element.href)
    return `${url.host}${url.pathname}`
  } catch {
    return ''
  }
}

/** 只看 referrer 的 host：完整 referrer URL 含 query，属于不该外发的数据。 */
function readReferrerHost(): string {
  if (!document.referrer) {
    return ''
  }
  try {
    return new URL(document.referrer).host
  } catch {
    return ''
  }
}

/** 读取当前页面 URL 上的 utm 参数。 */
function readUtm(): Record<string, string> {
  const params = new URLSearchParams(location.search)
  const utm: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) {
      utm[key] = value
    }
  }
  return utm
}

/** 只保留 API path，去掉 base URL / query / fragment。 */
function sanitizePath(path: string): string {
  try {
    return new URL(path, location.origin).pathname
  } catch {
    return path.split('?')[0]?.split('#')[0] ?? ''
  }
}
