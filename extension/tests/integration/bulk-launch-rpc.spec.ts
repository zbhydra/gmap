/** 批量中转页通过真实 RPC 与 controller 登记 owner，许可必须等落盘完成。 */

import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BackgroundMessageRouter } from '@/background/services/BackgroundMessageRouter'
import { reduceBulkEvent } from '@/background/batch/machine'
import { bulkStateStore, emptyBulkState } from '@/background/batch/store'
import { BackgroundChannel } from '@/popup/rpc/background.rpc'
import { BackgroundChannel as ContentBackgroundChannel } from '@/content/rpc/background.rpc'
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
function senderTab(id: number): chrome.tabs.Tab {
  return { id, index: 0, pinned: false, highlighted: false, windowId: 1, active: true,
    incognito: false, selected: true, discarded: false, autoDiscardable: true, groupId: -1, frozen: false }
}

const originalSendMessage = chrome.runtime.sendMessage

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(chrome.tabs.sendMessage).mockImplementation(async () => undefined)
  vi.mocked(chrome.storage.session.get).mockImplementation(async () => ({ bulk_session_ready: true }))
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
    tab: senderTab(71),
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
        listener(message, sender, resolve)
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

  sender = { ...sender, tab: senderTab(72) }
  await expect(background.authorizeBulkWorkPage()).resolves.toBe(false)
  expect(state.tasks[0]?.activeTabId).toBe(71)
  expect(bulkStateStore.save).toHaveBeenCalledTimes(1)
})

it('普通页面没有许可权限，中转页也不能用伪造目标接管任务', async () => {
  sender = { id: chrome.runtime.id, tab: senderTab(72), url: 'https://www.google.com/maps' }
  await expect(background.authorizeBulkWorkPage()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  sender = {
    id: chrome.runtime.id,
    tab: senderTab(72),
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

it('Google 工作页开始前只能复核当前 owner，清参后仍使用初始任务身份', async () => {
  await expect(background.authorizeBulkWorkPage()).resolves.toBe(true)
  const content = new ContentBackgroundChannel()
  const taskId = state.tasks[0]!.id
  sender = { id: chrome.runtime.id, tab: senderTab(71), frameId: 0, url: 'https://www.google.com/maps/place/Tea' }
  try {
    await expect(content.checkBulkWorkPage({ taskId, itemIndex: 0 })).resolves.toBe(true)
    sender = { ...sender, tab: senderTab(72) }
    await expect(content.checkBulkWorkPage({ taskId, itemIndex: 0 })).resolves.toBe(false)
    sender = { ...sender, tab: senderTab(71) }
    await expect(content.checkBulkWorkPage({ taskId: 'other-task', itemIndex: 0 })).resolves.toBe(false)
    await expect(content.checkBulkWorkPage({ taskId, itemIndex: 1 })).resolves.toBe(false)
    await expect(content.checkBulkWorkPage({ taskId, itemIndex: -1 })).rejects.toThrow('itemIndex 必须为非负整数')
    sender = { ...sender, frameId: 1 }
    await expect(content.checkBulkWorkPage({ taskId, itemIndex: 0 })).resolves.toBe(false)
  } finally {
    content.destroy()
  }
  expect(state.tasks[0]?.activeTabId).toBe(71)
  expect(bulkStateStore.save).toHaveBeenCalledTimes(1)
})

it.each([true, false])('中转页由 background 按页内身份关闭，匹配=%s，目标只取真实 sender', async matches => {
  const taskId = state.tasks[0]!.id
  state.tasks[0]!.activeTabId = 72
  vi.mocked(chrome.tabs.sendMessage).mockImplementation(async () => ({
    taskId: matches ? taskId : 'other-task', itemIndex: 0
  }))
  await expect(background.closeBulkWorkPage()).resolves.toBeUndefined()
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(71, { __bulkWorkIdentity__: true }, { frameId: 0 })
  expect(chrome.tabs.remove).toHaveBeenCalledTimes(matches ? 1 : 0)
  if (matches) expect(chrome.tabs.remove).toHaveBeenCalledWith(71)
  expect(state.tasks[0]?.activeTabId).toBe(72)
  expect(chrome.tabs.get).not.toHaveBeenCalled()
})

it('其他扩展页、子 frame 与无 tab 身份的请求不能借中转页关页 RPC 关闭标签页', async () => {
  const initial = sender
  for (const source of [
    { ...initial, url: chrome.runtime.getURL('src/dashboard.html') },
    { ...initial, frameId: 1 },
    { ...initial, tab: undefined }
  ]) {
    sender = source
    await expect(background.closeBulkWorkPage()).rejects.toThrow()
  }
  expect(chrome.tabs.sendMessage).not.toHaveBeenCalled()
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
})
