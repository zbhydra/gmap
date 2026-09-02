/**
 * e2e 共享 harness（U1 交付，016 U3/U5 + 006 v3 登录用例复用）。
 *
 * - MV3 扩展的 content script 只在 persistent context 注入(非 persistent 属
 *   隐身语义,扩展默认关闭),故用 launchPersistentContext + --load-extension
 *   自管上下文;headful 为扩展要求的运行形态;
 * - 注入机制:context.route 拦截 https://www.bing.com/maps** 返回 fixture,
 *   URL 保持 bing.com 使 content script 正常注入、manifest 匹配不破坏,请求
 *   不出网;其余 http(s) 一律 abort(全程零外网);
 * - 浏览器进程级断 DNS(--host-resolver-rules):route 注册与扩展 SW 遥测首次
 *   上报之间存在毫秒级竞态,窗口内漏网请求必须确定性失败而非真实出网;
 * - v3 登录 mock(006 §4.4):chrome.identity.launchWebAuthFlow 替换为同步
 *   回调 mock——返回带 #code=<一次性code> 的 chromiumapp.org 回调 URL(真实
 *   auth flow 窗口在 Playwright persistent context 中不可观测,route 无法
 *   承演官网确认页);mock exchange 端点按一次性 code 消费并回合同完整
 *   token 对。manifest 移除固定 key 后扩展 ID 不可预知,一律从
 *   context.serviceWorkers() 动态反解。
 */

import { resolve } from 'node:path'
import {
  chromium,
  expect,
  type BrowserContext,
  type CDPSession,
  type Page,
  type Worker
} from '@playwright/test'

/** 生产构建产物目录(由 test:e2e 的构建前置 pnpm build 产出)。 */
export const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist')

/** fixture 页路径(globalSetup 已从黄金样本重合成)。 */
export const FIXTURE_PATH = resolve(process.cwd(), 'tests/e2e/fixtures/bing-maps-fixture.html')

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
  }
}

// ============================================================================
// v3 登录 + 门控用例共享装配(006 §4.4)
// ============================================================================

/** 后端占位 API 域(与 vite.config.ts 生产构建 define 同源)。 */
export const API_ORIGIN = 'https://api.example.com'

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

export interface ExtensionLoginRouteOptions {
  /** exchange mock 返回的登录账号。 */
  user: MockAuthUser
  /** SUBSCRIPTION_STATUS mock 订阅态。 */
  subscription: MockSubscription
  /** mock auth flow 将交付的一次性 code(exchange 只消费这一枚)。 */
  loginCode: string
}

export interface ExtensionLoginRouteResult {
  /** 被 route fulfill/DNS 放行的 URL(白名单真相)。 */
  fulfilled: string[]
  /** exchange 端点已消费的一次性 code。 */
  consumedCodes: string[]
}

/**
 * v3 登录/门控用例统一网络拦截:在 harness 零外网拦截(先挂 abort 兜底)之上,
 * 追加白名单(后挂优先):
 * 1. bing.com/maps → fixture(采集页面);
 * 2. API extension-login/exchange → mock exchange(一次性消费 loginCode,
 *    回合同完整 token 对);
 * 3. API auth/me、subscription/status → mock 信封(登录后 initialize/订阅
 *    联动消费)。
 * launchWebAuthFlow 由 installAuthFlowMock 替换,官网确认页与 issue 端点
 * 不在本层拦截范围。
 */
export async function setupExtensionLoginRoutes(
  context: BrowserContext,
  fixtureHtml: string,
  options: ExtensionLoginRouteOptions
): Promise<ExtensionLoginRouteResult> {
  const fulfilled: string[] = []
  const consumedCodes: string[] = []
  // 先挂 abort 兜底(拦截不打标记,与 setupRoutes 的 fulfilled 语义一致:
  // 只记录被 route fulfill/DNS 放行的真实成功请求)
  await context.route(/^https?:\/\//, route => route.abort())
  await context.route('https://www.bing.com/maps**', route => {
    fulfilled.push(route.request().url())
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixtureHtml })
  })
  await context.route(`${API_ORIGIN}/api/client/auth/extension-login/exchange**`, route => {
    fulfilled.push(route.request().url())
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS_HEADERS })
    }
    const body = route.request().postDataJSON() as { code?: string }
    if (body.code !== options.loginCode || consumedCodes.includes(options.loginCode)) {
      return route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({ code: 10104, data: {}, msg: 'AUTH_INVALID_CREDENTIALS' })
      })
    }
    consumedCodes.push(options.loginCode)
    return route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 10000,
        data: {
          extension_access_token: 'e2e-extension-access-token',
          extension_refresh_token: 'e2e-extension-refresh-token',
          token_type: 'bearer',
          expires_in: 604800,
          user: options.user
        },
        msg: 'success'
      })
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
  return { fulfilled, consumedCodes }
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
export async function waitForExtensionServiceWorker(context: BrowserContext): Promise<Worker> {
  const existing = context
    .serviceWorkers()
    .find(worker => worker.url().startsWith('chrome-extension://'))
  if (existing) return existing
  return context.waitForEvent('serviceworker', {
    predicate: worker => worker.url().startsWith('chrome-extension://'),
    timeout: 20_000
  })
}

/**
 * 从扩展 service worker URL 反解扩展 ID。manifest 固定 key 移除后扩展 ID
 * 不再可预知(unpacked 安装按 profile 派生),全部断言改为动态提取。
 */
export function extensionIdFromServiceWorker(worker: Worker): string {
  return new URL(worker.url()).host
}

/**
 * v3 登录 mock(006 §4.4):把扩展 SW 内的 chrome.identity.launchWebAuthFlow
 * 替换为同步回调——直接返回带 #code=<一次性code> 的 chromiumapp.org 回调
 * URL。真实 auth flow 窗口在 Playwright persistent context 中不可观测
 * (page 事件不触发、context.route 不适用),无法经窗口承演官网确认页;
 * 回调 URL 形态(chromiumapp.org + fragment 交付 code)、一次性 code 消费
 * 与生产合同一致。SW 闲置自毁会丢失替换,须在点击登录前即时安装。
 */
export async function installAuthFlowMock(serviceWorker: Worker, code: string): Promise<void> {
  await serviceWorker.evaluate(mockCode => {
    chrome.identity.launchWebAuthFlow = ((_options, callback) => {
      const redirectUri = chrome.identity.getRedirectURL('extension-login')
      callback(`${redirectUri}#code=${mockCode}`)
    }) as typeof chrome.identity.launchWebAuthFlow
  }, code)
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
 * 过滤依据是 origin(chrome-extension://<id>,动态反解);不能只看
 * auxData.type==='isolated',Playwright 自身的 utility world 同为 isolated
 * 且会在 Runtime.enable 时回放,其旧文档 context 在导航后被销毁,误评会报
 * Cannot find context。
 */
export async function assertContentScriptInjected(cdp: CDPSession, page: Page): Promise<void> {
  const serviceWorker = page
    .context()
    .serviceWorkers()
    .find(worker => worker.url().startsWith('chrome-extension://'))
  if (!serviceWorker) {
    throw new Error('[e2e] 反解扩展 ID 失败:context 内无扩展 service worker')
  }
  const extensionId = extensionIdFromServiceWorker(serviceWorker)

  const extensionWorldIds: number[] = []
  cdp.on('Runtime.executionContextCreated', event => {
    if (event.context.origin.startsWith(`chrome-extension://${extensionId}`)) {
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
  expect(runtimeIds).toContain(extensionId)
}
