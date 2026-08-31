/**
 * 批量任务配额前置校验（013 A11，U7，U5 遗留补口）。
 *
 * 纯函数：按「条目数 × 单条目预估消耗」估算任务总量，与配额剩余比较。
 * 单条目预估消费包内默认单批上限（freeExportRowLimit=10 / 每店评论默认
 * 300）——远程覆盖值只作用于 content 侧实时截断，本处刻意用保守默认值：
 * 预估偏严只会让校验更谨慎，不会超采。
 */

import { BULK_LIMITS, type BulkTaskType } from './types'

/** 一次批量任务启动的配额预估结果。 */
export interface BulkQuotaEstimate {
  /** 任务预计消耗记录数。 */
  estimate: number
  /** 扣除已用量后的剩余额度。 */
  remaining: number
  /** estimate > remaining（拒绝启动）。 */
  exceeded: boolean
}

/**
 * 估算一个批量任务的预计记录数。
 *
 * @param itemCount 待处理条目数（创建任务 = 全部条目；启动 = 未完成条目）。
 * @param type 任务类型：关键词条目按单批搜索上限估算；评论 URL 条目按每店
 *   评论上限估算（dashboard 未配时用默认 300）。
 * @param reviewsPerStoreLimit 评论任务每店上限（null = 默认）。
 * @param freeExportRowLimit 单批搜索行上限（包内默认 10，远程可调）。
 */
export function estimateBulkRecords(
  itemCount: number,
  type: BulkTaskType,
  reviewsPerStoreLimit: number | null,
  freeExportRowLimit: number
): number {
  const perItem =
    type === 'review-urls'
      ? (reviewsPerStoreLimit ?? BULK_LIMITS.defaultReviewsPerStoreLimit)
      : freeExportRowLimit
  return itemCount * perItem
}

/**
 * 判定任务预估是否超出剩余额度（usage 快照不可得时由调用方放行，不经本函数）。
 */
export function isBulkQuotaExceeded(estimate: number, remaining: number): boolean {
  return estimate > remaining
}

/**
 * 汇总校验结果（controller 直接消费）。
 *
 * @param snapshot usage 快照；null = 不可得（fail-open，allowed=true）。
 */
export function checkBulkQuota(
  snapshot: { used: number; total: number } | null,
  estimate: number
): BulkQuotaEstimate {
  if (snapshot === null) {
    return { estimate, remaining: Number.POSITIVE_INFINITY, exceeded: false }
  }
  const remaining = snapshot.total - snapshot.used
  return { estimate, remaining, exceeded: isBulkQuotaExceeded(estimate, remaining) }
}
