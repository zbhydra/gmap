/**
 * 工具矩阵 + Pricing 页 e2e（W4/W5 交付版）。
 *
 * mock 跑（PUBLIC_API_BASE_URL 指向假地址）：工具为纯前端逻辑，闭环不依赖
 * 后端；Pricing 断言展示结构（三线套餐卡 / 能力灰化 / URL 选线 / 结构化数据），支付配置
 * 加载在 mock 下进入失败态（按钮禁用），购买交互链路见 website.spec.ts。
 */
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

/** 带 fid 与坐标段的完整 Maps 地点 URL（纯前端解析样本）。 */
const SAMPLE_PLACE_URL =
  'https://www.google.com/maps/place/San+Francisco/@37.774929,-122.419416,17z/data=!3m1!4b1!4m5!3m4!1s0x8085809c23193567:0xa64e70a2e1a9c0e5!8m2!3d37.774929!4d-122.419416'
/** 样本 URL 的期望解析结果（lib/placeUrl 算法的黄金值）。 */
const SAMPLE_PLACE_ID = 'ChIJZzUZI5yAhYAR5cCp4aJwTqY'
const SAMPLE_CID = '11983639503352479973'
const SAMPLE_FID = '0x8085809c23193567:0xa64e70a2e1a9c0e5'

/** 7 个工具的页脚/互链注册表（与 i18n tools 键段同源口径）。 */
const TOOL_LINKS = [
  { id: 'place-id-finder', label: 'Place ID Finder', path: '/tools/place-id-finder/' },
  { id: 'review-link-generator', label: 'Review Link Generator', path: '/tools/review-link-generator/' },
  { id: 'email-checker', label: 'Email Checker', path: '/tools/email-checker/' },
  { id: 'lat-long-to-dms', label: 'Lat Long to DMS Converter', path: '/tools/lat-long-to-dms/' },
  { id: 'dms-to-dd', label: 'DMS to Decimal Converter', path: '/tools/dms-to-dd/' },
  { id: 'bulk-keywords-generator', label: 'Bulk Keywords Generator', path: '/tools/bulk-keywords-generator/' },
  { id: 'merge-csv', label: 'Merge CSV Files Online', path: '/tools/merge-csv-files-online/' }
]

const TOOL_ROUTES = TOOL_LINKS.map(tool => tool.path)

