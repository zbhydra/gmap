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
import LanguageSwitcher from './LanguageSwitcher.vue'

// I18n
const { t } = useI18n()
</script>

<style scoped>
.app-header {
  padding: 4px;
  border-bottom: 1px solid var(--gme-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--gme-surface-2);
  gap: 12px;
}

.app-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gme-text);
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
