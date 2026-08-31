/**
 * e2e spec：批量评论 URL 任务闭环（013 A6，U5；F1 修复复验的链路面）。
 *
 * 链路：dashboard 创建评论 URL 任务（place URL + 每店上限默认 300）→ SW 纯
 * 函数换算 place URL → 评论工作页（fid 本地换算 placeid + gme_lrd + 批量
 * 参数）→ 评论页 content script 自动翻页采集（每页新数据回报 item-progress
 * 重置卡死时钟）→ 到底完成 → 强制自动导出（下载事件）→ 完成回报 → 关页 →
 * 任务完成态；dashboard 重载后状态还原（IndexedDB 持久化）。
 *
 * >90s 卡死/进展时钟语义由 reducer 确定性时间单测覆盖（bulk-scheduler.spec
 * 「进展回报重置卡死时钟」组），e2e 不等待真实 90s。
 *
 * fixture 复用 U3 评论 spec 模式：评论工作页 + GetLocalBoqProxy RPC（构造
 * 样本，2 页 10+4 条，第 2 页不足一页判定到底）；其余外域 abort + build:e2e
 * 的 SW 本地 mock，零外网。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Page, type Route } from '@playwright/test'

/** 黄金样本已验证的 fid ↔ placeid 配对。 */
const FID = '0x89c2597ca044ec9b:0xa0acdb1716592b4d'
const LRD = '0xa0acdb1716592b4d'
const EXPECTED_PLACE_ID = 'ChIJm-xEoHxZwokRTStZFhfbrKA'

const PLACE_URL = `https://www.google.com/maps/place/Gold+coffee/@40.745,-73.978,17z/data=!4m2!3m1!1s${FID}!8m2!3d40.745!4d-73.978`

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

/** 构造评论 RPC 响应文本（行 0 XSSI / 行 1 长度 / 行 2 JSON）。 */
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

/** 评论工作页 fixture：干净页面（不命中兜底判定），面板由插件挂载。 */
function buildReviewsPageFixture(): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Gold coffee - Reviews - Google Search</title></head>
<body><div id="review-container"></div></body>
</html>`
}

/** 统一网络拦截：评论工作页 + 评论 RPC fixture + 其余外域 abort（零外网）。 */
async function setupRoutes(context: BrowserContext): Promise<string[]> {
  const blockedExternal: string[] = []
  const rpcCalls: string[] = []

  await context.route(/^https?:\/\//, async (route: Route) => {
    const url = new URL(route.request().url())

    if (url.hostname === '127.0.0.1') {
      await route.fallback()
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
      // 第 1 页 10 条带 token；第 2 页 4 条不足一页 → 到底完成（共 14 条）
      const body =
        rpcCalls.length === 1
          ? buildReviewsRpcBody(10, 0, 'e2e-next-token')
          : buildReviewsRpcBody(4, 10, null)
      await route.fulfill({ contentType: 'text/plain; charset=utf-8', body })
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

/** 从 background service worker 取扩展 id。 */
async function getExtensionId(context: BrowserContext): Promise<string> {
  const worker =
    context.serviceWorkers().find(sw => sw.url().startsWith('chrome-extension://')) ??
    (await context.waitForEvent('serviceworker'))
  return new URL(worker.url()).host
}

test.describe('批量评论 URL 任务闭环', () => {
  test('创建 → SW 换算 place URL → 评论工作页自动采集 → 自动导出 → 完成态 → 持久化还原；零外网', async () => {
    test.setTimeout(120_000)
    const context = await launchExtensionContext()
    const dashboard = context.pages()[0] ?? (await context.newPage())

    try {
      const blockedExternal = await setupRoutes(context)

      const externalRequests: string[] = []
      context.on('request', request => {
        const url = request.url()
        if (url.startsWith('http')) {
          const { hostname } = new URL(url)
          if (hostname !== 'search.google.com' && hostname !== '127.0.0.1') {
            externalRequests.push(url)
          }
        }
      })

      const extensionId = await getExtensionId(context)
      await dashboard.goto(`chrome-extension://${extensionId}/src/dashboard.html`)
      await expect(dashboard.getByRole('heading', { name: 'Bulk Tasks' })).toBeVisible()

      // 切换任务类型为 Review URLs，填入 place URL（默认每店上限 300）
      await dashboard.getByRole('radio', { name: 'Review URLs' }).click()
      await dashboard.getByLabel('Task Name').fill('E2E reviews')
      await dashboard.getByLabel('Review URLs').fill(PLACE_URL)

      const workTabPromise: Promise<Page> = context.waitForEvent('page')
      await dashboard.getByRole('button', { name: 'Start Extracting' }).click()

      // SW 先开 bulk-launch 中转页，渲染进程跳转到评论工作页
      const workTab = await workTabPromise
      await workTab.waitForURL(
        url => url.hostname === 'search.google.com' && url.pathname === '/local/reviews',
        { timeout: 30_000 }
      )

      const workUrl = new URL(workTab.url())
      expect(workUrl.searchParams.get('placeid')).toBe(EXPECTED_PLACE_ID)
      expect(workUrl.searchParams.get('gme_lrd')).toBe(LRD)
      expect(workUrl.searchParams.get('gme_bulk')).toBe('1')
      expect(workUrl.searchParams.get('gme_bulk_task')).toBeTruthy()
      expect(Number(workUrl.searchParams.get('gme_bulk_item'))).toBe(0)
      expect(Number(workUrl.searchParams.get('gme_bulk_max'))).toBe(300)

      // 自动采集（每页回报 item-progress）→ 到底完成 → 强制自动导出
      const download = await workTab.waitForEvent('download', { timeout: 60_000 })
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-Reviews-.*-14-\d{4}-\d{2}-\d{2}\.csv$/
      )

      // 完成回报 → 任务完成态（dashboard 实时刷新）
      const alphaRow = dashboard.getByRole('row', { name: /E2E reviews/ })
      await expect(alphaRow.getByText('Completed', { exact: true })).toBeVisible({
        timeout: 30_000
      })
      await expect(alphaRow.getByText('1/1 items')).toBeVisible()

      // 持久化还原：重载 dashboard 后完成态仍在（IndexedDB 快照）
      await dashboard.reload()
      await expect(dashboard.getByRole('heading', { name: 'Bulk Tasks' })).toBeVisible()
      await expect(
        dashboard
          .getByRole('row', { name: /E2E reviews/ })
          .getByText('Completed', { exact: true })
      ).toBeVisible()

      // 零外网断言：route 层除 fixture/mock 外全部被 abort
      expect(blockedExternal).toEqual([])
      expect(externalRequests).toEqual([])
    } finally {
      await context.close()
    }
  })
})
