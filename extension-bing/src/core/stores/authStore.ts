/**
 * 认证状态管理 Store
 *
 * 管理用户登录状态、用户信息、认证操作，以及 v3 browser identity 登录
 * （006 §3）的提交落点：exchange + 合同校验 + 快照比对条件提交
 * （applyExtensionLogin）与订阅态缓存查询（refreshSubscription，时间戳 +
 * 间隔阈值的 013 拍板机制形态）。
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi, subscriptionApi, STORAGE_KEYS } from '../api'
import type { ExtensionLoginTokenResponse } from '../api/auth/api'
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
 * （applyExtensionLogin）会强制失效重拉，5 分钟只覆盖存量会话的漂移窗口。
 */
const SUBSCRIPTION_CACHE_TTL_MS = 5 * 60 * 1000

/**
 * 登录提交的快照条件：exchange 发起时的三键持久化值。
 * 提交前重读比对全等才写，防止长登录流程中途的登出/换号被覆盖。
 */
interface AuthStorageSnapshot {
  accessToken: string | null
  refreshToken: string | null
  userInfo: UserInfo | null
}

/** 读一次 auth 三键持久化快照（storage 为跨上下文真相，不读内存态）。 */
function readAuthStorageSnapshot(): Promise<AuthStorageSnapshot> {
  return Promise.all([
    storageManager.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
    storageManager.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
    storageManager.get<UserInfo>(STORAGE_KEYS.USER_INFO)
  ]).then(([accessToken, refreshToken, userInfo]) => ({
    accessToken: accessToken ?? null,
    refreshToken: refreshToken ?? null,
    userInfo: userInfo ?? null
  }))
}

/** 三键全等判定（access + refresh + user 逐一比对）。 */
function authSnapshotsEqual(left: AuthStorageSnapshot, right: AuthStorageSnapshot): boolean {
  return (
    left.accessToken === right.accessToken &&
    left.refreshToken === right.refreshToken &&
    JSON.stringify(left.userInfo) === JSON.stringify(right.userInfo)
  )
}

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
          logger.error('[AuthStore] Token validation failed:', err)
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
   * v3 browser identity 登录提交（006 §3 / §4.4）。
   *
   * 语义：exchange 发起前读三键快照 → HTTP exchange（无 Bearer，响应合同
   * 由 authApi 校验）→ 提交前重读快照全等才原子写三键 + 同步内存态。
   * 不全等（登录窗口期间用户已在其他入口登出/换号）→ 抛错放弃写入，
   * 不写半截态；原登录态全程不动。
   *
   * 成功后触发 invalidateSubscription() + refreshSubscription()：
   * 登录态切换 = 订阅判定前提变化，FREE/PRO 门控立即按新账号重拉。
   *
   * @param code 官网确认页签发的一次性 code
   * @param codeVerifier 本次登录发起时生成的 PKCE verifier
   */
  async function applyExtensionLogin(code: string, codeVerifier: string): Promise<void> {
    const snapshot = await readAuthStorageSnapshot()

    const tokenResponse: ExtensionLoginTokenResponse = await authApi.exchangeExtensionLogin({
      code,
      codeVerifier,
      oldAccessToken: snapshot.accessToken,
      oldRefreshToken: snapshot.refreshToken
    })

    const current = await readAuthStorageSnapshot()
    if (!authSnapshotsEqual(current, snapshot)) {
      throw new Error('[AuthStore] extension login 期间登录态已变化，放弃写入（请重新登录）')
    }

    const userInfo = tokenResponse.user
    // spread 为对象字面量类型（带隐式 index signature）适配 setMany 的 StorageValue 约束
    await storageManager.setMany({
      [STORAGE_KEYS.ACCESS_TOKEN]: tokenResponse.extension_access_token,
      [STORAGE_KEYS.REFRESH_TOKEN]: tokenResponse.extension_refresh_token,
      [STORAGE_KEYS.USER_INFO]: { ...userInfo }
    })
    token.value = tokenResponse.extension_access_token
    user.value = userInfo
    logger.info('[AuthStore] Extension login committed for user:', userInfo.user_id)

    // 登录态切换 = 订阅判定前提变化：强制失效，立刻按新账号重拉
    invalidateSubscription()
    void refreshSubscription().catch(error => {
      logger.error('[AuthStore] 登录后刷新订阅状态失败:', error)
    })
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
        logger.error('[AuthStore] 订阅状态查询失败，回退缓存:', err)
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
    applyExtensionLogin,
    refreshSubscription,
    invalidateSubscription,
    $dispose
  }
})
