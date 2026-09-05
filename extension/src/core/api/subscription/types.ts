/**
 * 订阅相关类型定义
 */

/** 订阅周期（包含免费版） */
export type SubscriptionPeriod = 'free' | 'month' | 'quarter' | 'year' | 'unavailable'

/** 订阅状态（U1 后端 /subscription/status 六字段合同） */
export interface SubscriptionStatus {
  /** 状态；unavailable 表示订阅配置异常，仅影响展示。 */
  status: 'active' | 'unavailable'
  /** 订阅周期。 */
  period: SubscriptionPeriod
  /** 展示名称。 */
  display_name: string
  /** 过期毫秒时间戳，null 表示无过期时间。 */
  expires_at: number | null
  /** 当前订阅是否为渠道自动续费。 */
  auto_renew: boolean
  /** 最近一次生效订阅的支付渠道；无记录为 null。 */
  payment_method: string | null
}
