import { postJson, type RequestContext } from './api'
import { getStoredAccessToken } from './auth'
import { ensureFirstOpenedAt, getStoredDeviceId } from './device'
import { sanitizeMarkText, sanitizeMarkUrl } from './mark-sanitizer'
import { reportHomepageMarkToSls } from './sls-mark'

/**
 * website 打点类型。
 *
 * 通道裁决：只有管理后台 Dashboard 需要聚合的转化事件保持「SLS + 后端
 * mark_logs 双写」，其余营销/工具/工作区交互只写 SLS。理由——后端 MarkType
 * 是枚举白名单，新增事件必须同步改后端才不 422；把点击级事件灌进
 * mark_logs 既污染业务库，又让每次埋点都要动后端。
 */
export const HOMEPAGE_MARK_TYPE = {
  /** 双写：后端 Dashboard 首访统计口径。 */
  WEB_FIRST_OPENED: 'web_first_opened',
  /** 双写：插件来源进入 Pricing（订阅漏斗上游）。 */
  WEB_PRICING_OPEN_FROM_EXTENSION: 'web_pricing_open_from_extension',
  /** 双写：插件安装 CTA 点击。 */
  WEB_EXTENSION_INSTALL_CLICK: 'web_extension_install_click',
  /** SLS-only：页面浏览。 */
  WEB_PAGE_VIEW: 'web_page_view',
  /** SLS-only：任意 `data-cta` 元素点击（全站统一漏斗）。 */
  WEB_CTA_CLICK: 'web_cta_click',
  /** SLS-only：站内导航/语言切换等按钮动作（mark_msg 带 action）。 */
  WEB_UI_ACTION: 'web_ui_action',
  /** SLS-only：登录流程各阶段（mark_msg 带 stage / outcome）。 */
  WEB_AUTH_EVENT: 'web_auth_event',
  /** SLS-only：Pricing 与下单流程（mark_msg 带 stage）。 */
  WEB_CHECKOUT_EVENT: 'web_checkout_event',
  /** SLS-only：Dashboard 工作区动作（mark_msg 带 action）。 */
  WEB_DASHBOARD_ACTION: 'web_dashboard_action',
  /** SLS-only：免费工具使用（mark_msg 带 action / tool_id）。 */
  WEB_TOOL_EVENT: 'web_tool_event',
  /** SLS-only：MCP 授权流程。 */
  WEB_MCP_EVENT: 'web_mcp_event',
  /** SLS-only：接口业务错误（4xx/5xx 与业务码，区别于连接失败）。 */
  WEB_API_ERROR: 'web_api_error'
} as const

type HomepageMarkType = (typeof HOMEPAGE_MARK_TYPE)[keyof typeof HOMEPAGE_MARK_TYPE]

/**
 * 只写 SLS 的事件集合。
 *
 * 用显式白名单而不是「默认只写 SLS」：后端 mark_logs 的既有口径由枚举决定，
 * 漏配会让新增事件悄悄变成 422 静默失败（后端对校验失败返回 422，前端
 * fire-and-forget 不感知）。
 */
const SLS_ONLY_MARK_TYPES: ReadonlySet<string> = new Set([
  HOMEPAGE_MARK_TYPE.WEB_PAGE_VIEW,
  HOMEPAGE_MARK_TYPE.WEB_CTA_CLICK,
  HOMEPAGE_MARK_TYPE.WEB_UI_ACTION,
  HOMEPAGE_MARK_TYPE.WEB_AUTH_EVENT,
  HOMEPAGE_MARK_TYPE.WEB_CHECKOUT_EVENT,
  HOMEPAGE_MARK_TYPE.WEB_DASHBOARD_ACTION,
  HOMEPAGE_MARK_TYPE.WEB_TOOL_EVENT,
  HOMEPAGE_MARK_TYPE.WEB_MCP_EVENT,
  HOMEPAGE_MARK_TYPE.WEB_API_ERROR
])

interface HomepageMarkResponse {
  recorded: boolean
}

