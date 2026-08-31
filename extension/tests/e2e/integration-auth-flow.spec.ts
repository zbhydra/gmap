/**
 * e2e spec：A10 集成开关与授权状态联动 + auto_save 边沿（013 U9）。
 *
 * 口径：真实 OAuth 不进默认集（占位 client_id 无法真跑授权，标注 real
 * smoke）——授权成功路径由单测以 mock chrome.identity 覆盖；本 spec 用
 * 预置 chrome.storage 模拟已授权状态，验证 options 页的真实联动行为：
 * - 未授权态：两集成显示 Not connected、无 Disconnect 入口；
 * - 已授权态：显示 Connected + Disconnect，Drive 开关开启（预置设置）；
 * - Disconnect：清 storage 授权记录、关闭 auto_save 开关、状态回 Not
 *   connected；HubSpot 与 Drive 断开互不影响；
 * - 已授权时直接关开关：仅落盘设置，不动授权记录。
 *
 * auto_save 边沿（与 auto_download 同模式）：开启 autoSaveToHubSpot + 预置
 * HubSpot 授权 → Maps 采集完成 → background 现读 storage 授权并发起同步 →
 * 断言本地 mock（build:e2e 注入的 BASE_URL）收到 /maps/hubspot/sync 请求体。
 *
 * 运行前提：`pnpm build:e2e`。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Route } from '@playwright/test'

/** e2e 构建产物目录。 */
const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist-e2e')

/** 本地 mock 服务（与 scripts/build-e2e.mjs 的端口约定一致）。 */
const MOCK_ORIGIN = `http://127.0.0.1:${process.env.E2E_MOCK_PORT ?? '9577'}`

const KEYWORD = 'coffee in manhattan'
const PAGE_URL = `https://www.google.com/maps/search/${encodeURIComponent(KEYWORD)}`
const END_MARKER_TEXT = "You've reached the end of the list."

const INTEGRATION_AUTH_KEY = 'maps_integration_auth'
const USER_SETTINGS_KEY = 'maps_user_settings'

/** 格式 B 黄金样本（真实响应，与 options-flow 同源）。 */
const FORMAT_B_SAMPLE = readFileSync(
  resolve(process.cwd(), 'tests/fixtures/golden-samples/format-B-spa-xhr-20places.txt'),
  'utf-8'
)

/**
 * Maps 搜索结果列表页 fixture（与 options-flow 同构：搜索按钮点击发第 1 批
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

/** 统一网络拦截：外域全 abort（零外网），127.0.0.1 放行本地 mock。 */
async function setupRoutes(
  context: BrowserContext,
  options: { mapsFixture?: boolean } = {}
): Promise<void> {
  const fixtureHtml = buildMapsListFixture()
  await context.route(/^https?:\/\//, async (route: Route) => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1') {
      await route.fallback()
      return
    }
    if (options.mapsFixture && url.hostname === 'www.google.com') {
      if (url.pathname.startsWith('/maps')) {
        await route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixtureHtml })
        return
      }
      if (url.pathname === '/search') {
        await route.fulfill({ contentType: 'text/plain; charset=utf-8', body: FORMAT_B_SAMPLE })
        return
      }
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

/** 集成开关行定位（按文案过滤）。 */
function integrationRow(page: import('@playwright/test').Page, label: string) {
  return page.locator('.options-toggle-row').filter({ hasText: label })
}

