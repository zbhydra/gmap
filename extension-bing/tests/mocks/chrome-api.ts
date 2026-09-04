/**
 * Chrome Extension API Mock
 *
 * 用于单元测试和集成测试
 * 提供完整的 Chrome Extension API 模拟
 */

// ============================================================================
// 基础类型定义
// ============================================================================

import type { StorageValue } from '../../src/core/storage'

interface Tab {
  id?: number
  url?: string
  active?: boolean
  currentWindow?: boolean
}

type StorageData = Record<string, StorageValue | undefined>
type StorageKeys = string | string[] | Record<string, StorageValue> | null

// ============================================================================
// chrome.action API
// ============================================================================

const action = {
  getBadgeText: vi.fn((_details: chrome.action.TabDetails, callback?: (result: string) => void) => {
    const result = ''
    if (callback) {
      callback(result)
      return
    }
    return Promise.resolve(result)
  }),

  getBadgeBackgroundColor: vi.fn(
    (_details: chrome.action.TabDetails, callback?: (result: chrome.action.ColorArray) => void) => {
      const result: chrome.action.ColorArray = [74, 144, 226, 1] // #4A90E2
      if (callback) {
        callback(result)
        return
      }
      return Promise.resolve(result)
    }
  ),

  setBadgeText: vi.fn(),
  setBadgeBackgroundColor: vi.fn(),
  setIcon: vi.fn(),
  setTitle: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn()
}

// ============================================================================
// chrome.runtime API
// ============================================================================

const runtime = {
  id: 'test-extension-id',

  sendMessage: vi.fn((_message: unknown, callback?: (response: unknown) => void) => {
    if (callback) {
      callback(undefined)
      return
    }

    return Promise.resolve(undefined)
  }),

  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn()
  },

  onMessageExternal: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn()
  },

  getURL: vi.fn((path: string) => {
    return `chrome-extension://test-extension-id/${path}`
  }),

  getManifest: vi.fn(() => ({
    manifest_version: 3,
    name: 'Test Extension',
    version: '1.0.0'
  }))
}

// ============================================================================
// chrome.tabs API
// ============================================================================

const tabs = {
  sendMessage: vi.fn(
    (_tabId: number, _message: unknown, callback?: (response: unknown) => void) => {
      if (callback) {
        callback(undefined)
        return
      }

      return Promise.resolve(undefined)
    }
  ),

  query: vi.fn((_queryInfo: chrome.tabs.QueryInfo) => {
    return Promise.resolve([
      {
        id: 1,
        url: 'https://www.google.com/maps',
        active: true,
        currentWindow: true
      }
    ] as Tab[])
  }),

  get: vi.fn((tabId: number) => {
    return Promise.resolve({
      id: tabId,
      url: 'https://www.google.com/maps',
      active: true
    } as Tab)
  }),

  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn()
}

// ============================================================================
// chrome.storage API
// ============================================================================

const storageData: StorageData = {}

const storage = {
  local: {
    get: vi.fn((keys: StorageKeys, callback?: (items: StorageData) => void) => {
      let result: StorageData = {}

      if (keys === null) {
        result = { ...storageData }
      } else if (typeof keys === 'string') {
        result = { [keys]: storageData[keys] }
      } else if (Array.isArray(keys)) {
        for (const key of keys) {
          if (key in storageData) {
            result[key] = storageData[key]
          }
        }
      } else if (typeof keys === 'object') {
        for (const key in keys) {
          if (key in storageData) {
            result[key] = storageData[key]
          } else {
            result[key] = keys[key]
          }
        }
      }

      if (callback) {
        callback(result)
        return
      }

      return Promise.resolve(result)
    }),

    set: vi.fn((items: Record<string, StorageValue>, callback?: () => void) => {
      Object.assign(storageData, items)

      if (callback) {
        callback()
        return
      }

      return Promise.resolve()
    }),

    remove: vi.fn((keys: string | string[], callback?: () => void) => {
      const keysArray = Array.isArray(keys) ? keys : [keys]
      for (const key of keysArray) {
        delete storageData[key]
      }

      if (callback) {
        callback()
        return
      }

      return Promise.resolve()
    }),

    clear: vi.fn((callback?: () => void) => {
      for (const key in storageData) {
        delete storageData[key]
      }

      if (callback) {
        callback()
        return
      }

      return Promise.resolve()
    })
  },

  sync: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn()
  },

  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn()
  },

  session: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn()
  }
}

// ============================================================================
// chrome.downloads API
// ============================================================================

const downloads = {
  download: vi.fn(
    async (_options: chrome.downloads.DownloadOptions): Promise<number> => 1
  ),
  search: vi.fn(
    async (_query: chrome.downloads.DownloadQuery): Promise<chrome.downloads.DownloadItem[]> => []
  ),
  cancel: vi.fn(async (_downloadId: number): Promise<void> => undefined),
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn()
  }
}

// ============================================================================
// 导出 Chrome API
// ============================================================================

export const chrome = {
  action,
  runtime,
  tabs,
  storage,
  downloads
}

// 添加类型导出
export type Chrome = typeof chrome
