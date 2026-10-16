<script setup lang="ts">
/**
 * 渠道内操作指引弹窗（自 Pricing 页迁入）：按支付渠道说明取消路径。
 * 原生 dialog 获得模态焦点管理、Escape 关闭和无障碍语义。
 */
import { ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'

export interface Props {
  open: boolean
  copy: DashboardContent['cancelGuide']
}

const props = defineProps<Props>()

const emit = defineEmits<{ (event: 'close'): void }>()

const dialog = ref<HTMLDialogElement | null>(null)

watch(
  () => props.open,
  open => {
    const element = dialog.value
    if (!element) {
      return
    }
    if (open && !element.open) {
      element.showModal()
    } else if (!open && element.open) {
      element.close()
    }
  }
)

function handleCancel(event: Event): void {
  event.preventDefault()
  emit('close')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="guide"
    @close="emit('close')"
    @cancel="handleCancel"
  >
    <form method="dialog" class="guide-panel">
      <button
        type="submit"
        class="guide-close"
        value="close"
        :aria-label="props.copy.closeLabel"
      >
        <span aria-hidden="true">×</span>
      </button>

      <h2>{{ props.copy.title }}</h2>
      <div class="guide-paths">
        <section
          v-for="path in props.copy.paths"
          :key="path.provider"
          class="guide-provider"
          :aria-label="path.provider"
        >
          <h3>{{ path.provider }}</h3>
          <ol class="guide-path">
            <li v-for="step in path.steps" :key="step">{{ step }}</li>
          </ol>
        </section>
      </div>

      <div class="guide-actions">
        <button type="submit" class="guide-dismiss" value="close">
          {{ props.copy.closeLabel }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.guide {
  width: min(520px, calc(100% - 32px));
  max-width: none;
  margin: auto;
  padding: 0;
  overflow: visible;
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-lg);
}

.guide::backdrop {
  background: var(--overlay);
}

.guide-panel {
  position: relative;
  display: grid;
  gap: var(--s-6);
  padding: var(--s-6);
}

.guide h2 {
  margin: 0;
  padding-right: 40px;
  font-size: var(--fs-h4);
  font-weight: 700;
  line-height: 28px;
  letter-spacing: 0;
}

.guide-close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: var(--r-full);
  background: transparent;
  color: var(--text-2);
  font-size: var(--fs-h4);
  line-height: 1;
  cursor: pointer;
  transition: color var(--dur-1), background var(--dur-1);
}

.guide-close:hover {
  background: var(--surface-2);
  color: var(--text);
}

.guide-paths {
  display: grid;
  gap: var(--s-4);
}

.guide-provider {
  display: grid;
  gap: var(--s-2);
}

.guide-provider + .guide-provider {
  padding-top: var(--s-4);
  border-top: 1px solid var(--border);
}

.guide-provider h3 {
  margin: 0;
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: 0;
}

.guide-path {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2) var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--text-2);
  font-size: 15px;
  font-weight: 700;
  line-height: 24px;
}

.guide-path li {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-width: 0;
  overflow-wrap: anywhere;
}

.guide-path li:not(:first-child)::before {
  content: '→';
  flex: 0 0 auto;
  color: var(--text-3);
  font-weight: 600;
}

.guide-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--s-1);
}

.guide-dismiss {
  min-width: 96px;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--r-full);
  background: var(--primary);
  color: var(--primary-fg);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background var(--dur-1);
}

.guide-dismiss:hover {
  background: var(--primary-hover);
}

.guide-close:focus-visible,
.guide-dismiss:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .guide {
    width: calc(100% - 24px);
  }

  .guide-actions {
    display: grid;
    justify-content: stretch;
  }

  .guide-dismiss {
    width: 100%;
  }
}
</style>
