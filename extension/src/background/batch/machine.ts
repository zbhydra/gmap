/**
 * 批量任务步进状态机（013 A6，纯 reducer）。
 *
 * 输入 (state, event, now) → (state', effects, error)：不碰 chrome API、
 * 不碰时钟（now 由调用方注入），SW 被任意事件唤醒后由 controller 读持久化
 * 状态、跑一步、落盘、执行副作用。单测以确定时间注入覆盖步进/持久化恢复/
 * 卡死跳过/互斥全部行为。
 *
 * 关键规则：
 * - 互斥：全局至多一个 running 任务（竞品同构），start 被拒返回 mutex；
 * - 卡死：条目启动后 90s（BULK_LIMITS.stuckMs）无完成回报 → tries 尚未
 *   耗尽（tries < stuckMaxRetry + 1）则关旧页重跑同一关键词，否则永久跳过
 *   （竞品 `try ≥ max_retry+1 → skip` 语义）；
 * - 恢复：alarm 扫描补齐丢失的启动（条目 pending / activeTabId 丢失 → 重新
 *   打开工作页），标签页被关走 tab-gone 立即重试或跳过；
 * - 状态引用不变 = 无变化，controller 跳过落盘。
 */

import {
  BULK_LIMITS,
  type BulkEffects,
  type BulkErrorCode,
  type BulkMachineEvent,
  type BulkReduceResult,
  type BulkState,
  type BulkTask,
  type BulkTaskItem,
  type BulkTaskType
} from './types'
import { buildKeywordWorkUrl, buildReviewWorkUrl } from './workUrl'

/** 空副作用。 */
function emptyEffects(): BulkEffects {
  return { launches: [], closeTabIds: [], scanAlarm: 'keep' }
}

/** 深拷贝任务（items 逐项浅拷贝，避免步进污染持久化快照）。 */
function cloneTask(task: BulkTask): BulkTask {
  return { ...task, items: task.items.map(item => ({ ...item })) }
}

/** 用新任务替换状态中的同名任务（其余任务引用保持共享）。 */
function withTask(state: BulkState, task: BulkTask): BulkState {
  return { ...state, tasks: state.tasks.map(other => (other.id === task.id ? task : other)) }
}

/** 把任务重置回全新队列（Start on completed 的重跑语义）。 */
function resetItems(task: BulkTask): void {
  for (const item of task.items) {
    item.status = 'pending'
    item.tries = 0
    item.collected = 0
    item.skipReason = null
  }
  task.cursor = 0
}

/** 全局是否存在 running 任务。 */
function hasRunningTask(state: BulkState): boolean {
  return state.tasks.some(task => task.status === 'running')
}

/** alarm 开关结论：有 running 任务则保持告警存在，否则清除。 */
function scanAlarmFor(state: BulkState): 'on' | 'off' {
  return hasRunningTask(state) ? 'on' : 'off'
}

/**
 * 启动单个条目：置 running、tries+1、记录启动时间（tab id 待 item-launched
 * 回填；丢失由 alarm 兜底重启）。
 */
function launchItem(task: BulkTask, itemIndex: number, now: number): void {
  const item = task.items[itemIndex]
  if (!item) {
    return
  }
  item.status = 'running'
  item.tries += 1
  task.cursor = itemIndex
  task.activeStartedAt = now
  task.activeTabId = null
}

/**
 * 从 fromIndex 起找到下一个可启动条目并启动；评论 URL 换算失败的条目沿途
 * 标记 invalid-url 跳过（级联跳过发生在同一步内，不产生多次落盘）。
 * 无可启动条目 → 任务完成。返回是否启动了条目。
 */
function launchFrom(task: BulkTask, fromIndex: number, now: number, effects: BulkEffects): boolean {
  for (let index = Math.max(fromIndex, 0); index < task.items.length; index += 1) {
    const item = task.items[index]
    if (!item || item.status !== 'pending') {
      continue
    }

    let url: string | null = null
    if (task.type === 'keywords') {
      url = buildKeywordWorkUrl(item.value, task.id, index)
    } else {
      url = buildReviewWorkUrl(
        item.value,
        task.id,
        index,
        task.reviewsPerStoreLimit ?? BULK_LIMITS.defaultReviewsPerStoreLimit
      )
      if (url === null) {
        item.status = 'skipped'
        item.skipReason = 'invalid-url'
        continue
      }
    }

    launchItem(task, index, now)
    effects.launches.push({ taskId: task.id, itemIndex: index, url })
    return true
  }

  task.status = 'completed'
  task.cursor = task.items.length
  task.activeStartedAt = null
  task.activeTabId = null
  return false
}

/**
 * 工作页中断处理（卡死超时 / 标签页被关）：重试次数耗尽（tries ≥
 * stuckMaxRetry + 1）则跳过并前进，否则关旧页重跑当前条目。
 */
