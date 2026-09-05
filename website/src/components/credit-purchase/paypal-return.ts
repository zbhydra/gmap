/**
 * 通用支付回跳页脚本。
 *
 * success 页轮询本地订单状态确认到账；cancel 页调用现有取消订单接口并通知
 * 原购买弹窗。文案支持两种来源：优先使用回跳页内 data-payment-return-copy
 * 钩子（Clink 等新页面），否则回退 PayPal 页的 JSON 载荷并按订单类别分发。
 */

import { getStoredAccessToken } from '../../scripts/homepage/auth'
import { ensureDeviceId } from '../../scripts/homepage/device'
import { postJson, type RequestContext } from '../../scripts/homepage/api'
import {
  classifyOrderStatus,
  getOrderStatus,
  isOrderCheckoutAuthFailure,
  isRecoverableOrderStatusError,
  type OrderStatusResponse
} from '../order-checkout/order-checkout-api'
import { SUBSCRIPTION_PRODUCT_CLASS } from '../pricing/pricing-checkout'
import type { AccountContent } from '../../i18n/schema'

/** PayPal 回跳页文案（success.astro 经 JSON script 注入）。 */
type PayPalReturnCopy = AccountContent['paypalReturn']

/** PayPal 返回页结果类型。 */
export type PayPalReturnStatus = 'success' | 'cancel'

/** PayPal 返回页初始化参数。 */
export interface PayPalReturnOptions {
  /** 当前页面类型。 */
  status: PayPalReturnStatus
  /** PayPal 返回携带的本地订单号。 */
  orderNo: string | null
}

/** 通用支付回跳页初始化参数。 */
export interface PaymentReturnOptions extends PayPalReturnOptions {
  /** 支付渠道。 */
  provider: 'paypal' | 'clink'
}

const PAYPAL_RETURN_CHANNEL = 'credit_purchase_paypal_return'
/** PayPal success 回跳页订单状态轮询间隔，毫秒。 */
export const PAYPAL_SUCCESS_POLL_INTERVAL_MS = 3000

/** success 回跳页等待状态。 */
type PayPalSuccessViewState = 'waiting' | 'confirmed' | 'failed'

/** 确认态展示语义：按订单产品线区分（maps=订阅口径，其余=Credits 口径）。 */
type PayPalConfirmedCopyKey = 'confirmedSubscriptionTitle' | 'confirmedCreditsTitle'

/** 按订单商品类别选取确认态文案键：订阅类走订阅口径，其余（Credits 充值）走积分口径。 */
function confirmedCopyKeys(
  status: Pick<OrderStatusResponse, 'product_class'> | undefined
): {
  titleKey: PayPalConfirmedCopyKey
  messageKey: 'confirmedSubscriptionMessage' | 'confirmedCreditsMessage'
} {
  if (status?.product_class === SUBSCRIPTION_PRODUCT_CLASS) {
    return { titleKey: 'confirmedSubscriptionTitle', messageKey: 'confirmedSubscriptionMessage' }
  }
  return { titleKey: 'confirmedCreditsTitle', messageKey: 'confirmedCreditsMessage' }
}

let successPollTimer: number | null = null
let successPollRunning = false

/** 初始化支付返回页行为。 */
export function initPaymentReturnPage(options: PaymentReturnOptions): void {
  const normalizedOptions: PaymentReturnOptions = {
    provider: options.provider,
    status: options.status,
    orderNo: resolveReturnOrderNo(options.orderNo)
  }

  if (normalizedOptions.status === 'success') {
    notifyOpener(normalizedOptions)
    startSuccessPolling(normalizedOptions)
    return
  }

  if (!normalizedOptions.orderNo) {
    notifyOpener(normalizedOptions)
    return
  }

  void cancelOrder(normalizedOptions.orderNo)
    .catch(error => {
      console.error(error)
    })
    .finally(() => {
      notifyOpener(normalizedOptions)
    })
}

/** 初始化 PayPal 返回页，保留现有页面入口。 */
export function initPayPalReturnPage(options: PayPalReturnOptions): void {
  initPaymentReturnPage({ ...options, provider: 'paypal' })
}

/** 从运行时 URL 兜底解析支付回跳携带的本地订单号。 */
function resolveReturnOrderNo(orderNo: string | null): string | null {
  const normalizedOrderNo = orderNo?.trim() || null
  if (normalizedOrderNo) {
    return normalizedOrderNo
  }

  return new URLSearchParams(window.location.search).get('order_no')?.trim() || null
}

/** 启动 success 页订单状态轮询。 */
function startSuccessPolling(options: PaymentReturnOptions): void {
  stopSuccessPolling()
  const { orderNo } = options
  if (!orderNo) {
    setSuccessViewState('failed')
    return
  }

  successPollTimer = window.setInterval(() => {
    void pollSuccessOrderStatus(orderNo, options.provider)
  }, PAYPAL_SUCCESS_POLL_INTERVAL_MS)
  setSuccessViewState('waiting')
  void pollSuccessOrderStatus(orderNo, options.provider)
}

/** 停止 success 页订单状态轮询。 */
function stopSuccessPolling(): void {
  if (successPollTimer === null) {
    return
  }
  window.clearInterval(successPollTimer)
  successPollTimer = null
}

