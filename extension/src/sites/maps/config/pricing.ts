/**
 * Maps 订阅引导落地页（013 U7 遗留接线，W7）。
 *
 * pricingUrl 由 backend operations 组随远程配置下发（空串 = 未配置，面板
 * 优雅降级为纯文案）。content script 无 chrome.tabs 能力，打开新标签经
 * background RPC `openPricingPage` 代开（chrome.tabs.create）。跳转统一
 * 追加 `utm_source=extension` 归因参数，官网侧据此区分插件来源流量。
 */

import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { logger } from '@/core/utils/logger'
import { getMapsConfig } from './loader'

/** 归因参数取值：来源 = 插件。 */
const PRICING_UTM_SOURCE = 'extension'

/** 归因参数名（与官网埋点口径一致）。 */
const PRICING_UTM_SOURCE_KEY = 'utm_source'

/**
 * 组装落地页 URL：远程 pricingUrl + `utm_source=extension`。
 *
 * 面板按钮可见性与点击打开的**单一事实源**：未配置（空串/纯空白）或远程值
 * 不是合法绝对地址时返回空串 → 按钮不渲染、降级为纯文案（脏值下「按钮可见」
 * 恒等「点击有效」）。运营通道脏数据容错不抛错，与版本比较的容错口径一致。
 */
export function buildMapsPricingUrl(pricingUrl: string): string {
  if (pricingUrl.trim().length === 0) {
    return ''
  }
  const source = pricingUrl.trim()
  if (!URL.canParse(source)) {
    return ''
  }
  const url = new URL(source)
  url.searchParams.set(PRICING_UTM_SOURCE_KEY, PRICING_UTM_SOURCE)
  return url.toString()
}

/**
 * 打开订阅落地页（面板「额度用尽」按钮点击路径）：读取生效配置组装 URL，
 * 经 background chrome.tabs.create 新标签打开。未配置时静默返回（按钮本
 * 不应出现，双保险）；失败仅记录（局部可失败，不影响面板其余交互）。
 */
export async function openMapsPricingPage(): Promise<void> {
  const url = buildMapsPricingUrl(getMapsConfig().operations.pricingUrl)
  if (url.length === 0) {
    return
  }
  const channel = new BackgroundChannel()
  try {
    await channel.openPricingPage({ url })
  } catch (error) {
    logger.error('[MapsPricing] 打开订阅落地页失败:', error)
  } finally {
    channel.destroy()
  }
}