test.describe('Tool Matrix', () => {
  test('every page exposes the seven tool entries in the footer for internal linking', async ({ page }) => {
    await page.goto('/')
    const resourcesGroup = page.locator('[data-footer-resources]')
    for (const tool of TOOL_LINKS) {
      const link = resourcesGroup.locator(`a[data-cta="footer-tool-${tool.id}"]`)
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', tool.path)
      await expect(link).toHaveText(tool.label)
    }
  })

  test('tool pages cross-link the other six tools excluding the current one', async ({ page }) => {
    for (const route of TOOL_ROUTES) {
      await page.goto(route)
      const related = page.locator('.tool-related')
      await expect(related.locator('a[data-cta^="tool-related-"]')).toHaveCount(6)
      // 当前工具不出现在互链区
      const currentId = TOOL_LINKS.find(tool => tool.path === route)?.id
      if (currentId) {
        await expect(related.locator(`a[data-cta="tool-related-${currentId}"]`)).toHaveCount(0)
      }
      // 互链 href 均指向真实工具路由
      const hrefs = await related.locator('a').evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).getAttribute('href')))
      expect(hrefs.every(href => href?.startsWith('/tools/')), `expected /tools/ links on ${route}`).toBe(true)
    }
  })

  test('all seven tool pages render with H1, SEO body, FAQ and CTA attribution', async ({ page }) => {
    for (const route of TOOL_ROUTES) {
      const response = await page.goto(route)
      expect(response?.status(), `expected ${route} to be 200`).toBe(200)
      await expect(page.locator('h1')).toBeVisible()
      // SEO 正文：三节用法（Place ID Finder 为三步用法卡）+ FAQ 至少一问
      await expect(page.locator('#guide .guide-card, #how .pid-step')).toHaveCount(3)
      await expect(page.locator('#faq details.acc').first()).toBeVisible()
      // CTA 漏斗（作用域限定收尾 CTA，避免命中导航 Install）：插件安装未交付 → 灰化按钮，无链接与 data-cta；
      // 套餐链接带 utm 与 data-cta
      const cta = page.locator('.final-cta')
      const install = cta.locator('button[data-capability="extensionInstall"]')
      await expect(install).toBeVisible()
      await expect(install).toHaveAttribute('aria-disabled', 'true')
      await expect(install).not.toHaveAttribute('href')
      await expect(install).not.toHaveAttribute('data-cta')
      const pricing = cta.locator('a[data-cta$="-pricing"]')
      await expect(pricing).toBeVisible()
      const pricingHref = await pricing.getAttribute('href')
      expect(pricingHref).toContain('/pricing/')
      expect(pricingHref).toContain('utm_medium=tool-')
      expect(pricingHref).toContain('utm_campaign=pricing')
    }
  })

  test('place id finder decodes a full Maps URL into Place ID, CID and FID', async ({ page }) => {
    await page.goto('/tools/place-id-finder/')
    await page.locator('[data-tool-input]').fill(SAMPLE_PLACE_URL)
    await page.locator('[data-tool-form] button[type="submit"]').click()

    await expect(page.locator('[data-place-id]')).toHaveText(SAMPLE_PLACE_ID)
    await expect(page.locator('[data-cid]')).toHaveText(SAMPLE_CID)
    await expect(page.locator('[data-fid]')).toHaveText(SAMPLE_FID)
  })

  test('place id finder rejects short links and non-Maps URLs inline', async ({ page }) => {
    await page.goto('/tools/place-id-finder/')

    await page.locator('[data-tool-input]').fill('https://maps.app.goo.gl/8f9xAbCdEfGh')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-tool-error]')).toBeVisible()
    await expect(page.locator('[data-tool-error]')).toContainText(/short link/i)

    await page.locator('[data-tool-input]').fill('https://example.com/maps/place/foo')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-tool-error]')).toContainText(/Google Maps place URL/i)
  })

  test('review link generator builds the direct search.google.com reviews URL', async ({ page }) => {
    await page.goto('/tools/review-link-generator/')
    await page.locator('[data-tool-input]').fill(SAMPLE_PLACE_URL)
    await page.locator('[data-tool-form] button[type="submit"]').click()

    await expect(page.locator('[data-review-link]')).toHaveText(
      `https://search.google.com/local/reviews?placeid=${SAMPLE_PLACE_ID}`
    )
    await expect(page.locator('[data-review-open]')).toHaveAttribute('href', /placeid=/)
  })

  test('email checker validates format, flags broken shapes and suggests typo domains', async ({ page }) => {
    await page.goto('/tools/email-checker/')

    // 合法地址 → 通过
    await page.locator('[data-tool-input]').fill('jane.doe@example.com')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-result-heading]')).toHaveAttribute('data-outcome', 'valid')

    // 双 @ → 逐条问题清单
    await page.locator('[data-tool-input]').fill('jane@@example.com')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-result-heading]')).toHaveAttribute('data-outcome', 'invalid')
    await expect(page.locator('[data-issue-list] li')).not.toHaveCount(0)

    // 服务商域名 typo → 建议正确域名
    await page.locator('[data-tool-input]').fill('jane@gnail.com')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-issue-list]')).toContainText('gmail.com')
  })

  test('lat long to DMS converts decimal coordinates with hemisphere letters', async ({ page }) => {
    await page.goto('/tools/lat-long-to-dms/')
    await page.locator('[data-latitude]').fill('37.774929')
    await page.locator('[data-longitude]').fill('-122.419416')
    await page.locator('[data-tool-form] button[type="submit"]').click()

    await expect(page.locator('[data-dms-value]')).toHaveText(`37° 46' 29.74" N, 122° 25' 9.90" W`)
  })

  test('lat long to DMS rejects out-of-range latitude inline', async ({ page }) => {
    await page.goto('/tools/lat-long-to-dms/')
    await page.locator('[data-latitude]').fill('91')
    await page.locator('[data-longitude]').fill('0')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-tool-error]')).toBeVisible()
  })

  test('DMS to decimal converts both axes with signed hemisphere handling', async ({ page }) => {
    await page.goto('/tools/dms-to-dd/')
    await page.locator('[data-lat-degrees]').fill('37')
    await page.locator('[data-lat-minutes]').fill('46')
    await page.locator('[data-lat-seconds]').fill('29.74')
    await page.locator('[data-lat-hemisphere]').selectOption('N')
    await page.locator('[data-lng-degrees]').fill('122')
    await page.locator('[data-lng-minutes]').fill('25')
    await page.locator('[data-lng-seconds]').fill('9.9')
    await page.locator('[data-lng-hemisphere]').selectOption('W')
    await page.locator('[data-tool-form] button[type="submit"]').click()

    await expect(page.locator('[data-dd-value]')).toHaveText('37.774928, -122.419417')
  })

  test('DMS to decimal rejects invalid minutes inline', async ({ page }) => {
    await page.goto('/tools/dms-to-dd/')
    await page.locator('[data-lat-degrees]').fill('37')
    await page.locator('[data-lat-minutes]').fill('61')
    await page.locator('[data-lng-degrees]').fill('122')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-tool-error]')).toBeVisible()
  })

  test('bulk keywords generator produces the full keyword x location matrix', async ({ page }) => {
    await page.goto('/tools/bulk-keywords-generator/')
    await page.locator('[data-keywords]').fill('design agency\ncoffee shop\n')
    await page.locator('[data-locations]').fill('New York\nChicago\n')
    await page.locator('[data-tool-form] button[type="submit"]').click()

    await expect(page.locator('[data-count-summary]')).toHaveText('4 combinations generated.')
    const combinations = await page.locator('[data-combinations]').inputValue()
    expect(combinations.split('\n')).toEqual([
      'design agency New York',
      'design agency Chicago',
      'coffee shop New York',
      'coffee shop Chicago'
    ])

    // 地点在前：切换组合顺序后重新生成
    await page.locator('[data-order]').selectOption('location-first')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-combinations]')).toHaveValue(/New York design agency/)
  })

  test('bulk keywords generator reports empty keyword input inline', async ({ page }) => {
    await page.goto('/tools/bulk-keywords-generator/')
    await page.locator('[data-keywords]').fill('   ')
    await page.locator('[data-locations]').fill('New York')
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-tool-error]')).toBeVisible()
  })

  test('merge csv unions headers across files and downloads the merged table', async ({ page }) => {
    await page.goto('/tools/merge-csv-files-online/')
    await page.locator('[data-tool-files]').setInputFiles([
      { name: 'run-1.csv', mimeType: 'text/csv', buffer: Buffer.from('name,city\nAcme,Paris\nGlobex,Lyon\n') },
      { name: 'run-2.csv', mimeType: 'text/csv', buffer: Buffer.from('name,email\nAcme,a@acme.io\n') }
    ])
    await page.locator('[data-tool-form] button[type="submit"]').click()

    await expect(page.locator('[data-result-summary]')).toHaveText('Merged 2 files into 3 rows × 3 columns.')
    const preview = await page.locator('[data-merged-preview]').inputValue()
    // textarea 会把 CRLF 归一化为 LF，预览按 LF 断言（下载文件保持 CRLF）。
    expect(preview.split('\n')).toEqual(['name,city,email', 'Acme,Paris,', 'Globex,Lyon,', 'Acme,,a@acme.io', ''])

    await page.locator('[data-tool-files]').setInputFiles([
      { name: 'new-online.csv', mimeType: 'text/csv', buffer: Buffer.from('Name,Fulladdress\n名称,完整地址\nAcme,Paris\n') },
      { name: 'old-online.csv', mimeType: 'text/csv', buffer: Buffer.from('Name,Fulladdress\nGlobex,Lyon\n') },
      { name: 'plain.csv', mimeType: 'text/csv', buffer: Buffer.from('name,email\nOther,o@example.test\n') }
    ])
    const translationRows = page.locator('[data-translation-row]')
    await expect(translationRows).toHaveCount(3)
    await expect(translationRows.first()).not.toBeChecked()
    await translationRows.first().check()
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-result-summary]')).toHaveText('Merged 3 files into 3 rows × 4 columns.')
    await expect(page.locator('[data-file-summaries] li')).toHaveCount(3)
    const mixed = await page.locator('[data-merged-preview]').inputValue()
    expect(mixed.split('\n')).toEqual([
      'Name,Fulladdress,name,email', 'Acme,Paris,,', 'Globex,Lyon,,', ',,Other,o@example.test', ''
    ])
    const downloadStarted = page.waitForEvent('download')
    await page.locator('[data-download-merged]').click()
    const download = await downloadStarted
    expect(await readFile(await download.path(), 'utf8')).toBe(`\ufeff${mixed.replaceAll('\n', '\r\n')}`)

    // 单文件触发守卫
    await page.locator('[data-tool-files]').setInputFiles([
      { name: 'only.csv', mimeType: 'text/csv', buffer: Buffer.from('name\nAcme\n') }
    ])
    await page.locator('[data-tool-form] button[type="submit"]').click()
    await expect(page.locator('[data-tool-error]')).toBeVisible()
  })
})

