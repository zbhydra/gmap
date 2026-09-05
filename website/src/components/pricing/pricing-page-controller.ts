/**
 * Pricing 页面控制器（三产品线 tab 版）。
 *
 * 负责恢复登录态、产品线 tab 切换、渲染账户胶囊（当前 tab 产品线的订阅摘要）、
 * 加载支付配置并把付费档购买流程交给公共 OrderCheckoutModal。当前 tab 是唯一
 * 状态源：灰化/重复购买拦截、checkout source、GA4 plan 维度均由当前 tab 派生。
 * 插件来源（utm_source=extension）只做归因标记，不切换布局。
 */

import {
  clearStoredAccessToken,
  getCurrentUser,
  getStoredAccessToken,
  logoutCurrentUser,
  type HomepageUserInfo,
  type HomepageUserSubscription
} from '../../scripts/homepage/auth'
import { ensureDeviceId } from '../../scripts/homepage/device'
import { reportGA4Event } from '../../scripts/homepage/ga4'
import type { PricingPageContent } from '../../i18n/schema'
import { postJson, type JsonObject, type JsonValue, type RequestContext } from '../../scripts/homepage/api'
import {
  ORDER_CHECKOUT_AUTH_INVALID_EVENT,
  ORDER_CHECKOUT_PRICE_UPDATED_EVENT,
  ORDER_CHECKOUT_SUCCESS_EVENT,
  type OrderCheckoutAuthInvalidPayload,
  type OrderCheckoutPaymentOption,
  type OrderCheckoutPriceUpdatedPayload,
  type OrderCheckoutSuccessPayload
} from '../order-checkout/order-checkout-types'
import {
  getDefaultOrderPaymentChannel,
  isOrderCheckoutAuthFailure
} from '../order-checkout/order-checkout-api'
import {
  MAPS_API_PRODUCT_LINE,
  MAPS_EXTENSION_PRODUCT_LINE,
  MAPS_ONLINE_PRODUCT_LINE,
  formatPricingDisplayPrice,
  formatSubscriptionPeriod,
  getSubscriptionUpgradeQuote,
  listSubscriptionCheckoutConfigs,
  pickPlansByLine,
  type SubscriptionCheckoutPlan,
  type SubscriptionUpgradeQuote
} from './pricing-checkout'
import {
  PRICING_AUTH_CLOSE_EVENT,
  PRICING_AUTH_SUCCESS_EVENT,
  type PricingAuthSuccessPayload
} from './pricing-auth-controller'

/** 插件升级入口的 utm_source 值（W7 插件「订阅跳转按钮」落本页时携带）。 */
const EXTENSION_UTM_SOURCE = 'extension'
/** 同 tab Google OAuth 回跳后恢复订阅购买的会话键。 */
const PENDING_SUBSCRIPTION_PURCHASE_KEY = 'pricing_pending_subscription_purchase'

/** Pricing 页产品线（与 i18n tab 键、后端 product_line 三方对齐）。 */
type PricingLineId = 'online' | 'extension' | 'api'

const PRICING_LINE_IDS: readonly PricingLineId[] = ['online', 'extension', 'api']

/** 默认展示的产品线 tab（与 SSR 首个可见面板一致）。 */
const DEFAULT_PRICING_LINE: PricingLineId = 'online'

/** 产品线 → 后端契约常量（product_line / checkout source / auth/me 订阅字段）。 */
interface PricingLineConfig {
  /** 后端 product_line 常量。 */
  productLine: string
  /** 打开 checkout 弹窗与识别成功/价格变更事件用的业务来源。 */
  checkoutSource: string
  /** auth/me 中本线订阅摘要字段。 */
  subscriptionKey: 'maps_online_subscription' | 'maps_extension_subscription' | 'maps_api_subscription'
}

const PRICING_LINE_CONFIG: Record<PricingLineId, PricingLineConfig> = {
  online: {
    productLine: MAPS_ONLINE_PRODUCT_LINE,
    checkoutSource: 'pricing_maps_online',
    subscriptionKey: 'maps_online_subscription'
  },
  extension: {
    productLine: MAPS_EXTENSION_PRODUCT_LINE,
    checkoutSource: 'pricing_maps_extension',
    subscriptionKey: 'maps_extension_subscription'
  },
  api: {
    productLine: MAPS_API_PRODUCT_LINE,
    checkoutSource: 'pricing_maps_api',
    subscriptionKey: 'maps_api_subscription'
  }
}

