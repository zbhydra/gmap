/**
 * e2e 本地 mock 服务（013 计划 §0，零外网）。
 *
 * 承接三类 SW 流量：远程配置下发（GET /api/client/maps/config）、配额计量
 * （GET/POST /api/client/maps/usage*，013 A11 U7）与打点接收（SLS
 * WebTracking 形态的 GET /logstores/<logstore>/track、后端 mark 通道的
 * POST /api/client/mark/record）。实测口径：Chromium 下 context.route 能拦截
 * MV3 SW 请求（spec 内对 127.0.0.1 显式放行直达本服务），构建期 BASE_URL 注入
 * 是双保险——本服务不依赖 route 拦截即可达。
 *
 * 另提供 GET /__mock/received 供 spec 断言打点内容与配置请求次数，以及
 * POST /__mock/usage 切换配额状态（门控 spec 用：{ exhausted: true }）。
 */

import { createServer } from 'node:http'

/** mock 收到的请求记录（内存态，spec 经 /__mock/received 读取）。 */
const received = {
  /** /api/client/maps/config 请求次数。 */
  configRequests: 0,
  /** SLS WebTracking 打点（query 参数对象）。 */
  slsMarks: [],
  /** 后端 mark 通道请求体。 */
  backendMarks: [],
  /** HubSpot 同步代理请求体（013 A10 auto_save 边沿）。 */
  hubspotSyncs: [],
  /** 配额上报请求体（013 A11 完成边沿）。 */
  usageReports: [],
  /** enrich 补全请求体（013 A4，U8）。 */
  enrichRequests: []
}

/** 配额状态（服务端权威口径的 mock：默认全新额度；spec 可切换耗尽）。 */
const usageState = {
  exhausted: false,
  total: 1000,
  used: 0
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Device-Id,X-Client-Product,Accept-Language,Authorization'
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS })
  res.end(JSON.stringify(payload))
}

function collectQuery(url) {
  const query = {}
  for (const [key, value] of url.searchParams.entries()) {
    query[key] = value
  }
  return query
}

function readJsonBody(req) {
  return new Promise(resolve => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch {
        resolve({ raw: body })
      }
    })
  })
}

function usagePayload() {
  return {
    used: usageState.used,
    total: usageState.total,
    period: '2026-08',
    exhausted: usageState.exhausted || usageState.used >= usageState.total
  }
}

function resetUsageState() {
  usageState.exhausted = false
  usageState.used = 0
}