const MAX_MARK_MSG_LENGTH = 1000
const MAX_MARK_URL_LENGTH = 240
const MAX_MARK_FILENAME_LENGTH = 80
const MAX_MARK_RESOURCE_COUNT = 3

/** 埋点里允许出现的资源摘要字段。 */
export interface HomepageMarkResource {
  sourceId: string
  filename: string
  type: string
  size: number | null
  link?: string
  platform?: string
}

interface HomepageMarkResourceSummary {
  source_id: string
  filename: string
  type: string
  size: number
  message_id?: string
}

function truncateText(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : value.slice(0, maxLength)
}

function summarizeResource(resource: HomepageMarkResource): HomepageMarkResourceSummary {
  const summary: HomepageMarkResourceSummary = {
    source_id: truncateText(sanitizeMarkText(resource.sourceId), 64),
    filename: truncateText(sanitizeMarkText(resource.filename), MAX_MARK_FILENAME_LENGTH),
    type: truncateText(resource.type, 32),
    size: resource.size ?? 0
  }

  return summary
}

/** 构造 mark_msg JSON；整体超长时逐级降级，禁止切出无效 JSON。 */
export function buildHomepageMarkMessage(
  url: string,
  resources?: HomepageMarkResource | HomepageMarkResource[]
): string {
  const normalizedUrl = truncateText(sanitizeMarkUrl(url), MAX_MARK_URL_LENGTH)
  const resourceList = Array.isArray(resources) ? resources : resources ? [resources] : []

  if (resourceList.length === 0) {
    return JSON.stringify({ url: normalizedUrl })
  }

  const summarizedResources = resourceList
    .slice(0, MAX_MARK_RESOURCE_COUNT)
    .map(summarizeResource)

  const fullPayload = {
    url: normalizedUrl,
    resource_count: resourceList.length,
    resources: summarizedResources
  }
  const fullPayloadText = JSON.stringify(fullPayload)
  if (fullPayloadText.length <= MAX_MARK_MSG_LENGTH) {
    return fullPayloadText
  }

  const reducedPayloadText = JSON.stringify({
    url: normalizedUrl,
    resource_count: resourceList.length,
    resources: summarizedResources.map(resource => ({
      source_id: resource.source_id,
      type: resource.type
    }))
  })
  if (reducedPayloadText.length <= MAX_MARK_MSG_LENGTH) {
    return reducedPayloadText
  }

  return JSON.stringify({ resource_count: resourceList.length })
}

export async function recordHomepageMark(
  markType: HomepageMarkType,
  context: RequestContext,
  markMsg = ''
): Promise<void> {
  reportHomepageMarkToSls(markType, context, markMsg)

  if (SLS_ONLY_MARK_TYPES.has(markType)) {
    return
  }

  await postJson<HomepageMarkResponse>('/api/client/mark/record', context, {
    mark_type: markType,
    mark_msg: markMsg,
    first_opened_at: ensureFirstOpenedAt()
  })
}

/**
 * 只写 SLS 的埋点入口（fire-and-forget，不等 device_id）。
 *
 * 用于页面浏览、CTA、工具、工作区这类高频交互：它们不进后端 mark_logs，
 * 也不需要等待 device_id 就绪才发——等待会让离页前的点击丢掉。device_id
 * 未就绪时该字段留空，仍能按会话/UA 聚合。
 */
export function trackWebMark(markType: HomepageMarkType, markMsg = ''): void {
  // 带上登录令牌：SLS 侧从 JWT 载荷取 user_id 关联账号，令牌自身不入日志。
  // 没有它，所有 SLS-only 事件的 user_id 恒为 0，新用户链路无法与账号打通。
  reportHomepageMarkToSls(
    markType,
    { deviceId: getStoredDeviceId() ?? '', token: getStoredAccessToken() },
    markMsg
  )
}

/** 拼接 `key=value` 形式的 mark_msg，与插件端口径一致。 */
export function formatMarkMessage(
  fields: Record<string, string | number | boolean | null | undefined>
): string {
  return Object.entries(fields)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(', ')
}
