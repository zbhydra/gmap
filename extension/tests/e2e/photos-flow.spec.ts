/**
 * e2e spec：照片采集闭环（013 U3 / A3）。
 *
 * 链路：place 详情页 → Start Extracting Photos → window.open 开照片工作页
 * （maps/uv?pb=!1s{fid}&_ps_=1 + lkt + gme_lrd）→ 从页面 WIZ_global_data 抠
 * SNlM0e → POST batchexecute(wTe8We)（route fulfill 构造响应：第 1 批含
 * streetview 项过滤、第 2 批 end 到底，过滤后 12 张达远程上限）→ 照片页面板
 * 导出 URL 列表 CSV。
 *
 * 诚实标注：照片 RPC 响应 fixture 按 03 号协议文档 §3.3 手工构造（构造样本，
 * 非实录）；route 双 pattern + SW 流量指本地 mock，全程零外网。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, expect, test, type BrowserContext, type Page, type Route } from '@playwright/test'

const FID = '0x89c2597ca044ec9b:0xa0acdb1716592b4d'
const LRD = '0xa0acdb1716592b4d'
const PLACE_URL = `https://www.google.com/maps/place/Gold+coffee/@40.745,-73.978,17z/data=!4m2!3m1!1s${FID}!8m2!3d40.745!4d-73.978`

const AT_TOKEN = 'AT-e2e-snlm0e-token'

/** 构造照片项（对象带 photoUrl/videoUrl 键；构造样本，非实录）。 */
function makePhoto(id: string): Record<string, string> {
  return { photoUrl: `https://lh3.example/uv/p/${id}=w800-h600` }
}

/** 构造 batchexecute 响应（格式 B 包裹：尾哨兵 + d + XSSI；构造样本，非实录）。 */
function buildPhotosRpcBody(entries: Array<Record<string, string>>, next: string | null, end: boolean): string {
  const payload: unknown[] = new Array(12)
  payload[0] = entries
  payload[10] = end
  payload[11] = next
  const chunk = ['wTe8We', JSON.stringify(payload), null, 'generic']
  const inner = [")]}'", JSON.stringify([chunk])].join('\n')
  return `${JSON.stringify({ c: 3, d: inner })}/*""*/`
}

function buildPlaceFixture(): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Gold coffee - Google Maps</title></head>
<body>
<div role="main"><h1>Gold coffee</h1></div>
</body>
</html>`
}

/** 照片工作页 fixture：内嵌 WIZ_global_data（SNlM0e 明文，03 逆向 §3.3 形态）。 */
function buildPhotosPageFixture(): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Gold coffee - Photos</title>
<script>window.WIZ_global_data = {"SNlM0e": "${AT_TOKEN}"}; window.IJ_values = [];</script>
</head>
<body><div id="photos-gallery"></div></body>
</html>`
}

async function setupRoutes(context: BrowserContext): Promise<string[]> {
  const blockedExternal: string[] = []
  const rpcRequests: Array<{ url: URL; body: string }> = []

  await context.route(/^https?:\/\//, async (route: Route) => {
    const url = new URL(route.request().url())

    if (url.hostname === '127.0.0.1') {
      await route.fallback()
      return
    }

    if (url.hostname === 'www.google.com' && url.pathname === '/maps/uv') {
      await route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: buildPhotosPageFixture()
      })
      return
    }

    if (url.hostname === 'www.google.com' && url.pathname.startsWith('/maps')) {
      await route.fulfill({ contentType: 'text/html; charset=utf-8', body: buildPlaceFixture() })
      return
    }

    if (url.hostname === 'www.google.com' && url.pathname.endsWith('/batchexecute')) {
      const body = String(route.request().postData() ?? '')
      rpcRequests.push({ url, body })
      // 第 1 批：10 张有效 + 2 张 streetview（过滤），带 token 翻页；
      // 第 2 批：2 张有效 + end——过滤后 12 张达远程上限 12，截断完成
      const batch1 = [
        ...Array.from({ length: 10 }, (_, i) => makePhoto(`A${i}`)),
        { photoUrl: 'https://www.google.com/maps/uv/streetview/X' },
        { photoUrl: 'https://www.google.com/maps/streetview/Y' }
      ]
      const batch2 = [makePhoto('B0'), makePhoto('B1')]
      const rpcBody =
        rpcRequests.length === 1
          ? buildPhotosRpcBody(batch1, 'e2e-photo-token', false)
          : buildPhotosRpcBody(batch2, null, true)
      await route.fulfill({ contentType: 'text/plain; charset=utf-8', body: rpcBody })
      return
    }

    blockedExternal.push(route.request().url())
    await route.abort()
  })

  return { blockedExternal, rpcRequests } as { blockedExternal: string[]; rpcRequests: Array<{ url: URL; body: string }> }
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

