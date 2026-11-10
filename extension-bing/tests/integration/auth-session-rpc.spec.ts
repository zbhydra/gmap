/** 真实 popup/content RPC、登录 owner 与 HTTP 提交链；只控制浏览器 API 和 HTTP 出口。 */

import { webcrypto } from 'node:crypto'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BackgroundMessageRouter } from '@/background/services/BackgroundMessageRouter'
import { BackgroundChannel } from '@/popup/rpc/background.rpc'
import { BackgroundChannel as ContentChannel } from '@/content/rpc/background.rpc'
import { useAuthStore } from '@/popup/stores/authStore'
import { API, STORAGE_KEYS } from '@/core/api/config'
import { readAuthSnapshot } from '@/core/api/auth/session'
import type { JsonValue, RpcResponse, RpcServeResult } from '@/core/rpc/types'
import { ChromeRpcTransport } from '@/core/rpc/transports/ChromeRpcTransport'
import type { UserInfo } from '@/core/types'
import { chrome as chromeMock } from '../mocks/chrome-api'
import { storageManager } from '@/core/storage'

const userA: UserInfo = {
  user_id: 1, email: 'a@example.test', full_name: 'Account A', avatar_url: null, created_at: 1
}
const userB: UserInfo = { ...userA, user_id: 2, email: 'b@example.test', full_name: 'Account B' }
const snapshotB = { accessToken: 'access-b', refreshToken: 'refresh-b', userInfo: userB }
const contentTab: chrome.tabs.Tab = {
  id: 1, index: 0, pinned: false, highlighted: false, windowId: 1, active: true,
  incognito: false, frozen: false, selected: true, discarded: false, autoDiscardable: true, groupId: -1
}
const originalSendMessage = chrome.runtime.sendMessage
let router: BackgroundMessageRouter
let sender: chrome.runtime.MessageSender
let expireA: boolean
let refresh: ReturnType<typeof deferred<Response>>
let refreshStarted: ReturnType<typeof deferred<void>>
let meResponse: ReturnType<typeof deferred<Response>> | null
let meStarted: ReturnType<typeof deferred<void>>
let logoutResponse: ReturnType<typeof deferred<Response>> | null
let logoutStarted: ReturnType<typeof deferred<void>>
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>
let subscriptionPeriod: 'free' | 'month'
let failSubscription: boolean
let subscriptionResponse: ReturnType<typeof deferred<Response>> | null
let subscriptionStarted: ReturnType<typeof deferred<void>>

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

function response(data: JsonValue, status = 200): Response {
  return new Response(JSON.stringify({ code: status === 200 ? 10000 : 10013, data }), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}

function refreshResponse(): Response {
  return response({ access_token: 'access-a2', refresh_token: 'refresh-a2' })
}

function enrich(): Promise<string> {
  sender = { id: chrome.runtime.id, tab: contentTab, url: 'https://www.bing.com/maps' }
  const channel = new ContentChannel()
  const result = channel.enrichBusinesses({ businesses: [] }).then(
    () => 'success',
    error => error instanceof Error ? 'rejected' : 'invalid-error'
  ).finally(() => channel.destroy())
  sender = { id: chrome.runtime.id, url: chrome.runtime.getURL('src/popup.html') }
  return result
}

function attachRpcListener(): void {
  router.setupListener()
  const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)?.[0]
  if (!listener) throw new Error('background RPC listener 未注册')
  Object.assign(chrome.runtime, {
    sendMessage: vi.fn((message: JsonValue) => new Promise<RpcResponse<RpcServeResult> | undefined>(resolve => {
      listener(message, sender, resolve)
    }))
  })
}

async function restartBackgroundRouter() {
  router.destroy()
  vi.stubGlobal('__API_BASE_URL__', API.BASE_URL)
  vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://www.example.com')
  vi.stubGlobal('__DEV__', false)
  vi.stubGlobal('__ALI_SLS_MARK_CONFIG__', { enabled: false })
  vi.resetModules()
  const { BackgroundMessageRouter: FreshRouter } = await import('@/background/services/BackgroundMessageRouter')
  router = new FreshRouter()
  attachRpcListener()
  sender = { id: chrome.runtime.id, tab: contentTab, url: 'https://www.bing.com/maps' }
  return import('@/background/services/backgroundStores')
}

