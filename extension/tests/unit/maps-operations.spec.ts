/** 公告渲染与导出格式展示。 */

import { describe, expect, it } from 'vitest'

import { MapsPanel } from '../../src/sites/maps/content/panel/mapsPanel'

describe('面板运营区渲染（renderOperations）', () => {
  it('公告存在时 innerHTML 注入公告区', async () => {
    const panel = new MapsPanel({
      onStart: () => undefined,
      onPause: () => undefined,
      onResume: () => undefined,
      onExport: () => undefined,
      onReset: () => undefined,
      onStartReviews: () => undefined,
      onStartPhotos: () => undefined,
      onOpenPricing: () => undefined
    })
    document.body.innerHTML = '<div role="main"></div>'
    await panel.mount('body', 'div[role=main]')

    panel.renderOperations({
      announcementHtml: '<p class="gme-test-announcement">Welcome to MapExporter!</p>',
    })

    const host = document.getElementById('gmap-extractor-panel-host')
    expect(host).not.toBeNull()
    const shadow = host!.shadowRoot
    expect(shadow).not.toBeNull()

    // 公告 HTML 注入（竞品同构）且容器可见
    const announcement = shadow!.querySelector('.gme-test-announcement')
    expect(announcement).not.toBeNull()
    const announcementBox = shadow!.querySelector('[data-announcement]')
    expect(announcementBox?.hasAttribute('hidden')).toBe(false)

    panel.destroy()
  })

  it('空公告且无版本提示时运营区隐藏，不注入空内容', async () => {
    const panel = new MapsPanel({
      onStart: () => undefined,
      onPause: () => undefined,
      onResume: () => undefined,
      onExport: () => undefined,
      onReset: () => undefined,
      onStartReviews: () => undefined,
      onStartPhotos: () => undefined,
      onOpenPricing: () => undefined
    })
    document.body.innerHTML = '<div role="main"></div>'
    await panel.mount('body', 'div[role=main]')

    panel.renderOperations({ announcementHtml: '' })

    const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
    expect(shadow.querySelector('[data-announcement]')?.hasAttribute('hidden')).toBe(true)
    expect(shadow.querySelector('[data-version]')?.hasAttribute('hidden')).toBe(true)
    // 空公告不注入（避免留下空容器内容）
    expect(shadow.querySelector('[data-announcement]')?.innerHTML).toBe('')

    panel.destroy()
  })

  it('导出按钮格式后缀随 renderSearch 的 format 变化（.CSV/.JSON/.XLSX）', async () => {
    const panel = new MapsPanel({
      onStart: () => undefined,
      onPause: () => undefined,
      onResume: () => undefined,
      onExport: () => undefined,
      onReset: () => undefined,
      onStartReviews: () => undefined,
      onStartPhotos: () => undefined,
      onOpenPricing: () => undefined
    })
    document.body.innerHTML = '<div role="main"></div>'
    await panel.mount('body', 'div[role=main]')

    panel.renderSearch({ status: 'complete', count: 20, limit: 20, format: 'csv' })
    const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
    const exportButton = shadow.querySelector('[data-primary]')!
    expect(exportButton.textContent).toContain('CSV')
    expect(exportButton.textContent).toContain('20')

    panel.renderSearch({ status: 'complete', count: 20, limit: 20, format: 'json' })
    expect(exportButton.textContent).toContain('JSON')

    panel.renderSearch({ status: 'complete', count: 20, limit: 20, format: 'xlsx' })
    expect(exportButton.textContent).toContain('XLSX')

    panel.destroy()
  })
})
