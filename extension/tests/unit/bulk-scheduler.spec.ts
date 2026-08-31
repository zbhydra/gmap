/**
 * 批量任务步进状态机单元测试（013 A6，U5 验收行为直接覆盖）。
 *
 * 覆盖面：状态机步进（创建/启动/完成推进/停止/删除）、互斥拒绝、卡死跳过
 * （重试次数消费 stuckMaxRetry）、持久化恢复（内存 store roundtrip +
 * alarm 兜底归一）、评论 URL 任务换算与无效条目跳过。
 *
 * 时间为确定注入（reduce 的 now 入参），无需 fake timers；存储用内存实现
 * （BulkStateStore 接口的测试替身），不需要真实 SW 与 IndexedDB。
 */

import { describe, expect, it } from 'vitest'

import {
  BULK_LIMITS,
  type BulkMachineEvent,
  type BulkState,
  type BulkTask
} from '../../src/background/batch/types'
import { reduceBulkEvent } from '../../src/background/batch/machine'
import {
  emptyBulkState,
  normalizeBulkState,
  type BulkStateStore
} from '../../src/background/batch/store'

/** 基准时间（ms）；卡死阈值 90s。 */
const T0 = 1_000_000

/** 关键词任务创建事件。 */
function createKeywords(name: string, values: string[]): BulkMachineEvent {
  return { kind: 'create-task', name, type: 'keywords', values, reviewsPerStoreLimit: null }
}

/** 归一化后的空状态。 */
function freshState(): BulkState {
  return emptyBulkState()
}

/** 创建任务并立即启动（仅一个任务时使用），返回启动后的状态。 */
function createAndStart(
  values: string[],
  type: 'keywords' | 'review-urls' = 'keywords',
  reviewsPerStoreLimit: number | null = null
): BulkState {
  const created = reduceBulkEvent(
    freshState(),
    { kind: 'create-task', name: 't', type, values, reviewsPerStoreLimit },
    T0
  )
  expect(created.error).toBeNull()
  const taskId = created.state.tasks[0]!.id
  const started = reduceBulkEvent(created.state, { kind: 'start-task', taskId }, T0 + 1000)
  expect(started.error).toBeNull()
  return started.state
}

/** 内存 store：save 时 JSON 序列化，模拟真实持久化边界。 */
class MemoryBulkStateStore implements BulkStateStore {
  private data: BulkState | null = null

  async load(): Promise<BulkState | null> {
    return this.data === null ? null : (JSON.parse(JSON.stringify(this.data)) as BulkState)
  }

  async save(state: BulkState): Promise<void> {
    this.data = JSON.parse(JSON.stringify(state)) as BulkState
  }
}

describe('状态机：创建任务', () => {
  it('创建关键词任务：裁剪空行、名字 trim 透传（默认名归 dashboard）、条目全部 pending', () => {
    const named = reduceBulkEvent(freshState(), createKeywords('  my task  ', ['a', '  ', 'b']), T0)
    expect(named.error).toBeNull()
    expect(named.state.tasks[0]?.name).toBe('my task')
    expect(named.state.tasks[0]?.type).toBe('keywords')
    expect(named.state.tasks[0]?.status).toBe('idle')
    expect(named.state.tasks[0]?.items.map(item => item.value)).toEqual(['a', 'b'])
    expect(
      named.state.tasks[0]?.items.every(item => item.status === 'pending' && item.tries === 0)
    ).toBe(true)

    // 空名原样存储：默认名由 dashboard 以 i18n 文案填充（reducer 不碰 i18n）
    const unnamed = reduceBulkEvent(freshState(), createKeywords('', ['a']), T0)
    expect(unnamed.state.tasks[0]?.name).toBe('')
  })

  it('空输入拒绝（empty-input）；超出 500 条拒绝（limit-items）', () => {
    const base = freshState()
    const empty = reduceBulkEvent(base, createKeywords('t', [' ', '']), T0)
    expect(empty.error).toBe('empty-input')
    // 拒绝时状态保持原引用不变（controller 跳过落盘）
    expect(empty.state).toBe(base)

    const tooMany = reduceBulkEvent(
      base,
      createKeywords('t', Array.from({ length: BULK_LIMITS.maxItemsPerTask + 1 }, (_, i) => `k${i}`)),
      T0
    )
    expect(tooMany.error).toBe('limit-items')
    expect(tooMany.state).toBe(base)
  })

  it('任务数达 150 上限拒绝（limit-tasks）', () => {
    let state = freshState()
    for (let i = 0; i < BULK_LIMITS.maxTasks; i += 1) {
      const result = reduceBulkEvent(state, createKeywords(`t${i}`, ['k']), T0 + i)
      expect(result.error).toBeNull()
      state = result.state
    }
    const overflow = reduceBulkEvent(state, createKeywords('overflow', ['k']), T0)
    expect(overflow.error).toBe('limit-tasks')
  })
})

