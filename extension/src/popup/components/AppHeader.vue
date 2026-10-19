<template>
  <header class="appbar appbar--compact pp-head enter" :class="{ 'is-scrolled': scrolled }">
    <h1 class="brand pp-brand">
      <img class="brand-mark" :src="brandIconUrl" alt="" width="24" height="24" />{{
        t(I18N_KEYS.APP.TITLE)
      }}
    </h1>
    <Transition name="plan"
      ><span
        v-if="signedIn"
        :key="plan"
        class="badge pp-plan"
        :class="plan === 'Free' ? 'tone-neutral' : 'badge--pro'"
        ><Icon v-if="plan !== 'Free'" :name="IconName.CROWN" />{{ plan }}</span
      ></Transition
    >
    <div class="appbar-actions">
      <LanguageSwitcher />
      <a
        class="icon-btn icon-btn--sm"
        :href="optionsUrl"
        target="_blank"
        rel="noreferrer"
        :aria-label="t(I18N_KEYS.OPTIONS.TITLE)"
        :title="t(I18N_KEYS.OPTIONS.TITLE)"
        ><Icon :name="IconName.GEAR"
      /></a>
    </div>
  </header>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { Icon, IconName } from '@/core/components/icons'
import type { MapsUsageSnapshot } from '@/sites/maps/usage/types'
import LanguageSwitcher from './LanguageSwitcher.vue'
defineProps<{ plan: MapsUsageSnapshot['plan_name']; signedIn: boolean; scrolled: boolean }>()
const { t } = useI18n()
const optionsUrl = chrome.runtime.getURL('src/options.html')
const brandIconUrl = chrome.runtime.getURL('icons/32.png')
</script>
<style scoped>
.pp-head {
  flex-shrink: 0;
  height: 48px;
  gap: var(--s-2);
}
.pp-brand {
  gap: 10px;
}
.pp-brand .brand-mark {
  width: 24px;
  height: 24px;
}
.pp-plan {
  margin-left: -2px;
}
.appbar-actions {
  gap: var(--s-1);
  margin-left: auto;
}
.plan-enter-active {
  animation: pop-in var(--dur-4) var(--ease-spring);
}
</style>
