/**
 * 评论/照片采集工作页的 URL 契约（013 A2/A3）。
 *
 * 评论页以完整 fid 工作参数标记采集意图；照片页会被 Google 重定向，
 * 由 background 保留一次性标签页意图，图库 content 核对真实 fid 后领取。
 */

/** 评论工作页的完整 fid，同时标记我方采集意图。 */
export const REVIEWS_WORK_FID_PARAM = 'gme_fid'

/** 竞品照片页激活标记（09 参数总表：URL 参数 lkt=LocalPoiPhotos 时 boot）。 */
export const PHOTOS_PAGE_LKT_PARAM = 'LocalPoiPhotos'

/**
 * 构造 Maps 地点评论工作页。
 *
 * @param placeId 商家 Place ID（fid 本地换算，见 parser/placeId）。
 * @param fid 评论 RPC 所需的完整定位参数。
 */
export function buildReviewsPageUrl(placeId: string, fid: string): string {
  const query = new URLSearchParams({
    q: `place_id:${placeId}`,
    [REVIEWS_WORK_FID_PARAM]: fid
  })
  return `https://www.google.com/maps/place/?${query.toString()}`
}

/**
 * 构造照片画廊页 URL：`https://www.google.com/maps/uv?pb=!1s{fid}&_ps_=1`
 * （lkt 沿用竞品激活标记语义）。
 */
export function buildPhotosPageUrl(fid: string): string {
  return `https://www.google.com/maps/uv?pb=!1s${encodeURIComponent(fid)}&_ps_=1&lkt=${PHOTOS_PAGE_LKT_PARAM}`
}

/** 可接受的 Google 评论输入链接；只作为转换入口。 */
export function isGoogleReviewsUrl(url: URL): boolean {
  return (
    url.protocol === 'https:' &&
    url.hostname === 'search.google.com' &&
    url.pathname === '/local/reviews'
  )
}

/** 普通 Maps 地点页不触发评论工作流。 */
export function isReviewsPageUrl(url: URL): boolean {
  return (
    url.protocol === 'https:' &&
    url.hostname === 'www.google.com' &&
    url.pathname.startsWith('/maps/place/') &&
    url.searchParams.has(REVIEWS_WORK_FID_PARAM)
  )
}

/** URL 入口只接受完整 fid，不猜换短定位参数。 */
export function readReviewsWorkFid(url: URL): string | null {
  const fid = url.searchParams.get(REVIEWS_WORK_FID_PARAM)
  return fid && /^0x[0-9a-f]{1,16}:0x[0-9a-f]{1,16}$/i.test(fid) ? fid : null
}

/**
 * Google 原生照片图库候选页；自动采集还必须领取 background 中的明确点击意图。
 */
export function isPhotosPageUrl(url: URL): boolean {
  if (
    url.protocol !== 'https:' ||
    !['www.google.com', 'www.google.com.hk'].includes(url.hostname)
  ) {
    return false
  }
  return (
    url.pathname === '/maps/uv' ||
    (url.pathname === '/search' &&
      new URLSearchParams(url.hash.slice(1)).get('lkt') === PHOTOS_PAGE_LKT_PARAM)
  )
}
