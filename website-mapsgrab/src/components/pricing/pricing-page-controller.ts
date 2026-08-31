/**
 * Pricing 页面控制器（MapsGrab 三档套餐版，W5）。
 *
 * 负责恢复登录态、渲染账户胶囊（Maps 产品线套餐摘要）、加载支付配置并把
 * Pro/Business 购买流程交给公共 OrderCheckoutModal。插件来源（utm_source=
 * extension，W7 接线）只做归因标记，不切换布局。
 */

import {
  clearStoredAccessToken,
  getCurrentUser,
  getStoredAccessToken,
  logoutCurrentUser,
  type HomepageUserInfo
} from '../../scripts/homepage/auth'
import { ensureDeviceId } from '../../scripts/homepage/device'
import type { RequestContext } from '../../scripts/homepage/api'
import { reportGA4Event } from '../../scripts/homepage/ga4'
import {
  ORDER_CHECKOUT_AUTH_INVALID_EVENT,
  ORDER_CHECKOUT_PRICE_UPDATED_EVENT,
  ORDER_CHECKOUT_SUCCESS_EVENT,
  type OrderCheckoutAuthInvalidPayload,
  type OrderCheckoutPriceUpdatedPayload,
  type OrderCheckoutSuccessPayload
} from '../order-checkout/order-checkout-types'
import {
  formatPricingDisplayPrice,
  getDefaultPricingPaymentChannel,
  isPricingAuthFailure,
  listSubscriptionCheckoutConfigs,
  pickMapsPlans,
  type SubscriptionCheckoutPlan
} from './pricing-checkout'
import { PRICING_AUTH_SUCCESS_EVENT, type PricingAuthSuccessPayload } from './pricing-auth-controller'

/** 插件升级入口的 utm_source 值（W7 插件「订阅跳转按钮」落本页时携带）。 */
const EXTENSION_UTM_SOURCE = 'extension'

/** 可购买档位卡的商品 ID 集合（与后端 maps 商品配置对齐）。 */
const BUYABLE_PLAN_IDS = ['pro', 'business'] as const
type BuyablePlanId = (typeof BUYABLE_PLAN_IDS)[number]

/** 后端 maps 商品 ID → 档位卡 ID。 */
const PLAN_PRODUCT_IDS: Record<BuyablePlanId, string> = {
  pro: 'maps_pro',
  business: 'maps_business'
}

/** 页面文案。 */
interface PricingCopy {
  account: {
    planLabel: string
    noExpiry: string
    freePlan: string
    loadFailed: string
  }
  plans: {
    loading: string
    loadFailed: string
    noChannels: string
    alreadyActive: string
  }
  checkout: {
    usageNotice: string
    successTitle: string
    successDescription: string
    failedTitle: string
    productTitlePrefix: string
  }
}

/** 单个可购买档位卡的 DOM 集合。 */
interface BuyableCardElements {
  /** 购买按钮。 */
  buy: HTMLButtonElement
  /** 卡内错误提示行。 */
  error: HTMLElement
}

/** 页面 DOM 集合。 */
interface PricingElements {
  /** 页面根节点。 */
  root: HTMLElement
  /** 账号加载状态。 */
  accountLoading: HTMLElement
  /** 未登录账号区。 */
  accountSignedOut: HTMLElement
  /** 已登录账号区。 */
  accountSignedIn: HTMLElement
  /** 账号错误。 */
  accountError: HTMLElement
  /** 登录按钮。 */
  loginButtons: HTMLButtonElement[]
  /** 账号头像按钮。 */
  accountButton: HTMLButtonElement
  /** 账号菜单。 */
  accountMenu: HTMLElement
  /** 账号邮箱。 */
  accountEmail: HTMLElement
  /** 退出登录按钮。 */
  accountLogout: HTMLButtonElement
  /** 用户头像。 */
  userAvatar: HTMLImageElement
  /** 用户首字母。 */
  userInitial: HTMLElement
  /** 当前套餐名。 */
  userPlan: HTMLElement
  /** 当前套餐到期时间。 */
  userExpires: HTMLElement
  /** 取消指引入口。 */
  cancellationGuideButton: HTMLButtonElement
  /** 取消指引弹窗。 */
  cancellationGuideDialog: HTMLDialogElement
  /** 支付配置加载状态行。 */
  plansStatus: HTMLElement
  /** 可购买档位卡（product_id → DOM）。 */
  buyableCards: Map<string, BuyableCardElements>
}

