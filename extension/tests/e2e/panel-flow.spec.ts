/**
 * e2e spec：Maps 面板采集闭环（013 计划 §0 断言面）。
 *
 * 双 pattern route（§0 设计）：
 * - `https://www.google.com/maps/**` → 按实测 DOM 形态构造的列表页 fixture
 *   （内嵌 XHR 回放脚本，点击搜索按钮/滚动到底时向 `/search?tbm=` 发请求）；
 * - `https://www.google.com/search*` → 格式 B 黄金样本 fulfill（解析链路）；
 * - 其余 http(s) 请求一律 abort 并记录，配合 SW 侧构建期指向本地 mock，
 *   保证整个 e2e 零外网。
 *
 * 浏览器：MV3 扩展的 content script 只在 persistent context 生效（官方约束，
 * 非 persistent context 属隐身语义，扩展默认关闭），因此这里用
 * launchPersistentContext + `--load-extension=dist-e2e` 自管上下文，
 * playwright project 仅承载测试编排。
 *
 * 运行前提：`pnpm build:e2e`（globalSetup 会校验 dist-e2e 存在并拉起 mock）。
 * 执行：`pnpm exec playwright test --project=extension-mv3`。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Route } from '@playwright/test'

/** 与 scripts/build-e2e.mjs / global-setup.ts 一致的端口约定。 */
const E2E_MOCK_PORT = Number(process.env.E2E_MOCK_PORT ?? 9577)

/** e2e 构建产物目录（SW 流量已在构建期指向本地 mock）。 */
const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist-e2e')

const KEYWORD = 'coffee in manhattan'
const PAGE_URL = `https://www.google.com/maps/search/${encodeURIComponent(KEYWORD)}`
const END_MARKER_TEXT = "You've reached the end of the list."

/** 36 列 CSV 表头（A5 字段字典固定列序，Pro 门控默认全开 → 全列导出）。 */
const EXPECTED_CSV_HEADER_36 = [
  'Name',
  'Description',
  'Fulladdress',
  'Street',
  'Municipality',
  'Categories',
  'About',
  'Plus Code',
  'Time Zone',
  'Price',
  'Note',
  'Amenities',
  'Hotel Class',
  'Phone',
  'Phones',
  'Claimed',
  'Owner',
  'Owner Id',
  'Owner Link',
  'Email',
  'Social Medias',
  'Review Count',
  'Average Rating',
  'Review URL',
  'Google Maps URL',
  'Google Knowledge URL',
  'Latitude',
  'Longitude',
  'Website',
  'Domain',
  'Opening Hours',
  'Featured Image',
  'Cid',
  'Fid',
  'Place Id',
  'Kgmid'
].join(',')

/** 格式 B 黄金样本（真实响应，755KB）。 */
const FORMAT_B_SAMPLE = readFileSync(
  resolve(process.cwd(), 'tests/fixtures/golden-samples/format-B-spa-xhr-20places.txt'),
  'utf-8'
)

/**
 * 构造 Maps 搜索结果列表页 fixture。
 *
 * DOM 形态对齐 013 实测：div[role=main] > div[role=search](form+button) +
 * div[role=feed]（可滚动容器）。回放脚本：搜索按钮点击 → 发第 1 批 XHR；
 * feed 滚到底 → 发第 2 批 XHR 并追加末项结束提示。
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
async function setupRoutes(context: BrowserContext): Promise<string[]> {
  const blockedExternal: string[] = []
  const fixtureHtml = buildMapsListFixture()

  await context.route(/^https?:\/\//, async (route: Route) => {
    const url = new URL(route.request().url())

    // SW 发起的本地 mock 流量：实测 Chromium 下 context.route 能拦截 MV3 SW
    // 请求，此处显式放行直达 mock（build:e2e 的 BASE_URL 注入是双保险），
    // 保证零真实外网的同时配置/打点链路可达
    if (url.hostname === '127.0.0.1') {
      await route.fallback()
      return
    }

    if (url.hostname === 'www.google.com' && url.pathname.startsWith('/maps')) {
      await route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixtureHtml })
      return
    }
    // Maps 内部 RPC（/search?tbm=map）走黄金样本
    if (url.hostname === 'www.google.com' && url.pathname === '/search') {
      await route.fulfill({ contentType: 'text/plain; charset=utf-8', body: FORMAT_B_SAMPLE })
      return
    }

    blockedExternal.push(route.request().url())
    await route.abort()
  })

  return blockedExternal
}

/** 启动加载扩展的 persistent context（隐身语义下扩展 content script 不注入）。 */
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

