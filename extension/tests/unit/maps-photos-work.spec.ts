import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearPhotosWorkIntent, photosWorkPage } from '@/background/photosWorkPage'
import type { JsonValue, RpcContext, RpcResponse } from '@/core/rpc/types'
import { serve } from '@/core/rpc/serve'

const source: RpcContext = {
  transport: 'chrome', caller: 'content', tabId: 1,
  senderUrl: 'https://www.google.com/maps/place/Gold'
}
const target: RpcContext = {
  transport: 'chrome', caller: 'content', tabId: 2,
  senderUrl: 'https://www.google.com.hk/search?q=Gold#lkt=LocalPoiPhotos'
}
const fid = '0x89c2597ca044ec9b:0xa0acdb1716592b4d'

afterEach(() => clearPhotosWorkIntent(2))

describe('照片跨跳转采集意图', () => {
  it('来源地点页明确打开后，只有目标图库可领取一次；关闭未领取页会清理', async () => {
    vi.mocked(chrome.tabs.get).mockImplementation(() => {
      throw new Error('本功能不具备读取 Tab.url 的权限')
    })
    vi.mocked(chrome.tabs.create).mockResolvedValue({ id: 2 } as chrome.tabs.Tab)
    vi.mocked(chrome.tabs.update).mockResolvedValue({ id: 2 } as chrome.tabs.Tab)
    const registration = serve('background', { photosWorkPage }, {
      transports: ['chrome'],
      methodTargets: { photosWorkPage: ['content'] },
      methodTransports: { photosWorkPage: ['chrome'] },
      requestLimits: { photosWorkPage: 1024 },
      responseLimits: { photosWorkPage: 1024 }
    })
    try {
      const calls = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls
      const listener = calls[calls.length - 1]?.[0]
      if (!listener) throw new Error('Chrome RPC listener 未注册')
      const respond = vi.fn<(response: RpcResponse<JsonValue>) => void>()
      listener({
        protocolVersion: 2, id: 'photo-open', channel: 'background', method: 'photosWorkPage',
        params: { action: 'open', fid }
      }, {
        url: source.senderUrl, origin: 'https://www.google.com', tab: { id: 1 } as chrome.tabs.Tab
      }, respond)
      await vi.waitFor(() => expect(respond).toHaveBeenCalledWith({
        id: 'photo-open', success: true, data: { opened: true, fid: null }
      }))
    } finally {
      registration.stop()
    }
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'about:blank', active: true })
    expect(chrome.tabs.update).toHaveBeenCalledWith(2, { url: expect.stringContaining('/maps/uv?pb=') })

    await expect(photosWorkPage({ action: 'claim', tabId: 2 }, { ...target, tabId: 3 })).resolves.toEqual({ opened: false, fid: null })
    await expect(photosWorkPage({ action: 'claim' }, target)).resolves.toEqual({ opened: false, fid })
    await expect(photosWorkPage({ action: 'claim' }, target)).resolves.toEqual({ opened: false, fid: null })

    await photosWorkPage({ action: 'open', fid }, source)
    clearPhotosWorkIntent(2)
    await expect(photosWorkPage({ action: 'claim' }, target)).resolves.toEqual({ opened: false, fid: null })
    expect(chrome.tabs.get).not.toHaveBeenCalled()
  })

  it('普通搜索页不能发起或领取意图，调用方不能传目标 tabId', async () => {
    const search = { ...source, senderUrl: 'https://www.google.com/search?q=Gold' }
    await expect(photosWorkPage({ action: 'open', fid }, search)).rejects.toThrow('地点页')
    await expect(photosWorkPage({ action: 'claim', tabId: 2 }, search)).rejects.toThrow('照片图库')
    await expect(photosWorkPage({ action: 'claim' }, { transport: 'chrome', caller: 'content' })).rejects.toThrow('可信来源标签页')
  })
})
