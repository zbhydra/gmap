<script setup lang="ts">
/**
 * History：完整任务列表（服务端分页）+ 搜索 / 状态 / 时间范围筛选，行可展开明细。
 *
 * - 查询条件的唯一真相是根组件的 query（与地址栏同步）；这里只发 update:query，查询变化后统一由侦听重新拉取。
 * - 加载分四种：首次（视图骨架）、换页或改筛选（列表区换同行数骨架，工具栏与分页条不重绘）、
 *   手动刷新（保留结果、降低不透明度）、轮询（静默）。请求带序号，过期响应直接丢弃。
 * - 页码越界回到最后一页。展开状态只由用户和明确意图改变：首次应用某个搜索词（首次加载、提交新词）且完整任务号
 *   命中时自动展开；从最近任务定位时由根组件调用 revealJob 展开。查询变化（改筛选、翻页）收起所有，
 *   刷新与轮询不改变用户的展开选择。
 * - 只在当前视图时每 5 秒轮询运行中的任务，已展开的运行中任务同时静默刷新明细（进入终态时再刷新一次）；
 *   页面在后台时暂停，回到前台立即刷新一次。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { getExportJob, listExportJobs, type ExportJobDetail, type ExportJobList, type ExportJobSummary } from '../../scripts/dashboard/api'
import { reducedMotion, replayClass } from '../../scripts/dashboard/dom'
import { fill, formatNumber } from '../../scripts/dashboard/format'
import { hasRunning, isRunningStatus, POLL_INTERVAL_MS } from '../../scripts/dashboard/jobs'
import {
  FULL_JOB_NO,
  hasHistoryFilters,
  historyApiQuery,
  historySearch,
  isPlainClick,
  readHistoryQuery,
  type HistoryQuery
} from '../../scripts/dashboard/route'
import { isSessionExpiry, type DashboardWorkspace } from '../../scripts/dashboard/workspace'
import { trackDashboardAction } from '../../scripts/homepage/web-mark'
import HistoryToolbar from './HistoryToolbar.vue'
import JobPager from './JobPager.vue'
import JobRow from './JobRow.vue'

const props = defineProps<{
  copy: DashboardContent
  workspace: DashboardWorkspace
  /** History 是当前视图：只在这时加载新查询与轮询。 */
  active: boolean
  query: HistoryQuery
  onlineHref: string
}>()

const emit = defineEmits<{
  'update:query': [query: HistoryQuery]
  openOnline: []
  /** 首次加载结束（成功或失败），根组件据此换下视图骨架。 */
  ready: []
  /** 列表有运行中的任务且刷新正常：顶栏显示自动刷新提示。 */
  live: [value: boolean]
}>()

type LoadMode = 'initial' | 'swap' | 'busy' | 'silent'

const jobs = ref<ExportJobSummary[]>([])
const total = ref(0)
const loading = ref(false)
const loadingMode = ref<LoadMode>('initial')
const loadError = ref(false)
const refreshError = ref(false)
const announcement = ref('')
const expanded = reactive(new Set<string>())
const details = reactive(new Map<string, ExportJobDetail>())
const detailErrors = reactive(new Set<string>())
const toolbar = ref<InstanceType<typeof HistoryToolbar> | null>(null)
const toolbarHost = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)
let started = false
let ready = false
let disposed = false
let loadSeq = 0
let loadingKey = ''
let loadedKey = ''
let pollTimer: ReturnType<typeof setTimeout> | undefined

const state = computed(() => props.workspace.state)
const pages = computed(() => Math.max(1, Math.ceil(total.value / props.query.size)))
const page = computed(() => Math.min(props.query.page, pages.value))
const summary = computed(() => {
  const from = total.value ? (page.value - 1) * props.query.size + 1 : 0
  const to = Math.min(page.value * props.query.size, total.value)
  return fill(props.copy.history.pagination.summary, { from: formatNumber(from), to: formatNumber(to), total: formatNumber(total.value) })
})
const filtered = computed(() => hasHistoryFilters(props.query))
/** 列表区当前展示什么：换页 / 改筛选时是同行数骨架。 */
const panel = computed(() => {
  if (loading.value && (loadingMode.value === 'swap' || loadingMode.value === 'initial')) return 'skeleton'
  if (loadError.value) return 'fail'
  if (!total.value) return filtered.value ? 'nomatch' : 'empty'
  return 'list'
})
/** 与当前行数一致的骨架（至少 3 行），列表区高度在加载中保持不变。 */
const skeletonRows = computed(() => Math.min(Math.max(jobs.value.length || 5, 3), props.query.size))

