/** 官网补全从 content 编排穿过真实 RPC 解析器到 HTTP 出口并按位置写回。 */

import { expect, it, vi } from 'vitest'
import { BackgroundMessageRouter } from '@/background/services/BackgroundMessageRouter'
import { STORAGE_KEYS } from '@/core/api/config'
import type { JsonValue, RpcResponse, RpcServeResult } from '@/core/rpc/types'
import { parseBingRow } from '@/sites/bing/content/parser'
import { enrichRows } from '@/sites/bing/enrich/enrichClient'

it.each([0, 25_000])('官网响应延迟 %ims 时经真实 RPC 写回补全结果', async delayMs => {
  vi.useFakeTimers()
  const timeoutSpy = vi.spyOn(globalThis, 'setTimeout')
  const rows = ['First', 'Second'].map(name => {
    const item = document.createElement('li')
    item.setAttribute(
      'data-entity',
      JSON.stringify({ entity: { id: name, title: name, website: `https://facebook.com/${name}` } })
    )
    return parseBingRow(item)
  })
  const businesses = rows.map(row => ({
    website: row.website,
    name: row.name,
    address: row.address
  }))
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(
    (_input, init) =>
      new Promise((resolve, reject) => {
        const responseTimer = setTimeout(
          () =>
            resolve(
              new Response(
                JSON.stringify({
                  code: 10000,
                  data: {
                    results: businesses.map(business => ({
                      key: 'facebook.com',
                      emails: [],
                      medias: { facebook: business.website }
                    })),
                    partial: delayMs > 0
                  }
                }),
                { headers: { 'Content-Type': 'application/json' } }
              )
            ),
          delayMs
        )
        init?.signal?.addEventListener(
          'abort',
          () => {
            clearTimeout(responseTimer)
            reject(new DOMException('官网补全请求已中止', 'AbortError'))
          },
          { once: true }
        )
      })
  )
  vi.stubGlobal('fetch', fetchMock)
  await chrome.storage.local.set({ [STORAGE_KEYS.ACCESS_TOKEN]: 'enrich-rpc-token' })
  const router = new BackgroundMessageRouter()
  router.setupListener()
  const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)?.[0]
  if (!listener) throw new Error('真实 background RPC listener 未注册')
  const tab = await chrome.tabs.get(1)
  const originalSendMessage = chrome.runtime.sendMessage
  Object.assign(chrome.runtime, {
    sendMessage: vi.fn(
      (message: JsonValue) =>
        new Promise<RpcResponse<RpcServeResult> | undefined>(resolve => {
          const handled = listener(
            message,
            { id: chrome.runtime.id, tab, url: 'https://www.bing.com/maps' },
            resolve
          )
          if (!Object.is(handled, true)) resolve(undefined)
        })
    )
  })
  try {
    const pending = enrichRows(rows)
    await vi.advanceTimersByTimeAsync(delayMs)
    const summary = await pending

    expect(summary).toEqual({ totalTargets: 2, writtenRows: 2, partial: delayMs > 0, ok: true })
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 28_000)
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 35_000)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/client/maps/enrich',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ businesses }),
        headers: expect.objectContaining({ Authorization: 'Bearer enrich-rpc-token' }),
        signal: expect.objectContaining({ aborted: false })
      })
    )
    expect(rows.map(row => row.facebook)).toEqual([
      'https://facebook.com/First',
      'https://facebook.com/Second'
    ])
  } finally {
    router.destroy()
    await chrome.storage.local.remove(STORAGE_KEYS.ACCESS_TOKEN)
    Object.assign(chrome.runtime, { sendMessage: originalSendMessage })
    vi.clearAllTimers()
    timeoutSpy.mockRestore()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  }
})
