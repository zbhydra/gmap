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
  isRecoverableOrderStatusError
} from './credit-checkout'

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

/** success 页状态文案。 */
interface PayPalSuccessViewCopy {
  /** 标题文案。 */
  title: string
  /** 描述文案。 */
  message: string
}

/** success 页可更新状态文案集合。 */
const PAYPAL_SUCCESS_VIEW_COPY: Record<PayPalSuccessViewState, PayPalSuccessViewCopy> = {
  waiting: {
    title: 'Payment submitted',
    message:
      'You can return to the original tab. We are checking PayPal confirmation every 3 seconds, and your Credits will appear automatically after the order is confirmed.'
  },
  confirmed: {
    title: 'Credits added',
    message:
      'Your PayPal payment is confirmed and the Credits have been added. You can close this tab and continue in the original window.'
  },
  failed: {
    title: 'Payment needs attention',
    message:
      'We could not confirm this order automatically. Return to the original window or try refreshing your payment status there.'
  }
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
      setSuccessViewState('confirmed')
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

/** 更新 PayPal success 回跳页标题和说明。 */
function setSuccessViewState(state: PayPalSuccessViewState): void {
  const copy = PAYPAL_SUCCESS_VIEW_COPY[state]
  const title = document.querySelector<HTMLElement>('[data-paypal-return-title]')
  const message = document.querySelector<HTMLElement>('[data-paypal-return-message]')
  if (title) {
    title.textContent = copy.title
  }
  if (message) {
    message.textContent = copy.message
  }
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
