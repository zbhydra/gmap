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
  }
}