function setQuery(next: Partial<HistoryQuery>, resetPage = true): void {
  // 筛选动作反映用户在想看什么：状态/时间范围/每页条数/搜索词各自独立可查。
  trackDashboardAction('history_filter', {
    status: next.status ?? props.query.status,
    range: next.range ?? props.query.range,
    size: next.size ?? props.query.size,
    has_keyword: Boolean(next.q ?? props.query.q)
  })
  emit('update:query', { ...props.query, ...next, ...(resetPage ? { page: 1 } : {}) })
}

/** 清除筛选（连同搜索）：Filters 菜单里关闭后焦点照常回到 Filters 按钮。 */
function clearFilters(): void {
  setQuery({ q: '', status: 'all', range: 'all', from: '', to: '' })
}

/** 无匹配空态的 Clear filters：按钮随空态消失，焦点交给搜索框。 */
function resetFilters(): void {
  clearFilters()
  // 聚焦中的搜索框不接受外部回写：等空查询传到工具栏、清空输入后再聚焦
  void nextTick(() => toolbar.value?.focusSearch())
}

/* ---------------------------------------------------------------- 加载 */

function schedulePoll(): void {
  clearTimeout(pollTimer)
  if (disposed || !props.active || document.hidden || loading.value || !hasRunning(jobs.value)) return
  pollTimer = setTimeout(() => {
    void load('silent')
  }, POLL_INTERVAL_MS)
}

/** 换页或改筛选后回到列表顶部：只在工具栏已滚出视口时滚动（吸顶顶栏由 scroll-padding-top 让出）。 */
function scrollToTop(): void {
  const anchor = toolbarHost.value?.querySelector('.hist-bar') ?? toolbarHost.value
  const topbar = document.querySelector('.dash-topbar')
  if (anchor && topbar && anchor.getBoundingClientRect().top < topbar.getBoundingClientRect().height) {
    anchor.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' })
  }
}

async function load(mode: LoadMode): Promise<void> {
  const seq = ++loadSeq
  const query = props.query
  const key = historySearch(query)
  // 上一次开始加载的查询（可能失败，或被这次取代）：与上次成功加载的一起判断这次是否首次应用搜索词
  const startedBefore = loadingKey
  // 加载前已展开的任务：返回后只为它们静默刷新明细，加载期间才展开的（定位、用户点开）展开时已读过
  const expandedBefore = new Set(expanded)
  clearTimeout(pollTimer)
  loading.value = true
  loadingMode.value = mode
  loadingKey = key
  if (mode === 'swap') void nextTick(scrollToTop)
  let data: ExportJobList | null = null
  let failure: unknown = null
  try {
    data = await listExportJobs(props.workspace.context, historyApiQuery(query, Date.now()))
  } catch (error) {
    failure = error
  }
  if (disposed || seq !== loadSeq) return

  let expand = ''
  // 刷新前仍在运行的任务：本次进入终态时，已展开的明细再静默刷新一次，展示最终计数
  const wasRunning = new Set(jobs.value.filter(job => isRunningStatus(job.status)).map(job => job.job_no))
  if (data) {
    // 页码越界（筛选后结果变少、地址栏手改）：回到最后一页，由查询侦听重新拉取
    const lastPage = Math.max(1, Math.ceil(data.total / query.size))
    if (query.page > lastPage) {
      setQuery({ page: lastPage }, false)
      return
    }
    // 搜索词与上次成功加载、上一次开始加载的任一不同即首次应用（首次加载、提交新词、改回原词）；
    // 只改筛选、翻页、刷新与轮询时两者都相同
    const firstApply = readHistoryQuery(loadedKey).q !== query.q || readHistoryQuery(startedBefore).q !== query.q
    jobs.value = data.jobs
    total.value = data.total
    loadedKey = key
    loadError.value = false
    refreshError.value = false
    state.value.historyStale = false
    props.workspace.observeJobs(data.jobs)
    if (firstApply && FULL_JOB_NO.test(query.q) && data.jobs.some(job => job.job_no === query.q) && !expanded.has(query.q)) {
      expanded.add(query.q)
      expand = query.q
    }
  } else {
    if (!isSessionExpiry(failure)) console.error(new Error(`[dashboard-history] list export jobs failed: mode=${mode}`, { cause: failure }))
    // 刷新 / 轮询失败保留上次结果并提示；首次、换页与改筛选失败则列表区换成失败面板
    if ((mode === 'busy' || mode === 'silent') && jobs.value.length && !loadError.value) refreshError.value = true
    else {
      loadError.value = true
      jobs.value = []
      total.value = 0
    }
  }

  loading.value = false
  if (!ready) {
    ready = true
    emit('ready')
  }
  if (mode !== 'silent') {
    announcement.value = loadError.value
      ? props.copy.history.loadFailed
      : refreshError.value
        ? props.copy.history.refreshFailed
        : !total.value
          ? filtered.value ? props.copy.history.noMatchTitle : props.copy.history.emptyTitle
          : summary.value
  }
  if (data && (mode === 'swap' || mode === 'initial')) {
    await nextTick()
    if (listEl.value) replayClass(listEl.value, 'is-revealed')
  }
  if (expand) void loadDetail(expand)
  for (const job of jobs.value) {
    if (!expandedBefore.has(job.job_no) || !expanded.has(job.job_no)) continue
    if (isRunningStatus(job.status) || wasRunning.has(job.job_no)) void loadDetail(job.job_no, true)
  }
  schedulePoll()
}

