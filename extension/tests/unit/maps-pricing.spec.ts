/** 订阅入口覆盖远程 URL 归因、官网默认落地页与额度解锁。 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RpcRequest, RpcResponse } from '../../src/core/rpc/types'
import { openPanelPricing } from '../../src/sites/maps/content/panel/panelView'
import { MapsPanel } from '../../src/sites/maps/content/panel/mapsPanel'
import { DEFAULT_MAPS_CONFIG } from '../../src/sites/maps/config/contract'
import {
  getMapsConfig,
  resetMapsConfigForTests
} from '../../src/sites/maps/config/loader'
import {
  buildMapsPricingUrl,
  openMapsPricingPage
} from '../../src/sites/maps/config/pricing'

/** 已知配置值（与 backend MAPS_OPERATIONS_CONFIG 同形）。 */
const CONFIGURED_PRICING_URL = 'https://mapsgrab.com/pricing/'

/** 注入生效配置的 operations.pricingUrl（loader 语义：活对象，消费方现读）。 */
function setPricingUrl(pricingUrl: string): void {
  Object.assign(getMapsConfig().operations, { pricingUrl })
}

beforeEach(() => {
  resetMapsConfigForTests()
})

describe('pricingUrl 消费（buildMapsPricingUrl）', () => {
  it('已配置时选择插件产品线并追加归因参数', () => {
    expect(buildMapsPricingUrl(CONFIGURED_PRICING_URL)).toBe(
      'https://mapsgrab.com/pricing/?product_kind=maps_extension&utm_source=extension'
    )
  })

  it('原 URL 已带 query 时保留原参数并追加归因', () => {
    expect(
      buildMapsPricingUrl('https://mapsgrab.com/pricing/?utm_campaign=launch&product_kind=maps_online')
    ).toBe('https://mapsgrab.com/pricing/?utm_campaign=launch&product_kind=maps_extension&utm_source=extension')
  })

  it('空白包裹的远程值按 trim 后解析', () => {
    expect(buildMapsPricingUrl(`  ${CONFIGURED_PRICING_URL}  `)).toBe(
      'https://mapsgrab.com/pricing/?product_kind=maps_extension&utm_source=extension'
    )
  })
})

describe('单一事实源判定（未配置/脏数据返回空串）', () => {
  it('空串与纯空白返回空串', () => {
    expect(buildMapsPricingUrl('')).toBe('')
    expect(buildMapsPricingUrl('   ')).toBe('')
  })

  it('非绝对地址的脏数据容错：返回空串不抛错（按未配置降级）', () => {
    expect(buildMapsPricingUrl('not-a-url')).toBe('')
  })

  it('包内未指定远程定制链接，面板使用官网默认地址', () => {
    expect(DEFAULT_MAPS_CONFIG.operations.pricingUrl).toBe('')
  })
})

