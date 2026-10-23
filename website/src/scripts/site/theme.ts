/**
 * 站点主题偏好：亮 / 暗 / 跟随系统三态，写入 localStorage['mg-theme']（首帧恢复在 Layout 内联脚本）。
 *
 * 页头主题下拉（chrome.ts）与 Dashboard 账户菜单共用；切换动画由各调用方自行决定。
 */

/** 主题偏好。 */
export type SiteTheme = 'light' | 'dark' | 'system'

/** 读取当前页面生效的主题偏好；没有手动选择时为跟随系统。 */
export function readSiteTheme(): SiteTheme {
  const value = document.documentElement.dataset.theme
  return value === 'light' || value === 'dark' ? value : 'system'
}

/** 应用并持久化主题偏好。 */
export function applySiteTheme(theme: SiteTheme): void {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
  try {
    if (theme === 'system') localStorage.removeItem('mg-theme')
    else localStorage.setItem('mg-theme', theme)
  } catch {
    // 存储被禁用时主题仍在当前页面生效。
  }
}
