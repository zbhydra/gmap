/**
 * Pricing 订阅商品接口客户端（MapsGrab 三档购买链路）。
 *
 * 订单创建/状态接口与支付协议复用 credit-checkout 的订单基座，避免页面出现
 * 第二套支付协议；本模块只负责订阅配置读取、验参和展示价格式化。
 */

import {
  getJson,
  postJson,
  type JsonObject,
  type JsonValue,
  type RequestContext
} from '../../scripts/homepage/api'
import {
  CALLBACK_STATUS_FAILED,
  CALLBACK_STATUS_MAX_RETRY,
  CALLBACK_STATUS_SUCCESS,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_EXPIRED,
  ORDER_STATUS_PAID,
  ORDER_STATUS_REFUNDED,
  PAYMENT_PRICE_UPDATED_CODE,
  CREDIT_ORDER_POLL_INTERVAL_MS,
  CREDIT_ORDER_POLL_TIMEOUT_MS,
  classifyCreditPurchaseOrderStatus,
  hasCreditOrderPollingTimedOut,
  isCreditPurchaseAuthFailure,
  isPaymentGatewayError,
  isPaymentPriceUpdatedError,
  isRecoverableOrderStatusError,
  readPaymentUrl,
  type CallbackStatus,
  type CreateCreditOrderResponse,
  type CreditCheckoutPaymentChannel,
  type CreditOrderStatusOutcome,
  type OrderStatus,
  type OrderStatusResponse
} from '../credit-purchase/credit-checkout'

/** 订阅商品类别。 */
export const SUBSCRIPTION_PRODUCT_CLASS = 1

/** Extension（MapsGrab 插件）产品线标识（与后端 product_line 常量对齐）。 */
export const MAPS_PRODUCT_LINE = 'maps'
/** Online Scraper 产品线标识。 */
export const MAPS_ONLINE_PRODUCT_LINE = 'maps_online'
/** API 产品线标识。 */
export const MAPS_API_PRODUCT_LINE = 'maps_api'

/** 订阅 checkout configs 响应。 */
export interface SubscriptionCheckoutConfigsResponse {
  /** 可购买订阅商品列表。 */
  checkout_configs: SubscriptionCheckoutPlan[]
}

/** 订阅配置请求结果。 */
export interface SubscriptionCheckoutData {
  /** 全部产品线的可购买商品（按 product_line 过滤后使用）。 */
  plans: SubscriptionCheckoutPlan[]
}

/** 单个订阅商品配置。 */
export interface SubscriptionCheckoutPlan {
  /** 商品类别，订阅为 1。 */
  product_class: number
  /** 商品标识（如 maps_pro）。 */
  product_id: string
  /** 产品线标识（maps / maps_online / maps_api）。 */
  product_line: string
  /** 后端配置商品名。 */
  product_name: string
  /** 前端展示币种，当前为 USD。 */
  display_currency: string
  /** 前端展示金额，6 位精度。 */
  display_amount: number
  /** 订阅周期，例如 month。 */
  period: string
  /** 是否自动续费。 */
  auto_renew: boolean
  /**
   * 产品线月度权益额度；单位随产品线：maps / maps_online 为 records/月，
   * maps_api 为 requests/月；后端缺省为 null。
   */
  monthly_quota: number | null
  /** 当前商品可用支付渠道。 */
  payment_channels: CreditCheckoutPaymentChannel[]
}

/** 创建通用订单请求。 */
export interface CreatePricingOrderRequest {
  /** 商品类别。 */
  product_class: number
  /** 商品标识。 */
  product_id: string
  /** 支付方式。 */
  payment_method: string
  /** 渠道币种。 */
  currency: string
  /** 渠道金额，6 位精度。 */
  amount: number
}

/** 请求订阅 checkout configs。 */
export async function listSubscriptionCheckoutConfigs(
  context: RequestContext
): Promise<SubscriptionCheckoutData> {
  const response = await getJson<JsonValue>(
    '/api/client/subscription/checkout-configs',
    context
  )

  if (!isJsonObject(response)) {
    throw new Error(
      '[pricing-checkout] GET /api/client/subscription/checkout-configs returned invalid data: expected an object.'
    )
  }
  if (!Array.isArray(response.checkout_configs)) {
    throw new Error(
      '[pricing-checkout] GET /api/client/subscription/checkout-configs returned invalid data: checkout_configs must be an array.'
    )
  }
  const plans = response.checkout_configs.filter(isSubscriptionCheckoutPlan)

  return { plans }
}

