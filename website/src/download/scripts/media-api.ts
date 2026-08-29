/**
 * 通用媒体 API 模块。
 *
 * 解析链路为：
 * parse-pre-v2 -> 按节点顺序 parse-v2 -> 记录成功节点 preferredNodeId。
 * 下载链路为：
 * download-pre-v2 -> 按节点顺序 download-v2。
 */

import {
  HomepageApiError,
  getApiBaseUrl,
  postJson,
  reportBackendConnectFailureToSls,
  type BackendConnectFailureReason,
  type JsonObject,
  type JsonValue,
  type RequestContext
} from '../../scripts/homepage/api'
import { assertDownloadMode } from './download-methods'
import type {
  ClientMuxDownloadIntent,
  DirectDownloadIntent,
  MediaCapabilities,
  MediaParseResult,
  MediaParseStatus,
  MediaPlatform,
  MediaPost,
  MediaRequiresClientReason
} from './types'

/** parse-pre-v2 业务接口超时时间；只查节点列表，不应长时间阻塞解析按钮。 */
const MEDIA_PARSE_PRE_V2_TIMEOUT_MS = 10000

/** 单个 parse-v2 节点超时时间；超时后前端按顺序尝试下一个节点。 */
const MEDIA_PARSE_V2_TIMEOUT_MS = 15000

/** download-pre-v2 业务接口超时时间；该接口会签 token 和扣额度。 */
const MEDIA_DOWNLOAD_PRE_V2_TIMEOUT_MS = 10000

/** download-v2 建连或 JSON 响应超时时间；proxy 文件流建立后不再用该超时裁剪。 */
const MEDIA_DOWNLOAD_V2_CONNECT_TIMEOUT_MS = 10000

/** 后端统一成功码，非 10000 都按业务错误处理。 */
const API_SUCCESS_CODE = 10000

/** V2 解析节点临时不可用；parse-v2 收到后可以继续换节点。 */
const CODE_MEDIA_PARSE_NODE_UNAVAILABLE = 24034

/** Pre 控制面没有可用服务节点；前端停止本轮 V2 流程。 */
const CODE_MEDIA_SERVICE_NODE_UNAVAILABLE = 24042

/** 后端返回的资源能力声明。 */
interface BackendCapabilities {
  /** 是否可下载。 */
  download?: boolean
  /** 是否可播放。 */
  play?: boolean
  /** 是否允许进入 Download all 串行队列。 */
  download_queue?: boolean
  /** 是否允许进入 Download all 串行队列，兼容后端 camelCase 序列化。 */
  downloadQueue?: boolean
}

/** 后端资源扩展字段。 */
interface BackendMediaExtra {
  /** Telegram 消息 ID。 */
  message_id?: number | string
  /** 平台缩略图地址。 */
  thumbnail_url?: string
  /** Instagram 相册展示顺序。 */
  position?: number
  /** Instagram 媒体 pk。 */
  media_pk?: string | null
}

/** 后端返回的单个资源。 */
interface BackendMediaSource {
  /** 资源 ID。 */
  source_id: string
  /** 服务端签发的资源 token，前端只透传给 download-pre-v2。 */
  resource_token?: string
  /** 旧 Telegram API 可下载标记。 */
  downloadable?: boolean
  /** 文件名。 */
  filename?: string
  /** 资源类型（photo/video/document 等）。 */
  type?: string
  /** 新版资源类型字段。 */
  kind?: string
  /** MIME 类型。 */
  mime_type?: string
  /** 文件大小（字节），可能为 null。 */
  size?: number | null
  /** 时长（秒）。 */
  duration?: number
  /** 宽度。 */
  width?: number
  /** 高度。 */
  height?: number
  /** 来源消息 ID。 */
  message_id?: number | string
  /** 平台字段。 */
  platform?: string
  /** 下载模式。 */
  download_mode?: string
  /** V2 解析成功节点 ID，旧接口不会返回，前端在节点调用成功后补入。 */
  preferred_node_id?: number
  /** 所属内容 ID。 */
  content_id?: string
  /** 平台扩展字段。 */
  extra?: BackendMediaExtra
  /** 资源能力声明。 */
  capabilities?: BackendCapabilities
}

