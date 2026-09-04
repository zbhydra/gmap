/**
 * 订阅引导落地页单元测试（013 U7 遗留接线，W7 验收行为直接覆盖）：
 * - pricingUrl 消费：远程配置组装落地页 URL（追加 utm_source=extension）；
 * - 单一事实源：未配置/纯空白/脏 URL 一律返回空串——面板按钮可见性与点击
 *   打开同源，「按钮可见 ⇔ 点击有效」，脏值降级为纯文案；
 * - 按钮行为：耗尽 + URL 有效 → 按钮出现且点击触发打开；非耗尽/未配置/
 *   脏 URL → 不出现；place 模式共享按钮随区块门控出现/隐藏。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RpcRequest, RpcResponse } from '../../src/core/rpc/types'
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
  it('已配置时追加 utm_source=extension 归因参数', () => {
    expect(buildMapsPricingUrl(CONFIGURED_PRICING_URL)).toBe(
      'https://mapsgrab.com/pricing/?utm_source=extension'
    )
  })

  it('原 URL 已带 query 时保留原参数并追加归因', () => {
    expect(
      buildMapsPricingUrl('https://mapsgrab.com/pricing/?utm_campaign=launch')
    ).toBe('https://mapsgrab.com/pricing/?utm_campaign=launch&utm_source=extension')
  })

  it('空白包裹的远程值按 trim 后解析', () => {
    expect(buildMapsPricingUrl(`  ${CONFIGURED_PRICING_URL}  `)).toBe(
      'https://mapsgrab.com/pricing/?utm_source=extension'
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

  it('包内默认值为空串（未配置不渲染按钮的契约基线）', () => {
    expect(DEFAULT_MAPS_CONFIG.operations.pricingUrl).toBe('')
  })
})

describe('面板订阅引导按钮行为', () => {
  /** 构造已挂载面板：onOpenPricing 用 spy 承接，模式为 happy-dom 默认的 search。 */
  async function mountPanel(): Promise<{ panel: MapsPanel; onOpenPricing: () => void }> {
    const onOpenPricing = vi.fn()
    const panel = new MapsPanel({
      onStart: () => undefined,
      onPause: () => undefined,
      onResume: () => undefined,
      onExport: () => undefined,
      onReset: () => undefined,
      onStartReviews: () => undefined,
      onStartPhotos: () => undefined,
      onOpenPricing
    })
    document.body.innerHTML = '<div role="main"></div>'
    await panel.mount('body', 'div[role=main]')
    return { panel, onOpenPricing }
  }

  function upgradeButton(): HTMLButtonElement {
    const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
    return shadow.querySelector('.panel-upgrade-button')!
  }

  it('耗尽 + 已配置：按钮出现，点击触发 onOpenPricing（消费链路接到打开动作）', async () => {
    setPricingUrl(CONFIGURED_PRICING_URL)
    const { panel, onOpenPricing } = await mountPanel()

    panel.setQuotaExhausted(true)

    const button = upgradeButton()
    expect(button.style.display).toBe('block')
    expect(button.textContent!.length).toBeGreaterThan(0)
    button.click()
    expect(onOpenPricing).toHaveBeenCalledTimes(1)

    panel.destroy()
  })

  it('耗尽 + 未配置：按钮不出现，保持纯文案（优雅降级）', async () => {
    const { panel, onOpenPricing } = await mountPanel()

    panel.setQuotaExhausted(true)

    const button = upgradeButton()
    expect(button.style.display).toBe('none')
    // 提示文案仍在：降级为 U7 的纯文案引导
    const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
    expect(shadow.querySelector('.panel-hint')!.textContent).toContain(
      'Monthly quota exhausted'
    )
    expect(onOpenPricing).not.toHaveBeenCalled()

    panel.destroy()
  })

  it('耗尽 + 脏 URL：按钮不渲染（可见性与点击有效同源，降级纯文案）', async () => {
    // 远程值非绝对地址：buildMapsPricingUrl 返回空串 → 可见性判定不通过
    setPricingUrl('not-a-url')
    const { panel, onOpenPricing } = await mountPanel()

    panel.setQuotaExhausted(true)

    const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
    expect(upgradeButton().style.display).toBe('none')
    expect(shadow.querySelector('.panel-hint')!.textContent).toContain(
      'Monthly quota exhausted'
    )
    expect(onOpenPricing).not.toHaveBeenCalled()

    panel.destroy()
  })

  it('免费额度内（非耗尽）：已配置也不出现按钮', async () => {
    setPricingUrl(CONFIGURED_PRICING_URL)
    const { panel, onOpenPricing } = await mountPanel()

    panel.setQuotaExhausted(false)

    expect(upgradeButton().style.display).toBe('none')
    expect(onOpenPricing).not.toHaveBeenCalled()

    panel.destroy()
  })

  it('place 模式共享按钮：任一区块待命即出现，双区块均 working 后隐藏', async () => {
    setPricingUrl(CONFIGURED_PRICING_URL)
    // place 模式由 URL 形态判定（pathname 含 /place/ 且不命中列表标记）；
    // happy-dom 支持 location.href 赋值，置于 mount 之前使面板挂载为 place
    window.location.href = 'https://www.google.com/maps/place/Test/@37.77,-122.41,17z'
    const { panel, onOpenPricing } = await mountPanel()

    // 门控生效 + 双区块待命 → 共享按钮出现
    panel.setQuotaExhausted(true)
    expect(upgradeButton().style.display).toBe('block')

    // reviews 已发起（photos 仍待命，待命区块仍被门控）→ 按钮仍出现
    panel.setPlaceSectionWorking('reviews', true)
    expect(upgradeButton().style.display).toBe('block')

    // 双区块均已发起（采集中不受门控）→ 按钮隐藏
    panel.setPlaceSectionWorking('photos', true)
    expect(upgradeButton().style.display).toBe('none')
    expect(onOpenPricing).not.toHaveBeenCalled()

    panel.destroy()
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
      expect(request.params?.url).toBe('https://mapsgrab.com/pricing/?utm_source=extension')
    } finally {
      sendSpy.mockRestore()
    }
  })
})
