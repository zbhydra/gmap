<script setup lang="ts">
/**
 * History 工具栏（role=search）：搜索、状态筛选、时间范围、刷新；视图容器 ≤ 680 时状态与时间范围收进 Filters 菜单。
 *
 * 搜索输入停顿 300ms 生效，Enter 立即生效，Esc 或清除按钮一键清空；输入框聚焦时以正在输入的内容为准，
 * 外部改了查询（最近任务定位、清除筛选）才回写。状态筛选是 radiogroup：方向键与 Home / End 切换并移动焦点。
 * 时间范围与 Filters 都是浮层菜单（§3.8）：预设单选，Custom range 进入日期子面板，点 Apply 才生效；
 * Filters 里的单选点选后保持打开、就地更新。
 */
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { placeSegThumb } from '../../scripts/dashboard/dom'
import { addDays, formatDayRange, localYmd } from '../../scripts/dashboard/format'
import {
  hasHistoryFilters,
  HISTORY_QUERY_MAX,
  HISTORY_STATUSES,
  type HistoryQuery,
  type HistoryStatus
} from '../../scripts/dashboard/route'
import HistoryRangeForm from './HistoryRangeForm.vue'
import PopMenu, { type PopMenuPanel } from './PopMenu.vue'

const props = defineProps<{
  copy: DashboardContent['history']
  /** 浮层子面板返回按钮的无障碍名称。 */
  backLabel: string
  query: HistoryQuery
  /** 手动刷新进行中：刷新图标转圈。 */
  refreshing: boolean
}>()

const emit = defineEmits<{
  search: [q: string]
  status: [status: HistoryStatus]
  /** 时间范围：预设时 from / to 为空，自定义时是两端都含的纽约日历日。 */
  range: [value: Pick<HistoryQuery, 'range' | 'from' | 'to'>]
  /** 清除筛选（连同搜索）。 */
  clear: []
  refresh: []
}>()

const SEARCH_DEBOUNCE_MS = 300
const RANGE_PRESETS = ['7d', '30d', 'all'] as const
type RangePreset = (typeof RANGE_PRESETS)[number]
/** 自定义范围默认填最近 7 天（含今天）。 */
const CUSTOM_DEFAULT_DAYS = 7

const text = ref(props.query.q)
/** 日期子面板的草稿：每次打开菜单重建，点 Apply 才写入查询。 */
const draft = reactive({ from: '', to: '' })
const today = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const statusEl = ref<HTMLElement | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let statusObserver: ResizeObserver | null = null

const rangePanels = computed<PopMenuPanel[]>(() => [{ id: 'hist-range-custom', title: props.copy.range.custom, form: true }])
const filterPanels = computed<PopMenuPanel[]>(() => [{ id: 'hist-filter-custom', title: props.copy.range.custom, form: true }])
const isCustom = computed(() => props.query.range === 'custom')
/** 时间范围按钮与 Custom range 项上显示的区间。 */
const rangeText = computed(() => props.query.range === 'custom'
  ? formatDayRange(props.query.from, props.query.to)
  : presetLabel(props.query.range))
/** Filters 按钮上的数字：状态与时间范围里非默认值的个数。 */
const filterCount = computed(() => Number(props.query.status !== 'all') + Number(props.query.range !== 'all'))

function statusLabel(status: HistoryStatus): string {
  if (status === 'all') return props.copy.filters.all
  if (status === 'running') return props.copy.filters.running
  return props.copy.status[status]
}

function presetLabel(range: RangePreset): string {
  if (range === '7d') return props.copy.range.last7
  if (range === '30d') return props.copy.range.last30
  return props.copy.range.all
}

/** 打开时间范围或 Filters 菜单：丢掉上次没有 Apply 的日期；当前是自定义范围时从它开始，否则默认最近 7 天。 */
function openDraft(): void {
  today.value = localYmd(Date.now())
  draft.from = isCustom.value ? props.query.from : addDays(today.value, 1 - CUSTOM_DEFAULT_DAYS)
  draft.to = isCustom.value ? props.query.to : today.value
}

function selectRange(range: RangePreset): void {
  if (range !== props.query.range) emit('range', { range, from: '', to: '' })
}

function applyCustom(close: () => void): void {
  const { from, to } = draft
  if (!isCustom.value || from !== props.query.from || to !== props.query.to) emit('range', { range: 'custom', from, to })
  close()
}

