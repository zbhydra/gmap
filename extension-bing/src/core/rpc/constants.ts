/**
 * RPC v2 共享常量。
 *
 * 集中定义协议版本、默认超时和 payload 上限，避免 client、server、generator 各自维护魔法值。
 */

/** RPC v2 协议版本号。 */
export const RPC_PROTOCOL_VERSION = 2

/** 默认 RPC 超时时间，单位毫秒。 */
export const DEFAULT_RPC_TIMEOUT = 30000

/** 默认请求体大小限制，单位字节。 */
export const DEFAULT_RPC_REQUEST_LIMIT = 65536

/** 默认响应体大小限制，单位字节。 */
export const DEFAULT_RPC_RESPONSE_LIMIT = 262144
