<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <AppHeader />

    <!-- 账号区：未登录 Sign in；已登录 displayName + Sign out -->
    <section class="account-section">
      <template v-if="authStore.isAuthenticated">
        <span class="account-name" :title="authStore.displayName || undefined">
          {{ authStore.displayName }}
        </span>
        <button
          class="account-button"
          type="button"
          :disabled="authStore.loading"
          @click="onSignOut"
        >
          {{ t(I18N_KEYS.AUTH.LOGOUT) }}
        </button>
      </template>
      <template v-else>
        <button
          class="account-button account-button-primary"
          type="button"
          :disabled="signingIn"
          @click="onSignIn"
        >
          {{ t(I18N_KEYS.AUTH.LOGIN) }}
        </button>
      </template>
    </section>

    <!-- 底部联系入口 -->
    <AppFooter />

    <Toast :show="toastState.show" :message="toastState.message" :type="toastState.type" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/core/stores/authStore'
import { authApi, STORAGE_KEYS } from '@/core/api'
import { markApi, MARK_TYPE, type MarkType } from '@/core/api/mark'
import { I18N_KEYS } from '@/core/constants/i18n'
import { storageManager } from '@/core/storage'
import { logger } from '@/core/utils/logger'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import Toast from '@/core/components/Toast.vue'
import { useToast } from '@/core/composables/useToast'
import { BackgroundChannel } from './rpc/background.rpc'

// Stores
const authStore = useAuthStore()
const { toastState } = useToast()
const { t } = useI18n()

/** 登录发起中（RPC 返回/超时前按钮禁用）。 */
const signingIn = ref(false)

// 记录打点（异步，不阻塞业务）
function recordMark(markType: MarkType): void {
  markApi.record(markType).catch(error => {
    logger.error('[Popup] SLS 打点失败:', error)
  })
}

// —— 登录 / 登出 ——

/**
 * 发起 v3 browser identity 登录（background owner RPC）。
 *
 * 完整登录常态超过 RPC 默认 30 秒超时：{opened:false} 或超时都静默复位
 * 按钮态，登录最终结果一律以 storage 三键变化为准（见 watchAuthStorage）。
 */
async function onSignIn(): Promise<void> {
  if (signingIn.value) {
    return
  }
  signingIn.value = true
  const channel = new BackgroundChannel()
  try {
    await channel.openExtensionLogin()
  } catch (error) {
    logger.warn('[Popup] 登录未在 RPC 时限内确认完成:', error)
  } finally {
    channel.destroy()
    signingIn.value = false
  }
}

/** 登出（清插件三键 + 撤销服务端当前 access token）；API 失败也已清本地态。 */
async function onSignOut(): Promise<void> {
  try {
    await authStore.logout()
  } catch (error) {
    logger.warn('[Popup] 登出请求失败（本地态已清除）:', error)
  }
}

// —— 登录态 storage 监听 ——

/** storage.onChanged 退订函数集合（popup 卸载时统一退订）。 */
let unwatchAuthStorage: Array<() => void> = []

/**
 * 登录在 background 完成后，popup 若保持打开需即时刷新 authStore 并重拉
 * 订阅态（登录后 FREE/PRO 归属变化）。三键分批写入会触发多次事件，按
 * 「登录身份是否变化」去重，避免同一会话的 token 刷新重复拉订阅。
 */
async function syncAuthFromStorage(): Promise<void> {
  const [storedUser, storedToken] = await Promise.all([
    authApi.getStoredUserInfo(),
    authApi.getAccessToken()
  ])
  const nextUserId = storedUser && storedToken ? storedUser.user_id : null
  const currentUserId = authStore.isAuthenticated ? (authStore.user?.user_id ?? null) : null
  if (nextUserId === currentUserId) {
    return
  }

  if (storedUser && storedToken) {
    authStore.user = storedUser
    authStore.token = storedToken
    authStore.invalidateSubscription()
    await authStore.refreshSubscription({ force: true })
  } else {
    authStore.clearAuth()
  }
}

function watchAuthStorage(): void {
  unwatchAuthStorage = [
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER_INFO
  ].map(key =>
    storageManager.onChanged(key, () => {
      syncAuthFromStorage().catch(error => {
        logger.warn('[Popup] 登录态 storage 同步失败:', error)
      })
    })
  )
}

// 生命周期
onMounted(async () => {
  // 第一时间记录弹窗打开打点（不等待，不阻塞）
  recordMark(MARK_TYPE.POPUP_OPEN)

  watchAuthStorage()
  await authStore.initialize()
})

onUnmounted(() => {
  for (const unwatch of unwatchAuthStorage) {
    unwatch()
  }
  unwatchAuthStorage = []
})
</script>

<style scoped>
/* 色值一律消费 --gme-* 语义 token（src/styles/tokens.css），亮暗随系统。 */
.app-container {
  width: 100%;
  min-height: var(--popup-min-height);
  display: flex;
  flex-direction: column;
  background: var(--gme-surface);
  color: var(--gme-text);
  font-family: var(--gme-font-body);
}

.account-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--gme-border);
}

.account-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--gme-text);
}

.account-button {
  flex-shrink: 0;
  padding: 5px 14px;
  border: 1px solid var(--gme-border-strong);
  border-radius: var(--gme-rounded-full);
  background: var(--gme-surface);
  color: var(--gme-text);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.account-button:hover:not(:disabled) {
  background: var(--gme-surface-2);
}

.account-button-primary {
  border-color: var(--gme-primary);
  background: var(--gme-primary);
  color: var(--gme-primary-fg);
}

.account-button-primary:hover:not(:disabled) {
  background: var(--gme-primary-hover);
}

.account-button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}
</style>
