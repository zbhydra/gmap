/**
 * V2 下载授权与节点执行编排。
 *
 * 流程：
 * 1. 使用 resource_token 调用 download-pre-v2。
 * 2. 按 download-pre-v2 返回顺序调用 download-v2。
 * 3. 只对网络、超时、网关和节点临时不可用换节点。
 * 4. token 失效时抛出重授权错误，由具体下载方法决定是否重新授权。
 */

import { HomepageApiError, type RequestContext } from '../../scripts/homepage/api'
import {
  createMediaDownloadPreV2Authorization,
  requestMediaDownloadV2ClientMuxIntent,
  requestMediaDownloadV2DirectIntent,
  requestMediaDownloadV2Response,
  type MediaDownloadPreV2Authorization,
  type MediaV2Node
} from './media-api'
import type {
  ClientMuxDownloadIntent,
  DirectDownloadIntent,
  DownloadMode,
  MediaPost
} from './types'

/** 打开 proxy 文件流实际需要的授权字段；恢复下载记录不会携带余额。 */
export interface ProxyDownloadV2Authorization {
  /** media_download JWT。 */
  token: string
  /** 本授权的下载模式。 */
  downloadMode: 'proxy'
  /** 有序 download-v2 节点列表。 */
  nodes: MediaV2Node[]
}

/** download-v2 节点临时不可用错误码；收到后继续尝试下一个节点。 */
const CODE_MEDIA_DOWNLOAD_NODE_UNAVAILABLE = 24039

/** download-v2 节点重新解析到的媒体资源暂不可达。 */
const CODE_MEDIA_DOWNLOAD_RESOURCE_UNREACHABLE = 24037

/** download-v2 token 无效错误码；收到后必须重新走 download-pre-v2 授权。 */
const CODE_MEDIA_DOWNLOAD_TOKEN_INVALID = 24035

/** download-v2 token 过期错误码；收到后必须重新走 download-pre-v2 授权。 */
const CODE_MEDIA_DOWNLOAD_TOKEN_EXPIRED = 24036

/** download-pre-v2 短锁或扣额度暂不可用；前端不本地重试。 */
const CODE_MEDIA_DOWNLOAD_PRE_UNAVAILABLE = 24048

/** 允许自动重试 download-pre-v2 的次数。 */
const DOWNLOAD_PRE_V2_RETRY_COUNT = 1

/** 所有节点临时失败后刷新一次节点列表，仍失败才把错误交给 UI。 */
const DOWNLOAD_V2_NODE_LIST_REFRESH_COUNT = 1

/** V2 授权后可执行的下载 session。 */
export interface MediaDownloadV2Session {
  /** 本次授权的 download_mode。 */
  downloadMode: DownloadMode
  /** 当前授权快照；proxy 恢复记录用它保存 token 和节点。 */
  getAuthorization(): MediaDownloadPreV2Authorization
  /** 当前授权返回的最新 Credits 余额。 */
  getLatestCreditsBalance(): number
  /** 最近一次成功命中的 download-v2 节点 ID。 */
  getLastUsedNodeId(): number | null
  /** proxy 模式：打开 download-v2 文件流。 */
  openProxyResponse(): Promise<Response>
  /** proxy 模式：打开下一个 download-v2 文件流，可传 Range 续传起点。 */
  openNextProxyResponse(rangeStart: number | null): Promise<Response>
  /** proxy 模式：打开指定 download-v2 节点的文件流，可传 Range 续传起点。 */
  openProxyNodeResponse(node: MediaV2Node, rangeStart: number | null): Promise<Response>
  /** direct 模式：获取平台 CDN 直链材料。 */
  prepareDirectIntent(): Promise<DirectDownloadIntent>
  /** client_mux 模式：获取视频和音频 tracks。 */
  prepareClientMuxIntent(): Promise<ClientMuxDownloadIntent>
}

/** token 失效，需要重新创建授权动作。 */
export class MediaDownloadV2ReauthorizationRequiredError extends Error {
  /** 后端业务错误码。 */
  readonly code: number | null

  constructor(message: string, code: number | null) {
    super(`[media-download-v2] ReauthorizationRequired: ${message}, code=${code ?? 'none'}`)
    this.name = 'MediaDownloadV2ReauthorizationRequiredError'
    this.code = code
  }
}

function numericApiCode(error: Error): number | null {
  if (!(error instanceof HomepageApiError)) {
    return null
  }

  const code = typeof error.code === 'string' ? Number(error.code) : error.code
  return typeof code === 'number' && Number.isFinite(code) ? code : null
}

function isGatewayStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504
}

function isServerStatus(status: number): boolean {
  return status >= 500 && status <= 599
}

