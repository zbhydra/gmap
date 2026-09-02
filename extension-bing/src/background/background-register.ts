/**
 * Background RPC v2 register。
 *
 * register 声明 background 能力边界，登录入口（popup / 面板）经
 * openExtensionLogin 统一发起 v3 browser identity 登录。
 */

import type {
  BackgroundEnrichBusinessesRequest,
  BackgroundEnrichBusinessesResponse,
  BackgroundGetBingConfigResponse,
  BackgroundGetGateStateResponse,
  BackgroundGetRuntimeConfigResponse,
  BackgroundGetStateResponse,
  BackgroundOpenExtensionLoginResponse,
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

  /** 由 background 代 content script 拉取 Bing 远程配置。 */
  getBingConfig(): Promise<BackgroundGetBingConfigResponse> {
    return declarationOnly('background.getBingConfig')
  },

  /** 查询免费/Pro 门控态（账号 + 订阅，016 §5；background 缓存口径）。 */
  getGateState(): Promise<BackgroundGetGateStateResponse> {
    return declarationOnly('background.getGateState')
  },

  /** 发起 v3 browser identity 登录（PKCE + launchWebAuthFlow + exchange，006 §3）。 */
  openExtensionLogin(): Promise<BackgroundOpenExtensionLoginResponse> {
    return declarationOnly('background.openExtensionLogin')
  },

  /** 由 background 代 content script 记录打点。 */
  recordMark(_params: BackgroundRecordMarkRequest): Promise<BackgroundRecordMarkResponse> {
    return declarationOnly('background.recordMark')
  },

  /**
   * 代理 Email/社媒补全（016 E6 二期）：content 经 background 调后端
   * enrich 端点（013 A4 自研能力，gmap/bing 两线共享；零 CORS 面）。
   */
  enrichBusinesses(
    _params: BackgroundEnrichBusinessesRequest
  ): Promise<BackgroundEnrichBusinessesResponse> {
    return declarationOnly('background.enrichBusinesses')
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
  /** getBingConfig 允许 content script 调用（Bing Maps 页面 boot 时拉取）。 */
  getBingConfig: ['content'],
  /** getGateState 允许 content script 调用（面板与采集停止策略读取账号/订阅态）。 */
  getGateState: ['content'],
  /** openExtensionLogin 允许 popup / content 调用（两处登录入口，同一 background RPC）。 */
  openExtensionLogin: ['popup', 'content'],
  /** recordMark 允许 popup / content 调用，统一由 background 写 SLS（T1 §4.1）。 */
  recordMark: ['popup', 'content'],
  /** enrichBusinesses 仅允许 content 调用（采集行在 content 侧，E6 二期）。 */
  enrichBusinesses: ['content']
} as const satisfies Record<keyof BackgroundHandler, readonly ('content' | 'popup')[]>

/** background 方法允许传输。 */
export const METHOD_TRANSPORTS = {
  /** ping 使用 Chrome message。 */
  ping: ['chrome'],
  /** getState 使用 Chrome message。 */
  getState: ['chrome'],
  /** getRuntimeConfig 使用 Chrome message。 */
  getRuntimeConfig: ['chrome'],
  /** getBingConfig 使用 Chrome message。 */
  getBingConfig: ['chrome'],
  /** getGateState 使用 Chrome message。 */
  getGateState: ['chrome'],
  /** openExtensionLogin 使用 Chrome message。 */
  openExtensionLogin: ['chrome'],
  /** recordMark 使用 Chrome message。 */
  recordMark: ['chrome'],
  /** enrichBusinesses 使用 Chrome message。 */
  enrichBusinesses: ['chrome']
} as const satisfies Record<keyof BackgroundHandler, readonly ['chrome']>

/** background 方法请求体限制，单位字节。 */
export const METHOD_REQUEST_LIMITS = {
  /** ping 无业务参数。 */
  ping: 1024,
  /** getState 无业务参数。 */
  getState: 1024,
  /** getRuntimeConfig 无业务参数。 */
  getRuntimeConfig: 1024,
  /** getBingConfig 无业务参数。 */
  getBingConfig: 1024,
  /** getGateState 无业务参数。 */
  getGateState: 1024,
  /** openExtensionLogin 无业务参数。 */
  openExtensionLogin: 1024,
  /** recordMark 携带打点类型和附加信息。 */
  recordMark: 4096,
  /** enrichBusinesses：50 商家（website/name/address 原文）最坏形态上界。 */
  enrichBusinesses: 131072
} as const satisfies Record<keyof BackgroundHandler, number>

/** background 方法响应体限制，单位字节。 */
export const METHOD_RESPONSE_LIMITS = {
  /** ping 返回连通状态。 */
  ping: 4096,
  /** getState 返回状态文本。 */
  getState: 16384,
  /** getRuntimeConfig 返回轻量扩展配置。 */
  getRuntimeConfig: 1024,
  /** getBingConfig 返回五组稀疏覆盖，上限对齐远程配置通道的 16KB 约定。 */
  getBingConfig: 16384,
  /** getGateState 返回账号/订阅判定三元组。 */
  getGateState: 1024,
  /** openExtensionLogin 返回是否提交完成。 */
  openExtensionLogin: 1024,
  /** recordMark 返回记录结果。 */
  recordMark: 1024,
  /** enrichBusinesses：50 商家的 emails/medias 结果（每条上界宽松余量）。 */
  enrichBusinesses: 262144
} as const satisfies Record<keyof BackgroundHandler, number>

/** register 占位函数，避免声明被业务代码误调用。 */
function declarationOnly(methodName: string): never {
  throw new Error(`[rpc-register] ${methodName} is declaration only`)
}
