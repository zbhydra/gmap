/**
 * Dashboard 工作区 e2e。
 *
 * mock 跑：PUBLIC_API_BASE_URL 指向假地址；spec 内 page.route 拦截自有
 * /api/client/** 接口，签名下载地址由本机 CSV 服务提供（见 csv-download-server.ts）。
 * 渠道管理与 Pricing 购买主路径分别来自迁移后的订阅页与 website.spec.ts。
 *
 * 1. 匿名入口：登录门槛打开站级登录弹窗 / 取消回主页；导航邮箱验证码登录成功进入 Dashboard（Online 视图）。
 * 2. History 视图：列表、分页（地址同步）、明细展开、整 Job CSV 下载与无文件就地提示、无匹配时清除筛选。
 * 3. 订阅视图：三线状态（免费 / 有效 / 不可用）、Pricing tab 跳转、渠道管理 portal。
 * 4. API 接入空态、生成中离开视图不留明文、工作区 noindex、退出回主页与移动视口可达性。
 */
import { expect, test } from '@playwright/test'
import type { ExportJobSummary } from '../src/scripts/dashboard/api'

import { expectE2eBrowserIdentity, registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'
import { csvDownloadUrl } from './csv-download-server'

registerE2eBrowserIdentity(test)

test.beforeEach(async ({ page }) => {
  await page.route('**/api/client/maps-online/options', route => route.fulfill({
    json: envelope({ keyword_limit: 2, logical_sample_limit: 50, contacts_allowed: false,
      usage: { used: 0, total: 1000, period: '2026-10', exhausted: false } })
  }))
})

/** 后端标准响应信封（成功码 10000）。 */
function envelope<T extends object>(data: T): { code: number; data: T } {
  return { code: 10000, data }
}

/** auth/me 的三线订阅摘要（按用例可覆盖）。 */
const SUBSCRIPTIONS = {
  online: {
    status: 'active',
    period: 'month',
    display_name: 'Online Basic',
    expires_at: Date.parse('2026-10-01T00:00:00Z'),
    auto_renew: false,
    payment_method: 'paypal'
  },
  extension: {
    status: 'active',
    period: 'month',
    display_name: 'Maps Pro',
    expires_at: Date.parse('2026-10-01T00:00:00Z'),
    auto_renew: true,
    payment_method: 'clink'
  },
  api: {
    status: 'unavailable',
    period: 'unavailable',
    display_name: 'API',
    expires_at: null,
    auto_renew: false,
    payment_method: null
  }
} as const

/** 预置登录态：先到站点根再写 token，避免 addInitScript 在退出回首页后重新注入。 */
async function signInByStoredToken(page: import('@playwright/test').Page, token: string): Promise<void> {
  await page.goto('/')
  await page.evaluate(value => window.localStorage.setItem('homepage_access_token', value), token)
}

/** 打开导航登录入口（移动端在汉堡菜单内）。 */
async function openNavSignIn(page: import('@playwright/test').Page, isMobile: boolean): Promise<void> {
  if (isMobile) {
    await page.locator('[data-menu-toggle]').click()
    await page.locator('[data-mobile-menu] [data-site-auth-entry]').click()
    return
  }
  await page.locator('[data-nav] [data-site-auth-entry]').click()
}

/** 匿名 / 登录通用的 auth/me mock。 */
function mockAuthMe(page: import('@playwright/test').Page): void {
  page.route('**/api/client/auth/me', route =>
    route.fulfill({
      json: envelope({
        email: 'hydra@mapsgrab.test',
        full_name: 'Hydra',
        credits_balance: 0,
        created_at: Date.parse('2026-01-01T00:00:00Z'),
        maps_online_subscription: SUBSCRIPTIONS.online,
        maps_extension_subscription: SUBSCRIPTIONS.extension,
        maps_api_subscription: SUBSCRIPTIONS.api
      })
    })
  )
}

/** 两页历史，包含六种状态及合法零结果。 */
function buildJobs(): ExportJobSummary[] {
  const createdBase = Date.parse('2026-09-01T12:00:00Z')
  return Array.from({ length: 40 }, (_, index) => {
    const status = index === 0 ? 'partial' : index === 2 ? 'failed'
      : index === 29 ? 'collecting' : index === 30 ? 'queued' : index === 31 ? 'publishing' : 'completed'
    const running = index >= 29 && index <= 31
    const hasFile = !running && index !== 1 && index !== 2
    return {
      job_no: (index + 1).toString(16).padStart(32, '0') + '00',
      run_no: (index + 101).toString(16).padStart(32, '0') + '00',
      status,
      include_contacts: index === 0,
      total_count: 3,
      processed_count: running ? 0 : 3,
      record_count: hasFile ? 120 : 0,
      has_file: hasFile,
      created_at: createdBase - index * 3600000,
      started_at: status === 'queued' ? null : createdBase - index * 3600000 + 1000,
      finished_at: running ? null : createdBase - index * 3600000 + 60000,
      error_code: status === 'partial' ? 31302 : status === 'failed' ? 31304 : null,
      keyword_preview: `keyword ${index + 1}`,
      keyword_count: 1 + (index % 3)
    }
  })
}

test('dashboard anonymous entry: site modal opens, cancel returns home, email login lands on dashboard', async ({ page, isMobile }) => {
  mockAuthMe(page)
  await page.route('**/api/client/auth/send-email-code', route => route.fulfill({ json: envelope({}) }))
  await page.route('**/api/client/auth/email-verify-login', route =>
    route.fulfill({
      json: envelope({
        access_token: 'e2e-dashboard-token',
        user: {
          email: 'hydra@mapsgrab.test',
          full_name: 'Hydra',
          credits_balance: 0
        }
      })
    })
  )
  await page.route(/\/api\/client\/export\/jobs\?/, route =>
    route.fulfill({ json: envelope({ jobs: buildJobs().slice(0, 20), total: 40, offset: 0, limit: 20 }) })
  )

  // 匿名直达工作区：登录入口，不加载私人数据。
  await page.goto('/dashboard/')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.locator('[data-history-expand]')).toHaveCount(0)
  await expect(page.getByText('Sign in to see your Online export history.')).toBeVisible()

  // 打开站级登录弹窗后取消（Escape）：回当前语言主页。
  await page.locator('main [data-site-auth-entry]').click()
  const modal = page.locator('[data-download-auth-modal]')
  await expect(modal).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(url => new URL(url).pathname === '/')

  // API 工作区同样统一：匿名取消登录回主页。
  await page.goto('/dashboard/api/')
  await expect(page.locator('main [data-site-auth-entry]')).toBeVisible()
  await page.locator('main [data-site-auth-entry]').click()
  await expect(modal).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(url => new URL(url).pathname === '/')

  // 导航登录：邮箱验证码路径，登录成功后进入 Dashboard（移动端登录入口在汉堡菜单内）。
  await page.goto('/')
  const navSignIn = page.locator(isMobile ? '[data-mobile-menu] [data-site-auth-entry]' : '[data-nav] [data-site-auth-entry]')
  if (isMobile) {
    await page.locator('[data-menu-toggle]').click()
  }
  await expect(navSignIn).toBeVisible()
  await navSignIn.click()
  await expect(modal).toBeVisible()
  await page.locator('[data-download-email-entry-button]').click()
  await page.locator('[data-download-login-email]').fill('hydra@mapsgrab.test')
  await page.locator('[data-download-continue-email]').click()
  await page.locator('[data-download-login-code]').fill('123456')
  await page.locator('[data-download-login-submit]').click()

  await expect(page).toHaveURL(/\/dashboard\/$/)
  // 工作区页不渲染营销导航：唯一菜单是工作区侧栏（窄屏收起，菜单按钮可达）
  await expect(page.locator('[data-nav]')).toHaveCount(0)
  if (isMobile) {
    await expect(page.locator('.topbar-menu')).toBeVisible()
  } else {
    await expect(page.locator('.side-nav')).toBeVisible()
  }
  // 默认视图是 Online：新建任务 + 最近任务（紧凑行，没有展开）
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Online Scraper')
  await expect(page.locator('.jobs-list [data-job]').first()).toBeVisible()
  await expect(page.locator('[data-dashboard-account-button]')).toContainText('hydra@mapsgrab.test')
})

