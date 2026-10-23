<script setup lang="ts">
/**
 * 渠道内操作指引弹窗：有效自动续费订阅拿不到渠道管理 URL 时，按支付渠道列出操作步骤。
 * 版式用全局 dialog.modal.guide；原生模态 dialog 负责焦点限制、Esc 关闭与关闭后的焦点归还，点遮罩同样关闭。
 */
import { ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'

const props = defineProps<{
  open: boolean
  copy: DashboardContent['cancelGuide']
}>()

const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)

watch(() => props.open, open => {
  if (open) dialog.value?.showModal()
  else dialog.value?.close()
})

/** 只有点在遮罩上时事件目标才是 dialog 本身（内容区由 form 铺满）。 */
function closeOnBackdrop(event: MouseEvent): void {
  if (event.target === dialog.value) dialog.value?.close()
}
</script>

<template>
  <dialog ref="dialog" class="modal guide" aria-labelledby="cancel-guide-title" @close="emit('close')" @click="closeOnBackdrop">
    <form method="dialog" class="guide-body">
      <button class="icon-btn icon-btn--sm dlg-close" value="close" :aria-label="props.copy.closeLabel">
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-x" /></svg>
      </button>
      <h2 id="cancel-guide-title" class="dlg-title">{{ props.copy.title }}</h2>
      <div class="guide-paths">
        <section
          v-for="(path, index) in props.copy.paths"
          :key="path.provider"
          class="guide-provider"
          :aria-labelledby="`cancel-guide-${index}`"
        >
          <h3 :id="`cancel-guide-${index}`">{{ path.provider }}</h3>
          <ol class="guide-steps">
            <li v-for="step in path.steps" :key="step">{{ step }}</li>
          </ol>
        </section>
      </div>
      <div class="guide-foot">
        <button class="btn btn-primary btn-sm" value="close">{{ props.copy.closeLabel }}</button>
      </div>
    </form>
  </dialog>
</template>
