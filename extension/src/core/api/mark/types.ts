/**
 * 打点类型定义
 */

/**
 * 打点类型
 */
export const MARK_TYPE = {
  /** 点击下载按钮 */
  DOWNLOAD_CLICK: 'download_click',
  /** 单个下载任务成功 */
  DOWNLOAD_SUCCESS: 'download_success',
  /** 单个下载任务失败 */
  DOWNLOAD_FAILED: 'download_failed',
  /** 单个下载任务因额度不足未开始 */
  DOWNLOAD_QUOTA_INSUFFICIENT: 'download_quota_insufficient',
  /** 网页点击下载 */
  WEB_DOWNLOAD_CLICK: 'web_download_click',
  /** 打开扩展弹窗 */
  POPUP_OPEN: 'popup_open',
  /** 打开升级订阅弹窗 */
  UPGRADE_MODAL_OPEN: 'upgrade_modal_open',
  /** content script 初始化 */
  CONTENT_OPEN: 'content_open',
  /** 打开网页 */
  WEB_PAGE_OPEN: 'web_page_open',
  /** 网页点击了解析 input */
  WEB_PARSE_INPUT_CLICK: 'web_parse_input_click',
  /** 网页点击解析 */
  WEB_PARSE_CLICK: 'web_parse_click',
  /** 网页解析成功 */
  WEB_PARSE_SUCCESS: 'web_parse_success',
  /** 网页解析失败 */
  WEB_PARSE_FAILED: 'web_parse_failed',
  /** 网页开始下载 */
  WEB_DOWNLOAD_START: 'web_download_start',
  /** 网页下载完成 */
  WEB_DOWNLOAD_SUCCESS: 'web_download_success',
  /** 网页下载失败 */
  WEB_DOWNLOAD_FAILED: 'web_download_failed'
} as const

export type MarkType = (typeof MARK_TYPE)[keyof typeof MARK_TYPE]

/**
 * 打点响应
 */
export interface MarkResponse {
  /** 是否记录成功 */
  recorded: boolean
}
