import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RpcContext, RpcServeHandlers } from '../../src/core/rpc/types'
import type { ExternalBridgeResponse } from '../../src/core/api/auth/websiteOrigin'

/** externally_connectable 消息的 sender 白名单校验形态。 */
interface ExternalSender {
  origin?: string
  tab?: { id: number }
}

/** onMessageExternal listener 签名。 */
type ExternalListener = (
  message: unknown,
  sender: ExternalSender,
  sendResponse: (response: ExternalBridgeResponse) => void
) => boolean

const mocks = vi.hoisted(() => ({
  handlers: null as RpcServeHandlers | null,
  exchangeWebsiteTokenForExtensionAuth: vi.fn(),
  getRuntimeConfig: vi.fn(),
  loggerInfo: vi.fn(),
  loggerWarn: vi.fn(),
  loggerError: vi.fn(),
  serve: vi.fn((channel: string, handlers: RpcServeHandlers) => {
    mocks.handlers = handlers
    return {
      channel,
      stop: vi.fn()
    }
  }),
  externalListener: null as ExternalListener | null,
  onMessageExternalAdd: vi.fn((listener: ExternalListener) => {
    mocks.externalListener = listener
  }),
  onMessageExternalRemove: vi.fn()
}))

vi.mock('../../src/core/rpc/serve', () => ({
  serve: mocks.serve
}))

vi.mock('../../src/core/api', () => ({
  authApi: {
    exchangeWebsiteTokenForExtensionAuth: mocks.exchangeWebsiteTokenForExtensionAuth
  }
}))

vi.mock('../../src/background/runtimeConfig', () => ({
  getRuntimeConfig: mocks.getRuntimeConfig
}))

vi.mock('../../src/core/utils/logger', () => ({
  logger: {
    info: mocks.loggerInfo,
    warn: mocks.loggerWarn,
    error: mocks.loggerError
  }
}))

function getHandler(name: string) {
  const handler = mocks.handlers?.[name]
  if (!handler) {
    throw new Error(`missing test handler: ${name}`)
  }
  return handler
}

function createContentContext(origin: string, tabId = 7): RpcContext {
  return {
    transport: 'chrome',
    caller: 'content',
    tabId,
    origin
  }
}

/** 触发捕获的 onMessageExternal listener，返回 sendResponse 与 listener 返回值。 */
function triggerExternal(
  message: unknown,
  origin: string,
  senderTab?: { id: number }
) {
  const sendResponse = vi.fn()
  const listener = mocks.externalListener
  if (!listener) {
    throw new Error('missing external listener')
  }
  const keepOpen = listener(message, { origin, tab: senderTab }, sendResponse)
  return { sendResponse, keepOpen }
}

