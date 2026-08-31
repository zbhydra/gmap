/**
 * 网站 e2e（W2/W3 交付版）。
 *
 * mock 跑：PUBLIC_API_BASE_URL 指向假地址，本 spec 只断言 SSG 页面渲染、
 * 首页五要素、产品页/下载页结构、法务页可达与 data-cta 归因属性。
 * 购买链路 / 登录态相关交互在 W5 接入时按真实场景补充。
 */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

test.describe('Website Shell', () => {
  test('primary nav exposes home, extension, online, API, download and pricing entries', async ({ page, isMobile }) => {
    await page.goto('/')
    // 960px 断点以下桌面导航隐藏，改断言移动端菜单
    const scope = isMobile ? page.locator('.mobile-nav') : page.locator('.nav-links')
    await expect(scope.locator('a').filter({ hasText: 'Home' })).toBeVisible()
    await expect(scope.locator('a').filter({ hasText: 'Extension' })).toBeVisible()
    // Online 真链接（015 U1）：指向落地页
    const onlineEntry = scope.locator('a[data-cta="nav-online"]')
    await expect(onlineEntry).toBeVisible()
    await expect(onlineEntry).toHaveAttribute('href', '/online-scraper/')
    await expect(scope.locator('a').filter({ hasText: 'Download' })).toBeVisible()
    await expect(scope.locator('a').filter({ hasText: 'Pricing' })).toBeVisible()
    if (isMobile) {
      // 移动端：API 四子项平铺
      await page.locator('.mobile-menu-btn').click()
      await expect(scope.locator('a[data-cta="nav-api-scraper"]')).toBeVisible()
      await expect(scope.locator('a[data-cta="nav-api-reviews"]')).toBeVisible()
      await expect(scope.locator('a[data-cta="nav-api-photos"]')).toBeVisible()
      await expect(scope.locator('a[data-cta="nav-api-mcp"]')).toBeVisible()
    } else {
      // 桌面端：API 下拉（复用语言切换下拉模式）
      await expect(scope.locator('.nav-api-switcher .lang-btn')).toBeVisible()
      await expect(scope.locator('.nav-api-switcher .lang-option')).toHaveCount(4)
    }
  })

  test('desktop API dropdown expands and navigates to a landing page', async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0
    test.skip(width <= 960, '桌面下拉，仅桌面断点验证')
    await page.goto('/')
    const apiBtn = page.locator('.nav-api-switcher .lang-btn')
    const dropdown = page.locator('.nav-api-switcher .lang-dropdown')
    await expect(dropdown).not.toHaveClass(/show/)
    await apiBtn.click()
    await expect(dropdown).toHaveClass(/show/)
    await dropdown.locator('a[data-cta="nav-api-scraper"]').click()
    await expect(page).toHaveURL(/\/google-maps-scraper-api\//)
  })

  test('nav Online entry leads to the online scraper landing page', async ({ page, isMobile }) => {
    await page.goto('/')
    const scope = isMobile ? page.locator('.mobile-nav') : page.locator('.nav-links')
    if (isMobile) {
      await page.locator('.mobile-menu-btn').click()
    }
    await scope.locator('a[data-cta="nav-online"]').click()
    await expect(page).toHaveURL(/\/online-scraper\//)
  })

  test('nav install CTA leads to the download page with attribution attributes', async ({ page, isMobile }) => {
    test.skip(isMobile, '安装按钮在移动端断点隐藏，桌面验证即可')
    await page.goto('/')
    const installLink = page.locator('.nav-install-link')
    await expect(installLink).toHaveAttribute('href', /\/download\//)
    await expect(installLink).toHaveAttribute('data-cta', 'nav-install')
    await installLink.click()
    await expect(page).toHaveURL(/\/download\//)
  })

  test('footer exposes product, company and legal links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('.footer-link-groups')
    await expect(footer.locator('a[href="/extension/"]')).toBeVisible()
    await expect(footer.locator('a[href="/download/"]')).toBeVisible()
    await expect(footer.locator('a[href="/about/"]')).toBeVisible()
    await expect(footer.locator('a[href="/contact/"]')).toBeVisible()
    await expect(footer.locator('a[href="/terms/"]')).toBeVisible()
    await expect(footer.locator('a[href="/privacy/"]')).toBeVisible()
  })

  test('language switcher renders with the single EN baseline locale', async ({ page, isMobile }) => {
    test.skip(isMobile, '语言切换器在移动端断点隐藏，桌面验证即可')
    await page.goto('/')
    // 导航 API 下拉复用 .lang-btn/.lang-dropdown 类名，断言作用域限定在 nav-actions 的语言切换器
    const switcher = page.locator('.nav-actions .lang-switcher')
    await expect(switcher.locator('.lang-btn')).toContainText('English')
    await switcher.locator('.lang-btn').click()
    await expect(switcher.locator('.lang-dropdown')).toHaveClass(/show/)
    await expect(switcher.locator('.lang-option')).toHaveCount(1)
  })
})

test.describe('Home Page', () => {
  test('renders the five required elements', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/MapsGrab/)
    // ① hero：H1 一句话 + 双 CTA
    await expect(page.locator('h1')).toContainText('Grab Google Maps business data')
    const hero = page.locator('[data-home-page] .hero')
    await expect(hero.locator('a[data-cta="home-hero-install"]')).toBeVisible()
    await expect(hero.locator('a[data-cta="home-hero-product"]')).toBeVisible()
    // ② 三产品卡
    await expect(page.locator('[data-product-card="extension"]')).toBeVisible()
    await expect(page.locator('[data-product-card="online"]')).toBeVisible()
    await expect(page.locator('[data-product-card="api"]')).toBeVisible()
    // ③ 社证占位区
    await expect(page.locator('.testimonials .testimonial-card')).toHaveCount(3)
    // ④ FAQ
    await expect(page.locator('.faq-item')).toHaveCount(6)
    // ⑤ CTA
    await expect(page.locator('a[data-cta="home-band-install"]')).toBeVisible()
  })

  test('hero CTA links to the download page with utm attribution', async ({ page }) => {
    await page.goto('/')
    const heroInstall = page.locator('a[data-cta="home-hero-install"]')
    const href = await heroInstall.getAttribute('href')
    expect(href).toContain('/download/')
    expect(href).toContain('utm_source=website')
    expect(href).toContain('utm_medium=home-hero')
  })

  test('online and api product cards link to their landing pages', async ({ page }) => {
    await page.goto('/')
    const expectations: Array<[string, RegExp]> = [
      ['online', /\/online-scraper\//],
      ['api', /\/google-maps-scraper-api\//]
    ]
    for (const [cardId, urlPattern] of expectations) {
      const cardLink = page.locator(`[data-product-card="${cardId}"] a.product-link`)
      await expect(cardLink).toBeVisible()
      await expect(cardLink).toHaveAttribute('href', urlPattern)
      await cardLink.click()
      await expect(page).toHaveURL(urlPattern)
      await page.goBack()
    }
  })

  test('extension product card links to the product page', async ({ page }) => {
    await page.goto('/')
    const cardLink = page.locator('[data-product-card="extension"] a.product-link')
    await expect(cardLink).toHaveAttribute('href', /\/extension\//)
    await cardLink.click()
    await expect(page).toHaveURL(/\/extension\//)
  })

  test('faq exposes FAQPage structured data matching the visible questions', async ({ page }) => {
    await page.goto('/')
    const firstQuestion = await page.locator('.faq-item summary').first().textContent()
    expect(firstQuestion?.trim()).toBeTruthy()
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents()
    const faqSchema = schema.map(text => JSON.parse(text) as { '@type'?: string }).find(
      item => item['@type'] === 'FAQPage'
    )
    expect(faqSchema, 'expected FAQPage JSON-LD on home').toBeTruthy()
  })
})

test.describe('Extension Product Page', () => {
  test('renders hero, feature groups, version notes and install guide', async ({ page }) => {
    const response = await page.goto('/extension/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText('Google Maps extractor')
    // 功能清单覆盖 A5 口径的六个功能组
    const featureTitles = ['Business data', 'Reviews', 'Photos', 'Email & social media enrichment', 'Batch tasks', 'Export']
    for (const title of featureTitles) {
      await expect(page.locator('.feature-card h3').filter({ hasText: title })).toBeVisible()
    }
    // 版本说明段（承接 changelog 职能）
    await expect(page.locator('[data-release="0.1.0 (pre-release)"]')).toBeVisible()
    // 安装引导
    await expect(page.locator('.install-steps .install-step')).toHaveCount(3)
  })

  test('carries data-cta attribution on install CTAs', async ({ page }) => {
    await page.goto('/extension/')
    await expect(page.locator('a[data-cta="extension-hero-install"]')).toBeVisible()
    await expect(page.locator('a[data-cta="extension-install-download"]')).toBeVisible()
    await expect(page.locator('a[data-cta="extension-band-install"]')).toBeVisible()
  })

  test('renders media-rich sections with placeholder slots (015 D5 图文改造)', async ({ page }) => {
    await page.goto('/extension/')
    // hero 右侧配图位 + showcase 双图位 + demo 视频位 + 安装三步配图位 = 7 个占位槽
    await expect(page.locator('[data-media-slot]')).toHaveCount(7)
    // showcase：插件面板位 + 导出文件位 + 示例数据下载占位（点击不 404）
    await expect(page.locator('.showcase [data-media-slot="browser"]')).toBeVisible()
    await expect(page.locator('.showcase [data-media-slot="file"]')).toBeVisible()
    const demoData = page.locator('a[data-cta="extension-demo-data"]')
    await expect(demoData).toBeVisible()
    await expect(demoData).toHaveAttribute('href', '#')
    // demo 视频占位区在版本说明段之前
    await expect(page.locator('.demo [data-media-slot]')).toBeVisible()
    // 每个安装步骤都带配图位
    await expect(page.locator('.install-step [data-media-slot]')).toHaveCount(3)
    // 占位槽是无障碍可见的（role=img + aria-label）
    await expect(page.locator('.hero [data-media-slot]')).toHaveAttribute('aria-label', /screenshot coming soon/i)
  })
})

test.describe('Download Page', () => {
  test('renders zip section and both browser channels with install steps', async ({ page }) => {
    const response = await page.goto('/download/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText('Install MapsGrab')
    // 直装 zip 资产占位（release 资产未挂）
    const zipLink = page.locator('a[data-cta="download-zip"]')
    await expect(zipLink).toBeVisible()
    await expect(zipLink).toHaveAttribute('href', '#')
    // Edge 与 Firefox 渠道各自带商店占位与安装步骤
    for (const channelId of ['edge', 'firefox']) {
      const channel = page.locator(`[data-channel="${channelId}"]`)
      await expect(channel).toBeVisible()
      const storeLink = channel.locator('a[data-cta="download-store-' + channelId + '"]')
      await expect(storeLink).toHaveAttribute('href', '#')
      await expect(channel.locator('.channel-steps li').first()).toBeVisible()
    }
    await expect(page.locator('[data-channel="edge"] .channel-steps li')).toHaveCount(4)
    await expect(page.locator('[data-channel="firefox"] .channel-steps li')).toHaveCount(3)
  })

  test('renders media-rich hero, zip and per-step slots (015 D5 图文改造)', async ({ page }) => {
    await page.goto('/download/')
    // hero 宽幅位 + zip 文件位 + edge 四步 + firefox 三步 = 9 个占位槽
    await expect(page.locator('[data-media-slot]')).toHaveCount(9)
    await expect(page.locator('.hero [data-media-slot="browser"]')).toBeVisible()
    await expect(page.locator('.zip-card [data-media-slot="file"]')).toBeVisible()
    await expect(page.locator('[data-channel="edge"] [data-media-slot]')).toHaveCount(4)
    await expect(page.locator('[data-channel="firefox"] [data-media-slot]')).toHaveCount(3)
  })
})

test.describe('Secondary Pages', () => {
  async function expectPageRenders(page: Page, path: string, heading: string) {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText(heading)
  }

  test('pricing page renders the MapsGrab three-tier plans page', async ({ page }) => {
    await expectPageRenders(page, '/pricing/', 'Plans that scale with your maps workflow')
  })

  test('about and contact pages render the W3 content', async ({ page }) => {
    await expectPageRenders(page, '/about/', 'Maps data, grabbed the straightforward way')
    await expectPageRenders(page, '/contact/', 'Talk to a human')
    // About 页数据边界要点可见
    await page.goto('/about/')
    await expect(page.locator('.company-section-copy').filter({ hasText: 'Only publicly available business information' })).toBeVisible()
    // Contact 页支持邮箱占位
    await page.goto('/contact/')
    await expect(page.locator('.company-email')).toContainText('support@mapsgrab.com')
  })

  test('legal pages render the W3 documents', async ({ page }) => {
    await expectPageRenders(page, '/terms/', 'Terms of Service')
    await page.goto('/terms/')
    // Terms 要点：按「现状」提供 + 用户责任
    await expect(page.locator('h2').filter({ hasText: 'The service is provided as is' })).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Your responsibility' })).toBeVisible()

    await expectPageRenders(page, '/privacy/', 'Privacy Policy')
    // 隐私政策要点：后端四类用途、可选集成、GA4 豁免、无广告无追踪
    await expect(page.locator('h2').filter({ hasText: 'What our backend processes' })).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Optional Google Drive and HubSpot integrations' })).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Website analytics' })).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'What we never do' })).toBeVisible()
  })
})