/** 页面状态。 */
interface PricingState {
  /** device_id。 */
  deviceId: string
  /** access token。 */
  token: string | null
  /** auth/me 用户。 */
  user: HomepageUserInfo | null
  /** maps 产品线商品配置（product_id → plan）。 */
  plans: Map<string, SubscriptionCheckoutPlan>
  /** 最近一次配置请求版本；旧响应不得覆盖新登录态。 */
  loadVersion: number
  /** 是否为插件升级入口（W7 归因口径）。 */
  isExtensionSource: boolean
}

/** 初始化 Pricing 页面。 */
async function initPricingPage(root: HTMLElement): Promise<void> {
  const copy = getPricingCopy(root)
  const elements = getPricingElements(root)
  const state: PricingState = {
    deviceId: await ensureDeviceId(),
    token: getStoredAccessToken(),
    user: null,
    plans: new Map(),
    loadVersion: 0,
    isExtensionSource: new URLSearchParams(window.location.search).get('utm_source') === EXTENSION_UTM_SOURCE
  }
  applyExtensionAttribution(elements, state)

  bindEvents(elements, copy, state)
  await Promise.all([restoreUser(elements, copy, state), loadPlans(elements, copy, state)])
}

/** 绑定页面事件。 */
function bindEvents(elements: PricingElements, copy: PricingCopy, state: PricingState): void {
  for (const button of elements.loginButtons) {
    button.addEventListener('click', () => {
      window.pricingAuthController?.open()
    })
  }

  document.addEventListener('click', event => {
    const target = event.target
    if (!(target instanceof Node)) {
      return
    }
    if (!elements.accountButton.contains(target) && !elements.accountMenu.contains(target)) {
      setAccountMenuOpen(elements, false)
    }
  })

  elements.accountButton.addEventListener('click', event => {
    event.stopPropagation()
    setAccountMenuOpen(elements, elements.accountMenu.hidden)
  })

  elements.accountLogout.addEventListener('click', () => {
    void logoutPricingUser(elements, copy, state)
  })

  elements.cancellationGuideButton.addEventListener('click', () => {
    if (!canShowCancellationGuide(state) || elements.cancellationGuideDialog.open) {
      return
    }
    elements.cancellationGuideDialog.showModal()
  })

  elements.cancellationGuideDialog.addEventListener('click', event => {
    if (event.target === elements.cancellationGuideDialog) {
      elements.cancellationGuideDialog.close()
    }
  })

  elements.cancellationGuideDialog.addEventListener('close', () => {
    if (!elements.cancellationGuideButton.hidden) {
      elements.cancellationGuideButton.focus()
    }
  })

  for (const [productId, card] of elements.buyableCards) {
    card.buy.addEventListener('click', () => {
      void openPlanCheckout(elements, copy, state, productId).catch(error => {
        console.error(error)
        setMessage(card.error, error instanceof Error ? error.message : copy.plans.loadFailed)
      })
    })
  }

  window.addEventListener(PRICING_AUTH_SUCCESS_EVENT, event => {
    const payload = (event as CustomEvent<PricingAuthSuccessPayload>).detail
    void handlePricingAuthSuccess(elements, copy, state, payload)
  })

  window.addEventListener(ORDER_CHECKOUT_SUCCESS_EVENT, event => {
    void handleOrderCheckoutSuccess(elements, copy, state, (event as CustomEvent<OrderCheckoutSuccessPayload>).detail)
  })

  window.addEventListener(ORDER_CHECKOUT_AUTH_INVALID_EVENT, event => {
    const payload = (event as CustomEvent<OrderCheckoutAuthInvalidPayload>).detail
    clearStoredAccessToken()
    state.token = null
    state.user = null
    state.loadVersion += 1
    renderAccount(elements, copy, state)
    window.pricingAuthController?.open()
    setMessage(elements.accountError, payload.message || copy.plans.loadFailed)
  })

  window.addEventListener(ORDER_CHECKOUT_PRICE_UPDATED_EVENT, event => {
    void handleOrderCheckoutPriceUpdated(elements, copy, state, (event as CustomEvent<OrderCheckoutPriceUpdatedPayload>).detail)
  })
}

/** 插件来源入口：购买按钮归因到 extension 渠道（W6 起 data-cta 经 GA4 cta_click 通道上报）。 */
function applyExtensionAttribution(elements: PricingElements, state: PricingState): void {
  if (!state.isExtensionSource) {
    return
  }
  for (const card of elements.buyableCards.values()) {
    card.buy.setAttribute('data-ga-source', EXTENSION_UTM_SOURCE)
  }
}

