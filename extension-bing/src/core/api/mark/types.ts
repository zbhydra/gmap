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
  /** 扩展安装（分析通道 + 后端 mark 通道双报，见 background InstallMarkReporter） */
  INSTALL: 'install',

  /** popup / 面板上的用户动作（mark_msg 带 action，避免为每个按钮建事件名） */
  UI_ACTION: 'ui_action',
  /** Bing 搜索采集开始（016，含结果页形态） */
  SEARCH: 'search',
  /** 采集进入终态（mark_msg 带 count / stop_reason / duration_ms） */
  SEARCH_FINISH: 'search_finish',
  /** 采集结果导出（016） */
  EXPORT_RESULTS: 'export_results',
  /** 免费档行数上限截断（016 §5 门控） */
  FREE_LIMIT_REACHED: 'free_limit_reached',
  /** 账号门控态（登录/Pro）变化 */
  GATE_STATE_CHANGE: 'gate_state_change',
  /** 插件内打开 Pricing 订阅页 */
  PRICING_OPEN: 'pricing_open',
  /** Email/社媒补全完成（016 E6 二期，成功/失败均报） */
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
