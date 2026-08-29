/**
 * 前端平台识别（仅用于埋点）。
 *
 * 最终平台以后端响应为准，前端识别仅提前填充 GA4 event。
 */

import type { DownloadMode, MediaPlatform } from './types'
import { parseUserLink } from './url'

/** Telegram 域名列表。 */
const TELEGRAM_HOSTS = new Set([
  't.me',
  'www.t.me',
  'telegram.me',
  'www.telegram.me'
])

/** Telegram Web 域名列表。 */
const TELEGRAM_WEB_HOSTS = new Set(['web.telegram.org'])

/** TikTok 域名列表。 */
const TIKTOK_HOSTS = new Set([
  'www.tiktok.com',
  'tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'm.tiktok.com'
])

/** Vimeo 域名列表。 */
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'])

/** X/Twitter 域名列表。 */
const X_HOSTS = new Set([
  'x.com',
  'www.x.com',
  'twitter.com',
  'www.twitter.com',
  'mobile.twitter.com'
])

/** Instagram 域名列表。 */
const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com'])

/** Threads 域名列表。 */
const THREADS_HOSTS = new Set([
  'threads.com',
  'www.threads.com',
  'threads.net',
  'www.threads.net'
])

/** Reddit 域名列表。 */
const REDDIT_HOSTS = new Set([
  'reddit.com',
  'www.reddit.com',
  'old.reddit.com',
  'new.reddit.com',
  'redd.it'
])

/** Douyin 域名列表。 */
const DOUYIN_HOSTS = new Set([
  'douyin.com',
  'www.douyin.com',
  'v.douyin.com',
  'www.iesdouyin.com'
])

/**
 * 判断运行时平台值是否属于前端支持范围。
 *
 * @param value - 待判断的平台值
 * @returns true 表示是支持的平台
 */
export function isMediaPlatform(value: string | null | undefined): value is MediaPlatform {
  return (
    value === 'telegram' ||
    value === 'tiktok' ||
    value === 'vimeo' ||
    value === 'x' ||
    value === 'instagram' ||
    value === 'threads' ||
    value === 'reddit' ||
    value === 'douyin'
  )
}

/**
 * 读取平台默认下载模式。
 *
 * @param platform - 平台枚举值
 * @returns 平台默认下载路径
 */
export function resolveDefaultDownloadMode(platform: MediaPlatform): DownloadMode {
  return platform === 'vimeo' ||
    platform === 'x' ||
    platform === 'instagram' ||
    platform === 'threads' ||
    platform === 'reddit' ||
    platform === 'douyin'
    ? 'direct'
    : 'proxy'
}

/**
 * 识别链接所属平台（仅用于埋点，不阻断提交）。
 *
 * @param link - 用户输入的链接
 * @returns 识别到的平台，null 表示无法识别
 */
export function detectPlatform(link: string): MediaPlatform | null {
  const parsed = parseUserLink(link)
  if (!parsed) {
    return null
  }

  const hostname = parsed.hostname.toLowerCase()

  if (parsed.protocol === 'tg:') {
    return hostname === 'join' && parsed.searchParams.has('invite') ? 'telegram' : null
  }

  if (TELEGRAM_HOSTS.has(hostname) || TELEGRAM_WEB_HOSTS.has(hostname)) {
    return 'telegram'
  }

  if (TIKTOK_HOSTS.has(hostname)) {
    return 'tiktok'
  }

  if (VIMEO_HOSTS.has(hostname)) {
    return 'vimeo'
  }

  if (X_HOSTS.has(hostname)) {
    return 'x'
  }

  if (INSTAGRAM_HOSTS.has(hostname)) {
    return 'instagram'
  }

  if (THREADS_HOSTS.has(hostname)) {
    return 'threads'
  }

  if (REDDIT_HOSTS.has(hostname)) {
    return 'reddit'
  }

  if (DOUYIN_HOSTS.has(hostname)) {
    return 'douyin'
  }

  return null
}

/**
 * 判断是否为 Telegram 邀请链接。
 *
 * 邀请链接只能打开或加入频道/群组，不能定位到具体消息，因此网页解析前直接提示用户复制消息链接。
 *
 * @param link - 用户输入的链接
 * @returns true 表示是 Telegram 邀请链接
 */
export function isTelegramInviteLink(link: string): boolean {
  const parsed = parseUserLink(link)
  if (!parsed) {
    return false
  }

  if (parsed.protocol === 'tg:') {
    return parsed.hostname.toLowerCase() === 'join' && parsed.searchParams.has('invite')
  }

  if (!TELEGRAM_HOSTS.has(parsed.hostname.toLowerCase())) {
    return false
  }

  const pathSegments = parsed.pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0] ?? ''
  return (
    (firstSegment.startsWith('+') && firstSegment.length > 1) ||
    (firstSegment === 'joinchat' && pathSegments.length > 1)
  )
}

/**
 * 判断是否为 Telegram 聊天、频道或公开预览入口页。
 *
 * 这类链接只能打开消息列表，不能定位到具体消息，前端应直接展开复制消息链接指引。
 *
 * @param link - 用户输入的链接
 * @returns true 表示是缺少消息 ID 的 Telegram 入口页链接
 */
export function isTelegramMessageListLink(link: string): boolean {
  const parsed = parseUserLink(link)
  if (!parsed || !TELEGRAM_HOSTS.has(parsed.hostname.toLowerCase())) {
    return false
  }

  const pathSegments = parsed.pathname.split('/').filter(Boolean)
  if (pathSegments.length === 1) {
    return /^[A-Za-z0-9_]{5,32}$/.test(pathSegments[0])
  }

  if (pathSegments.length === 2) {
    return (
      (pathSegments[0] === 's' && /^[A-Za-z0-9_]{5,32}$/.test(pathSegments[1])) ||
      (pathSegments[0] === 'c' && /^\d+$/.test(pathSegments[1]))
    )
  }

  return false
}

/**
 * 判断是否为 Telegram 私有频道消息链接。
 *
 * 私有频道消息链接缺少公开 username，后端无法在线解析，应直接引导到插件链路。
 *
 * @param link - 用户输入的链接
 * @returns true 表示是 Telegram 私有频道消息链接
 */
export function isTelegramPrivateChannelMessageLink(link: string): boolean {
  const parsed = parseUserLink(link)
  if (!parsed || !TELEGRAM_HOSTS.has(parsed.hostname.toLowerCase())) {
    return false
  }

  const pathSegments = parsed.pathname.split('/').filter(Boolean)
  if (pathSegments.length === 3) {
    return (
      pathSegments[0] === 'c' &&
      /^\d+$/.test(pathSegments[1]) &&
      /^\d+$/.test(pathSegments[2])
    )
  }

  if (pathSegments.length === 4) {
    return (
      pathSegments[0] === 'c' &&
      /^\d+$/.test(pathSegments[1]) &&
      /^\d+$/.test(pathSegments[2]) &&
      /^\d+$/.test(pathSegments[3])
    )
  }

  return false
}

/**
 * 判断是否为 Telegram Web 页面链接。
 *
 * Telegram Web 页面链接依赖用户浏览器会话，网页解析器无法直接读取，应引导安装插件处理。
 *
 * @param link - 用户输入的链接
 * @returns true 表示是 Telegram Web 页面链接
 */
export function isTelegramWebLink(link: string): boolean {
  const parsed = parseUserLink(link)
  return parsed ? TELEGRAM_WEB_HOSTS.has(parsed.hostname.toLowerCase()) : false
}
