/**
 * 站点能力可用性表（唯一真相）。
 *
 * false = 未交付：界面照常展示入口但灰化，并提示 i18n 的 common.comingSoon；鼠标、键盘与直接
 * 访问页面都不能从 UI 触发安装、购买或接入。介绍页本身始终可访问，本表只管动作入口与入口标记。
 * U1 / U2 交付后只改这里即可放开，各消费方不做第二份判断。
 *
 * 消费方式：
 * - Astro 动作入口用 components/site/CapabilityAction.astro；
 * - 介绍页入口标记（导航、卡片标题、按钮样式的链接等）用 components/site/SoonBadge.astro + .is-unavailable，照常可点；
 * - 命令式脚本与 Vue 组件直接 import 本表，按 capabilities[key] 渲染同一套 .is-unavailable / .soon-badge。
 */

export type Capability = 'extensionInstall' | 'extensionPurchase' | 'scraperApi' | 'photosApi' | 'mcp'

export const capabilities: Readonly<Record<Capability, boolean>> = {
  /** 插件安装：导航 Install、插件页 #install、各页安装 CTA。 */
  extensionInstall: false,
  /** 插件套餐购买：Pricing 插件档、Dashboard 插件线选购。 */
  extensionPurchase: false,
  /** REST API 的 Search 与 Reviews 端点（同一 Key、同一套餐）：获取 Key、购买、连接。 */
  scraperApi: true,
  /** Photos 端点：014 合同尚未实现，独立于 scraperApi 放开。 */
  photosApi: false,
  /** MCP 服务：连接、获取 Key。 */
  mcp: true
}
