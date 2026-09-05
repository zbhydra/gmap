/**
 * AuthStore 订阅态与 v3 extension login 提交单测（006 §4.4）。
 *
 * 覆盖：Pro 判定（付费档白名单）、订阅缓存 TTL（5 分钟内不发重复请求）、
 * force/失效强拉、查询失败回退缓存、applyExtensionLogin 有效/失败/快照冲突三路。
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UserInfo } from '../../src/core/types'
import type { SubscriptionStatus } from '../../src/core/api/subscription/types'

const mocks = vi.hoisted(() => ({
  getStoredUserInfo: vi.fn(),
  getAccessToken: vi.fn(),
  clearLocalAuth: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  exchangeExtensionLogin: vi.fn(),
  subscriptionStatus: vi.fn(),
  storageGet: vi.fn(),
  storageSet: vi.fn(),
  storageSetMany: vi.fn(),
  storageRemove: vi.fn()
}))

vi.mock('../../src/core/api', () => ({
  authApi: {
    getStoredUserInfo: mocks.getStoredUserInfo,
    getAccessToken: mocks.getAccessToken,
    clearLocalAuth: mocks.clearLocalAuth,
    getCurrentUser: mocks.getCurrentUser,
    logout: mocks.logout,
    exchangeExtensionLogin: mocks.exchangeExtensionLogin
  },
  subscriptionApi: { getStatus: mocks.subscriptionStatus },
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_INFO: 'auth_user_info'
  }
}))

vi.mock('../../src/core/storage', () => ({
  storageManager: {
    get: mocks.storageGet,
    set: mocks.storageSet,
    setMany: mocks.storageSetMany,
    remove: mocks.storageRemove,
    getAll: vi.fn(),
    onChanged: vi.fn()
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

const user: UserInfo = {
  user_id: 9,
  email: 'sub@example.com',
  full_name: 'Sub User',
  avatar_url: null,
  created_at: 100
}

/** exchange mock 返回的合同完整 token 对。 */
const tokenResponse = {
  extension_access_token: 'token-1',
  extension_refresh_token: 'refresh-1',
  user
}

function subscriptionOf(period: SubscriptionStatus['period']): SubscriptionStatus {
  return {
    status: 'active',
    period,
    display_name: period === 'month' ? 'Unlimited' : 'Free',
    expires_at: null
  }
}

async function loggedInStore() {
  const { useAuthStore } = await import('../../src/core/stores/authStore')
  const store = useAuthStore()
  mocks.exchangeExtensionLogin.mockResolvedValue(tokenResponse)
  await store.applyExtensionLogin('code-1', 'verifier-1')
  // 排空登录事件触发的预热拉取，并清空计数——用例从干净缓存开始
  await new Promise(resolve => setTimeout(resolve, 0))
  store.invalidateSubscription()
  mocks.subscriptionStatus.mockClear()
  return store
}

