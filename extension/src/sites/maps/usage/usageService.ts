/**
 * Maps 月度配额服务（013 A11，U7，background 单例）。
 *
 * 职责：
 * 1. usage 快照缓存（60s TTL）：面板挂载渲染与 popup 账号区走缓存，避免每页
 *    采集页都打服务端；Start 门控用 force 拉最新值（「下次 start 前拉最新
 *    usage」承诺）。
 * 2. 订阅 content 的 `mapsUsageReport` 事件（搜索/评论/照片采集完成边沿），
 *    调后端上报扣减。上报失败只记录错误不重试、不阻断采集（容错轴：局部可
 *    失败；同会话的幂等键在服务端兜住后续重放）。
 * 3. 向批量调度器（createBulkTask/startBulkTask 前置校验）与 RPC
 *    `getMapsUsage` 提供快照。快照不可得（网络/服务端故障）返回 null，
 *    调用方 fail-open（采集可用性优先，与 spec-redis 服务端 fail-closed 互补）。
 */

import { logger } from '@/core/utils/logger'
import type { ExtensionEvents, MapsUsageReportPayload } from '@/core/events/types'
import { ChromeEventSubscriber } from '@/core/rpc/ChromeEventBus'
import { fetchMapsUsage, reportMapsUsage } from './usageApi'
import type { MapsUsageSnapshot } from './types'

/** 快照缓存有效期：窗口内重复消费（多页面板/批量校验/popup）不重复打服务端。 */
const SNAPSHOT_TTL_MS = 60_000

export class MapsUsageService {
  private readonly eventSubscriber = new ChromeEventSubscriber<ExtensionEvents>()

  private unsubscribeReport: (() => void) | null = null

  private snapshot: MapsUsageSnapshot | null = null

  private snapshotAt = 0

  private inflightFetch: Promise<MapsUsageSnapshot | null> | null = null

  /** 注册完成边沿上报订阅（background 装配入口；幂等）。 */
  setup(): void {
    if (this.unsubscribeReport !== null) {
      return
    }
    this.unsubscribeReport = this.eventSubscriber.on('mapsUsageReport', payload => {
      void this.handleReport(payload)
    })
    logger.info('[MapsUsage] 配额服务已注册')
  }

  destroy(): void {
    this.unsubscribeReport?.()
    this.unsubscribeReport = null
    this.eventSubscriber.destroy()
  }

  /**
   * 读取 usage 快照；不可得时返回 null（fail-open 语义，见模块注释）。
   *
   * @param force true 跳过缓存现拉（Start 门控路径）；拉取失败回退缓存值。
   */
  async getSnapshot(force = false): Promise<MapsUsageSnapshot | null> {
    if (!force && this.isCacheFresh()) {
      return this.snapshot
    }

    this.inflightFetch ??= this.doFetch()
    const fetched = await this.inflightFetch
    this.inflightFetch = null

    if (fetched === null) {
      // 拉取失败回退旧快照（可能过期）——门控宁可放行也不误伤可用性。
      return this.snapshot
    }
    return fetched
  }

  /** 处理一次采集会话的完成上报（失败仅记录；public 供事件接线与测试复用）。 */
  async handleReport(payload: MapsUsageReportPayload): Promise<void> {
    try {
      const reported = await reportMapsUsage(payload.records, payload.requestId)
      this.snapshot = reported
      this.snapshotAt = Date.now()
      logger.info(
        `[MapsUsage] 用量上报: source=${payload.source}, records=${payload.records}, ` +
          `deducted=${String(reported.deducted)}, used=${String(reported.used)}/${String(reported.total)}`
      )
    } catch (error) {
      // 失败不阻断采集：上报通道允许局部失败（下次 start 前会重拉 usage）。
      logger.error('[MapsUsage] 用量上报失败（不阻断采集）:', error)
    }
  }

  private isCacheFresh(): boolean {
    return this.snapshot !== null && Date.now() - this.snapshotAt < SNAPSHOT_TTL_MS
  }

  private async doFetch(): Promise<MapsUsageSnapshot | null> {
    try {
      const snapshot = await fetchMapsUsage()
      this.snapshot = snapshot
      this.snapshotAt = Date.now()
      return snapshot
    } catch (error) {
      logger.error('[MapsUsage] usage 拉取失败，按未知快照处理:', error)
      return null
    }
  }
}

/** background 配额服务单例（router 与批量调度器共享）。 */
export const mapsUsageService = new MapsUsageService()
