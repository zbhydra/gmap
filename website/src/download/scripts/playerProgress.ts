/**
 * Website Telegram 视频播放进度存储。
 *
 * 流程：
 * 1. 使用规范链接、资源 ID、文件大小生成稳定媒体 key。
 * 2. 播放中按节流策略写入 localStorage。
 * 3. 再次播放同一资源时读取进度并清理 90 天外的旧记录。
 */

import type { MediaPost } from './types'

/** 播放进度 localStorage key。 */
const PLAY_PROGRESS_STORAGE_KEY = 'tg_play_progress_v1'

/** 播放进度记录保留时间。 */
const PLAY_PROGRESS_RETENTION_MS = 90 * 24 * 60 * 60 * 1000

/** 进度保存最小间隔。 */
export const PLAY_PROGRESS_SAVE_INTERVAL_MS = 3_000

/** 用于定位同一媒体资源的稳定身份。 */
export interface TgPlayMediaIdentity {
  /** 稳定媒体 key。 */
  mediaKey: string
  /** 后端规范化后的 Telegram 链接。 */
  canonicalLink: string
  /** Telegram 资源 ID。 */
  sourceId: string
  /** 文件名。 */
  filename: string
  /** 文件大小，参与 key 生成。 */
  fileSize: number
}

/** localStorage 中保存的播放进度记录。 */
export interface TgPlayProgressRecord extends TgPlayMediaIdentity {
  /** 当前播放秒数。 */
  currentTime: number
  /** 视频总时长。 */
  duration: number
  /** 更新时间戳。 */
  updatedAt: number
  /** 视频是否已完整播放。 */
  completed: boolean
}

/** 播放进度存储结构。 */
type TgPlayProgressStore = Record<string, TgPlayProgressRecord>

function loadProgressStore(): TgPlayProgressStore {
  const raw = window.localStorage.getItem(PLAY_PROGRESS_STORAGE_KEY)
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as TgPlayProgressStore
  } catch (caught) {
    console.error(caught)
    return {}
  }
}

function saveProgressStore(store: TgPlayProgressStore): void {
  window.localStorage.setItem(PLAY_PROGRESS_STORAGE_KEY, JSON.stringify(store))
}

function toFiniteSeconds(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0
  }

  return value
}

async function sha256Hex(value: string): Promise<string> {
  const input = new TextEncoder().encode(value)
  const digest = await window.crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** 清理过期播放进度。 */
export function pruneExpiredPlayProgress(now = Date.now()): void {
  const store = loadProgressStore()
  let changed = false

  for (const [key, record] of Object.entries(store)) {
    if (now - record.updatedAt > PLAY_PROGRESS_RETENTION_MS) {
      delete store[key]
      changed = true
    }
  }

  if (changed) {
    saveProgressStore(store)
  }
}

/** 根据解析资源构造播放进度身份。 */
export async function buildPlayMediaIdentity(
  resource: MediaPost
): Promise<TgPlayMediaIdentity> {
  const canonicalLink = resource.link
  const fileSize = Math.max(0, Math.floor(resource.size || 0))
  const mediaKey = await sha256Hex(`${canonicalLink}\n${resource.sourceId}\n${fileSize}`)

  return {
    mediaKey,
    canonicalLink,
    sourceId: resource.sourceId,
    filename: resource.filename,
    fileSize
  }
}

/** 读取可恢复播放进度，已完成记录会重置为从头播放。 */
export function loadPlayProgressForResume(
  identity: TgPlayMediaIdentity
): TgPlayProgressRecord | null {
  const store = loadProgressStore()
  const record = store[identity.mediaKey]

  if (!record) {
    return null
  }

  if (record.completed) {
    store[identity.mediaKey] = {
      ...record,
      currentTime: 0,
      completed: false,
      updatedAt: Date.now()
    }
    saveProgressStore(store)
    return null
  }

  return record
}

/** 写入当前播放进度。 */
export function savePlayProgress(
  identity: TgPlayMediaIdentity,
  video: HTMLVideoElement,
  completed: boolean
): TgPlayProgressRecord {
  const duration = toFiniteSeconds(video.duration)
  const currentTime = completed ? duration : toFiniteSeconds(video.currentTime)
  const record: TgPlayProgressRecord = {
    ...identity,
    currentTime,
    duration,
    updatedAt: Date.now(),
    completed
  }
  const store = loadProgressStore()
  store[identity.mediaKey] = record
  saveProgressStore(store)
  return record
}
