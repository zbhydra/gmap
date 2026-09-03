/**
 * Bing 远程配置通道单测（验收行为直接覆盖）：
 * - 远程稀疏覆盖包内默认值（缺键保留、未知键进入、adapters 整体替换）；
 * - 拉取失败（后端 /api/client/bing/config 未上线的预期场景）静默回退包内
 *   默认值；
 * - background 侧 1 小时时间戳缓存：命中不发 HTTP，过期重新拉取；
 * - 每 document 记忆化：同一 document 至多一次 RPC。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const httpMocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('../../src/core/api', () => ({ httpClient: httpMocks }))

import { DEFAULT_BING_CONFIG } from '../../src/sites/bing/config/contract'
import {
  getBingConfig,
  loadBingConfig,
  resetBingConfigForTests
} from '../../src/sites/bing/config/loader'
import { STORAGE_KEYS } from '../../src/core/api/config'
import { fetchBingRemoteConfig } from '../../src/sites/bing/config/remoteFetch'

type StorageData = Record<string, unknown>

const storageData: StorageData = {}

/** 重置进程内 storage 假实现。 */
function resetStorage(): void {
  for (const key of Object.keys(storageData)) {
    delete storageData[key]
  }

  // Object.assign 覆盖 mock：chrome.storage.local.get 是多重载签名，
  // 直接 as 断言会被 TS 判为不充分重叠，这里绕开协变检查且不引入 any
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
    })
  })

  Object.assign(chrome.storage.local, {
    set: vi.fn((items: Record<string, unknown>) => {
      Object.assign(storageData, items)
      return Promise.resolve()
    })
  })
}

/** 伪造 background RPC：getBingConfig 返回给定载荷，其余方法视为用例错误。 */
function stubRpcGetBingConfig(payload: unknown, mode: 'resolve' | 'reject' = 'resolve'): void {
  chrome.runtime.sendMessage = vi.fn(async (request: { method?: string }) => {
    if (request.method !== 'getBingConfig') {
      throw new Error(`测试用例未预期的 RPC 方法: ${String(request.method)}`)
    }
    if (mode === 'reject') {
      return { id: 'rpc-test', success: false, code: 'SERVER_ERROR', error: 'upstream failed' }
    }
    return { id: 'rpc-test', success: true, data: payload }
  }) as typeof chrome.runtime.sendMessage
}

/** 读取 RPC 调用次数。 */
function rpcCallCount(): number {
  return (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mock.calls.length
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-30T12:00:00Z'))
  resetStorage()
  httpMocks.get.mockReset()
  resetBingConfigForTests()
})

afterEach(() => {
  vi.useRealTimers()
  resetBingConfigForTests()
})