/** 后端直连下载授权响应。 */
interface BackendDirectDownloadIntentResponse {
  /** 资源 ID。 */
  source_id: string
  /** 平台类型。 */
  platform: 'vimeo' | 'x' | 'instagram' | 'threads' | 'reddit' | 'douyin'
  /** 下载模式。 */
  download_mode: 'direct'
  /** 当前可用的 CDN 直链。 */
  download_url: string
  /** 后端建议文件名。 */
  filename: string
  /** MIME 类型。 */
  mime_type?: string | null
  /** 文件大小。 */
  size?: number | null
  /** 直链过期时间戳。 */
  expires_at?: number | null
}

/** 后端 client_mux 轨道授权响应。 */
interface BackendClientMuxTrackResponse {
  /** 轨道类型。 */
  kind: 'video' | 'audio'
  /** 当前可用的 CDN 轨道直链。 */
  url: string
  /** 轨道 MIME 类型。 */
  mime_type: string
  /** 轨道大小。 */
  size?: number | null
}

/** 后端 client_mux 下载授权响应。 */
interface BackendClientMuxDownloadIntentResponse {
  /** 资源 ID。 */
  source_id: string
  /** 平台类型。 */
  platform: 'reddit'
  /** 下载模式。 */
  download_mode: 'client_mux'
  /** 合成后文件名。 */
  filename: string
  /** 合成后 MIME 类型。 */
  mime_type: string
  /** 合计文件大小。 */
  size?: number | null
  /** 直链过期时间戳。 */
  expires_at?: number | null
  /** 视频轨道。 */
  video_track: BackendClientMuxTrackResponse
  /** 音频轨道。 */
  audio_track: BackendClientMuxTrackResponse
}

/** 后端返回的消息数据。 */
interface BackendMediaMessage {
  /** 消息包含的资源列表。 */
  sources?: BackendMediaSource[]
  /** 消息 ID。 */
  message_id?: number | string
}

/** 后端解析响应。 */
interface BackendMediaParseResponse {
  /** 解析状态。 */
  status?: string
  /** 状态原因。 */
  reason?: string
  /** 规范化后的链接。 */
  canonical_link?: string
  /** 原始输入链接。 */
  original_link?: string
  /** 识别到的平台。 */
  platform?: string
  /** 解析出的消息列表。 */
  messages?: BackendMediaMessage[]
  /** 统一 API 返回的资源列表。 */
  resources?: BackendMediaSource[]
}

/** 后端标准信封。 */
interface BackendApiEnvelope<T> {
  /** 业务状态码，10000 表示成功。 */
  code?: number
  /** 响应数据。 */
  data?: T | JsonObject
  /** 错误消息。 */
  msg?: string
  /** 错误消息。 */
  message?: string
}

/** V2 Pre 返回的节点入口。 */
export interface MediaV2Node {
  /** 业务数据库 service_nodes 主键。 */
  node_id: number
  /** 节点完整 API URL。 */
  url: string
}

/** parse-pre-v2 响应。 */
interface BackendMediaParsePreV2Response {
  /** 有序 parse-v2 节点列表。 */
  nodes: MediaV2Node[]
}

/** download-pre-v2 响应。 */
export interface MediaDownloadPreV2Authorization {
  /** media_download JWT。 */
  token: string
  /** token 过期 Unix 秒。 */
  expiresAt: number
  /** 本次授权扣费后的 Credits 余额。 */
  creditsBalance: number
  /** 本授权的下载模式。 */
  downloadMode: MediaPost['downloadMode']
  /** 有序 download-v2 节点列表。 */
  nodes: MediaV2Node[]
}

/** 后端 download-pre-v2 原始响应。 */
interface BackendMediaDownloadPreV2Response {
  /** media_download JWT。 */
  token: string
  /** token 过期 Unix 秒。 */
  expires_at: number
  /** 本次授权扣费后的 Credits 余额。 */
  credits_balance: number
  /** 本授权的下载模式。 */
  download_mode: string
  /** 有序 download-v2 节点列表。 */
  nodes: MediaV2Node[]
}

