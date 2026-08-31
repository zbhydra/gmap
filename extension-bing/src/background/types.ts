/**
 * Background RPC v2 迁移类型。
 *
 * 这些类型描述 background 对 content/popup 暴露的状态与扩展能力。
 */

import type { MarkType } from '@/core/api/mark/types'
import type { RuntimeConfig } from '@/core/runtimeConfig'
import type { BingRemoteConfigOverride } from '@/sites/bing/config/contract'

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

/** background 代 content script 拉取 Bing 远程配置的响应（服务端稀疏覆盖载荷）。 */
export type BackgroundGetBingConfigResponse = BingRemoteConfigOverride

/** background 免费门控态查询响应（016 §5：匿名即免费；Pro = 既有订阅态有效）。 */
export interface BackgroundGetGateStateResponse {
  /** 是否已登录（官网登录桥收编的账号态）。 */
  authenticated: boolean
  /** 是否 Pro（订阅档有效且非免费档）。 */
  isPro: boolean
  /** 账号展示名（full_name 优先，其次 email）；未登录为 null。 */
  displayName: string | null
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
