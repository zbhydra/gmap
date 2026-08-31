/**
 * Background RPC v2 register。
 *
 * register 声明 background 能力边界：扩展运行时配置与 Maps 远程配置透传、
 * 打点代报（recordMark）、批量任务调度与评论/照片工作页打开等 Maps 业务能力；
 * 调用方仅限 popup 与 content script（METHOD_TARGETS 逐方法声明）。
 */

import type {
  BackgroundBulkCommandResponse,
  BackgroundBulkTaskIdRequest,
  BackgroundCreateBulkTaskRequest,
  BackgroundEnrichMapsBusinessesRequest,
  BackgroundEnrichMapsBusinessesResponse,
  BackgroundGetBulkStateResponse,
  BackgroundGetMapsConfigResponse,
  BackgroundGetMapsUsageResponse,
  BackgroundGetRuntimeConfigResponse,
  BackgroundGetStateResponse,
  BackgroundPingResponse,
  BackgroundRecordMarkRequest,
  BackgroundRecordMarkResponse
} from './types'

/** background provider channel。 */
export const CHANNEL = 'background' as const

/** background 生成客户端类名。 */
export const CLASS_NAME = 'BackgroundChannel' as const

/** Background RPC 方法签名声明。 */
export const Handler = {
  /** background 连通性检查。 */
  ping(): Promise<BackgroundPingResponse> {
    return declarationOnly('background.ping')
  },

  /** 查询 background 状态。 */
  getState(): Promise<BackgroundGetStateResponse> {
    return declarationOnly('background.getState')
  },

  /** 查询扩展运行时配置。 */
  getRuntimeConfig(): Promise<BackgroundGetRuntimeConfigResponse> {
    return declarationOnly('background.getRuntimeConfig')
  },

  /** 由 background 代 content script 透传拉取 Maps 远程配置。 */
  getMapsConfig(): Promise<BackgroundGetMapsConfigResponse> {
    return declarationOnly('background.getMapsConfig')
  },

  /** 由 background 代 content script 记录打点。 */
  recordMark(_params: BackgroundRecordMarkRequest): Promise<BackgroundRecordMarkResponse> {
    return declarationOnly('background.recordMark')
  },

  /** 查询 Maps 月度配额用量（013 A11，U7；面板 Start 门控与 popup 账号区）。 */
  getMapsUsage(): Promise<BackgroundGetMapsUsageResponse> {
    return declarationOnly('background.getMapsUsage')
  },

  /**
   * 代理 Email/社媒补全（013 A4，U8）：content 经 background 调后端
   * enrich 端点（零 CORS 面，与 usage 通道同构）。
   */
  enrichMapsBusinesses(
    _params: BackgroundEnrichMapsBusinessesRequest
  ): Promise<BackgroundEnrichMapsBusinessesResponse> {
    return declarationOnly('background.enrichMapsBusinesses')
  },

  /** 读取批量任务队列状态（013 A6，dashboard 页渲染入口）。 */
  getBulkState(): Promise<BackgroundGetBulkStateResponse> {
    return declarationOnly('background.getBulkState')
  },

  /** 创建批量任务（关键词/评论 URL 队列）。 */
  createBulkTask(_params: BackgroundCreateBulkTaskRequest): Promise<BackgroundBulkCommandResponse> {
    return declarationOnly('background.createBulkTask')
  },

  /** 启动/续跑批量任务（全局互斥由状态机裁决，冲突经 code=mutex 返回）。 */
  startBulkTask(_params: BackgroundBulkTaskIdRequest): Promise<BackgroundBulkCommandResponse> {
    return declarationOnly('background.startBulkTask')
  },

  /** 停止批量任务（关工作页，状态转 paused，可续跑）。 */
  stopBulkTask(_params: BackgroundBulkTaskIdRequest): Promise<BackgroundBulkCommandResponse> {
    return declarationOnly('background.stopBulkTask')
  },

  /** 删除批量任务（运行中先关工作页）。 */
  deleteBulkTask(_params: BackgroundBulkTaskIdRequest): Promise<BackgroundBulkCommandResponse> {
    return declarationOnly('background.deleteBulkTask')
  }
}

/** background register handler 类型。 */
export type BackgroundHandler = typeof Handler

