/**
 * 插件端未捕获异常上报（SLS-only）。
 *
 * 与 website 的 frontend-error-capture 同口径：同指纹短窗口去重，只报
 * error_name / error_message / 位置，不报堆栈与页面数据。
 *
 * 为什么三个上下文都要装：MV3 的 SW、content、扩展页各自有独立的 JS 环境，
 * 只在其中一处监听会漏掉另外两类的崩溃；而插件线上排障没有后端日志可查，
 * 这是唯一能拿到客户端异常的口子。
 */

import { logger } from '@/core/utils/logger'
import { markApi } from '@/core/api/mark'
import { MARK_TYPE } from '@/core/api/mark/types'
import type { MarkSurface } from '@/core/api/mark/sls'

/** 同一异常指纹的去重窗口；抖动型异常（如页面切换）会在一秒内重复抛出。 */
const DEDUP_WINDOW_MS = 30_000

/** 单个诊断字段上限，与 SLS 文本字段口径一致。 */
const MAX_FIELD_LENGTH = 256

/** 已上报指纹 → 上报时刻。 */
const recentErrors = new Map<string, number>()

/** 进程内只装一次；SW 重启后模块重新求值，监听随之重建。 */
let listenersInstalled = false

/** 安装全局未捕获异常监听；重复调用无副作用。 */
export function installUncaughtErrorMark(surface: MarkSurface): void {
  if (typeof self === 'undefined' || listenersInstalled) {
    return
  }
  listenersInstalled = true

  self.addEventListener('error', event => {
    const error = event instanceof ErrorEvent ? event.error : undefined
    report(surface, {
      kind: 'error_event',
      name: error instanceof Error ? error.name : 'Error',
      message: error instanceof Error ? error.message : truncate(String(event)),
      file: event instanceof ErrorEvent ? event.filename : '',
      line: event instanceof ErrorEvent ? event.lineno : 0
    })
  })

  self.addEventListener('unhandledrejection', event => {
    const reason = (event as PromiseRejectionEvent).reason
    report(surface, {
      kind: 'unhandled_rejection',
      name: reason instanceof Error ? reason.name : typeof reason,
      message: reason instanceof Error ? reason.message : truncate(String(reason)),
      file: '',
      line: 0
    })
  })
}

interface CapturedError {
  kind: 'error_event' | 'unhandled_rejection'
  name: string
  message: string
  file: string
  line: number
}

/** 去重后写入 SLS；上报失败只记本地日志，不产生二次未处理 rejection。 */
function report(surface: MarkSurface, captured: CapturedError): void {
  const fingerprint = `${captured.kind}|${captured.name}|${captured.message}|${captured.file}|${captured.line}`
  const now = Date.now()
  const lastSeen = recentErrors.get(fingerprint)
  if (lastSeen !== undefined && now - lastSeen < DEDUP_WINDOW_MS) {
    return
  }
  recentErrors.set(fingerprint, now)

  const markMsg = [
    `kind=${captured.kind}`,
    `name=${truncate(captured.name)}`,
    `message=${truncate(captured.message)}`,
    captured.file ? `file=${truncate(captured.file)}` : '',
    captured.line ? `line=${captured.line}` : ''
  ]
    .filter(Boolean)
    .join(', ')

  markApi.record(MARK_TYPE.UNCAUGHT_ERROR, markMsg, { surface }).catch(error => {
    logger.error(`[UncaughtErrorMark] 异常打点上报失败: surface=${surface}`, error)
  })
}

/** 裁剪诊断字段；过长的错误消息在 SLS 里不可读且会撑爆查询串。 */
function truncate(value: string): string {
  return value.length > MAX_FIELD_LENGTH ? value.slice(0, MAX_FIELD_LENGTH) : value
}
