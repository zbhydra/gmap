<script setup lang="ts">
/**
 * 可编辑 combobox（WAI-ARIA APG Combobox，列表自动补全，README §3.1 / §3.8）：地区模式的国家、州 / 省与城市。
 *
 * - value 模式（国家、州）持有一个值：点击输入框、箭头按钮或按 ↓ / ↑ / Alt+↓ 展开完整列表，并定位到当前值；
 *   失焦时文本与某项完全相同（不区分大小写）才提交，否则恢复原值；allowEmpty 时清空即提交 ''。
 * - action 模式（城市）选中即执行：输入达到 minChars 才展开，选中后清空输入。
 * - 焦点始终在输入框，活动项用 aria-activedescendant 指示；↑↓ 循环，Esc 收起（value 模式同时恢复原值），Alt+↑ 收起；
 *   Enter 只在列表展开且有活动项时选中，任何时候都不触发外层表单的隐式提交。
 * 候选由使用方按 query 事件过滤、排序后传回；组件只负责渲染，不持有第二份数据。
 */
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { closePop, isPopOpen, openPop } from '../../scripts/site/pop'

/** 候选：value 是国家 / 州代码或城市键，sub 是右侧弱化文字（国家代码、城市所属州）。 */
export interface ComboOption {
  value: string
  label: string
  sub?: string
}

const props = withDefaults(defineProps<{
  /** 输入框 id（外部 <label for> 指向它）；列表与选项的 id 由它派生。 */
  id: string
  /** 字段名：箭头按钮与列表的可访问名称。 */
  label: string
  /** 使用方按最近一次 query 过滤、排序、截断后的候选。 */
  options: ComboOption[]
  /** 没有候选时的提示。 */
  noMatch: string
  /** value 持有一个值（国家、州）；action 选中即执行（城市）。 */
  mode: 'value' | 'action'
  modelValue?: string
  /** value 模式下当前值的显示文本。 */
  valueLabel?: string
  /** value 模式下清空文本即提交 ''（不选国家 / 全部州）。 */
  allowEmpty?: boolean
  /** 至少输入多少个字符才展开（城市为 2）。 */
  minChars?: number
  placeholder?: string
  disabled?: boolean
}>(), {
  modelValue: '',
  valueLabel: '',
  allowEmpty: false,
  minChars: 0,
  placeholder: undefined,
  disabled: false
})

const emit = defineEmits<{
  /** 过滤词：输入时为去掉首尾空白的文本，展开完整列表时为 ''。 */
  query: [q: string]
  'update:modelValue': [value: string]
  /** action 模式下选中。 */
  select: [option: ComboOption]
}>()

const field = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const popEl = ref<HTMLElement | null>(null)
const text = ref(props.mode === 'value' ? props.valueLabel : '')
const expanded = ref(false)
const active = ref(-1)
/** 输入框文本是否来自用户输入：是则按文本过滤，否则展开完整列表。 */
let typed = false

function optionId(index: number): string {
  return `${props.id}-opt-${index}`
}

/** 通知使用方过滤词，等候选随下一次刷新到达后定位活动项；输入不足 minChars 时收起并返回 false。 */
async function refresh(): Promise<boolean> {
  const q = typed ? text.value.trim() : ''
  if (q.length < props.minChars) {
    hide()
    return false
  }
  emit('query', q)
  await nextTick()
  resetActive()
  return true
}

function resetActive(): void {
  const current = props.mode === 'value' ? props.options.findIndex(option => option.value === props.modelValue) : -1
  active.value = props.options.length ? (typed ? 0 : Math.max(0, current)) : -1
}

function show(): void {
  const el = popEl.value
  const box = field.value
  const control = inputEl.value
  if (!el || !box || !control) return
  if (!isPopOpen(el)) {
    openPop(el, {
      trigger: control,
      anchor: () => (box.isConnected ? box.getBoundingClientRect() : null),
      owns: target => box.contains(target),
      side: 'bottom',
      align: 'start',
      gap: 4,
      matchWidth: 220,
      onClose: () => {
        expanded.value = false
        active.value = -1
      }
    })
    expanded.value = true
  }
  revealActive()
}

function hide(): void {
  if (popEl.value && isPopOpen(popEl.value)) closePop({ focus: false })
}

/** 活动项滚到列表可见处（等新的活动态渲染之后）。 */
function revealActive(): void {
  void nextTick(() => {
    if (active.value >= 0) document.getElementById(optionId(active.value))?.scrollIntoView({ block: 'nearest' })
  })
}

function choose(index: number): void {
  const option = props.options[index]
  if (!option) return
  typed = false
  hide()
  if (props.mode === 'action') {
    text.value = ''
    emit('select', option)
    return
  }
  text.value = option.label
  if (option.value !== props.modelValue) emit('update:modelValue', option.value)
}

async function handleInput(): Promise<void> {
  typed = true
  text.value = inputEl.value?.value ?? ''
  if (await refresh()) show()
}

