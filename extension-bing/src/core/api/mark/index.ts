/**
 * 插件端打点 API 导出。
 *
 * 两条通道：SLS WebTracking（markApi，常规业务打点唯一通道）与后端
 * mark 通道（recordBackendMark）。install 事件按 013 域拍板双报
 * （分析通道 + 后端 mark 通道），由 background 的 InstallMarkReporter 编排。
 */

export { markApi } from './api'
export { recordBackendMark } from './backend'
export type { MarkType, MarkResponse } from './types'
export { MARK_TYPE } from './types'
