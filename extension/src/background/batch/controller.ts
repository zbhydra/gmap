/**
 * 批量任务调度控制器（013 A6，SW 侧装配）。
 *
 * 职责边界（已拍板「状态落盘的步进状态机」）：SW 不持有任何必须存活的业务
 * 状态——每次事件到达都从 IndexedDB 读最新状态，经纯 reducer 推进一步、落盘、
 * 执行副作用。三类唤醒源：
 * 1. 工作页完成回报（content 经事件总线 `mapsBulkItemDone`，消息本身会唤醒
 *    SW，不存在「采集完成但 SW 已死」的丢失窗口）；
 * 2. chrome.alarms 兜底扫描（30s 级周期）：卡死判定 + 启动丢失恢复 + 浏览器
 *    重启后的恢复/收尾（alarm 持久化，任务只存 IndexedDB）；
 * 3. chrome.tabs.onRemoved：工作页被用户关闭立即重试/跳过，不等 90s。
 *
 * 并发控制：dispatch 经模块级 Promise 串行队列，保证 read-modify-write 不
 * 交错；副作用在落盘之后执行，中途 SW 被杀由下次 alarm 恢复（幂等）。
 *
 * 工作页以 `active: true` 打开：批处理是串行单页推进，活动标签页不触发后台
 * 计时器节流（竞品用双页轮换对抗节流，我们以单活动页获得同样效果）。
 */

import { logger } from '@/core/utils/logger'
import { ChromeEventEmitter, ChromeEventSubscriber } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import { MapsUserSettingsManager } from '@/sites/maps/settings/userSettings'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { mapsUsageService } from '@/sites/maps/usage/usageService'
import { checkBulkQuota, estimateBulkRecords } from './quota'
import { bulkStateStore, emptyBulkState } from './store'
import { reduceBulkEvent } from './machine'
import type {
  BulkCommandResult,
  BulkCreateTaskParams,
  BulkMachineEvent,
  BulkReduceResult,
  BulkState
} from './types'

/** 兜底扫描 alarm 名。 */
export const BULK_SCAN_ALARM = 'bulk-task-scan'

/** alarm 周期：30 秒（Chrome 120+ 最小值；Firefox 钳到 1 分钟，卡死判定相应放宽）。 */
const SCAN_ALARM_PERIOD_MIN = 0.5

/** 批量任务调度控制器单例（background/index 与 RPC router 共享）。 */
export class BulkSchedulerController {
  /** 状态广播（通知 dashboard 重读 IndexedDB 快照）。 */
  private readonly broadcaster = new ChromeEventEmitter<ExtensionEvents>()

  /** 工作页完成回报订阅。 */
  private readonly subscriber = new ChromeEventSubscriber<ExtensionEvents>()

  /** 步进串行队列：读状态 → reduce → 落盘 → 执行副作用，全程不交错。 */
  private queue: Promise<void> = Promise.resolve()

  /** 已注册的 chrome 监听清理函数。 */
  private unsubscribeAlarms: (() => void) | null = null

  private unsubscribeTabsRemoved: (() => void) | null = null

  private unsubscribeItemDone: (() => void) | null = null

  private unsubscribeItemProgress: (() => void) | null = null

  /** 注册全部监听并做一次恢复扫描（SW 冷启动/浏览器重启后的收尾入口）。 */
  setup(): void {
    if (this.unsubscribeAlarms !== null) {
      return
    }

    this.unsubscribeItemDone = this.subscriber.on('mapsBulkItemDone', payload => {
      void this.dispatch({
        kind: 'item-done',
        taskId: payload.taskId,
        itemIndex: payload.itemIndex,
        collected: payload.collected
      }).catch(error => {
        logger.error('[BulkScheduler] 处理工作页完成回报失败:', error)
      })
    })

    // 进展回报：每页/每批新数据重置卡死时钟（慢而有进展不被误杀）
    this.unsubscribeItemProgress = this.subscriber.on('mapsBulkItemProgress', payload => {
      void this.dispatch({
        kind: 'item-progress',
        taskId: payload.taskId,
        itemIndex: payload.itemIndex
      }).catch(error => {
        logger.error('[BulkScheduler] 处理工作页进展回报失败:', error)
      })
    })

    const onAlarm = (alarm: chrome.alarms.Alarm): void => {
      if (alarm.name === BULK_SCAN_ALARM) {
        void this.tick()
      }
    }
    chrome.alarms.onAlarm.addListener(onAlarm)
    this.unsubscribeAlarms = () => chrome.alarms.onAlarm.removeListener(onAlarm)

    const onRemoved = (tabId: number): void => {
      void this.handleTabRemoved(tabId)
    }
    chrome.tabs.onRemoved.addListener(onRemoved)
    this.unsubscribeTabsRemoved = () => chrome.tabs.onRemoved.removeListener(onRemoved)

    // 恢复扫描：补齐丢失的启动 / 归一半程状态 / 浏览器重启后继续收尾
    void this.tick()
    logger.info('[BulkScheduler] 批量任务调度器已注册')
  }