describe('AuthStore 订阅态与门控判定', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mocks.storageGet.mockResolvedValue(null)
    mocks.storageSet.mockResolvedValue(undefined)
    mocks.storageSetMany.mockResolvedValue(undefined)
    mocks.storageRemove.mockResolvedValue(undefined)
    mocks.clearLocalAuth.mockResolvedValue(undefined)
    mocks.exchangeExtensionLogin.mockResolvedValue(tokenResponse)
    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('free'))
  })

  it('未登录恒为免费（isPro = false，不查订阅）', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()

    expect(store.isPro).toBe(false)
    await store.refreshSubscription()
    expect(mocks.subscriptionStatus).not.toHaveBeenCalled()
  })

  it('付费档（month/quarter/year）判 Pro；free/unavailable 判免费（显式白名单）', async () => {
    const store = await loggedInStore()

    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('month'))
    await store.refreshSubscription({ force: true })
    expect(store.isPro).toBe(true)

    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('quarter'))
    await store.refreshSubscription({ force: true })
    expect(store.isPro).toBe(true)

    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('year'))
    await store.refreshSubscription({ force: true })
    expect(store.isPro).toBe(true)

    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('free'))
    await store.refreshSubscription({ force: true })
    expect(store.isPro).toBe(false)

    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('unavailable'))
    await store.refreshSubscription({ force: true })
    expect(store.isPro).toBe(false)
  })

  it('缓存 TTL 内复用缓存，不发重复请求', async () => {
    const store = await loggedInStore()
    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('month'))

    const first = await store.refreshSubscription()
    const second = await store.refreshSubscription()

    expect(first?.period).toBe('month')
    expect(second?.period).toBe('month')
    expect(mocks.subscriptionStatus).toHaveBeenCalledTimes(1)
  })

  it('force 与 invalidateSubscription 跳过缓存强拉', async () => {
    const store = await loggedInStore()
    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('month'))
    await store.refreshSubscription()

    await store.refreshSubscription({ force: true })
    expect(mocks.subscriptionStatus).toHaveBeenCalledTimes(2)

    store.invalidateSubscription()
    await store.refreshSubscription()
    expect(mocks.subscriptionStatus).toHaveBeenCalledTimes(3)
  })

  it('订阅查询失败回退上次缓存（可能过期），无缓存返回 null', async () => {
    const store = await loggedInStore()

    // 无缓存即失败 → null（调用方按免费计权）
    mocks.subscriptionStatus.mockRejectedValue(new Error('network down'))
    await expect(store.refreshSubscription()).resolves.toBeNull()

    // 有缓存后失败 → 回退缓存
    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('month'))
    await store.refreshSubscription({ force: true })
    mocks.subscriptionStatus.mockRejectedValue(new Error('network down'))
    await expect(store.refreshSubscription({ force: true })).resolves.toMatchObject({
      period: 'month'
    })
    expect(store.isPro).toBe(true)
  })

  it('并发刷新单飞：共享同一次请求', async () => {
    const store = await loggedInStore()
    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('month'))

    await Promise.all([store.refreshSubscription(), store.refreshSubscription()])
    expect(mocks.subscriptionStatus).toHaveBeenCalledTimes(1)
  })

  it('applyExtensionLogin 有效：三键落 storage、账号态生效、订阅缓存失效重拉', async () => {
    const store = await loggedInStore()

    expect(mocks.exchangeExtensionLogin).toHaveBeenCalledWith({
      code: 'code-1',
      codeVerifier: 'verifier-1',
      oldAccessToken: null,
      oldRefreshToken: null
    })
    expect(mocks.storageSetMany).toHaveBeenCalledWith({
      auth_access_token: 'token-1',
      auth_refresh_token: 'refresh-1',
      auth_user_info: user
    })
    expect(store.isAuthenticated).toBe(true)
    expect(store.displayName).toBe('Sub User')
  })

  it('applyExtensionLogin exchange 失败(无既有会话)：不写任何键、保持未登录', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()
    mocks.exchangeExtensionLogin.mockRejectedValue(new Error('error code:10104'))

    await expect(store.applyExtensionLogin('bad-code', 'verifier-1')).rejects.toThrow()
    expect(mocks.storageSetMany).not.toHaveBeenCalled()
    expect(mocks.clearLocalAuth).not.toHaveBeenCalled()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isPro).toBe(false)
  })

  it('applyExtensionLogin exchange 失败(有既有会话)：旧会话原样保留', async () => {
    const store = await loggedInStore()
    // 有既有会话时快照非空：exchange 请求应携带旧 token 供 best-effort 撤销
    mocks.storageGet.mockImplementation((key: string) => {
      if (key === 'auth_access_token') {
        return Promise.resolve('token-1')
      }
      if (key === 'auth_refresh_token') {
        return Promise.resolve('refresh-1')
      }
      return Promise.resolve(user)
    })
    mocks.exchangeExtensionLogin.mockRejectedValue(new TypeError('fetch failed'))

    await expect(store.applyExtensionLogin('code-2', 'verifier-2')).rejects.toThrow()
    expect(mocks.exchangeExtensionLogin).toHaveBeenCalledWith({
      code: 'code-2',
      codeVerifier: 'verifier-2',
      oldAccessToken: 'token-1',
      oldRefreshToken: 'refresh-1'
    })
    // 旧会话不受一次失败登录影响：无写入、不清持久化
    expect(mocks.storageSetMany).toHaveBeenCalledTimes(1)
    expect(mocks.storageSetMany).toHaveBeenCalledWith({
      auth_access_token: 'token-1',
      auth_refresh_token: 'refresh-1',
      auth_user_info: user
    })
    expect(mocks.clearLocalAuth).not.toHaveBeenCalled()
    expect(store.token).toBe('token-1')
    expect(store.user).toMatchObject({ user_id: 9 })
    expect(store.isAuthenticated).toBe(true)
  })

  it('applyExtensionLogin 快照冲突(提交前 storage 变化)：放弃写入且不动旧会话', async () => {
    const store = await loggedInStore()
    // exchange 前快照为登录态；提交前重读已被并发登出清空 → 全等失败
    let readCount = 0
    mocks.storageGet.mockImplementation((key: string) => {
      readCount += 1
      if (readCount <= 3) {
        if (key === 'auth_access_token') {
          return Promise.resolve('token-1')
        }
        if (key === 'auth_refresh_token') {
          return Promise.resolve('refresh-1')
        }
        return Promise.resolve(user)
      }
      return Promise.resolve(null)
    })

    await expect(store.applyExtensionLogin('code-2', 'verifier-2')).rejects.toThrow(
      /登录态已变化/
    )
    expect(mocks.storageSetMany).toHaveBeenCalledTimes(1)
    expect(mocks.clearLocalAuth).not.toHaveBeenCalled()
    expect(store.isAuthenticated).toBe(true)
  })
})
