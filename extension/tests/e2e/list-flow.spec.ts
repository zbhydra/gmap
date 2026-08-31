/**
 * e2e spec：A7 列表模式采集闭环（013 U10）。
 *
 * 两种实测 URL 形态各跑一遍完整闭环（A7 实测表，2026-08-30 登录态）：
 * - 聚合页：`data=!4m2!10m1!1e1`，列表容器 = role=main 末子 div；
 * - 深层列表页：`data=!4m6!1m2!10m1!1e1!11m2!2s{token}`，容器结构漂移
 *   （role=main 与列表容器之间多一层包装），由 dom.listContainerDeep 定位。
 *
 * 链路：面板 List Mode → Start → 插件自动逐项点击列表项（每项触发 fixture
 * 回放脚本发详情 XHR）→ injected hook 捕获 → 详情黄金样本（格式 B 裁剪单
 * place）经 route 按项序号替换标识后回放 → 逐项计数增长 → 容器滚动 +500px
 * 触发第二批加载 → 列表末项结束提示 → 完成 → CSV 导出。
 *
 * 诚实标注：深层页容器选择器的包内默认值按「多一层包装」的最优假设给出
 * （fixture 同构验证分流链路），真实 Google 登录态的稳定值须由服务端按实录
 * DOM 远程覆盖（实录校准点，A7 实测未锁定深层结构）。
 *
 * 运行前提：`pnpm build:e2e`（globalSetup 校验并拉起 mock）。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Route } from '@playwright/test'

/** 与 scripts/build-e2e.mjs / global-setup.ts 一致的端口约定。 */
const E2E_MOCK_PORT = Number(process.env.E2E_MOCK_PORT ?? 9577)

/** e2e 构建产物目录（SW 流量已在构建期指向本地 mock）。 */
const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist-e2e')

/** 聚合页实测 URL 形态（A7 实测表第 1 行）。 */
const AGGREGATED_URL =
  'https://www.google.com/maps/@40.745,-73.978,13z/data=!4m2!10m1!1e1?hl=en'

/** 深层列表页实测 URL 形态（A7 实测表第 2 行，带列表 token 段）。 */
const DEEP_URL =
  'https://www.google.com/maps/@40.745,-73.978,13z/data=!4m6!1m2!10m1!1e1!11m2!2sLISTTOKEN!3e1'

const END_MARKER_TEXT = "You've reached the end of the list."

/** 详情黄金样本（格式 B 裁剪单 place；来源与校准标注见单元测试同名用例）。 */
const DETAIL_SAMPLE = readFileSync(
  resolve(process.cwd(), 'tests/fixtures/golden-samples/place-detail-single.txt'),
  'utf-8'
)

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

/**
 * 构造列表页 fixture（聚合页与深层页共用骨架）。
 *
 * DOM 形态对齐 A7 实测：列表容器是 role=main 末子 div（聚合页直接末子；
 * 深层页经 extraWrapper 包装一层，对应 listContainerDeep 假设形态），项 =
 * 容器直接子 div 过滤首尾（首 = 标题位，尾 = 结束提示位）。回放脚本：
 * 列表项点击 → 发详情 XHR；容器滚近底部 → 追加第二批项 + 末项结束提示。
 */