  destroy(): void {
    this.unsubscribeItemDone?.()
    this.unsubscribeItemProgress?.()
    this.unsubscribeAlarms?.()
    this.unsubscribeTabsRemoved?.()
    this.unsubscribeItemDone = null
    this.unsubscribeItemProgress = null
    this.unsubscribeAlarms = null
    this.unsubscribeTabsRemoved = null
    this.subscriber.destroy()
  }

  /** 读取当前状态（dashboard 渲染入口）。 */
  async getState(): Promise<BulkState> {
    return (await bulkStateStore.load()) ?? emptyBulkState()
  }

  /** 创建任务（dashboard RPC）。配额前置校验不满足时拒绝，不落状态。 */
  async createTask(params: BulkCreateTaskParams): Promise<BulkCommandResult> {
    const quota = await this.checkQuota(
      params.type,
      params.values.length,
      params.reviewsPerStoreLimit
    )
    if (quota !== null) {
      return quota
    }
    const result = await this.dispatch({
      kind: 'create-task',
      name: params.name,
      type: params.type,
      values: params.values,
      reviewsPerStoreLimit: params.reviewsPerStoreLimit
    })
    return toCommandResult(result)
  }

  /** 启动/续跑任务（dashboard RPC；互斥由状态机裁决）。 */
  async startTask(taskId: string): Promise<BulkCommandResult> {
    const state = await this.getState()
    const task = state.tasks.find(candidate => candidate.id === taskId)
    if (task !== undefined) {
      // 预估按「即将处理的条目」（pending = 首启；paused 续跑 = 剩余）。
      const pendingCount = task.items.filter(item => item.status === 'pending').length
      const quota = await this.checkQuota(task.type, pendingCount, task.reviewsPerStoreLimit)
      if (quota !== null) {
        return quota
      }
    }
    return toCommandResult(await this.dispatch({ kind: 'start-task', taskId }))
  }

  /**
   * 配额前置校验（U5 遗留补口）：预估消耗（条目数 × 单批上限）超过剩余额度
   * 时拒绝并返回 quota-exceeded。usage 不可得（服务端/网络故障）时放行——
   * 容错轴「局部可失败」，采集可用性优先。
   */
  private async checkQuota(
    type: BulkCreateTaskParams['type'],
    itemCount: number,
    reviewsPerStoreLimit: number | null
  ): Promise<BulkCommandResult | null> {
    if (itemCount <= 0) {
      return null
    }
    const snapshot = await mapsUsageService.getSnapshot(false)
    if (snapshot === null) {
      return null
    }
    const { estimate, exceeded } = checkBulkQuota(
      snapshot,
      estimateBulkRecords(
        itemCount,
        type,
        reviewsPerStoreLimit,
        DEFAULT_MAPS_CONFIG.scrape.freeExportRowLimit
      )
    )
    if (!exceeded) {
      return null
    }
    const state = await this.getState()
    logger.info(
      `[BulkScheduler] 配额不足拒绝: type=${type}, items=${String(itemCount)}, ` +
        `estimate=${String(estimate)}, used=${String(snapshot.used)}/${String(snapshot.total)}`
    )
    return { ok: false, code: 'quota-exceeded', state }
  }

  /** 停止任务（dashboard RPC）：关工作页、状态转 paused。 */
  async stopTask(taskId: string): Promise<BulkCommandResult> {
    return toCommandResult(await this.dispatch({ kind: 'stop-task', taskId }))
  }

  /** 删除任务（dashboard RPC）：运行中先关工作页。 */
  async deleteTask(taskId: string): Promise<BulkCommandResult> {
    return toCommandResult(await this.dispatch({ kind: 'delete-task', taskId }))
  }

