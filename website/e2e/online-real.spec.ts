/** 真实本地 Backend + 负责人发布的构造 CSV；不调用 Collector，不代表 Google 联调。 */
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

test('local Export dashboard reads and downloads the owner fixture and rejects other users', async ({ page }, testInfo) => {
  const ownerToken = process.env.E2E_EXPORT_OWNER_TOKEN
  const otherToken = process.env.E2E_EXPORT_OTHER_TOKEN
  const jobNo = process.env.E2E_EXPORT_JOB_NO
  test.skip(!process.env.E2E_REAL_API_BASE_URL || !ownerToken || !otherToken || !jobNo,
    'LOCAL_EXPORT_FIXTURE_UNAVAILABLE: 需要负责人交接独占后端、两隔离账号和已发布构造 CSV')
  if (!ownerToken || !otherToken || !jobNo) return
  const apiBase = process.env.E2E_REAL_API_BASE_URL
  await page.goto('/')
  await page.evaluate(token => localStorage.setItem('homepage_access_token', token), ownerToken)
  await page.goto('/dashboard/')
  const row = page.locator(`[data-history-expand="${jobNo}"]`).locator('xpath=ancestor::tr')
  await expect(row).toBeVisible()
  await page.locator(`[data-history-expand="${jobNo}"]`).click()
  await expect(page.locator('.history-job-meta')).toBeVisible()
  await expect(page.locator('.history-detail-table tbody tr').first()).toBeVisible()
  const event = page.waitForEvent('download')
  await row.getByRole('button', { name: 'Download CSV' }).click()
  const csv = await event
  const csvPath = testInfo.outputPath(csv.suggestedFilename())
  await csv.saveAs(csvPath)
  expect(csv.suggestedFilename()).toBe(`${jobNo}.csv`)
  const contents = readFileSync(csvPath, 'utf8')
  expect(contents.startsWith('\ufeff')).toBe(true)
  expect(contents.split(/\r?\n/)[0].split(',')).toHaveLength(37)
  expect(contents.split(/\r?\n/)[0]).toContain('Search Keyword')

  // 请求直接到真实后端，不拦截本项目 API；权限证据不依赖前端隐藏按钮。
  for (const suffix of ['', '/download']) {
    const response = await page.request.get(`${apiBase}/api/client/export/jobs/${jobNo}${suffix}`,
      { headers: { Authorization: `Bearer ${otherToken}` } })
    expect(response.status()).toBe(200)
    expect(await response.json()).toMatchObject({ code: 404 })
  }
  const anonymous = await page.request.post(`${apiBase}/api/client/export/jobs`,
    { data: { items: [{ keyword: 'WEBSITE local permission check' }] } })
  expect(anonymous.status()).toBe(401)
  expect(await anonymous.json()).toMatchObject({ code: 10002 })
  await page.screenshot({ path: testInfo.outputPath('local-export-fixture.png'), fullPage: true, animations: 'disabled' })
  await testInfo.attach('local-export-fixture', { body: JSON.stringify({ jobNo, filename: csv.suggestedFilename(), source: 'backend-owner constructed CSV; no Collector/Google call' }), contentType: 'application/json' })
})
