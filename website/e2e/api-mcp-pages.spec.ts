/**
 * API / MCP 落地页 e2e（W4）：Scraper / Reviews / Photos API 与 MCP 四个路由。
 *
 * 验收口径：页面可打开、H1 正确，定价入口是带 API tab 参数的真链接，输出 FAQPage 结构化数据；
 * Search / Reviews / Photos 获取 Key 直达 Dashboard API 管理页，MCP 连接跳到接入段；
 * 套餐卡免费档进 API 管理页、付费档进 Pricing 的 API tab。代码复制内容跟随所选 tab，
 * Photos 参数、部分交付字段与 MCP 照片工具在各语言中保持一致。
 */
import { expect, test } from '@playwright/test'

import { localePaths } from '../src/i18n/ui'
import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

/**
 * 路由、data-cta 前缀、H1，以及首屏 / 收尾主按钮的 data-cta 后缀与目标。
 * API 三页主按钮是获取 Key；MCP 页主按钮跳接入段（OAuth 优先），取 Key 只在接入段兜底卡里。
 */
const PAGES = [
  { path: '/google-maps-scraper-api/', id: 'google-maps-scraper-api', h1: /Google Maps Scraper API/i, primary: 'api-dashboard', primaryHref: '/dashboard/api/' },
  { path: '/google-maps-reviews-scraper-api/', id: 'google-maps-reviews-scraper-api', h1: /Google Maps Reviews Scraper API/i, primary: 'api-dashboard', primaryHref: '/dashboard/api/' },
  { path: '/google-maps-photos-api/', id: 'google-maps-photos-api', h1: /Google Maps Photos API/i, primary: 'api-dashboard', primaryHref: '/dashboard/api/' },
  { path: '/google-maps-scraper-mcp/', id: 'google-maps-scraper-mcp', h1: /Google Maps Scraper MCP Server/i, primary: 'setup', primaryHref: '#setup' }
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

  test('key and plan CTAs link to Dashboard / Pricing', async ({ page }) => {
    for (const landing of PAGES) {
      await page.goto(landing.path, { waitUntil: 'networkidle' })
      // 首屏 + 收尾 CTA 主按钮
      const keyLinks = page.locator(`main a[data-cta="${landing.id}-hero-${landing.primary}"], main a[data-cta="${landing.id}-cta-${landing.primary}"]`)
      await expect(keyLinks).toHaveCount(2)
      expect(await keyLinks.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual([landing.primaryHref, landing.primaryHref])
      await expect(page.locator('main button[data-capability]')).toHaveCount(0)
      await expect(page.locator('a[href$="/google-maps-photos-api/"].is-unavailable')).toHaveCount(0)
      if (landing.primary === 'setup') {
        // OAuth 不可用的客户端走 API Key 兜底
        await expect(page.locator(`#setup a[data-cta="${landing.id}-setup-api-dashboard"]`)).toHaveAttribute('href', '/dashboard/api/')
      } else {
        // API 三页的套餐卡（五档）绑 scraperApi：免费档进 API 管理页，付费档进 Pricing 的 API tab
        const plans = page.locator(`#pricing a[data-cta^="${landing.id}-plan-"]`)
        await expect(plans).toHaveCount(5)
        const [freeHref, ...paidHrefs] = await plans.evaluateAll(links => links.map(link => link.getAttribute('href')))
        expect(freeHref).toBe('/dashboard/api/')
        for (const href of paidHrefs) expect(href).toMatch(/^\/pricing\/\?product_kind=maps_api&/)
      }
      if (landing.id === 'google-maps-photos-api') {
        await keyLinks.first().click()
        await expect(page).toHaveURL(/\/dashboard\/api\/$/)
      }
    }
  })

  test('console copy button follows the selected request language', async ({ page }) => {
    for (const landing of PAGES.filter(item => item.primary === 'api-dashboard')) {
      await page.goto(landing.path)
      const endpoint = landing.id === 'google-maps-scraper-api' ? 'search' : landing.id === 'google-maps-reviews-scraper-api' ? 'reviews' : 'photos'
      const copy = page.locator('[data-api-copy]')
      await expect(copy).toHaveAttribute('data-copy', new RegExp(`^curl .*\\/api\\/external\\/maps\\/${endpoint}`))
      await page.locator('#api-lang-python').click()
      await expect(copy).toHaveAttribute('data-copy', /^import os\nimport requests/)
      await expect(copy).toHaveAttribute('data-copy', new RegExp(`/${endpoint}"`))
      await page.locator('#api-lang-node').click()
      await expect(copy).toHaveAttribute('data-copy', new RegExp(`const res = await fetch\\(".*/${endpoint}"`))
      if (endpoint === 'photos') await expect(copy).toHaveAttribute('data-copy', /max_results: 2/)
    }
  })

  test('Photos API and MCP expose the photos contract in every locale', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const path of Object.values(localePaths)) {
      const prefix = path ? `/${path}` : ''
      await page.goto(`${prefix}/google-maps-photos-api/`)
      await expect(page.locator('main a[data-cta="google-maps-photos-api-hero-api-dashboard"]')).toHaveAttribute('href', `${prefix}/dashboard/api/`)
      await expect(page.locator('[data-api-copy]')).toHaveAttribute('data-copy', /\/photos[\s\S]*"fid"[\s\S]*"max_results": 2/)
      expect(await page.locator('#reference .api-params .api-name').allTextContents()).toEqual(['fid', 'max_results'])
      await page.locator('#api-group-tab-1').click()
      expect(await page.locator('#api-group-1 .api-name').allTextContents()).toEqual(['returned_count', 'reported_total', 'status', 'reason'])
      await expect(page.locator('#api-group-1')).toContainText('partial')
      await expect(page.locator('main .soon-badge')).toHaveCount(0)
      await page.goto(`${prefix}/google-maps-scraper-mcp/`)
      const tool = page.locator('#tools .mcp-tool').filter({ has: page.locator('.mcp-tool-name', { hasText: 'list_photos' }) })
      await expect(tool).toHaveCount(1)
      await expect(tool.locator('a')).toHaveAttribute('href', `${prefix}/google-maps-photos-api/`)
      await expect(tool.locator('.mcp-tool-args')).toContainText('max_results')
      await expect(page.locator('[data-topo-tool="list_photos"]')).toHaveCount(1)
      await expect(page.locator('main .soon-badge')).toHaveCount(0)
    }
    expect(pageErrors).toEqual([])
  })

  test('MCP setup tabs switch client configs and expose the endpoint', async ({ page }) => {
    await page.goto('/google-maps-scraper-mcp/')
    await expect(page.locator('#mcp-setup-claude')).toBeVisible()
    await expect(page.locator('#mcp-setup-claude [data-copy]')).toHaveAttribute('data-copy', /^claude mcp add --transport http mapsgrab \S*\/mcp\/$/)
    await page.locator('#mcp-setup-tab-cursor').click()
    await expect(page.locator('#mcp-setup-cursor')).toBeVisible()
    await expect(page.locator('#mcp-setup-claude')).toBeHidden()
    await expect(page.locator('#mcp-setup-cursor [data-copy]')).toHaveAttribute('data-copy', /"mcpServers"/)
    await expect(page.locator('.setup-spec [data-copy]')).toHaveAttribute('data-copy', /\/mcp\/$/)
  })
})
