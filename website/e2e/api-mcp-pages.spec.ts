/**
 * API / MCP 落地页 e2e（W4）：Scraper / Reviews / Photos API 与 MCP 四个路由。
 *
 * 验收口径：页面可打开、H1 正确，定价入口是带 API tab 参数的真链接，输出 FAQPage 结构化数据；
 * 获取 Key 与 API 套餐入口受 lib/capabilities.ts 控制：Scraper / Reviews API 与 MCP 已开放，获取 Key 直达
 * Dashboard API 管理页，套餐卡免费档进 API 管理页、付费档进 Pricing 的 API tab；Photos 未交付，其获取 Key
 * 渲染为 aria-disabled 按钮（无 href、无埋点属性，点击 / 回车 / 空格都不跳转、不发请求）；
 * 代码台与接入配置的复制内容跟随所选 tab。
 */
import { expect, test, type Request } from '@playwright/test'

import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

/** 点击后不应出现的请求类型（接口调用、埋点信标、长连接）。 */
const ACTION_REQUEST_TYPES = new Set(['fetch', 'xhr', 'ping', 'eventsource', 'websocket'])
/**
 * 与按钮无关的后台请求：Vite dev server 的 HMR / 依赖预构建通道（构建产物里不存在），
 * 以及站级首次访问打点（ensureDeviceId 完成后异步发出，可能落在交互窗口内）。
 */
const BACKGROUND_REQUEST = /\/(@vite|@id|@fs)\/|__vite_ping|\/node_modules\/\.vite\/|\/api\/client\/mark\/record/

/** 路由、data-cta 前缀、H1、控制获取 Key 按钮的能力键及其当前是否开放。 */
const PAGES = [
  { path: '/google-maps-scraper-api/', id: 'google-maps-scraper-api', h1: /Google Maps Scraper API/i, capability: 'scraperApi', keyOpen: true },
  { path: '/google-maps-reviews-scraper-api/', id: 'google-maps-reviews-scraper-api', h1: /Google Maps Reviews Scraper API/i, capability: 'scraperApi', keyOpen: true },
  { path: '/google-maps-photos-api/', id: 'google-maps-photos-api', h1: /Google Maps Photos API/i, capability: 'photosApi', keyOpen: false },
  { path: '/google-maps-scraper-mcp/', id: 'google-maps-scraper-mcp', h1: /Google Maps Scraper MCP Server/i, capability: 'mcp', keyOpen: true }
]

