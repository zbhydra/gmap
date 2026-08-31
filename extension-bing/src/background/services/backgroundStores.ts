/**
 * background 上下文的 Pinia 装配。
 *
 * background SW 无 Vue 应用宿主，authStore（账号/订阅态落点，016 §4.3）
 * 以显式 Pinia 实例方式在 SW 内使用；popup/content 各自上下文独立装配同
 * 一 store 定义，跨上下文以 chrome.storage（authApi 持久化）为准。
 */

import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { useAuthStore } from '@/core/stores/authStore'

/** SW 级 Pinia 单例。 */
let backgroundPinia: Pinia | null = null

/** 是否已从持久化恢复过账号态（每次 SW 生命周期至多一次）。 */
let authHydrated = false

/** 取 background 上下文的 authStore（首次调用时装配 Pinia）。 */
export function getBackgroundAuthStore(): ReturnType<typeof useAuthStore> {
  backgroundPinia ??= createPinia()
  setActivePinia(backgroundPinia)
  return useAuthStore(backgroundPinia)
}

/**
 * 确保账号态已从 chrome.storage 恢复（SW 冷启动后内存态为空，登录桥消息
 * 只在官网登录时到达；门控查询必须能独立恢复持久化态）。
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