function buildListFixture(options: {
  /** 容器外是否多一层包装（深层页漂移形态）。 */
  extraWrapper: boolean
  /** 首批列表项数。 */
  firstBatch: number
  /** 第二批列表项数（滚动加载）。 */
  secondBatch: number
  /** 第二批项的起始序号。 */
  secondBatchStart: number
}): string {
  const { extraWrapper, firstBatch, secondBatch, secondBatchStart } = options
  const total = secondBatchStart + secondBatch - 1
  const replayScript = `
(function () {
  var container = document.querySelector('.list-container')
  function bindClick(item, index) {
    item.addEventListener('click', function () {
      var xhr = new XMLHttpRequest()
      xhr.open('POST', '/search?tbm=map&item=' + index, true)
      xhr.send(null)
    })
  }
  var items = container.querySelectorAll('.list-item')
  Array.prototype.forEach.call(items, function (item, i) { bindClick(item, i + 1) })
  var loaded = false
  container.addEventListener('scroll', function () {
    if (loaded) return
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
      loaded = true
      var tail = container.querySelector('.list-tail')
      for (var i = ${secondBatchStart}; i <= ${total}; i++) {
        var div = document.createElement('div')
        div.className = 'list-item'
        div.style.height = '120px'
        div.textContent = 'List Place ' + i
        bindClick(div, i)
        container.insertBefore(div, tail)
      }
      tail.textContent = ${JSON.stringify(END_MARKER_TEXT)}
    }
  })
})()`

  const firstItems = Array.from(
    { length: firstBatch },
    (_, i) => '<div class="list-item" style="height:120px">List Place ' + (i + 1) + '</div>'
  ).join('\n')

  const container = `
    <div class="list-container" style="height:420px;overflow-y:auto">
      <div class="list-header" style="height:40px">Saved places</div>
${firstItems}
      <div class="list-tail" style="height:30px"></div>
    </div>`

  const main = extraWrapper
    ? `<div role="main"><div class="deep-wrapper">${container}</div></div>`
    : `<div role="main">${container}</div>`

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Saved places - Google Maps</title></head>
<body>
${main}
<script>${replayScript}</script>
</body>
</html>`
}

/**
 * 详情响应：黄金样本按项序号替换商家名 / Place Id / fid——导出引擎按
 * Place Id 去重（先到先得），标识互异才能让 8 个详情各自保留为一行。
 */
function buildDetailResponse(item: string): string {
  return DETAIL_SAMPLE.replaceAll('Le Cafe Coffee', `List Place ${item}`)
    .replaceAll('ChIJU2cGwuRYwokR1yb7K2YK9WQ', `ChIJSavedPlace${item.padStart(2, '0')}aaaaaaaaa`)
    .replaceAll('0x64f50a662bfb26d7', `0x64f50a662bfb26d${item}`)
}

/** 统一网络拦截：两层列表页 fixture + 详情黄金样本 + 其余外域 abort（零外网）。 */
async function setupRoutes(context: BrowserContext): Promise<string[]> {
  const blockedExternal: string[] = []
  const aggregated = buildListFixture({
    extraWrapper: false,
    firstBatch: 4,
    secondBatch: 4,
    secondBatchStart: 5
  })
  const deep = buildListFixture({
    extraWrapper: true,
    firstBatch: 4,
    secondBatch: 4,
    secondBatchStart: 5
  })

  await context.route(/^https?:\/\//, async (route: Route) => {
    const url = new URL(route.request().url())

    // SW 发起的本地 mock 流量：显式放行直达 mock（零真实外网，见 panel-flow 同款注释）
    if (url.hostname === '127.0.0.1') {
      await route.fallback()
      return
    }

    // Maps 页面按实测 URL 形态分流：深层形态（带列表 token 段）用漂移 DOM
    if (url.hostname === 'www.google.com' && url.pathname.startsWith('/maps')) {
      const body = url.href.includes('11m2!2s') ? deep : aggregated
      await route.fulfill({ contentType: 'text/html; charset=utf-8', body })
      return
    }
    // 详情 RPC（/search?tbm=map&item=N）走黄金样本按序号替换
    if (url.hostname === 'www.google.com' && url.pathname === '/search') {
      await route.fulfill({
        contentType: 'text/plain; charset=utf-8',
        body: buildDetailResponse(url.searchParams.get('item') ?? '1')
      })
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

/**
 * 列表模式闭环断言（两种 URL 形态共用）：面板 List Mode → Start → 逐项
 * 采集计数增长（首批 + 滚动加载第二批 = 8 项）→ 完成 → CSV 导出 8 行。
 */
async function runListFlow(context: BrowserContext, pageUrl: string): Promise<void> {
  const page = context.pages()[0] ?? (await context.newPage())
  const blockedExternal = await setupRoutes(context)

  await page.goto(pageUrl)

  // 列表形态触发：面板出现且带 List Mode 标签（css 穿透 open shadow DOM）
  const panelHost = page.locator('#gmap-extractor-panel-host')
  await expect(panelHost).toHaveCount(1)
  await expect(page.getByText('List Mode')).toBeVisible()
  const startButton = page.getByRole('button', { name: 'Start Extracting' })
  await expect(startButton).toBeVisible()

  // Start → 自动逐项点击 → 首批 4 项计数 → 滚动加载第二批 → 计数 8
  await startButton.click()
  await expect(page.getByText('Extracting 4…')).toBeVisible({ timeout: 60_000 })
  await expect(page.getByText('Extracting 8…')).toBeVisible({ timeout: 60_000 })

  // 末项结束提示 + 可见项全部点击 → 完成态导出按钮
  const exportButton = page.getByRole('button', { name: 'Export Detailed List - 8 (.CSV)' })
  await expect(exportButton).toBeVisible({ timeout: 60_000 })

  // Export → 触发浏览器下载；8 个详情响应逐项入库（各行商家名对应各列表项）
  const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()])
  expect(download.suggestedFilename()).toMatch(
    /^MapsGrab-Extractor-8-My\+Saved\+Places-\d{4}-\d{2}-\d{2}\.csv$/
  )
  const downloadPath = await download.path()
  expect(downloadPath).toBeTruthy()
  const csvText = readFileSync(downloadPath as string, 'utf-8')
  expect(csvText.startsWith(`\uFEFF${EXPECTED_CSV_HEADER_36}\r\n`)).toBe(true)
  for (let i = 1; i <= 8; i++) {
    expect(csvText).toContain(`List Place ${i}`)
  }

  // 零外网断言：route 层除 fixture/样本/本地 mock 外全部被 abort
  expect(blockedExternal).toEqual([])

  // 本地 mock 断言：search 埋点（首个详情 keyword）与 export_results 落地。
  // 打点经 background 异步写 SLS，下载落盘后立即查询存在竞速，轮询等待
  await expect
    .poll(
      async () => {
        const received = await fetch(`http://127.0.0.1:${E2E_MOCK_PORT}/__mock/received`).then(
          response => response.json() as Promise<{ slsMarks: Array<Record<string, string>> }>
        )
        const markTypes = received.slsMarks.map(mark => mark.mark_type)
        return markTypes.includes('search') && markTypes.includes('export_results')
      },
      { timeout: 15_000 }
    )
    .toBe(true)
}

test.describe('A7 列表模式采集闭环', () => {
  test('聚合页形态：data=!4m2!10m1!1e1 触发 → 逐项采集 → 滚动加载 → 导出', async () => {
    test.setTimeout(180_000)
    const context = await launchExtensionContext()
    try {
      await runListFlow(context, AGGREGATED_URL)
    } finally {
      await context.close()
    }
  })

  test('深层列表页形态：data=!4m6!1m2!10m1!1e1!11m2!2s 触发 → 漂移容器同闭环', async () => {
    test.setTimeout(180_000)
    const context = await launchExtensionContext()
    try {
      await runListFlow(context, DEEP_URL)
    } finally {
      await context.close()
    }
  })
})
