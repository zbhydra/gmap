/** background 持久化待上报记录；刷新/SW 重启后使用原键补报，完成结果始终可导出。 */
import { STORAGE_KEYS } from '@/core/api/config'
import { readAuthSnapshot, type AuthTokens } from '@/core/api/auth/session'
import { logger } from '@/core/utils/logger'
import { fetchBingUsage, reportBingUsage } from './usageApi'
import type { BingUsageReport, BingUsageSession } from './types'

// 对齐 backend constants/usage.py 的匿名幂等 TTL；会话早于首次发送，保守限制重放。
const ANONYMOUS_REPLAY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

// 同一 SW 的多标签页读改写串行化，持久化才是重启后的真相。
let pendingOperation: Promise<void> = Promise.resolve()

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = pendingOperation.then(operation)
  pendingOperation = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

async function currentSession(): Promise<{ identity: string; userId: number; tokens: AuthTokens }> {
  const auth = await readAuthSnapshot()
  if (auth.accessToken && auth.userInfo) {
    return {
      identity: `user:${auth.userInfo.user_id}`,
      userId: auth.userInfo.user_id,
      tokens: auth
    }
  }
  const stored = await chrome.storage.local.get(STORAGE_KEYS.DEVICE_ID)
  const deviceId = stored[STORAGE_KEYS.DEVICE_ID]
  if (typeof deviceId !== 'string' || !deviceId) {
    throw new Error('[BingUsage] 月用量查询缺少 background device_id')
  }
  return { identity: `device:${deviceId}`, userId: 0, tokens: auth }
}

async function readPending(): Promise<BingUsageReport[]> {
  const stored = await chrome.storage.local.get<Record<string, BingUsageReport[]>>(
    STORAGE_KEYS.BING_USAGE_PENDING
  )
  return stored[STORAGE_KEYS.BING_USAGE_PENDING] ?? []
}

async function savePending(pending: BingUsageReport[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.BING_USAGE_PENDING]: pending })
}

async function sendPending(report: BingUsageReport, pending: BingUsageReport[]): Promise<void> {
  if (
    report.identity.startsWith('device:') &&
    (!Number.isSafeInteger(report.createdAt) ||
      Date.now() - report.createdAt >= ANONYMOUS_REPLAY_WINDOW_MS)
  ) {
    logger.error(`[BingUsage] 匿名待办超出幂等窗口，停止上报并清理: requestId=${report.requestId}`)
  } else {
    const session = await currentSession()
    if (session.identity !== report.identity) {
      throw new Error(`[BingUsage] 上报身份已变化: requestId=${report.requestId}`)
    }
    await reportBingUsage(report.records, report.requestId, session.tokens, session.userId)
  }
  pending.splice(pending.indexOf(report), 1)
  await savePending(pending)
}

export function getBingUsageSession(): Promise<BingUsageSession> {
  return serialize(async () => {
    const { identity } = await currentSession()
    const pending = await readPending()
    for (const report of [...pending]) {
      if (report.identity === identity) await sendPending(report, pending)
    }
    const session = await currentSession()
    if (session.identity !== identity) {
      throw new Error('[BingUsage] 补报期间身份已变化，请重试')
    }
    const snapshot = await fetchBingUsage(session.tokens, session.userId)
    if ((await currentSession()).identity !== identity) {
      throw new Error('[BingUsage] 查询月用量期间身份已变化，请重试')
    }
    return { ...snapshot, identity }
  })
}

export function completeBingUsageSession(report: BingUsageReport): Promise<void> {
  return serialize(async () => {
    const pending = await readPending()
    const existing = pending.find(
      item => item.requestId === report.requestId && item.identity === report.identity
    )
    if (existing && existing.records !== report.records) {
      throw new Error(`[BingUsage] 同一会话记录数发生变化: requestId=${report.requestId}`)
    }
    if (!existing) {
      pending.push(report)
      await savePending(pending)
    }
    await sendPending(existing ?? report, pending)
  })
}
