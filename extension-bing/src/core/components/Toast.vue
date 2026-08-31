<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div
        v-if="show"
        class="toast-container"
        :class="`toast-${type}`"
        :role="type === 'error' ? 'alert' : 'status'"
        :aria-live="type === 'error' ? 'assertive' : 'polite'"
        aria-atomic="true"
      >
        <span class="toast-icon" aria-hidden="true">
          <Icon v-if="type === 'error'" :name="IconName.X_MARK" :size="IconSize.XS" />
          <Icon v-if="type === 'success'" :name="IconName.CHECK" :size="IconSize.XS" />
        </span>
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon, IconName, IconSize } from '@/core/components/icons'
import type { ToastType } from '@/core/composables/useToast'

interface Props {
  show?: boolean
  message?: string
  type?: ToastType
}

withDefaults(defineProps<Props>(), {
  show: false,
  message: '',
  type: 'success'
})
</script>

<!--
  design.md §7 Toast：卡面 + border + shadow-pop，左侧 20px 状态色实心圆图标
  （图标色用对应 -fg，暗色下翻转为深字），文字 13px/600。色值全部消费
  --gme-* 语义 token，亮暗随 prefers-color-scheme。
-->
<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--gme-rounded-md);
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--gme-text);
  background: var(--gme-surface);
  border: 1px solid var(--gme-border);
  box-shadow: var(--gme-shadow-pop);
  box-sizing: border-box;
  max-width: calc(100vw - 24px);
  overflow-wrap: anywhere;
  z-index: 10000;
  pointer-events: none;
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--gme-rounded-full);
  background: var(--gme-ok);
  color: var(--gme-ok-fg);
}

.toast-error .toast-icon {
  background: var(--gme-bad);
  color: var(--gme-bad-fg);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-fade-enter-active,
  .toast-fade-leave-active {
    transition: none;
  }
}
</style>
