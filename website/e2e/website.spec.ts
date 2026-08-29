import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

const STORAGE_KEYS = {
  accessToken: 'homepage_access_token',
  deviceId: 'homepage_device_id_v2'
} as const

const locales = [
  { code: 'en-US', path: '', name: 'English' },
  { code: 'zh-CN', path: 'zh-cn', name: '简体中文' },
  { code: 'ja-JP', path: 'ja', name: '日本語' },
  { code: 'ko-KR', path: 'ko', name: '한국어' },
  { code: 'zh-TW', path: 'zh-tw', name: '繁體中文' }
]

interface OrderCreateRequest {
  product_class: number
  product_id: string
  payment_method: string
  currency: string
  amount: number
}

interface PricingEntryMarkRequest {
  /** 后端 mark_logs 类型。 */
  mark_type: string
  /** JSON 格式的入口参数。 */
  mark_msg: string
  /** website 首次打开时间。 */
  first_opened_at: number
}

async function openLanguageDropdown(page: Page) {
  const langBtn = page.locator('.lang-btn')
  await langBtn.click()
  await expect(page.locator('.lang-dropdown')).toHaveClass(/show/)
}

async function mockPricingApis(
  page: Page,
  signedIn: boolean,
  options: {
    onOrderCreate?: (request: OrderCreateRequest) => void
    orderStatus?: 'pending' | 'paid'
    activeSubscription?: boolean
    reviewRewardEnabled?: boolean
    reviewRewardClaimedCount?: number
  } = {}
) {
  let latestOrderRequest: OrderCreateRequest | null = null
  await page.route('**/api/client/auth/me', async route => {
    if (!signedIn) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ code: 10001, msg: 'unauthorized', data: {} })
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 10000,
        msg: 'success',
        data: {
          user_id: 9001,
          email: 'buyer@example.com',
          full_name: 'Pricing Buyer',
          avatar_url: null,
          created_at: Date.now(),
          credits_balance:
            options.orderStatus === 'paid' && latestOrderRequest?.product_class === 2 ? 220 : 120,
          subscription: options.activeSubscription
            ? {
                period: 'month',
                display_name: '无限订阅',
                expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
                daily_limit: -1,
                used: 3,
                remaining: -1,
                reset_date: '2026-06-30',
                auto_renew: true,
              }
            : {
                period: 'free',
                display_name: 'Free',
                expires_at: null,
                daily_limit: 5,
                used: 0,
                remaining: 5,
                reset_date: '2026-06-30',
                auto_renew: false,
              }
        }
      })
    })
  })
  await page.route('**/api/client/credit/checkout-configs', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 10000,
        msg: 'success',
        data: {
          checkout_configs: [
            {
              product_class: 2,
              product_id: 'credit_100',
              product_name: '100 Credits',
              credits_amount: 100,
              display_currency: 'USD',
              display_amount: 9900000,
              payment_channels: [
                {
                  payment_method: 'paypal',
                  payment_method_name: 'PayPal',
                  currency: 'USD',
                  amount: 9900000,
                  provider_sku: 'credit-100-paypal'
                }
              ]
            }
          ]
        }
      })
    })
  })
  await page.route('**/api/client/subscription/checkout-configs', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 10000,
        msg: 'success',
        data: {
          review_reward_enabled: options.reviewRewardEnabled ?? true,
          review_reward_claimed_count: options.reviewRewardClaimedCount ?? 0,
          checkout_configs: [
            {
              product_class: 1,
              product_id: 'unlimited',
              product_name: 'Unlimited',
              display_currency: 'USD',
              display_amount: 12990000,
              period: 'month',
              daily_limit: -1,
              auto_renew: true,
              payment_channels: [
                {
                  payment_method: 'paypal',
                  payment_method_name: 'PayPal',
                  currency: 'USD',
                  amount: 12990000,
                  provider_sku: 'unlimited-monthly-paypal'
                }
              ]
            }
          ]
        }
      })
    })
  })
  await page.route('**/api/client/order/create', async route => {
    const request = route.request().postDataJSON() as OrderCreateRequest
    latestOrderRequest = request
    options.onOrderCreate?.(request)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 10000,
        msg: 'success',
        data: {
          order_no: request.product_class === 1 ? 'ORD-SUBSCRIPTION' : 'ORD-CREDITS',
          amount: request.amount,
          currency: request.currency,
          expired_at: Date.now() + 30 * 60 * 1000,
          support_mail: 'support@example.com',
          payment_data: {
            payment_url:
              request.payment_method === 'paypal'
                ? 'https://www.paypal.com/checkoutnow?token=pricing-order'
                : 'https://t.me/invoice/pricing-order'
          }
        }
      })
    })
  })
  await page.route('**/api/client/order/status/*', async route => {
    const isPaid = options.orderStatus === 'paid'
    const orderRequest = latestOrderRequest
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 10000,
        msg: 'success',
        data: {
          order_no: orderRequest?.product_class === 2 ? 'ORD-CREDITS' : 'ORD-SUBSCRIPTION',
          product_class: orderRequest?.product_class ?? 1,
          product_id: orderRequest?.product_id ?? 'unlimited',
          product_name: orderRequest?.product_class === 2 ? '100 Credits' : 'Unlimited',
          amount: orderRequest?.amount ?? 12990000,
          currency: orderRequest?.currency ?? 'USD',
          order_status: isPaid ? 2 : 1,
          callback_status: isPaid ? 3 : 2,
          payment_method: orderRequest?.payment_method ?? 'paypal',
          paid_at: isPaid ? Date.now() : null,
          created_at: Date.now(),
          expired_at: Date.now() + 30 * 60 * 1000
        }
      })
    })
  })
  await page.route('**/api/client/mark', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 10000, msg: 'success', data: {} })
    })
  })
}

