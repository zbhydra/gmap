/**
 * Maps 集成单元测试（013 A10，U9 验收行为直接覆盖）：
 * - Drive 授权状态机（getAuthToken 成功/失败/静默取 token/revoke）；
 * - HubSpot 授权状态机（launchWebAuthFlow 授权码换 token / refresh token 刷新）；
 * - Drive multipart 请求体构造与上传（REST multipart，竞品 mod_176 同构）；
 * - background 同步服务的单路失败不阻断（Drive 失败 HubSpot 仍同步）。
 *
 * chrome.identity 与 fetch 均为 mock（占位 client_id 无法真跑授权）。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { STORAGE_KEYS } from '../../src/core/api/config'
import type { MapsIntegrationAuth } from '../../src/sites/maps/settings/integrations'
import {
  DRIVE_FILE_SCOPE,
  MapsIntegrationAuthManager,
  authorizeDrive,
  authorizeHubspot,
  buildDriveMultipartBody,
  buildHubspotBusinesses,
  getDriveAccessToken,
  getHubspotAccessToken,
  revokeDriveAuth,
  uploadCsvToDrive
} from '../../src/sites/maps/settings/integrations'

type StorageData = Record<string, unknown>

const storageData: StorageData = {}

/** 重置进程内 storage 假实现（与 maps-user-settings.spec 同构）。 */
function resetStorage(): void {
  for (const key of Object.keys(storageData)) {
    delete storageData[key]
  }
  Object.assign(chrome.storage.local, {
    get: vi.fn((keys: string | string[] | Record<string, unknown> | null) => {
      const result: Record<string, unknown> = {}
      if (keys === null) {
        Object.assign(result, storageData)
      } else if (typeof keys === 'string') {
        result[keys] = storageData[keys]
      } else if (Array.isArray(keys)) {
        for (const key of keys) {
          if (key in storageData) {
            result[key] = storageData[key]
          }
        }
      } else {
        for (const key of Object.keys(keys)) {
          result[key] = key in storageData ? storageData[key] : keys[key]
        }
      }
      return Promise.resolve(result)
    }),
    set: vi.fn((items: Record<string, unknown>) => {
      Object.assign(storageData, items)
      return Promise.resolve()
    })
  })
}

/** 设置 chrome.runtime.lastError（回调式 identity API 的失败通道）。 */
function setLastError(message: string | null): void {
  (chrome.runtime as { lastError?: { message: string } | undefined }).lastError =
    message === null ? undefined : { message }
}

/** 重置 identity mock 为成功默认行为。 */
function resetIdentityMocks(): void {
  setLastError(null)
  Object.assign(chrome.identity, {
    getAuthToken: vi.fn(
      (
        details: chrome.identity.TokenDetails,
        callback: (result: chrome.identity.GetAuthTokenResult) => void
      ) => {
        callback({ token: `token-for-${details.interactive ? 'interactive' : 'silent'}` })
      }
    ),
    launchWebAuthFlow: vi.fn(
      (
        _options: chrome.identity.WebAuthFlowDetails,
        callback: (redirectUrl?: string) => void
      ) => {
        callback('https://test-extension-id.chromiumapp.org/?code=fresh-code')
      }
    ),
    removeCachedAuthToken: vi.fn(
      (_details: chrome.identity.InvalidTokenDetails, callback: () => void) => {
        callback()
      }
    )
  })
}

interface FetchRoute {
  match: (url: string) => boolean
  respond: () => Response | Promise<Response>
}

