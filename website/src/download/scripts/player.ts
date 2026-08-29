/**
 * Website Telegram 视频播放器控制器。
 *
 * 流程：
 * 1. 创建播放会话并把 token 写入 Service Worker。
 * 2. 使用 video 原生 controls 播放 /_tg-play/{session_id}。
 * 3. 定时刷新 token、重建 12 小时会话并恢复本地播放进度。
 */

import { HomepageApiError, isHomepageAuthFailure, type RequestContext } from '../../scripts/homepage/api'
import { reportGA4Event } from '../../scripts/homepage/ga4'
import {
  buildPlayMediaIdentity,
  loadPlayProgressForResume,
  PLAY_PROGRESS_SAVE_INTERVAL_MS,
  pruneExpiredPlayProgress,
  savePlayProgress,
  type TgPlayMediaIdentity
} from './playerProgress'
import {
  setTgPlayServiceWorkerToken,
  subscribeTgPlayTokenMiss
} from './playerServiceWorker'
import {
  createTelegramPlayToken,
  refreshTelegramPlayToken,
  resumeTelegramPlayToken,
} from './telegram-play-api'
import type { MediaPost, PlayTokenSession } from './types'
import type {
  DownloadWorkspacePlaybackSnapshot,
  DownloadWorkspaceSnapshot
} from './snapshot'
import type { DownloadWorkspaceContent } from '../schema'

/** 播放 token 提前刷新窗口。 */
const TOKEN_REFRESH_THRESHOLD_MS = 10 * 60 * 1000

/** 播放 token 刷新失败后的重试间隔。 */
const TOKEN_REFRESH_RETRY_DELAY_MS = 60 * 1000

/** 播放 token 刷新失败后的最小重试间隔，避免临界窗口内紧密重试。 */
const TOKEN_REFRESH_RETRY_MIN_DELAY_MS = 5 * 1000

/** 播放会话提前重建窗口。 */
const SESSION_RECREATE_THRESHOLD_MS = 10 * 60 * 1000

/** 恢复播放时避开片尾的秒数。 */
const RESUME_END_GUARD_SECONDS = 2

/** 恢复播放器 metadata 等待时间。 */
const RESTORE_METADATA_TIMEOUT_MS = 15_000

/** 播放器运行状态。 */
export type DownloadPlayerStatus =
  | 'idle'
  | 'creating_token'
  | 'ready'
  | 'resume_retry'
  | 'refreshing_token'
  | 'recreating_session'
  | 'error'

/** 播放器 DOM 元素集合。 */
export interface DownloadPlayerElements {
  /** 播放器外层容器。 */
  panel: HTMLElement
  /** 当前文件名标题。 */
  title: HTMLElement
  /** HTML5 video 元素。 */
  video: HTMLVideoElement
  /** 状态文本。 */
  status: HTMLElement
  /** 继续播放按钮。 */
  continueButton: HTMLButtonElement
  /** 关闭播放器按钮。 */
  closeButton: HTMLButtonElement
}

/** 播放器请求登录事件。 */
export const DOWNLOAD_PLAYER_AUTH_REQUIRED_EVENT = 'download-player-auth-required'

/** 播放器请求进入 pricing 事件。 */
export const DOWNLOAD_PLAYER_QUOTA_EXCEEDED_EVENT = 'download-player-quota-exceeded'

/** 播放器创建新会话事件。 */
export const DOWNLOAD_PLAYER_SESSION_CREATED_EVENT = 'download-player-session-created'

/** 播放器 snapshot 变更事件。 */
export const DOWNLOAD_PLAYER_SNAPSHOT_CHANGED_EVENT = 'download-player-snapshot-changed'

type DownloadParseCopy = DownloadWorkspaceContent['parse']

interface DownloadPlayerCopy extends DownloadParseCopy {
  /** 自动播放被浏览器拦截后的提示。 */
  playerAutoplayBlocked?: string
  /** 播放失败通用提示。 */
  playerFailed?: string
  /** 播放器准备播放提示。 */
  playerPreparing?: string
  /** 播放器已就绪提示。 */
  playerReady?: string
  /** 播放器重连提示。 */
  playerReconnecting?: string
  /** 播放器恢复完成提示。 */
  playerRestoredPaused?: string
  /** 播放器恢复失败提示。 */
  playerResumeFailed?: string
  /** 播放资源繁忙提示。 */
  playerResourceBusy?: string
  /** 播放会话恢复提示。 */
  playerRestoring?: string
  /** 当前资源不支持播放提示。 */
  playerUnsupported?: string
  /** 继续播放按钮文案。 */
  continuePlayback?: string
  /** 播放次数耗尽提示。 */
  playQuotaExhausted?: string
}

interface DownloadPlayerEventDetail {
  message: string
}

