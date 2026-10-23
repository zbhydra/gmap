/**
 * 任务列表共用规则：运行中判定、业务错误码文案、短任务号与搜索命中切分（Online 最近任务与 History 共用）。
 */

import type { DashboardContent } from '../../i18n/schema'
import type { ExportJobStatus, ExportJobSummary } from './api'

/** Online 最近任务条数。 */
export const RECENT_LIMIT = 5
/** 有运行中任务时的静默刷新间隔。 */
export const POLL_INTERVAL_MS = 5000

export function isRunningStatus(status: ExportJobStatus): boolean {
  return status === 'queued' || status === 'collecting' || status === 'publishing'
}

export function hasRunning(jobs: readonly ExportJobSummary[]): boolean {
  return jobs.some(job => isRunningStatus(job.status))
}

/** 任务号前 8 位：列表与 toast 里的短号，CSV 文件名才是完整任务号。 */
export function shortJobNo(jobNo: string): string {
  return `${jobNo.slice(0, 8)}…`
}

/** 31301–31304 有专门说明，其余已报告的错误码统一为通用失败文案。 */
export function errorLabel(copy: DashboardContent['history'], code: number | null): string {
  return code === 31301 || code === 31302 || code === 31303 || code === 31304 ? copy.errors[code] : copy.errorFailed
}

/** 搜索命中切分：只标第一处、不区分大小写，模板用 <mark> 渲染命中段。 */
export interface HighlightParts {
  before: string
  match: string
  after: string
}

export function highlightParts(text: string, query: string): HighlightParts {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (index < 0) return { before: text, match: '', after: '' }
  return {
    before: text.slice(0, index),
    match: text.slice(index, index + query.length),
    after: text.slice(index + query.length)
  }
}
