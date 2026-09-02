/**
 * 订阅相关类型定义
 *
 * 契约对齐后端 `subscription_status_service.build_status_data` 的真实响应
 * （/subscription/status 与 /auth/me 的 maps_extension_subscription 同构）；
 * 旧 TG 底座携带的每日额度字段（daily_limit/used/remaining 等）后端已不再
 * 返回，插件门控只消费 period。
 */

/** 订阅周期（包含免费版） */
export type SubscriptionPeriod = 'free' | 'month' | 'unavailable'

/** 订阅状态 */
export interface SubscriptionStatus {
  /** 状态；unavailable 表示订阅配置异常，仅影响展示。 */
  status?: 'active' | 'unavailable'
  /** 订阅周期。 */
  period: SubscriptionPeriod
  /** 展示名称。 */
  display_name: string
  /** 过期毫秒时间戳，null 表示无过期时间。 */
  expires_at: number | null
  /** 是否自动续费。 */
  auto_renew?: boolean
}
