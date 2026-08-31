/**
 * e2e 登录桥 + 免费/Pro 门控（016 U4，feat.md 验收标准 3/4）。
 *
 * - 登录同步全链路：官网模拟页（route 拦截注入 chrome.runtime.sendMessage
 *   BING_MAPS_EXTENSION_AUTH_CHANGED）→ 插件 onMessageExternal 收 token →
 *   后端 auth/me mock 校验 → 面板账号/订阅态展示；
 * - Pro 无上限：订阅 month mock → 采集收满 fixture 全量 30 条（不受 20 截断）
 *   → 导出无免费末行 → Pricing 显示 VIP 祝贺；
 * - 匿名免费：无 token → 20 条截断照旧。
 *
 * 后端 mock 形态 = spec-website §7 信封 {code:10000, data}；官网/后端域为
 * 生产构建占位常量（vite.config.ts，生产域名未定待决项）。
 */

import { readFileSync } from 'node:fs'
import { expect, test, type Download, type Page } from '@playwright/test'
import {
  API_ORIGIN,
  FIXTURE_PATH,
  FIXTURE_TOTAL,
  MAPS_URL,
  WEBSITE_LOGIN_BRIDGE_URL,
  launchExtensionContext,
  setupLoginBridgeRoutes,
  waitForExtensionServiceWorker,
  type MockSubscription
} from './harness'

/** 免费档导出末行提示（竞品逐字抄录）。 */
const FREE_LIMIT_NOTE = 'Free accounts can export up to 20 data entries.'

/** 登录桥 mock 账号（AUTH_ME 信封 data）。 */
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

/** 登录桥回执形态（官网页 sendMessage 回调结果,含 lastError 诊断）。 */
type BridgeAck = { response: { ok: boolean } | null; error: string | null }

/** 登录桥回执等待:poll 断言非 null 后取值,类型层收窄 null 位。 */
async function waitForBridgeAck(page: Page): Promise<BridgeAck> {
  await expect
    .poll(async () => (await page.evaluate(() => window.__bridgeResult)) ?? null, {
      timeout: 15_000
    })
    .not.toBeNull()
  return (await page.evaluate(() => window.__bridgeResult)) as BridgeAck
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

/** 零外网白名单：本组用例放行集只能是 fixture 导航、官网桥页与占位 API mock。 */
function expectFulfilledWithinAllowlist(urls: readonly string[]): void {
  const allowedPrefixes = [
    'https://www.bing.com/maps',
    WEBSITE_LOGIN_BRIDGE_URL,
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

test.describe('Bing 登录桥 + 免费/Pro 门控', () => {
  test.beforeEach(async () => {
    // Pro 无上限完成依赖 12 轮失败自动收敛(2s 翻页等待 × 12),放宽超时
    test.setTimeout(240_000)
  })

  test('登录同步全链路:官网桥页发 token → 插件校验收编 → 面板账号态生效(免费档)', async () => {
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await waitForExtensionServiceWorker(context)
      const { fulfilled } = await setupLoginBridgeRoutes(context, fixtureHtml, {
        token: 'e2e-website-token',
        user: MOCK_USER,
        subscription: subscriptionOf('free')
      })

      // 官网登录桥模拟页:sendMessage 发 AUTH_CHANGED,回执 ok = 插件收到并校验通过
      await page.goto(WEBSITE_LOGIN_BRIDGE_URL)
      const ack = await waitForBridgeAck(page)
      expect(ack.error).toBeNull()
      expect(ack.response).toEqual({ ok: true })

      // 账号态生效:面板标题区出现免费档徽标(登录但非 Pro),点击进 Pricing
      await page.goto(MAPS_URL)
      const panelRoot = panel(page)
      await expect(panelRoot).toBeVisible({ timeout: 15_000 })
      const freeBadge = panelRoot.getByRole('button', { name: 'FREE', exact: true })
      await expect(freeBadge).toBeVisible({ timeout: 15_000 })

      await freeBadge.click()
      await expect(panelRoot.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible()
      await expect(panelRoot.getByText('Signed in as E2E User')).toBeVisible()
      await expect(panelRoot.getByText(/Unlimited exports are active/)).toHaveCount(0)
      await panelRoot.getByRole('button', { name: 'Go Back' }).click()

      expectFulfilledWithinAllowlist(fulfilled)
    } finally {
      await context.close()
    }
  })

  test('Pro 态:订阅判定生效 → 采集无 20 条上限(fixture 30 条全收) → 导出无免费末行 → Pricing 显示 VIP', async () => {
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await waitForExtensionServiceWorker(context)
      const { fulfilled } = await setupLoginBridgeRoutes(context, fixtureHtml, {
        token: 'e2e-website-token',
        user: MOCK_USER,
        subscription: subscriptionOf('month')
      })

      await page.goto(WEBSITE_LOGIN_BRIDGE_URL)
      const ack = await waitForBridgeAck(page)
      expect(ack.response).toEqual({ ok: true })

      await page.goto(MAPS_URL)
      const panelRoot = panel(page)
      await expect(panelRoot).toBeVisible({ timeout: 15_000 })
      // Pro 徽标 = 门控判定已生效(订阅 month mock)
      await expect(
        panelRoot.getByRole('button', { name: 'PRO', exact: true })
      ).toBeVisible({ timeout: 15_000 })

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
      await panelRoot.getByRole('button', { name: 'PRO', exact: true }).click()
      await expect(panelRoot.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible()
      await expect(panelRoot.getByText(/Unlimited exports are active/)).toBeVisible()
      await expect(panelRoot.getByText('Signed in as E2E User')).toBeVisible()
      await expect(panelRoot.getByRole('button', { name: 'Upgrade Now' })).toHaveCount(0)

      expectFulfilledWithinAllowlist(fulfilled)
    } finally {
      await context.close()
    }
  })

  test('匿名(无 token):20 条截断照旧 + Pricing 免费账号态', async () => {
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await waitForExtensionServiceWorker(context)
      const { fulfilled } = await setupLoginBridgeRoutes(context, fixtureHtml, {
        token: null,
        user: MOCK_USER,
        subscription: subscriptionOf('free')
      })

      // 直接进入采集页(不触发登录桥),门控应按匿名免费计权
      await page.goto(`${MAPS_URL}&fixtureInitial=3`)
      const panelRoot = panel(page)
      await expect(panelRoot).toBeVisible({ timeout: 15_000 })
      // 未登录:标题区无账号徽标
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

      // 匿名会话不得产生任何后端账号/订阅请求(auth/me / subscription/status 零调用)
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