async function handleKeydown(event: KeyboardEvent): Promise<void> {
  // 组字中的按键交给输入法。Safari 结束组字的那次 Enter 上 isComposing 已是 false，按 MDN keydown 页的做法同时排除 keyCode 229
  if (event.isComposing || event.keyCode === 229) return
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      event.preventDefault()
      if (!expanded.value) {
        if ((!event.altKey || event.key === 'ArrowDown') && (await refresh())) show()
        return
      }
      if (event.altKey) {
        if (event.key === 'ArrowUp') hide()
        return
      }
      const count = props.options.length
      if (!count) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      active.value = active.value < 0 ? (step > 0 ? 0 : count - 1) : (active.value + step + count) % count
      revealActive()
      return
    }
    case 'Enter':
      // Enter 只用于选中：列表收起时也不落到外层表单的隐式提交（Regions 里那会直接创建任务）
      event.preventDefault()
      if (expanded.value && active.value >= 0) choose(active.value)
      return
    case 'Escape':
      if (expanded.value) {
        event.preventDefault()
        event.stopPropagation()
        hide()
        if (props.mode === 'value') {
          typed = false
          text.value = props.valueLabel
        }
      }
  }
}

async function handleInputClick(): Promise<void> {
  if (props.mode === 'value' && !expanded.value && (await refresh())) show()
}

async function handleToggleClick(): Promise<void> {
  if (expanded.value) hide()
  else {
    typed = false
    if (await refresh()) show()
  }
  inputEl.value?.focus()
}

// 失焦：列表与箭头按钮都不抢焦点，输入框失焦就是焦点离开了 combobox，先同步收起列表（焦点可能落到 body，等不到 focusin）；
// value 模式再按完全相同的规则提交，否则恢复原值，allowEmpty 时清空即提交 ''。收起不动输入框文本，草稿照常参与提交
function handleBlur(): void {
  hide()
  if (props.mode !== 'value') return
  if (typed) {
    typed = false
    const q = text.value.trim().toLowerCase()
    const exact = q ? props.options.find(option => option.label.toLowerCase() === q) : props.allowEmpty ? { value: '', label: '' } : undefined
    if (exact && exact.value !== props.modelValue) {
      text.value = exact.label
      emit('update:modelValue', exact.value)
      return
    }
  }
  text.value = props.valueLabel
}

/** 清空输入并收起（换州后清空城市）。 */
function clear(): void {
  typed = false
  text.value = ''
  hide()
}

// 地区数据可能晚于 query 到达：候选更新后沿用本次查询的活动项规则
watch(() => props.options, () => {
  if (!expanded.value) return
  resetActive()
  revealActive()
})

// 外部改了当前值（换国家后州重置、表单重置）时同步输入框文本；正在输入时不打断
watch(() => props.valueLabel, label => {
  if (props.mode === 'value' && !(typed && document.activeElement === inputEl.value)) text.value = label
})

onBeforeUnmount(hide)

defineExpose({ clear })
</script>

<template>
  <div ref="field" class="combo-field">
    <input
      :id="props.id"
      ref="inputEl"
      class="input input--sm"
      type="text"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="`${props.id}-list`"
      :aria-activedescendant="expanded && active >= 0 ? optionId(active) : undefined"
      autocomplete="off"
      spellcheck="false"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :value="text"
      @input="handleInput"
      @keydown="handleKeydown"
      @click="handleInputClick"
      @blur="handleBlur"
    />
    <button
      v-if="props.mode === 'value'"
      class="combo-toggle"
      type="button"
      tabindex="-1"
      :aria-label="props.label"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="`${props.id}-list`"
      :disabled="props.disabled"
      @pointerdown.prevent
      @click="handleToggleClick"
    >
      <svg class="icon pop-caret" aria-hidden="true"><use href="/img/icons.svg#i-chevron-down" /></svg>
    </button>
  </div>
  <!-- 列表不抢焦点，输入框始终持有焦点：按下时阻止默认行为；列表可滚动时会成为可聚焦滚动区，tabindex="-1" 把它移出 Tab 顺序 -->
  <div ref="popEl" class="pop pop--list" popover="manual" @pointerdown.prevent>
    <ul :id="`${props.id}-list`" class="pop-body" role="listbox" :aria-label="props.label" tabindex="-1">
      <li
        v-for="(option, index) in props.options"
        :id="optionId(index)"
        :key="option.value"
        class="pop-item"
        :class="{ 'is-active': index === active, 'is-current': props.mode === 'value' && option.value === props.modelValue }"
        role="option"
        :aria-selected="index === active ? 'true' : 'false'"
        @click="choose(index)"
      >
        <span class="pop-item-label">{{ option.label }}</span>
        <span v-if="option.sub" class="pop-item-sub">{{ option.sub }}</span>
        <svg class="icon pop-check" aria-hidden="true"><use href="/img/icons.svg#i-check" /></svg>
      </li>
      <li v-if="!props.options.length" class="pop-empty" role="option" aria-disabled="true">{{ props.noMatch }}</li>
    </ul>
  </div>
</template>
