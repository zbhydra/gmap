/**
 * PayPal 返回页脚本。
 *
 * success 页轮询本地订单状态确认到账；cancel 页调用现有取消订单接口并通知原购买弹窗。
 */

import { getStoredAccessToken } from '../../scripts/homepage/auth'
import { ensureDeviceId } from '../../scripts/homepage/device'
import { postJson, type RequestContext } from '../../scripts/homepage/api'
import {
  classifyCreditPurchaseOrderStatus,
  getCreditOrderStatus,
  isCreditPurchaseAuthFailure,
  isRecoverableOrderStatusError,
  type OrderStatusResponse
} from './credit-checkout'
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

/** 初始化 PayPal 返回页行为。 */
export function initPayPalReturnPage(options: PayPalReturnOptions): void {
  const normalizedOptions: PayPalReturnOptions = {
    status: options.status,
    orderNo: resolveReturnOrderNo(options.orderNo)
  }

  if (normalizedOptions.status === 'success') {
    notifyOpener(normalizedOptions)
    startSuccessPolling(normalizedOptions.orderNo)
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

/** 从运行时 URL 兜底解析 PayPal 回跳携带的本地订单号。 */
function resolveReturnOrderNo(orderNo: string | null): string | null {
  const normalizedOrderNo = orderNo?.trim() || null
  if (normalizedOrderNo) {
    return normalizedOrderNo
  }

  return new URLSearchParams(window.location.search).get('order_no')?.trim() || null
}

/** 启动 success 页订单状态轮询。 */
function startSuccessPolling(orderNo: string | null): void {
  stopSuccessPolling()
  if (!orderNo) {
    setSuccessViewState('failed')
    return
  }

  successPollTimer = window.setInterval(() => {
    void pollSuccessOrderStatus(orderNo)
  }, PAYPAL_SUCCESS_POLL_INTERVAL_MS)
  setSuccessViewState('waiting')
  void pollSuccessOrderStatus(orderNo)
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
async function pollSuccessOrderStatus(orderNo: string): Promise<void> {
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

    const status = await getCreditOrderStatus(context, orderNo)
    const outcome = classifyCreditPurchaseOrderStatus(status)
    if (outcome === 'paid') {
      stopSuccessPolling()
      setSuccessViewState('confirmed', status)
      notifyOpener({ status: 'success', orderNo })
      return
    }
    if (outcome !== 'pending') {
      stopSuccessPolling()
      setSuccessViewState('failed')
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      if (isCreditPurchaseAuthFailure(error) || isRecoverableOrderStatusError(error)) {
        stopSuccessPolling()
        setSuccessViewState('failed')
      }
      return
    }
    console.error(
      new Error(
        `[paypal-return] pollSuccessOrderStatus failed with non-error value: order_no=${orderNo}, value=${String(error)}`
      )
    )
    stopSuccessPolling()
    setSuccessViewState('failed')
  } finally {
    successPollRunning = false
  }
}

/** 更新 PayPal success 回跳页标题和说明（文案走 i18n 注入载荷）。 */
function setSuccessViewState(state: PayPalSuccessViewState, orderStatus?: OrderStatusResponse): void {
  const copy = getPayPalReturnCopy()
  let title: string
  let message: string
  if (state === 'waiting') {
    title = copy.waitingTitle
    message = copy.waitingMessage
  } else if (state === 'confirmed') {
    const keys = confirmedCopyKeys(orderStatus)
    title = copy[keys.titleKey]
    message = copy[keys.messageKey]
  } else {
    title = copy.failedTitle
    message = copy.failedMessage
  }

  const titleElement = document.querySelector<HTMLElement>('[data-paypal-return-title]')
  const messageElement = document.querySelector<HTMLElement>('[data-paypal-return-message]')
  if (titleElement) {
    titleElement.textContent = title
  }
  if (messageElement) {
    messageElement.textContent = message
  }
}

/** 读取 success.astro 注入的 i18n 文案载荷。 */
function getPayPalReturnCopy(): PayPalReturnCopy {
  const element = document.querySelector<HTMLScriptElement>('[data-paypal-return-copy]')
  if (!element?.textContent) {
    throw new Error('[paypal-return] Missing paypal return copy payload: [data-paypal-return-copy].')
  }
  return JSON.parse(element.textContent) as PayPalReturnCopy
}

/** 通知原购买弹窗 PayPal 已跳回网站。 */
function notifyOpener(options: PayPalReturnOptions): void {
  const payload = {
    provider: 'paypal',
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