function applySearch(): void {
  clearTimeout(searchTimer)
  const q = text.value.trim().slice(0, HISTORY_QUERY_MAX)
  if (q !== props.query.q) emit('search', q)
}

function handleInput(): void {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(applySearch, SEARCH_DEBOUNCE_MS)
}

function handleSearchKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    applySearch()
  } else if (event.key === 'Escape' && text.value) {
    event.preventDefault()
    text.value = ''
    applySearch()
  }
}

function clearSearch(): void {
  text.value = ''
  applySearch()
  inputEl.value?.focus()
}

function selectStatus(status: HistoryStatus, focus = false): void {
  if (status !== props.query.status) emit('status', status)
  if (focus) statusEl.value?.querySelector<HTMLElement>(`[data-status="${status}"]`)?.focus()
}

function handleStatusKeydown(event: KeyboardEvent): void {
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
    : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
  if (!step && event.key !== 'Home' && event.key !== 'End') return
  event.preventDefault()
  const count = HISTORY_STATUSES.length
  const index = HISTORY_STATUSES.indexOf(props.query.status)
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (index + step + count) % count
  selectStatus(HISTORY_STATUSES[next], true)
}

function focusSearch(): void {
  inputEl.value?.focus()
}

defineExpose({ focusSearch })

watch(() => props.query.q, q => {
  if (document.activeElement !== inputEl.value) text.value = q
})

watch(() => props.query.status, () => {
  if (statusEl.value) placeSegThumb(statusEl.value)
}, { flush: 'post' })

// 字体加载、视图从隐藏切回与宽度变化都会改变按钮尺寸：滑块直接对齐，不做过渡
watch(statusEl, element => {
  statusObserver?.disconnect()
  if (!element) return
  placeSegThumb(element, true)
  statusObserver = new ResizeObserver(() => placeSegThumb(element, true))
  statusObserver.observe(element)
}, { flush: 'post' })

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  statusObserver?.disconnect()
})
</script>

