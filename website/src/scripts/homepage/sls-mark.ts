/**
 * 阿里云 SLS WebTracking mark-log 旁路上报。
 *
 * SLS 是客户端逃生观测通道：后端不可用时仍尝试留痕，但数据不作为可信业务口径。
 */

import type { JsonObject, JsonValue, RequestContext } from './api'
import { ensureDeviceId, ensureFirstOpenedAt } from './device'
import type { FrontendCapturedError } from './frontend-error-capture'
import { sanitizeMarkText } from './mark-sanitizer'

/** SLS 字段允许的值类型。 */
type SlsFieldValue = string | number | boolean | null

/** SLS WebTracking 日志字段。 */
export type SlsMarkFields = Record<string, SlsFieldValue>

/** SLS mark 上报所属站点与产品线，website 只有一条产品线。 */
const SLS_MARK_SITE = 'website'
const SLS_CLIENT_PRODUCT = 'web'

/** SLS WebTracking 配置。 */
export interface SlsMarkConfig {
  /** 是否启用 SLS 上报。 */
  enabled: boolean
  /** SLS WebTracking endpoint，不含末尾斜杠。 */
  endpoint: string
  /** SLS Logstore 名称。 */
  logstore: string
  /** SLS topic。 */
  topic: string
  /** SLS source。 */
  source: string
}

/** mark_msg 最大长度，保持低于后端 API 与数据库的 1024 字符上限。 */
const MAX_MARK_MSG_LENGTH = 1000

/** User-Agent 最大长度，保留排障信息同时降低指纹与 URL 长度风险。 */
const MAX_USER_AGENT_LENGTH = 512

/** 普通文本字段最大长度。 */
const MAX_TEXT_FIELD_LENGTH = 256

/** WebTracking GET 接口版本。 */
const SLS_API_VERSION = '0.6.0'

/** 默认 topic。 */
const DEFAULT_TOPIC = 'mark-log'

/** 前端未捕获异常 SLS-only 事件名。 */
const FRONTEND_UNCAUGHT_ERROR_MARK_TYPE = 'web_frontend_uncaught_error'

/** 关闭 SLS 的环境变量值。 */
const DISABLED_VALUE = 'false'

/** 已脱敏 key=value 再次进入 SLS JSON 时，避免最终脱敏规则破坏 JSON。 */
const REDACTED_KEY_VALUE_RE =
  /\b(cookie|set-cookie|authorization|proxy-authorization|direct_url|download_url|access_token|refresh_token|id_token|auth_token|token|sig|signature|client_secret|secret|session|sessionid|sid)\s*[:=]\s*\[redacted\]/gi

/** 结构化 mark_msg 中必须整体脱敏的字段名。 */
const SENSITIVE_JSON_KEY_RE =
  /^(cookie|set-cookie|authorization|proxy-authorization|headers?|request_headers|response_headers|direct_url|download_url|access_token|refresh_token|id_token|auth_token|token|sig|signature|client_secret|secret|session|sessionid|sid)$/i

/** 裁剪文本字段。 */
function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

/** 读取去除首尾空白的公开环境变量。 */
function readEnvValue(value: string | undefined): string {
  return value?.trim() ?? ''
}

/** 判断公开环境变量是否显式关闭 SLS。 */
function isSlsDisabled(value: string | undefined): boolean {
  return readEnvValue(value).toLowerCase() === DISABLED_VALUE
}

