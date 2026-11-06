/** 启动边界的回归；站点响应为构造样本，真实界面验收另行执行。 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import type { JsonValue } from '@/core/rpc/types'
import { bootstrapMapsContent } from '@/sites/maps/content/bootstrap'
import { bootReviewsPage, REVIEWS_PANEL_HOST_ID } from '@/sites/maps/content/reviews/reviewsScraper'
import { bootPhotosPage, PHOTOS_PANEL_HOST_ID } from '@/sites/maps/content/photos/photosScraper'
import { MapsPanel } from '@/sites/maps/content/panel/mapsPanel'
import { ExtractionPanel } from '@/sites/maps/content/panel/extractionPanel'
import { MapsSearchScraper } from '@/sites/maps/content/scraper/searchScraper'
import * as config from '@/sites/maps/config/loader'
import * as settings from '@/sites/maps/settings/userSettings'
import * as usage from '@/sites/maps/usage/usageClient'
import * as downloads from '@/sites/maps/content/export/download'

const originalUrl = location.href
const panels: (MapsPanel | ExtractionPanel)[] = []
const fid = '0x89c2597ca044ec9b:0xa0acdb1716592b4d'

beforeEach(() => {
  config.resetMapsConfigForTests()
  vi.spyOn(config, 'loadMapsConfig').mockResolvedValue()
  vi.spyOn(settings, 'initializeMapsUserSettings').mockResolvedValue()
  vi.spyOn(usage, 'fetchUsageSnapshot').mockResolvedValue(null)
  vi.spyOn(MapsPanel.prototype, 'checkQuota').mockResolvedValue(null)
  vi.spyOn(BackgroundChannel.prototype, 'checkPluginVersion').mockResolvedValue({ status: 'disabled', update: null })
  const mountSearch = MapsPanel.prototype.mount
  vi.spyOn(MapsPanel.prototype, 'mount').mockImplementation(async function (this: MapsPanel, ...args) {
    panels.push(this)
    await mountSearch.apply(this, args)
  })
  const mountWork = ExtractionPanel.prototype.mount
  vi.spyOn(ExtractionPanel.prototype, 'mount').mockImplementation(async function (this: ExtractionPanel) {
    panels.push(this)
    await mountWork.call(this)
  })
  vi.spyOn(document.documentElement, 'appendChild').mockImplementation(child => child)
})

afterEach(() => {
  panels.splice(0).forEach(panel => panel.destroy())
  document.body.innerHTML = ''
  location.href = originalUrl
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it.each(['/maps/search/coffee', '/maps?data=!4m2!10m1!1e1'])('%s 打开时及每次 Start 现查，普通更新允许开始', async path => {
  document.body.innerHTML = '<div role="main"></div>'
  location.href = `https://www.google.com${path}`
  const start = vi.spyOn(MapsSearchScraper.prototype, 'start').mockImplementation(() => undefined)
  const version = vi.mocked(BackgroundChannel.prototype.checkPluginVersion)
  bootstrapMapsContent()
  const host = () => document.getElementById('gmap-extractor-panel-host')!
  await vi.waitFor(() => expect(host()?.shadowRoot?.querySelector('[data-version]')?.textContent).toContain('disabled'))
  const button = host().shadowRoot!.querySelector<HTMLButtonElement>('[data-primary]')!
  button.click()
  await vi.waitFor(() => expect(version).toHaveBeenCalledTimes(2))
  expect(start).not.toHaveBeenCalled()
  version.mockResolvedValue(null)
  button.click()
  await vi.waitFor(() => expect(version).toHaveBeenCalledTimes(3))
  expect(start).not.toHaveBeenCalled()
  version.mockResolvedValue({ status: 'update_available', update: { version: '9.0.0', url: 'https://example.com/update' } })
  button.click()
  await vi.waitFor(() => expect(start).toHaveBeenCalledOnce())
  expect(host().shadowRoot!.querySelector<HTMLAnchorElement>('[data-version] a')?.href).toBe('https://example.com/update')
})

it.each(['reviews', 'photos'] as const)('%s 直接 boot 被禁用不采集；重新启用可重试，Reset 禁用或失败保留原结果及导出', async mode => {
  location.href = mode === 'reviews'
    ? `https://www.google.com/maps/place/?gme_fid=${fid}`
    : 'https://www.google.com/maps/uv'
  document.body.innerHTML = `<div role="dialog"><div role="grid"></div></div><div data-feature-id="${fid}"></div><script>window.WIZ_global_data={"SNlM0e":"test-at"}</script>`
  vi.spyOn(BackgroundChannel.prototype, 'photosWorkPage').mockResolvedValue({ opened: false, fid })
  const review: JsonValue[] = []
  review[1] = 5
  review[27] = 'sample review'
  const branch: JsonValue[] = []
  branch[10] = [null, null, [review], null, null, null, null]
  const reviews = [")]}'", '0', JSON.stringify([null, branch])].join('\n')
  const payload = JSON.stringify([['wrb.fr', 'wTe8We', JSON.stringify([null, null, [[["https://lh3.example/p/photo=w800-h600"]]]])]])
  const photos = `)]}'\n\n${payload.length}\n${payload}\n`
  const fetchPage = vi.fn(async () => new Response(mode === 'reviews' ? reviews : photos, { status: 200 }))
  vi.stubGlobal('fetch', fetchPage)
  const exportFile = vi.spyOn(downloads, 'downloadFile').mockImplementation(() => undefined)
  const emitter = new ChromeEventEmitter<ExtensionEvents>()
  if (mode === 'reviews') await bootReviewsPage(emitter)
  else await bootPhotosPage(emitter)
  const shadow = document.getElementById(mode === 'reviews' ? REVIEWS_PANEL_HOST_ID : PHOTOS_PANEL_HOST_ID)!.shadowRoot!
  const reset = shadow.querySelector<HTMLButtonElement>('[data-secondary]')!
  expect(fetchPage).not.toHaveBeenCalled()
  expect(reset.hidden).toBe(false)
  const version = vi.mocked(BackgroundChannel.prototype.checkPluginVersion)
  version.mockResolvedValue({ status: 'current', update: null })
  reset.click()
  await vi.waitFor(() => expect(shadow.querySelector('.mgp-ring')?.getAttribute('aria-valuenow')).toBe('1'))
  await vi.waitFor(() => expect(reset.hidden).toBe(false))
  for (const result of [{ status: 'disabled', update: null }, null] as const) {
    const before = version.mock.calls.length
    version.mockResolvedValue(result)
    reset.click()
    await vi.waitFor(() => expect(version.mock.calls.length).toBe(before + 1))
    await vi.waitFor(() => expect(reset.getAttribute('aria-busy')).toBe('false'))
    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(shadow.querySelector('.mgp-ring')?.getAttribute('aria-valuenow')).toBe('1')
    shadow.querySelector<HTMLButtonElement>('[data-primary]')!.click()
  }
  expect(exportFile).toHaveBeenCalledTimes(2)
})
