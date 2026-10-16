/**
 * 云端采集页与插件页 e2e（U3 W3）；API / MCP 四页见 api-mcp-pages.spec.ts。
 *
 * 云端页：Online 已交付，开始采集、Free 卡与收尾 CTA 直达 Dashboard，付费卡与定价入口进 Pricing 的 Online tab，
 * 输出 FAQPage 结构化数据；搜索模式演示按 Dashboard 的规则计数（地图采样位置超过 50 时提示并阻止提交，
 * 地区生成的查询超过套餐关键词上限时提示）。
 * 插件页：安装与插件购买未交付（lib/capabilities.ts），安装区、套餐卡与收尾 CTA 的入口都是 aria-disabled 按钮
 * （无 href、无埋点属性），点击 / 回车 / 空格都不跳转、不发请求。
 */
import { expect, test, type Request } from '@playwright/test'

import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

/** 点击后不应出现的请求类型（接口调用、埋点信标、长连接）。 */
const ACTION_REQUEST_TYPES = new Set(['fetch', 'xhr', 'ping', 'eventsource', 'websocket'])
/** 与按钮无关的后台请求：Vite dev server 的 HMR / 依赖预构建通道，以及站级首次访问打点。 */
const BACKGROUND_REQUEST = /\/(@vite|@id|@fs)\/|__vite_ping|\/node_modules\/\.vite\/|\/api\/client\/mark\/record/

/** Online 套餐卡 id（pricing.ts 的 online tab）。 */
const ONLINE_PLAN_IDS = ['free', 'lite', 'basic', 'growth', 'professional']

test.describe('Online Scraper page', () => {
  test('hero, plans and final CTA lead to the Dashboard and the Online pricing tab', async ({ page }) => {
    const response = await page.goto('/online-scraper/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('main h1')).toContainText('Google Maps extraction')
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
  test('install and purchase entries are greyed out and inert', async ({ page }) => {
    await page.goto('/extension/', { waitUntil: 'networkidle' })
    expect(await page.locator('#install button[data-capability="extensionInstall"]').count()).toBeGreaterThan(0)
    // 每张套餐卡的按钮都灰化：Free 绑安装，付费档绑插件购买
    const planCount = await page.locator('#plans .price-card').count()
    expect(planCount).toBeGreaterThan(1)
    await expect(page.locator('#plans button[data-capability="extensionInstall"]')).toHaveCount(1)
    await expect(page.locator('#plans button[data-capability="extensionPurchase"]')).toHaveCount(planCount - 1)
    await expect(page.locator('.final-cta button[data-capability="extensionInstall"]')).toHaveCount(1)

    const inert = page.locator('main button[data-capability]')
    const urlBefore = page.url()
    // 只记跳转与数据 / 埋点类请求；浏览器自行补取的静态资源与后台请求都和按钮无关。
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
    expect(page.url()).toBe(urlBefore)
    expect(requests).toEqual([])
  })
})
