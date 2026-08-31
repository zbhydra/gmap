/**
 * e2e 全链路用例（016 U3）：面板三态 → 采集（去重/免费截断）→ 导出（18 列）。
 *
 * - 免费路径：fixture 初始 3 条 → Start → loadAll 注入余量 → 去重累计达
 *   freeRowLimit(20) 自动停止 → 完成态（计数 + 免费超限警告条 + Upgrade
 *   占位）→ 导出 CSV → 断言 18 列表头 + 20 数据行 + 末行免费提示 + 文件名；
 * - 手动 Stop：采集中点 Stop → "Manually stopped." → 无警告条 → 导出可走。
 *
 * 复用 U1 harness（扩展 context / route 拦截 / 零外网），面板文案用英文基线
 * 定位（vue-i18n fallback = en-US，与 14 locales 首版英文基线一致）。
 */

import { readFileSync } from 'node:fs'
import { expect, test, type Download, type Page } from '@playwright/test'
import {
  FIXTURE_PATH,
  FIXTURE_TOTAL,
  MAPS_URL,
  launchExtensionContext,
  setupRoutes,
  waitForExtensionServiceWorker
} from './harness'

/** 18 列表头基线（golden-samples/export.csv，与 parser BING_EXPORT_COLUMNS 同源）。 */
const EXPECTED_HEADERS = [
  'ID',
  'Name',
  'Address',
  'Featured image',
  'Bing Maps URL',
  'Latitude',
  'Longitude',
  'Rating',
  'Rating Info',
  'Category',
  'Open Hours',
  'Website',
  'Phone',
  'Emails',
  'Social Medias',
  'Facebook',
  'Instagram',
  'Twitter'
]

/** 免费档单次行数上限（contract scrape.freeRowLimit）。 */
const FREE_ROW_LIMIT = 20

/** 免费档导出末行提示（竞品逐字抄录）。 */
const FREE_LIMIT_NOTE = 'Free accounts can export up to 20 data entries.'

/** 面板根（自建 fixed 容器内的直插面板）。 */
function panel(page: Page) {
  return page.locator('#bing-maps-scraper-panel-host .bing-panel-root')
}

function startButton(page: Page) {
  return panel(page).getByRole('button', { name: 'Start Extraction' })
}

/** 去掉 BOM 并按行拆分（fixture 数据不含引号内换行，行拆分安全）。 */
function csvLines(content: string): string[] {
  return content
    .replace(/^\uFEFF/, '')
    .split('\n')
    .filter(line => line.length > 0)
}

/** 等待下载完成并读出文件文本。 */
async function readDownload(page: Page, trigger: () => Promise<void>): Promise<Download> {
  const downloadPromise = page.waitForEvent('download')
  await trigger()
  return downloadPromise
}

