<script setup lang="ts">
/**
 * 多选浮层：地区模式的州 / 省与城市。
 *
 * - 触发按钮显示使用方给出的摘要；展开后焦点进过滤框，候选是真实复选框，Tab 依次经过。
 * - 过滤忽略大小写与变音符号，按「名称前缀 > 名称包含」排序；全选、全不选只作用于当前过滤结果。
 * - 城市可能上万条：只渲染前 RENDER_LIMIT 条并提示继续输入缩小范围，全选仍覆盖全部匹配项。
 */
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { fill, foldText } from '../../scripts/dashboard/format'
import { closePop, isPopOpen, openPop } from '../../scripts/site/pop'

/** 候选：value 是州代码或「州代码:城市名」，sub 是右侧弱化文字（城市所属州）。 */
export interface CheckOption {
  value: string
  label: string
  sub?: string
}

const RENDER_LIMIT = 200

const props = defineProps<{
  /** 触发按钮 id（外部 <label for> 指向它）；浮层为 `${id}-pop`。 */
  id: string
  /** 字段名：浮层与候选组的可访问名称。 */
  label: string
  options: CheckOption[]
  modelValue: string[]
  /** 触发按钮上的已选摘要；为空时显示 placeholder。 */
  summary: string
  placeholder: string
  copy: { filter: string; selectAll: string; clear: string; noMatch: string; more: string }
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const triggerEl = ref<HTMLElement | null>(null)
const popEl = ref<HTMLElement | null>(null)
const filterEl = ref<HTMLInputElement | null>(null)
const query = ref('')
const expanded = ref(false)

const checked = computed(() => new Set(props.modelValue))
const matches = computed(() => {
  const needle = foldText(query.value.trim())
  if (!needle) return props.options
  const prefix: CheckOption[] = []
  const contains: CheckOption[] = []
  for (const option of props.options) {
    const name = foldText(option.label)
    if (name.startsWith(needle)) prefix.push(option)
    else if (name.includes(needle)) contains.push(option)
  }
  return [...prefix, ...contains]
})
const visible = computed(() => matches.value.slice(0, RENDER_LIMIT))

function toggle(value: string, on: boolean): void {
  emit('update:modelValue', on ? [...props.modelValue, value] : props.modelValue.filter(item => item !== value))
}

function selectAll(): void {
  const next = new Set(props.modelValue)
  for (const option of matches.value) next.add(option.value)
  emit('update:modelValue', [...next])
}

function clearAll(): void {
  if (!query.value.trim()) {
    emit('update:modelValue', [])
    return
  }
  const hit = new Set(matches.value.map(option => option.value))
  emit('update:modelValue', props.modelValue.filter(value => !hit.has(value)))
}

async function toggleOpen(): Promise<void> {
  const pop = popEl.value
  const trigger = triggerEl.value
  if (!pop || !trigger) return
  if (isPopOpen(pop)) {
    closePop()
    return
  }
  query.value = ''
  expanded.value = true
  openPop(pop, {
    trigger,
    anchor: () => (trigger.isConnected ? trigger.getBoundingClientRect() : null),
    owns: target => trigger.contains(target),
    side: 'bottom',
    align: 'start',
    gap: 4,
    matchWidth: 280,
    onClose: () => { expanded.value = false }
  })
  await nextTick()
  filterEl.value?.focus()
}

onBeforeUnmount(() => {
  if (popEl.value && isPopOpen(popEl.value)) closePop({ focus: false })
})
</script>

<template>
  <button
    :id="props.id"
    ref="triggerEl"
    class="input input--sm checklist-trigger"
    type="button"
    aria-haspopup="dialog"
    :aria-controls="`${props.id}-pop`"
    :aria-expanded="expanded"
    :disabled="props.disabled"
    @click="toggleOpen"
  >
    <span :class="{ 'is-placeholder': !props.summary }">{{ props.summary || props.placeholder }}</span>
    <svg class="icon icon--sm" aria-hidden="true"><use href="/img/icons.svg#i-chevron-down" /></svg>
  </button>
  <div
    :id="`${props.id}-pop`"
    ref="popEl"
    class="pop checklist-pop"
    popover="manual"
    role="dialog"
    :aria-label="props.label"
    @keydown.esc.stop.prevent="closePop()"
  >
    <div class="checklist-head">
      <input
        ref="filterEl"
        v-model="query"
        class="input input--sm"
        type="search"
        autocomplete="off"
        spellcheck="false"
        :aria-label="props.copy.filter"
        :placeholder="props.copy.filter"
        @keydown.enter.prevent
      />
      <div class="checklist-bulk">
        <button class="btn btn-ghost btn-xs" type="button" :disabled="!matches.length" @click="selectAll">
          {{ fill(props.copy.selectAll, { count: matches.length }) }}
        </button>
        <button class="btn btn-ghost btn-xs" type="button" :disabled="!props.modelValue.length" @click="clearAll">{{ props.copy.clear }}</button>
      </div>
    </div>
    <div class="checklist-list" role="group" :aria-label="props.label">
      <label v-for="option in visible" :key="option.value" class="pop-item checklist-item" :title="option.label">
        <input type="checkbox" :checked="checked.has(option.value)" @change="toggle(option.value, !checked.has(option.value))" />
        <span class="pop-item-label">{{ option.label }}</span>
        <span v-if="option.sub" class="pop-item-sub">{{ option.sub }}</span>
      </label>
      <p v-if="!matches.length" class="checklist-status">{{ props.copy.noMatch }}</p>
      <p v-else-if="matches.length > visible.length" class="checklist-status">
        {{ fill(props.copy.more, { shown: visible.length, total: matches.length }) }}
      </p>
    </div>
  </div>
</template>