test.describe('照片采集闭环', () => {
  test('place 页发起 → uv 页抠 SNlM0e → batchexecute 翻页过滤 → URL 列表 CSV 导出；零外网', async () => {
    test.setTimeout(120_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const { blockedExternal, rpcRequests } = (await setupRoutes(context)) as {
        blockedExternal: string[]
        rpcRequests: Array<{ url: URL; body: string }>
      }

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

      await page.goto(PLACE_URL)
      const startPhotos = page.getByRole('button', { name: 'Start Extracting Photos' })
      await expect(startPhotos).toBeVisible()

      // 点击后：同步 window.open 打开照片工作页（新标签）
      const photosPagePromise: Promise<Page> = context.waitForEvent('page')
      await startPhotos.click()
      const photosPage = await photosPagePromise
      await photosPage.waitForLoadState()

      // 工作页 URL：fid 传入 pb 参数 + lkt 激活标记 + gme_lrd 传递
      const photosUrl = new URL(photosPage.url())
      expect(photosUrl.hostname).toBe('www.google.com')
      expect(photosUrl.pathname).toBe('/maps/uv')
      expect(photosUrl.searchParams.get('pb')).toBe(`!1s${FID}`)
      expect(photosUrl.searchParams.get('lkt')).toBe('LocalPoiPhotos')
      expect(photosUrl.searchParams.get('gme_lrd')).toBe(LRD)

      // 照片页面板：采集 → 达远程上限 12 截断完成 → 导出
      const exportButton = photosPage.getByRole('button', { name: 'Export Photos - 12 (.CSV)' })
      await expect(exportButton).toBeVisible({ timeout: 30_000 })

      const [download] = await Promise.all([
        photosPage.waitForEvent('download'),
        exportButton.click()
      ])
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-Photos-.*-12-\d{4}-\d{2}-\d{2}\.csv$/
      )
      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const csvText = readFileSync(downloadPath as string, 'utf-8')
      // 表头 + 12 行 URL；streetview 项被过滤
      expect(csvText.startsWith('\uFEFFPhoto URL\r\n')).toBe(true)
      expect(csvText).toContain('https://lh3.example/uv/p/A0=w800-h600')
      expect(csvText).toContain('https://lh3.example/uv/p/B1=w800-h600')
      expect(csvText).not.toContain('streetview')
      expect(csvText.trim().split('\r\n')).toHaveLength(13)

      // 协议断言：rpcids、_reqid 页码后缀、AT token 与固定常量
      expect(rpcRequests).toHaveLength(2)
      expect(rpcRequests[0]?.url.searchParams.get('rpcids')).toBe('wTe8We')
      expect(rpcRequests[0]?.url.searchParams.get('_reqid')).toBe('172138')
      expect(rpcRequests[1]?.url.searchParams.get('_reqid')).toBe('272138')
      const firstBody = decodeURIComponent(rpcRequests[0]?.body ?? '')
      expect(firstBody).toContain(AT_TOKEN)
      expect(firstBody).toContain('wTe8We')
      expect(firstBody).toContain('LU_PHOTO_GALLERY')
      expect(firstBody).toContain('CgIgAQ==')
      expect(firstBody).toContain(LRD)

      // 零外网断言
      expect(blockedExternal).toEqual([])
      expect(externalRequests).toEqual([])
    } finally {
      await context.close()
    }
  })

  test('auto_download：照片工作页完成即自动下载，无需点击 Export（013 A9，U11 接线）', async () => {
    test.setTimeout(120_000)
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const { blockedExternal } = (await setupRoutes(context)) as {
        blockedExternal: string[]
        rpcRequests: Array<{ url: URL; body: string }>
      }

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

      // 直接打开照片工作页（URL 携带 gme_lrd 即自治 boot），完成边沿等待自动
      // 下载，全程不点击 Export 按钮
      await page.goto(
        `https://www.google.com/maps/uv?pb=!1s${FID}&lkt=LocalPoiPhotos&gme_lrd=${LRD}`
      )
      const download = await page.waitForEvent('download', { timeout: 60_000 })
      expect(download.suggestedFilename()).toMatch(
        /^MapsGrab-Extractor-Photos-.*-12-\d{4}-\d{2}-\d{2}\.csv$/
      )
      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const csvText = readFileSync(downloadPath as string, 'utf-8')
      // 表头 + 12 行 URL（streetview 已过滤）
      expect(csvText.trim().split('\r\n')).toHaveLength(13)

      // 零外网断言
      expect(blockedExternal).toEqual([])
    } finally {
      await context.close()
    }
  })
})
