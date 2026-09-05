/**
 * Pricing 订阅商品接口客户端（MapsGrab 三产品线购买链路）。
 *
 * 订单创建/状态接口与支付协议由公共 OrderCheckout 维护；本模块只消费订阅
 * checkout 配置、验参和展示价格式化。
 */

import { getJson, postJson, type JsonObject, type JsonValue, type RequestContext } from '../../scripts/homepage/api'
import type {
  CreateOrderResponse,
  OrderCheckoutPaymentChannel,
  OrderCheckoutPeriod
} from '../order-checkout/order-checkout-api'

/** 订阅商品类别。 */
export const SUBSCRIPTION_PRODUCT_CLASS = 1

/** Extension（MapsGrab 插件）产品线标识（与后端 product_line 常量对齐）。 */
export const MAPS_EXTENSION_PRODUCT_LINE = 'maps_extension'
/** Online Scraper 产品线标识。 */
export const MAPS_ONLINE_PRODUCT_LINE = 'maps_online'
/** API 产品线标识。 */
export const MAPS_API_PRODUCT_LINE = 'maps_api'

export type SubscriptionUpgradeReason =
  | 'no_active_subscription'
  | 'not_higher_tier'
  | 'non_positive_diff'
  | 'channel_unavailable'

/** 档位、补差与渠道均以服务端报价为准；金额为六位整数，到期时间为毫秒。 */
export interface SubscriptionUpgradeQuote {
  available: boolean
  reason: SubscriptionUpgradeReason | null
  current_product_id: string | null
  target_product_id: string
  payment_method: string | null
  currency: string | null
  amount: number | null
  expires_at: number | null
}

export type SubscriptionUpgradeResult = {
  status: 'succeeded' | 'requires_action' | 'failed'
  action: null | { type: 'wait'; url: null } | { type: 'redirect'; url: string }
}

export function getSubscriptionUpgradeQuote(
  context: RequestContext,
  productLine: string,
  targetProductId: string
): Promise<SubscriptionUpgradeQuote> {
  return getJson<SubscriptionUpgradeQuote>('/api/client/subscription/upgrade-quote', context, {
    product_line: productLine,
    target_product_id: targetProductId
  })
}

export function createSubscriptionUpgradeCheckout(
  context: RequestContext,
  productLine: string,
  targetProductId: string
): Promise<CreateOrderResponse> {
  return postJson<CreateOrderResponse>('/api/client/subscription/upgrade/checkout', context, {
    product_line: productLine,
    target_product_id: targetProductId
  })
}

export function confirmSubscriptionUpgrade(
  context: RequestContext,
  productLine: string,
  targetProductId: string
): Promise<SubscriptionUpgradeResult> {
  return postJson<SubscriptionUpgradeResult>('/api/client/subscription/upgrade/confirm', context, {
    product_line: productLine,
    target_product_id: targetProductId
  })
}

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

/** 订阅商品的单个可购买价格选项。 */
export interface SubscriptionCheckoutPaymentChannel extends OrderCheckoutPaymentChannel {
  /** 购买选项 ID。 */
  product_price_id: number
}

/** 单个订阅商品配置。 */
export interface SubscriptionCheckoutPlan {
  /** 商品类别，订阅为 1。 */
  product_class: number
  /** 商品标识（如 maps_extension_pro）。 */
  product_id: string
  /** 产品线标识（maps_extension / maps_online / maps_api）。 */
  product_line: string
  /** 后端配置商品名。 */
  product_name: string
  /** 商业与权益周期；可售订阅商品只出自然月档期。 */
  period: Exclude<OrderCheckoutPeriod, 'none'>
  /** 是否由渠道自动续费；商品级单一计费模式。 */
  auto_renew: boolean
  /** 商品卡默认展示币种，当前为 USD。 */
  display_currency: string
  /** 商品卡默认展示金额，6 位精度。 */
  display_amount: number
  /**
   * 产品线月度权益额度；单位随产品线：maps_extension / maps_online 为 records/月，
   * maps_api 为 requests/月；后端缺省为 null。
   */
  monthly_quota: number | null
  /** 当前商品可用支付渠道。 */
  payment_channels: SubscriptionCheckoutPaymentChannel[]
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

/** 格式化展示价；后端金额为 6 位精度，入参可以是商品卡快照或渠道价格行。 */
export function formatPricingDisplayPrice(
  price:
    | Pick<SubscriptionCheckoutPlan, 'display_amount' | 'display_currency'>
    | Pick<SubscriptionCheckoutPaymentChannel, 'amount' | 'currency'>
): string {
  const amount = ('amount' in price ? price.amount : price.display_amount) / 1_000_000
  const currency = 'currency' in price ? price.currency : price.display_currency
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`
  }
  return `${currency} ${formatSixDecimalAmount(amount)}`
}

/** 按当前语言展示商品周期；月度沿用站点既有业务文案。 */
export function formatSubscriptionPeriod(
  period: SubscriptionCheckoutPlan['period'],
  monthlyLabel: string,
  locale: string
): string {
  if (period === 'month') {
    return monthlyLabel
  }
  const value = period === 'quarter' ? 3 : 1
  const unit = period === 'quarter' ? 'month' : 'year'
  return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' }).format(value)
}

/** 格式化最多 6 位小数的金额，去掉尾部 0。 */
function formatSixDecimalAmount(amount: number): string {
  return amount.toFixed(6).replace(/\.?0+$/, '')
}

/** 运行时校验订阅 plan，过滤半升级或历史坏数据。 */
function isSubscriptionCheckoutPlan(value: JsonValue): value is JsonObject & SubscriptionCheckoutPlan {
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
    (value.period === 'month' || value.period === 'quarter' || value.period === 'year') &&
    typeof value.auto_renew === 'boolean' &&
    typeof value.display_currency === 'string' &&
    typeof value.display_amount === 'number' &&
    Number.isFinite(value.display_amount) &&
    (value.monthly_quota === null ||
      (typeof value.monthly_quota === 'number' && Number.isFinite(value.monthly_quota))) &&
    Array.isArray(value.payment_channels) &&
    value.payment_channels.every(isSubscriptionCheckoutPaymentChannel)
  )
}

/** 运行时校验订阅购买选项身份，避免用半升级响应创建错误订单。 */
function isSubscriptionCheckoutPaymentChannel(
  value: JsonValue
): value is JsonObject & SubscriptionCheckoutPaymentChannel {
  if (!isJsonObject(value)) {
    return false
  }
  return (
    typeof value.payment_method === 'string' &&
    value.payment_method.length > 0 &&
    typeof value.payment_method_name === 'string' &&
    value.payment_method_name.length > 0 &&
    typeof value.product_price_id === 'number' &&
    Number.isInteger(value.product_price_id) &&
    value.product_price_id > 0 &&
    typeof value.currency === 'string' &&
    value.currency.length > 0 &&
    typeof value.amount === 'number' &&
    Number.isFinite(value.amount)
  )
}

/** 判断 JSON 值是否为可按字段读取的对象。 */
function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
