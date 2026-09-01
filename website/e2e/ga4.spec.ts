/**
 * GA4 事件通道 e2e（W6）。
 *
 * 两态断言（mock measurement ID，不依赖真网）：
 * 1. 未配置态（默认 dev，PUBLIC_GA4_MEASUREMENT_ID 为空）：页面零 gtag 脚本注入，
 *    data-cta 点击走安全守卫不抛错。
 * 2. 配置态：addInitScript 注入 mock gtag（模拟 Layout 注入后的运行环境），
 *    断言 feat 埋点表三事件真实派发：tool_view / tool_use / cta_click，带 utm 与 data-cta 值。
 *
 * 类型面：调用载荷走具体元组/接口类型并挂到 Window 全局声明；sessionStorage 往返
 * （跨导航持久化）经 JSON.parse 断言 + 运行时形态校验收窄，不用 any/unknown。
 */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import { registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)

/** 015 埋点表事件在本 spec 的断言面参数（GA4 事件参数子集）。 */
interface Ga4EventParams {
  cta_id?: string
  tool_id?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

/** mock gtag 收到的一次调用（埋点通道只会发出 'event' 命令）。 */
type Ga4Call = ['event', string, Ga4EventParams]

declare global {
  interface Window {
    /** init script 注入的 mock gtag 收集（与 sessionStorage 恢复共享同一数组）。 */
    __ga4Calls?: Ga4Call[]
    /** Layout 在配置 GA4 后注入；未配置态断言其不存在。 */
    gtag?: (command: 'event', eventName: string, params?: Ga4EventParams) => void
    /** GA4 加载器队列；未配置态断言其不存在。 */
    dataLayer?: object[]
  }
}

/** sessionStorage 键：跨导航累积 GA4 调用（CTA 点击会触发真实跳转，内存数组会随文档重置）。 */
const GA4_CALLS_STORAGE_KEY = '__ga4Calls'

/**
 * 在页面脚本执行前注入 mock gtag。
 *
 * 回调体必须自包含（Playwright 按 toString 序列化注入，不能引用模块内函数）；
 * sessionStorage 往返的形态校验在回调内内联，类型标注在注入前擦除。
 */
async function installMockGtag(page: Page): Promise<void> {
  await page.addInitScript((key: string) => {
    const readCalls = (): Ga4Call[] => {
      try {
        const raw = sessionStorage.getItem(key)
        if (!raw) {
          return []
        }
        const parsed = JSON.parse(raw) as Ga4Call[]
        if (!Array.isArray(parsed)) {
          return []
        }
        return parsed.filter(
          call =>
            call.length === 3 &&
            call[0] === 'event' &&
            typeof call[1] === 'string' &&
            typeof call[2] === 'object' &&
            call[2] !== null
        )
      } catch {
        return []
      }
    }

    const calls = readCalls()
    window.__ga4Calls = calls

    const gtag = (command: 'event', eventName: string, params?: Ga4EventParams): void => {
      calls.push([command, eventName, params ?? {}])
      try {
        sessionStorage.setItem(key, JSON.stringify(calls))
      } catch {
        // 配额异常时仅丢断言数据，不影响页面。
      }
    }
    Object.defineProperty(window, 'gtag', { value: gtag, writable: true })
  }, GA4_CALLS_STORAGE_KEY)
}

/**
 * 读取累计收集到的 GA4 调用（含历史导航）。
 *
 * evaluate 回调同样按 toString 序列化，形态校验内联。
 */
async function readGa4Calls(page: Page): Promise<Ga4Call[]> {
  return page.evaluate((key: string) => {
    try {
      const raw = sessionStorage.getItem(key)
      if (!raw) {
        return []
      }
      const parsed = JSON.parse(raw) as Ga4Call[]
      if (!Array.isArray(parsed)) {
        return []
      }
      return parsed.filter(
        call =>
          call.length === 3 &&
          call[0] === 'event' &&
          typeof call[1] === 'string' &&
          typeof call[2] === 'object' &&
          call[2] !== null
      )
    } catch {
      return []
    }
  }, GA4_CALLS_STORAGE_KEY)
}

test.describe('GA4 unconfigured state', () => {
  test('injects zero gtag scripts and exposes no dataLayer', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0)
    const dataLayerExists = await page.evaluate(() => typeof window.dataLayer !== 'undefined')
    expect(dataLayerExists).toBe(false)
    const gtagExists = await page.evaluate(() => typeof window.gtag !== 'undefined')
    expect(gtagExists).toBe(false)
  })

