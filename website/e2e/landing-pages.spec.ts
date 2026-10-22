/**
 * 云端采集页与插件页 e2e（U3 W3）；API / MCP 四页见 api-mcp-pages.spec.ts。
 *
 * 云端页：Online 已交付，开始采集、Free 卡与收尾 CTA 直达 Dashboard，付费卡与定价入口进 Pricing 的 Online tab，
 * 输出 FAQPage 结构化数据；搜索模式演示按 Dashboard 的规则计数（地图采样位置超过 50 时提示并阻止提交，
 * 地区生成的查询超过套餐关键词上限时提示）。
 * 插件页：官网 ZIP 按浏览器下载，安装教程与单次套餐入口可达。
 */
import { expect, test } from '@playwright/test'

import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

/** Online 套餐卡 id（pricing.ts 的 online tab）。 */
const ONLINE_PLAN_IDS = ['free', 'lite', 'basic', 'growth', 'professional']

test.describe('Online Scraper page', () => {
  test('hero, plans and final CTA lead to the Dashboard and the Online pricing tab', async ({ page }) => {
    const response = await page.goto('/online-scraper/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toContainText('Google Maps extraction')
    await expect(page.locator('#results')).toContainText('37 public columns')
    await expect(page.locator('#results .oc-file-name')).toContainText('1 CSV')
    await expect(page.locator('#results .oc-r1')).toContainText('Search Keyword')
    await expect(page.locator('#results .oc-r2')).toContainText('Primary phone')
    await expect(page.locator('#results')).not.toContainText('ZIP')
    await expect(page.locator('a[data-cta="online-hero-dashboard"]')).toHaveAttribute('href', '/dashboard/')
    await expect(page.locator('a[data-cta="online-scraper-hero-pricing"]')).toHaveAttribute(
      'href',
      '/pricing/?product_kind=maps_online&utm_source=website&utm_medium=online-scraper-hero&utm_campaign=pricing'
    )
    for (const id of ONLINE_PLAN_IDS) {
      await expect(page.locator(`#plans a[data-cta="online-plan-${id}"]`)).toHaveAttribute(
        'href',
        id === 'free' ? '/dashboard/' : '/pricing/?product_kind=maps_online'
      )
    }
    await expect(page.locator('a[data-cta="online-cta-dashboard"]')).toHaveAttribute('href', '/dashboard/')

    const faqCount = await page.locator('#faq details.acc').count()
    expect(faqCount).toBeGreaterThan(0)
    const faqSchema = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map(text => JSON.parse(text) as { '@type'?: string; mainEntity?: { '@type'?: string }[] })
      .find(item => item['@type'] === 'FAQPage')
    expect(faqSchema?.mainEntity).toHaveLength(faqCount)
  })

  test('search mode demos count like the Dashboard', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    // 减弱动效下演示直接停在终态，不跑自动播放，交互结果可确定
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/online-scraper/')
    const modes = page.locator('#modes')
    await modes.scrollIntoViewIfNeeded()

    // 地图：默认 2 个关键词 × 13 个网格点；半径加到 20 km 后 98 个采样位置超过 50，提示并阻止提交
    await expect(modes.locator('#om-tab-map')).toHaveAttribute('aria-selected', 'true')
    const sampleCount = modes.locator('[data-omm-count]')
    const mapError = modes.locator('[data-omm-error]')
    await expect(sampleCount).toHaveText('26')
    await modes.locator('[data-omm-radius]').focus()
    for (let i = 0; i < 10; i += 1) await page.keyboard.press('ArrowRight')
    await expect(sampleCount).toHaveText('98')
    await expect(mapError).toBeVisible()
    await expect(modes.locator('[data-omm-submit]')).toHaveClass(/is-disabled/)
    // 网格间距加到 8 km 后回到上限内
    await modes.locator('[data-omm-spacing]').focus()
    for (let i = 0; i < 3; i += 1) await page.keyboard.press('ArrowRight')
    await expect(sampleCount).toHaveText('42')
    await expect(mapError).toBeHidden()

    // 关键词：空行与重复行跳过后计数
    await modes.locator('#om-tab-keywords').click()
    await expect(modes.locator('[data-omk-count]')).toHaveText('4 / 10 keywords')
    await expect(modes.locator('[data-omk-lines] li.is-skip')).toHaveCount(2)

    // 地区：城市 × 基础关键词生成查询，Near 改写措辞；超过套餐关键词上限时提示，移除城市后恢复
    await modes.locator('#om-tab-regions').click()
    const queries = modes.locator('[data-omr-queries] li')
    const regionError = modes.locator('[data-omr-error]')
    await expect(queries).toHaveCount(6)
    await modes.locator('[data-omr-mode="near"]').click()
    await expect(modes.locator('[data-omr-mode="near"]')).toHaveAttribute('aria-pressed', 'true')
    for (let i = 0; i < 3; i += 1) await modes.locator('[data-omr-add]').click()
    await expect(modes.locator('[data-omr-add]')).toBeDisabled()
    await modes.locator('[data-omr-generate]').click()
    await expect(queries).toHaveCount(12)
    await expect(queries.first()).toHaveText('dentist near Austin, Texas, US')
    await expect(regionError).toBeVisible()
    await modes.getByRole('button', { name: 'Remove El Paso, Texas, US' }).click()
    await modes.locator('[data-omr-generate]').click()
    await expect(queries).toHaveCount(10)
    await expect(regionError).toBeHidden()

    expect(pageErrors).toEqual([])
  })
})

test.describe('Extension page', () => {
  test('downloads browser-specific ZIPs and links to installation and one-time plans', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/extension/')
    for (const [cta, href] of [
      ['extension-install-zip', '/downloads/mapsgrab.zip'],
      ['extension-install-firefox', '/downloads/mapsgrab-firefox.zip']
    ]) {
      const download = page.locator(`a[data-cta="${cta}"]`)
      await expect(download).toHaveAttribute('href', href)
      await expect(download).toHaveAttribute('download', '')
      const fitsCard = await download.evaluate(element =>
        element.getBoundingClientRect().right <= element.closest('article')!.getBoundingClientRect().right
      )
      expect(fitsCard).toBe(true)
      const archive = await page.request.get(href)
      expect(archive.status()).toBe(200)
      expect((await archive.body()).subarray(0, 2).toString()).toBe('PK')
    }
    await expect(page.locator('a[data-cta="extension-hero-install-guide"]')).toHaveAttribute('href', '#install')
    await expect(page.locator('#plans a[data-cta="extension-plan-pro"]')).toHaveAttribute('href', '/pricing/?product_kind=maps_extension')
    await expect(page.locator('#plans .price-period').nth(1)).toContainText('one-time')
    for (const [channel, count] of [['chromium', 4], ['firefox', 3]] as const) {
      await page.locator(`#xi-tab-${channel}`).click()
      const shots = page.locator(`#xi-${channel} .xi-shot img`)
      await expect(shots).toHaveCount(count)
      for (const shot of await shots.all()) {
        await shot.scrollIntoViewIfNeeded()
        await expect.poll(() => shot.evaluate(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true)
        await expect(shot).toHaveAttribute('alt', /\S/)
        await expect(shot.locator('..')).toHaveAttribute('href', await shot.getAttribute('src') ?? '')
      }
    }
    await expect(page.locator('#xi-firefox')).toContainText('unloads when Firefox restarts')
  })
})
