import { afterEach, describe, expect, it, vi } from 'vitest'

import { MARK_TYPE } from '../../src/core/api/mark/types'

const enabledSlsConfig = {
  enabled: true,
  endpoint: 'https://tg-download.ap-southeast-1.log.aliyuncs.com',
  logstore: 'tg-download-mark-log',
  topic: 'mark-log',
  source: 'extension'
}

function stubDeviceId(deviceId: string): void {
  chrome.storage.local.get = vi.fn((key: string) =>
    Promise.resolve({ [key]: deviceId })
  ) as typeof chrome.storage.local.get
}

function stubRuntimeGlobals(slsConfig: typeof enabledSlsConfig): void {
  vi.stubGlobal('__API_BASE_URL__', 'https://tg-download-api.telegramdownloadmedia.com')
  vi.stubGlobal('__DEV__', false)
  vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://telegramdownloadmedia.com')
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
      MARK_TYPE.DOWNLOAD_CLICK,
      'url=https://example.com/download/video.mp4?token=secret access_token=abc123',
      { pageUrl: 'https://web.telegram.org/k/#@chat' }
    )

    expect(result).toEqual({ recorded: true })
    expect(chrome.storage.local.get).toHaveBeenCalledWith(STORAGE_KEYS.DEVICE_ID)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const url = new URL(requestUrl)

    expect(url.origin).toBe('https://tg-download.ap-southeast-1.log.aliyuncs.com')
    expect(url.pathname).toBe('/logstores/tg-download-mark-log/track')
    expect(url.searchParams.get('APIVersion')).toBe('0.6.0')
    expect(url.searchParams.get('__topic__')).toBe('mark-log')
    expect(url.searchParams.get('__source__')).toBe('extension')
    expect(url.searchParams.get('site')).toBe('extension')
    expect(url.searchParams.get('client_product')).toBe('extension')
    expect(url.searchParams.get('mark_type')).toBe(MARK_TYPE.DOWNLOAD_CLICK)
    expect(url.searchParams.get('device_id')).toBe('device-123')
    expect(url.searchParams.get('page_path')).toBe('/k/')
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
