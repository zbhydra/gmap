/**
 * 通用下载工作区 snapshot 存储。
 *
 * 流程：
 * 1. 解析成功后保存最后一次解析结果和 owner。
 * 2. 播放器状态变化后保存可恢复的播放会话信息。
 * 3. 页面初始化时校验版本、owner、过期时间、容量和隐私白名单。
 */

import { assertDownloadMode, UnsupportedDownloadModeError } from './download-methods'
import { isMediaPlatform } from './platform'
import type { DownloadMode, MediaCapabilities, MediaPlatform, MediaPost } from './types'
export { DOWNLOAD_WORKSPACE_SNAPSHOT_STORAGE_KEY } from '../../scripts/homepage/runtime-storage-keys'
import { DOWNLOAD_WORKSPACE_SNAPSHOT_STORAGE_KEY } from '../../scripts/homepage/runtime-storage-keys'

/** 旧首页工作区 localStorage key；读取成功后会迁移到 v2 key。 */
const LEGACY_WORKSPACE_SNAPSHOT_STORAGE_KEYS = [
  'homepage:workspace:snapshot',
  'tg_homepage_workspace_snapshot_v1'
] as const

/** snapshot 格式版本；不匹配时丢弃旧内容，避免字段语义错配。 */
const SNAPSHOT_VERSION = 2

/** snapshot 本地保留时间；与 resource token 24 小时有效期对齐。 */
const SNAPSHOT_RETENTION_MS = 24 * 60 * 60 * 1000

/** snapshot 序列化上限；超过 1 MiB 时不写入 localStorage。 */
const SNAPSHOT_MAX_BYTES = 1024 * 1024

/** snapshot 资源数量上限；防止相册或异常解析结果撑爆本地存储。 */
const SNAPSHOT_MAX_RESOURCES = 100

/** snapshot 允许保存的 JSON 标量类型。 */
type JsonPrimitive = string | number | boolean | null
/** snapshot 允许保存的 JSON 对象类型。 */
type JsonObject = { [key: string]: JsonValue | undefined }
/** snapshot 允许保存的 JSON 数组类型。 */
type JsonArray = JsonValue[]
/** snapshot 解析和序列化使用的 JSON 值联合。 */
type JsonValue = JsonPrimitive | JsonObject | JsonArray

/** snapshot 归属。 */
export interface DownloadWorkspaceOwner {
  /** 创建 snapshot 时的主体。 */
  sub: string
  /** 创建 snapshot 时的设备 ID。 */
  deviceId: string
}

/** 最后一次解析结果。 */
export interface DownloadWorkspaceParseSnapshot {
  /** 用户输入的原始链接。 */
  originalLink: string
  /** 后端规范化后的链接。 */
  canonicalLink: string
  /** 可渲染资源列表。 */
  resources: MediaPost[]
}

/** 播放器恢复资源白名单。 */
export interface DownloadWorkspacePlaybackResource {
  /** 资源 ID。 */
  sourceId: string
  /** 服务端签发的资源 token。 */
  resourceToken: string
  /** 文件名。 */
  filename: string
  /** 资源类型。 */
  type: string
  /** 文件大小。 */
  size: number | null
  /** 资源来源链接。 */
  link: string
  /** MIME 类型。 */
  mimeType?: string
  /** 视频时长。 */
  duration?: number
  /** 视频宽度。 */
  width?: number
  /** 视频高度。 */
  height?: number
  /** 平台类型。 */
  platform: MediaPlatform
  /** 下载模式。 */
  downloadMode: DownloadMode
  /** 缩略图地址。 */
  thumbnailUrl?: string
  /** 资源能力声明。 */
  capabilities: MediaCapabilities
}