describe('状态机：启动与互斥', () => {
  it('启动关键词任务：条目 running + 打开搜索工作页（批量参数 + 纽约锚点）', () => {
    const created = reduceBulkEvent(freshState(), createKeywords('kw task', ['coffee', 'tea']), T0)
    const task = created.state.tasks[0]
    expect(task).toBeDefined()

    const started = reduceBulkEvent(created.state, { kind: 'start-task', taskId: task!.id }, T0 + 1000)
    expect(started.error).toBeNull()
    const after = started.state.tasks[0]!
    expect(after.status).toBe('running')
    expect(after.cursor).toBe(0)
    expect(after.items[0]?.status).toBe('running')
    expect(after.items[0]?.tries).toBe(1)
    expect(after.activeStartedAt).toBe(T0 + 1000)

    expect(started.effects.launches).toHaveLength(1)
    const url = new URL(started.effects.launches[0]?.url ?? '')
    expect(url.hostname).toBe('www.google.com')
    expect(url.pathname).toBe('/maps/search/coffee/@40.7604552,-73.9858076,12z')
    expect(url.searchParams.get('gme_bulk')).toBe('1')
    expect(url.searchParams.get('gme_bulk_task')).toBe(task!.id)
    expect(url.searchParams.get('gme_bulk_item')).toBe('0')
    expect(started.effects.scanAlarm).toBe('on')
  })

  it('互斥：已有任务运行时启动第二个任务被拒（mutex），状态不变', () => {
    const created = reduceBulkEvent(freshState(), createKeywords('a', ['k1']), T0)
    const second = reduceBulkEvent(created.state, createKeywords('b', ['k2']), T0 + 1000)
    const started = reduceBulkEvent(
      second.state,
      { kind: 'start-task', taskId: second.state.tasks[0]!.id },
      T0 + 2000
    )
    expect(started.state.tasks[0]?.status).toBe('running')

    const rejected = reduceBulkEvent(
      started.state,
      { kind: 'start-task', taskId: started.state.tasks[1]!.id },
      T0 + 3000
    )
    expect(rejected.error).toBe('mutex')
    // 状态引用不变（controller 跳过落盘）
    expect(rejected.state).toBe(started.state)
  })

  it('首个任务完成后可启动第二个任务（互斥只限运行中）', () => {
    const first = reduceBulkEvent(freshState(), createKeywords('a', ['k1']), T0)
    const second = reduceBulkEvent(
      first.state,
      createKeywords('b', ['k2']),
      T0 + 1000
    )
    const startedFirst = reduceBulkEvent(
      second.state,
      { kind: 'start-task', taskId: second.state.tasks[0]!.id },
      T0 + 2000
    )

    // 完成第一个任务全部条目
    const done = reduceBulkEvent(
      startedFirst.state,
      { kind: 'item-done', taskId: startedFirst.state.tasks[0]!.id, itemIndex: 0, collected: 5 },
      T0 + 3000
    )

    const secondStart = reduceBulkEvent(
      done.state,
      { kind: 'start-task', taskId: done.state.tasks[1]!.id },
      T0 + 4000
    )
    expect(secondStart.error).toBeNull()
    expect(secondStart.state.tasks[1]?.status).toBe('running')
  })

  it('Start on completed：清零重跑', () => {
    const started = createAndStart(['k1'])
    const task = started.tasks[0]!
    const done = reduceBulkEvent(
      started,
      { kind: 'item-done', taskId: task.id, itemIndex: 0, collected: 3 },
      T0 + 2000
    )
    expect(done.state.tasks[0]?.status).toBe('completed')

    const restarted = reduceBulkEvent(done.state, { kind: 'start-task', taskId: task.id }, T0 + 3000)
    const rerun = restarted.state.tasks[0]!
    expect(rerun.status).toBe('running')
    expect(rerun.items[0]?.status).toBe('running')
    expect(rerun.items[0]?.tries).toBe(1)
    expect(rerun.items[0]?.collected).toBe(0)
  })
})

