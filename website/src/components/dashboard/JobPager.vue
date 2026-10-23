<script setup lang="ts">
/**
 * History 分页条：结果区间、上一页 / 页码 / 下一页、每页条数。
 * 页码固定 7 格（首尾 + 当前页附近 + 省略号），翻页时分页条宽度不变；
 * 边界按钮用 aria-disabled 而不是 disabled，翻到末页时焦点仍留在按钮上。
 * 每页条数是 listbox 浮层（§3.8），靠近视口底部时向上弹出；改条数回到第 1 页由上层处理。
 */
import { computed } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { fill } from '../../scripts/dashboard/format'
import { PAGE_SIZES, type PageSize } from '../../scripts/dashboard/route'
import PopListbox, { type ListOption } from './PopListbox.vue'

const props = defineProps<{
  copy: DashboardContent['history']['pagination']
  page: number
  pages: number
  size: PageSize
  /** 结果区间文案（「21–40 of 62」），读屏播报共用同一份。 */
  summary: string
  /** 列表正在换页或刷新：忽略翻页点击。 */
  busy: boolean
}>()

const emit = defineEmits<{
  page: [page: number]
  size: [size: PageSize]
}>()

const SIZE_OPTIONS: ListOption[] = PAGE_SIZES.map(value => ({ value, label: String(value) }))

const items = computed<(number | 'gap')[]>(() => {
  const { page, pages } = props
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'gap', pages]
  if (page >= pages - 3) return [1, 'gap', pages - 4, pages - 3, pages - 2, pages - 1, pages]
  return [1, 'gap', page - 1, page, page + 1, 'gap', pages]
})

function selectSize(value: number): void {
  const size = PAGE_SIZES.find(item => item === value)
  if (size) emit('size', size)
}

function go(page: number): void {
  if (props.busy || page < 1 || page > props.pages || page === props.page) return
  emit('page', page)
}
</script>

<template>
  <nav class="jobs-foot" :aria-label="props.copy.label">
    <span class="jobs-range">{{ props.summary }}</span>
    <div class="pager">
      <button
        class="btn btn-secondary btn-xs"
        type="button"
        :aria-disabled="props.page <= 1 ? 'true' : undefined"
        data-history-prev
        @click="go(props.page - 1)"
      >
        {{ props.copy.previous }}
      </button>
      <div class="pager-pages">
        <template v-for="(item, index) in items" :key="`${index}-${item}`">
          <span v-if="item === 'gap'" class="page-gap" aria-hidden="true">…</span>
          <button
            v-else
            class="page-btn"
            type="button"
            :aria-label="fill(props.copy.page, { page: item })"
            :aria-current="item === props.page ? 'page' : undefined"
            @click="go(item)"
          >
            {{ item }}
          </button>
        </template>
      </div>
      <button
        class="btn btn-secondary btn-xs"
        type="button"
        :aria-disabled="props.page >= props.pages ? 'true' : undefined"
        data-history-next
        @click="go(props.page + 1)"
      >
        {{ props.copy.next }}
      </button>
    </div>
    <div class="pager-size">
      <span id="hist-size-label">{{ props.copy.pageSize }}</span>
      <PopListbox
        id="hist-size"
        labelledby="hist-size-label"
        :options="SIZE_OPTIONS"
        :model-value="props.size"
        @update:model-value="selectSize"
      />
    </div>
  </nav>
</template>
