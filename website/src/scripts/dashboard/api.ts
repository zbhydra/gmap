/**
 * Dashboard 客户端接口封装（015 U2）。
 *
 * JSON 走 homepage API 薄封装；Online 整包 ZIP 是二进制响应，用同一请求头
 * 边界直接 fetch（token 只进请求头，不进下载链接），区分失败信封与文件成功
 * 响应后触发浏览器下载。
 */

import {
  HomepageApiError,
  buildRequestHeaders,
  getApiBaseUrl,
  getJson,
  postJson,
  type RequestContext
} from '../homepage/api'
import { notifySessionExpired } from '../site/session'

/** Online 任务公开摘要（后端 MapsOnlineTaskSummary）。 */
export interface OnlineTaskSummary {
  /** 任务编号。 */
  task_no: string
  /** 处理状态；后端只公开两态。 */
  status: 'processing' | 'completed'
  /** 关键词总数。 */
  total_count: number
  /** 已处理关键词数。 */
  processed_count: number
  /** 已产出结果条数。 */
  record_count: number
  /** 创建时间；后端可能返回秒或毫秒。 */
  created_at: number
}

/** 历史分页响应。 */
export interface OnlineTaskListResponse {
  tasks: OnlineTaskSummary[]
  /** 全量任务数（分页基准）。 */
  total: number
  offset: number
  limit: number
}

/** 关键词明细项。 */
export interface OnlineTaskItem {
  item_id: number
  sequence: number
  keyword: string
  /** 该关键词的结果条数；不代表单项文件一定可下载。 */
  record_count: number
}

/** 任务详情响应。 */
export interface OnlineTaskDetailResponse {
  task: OnlineTaskSummary
  items: OnlineTaskItem[]
}

/** 签名单项下载信息。 */
export interface OnlineItemDownload {
  url: string
  filename: string
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

/** 查询当前用户历史（最新在前，offset 分页）。 */
export function listOnlineTasks(
  context: RequestContext,
  offset: number,
  limit: number
): Promise<OnlineTaskListResponse> {
  return withSessionExpiry(
    getJson<OnlineTaskListResponse>('/api/client/maps-online/tasks', context, { offset, limit })
  )
}

/** 查询单个任务的关键词明细。 */
export function getOnlineTaskDetail(
  context: RequestContext,
  taskNo: string
): Promise<OnlineTaskDetailResponse> {
  return withSessionExpiry(
    getJson<OnlineTaskDetailResponse>(`/api/client/maps-online/tasks/${encodeURIComponent(taskNo)}`, context)
  )
}

/** 请求单项 CSV 签名下载信息；无文件或已过期时后端返回 404。 */
export function getOnlineItemDownload(
  context: RequestContext,
  taskNo: string,
  itemId: number
): Promise<OnlineItemDownload> {
  return withSessionExpiry(
    getJson<OnlineItemDownload>(
      `/api/client/maps-online/tasks/${encodeURIComponent(taskNo)}/items/${itemId}/download`,
      context
    )
  )
}

/** 判断下载错误是否为无文件 / 已过期（就地提示，不当作通用失败）。 */
export function isOnlineDownloadUnavailable(error: Error): boolean {
  return error instanceof HomepageApiError && error.status === 404
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

/**
 * 下载任务整包 ZIP 并触发浏览器保存。
 *
 * 成功响应是 application/zip 二进制；失败时后端返回 JSON 信封，解析 msg 抛
 * HomepageApiError。下载完成后释放临时对象 URL。
 */
export function downloadOnlineTaskZip(context: RequestContext, taskNo: string): Promise<void> {
  return withSessionExpiry(downloadOnlineTaskZipRequest(context, taskNo))
}

async function downloadOnlineTaskZipRequest(context: RequestContext, taskNo: string): Promise<void> {
  const url = new URL(
    `/api/client/maps-online/tasks/${encodeURIComponent(taskNo)}/download`,
    getApiBaseUrl()
  )
  const response = await fetch(url, { method: 'GET', headers: buildRequestHeaders(context) })
  const contentType = response.headers.get('Content-Type') ?? ''
  if (!response.ok || !contentType.includes('zip')) {
    throw await parseZipFailure(response)
  }

  const blob = await response.blob()
  const objectUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `${taskNo}.zip`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(objectUrl)
}

/** 解析 ZIP 下载失败响应为带上下文的 HomepageApiError。 */
async function parseZipFailure(response: Response): Promise<HomepageApiError> {
  let message = `HTTP ${response.status}`
  let code: number | string | undefined
  try {
    const body = (await response.json()) as { msg?: string; message?: string; code?: number | string }
    message = body.msg || body.message || message
    code = body.code
  } catch {
    // 响应体不是 JSON（如网关错误页）时保留 HTTP 状态信息。
  }
  return new HomepageApiError(`GET /api/client/maps-online/tasks download failed: ${message}`, response.status, code)
}
