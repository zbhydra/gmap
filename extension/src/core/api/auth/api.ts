/**
 * 认证 API 函数
 *
 * 函数式 API，提供类型安全的调用方式
 */

import { httpClient } from '../index'
import { API, HTTP_HEADERS, STORAGE_KEYS } from '../config'
import { storageManager } from '../../storage'
import type { UserInfo } from '../../types'
import { logger } from '../../utils/logger'
import { ApiError } from '../client/types'

/** 官网 token 换取插件 token 的响应。 */
export interface ExtensionTokenExchangeResponse {
  /** 插件访问令牌。 */
  extension_access_token: string
  /** 插件刷新令牌。 */
  extension_refresh_token: string
  /** 令牌类型。 */
  token_type: string
  /** 访问令牌过期时间（秒）。 */
  expires_in: number
  /** 当前用户信息。 */
  user: UserInfo
}

/** 官网 token 换取插件 token 的请求体。 */
interface ExtensionTokenExchangeRequest {
  /** 当前插件旧 access token，存在时用于后端尽量撤销。 */
  old_extension_access_token?: string
  /** 当前插件旧 refresh token，存在时用于后端尽量撤销。 */
  old_extension_refresh_token?: string
}

/** 确认插件 token 签发响应字段完整，避免异常响应写入半截登录态。 */
function assertExtensionTokenExchangeResponse(
  result: ExtensionTokenExchangeResponse
): ExtensionTokenExchangeResponse {
  if (
    !result.extension_access_token ||
    !result.extension_refresh_token ||
    !result.user ||
    typeof result.user.user_id !== 'number'
  ) {
    throw new ApiError(
      'Extension token exchange returned incomplete auth data',
      500,
      'INVALID_EXTENSION_TOKEN_RESPONSE'
    )
  }

  return result
}

/**
 * 认证 API 函数集合
 */
export const authApi = {
  /**
   * 使用官网 access token 换取插件 token。
   */
  exchangeWebsiteTokenForExtensionAuth: async (
    webAccessToken: string
  ): Promise<ExtensionTokenExchangeResponse> => {
    const oldAccessToken = await storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
    const oldRefreshToken = await storageManager.get<string>(STORAGE_KEYS.REFRESH_TOKEN)
    const requestBody: ExtensionTokenExchangeRequest = {}

    if (oldAccessToken) {
      requestBody.old_extension_access_token = oldAccessToken
    }

    if (oldRefreshToken) {
      requestBody.old_extension_refresh_token = oldRefreshToken
    }

    const result = assertExtensionTokenExchangeResponse(
      await httpClient.post<ExtensionTokenExchangeResponse>(
        API.ENDPOINTS.AUTH_EXTENSION_TOKEN,
        requestBody,
        {
          requireAuth: false,
          skipErrorToast: true,
          skipRequestLog: true,
          preserveAuthOnUnauthorized: true,
          headers: {
            Authorization: HTTP_HEADERS.AUTH_PREFIX + webAccessToken
          }
        }
      )
    )

    await storageManager.setMany({
      [STORAGE_KEYS.ACCESS_TOKEN]: result.extension_access_token,
      [STORAGE_KEYS.REFRESH_TOKEN]: result.extension_refresh_token,
      [STORAGE_KEYS.USER_INFO]: {
        user_id: result.user.user_id,
        email: result.user.email,
        full_name: result.user.full_name,
        avatar_url: result.user.avatar_url,
        created_at: result.user.created_at
      }
    })

    return result
  },

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
  }
}
