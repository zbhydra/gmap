/**
 * RPC 系统统一导出
 */

// RPC v2 类型定义
export type {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  RpcCallOptions,
  RpcCaller,
  RpcChannel,
  RpcContext,
  RpcErrorCode,
  RpcMethodParams,
  RpcMethodResult,
  RpcServeHandler,
  RpcServeHandlers,
  RpcServeRegistration,
  RpcServeResult,
  RpcTransport,
  ServeOptions
} from './types'
export {
  DEFAULT_RPC_REQUEST_LIMIT,
  DEFAULT_RPC_RESPONSE_LIMIT,
  DEFAULT_RPC_TIMEOUT,
  RPC_PROTOCOL_VERSION
} from './constants'
export {
  RpcDuplicateChannelError,
  RpcError,
  RpcInvalidRequestError,
  RpcMethodNotFoundError,
  RpcPayloadTooLargeError,
  RpcSerializationError,
  RpcServerError,
  RpcTargetNotFoundError,
  RpcTimeoutError,
  RpcTransportDestroyedError,
  RpcTransportError,
  RpcUnauthorizedError,
  createRpcErrorFromResponse
} from './errors'
export { serve } from './serve'
export { ChromeRpcTransport } from './transports/ChromeRpcTransport'

// Chrome 扩展事件
export { ChromeEventEmitter, ChromeEventSubscriber } from './ChromeEventBus'

// DOM CustomEvent 事件
export { DomEventEmitter, DomEventSubscriber } from './DomEventBus'