/** 播放器恢复状态。 */
export interface DownloadWorkspacePlaybackSnapshot {
  /** 播放器是否可见。 */
  visible: boolean
  /** 播放会话 ID。 */
  sessionId: string
  /** 播放会话创建时的 owner sub。 */
  sessionOwnerSub: string
  /** 播放会话业务到期时间，毫秒。 */
  sessionExpiresAtMs: number
  /** 播放资源。 */
  resource: DownloadWorkspacePlaybackResource
  /** 刷新前播放进度。 */
  currentTime: number
  /** 刷新后恢复为暂停。 */
  paused: boolean
}

/** 通用下载工作区 snapshot。 */
export interface DownloadWorkspaceSnapshot {
  /** 格式版本。 */
  version: 2
  /** 更新时间，毫秒。 */
  updatedAtMs: number
  /** snapshot 到期时间，毫秒。 */
  expiresAtMs: number
  /** snapshot 归属。 */
  owner: DownloadWorkspaceOwner
  /** 最后一次解析结果。 */
  parse: DownloadWorkspaceParseSnapshot
  /** 最后一次播放器状态。 */
  playback: DownloadWorkspacePlaybackSnapshot | null
}

/** owner 归一化结果，标记是否从旧 device_id 迁移。 */
interface NormalizedWorkspaceOwner {
  /** 当前可继续使用的 snapshot owner。 */
  owner: DownloadWorkspaceOwner
  /** true 表示读取旧 owner 后已替换为当前 device_id。 */
  migrated: boolean
}

