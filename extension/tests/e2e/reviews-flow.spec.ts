/**
 * e2e spec：评论采集闭环（013 U3 / A2）。
 *
 * 链路：place 详情页（面板 place 模式）→ options 页设导出格式 JSON →
 * Start Extracting Reviews → window.open 开评论工作页（fid 本地换算
 * placeid + gme_lrd 传递）→ 评论页 content script 自动 fetch GetLocalBoqProxy
 * （route fulfill 构造响应，2 页，达远程下发上限 15 截断）→ 评论页面板完成态
 * 按用户设置格式导出 11 列 JSON（013 簿记 2）→ scrape_reviews_content 埋点
 * 落本地 mock。
 *
 * 诚实标注：评论 RPC 响应 fixture 按 03 号协议文档 §3.2 手工构造（构造样本，
 * 非实录）；route 双 pattern + 其余请求 abort，配合 build:e2e 的 SW 本地 mock，
 * 全程零外网。
 *
 * 运行前提：`pnpm build:e2e`（globalSetup 校验并拉起 mock）。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Page, type Route } from '@playwright/test'

/** 黄金样本已验证的 fid ↔ placeid 配对（换算正确性由单测护航，此处断言 URL）。 */
const FID = '0x89c2597ca044ec9b:0xa0acdb1716592b4d'
const LRD = '0xa0acdb1716592b4d'
const EXPECTED_PLACE_ID = 'ChIJm-xEoHxZwokRTStZFhfbrKA'

const PLACE_URL = `https://www.google.com/maps/place/Gold+coffee/@40.745,-73.978,17z/data=!4m2!3m1!1s${FID}!8m2!3d40.745!4d-73.978`

/** 远程下发上限（mock server config.reviewsPageLimit）。 */
const REMOTE_REVIEWS_LIMIT = 15

/** 构造单条评论的 RPC 条目（下标按 03 逆向 §3.2；构造样本，非实录）。 */
function makeReview(index: number): unknown[] {
  const review: unknown[] = []
  review[1] = 4
  review[2] = ['2 weeks ago', 'en', 1724419200000]
  review[3] = [`Reviewer ${index}`, 'https://lh3.example/avatar.jpg', 'https://maps.example/contrib/1']
  review[4] = [null, 'Aug 1, 2026', 'Reply from owner']
  review[5] = `review_${index}`
  review[11] = index
  review[12] = 'https://search.google.com/local/reviews?placeid=x'
  review[14] = [['https://lh3.example/p/PHOTO=w203-h152']]
  review[27] = `Review body ${index}, with comma.`
  return review
}

/** 构造评论 RPC 响应文本（行 0 XSSI / 行 1 长度 / 行 2 JSON；构造样本，非实录）。 */
function buildReviewsRpcBody(count: number, startIndex: number, token: string | null): string {
  const d: unknown[] = []
  d[1] = []
  ;(d[1] as unknown[])[10] = [
    null, null,
    Array.from({ length: count }, (_, i) => makeReview(startIndex + i)),
    null, null, null, token
  ]
  const json = JSON.stringify(d)
  return [")]}'", String(json.length), json].join('\n')
}

/** place 详情页 fixture：面板挂载点（role=main）即可，Reviews/Photos 区块在面板内。 */
function buildPlaceFixture(): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Gold coffee - Google Maps</title></head>
<body>
<div role="main"><h1>Gold coffee</h1></div>
</body>
</html>`
}

/** 评论工作页 fixture：干净页面（不命中兜底判定），面板由插件挂载。 */
function buildReviewsPageFixture(): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Gold coffee - Reviews - Google Search</title></head>
<body><div id="review-container"></div></body>
</html>`
}

/** 统一网络拦截：place/评论页/评论 RPC fixture + 其余外域 abort（零外网）。 */
async function setupRoutes(context: BrowserContext): Promise<string[]> {
  const blockedExternal: string[] = []
  const rpcCalls: string[] = []

  await context.route(/^https?:\/\//, async (route: Route) => {
    const url = new URL(route.request().url())

    if (url.hostname === '127.0.0.1') {
      await route.fallback()
      return
    }

    if (url.hostname === 'www.google.com' && url.pathname.startsWith('/maps')) {
      await route.fulfill({ contentType: 'text/html; charset=utf-8', body: buildPlaceFixture() })
      return
    }

    if (url.hostname === 'search.google.com' && url.pathname === '/local/reviews') {
      await route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: buildReviewsPageFixture()
      })
      return
    }

    if (url.hostname === 'search.google.com' && url.pathname.endsWith('GetLocalBoqProxy')) {
      rpcCalls.push(url.searchParams.get('reqpld') ?? '')
      // 第 1 页 10 条带 token；第 2 页 10 条——累计 20 达远程上限 15，截断
      const body =
        rpcCalls.length === 1
          ? buildReviewsRpcBody(10, 0, 'e2e-next-token')
          : buildReviewsRpcBody(10, 10, null)
      await route.fulfill({ contentType: 'text/plain; charset=utf-8', body })
      return
    }

    blockedExternal.push(route.request().url())
    await route.abort()
  })

  return blockedExternal
}

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

/** 从 background service worker 取扩展 id（打开 options 设置页需要）。 */
async function getExtensionId(context: BrowserContext): Promise<string> {
  const worker =
    context.serviceWorkers().find(sw => sw.url().startsWith('chrome-extension://')) ??
    (await context.waitForEvent('serviceworker'))
  return new URL(worker.url()).host
}

