/**
 * 面板挂载：Vue 3 createApp 直插自建 fixed 容器（拍板差异 1，不用 iframe）。
 *
 * i18n：等待 I18nService.initialize()（i18nReady）后创建 vue-i18n 实例并注册
 * 到 I18nService，语言切换（popup 内）即时同步到面板。挂载点幂等（已挂载
 * 不重复创建），宿主页 re-render 吃掉面板属直插方案已知取舍（调研 §9.1）。
 */

import { createApp } from 'vue'
import { createI18nInstance } from '@/core/bootstrap'
import { I18nService, i18nReady } from '@/locales'
import { logger } from '@/core/utils/logger'
import type { BingCollector } from '../collector'
import BingPanel from './BingPanel.vue'

/** 面板挂载宿主容器 id（自建 fixed 容器的挂载锚点）。 */
const PANEL_HOST_ID = 'bing-maps-scraper-panel-host'

/**
 * 挂载采集面板（幂等）。
 *
 * @param collector 采集状态机实例。
 */
export async function mountPanel(collector: BingCollector): Promise<void> {
  if (document.getElementById(PANEL_HOST_ID) !== null) {
    return
  }

  const host = document.createElement('div')
  host.id = PANEL_HOST_ID
  document.body.appendChild(host)

  try {
    await i18nReady
    const i18n = await createI18nInstance()
    I18nService.registerVueI18nInstance(i18n)

    const app = createApp(BingPanel, { collector })
    app.use(i18n)
    app.mount(host)
    logger.info('[BingPanel] 面板已挂载')
  } catch (error) {
    host.remove()
    logger.error('[BingPanel] 面板挂载失败:', error)
  }
}