test.describe('A10 集成开关与授权状态联动', () => {
  test('未授权显示 Not connected；预置授权后显示 Connected，Disconnect 清理授权与开关', async () => {
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context)
      const extensionId = await getExtensionId(context)

      // —— 未授权态 ——
      await page.goto(`chrome-extension://${extensionId}/src/options.html`)
      const driveRow = integrationRow(page, 'Auto save to Google Drive')
      const hubspotRow = integrationRow(page, 'Auto save to HubSpot')
      await expect(driveRow).toBeVisible()
      await expect(driveRow.getByText('Not connected')).toBeVisible()
      await expect(hubspotRow.getByText('Not connected')).toBeVisible()
      await expect(driveRow.getByRole('button', { name: 'Disconnect' })).toHaveCount(0)
      await expect(hubspotRow.getByRole('button', { name: 'Disconnect' })).toHaveCount(0)

      // —— 预置已授权状态（真实 OAuth 跳过；授权写入由单测 mock 覆盖）——
      await page.evaluate(
        ([authKey, settingsKey]) => {
          void chrome.storage.local.set({
            [authKey as string]: {
              drive: { accessToken: 'e2e-drive-token', grantedAt: 1756500000000 },
              hubspot: {
                accessToken: 'e2e-hs-token',
                refreshToken: 'e2e-hs-refresh',
                expiresAt: 1798500000000
              }
            },
            [settingsKey as string]: { autoSaveToGoogleDrive: true }
          })
        },
        [INTEGRATION_AUTH_KEY, USER_SETTINGS_KEY]
      )
      await page.reload()
      await expect(driveRow.getByText('Connected', { exact: true })).toBeVisible()
      await expect(hubspotRow.getByText('Connected', { exact: true })).toBeVisible()
      await expect(driveRow.locator('label.options-switch input')).toBeChecked()
      await expect(hubspotRow.locator('label.options-switch input')).not.toBeChecked()

      // —— HubSpot Disconnect：清授权 + 关开关 + 状态回退，Drive 不受影响 ——
      await hubspotRow.getByRole('button', { name: 'Disconnect' }).click()
      await expect(hubspotRow.getByText('Not connected')).toBeVisible()
      await expect(driveRow.getByText('Connected', { exact: true })).toBeVisible()

      const storedAfterHubspot = (await page.evaluate(key =>
        chrome.storage.local.get(key)
      )) as Record<string, { drive?: unknown; hubspot?: unknown }>
      expect(storedAfterHubspot[INTEGRATION_AUTH_KEY]?.hubspot).toBeNull()
      expect(storedAfterHubspot[INTEGRATION_AUTH_KEY]?.drive).toMatchObject({
        accessToken: 'e2e-drive-token'
      })
      const settingsAfterHubspot = (await page.evaluate(key =>
        chrome.storage.local.get(key)
      )) as Record<string, { autoSaveToHubspot?: boolean }>
      expect(settingsAfterHubspot[USER_SETTINGS_KEY]?.autoSaveToHubspot).toBe(false)

      // —— Drive：先直接关开关（已授权，仅落盘不动授权），再 Disconnect ——
      await driveRow.locator('label.options-switch').click()
      await expect(driveRow.locator('label.options-switch input')).not.toBeChecked()
      const settingsAfterToggle = (await page.evaluate(key =>
        chrome.storage.local.get(key)
      )) as Record<string, { autoSaveToGoogleDrive?: boolean }>
      expect(settingsAfterToggle[USER_SETTINGS_KEY]?.autoSaveToGoogleDrive).toBe(false)
      const authAfterToggle = (await page.evaluate(key =>
        chrome.storage.local.get(key)
      )) as Record<string, { drive?: unknown }>
      expect(authAfterToggle[INTEGRATION_AUTH_KEY]?.drive).not.toBeNull()

      await driveRow.getByRole('button', { name: 'Disconnect' }).click()
      await expect(driveRow.getByText('Not connected')).toBeVisible()
      const authAfterDisconnect = (await page.evaluate(key =>
        chrome.storage.local.get(key)
      )) as Record<string, { drive?: unknown }>
      expect(authAfterDisconnect[INTEGRATION_AUTH_KEY]?.drive).toBeNull()
    } finally {
      await context.close()
    }
  })
  test('auto_save 边沿：autoSaveToHubspot 开 + 已授权 → 采集完成 → mock 收到 /maps/hubspot/sync', async ({ request }) => {
    test.setTimeout(120_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await setupRoutes(context, { mapsFixture: true })
      const extensionId = await getExtensionId(context)

      // 预置 HubSpot 已授权（token 未过期，background 现读即可，不发刷新）
      // 与 autoSaveToHubspot 开关（Drive 保持关，单路可判别）
      await page.goto(`chrome-extension://${extensionId}/src/options.html`)
      await page.evaluate(
        ([authKey, settingsKey]) => {
          void chrome.storage.local.set({
            [authKey as string]: {
              drive: null,
              hubspot: {
                accessToken: 'e2e-hs-token',
                refreshToken: 'e2e-hs-refresh',
                expiresAt: 1798500000000
              }
            },
            [settingsKey as string]: { autoSaveToHubspot: true }
          })
        },
        [INTEGRATION_AUTH_KEY, USER_SETTINGS_KEY]
      )
      // onMounted 只读一次授权状态，预置后需重载让 UI 消费新 storage
      await page.reload()
      await expect(
        integrationRow(page, 'Auto save to HubSpot').getByText('Connected', { exact: true })
      ).toBeVisible()

      // Maps 采集：Start → 完成边沿自动触发 auto_save（无需点击 Export）
      await page.goto(PAGE_URL)
      await expect(page.locator('#gmap-extractor-panel-host')).toHaveCount(1)
      const startButton = page.getByRole('button', { name: 'Start Extracting' })
      await expect(startButton).toBeVisible()
      await startButton.click()
      await expect(
        page.getByRole('button', { name: 'Export Detailed List - 20 (.CSV)' })
      ).toBeVisible({ timeout: 90_000 })

      // 本地 mock 收到同步请求：token 来自预置授权，商家数组为去重后的 20 行
      await expect
        .poll(
          async () => {
            const response = await request.get(`${MOCK_ORIGIN}/__mock/received`)
            const received = (await response.json()) as {
              hubspotSyncs: Array<{ token?: string; businesses?: Array<unknown> }>
            }
            return received.hubspotSyncs
          },
          { timeout: 30_000, intervals: [500, 1_000, 2_000] }
        )
        .toEqual([
          {
            token: 'e2e-hs-token',
            businesses: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(String), city: expect.any(String) })
            ])
          }
        ])
      const receivedResponse = await request.get(`${MOCK_ORIGIN}/__mock/received`)
      const received = (await receivedResponse.json()) as {
        hubspotSyncs: Array<{ businesses?: Array<Record<string, string>> }>
      }
      expect(received.hubspotSyncs[0]?.businesses).toHaveLength(20)
    } finally {
      await context.close()
    }
  })
})
