/** 中转页在 i18n 就绪前注册身份，自关闭复用目标 tab 的页内身份核验。 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const originalUrl = location.href
let releaseI18n: () => void

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  const ready = new Promise<void>(resolve => { releaseI18n = resolve })
  vi.doMock('@/locales', () => ({
    i18nReady: ready,
    I18nService: { getCurrentLanguage: () => 'en', t: (key: string) => key }
  }))
  const target = 'https://www.google.com/maps/search/tea?gme_bulk=1&gme_bulk_task=launcher-task&gme_bulk_item=1&gme_bulk_total=2'
  location.href = `${chrome.runtime.getURL('src/bulk-launch.html')}?url=${encodeURIComponent(target)}`
})

afterEach(() => {
  releaseI18n()
  location.href = originalUrl
  vi.doUnmock('@/locales')
  vi.restoreAllMocks()
})

it.each(['denied', 'failed'])('中转页在许可 %s 后请求 background 核验关闭', async outcome => {
  const { BackgroundChannel } = await import('@/popup/rpc/background.rpc')
  const authorize = vi.spyOn(BackgroundChannel.prototype, 'authorizeBulkWorkPage').mockResolvedValue(false)
  if (outcome === 'failed') authorize.mockRejectedValue(new Error('采集许可请求失败'))
  const close = vi.spyOn(BackgroundChannel.prototype, 'closeBulkWorkPage').mockResolvedValue()
  const destroy = vi.spyOn(BackgroundChannel.prototype, 'destroy')
  await import('@/bulk-launch/main')
  const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)![0]
  const respond = vi.fn()
  listener({ __bulkWorkIdentity__: true }, { id: chrome.runtime.id }, respond)
  expect(respond).toHaveBeenCalledWith({ taskId: 'launcher-task', itemIndex: 1 })
  expect(authorize).not.toHaveBeenCalled()

  releaseI18n()
  await vi.waitFor(() => expect(destroy).toHaveBeenCalledTimes(1))
  expect(close).toHaveBeenCalledTimes(1)
  expect(close.mock.invocationCallOrder[0]!).toBeLessThan(destroy.mock.invocationCallOrder[0]!)
  expect(chrome.tabs.get).not.toHaveBeenCalled()
  expect(chrome.tabs.remove).not.toHaveBeenCalled()
})