/** 恢复 auth/me 并渲染账户胶囊。 */
async function restoreUser(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState
): Promise<void> {
  setHidden(elements.accountLoading, false)
  setHidden(elements.accountError, true)

  if (!state.token) {
    setHidden(elements.accountLoading, true)
    renderAccount(elements, copy, state)
    return
  }

  try {
    state.user = await getCurrentUser(buildRequestContext(state))
  } catch (error) {
    console.error(error)
    if (error instanceof Error && isPricingAuthFailure(error)) {
      clearStoredAccessToken()
      state.token = null
      state.user = null
    } else {
      setMessage(elements.accountError, error instanceof Error ? error.message : copy.account.loadFailed)
    }
  } finally {
    setHidden(elements.accountLoading, true)
    renderAccount(elements, copy, state)
    renderPlanButtons(elements, copy, state)
  }
}

/** 加载 maps 产品线支付配置并渲染购买按钮（导出供 module-scripts 回归测试）。 */
export async function loadPlans(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState
): Promise<void> {
  const requestVersion = ++state.loadVersion
  setMessage(elements.plansStatus, copy.plans.loading)

  try {
    const data = await listSubscriptionCheckoutConfigs(buildRequestContext(state))
    if (requestVersion !== state.loadVersion) {
      return
    }
    state.plans = pickMapsPlans(data.plans)
    setMessage(elements.plansStatus, '')
  } catch (error) {
    console.error(error)
    if (requestVersion !== state.loadVersion) {
      return
    }
    state.plans = new Map()
    setMessage(elements.plansStatus, copy.plans.loadFailed)
  }
  renderPlanButtons(elements, copy, state)
}

/** 渲染账户胶囊：登录态切换 + Maps 产品线套餐摘要。 */
function renderAccount(elements: PricingElements, copy: PricingCopy, state: PricingState): void {
  renderCancellationGuide(elements, state)
  const user = state.user
  setHidden(elements.accountSignedOut, Boolean(user))
  setHidden(elements.accountSignedIn, !user)
  setHidden(
    elements.cancellationGuideButton,
    !(canShowCancellationGuide(state) && elements.cancellationGuideDialog)
  )
  if (!canShowCancellationGuide(state) && elements.cancellationGuideDialog.open) {
    elements.cancellationGuideDialog.close()
  }

  if (!user) {
    setAccountMenuOpen(elements, false)
    elements.accountEmail.textContent = ''
    elements.accountEmail.removeAttribute('title')
    elements.accountButton.setAttribute('aria-expanded', 'false')
    return
  }

  renderUserAvatar(elements, user)
  elements.accountEmail.textContent = user.email
  elements.accountEmail.title = user.email

  const mapsSubscription = user.maps_subscription ?? null
  const isUnavailable = mapsSubscription?.status === 'unavailable'
  const hasActivePlan = !isUnavailable && mapsSubscription?.expires_at != null
  elements.userPlan.textContent = hasActivePlan
    ? mapsSubscription?.display_name || copy.account.freePlan
    : copy.account.freePlan
  elements.userExpires.textContent = hasActivePlan
    ? formatTimestamp(mapsSubscription?.expires_at ?? null)
    : copy.account.noExpiry
}

/** 只有仍在自动续费的有效 Maps 订阅展示渠道取消路径。 */
function canShowCancellationGuide(state: PricingState): boolean {
  const subscription = state.user?.maps_subscription ?? null
  if (subscription?.status !== 'active' || subscription.expires_at == null) {
    return false
  }
  return subscription.auto_renew === true
}

/** 渲染取消指引按钮可见性。 */
function renderCancellationGuide(elements: PricingElements, state: PricingState): void {
  setHidden(elements.cancellationGuideButton, !canShowCancellationGuide(state))
}

/** 按当前配置与登录态刷新可购买卡按钮。 */
function renderPlanButtons(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState
): void {
  const activePlan = hasActiveMapsSubscription(state)
  for (const [productId, card] of elements.buyableCards) {
    const plan = state.plans.get(productId)
    const hasChannel = Boolean(getDefaultPricingPaymentChannel(plan?.payment_channels ?? []))
    card.buy.disabled = !plan || !hasChannel
    // 配置整体缺失由全局状态行说明；单卡仅在商品存在但无渠道时提示。
    setMessage(card.error, plan && !hasChannel ? copy.plans.noChannels : '')
    if (activePlan) {
      card.buy.setAttribute('aria-disabled', 'true')
      card.buy.classList.add('is-soft-disabled')
    } else {
      card.buy.removeAttribute('aria-disabled')
      card.buy.classList.remove('is-soft-disabled')
    }
  }
}

