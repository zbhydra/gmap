/**
 * Bing 远程配置 HTTP 拉取（background 侧透传）。
 *
 * background RPC `getBingConfig` 的实际执行体：GET /api/client/bing/config，
 * 拦截器剥壳后返回服务端稀疏覆盖载荷。后端端点未上线前必然 404/失败，
 * 由 content 侧 loader 静默回退包内默认值（T1 §4.2 预期行为）。
 * 配置通道无鉴权、不重试、不弹 Toast。
 */

import { API } from '@/core/api/config'
import { httpClient } from '@/core/api'
import type { JsonObject } from '@/core/rpc/types'
import type { BingRemoteConfigOverride } from './contract'

/**
 * 拉取服务端稀疏覆盖载荷。
 *
 * @returns 服务端下发的稀疏覆盖，仅含要覆盖的键（adapters 缺省 = 不整体替换）。
 * @throws 响应非 JSON 对象或请求失败时抛错（三要素错误消息），由 loader 回退。
 */
export async function fetchBingRemoteConfig(): Promise<BingRemoteConfigOverride> {
  const data = await httpClient.get<BingRemoteConfigOverride>(API.ENDPOINTS.BING_CONFIG, {
    requireAuth: false,
    skipRetry: true,
    skipErrorToast: true
  })

  if (!isJsonObject(data)) {
    throw new Error(
      `[BingRemoteFetch] ${API.ENDPOINTS.BING_CONFIG} 响应 data 不是 JSON 对象: ${describeValue(data)}`
    )
  }

  return data
}

/** 判断拦截器剥壳后的 data 是否为 JSON 对象（数组与原始值视为无效载荷）。 */
function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 错误消息里对无效载荷的简短描述，避免直接展开大对象。 */
function describeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `array(len=${value.length})`
  }
  if (value === null || value === undefined) {
    return 'null'
  }
  if (typeof value === 'object') {
    return 'object'
  }
  return `type=${typeof value}`
}
