/**
 * Bing 远程配置读取（background 唯一 owner）。
 *
 * background RPC `getBingConfig` 的实际执行体：1 小时内返回 storage 缓存，
 * 过期后 GET /api/client/bing/config 并更新缓存。后端端点未上线前必然 404/失败，
 * 由 content loader 静默回退包内默认值（T1 §4.2 预期行为）。
 */

import { API, STORAGE_KEYS } from '@/core/api/config'
import { httpClient } from '@/core/api'
import { storageManager } from '@/core/storage'
import { logger } from '@/core/utils/logger'
import type { JsonObject } from '@/core/rpc/types'
import type { BingRemoteConfigOverride } from './contract'

const CACHE_TTL_MS = 60 * 60 * 1000

interface BingRemoteConfigCache {
  fetchedAt: number
  override: BingRemoteConfigOverride
}

/**
 * 读取缓存或拉取服务端稀疏覆盖载荷。
 *
 * @returns 服务端下发的稀疏覆盖，仅含要覆盖的键（adapters 缺省 = 不整体替换）。
 * @throws 响应非 JSON 对象或请求失败时抛错（三要素错误消息），由 loader 回退。
 */
export async function fetchBingRemoteConfig(): Promise<BingRemoteConfigOverride> {
  const cached = await readCache()
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.override
  }

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

  try {
    await storageManager.set(STORAGE_KEYS.BING_REMOTE_CONFIG, {
      fetchedAt: Date.now(),
      override: data
    } satisfies BingRemoteConfigCache)
  } catch (error) {
    logger.error('[BingRemoteFetch] 写入远程配置缓存失败:', error)
  }

  return data
}

/** 读取缓存失败时记录错误并继续网络请求，避免 storage 局部故障阻断配置刷新。 */
async function readCache(): Promise<BingRemoteConfigCache | null> {
  try {
    const cached = await storageManager.get<BingRemoteConfigCache>(STORAGE_KEYS.BING_REMOTE_CONFIG)
    return cached && typeof cached.fetchedAt === 'number' && isJsonObject(cached.override)
      ? cached
      : null
  } catch (error) {
    logger.error('[BingRemoteFetch] 读取远程配置缓存失败，继续网络拉取:', error)
    return null
  }
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