/** 规范化 SLS host，避免 endpoint 出现重复协议或尾部斜杠。 */
function normalizeSlsHost(host: string): string {
  return host.replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

/** 规范化 SLS endpoint。 */
function normalizeSlsEndpoint(endpoint: string): string {
  return endpoint.replace(/\/+$/, '')
}

/** 读取 SLS WebTracking 配置。 */
export function getSlsMarkConfig(): SlsMarkConfig {
  const endpointFromEnv = normalizeSlsEndpoint(readEnvValue(import.meta.env.PUBLIC_ALI_SLS_ENDPOINT))
  const project = readEnvValue(import.meta.env.PUBLIC_ALI_SLS_PROJECT)
  const host = normalizeSlsHost(readEnvValue(import.meta.env.PUBLIC_ALI_SLS_HOST))
  const endpoint = endpointFromEnv || (project && host ? `https://${project}.${host}` : '')
  const logstore = readEnvValue(import.meta.env.PUBLIC_ALI_SLS_LOGSTORE)

  return {
    enabled: !isSlsDisabled(import.meta.env.PUBLIC_ALI_SLS_ENABLED) && Boolean(endpoint && logstore),
    endpoint,
    logstore,
    topic: readEnvValue(import.meta.env.PUBLIC_ALI_SLS_TOPIC) || DEFAULT_TOPIC,
    // source 与 client_product 同为产品身份，不接受环境变量覆盖：
    // 允许覆盖会让日志里的产品口径与 client_product 漂移。
    source: SLS_MARK_SITE
  }
}

/** 读取当前页面路径。 */
function getCurrentPagePath(): string {
  if (typeof location === 'undefined') {
    return ''
  }

  return truncateText(location.pathname, MAX_TEXT_FIELD_LENGTH)
}

/** 读取当前浏览器 User-Agent。 */
function getCurrentUserAgent(): string {
  if (typeof navigator === 'undefined') {
    return ''
  }

  return typeof navigator.userAgent === 'string' ? truncateText(navigator.userAgent, MAX_USER_AGENT_LENGTH) : ''
}

/** 读取当前浏览器语言。 */
function getCurrentLanguage(): string {
  if (typeof navigator === 'undefined') {
    return ''
  }

  return typeof navigator.language === 'string' ? truncateText(navigator.language, MAX_TEXT_FIELD_LENGTH) : ''
}

/** 读取当前视口大小。 */
function getCurrentViewport(): string {
  if (typeof window === 'undefined') {
    return '0x0'
  }

  return `${window.innerWidth}x${window.innerHeight}`
}

/** 递归脱敏 JSON 值，先解析再序列化，避免正则破坏 JSON 结构。 */
function sanitizeSlsJsonValue(value: JsonValue): JsonValue {
  if (typeof value === 'string') {
    return sanitizeMarkText(value)
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeSlsJsonValue)
  }
  if (value === null || typeof value !== 'object') {
    return value
  }

  const sanitized: JsonObject = {}
  for (const [key, nestedValue] of Object.entries(value)) {
    sanitized[key] = SENSITIVE_JSON_KEY_RE.test(key)
      ? '[redacted]'
      : sanitizeSlsJsonValue(nestedValue)
  }
  return sanitized
}

/** 构造 SLS 专用 mark_msg，避免把用户原始输入 URL 和 token 放进第三方 GET 查询串。 */
function buildSlsMarkMessage(markMsg: string): string {
  const sanitizedText = sanitizeMarkText(markMsg)
  const trimmedText = markMsg.trim()
  if (!trimmedText.startsWith('{') && !trimmedText.startsWith('[')) {
    return truncateText(sanitizedText, MAX_MARK_MSG_LENGTH)
  }

  let structured: JsonValue
  try {
    structured = JSON.parse(markMsg)
  } catch (error) {
    console.error('[sls-mark] Failed to parse structured mark_msg.', {
      markMsg: '[redacted]',
      errorName: error instanceof Error ? error.name : 'NonError'
    })
    return truncateText(sanitizedText, MAX_MARK_MSG_LENGTH)
  }

  const sanitized = JSON.stringify(sanitizeSlsJsonValue(structured))
  if (sanitized.length <= MAX_MARK_MSG_LENGTH) {
    return sanitized
  }

  // 结构化日志宁可丢失附加字段，也不能切成下游无法解析的半截 JSON。
  return JSON.stringify({ reason: 'mark_msg_exceeded_sls_limit' })
}

/** 预脱敏单个诊断字段，保持 JSON 字符串在最终 SLS 脱敏后仍可解析。 */
function sanitizeSlsDiagnosticField(value: string): string {
  return truncateText(sanitizeMarkText(value).replace(REDACTED_KEY_VALUE_RE, '$1_redacted'), MAX_TEXT_FIELD_LENGTH)
}

/** 构造前端未捕获异常的 SLS mark_msg。 */
export function buildFrontendCapturedErrorMarkMessage(capturedError: FrontendCapturedError): string {
  return JSON.stringify({
    error_kind: capturedError.errorKind,
    error_name: sanitizeSlsDiagnosticField(capturedError.errorName),
    error_message: sanitizeSlsDiagnosticField(capturedError.errorMessage),
    page_path: sanitizeSlsDiagnosticField(capturedError.pagePath),
    source_file: sanitizeSlsDiagnosticField(capturedError.sourceFile),
    line: capturedError.line,
    column: capturedError.column
  })
}