async function signInPricingPage(page: Page) {
  await page.addInitScript(([accessTokenKey, deviceIdKey]) => {
    window.localStorage.setItem(accessTokenKey, 'pricing-token')
    window.localStorage.setItem(deviceIdKey, 'pricing-device')
  }, [STORAGE_KEYS.accessToken, STORAGE_KEYS.deviceId])
}

test.describe('Website Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('home page renders the GMap placeholder', async ({ page }) => {
    await expect(page.locator('.home-placeholder')).toBeVisible()
  })

  test('primary nav removes the no-limits entry', async ({
    page,
    isMobile
  }) => {
    test.skip(isMobile, 'Desktop navigation links are hidden on mobile')

    const navLinks = page.locator('.nav-links a')
    await expect(navLinks).toHaveCount(2)
    await expect(navLinks.nth(0)).toContainText('Home')
    await expect(navLinks.nth(1)).toHaveAttribute('href', '/pricing/')
    await expect(navLinks.nth(1)).toContainText('Pricing')
    await expect(page.locator('.nav-links')).not.toContainText('No Limits')
    await expect(page.locator('.nav-links')).not.toContainText('Changelog')
    await expect(page.locator('.nav-links a[href="/pricing/"]')).toHaveCount(1)
  })

  test('mobile nav removes the no-limits entry', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile navigation is only visible on mobile')

    await page.locator('.mobile-menu-btn').click()

    const mobileNav = page.locator('.mobile-nav')
    const mobileLinks = mobileNav.locator('a')
    await expect(mobileNav).toHaveClass(/open/)
    await expect(mobileLinks).toHaveCount(2)
    await expect(mobileLinks.nth(0)).toContainText('Home')
    await expect(mobileLinks.nth(1)).toContainText('Pricing')
    await expect(mobileNav).not.toContainText('No Limits')
    await expect(mobileNav.locator('a[href*="solutions"]')).toHaveCount(0)
  })

  test('install CTA communicates browser extension install', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop install CTA is hidden on mobile')

    const installCta = page.locator('.nav-actions .nav-install-link')
    await expect(installCta.locator('.nav-install-image')).toBeVisible()
    await expect(installCta).toHaveAttribute(
      'href',
      'https://chromewebstore.google.com/detail/telegram-download-assista/lflkobgaibapekhjnfhkaeagdnojjnla'
    )
  })

  test('pricing page shows sign-in gate and product cards', async ({ page }) => {
    await mockPricingApis(page, false)
    const response = await page.goto('/pricing/')

    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-pricing-page]')).toBeVisible()
    await expect(page.locator('.pricing-heading')).toHaveCount(0)
    await expect(page.locator('.pricing-hero-title')).toHaveText('Pricing for TG Downloader')
    await expect(page.locator('[data-pricing-account-signed-out]')).toBeVisible()
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText('Unlimited')
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText('Extension only')
    await expect(page.locator('[data-pricing-subscription-card] > .pricing-card-badge')).toBeHidden()
    await expect(page.locator('[data-pricing-credit-list]')).toContainText('100 Credits')
    await expect(page.locator('[data-pricing-credit-list]')).toContainText('$0.0990/Credits')
    await expect(page.locator('[data-pricing-credit-list]')).toContainText('Web only')
    // 唯一的 Credits 档即中间档，被标记为主推卡并展示徽章。
    await expect(page.locator('.pricing-credit-card.is-featured .pricing-card-badge')).toHaveText(
      'Most Popular'
    )
    const creditAmountBox = await page.locator('[data-pricing-credit-amount]').boundingBox()
    const creditUnitPriceBox = await page.locator('[data-pricing-credit-unit-price]').boundingBox()
    expect(creditAmountBox).not.toBeNull()
    expect(creditUnitPriceBox).not.toBeNull()
    if (!creditAmountBox || !creditUnitPriceBox) {
      throw new Error('Pricing credit metadata boxes were not measurable.')
    }
    expect(creditAmountBox.x).toBeLessThan(creditUnitPriceBox.x)
    await expect(page.locator('[data-pricing-page]')).not.toContainText('仅限网页版使用')
    await expect(page.locator('[data-pricing-page]')).not.toContainText('免费版')
    await expect(page.locator('[data-pricing-page]')).not.toContainText('无限订阅')
    // 页底购买答疑：普通入口展示 FAQ 区块并输出 FAQPage 结构化数据。
    await expect(page.locator('[data-pricing-faq]')).toBeVisible()
    await expect(page.locator('[data-pricing-faq-item]')).toHaveCount(5)
    await expect(page.locator('[data-pricing-faq]')).toContainText('Do Credits expire?')
    const ldJsonTexts = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ldJsonTexts.some(text => text.includes('"FAQPage"'))).toBe(true)
    await expect(page.locator('.pricing-product-list > :last-child')).toHaveAttribute(
      'data-pricing-subscription-card',
      ''
    )
    await page.locator('[data-pricing-subscription-buy]').click()
    await expect(page.locator('[data-download-auth-modal]')).toBeVisible()
  })

  test('pricing page only shows Unlimited for extension quota source', async ({ page }) => {
    let creditConfigRequestCount = 0
    page.on('request', request => {
      if (new URL(request.url()).pathname === '/api/client/credit/checkout-configs') {
        creditConfigRequestCount += 1
      }
    })
    await mockPricingApis(page, false)
    const response = await page.goto('/pricing/?utm_source=extension&source=quota_counter')

    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-pricing-page]')).toHaveClass(/is-extension-source/)
    await expect(page.locator('.pricing-hero-title')).toHaveText('Keep downloading without limits')
    await expect(page.locator('[data-pricing-account]')).toBeVisible()
    await expect(page.locator('[data-pricing-account-signed-out]')).toBeVisible()
    await expect(page.locator('[data-pricing-review-reward-banner]')).toBeHidden()
    await expect(page.locator('[data-pricing-subscription-card]')).toHaveCSS('order', '-1')
    await expect(page.locator('[data-pricing-subscription-card] > .pricing-card-badge')).toHaveText(
      'Most Popular'
    )
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText('per month')
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText('Auto-renews monthly')
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText(
      'Unlimited downloads in the extension'
    )
    await expect(page.locator('[data-pricing-subscription-buy]')).toContainText('Sign in to Upgrade')
    await expect(page.locator('[data-pricing-credit-list]')).toBeHidden()
    await expect(page.locator('.pricing-credit-card')).toHaveCount(0)
    await expect(page.locator('[data-pricing-page]')).not.toContainText('Web only')
    // 插件入口同样展示页底购买答疑。
    await expect(page.locator('[data-pricing-faq]')).toBeVisible()
    await expect(page.locator('[data-pricing-faq]')).toContainText(
      'Can I cancel my Unlimited subscription anytime?'
    )
    expect(creditConfigRequestCount).toBe(0)

    await page.locator('[data-pricing-subscription-buy]').click()
    await expect(page.locator('[data-download-auth-modal]')).toBeVisible()
  })

  test('eligible extension user can start the review reward from the compact entry', async ({ page }) => {
    await mockPricingApis(page, true)
    await signInPricingPage(page)
    await page.addInitScript(() => {
      window.open = () => null
    })

    const response = await page.goto('/pricing/?utm_source=extension&source=quota_counter')

    expect(response?.status()).toBe(200)
    const rewardEntry = page.locator('[data-pricing-review-reward-banner]')
    await expect(rewardEntry).toBeVisible()
    await expect(rewardEntry.locator('.pricing-review-reward-title')).toHaveText(
      'Get 7 days of Unlimited'
    )
    await expect(rewardEntry.locator('.pricing-review-reward-description')).toHaveText(
      'Leave a review in the Chrome Web Store, then return here to verify and claim your reward.'
    )
    await expect(rewardEntry).not.toContainText(/seconds?/i)
    await rewardEntry.click()

    const dialog = page.locator('[data-pricing-subscription-confirm]')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('[data-pricing-subscription-confirm-view="countdown"]')).toBeVisible()
    await expect(dialog).toContainText('Checking in 30 seconds')
    await expect(dialog.locator('[data-pricing-subscription-confirm-continue]')).toBeHidden()
  })

  test('extension review reward entry stays hidden after the account has claimed it', async ({ page }) => {
    await mockPricingApis(page, true, { reviewRewardClaimedCount: 1 })
    await signInPricingPage(page)

    const response = await page.goto('/pricing/?utm_source=extension&source=quota_counter')

    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-pricing-account-signed-in]')).toBeVisible()
    await expect(page.locator('[data-pricing-review-reward-banner]')).toBeHidden()
  })

  test('disabled review reward hides every entry without blocking subscription checkout', async ({ page }) => {
    await mockPricingApis(page, true, { reviewRewardEnabled: false })
    await signInPricingPage(page)

    const response = await page.goto('/pricing/?utm_source=extension&source=quota_counter')

    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-pricing-review-reward-banner]')).toBeHidden()

    await page.locator('[data-pricing-subscription-buy]').click()
    const subscriptionConfirm = page.locator('[data-pricing-subscription-confirm]')
    await expect(subscriptionConfirm).toBeVisible()
    await expect(subscriptionConfirm.locator('[data-pricing-review-reward-offer]')).toBeHidden()
    await expect(
      subscriptionConfirm.locator('[data-pricing-subscription-confirm-continue]')
    ).toBeVisible()
  })

  test('pricing quota upgrade entry records mark-log on every page load', async ({ page }) => {
    const pricingEntryMarks: PricingEntryMarkRequest[] = []
    await page.route('**/api/client/mark/record', async route => {
      const request = route.request().postDataJSON() as PricingEntryMarkRequest
      if (request.mark_type === 'web_pricing_open_from_extension') {
        pricingEntryMarks.push(request)
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 10000, msg: 'success', data: { recorded: true } })
      })
    })
    await mockPricingApis(page, false)

    const response = await page.goto(
      '/pricing/?utm_source=extension&source=quota_upgrade_button',
      { waitUntil: 'domcontentloaded' }
    )

    expect(response?.status()).toBe(200)
    await expect.poll(() => pricingEntryMarks.length).toBe(1)
    expect(pricingEntryMarks[0]).toEqual({
      mark_type: 'web_pricing_open_from_extension',
      mark_msg: '{"utm_source":"extension","source":"quota_upgrade_button"}',
      first_opened_at: expect.any(Number)
    })

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect.poll(() => pricingEntryMarks.length).toBe(2)

    await page.goto('/pricing/?utm_source=extension&source=quota_counter', {
      waitUntil: 'domcontentloaded'
    })
    await expect(page.locator('[data-pricing-subscription-card]')).toBeVisible()
    expect(pricingEntryMarks).toHaveLength(2)
  })

  test('Unlimited plugin entry keeps signed-in account information visible', async ({ page }) => {
    await mockPricingApis(page, true, {
      activeSubscription: true,
      reviewRewardClaimedCount: 1
    })
    await signInPricingPage(page)

    await page.setViewportSize({ width: 1556, height: 844 })

    const response = await page.goto(
      '/pricing/?utm_source=extension&source=quota_unlimited_button'
    )

    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-pricing-page]')).toHaveClass(/is-extension-source/)
    await expect(page.locator('[data-pricing-account-signed-in]')).toBeVisible()
    await expect(page.locator('[data-pricing-user-credits]')).toContainText('120')
    await expect(page.locator('[data-pricing-user-subscription]')).toContainText('Unlimited')
    await expect(page.locator('[data-pricing-cancellation-guide-button]')).toBeVisible()
    await expect(page.locator('[data-pricing-review-reward-banner]')).toBeHidden()

    const subscriptionCard = page.locator('[data-pricing-subscription-card]')
    for (const viewport of [
      { width: 1556, height: 844 },
      { width: 1366, height: 768 }
    ]) {
      await page.setViewportSize(viewport)
      const cardBox = await subscriptionCard.boundingBox()
      expect(cardBox, `Subscription card should be measurable at ${viewport.width}x${viewport.height}`).not.toBeNull()
      if (!cardBox) {
        throw new Error(`Subscription card is not measurable at ${viewport.width}x${viewport.height}.`)
      }
      expect(
        cardBox.y + cardBox.height,
        `Subscription card should fit within the first viewport at ${viewport.width}x${viewport.height}`
      ).toBeLessThanOrEqual(viewport.height)
    }
  })

  test('pricing page shows signed-in user credits and subscription', async ({ page }) => {
    await mockPricingApis(page, true, { activeSubscription: true })
    await signInPricingPage(page)

    const response = await page.goto('/pricing/')

    expect(response?.status()).toBe(200)
    await expect(page.locator('[data-pricing-account-signed-in]')).toBeVisible()
    await expect(page.locator('[data-pricing-review-reward-banner]')).toBeHidden()
    await expect(page.locator('[data-pricing-user-avatar]')).toHaveCount(1)
    await expect(page.locator('[data-pricing-user-initial]')).toHaveText('B')
    await expect(page.locator('[data-pricing-user-credits]')).toContainText('120')
    // 账户区改为内容自适应宽度的居中胶囊条。
    await expect(page.locator('.pricing-account')).toHaveCSS('justify-self', 'center')
    await expect(page.locator('.pricing-account-balance-row')).toHaveCSS('justify-content', 'center')
    await page.locator('[data-pricing-account-button]').click()
    await expect(page.locator('[data-pricing-account-button]')).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('[data-pricing-account-menu]')).toBeVisible()
    await expect(page.locator('[data-pricing-account-email]')).toContainText('buyer@example.com')
    await page.locator('[data-pricing-subscription-card]').click()
    await expect(page.locator('[data-pricing-account-button]')).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('[data-pricing-account-menu]')).toBeHidden()
    await expect(page.locator('[data-pricing-user-subscription]')).toContainText('Unlimited')
    await expect(page.locator('[data-pricing-account]')).not.toContainText('免费版')
    await expect(page.locator('[data-pricing-account]')).not.toContainText('无限订阅')
    await expect(page.locator('[data-pricing-subscription-card]')).not.toContainText('Unlimited 订阅')
    await expect(page.locator('[data-pricing-user-expires]')).not.toContainText('No expiry')
    await expect(page.locator('[data-pricing-user-status]')).toHaveCount(0)
    await expect(page.locator('[data-pricing-user-daily]')).toHaveCount(0)
    await expect(page.locator('[data-pricing-user-reset]')).toHaveCount(0)
    await expect(page.locator('[data-pricing-subscription-buy]')).toContainText('Buy Now')

    const cancellationButton = page.locator('[data-pricing-cancellation-guide-button]')
    await expect(cancellationButton).toBeVisible()
    await expect(cancellationButton).toHaveText('Cancel')
    await cancellationButton.click()

    const cancellationGuide = page.locator('[data-pricing-cancellation-guide]')
    await expect(cancellationGuide).toBeVisible()
    await expect(cancellationGuide.locator('h2')).toHaveText('How to cancel:')
    await expect(cancellationGuide.locator('h3')).toHaveText(['Telegram Stars', 'PayPal'])
    await expect(cancellationGuide.locator('li')).toHaveText([
      'Telegram',
      'Settings',
      'Telegram Stars',
      'My subscriptions',
      'PayPal',
      'Settings',
      'Payments',
      'Automatic payments',
      'TG Downloader',
      'Cancel'
    ])
    await cancellationGuide.locator('.pricing-cancellation-guide-dismiss').click()
    await expect(cancellationGuide).toBeHidden()
    await expect(cancellationButton).toBeFocused()
  })

  test('active subscription greys subscription button and explains duplicate purchase', async ({ page }) => {
    let createdOrderRequest: OrderCreateRequest | null = null
    await mockPricingApis(page, true, {
      activeSubscription: true,
      onOrderCreate: request => {
        createdOrderRequest = request
      }
    })
    await signInPricingPage(page)
    await page.goto('/pricing/')

    const buyButton = page.locator('[data-pricing-subscription-buy]')
    await expect(buyButton).toHaveAttribute('aria-disabled', 'true')
    await expect(buyButton).toHaveClass(/is-soft-disabled/)
    await expect(buyButton).not.toHaveAttribute('disabled', '')

    await buyButton.click({ force: true })

    await expect(page.locator('[data-pricing-subscription-error]')).toContainText(
      'You already have an active subscription. You cannot buy another one.'
    )
    await expect(page.locator('[data-order-checkout-payment-dialog]')).toBeHidden()
    expect(createdOrderRequest).toBeNull()
  })

  test('signed-in pricing subscription creates an orders checkout', async ({ page }) => {
    let createdOrderRequest: OrderCreateRequest | null = null
    await mockPricingApis(page, true, {
      onOrderCreate: request => {
        createdOrderRequest = request
      }
    })
    await signInPricingPage(page)
    await page.goto('/pricing/')

    await expect(page.locator('[data-pricing-cancellation-guide-button]')).toBeHidden()
    await page.locator('[data-pricing-subscription-buy]').click()
    const subscriptionConfirm = page.locator('[data-pricing-subscription-confirm]')
    await expect(subscriptionConfirm).toBeVisible()
    await expect(subscriptionConfirm).toContainText(
      'If you can leave the extension a review, I will give you 7 days of plugin subscription.'
    )
    await subscriptionConfirm.locator('[data-pricing-subscription-confirm-continue]').click()

    await expect(page.locator('[data-order-checkout-payment-dialog]')).toBeVisible()
    await expect(page.locator('[data-order-checkout-payment-dialog]')).toContainText(
      'Extension Unlimited'
    )
    await expect(page.locator('[data-order-checkout-payment-dialog]')).toContainText(
      'Extension only'
    )
    const popupPromise = page.waitForEvent('popup')
    await page.locator('[data-order-checkout-submit]').click()
    const popup = await popupPromise
    await popup.close()

    expect(createdOrderRequest).toEqual({
      product_class: 1,
      product_id: 'unlimited',
      payment_method: 'paypal',
      currency: 'USD',
      amount: 12990000
    })
    await expect(page.locator('[data-order-checkout-order-dialog]')).toBeVisible()
    await expect(page.locator('[data-order-checkout-order-support]')).toBeVisible()
    await expect(page.locator('[data-order-checkout-order-support-mail]')).toContainText(
      'support@example.com'
    )
  })

  test('signed-in pricing credits uses the shared orders checkout', async ({ page }) => {
    let createdOrderRequest: OrderCreateRequest | null = null
    await mockPricingApis(page, true, {
      orderStatus: 'paid',
      onOrderCreate: request => {
        createdOrderRequest = request
      }
    })
    await signInPricingPage(page)
    await page.goto('/pricing/')

    await page.locator('[data-pricing-credit-buy]').click()

    await expect(page.locator('[data-order-checkout-payment-dialog]')).toBeVisible()
    await expect(page.locator('[data-order-checkout-payment-dialog]')).toContainText(
      '100 Credits'
    )
    const popupPromise = page.waitForEvent('popup')
    await page.locator('[data-order-checkout-submit]').click()
    const popup = await popupPromise
    await popup.close()

    expect(createdOrderRequest).toEqual({
      product_class: 2,
      product_id: 'credit_100',
      payment_method: 'paypal',
      currency: 'USD',
      amount: 9900000
    })
    await expect(page.locator('[data-order-checkout-order-dialog]')).toBeVisible()
    await expect(page.locator('[data-order-checkout-order-support-mail]')).toContainText(
      'support@example.com'
    )
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'credit_purchase_paypal_return',
          provider: 'paypal',
          status: 'success',
          orderNo: 'ORD-CREDITS'
        },
        window.location.origin
      )
    })
    await expect(page.locator('[data-order-checkout-order-dialog]')).toContainText(
      '+100 Credits'
    )
    await expect(page.locator('[data-order-checkout-order-dialog]')).toContainText(
      '220 Credits'
    )
  })

  test('localized pricing routes exist', async ({ page }) => {
    await mockPricingApis(page, false)
    const zhCNResponse = await page.goto('/zh-cn/pricing/', { waitUntil: 'domcontentloaded' })
    expect(zhCNResponse?.status()).toBe(200)
    await expect(page.locator('[data-pricing-page]')).toBeVisible()
    await expect(page.locator('.nav-links a[href="/zh-cn/pricing/"]')).toContainText('价格')
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText('无限下载')
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText(
      '仅限插件——适用于电脑端 Telegram Web'
    )
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText('登录后购买')
    await expect(page.locator('[data-pricing-subscription-card]')).not.toContainText('Extension Unlimited')
    await expect(page.locator('[data-pricing-credit-list]')).toContainText('100 积分')
    await expect(page.locator('[data-pricing-faq]')).toContainText('积分会过期吗？')

    const zhTWResponse = await page.goto('/zh-tw/pricing/', { waitUntil: 'domcontentloaded' })
    expect(zhTWResponse?.status()).toBe(200)
    await expect(page.locator('[data-pricing-page]')).toBeVisible()
    await expect(page.locator('.nav-links a[href="/zh-tw/pricing/"]')).toContainText('價格')
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText('無限下載')
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText(
      '僅限外掛——適用於電腦端 Telegram Web'
    )
    await expect(page.locator('[data-pricing-subscription-card]')).toContainText('登入後購買')
    await expect(page.locator('[data-pricing-subscription-card]')).not.toContainText('Extension Unlimited')
    await expect(page.locator('[data-pricing-credit-list]')).toContainText('100 積分')
  })

  test('should display footer', async ({ page }) => {
    const footer = page.locator('.footer')
    const officialXLink = footer.locator('a[href="https://x.com/TGDownload"]')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('© 2026')
    await expect(footer.locator('.footer-link-group')).toHaveCount(3)
    await expect(footer.locator('[data-footer-resources] a')).toHaveCount(3)
    await expect(footer.locator('.footer-meta a')).toHaveCount(0)
    await expect(officialXLink).toBeVisible()
    await expect(officialXLink).toContainText('Official X Account')
    await expect(officialXLink).toHaveAttribute('target', '_blank')
    await expect(officialXLink).toHaveAttribute('rel', 'me noopener noreferrer')
  })

  test('contact page exposes the official X account beside email support', async ({ page }) => {
    await page.goto('/contact/')

    const contactPage = page.locator('[data-company-page="contact"]')
    const officialXLink = contactPage.locator('.company-social-link')
    await expect(contactPage.locator('a[href^="mailto:"]')).toBeVisible()
    await expect(officialXLink).toBeVisible()
    await expect(officialXLink).toHaveAttribute('href', 'https://x.com/TGDownload')
    await expect(officialXLink).toContainText('Official X Account')
    await expect(officialXLink).toContainText('@TGDownload')
  })
})

