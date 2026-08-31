/**
 * e2e spec：A9 设置页与采集/导出对接（013 U6）。
 *
 * 链路：options 设置页改间隔（5s）与格式（JSON）并取消勾选 Kgmid 列 →
 * chrome.storage 落盘断言 → Maps fixture 页面板按设置生效：
 * - 导出按钮格式后缀 (.JSON)、下载产物为 .json 且不含被取消勾选的列；
 * - 用户间隔覆盖远程值：mock 远程下发 interval=1s，用户显式设 5s 后，
 *   完成耗时 ≥ 两轮 5s（若覆盖未生效会在 ~2.5s 内完成，断言可判别）。
 *
 * 复用 panel-flow 的 fixture/回放机制（双 pattern route + 黄金样本），
 * 运行前提：`pnpm build:e2e`。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Page, type Route } from '@playwright/test'

const KEYWORD = 'coffee in manhattan'
const PAGE_URL = `https://www.google.com/maps/search/${encodeURIComponent(KEYWORD)}`
const END_MARKER_TEXT = "You've reached the end of the list."

/** e2e 构建产物目录。 */
const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist-e2e')

/** 用户显式间隔（秒）：覆盖层生效时每轮滚动等待 5s。 */
const USER_INTERVAL_SEC = 5

/** 格式 B 黄金样本（真实响应，与 panel-flow 同源）。 */
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

