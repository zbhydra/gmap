/**
 * InstallMarkReporter 单测（直接覆盖 U1 验收行为）：
 * 1. onInstalled 双报：SLS 分析通道与后端 mark 通道各执行一次；
 * 2. 单路失败不阻断另一路；
 * 3. device_id 初始化失败时两路仍继续且不抛出。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** 一次 fetch 调用的记录。 */
interface FetchCallLog {
  url: string
  init: RequestInit | undefined
}

/**
 * 伪造全局 fetch：SLS 与后端 mark 通道统一走 fetch，按 URL 区分两路；
 * 默认全部成功（后端信封 code=10000），rejectSls 时 SLS 路抛网络错误。
 */
function stubFetch(options: { rejectSls?: boolean } = {}): FetchCallLog[] {
  const calls: FetchCallLog[] = []

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      calls.push({ url, init })

      if (options.rejectSls && url.includes('/logstores/')) {
        throw new Error('[InstallMarkReporterSpec] 模拟 SLS 不可达')
      }

      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ code: 10000, data: { recorded: true }, msg: 'success' })
      }
    })
  )

  return calls
}

/** 按 URL 拆分两路调用。 */
function splitLegs(calls: FetchCallLog[]): { sls: FetchCallLog[]; backend: FetchCallLog[] } {
  return {
    sls: calls.filter(call => call.url.includes('/logstores/')),
    backend: calls.filter(call => call.url.includes('/api/client/mark/record'))
  }
}

beforeEach(() => {
  // unstubAllGlobals 会清掉 setup.ts 的构建期全局量，动态 import 前需补齐
  // （与 mark-sls.spec.ts 的 stubRuntimeGlobals 同款做法）。
  vi.stubGlobal('__API_BASE_URL__', 'https://api.example.com')
  vi.stubGlobal('__DEV__', false)
  vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://www.example.com')
  vi.stubGlobal('__ALI_SLS_MARK_CONFIG__', {
    enabled: true,
    endpoint: 'https://gmaps.ap-southeast-1.log.aliyuncs.com',
    logstore: 'gmaps-mark-log',
    topic: 'mark-log',
    source: 'extension'
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('InstallMarkReporter install 双报', () => {
  it('双报都执行：SLS 与后端 mark 通道各调用一次', async () => {
    const calls = stubFetch()
    const { reportInstallMark } = await import('../../src/background/services/InstallMarkReporter')
    const ensureDeviceId = vi.fn().mockResolvedValue(undefined)

    await reportInstallMark('install', ensureDeviceId)

    const { sls, backend } = splitLegs(calls)
    expect(sls).toHaveLength(1)
    expect(backend).toHaveLength(1)
    expect(new URL(sls[0].url).searchParams.get('mark_type')).toBe('install')
    expect(backend[0].init?.method).toBe('POST')
  })

  it('SLS 路失败不阻断后端 mark 通道', async () => {
    const calls = stubFetch({ rejectSls: true })
    const { reportInstallMark } = await import('../../src/background/services/InstallMarkReporter')
    const ensureDeviceId = vi.fn().mockResolvedValue(undefined)

    await expect(reportInstallMark('install', ensureDeviceId)).resolves.toBeUndefined()

    const { sls, backend } = splitLegs(calls)
    expect(sls).toHaveLength(1)
    expect(backend).toHaveLength(1)
  })

  it('device_id 初始化失败时两路仍继续且不抛出', async () => {
    const calls = stubFetch()
    const { reportInstallMark } = await import('../../src/background/services/InstallMarkReporter')
    const ensureDeviceId = vi.fn().mockRejectedValue(new Error('device init failed'))

    await expect(reportInstallMark('install', ensureDeviceId)).resolves.toBeUndefined()

    const { sls, backend } = splitLegs(calls)
    expect(sls).toHaveLength(1)
    expect(backend).toHaveLength(1)
  })
})
