/**
 * Telegram 播放 token API。
 *
 * 封装播放会话创建、续签和恢复接口，供播放器状态机调用。
 */

import { postJson, type RequestContext } from '../../scripts/homepage/api'
import type { PlayTokenSession } from './types'

/** 后端播放 token 响应中的资源元信息。 */
interface BackendPlayTokenSource {
  /** 资源 ID。 */
  source_id: string
  /** 文件名。 */
  filename: string
  /** 文件大小。 */
  size: number
  /** MIME 类型。 */
  mime_type: string
  /** 视频时长。 */
  duration?: number
  /** 视频宽度。 */
  width?: number
  /** 视频高度。 */
  height?: number
}

/** 后端播放 token 响应。 */
interface PlayTokenResponse {
  /** 当前播放 JWT。 */
  token: string
  /** 后端播放流地址。 */
  play_url: string
  /** Service Worker 代理地址。 */
  proxy_url: string
  /** token 到期时间戳。 */
  token_expires_at: number
  /** 播放会话 ID。 */
  session_id: string
  /** 会话到期时间戳。 */
  session_expires_at: number
  /** 播放资源元信息。 */
  source: BackendPlayTokenSource
}

function normalizePlayTokenResponse(response: PlayTokenResponse): PlayTokenSession {
  return {
    token: response.token,
    playUrl: response.play_url,
    proxyUrl: response.proxy_url,
    tokenExpiresAt: response.token_expires_at,
    sessionId: response.session_id,
    sessionExpiresAt: response.session_expires_at,
    source: {
      sourceId: response.source.source_id,
      filename: response.source.filename,
      size: response.source.size,
      mimeType: response.source.mime_type,
      duration: response.source.duration,
      width: response.source.width,
      height: response.source.height
    }
  }
}

/**
 * 创建 Telegram 视频播放会话。
 *
 * @param link - Telegram 消息链接。
 * @param sourceId - 视频资源 ID。
 * @param clientRequestId - 前端幂等请求 ID。
 * @param context - 请求上下文。
 * @returns 播放会话。
 */
export async function createTelegramPlayToken(
  link: string,
  sourceId: string,
  clientRequestId: string,
  context: RequestContext
): Promise<PlayTokenSession> {
  const response = await postJson<PlayTokenResponse>('/api/client/tg/play-token', context, {
    link,
    source_id: sourceId,
    client_request_id: clientRequestId
  })

  return normalizePlayTokenResponse(response)
}

/**
 * 续签 Telegram 视频播放 token。
 *
 * @param token - 当前播放 JWT。
 * @param context - 请求上下文。
 * @returns 播放会话。
 */
export async function refreshTelegramPlayToken(
  token: string,
  context: RequestContext
): Promise<PlayTokenSession> {
  const response = await postJson<PlayTokenResponse>(
    '/api/client/tg/play-token/refresh',
    context,
    { token }
  )

  return normalizePlayTokenResponse(response)
}

/**
 * 恢复 Telegram 视频播放 token。
 *
 * @param sessionId - 本地 snapshot 中保存的播放会话 ID。
 * @param sessionOwnerSub - snapshot owner sub。
 * @param context - 请求上下文。
 * @returns 播放会话。
 */
export async function resumeTelegramPlayToken(
  sessionId: string,
  sessionOwnerSub: string,
  context: RequestContext
): Promise<PlayTokenSession> {
  const response = await postJson<PlayTokenResponse>(
    '/api/client/tg/play-token/resume',
    context,
    {
      session_id: sessionId,
      session_owner_sub: sessionOwnerSub
    }
  )

  return normalizePlayTokenResponse(response)
}
