/**
 * 下载工作区错误映射。
 *
 * 只做错误分类与文案映射，不触发鉴权、渲染或下载动作。
 */

import { HomepageApiError, isHomepageAuthFailure } from '../../scripts/homepage/api'
import type { DownloadWorkspaceContent } from '../schema'
import { ClientMuxDownloadError } from './client-mux'
import {
  AutoRangeResumeExhaustedError,
  RangeStreamInterruptedError
} from './download-range-stream'
import { DownloadStorageError } from './download-storage-error'
import { UnsupportedDownloadModeError } from './download-methods'
import {
  DirectDownloadHttpError,
  DirectUrlExpiredError
} from './response-download'

const CODE_CREDITS_INSUFFICIENT = 10201
const CODE_RATE_LIMIT_EXCEEDED = 998
const CODE_TG_FLOOD_WAIT = 30010
const CODE_TG_PAID_MEDIA_REQUIRES_STARS = 23011
/** 旧 media 解析接口返回的平台不支持错误码。 */
const CODE_MEDIA_PLATFORM_UNSUPPORTED = 24000
/** parse-v2 解析接口返回的平台不支持错误码。 */
const CODE_MEDIA_PARSE_UNSUPPORTED_PLATFORM = 24031
/** 网站下载文件类型不在媒体白名单内。 */
const CODE_MEDIA_DOWNLOAD_FILE_TYPE_NOT_ALLOWED = 24049
const CODE_TIKTOK_PARSE_FAILED = 24001
const CODE_RATE_LIMIT_EXCEEDED_MEDIA = 24004
const CODE_VIMEO_PARSE_FAILED = 24005
const CODE_X_PARSE_FAILED = 24006
const CODE_INSTAGRAM_PARSE_FAILED = 24007
const CODE_THREADS_PARSE_FAILED = 24008
const CODE_INSTAGRAM_IMAGE_PARSE_FAILED = 24009
const CODE_REDDIT_PARSE_FAILED = 24012
const CODE_DOUYIN_PARSE_FAILED = 24018

/** 下载错误视图模型。 */
export interface DownloadErrorViewModel {
  /** 错误展示类型。 */
  kind: 'message' | 'auth_invalid'
  /** 用户可见文案。 */
  message: string
}

interface ApiErrorLike {
  code?: number | string
}

function hasApiErrorCode(error: Error | string | null): error is Error & ApiErrorLike {
  return error instanceof Error && 'code' in error
}

/** 只把后端数字业务码的 msg 暴露给用户，网络/超时等技术错误继续走兜底文案。 */
function getBusinessErrorMessage(error: HomepageApiError): string | null {
  const code = getApiErrorCode(error)
  if (code === null) {
    return null
  }

  const message = error.message.trim()
  return message.length > 0 ? message : null
}

/** 读取后端业务错误码。 */
export function getApiErrorCode(error: Error | string | null): number | null {
  if (!hasApiErrorCode(error)) {
    return null
  }

  const code = Number(error.code)
  return Number.isFinite(code) ? code : null
}

/** 判断是否为下载配额耗尽。 */
export function isQuotaExceededError(error: Error | string | null): boolean {
  return getApiErrorCode(error) === CODE_CREDITS_INSUFFICIENT
}

/** 判断是否为网站下载文件类型白名单拒绝。 */
export function isUnsafeFileTypeError(error: Error | string | null): boolean {
  return getApiErrorCode(error) === CODE_MEDIA_DOWNLOAD_FILE_TYPE_NOT_ALLOWED
}

/** 判断是否为限流错误。 */
export function isRateLimitError(error: Error | string | null): boolean {
  const code = getApiErrorCode(error)
  return code === CODE_RATE_LIMIT_EXCEEDED || code === CODE_RATE_LIMIT_EXCEEDED_MEDIA
}

/** 判断 Telegram 账号池是否整体处于 FloodWait 冷却。 */
export function isTelegramFloodWaitError(error: Error | string | null): boolean {
  return getApiErrorCode(error) === CODE_TG_FLOOD_WAIT
}

