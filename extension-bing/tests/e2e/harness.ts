/**
 * e2e 共享 harness（U1 交付，016 U3/U5 用例复用）。
 *
 * - MV3 扩展的 content script 只在 persistent context 注入(非 persistent 属
 *   隐身语义,扩展默认关闭),故用 launchPersistentContext + --load-extension
 *   自管上下文;headful 为扩展要求的运行形态;
 * - 注入机制:context.route 拦截 https://www.bing.com/maps** 返回 fixture,
 *   URL 保持 bing.com 使 content script 正常注入、manifest 匹配不破坏,请求
 *   不出网;其余 http(s) 一律 abort(全程零外网);
 * - 浏览器进程级断 DNS(--host-resolver-rules):route 注册与扩展 SW 遥测首次
 *   上报之间存在毫秒级竞态,窗口内漏网请求必须确定性失败而非真实出网。
 */

import { resolve } from 'node:path'
import { chromium, expect, type BrowserContext, type CDPSession, type Page } from '@playwright/test'

/** 生产构建产物目录(由 test:e2e 的构建前置 pnpm build 产出)。 */
export const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist')

/** fixture 页路径(globalSetup 已从黄金样本重合成)。 */
export const FIXTURE_PATH = resolve(process.cwd(), 'tests/e2e/fixtures/bing-maps-fixture.html')

/** 固定扩展 ID(来源:vite.config.ts manifest key 注释,website 登录桥同源)。 */
export const EXTENSION_ID = 'pgcpggcfmfdmobpheojngndpcmnkibmm'

/** fixture 页合成规模(与 generate-fixture.mjs 契约一致)。 */
export const FIXTURE_TOTAL = 30
export const FIXTURE_DEFAULT_INITIAL = 25

/** 演示搜索词 URL(与真实 Bing 搜索形态同构;请求本身被 route 拦截不出网)。 */
export const MAPS_URL = 'https://www.bing.com/maps?q=auto+repair+near+new+york+city'

/** fixture 页内嵌的「加载更多」控制接口(由 generate-fixture.mjs 注入)。 */
declare global {
  interface Window {
    bingFixture: {
      total: number
      renderedCount: () => number
      loadMore: (count?: number) => void
      loadAll: () => void
      enableScrollPaging: () => void
      disableScrollPaging: () => void
    }
    /** 登录桥用例:sendMessage 回执与 lastError 的落点(website 模拟页注入)。 */
    __bridgeResult: { response: { ok: boolean } | null; error: string | null } | null
  }
}

// ============================================================================
// 登录桥 + 门控用例(U4)共享装配
// ============================================================================

/**
 * 生产构建产物解析出的官网/后端域(vite.config.ts 占位常量,T1 §5 待决项):
 * - 官网页 route 与 manifest externally_connectable 同源(同占位域);
 * - 后端 AUTH_ME / SUBSCRIPTION_STATUS route 走占位 API 域。
 */
export const WEBSITE_ORIGIN = 'https://www.example.com'
export const API_ORIGIN = 'https://api.example.com'
export const WEBSITE_LOGIN_BRIDGE_URL = `${WEBSITE_ORIGIN}/extension-login-bing?e2e-bridge=1`

/** AUTH_ME mock 信封 data(spec-website §7:code 10000 成功)。 */
export interface MockAuthUser {
  user_id: number
  email: string
  full_name: string
  avatar_url: string | null
  created_at: number
}

/** SUBSCRIPTION_STATUS mock 信封 data(006 域 SubscriptionStatus 形状)。 */
export interface MockSubscription {
  status: 'active' | 'unavailable'
  period: 'free' | 'month' | 'unavailable'
  display_name: string
  expires_at: number | null
  daily_limit: number
  used: number
  remaining: number
  reset_date: string
}

/** CORS 头:扩展 SW 发起的跨域 fetch 需要标准 CORS 应答(preflight 含 OPTIONS)。 */
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS'
}

/** 组装官网登录桥模拟页:注入 chrome.runtime.sendMessage 调用(website auth.ts 同构)。 */
export function buildLoginBridgePageHtml(token: string): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Extension Login Bridge</title></head>
<body>
<h1>Extension Login Bridge</h1>
<script>
  const EXTENSION_ID = '${EXTENSION_ID}'
  chrome.runtime.sendMessage(
    EXTENSION_ID,
    { type: 'BING_MAPS_EXTENSION_AUTH_CHANGED', web_access_token: '${token}' },
    response => {
      window.__bridgeResult = {
        response: response ?? null,
        error: chrome.runtime.lastError ? chrome.runtime.lastError.message : null
      }
    }
  )
