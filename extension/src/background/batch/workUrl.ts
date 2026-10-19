/**
 * 批量工作页 URL 构造（013 A6，background 调度器消费；纯函数）。
 *
 * - 关键词条目 → Maps 搜索页：`/maps/search/{kw}/@40.7604552,-73.9858076,12z`
 *   （坐标沿用竞品写死的纽约锚点，09 参数总表 §3），URL 携带批量参数驱动
 *   content script 自动开始；
 * - 评论 URL 条目 → Maps 评论工作页：两类输入统一转换，保留 locale 与批量参数。
 *
 * hex 长度上限取包内默认值：URL hex 段容差与 RPC 解析下标无关，不属远程
 * 治理的漂移面。
 */

import {
  extractPlaceUrlIds,
  derivePlaceIdFromFid,
  deriveFidFromPlaceId
} from '@/sites/maps/content/parser/placeId'
import { buildReviewsPageUrl, isGoogleReviewsUrl } from '@/sites/maps/content/extractionUrl'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import {
  BULK_ITEM_PARAM,
  BULK_MAX_PARAM,
  BULK_PARAM,
  BULK_TASK_PARAM,
  BULK_TOTAL_PARAM
} from '@/sites/maps/content/bulkAuto'

/** 搜索锚点坐标（竞品同款纽约时代广场，zoom 12；09 参数总表 §3）。 */
const SEARCH_ANCHOR = '@40.7604552,-73.9858076,12z'

/** 批量工作页 URL 查询参数（任务/条目匹配键 + 可选每店上限）。 */
function bulkQuery(
  taskId: string,
  itemIndex: number,
  itemCount: number,
  reviewsMax: number | null
): URLSearchParams {
  const query = new URLSearchParams({
    [BULK_PARAM]: '1',
    [BULK_TASK_PARAM]: taskId,
    [BULK_ITEM_PARAM]: String(itemIndex),
    [BULK_TOTAL_PARAM]: String(itemCount)
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
export function buildKeywordWorkUrl(
  keyword: string,
  taskId: string,
  itemIndex: number,
  itemCount: number
): string {
  const query = bulkQuery(taskId, itemIndex, itemCount, null)
  return `https://www.google.com/maps/search/${encodeURIComponent(keyword)}/${SEARCH_ANCHOR}?${query.toString()}`
}

/**
 * 构造评论工作页 URL；只接受 Google Reviews 或 Maps place 链接。
 *
 * @param placeUrl 用户输入的地点或评论链接。
 * @param reviewsPerStoreLimit 每店评论上限（经 URL 传给评论工作页）。
 */
export function buildReviewWorkUrl(
  placeUrl: string,
  taskId: string,
  itemIndex: number,
  reviewsPerStoreLimit: number,
  itemCount: number
): string | null {
  let inputUrl: URL
  try {
    inputUrl = new URL(placeUrl)
  } catch {
    return null
  }
  if (inputUrl.protocol !== 'https:') {
    return null
  }

  let placeId: string
  let fid: string
  if (isGoogleReviewsUrl(inputUrl)) {
    placeId = inputUrl.searchParams.get('placeid') ?? ''
    fid = deriveFidFromPlaceId(placeId)
    if (!fid) {
      return null
    }
  } else {
    if (inputUrl.hostname !== 'www.google.com' || !inputUrl.pathname.startsWith('/maps/place/')) {
      return null
    }
    const ids = extractPlaceUrlIds(
      inputUrl.href,
      DEFAULT_MAPS_CONFIG.parseSchema.placeIdHexMaxLength
    )
    if (ids === null) {
      return null
    }
    fid = ids.fid
    placeId = derivePlaceIdFromFid(fid)
    if (placeId.length === 0) {
      return null
    }
  }
  const workUrl = new URL(buildReviewsPageUrl(placeId, fid))
  for (const key of ['hl', 'gl']) {
    const value = inputUrl.searchParams.get(key)
    if (value !== null) workUrl.searchParams.set(key, value)
  }
  for (const [key, value] of bulkQuery(
    taskId,
    itemIndex,
    itemCount,
    reviewsPerStoreLimit
  ).entries()) {
    workUrl.searchParams.set(key, value)
  }
  return workUrl.toString()
}
