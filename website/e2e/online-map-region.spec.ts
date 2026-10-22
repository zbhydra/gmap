import { expect, test } from '@playwright/test'
import type { ExportItemInput, ExportJobDetail } from '../src/scripts/dashboard/api'
import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

test('Online map and region inputs submit bounded queries with lazy resources', async ({ page }, testInfo) => {
  test.setTimeout(60000)
  const envelope = (data: object) => ({ code: 10000, data })
  const resources: string[] = []
  const submissions: { items: ExportItemInput[]; include_contacts: boolean }[] = []
  let releaseFirst: () => void = () => {}
  const firstSubmission = new Promise<void>(resolve => { releaseFirst = resolve })
  page.on('request', request => resources.push(request.url()))
  await page.route('**/api/client/auth/me', route => route.fulfill({ json: envelope({ email: 'map@example.test', full_name: 'Map User', credits_balance: 0, created_at: Date.now() }) }))
  await page.route('**/api/client/maps-online/options', route => route.fulfill({ json: envelope({ keyword_limit: 2, logical_sample_limit: 50, contacts_allowed: false, usage: { used: 0, total: 1000, period: '2026-09', exhausted: false } }) }))
  await page.route('**/api/client/export/jobs*', async route => {
    if (route.request().method() === 'POST') {
      submissions.push(route.request().postDataJSON())
      if (submissions.length === 1) await firstSubmission
      const detail: ExportJobDetail = {
        job: { job_no: submissions.length.toString(16).padStart(32, '0') + '00', run_no: 'a'.repeat(32) + '00', status: 'queued', include_contacts: false, total_count: submissions[submissions.length - 1].items.length, processed_count: 0, record_count: 0, has_file: false, created_at: Date.now(), started_at: null, finished_at: null, error_code: null },
        items: submissions[submissions.length - 1].items.map((item, item_index) => ({ ...item, item_index, viewport: item.viewport ?? null, result_count: 0, completed: false, error_code: null }))
      }
      return route.fulfill({ json: envelope(detail) })
    }
    return route.fulfill({ json: envelope({ jobs: [], total: 0, offset: 0, limit: 20 }) })
  })

  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('homepage_access_token', 'map-token'))
  await page.goto('/dashboard/')
  await expect(page.getByLabel('Keywords', { exact: true })).toBeVisible()
  expect(resources.some(url => url.includes('leaflet') || /\/countries(?:\.[^/]+)?\.json/.test(url))).toBe(false)

  await page.getByRole('button', { name: 'Map', exact: true }).click()
  await expect(page.locator('.leaflet-container')).toBeVisible()
  await expect.poll(() => page.locator('.leaflet-container').evaluate(element => getComputedStyle(element).position)).toBe('relative')
  expect(resources.some(url => /\/countries(?:\.[^/]+)?\.json/.test(url))).toBe(false)
  await page.getByLabel('Keywords', { exact: true }).fill('coffee')
  await page.locator('.leaflet-container').click({ position: { x: 240, y: 160 } })
  await expect(page.getByLabel('Latitude')).not.toHaveValue('')
  await page.getByLabel('Latitude').fill('40')
  await page.getByLabel('Longitude').fill('-74')
  await expect(page.getByText('5 / 50 search locations')).toBeVisible()
  await page.getByLabel('Longitude').fill('')
  await expect(page.getByText('0 / 50 search locations')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeDisabled()
  await page.getByLabel('Longitude').fill('-74')
  await expect(page.getByText('5 / 50 search locations')).toBeVisible()
  await page.getByLabel('Radius (km)').fill('20')
  await page.getByLabel('Grid spacing (km)').fill('1')
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeDisabled()
  await expect(page.getByRole('alert')).toContainText('Reduce the radius')
  await page.getByLabel('Radius (km)').fill('51')
  await page.getByRole('button', { name: 'Keywords', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeEnabled()
  await page.getByRole('button', { name: 'Start scraping' }).click()
  await expect.poll(() => submissions.length).toBe(1)
  await expect(page.getByRole('button', { name: 'Regions', exact: true })).toBeDisabled()
  expect(submissions[0]).toEqual({ items: [{ keyword: 'coffee' }], include_contacts: false })
  releaseFirst()
  await expect(page.getByLabel('Keywords', { exact: true })).toHaveValue('')
  await page.getByRole('button', { name: 'Map', exact: true }).click()
  await expect(page.getByLabel('Radius (km)')).toHaveValue('51')
  await page.getByLabel('Keywords', { exact: true }).fill('coffee')
  await page.getByLabel('Radius (km)').fill('5')
  await page.getByLabel('Grid spacing (km)').fill('5')
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeEnabled()
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap')
  expect(resources.some(url => /leaflet.*\.css/.test(url))).toBe(true)
  await expect.poll(() => page.locator('.leaflet-container img').evaluateAll(images =>
    images.length > 0 && images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)),
    { timeout: 15000 }).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('online-map.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Start scraping' }).click()
  await expect.poll(() => submissions.length).toBe(2)
  expect(submissions[1].include_contacts).toBe(false)
  expect(submissions[1].items).toHaveLength(5)
  expect(submissions[1].items.every(item => item.keyword === 'coffee')).toBe(true)
  expect(submissions[1].items[0]).toEqual({ keyword: 'coffee', viewport: { lat: 40, lng: -74, zoom: 15 } })

  await page.getByRole('button', { name: 'Regions', exact: true }).click()
  await expect(page.getByLabel('Country')).toBeVisible()
  await page.getByLabel('Country').selectOption('US')
  await page.getByLabel('State or region').selectOption('CA')
  await page.getByRole('button', { name: 'Add state' }).click()
  await page.getByLabel('Find a city').fill('San Francisco')
  await page.getByRole('combobox', { name: 'City', exact: true }).selectOption({ label: 'San Francisco, California' })
  await page.getByRole('button', { name: 'Add city' }).click()
  await page.getByLabel('Base keywords').fill('dentist')
  await page.getByRole('button', { name: 'Generate queries' }).click()
  await expect(page.getByLabel('Final queries')).toHaveValue('dentist in California, US\ndentist in San Francisco, California, US')
  expect(resources.some(url => /\/countries(?:\.[^/]+)?\.json/.test(url))).toBe(true)
  expect(resources.some(url => /\/US(?:\.[^/]+)?\.json/.test(url))).toBe(true)
  await page.getByLabel('Final queries').fill('dentist in California, US\ndentist in San Francisco, California, US\ndentist in Los Angeles, California, US')
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeDisabled()
  await page.getByLabel('Final queries').fill('dentist in California, US\ndentist in San Francisco, California, US')
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeEnabled()
  await page.screenshot({ path: testInfo.outputPath('online-regions.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Start scraping' }).click()
  await expect.poll(() => submissions.length).toBe(3)
  expect(submissions[2]).toEqual({ items: [{ keyword: 'dentist in California, US' }, { keyword: 'dentist in San Francisco, California, US' }], include_contacts: false })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
