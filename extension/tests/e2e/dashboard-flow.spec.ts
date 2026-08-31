/**
 * e2e spec：批量任务面板闭环（013 A6，U5 验收行为）。
 *
 * 链路：dashboard 扩展页创建并启动关键词任务 A（Start Extracting = 创建 +
 * 启动）→ SW 调度器逐关键词打开 Maps 搜索工作页（URL 携带 gme_bulk 参数）→
 * 面板自动开始采集 → 完成强制自动导出（下载事件）→ 回报调度器 → 关页切下一
 * 关键词 → 任务完成态。A 运行中经表单创建任务 B 并启动 → 互斥 danger 提示
 * （任务已创建、启动被拒，竞品同构）；A 完成后 B 经行操作 Start 正常启动并
 * 完成（互斥解除）。dashboard 重载后任务状态还原（IndexedDB 持久化）。
 *
 * fixture 复用 U2 双 pattern 模式：`/maps/**` → 通用列表页 fixture（关键词
 * 从工作页 URL 解析，滚动到底触发第二批 XHR + 末项结束提示）；`/search*` →
 * 格式 B 黄金样本；其余外域 abort + build:e2e 的 SW 本地 mock，零外网。
 *
 * 运行前提：`pnpm build:e2e`（globalSetup 校验并拉起 mock）。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Page, type Route } from '@playwright/test'

const END_MARKER_TEXT = "You've reached the end of the list."

/** 格式 B 黄金样本（真实响应，755KB）。 */
const FORMAT_B_SAMPLE = readFileSync(
  resolve(process.cwd(), 'tests/fixtures/golden-samples/format-B-spa-xhr-20places.txt'),
  'utf-8'
)

/**
 * 通用 Maps 搜索列表页 fixture：关键词从工作页 URL 解析（批量任务逐关键词
 * 打开不同 URL，一份 fixture 服务全部条目）。回放脚本与 U2 面板 spec 同构：
 * 搜索按钮点击 → 第 1 批 XHR；feed 滚到底 → 第 2 批 XHR + 末项结束提示。
 */
