/**
 * Maps 集成同步服务（013 A10，U9）。
 *
 * 订阅 content 的 mapsAutoSaveExport 事件（采集完成边沿广播），在 background
 * 执行两条独立链路：Drive REST multipart 直传（host_permissions googleapis.com，
 * SW 发起免 CORS）与 HubSpot 同步（经 backend 代理端点）——竞品同构（逆向 06/07：
 * background mod_176 / mod_187）。单路失败只记录错误，不影响另一路与导出。
 *
 * auto_save 开但未授权属异常态（options 页授权后才允许开），此处跳过并告警。
 */

import { logger } from '@/core/utils/logger'
import { markApi } from '@/core/api/mark'
import { MARK_TYPE } from '@/core/api/mark/types'
import type { ExtensionEvents, MapsAutoSaveExportPayload } from '@/core/events/types'
import { ChromeEventSubscriber } from '@/core/rpc/ChromeEventBus'
import {
  MapsIntegrationAuthManager,
  getDriveAccessToken,
  getHubspotAccessToken,
  syncBusinessesToHubspot,
  uploadCsvToDrive
} from '@/sites/maps/settings/integrations'

/** 统一的 Maps 集成同步服务。 */
export class MapsIntegrationSyncService {
  /** 跨插件上下文的业务事件订阅器。 */
  private readonly eventSubscriber = new ChromeEventSubscriber<ExtensionEvents>()

  /** 事件取消订阅函数集合。 */
  private readonly unsubscribes: Array<() => void> = []

  /** 注册同步事件。重复调用不会重复订阅。 */
  setup(): void {
    if (this.unsubscribes.length > 0) {
      return
    }
    this.unsubscribes.push(
      this.eventSubscriber.on('mapsAutoSaveExport', payload => {
        void this.handleAutoSave(payload)
      })
    )
  }

  /**
   * 双路同步：Promise.allSettled 保证单路失败不阻断另一路（局部可失败）。
   */
  private async handleAutoSave(payload: MapsAutoSaveExportPayload): Promise<void> {
    await Promise.allSettled([this.syncDrive(payload), this.syncHubspot(payload)])
  }

  /**
   * Drive 直传：未授权跳过 → 现取有效 token → multipart 上传 → 打点。
   * 打点失败不影响本路结果（打点通道允许局部失败）。
   */
  private async syncDrive(payload: MapsAutoSaveExportPayload): Promise<void> {
    try {
      const { drive } = await MapsIntegrationAuthManager.getAuth()
      if (drive === null) {
        logger.warn('[MapsIntegrationSync] auto_save 开但 Drive 未授权，跳过上传')
        return
      }
      const token = await getDriveAccessToken()
      if (token === null) {
        throw new Error('Drive token 不可用（未授权或需要交互授权）')
      }
      await uploadCsvToDrive(token, payload.filename, payload.csvContent)
      logger.info(
        `[MapsIntegrationSync] Drive 上传完成: rows=${payload.rowCount}, file=${payload.filename}`
      )
      await this.recordDriveMark(payload, 'success')
    } catch (error) {
      logger.error('[MapsIntegrationSync] Drive 上传失败:', error)
      await this.recordDriveMark(payload, 'failed')
    }
  }

  /** HubSpot 同步：未授权跳过 → 现取（必要时刷新）token → backend 代理转发。 */
  private async syncHubspot(payload: MapsAutoSaveExportPayload): Promise<void> {
    try {
      if (payload.businesses.length === 0) {
        return
      }
      const { hubspot } = await MapsIntegrationAuthManager.getAuth()
      if (hubspot === null) {
        logger.warn('[MapsIntegrationSync] auto_save 开但 HubSpot 未授权，跳过同步')
        return
      }
      const token = await getHubspotAccessToken()
      if (token === null) {
        throw new Error('HubSpot token 不可用（未授权）')
      }
      const result = await syncBusinessesToHubspot(token, payload.businesses)
      logger.info(
        `[MapsIntegrationSync] HubSpot 同步完成: synced=${result.synced}, rows=${payload.rowCount}`
      )
    } catch (error) {
      logger.error('[MapsIntegrationSync] HubSpot 同步失败:', error)
    }
  }

  /**
   * sync_to_google_drive 打点：尝试同步即上报（含失败结果），打点失败仅记录。
   */
  private async recordDriveMark(
    payload: MapsAutoSaveExportPayload,
    outcome: 'success' | 'failed'
  ): Promise<void> {
    try {
      await markApi.record(
        MARK_TYPE.SYNC_TO_GOOGLE_DRIVE,
        `rows=${payload.rowCount}, outcome=${outcome}`,
        { pageUrl: payload.pageUrl }
      )
    } catch (error) {
      logger.error('[MapsIntegrationSync] sync_to_google_drive 打点失败:', error)
    }
  }

  /** 释放事件订阅器。 */
  destroy(): void {
    for (const unsubscribe of this.unsubscribes.splice(0)) {
      unsubscribe()
    }
    this.eventSubscriber.destroy()
  }
}
