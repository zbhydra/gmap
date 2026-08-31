/**
 * Credits 购买接口客户端。
 *
 * 只依赖 Credits 商品配置、通用订单创建、订单状态和 auth/me；
 * 不调用 subscription/status，不查询 order/unfinished，不恢复 pending 订单。
 */

import {
  HomepageApiError,
  getJson,
  postJson,
  type JsonObject,
  type JsonValue,
  type RequestContext
} from '../../scripts/homepage/api'

/** 订单不存在或不属于当前用户。 */
export const ORDER_NOT_FOUND_CODE = 20001

/** 订单已过期。 */
export const ORDER_EXPIRED_CODE = 20003

/** 支付网关创建支付入口失败。 */
export const PAYMENT_GATEWAY_ERROR_CODE = 21001

/** 当前支付方式后端未实现。 */
export const PAYMENT_UNSUPPORTED_METHOD_CODE = 21004

/** 后端价格配置已变化，需要重新拉取 checkout configs。 */
export const PAYMENT_PRICE_UPDATED_CODE = 21005

/** Credits 充值商品类别。 */
export const CREDIT_PRODUCT_CLASS = 2

/** 订单状态：待支付。 */
export const ORDER_STATUS_PENDING = 1

/** 订单状态：已支付。 */
export const ORDER_STATUS_PAID = 2

/** 订单状态：已取消。 */
export const ORDER_STATUS_CANCELLED = 3

/** 订单状态：已退款。 */
export const ORDER_STATUS_REFUNDED = 4

/** 订单状态：已过期。 */
export const ORDER_STATUS_EXPIRED = 5

/** 回调状态：未调用。 */
export const CALLBACK_STATUS_NOT_CALLED = 1

/** 回调状态：处理中。 */
export const CALLBACK_STATUS_PENDING = 2

/** 回调状态：履约成功。 */
export const CALLBACK_STATUS_SUCCESS = 3

/** 回调状态：履约失败。 */
export const CALLBACK_STATUS_FAILED = 4

/** 回调状态：达到最大重试。 */
export const CALLBACK_STATUS_MAX_RETRY = 5

/** 默认优先选中的支付方式。 */
export const DEFAULT_CREDIT_PAYMENT_METHODS = ['paypal', 'telegram_stars', 'tg_star'] as const

/** 后端金额使用 6 位小数精度。 */
const DISPLAY_AMOUNT_SCALE = 1_000_000

/** Credits 单价展示保留 4 位，避免小额套餐被四舍五入成 $0.00。 */
const CREDIT_UNIT_PRICE_DECIMALS = 4

/** 自动轮询间隔，毫秒。 */
export const CREDIT_ORDER_POLL_INTERVAL_MS = 2000

/** 自动轮询最长等待时间，毫秒。 */
export const CREDIT_ORDER_POLL_TIMEOUT_MS = 10 * 60 * 1000

/** 后端订单状态数字枚举。 */
export type OrderStatus = 1 | 2 | 3 | 4 | 5

/** 后端履约回调状态数字枚举。 */
export type CallbackStatus = 1 | 2 | 3 | 4 | 5

/** Credits checkout configs 响应。 */
export interface CreditCheckoutConfigsResponse {
  /** 可购买 Credits 商品列表。 */
  checkout_configs: CreditCheckoutPlan[]
}

/** 单个 Credits 商品的可购买配置。 */
export interface CreditCheckoutPlan {
  /** 商品类别，Credits 充值为 2。 */
  product_class: number
  /** Credits 商品标识。 */
  product_id: string
  /** 后端配置商品名。 */
  product_name: string
  /** 到账 Credits 数量。 */
  credits_amount: number
  /** 前端展示币种，当前为 USD。 */
  display_currency: string
  /** 前端展示金额，6 位精度。 */
  display_amount: number
  /** 当前商品可用支付渠道。 */
  payment_channels: CreditCheckoutPaymentChannel[]
}

/** 单个支付渠道价格快照。 */
export interface CreditCheckoutPaymentChannel {
  /** 支付方式，例如 telegram_stars。 */
  payment_method: string
  /** 支付渠道展示名，前端本期不展示。 */
  payment_method_name: string
  /** 渠道币种，例如 XTR，前端本期不展示。 */
  currency: string
  /** 渠道金额，6 位精度。 */
  amount: number
  /** 渠道侧 SKU。 */
  provider_sku: string | null
}

/** 创建 Credits 订单请求。 */
export interface CreateCreditOrderRequest {
  /** 商品类别，Credits 充值为 2。 */
  product_class: number
  /** Credits 商品标识。 */
  product_id: string
  /** 支付方式。 */
  payment_method: string
  /** 渠道币种。 */
  currency: string
  /** 渠道金额，6 位精度。 */
  amount: number
}