  test('data-cta clicks stay silent without errors when gtag is absent', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(String(error)))
    await page.goto('/')
    await page.locator('a[data-cta="footer-extension"]').click()
    await expect(page).toHaveURL(/\/extension\//)
    expect(pageErrors).toEqual([])
  })
})

test.describe('GA4 configured state (mock gtag)', () => {
  test('tool page dispatches tool_view with tool id and page utm', async ({ page }) => {
    await installMockGtag(page)
    await page.goto('/tools/email-checker/?utm_source=newsletter&utm_medium=email')
    const calls = await readGa4Calls(page)
    const toolView = calls.find(call => call[1] === 'tool_view')
    expect(toolView, 'expected tool_view to be dispatched').toBeTruthy()
    expect(toolView?.[2]).toMatchObject({
      tool_id: 'email-checker',
      utm_source: 'newsletter',
      utm_medium: 'email'
    })
  })

  test('home page never dispatches tool_view', async ({ page }) => {
    await installMockGtag(page)
    await page.goto('/')
    const calls = await readGa4Calls(page)
    expect(calls.some(call => call[1] === 'tool_view')).toBe(false)
  })

  test('tool form submit dispatches tool_use with tool id', async ({ page }) => {
    await installMockGtag(page)
    await page.goto('/tools/place-id-finder/')
    await page.locator('[data-tool-input]').fill(
      'https://www.google.com/maps/place/San+Francisco/@37.774929,-122.419416,17z/data=!4m5!3m4!1s0x8085809c23193567:0xa64e70a2e1a9c0e5!8m2!3d37.774929!4d-122.419416'
    )
    await page.locator('[data-tool-form] button[type="submit"]').click()
    const calls = await readGa4Calls(page)
    const toolUse = calls.find(call => call[1] === 'tool_use')
    expect(toolUse, 'expected tool_use to be dispatched').toBeTruthy()
    expect(toolUse?.[2]).toMatchObject({ tool_id: 'place-id-finder' })
  })

  test('cta click dispatches cta_click with data-cta value and link utm', async ({ page }) => {
    await installMockGtag(page)
    await page.goto('/tools/place-id-finder/')
    await page.locator('.tool-cta a[data-cta="tool-place-id-finder-install"]').click()
    await expect(page).toHaveURL(/\/extension\//)
    const calls = await readGa4Calls(page)
    const ctaClick = calls.find(call => call[1] === 'cta_click')
    expect(ctaClick, 'expected cta_click to be dispatched').toBeTruthy()
    expect(ctaClick?.[2]).toMatchObject({
      cta_id: 'tool-place-id-finder-install',
      utm_source: 'website',
      utm_medium: 'tool-place-id-finder',
      utm_campaign: 'install'
    })
  })

  test('cta click falls back to page utm when the link has none', async ({ page }) => {
    await installMockGtag(page)
    await page.goto('/extension/?utm_source=docs&utm_campaign=launch')
    // footer 站内链接不带 utm → 事件回退用页面 utm（流量来源归因）
    await page.locator('a[data-cta="footer-extension"]').click()
    await expect(page).toHaveURL(/\/extension\//)
    const calls = await readGa4Calls(page)
    const ctaClick = calls.find(call => call[1] === 'cta_click')
    expect(ctaClick, 'expected cta_click to be dispatched').toBeTruthy()
    expect(ctaClick?.[2]).toMatchObject({
      cta_id: 'footer-extension',
      utm_source: 'docs',
      utm_campaign: 'launch'
    })
  })
})