describe('状态机：完成推进', () => {
  function runningTwoItems(): { state: BulkState; task: BulkTask } {
    const state = createAndStart(['k1', 'k2', 'k3'])
    return { state, task: state.tasks[0]! }
  }

  it('条目完成 → 记账 → 关旧页 → 启动下一关键词', () => {
    const { state, task } = runningTwoItems()

    const launched = reduceBulkEvent(
      state,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 11 },
      T0 + 2000
    )
    expect(launched.state.tasks[0]?.activeTabId).toBe(11)

    const done = reduceBulkEvent(
      launched.state,
      { kind: 'item-done', taskId: task.id, itemIndex: 0, collected: 20 },
      T0 + 3000
    )
    const after = done.state.tasks[0]!
    expect(after.items[0]).toMatchObject({ status: 'complete', collected: 20 })
    expect(after.cursor).toBe(1)
    expect(after.items[1]?.status).toBe('running')
    expect(after.activeTabId).toBeNull()
    expect(done.effects.closeTabIds).toEqual([11])
    expect(done.effects.launches).toHaveLength(1)
    expect(done.effects.launches[0]?.itemIndex).toBe(1)
    expect(new URL(done.effects.launches[0]?.url ?? '').searchParams.get('gme_bulk_item')).toBe('1')
    expect(done.effects.scanAlarm).toBe('on')
  })

  it('最后一条完成 → 任务 completed + 关闭兜底 alarm', () => {
    const { state, task } = runningTwoItems()
    const step1 = reduceBulkEvent(
      state,
      { kind: 'item-done', taskId: task.id, itemIndex: 0, collected: 20 },
      T0 + 2000
    )
    const launched = reduceBulkEvent(
      step1.state,
      { kind: 'item-launched', taskId: task.id, itemIndex: 1, tabId: 12 },
      T0 + 2500
    )
    const step2 = reduceBulkEvent(
      launched.state,
      { kind: 'item-done', taskId: task.id, itemIndex: 1, collected: 8 },
      T0 + 3000
    )
    // tab 12 在 item1 完成时已关（step2）；item2 尚无 tab 回执
    expect(step2.effects.closeTabIds).toEqual([12])
    const step3 = reduceBulkEvent(
      step2.state,
      { kind: 'item-done', taskId: task.id, itemIndex: 2, collected: 0 },
      T0 + 4000
    )
    const after = step3.state.tasks[0]!
    expect(after.status).toBe('completed')
    expect(after.cursor).toBe(3)
    expect(step3.effects.closeTabIds).toEqual([])
    expect(step3.effects.scanAlarm).toBe('off')
  })

  it('陈旧回报（游标已前进 / 任务非运行中）被忽略', () => {
    const { state, task } = runningTwoItems()
    const stale = reduceBulkEvent(
      state,
      { kind: 'item-done', taskId: task.id, itemIndex: 1, collected: 99 },
      T0 + 2000
    )
    expect(stale.state).toBe(state)

    const stopped = reduceBulkEvent(state, { kind: 'stop-task', taskId: task.id }, T0 + 2000)
    const afterStop = reduceBulkEvent(
      stopped.state,
      { kind: 'item-done', taskId: task.id, itemIndex: 0, collected: 1 },
      T0 + 3000
    )
    expect(afterStop.state).toBe(stopped.state)
  })
})