function refresh(): void {
  if (loading.value && loadingMode.value !== 'silent') return
  refreshError.value = false
  void load('busy')
}

/** 进入视图：首次加载；查询在别处改过时换骨架重拉；有新提交或运行中的任务时静默刷新当前页。 */
function activate(): void {
  if (!started) {
    started = true
    void load('initial')
    return
  }
  const current = historySearch(props.query)
  if ((loading.value ? loadingKey : loadedKey) !== current) void load(ready ? 'swap' : 'initial')
  else if (!loading.value && (state.value.historyStale || hasRunning(jobs.value))) void load('silent')
}

/* ---------------------------------------------------------------- 明细 */

function retryDetail(jobNo: string): void {
  trackDashboardAction('history_detail_retry', { job_no: jobNo })
  void loadDetail(jobNo)
}

async function loadDetail(jobNo: string, silent = false): Promise<void> {
  if (!silent) detailErrors.delete(jobNo)
  try {
    const detail = await getExportJob(props.workspace.context, jobNo)
    if (disposed) return
    details.set(jobNo, detail)
    detailErrors.delete(jobNo)
  } catch (error) {
    if (disposed) return
    if (!isSessionExpiry(error)) console.error(new Error(`[dashboard-history] load job detail failed: job_no=${jobNo}`, { cause: error }))
    if (!details.has(jobNo)) detailErrors.add(jobNo)
  }
}

/**
 * 根组件从最近任务定位后调用：明确意图，直接展开并读明细，不等列表按新查询返回。
 * 查询变化时侦听已先收起所有，这里的展开保留到新列表渲染。
 */
function revealJob(jobNo: string): void {
  if (expanded.has(jobNo)) return
  expanded.add(jobNo)
  void loadDetail(jobNo)
}

defineExpose({ revealJob })

function toggle(jobNo: string): void {
  trackDashboardAction('history_job_toggle', { job_no: jobNo })
  if (expanded.delete(jobNo)) return
  expanded.add(jobNo)
  void loadDetail(jobNo)
}

function openOnline(event: MouseEvent): void {
  if (!isPlainClick(event)) return
  event.preventDefault()
  emit('openOnline')
}

/* ---------------------------------------------------------------- 生命周期 */

function handleVisibility(): void {
  if (document.hidden) clearTimeout(pollTimer)
  else if (props.active && !loading.value && hasRunning(jobs.value)) void load('silent')
}

watch(() => historySearch(props.query), () => {
  expanded.clear()
  if (props.active) void load(ready ? 'swap' : 'initial')
})

watch(() => props.active, active => {
  if (active) activate()
  else clearTimeout(pollTimer)
})

watch(() => !refreshError.value && hasRunning(jobs.value), value => emit('live', value), { immediate: true })

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibility)
  if (props.active) activate()
})

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(pollTimer)
  document.removeEventListener('visibilitychange', handleVisibility)
})
</script>

