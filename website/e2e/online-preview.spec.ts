import { expect, test } from '@playwright/test'
import type { ExportJobSummary } from '../src/scripts/dashboard/api'
import { registerE2eBrowserIdentity, expectE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

test('paid Online user can turn contact enrichment off before creating a Job', async ({ page }, testInfo) => {
  const envelope = (data: object) => ({ code: 10000, data })
  const job: ExportJobSummary = { job_no: 'f'.repeat(32) + '00', run_no: 'a'.repeat(32) + '00', status: 'queued', include_contacts: false, total_count: 1, processed_count: 0, record_count: 0, has_file: false, created_at: Date.now(), started_at: null, finished_at: null, error_code: null }
  await page.route('**/api/client/auth/me', route => route.fulfill({ json: envelope({
    email: 'paid@example.test', full_name: 'Paid User', credits_balance: 0,
    maps_online_subscription: { status: 'active', period: 'month', display_name: 'Online Lite', expires_at: Date.now() + 86400000, auto_renew: false, payment_method: 'paypal' }
  }) }))
  await page.route('**/api/client/maps-online/options', route => route.fulfill({ json: envelope({
    keyword_limit: 5, logical_sample_limit: 50, contacts_allowed: true,
    usage: { used: 0, total: 20000, period: '2026-10', exhausted: false }
  }) }))
  await page.route('**/api/client/export/jobs*', route => route.fulfill({ json: envelope(
    route.request().method() === 'POST' ? { job, items: [] } : { jobs: [], total: 0, offset: 0, limit: 20 }
  ) }))
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('homepage_access_token', 'paid-token'))
  await page.goto('/dashboard/')
  const contacts = page.getByLabel('Find emails and social profiles')
  await expect(contacts).toBeEnabled()
  await expect(contacts).toBeChecked()
  await contacts.uncheck()
  await page.getByLabel('Keywords', { exact: true }).fill('coffee Portland')
  const posted = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/api/client/export/jobs'))
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  expect((await posted).postDataJSON()).toEqual({ items: [{ keyword: 'coffee Portland' }], include_contacts: false })
  await expect(page.getByLabel('Keywords', { exact: true })).toHaveValue('')
  await expect(contacts).not.toBeChecked()
  await page.screenshot({ path: testInfo.outputPath('paid-contacts-off.png'), fullPage: true, animations: 'disabled' })
})

