import { MapsUserSettingsManager, type ThemeMode } from './userSettings'

export async function getCurrentTheme(): Promise<ThemeMode> {
  return (await MapsUserSettingsManager.getSettings()).theme
}

/** 扩展页面挂载前恢复主题；面板通过 getCurrentTheme 与设置订阅更新宿主属性。 */
export async function initializePageTheme(): Promise<void> {
  MapsUserSettingsManager.onSettingsChanged(settings => {
    document.documentElement.dataset.theme = settings.theme
  })
  document.documentElement.dataset.theme = await getCurrentTheme()
  document.documentElement.removeAttribute('data-theme-pending')
}
