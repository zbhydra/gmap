/**
 * Maps 用户设置单元测试（013 A9，U6 验收行为直接覆盖）：
 * - 默认值与默认回退（storage 缺失 / 形状非法 / 部分字段非法）；
 * - 读写 roundtrip 与清数据回默认；
 * - 用户覆盖层优先于远程配置（含档位校验回退）。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_MAPS_CONFIG } from '../../src/sites/maps/config/contract'
import {
  getMapsConfig,
  loadMapsConfig,
  resetMapsConfigForTests
} from '../../src/sites/maps/config/loader'
import { STORAGE_KEYS } from '../../src/core/api/config'
import { SEARCH_EXPORT_COLUMNS } from '../../src/sites/maps/content/export/columns'
import {
  DEFAULT_MAPS_USER_SETTINGS,
  MapsUserSettingsManager,
  getMapsUserSettingsSnapshot,
  initializeMapsUserSettings,
  resetMapsUserSettingsForTests
} from '../../src/sites/maps/settings/userSettings'

type StorageData = Record<string, unknown>

const storageData: StorageData = {}

/** 重置进程内 storage 假实现（与 maps-remote-config.spec 同构）。 */
function resetStorage(): void {
  for (const key of Object.keys(storageData)) {
    delete storageData[key]
  }

  Object.assign(chrome.storage.local, {
    get: vi.fn((keys: string | string[] | Record<string, unknown> | null) => {
      const result: Record<string, unknown> = {}
      if (keys === null) {
        Object.assign(result, storageData)
      } else if (typeof keys === 'string') {
        result[keys] = storageData[keys]
      } else if (Array.isArray(keys)) {
        for (const key of keys) {
          result[key] = storageData[key]
        }
      } else {
        for (const key of Object.keys(keys)) {
          result[key] = key in storageData ? storageData[key] : keys[key]
        }
      }
      return Promise.resolve(result)
    }),
    set: vi.fn((items: Record<string, unknown>) => {
      Object.assign(storageData, items)
      return Promise.resolve()
    })
  })
}

/** 伪造 background RPC：getMapsConfig 返回给定稀疏覆盖。 */
function stubRpcGetMapsConfig(payload: unknown): void {
  chrome.runtime.sendMessage = vi.fn(async () => ({
    id: 'rpc-test',
    success: true,
    data: payload
  })) as typeof chrome.runtime.sendMessage
}

type StorageListener = (changes: Record<string, { newValue?: unknown }>, area: string) => void

/** 已注册的 chrome.storage.onChanged 监听器（从全局 mock 的 addListener 调用记录提取）。 */
function storageChangeListeners(): StorageListener[] {
  return (chrome.storage.onChanged.addListener as ReturnType<typeof vi.fn>).mock.calls.map(
    call => call[0] as StorageListener
  )
}

/** 模拟 chrome.storage.onChanged 触发（storageManager 的监听签名）。 */
function emitStorageChanged(key: string, newValue: unknown): void {
  for (const listener of storageChangeListeners()) {
    listener({ [key]: { newValue } }, 'local')
  }
}

beforeEach(() => {
  resetStorage()
  resetMapsConfigForTests()
  resetMapsUserSettingsForTests()
})

afterEach(() => {
  resetMapsConfigForTests()
  resetMapsUserSettingsForTests()
})

