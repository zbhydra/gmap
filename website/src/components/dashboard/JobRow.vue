<script setup lang="ts">
/**
 * 任务行：History 完整列表与 Online 最近任务共用。
 *
 * 5 列（任务格 / 进度 / 记录 / 状态与错误 / 操作），窄视图容器下由样式折成卡片。
 * 紧凑变体（最近任务）没有展开：任务格是去 History 定位该任务的真实链接，修饰键交给浏览器开新标签。
 * History 行点整行或 caret 展开明细；选中文字时不展开，避免复制任务号时误触。
 */
import { computed, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { ExportJobDetail, ExportJobStatus, ExportJobSummary } from '../../scripts/dashboard/api'
import { formatNumber } from '../../scripts/dashboard/format'
import type { DownloadFormat } from '../../scripts/dashboard/workspace'
import { errorLabel, isRunningStatus, shortJobNo } from '../../scripts/dashboard/jobs'
import { isPlainClick } from '../../scripts/dashboard/route'
import JobDetail from './JobDetail.vue'
import JobIdent from './JobIdent.vue'

const props = defineProps<{
  copy: DashboardContent
  job: ExportJobSummary
  /** 最近任务的紧凑变体：任务格是链接，没有展开。 */
  compact?: boolean
  /** 紧凑变体的链接：History 并以完整任务号搜索。 */
  href?: string
  /** 当前搜索词：关键词与任务号前缀高亮。 */
  query?: string
  expanded?: boolean
  detail?: ExportJobDetail
  detailFailed?: boolean
  /** 正在下载的格式；同一任务下载期间两个按钮都不可再点。 */
  downloading?: DownloadFormat
  downloadMessage?: string
  /** 刚提交的任务：插入时短暂高亮。 */
  fresh?: boolean
}>()

const emit = defineEmits<{
  open: []
  toggle: []
  download: [format: DownloadFormat]
  retryDetail: []
}>()

/** 下载按钮：可见文字是格式名（不翻译），完整动作走 aria-label。 */
const DOWNLOAD_FORMATS = [
  { value: 'csv', text: 'CSV', label: 'downloadCsv' },
  { value: 'xlsx', text: 'Excel', label: 'downloadXlsx' }
] as const satisfies readonly { value: DownloadFormat; text: string; label: 'downloadCsv' | 'downloadXlsx' }[]

/** 状态徽标：图标、文字、颜色三重编码；运行中两态用转圈（icon 为空）。 */
const STATUS_BADGE: Record<ExportJobStatus, { tone: string; icon: string }> = {
  queued: { tone: 'badge--muted', icon: 'clock' },
  collecting: { tone: '', icon: '' },
  publishing: { tone: '', icon: '' },
  completed: { tone: 'badge--ok', icon: 'check' },
  partial: { tone: 'badge--warn', icon: 'alert' },
  failed: { tone: 'badge--bad', icon: 'x' }
}

const running = computed(() => isRunningStatus(props.job.status))
const badge = computed(() => STATUS_BADGE[props.job.status])
const progress = computed(() => {
  const { processed_count: done, total_count: total } = props.job
  return total > 0 ? `${Math.min(100, (done / total) * 100).toFixed(2)}%` : '0%'
})

/** 状态变化时徽标淡入一次；首屏渲染不播放。 */
const statusChanged = ref(false)
watch(() => props.job.status, () => {
  statusChanged.value = true
})

function openFromLink(event: MouseEvent): void {
  if (!isPlainClick(event)) return
  event.preventDefault()
  emit('open')
}

function toggleFromRow(event: MouseEvent): void {
  if (props.compact || !(event.target instanceof Element)) return
  if (event.target.closest('a, input, select, textarea, button')) return
  if (String(window.getSelection())) return
  emit('toggle')
}
</script>

<template>
  <li class="job" :class="{ 'is-open': props.expanded, 'is-new': props.fresh }" :data-job="props.job.job_no">
    <div class="job-row" @click="toggleFromRow">
      <div class="jc jc-id">
        <a v-if="props.compact" class="job-link" :href="props.href" @click="openFromLink">
          <span class="job-ident"><JobIdent :copy="props.copy.history" :job="props.job" query="" /></span>
        </a>
        <button
          v-else
          class="job-toggle"
          type="button"
          :aria-expanded="props.expanded ? 'true' : 'false'"
          :aria-controls="`jd-${props.job.job_no}`"
          :data-history-expand="props.job.job_no"
          @click="emit('toggle')"
        >
          <span class="job-caret" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-chevron-right" /></svg></span>
          <span class="job-ident"><JobIdent :copy="props.copy.history" :job="props.job" :query="props.query ?? ''" /></span>
        </button>
      </div>

      <div class="jc jc-prog">
        <span class="jc-label d-label">{{ props.copy.history.columns.samples }}</span>
        <div class="jc-body">
          <span class="job-prog-text">
            <b class="mono-num">{{ formatNumber(props.job.processed_count) }}</b> / <span class="mono-num">{{ formatNumber(props.job.total_count) }}</span>
          </span>
          <div v-if="running" class="meter meter--thin" aria-hidden="true"><i :style="{ '--v': progress }"></i></div>
        </div>
      </div>

      <div class="jc jc-rec">
        <span class="jc-label d-label">{{ props.copy.history.columns.records }}</span>
        <div class="jc-body">
          <span class="job-records mono-num">{{ props.job.status === 'queued' ? '—' : formatNumber(props.job.record_count) }}</span>
        </div>
      </div>

      <div class="jc jc-status">
        <span class="jc-label d-label">{{ props.copy.history.columns.status }}</span>
        <div class="jc-body">
          <span :key="props.job.status" class="badge" :class="[badge.tone, { 'is-changed': statusChanged }]">
            <svg v-if="badge.icon" class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${badge.icon}`" /></svg>
            <span v-else class="spinner spinner--xs" aria-hidden="true"></span>
            {{ props.copy.history.status[props.job.status] }}
          </span>
        </div>
      </div>

      <div class="jc jc-err">
        <p v-if="props.job.error_code !== null" class="job-err">{{ errorLabel(props.copy.history, props.job.error_code) }}</p>
      </div>

      <div class="jc jc-act">
        <div v-if="props.job.has_file" class="job-downloads">
          <button
            v-for="format in DOWNLOAD_FORMATS"
            :key="format.value"
            class="btn btn-secondary btn-xs"
            :class="{ 'is-busy': props.downloading === format.value }"
            type="button"
            :disabled="props.downloading !== undefined && props.downloading !== format.value"
            :aria-label="`${props.copy.history[format.label]} ${shortJobNo(props.job.job_no)}`"
            :aria-busy="props.downloading === format.value ? 'true' : undefined"
            :data-history-download="props.job.job_no"
            :data-download-format="format.value"
            @click="emit('download', format.value)"
          >
            <span v-if="props.downloading === format.value" class="spinner spinner--sm" aria-hidden="true"></span>
            <svg v-else class="icon" aria-hidden="true"><use href="/img/icons.svg#i-download" /></svg>
            {{ props.downloading === format.value ? props.copy.history.downloading : format.text }}
          </button>
        </div>
        <span v-else-if="!running" class="job-nofile">{{ props.copy.history.noFile }}</span>
        <p v-if="props.downloadMessage" class="inline-err" role="alert">{{ props.downloadMessage }}</p>
      </div>
    </div>

    <div
      v-if="!props.compact"
      :id="`jd-${props.job.job_no}`"
      class="job-detail"
      role="region"
      :aria-label="`${props.copy.history.detail.show} ${shortJobNo(props.job.job_no)}`"
      :inert="!props.expanded"
    >
      <div class="job-detail-inner">
        <div class="job-detail-pad">
          <JobDetail
            v-if="props.expanded || props.detail"
            :copy="props.copy"
            :job-no="props.job.job_no"
            :detail="props.detail"
            :failed="props.detailFailed ?? false"
            :query="props.query ?? ''"
            @retry="emit('retryDetail')"
          />
        </div>
      </div>
    </div>
  </li>
</template>