/** background 方法允许调用方。 */
export const METHOD_TARGETS = {
  /** ping 允许 popup 调用。 */
  ping: ['popup'],
  /** getState 允许 popup 调用。 */
  getState: ['popup'],
  /** getRuntimeConfig 允许 popup 调用。 */
  getRuntimeConfig: ['popup'],
  /** getMapsConfig 允许 content script 调用。 */
  getMapsConfig: ['content'],
  /** recordMark 允许 popup 调用，统一由 background 写 SLS。 */
  recordMark: ['popup'],
  /** getMapsUsage 允许 content（面板门控）与 popup（账号区）调用。 */
  getMapsUsage: ['content', 'popup'],
  /** enrichMapsBusinesses 仅允许 content 调用（采集行在 content 侧）。 */
  enrichMapsBusinesses: ['content'],
  /** 批量状态/命令允许扩展页调用（dashboard 页按 sender 推导为 popup 通道）。 */
  getBulkState: ['popup'],
  createBulkTask: ['popup'],
  startBulkTask: ['popup'],
  stopBulkTask: ['popup'],
  deleteBulkTask: ['popup']
} as const satisfies Record<keyof BackgroundHandler, readonly ('content' | 'popup')[]>

/** background 方法允许传输。 */
export const METHOD_TRANSPORTS = {
  /** ping 使用 Chrome message。 */
  ping: ['chrome'],
  /** getState 使用 Chrome message。 */
  getState: ['chrome'],
  /** getRuntimeConfig 使用 Chrome message。 */
  getRuntimeConfig: ['chrome'],
  /** getMapsConfig 使用 Chrome message。 */
  getMapsConfig: ['chrome'],
  /** recordMark 使用 Chrome message。 */
  recordMark: ['chrome'],
  /** getMapsUsage 使用 Chrome message。 */
  getMapsUsage: ['chrome'],
  /** enrichMapsBusinesses 使用 Chrome message。 */
  enrichMapsBusinesses: ['chrome'],
  /** 批量方法使用 Chrome message。 */
  getBulkState: ['chrome'],
  createBulkTask: ['chrome'],
  startBulkTask: ['chrome'],
  stopBulkTask: ['chrome'],
  deleteBulkTask: ['chrome']
} as const satisfies Record<keyof BackgroundHandler, readonly ['chrome']>

/** background 方法请求体限制，单位字节。 */
export const METHOD_REQUEST_LIMITS = {
  /** ping 无业务参数。 */
  ping: 1024,
  /** getState 无业务参数。 */
  getState: 1024,
  /** getRuntimeConfig 无业务参数。 */
  getRuntimeConfig: 1024,
  /** getMapsConfig 无业务参数。 */
  getMapsConfig: 1024,
  /** recordMark 携带打点类型和附加信息。 */
  recordMark: 4096,
  /** getMapsUsage 无入参。 */
  getMapsUsage: 1024,
  /** enrichMapsBusinesses：50 商家（domain/website/name/address 原文）最坏形态上界。 */
  enrichMapsBusinesses: 131072,
  /** 批量状态无入参。 */
  getBulkState: 1024,
  /** 创建任务：500 条目（关键词/URL 原文）最坏形态上界。 */
  createBulkTask: 262144,
  /** 任务 id 命令入参。 */
  startBulkTask: 1024,
  stopBulkTask: 1024,
  deleteBulkTask: 1024
} as const satisfies Record<keyof BackgroundHandler, number>

/** background 方法响应体限制，单位字节。 */
export const METHOD_RESPONSE_LIMITS = {
  /** ping 返回连通状态。 */
  ping: 4096,
  /** getState 返回状态文本。 */
  getState: 16384,
  /** getRuntimeConfig 返回轻量扩展配置。 */
  getRuntimeConfig: 1024,
  /** getMapsConfig 返回三组稀疏覆盖，上限对齐远程配置通道的 16KB 约定。 */
  getMapsConfig: 16384,
  /** recordMark 返回记录结果。 */
  recordMark: 1024,
  /** getMapsUsage 返回 used/total/period/exhausted 快照（快照不可得时为 null）。 */
  getMapsUsage: 4096,
  /** enrichMapsBusinesses：50 商家的 emails/medias 结果（每条上界宽松余量）。 */
  enrichMapsBusinesses: 262144,
  /** 批量状态响应：150 任务 × 500 条目的理论上界放宽到 8MB。 */
  getBulkState: 8_388_608,
  /** 批量命令响应携带命令后的全量状态，上限对齐 getBulkState。 */
  createBulkTask: 8_388_608,
  startBulkTask: 8_388_608,
  stopBulkTask: 8_388_608,
  deleteBulkTask: 8_388_608
} as const satisfies Record<keyof BackgroundHandler, number>

/** register 占位函数，避免声明被业务代码误调用。 */
function declarationOnly(methodName: string): never {
  throw new Error(`[rpc-register] ${methodName} is declaration only`)
}
