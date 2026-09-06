<script setup lang="ts">
/**
 * 在线导出历史视图：列表（最新在前，每页 20，手动刷新）、行内关键词明细
 * 展开与单项 CSV / 整包 ZIP 下载。只消费历史与下载，不接任务创建。
 *
 * 展开失败只影响该任务，下载失败只影响该操作；后端只公开任务两态，不
 * 展示接口没有提供的成功或失败结论。
 */
import { onMounted, ref } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import {
  downloadOnlineTaskZip,
  getOnlineItemDownload,
  getOnlineTaskDetail,
  isOnlineDownloadUnavailable,
  listOnlineTasks,
  type OnlineTaskDetailResponse,
  type OnlineTaskSummary
} from '../../scripts/dashboard/api'

export interface Props {
  copy: DashboardContent
  token: string
  deviceId: string
}

const props = defineProps<Props>()

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

const tasks = ref<OnlineTaskSummary[]>([])
const total = ref(0)
const offset = ref(0)
const loading = ref(false)
const loadError = ref(false)

/** 展开中的任务明细（按任务号独立加载，互不影响）。 */
const details = ref<Map<string, OnlineTaskDetailResponse>>(new Map())
const detailLoading = ref<Set<string>>(new Set())
const detailErrors = ref<Set<string>>(new Set())
const expanded = ref<Set<string>>(new Set())

/** 进行中的下载操作（ZIP 按任务号、CSV 按条目 ID）。 */
const zipDownloading = ref<Set<string>>(new Set())
const csvDownloading = ref<Set<number>>(new Set())
/** 就地提示（ZIP 按任务号、CSV 按条目 ID；null 表示该槽位无提示）。 */
const zipMessages = ref<Map<string, string>>(new Map())
const csvMessages = ref<Map<number, string>>(new Map())

const context = () => ({ deviceId: props.deviceId, token: props.token })

/** 后端可能返回秒或毫秒，展示统一按业务时区格式化。 */
function formatCreatedAt(value: number): string {
  const ms = value < 10_000_000_000 ? value * 1000 : value
  return createdAtFormatter().format(new Date(ms))
}

function statusLabel(task: OnlineTaskSummary): string {
  return task.status === 'completed' ? props.copy.history.status.completed : props.copy.history.status.processing
}

function paginationSummary(): string {
  if (total.value === 0) {
    return ''
  }
  const from = offset.value + 1
  const to = Math.min(offset.value + tasks.value.length, total.value)
  return props.copy.history.pagination.summary
    .replace('{from}', String(from))
    .replace('{to}', String(to))
    .replace('{total}', String(total.value))
}

