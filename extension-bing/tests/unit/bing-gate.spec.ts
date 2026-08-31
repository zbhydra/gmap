/**
 * 免费/Pro 门控单测（016 §5）：BingStopPolicy 读取点的 Pro/Free 切换、
 * 快照刷新单飞去重、RPC 失败保留上次快照、订阅通知。
 *
 * background 侧 getGateState RPC 以类替身注入；freeRowLimit 取包内默认 20。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  rpcGetGateState: vi.fn()
}))

vi.mock('../../src/content/rpc/background.rpc', () => ({
  BackgroundChannel: class {
    getGateState = mocks.rpcGetGateState
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

const PRO_STATE = { authenticated: true, isPro: true, displayName: 'E2E User' }
const FREE_STATE = { authenticated: true, isPro: false, displayName: 'Free User' }
const ANONYMOUS_STATE = { authenticated: false, isPro: false, displayName: null }

/** 每用例重置模块级快照与单飞状态（隔离用例间污染）。 */
async function loadGate() {
  vi.resetModules()
  return import('../../src/sites/bing/content/gate')
}

/** 排空读取点触发的后台刷新链（微任务 + 宏任务各一拍）。 */
async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('Bing 门控停止策略', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('匿名初始快照：免费档 20 条上限，不触发 RPC', async () => {
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

  it('快照变更通知订阅者', async () => {
    const gate = await loadGate()
    const listener = vi.fn()
    gate.subscribeGateState(listener)

    mocks.rpcGetGateState.mockResolvedValue(PRO_STATE)
    await gate.refreshGateState()

    expect(listener).toHaveBeenCalledWith(PRO_STATE)
  })
})
