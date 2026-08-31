/**
 * ExtensionMarkReporter - 统一处理跨插件上下文的 SLS 行为事件。
 *
 * Popup 与 Content 只广播业务事件，background 负责实际 WebTracking 请求。
 * 事件定义于 core/events/types 的 ExtensionEvents，此处逐个订阅并接入 markApi；
 * 单路失败只记录错误，不影响另一路与扩展业务（局部可失败）。
 */

import { logger } from '@/core/utils/logger'
import { markApi } from '@/core/api/mark'
import { MARK_TYPE, type MarkType } from '@/core/api/mark/types'
import type { MarkEventPayload, ExtensionEvents } from '@/core/events/types'
import { ChromeEventSubscriber } from '@/core/rpc/ChromeEventBus'

/** 统一的插件行为打点订阅器。 */
export class ExtensionMarkReporter {
  /** 跨插件上下文的业务事件订阅器。 */
  private readonly eventSubscriber = new ChromeEventSubscriber<ExtensionEvents>()

  /** 事件取消订阅函数集合。 */
  private readonly unsubscribes: Array<() => void> = []

  /** 注册插件行为事件。重复调用不会重复订阅。 */
  setup(): void {
    if (this.unsubscribes.length > 0) {
      return
    }
    this.unsubscribes.push(
      this.eventSubscriber.on('mapsSearchMark', payload => {
        void this.record(MARK_TYPE.SEARCH, payload)
      }),
      this.eventSubscriber.on('mapsExportResultsMark', payload => {
        void this.record(MARK_TYPE.EXPORT_RESULTS, payload)
      }),
      this.eventSubscriber.on('mapsScrapeReviewsContentMark', payload => {
        void this.record(MARK_TYPE.SCRAPE_REVIEWS_CONTENT, payload)
      }),
      this.eventSubscriber.on('mapsEnrichCompleteMark', payload => {
        void this.record(MARK_TYPE.ENRICH_COMPLETE, payload)
      }),
      this.eventSubscriber.on('contentOpenMark', payload => {
        void this.record(MARK_TYPE.CONTENT_OPEN, payload)
      })
    )
  }

  /** 写 SLS 打点：失败仅记录（打点通道允许局部失败）。 */
  private async record(markType: MarkType, payload: MarkEventPayload): Promise<void> {
    try {
      const result = await markApi.record(markType, payload.markMsg, { pageUrl: payload.pageUrl })
      logger.info(
        `[ExtensionMarkReporter] ${markType} 打点完成: recorded=${String(result.recorded)}`
      )
    } catch (error) {
      logger.error(`[ExtensionMarkReporter] ${markType} 打点失败:`, error)
    }
  }

  /** 释放事件订阅器。 */
  destroy(): void {
    for (const unsubscribe of this.unsubscribes.splice(0)) {
      unsubscribe()
    }
    this.eventSubscriber.destroy()
  }
}