/** 按 URL 分流的全局 fetch stub（Drive/HubSpot/SLS 各自独立响应）。 */
function stubFetch(routes: FetchRoute[]): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    for (const route of routes) {
      if (route.match(url)) {
        return route.respond()
      }
    }
    throw new Error(`unexpected fetch: ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/** 预写双集成授权（服务测试用）。 */
async function seedAuth(): Promise<void> {
  const auth: MapsIntegrationAuth = {
    drive: { accessToken: 'seeded-drive-token', grantedAt: Date.now() },
    hubspot: {
      accessToken: 'seeded-hubspot-token',
      refreshToken: 'seeded-refresh-token',
      expiresAt: Date.now() + 30 * 60 * 1000
    }
  }
  storageData[STORAGE_KEYS.MAPS_INTEGRATION_AUTH] = auth
}

beforeEach(() => {
  resetStorage()
  resetIdentityMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
  setLastError(null)
})

describe('Drive 授权状态机', () => {
  it('authorizeDrive 成功：getAuthToken 交互式调用并落 storage（token 快照 + 授权时刻）', async () => {
    const auth = await authorizeDrive()

    expect(auth.accessToken).toBe('token-for-interactive')
    expect(chrome.identity.getAuthToken).toHaveBeenCalledWith(
      { interactive: true, scopes: [DRIVE_FILE_SCOPE] },
      expect.any(Function)
    )
    const stored = await MapsIntegrationAuthManager.getAuth()
    expect(stored.drive?.accessToken).toBe('token-for-interactive')
    expect(stored.drive?.grantedAt).toBeLessThanOrEqual(Date.now())
  })

  it('authorizeDrive 失败（用户关闭弹窗）：抛错且不写授权状态', async () => {
    setLastError('OAuth2 request failed')

    await expect(authorizeDrive()).rejects.toThrow('chrome.identity.getAuthToken 失败')

    const stored = await MapsIntegrationAuthManager.getAuth()
    expect(stored.drive).toBeNull()
  })

  it('getDriveAccessToken 静默失败返回 null（不弹窗打断导出链路）', async () => {
    setLastError('The user has not approved access')

    await expect(getDriveAccessToken()).resolves.toBeNull()
  })

  it('revokeDriveAuth：移除缓存 token + 调吊销端点 + 清 storage 且保留另一侧', async () => {
    await seedAuth()
    const fetchMock = stubFetch([
      {
        match: url => url.startsWith('https://accounts.google.com/o/oauth2/revoke'),
        respond: () => new Response('', { status: 200 })
      }
    ])

    await revokeDriveAuth()

    expect(chrome.identity.removeCachedAuthToken).toHaveBeenCalledWith(
      { token: 'seeded-drive-token' },
      expect.any(Function)
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const stored = await MapsIntegrationAuthManager.getAuth()
    expect(stored.drive).toBeNull()
    expect(stored.hubspot?.refreshToken).toBe('seeded-refresh-token')
  })

  it('revokeDriveAuth：吊销请求失败仍清本地（局部可失败）', async () => {
    await seedAuth()
    stubFetch([
      {
        match: url => url.includes('accounts.google.com'),
        respond: () => Promise.reject(new Error('network down'))
      }
    ])

    await expect(revokeDriveAuth()).resolves.toBeUndefined()

    const stored = await MapsIntegrationAuthManager.getAuth()
    expect(stored.drive).toBeNull()
  })
})

describe('HubSpot 授权状态机', () => {
  it('authorizeHubspot：授权码换 token 落 storage（含长效 refresh token）', async () => {
    const fetchMock = stubFetch([
      {
        match: url => url === 'https://api.hubapi.com/oauth/v1/token',
        respond: () =>
          jsonResponse({ access_token: 'hs-access', refresh_token: 'hs-refresh', expires_in: 1800 })
      }
    ])

    const auth = await authorizeHubspot()

    expect(auth.accessToken).toBe('hs-access')
    expect(auth.refreshToken).toBe('hs-refresh')
    const stored = await MapsIntegrationAuthManager.getAuth()
    expect(stored.hubspot?.accessToken).toBe('hs-access')

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = String(init.body)
    expect(body).toContain('grant_type=authorization_code')
    expect(body).toContain('code=fresh-code')
    expect(body).toContain('client_id=placeholder-hubspot-client-id')
  })

  it('authorizeHubspot 用户关闭弹窗：抛错且不写授权状态', async () => {
    setLastError('Authorization page could not be loaded')

    await expect(authorizeHubspot()).rejects.toThrow('launchWebAuthFlow 失败')

    const stored = await MapsIntegrationAuthManager.getAuth()
    expect(stored.hubspot).toBeNull()
  })

  it('authorizeHubspot 回调缺 code（用户拒绝授权）：抛错', async () => {
    chrome.identity.launchWebAuthFlow = vi.fn(
      (_options: chrome.identity.WebAuthFlowDetails, callback: (redirectUrl?: string) => void) => {
        callback('https://test-extension-id.chromiumapp.org/?error=access_denied')
      }
    )

    await expect(authorizeHubspot()).rejects.toThrow('缺少 code')
  })

  it('token 过期走 refresh：沿用响应未携带的旧 refresh token 并更新 storage', async () => {
    const auth: MapsIntegrationAuth = {
      drive: null,
      hubspot: {
        accessToken: 'expired-token',
        refreshToken: 'old-refresh-token',
        expiresAt: Date.now() - 1000
      }
    }
    storageData[STORAGE_KEYS.MAPS_INTEGRATION_AUTH] = auth
    const fetchMock = stubFetch([
      {
        match: url => url === 'https://api.hubapi.com/oauth/v1/token',
        respond: () => jsonResponse({ access_token: 'hs-new-access', expires_in: 1800 })
      }
    ])

    const token = await getHubspotAccessToken()

    expect(token).toBe('hs-new-access')
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = String(init.body)
    expect(body).toContain('grant_type=refresh_token')
    expect(body).toContain('refresh_token=old-refresh-token')
    const stored = await MapsIntegrationAuthManager.getAuth()
    expect(stored.hubspot?.accessToken).toBe('hs-new-access')
    expect(stored.hubspot?.refreshToken).toBe('old-refresh-token')
    expect(stored.hubspot?.expiresAt).toBeGreaterThan(Date.now())
  })

  it('token 未过期直接返回，不发起刷新请求', async () => {
    await seedAuth()
    const fetchMock = stubFetch([])

    const token = await getHubspotAccessToken()

    expect(token).toBe('seeded-hubspot-token')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('Drive multipart 构造与上传', () => {
  it('multipart 请求体：metadata 段 + CSV 段 + 终止符，CRLF 连接', () => {
    const body = buildDriveMultipartBody('gme-boundary', 'MapsGrab-Extractor-2-kw-2026-08-30.csv', 'Name\nA\nB')

    expect(body).toBe(
      [
        '--gme-boundary',
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify({
          name: 'MapsGrab-Extractor-2-kw-2026-08-30.csv',
          mimeType: 'text/csv'
        }),
        '--gme-boundary',
        'Content-Type: text/csv',
        '',
        'Name\nA\nB',
        '--gme-boundary--',
        ''
      ].join('\r\n')
    )
  })

  it('uploadCsvToDrive：Bearer 头 + multipart/related Content-Type，2xx 通过', async () => {
    const fetchMock = stubFetch([
      {
        match: url =>
          url.startsWith(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
          ),
        respond: () => jsonResponse({ id: 'file-1' })
      }
    ])

    await expect(
      uploadCsvToDrive('drive-token', 'file.csv', 'Name\nA')
    ).resolves.toBeUndefined()

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('supportsAllDrives=true')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer drive-token')
    expect((init.headers as Record<string, string>)['Content-Type']).toContain(
      'multipart/related; boundary='
    )
  })

  it('uploadCsvToDrive：非 2xx 抛错（调用方按单路失败处理）', async () => {
    stubFetch([
      {
        match: url => url.includes('googleapis.com'),
        respond: () => jsonResponse({ error: 'unauthorized' }, 401)
      }
    ])

    await expect(uploadCsvToDrive('bad-token', 'file.csv', 'Name\nA')).rejects.toThrow(
      'Drive 上传失败: HTTP 401'
    )
  })
})

describe('HubSpot 商家映射', () => {
  it('buildHubspotBusinesses：缺街道回退完整地址', () => {
    const rows = [
      {
        name: 'Cafe A',
        domain: 'cafea.com',
        phone: '+1 555 010',
        street: '12 Main St',
        fullAddress: '12 Main St, New York',
        municipality: 'New York'
      },
      {
        name: 'Cafe B',
        domain: '',
        phone: '',
        street: '',
        fullAddress: '5 Elm St, Boston',
        municipality: 'Boston'
      }
    ] as Parameters<typeof buildHubspotBusinesses>[0]

    expect(buildHubspotBusinesses(rows)).toEqual([
      { name: 'Cafe A', domain: 'cafea.com', phone: '+1 555 010', address: '12 Main St', city: 'New York' },
      { name: 'Cafe B', domain: '', phone: '', address: '5 Elm St, Boston', city: 'Boston' }
    ])
  })
})

describe('background 同步服务（单路失败不阻断）', () => {
  /** 从全局 mock 提取已注册的事件监听器（与 storageChangeListeners 同构）。 */
  function runtimeMessageListeners(): Array<(message: unknown) => void> {
    return (chrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>).mock.calls.map(
      call => call[0] as (message: unknown) => void
    )
  }

  /** 构造 auto_save 事件消息（content 广播形态）。 */
  function autoSaveMessage(): Record<string, unknown> {
    return {
      __event__: true,
      event: 'mapsAutoSaveExport',
      data: {
        csvContent: 'Name\nLe Cafe\n',
        filename: 'MapsGrab-Extractor-1-kw-2026-08-30.csv',
        keyword: 'kw',
        rowCount: 1,
        businesses: [{ name: 'Le Cafe', domain: 'le.cafe', phone: '', address: '1 St', city: 'NY' }],
        pageUrl: 'https://www.google.com/maps/search/kw'
      }
    }
  }

  it('Drive 上传失败时 HubSpot 同步仍执行（单路失败不阻断）', async () => {
    await seedAuth()
    const { MapsIntegrationSyncService } = await import(
      '../../src/background/services/MapsIntegrationSyncService'
    )
    const fetchMock = stubFetch([
      {
        match: url => url.includes('googleapis.com'),
        respond: () => jsonResponse({ error: 'boom' }, 500)
      },
      {
        match: url => url.endsWith('/api/client/maps/hubspot/sync'),
        respond: () => jsonResponse({ code: 10000, msg: '', data: { synced: 1 } })
      },
      {
        match: url => url.includes('/logstores/') && url.endsWith('/track'),
        respond: () => new Response('', { status: 200 })
      }
    ])

    const service = new MapsIntegrationSyncService()
    service.setup()
    for (const listener of runtimeMessageListeners()) {
      listener(autoSaveMessage())
    }

    await vi.waitFor(() => {
      const syncCalls = fetchMock.mock.calls.filter(call =>
        String(call[0]).endsWith('/api/client/maps/hubspot/sync')
      )
      expect(syncCalls.length).toBeGreaterThan(0)
    })

    const syncCall = fetchMock.mock.calls.find(call =>
      String(call[0]).endsWith('/api/client/maps/hubspot/sync')
    )
    const [, init] = syncCall as [string, RequestInit]
    const requestBody = JSON.parse(String(init.body)) as { token: string; businesses: unknown[] }
    expect(requestBody.token).toBe('seeded-hubspot-token')
    expect(requestBody.businesses).toHaveLength(1)

    // sync_to_google_drive 打点带失败结果（失败不静默）
    await vi.waitFor(() => {
      const markCalls = fetchMock.mock.calls.filter(call =>
        String(call[0]).includes('/logstores/')
      )
      expect(markCalls.length).toBeGreaterThan(0)
    })
    const markCall = fetchMock.mock.calls.find(call => String(call[0]).includes('/logstores/'))
    const markUrl = new URL(String(markCall?.[0]))
    expect(markUrl.searchParams.get('mark_type')).toBe('sync_to_google_drive')
    expect(markUrl.searchParams.get('mark_msg')).toContain('outcome=failed')

    service.destroy()
  })

  it('未授权（storage 无记录）时双路均跳过，不发起任何上传请求', async () => {
    const { MapsIntegrationSyncService } = await import(
      '../../src/background/services/MapsIntegrationSyncService'
    )
    const fetchMock = stubFetch([])

    const service = new MapsIntegrationSyncService()
    service.setup()
    for (const listener of runtimeMessageListeners()) {
      listener(autoSaveMessage())
    }
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(fetchMock).not.toHaveBeenCalled()
    service.destroy()
  })
})