describe('Bing 远程配置通道', () => {
  it('远程稀疏覆盖默认值：缺键保留包内值，未知键原样进入，adapters 整体替换', async () => {
    stubRpcGetBingConfig({
      adapters: [
        {
          name: 'new',
          priority: 1,
          detectors: ['.rebuilt-root'],
          fallbackDetectors: [],
          selectors: {
            listContainer: ['.rebuilt-list'],
            listItems: ['[data-entity]'],
            listItemsAlt: [],
            scrollContainer: ['.rebuilt-list'],
            searchAreaButton: [],
            loadingIndicator: ['.rebuilt-loading'],
            openHours: ['.opHours'],
            paginationButton: [],
            infiniteScroll: true
          }
        }
      ],
      parse: { dataEntityAttr: 'data-entity-v2', brandNewFlag: true },
      scrape: { detectPollMs: 800 },
      panel: { dockTopPx: 60 }
    })

    await loadBingConfig()

    const config = getBingConfig()
    // adapters 数组整体替换，不做按下标合并
    expect(config.adapters).toHaveLength(1)
    expect(config.adapters[0]?.detectors).toEqual(['.rebuilt-root'])
    expect(config.adapters[0]?.selectors.listItems).toEqual(['[data-entity]'])
    // 组内稀疏覆盖：缺键保留包内默认，未知键原样进入
    expect(config.parse.dataEntityAttr).toBe('data-entity-v2')
    expect(config.parse.brandNewFlag).toBe(true)
    expect(config.parse.dedupeKey).toBe(DEFAULT_BING_CONFIG.parse.dedupeKey)
    expect(config.scrape.detectPollMs).toBe(800)
    expect(config.scrape.maxConsecutiveFailures).toBe(DEFAULT_BING_CONFIG.scrape.maxConsecutiveFailures)
    expect(config.panel.dockTopPx).toBe(60)
    // 默认值本体不被覆盖污染
    expect(DEFAULT_BING_CONFIG.adapters).toHaveLength(2)
    expect(DEFAULT_BING_CONFIG.parse.dataEntityAttr).toBe('data-entity')
    expect(chrome.storage.local.get).not.toHaveBeenCalled()
    expect(chrome.storage.local.set).not.toHaveBeenCalled()
  })

  it('拉取失败（后端端点未上线）静默回退包内默认值', async () => {
    stubRpcGetBingConfig({}, 'reject')

    await loadBingConfig()

    const config = getBingConfig()
    expect(config.parse.dataEntityAttr).toBe(DEFAULT_BING_CONFIG.parse.dataEntityAttr)
    expect(config.scrape.loopIntervalMs).toBe(DEFAULT_BING_CONFIG.scrape.loopIntervalMs)
    expect(config.scrape.freeRowLimit).toBe(DEFAULT_BING_CONFIG.scrape.freeRowLimit)
    expect(config.adapters).toEqual(DEFAULT_BING_CONFIG.adapters)
    expect(config.adapters).not.toBe(DEFAULT_BING_CONFIG.adapters)
  })

  it('background 在 1 小时内命中缓存不发 HTTP，过期后重新拉取', async () => {
    httpMocks.get.mockResolvedValueOnce({ scrape: { loopIntervalMs: 600 } })
    await fetchBingRemoteConfig()
    expect(httpMocks.get).toHaveBeenCalledTimes(1)

    vi.setSystemTime(new Date('2026-08-30T12:30:00Z'))
    expect(await fetchBingRemoteConfig()).toEqual({ scrape: { loopIntervalMs: 600 } })
    expect(httpMocks.get).toHaveBeenCalledTimes(1)

    vi.setSystemTime(new Date('2026-08-30T13:00:01Z'))
    httpMocks.get.mockResolvedValueOnce({ scrape: { loopIntervalMs: 700 } })
    expect(await fetchBingRemoteConfig()).toEqual({ scrape: { loopIntervalMs: 700 } })
    expect(httpMocks.get).toHaveBeenCalledTimes(2)
  })

  it('background 忽略数组形状的损坏缓存并重新拉取', async () => {
    storageData[STORAGE_KEYS.BING_REMOTE_CONFIG] = { fetchedAt: Date.now(), override: [] }
    httpMocks.get.mockResolvedValueOnce({ scrape: { loopIntervalMs: 650 } })

    expect(await fetchBingRemoteConfig()).toEqual({ scrape: { loopIntervalMs: 650 } })
    expect(httpMocks.get).toHaveBeenCalledTimes(1)
  })

  it('配置克隆与远程覆盖后，选择器嵌套数组不与默认值/载荷共享引用', async () => {
    // 默认值克隆路径：未覆盖前嵌套数组即不与 DEFAULT_BING_CONFIG 共享引用
    expect(getBingConfig().adapters[0]?.detectors).not.toBe(
      DEFAULT_BING_CONFIG.adapters[0]?.detectors
    )
    expect(getBingConfig().adapters[0]?.selectors.listItems).not.toBe(
      DEFAULT_BING_CONFIG.adapters[0]?.selectors.listItems
    )
    expect(getBingConfig().adapters[1]?.selectors.searchAreaButton).not.toBe(
      DEFAULT_BING_CONFIG.adapters[1]?.selectors.searchAreaButton
    )

    // 远程整体替换路径：应用后也不与载荷对象共享引用
    const overrideAdapters = [
      {
        name: 'new',
        priority: 1,
        detectors: ['.rebuilt-root'],
        fallbackDetectors: [],
        selectors: {
          listContainer: ['.rebuilt-list'],
          listItems: ['[data-entity]'],
          listItemsAlt: [],
          scrollContainer: [],
          searchAreaButton: [],
          loadingIndicator: ['.rebuilt-loading'],
          openHours: ['.opHours'],
          paginationButton: [],
          infiniteScroll: true
        }
      }
    ]
    stubRpcGetBingConfig({ adapters: overrideAdapters })
    await loadBingConfig()

    expect(getBingConfig().adapters[0]?.detectors).not.toBe(overrideAdapters[0]?.detectors)
    expect(getBingConfig().adapters[0]?.selectors.listContainer).not.toBe(
      overrideAdapters[0]?.selectors.listContainer
    )
  })

  it('每 document 记忆化：同一 document 并发与后续调用只发一次 RPC', async () => {
    stubRpcGetBingConfig({ panel: { dockRightPx: 24 } })

    await Promise.all([loadBingConfig(), loadBingConfig()])
    await loadBingConfig()

    expect(rpcCallCount()).toBe(1)
    expect(getBingConfig().panel.dockRightPx).toBe(24)
  })
})