function isRecord(value: JsonValue | undefined): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value: JsonValue | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function finiteNumber(value: JsonValue | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function optionalFiniteNumber(value: JsonValue | undefined): number | undefined {
  const parsed = finiteNumber(value)
  return parsed === null ? undefined : parsed
}

function normalizeCapabilities(
  value: JsonValue | undefined,
  type: string,
  platform: MediaPlatform
): MediaCapabilities {
  const isVideo = type.toLowerCase() === 'video'
  // 播放能力仅限 Telegram 平台（仅 Telegram 有 play-token 后端），与 media-api.ts 保持一致
  const canPlayByDefault = platform === 'telegram' && isVideo
  if (!isRecord(value)) {
    return {
      download: true,
      play: canPlayByDefault
    }
  }

  return {
    download: value.download !== false,
    play: platform === 'telegram' && (value.play === true || (value.play !== false && canPlayByDefault)),
    downloadQueue:
      typeof value.downloadQueue === 'boolean'
        ? value.downloadQueue
        : typeof value.download_queue === 'boolean'
          ? value.download_queue
          : undefined
  }
}

function normalizeDownloadMode(value: JsonValue | undefined, context: string): DownloadMode | null {
  const rawValue = typeof value === 'string' ? value : undefined
  try {
    return assertDownloadMode(rawValue, context)
  } catch (error) {
    if (error instanceof UnsupportedDownloadModeError) {
      console.error(error)
      return null
    }
    throw error
  }
}

function validOwnerSub(sub: string): boolean {
  if (sub.startsWith('user:')) {
    const userId = Number.parseInt(sub.slice('user:'.length), 10)
    return Number.isInteger(userId) && userId > 0 && String(userId) === sub.slice('user:'.length)
  }

  return sub.startsWith('device:') && sub.slice('device:'.length).trim().length > 0
}

function uniqueDeviceIds(deviceId: string, legacyDeviceIds: readonly string[]): string[] {
  return Array.from(new Set([deviceId, ...legacyDeviceIds.map(item => item.trim())]))
    .filter(item => item.length > 0)
}

function normalizePlaybackSessionOwnerSub(
  value: JsonValue | undefined,
  owner: DownloadWorkspaceOwner,
  legacyDeviceIds: readonly string[]
): string | null {
  const rawValue =
    isNonEmptyString(value) ? value.trim() : owner.sub
  if (!validOwnerSub(rawValue)) {
    return null
  }

  if (rawValue.startsWith('device:')) {
    const sessionDeviceId = rawValue.slice('device:'.length)
    return uniqueDeviceIds(owner.deviceId, legacyDeviceIds).includes(sessionDeviceId)
      ? rawValue
      : null
  }

  return owner.sub === rawValue ? rawValue : null
}

function normalizeOwner(
  value: JsonValue | undefined,
  deviceId: string,
  legacyDeviceIds: readonly string[]
): NormalizedWorkspaceOwner | null {
  if (!isRecord(value) || !isNonEmptyString(value.sub) || !isNonEmptyString(value.deviceId)) {
    return null
  }

  const rawOwner = {
    sub: value.sub.trim(),
    deviceId: value.deviceId.trim()
  }

  if (!validOwnerSub(rawOwner.sub)) {
    return null
  }

  if (rawOwner.sub.startsWith('device:') && rawOwner.sub !== `device:${rawOwner.deviceId}`) {
    return null
  }

  const allowedDeviceIds = uniqueDeviceIds(deviceId, legacyDeviceIds)
  if (!allowedDeviceIds.includes(rawOwner.deviceId)) {
    return null
  }

  return {
    owner: {
      sub: rawOwner.sub.startsWith('device:') ? `device:${deviceId}` : rawOwner.sub,
      deviceId
    },
    migrated: rawOwner.deviceId !== deviceId
  }
}

function pickMediaPost(source: MediaPost): MediaPost {
  return {
    sourceId: source.sourceId,
    resourceToken: source.resourceToken,
    filename: source.filename,
    type: source.type,
    size: source.size,
    link: source.link,
    mimeType: source.mimeType,
    duration: source.duration,
    width: source.width,
    height: source.height,
    messageId: source.messageId,
    platform: source.platform,
    downloadMode: source.downloadMode,
    preferredNodeId: source.preferredNodeId,
    thumbnailUrl: source.thumbnailUrl,
    capabilities: {
      download: source.capabilities.download,
      play: source.capabilities.play,
      downloadQueue: source.capabilities.downloadQueue
    }
  }
}

function normalizeMediaPost(value: JsonValue | undefined): MediaPost | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.sourceId) ||
    !isNonEmptyString(value.filename) ||
    !isNonEmptyString(value.type) ||
    !isNonEmptyString(value.link)
  ) {
    return null
  }

  const size = finiteNumber(value.size)
  const type = value.type.trim()
  const rawPlatform = typeof value.platform === 'string' ? value.platform : null
  const platform = isMediaPlatform(rawPlatform) ? rawPlatform : 'telegram'
  const downloadMode = normalizeDownloadMode(
    value.downloadMode,
    `[snapshot] normalizeMediaPost sourceId=${value.sourceId}`
  )
  if (!downloadMode) {
    return null
  }

  const resourceToken = isNonEmptyString(value.resourceToken) ? value.resourceToken.trim() : null
  if (!resourceToken) {
    return null
  }

  return {
    sourceId: value.sourceId.trim(),
    resourceToken,
    filename: value.filename.trim(),
    type,
    size: size === null ? null : Math.max(0, Math.floor(size)),
    link: value.link.trim(),
    mimeType: isNonEmptyString(value.mimeType) ? value.mimeType.trim() : undefined,
    duration: optionalFiniteNumber(value.duration),
    width: optionalFiniteNumber(value.width),
    height: optionalFiniteNumber(value.height),
    messageId:
      typeof value.messageId === 'string' || typeof value.messageId === 'number'
        ? value.messageId
        : undefined,
    platform,
    downloadMode,
    preferredNodeId: optionalFiniteNumber(value.preferredNodeId),
    thumbnailUrl: isNonEmptyString(value.thumbnailUrl) ? value.thumbnailUrl.trim() : undefined,
    capabilities: normalizeCapabilities(value.capabilities, type, platform)
  }
}

function normalizeParse(value: JsonValue | undefined): DownloadWorkspaceParseSnapshot | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.originalLink) ||
    !isNonEmptyString(value.canonicalLink) ||
    !Array.isArray(value.resources) ||
    value.resources.length > SNAPSHOT_MAX_RESOURCES
  ) {
    return null
  }

  const resources: MediaPost[] = []
  for (const item of value.resources) {
    const resource = normalizeMediaPost(item)
    if (!resource) {
      return null
    }
    resources.push(resource)
  }

  return {
    originalLink: value.originalLink.trim(),
    canonicalLink: value.canonicalLink.trim(),
    resources
  }
}

