/**
 * 免费/Pro 门控单测（016 §5）：BingStopPolicy 读取点的 Pro/Free 切换、
 * 快照刷新单飞去重、RPC 失败保留上次快照、订阅通知。
 *
 * background 侧 getGateState RPC 以类替身注入；freeRowLimit 取包内默认 20。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEYS } from '../../src/core/api/config'

const mocks = vi.hoisted(() => ({
  checkPluginVersion: vi.fn().mockResolvedValue({ status: 'current', update: null }),
  rpcGetGateState: vi.fn(),
  getBingUsage: vi.fn().mockResolvedValue({ used: 0, total: 100000, period: '2026-11', exhausted: false, identity: 'user:1' }),
  reportBingUsage: vi.fn().mockResolvedValue(undefined),
  rpcRecordMark: vi.fn().mockResolvedValue({ recorded: true })
}))

vi.mock('../../src/content/rpc/background.rpc', () => ({
  BackgroundChannel: class {
    checkPluginVersion = mocks.checkPluginVersion
    getGateState = mocks.rpcGetGateState
    getBingUsage = mocks.getBingUsage
    reportBingUsage = mocks.reportBingUsage
    recordMark = mocks.rpcRecordMark
    destroy(): void {}
  }
}))

vi.mock('../../src/core/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

const PRO_STATE = { authenticated: true, isPro: true }
const FREE_STATE = { authenticated: true, isPro: false }
const ANONYMOUS_STATE = { authenticated: false, isPro: false }

/** 每用例重置模块级快照与单飞状态（隔离用例间污染）。 */
async function loadGate() {
  vi.resetModules()
  return import('../../src/sites/bing/content/gate')
}

/** 排空读取点触发的后台刷新链（微任务 + 宏任务各一拍）。 */
async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

function authChanged(changes: Record<string, chrome.storage.StorageChange>): void {
  for (const [listener] of vi.mocked(chrome.storage.onChanged.addListener).mock.calls) {
    listener(changes, 'local')
  }
}

async function readyCollector() {
  const { BingCollector } = await import('../../src/sites/bing/content/collector')
  const gate = await import('../../src/sites/bing/content/gate')
  const list = document.createElement('div')
  list.className = 'b_vList'
  for (let id = 0; id < 22; id++) {
    const item = document.createElement('a')
    item.className = 'listings-item'
    item.setAttribute('data-entity', JSON.stringify({ entity: { id: `place-${id}` } }))
    list.append(item)
  }
  document.body.replaceChildren(list)
  return new BingCollector(gate.createBingStopPolicy())
}

