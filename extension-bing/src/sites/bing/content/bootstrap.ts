/**
 * Bing Maps 站点自治 boot（T1 §1：配置加载 → 消息注册 → 面板挂载）。
 *
 * 装配序：
 * 1. `loadBingConfig()`——远程配置记忆化加载，失败静默回退包内默认（不阻塞）；
 * 2. 构造采集状态机（门控停止条件读取点 = createBingStopPolicy，016 §5：
 *    免费档 freeRowLimit 截断，Pro 订阅态有效放开无上限）——待命检测
 *    轮询即启；面板与 collector 同处 content 隔离 world，直接订阅状态快照，
 *    打点经 background `recordMark` RPC（marks.ts），无额外消息注册；
 * 3. `mountPanel()`——Vue 直插面板（幂等）；
 * 4. `refreshGateState()`——boot 拉取账号/订阅门控态（不阻塞挂载，面板
 *    订阅快照变更即时刷新）。
 *
 * 被 src/content/index.ts 调用；重复调用安全（面板挂载与检测轮询均幂等）。
 */

import { logger } from '@/core/utils/logger'
import { MARK_TYPE } from '@/core/api/mark/types'
import { loadBingConfig } from '@/sites/bing/config/loader'
import { recordContentMark } from './marks'
import { BingCollector, type BingPanelPhase } from './collector'
import { createBingStopPolicy, refreshGateState, getGateState } from './gate'
import { mountPanel } from './panel/mount'
import { enrichRows } from '../enrich/enrichClient'

/** 已完成的 boot 装配，防重复初始化（SPA 软导航重复触发入口时）。 */
let bootPromise: Promise<void> | null = null

/** 站点 boot 入口。 */
export function bootBingSite(): Promise<void> {
  bootPromise ??= doBoot()
  return bootPromise
}

async function doBoot(): Promise<void> {
  // 埋点表（feat.md）：content_open = content script 初始化（fire-and-forget，
  // 经 recordMark RPC 由 background 统一写 SLS；失败只记日志不影响主流程）
  recordContentMark(MARK_TYPE.CONTENT_OPEN)

  try {
    await loadBingConfig()
  } catch (error) {
    // loader 内部已静默回退包内默认值，此处兜底保证面板照常挂载
    logger.error('[BingBoot] 远程配置加载异常（已回退包内默认值）:', error)
  }

  const collector = new BingCollector(createBingStopPolicy())
  watchCompleteEdge(collector)
  await mountPanel(collector)

  // 门控态拉取放在面板挂载后异步执行：面板先以匿名快照渲染，
  // 快照到达后经订阅即时切换 Pro 徽标与采集进度文案
  void refreshGateState()
}

/**
 * 采集完成边沿收尾（016 E6 二期：Pro 会话 Email/社媒补全）。
 *
 * 订阅 collector 状态，collecting → completed 边沿触发一次补全：先刷新
 * 门控快照再判 isPro（免费/匿名跳过，行保持 ###PRO### 占位）。Go Back 回
 * 待命后新一轮采集再次完成会再次触发。补全失败已在 enrichRows 内收敛为
 * 空结果 + 打点，此处无需感知（局部可失败）。
 */
function watchCompleteEdge(collector: BingCollector): void {
  let lastPhase: BingPanelPhase = 'idle'
  collector.subscribe(state => {
    if (state.phase === 'completed' && lastPhase !== 'completed') {
      void finalizeCompletedSession(collector)
    }
    lastPhase = state.phase
  })
}

/** 单次完成会话的收尾执行（fire-and-forget，异常只记日志）。 */
async function finalizeCompletedSession(collector: BingCollector): Promise<void> {
  try {
    await refreshGateState()
    if (!getGateState().isPro) {
      return
    }
    await enrichRows(collector.getRows())
  } catch (error) {
    logger.error('[BingBoot] 完成边沿补全收尾异常:', error)
  }
}
