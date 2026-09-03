/**
 * Injected script（页面主世界，无 chrome.* API）。
 *
 * 职责：hook XMLHttpRequest，在响应完整（以尾部哨兵结尾，见
 * MAPS_RPC_RESPONSE_SENTINEL）时把 Maps 内部搜索 RPC（URL 含 `/search?tbm=`）
 * 的响应文本经 CustomEvent 转发给 content。
 *
 * 依据（013 逆向 03 §3.1 / 10 号实测）：
 * - 隔离 world 无法 hook 页面 XHR，必须进入主世界；
 * - 竞品在 progress 事件即截获（不等 load），以哨兵结尾判完整、每请求只发一次；
 * - 10 号「晚注入无效」警告：content script 以 document_start 注入后立即
 *   注入本脚本，保证 hook 先于页面脚本发起的 RPC。
 *
 * 取舍声明：哨兵结尾的转发条件意味着线上只会产出格式 B（SPA XHR）响应；
 * 格式 A（直接导航）解析分支仅由黄金样本单测离线覆盖，线上不可达。若未来
 * 需要线上支持格式 A，需放宽 MAPS_RPC_RESPONSE_SENTINEL 的捕获条件。
 *
 * 防御细节：hook 引用（open/send 原函数）在模块加载时捕获，后续页面脚本
 * 再覆盖 prototype 不影响本 hook；xhr 元数据存 WeakMap，不在 XHR 实例上
 * 挂自定义属性（避免与页面脚本冲突，也避免全局类型扩展）。
 */

import { logger } from '@/core/utils/logger'
import {
  MAPS_RPC_RESPONSE_EVENT,
  MAPS_RPC_RESPONSE_SENTINEL,
  MAPS_RPC_URL_MARK,
  type MapsRpcResponseDetail
} from '@/sites/maps/content/rpcEvents'

/** 每个请求的 open URL（WeakMap 不阻止 XHR 实例被回收）。 */
const xhrUrls = new WeakMap<XMLHttpRequest, string>()

/** 已转发过的请求（每请求至多转发一次）。 */
const notifiedXhrs = new WeakSet<XMLHttpRequest>()

const originalOpen = XMLHttpRequest.prototype.open
const originalSend = XMLHttpRequest.prototype.send

/**
 * 转发入口：响应完整且未转发过时，dispatch CustomEvent 给 content。
 *
 * @param xhr 目标请求实例。
 * @param url 请求 URL（open 时记录）。
 */
function notifyIfComplete(xhr: XMLHttpRequest, url: string): void {
  if (notifiedXhrs.has(xhr)) {
    return
  }

  let text: string
  try {
    // responseText 仅在响应为文本且已就绪时可读，二进制/未就绪读取会抛错
    text = xhr.responseText
  } catch (error) {
    console.error('[MapsInjected] XHR responseText 读取失败:', error)
    return
  }

  if (!text.endsWith(MAPS_RPC_RESPONSE_SENTINEL)) {
    return
  }

  notifiedXhrs.add(xhr)
  const detail: MapsRpcResponseDetail = { str: text, url }
  document.dispatchEvent(
    new CustomEvent<MapsRpcResponseDetail>(MAPS_RPC_RESPONSE_EVENT, { detail })
  )
  logger.info(`[MapsInjected] 已转发搜索 RPC 响应: url=${url}, bytes=${text.length}`)
}

/** 包装 open：记录 URL 特征，供 send 时判定是否需要监听。 */
XMLHttpRequest.prototype.open = function (
  this: XMLHttpRequest,
  method: string,
  url: string | URL,
  async?: boolean,
  username?: string | null,
  password?: string | null
): void {
  xhrUrls.set(this, String(url))
  originalOpen.call(this, method, url, async ?? true, username, password)
}

/** 包装 send：命中 Maps 搜索 RPC 的请求挂 progress/load 双监听（小响应可能不触发 progress）。 */
XMLHttpRequest.prototype.send = function (
  this: XMLHttpRequest,
  body?: Document | XMLHttpRequestBodyInit | null
): void {
  const url = xhrUrls.get(this)
  if (url && url.includes(MAPS_RPC_URL_MARK)) {
    const handler = (): void => notifyIfComplete(this, url)
    this.addEventListener('progress', handler)
    this.addEventListener('load', handler)
  }
  originalSend.call(this, body ?? null)
}

logger.info('[MapsInjected] XHR hook 已就绪')
