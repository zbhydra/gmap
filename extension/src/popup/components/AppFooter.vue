<template>
  <footer class="pp-foot enter">
    <a class="link link--quiet" :href="faqUrl" target="_blank" rel="noreferrer"
      ><Icon :name="IconName.HELP" />{{ t(I18N_KEYS.APP.HELP) }}</a
    >
    <a class="link link--quiet" :href="contactUrl" target="_blank" rel="noreferrer"
      ><Icon :name="IconName.MAIL" />{{ t(I18N_KEYS.APP.CONTACT) }}</a
    >
    <span class="pp-version mono">v{{ version }}</span>
  </footer>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { WEBSITE } from '@/core/api/config'
import { Icon, IconName } from '@/core/components/icons'
const { t } = useI18n()
const faqUrl = new URL('/extension/#faq', WEBSITE.BASE_URL).toString()
const contactUrl = new URL('/contact/', WEBSITE.BASE_URL).toString()
const version = chrome.runtime.getManifest().version
</script>
<style scoped>
.pp-foot {
  --enter-delay: calc(var(--stagger) * 5);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--s-4);
  min-height: 48px;
  padding: 10px var(--s-4);
  border-top: 1px solid var(--border);
  font-size: var(--fs-xs);
}
a {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  min-height: 28px;
}
a .icon {
  width: var(--icon-xs);
  height: var(--icon-xs);
}
.pp-version {
  margin-left: auto;
  color: var(--text-3);
  font-size: var(--fs-micro);
}
</style>
