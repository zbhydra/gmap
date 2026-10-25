import { afterEach, describe, expect, it, vi } from 'vitest'

import { MARK_TYPE } from '../../src/core/api/mark/types'

const enabledSlsConfig = {
  enabled: true,
  endpoint: 'https://gmap.ap-northeast-1.log.aliyuncs.com',
  logstore: 'gmap-mark-logs',
  topic: 'mark-log',
  source: 'extension-bing',
  clientProduct: 'extension-bing'
}

function stubDeviceId(deviceId: string): void {
  Object.assign(chrome.storage.local, {
    get: vi.fn((key: string) => Promise.resolve({ [key]: deviceId }))
  })
}

function stubRuntimeGlobals(slsConfig: typeof enabledSlsConfig): void {
  vi.stubGlobal('__API_BASE_URL__', 'https://api.example.com')
  vi.stubGlobal('__DEV__', false)
  vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://www.example.com')
  vi.stubGlobal('__ALI_SLS_MARK_CONFIG__', slsConfig)
}

function stubSuccessfulFetch() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 204,
    statusText: 'No Content'
  } satisfies Pick<Response, 'ok' | 'status' | 'statusText'>)

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('extension SLS mark', () => {
  it('sends mark-log to Ali SLS WebTracking with sanitized fields', async () => {
    stubRuntimeGlobals(enabledSlsConfig)
    stubDeviceId('device-123')
    const fetchMock = stubSuccessfulFetch()

    const { markApi } = await import('../../src/core/api/mark')
    const { STORAGE_KEYS } = await import('../../src/core/api/config')

    const result = await markApi.record(
      MARK_TYPE.POPUP_OPEN,
      'url=https://example.com/download/video.mp4?token=secret access_token=abc123',
      { pageUrl: 'https://www.google.com/maps/search/coffee' }
    )

    expect(result).toEqual({ recorded: true })
    expect(chrome.storage.local.get).toHaveBeenCalledWith(STORAGE_KEYS.DEVICE_ID)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const url = new URL(requestUrl)

    expect(url.origin).toBe('https://gmap.ap-northeast-1.log.aliyuncs.com')
    expect(url.pathname).toBe('/logstores/gmap-mark-logs/track')
    expect(url.searchParams.get('APIVersion')).toBe('0.6.0')
    expect(url.searchParams.get('__topic__')).toBe('mark-log')
    expect(url.searchParams.get('__source__')).toBe('extension-bing')
    expect(url.searchParams.get('site')).toBe('extension')
    expect(url.searchParams.get('client_product')).toBe('extension-bing')
    expect(url.searchParams.get('mark_type')).toBe(MARK_TYPE.POPUP_OPEN)
    expect(url.searchParams.get('device_id')).toBe('device-123')
    expect(url.searchParams.get('page_path')).toBe('/maps/search/coffee')
    expect(url.searchParams.get('surface')).toBe('content')
    expect(url.searchParams.get('extension_version')).toBeTruthy()
    expect(url.searchParams.get('first_opened_at')).toBe('0')
    expect(url.searchParams.get('mark_msg')).toContain('https://example.com/download/video.mp4')
    expect(url.searchParams.get('mark_msg')).not.toContain('secret')
    expect(url.searchParams.get('mark_msg')).not.toContain('abc123')
    expect(requestInit).toMatchObject({
      method: 'GET',
      credentials: 'omit',
      keepalive: true
    })
  })

  it('does not fetch when SLS is disabled', async () => {
    stubRuntimeGlobals({
      ...enabledSlsConfig,
      enabled: false
    })
    stubDeviceId('device-123')
    const fetchMock = stubSuccessfulFetch()

    const { markApi } = await import('../../src/core/api/mark')

    await expect(markApi.record(MARK_TYPE.POPUP_OPEN)).resolves.toEqual({ recorded: false })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
