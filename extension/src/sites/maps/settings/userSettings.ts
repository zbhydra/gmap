/**
 * Maps 用户设置（013 A9，U6）——个人偏好的全本地存储与「用户覆盖层」。
 *
 * 分层模型（013 拍板，11 号 #1/#4）：
 * - 远程配置（config/contract.ts 六组）：服务端治理通道，管「对抗 Google 改版」
 *   的选择器/解析 schema 与运营公告，用户不可见；
 * - 用户设置（本模块）：管个人偏好（采集间隔、导出格式/字段、自动化开关），
 *   全部存 chrome.storage.local（key 走 STORAGE_KEYS.MAPS_USER_SETTINGS），
 *   无 storage.sync、无远程拉取；清浏览器数据即回默认（storage 缺失时按
 *   默认值归一化，无需 onInstalled 预写）；
 * - 同名冲突裁决：**用户的显式偏好优先**。实现为「用户覆盖层」——loader 先
 *   把远程稀疏覆盖应用进生效配置，再由 applyUserOverridesToLiveConfig() 把
 *   用户显式设置过的间隔写入生效的 scrape.scrollIntervalSec（档位校验：用户
 *   值必须属于远程生效档位，否则视为远程治理收紧，保留远程值并告警）。
 *   用户从未表达过偏好的键（storage 无该字段）不参与覆盖——例如间隔未被
 *   设置时，服务端的全局间隔调参（风控治理）不被默认值顶掉。消费方
 *   （scraper）每轮现读生效配置，无需感知两层来源。
 */

import { storageManager } from '@/core/storage'
import { STORAGE_KEYS } from '@/core/api/config'
import { logger } from '@/core/utils/logger'
import { DEFAULT_MAPS_CONFIG } from '../config/contract'
import { getMapsConfig } from '../config/loader'
import type { SearchExportFormat } from '../content/export/engine'
import { SEARCH_EXPORT_COLUMNS } from '../content/export/columns'

/** 采集间隔默认档（09 参数总表 REQUEST_INTERVALS 默认 8 秒）。 */
const DEFAULT_REQUEST_INTERVAL_SEC = 8

/** 批量卡死重试次数默认值（竞品 stuck_max_retry 默认 1，U5 消费）。 */
const DEFAULT_STUCK_MAX_RETRY = 1

/** 合法导出格式（与竞品 export_data_format 三值一致）。 */
const EXPORT_FORMATS: readonly SearchExportFormat[] = ['csv', 'json', 'xlsx']

/** 全选时的导出列集合（36 列 header，从唯一事实来源 SEARCH_EXPORT_COLUMNS 派生）。 */
const ALL_EXPORT_HEADERS: readonly string[] = SEARCH_EXPORT_COLUMNS.map(column => column.header)

/** Maps 用户设置（个人偏好）。 */
export interface MapsUserSettings {
  /** 滚动/采集轮询间隔（秒），只能取远程档位内的值（默认 8）。 */
  requestIntervalSec: number
  /** 导出格式（默认 csv）。 */
  exportFormat: SearchExportFormat
  /** 勾选的导出列 header 集合（默认全选 36 列）。 */
  exportFieldHeaders: string[]
  /** 采集完成后自动下载（默认关）。 */
  autoDownload: boolean
  /** 自动保存到 Google Drive（默认关；U9 已接线：需先授权，complete 边沿经 background 直传）。 */
  autoSaveToGoogleDrive: boolean
  /** 自动保存到 HubSpot（默认关；U9 已接线：需先授权，complete 边沿经 backend 代理同步）。 */
  autoSaveToHubspot: boolean
  /** 采集完成补全官网 Email（默认关；Pro 语义字段，门控随 U7 配额体系收紧，当前可用）。 */
  extractEmail: boolean
  /** 采集完成补全官网社媒链接（默认关；Pro 语义字段，同上）。 */
  extractSocialMedias: boolean
  /** 批量卡死重试次数（默认 1；U5 批量面板消费）。 */
  stuckMaxRetry: number
}

/** 编译期完整默认值（与竞品 onInstalled 写入的默认语义一致）。 */
export const DEFAULT_MAPS_USER_SETTINGS: Readonly<MapsUserSettings> = Object.freeze({
  requestIntervalSec: DEFAULT_REQUEST_INTERVAL_SEC,
  exportFormat: 'csv',
  exportFieldHeaders: [...ALL_EXPORT_HEADERS],
  autoDownload: false,
  autoSaveToGoogleDrive: false,
  autoSaveToHubspot: false,
  extractEmail: false,
  extractSocialMedias: false,
  stuckMaxRetry: DEFAULT_STUCK_MAX_RETRY
})

type SettingsCallback = (settings: MapsUserSettings) => void

