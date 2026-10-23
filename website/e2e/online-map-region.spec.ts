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
        job: { job_no: submissions.length.toString(16).padStart(32, '0') + '00', run_no: 'a'.repeat(32) + '00', status: 'queued', include_contacts: false, total_count: submissions[submissions.length - 1].items.length, processed_count: 0, record_count: 0, has_file: false, created_at: Date.now(), started_at: null, finished_at: null, error_code: null, keyword_preview: submissions[submissions.length - 1].items[0].keyword, keyword_count: 1 },
        items: submissions[submissions.length - 1].items.map((item, item_index) => ({ ...item, item_index, viewport: item.viewport ?? null, result_count: 0, completed: false, error_code: null }))
      }
      return route.fulfill({ json: envelope(detail) })
    }
    return route.fulfill({ json: envelope({ jobs: [], total: 0, offset: 0, limit: 20 }) })
  })

  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('homepage_access_token', 'map-token'))
  await page.goto('/dashboard/')
  await expect(page.getByRole('textbox', { name: 'Keywords', exact: true })).toBeVisible()
  // Astro dev 的模块图记录过地图组件的动态导入后，会把其中的 leaflet.css?url 当页面样式预先注入（生产构建不会），
  // 是否注入取决于同一 dev 服务器上是否已有页面打开过地图；这里只断言地图脚本与国家数据没有提前加载
  expect(resources.some(url => (url.includes('leaflet') && !url.includes('leaflet.css')) || /\/countries(?:\.[^/]+)?\.json/.test(url))).toBe(false)

  await page.getByRole('tab', { name: 'Map', exact: true }).click()
  await expect(page.locator('.leaflet-container')).toBeVisible()
  // 地图画布由舞台绝对定位填满；leaflet.css 是否生效看地图 pane 的定位（只有该样式表给出 absolute）
  await expect.poll(() => page.locator('.leaflet-map-pane').evaluate(element => getComputedStyle(element).position)).toBe('absolute')
  expect(resources.some(url => /\/countries(?:\.[^/]+)?\.json/.test(url))).toBe(false)
  await page.getByRole('textbox', { name: 'Keywords', exact: true }).fill('coffee')
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
  await expect(page.locator('.composer-msgs')).toContainText('Reduce the radius')
  // 半径取滑杆上限 50 km：切到关键词模式提交后再回地图，取值保持
  await page.getByLabel('Radius (km)').fill('50')
  await page.getByRole('tab', { name: 'Keywords', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeEnabled()
  await page.getByRole('button', { name: 'Start scraping' }).click()
  await expect.poll(() => submissions.length).toBe(1)
  await expect(page.getByRole('tab', { name: 'Regions', exact: true })).toBeDisabled()
  expect(submissions[0]).toEqual({ items: [{ keyword: 'coffee' }], include_contacts: false })
  releaseFirst()
  await expect(page.getByRole('textbox', { name: 'Keywords', exact: true })).toHaveValue('')
  await page.getByRole('tab', { name: 'Map', exact: true }).click()
  await expect(page.getByLabel('Radius (km)')).toHaveValue('50')
  await page.getByRole('textbox', { name: 'Keywords', exact: true }).fill('coffee')
  await page.getByLabel('Radius (km)').fill('5')
  await page.getByLabel('Grid spacing (km)').fill('5')
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeEnabled()
  await expect(page.locator('.map-card .attribution')).toContainText('OpenStreetMap')
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

  await page.getByRole('tab', { name: 'Regions', exact: true }).click()
  // 国家、州 / 省是可输入过滤的 combobox，没有原生 select：国家代码完全相同排最前，回车选中活动项
  await expect(page.locator('.region-build select')).toHaveCount(0)
  const country = page.getByRole('combobox', { name: 'Country', exact: true })
  await expect(country).toBeEnabled()
  await country.fill('us')
  await expect(page.getByRole('listbox', { name: 'Country' }).getByRole('option').first()).toContainText('United States')
  await country.press('Enter')
  await expect(country).toHaveValue('United States')
  // 失焦时文本与某项不完全相同就恢复原值
  await country.fill('Atlantis')
  await country.blur()
  await expect(country).toHaveValue('United States')
  const state = page.getByRole('combobox', { name: 'State or region', exact: true })
  await expect(state).toBeEnabled()
  await state.fill('Califor')
  await state.press('Enter')
  await expect(state).toHaveValue('California')
  await page.getByRole('button', { name: 'Add state' }).click()
  // 城市选中即加入已选地点并清空输入
  const city = page.getByRole('combobox', { name: 'Find a city', exact: true })
  await city.fill('San Francisco')
  await expect(page.getByRole('listbox', { name: 'City' }).getByRole('option').first()).toContainText('San Francisco')
  await city.press('Enter')
  await expect(city).toHaveValue('')
  await expect(page.getByRole('list', { name: 'Selected locations' }).getByRole('listitem')).toHaveText(['California, US', 'San Francisco, California, US'])
  await page.getByLabel('Base keywords').fill('dentist')
  await page.getByRole('button', { name: 'Generate queries' }).click()
  await expect(page.getByLabel('Final queries')).toHaveValue('dentist in California, US\ndentist in San Francisco, California, US')
  expect(resources.some(url => /\/countries(?:\.[^/]+)?\.json/.test(url))).toBe(true)
  expect(resources.some(url => /\/US(?:\.[^/]+)?\.json/.test(url))).toBe(true)
  await page.getByLabel('Final queries').fill('dentist in California, US\ndentist in San Francisco, California, US\ndentist in Los Angeles, California, US')
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeDisabled()
  await page.getByLabel('Final queries').fill('dentist in California, US\ndentist in San Francisco, California, US')
  await expect(page.getByRole('button', { name: 'Start scraping' })).toBeEnabled()
  // 列表收起时 Enter 不隐式提交外层表单，只有 Start scraping 创建任务；列表展开时 Enter 仍是选中
  await country.click()
  await expect(country).toHaveAttribute('aria-expanded', 'true')
  await country.press('Escape')
  await expect(country).toHaveAttribute('aria-expanded', 'false')
  await country.press('Enter')
  await city.fill('San Jose')
  await expect(page.getByRole('listbox', { name: 'City' }).getByRole('option').first()).toContainText('San Jose')
  await city.press('Enter')
  await expect(page.getByRole('list', { name: 'Selected locations' }).getByRole('listitem')).toHaveText(['California, US', 'San Francisco, California, US', 'San Jose, California, US'])
  await city.press('Enter')
  // 否定断言：给可能的隐式提交留出发出请求的时间
  await page.waitForTimeout(300)
  expect(submissions).toHaveLength(2)
  await page.screenshot({ path: testInfo.outputPath('online-regions.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Start scraping' }).click()
  await expect.poll(() => submissions.length).toBe(3)
  expect(submissions[2]).toEqual({ items: [{ keyword: 'dentist in California, US' }, { keyword: 'dentist in San Francisco, California, US' }], include_contacts: false })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
