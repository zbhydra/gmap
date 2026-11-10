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
import { authApi, subscriptionApi } from '../api'
import type { ExtensionLoginTokenResponse } from '../api/auth/api'
import type { SubscriptionStatus } from '../api/subscription/types'
import type { UserInfo } from '../types'
import { logger } from '../utils/logger'
import { commitExtensionLogin, readAuthSnapshot } from '../api/auth/session'

/**
 * 订阅状态缓存有效期：5 分钟内不重复发 HTTP。
 *
 * 机制沿用 013/订阅域拍板的「storage 存时间戳 + 间隔阈值」形态（内存版），
 * 时长未照搬远程配置的 1 小时：订阅态是计费权益判定，1 小时滞后会让
 * 「官网订阅完成 → 回插件」主路径最长一小时权益不生效；登录事件
 * （applyExtensionLogin）会强制失效重拉，5 分钟只覆盖存量会话的漂移窗口。
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
  let initializationPromise: Promise<void> | null = null

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
   * 付费档显式白名单（已知付费周期 'month'/'quarter'/'year'，U4 计费模型
   * 支持 quarter/year）：'free' 明确免费；'unavailable' 为订阅配置异常，
   * 按免费计权（宁严勿松）。
   */
  const isPro = computed(() => {
    if (!isAuthenticated.value) {
      return false
    }
    return (
      subscription.value?.period === 'month' ||
      subscription.value?.period === 'quarter' ||
      subscription.value?.period === 'year'
    )
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
  function initialize(): Promise<void> {
    initializationPromise ??= (async () => {
      try {
        logger.info('[AuthStore] Initializing')

        const currentUser = await authApi.getAuthState()
        const currentToken = await authApi.getAccessToken()
        if (currentUser && currentToken) {
          user.value = currentUser
          token.value = currentToken
        } else {
          clearAuth()
        }
      } catch (err) {
        logger.error('[AuthStore] Initialization failed:', err)
        clearAuth()
      }
    })().finally(() => {
      initializationPromise = null
    })
    return initializationPromise
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
    const snapshot = await readAuthSnapshot()

    const tokenResponse: ExtensionLoginTokenResponse = await authApi.exchangeExtensionLogin({
      code,
      codeVerifier,
      oldAccessToken: snapshot.accessToken,
      oldRefreshToken: snapshot.refreshToken
    })

    const userInfo = tokenResponse.user
    const committed = await commitExtensionLogin(snapshot, {
      accessToken: tokenResponse.extension_access_token,
      refreshToken: tokenResponse.extension_refresh_token,
      userInfo
    })
    if (!committed) {
      throw new Error('[AuthStore] extension login 期间登录态已变化，放弃写入（请重新登录）')
    }
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
   * 无缓存时抛出查询错误，让 content 保留自己的门控快照。
   *
   * @param options.force true = 跳过 TTL 强制重拉（登录事件等场景）
   */
  async function refreshSubscription(
    options: { force?: boolean } = {}
  ): Promise<SubscriptionStatus | null> {
    if (!isAuthenticated.value) {
      return null
    }

    // 强刷必须另发请求；串行等待避免旧响应在强刷后覆盖新订阅。
    if (options.force && subscriptionPromise) {
      await subscriptionPromise.catch(() => undefined)
      return refreshSubscription(options)
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
        if (subscription.value === null) {
          throw err
        }
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
    subscription,

    // Getters
    isAuthenticated,
    isPro,
    displayName,

    // Actions
    initialize,
    clearAuth,
    applyExtensionLogin,
    refreshSubscription,
    invalidateSubscription,
    $dispose
  }
})
