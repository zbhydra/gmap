/**
 * e2e spec：远端运营通道（013 A12，U6）。
 *
 * mock 服务常驻下发 operations 组（公告 HTML + minPluginVersion=99.0.0），
 * 面板挂载后应出现公告区（innerHTML 注入，竞品同构）与新版本提示行。
 * 其余外域一律 abort，配合 build:e2e 的本地 mock 指向，保证零外网。
 *
 * 运行前提：`pnpm build:e2e`（globalSetup 校验并拉起 mock）。
 */

import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Route } from '@playwright/test'

const PAGE_URL = 'https://www.google.com/maps/search/coffee+in+manhattan'

/** e2e 构建产物目录（SW 流量已在构建期指向本地 mock）。 */
const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist-e2e')

/** Maps 页极简 shell：面板挂载点（body）+ 主渲染区（div[role=main]）。 */
function buildMapsShellFixture(): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>coffee - Google Maps</title></head>
<body>
<div role="main">
  <div role="search">
    <form onsubmit="return false">
      <input id="ucc-1" name="q" value="coffee in manhattan">
      <button aria-label="Search" type="button"></button>
    </form>
  </div>
</div>
</body>
</html>`
}

/** 网络拦截：Maps 页 fixture + 其余外域 abort（127.0.0.1 放行直达本地 mock）。 */
async function setupRoutes(context: BrowserContext): Promise<void> {
  const fixtureHtml = buildMapsShellFixture()

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

test.describe('Maps 远端运营通道', () => {
  test('mock config 携带公告与新版本提示 → 面板公告区显示（innerHTML 注入）', async () => {
    test.setTimeout(60_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context)
      await page.goto(PAGE_URL)

      // 面板挂载
      const panelHost = page.locator('#gmap-extractor-panel-host')
      await expect(panelHost).toHaveCount(1)

      // 公告（远端 HTML 片段注入面板，文本来自 mock operations.announcementHtml）
      const announcement = panelHost.getByText('Spring sale is live.')
      await expect(announcement).toBeVisible({ timeout: 15_000 })

      // 新版本提示（mock minPluginVersion=99.0.0 > 本地 0.1.0）
      const versionNotice = panelHost.getByText('A new version is available.')
      await expect(versionNotice).toBeVisible()
    } finally {
      await context.close()
    }
  })
})
