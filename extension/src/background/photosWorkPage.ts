/** 照片标签页跨 Google 重定向的一次性采集意图，仅存公开 fid。 */

import type { JsonObject, JsonValue, RpcContext } from '@/core/rpc/types'
import { buildPhotosPageUrl, isPhotosPageUrl } from '@/sites/maps/content/extractionUrl'

// shortcut: SW 在跳转期间终止会丢失本次意图，用户从原面板重新打开即可重试。
const intents = new Map<number, string>()

export function clearPhotosWorkIntent(tabId: number): void {
  intents.delete(tabId)
}

export async function photosWorkPage(
  params: JsonValue | undefined,
  context: RpcContext
): Promise<{ opened: boolean; fid: string | null }> {
  if (context.tabId === undefined || !context.senderUrl || !isJsonObject(params)) {
    throw new Error('[PhotosWorkPage] 请求缺少可信来源标签页或动作对象')
  }
  const source = new URL(context.senderUrl)

  if (params.action === 'claim') {
    if (!isPhotosPageUrl(source)) {
      throw new Error('[PhotosWorkPage] 仅允许 Google 照片图库领取采集意图')
    }
    const fid = intents.get(context.tabId) ?? null
    intents.delete(context.tabId)
    return { opened: false, fid }
  }
  if (
    params.action !== 'open' ||
    source.protocol !== 'https:' ||
    source.hostname !== 'www.google.com' ||
    !source.pathname.startsWith('/maps/place/') ||
    typeof params.fid !== 'string' ||
    !/^0x[0-9a-f]{1,16}:0x[0-9a-f]{1,16}$/i.test(params.fid)
  ) {
    throw new Error('[PhotosWorkPage] 打开请求必须来自 Maps 地点页并携带合法 fid')
  }
  const target = await chrome.tabs.create({ url: 'about:blank', active: true })
  if (target.id === undefined) {
    throw new Error('[PhotosWorkPage] 创建照片工作页未返回标签页 ID')
  }
  intents.set(target.id, params.fid)
  await chrome.tabs.update(target.id, { url: buildPhotosPageUrl(params.fid) })
  return { opened: true, fid: null }
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
