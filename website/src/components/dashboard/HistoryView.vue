<script setup lang="ts">
/**
 * Online 创建与历史：复用实时权益，串行刷新处理中任务及展开明细。
 *
 * 展开和下载失败就地提示；状态、采样收口和文件可用性分别沿用后端事实。
 */
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { OnlineViewport } from '../../scripts/dashboard/map-grid'
import { HomepageApiError } from '../../scripts/homepage/api'
import {
  getExportDownload,
  getExportJob,
  listExportJobs,
  createExportJob,
  getOnlineOptions,
  type OnlineOptions,
  type ExportJobDetail,
  type ExportJobSummary,
  type ExportItemInput
} from '../../scripts/dashboard/api'

export interface Props {
  copy: DashboardContent
  token: string
  deviceId: string
}

const props = defineProps<Props>()
const OnlineMapInput = defineAsyncComponent(() => import('./OnlineMapInput.vue'))
const OnlineRegionInput = defineAsyncComponent(() => import('./OnlineRegionInput.vue'))

/** 每页条数（与方案合同一致，后端默认一致）。 */
const PAGE_SIZE = 20

let businessTimezoneFormatter: Intl.DateTimeFormat | null = null

/** 后端业务时区格式化器；Astro SSR 也会执行组件模块，读取 DOM 必须推迟到客户端。 */
function createdAtFormatter(): Intl.DateTimeFormat {
  if (!businessTimezoneFormatter) {
    businessTimezoneFormatter = new Intl.DateTimeFormat(document.documentElement.lang || 'en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return businessTimezoneFormatter
}

const jobs = ref<ExportJobSummary[]>([])
const total = ref(0)
const offset = ref(0)
const loading = ref(false)
const loadError = ref(false)
const options = ref<OnlineOptions | null>(null)
const optionsLoading = ref(false)
const optionsError = ref(false)
const keywordsText = ref('')
const mode = ref<'keywords' | 'map' | 'regions'>('keywords')
const mapOpened = ref(false)
const regionsOpened = ref(false)
const mapViewports = ref<OnlineViewport[]>([])
const regionQueries = ref<string[]>([])
const regionResetKey = ref(0)
const includeContacts = ref(true)
const submitting = ref(false)
const submitError = ref('')
const activeKeywords = computed(() => [...new Set(
  (mode.value === 'regions' ? regionQueries.value : keywordsText.value.split(/\r?\n/))
    .map(word => word.trim().replace(/\s+/g, ' ')).filter(Boolean)
)])
const items = computed<ExportItemInput[]>(() => activeKeywords.value.flatMap(keyword =>
  mode.value === 'map' ? mapViewports.value.map(viewport => ({ keyword, viewport })) : [{ keyword }]))
const keywordInvalid = computed(() => !!options.value && (activeKeywords.value.length > options.value.keyword_limit || activeKeywords.value.some(word => word.length > 500)))
const invalid = computed(() => !options.value || !items.value.length || keywordInvalid.value
  || items.value.length > options.value.logical_sample_limit)
let pollTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false

function selectMode(next: 'keywords' | 'map' | 'regions'): void {
  if (submitting.value) return
  mode.value = next
  if (next === 'map') mapOpened.value = true
  if (next === 'regions') regionsOpened.value = true
}

async function loadOptions(): Promise<void> {
  optionsLoading.value = true
  optionsError.value = false
  try {
    options.value = await getOnlineOptions(context())
    if (!options.value.contacts_allowed) includeContacts.value = false
  } catch (error) {
    console.error(new Error('dashboard creation: options failed', { cause: error }))
    options.value = null
    optionsError.value = true
  } finally {
    optionsLoading.value = false
  }
}

async function submitJob(): Promise<void> {
  if (submitting.value || loading.value || invalid.value || options.value?.usage.exhausted) return
  submitting.value = true
  clearTimeout(pollTimer)
  submitError.value = ''
  let nextOffset = offset.value
  try {
    await createExportJob(context(), items.value, includeContacts.value && !!options.value?.contacts_allowed)
    if (mode.value === 'regions') {
      regionQueries.value = []
      regionResetKey.value += 1
    } else keywordsText.value = ''
    expanded.value = new Set()
    details.value = new Map()
    nextOffset = 0
  } catch (error) {
    console.error(new Error('dashboard creation: submission failed', { cause: error }))
    submitError.value = error instanceof HomepageApiError && typeof error.code === 'number'
      ? error.message : props.copy.create.failed
  } finally {
    submitting.value = false
    await loadPage(nextOffset)
    if (!submitError.value) await loadOptions()
  }
}

/** 展开中的任务明细（按任务号独立加载，互不影响）。 */
const details = ref<Map<string, ExportJobDetail>>(new Map())
const detailLoading = ref<Set<string>>(new Set())
const detailErrors = ref<Set<string>>(new Set())
const expanded = ref<Set<string>>(new Set())

const downloading = ref<Set<string>>(new Set())
const downloadMessages = ref<Map<string, string>>(new Map())

const context = () => ({ deviceId: props.deviceId, token: props.token })

function formatTime(value: number | null): string {
  return value === null ? '—' : createdAtFormatter().format(new Date(value))
}

function isRunning(job: ExportJobSummary): boolean {
  return job.status === 'queued' || job.status === 'collecting' || job.status === 'publishing'
}

function errorLabel(code: number): string {
  return code === 31301 || code === 31302 || code === 31303 || code === 31304
    ? props.copy.history.errors[code] : props.copy.history.errorFailed
}

function paginationSummary(): string {
  if (total.value === 0) {
    return ''
  }
  const from = offset.value + 1
  const to = Math.min(offset.value + jobs.value.length, total.value)
  return props.copy.history.pagination.summary
    .replace('{from}', String(from))
    .replace('{to}', String(to))
    .replace('{total}', String(total.value))
}

async function loadPage(nextOffset: number): Promise<void> {
  if (loading.value || submitting.value || disposed) return
  clearTimeout(pollTimer)
  loading.value = true
  loadError.value = false
  try {
    const data = await listExportJobs(context(), nextOffset, PAGE_SIZE)
    if (disposed) return
    const processing = new Set(jobs.value.filter(isRunning).map(job => job.job_no))
    jobs.value = data.jobs
    total.value = data.total
    offset.value = data.offset
    for (const job of data.jobs) {
      if (expanded.value.has(job.job_no) && (isRunning(job) || processing.has(job.job_no))) {
        await loadDetail(job.job_no)
      }
    }
    if (data.jobs.some(job => !isRunning(job) && processing.has(job.job_no))) await loadOptions()
  } catch (error) {
    console.error(new Error('[dashboard-history] load jobs failed.', { cause: error }))
    loadError.value = true
  } finally {
    loading.value = false
    if (!disposed && !loadError.value && jobs.value.some(isRunning)) {
      pollTimer = setTimeout(() => { void loadPage(offset.value) }, 5000)
    }
  }
}

function refresh(): void {
  void loadPage(offset.value)
  void loadOptions()
}

async function toggleDetail(jobNo: string): Promise<void> {
  if (expanded.value.has(jobNo)) {
    expanded.value = new Set([...expanded.value].filter(item => item !== jobNo))
    return
  }
  expanded.value = new Set(expanded.value).add(jobNo)
  await loadDetail(jobNo)
}

/** 明细加载失败只影响该任务；重试直接重新请求。 */
async function retryDetail(jobNo: string): Promise<void> {
  detailErrors.value = new Set([...detailErrors.value].filter(item => item !== jobNo))
  await loadDetail(jobNo)
}

async function loadDetail(jobNo: string): Promise<void> {
  detailLoading.value = new Set(detailLoading.value).add(jobNo)
  try {
    const detail = await getExportJob(context(), jobNo)
    const next = new Map(details.value)
    next.set(jobNo, detail)
    details.value = next
    detailErrors.value = new Set([...detailErrors.value].filter(item => item !== jobNo))
  } catch (error) {
    console.error(new Error(`[dashboard-history] load job detail failed: job_no=${jobNo}`, { cause: error }))
    detailErrors.value = new Set(detailErrors.value).add(jobNo)
  } finally {
    const nextLoading = new Set(detailLoading.value)
    nextLoading.delete(jobNo)
    detailLoading.value = nextLoading
  }
}

async function downloadCsv(job: ExportJobSummary): Promise<void> {
  if (downloading.value.has(job.job_no)) return
  downloading.value.add(job.job_no)
  downloadMessages.value.delete(job.job_no)
  try {
    const download = await getExportDownload(context(), job.job_no)
    triggerAnchorDownload(download.url, download.filename)
  } catch (error) {
    console.error(new Error(`[dashboard-history] CSV 下载失败: job_no=${job.job_no}`, { cause: error }))
    downloadMessages.value.set(job.job_no,
      error instanceof HomepageApiError && error.code === 404
        ? props.copy.history.downloadUnavailable
        : error instanceof HomepageApiError && typeof error.code === 'number'
          ? error.message : props.copy.history.downloadFailed)
  } finally {
    downloading.value.delete(job.job_no)
  }
}

/** 签名 URL 由后端携带 attachment 头；download 属性只是本地命名兜底。 */
function triggerAnchorDownload(url: string, filename: string): void {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
}

onMounted(() => {
  void loadOptions()
  void loadPage(0)
})
onBeforeUnmount(() => {
  disposed = true
  clearTimeout(pollTimer)
})
</script>

<template>
  <section class="history" aria-labelledby="dashboard-history-title">
    <form class="create-form" @submit.prevent="submitJob">
      <h1>{{ props.copy.create.title }}</h1>
      <p v-if="optionsLoading" role="status">{{ props.copy.create.loading }}</p>
      <div v-else-if="optionsError" role="alert">
        <p>{{ props.copy.create.optionsFailed }}</p>
        <button type="button" class="history-download" @click="loadOptions">{{ props.copy.history.retry }}</button>
      </div>
      <template v-if="options">
        <p class="history-status">{{ props.copy.create.usage.replace('{used}', String(options.usage.used)).replace('{total}', String(options.usage.total)) }}</p>
        <p class="history-status">{{ props.copy.create.reset }}</p>
        <div class="seg create-modes" role="group" :aria-label="props.copy.create.modeLabel">
          <span class="seg-thumb" aria-hidden="true"></span>
          <button class="seg-btn" type="button" :aria-pressed="mode === 'keywords'" :disabled="submitting" @click="selectMode('keywords')">{{ props.copy.create.modes.keywords }}</button>
          <button class="seg-btn" type="button" :aria-pressed="mode === 'map'" :disabled="submitting" @click="selectMode('map')">{{ props.copy.create.modes.map }}</button>
          <button class="seg-btn" type="button" :aria-pressed="mode === 'regions'" :disabled="submitting" @click="selectMode('regions')">{{ props.copy.create.modes.regions }}</button>
        </div>
        <template v-if="mode !== 'regions'">
          <label for="online-keywords">{{ props.copy.create.keywords }}</label>
          <textarea id="online-keywords" v-model="keywordsText" rows="4" required :placeholder="props.copy.create.placeholder" :disabled="submitting" />
        </template>
        <OnlineMapInput v-if="mapOpened" v-show="mode === 'map'" :copy="props.copy.create.map" :active="mode === 'map'" :disabled="submitting" :keyword-count="activeKeywords.length" :logical-sample-limit="options.logical_sample_limit" @viewports="mapViewports = $event" />
        <OnlineRegionInput v-if="regionsOpened" v-show="mode === 'regions'" :copy="props.copy.create.region" :disabled="submitting || mode !== 'regions'" :reset-key="regionResetKey" @queries="regionQueries = $event" />
        <p class="history-status" aria-live="polite">{{ props.copy.create.count.replace('{count}', String(activeKeywords.length)).replace('{limit}', String(options.keyword_limit)) }}</p>
        <label class="create-contacts"><input v-model="includeContacts" type="checkbox" :disabled="!options.contacts_allowed || submitting" />{{ props.copy.create.contacts }}</label>
        <p v-if="!options.contacts_allowed" class="history-status">{{ props.copy.create.contactsPaid }}</p>
        <p v-if="options.usage.exhausted" class="create-error" role="alert">{{ props.copy.create.exhausted }}</p>
        <p v-else-if="keywordInvalid" class="create-error" role="alert">{{ props.copy.create.invalid.replace('{limit}', String(options.keyword_limit)) }}</p>
        <button type="submit" class="btn btn-primary" :disabled="submitting || loading || optionsLoading || options.usage.exhausted || invalid">{{ submitting ? props.copy.create.submitting : props.copy.create.submit }}</button>
      </template>
      <p v-if="submitError" class="create-error" role="alert">{{ submitError }}</p>
    </form>
    <header class="history-head">
      <div>
        <h2 id="dashboard-history-title">{{ props.copy.history.title }}</h2>
        <p class="history-description">{{ props.copy.history.description }}</p>
      </div>
      <button
        type="button"
        class="btn btn-secondary history-refresh"
        :disabled="loading"
        @click="refresh"
      >
        {{ props.copy.history.refresh }}
      </button>
    </header>

    <p v-if="loading" class="history-status">{{ props.copy.history.loading }}</p>

    <div v-else-if="loadError" class="history-panel">
      <p class="history-status">{{ props.copy.history.loadFailed }}</p>
      <button type="button" class="btn btn-secondary" @click="refresh">
        {{ props.copy.history.retry }}
      </button>
    </div>

    <div v-else-if="jobs.length === 0" class="history-panel">
      <p class="history-empty-title">{{ props.copy.history.emptyTitle }}</p>
      <p class="history-status">{{ props.copy.history.emptyHint }}</p>
    </div>

    <template v-else>
      <div class="history-table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th scope="col">{{ props.copy.history.columns.taskNo }}</th>
              <th scope="col">{{ props.copy.history.columns.createdAt }}</th>
              <th scope="col" class="history-num">{{ props.copy.history.columns.samples }}</th>
              <th scope="col" class="history-num">{{ props.copy.history.columns.processed }}</th>
              <th scope="col" class="history-num">{{ props.copy.history.columns.records }}</th>
              <th scope="col">{{ props.copy.history.columns.status }}</th>
              <th scope="col"><span class="visually-hidden">{{ props.copy.history.detail.show }}</span></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="job in jobs" :key="job.job_no">
              <tr class="history-row" :class="{ 'history-row-open': expanded.has(job.job_no) }">
                <td class="history-job-no">
                  <button
                    type="button"
                    class="history-expand"
                    :data-history-expand="job.job_no"
                    :aria-expanded="expanded.has(job.job_no) ? 'true' : 'false'"
                    @click="toggleDetail(job.job_no)"
                  >
                    <span class="history-job-caret" aria-hidden="true"></span>
                    {{ job.job_no }}
                  </button>
                </td>
                <td class="history-time">{{ formatTime(job.created_at) }} {{ props.copy.history.timezone }}</td>
                <td class="history-num">{{ job.total_count }}</td>
                <td class="history-num">{{ job.processed_count }}</td>
                <td class="history-num">{{ job.record_count }}</td>
                <td>
                  <span class="history-chip" :data-status="job.status">{{ props.copy.history.status[job.status] }}</span>
                  <p v-if="job.error_code !== null" class="history-download-message">{{ errorLabel(job.error_code) }}</p>
                </td>
                <td class="history-actions">
                  <button
                    v-if="job.has_file"
                    type="button"
                    class="history-download"
                    :data-history-download="job.job_no"
                    :disabled="downloading.has(job.job_no)"
                    @click="downloadCsv(job)"
                  >
                    {{ downloading.has(job.job_no) ? props.copy.history.downloading : props.copy.history.downloadCsv }}
                  </button>
                  <span v-else-if="!isRunning(job)" class="history-status">{{ props.copy.history.noFile }}</span>
                  <p v-if="downloadMessages.get(job.job_no)" class="history-download-message" role="alert">{{ downloadMessages.get(job.job_no) }}</p>
                </td>
              </tr>
              <tr v-if="expanded.has(job.job_no)" :key="`${job.job_no}-detail`" class="history-detail-row">
                <td :colspan="7">
                  <p v-if="detailLoading.has(job.job_no)" class="history-status">
                    {{ props.copy.history.detail.loading }}
                  </p>
                  <div v-else-if="detailErrors.has(job.job_no)" class="history-detail-error">
                    <p class="history-status">{{ props.copy.history.detail.loadFailed }}</p>
                    <button type="button" class="history-download" @click="retryDetail(job.job_no)">
                      {{ props.copy.history.retry }}
                    </button>
                  </div>
                  <template v-else-if="details.get(job.job_no)">
                    <dl class="history-job-meta">
                      <div><dt>{{ props.copy.history.detail.runNo }}</dt><dd><code>{{ details.get(job.job_no)!.job.run_no }}</code></dd></div>
                      <div><dt>{{ props.copy.history.detail.startedAt }}</dt><dd>{{ formatTime(details.get(job.job_no)!.job.started_at) }}</dd></div>
                      <div><dt>{{ props.copy.history.detail.finishedAt }}</dt><dd>{{ formatTime(details.get(job.job_no)!.job.finished_at) }}</dd></div>
                      <div><dt>{{ props.copy.history.detail.contacts }}</dt><dd>{{ details.get(job.job_no)!.job.include_contacts ? props.copy.history.detail.contactsEnabled : props.copy.history.detail.contactsDisabled }}</dd></div>
                    </dl>
                    <table class="history-detail-table">
                      <thead>
                        <tr>
                          <th scope="col">{{ props.copy.history.detail.keyword }}</th>
                          <th scope="col" class="history-num">{{ props.copy.history.detail.records }}</th>
                          <th scope="col">{{ props.copy.history.columns.status }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in details.get(job.job_no)!.items" :key="item.item_index">
                          <td class="history-detail-keyword">
                            {{ item.keyword }}
                            <small v-if="item.viewport" class="history-viewport">{{ props.copy.history.detail.viewport.replace('{lat}', String(item.viewport.lat)).replace('{lng}', String(item.viewport.lng)).replace('{zoom}', String(item.viewport.zoom)) }}</small>
                          </td>
                          <td class="history-num">{{ item.result_count }}</td>
                          <td>{{ item.error_code !== null ? errorLabel(item.error_code) : item.completed ? props.copy.history.detail.completed : props.copy.history.detail.pending }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <nav class="history-pagination" :aria-label="props.copy.history.title">
        <button
          type="button"
          class="history-page-button"
          data-history-prev
          :disabled="offset === 0 || loading"
          @click="loadPage(Math.max(0, offset - PAGE_SIZE))"
        >
          {{ props.copy.history.pagination.previous }}
        </button>
        <span v-if="paginationSummary()" class="history-page-summary">{{ paginationSummary() }}</span>
        <button
          type="button"
          class="history-page-button"
          data-history-next
          :disabled="offset + PAGE_SIZE >= total || loading"
          @click="loadPage(offset + PAGE_SIZE)"
        >
          {{ props.copy.history.pagination.next }}
        </button>
      </nav>
    </template>
  </section>
</template>

<style scoped>
.create-form { display: grid; gap: var(--s-3); padding-bottom: var(--s-6); border-bottom: 1px solid var(--border); }
.create-form h1 { font-size: var(--fs-h3); line-height: 32px; letter-spacing: 0; }
.create-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; width: min(420px, 100%); }
.create-modes .seg-btn { min-width: 0; justify-content: center; padding-inline: var(--s-2); }
.create-modes .seg-btn[aria-pressed='true'] { color: var(--text); }
.create-modes .seg-thumb { left: 4px; width: calc((100% - 8px) / 3); }
.create-modes:has(.seg-btn:nth-of-type(2)[aria-pressed='true']) .seg-thumb { transform: translateX(100%); }
.create-modes:has(.seg-btn:nth-of-type(3)[aria-pressed='true']) .seg-thumb { transform: translateX(200%); }
.create-form textarea { width: 100%; min-height: 112px; padding: var(--s-3); border: 1px solid var(--border-2); border-radius: var(--r-sm); background: var(--surface); color: var(--text); font: inherit; resize: vertical; }
.create-form textarea:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
.create-contacts { display: flex; gap: var(--s-2); align-items: center; }
.create-form > .btn { justify-self: start; }
.create-form button:disabled { opacity: .55; cursor: not-allowed; }
.create-error { color: var(--bad); font-size: 14px; }
.history {
  display: grid;
  /* minmax(0, 1fr)：阻止 nowrap 表格内容把 grid 列最小宽撑破视口（移动端横滚收进表格容器内） */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--s-4);
  min-width: 0;
}

.history-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s-4);
}

