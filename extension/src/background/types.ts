/**
 * Background RPC v2 迁移类型。
 *
 * 这些类型描述 background 对 content/popup 暴露的状态与扩展能力。
 */

import type { MarkType } from '@/core/api/mark/types'
import type { RuntimeConfig } from '@/core/runtimeConfig'

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