async function loadPage(nextOffset: number): Promise<void> {
  loading.value = true
  loadError.value = false
  try {
    const data = await listOnlineTasks(context(), nextOffset, PAGE_SIZE)
    tasks.value = data.tasks
    total.value = data.total
    offset.value = data.offset
  } catch (error) {
    console.error(new Error('[dashboard-history] load tasks failed.', { cause: error }))
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function refresh(): void {
  void loadPage(offset.value)
}

async function toggleDetail(taskNo: string): Promise<void> {
  if (expanded.value.has(taskNo)) {
    expanded.value = new Set([...expanded.value].filter(item => item !== taskNo))
    return
  }
  expanded.value = new Set(expanded.value).add(taskNo)
  if (!details.value.has(taskNo)) {
    await loadDetail(taskNo)
  }
}

/** 明细加载失败只影响该任务；重试直接重新请求。 */
async function retryDetail(taskNo: string): Promise<void> {
  detailErrors.value = new Set([...detailErrors.value].filter(item => item !== taskNo))
  await loadDetail(taskNo)
}

async function loadDetail(taskNo: string): Promise<void> {
  detailLoading.value = new Set(detailLoading.value).add(taskNo)
  try {
    const detail = await getOnlineTaskDetail(context(), taskNo)
    const next = new Map(details.value)
    next.set(taskNo, detail)
    details.value = next
  } catch (error) {
    console.error(new Error(`[dashboard-history] load task detail failed: task_no=${taskNo}`, { cause: error }))
    detailErrors.value = new Set(detailErrors.value).add(taskNo)
  } finally {
    const nextLoading = new Set(detailLoading.value)
    nextLoading.delete(taskNo)
    detailLoading.value = nextLoading
  }
}

/** 单项 CSV：先请求签名信息，再用临时锚点触发下载。 */
async function downloadCsv(taskNo: string, itemId: number): Promise<void> {
  if (csvDownloading.value.has(itemId)) {
    return
  }
  csvDownloading.value = new Set(csvDownloading.value).add(itemId)
  setCsvMessage(itemId, '')
  try {
    const download = await getOnlineItemDownload(context(), taskNo, itemId)
    triggerAnchorDownload(download.url, download.filename)
  } catch (error) {
    console.error(new Error(`[dashboard-history] CSV download failed: task_no=${taskNo} item_id=${itemId}`, { cause: error }))
    setCsvMessage(
      itemId,
      isOnlineDownloadUnavailable(error as Error)
        ? props.copy.history.downloadUnavailable
        : props.copy.history.downloadFailed
    )
  } finally {
    const next = new Set(csvDownloading.value)
    next.delete(itemId)
    csvDownloading.value = next
  }
}

async function downloadZip(task: OnlineTaskSummary): Promise<void> {
  if (zipDownloading.value.has(task.task_no)) {
    return
  }
  zipDownloading.value = new Set(zipDownloading.value).add(task.task_no)
  setZipMessage(task.task_no, '')
  try {
    await downloadOnlineTaskZip(context(), task.task_no)
  } catch (error) {
    console.error(new Error(`[dashboard-history] ZIP download failed: task_no=${task.task_no}`, { cause: error }))
    setZipMessage(
      task.task_no,
      isOnlineDownloadUnavailable(error as Error)
        ? props.copy.history.downloadUnavailable
        : props.copy.history.downloadFailed
    )
  } finally {
    const next = new Set(zipDownloading.value)
    next.delete(task.task_no)
    zipDownloading.value = next
  }
}

function setCsvMessage(itemId: number, message: string): void {
  const next = new Map(csvMessages.value)
  if (message) {
    next.set(itemId, message)
  } else {
    next.delete(itemId)
  }
  csvMessages.value = next
}

function setZipMessage(taskNo: string, message: string): void {
  const next = new Map(zipMessages.value)
  if (message) {
    next.set(taskNo, message)
  } else {
    next.delete(taskNo)
  }
  zipMessages.value = next
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
  void loadPage(0)
})
</script>

<template>
  <section class="history" aria-labelledby="dashboard-history-title">
    <header class="history-head">
      <div>
        <h1 id="dashboard-history-title">{{ props.copy.history.title }}</h1>
        <p class="history-description">{{ props.copy.history.description }}</p>
      </div>
      <button
        type="button"
        class="history-refresh"
        :disabled="loading"
        @click="refresh"
      >
        {{ props.copy.history.refresh }}
      </button>
    </header>

    <p v-if="loading" class="history-status">{{ props.copy.history.loading }}</p>

    <div v-else-if="loadError" class="history-panel">
      <p class="history-status">{{ props.copy.history.loadFailed }}</p>
      <button type="button" class="history-primary" @click="refresh">
        {{ props.copy.history.retry }}
      </button>
    </div>

    <div v-else-if="tasks.length === 0" class="history-panel">
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
              <th scope="col" class="history-num">{{ props.copy.history.columns.keywords }}</th>
              <th scope="col" class="history-num">{{ props.copy.history.columns.processed }}</th>
              <th scope="col" class="history-num">{{ props.copy.history.columns.records }}</th>
              <th scope="col">{{ props.copy.history.columns.status }}</th>
              <th scope="col"><span class="visually-hidden">{{ props.copy.history.detail.show }}</span></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="task in tasks" :key="task.task_no">
              <tr class="history-row" :class="{ 'history-row-open': expanded.has(task.task_no) }">
                <td class="history-task-no">
                  <button
                    type="button"
                    class="history-expand"
                    :data-history-expand="task.task_no"
                    :aria-expanded="expanded.has(task.task_no) ? 'true' : 'false'"
                    @click="toggleDetail(task.task_no)"
                  >
                    <span class="history-task-caret" aria-hidden="true"></span>
                    {{ task.task_no }}
                  </button>
                </td>
                <td class="history-time">{{ formatCreatedAt(task.created_at) }} {{ props.copy.history.timezone }}</td>
                <td class="history-num">{{ task.total_count }}</td>
                <td class="history-num">{{ task.processed_count }}</td>
                <td class="history-num">{{ task.record_count }}</td>
                <td>
                  <span class="history-chip" :data-status="task.status">{{ statusLabel(task) }}</span>
                </td>
                <td class="history-actions">
                  <button
                    v-if="task.status === 'completed'"
                    type="button"
                    class="history-download"
                    :data-history-zip="task.task_no"
                    :disabled="zipDownloading.has(task.task_no)"
                    @click="downloadZip(task)"
                  >
                    {{ zipDownloading.has(task.task_no) ? props.copy.history.downloading : props.copy.history.downloadZip }}
                  </button>
                </td>
              </tr>
              <tr v-if="expanded.has(task.task_no)" :key="`${task.task_no}-detail`" class="history-detail-row">
                <td :colspan="7">
                  <p v-if="detailLoading.has(task.task_no)" class="history-status">
                    {{ props.copy.history.detail.loading }}
                  </p>
                  <div v-else-if="detailErrors.has(task.task_no)" class="history-detail-error">
                    <p class="history-status">{{ props.copy.history.detail.loadFailed }}</p>
                    <button type="button" class="history-download" @click="retryDetail(task.task_no)">
                      {{ props.copy.history.retry }}
                    </button>
                  </div>
                  <template v-else-if="details.get(task.task_no)">
                    <table class="history-detail-table">
                      <thead>
                        <tr>
                          <th scope="col">{{ props.copy.history.detail.keyword }}</th>
                          <th scope="col" class="history-num">{{ props.copy.history.detail.records }}</th>
                          <th scope="col"><span class="visually-hidden">{{ props.copy.history.detail.downloadCsv }}</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in details.get(task.task_no)!.items" :key="item.item_id">
                          <td class="history-detail-keyword">{{ item.keyword }}</td>
                          <td class="history-num">{{ item.record_count }}</td>
                          <td class="history-actions">
                            <button
                              type="button"
                              class="history-download"
                              :data-history-csv="item.item_id"
                              :disabled="csvDownloading.has(item.item_id)"
                              @click="downloadCsv(task.task_no, item.item_id)"
                            >
                              {{ csvDownloading.has(item.item_id) ? props.copy.history.downloading : props.copy.history.detail.downloadCsv }}
                            </button>
                            <p v-if="csvMessages.get(item.item_id)" class="history-download-message" role="alert">
                              {{ csvMessages.get(item.item_id) }}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p v-if="zipMessages.get(task.task_no)" class="history-download-message" role="alert">
                      {{ zipMessages.get(task.task_no) }}
                    </p>
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
.history {
  display: grid;
  /* minmax(0, 1fr)：阻止 nowrap 表格内容把 grid 列最小宽撑破视口（移动端横滚收进表格容器内） */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  min-width: 0;
}

.history-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.history-head h1 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 32px;
}

