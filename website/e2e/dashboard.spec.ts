/**
 * Dashboard 工作区 e2e（015 U2）。
 *
 * mock 跑：PUBLIC_API_BASE_URL 指向假地址；spec 内 page.route 拦截自有
 * /api/client/** 接口，page.context().route 拦截签名下载域。渠道管理与
 * Pricing 购买主路径分别来自迁移后的订阅页与 website.spec.ts。
 *
 * 1. 匿名入口：登录弹窗打开 / 取消回主页；导航邮箱验证码登录成功进入 Dashboard。
 * 2. 历史视图：列表、分页、明细展开、CSV / ZIP 下载与无文件就地提示。
 * 3. 订阅视图：三线状态（免费 / 有效 / 不可用）、Pricing tab 跳转、渠道管理 portal。
 * 4. API 视图未开放、工作区 noindex、退出回主页与移动视口可达性。
 */
import { expect, test } from '@playwright/test'

import { expectE2eBrowserIdentity, registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

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
    await page.locator('.mobile-menu-btn').click()
    await page.locator('.mobile-auth-signin').click()
    return
  }
  await page.locator('.nav-auth-signin').click()
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

/** 构造 40 条任务：最新在前，T-0001 最新；T-0030 处理中。每页 20 条，共两页。 */
function buildTasks(): { task_no: string; status: 'processing' | 'completed'; total_count: number; processed_count: number; record_count: number; created_at: number }[] {
  const createdBase = Date.parse('2026-09-01T12:00:00Z') / 1000
  return Array.from({ length: 40 }, (_, index) => {
    const taskNo = `T-${String(index + 1).padStart(4, '0')}`
    return {
      task_no: taskNo,
      status: taskNo === 'T-0030' ? 'processing' : 'completed',
      total_count: 3,
      processed_count: 3,
      record_count: 120,
      created_at: createdBase - index * 3600
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
  await page.route(/\/api\/client\/maps-online\/tasks\?/, route =>
    route.fulfill({ json: envelope({ tasks: buildTasks().slice(0, 20), total: 40, offset: 0, limit: 20 }) })
  )

  // 匿名直达工作区：登录入口，不加载私人数据。
  await page.goto('/dashboard/')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.locator('[data-history-expand]')).toHaveCount(0)
  await expect(page.getByText('Sign in to see your Online export history.')).toBeVisible()

  // 打开站级登录弹窗后取消（Escape）：回当前语言主页。
  await page.locator('.workspace-primary-button').click()
  const modal = page.locator('[data-download-auth-modal]')
  await expect(modal).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(url => new URL(url).pathname === '/')

  // API 未开放页同样统一：匿名取消登录回主页，无公开特例。
  await page.goto('/dashboard/api/')
  await expect(page.locator('.workspace-primary-button')).toBeVisible()
  await page.locator('.workspace-primary-button').click()
  await expect(modal).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(url => new URL(url).pathname === '/')

  // 导航登录：邮箱验证码路径，登录成功后进入 Dashboard（移动端登录入口在汉堡菜单内）。
  await page.goto('/')
  const navSignIn = page.locator(isMobile ? '.mobile-auth-signin' : '.nav-auth-signin')
  if (isMobile) {
    await page.locator('.mobile-menu-btn').click()
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
  await expect(page.locator('.header')).toHaveCount(0)
  if (isMobile) {
    await expect(page.locator('.workspace-menu-button')).toBeVisible()
  } else {
    await expect(page.locator('.side-nav')).toBeVisible()
  }
  await expect(page.locator('[data-history-expand]').first()).toBeVisible()
  await expect(page.locator('.side-nav-account')).toContainText('hydra@mapsgrab.test')
})

test('dashboard history: pagination, detail, CSV and ZIP downloads with unavailable feedback', async ({ page }, testInfo) => {
  mockAuthMe(page)
  await signInByStoredToken(page, 'e2e-history-token')

  const tasks = buildTasks()
  await page.route(/\/api\/client\/maps-online\/tasks\?/, route => {
    const params = new URL(route.request().url()).searchParams
    const offset = Number(params.get('offset') ?? 0)
    const limit = Number(params.get('limit') ?? 20)
    return route.fulfill({
      json: envelope({ tasks: tasks.slice(offset, offset + limit), total: tasks.length, offset, limit })
    })
  })
  await page.route(/\/api\/client\/maps-online\/tasks\/T-0001$/, route =>
    route.fulfill({
      json: envelope({
        task: tasks[0],
        items: [
          { item_id: 11, sequence: 1, keyword: 'coffee shop nyc', record_count: 120 },
          { item_id: 12, sequence: 2, keyword: 'bookstore brooklyn', record_count: 64 }
        ]
      })
    })
  )
  await page.route('**/storage.download.example.com/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'text/csv',
      headers: { 'Content-Disposition': 'attachment; filename="T-0001-1.csv"' },
      body: 'keyword,record_count\ncoffee shop nyc,120'
    })
  )
  await page.route(/\/api\/client\/maps-online\/tasks\/T-0001\/items\/11\/download$/, route =>
    route.fulfill({
      json: envelope({ url: 'https://storage.download.example.com/signed-csv?sig=1', filename: 'T-0001-1.csv' })
    })
  )
  await page.route(/\/api\/client\/maps-online\/tasks\/T-0001\/items\/12\/download$/, route =>
    route.fulfill({ status: 404, json: { code: 404, msg: 'no downloadable file' } })
  )
  await page.route(/\/api\/client\/maps-online\/tasks\/T-0001\/download$/, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/zip',
      body: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00])
    })
  )

  await page.goto('/dashboard/')
  await expectE2eBrowserIdentity(page, testInfo, expect)
  await expect(page.locator('[data-history-expand]')).toHaveCount(20)
  await expect(page.getByText('1–20 of 40')).toBeVisible()

  // 处理中任务不提供整包下载。
  await expect(page.locator('[data-history-zip="T-0001"]')).toBeVisible()
  await expect(page.locator('[data-history-zip="T-0030"]')).toHaveCount(0)

  // 展开明细：CSV 有文件触发下载，无文件就地提示，ZIP 触发整包下载。
  await page.locator('[data-history-expand="T-0001"]').click()
  await expect(page.getByText('coffee shop nyc')).toBeVisible()
  const csvDownload = page.waitForEvent('download')
  await page.locator('[data-history-csv="11"]').click()
  expect((await csvDownload).suggestedFilename()).toBe('T-0001-1.csv')

  await page.locator('[data-history-csv="12"]').click()
  await expect(page.getByText('No downloadable file for this item. It may have expired.')).toBeVisible()

  const zipDownload = page.waitForEvent('download')
  await page.locator('[data-history-zip="T-0001"]').click()
  expect((await zipDownload).suggestedFilename()).toBe('T-0001.zip')

  // 分页：下一页到第二页（21 条），上一页回第一页。
  await page.locator('[data-history-next]').click()
  await expect(page.getByText('21–40 of 40')).toBeVisible()
  await expect(page.locator('[data-history-expand]')).toHaveCount(20)
  await page.locator('[data-history-prev]').click()
  await expect(page.getByText('1–20 of 40')).toBeVisible()

  // 桌面视口截图：侧栏菜单与个人信息可达。
  await page.screenshot({ path: testInfo.outputPath('dashboard-history-desktop.png'), fullPage: true })
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
  await page.route(/\/api\/client\/maps-online\/tasks\?/, route =>
    route.fulfill({ json: envelope({ tasks: buildTasks().slice(0, 1), total: 1, offset: 0, limit: 20 }) })
  )
  await signInByStoredToken(page, 'e2e-edge-token')
  await page.goto('/dashboard/')
  await expect(page.getByText('Could not reach MapsGrab right now.')).toBeVisible()
  await expect(page.locator('[data-history-expand]')).toHaveCount(0)
  authMeFail = false
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.locator('[data-history-expand]').first()).toBeVisible()

  // 列表请求 401（token 失效）：统一汇入站级会话失效，回到登录面板且本地 token 已清。
  await page.route(/\/api\/client\/maps-online\/tasks\?/, route =>
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
  await page.route(/\/api\/client\/maps-online\/tasks\?/, route =>
    route.fulfill({ json: envelope({ tasks: buildTasks().slice(0, 2), total: 2, offset: 0, limit: 20 }) })
  )
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('[data-download-auth-modal]')).toBeVisible()
  await page.locator('[data-download-email-entry-button]').click()
  await page.locator('[data-download-login-email]').fill('hydra@mapsgrab.test')
  await page.locator('[data-download-continue-email]').click()
  await page.locator('[data-download-login-code]').fill('123456')
  await page.locator('[data-download-login-submit]').click()
  await expect(page.locator('[data-history-expand]').first()).toBeVisible()
  await expect(page.locator('.side-nav-account')).toContainText('hydra@mapsgrab.test')
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
  await page.route(/\/api\/client\/maps-online\/tasks\?/, route =>
    route.fulfill({ json: envelope({ tasks: buildTasks().slice(0, 3), total: 3, offset: 0, limit: 20 }) })
  )

  // 场景 1：导航登录（目的地 Dashboard）→ Google OAuth 回跳同站 → 换票成功后按原目的地进入 Dashboard。
  await page.goto('/')
  await openNavSignIn(page, isMobile)
  await expect(page.locator('[data-download-auth-modal]')).toBeVisible()
  await page.goto('/?google_login_code=e2e-redirect-code')
  await expect(page).toHaveURL(/\/dashboard\/$/)
  await expect(page.locator('[data-history-expand]').first()).toBeVisible()

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
  await expect(page.locator('[data-history-expand]').first()).toBeVisible()
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

  // 选购统一跳 Pricing 对应产品 tab。
  await expect(onlineCard.locator('[data-subs-buy]')).toHaveAttribute('href', /\/pricing\/\?product_kind=maps_online/)
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
  await signInByStoredToken(page, 'e2e-api-token')

  // API 管理页：未开放徽章 + 产品页链接，不出现 Key 管理按钮。
  await page.goto('/dashboard/api/')
  await expect(page.locator('[data-api-badge]')).toHaveText('Not open yet')
  await expect(page.locator('[data-api-badge]')).toBeVisible()
  await expect(page.getByRole('link', { name: 'View API products' })).toHaveAttribute('href', '/google-maps-scraper-api/')

  // 移动视口：侧栏收起，菜单按钮展开后个人信息可达（订阅卡在主区）。
  if (isMobile) {
    await page.goto('/dashboard/subscriptions/')
    await expect(page.locator('[data-subs-manage="extension"]')).toBeVisible()
    const sideNav = page.locator('.side-nav')
    await expect(sideNav).not.toBeInViewport()
    await page.locator('.workspace-menu-button').click()
    await expect(sideNav).toBeInViewport()
    await sideNav.locator('[data-dashboard-account-button]').click()
    await expect(sideNav.locator('[data-dashboard-logout]')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('dashboard-mobile-menu.png') })

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
  await expect(page.locator('.nav-auth-signin')).toBeVisible()
})
