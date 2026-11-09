/** 官网购买与回跳 E2E；支付服务与收银台替身仅证明前端交互，不证明渠道扣款。 */
import { expect, test, type Page } from '@playwright/test'
import type { SubscriptionUpgradeResult } from '../src/components/pricing/pricing-checkout'
import { expectE2eBrowserIdentity, registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

function envelope<T extends object>(data: T): { code: number; data: T } {
  return { code: 10000, data }
}

interface MockPaymentChannel {
  payment_method: string
  payment_method_name: string
  product_price_id: number
  currency: string
  amount: number
}

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

interface CapturedCreateOrderBody {
  product_class: number
  product_id: string
  payment_method: string
  currency: string
  amount: number
  auto_renew: boolean
  period: string
}

interface CapturedUpgradeBody {
  product_kind: string
  target_product_id: string
}

/** 可在用户路径中推进的服务端事实，收银台本身不模拟收款。 */
interface PurchaseMockState {
  onlineProductId: string | null
  extensionProductId: string | null
  onlineAutoRenew: boolean
  onlinePaymentMethod: 'stripe' | 'clink' | 'paypal'
  paymentConfirmed: boolean
  renewalResumeRequired: boolean
  quoteUnavailable: boolean
  onlineExpiresAt: number
  confirmResult: SubscriptionUpgradeResult
}

interface PurchaseMockRequests {
  createOrders: CapturedCreateOrderBody[]
  cancels: { order_no: string }[]
  upgradeCheckouts: CapturedUpgradeBody[]
  upgradeConfirms: CapturedUpgradeBody[]
  management: { product_kind: string }[]
  paypalConfirms: number
}

const ORDER_SUCCESS_EPOCH = Date.parse('2026-09-05T00:00:00Z')
const ESTIMATED_EXPIRY = Date.now() + 30 * 86_400_000
const ACTUAL_EXPIRY = Date.now() + 31 * 86_400_000

/** 混合商品模式与非默认渠道顺序，前端必须按配置和默认渠道规则展示。 */
function buildPlans(): MockPlan[] {
  const plan = (id: string, kind: string, name: string, amount: number, autoRenew: boolean, quota: number, priceId: number): MockPlan => ({
    product_class: 1, product_id: id, product_kind: kind, product_name: name,
    period: 'month', auto_renew: autoRenew, display_currency: 'USD', display_amount: amount, monthly_quota: quota,
    payment_channels: ['clink', 'stripe'].map((method, index) => ({
      payment_method: method, payment_method_name: method === 'stripe' ? 'Stripe' : 'ClinkBill',
      product_price_id: priceId + index, currency: 'USD', amount
    }))
  })
  return [
    plan('online_basic', 'maps_online', 'Online Basic', 49_000_000, false, 80_000, 301),
    plan('online_growth', 'maps_online', 'Online Growth', 99_000_000, false, 250_000, 311),
    plan('maps_extension_pro', 'maps_extension', 'Maps Pro', 39_000_000, true, 100_000, 201),
    plan('maps_extension_business', 'maps_extension', 'Maps Business', 99_000_000, true, 500_000, 211),
    plan('api_professional', 'maps_api', 'API Professional', 65_000_000, false, 5_000, 401)
  ]
}

async function mockPurchaseBackend(page: Page): Promise<{ state: PurchaseMockState; requests: PurchaseMockRequests }> {
  const state: PurchaseMockState = {
    onlineProductId: null, extensionProductId: null, onlineAutoRenew: false, onlinePaymentMethod: 'stripe',
    paymentConfirmed: false, renewalResumeRequired: false, quoteUnavailable: false,
    onlineExpiresAt: ESTIMATED_EXPIRY, confirmResult: { status: 'succeeded', action: null }
  }
  const requests: PurchaseMockRequests = { createOrders: [], cancels: [], upgradeCheckouts: [], upgradeConfirms: [], management: [], paypalConfirms: 0 }
  const plans = buildPlans()
  await page.addInitScript(() => window.localStorage.setItem('homepage_access_token', 'e2e-pricing-token'))
  await page.context().route('**/api/client/auth/me', route => route.fulfill({ json: envelope({
    email: 'hydra@mapexporter.test', full_name: 'Hydra', credits_balance: 0, created_at: ORDER_SUCCESS_EPOCH,
    maps_extension_subscription: state.extensionProductId ? {
      status: 'active', period: 'month', display_name: 'Maps Pro', expires_at: ACTUAL_EXPIRY,
      auto_renew: true, payment_method: 'clink'
    } : null,
    maps_online_subscription: state.onlineProductId ? {
      status: 'active', period: 'month', display_name: state.onlineProductId === 'online_basic' ? 'Online Basic' : 'Online Growth',
      expires_at: state.onlineExpiresAt, auto_renew: state.onlineAutoRenew, payment_method: state.onlinePaymentMethod
    } : null
  }) }))
  await page.route('**/api/client/subscription/checkout-configs', route => route.fulfill({ json: envelope({ checkout_configs: plans }) }))
  await page.route('**/api/client/subscription/upgrade-quote?*', route => {
    const params = new URL(route.request().url()).searchParams
    const target = params.get('target_product_id')
    const online = params.get('product_kind') === 'maps_online'
    const current = online ? state.onlineProductId : state.extensionProductId
    const higher = online ? current === 'online_basic' && target === 'online_growth' : current === 'maps_extension_pro' && target === 'maps_extension_business'
    const reason = !current ? 'no_active_subscription'
      : !higher ? 'not_higher_tier'
      : state.onlinePaymentMethod === 'paypal' || state.quoteUnavailable ? 'channel_unavailable'
      : state.renewalResumeRequired ? 'renewal_resume_required' : null
    return route.fulfill({ json: envelope({
      available: reason === null, reason, current_product_id: current, target_product_id: target,
      payment_method: online ? state.onlinePaymentMethod : 'clink', currency: 'USD',
      amount: reason === null ? 54_900_000 : null, expires_at: ESTIMATED_EXPIRY
    }) })
  })
  await page.route('**/api/client/subscription/upgrade/checkout', route => {
    requests.upgradeCheckouts.push(route.request().postDataJSON() as CapturedUpgradeBody)
    return route.fulfill({ json: envelope({
      order_no: 'STRIPE-UPGRADE-1', amount: 54_900_000, currency: 'USD', expired_at: Date.now() + 1_800_000,
      support_mail: '', payment_data: { checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_upgrade' }
    }) })
  })
  await page.route('**/api/client/subscription/upgrade/confirm', route => {
    requests.upgradeConfirms.push(route.request().postDataJSON() as CapturedUpgradeBody)
    if (state.renewalResumeRequired) return route.fulfill({ json: { code: 10004, msg: 'Resume renewal first', data: { reason: 'renewal_resume_required' } } })
    if (state.confirmResult.status === 'succeeded') {
      state.onlineProductId = 'online_growth'
      state.onlineExpiresAt = ACTUAL_EXPIRY
    }
    return route.fulfill({ json: envelope(state.confirmResult) })
  })
  await page.route('**/api/client/order/create', route => {
    const body = route.request().postDataJSON() as CapturedCreateOrderBody
    requests.createOrders.push(body)
    return route.fulfill({ json: envelope({
      order_no: 'CHECKOUT-E2E-1', amount: body.amount, currency: body.currency,
      expired_at: Date.now() + 1_800_000, support_mail: '',
      payment_data: { checkoutUrl: body.payment_method === 'stripe' ? 'https://checkout.stripe.com/c/pay/cs_test_purchase' : 'https://uat-checkout.clinkbill.com/pay/e2e' }
    }) })
  })
  await page.context().route('**/api/client/order/paypal/confirm', route => {
    requests.paypalConfirms += 1
    return route.fulfill({ json: envelope({}) })
  })
  await page.context().route('**/api/client/order/status/**', route => {
    const upgrade = route.request().url().endsWith('STRIPE-UPGRADE-1')
    const productId = upgrade ? requests.upgradeCheckouts.at(-1)?.target_product_id : requests.createOrders.at(-1)?.product_id
    const plan = plans.find(item => item.product_id === productId)
    if (state.paymentConfirmed && plan?.product_kind === 'maps_online') {
      state.onlineProductId = productId ?? null
      state.onlineExpiresAt = ACTUAL_EXPIRY
    }
    if (state.paymentConfirmed && plan?.product_kind === 'maps_extension') state.extensionProductId = productId ?? null
    return route.fulfill({ json: envelope({
      order_no: upgrade ? 'STRIPE-UPGRADE-1' : 'CHECKOUT-E2E-1', product_class: 1, product_id: productId,
      product_kind: plan?.product_kind, product_name: plan?.product_name, amount: upgrade ? 54_900_000 : plan?.display_amount,
      currency: 'USD', order_status: state.paymentConfirmed ? 2 : 1, callback_status: state.paymentConfirmed ? 3 : 1,
      payment_method: upgrade ? 'stripe' : requests.createOrders.at(-1)?.payment_method,
      paid_at: state.paymentConfirmed ? ORDER_SUCCESS_EPOCH : null, created_at: ORDER_SUCCESS_EPOCH, expired_at: Date.now() + 1_800_000
    }) })
  })
  await page.context().route('**/api/client/order/cancel', route => {
    requests.cancels.push(route.request().postDataJSON() as { order_no: string })
    return route.fulfill({ json: envelope({}) })
  })
  await page.route('**/api/client/subscription/management', route => {
    requests.management.push(route.request().postDataJSON() as { product_kind: string })
    return route.fulfill({ json: envelope({ url: 'https://billing.stripe.com/p/session/e2e' }) })
  })
  for (const url of ['https://checkout.stripe.com/**', 'https://uat-checkout.clinkbill.com/**', 'https://billing.stripe.com/**']) {
    await page.context().route(url, route => route.fulfill({ contentType: 'text/html', body: '<html><title>Payment UI substitute</title></html>' }))
  }
  return { state, requests }
}

test('Pricing Online purchase path: Stripe checkout, cancel, delayed success and one-time upgrade', async ({ page }, testInfo) => {
  const { state, requests } = await mockPurchaseBackend(page)
  await page.goto('/pricing/')
  await expectE2eBrowserIdentity(page, testInfo, expect)
  await expect(page.locator('[data-plan-card="online_basic"] .price-period')).toContainText('One-time payment')
  await page.locator('[data-pricing-buy="online_basic"]').click()
  await expect(page.locator('[data-order-checkout-payment-method="paypal"]')).toHaveCount(0)
  await expect(page.locator('[data-order-checkout-payment-method="stripe"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-order-checkout-payment-method="clink"]')).toHaveCount(1)
  const popupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()
  const popup = await popupPromise
  await expect(popup).toHaveURL(/checkout\.stripe\.com/)
  await popup.goto(`${new URL(page.url()).origin}/stripe/cancel/?order_no=CHECKOUT-E2E-1`)
  await expect(popup.locator('[data-payment-return-title]')).toHaveText('Checkout closed')
  await expect(page.locator('[data-order-checkout-status="pending_payment"]')).toBeVisible()
  expect(requests.cancels).toEqual([])
  await popup.goto(`${new URL(page.url()).origin}/stripe/success/?order_no=CHECKOUT-E2E-1`)
  await expect(popup.locator('[data-payment-return-state="waiting"]')).toBeVisible()
  await expect(page.locator('[data-order-checkout-status="success"]')).toHaveCount(0)
  state.paymentConfirmed = true
  await expect(popup.locator('[data-payment-return-title]')).toHaveText('Plan activated')
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  expect(requests.paypalConfirms).toBe(0)
  expect(requests.createOrders).toEqual([{
    product_class: 1, product_id: 'online_basic', payment_method: 'stripe', currency: 'USD',
    amount: 49_000_000, auto_renew: false, period: 'month'
  }])
  await popup.close()
  await page.locator('[data-order-checkout-order-close]').click()
  await expect(page.locator('[data-pricing-buy="online_basic"]')).toHaveText('Current Plan')
  await expect(page.locator('[data-pricing-buy="online_growth"]')).toHaveText('Upgrade · $54.90')
  await page.locator('[data-pricing-buy="online_growth"]').click()
  await expect(page.locator('[data-order-checkout-channel-list]')).toBeHidden()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('minus your remaining plan value')
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('Estimated new expiry')
  state.paymentConfirmed = false
  const upgradePopupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()
  const upgradePopup = await upgradePopupPromise
  await expect(upgradePopup).toHaveURL(/checkout\.stripe\.com/)
  expect(requests.upgradeCheckouts).toEqual([{ product_kind: 'maps_online', target_product_id: 'online_growth' }])
  await upgradePopup.goto(`${new URL(page.url()).origin}/stripe/success/?order_no=STRIPE-UPGRADE-1`)
  await expect(upgradePopup.locator('[data-payment-return-state="waiting"]')).toBeVisible()
  await expect(page.locator('[data-pricing-buy="online_basic"]')).toHaveText('Current Plan')
  state.paymentConfirmed = true
  await expect(page.locator('[data-pricing-buy="online_growth"]')).toHaveText('Current Plan')
  await expect(page.locator('[data-order-checkout-success-secondary]')).toContainText(new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(ACTUAL_EXPIRY))
  await upgradePopup.close()
  await page.locator('[data-order-checkout-order-close]').click()
  // 存量 PayPal 报价不开放升档；历史取消回跳仍走既有接口。
  state.onlinePaymentMethod = 'paypal'
  state.onlineProductId = 'online_basic'
  await page.goto('/pricing/')
  await expect(page.locator('[data-pricing-buy="online_growth"]')).toBeDisabled()
  await expect(page.locator('[data-plan-error="online_growth"]')).toContainText('PayPal')
  await page.goto('/paypal/cancel/?order_no=PAYPAL-HISTORICAL')
  await expect.poll(() => requests.cancels).toEqual([{ order_no: 'PAYPAL-HISTORICAL' }])
})

test('Pricing extension purchase: configured auto-renewal via Clink and existing returns', async ({ page }) => {
  const { state, requests } = await mockPurchaseBackend(page)
  await page.goto('/pricing/?product_kind=maps_extension')
  await expect(page.locator('[data-plan-card="maps_extension_pro"] .price-period')).toContainText('Auto-renews until canceled')
  await page.locator('[data-pricing-buy="maps_extension_pro"]').click()
  await page.locator('[data-order-checkout-payment-method="clink"]').click()
  await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('Auto-renews until canceled')
  const popupPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-submit]').click()
  const popup = await popupPromise
  await expect(popup).toHaveURL(/uat-checkout\.clinkbill\.com/)
  expect(requests.createOrders[0]).toMatchObject({ payment_method: 'clink', auto_renew: true, period: 'month' })
  state.paymentConfirmed = true
  await popup.goto(`${new URL(page.url()).origin}/clink/success/?order_no=CHECKOUT-E2E-1`)
  await expect(popup.locator('[data-payment-return-title]')).toHaveText('Plan activated')
  await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
  await popup.close()
  await page.goto('/clink/cancel/?order_no=CLINK-CANCEL-1')
  await expect.poll(() => requests.cancels).toEqual([{ order_no: 'CLINK-CANCEL-1' }])
})

test('Pricing recurring upgrade: renewal gate, confirm results and quote-only completion', async ({ page }) => {
  const { state, requests } = await mockPurchaseBackend(page)
  state.onlineProductId = 'online_basic'
  state.onlineAutoRenew = true
  state.renewalResumeRequired = true
  await page.goto('/pricing/')
  await expect(page.locator('[data-pricing-buy="online_growth"]')).toBeDisabled()
  await expect(page.locator('[data-plan-error="online_growth"]')).toContainText('Restore auto-renewal')
  const portalPromise = page.waitForEvent('popup')
  await page.locator('[data-pricing-resume="online_growth"]').click()
  const portal = await portalPromise
  await expect(portal).toHaveURL(/billing\.stripe\.com/)
  await portal.close()
  expect(requests.management).toEqual([{ product_kind: 'maps_online' }])

  state.renewalResumeRequired = false
  await page.reload()
  await page.locator('[data-pricing-buy="online_growth"]').click()
  state.renewalResumeRequired = true
  await page.locator('[data-order-checkout-submit]').click()
  await expect(page.locator('[data-order-checkout-payment-error]')).toContainText('Restore auto-renewal')
  const blockedPortalPromise = page.waitForEvent('popup')
  await page.locator('[data-order-checkout-resume]').click()
  const blockedPortal = await blockedPortalPromise
  await expect(blockedPortal).toHaveURL(/billing\.stripe\.com/)
  await blockedPortal.close()
  await page.locator('[data-order-checkout-back]').click()
  state.renewalResumeRequired = false

  const results: SubscriptionUpgradeResult[] = [
    { status: 'failed', action: null },
    { status: 'requires_action', action: { type: 'wait', url: null } },
    { status: 'requires_action', action: { type: 'redirect', url: 'https://checkout.stripe.com/c/pay/cs_test_action' } },
    { status: 'succeeded', action: null }
  ]
  for (const result of results) {
    state.onlineProductId = 'online_basic'
    state.confirmResult = result
    state.quoteUnavailable = false
    await page.reload()
    await page.locator('[data-pricing-buy="online_growth"]').click()
    await expect(page.locator('[data-order-checkout-selected-usage]')).toContainText('charged immediately via Stripe')
    const actionPopupPromise = result.action?.type === 'redirect' ? page.waitForEvent('popup') : null
    await page.locator('[data-order-checkout-submit]').click()
    if (result.status === 'requires_action') {
      await expect(page.locator('[data-order-checkout-status="pending_payment"]')).toBeVisible()
      const confirmCount = requests.upgradeConfirms.length
      state.quoteUnavailable = true
      await page.waitForResponse(response => response.url().includes('/subscription/upgrade-quote?') && new URL(response.url()).searchParams.get('target_product_id') === 'online_growth')
      await expect(page.locator('[data-order-checkout-status="success"]')).toHaveCount(0)
      if (actionPopupPromise) {
        const actionPopup = await actionPopupPromise
        await expect(actionPopup).toHaveURL(/checkout\.stripe\.com/)
        await actionPopup.close()
      }
      state.onlineProductId = 'online_growth'
      state.onlineExpiresAt = ACTUAL_EXPIRY
      await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
      expect(requests.upgradeConfirms).toHaveLength(confirmCount)
    } else if (result.status === 'failed') {
      await expect(page.locator('[data-order-checkout-status="failed"]')).toBeVisible()
      await expect(page.locator('[data-pricing-buy="online_basic"]')).toHaveText('Current Plan')
    } else {
      await expect(page.locator('[data-order-checkout-status="success"]')).toBeVisible()
    }
    await page.locator('[data-order-checkout-order-close]').click()
  }
  expect(requests.createOrders).toEqual([])
  expect(requests.upgradeCheckouts).toEqual([])
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
    // API 菜单是 APG 菜单按钮：点击展开后从菜单项跳转
    const apiTrigger = scope.getByRole('button', { name: 'API', exact: true })
    await apiTrigger.click()
    await expect(apiTrigger).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('menu', { name: 'API' }).locator('a[data-cta="nav-api-scraper"]').click()
    await expect(page).toHaveURL(/\/google-maps-scraper-api\//)
  }

  // —— 首页核心：hero 关键词预览入口与四产品卡 ——
  await page.goto('/')
  await expect(page).toHaveTitle(/MapExporter/)
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

test('插件确认页接受 Chromium 与 Firefox 回调，显式确认后交回一次性 code', async ({ page }) => {
  await mockPurchaseBackend(page)
  const codeChallenge = 'a'.repeat(43)
  let issued = 0
  await page.route('**/api/client/auth/extension-login/code', route => {
    expect(route.request().postDataJSON()).toEqual({ code_challenge: codeChallenge })
    issued += 1
    return route.fulfill({ json: envelope({ code: 'e2e-one-time-code', expires_in: 60 }) })
  })

  for (const host of [`${'a'.repeat(32)}.chromiumapp.org`, `${'a1'.repeat(20)}.extensions.allizom.org`]) {
    const redirectUri = `https://${host}/extension-login`
    await page.route(redirectUri, route => route.fulfill({ contentType: 'text/html', body: '' }))
    const params = new URLSearchParams({ redirect_uri: redirectUri, code_challenge: codeChallenge })
    const previousIssued = issued
    await page.goto(`/extension-login/?${params}`)
    await expect(page.locator('[data-extension-login-confirm]')).toBeVisible()
    await expect(page.locator('[data-extension-login-account-email]')).toHaveText('hydra@mapexporter.test')
    expect(issued).toBe(previousIssued)

    await page.locator('[data-extension-login-continue]').click()
    await expect(page).toHaveURL(`${redirectUri}#code=e2e-one-time-code`)
    expect(issued).toBe(previousIssued + 1)
  }
})

test('插件确认页拒绝伪造回调域、凭据、端口与非固定回调地址', async ({ page }) => {
  await mockPurchaseBackend(page)
  let authRequests = 0
  await page.route('**/api/client/auth/**', route => {
    authRequests += 1
    return route.abort()
  })
  const host = `${'a1'.repeat(20)}.extensions.allizom.org`
  const invalidRedirectUris = [
    `https://${host}.example.test/extension-login`,
    `https://${'a'.repeat(39)}.extensions.allizom.org/extension-login`,
    `https://${'g'.repeat(40)}.extensions.allizom.org/extension-login`,
    `https://user:password@${host}/extension-login`,
    `https://${host}:8443/extension-login`,
    `https://${host}/another-path`,
    `https://${host}/extension-login?next=another-path`,
    `https://${host}/extension-login#code=forged`,
    `http://${host}/extension-login`
  ]

  for (const redirectUri of invalidRedirectUris) {
    const params = new URLSearchParams({ redirect_uri: redirectUri, code_challenge: 'a'.repeat(43) })
    await page.goto(`/extension-login/?${params}`)
    await expect(page.locator('[data-extension-login-status-title]')).toHaveText('Invalid sign-in link')
    await expect(page.locator('[data-extension-login-confirm]')).toBeHidden()
    await expect(page.locator('[data-download-auth-modal]')).toBeHidden()
  }
  expect(authRequests).toBe(0)
})
