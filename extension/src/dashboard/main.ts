/**
 * Dashboard 批量任务页入口（013 A6，U5）。
 *
 * 与 options 页同构：Vue 3 + vue-i18n（createI18nInstance 读设置语言），
 * 注册到 I18nService 实现语言切换自动同步。不引入 Pinia（无跨组件响应态）；
 * 任务状态读写经 background RPC（bulk 命令与状态查询），本地不直接写
 * IndexedDB——写路径统一走 SW 状态机保证互斥与落盘一致。
 */

import { createApp } from 'vue'
import '@/styles/tokens.css'
import { createI18nInstance } from '@/core/bootstrap'
import { I18nService } from '@/locales'
import { I18N_KEYS } from '@/core/constants/i18n'
import { logger } from '@/core/utils/logger'
import App from './App.vue'

async function init() {
  const app = createApp(App)

  const i18n = await createI18nInstance()
  document.documentElement.lang = I18nService.getCurrentLanguage()
  document.title = I18nService.t(I18N_KEYS.DASHBOARD.TITLE)
  I18nService.registerVueI18nInstance(i18n)

  app.use(i18n)
  app.mount('#app')

  logger.info('[Dashboard] 批量任务页已加载')
}

init().catch(error => {
  logger.error('[Dashboard] 初始化失败:', error)
})