/** download-v2 请求体。 */
interface MediaDownloadV2RequestBody extends JsonObject {
  /** media_download JWT，禁止放 query。 */
  token: string
}

function getAcceptLanguage(): string {
  return document.documentElement.lang || navigator.language || 'en-US'
}

function buildMediaV2NodeHeaders(context: RequestContext, extraHeaders: HeadersInit = {}): Headers {
  const headers = new Headers(extraHeaders)
  headers.set('Accept-Language', getAcceptLanguage())
  headers.set('X-Device-Id', context.deviceId)
  headers.set('X-Client-Product', 'web')
  headers.set('Content-Type', 'application/json')
  return headers
}

function resolveMediaApiUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, getApiBaseUrl()).toString()
}

function normalizeApiErrorData<T>(value: T | JsonObject | undefined): JsonObject | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  return value as JsonObject
}

function normalizeTimeoutMs(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : MEDIA_DOWNLOAD_V2_CONNECT_TIMEOUT_MS
}

async function fetchMediaV2Node(
  url: string,
  context: RequestContext,
  body: JsonObject,
  timeoutMs: number,
  errorContext: string,
  extraHeaders: HeadersInit = {}
): Promise<Response> {
  const controller = new AbortController()
  let timedOut = false
  const normalizedTimeoutMs = normalizeTimeoutMs(timeoutMs)
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, normalizedTimeoutMs)

  try {
    return await fetch(resolveMediaApiUrl(url), {
      method: 'POST',
      headers: buildMediaV2NodeHeaders(context, extraHeaders),
      body: JSON.stringify(body),
      signal: controller.signal
    })
  } catch (error) {
    console.error(error)
    const errorName = error instanceof Error ? error.name || 'Error' : 'NonError'
    const errorMessage = error instanceof Error ? error.message : String(error)
    const code: BackendConnectFailureReason = timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR'
    const timeoutText = timedOut ? ` after ${normalizedTimeoutMs}ms` : ''
    reportBackendConnectFailureToSls(
      'POST',
      url,
      context,
      code,
      errorName,
      errorMessage,
      normalizedTimeoutMs
    )
    throw new HomepageApiError(
      `${errorContext}: ${timedOut ? `timed out${timeoutText}` : `network failed: ${errorName}: ${errorMessage}`}`,
      0,
      code,
      {
        failure_reason: `${errorContext}: reason=${code}${timeoutText}, error=${errorName}: ${errorMessage}`
      }
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

async function parseMediaV2Envelope<T>(
  response: Response,
  errorContext: string
): Promise<T> {
  let body: BackendApiEnvelope<T> | null = null

  try {
    body = (await response.json()) as BackendApiEnvelope<T>
  } catch (error) {
    console.error(error)
    throw new HomepageApiError(
      `${errorContext}: response JSON parse failed, status=${response.status}`,
      response.status
    )
  }

  if (!response.ok) {
    throw new HomepageApiError(
      body?.msg || body?.message || `${errorContext}: HTTP ${response.status}`,
      response.status,
      body?.code,
      normalizeApiErrorData(body?.data)
    )
  }

  if (body && typeof body === 'object' && 'code' in body) {
    if (body.code === API_SUCCESS_CODE) {
      return body.data as T
    }

    throw new HomepageApiError(
      body.msg || body.message || `${errorContext}: request failed`,
      response.status,
      body.code,
      normalizeApiErrorData(body.data)
    )
  }

  return body as T
}

function isGatewayStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504
}

function isTemporaryParseNodeError(error: Error): boolean {
  if (!(error instanceof HomepageApiError)) {
    return false
  }

  const code = typeof error.code === 'string' ? Number(error.code) : error.code
  return (
    error.status === 0 ||
    isGatewayStatus(error.status) ||
    code === CODE_MEDIA_PARSE_NODE_UNAVAILABLE
  )
}

function nodeListOrThrow(nodes: MediaV2Node[], context: string): MediaV2Node[] {
  if (nodes.length > 0) {
    return nodes
  }

  throw new HomepageApiError(
    `${context}: node list is empty`,
    200,
    CODE_MEDIA_SERVICE_NODE_UNAVAILABLE,
    {
      failure_reason: `${context}: empty_node_list`
    }
  )
}

async function postMediaV2NodeJson<T>(
  url: string,
  context: RequestContext,
  body: JsonObject,
  timeoutMs: number,
  errorContext: string
): Promise<T> {
  const response = await fetchMediaV2Node(url, context, body, timeoutMs, errorContext)
  return parseMediaV2Envelope<T>(response, errorContext)
}

/**
 * 推断资源类型。
 */
function inferSourceType(source: BackendMediaSource): string {
  const explicitType = source.kind || source.type
  if (explicitType) {
    return explicitType
  }

  const mimeType = source.mime_type?.toLowerCase() || ''
  if (mimeType.startsWith('video/')) {
    return 'video'
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio'
  }
  if (mimeType.startsWith('image/')) {
    return 'image'
  }

  return 'file'
}

/**
 * 规范化后端平台字段为前端枚举。
 *
 * 未知平台降级为 telegram。
 */
function normalizePlatform(raw: string | undefined): MediaPlatform {
  if (raw === 'instagram') {
    return 'instagram'
  }
  if (raw === 'threads') {
    return 'threads'
  }
  if (raw === 'reddit') {
    return 'reddit'
  }
  if (raw === 'douyin') {
    return 'douyin'
  }
  if (raw === 'x') {
    return 'x'
  }
  if (raw === 'vimeo') {
    return 'vimeo'
  }
  if (raw === 'tiktok') {
    return 'tiktok'
  }
  if (raw && raw !== 'telegram') {
    console.warn(`[media-api] normalizePlatform: unknown platform "${raw}", using telegram fallback`)
  }
  return 'telegram'
}

function normalizeRequiresClientReason(
  raw: string | undefined
): MediaRequiresClientReason | undefined {
  if (raw === 'private_channel' || raw === 'restricted_file' || raw === 'flood_wait') {
    return raw
  }

  return undefined
}

/**
 * 规范化资源能力声明。
 *
 * 后端未声明时默认 download=true，play 仅 Telegram 视频默认开启
 * （仅 Telegram 有 /api/client/tg/play-token 后端支持）。
 */
function normalizeCapabilities(
  source: BackendMediaSource,
  resolvedType: string,
  platform: MediaPlatform
): MediaCapabilities {
  const caps = source.capabilities
  const isVideo =
    resolvedType === 'video' ||
    source.mime_type?.toLowerCase().startsWith('video/') === true
  const canPlayByDefault = platform === 'telegram' && isVideo

  return {
    download: caps?.download ?? (source.downloadable !== false),
    play: platform === 'telegram' && (caps?.play === true || (caps?.play !== false && canPlayByDefault)),
    downloadQueue: caps?.download_queue ?? caps?.downloadQueue
  }
}

function normalizeSource(
  source: BackendMediaSource,
  canonicalLink: string,
  fallbackPlatform: MediaPlatform,
  fallbackMessageId?: number | string,
  preferredNodeId?: number
): MediaPost {
  const resourceToken = source.resource_token?.trim()
  if (!resourceToken) {
    throw new Error(
      `[media-api] normalizeSource: parse-v2 resource missing resource_token, sourceId=${source.source_id}`
    )
  }

  const resolvedType = inferSourceType(source)
  const platform = normalizePlatform(source.platform || fallbackPlatform)
  const capabilities = normalizeCapabilities(source, resolvedType, platform)
  const downloadMode = assertDownloadMode(
    source.download_mode ?? 'proxy',
    `[media-api] normalizeSource sourceId=${source.source_id}`
  )
  return {
    sourceId: source.source_id,
    resourceToken,
    filename: source.filename || source.source_id,
    type: resolvedType,
    size: typeof source.size === 'number' && source.size >= 0 ? source.size : null,
    link: canonicalLink,
    mimeType: source.mime_type,
    duration: source.duration,
    width: source.width,
    height: source.height,
    messageId: source.message_id ?? source.extra?.message_id ?? fallbackMessageId,
    platform,
    downloadMode,
    preferredNodeId:
      typeof preferredNodeId === 'number' && Number.isInteger(preferredNodeId) && preferredNodeId > 0
        ? preferredNodeId
        : undefined,
    thumbnailUrl: source.extra?.thumbnail_url || undefined,
    capabilities
  }
}

function normalizeMediaParseResponse(
  response: BackendMediaParseResponse,
  link: string,
  preferredNodeId?: number
): MediaParseResult {
  const canonicalLink = response.canonical_link || response.original_link || link
  const originalLink = response.original_link || link
  const platform = normalizePlatform(response.platform)
  const status: MediaParseStatus =
    response.status === 'requires_client' ? 'requires_client' : 'ok'

  if (status === 'requires_client') {
    return {
      status,
      reason: normalizeRequiresClientReason(response.reason),
      resources: [],
      canonicalLink,
      originalLink,
      platform
    }
  }

  const flatResources = response.resources || []
  const resources: MediaPost[] =
    flatResources.length > 0
      ? flatResources.map(source => normalizeSource(source, canonicalLink, platform, undefined, preferredNodeId))
      : (response.messages || []).flatMap(message =>
          (message.sources || []).map(source =>
            normalizeSource(source, canonicalLink, platform, message.message_id, preferredNodeId)
          )
        )

  return {
    status: 'ok',
    resources,
    canonicalLink,
    originalLink,
    platform
  }
}

async function parseMediaLinkV2(
  link: string,
  context: RequestContext
): Promise<MediaParseResult> {
  const preResponse = await postJson<BackendMediaParsePreV2Response>(
    '/api/client/media/parse-pre-v2',
    context,
    { link },
    { timeoutMs: MEDIA_PARSE_PRE_V2_TIMEOUT_MS }
  )
  const nodes = nodeListOrThrow(preResponse.nodes, '[media-api] parseMediaLinkV2 parse-pre-v2')
  let lastError: Error | null = null

  for (const node of nodes) {
    try {
      const response = await postMediaV2NodeJson<BackendMediaParseResponse>(
        node.url,
        context,
        { link },
        MEDIA_PARSE_V2_TIMEOUT_MS,
        `[media-api] parseMediaLinkV2 parse-v2 node_id=${node.node_id}`
      )
      return normalizeMediaParseResponse(response, link, node.node_id)
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }

      if (!isTemporaryParseNodeError(error)) {
        throw error
      }

      console.error(error)
      lastError = error
    }
  }

  throw lastError ?? new HomepageApiError(
    '[media-api] parseMediaLinkV2: all parse-v2 nodes failed before returning a business result',
    0,
    CODE_MEDIA_PARSE_NODE_UNAVAILABLE
  )
}