test.describe('Pricing Page', () => {
  test('renders hero, three MapsGrab tier cards and quota facts', async ({ page }) => {
    const response = await page.goto('/pricing/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText('Plans for three ways to grab Maps data')

    // 默认 Online tab：五档卡（Free/Lite/Basic/Growth/Professional），主推 Basic
    const onlinePanel = page.locator('[data-pricing-panel="online"]')
    await expect(onlinePanel).toBeVisible()
    // data-plan-card = productId ?? id（Free 卡无 productId 落 id）
    for (const cardId of ['free', 'online_lite', 'online_basic', 'online_growth', 'online_pro']) {
      await expect(onlinePanel.locator(`[data-plan-card="${cardId}"]`)).toBeVisible()
    }
    await expect(onlinePanel.locator('[data-plan-card="online_basic"] .price-flag')).toContainText('Most Popular')

    // Extension tab：MapsGrab 三档 Free / Pro / Business（C2 口径）；价格数字切换时滚动到终值
    await page.locator('[data-pricing-tab="extension"]').click()
    const extensionPanel = page.locator('[data-pricing-panel="extension"]')
    await expect(extensionPanel).toBeVisible()
    await expect(extensionPanel.locator('[data-plan-card="free"] .price-quota')).toContainText('1,000 records / month')
    await expect(extensionPanel.locator('[data-plan-card="maps_extension_pro"] [data-price]')).toHaveText('39')
    await expect(extensionPanel.locator('[data-plan-card="maps_extension_pro"] .price-quota')).toContainText('100,000 records / month')
    await expect(extensionPanel.locator('[data-plan-card="maps_extension_business"] [data-price]')).toHaveText('99')
    await expect(extensionPanel.locator('[data-plan-card="maps_extension_business"] .price-quota')).toContainText('500,000 records / month')
    // 主推徽章在 Pro 卡
    await expect(extensionPanel.locator('[data-plan-card="maps_extension_pro"] .price-flag')).toContainText('Most Popular')
  })

  test('online and API buy buttons wait for payment config while extension plans stay gated', async ({ page }) => {
    await page.goto('/pricing/')
    // mock 环境无支付配置：Online 与 API 各四个付费档的购买按钮保持禁用态，不误购；
    // Free 卡分别直达 Online Scraper 与 Scraper API 介绍页
    for (const line of ['online', 'api'] as const) {
      const buy = page.locator(`[data-pricing-panel="${line}"] [data-pricing-buy]`)
      await expect(buy).toHaveCount(4)
      for (let i = 0; i < 4; i++) {
        await expect(buy.nth(i)).toBeDisabled()
      }
    }
    await expect(page.locator('a[data-cta="pricing-free-online"]')).toHaveAttribute('href', '/online-scraper/')
    await expect(page.locator('a[data-cta="pricing-free-api"]')).toHaveAttribute('href', '/google-maps-scraper-api/')
    await expect(page.locator('[data-pricing-panel="api"] [data-capability]')).toHaveCount(0)

    // 插件安装 / 购买未交付（lib/capabilities.ts）：aria-disabled 按钮，无链接、无购买入口
    for (const [line, capability, count] of [
      ['extension', 'extensionInstall', 1],
      ['extension', 'extensionPurchase', 2]
    ] as const) {
      const gated = page.locator(`[data-pricing-panel="${line}"] button[data-capability="${capability}"]`)
      await expect(gated).toHaveCount(count)
      for (let i = 0; i < count; i++) {
        await expect(gated.nth(i)).toHaveAttribute('aria-disabled', 'true')
        await expect(gated.nth(i)).not.toHaveAttribute('href')
      }
      await expect(page.locator(`[data-pricing-panel="${line}"] [data-pricing-buy]`)).toHaveCount(0)
    }
  })

  test('URL picks the product line and tab clicks write it back', async ({ page }) => {
    // Dashboard / 插件 / 落地页沿用 product_kind 直达，导航 API pricing 走 #api
    await page.goto('/pricing/?product_kind=maps_extension')
    await expect(page.locator('[data-pricing-tab="extension"]')).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('[data-pricing-panel="extension"]')).toBeVisible()
    await page.goto('/pricing/#api')
    await expect(page.locator('[data-pricing-tab="api"]')).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('[data-compare-table="api"]')).toBeVisible()
    // 产品切换写回 hash，对比表分段跟随
    await page.locator('[data-pricing-tab="online"]').click()
    await expect(page).toHaveURL(/#online$/)
    await expect(page.locator('[data-compare-key="online"]')).toHaveAttribute('aria-pressed', 'true')
  })

  test('exposes FAQ and plan offer structured data', async ({ page }) => {
    await page.goto('/pricing/')
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents()
    const types = schema.map(text => (JSON.parse(text) as { '@type'?: string })['@type'])
    expect(types).toContain('FAQPage')
    expect(types).toContain('Product')
    const offersSchema = schema.map(text => JSON.parse(text) as { offers?: { name: string; price: string }[] }).find(
      item => Array.isArray(item.offers)
    )
    // Offer 列表按线展开：online 五档 + extension 三档 + api 五档
    expect(offersSchema?.offers?.map(offer => offer.price)).toEqual([
      '0', '19', '49', '99', '149',
      '0', '39', '99',
      '0', '15', '65', '115', '365'
    ])
  })
})