function pickPlaybackResource(resource: DownloadWorkspacePlaybackResource): DownloadWorkspacePlaybackResource {
  return {
    sourceId: resource.sourceId,
    resourceToken: resource.resourceToken,
    filename: resource.filename,
    type: resource.type,
    size: resource.size,
    link: resource.link,
    mimeType: resource.mimeType,
    duration: resource.duration,
    width: resource.width,
    height: resource.height,
    platform: resource.platform,
    downloadMode: resource.downloadMode,
    thumbnailUrl: resource.thumbnailUrl,
    capabilities: {
      download: resource.capabilities.download,
      play: resource.capabilities.play,
      downloadQueue: resource.capabilities.downloadQueue
    }
  }
}

function normalizePlaybackResource(
  value: JsonValue | undefined
): DownloadWorkspacePlaybackResource | null {
  const parsed = normalizeMediaPost(value)
  if (!parsed) {
    return null
  }

  return pickPlaybackResource(parsed)
}

function playbackMatchesParse(
  playback: DownloadWorkspacePlaybackSnapshot,
  parse: DownloadWorkspaceParseSnapshot
): boolean {
  return parse.resources.some(
    resource =>
      resource.link === playback.resource.link &&
      resource.sourceId === playback.resource.sourceId
  )
}

function normalizePlayback(
  value: JsonValue | undefined,
  parse: DownloadWorkspaceParseSnapshot,
  now: number,
  owner: DownloadWorkspaceOwner,
  legacyDeviceIds: readonly string[]
): DownloadWorkspacePlaybackSnapshot | null {
  if (!isRecord(value) || value.visible !== true) {
    return null
  }

  const resource = normalizePlaybackResource(value.resource)
  const sessionExpiresAtMs = finiteNumber(value.sessionExpiresAtMs)
  const sessionOwnerSub = normalizePlaybackSessionOwnerSub(
    value.sessionOwnerSub ?? value.session_owner_sub,
    owner,
    legacyDeviceIds
  )
  if (
    !resource ||
    !isNonEmptyString(value.sessionId) ||
    !sessionOwnerSub ||
    sessionExpiresAtMs === null ||
    sessionExpiresAtMs <= now
  ) {
    return null
  }

  const currentTime = finiteNumber(value.currentTime)
  const playback: DownloadWorkspacePlaybackSnapshot = {
    visible: true,
    sessionId: value.sessionId.trim(),
    sessionOwnerSub,
    sessionExpiresAtMs: Math.floor(sessionExpiresAtMs),
    resource,
    currentTime: currentTime === null ? 0 : Math.max(0, currentTime),
    paused: true
  }

  return playbackMatchesParse(playback, parse) ? playback : null
}

function serializedSize(value: string): number {
  if (typeof Blob === 'function') {
    return new Blob([value]).size
  }

  return value.length
}

