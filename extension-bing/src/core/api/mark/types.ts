/**
 * 打点类型定义
 */

/**
 * 打点类型
 */
export const MARK_TYPE = {
  /** 打开扩展弹窗 */
  POPUP_OPEN: 'popup_open',
  /** content script 初始化 */
  CONTENT_OPEN: 'content_open',
  /** 打开网页 */
  WEB_PAGE_OPEN: 'web_page_open',
  /** 扩展安装（GA4/分析通道 + 后端 mark 通道双报，见 background InstallMarkReporter） */
  INSTALL: 'install',
  /** Maps 搜索采集开始（013 A1，content 广播 + background 统一写 SLS） */
  SEARCH: 'search',
  /** Maps 采集结果导出（013 A1） */
  EXPORT_RESULTS: 'export_results',
  /** Maps 评论内容采集开始（013 A2，content 广播 + background 统一写 SLS） */
  SCRAPE_REVIEWS_CONTENT: 'scrape_reviews_content',
  /** Email/社媒补全完成（016 E6 二期，成功/失败均报） */
  ENRICH_COMPLETE: 'enrich_complete'
} as const

export type MarkType = (typeof MARK_TYPE)[keyof typeof MARK_TYPE]

/**
 * 打点响应
 */
export interface MarkResponse {
  /** 是否记录成功 */
  recorded: boolean
}