<template>
  <div class="hist-bar" role="search" :aria-label="props.copy.filters.label">
    <div class="hist-search">
      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-search" /></svg>
      <input
        ref="inputEl"
        v-model="text"
        class="input input--sm"
        type="search"
        :maxlength="HISTORY_QUERY_MAX"
        :placeholder="props.copy.search.placeholder"
        :aria-label="props.copy.search.label"
        autocomplete="off"
        spellcheck="false"
        enterkeyhint="search"
        @input="handleInput"
        @keydown="handleSearchKeydown"
      />
      <button
        v-if="text"
        class="icon-btn icon-btn--sm hist-clear"
        type="button"
        :aria-label="props.copy.search.clear"
        @click="clearSearch"
      >
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-x" /></svg>
      </button>
    </div>

    <div
      ref="statusEl"
      class="seg seg--sm hist-status"
      role="radiogroup"
      :aria-label="props.copy.filters.status"
      @keydown="handleStatusKeydown"
    >
      <span class="seg-thumb" aria-hidden="true"></span>
      <button
        v-for="status in HISTORY_STATUSES"
        :key="status"
        class="seg-btn"
        type="button"
        role="radio"
        :aria-checked="status === props.query.status ? 'true' : 'false'"
        :tabindex="status === props.query.status ? 0 : -1"
        :data-status="status"
        @click="selectStatus(status)"
      >
        {{ statusLabel(status) }}
      </button>
    </div>

    <PopMenu
      id="hist-range"
      :label="props.copy.range.label"
      :back-label="props.backLabel"
      :panels="rangePanels"
      align="end"
      focus-checked
      pop-class="range-pop"
      @open="openDraft"
    >
      <template #trigger="{ bind }">
        <button class="btn btn-secondary btn-xs hist-range-btn" type="button" v-bind="bind">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-calendar" /></svg>
          <span>{{ rangeText }}</span>
          <svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-chevron-down" /></svg>
        </button>
      </template>
      <button
        v-for="range in RANGE_PRESETS"
        :key="range"
        class="pop-item"
        type="button"
        role="menuitemradio"
        tabindex="-1"
        :aria-checked="range === props.query.range ? 'true' : 'false'"
        @click="selectRange(range)"
      >
        <span class="pop-item-label">{{ presetLabel(range) }}</span>
        <svg class="icon pop-check" aria-hidden="true"><use href="/img/icons.svg#i-check" /></svg>
      </button>
      <button
        class="pop-item"
        :class="{ 'is-current': isCustom }"
        type="button"
        role="menuitem"
        tabindex="-1"
        aria-haspopup="dialog"
        aria-controls="hist-range-custom"
      >
        <span class="pop-item-label">{{ props.copy.range.custom }}</span>
        <span class="pop-item-end">
          <template v-if="isCustom">{{ rangeText }}</template>
          <svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-chevron-right" /></svg>
        </span>
      </button>
      <template #hist-range-custom="{ close }">
        <HistoryRangeForm
          v-model:from="draft.from"
          v-model:to="draft.to"
          id-prefix="hist-range"
          :copy="props.copy.range"
          :today="today"
          @apply="applyCustom(close)"
        />
      </template>
    </PopMenu>

    <PopMenu
      id="hist-filter"
      :label="props.copy.filters.label"
      :back-label="props.backLabel"
      :panels="filterPanels"
      align="end"
      pop-class="filter-pop"
      @open="openDraft"
    >
      <template #trigger="{ bind }">
        <button class="btn btn-secondary btn-xs hist-filter-btn" type="button" v-bind="bind">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-filter" /></svg>
          <span>{{ props.copy.filters.button }}</span>
          <span v-if="filterCount" class="count-badge">{{ filterCount }}</span>
        </button>
      </template>
      <div role="group" :aria-label="props.copy.filters.status">
        <span class="pop-label d-label" aria-hidden="true">{{ props.copy.filters.status }}</span>
        <button
          v-for="status in HISTORY_STATUSES"
          :key="status"
          class="pop-item"
          type="button"
          role="menuitemradio"
          tabindex="-1"
          :aria-checked="status === props.query.status ? 'true' : 'false'"
          data-pop-stay
          @click="selectStatus(status)"
        >
          <span class="pop-item-label">{{ statusLabel(status) }}</span>
          <svg class="icon pop-check" aria-hidden="true"><use href="/img/icons.svg#i-check" /></svg>
        </button>
      </div>
      <div class="pop-sep" role="separator"></div>
      <div role="group" :aria-label="props.copy.range.label">
        <span class="pop-label d-label" aria-hidden="true">{{ props.copy.range.label }}</span>
        <button
          v-for="range in RANGE_PRESETS"
          :key="range"
          class="pop-item"
          type="button"
          role="menuitemradio"
          tabindex="-1"
          :aria-checked="range === props.query.range ? 'true' : 'false'"
          data-pop-stay
          @click="selectRange(range)"
        >
          <span class="pop-item-label">{{ presetLabel(range) }}</span>
          <svg class="icon pop-check" aria-hidden="true"><use href="/img/icons.svg#i-check" /></svg>
        </button>
        <button
          class="pop-item"
          :class="{ 'is-current': isCustom }"
          type="button"
          role="menuitem"
          tabindex="-1"
          aria-haspopup="dialog"
          aria-controls="hist-filter-custom"
        >
          <span class="pop-item-label">{{ props.copy.range.custom }}</span>
          <span class="pop-item-end">
            <template v-if="isCustom">{{ rangeText }}</template>
            <svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-chevron-right" /></svg>
          </span>
        </button>
      </div>
      <div class="pop-sep" role="separator"></div>
      <button
        class="pop-item"
        type="button"
        role="menuitem"
        tabindex="-1"
        :aria-disabled="hasHistoryFilters(props.query) ? undefined : 'true'"
        @click="emit('clear')"
      >
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-x" /></svg>
        <span class="pop-item-label">{{ props.copy.filters.clear }}</span>
      </button>
      <template #hist-filter-custom="{ close }">
        <HistoryRangeForm
          v-model:from="draft.from"
          v-model:to="draft.to"
          id-prefix="hist-filter"
          :copy="props.copy.range"
          :today="today"
          @apply="applyCustom(close)"
        />
      </template>
    </PopMenu>

    <button
      class="btn btn-secondary btn-xs hist-refresh"
      :class="{ 'is-spinning': props.refreshing }"
      type="button"
      :aria-busy="props.refreshing ? 'true' : undefined"
      @click="emit('refresh')"
    >
      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
      <span class="hist-refresh-label">{{ props.copy.refresh }}</span>
    </button>
  </div>
</template>