/**
 * 解析媒体链接。
 *
 * @param link - 用户输入的链接
 * @param context - 请求上下文
 * @returns 解析结果
 */
export async function parseMediaLink(
  link: string,
  context: RequestContext
): Promise<MediaParseResult> {
  return parseMediaLinkV2(link, context)
}

/**
 * 创建 V2 下载授权。
 *
 * @param resource - parse-v2 返回并经前端规范化后的资源
 * @param context - 请求上下文，download-pre-v2 需要登录 token
 * @returns 下载 token 与有序 download-v2 节点
 */
export async function createMediaDownloadPreV2Authorization(
  resource: MediaPost,
  context: RequestContext
): Promise<MediaDownloadPreV2Authorization> {
  const response = await postJson<BackendMediaDownloadPreV2Response>(
    '/api/client/media/download-pre-v2',
    context,
    {
      resource_token: resource.resourceToken,
      preferred_node_id: resource.preferredNodeId ?? null
    },
    { timeoutMs: MEDIA_DOWNLOAD_PRE_V2_TIMEOUT_MS }
  )

  return {
    token: response.token,
    expiresAt: response.expires_at,
    creditsBalance: response.credits_balance,
    downloadMode: assertDownloadMode(
      response.download_mode,
      `[media-api] createMediaDownloadPreV2Authorization sourceId=${resource.sourceId}`
    ),
    nodes: nodeListOrThrow(
      response.nodes,
      `[media-api] createMediaDownloadPreV2Authorization sourceId=${resource.sourceId}`
    )
  }
}

