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

  /** 调用 getMapsConfig 能力。 */
  getMapsConfig(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'getMapsConfig'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'getMapsConfig'>>(
      'getMapsConfig',
      undefined,
      options
    )
  }

  /** 调用 getMapsUsage 能力。 */
  getMapsUsage(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'getMapsUsage'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'getMapsUsage'>>(
      'getMapsUsage',
      undefined,
      options
    )
  }

  /** 调用 enrichMapsBusinesses 能力。 */
  enrichMapsBusinesses(
    params: RpcMethodParams<BackgroundHandler, 'enrichMapsBusinesses'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'enrichMapsBusinesses'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'enrichMapsBusinesses'>,
      RpcMethodParams<BackgroundHandler, 'enrichMapsBusinesses'>
    >('enrichMapsBusinesses', params, options)
  }

  /** 销毁 RPC transport。 */
  destroy(): void {
    this.transport.destroy()
  }
}