/** 创建订阅订单。 */
export async function createPricingOrder(
  context: RequestContext,
  request: CreatePricingOrderRequest
): Promise<CreateCreditOrderResponse> {
  return postJson<CreateCreditOrderResponse>(
    '/api/client/order/create',
    context,
    createPricingOrderRequestToJson(request)
  )
}

/** 根据订阅 plan 和渠道构造 create order 请求。 */
export function buildCreateSubscriptionOrderRequest(
  plan: SubscriptionCheckoutPlan,
  channel: CreditCheckoutPaymentChannel
): CreatePricingOrderRequest {
  return {
    product_class: plan.product_class,
    product_id: plan.product_id,
    payment_method: channel.payment_method,
    currency: channel.currency,
    amount: channel.amount
  }
}

/** 选取默认支付渠道，优先 PayPal。 */
export function getDefaultPricingPaymentChannel(
  channels: CreditCheckoutPaymentChannel[]
): CreditCheckoutPaymentChannel | null {
  if (channels.length === 0) {
    return null
  }

  const paypal = channels.find(item => item.payment_method === 'paypal')
  return paypal ?? channels[0]
}

/** 选取指定产品线的可购买商品，按 product_id 索引。 */
export function pickPlansByLine(
  plans: SubscriptionCheckoutPlan[],
  productLine: string
): Map<string, SubscriptionCheckoutPlan> {
  const linePlans = new Map<string, SubscriptionCheckoutPlan>()
  for (const plan of plans) {
    if (plan.product_line === productLine) {
      linePlans.set(plan.product_id, plan)
    }
  }
  return linePlans
}

/** 格式化展示价；后端金额为 6 位精度。 */
export function formatPricingDisplayPrice(
  plan: Pick<SubscriptionCheckoutPlan, 'display_amount' | 'display_currency'>
): string {
  const amount = plan.display_amount / 1_000_000
  if (plan.display_currency === 'USD') {
    return `$${amount.toFixed(2)}`
  }
  return `${plan.display_currency} ${formatSixDecimalAmount(amount)}`
}

/** 查询订单状态。 */
export async function getPricingOrderStatus(
  context: RequestContext,
  orderNo: string
): Promise<OrderStatusResponse> {
  return getJson<OrderStatusResponse>(
    `/api/client/order/status/${encodeURIComponent(orderNo)}`,
    context
  )
}

/** 根据后端订单状态归类 Pricing 支付状态。 */
export function classifyPricingOrderStatus(
  status: OrderStatusResponse
): CreditOrderStatusOutcome {
  return classifyCreditPurchaseOrderStatus(status)
}

export {
  CALLBACK_STATUS_FAILED,
  CALLBACK_STATUS_MAX_RETRY,
  CALLBACK_STATUS_SUCCESS,
  CREDIT_ORDER_POLL_INTERVAL_MS,
  CREDIT_ORDER_POLL_TIMEOUT_MS,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_EXPIRED,
  ORDER_STATUS_PAID,
  ORDER_STATUS_REFUNDED,
  PAYMENT_PRICE_UPDATED_CODE,
  hasCreditOrderPollingTimedOut as hasPricingOrderPollingTimedOut,
  isCreditPurchaseAuthFailure as isPricingAuthFailure,
  isPaymentGatewayError,
  isPaymentPriceUpdatedError,
  isRecoverableOrderStatusError,
  readPaymentUrl,
  type CallbackStatus,
  type CreditCheckoutPaymentChannel,
  type CreditOrderStatusOutcome,
  type OrderStatus,
  type OrderStatusResponse
}

/** 把 create order 请求转为项目 JSON 类型。 */
function createPricingOrderRequestToJson(request: CreatePricingOrderRequest): JsonObject {
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

/** 运行时校验订阅 plan，过滤半升级或历史坏数据。 */
function isSubscriptionCheckoutPlan(
  value: JsonValue
): value is JsonObject & SubscriptionCheckoutPlan {
  if (!isJsonObject(value)) {
    return false
  }
  return (
    value.product_class === SUBSCRIPTION_PRODUCT_CLASS &&
    typeof value.product_id === 'string' &&
    value.product_id.length > 0 &&
    typeof value.product_line === 'string' &&
    value.product_line.length > 0 &&
    typeof value.product_name === 'string' &&
    typeof value.display_currency === 'string' &&
    typeof value.display_amount === 'number' &&
    Number.isFinite(value.display_amount) &&
    typeof value.period === 'string' &&
    typeof value.auto_renew === 'boolean' &&
    (value.monthly_quota === null ||
      (typeof value.monthly_quota === 'number' &&
        Number.isFinite(value.monthly_quota))) &&
    Array.isArray(value.payment_channels)
  )
}

/** 判断 JSON 值是否为可按字段读取的对象。 */
function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
