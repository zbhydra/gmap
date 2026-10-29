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
      return response({ status: 'active', period: 'free', display_name: 'Free', expires_at: null })
    }
    if (path === API.ENDPOINTS.AUTH_ME) {
      if (meResponse && token === 'Bearer access-a') {
        meStarted.resolve()
        return meResponse.promise
      }
      return response({ ...(token === 'Bearer access-b' ? userB : userA) })
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
  router.setupListener()
  const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)?.[0]
  if (!listener) throw new Error('background RPC listener 未注册')
  Object.assign(chrome.runtime, {
    sendMessage: vi.fn((message: JsonValue) => new Promise<RpcResponse<RpcServeResult> | undefined>(resolve => {
      listener(message, sender, resolve)
    }))
  })
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
