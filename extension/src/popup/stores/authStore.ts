/** popup 只保存认证展示状态，HTTP 与凭据写入由 background 负责。 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { BackgroundChannel } from '../rpc/background.rpc'
import type { UserInfo } from '@/core/types'
import { logger } from '@/core/utils/logger'

export const useAuthStore = defineStore('popupAuth', () => {
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)
  let isInitializing = false

  const isAuthenticated = computed(() => user.value !== null)
  const displayName = computed(() => user.value?.full_name || user.value?.email || '')

  async function initialize(): Promise<void> {
    if (isInitializing) return
    isInitializing = true
    const channel = new BackgroundChannel()
    try {
      user.value = await channel.getAuthState()
    } catch (error) {
      logger.error('[PopupAuth] 读取认证状态失败:', error)
    } finally {
      channel.destroy()
      isInitializing = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    const channel = new BackgroundChannel()
    try {
      await channel.logout()
      await initialize()
    } finally {
      channel.destroy()
      loading.value = false
    }
  }

  function clearAuth(): void {
    user.value = null
  }

  return { user, loading, isAuthenticated, displayName, initialize, logout, clearAuth }
})
