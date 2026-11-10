import { logger } from '@/core/utils/logger'
import type { JsonValue } from '@/core/rpc/types'
import type { BulkEffects } from './types'

/** 页内身份查询必须有界，避免无回复的页面挂住调度器串行队列。 */
export async function closeBulkWorkPage(work: BulkEffects['closeTabs'][number]): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const context = `tabId=${work.tabId}, task=${work.taskId}, item=${work.itemIndex}`
  try {
    const reply: JsonValue | undefined = await Promise.race([
      chrome.tabs.sendMessage(work.tabId, { __bulkWorkIdentity__: true }, { frameId: 0 }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`[BulkScheduler] 查询工作页身份超时（2000ms）: ${context}`))
        }, 2_000)
      })
    ])
    if (
      typeof reply !== 'object' ||
      reply === null ||
      !('taskId' in reply) ||
      reply.taskId !== work.taskId ||
      !('itemIndex' in reply) ||
      reply.itemIndex !== work.itemIndex
    ) {
      logger.info(`[BulkScheduler] 工作页未回报匹配身份，保留标签页: ${context}`)
      return
    }
    await chrome.tabs.remove(work.tabId)
  } catch (error) {
    logger.error(`[BulkScheduler] 核验或关闭工作页失败，保留标签页: ${context}`, error)
  } finally {
    clearTimeout(timer)
  }
}
