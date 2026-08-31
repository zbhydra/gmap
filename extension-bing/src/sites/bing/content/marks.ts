/**
 * content 侧行为打点（recordMark RPC，background 统一写 SLS）。
 *
 * 走 T1 §4.1 扩准许的 `recordMark` content 调用通道（METHOD_TARGETS 增补
 * 'content'）；失败只记日志，绝不影响采集/导出主流程（局部可失败）。
 * mark_msg 形态沿用 013 域 `key=value, key=value` 口径。
 */

import { logger } from '@/core/utils/logger'
import type { MarkType } from '@/core/api/mark/types'
import { BackgroundChannel } from '@/content/rpc/background.rpc'

/**
 * 记录一条 content 侧行为打点（fire-and-forget）。
 *
 * @param markType 打点类型（MARK_TYPE 声明值）。
 * @param markMsg 附加信息（如 `version=new`、`format=csv, count=20, plan=free`）。
 */
export function recordContentMark(markType: MarkType, markMsg = ''): void {
  const channel = new BackgroundChannel()
  channel
    .recordMark({ mark_type: markType, mark_msg: markMsg })
    .then(result => {
      logger.info(`[BingMark] ${markType} 打点完成: recorded=${String(result.recorded)}`)
    })
    .catch(error => {
      logger.error(`[BingMark] ${markType} 打点失败:`, error)
    })
    .finally(() => {
      channel.destroy()
    })
}