test('dashboard history: pagination, item facts and single CSV with unavailable feedback', async ({ page }, testInfo) => {
  mockAuthMe(page)
  await signInByStoredToken(page, 'e2e-history-token')

  const jobs = buildJobs()
  const first = jobs[0]
  let fileAvailable = true
  await page.route(/\/api\/client\/export\/jobs\?/, route => {
    const params = new URL(route.request().url()).searchParams
    const offset = Number(params.get('offset') ?? 0)
    const limit = Number(params.get('limit') ?? 20)
    const q = params.get('q') ?? ''
    const matched = q ? jobs.filter(job => job.job_no.startsWith(q)) : jobs
    return route.fulfill({
      json: envelope({ jobs: matched.slice(offset, offset + limit), total: matched.length, offset, limit })
    })
  })
  await page.route(`**/api/client/export/jobs/${first.job_no}`, route =>
    route.fulfill({
      json: envelope({
        job: first,
        items: [
          { item_index: 0, keyword: 'coffee shop nyc', viewport: { lat: 40, lng: -74, zoom: 15 }, result_count: 120, completed: true, error_code: null },
          { item_index: 1, keyword: 'bookstore brooklyn', viewport: null, result_count: 0, completed: true, error_code: 31301 },
          { item_index: 2, keyword: 'cafe brooklyn', viewport: null, result_count: 0, completed: true, error_code: null }
        ]
      })
    })
  )
  const signedCsvUrl = await csvDownloadUrl(`${first.job_no}.csv`)
  await page.route(`**/api/client/export/jobs/${first.job_no}/download`, route =>
    route.fulfill({ json: fileAvailable
      ? envelope({ url: signedCsvUrl, filename: `${first.job_no}.csv` })
      : { code: 404, msg: 'No downloadable file.' }
    })
  )

  await page.goto('/dashboard/history/')
  await expectE2eBrowserIdentity(page, testInfo, expect)
  await expect(page.locator('[data-history-expand]')).toHaveCount(20)
  await expect(page.locator('.jobs-range')).toHaveText('1–20 of 40')
  // 当年日期省略年份，跨年运行时带年份：只断言月日
  await expect(page.locator('.job-time').first()).toContainText('Sep 1')
  await expect(page.locator(`[data-job="${first.job_no}"] .badge`)).toHaveText('Partial success')
  await expect(page.locator(`[data-job="${jobs[2].job_no}"] .badge`)).toHaveText('Failed')
  await expect(page.locator(`[data-history-download="${jobs[1].job_no}"]`)).toHaveCount(0)
  await expect(page.locator(`[data-job="${jobs[1].job_no}"]`)).toContainText('No CSV')

  await page.locator(`[data-history-expand="${first.job_no}"]`).click()
  const detail = page.locator(`#jd-${first.job_no}`)
  await expect(detail.locator('.detail-meta')).toContainText(first.run_no)
  await expect(detail.locator('.detail-meta')).toContainText('Enabled')
  await expect(detail.locator('.items')).toContainText('40.0000, -74.0000 · zoom 15')
  const failedItem = detail.locator('.items tbody tr').filter({ hasText: 'bookstore brooklyn' })
  await expect(failedItem).toContainText('Could not collect this search.')
  await expect(failedItem).not.toContainText('Completed')
  await expect(detail.locator('.items button')).toHaveCount(0)
  const csvDownload = page.waitForEvent('download')
  await page.locator(`[data-history-download="${first.job_no}"]`).click()
  expect((await csvDownload).suggestedFilename()).toBe(`${first.job_no}.csv`)
  fileAvailable = false
  await page.locator(`[data-history-download="${first.job_no}"]`).click()
  await expect(page.getByText('No downloadable CSV. The file may have expired.')).toBeVisible()

  // 翻页只替换当前历史记录：地址带页码，刷新后保持
  await page.locator('[data-history-next]').click()
  await expect(page.locator('.jobs-range')).toHaveText('21–40 of 40')
  await expect(page).toHaveURL(/\/dashboard\/history\/\?page=2$/)
  for (const status of ['Queued', 'Collecting', 'Preparing CSV']) {
    await expect(page.locator('.jobs-list .badge', { hasText: status })).toBeVisible()
  }
  await expect(page.locator(`[data-history-download="${jobs[29].job_no}"]`)).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.jobs-range')).toHaveText('21–40 of 40')
  await page.locator('[data-history-prev]').click()
  await expect(page.locator('.jobs-range')).toHaveText('1–20 of 40')
  await expect(page).toHaveURL(/\/dashboard\/history\/$/)

  // 无匹配时 Clear filters：地址、列表与搜索框一起清空，焦点留在搜索框，回车不会重新应用旧词
  const search = page.getByRole('searchbox', { name: 'Search tasks' })
  await search.fill('zzz')
  await search.press('Enter')
  await expect(page).toHaveURL(/\/dashboard\/history\/\?q=zzz$/)
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page).toHaveURL(/\/dashboard\/history\/$/)
  await expect(page.locator('.jobs-range')).toHaveText('1–20 of 40')
  await expect(search).toHaveValue('')
  await expect(search).toBeFocused()
  await expect(page.getByRole('button', { name: 'Clear search' })).toHaveCount(0)
  await search.press('Enter')
  await expect(page).toHaveURL(/\/dashboard\/history\/$/)
  await expect(page.locator('.jobs-range')).toHaveText('1–20 of 40')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('dashboard-history.png'), fullPage: true, animations: 'disabled' })
})

