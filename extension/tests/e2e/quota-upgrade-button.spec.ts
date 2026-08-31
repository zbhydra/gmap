/**
 * e2e spec：订阅引导按钮（013 U7 遗留接线，W7 验收行为）。
 *
 * 链路：mock operations 下发本地 pricingUrl → 配额耗尽 → 面板「额度用尽」
 * 提示旁出现 View Plans 按钮 → 点击经 background RPC 代开
 * （chrome.tabs.create）新标签打开 `{pricingUrl}?utm_source=extension`；
 * 重置额度（免费额度内）后按钮不出现（纯文案回归）。
 *
 * 落地页指向本地 mock /pricing/（零外网）；chrome.tabs.create 的标签页在
 * Playwright 中表现为 context 的 page 事件，据此断言落地 URL 与归因参数。
 *
 * mock 为全局单例（workers=1 串行），spec 末尾 finally 重置额度态；
 * 运行前提与网络策略同 quota-gate.spec.ts（build:e2e 产物 + 零外网）。
 */

import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Route } from '@playwright/test'

/** 与 scripts/build-e2e.mjs / global-setup.ts 一致的端口约定。 */
const E2E_MOCK_PORT = Number(process.env.E2E_MOCK_PORT ?? 9577)

/** 本地 mock 控制端点（globalSetup 拉起的同一服务）。 */
const MOCK_BASE = `http://127.0.0.1:${E2E_MOCK_PORT}`

const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist-e2e')

const KEYWORD = 'coffee in manhattan'
const PAGE_URL = `https://www.google.com/maps/search/${encodeURIComponent(KEYWORD)}`

/** 最小 Maps 搜索结果页 fixture：只要求 dom.main / 面板挂载条件成立。 */
function buildMapsListFixture(): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${KEYWORD} - Google Maps</title></head>
<body>
<div role="main">
  <div role="search">
    <form onsubmit="return false">
      <input id="ucc-1" name="q" value="${KEYWORD}">
      <button aria-label="Search" type="button"></button>
    </form>
  </div>
  <div role="feed" style="height:420px;overflow-y:auto">
    <div class="feed-item" style="height:260px">result 1</div>
  </div>
</div>
</body>
</html>`
}

/** 网络拦截：/maps fixture + 本地 mock 放行，其余 abort（零外网）。 */
async function setupRoutes(context: BrowserContext): Promise<void> {
  const fixtureHtml = buildMapsListFixture()
  await context.route(/^https?:\/\//, async (route: Route) => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1') {
      await route.fallback()
      return
    }
    if (url.hostname === 'www.google.com' && url.pathname.startsWith('/maps')) {
      await route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixtureHtml })
      return
    }
    await route.abort()
  })
}

async function launchExtensionContext(): Promise<BrowserContext> {
  return chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${PATH_TO_EXTENSION}`,
      `--load-extension=${PATH_TO_EXTENSION}`
    ]
  })
}

/** 切换 mock 配额状态（exhausted / reset）。 */
async function setMockUsage(body: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${MOCK_BASE}/__mock/usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  expect(response.ok).toBe(true)
}

test.describe('订阅引导按钮（W7）', () => {
  test('额度用尽：按钮出现，点击新标签打开 pricingUrl?utm_source=extension', async () => {
    test.setTimeout(60_000)
    await setMockUsage({ exhausted: true })
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context)
      await page.goto(PAGE_URL)

      const panelHost = page.locator('#gmap-extractor-panel-host')
      await expect(panelHost).toHaveCount(1)
      // 门控预检：耗尽态下按钮出现（en-US 基线文案）
      const upgradeButton = panelHost.getByRole('button', { name: 'View Plans' })
      await expect(upgradeButton).toBeVisible({ timeout: 15_000 })

      // 点击 → background chrome.tabs.create → context 出现落地页新标签
      const pricingPagePromise = context.waitForEvent('page')
      await upgradeButton.click()
      const pricingPage = await pricingPagePromise
      const pricingUrl = new URL(pricingPage.url())
      expect(pricingUrl.pathname).toBe('/pricing/')
      expect(pricingUrl.searchParams.get('utm_source')).toBe('extension')
      await pricingPage.close()
    } finally {
      await context.close()
      // 串行共享 mock：无论如何恢复默认额度态，避免污染后续 spec
      await setMockUsage({ reset: true })
    }
  })

  test('免费额度内（非耗尽）：按钮不出现，保持纯文案', async () => {
    test.setTimeout(60_000)
    await setMockUsage({ reset: true })
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context)
      await page.goto(PAGE_URL)

      const panelHost = page.locator('#gmap-extractor-panel-host')
      await expect(panelHost).toHaveCount(1)
      // 非耗尽态：Start 可用（面板正常），订阅引导按钮保持隐藏
      const startButton = page.getByRole('button', { name: 'Start Extracting' })
      await expect(startButton).toBeEnabled({ timeout: 15_000 })
      await expect(
        panelHost.getByRole('button', { name: 'View Plans' })
      ).toBeHidden()
    } finally {
      await context.close()
      await setMockUsage({ reset: true })
    }
  })
})
