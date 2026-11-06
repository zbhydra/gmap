/** 分页摘要、单任务详情和轻量命令通过真实 RPC/router/controller 合同。 */

import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BackgroundMessageRouter } from '@/background/services/BackgroundMessageRouter'
import { reduceBulkEvent } from '@/background/batch/machine'
import { bulkStateStore, emptyBulkState } from '@/background/batch/store'
import { BULK_TASK_PAGE_SIZE, type BulkState } from '@/background/batch/types'
import { BackgroundChannel } from '@/popup/rpc/background.rpc'
import type { JsonValue, RpcResponse, RpcServeResult } from '@/core/rpc/types'

vi.mock('@/core/api/plugin-version/api', () => ({
  checkPluginVersion: vi.fn(async () => ({ status: 'current', update: null }))
}))

vi.mock('@/background/batch/store', async importOriginal => ({
  ...(await importOriginal<object>()),
  bulkStateStore: { load: vi.fn(), save: vi.fn() }
}))
vi.mock('@/sites/maps/usage/usageService', () => ({
  mapsUsageService: { getSnapshot: vi.fn(async () => null) }
}))

let state: BulkState
let router: BackgroundMessageRouter
const background = new BackgroundChannel()
const originalSendMessage = chrome.runtime.sendMessage
const originalAlarms = chrome.alarms

beforeEach(() => {
  vi.clearAllMocks()
  Object.assign(chrome, { alarms: { create: vi.fn(), clear: vi.fn() } })
  state = emptyBulkState()
  for (let index = 0; index < BULK_TASK_PAGE_SIZE + 3; index++) {
    state = reduceBulkEvent(
      state,
      {
        kind: 'create-task',
        name: `任务 ${index}`,
        type: index === BULK_TASK_PAGE_SIZE + 2 ? 'review-urls' : 'keywords',
        values: ['a', 'b', 'c', 'd', 'e'],
        reviewsPerStoreLimit: 300
      },
      index + 1000
    ).state
  }
  const running = state.tasks[0]!
  running.status = 'running'
  running.cursor = 3
  running.activeTabId = 71
  running.items[0] = { value: 'a', status: 'complete', tries: 2, collected: 7, skipReason: null }
  running.items[1] = { value: 'b', status: 'skipped', tries: 1, collected: 0, skipReason: 'stuck' }
  running.items[2] = {
    value: 'c',
    status: 'skipped',
    tries: 1,
    collected: 0,
    skipReason: 'invalid-url'
  }
  running.items[3] = { value: 'd', status: 'running', tries: 2, collected: 0, skipReason: null }
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
        if (
          !listener(
            message,
            { id: chrome.runtime.id, url: chrome.runtime.getURL('src/dashboard.html') },
            resolve
          )
        ) {
          resolve(undefined)
        }
      })
  })
})

afterEach(() => {
  router.destroy()
  Object.assign(chrome.runtime, { sendMessage: originalSendMessage })
  Object.assign(chrome, { alarms: originalAlarms })
})

it('按类型倒序分页，跨页运行摘要保留统计，完整条目只在按 ID 读取时返回', async () => {
  const first = await background.getBulkTaskPage({ type: 'keywords', page: 1 })
  expect(first.tasks.map(task => task.id)).toEqual(
    state.tasks
      .slice(2, 12)
      .reverse()
      .map(task => task.id)
  )
  expect(first).toMatchObject({ total: 12, totalTasks: 13, page: 1 })
  expect(first.tasks).toHaveLength(BULK_TASK_PAGE_SIZE)
  expect(first.tasks.every(task => !('items' in task) && !('activeTabId' in task))).toBe(true)
  expect(first.runningTask).toMatchObject({
    id: state.tasks[0]!.id,
    itemCount: 5,
    stats: { done: 3, complete: 1, skipped: 2, stuck: 1, invalid: 1, tries: 6, records: 7 }
  })
  expect(first.runningTask).not.toHaveProperty('items')
  const second = await background.getBulkTaskPage({ type: 'keywords', page: 2 })
  expect(second.tasks.map(task => task.id)).toEqual([state.tasks[1]!.id, state.tasks[0]!.id])
  const reviews = await background.getBulkTaskPage({ type: 'review-urls', page: 1 })
  expect(reviews.total).toBe(1)
  expect(reviews.runningTask?.id).toBe(state.tasks[0]!.id)
  const detail = await background.getBulkTask({ taskId: state.tasks[0]!.id })
  expect(detail).toMatchObject({ ...first.runningTask, items: state.tasks[0]!.items, cursor: 3 })
  expect(detail).not.toHaveProperty('activeTabId')
  await expect(background.getBulkTask({ taskId: '已删除' })).resolves.toBeNull()
})

it('创建、启停、互斥拒绝和删除返回必要结果，修改仍然落盘', async () => {
  state.tasks[0]!.status = 'paused'
  const created = await background.createBulkTask({
    name: '新增任务',
    type: 'keywords',
    values: ['coffee'],
    reviewsPerStoreLimit: null
  })
  expect(created).toEqual({ ok: true, code: null, taskId: expect.any(String) })
  if (!created.ok) throw new Error('合法测试任务未创建')
  const taskId = created.taskId
  expect(state.tasks.at(-1)?.id).toBe(taskId)
  await expect(background.startBulkTask({ taskId })).resolves.toEqual({ ok: true, code: null })
  expect(state.tasks.at(-1)?.status).toBe('running')
  await expect(background.startBulkTask({ taskId: state.tasks[1]!.id })).resolves.toEqual({
    ok: false,
    code: 'mutex'
  })
  await expect(background.stopBulkTask({ taskId })).resolves.toEqual({ ok: true, code: null })
  expect(state.tasks.at(-1)?.status).toBe('paused')
  await expect(background.deleteBulkTask({ taskId })).resolves.toEqual({ ok: true, code: null })
  expect(state.tasks).toHaveLength(13)
})

it('删除末页最后一项后返回有效末页；页码在 RPC 入口校验', async () => {
  for (const taskId of state.tasks.slice(0, 2).map(task => task.id)) {
    await background.deleteBulkTask({ taskId })
  }
  const page = await background.getBulkTaskPage({ type: 'keywords', page: 2 })
  expect(page).toMatchObject({
    page: 1,
    total: BULK_TASK_PAGE_SIZE,
    totalTasks: BULK_TASK_PAGE_SIZE + 1
  })
  expect(page.tasks).toHaveLength(BULK_TASK_PAGE_SIZE)
  for (const invalid of [0, 1.5]) {
    await expect(background.getBulkTaskPage({ type: 'keywords', page: invalid })).rejects.toThrow(
      'page 必须为正整数'
    )
  }
})
