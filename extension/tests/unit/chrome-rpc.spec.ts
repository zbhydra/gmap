/** Chrome RPC 的调用方权限、响应与 payload 边界。 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { serve } from '@/core/rpc/serve'
import type {
  JsonObject,
  RpcResponse,
  RpcServeRegistration,
  RpcServeResult,
  ServeOptions
} from '@/core/rpc/types'

const options: ServeOptions = {
  methodTargets: { ping: ['popup'] },
  requestLimits: { ping: 1024 },
  responseLimits: { ping: 1024 }
}

let registration: RpcServeRegistration | undefined

afterEach(() => {
  registration?.stop()
  registration = undefined
  vi.restoreAllMocks()
})

describe('Chrome RPC', () => {
  it('按浏览器 sender 推导调用方并返回 handler 结果，停止后移除监听', async () => {
    const handler = vi.fn(() => ({ ok: true }))
    registration = serve('background', { ping: handler }, options)

    await expect(request()).resolves.toEqual({ id: 'request-1', success: true, data: { ok: true } })
    expect(handler).toHaveBeenCalledWith(undefined, {
      caller: 'popup',
      tabId: undefined,
      frameId: undefined,
      origin: `chrome-extension://${chrome.runtime.id}/popup.html`,
      senderUrl: `chrome-extension://${chrome.runtime.id}/popup.html`
    })

    registration.stop()
    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(
      vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)?.[0]
    )
    registration = undefined
  })

  it('请求中伪造 caller 不能越过方法权限', async () => {
    const handler = vi.fn(() => ({ ok: true }))
    registration = serve('background', { ping: handler }, {
      ...options,
      methodTargets: { ping: ['content'] }
    })

    await expect(request({ caller: 'content' })).resolves.toMatchObject({
      success: false,
      code: 'UNAUTHORIZED'
    })
    expect(handler).not.toHaveBeenCalled()
  })

  it.each(['src/popup.html', 'src/dashboard.html'])('Firefox 本扩展页面 %s 可调用受限方法', async page => {
    const extensionRoot = 'moz-extension://b05c14e3-84fc-45b6-b939-79ce900a8529/'
    vi.spyOn(chrome.runtime, 'getURL').mockImplementation(path => `${extensionRoot}${path}`)
    const handler = vi.fn(() => ({ ok: true }))
    registration = serve('background', { ping: handler }, options)

    await expect(request({}, { id: chrome.runtime.id, url: chrome.runtime.getURL(page) })).resolves.toMatchObject({
      success: true,
      data: { ok: true }
    })
    expect(handler).toHaveBeenCalledWith(undefined, expect.objectContaining({ caller: 'popup' }))
  })

  it.each(['https://www.google.com/maps', 'moz-extension://another-extension/src/popup.html'])(
    'Firefox 中非本扩展页面 %s 不能伪造 popup 权限',
    async url => {
      vi.spyOn(chrome.runtime, 'getURL').mockImplementation(path => `moz-extension://own-extension/${path}`)
      const handler = vi.fn(() => ({ ok: true }))
      registration = serve('background', { ping: handler }, options)

      await expect(request({ caller: 'popup' }, { id: chrome.runtime.id, url })).resolves.toMatchObject({
        success: false,
        code: 'UNAUTHORIZED'
      })
      expect(handler).not.toHaveBeenCalled()
    }
  )

  it('拒绝 handler 原型上的方法', async () => {
    registration = serve('background', { ping: () => ({ ok: true }) }, options)

    await expect(request({ method: 'toString' })).resolves.toMatchObject({
      success: false,
      code: 'METHOD_NOT_FOUND'
    })
  })

  it.each(['request', 'response'] as const)('%s payload 超限返回协议错误', async direction => {
    const handler = vi.fn(() => '123456789')
    registration = serve('background', { ping: handler }, {
      ...options,
      [direction === 'request' ? 'requestLimits' : 'responseLimits']: { ping: 8 }
    })

    await expect(request({ params: '123456789' })).resolves.toMatchObject({
      success: false,
      code: 'PAYLOAD_TOO_LARGE'
    })
    expect(handler).toHaveBeenCalledTimes(direction === 'request' ? 0 : 1)
  })

  it('保留 Chrome handler 错误详情并记录原始异常', async () => {
    const error = new Error('[BackgroundHandler] ping 执行失败')
    registration = serve('background', { ping: () => { throw error } }, options)

    await expect(request()).resolves.toEqual({
      id: 'request-1',
      success: false,
      code: 'SERVER_ERROR',
      error: error.message
    })
    expect(console.error).toHaveBeenCalledWith(error)
  })
})

function request(
  overrides: JsonObject = {},
  sender: chrome.runtime.MessageSender = {
    id: chrome.runtime.id,
    url: chrome.runtime.getURL('popup.html')
  }
): Promise<RpcResponse<RpcServeResult>> {
  const listener = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls.at(-1)?.[0]
  if (!listener) throw new Error('Chrome RPC listener 未注册')

  return new Promise(resolve => {
    expect(listener(
      { protocolVersion: 2, id: 'request-1', channel: 'background', method: 'ping', ...overrides },
      sender,
      resolve
    )).toBe(true)
  })
}