function handleInterrupt(
  task: BulkTask,
  now: number,
  stuckMaxRetry: number,
  effects: BulkEffects
): void {
  const item = task.items[task.cursor]
  if (!item || item.status !== 'running') {
    return
  }

  if (task.activeTabId !== null) {
    effects.closeTabIds.push(task.activeTabId)
  }

  if (item.tries >= stuckMaxRetry + 1) {
    item.status = 'skipped'
    item.skipReason = 'stuck'
    task.activeTabId = null
    task.activeStartedAt = null
    launchFrom(task, task.cursor + 1, now, effects)
    return
  }

  // 重跑同一条目：重置为可启动态再启动（tries 保留累计次数）
  item.status = 'pending'
  launchFrom(task, task.cursor, now, effects)
}

/** 状态机入口：见模块注释。 */
export function reduceBulkEvent(
  state: BulkState,
  event: BulkMachineEvent,
  now: number
): BulkReduceResult {
  const effects = emptyEffects()
  const rejected = (error: BulkErrorCode): BulkReduceResult => ({ state, effects, error })

  switch (event.kind) {
    case 'create-task': {
      if (event.type !== 'keywords' && event.type !== 'review-urls') {
        return rejected('invalid-param')
      }
      const values = event.values.map(value => value.trim()).filter(value => value.length > 0)
      if (values.length === 0) {
        return rejected('empty-input')
      }
      if (values.length > BULK_LIMITS.maxItemsPerTask) {
        return rejected('limit-items')
      }
      if (state.tasks.length >= BULK_LIMITS.maxTasks) {
        return rejected('limit-tasks')
      }
      if (event.type === 'review-urls') {
        const limit = event.reviewsPerStoreLimit
        if (limit === null || !Number.isInteger(limit) || limit < 1) {
          return rejected('invalid-param')
        }
      }

      const items: BulkTaskItem[] = values.map(value => ({
        value,
        status: 'pending',
        tries: 0,
        collected: 0,
        skipReason: null
      }))
      const task: BulkTask = {
        // 名字原样存储（trim 后透传）；空名时的默认名由 dashboard 填充
        // （i18n 文案不进 reducer，保持纯函数）
        id: crypto.randomUUID(),
        name: event.name.trim(),
        type: event.type,
        status: 'idle',
        createdAt: now,
        reviewsPerStoreLimit:
          event.type === 'review-urls' ? (event.reviewsPerStoreLimit ?? null) : null,
        items,
        cursor: 0,
        activeTabId: null,
        activeStartedAt: null
      }
      const next: BulkState = { ...state, tasks: [...state.tasks, task] }
      return { state: next, effects, error: null }
    }

    case 'start-task': {
      const task = state.tasks.find(candidate => candidate.id === event.taskId)
      if (!task) {
        return rejected('not-found')
      }
      const othersRunning = state.tasks.some(
        candidate => candidate.status === 'running' && candidate.id !== task.id
      )
      if (othersRunning) {
        return rejected('mutex')
      }

      const nextTask = cloneTask(task)
      // Start on completed = 清零重跑；idle/paused = 从游标续跑
      if (nextTask.status === 'completed') {
        resetItems(nextTask)
      }
      nextTask.status = 'running'
      launchFrom(nextTask, nextTask.cursor, now, effects)
      const next = withTask(state, nextTask)
      effects.scanAlarm = scanAlarmFor(next)
      return { state: next, effects, error: null }
    }

    case 'stop-task': {
      const task = state.tasks.find(candidate => candidate.id === event.taskId)
      if (!task) {
        return rejected('not-found')
      }
      if (task.status !== 'running') {
        return { state, effects, error: null }
      }

      const nextTask = cloneTask(task)
      if (nextTask.activeTabId !== null) {
        effects.closeTabIds.push(nextTask.activeTabId)
      }
      const current = nextTask.items[nextTask.cursor]
      if (current && current.status === 'running') {
        current.status = 'pending'
      }
      nextTask.status = 'paused'
      nextTask.activeTabId = null
      nextTask.activeStartedAt = null
      const next = withTask(state, nextTask)
      effects.scanAlarm = scanAlarmFor(next)
      return { state: next, effects, error: null }
    }

    case 'delete-task': {
      const task = state.tasks.find(candidate => candidate.id === event.taskId)
      if (!task) {
        return rejected('not-found')
      }
      if (task.status === 'running' && task.activeTabId !== null) {
        effects.closeTabIds.push(task.activeTabId)
      }
      const next: BulkState = { ...state, tasks: state.tasks.filter(other => other.id !== task.id) }
      effects.scanAlarm = scanAlarmFor(next)
      return { state: next, effects, error: null }
    }

    case 'item-launched': {
      const task = state.tasks.find(candidate => candidate.id === event.taskId)
      const item = task?.items[event.itemIndex]
      if (
        !task ||
        task.status !== 'running' ||
        !item ||
        task.cursor !== event.itemIndex ||
        item.status !== 'running' ||
        task.activeTabId !== null
      ) {
        // 陈旧回报（游标已前进 / 重复启动回执）：忽略
        return { state, effects, error: null }
      }
      const nextTask = cloneTask(task)
      nextTask.activeTabId = event.tabId
      return { state: withTask(state, nextTask), effects, error: null }
    }

    case 'item-progress': {
      const task = state.tasks.find(candidate => candidate.id === event.taskId)
      const item = task?.items[event.itemIndex]
      if (
        !task ||
        task.status !== 'running' ||
        !item ||
        task.cursor !== event.itemIndex ||
        item.status !== 'running'
      ) {
        // 陈旧回报（重跑前的旧页 / 游标已前进）：忽略
        return { state, effects, error: null }
      }
      // 进展即重置卡死时钟（判定语义：自上次进展以来 90s）
      const nextTask = cloneTask(task)
      nextTask.activeStartedAt = now
      return { state: withTask(state, nextTask), effects, error: null }
    }

    case 'item-done': {
      const task = state.tasks.find(candidate => candidate.id === event.taskId)
      const item = task?.items[event.itemIndex]
      if (
        !task ||
        task.status !== 'running' ||
        !item ||
        task.cursor !== event.itemIndex ||
        item.status !== 'running'
      ) {
        // 陈旧回报（重跑后的旧页完成 / 游标已前进）：忽略
        return { state, effects, error: null }
      }

      const nextTask = cloneTask(task)
      const doneItem = nextTask.items[event.itemIndex]
      if (!doneItem) {
        return { state, effects, error: null }
      }
      doneItem.status = 'complete'
      doneItem.collected = Math.max(event.collected, 0)
      if (nextTask.activeTabId !== null) {
        effects.closeTabIds.push(nextTask.activeTabId)
      }
      nextTask.activeTabId = null
      nextTask.activeStartedAt = null
      launchFrom(nextTask, nextTask.cursor + 1, now, effects)
      const next = withTask(state, nextTask)
      effects.scanAlarm = scanAlarmFor(next)
      return { state: next, effects, error: null }
    }

    case 'tab-gone': {
      const task = state.tasks.find(
        candidate => candidate.status === 'running' && candidate.activeTabId === event.tabId
      )
      if (!task) {
        return { state, effects, error: null }
      }
      const nextTask = cloneTask(task)
      nextTask.activeTabId = null
      handleInterrupt(nextTask, now, event.stuckMaxRetry, effects)
      const next = withTask(state, nextTask)
      effects.scanAlarm = scanAlarmFor(next)
      return { state: next, effects, error: null }
    }

    case 'scan-tick': {
      let next = state
      for (const task of state.tasks) {
        if (task.status !== 'running') {
          continue
        }
        const nextTask = cloneTask(task)
        const item = nextTask.items[nextTask.cursor]

        if (!item || item.status === 'pending') {
          // 启动丢失（advance 与 tabs.create 之间 SW 被杀）：补一次启动
          if (nextTask.activeTabId !== null) {
            effects.closeTabIds.push(nextTask.activeTabId)
            nextTask.activeTabId = null
          }
          launchFrom(nextTask, nextTask.cursor, now, effects)
        } else if (item.status === 'running') {
          if (nextTask.activeTabId === null) {
            // 标签页创建回执丢失：重新打开（陈旧页的回报会被游标匹配丢弃）
            launchItem(nextTask, nextTask.cursor, now)
            const url = buildWorkUrlForItem(nextTask, nextTask.cursor)
            if (url !== null) {
              effects.launches.push({
                taskId: nextTask.id,
                itemIndex: nextTask.cursor,
                url
              })
            }
          } else if (
            nextTask.activeStartedAt !== null &&
            now - nextTask.activeStartedAt > BULK_LIMITS.stuckMs
          ) {
            handleInterrupt(nextTask, now, event.stuckMaxRetry, effects)
          } else if (nextTask.activeStartedAt === null) {
            // 半程状态归一（仅缺启动时间）：从现在起重新计卡死时钟
            nextTask.activeStartedAt = now
          }
        }

        next = withTask(next, nextTask)
      }
      effects.scanAlarm = scanAlarmFor(next)
      return { state: next, effects, error: null }
    }

    default: {
      return rejected('invalid-param')
    }
  }
}

/** 构造游标条目的工作页 URL（scan-tick 恢复路径专用；失败返回 null 忽略）。 */
function buildWorkUrlForItem(task: BulkTask, itemIndex: number): string | null {
  const item = task.items[itemIndex]
  if (!item) {
    return null
  }
  if (task.type === 'keywords') {
    return buildKeywordWorkUrl(item.value, task.id, itemIndex)
  }
  return buildReviewWorkUrl(
    item.value,
    task.id,
    itemIndex,
    task.reviewsPerStoreLimit ?? BULK_LIMITS.defaultReviewsPerStoreLimit
  )
}

/** 任务类型字面量联合（RPC 入参校验用）。 */
export function isBulkTaskType(value: unknown): value is BulkTaskType {
  return value === 'keywords' || value === 'review-urls'
}