describe('状态机：卡死跳过（消费 stuckMaxRetry）', () => {
  function runningOne(stuckMaxRetryIgnored = true): { state: BulkState; task: BulkTask } {
    void stuckMaxRetryIgnored
    const state = createAndStart(['k1', 'k2'])
    return { state, task: state.tasks[0]! }
  }

  it('90 秒内扫描不动作；超时后首次卡死关旧页重跑（tries=2）', () => {
    const { state, task } = runningOne()
    const launched = reduceBulkEvent(
      state,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 21 },
      T0 + 2000
    )

    // 89s：无动作
    const early = reduceBulkEvent(
      launched.state,
      { kind: 'scan-tick', stuckMaxRetry: 1 },
      T0 + 2000 + BULK_LIMITS.stuckMs - 1000
    )
    expect(early.state.tasks[0]?.cursor).toBe(0)
    expect(early.state.tasks[0]?.items[0]?.tries).toBe(1)
    expect(early.effects.launches).toHaveLength(0)

    // 91s：卡死 → 重试（默认 stuckMaxRetry=1 → 允许 2 次尝试）
    const stuck = reduceBulkEvent(
      launched.state,
      { kind: 'scan-tick', stuckMaxRetry: 1 },
      T0 + 2000 + BULK_LIMITS.stuckMs + 1000
    )
    const after = stuck.state.tasks[0]!
    expect(after.cursor).toBe(0)
    expect(after.items[0]).toMatchObject({ status: 'running', tries: 2 })
    expect(stuck.effects.closeTabIds).toEqual([21])
    expect(stuck.effects.launches).toHaveLength(1)
    expect(stuck.effects.launches[0]?.itemIndex).toBe(0)
    expect(after.activeStartedAt).toBe(T0 + 2000 + BULK_LIMITS.stuckMs + 1000)
  })

  it('重试耗尽（tries ≥ stuckMaxRetry+1）→ 永久跳过并前进', () => {
    const { state, task } = runningOne()
    const launched = reduceBulkEvent(
      state,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 21 },
      T0 + 2000
    )
    // 第一次卡死 → 重跑
    const retry = reduceBulkEvent(
      launched.state,
      { kind: 'scan-tick', stuckMaxRetry: 1 },
      T0 + 2000 + BULK_LIMITS.stuckMs + 1000
    )
    expect(retry.state.tasks[0]?.items[0]).toMatchObject({ status: 'running', tries: 2 })

    // 重跑的工作页回执（生产中 tabs.create 后立即回填）
    const relaunched = reduceBulkEvent(
      retry.state,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 23 },
      T0 + 2000 + BULK_LIMITS.stuckMs + 1500
    )

    // 第二次卡死（tries=2 ≥ 1+1）→ 跳过并启动 k2（距重跑启动 > 90s）
    const skip = reduceBulkEvent(
      relaunched.state,
      { kind: 'scan-tick', stuckMaxRetry: 1 },
      T0 + 2000 + 2 * BULK_LIMITS.stuckMs + 3000
    )
    const after = skip.state.tasks[0]!
    expect(after.items[0]).toMatchObject({ status: 'skipped', skipReason: 'stuck' })
    expect(after.items[1]?.status).toBe('running')
    expect(after.cursor).toBe(1)
    // 旧页 23 被关
    expect(skip.effects.closeTabIds).toEqual([23])
  })

  it('stuckMaxRetry=0：首次卡死直接跳过（重试次数为 0 的语义）', () => {
    const { state, task } = runningOne()
    const launched = reduceBulkEvent(
      state,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 22 },
      T0 + 2000
    )
    const skip = reduceBulkEvent(
      launched.state,
      { kind: 'scan-tick', stuckMaxRetry: 0 },
      T0 + 2000 + BULK_LIMITS.stuckMs + 1000
    )
    const after = skip.state.tasks[0]!
    expect(after.items[0]).toMatchObject({ status: 'skipped', skipReason: 'stuck' })
    expect(after.items[1]?.status).toBe('running')
  })

  it('工作页被用户关闭（tab-gone）：立即走重试/跳过路径', () => {
    const { state, task } = runningOne()
    const launched = reduceBulkEvent(
      state,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 31 },
      T0 + 2000
    )
    // tab-gone 立即触发重跑（不等 90s）
    const retry = reduceBulkEvent(
      launched.state,
      { kind: 'tab-gone', tabId: 31, stuckMaxRetry: 1 },
      T0 + 3000
    )
    expect(retry.state.tasks[0]?.items[0]).toMatchObject({ status: 'running', tries: 2 })
    expect(retry.effects.launches).toHaveLength(1)

    // 重跑后再次 tab-gone（tries=2 ≥ 2）→ 跳过
    const relaunched = reduceBulkEvent(
      retry.state,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 32 },
      T0 + 3500
    )
    const skip = reduceBulkEvent(
      relaunched.state,
      { kind: 'tab-gone', tabId: 32, stuckMaxRetry: 1 },
      T0 + 4000
    )
    expect(skip.state.tasks[0]?.items[0]).toMatchObject({ status: 'skipped', skipReason: 'stuck' })
    expect(skip.state.tasks[0]?.items[1]?.status).toBe('running')
  })

  it('无关标签页关闭不产生任何动作', () => {
    const { state } = runningOne()
    const gone = reduceBulkEvent(
      state,
      { kind: 'tab-gone', tabId: 999, stuckMaxRetry: 1 },
      T0 + 3000
    )
    expect(gone.state).toBe(state)
  })
})