/** 映射错误到本地化文案。 */
export function mapErrorToCopy(
  copy: DownloadWorkspaceContent,
  error: Error | string | null,
  fallback: string
): string {
  const code = getApiErrorCode(error)
  if (
    code === CODE_MEDIA_PLATFORM_UNSUPPORTED ||
    code === CODE_MEDIA_PARSE_UNSUPPORTED_PLATFORM
  ) {
    return copy.errors.unsupportedPlatform ?? fallback
  }
  if (code === CODE_TIKTOK_PARSE_FAILED) {
    return copy.errors.tiktokUnsupported ?? fallback
  }
  if (code === CODE_VIMEO_PARSE_FAILED) {
    return copy.errors.vimeoParseFailed ?? fallback
  }
  if (code === CODE_X_PARSE_FAILED) {
    return copy.errors.xParseFailed ?? fallback
  }
  if (code === CODE_INSTAGRAM_PARSE_FAILED) {
    return copy.errors.instagramParseFailed ?? fallback
  }
  if (code === CODE_INSTAGRAM_IMAGE_PARSE_FAILED) {
    return copy.errors.instagramImageParseFailed ?? copy.errors.instagramParseFailed ?? fallback
  }
  if (code === CODE_THREADS_PARSE_FAILED) {
    return copy.errors.threadsParseFailed ?? fallback
  }
  if (code === CODE_REDDIT_PARSE_FAILED) {
    return copy.errors.redditParseFailed ?? fallback
  }
  if (code === CODE_DOUYIN_PARSE_FAILED) {
    return copy.errors.douyinParseFailed ?? fallback
  }
  if (code === CODE_TG_PAID_MEDIA_REQUIRES_STARS) {
    return error instanceof HomepageApiError ? error.message : fallback
  }
  if (code === CODE_CREDITS_INSUFFICIENT) {
    return copy.errors.quotaExceeded ?? fallback
  }
  if (code === CODE_MEDIA_DOWNLOAD_FILE_TYPE_NOT_ALLOWED) {
    return copy.errors.unsafeFileTypeUseExtension ?? fallback
  }
  if (isRateLimitError(error)) {
    return copy.errors.rateLimitExceeded ?? fallback
  }

  if (
    error instanceof AutoRangeResumeExhaustedError ||
    error instanceof RangeStreamInterruptedError
  ) {
    return copy.errors.downloadNetworkInterrupted ?? copy.errors.downloadFailed ?? fallback
  }

  if (error instanceof DirectUrlExpiredError || error instanceof DirectDownloadHttpError) {
    return copy.errors.downloadFailed ?? fallback
  }

  if (error instanceof UnsupportedDownloadModeError) {
    return copy.errors.unsupportedDownloadMode ?? copy.errors.downloadFailed ?? fallback
  }

  if (error instanceof ClientMuxDownloadError) {
    if (error.reason === 'client_mux_too_large') {
      return copy.errors.clientMuxTooLarge ?? copy.errors.downloadFailed ?? fallback
    }
    if (error.reason === 'track_fetch_failed') {
      return copy.errors.trackFetchFailed ?? copy.errors.downloadFailed ?? fallback
    }
    return copy.errors.clientMuxFailed ?? copy.errors.downloadFailed ?? fallback
  }

  if (error instanceof DownloadStorageError) {
    return error.message
  }

  if (error instanceof HomepageApiError) {
    return getBusinessErrorMessage(error) ?? fallback
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }
  if (typeof error === 'string' && error.length > 0) {
    return error
  }
  return fallback
}

/** 映射下载错误到视图模型。 */
export function mapDownloadErrorToViewModel(
  copy: DownloadWorkspaceContent,
  error: Error | string | null
): DownloadErrorViewModel {
  if (error instanceof Error && isHomepageAuthFailure(error)) {
    return {
      kind: 'auth_invalid',
      message: error.message
    }
  }

  return {
    kind: 'message',
    message: mapErrorToCopy(copy, error, copy.errors.downloadFailed)
  }
}