test('dashboard popovers: rows per page, history time range or filters, account menu', async ({ page, isMobile }) => {
  await page.route('**/api/client/auth/me', route => route.fulfill({
    json: envelope({
      email: 'hydra@mapsgrab.test',
      full_name: 'Hydra',
      credits_balance: 0,
      created_at: Date.parse('2026-01-01T00:00:00Z'),
      maps_online_subscription: null,
      maps_extension_subscription: SUBSCRIPTIONS.extension,
      maps_api_subscription: SUBSCRIPTIONS.api
    })
  }))
  await signInByStoredToken(page, 'e2e-popover-token')
  const jobs = buildJobs()
  await page.route(/\/api\/client\/export\/jobs\?/, route => {
    const params = new URL(route.request().url()).searchParams
    const offset = Number(params.get('offset') ?? 0)
    const limit = Number(params.get('limit') ?? 20)
    return route.fulfill({ json: envelope({ jobs: jobs.slice(offset, offset + limit), total: jobs.length, offset, limit }) })
  })
  await page.goto('/dashboard/history/?page=2')
  await expect(page.locator('.jobs-range')).toHaveText('21–40 of 40')

  // 每页条数（listbox）：打开即聚焦当前项，↓ + Enter 选中并关闭、焦点回到按钮；改条数回到第 1 页
  await page.getByRole('button', { name: 'Rows per page 20' }).click()
  await expect(page.getByRole('option', { name: '20', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/dashboard\/history\/\?size=50$/)
  await expect(page.locator('.jobs-range')).toHaveText('1–40 of 40')
  await expect(page.getByRole('button', { name: 'Rows per page 50' })).toBeFocused()

  if (isMobile) {
    // 视图容器 ≤ 680：状态与时间范围收进 Filters 菜单；两组单选点选后保持打开、就地更新，按钮数字是非默认项个数
    await expect(page.locator('#hist-range-btn')).toBeHidden()
    const filters = page.getByRole('button', { name: /^Filters/ })
    await filters.click()
    const filterMenu = page.getByRole('menu', { name: 'Filter tasks' })
    await expect(filterMenu.getByRole('menuitemradio', { name: 'All', exact: true })).toBeFocused()
    await filterMenu.getByRole('menuitemradio', { name: 'Completed' }).click()
    await expect(page).toHaveURL(/\?status=completed&size=50$/)
    await filterMenu.getByRole('menuitemradio', { name: 'Last 30 days' }).click()
    await expect(page).toHaveURL(/\?status=completed&range=30d&size=50$/)
    await expect(filterMenu).toBeVisible()
    await expect(filters.locator('.count-badge')).toHaveText('2')
    // Clear filters 连同搜索清空（每页条数保留），关闭菜单，焦点回到 Filters 按钮
    await filterMenu.getByRole('menuitem', { name: 'Clear filters' }).click()
    await expect(filterMenu).toBeHidden()
    await expect(page).toHaveURL(/\/dashboard\/history\/\?size=50$/)
    await expect(filters).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    return
  }

  // 时间范围（menu）：打开即聚焦当前项，预设选中即关闭
  const rangeButton = page.locator('#hist-range-btn')
  const rangeMenu = page.getByRole('menu', { name: 'Time range' })
  await rangeButton.click()
  await expect(rangeMenu.getByRole('menuitemradio', { name: 'All time' })).toBeFocused()
  await rangeMenu.getByRole('menuitemradio', { name: 'Last 7 days' }).click()
  await expect(rangeMenu).toBeHidden()
  await expect(page).toHaveURL(/\?range=7d&size=50$/)
  await expect(rangeButton).toHaveText('Last 7 days')

  // Custom range：同一浮层横向进入日期子面板，默认最近 7 天（纽约时间）；Esc 先回上一层，根层再关闭
  await rangeButton.click()
  await expect(rangeMenu.getByRole('menuitemradio', { name: 'Last 7 days' })).toBeFocused()
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowRight')
  // 两个菜单各有一份日期子面板：只取时间范围浮层里的
  const rangePop = page.locator('#hist-range-pop')
  const from = rangePop.getByLabel('From', { exact: true })
  const to = rangePop.getByLabel('To', { exact: true })
  await expect(from).toBeFocused()
  await expect(to).toHaveValue(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date()))
  await page.keyboard.press('Escape')
  await expect(rangeMenu.getByRole('menuitem', { name: /^Custom range/ })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(rangeMenu).toBeHidden()
  await expect(rangeButton).toBeFocused()

  // 开始晚于结束：Apply 不可用并说明原因；合法后 Apply 生效并关闭，焦点回到按钮
  await rangeButton.click()
  await rangeMenu.getByRole('menuitem', { name: /^Custom range/ }).click()
  await from.fill('2026-09-10')
  await to.fill('2026-09-01')
  const apply = rangePop.getByRole('button', { name: 'Apply' })
  await expect(apply).toHaveAttribute('aria-disabled', 'true')
  await expect(rangePop.getByText('Choose a start date on or before the end date.')).toBeVisible()
  // Playwright 不点 aria-disabled 的元素：直接派发点击，验证浮层在捕获阶段拦下、查询不变
  await apply.dispatchEvent('click')
  await expect(page).toHaveURL(/\?range=7d&size=50$/)
  await from.fill('2026-09-01')
  await to.fill('2026-09-10')
  await apply.click()
  await expect(page).toHaveURL(/\?range=custom&from=2026-09-01&to=2026-09-10&size=50$/)
  await expect(rangeMenu).toBeHidden()
  await expect(rangeButton).toBeFocused()
  await expect(rangeButton).toContainText('Sep 1')

  // 账户菜单（APG menu button）：身份区在菜单外；订阅三行：Free 去 Pricing、有效订阅进订阅视图、读取失败不可用
  const account = page.locator('[data-dashboard-account-button]')
  const accountMenu = page.getByRole('menu', { name: 'Account menu' })
  await account.focus()
  await page.keyboard.press('Enter')
  const onlineRow = accountMenu.getByRole('menuitem', { name: /^Online Scraper/ })
  await expect(onlineRow).toBeFocused()
  await expect(onlineRow).toHaveAttribute('href', '/pricing/?product_kind=maps_online')
  await expect(accountMenu.getByRole('menuitem', { name: /^Browser Extension/ })).toHaveAttribute('href', '/dashboard/subscriptions/')
  await expect(accountMenu.getByRole('menuitem', { name: /^API/ })).toHaveAttribute('aria-disabled', 'true')
  await expect(page.locator('#account-menu-pop .menu-id')).toContainText('hydra@mapsgrab.test')
  await expect(accountMenu.locator('.menu-id')).toHaveCount(0)
  // 主题横排单选：Space 生效并保持打开，Enter 生效并关闭，焦点回到用户卡
  for (let step = 0; step < 4; step++) await page.keyboard.press('ArrowDown')
  await expect(accountMenu.getByRole('menuitemradio', { name: 'Light' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press(' ')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(accountMenu.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await expect(accountMenu).toBeHidden()
  await expect(page.locator('html')).not.toHaveAttribute('data-theme')
  await expect(account).toBeFocused()
  // 语言子菜单：↑ 打开聚焦末项；→ 进入并聚焦当前语言，Esc 回到入口项，根层 Esc 关闭
  await page.keyboard.press('ArrowUp')
  await expect(accountMenu.getByRole('menuitem', { name: 'Log out' })).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('menu', { name: 'Language' }).getByRole('menuitemradio', { name: 'English' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(accountMenu.getByRole('menuitem', { name: /^Language/ })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(accountMenu).toBeHidden()
  await expect(account).toBeFocused()

  // Manage subscriptions 在页内切到订阅视图：菜单关闭，焦点交给视图标题
  await account.click()
  await accountMenu.getByRole('menuitem', { name: 'Manage subscriptions' }).click()
  await expect(page).toHaveURL(/\/dashboard\/subscriptions\/$/)
  await expect(accountMenu).toBeHidden()
  await expect(page.locator('#view-title')).toBeFocused()
  // 已在订阅视图时再选：停在原视图，焦点回到菜单按钮
  await account.click()
  await accountMenu.getByRole('menuitem', { name: 'Manage subscriptions' }).click()
  await expect(accountMenu).toBeHidden()
  await expect(account).toBeFocused()

  // 图标栏：账户菜单在侧栏右侧弹出
  await page.locator('.side-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('data-side', 'collapsed')
  await account.click()
  const accountPop = page.locator('#account-menu-pop')
  await expect(accountPop).toHaveAttribute('data-side', 'right')
  const sideBox = await page.locator('.dash-side').boundingBox()
  const popBox = await accountPop.boundingBox()
  expect(popBox && sideBox && popBox.x >= sideBox.x + sideBox.width).toBe(true)

  // 选其他语言：跳到该语言前缀下的同一视图
  await accountMenu.getByRole('menuitem', { name: /^Language/ }).click()
  await page.getByRole('menu', { name: 'Language' }).getByRole('menuitemradio', { name: '日本語' }).click()
  await expect(page).toHaveURL(/\/ja\/dashboard\/subscriptions\/$/)
})

test('dashboard session edge: unreachable retry recovers and 401 returns to sign-in panel', async ({ page }) => {
  // auth/me 网络失败 → unreachable（不清 token、不误判退出）→ Retry 真正重新请求成功。
  let authMeFail = true
  await page.route('**/api/client/auth/me', route => {
    if (authMeFail) {
      return route.fulfill({ status: 503, json: { code: 50000, msg: 'backend down' } })
    }
    return route.fulfill({
      json: envelope({
        email: 'hydra@mapsgrab.test',
        full_name: 'Hydra',
        credits_balance: 0
      })
    })
  })
  await page.route(/\/api\/client\/export\/jobs\?/, route =>
    route.fulfill({ json: envelope({ jobs: buildJobs().slice(0, 1), total: 1, offset: 0, limit: 20 }) })
  )
  await signInByStoredToken(page, 'e2e-edge-token')
  await page.goto('/dashboard/history/')
  await expect(page.locator('main').getByText('Could not reach MapsGrab right now.')).toBeVisible()
  await expect(page.locator('[data-history-expand]')).toHaveCount(0)
  authMeFail = false
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.locator('[data-history-expand]').first()).toBeVisible()

  // 列表请求 401（token 失效）：统一汇入站级会话失效，回到登录面板且本地 token 已清。
  await page.route(/\/api\/client\/export\/jobs\?/, route =>
    route.fulfill({ status: 401, json: { code: 40100, msg: 'token expired' } })
  )
  await page.getByRole('button', { name: 'Refresh' }).click()
  await expect(page.getByText('Sign in to see your Online export history.')).toBeVisible()
  await expect(page.evaluate(() => window.localStorage.getItem('homepage_access_token'))).resolves.toBeNull()

  // 同一登录流程恢复原私有视图：登录成功（共享会话）后历史列表重新加载。
  await page.route('**/api/client/auth/send-email-code', route => route.fulfill({ json: envelope({}) }))
  await page.route('**/api/client/auth/email-verify-login', route =>
    route.fulfill({
      json: envelope({
        access_token: 'e2e-relogin-token',
        user: { email: 'hydra@mapsgrab.test', full_name: 'Hydra', credits_balance: 0 }
      })
    })
  )
  await page.route(/\/api\/client\/export\/jobs\?/, route =>
    route.fulfill({ json: envelope({ jobs: buildJobs().slice(0, 2), total: 2, offset: 0, limit: 20 }) })
  )
  await page.locator('main [data-site-auth-entry]').click()
  await expect(page.locator('[data-download-auth-modal]')).toBeVisible()
  await page.locator('[data-download-email-entry-button]').click()
  await page.locator('[data-download-login-email]').fill('hydra@mapsgrab.test')
  await page.locator('[data-download-continue-email]').click()
  await page.locator('[data-download-login-code]').fill('123456')
  await page.locator('[data-download-login-submit]').click()
  await expect(page.locator('[data-history-expand]').first()).toBeVisible()
  await expect(page.locator('[data-dashboard-account-button]')).toContainText('hydra@mapsgrab.test')
})

test('google same-origin redirect keeps the dashboard destination through exchange and email verification', async ({ page, isMobile }) => {
  mockAuthMe(page)
  await page.route('**/api/client/auth/google/exchange', route =>
    route.fulfill({
      json: envelope({
        access_token: 'e2e-google-exchange-token',
        user: { email: 'hydra@mapsgrab.test', full_name: 'Hydra', credits_balance: 0 }
      })
    })
  )
  await page.route('**/api/client/auth/send-email-code', route => route.fulfill({ json: envelope({}) }))
  await page.route('**/api/client/auth/email-verify-login', route =>
    route.fulfill({
      json: envelope({
        access_token: 'e2e-google-verify-token',
        user: { email: 'hydra@mapsgrab.test', full_name: 'Hydra', credits_balance: 0 }
      })
    })
  )
  await page.route(/\/api\/client\/export\/jobs\?/, route =>
    route.fulfill({ json: envelope({ jobs: buildJobs().slice(0, 3), total: 3, offset: 0, limit: 20 }) })
  )

  // 场景 1：导航登录（目的地 Dashboard）→ Google OAuth 回跳同站 → 换票成功后按原目的地进入 Dashboard。
  await page.goto('/')
  await openNavSignIn(page, isMobile)
  await expect(page.locator('[data-download-auth-modal]')).toBeVisible()
  await page.goto('/?google_login_code=e2e-redirect-code')
  await expect(page).toHaveURL(/\/dashboard\/$/)
  await expect(page.locator('.jobs-list [data-job]').first()).toBeVisible()

  // 场景 2：非权威邮箱回跳 → 补邮箱验证码分支（弹窗内完成）→ 目的地不丢失，仍进 Dashboard。
  await page.evaluate(() => window.localStorage.removeItem('homepage_access_token'))
  await page.goto('/')
  await openNavSignIn(page, isMobile)
  await expect(page.locator('[data-download-auth-modal]')).toBeVisible()
  await page.goto('/?google_email_verification=hydra%40mapsgrab.test')
  const modal = page.locator('[data-download-auth-modal]')
  await expect(modal).toBeVisible()
  await expect(page.locator('[data-download-login-email]')).toHaveValue('hydra@mapsgrab.test')
  await page.locator('[data-download-login-code]').fill('654321')
  await page.locator('[data-download-login-submit]').click()
  await expect(page).toHaveURL(/\/dashboard\/$/)
  await expect(page.locator('.jobs-list [data-job]').first()).toBeVisible()
})

test('dashboard subscriptions: three-line states, pricing tab links and manage subscription portal', async ({ page }, testInfo) => {
  mockAuthMe(page)
  await signInByStoredToken(page, 'e2e-subs-token')
  await page.route('**/api/client/subscription/management', route =>
    route.fulfill({ json: envelope({ url: 'https://uat-portal.clinkbill.com/portal/sess_e2e_1' }) })
  )
  await page.context().route('https://uat-portal.clinkbill.com/**', route =>
    route.fulfill({ contentType: 'text/html', body: '<html><title>ClinkBill Portal</title></html>' })
  )

  await page.goto('/dashboard/subscriptions/')
  await expectE2eBrowserIdentity(page, testInfo, expect)

  // Online：有效一次性订阅；Extension：有效自动续费（带管理入口）；API：配置不可用。
  const onlineCard = page.locator('[data-subscription-line="online"]')
  await expect(onlineCard).toContainText('Online Basic')
  await expect(onlineCard).toContainText('Auto-renewal off')
  await expect(onlineCard.locator('[data-subs-manage]')).toHaveCount(0)

  const extensionCard = page.locator('[data-subscription-line="extension"]')
  await expect(extensionCard).toContainText('Maps Pro')
  await expect(extensionCard.locator('[data-subs-manage]')).toBeVisible()

  const apiCard = page.locator('[data-subscription-line="api"]')
  await expect(apiCard).toContainText('Temporarily unavailable')

  // 选购统一跳 Pricing 对应产品 tab（三条线的购买能力当前均已开放，见 lib/capabilities.ts）
  await expect(onlineCard.locator('[data-subs-buy]')).toHaveAttribute('href', /\/pricing\/\?product_kind=maps_online/)
  await expect(extensionCard.locator('[data-subs-buy]')).toHaveAttribute('href', /\/pricing\/\?product_kind=maps_extension/)
  await expect(apiCard.locator('[data-subs-buy]')).toHaveAttribute('href', /\/pricing\/\?product_kind=maps_api/)

  // 渠道管理：预开窗口跳支付渠道 portal。
  const portalPopupPromise = page.waitForEvent('popup')
  await extensionCard.locator('[data-subs-manage]').click()
  const portalPopup = await portalPopupPromise
  await expect(portalPopup).toHaveURL(/uat-portal\.clinkbill\.com/)

  // 桌面视口截图。
  await page.screenshot({ path: testInfo.outputPath('dashboard-subscriptions-desktop.png'), fullPage: true })
})

test('dashboard api view, logout returns home and mobile workspace reachability', async ({ page, isMobile }, testInfo) => {
  mockAuthMe(page)
  await page.route('**/api/client/auth/logout', route => route.fulfill({ json: envelope({}) }))
  await page.route('**/api/client/maps/api/key', route => route.fulfill({
    json: envelope({ has_api_key: false, api_key_prefix: '', api_key_created_at: null })
  }))
  await page.route('**/api/client/maps/api/usage', route => route.fulfill({
    json: envelope({ used: 0, total: 20, period: '2026-10', exhausted: false })
  }))
  await page.route('**/api/client/maps/api/connection', route => route.fulfill({
    json: envelope({ api_base_url: 'https://api.mapsgrab.test/api/client/maps/api', mcp_url: '' })
  }))
  await page.route('**/api/client/mcp-oauth/grants?*', route => route.fulfill({
    json: envelope({ items: [], total: 0 })
  }))
  await signInByStoredToken(page, 'e2e-api-token')

  // 已登录 API 空态仍保留真实的零用量，不把不可用订阅或连接地址当作已开放。
  await page.goto('/dashboard/api/')
  await expect(page.getByRole('button', { name: 'Generate API key' })).toBeVisible()
  await expect(page.locator('[data-api-usage]')).toHaveText('0 / 20 requests')
  await expect(page.getByRole('link', { name: 'View API products' })).toHaveAttribute('href', '/google-maps-scraper-api/')
  // 默认 API tab 的 curl 快速上手：地址取连接信息；没有 Key 时用 YOUR_API_KEY 占位
  const curl = page.locator('[data-connect-sample]')
  await expect(curl).toContainText('https://api.mapsgrab.test/api/client/maps/api/search')
  await expect(curl).toContainText('Bearer YOUR_API_KEY')
  const docs = page.locator('[data-connect-docs]')
  await expect(docs).toHaveAttribute('href', '/google-maps-scraper-api/#reference')
  // MCP tab（方向键切换）：没有 MCP 地址时显示不可用说明，已连接应用只在这里出现；MCP + API Key tab 不带已连接应用
  const connectTabs = page.getByRole('tablist', { name: 'Connection method' })
  await expect(page.getByText('No apps are connected.')).toHaveCount(0)
  await connectTabs.getByRole('tab', { name: 'API', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(connectTabs.getByRole('tab', { name: 'MCP', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByText('The MCP connection address is not available yet.')).toBeVisible()
  await expect(page.getByText('No apps are connected.')).toBeVisible()
  await expect(docs).toHaveCount(0)
  await connectTabs.getByRole('tab', { name: 'MCP + API key' }).click()
  await expect(page.getByText('The MCP connection address is not available yet.')).toBeVisible()
  await expect(page.getByText('No apps are connected.')).toHaveCount(0)
  await connectTabs.getByRole('tab', { name: 'API', exact: true }).click()

  // 生成中离开视图：响应晚到只更新 Key 前缀（示例同步），回到 API 视图不显示明文；有 Key 后替换按钮为次级。
  const sideNav = page.locator('.side-nav')
  const openView = async (name: string) => {
    if (isMobile) await page.locator('.topbar-menu').click()
    await sideNav.getByRole('link', { name }).click()
  }
  let releaseGenerate: () => void = () => {}
  const generateGate = new Promise<void>(resolve => { releaseGenerate = resolve })
  await page.route('**/api/client/maps/api/key/generate', async route => {
    await generateGate
    await route.fulfill({ json: envelope({ api_key: 'mg_live_e2e1_plaintext', api_key_prefix: 'mg_live_e2e1', api_key_created_at: Date.now() }) })
  })
  await page.getByRole('button', { name: 'Generate API key' }).click()
  await expect(page.getByRole('button', { name: 'Generating...' })).toBeVisible()
  await openView('Subscriptions')
  await expect(page).toHaveURL(/\/dashboard\/subscriptions\/$/)
  const generated = page.waitForResponse('**/api/client/maps/api/key/generate')
  releaseGenerate()
  await generated
  await openView('API management')
  await expect(page.locator('[data-api-key-prefix]')).toContainText('mg_live_e2e1')
  await expect(page.locator('[data-api-key-plaintext]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Replace API key' })).toHaveClass(/\bbtn-secondary\b/)
  await expect(curl).toContainText('Bearer mg_live_e2e1…')

  // 留在视图内替换：明文出现时示例只换成新前缀，从不带明文。
  await page.route('**/api/client/maps/api/key/generate', route => route.fulfill({
    json: envelope({ api_key: 'mg_live_e2e2_plaintext', api_key_prefix: 'mg_live_e2e2', api_key_created_at: Date.now() })
  }))
  await page.getByRole('button', { name: 'Replace API key' }).click()
  await page.getByRole('dialog', { name: 'Replace your API key?' }).getByRole('button', { name: 'Replace API key' }).click()
  await expect(page.locator('[data-api-key-plaintext]')).toHaveText('mg_live_e2e2_plaintext')
  await expect(curl).toContainText('Bearer mg_live_e2e2…')
  await expect(curl).not.toContainText('mg_live_e2e2_plaintext')

  // 移动视口：侧栏收起，菜单按钮展开抽屉后账户菜单可达（订阅卡在主区）。
  if (isMobile) {
    await page.goto('/dashboard/subscriptions/')
    await expect(page.locator('[data-subs-manage="extension"]')).toBeVisible()
    await expect(sideNav).not.toBeInViewport()
    await page.locator('.topbar-menu').click()
    await expect(sideNav).toBeInViewport()
    const account = page.locator('[data-dashboard-account-button]')
    await account.click()
    await expect(page.locator('[data-dashboard-logout]')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('dashboard-mobile-menu.png') })
    // Esc 只关账户菜单：抽屉保持打开，焦点回到账户按钮
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-dashboard-logout]')).toBeHidden()
    await expect(sideNav).toBeInViewport()
    await expect(account).toBeFocused()

    // 选中页面后抽屉收起（点击菜单项导航走）。
    await sideNav.getByRole('link', { name: 'API management' }).click()
    await expect(page).toHaveURL(/\/dashboard\/api\//)
    await expect(sideNav).not.toBeInViewport()
    return
  }

  // 桌面：退出登录回当前语言主页。
  await page.goto('/dashboard/subscriptions/')
  await page.locator('[data-dashboard-account-button]').click()
  await page.locator('[data-dashboard-logout]').click()
  await expect(page).toHaveURL(url => new URL(url).pathname === '/')
  await expect(page.locator('[data-nav] [data-site-auth-entry]')).toBeVisible()
})
