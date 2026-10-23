import { expect, test } from '@playwright/test'
import type { ExportJobSummary } from '../src/scripts/dashboard/api'
import { registerE2eBrowserIdentity, expectE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'
import { csvDownloadUrl } from './csv-download-server'

registerE2eBrowserIdentity(test)

test('paid Online user can turn contact enrichment off before creating a Job', async ({ page }, testInfo) => {
  const envelope = (data: object) => ({ code: 10000, data })
  const job: ExportJobSummary = { job_no: 'f'.repeat(32) + '00', run_no: 'a'.repeat(32) + '00', status: 'queued', include_contacts: false, total_count: 1, processed_count: 0, record_count: 0, has_file: false, created_at: Date.now(), started_at: null, finished_at: null, error_code: null, keyword_preview: 'coffee Portland', keyword_count: 1 }
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
  await page.getByRole('textbox', { name: 'Keywords', exact: true }).fill('coffee Portland')
  const posted = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/api/client/export/jobs'))
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  expect((await posted).postDataJSON()).toEqual({ items: [{ keyword: 'coffee Portland' }], include_contacts: false })
  await expect(page.getByRole('textbox', { name: 'Keywords', exact: true })).toHaveValue('')
  await expect(contacts).not.toBeChecked()
  await page.screenshot({ path: testInfo.outputPath('paid-contacts-off.png'), fullPage: true, animations: 'disabled' })
})

test('creation polls recent tasks, History auto-expands the job and details read final counts', async ({ page, isMobile }, testInfo) => {
  // 自动展开只来自明确意图（首次应用完整任务号搜索、从最近任务定位）；改筛选、刷新与轮询都不重开用户收起的行
  const envelope = (data: object) => ({ code: 10000, data })
  let created = false
  let completed = false
  let detailCalls = 0
  let detailFail = false
  const reads: string[] = []
  let releaseCreate: () => void = () => {}
  const createGate = new Promise<void>(resolve => { releaseCreate = resolve })
  let historyGate: Promise<void> | null = null
  const newNo = 'a'.repeat(32) + '00'
  const job = (jobNo: string, running = false): ExportJobSummary => ({ job_no: jobNo, run_no: 'c'.repeat(32) + '00', status: running && !completed ? 'collecting' : 'completed', include_contacts: true, total_count: 1, processed_count: completed || !running ? 1 : 0, record_count: completed || !running ? 58 : 0, has_file: completed || !running, created_at: Date.now(), started_at: Date.now(), finished_at: running && !completed ? null : Date.now(), error_code: null, keyword_preview: 'coffee', keyword_count: 1 })
  const older = Array.from({ length: 4 }, (_, i) => job((i + 1).toString(16).padStart(32, '0') + '00'))
  await page.route('**/api/client/auth/me', route => route.fulfill({ json: envelope({ email: 'refresh@example.test', full_name: 'Refresh', credits_balance: 0, created_at: Date.now() }) }))
  await page.route('**/api/client/maps-online/options', route => route.fulfill({ json: envelope({ keyword_limit: 2, logical_sample_limit: 50, contacts_allowed: true, usage: { used: completed ? 58 : 0, total: 1000, period: '2026-09', exhausted: false } }) }))
  await page.route('**/api/client/export/jobs*', async route => {
    if (route.request().method() === 'POST') {
      expect(route.request().postDataJSON()).toEqual({ items: [{ keyword: 'coffee' }], include_contacts: true })
      await createGate
      created = true
      return route.fulfill({ json: envelope({ job: job(newNo, true), items: [] }) })
    }
    const params = new URL(route.request().url()).searchParams
    const q = params.get('q') ?? ''
    const limit = Number(params.get('limit'))
    reads.push(`${limit}:${q}`)
    if (historyGate && limit === 20) await historyGate
    const all = created ? [job(newNo, true), ...older] : older
    const jobs = q ? all.filter(item => item.job_no.startsWith(q)) : all
    return route.fulfill({ json: envelope({ jobs: jobs.slice(0, limit), total: jobs.length, offset: 0, limit }) })
  })
  await page.route(`**/api/client/export/jobs/${newNo}`, route => {
    detailCalls += 1
    if (detailFail) return route.fulfill({ json: { code: 500, msg: 'Detail unavailable.' } })
    return route.fulfill({ json: envelope({ job: job(newNo, true), items: [{ item_index: 0, keyword: 'coffee', viewport: null, result_count: completed ? 58 : 0, completed, error_code: null }] }) })
  })
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('homepage_access_token', 'refresh-token'))
  await page.goto('/dashboard/')
  // Online：最近任务只取 5 条；没有运行中的任务时不轮询
  await expect(page.locator('.jobs-list [data-job]')).toHaveCount(4)
  expect(reads).toEqual(['5:'])
  await page.clock.install()
  await page.getByRole('textbox', { name: 'Keywords', exact: true }).fill('coffee')
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Submitting...', exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Map', exact: true })).toBeDisabled()
  releaseCreate()
  // 提交成功：清空输入，新任务插到最近任务顶部并短暂高亮
  await expect(page.getByRole('textbox', { name: 'Keywords', exact: true })).toHaveValue('')
  await expect(page.locator('.jobs-list [data-job]').first()).toHaveAttribute('data-job', newNo)
  await expect(page.locator(`.jobs-list [data-job="${newNo}"] .badge`)).toHaveText('Collecting')
  expect(reads).toEqual(['5:', '5:'])
  // 有运行中的任务：5 秒静默轮询
  await page.clock.runFor(6000)
  await expect.poll(() => reads.length).toBe(3)

  // 从最近任务定位：History 以完整任务号搜索并自动展开；首次明细失败可重试
  detailFail = true
  await page.locator(`.jobs-list [data-job="${newNo}"] .job-link`).click()
  await expect(page).toHaveURL(new RegExp(`/dashboard/history/\\?q=${newNo}$`))
  const detail = page.locator(`#jd-${newNo}`)
  const toggle = page.locator(`[data-history-expand="${newNo}"]`)
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(detail).toContainText('Failed to load searches for this task.')
  detailFail = false
  await detail.getByRole('button', { name: 'Retry' }).click()
  // 未完成的搜索项：记录数显示占位，状态为 Pending
  await expect(detail.locator('.items tbody')).toContainText('Pending')

  // 运行中：用户收起后，轮询不重新展开，也不读收起行的明细。下一次轮询要等上一次加载结束才排期，
  // 所以等到第二次轮询请求时，第一次轮询的结果已经落到界面上
  const historyReads = () => reads.filter(read => read === `20:${newNo}`).length
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  const collapsedReads = historyReads()
  await expect.poll(async () => {
    await page.clock.runFor(1000)
    return historyReads()
  }, { timeout: 15000 }).toBeGreaterThanOrEqual(collapsedReads + 2)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(detailCalls).toBe(2)
  await toggle.click()
  await expect.poll(() => detailCalls).toBe(3)

  // 运行中：轮询同时静默刷新已展开的明细；进入终态时再刷新一次，不必重新展开即可看到最终计数
  await page.clock.runFor(6000)
  await expect.poll(() => detailCalls).toBe(4)
  completed = true
  await page.clock.runFor(6000)
  // Online 视图保持挂载（v-show），最近任务里也有同一任务：限定在 History 视图内
  await expect(page.locator(`[data-view="history"] [data-job="${newNo}"] .badge`)).toHaveText('Completed')
  await expect(detail.locator('.items tbody')).toContainText('58')
  await expect(detail.locator('.items tbody')).not.toContainText('Pending')
  expect(detailCalls).toBe(5)
  // 最近任务与 History 共用观察表：任务结束只提示一次
  await expect(page.locator('.toast', { hasText: 'Completed' })).toHaveCount(1)
  // 全部进入终态后停止轮询
  const terminalReads = reads.length
  await page.clock.runFor(10000)
  expect(reads).toHaveLength(terminalReads)

  // 已结束任务：用户收起后手动刷新不重开（压住列表响应，确认刷新完成后再断言）
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  let releaseHistory: () => void = () => {}
  historyGate = new Promise<void>(resolve => { releaseHistory = resolve })
  const refreshButton = page.locator('[data-view="history"] .hist-refresh')
  await refreshButton.click()
  await expect(refreshButton).toHaveClass(/is-spinning/)
  historyGate = null
  releaseHistory()
  await expect(refreshButton).not.toHaveClass(/is-spinning/)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(detailCalls).toBe(5)

  // 回到 Online 再点同一条最近任务：查询没变、History 不重新加载，仍要再次展开
  await page.goBack()
  await expect(page).toHaveURL(/\/dashboard\/$/)
  await page.locator(`.jobs-list [data-job="${newNo}"] .job-link`).click()
  await expect(page).toHaveURL(new RegExp(`/dashboard/history/\\?q=${newNo}$`))
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect.poll(() => detailCalls).toBe(6)
  await page.screenshot({ path: testInfo.outputPath('refresh-coordination.png'), fullPage: true, animations: 'disabled' })

  // 只改状态（搜索词不变）：收起所有，新列表返回后也不重新展开、不重读明细
  const statusReads = reads.length
  // 窄屏状态收在 Filters 菜单里：单选后菜单保持打开，Esc 关闭
  if (isMobile) {
    await page.getByRole('button', { name: /^Filters/ }).click()
    await page.getByRole('menuitemradio', { name: 'Completed' }).click()
    await page.keyboard.press('Escape')
  } else await page.getByRole('radio', { name: 'Completed' }).click()
  await expect(page).toHaveURL(new RegExp(`/dashboard/history/\\?q=${newNo}&status=completed$`))
  await expect.poll(() => reads.length).toBe(statusReads + 1)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(detailCalls).toBe(6)

  // History 停在其他状态时从最近任务定位同一任务：新列表返回前就展开并读明细，返回后保持展开
  await page.goBack()
  await expect(page).toHaveURL(/\/dashboard\/$/)
  let releaseJump: () => void = () => {}
  historyGate = new Promise<void>(resolve => { releaseJump = resolve })
  await page.locator(`.jobs-list [data-job="${newNo}"] .job-link`).click()
  await expect(page).toHaveURL(new RegExp(`/dashboard/history/\\?q=${newNo}$`))
  await expect.poll(() => detailCalls).toBe(7)
  historyGate = null
  releaseJump()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(detailCalls).toBe(7)

  // 新词的列表还在途时改回原任务号（中间请求被取代，没有失败）：原任务号仍按首次应用自动展开
  const search = page.getByRole('searchbox', { name: 'Search tasks' })
  let releaseSwap: () => void = () => {}
  historyGate = new Promise<void>(resolve => { releaseSwap = resolve })
  await search.fill('0000')
  await search.press('Enter')
  await expect(page).toHaveURL(/\/dashboard\/history\/\?q=0000$/)
  await search.fill(newNo)
  await search.press('Enter')
  await expect(page).toHaveURL(new RegExp(`/dashboard/history/\\?q=${newNo}$`))
  historyGate = null
  releaseSwap()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect.poll(() => detailCalls).toBe(8)
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
  const job = (): ExportJobSummary => ({ job_no: jobNo, run_no: 'e'.repeat(32) + '00', status: completed ? 'completed' : 'collecting', include_contacts: false, total_count: 2, processed_count: completed ? 2 : 0, record_count: completed ? 20 : 0, has_file: completed, created_at: Date.now(), started_at: Date.now(), finished_at: completed ? Date.now() : null, error_code: null, keyword_preview: 'coffee Portland', keyword_count: 2 })
  await page.route('**/api/client/maps-online/preview', async route => {
    previewCalls += 1
    expect(Object.keys(route.request().postDataJSON())).toEqual(['keyword'])
    expect(route.request().headers()['x-device-id']).toBeTruthy()
    if (previewCalls === 1) return route.fulfill({ json: { code: 500, data: {} } })
    if (previewCalls === 2) return route.fulfill({ json: envelope({ count: 0, rows: [] }) })
    if (previewCalls >= 4) return route.fulfill({ json: { code: 998, data: {} } })
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
    return route.fulfill({ json: envelope({ jobs: created ? [job()] : [], total: created ? 1 : 0, offset: 0, limit: 5 }) })
  })
  await page.route(`**/api/client/export/jobs/${jobNo}`, route => route.fulfill({ json: envelope({ job: job(), items: [{ item_index: 0, keyword: 'coffee Portland', viewport: null, result_count: completed ? 20 : 0, completed, error_code: null }, { item_index: 1, keyword: 'coffee Austin', viewport: null, result_count: 0, completed, error_code: null }] }) }))
  const signedCsvUrl = await csvDownloadUrl(`${jobNo}.csv`)
  await page.route(`**/api/client/export/jobs/${jobNo}/download`, route => route.fulfill({ json: envelope({ url: signedCsvUrl, filename: `${jobNo}.csv` }) }))
  await page.goto('/')
  await expectE2eBrowserIdentity(page, testInfo, expect)
  await page.getByLabel('Search keyword').fill('anonymous keyword')
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Could not load the preview')
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  await expect(page.getByText('No businesses found on the first results page.')).toBeVisible()
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  // 结果表：返回的 3 行预览 + 其余结果的锁定行（最多 4 行）
  await expect(page.locator('[data-preview-row]')).toHaveCount(3)
  await expect(page.locator('[data-preview-locked]')).toHaveCount(4)
  await expect(page.getByText('20 businesses on the first results page')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('preview.png'), fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: 'Preview results', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(previewCalls).toBe(4)
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
  await page.locator('.composer').getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByRole('textbox', { name: 'Keywords', exact: true })).toHaveValue('')
  await expect(page.getByLabel('Find emails and social profiles')).toBeDisabled()
  await expect(page.getByLabel('Find emails and social profiles')).not.toBeChecked()
  await page.getByRole('textbox', { name: 'Keywords', exact: true }).fill('one\ntwo\nthree')
  await expect(page.getByRole('button', { name: 'Start scraping', exact: true })).toBeDisabled()
  await page.getByRole('textbox', { name: 'Keywords', exact: true }).fill('coffee Portland\ncoffee Austin\ncoffee Portland\n')
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  await expect(page.getByText('The collector is unavailable. Please try again.')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Keywords', exact: true })).toHaveValue('coffee Portland\ncoffee Austin\ncoffee Portland\n')
  submitFail = false
  await page.getByRole('button', { name: 'Start scraping', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Keywords', exact: true })).toHaveValue('')
  await expect(page.locator(`.jobs-list [data-job="${jobNo}"] .badge`)).toHaveText('Collecting')
  completed = true
  // 最近任务每 5 秒轮询：任务结束后刷新额度
  await expect(page.locator(`.jobs-list [data-job="${jobNo}"] .badge`)).toHaveText('Completed', { timeout: 10000 })
  await expect(page.locator('.usage-mini')).toContainText('20 / 1,000 records this month')
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
