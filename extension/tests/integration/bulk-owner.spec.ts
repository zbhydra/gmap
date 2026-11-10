/** 真实 controller/事件总线接线，存储与 Chrome API 为替身。 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BULK_SCAN_ALARM, BulkSchedulerController } from '@/background/batch/controller'
import { buildWorkUrlForItem, reduceBulkEvent } from '@/background/batch/machine'
import { bulkStateStore, emptyBulkState } from '@/background/batch/store'
import { BULK_LIMITS, type BulkState } from '@/background/batch/types'
import { checkPluginVersion } from '@/core/api/plugin-version/api'
import { STORAGE_KEYS } from '@/core/api/config'
import type { ExtensionEvents, EventNames } from '@/core/events/types'
import { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import { logger } from '@/core/utils/logger'
import { mapsUsageService } from '@/sites/maps/usage/usageService'
import type { MapsUsageSnapshot } from '@/sites/maps/usage/types'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { bootstrapMapsContent } from '@/sites/maps/content/bootstrap'
import { MapsPanel } from '@/sites/maps/content/panel/mapsPanel'
import { ExtractionPanel } from '@/sites/maps/content/panel/extractionPanel'
import { MapsSearchScraper } from '@/sites/maps/content/scraper/searchScraper'
import { ReviewsScraper } from '@/sites/maps/content/reviews/reviewsScraper'
import * as configLoader from '@/sites/maps/config/loader'
import * as userSettings from '@/sites/maps/settings/userSettings'
import * as usageClient from '@/sites/maps/usage/usageClient'

vi.mock('@/core/api/plugin-version/api', () => ({
  checkPluginVersion: vi.fn(async () => ({ status: 'current', update: null }))
}))

vi.mock('@/background/batch/store', async importOriginal => ({
  ...(await importOriginal<object>()),
  bulkStateStore: { load: vi.fn(), save: vi.fn() }
}))
vi.mock('@/sites/maps/usage/usageService', () => ({
  mapsUsageService: { getSnapshot: vi.fn(async () => null), handleReport: vi.fn(async () => undefined) }
}))
vi.mock('@/core/api/mark', () => ({ markApi: { record: vi.fn(async () => undefined) } }))

let state: BulkState
let workUrl: string
let pageIdentity: { taskId: string; itemIndex: number }
let sessionReady: boolean
let controller: BulkSchedulerController
let listener: Parameters<typeof chrome.runtime.onMessage.addListener>[0]
function senderTab(id: number): chrome.tabs.Tab {
  return { id, index: 0, pinned: false, highlighted: false, windowId: 1, active: true,
    incognito: false, selected: true, discarded: false, autoDiscardable: true, groupId: -1, frozen: false }
}

const originalAlarms = chrome.alarms
const originalOnRemoved = chrome.tabs.onRemoved

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(checkPluginVersion).mockResolvedValue({ status: 'current', update: null })
  sessionReady = true
  vi.mocked(chrome.storage.session.get).mockImplementation(async () => ({
    [STORAGE_KEYS.BULK_SESSION_READY]: sessionReady
  }))
  vi.mocked(chrome.storage.session.set).mockImplementation(async () => {
    sessionReady = true
  })
  Object.assign(chrome, {
    alarms: {
      create: vi.fn(async () => undefined),
      clear: vi.fn(async () => true),
      onAlarm: { addListener: vi.fn(), removeListener: vi.fn() }
    }
  })
  Object.assign(chrome.tabs, {
    onRemoved: { addListener: vi.fn(), removeListener: vi.fn() }
  })
  const created = reduceBulkEvent(
    emptyBulkState(),
    { kind: 'create-task', name: 'owner', type: 'keywords', values: ['coffee', 'tea'], reviewsPerStoreLimit: null },
    Date.now()
  )
  state = reduceBulkEvent(created.state, { kind: 'start-task', taskId: created.state.tasks[0]!.id }, Date.now()).state
  const task = state.tasks[0]!
  task.items[0] = { value: 'coffee', status: 'complete', collected: 7, tries: 1, skipReason: null }
  task.items[1] = { value: 'tea', status: 'running', collected: 0, tries: 1, skipReason: null }
  task.cursor = 1
  task.activeTabId = 71
  workUrl = buildWorkUrlForItem(task, task.cursor)!
  vi.mocked(bulkStateStore.load).mockImplementation(async () => state)
  vi.mocked(bulkStateStore.save).mockImplementation(async next => { state = next })
  pageIdentity = { taskId: task.id, itemIndex: task.cursor }
  vi.mocked(chrome.tabs.sendMessage).mockImplementation(async (_tabId, message) => {
    if (typeof message === 'object' && message !== null && isIdentityQuery(message)) return pageIdentity
    return undefined
  })
  controller = new BulkSchedulerController()
  listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)![0]
})

afterEach(() => {
  controller.destroy()
  vi.useRealTimers()
  vi.restoreAllMocks()
  Object.assign(chrome, { alarms: originalAlarms })
  Object.assign(chrome.tabs, { onRemoved: originalOnRemoved })
})

function emit<E extends EventNames<ExtensionEvents>>(
  event: E,
  data: ExtensionEvents[E],
  tabId = 71,
  sender: Partial<chrome.runtime.MessageSender> = {}
): void {
  listener(
    { __event__: true, event, data },
    { id: chrome.runtime.id, frameId: 0, tab: senderTab(tabId), url: workUrl, ...sender },
    vi.fn()
  )
}

async function flush(): Promise<void> {
  await controller.checkWorkPageOwner(state.tasks[0]?.id ?? '已删除', 1, 71)
}

async function setup(): Promise<void> {
  controller.setup()
  await vi.waitFor(() => expect(chrome.alarms.create).toHaveBeenCalled())
}

it('新会话先解除旧 owner；并发旧页回报无效，进度保留且重开工作页，不查询或关闭旧 ID', async () => {
  sessionReady = false
  state.tasks[0]!.activeStartedAt = Date.now() - BULK_LIMITS.stuckMs - 1
  const taskId = state.tasks[0]!.id
  const bulk = { taskId, itemIndex: 1 }
  controller.setup()
  emit('mapsBulkItemDone', { ...bulk, collected: 99, pageUrl: workUrl })
  emit('mapsBulkItemProgress', { ...bulk, pageUrl: workUrl })
  emit('mapsBulkQuotaBlocked', { ...bulk, pageUrl: workUrl })
  emit('mapsUsageReport', { bulk, records: 99, requestId: 'old', source: 'search', pageUrl: workUrl })
  await flush()
  await vi.waitFor(() => expect(chrome.tabs.create).toHaveBeenCalledTimes(1))
  expect(state.tasks[0]).toMatchObject({ cursor: 1, activeTabId: null, status: 'running' })
  expect(state.tasks[0]?.items[0]).toMatchObject({ collected: 7, status: 'complete', tries: 1 })
  expect(state.tasks[0]?.items[1]).toMatchObject({ status: 'running', collected: 0 })
  expect(chrome.tabs.get).not.toHaveBeenCalled()
  expect(identityQueries()).toHaveLength(0)
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
  expect(mapsUsageService.handleReport).not.toHaveBeenCalled()
  expect(bulkStateStore.save).toHaveBeenNthCalledWith(1, expect.objectContaining({
    tasks: [expect.objectContaining({ activeTabId: null })]
  }))
  expect(vi.mocked(bulkStateStore.save).mock.invocationCallOrder[0]!).toBeLessThan(
    vi.mocked(chrome.storage.session.set).mock.invocationCallOrder[0]!
  )
  expect(await controller.authorizeWorkPage(workUrl, 72)).toBe(true)
  expect(await controller.checkWorkPageOwner(taskId, 1, 71)).toBe(false)
  expect(await controller.checkWorkPageOwner(taskId, 1, 72)).toBe(true)
})

it('同一会话 SW 重建保留 owner，不补开页面', async () => {
  await setup()
  controller.destroy()
  controller = new BulkSchedulerController()
  expect(await controller.checkWorkPageOwner(state.tasks[0]!.id, 1, 71)).toBe(true)
  expect(chrome.storage.session.set).not.toHaveBeenCalled()
  expect(chrome.tabs.create).not.toHaveBeenCalled()
})

it('会话初始化落盘失败不发布标记、不接受 owner 或执行关页', async () => {
  sessionReady = false
  vi.mocked(bulkStateStore.save).mockRejectedValueOnce(new Error('恢复落盘失败'))
  await expect(controller.stopTask(state.tasks[0]!.id)).rejects.toThrow('恢复落盘失败')
  expect(chrome.storage.session.set).not.toHaveBeenCalled()
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
  expect(state.tasks[0]?.activeTabId).toBe(71)
  await expect(controller.stopTask(state.tasks[0]!.id)).resolves.toEqual({ ok: true, code: null })
  expect(chrome.storage.session.set).toHaveBeenCalledTimes(1)
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
})

it('旧页与伪造 tabId 的 progress/done/usage 被拒；当前 owner 的用量在 done 推进前接纳', async () => {
  await setup()
  const task = state.tasks[0]!
  task.activeTabId = 72
  const bulk = { taskId: task.id, itemIndex: 1 }
  const startedAt = task.activeStartedAt
  const forged = { ...bulk, tabId: 72, pageUrl: workUrl }
  emit('mapsBulkItemProgress', forged)
  emit('mapsBulkItemDone', { ...forged, collected: 99 })
  emit('mapsBulkQuotaBlocked', forged)
  emit('mapsUsageReport', { bulk, records: 99, requestId: 'old', source: 'search', pageUrl: workUrl })
  await flush()
  expect(state.tasks[0]?.activeStartedAt).toBe(startedAt)
  expect(state.tasks[0]?.items[1]?.status).toBe('running')
  expect(state.tasks[0]?.status).toBe('running')
  expect(mapsUsageService.handleReport).not.toHaveBeenCalled()
  expect(chrome.tabs.remove).not.toHaveBeenCalled()

  const report = { bulk, records: 5, requestId: 'current', source: 'search', pageUrl: workUrl } as const
  emit('mapsUsageReport', report, 72)
  emit('mapsBulkItemDone', { ...bulk, collected: 5, pageUrl: workUrl }, 72)
  await flush()
  expect(mapsUsageService.handleReport).toHaveBeenCalledTimes(1)
  expect(mapsUsageService.handleReport).toHaveBeenCalledWith(report)
  expect(state.tasks[0]?.items[1]).toMatchObject({ status: 'complete', collected: 5 })
  expect(state.tasks[0]?.status).toBe('completed')
  emit('mapsUsageReport', report, 72)
  await flush()
  expect(mapsUsageService.handleReport).toHaveBeenCalledTimes(1)
})

it('缺少浏览器 tab、其他来源或子 frame 不能伪造当前 owner 回报', async () => {
  await setup()
  const bulk = { taskId: state.tasks[0]!.id, itemIndex: 1 }
  for (const sender of [{ tab: undefined }, { id: 'other-extension' }, { frameId: 1 }, { url: 'https://example.com/' }]) {
    emit('mapsBulkItemDone', { ...bulk, collected: 99, pageUrl: workUrl }, 71, sender)
    emit('mapsBulkQuotaBlocked', { ...bulk, pageUrl: workUrl }, 71, sender)
    emit('mapsUsageReport', { bulk, records: 99, requestId: 'forged', source: 'search', pageUrl: workUrl }, 71, sender)
  }
  await flush()
  expect(state.tasks[0]?.items[1]?.status).toBe('running')
  expect(mapsUsageService.handleReport).not.toHaveBeenCalled()
})

it.each(['keywords', 'review-urls'] as const)(
  '%s 第二项额度耗尽后暂停，补额 Resume 从当前项续跑',
  async type => {
    const originalUrl = location.href
    const task = state.tasks[0]!
    task.type = type
    task.reviewsPerStoreLimit = type === 'review-urls' ? 15 : null
    if (type === 'review-urls') {
      for (const item of task.items) {
        item.value =
          'https://www.google.com/maps/place/Coffee/data=!4m2!3m1!1s0x89c2597ca044ec9b:0xa0acdb1716592b4d'
      }
    }
    task.items[1]!.tries = 2
    task.items.push(
      { value: 'skipped', status: 'skipped', collected: 0, tries: 2, skipReason: 'stuck' },
      { ...task.items[1]!, status: 'pending', tries: 0 }
    )
    const completed = { ...task.items[0]! }
    const skipped = { ...task.items[2]! }
    const remaining = { ...task.items[3]! }
    workUrl = buildWorkUrlForItem(task, 1)!
    let currentTabId = 71
    let snapshot: MapsUsageSnapshot = {
      plan_name: 'Pro',
      used: 1000,
      total: 1000,
      period: '2026-11',
      exhausted: true,
      run_limits: { search: 99999, reviews: 250, photos: 100 }
    }
    vi.spyOn(document.documentElement, 'appendChild').mockImplementation(child => child)
    vi.spyOn(configLoader, 'loadMapsConfig').mockResolvedValue()
    vi.spyOn(userSettings, 'initializeMapsUserSettings').mockResolvedValue()
    vi.spyOn(MapsPanel.prototype, 'mount').mockResolvedValue()
    vi.spyOn(ExtractionPanel.prototype, 'mount').mockResolvedValue()
    vi.spyOn(MapsPanel.prototype, 'checkQuota').mockImplementation(async () => snapshot)
    vi.spyOn(usageClient, 'fetchUsageSnapshot').mockImplementation(async () => snapshot)
    vi.spyOn(BackgroundChannel.prototype, 'checkBulkWorkPage').mockImplementation(params =>
      controller.checkWorkPageOwner(params.taskId, params.itemIndex, currentTabId)
    )
    const searchStart = vi
      .spyOn(MapsSearchScraper.prototype, 'start')
      .mockImplementation(() => undefined)
    const reviewsStart = vi.spyOn(ReviewsScraper.prototype, 'start').mockResolvedValue()
    vi.spyOn(ChromeEventEmitter.prototype, 'emit').mockImplementation((event, data) => {
      listener(
        { __event__: true, event, data },
        { id: chrome.runtime.id, frameId: 0, tab: senderTab(currentTabId), url: workUrl },
        vi.fn()
      )
    })
    try {
      await setup()
      vi.mocked(bulkStateStore.save).mockClear()
      location.href = workUrl
      bootstrapMapsContent()
      history.replaceState(null, '', new URL(workUrl).pathname)
      await vi.waitFor(() => expect(state.tasks[0]?.status).toBe('paused'))
      await flush()
      expect(state.tasks[0]).toMatchObject({ cursor: 1, activeTabId: null, activeStartedAt: null })
      expect(state.tasks[0]?.items[1]).toMatchObject({
        status: 'pending',
        tries: 1,
        collected: 0,
        skipReason: null
      })
      expect(state.tasks[0]?.items[0]).toEqual(completed)
      expect(state.tasks[0]?.items[2]).toEqual(skipped)
      expect(state.tasks[0]?.items[3]).toEqual(remaining)
      expect(searchStart).not.toHaveBeenCalled()
      expect(reviewsStart).not.toHaveBeenCalled()
      expect(chrome.tabs.create).not.toHaveBeenCalled()
      expect(chrome.tabs.remove).toHaveBeenCalledTimes(1)
      expect(chrome.tabs.remove).toHaveBeenCalledWith(71)
      expect(chrome.alarms.clear).toHaveBeenCalledTimes(1)
      expect(chrome.alarms.clear).toHaveBeenCalledWith(BULK_SCAN_ALARM)

      const blocked = { taskId: task.id, itemIndex: 1, pageUrl: location.href }
      emit('mapsBulkQuotaBlocked', blocked)
      emit('mapsBulkQuotaBlocked', blocked)
      await flush()
      expect(state.tasks[0]?.items[1]?.tries).toBe(1)
      expect(bulkStateStore.save).toHaveBeenCalledTimes(1)
      expect(chrome.tabs.remove).toHaveBeenCalledTimes(1)
      expect(chrome.alarms.clear).toHaveBeenCalledTimes(1)
      vi.mocked(mapsUsageService.getSnapshot).mockResolvedValueOnce(snapshot)
      expect(await controller.startTask(task.id)).toEqual({ ok: false, code: 'quota-exceeded' })
      expect(state.tasks[0]?.status).toBe('paused')

      snapshot = { ...snapshot, used: 0, exhausted: false }
      vi.mocked(mapsUsageService.getSnapshot).mockResolvedValueOnce(snapshot)
      expect(await controller.startTask(task.id)).toEqual({ ok: true, code: null })
      expect(state.tasks[0]).toMatchObject({ status: 'running', cursor: 1 })
      expect(state.tasks[0]?.items[1]).toMatchObject({ status: 'running', tries: 2 })
      const launcher = new URL(vi.mocked(chrome.tabs.create).mock.calls.at(-1)![0].url!)
      expect(launcher.searchParams.get('url')).toBe(workUrl)
      expect(chrome.alarms.create).toHaveBeenCalledTimes(2)
      currentTabId = 72
      expect(await controller.authorizeWorkPage(workUrl, currentTabId)).toBe(true)
      location.href = workUrl
      bootstrapMapsContent()
      const start = type === 'keywords' ? searchStart : reviewsStart
      await vi.waitFor(() => {
        expect(start).toHaveBeenCalledTimes(1)
        expect(start).toHaveBeenCalledWith(type === 'keywords' ? 1000 : 15)
      })
      emit('mapsBulkQuotaBlocked', blocked, 71)
      await flush()
      expect(state.tasks[0]).toMatchObject({ status: 'running', cursor: 1, activeTabId: 72 })
      expect(state.tasks[0]?.items[0]).toEqual(completed)
      expect(state.tasks[0]?.items[2]).toEqual(skipped)
      expect(state.tasks[0]?.items[3]).toEqual(remaining)
      expect(chrome.tabs.remove).toHaveBeenCalledTimes(1)
    } finally {
      location.href = originalUrl
    }
  }
)

it('额度 owner 核验与暂停不被紧随的完成回报插入，当前项仍为 pending', async () => {
  await setup()
  const taskId = state.tasks[0]!.id
  state.tasks[0]!.items.push({
    value: 'next',
    status: 'pending',
    collected: 0,
    tries: 0,
    skipReason: null
  })
  emit('mapsBulkQuotaBlocked', { taskId, itemIndex: 1, pageUrl: workUrl })
  emit('mapsBulkItemDone', { taskId, itemIndex: 1, collected: 99, pageUrl: workUrl })
  await flush()
  expect(state.tasks[0]).toMatchObject({ status: 'paused', cursor: 1, activeTabId: null })
  expect(state.tasks[0]?.items[1]).toMatchObject({ status: 'pending', collected: 0, tries: 0 })
  expect(state.tasks[0]?.items[2]).toMatchObject({ status: 'pending', tries: 0 })
  expect(chrome.tabs.create).not.toHaveBeenCalled()
  expect(chrome.tabs.remove).toHaveBeenCalledTimes(1)
})

async function finish(kind: 'stop' | 'delete' | 'done' | 'timeout' | 'lost-launch'): Promise<void> {
  const task = state.tasks[0]!
  if (kind === 'stop') await controller.stopTask(task.id)
  if (kind === 'delete') await controller.deleteTask(task.id)
  if (kind === 'done') {
    emit('mapsBulkItemDone', { taskId: task.id, itemIndex: 1, collected: 5, pageUrl: workUrl })
    await flush()
  }
  if (kind === 'timeout' || kind === 'lost-launch') {
    if (kind === 'timeout') task.activeStartedAt = Date.now() - BULK_LIMITS.stuckMs - 1
    else task.items[1]!.status = 'pending'
    const onAlarm = vi.mocked(chrome.alarms.onAlarm.addListener).mock.calls.at(-1)![0]
    onAlarm({ name: BULK_SCAN_ALARM, scheduledTime: Date.now() })
    await vi.waitFor(() => expect(chrome.tabs.create).toHaveBeenCalled())
  }
}

function isIdentityQuery(message: object): boolean {
  return '__bulkWorkIdentity__' in message && message.__bulkWorkIdentity__ === true
}

function identityQueries() {
  return vi.mocked(chrome.tabs.sendMessage).mock.calls.filter(([, message]) => typeof message === 'object' && message !== null && isIdentityQuery(message))
}

it.each(['stop', 'delete', 'done', 'timeout', 'lost-launch'] as const)('%s 先核验推进前的页内身份，再关闭工作页', async kind => {
  await setup()
  vi.mocked(chrome.tabs.sendMessage).mockClear()
  await finish(kind)
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(71, { __bulkWorkIdentity__: true }, { frameId: 0 })
  expect(chrome.tabs.get).not.toHaveBeenCalled()
  expect(chrome.tabs.remove).toHaveBeenCalledTimes(1)
  expect(chrome.tabs.remove).toHaveBeenCalledWith(71)
  expect(vi.mocked(chrome.tabs.sendMessage).mock.invocationCallOrder[0]!).toBeLessThan(
    vi.mocked(chrome.tabs.remove).mock.invocationCallOrder[0]!
  )
})

it.each(['stop', 'delete', 'done', 'timeout', 'lost-launch'] as const)('%s 遇到其他任务的旧页身份时不关页', async kind => {
  await setup()
  pageIdentity = { ...pageIdentity, taskId: 'another-task' }
  await finish(kind)
  expect(identityQueries()).toHaveLength(1)
  expect(chrome.tabs.get).not.toHaveBeenCalled()
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
})

it.each([
  { name: '无响应', reply: undefined },
  { name: '空响应', reply: null },
  { name: '字段类型错误', reply: { taskId: 7, itemIndex: '1' } },
  { name: '同任务的过期条目', reply: { taskId: '', itemIndex: 0 } }
])('$name 不关闭页面并记录保留原因', async ({ reply }) => {
  await setup()
  const info = vi.spyOn(logger, 'info')
  const response = reply?.taskId === '' ? { taskId: pageIdentity.taskId, itemIndex: 0 } : reply
  vi.mocked(chrome.tabs.sendMessage).mockImplementation(async () => response)
  await controller.stopTask(state.tasks[0]!.id)
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
  expect(info).toHaveBeenCalledWith(expect.stringContaining('工作页未回报匹配身份，保留标签页'))
})

it('页面已消失或没有接收方时不关页，调度器继续处理后续命令', async () => {
  await setup()
  const error = vi.spyOn(logger, 'error')
  vi.mocked(chrome.tabs.sendMessage).mockImplementationOnce(async () => {
    throw new Error('Could not establish connection. Receiving end does not exist.')
  })
  const taskId = state.tasks[0]!.id
  await expect(controller.stopTask(taskId)).resolves.toEqual({ ok: true, code: null })
  await expect(controller.deleteTask(taskId)).resolves.toEqual({ ok: true, code: null })
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
  expect(error).toHaveBeenCalledWith(expect.stringContaining('核验或关闭工作页失败，保留标签页'), expect.any(Error))
})

it('身份查询 2s 超时后释放串行队列，迟到的匹配回复也不能关闭页面', async () => {
  await setup()
  vi.useFakeTimers()
  const error = vi.spyOn(logger, 'error')
  let reply: ((identity: typeof pageIdentity) => void) | undefined
  vi.mocked(chrome.tabs.sendMessage).mockImplementationOnce(() => new Promise<typeof pageIdentity>(resolve => { reply = resolve }))
  const taskId = state.tasks[0]!.id
  let stopped = false
  const stop = controller.stopTask(taskId).then(() => { stopped = true })
  const nextCommand = controller.deleteTask(taskId)
  await vi.advanceTimersByTimeAsync(0)
  expect(reply).toBeDefined()
  await vi.advanceTimersByTimeAsync(1_999)
  expect(stopped).toBe(false)
  await vi.advanceTimersByTimeAsync(1)
  await stop
  await nextCommand
  expect(stopped).toBe(true)
  expect(state.tasks).toHaveLength(0)
  reply?.(pageIdentity)
  await vi.advanceTimersByTimeAsync(0)
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
  expect(error).toHaveBeenCalledWith(expect.stringContaining('保留标签页'), expect.objectContaining({ message: expect.stringContaining('2000ms') }))
  expect(vi.getTimerCount()).toBe(0)
})

it('tab-gone 不再查询或关闭已经消失的标签页', async () => {
  await setup()
  const onRemoved = vi.mocked(chrome.tabs.onRemoved.addListener).mock.calls.at(-1)![0]
  onRemoved(71, { windowId: 1, isWindowClosing: false })
  await vi.waitFor(() => expect(chrome.tabs.create).toHaveBeenCalled())
  expect(identityQueries()).toHaveLength(0)
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
})


it.each(['disabled', 'failed'] as const)('%s 保留已完成项，下一项退回待执行且 alarm 不再重启；重新启用后手动续跑', async status => {
  await setup()
  const taskId = state.tasks[0]!.id
  state.tasks[0]!.items.push({ value: 'next', status: 'pending', collected: 0, tries: 0, skipReason: null })
  vi.mocked(checkPluginVersion).mockResolvedValue(status === 'disabled' ? { status: 'disabled', update: null } : null)
  emit('mapsBulkItemDone', { taskId, itemIndex: 1, collected: 5, pageUrl: workUrl })
  await flush()
  expect(state.tasks[0]).toMatchObject({ status: 'paused', cursor: 2, activeTabId: null })
  expect(state.tasks[0]?.items[0]).toMatchObject({ status: 'complete', collected: 7 })
  expect(state.tasks[0]?.items[1]).toMatchObject({ status: 'complete', collected: 5 })
  expect(state.tasks[0]?.items[2]).toMatchObject({ status: 'pending', tries: 0, collected: 0, skipReason: null })
  expect(chrome.tabs.create).not.toHaveBeenCalled()
  expect(chrome.alarms.clear).toHaveBeenCalledWith(BULK_SCAN_ALARM)
  vi.mocked(checkPluginVersion).mockClear()
  const alarm = vi.mocked(chrome.alarms.onAlarm.addListener).mock.calls.at(-1)![0]
  alarm({ name: BULK_SCAN_ALARM, scheduledTime: Date.now() })
  await flush()
  expect(checkPluginVersion).not.toHaveBeenCalled()
  expect(chrome.tabs.create).not.toHaveBeenCalled()
  expect(await controller.startTask(taskId)).toEqual({ ok: false, code: status === 'disabled' ? 'plugin-disabled' : 'version-check-failed' })
  expect(state.tasks[0]?.items[2]?.tries).toBe(0)
  vi.mocked(checkPluginVersion).mockResolvedValue({ status: 'update_available', update: { version: '9.0.0', url: 'https://example.com/update' } })
  expect(await controller.startTask(taskId)).toEqual({ ok: true, code: null })
  expect(state.tasks[0]).toMatchObject({ status: 'running', cursor: 2 })
  expect(state.tasks[0]?.items[2]).toMatchObject({ status: 'running', tries: 1 })
  expect(chrome.tabs.create).toHaveBeenCalledOnce()
})

it('首次启动禁用时停在 paused，全部未执行项保持 pending', async () => {
  const taskId = state.tasks[0]!.id
  state = reduceBulkEvent(state, { kind: 'stop-task', taskId }, Date.now()).state
  state.tasks[0]!.status = 'idle'
  for (const item of state.tasks[0]!.items) Object.assign(item, { status: 'pending', tries: 0, collected: 0 })
  state.tasks[0]!.cursor = 0
  vi.mocked(checkPluginVersion).mockResolvedValue({ status: 'disabled', update: null })
  expect(await controller.startTask(taskId)).toEqual({ ok: false, code: 'plugin-disabled' })
  expect(state.tasks[0]).toMatchObject({ status: 'paused', cursor: 0, activeTabId: null })
  expect(state.tasks[0]?.items.every(item => item.status === 'pending' && item.tries === 0)).toBe(true)
  expect(chrome.tabs.create).not.toHaveBeenCalled()
})
