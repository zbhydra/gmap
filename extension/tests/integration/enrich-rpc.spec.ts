/** 官网补全从 content 编排穿过真实 RPC 解析器到 HTTP 出口并按位置写回。 */

import { expect, it, vi } from 'vitest'
import { BackgroundMessageRouter } from '@/background/services/BackgroundMessageRouter'
import { ChromeEventEmitter } from '@/core/rpc'
import type { ExtensionEvents } from '@/core/events/types'
import { STORAGE_KEYS } from '@/core/api/config'
import type { JsonValue, RpcResponse, RpcServeResult } from '@/core/rpc/types'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { parsePlaceRow } from '@/sites/maps/content/parser'
import { enrichRows } from '@/sites/maps/enrich/enrichClient'

it('只提交官网字段即可经真实 background 解析器访问 HTTP 并按位置写回', async () => {
  const rows = ['First', 'Second'].map(name => ({
    ...parsePlaceRow([], DEFAULT_MAPS_CONFIG.parseSchema),
    name,
    domain: 'ignored.example',
    website: `https://facebook.com/${name}`
  }))
  const businesses = rows.map(row => ({
    website: row.website,
    name: row.name,
    address: row.fullAddress
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
  await chrome.storage.local.set({ [STORAGE_KEYS.ACCESS_TOKEN]: 'enrich-rpc-token' })
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
            { id: chrome.runtime.id, tab: { id: 1 }, url: 'https://www.google.com/maps' },
            resolve
          )
          if (!handled) resolve(undefined)
        })
    )
  })
  try {
    const summary = await enrichRows(rows, new ChromeEventEmitter<ExtensionEvents>())

    expect(summary).toEqual({ totalTargets: 2, writtenRows: 2, partial: false, ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/client/maps/enrich',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ businesses }),
        headers: expect.objectContaining({ Authorization: 'Bearer enrich-rpc-token' })
      })
    )
    expect(rows.map(row => row.socialMedias)).toEqual([
      'facebook: https://facebook.com/First',
      'facebook: https://facebook.com/Second'
    ])
  } finally {
    router.destroy()
    await chrome.storage.local.remove(STORAGE_KEYS.ACCESS_TOKEN)
    Object.assign(chrome.runtime, { sendMessage: originalSendMessage })
    vi.unstubAllGlobals()
  }
})
