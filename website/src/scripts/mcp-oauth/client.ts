/** MCP OAuth 确认页的票据存储与接口；授权页及已连接应用共用。 */
import { getJson, postJson, type RequestContext } from '../homepage/api'
import { getStoredAccessToken } from '../homepage/auth'

/** 与后端 CommonCode 对齐的 OAuth 确认与授权管理业务码。 */
export const MCP_OAUTH_CODE = {
  VALIDATION_ERROR: 999,
  NOT_FOUND: 404,
  REQUEST_INVALID: 31202
} as const

export const MCP_OAUTH_ERROR_REASONS = [
  'rate_limited',
  'invalid_client',
  'invalid_redirect_uri',
  'unsupported_response_type',
  'invalid_pkce',
  'invalid_resource',
  'server_error'
] as const

export type McpOAuthErrorReason = (typeof MCP_OAUTH_ERROR_REASONS)[number]

const REQUEST_STORAGE_KEY = 'cas_mcp_oauth_request'
/** 与后端 MCP_OAUTH_REQUEST_TTL_SECONDS 保持一致。 */
const REQUEST_TTL_MS = 30 * 60 * 1000
/** secrets.token_urlsafe(32) 生成的票据格式。 */
const REQUEST_PATTERN = /^[A-Za-z0-9_-]{43}$/

export type ConsentEntry =
  | { kind: 'request'; request: string }
  | { kind: 'error'; reason: McpOAuthErrorReason }
  | { kind: 'invalid' }

/** 立即清除地址栏票据；同标签页存储供刷新、切换语言和登录往返恢复。 */
export function readConsentEntry(): ConsentEntry {
  const fragment = location.hash.replace(/^#/, '')
  if (fragment) history.replaceState(history.state, '', `${location.pathname}${location.search}`)
  if (!fragment) return readStoredRequest()

  const params = new URLSearchParams(fragment)
  const keys = [...params.keys()]
  const request = params.get('request')
  const reason = params.get('error')
  if (keys.length === 1 && request !== null && REQUEST_PATTERN.test(request)) {
    sessionStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify({ request, saved_at: Date.now() }))
    return { kind: 'request', request }
  }
  clearConsentRequest()
  if (keys.length === 1 && reason !== null && isErrorReason(reason)) return { kind: 'error', reason }
  return { kind: 'invalid' }
}

function readStoredRequest(): ConsentEntry {
  const raw = sessionStorage.getItem(REQUEST_STORAGE_KEY)
  if (raw === null) return { kind: 'invalid' }
  let saved: unknown = null
  try {
    saved = JSON.parse(raw)
  } catch {
    saved = null
  }
  if (
    typeof saved === 'object' && saved !== null &&
    'request' in saved && typeof saved.request === 'string' &&
    REQUEST_PATTERN.test(saved.request) &&
    'saved_at' in saved && typeof saved.saved_at === 'number' &&
    Date.now() - saved.saved_at < REQUEST_TTL_MS
  ) {
    return { kind: 'request', request: saved.request }
  }
  clearConsentRequest()
  return { kind: 'invalid' }
}

/** 决定成功、票据失效或进入错误态时清除当前标签页票据。 */
export function clearConsentRequest(): void {
  sessionStorage.removeItem(REQUEST_STORAGE_KEY)
}

function isErrorReason(value: string): value is McpOAuthErrorReason {
  return MCP_OAUTH_ERROR_REASONS.some(reason => reason === value)
}

export interface ConsentDetail {
  /** 注册时自报的名称；以回调主机为主要标识。 */
  client_name: string | null
  /** 含非默认端口；回环回调不含端口。 */
  redirect_host: string
  is_loopback: boolean
  user_email: string
}

/** 凭证已变化且请求未发送；确认页重新读取并展示当前账号后再由用户决定。 */
export class McpOAuthCredentialChangedError extends Error {
  constructor() {
    super('MCP OAuth 确认接口：本地登录凭证已变化，请求未发送；需重新读取确认信息')
    this.name = 'McpOAuthCredentialChangedError'
  }
}

function assertCredentialUnchanged(pinnedCredential: string | undefined): void {
  if (pinnedCredential === undefined) return
  if (getStoredAccessToken() !== pinnedCredential) {
    throw new McpOAuthCredentialChangedError()
  }
}

/** 只读票据；调用方保留此次 context.token，供后续 decide 使用。 */
export async function getConsentDetail(context: RequestContext, request: string): Promise<ConsentDetail> {
  assertCredentialUnchanged(context.token ?? undefined)
  return postJson<ConsentDetail>('/api/client/mcp-oauth/requests/detail', context, { request })
}

/** context.token 必须是展示 detail 时的凭证；服务端消费票据并生成唯一回跳地址。 */
export async function decideConsent(context: RequestContext, request: string, approved: boolean): Promise<string> {
  assertCredentialUnchanged(context.token ?? undefined)
  const data = await postJson<{ redirect_url: string }>(
    '/api/client/mcp-oauth/requests/decide', context, { request, approved }
  )
  return data.redirect_url
}

export interface McpOAuthGrant {
  grant_id: number
  /** 授权时保存的应用自报名称快照。 */
  client_name: string | null
  redirect_host: string
  /** 授权码兑换成功时间，毫秒。 */
  created_at: number
  /** 毫秒；null 表示尚未刷新。 */
  last_refreshed_at: number | null
}

/** 查询本人有效授权，页码从 1 起，按创建时间倒序。 */
export async function listMcpOAuthGrants(
  context: RequestContext,
  page = 1,
  pageSize = 20
): Promise<{ items: McpOAuthGrant[]; total: number }> {
  return getJson('/api/client/mcp-oauth/grants', context, { page, page_size: pageSize })
}

/** 本人已撤销的授权可重复撤销；不存在或属于他人时返回 NOT_FOUND。 */
export async function revokeMcpOAuthGrant(context: RequestContext, grantId: number): Promise<void> {
  await postJson<{ revoked: boolean }>(`/api/client/mcp-oauth/grants/${grantId}/revoke`, context)
}
