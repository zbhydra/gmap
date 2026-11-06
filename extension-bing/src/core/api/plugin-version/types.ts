import type { JsonValue } from '@/core/rpc/types'

export type PluginVersionCheck = {
  status: 'current' | 'update_available' | 'disabled'
  update: { version: string; url: string } | null
}

/** HTTP 与 RPC 接收端共用返回合同，异常响应不能放行采集。 */
export function parsePluginVersionCheck(data: JsonValue | undefined): PluginVersionCheck {
  const invalid = () => new Error('[PluginVersion] 版本检查响应无效')
  if (
    typeof data !== 'object' ||
    data === null ||
    Array.isArray(data) ||
    !('status' in data) ||
    (data.status !== 'current' &&
      data.status !== 'update_available' &&
      data.status !== 'disabled') ||
    !('update' in data)
  ) {
    throw invalid()
  }
  const update = data.update
  if (update === null) {
    if (data.status === 'update_available') throw invalid()
    return { status: data.status, update: null }
  }
  if (
    data.status === 'current' ||
    typeof update !== 'object' ||
    Array.isArray(update) ||
    !('version' in update) ||
    typeof update.version !== 'string' ||
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(update.version) ||
    !('url' in update) ||
    typeof update.url !== 'string'
  ) {
    throw invalid()
  }
  let url: URL
  try {
    url = new URL(update.url)
  } catch {
    throw invalid()
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw invalid()
  return { status: data.status, update: { version: update.version, url: update.url } }
}
