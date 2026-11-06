<template>
  <div v-if="messageKey" class="notice tone-warn" role="status" data-plugin-version>
    <Icon :name="IconName.REFRESH" />
    <div class="notice-desc">
      <p>{{ t(messageKey, { version: state?.update?.version ?? '' }) }}</p>
      <a
        v-if="state?.update"
        class="btn btn-secondary btn-sm"
        :href="state.update.url"
        target="_blank"
        rel="noopener noreferrer"
        >{{ t(I18N_KEYS.PLUGIN_VERSION.DOWNLOAD) }}</a
      >
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        :disabled="checking"
        @click="$emit('retry')"
      >
        {{ t(I18N_KEYS.PLUGIN_VERSION.CHECK_AGAIN) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PluginVersionState } from '@/core/api/plugin-version/types'
import { I18N_KEYS } from '@/core/constants/i18n'
import { pluginVersionMessageKey } from '@/core/plugin-version/client'
import { Icon, IconName } from './icons'

const props = defineProps<{ state: PluginVersionState | undefined; checking: boolean }>()
defineEmits<{ retry: [] }>()
const { t } = useI18n()
const messageKey = computed(() => pluginVersionMessageKey(props.state))
</script>
