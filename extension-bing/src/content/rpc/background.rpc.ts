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

  /** 调用 checkPluginVersion 能力。 */
  checkPluginVersion(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'checkPluginVersion'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'checkPluginVersion'>>(
      'checkPluginVersion',
      undefined,
      options
    )
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
    params: RpcMethodParams<BackgroundHandler, 'getGateState'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'getGateState'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'getGateState'>,
      RpcMethodParams<BackgroundHandler, 'getGateState'>
    >('getGateState', params, options)
  }

  /** 调用 getBingUsage 能力。 */
  getBingUsage(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'getBingUsage'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'getBingUsage'>>(
      'getBingUsage',
      undefined,
      { ...options, timeout: options?.timeout ?? 60000 }
    )
  }

  /** 调用 reportBingUsage 能力。 */
  reportBingUsage(
    params: RpcMethodParams<BackgroundHandler, 'reportBingUsage'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'reportBingUsage'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'reportBingUsage'>,
      RpcMethodParams<BackgroundHandler, 'reportBingUsage'>
    >('reportBingUsage', params, { ...options, timeout: options?.timeout ?? 60000 })
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

  /** 调用 enrichBusinesses 能力。 */
  enrichBusinesses(
    params: RpcMethodParams<BackgroundHandler, 'enrichBusinesses'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'enrichBusinesses'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'enrichBusinesses'>,
      RpcMethodParams<BackgroundHandler, 'enrichBusinesses'>
    >('enrichBusinesses', params, { ...options, timeout: options?.timeout ?? 35000 })
  }

  /** 销毁 RPC transport。 */
  destroy(): void {
    this.transport.destroy()
  }
}