  /** alarm 兜底扫描入口。 */
  private async tick(): Promise<void> {
    const stuckMaxRetry = await readStuckMaxRetry()
    try {
      await this.dispatch({ kind: 'scan-tick', stuckMaxRetry })
    } catch (error) {
      logger.error('[BulkScheduler] 兜底扫描失败:', error)
    }
  }

  /** 工作页被关闭：立即走重试/跳过（消费 stuckMaxRetry 设置）。 */
  private async handleTabRemoved(tabId: number): Promise<void> {
    const stuckMaxRetry = await readStuckMaxRetry()
    try {
      await this.dispatch({ kind: 'tab-gone', tabId, stuckMaxRetry })
    } catch (error) {
      logger.error('[BulkScheduler] 处理标签页关闭事件失败:', error)
    }
  }

  /** 串行化步进：返回 reducer 结果（含拒绝码）；副作用在落盘后执行。 */
  private dispatch(event: BulkMachineEvent): Promise<BulkReduceResult> {
    const run = this.queue.then(() => this.process(event))
    this.queue = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  /** 单步：读状态 → reduce → 落盘 → 执行副作用。 */
  private async process(event: BulkMachineEvent): Promise<BulkReduceResult> {
    const state = await this.getState()
    const result = reduceBulkEvent(state, event, Date.now())

    if (result.error !== null) {
      logger.info(`[BulkScheduler] 事件被拒绝: kind=${event.kind}, code=${result.error}`)
      return result
    }
    if (result.state === state) {
      return result
    }

    await bulkStateStore.save(result.state)
    await this.applyEffects(result.effects)
    return result
  }

  /** 执行副作用：关页 → 开新工作页 → alarm 开关 → 广播（顺序即依赖序）。 */
  private async applyEffects(effects: BulkReduceResult['effects']): Promise<void> {
    for (const tabId of effects.closeTabIds) {
      try {
        await chrome.tabs.remove(tabId)
      } catch (error) {
        // 页可能已被用户关掉：忽略（失败不静默）
        logger.error(`[BulkScheduler] 关闭工作页失败: tabId=${tabId}`, error)
      }
    }

    for (const launch of effects.launches) {
      try {
        const tab = await chrome.tabs.create({ url: buildLauncherUrl(launch.url), active: true })
        if (tab.id !== undefined) {
          void this.dispatch({
            kind: 'item-launched',
            taskId: launch.taskId,
            itemIndex: launch.itemIndex,
            tabId: tab.id
          })
        }
      } catch (error) {
        // 创建失败极罕见（浏览器退出中）：activeTabId 保持 null，alarm 兜底重启
        logger.error(`[BulkScheduler] 打开工作页失败: url=${launch.url}`, error)
      }
    }

    if (effects.scanAlarm === 'on') {
      await chrome.alarms.create(BULK_SCAN_ALARM, { periodInMinutes: SCAN_ALARM_PERIOD_MIN })
    } else if (effects.scanAlarm === 'off') {
      await chrome.alarms.clear(BULK_SCAN_ALARM)
    }

    await this.broadcaster.broadcast('mapsBulkStateChanged', { taskId: null })
  }
}

/** 导出控制器单例：background/index 装配监听，RPC router 调用命令方法。 */
export const bulkScheduler = new BulkSchedulerController()

/**
 * 经启动中转页打开工作页：SW tabs.create 的主框架导航在 Playwright 环境
 * 绕过 route（上游限制，e2e 零外网依赖拦截），因此先开扩展中转页，由渲染
 * 进程 location.replace 跳到真实工作页（渲染进程发起的导航可被正常拦截）。
 * 生产语义不变：中转页只是一瞬的扩展页闪现。见 src/bulk-launch/main.ts。
 */
function buildLauncherUrl(workUrl: string): string {
  return `${chrome.runtime.getURL('src/bulk-launch.html')}?url=${encodeURIComponent(workUrl)}`
}

/** 从用户设置读卡死重试次数（U6 的 stuckMaxRetry，默认 1）。 */
async function readStuckMaxRetry(): Promise<number> {
  try {
    const settings = await MapsUserSettingsManager.getSettings()
    return settings.stuckMaxRetry
  } catch (error) {
    logger.error('[BulkScheduler] 读取 stuckMaxRetry 失败，按默认值 1 处理:', error)
    return 1
  }
}

/** reducer 结果 → RPC 命令结果。 */
function toCommandResult(result: BulkReduceResult): BulkCommandResult {
  return { ok: result.error === null, code: result.error, state: result.state }
}
