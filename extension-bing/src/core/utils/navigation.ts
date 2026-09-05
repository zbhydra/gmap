/**
 * 导航工具函数
 * 提供统一的官网页面导航接口
 */

import { logger } from './logger'
import { WEBSITE } from '@/core/api/config'

/** Pricing 来源，用于官网埋点区分插件入口。 */
export type PricingSource =
  | 'quota_counter'
  | 'quota_upgrade_button'
  | 'quota_unlimited_button'
  | 'upgrade_modal'
  | 'bing_panel'

/**
 * 构建官网 Pricing URL。
 */
export function buildPricingUrl(source: PricingSource): string {
  const url = new URL(WEBSITE.PRICING_PATH, WEBSITE.BASE_URL)
  url.searchParams.set('product_line', 'maps_extension')
  url.searchParams.set('utm_source', 'extension')
  url.searchParams.set('source', source)
  return url.toString()
}

/**
 * 在新标签页打开外部链接，避免扩展 Popup 自身发生导航。
 *
 * @param url 需要打开的完整外部链接
 * @param destination 用于日志定位的目标页面名称
 * @returns 是否成功创建新标签页或浏览器窗口
 */
export async function openExternalPage(url: string, destination: string): Promise<boolean> {
  try {
    logger.info('[Navigation] 正在打开外部页面', { url, destination })

    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      await chrome.tabs.create({ url })
      return true
    }

    window.open(url, '_blank', 'noopener,noreferrer')
    return true
  } catch (error) {
    logger.error(`[Navigation] 打开外部页面失败: destination=${destination}, url=${url}`, error)
    return false
  }
}

/**
 * 打开官网 Pricing 页。
 */
export async function openPricingPage(source: PricingSource): Promise<boolean> {
  const url = buildPricingUrl(source)
  return openExternalPage(url, `pricing:${source}`)
}
