/**
 * 扩展单向事件类型。
 *
 * 只用于 Chrome/DOM EventBus 的通知链路，不承载 req-resp RPC。
 * 事件基建（EventDefinition / EventMessage / isEventMessage）是通用底座；
 * 业务事件在对应功能落地时按需补充定义。
 */

import type { IntegrationHubspotBusiness } from '@/core/api/integration/types'
import type { MapsUsageSource } from '@/sites/maps/usage/types'

/** EventBus 可传递的事件 payload。 */
export type EventPayload = object | string | number | boolean | null | void

/** EventBus 事件定义约束。 */
export type EventDefinition = Record<string, EventPayload>

/** 提取事件名。 */
export type EventNames<TEvents extends EventDefinition> = keyof TEvents & string

/** 提取事件数据。 */
export type EventData<
  TEvents extends EventDefinition,
  TEvent extends EventNames<TEvents>
> = TEvents[TEvent]

/** EventBus 内部消息格式。 */
export interface EventMessage<
  TEvents extends EventDefinition,
  TEvent extends EventNames<TEvents> = EventNames<TEvents>
> {
  /** 单向事件标记。 */
  __event__: true
  /** 事件名。 */
  event: TEvent
  /** 事件数据。 */
  data: EventData<TEvents, TEvent>
}

/** 待判断的事件消息。 */
interface EventMessageCandidate {
  /** 单向事件标记。 */
  __event__?: boolean
  /** 事件名。 */
  event?: string
  /** 事件数据。 */
  data?: EventPayload
}

/** 判断消息是否为单向事件。 */
export function isEventMessage(
  value: EventMessageCandidate
): value is EventMessage<EventDefinition> {
  return value.__event__ === true && typeof value.event === 'string'
}

/** 业务行为打点事件的 payload（content 广播，background 统一写 SLS）。 */
export interface MarkEventPayload {
  /** 打点附加信息（如 `kw=coffee`、`count=20, kw=coffee`）。 */
  markMsg: string
  /** 事件发生的页面 URL，用于填充 SLS page_path。 */
  pageUrl: string
}

/** popup/content/background 之间的 Chrome 单向事件。 */
export interface ExtensionEvents extends EventDefinition {
  /** Maps 搜索采集开始（013 A1）。 */
  mapsSearchMark: MarkEventPayload
  /** Maps 采集结果导出（013 A1）。 */
  mapsExportResultsMark: MarkEventPayload
  /** Maps 评论内容采集开始（013 A2）。 */
  mapsScrapeReviewsContentMark: MarkEventPayload
  /**
   * Maps 导出结果 auto_save 同步请求（013 A10，U9）：content 在采集完成边沿
   * 广播，background 执行 Drive 直传与 HubSpot 同步（单路失败不阻断）。
   */
  mapsAutoSaveExport: MapsAutoSaveExportPayload
  /** 批量任务条目完成回报（013 A6，工作页 content → background 调度器）。 */
  mapsBulkItemDone: BulkItemDonePayload
  /**
   * 批量任务条目进展回报（013 A6）：工作页每页/每批采到新数据时通知调度器
   * 重置卡死时钟（90s 判定 = 自上次进展以来）。
   */
  mapsBulkItemProgress: BulkItemProgressPayload
  /** 批量任务状态已落盘（013 A6，background → dashboard 重读快照的通知）。 */
  mapsBulkStateChanged: BulkStateChangedPayload
  /**
   * 采集会话完成上报（013 A11，U7）：content 在搜索/评论/照片采集完成边沿
   * 广播，background 调后端按 request_id 幂等扣减月度配额。失败不阻断采集。
   */
  mapsUsageReport: MapsUsageReportPayload
  /**
   * Email/社媒补全完成（013 A4，U8）：content 在补全运行结束（成功或失败）
   * 后广播，background 统一写 SLS（MARK_TYPE.ENRICH_COMPLETE）。
   */
  mapsEnrichCompleteMark: MarkEventPayload
  /** content script 初始化（feat.md 埋点表 content_open，Maps 页挂载前上报）。 */
  contentOpenMark: MarkEventPayload
}

/** 采集会话配额上报 payload。 */
export interface MapsUsageReportPayload {
  /** 本会话采集记录数（搜索行/评论条/照片张）。 */
  records: number
  /** 会话幂等 ID（会话发起时生成，同 ID 重放服务端只扣一次）。 */
  requestId: string
  /** 会话来源（观测用）。 */
  source: MapsUsageSource
  /** 事件发生的页面 URL（日志定位）。 */
  pageUrl: string
}

/** auto_save 同步请求 payload（content 构建，background 消费）。 */
export interface MapsAutoSaveExportPayload {
  /** 集成产物 CSV 全文（BOM + 表头 + 数据行，格式固定 CSV 与用户导出格式无关）。 */
  csvContent: string
  /** 产物文件名（`MapsGrab-Extractor-{条数}-{关键词}-{日期}.csv`）。 */
  filename: string
  /** 搜索关键词。 */
  keyword: string
  /** 去重后条数。 */
  rowCount: number
  /** HubSpot 同步用商家数组（与 CSV 同一批去重行）。 */
  businesses: IntegrationHubspotBusiness[]
  /** 事件发生的页面 URL（日志定位）。 */
  pageUrl: string
}

/** 批量条目完成回报 payload。 */
export interface BulkItemDonePayload {
  /** 所属批量任务 id（与 URL 参数回传一致，调度器据此匹配）。 */
  taskId: string
  /** 完成的条目下标（防陈旧回报：游标不匹配即丢弃）。 */
  itemIndex: number
  /** 本条目采集条数。 */
  collected: number
  /** 回报页面 URL（日志定位用）。 */
  pageUrl: string
}

/** 批量条目进展回报 payload（每页/每批新数据，重置卡死时钟）。 */
export interface BulkItemProgressPayload {
  /** 所属批量任务 id。 */
  taskId: string
  /** 进展中的条目下标（防陈旧回报：游标不匹配即丢弃）。 */
  itemIndex: number
  /** 回报页面 URL（日志定位用）。 */
  pageUrl: string
}

/** 批量状态变更通知 payload（通知语义，dashboard 收到后重读持久化快照）。 */
export interface BulkStateChangedPayload {
  /** 发生变更的任务 id；null = 未针对单任务（如删除后的 alarm 重算）。 */
  taskId: string | null
}

/** content 内部 DOM 单向事件。暂无业务事件，落地时补充。 */
export interface ContentEvents extends EventDefinition {}
