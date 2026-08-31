/**
 * Chrome Extension API Mock
 *
 * 用于单元测试和集成测试
 * 提供完整的 Chrome Extension API 模拟
 */

// ============================================================================
// 基础类型定义
// ============================================================================

interface Tab {
  id?: number
  url?: string
  active?: boolean
  currentWindow?: boolean
}

// ============================================================================
// chrome.action API
// ============================================================================

const action = {
  getBadgeText: vi.fn((details: any, callback?: any) => {
    const result = ''
    if (callback) {
      callback(result)
      return
    }
    return Promise.resolve(result)
  }),

  getBadgeBackgroundColor: vi.fn((details: any, callback?: any) => {
    const result = [74, 144, 226, 1] // #4A90E2
    if (callback) {
      callback(result)
      return
    }
    return Promise.resolve(result)
  }),

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

  sendMessage: vi.fn((message: any, callback?: any) => {
    const response = {
      success: true,
      msg: '',
      data: {}
    }

    if (callback) {
      callback(response)
      return
    }

    return Promise.resolve(response)
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
  sendMessage: vi.fn((tabId: number, message: any, callback?: any) => {
    const response = {
      success: true,
      msg: '',
      data: {}
    }

    if (callback) {
      callback(response)
      return
    }

    return Promise.resolve(response)
  }),

  query: vi.fn((queryInfo: any) => {
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

const storageData: Record<string, any> = {}

const storage = {
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn()
  },

  local: {
    get: vi.fn((keys: any, callback?: any) => {
      let result: any = {}

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

    set: vi.fn((items: any, callback?: any) => {
      Object.assign(storageData, items)

      if (callback) {
        callback()
        return
      }

      return Promise.resolve()
    }),

    remove: vi.fn((keys: string | string[], callback?: any) => {
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

    clear: vi.fn((callback?: any) => {
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
// chrome.identity API（013 A10，U9 集成授权）
// ============================================================================

const identity = {
  getAuthToken: vi.fn((details: any, callback?: any) => {
    const result = 'mock-drive-access-token'
    if (callback) {
      callback(result)
      return
    }
    return Promise.resolve(result)
  }),

  launchWebAuthFlow: vi.fn((options: any, callback?: any) => {
    const result = 'https://test-extension-id.chromiumapp.org/?code=mock-auth-code'
    if (callback) {
      callback(result)
      return
    }
    return Promise.resolve(result)
  }),

  removeCachedAuthToken: vi.fn((details: any, callback?: any) => {
    if (callback) {
      callback()
      return
    }
    return Promise.resolve()
  }),

  getRedirectURL: vi.fn((path?: string) => {
    return `https://test-extension-id.chromiumapp.org/${path ?? ''}`
  })
}

// ============================================================================
// 导出 Chrome API
// ============================================================================

export const chrome = {
  action,
  runtime,
  tabs,
  storage,
  downloads,
  identity
}

// 添加类型导出
export type Chrome = typeof chrome