function isTemporaryDownloadNodeError(error: Error): boolean {
  if (!(error instanceof HomepageApiError)) {
    return false
  }

  const code = numericApiCode(error)
  return (
    error.status === 0 ||
    isGatewayStatus(error.status) ||
    code === CODE_MEDIA_DOWNLOAD_NODE_UNAVAILABLE ||
    code === CODE_MEDIA_DOWNLOAD_RESOURCE_UNREACHABLE
  )
}

export function isTemporaryProxyDownloadNodeError(error: Error): boolean {
  return isTemporaryDownloadNodeError(error)
}

function isDownloadTokenInvalidOrExpired(error: Error): boolean {
  const code = numericApiCode(error)
  return code === CODE_MEDIA_DOWNLOAD_TOKEN_INVALID || code === CODE_MEDIA_DOWNLOAD_TOKEN_EXPIRED
}

function assertAuthorizationMode(
  authorization: MediaDownloadPreV2Authorization,
  resource: MediaPost
): void {
  if (authorization.downloadMode === resource.downloadMode) {
    return
  }

  throw new Error(
    `[media-download-v2] assertAuthorizationMode: download-pre-v2 mode mismatch, sourceId=${resource.sourceId}, expected=${resource.downloadMode}, actual=${authorization.downloadMode}`
  )
}

async function authorizeDownloadV2(
  resource: MediaPost,
  context: RequestContext
): Promise<MediaDownloadPreV2Authorization> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= DOWNLOAD_PRE_V2_RETRY_COUNT; attempt += 1) {
    try {
      const authorization = await createMediaDownloadPreV2Authorization(
        resource,
        context
      )
      assertAuthorizationMode(authorization, resource)
      return authorization
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }

      if (numericApiCode(error) === CODE_MEDIA_DOWNLOAD_PRE_UNAVAILABLE) {
        throw error
      }

      lastError = error
      if (
        attempt >= DOWNLOAD_PRE_V2_RETRY_COUNT ||
        !(error instanceof HomepageApiError) ||
        (error.status !== 0 && !isServerStatus(error.status))
      ) {
        throw error
      }

      console.error(error)
    }
  }

  throw lastError ?? new Error('[media-download-v2] authorizeDownloadV2: download-pre-v2 did not run')
}

async function requestThroughDownloadNodes<T>(
  resource: MediaPost,
  getAuthorization: () => MediaDownloadPreV2Authorization,
  refreshAuthorization: () => Promise<MediaDownloadPreV2Authorization>,
  requestNode: (node: MediaV2Node, authorization: MediaDownloadPreV2Authorization) => Promise<T>
): Promise<T> {
  let lastError: Error | null = null

  for (let refreshAttempt = 0; refreshAttempt <= DOWNLOAD_V2_NODE_LIST_REFRESH_COUNT; refreshAttempt += 1) {
    const authorization = refreshAttempt === 0 ? getAuthorization() : await refreshAuthorization()

    for (const node of authorization.nodes) {
      try {
        return await requestNode(node, authorization)
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error
        }

        if (isDownloadTokenInvalidOrExpired(error)) {
          throw new MediaDownloadV2ReauthorizationRequiredError(
            `download-v2 token rejected, sourceId=${resource.sourceId}, node_id=${node.node_id}`,
            numericApiCode(error)
          )
        }

        if (!isTemporaryDownloadNodeError(error)) {
          throw error
        }

        console.error(error)
        lastError = error
      }
    }
  }

  throw lastError ?? new Error(
    `[media-download-v2] requestThroughDownloadNodes: empty download-v2 node list, sourceId=${resource.sourceId}`
  )
}

function annotateDownloadNode(response: Response, node: MediaV2Node): Response {
  if (response.status === 200 || response.status === 206) {
    ;(response as Response & { tgDownloadNodeId?: number }).tgDownloadNodeId = node.node_id
  }
  return response
}

async function openProxyDownloadV2NodeResponse(
  resource: MediaPost,
  context: RequestContext,
  token: string,
  node: MediaV2Node,
  rangeStart: number | null
): Promise<Response> {
  try {
    const response = await requestMediaDownloadV2Response(
      node.url,
      token,
      context,
      rangeStart === null ? {} : { Range: `bytes=${rangeStart}-` }
    )
    return annotateDownloadNode(response, node)
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }

    if (isDownloadTokenInvalidOrExpired(error)) {
      throw new MediaDownloadV2ReauthorizationRequiredError(
        `download-v2 token rejected, sourceId=${resource.sourceId}, node_id=${node.node_id}`,
        numericApiCode(error)
      )
    }

    throw error
  }
}

/**
 * 使用已有授权打开 proxy download-v2 流。
 *
 * Continue 恢复只复用恢复记录里的 token 和节点；这里不会重新请求 download-pre-v2。
 */
