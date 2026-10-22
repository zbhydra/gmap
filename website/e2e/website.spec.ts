/** 网站购买与入口 E2E；自有 API 和 PayPal 外部页替身只证明前端交互。 */
import { expect, test, type Page } from '@playwright/test'

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
  /** 当前有效的插件单次套餐；null 为 Free。 */
  extensionProductId: string | null
  paymentConfirmed: boolean
}

/** 购买用例捕获的请求体。 */
interface PurchaseMockRequests {
  createOrders: CapturedCreateOrderBody[]
  cancels: CapturedCancelBody[]
  upgradeCheckouts: CapturedUpgradeBody[]
}

const ORDER_SUCCESS_EPOCH = Date.parse('2026-09-05T00:00:00Z')

/** 三条产品线均为 PayPal 单次购买。 */
function buildPlans(): MockPlan[] {
  const channels = (basePriceId: number, amount: number): MockPaymentChannel[] => [
    {
      payment_method: 'paypal',
      payment_method_name: 'PayPal',
      product_price_id: basePriceId,
      currency: 'USD',
      amount
    },
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
    plan('maps_extension_pro', 'maps_extension', 'Maps Pro', 39_000_000, false, 100_000, 201),
    plan('api_professional', 'maps_api', 'API Professional', 65_000_000, false, 5_000, 401)
  ]
}

/**
 * 安装购买用例共用的登录态与后端 / 支付页 mock。
 *
 * 普通订单号固定 PAYPAL-E2E-1，状态按最近一次下单的商品返回；PAYPAL-UPGRADE-1 是 Online 补差单，
 * 查询即视为已支付并把 Online 订阅切到 Growth。
 */