/** 打开档位对应的公共支付弹窗。 */
async function openPlanCheckout(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState,
  productId: string
): Promise<void> {
  const card = elements.buyableCards.get(productId)
  if (!card) {
    return
  }
  if (hasActiveMapsSubscription(state)) {
    setMessage(card.error, copy.plans.alreadyActive)
    return
  }
  if (!state.token || !state.user) {
    window.pricingAuthController?.open()
    return
  }

  const plan = state.plans.get(productId)
  const channel = getDefaultPricingPaymentChannel(plan?.payment_channels ?? [])
  if (!plan || !channel) {
    setMessage(card.error, copy.plans.noChannels)
    return
  }
  setMessage(card.error, '')

  reportGA4Event('upgrade_cta_click', {
    source: state.isExtensionSource ? EXTENSION_UTM_SOURCE : 'pricing',
    location: 'plan_card',
    plan: productId
  })

  await window.orderCheckoutController?.open({
    source: 'pricing_maps',
    product: {
      productClass: plan.product_class,
      productId: plan.product_id,
      title: `${copy.checkout.productTitlePrefix} ${plan.product_name}`,
      priceText: formatPricingDisplayPrice(plan),
      usageNotice: copy.checkout.usageNotice,
      successTitle: copy.checkout.successTitle,
      successDescription: copy.checkout.successDescription,
      successPrimaryText: plan.product_name,
      successSecondaryText: copy.checkout.successDescription,
      paymentChannels: plan.payment_channels
    }
  })
}

/** 当前账号是否有未过期的 Maps 产品线订阅（同线重复购买拦截口径与后端一致）。 */
function hasActiveMapsSubscription(state: PricingState): boolean {
  const subscription = state.user?.maps_subscription ?? null
  if (subscription?.status !== 'active' || subscription.expires_at == null) {
    return false
  }
  return normalizeTimestampMs(subscription.expires_at) > Date.now()
}

/** 登录成功后用账号 token 重新加载配置与账户摘要。 */
async function handlePricingAuthSuccess(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState,
  payload: PricingAuthSuccessPayload
): Promise<void> {
  state.token = payload.token
  state.user = payload.user
  setHidden(elements.accountError, true)
  renderAccount(elements, copy, state)
  await loadPlans(elements, copy, state)
}

/** 支付成功后刷新账户套餐摘要与按钮态。 */
async function handleOrderCheckoutSuccess(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState,
  payload: OrderCheckoutSuccessPayload
): Promise<void> {
  if (payload.source !== 'pricing_maps') {
    return
  }
  try {
    state.user = await getCurrentUser(buildRequestContext(state))
    renderAccount(elements, copy, state)
    renderPlanButtons(elements, copy, state)
  } catch (error) {
    console.error(error)
    setMessage(elements.accountError, error instanceof Error ? error.message : copy.account.loadFailed)
  }
}

/** 价格更新后重载配置，让按钮按新价重新可用。 */
async function handleOrderCheckoutPriceUpdated(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState,
  payload: OrderCheckoutPriceUpdatedPayload
): Promise<void> {
  if (payload.source !== 'pricing_maps') {
    return
  }
  await loadPlans(elements, copy, state)
}

/** Pricing 页退出登录后同步刷新账号与按钮态。 */
async function logoutPricingUser(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState
): Promise<void> {
  try {
    if (state.token) {
      await logoutCurrentUser(buildRequestContext(state))
    }
  } catch (error) {
    console.error(error)
  } finally {
    clearStoredAccessToken()
    state.token = null
    state.user = null
    state.loadVersion += 1
    setAccountMenuOpen(elements, false)
    renderAccount(elements, copy, state)
    renderPlanButtons(elements, copy, state)
  }
}

/** 构建请求上下文。 */
function buildRequestContext(state: PricingState): RequestContext {
  return {
    deviceId: state.deviceId,
    token: state.token
  }
}

/** 控制账号菜单展开，保持和首页账号按钮一致的交互。 */
function setAccountMenuOpen(elements: PricingElements, open: boolean): void {
  setHidden(elements.accountMenu, !open)
  elements.accountButton.setAttribute('aria-expanded', open ? 'true' : 'false')
}