.history-description {
  margin-top: var(--space-1);
  color: var(--text-2);
  font-size: 13.5px;
  line-height: 1.6;
}

.history-refresh {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 var(--space-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--rounded-full);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
}

.history-refresh:hover:not(:disabled) {
  background: var(--surface-2);
}

.history-refresh:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.history-status {
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.6;
}

.history-panel {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  margin-top: var(--space-8);
  padding: var(--space-8) var(--space-6);
  border: 1px dashed var(--border-strong);
  border-radius: var(--rounded-md);
  background: var(--surface);
  text-align: center;
}

.history-empty-title {
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.history-primary {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 var(--space-6);
  border-radius: var(--rounded-full);
  background: var(--primary);
  color: var(--primary-fg);
  font-size: 14px;
  font-weight: 600;
}

.history-primary:hover {
  background: var(--primary-hover);
}

.history-primary:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.history-table-wrap {
  /* relative：表头内 absolute 的 visually-hidden 以本容器为包含块，随横滚内容一起被裁剪 */
  position: relative;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--rounded-md);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.history-table td {
  padding: var(--space-3) var(--space-4);
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

.history-task-no {
  min-width: 0;
}

.history-expand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  max-width: 100%;
  padding: 0;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12.5px;
  font-weight: 500;
  text-align: left;
}

.history-expand:hover {
  color: var(--primary);
}

.history-expand:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.history-task-caret {
  flex: 0 0 auto;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-right: 5px solid var(--text-3);
  border-bottom: 4px solid transparent;
  transition: transform var(--transition-fast);
}

[aria-expanded='true'] .history-task-caret {
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
  gap: var(--space-2);
  height: 24px;
  padding: 0 var(--space-3);
  border-radius: var(--rounded-full);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.history-chip::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: var(--rounded-full);
  background: currentcolor;
}

.history-chip[data-status='processing'] {
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
  padding: 0 var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--rounded-full);
  background: var(--surface);
  color: var(--primary);
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
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border);
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-align: left;
  text-transform: uppercase;
}

.history-detail-table td {
  padding: var(--space-2) var(--space-3);
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
  gap: var(--space-2);
}

.history-download-message {
  display: block;
  margin-top: var(--space-1);
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
  gap: var(--space-3);
}

.history-page-button {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--rounded-full);
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