interface ActivePlayState {
  resource: MediaPost
  identity: TgPlayMediaIdentity
  context: RequestContext
  session: PlayTokenSession
  sessionOwnerSub: string
  sourceUrl: string
  usingServiceWorker: boolean
  restoreTime: number
  status: DownloadPlayerStatus
}

interface ResumeRetryState {
  snapshot: DownloadWorkspaceSnapshot
  context: RequestContext
}

interface RestoreFromSnapshotOptions {
  /** 自动恢复失败时只清理本地恢复状态，不展示播放器错误或登录弹窗。 */
  silentFailure?: boolean
}

export interface DownloadPlayerSnapshotChangedDetail {
  playback: DownloadWorkspacePlaybackSnapshot | null
}

function getCopy(copy: DownloadWorkspaceContent, key: keyof DownloadPlayerCopy, fallback: string): string {
  const playerCopy = copy.parse as DownloadPlayerCopy
  const value = playerCopy[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function setHidden(element: HTMLElement, hidden: boolean): void {
  element.hidden = hidden
}

function isPlayableVideo(resource: MediaPost): boolean {
  return (
    resource.type.toLowerCase() === 'video' ||
    resource.mimeType?.toLowerCase().startsWith('video/') === true
  )
}

function dispatchPlayerEvent(
  panel: HTMLElement,
  eventName: string,
  message: string
): void {
  panel.dispatchEvent(
    new CustomEvent<DownloadPlayerEventDetail>(eventName, {
      detail: { message },
      bubbles: true
    })
  )
}

function isAuthError(error: Error): boolean {
  return isHomepageAuthFailure(error)
}

function isPlayQuotaError(error: Error): boolean {
  return error instanceof HomepageApiError && Number(error.code) === 23005
}

function isPlayResourceBusyError(error: Error): boolean {
  return error instanceof HomepageApiError && Number(error.code) === 23010
}

function isPlaySessionUnavailableError(error: Error): boolean {
  return error instanceof HomepageApiError && Number(error.code) === 23009
}

function isPlaySessionExpiredError(error: Error): boolean {
  return error instanceof HomepageApiError && Number(error.code) === 23008
}

function isPermissionDeniedError(error: Error): boolean {
  return error instanceof HomepageApiError && Number(error.code) === 403
}

function isPlayTemporaryBusyError(error: Error): boolean {
  if (!(error instanceof HomepageApiError)) {
    return false
  }

  return error.status === 503 || isPlayResourceBusyError(error) || isPlaySessionUnavailableError(error)
}

function isNetworkPlaybackError(error: Error): boolean {
  return error.name === 'AbortError' || error instanceof TypeError
}

function playbackFailureReason(error: Error): string {
  if (isNetworkPlaybackError(error)) {
    return 'network_error'
  }

  if (isPlaySessionUnavailableError(error)) {
    return 'session_unavailable'
  }

  if (isPlayTemporaryBusyError(error)) {
    return 'resource_busy'
  }

  return error.name || 'api_error'
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Download player restore aborted.', 'AbortError')
  }
}

function buildClientRequestId(): string {
  if (typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID()
  }

  const randomPart = Math.random().toString(16).slice(2)
  return `web-play-${Date.now()}-${randomPart}`
}

function sizeBucket(size: number): string {
  if (size < 50 * 1024 * 1024) {
    return 'lt_50mb'
  }
  if (size < 500 * 1024 * 1024) {
    return 'lt_500mb'
  }
  return 'gte_500mb'
}

function durationBucket(duration?: number): string {
  if (typeof duration !== 'number' || !Number.isFinite(duration)) {
    return 'unknown'
  }
  if (duration < 60) {
    return 'lt_1m'
  }
  if (duration < 600) {
    return 'lt_10m'
  }
  return 'gte_10m'
}

function reportPlayerEvent(name: string, resource: MediaPost, extra: Record<string, string | number> = {}): void {
  reportGA4Event(name, {
    source_type: 'video',
    size_bucket: sizeBucket(resource.size ?? 0),
    duration_bucket: durationBucket(resource.duration),
    ...extra
  })
}

/** Website Telegram 播放器控制器。 */
export class DownloadTelegramPlayer {
  private active: ActivePlayState | null = null
  private readonly elements: DownloadPlayerElements
  private readonly copy: DownloadWorkspaceContent
  private refreshTimer: number | null = null
  private sessionTimer: number | null = null
  private lastProgressSavedAt = 0
  private refreshPromise: Promise<void> | null = null
  private recreatePromise: Promise<void> | null = null
  private mediaErrorRecovering = false
  private openSequence = 0
  private resumeRetry: ResumeRetryState | null = null
  private readonly tokenMissRecoveredSessions = new Set<string>()
  private beforeUnloadListening = false
  private unsubscribeTokenMiss: (() => void) | null = null
  private readonly handleBeforeUnload = (): void => {
    this.saveCurrentProgress(false, true)
  }

  constructor(elements: DownloadPlayerElements, copy: DownloadWorkspaceContent) {
    this.elements = elements
    this.copy = copy

    pruneExpiredPlayProgress()
    this.bindEvents()
  }

  /** 当前是否正在播放同一资源。 */
  async isCurrentResource(resource: MediaPost): Promise<boolean> {
    if (!this.active) {
      return false
    }

    const identity = await buildPlayMediaIdentity(resource)
    return this.active.identity.mediaKey === identity.mediaKey
  }

  /** 打开播放器并播放指定资源。 */
  async open(resource: MediaPost, context: RequestContext, sessionOwnerSub: string): Promise<void> {
    if (!isPlayableVideo(resource)) {
      this.setStatus('error', getCopy(this.copy, 'playerUnsupported', 'This browser cannot play this video.'))
      return
    }

    const identity = await buildPlayMediaIdentity(resource)
    if (this.active?.identity.mediaKey === identity.mediaKey && this.isSessionFresh()) {
      setHidden(this.elements.panel, false)
      this.elements.video.focus()
      return
    }

    reportPlayerEvent('web_video_play_click', resource)
    const openSequence = this.openSequence + 1
    this.openSequence = openSequence
    this.resumeRetry = null
    this.saveCurrentProgress(false, true)
    this.closeActiveMedia(true)
    this.active = null
    this.elements.title.textContent = resource.filename
    setHidden(this.elements.panel, false)
    setHidden(this.elements.continueButton, true)
    this.setStatus('creating_token', getCopy(this.copy, 'playerPreparing', 'Preparing playback...'))

    const progress = loadPlayProgressForResume(identity)
    const restoreTime = progress?.currentTime && progress.currentTime > 0 ? progress.currentTime : 0

    try {
      const session = await createTelegramPlayToken(
        resource.link,
        resource.sourceId,
        buildClientRequestId(),
        context
      )
      if (openSequence !== this.openSequence) {
        return
      }

      this.active = {
        resource,
        identity,
        context,
        session,
        sessionOwnerSub,
        sourceUrl: '',
        usingServiceWorker: false,
        restoreTime,
        status: 'creating_token'
      }
      this.startActiveListeners()
      this.elements.panel.dispatchEvent(
        new CustomEvent(DOWNLOAD_PLAYER_SESSION_CREATED_EVENT, { bubbles: true })
      )
      reportPlayerEvent('web_video_token_created', resource)
      await this.attachSession(session, restoreTime, true)
    } catch (caught) {
      if (caught instanceof Error) {
        console.error(caught)
        this.handleApiFailure(caught)
        return
      }

      const error = new Error('Telegram player failed while creating the play token.')
      console.error(error)
      this.setStatus('error', getCopy(this.copy, 'playerFailed', 'Playback failed.'))
    }
  }

  /** 导出当前播放器 snapshot。 */
  exportSnapshot(): DownloadWorkspacePlaybackSnapshot | null {
    if (!this.active) {
      return null
    }

    const currentTime = Number.isFinite(this.elements.video.currentTime)
      ? this.elements.video.currentTime
      : this.active.restoreTime

    return {
      visible: true,
      sessionId: this.active.session.sessionId,
      sessionOwnerSub: this.active.sessionOwnerSub,
      sessionExpiresAtMs: this.active.session.sessionExpiresAt * 1000,
      resource: {
        sourceId: this.active.resource.sourceId,
        resourceToken: this.active.resource.resourceToken,
        filename: this.active.resource.filename,
        type: this.active.resource.type,
        size: this.active.resource.size,
        link: this.active.resource.link,
        mimeType: this.active.resource.mimeType,
        duration: this.active.resource.duration,
        width: this.active.resource.width,
        height: this.active.resource.height,
        platform: this.active.resource.platform,
        downloadMode: this.active.resource.downloadMode,
        thumbnailUrl: this.active.resource.thumbnailUrl,
        capabilities: this.active.resource.capabilities
      },
      currentTime: Math.max(0, currentTime || 0),
      paused: true
    }
  }

  /** 从工作区 snapshot 恢复播放器。 */
  async restoreFromSnapshot(
    snapshot: DownloadWorkspaceSnapshot,
    context: RequestContext,
    signal: AbortSignal,
    options: RestoreFromSnapshotOptions = {}
  ): Promise<boolean> {
    const playback = snapshot.playback
    if (!playback || !playback.visible || playback.sessionExpiresAtMs <= Date.now()) {
      this.dispatchSnapshotChanged(null)
      return false
    }

    const openSequence = this.openSequence + 1
    this.openSequence = openSequence
    this.resumeRetry = null
    this.saveCurrentProgress(false, true)
    this.closeActiveMedia(true)
    this.active = null
    this.elements.title.textContent = playback.resource.filename
    setHidden(this.elements.panel, false)
    setHidden(this.elements.continueButton, true)
    this.setStatus('creating_token', getCopy(this.copy, 'playerRestoring', 'Restoring playback...'))

    const resource: MediaPost = {
      sourceId: playback.resource.sourceId,
      resourceToken: playback.resource.resourceToken,
      filename: playback.resource.filename,
      type: playback.resource.type,
      size: playback.resource.size,
      link: playback.resource.link,
      mimeType: playback.resource.mimeType,
      duration: playback.resource.duration,
      width: playback.resource.width,
      height: playback.resource.height,
      platform: playback.resource.platform,
      downloadMode: playback.resource.downloadMode,
      thumbnailUrl: playback.resource.thumbnailUrl,
      capabilities: playback.resource.capabilities
    }

    try {
      throwIfAborted(signal)
      const identity = await buildPlayMediaIdentity(resource)
      throwIfAborted(signal)
      const progress = loadPlayProgressForResume(identity)
      const restoreTime =
        progress?.currentTime && progress.currentTime > 0
          ? progress.currentTime
          : playback.currentTime
      const session = await resumeTelegramPlayToken(
        playback.sessionId,
        playback.sessionOwnerSub,
        context
      )
      throwIfAborted(signal)
      if (openSequence !== this.openSequence) {
        return false
      }

      this.active = {
        resource,
        identity,
        context,
        session,
        sessionOwnerSub: playback.sessionOwnerSub,
        sourceUrl: '',
        usingServiceWorker: false,
        restoreTime: Math.max(0, restoreTime || 0),
        status: 'creating_token'
      }
      this.startActiveListeners()
      reportPlayerEvent('web_video_session_resume', resource, {
        session_age_seconds: Math.max(0, Math.floor((Date.now() - snapshot.updatedAtMs) / 1000))
      })
      await this.attachSession(session, this.active.restoreTime, false, signal)
      throwIfAborted(signal)
      if (!this.active || openSequence !== this.openSequence) {
        return false
      }

      this.setStatus(
        'ready',
        getCopy(this.copy, 'playerRestoredPaused', 'Ready. Continue from where you left off.')
      )
      this.showContinuePlaybackButton()
      this.dispatchSnapshotChanged(this.exportSnapshot())
      this.waitForRestoreMetadata(signal, options.silentFailure === true)
      return true
    } catch (caught) {
      if (signal.aborted) {
        return false
      }

      const error =
        caught instanceof Error
          ? caught
          : new Error('Telegram player failed while restoring the play session.')
      console.error(error)
      this.handleRestoreFailure(error, snapshot, context, options.silentFailure === true)
      return false
    }
  }

  /** 关闭播放器并保存当前进度。 */
  close(): void {
    this.openSequence += 1
    this.resumeRetry = null
    this.saveCurrentProgress(false, true)
    this.closeActiveMedia(true)
    setHidden(this.elements.panel, true)
    this.elements.title.textContent = ''
    this.elements.status.textContent = ''
    setHidden(this.elements.continueButton, true)
    this.active = null
    this.setStatus('idle', '')
    this.dispatchSnapshotChanged(null)
  }

  /** 释放播放器监听。 */
  destroy(): void {
    this.close()
  }

  private bindEvents(): void {
    this.elements.closeButton.addEventListener('click', () => {
      this.close()
    })

    this.elements.continueButton.addEventListener('click', () => {
      void this.handleContinuePlayback()
    })

    this.elements.video.addEventListener('loadedmetadata', () => {
      this.restoreProgressAfterMetadata()
    })

    this.elements.video.addEventListener('timeupdate', () => {
      const now = Date.now()
      if (now - this.lastProgressSavedAt >= PLAY_PROGRESS_SAVE_INTERVAL_MS) {
        this.saveCurrentProgress(false, false)
        this.lastProgressSavedAt = now
      }
    })

    this.elements.video.addEventListener('pause', () => {
      this.saveCurrentProgress(false, true)
    })

    this.elements.video.addEventListener('seeking', () => {
      this.saveCurrentProgress(false, true)
      if (this.active) {
        reportPlayerEvent('web_video_seek', this.active.resource)
      }
    })

    this.elements.video.addEventListener('ended', () => {
      this.saveCurrentProgress(true, true)
      if (this.active) {
        reportPlayerEvent('web_video_ended', this.active.resource)
      }
    })

    this.elements.video.addEventListener('error', () => {
      void this.handleMediaError()
    })

  }

  private startActiveListeners(): void {
    if (!this.unsubscribeTokenMiss) {
      this.unsubscribeTokenMiss = subscribeTgPlayTokenMiss(sessionId => {
        void this.handleTokenMiss(sessionId)
      })
    }

    if (!this.beforeUnloadListening) {
      window.addEventListener('beforeunload', this.handleBeforeUnload)
      this.beforeUnloadListening = true
    }
  }

  private stopActiveListeners(): void {
    if (this.unsubscribeTokenMiss) {
      this.unsubscribeTokenMiss()
      this.unsubscribeTokenMiss = null
    }

    if (this.beforeUnloadListening) {
      window.removeEventListener('beforeunload', this.handleBeforeUnload)
      this.beforeUnloadListening = false
    }
  }

  private isSessionFresh(): boolean {
    return this.getSessionRemainingMs() > SESSION_RECREATE_THRESHOLD_MS
  }

  private getSessionRemainingMs(): number {
    if (!this.active) {
      return 0
    }

    return this.active.session.sessionExpiresAt * 1000 - Date.now()
  }

  private isSessionInRecreateWindow(): boolean {
    return this.getSessionRemainingMs() <= SESSION_RECREATE_THRESHOLD_MS
  }

  private isActiveReady(): boolean {
    return this.active?.status === 'ready'
  }

  private setStatus(status: DownloadPlayerStatus, message: string): void {
    if (this.active) {
      this.active.status = status
    }

    this.elements.status.textContent = message
    setHidden(this.elements.status, message.length === 0)
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer !== null) {
      window.clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer !== null) {
      window.clearTimeout(this.sessionTimer)
      this.sessionTimer = null
    }
  }

  private clearTimers(): void {
    this.clearRefreshTimer()
    this.clearSessionTimer()
  }

  private scheduleSessionTimers(): void {
    if (!this.active) {
      return
    }

    this.clearTimers()
    const now = Date.now()
    const tokenRefreshAt = this.active.session.tokenExpiresAt * 1000 - TOKEN_REFRESH_THRESHOLD_MS
    const sessionRecreateAt = this.active.session.sessionExpiresAt * 1000 - SESSION_RECREATE_THRESHOLD_MS
    const sessionDelay = Math.max(0, sessionRecreateAt - now)

    if (tokenRefreshAt < sessionRecreateAt) {
      this.refreshTimer = window.setTimeout(() => {
        void this.refreshToken()
      }, Math.max(0, tokenRefreshAt - now))
    }
    this.sessionTimer = window.setTimeout(() => {
      void this.recreateSession()
    }, sessionDelay)
  }

  private scheduleRefreshRetry(): void {
    if (!this.active || this.isSessionInRecreateWindow()) {
      return
    }

    this.clearRefreshTimer()
    const sessionRecreateAt = this.active.session.sessionExpiresAt * 1000 - SESSION_RECREATE_THRESHOLD_MS
    const retryWindowMs = sessionRecreateAt - Date.now()
    const retryDelay = Math.min(
      TOKEN_REFRESH_RETRY_DELAY_MS,
      Math.max(TOKEN_REFRESH_RETRY_MIN_DELAY_MS, retryWindowMs)
    )

    this.refreshTimer = window.setTimeout(() => {
      void this.refreshToken()
    }, retryDelay)
  }

  private async attachSession(
    session: PlayTokenSession,
    restoreTime: number,
    autoPlay: boolean,
    signal?: AbortSignal
  ): Promise<void> {
    if (!this.active) {
      return
    }

    throwIfAborted(signal)
    this.active.session = session
    this.active.restoreTime = restoreTime
    const serviceWorkerReady = await this.writeServiceWorkerToken(session)
    throwIfAborted(signal)
    this.active.usingServiceWorker = serviceWorkerReady
    this.active.sourceUrl = serviceWorkerReady ? session.proxyUrl : session.playUrl
    this.tokenMissRecoveredSessions.delete(session.sessionId)
    this.elements.video.src = this.active.sourceUrl
    this.elements.video.preload = 'metadata'
    this.elements.video.controls = true
    this.elements.video.playsInline = true
    this.elements.video.setAttribute('referrerpolicy', 'strict-origin')
    this.elements.video.load()
    this.setStatus('ready', getCopy(this.copy, 'playerReady', 'Ready to play.'))
    this.scheduleSessionTimers()
    this.dispatchSnapshotChanged(this.exportSnapshot())

    if (autoPlay) {
      await this.playVideo(false)
    }
  }

  private async playVideo(fromContinueButton: boolean): Promise<void> {
    try {
      await this.elements.video.play()
      setHidden(this.elements.continueButton, true)
      if (this.active) {
        reportPlayerEvent('web_video_play_start', this.active.resource)
      }
    } catch (caught) {
      if (caught instanceof Error) {
        console.error(caught)
      } else {
        const error = new Error('Telegram player failed while attempting video playback.')
        console.error(error)
      }
      this.elements.continueButton.textContent = getCopy(this.copy, 'continuePlayback', 'Continue playback')
      setHidden(this.elements.continueButton, false)
      if (!fromContinueButton) {
        this.setStatus(
          'ready',
          getCopy(this.copy, 'playerAutoplayBlocked', 'Tap continue to resume playback.')
        )
      }
    }
  }

  private async handleContinuePlayback(): Promise<void> {
    if (this.resumeRetry) {
      const retry = this.resumeRetry
      this.resumeRetry = null
      const controller = new AbortController()
      await this.restoreFromSnapshot(retry.snapshot, retry.context, controller.signal)
      if (this.isActiveReady()) {
        await this.playVideo(true)
      }
      return
    }

    if (!this.active || this.active.status !== 'error') {
      await this.playVideo(true)
      return
    }

    this.clearRefreshTimer()
    setHidden(this.elements.continueButton, true)
    if (this.isSessionInRecreateWindow()) {
      await this.recreateSession()
    } else {
      await this.refreshToken()
    }

    if (this.isActiveReady()) {
      await this.playVideo(true)
    }
  }

  private dispatchSnapshotChanged(playback: DownloadWorkspacePlaybackSnapshot | null): void {
    this.elements.panel.dispatchEvent(
      new CustomEvent<DownloadPlayerSnapshotChangedDetail>(
        DOWNLOAD_PLAYER_SNAPSHOT_CHANGED_EVENT,
        {
          detail: { playback },
          bubbles: true
        }
      )
    )
  }

  private waitForRestoreMetadata(signal: AbortSignal, silentFailure: boolean): void {
    if (!this.active) {
      return
    }

    const sessionId = this.active.session.sessionId
    let settled = false
    const cleanup = (): void => {
      this.elements.video.removeEventListener('loadedmetadata', handleLoaded)
      this.elements.video.removeEventListener('error', handleError)
      signal.removeEventListener('abort', handleAbort)
      window.clearTimeout(timer)
    }
    const settle = (failed: boolean): void => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      if (failed && this.active?.session.sessionId === sessionId) {
        if (silentFailure) {
          this.clearRestoredPlayback()
          return
        }
        this.setStatus(
          'error',
          getCopy(this.copy, 'playerResumeFailed', 'Could not restore playback session. Please start again.')
        )
        this.showContinuePlaybackButton()
      }
    }
    const handleLoaded = (): void => settle(false)
    const handleError = (): void => settle(true)
    const handleAbort = (): void => settle(false)
    const timer = window.setTimeout(() => settle(true), RESTORE_METADATA_TIMEOUT_MS)

    if (this.elements.video.readyState >= this.elements.video.HAVE_METADATA) {
      settle(false)
      return
    }

    this.elements.video.addEventListener('loadedmetadata', handleLoaded, { once: true })
    this.elements.video.addEventListener('error', handleError, { once: true })
    signal.addEventListener('abort', handleAbort, { once: true })
  }

  private handleRestoreFailure(
    error: Error,
    snapshot: DownloadWorkspaceSnapshot,
    context: RequestContext,
    silentFailure: boolean
  ): void {
    reportPlayerEvent('web_video_session_resume_failed', snapshot.playback?.resource || {
      sourceId: 'unknown',
      resourceToken: '',
      filename: 'unknown',
      type: 'video',
      size: 0,
      link: '',
      platform: 'telegram',
      downloadMode: 'proxy',
      capabilities: {
        download: false,
        play: true
      }
    }, {
      error_reason: playbackFailureReason(error)
    })

    if (silentFailure) {
      this.clearRestoredPlayback()
      return
    }

    if (isAuthError(error)) {
      this.resumeRetry = { snapshot, context }
      this.setStatus('error', error.message)
      dispatchPlayerEvent(this.elements.panel, DOWNLOAD_PLAYER_AUTH_REQUIRED_EVENT, error.message)
      return
    }

    if (isPlaySessionExpiredError(error)) {
      this.resumeRetry = null
      this.dispatchSnapshotChanged(null)
      this.active = null
      setHidden(this.elements.panel, true)
      this.elements.title.textContent = ''
      this.elements.status.textContent = ''
      setHidden(this.elements.continueButton, true)
      return
    }

    if (isPermissionDeniedError(error)) {
      this.resumeRetry = null
      this.dispatchSnapshotChanged(null)
      this.setStatus(
        'error',
        getCopy(this.copy, 'playerResumeFailed', 'Could not restore playback session. Please start again.')
      )
      setHidden(this.elements.continueButton, true)
      return
    }

    this.resumeRetry = { snapshot, context }
    this.setStatus(
      'resume_retry',
      isPlaySessionUnavailableError(error)
        ? getCopy(this.copy, 'playerResourceBusy', 'This resource is busy. Try again later.')
        : getCopy(this.copy, 'playerResumeFailed', 'Could not restore playback session. Please start again.')
    )
    this.showContinuePlaybackButton()
  }

  private clearRestoredPlayback(): void {
    this.openSequence += 1
    this.resumeRetry = null
    this.closeActiveMedia(true)
    this.active = null
    setHidden(this.elements.panel, true)
    this.elements.title.textContent = ''
    this.setStatus('idle', '')
    setHidden(this.elements.continueButton, true)
    this.dispatchSnapshotChanged(null)
  }

  private async writeServiceWorkerToken(session: PlayTokenSession): Promise<boolean> {
    try {
      return await setTgPlayServiceWorkerToken({
        sessionId: session.sessionId,
        token: session.token,
        playUrl: session.playUrl,
        tokenExpiresAt: session.tokenExpiresAt,
        sessionExpiresAt: session.sessionExpiresAt
      })
    } catch (caught) {
      if (caught instanceof Error) {
        console.error(caught)
        return false
      }

      const error = new Error('Telegram player Service Worker token write failed.')
      console.error(error)
      return false
    }
  }

  private restoreProgressAfterMetadata(): void {
    if (!this.active || this.active.restoreTime <= 0) {
      return
    }

    const duration = this.elements.video.duration
    const safeRestoreTime =
      Number.isFinite(duration) && duration > RESUME_END_GUARD_SECONDS
        ? Math.min(this.active.restoreTime, duration - RESUME_END_GUARD_SECONDS)
        : this.active.restoreTime

    if (safeRestoreTime > 0) {
      this.elements.video.currentTime = safeRestoreTime
      reportPlayerEvent('web_video_progress_restore', this.active.resource)
    }

    this.active.restoreTime = 0
  }

  private saveCurrentProgress(completed: boolean, writeSnapshot: boolean): void {
    if (!this.active) {
      return
    }

    savePlayProgress(this.active.identity, this.elements.video, completed)
    if (writeSnapshot) {
      this.dispatchSnapshotChanged(this.exportSnapshot())
    }
  }

  private closeActiveMedia(stopListeners: boolean): void {
    this.clearTimers()
    if (stopListeners) {
      this.stopActiveListeners()
    }
    this.refreshPromise = null
    this.recreatePromise = null
    this.mediaErrorRecovering = false
    this.elements.video.pause()
    this.elements.video.removeAttribute('src')
    this.elements.video.load()
    setHidden(this.elements.continueButton, true)
  }

  private async refreshToken(): Promise<void> {
    if (!this.active) {
      return
    }

    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.refreshTokenInner().finally(() => {
      this.refreshPromise = null
    })

    return this.refreshPromise
  }

  private async refreshTokenInner(): Promise<void> {
    if (!this.active) {
      return
    }

    if (this.isSessionInRecreateWindow()) {
      await this.recreateSession()
      return
    }

    this.setStatus('refreshing_token', getCopy(this.copy, 'playerReconnecting', 'Reconnecting playback...'))

    try {
      const active = this.active
      const sessionId = active.session.sessionId
      const currentSourceUrl = active.sourceUrl
      const wasPlaying = !this.elements.video.paused && !this.elements.video.ended
      const restoreTime = Number.isFinite(this.elements.video.currentTime)
        ? this.elements.video.currentTime
        : active.restoreTime
      const session = await refreshTelegramPlayToken(active.session.token, active.context)

      if (!this.active || this.active.session.sessionId !== sessionId) {
        return
      }

      active.session = session
      const serviceWorkerReady = await this.writeServiceWorkerToken(session)
      active.usingServiceWorker = serviceWorkerReady
      active.sourceUrl = active.usingServiceWorker ? session.proxyUrl : session.playUrl
      if (active.sourceUrl !== currentSourceUrl) {
        active.restoreTime = restoreTime
        this.elements.video.src = active.sourceUrl
        this.elements.video.load()
        if (wasPlaying) {
          await this.playVideo(false)
        }
      }
      this.setStatus('ready', getCopy(this.copy, 'playerReady', 'Ready to play.'))
      this.scheduleSessionTimers()
      reportPlayerEvent('web_video_token_refresh', active.resource)
    } catch (caught) {
      let error: Error
      if (caught instanceof Error) {
        console.error(caught)
        error = caught
      } else {
        error = new Error('Telegram player failed while refreshing the play token.')
        console.error(error)
      }

      if (isAuthError(error)) {
        this.handleApiFailure(error)
        return
      }

      if (this.isSessionInRecreateWindow()) {
        await this.recreateSession()
        return
      }

      this.handleRecoverableRefreshFailure(error)
    }
  }

  private async recreateSession(): Promise<void> {
    if (!this.active) {
      return
    }

    if (!this.isSessionInRecreateWindow()) {
      const error = new Error('Telegram player blocked play session recreation before the 12h expiry window.')
      console.error(error)
      this.handleRecoverableRefreshFailure(error)
      return
    }

    if (this.recreatePromise) {
      return this.recreatePromise
    }

    this.recreatePromise = this.recreateSessionInner().finally(() => {
      this.recreatePromise = null
    })

    return this.recreatePromise
  }

  private async recreateSessionInner(): Promise<void> {
    if (!this.active) {
      return
    }

    const active = this.active
    const wasPlaying = !this.elements.video.paused && !this.elements.video.ended
    const restoreTime = Number.isFinite(this.elements.video.currentTime)
      ? this.elements.video.currentTime
      : active.restoreTime
    this.saveCurrentProgress(false, true)
    this.setStatus(
      'recreating_session',
      getCopy(this.copy, 'playerRestoring', 'Restoring playback...')
    )

    try {
      const session = await createTelegramPlayToken(
        active.resource.link,
        active.resource.sourceId,
        buildClientRequestId(),
        active.context
      )
      this.elements.panel.dispatchEvent(
        new CustomEvent(DOWNLOAD_PLAYER_SESSION_CREATED_EVENT, { bubbles: true })
      )
      reportPlayerEvent('web_video_session_recreate', active.resource)
      await this.attachSession(session, restoreTime, wasPlaying)
    } catch (caught) {
      if (caught instanceof Error) {
        console.error(caught)
        this.handleApiFailure(caught)
        return
      }

      const error = new Error('Telegram player failed while recreating the play session.')
      console.error(error)
      this.setStatus('error', getCopy(this.copy, 'playerFailed', 'Playback failed.'))
    }
  }

  private async handleTokenMiss(sessionId: string): Promise<void> {
    if (!this.active || this.active.session.sessionId !== sessionId) {
      return
    }

    if (this.tokenMissRecoveredSessions.has(sessionId)) {
      this.setStatus('error', getCopy(this.copy, 'playerFailed', 'Playback failed.'))
      this.showContinuePlaybackButton()
      return
    }

    this.tokenMissRecoveredSessions.add(sessionId)
    await this.refreshToken()
  }

  private async handleMediaError(): Promise<void> {
    if (!this.active || this.mediaErrorRecovering) {
      return
    }

    this.mediaErrorRecovering = true
    try {
      if (this.isSessionInRecreateWindow()) {
        await this.recreateSession()
      } else {
        await this.refreshToken()
      }
    } catch (caught) {
      if (caught instanceof Error) {
        console.error(caught)
      } else {
        const error = new Error('Telegram player failed while recovering from a media error.')
        console.error(error)
      }
      this.setStatus('error', getCopy(this.copy, 'playerFailed', 'Playback failed.'))
      if (this.active) {
        reportPlayerEvent('web_video_play_failed', this.active.resource, {
          error_reason: 'media_error'
        })
      }
    } finally {
      this.mediaErrorRecovering = false
    }
  }

  private showContinuePlaybackButton(): void {
    if (!this.active && !this.resumeRetry) {
      return
    }

    this.elements.continueButton.textContent = getCopy(this.copy, 'continuePlayback', 'Continue playback')
    setHidden(this.elements.continueButton, false)
  }

  private handleRecoverableRefreshFailure(error: Error): void {
    const message = isPlayTemporaryBusyError(error)
      ? getCopy(this.copy, 'playerResourceBusy', 'This resource is busy. Try again later.')
      : getCopy(this.copy, 'playerFailed', 'Playback failed.')

    this.setStatus('error', message)
    this.showContinuePlaybackButton()
    this.scheduleRefreshRetry()
    if (this.active) {
      reportPlayerEvent('web_video_play_failed', this.active.resource, {
        error_reason: playbackFailureReason(error)
      })
    }
  }

  private handleApiFailure(error: Error): void {
    if (isAuthError(error)) {
      this.setStatus('error', error.message)
      dispatchPlayerEvent(this.elements.panel, DOWNLOAD_PLAYER_AUTH_REQUIRED_EVENT, error.message)
      return
    }

    if (isPlaySessionExpiredError(error)) {
      this.dispatchSnapshotChanged(null)
      this.setStatus('error', getCopy(this.copy, 'playerSessionExpired', 'Playback session expired. Start playback again.'))
      this.showContinuePlaybackButton()
      return
    }

    if (isPlayQuotaError(error)) {
      this.setStatus('error', getCopy(this.copy, 'playQuotaExhausted', 'Playback quota is used up for today.'))
      dispatchPlayerEvent(
        this.elements.panel,
        DOWNLOAD_PLAYER_QUOTA_EXCEEDED_EVENT,
        getCopy(this.copy, 'playQuotaExhausted', 'Playback quota is used up for today.')
      )
      return
    }

    if (isPlayTemporaryBusyError(error)) {
      this.setStatus('error', getCopy(this.copy, 'playerResourceBusy', 'This resource is busy. Try again later.'))
      this.showContinuePlaybackButton()
      return
    }

    this.setStatus('error', getCopy(this.copy, 'playerFailed', 'Playback failed.'))
    this.showContinuePlaybackButton()
    if (this.active) {
      reportPlayerEvent('web_video_play_failed', this.active.resource, {
        error_reason: playbackFailureReason(error)
      })
    }
  }
}