describe('状态机：进展回报重置卡死时钟（item-progress，评论任务链路）', () => {
  /** 黄金样本验证过的 place URL（评论任务换算单测同源）。 */
  const PLACE_URL =
    'https://www.google.com/maps/place/Gold+coffee/@40.745,-73.978,17z/data=!4m2!3m1!1s0x89c2597ca044ec9b:0xa0acdb1716592b4d!8m2!3d40.745!4d-73.978'

  /** 创建并启动评论任务（单条目），回填工作页 tab。 */
  function runningReviewItem(): { state: BulkState; task: BulkTask } {
    const created = reduceBulkEvent(
      freshState(),
      {
        kind: 'create-task',
        name: 'r',
        type: 'review-urls',
        values: [PLACE_URL],
        reviewsPerStoreLimit: 300
      },
      T0
    )
    expect(created.error).toBeNull()
    const taskId = created.state.tasks[0]!.id
    const started = reduceBulkEvent(created.state, { kind: 'start-task', taskId }, T0 + 1000)
    expect(started.error).toBeNull()
    const launched = reduceBulkEvent(
      started.state,
      { kind: 'item-launched', taskId, itemIndex: 0, tabId: 81 },
      T0 + 1500
    )
    return { state: launched.state, task: launched.state.tasks[0]! }
  }

  it('慢而有进展：启动后 >90s，但每次进展间隔 <90s，不被判卡死', () => {
    const { state, task } = runningReviewItem()

    // t=+60s 第一批评论页解析完成 → 进展重置时钟
    const p1 = reduceBulkEvent(
      state,
      { kind: 'item-progress', taskId: task.id, itemIndex: 0 },
      T0 + 61_000
    )
    expect(p1.state.tasks[0]?.activeStartedAt).toBe(T0 + 61_000)

    // t=+90s 兜底扫描：距上次进展仅 30s → 不杀（旧语义在此时已误杀）
    const tick1 = reduceBulkEvent(p1.state, { kind: 'scan-tick', stuckMaxRetry: 1 }, T0 + 91_000)
    expect(tick1.state.tasks[0]?.items[0]).toMatchObject({ status: 'running', tries: 1 })
    expect(tick1.effects.launches).toHaveLength(0)
    expect(tick1.effects.closeTabIds).toHaveLength(0)

    // t=+120s 又一批进展；t=+150s 再扫描 → 仍不杀（总时长 150s ≫ 90s）
    const p2 = reduceBulkEvent(
      tick1.state,
      { kind: 'item-progress', taskId: task.id, itemIndex: 0 },
      T0 + 121_000
    )
    const tick2 = reduceBulkEvent(p2.state, { kind: 'scan-tick', stuckMaxRetry: 1 }, T0 + 151_000)
    expect(tick2.state.tasks[0]?.items[0]).toMatchObject({ status: 'running', tries: 1 })
    expect(tick2.effects.launches).toHaveLength(0)
  })

  it('真卡死：自上次进展 90s 无进展照旧判卡死（重试路径不变）', () => {
    const { state, task } = runningReviewItem()

    // t=+60s 最后一次进展，其后评论 RPC 再无响应
    const p1 = reduceBulkEvent(
      state,
      { kind: 'item-progress', taskId: task.id, itemIndex: 0 },
      T0 + 61_000
    )
    // t=+60s+91s 扫描 → 卡死 → 关页重跑（tries=2）
    const stuck = reduceBulkEvent(
      p1.state,
      { kind: 'scan-tick', stuckMaxRetry: 1 },
      T0 + 61_000 + BULK_LIMITS.stuckMs + 1000
    )
    const after = stuck.state.tasks[0]!
    expect(after.items[0]).toMatchObject({ status: 'running', tries: 2 })
    expect(after.activeTabId).toBeNull()
    expect(stuck.effects.closeTabIds).toEqual([81])
    expect(stuck.effects.launches).toHaveLength(1)
  })

  it('陈旧进展回报（游标已前进 / 条目非运行中）被忽略', () => {
    const { state, task } = runningReviewItem()
    const stale = reduceBulkEvent(
      state,
      { kind: 'item-progress', taskId: task.id, itemIndex: 1 },
      T0 + 2000
    )
    expect(stale.state).toBe(state)

    const stopped = reduceBulkEvent(state, { kind: 'stop-task', taskId: task.id }, T0 + 2000)
    const afterStop = reduceBulkEvent(
      stopped.state,
      { kind: 'item-progress', taskId: task.id, itemIndex: 0 },
      T0 + 3000
    )
    expect(afterStop.state).toBe(stopped.state)
  })
})

