/**
 * ExtensionMarkReporter - 统一处理跨插件上下文的 SLS 行为事件。
 *
 * Popup 与 Content 只广播业务事件，background 负责实际 WebTracking 请求。
 */

import { markApi } from '@/core/api/mark'
import { MARK_TYPE } from '@/core/api/mark/types'
import type { ExtensionEvents } from '@/core/events/types'
import { ChromeEventSubscriber } from '@/core/rpc/ChromeEventBus'
import { logger } from '@/core/utils/logger'

/** 统一的插件行为打点订阅器。 */
export class ExtensionMarkReporter {
  /** 跨插件上下文的业务事件订阅器。 */
  private readonly eventSubscriber = new ChromeEventSubscriber<ExtensionEvents>()

  /** 升级弹窗打开事件的取消订阅函数。 */
  private upgradeModalOpenedUnsubscribe: (() => void) | null = null

  /** 注册插件行为事件。重复调用不会重复订阅。 */
  setup(): void {
    if (this.upgradeModalOpenedUnsubscribe) {
      return
    }

    this.upgradeModalOpenedUnsubscribe = this.eventSubscriber.on('upgradeModalOpened', () => {
      this.recordUpgradeModalOpen()
    })
  }

  /** 释放事件订阅器。 */
  destroy(): void {
    this.upgradeModalOpenedUnsubscribe?.()
    this.upgradeModalOpenedUnsubscribe = null
    this.eventSubscriber.destroy()
  }

  /** 异步记录升级弹窗打开，不阻塞弹窗展示。 */
  private recordUpgradeModalOpen(): void {
    markApi.record(MARK_TYPE.UPGRADE_MODAL_OPEN).catch(error => {
      logger.error('[ExtensionMarkReporter] 升级弹窗 SLS 打点失败:', error)
    })
  }
}
