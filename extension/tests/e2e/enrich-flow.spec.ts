/**
 * e2e spec：Email/社媒补全闭环（013 A4，U8 验收行为）。
 *
 * 链路：options 页开启 extractEmail/extractSocialMedias（+ auto_download 驱动
 * 自动导出）→ Maps fixture 页采集完成 → complete 边沿先补全（≤50/批，经
 * background 调本地 mock 的 enrich 端点，按 domain 确定性回填已知数据）写回
 * 行 → 自动导出的 CSV 含 Email / Social Medias 值；mock 收到补全请求
 * （businesses 均带 domain、无 domain 行不入批）且 SLS 收到 enrich_complete。
 *
 * 运行前提与网络策略同 panel-flow.spec.ts（build:e2e 产物 + 零外网）。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Route } from '@playwright/test'

const KEYWORD = 'coffee in manhattan'
const PAGE_URL = `https://www.google.com/maps/search/${encodeURIComponent(KEYWORD)}`
const END_MARKER_TEXT = "You've reached the end of the list."

/** e2e 构建产物目录。 */
const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist-e2e')

/** 与 scripts/build-e2e.mjs / global-setup.ts 一致的端口约定。 */
const E2E_MOCK_PORT = Number(process.env.E2E_MOCK_PORT ?? 9577)

/** 格式 B 黄金样本（真实响应，与 panel-flow 同源，20 家商家含 domain）。 */
const FORMAT_B_SAMPLE = readFileSync(
  resolve(process.cwd(), 'tests/fixtures/golden-samples/format-B-spa-xhr-20places.txt'),
  'utf-8'
)

/**
 * Maps 搜索结果列表页 fixture（与 panel-flow 同构：搜索按钮点击发第 1 批
 * XHR；feed 滚到底发第 2 批并追加末项结束提示）。
 */
function buildMapsListFixture(): string {
  const replayScript = `
(function () {
  var batches = 0
  var feed = document.querySelector('div[role=feed]')
  function fireRpc() {
    batches += 1
    var xhr = new XMLHttpRequest()
    xhr.open('POST', '/search?tbm=map&q=${encodeURIComponent(KEYWORD)}&batch=' + batches, true)
    xhr.send(null)
  }
  document.querySelector('div[role=search] button').addEventListener('click', fireRpc)
  feed.addEventListener('scroll', function () {
    if (batches >= 2) return
    if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 10) {
      fireRpc()
      var marker = document.createElement('div')
      marker.className = 'feed-end-marker'
      marker.textContent = ${JSON.stringify(END_MARKER_TEXT)}
      feed.appendChild(marker)
    }
  })
})()`

  const feedItems = Array.from(
    { length: 6 },
    (_, i) => `<div class="feed-item" style="height:260px">result ${i + 1}</div>`
  ).join('\n')

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
${feedItems}
  </div>
</div>
<script>${replayScript}</script>
</body>
</html>`
}

/** 统一网络拦截：双 pattern fixture + 其余外域 abort（零外网）。 */
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
    if (url.hostname === 'www.google.com' && url.pathname === '/search') {
      await route.fulfill({ contentType: 'text/plain; charset=utf-8', body: FORMAT_B_SAMPLE })
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

/** 从 background service worker 取扩展 id（options 页面 URL 需要）。 */
async function getExtensionId(context: BrowserContext): Promise<string> {
  const worker =
    context.serviceWorkers().find(sw => sw.url().startsWith('chrome-extension://')) ??
    (await context.waitForEvent('serviceworker'))
  return new URL(worker.url()).host
}

interface MockReceived {
  slsMarks: Array<Record<string, string>>
  enrichRequests: Array<{ businesses: Array<Record<string, unknown>> }>
}

test.describe('Email/社媒补全闭环（U8）', () => {
  test('开关开启 → 完成边沿补全 → 自动导出 CSV 含 Email/Social Medias + enrich_complete 打点', async () => {
    test.setTimeout(180_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context)

      // —— options 页：开启两个补全开关 + auto_download（驱动完成边沿自动导出）——
      const extensionId = await getExtensionId(context)
      await page.goto(`chrome-extension://${extensionId}/src/options.html`)
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
      await page
        .locator('.options-toggle-row')
        .filter({ hasText: 'Extract email address' })
        .locator('label.options-switch')
        .click()
      await page
        .locator('.options-toggle-row')
        .filter({ hasText: 'Extract social medias' })
        .locator('label.options-switch')
        .click()
      await page
        .locator('.options-toggle-row')
        .filter({ hasText: 'Auto download on completion' })
        .locator('label.options-switch')
        .click()
      const stored = (await page.evaluate(() =>
        chrome.storage.local.get('maps_user_settings')
      )) as {
        maps_user_settings?: { extractEmail?: boolean; extractSocialMedias?: boolean }
      }
      expect(stored.maps_user_settings?.extractEmail).toBe(true)
      expect(stored.maps_user_settings?.extractSocialMedias).toBe(true)

      // —— Maps 页：采集 → 完成边沿补全 → 自动导出（含补全数据的 CSV）——
      await page.goto(PAGE_URL)
      const startButton = page.getByRole('button', { name: 'Start Extracting' })
      await expect(startButton).toBeVisible()
      await startButton.click()

      const download = await page.waitForEvent('download', { timeout: 90_000 })
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-20-coffee\+in\+manhattan-\d{4}-\d{2}-\d{2}\.csv$/
      )
      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const csvText = readFileSync(downloadPath as string, 'utf-8')
      expect(csvText).toContain('Le Cafe Coffee')

      // 导出行含补全值：mock 按 domain 回填 info@{domain} 与 instagram/facebook；
      // lecafecoffee.com 是黄金样本首个解析行的 domain（parser 单测锚定）
      expect(csvText).toContain('lecafecoffee.com')
      expect(csvText).toContain('info@lecafecoffee.com')
      expect(csvText).toContain('instagram: https://www.instagram.com/lecafecoffee.com')

      // 本地 mock 断言：补全请求批次内全部带 domain；打点含 enrich_complete
      const received = (await fetch(
        `http://127.0.0.1:${E2E_MOCK_PORT}/__mock/received`
      ).then(response => response.json())) as MockReceived
      expect(received.enrichRequests.length).toBeGreaterThanOrEqual(1)
      for (const request of received.enrichRequests) {
        expect(request.businesses.length).toBeGreaterThan(0)
        expect(request.businesses.length).toBeLessThanOrEqual(50)
        for (const business of request.businesses) {
          expect(String(business.domain).length).toBeGreaterThan(0)
        }
      }
      const markTypes = received.slsMarks.map(mark => mark.mark_type)
      expect(markTypes).toContain('enrich_complete')
    } finally {
      await context.close()
    }
  })
})
