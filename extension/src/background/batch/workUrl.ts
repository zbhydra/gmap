/**
 * 批量工作页 URL 构造（013 A6，background 调度器消费；纯函数）。
 *
 * - 关键词条目 → Maps 搜索页：`/maps/search/{kw}/@40.7604552,-73.9858076,12z`
 *   （坐标沿用竞品写死的纽约锚点，09 参数总表 §3），URL 携带批量参数驱动
 *   content script 自动开始；
 * - 评论 URL 条目 → 评论工作页：place URL 提取 fid/lrd（parser/placeId 纯函数，
 *   黄金样本验证过）→ 本地换算 placeId → buildReviewsPageUrl + 批量参数。
 *   换算失败（非 place URL / hex 段不足）返回 null，由状态机把该条目标记为
 *   invalid-url 跳过。
 *
 * hex 长度上限取包内默认值：URL hex 段容差与 RPC 解析下标无关，不属远程
 * 治理的漂移面。
 */

import { extractPlaceUrlIds, derivePlaceIdFromFid } from '@/sites/maps/content/parser/placeId'
import { buildReviewsPageUrl } from '@/sites/maps/content/extractionUrl'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import {
  BULK_ITEM_PARAM,
  BULK_MAX_PARAM,
  BULK_PARAM,
  BULK_TASK_PARAM
} from '@/sites/maps/content/bulkAuto'

/** 搜索锚点坐标（竞品同款纽约时代广场，zoom 12；09 参数总表 §3）。 */
const SEARCH_ANCHOR = '@40.7604552,-73.9858076,12z'

/** 批量工作页 URL 查询参数（任务/条目匹配键 + 可选每店上限）。 */
function bulkQuery(taskId: string, itemIndex: number, reviewsMax: number | null): URLSearchParams {
  const query = new URLSearchParams({
    [BULK_PARAM]: '1',
    [BULK_TASK_PARAM]: taskId,
    [BULK_ITEM_PARAM]: String(itemIndex)
  })
  if (reviewsMax !== null) {
    query.set(BULK_MAX_PARAM, String(reviewsMax))
  }
  return query
}

/**
 * 构造关键词条目的 Maps 搜索工作页 URL。
 *
 * @param keyword 关键词原文（encodeURIComponent 后拼入路径）。
 */
export function buildKeywordWorkUrl(keyword: string, taskId: string, itemIndex: number): string {
  const query = bulkQuery(taskId, itemIndex, null)
  return `https://www.google.com/maps/search/${encodeURIComponent(keyword)}/${SEARCH_ANCHOR}?${query.toString()}`
}

/**
 * 构造评论 URL 条目的评论工作页 URL；place URL 非法时返回 null。
 *
 * @param placeUrl 用户输入的 Maps place URL。
 * @param reviewsPerStoreLimit 每店评论上限（经 URL 传给评论工作页）。
 */
export function buildReviewWorkUrl(
  placeUrl: string,
  taskId: string,
  itemIndex: number,
  reviewsPerStoreLimit: number
): string | null {
  const ids = extractPlaceUrlIds(placeUrl, DEFAULT_MAPS_CONFIG.parseSchema.placeIdHexMaxLength)
  if (ids === null) {
    return null
  }
  const placeId = derivePlaceIdFromFid(ids.fid)
  if (placeId.length === 0) {
    return null
  }

  const workUrl = new URL(buildReviewsPageUrl(placeId, ids.lrd))
  for (const [key, value] of bulkQuery(taskId, itemIndex, reviewsPerStoreLimit).entries()) {
    workUrl.searchParams.set(key, value)
  }
  return workUrl.toString()
}
