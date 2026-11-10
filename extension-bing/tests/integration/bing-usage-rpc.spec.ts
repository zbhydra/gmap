/** 真实 collector → typed RPC → background 持久化 → HTTP，仅替身 HTTP 出口。 */
import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { API, STORAGE_KEYS } from '@/core/api/config'
import type { JsonValue, RpcResponse, RpcServeResult } from '@/core/rpc/types'
import type { BingCollector } from '@/sites/bing/content/collector'
import type { BackgroundMessageRouter } from '@/background/services/BackgroundMessageRouter'
import type { BingUsageSnapshot } from '@/sites/bing/usage/types'

let usage: BingUsageSnapshot
let pro: boolean
let failQuery: boolean
let failReport: boolean
let invalidQuery: boolean
let reportBodies: { records: number; request_id: string }[]
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>
let collector: BingCollector
let router: BackgroundMessageRouter
let deviceUsage: BingUsageSnapshot
let expiredAccessToken: boolean
let refreshOffline: boolean
let loseReportResponse: boolean
let completed: Map<string, number>
const DAY_MS = 24 * 60 * 60 * 1000
const originalSendMessage = chrome.runtime.sendMessage

function response(data: JsonValue): Response {
  return new Response(JSON.stringify({ code: 10000, data }), { headers: { 'Content-Type': 'application/json' } })
}

async function connectRouter(): Promise<void> {
  const { BackgroundMessageRouter } = await import('@/background/services/BackgroundMessageRouter')
  router = new BackgroundMessageRouter()
  router.setupListener()
  const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)?.[0]
  if (!listener) throw new Error('用量测试缺少 background RPC listener')
  const tab = await chrome.tabs.get(1)
  Object.assign(chrome.runtime, { sendMessage: vi.fn((message: JsonValue) =>
    new Promise<RpcResponse<RpcServeResult> | undefined>(resolve => {
      listener(message, { id: chrome.runtime.id, tab, url: 'https://www.bing.com/maps' }, resolve)
    })) })
}

async function settle(): Promise<void> {
  await vi.waitFor(() => expect(collector.getState().finishing).toBeNull(), { timeout: 5000 })
}