describe('面板额度升级入口', () => {
  const usage = { plan_name: 'Free', used: 1000, total: 1000, period: '2026-10', exhausted: true, run_limits: { search: 10, reviews: 20, photos: 10 } } as const
  async function mountPanel(): Promise<{ panel: MapsPanel; onOpenPricing: () => void }> {
    const onOpenPricing = vi.fn()
    const panel = new MapsPanel({
      onStart: () => undefined, onPause: () => undefined, onResume: () => undefined,
      onExport: () => undefined, onReset: () => undefined, onStartReviews: () => undefined,
      onStartPhotos: () => undefined, onOpenPricing
    })
    document.body.innerHTML = '<div role="main"></div>'
    await panel.mount('body', 'div[role=main]')
    return { panel, onOpenPricing }
  }

  it('远程未配置时额度用尽仍显示方案入口，解锁后恢复 Start', async () => {
    const { panel, onOpenPricing } = await mountPanel()
    try {
      panel.setUsage(usage)
      const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
      const upgrade = shadow.querySelector<HTMLElement>('.mgp-upgrade')!
      expect(upgrade.hidden).toBe(false)
      shadow.querySelector<HTMLButtonElement>('[data-pricing]')!.click()
      expect(onOpenPricing).toHaveBeenCalledOnce()
      expect(shadow.querySelector<HTMLButtonElement>('[data-primary]')!.disabled).toBe(true)
      panel.setUsage({ ...usage, used: 900, exhausted: false })
      expect(upgrade.hidden).toBe(true)
      expect(shadow.querySelector<HTMLButtonElement>('[data-primary]')!.disabled).toBe(false)
    } finally { panel.destroy() }
  })

  it('进度、暂停计数、补全等待、导出回执与评论入口复位', async () => {
    window.location.href = 'https://www.google.com/maps/place/Test/'
    const { panel } = await mountPanel()
    const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
    vi.useFakeTimers()
    try {
      panel.renderSearch({ status: 'paused', count: 4, limit: 10, format: 'csv' })
      expect(shadow.querySelector('.mgp-ring')?.getAttribute('aria-valuemax')).toBe('10')
      expect(shadow.querySelector('.mgp-ring')?.getAttribute('aria-valuenow')).toBe('4')
      expect(shadow.querySelector('[data-state-label]')?.textContent).toContain('4')
      const primary = shadow.querySelector<HTMLButtonElement>('[data-primary]')!
      panel.setFinishing({ done: 0, total: 4 })
      expect(primary.getAttribute('aria-busy')).toBe('true')
      primary.click()
      expect(primary.querySelector('.is-active')?.textContent).not.toContain('Exported')
      panel.setFinishing(null)
      primary.click()
      expect(primary.querySelector('.is-active')?.textContent).toContain('Exported')
      await vi.advanceTimersByTimeAsync(1600)
      expect(primary.querySelector('.is-active')?.textContent).toContain('4')
      panel.setPlaceSectionWorking('reviews', true)
      const row = shadow.querySelector<HTMLElement>('[data-row="reviews"]')!
      expect(row.dataset.state).toBe('opened')
      expect(row.querySelector<HTMLButtonElement>('button')!.disabled).toBe(false)
      await vi.advanceTimersByTimeAsync(4000)
      expect(row.dataset.state).toBe('ready')
    } finally { panel.destroy(); vi.useRealTimers() }
  })

  it('详情页两个入口按最新额度同步门控', async () => {
    window.location.href = 'https://www.google.com/maps/place/Test/'
    const { panel } = await mountPanel()
    try {
      const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
      panel.setUsage(usage)
      for (const button of shadow.querySelectorAll<HTMLButtonElement>('[data-row-action]')) expect(button.disabled).toBe(true)
      panel.setUsage({ ...usage, used: 900, exhausted: false })
      for (const button of shadow.querySelectorAll<HTMLButtonElement>('[data-row-action]')) expect(button.disabled).toBe(false)
    } finally { panel.destroy() }
  })
})

describe('openMapsPricingPage（打开路径）', () => {
  it('未配置时不发起 background RPC', async () => {
    const sendSpy = vi.spyOn(chrome.runtime, 'sendMessage')
    await openMapsPricingPage()
    expect(sendSpy).not.toHaveBeenCalled()
    sendSpy.mockRestore()
  })

  it('已配置时经 background 发送 openPricingPage（URL 含归因参数）', async () => {
    setPricingUrl(CONFIGURED_PRICING_URL)
    const sendSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockImplementation(async message => {
      const request = message as RpcRequest<{ url: string }>
      return {
        id: request.id,
        success: true,
        data: { opened: true }
      } satisfies RpcResponse<{ opened: boolean }>
    })
    try {
      await openMapsPricingPage()
      expect(sendSpy).toHaveBeenCalledTimes(1)
      const request = sendSpy.mock.calls[0]?.[0] as RpcRequest<{ url: string }>
      expect(request.method).toBe('openPricingPage')
      expect(request.params?.url).toBe('https://mapsgrab.com/pricing/?product_kind=maps_extension&utm_source=extension')
    } finally {
      sendSpy.mockRestore()
    }
  })
})

 it('面板默认 Pricing 通过已有 RPC 打开官网', async () => {
   const sendSpy = vi.spyOn(chrome.runtime, 'sendMessage').mockImplementation(async message => {
     const request = message as RpcRequest<{ url: string }>
     return { id: request.id, success: true, data: { opened: true } } satisfies RpcResponse<{ opened: boolean }>
   })
   try {
     setPricingUrl('')
     await openPanelPricing()
     const request = sendSpy.mock.calls[0]?.[0] as RpcRequest<{ url: string }>
     expect(request.method).toBe('openPricingPage')
     expect(new URL(request.params!.url).pathname).toBe('/pricing/')
     expect(new URL(request.params!.url).searchParams.get('product_kind')).toBe('maps_extension')
   } finally { sendSpy.mockRestore() }
 })
