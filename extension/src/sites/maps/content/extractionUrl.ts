/**
 * 评论/照片采集工作页的 URL 契约（013 A2/A3）。
 *
 * place 页在点击手势内经同步 window.open 打开工作标签页（不经 background
 * tabs——其实测会绕过 e2e 的 Playwright route）；工作页 content script 靠
 * `gme_lrd` 查询参数识别「我方打开」并取 lrd（用户手动打开工作页不触发自动
 * 采集）。竞品 bulk 亦以自定义参数标记工作页（`_gme_=1`）。
 */

/** 工作页 lrd 传递参数名（我方自定义，页面本身会忽略未知参数）。 */
export const EXTRACTION_HOST_LRD_PARAM = 'gme_lrd'

/** 竞品照片页激活标记（09 参数总表：URL 参数 lkt=LocalPoiPhotos 时 boot）。 */
export const PHOTOS_PAGE_LKT_PARAM = 'LocalPoiPhotos'

/**
 * 构造评论页 URL：`https://search.google.com/local/reviews?placeid=…&_rs_=1`。
 *
 * @param placeId 商家 Place ID（fid 本地换算，见 parser/placeId）。
 * @param lrd 评论 RPC 定位参数。
 */
export function buildReviewsPageUrl(placeId: string, lrd: string): string {
  const query = new URLSearchParams({
    placeid: placeId,
    _rs_: '1',
    [EXTRACTION_HOST_LRD_PARAM]: lrd
  })
  return `https://search.google.com/local/reviews?${query.toString()}`
}

/**
 * 构造照片画廊页 URL：`https://www.google.com/maps/uv?pb=!1s{fid}&_ps_=1`
 * （lkt 沿用竞品激活标记语义）。
 */
export function buildPhotosPageUrl(fid: string, lrd: string): string {
  return `https://www.google.com/maps/uv?pb=!1s${encodeURIComponent(fid)}&_ps_=1&lkt=${PHOTOS_PAGE_LKT_PARAM}&${EXTRACTION_HOST_LRD_PARAM}=${encodeURIComponent(lrd)}`
}

/** 是否为评论工作页（host + path 判定）。 */
export function isReviewsPageUrl(url: URL): boolean {
  return url.hostname === 'search.google.com' && url.pathname === '/local/reviews'
}

/**
 * 是否为照片工作页：uv 页且携带我方 gme_lrd 标记（避免误伤用户手动打开的
 * uv 页面）。
 */
export function isPhotosPageUrl(url: URL): boolean {
  return (
    url.hostname === 'www.google.com' &&
    url.pathname === '/maps/uv' &&
    url.searchParams.has(EXTRACTION_HOST_LRD_PARAM)
  )
}