<template>
  <div ref="toolbarHost" class="view-stack">
    <p class="view-intro">{{ props.copy.history.description }}</p>

    <HistoryToolbar
      v-show="panel !== 'empty'"
      ref="toolbar"
      :copy="props.copy.history"
      :back-label="props.copy.shell.back"
      :query="props.query"
      :refreshing="loading && loadingMode === 'busy'"
      @search="q => setQuery({ q })"
      @status="status => setQuery({ status })"
      @range="value => setQuery(value)"
      @clear="clearFilters"
      @refresh="refresh"
    />

    <div class="jobs">
      <div v-if="panel === 'list' && refreshError" class="jobs-banner">
        <div class="callout callout--warn" role="status">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
          <div class="callout-body">
            <span>{{ props.copy.history.refreshFailed }}</span>
            <button class="btn btn-secondary btn-xs" type="button" @click="refresh">
              <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>{{ props.copy.history.refresh }}
            </button>
          </div>
        </div>
      </div>

      <template v-if="panel === 'skeleton' || panel === 'list'">
        <div class="jobs-head" aria-hidden="true">
          <span class="d-label">{{ props.copy.history.columns.taskNo }} · {{ props.copy.history.columns.createdAt }}</span>
          <span class="d-label">{{ props.copy.history.columns.samples }}</span>
          <span class="d-label is-num">{{ props.copy.history.columns.records }}</span>
          <span class="d-label">{{ props.copy.history.columns.status }}</span>
          <span></span>
        </div>
        <ul
          ref="listEl"
          class="jobs-list"
          :aria-label="props.copy.history.title"
          :aria-busy="panel === 'skeleton' || (loading && loadingMode === 'busy') ? 'true' : 'false'"
        >
          <template v-if="panel === 'skeleton'">
            <li v-for="row in skeletonRows" :key="`skeleton-${row}`" class="job is-skel" aria-hidden="true">
              <div class="job-row">
                <span class="skel-stack"><span class="skel" style="width: 72%"></span><span class="skel" style="width: 132px"></span></span>
                <span class="skel" style="width: 64%"></span>
                <span class="skel" style="width: 40px; justify-self: end"></span>
                <span class="skel skel--pill" style="width: 96px; height: 22px"></span>
                <span class="skel skel--pill" style="width: 120px; height: 32px; justify-self: end"></span>
              </div>
            </li>
          </template>
          <template v-else>
            <JobRow
              v-for="job in jobs"
              :key="job.job_no"
              :copy="props.copy"
              :job="job"
              :query="props.query.q"
              :expanded="expanded.has(job.job_no)"
              :detail="details.get(job.job_no)"
              :detail-failed="detailErrors.has(job.job_no)"
              :downloading="state.downloading.has(job.job_no)"
              :download-message="state.downloadMessages.get(job.job_no)"
              @toggle="toggle(job.job_no)"
              @download="props.workspace.download(job.job_no)"
              @retry-detail="retryDetail(job.job_no)"
            />
          </template>
        </ul>
      </template>

      <div v-else-if="panel === 'fail'" class="fail">
        <p class="fail-text">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>{{ props.copy.history.loadFailed }}
        </p>
        <button
          class="btn btn-secondary btn-xs"
          :class="{ 'is-busy': loading }"
          type="button"
          :aria-busy="loading ? 'true' : undefined"
          @click="refresh"
        >
          <span v-if="loading" class="spinner spinner--sm" aria-hidden="true"></span>
          <svg v-else class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
          {{ props.copy.history.retry }}
        </button>
      </div>

      <!-- 两种空态：有筛选时是「无匹配结果」（可一键清除筛选），无筛选时才是「还没有任务」 -->
      <div v-else-if="panel === 'nomatch'" class="empty">
        <span class="icon-tile" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-search" /></svg></span>
        <p class="empty-title">{{ props.copy.history.noMatchTitle }}</p>
        <p class="empty-hint">{{ props.copy.history.noMatchHint }}</p>
        <div class="empty-actions">
          <button class="btn btn-secondary btn-xs" type="button" @click="resetFilters">
            <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-x" /></svg>{{ props.copy.history.filters.clear }}
          </button>
        </div>
      </div>

      <div v-else class="empty">
        <span class="icon-tile" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-table" /></svg></span>
        <p class="empty-title">{{ props.copy.history.emptyTitle }}</p>
        <p class="empty-hint">{{ props.copy.history.emptyHint }}</p>
        <div class="empty-actions">
          <a class="btn btn-primary btn-xs" :href="props.onlineHref" @click="openOnline">
            <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-cloud" /></svg>{{ props.copy.history.emptyCta }}
          </a>
        </div>
      </div>

      <JobPager
        v-if="(panel === 'skeleton' || panel === 'list') && total"
        :copy="props.copy.history.pagination"
        :page="page"
        :pages="pages"
        :size="props.query.size"
        :summary="summary"
        :busy="loading && loadingMode !== 'silent'"
        @page="value => setQuery({ page: value }, false)"
        @size="value => setQuery({ size: value })"
      />
    </div>

    <!-- 读屏：翻页、改筛选、手动刷新后播报结果区间或空态（轮询不播报） -->
    <p class="sr-only" role="status">{{ announcement }}</p>
  </div>
</template>
