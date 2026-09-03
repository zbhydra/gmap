/** 敏感 API 请求不得记录请求体，登录 exchange 也不得自动重试。 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('../../src/core/api', () => ({ httpClient: { post: mocks.post } }))

import { authApi } from '../../src/core/api/auth/api'
import { integrationApi } from '../../src/core/api/integration/api'

describe('敏感 API 请求选项', () => {
  beforeEach(() => {
    mocks.post.mockReset()
  })

  it('登录 exchange 跳过重试、请求日志和全局错误 toast', async () => {
    mocks.post.mockResolvedValue({
      extension_access_token: 'access',
      extension_refresh_token: 'refresh',
      user: { user_id: 1 }
    })

    await authApi.exchangeExtensionLogin({ code: 'code', code_verifier: 'verifier' })

    expect(mocks.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        requireAuth: false,
        skipRetry: true,
        skipRequestLog: true,
        skipErrorToast: true
      })
    )
  })

  it('HubSpot token 请求不记录请求体', async () => {
    mocks.post.mockResolvedValue({ synced: 1 })
    const payload = { token: 'hubspot-token', businesses: [] }

    await integrationApi.syncBusinessesToHubspot(payload)

    expect(mocks.post).toHaveBeenCalledWith(expect.any(String), payload, {
      skipErrorToast: true,
      skipRequestLog: true
    })
  })
})
