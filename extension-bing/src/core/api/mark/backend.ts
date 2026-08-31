/**
 * 后端 mark 通道上报（POST /api/client/mark/record）。
 *
 * 与 SLS WebTracking（api.ts）并立的第二条件打点通道。当前仅 install 事件
 * 按 013 域拍板走双报（分析通道 + 后端 mark 通道）；常规业务打点仍只写 SLS。
 * 通道无鉴权（依赖 X-Device-Id 游客上下文）、不重试、不弹 Toast，失败由
 * 调用方自行降级，不影响插件业务。
 */

import { API } from '../config'
import { httpClient } from '../index'
import type { MarkResponse, MarkType } from './types'

/** 后端 mark 通道请求体。 */
interface BackendMarkRequest {
  /** 打点类型。 */
  mark_type: MarkType
  /** 打点附加信息。 */
  mark_msg: string
  /** 首次打开时间（毫秒时间戳），插件侧固定 0。 */
  first_opened_at: number
}

/**
 * 经后端 mark 通道记录一次打点。
 *
 * @returns 是否被后端受理（HTTP/业务信封失败会抛错而非返回 false）。
 * @throws 请求失败时抛 ApiError，调用方决定是否降级。
 */
export async function recordBackendMark(markType: MarkType, markMsg = ''): Promise<MarkResponse> {
  const body: BackendMarkRequest = {
    mark_type: markType,
    mark_msg: markMsg,
    first_opened_at: 0
  }

  await httpClient.post<MarkResponse>(API.ENDPOINTS.MARK_RECORD, body, {
    requireAuth: false,
    skipRetry: true,
    skipErrorToast: true
  })

  return { recorded: true }
}