describe('Bing 门控停止策略', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('匿名初始快照：RPC 返回前同步读取免费档 20 条上限', async () => {
    const gate = await loadGate()
    const policy = gate.createBingStopPolicy()

    // 读取点会触发后台刷新，此处 RPC 未返回前读的是匿名快照
    mocks.rpcGetGateState.mockReturnValue(new Promise(() => undefined))
    expect(policy.getRowLimit()).toBe(20)
    expect(gate.getGateState()).toEqual(ANONYMOUS_STATE)
  })

  it('Pro 快照：无上限（null）', async () => {
    const gate = await loadGate()
    mocks.rpcGetGateState.mockResolvedValue(PRO_STATE)

    await gate.refreshGateState()
    const policy = gate.createBingStopPolicy()
    expect(policy.getRowLimit()).toBeNull()
    expect(gate.getGateState()).toEqual(PRO_STATE)
  })

  it('免费登录快照：仍按 20 条截断', async () => {
    const gate = await loadGate()
    mocks.rpcGetGateState.mockResolvedValue(FREE_STATE)

    await gate.refreshGateState()
    const policy = gate.createBingStopPolicy()
    expect(policy.getRowLimit()).toBe(20)
  })

  it('免费/Pro 切换下一轮读取即时生效', async () => {
    const gate = await loadGate()
    const policy = gate.createBingStopPolicy()

    mocks.rpcGetGateState.mockResolvedValue(FREE_STATE)
    await gate.refreshGateState()
    // 本轮读当前快照；读取点同时触发一次后台刷新，排空使其落定
    expect(policy.getRowLimit()).toBe(20)
    await settle()

    mocks.rpcGetGateState.mockResolvedValue(PRO_STATE)
    await gate.refreshGateState()
    // 下一轮读取 = Pro 无上限
    expect(policy.getRowLimit()).toBeNull()
    await settle()

    mocks.rpcGetGateState.mockResolvedValue(FREE_STATE)
    await gate.refreshGateState()
    expect(policy.getRowLimit()).toBe(20)
    await settle()
  })

  it('RPC 失败保留上次快照（Pro 会话不因瞬时失败闪断为免费）', async () => {
    const gate = await loadGate()
    mocks.rpcGetGateState.mockResolvedValue(PRO_STATE)
    await gate.refreshGateState()

    mocks.rpcGetGateState.mockRejectedValue(new Error('rpc down'))
    await gate.refreshGateState()
    const policy = gate.createBingStopPolicy()
    expect(gate.getGateState()).toEqual(PRO_STATE)
    expect(policy.getRowLimit()).toBeNull()
  })

  it('刷新单飞去重：并发多次只发一次 RPC', async () => {
    const gate = await loadGate()
    let resolveRpc: (value: typeof PRO_STATE) => void = () => undefined
    mocks.rpcGetGateState.mockReturnValue(
      new Promise<typeof PRO_STATE>(resolve => {
        resolveRpc = resolve
      })
    )

    const first = gate.refreshGateState()
    const second = gate.refreshGateState()
    resolveRpc(PRO_STATE)
    await Promise.all([first, second])

    expect(mocks.rpcGetGateState).toHaveBeenCalledTimes(1)
  })

  it('force 等待在途普通请求后另发 RPC，不以旧快照结束', async () => {
    const gate = await loadGate()
    let resolveOld!: (state: typeof FREE_STATE) => void
    let resolveForced!: (state: typeof PRO_STATE) => void
    mocks.rpcGetGateState
      .mockReturnValueOnce(
        new Promise(resolve => {
          resolveOld = resolve
        })
      )
      .mockReturnValueOnce(
        new Promise(resolve => {
          resolveForced = resolve
        })
      )

    const first = gate.refreshGateState()
    let finished = false
    const forced = gate.refreshGateState({ force: true }).then(() => {
      finished = true
    })
    resolveOld(FREE_STATE)
    await first
    await settle()
    expect(mocks.rpcGetGateState).toHaveBeenCalledTimes(2)
    expect(mocks.rpcGetGateState).toHaveBeenLastCalledWith({ force: true })
    expect(finished).toBe(false)
    resolveForced(PRO_STATE)
    await forced
    expect(gate.getGateState()).toEqual(PRO_STATE)
  })

  it.each([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER_INFO])(
    '%s 变化刷新快照并通知面板，退出后下一轮恢复免费上限',
    async key => {
      const gate = await loadGate()
      mocks.rpcGetGateState.mockResolvedValue(PRO_STATE)
      await gate.refreshGateState()
      const listener = vi.fn()
      gate.subscribeGateState(listener)
      const unwatch = gate.watchGateAuthStorage()
      mocks.rpcGetGateState.mockResolvedValue(ANONYMOUS_STATE)
      authChanged({ [key]: { oldValue: 'old', newValue: undefined } })
      await settle()

      expect(gate.getGateState()).toEqual(ANONYMOUS_STATE)
      expect(listener).toHaveBeenCalledWith(ANONYMOUS_STATE)
      expect(mocks.rpcGetGateState).toHaveBeenLastCalledWith({ force: true })
      expect(gate.createBingStopPolicy().getRowLimit()).toBe(20)
      await settle()
      unwatch()
    }
  )

  it('auth 三键同批变化只刷新一次，USER_INFO 回写不循环也不清认证', async () => {
    const gate = await loadGate()
    const unwatch = gate.watchGateAuthStorage()
    mocks.rpcGetGateState.mockImplementation(async () => {
      await Promise.resolve()
      authChanged({ [STORAGE_KEYS.USER_INFO]: { newValue: { user_id: 1 } } })
      return PRO_STATE
    })
    authChanged({
      [STORAGE_KEYS.ACCESS_TOKEN]: { newValue: 'access-new' },
      [STORAGE_KEYS.REFRESH_TOKEN]: { newValue: 'refresh-new' },
      [STORAGE_KEYS.USER_INFO]: { newValue: { user_id: 1 } }
    })
    await settle()

    expect(gate.getGateState()).toEqual(PRO_STATE)
    expect(mocks.rpcGetGateState).toHaveBeenCalledTimes(1)
    expect(chrome.storage.local.remove).not.toHaveBeenCalled()
    unwatch()
  })

  it('冷启动立即 Start 等待 force，Pro 首轮可采集超过 20 条', async () => {
    await loadGate()
    const collector = await readyCollector()
    let resolveRpc!: (state: typeof PRO_STATE) => void
    mocks.rpcGetGateState.mockReturnValue(
      new Promise(resolve => {
        resolveRpc = resolve
      })
    )
    collector.subscribe(state => {
      if (state.foundCount === 22) collector.stop()
    })
    try {
      const started = collector.start()
      await settle()
      expect(mocks.rpcGetGateState).toHaveBeenCalledWith({ force: true })
      expect(collector.getState().foundCount).toBe(0)
      resolveRpc(PRO_STATE)
      await started
      expect(collector.getState()).toMatchObject({ foundCount: 22, freeLimitReached: false })
    } finally {
      collector.destroy()
    }
  })

  it.each(['free', 'anonymous', 'failure'])(
    'Start 刷新结果为 %s 时仍可采集并保持免费 20 条',
    async result => {
      await loadGate()
      const collector = await readyCollector()
      if (result === 'failure') {
        mocks.rpcGetGateState.mockRejectedValue(new Error('rpc down'))
      } else {
        mocks.rpcGetGateState.mockResolvedValue(result === 'free' ? FREE_STATE : ANONYMOUS_STATE)
      }
      try {
        await collector.start()
        expect(collector.getState()).toMatchObject({
          phase: 'completed',
          foundCount: 20,
          freeLimitReached: true
        })
      } finally {
        collector.destroy()
      }
    }
  )

  it.each(['stop', 'reset'] as const)('等待首轮门控时 %s，迟到响应不能继续采集', async action => {
    await loadGate()
    const collector = await readyCollector()
    let resolveRpc!: (state: typeof PRO_STATE) => void
    mocks.rpcGetGateState.mockReturnValue(
      new Promise(resolve => {
        resolveRpc = resolve
      })
    )
    try {
      const started = collector.start()
      await settle()
      collector[action]()
      resolveRpc(PRO_STATE)
      await started
      expect(collector.getState()).toMatchObject({
        phase: action === 'stop' ? 'completed' : 'idle',
        foundCount: 0
      })
    } finally {
      collector.destroy()
    }
  })

  it('快照变更通知订阅者', async () => {
    const gate = await loadGate()
    const listener = vi.fn()
    gate.subscribeGateState(listener)

    mocks.rpcGetGateState.mockResolvedValue(PRO_STATE)
    await gate.refreshGateState()

    expect(listener).toHaveBeenCalledWith(PRO_STATE)
  })
})
