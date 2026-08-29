/**
 * ExtensionMarkReporter - 统一处理跨插件上下文的 SLS 行为事件。
 *
 * Popup 与 Content 只广播业务事件，background 负责实际 WebTracking 请求。
 * 当前暂无业务事件；事件定义于 core/events/types 的 ExtensionEvents，
 * 落地时在此订阅并逐个接入 markApi。
 */

import type { ExtensionEvents } from '@/core/events/types'
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
    // 业务事件落地时在此追加订阅，例如：
    // this.unsubscribes.push(this.eventSubscriber.on('<event>', () => { ... }))
  }

  /** 释放事件订阅器。 */
  destroy(): void {
    for (const unsubscribe of this.unsubscribes.splice(0)) {
      unsubscribe()
    }
    this.eventSubscriber.destroy()
  }
}
