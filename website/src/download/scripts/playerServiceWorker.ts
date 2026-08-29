/**
 * Website Telegram 播放代理 Service Worker 管理。
 *
 * 页面把短期播放 token 写入 Service Worker，video 始终访问同源
 * /_tg-play/{session_id}，由 Service Worker 转发 Range 到后端播放流。
 */

/** Service Worker 文件路径。 */
const TG_PLAY_SW_URL = '/tg-play-sw.js'

/** Service Worker 控制范围。 */
const TG_PLAY_SW_SCOPE = '/'

/** 写入 token 后 Service Worker 返回的 ACK 类型。 */
export const TG_PLAY_TOKEN_SET_ACK = 'TG_PLAY_TOKEN_SET_ACK'

/** Service Worker 发现缺 token 时广播的消息类型。 */
export const TG_PLAY_TOKEN_MISS = 'TG_PLAY_TOKEN_MISS'

/** 写入 Service Worker 的播放会话。 */
export interface TgPlayServiceWorkerToken {
  /** 播放会话 ID。 */
  sessionId: string
  /** 当前播放 JWT。 */
  token: string
  /** 后端播放 URL，包含 JWT。 */
  playUrl: string
  /** token 到期时间戳。 */
  tokenExpiresAt: number
  /** 会话到期时间戳。 */
  sessionExpiresAt: number
}

interface TgPlayTokenAckMessage {
  type: typeof TG_PLAY_TOKEN_SET_ACK
  sessionId: string
}

function isTokenAckMessage(value: MessageEvent['data']): value is TgPlayTokenAckMessage {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value as TgPlayTokenAckMessage).type === TG_PLAY_TOKEN_SET_ACK &&
    typeof (value as TgPlayTokenAckMessage).sessionId === 'string'
  )
}

async function waitForActiveRegistration(
  registration: ServiceWorkerRegistration
): Promise<ServiceWorker> {
  const worker = registration.active || registration.waiting || registration.installing
  if (!worker) {
    throw new Error('Telegram player Service Worker registration has no worker.')
  }

  if (worker.state === 'activated') {
    return worker
  }

  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('Telegram player Service Worker activation timed out.'))
    }, 8_000)

    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        window.clearTimeout(timer)
        resolve()
      }
    })
  })

  return worker
}

async function waitForController(): Promise<boolean> {
  if (navigator.serviceWorker.controller) {
    return true
  }

  return new Promise<boolean>(resolve => {
    const timer = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener('controllerchange', listener)
      resolve(false)
    }, 3_000)

    const listener = (): void => {
      window.clearTimeout(timer)
      navigator.serviceWorker.removeEventListener('controllerchange', listener)
      resolve(true)
    }

    navigator.serviceWorker.addEventListener('controllerchange', listener)
  })
}

/** 注册播放代理 Service Worker。 */
export async function ensureTgPlayServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  const registration = await navigator.serviceWorker.register(TG_PLAY_SW_URL, {
    scope: TG_PLAY_SW_SCOPE
  })
  await waitForActiveRegistration(registration)

  if (!(await waitForController())) {
    return null
  }

  return registration
}

/** 把当前播放 token 写入 Service Worker，并等待 ACK。 */
export async function setTgPlayServiceWorkerToken(
  token: TgPlayServiceWorkerToken
): Promise<boolean> {
  const registration = await ensureTgPlayServiceWorker()
  if (!registration) {
    return false
  }

  const target = registration.active || navigator.serviceWorker.controller
  if (!target) {
    return false
  }

  const channel = new MessageChannel()
  const ackPromise = new Promise<boolean>(resolve => {
    const timer = window.setTimeout(() => {
      channel.port1.close()
      resolve(false)
    }, 5_000)

    channel.port1.onmessage = event => {
      if (isTokenAckMessage(event.data) && event.data.sessionId === token.sessionId) {
        window.clearTimeout(timer)
        channel.port1.close()
        resolve(true)
      }
    }
  })

  target.postMessage(
    {
      type: 'TG_PLAY_TOKEN_SET',
      sessionId: token.sessionId,
      token: token.token,
      playUrl: token.playUrl,
      tokenExpiresAt: token.tokenExpiresAt,
      sessionExpiresAt: token.sessionExpiresAt
    },
    [channel.port2]
  )

  return ackPromise
}

/** 监听 Service Worker 的 token miss 事件。 */
export function subscribeTgPlayTokenMiss(
  callback: (sessionId: string) => void
): () => void {
  const listener = (event: MessageEvent): void => {
    const data = event.data as { type?: string; sessionId?: string } | null
    if (
      data &&
      data.type === TG_PLAY_TOKEN_MISS &&
      typeof data.sessionId === 'string' &&
      data.sessionId.length > 0
    ) {
      callback(data.sessionId)
    }
  }

  navigator.serviceWorker?.addEventListener('message', listener)
  return () => navigator.serviceWorker?.removeEventListener('message', listener)
}