test.describe('API / MCP Landing Pages', () => {
  test('pages render with hero, pricing link and FAQPage structured data', async ({ page }) => {
    for (const landing of PAGES) {
      const response = await page.goto(landing.path)
      expect(response?.status(), `expected ${landing.path} to be 200`).toBe(200)
      await expect(page.locator('main h1')).toContainText(landing.h1)
      await expect(page.locator(`a[data-cta="${landing.id}-hero-pricing"]`)).toHaveAttribute('href', /\/pricing\/\?product_kind=maps_api&/)
      const faqCount = await page.locator('#faq details.acc').count()
      expect(faqCount, `expected FAQ items on ${landing.path}`).toBeGreaterThan(0)
      const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
      const faqSchema = schemas
        .map(text => JSON.parse(text) as { '@type'?: string; mainEntity?: { '@type'?: string }[] })
        .find(item => item['@type'] === 'FAQPage')
      expect(faqSchema?.mainEntity, `expected FAQPage JSON-LD on ${landing.path}`).toHaveLength(faqCount)
    }
  })

  test('open key and plan CTAs link to Dashboard / Pricing, unavailable ones are inert buttons', async ({ page }) => {
    for (const landing of PAGES) {
      await page.goto(landing.path, { waitUntil: 'networkidle' })
      // 首屏获取 Key + 收尾 CTA 获取 Key
      const keyLinks = page.locator(`main a[data-cta="${landing.id}-hero-api-dashboard"], main a[data-cta="${landing.id}-cta-api-dashboard"]`)
      const keyButtons = page.locator(`main button[data-capability="${landing.capability}"]`)
      if (landing.keyOpen) {
        await expect(keyLinks).toHaveCount(2)
        expect(await keyLinks.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(['/dashboard/api/', '/dashboard/api/'])
        await expect(keyButtons).toHaveCount(0)
      } else {
        await expect(keyLinks).toHaveCount(0)
        expect(await keyButtons.count(), `expected grayed key CTAs on ${landing.path}`).toBeGreaterThanOrEqual(2)
      }
      if (landing.capability !== 'mcp') {
        // API 三页的套餐卡（五档）绑 scraperApi：免费档进 API 管理页，付费档进 Pricing 的 API tab
        const plans = page.locator(`#pricing a[data-cta^="${landing.id}-plan-"]`)
        await expect(plans).toHaveCount(5)
        const [freeHref, ...paidHrefs] = await plans.evaluateAll(links => links.map(link => link.getAttribute('href')))
        expect(freeHref).toBe('/dashboard/api/')
        for (const href of paidHrefs) expect(href).toMatch(/^\/pricing\/\?product_kind=maps_api&/)
      }
      const inert = page.locator('main button[data-capability]')
      const urlBefore = page.url()
      // 只记跳转与数据 / 埋点类请求；浏览器自行补取的 favicon 等静态资源与后台请求都和按钮无关。
      const requests: string[] = []
      const onRequest = (request: Request) => {
        if (BACKGROUND_REQUEST.test(request.url())) return
        if (request.isNavigationRequest() || ACTION_REQUEST_TYPES.has(request.resourceType())) requests.push(request.url())
      }
      page.on('request', onRequest)
      for (let i = 0; i < (await inert.count()); i += 1) {
        const button = inert.nth(i)
        await expect(button).toHaveAttribute('aria-disabled', 'true')
        await expect(button).not.toHaveAttribute('href')
        await expect(button).not.toHaveAttribute('data-cta')
        // aria-disabled 会被 Playwright 视为不可操作，用 force 触发真实 pointer 事件（点击仍应无任何效果）
        await button.click({ force: true })
        await button.focus()
        await page.keyboard.press('Enter')
        await page.keyboard.press('Space')
      }
      // 事件循环同步点（不是固定等待）：最后一次按键排进页面的同步、微任务与 0 延时任务都跑完后再停止记录请求
      await page.evaluate(() => new Promise<void>(resolve => setTimeout(() => resolve())))
      page.off('request', onRequest)
      expect(page.url(), `expected URL unchanged on ${landing.path}`).toBe(urlBefore)
      expect(requests, `expected no requests on ${landing.path}`).toEqual([])
    }
  })

  test('console copy button follows the selected request language', async ({ page }) => {
    await page.goto('/google-maps-scraper-api/')
    const copy = page.locator('[data-api-copy]')
    await expect(copy).toHaveAttribute('data-copy', /^curl .*\/api\/client\/maps\/api\/search/)
    await page.locator('#api-lang-python').click()
    await expect(copy).toHaveAttribute('data-copy', /^import os\nimport requests/)
    await page.locator('#api-lang-node').click()
    await expect(copy).toHaveAttribute('data-copy', /const res = await fetch\(".*\/search"/)
  })

  test('MCP setup tabs switch client configs and expose the endpoint', async ({ page }) => {
    await page.goto('/google-maps-scraper-mcp/')
    await expect(page.locator('#mcp-setup-claude')).toBeVisible()
    await expect(page.locator('#mcp-setup-claude [data-copy]')).toHaveAttribute('data-copy', /^claude mcp add --transport http mapsgrab .*\/mcp\//)
    await page.locator('#mcp-setup-tab-cursor').click()
    await expect(page.locator('#mcp-setup-cursor')).toBeVisible()
    await expect(page.locator('#mcp-setup-claude')).toBeHidden()
    await expect(page.locator('#mcp-setup-cursor [data-copy]')).toHaveAttribute('data-copy', /"mcpServers"/)
    await expect(page.locator('.setup-spec [data-copy]')).toHaveAttribute('data-copy', /\/mcp\/$/)
  })
})
