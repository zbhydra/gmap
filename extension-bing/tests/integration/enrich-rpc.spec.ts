/** 官网补全从 content 编排穿过真实 RPC 解析器到 HTTP 出口并按位置写回。 */

import { expect, it, vi } from 'vitest'
import { BackgroundMessageRouter } from '@/background/services/BackgroundMessageRouter'
import type { JsonValue, RpcResponse, RpcServeResult } from '@/core/rpc/types'
import { parseBingRow } from '@/sites/bing/content/parser'
import { enrichRows } from '@/sites/bing/enrich/enrichClient'

it('只提交官网字段即可经真实 background 解析器访问 HTTP 并按位置写回', async () => {
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
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
    new Response(
      JSON.stringify({
        code: 10000,
        data: {
          results: businesses.map(business => ({
            key: 'facebook.com',
            emails: [],
            medias: { facebook: business.website }
          })),
          partial: false
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  )
  vi.stubGlobal('fetch', fetchMock)
  const router = new BackgroundMessageRouter()
  router.setupListener()
  const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)?.[0]
  if (!listener) throw new Error('真实 background RPC listener 未注册')
  const originalSendMessage = chrome.runtime.sendMessage
  Object.assign(chrome.runtime, {
    sendMessage: vi.fn(
      (message: JsonValue) =>
        new Promise<RpcResponse<RpcServeResult> | undefined>(resolve => {
          const handled = listener(
            message,
            { id: chrome.runtime.id, tab: { id: 1 }, url: 'https://www.bing.com/maps' },
            resolve
          )
          if (!handled) resolve(undefined)
        })
    )
  })
  try {
    const summary = await enrichRows(rows)

    expect(summary).toEqual({ totalTargets: 2, writtenRows: 2, partial: false, ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/client/maps/enrich',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ businesses }) })
    )
    expect(rows.map(row => row.facebook)).toEqual([
      'https://facebook.com/First',
      'https://facebook.com/Second'
    ])
  } finally {
    router.destroy()
    Object.assign(chrome.runtime, { sendMessage: originalSendMessage })
    vi.unstubAllGlobals()
  }
})
