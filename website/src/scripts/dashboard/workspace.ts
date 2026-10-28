/**
 * Dashboard 登录态工作区数据：每次登录新建一份，退出或换号时整体丢弃（dispose 后迟到的响应一律忽略）。
 *
 * - Online 额度（options）同时供创建面板与侧栏用户卡；刷新失败时保留已加载的额度。
 * - 最近任务在首次进入 Online 后开始加载；有运行中任务时每 5 秒静默刷新，切到其他视图也继续，
 *   这样任务在任何视图结束都能收到提示。页面在后台时暂停，回到前台立即刷新一次。
 * - 最近任务与 History 共用一份「正在观察的任务」：同一任务进入终态只提示一次、刷新一次额度，
 *   并让 History 下次进入时静默刷新。CSV / XLSX 下载状态两张列表共用。
 */

import { reactive } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { HomepageApiError, type RequestContext } from '../homepage/api'
import { trackDashboardAction } from '../homepage/web-mark'
import {
  getExportDownload,
  getExportFile,
  getOnlineOptions,
  listExportJobs,
  type ExportJobStatus,
  type ExportJobSummary,
  type OnlineOptions
} from './api'
import { toast } from './dom'
import { fill, formatNumber } from './format'
import { errorLabel, hasRunning, isRunningStatus, POLL_INTERVAL_MS, RECENT_LIMIT, shortJobNo } from './jobs'
import { csvToXlsx } from './xlsx'

export type DownloadFormat = 'csv' | 'xlsx'

export interface RecentJobsState {
  jobs: ExportJobSummary[]
  /** 首次进入 Online 后才开始加载。 */
  started: boolean
  /** 首次加载已结束（成功或失败），Online 视图据此从骨架切到内容。 */
  settled: boolean
  loading: boolean
  /** 手动刷新（而非轮询）进行中：只有这时按钮转圈、列表降低不透明度。 */
  manual: boolean
  /** 首次加载失败：整块换成失败面板。 */
  loadError: boolean
  /** 刷新或轮询失败：保留上次结果并提示。 */
  refreshError: boolean
  /** 刚提交的任务号：插入时短暂高亮一次。 */
  highlight: string
}

export interface WorkspaceState {
  options: OnlineOptions | null
  optionsLoading: boolean
  /** 没有可用额度数据时的读取失败；已有数据时刷新失败不置位。 */
  optionsError: boolean
  /** 首次读取已结束（成功或失败）。 */
  optionsSettled: boolean
  recent: RecentJobsState
  /** History 的当前页已过期（有新提交或任务结束），下次进入时静默刷新。 */
  historyStale: boolean
  downloading: Map<string, DownloadFormat>
  /** 下载失败的行内说明，按任务号。 */
  downloadMessages: Map<string, string>
}

export interface DashboardWorkspace {
  readonly context: RequestContext
  readonly state: WorkspaceState
  loadOptions(): Promise<void>
  /** Online 首次进入时开始加载最近任务；之后由轮询与手动刷新维护。 */
  startRecent(): void
  /** 顶栏 Refresh：最近任务 + 本月额度。 */
  refreshOnline(): void
  /** 新任务已提交：高亮插入、标记 History 过期，并刷新最近任务与额度。 */
  jobSubmitted(job: ExportJobSummary): Promise<void>
  /** 任一列表拿到任务快照后调用：任务从运行中变为终态时提示一次。 */
  observeJobs(jobs: readonly ExportJobSummary[]): void
  download(jobNo: string, format: DownloadFormat): Promise<void>
  dispose(): void
}

export function isSessionExpiry(error: unknown): boolean {
  return error instanceof HomepageApiError && error.status === 401
}

