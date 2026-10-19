<template>
  <Teleport to="body">
    <div class="toast-stack toast-stack--center">
      <Transition name="toast-fade">
        <div
          v-if="show"
          class="toast"
          :class="type === 'error' ? 'tone-bad' : 'tone-ok'"
          :role="type === 'error' ? 'alert' : 'status'"
          :aria-live="type === 'error' ? 'assertive' : 'polite'"
          aria-atomic="true"
        >
          <span class="toast-icon" aria-hidden="true">
            <Icon :name="type === 'error' ? IconName.X : IconName.CHECK" :size="IconSize.XS" />
          </span>
          <span class="toast-title">{{ message }}</span>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon, IconName, IconSize } from '@/core/components/icons'
import type { ToastType } from '@/core/composables/useToast'

withDefaults(defineProps<{ show?: boolean; message?: string; type?: ToastType }>(), {
  show: false,
  message: '',
  type: 'success'
})
</script>

<style scoped>
.toast-fade-leave-active {
  transition:
    opacity var(--dur-3) var(--ease-in-out),
    transform var(--dur-3) var(--ease-in-out);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}
</style>
