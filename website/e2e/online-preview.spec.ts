import { expect, test } from '@playwright/test'
import { registerE2eBrowserIdentity, expectE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

test('creation on page two pauses polling and reopening details reads completed counts', async ({ page }, testInfo) => {
  const envelope = (data: object) => ({ code: 10000, data })
  let created = false
  let completed = false
  let detailCalls = 0
  const offsets: number[] = []
  let releaseCreate: () => void = () => {}
  const createGate = new Promise<void>(resolve => { releaseCreate = resolve })
  let holdPage = false
  let releasePage: () => void = () => {}
  const pageGate = new Promise<void>(resolve => { releasePage = resolve })
  const task = (taskNo: string, processing = false) => ({ task_no: taskNo, status: processing && !completed ? 'processing' : 'completed', total_count: 1, processed_count: completed ? 1 : 0, record_count: completed ? 58 : 0, created_at: Date.now() })
  await page.route('**/api/client/auth/me', route => route.fulfill({ json: envelope({ email: 'refresh@example.test', full_name: 'Refresh', credits_balance: 0, created_at: Date.now() }) }))
  await page.route('**/api/client/maps-online/options', route => route.fulfill({ json: envelope({ keyword_limit: 2, contacts_allowed: false, usage: { used: completed ? 58 : 0, total: 1000, period: '2026-09', exhausted: false } }) }))
  await page.route('**/api/client/maps-online/tasks*', async route => {
    if (route.request().method() === 'POST') {
      await createGate
      created = true
      return route.fulfill({ json: envelope(task('NEW', true)) })
    }
    const offset = Number(new URL(route.request().url()).searchParams.get('offset'))
    offsets.push(offset)
    if (holdPage) await pageGate
    return route.fulfill({ json: envelope({ tasks: offset === 20 ? [task('OLD', true)] : created ? [task('NEW', true)] : Array.from({ length: 20 }, (_, i) => task(`T-${i}`)), total: 21, offset, limit: 20 }) })
  })
  await page.route('**/api/client/maps-online/tasks/NEW', route => {
    detailCalls += 1
    return route.fulfill({ json: envelope({ task: task('NEW', true), items: [{ item_id: 1, sequence: 0, keyword: 'coffee', record_count: completed ? 58 : 0 }] }) })
  })
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('homepage_access_token', 'refresh-token'))
  await page.goto('/dashboard/')
  await page.locator('[data-history-next]').click()
  await expect(page.locator('[data-history-expand="OLD"]')).toBeVisible()
  await page.clock.install()
  await page.getByLabel('Keywords', { exact: true }).fill('coffee')
  holdPage = true
  const polling = page.waitForRequest(request => request.method() === 'GET' && request.url().includes('/maps-online/tasks?'))
  await page.clock.runFor(6000)
  await polling
  await expect(page.getByRole('button', { name: 'Start scraping', exact: true })).toBeDisabled()
  holdPage = false
  releasePage()
  await expect(page.getByRole('button', { name: 'Start scraping', exact: true })).toBeEnabled()
  const posted = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/maps-online/tasks'))
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  await posted
  await page.clock.runFor(6000)
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  expect(offsets).toEqual([0, 20, 20])
  releaseCreate()
  await expect(page.locator('[data-history-expand="NEW"]')).toBeVisible()
  expect(offsets).toEqual([0, 20, 20, 0])
  await page.locator('[data-history-expand="NEW"]').click()
  await expect(page.locator('.history-detail-table tbody')).toContainText('0')
  await page.locator('[data-history-expand="NEW"]').click()
  completed = true
  await page.clock.runFor(6000)
  await expect(page.locator('[data-status="completed"]')).toBeVisible()
  await page.locator('[data-history-expand="NEW"]').click()
  await expect(page.locator('.history-detail-table tbody')).toContainText('58')
  expect(detailCalls).toBe(2)
  await page.screenshot({ path: testInfo.outputPath('refresh-coordination.png'), fullPage: true })
})

test('preview and manual dashboard creation', async ({ page }, testInfo) => {
  const envelope = (data: object) => ({ code: 10000, data })
  let previewCalls = 0
  let created = false
  let completed = false
  let optionsFail = true
  let submitFail = true
  let exhausted = false
  const task = () => ({ task_no: 'PREVIEW-E2E', status: completed ? 'completed' : 'processing', total_count: 2, processed_count: completed ? 2 : 0, record_count: completed ? 20 : 0, created_at: Date.now() })
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
  await page.route('**/api/client/maps-online/options', route => route.fulfill({ json: optionsFail ? { code: 500, data: {} } : envelope({ keyword_limit: 2, contacts_allowed: false, usage: { used: completed ? 20 : 0, total: 1000, period: '2026-09', exhausted } }) }))
  await page.route('**/api/client/maps-online/tasks*', route => {
    if (route.request().method() === 'POST') {
      expect(route.request().postDataJSON()).toEqual({ keywords: ['coffee Portland', 'coffee Austin'], include_contacts: false })
      if (submitFail) return route.fulfill({ json: { code: 500, data: {} } })
      created = true
      return route.fulfill({ json: envelope(task()) })
    }
    return route.fulfill({ json: envelope({ tasks: created ? [task()] : [], total: created ? 1 : 0, offset: 0, limit: 20 }) })
  })
  await page.route('**/api/client/maps-online/tasks/PREVIEW-E2E', route => route.fulfill({ json: envelope({ task: task(), items: [{ item_id: 1, sequence: 0, keyword: 'coffee Portland', record_count: completed ? 20 : 0 }] }) }))
  await page.route('**/api/client/maps-online/tasks/PREVIEW-E2E/download', route => route.fulfill({ contentType: 'application/zip', body: Buffer.from('PK\x03\x04') }))
  await page.goto('/')
  await expectE2eBrowserIdentity(page, testInfo, expect)
  await page.getByLabel('Search keyword').fill('anonymous keyword')
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Could not load the preview')
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  await expect(page.getByText('No businesses found on the first results page.')).toBeVisible()
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  await expect(page.locator('.preview-table-wrap tbody tr')).toHaveCount(4)
  await expect(page.getByText('20 businesses on the first results page')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('preview.png'), fullPage: true })
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
  await expect(page.getByText('Task submission failed. Refresh the history before trying again.')).toBeVisible()
  await expect(page.getByLabel('Keywords', { exact: true })).toHaveValue('coffee Portland\ncoffee Austin\ncoffee Portland\n')
  submitFail = false
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  await expect(page.getByLabel('Keywords', { exact: true })).toHaveValue('')
  await expect(page.locator('[data-status="processing"]')).toBeVisible()
  await page.locator('[data-history-expand]').click()
  completed = true
  await expect(page.locator('[data-status="completed"]')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('20 / 1000 records this month')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download ZIP' }).click()
  expect((await download).suggestedFilename()).toBe('PREVIEW-E2E.zip')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('dashboard.png'), fullPage: true })
  exhausted = true
  await page.reload()
  await expect(page.getByText('Your monthly quota is exhausted.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start scraping', exact: true })).toBeDisabled()
})
