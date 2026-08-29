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
  WEB_PAGE_OPEN: 'web_page_open'
} as const

export type MarkType = (typeof MARK_TYPE)[keyof typeof MARK_TYPE]

/**
 * 打点响应
 */
export interface MarkResponse {
  /** 是否记录成功 */
  recorded: boolean
}