describe('background website auth bridge', () => {
  beforeEach(async () => {
    vi.stubGlobal('__DEV__', false)
    vi.stubGlobal('__API_BASE_URL__', 'https://tg-download-api.telegramdownloadmedia.com')
    vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://telegramdownloadmedia.com')
    vi.resetModules()
    mocks.handlers = null
    mocks.externalListener = null
    mocks.serve.mockClear()
    mocks.exchangeWebsiteTokenForExtensionAuth.mockReset().mockResolvedValue(undefined)
    mocks.getRuntimeConfig.mockReset().mockResolvedValue({ debugLogging: false })
    mocks.loggerInfo.mockReset()
    mocks.loggerWarn.mockReset()
    mocks.loggerError.mockReset()
    mocks.onMessageExternalAdd.mockClear()
    mocks.onMessageExternalRemove.mockClear()

    Object.assign(chrome, {
      windows: {
        create: vi.fn().mockResolvedValue({ id: 12 }),
        update: vi.fn().mockResolvedValue({ id: 12 })
      }
    })

    const queryTabs = vi.fn((queryInfo: chrome.tabs.QueryInfo) => {
      if (queryInfo.url === 'https://web.telegram.org/*') {
        return Promise.resolve([{ id: 21, url: 'https://web.telegram.org/a/', windowId: 12 }])
      }
      return Promise.resolve([])
    })
    Object.assign(chrome.tabs, { query: queryTabs })
    chrome.tabs.update = vi.fn().mockResolvedValue({
      id: 21,
      url: 'https://web.telegram.org/a/',
      windowId: 12,
      active: true
    })
    chrome.tabs.remove = vi.fn().mockResolvedValue(undefined)
    chrome.tabs.create = vi.fn().mockResolvedValue({
      id: 22,
      url: 'https://telegramdownloadmedia.com/extension-login-v2',
      windowId: 12,
      active: true
    })
    Object.assign(chrome.runtime.onMessageExternal, {
      addListener: mocks.onMessageExternalAdd,
      removeListener: mocks.onMessageExternalRemove
    })

    const { BackgroundMessageRouter } = await import(
      '../../src/background/services/BackgroundMessageRouter'
    )
    new BackgroundMessageRouter().setupListener()
  })

  it('opens extension login in a new tab with the fixed v2 URL', async () => {
    const result = await getHandler('openExtensionLogin')(
      {},
      createContentContext('chrome-extension://test-extension-id')
    )

    expect(result).toEqual({ opened: true })
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://telegramdownloadmedia.com/extension-login-v2'
    })
    expect(chrome.windows.create).not.toHaveBeenCalled()
  })

  it('returns extension-owned runtime config', async () => {
    const config = { debugLogging: true }
    mocks.getRuntimeConfig.mockResolvedValue(config)

    await expect(
      getHandler('getRuntimeConfig')(undefined, createContentContext('https://web.telegram.org'))
    ).resolves.toEqual(config)
    expect(mocks.getRuntimeConfig).toHaveBeenCalledOnce()
  })

  it('always opens a new login tab even when one already exists', async () => {
    Object.assign(chrome.tabs, {
      query: vi
        .fn()
        .mockResolvedValue([
          {
            id: 22,
            url: 'https://telegramdownloadmedia.com/extension-login',
            windowId: 13
          }
        ])
    })

    const result = await getHandler('openExtensionLogin')(
      {},
      createContentContext('chrome-extension://test-extension-id')
    )

    expect(result).toEqual({ opened: true })
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://telegramdownloadmedia.com/extension-login-v2'
    })
    expect(chrome.tabs.query).not.toHaveBeenCalled()
    expect(chrome.windows.update).not.toHaveBeenCalled()
    expect(chrome.tabs.update).not.toHaveBeenCalled()
  })

  it('rejects external messages from non-official origins', async () => {
    const { sendResponse, keepOpen } = triggerExternal(
      { type: 'TG_DOWNLOAD_EXTENSION_AUTH_CHANGED_V2', web_access_token: 'web-token' },
      'https://attacker.example.com'
    )

    expect(keepOpen).toBe(false)
    expect(mocks.exchangeWebsiteTokenForExtensionAuth).not.toHaveBeenCalled()
    expect(sendResponse).not.toHaveBeenCalled()
  })

  it('ignores external messages with unknown schema', async () => {
    const { sendResponse, keepOpen } = triggerExternal(
      { type: 'SOME_UNKNOWN_TYPE' },
      'https://telegramdownloadmedia.com'
    )

    expect(keepOpen).toBe(false)
    expect(mocks.exchangeWebsiteTokenForExtensionAuth).not.toHaveBeenCalled()
    expect(sendResponse).not.toHaveBeenCalled()
  })

  it('rejects AUTH_CHANGED without web_access_token', async () => {
    const { sendResponse, keepOpen } = triggerExternal(
      { type: 'TG_DOWNLOAD_EXTENSION_AUTH_CHANGED_V2' },
      'https://telegramdownloadmedia.com'
    )

    expect(keepOpen).toBe(false)
    expect(sendResponse).toHaveBeenCalledWith({
      ok: false,
      message: 'AUTH_CHANGED 缺少 web_access_token'
    })
    expect(mocks.exchangeWebsiteTokenForExtensionAuth).not.toHaveBeenCalled()
  })

  it('exchanges website token on AUTH_CHANGED and acknowledges asynchronously', async () => {
    const { sendResponse, keepOpen } = triggerExternal(
      { type: 'TG_DOWNLOAD_EXTENSION_AUTH_CHANGED_V2', web_access_token: 'web-token' },
      'https://telegramdownloadmedia.com'
    )

    expect(keepOpen).toBe(true)
    expect(mocks.exchangeWebsiteTokenForExtensionAuth).toHaveBeenCalledWith('web-token')
    expect(sendResponse).not.toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(sendResponse).toHaveBeenCalledWith({ ok: true })
    })
  })

  it('reports AUTH_CHANGED exchange failure back to the sender', async () => {
    mocks.exchangeWebsiteTokenForExtensionAuth.mockRejectedValue(new Error('web token expired'))
    const { sendResponse, keepOpen } = triggerExternal(
      { type: 'TG_DOWNLOAD_EXTENSION_AUTH_CHANGED_V2', web_access_token: 'web-token' },
      'https://telegramdownloadmedia.com'
    )

    expect(keepOpen).toBe(true)
    await vi.waitFor(() => {
      expect(sendResponse).toHaveBeenCalledWith({
        ok: false,
        message: 'web token expired'
      })
    })
  })

  it('closes the login tab and acknowledges on RETURN', async () => {
    const { sendResponse, keepOpen } = triggerExternal(
      { type: 'TG_DOWNLOAD_EXTENSION_RETURN_V2' },
      'https://telegramdownloadmedia.com',
      { id: 55 }
    )

    expect(keepOpen).toBe(true)
    await vi.waitFor(() => {
      expect(chrome.tabs.remove).toHaveBeenCalledWith(55)
      expect(sendResponse).toHaveBeenCalledWith({ ok: true })
    })
  })

  it('acknowledges RETURN when the login tab was already closed', async () => {
    const removeError = new Error('No tab with id: 55')
    chrome.tabs.remove = vi.fn().mockRejectedValue(removeError)

    const { sendResponse } = triggerExternal(
      { type: 'TG_DOWNLOAD_EXTENSION_RETURN_V2' },
      'https://telegramdownloadmedia.com',
      { id: 55 }
    )

    await vi.waitFor(() => {
      expect(sendResponse).toHaveBeenCalledWith({ ok: true })
      expect(mocks.loggerWarn).toHaveBeenCalledWith(
        '[BackgroundMessageRouter] 关闭登录页 tab 失败（可能已被用户关闭）:',
        removeError
      )
    })
  })

  it('registers and removes the external listener with the router lifecycle', async () => {
    expect(mocks.onMessageExternalAdd).toHaveBeenCalledTimes(1)
    mocks.onMessageExternalAdd.mockClear()
    mocks.onMessageExternalRemove.mockClear()

    const { BackgroundMessageRouter } = await import(
      '../../src/background/services/BackgroundMessageRouter'
    )
    const router = new BackgroundMessageRouter()
    router.setupListener()
    router.destroy()

    expect(mocks.onMessageExternalAdd).toHaveBeenCalledOnce()
    expect(mocks.onMessageExternalRemove).toHaveBeenCalledOnce()
  })
})
