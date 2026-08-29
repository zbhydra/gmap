/**
 * Website Telegram 播放代理 Service Worker。
 *
 * 流程：
 * 1. 页面通过 MessageChannel 写入 session_id 对应的 play_url。
 * 2. video 请求 /_tg-play/{session_id} 时转发到后端 play_url。
 * 3. Range 请求头原样透传，媒体字节不进入 CacheStorage。
 */

const tokenStore = new Map()

function parseSessionId(url) {
  const prefix = '/_tg-play/'
  if (!url.pathname.startsWith(prefix)) {
    return ''
  }

  return decodeURIComponent(url.pathname.slice(prefix.length))
}

function notifyTokenMiss(sessionId) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    for (const client of clients) {
      client.postMessage({
        type: 'TG_PLAY_TOKEN_MISS',
        sessionId
      })
    }
  })
}

function buildMissingTokenResponse() {
  return new Response('', {
    status: 401,
    headers: {
      'Cache-Control': 'no-store',
      'X-Play-Token-Lost': '1'
    }
  })
}

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', event => {
  const data = event.data || {}
  if (data.type !== 'TG_PLAY_TOKEN_SET') {
    return
  }

  const sessionId = String(data.sessionId || '')
  const playUrl = String(data.playUrl || '')
  const token = String(data.token || '')

  if (sessionId && playUrl && token) {
    tokenStore.set(sessionId, {
      token,
      playUrl,
      tokenExpiresAt: Number(data.tokenExpiresAt || 0),
      sessionExpiresAt: Number(data.sessionExpiresAt || 0)
    })
  }

  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({
      type: 'TG_PLAY_TOKEN_SET_ACK',
      sessionId
    })
  }
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  const sessionId = parseSessionId(url)
  if (!sessionId) {
    return
  }

  event.respondWith(
    (async () => {
      const stored = tokenStore.get(sessionId)
      if (!stored) {
        notifyTokenMiss(sessionId)
        return buildMissingTokenResponse()
      }

      const headers = new Headers()
      const range = event.request.headers.get('Range')
      if (range) {
        headers.set('Range', range)
      }

      const request = new Request(stored.playUrl, {
        method: 'GET',
        headers,
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'follow'
      })

      return fetch(request)
    })()
  )
})
