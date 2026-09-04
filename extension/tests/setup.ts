/**
 * Vitest 全局测试设置
 *
 * 功能:
 * - 配置 Chrome Extension API Mock
 * - 设置全局测试工具
 */

import { vi } from 'vitest'
import { chrome } from './mocks/chrome-api'

vi.stubGlobal('__API_BASE_URL__', 'https://api.example.com')
vi.stubGlobal('__DEV__', false)
vi.stubGlobal('__WEBSITE_BASE_URL__', 'https://www.example.com')
vi.stubGlobal('__ALI_SLS_MARK_CONFIG__', {
  enabled: true,
  endpoint: 'https://tg-download.ap-southeast-1.log.aliyuncs.com',
  logstore: 'tg-download-mark-log',
  topic: 'mark-log',
  source: 'extension'
})

Object.defineProperty(globalThis, 'chrome', { value: chrome, writable: true })

// Mock console 方法以减少测试输出
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
}

// Mock CustomEvent (用于 content script 测试)
class MockCustomEvent<T = object> extends Event {
  readonly detail: T | null

  constructor(type: string, options?: CustomEventInit<T>) {
    super(type)
    this.detail = options?.detail ?? null
  }
}
Object.defineProperty(globalThis, 'CustomEvent', { value: MockCustomEvent, writable: true })

// Mock document.dispatchEvent
const originalDispatchEvent = document.dispatchEvent
document.dispatchEvent = vi.fn((event: Event): boolean => {
  // 对于 CustomEvent，允许正常触发
  if (event instanceof CustomEvent) {
    return originalDispatchEvent.call(document, event)
  }
  return true
})

// 设置测试超时
vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 10000
})
