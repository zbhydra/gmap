<script setup lang="ts">
/**
 * 任务明细（只在 History 展开时出现）：每个搜索的结果。
 * 第一次展开才加载；失败只影响本任务，可单独重试。
 */
import { trackDashboardAction } from '../../scripts/homepage/web-mark'
import { computed } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { ExportJobDetail, ExportJobItem } from '../../scripts/dashboard/api'
import { fill, formatDateTime, formatNumber } from '../../scripts/dashboard/format'
import { errorLabel, highlightParts, isRunningStatus } from '../../scripts/dashboard/jobs'

const props = defineProps<{
  copy: DashboardContent
  detail: ExportJobDetail | undefined
  failed: boolean
  /** 当前搜索词：关键词命中段高亮。 */
  query: string
}>()

const emit = defineEmits<{ retry: [] }>()

/** 每个搜索一行；重复关键词（地图模式同词多视口）弱化显示，行内条按本任务最大记录数归一（只表达相对量）。 */
const rows = computed(() => {
  const items = props.detail?.items ?? []
  const maxRecords = Math.max(1, ...items.map(item => item.result_count))
  return items.map((item, index) => ({
    item,
    keyword: highlightParts(item.keyword, props.query),
    repeat: index > 0 && items[index - 1].keyword === item.keyword,
    bar: item.completed ? `${((item.result_count / maxRecords) * 100).toFixed(1)}%` : '',
    state: itemState(item)
  }))
})

function itemState(item: ExportJobItem): { tone: string; icon: string; label: string } {
  const history = props.copy.history
  if (item.error_code !== null) return { tone: 'is-bad', icon: 'x', label: errorLabel(history, item.error_code) }
  if (item.completed) return { tone: 'is-ok', icon: 'check', label: history.detail.completed }
  const running = props.detail ? isRunningStatus(props.detail.job.status) : false
  return { tone: '', icon: running ? 'clock' : 'minus', label: history.detail.pending }
}

</script>

<template>
  <div v-if="props.failed" class="callout callout--bad" role="alert">
    <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
    <div class="callout-body">
      <span>{{ props.copy.history.detail.loadFailed }}</span>
      <button class="btn btn-secondary btn-xs" type="button" @click="emit('retry')">
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>{{ props.copy.history.retry }}
      </button>
    </div>
  </div>

  <div v-else-if="!props.detail" class="skel-stack">
    <span class="sr-only" role="status">{{ props.copy.history.detail.loading }}</span>
    <span class="skel skel--block" style="height: 72px" aria-hidden="true"></span>
    <span class="skel skel--block" style="height: 132px" aria-hidden="true"></span>
  </div>

  <template v-else>
    <!-- 显式表格角色：窄屏把表格改成网格排版时仍保留表格语义 -->
    <div class="items" tabindex="0" role="region" :aria-label="props.copy.history.detail.keyword">
      <table role="table">
        <thead role="rowgroup">
          <tr role="row">
            <th role="columnheader" class="is-idx d-label" scope="col">#</th>
            <th role="columnheader" class="d-label" scope="col">{{ props.copy.history.detail.keyword }}</th>
            <th role="columnheader" class="is-num d-label" scope="col">{{ props.copy.history.detail.records }}</th>
            <th role="columnheader" class="d-label" scope="col">{{ props.copy.history.columns.status }}</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <tr v-for="row in rows" :key="row.item.item_index" role="row">
            <td role="cell" class="is-idx mono-num">{{ row.item.item_index + 1 }}</td>
            <td role="cell">
              <div class="item-kw" :class="{ 'is-repeat': row.repeat }">
                <b>{{ row.keyword.before }}<mark v-if="row.keyword.match" class="hl">{{ row.keyword.match }}</mark>{{ row.keyword.after }}</b>
                <span v-if="row.item.viewport" class="item-vp">{{ fill(props.copy.history.detail.viewport, {
                  lat: row.item.viewport.lat.toFixed(4),
                  lng: row.item.viewport.lng.toFixed(4),
                  zoom: row.item.viewport.zoom
                }) }}</span>
              </div>
            </td>
            <td role="cell" class="is-num">
              <span class="item-rec">
                <span v-if="row.bar" class="item-bar" aria-hidden="true"><i :style="{ '--v': row.bar }"></i></span>
                <span class="mono-num">{{ row.item.completed ? formatNumber(row.item.result_count) : '—' }}</span>
              </span>
            </td>
            <td role="cell">
              <span class="item-state" :class="row.state.tone">
                <svg class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${row.state.icon}`" /></svg>{{ row.state.label }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="d-hint">{{ props.copy.history.dedupeHint }}</p>
  </template>
</template>
