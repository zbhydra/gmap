/**
 * Online / API 落地页 e2e（015 U1 / 015 U2 CTA 迁移）。
 *
 * 验收口径：5 页可打开（root 路由）；Online 页的开始采集仍是未落地无效按钮
 * （点击后 URL 不变、无网络请求、不埋点）；API 四页的获取 Key 类 CTA 统一
 * 跳 Dashboard API 管理页。
 */
import { expect, test } from '@playwright/test'

import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

/** 5 个落地页路由与页面锚点（data-landing-page 值）。 */
const LANDING_PAGES = [
  { path: '/online-scraper/', id: 'online-scraper', h1: /extraction in the cloud|Scraper/i },
  { path: '/google-maps-scraper-api/', id: 'google-maps-scraper-api', h1: /Scraper API/i },
  { path: '/google-maps-reviews-scraper-api/', id: 'google-maps-reviews-scraper-api', h1: /Reviews Scraper API/i },
  { path: '/google-maps-photos-api/', id: 'google-maps-photos-api', h1: /Photos API/i },
  { path: '/google-maps-scraper-mcp/', id: 'google-maps-scraper-mcp', h1: /MCP Server/i }
]

/** 开始采集创建链路未产品化，只有 Online 页保留无效按钮。 */
const PENDING_CTA_PAGE_ID = 'online-scraper'

test.describe('Online / API Landing Pages', () => {
  test('all five landing pages render with hero, features, FAQ and CTA', async ({ page }) => {
    for (const landing of LANDING_PAGES) {
      const response = await page.goto(landing.path)
      expect(response?.status(), `expected ${landing.path} to be 200`).toBe(200)
      const scope = page.locator(`[data-landing-page="${landing.id}"]`)
      await expect(scope.locator('h1')).toContainText(landing.h1)
      // hero 主 CTA：Online 为无效按钮；API 四页跳 Dashboard API 管理页。
      if (landing.id === PENDING_CTA_PAGE_ID) {
        await expect(scope.locator('button[data-pending-cta]').first()).toBeVisible()
      } else {
        await expect(scope.locator(`a[data-cta="${landing.id}-hero-api-dashboard"]`)).toHaveAttribute('href', /\/dashboard\/api\//)
      }
      await expect(scope.locator(`a[data-cta="${landing.id}-hero-pricing"]`)).toHaveAttribute('href', /\/pricing\//)
      // 能力清单与 FAQ
      await expect(scope.locator('.feature-card').first()).toBeVisible()
      await expect(scope.locator('.faq-item').first()).toBeVisible()
    }
  })

  test('pending feature buttons keep the URL and fire no requests when clicked', async ({ page }) => {
    await page.goto('/online-scraper/')
    const scope = page.locator(`[data-landing-page="${PENDING_CTA_PAGE_ID}"]`)
    const pendingButtons = scope.locator('button[data-pending-cta]')
    // hero 主按钮 + 页底 CTA 按钮，均为无效按钮语义
    await expect(pendingButtons).toHaveCount(2)
    for (let i = 0; i < 2; i += 1) {
      const button = pendingButtons.nth(i)
      await expect(button).toHaveAttribute('aria-disabled', 'true')
      await expect(button).not.toHaveAttribute('onclick')
    }
    const urlBefore = page.url()
    const requests: string[] = []
    const onRequest = (request: { url(): string }) => requests.push(request.url())
    page.on('request', onRequest)
    // aria-disabled 会被 Playwright 视为不可操作，用 force 触发真实 pointer 事件（点击仍应无任何效果）
    await pendingButtons.nth(0).click({ force: true })
    await pendingButtons.nth(1).click({ force: true })
    await page.waitForTimeout(500)
    page.off('request', onRequest)
    // 点击无跳转、无网络请求（含埋点）
    expect(page.url(), 'expected URL unchanged on /online-scraper/').toBe(urlBefore)
    expect(requests, 'expected no requests on /online-scraper/').toEqual([])
  })

  test('API landing CTAs navigate to the Dashboard API management page', async ({ page }) => {
    for (const landing of LANDING_PAGES) {
      if (landing.id === PENDING_CTA_PAGE_ID) {
        continue
      }
      await page.goto(landing.path)
      const scope = page.locator(`[data-landing-page="${landing.id}"]`)
      await expect(scope.locator(`a[data-cta="${landing.id}-hero-api-dashboard"]`)).toHaveAttribute('href', '/dashboard/api/')
      await expect(scope.locator(`a[data-cta="${landing.id}-cta-api-dashboard"]`)).toHaveAttribute('href', '/dashboard/api/')
    }
  })

  test('each landing page exposes FAQPage structured data', async ({ page }) => {
    for (const landing of LANDING_PAGES) {
      await page.goto(landing.path)
      const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
      const faqSchema = schemas
        .map(text => JSON.parse(text) as { '@type'?: string })
        .find(item => item['@type'] === 'FAQPage')
      expect(faqSchema, `expected FAQPage JSON-LD on ${landing.path}`).toBeTruthy()
    }
  })
})