test.describe('Language Switcher', () => {
  test('should display language switcher button', async ({ page }) => {
    await page.goto('/')
    const langBtn = page.locator('.lang-btn')
    await expect(langBtn).toBeVisible()
    await expect(langBtn).toContainText('English')
  })

  test('should open language dropdown', async ({ page }) => {
    await page.goto('/')
    const langBtn = page.locator('.lang-btn')
    const langDropdown = page.locator('.lang-dropdown')

    await expect(langDropdown).not.toHaveClass(/show/)
    await langBtn.click()
    await expect(langDropdown).toHaveClass(/show/)
  })

  test('should switch to Chinese', async ({ page }) => {
    await page.goto('/')
    await openLanguageDropdown(page)
    await page.click('.lang-option[data-path="/zh-cn/"]')

    await expect(page).toHaveURL('/zh-cn/')
    await expect(page.locator('.lang-btn')).toContainText('简体中文')
  })

  test('should preserve pricing source parameters when switching language', async ({ page }) => {
    await mockPricingApis(page, false)
    await page.goto('/pricing/?utm_source=extension&source=upgrade_modal')
    await openLanguageDropdown(page)
    await page.click('.lang-option[data-path="/zh-cn/pricing/"]')

    await expect(page).toHaveURL(
      '/zh-cn/pricing/?utm_source=extension&source=upgrade_modal'
    )
    await expect(page.locator('[data-pricing-page]')).toHaveClass(/is-extension-source/)
    await expect(page.locator('.lang-btn')).toContainText('简体中文')
  })
})

