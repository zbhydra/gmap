/**
 * Pricing 订阅与 Credits 商品接口客户端。
 *
 * 订阅和 Credits 共用后端订单创建/状态接口；订单状态常量、支付 URL
 * 白名单、价格更新和网关错误分类复用 Credits checkout，避免页面出现两套支付协议。
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
  type CreditCheckoutPlan,
  type CreditOrderStatusOutcome,
  type OrderStatus,
  type OrderStatusResponse
} from '../credit-purchase/credit-checkout'

/** 订阅商品类别。 */
export const SUBSCRIPTION_PRODUCT_CLASS = 1

/** 订阅 checkout configs 响应。 */
export interface SubscriptionCheckoutConfigsResponse {
  /** 可购买订阅商品列表。 */
  checkout_configs: SubscriptionCheckoutPlan[]
  /** 是否开放好评赠送活动。 */
  review_reward_enabled: boolean
  /** 当前账号永久累计领取好评赠送的次数；匿名请求为 0。 */
  review_reward_claimed_count: number
}

/** 好评赠送领取结果。 */
export type ReviewRewardClaimResult = 'granted' | 'already_claimed'

/** 好评赠送领取响应。 */
export interface ReviewRewardClaimResponse {
  /** 本次领取结果。 */
  result: ReviewRewardClaimResult
  /** 当前账号永久累计领取次数。 */
  review_reward_claimed_count: number
}

/** 订阅配置与当前账号的好评赠送资格。 */
export interface SubscriptionCheckoutData {
  /** 可购买订阅商品列表。 */
  plans: SubscriptionCheckoutPlan[]
  /** 是否开放好评赠送活动。 */
  reviewRewardEnabled: boolean
  /** 当前账号永久累计领取次数。 */
  reviewRewardClaimedCount: number
}

/** 单个订阅商品配置。 */
export interface SubscriptionCheckoutPlan {
  /** 商品类别，订阅为 1。 */
  product_class: number
  /** 商品标识。 */
  product_id: string
  /** 后端配置商品名。 */
  product_name: string
  /** 前端展示币种，当前为 USD。 */
  display_currency: string
  /** 前端展示金额，6 位精度。 */
  display_amount: number
  /** 订阅周期，例如 month。 */
  period: string
  /** 每日下载额度；小于 0 表示无限。 */
  daily_limit: number
  /** 是否自动续费。 */
  auto_renew: boolean
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
  const invalidPlanIndex = response.checkout_configs.findIndex(value => !isSubscriptionCheckoutPlan(value))
  if (invalidPlanIndex !== -1) {
    throw new Error(
      `[pricing-checkout] GET /api/client/subscription/checkout-configs returned invalid data: checkout_configs[${invalidPlanIndex}] is not a valid subscription plan.`
    )
  }
  const plans = response.checkout_configs.filter(isSubscriptionCheckoutPlan)
  if (typeof response.review_reward_enabled !== 'boolean') {
    throw new Error(
      '[pricing-checkout] GET /api/client/subscription/checkout-configs returned invalid data: review_reward_enabled must be a boolean.'
    )
  }
  if (!isNonNegativeInteger(response.review_reward_claimed_count)) {
    throw new Error(
      '[pricing-checkout] GET /api/client/subscription/checkout-configs returned invalid data: review_reward_claimed_count must be a non-negative integer.'
    )
  }

  return {
    plans,
    reviewRewardEnabled: response.review_reward_enabled,
    reviewRewardClaimedCount: response.review_reward_claimed_count
  }
}

/** 领取好评赠送订阅。 */
export async function claimSubscriptionReviewReward(
  context: RequestContext
): Promise<ReviewRewardClaimResponse> {
  const response = await postJson<JsonValue>(
    '/api/client/subscription/review-reward/claim',
    context,
    {}
  )

  if (!isJsonObject(response)) {
    throw new Error(
      '[pricing-checkout] POST /api/client/subscription/review-reward/claim returned invalid data: expected an object.'
    )
  }
  if (response.result !== 'granted' && response.result !== 'already_claimed') {
    throw new Error(
      '[pricing-checkout] POST /api/client/subscription/review-reward/claim returned invalid data: result must be granted or already_claimed.'
    )
  }
  if (!isNonNegativeInteger(response.review_reward_claimed_count)) {
    throw new Error(
      '[pricing-checkout] POST /api/client/subscription/review-reward/claim returned invalid data: review_reward_claimed_count must be a non-negative integer.'
    )
  }
  return {
    result: response.result,
    review_reward_claimed_count: response.review_reward_claimed_count
  }
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

/** 根据 Credits plan 和渠道构造 create order 请求。 */
export function buildCreateCreditsOrderRequest(
  plan: CreditCheckoutPlan,
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

/** 选取默认支付渠道，优先 PayPal，其次 Telegram Stars。 */
export function getDefaultPricingPaymentChannel(
  channels: CreditCheckoutPaymentChannel[]
): CreditCheckoutPaymentChannel | null {
  if (channels.length === 0) {
    return null
  }

  for (const paymentMethod of ['paypal', 'telegram_stars', 'tg_star']) {
    const channel = channels.find(item => item.payment_method === paymentMethod)
    if (channel) {
      return channel
    }
  }

  return channels[0]
}

/** 按商品标识选择 Unlimited plan，权益和计费方式均由后端配置决定。 */
export function pickUnlimitedPlan(
  plans: SubscriptionCheckoutPlan[]
): SubscriptionCheckoutPlan | null {
  return plans.find(plan => isUnlimitedPlan(plan)) ?? null
}

/** 格式化展示价；后端金额为 6 位精度。 */
export function formatPricingDisplayPrice(
  plan: Pick<SubscriptionCheckoutPlan | CreditCheckoutPlan, 'display_amount' | 'display_currency'>
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
  type CreditCheckoutPlan,
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
    typeof value.product_name === 'string' &&
    typeof value.display_currency === 'string' &&
    typeof value.display_amount === 'number' &&
    Number.isFinite(value.display_amount) &&
    typeof value.period === 'string' &&
    typeof value.daily_limit === 'number' &&
    Number.isFinite(value.daily_limit) &&
    typeof value.auto_renew === 'boolean' &&
    Array.isArray(value.payment_channels)
  )
}

/** 判断 JSON 值是否为可按字段读取的对象。 */
function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 领取次数合同只接受非负整数，拒绝缺字段、负数和小数。 */
function isNonNegativeInteger(value: JsonValue | undefined): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

/** 前端只负责选择要展示的商品，不重复约束后端返回的运营配置。 */
function isUnlimitedPlan(plan: SubscriptionCheckoutPlan): boolean {
  return (
    plan.product_class === SUBSCRIPTION_PRODUCT_CLASS &&
    plan.product_id === 'unlimited'
  )
}