/** 创建订单响应。 */
export interface CreateCreditOrderResponse {
  /** 订单号。 */
  order_no: string
  /** 渠道金额，6 位精度。 */
  amount: number
  /** 渠道币种。 */
  currency: string
  /** 订单过期时间，毫秒时间戳。 */
  expired_at: number
  /** 当前订单支付等待页使用的支持邮箱；空字符串表示不展示反馈入口。 */
  support_mail: string
  /** 渠道专属支付数据。 */
  payment_data: JsonValue
}

/** 订单状态响应。 */
export interface OrderStatusResponse {
  /** 订单号。 */
  order_no: string
  /** 商品类别。 */
  product_class: number
  /** 商品标识。 */
  product_id: string
  /** 商品名称。 */
  product_name: string
  /** 渠道金额，6 位精度。 */
  amount: number
  /** 渠道币种。 */
  currency: string
  /** 订单状态数字枚举。 */
  order_status: OrderStatus
  /** 履约回调状态数字枚举。 */
  callback_status: CallbackStatus
  /** 支付方式。 */
  payment_method: string | null
  /** 支付时间。 */
  paid_at: number | null
  /** 创建时间。 */
  created_at: number
  /** 订单过期时间，毫秒时间戳。 */
  expired_at: number
}

/** 订单状态归类结果。 */
export type CreditOrderStatusOutcome = 'pending' | 'paid' | 'cancelled' | 'failed' | 'expired'

/** 请求 Credits checkout configs。 */
export async function listCreditCheckoutConfigs(
  context: RequestContext
): Promise<CreditCheckoutPlan[]> {
  const response = await getJson<CreditCheckoutConfigsResponse>(
    '/api/client/credit/checkout-configs',
    context
  )
  return response.checkout_configs.filter(isCreditCheckoutPlan)
}

/** 创建 Credits 订单。 */
export async function createCreditOrder(
  context: RequestContext,
  request: CreateCreditOrderRequest
): Promise<CreateCreditOrderResponse> {
  return postJson<CreateCreditOrderResponse>(
    '/api/client/order/create',
    context,
    createCreditOrderRequestToJson(request)
  )
}

/** 查询订单状态。 */
export async function getCreditOrderStatus(
  context: RequestContext,
  orderNo: string
): Promise<OrderStatusResponse> {
  return getJson<OrderStatusResponse>(
    `/api/client/order/status/${encodeURIComponent(orderNo)}`,
    context
  )
}

/** 构建 create order 请求，字段原样来自 checkout config。 */
export function buildCreateCreditOrderRequest(
  plan: CreditCheckoutPlan,
  channel: CreditCheckoutPaymentChannel
): CreateCreditOrderRequest {
  return {
    product_class: plan.product_class,
    product_id: plan.product_id,
    payment_method: channel.payment_method,
    currency: channel.currency,
    amount: channel.amount
  }
}

/** 选取 Credits 商品的默认支付渠道。 */
export function getDefaultCreditPaymentChannel(
  plan: CreditCheckoutPlan | undefined
): CreditCheckoutPaymentChannel | null {
  if (!plan || plan.payment_channels.length === 0) {
    return null
  }

  for (const paymentMethod of DEFAULT_CREDIT_PAYMENT_METHODS) {
    const channel = plan.payment_channels.find(item => item.payment_method === paymentMethod)
    if (channel) {
      return channel
    }
  }

  return plan.payment_channels[0]
}

/** 校验并提取外部支付 URL。 */
export function readPaymentUrl(paymentData: JsonValue, paymentMethod: string): string | null {
  if (!paymentData || typeof paymentData !== 'object' || Array.isArray(paymentData)) {
    return null
  }

  const value = paymentData.payment_url ?? paymentData.url ?? paymentData.approval_url
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }

  try {
    const parsed = new URL(trimmed)
    const hostname = parsed.hostname.toLowerCase()
    if (paymentMethod === 'paypal') {
      const paypalHostAllowed = hostname === 'paypal.com' || hostname.endsWith('.paypal.com')
      return parsed.protocol === 'https:' && paypalHostAllowed ? trimmed : null
    }

    const telegramHostAllowed = hostname === 't.me' || hostname === 'telegram.me'
    const telegramAllowed =
      (parsed.protocol === 'https:' && telegramHostAllowed) || parsed.protocol === 'tg:'
    return telegramAllowed ? trimmed : null
  } catch {
    return null
  }
}

/** 兼容旧单测和调用方的 Telegram invoice URL 读取函数。 */
export function readTelegramInvoiceUrl(paymentData: JsonValue): string | null {
  return readPaymentUrl(paymentData, 'telegram_stars')
}

