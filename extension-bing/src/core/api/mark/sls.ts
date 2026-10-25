/**
 * 插件端阿里云 SLS WebTracking mark-log 上报。
 *
 * 这条链路替代旧的后端 mark_logs 写入：只写匿名 SLS GET 日志，失败不阻断插件下载流程。
 */

import { ALI_SLS_MARK, STORAGE_KEYS } from '../config'
import { storageManager } from '../../storage'
import type { UserInfo } from '../../types'
import { sanitizeMarkText } from './mark-sanitizer'

/** SLS 字段允许的值类型。 */
type SlsFieldValue = string | number | boolean | null

/** SLS WebTracking 日志字段。 */
export type SlsMarkFields = Record<string, SlsFieldValue>

export interface ExtensionMarkRecordOptions {
  /** 调用来源 URL 或 origin，用于填充 page_path。 */
  pageUrl?: string
  /** 事件所属界面；不传时按 pageUrl 推断。 */
  surface?: MarkSurface
}

/** 事件发生的插件界面，用于区分同一 business 事件在何处触发。 */
export type MarkSurface = 'popup' | 'content' | 'dashboard' | 'options' | 'background'

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
  /** 产品线标识（website=`web` / Maps=`extension-maps` / Bing=`extension-bing`）。 */
  clientProduct: string
}

const MAX_MARK_MSG_LENGTH = 1000
const MAX_USER_AGENT_LENGTH = 512
const MAX_TEXT_FIELD_LENGTH = 256
const SLS_API_VERSION = '0.6.0'

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

/** 从来源 URL 推断插件界面：扩展页按文件名判定，宿主页一律视为 content。 */
export function inferMarkSurface(pageUrl: string | undefined): MarkSurface {
  const source = pageUrl || (typeof location !== 'undefined' ? location.href : '')
  if (!source) {
    return 'background'
  }

  if (source.startsWith('chrome-extension://') || source.startsWith('moz-extension://')) {
    if (/\/src\/popup\.html/.test(source)) return 'popup'
    if (/\/src\/dashboard\.html/.test(source)) return 'dashboard'
    if (/\/src\/options\.html/.test(source)) return 'options'
    return 'background'
  }

  return 'content'
}

function getRuntimePagePath(pageUrl: string | undefined): string {
  const source = pageUrl || (typeof location !== 'undefined' ? location.href : '')
  if (!source) {
    return ''
  }

  return truncateText(
    URL.canParse(source) ? new URL(source).pathname : source,
    MAX_TEXT_FIELD_LENGTH
  )
}

function getCurrentUserAgent(): string {
  if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') {
    return ''
  }

  return truncateText(navigator.userAgent, MAX_USER_AGENT_LENGTH)
}

function getCurrentLanguage(): string {
  if (typeof navigator === 'undefined' || typeof navigator.language !== 'string') {
    return ''
  }

  return truncateText(navigator.language, MAX_TEXT_FIELD_LENGTH)
}

function getCurrentViewport(): string {
  if (typeof window === 'undefined') {
    return '0x0'
  }

  return `${window.innerWidth}x${window.innerHeight}`
}

function buildSlsMarkMessage(markMsg: string): string {
  return truncateText(sanitizeMarkText(markMsg), MAX_MARK_MSG_LENGTH)
}

async function getDeviceId(): Promise<string> {
  return (await storageManager.get<string>(STORAGE_KEYS.DEVICE_ID)) ?? ''
}

/** 读取当前账号 ID；未登录固定 0，避免匿名事件被误判为某个用户。 */
async function getUserId(): Promise<number> {
  const [accessToken, user] = await Promise.all([
    storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
    storageManager.get<UserInfo>(STORAGE_KEYS.USER_INFO)
  ])
  return accessToken && user?.user_id ? user.user_id : 0
}

/** 安装时间缺失时回落为 0，避免把未知状态算成首日。 */
function truncateNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

/**
 * 扩展安装距今天数。
 *
 * 与 website 的 `first_opened_days` 同口径：`0` = 安装当天，用于按安装时长
 * 分桶看新用户留存。未记录安装时间（老版本升级）时返回 `-1`。
 */
function readInstalledDays(installedAt: number | null | undefined): number {
  const value = truncateNumber(installedAt)
  if (value === 0) {
    return -1
  }
  return Math.max(0, Math.floor((Date.now() - value) / 86_400_000))
}

/** 读取扩展版本；SW 上下文读不到 manifest 时按空串继续，不让打点失败。 */
function getExtensionVersion(): string {
  try {
    return truncateText(chrome.runtime.getManifest().version, MAX_TEXT_FIELD_LENGTH)
  } catch {
    return ''
  }
}

/** 读取插件端 SLS 配置。 */
export function getSlsMarkConfig(): SlsMarkConfig {
  return ALI_SLS_MARK
}

/** 构造插件端 SLS mark-log 字段。 */
export async function buildSlsMarkFields(
  markType: string,
  markMsg: string,
  options: ExtensionMarkRecordOptions = {}
): Promise<SlsMarkFields> {
  const [deviceId, userId, installedAt] = await Promise.all([
    getDeviceId(),
    getUserId(),
    storageManager.get<number>(STORAGE_KEYS.INSTALLED_AT)
  ])
  return {
    event: 'mark-log',
    site: 'extension',
    client_product: getSlsMarkConfig().clientProduct,
    extension_version: getExtensionVersion(),
    mark_type: truncateText(markType, MAX_TEXT_FIELD_LENGTH),
    mark_msg: buildSlsMarkMessage(markMsg),
    device_id: truncateText(deviceId, MAX_TEXT_FIELD_LENGTH),
    user_id: userId,
    surface: options.surface ?? inferMarkSurface(options.pageUrl),
    page_path: getRuntimePagePath(options.pageUrl),
    mark_time: String(Date.now()),
    first_opened_at: truncateNumber(installedAt),
    first_opened_days: readInstalledDays(installedAt),
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

/** 执行插件端 SLS WebTracking 请求，返回本次是否实际发送。 */
export async function sendExtensionMarkToSls(
  markType: string,
  markMsg: string,
  options: ExtensionMarkRecordOptions = {}
): Promise<boolean> {
  const config = getSlsMarkConfig()
  if (!config.enabled) {
    return false
  }

  const response = await fetch(
    buildSlsMarkUrl(config, await buildSlsMarkFields(markType, markMsg, options)),
    {
      method: 'GET',
      credentials: 'omit',
      keepalive: true
    }
  )

  if (!response.ok) {
    throw new Error(
      `[ExtensionSlsMark] WebTracking failed: status=${response.status}, statusText=${response.statusText}, mark_type=${markType}`
    )
  }

  return true
}
