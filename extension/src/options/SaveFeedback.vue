<template>
  <span class="op-feedback" :data-state="state" aria-hidden="true">
    <span v-if="state === 'saving'" class="spinner"></span>
    <Icon v-else :name="state === 'failed' ? IconName.X : IconName.CHECK" />
    {{
      t(
        state === 'failed'
          ? I18N_KEYS.OPTIONS.NOT_SAVED
          : state === 'saving'
            ? I18N_KEYS.OPTIONS.SAVING
            : I18N_KEYS.OPTIONS.SAVED
      )
    }}
  </span>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Icon, IconName } from '@/core/components/icons'
import { I18N_KEYS } from '@/core/constants/i18n'
defineProps<{ state: 'idle' | 'saving' | 'saved' | 'failed' }>()
const { t } = useI18n()
</script>
<style scoped>
.op-feedback {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  color: var(--ok);
  font-size: var(--fs-xs);
  font-weight: 600;
  white-space: nowrap;
  visibility: hidden;
}
.op-feedback .icon,
.op-feedback .spinner {
  width: var(--icon-xs);
  height: var(--icon-xs);
}
.op-feedback[data-state='saved'],
.op-feedback[data-state='failed'],
.op-feedback[data-state='saving'] {
  visibility: visible;
  animation: enter-up var(--dur-3) var(--ease-out);
}
.op-feedback[data-state='failed'] {
  color: var(--bad);
}
.op-feedback[data-state='saving'] {
  color: var(--primary-text);
}
</style>
