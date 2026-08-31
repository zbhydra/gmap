/**
 * Maps 月度配额 content 侧客户端（013 A11，U7）。
 *
 * content 不直连后端（零 CORS 面）：usage 查询经 background RPC
 * `getMapsUsage` 透传（服务端现拉，对齐竞品「每次 boot 现拉 quota」语义），
 * 完成上报经事件总线广播给 background 的配额服务。
 *
 * 会话语义：一次 start→complete 为一个采集会话，会话发起时生成幂等 ID；
 * Pause→Resume 属同一会话（不换 ID），Reset 重新采集属新会话。上报失败
 * 不阻断采集（background 侧局部可失败）。
 */

import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { logger } from '@/core/utils/logger'
import type { ChromeEventEmitter } from '@/core/rpc'
import type { ExtensionEvents } from '@/core/events/types'
import type { MapsUsageSnapshot, MapsUsageSource } from './types'
import { isUsageExhausted } from './types'

/** 拉取 usage 快照；任何失败返回 null（fail-open，门控放行）。 */
export async function fetchUsageSnapshot(): Promise<MapsUsageSnapshot | null> {
  const channel = new BackgroundChannel()
  try {
    return await channel.getMapsUsage()
  } catch (error) {
    logger.error('[MapsUsage] usage 查询失败，按未知快照放行:', error)
    return null
  } finally {
    channel.destroy()
  }
}

/** 查询当前是否配额耗尽（快照不可得 = false）。 */
export async function isQuotaExhausted(): Promise<boolean> {
  return isUsageExhausted(await fetchUsageSnapshot())
}

/** 采集会话上报器：三个采集 boot（搜索/评论/照片）共用同一套会话语义。 */
export interface UsageSessionReporter {
  /** 会话开始（进入 extracting，Pause 恢复除外）时换新幂等 ID。 */
  beginSession(): void
  /** 会话完成（进入 complete 边沿）时上报记录数；0 条不上报。 */
  completeSession(records: number): void
}

/** 构造指定来源的会话上报器（构造即生成首个会话 ID）。 */
export function createUsageSessionReporter(
  emitter: ChromeEventEmitter<ExtensionEvents>,
  source: MapsUsageSource
): UsageSessionReporter {
  let requestId = crypto.randomUUID()
  return {
    beginSession: () => {
      requestId = crypto.randomUUID()
    },
    completeSession: (records: number) => {
      if (records <= 0) {
        return
      }
      emitter.emit('mapsUsageReport', {
        records,
        requestId,
        source,
        pageUrl: location.href
      })
    }
  }
}