/** 渲染和首页下载区一致的账号头像：有图片用图片，否则回退邮箱首字母。 */
function renderUserAvatar(elements: PricingElements, user: HomepageUserInfo): void {
  const avatarUrl = user.avatar_url?.trim()
  if (avatarUrl) {
    elements.userAvatar.src = avatarUrl
    elements.userAvatar.hidden = false
    elements.userInitial.textContent = ''
    setHidden(elements.userInitial, true)
    return
  }

  elements.userAvatar.removeAttribute('src')
  elements.userAvatar.hidden = true
  elements.userInitial.textContent = getAccountInitial(user.email)
  setHidden(elements.userInitial, false)
}

/** 账号首字母兜底。 */
function getAccountInitial(value: string): string {
  const first = value.trim().charAt(0)
  return first ? first.toUpperCase() : 'U'
}

/** 格式化到期时间。 */
function formatTimestamp(value: number | null): string {
  if (!value) {
    return ''
  }
  return new Intl.DateTimeFormat(document.documentElement.lang || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(normalizeTimestampMs(value)))
}

/** 后端历史上可能返回秒或毫秒，页面只负责统一展示。 */
function normalizeTimestampMs(value: number): number {
  return value < 10_000_000_000 ? value * 1000 : value
}

/** 设置文本并同步 hidden。 */
function setMessage(element: HTMLElement, message: string): void {
  element.textContent = message
  setHidden(element, message.length === 0)
}

/** 控制 hidden。 */
function setHidden(element: HTMLElement, hidden: boolean): void {
  element.hidden = hidden
}

/** 从 JSON script 读取文案。 */
function getPricingCopy(root: HTMLElement): PricingCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-pricing-copy]')
  if (!element?.textContent) {
    throw new Error('[pricing-page-controller] Missing pricing copy payload.')
  }
  return JSON.parse(element.textContent) as PricingCopy
}

/** 查询页面 DOM。 */
function getPricingElements(root: HTMLElement): PricingElements {
  const buyableCards = new Map<string, BuyableCardElements>()
  for (const productId of BUYABLE_PLAN_IDS) {
    const buy = root.querySelector<HTMLButtonElement>(`[data-pricing-buy="${productId}"]`)
    const error = root.querySelector<HTMLElement>(`[data-plan-error="${productId}"]`)
    if (buy && error) {
      buyableCards.set(PLAN_PRODUCT_IDS[productId], { buy, error })
    }
  }

  return {
    root,
    accountLoading: query<HTMLElement>(root, '[data-pricing-account-loading]'),
    accountSignedOut: query<HTMLElement>(root, '[data-pricing-account-signed-out]'),
    accountSignedIn: query<HTMLElement>(root, '[data-pricing-account-signed-in]'),
    accountError: query<HTMLElement>(root, '[data-pricing-account-error]'),
    loginButtons: Array.from(root.querySelectorAll<HTMLButtonElement>('[data-pricing-login]')),
    accountButton: query<HTMLButtonElement>(root, '[data-pricing-account-button]'),
    accountMenu: query<HTMLElement>(root, '[data-pricing-account-menu]'),
    accountEmail: query<HTMLElement>(root, '[data-pricing-account-email]'),
    accountLogout: query<HTMLButtonElement>(root, '[data-pricing-account-logout]'),
    userAvatar: query<HTMLImageElement>(root, '[data-pricing-user-avatar]'),
    userInitial: query<HTMLElement>(root, '[data-pricing-user-initial]'),
    userPlan: query<HTMLElement>(root, '[data-pricing-user-plan]'),
    userExpires: query<HTMLElement>(root, '[data-pricing-user-expires]'),
    cancellationGuideButton: query<HTMLButtonElement>(root, '[data-pricing-cancellation-guide-button]'),
    cancellationGuideDialog: query<HTMLDialogElement>(root, '[data-pricing-cancellation-guide]'),
    plansStatus: query<HTMLElement>(root, '[data-pricing-plans-status]'),
    buyableCards
  }
}

/** 查询必需元素。 */
function query<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const element = root.querySelector<T>(selector)
  if (!element) {
    throw new Error(`[pricing-page-controller] Missing element: ${selector}`)
  }
  return element
}

const root = document.querySelector<HTMLElement>('[data-pricing-page]')
if (root) {
  void initPricingPage(root).catch(error => {
    console.error(error)
  })
}
