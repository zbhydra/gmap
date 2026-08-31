/**
 * Maps 远程配置通道单测（验收行为直接覆盖）：
 * - 远程稀疏覆盖包内默认值（缺键保留、未知键进入）；
 * - 拉取失败静默回退包内默认值且不写缓存；
 * - 1 小时时间戳缓存：命中不发请求，过期重新拉取；
 * - 每 document 记忆化：同一 document 至多一次 RPC。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_MAPS_CONFIG } from '../../src/sites/maps/config/contract'
import {
  getMapsConfig,
  loadMapsConfig,
  resetMapsConfigForTests
} from '../../src/sites/maps/config/loader'
import { STORAGE_KEYS } from '../../src/core/api/config'

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

/** 伪造 background RPC：getMapsConfig 返回给定载荷，其余方法视为用例错误。 */
function stubRpcGetMapsConfig(payload: unknown, mode: 'resolve' | 'reject' = 'resolve'): void {
  chrome.runtime.sendMessage = vi.fn(async (request: { method?: string }) => {
    if (request.method !== 'getMapsConfig') {
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
  resetMapsConfigForTests()
})

afterEach(() => {
  vi.useRealTimers()
  resetMapsConfigForTests()
})

describe('Maps 远程配置通道', () => {
  it('远程稀疏覆盖默认值：缺键保留包内值，未知键原样进入', async () => {
    stubRpcGetMapsConfig({
      dom: { searchInput: 'div[role=search] input.new', brandNewSelector: 'div.new-node' },
      scrape: { scrollIntervalSec: 5 }
    })

    await loadMapsConfig()

    const config = getMapsConfig()
    expect(config.dom.searchInput).toBe('div[role=search] input.new')
    expect(config.dom.brandNewSelector).toBe('div.new-node')
    expect(config.scrape.scrollIntervalSec).toBe(5)
    // 未覆盖的键保留包内默认
    expect(config.dom.feed).toBe(DEFAULT_MAPS_CONFIG.dom.feed)
    expect(config.parseSchema.fields.name).toEqual(DEFAULT_MAPS_CONFIG.parseSchema.fields.name)
    // 默认值本体不被覆盖污染
    expect(DEFAULT_MAPS_CONFIG.dom.searchInput).toBe('div[role=search] input[name=q]')
    // 成功拉取后写时间戳缓存
    expect(storageData[STORAGE_KEYS.MAPS_REMOTE_CONFIG]).toMatchObject({
      fetchedAt: Date.now()
    })
  })

  it('拉取失败静默回退包内默认值，且不写缓存', async () => {
    stubRpcGetMapsConfig({}, 'reject')

    await loadMapsConfig()

    const config = getMapsConfig()
    expect(config.dom.searchInput).toBe(DEFAULT_MAPS_CONFIG.dom.searchInput)
    expect(config.scrape.scrollIntervalSec).toBe(DEFAULT_MAPS_CONFIG.scrape.scrollIntervalSec)
    expect(config.scrape.scrollIntervalOptionsSec).toEqual(
      DEFAULT_MAPS_CONFIG.scrape.scrollIntervalOptionsSec
    )
    expect(storageData[STORAGE_KEYS.MAPS_REMOTE_CONFIG]).toBeUndefined()
  })

  it('1 小时内命中缓存不再发请求，过期后重新拉取', async () => {
    stubRpcGetMapsConfig({ scrape: { scrollIntervalSec: 6 } })
    await loadMapsConfig()
    expect(rpcCallCount()).toBe(1)

    // 模拟新 document：仅重置记忆化，storage 缓存仍在
    resetMapsConfigForTests()
    vi.setSystemTime(new Date('2026-08-30T12:30:00Z'))
    await loadMapsConfig()
    expect(rpcCallCount()).toBe(1)
    expect(getMapsConfig().scrape.scrollIntervalSec).toBe(6)

    // 超过 1 小时后重新拉取，应用新载荷（stub 换新 mock，计数为新 mock 的调用数）
    resetMapsConfigForTests()
    vi.setSystemTime(new Date('2026-08-30T13:00:01Z'))
    stubRpcGetMapsConfig({ scrape: { scrollIntervalSec: 9 } })
    await loadMapsConfig()
    expect(rpcCallCount()).toBe(1)
    expect(getMapsConfig().scrape.scrollIntervalSec).toBe(9)
  })

  it('每 document 记忆化：同一 document 并发与后续调用只发一次 RPC', async () => {
    stubRpcGetMapsConfig({ dom: { feed: 'div[role=feed].cached' } })

    await Promise.all([loadMapsConfig(), loadMapsConfig()])
    await loadMapsConfig()

    expect(rpcCallCount()).toBe(1)
    expect(getMapsConfig().dom.feed).toBe('div[role=feed].cached')
  })
})