/**
 * 调用 download-v2 并返回 proxy 文件流 Response。
 *
 * @param nodeUrl - download-pre-v2 返回的节点 URL
 * @param token - media_download JWT，只放 POST body
 * @param context - 请求上下文
 * @returns 文件流 Response
 */
export async function requestMediaDownloadV2Response(
  nodeUrl: string,
  token: string,
  context: RequestContext,
  extraHeaders: Record<string, string> = {}
): Promise<Response> {
  const body: MediaDownloadV2RequestBody = { token }
  const response = await fetchMediaV2Node(
    nodeUrl,
    context,
    body,
    MEDIA_DOWNLOAD_V2_CONNECT_TIMEOUT_MS,
    '[media-api] requestMediaDownloadV2Response download-v2',
    extraHeaders
  )
  const contentType = response.headers.get('content-type') || ''
  if (response.ok && !contentType.includes('application/json')) {
    return response
  }

  await parseMediaV2Envelope<JsonValue>(
    response,
    '[media-api] requestMediaDownloadV2Response download-v2'
  )
  throw new HomepageApiError(
    '[media-api] requestMediaDownloadV2Response: download-v2 returned JSON success for proxy stream',
    response.status
  )
}

/**
 * 构建浏览器原生下载 GET URL。
 *
 * URL 含 media_download JWT，只能由 no-referrer 导航下载能力使用。
 */
