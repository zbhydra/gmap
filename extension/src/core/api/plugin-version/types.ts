import type { JsonValue } from '@/core/rpc/types'

export type PluginVersionCheck = {
  status: 'current' | 'update_available' | 'disabled'
  update: { version: string; url: string } | null
}

/** null 表示检查失败；undefined 只用于尚未检查的界面。 */
export type PluginVersionState = PluginVersionCheck | null

export function parsePluginVersionCheck(value: JsonValue | undefined): PluginVersionState {
  if (value === null) return null
  if (
    typeof value !== 'object' ||
    value === undefined ||
    !('status' in value) ||
    !('update' in value)
  ) {
    throw new Error('[PluginVersion] RPC 响应必须为版本状态或 null')
  }
  const { status, update } = value
  if (status !== 'current' && status !== 'update_available' && status !== 'disabled') {
    throw new Error('[PluginVersion] RPC 响应 status 非法')
  }
  if (update === null && status !== 'update_available') return { status, update: null }
  if (
    status !== 'current' &&
    typeof update === 'object' &&
    update !== null &&
    'version' in update &&
    'url' in update &&
    typeof update.version === 'string' &&
    typeof update.url === 'string' &&
    isUpdateUrl(update.url)
  ) {
    return { status, update: { version: update.version, url: update.url } }
  }
  throw new Error('[PluginVersion] RPC 响应 update 非法')
}

export function isUpdateUrl(value: string): boolean {
  if (!URL.canParse(value)) return false
  const url = new URL(value)
  return url.protocol === 'http:' || url.protocol === 'https:'
}

export function canStartWithPluginVersion(state: PluginVersionState): boolean {
  return state !== null && state.status !== 'disabled'
}
