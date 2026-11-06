import { beforeEach, expect, it, vi } from 'vitest'
import { checkPluginVersion } from '@/core/api/plugin-version/api'
import { parsePluginVersionCheck } from '@/core/api/plugin-version/types'
import type { JsonValue } from '@/core/rpc/types'

const http = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/core/api', async importOriginal => ({
  ...(await importOriginal<typeof import('@/core/api')>()), httpClient: http
}))
beforeEach(() => vi.clearAllMocks())

it('匿名现查使用 Bing 标识、本包 manifest 版本和 no-store', async () => {
  http.get.mockResolvedValue({ status: 'current', update: null })
  expect(await checkPluginVersion()).toEqual({ status: 'current', update: null })
  expect(http.get).toHaveBeenCalledWith('/api/client/plugin-versions/check', {
    params: { plugin: 'bing', version: chrome.runtime.getManifest().version },
    requireAuth: false, skipErrorToast: true, skipRetry: true, cache: 'no-store'
  })
})

it.each<JsonValue>([
  null, {}, [], { status: 'current' }, { status: 'unknown', update: null },
  { status: 'update_available', update: null },
  { status: 'current', update: { version: '2.0.0', url: 'https://example.com' } },
  { status: 'disabled', update: { version: '02.0.0', url: 'https://example.com' } },
  { status: 'disabled', update: { version: '2.0.0', url: 'javascript:alert(1)' } },
  { status: 'disabled', update: { version: '2.0.0', url: '/relative' } }
])('异常响应不能放行或打开非 HTTP(S) 地址：%j', data => {
  expect(() => parsePluginVersionCheck(data)).toThrow(/版本检查响应无效/)
})