export function createWorkspace(context: RequestContext, copy: DashboardContent): DashboardWorkspace {
  const state = reactive<WorkspaceState>({
    options: null,
    optionsLoading: false,
    optionsError: false,
    optionsSettled: false,
    recent: {
      jobs: [],
      started: false,
      settled: false,
      loading: false,
      manual: false,
      loadError: false,
      refreshError: false,
      highlight: ''
    },
    historyStale: false,
    downloading: new Map(),
    downloadMessages: new Map()
  })
  /** 正在观察的运行中任务：任务号 → 最近一次看到的状态。 */
  const watching = new Map<string, ExportJobStatus>()
  let disposed = false
  let pollTimer: ReturnType<typeof setTimeout> | undefined

  async function loadOptions(): Promise<void> {
    state.optionsLoading = true
    try {
      const options = await getOnlineOptions(context)
      if (disposed) return
      state.options = options
      state.optionsError = false
    } catch (error) {
      if (disposed) return
      if (!isSessionExpiry(error)) console.error(new Error('[dashboard-workspace] load online options failed', { cause: error }))
      if (!state.options) state.optionsError = true
    } finally {
      if (!disposed) {
        state.optionsLoading = false
        state.optionsSettled = true
      }
    }
  }

  function schedulePoll(): void {
    clearTimeout(pollTimer)
    if (disposed || document.hidden || !hasRunning(state.recent.jobs)) return
    pollTimer = setTimeout(() => {
      void loadRecent(true)
    }, POLL_INTERVAL_MS)
  }

  async function loadRecent(silent: boolean): Promise<void> {
    const recent = state.recent
    if (recent.loading) return
    clearTimeout(pollTimer)
    recent.loading = true
    recent.manual = !silent
    try {
      const data = await listExportJobs(context, { offset: 0, limit: RECENT_LIMIT })
      if (disposed) return
      recent.jobs = data.jobs
      recent.loadError = false
      recent.refreshError = false
      observeJobs(data.jobs)
    } catch (error) {
      if (disposed) return
      if (!isSessionExpiry(error)) console.error(new Error('[dashboard-workspace] load recent jobs failed', { cause: error }))
      if (recent.jobs.length) recent.refreshError = true
      else recent.loadError = true
    } finally {
      if (!disposed) {
        recent.loading = false
        recent.manual = false
        recent.settled = true
        schedulePoll()
      }
    }
  }

  function startRecent(): void {
    if (state.recent.started) return
    state.recent.started = true
    void loadRecent(false)
  }

  function refreshOnline(): void {
    void loadRecent(false)
    void loadOptions()
  }

  async function jobSubmitted(job: ExportJobSummary): Promise<void> {
    state.recent.highlight = job.job_no
    state.historyStale = true
    toast(copy.create.submitted, 'success', `${copy.history.columns.taskNo} ${shortJobNo(job.job_no)}`)
    await loadRecent(false)
    void loadOptions()
    // 新行插入后高亮停留 1.6 秒再褪回
    setTimeout(() => {
      if (state.recent.highlight === job.job_no) state.recent.highlight = ''
    }, 1600)
  }

  function notifyFinished(job: ExportJobSummary): void {
    toast(
      fill(copy.history.finished, { job: shortJobNo(job.job_no), status: copy.history.status[job.status] }),
      job.status === 'failed' ? 'error' : job.status === 'partial' ? 'info' : 'success',
      job.status === 'failed'
        ? errorLabel(copy.history, job.error_code)
        : fill(copy.history.finishedRecords, { count: formatNumber(job.record_count) })
    )
  }

  function observeJobs(jobs: readonly ExportJobSummary[]): void {
    const finished: ExportJobSummary[] = []
    for (const job of jobs) {
      if (isRunningStatus(job.status)) watching.set(job.job_no, job.status)
      else if (watching.delete(job.job_no)) finished.push(job)
    }
    if (!finished.length) return
    void loadOptions()
    finished.forEach(notifyFinished)
    state.historyStale = true
  }

  /** CSV 走签名 URL（后端带 attachment 头与文件名）；XLSX 同源取 CSV 后在浏览器转换，文件名沿用 CSV 主体。 */
  async function download(jobNo: string, format: DownloadFormat): Promise<void> {
    if (state.downloading.has(jobNo)) return
    state.downloading.set(jobNo, format)
    state.downloadMessages.delete(jobNo)
    try {
      if (format === 'csv') {
        const file = await getExportDownload(context, jobNo)
        if (disposed) return
        // 签名 URL 由后端携带 attachment 头；download 属性只是本地命名兜底
        saveAs(file.url, file.filename)
      } else {
        const [file, csv] = await Promise.all([getExportDownload(context, jobNo), getExportFile(context, jobNo)])
        const blob = await csvToXlsx(csv)
        if (disposed) return
        const url = URL.createObjectURL(blob)
        saveAs(url, file.filename.replace(/\.csv$/, '.xlsx'))
        setTimeout(() => URL.revokeObjectURL(url), 0)
      }
      trackDashboardAction('job_download', { job_no: jobNo, format, outcome: 'success' })
    } catch (error) {
      if (disposed) return
      trackDashboardAction('job_download', {
        job_no: jobNo,
        format,
        outcome: 'failed',
        code: error instanceof HomepageApiError ? (error.code ?? '') : ''
      })
      if (!isSessionExpiry(error)) console.error(new Error(`[dashboard-workspace] ${format} download failed: job_no=${jobNo}`, { cause: error }))
      state.downloadMessages.set(jobNo,
        error instanceof HomepageApiError && error.code === 404
          ? copy.history.downloadUnavailable
          : error instanceof HomepageApiError && typeof error.code === 'number'
            ? error.message
            : copy.history.downloadFailed)
    } finally {
      if (!disposed) state.downloading.delete(jobNo)
    }
  }

  function saveAs(href: string, filename: string): void {
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = filename
    anchor.rel = 'noopener'
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
  }

  function handleVisibility(): void {
    if (document.hidden) clearTimeout(pollTimer)
    else if (hasRunning(state.recent.jobs)) void loadRecent(true)
  }

  document.addEventListener('visibilitychange', handleVisibility)

  return {
    context,
    state,
    loadOptions,
    startRecent,
    refreshOnline,
    jobSubmitted,
    observeJobs,
    download,
    dispose(): void {
      disposed = true
      clearTimeout(pollTimer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }
}
