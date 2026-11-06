import { API, httpClient } from '@/core/api'
import type { JsonValue } from '@/core/rpc/types'
import { parsePluginVersionCheck, type PluginVersionCheck } from './types'

/** 仅由 background 调用；每次检查读取服务端当前状态。 */
export async function checkPluginVersion(): Promise<PluginVersionCheck> {
  const data = await httpClient.get<JsonValue>(API.ENDPOINTS.PLUGIN_VERSION_CHECK, {
    params: { plugin: 'bing', version: chrome.runtime.getManifest().version },
    requireAuth: false,
    skipErrorToast: true,
    skipRetry: true,
    cache: 'no-store'
  })
  return parsePluginVersionCheck(data)
}