/** 根据后端订单状态归类 Credits 购买状态。 */
export function classifyCreditPurchaseOrderStatus(
  status: OrderStatusResponse
): CreditOrderStatusOutcome {
  if (
    status.order_status === ORDER_STATUS_PAID &&
    status.callback_status === CALLBACK_STATUS_SUCCESS
  ) {
    return 'paid'
  }

  if (
    status.order_status === ORDER_STATUS_PAID &&
    (status.callback_status === CALLBACK_STATUS_FAILED ||
      status.callback_status === CALLBACK_STATUS_MAX_RETRY)
  ) {
    return 'failed'
  }

  if (status.order_status === ORDER_STATUS_EXPIRED) {
    return 'expired'
  }

  if (
    status.order_status === ORDER_STATUS_CANCELLED ||
    status.order_status === ORDER_STATUS_REFUNDED
  ) {
    return status.order_status === ORDER_STATUS_CANCELLED ? 'cancelled' : 'failed'
  }

  return 'pending'
}

/** 判断轮询是否超过自动等待窗口。 */
export function hasCreditOrderPollingTimedOut(pollStartedAt: number | null): boolean {
  return pollStartedAt !== null && Date.now() - pollStartedAt >= CREDIT_ORDER_POLL_TIMEOUT_MS
}

/** 当前错误是否认证失效。 */
export function isCreditPurchaseAuthFailure(error: Error): boolean {
  return error instanceof HomepageApiError && (error.status === 401 || error.code === 10001 || error.code === 10013)
}

/** 当前错误是否价格更新。 */
export function isPaymentPriceUpdatedError(error: Error): boolean {
  return error instanceof HomepageApiError && error.code === PAYMENT_PRICE_UPDATED_CODE
}

/** 当前错误是否支付网关失败。 */
export function isPaymentGatewayError(error: Error): boolean {
  return (
    error instanceof HomepageApiError &&
    (error.code === PAYMENT_GATEWAY_ERROR_CODE ||
      error.code === PAYMENT_UNSUPPORTED_METHOD_CODE)
  )
}

/** 当前错误是否订单不存在或已过期。 */
export function isRecoverableOrderStatusError(error: Error): boolean {
  return (
    error instanceof HomepageApiError &&
    (error.code === ORDER_NOT_FOUND_CODE || error.code === ORDER_EXPIRED_CODE)
  )
}

/** 格式化美元展示价；后端当前只返回 USD，但这里仍校验币种，避免显示错误币种。 */
export function formatCreditDisplayPrice(
  plan: Pick<CreditCheckoutPlan, 'display_amount' | 'display_currency'>
): string {
  const amount = plan.display_amount / DISPLAY_AMOUNT_SCALE
  if (plan.display_currency === 'USD') {
    return `$${amount.toFixed(2)}`
  }
  return `${plan.display_currency} ${formatSixDecimalAmount(amount)}`
}

/** 从本地化的 Credits 数量模板中提取单位名，例如 `{credits} Credits` -> `Credits`。 */
export function formatCreditUnitLabel(creditsAmountTemplate: string): string {
  const unitLabel = creditsAmountTemplate.replace(/\{credits\}/g, '').replace(/\s+/g, ' ').trim()
  return unitLabel || 'Credits'
}

/** 格式化单个 Credits 的展示价。 */
export function formatCreditDisplayUnitPrice(
  plan: Pick<CreditCheckoutPlan, 'display_amount' | 'display_currency' | 'credits_amount'>,
  creditUnitLabel: string
): string {
  const unitAmount = plan.display_amount / DISPLAY_AMOUNT_SCALE / plan.credits_amount
  const unitSuffix = creditUnitLabel.trim() ? `/${creditUnitLabel.trim()}` : ''
  if (plan.display_currency === 'USD') {
    return `$${unitAmount.toFixed(CREDIT_UNIT_PRICE_DECIMALS)}${unitSuffix}`
  }
  return `${plan.display_currency} ${unitAmount.toFixed(CREDIT_UNIT_PRICE_DECIMALS)}${unitSuffix}`
}

/** 把 create order 请求转为项目 JSON 类型。 */
function createCreditOrderRequestToJson(request: CreateCreditOrderRequest): JsonObject {
  return {
    product_class: request.product_class,
    product_id: request.product_id,
    payment_method: request.payment_method,
    currency: request.currency,
    amount: request.amount
  }
}

/** 格式化最多 6 位小数的金额，去掉尾部 0。 */
function formatSixDecimalAmount(amount: number): string {
  return amount.toFixed(6).replace(/\.?0+$/, '')
}

/** 运行时校验 checkout plan，过滤半升级或历史坏数据。 */
function isCreditCheckoutPlan(value: CreditCheckoutPlan): boolean {
  return (
    value.product_class === CREDIT_PRODUCT_CLASS &&
    typeof value.product_id === 'string' &&
    value.product_id.length > 0 &&
    typeof value.product_name === 'string' &&
    typeof value.credits_amount === 'number' &&
    Number.isFinite(value.credits_amount) &&
    value.credits_amount > 0 &&
    typeof value.display_currency === 'string' &&
    typeof value.display_amount === 'number' &&
    Number.isFinite(value.display_amount) &&
    Array.isArray(value.payment_channels)
  )
}
