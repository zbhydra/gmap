/**
 * 插件端界面动作打点入口。
 *
 * 为什么统一成一个 `ui_action` 事件而不是每个按钮一个 mark_type：
 * 按钮会随 UI 迭代增删，每加一个就扩一次事件合同会让 SLS 里的事件名失控；
 * 动作本身作为 mark_msg 字段保留，查询时按 action 分组即可，粒度不损失。
 *
 * 全部 fire-and-forget：打点失败只记日志，绝不影响用户操作。
 */

import { logger } from '@/core/utils/logger'
import { markApi } from './api'
import { MARK_TYPE } from './types'

/** 动作打点允许的界面来源，与 SLS 的 surface 字段对齐。 */
export type UiMarkSurface = 'popup' | 'content'

/** 记录一次界面动作；`action` 用蛇形短名（如 `open_maps`、`start_reviews`）。 */
export function recordUiAction(
  action: string,
  surface: UiMarkSurface,
  details: Record<string, string | number | boolean> = {}
): void {
  const markMsg = [`action=${action}`, ...formatDetails(details)].join(', ')
  markApi.record(MARK_TYPE.UI_ACTION, markMsg, { surface }).catch(error => {
    logger.error(`[Mark] ui_action 打点失败: action=${action}, surface=${surface}`, error)
  })
}

/** 把附加字段序列化为 `key=value`，与 013 域既有 mark_msg 口径一致。 */
function formatDetails(details: Record<string, string | number | boolean>): string[] {
  return Object.entries(details).map(([key, value]) => `${key}=${String(value)}`)
}
