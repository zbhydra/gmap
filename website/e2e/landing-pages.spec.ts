/**
 * Online / API 落地页 e2e（015 U1）。
 *
 * 验收口径：5 页可打开（root 路由）；页内未落地功能按钮（开始采集 / 获取 Key 类）
 * 点击后 URL 不变、无网络请求、不埋点；无效按钮可聚焦（a11y）。
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

test.describe('Online / API Landing Pages', () => {
  test('all five landing pages render with hero, features, FAQ and CTA', async ({ page }) => {
    for (const landing of LANDING_PAGES) {
      const response = await page.goto(landing.path)
      expect(response?.status(), `expected ${landing.path} to be 200`).toBe(200)
      const scope = page.locator(`[data-landing-page="${landing.id}"]`)
      await expect(scope.locator('h1')).toContainText(landing.h1)
      // hero：无效主按钮 + Pricing 真链接
      await expect(scope.locator('button[data-pending-cta]').first()).toBeVisible()
      await expect(scope.locator(`a[data-cta="${landing.id}-hero-pricing"]`)).toHaveAttribute('href', /\/pricing\//)
      // 能力清单与 FAQ
      await expect(scope.locator('.feature-card').first()).toBeVisible()
      await expect(scope.locator('.faq-item').first()).toBeVisible()
    }
  })

  test('pending feature buttons keep the URL and fire no requests when clicked', async ({ page }) => {
    for (const landing of LANDING_PAGES) {
      await page.goto(landing.path)
      const scope = page.locator(`[data-landing-page="${landing.id}"]`)
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
      expect(page.url(), `expected URL unchanged on ${landing.path}`).toBe(urlBefore)
      expect(requests, `expected no requests on ${landing.path}`).toEqual([])
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
