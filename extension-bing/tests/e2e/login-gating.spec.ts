/**
 * e2e v3 登录全链路 + 免费/Pro 门控（006 §4.4，feat.md 验收基准 10/11）。
 *
 * - 登录全链路（插件发起）：面板未登录徽标位 Sign in → background
 *   openExtensionLogin RPC → launchWebAuthFlow（v3 mock：同步返回带
 *   #code= 一次性 code 的 chromiumapp.org 回调）→ mock exchange 换
 *   token 对 → storage 三键写入 → 面板徽标翻 FREE/PRO；
 * - Pro 无上限：订阅 month mock → 采集收满 fixture 全量 30 条（不受 20 截断）
 *   → 导出无免费末行 → Pricing 显示 VIP 祝贺；
 * - 匿名免费：不发起登录 → Sign in 徽标位、20 条截断照旧、零账号/订阅请求。
 *
 * 后端 mock 形态 = spec-website §7 信封 {code:10000, data}；后端域为生产
 * 构建占位常量（vite.config.ts，生产域名未定待决项）。
 */

import { readFileSync } from 'node:fs'
import { expect, test, type Download, type Page } from '@playwright/test'
import {
  API_ORIGIN,
  FIXTURE_PATH,
  FIXTURE_TOTAL,
  MAPS_URL,
  extensionIdFromServiceWorker,
  installAuthFlowMock,
  launchExtensionContext,
  setupExtensionLoginRoutes,
  waitForExtensionServiceWorker,
  type MockSubscription
} from './harness'

/** 免费档导出末行提示（竞品逐字抄录）。 */
const FREE_LIMIT_NOTE = 'Free accounts can export up to 20 data entries.'

/** 本组用例共用的一次性登录 code（mock exchange 只消费这一枚）。 */
const LOGIN_CODE = 'e2e-one-time-login-code'

/** exchange mock 返回的登录账号（AUTH_ME 信封 data 同构）。 */
const MOCK_USER = {
  user_id: 42,
  email: 'e2e-user@example.com',
  full_name: 'E2E User',
  avatar_url: null,
  created_at: 1700000000
}

function subscriptionOf(period: MockSubscription['period']): MockSubscription {
  return {
    status: 'active',
    period,
    display_name: period === 'month' ? 'Unlimited' : 'Free',
    expires_at: null,
    daily_limit: -1,
    used: 0,
    remaining: -1,
    reset_date: '2026-08-30'
  }
}

/** 面板根（自建 fixed 容器内的直插面板）。 */
function panel(page: Page) {
  return page.locator('#bing-maps-scraper-panel-host .bing-panel-root')
}

function startButton(page: Page) {
  return panel(page).getByRole('button', { name: 'Start Extraction' })
}

function csvLines(content: string): string[] {
  return content
    .replace(/^\uFEFF/, '')
    .split('\n')
    .filter(line => line.length > 0)
}

async function readDownload(page: Page, trigger: () => Promise<void>): Promise<Download> {
  const downloadPromise = page.waitForEvent('download')
  await trigger()
  return downloadPromise
}

/** 零外网白名单：本组用例放行集只能是 fixture 导航与占位 API mock。 */
function expectFulfilledWithinAllowlist(urls: readonly string[]): void {
  const allowedPrefixes = [
    'https://www.bing.com/maps',
    `${API_ORIGIN}/api/client/auth/extension-login/exchange`,
    `${API_ORIGIN}/api/client/auth/me`,
    `${API_ORIGIN}/api/client/subscription/status`
  ]
  for (const url of urls) {
    expect(
      allowedPrefixes.some(prefix => url.startsWith(prefix)),
      `放行集出现白名单外 URL: ${url}`
    ).toBe(true)
  }
}