test.describe('评论采集闭环', () => {
  test('place 页发起 → 评论工作页自动采集 → 达上限截断 → 按设置格式 JSON 导出；零外网', async () => {
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
          if (hostname !== 'www.google.com' && hostname !== 'search.google.com' && hostname !== '127.0.0.1') {
            externalRequests.push(url)
          }
        }
      })

      // 簿记 2：options 页把导出格式设为 JSON（工作页导出消费用户设置格式）
      const extensionId = await getExtensionId(context)
      await page.goto(`chrome-extension://${extensionId}/src/options.html`)
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
      await page.getByRole('radio', { name: 'JSON', exact: true }).click()
      const stored = (await page.evaluate(() =>
        chrome.storage.local.get('maps_user_settings')
      )) as { maps_user_settings?: { exportFormat?: string } }
      expect(stored.maps_user_settings?.exportFormat).toBe('json')

      await page.goto(PLACE_URL)

      // place 模式面板：Reviews & Photos 两个 Start 按钮可见
      const startReviews = page.getByRole('button', { name: 'Start Extracting Reviews' })
      await expect(startReviews).toBeVisible()
      await expect(page.getByRole('button', { name: 'Start Extracting Photos' })).toBeVisible()

      // 点击后：同步 window.open 打开评论工作页（新标签）
      const reviewsPagePromise: Promise<Page> = context.waitForEvent('page')
      await startReviews.click()
      const reviewsPage = await reviewsPagePromise
      await reviewsPage.waitForLoadState()

      // fid 本地换算 + lrd 传递：工作页 URL 断言
      const reviewsUrl = new URL(reviewsPage.url())
      expect(reviewsUrl.hostname).toBe('search.google.com')
      expect(reviewsUrl.pathname).toBe('/local/reviews')
      expect(reviewsUrl.searchParams.get('placeid')).toBe(EXPECTED_PLACE_ID)
      expect(reviewsUrl.searchParams.get('gme_lrd')).toBe(LRD)

      // 评论页面板：自动采集 → 计数增长 → 达上限 15 截断完成 → 导出按钮
      // （后缀随用户设置格式变化）
      const exportButton = reviewsPage.getByRole('button', { name: 'Export Reviews - 15 (.JSON)' })
      await expect(exportButton).toBeVisible({ timeout: 30_000 })

      // 导出：评论 11 列 JSON（键驼峰化，值恒为字符串）
      const [download] = await Promise.all([
        reviewsPage.waitForEvent('download'),
        exportButton.click()
      ])
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-Reviews-.*-15-\d{4}-\d{2}-\d{2}\.json$/
      )
      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const records = JSON.parse(readFileSync(downloadPath as string, 'utf-8')) as Array<
        Record<string, unknown>
      >
      expect(records).toHaveLength(15)
      expect(Object.keys(records[0])).toEqual([
        'author',
        'reviewText',
        'reviewRating',
        'date',
        'photos',
        'likes',
        'ownerAnswer',
        'ownerAnswerDate',
        'authorProfile',
        'authorImage',
        'reviewURL'
      ])
      expect(records[0].author).toBe('Reviewer 0')
      expect(records[14].reviewText).toBe('Review body 14, with comma.')
      // 照片 URL 统一补 =w1000（多 URL 换行连接）
      expect(String(records[0].photos)).toContain('https://lh3.example/p/PHOTO=w1000')

      // place 页区块状态：已发起采集的按钮禁用并切换为采集状态文案
      await expect(page.getByRole('button', { name: 'Collecting in a new tab…' })).toBeDisabled()

      // 零外网断言
      expect(blockedExternal).toEqual([])
      expect(externalRequests).toEqual([])

      // 埋点断言：scrape_reviews_content 落本地 mock（background 写 SLS）
      const mockPort = Number(process.env.E2E_MOCK_PORT ?? 9577)
      const received = (await fetch(`http://127.0.0.1:${mockPort}/__mock/received`).then(response =>
        response.json()
      )) as { slsMarks: Array<Record<string, string>> }
      const markTypes = received.slsMarks.map(mark => mark.mark_type)
      expect(markTypes).toContain('scrape_reviews_content')
      expect(markTypes).toContain('export_results')
    } finally {
      await context.close()
    }
  })

  test('auto_download：评论工作页完成即自动下载，无需点击 Export（013 A9，U11 接线）', async () => {
    test.setTimeout(120_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const blockedExternal = await setupRoutes(context)

      // options 页开启 auto_download（其余保持默认：格式 csv）
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

      // 直接打开评论工作页（URL 携带 gme_lrd 即自治 boot），完成边沿等待自动
      // 下载，全程不点击 Export 按钮
      await page.goto(
        `https://search.google.com/local/reviews?placeid=${EXPECTED_PLACE_ID}&gme_lrd=${LRD}`
      )
      const download = await page.waitForEvent('download', { timeout: 60_000 })
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-Reviews-.*-15-\d{4}-\d{2}-\d{2}\.csv$/
      )
      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const csvText = readFileSync(downloadPath as string, 'utf-8')
      // 评论 11 列 CSV：表头 + 15 行（达远程上限截断）
      expect(csvText.trim().split('\r\n')).toHaveLength(16)

      // 零外网断言
      expect(blockedExternal).toEqual([])
    } finally {
      await context.close()
    }
  })
})
