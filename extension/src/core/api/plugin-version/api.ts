import { httpClient } from '@/core/api'
import { API } from '@/core/api/config'
import { logger } from '@/core/utils/logger'
import { isUpdateUrl, type PluginVersionCheck, type PluginVersionState } from './types'

/** background 唯一 HTTP owner；每次调用都现查，不保留放行结果。 */
export async function checkPluginVersion(): Promise<PluginVersionState> {
  try {
    const value = await httpClient.get<unknown>(API.ENDPOINTS.PLUGIN_VERSION_CHECK, {
      params: { plugin: 'maps', version: chrome.runtime.getManifest().version },
      requireAuth: false,
      skipRetry: true,
      skipErrorToast: true,
      cache: 'no-store'
    })
    return parseHttpCheck(value)
  } catch (error) {
    logger.error('[PluginVersion] GET /api/client/plugin-versions/check 检查失败:', error)
    return null
  }
}

function parseHttpCheck(value: unknown): PluginVersionCheck {
  if (typeof value !== 'object' || value === null || !('status' in value) || !('update' in value)) {
    throw new Error('[PluginVersion] HTTP 响应缺少 status/update')
  }
  const { status, update } = value
  if (status !== 'current' && status !== 'update_available' && status !== 'disabled') {
    throw new Error('[PluginVersion] HTTP 响应 status 非法')
  }
  if (update === null && status !== 'update_available') return { status, update: null }
  if (
    status !== 'current' &&
    typeof update === 'object' &&
    update !== null &&
    'version' in update &&
    typeof update.version === 'string' &&
    'url' in update &&
    typeof update.url === 'string' &&
    isUpdateUrl(update.url)
  ) {
    return { status, update: { version: update.version, url: update.url } }
  }
  throw new Error('[PluginVersion] HTTP 响应 update 非法')
}
