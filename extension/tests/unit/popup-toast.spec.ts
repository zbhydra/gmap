/**
 * Popup 全局 Toast 渲染回归测试。
 *
 * App 必须挂载唯一的 Toast renderer，使拦截器和组件共享的 toastService 能向用户展示错误。
 * 对比度断言不读运行时样式，而是静态解析共享 Toast 样式消费的 Atlas Field 语义 token，
 * 并从 tokens.css 解析亮 / 暗两组取值分别校验 WCAG AA（light-dark() 双主题合同）。
 */

import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../../src/popup/App.vue'
import { toastService } from '../../src/core/composables/useToast'
import TRANSLATIONS from '../../src/locales/messages'

// vitest 下 .css?raw 会得到空串，token 取值表用 fs 直读源文件（vitest 根即包根）
const tokensSource = readFileSync(path.resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')
const componentsSource = readFileSync(path.resolve(process.cwd(), 'src/styles/components.css'), 'utf8')

const mocks = vi.hoisted(() => ({
  authInitialize: vi.fn(),
  recordMark: vi.fn()
}))

vi.mock('../../src/core/stores/authStore', () => ({
  useAuthStore: () => ({
    initialize: mocks.authInitialize
  })
}))

vi.mock('../../src/core/api/mark', () => ({
  MARK_TYPE: {
    POPUP_OPEN: 'popup_open'
  },
  markApi: {
    record: mocks.recordMark
  }
}))

vi.mock('../../src/core/utils/logger', () => ({
  logger: {
    error: vi.fn()
  }
}))

/** 解析 Toast 文字与卡面的 light-dark() 色值。 */
function parseTokenMap(theme: 'light' | 'dark'): Map<string, string> {
  const map = new Map<string, string>()
  for (const match of tokensSource.matchAll(/^\s*(--[\w-]+):\s*(.+);/gm)) {
    const pair = /^light-dark\((#[\da-f]+),\s*(#[\da-f]+)\)$/i.exec(match[2])
    map.set(match[1], pair ? pair[theme === 'light' ? 1 : 2] : match[2])
  }
  return map
}

/**
 * 将浏览器计算后的 CSS 颜色转换为 RGB 通道。
 */
function parseCssColor(color: string): readonly [number, number, number] {
  if (color.startsWith('#') && color.length === 7) {
    return [
      Number.parseInt(color.slice(1, 3), 16),
      Number.parseInt(color.slice(3, 5), 16),
      Number.parseInt(color.slice(5, 7), 16)
    ]
  }

  const channels = color.match(/[\d.]+/g)
  if (!channels || channels.length < 3) {
    throw new Error(`[Popup Toast Test] 无法解析 CSS 颜色: ${color}`)
  }

  return [Number(channels[0]), Number(channels[1]), Number(channels[2])]
}

/**
 * 计算 sRGB 颜色的相对亮度。
 */
function relativeLuminance(color: string): number {
  const [red, green, blue] = parseCssColor(color)
  const linearChannels = [red, green, blue].map(channel => {
    const normalized = channel / 255
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * linearChannels[0] + 0.7152 * linearChannels[1] + 0.0722 * linearChannels[2]
}

/**
 * 计算前景色与背景色的 WCAG 对比度。
 */
function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

/** 把 `var(--x)` 形式的取值解析为 token 具体值（单层引用足够）。 */
function resolveToken(value: string, tokens: Map<string, string>): string {
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim())
  if (!match) {
    return value
  }
  const resolved = tokens.get(match[1])
  if (!resolved) {
    throw new Error(`[Popup Toast Test] token 未定义: ${match[1]}`)
  }
  return resolved
}

/** Toast 标题与卡面必须消费共享语义 token。 */
function readToastColors(): { foreground: string; background: string } {
  const title = /\.toast-title\s*\{([^}]*)\}/.exec(componentsSource)?.[1]
  const card = /\.toast\s*\{([^}]*)\}/.exec(componentsSource)?.[1]
  const foreground = title?.match(/(?:^|\n)\s*color:\s*(var\(--[\w-]+\))\s*;/)?.[1]
  const background = card?.match(/(?:^|\n)\s*background:\s*(var\(--[\w-]+\))\s*;/)?.[1]
  if (!foreground || !background) {
    throw new Error('[Popup Toast Test] Toast 标题或卡面未消费语义 token')
  }
  return { foreground, background }
}

/**
 * 挂载 Popup，并等待初始化任务结束。
 */
async function mountPopup(): Promise<VueWrapper> {
  const mounted = mount(App, {
    attachTo: document.body,
    global: {
      plugins: [createI18n({ legacy: false, locale: 'en-US', messages: TRANSLATIONS })],
      stubs: {
        AppHeader: true,
        AppFooter: true
      }
    }
  })
  await flushPromises()
  return mounted
}

describe('Popup global Toast', () => {
  let wrapper: VueWrapper | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    toastService.hide()
    document.body.innerHTML = ''
    mocks.authInitialize.mockResolvedValue(undefined)
    mocks.recordMark.mockResolvedValue(undefined)
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    toastService.hide()
    document.body.innerHTML = ''
  })

  it('renders toastService errors through one assertive live region', async () => {
    wrapper = await mountPopup()

    toastService.error('官网登录页打开失败', 0)
    await nextTick()

    const alerts = document.body.querySelectorAll<HTMLElement>('[role="alert"]')
    expect(alerts).toHaveLength(1)
    expect(alerts[0].textContent).toContain('官网登录页打开失败')
    expect(alerts[0].getAttribute('aria-live')).toBe('assertive')
    expect(alerts[0].getAttribute('aria-atomic')).toBe('true')
  })

  it.each([
    ['success', 'status', '下载已开始'],
    ['error', 'alert', '下载失败']
  ] as const)('keeps %s toast text at WCAG AA contrast in both themes', async (type, role, message) => {
    wrapper = await mountPopup()

    toastService.show(message, type, 0)
    await nextTick()

    const toast = document.body.querySelector<HTMLElement>(`.toast[role="${role}"]`)
    expect(toast).not.toBeNull()
    expect(toast?.classList.contains(type === 'error' ? 'tone-bad' : 'tone-ok')).toBe(true)

    const colors = readToastColors()
    for (const theme of ['light', 'dark'] as const) {
      const tokens = parseTokenMap(theme)
      const ratio = contrastRatio(
        resolveToken(colors.foreground, tokens),
        resolveToken(colors.background, tokens)
      )
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    }
  })
})