describe('Maps 用户设置（默认值与回退）', () => {
  it('无存储时返回编译期默认值（间隔 8 / csv / 36 列全选 / 开关全关 / 重试 1）', async () => {
    const settings = await MapsUserSettingsManager.getSettings()

    expect(settings).toEqual({
      requestIntervalSec: 8,
      exportFormat: 'csv',
      exportFieldHeaders: SEARCH_EXPORT_COLUMNS.map(column => column.header),
      autoDownload: false,
      autoSaveToGoogleDrive: false,
      autoSaveToHubspot: false,
      extractEmail: false,
      extractSocialMedias: false,
      stuckMaxRetry: 1
    })
    expect(DEFAULT_MAPS_USER_SETTINGS.exportFieldHeaders).toHaveLength(36)
  })

  it('读写 roundtrip：更新字段落 storage 且其余字段保持', async () => {
    await MapsUserSettingsManager.updateSettings({
      requestIntervalSec: 5,
      exportFormat: 'xlsx',
      autoDownload: true
    })

    const settings = await MapsUserSettingsManager.getSettings()
    expect(settings.requestIntervalSec).toBe(5)
    expect(settings.exportFormat).toBe('xlsx')
    expect(settings.autoDownload).toBe(true)
    expect(settings.exportFieldHeaders).toHaveLength(36)
    expect(settings.stuckMaxRetry).toBe(1)
    expect(storageData[STORAGE_KEYS.MAPS_USER_SETTINGS]).toBeDefined()
  })

  it('默认回退：间隔不在档位、格式非法、字段表非数组、重试为负各自回默认', async () => {
    storageData[STORAGE_KEYS.MAPS_USER_SETTINGS] = {
      requestIntervalSec: 7,
      exportFormat: 'yaml',
      exportFieldHeaders: 'Name,Cid',
      autoDownload: 'yes',
      stuckMaxRetry: -3
    }

    const settings = await MapsUserSettingsManager.getSettings()

    expect(settings.requestIntervalSec).toBe(8)
    expect(settings.exportFormat).toBe('csv')
    expect(settings.exportFieldHeaders).toEqual(
      SEARCH_EXPORT_COLUMNS.map(column => column.header)
    )
    expect(settings.autoDownload).toBe(false)
    expect(settings.stuckMaxRetry).toBe(1)
  })

  it('默认回退：部分字段缺失只补默认，已合法字段保留', async () => {
    storageData[STORAGE_KEYS.MAPS_USER_SETTINGS] = {
      requestIntervalSec: 10,
      stuckMaxRetry: 3
    }

    const settings = await MapsUserSettingsManager.getSettings()

    expect(settings.requestIntervalSec).toBe(10)
    expect(settings.stuckMaxRetry).toBe(3)
    expect(settings.exportFormat).toBe('csv')
    expect(settings.autoDownload).toBe(false)
  })

  it('勾选清洗：未知列名剔除，已知列保留', async () => {
    storageData[STORAGE_KEYS.MAPS_USER_SETTINGS] = {
      exportFieldHeaders: ['Name', 'Cid', 'Not A Column']
    }

    const settings = await MapsUserSettingsManager.getSettings()
    expect(settings.exportFieldHeaders).toEqual(['Name', 'Cid'])
  })

  it('resetSettings 显式回默认（清数据回默认语义）', async () => {
    await MapsUserSettingsManager.updateSettings({ requestIntervalSec: 5, autoDownload: true })
    await MapsUserSettingsManager.resetSettings()

    const settings = await MapsUserSettingsManager.getSettings()
    expect(settings.requestIntervalSec).toBe(8)
    expect(settings.autoDownload).toBe(false)
  })
})

describe('用户覆盖层（用户显式偏好优先于远程配置）', () => {
  it('用户未设置间隔时不覆盖远程值（远程治理不被默认值顶掉）', async () => {
    // 远程（e2e mock 同形态）把间隔治理为 1s；用户层无显式偏好
    stubRpcGetMapsConfig({ scrape: { scrollIntervalSec: 1 } })
    await loadMapsConfig()
    await initializeMapsUserSettings()

    expect(getMapsUserSettingsSnapshot().requestIntervalSec).toBe(8)
    expect(getMapsConfig().scrape.scrollIntervalSec).toBe(1)
  })

  it('远程覆盖之后应用用户显式间隔：远程 1s 被用户 5s 覆盖', async () => {
    stubRpcGetMapsConfig({ scrape: { scrollIntervalSec: 1 } })
    await loadMapsConfig()
    expect(getMapsConfig().scrape.scrollIntervalSec).toBe(1)

    await MapsUserSettingsManager.updateSettings({ requestIntervalSec: 5 })
    await initializeMapsUserSettings()

    // 用户设置优先：生效间隔 = 用户值
    expect(getMapsConfig().scrape.scrollIntervalSec).toBe(5)
    expect(getMapsUserSettingsSnapshot().requestIntervalSec).toBe(5)
  })

  it('用户间隔不在远程生效档位时保留远程值（治理收紧优先）', async () => {
    stubRpcGetMapsConfig({
      scrape: { scrollIntervalSec: 6, scrollIntervalOptionsSec: [6, 8] }
    })
    await loadMapsConfig()

    await MapsUserSettingsManager.updateSettings({ requestIntervalSec: 5 })
    await initializeMapsUserSettings()

    expect(getMapsUserSettingsSnapshot().requestIntervalSec).toBe(5)
    expect(getMapsConfig().scrape.scrollIntervalSec).toBe(6)
  })

  it('设置变化监听即时更新快照与覆盖层（无需重新初始化）', async () => {
    stubRpcGetMapsConfig({ scrape: { scrollIntervalSec: 1 } })
    await loadMapsConfig()
    await initializeMapsUserSettings()
    expect(getMapsConfig().scrape.scrollIntervalSec).toBe(1)

    // 更新设置（落盘）后模拟 chrome.storage.onChanged 触发
    await MapsUserSettingsManager.updateSettings({ requestIntervalSec: 9 })
    emitStorageChanged(STORAGE_KEYS.MAPS_USER_SETTINGS, storageData[STORAGE_KEYS.MAPS_USER_SETTINGS])
    await vi.waitFor(() => {
      expect(getMapsUserSettingsSnapshot().requestIntervalSec).toBe(9)
      expect(getMapsConfig().scrape.scrollIntervalSec).toBe(9)
    })
  })

  it('远程未覆盖间隔时保持包内默认值语义', async () => {
    stubRpcGetMapsConfig({})
    await loadMapsConfig()
    await initializeMapsUserSettings()

    expect(getMapsConfig().scrape.scrollIntervalSec).toBe(
      DEFAULT_MAPS_CONFIG.scrape.scrollIntervalSec
    )
  })
})
