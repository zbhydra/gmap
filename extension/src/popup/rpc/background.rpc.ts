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

/** popup 调用 background provider 的生成客户端。 */
export class BackgroundChannel {
  /** RPC transport。 */
  private readonly transport: RpcTransport

  /** 创建 BackgroundChannel。 */
  constructor(options: RpcCallOptions = {}) {
    this.transport = new ChromeRpcTransport('background', options)
  }

  /** 调用 ping 能力。 */
  ping(options?: RpcCallOptions): Promise<RpcMethodResult<BackgroundHandler, 'ping'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'ping'>>(
      'ping',
      undefined,
      options
    )
  }

  /** 调用 getState 能力。 */
  getState(options?: RpcCallOptions): Promise<RpcMethodResult<BackgroundHandler, 'getState'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'getState'>>(
      'getState',
      undefined,
      options
    )
  }

  /** 调用 getRuntimeConfig 能力。 */
  getRuntimeConfig(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'getRuntimeConfig'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'getRuntimeConfig'>>(
      'getRuntimeConfig',
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

  /** 调用 getBulkState 能力。 */
  getBulkState(
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'getBulkState'>> {
    return this.transport.call<RpcMethodResult<BackgroundHandler, 'getBulkState'>>(
      'getBulkState',
      undefined,
      options
    )
  }

  /** 调用 createBulkTask 能力。 */
  createBulkTask(
    params: RpcMethodParams<BackgroundHandler, 'createBulkTask'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'createBulkTask'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'createBulkTask'>,
      RpcMethodParams<BackgroundHandler, 'createBulkTask'>
    >('createBulkTask', params, options)
  }

  /** 调用 startBulkTask 能力。 */
  startBulkTask(
    params: RpcMethodParams<BackgroundHandler, 'startBulkTask'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'startBulkTask'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'startBulkTask'>,
      RpcMethodParams<BackgroundHandler, 'startBulkTask'>
    >('startBulkTask', params, options)
  }

  /** 调用 stopBulkTask 能力。 */
  stopBulkTask(
    params: RpcMethodParams<BackgroundHandler, 'stopBulkTask'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'stopBulkTask'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'stopBulkTask'>,
      RpcMethodParams<BackgroundHandler, 'stopBulkTask'>
    >('stopBulkTask', params, options)
  }

  /** 调用 deleteBulkTask 能力。 */
  deleteBulkTask(
    params: RpcMethodParams<BackgroundHandler, 'deleteBulkTask'>,
    options?: RpcCallOptions
  ): Promise<RpcMethodResult<BackgroundHandler, 'deleteBulkTask'>> {
    return this.transport.call<
      RpcMethodResult<BackgroundHandler, 'deleteBulkTask'>,
      RpcMethodParams<BackgroundHandler, 'deleteBulkTask'>
    >('deleteBulkTask', params, options)
  }

  /** 销毁 RPC transport。 */
  destroy(): void {
    this.transport.destroy()
  }
}
