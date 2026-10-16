/**
 * 网站 e2e（004/U5）。
 *
 * mock 跑：PUBLIC_API_BASE_URL 指向假地址；spec 内 page.route mock 自有
 * /api/client/** 接口，page.context().route mock ClinkBill checkout / portal
 * 外部页（window.open 的新页面不真实出网）。用例：
 *
 * 1. Pricing Online 购买主路径：普通下单与 Clink 回跳、PayPal 固定渠道补差与
 *    回跳刷新及产品类别直达。（渠道管理入口已迁 Dashboard 订阅页，见 dashboard.spec.ts。）
 * 2. Pricing 插件自动续费：下单携带 auto_renew，续费升级确认等待后刷新档位。
 *    插件购买未交付（lib/capabilities.ts 的 extensionPurchase）时跳过，放开后自动恢复。
 * 3. 站点结构路径：主导航 / 桌面 API 下拉 / 移动菜单 / 首页核心产品卡与
 *    FAQPage JSON-LD / Extension 安装链路 / Terms / Privacy 关键事实。
 */
import { expect, test, type Page } from '@playwright/test'

import { capabilities } from '../src/lib/capabilities'
import { expectE2eBrowserIdentity, registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

/** 后端标准响应信封。 */
interface ApiEnvelope<T extends object> {
  /** 业务成功码 10000。 */
  code: number
  data: T
}

/** 后端标准响应信封构造（成功码 10000）。 */
function envelope<T extends object>(data: T): ApiEnvelope<T> {
  return { code: 10000, data }
}

/** checkout-configs 的单个渠道价选项。 */
interface MockPaymentChannel {
  payment_method: string
  payment_method_name: string
  product_price_id: number
  currency: string
  amount: number
}

/** checkout-configs 的单个商品配置。 */
interface MockPlan {
  product_class: number
  product_id: string
  product_kind: string
  product_name: string
  period: 'month'
  auto_renew: boolean
  display_currency: string
  display_amount: number
  monthly_quota: number
  payment_channels: MockPaymentChannel[]
}

/** 捕获到的下单请求体。 */
interface CapturedCreateOrderBody {
  product_class: number
  product_id: string
  payment_method: string
  currency: string
  amount: number
  auto_renew: boolean
  period: string
}

/** 捕获到的取消订单请求体。 */
interface CapturedCancelBody {
  order_no: string
}

/** 捕获到的升级下单 / 确认请求体。 */
interface CapturedUpgradeBody {
  product_kind: string
  target_product_id: string
}

/** 用例中途改写的订阅状态：auth/me 与升级报价都按它返回。 */
interface PurchaseMockState {
  /** 当前有效的 Online 订阅商品（PayPal 支付）；null 为 Free。 */
  onlineProductId: string | null
  /** 当前有效的插件订阅商品（ClinkBill 自动续费）；null 为 Free。 */
  extensionProductId: string | null
  /** 置为 true 后，下一次插件报价视为续费升级已生效。 */
  applyRecurringUpgrade: boolean
}

/** 购买用例捕获的请求体。 */
interface PurchaseMockRequests {
  createOrders: CapturedCreateOrderBody[]
  cancels: CapturedCancelBody[]
  upgradeCheckouts: CapturedUpgradeBody[]
  upgradeConfirms: CapturedUpgradeBody[]
}

const ORDER_SUCCESS_EPOCH = Date.parse('2026-09-05T00:00:00Z')

/** 三产品类别各出一个代表 SKU：Online 一次性 / Extension 自动续费 / API 一次性。 */
function buildPlans(): MockPlan[] {
  const channels = (basePriceId: number, amount: number): MockPaymentChannel[] => [
    {
      payment_method: 'paypal',
      payment_method_name: 'PayPal',
      product_price_id: basePriceId,
      currency: 'USD',
      amount
    },
    {
      payment_method: 'clink',
      payment_method_name: 'ClinkBill',
      product_price_id: basePriceId + 1,
      currency: 'USD',
      amount
    }
  ]

  const plan = (
    productId: string,
    productKind: string,
    productName: string,
    amount: number,
    autoRenew: boolean,
    monthlyQuota: number,
    basePriceId: number
  ): MockPlan => ({
    product_class: 1,
    product_id: productId,
    product_kind: productKind,
    product_name: productName,
    period: 'month',
    auto_renew: autoRenew,
    display_currency: 'USD',
    display_amount: amount,
    monthly_quota: monthlyQuota,
    payment_channels: channels(basePriceId, amount)
  })

  return [
    plan('online_basic', 'maps_online', 'Online Basic', 49_000_000, false, 80_000, 301),
    plan('maps_extension_pro', 'maps_extension', 'Maps Pro', 39_000_000, true, 100_000, 201),
    plan('api_professional', 'maps_api', 'API Professional', 65_000_000, false, 5_000, 401)
  ]
}

/**
 * 安装购买用例共用的登录态与后端 / 支付页 mock。
 *
 * 普通订单号固定 CLINK-E2E-1，状态按最近一次下单的商品返回；PAYPAL-UPGRADE-1 是 Online 补差单，
 * 查询即视为已支付并把 Online 订阅切到 Growth。
 */
async function mockPurchaseBackend(page: Page): Promise<{ state: PurchaseMockState; requests: PurchaseMockRequests }> {
  const state: PurchaseMockState = { onlineProductId: null, extensionProductId: null, applyRecurringUpgrade: false }
  const requests: PurchaseMockRequests = { createOrders: [], cancels: [], upgradeCheckouts: [], upgradeConfirms: [] }
  const expiresAt = Date.now() + 30 * 86_400_000
  const plans = [
    ...buildPlans(),
    { ...buildPlans()[0], product_id: 'online_growth', product_name: 'Online Growth' },
    { ...buildPlans()[1], product_id: 'maps_extension_business', product_name: 'Maps Business' }
  ]

  await page.addInitScript(() => {
    window.localStorage.setItem('homepage_access_token', 'e2e-pricing-token')
  })

  await page.route('**/api/client/auth/me', route =>
    route.fulfill({
      json: envelope({
        email: 'hydra@mapsgrab.test',
        full_name: 'Hydra',
        credits_balance: 0,
        created_at: ORDER_SUCCESS_EPOCH,
        maps_extension_subscription: state.extensionProductId
          ? {
              status: 'active',
              period: 'month',
              display_name: state.extensionProductId === 'maps_extension_pro' ? 'Maps Pro' : 'Maps Business',
              expires_at: expiresAt,
              auto_renew: true,
              payment_method: 'clink'
            }
          : null,
        maps_online_subscription: state.onlineProductId ? {
          status: 'active',
          period: 'month',
          display_name: state.onlineProductId === 'online_basic' ? 'Online Basic' : 'Online Growth',
          expires_at: expiresAt,
          auto_renew: false,
          payment_method: 'paypal'
        } : null
      })
    })
  )

  await page.route('**/api/client/subscription/checkout-configs', route =>
    route.fulfill({ json: envelope({ checkout_configs: plans }) })
  )

  await page.route('**/api/client/subscription/upgrade-quote?*', route => {
    const params = new URL(route.request().url()).searchParams
    const target = params.get('target_product_id')
    const online = params.get('product_kind') === 'maps_online'
    if (!online && state.applyRecurringUpgrade) {
      state.extensionProductId = 'maps_extension_business'
    }
    const current = online ? state.onlineProductId : state.extensionProductId
    const available = online
      ? current === 'online_basic' && target === 'online_growth'
      : current === 'maps_extension_pro' && target === 'maps_extension_business'
    return route.fulfill({ json: envelope({
      available,
      reason: available ? null : 'not_higher_tier',
      current_product_id: current,
      target_product_id: target,
      payment_method: online ? 'paypal' : 'clink',
      currency: 'USD',
      amount: available ? 12_500_000 : null,
      expires_at: expiresAt
    }) })
  })

  await page.route('**/api/client/subscription/upgrade/checkout', route => {
    requests.upgradeCheckouts.push(route.request().postDataJSON() as CapturedUpgradeBody)
    return route.fulfill({ json: envelope({
      order_no: 'PAYPAL-UPGRADE-1',
      amount: 12_500_000,
      currency: 'USD',
      expired_at: Date.now() + 1_800_000,
      support_mail: '',
      payment_data: { approval_url: 'https://www.paypal.com/checkoutnow?token=upgrade' }
    }) })
  })

  await page.route('**/api/client/subscription/upgrade/confirm', route => {
    requests.upgradeConfirms.push(route.request().postDataJSON() as CapturedUpgradeBody)
    return route.fulfill({ json: envelope({
      status: 'requires_action', action: { type: 'wait', url: null }
    }) })
  })

  await page.route('**/api/client/order/create', route => {
    const body = route.request().postDataJSON() as CapturedCreateOrderBody
    requests.createOrders.push(body)
    return route.fulfill({
      json: envelope({
        order_no: 'CLINK-E2E-1',
        amount: body.amount,
        currency: 'USD',
        expired_at: Date.now() + 1_800_000,
        support_mail: '',
        payment_data: {
          sessionId: 'sess_e2e_1',
          checkoutUrl: 'https://uat-checkout.clinkbill.com/pay/sess_e2e_1'
        }
      })
    })
  })

  await page.context().route('**/api/client/order/status/**', route => {
    const upgrade = route.request().url().endsWith('PAYPAL-UPGRADE-1')
    if (upgrade) {
      state.onlineProductId = 'online_growth'
    }
    const productId = upgrade ? 'online_growth' : requests.createOrders.at(-1)?.product_id
    const plan = plans.find(item => item.product_id === productId)
    return route.fulfill({
      json: envelope({
        order_no: upgrade ? 'PAYPAL-UPGRADE-1' : 'CLINK-E2E-1',
        product_class: 1,
        product_id: productId,
        product_kind: plan?.product_kind,
        product_name: plan?.product_name,
        amount: upgrade ? 12_500_000 : plan?.display_amount,
        currency: 'USD',
        order_status: 2,
        callback_status: 3,
        payment_method: upgrade ? 'paypal' : 'clink',
        paid_at: ORDER_SUCCESS_EPOCH,
        created_at: ORDER_SUCCESS_EPOCH,
        expired_at: ORDER_SUCCESS_EPOCH + 1_800_000
      })
    })
  })

  await page.route('**/api/client/order/cancel', route => {
    requests.cancels.push(route.request().postDataJSON() as CapturedCancelBody)
    return route.fulfill({ json: envelope({}) })
  })

  // Clink 官方域名挂 context.route：window.open 的新页面同样被拦截，不真实出网。
  await page.context().route('https://uat-checkout.clinkbill.com/**', route =>
    route.fulfill({ contentType: 'text/html', body: '<html><title>ClinkBill Checkout</title></html>' })
  )
  await page.context().route('https://uat-portal.clinkbill.com/**', route =>
    route.fulfill({ contentType: 'text/html', body: '<html><title>ClinkBill Portal</title></html>' })
  )
  await page.context().route('https://www.paypal.com/checkoutnow?*', route =>
    route.fulfill({ contentType: 'text/html', body: '<html><title>PayPal Checkout</title></html>' })
  )

  return { state, requests }
}

test('Pricing Online purchase path: order, upgrade and payment returns', async ({ page }, testInfo) => {
  const { state, requests } = await mockPurchaseBackend(page)

  await page.goto('/pricing/')
  await expectE2eBrowserIdentity(page, testInfo, expect)

  // 登录态恢复（站级会话）+ 配置加载后 Online 付费卡可点；插件套餐未交付，不输出购买按钮
  // （灰化断言见 tools.spec.ts）。账户摘要 / 渠道管理已迁 Dashboard。
  await expect(page.locator('[data-pricing-buy="online_basic"]')).toBeEnabled()
  await expect(page.locator('[data-pricing-panel="extension"] [data-pricing-buy]')).toHaveCount(0)

  // 普通下单：Online 一次性商品 detail 是 One-time payment；选 Clink 渠道并确认。
  await page.locator('[data-pricing-buy="online_basic"]').click()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('One-time payment')
  await page
    .locator('[data-order-checkout-payment-method="clink"]')
    .first()
    .click()
  const checkoutPopupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()

  const checkoutPopup = await checkoutPopupPromise
  await expect(checkoutPopup).toHaveURL(/uat-checkout\.clinkbill\.com/)

  // 下单请求必须携带 auto_renew + period，且与商品单一计费模式一致。
  expect(requests.createOrders).toHaveLength(1)
  expect(requests.createOrders[0]).toMatchObject({
    product_class: 1,
    product_id: 'online_basic',
    payment_method: 'clink',
    currency: 'USD',
    amount: 49_000_000,
    auto_renew: false,
    period: 'month'
  })

  // 订单轮询确认支付成功，弹窗切换 success 态。
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await expect(page.locator('[data-order-checkout-success-panel]')).toBeVisible()

  // 关闭 success 弹窗；渠道管理入口在 Dashboard 订阅页，由 dashboard.spec.ts 覆盖。
  await page.locator('[data-order-checkout-order-close]').click()
  await expect(page.locator('[data-order-checkout-modal]')).toBeHidden()

  // 复用同一用户路径验证报价定档、固定 PayPal 补差和既有回跳后刷新（mock 视其 Online Basic 由 PayPal 支付）。
  state.onlineProductId = 'online_basic'
  await page.goto('/pricing/?product_kind=maps_online')
  await expect(page.locator('[data-pricing-buy="online_basic"]')).toHaveText('Current Plan')
  await expect(page.locator('[data-pricing-buy="online_lite"]')).toBeDisabled()
  await expect(page.locator('[data-pricing-buy="online_growth"]')).toHaveText('Upgrade · $12.50')
  await page.locator('[data-pricing-buy="online_growth"]').click()
  await expect(page.locator('[data-order-checkout-channel-list]')).toBeHidden()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('One-time difference via PayPal')
  await expect(page.locator('[data-order-checkout-selected-price]')).toHaveText('$12.50')
  await page.screenshot({ path: testInfo.outputPath('upgrade-checkout.png') })
  const upgradePopupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()
  const upgradePopup = await upgradePopupPromise
  await expect(upgradePopup).toHaveURL(/www\.paypal\.com\/checkoutnow/)
  expect(requests.upgradeCheckouts).toEqual([{
    product_kind: 'maps_online', target_product_id: 'online_growth'
  }])
  await upgradePopup.goto(`${new URL(page.url()).origin}/paypal/success/?order_no=PAYPAL-UPGRADE-1`)
  await expect(upgradePopup.locator('[data-paypal-return-title]')).toHaveText('Subscription activated')
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await expect(page.locator('[data-pricing-buy="online_growth"]')).toHaveText('Current Plan')
  await page.locator('[data-order-checkout-order-close]').click()

  // Clink success 回跳：轮询本地订单后按订阅口径确认。
  await page.goto('/clink/success/?order_no=CLINK-E2E-1')
  const confirmedRoot = page.locator('[data-payment-return-state="confirmed"]')
  await expect(confirmedRoot).toBeVisible()
  await expect(page.locator('[data-payment-return-title]')).toHaveText('Plan activated')
  await expect(page.locator('[data-payment-return-description]')).toContainText(
    'ClinkBill payment is confirmed'
  )

  // Clink cancel 回跳：落到取消态并调用取消订单接口。
  await page.goto('/clink/cancel/?order_no=CLINK-E2E-1')
  await expect(page.locator('[data-payment-return-state="cancelled"]')).toBeVisible()
  await expect(page.locator('[data-payment-return-title]')).toHaveText('Payment canceled')
  expect(requests.cancels).toEqual([{ order_no: 'CLINK-E2E-1' }])
})

test('Pricing extension subscription: auto-renew order and recurring upgrade', async ({ page }, testInfo) => {
  test.skip(!capabilities.extensionPurchase, '插件购买未交付（lib/capabilities.ts），放开后自动恢复')
  const { state, requests } = await mockPurchaseBackend(page)

  // 插件同名 product_kind 参数直达 Extension；自动续费商品 detail 是 Auto-renews until canceled。
  await page.goto('/pricing/?product_kind=maps_extension')
  await expect(page.locator('[data-pricing-tab="extension"]')).toHaveAttribute('aria-selected', 'true')
  await page.locator('[data-pricing-buy="maps_extension_pro"]').click()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText(
    'Auto-renews until canceled'
  )

  // 选 Clink 渠道并确认：下单请求必须携带 auto_renew + period。
  await page
    .locator('[data-order-checkout-payment-method="clink"]')
    .first()
    .click()
  const checkoutPopupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()
  await expect(await checkoutPopupPromise).toHaveURL(/uat-checkout\.clinkbill\.com/)
  expect(requests.createOrders).toHaveLength(1)
  expect(requests.createOrders[0]).toMatchObject({
    product_class: 1,
    product_id: 'maps_extension_pro',
    payment_method: 'clink',
    currency: 'USD',
    amount: 39_000_000,
    auto_renew: true,
    period: 'month'
  })
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await page.locator('[data-order-checkout-order-close]').click()

  // 续费升级：requires_action 只读 quote，不重复确认；生效后刷新档位。
  state.extensionProductId = 'maps_extension_pro'
  await page.goto('/pricing/?product_kind=maps_extension')
  await expect(page.locator('[data-pricing-buy="maps_extension_pro"]')).toHaveText('Current Plan')
  await expect(page.locator('[data-pricing-buy="maps_extension_business"]')).toHaveText('Upgrade · $12.50')
  await page.locator('[data-pricing-buy="maps_extension_business"]').click()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('charged immediately via ClinkBill')
  await page.locator('[data-order-checkout-submit]').click()
  await expect(page.locator('[data-order-checkout-status="pending_payment"]')).toBeVisible()
  await expect(page.locator('[data-order-checkout-order-message]')).toContainText('current plan stays active')
  await expect(page.locator('[data-order-checkout-order-close]')).toHaveText('Close')
  await page.screenshot({ path: testInfo.outputPath('upgrade-pending.png') })
  state.applyRecurringUpgrade = true
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await expect(page.locator('[data-pricing-buy="maps_extension_business"]')).toHaveText('Current Plan')
  expect(requests.upgradeConfirms).toEqual([{
    product_kind: 'maps_extension', target_product_id: 'maps_extension_business'
  }])
  expect(requests.createOrders).toHaveLength(1)
  await page.locator('[data-order-checkout-order-close]').click()
})

test('site structure: nav, API dropdown, home cards, extension install and legal pages', async ({ page, isMobile }) => {
  // —— 主导航：Pricing / Online 真链接；桌面 API 下拉可展开跳转，移动端 API 子项平铺 ——
  await page.goto('/')
  const scope = page.locator(isMobile ? '[data-mobile-menu]' : '[data-nav-links]')
  if (isMobile) {
    // 960px 断点以下桌面导航隐藏，展开移动菜单后再断言
    await page.locator('[data-menu-toggle]').click()
  }
  await expect(scope.getByRole('link', { name: 'Pricing', exact: true })).toBeVisible()
  await expect(scope.locator('a[data-cta="nav-online"]')).toHaveAttribute('href', '/online-scraper/')

  // 未交付能力：插件介绍页入口照常可达但带 Coming soon；安装动作是 aria-disabled 按钮，
  // 没有链接，鼠标与键盘都不跳转。
  await expect(scope.locator('a[data-cta="nav-extension"]')).toHaveAttribute('href', '/extension/')
  await expect(scope.locator('a[data-cta="nav-extension"]')).toContainText('Coming soon')
  const install = page.locator(isMobile ? '[data-mobile-menu] [data-capability="extensionInstall"]' : '[data-nav] [data-capability="extensionInstall"]')
  await expect(install).toHaveAttribute('aria-disabled', 'true')
  await expect(install).not.toHaveAttribute('href')
  await expect(install).toContainText('Coming soon')
  await install.click({ force: true })
  await install.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(url => new URL(url).pathname === '/')

  if (isMobile) {
    await expect(scope.locator('a[data-cta="nav-api-scraper"]')).toBeVisible()
  } else {
    const apiDropdown = scope.locator('[data-dropdown]')
    await apiDropdown.locator('[data-dropdown-trigger]').click()
    await expect(apiDropdown).toHaveClass(/is-open/)
    await apiDropdown.locator('a[data-cta="nav-api-scraper"]').click()
    await expect(page).toHaveURL(/\/google-maps-scraper-api\//)
  }

  // —— 首页核心：hero 关键词预览入口与四产品卡 ——
  await page.goto('/')
  await expect(page).toHaveTitle(/MapsGrab/)
  await expect(page.locator('h1')).toContainText('Grab Google Maps data')
  const hero = page.locator('[data-home-page] .hero')
  await expect(hero.getByLabel('Search keyword')).toBeVisible()
  await expect(hero.getByRole('button', { name: 'Preview results', exact: true })).toBeVisible()
  for (const cardId of ['extension', 'online', 'api', 'mcp']) {
    await expect(page.locator(`[data-product-card="${cardId}"]`)).toBeVisible()
  }
  // 首页 FAQ 区输出 FAQPage JSON-LD
  const faqSchema = (await page.locator('script[type="application/ld+json"]').allTextContents())
    .map(text => JSON.parse(text) as { '@type'?: string })
    .find(item => item['@type'] === 'FAQPage')
  expect(faqSchema, 'expected FAQPage JSON-LD on home').toBeTruthy()

  // —— Extension 产品页：hero 两个安装入口随能力表灰化 + 版本说明 + 页内安装教程区 ——
  // （页内全部安装 / 购买入口的无动作断言见 landing-pages.spec.ts）
  await page.goto('/extension/')
  await expect(page.locator('h1')).toContainText('Google Maps extractor')
  await expect(page.locator('main .page-hero-actions button[data-capability="extensionInstall"]')).toHaveCount(2)
  await expect(page.locator('[data-release="0.1.0"]')).toBeVisible()
  await expect(page.locator('section#install')).toBeVisible()

  // —— 法务页关键事实 ——
  await page.goto('/terms/')
  await expect(page.locator('h2').filter({ hasText: 'The service is provided as is' })).toBeVisible()
  await expect(page.locator('h2').filter({ hasText: 'Your responsibility' })).toBeVisible()
  await page.goto('/privacy/')
  await expect(page.locator('h2').filter({ hasText: 'What our backend processes' })).toBeVisible()
  await expect(page.locator('h2').filter({ hasText: 'What we never do' })).toBeVisible()
})
