/**
 * 导航工具函数
 * 提供统一的官网页面导航接口
 */

import { logger } from './logger'
import { WEBSITE } from '@/core/api/config'
import { markApi } from '@/core/api/mark'
import { MARK_TYPE } from '@/core/api/mark/types'

/** Pricing 来源，用于官网埋点区分插件入口。 */
export type PricingSource =
  | 'quota_counter'
  | 'quota_upgrade_button'
  | 'quota_unlimited_button'
  | 'upgrade_modal'

/**
 * 构建官网 Pricing URL。
 */
export function buildPricingUrl(source: PricingSource): string {
  const url = new URL(WEBSITE.PRICING_PATH, WEBSITE.BASE_URL)
  url.searchParams.set('product_kind', 'maps_extension')
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
 *
 * 打点收敛在这里而不是各调用点：popup 有三处入口（额度计数器、升级按钮、底部
 * plans 链接）都走本函数，且 content 面板后续也会复用，避免逐点接线后漏埋。
 */
export async function openPricingPage(source: PricingSource): Promise<boolean> {
  markApi
    .record(MARK_TYPE.PRICING_OPEN, `source=${source}, plan=maps_extension`)
    .catch(error => logger.error(`[Navigation] pricing_open 打点失败: source=${source}`, error))
  const url = buildPricingUrl(source)
  return openExternalPage(url, `pricing:${source}`)
}

/** 同类型批量页复用已有标签，避免重复创建任务工作区。 */
export async function openBulkDashboard(type: '0' | '1'): Promise<boolean> {
  const url = `${chrome.runtime.getURL('src/dashboard.html')}?type=${type}`
  try {
    const [existing] = await chrome.runtime.getContexts({
      contextTypes: ['TAB'],
      documentUrls: [url]
    })
    if (existing) {
      await chrome.tabs.update(existing.tabId, { active: true })
      await chrome.windows.update(existing.windowId, { focused: true })
      return true
    }
    return openExternalPage(url, `bulk:${type}`)
  } catch (error) {
    logger.error(`[Navigation] 打开批量任务页失败: type=${type}`, error)
    return false
  }
}
