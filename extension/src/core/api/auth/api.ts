/**
 * 认证 API 函数
 *
 * 函数式 API，提供类型安全的调用方式
 */

import { httpClient } from '../index'
import { API, HTTP_HEADERS } from '../config'
import type { UserInfo } from '../../types'
import { logger } from '../../utils/logger'
import { ApiError } from '../client/types'
import {
  clearAuthSession,
  clearCurrentAuthSession,
  commitExtensionLogin,
  readAuthSnapshot,
  type AuthStorageSnapshot
} from './session'

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

/**
 * 认证 API 函数集合
 */
export const authApi = {
  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<UserInfo> => {
    return httpClient.get<UserInfo>(API.ENDPOINTS.AUTH_ME)
  },

  /** background 验活后只向 UI 返回用户资料；临时故障保留当前会话。 */
  getAuthState: async (): Promise<UserInfo | null> => {
    const snapshot = await readAuthSnapshot()
    if (!snapshot.accessToken || !snapshot.userInfo) {
      if (snapshot.accessToken || snapshot.refreshToken || snapshot.userInfo) {
        await clearAuthSession(snapshot)
      }
      return null
    }
    try {
      await authApi.getCurrentUser()
    } catch (error) {
      logger.error('[AuthApi] 当前会话校验失败:', error)
    }
    const current = await readAuthSnapshot()
    return current.accessToken ? current.userInfo : null
  },

  /** 先退出本地会话，再 best-effort 撤销这次退出所携带的 access token。 */
  logout: async (): Promise<void> => {
    const accessToken = await clearCurrentAuthSession()
    if (accessToken) {
      try {
        await httpClient.post<void>(API.ENDPOINTS.AUTH_LOGOUT, undefined, {
          requireAuth: false,
          skipRetry: true,
          skipErrorToast: true,
          headers: { Authorization: HTTP_HEADERS.AUTH_PREFIX + accessToken }
        })
      } catch (error) {
        logger.error('[AuthApi] Logout request failed:', error)
      }
    }
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
        skipRetry: true,
        skipRequestLog: true,
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
  getAuthSnapshot: readAuthSnapshot,

  /**
   * v3 登录结果条件提交：当前三键与快照全等才写入新 token 对（单次
   * chrome.storage.local.set 原子落盘，不写半截态）；不一致返回 false，
   * storage 保持原样（如窗口期内用户已在 popup 登出）。
   */
  applyExtensionLogin: async (
    tokenResponse: ExtensionLoginTokenResponse,
    snapshot: AuthStorageSnapshot
  ): Promise<boolean> => {
    return commitExtensionLogin(snapshot, {
      accessToken: tokenResponse.extension_access_token,
      refreshToken: tokenResponse.extension_refresh_token,
      userInfo: tokenResponse.user
    })
  }
}
