/**
 * 由 rpc-generate 生成的 background Chrome RPC 客户端。
 *
 * 来源：src/background/background-register.ts
 */

import { ChromeRpcTransport } from '@/core/rpc/transports/ChromeRpcTransport'
import type {
  RpcCallOptions,
  RpcMethodParams,
  RpcMethodResult,
  RpcTransport
} from '@/core/rpc/types'
import type { BackgroundHandler } from '@/background/background-register'

/** content 调用 background provider 的生成客户端。 */
export class BackgroundChannel {
  /** RPC transport。 */
  private readonly transport: RpcTransport

  /** 创建 BackgroundChannel。 */
  constructor(options: RpcCallOptions = {}) {
    this.transport = new ChromeRpcTransport('background', options)
  }

  /** 调用 getBingConfig 能力。 */
  getBingConfig(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'getBingConfig'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'getBingConfig'>>(
      'getBingConfig',
      undefined,
      options
    )
  }

  /** 调用 getGateState 能力。 */
  getGateState(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'getGateState'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'getGateState'>>(
      'getGateState',
      undefined,
      options
    )
  }

  /** 调用 openExtensionLogin 能力。 */
  openExtensionLogin(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'openExtensionLogin'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'openExtensionLogin'>>(
      'openExtensionLogin',
      undefined,
      options
    )
  }

  /** 调用 recordMark 能力。 */
  recordMark(
    params: RpcMethodParams<BackgroundHandler, 'recordMark'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'recordMark'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'recordMark'>,
      RpcMethodParams<BackgroundHandler, 'recordMark'>
    >('recordMark', params, options)
  }

  /** 销毁 RPC transport。 */
  destroy(): void {
    this.transport.destroy()
  }
}
