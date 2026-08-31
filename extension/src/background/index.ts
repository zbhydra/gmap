// Background Service Worker
// 处理扩展的后台任务和消息路由

import { logger } from '@/core/utils/logger'
import { BackgroundMessageRouter } from './services/BackgroundMessageRouter'
import { ExtensionMarkReporter } from './services/ExtensionMarkReporter'
import { MapsIntegrationSyncService } from './services/MapsIntegrationSyncService'
import { mapsUsageService } from '@/sites/maps/usage/usageService'
import { reportInstallMark } from './services/InstallMarkReporter'
import { bulkScheduler } from './batch/controller'
import { storageManager } from '@/core/storage'
import { STORAGE_KEYS } from '@/core/api/config'
import { initializeRuntimeLogger } from './runtimeConfig'

/**
 * 初始化 device_id
 * Background service worker 只有一个实例，不会有竞态问题
 */
async function initDeviceId() {
  const deviceId = await storageManager.get<string>(STORAGE_KEYS.DEVICE_ID)
  if (!deviceId) {
    const newDeviceId = crypto.randomUUID()
    await storageManager.set(STORAGE_KEYS.DEVICE_ID, newDeviceId)
    logger.info('[Background] Initialized device_id:', newDeviceId)
  }
}

// 启动时立即初始化
initializeRuntimeLogger().catch(error => {
  logger.error('[BackgroundRuntimeConfig] 初始化日志配置失败:', error)
})

initDeviceId().catch(error => {
  logger.error('[Background] Failed to initialize device_id:', error)
})

logger.info('[GMaps-Extension] Background Service Worker 已启动')
logger.info('Background service worker initialized')

// 初始化消息路由器
const messageRouter = new BackgroundMessageRouter()
messageRouter.setupListener()

// Popup 与 Content 的共享行为事件由 background 统一写入 SLS。
const extensionMarkReporter = new ExtensionMarkReporter()
extensionMarkReporter.setup()

// Maps 集成同步（013 A10）：消费采集完成边沿的 auto_save 事件，Drive 直传 +
// HubSpot 代理同步（单路失败不阻断）。
const mapsIntegrationSyncService = new MapsIntegrationSyncService()
mapsIntegrationSyncService.setup()

// Maps 月度配额（013 A11，U7）：消费采集完成边沿的 usage 上报事件（幂等扣减，
// 失败不阻断采集），并向 RPC 门控与批量前置校验提供 usage 快照。
mapsUsageService.setup()

// 批量任务调度器（013 A6）：监听工作页回报 / alarm / 标签关闭并做恢复扫描。
// 监听必须在 SW 顶层同步注册——消息与 alarm 本身会唤醒 SW，晚注册会丢事件。
bulkScheduler.setup()

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(details => {
  logger.info(`Extension installed: reason=${details.reason}`)
  // 安装时也确保 device_id 已初始化
  const ensureDeviceId = async () => {
    await initDeviceId()
  }
  // install 埋点双报（分析通道 + 后端 mark 通道），失败不阻断
  reportInstallMark(details.reason, ensureDeviceId).catch(error => {
    logger.error('[Background] install 埋点双报失败:', error)
  })
})

// 监听服务 worker 启动事件
chrome.runtime.onStartup.addListener(() => {
  logger.info('Service worker started')
})

// 监听扩展暂停事件（即将被终止）
chrome.runtime.onSuspend.addListener(() => {
  logger.info('Service worker suspending')
  // 清理路由器资源
  messageRouter.destroy()
  extensionMarkReporter.destroy()
  mapsIntegrationSyncService.destroy()
  mapsUsageService.destroy()
  bulkScheduler.destroy()
})
