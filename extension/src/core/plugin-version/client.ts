import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { parsePluginVersionCheck, type PluginVersionState } from '@/core/api/plugin-version/types'
import { I18N_KEYS } from '@/core/constants/i18n'
import { logger } from '@/core/utils/logger'

export async function fetchPluginVersion(): Promise<PluginVersionState> {
  const channel = new BackgroundChannel()
  try {
    return parsePluginVersionCheck(await channel.checkPluginVersion())
  } catch (error) {
    logger.error('[PluginVersion] background 版本检查 RPC 失败:', error)
    return null
  } finally {
    channel.destroy()
  }
}

export function pluginVersionMessageKey(state: PluginVersionState | undefined): string | null {
  const keys = I18N_KEYS.PLUGIN_VERSION
  if (state === undefined || state?.status === 'current') return null
  if (state === null) return keys.CHECK_FAILED
  if (state.status === 'update_available') return keys.UPDATE_AVAILABLE
  return state.update ? keys.DISABLED : keys.DISABLED_NO_UPDATE
}
