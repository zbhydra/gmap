/**
 * 官网登录桥（WebsiteAuthBridge）单测：016 §5 验收面。
 *
 * 覆盖：sender.origin 白名单拒绝/放行、无效 token 丢弃（含清持久化）、
 * LOGIN_RETURN 按 sender.tab.id 关 tab、消息常量与 website auth.ts 逐字一致。
 * authStore 走真实实现，HTTP 与存储边界经 vi.mock 替身。
 */

import { createPinia, setActivePinia } from 'pinia'
import { chrome } from '../mocks/chrome-api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getStoredUserInfo: vi.fn(),
  getAccessToken: vi.fn(),
  clearLocalAuth: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  subscriptionStatus: vi.fn(),
  storageGet: vi.fn(),
  storageSet: vi.fn(),
  storageRemove: vi.fn(),
  tabsRemove: vi.fn()
}))

vi.mock('../../src/core/api', () => ({
  authApi: {
    getStoredUserInfo: mocks.getStoredUserInfo,
    getAccessToken: mocks.getAccessToken,
    clearLocalAuth: mocks.clearLocalAuth,
    getCurrentUser: mocks.getCurrentUser,
    logout: mocks.logout
  },
  subscriptionApi: { getStatus: mocks.subscriptionStatus },
  STORAGE_KEYS: { ACCESS_TOKEN: 'auth_access_token' }
}))

vi.mock('../../src/core/storage', () => ({
  storageManager: {
    get: mocks.storageGet,
    set: mocks.storageSet,
    setMany: vi.fn(),
    remove: mocks.storageRemove,
    getAll: vi.fn(),
    onChanged: vi.fn()
  }
}))