</script>
</body>
</html>`
}

export interface LoginBridgeRouteOptions {
  /** 官网登录态 token;null = 模拟未登录官网页(不注入 sendMessage)。 */
  token: string | null
  /** AUTH_ME mock 账号。 */
  user: MockAuthUser
  /** SUBSCRIPTION_STATUS mock 订阅态。 */
  subscription: MockSubscription
}

/**
 * 登录桥/门控用例统一网络拦截:在 harness 零外网拦截(先挂 abort 兜底)之上,
 * 追加三类白名单(后挂优先):
 * 1. bing.com/maps → fixture(采集页面);
 * 2. 官网登录桥 URL → sendMessage 模拟页(token 可控);
 * 3. 占位 API 域 AUTH_ME / SUBSCRIPTION_STATUS → mock 信封(含 CORS preflight)。
 */
export async function setupLoginBridgeRoutes(
  context: BrowserContext,
  fixtureHtml: string,
  options: LoginBridgeRouteOptions
): Promise<{ fulfilled: string[] }> {
  const fulfilled: string[] = []
  // 先挂 abort 兜底(拦截不打标记,与 setupRoutes 的 fulfilled 语义一致:
  // 只记录被 route fulfill/DNS 放行的真实成功请求)
  await context.route(/^https?:\/\//, route => route.abort())
  await context.route('https://www.bing.com/maps**', route => {
    fulfilled.push(route.request().url())
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixtureHtml })
  })
  await context.route(WEBSITE_LOGIN_BRIDGE_URL, route => {
    fulfilled.push(route.request().url())
    return route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body:
        options.token === null
          ? '<html><body>signed out</body></html>'
          : buildLoginBridgePageHtml(options.token)
    })
  })
  await context.route(`${API_ORIGIN}/api/client/auth/me**`, route => {
    fulfilled.push(route.request().url())
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS_HEADERS })
    }
    return route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: 'application/json',
      body: JSON.stringify({ code: 10000, data: options.user, msg: 'success' })
    })
  })
  await context.route(`${API_ORIGIN}/api/client/subscription/status**`, route => {
    fulfilled.push(route.request().url())
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS_HEADERS })
    }
    return route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: 'application/json',
      body: JSON.stringify({ code: 10000, data: options.subscription, msg: 'success' })
    })
  })
  return { fulfilled }
}

/**
 * 启动加载扩展的 headful persistent context(每用例独立临时 profile)。
 *
 * @param options.resolverRules 覆盖进程级 --host-resolver-rules 的规则列表;
 *   缺省 = `MAP * ~NOTFOUND`(离线层全程零外网铁律,说明见文件头)。仅真实
 *   Bing smoke 层(U5)传入遥测域定点断网规则以放行真实 bing.com——见
 *   real-bing-smoke.spec.ts。
 */
export async function launchExtensionContext(
  options: { resolverRules?: string[] } = {}
): Promise<BrowserContext> {
  const resolverRules = options.resolverRules ?? ['MAP * ~NOTFOUND']
  return chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: false,
    args: [
      `--disable-extensions-except=${PATH_TO_EXTENSION}`,
      `--load-extension=${PATH_TO_EXTENSION}`,
      `--host-resolver-rules=${resolverRules.join(',')}`
    ]
  })
}

/** 等待扩展 MV3 service worker 注册完成并返回。 */
export async function waitForExtensionServiceWorker(context: BrowserContext) {
  const existing = context
    .serviceWorkers()
    .find(worker => worker.url().startsWith(`chrome-extension://${EXTENSION_ID}/`))
  if (existing) return existing
  return context.waitForEvent('serviceworker', {
    predicate: worker => worker.url().startsWith(`chrome-extension://${EXTENSION_ID}/`),
    timeout: 20_000
  })
}

/**
 * 统一网络拦截:maps 走 fixture,其余 http(s) 一律 abort(零外网)。
 * 返回 route 层分流记录:fulfilled 为被放行的 URL(白名单真相),
 * intercepted 为被 abort 的 URL(含生产产物的 SW 遥测尝试)。
 */
export async function setupRoutes(
  context: BrowserContext,
  fixtureHtml: string
): Promise<{ fulfilled: string[]; intercepted: string[] }> {
  const fulfilled: string[] = []
  const intercepted: string[] = []
  // Playwright 后注册的 route 优先匹配:须先挂 abort 兜底、再挂 fixture 路由
  await context.route(/^https?:\/\//, route => {
    intercepted.push(route.request().url())
    return route.abort()
  })
  await context.route('https://www.bing.com/maps**', route => {
    fulfilled.push(route.request().url())
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixtureHtml })
  })
  return { fulfilled, intercepted }
}

/**
 * 断言 content script 注入生效:在页面 CDP 会话上监听扩展隔离 world 的创建,
 * 并在其中执行 chrome.runtime.id,命中扩展 ID 即证明注入生效。
 * 过滤依据是 origin(chrome-extension://<id>);不能只看 auxData.type==='isolated',
 * Playwright 自身的 utility world 同为 isolated 且会在 Runtime.enable 时回放,
 * 其旧文档 context 在导航后被销毁,误评会报 Cannot find context。
 */
export async function assertContentScriptInjected(cdp: CDPSession, page: Page): Promise<void> {
  const extensionWorldIds: number[] = []
  cdp.on('Runtime.executionContextCreated', event => {
    if (event.context.origin.startsWith(`chrome-extension://${EXTENSION_ID}`)) {
      extensionWorldIds.push(event.context.id)
    }
  })
  // enable 必须先于 goto,否则会错过随文档创建的隔离 world
  await cdp.send('Runtime.enable')

  await page.goto(MAPS_URL)

  await expect.poll(() => extensionWorldIds.length, { timeout: 15_000 }).toBeGreaterThan(0)

  const runtimeIds: string[] = []
  for (const contextId of extensionWorldIds) {
    const evaluation = await cdp.send('Runtime.evaluate', {
      expression: 'self.chrome && chrome.runtime ? chrome.runtime.id : ""',
      contextId,
      returnByValue: true
    })
    runtimeIds.push(String(evaluation.result.value))
  }
  expect(runtimeIds).toContain(EXTENSION_ID)
}
