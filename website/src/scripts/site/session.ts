/**
 * 站级会话恢复（导航账户入口与 Dashboard 工作区共用的唯一一次 auth/me 结果）。
 *
 * 恢复流程：无本地 token 视为匿名不发请求；有 token 则请求 /me，401 清 token
 * 回匿名，普通网络失败返回 unreachable（不清 token、不误判为退出）。
 *
 * 缓存边界：只缓存可复用结果；unreachable 不缓存，网络恢复后的重试会真正
 * 重新请求。登录成功结果由站级登录控制器经 setSiteSession 直接写入，各消费
 * 方共用同一份数据，不产生第二次 auth/me。
 */

import {
  clearStoredAccessToken,
  getCurrentUser,
  getStoredAccessToken,
  type HomepageUserInfo
} from '../homepage/auth'
import { isHomepageAuthFailure } from '../homepage/api'
import { ensureDeviceId } from '../homepage/device'

/** 站级会话恢复结果。 */
export type SiteSession =
  /** 本地无 token，或 token 已被后端判定失效。 */
  | { status: 'signed-out' }
  /** 已登录，携带当前 token 与用户资料。 */
  | { status: 'signed-in'; token: string; user: HomepageUserInfo }
  /** token 存在但 auth/me 网络失败；保留 token，由调用方展示重试。 */
  | { status: 'unreachable' }

/** 后端判定当前 token 失效（401）时广播的站级事件。 */
export const SITE_SESSION_EXPIRED_EVENT = 'site-session:expired'

let sessionPromise: Promise<SiteSession> | null = null

/** 取共享会话恢复结果；同一页面只发一次 /me（unreachable 结果不缓存）。 */
export function getSiteSession(): Promise<SiteSession> {
  if (!sessionPromise) {
    sessionPromise = restoreSiteSession().then(session => {
      if (session.status === 'unreachable') {
        sessionPromise = null
      }
      return session
    })
  }
  return sessionPromise
}

/** 登录成功时写入共享会话结果，替代各消费方自行恢复。 */
export function setSiteSession(session: SiteSession): void {
  sessionPromise = Promise.resolve(session)
}

/** 登录成功或退出后失效缓存，下一次 getSiteSession 重新恢复。 */
export function invalidateSiteSession(): void {
  sessionPromise = null
}

/** 认证失败（401）统一入口：清本地登录态、失效缓存并广播站级事件。 */
export function notifySessionExpired(): void {
  clearStoredAccessToken()
  invalidateSiteSession()
  window.dispatchEvent(new CustomEvent(SITE_SESSION_EXPIRED_EVENT))
}

async function restoreSiteSession(): Promise<SiteSession> {
  const token = getStoredAccessToken()
  if (!token) {
    return { status: 'signed-out' }
  }

  try {
    const user = await getCurrentUser({ deviceId: await ensureDeviceId(), token })
    return { status: 'signed-in', token, user }
  } catch (error) {
    if (error instanceof Error && isHomepageAuthFailure(error)) {
      clearStoredAccessToken()
      return { status: 'signed-out' }
    }
    console.error(new Error('[site-session] auth/me restore failed.', { cause: error }))
    return { status: 'unreachable' }
  }
}