export async function openAuthorizedProxyDownloadV2Response(
  resource: MediaPost,
  context: RequestContext,
  authorization: ProxyDownloadV2Authorization,
  rangeStart: number | null
): Promise<Response> {
  let lastError: Error | null = null

  if (authorization.downloadMode !== 'proxy') {
    throw new Error(
      `[media-download-v2] openAuthorizedProxyDownloadV2Response: authorization mode mismatch, sourceId=${resource.sourceId}, actual=${authorization.downloadMode}`
    )
  }

  for (const node of authorization.nodes) {
    try {
      return await openProxyDownloadV2NodeResponse(
        resource,
        context,
        authorization.token,
        node,
        rangeStart
      )
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }

      if (!isTemporaryDownloadNodeError(error)) {
        throw error
      }

      console.error(error)
      lastError = error
    }
  }

  throw lastError ?? new Error(
    `[media-download-v2] openAuthorizedProxyDownloadV2Response: empty stored node list, sourceId=${resource.sourceId}`
  )
}

export async function openAuthorizedProxyDownloadV2NodeResponse(
  resource: MediaPost,
  context: RequestContext,
  authorization: ProxyDownloadV2Authorization,
  node: MediaV2Node,
  rangeStart: number | null
): Promise<Response> {
  if (authorization.downloadMode !== 'proxy') {
    throw new Error(
      `[media-download-v2] openAuthorizedProxyDownloadV2NodeResponse: authorization mode mismatch, sourceId=${resource.sourceId}, actual=${authorization.downloadMode}`
    )
  }

  return openProxyDownloadV2NodeResponse(
    resource,
    context,
    authorization.token,
    node,
    rangeStart
  )
}

/**
 * 创建 V2 下载 session。
 *
 * @param resource - parse-v2 返回的当前资源
 * @param context - 请求上下文
 */
export async function createMediaDownloadV2Session(
  resource: MediaPost,
  context: RequestContext
): Promise<MediaDownloadV2Session> {
  let authorization = await authorizeDownloadV2(resource, context)
  let proxyNodeCursor = 0
  let lastUsedNodeId: number | null = null
  const getAuthorization = (): MediaDownloadPreV2Authorization => authorization
  const refreshAuthorization = async (): Promise<MediaDownloadPreV2Authorization> => {
    authorization = await authorizeDownloadV2(resource, context)
    proxyNodeCursor = 0
    return authorization
  }
  const openNextProxyResponse = async (rangeStart: number | null): Promise<Response> => {
    let lastError: Error | null = null

    for (let refreshAttempt = 0; refreshAttempt <= DOWNLOAD_V2_NODE_LIST_REFRESH_COUNT; refreshAttempt += 1) {
      const activeAuthorization = refreshAttempt === 0 ? authorization : await refreshAuthorization()

      for (let nodeIndex = proxyNodeCursor; nodeIndex < activeAuthorization.nodes.length; nodeIndex += 1) {
        const node = activeAuthorization.nodes[nodeIndex]
        proxyNodeCursor = nodeIndex + 1
        try {
          const response = await openProxyDownloadV2NodeResponse(
            resource,
            context,
            activeAuthorization.token,
            node,
            rangeStart
          )
          lastUsedNodeId = node.node_id
          return response
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error
          }

          if (isDownloadTokenInvalidOrExpired(error)) {
            throw new MediaDownloadV2ReauthorizationRequiredError(
              `download-v2 token rejected, sourceId=${resource.sourceId}, node_id=${node.node_id}`,
              numericApiCode(error)
            )
          }

          if (!isTemporaryDownloadNodeError(error)) {
            throw error
          }

          console.error(error)
          lastError = error
        }
      }
    }

    throw lastError ?? new Error(
      `[media-download-v2] openNextProxyResponse: empty download-v2 node list, sourceId=${resource.sourceId}`
    )
  }

  return {
    downloadMode: authorization.downloadMode,
    getAuthorization: () => authorization,
    getLatestCreditsBalance: () => authorization.creditsBalance,
    getLastUsedNodeId: () => lastUsedNodeId,
    openNextProxyResponse,
    openProxyNodeResponse: async (node, rangeStart) => {
      const response = await openProxyDownloadV2NodeResponse(
        resource,
        context,
        authorization.token,
        node,
        rangeStart
      )
      lastUsedNodeId = node.node_id
      return response
    },
    openProxyResponse: () => openNextProxyResponse(null),
    prepareDirectIntent: () =>
      requestThroughDownloadNodes(
        resource,
        getAuthorization,
        refreshAuthorization,
        async (node, activeAuthorization) => {
          const intent = await requestMediaDownloadV2DirectIntent(
            node.url,
            activeAuthorization.token,
            context
          )
          lastUsedNodeId = node.node_id
          return intent
        }
      ),
    prepareClientMuxIntent: () =>
      requestThroughDownloadNodes(
        resource,
        getAuthorization,
        refreshAuthorization,
        async (node, activeAuthorization) => {
          const intent = await requestMediaDownloadV2ClientMuxIntent(
            node.url,
            activeAuthorization.token,
            context
          )
          lastUsedNodeId = node.node_id
          return intent
        }
      )
  }
}