describe('状态机：停止与删除', () => {
  it('停止：关工作页、当前条目回到 pending、任务转 paused、可续跑', () => {
    const started = createAndStart(['k1', 'k2'])
    const task = started.tasks[0]!
    const launched = reduceBulkEvent(
      started,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 41 },
      T0 + 2000
    )

    const stopped = reduceBulkEvent(launched.state, { kind: 'stop-task', taskId: task.id }, T0 + 3000)
    const after = stopped.state.tasks[0]!
    expect(after.status).toBe('paused')
    expect(after.activeTabId).toBeNull()
    expect(after.activeStartedAt).toBeNull()
    expect(after.items[0]?.status).toBe('pending')
    expect(stopped.effects.closeTabIds).toEqual([41])
    expect(stopped.effects.scanAlarm).toBe('off')

    // 续跑：从游标（k1）重新启动
    const resumed = reduceBulkEvent(stopped.state, { kind: 'start-task', taskId: task.id }, T0 + 4000)
    expect(resumed.state.tasks[0]?.cursor).toBe(0)
    expect(resumed.state.tasks[0]?.items[0]?.status).toBe('running')
    expect(resumed.effects.launches).toHaveLength(1)
  })

  it('删除运行中任务：关工作页 + 移除任务 + 互斥解除', () => {
    const created = reduceBulkEvent(freshState(), createKeywords('a', ['k1']), T0)
    const second = reduceBulkEvent(created.state, createKeywords('b', ['k2']), T0 + 1000)
    const started = reduceBulkEvent(
      second.state,
      { kind: 'start-task', taskId: second.state.tasks[0]!.id },
      T0 + 2000
    )
    const first = started.state.tasks[0]!
    const launched = reduceBulkEvent(
      started.state,
      { kind: 'item-launched', taskId: first.id, itemIndex: 0, tabId: 51 },
      T0 + 2500
    )
    const deleted = reduceBulkEvent(launched.state, { kind: 'delete-task', taskId: first.id }, T0 + 3000)
    expect(deleted.state.tasks).toHaveLength(1)
    expect(deleted.state.tasks[0]?.id).not.toBe(first.id)
    expect(deleted.effects.closeTabIds).toEqual([51])
    expect(deleted.effects.scanAlarm).toBe('off')

    // 互斥解除：第二个任务立即可启动
    const remaining = deleted.state.tasks[0]!
    const startedSecond = reduceBulkEvent(
      deleted.state,
      { kind: 'start-task', taskId: remaining.id },
      T0 + 4000
    )
    expect(startedSecond.error).toBeNull()
  })

  it('不存在的任务 id：not-found 拒绝且状态不变', () => {
    const base = freshState()
    const result = reduceBulkEvent(base, { kind: 'start-task', taskId: 'nope' }, T0)
    expect(result.error).toBe('not-found')
    expect(result.state).toBe(base)
  })
})