/** 仅轮换集成用例派发 storage 事件，覆盖浏览器写入与 watcher 的真实连接。 */
async function dispatchStorageWrites(): Promise<void> {
  const { storageManager: currentStorage } = await import('@/core/storage')
  const originalSetMany = currentStorage.setMany.bind(currentStorage)
  vi.spyOn(currentStorage, 'setMany').mockImplementation(async values => {
    const previous = await currentStorage.getAll()
    await originalSetMany(values)
    const changes: Record<string, chrome.storage.StorageChange> = {}
    for (const [key, newValue] of Object.entries(values)) {
      if (JSON.stringify(previous[key]) !== JSON.stringify(newValue)) {
        changes[key] = { oldValue: previous[key], newValue }
      }
    }
    for (const [listener] of vi.mocked(chrome.storage.onChanged.addListener).mock.calls) {
      listener(changes, 'local')
    }
  })
}

async function readyCollector() {
  const { BingCollector } = await import('@/sites/bing/content/collector')
  const gate = await import('@/sites/bing/content/gate')
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

beforeEach(async () => {
  vi.clearAllMocks()
  vi.stubGlobal('crypto', webcrypto)
  await chrome.storage.local.clear()
  await chrome.storage.local.set({
    [STORAGE_KEYS.ACCESS_TOKEN]: 'access-a',
    [STORAGE_KEYS.REFRESH_TOKEN]: 'refresh-a',
    [STORAGE_KEYS.USER_INFO]: { ...userA }
  })
  setActivePinia(createPinia())
  expireA = false
  subscriptionPeriod = 'free'
  failSubscription = false
  subscriptionResponse = null
  subscriptionStarted = deferred<void>()
  refresh = deferred<Response>()
  refreshStarted = deferred<void>()
  meResponse = null
  meStarted = deferred<void>()
  logoutResponse = null
  logoutStarted = deferred<void>()
  sender = { id: chrome.runtime.id, url: chrome.runtime.getURL('src/popup.html') }
  vi.mocked(chrome.identity.launchWebAuthFlow).mockImplementation((_details, callback) => {
    const url = 'https://test-extension-id.chromiumapp.org/extension-login#code=login-b'
    callback?.(url)
    return Promise.resolve(url)
  })
  fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, options) => {
    const path = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url).pathname
    if (path === API.ENDPOINTS.PLUGIN_VERSION_CHECK) return response({ status: 'current', update: null })
    const token = new Headers(options?.headers).get('Authorization')
    if (path === API.ENDPOINTS.AUTH_REFRESH) {
      refreshStarted.resolve()
      return refresh.promise
    }
    if (path === API.ENDPOINTS.AUTH_EXTENSION_LOGIN_EXCHANGE) {
      return response({ extension_access_token: 'access-b', extension_refresh_token: 'refresh-b', user: { ...userB } })
    }
    if (path === API.ENDPOINTS.AUTH_LOGOUT) {
      logoutStarted.resolve()
      return logoutResponse ? logoutResponse.promise : response(null)
    }
    if (path === API.ENDPOINTS.SUBSCRIPTION_STATUS) {
      subscriptionStarted.resolve()
      if (expireA && token === 'Bearer access-a') return response(null, 401)
      if (failSubscription) throw new TypeError('subscription offline')
      if (subscriptionResponse) return subscriptionResponse.promise
      return response({ status: 'active', period: subscriptionPeriod, display_name: subscriptionPeriod, expires_at: null })
    }
    if (path === API.ENDPOINTS.AUTH_ME) {
      if (meResponse && token === 'Bearer access-a') {
        meStarted.resolve()
        return meResponse.promise
      }
      return response({ ...(token === 'Bearer access-b' ? userB : userA) })
    }
    if (path === API.ENDPOINTS.MAPS_USAGE || path === API.ENDPOINTS.MAPS_USAGE_REPORT) {
      return response({ used: 0, total: 100000, period: '2026-11', exhausted: false, deducted: true })
    }
    if (path === API.ENDPOINTS.MAPS_ENRICH) {
      return expireA && token === 'Bearer access-a'
        ? response(null, 401)
        : response({ results: [], partial: false })
    }
    throw new Error(`认证测试出现未声明的 HTTP 路径: ${path}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  router = new BackgroundMessageRouter()
  attachRpcListener()
})

afterEach(async () => {
  router.destroy()
  await readAuthSnapshot()
  Object.assign(chrome.runtime, { sendMessage: originalSendMessage })
  vi.restoreAllMocks()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it.each([false, true])('刷新挂起时 popup 退出，换号=%s，旧成功响应不提交也不重试', async switchAccount => {
  const store = useAuthStore()
  await store.initialize()
  expect(store.user).toEqual(userA)
  expireA = true
  const oldRequest = enrich()
  await refreshStarted.promise

  await store.logout()
  expect(await readAuthSnapshot()).toEqual({ accessToken: null, refreshToken: null, userInfo: null })
  if (switchAccount) {
    const channel = new BackgroundChannel()
    expect(await channel.openExtensionLogin()).toEqual({ opened: true })
    channel.destroy()
    await store.initialize()
    expect(store.user).toEqual(userB)
  }
  refresh.resolve(refreshResponse())

  expect(await oldRequest).toBe('rejected')
  expect(await readAuthSnapshot()).toEqual(switchAccount ? snapshotB : {
    accessToken: null, refreshToken: null, userInfo: null
  })
  const enrichCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith(API.ENDPOINTS.MAPS_ENRICH))
  expect(enrichCalls).toHaveLength(1)
  expect(new Headers(enrichCalls[0][1]?.headers).get('Authorization')).toBe('Bearer access-a')
})

it('普通并发 401 共享一次 background 刷新，两个原请求使用刷新后的 token 重试', async () => {
  expireA = true
  const first = enrich()
  const second = enrich()
  await refreshStarted.promise
  await readAuthSnapshot()
  refresh.resolve(refreshResponse())

  expect(await Promise.all([first, second])).toEqual(['success', 'success'])
  expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith(API.ENDPOINTS.AUTH_REFRESH))).toHaveLength(1)
  expect(await readAuthSnapshot()).toEqual({ accessToken: 'access-a2', refreshToken: 'refresh-a2', userInfo: userA })
  const retries = fetchMock.mock.calls.filter(([url, options]) =>
    String(url).endsWith(API.ENDPOINTS.MAPS_ENRICH) && new Headers(options?.headers).get('Authorization') === 'Bearer access-a2'
  )
  expect(retries).toHaveLength(2)
  const pairWrites = chromeMock.storage.local.set.mock.calls.filter(([value]) => value[STORAGE_KEYS.ACCESS_TOKEN] === 'access-a2')
  expect(pairWrites).toEqual([[{ [STORAGE_KEYS.ACCESS_TOKEN]: 'access-a2', [STORAGE_KEYS.REFRESH_TOKEN]: 'refresh-a2' }]])
})

it('旧刷新认证失败及旧 auth/me 成功响应都不能清理或回写新账号', async () => {
  expireA = true
  const oldRequest = enrich()
  await refreshStarted.promise
  const store = useAuthStore()
  meResponse = deferred<Response>()
  const oldValidation = store.initialize()
  await meStarted.promise
  await store.logout()
  const channel = new BackgroundChannel()
  expect(await channel.openExtensionLogin()).toEqual({ opened: true })
  channel.destroy()

  refresh.resolve(response(null, 401))
  meResponse.resolve(response({ ...userA, full_name: 'Late A' }))
  expect(await oldRequest).toBe('rejected')
  await oldValidation
  expect(await readAuthSnapshot()).toEqual(snapshotB)
  expect(store.user).toEqual(userB)
})

it('认证 RPC 只允许扩展页调用且不返回 token', async () => {
  const channel = new BackgroundChannel()
  expect(await channel.getAuthState()).toEqual(userA)
  channel.destroy()
  sender = { id: chrome.runtime.id, tab: contentTab, url: 'https://www.bing.com/maps' }
  const transport = new ChromeRpcTransport('background')
  await expect(transport.call('logout')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  transport.destroy()
  expect((await readAuthSnapshot()).accessToken).toBe('access-a')
})

it('刷新已提交但原请求仍在等待重试时换号，不使用旧 token 或新账号重试', async () => {
  vi.useFakeTimers()
  const written = deferred<void>()
  const originalSetMany = storageManager.setMany.bind(storageManager)
  vi.spyOn(storageManager, 'setMany').mockImplementation(async values => {
    await originalSetMany(values)
    if (values[STORAGE_KEYS.ACCESS_TOKEN] === 'access-a2') written.resolve()
  })
  expireA = true
  const oldRequest = enrich()
  await refreshStarted.promise
  refresh.resolve(refreshResponse())
  await written.promise
  await readAuthSnapshot()

  const store = useAuthStore()
  await store.logout()
  const channel = new BackgroundChannel()
  expect(await channel.openExtensionLogin()).toEqual({ opened: true })
  channel.destroy()
  await vi.advanceTimersByTimeAsync(API.RETRY_DELAY)

  expect(await oldRequest).toBe('rejected')
  expect(await readAuthSnapshot()).toEqual(snapshotB)
  expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith(API.ENDPOINTS.MAPS_ENRICH))).toHaveLength(1)
})

it('退出读取凭据时真实401刷新提交排队，读取与删除之间不能留下新凭据', async () => {
  const store = useAuthStore()
  await store.initialize()
  expireA = true
  const oldRequest = enrich()
  await refreshStarted.promise

  const reading = deferred<void>()
  const releaseRead = deferred<void>()
  const originalGet = storageManager.get.bind(storageManager)
  let pausedRead = false
  vi.spyOn(storageManager, 'get').mockImplementation(async <T>(key: string) => {
    const value = await originalGet<T>(key)
    if (key === STORAGE_KEYS.ACCESS_TOKEN && !pausedRead) {
      pausedRead = true
      reading.resolve()
      await releaseRead.promise
    }
    return value
  })
  const authSession = await import('@/core/api/auth/session')
  const originalCommit = authSession.commitRefreshedTokens
  const queued = deferred<void>()
  vi.spyOn(authSession, 'commitRefreshedTokens').mockImplementation((previous, next) => {
    const result = originalCommit(previous, next)
    queued.resolve()
    return result
  })

  const logout = store.logout()
  await reading.promise
  refresh.resolve(refreshResponse())
  await queued.promise
  releaseRead.resolve()
  const [result] = await Promise.all([oldRequest, logout])

  expect(result).toBe('rejected')
  expect(await readAuthSnapshot()).toEqual({ accessToken: null, refreshToken: null, userInfo: null })
  expect(store.user).toBeNull()
  const revocation = fetchMock.mock.calls.find(([url]) => String(url).endsWith(API.ENDPOINTS.AUTH_LOGOUT))
  expect(new Headers(revocation?.[1]?.headers).get('Authorization')).toBe('Bearer access-a')
})

it('A撤销未返回时popup已显示游客再登录B，旧退出完成后仍显示B', async () => {
  const store = useAuthStore()
  await store.initialize()
  logoutResponse = deferred<Response>()
  const logout = store.logout()
  await logoutStarted.promise
  await store.initialize()
  expect(store.user).toBeNull()

  const channel = new BackgroundChannel()
  expect(await channel.openExtensionLogin()).toEqual({ opened: true })
  channel.destroy()
  await store.initialize()
  expect(store.user).toEqual(userB)

  logoutResponse.resolve(response(null))
  await logout
  expect(store.user).toEqual(userB)
  expect(await readAuthSnapshot()).toEqual(snapshotB)
})

it('core initialize 并发调用等待同一次真实验活，完成后可再次初始化', async () => {
  await restartBackgroundRouter()
  const { useAuthStore: useCoreAuthStore } = await import('@/core/stores/authStore')
  const store = useCoreAuthStore(createPinia())
  vi.useFakeTimers()
  meResponse = deferred<Response>()
  const first = store.initialize()
  await meStarted.promise
  let secondFinished = false
  const second = store.initialize().then(() => { secondFinished = true })
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(secondFinished).toBe(false)
    expect(store.isAuthenticated).toBe(false)
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith(API.ENDPOINTS.AUTH_ME))).toHaveLength(1)
  } finally {
    meResponse.resolve(response({ ...userA }))
    await Promise.all([first, second])
  }
  expect(store.isAuthenticated).toBe(true)
  expect(store.user).toEqual(userA)
  expect(store.token).toBe('access-a')
  meResponse = null
  await store.initialize()
  expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith(API.ENDPOINTS.AUTH_ME))).toHaveLength(2)
})

it('background ensure 并发调用在真实初始化期间均等待认证恢复', async () => {
  const background = await restartBackgroundRouter()
  vi.useFakeTimers()
  meResponse = deferred<Response>()
  const first = background.ensureAuthStoreHydrated()
  await meStarted.promise
  let secondFinished = false
  const second = background.ensureAuthStoreHydrated().then(() => { secondFinished = true })
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(secondFinished).toBe(false)
    expect(background.getBackgroundAuthStore().isAuthenticated).toBe(false)
  } finally {
    meResponse.resolve(response({ ...userA }))
    await Promise.all([first, second])
  }
  expect(background.getBackgroundAuthStore().isAuthenticated).toBe(true)
  expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith(API.ENDPOINTS.AUTH_ME))).toHaveLength(1)
})

it.each([1, 4])('冷启动第 %s 次 storage 读取失败后清除在途状态，下一次 ensure 可重试', async failAt => {
  const background = await restartBackgroundRouter()
  const { storageManager: currentStorage } = await import('@/core/storage')
  const originalGet = currentStorage.get.bind(currentStorage)
  let reads = 0
  vi.spyOn(currentStorage, 'get').mockImplementation(async <T>(key: string) => {
    if (++reads === failAt) throw new Error('ISSUE-027 storage 读取失败')
    return originalGet<T>(key)
  })
  const results = await Promise.allSettled([
    background.ensureAuthStoreHydrated(),
    background.ensureAuthStoreHydrated()
  ])
  expect(results.map(result => result.status)).toEqual(failAt === 1
    ? ['rejected', 'rejected']
    : ['fulfilled', 'fulfilled'])
  expect(background.getBackgroundAuthStore().isAuthenticated).toBe(false)
  await background.ensureAuthStoreHydrated()
  expect(background.getBackgroundAuthStore().isAuthenticated).toBe(true)
  expect(background.getBackgroundAuthStore().user).toEqual(userA)
})

it.each([false, true])('冷启动验活期间认证变化后并发 ensure 收敛，换号=%s，下一次仍可恢复', async switchAccount => {
  const background = await restartBackgroundRouter()
  await dispatchStorageWrites()
  vi.useFakeTimers()
  meResponse = deferred<Response>()
  const first = background.ensureAuthStoreHydrated()
  await meStarted.promise
  const { authApi } = await import('@/core/api')
  await authApi.logout()
  if (switchAccount) {
    const channel = new BackgroundChannel()
    await channel.openExtensionLogin()
    channel.destroy()
  }
  const second = background.ensureAuthStoreHydrated()
  meResponse.resolve(response({ ...userA }))
  await Promise.all([first, second])
  const store = background.getBackgroundAuthStore()
  expect(store.user).toEqual(switchAccount ? userB : null)
  expect(store.token).toBe(switchAccount ? 'access-b' : null)

  if (!switchAccount) {
    const channel = new BackgroundChannel()
    await channel.openExtensionLogin()
    channel.destroy()
  }
  await background.ensureAuthStoreHydrated()
  expect(store.user).toEqual(userB)
  expect(store.isAuthenticated).toBe(true)
})

it('冷 SW 两路门控与 Start 重叠时等待验活，Pro 首轮采集超过免费 20 条', async () => {
  await restartBackgroundRouter()
  vi.useFakeTimers()
  subscriptionPeriod = 'month'
  meResponse = deferred<Response>()
  const channel = new ContentChannel()
  const first = channel.getGateState({})
  await meStarted.promise
  const gate = await import('@/sites/bing/content/gate')
  const collector = await readyCollector()
  collector.subscribe(state => {
    if (state.foundCount === 22) collector.stop()
  })
  let secondFinished = false
  const second = gate.refreshGateState().then(() => { secondFinished = true })
  const started = collector.start()
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(secondFinished).toBe(false)
    expect(collector.getState().foundCount).toBe(0)
  } finally {
    meResponse.resolve(response({ ...userA }))
    await Promise.all([first, second, started])
    channel.destroy()
    await vi.waitFor(() => expect(collector.getState().finishing).toBeNull())
    collector.destroy()
  }
  expect(await first).toEqual({ authenticated: true, isPro: true })
  expect(gate.getGateState()).toEqual({ authenticated: true, isPro: true })
  expect(collector.getState()).toMatchObject({ foundCount: 22, freeLimitReached: false })
  expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith(API.ENDPOINTS.AUTH_ME))).toHaveLength(1)
})

it('content 的 force 经真实 RPC 绕过订阅五分钟缓存，购买后立即识别 Pro', async () => {
  await restartBackgroundRouter()
  const channel = new ContentChannel()
  try {
    expect(await channel.getGateState({})).toEqual({ authenticated: true, isPro: false })
    subscriptionPeriod = 'month'
    expect(await channel.getGateState({})).toEqual({ authenticated: true, isPro: false })
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes(API.ENDPOINTS.SUBSCRIPTION_STATUS))).toHaveLength(1)

    expect(await channel.getGateState({ force: true })).toEqual({ authenticated: true, isPro: true })
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes(API.ENDPOINTS.SUBSCRIPTION_STATUS))).toHaveLength(2)
    expect((await readAuthSnapshot()).userInfo).toEqual(userA)

    const transport = new ChromeRpcTransport('background')
    try {
      await expect(transport.call('getGateState', { force: 'true' })).rejects.toThrow(/force/)
    } finally {
      transport.destroy()
    }
  } finally {
    channel.destroy()
  }
})

it('热 SW 的订阅 401 轮换派发 storage 事件后不清态，Start 首轮仍采集超过 20 条', async () => {
  const background = await restartBackgroundRouter()
  await dispatchStorageWrites()
  const gate = await import('@/sites/bing/content/gate')
  subscriptionPeriod = 'month'
  await gate.refreshGateState({ force: true })
  const store = background.getBackgroundAuthStore()
  const clearAuth = vi.spyOn(store, 'clearAuth')
  const unwatch = gate.watchGateAuthStorage()
  const collector = await readyCollector()
  collector.subscribe(state => {
    if (state.foundCount === 22) collector.stop()
  })
  expireA = true
  try {
    const started = collector.start()
    await refreshStarted.promise
    refresh.resolve(refreshResponse())
    await started
    await gate.refreshGateState({ force: true })

    expect(clearAuth).not.toHaveBeenCalled()
    expect(store.token).toBe('access-a2')
    expect(store.isAuthenticated).toBe(true)
    expect(gate.getGateState()).toEqual({ authenticated: true, isPro: true })
    expect(collector.getState()).toMatchObject({ foundCount: 22, freeLimitReached: false })
    expect(chrome.storage.onChanged.addListener).toHaveBeenCalled()
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith(API.ENDPOINTS.AUTH_REFRESH))).toHaveLength(1)
  } finally {
    unwatch()
    await vi.waitFor(() => expect(collector.getState().finishing).toBeNull())
    collector.destroy()
  }
})

it('订阅请求期间退出时门控返回真实的未认证状态', async () => {
  await restartBackgroundRouter()
  const channel = new ContentChannel()
  try {
    await channel.getGateState({})
    subscriptionResponse = deferred<Response>()
    subscriptionStarted = deferred<void>()
    const pending = channel.getGateState({ force: true })
    await subscriptionStarted.promise
    await chrome.storage.local.clear()
    subscriptionResponse.resolve(response({ status: 'active', period: 'month', display_name: 'Pro', expires_at: null }))

    expect(await pending).toEqual({ authenticated: false, isPro: false })
  } finally {
    channel.destroy()
  }
})

it('冷 SW 订阅失败使 force RPC 抛错，content 与 Start 保留 Pro；成功免费响应才降级', async () => {
  await restartBackgroundRouter()
  const gate = await import('@/sites/bing/content/gate')
  subscriptionPeriod = 'month'
  await gate.refreshGateState({ force: true })
  const collector = await readyCollector()
  collector.subscribe(state => {
    if (state.foundCount === 22) collector.stop()
  })
  await restartBackgroundRouter()
  failSubscription = true
  const channel = new ContentChannel()
  try {
    await expect(channel.getGateState({ force: true })).rejects.toThrow('subscription offline')
    await gate.refreshGateState({ force: true })
    expect(gate.getGateState()).toEqual({ authenticated: true, isPro: true })
    await collector.start()
    expect(collector.getState()).toMatchObject({ foundCount: 22, freeLimitReached: false })
    failSubscription = false
    subscriptionPeriod = 'free'
    await gate.refreshGateState({ force: true })
    expect(gate.getGateState()).toEqual({ authenticated: true, isPro: false })
  } finally {
    channel.destroy()
    await vi.waitFor(() => expect(collector.getState().finishing).toBeNull())
    collector.destroy()
  }
})