/** 查询本地订单状态，只按后端已确认的订单状态更新 success 回跳页。 */
async function pollSuccessOrderStatus(
  orderNo: string,
  provider: PaymentReturnOptions['provider']
): Promise<void> {
  if (successPollRunning) {
    return
  }
  successPollRunning = true

  try {
    const context = await buildRequestContext()
    if (!context) {
      stopSuccessPolling()
      setSuccessViewState('failed')
      return
    }

    const status = await getOrderStatus(context, orderNo)
    const outcome = classifyOrderStatus(status)
    if (outcome === 'paid') {
      stopSuccessPolling()
      setSuccessViewState('confirmed', status)
      notifyOpener({ provider, status: 'success', orderNo })
      return
    }
    if (outcome !== 'pending') {
      stopSuccessPolling()
      setSuccessViewState('failed')
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      if (isOrderCheckoutAuthFailure(error) || isRecoverableOrderStatusError(error)) {
        stopSuccessPolling()
        setSuccessViewState('failed')
      }
      return
    }
    console.error(
      new Error(
        `[payment-return] pollSuccessOrderStatus failed with non-error value: order_no=${orderNo}, value=${String(error)}`
      )
    )
    stopSuccessPolling()
    setSuccessViewState('failed')
  } finally {
    successPollRunning = false
  }
}

/** 回跳页文案钩子的等待态内容。 */
interface ReturnViewCopy {
  title: string
  message: string
}

/** 更新 success 回跳页标题和说明（优先 data-payment-return-copy 钩子，回退 PayPal 载荷）。 */
function setSuccessViewState(state: PayPalSuccessViewState, orderStatus?: OrderStatusResponse): void {
  const root = document.querySelector<HTMLElement>('[data-payment-return]')
  const hookCopy = readHookCopy(root, state, orderStatus)
  const copy = hookCopy ?? getPayPalViewCopy(state, orderStatus)

  if (root) {
    root.dataset.paymentReturnState = state
  }
  const titleElement = root?.querySelector<HTMLElement>('[data-payment-return-title]')
    ?? document.querySelector<HTMLElement>('[data-paypal-return-title]')
  const messageElement = root?.querySelector<HTMLElement>('[data-payment-return-description]')
    ?? document.querySelector<HTMLElement>('[data-paypal-return-message]')
  if (titleElement) {
    titleElement.textContent = copy.title
  }
  if (messageElement) {
    messageElement.textContent = copy.message
  }
}

/** 读取页面内的 data-payment-return-copy 状态文案钩子；确认态按订单类别复用
 * confirmedCopyKeys 的分发逻辑选择 credits / subscription 钩子。 */
function readHookCopy(
  root: HTMLElement | null,
  state: PayPalSuccessViewState,
  orderStatus: OrderStatusResponse | undefined
): ReturnViewCopy | null {
  if (!root) {
    return null
  }
  const hookKey =
    state === 'confirmed'
      ? confirmedCopyKeys(orderStatus).titleKey === 'confirmedSubscriptionTitle'
        ? 'confirmed-subscription'
        : 'confirmed-credits'
      : state
  const element = root.querySelector<HTMLElement>(`[data-payment-return-copy="${hookKey}"]`)
  if (!element) {
    return null
  }
  return {
    title: element.dataset.title ?? '',
    message: element.dataset.description ?? ''
  }
}

/** PayPal 页等待态标题与说明（文案走 i18n 注入载荷，确认态按订单类别分发）。 */
function getPayPalViewCopy(
  state: PayPalSuccessViewState,
  orderStatus: OrderStatusResponse | undefined
): ReturnViewCopy {
  const copy = getPayPalReturnCopy()
  if (state === 'waiting') {
    return { title: copy.waitingTitle, message: copy.waitingMessage }
  }
  if (state === 'confirmed') {
    const keys = confirmedCopyKeys(orderStatus)
    return { title: copy[keys.titleKey], message: copy[keys.messageKey] }
  }
  return { title: copy.failedTitle, message: copy.failedMessage }
}

/** 读取 success.astro 注入的 i18n 文案载荷。 */
function getPayPalReturnCopy(): PayPalReturnCopy {
  const element = document.querySelector<HTMLScriptElement>('[data-paypal-return-copy]')
  if (!element?.textContent) {
    throw new Error('[payment-return] Missing payment return copy payload: [data-paypal-return-copy].')
  }
  return JSON.parse(element.textContent) as PayPalReturnCopy
}

/** 通知原购买弹窗支付页已跳回网站。 */
function notifyOpener(options: PaymentReturnOptions): void {
  const payload = {
    provider: options.provider,
    status: options.status,
    orderNo: options.orderNo
  }

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(PAYPAL_RETURN_CHANNEL)
    channel.postMessage(payload)
    channel.close()
  }

  if (window.opener) {
    window.opener.postMessage(
      {
        type: PAYPAL_RETURN_CHANNEL,
        ...payload
      },
      window.location.origin
    )
  }
}

/** 调用现有取消订单接口，把用户取消落到本地订单状态。 */
async function cancelOrder(orderNo: string): Promise<void> {
  const context = await buildRequestContext()
  if (!context) {
    return
  }

  await postJson('/api/client/order/cancel', context, {
    order_no: orderNo
  })
}

/** 构建取消订单所需请求上下文。 */
async function buildRequestContext(): Promise<RequestContext | null> {
  const token = getStoredAccessToken()
  if (!token) {
    return null
  }

  return {
    deviceId: await ensureDeviceId(),
    token
  }
}
