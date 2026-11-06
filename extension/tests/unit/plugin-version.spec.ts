import { beforeEach, expect, it, vi } from 'vitest'
import type { JsonValue } from '@/core/rpc/types'
import { httpClient } from '@/core/api'
import { API } from '@/core/api/config'
import { checkPluginVersion } from '@/core/api/plugin-version/api'
import { canStartWithPluginVersion, parsePluginVersionCheck } from '@/core/api/plugin-version/types'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { fetchPluginVersion } from '@/core/plugin-version/client'

vi.mock('@/core/api', () => ({ httpClient: { get: vi.fn() } }))

beforeEach(() => vi.restoreAllMocks())

it('匿名现查本包 manifest 版本，每次请求不使用缓存或重试', async () => {
  vi.mocked(httpClient.get).mockResolvedValue({ status: 'update_available', update: { version: '9.0.0', url: 'https://example.com/update' } })
  const state = await checkPluginVersion()
  expect(canStartWithPluginVersion(state)).toBe(true)
  await checkPluginVersion()
  expect(httpClient.get).toHaveBeenCalledTimes(2)
  expect(httpClient.get).toHaveBeenLastCalledWith(API.ENDPOINTS.PLUGIN_VERSION_CHECK, {
    params: { plugin: 'maps', version: chrome.runtime.getManifest().version },
    requireAuth: false, skipRetry: true, skipErrorToast: true, cache: 'no-store'
  })
})

it.each([
  null, {}, { status: 'current' },
  { status: 'update_available', update: null },
  { status: 'disabled', update: { version: '9.0.0', url: 'javascript:alert(1)' } }
])('HTTP 异常响应 %j 拒绝新采集', async value => {
  vi.mocked(httpClient.get).mockResolvedValue(value)
  expect(await checkPluginVersion()).toBeNull()
  expect(canStartWithPluginVersion(await checkPluginVersion())).toBe(false)
})

it('RPC 解析拒绝非法状态；请求失败不返回旧放行结果', async () => {
  const reply = vi.spyOn(BackgroundChannel.prototype, 'checkPluginVersion')
  reply.mockResolvedValueOnce({ status: 'current', update: null })
  expect(canStartWithPluginVersion(await fetchPluginVersion())).toBe(true)
  reply.mockResolvedValueOnce({ status: 'disabled', update: null })
  expect(canStartWithPluginVersion(await fetchPluginVersion())).toBe(false)
  reply.mockRejectedValueOnce(new Error('RPC unavailable'))
  expect(await fetchPluginVersion()).toBeNull()
  const malformed: JsonValue = { status: 'allow', update: null }
  expect(() => parsePluginVersionCheck(malformed)).toThrow('status 非法')
})
