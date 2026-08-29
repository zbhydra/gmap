/**
 * 下载工作区插件引导展示策略。
 *
 * 首页由组件参数强制默认展示；其他复用页保留 Telegram 500MiB 及以上文件的桌面端引导，避免平台页过度打扰。
 */

import type { MediaPost } from './types'

/** 桌面端单文件下载的插件引导阈值。 */
export const LARGE_FILE_EXTENSION_GUIDE_THRESHOLD_BYTES = 500 * 1024 * 1024

function isDesktopPointer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** 判断资源是否应展示内嵌插件引导。 */
export function shouldShowLargeFileExtensionGuide(resource: MediaPost): boolean {
  return (
    resource.platform === 'telegram' &&
    typeof resource.size === 'number' &&
    resource.size >= LARGE_FILE_EXTENSION_GUIDE_THRESHOLD_BYTES &&
    isDesktopPointer()
  )
}