async function mockPurchaseBackend(page: Page): Promise<{ state: PurchaseMockState; requests: PurchaseMockRequests }> {
  const state: PurchaseMockState = { onlineProductId: null, extensionProductId: null, paymentConfirmed: false }
  const requests: PurchaseMockRequests = { createOrders: [], cancels: [], upgradeCheckouts: [] }
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
              auto_renew: false,
              payment_method: 'paypal'
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
    const current = online ? state.onlineProductId : state.extensionProductId
    const available = online
      ? current === 'online_basic' && target === 'online_growth'
      : current === 'maps_extension_pro' && target === 'maps_extension_business'
    return route.fulfill({ json: envelope({
      available,
      reason: available ? null : 'not_higher_tier',
      current_product_id: current,
      target_product_id: target,
      payment_method: 'paypal',
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

  await page.route('**/api/client/order/create', route => {
    const body = route.request().postDataJSON() as CapturedCreateOrderBody
    requests.createOrders.push(body)
    state.paymentConfirmed = false
    return route.fulfill({
      json: envelope({
        order_no: 'PAYPAL-E2E-1',
        amount: body.amount,
        currency: 'USD',
        expired_at: Date.now() + 1_800_000,
        support_mail: '',
        payment_data: {
          approval_url: 'https://www.paypal.com/checkoutnow?token=one-time'
        }
      })
    })
  })

  await page.context().route('**/api/client/order/paypal/confirm', route => {
    state.paymentConfirmed = true
    return route.fulfill({ json: envelope({ order_no: 'PAYPAL-E2E-1' }) })
  })

  await page.context().route('**/api/client/order/status/**', route => {
    const upgrade = route.request().url().endsWith('PAYPAL-UPGRADE-1')
    const productId = upgrade
      ? requests.upgradeCheckouts.at(-1)?.target_product_id
      : requests.createOrders.at(-1)?.product_id
    const plan = plans.find(item => item.product_id === productId)
    const paid = upgrade || state.paymentConfirmed
    if (paid && plan?.product_kind === 'maps_online') state.onlineProductId = productId ?? null
    if (paid && plan?.product_kind === 'maps_extension') state.extensionProductId = productId ?? null
    return route.fulfill({ json: envelope({
      order_no: upgrade ? 'PAYPAL-UPGRADE-1' : 'PAYPAL-E2E-1',
      product_class: 1, product_id: productId,
      product_kind: plan?.product_kind, product_name: plan?.product_name,
      amount: upgrade ? 12_500_000 : plan?.display_amount,
      currency: 'USD', order_status: paid ? 2 : 1, callback_status: paid ? 3 : 1,
      payment_method: 'paypal', paid_at: paid ? ORDER_SUCCESS_EPOCH : null,
      created_at: ORDER_SUCCESS_EPOCH, expired_at: Date.now() + 1_800_000
    }) })
  })

  await page.route('**/api/client/order/cancel', route => {
    requests.cancels.push(route.request().postDataJSON() as CapturedCancelBody)
    return route.fulfill({ json: envelope({}) })
  })

  await page.context().route('https://www.paypal.com/checkoutnow?*', route =>
    route.fulfill({ contentType: 'text/html', body: '<html><title>PayPal Checkout</title></html>' })
  )

  return { state, requests }
}

test('Pricing Online purchase path: order, upgrade and payment returns', async ({ page }, testInfo) => {
  const { state, requests } = await mockPurchaseBackend(page)

  await page.goto('/pricing/')
  await expectE2eBrowserIdentity(page, testInfo, expect)

  // 登录与配置加载后，三条产品线共用单次结账。
  await expect(page.locator('[data-pricing-buy="online_basic"]')).toBeEnabled()
  await expect(page.locator('[data-pricing-panel="extension"] [data-pricing-buy]')).toHaveCount(2)

  // 单次结账只展示 PayPal。
  await page.locator('[data-pricing-buy="online_basic"]').click()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('One-time payment')
  await expect(page.locator('[data-order-checkout-payment-method="paypal"]')).toHaveCount(1)
  const checkoutPopupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()

  const checkoutPopup = await checkoutPopupPromise
  await expect(checkoutPopup).toHaveURL(/www\.paypal\.com\/checkoutnow/)
  await checkoutPopup.goto(`${new URL(page.url()).origin}/paypal/success/?order_no=PAYPAL-E2E-1`)
  await expect(checkoutPopup.locator('[data-paypal-return-title]')).toHaveText('Subscription activated')

  // 下单请求必须携带 auto_renew + period，且与商品单一计费模式一致。
  expect(requests.createOrders).toHaveLength(1)
  expect(requests.createOrders[0]).toMatchObject({
    product_class: 1,
    product_id: 'online_basic',
    payment_method: 'paypal',
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

  // 取消回跳落到取消态，并通知服务端关闭该订单。
  await page.goto('/paypal/cancel/?order_no=PAYPAL-CANCEL-1')
  expect(requests.cancels).toEqual([{ order_no: 'PAYPAL-CANCEL-1' }])
})

test('Pricing extension purchase uses one-time PayPal and activates after return', async ({ page }) => {
  const { requests } = await mockPurchaseBackend(page)
  await page.goto('/pricing/?product_kind=maps_extension')
  await expect(page.locator('[data-pricing-tab="extension"]')).toHaveAttribute('aria-selected', 'true')
  await page.locator('[data-pricing-buy="maps_extension_pro"]').click()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('One-time payment')
  await expect(page.locator('[data-order-checkout-payment-method="paypal"]')).toHaveCount(1)
  const popupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()
  const popup = await popupPromise
  await expect(popup).toHaveURL(/www\.paypal\.com\/checkoutnow/)
  expect(requests.createOrders).toEqual([{
    product_class: 1, product_id: 'maps_extension_pro', payment_method: 'paypal',
    currency: 'USD', amount: 39_000_000, auto_renew: false, period: 'month'
  }])
  await popup.goto(`${new URL(page.url()).origin}/paypal/success/?order_no=PAYPAL-E2E-1`)
  await expect(popup.locator('[data-paypal-return-title]')).toHaveText('Subscription activated')
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await page.locator('[data-order-checkout-order-close]').click()
  await expect(page.locator('[data-pricing-buy="maps_extension_pro"]')).toHaveText('Current Plan')
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

  await expect(scope.locator('a[data-cta="nav-extension"]')).toHaveAttribute('href', '/extension/')
  const install = page.locator(isMobile ? '[data-cta="mobile-install"]' : '[data-cta="nav-install"]')
  await expect(install).toHaveAttribute('href', '/extension/#install')

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

  // —— Extension 产品页：下载与教程入口、版本说明、安装区 ——
  await page.goto('/extension/')
  await expect(page.locator('h1')).toContainText('Google Maps extractor')
  await expect(page.locator('main .page-hero-actions a')).toHaveCount(2)
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
