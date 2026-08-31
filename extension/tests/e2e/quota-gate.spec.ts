/**
 * e2e spec：配额耗尽门控（013 A11，U7 验收行为）。
 *
 * 场景：本地 mock 切到「额度用尽」态（服务端权威 exhausted=true）→ 打开
 * Maps 搜索结果页 → 面板挂载后预检拉到耗尽快照 → Start 禁用并显示
 * 「额度用尽 + 订阅引导」提示（仅文案，无跳转按钮：C2 订阅套餐形态未决策
 * 且 Maps 档位无购买入口）。
 *
 * mock 为全局单例（workers=1 串行），spec 末尾 finally 重置额度态，避免
 * 污染后续 spec；既有 spec（panel-flow 等）在默认未耗尽态下不回归。
 *
 * 运行前提与网络策略同 panel-flow.spec.ts（build:e2e 产物 + 零外网）。
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

test.describe('配额门控（U7）', () => {
  test('额度用尽：Start 禁用 + 「额度用尽」提示与订阅引导文案；重置后恢复可用', async () => {
    test.setTimeout(60_000)
    await setMockUsage({ exhausted: true })
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context)
      await page.goto(PAGE_URL)

      const panelHost = page.locator('#gmap-extractor-panel-host')
      await expect(panelHost).toHaveCount(1)

      const startButton = page.getByRole('button', { name: 'Start Extracting' })
      // 面板挂载即预检：耗尽态下 Start 禁用 + 提示行出现（en-US 基线文案）
      await expect(startButton).toBeDisabled({ timeout: 15_000 })
      await expect(page.getByText('Monthly quota exhausted. Upgrade your plan to keep extracting.')).toBeVisible()
      // 仅文案引导：面板内不出现订阅跳转按钮（购买入口归 C2 决策后的链路）
      await expect(panelHost.getByRole('link')).toHaveCount(0)

      // Reset 控制端点后重新加载页面：门控解除，Start 恢复可用（不回归采集）
      await setMockUsage({ reset: true })
      await page.reload()
      const startAfterReset = page.getByRole('button', { name: 'Start Extracting' })
      await expect(startAfterReset).toBeVisible({ timeout: 15_000 })
      await expect(startAfterReset).toBeEnabled()
    } finally {
      await context.close()
      // 串行共享 mock：无论如何恢复默认额度态，避免污染后续 spec
      await setMockUsage({ reset: true })
    }
  })
})