test.describe('Bing 采集 + 导出全链路', () => {
  test.beforeEach(async () => {
    // 完成态收敛依赖 2s 翻页等待 × 若干轮，放宽到与冒烟同级
    test.setTimeout(180_000)
  })

  test('免费路径:Start → 达 20 截断 → 完成态 → CSV 导出 18 列 + 20 行 + 末行提示', async () => {
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await waitForExtensionServiceWorker(context)
      const { fulfilled } = await setupRoutes(context, fixtureHtml)
      await page.goto(`${MAPS_URL}&fixtureInitial=3`)
      await expect(page.locator('[data-entity]')).toHaveCount(3)

      // 待命态:面板出现,列表已检测(首轮检测即刻命中),Start 可用
      const panelRoot = panel(page)
      await expect(panelRoot).toBeVisible()
      await expect(startButton(page)).toBeEnabled({ timeout: 15_000 })

      // Start → 采集中态:加载指示 + 进度文案(免费 "Exporting N...")
      await startButton(page).click()
      await expect(panelRoot.getByText(/^Exporting \d+\.\.\.$/)).toBeVisible()

      // 注入余量条目,采集循环应持续去重累计直至免费上限
      await page.evaluate(() => window.bingFixture.loadAll())
      await expect(page.locator('[data-entity]')).toHaveCount(FIXTURE_TOTAL)

      // 完成态:免费达限自动停止(计数 = 20 + 警告条 + Upgrade 入口)
      await expect(panelRoot.getByText('Search complete.')).toBeVisible({ timeout: 60_000 })
      await expect(panelRoot.getByText('20 businesses found.')).toBeVisible()
      await expect(panelRoot.getByText(FREE_LIMIT_NOTE)).toBeVisible()
      const upgradeButton = panelRoot.getByRole('button', { name: 'Upgrade to Pro Now' })
      await expect(upgradeButton).toBeVisible()

      // Pricing 实体视图（U4 换实）：对比表 + Upgrade 引导；匿名免费账号态
      await upgradeButton.click()
      await expect(panelRoot.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible()
      await expect(panelRoot.getByText('Not signed in (free account)')).toBeVisible()
      await expect(panelRoot.getByRole('button', { name: 'Upgrade Now' })).toBeVisible()
      await panelRoot.getByRole('button', { name: 'Go Back' }).click()
      await expect(panelRoot.getByText('Search complete.')).toBeVisible()

      // Export Leads List 下拉:csv / xlsx 两项
      await panelRoot.getByRole('button', { name: 'Export Leads List' }).click()
      const csvItem = panelRoot.getByRole('menuitem', { name: 'Download data to csv' })
      await expect(panelRoot.getByRole('menuitem', { name: 'Download data to xlsx' })).toBeVisible()

      // 导出并断言下载文件:文件名 / 18 列表头 / 20 数据行 / 末行免费提示
      const download = await readDownload(page, () => csvItem.click())
      expect(download.suggestedFilename()).toMatch(
        new RegExp(`^Bing_Maps_Scraper_${FREE_ROW_LIMIT}_\\d{14}\\.csv$`)
      )
      const lines = csvLines(readFileSync((await download.path()) ?? '', 'utf-8'))
      expect(lines[0].split(',')).toEqual(EXPECTED_HEADERS)
      expect(lines).toHaveLength(1 + FREE_ROW_LIMIT + 1)
      expect(lines[1]).toMatch(/^ypid:YN[0-9A-F]{16},/)
      expect(lines[lines.length - 1]).toBe(FREE_LIMIT_NOTE)

      // Go Back → 回到待命态(Start 重新可用)
      await panelRoot.getByRole('button', { name: 'Go Back' }).click()
      await expect(startButton(page)).toBeVisible()

      // 零外网:放行集只能是 fixture 导航(采集/导出/打点全程不出网)
      for (const url of fulfilled) {
        expect(url.startsWith('https://www.bing.com/maps')).toBe(true)
      }
    } finally {
      await context.close()
    }
  })

  test('手动 Stop:采集中停止 → 完成态无警告条 → 导出已采集部分', async () => {
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      await waitForExtensionServiceWorker(context)
      await setupRoutes(context, fixtureHtml)
      await page.goto(`${MAPS_URL}&fixtureInitial=5`)
      await expect(page.locator('[data-entity]')).toHaveCount(5)

      const panelRoot = panel(page)
      await expect(startButton(page)).toBeEnabled({ timeout: 15_000 })
      await startButton(page).click()
      // 首轮解析完成后(计数 5)即手动停止,抢在 12 轮失败自动完成之前
      await expect(panelRoot.getByText('Exporting 5...')).toBeVisible({ timeout: 15_000 })

      await panelRoot.getByRole('button', { name: 'Stop', exact: true }).click()
      await expect(panelRoot.getByText('Manually stopped.')).toBeVisible()
      await expect(panelRoot.getByText('5 businesses found.')).toBeVisible()
      // 非达限停止:免费超限警告条不出现
      await expect(panelRoot.getByText(FREE_LIMIT_NOTE)).toHaveCount(0)

      // 手动停止路径导出可走(免费档末行提示仍在)
      await panelRoot.getByRole('button', { name: 'Export Leads List' }).click()
      const download = await readDownload(page, () =>
        panelRoot.getByRole('menuitem', { name: 'Download data to csv' }).click()
      )
      expect(download.suggestedFilename()).toMatch(/^Bing_Maps_Scraper_5_\d{14}\.csv$/)
      const lines = csvLines(readFileSync((await download.path()) ?? '', 'utf-8'))
      expect(lines[0].split(',')).toEqual(EXPECTED_HEADERS)
      expect(lines).toHaveLength(1 + 5 + 1)
      expect(lines[lines.length - 1]).toBe(FREE_LIMIT_NOTE)
    } finally {
      await context.close()
    }
  })
})
