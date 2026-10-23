<script setup lang="ts">
/**
 * 菜单按钮（WAI-ARIA APG Menu Button，README §3.8）：账户菜单、History 时间范围与 Filters 共用。
 *
 * 开合、焦点、子面板与键盘都在 site/pop-menu（与站点头部共用）；这里只渲染浮层骨架与子面板头，
 * 并把展开状态交给触发器插槽。条目由使用方在插槽里渲染且只处理业务。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { closePop, isPopOpen, type PopAlign, type PopRect, type PopSide } from '../../scripts/site/pop'
import { createPopMenu } from '../../scripts/site/pop-menu'

/** 子面板：id 是入口项 aria-controls 指向的元素 id（全局唯一）；form 为表单型（自定义日期），否则是菜单型。 */
export interface PopMenuPanel {
  id: string
  title: string
  form?: boolean
}

const props = withDefaults(defineProps<{
  /** 根 role="menu" 的 id；触发器为 `${id}-btn`，浮层为 `${id}-pop`。 */
  id: string
  /** 根菜单的可访问名称。 */
  label: string
  /** 子面板返回按钮的可访问名称。 */
  backLabel: string
  panels?: PopMenuPanel[]
  /** 首选方向，打开时读取：账户菜单展开态为 top，图标栏为 right。 */
  side?: PopSide
  align?: PopAlign
  /** 定位矩形，缺省为触发器的矩形。 */
  anchor?: () => PopRect | null
  /** 打开时聚焦当前项（选中的单选项或 .is-current），否则聚焦首项。 */
  focusChecked?: boolean
  /** 实例尺寸类（在 Dashboard 样式里给出 --pop-w）。 */
  popClass?: string
}>(), {
  panels: () => [],
  side: 'bottom',
  align: 'start',
  anchor: undefined,
  focusChecked: false,
  popClass: undefined
})

const emit = defineEmits<{
  /** 每次打开前：使用方在此重建草稿（如丢掉上次没有 Apply 的日期）。 */
  open: []
  close: []
}>()

const popEl = ref<HTMLElement | null>(null)
const expanded = ref(false)

const menu = createPopMenu(props.id, () => ({
  side: props.side,
  align: props.align,
  anchor: props.anchor,
  focusChecked: props.focusChecked,
  onOpen: () => {
    expanded.value = true
    emit('open')
  },
  onClose: () => {
    expanded.value = false
    emit('close')
  }
}))

const triggerBind = computed(() => ({
  id: `${props.id}-btn`,
  'aria-haspopup': 'menu' as const,
  'aria-expanded': expanded.value ? ('true' as const) : ('false' as const),
  'aria-controls': props.id,
  onClick: menu.toggle,
  onKeydown: menu.onTriggerKeydown
}))

// 工作区整体重建（换号、会话失效）时组件随之卸载：打开着的浮层一并关闭，不留悬空状态
onBeforeUnmount(() => {
  if (popEl.value && isPopOpen(popEl.value)) closePop({ focus: false })
})

defineExpose({ open: menu.open, close: menu.close })
</script>

<template>
  <slot name="trigger" :bind="triggerBind" :open="expanded" />
  <div
    :id="`${props.id}-pop`"
    ref="popEl"
    class="pop"
    :class="props.popClass"
    popover="manual"
    @keydown="menu.onKeydown"
    @click.capture="menu.onClickCapture"
    @click="menu.onClick"
  >
    <div class="pop-panels">
      <div class="pop-panel">
        <div class="pop-body">
          <slot name="before" />
          <div :id="props.id" role="menu" :aria-label="props.label">
            <slot :close="menu.close" />
          </div>
        </div>
      </div>
      <div v-for="panel in props.panels" :key="panel.id" class="pop-panel" hidden>
        <div class="pop-head">
          <button class="icon-btn icon-btn--sm" type="button" :tabindex="panel.form ? undefined : -1" :aria-label="props.backLabel" data-pop-back>
            <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-chevron-left" /></svg>
          </button>
          <span :id="`${panel.id}-title`" class="pop-title">{{ panel.title }}</span>
        </div>
        <div v-if="panel.form" class="pop-body">
          <div :id="panel.id" class="pop-form" role="group" :aria-labelledby="`${panel.id}-title`">
            <slot :name="panel.id" :close="menu.close" />
          </div>
        </div>
        <div v-else :id="panel.id" class="pop-body" role="menu" :aria-labelledby="`${panel.id}-title`">
          <slot :name="panel.id" :close="menu.close" />
        </div>
      </div>
    </div>
  </div>
</template>
