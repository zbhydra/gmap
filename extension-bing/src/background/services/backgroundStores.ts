/**
 * background 上下文的 Pinia 装配。
 *
 * background SW 无 Vue 应用宿主，authStore（账号/订阅态落点，016 §4.3）
 * 以显式 Pinia 实例方式在 SW 内使用；popup/content 各自上下文独立装配同
 * 一 store 定义，跨上下文以 chrome.storage（authApi 持久化）为准。
 *
 * 登录/登出都发生在 storage（popup Sign out、openExtensionLogin 提交、
 * 401 清理）：background 监听 auth 三键 onChanged，变化即失效内存态并
 * 重置 hydrate 标记，下次门控查询按 storage 权威重新恢复，杜绝 SW 生命周期
 * 内的陈旧 authenticated/isPro。
 */

import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { STORAGE_KEYS } from '@/core/api'
import { storageManager } from '@/core/storage'
import { useAuthStore } from '@/core/stores/authStore'

/** SW 级 Pinia 单例。 */
let backgroundPinia: Pinia | null = null

/** 是否已从持久化恢复过账号态（auth 三键变化即重置）。 */
let authHydrated = false

/** auth 三键 onChanged 监听是否已安装（SW 生命周期至多一次）。 */
let authStorageWatcherInstalled = false

/** 取 background 上下文的 authStore（首次调用时装配 Pinia 与 storage 监听）。 */
export function getBackgroundAuthStore(): ReturnType<typeof useAuthStore> {
  backgroundPinia ??= createPinia()
  setActivePinia(backgroundPinia)
  installAuthStorageWatcher()
  return useAuthStore(backgroundPinia)
}

/**
 * 确保账号态已从 chrome.storage 恢复（SW 冷启动后内存态为空；登录/登出后
 * onChanged 已失效内存态，同样走这里按 storage 权威重新恢复）。
 * initialize 内部含 token 验活，失败自行清理，不抛出。
 */
export async function ensureAuthStoreHydrated(): Promise<void> {
  const store = getBackgroundAuthStore()
  if (authHydrated || store.isAuthenticated) {
    return
  }
  authHydrated = true
  await store.initialize()
}

/** 安装 auth 三键 storage 监听：任何变化都清 background 内存态并重置 hydrate。 */
function installAuthStorageWatcher(): void {
  if (authStorageWatcherInstalled) {
    return
  }
  authStorageWatcherInstalled = true
  for (const key of [
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER_INFO
  ]) {
    storageManager.onChanged(key, () => {
      authHydrated = false
      getBackgroundAuthStore().clearAuth()
    })
  }
}