/** 页面文案（PricingPageContent 的 controller 消费子集）。 */
interface PricingCopy {
  account: {
    planLabel: string
    noExpiry: string
    freePlan: string
    loadFailed: string
    /** 有效自动续费订阅的管理入口按钮。 */
    manageSubscription: string
    /** 管理入口请求期间的加载文案。 */
    managingSubscription: string
  }
  tabs: Record<
    PricingLineId,
    {
      checkout: {
        usageNotice: string
        successTitle: string
        successDescription: string
      }
    }
  >
  plans: {
    loading: string
    loadFailed: string
    noChannels: string
    productTitlePrefix: string
    /** 支付选项的周期说明（当前商品均为月度）。 */
    billingPeriodMonthly: string
    /** 自动续费商品的计费说明。 */
    billingAutoRenew: string
    /** 一次性商品的计费说明。 */
    billingOneTime: string
  }
  /** 支付窗口被浏览器拦截时的引导文案（与 checkout 弹窗共用单键）。 */
  popupBlocked: string
  upgrade: PricingPageContent['upgrade']
}

/** 单个可购买档位卡的 DOM 集合。 */
interface BuyableCardElements {
  /** 卡所属产品线 tab。 */
  line: PricingLineId
  /** 购买按钮。 */
  buy: HTMLButtonElement
  /** 卡内错误提示行。 */
  error: HTMLElement
  /** SSR 的普通购买标签，退出登录后恢复。 */
  label: string
}

/** 页面 DOM 集合。 */
interface PricingElements {
  /** 页面根节点。 */
  root: HTMLElement
  /** 产品线 tab 按钮（keyed by line）。 */
  tabButtons: Map<PricingLineId, HTMLButtonElement>
  /** 产品线面板（keyed by line）。 */
  panels: Map<PricingLineId, HTMLElement>
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
  /** 有效自动续费订阅的渠道管理入口按钮。 */
  manageSubscriptionButton: HTMLButtonElement
  /** 渠道内操作指引弹窗（管理入口 URL 为空时的兜底）。 */
  cancellationGuideDialog: HTMLDialogElement
  /** 支付配置加载状态行。 */
  plansStatus: HTMLElement
  /** 可购买档位卡（SKU → DOM）。 */
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
  /** 全部产品线商品配置（SKU → plan）。 */
  plans: Map<string, SubscriptionCheckoutPlan>
  /** 每张卡的服务端升级报价；不从展示顺序或价格推导档位。 */
  upgradeQuotes: Map<string, SubscriptionUpgradeQuote | null>
  /** 最近一次配置请求版本；旧响应不得覆盖新登录态。 */
  loadVersion: number
  /** 当前产品线 tab（唯一状态源，其余视图状态由它派生）。 */
  currentLine: PricingLineId
  /** 是否为插件升级入口（W7 归因口径）。 */
  isExtensionSource: boolean
  /** 登录成功后一次性恢复的订阅购买意图。 */
  pendingSubscriptionPurchase: PendingSubscriptionPurchase | null
}

/** 匿名点击时选中的稳定价格选项身份。 */
interface PendingSubscriptionPurchase {
  /** 购买按钮所属产品线 tab。 */
  line: PricingLineId
  /** 档位 SKU。 */
  sku: string
  /** 选中的购买选项 ID。 */
  productPriceId: number
  /** 选中的支付方式。 */
  paymentMethod: string
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
    upgradeQuotes: new Map(),
    loadVersion: 0,
    currentLine: DEFAULT_PRICING_LINE,
    isExtensionSource: new URLSearchParams(window.location.search).get('utm_source') === EXTENSION_UTM_SOURCE,
    pendingSubscriptionPurchase: readPendingSubscriptionPurchase()
  }
  applyExtensionAttribution(elements, state)
  const productLine = new URLSearchParams(window.location.search).get('product_line')
  switchLine(elements, state, PRICING_LINE_IDS.find(
    line => PRICING_LINE_CONFIG[line].productLine === productLine
  ) ?? DEFAULT_PRICING_LINE)

  bindEvents(elements, copy, state)
  await Promise.all([restoreUser(elements, copy, state), loadPlans(elements, copy, state)])
  await loadUpgradeQuotes(elements, copy, state)
}

