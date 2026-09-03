/**
 * 批量工作页启动中转页（013 A6）。
 *
 * 为什么需要中转：调度器（SW）经 chrome.tabs.create 打开工作页时，该标签页
 * 的**主框架导航**在 Playwright 环境下绕过 context.route（上游已知限制，
 * e2e 零外网依赖 route 拦截）。改为 SW 先打开本扩展页（扩展页无需拦截），
 * 再由渲染进程发起 location.replace 跳转——渲染进程发起的导航可被正常拦截
 * （与 window.open / page.goto 同类）。生产环境无感知：只是一瞬的扩展页闪烁。
 *
 * 安全面：仅允许跳转到两类批量工作页（Google Maps / 评论工作页），拒绝其余
 * 目标（防中转页被篡改为任意跳转）。
 */

import { I18N_KEYS } from '@/core/constants/i18n'
import { I18nService, i18nReady } from '@/locales'

const ALLOWED_TARGETS: readonly { origin: string; pathPrefix: string }[] = [
  { origin: 'https://www.google.com', pathPrefix: '/maps/search/' },
  { origin: 'https://search.google.com', pathPrefix: '/local/reviews' }
]

/** 解析并校验 ?url= 参数，合法则替换导航到目标工作页。 */
async function launch(): Promise<void> {
  await i18nReady
  document.documentElement.lang = I18nService.getCurrentLanguage()
  document.title = I18nService.t(I18N_KEYS.BULK_LAUNCH.TITLE)
  const target = new URLSearchParams(location.search).get('url')
  if (target === null) {
    document.body.textContent = I18nService.t(I18N_KEYS.BULK_LAUNCH.MISSING_URL)
    return
  }

  if (!URL.canParse(target)) {
    document.body.textContent = I18nService.t(I18N_KEYS.BULK_LAUNCH.INVALID_URL)
    return
  }
  const parsed = new URL(target)

  const allowed = ALLOWED_TARGETS.some(
    entry => parsed.origin === entry.origin && parsed.pathname.startsWith(entry.pathPrefix)
  )
  if (!allowed) {
    document.body.textContent = I18nService.t(I18N_KEYS.BULK_LAUNCH.TARGET_NOT_ALLOWED)
    return
  }

  location.replace(parsed.href)
}

launch().catch(error => {
  console.error('[BulkLaunch] 初始化失败:', error)
})
