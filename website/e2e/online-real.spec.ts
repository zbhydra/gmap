import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

test('real Online dashboard creates and downloads Google results', async ({ page }, testInfo) => {
  test.skip(!process.env.E2E_REAL_API_BASE_URL, 'REAL_API_UNAVAILABLE: 需要真实后端入口')
  test.setTimeout(180000)
  const output = execFileSync('../backend/.venv/bin/python', ['scripts/e2e_seed_user.py', '--action', 'seed', '--scenario', 'pricing-review-reward'], { cwd: '../backend', encoding: 'utf8' })
  const seed: { token?: string } = JSON.parse(output.trim())
  if (typeof seed.token !== 'string') throw new Error('online real: seed token missing')
  await page.goto('/')
  await page.evaluate(token => localStorage.setItem('homepage_access_token', token), seed.token)
  await page.goto('/dashboard/')
  await expect(page.getByLabel('Keywords', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Find emails and social profiles')).not.toBeChecked()
  await page.getByLabel('Keywords', { exact: true }).fill('coffee shop in Portland')
  const creation = page.waitForResponse(response => response.url().endsWith('/api/client/maps-online/tasks') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  const response = await creation
  const body: { code?: number; data?: { task_no?: string } } = await response.json()
  expect(response.status()).toBe(200)
  expect(body.code).toBe(10000)
  if (typeof body.data?.task_no !== 'string') throw new Error('online real: task number missing')
  const taskNo = body.data.task_no
  await page.locator(`[data-history-expand="${taskNo}"]`).click()
  await expect(page.locator(`[data-history-expand="${taskNo}"]`).locator('xpath=ancestor::tr').locator('[data-status="completed"]')).toBeVisible({ timeout: 150000 })
  const csvEvent = page.waitForEvent('download')
  await page.locator(`[data-history-expand="${taskNo}"]`).locator('xpath=ancestor::tr/following-sibling::tr[1]').locator('[data-history-csv]').click()
  const csv = await csvEvent
  const csvPath = testInfo.outputPath(csv.suggestedFilename())
  await csv.saveAs(csvPath)
  expect(readFileSync(csvPath, 'utf8')).toContain('coffee shop in Portland')
  const zipEvent = page.waitForEvent('download')
  await page.locator(`[data-history-zip="${taskNo}"]`).click()
  const zip = await zipEvent
  const zipPath = testInfo.outputPath(zip.suggestedFilename())
  await zip.saveAs(zipPath)
  expect(readFileSync(zipPath).subarray(0, 2).toString()).toBe('PK')
  await page.screenshot({ path: testInfo.outputPath('real-dashboard.png'), fullPage: true })
  await testInfo.attach('real-task', { body: JSON.stringify({ taskNo, csv: csv.suggestedFilename(), zip: zip.suggestedFilename() }), contentType: 'application/json' })
})
