/**
 * 批量工作页启动中转页（013 A6）。
 *
 * 先由 background 将真实标签页 owner 落盘，再允许进入采集页；许可失败
 * 或任务已有其他 owner 时关闭本页，避免 SW 恢复后重复启动同一条目。
 */

import { I18N_KEYS } from '@/core/constants/i18n'
import { I18nService, i18nReady } from '@/locales'
import { BackgroundChannel } from '@/popup/rpc/background.rpc'

const ALLOWED_TARGETS: readonly { origin: string; pathPrefix: string }[] = [
  { origin: 'https://www.google.com', pathPrefix: '/maps/search/' },
  { origin: 'https://www.google.com', pathPrefix: '/maps/place/' }
]

/** 等待 owner 落盘许可；未获许可的中转页始终不能进入采集链。 */
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
  if (
    !ALLOWED_TARGETS.some(
      entry => parsed.origin === entry.origin && parsed.pathname.startsWith(entry.pathPrefix)
    )
  ) {
    document.body.textContent = I18nService.t(I18N_KEYS.BULK_LAUNCH.TARGET_NOT_ALLOWED)
    return
  }
  const background = new BackgroundChannel()
  try {
    if (await background.authorizeBulkWorkPage()) {
      location.replace(parsed.href)
      return
    }
  } catch (error) {
    console.error('[BulkLaunch] 请求采集许可失败:', error)
  } finally {
    background.destroy()
  }
  const tab = await chrome.tabs.getCurrent()
  if (tab?.id !== undefined) await chrome.tabs.remove(tab.id)
}

launch().catch(error => {
  console.error('[BulkLaunch] 初始化失败:', error)
})