beforeEach(async () => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('__API_BASE_URL__', API.BASE_URL)
  vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://www.example.com')
  vi.stubGlobal('__DEV__', false)
  vi.stubGlobal('__ALI_SLS_MARK_CONFIG__', { enabled: false })
  await chrome.storage.local.clear()
  await chrome.storage.local.set({ [STORAGE_KEYS.DEVICE_ID]: 'bing-usage-test-device' })
  usage = { used: 0, total: 1000, period: '2026-11', exhausted: false }
  deviceUsage = usage
  expiredAccessToken = false
  refreshOffline = false
  loseReportResponse = false
  pro = false
  failQuery = false
  failReport = false
  invalidQuery = false
  reportBodies = []
  completed = new Map()
  fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, options) => {
    const url = new URL(String(input))
    const path = url.pathname
    if (path === API.ENDPOINTS.PLUGIN_VERSION_CHECK) return response({ status: 'current', update: null })
    const bearer = new Headers(options?.headers).get('Authorization')
    const userId = bearer === 'Bearer bing-usage-token-refreshed' ||
      (bearer === 'Bearer bing-usage-token' && !expiredAccessToken) ? 7 : 0
    const resolvedUsage = userId ? usage : deviceUsage
    const expectedUserId = url.searchParams.get('expected_user_id')
    const identityMismatch = expectedUserId !== null && Number(expectedUserId) !== userId
    const unauthorized = () => new Response(JSON.stringify({ code: 10001, msg: 'Invalid token' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    })
    if (path === API.ENDPOINTS.AUTH_REFRESH) {
      if (refreshOffline) throw new TypeError('refresh offline')
      return response({ access_token: 'bing-usage-token-refreshed', refresh_token: 'bing-usage-refresh-refreshed' })
    }
    if (path === API.ENDPOINTS.MAPS_USAGE) {
      if (identityMismatch) return unauthorized()
      if (failQuery) throw new TypeError('usage offline')
      return response(invalidQuery ? { ...resolvedUsage, used: -1 } : { ...resolvedUsage })
    }
    if (path === API.ENDPOINTS.MAPS_USAGE_REPORT) {
      const body = JSON.parse(String(options?.body)) as { records: number; request_id: string }
      reportBodies.push(body)
      if (identityMismatch) return unauthorized()
      if (failReport) throw new TypeError('report offline')
      const dedupKey = `${userId}:${body.request_id}`
      const deducted = (completed.get(dedupKey) ?? 0) <= Date.now()
      if (deducted) {
        resolvedUsage.used += body.records
        completed.set(dedupKey, userId ? Infinity : Date.now() + 7 * DAY_MS)
      }
      if (loseReportResponse) throw new TypeError('report response lost after consumption')
      return response({ ...resolvedUsage, deducted })
    }
    if (path === API.ENDPOINTS.AUTH_ME) return response({ user_id: 7, email: null, full_name: null, avatar_url: null, created_at: 1 })
    if (path === API.ENDPOINTS.SUBSCRIPTION_STATUS) return response({ period: pro ? 'month' : 'free', display_name: pro ? 'Pro' : 'Free', status: 'active', expires_at: null, auto_renew: false, payment_method: null })
    throw new Error(`用量测试出现未声明 HTTP 路径: ${path}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  await connectRouter()
  const { BingCollector } = await import('@/sites/bing/content/collector')
  const { createBingStopPolicy } = await import('@/sites/bing/content/gate')
  document.body.innerHTML = '<div class="b_vList">' + Array.from({ length: 22 }, (_, id) =>
    `<a class="listings-item" data-entity='${JSON.stringify({ entity: { id: `place-${id}` } })}'></a>`
  ).join('') + '</div>'
  collector = new BingCollector(createBingStopPolicy())
})

afterEach(async () => {
  await settle()
  collector.destroy()
  router.destroy()
  Object.assign(chrome.runtime, { sendMessage: originalSendMessage })
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function signIn(): Promise<void> {
  pro = true
  deviceUsage = { ...usage, used: 0, total: 1000 }
  await chrome.storage.local.set({ [STORAGE_KEYS.ACCESS_TOKEN]: 'bing-usage-token', [STORAGE_KEYS.REFRESH_TOKEN]: 'bing-usage-refresh', [STORAGE_KEYS.USER_INFO]: { user_id: 7 } })
}

it.each([3, 20, 21])('匿名月剩余 %i：取免费单次 20 与余额最小值，达限实际扣量', async remaining => {
  usage.used = usage.total - remaining
  await collector.start()
  await settle()
  const records = Math.min(20, remaining)
  expect(collector.getState()).toMatchObject({ phase: 'completed', foundCount: records, freeLimitReached: remaining >= 20, usageNotice: remaining <= 20 ? 'exhausted' : null })
  expect(reportBodies).toEqual([{ records, request_id: expect.any(String) }])
  expect(usage.used).toBe(1000 - remaining + records)
  const versionRequest = fetchMock.mock.calls[0]
  const versionUrl = new URL(String(versionRequest[0]))
  expect(versionUrl.pathname).toBe(API.ENDPOINTS.PLUGIN_VERSION_CHECK)
  expect(versionUrl.searchParams.get('plugin')).toBe('bing')
  expect(versionUrl.searchParams.get('version')).toBe(chrome.runtime.getManifest().version)
  expect(versionRequest[1]?.cache).toBe('no-store')
  expect(new Headers(versionRequest[1]?.headers).get('Authorization')).toBeNull()
  const requests = fetchMock.mock.calls.filter(([url]) => new URL(String(url)).pathname === API.ENDPOINTS.MAPS_USAGE)
  expect(new URL(String(requests[0][0])).searchParams.get('expected_user_id')).toBe('0')
  expect(new Headers(requests[0][1]?.headers).get('X-Device-Id')).toBe('bing-usage-test-device')
  expect(new Headers(requests[0][1]?.headers).get('Authorization')).toBeNull()
})

it.each([100000, 500000])('付费月总量 %i：无 20 条截断，Stop 只上报实际 22 条', async total => {
  await signIn()
  usage.total = total
  collector.subscribe(state => { if (state.foundCount === 22) collector.stop() })
  await collector.start()
  await settle()
  expect(collector.getState()).toMatchObject({ foundCount: 22, stoppedManually: true, freeLimitReached: false })
  expect(reportBodies).toEqual([{ records: 22, request_id: expect.any(String) }])
  const query = fetchMock.mock.calls.find(([url]) => new URL(String(url)).pathname === API.ENDPOINTS.MAPS_USAGE)
  expect(new Headers(query?.[1]?.headers).get('Authorization')).toBe('Bearer bing-usage-token')
  expect(new URL(String(query?.[0])).searchParams.get('expected_user_id')).toBe('7')
})

it('Pro 仅剩 2 条时按月余额完成，不显示免费达限警告', async () => {
  await signIn()
  usage.used = 998
  await collector.start()
  await settle()
  expect(collector.getState()).toMatchObject({ foundCount: 2, freeLimitReached: false, usageNotice: 'exhausted' })
  expect(reportBodies[0].records).toBe(2)
})

it.each(['exhausted', 'zero', 'offline', 'invalid'])('%s 时拒绝开始，不解析也不上报', async kind => {
  if (kind === 'exhausted') usage.exhausted = true
  if (kind === 'zero') usage.used = usage.total
  if (kind === 'offline') failQuery = true
  if (kind === 'invalid') invalidQuery = true
  await collector.start()
  expect(collector.getState()).toMatchObject({ phase: 'idle', foundCount: 0, usageNotice: kind === 'offline' || kind === 'invalid' ? 'unavailable' : 'exhausted' })
  expect(reportBodies).toHaveLength(0)
})

it('上报失败仍放行；重试复用 request_id，不重采集；新会话才换键', async () => {
  failReport = true
  await collector.start()
  await settle()
  expect(collector.getState()).toMatchObject({ foundCount: 20, usageNotice: 'reportFailed' })
  const first = reportBodies[0]
  const stored = await chrome.storage.local.get(STORAGE_KEYS.BING_USAGE_PENDING)
  expect(stored[STORAGE_KEYS.BING_USAGE_PENDING]).toEqual([{ identity: 'device:bing-usage-test-device', requestId: first.request_id, records: 20, createdAt: expect.any(Number) }])
  failReport = false
  await collector.retryUsageReport()
  collector.stop()
  expect(reportBodies).toEqual([first, first])
  expect(usage.used).toBe(20)
  expect(collector.getState()).toMatchObject({ foundCount: 20, usageNotice: null })
  collector.reset()
  await collector.start()
  await settle()
  expect(reportBodies[2].request_id).not.toBe(first.request_id)
  expect(usage.used).toBe(40)
})

it.each([6, 7, 8])('匿名应答丢失后经过 %i 天恢复：窗口内幂等，达到 7 天后清理且不再上报', async days => {
  let now = Date.now()
  vi.spyOn(Date, 'now').mockImplementation(() => now)
  loseReportResponse = true
  await collector.start()
  await settle()
  const first = reportBodies[0]
  const pending = (await chrome.storage.local.get(STORAGE_KEYS.BING_USAGE_PENDING))[STORAGE_KEYS.BING_USAGE_PENDING][0]
  expect(usage.used).toBe(20)
  expect(pending.createdAt).toBe(now)
  loseReportResponse = false
  now += days * DAY_MS
  collector.destroy()
  router.destroy()
  vi.resetModules()
  await connectRouter()
  const { BackgroundChannel } = await import('@/content/rpc/background.rpc')
  const channel = new BackgroundChannel()
  try {
    expect(await channel.getBingUsage()).toMatchObject({ used: 20 })
    expect(reportBodies).toEqual(days < 7 ? [first, first] : [first])
    expect((await chrome.storage.local.get(STORAGE_KEYS.BING_USAGE_PENDING))[STORAGE_KEYS.BING_USAGE_PENDING]).toEqual([])
    if (days >= 7) {
      // 页面仍持原报告；清理后手动 Retry 不能重新开启重放窗口。
      await channel.reportBingUsage(pending)
      expect(reportBodies).toEqual([first])
      expect(usage.used).toBe(20)
      expect(console.error).toHaveBeenCalledWith('[ERROR]', expect.stringContaining('停止上报并清理'))
    }
  } finally { channel.destroy() }
})

it('旧身份待上报不扣到新账号；查询期间换号不返回旧快照', async () => {
  failReport = true
  await collector.start()
  await settle()
  const { BackgroundChannel } = await import('@/content/rpc/background.rpc')
  const channel = new BackgroundChannel()
  await signIn()
  failReport = false
  try {
    await collector.retryUsageReport()
    expect(reportBodies).toHaveLength(1)
    expect(collector.getState().usageNotice).toBe('reportFailed')
    expect(await channel.getBingUsage()).toMatchObject({ identity: 'user:7' })
    const originalFetch = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (input, options) => {
      if (new URL(String(input)).pathname === API.ENDPOINTS.MAPS_USAGE) await chrome.storage.local.remove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER_INFO])
      return originalFetch(input, options)
    })
    await expect(channel.getBingUsage()).rejects.toThrow(/身份已变化/)
  } finally { channel.destroy() }
})

it.each([false, true])('采集中 token 过期，刷新不可用=%s：不扣匿名账本，失败保留账号待办', async offline => {
  await signIn()
  refreshOffline = offline
  collector.subscribe(state => {
    if (state.phase === 'collecting' && state.foundCount === 22) {
      expiredAccessToken = true
      collector.stop()
    }
  })
  await collector.start()
  await settle()
  expect(fetchMock.mock.calls.some(([url]) => new URL(String(url)).pathname === API.ENDPOINTS.AUTH_REFRESH)).toBe(true)
  expect(deviceUsage.used).toBe(0)
  expect(usage.used).toBe(offline ? 0 : 22)
  const pending = (await chrome.storage.local.get(STORAGE_KEYS.BING_USAGE_PENDING))[STORAGE_KEYS.BING_USAGE_PENDING]
  if (offline) {
    expect(pending).toEqual([expect.objectContaining({ identity: 'user:7', records: 22 })])
    expect(collector.getState().usageNotice).toBe('reportFailed')
    expiredAccessToken = false
    refreshOffline = false
    await collector.retryUsageReport()
    expect(usage.used).toBe(22)
    expect(deviceUsage.used).toBe(0)
    expect((await chrome.storage.local.get(STORAGE_KEYS.BING_USAGE_PENDING))[STORAGE_KEYS.BING_USAGE_PENDING]).toEqual([])
  } else {
    expect(pending).toEqual([])
  }
  expect(new Set(reportBodies.map(body => body.request_id)).size).toBe(1)
})

it('查询时 token 过期不能把匿名额度标成账号快照，刷新后查询账号账本', async () => {
  await signIn()
  expiredAccessToken = true
  usage.used = 35
  usage.total = 100000
  const { getBingUsageSession } = await import('@/sites/bing/usage/usageService')
  expect(await getBingUsageSession()).toMatchObject({ identity: 'user:7', used: 35, total: 100000 })
  expect(deviceUsage.used).toBe(0)
})

it('账号待办第 8 天仍以原键补报，MySQL 幂等不受匿名窗口影响', async () => {
  let now = Date.now()
  vi.spyOn(Date, 'now').mockImplementation(() => now)
  await signIn()
  loseReportResponse = true
  collector.subscribe(state => { if (state.phase === 'collecting' && state.foundCount === 22) collector.stop() })
  await collector.start()
  await settle()
  expect(usage.used).toBe(22)
  now += 8 * DAY_MS
  loseReportResponse = false
  await collector.retryUsageReport()
  expect(usage.used).toBe(22)
  expect(reportBodies).toHaveLength(2)
  expect(reportBodies[0]).toEqual(reportBodies[1])
  expect((await chrome.storage.local.get(STORAGE_KEYS.BING_USAGE_PENDING))[STORAGE_KEYS.BING_USAGE_PENDING]).toEqual([])
})

it('缺少时间的旧匿名待办无法确认幂等窗口，清理而不上报', async () => {
  await chrome.storage.local.set({ [STORAGE_KEYS.BING_USAGE_PENDING]: [{
    identity: 'device:bing-usage-test-device', requestId: 'legacy-anonymous-session', records: 20
  }] })
  const { getBingUsageSession } = await import('@/sites/bing/usage/usageService')
  expect(await getBingUsageSession()).toMatchObject({ used: 0 })
  expect(reportBodies).toEqual([])
  expect((await chrome.storage.local.get(STORAGE_KEYS.BING_USAGE_PENDING))[STORAGE_KEYS.BING_USAGE_PENDING]).toEqual([])
})

it('RPC 拒绝非法记录数和幂等键，不发 HTTP', async () => {
  const { ChromeRpcTransport } = await import('@/core/rpc/transports/ChromeRpcTransport')
  const transport = new ChromeRpcTransport('background')
  try {
    await expect(transport.call('reportBingUsage', { records: -1, requestId: 'bad', identity: 'device:x' })).rejects.toThrow(/合法/)
    expect(fetchMock).not.toHaveBeenCalled()
  } finally { transport.destroy() }
})

it('固定查询身份到首次 HTTP 注入之间换号，拒绝用新账号发送旧请求', async () => {
  const { storageManager } = await import('@/core/storage')
  const originalGet = storageManager.get.bind(storageManager)
  vi.spyOn(storageManager, 'get').mockImplementation(async <T>(key: string) => {
    if (key === STORAGE_KEYS.DEVICE_ID) await signIn()
    return originalGet<T>(key)
  })
  const { getBingUsageSession } = await import('@/sites/bing/usage/usageService')
  await expect(getBingUsageSession()).rejects.toThrow()
  expect(fetchMock).not.toHaveBeenCalled()
})
