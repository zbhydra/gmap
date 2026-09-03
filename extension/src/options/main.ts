/**
 * Options 设置页入口（013 A9，U6）。
 *
 * 与 popup 同构：Vue 3 + vue-i18n（createI18nInstance 读设置语言），
 * 注册到 I18nService 实现语言切换自动同步。不引入 Pinia（无跨组件
 * 响应态）；设置读写直接走 MapsUserSettingsManager。
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
  document.title = I18nService.t(I18N_KEYS.OPTIONS.TITLE)
  I18nService.registerVueI18nInstance(i18n)

  app.use(i18n)
  app.mount('#app')

  logger.info('[Options] 设置页已加载')
}

init().catch(error => {
  logger.error('[Options] 初始化失败:', error)
})
