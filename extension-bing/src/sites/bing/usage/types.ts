/** Google Maps 与 Bing 共用 maps_extension 月 records 账本。 */
export interface BingUsageSnapshot {
  used: number
  total: number
  period: string
  exhausted: boolean
}

export interface BingUsageSession extends BingUsageSnapshot {
  /** 固定开始时的归属，换号后的重试不能扣到另一个账本。 */
  identity: string
}

export interface BingUsageReport {
  identity: string
  requestId: string
  records: number
  /** 会话创建时间（毫秒）；匿名重放不得超出服务端幂等窗口。 */
  createdAt: number
}