test.describe('Maps 面板采集闭环', () => {
  test('待命 → Start → 计数增长 → Pause/Resume → 完成 → CSV 导出；全程零外网', async () => {
    test.setTimeout(120_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const blockedExternal = await setupRoutes(context)

      const externalRequests: string[] = []
      context.on('request', request => {
        const url = request.url()
        if (url.startsWith('http')) {
          const { hostname } = new URL(url)
          if (hostname !== 'www.google.com' && hostname !== '127.0.0.1') {
            externalRequests.push(url)
          }
        }
      })

      await page.goto(PAGE_URL)

      // 待命态：面板挂载（host 存在）且按钮为 Start Extracting（css 穿透 open shadow DOM）
      const panelHost = page.locator('#gmap-extractor-panel-host')
      await expect(panelHost).toHaveCount(1)
      const startButton = page.getByRole('button', { name: 'Start Extracting' })
      await expect(startButton).toBeVisible()

      // 左右位置切换按钮存在且可点击
      const toggleButton = page.getByRole('button', { name: 'Toggle panel position' })
      await expect(toggleButton).toBeVisible()
      await toggleButton.click()

      // Start → 触发搜索重放 → 首批响应 → 计数 20（黄金样本 20 家商家）
      await startButton.click()
      await expect(page.getByText('Extracting 20…')).toBeVisible({ timeout: 30_000 })

      // Pause 判别：Pause 前计数已锚定为 20；挂起后等待 ≥ 两轮完整采集周期
      // （mock 下发 interval=1s，每轮 delay=random*1s+2s + 动画 0.2~0.4s，两轮
      // 约 4.4~6.8s）。若未真正挂起，窗口内必然经历「滚动到底 → 第二批 XHR →
      // 末项结束提示 → complete」而离开采集中态：
      // - 计数断言（Extracting 20… 仍 visible）会失败——完成态下该文案隐藏；
      // - 完成态按钮断言（count 0）会失败。
      await page.getByRole('button', { name: 'Pause' }).click()
      await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()
      await page.waitForTimeout(7_000)
      await expect(page.getByText('Extracting 20…')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Export Detailed List - 20 (.CSV)' })
      ).toHaveCount(0)

      // Resume → 滚动到底触发第二批 → 末项结束提示 → 完成态
      await page.getByRole('button', { name: 'Resume' }).click()
      const exportButton = page.getByRole('button', { name: 'Export Detailed List - 20 (.CSV)' })
      await expect(exportButton).toBeVisible({ timeout: 60_000 })

      // Export → 触发浏览器下载
      const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()])
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-20-coffee\+in\+manhattan-\d{4}-\d{2}-\d{2}\.csv$/
      )
      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const csvText = readFileSync(downloadPath as string, 'utf-8')
      // 36 列全 schema 表头（U4 导出引擎）+ 行值抽检
      expect(csvText.startsWith(`\uFEFF${EXPECTED_CSV_HEADER_36}\r\n`)).toBe(true)
      expect(csvText).toContain('Le Cafe Coffee')
      expect(csvText).toContain('https://www.google.com/maps?cid=')

      // Reset → 回待命态
      await page.getByRole('button', { name: 'Reset' }).click()
      await expect(page.getByRole('button', { name: 'Start Extracting' })).toBeVisible()

      // 零外网断言一：route 层除 fixture/样本外全部被 abort
      expect(blockedExternal).toEqual([])
      // 零外网断言二：context 网络层无第三域请求
      expect(externalRequests).toEqual([])

      // 本地 mock 断言：配置下发与两类业务打点均落地
      const received = await fetch(`http://127.0.0.1:${E2E_MOCK_PORT}/__mock/received`).then(
        response => response.json() as Promise<MockReceived>
      )
      expect(received.configRequests).toBeGreaterThanOrEqual(1)
      const markTypes = received.slsMarks.map(mark => mark.mark_type)
      expect(markTypes).toContain('search')
      expect(markTypes).toContain('export_results')
    } finally {
      await context.close()
    }
  })
})

interface MockReceived {
  configRequests: number
  slsMarks: Array<Record<string, string>>
  backendMarks: Array<Record<string, unknown>>
}