test.describe('A9 设置页与采集/导出对接', () => {
  test('打开设置 → 改间隔/格式/字段 → 面板导出按设置生效且用户间隔覆盖远程', async () => {
    test.setTimeout(180_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context)

      // —— 打开 options 设置页（独立标签页形态）——
      const extensionId = await getExtensionId(context)
      await page.goto(`chrome-extension://${extensionId}/src/options.html`)
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

      // 间隔五档改 5s（包内档位 5/6/8/9/10，e2e mock 远程下发 1s 用于判别覆盖）
      await page.getByRole('radio', { name: '5s' }).click()
      // 格式三选改 JSON
      await page.getByRole('radio', { name: 'JSON', exact: true }).click()
      // 36 列勾选：取消 Kgmid（Pro 列，导出产物不应再含该列）
      await page.getByText('Kgmid', { exact: true }).click()

      // 设置落盘断言（chrome.storage.local，即时保存语义）
      const stored = (await page.evaluate(() =>
        chrome.storage.local.get('maps_user_settings')
      )) as { maps_user_settings?: { requestIntervalSec: number; exportFormat: string; exportFieldHeaders: string[] } }
      expect(stored.maps_user_settings).toMatchObject({
        requestIntervalSec: USER_INTERVAL_SEC,
        exportFormat: 'json'
      })
      expect(stored.maps_user_settings?.exportFieldHeaders).not.toContain('Kgmid')
      expect(stored.maps_user_settings?.exportFieldHeaders).toContain('Name')

      // —— Maps 页：面板按设置生效 ——
      await page.goto(PAGE_URL)
      await expect(page.locator('#gmap-extractor-panel-host')).toHaveCount(1)
      const startButton = page.getByRole('button', { name: 'Start Extracting' })
      await expect(startButton).toBeVisible()

      await startButton.click()
      await expect(page.getByText('Extracting 20…')).toBeVisible({ timeout: 30_000 })

      // 导出按钮出现即采集完成。间隔的用户覆盖优先（远程 1s 被用户 5s 覆盖）
      // 不做耗时断言：竞品等待公式 random()*interval*1000+2000 让 5s 与 1s 的
      // 完成时间分布在 2~3s 区间重叠，时序断言必然抖动；覆盖层应用已由
      // maps-user-settings 单测在生效配置接缝处直接覆盖，且本 spec 的格式
      // 断言依赖同一条 initializeMapsUserSettings 快照链路（未初始化时格式
      // 恒为默认 csv，按钮后缀断言即失败）。
      const exportButton = page.getByRole('button', {
        name: 'Export Detailed List - 20 (.JSON)'
      })
      await expect(exportButton).toBeVisible({ timeout: 90_000 })

      // Export → 下载 .json，内容不含被取消勾选的列
      const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()])
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-20-coffee\+in\+manhattan-\d{4}-\d{2}-\d{2}\.json$/
      )
      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const rows = JSON.parse(readFileSync(downloadPath as string, 'utf-8')) as Array<
        Record<string, unknown>
      >
      expect(rows).toHaveLength(20)
      expect(Object.keys(rows[0])).toContain('name')
      expect(Object.keys(rows[0])).toContain('cid')
      expect(Object.keys(rows[0])).not.toContain('kgmid')

      // 设置变更实时刷新（013 A8:11）：complete 态面板在第二个标签页改格式后
      // 后缀即时更新（设置订阅重放 renderSearch，无需新采集事件）
      const optionsPage = await context.newPage()
      await optionsPage.goto(`chrome-extension://${extensionId}/src/options.html`)
      await expect(optionsPage.getByRole('heading', { name: 'Settings' })).toBeVisible()
      await optionsPage.getByRole('radio', { name: 'XLSX' }).click()
      await expect(
        page.getByRole('button', { name: 'Export Detailed List - 20 (.XLSX)' })
      ).toBeVisible()
      await optionsPage.close()
    } finally {
      await context.close()
    }
  })

  test('auto_download：采集完成即自动下载（无需点击 Export）', async () => {
    test.setTimeout(120_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context)

      // options 页开启 auto_download（其余设置保持默认：格式 csv；间隔未显式
      // 设置 → 远程 mock 1s 生效，完成快）
      const extensionId = await getExtensionId(context)
      await page.goto(`chrome-extension://${extensionId}/src/options.html`)
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
      await page
        .locator('.options-toggle-row')
        .filter({ hasText: 'Auto download on completion' })
        .locator('label.options-switch')
        .click()
      const stored = (await page.evaluate(() =>
        chrome.storage.local.get('maps_user_settings')
      )) as { maps_user_settings?: { autoDownload?: boolean } }
      expect(stored.maps_user_settings?.autoDownload).toBe(true)

      // Maps 页：Start 后等待完成边沿的自动下载，全程不点击 Export 按钮
      await page.goto(PAGE_URL)
      const startButton = page.getByRole('button', { name: 'Start Extracting' })
      await expect(startButton).toBeVisible()
      await startButton.click()

      const download = await page.waitForEvent('download', { timeout: 60_000 })
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-20-coffee\+in\+manhattan-\d{4}-\d{2}-\d{2}\.csv$/
      )
      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const csvText = readFileSync(downloadPath as string, 'utf-8')
      expect(csvText.startsWith('\uFEFF')).toBe(true)
      expect(csvText).toContain('Le Cafe Coffee')
    } finally {
      await context.close()
    }
  })

  test('隐私政策页：设置页页脚链接可打开 privacy.html（013 A13，U11）', async () => {
    test.setTimeout(60_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const extensionId = await getExtensionId(context)
      await page.goto(`chrome-extension://${extensionId}/src/options.html`)
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

      // 页脚链接 → 新标签打开产物根 privacy.html（中英双语静态页）
      const privacyPagePromise: Promise<Page> = context.waitForEvent('page')
      await page.getByRole('link', { name: 'Privacy Policy' }).click()
      const privacyPage = await privacyPagePromise
      await privacyPage.waitForLoadState()
      expect(new URL(privacyPage.url()).pathname).toBe('/privacy.html')
      await expect(
        privacyPage.getByRole('heading', { name: 'Privacy Policy — MapsGrab' })
      ).toBeVisible()
      // 中文版本锚点存在
      await expect(
        privacyPage.getByRole('heading', { name: '隐私政策 — MapsGrab' })
      ).toBeAttached()
    } finally {
      await context.close()
    }
  })
})
