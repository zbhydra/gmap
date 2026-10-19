<template>
  <div class="pp-language">
    <button
      ref="trigger"
      class="btn btn-ghost btn-sm pp-lang"
      type="button"
      popovertarget="popup-languages"
      :aria-label="t(I18N_KEYS.OPTIONS.LANGUAGE)"
      :title="currentLabel"
      :aria-expanded="open"
      @click="positionMenu"
    >
      <Icon :name="IconName.GLOBE" /><span class="pp-lang-code mono">{{ currentCode }}</span
      ><Icon :name="IconName.CHEVRON_DOWN" class="pp-lang-chevron" />
    </button>
    <div
      id="popup-languages"
      ref="menu"
      popover
      class="menu pp-lang-menu"
      :style="menuPosition"
      :aria-label="t(I18N_KEYS.OPTIONS.LANGUAGE)"
      @toggle="onToggle"
    >
      <div class="menu-label">{{ t(I18N_KEYS.OPTIONS.LANGUAGE) }}</div>
      <div class="pp-lang-grid" role="group">
        <button
          v-for="lang in LANGUAGES"
          :key="lang.value"
          class="menu-item"
          type="button"
          :lang="lang.value"
          :aria-pressed="locale === lang.value"
          @click="selectLanguage(lang.value)"
        >
          {{ lang.label }}<Icon v-if="locale === lang.value" :name="IconName.CHECK" />
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { I18nService } from '@/locales'
import { LANGUAGES, type Language } from '@/core/services/languageService'
import { I18N_KEYS } from '@/core/constants/i18n'
import { Icon, IconName } from '@/core/components/icons'
import { logger } from '@/core/utils/logger'
import { useToast } from '@/core/composables/useToast'
const { locale, t } = useI18n()
const { showError } = useToast()
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLDivElement | null>(null)
const open = ref(false)
const menuPosition = ref({ top: '0px', left: '0px' })
const currentLabel = computed(() => LANGUAGES.find(lang => lang.value === locale.value)?.label)
const currentCode = computed(() =>
  locale.value === 'zh-TW' ? 'ZH-TW' : locale.value.split('-')[0].toUpperCase()
)
function positionMenu(): void {
  const bounds = trigger.value!.getBoundingClientRect()
  menuPosition.value = {
    top: `${bounds.bottom + 6}px`,
    left: `${Math.max(8, Math.min(bounds.right - 292, window.innerWidth - 300))}px`
  }
}
function onToggle(event: Event): void {
  if (event instanceof ToggleEvent) open.value = event.newState === 'open'
}
async function selectLanguage(language: Language): Promise<void> {
  try {
    await I18nService.setLanguage(language)
    menu.value!.hidePopover()
  } catch (error) {
    logger.error('[Popup] 语言保存失败:', error)
    showError(t(I18N_KEYS.OPTIONS.LANGUAGE_FAILED))
  }
}
</script>
<style scoped>
.pp-lang {
  --btn-px: 10px;
  gap: 6px;
}
.pp-lang-code {
  font-size: var(--fs-xs);
  font-weight: 600;
}
.btn .pp-lang-chevron {
  width: 12px;
  height: 12px;
  transition: transform var(--dur-3) var(--ease-emph);
}
.pp-lang[aria-expanded='true'] .pp-lang-chevron {
  transform: rotate(180deg);
}
.pp-lang-menu {
  position: fixed;
  inset: auto;
  width: 292px;
  min-width: 0;
  margin: 0;
}
.pp-lang-grid {
  display: grid;
  grid-template-rows: repeat(7, auto);
  grid-auto-flow: column;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.pp-lang-grid .menu-item {
  min-width: 0;
}
.pp-lang-grid .icon {
  margin-left: auto;
}
</style>
