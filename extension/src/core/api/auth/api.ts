/**
 * 认证 API 函数
 *
 * 函数式 API，提供类型安全的调用方式
 */

import { httpClient } from '../index'
import { API, STORAGE_KEYS } from '../config'
import { storageManager } from '../../storage'
import type { UserInfo } from '../../types'
import { logger } from '../../utils/logger'
import { ApiError } from '../client/types'

/** v3 插件登录 exchange 请求（无 Bearer；旧 token 字段供服务端 best-effort 撤销）。 */
export interface ExtensionLoginExchangeParams {
  /** 一次性登录 code（官网确认页签发，经回调 URL fragment 传回）。 */
  code: string
  /** PKCE verifier（须与 code 绑定的 challenge 对应，RFC 7636 字符集）。 */
  code_verifier: string
  /** 旧插件 access token（当前 storage 为空则不携带）。 */
  old_extension_access_token?: string
  /** 旧插件 refresh token（当前 storage 为空则不携带）。 */
  old_extension_refresh_token?: string
}

/** v3 插件登录 exchange 响应合同（后端 ExtensionTokenResponse：token 对 + 用户信息）。 */
export interface ExtensionLoginTokenResponse {
  /** 插件访问令牌。 */
  extension_access_token: string
  /** 插件刷新令牌。 */
  extension_refresh_token: string
  /** 用户信息（user_id 必须为数字）。 */
  user: UserInfo
}

/** auth 三键快照（v3 登录条件提交的比对基准）。 */
export interface AuthStorageSnapshot {
  /** exchange 发起时的 access token。 */
  accessToken: string | null
  /** exchange 发起时的 refresh token。 */
  refreshToken: string | null
  /** exchange 发起时的用户信息。 */
  userInfo: UserInfo | null
}

/** 校验 exchange 响应合同：token 对 + 数字 user_id（HTTP 解析边界，形状外字段信任服务端）。 */
function isExtensionLoginTokenResponse(value: unknown): value is ExtensionLoginTokenResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Partial<ExtensionLoginTokenResponse>
  return (
    typeof candidate.extension_access_token === 'string' &&
    candidate.extension_access_token.length > 0 &&
    typeof candidate.extension_refresh_token === 'string' &&
    candidate.extension_refresh_token.length > 0 &&
    typeof candidate.user === 'object' &&
    candidate.user !== null &&
    typeof candidate.user.user_id === 'number'
  )
}

/** 快照全等判断：token 键值直比；user 为对象，storage 往返后引用必不同，序列化比较。 */
function isSameSnapshot(a: AuthStorageSnapshot, b: AuthStorageSnapshot): boolean {
  return (
    a.accessToken === b.accessToken &&
    a.refreshToken === b.refreshToken &&
    JSON.stringify(a.userInfo) === JSON.stringify(b.userInfo)
  )
}

/**
 * 认证 API 函数集合
 */
export const authApi = {
  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<UserInfo> => {
    const token = await storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) {
      throw new ApiError('No access token available', 401, 'NO_TOKEN')
    }

    const result = await httpClient.get<UserInfo>(API.ENDPOINTS.AUTH_ME)

    // 更新 storage
    await storageManager.set(STORAGE_KEYS.USER_INFO, result)

    return result
  },

  /**
   * 退出登录
   */
  logout: async (): Promise<void> => {
    const token = await storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN)

    if (token) {
      try {
        await httpClient.post<void>(API.ENDPOINTS.AUTH_LOGOUT)
      } catch (err) {
        logger.warn('[AuthApi] Logout request failed:', err)
      }
    }

    // 清除存储
    await storageManager.remove(STORAGE_KEYS.ACCESS_TOKEN)
    await storageManager.remove(STORAGE_KEYS.REFRESH_TOKEN)
    await storageManager.remove(STORAGE_KEYS.USER_INFO)
  },

  /**
   * 获取存储的访问令牌
   */
  getAccessToken: (): Promise<string | null> => {
    return storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
  },

  /**
   * 获取存储的用户信息
   */
  getStoredUserInfo: (): Promise<UserInfo | null> => {
    return storageManager.get<UserInfo>(STORAGE_KEYS.USER_INFO)
  },

  /**
   * 检查是否已认证
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await authApi.getAccessToken()
    const user = await authApi.getStoredUserInfo()
    return !!(token && user)
  },

  /**
   * 清除本地认证信息
   */
  clearLocalAuth: async (): Promise<void> => {
    await storageManager.remove(STORAGE_KEYS.ACCESS_TOKEN)
    await storageManager.remove(STORAGE_KEYS.REFRESH_TOKEN)
    await storageManager.remove(STORAGE_KEYS.USER_INFO)
  },

  /**
   * v3 一次性 code 换插件 token 对（无 Bearer）。
   *
   * skipErrorToast：登录失败由调用方（background 登录 owner）静默收敛为
   * {opened:false}，不走全局错误弹窗。
   */
  exchangeExtensionLogin: async (
    params: ExtensionLoginExchangeParams
  ): Promise<ExtensionLoginTokenResponse> => {
    const data = await httpClient.post<unknown>(
      API.ENDPOINTS.AUTH_EXTENSION_LOGIN_EXCHANGE,
      params,
      {
        requireAuth: false,
        skipErrorToast: true
      }
    )
    if (!isExtensionLoginTokenResponse(data)) {
      throw new ApiError(
        `[AuthApi] extension-login exchange 响应形状非法: ${API.ENDPOINTS.AUTH_EXTENSION_LOGIN_EXCHANGE}`,
        200,
        'INVALID_RESPONSE'
      )
    }
    return data
  },

  /**
   * 读取 auth 三键快照（v3 登录条件提交的比对基准，exchange 发起前调用）。
   */
  getAuthSnapshot: async (): Promise<AuthStorageSnapshot> => {
    const [accessToken, refreshToken, userInfo] = await Promise.all([
      storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
      storageManager.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
      storageManager.get<UserInfo>(STORAGE_KEYS.USER_INFO)
    ])
    return { accessToken, refreshToken, userInfo }
  },

  /**
   * v3 登录结果条件提交：当前三键与快照全等才写入新 token 对（单次
   * chrome.storage.local.set 原子落盘，不写半截态）；不一致返回 false，
   * storage 保持原样（如窗口期内用户已在 popup 登出）。
   */
  applyExtensionLogin: async (
    tokenResponse: ExtensionLoginTokenResponse,
    snapshot: AuthStorageSnapshot
  ): Promise<boolean> => {
    const current = await authApi.getAuthSnapshot()
    if (!isSameSnapshot(current, snapshot)) {
      return false
    }

    await storageManager.setMany({
      [STORAGE_KEYS.ACCESS_TOKEN]: tokenResponse.extension_access_token,
      [STORAGE_KEYS.REFRESH_TOKEN]: tokenResponse.extension_refresh_token,
      [STORAGE_KEYS.USER_INFO]: { ...tokenResponse.user }
    })
    return true
  }
}
