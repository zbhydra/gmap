/**
 * RPC v2 provider 注册入口。
 *
 * serve 负责统一监听 Chrome message 请求，并按 caller、payload 限制执行校验。
 */

import {
  DEFAULT_RPC_REQUEST_LIMIT,
  DEFAULT_RPC_RESPONSE_LIMIT,
  RPC_PROTOCOL_VERSION
} from './constants'
import {
  RpcDuplicateChannelError,
  RpcError,
  RpcInvalidRequestError,
  RpcMethodNotFoundError,
  RpcPayloadTooLargeError,
  RpcSerializationError,
  RpcServerError,
  RpcUnauthorizedError
} from './errors'
import type {
  JsonObject,
  JsonValue,
  RpcCaller,
  RpcChannel,
  RpcContext,
  RpcRequest,
  RpcResponse,
  RpcServeHandlers,
  RpcServeRegistration,
  RpcServeResult,
  ServeOptions
} from './types'

/** 已启动的 provider channel。 */
const activeChannels = new Set<RpcChannel>()

/** 注册 RPC provider。 */
export function serve(
  channel: RpcChannel,
  handlers: RpcServeHandlers,
  options: ServeOptions
): RpcServeRegistration {
  if (activeChannels.has(channel)) {
    throw new RpcDuplicateChannelError(channel)
  }

  activeChannels.add(channel)

  const cleanup = registerChromeServer(channel, handlers, options)

  return {
    channel,
    stop() {
      cleanup()
      activeChannels.delete(channel)
    }
  }
}

/** 注册 Chrome message server。 */
function registerChromeServer(
  channel: RpcChannel,
  handlers: RpcServeHandlers,
  options: ServeOptions
): () => void {
  const listener = (
    message: JsonValue | undefined,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: RpcResponse<RpcServeResult>) => void
  ): boolean => {
    const request = parseRequest(channel, message)
    if (!request) {
      return false
    }

    const context = inferChromeContext(channel, sender)

    handleRpcRequest(channel, handlers, options, request, context)
      .then(sendResponse)
      .catch(error => {
        console.error(error)
        sendResponse(toFailureResponse(request.id, error instanceof Error ? error : String(error)))
      })

    return true
  }

  chrome.runtime.onMessage.addListener(listener)

  return () => {
    chrome.runtime.onMessage.removeListener(listener)
  }
}

/** 执行 RPC 请求并返回响应。 */
async function handleRpcRequest(
  channel: RpcChannel,
  handlers: RpcServeHandlers,
  options: ServeOptions,
  request: RpcRequest<JsonValue>,
  context: RpcContext
): Promise<RpcResponse<RpcServeResult>> {
  try {
    validateRequest(channel, request)

    if (!Object.prototype.hasOwnProperty.call(handlers, request.method)) {
      throw new RpcMethodNotFoundError(`[rpc] method not found: ${channel}.${request.method}`)
    }

    validateMethodAccess(request.method, context, options)
    ensurePayloadSize(request.params ?? null, getRequestLimit(request.method, options))

    const handler = handlers[request.method]
    const result = await handler(request.params, context)
    ensureSerializable(result)
    ensurePayloadSize(result ?? null, getResponseLimit(request.method, options))

    const response: RpcResponse<RpcServeResult> = {
      id: request.id,
      success: true
    }

    if (result !== undefined) {
      response.data = result
    }

    return response
  } catch (error) {
    console.error(error)
    return toFailureResponse(request.id, error instanceof Error ? error : String(error))
  }
}

/** 校验请求基础字段。 */
function validateRequest(channel: RpcChannel, request: RpcRequest<JsonValue>): void {
  if (request.protocolVersion !== RPC_PROTOCOL_VERSION) {
    throw new RpcInvalidRequestError(
      `[rpc] invalid protocol version for ${channel}.${request.method}: ${request.protocolVersion}`
    )
  }

  if (request.channel !== channel) {
    throw new RpcInvalidRequestError(
      `[rpc] invalid channel for ${channel}.${request.method}: ${request.channel}`
    )
  }

  if (typeof request.id !== 'string' || request.id.length === 0) {
    throw new RpcInvalidRequestError(`[rpc] missing request id for ${channel}.${request.method}`)
  }

  if (typeof request.method !== 'string' || request.method.length === 0) {
    throw new RpcInvalidRequestError(`[rpc] missing method for channel: ${channel}`)
  }
}

