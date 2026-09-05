import { expect, it, vi } from 'vitest'
import { openPricingPage } from '../../src/core/utils/navigation'

it('订阅入口在网站对应产品线打开并保留归因参数', async () => {
  const createTab = vi.spyOn(chrome.tabs, 'create')
  try {
    await expect(openPricingPage('bing_panel')).resolves.toBe(true)
    expect(createTab).toHaveBeenCalledWith({
      url: 'https://www.example.com/pricing/?product_line=maps_extension&utm_source=extension&source=bing_panel'
    })
  } finally {
    createTab.mockRestore()
  }
})