/**
 * 从 JWT 载荷读取账号 ID。
 *
 * 只为分析关联，不验签、不用于认证；token 本身不入日志。解不出时固定 0，
 * 让匿名事件与已登录事件在同一字段上可区分。
 */
function readMarkUserId(token: string | null | undefined): number {
  if (!token) {
    return 0
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return 0
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')), char =>
          char.charCodeAt(0)
        )
      )
    ) as { user_id?: unknown }
    const userId = payload.user_id
    return typeof userId === 'number' && Number.isSafeInteger(userId) && userId > 0 ? userId : 0
  } catch (error) {
    console.error('[SlsMark] 解析当前账号标识失败:', error)
    return 0
  }
}

/**
 * 首次访问距今天数。
 *
 * 新用户分析的核心维度：`0` 表示首访当天。同一设备跨天回来时该值递增，
 * 因此不用额外建「新/老用户」布尔字段——按 `first_opened_days` 分桶即可
 * 看到完整的留存曲线。
 */
function readFirstOpenedDays(firstOpenedAt: number): number {
  if (!firstOpenedAt) {
    return -1
  }

  const elapsed = Date.now() - firstOpenedAt
  return elapsed < 0 ? 0 : Math.floor(elapsed / 86_400_000)
}

/** 构造 SLS mark-log 字段。 */
export function buildSlsMarkFields(
  markType: string,
  context: RequestContext,
  markMsg: string
): SlsMarkFields {
  const firstOpenedAt = ensureFirstOpenedAt()
  return {
    event: 'mark-log',
    site: SLS_MARK_SITE,
    client_product: SLS_CLIENT_PRODUCT,
    mark_type: truncateText(markType, MAX_TEXT_FIELD_LENGTH),
    mark_msg: buildSlsMarkMessage(markMsg),
    device_id: truncateText(context.deviceId, MAX_TEXT_FIELD_LENGTH),
    user_id: readMarkUserId(context.token),
    page_path: getCurrentPagePath(),
    mark_time: String(Date.now()),
    first_opened_at: firstOpenedAt,
    first_opened_days: readFirstOpenedDays(firstOpenedAt),
    user_agent: getCurrentUserAgent(),
    language: getCurrentLanguage(),
    viewport: getCurrentViewport()
  }
}

/** 构造 SLS WebTracking GET URL。 */
export function buildSlsMarkUrl(config: SlsMarkConfig, fields: SlsMarkFields): string {
  const url = new URL(`/logstores/${config.logstore}/track`, config.endpoint)

  url.searchParams.set('APIVersion', SLS_API_VERSION)
  url.searchParams.set('__topic__', config.topic)
  url.searchParams.set('__source__', config.source)

  for (const [key, value] of Object.entries(fields)) {
    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

/** 执行 SLS WebTracking 请求。 */
async function sendSlsMark(
  markType: string,
  context: RequestContext,
  markMsg: string
): Promise<void> {
  const config = getSlsMarkConfig()
  if (!config.enabled) {
    return
  }

  const response = await fetch(buildSlsMarkUrl(config, buildSlsMarkFields(markType, context, markMsg)), {
    method: 'GET',
    credentials: 'omit',
    keepalive: true
  })

  if (!response.ok) {
    throw new Error(
      `[SlsMark] WebTracking failed: status=${response.status}, statusText=${response.statusText}, mark_type=${markType}`
    )
  }
}

/** fire-and-forget 上报 SLS mark-log。 */
export function reportHomepageMarkToSls(
  markType: string,
  context: RequestContext,
  markMsg: string
): void {
  void sendSlsMark(markType, context, markMsg).catch(error => {
    console.error('[SlsMark] mark-log 上报失败:', error)
  })
}

/** 将前端异常捕获结果只上报到 SLS。 */
export function reportFrontendCapturedErrorToSls(capturedError: FrontendCapturedError): void {
  const markMsg = buildFrontendCapturedErrorMarkMessage(capturedError)

  void ensureDeviceId()
    .then(deviceId => {
      reportHomepageMarkToSls(FRONTEND_UNCAUGHT_ERROR_MARK_TYPE, { deviceId, token: null }, markMsg)
    })
    .catch(error => {
      console.error('[SlsMark] 前端异常获取 device_id 失败:', error)
    })
}
