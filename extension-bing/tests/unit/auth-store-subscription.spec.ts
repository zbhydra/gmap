/**
 * AuthStore 订阅态与官网 token 收编单测（016 §5 / §4.3 最小扩展）。
 *
 * 覆盖：Pro 判定（付费档白名单）、订阅缓存 TTL（5 分钟内不发重复请求）、
 * force/失效强拉、查询失败回退缓存、applyWebsiteToken 有效/无效两路。
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
  subscriptionStatus: vi.fn(),
  storageGet: vi.fn(),
  storageSet: vi.fn(),
  storageRemove: vi.fn()
}))

vi.mock('../../src/core/api', () => ({
  authApi: {
    getStoredUserInfo: mocks.getStoredUserInfo,
    getAccessToken: mocks.getAccessToken,
    clearLocalAuth: mocks.clearLocalAuth,
    getCurrentUser: mocks.getCurrentUser,
    logout: mocks.logout
  },
  subscriptionApi: { getStatus: mocks.subscriptionStatus },
  STORAGE_KEYS: { ACCESS_TOKEN: 'auth_access_token', USER_INFO: 'auth_user_info' }
}))

vi.mock('../../src/core/storage', () => ({
  storageManager: {
    get: mocks.storageGet,
    set: mocks.storageSet,
    setMany: vi.fn(),
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

function subscriptionOf(period: SubscriptionStatus['period']): SubscriptionStatus {
  return {
    status: 'active',
    period,
    display_name: period === 'month' ? 'Unlimited' : 'Free',
    expires_at: null,
    daily_limit: -1,
    used: 0,
    remaining: -1,
    reset_date: '2026-08-30'
  }
}

async function loggedInStore() {
  const { useAuthStore } = await import('../../src/core/stores/authStore')
  const store = useAuthStore()
  mocks.getCurrentUser.mockResolvedValue(user)
  await store.applyWebsiteToken('token-1')
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
    mocks.storageSet.mockResolvedValue(undefined)
    mocks.storageRemove.mockResolvedValue(undefined)
    mocks.clearLocalAuth.mockResolvedValue(undefined)
    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('free'))
  })

  it('未登录恒为免费（isPro = false，不查订阅）', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()

    expect(store.isPro).toBe(false)
    await store.refreshSubscription()
    expect(mocks.subscriptionStatus).not.toHaveBeenCalled()
  })

  it('付费档（month）判 Pro；free/unavailable 判免费（显式白名单）', async () => {
    const store = await loggedInStore()

    mocks.subscriptionStatus.mockResolvedValue(subscriptionOf('month'))
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

  it('applyWebsiteToken 有效：token 落 storage、账号态生效、订阅缓存失效重拉', async () => {
    const store = await loggedInStore()

    expect(mocks.storageSet).toHaveBeenCalledWith('auth_access_token', 'token-1')
    expect(mocks.getCurrentUser).toHaveBeenCalledOnce()
    expect(store.isAuthenticated).toBe(true)
    expect(store.displayName).toBe('Sub User')
  })

  it('applyWebsiteToken 失败(无既有会话)：回滚本次写入、清净残留并抛出', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()
    mocks.getCurrentUser.mockRejectedValue(
      Object.assign(new Error('error code:10104'), { status: 401 })
    )

    await expect(store.applyWebsiteToken('bad-token')).rejects.toThrow()
    expect(mocks.clearLocalAuth).toHaveBeenCalledOnce()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isPro).toBe(false)
  })

  it('applyWebsiteToken 网络失败(有既有会话)：保留旧会话不登出', async () => {
    const store = await loggedInStore()
    mocks.getCurrentUser.mockRejectedValue(new TypeError('fetch failed'))

    await expect(store.applyWebsiteToken('token-2')).rejects.toThrow()
    // 回滚本次写入:内存与 storage 恢复旧 token/USER_INFO
    expect(store.token).toBe('token-1')
    expect(store.user).toMatchObject({ user_id: 9 })
    expect(store.isAuthenticated).toBe(true)
    expect(mocks.storageSet).toHaveBeenCalledWith('auth_access_token', 'token-1')
    expect(mocks.storageSet).toHaveBeenCalledWith('auth_user_info', expect.objectContaining({ user_id: 9 }))
    // 既有会话不受影响:不清持久化
    expect(mocks.clearLocalAuth).not.toHaveBeenCalled()
  })

  it('applyWebsiteToken 401 无效 token(有既有会话)：回滚本次写入且不清旧会话', async () => {
    const store = await loggedInStore()
    mocks.getCurrentUser.mockRejectedValue(
      Object.assign(new Error('error code:10104'), { status: 401 })
    )

    await expect(store.applyWebsiteToken('bad-token-2')).rejects.toThrow()
    expect(store.token).toBe('token-1')
    expect(store.user).toMatchObject({ user_id: 9 })
    expect(store.isAuthenticated).toBe(true)
    expect(mocks.storageSet).toHaveBeenCalledWith('auth_access_token', 'token-1')
    expect(mocks.clearLocalAuth).not.toHaveBeenCalled()
  })
})