test.describe('Bing v3 登录 + 免费/Pro 门控', () => {
  test.beforeEach(async () => {
    // Pro 无上限完成依赖 12 轮失败自动收敛(2s 翻页等待 × 12),放宽超时
    test.setTimeout(240_000)
  })

  test('v3 登录全链路:面板 Sign in → mock auth flow 交付 code → exchange → 登录态生效(免费档)', async () => {
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const serviceWorker = await waitForExtensionServiceWorker(context)
      // manifest 固定 key 已移除:扩展 ID 从 service worker 动态反解且合法
      expect(extensionIdFromServiceWorker(serviceWorker)).toMatch(/^[a-p]{32}$/)
      const { fulfilled, consumedCodes } = await setupExtensionLoginRoutes(
        context,
        fixtureHtml,
        {
          user: MOCK_USER,
          subscription: subscriptionOf('free'),
          loginCode: LOGIN_CODE
        }
      )
      await installAuthFlowMock(serviceWorker, LOGIN_CODE)

      await page.goto(MAPS_URL)
      const panelRoot = panel(page)
      await expect(panelRoot).toBeVisible({ timeout: 15_000 })
      // 未登录:徽标位显示 Sign in(无 FREE/PRO)
      await expect(panelRoot.getByRole('button', { name: 'FREE', exact: true })).toHaveCount(0)
      await expect(panelRoot.getByRole('button', { name: 'PRO', exact: true })).toHaveCount(0)

      await signInFromPanel(page)

      // 登录完成:面板徽标翻成免费档,点击进 Pricing
      const freeBadge = panelRoot.getByRole('button', { name: 'FREE', exact: true })
      await expect(freeBadge).toBeVisible({ timeout: 30_000 })
      // 一次性 code:恰好被 exchange 消费一次
      expect(consumedCodes).toEqual([LOGIN_CODE])
      await freeBadge.click()
      await expect(panelRoot.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible()
      await expect(panelRoot.getByText('Signed in as E2E User')).toBeVisible()
      await expect(panelRoot.getByText(/Unlimited exports are active/)).toHaveCount(0)

      expectFulfilledWithinAllowlist(fulfilled)
    } finally {
      await context.close()
    }
  })

  test('Pro 态:登录后订阅判定生效 → 采集无 20 条上限(fixture 30 条全收) → 导出无免费末行 → Pricing 显示 VIP', async () => {
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const serviceWorker = await waitForExtensionServiceWorker(context)
      const { fulfilled } = await setupExtensionLoginRoutes(context, fixtureHtml, {
        user: MOCK_USER,
        subscription: subscriptionOf('month'),
        loginCode: LOGIN_CODE
      })
      await installAuthFlowMock(serviceWorker, LOGIN_CODE)

      await page.goto(MAPS_URL)
      const panelRoot = panel(page)
      await expect(panelRoot).toBeVisible({ timeout: 15_000 })

      await signInFromPanel(page)

      // Pro 徽标 = 门控判定已生效(订阅 month mock)
      const proBadge = panelRoot.getByRole('button', { name: 'PRO', exact: true })
      await expect(proBadge).toBeVisible({ timeout: 30_000 })

      await startButton(page).click()
      // Pro 进度文案变体(feat.md 采集中态)
      await expect(
        panelRoot.getByText(/Have found \d+ businesses and still going\.\.\./)
      ).toBeVisible({ timeout: 15_000 })

      // 注入全量条目,采集不受 20 截断
      await page.evaluate(() => window.bingFixture.loadAll())
      await expect(page.locator('[data-entity]')).toHaveCount(FIXTURE_TOTAL)

      // 完成:自然收敛于全量 30 条,免费超限警告条不出现
      await expect(panelRoot.getByText('Search complete.')).toBeVisible({ timeout: 120_000 })
      await expect(panelRoot.getByText('30 businesses found.')).toBeVisible()
      await expect(panelRoot.getByText(FREE_LIMIT_NOTE)).toHaveCount(0)

      // 导出:30 数据行,末行为数据行而非免费提示
      await panelRoot.getByRole('button', { name: 'Export Leads List' }).click()
      const download = await readDownload(page, () =>
        panelRoot.getByRole('menuitem', { name: 'Download data to csv' }).click()
      )
      expect(download.suggestedFilename()).toMatch(
        new RegExp(`^Bing_Maps_Scraper_${FIXTURE_TOTAL}_\\d{14}\\.csv$`)
      )
      const lines = csvLines(readFileSync((await download.path()) ?? '', 'utf-8'))
      expect(lines).toHaveLength(1 + FIXTURE_TOTAL)
      expect(lines[lines.length - 1]).toMatch(/^ypid:YN[0-9A-F]{16},/)

      // Pricing:回待命态(徽标在标题区,feat.md 三态表完成态无徽标)后点击 PRO
      await panelRoot.getByRole('button', { name: 'Go Back' }).click()
      await expect(startButton(page)).toBeVisible()
      await proBadge.click()
      await expect(panelRoot.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible()
      await expect(panelRoot.getByText(/Unlimited exports are active/)).toBeVisible()
      await expect(panelRoot.getByText('Signed in as E2E User')).toBeVisible()
      await expect(panelRoot.getByRole('button', { name: 'Upgrade Now' })).toHaveCount(0)

      expectFulfilledWithinAllowlist(fulfilled)
    } finally {
      await context.close()
    }
  })

  test('匿名(不发起登录):Sign in 徽标位 + 20 条截断照旧 + 零账号/订阅请求', async () => {
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await waitForExtensionServiceWorker(context)
      const { fulfilled } = await setupExtensionLoginRoutes(context, fixtureHtml, {
        user: MOCK_USER,
        subscription: subscriptionOf('free'),
        loginCode: LOGIN_CODE
      })

      await page.goto(`${MAPS_URL}&fixtureInitial=3`)
      const panelRoot = panel(page)
      await expect(panelRoot).toBeVisible({ timeout: 15_000 })
      // 未登录:徽标位为 Sign in,无 FREE/PRO
      await expect(panelRoot.getByRole('button', { name: 'Sign in' })).toBeVisible()
      await expect(panelRoot.getByRole('button', { name: 'FREE', exact: true })).toHaveCount(0)
      await expect(panelRoot.getByRole('button', { name: 'PRO', exact: true })).toHaveCount(0)
      await expect(startButton(page)).toBeEnabled({ timeout: 15_000 })

      await startButton(page).click()
      await expect(panelRoot.getByText(/^Exporting \d+\.\.\.$/)).toBeVisible()
      await page.evaluate(() => window.bingFixture.loadAll())
      await expect(page.locator('[data-entity]')).toHaveCount(FIXTURE_TOTAL)

      // 免费达限:20 条自动停止 + 警告条
      await expect(panelRoot.getByText('Search complete.')).toBeVisible({ timeout: 60_000 })
      await expect(panelRoot.getByText('20 businesses found.')).toBeVisible()
      await expect(panelRoot.getByText(FREE_LIMIT_NOTE)).toBeVisible()

      await panelRoot.getByRole('button', { name: 'Upgrade to Pro Now' }).click()
      await expect(panelRoot.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible()
      await expect(panelRoot.getByText('Not signed in (free account)')).toBeVisible()
      await expect(panelRoot.getByRole('button', { name: 'Upgrade Now' })).toBeVisible()

      // 匿名会话不得产生任何后端账号/订阅请求(exchange/auth-me/subscription 零调用)
      expectFulfilledWithinAllowlist(fulfilled)
      for (const url of fulfilled) {
        expect(url.startsWith(`${API_ORIGIN}/api/client/`), `匿名会话出现后端请求: ${url}`).toBe(
          false
        )
      }
    } finally {
      await context.close()
    }
  })
})

/**
 * 插件发起 v3 登录:点击面板 Sign in(launchWebAuthFlow 已被 installAuthFlowMock
 * 替换为同步回调,无 auth 窗口事件可等);提交完成由后续徽标断言轮询收敛。
 */
async function signInFromPanel(page: Page): Promise<void> {
  const signInButton = panel(page).getByRole('button', { name: 'Sign in' })
  await expect(signInButton).toBeVisible()
  await signInButton.click()
}
