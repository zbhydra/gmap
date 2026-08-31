/**
 * Maps 月度配额类型与门控判定（013 A11，U7）。
 *
 * 归属键由服务端按请求上下文推导（登录 user_id / 匿名 device_id，X-Device-Id
 * 与 Bearer 由 httpClient 拦截器自动注入），插件侧不关心归属细节——登录与否
 * 只影响服务端计数归属，不影响功能可用（基线 #1 不强制登录）。
 */

/** 服务端 usage 快照（竞品云函数 quota 同构形状：used/total/period/exhausted）。 */
export interface MapsUsageSnapshot {
  /** 当月已用记录数。 */
  used: number
  /** 月度配额总量（免费默认 1000，服务端远程可调）。 */
  total: number
  /** 归属周期（服务端业务时区自然月，形如 `2026-09`）。 */
  period: string
  /** 已用量达到总量（面板 Start 门控依据）。 */
  exhausted: boolean
}

/** 采集会话来源（上报观测与日志定位用）。 */
export type MapsUsageSource = 'search' | 'reviews' | 'photos'

/**
 * 快照是否触发配额门控（禁 Start + 「额度用尽」提示）。
 *
 * 快照缺失（服务端不可达/解析失败）不门控——容错轴「局部可失败」，采集
 * 可用性优先，服务端扣减侧对 usage 查询失败同样 fail-open。
 */
export function isUsageExhausted(snapshot: MapsUsageSnapshot | null): boolean {
  return snapshot !== null && snapshot.exhausted
}