describe('状态机：评论 URL 任务', () => {
  /** 黄金样本验证过的 fid ↔ placeid 配对（reviews-flow e2e 同源）。 */
  const PLACE_URL =
    'https://www.google.com/maps/place/Gold+coffee/@40.745,-73.978,17z/data=!4m2!3m1!1s0x89c2597ca044ec9b:0xa0acdb1716592b4d!8m2!3d40.745!4d-73.978'
  const EXPECTED_PLACE_ID = 'ChIJm-xEoHxZwokRTStZFhfbrKA'
  const LRD = '0xa0acdb1716592b4d'

  function createReviews(values: string[], limit: number | null): BulkMachineEvent {
    return { kind: 'create-task', name: 'r', type: 'review-urls', values, reviewsPerStoreLimit: limit }
  }

  it('启动评论任务：换算 place URL → 评论工作页（placeid/lrd/每店上限）', () => {
    const created = reduceBulkEvent(
      freshState(),
      createReviews([PLACE_URL], BULK_LIMITS.defaultReviewsPerStoreLimit),
      T0
    )
    const started = reduceBulkEvent(
      created.state,
      { kind: 'start-task', taskId: created.state.tasks[0]!.id },
      T0 + 1000
    )

    expect(started.error).toBeNull()
    const url = new URL(started.effects.launches[0]?.url ?? '')
    expect(url.hostname).toBe('search.google.com')
    expect(url.pathname).toBe('/local/reviews')
    expect(url.searchParams.get('placeid')).toBe(EXPECTED_PLACE_ID)
    expect(url.searchParams.get('gme_lrd')).toBe(LRD)
    expect(url.searchParams.get('gme_bulk_max')).toBe('300')
    expect(started.state.tasks[0]?.reviewsPerStoreLimit).toBe(300)
  })

  it('无效 place URL 条目标 invalid-url 跳过，队列继续推进到下一条', () => {
    const created = reduceBulkEvent(
      freshState(),
      createReviews(['https://www.google.com/maps/place/broken', PLACE_URL], 100),
      T0
    )
    const started = reduceBulkEvent(
      created.state,
      { kind: 'start-task', taskId: created.state.tasks[0]!.id },
      T0 + 1000
    )

    const after = started.state.tasks[0]!
    expect(after.items[0]).toMatchObject({ status: 'skipped', skipReason: 'invalid-url' })
    expect(after.cursor).toBe(1)
    expect(after.items[1]?.status).toBe('running')
    expect(started.effects.launches).toHaveLength(1)
    expect(new URL(started.effects.launches[0]?.url ?? '').searchParams.get('gme_bulk_max')).toBe(
      '100'
    )
  })

  it('评论任务创建缺少每店上限 → invalid-param 拒绝', () => {
    const result = reduceBulkEvent(freshState(), createReviews([PLACE_URL], null), T0)
    expect(result.error).toBe('invalid-param')
  })
})

