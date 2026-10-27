/**
 * Dashboard 客户端接口封装。
 *
 * 复用站级 JSON、鉴权与会话失效边界；Export 下载使用后端签名 URL。
 */

import {
  HomepageApiError,
  getJson,
  postJson,
  type RequestContext
} from '../homepage/api'
import type { JsonValue } from '../homepage/api'
import type { OnlineViewport } from './map-grid'
import { notifySessionExpired } from '../site/session'

export interface UserApiKeyMeta {
  has_api_key: boolean
  api_key_prefix: string
  api_key_created_at: number | null
}

export interface GeneratedUserApiKey {
  api_key: string
  api_key_prefix: string
  api_key_created_at: number
}

export interface MapsApiUsage {
  used: number
  total: number
  /** America/New_York 自然月，YYYY-MM。 */
  period: string
  exhausted: boolean
}

export interface MapsApiConnection {
  api_base_url: string
  /** 空字符串表示尚未配置公开连接地址。 */
  mcp_url: string
}

export function getUserApiKey(context: RequestContext): Promise<UserApiKeyMeta> {
  return withSessionExpiry(getJson<UserApiKeyMeta>('/api/client/maps-api/key', context))
}

/** 生成响应是完整 Key 的唯一读取机会；调用方仅在当前视图内存中保留。 */
export function generateUserApiKey(context: RequestContext): Promise<GeneratedUserApiKey> {
  return withSessionExpiry(postJson<GeneratedUserApiKey>('/api/client/maps-api/key/generate', context))
}

export function getMapsApiUsage(context: RequestContext): Promise<MapsApiUsage> {
  return withSessionExpiry(getJson<MapsApiUsage>('/api/client/maps-api/usage', context))
}

export function getMapsApiConnection(context: RequestContext): Promise<MapsApiConnection> {
  return withSessionExpiry(getJson<MapsApiConnection>('/api/client/maps-api/connection', context))
}

export interface OnlineOptions {
  keyword_limit: number
  logical_sample_limit: number
  contacts_allowed: boolean
  usage: { used: number; total: number; period: string; exhausted: boolean }
}

export function getOnlineOptions(context: RequestContext): Promise<OnlineOptions> {
  return withSessionExpiry(getJson<JsonValue>('/api/client/maps-online/options', context).then(data => {
    if (!data || typeof data !== 'object' || Array.isArray(data)
      || typeof data.keyword_limit !== 'number' || typeof data.logical_sample_limit !== 'number'
      || typeof data.contacts_allowed !== 'boolean') {
      throw new Error('dashboard options: invalid creation constraints')
    }
    const usage = data.usage
    if (!usage || typeof usage !== 'object' || Array.isArray(usage)
      || typeof usage.used !== 'number' || typeof usage.total !== 'number'
      || typeof usage.period !== 'string' || typeof usage.exhausted !== 'boolean') {
      throw new Error('dashboard options: invalid monthly usage')
    }
    return { keyword_limit: data.keyword_limit, logical_sample_limit: data.logical_sample_limit,
      contacts_allowed: data.contacts_allowed,
      usage: { used: usage.used, total: usage.total, period: usage.period, exhausted: usage.exhausted } }
  }))
}

export type ExportJobStatus = 'queued' | 'collecting' | 'publishing' | 'completed' | 'partial' | 'failed'

export type ExportItemInput = {
  keyword: string
  viewport?: OnlineViewport
}

export interface ExportJobSummary {
  job_no: string
  run_no: string
  status: ExportJobStatus
  include_contacts: boolean
  total_count: number
  processed_count: number
  record_count: number
  has_file: boolean
  created_at: number
  started_at: number | null
  finished_at: number | null
  error_code: number | null
  /** 代表关键词：有搜索词时为首个命中项，否则为首个关键词（规范化去重后）。 */
  keyword_preview: string
  /** 规范化去重后的关键词数。 */
  keyword_count: number
}

export interface ExportJobItem {
  item_index: number
  keyword: string
  viewport: OnlineViewport | null
  result_count: number
  completed: boolean
  error_code: number | null
}

export interface ExportJobDetail {
  job: ExportJobSummary
  items: ExportJobItem[]
}

export interface ExportJobList {
  jobs: ExportJobSummary[]
  total: number
  offset: number
  limit: number
}

export function createExportJob(context: RequestContext, items: ExportItemInput[], includeContacts: boolean): Promise<ExportJobDetail> {
  return withSessionExpiry(postJson<ExportJobDetail>('/api/client/export/jobs', context,
    { items, include_contacts: includeContacts }))
}

/**
 * 认证失败统一汇入站级会话失效（清 token + 广播 site-session:expired），
 * 普通网络 / 业务错误原样上抛由视图就地提示，不误判为退出。
 */
function withSessionExpiry<T>(request: Promise<T>): Promise<T> {
  return request.catch(error => {
    if (error instanceof HomepageApiError && error.status === 401) {
      notifySessionExpired()
    }
    throw error
  })
}

/** 任务列表查询；时间为纽约日界换算后的毫秒左闭右开区间，状态可多选。 */
export interface ExportJobQuery {
  offset: number
  limit: number
  q?: string
  statuses?: readonly ExportJobStatus[]
  createdFromMs?: number
  createdToMs?: number
}

export function listExportJobs(context: RequestContext, query: ExportJobQuery): Promise<ExportJobList> {
  return withSessionExpiry(getJson<ExportJobList>('/api/client/export/jobs', context, {
    offset: query.offset,
    limit: query.limit,
    q: query.q || undefined,
    status: query.statuses,
    created_from_ms: query.createdFromMs,
    created_to_ms: query.createdToMs
  }))
}

export function getExportJob(context: RequestContext, jobNo: string): Promise<ExportJobDetail> {
  return withSessionExpiry(getJson<ExportJobDetail>(`/api/client/export/jobs/${encodeURIComponent(jobNo)}`, context))
}

export function getExportDownload(context: RequestContext, jobNo: string): Promise<{ url: string; filename: string }> {
  return withSessionExpiry(getJson<{ url: string; filename: string }>(
    `/api/client/export/jobs/${encodeURIComponent(jobNo)}/download`, context))
}

/** 请求当前产品类别的渠道管理入口；后端按订阅实例选择渠道，URL 可为空。 */
export function createSubscriptionManagementUrl(
  context: RequestContext,
  productKind: string
): Promise<string | null> {
  const request = postJson<{ url: string | null }>('/api/client/subscription/management', context, {
    product_kind: productKind
  }).then(response => {
    const url = typeof response.url === 'string' ? response.url.trim() : ''
    return url.length > 0 ? url : null
  })
  return withSessionExpiry(request)
}
