/**
 * 认证状态管理 Store
 *
 * 管理用户登录状态、用户信息和认证操作，以及 U4 官网登录桥（016 §5）的
 * 账号/订阅态落点：官网 web token 校验收编（applyWebsiteToken）与订阅态
 * 缓存查询（refreshSubscription，时间戳 + 间隔阈值的 013 拍板机制形态）。
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi, subscriptionApi, STORAGE_KEYS } from '../api'
import type { SubscriptionStatus } from '../api/subscription/types'
import type { UserInfo } from '../types'
import { logger } from '../utils/logger'
import { isAuthSessionFailure } from '../api/auth/sessionFailure'
import { storageManager } from '../storage'

/**
 * 订阅状态缓存有效期：5 分钟内不重复发 HTTP。
 *
 * 机制沿用 013/订阅域拍板的「storage 存时间戳 + 间隔阈值」形态（内存版），
 * 时长未照搬远程配置的 1 小时：订阅态是计费权益判定，1 小时滞后会让
 * 「官网订阅完成 → 回插件」主路径最长一小时权益不生效；登录事件
 * （applyWebsiteToken）会强制失效重拉，5 分钟只覆盖存量会话的漂移窗口。
 */
const SUBSCRIPTION_CACHE_TTL_MS = 5 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  // ============================================================================
  // 状态
  // ============================================================================

  /** 用户信息 */
  const user = ref<UserInfo | null>(null)
  /** 访问令牌 */
  const token = ref<string | null>(null)
  /** 订阅状态（登录态下经 subscriptionApi 查询；null = 未查询/无缓存） */
  const subscription = ref<SubscriptionStatus | null>(null)
  /** 是否正在加载 */
  const loading = ref<boolean>(false)
  /** 初始化中标志（防止并发调用） */
  let isInitializing = false

  /** 订阅缓存拉取时间戳（0 = 无缓存）。 */
  let subscriptionFetchedAt = 0
  /** 订阅拉取单飞 Promise（并发去重）。 */
  let subscriptionPromise: Promise<SubscriptionStatus | null> | null = null

  // ============================================================================
  // Getters
  // ============================================================================

  /** 是否已认证 */
  const isAuthenticated = computed(() => {
    return !!(user.value && token.value)
  })

  /**
   * 是否 Pro（免费/Pro 门控判定，016 §5）。
   *
   * 付费档显式白名单（period 已知值只有 'month'）：'free' 明确免费；
   * 'unavailable' 为订阅配置异常，按免费计权（宁严勿松）。
   */
  const isPro = computed(() => {
    if (!isAuthenticated.value) {
      return false
    }
    return subscription.value?.period === 'month'
  })

  /** 用户显示名称（优先使用 full_name，其次 email） */
  const displayName = computed(() => {
    if (!user.value) {
      return ''
    }
    return user.value.full_name || user.value.email || ''
  })

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 初始化 Store
   * 从本地存储恢复认证状态
   */
  async function initialize(): Promise<void> {
    // 防止并发调用
    if (isInitializing) {
      logger.debug('[AuthStore] Already initializing, skipping')
      return
    }

    try {
      isInitializing = true
      logger.info('[AuthStore] Initializing')

      // 从本地存储恢复状态
      const storedUser = await authApi.getStoredUserInfo()
      const storedToken = await authApi.getAccessToken()

      if (storedUser && storedToken) {
        user.value = storedUser
        token.value = storedToken
        logger.info('[AuthStore] Restored authentication for user:', storedUser.user_id)
      } else if (storedUser || storedToken) {
        await authApi.clearLocalAuth()
      }

      if (isAuthenticated.value) {
        try {
          const currentUser = await authApi.getCurrentUser()
          user.value = currentUser
          logger.info('[AuthStore] Token validated, user updated')
        } catch (err) {
          logger.warn('[AuthStore] Token validation failed:', err)
          if (err instanceof Error && isAuthSessionFailure(err)) {
            await authApi.clearLocalAuth()
            clearAuth()
          }
        }
      }
    } catch (err) {
      logger.error('[AuthStore] Initialization failed:', err)
      clearAuth()
    } finally {
      isInitializing = false
    }
  }

  /**
   * 退出登录
   */
  async function logout(): Promise<void> {
    try {
      loading.value = true

      await authApi.logout()

      clearAuth()

      logger.info('[AuthStore] Logout successful')
    } catch (err) {
      logger.error('[AuthStore] Logout failed:', err)
      // 即使 API 调用失败，也清除本地状态
      clearAuth()
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 官网登录桥 token 收编（016 §5 BING_MAPS_EXTENSION_AUTH_CHANGED）。
   *
   * 校验口径 = 官网 getCurrentUser：token 先落自有 chrome.storage（HTTP 拦截器
   * 从 storage 注入），调既有 authApi.getCurrentUser（GET /api/client/auth/me）
   * 验活；有效则 USER_INFO 已由 authApi 持久化并失效订阅缓存重拉。
   *
   * 失败回滚 = 仅撤销本次写入：进入前快照旧 token/USER_INFO（内存优先、
   * storage 兜底），校验失败恢复快照——既有会话不受一条坏消息影响，瞬时
   * 网络失败不登出用户；无既有会话时回滚 = 清净本次写入的残留。
   *
   * @param webAccessToken 官网同步来的 access token（非空由调用方保证）
   */
  async function applyWebsiteToken(webAccessToken: string): Promise<void> {
    const previousToken = token.value ?? (await authApi.getAccessToken())
    const previousUser = user.value ?? (await authApi.getStoredUserInfo())

    token.value = webAccessToken
    await storageManager.set(STORAGE_KEYS.ACCESS_TOKEN, webAccessToken)

    try {
      user.value = await authApi.getCurrentUser()
      logger.info('[AuthStore] Website token validated for user:', user.value.user_id)
      // 登录态切换 = 订阅判定前提变化：强制失效，立刻按新账号重拉
      invalidateSubscription()
      void refreshSubscription().catch(() => undefined)
    } catch (err) {
      logger.warn('[AuthStore] Website token validation failed, rolling back this write')
      if (previousToken) {
        token.value = previousToken
        user.value = previousUser
        // 401 拦截器可能已清 storage：按快照恢复既有会话
        await storageManager.set(STORAGE_KEYS.ACCESS_TOKEN, previousToken).catch(() => undefined)
        if (previousUser) {
          await storageManager.set(STORAGE_KEYS.USER_INFO, previousUser).catch(() => undefined)
        }
      } else {
        await authApi.clearLocalAuth().catch(() => undefined)
        clearAuth()
      }
      throw err
    }
  }

  /**
   * 查询订阅状态（缓存 TTL 内直读缓存；登录态下才查询）。
   *
   * 查询失败回退上一次缓存（可能过期）：门控判定宁可慢半拍不闪断，
   * 完全无缓存时返回 null（调用方按免费计权）。
   *
   * @param options.force true = 跳过 TTL 强制重拉（登录事件等场景）
   */
  async function refreshSubscription(
    options: { force?: boolean } = {}
  ): Promise<SubscriptionStatus | null> {
    if (!isAuthenticated.value) {
      return null
    }

    const cached = subscription.value
    const cacheValid =
      cached !== null && Date.now() - subscriptionFetchedAt < SUBSCRIPTION_CACHE_TTL_MS
    if (cacheValid && options.force !== true) {
      return cached
    }

    subscriptionPromise ??= subscriptionApi
      .getStatus()
      .then(status => {
        subscription.value = status
        subscriptionFetchedAt = Date.now()
        return status
      })
      .catch(err => {
        logger.warn('[AuthStore] 订阅状态查询失败，回退缓存:', err)
        return subscription.value
      })
      .finally(() => {
        subscriptionPromise = null
      })
    return subscriptionPromise
  }

  /** 失效订阅缓存（登录态切换等场景），下一次查询强制走网络。 */
  function invalidateSubscription(): void {
    subscription.value = null
    subscriptionFetchedAt = 0
  }

  /**
   * 清除认证状态
   */
  function clearAuth(): void {
    user.value = null
    token.value = null
    invalidateSubscription()
  }

  /**
   * Store 销毁时的清理
   */
  function $dispose(): void {
    logger.info('[AuthStore] Disposing store')
    clearAuth()
  }

  // ============================================================================
  // 返回
  // ============================================================================

  return {
    // 状态
    user,
    token,
    loading,
    subscription,

    // Getters
    isAuthenticated,
    isPro,
    displayName,

    // Actions
    initialize,
    logout,
    clearAuth,
    applyWebsiteToken,
    refreshSubscription,
    invalidateSubscription,
    $dispose
  }
})