function createMockServer(port) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`)

    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS)
      res.end()
      return
    }

    // 远程配置：下发加速 e2e 的稀疏覆盖（间隔 1s、动画 200~400ms、上限 100 行；
    // 评论/照片翻页间隔 50ms、上限 15 条/12 张——验收远程覆盖与截断链路）。
    // operations 组常驻下发公告、「远端版本 > 本地」的新版本提示与本地订阅
    // 落地页 pricingUrl（W7），供公告区/门控按钮 spec 断言（零外网：落地页
    // 指向本服务 /pricing/）。
    if (url.pathname === '/api/client/maps/config' && req.method === 'GET') {
      received.configRequests += 1
      sendJson(res, 200, {
        code: 10000,
        msg: 'ok',
        data: {
          scrape: {
            scrollIntervalSec: 1,
            scrollAnimMinMs: 200,
            scrollAnimMaxMs: 400,
            freeExportRowLimit: 100,
            reviewsPageDelayMs: 50,
            reviewsPageLimit: 15,
            photosPageDelayMs: 50,
            photosPageLimit: 12
          },
          operations: {
            announcementHtml:
              '<p class="gme-e2e-announcement">Welcome to MapsGrab! Spring sale is live.</p>',
            announcementVersion: 'e2e-1',
            minPluginVersion: '99.0.0',
            pricingUrl: `http://127.0.0.1:${port}/pricing/`
          }
        }
      })
      return
    }

    // 订阅落地页（W7 门控按钮 spec 的跳转目标；简单静态页，零外网）
    if (url.pathname === '/pricing/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...CORS_HEADERS })
      res.end('<!doctype html><html><body><h1>MapsGrab Pricing (e2e mock)</h1></body></html>')
      return
    }

    // 配额查询（013 A11）：按 usageState 返回 used/total/period/exhausted
    if (url.pathname === '/api/client/maps/usage' && req.method === 'GET') {
      sendJson(res, 200, { code: 10000, msg: 'ok', data: usagePayload() })
      return
    }

    // 配额上报扣减（完成边沿）：记录请求体并累加 used（e2e 不做幂等去重，
    // 幂等语义由单测与 backend real 测试覆盖）
    if (url.pathname === '/api/client/maps/usage/report' && req.method === 'POST') {
      const body = await readJsonBody(req)
      received.usageReports.push(body)
      if (typeof body.records === 'number' && body.records > 0) {
        usageState.used += body.records
      }
      sendJson(res, 200, { code: 10000, msg: 'ok', data: { ...usagePayload(), deducted: true } })
      return
    }

    // spec 控制端点：切换配额耗尽态（门控 spec）或重置
    if (url.pathname === '/__mock/usage' && req.method === 'POST') {
      const body = await readJsonBody(req)
      if (body.reset === true) {
        resetUsageState()
      } else if (typeof body.exhausted === 'boolean') {
        usageState.exhausted = body.exhausted
      }
      sendJson(res, 200, { code: 10000, msg: 'ok', data: usagePayload() })
      return
    }

    // SLS WebTracking 形态打点
    if (url.pathname.startsWith('/logstores/') && url.pathname.endsWith('/track')) {
      received.slsMarks.push(collectQuery(url))
      sendJson(res, 200, { recorded: true })
      return
    }

    // 后端 mark 通道（install 双报）
    if (url.pathname === '/api/client/mark/record' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })
      req.on('end', () => {
        try {
          received.backendMarks.push(JSON.parse(body))
        } catch {
          received.backendMarks.push({ raw: body })
        }
        sendJson(res, 200, { code: 10000, msg: 'ok', data: { recorded: true } })
      })
      return
    }

    // HubSpot 同步代理（013 A10 auto_save 边沿，background SW 直达本地 mock）
    if (url.pathname === '/api/client/maps/hubspot/sync' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })
      req.on('end', () => {
        try {
          received.hubspotSyncs.push(JSON.parse(body))
        } catch {
          received.hubspotSyncs.push({ raw: body })
        }
        sendJson(res, 200, { code: 10000, msg: 'ok', data: { synced: 6 } })
      })
      return
    }

    // Email/社媒补全（013 A4，U8）：按 domain 确定性回填已知数据，供 spec
    // 断言导出行含 Email/Social Medias；请求体记录供批形状断言
    if (url.pathname === '/api/client/maps/enrich' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })
      req.on('end', () => {
        let businesses = []
        try {
          const parsed = JSON.parse(body)
          businesses = Array.isArray(parsed.businesses) ? parsed.businesses : []
        } catch {
          businesses = []
        }
        received.enrichRequests.push({ businesses })
        const results = businesses.map(business => ({
          key: business.domain,
          emails: business.domain ? [`info@${business.domain}`, `contact@${business.domain}`] : [],
          medias: business.domain
            ? {
                instagram: `https://www.instagram.com/${business.domain}/`,
                facebook: `https://www.facebook.com/${business.domain}`
              }
            : {}
        }))
        sendJson(res, 200, { code: 10000, msg: 'ok', data: { results, partial: false } })
      })
      return
    }

    // spec 断言端点
    if (url.pathname === '/__mock/received') {
      sendJson(res, 200, received)
      return
    }

    sendJson(res, 404, { code: 40400, msg: `mock 未实现: ${req.method} ${url.pathname}` })
  })

  return {
    start() {
      return new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(port, '127.0.0.1', () => resolve())
      })
    },
    stop() {
      return new Promise(resolve => server.close(() => resolve()))
    }
  }
}

export default createMockServer
