/**
 * Maps injected ↔ content 的 CustomEvent 通道契约。
 *
 * injected（页面主世界）hook 到 Maps 内部搜索 RPC 响应后，经 document 级
 * CustomEvent 转发给 content（隔离 world）。本文件只含常量与 payload 类型，
 * 双方共享且不引入任何 chrome.* 依赖（injected 主世界不可用 chrome API）。
 */

/** injected → content 转发 Maps 搜索 RPC 响应的事件名。 */
export const MAPS_RPC_RESPONSE_EVENT = 'gmaps-maps-rpc-response'

/** Maps 内部搜索 RPC 的 URL 特征（`https://www.google.com/search?tbm=map&…`）。 */
export const MAPS_RPC_URL_MARK = '/search?tbm='

/**
 * Maps 内部搜索 RPC 响应完整性哨兵（响应文本以此结尾才算完整）。
 *
 * 取舍声明：injected 以哨兵结尾作为转发条件，因此线上 hook 只会产出
 * 格式 B（SPA XHR）响应；格式 A（直接导航页面数据）的解析分支当前仅有
 * 离线覆盖（黄金样本单测），线上不可达。若未来需要线上支持格式 A
 * （如直接导航场景即开始采集），需放宽此处的捕获条件。
 */
export const MAPS_RPC_RESPONSE_SENTINEL = '/*""*/'

/** MAPS_RPC_RESPONSE_EVENT 的 payload。 */
export interface MapsRpcResponseDetail {
  /** 完整响应文本（未剥壳）。 */
  str: string
  /** 请求 URL（调试定位用）。 */
  url: string
}