/** storage 里的设置是稀疏形状：只存用户表达过的字段。 */
type StoredMapsUserSettings = Partial<MapsUserSettings>

/**
 * 模块级快照：同步消费入口（面板渲染回调是同步链，不能现 await）。
 * initializeMapsUserSettings() 建快照并保持最新；初始化前为默认值。
 */
interface MapsUserSettingsSnapshot {
  /** 归一化后的完整设置（含默认值合并，供 UI 与导出消费）。 */
  settings: MapsUserSettings
  /** 用户显式设置过的间隔；null = 未表达偏好（用户覆盖层跳过，远程治理生效）。 */
  explicitRequestIntervalSec: number | null
}

let settingsSnapshot: MapsUserSettingsSnapshot = {
  settings: normalizeStored(null),
  explicitRequestIntervalSec: null
}

let initialized = false

/**
 * Maps 用户设置管理器（settings.ts 模式：静态类 + storageManager + onChanged 订阅）。
 */
export class MapsUserSettingsManager {
  private static callbacks: Set<SettingsCallback> = new Set()

  private static unsubscribe: (() => void) | null = null

  /** 默认设置（深拷贝，调用方修改不污染常量）。 */
  static getDefaultSettings(): MapsUserSettings {
    return {
      ...DEFAULT_MAPS_USER_SETTINGS,
      exportFieldHeaders: [...DEFAULT_MAPS_USER_SETTINGS.exportFieldHeaders]
    }
  }

  /** 读取设置：storage 缺失/形状非法时按默认值归一化（部分缺失字段回默认）。 */
  static async getSettings(): Promise<MapsUserSettings> {
    return normalizeStored(await readStoredSettings())
  }

  /** 合并写入并返回新设置；监听器经 storage.onChanged 触发。 */
  static async updateSettings(updates: Partial<MapsUserSettings>): Promise<MapsUserSettings> {
    const current = await this.getSettings()
    const next = normalizeStored({ ...current, ...updates })
    await storageManager.set(STORAGE_KEYS.MAPS_USER_SETTINGS, next)
    return next
  }

  /** 重置回默认（清数据回默认语义的显式入口）。 */
  static async resetSettings(): Promise<MapsUserSettings> {
    const defaults = this.getDefaultSettings()
    await storageManager.set(STORAGE_KEYS.MAPS_USER_SETTINGS, defaults)
    return defaults
  }

