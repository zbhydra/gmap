/**
 * Auth Store 的 v3 browser identity 登录回归测试（006 §4.4）。
 *
 * 证明 applyExtensionLogin 提交的三键登录态可以恢复和登出，同时锁定 Popup 内
 * 旧邮箱验证码 action 已从 Store 公共面删除。
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../../src/core/api/client/types'
import type { UserInfo } from '../../src/core/types'

const mocks = vi.hoisted(() => ({
  getStoredUserInfo: vi.fn(),
  getAccessToken: vi.fn(),
  clearLocalAuth: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  exchangeExtensionLogin: vi.fn(),
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

const storedUser: UserInfo = {
  user_id: 7,
  email: 'stored@example.com',
  full_name: 'Stored User',
  avatar_url: null,
  created_at: 100
}

const currentUser: UserInfo = {
  ...storedUser,
  full_name: 'Current User'
}

/** exchange mock 返回的合同完整 token 对。 */
const tokenResponse = {
  extension_access_token: 'extension-access-token',
  extension_refresh_token: 'extension-refresh-token',
  user: currentUser
}

describe('Auth Store v3 extension login', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mocks.getStoredUserInfo.mockResolvedValue(storedUser)
    mocks.getAccessToken.mockResolvedValue('extension-access-token')
    mocks.getCurrentUser.mockResolvedValue(currentUser)
    mocks.clearLocalAuth.mockResolvedValue(undefined)
    mocks.logout.mockResolvedValue(undefined)
    mocks.exchangeExtensionLogin.mockResolvedValue(tokenResponse)
    mocks.storageGet.mockResolvedValue(null)
    mocks.storageSet.mockResolvedValue(undefined)
    mocks.storageSetMany.mockResolvedValue(undefined)
    mocks.storageRemove.mockResolvedValue(undefined)
  })

  it('applyExtensionLogin 提交：token 对 + 用户信息原子落 storage 并同步内存态', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()

    await store.applyExtensionLogin('one-time-code', 'pkce-verifier')

    expect(mocks.exchangeExtensionLogin).toHaveBeenCalledOnce()
    expect(mocks.storageSetMany).toHaveBeenCalledOnce()
    expect(mocks.storageSetMany).toHaveBeenCalledWith({
      auth_access_token: 'extension-access-token',
      auth_refresh_token: 'extension-refresh-token',
      auth_user_info: currentUser
    })
    expect(store.token).toBe('extension-access-token')
    expect(store.user).toEqual(currentUser)
    expect(store.isAuthenticated).toBe(true)
    expect(store.displayName).toBe('Current User')
  })

  it('恢复持久化的插件登录态并刷新当前用户', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()

    await store.initialize()

    expect(store.token).toBe('extension-access-token')
    expect(store.user).toEqual(currentUser)
    expect(store.isAuthenticated).toBe(true)
    expect(mocks.getCurrentUser).toHaveBeenCalledOnce()
  })

  it('退出时清除插件本地状态', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()
    await store.initialize()

    await store.logout()

    expect(mocks.logout).toHaveBeenCalledOnce()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.loading).toBe(false)
  })

  it('applyExtensionLogin exchange 失败：不写 storage、内存态保持未登录', async () => {
    mocks.exchangeExtensionLogin.mockRejectedValue(
      new ApiError('error code:10104', 200, 10104)
    )
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()

    await expect(store.applyExtensionLogin('bad-code', 'pkce-verifier')).rejects.toThrow()
    expect(mocks.storageSetMany).not.toHaveBeenCalled()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('applyExtensionLogin 快照冲突（提交前 storage 变化）：放弃写入不写半截', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()
    // exchange 发起前快照 = 已登录（token-1）；提交前重读 = 已被并发登出清空
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
        return Promise.resolve(storedUser)
      }
      return Promise.resolve(null)
    })

    await expect(store.applyExtensionLogin('code', 'verifier')).rejects.toThrow(/登录态已变化/)
    expect(mocks.exchangeExtensionLogin).toHaveBeenCalledOnce()
    // exchange 请求携带旧 token 供服务端 best-effort 撤销
    expect(mocks.exchangeExtensionLogin).toHaveBeenCalledWith({
      code: 'code',
      codeVerifier: 'verifier',
      oldAccessToken: 'token-1',
      oldRefreshToken: 'refresh-1'
    })
    expect(mocks.storageSetMany).not.toHaveBeenCalled()
    expect(store.isAuthenticated).toBe(false)
  })

  it('初始化认证永久失败时清除持久化和内存登录态', async () => {
    mocks.getCurrentUser.mockRejectedValue(
      new ApiError('Refresh returned HTTP 200 without a complete token pair', 401, 10104)
    )
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()

    await store.initialize()

    expect(mocks.clearLocalAuth).toHaveBeenCalledOnce()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('不再暴露 Popup 邮箱验证码 actions', async () => {
    const { useAuthStore } = await import('../../src/core/stores/authStore')
    const store = useAuthStore()

    expect(store).not.toHaveProperty('sendCode')
    expect(store).not.toHaveProperty('login')
    expect(store).not.toHaveProperty('clearError')
  })
})