test('creation on page two pauses polling and reopening details reads completed counts', async ({ page }, testInfo) => {
  const envelope = (data: object) => ({ code: 10000, data })
  let created = false
  let completed = false
  let detailCalls = 0
  let detailFail = false
  const offsets: number[] = []
  let releaseCreate: () => void = () => {}
  const createGate = new Promise<void>(resolve => { releaseCreate = resolve })
  let holdPage = false
  let releasePage: () => void = () => {}
  const pageGate = new Promise<void>(resolve => { releasePage = resolve })
  const newNo = 'a'.repeat(32) + '00'
  const oldNo = 'b'.repeat(32) + '00'
  const job = (jobNo: string, running = false): ExportJobSummary => ({ job_no: jobNo, run_no: 'c'.repeat(32) + '00', status: running && !completed ? 'collecting' : 'completed', include_contacts: true, total_count: 1, processed_count: completed || !running ? 1 : 0, record_count: completed || !running ? 58 : 0, has_file: completed || !running, created_at: Date.now(), started_at: Date.now(), finished_at: running && !completed ? null : Date.now(), error_code: null })
  await page.route('**/api/client/auth/me', route => route.fulfill({ json: envelope({ email: 'refresh@example.test', full_name: 'Refresh', credits_balance: 0, created_at: Date.now() }) }))
  await page.route('**/api/client/maps-online/options', route => route.fulfill({ json: envelope({ keyword_limit: 2, logical_sample_limit: 50, contacts_allowed: true, usage: { used: completed ? 58 : 0, total: 1000, period: '2026-09', exhausted: false } }) }))
  await page.route('**/api/client/export/jobs*', async route => {
    if (route.request().method() === 'POST') {
      expect(route.request().postDataJSON()).toEqual({ items: [{ keyword: 'coffee' }], include_contacts: true })
      await createGate
      created = true
      return route.fulfill({ json: envelope({ job: job(newNo, true), items: [] }) })
    }
    const offset = Number(new URL(route.request().url()).searchParams.get('offset'))
    offsets.push(offset)
    if (holdPage) await pageGate
    return route.fulfill({ json: envelope({ jobs: offset === 20 ? [job(oldNo, true)] : created ? [job(newNo, true)] : Array.from({ length: 20 }, (_, i) => job(i.toString(16).padStart(32, '0') + '00')), total: 21, offset, limit: 20 }) })
  })
  await page.route(`**/api/client/export/jobs/${newNo}`, route => {
    detailCalls += 1
    if (detailFail) return route.fulfill({ json: { code: 500, msg: 'Detail unavailable.' } })
    return route.fulfill({ json: envelope({ job: job(newNo, true), items: [{ item_index: 0, keyword: 'coffee', viewport: null, result_count: completed ? 58 : 0, completed, error_code: null }] }) })
  })
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('homepage_access_token', 'refresh-token'))
  await page.goto('/dashboard/')
  await page.locator('[data-history-next]').click()
  await expect(page.locator(`[data-history-expand="${oldNo}"]`)).toBeVisible()
  await page.clock.install()
  await page.getByLabel('Keywords', { exact: true }).fill('coffee')
  holdPage = true
  const polling = page.waitForRequest(request => request.method() === 'GET' && request.url().includes('/export/jobs?'))
  await page.clock.runFor(6000)
  await polling
  await expect(page.getByRole('button', { name: 'Start scraping', exact: true })).toBeDisabled()
  holdPage = false
  releasePage()
  await expect(page.getByRole('button', { name: 'Start scraping', exact: true })).toBeEnabled()
  const posted = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/export/jobs'))
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  await posted
  await page.clock.runFor(6000)
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  expect(offsets).toEqual([0, 20, 20])
  releaseCreate()
  await expect(page.locator(`[data-history-expand="${newNo}"]`)).toBeVisible()
  expect(offsets).toEqual([0, 20, 20, 0])
  await page.locator(`[data-history-expand="${newNo}"]`).click()
  await expect(page.locator('.history-detail-table tbody')).toContainText('0')
  detailFail = true
  await page.clock.runFor(6000)
  await expect(page.locator(`[data-history-expand="${newNo}"]`)).toBeVisible()
  await expect(page.locator('.history-detail-error')).toContainText('Failed to load searches')
  detailFail = false
  await page.locator('.history-detail-error').getByRole('button', { name: 'Retry' }).click()
  await expect(page.locator('.history-detail-table tbody')).toContainText('0')
  await page.locator(`[data-history-expand="${newNo}"]`).click()
  completed = true
  await page.clock.runFor(6000)
  await expect(page.locator('[data-status="completed"]')).toBeVisible()
  await page.locator(`[data-history-expand="${newNo}"]`).click()
  await expect(page.locator('.history-detail-table tbody')).toContainText('58')
  expect(detailCalls).toBe(4)
  const terminalReads = offsets.length
  await page.clock.runFor(10000)
  expect(offsets).toHaveLength(terminalReads)
  await page.screenshot({ path: testInfo.outputPath('refresh-coordination.png'), fullPage: true, animations: 'disabled' })
})