/** 绑定页面事件。 */
function bindEvents(elements: PricingElements, copy: PricingCopy, state: PricingState): void {
  for (const button of elements.loginButtons) {
    button.addEventListener('click', () => {
      window.pricingAuthController?.open()
    })
  }

  for (const [line, button] of elements.tabButtons) {
    button.addEventListener('click', () => {
      switchLine(elements, state, line)
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

  elements.manageSubscriptionButton.addEventListener('click', () => {
    void openManageSubscription(elements, copy, state)
  })

  elements.cancellationGuideDialog.addEventListener('click', event => {
    if (event.target === elements.cancellationGuideDialog) {
      elements.cancellationGuideDialog.close()
    }
  })

  elements.cancellationGuideDialog.addEventListener('close', () => {
    if (!elements.manageSubscriptionButton.hidden) {
      elements.manageSubscriptionButton.focus()
    }
  })

  for (const [sku, card] of elements.buyableCards) {
    card.buy.addEventListener('click', () => {
      void openPlanCheckout(elements, copy, state, card.line, sku).catch(error => {
        console.error(error)
        setMessage(card.error, copy.plans.loadFailed)
      })
    })
  }

  window.addEventListener(PRICING_AUTH_SUCCESS_EVENT, event => {
    const payload = (event as CustomEvent<PricingAuthSuccessPayload>).detail
    void handlePricingAuthSuccess(elements, copy, state, payload)
  })

  window.addEventListener(PRICING_AUTH_CLOSE_EVENT, () => {
    clearPendingSubscriptionPurchase(state)
  })

  window.addEventListener(ORDER_CHECKOUT_SUCCESS_EVENT, event => {
    void handleOrderCheckoutSuccess(elements, copy, state, (event as CustomEvent<OrderCheckoutSuccessPayload>).detail)
  })

  window.addEventListener(ORDER_CHECKOUT_AUTH_INVALID_EVENT, event => {
    const payload = (event as CustomEvent<OrderCheckoutAuthInvalidPayload>).detail
    clearStoredAccessToken()
    state.token = null
    state.user = null
    state.upgradeQuotes.clear()
    state.loadVersion += 1
    renderAccount(elements, copy, state)
    window.pricingAuthController?.open()
    setMessage(elements.accountError, payload.message || copy.plans.loadFailed)
  })

  window.addEventListener(ORDER_CHECKOUT_PRICE_UPDATED_EVENT, event => {
    void handleOrderCheckoutPriceUpdated(elements, copy, state, (event as CustomEvent<OrderCheckoutPriceUpdatedPayload>).detail)
  })
}

/** 登录与配置加载完成后请求各卡报价，旧登录态响应沿用既有版本门禁。 */
async function loadUpgradeQuotes(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState
): Promise<void> {
  const requestVersion = ++state.loadVersion
  state.upgradeQuotes.clear()
  renderPlanButtons(elements, copy, state)
  await Promise.all(Array.from(elements.buyableCards, async ([sku, card]) => {
    if (!hasActiveLineSubscription(state, card.line)) {
      return
    }
    try {
      const quote = await getSubscriptionUpgradeQuote(
        buildRequestContext(state), PRICING_LINE_CONFIG[card.line].productLine, sku
      )
      if (requestVersion !== state.loadVersion) {
        return
      }
      state.upgradeQuotes.set(sku, quote)
    } catch (error) {
      console.error(error)
      if (requestVersion === state.loadVersion) {
        state.upgradeQuotes.set(sku, null)
      }
    }
  }))
  if (requestVersion === state.loadVersion) {
    renderPlanButtons(elements, copy, state)
    reportVisibleUpgradeQuotes(state, elements)
  }
}

/** 切换产品线 tab：面板可见性与账户胶囊摘要都随当前线刷新。 */
function switchLine(elements: PricingElements, state: PricingState, line: PricingLineId): void {
  state.currentLine = line
  for (const [tabLine, button] of elements.tabButtons) {
    button.setAttribute('aria-selected', tabLine === line ? 'true' : 'false')
  }
  for (const [tabLine, panel] of elements.panels) {
    panel.hidden = tabLine !== line
  }
  renderAccount(elements, getPricingCopy(elements.root), state)
  renderPlanButtons(elements, getPricingCopy(elements.root), state)
  reportVisibleUpgradeQuotes(state, elements)
}

/** 报价随卡片所在 tab 可见时曝光，不上报隐藏面板。 */
function reportVisibleUpgradeQuotes(state: PricingState, elements: PricingElements): void {
  for (const [sku, quote] of state.upgradeQuotes) {
    if (quote?.available && elements.buyableCards.get(sku)?.line === state.currentLine) {
      reportGA4Event('upgrade_quote_shown', {
        current_plan: quote.current_product_id ?? undefined,
        target_plan: sku,
        amount: quote.amount ?? undefined
      })
    }
  }
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
    if (error instanceof Error && isOrderCheckoutAuthFailure(error)) {
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

/** 加载全部产品线支付配置并渲染购买按钮（导出供 module-scripts 回归测试）。 */
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
    // 各线商品按 SKU 索引合并；SKU 全局唯一，卡查找不依赖当前 tab。
    state.plans = new Map()
    for (const line of PRICING_LINE_IDS) {
      for (const [sku, plan] of pickPlansByLine(data.plans, PRICING_LINE_CONFIG[line].productLine)) {
        state.plans.set(sku, plan)
      }
    }
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

/** 读取指定产品线在 auth/me 中的订阅摘要。 */
function getLineSubscription(
  state: PricingState,
  line: PricingLineId
): HomepageUserSubscription | null {
  return state.user?.[PRICING_LINE_CONFIG[line].subscriptionKey] ?? null
}

/** 渲染账户胶囊：登录态切换 + 当前 tab 产品线的套餐摘要。 */
function renderAccount(elements: PricingElements, copy: PricingCopy, state: PricingState): void {
  const user = state.user
  setHidden(elements.accountSignedOut, Boolean(user))
  setHidden(elements.accountSignedIn, !user)
  renderManageSubscriptionButton(elements, state)

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

  const subscription = getLineSubscription(state, state.currentLine)
  const isUnavailable = subscription?.status === 'unavailable'
  const hasActivePlan = !isUnavailable && subscription?.expires_at != null
  elements.userPlan.textContent = hasActivePlan
    ? subscription?.display_name || copy.account.freePlan
    : copy.account.freePlan
  elements.userExpires.textContent = hasActivePlan
    ? formatTimestamp(subscription?.expires_at ?? null)
    : copy.account.noExpiry
}

/** 只有当前 tab 产品线存在有效且自动续费的订阅时展示渠道管理入口。 */
function canShowCancellationGuide(state: PricingState): boolean {
  const subscription = getLineSubscription(state, state.currentLine)
  if (subscription?.status !== 'active' || subscription.expires_at == null) {
    return false
  }
  return subscription.auto_renew === true
}

/** 渲染渠道管理入口按钮可见性。 */
function renderManageSubscriptionButton(elements: PricingElements, state: PricingState): void {
  setHidden(elements.manageSubscriptionButton, !canShowCancellationGuide(state))
}

/** 同步预开空白渠道管理窗口：必须在用户手势调用栈内执行，避免 popup 被拦截后已发管理请求。 */
function openManageWindow(): Window | null {
  const popup = window.open('', '_blank')
  if (popup) {
    popup.opener = null
  }
  return popup
}

/** 打开当前产品线自动续费订阅的渠道管理页；URL 为空时展示渠道内操作指引。 */
async function openManageSubscription(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState
): Promise<void> {
  // 入口按钮只在已登录（token/user 成对设置）且当前线存在有效自动续费订阅时可见，
  // 未登录分支不可达，不做对称防御。
  if (elements.cancellationGuideDialog.open) {
    return
  }

  const manageWindow = openManageWindow()
  if (!manageWindow) {
    setMessage(elements.accountError, copy.popupBlocked)
    return
  }

  // 预开窗口成功后清掉上次可能残留的 popupBlocked 等错误，再发管理请求。
  setMessage(elements.accountError, '')

  const button = elements.manageSubscriptionButton
  button.disabled = true
  button.textContent = copy.account.managingSubscription
  try {
    const url = await createSubscriptionManagementUrl(state)
    if (url) {
      if (!manageWindow.closed) {
        manageWindow.location.href = url
      }
    } else {
      manageWindow.close()
      elements.cancellationGuideDialog.showModal()
    }
  } catch (error) {
    console.error(error)
    manageWindow.close()
    setMessage(elements.accountError, error instanceof Error ? error.message : copy.account.loadFailed)
  } finally {
    button.disabled = false
    button.textContent = copy.account.manageSubscription
  }
}

/** 请求当前产品线的渠道管理入口；后端按订阅实例选择渠道，返回 URL 可为空。 */
async function createSubscriptionManagementUrl(state: PricingState): Promise<string | null> {
  const response = await postJson<{ url: string | null }>(
    '/api/client/subscription/management',
    buildRequestContext(state),
    { product_line: PRICING_LINE_CONFIG[state.currentLine].productLine }
  )
  const url = typeof response.url === 'string' ? response.url.trim() : ''
  return url.length > 0 ? url : null
}

/** 按当前配置与登录态刷新可购买卡按钮（灰化按卡所属产品线的订阅状态）。 */
function renderPlanButtons(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState
): void {
  for (const [sku, card] of elements.buyableCards) {
    const plan = state.plans.get(sku)
    const hasChannel = Boolean(getDefaultOrderPaymentChannel(plan?.payment_channels ?? []))
    card.buy.disabled = !plan || !hasChannel
    card.buy.textContent = card.label
    // 配置整体缺失由全局状态行说明；单卡仅在商品存在但无渠道时提示。
    setMessage(card.error, plan && !hasChannel ? copy.plans.noChannels : '')
    if (hasActiveLineSubscription(state, card.line)) {
      const quote = state.upgradeQuotes.get(sku)
      card.buy.disabled = !plan || !quote?.available
      if (quote?.current_product_id === sku) {
        card.buy.textContent = copy.upgrade.currentPlan
        setMessage(card.error, '')
      } else if (quote?.available && quote.amount !== null && quote.currency !== null) {
        card.buy.textContent = copy.upgrade.button.replace('{amount}', formatPricingDisplayPrice({
          amount: quote.amount, currency: quote.currency
        }))
        setMessage(card.error, '')
      } else {
        setMessage(card.error, quote?.reason
          ? copy.upgrade.reasons[quote.reason]
          : quote === null ? copy.upgrade.quoteFailed : copy.plans.loading)
      }
    }
  }
}

/** 打开档位对应的公共支付弹窗（重复购买拦截按卡所属产品线）。 */
async function openPlanCheckout(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState,
  line: PricingLineId,
  sku: string,
  intendedPurchase: PendingSubscriptionPurchase | null = null
): Promise<void> {
  const card = elements.buyableCards.get(sku)
  if (!card) {
    return
  }
  const plan = state.plans.get(sku)
  if (plan && hasActiveLineSubscription(state, line)) {
    const quote = state.upgradeQuotes.get(sku)
    if (quote?.available) {
      await openUpgradeCheckout(copy, state, line, plan, quote)
    }
    return
  }
  const channel = intendedPurchase && plan && plan.product_id === sku
    ? plan.payment_channels.find(
        option =>
          option.product_price_id === intendedPurchase.productPriceId &&
          option.payment_method === intendedPurchase.paymentMethod
      ) ?? null
    : getDefaultOrderPaymentChannel(plan?.payment_channels ?? [])
  if (!plan || !channel) {
    setMessage(card.error, copy.plans.noChannels)
    return
  }

  if (!state.token || !state.user) {
    savePendingSubscriptionPurchase(state, {
      line,
      sku,
      productPriceId: channel.product_price_id,
      paymentMethod: channel.payment_method
    })
    window.pricingAuthController?.open()
    return
  }

  setMessage(card.error, '')

  const tabCheckout = copy.tabs[line].checkout
  const periodLabel = formatSubscriptionPeriod(
    plan.period,
    copy.plans.billingPeriodMonthly,
    document.documentElement.lang || 'en-US'
  )
  await window.orderCheckoutController?.open({
    source: PRICING_LINE_CONFIG[line].checkoutSource,
    initialPaymentMethod: channel.payment_method,
    product: {
      productClass: plan.product_class,
      productId: plan.product_id,
      autoRenew: plan.auto_renew,
      period: plan.period,
      title: `${copy.plans.productTitlePrefix} ${plan.product_name}`,
      priceText: formatPricingDisplayPrice(plan),
      usageNotice: tabCheckout.usageNotice,
      successTitle: tabCheckout.successTitle,
      successDescription: tabCheckout.successDescription,
      successPrimaryText: plan.product_name,
      successSecondaryText: tabCheckout.successDescription,
      paymentChannels: plan.payment_channels.map<OrderCheckoutPaymentOption>(option => ({
        ...option,
        priceText: formatPricingDisplayPrice(option),
        detailText: [
          periodLabel,
          plan.auto_renew ? copy.plans.billingAutoRenew : copy.plans.billingOneTime,
          tabCheckout.usageNotice
        ].join(' · ')
      }))
    }
  })
}

/** 仅传服务端报价的固定渠道快照；收银台提交时由服务端重新计算补差。 */
async function openUpgradeCheckout(
  copy: PricingCopy,
  state: PricingState,
  line: PricingLineId,
  plan: SubscriptionCheckoutPlan,
  quote: SubscriptionUpgradeQuote
): Promise<void> {
  if (quote.payment_method === null || quote.amount === null || quote.currency === null) {
    throw new Error('[pricing-page-controller] 可升级报价缺少渠道或金额。')
  }
  const channelName = plan.payment_channels.find(
    channel => channel.payment_method === quote.payment_method
  )?.payment_method_name ?? quote.payment_method
  const autoRenew = getLineSubscription(state, line)?.auto_renew === true
  const expiry = formatTimestamp(quote.expires_at)
  const priceText = formatPricingDisplayPrice({ amount: quote.amount, currency: quote.currency })
  const detailText = (autoRenew ? copy.upgrade.autoRenew : copy.upgrade.oneTime)
    .replace('{date}', expiry).replace('{channel}', channelName)
  await window.orderCheckoutController?.open({
    source: PRICING_LINE_CONFIG[line].checkoutSource,
    upgrade: {
      productLine: plan.product_line,
      currentProductId: quote.current_product_id,
      copy: copy.upgrade
    },
    product: {
      productClass: plan.product_class,
      productId: plan.product_id,
      autoRenew,
      period: plan.period,
      title: `${copy.plans.productTitlePrefix} ${plan.product_name}`,
      priceText,
      usageNotice: detailText,
      successTitle: copy.upgrade.successTitle,
      successDescription: copy.upgrade.successDescription.replace('{date}', expiry),
      successPrimaryText: plan.product_name,
      paymentChannels: [{
        payment_method: quote.payment_method,
        payment_method_name: channelName,
        currency: quote.currency,
        amount: quote.amount
      }]
    }
  })
}

/** 当前账号在指定产品线是否有未过期订阅（同线重复购买拦截口径与后端一致）。 */
function hasActiveLineSubscription(state: PricingState, line: PricingLineId): boolean {
  const subscription = getLineSubscription(state, line)
  if (subscription?.status !== 'active' || subscription.expires_at == null) {
    return false
  }
  return normalizeTimestampMs(subscription.expires_at) > Date.now()
}

/** 登录成功后用账号 token 重新加载配置与账户摘要，并恢复登录前的购买意图。 */
async function handlePricingAuthSuccess(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState,
  payload: PricingAuthSuccessPayload
): Promise<void> {
  const pendingPurchase = consumePendingSubscriptionPurchase(state)
  state.token = payload.token
  state.user = payload.user
  setHidden(elements.accountError, true)
  renderAccount(elements, copy, state)
  await loadPlans(elements, copy, state)
  await loadUpgradeQuotes(elements, copy, state)
  if (pendingPurchase) {
    await openPlanCheckout(
      elements,
      copy,
      state,
      pendingPurchase.line,
      pendingPurchase.sku,
      pendingPurchase
    ).catch(error => {
      console.error(error)
      setMessage(elements.accountError, error instanceof Error ? error.message : copy.account.loadFailed)
    })
  }
}

/** 保存内存与同 tab OAuth 回跳共用的一次性购买意图。 */
function savePendingSubscriptionPurchase(
  state: PricingState,
  purchase: PendingSubscriptionPurchase
): void {
  state.pendingSubscriptionPurchase = purchase
  window.sessionStorage.setItem(PENDING_SUBSCRIPTION_PURCHASE_KEY, JSON.stringify(purchase))
}

/** 登录成功时先清除会话值，再返回本次唯一待恢复意图。 */
function consumePendingSubscriptionPurchase(
  state: PricingState
): PendingSubscriptionPurchase | null {
  const purchase = state.pendingSubscriptionPurchase ?? readPendingSubscriptionPurchase()
  clearPendingSubscriptionPurchase(state)
  return purchase
}

/** 用户放弃登录时同时清除内存与同 tab 会话中的购买意图。 */
function clearPendingSubscriptionPurchase(state: PricingState): void {
  state.pendingSubscriptionPurchase = null
  window.sessionStorage.removeItem(PENDING_SUBSCRIPTION_PURCHASE_KEY)
}

/** 从 OAuth 前页面留下的会话值读取并严格校验价格选项身份。 */
function readPendingSubscriptionPurchase(): PendingSubscriptionPurchase | null {
  const raw = window.sessionStorage.getItem(PENDING_SUBSCRIPTION_PURCHASE_KEY)
  if (!raw) {
    return null
  }

  let value: JsonValue
  try {
    value = JSON.parse(raw) as JsonValue
  } catch (error) {
    console.error(error)
    window.sessionStorage.removeItem(PENDING_SUBSCRIPTION_PURCHASE_KEY)
    return null
  }
  if (
    !isJsonObject(value) ||
    typeof value.line !== 'string' ||
    !PRICING_LINE_IDS.includes(value.line as PricingLineId) ||
    typeof value.sku !== 'string' ||
    value.sku.length === 0 ||
    typeof value.productPriceId !== 'number' ||
    !Number.isInteger(value.productPriceId) ||
    value.productPriceId <= 0 ||
    typeof value.paymentMethod !== 'string' ||
    value.paymentMethod.length === 0
  ) {
    window.sessionStorage.removeItem(PENDING_SUBSCRIPTION_PURCHASE_KEY)
    return null
  }
  return {
    line: value.line as PricingLineId,
    sku: value.sku,
    productPriceId: value.productPriceId,
    paymentMethod: value.paymentMethod
  }
}

/** 判断 JSON 值是否为可按字段读取的对象。 */
function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 支付成功后刷新账户套餐摘要与按钮态。 */
async function handleOrderCheckoutSuccess(
  elements: PricingElements,
  copy: PricingCopy,
  state: PricingState,
  payload: OrderCheckoutSuccessPayload
): Promise<void> {
  if (!isPricingCheckoutSource(payload.source)) {
    return
  }
  try {
    state.user = await getCurrentUser(buildRequestContext(state))
    renderAccount(elements, copy, state)
    await loadUpgradeQuotes(elements, copy, state)
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
  if (!isPricingCheckoutSource(payload.source)) {
    return
  }
  await loadPlans(elements, copy, state)
  await loadUpgradeQuotes(elements, copy, state)
}

/** 判断 checkout 事件来源是否为本页任一产品线。 */
function isPricingCheckoutSource(source: string): boolean {
  return PRICING_LINE_IDS.some(line => PRICING_LINE_CONFIG[line].checkoutSource === source)
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
    state.upgradeQuotes.clear()
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

/** 判断元素所属产品线 tab（向上找面板容器）。 */
function resolveCardLine(buy: HTMLButtonElement): PricingLineId | null {
  const panel = buy.closest<HTMLElement>('[data-pricing-panel]')
  const line = panel?.dataset.pricingPanel
  if (line && (PRICING_LINE_IDS as readonly string[]).includes(line)) {
    return line as PricingLineId
  }
  return null
}

/** 查询页面 DOM。 */
function getPricingElements(root: HTMLElement): PricingElements {
  const tabButtons = new Map<PricingLineId, HTMLButtonElement>()
  const panels = new Map<PricingLineId, HTMLElement>()
  const buyableCards = new Map<string, BuyableCardElements>()

  for (const line of PRICING_LINE_IDS) {
    const tab = root.querySelector<HTMLButtonElement>(`[data-pricing-tab="${line}"]`)
    const panel = root.querySelector<HTMLElement>(`[data-pricing-panel="${line}"]`)
    if (tab && panel) {
      tabButtons.set(line, tab)
      panels.set(line, panel)
    }
  }

  for (const buy of root.querySelectorAll<HTMLButtonElement>('[data-pricing-buy]')) {
    const sku = buy.dataset.pricingBuy
    const line = sku ? resolveCardLine(buy) : null
    if (!sku || !line) {
      continue
    }
    const error = root.querySelector<HTMLElement>(`[data-plan-error="${sku}"]`)
    if (error) {
      buyableCards.set(sku, { line, buy, error, label: buy.textContent?.trim() ?? '' })
    }
  }

  return {
    root,
    tabButtons,
    panels,
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
    manageSubscriptionButton: query<HTMLButtonElement>(root, '[data-pricing-manage-subscription]'),
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
