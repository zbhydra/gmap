<template>
  <header class="app-header">
    <h1 class="app-title">{{ t(I18N_KEYS.APP.TITLE) }}</h1>

    <div class="header-actions">
      <!-- 语言切换器 -->
      <LanguageSwitcher />

      <!-- 登录按钮/用户菜单 -->
      <LoginButton @click="handleOpenWebsiteLogin" @logout="handleLogout" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { useAuthStore } from '@/core/stores/authStore'
import { logger } from '@/core/utils/logger'
import { COMMON_COLORS } from '@/core/constants/style'
import LoginButton from '@/core/components/auth/LoginButton.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { BackgroundChannel } from '@/popup/rpc/background.rpc'
import { toastService } from '@/core/composables/useToast'

// I18n
const { t } = useI18n()

// Stores
const authStore = useAuthStore()

/** Background RPC 客户端。 */
const backgroundClient = new BackgroundChannel()

/**
 * 打开官网统一登录窗口。
 */
async function handleOpenWebsiteLogin(): Promise<void> {
  try {
    const result = await backgroundClient.openExtensionLogin()
    if (!result.opened) {
      toastService.error(t(I18N_KEYS.AUTH.OPEN_LOGIN_FAILED))
      logger.error('[AppHeader] 官网登录窗口未打开')
    }
  } catch (error) {
    logger.error('[AppHeader] 打开官网登录窗口失败:', error)
    toastService.error(t(I18N_KEYS.AUTH.OPEN_LOGIN_FAILED))
  }
}

/**
 * 处理退出登录
 */
async function handleLogout(): Promise<void> {
  try {
    await authStore.logout()
    logger.info('[AppHeader] Logout successful')
  } catch (error) {
    logger.error('[AppHeader] Logout failed:', error)
  }
}
</script>

<style scoped>
.app-header {
  padding: 4px;
  border-bottom: 1px solid v-bind('COMMON_COLORS.GRAY_200');
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: v-bind('COMMON_COLORS.GRAY_50');
  gap: 12px;
}

.app-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: v-bind('COMMON_COLORS.GRAY_900');
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
