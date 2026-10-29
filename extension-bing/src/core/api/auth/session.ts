/** background 认证提交边界；storage 是会话真相，HTTP 不占用提交队列。 */

import { STORAGE_KEYS } from '../config'
import { storageManager, type StorageValue } from '../../storage'
import type { UserInfo } from '../../types'
import { ApiError } from '../client/types'

export interface AuthTokens {
  accessToken: string | null
  refreshToken: string | null
}

export interface AuthStorageSnapshot extends AuthTokens {
  userInfo: UserInfo | null
}

let authCommit: Promise<void> = Promise.resolve()

async function readSnapshot(): Promise<AuthStorageSnapshot> {
  const [accessToken, refreshToken, userInfo] = await Promise.all([
    storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
    storageManager.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
    storageManager.get<UserInfo>(STORAGE_KEYS.USER_INFO)
  ])
  return { accessToken, refreshToken, userInfo }
}

export function readAuthSnapshot(): Promise<AuthStorageSnapshot> {
  const result = authCommit.then(readSnapshot)
  authCommit = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

export function sameAuthTokens(left: AuthTokens, right: AuthTokens): boolean {
  return left.accessToken === right.accessToken && left.refreshToken === right.refreshToken
}

/** 比对与落盘串行执行，避免另一个登录/退出插入两者之间。 */
function commitAuth(
  expected: AuthTokens,
  values: Record<string, StorageValue> | null,
  expectedUserInfo?: UserInfo | null
): Promise<boolean> {
  const result = authCommit.then(async () => {
    const current = await readSnapshot()
    if (
      !sameAuthTokens(current, expected) ||
      (expectedUserInfo !== undefined &&
        JSON.stringify(current.userInfo) !== JSON.stringify(expectedUserInfo))
    ) {
      return false
    }
    if (values === null) {
      await storageManager.remove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_INFO
      ])
    } else {
      await storageManager.setMany(values)
    }
    return true
  })
  authCommit = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

export function commitRefreshedTokens(expected: AuthTokens, next: AuthTokens): Promise<boolean> {
  return commitAuth(expected, {
    [STORAGE_KEYS.ACCESS_TOKEN]: next.accessToken,
    [STORAGE_KEYS.REFRESH_TOKEN]: next.refreshToken
  })
}

export function commitUserInfo(expected: AuthTokens, user: UserInfo): Promise<boolean> {
  return commitAuth(expected, { [STORAGE_KEYS.USER_INFO]: { ...user } })
}

export function commitExtensionLogin(
  expected: AuthStorageSnapshot,
  next: { accessToken: string; refreshToken: string; userInfo: UserInfo }
): Promise<boolean> {
  return commitAuth(
    expected,
    {
      [STORAGE_KEYS.ACCESS_TOKEN]: next.accessToken,
      [STORAGE_KEYS.REFRESH_TOKEN]: next.refreshToken,
      [STORAGE_KEYS.USER_INFO]: { ...next.userInfo }
    },
    expected.userInfo
  )
}

export function clearAuthSession(expected: AuthTokens): Promise<boolean> {
  return commitAuth(expected, null)
}

/** 退出读取与删除占用同一队列项，正常刷新不能插入两者之间。 */
export function clearCurrentAuthSession(): Promise<string | null> {
  const result = authCommit.then(async () => {
    const accessToken = await storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
    await storageManager.remove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_INFO
    ])
    return accessToken
  })
  authCommit = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

export function staleAuthRequest(): ApiError {
  const error = new ApiError('[AuthSession] 请求所属登录态已变化，放弃旧请求', 401, 'AUTH_CHANGED')
  error.preserveAuthState = true
  return error
}