/** 校验方法调用方权限。 */
function validateMethodAccess(method: string, context: RpcContext, options: ServeOptions): void {
  const allowedTargets = options.methodTargets[method]
  if (!allowedTargets?.includes(context.caller)) {
    throw new RpcUnauthorizedError(
      `[rpc] caller ${context.caller} cannot call method: ${method}, allowed=${allowedTargets?.join(',') ?? 'none'}`
    )
  }
}

/** 推导 Chrome 调用方上下文。 */
function inferChromeContext(channel: RpcChannel, sender: chrome.runtime.MessageSender): RpcContext {
  return {
    caller: inferChromeCaller(channel, sender),
    tabId: sender.tab?.id,
    frameId: sender.frameId,
    origin: sender.origin ?? sender.url,
    senderUrl: sender.url
  }
}

/** 根据 sender 推导 Chrome 调用方。 */
function inferChromeCaller(channel: RpcChannel, sender: chrome.runtime.MessageSender): RpcCaller {
  const senderUrl = sender.url ?? sender.origin ?? ''
  const extensionPrefix = chrome.runtime.id ? `chrome-extension://${chrome.runtime.id}/` : ''
  const fromExtensionPage = extensionPrefix.length > 0 && senderUrl.startsWith(extensionPrefix)

  if (fromExtensionPage) {
    return 'popup'
  }

  if (channel === 'background' && sender.tab?.id !== undefined) {
    return 'content'
  }

  if (channel === 'content' && sender.id === chrome.runtime.id) {
    return 'background'
  }

  return 'content'
}

/** 解析 Chrome message 请求。 */
function parseRequest(
  channel: RpcChannel,
  message: JsonValue | undefined
): RpcRequest<JsonValue> | null {
  if (!isJsonObject(message)) {
    return null
  }

  const id = message.id
  const method = message.method

  if (
    message.protocolVersion !== RPC_PROTOCOL_VERSION ||
    message.channel !== channel ||
    typeof id !== 'string' ||
    id.length === 0 ||
    typeof method !== 'string' ||
    method.length === 0
  ) {
    return null
  }

  return {
    protocolVersion: RPC_PROTOCOL_VERSION,
    id,
    channel,
    method,
    params: message.params
  }
}

/** 判断值是否为 JSON 对象。 */
function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 获取请求体限制。 */
function getRequestLimit(method: string, options: ServeOptions): number {
  return options.requestLimits[method] ?? DEFAULT_RPC_REQUEST_LIMIT
}

/** 获取响应体限制。 */
function getResponseLimit(method: string, options: ServeOptions): number {
  return options.responseLimits[method] ?? DEFAULT_RPC_RESPONSE_LIMIT
}

/** 检查 payload 序列化大小。 */
function ensurePayloadSize(value: JsonValue | RpcServeResult, limit: number): void {
  const size = measureJsonBytes(value)
  if (size > limit) {
    throw new RpcPayloadTooLargeError(`[rpc] payload size ${size} exceeds limit ${limit}`)
  }
}

/** 检查返回值可被 JSON 序列化。 */
function ensureSerializable(value: RpcServeResult): void {
  if (value === undefined) {
    return
  }

  const text = JSON.stringify(value)
  if (typeof text !== 'string') {
    throw new RpcSerializationError('[rpc] response serialization returned empty JSON text')
  }
}

/** 计算 JSON 序列化后的 UTF-8 字节数。 */
function measureJsonBytes(value: JsonValue | RpcServeResult): number {
  const text = JSON.stringify(value)
  if (typeof text !== 'string') {
    return 0
  }
  return new TextEncoder().encode(text).length
}

/** 转换失败响应。 */
function toFailureResponse(
  id: string,
  error: Error | string | number | boolean | null
): RpcResponse<RpcServeResult> {
  if (error instanceof RpcError) {
    return error.toResponse(id) as RpcResponse<RpcServeResult>
  }

  if (error instanceof Error) {
    return new RpcServerError(error.message).toResponse(id) as RpcResponse<RpcServeResult>
  }

  return new RpcServerError(String(error)).toResponse(id) as RpcResponse<RpcServeResult>
}