test.describe('Multi-language Pages', () => {
  for (const locale of locales) {
    test.describe(`${locale.name} (${locale.code})`, () => {
      const basePath = locale.path ? `/${locale.path}/` : '/'

      test.beforeEach(async ({ context }) => {
        await context.addCookies([
          {
            name: 'user-language',
            value: locale.code,
            url: 'http://localhost:9620'
          }
        ])
      })

      test('should load home page', async ({ page }) => {
        await page.goto(basePath)
        await expect(page.locator('.home-placeholder')).toBeVisible()
      })

      test('should keep the reduced nav size', async ({ page }) => {
        await page.goto(basePath)
        const navLinks = page.locator('.nav-links a')
        await expect(navLinks).toHaveCount(2)
        await expect(page.locator('.nav-links a[href$="/pricing/"]')).toHaveCount(1)
      })
    })
  }
})

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.locator('.home-placeholder')).toBeVisible()

    const navLinks = page.locator('.nav-links')
    const isVisible = await navLinks.isVisible().catch(() => false)
    expect(isVisible).toBeFalsy()
  })

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto('/')

    await expect(page.locator('.home-placeholder')).toBeVisible()
  })
})

test.describe('Secondary Pages', () => {
  test('legacy solution detail routes should no longer exist', async ({ page }) => {
    const englishResponse = await page.goto('/solutions/batch-download/')
    expect(englishResponse?.status()).toBe(404)

    const chineseResponse = await page.goto('/zh-cn/solutions/private-channel-download/')
    expect(chineseResponse?.status()).toBe(404)
  })

  test('retired information routes should no longer render from Astro', async ({ page }) => {
    for (const path of [
      '/features/',
      '/guide/',
      '/faq/',
      '/solutions/',
      '/zh-cn/features/',
      '/zh-cn/guide/',
      '/zh-cn/faq/',
      '/zh-cn/solutions/'
    ]) {
      const response = await page.goto(path)
      expect(response?.status()).toBe(404)
    }
  })
})