export function buildMediaDownloadV2BrowserUrl(nodeUrl: string, token: string): string {
  const url = new URL(resolveMediaApiUrl(nodeUrl))
  url.searchParams.set('token', token)
  return url.toString()
}

/**
 * 调用 download-v2 并读取 direct JSON。
 */
export async function requestMediaDownloadV2DirectIntent(
  nodeUrl: string,
  token: string,
  context: RequestContext
): Promise<DirectDownloadIntent> {
  const response = await postMediaV2NodeJson<BackendDirectDownloadIntentResponse>(
    nodeUrl,
    context,
    { token },
    MEDIA_DOWNLOAD_V2_CONNECT_TIMEOUT_MS,
    '[media-api] requestMediaDownloadV2DirectIntent download-v2'
  )

  return {
    sourceId: response.source_id,
    platform: response.platform,
    downloadMode: response.download_mode,
    downloadUrl: response.download_url,
    filename: response.filename,
    mimeType: response.mime_type || undefined,
    size: typeof response.size === 'number' ? response.size : null,
    expiresAt: typeof response.expires_at === 'number' ? response.expires_at : null
  }
}

/**
 * 调用 download-v2 并读取 client_mux tracks JSON。
 */
export async function requestMediaDownloadV2ClientMuxIntent(
  nodeUrl: string,
  token: string,
  context: RequestContext
): Promise<ClientMuxDownloadIntent> {
  const response = await postMediaV2NodeJson<BackendClientMuxDownloadIntentResponse>(
    nodeUrl,
    context,
    { token },
    MEDIA_DOWNLOAD_V2_CONNECT_TIMEOUT_MS,
    '[media-api] requestMediaDownloadV2ClientMuxIntent download-v2'
  )

  return {
    sourceId: response.source_id,
    platform: response.platform,
    downloadMode: response.download_mode,
    filename: response.filename,
    mimeType: response.mime_type,
    size: typeof response.size === 'number' ? response.size : null,
    expiresAt: typeof response.expires_at === 'number' ? response.expires_at : null,
    videoTrack: {
      kind: response.video_track.kind,
      url: response.video_track.url,
      mimeType: response.video_track.mime_type,
      size: typeof response.video_track.size === 'number' ? response.video_track.size : null
    },
    audioTrack: {
      kind: response.audio_track.kind,
      url: response.audio_track.url,
      mimeType: response.audio_track.mime_type,
      size: typeof response.audio_track.size === 'number' ? response.audio_track.size : null
    }
  }
}