function buildMapsListFixture(keyword: string): string {
  const replayScript = `
(function () {
  var kw = decodeURIComponent(location.pathname.split('/')[3] || 'bulk')
  var batches = 0
  var feed = document.querySelector('div[role=feed]')
  function fireRpc() {
    batches += 1
    var xhr = new XMLHttpRequest()
    xhr.open('POST', '/search?tbm=map&q=' + encodeURIComponent(kw) + '&batch=' + batches, true)
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
<head><meta charset="utf-8"><title>${keyword} - Google Maps</title></head>
<body>
<div role="main">
  <div role="search">
    <form onsubmit="return false">
      <input id="ucc-1" name="q" value="${keyword}">
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

  await context.route(/^https?:\/\//, async (route: Route) => {
    const url = new URL(route.request().url())

    if (url.hostname === '127.0.0.1') {
      await route.fallback()
      return
    }

    if (url.hostname === 'www.google.com' && url.pathname.startsWith('/maps')) {
      const keyword = decodeURIComponent(url.pathname.split('/')[3] ?? 'bulk')
      await route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: buildMapsListFixture(keyword)
      })
      return
    }
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
      `--disable-extensions-except=${resolve(process.cwd(), 'dist-e2e')}`,
      `--load-extension=${resolve(process.cwd(), 'dist-e2e')}`
    ]
  })
}

/** 从 background service worker 取扩展 id（打开 dashboard 页需要）。 */
async function getExtensionId(context: BrowserContext): Promise<string> {
  const worker =
    context.serviceWorkers().find(sw => sw.url().startsWith('chrome-extension://')) ??
    (await context.waitForEvent('serviceworker'))
  return new URL(worker.url()).host
}

/** 等待批量工作页（调用方需先注册 context.waitForEvent('page')）并断言批量契约。 */
async function expectWorkTab(
  workTabPromise: Promise<Page>,
  keyword: string,
  expectedItemIndex: number
): Promise<Page> {
  const workTab = await workTabPromise
  const expectedPath = `/maps/search/${keyword}/@40.7604552,-73.9858076,12z`

  // SW 先开 bulk-launch 中转页，渲染进程 location.replace 跳到工作页：
  // 这里等待中转完成后的真实工作 URL（主框架导航此时才可被 route 拦截）
  await workTab.waitForURL(
    url =>
      url.hostname === 'www.google.com' && decodeURIComponent(url.pathname) === expectedPath,
    { timeout: 30_000 }
  )

  const workUrl = new URL(workTab.url())
  expect(decodeURIComponent(workUrl.pathname)).toBe(expectedPath)
  expect(workUrl.searchParams.get('gme_bulk')).toBe('1')
  expect(workUrl.searchParams.get('gme_bulk_task')).toBeTruthy()
  expect(Number(workUrl.searchParams.get('gme_bulk_item'))).toBe(expectedItemIndex)

  // 自动开始：面板进入采集态（无需用户点击 Start Extracting）
  await expect(workTab.getByText(/Extracting \d+/)).toBeVisible({ timeout: 30_000 })
  return workTab
}

test.describe('批量任务面板闭环', () => {
  test('创建启动 → 逐关键词自动采集导出 → 互斥提示 → 完成态 → 持久化还原；零外网', async () => {
    test.setTimeout(240_000)
    const context = await launchExtensionContext()
    const dashboard = context.pages()[0] ?? (await context.newPage())

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

      const extensionId = await getExtensionId(context)
      await dashboard.goto(`chrome-extension://${extensionId}/src/dashboard.html`)
      await expect(dashboard.getByRole('heading', { name: 'Bulk Tasks' })).toBeVisible()
      await expect(dashboard.getByText('No tasks yet.')).toBeVisible()

      // 创建并启动任务 A（表单 Start Extracting = 创建 + 启动，竞品语义）
      await dashboard.getByLabel('Task Name').fill('E2E alpha')
      await dashboard
        .getByLabel('Keywords')
        .fill('coffee in manhattan\nlatte in brooklyn\nmocha in harlem')

      const firstWorkTabPromise: Promise<Page> = context.waitForEvent('page')
      await dashboard.getByRole('button', { name: 'Start Extracting' }).click()
      const workTab1 = await expectWorkTab(firstWorkTabPromise, 'coffee in manhattan', 0)

      // 表单成功后清空；任务表出现运行中的 A
      await expect(dashboard.getByLabel('Task Name')).toHaveValue('')
      const alphaRow = dashboard.getByRole('row', { name: /E2E alpha/ })
      await expect(alphaRow.getByText('Running', { exact: true })).toBeVisible()

      // 事件注册必须早于上一项完成（done → 关页 → 开下一页是紧凑串行链）：
      // 拿到 tab1 即注册它的下载等待与下一工作页的创建等待
      const download1Promise = workTab1.waitForEvent('download', { timeout: 90_000 })
      const workTab2Promise = context.waitForEvent('page')

      // 强制自动导出（批量语义，不依赖 auto_download 用户设置）
      const download1 = await download1Promise
      expect(download1.suggestedFilename()).toMatch(/^MapsGrab-Extractor-20-coffee\+in\+manhattan/)

      // 互斥（竞品同构 danger 提示）：A 运行中经表单创建并启动任务 B →
      // 任务创建成功（入列）但启动被拒，提示互斥、表单保留
      await dashboard.getByLabel('Task Name').fill('E2E beta')
      await dashboard.getByLabel('Keywords').fill('tea in queens')
      await dashboard.getByRole('button', { name: 'Start Extracting' }).click()
      await expect(
        dashboard.getByText('Another task is running. Stop it before starting this one.')
      ).toBeVisible()
      const betaRow = dashboard.getByRole('row', { name: /E2E beta/ })
      await expect(betaRow.getByText('Idle', { exact: true })).toBeVisible()

      // 关键词 2/3：完成回报 → 关页 → 调度器切下一关键词
      const workTab2 = await expectWorkTab(workTab2Promise, 'latte in brooklyn', 1)
      const download2Promise = workTab2.waitForEvent('download', { timeout: 90_000 })
      const workTab3Promise = context.waitForEvent('page')

      const download2 = await download2Promise
      // 导出文件名的关键词取自解析响应（黄金样本内嵌 query 固定为 coffee），
      // 逐关键词的导航差异已由上方 URL 断言覆盖
      expect(download2.suggestedFilename()).toMatch(/^MapsGrab-Extractor-20-coffee\+in\+manhattan/)

      const workTab3 = await expectWorkTab(workTab3Promise, 'mocha in harlem', 2)
      const download3 = await workTab3.waitForEvent('download', { timeout: 90_000 })
      expect(download3.suggestedFilename()).toMatch(/^MapsGrab-Extractor-20-coffee\+in\+manhattan/)

      // 任务 A 完成态（dashboard 经广播/重读快照实时刷新）
      await expect(alphaRow.getByText('Completed', { exact: true })).toBeVisible({ timeout: 30_000 })
      await expect(alphaRow.getByText('3/3 items')).toBeVisible()

      // 互斥解除：A 完成后 B 经行操作 Start 正常启动并完成
      const betaWorkTabPromise = context.waitForEvent('page')
      await betaRow.getByRole('button', { name: 'Start', exact: true }).click()
      const betaWorkTab = await expectWorkTab(betaWorkTabPromise, 'tea in queens', 0)
      const download4 = await betaWorkTab.waitForEvent('download', { timeout: 90_000 })
      expect(download4.suggestedFilename()).toMatch(/^MapsGrab-Extractor-20-coffee\+in\+manhattan/)
      await expect(betaRow.getByText('Completed', { exact: true })).toBeVisible({ timeout: 30_000 })

      // 持久化还原：重载 dashboard 后任务与完成态仍在（IndexedDB 快照）
      await dashboard.reload()
      await expect(dashboard.getByRole('heading', { name: 'Bulk Tasks' })).toBeVisible()
      const alphaRowAfterReload = dashboard.getByRole('row', { name: /E2E alpha/ })
      await expect(alphaRowAfterReload.getByText('Completed', { exact: true })).toBeVisible()
      await expect(alphaRowAfterReload.getByText('3/3 items')).toBeVisible()
      await expect(
        dashboard.getByRole('row', { name: /E2E beta/ }).getByText('Completed', { exact: true })
      ).toBeVisible()

      // 零外网断言：route 层无第三域请求
      expect(blockedExternal).toEqual([])
      expect(externalRequests).toEqual([])
    } finally {
      await context.close()
    }
  })
})
