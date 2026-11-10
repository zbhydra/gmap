/**
 * Background RPC v2 register。
 *
 * register 声明 background 能力边界：扩展运行时配置与 Maps 远程配置透传、
 * 打点代报（recordMark）、批量任务调度与评论/照片工作页打开等 Maps 业务能力；
 * 调用方仅限 popup 与 content script（METHOD_TARGETS 逐方法声明）。
 */

import type { JsonValue } from '@/core/rpc/types'

import type {
  BackgroundBulkCommandResponse,
  BackgroundBulkTaskIdRequest,
  BackgroundCreateBulkTaskRequest,
  BackgroundCreateBulkTaskResponse,
  BackgroundEnrichMapsBusinessesRequest,
  BackgroundEnrichMapsBusinessesResponse,
  BackgroundGetBulkTaskPageRequest,
  BackgroundGetBulkTaskPageResponse,
  BackgroundGetBulkTaskResponse,
  BackgroundGetMapsConfigResponse,
  BackgroundGetMapsUsageResponse,
  BackgroundGetRuntimeConfigResponse,
  BackgroundGetStateResponse,
  BackgroundGetAuthStateResponse,
  BackgroundOpenBulkDashboardRequest,
  BackgroundOpenBulkDashboardResponse,
  BackgroundOpenExtensionLoginResponse,
  BackgroundOpenPricingPageRequest,
  BackgroundOpenPricingPageResponse,
  BackgroundPingResponse,
  BackgroundPhotosWorkPageRequest,
  BackgroundPhotosWorkPageResponse,
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

  /** 从 manifest 版本检查更新及禁用；调用方在 RPC 边界收窄。 */
  checkPluginVersion(): Promise<JsonValue> {
    return declarationOnly('background.checkPluginVersion')
  },

  /** 由 background 代 content script 记录打点。 */
  recordMark(_params: BackgroundRecordMarkRequest): Promise<BackgroundRecordMarkResponse> {
    return declarationOnly('background.recordMark')
  },

  /** 校验当前插件会话并返回展示资料。 */
  getAuthState(): Promise<BackgroundGetAuthStateResponse> {
    return declarationOnly('background.getAuthState')
  },

  /** 退出当前插件会话。 */
  logout(): Promise<void> {
    return declarationOnly('background.logout')
  },

  /**
   * 发起 v3 插件登录（browser identity 全流程 owner）：PKCE → 官网确认页 →
   * exchange → 三键条件提交。默认 30 秒 RPC 超时内通常完不成登录，调用方
   * 以 storage 三键变化感知结果，本返回值仅用于复位入口按钮态。
   */
  openExtensionLogin(): Promise<BackgroundOpenExtensionLoginResponse> {
    return declarationOnly('background.openExtensionLogin')
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

  /**
   * 打开订阅落地页（013 U7 遗留接线，W7）：content script 无 chrome.tabs
   * 能力，由 background 代开新标签（chrome.tabs.create）。
   */
  openPricingPage(
    _params: BackgroundOpenPricingPageRequest
  ): Promise<BackgroundOpenPricingPageResponse> {
    return declarationOnly('background.openPricingPage')
  },

  /** 由 background 打开现有批量页，避开宿主到扩展页面的导航限制。 */
  openBulkDashboard(
    _params: BackgroundOpenBulkDashboardRequest
  ): Promise<BackgroundOpenBulkDashboardResponse> {
    return declarationOnly('background.openBulkDashboard')
  },

  /** 打开照片工作标签页，或由该标签页一次领取跨重定向采集意图。 */
  photosWorkPage(
    _params: BackgroundPhotosWorkPageRequest
  ): Promise<BackgroundPhotosWorkPageResponse> {
    return declarationOnly('background.photosWorkPage')
  },

  /** 按类型读取当前页任务摘要与全局运行提示。 */
  getBulkTaskPage(
    _params: BackgroundGetBulkTaskPageRequest
  ): Promise<BackgroundGetBulkTaskPageResponse> {
    return declarationOnly('background.getBulkTaskPage')
  },

  /** 按任务 id 读取完整条目。 */
  getBulkTask(_params: BackgroundBulkTaskIdRequest): Promise<BackgroundGetBulkTaskResponse> {
    return declarationOnly('background.getBulkTask')
  },

  /** 中转页登记真实标签页 owner，成功落盘后取得采集许可。 */
  authorizeBulkWorkPage(): Promise<boolean> {
    return declarationOnly('background.authorizeBulkWorkPage')
  },

  /** 中转页请求后台核验其初始身份后关闭当前标签页。 */
  closeBulkWorkPage(): Promise<void> {
    return declarationOnly('background.closeBulkWorkPage')
  },

  /** Google 工作页开始采集前复核当前条目的 owner。 */
  checkBulkWorkPage(_params: { taskId: string; itemIndex: number }): Promise<boolean> {
    return declarationOnly('background.checkBulkWorkPage')
  },

  /** 创建批量任务（关键词/评论 URL 队列）。 */
  createBulkTask(
    _params: BackgroundCreateBulkTaskRequest
  ): Promise<BackgroundCreateBulkTaskResponse> {
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
  /** 面板与 Popup 共用远程运营配置。 */
  getMapsConfig: ['content', 'popup'],
  checkPluginVersion: ['content', 'popup'],
  /** recordMark 允许 popup（弹窗/仪表盘/设置页）与 content（面板动作）调用，统一由 background 写 SLS。 */
  recordMark: ['popup', 'content'],
  getAuthState: ['popup'],
  logout: ['popup'],
  /** openExtensionLogin 仅允许 popup 调用（账号区 Sign in 入口）。 */
  openExtensionLogin: ['popup'],
  /** getMapsUsage 允许 content（面板门控）与 popup（账号区）调用。 */
  getMapsUsage: ['content', 'popup'],
  /** enrichMapsBusinesses 仅允许 content 调用（采集行在 content 侧）。 */
  enrichMapsBusinesses: ['content'],
  /** openPricingPage 仅允许 content 调用（面板订阅引导按钮）。 */
  openPricingPage: ['content'],
  openBulkDashboard: ['content'],
  photosWorkPage: ['content'],
  /** 批量状态/命令允许扩展页调用（dashboard 页按 sender 推导为 popup 通道）。 */
  getBulkTaskPage: ['popup'],
  getBulkTask: ['popup'],
  authorizeBulkWorkPage: ['popup'],
  closeBulkWorkPage: ['popup'],
  checkBulkWorkPage: ['content'],
  createBulkTask: ['popup'],
  startBulkTask: ['popup'],
  stopBulkTask: ['popup'],
  deleteBulkTask: ['popup']
} as const satisfies Record<keyof BackgroundHandler, readonly ('content' | 'popup')[]>

/** 补全 RPC 为 HTTP 响应往返及短暂重试预留余量，单位毫秒。 */
export const METHOD_TIMEOUTS = {
  enrichMapsBusinesses: 35_000
} as const satisfies Partial<Record<keyof BackgroundHandler, number>>

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
  checkPluginVersion: 1024,
  /** recordMark 携带打点类型和附加信息。 */
  recordMark: 4096,
  getAuthState: 1024,
  logout: 1024,
  /** openExtensionLogin 无入参。 */
  openExtensionLogin: 1024,
  /** getMapsUsage 无入参。 */
  getMapsUsage: 1024,
  /** enrichMapsBusinesses：50 商家（website/name/address 原文）最坏形态上界。 */
  enrichMapsBusinesses: 131072,
  /** openPricingPage：单个完整 URL（浏览器对 URL 长度有 ~2MB 上限，此处取宽松 8KB）。 */
  openPricingPage: 8192,
  openBulkDashboard: 1024,
  photosWorkPage: 1024,
  getBulkTaskPage: 1024,
  getBulkTask: 1024,
  authorizeBulkWorkPage: 1024,
  closeBulkWorkPage: 1024,
  checkBulkWorkPage: 1024,
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
  checkPluginVersion: 4096,
  /** recordMark 返回记录结果。 */
  recordMark: 1024,
  getAuthState: 16384,
  logout: 1024,
  /** openExtensionLogin 返回 {opened} 布尔结果。 */
  openExtensionLogin: 1024,
  /** getMapsUsage 返回 used/total/period/exhausted 快照（快照不可得时为 null）。 */
  getMapsUsage: 4096,
  /** enrichMapsBusinesses：50 商家的 emails/medias 结果（每条上界宽松余量）。 */
  enrichMapsBusinesses: 262144,
  /** openPricingPage 返回是否已创建标签页。 */
  openPricingPage: 1024,
  openBulkDashboard: 1024,
  photosWorkPage: 1024,
  getBulkTaskPage: 8_388_608,
  getBulkTask: 8_388_608,
  authorizeBulkWorkPage: 1024,
  closeBulkWorkPage: 1024,
  checkBulkWorkPage: 1024,
  createBulkTask: 1024,
  startBulkTask: 1024,
  stopBulkTask: 1024,
  deleteBulkTask: 1024
} as const satisfies Record<keyof BackgroundHandler, number>

/** register 占位函数，避免声明被业务代码误调用。 */
function declarationOnly(methodName: string): never {
  throw new Error(`[rpc-register] ${methodName} is declaration only`)
}