test('preview and manual dashboard creation', async ({ page }, testInfo) => {
  const envelope = (data: object) => ({ code: 10000, data })
  let previewCalls = 0
  let created = false
  let completed = false
  let optionsFail = true
  let submitFail = true
  let exhausted = false
  const jobNo = 'd'.repeat(32) + '00'
  const job = (): ExportJobSummary => ({ job_no: jobNo, run_no: 'e'.repeat(32) + '00', status: completed ? 'completed' : 'collecting', include_contacts: false, total_count: 2, processed_count: completed ? 2 : 0, record_count: completed ? 20 : 0, has_file: completed, created_at: Date.now(), started_at: Date.now(), finished_at: completed ? Date.now() : null, error_code: null })
  await page.route('**/api/client/maps-online/preview', async route => {
    previewCalls += 1
    expect(Object.keys(route.request().postDataJSON())).toEqual(['keyword'])
    if (previewCalls === 1) return route.fulfill({ json: { code: 500, data: {} } })
    if (previewCalls === 2) return route.fulfill({ json: envelope({ count: 0, rows: [] }) })
    return route.fulfill({ json: envelope({ count: 20, rows: Array.from({ length: 3 }, (_, i) => ({ name: `Cafe ${i}`, address: 'Portland', category: 'Coffee shop', rating: 4.8, review_count: null, phone: null })) }) })
  })
  await page.route('**/api/client/auth/me', route => route.fulfill({ json: envelope({ email: 'preview@example.test', full_name: 'Preview', credits_balance: 0, created_at: Date.now() }) }))
  await page.route('**/api/client/auth/send-email-code', route => route.fulfill({ json: envelope({}) }))
  await page.route('**/api/client/auth/email-verify-login', route => route.fulfill({ json: envelope({ access_token: 'preview-token', user: { email: 'preview@example.test', full_name: 'Preview', credits_balance: 0 } }) }))
  await page.route('**/api/client/maps-online/options', route => route.fulfill({ json: optionsFail ? { code: 500, data: {} } : envelope({ keyword_limit: 2, logical_sample_limit: 50, contacts_allowed: false, usage: { used: completed ? 20 : 0, total: 1000, period: '2026-09', exhausted } }) }))
  await page.route('**/api/client/export/jobs*', route => {
    if (route.request().method() === 'POST') {
      expect(route.request().postDataJSON()).toEqual({ items: [{ keyword: 'coffee Portland' }, { keyword: 'coffee Austin' }], include_contacts: false })
      if (submitFail) return route.fulfill({ json: { code: 500, data: {}, msg: 'The collector is unavailable. Please try again.' } })
      created = true
      return route.fulfill({ json: envelope({ job: job(), items: [] }) })
    }
    return route.fulfill({ json: envelope({ jobs: created ? [job()] : [], total: created ? 1 : 0, offset: 0, limit: 20 }) })
  })
  await page.route(`**/api/client/export/jobs/${jobNo}`, route => route.fulfill({ json: envelope({ job: job(), items: [{ item_index: 0, keyword: 'coffee Portland', viewport: null, result_count: completed ? 20 : 0, completed, error_code: null }, { item_index: 1, keyword: 'coffee Austin', viewport: null, result_count: 0, completed, error_code: null }] }) }))
  await page.route(`**/api/client/export/jobs/${jobNo}/download`, route => route.fulfill({ json: envelope({ url: 'https://storage.download.example.com/preview.csv', filename: `${jobNo}.csv` }) }))
  await page.route('https://storage.download.example.com/preview.csv', route => route.fulfill({ contentType: 'text/csv', headers: { 'Content-Disposition': `attachment; filename="${jobNo}.csv"` }, body: '#,Name\nRow number,Business name\n1,Cafe' }))
  await page.goto('/')
  await expectE2eBrowserIdentity(page, testInfo, expect)
  await page.getByLabel('Search keyword').fill('anonymous keyword')
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Could not load the preview')
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  await expect(page.getByText('No businesses found on the first results page.')).toBeVisible()
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  // 剧场面板：返回的 3 行预览 + 其余结果的锁定行（最多 4 行）
  await expect(page.locator('[data-preview-row]')).toHaveCount(3)
  await expect(page.locator('[data-preview-locked]')).toHaveCount(4)
  await expect(page.getByText('20 businesses on the first results page')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('preview.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Sign in to start a full task' }).click()
  await expect(page.getByLabel('Search keyword')).toHaveValue('')
  await page.locator('[data-download-email-entry-button]').click()
  await page.locator('[data-download-login-email]').fill('preview@example.test')
  await page.locator('[data-download-continue-email]').click()
  await page.locator('[data-download-login-code]').fill('123456')
  await page.locator('[data-download-login-submit]').click()
  await expect(page).toHaveURL(/\/dashboard\/$/)
  expect(created).toBe(false)
  await expect(page.getByText('Could not load your task limits. Please retry.')).toBeVisible()
  optionsFail = false
  await page.locator('.create-form').getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByLabel('Keywords', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Find emails and social profiles')).toBeDisabled()
  await expect(page.getByLabel('Find emails and social profiles')).not.toBeChecked()
  await page.getByLabel('Keywords', { exact: true }).fill('one\ntwo\nthree')
  await expect(page.getByRole('button', { name: 'Start scraping', exact: true })).toBeDisabled()
  await page.getByLabel('Keywords', { exact: true }).fill('coffee Portland\ncoffee Austin\ncoffee Portland\n')
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  await expect(page.getByText('The collector is unavailable. Please try again.')).toBeVisible()
  await expect(page.getByLabel('Keywords', { exact: true })).toHaveValue('coffee Portland\ncoffee Austin\ncoffee Portland\n')
  submitFail = false
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  await expect(page.getByLabel('Keywords', { exact: true })).toHaveValue('')
  await expect(page.locator('[data-status="collecting"]')).toBeVisible()
  await page.locator('[data-history-expand]').click()
  completed = true
  await expect(page.locator('[data-status="completed"]')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('20 / 1000 records this month')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download CSV' }).click()
  expect((await download).suggestedFilename()).toBe(`${jobNo}.csv`)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('dashboard.png'), fullPage: true, animations: 'disabled' })
  exhausted = true
  await page.reload()
  await expect(page.getByText('Your monthly quota is exhausted.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start scraping', exact: true })).toBeDisabled()
})
