/**
 * 免费/Pro 门控态（content 侧，016 §5）。
 *
 * 职责：把 background 的账号/订阅判定（getGateState RPC，缓存口径在
 * background authStore）镜像为模块级快照，供两处同步消费：
 * - 采集停止策略（createBingStopPolicy）：Pro 无上限（null），免费取
 *   scrape.freeRowLimit（可被远程稀疏覆盖）；
 * - 面板 UI（Pro 徽标 / 进度文案变体）。
 *
 * 即时生效机制（T1 §7 U4「下一轮循环读取」）：采集主循环每轮经
 * getRowLimit() 同步读快照，同时触发一次后台刷新（单飞去重）——快照
 * 最迟滞后一轮（轮距 ≤2s）反映登录/订阅切换。RPC 失败保留上次快照，
 * 初始匿名快照恒为免费档（宁严勿松，不闪断采集中会话）。
 */

import { logger } from '@/core/utils/logger'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
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
 * 经 background 刷新快照（单飞去重；失败保留当前快照）。
 */
export function refreshGateState(): Promise<BingGateState> {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise.then(() => gateState)
}

/** 执行一次刷新：RPC 成功覆盖快照并广播，失败仅记日志（匿名/上次快照兜底）。 */
async function doRefresh(): Promise<void> {
  const channel = new BackgroundChannel()
  try {
    const next = await channel.getGateState()
    gateState = next
    for (const listener of listeners) {
      listener(gateState)
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
 * Pro（订阅态有效）返回 null = 无上限；免费/匿名返回 scrape.freeRowLimit。
 * 每次读取同步返回当前快照并触发后台刷新——登录/订阅切换在下一轮采集
 * 循环生效；导出末行提示复用同一读取点（hasRowLimit），口径同源。
 */
export function createBingStopPolicy(): BingStopPolicy {
  return {
    getRowLimit(): number | null {
      void refreshGateState()
      return gateState.isPro ? null : getBingConfig().scrape.freeRowLimit
    }
  }
}
