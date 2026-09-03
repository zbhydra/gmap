/**
 * GA4 上报辅助函数。
 *
 * 全局 gtag 由 `Layout.astro` 注入，运行环境（例如 SSR、本地 dev、禁用脚本的浏览器）
 * 可能不存在，因此所有调用点都必须经过本辅助函数做 safe guard。
 */

type GA4EventParamValue = string | number | boolean | undefined

type GtagFn = (command: 'event', name: string, params?: Record<string, GA4EventParamValue>) => void

interface ErrorWithOptionalCode extends Error {
  /** 后端或浏览器错误码。 */
  code?: string | number
}

declare global {
  interface Window {
    gtag?: GtagFn
  }
}

export function reportGA4Event(
  name: string,
  params?: Record<string, GA4EventParamValue>
): void {
  if (typeof window === 'undefined') {
    return
  }

  const gtag = window.gtag
  if (typeof gtag !== 'function') {
    return
  }

  try {
    gtag('event', name, params)
  } catch (error) {
    console.error('[ga4] Event dispatch failed.', { eventName: name }, error)
    // 防止埋点异常影响主流程。
  }
}

/** 015 feat 埋点表要求的 utm 归因参数（CTA 点击 / 工具页进入带 utm）。 */
const UTM_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

/**
 * 从 URL query 中提取 utm_* 归因参数（GA4 事件参数沿用 utm_ 前缀命名）。
 * url 必须是绝对地址；解析失败（非法 URL / 非浏览器环境）返回空对象，不抛错。
 */
export function collectUtmParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  try {
    const query = new URL(url).searchParams
    for (const key of UTM_PARAM_KEYS) {
      const value = query.get(key)
      if (value) {
        params[key] = value
      }
    }
  } catch {
    console.error(new Error('[ga4] Failed to parse an attribution URL; value redacted.'))
    // 非法 URL 时静默返回空归因，埋点不阻塞主流程。
  }
  return params
}

/** 从异常中提取简短原因字符串。 */
export function extractFailureReason(error: Error | string | null | undefined): string {
  if (error instanceof Error) {
    const code = (error as ErrorWithOptionalCode).code
    if (code !== undefined && code !== null && code !== '') {
      return String(code)
    }
    return error.name || 'error'
  }
  if (typeof error === 'string' && error.length > 0) {
    return error
  }
  return 'unknown'
}
