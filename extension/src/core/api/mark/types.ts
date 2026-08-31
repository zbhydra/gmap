/**
 * 打点类型定义
 *
 * 打点通道裁决（A12，2026-08-30 hydra 拍板）：GA4 Measurement Protocol 不做
 * 真接入——行为分析统一走 SLS 通道（脱敏口径见 mark-sanitizer.ts）；需要 measurement_id 时另行立项。本模块即当前唯一的
 * 行为打点通道（background 统一写 SLS + install 事件双报后端）。
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
  /** Maps 导出结果同步到 Google Drive（013 A10，background 直传后自报） */
  SYNC_TO_GOOGLE_DRIVE: 'sync_to_google_drive',
  /** Maps Email/社媒补全完成（013 A4，U8；成功/失败均报） */
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
