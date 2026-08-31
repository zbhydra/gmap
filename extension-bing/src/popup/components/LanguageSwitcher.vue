<template>
  <div class="language-switcher">
    <button class="language-btn" :title="currentLanguageLabel" @click="toggleDropdown">
      <span class="current-language">{{ currentLanguageLabel }}</span>
    </button>

    <!-- 下拉菜单 -->
    <div v-if="showDropdown" class="language-dropdown">
      <button
        v-for="lang in LANGUAGES"
        :key="lang.value"
        class="language-option"
        :class="{ active: lang.value === currentLanguage }"
        @click="selectLanguage(lang.value)"
      >
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { I18nService } from '@/locales'
import { LANGUAGES, type Language } from '@/core/services/languageService'
import { SettingsManager } from '@/core/storage/settings'
import { logger } from '@/core/utils/logger'

// 当前语言
const currentLanguage = ref<Language>(I18nService.getCurrentLanguage() as Language)

// 下拉菜单显示状态
const showDropdown = ref(false)

// 当前语言标签
const currentLanguageLabel = computed(() => {
  const config = LANGUAGES.find(l => l.value === currentLanguage.value)
  return config?.label || 'Language'
})

/**
 * 切换下拉菜单
 */
function toggleDropdown(): void {
  showDropdown.value = !showDropdown.value
}

/**
 * 关闭下拉菜单
 */
function closeDropdown(): void {
  showDropdown.value = false
}

/**
 * 选择语言
 */
async function selectLanguage(langValue: Language): Promise<void> {
  if (langValue === currentLanguage.value) {
    closeDropdown()
    return
  }

  try {
    // 更新 I18nService 语言
    I18nService.setLanguage(langValue)

    // 更新设置
    await SettingsManager.updateSettings({ language: langValue })

    // 更新当前语言
    currentLanguage.value = langValue

    logger.info(`[LanguageSwitcher] Language changed to ${langValue}`)
  } catch (error) {
    logger.error('[LanguageSwitcher] Failed to change language:', error)
  }

  closeDropdown()
}

// 点击外部关闭菜单
function handleClickOutside(event: MouseEvent): void {
  const target = event.target as Node
  const container = document.querySelector('.language-switcher')
  if (container && !container.contains(target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 色值一律消费 --gme-* 语义 token（src/styles/tokens.css）；菜单规格见 design.md §7。 */
.language-switcher {
  position: relative;
  display: flex;
  align-items: center;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: var(--gme-rounded-full);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.language-btn:hover {
  background: var(--gme-surface-2);
}

.language-btn:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
}

.current-language {
  font-size: 12px;
  color: var(--gme-text-2);
}

/* 下拉菜单：surface + border + shadow-pop，内边距 6px，项为胶囊（design.md §7） */
.language-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 120px;
  padding: 6px;
  background: var(--gme-surface);
  border: 1px solid var(--gme-border);
  border-radius: var(--gme-rounded-md);
  box-shadow: var(--gme-shadow-pop);
  z-index: 1000;
  animation: dropdownFadeIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .language-dropdown {
    animation: none;
  }
}

.language-option {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: var(--gme-rounded-full);
  background: transparent;
  font-size: 13px;
  color: var(--gme-text);
  cursor: pointer;
  transition: background 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  text-align: left;
}

.language-option:hover {
  background: var(--gme-surface-2);
}

.language-option:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: -2px;
}

.language-option.active {
  background: var(--gme-primary-soft);
  color: var(--gme-primary);
  font-weight: 500;
}
</style>
