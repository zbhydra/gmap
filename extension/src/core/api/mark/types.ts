/**
 * 打点类型定义
 *
 * 打点通道裁决（A12，2026-08-30 hydra 拍板）：GA4 Measurement Protocol 不做
 * 真接入——行为分析统一走 SLS 通道（脱敏口径见 mark-sanitizer.ts）；需要 measurement_id 时另行立项。本模块即当前唯一的
 * 行为打点通道（background 统一写 SLS + install 事件双报后端）。
 */

/**
 * 打点类型
 *
 * 命名口径 `<对象>_<动作>`；`popup_open` / `content_open` 等既有事件名保持不变，
 * 新增事件按此规则追加，避免同一业务在 SLS 里出现两套叫法。
 */
export const MARK_TYPE = {
  /** 打开扩展弹窗 */
  POPUP_OPEN: 'popup_open',
  /** content script 初始化 */
  CONTENT_OPEN: 'content_open',
  /** 扩展安装（GA4/分析通道 + 后端 mark 通道双报，见 background InstallMarkReporter） */
  INSTALL: 'install',

  /** popup / dashboard / 面板上的用户动作（mark_msg 带 action，避免为每个按钮建事件名） */
  UI_ACTION: 'ui_action',
  /** Maps 搜索采集开始（013 A1，content 广播 + background 统一写 SLS） */
  SEARCH: 'search',
  /** 搜索采集进入终态（mark_msg 带 count / stop_reason / duration_ms） */
  SEARCH_FINISH: 'search_finish',
  /** Maps 评论内容采集开始（013 A2，content 广播 + background 统一写 SLS） */
  SCRAPE_REVIEWS_CONTENT: 'scrape_reviews_content',
  /** Maps 照片内容采集开始（013 A3） */
  SCRAPE_PHOTOS_CONTENT: 'scrape_photos_content',
  /** Maps 采集结果导出（013 A1） */
  EXPORT_RESULTS: 'export_results',
  /** 配额耗尽拦截（搜索/评论/照片/批量任一入口） */
  QUOTA_BLOCKED: 'quota_blocked',
  /** 插件内打开 Pricing 订阅页 */
  PRICING_OPEN: 'pricing_open',

  /** 批量任务创建（013 A6） */
  BULK_TASK_CREATE: 'bulk_task_create',
  /** 批量任务开始/继续/暂停/删除等状态动作（mark_msg 带 action / task_id） */
  BULK_TASK_ACTION: 'bulk_task_action',
  /** 批量任务整体终结（mark_msg 带 done / failed / duration_ms） */
  BULK_TASK_FINISH: 'bulk_task_finish',
  /** 批量任务单条目完成（content 回报，background 记） */
  BULK_ITEM_DONE: 'bulk_item_done',

  /** 设置项变更（options 页，mark_msg 带 key / value） */
  SETTINGS_CHANGE: 'settings_change',
  /** 集成连接/断开（Drive / HubSpot，013 A10） */
  INTEGRATION_ACTION: 'integration_action',

  /** Maps 导出结果同步到 Google Drive（013 A10，background 直传后自报） */
  SYNC_TO_GOOGLE_DRIVE: 'sync_to_google_drive',
  /** Maps Email/社媒补全完成（013 A4，U8；成功/失败均报） */
  ENRICH_COMPLETE: 'enrich_complete',

  /** 插件未捕获异常（SLS-only，三上下文全局捕获） */
  UNCAUGHT_ERROR: 'extension_uncaught_error'
} as const

export type MarkType = (typeof MARK_TYPE)[keyof typeof MARK_TYPE]

/**
 * 打点响应
 */
export interface MarkResponse {
  /** 是否记录成功 */
  recorded: boolean
}