function writeSnapshot(snapshot: DownloadWorkspaceSnapshot): boolean {
  const serialized = JSON.stringify(snapshot)
  if (
    snapshot.parse.resources.length > SNAPSHOT_MAX_RESOURCES ||
    serializedSize(serialized) > SNAPSHOT_MAX_BYTES
  ) {
    console.error(new Error('Download workspace snapshot exceeds local size limits.'))
    return false
  }

  try {
    window.localStorage.setItem(DOWNLOAD_WORKSPACE_SNAPSHOT_STORAGE_KEY, serialized)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

function withFreshTimestamps(
  snapshot: Omit<DownloadWorkspaceSnapshot, 'version' | 'updatedAtMs' | 'expiresAtMs'>
): DownloadWorkspaceSnapshot {
  const updatedAtMs = Date.now()
  return {
    version: SNAPSHOT_VERSION,
    updatedAtMs,
    expiresAtMs: updatedAtMs + SNAPSHOT_RETENTION_MS,
    owner: snapshot.owner,
    parse: snapshot.parse,
    playback: snapshot.playback
  }
}

/** 清理旧首页工作区 snapshot。 */
export function clearLegacyDownloadWorkspaceSnapshots(): void {
  for (const key of LEGACY_WORKSPACE_SNAPSHOT_STORAGE_KEYS) {
    window.localStorage.removeItem(key)
  }
}

/** 构造当前工作区 owner。 */
export function buildDownloadWorkspaceOwner(
  deviceId: string,
  userId?: number | null
): DownloadWorkspaceOwner {
  const normalizedDeviceId = deviceId.trim()
  if (typeof userId === 'number' && Number.isInteger(userId) && userId > 0) {
    return {
      sub: `user:${userId}`,
      deviceId: normalizedDeviceId
    }
  }

  return {
    sub: `device:${normalizedDeviceId}`,
    deviceId: normalizedDeviceId
  }
}

/** 判断 snapshot 是否属于当前 owner。 */
export function isDownloadWorkspaceOwnerAllowed(
  snapshot: DownloadWorkspaceSnapshot,
  owner: DownloadWorkspaceOwner
): boolean {
  if (snapshot.owner.deviceId !== owner.deviceId) {
    return false
  }

  if (snapshot.owner.sub.startsWith('device:')) {
    return snapshot.owner.sub === `device:${owner.deviceId}`
  }

  return snapshot.owner.sub === owner.sub
}

/** 读取并校验通用下载工作区 snapshot。 */
export function loadDownloadWorkspaceSnapshot(
  now: number,
  deviceId: string,
  legacyDeviceIds: readonly string[] = []
): DownloadWorkspaceSnapshot | null {
  clearLegacyDownloadWorkspaceSnapshots()
  const raw = window.localStorage.getItem(DOWNLOAD_WORKSPACE_SNAPSHOT_STORAGE_KEY)
  if (!raw) {
    return null
  }

  if (serializedSize(raw) > SNAPSHOT_MAX_BYTES) {
    clearDownloadWorkspaceSnapshot()
    return null
  }

  let parsed: JsonValue
  try {
    parsed = JSON.parse(raw) as JsonValue
  } catch (error) {
    console.error(error)
    clearDownloadWorkspaceSnapshot()
    return null
  }

  if (!isRecord(parsed)) {
    clearDownloadWorkspaceSnapshot()
    return null
  }

  const hasLegacyDownloadRequests = Object.hasOwn(parsed, 'downloadRequests')
  const updatedAtMs = finiteNumber(parsed.updatedAtMs)
  const expiresAtMs = finiteNumber(parsed.expiresAtMs)
  const normalizedOwner = normalizeOwner(parsed.owner, deviceId, legacyDeviceIds)
  const parse = normalizeParse(parsed.parse)
  if (
    parsed.version !== SNAPSHOT_VERSION ||
    updatedAtMs === null ||
    expiresAtMs === null ||
    expiresAtMs <= now ||
    !normalizedOwner ||
    !parse
  ) {
    clearDownloadWorkspaceSnapshot()
    return null
  }

  const playback = normalizePlayback(
    parsed.playback,
    parse,
    now,
    normalizedOwner.owner,
    legacyDeviceIds
  )
  const snapshot: DownloadWorkspaceSnapshot = {
    version: SNAPSHOT_VERSION,
    updatedAtMs: Math.floor(updatedAtMs),
    expiresAtMs: Math.floor(expiresAtMs),
    owner: normalizedOwner.owner,
    parse,
    playback
  }

  if (normalizedOwner.migrated || hasLegacyDownloadRequests) {
    writeSnapshot(snapshot)
  }

  return snapshot
}

/** 写入完整通用下载工作区 snapshot。 */
export function saveDownloadWorkspaceSnapshot(snapshot: DownloadWorkspaceSnapshot): boolean {
  if (snapshot.parse.resources.length > SNAPSHOT_MAX_RESOURCES) {
    console.error(new Error('Download workspace snapshot exceeds local resource limits.'))
    return false
  }

  return writeSnapshot({
    version: SNAPSHOT_VERSION,
    updatedAtMs: snapshot.updatedAtMs,
    expiresAtMs: snapshot.expiresAtMs,
    owner: snapshot.owner,
    parse: {
      originalLink: snapshot.parse.originalLink,
      canonicalLink: snapshot.parse.canonicalLink,
      resources: snapshot.parse.resources.slice(0, SNAPSHOT_MAX_RESOURCES).map(pickMediaPost)
    },
    playback: snapshot.playback
      ? {
          visible: true,
          sessionId: snapshot.playback.sessionId,
          sessionOwnerSub: snapshot.playback.sessionOwnerSub,
          sessionExpiresAtMs: snapshot.playback.sessionExpiresAtMs,
          resource: pickPlaybackResource(snapshot.playback.resource),
          currentTime: snapshot.playback.currentTime,
          paused: true
        }
      : null
  })
}

/** 保存解析结果 snapshot。 */
export function saveDownloadParseSnapshot(
  parse: DownloadWorkspaceParseSnapshot,
  owner: DownloadWorkspaceOwner
): boolean {
  if (parse.resources.length > SNAPSHOT_MAX_RESOURCES) {
    console.error(new Error('Download workspace snapshot exceeds local resource limits.'))
    return false
  }

  return writeSnapshot(
    withFreshTimestamps({
      owner,
      parse: {
        originalLink: parse.originalLink,
        canonicalLink: parse.canonicalLink,
        resources: parse.resources.slice(0, SNAPSHOT_MAX_RESOURCES).map(pickMediaPost)
      },
      playback: null
    })
  )
}

/** 保存播放器恢复 snapshot。 */
export function saveDownloadPlaybackSnapshot(
  playback: DownloadWorkspacePlaybackSnapshot,
  owner: DownloadWorkspaceOwner
): boolean {
  const existing = loadDownloadWorkspaceSnapshot(Date.now(), owner.deviceId)
  if (!existing) {
    return false
  }

  return writeSnapshot(
    withFreshTimestamps({
      owner,
      parse: existing.parse,
      playback: {
        visible: true,
        sessionId: playback.sessionId,
        sessionOwnerSub: playback.sessionOwnerSub,
        sessionExpiresAtMs: playback.sessionExpiresAtMs,
        resource: pickPlaybackResource(playback.resource),
        currentTime: playback.currentTime,
        paused: true
      }
    })
  )
}

/** 清理播放器 snapshot 并保留解析结果。 */
export function clearDownloadPlaybackSnapshot(): void {
  const raw = window.localStorage.getItem(DOWNLOAD_WORKSPACE_SNAPSHOT_STORAGE_KEY)
  if (!raw) {
    return
  }

  let parsed: JsonValue
  try {
    parsed = JSON.parse(raw) as JsonValue
  } catch (error) {
    console.error(error)
    clearDownloadWorkspaceSnapshot()
    return
  }

  if (!isRecord(parsed) || !isRecord(parsed.owner) || !isRecord(parsed.parse)) {
    clearDownloadWorkspaceSnapshot()
    return
  }

  const deviceId = typeof parsed.owner.deviceId === 'string' ? parsed.owner.deviceId : ''
  const snapshot = loadDownloadWorkspaceSnapshot(Date.now(), deviceId)
  if (!snapshot) {
    return
  }

  writeSnapshot(
    withFreshTimestamps({
      owner: snapshot.owner,
      parse: snapshot.parse,
      playback: null
    })
  )
}

/** 清理完整通用下载工作区 snapshot。 */
export function clearDownloadWorkspaceSnapshot(): void {
  window.localStorage.removeItem(DOWNLOAD_WORKSPACE_SNAPSHOT_STORAGE_KEY)
  clearLegacyDownloadWorkspaceSnapshots()
}
