/**
 * Background RPC v2 迁移类型。
 *
 * 这些类型描述 background 对 content/popup 暴露的状态与扩展能力。
 */

import type { MarkType } from '@/core/api/mark/types'
import type { RuntimeConfig } from '@/core/runtimeConfig'
import type { MapsRemoteConfigOverride } from '@/sites/maps/config/contract'
import type { MapsUsageSnapshot } from '@/sites/maps/usage/types'
import type { MapsEnrichBusinessInput, MapsEnrichResponse } from '@/sites/maps/enrich/types'
import type { BulkCommandResult, BulkState, BulkTaskType } from '@/background/batch/types'

/** background ping 响应。 */
export interface BackgroundPingResponse {
  /** 是否收到 background 响应。 */
  pong: boolean
  /** 响应来源。 */
  from: string
}

/** background 状态响应。 */
export interface BackgroundGetStateResponse {
  /** background 当前状态。 */
  state: string
}

/** background 读取扩展运行时配置的响应。 */
export type BackgroundGetRuntimeConfigResponse = RuntimeConfig

/** background 代 content script 拉取 Maps 远程配置的响应（服务端稀疏覆盖载荷）。 */
export type BackgroundGetMapsConfigResponse = MapsRemoteConfigOverride

/** background 更新徽标请求。 */
export interface BackgroundUpdateBadgeRequest {
  /** 徽标显示数量。 */
  count: number
}

/** background 更新徽标响应。 */
export interface BackgroundUpdateBadgeResponse {
  /** 是否已更新徽标。 */
  updated: boolean
}

/** background 打开官网插件登录页响应。 */
export interface BackgroundOpenExtensionLoginResponse {
  /** 是否已打开登录窗口。 */
  opened: boolean
}

/** background 记录打点请求。 */
export interface BackgroundRecordMarkRequest {
  /** 打点类型。 */
  mark_type: MarkType
  /** 打点附加信息。 */
  mark_msg: string
}

/** background 记录打点响应。 */
export interface BackgroundRecordMarkResponse {
  /** 是否已成功记录打点。 */
  recorded: boolean
}

/**
 * background 查询 Maps 月度配额用量的响应（013 A11，U7）。
 *
 * null = usage 不可得（服务端/网络故障），调用方 fail-open 放行采集。
 */
export type BackgroundGetMapsUsageResponse = MapsUsageSnapshot | null

/** background 代理 Email/社媒补全请求（013 A4，U8；content 不直连后端）。 */
export interface BackgroundEnrichMapsBusinessesRequest {
  /** 单批商家数组（调用方已按 domain 去重，≤50 条）。 */
  businesses: MapsEnrichBusinessInput[]
}

/** background 代理 Email/社媒补全响应（服务端载荷透传）。 */
export type BackgroundEnrichMapsBusinessesResponse = MapsEnrichResponse

/** background 打开订阅落地页请求（013 U7 遗留接线，W7；content 无 tabs 能力）。 */
export interface BackgroundOpenPricingPageRequest {
  /** 完整落地页 URL（含归因参数，content 侧由远程 pricingUrl 组装）。 */
  url: string
}

/** background 打开订阅落地页响应。 */
export interface BackgroundOpenPricingPageResponse {
  /** 是否已成功创建标签页（创建失败返回 false，不抛 RPC 错误）。 */
  opened: boolean
}

/** background 读取批量任务状态的响应（013 A6，U5）。 */
export type BackgroundGetBulkStateResponse = BulkState

/** background 创建批量任务请求。 */
export interface BackgroundCreateBulkTaskRequest {
  /** 任务名（空串 = 使用默认名）。 */
  name: string
  /** 任务类型。 */
  type: BulkTaskType
  /** 条目载荷（关键词或评论 URL，原始行）。 */
  values: string[]
  /** 批量每店评论上限（仅评论任务；null = 使用默认 300）。 */
  reviewsPerStoreLimit: number | null
}

/** background 启停/删除批量任务请求。 */
export interface BackgroundBulkTaskIdRequest {
  /** 目标任务 id。 */
  taskId: string
}

/** background 批量任务命令响应（业务拒绝用 code 承载，不抛 RPC 错误）。 */
export type BackgroundBulkCommandResponse = BulkCommandResult