describe('持久化与恢复', () => {
  it('内存 store roundtrip：落盘 → 重新载入 → 状态机继续推进（跨 SW 重启语义）', async () => {
    const store = new MemoryBulkStateStore()

    // “第一个 SW 生命周期”：创建 + 启动 + 回填 tab + 落盘
    const created = reduceBulkEvent(freshState(), createKeywords('a', ['k1', 'k2']), T0)
    const started = reduceBulkEvent(
      created.state,
      { kind: 'start-task', taskId: created.state.tasks[0]!.id },
      T0 + 1000
    )
    const launched = reduceBulkEvent(
      started.state,
      { kind: 'item-launched', taskId: created.state.tasks[0]!.id, itemIndex: 0, tabId: 61 },
      T0 + 1500
    )
    await store.save(launched.state)

    // “第二个 SW 生命周期”：重新载入（模拟 SW 被杀后醒来）
    const restored = (await store.load()) as BulkState
    expect(restored.tasks[0]?.activeTabId).toBe(61)

    // 工作页完成回报照常推进
    const done = reduceBulkEvent(
      restored,
      { kind: 'item-done', taskId: restored.tasks[0]!.id, itemIndex: 0, collected: 7 },
      T0 + 5000
    )
    expect(done.state.tasks[0]?.items[0]).toMatchObject({ status: 'complete', collected: 7 })
    expect(done.state.tasks[0]?.cursor).toBe(1)
    await store.save(done.state)

    const reloaded = (await store.load()) as BulkState
    expect(reloaded.tasks[0]?.items[1]?.status).toBe('running')
  })

  it('alarm 兜底：启动丢失（条目 pending）→ 重新打开工作页', () => {
    const started = createAndStart(['k1', 'k2'])
    const task = started.tasks[0]!

    // tabs.create 与 item-launched 之间 SW 被杀：状态里 cursor 条目仍 pending
    const tick = reduceBulkEvent(
      started,
      { kind: 'scan-tick', stuckMaxRetry: 1 },
      T0 + 60_000
    )
    expect(tick.effects.launches).toHaveLength(1)
    expect(tick.effects.launches[0]).toMatchObject({ taskId: task.id, itemIndex: 0 })
    expect(tick.state.tasks[0]?.items[0]?.status).toBe('running')
  })

  it('alarm 兜底：标签页创建回执丢失（activeTabId=null）→ 重开工作页', () => {
    const started = createAndStart(['k1'])
    const task = started.tasks[0]!
    // running 但 activeTabId 仍为 null（item-launched 丢失）
    const tick = reduceBulkEvent(started, { kind: 'scan-tick', stuckMaxRetry: 1 }, T0 + 120_000)
    const after = tick.state.tasks[0]!
    expect(after.items[0]?.status).toBe('running')
    expect(after.activeTabId).toBeNull()
    expect(tick.effects.launches).toHaveLength(1)
    expect(tick.effects.launches[0]?.itemIndex).toBe(0)
    void task
  })

  it('alarm 兜底：半程状态（缺启动时间）归一为当前时间，不重启工作页', () => {
    const started = createAndStart(['k1'])
    const task = started.tasks[0]!
    const launched = reduceBulkEvent(
      started,
      { kind: 'item-launched', taskId: task.id, itemIndex: 0, tabId: 71 },
      T0 + 2000
    )
    // 人工清掉启动时间（模拟持久化半程）
    const partial: BulkState = {
      ...launched.state,
      tasks: launched.state.tasks.map(candidate =>
        candidate.id === task.id ? { ...candidate, activeStartedAt: null } : candidate
      )
    }
    const tick = reduceBulkEvent(partial, { kind: 'scan-tick', stuckMaxRetry: 1 }, T0 + 60_000)
    const after = tick.state.tasks[0]!
    expect(after.activeStartedAt).toBe(T0 + 60_000)
    expect(tick.effects.launches).toHaveLength(0)
    expect(tick.effects.closeTabIds).toHaveLength(0)
  })

  it('normalizeBulkState：空/损坏输入回空状态，running 原样保留交给恢复扫描', () => {
    expect(normalizeBulkState(null)).toEqual(emptyBulkState())
    expect(normalizeBulkState(undefined)).toEqual(emptyBulkState())
    expect(normalizeBulkState('garbage')).toEqual(emptyBulkState())
    expect(normalizeBulkState({ tasks: 'nope' })).toEqual(emptyBulkState())

    const state = createAndStart(['k1'])
    const normalized = normalizeBulkState(JSON.parse(JSON.stringify(state)))
    expect(normalized.version).toBe(1)
    expect(normalized.tasks[0]?.status).toBe('running')
    expect(normalized.tasks[0]?.items[0]?.status).toBe('running')

    // 条目级损坏逐条过滤：非法条目丢弃，合法保留
    const damaged = normalizeBulkState({
      version: 1,
      tasks: [
        {
          id: 't1',
          name: 'x',
          type: 'keywords',
          status: 'paused',
          createdAt: 1,
          reviewsPerStoreLimit: null,
          cursor: 99,
          activeTabId: 'oops',
          activeStartedAt: 'oops',
          items: [{ value: 'good', status: 'weird', tries: 'x' }, 'junk', { value: '', status: 'pending' }]
        },
        'junk-task'
      ]
    })
    expect(damaged.tasks).toHaveLength(1)
    const task = damaged.tasks[0]!
    expect(task.items).toHaveLength(1)
    expect(task.items[0]).toMatchObject({ value: 'good', status: 'pending', tries: 0 })
    // 游标钳制到条目数上界（损坏的 99 不复现）
    expect(task.cursor).toBe(1)
    expect(task.activeTabId).toBeNull()
    expect(task.activeStartedAt).toBeNull()
  })
})
