/**
 * Dashboard 最小路由（不引入 vue-router）。
 *
 * 四个视图对应四个静态地址，语言前缀照旧；History 的筛选与页码只放在 query string，非默认值才写入。
 * 视图切换用 pushState，History 查询用 replaceState；地址里的非法值一律回到默认。
 */

import type { ExportJobQuery, ExportJobStatus } from './api'
import { addDays, isYmd, localMidnight, localYmd } from './format'

export const DASHBOARD_VIEWS = ['online', 'history', 'api', 'subscriptions'] as const
export type DashboardView = (typeof DASHBOARD_VIEWS)[number]

/** 视图地址；Online 是默认视图，对应 /dashboard/ 本身。 */
export function dashboardPath(localePrefix: string, view: DashboardView): string {
  return `${localePrefix}/dashboard/${view === 'online' ? '' : `${view}/`}`
}

/** 从 pathname 解析视图；语言前缀在 /dashboard/ 之前，只看尾段。 */
export function viewFromPath(pathname: string): DashboardView {
  const segment = /\/dashboard\/([a-z]+)\/?$/.exec(pathname)?.[1]
  return DASHBOARD_VIEWS.find(view => view !== 'online' && view === segment) ?? 'online'
}

/** 不带修饰键的主键点击才由 SPA 接管；修饰键、中键交给浏览器在新标签页打开。 */
export function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.defaultPrevented
    && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export const HISTORY_STATUSES = ['all', 'running', 'completed', 'partial', 'failed'] as const
export type HistoryStatus = (typeof HISTORY_STATUSES)[number]

export const HISTORY_RANGES = ['7d', '30d', 'all', 'custom'] as const
export type HistoryRange = (typeof HISTORY_RANGES)[number]

export const PAGE_SIZES = [20, 50, 100] as const
export type PageSize = (typeof PAGE_SIZES)[number]

/** History 查询：搜索词、状态、时间范围（custom 时为两端都含的纽约日历日）、页码与每页条数。 */
export interface HistoryQuery {
  q: string
  status: HistoryStatus
  range: HistoryRange
  from: string
  to: string
  page: number
  size: PageSize
}

export const HISTORY_DEFAULTS: Readonly<HistoryQuery> = {
  q: '', status: 'all', range: 'all', from: '', to: '', page: 1, size: 20
}

const HISTORY_KEYS = ['q', 'status', 'range', 'from', 'to', 'page', 'size'] as const

/** 搜索词上限，与后端 q 的校验一致。 */
export const HISTORY_QUERY_MAX = 100

/** 完整任务号：32 位 UUID hex + 两位 owner 槽号（与后端路径校验一致）。 */
export const FULL_JOB_NO = /^[0-9a-f]{32}0[0-9]$/

const RUNNING_STATUSES: readonly ExportJobStatus[] = ['queued', 'collecting', 'publishing']

export function readHistoryQuery(search: string): HistoryQuery {
  const params = new URLSearchParams(search)
  const page = Number(params.get('page'))
  let range = HISTORY_RANGES.find(value => value === params.get('range')) ?? 'all'
  let from = params.get('from') ?? ''
  let to = params.get('to') ?? ''
  if (range === 'custom' && !(isYmd(from) && isYmd(to) && from <= to)) range = 'all'
  if (range !== 'custom') {
    from = ''
    to = ''
  }
  return {
    q: (params.get('q') ?? '').trim().slice(0, HISTORY_QUERY_MAX),
    status: HISTORY_STATUSES.find(value => value === params.get('status')) ?? 'all',
    range,
    from,
    to,
    page: Number.isSafeInteger(page) && page > 1 ? page : 1,
    size: PAGE_SIZES.find(value => String(value) === params.get('size')) ?? HISTORY_DEFAULTS.size
  }
}

/** 查询写回地址栏的 search 部分，只写非默认值。 */
export function historySearch(query: HistoryQuery): string {
  const params = new URLSearchParams()
  for (const key of HISTORY_KEYS) {
    if (query[key] !== HISTORY_DEFAULTS[key]) params.set(key, String(query[key]))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

/** 是否有非默认筛选（搜索、状态或时间范围）。 */
export function hasHistoryFilters(query: HistoryQuery): boolean {
  return query.q !== '' || query.status !== 'all' || query.range !== 'all'
}

/**
 * 查询 → 列表接口参数。Running 展开为三个运行中的公开状态；时间范围按本地日界换算成左闭右开的毫秒区间：
 * 最近 N 天含今天，自定义范围的结束日取次日零点。
 */
export function historyApiQuery(query: HistoryQuery, now: number): ExportJobQuery {
  const today = localYmd(now)
  let createdFromMs: number | undefined
  let createdToMs: number | undefined
  if (query.range === '7d') createdFromMs = localMidnight(addDays(today, -6))
  else if (query.range === '30d') createdFromMs = localMidnight(addDays(today, -29))
  else if (query.range === 'custom') {
    createdFromMs = localMidnight(query.from)
    createdToMs = localMidnight(addDays(query.to, 1))
  }
  return {
    offset: (query.page - 1) * query.size,
    limit: query.size,
    q: query.q,
    statuses: query.status === 'all' ? undefined : query.status === 'running' ? RUNNING_STATUSES : [query.status],
    createdFromMs,
    createdToMs
  }
}
