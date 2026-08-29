// Background Service Worker
// 处理扩展的后台任务和消息路由

import { logger } from '@/core/utils/logger'
import { BackgroundMessageRouter } from './services/BackgroundMessageRouter'
import { ExtensionMarkReporter } from './services/ExtensionMarkReporter'
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

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  logger.info('Extension installed')
  // 安装时也确保 device_id 已初始化
  initDeviceId().catch(error => {
    logger.error('[Background] Failed to initialize device_id on install:', error)
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
})
