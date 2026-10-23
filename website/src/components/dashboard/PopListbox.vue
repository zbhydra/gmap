<script setup lang="ts">
/**
 * listbox 按钮（README §3.8）：选项少且固定时用，当前用于 History 的每页条数。
 *
 * - 触发按钮：Enter / Space / ↓ / ↑ 打开并聚焦当前选项；可访问名称是「外部标签 + 当前值」。
 * - 列表内：↑↓ 移动（不循环）、Home / End；Enter / Space 选中并关闭；Esc、Tab 关闭。选项真实获得焦点，
 *   点列表留白时焦点落在浮层容器上（site/pop 设的 tabindex=-1），随即交回当前选项，键盘仍走选项上的这些路径。
 * - 浮层走 site/pop：宽度跟随按钮（至少 minWidth），靠近视口底部时向上弹出。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { closePop, isPopOpen, openPop, type PopAlign } from '../../scripts/site/pop'

/** 选项（当前唯一用途是每页条数）。 */
export interface ListOption {
  value: number
  label: string
}

const props = withDefaults(defineProps<{
  /** 触发按钮 id；列表为 `${id}-list`。 */
  id: string
  /** 外部标签元素的 id。 */
  labelledby: string
  options: ListOption[]
  modelValue: number
  align?: PopAlign
  /** 浮层最小宽度（px），实际宽度跟随按钮。 */
  minWidth?: number
}>(), { align: 'end', minWidth: 96 })

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const button = ref<HTMLButtonElement | null>(null)
const popEl = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const expanded = ref(false)

const currentLabel = computed(() => props.options.find(option => option.value === props.modelValue)?.label ?? '')

function optionEls(): HTMLElement[] {
  return list.value ? Array.from(list.value.querySelectorAll<HTMLElement>('[role="option"]')) : []
}

/** 聚焦当前选项（没有则首项）：打开时，以及点列表留白、焦点落到浮层容器时。 */
function focusCurrent(): void {
  const options = optionEls()
  ;(options.find(option => option.getAttribute('aria-selected') === 'true') ?? options[0])?.focus()
}

function open(): void {
  const el = popEl.value
  const trigger = button.value
  if (!el || !trigger || isPopOpen(el)) return
  openPop(el, {
    trigger,
    anchor: () => (trigger.isConnected ? trigger.getBoundingClientRect() : null),
    owns: target => trigger.contains(target),
    side: 'bottom',
    align: props.align,
    matchWidth: props.minWidth,
    onClose: () => {
      expanded.value = false
    }
  })
  expanded.value = true
  focusCurrent()
}

function close(): void {
  if (popEl.value && isPopOpen(popEl.value)) closePop()
}

function toggle(): void {
  if (expanded.value) close()
  else open()
}

function choose(value: number): void {
  close()
  if (value !== props.modelValue) emit('update:modelValue', value)
}

function handleButtonKeydown(event: KeyboardEvent): void {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  open()
}

function handleListKeydown(event: KeyboardEvent): void {
  const options = optionEls()
  const option = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="option"]') : null
  const index = option ? options.indexOf(option) : -1
  const go = (to: number): void => {
    event.preventDefault()
    options[Math.min(Math.max(to, 0), options.length - 1)]?.focus()
  }
  switch (event.key) {
    case 'ArrowDown':
      go(index + 1)
      return
    case 'ArrowUp':
      go(index - 1)
      return
    case 'Home':
      go(0)
      return
    case 'End':
      go(options.length - 1)
      return
    case 'Enter':
    case ' ': {
      event.preventDefault()
      const value = props.options[index]?.value
      if (value !== undefined) choose(value)
      return
    }
    case 'Escape':
      event.preventDefault()
      event.stopPropagation()
      close()
      return
    case 'Tab':
      // 焦点先回到按钮，再由默认行为继续移动
      close()
  }
}

onBeforeUnmount(() => {
  if (popEl.value && isPopOpen(popEl.value)) closePop({ focus: false })
})
</script>

<template>
  <button
    :id="props.id"
    ref="button"
    class="select-btn"
    type="button"
    aria-haspopup="listbox"
    :aria-expanded="expanded ? 'true' : 'false'"
    :aria-controls="`${props.id}-list`"
    :aria-labelledby="`${props.labelledby} ${props.id}`"
    @click="toggle"
    @keydown="handleButtonKeydown"
  >
    <span>{{ currentLabel }}</span>
    <svg class="icon pop-caret" aria-hidden="true"><use href="/img/icons.svg#i-chevron-down" /></svg>
  </button>
  <div ref="popEl" class="pop pop--list" popover="manual" @focus="focusCurrent">
    <ul :id="`${props.id}-list`" ref="list" class="pop-body" role="listbox" :aria-labelledby="props.labelledby" @keydown="handleListKeydown">
      <li
        v-for="option in props.options"
        :key="option.value"
        class="pop-item"
        :class="{ 'is-current': option.value === props.modelValue }"
        role="option"
        tabindex="-1"
        :aria-selected="option.value === props.modelValue ? 'true' : 'false'"
        @click="choose(option.value)"
      >
        <span class="pop-item-label">{{ option.label }}</span>
        <svg class="icon pop-check" aria-hidden="true"><use href="/img/icons.svg#i-check" /></svg>
      </li>
    </ul>
  </div>
</template>
