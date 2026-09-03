/**
 * Maps 远程配置读取（background 唯一 owner）。
 *
 * background RPC `getMapsConfig` 的实际执行体：1 小时内返回 storage 缓存，
 * 过期后 GET /api/client/maps/config 并更新缓存。配置通道无鉴权、不重试、
 * 不弹 Toast；网络失败由 content loader 回退包内默认值。
 */

import { API, STORAGE_KEYS } from '@/core/api/config'
import { httpClient } from '@/core/api'
import { storageManager } from '@/core/storage'
import { logger } from '@/core/utils/logger'
import type { JsonObject } from '@/core/rpc/types'
import type { MapsRemoteConfigOverride } from './contract'

const CACHE_TTL_MS = 60 * 60 * 1000

interface MapsRemoteConfigCache {
  fetchedAt: number
  override: MapsRemoteConfigOverride
}

/**
 * 读取缓存或拉取服务端稀疏覆盖载荷。
 *
 * @returns 服务端下发的三组稀疏覆盖，仅含要覆盖的键。
 * @throws 响应非 JSON 对象或请求失败时抛错（三要素错误消息），由 loader 回退。
 */
export async function fetchMapsRemoteConfig(): Promise<MapsRemoteConfigOverride> {
  const cached = await readCache()
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.override
  }

  const data = await httpClient.get<MapsRemoteConfigOverride>(API.ENDPOINTS.MAPS_CONFIG, {
    requireAuth: false,
    skipRetry: true,
    skipErrorToast: true
  })

  if (!isJsonObject(data)) {
    throw new Error(
      `[MapsRemoteFetch] ${API.ENDPOINTS.MAPS_CONFIG} 响应 data 不是 JSON 对象: ${describeValue(data)}`
    )
  }

  try {
    await storageManager.set(STORAGE_KEYS.MAPS_REMOTE_CONFIG, {
      fetchedAt: Date.now(),
      override: data
    } satisfies MapsRemoteConfigCache)
  } catch (error) {
    logger.error('[MapsRemoteFetch] 写入远程配置缓存失败:', error)
  }

  return data
}

/** 读取缓存失败时记录错误并继续网络请求，避免 storage 局部故障阻断配置刷新。 */
async function readCache(): Promise<MapsRemoteConfigCache | null> {
  try {
    const cached = await storageManager.get<MapsRemoteConfigCache>(STORAGE_KEYS.MAPS_REMOTE_CONFIG)
    return cached && typeof cached.fetchedAt === 'number' && isJsonObject(cached.override)
      ? cached
      : null
  } catch (error) {
    logger.error('[MapsRemoteFetch] 读取远程配置缓存失败，继续网络拉取:', error)
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
