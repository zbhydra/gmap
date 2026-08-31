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
import { BingCollector } from './collector'
import { createBingStopPolicy, refreshGateState } from './gate'
import { mountPanel } from './panel/mount'

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
  await mountPanel(collector)

  // 门控态拉取放在面板挂载后异步执行：面板先以匿名快照渲染，
  // 快照到达后经订阅即时切换（Pro 徽标 / Pricing 态）
  void refreshGateState()
}
