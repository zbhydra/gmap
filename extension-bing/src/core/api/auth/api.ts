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
import type { JsonObject, JsonValue } from '../../rpc/types'

/**
 * v3 browser identity exchange 响应合同（后端 ExtensionTokenResponse 结构）。
 */
export interface ExtensionLoginTokenResponse {
  /** 插件访问令牌。 */
  extension_access_token: string
  /** 插件刷新令牌。 */
  extension_refresh_token: string
  /** 登录用户信息（与 /auth/me 同构）。 */
  user: UserInfo
}

/** v3 exchange 请求参数。 */
export interface ExchangeExtensionLoginParams {
  /** 官网确认页签发的一次性 code。 */
  code: string
  /** 插件发起登录时生成的 PKCE verifier。 */
  codeVerifier: string
  /** 旧插件 access token（可选，仅用于服务端 best-effort 撤销）。 */
  oldAccessToken?: string | null
  /** 旧插件 refresh token（可选，仅用于服务端 best-effort 撤销）。 */
  oldRefreshToken?: string | null
}

/** 判断值是否为 JSON 对象。 */
function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 合同不完整的统一错误（拒绝写入，调用方按登录失败处理）。 */
function badExchangeContract(): ApiError {
  return new ApiError(
    '[AuthApi] extension-login exchange 响应合同不完整（缺 token 对或数字 user_id），拒绝写入',
    undefined,
    'EXTENSION_LOGIN_BAD_CONTRACT'
  )
}

/**
 * 校验 v3 exchange 响应合同（token 对 + 数字 user_id，006 §4.3）。
 * 合同不完整即抛错拒绝写入——调用方按失败处理，保持原登录态不写半截。
 */
function parseExtensionLoginResponse(data: JsonValue): ExtensionLoginTokenResponse {
  if (!isJsonObject(data)) {
    throw badExchangeContract()
  }
  const accessToken = data.extension_access_token
  const refreshToken = data.extension_refresh_token
  if (
    typeof accessToken !== 'string' ||
    accessToken.length === 0 ||
    typeof refreshToken !== 'string' ||
    refreshToken.length === 0
  ) {
    throw badExchangeContract()
  }
  const rawUser = data.user
  if (!isJsonObject(rawUser) || typeof rawUser.user_id !== 'number') {
    throw badExchangeContract()
  }
  const userId = rawUser.user_id

  return {
    extension_access_token: accessToken,
    extension_refresh_token: refreshToken,
    user: {
      user_id: userId,
      email: typeof rawUser.email === 'string' ? rawUser.email : null,
      full_name: typeof rawUser.full_name === 'string' ? rawUser.full_name : null,
      avatar_url: typeof rawUser.avatar_url === 'string' ? rawUser.avatar_url : null,
      created_at: typeof rawUser.created_at === 'number' ? rawUser.created_at : 0
    }
  }
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
   * v3 browser identity 登录：一次性 code 换插件 token 对（006 §3 协议合同）。
   *
   * 无 Bearer（public client，凭 code + PKCE verifier 鉴权）；一次性 code
   * 不可重发（禁 5xx 重试）；token 不进请求日志；失败不弹全局 toast——
   * 登录入口（popup/面板）按 {opened:false} 统一静默复位。
   */
  exchangeExtensionLogin: async (
    params: ExchangeExtensionLoginParams
  ): Promise<ExtensionLoginTokenResponse> => {
    const body: Record<string, string> = {
      code: params.code,
      code_verifier: params.codeVerifier
    }
    if (params.oldAccessToken) {
      body.old_extension_access_token = params.oldAccessToken
    }
    if (params.oldRefreshToken) {
      body.old_extension_refresh_token = params.oldRefreshToken
    }

    const data = await httpClient.post<JsonValue>(
      API.ENDPOINTS.AUTH_EXTENSION_LOGIN_EXCHANGE,
      body,
      {
        requireAuth: false,
        skipRetry: true,
        skipRequestLog: true,
        skipErrorToast: true
      }
    )
    return parseExtensionLoginResponse(data)
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
        logger.error('[AuthApi] Logout request failed:', err)
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
