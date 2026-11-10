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
 * 交错；副作用在落盘之后执行，未登记的中转页由下次 alarm 补启动。
 *
 * 工作页以 `active: true` 打开：批处理是串行单页推进，活动标签页不触发后台
 * 计时器节流（竞品用双页轮换对抗节流，我们以单活动页获得同样效果）。
 */

import { checkPluginVersion } from '@/core/api/plugin-version/api'
import { canStartWithPluginVersion } from '@/core/api/plugin-version/types'
import { logger } from '@/core/utils/logger'
import { ChromeEventEmitter, ChromeEventSubscriber } from '@/core/rpc/ChromeEventBus'
import type {
  BulkQuotaBlockedPayload,
  ExtensionEvents,
  MapsUsageReportPayload
} from '@/core/events/types'
import { STORAGE_KEYS } from '@/core/api/config'
import { MapsUserSettingsManager } from '@/sites/maps/settings/userSettings'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { mapsUsageService } from '@/sites/maps/usage/usageService'
import { markApi } from '@/core/api/mark'
import { MARK_TYPE } from '@/core/api/mark/types'
import { clearPhotosWorkIntent } from '../photosWorkPage'
import { checkBulkQuota, estimateBulkRecords } from './quota'
import { bulkStateStore, emptyBulkState } from './store'
import { buildWorkUrlForItem, isBulkWorkOwner, reduceBulkEvent } from './machine'
import { readBulkWorkParams } from '@/sites/maps/content/bulkAuto'
import { BULK_TASK_PAGE_SIZE } from './types'
import { closeBulkWorkPage } from './workPage'
import type {
  BulkCommandResult,
  BulkCreateTaskParams,
  BulkCreateTaskResult,
  BulkMachineEvent,
  BulkReduceResult,
  BulkState,
  BulkTask,
  BulkTaskDetail,
  BulkTaskPage,
  BulkTaskPageQuery,
  BulkTaskSummary
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

  private sessionReady: Promise<void> | null = null

  /** 已注册的 chrome 监听清理函数。 */
  private unsubscribeAlarms: (() => void) | null = null

  private unsubscribeTabsRemoved: (() => void) | null = null

  private unsubscribeItemDone: (() => void) | null = null

  private unsubscribeItemProgress: (() => void) | null = null

  private unsubscribeQuotaBlocked: (() => void) | null = null

  private unsubscribeUsage: (() => void) | null = null

  /** 注册全部监听并做一次恢复扫描（SW 冷启动/浏览器重启后的收尾入口）。 */
  setup(): void {
    if (this.unsubscribeAlarms !== null) {
      return
    }

    this.unsubscribeItemDone = this.subscriber.on('mapsBulkItemDone', (payload, sender) => {
      const tabId = bulkWorkSenderTabId(sender)
      if (tabId === null) return
      void this.dispatch({
        kind: 'item-done',
        taskId: payload.taskId,
        itemIndex: payload.itemIndex,
        collected: payload.collected,
        tabId
      }).catch(error => {
        logger.error('[BulkScheduler] 处理工作页完成回报失败:', error)
      })
    })

    // 进展回报：每页/每批新数据重置卡死时钟（慢而有进展不被误杀）
    this.unsubscribeItemProgress = this.subscriber.on('mapsBulkItemProgress', (payload, sender) => {
      const tabId = bulkWorkSenderTabId(sender)
      if (tabId === null) return
      void this.dispatch({
        kind: 'item-progress',
        taskId: payload.taskId,
        itemIndex: payload.itemIndex,
        tabId
      }).catch(error => {
        logger.error('[BulkScheduler] 处理工作页进展回报失败:', error)
      })
    })

    this.unsubscribeQuotaBlocked = this.subscriber.on('mapsBulkQuotaBlocked', (payload, sender) => {
      void this.pauseQuotaBlocked(payload, sender).catch(error => {
        logger.error(
          `[BulkScheduler] 额度耗尽自动暂停失败: task=${payload.taskId}, item=${payload.itemIndex}`,
          error
        )
      })
    })

    this.unsubscribeUsage = this.subscriber.on('mapsUsageReport', (payload, sender) => {
      if (payload.bulk === undefined) return
      const tabId = bulkWorkSenderTabId(sender)
      if (tabId === null) return
      void this.reportBulkUsage(payload, tabId).catch(error => {
        logger.error('[BulkScheduler] 核验批量用量 owner 失败:', error)
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
      clearPhotosWorkIntent(tabId)
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
    this.unsubscribeQuotaBlocked?.()
    this.unsubscribeUsage?.()
    this.unsubscribeAlarms?.()
    this.unsubscribeTabsRemoved?.()
    this.unsubscribeItemDone = null
    this.unsubscribeItemProgress = null
    this.unsubscribeQuotaBlocked = null
    this.unsubscribeUsage = null
    this.unsubscribeAlarms = null
    this.unsubscribeTabsRemoved = null
    this.subscriber.destroy()
  }

  private async getState(): Promise<BulkState> {
    await (this.sessionReady ??= this.initializeSession().catch(error => {
      this.sessionReady = null
      throw error
    }))
    return (await bulkStateStore.load()) ?? emptyBulkState()
  }

  private async initializeSession(): Promise<void> {
    const session = await chrome.storage.session.get(STORAGE_KEYS.BULK_SESSION_READY)
    if (session[STORAGE_KEYS.BULK_SESSION_READY] === true) return

    const state = (await bulkStateStore.load()) ?? emptyBulkState()
    // tabId 只在浏览器会话内唯一；先落盘解除旧 owner，再发布会话就绪标记。
    if (state.tasks.some(task => task.activeTabId !== null)) {
      await bulkStateStore.save({
        ...state,
        tasks: state.tasks.map(task => ({ ...task, activeTabId: null }))
      })
    }
    await chrome.storage.session.set({ [STORAGE_KEYS.BULK_SESSION_READY]: true })
  }

  async getTaskPage(query: BulkTaskPageQuery): Promise<BulkTaskPage> {
    const state = await this.getState()
    const tasks = state.tasks.filter(task => task.type === query.type).reverse()
    const page = Math.min(query.page, Math.max(1, Math.ceil(tasks.length / BULK_TASK_PAGE_SIZE)))
    const runningTask = state.tasks.find(task => task.status === 'running')
    return {
      tasks: tasks
        .slice((page - 1) * BULK_TASK_PAGE_SIZE, page * BULK_TASK_PAGE_SIZE)
        .map(summarizeTask),
      total: tasks.length,
      totalTasks: state.tasks.length,
      page,
      runningTask: runningTask ? summarizeTask(runningTask) : null
    }
  }

  async getTask(taskId: string): Promise<BulkTaskDetail | null> {
    const state = await this.getState()
    const task = state.tasks.find(candidate => candidate.id === taskId)
    return task ? { ...summarizeTask(task), items: task.items, cursor: task.cursor } : null
  }

  /** 创建任务（dashboard RPC）。配额前置校验不满足时拒绝，不落状态。 */
  async createTask(params: BulkCreateTaskParams): Promise<BulkCreateTaskResult> {
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
    return result.error === null
      ? { ok: true, code: null, taskId: result.state.tasks[result.state.tasks.length - 1]!.id }
      : { ok: false, code: result.error }
  }

  /** 启动/续跑任务（dashboard RPC；互斥由状态机裁决）。 */
  async startTask(taskId: string): Promise<BulkCommandResult> {
    const state = await this.getState()
    const task = state.tasks.find(candidate => candidate.id === taskId)
    if (task !== undefined) {
      // 完成后重跑会清零全部条目；首次启动和续跑只检查剩余项。
      const pendingCount =
        task.status === 'completed'
          ? task.items.length
          : task.items.filter(item => item.status === 'pending').length
      const quota = await this.checkQuota(task.type, pendingCount, task.reviewsPerStoreLimit)
      if (quota !== null) {
        return quota
      }
    }
    return toCommandResult(await this.dispatch({ kind: 'start-task', taskId }))
  }

  /** 中转页先登记 owner 并落盘，获准后才可导航采集。 */
  async authorizeWorkPage(workUrl: string, tabId: number): Promise<boolean> {
    const params = readBulkWorkParams(new URL(workUrl))
    if (params === null) {
      return false
    }
    const state = await this.getState()
    const task = state.tasks.find(candidate => candidate.id === params.taskId)
    if (!task || buildWorkUrlForItem(task, params.itemIndex) !== workUrl) {
      return false
    }
    const result = await this.dispatch({
      kind: 'item-launched',
      taskId: params.taskId,
      itemIndex: params.itemIndex,
      tabId
    })
    const registered = result.state.tasks.find(candidate => candidate.id === params.taskId)
    return (
      registered?.status === 'running' &&
      registered.cursor === params.itemIndex &&
      registered.items[params.itemIndex]?.status === 'running' &&
      registered.activeTabId === tabId
    )
  }

  async checkWorkPageOwner(taskId: string, itemIndex: number, tabId: number): Promise<boolean> {
    return this.enqueue(async () =>
      isBulkWorkOwner(await this.getState(), taskId, itemIndex, tabId)
    )
  }

  private pauseQuotaBlocked(
    payload: BulkQuotaBlockedPayload,
    sender: chrome.runtime.MessageSender
  ): Promise<void> {
    return this.enqueue(async () => {
      const tabId = bulkWorkSenderTabId(sender)
      if (tabId === null) return
      const state = await this.getState()
      if (!isBulkWorkOwner(state, payload.taskId, payload.itemIndex, tabId)) return
      // owner 核验和停止必须同队列执行，避免旧页事件暂停已续跑的条目。
      await this.process({ kind: 'stop-task', taskId: payload.taskId })
    })
  }

  private reportBulkUsage(payload: MapsUsageReportPayload, tabId: number): Promise<void> {
    return this.enqueue(async () => {
      const bulk = payload.bulk
      const state = await this.getState()
      if (bulk && isBulkWorkOwner(state, bulk.taskId, bulk.itemIndex, tabId)) {
        // 与 done 同队列接纳用量；HTTP 不阻塞下一条目的调度。
        void mapsUsageService.handleReport(payload)
      }
    })
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
  ): Promise<{ ok: false; code: 'quota-exceeded' } | null> {
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
    logger.info(
      `[BulkScheduler] 配额不足拒绝: type=${type}, items=${String(itemCount)}, ` +
        `estimate=${String(estimate)}, used=${String(snapshot.used)}/${String(snapshot.total)}`
    )
    return { ok: false, code: 'quota-exceeded' }
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
    return this.enqueue(() => this.process(event))
  }

  private enqueue<T>(action: () => Promise<T>): Promise<T> {
    const run = this.queue.then(action)
    this.queue = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  /** 单步：读状态 → reduce → 落盘 → 执行副作用。 */
  private async process(event: BulkMachineEvent): Promise<BulkReduceResult> {
    const state = await this.getState()
    let result = reduceBulkEvent(state, event, Date.now())

    if (result.error !== null) {
      logger.info(`[BulkScheduler] 事件被拒绝: kind=${event.kind}, code=${result.error}`)
      return result
    }
    if (result.state === state) {
      return result
    }

    if (result.effects.launches.length > 0) {
      const version = await checkPluginVersion()
      if (!canStartWithPluginVersion(version)) {
        // 完成边沿仍落盘；尚未实际启动的下一项退回 pending，暂停后 alarm 不再重开。
        const launching = result.state.tasks.find(task => task.status === 'running')
        if (launching) {
          const paused = reduceBulkEvent(
            result.state,
            { kind: 'stop-task', taskId: launching.id },
            Date.now()
          )
          result = {
            state: paused.state,
            effects: {
              ...paused.effects,
              closeTabs: [...result.effects.closeTabs, ...paused.effects.closeTabs]
            },
            error: version === null ? 'version-check-failed' : 'plugin-disabled'
          }
        }
      }
    }

    await bulkStateStore.save(result.state)
    this.recordFinishedTasks(state, result.state)
    await this.applyEffects(result.effects)
    return result
  }

  /**
   * 批量任务进入终态时打点。
   *
   * 在状态机之外做边沿检测：reducer 是纯函数，把打点塞进去会污染可测试性；
   * 这里对比前后快照即可拿到「本次是谁完成了」，且天然覆盖所有触发路径
   * （工作页回报、alarm 兜底、标签页关闭）。
   */
  private recordFinishedTasks(previous: BulkState, next: BulkState): void {
    const before = new Map(previous.tasks.map(task => [task.id, task.status]))
    for (const task of next.tasks) {
      if (before.get(task.id) === undefined || before.get(task.id) === 'completed') {
        continue
      }
      if (task.status !== 'completed') {
        continue
      }
      const done = task.items.filter(item => item.status === 'complete').length
      const total = task.items.length
      const durationMs = task.createdAt > 0 ? Date.now() - task.createdAt : 0
      markApi
        .record(
          MARK_TYPE.BULK_TASK_FINISH,
          `type=${task.type}, done=${done}, total=${total}, ` +
            `failed=${total - done}, duration_ms=${durationMs}`,
          { surface: 'background' }
        )
        .catch(error => logger.error('[BulkScheduler] bulk_task_finish 打点失败:', error))
    }
  }

  /** 执行副作用：关页 → 开中转页 → alarm 开关 → 广播（顺序即依赖序）。 */
  private async applyEffects(effects: BulkReduceResult['effects']): Promise<void> {
    for (const work of effects.closeTabs) {
      await closeBulkWorkPage(work)
    }

    for (const launch of effects.launches) {
      try {
        await chrome.tabs.create({ url: buildLauncherUrl(launch.url), active: true })
      } catch (error) {
        // 未登记的中转页不能采集；创建或许可失败由 alarm 补启动。
        logger.error(`[BulkScheduler] 打开工作页失败: url=${launch.url}`, error)
      }
    }

    if (effects.scanAlarm === 'on') {
      await chrome.alarms.create(BULK_SCAN_ALARM, { periodInMinutes: SCAN_ALARM_PERIOD_MIN })
    } else if (effects.scanAlarm === 'off') {
      await chrome.alarms.clear(BULK_SCAN_ALARM)
    }

    this.broadcaster.emit('mapsBulkStateChanged', { taskId: null })
  }
}

/** 导出控制器单例：background/index 装配监听，RPC router 调用命令方法。 */
export const bulkScheduler = new BulkSchedulerController()

function bulkWorkSenderTabId(sender: chrome.runtime.MessageSender): number | null {
  const tabId = sender.tab?.id
  if (
    sender.id !== chrome.runtime.id ||
    (sender.frameId !== undefined && sender.frameId !== 0) ||
    tabId === undefined ||
    !Number.isInteger(tabId) ||
    tabId < 0 ||
    !sender.url ||
    !URL.canParse(sender.url)
  ) {
    return null
  }
  const source = new URL(sender.url)
  return source.origin === 'https://www.google.com' && source.pathname.startsWith('/maps')
    ? tabId
    : null
}

/**
 * 中转页必须先获得 owner 落盘许可，避免创建回执丢失后两页同时采集。
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
  return { ok: result.error === null, code: result.error }
}

function summarizeTask(task: BulkTask): BulkTaskSummary {
  const stats = { done: 0, complete: 0, skipped: 0, stuck: 0, invalid: 0, tries: 0, records: 0 }
  for (const item of task.items) {
    stats.tries += item.tries
    if (item.status === 'complete') {
      stats.complete++
      stats.records += item.collected
    }
    if (item.status === 'skipped') stats.skipped++
    if (item.skipReason === 'stuck') stats.stuck++
    if (item.skipReason === 'invalid-url') stats.invalid++
  }
  stats.done = stats.complete + stats.skipped
  return {
    id: task.id,
    name: task.name,
    type: task.type,
    status: task.status,
    createdAt: task.createdAt,
    reviewsPerStoreLimit: task.reviewsPerStoreLimit,
    itemCount: task.items.length,
    stats
  }
}
