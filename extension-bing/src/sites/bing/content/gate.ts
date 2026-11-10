/**
 * 免费/Pro 门控态（content 侧，016 §5）。
 *
 * 职责：把 background 的账号/订阅判定（getGateState RPC，缓存口径在
 * background authStore）镜像为模块级快照，供两处同步消费：
 * - 采集停止策略（createBingStopPolicy）：Pro 无单次上限（null），免费取
 *   scrape.freeRowLimit（可被远程稀疏覆盖）；
 * - 面板 UI（Pro 徽标 / 进度文案变体）。
 *
 * Start 首轮前强刷，auth 三键变化时同步刷新；后续每轮 getRowLimit()
 * 同步读快照并触发后台刷新。RPC 失败保留上次快照，初始快照为匿名免费。
 */

import { logger } from '@/core/utils/logger'
import { STORAGE_KEYS } from '@/core/api/config'
import { storageManager } from '@/core/storage'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { recordContentMark } from './marks'
import { MARK_TYPE } from '@/core/api/mark/types'
import { getBingConfig } from '../config/loader'
import type { BingStopPolicy } from './collector'

/** 门控态快照（background getGateState 响应镜像）。 */
export interface BingGateState {
  /** 是否已登录。 */
  authenticated: boolean
  /** 是否 Pro（订阅档有效）。 */
  isPro: boolean
}

/** 匿名快照（初始值与 RPC 失败兜底）：免费档。 */
const ANONYMOUS_GATE_STATE: BingGateState = {
  authenticated: false,
  isPro: false
}

/** 模块级快照（bootstrap boot 时刷新，采集轮增量刷新）。 */
let gateState: BingGateState = ANONYMOUS_GATE_STATE

/** 快照订阅者（面板 UI 响应式刷新）。 */
const listeners = new Set<(state: BingGateState) => void>()

/** 单飞去重的刷新 Promise。 */
let refreshPromise: Promise<void> | null = null

/** 同步读当前门控态快照。 */
export function getGateState(): BingGateState {
  return gateState
}

/** 订阅快照变更；返回取消订阅函数。 */
export function subscribeGateState(listener: (state: BingGateState) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * 普通刷新单飞去重；force 等在途请求结束后重新查询，失败保留当前快照。
 */
export function refreshGateState(options: { force?: boolean } = {}): Promise<BingGateState> {
  if (options.force && refreshPromise) {
    return refreshPromise.then(() => refreshGateState(options))
  }
  refreshPromise ??= doRefresh(options).finally(() => {
    refreshPromise = null
  })
  return refreshPromise.then(() => gateState)
}

/** 同批认证变更合并刷新；同会话资料回写由当前 RPC 收敛，避免自触发循环。 */
export function watchGateAuthStorage(): () => void {
  let scheduled = false
  const unwatch = [
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER_INFO
  ].map(key =>
    storageManager.onChanged(key, () => {
      if (scheduled || (key === STORAGE_KEYS.USER_INFO && refreshPromise)) {
        return
      }
      scheduled = true
      queueMicrotask(() => {
        scheduled = false
        void refreshGateState({ force: true })
      })
    })
  )
  return () => {
    for (const stop of unwatch) stop()
  }
}

/** 执行一次刷新：RPC 成功覆盖快照并广播，失败仅记日志（匿名/上次快照兜底）。 */
async function doRefresh(options: { force?: boolean }): Promise<void> {
  const channel = new BackgroundChannel()
  try {
    const next = await channel.getGateState(options)
    const previous = gateState
    gateState = next
    for (const listener of listeners) {
      listener(gateState)
    }
    // 只有真实翻转才打点：getRowLimit 每轮都会触发刷新，全量上报会淹没日志。
    // 放在通知之后，保证 UI 刷新不受打点通道影响。
    if (previous.authenticated !== next.authenticated || previous.isPro !== next.isPro) {
      recordContentMark(
        MARK_TYPE.GATE_STATE_CHANGE,
        `authenticated=${next.authenticated}, is_pro=${next.isPro}`
      )
    }
  } catch (error) {
    logger.error('[BingGate] 门控态刷新失败，保留当前快照:', error)
  } finally {
    channel.destroy()
  }
}

/**
 * 门控停止条件（016 §5 U4 读取点实现）：
 *
 * Pro（订阅态有效）返回 null = 无单次上限；免费/匿名返回 scrape.freeRowLimit。
 * 每次读取同步返回当前快照并触发后台刷新——登录/订阅切换在下一轮采集
 * 循环生效；collector 另取共享月余额的最小值。导出免费提示只消费单次权益。
 */
export function createBingStopPolicy(): BingStopPolicy {
  return {
    getRowLimit(): number | null {
      void refreshGateState()
      return gateState.isPro ? null : getBingConfig().scrape.freeRowLimit
    }
  }
}
