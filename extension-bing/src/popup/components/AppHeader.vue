<template>
  <header class="app-header">
    <h1 class="app-title">{{ t(I18N_KEYS.APP.TITLE) }}</h1>

    <div class="header-actions">
      <!-- 语言切换器 -->
      <LanguageSwitcher />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { COMMON_COLORS } from '@/core/constants/style'
import LanguageSwitcher from './LanguageSwitcher.vue'

// I18n
const { t } = useI18n()
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
