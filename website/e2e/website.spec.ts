/**
 * 网站 e2e（004/U5）。
 *
 * mock 跑：PUBLIC_API_BASE_URL 指向假地址；spec 内 page.route mock 自有
 * /api/client/** 接口，page.context().route mock ClinkBill checkout / portal
 * 外部页（window.open 的新页面不真实出网）。保留两条用例：
 *
 * 1. Pricing 完整购买主路径：普通下单与 Clink 回跳、管理入口、PayPal 固定渠道
 *    补差与回跳刷新、自动续费确认等待后刷新档位及产品线直达。
 * 2. 站点结构路径：主导航 / 桌面 API 下拉 / 移动菜单 / 首页核心产品卡与
 *    FAQPage JSON-LD / Extension 安装链路 / Terms / Privacy 关键事实。
 */
import { expect, test } from '@playwright/test'

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
  product_line: string
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

/** 捕获到的渠道管理请求体。 */
interface CapturedManagementBody {
  product_line: string
}

/** 捕获到的取消订单请求体。 */
interface CapturedCancelBody {
  order_no: string
}

const ORDER_SUCCESS_EPOCH = Date.parse('2026-09-05T00:00:00Z')

/** 三产品线各出一个代表 SKU：Online 一次性 / Extension 自动续费 / API 一次性。 */
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
    productLine: string,
    productName: string,
    amount: number,
    autoRenew: boolean,
    monthlyQuota: number,
    basePriceId: number
  ): MockPlan => ({
    product_class: 1,
    product_id: productId,
    product_line: productLine,
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

test('Pricing full purchase path: billing, upgrades, returns and Manage subscription', async ({ page }, testInfo) => {
  const createOrderBodies: CapturedCreateOrderBody[] = []
  const managementBodies: CapturedManagementBody[] = []
  const cancelBodies: CapturedCancelBody[] = []
  const upgradeCheckoutBodies: { product_line: string; target_product_id: string }[] = []
  const upgradeConfirmBodies: { product_line: string; target_product_id: string }[] = []
  const expiresAt = Date.now() + 30 * 86_400_000
  let onlineProductId: string | null = null
  let extensionProductId = 'maps_extension_pro'
  let applyRecurringUpgrade = false

  await page.addInitScript(() => {
    window.localStorage.setItem('homepage_access_token', 'e2e-pricing-token')
  })

  // 支付成功后 auth/me 返回有效自动续费订阅；购买前该线为 Free。
  let extensionSubscriptionActive = false

  await page.route('**/api/client/auth/me', route =>
    route.fulfill({
      json: envelope({
        email: 'hydra@mapsgrab.test',
        full_name: 'Hydra',
        credits_balance: 0,
        created_at: ORDER_SUCCESS_EPOCH,
        maps_extension_subscription: extensionSubscriptionActive
          ? {
              status: 'active',
              period: 'month',
              display_name: extensionProductId === 'maps_extension_pro' ? 'Maps Pro' : 'Maps Business',
              expires_at: expiresAt,
              auto_renew: true,
              payment_method: 'clink'
            }
          : null,
        maps_online_subscription: onlineProductId ? {
          status: 'active',
          period: 'month',
          display_name: onlineProductId === 'online_basic' ? 'Online Basic' : 'Online Growth',
          expires_at: expiresAt,
          auto_renew: false,
          payment_method: 'paypal'
        } : null
      })
    })
  )

  await page.route('**/api/client/subscription/checkout-configs', route =>
    route.fulfill({ json: envelope({ checkout_configs: [
      ...buildPlans(),
      { ...buildPlans()[0], product_id: 'online_growth', product_name: 'Online Growth' },
      { ...buildPlans()[1], product_id: 'maps_extension_business', product_name: 'Maps Business' }
    ] }) })
  )

  await page.route('**/api/client/subscription/upgrade-quote?*', route => {
    const params = new URL(route.request().url()).searchParams
    const target = params.get('target_product_id')
    const online = params.get('product_line') === 'maps_online'
    if (!online && applyRecurringUpgrade) {
      extensionProductId = 'maps_extension_business'
    }
    const current = online ? onlineProductId : extensionProductId
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
    upgradeCheckoutBodies.push(route.request().postDataJSON())
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
    upgradeConfirmBodies.push(route.request().postDataJSON())
    return route.fulfill({ json: envelope({
      status: 'requires_action', action: { type: 'wait', url: null }
    }) })
  })

  await page.route('**/api/client/order/create', route => {
    createOrderBodies.push(route.request().postDataJSON() as CapturedCreateOrderBody)
    extensionSubscriptionActive = true
    return route.fulfill({
      json: envelope({
        order_no: 'CLINK-E2E-1',
        amount: 39_000_000,
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
      onlineProductId = 'online_growth'
    }
    return route.fulfill({
      json: envelope({
        order_no: upgrade ? 'PAYPAL-UPGRADE-1' : 'CLINK-E2E-1',
        product_class: 1,
        product_id: upgrade ? 'online_growth' : 'maps_extension_pro',
        product_name: 'Maps Pro',
        amount: upgrade ? 12_500_000 : 39_000_000,
        currency: 'USD',
        order_status: 2,
        callback_status: 3,
        payment_method: 'clink',
        paid_at: ORDER_SUCCESS_EPOCH,
        created_at: ORDER_SUCCESS_EPOCH,
        expired_at: ORDER_SUCCESS_EPOCH + 1_800_000
      })
    })
  })

  await page.route('**/api/client/subscription/management', route => {
    managementBodies.push(route.request().postDataJSON() as CapturedManagementBody)
    return route.fulfill({
      json: envelope({ url: 'https://uat-portal.clinkbill.com/portal/sess_e2e_1' })
    })
  })

  await page.route('**/api/client/order/cancel', route => {
    cancelBodies.push(route.request().postDataJSON() as CapturedCancelBody)
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

  await page.goto('/pricing/')
  await expectE2eBrowserIdentity(page, testInfo, expect)

  // 登录态恢复：账号胶囊展示邮箱，三产品线配置加载后付费卡可点。
  await expect(page.locator('[data-pricing-account-email]')).toContainText('hydra@mapsgrab.test')
  await expect(page.locator('[data-pricing-buy="online_basic"]')).toBeEnabled()
  await expect(page.locator('[data-pricing-buy="maps_extension_pro"]')).toBeEnabled()
  await expect(page.locator('[data-pricing-buy="api_professional"]')).toBeEnabled()

  // 购买前 extension 线无有效自动续费订阅：Manage subscription 隐藏。
  await expect(page.locator('[data-pricing-manage-subscription]')).toBeHidden()
  await page.locator('[data-pricing-tab="extension"]').click()
  await expect(page.locator('[data-pricing-manage-subscription]')).toBeHidden()

  // 单一计费模式对照：Online 一次性商品 detail 是 One-time payment。
  await page.locator('[data-pricing-tab="online"]').click()
  await page.locator('[data-pricing-buy="online_basic"]').click()
  const onlineUsage = page.locator('[data-order-checkout-selected-usage]')
  await expect(onlineUsage).toContainText('One-time payment')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-order-checkout-payment-dialog]')).toBeHidden()

  // Extension Pro（自动续费商品）：detail 是 Auto-renews until canceled。
  await page.locator('[data-pricing-tab="extension"]').click()
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

  const checkoutPopup = await checkoutPopupPromise
  await expect(checkoutPopup).toHaveURL(/uat-checkout\.clinkbill\.com/)

  // 下单请求必须携带 auto_renew + period，且与商品单一计费模式一致。
  expect(createOrderBodies).toHaveLength(1)
  expect(createOrderBodies[0]).toMatchObject({
    product_class: 1,
    product_id: 'maps_extension_pro',
    payment_method: 'clink',
    currency: 'USD',
    amount: 39_000_000,
    auto_renew: true,
    period: 'month'
  })

  // 订单轮询确认支付成功，弹窗切换 success 态；账号区刷新出有效订阅摘要。
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await expect(page.locator('[data-order-checkout-success-panel]')).toBeVisible()
  const manageButton = page.locator('[data-pricing-manage-subscription]')
  await expect(page.locator('[data-pricing-user-plan]')).toContainText('Maps Pro')

  // 关闭 success 弹窗后，账号区出现 Manage subscription 入口。
  await page.locator('[data-order-checkout-order-close]').click()
  await expect(page.locator('[data-order-checkout-modal]')).toBeHidden()
  await expect(manageButton).toBeVisible()
  const portalPopupPromise = page.waitForEvent('popup')
  await manageButton.click()
  const portalPopup = await portalPopupPromise
  await expect(portalPopup).toHaveURL(/uat-portal\.clinkbill\.com/)
  // 请求只含 product_line，渠道选择完全由服务端订阅实例决定。
  expect(managementBodies).toEqual([{ product_line: 'maps_extension' }])

  // 复用同一用户路径验证报价定档、固定 PayPal 补差和既有回跳后刷新。
  onlineProductId = 'online_basic'
  await page.goto('/pricing/?product_line=maps_online')
  await expect(page.locator('[data-pricing-buy="online_basic"]')).toHaveText('Current Plan')
  await expect(page.locator('[data-pricing-buy="online_lite"]')).toBeDisabled()
  await expect(page.locator('[data-pricing-buy="online_growth"]')).toHaveText('Upgrade · $12.50')
  await expect(page.locator('[data-pricing-buy="api_professional"]')).toBeEnabled()
  await page.locator('[data-pricing-buy="online_growth"]').click()
  await expect(page.locator('[data-order-checkout-channel-list]')).toBeHidden()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('One-time difference via PayPal')
  await expect(page.locator('[data-order-checkout-selected-price]')).toHaveText('$12.50')
  await page.screenshot({ path: testInfo.outputPath('upgrade-checkout.png') })
  const upgradePopupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()
  const upgradePopup = await upgradePopupPromise
  await expect(upgradePopup).toHaveURL(/www\.paypal\.com\/checkoutnow/)
  expect(upgradeCheckoutBodies).toEqual([{
    product_line: 'maps_online', target_product_id: 'online_growth'
  }])
  await upgradePopup.goto(`${new URL(page.url()).origin}/paypal/success/?order_no=PAYPAL-UPGRADE-1`)
  await expect(upgradePopup.locator('[data-paypal-return-title]')).toHaveText('Subscription activated')
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await expect(page.locator('[data-pricing-buy="online_growth"]')).toHaveText('Current Plan')
  await expect(page.locator('[data-pricing-user-plan]')).toHaveText('Online Growth')
  await page.locator('[data-order-checkout-order-close]').click()

  // 插件同名 product_line 参数直达 Extension；requires_action 只读 quote，不重复确认。
  await page.goto('/pricing/?product_line=maps_extension')
  await expect(page.locator('[data-pricing-tab="extension"]')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('[data-pricing-manage-subscription]')).toBeVisible()
  await expect(page.locator('[data-pricing-buy="maps_extension_pro"]')).toHaveText('Current Plan')
  await expect(page.locator('[data-pricing-buy="maps_extension_business"]')).toHaveText('Upgrade · $12.50')
  await page.locator('[data-pricing-buy="maps_extension_business"]').click()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('charged immediately via ClinkBill')
  await page.locator('[data-order-checkout-submit]').click()
  await expect(page.locator('[data-order-checkout-status="pending_payment"]')).toBeVisible()
  await expect(page.locator('[data-order-checkout-order-message]')).toContainText('current plan stays active')
  await expect(page.locator('[data-order-checkout-order-close]')).toHaveText('Close')
  await expect(page.locator('[data-pricing-user-plan]')).toHaveText('Maps Pro')
  await page.screenshot({ path: testInfo.outputPath('upgrade-pending.png') })
  applyRecurringUpgrade = true
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await expect(page.locator('[data-pricing-user-plan]')).toHaveText('Maps Business')
  await expect(page.locator('[data-pricing-buy="maps_extension_business"]')).toHaveText('Current Plan')
  expect(upgradeConfirmBodies).toEqual([{
    product_line: 'maps_extension', target_product_id: 'maps_extension_business'
  }])
  expect(createOrderBodies).toHaveLength(1)
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
  expect(cancelBodies).toEqual([{ order_no: 'CLINK-E2E-1' }])
})

test('site structure: nav, API dropdown, home cards, extension install and legal pages', async ({ page, isMobile }) => {
  // —— 主导航：Pricing / Online 真链接；桌面 API 下拉可展开跳转，移动端 API 子项平铺 ——
  await page.goto('/')
  const scope = isMobile ? page.locator('.mobile-nav') : page.locator('.nav-links')
  if (isMobile) {
    // 960px 断点以下桌面导航隐藏，展开移动菜单后再断言
    await page.locator('.mobile-menu-btn').click()
  }
  await expect(scope.locator('a').filter({ hasText: 'Pricing' })).toBeVisible()
  await expect(scope.locator('a[data-cta="nav-online"]')).toHaveAttribute('href', '/online-scraper/')
  if (isMobile) {
    await expect(scope.locator('a[data-cta="nav-api-scraper"]')).toBeVisible()
  } else {
    const apiBtn = page.locator('.nav-api-switcher .lang-btn')
    const dropdown = page.locator('.nav-api-switcher .lang-dropdown')
    await apiBtn.click()
    await expect(dropdown).toHaveClass(/show/)
    await dropdown.locator('a[data-cta="nav-api-scraper"]').click()
    await expect(page).toHaveURL(/\/google-maps-scraper-api\//)
  }

  // —— 首页核心：hero 双 CTA 与三产品卡 ——
  await page.goto('/')
  await expect(page).toHaveTitle(/MapsGrab/)
  await expect(page.locator('h1')).toContainText('Grab Google Maps business data')
  const hero = page.locator('[data-home-page] .hero')
  await expect(hero.locator('a[data-cta="home-hero-install"]')).toBeVisible()
  await expect(hero.locator('a[data-cta="home-hero-product"]')).toBeVisible()
  for (const cardId of ['extension', 'online', 'api']) {
    await expect(page.locator(`[data-product-card="${cardId}"]`)).toBeVisible()
  }
  // 首页 FAQ 区输出 FAQPage JSON-LD
  const faqSchema = (await page.locator('script[type="application/ld+json"]').allTextContents())
    .map(text => JSON.parse(text) as { '@type'?: string })
    .find(item => item['@type'] === 'FAQPage')
  expect(faqSchema, 'expected FAQPage JSON-LD on home').toBeTruthy()

  // —— Extension 产品页：hero 双按钮分流 + 版本说明 + 页内安装教程区 ——
  await page.goto('/extension/')
  await expect(page.locator('h1')).toContainText('Google Maps extractor')
  await expect(page.locator('a[data-cta="extension-hero-edge-install"]')).toHaveAttribute('href', '#')
  await expect(page.locator('a[data-cta="extension-hero-chrome-install"]')).toHaveAttribute(
    'href',
    '#install'
  )
  await expect(page.locator('[data-release="0.1.0 (pre-release)"]')).toBeVisible()
  await expect(page.locator('section#install')).toBeVisible()

  // —— 法务页关键事实 ——
  await page.goto('/terms/')
  await expect(page.locator('h2').filter({ hasText: 'The service is provided as is' })).toBeVisible()
  await expect(page.locator('h2').filter({ hasText: 'Your responsibility' })).toBeVisible()
  await page.goto('/privacy/')
  await expect(page.locator('h2').filter({ hasText: 'What our backend processes' })).toBeVisible()
  await expect(page.locator('h2').filter({ hasText: 'What we never do' })).toBeVisible()
})
