/** 批量中转页通过真实 RPC 与 controller 登记 owner，许可必须等落盘完成。 */

import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BackgroundMessageRouter } from '@/background/services/BackgroundMessageRouter'
import { reduceBulkEvent } from '@/background/batch/machine'
import { bulkStateStore, emptyBulkState } from '@/background/batch/store'
import { BackgroundChannel } from '@/popup/rpc/background.rpc'
import type { BulkState } from '@/background/batch/types'
import type { JsonValue, RpcResponse, RpcServeResult } from '@/core/rpc/types'

vi.mock('@/background/batch/store', async importOriginal => ({
  ...(await importOriginal<object>()),
  bulkStateStore: { load: vi.fn(), save: vi.fn() }
}))

let state: BulkState
let workUrl: string
let sender: chrome.runtime.MessageSender
let router: BackgroundMessageRouter
const background = new BackgroundChannel()
const originalSendMessage = chrome.runtime.sendMessage

beforeEach(() => {
  vi.clearAllMocks()
  const created = reduceBulkEvent(
    emptyBulkState(),
    {
      kind: 'create-task',
      name: '许可测试',
      type: 'keywords',
      values: ['coffee'],
      reviewsPerStoreLimit: null
    },
    1000
  )
  const started = reduceBulkEvent(
    created.state,
    { kind: 'start-task', taskId: created.state.tasks[0]!.id },
    2000
  )
  state = started.state
  workUrl = started.effects.launches[0]!.url
  sender = {
    id: chrome.runtime.id,
    tab: { id: 71 },
    url: `${chrome.runtime.getURL('src/bulk-launch.html')}?url=${encodeURIComponent(workUrl)}`
  }
  vi.mocked(bulkStateStore.load).mockImplementation(async () => state)
  vi.mocked(bulkStateStore.save).mockImplementation(async next => {
    state = next
  })
  router = new BackgroundMessageRouter()
  router.setupListener()
  const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)?.[0]
  if (!listener) throw new Error('真实 background RPC listener 未注册')
  Object.assign(chrome.runtime, {
    sendMessage: (message: JsonValue) =>
      new Promise<RpcResponse<RpcServeResult> | undefined>(resolve => {
        if (!listener(message, sender, resolve)) resolve(undefined)
      })
  })
})

afterEach(() => {
  router.destroy()
  Object.assign(chrome.runtime, { sendMessage: originalSendMessage })
})

it('许可等待真实 owner 保存；同页确认幂等，其他页不能覆盖', async () => {
  let finishSave: (() => void) | undefined
  vi.mocked(bulkStateStore.save).mockImplementationOnce(
    next =>
      new Promise<void>(resolve => {
        finishSave = () => {
          state = next
          resolve()
        }
      })
  )
  let replied = false
  const authorization = background.authorizeBulkWorkPage().then(result => {
    replied = true
    return result
  })
  await vi.waitFor(() => expect(finishSave).toBeDefined())
  expect(replied).toBe(false)
  expect(state.tasks[0]?.activeTabId).toBeNull()
  finishSave?.()

  await expect(authorization).resolves.toBe(true)
  expect(state.tasks[0]?.activeTabId).toBe(71)
  await expect(background.authorizeBulkWorkPage()).resolves.toBe(true)
  expect(bulkStateStore.save).toHaveBeenCalledTimes(1)

  sender = { ...sender, tab: { id: 72 } }
  await expect(background.authorizeBulkWorkPage()).resolves.toBe(false)
  expect(state.tasks[0]?.activeTabId).toBe(71)
  expect(bulkStateStore.save).toHaveBeenCalledTimes(1)
})

it('普通页面没有许可权限，中转页也不能用伪造目标接管任务', async () => {
  sender = { id: chrome.runtime.id, tab: { id: 72 }, url: 'https://www.google.com/maps' }
  await expect(background.authorizeBulkWorkPage()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  sender = {
    id: chrome.runtime.id,
    tab: { id: 72 },
    url: chrome.runtime.getURL('src/dashboard.html')
  }
  await expect(background.authorizeBulkWorkPage()).rejects.toThrow(
    '采集许可只能由本扩展批量中转页申请'
  )
  sender.url = `${chrome.runtime.getURL('src/bulk-launch.html')}?url=${encodeURIComponent(workUrl.replace('coffee', 'other'))}`
  await expect(background.authorizeBulkWorkPage()).resolves.toBe(false)
  expect(state.tasks[0]?.activeTabId).toBeNull()
  expect(bulkStateStore.save).not.toHaveBeenCalled()
})

it('owner 保存失败时不能返回导航许可', async () => {
  vi.mocked(bulkStateStore.save).mockRejectedValueOnce(new Error('许可测试落盘失败'))
  await expect(background.authorizeBulkWorkPage()).rejects.toThrow('许可测试落盘失败')
  expect(state.tasks[0]?.activeTabId).toBeNull()
})
