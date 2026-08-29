import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../../src/core/api/client/types'
import type { ExtensionTokenExchangeResponse } from '../../src/core/api/auth/api'
import type { StorageValue } from '../../src/core/storage'

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  storage: new Map<string, StorageValue>(),
  get: vi.fn(),
  setMany: vi.fn()
}))

vi.mock('../../src/core/api/index', () => ({
  httpClient: {
    post: mocks.post
  }
}))

vi.mock('../../src/core/storage', () => ({
  storageManager: {
    get: mocks.get,
    setMany: mocks.setMany,
    set: vi.fn(),
    remove: vi.fn()
  }
}))

describe('website token exchange auth api', () => {
  beforeEach(() => {
    vi.stubGlobal('__DEV__', false)
    vi.stubGlobal('__API_BASE_URL__', 'https://tg-download-api.telegramdownloadmedia.com')
    vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://telegramdownloadmedia.com')
    vi.resetModules()
    mocks.post.mockReset()
    mocks.setMany.mockReset()
    mocks.storage.clear()
    mocks.get.mockImplementation((key: string) => Promise.resolve(mocks.storage.get(key) ?? null))
    mocks.setMany.mockImplementation((items: Record<string, StorageValue>) => {
      for (const [key, value] of Object.entries(items)) {
        mocks.storage.set(key, value)
      }
      return Promise.resolve()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stores extension auth keys after a successful website token exchange', async () => {
    const { STORAGE_KEYS } = await import('../../src/core/api/config')
    mocks.storage.set(STORAGE_KEYS.ACCESS_TOKEN, 'old-extension-access')
    mocks.storage.set(STORAGE_KEYS.REFRESH_TOKEN, 'old-extension-refresh')
    const response: ExtensionTokenExchangeResponse = {
      extension_access_token: 'new-extension-access',
      extension_refresh_token: 'new-extension-refresh',
      token_type: 'bearer',
      expires_in: 86400,
      user: {
        user_id: 2,
        email: 'new@example.com',
        full_name: 'New User',
        avatar_url: null,
        created_at: 200
      }
    }
    mocks.post.mockResolvedValue(response)

    const { authApi } = await import('../../src/core/api/auth/api')
    const result = await authApi.exchangeWebsiteTokenForExtensionAuth('web-access-token')

    expect(result).toEqual(response)
    expect(mocks.post).toHaveBeenCalledWith(
      '/api/client/auth/extension-token',
      {
        old_extension_access_token: 'old-extension-access',
        old_extension_refresh_token: 'old-extension-refresh'
      },
      expect.objectContaining({
        requireAuth: false,
        skipErrorToast: true,
        skipRequestLog: true,
        preserveAuthOnUnauthorized: true,
        headers: {
          Authorization: 'Bearer web-access-token'
        }
      })
    )
    expect(mocks.setMany).toHaveBeenCalledWith({
      [STORAGE_KEYS.ACCESS_TOKEN]: 'new-extension-access',
      [STORAGE_KEYS.REFRESH_TOKEN]: 'new-extension-refresh',
      [STORAGE_KEYS.USER_INFO]: {
        user_id: 2,
        email: 'new@example.com',
        full_name: 'New User',
        avatar_url: null,
        created_at: 200
      }
    })
  })

  it('keeps old extension storage when website token exchange returns 401', async () => {
    const { STORAGE_KEYS } = await import('../../src/core/api/config')
    mocks.storage.set(STORAGE_KEYS.ACCESS_TOKEN, 'old-extension-access')
    mocks.storage.set(STORAGE_KEYS.REFRESH_TOKEN, 'old-extension-refresh')
    mocks.post.mockRejectedValue(new ApiError('web token expired', 401, 10013))

    const { authApi } = await import('../../src/core/api/auth/api')

    await expect(authApi.exchangeWebsiteTokenForExtensionAuth('expired-web-token')).rejects.toThrow(
      'web token expired'
    )
    expect(mocks.setMany).not.toHaveBeenCalled()
    expect(mocks.storage.get(STORAGE_KEYS.ACCESS_TOKEN)).toBe('old-extension-access')
    expect(mocks.storage.get(STORAGE_KEYS.REFRESH_TOKEN)).toBe('old-extension-refresh')
  })

  it('does not expose the removed Popup email-code API or configuration', async () => {
    const { authApi } = await import('../../src/core/api/auth/api')
    const { API, STORAGE_KEYS } = await import('../../src/core/api/config')

    expect(authApi).not.toHaveProperty('sendCode')
    expect(authApi).not.toHaveProperty('loginWithEmailCode')
    expect(authApi).not.toHaveProperty('getLastEmail')
    expect(API.ENDPOINTS).not.toHaveProperty('AUTH_SEND_CODE')
    expect(API.ENDPOINTS).not.toHaveProperty('AUTH_EMAIL_LOGIN')
    expect(STORAGE_KEYS).not.toHaveProperty('LAST_EMAIL')
    expect(Object.values(API.ENDPOINTS)).not.toContain('/api/client/auth/send-email-code')
    expect(Object.values(API.ENDPOINTS)).not.toContain('/api/client/auth/email-verify-login')
  })
})