.history-head h2 {
  font-size: var(--fs-h3);
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 32px;
}

.history-description {
  margin-top: var(--s-1);
  color: var(--text-2);
  font-size: 13.5px;
  line-height: 1.6;
}

.history-refresh {
  flex: 0 0 auto;
}

.history-status {
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.6;
}

.history-panel {
  display: grid;
  justify-items: center;
  gap: var(--s-3);
  margin-top: var(--s-8);
  padding: var(--s-8) var(--s-6);
  border: 1px dashed var(--border-2);
  border-radius: var(--r-md);
  background: var(--surface);
  text-align: center;
}

.history-empty-title {
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.history-table-wrap {
  /* relative：表头内 absolute 的 visually-hidden 以本容器为包含块，随横滚内容一起被裁剪 */
  position: relative;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  padding: var(--s-3) var(--s-4);
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-3);
  font-family: var(--font-mono);
  font-variant-ligatures: none;
  font-variant-numeric: tabular-nums;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.history-table td {
  padding: var(--s-3) var(--s-4);
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-size: 13.5px;
  line-height: 18px;
  vertical-align: middle;
}

.history-row:hover {
  background: var(--surface-2);
}

.history-row-open {
  background: var(--surface-2);
}

.history-num {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.history-table th.history-num,
.history-detail-table th.history-num {
  text-align: right;
}

.history-job-no {
  min-width: 0;
}

.history-expand {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  max-width: 100%;
  padding: 0;
  color: var(--text);
  font-family: var(--font-mono);
  font-variant-ligatures: none;
  font-variant-numeric: tabular-nums;
  font-size: 12.5px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
}

.history-expand:hover {
  color: var(--primary-text);
}

.history-expand:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.history-job-caret {
  flex: 0 0 auto;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-left: 5px solid var(--text-3);
  border-bottom: 4px solid transparent;
  transition: transform var(--dur-1);
}

[aria-expanded='true'] .history-job-caret {
  transform: rotate(90deg);
}

.history-time {
  color: var(--text-2);
  font-size: 13px;
  white-space: nowrap;
}

.history-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  height: 24px;
  padding: 0 var(--s-3);
  border-radius: var(--r-full);
  font-family: var(--font-mono);
  font-variant-ligatures: none;
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.history-chip::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: var(--r-full);
  background: currentcolor;
}

.history-chip[data-status='queued'],
.history-chip[data-status='collecting'],
.history-chip[data-status='publishing'],
.history-chip[data-status='partial'] {
  background: var(--warn-soft);
  color: var(--warn);
}

.history-chip[data-status='completed'] {
  background: var(--ok-soft);
  color: var(--ok);
}

.history-actions {
  text-align: right;
  white-space: nowrap;
}

.history-download {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 var(--s-3);
  border: 1px solid var(--border);
  border-radius: var(--r-full);
  background: var(--surface);
  color: var(--primary-text);
  font-size: 13px;
  font-weight: 600;
}

.history-download:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.history-download:disabled {
  cursor: wait;
  color: var(--text-3);
  opacity: 0.72;
}

.history-download:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.history-detail-row td {
  background: var(--surface-2);
}

.history-detail-table {
  width: 100%;
  border-collapse: collapse;
}

.history-detail-table th {
  padding: var(--s-2) var(--s-3);
  border-bottom: 1px solid var(--border);
  color: var(--text-3);
  font-family: var(--font-mono);
  font-variant-ligatures: none;
  font-variant-numeric: tabular-nums;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-align: left;
  text-transform: uppercase;
}

.history-detail-table td {
  padding: var(--s-2) var(--s-3);
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.history-detail-table tr:last-child td {
  border-bottom: 0;
}

.history-detail-keyword {
  max-width: 420px;
  overflow-wrap: anywhere;
}

.history-detail-error {
  display: grid;
  justify-items: start;
  gap: var(--s-2);
}

.history-chip[data-status="failed"] {
  color: var(--bad);
  background: var(--bad-soft);
}

.history-job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-4);
  margin: 0 0 var(--s-4);
}

.history-job-meta div {
  min-width: 0;
}

.history-job-meta dt,
.history-viewport {
  color: var(--text-2);
  font-size: var(--fs-xs);
}

.history-job-meta dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.history-viewport {
  display: block;
}

.history-download-message {
  display: block;
  margin-top: var(--s-1);
  color: var(--bad);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 18px;
  white-space: normal;
}

.history-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--s-3);
}

.history-page-button {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 var(--s-4);
  border: 1px solid var(--border);
  border-radius: var(--r-full);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
}

.history-page-button:hover:not(:disabled) {
  background: var(--surface-2);
}

.history-page-button:disabled {
  cursor: not-allowed;
  color: var(--text-3);
  opacity: 0.42;
}

.history-page-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.history-page-summary {
  color: var(--text-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 960px) {
  .history-head {
    flex-direction: column;
    align-items: stretch;
  }

  .history-time {
    white-space: normal;
  }
}
</style>