  /** 订阅设置变化（跨上下文经 chrome.storage.onChanged）。返回取消订阅函数。 */
  static onSettingsChanged(callback: SettingsCallback): () => void {
    this.ensureListener()
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  static destroy(): void {
    this.unsubscribe?.()
    this.unsubscribe = null
    this.callbacks.clear()
  }

  /** 惰性建立 storage.onChanged 监听（首个订阅者出现时）。 */
  private static ensureListener(): void {
    if (this.unsubscribe) {
      return
    }
    this.unsubscribe = storageManager.onChanged<StoredMapsUserSettings>(
      STORAGE_KEYS.MAPS_USER_SETTINGS,
      stored => {
        if (!stored) {
          return
        }
        const normalized = normalizeStored(stored)
        for (const callback of this.callbacks) {
          try {
            callback(normalized)
          } catch (error) {
            logger.error('[MapsUserSettings] 设置回调执行失败:', error)
          }
        }
      }
    )
  }
}

/** 归一化：逐字段类型/取值校验，非法或缺失回默认（不做整体拒绝，保用户其余偏好）。 */
function normalizeStored(stored: StoredMapsUserSettings | null): MapsUserSettings {
  const defaults: MapsUserSettings = {
    ...DEFAULT_MAPS_USER_SETTINGS,
    exportFieldHeaders: [...DEFAULT_MAPS_USER_SETTINGS.exportFieldHeaders]
  }
  if (stored === null || typeof stored !== 'object') {
    return defaults
  }

  const options = DEFAULT_MAPS_CONFIG.scrape.scrollIntervalOptionsSec
  return {
    requestIntervalSec:
      typeof stored.requestIntervalSec === 'number' && options.includes(stored.requestIntervalSec)
        ? stored.requestIntervalSec
        : defaults.requestIntervalSec,
    exportFormat:
      typeof stored.exportFormat === 'string' && EXPORT_FORMATS.includes(stored.exportFormat)
        ? stored.exportFormat
        : defaults.exportFormat,
    exportFieldHeaders:
      Array.isArray(stored.exportFieldHeaders) &&
      stored.exportFieldHeaders.every(header => typeof header === 'string')
        ? stored.exportFieldHeaders.filter(header => ALL_EXPORT_HEADERS.includes(header))
        : [...defaults.exportFieldHeaders],
    autoDownload:
      typeof stored.autoDownload === 'boolean' ? stored.autoDownload : defaults.autoDownload,
    autoSaveToGoogleDrive:
      typeof stored.autoSaveToGoogleDrive === 'boolean'
        ? stored.autoSaveToGoogleDrive
        : defaults.autoSaveToGoogleDrive,
    autoSaveToHubspot:
      typeof stored.autoSaveToHubspot === 'boolean'
        ? stored.autoSaveToHubspot
        : defaults.autoSaveToHubspot,
    extractEmail:
      typeof stored.extractEmail === 'boolean' ? stored.extractEmail : defaults.extractEmail,
    extractSocialMedias:
      typeof stored.extractSocialMedias === 'boolean'
        ? stored.extractSocialMedias
        : defaults.extractSocialMedias,
    stuckMaxRetry:
      typeof stored.stuckMaxRetry === 'number' &&
      Number.isInteger(stored.stuckMaxRetry) &&
      stored.stuckMaxRetry >= 0
        ? stored.stuckMaxRetry
        : defaults.stuckMaxRetry
  }
}

/**
 * 提取用户显式设置的间隔：storage 该键存在且为档位内数值才算表达过偏好；
 * 缺失或垃圾值（不在包内档位）都视为未设置，覆盖层跳过。
 */
function extractExplicitIntervalSec(stored: StoredMapsUserSettings | null): number | null {
  const options = DEFAULT_MAPS_CONFIG.scrape.scrollIntervalOptionsSec
  if (
    stored !== null &&
    typeof stored.requestIntervalSec === 'number' &&
    options.includes(stored.requestIntervalSec)
  ) {
    return stored.requestIntervalSec
  }
  return null
}

/** 初始化快照并启动用户覆盖层的持续应用；每 document 至多一次（幂等）。 */
export async function initializeMapsUserSettings(): Promise<void> {
  if (initialized) {
    return
  }
  initialized = true

  const storedSettings = await readStoredSettings()
  settingsSnapshot = {
    settings: normalizeStored(storedSettings),
    explicitRequestIntervalSec: extractExplicitIntervalSec(storedSettings)
  }
  MapsUserSettingsManager.onSettingsChanged(() => {
    // 快照与覆盖层跟随设置变化即时重放（间隔改动无需刷新页面，下一轮滚动生效）
    void refreshSnapshotAndApply()
  })
  applyUserOverridesToLiveConfig()
}

/** 读取设置快照（同步；未初始化时返回默认值）。 */
export function getMapsUserSettingsSnapshot(): MapsUserSettings {
  return settingsSnapshot.settings
}

/** 仅测试用：重置快照与初始化标记，隔离用例间污染。 */
export function resetMapsUserSettingsForTests(): void {
  MapsUserSettingsManager.destroy()
  settingsSnapshot = {
    settings: normalizeStored(null),
    explicitRequestIntervalSec: null
  }
  initialized = false
}

/** 读稀疏存储形状（供快照构建；失败视为无存储）。 */
async function readStoredSettings(): Promise<StoredMapsUserSettings | null> {
  try {
    return await storageManager.get<StoredMapsUserSettings>(STORAGE_KEYS.MAPS_USER_SETTINGS)
  } catch (error) {
    logger.error('[MapsUserSettings] 读取设置失败，按默认值处理:', error)
    return null
  }
}

/** 重建快照（storage 现值）并重放用户覆盖层。 */
async function refreshSnapshotAndApply(): Promise<void> {
  const storedSettings = await readStoredSettings()
  settingsSnapshot = {
    settings: normalizeStored(storedSettings),
    explicitRequestIntervalSec: extractExplicitIntervalSec(storedSettings)
  }
  applyUserOverridesToLiveConfig()
}

/**
 * 应用用户覆盖层到生效配置（用户显式偏好优先于远程配置，见模块头注释）。
 *
 * 仅覆盖 scrape.scrollIntervalSec：它是唯一与用户设置同名的运行参数；
 * 其余 scrape 键（超时/截断/翻页参数等）属服务端治理，用户不可见不覆盖。
 */
export function applyUserOverridesToLiveConfig(): void {
  const explicit = settingsSnapshot.explicitRequestIntervalSec
  if (explicit === null) {
    return
  }

  const { scrape } = getMapsConfig()
  if (scrape.scrollIntervalOptionsSec.includes(explicit)) {
    scrape.scrollIntervalSec = explicit
  } else {
    // 用户值被远程档位排除属于治理口径变化，保留远程值并告警（失败不静默）
    logger.warn(
      `[MapsUserSettings] 用户间隔 ${explicit}s 不在生效档位 ` +
        `[${scrape.scrollIntervalOptionsSec.join(', ')}]s，保留远程值 ${scrape.scrollIntervalSec}s`
    )
  }
}