vi.mock('../../src/core/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

const trustedUser = {
  user_id: 42,
  email: 'bridge@example.com',
  full_name: 'Bridge User',
  avatar_url: null,
  created_at: 1700000000
}

/** 与 website scripts/homepage/auth.ts 已发布值逐字一致的契约断言。 */
const WEBSITE_CONSTANTS = {
  AUTH_CHANGED: 'BING_MAPS_EXTENSION_AUTH_CHANGED',
  LOGIN_RETURN: 'BING_MAPS_EXTENSION_LOGIN_RETURN'
}

/** 构造满足 chrome.tabs.Tab 必填字段集的 sender.tab(业务只读 id,余字段为合法占位)。 */
function senderTab(id: number): chrome.tabs.Tab {
  return {
    id,
    index: 0,
    pinned: false,
    highlighted: false,
    windowId: 1,
    active: true,
    frozen: false,
    incognito: false,
    selected: false,
    discarded: false,
    autoDiscardable: false,
    groupId: -1
  }
}

async function loadBridge() {
  const { WebsiteAuthBridge, isTrustedWebsiteOrigin } = await import(
    '../../src/background/services/WebsiteAuthBridge'
  )
  return { WebsiteAuthBridge, isTrustedWebsiteOrigin }
}

describe('WebsiteAuthBridge', () => {
  beforeEach(() => {
    // 重置模块注册表:backgroundStores 的 SW 级 pinia/账号态是模块级单例,
    // 不重置会跨用例残留登录态,破坏"无既有会话"等前置
    vi.resetModules()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mocks.getCurrentUser.mockResolvedValue(trustedUser)
    mocks.clearLocalAuth.mockResolvedValue(undefined)
    mocks.storageSet.mockResolvedValue(undefined)
    mocks.storageRemove.mockResolvedValue(undefined)
    mocks.tabsRemove.mockResolvedValue(undefined)
    ;(chrome.tabs as unknown as { remove: unknown }).remove = mocks.tabsRemove
  })

  it('消息常量与 website auth.ts 已发布值逐字一致', async () => {
    const { BING_MAPS_EXTENSION_AUTH_CHANGED, BING_MAPS_EXTENSION_LOGIN_RETURN } =
      await import('../../src/background/services/WebsiteAuthBridge')
    expect(BING_MAPS_EXTENSION_AUTH_CHANGED).toBe(WEBSITE_CONSTANTS.AUTH_CHANGED)
    expect(BING_MAPS_EXTENSION_LOGIN_RETURN).toBe(WEBSITE_CONSTANTS.LOGIN_RETURN)
  })

  it('setup 注册 onMessageExternal 监听', async () => {
    const { WebsiteAuthBridge } = await loadBridge()
    const addListener = vi.fn()
    ;(chrome.runtime.onMessageExternal as unknown as { addListener: unknown }).addListener =
      addListener

    new WebsiteAuthBridge().setup()

    expect(addListener).toHaveBeenCalledOnce()
  })

  it('非白名单 origin 拒绝：不写 token、不校验', async () => {
    const { WebsiteAuthBridge } = await loadBridge()
    const bridge = new WebsiteAuthBridge()

    const ack = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.AUTH_CHANGED, web_access_token: 'tok' },
      { origin: 'https://evil.example.com' }
    )

    expect(ack).toEqual({ ok: false })
    expect(mocks.storageSet).not.toHaveBeenCalled()
    expect(mocks.getCurrentUser).not.toHaveBeenCalled()
  })

  it('origin 缺失（扩展页面等）一律拒绝', async () => {
    const { WebsiteAuthBridge, isTrustedWebsiteOrigin } = await loadBridge()
    expect(isTrustedWebsiteOrigin(undefined)).toBe(false)

    const bridge = new WebsiteAuthBridge()
    const ack = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.AUTH_CHANGED, web_access_token: 'tok' },
      {}
    )
    expect(ack).toEqual({ ok: false })
    expect(mocks.getCurrentUser).not.toHaveBeenCalled()
  })

  it('白名单 origin + 有效 token：token 落 storage 并完成用户信息校验', async () => {
    const { WebsiteAuthBridge } = await loadBridge()
    const bridge = new WebsiteAuthBridge()

    const ack = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.AUTH_CHANGED, web_access_token: 'web-token-1' },
      { origin: 'https://www.example.com' }
    )

    expect(ack).toEqual({ ok: true })
    expect(mocks.storageSet).toHaveBeenCalledWith('auth_access_token', 'web-token-1')
    expect(mocks.getCurrentUser).toHaveBeenCalledOnce()
  })

  it('无效 token 丢弃（无既有会话）：回滚本次写入并返回 ok:false（不抛出）', async () => {
    const { WebsiteAuthBridge } = await loadBridge()
    mocks.getCurrentUser.mockRejectedValue(
      Object.assign(new Error('error code:10104'), { status: 401 })
    )
    const bridge = new WebsiteAuthBridge()

    const ack = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.AUTH_CHANGED, web_access_token: 'bad-token' },
      { origin: 'https://www.example.com' }
    )

    expect(ack).toEqual({ ok: false })
    expect(mocks.getCurrentUser).toHaveBeenCalledOnce()
    expect(mocks.clearLocalAuth).toHaveBeenCalledOnce()
  })

  it('payload 缺少 web_access_token 或类型非法：直接丢弃不发起校验', async () => {
    const { WebsiteAuthBridge } = await loadBridge()
    const bridge = new WebsiteAuthBridge()

    const missing = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.AUTH_CHANGED },
      { origin: 'https://www.example.com' }
    )
    const empty = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.AUTH_CHANGED, web_access_token: '   ' },
      { origin: 'https://www.example.com' }
    )
    const wrongType = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.AUTH_CHANGED, web_access_token: 123 },
      { origin: 'https://www.example.com' }
    )

    expect(missing).toEqual({ ok: false })
    expect(empty).toEqual({ ok: false })
    expect(wrongType).toEqual({ ok: false })
    expect(mocks.getCurrentUser).not.toHaveBeenCalled()
  })

  it('LOGIN_RETURN：按 sender.tab.id 关闭登录 tab', async () => {
    const { WebsiteAuthBridge } = await loadBridge()
    const bridge = new WebsiteAuthBridge()

    const ack = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.LOGIN_RETURN },
      { origin: 'https://www.example.com', tab: senderTab(314) }
    )

    expect(ack).toEqual({ ok: true })
    expect(mocks.tabsRemove).toHaveBeenCalledWith(314)
  })

  it('LOGIN_RETURN 缺少 tab 上下文：忽略且不关 tab', async () => {
    const { WebsiteAuthBridge } = await loadBridge()
    const bridge = new WebsiteAuthBridge()

    const ack = await bridge.handleMessage(
      { type: WEBSITE_CONSTANTS.LOGIN_RETURN },
      { origin: 'https://www.example.com' }
    )

    expect(ack).toEqual({ ok: false })
    expect(mocks.tabsRemove).not.toHaveBeenCalled()
  })

  it('未知消息类型忽略', async () => {
    const { WebsiteAuthBridge } = await loadBridge()
    const bridge = new WebsiteAuthBridge()

    const ack = await bridge.handleMessage(
      { type: 'SOMETHING_ELSE' },
      { origin: 'https://www.example.com' }
    )

    expect(ack).toEqual({ ok: false })
    expect(mocks.getCurrentUser).not.toHaveBeenCalled()
    expect(mocks.tabsRemove).not.toHaveBeenCalled()
  })
})
