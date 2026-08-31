/**
 * 远端运营通道单元测试（013 A12，U6 验收行为直接覆盖）：
 * - 版本比较纯函数（相等/大于/小于/段数不齐/脏数据）；
 * - 新版本提示判定（minPluginVersion > 本地版本）；
 * - 面板运营区渲染：公告 innerHTML 注入、版本提示出现、空公告隐藏；
 * - 导出按钮格式后缀随用户设置变化。
 */

import { describe, expect, it } from 'vitest'

import { MapsPanel } from '../../src/sites/maps/content/panel/mapsPanel'
import { compareVersions, isNewVersionAvailable } from '../../src/sites/maps/config/operations'

describe('版本比较（compareVersions）', () => {
  it('相等返回 0', () => {
    expect(compareVersions('0.1.0', '0.1.0')).toBe(0)
  })

  it('逐段数值比较：大于/小于', () => {
    expect(compareVersions('99.0.0', '0.1.0')).toBeGreaterThan(0)
    expect(compareVersions('0.1.0', '99.0.0')).toBeLessThan(0)
    expect(compareVersions('0.2.0', '0.1.9')).toBeGreaterThan(0)
    expect(compareVersions('0.1.10', '0.1.9')).toBeGreaterThan(0)
  })

  it('段数不齐补 0：1.0 与 1.0.0 等价', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0)
    expect(compareVersions('1', '0.9.9')).toBeGreaterThan(0)
  })

  it('脏数据容错：非数字段按 0，不抛错', () => {
    expect(compareVersions('1.a.3', '1.0.3')).toBe(0)
    expect(compareVersions('abc', '0.0.1')).toBeLessThan(0)
  })
})

describe('新版本提示判定（isNewVersionAvailable）', () => {
  it('远端版本大于本地版本时提示', () => {
    expect(isNewVersionAvailable('99.0.0', '0.1.0')).toBe(true)
  })

  it('远端版本等于或小于本地版本时不提示', () => {
    expect(isNewVersionAvailable('0.1.0', '0.1.0')).toBe(false)
    expect(isNewVersionAvailable('0.0.9', '0.1.0')).toBe(false)
  })

  it('远端或本地版本为空串不提示（运营未配置）', () => {
    expect(isNewVersionAvailable('', '0.1.0')).toBe(false)
    expect(isNewVersionAvailable('99.0.0', '')).toBe(false)
  })
})

describe('面板运营区渲染（renderOperations）', () => {
  it('公告存在时 innerHTML 注入公告区，版本提示出现', async () => {
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
      announcementHtml: '<p class="gme-test-announcement">Welcome to MapsGrab!</p>',
      newVersionAvailable: true
    })

    const host = document.getElementById('gmap-extractor-panel-host')
    expect(host).not.toBeNull()
    const shadow = host!.shadowRoot
    expect(shadow).not.toBeNull()

    // 公告 HTML 注入（竞品同构）且容器可见
    const announcement = shadow!.querySelector('.gme-test-announcement')
    expect(announcement).not.toBeNull()
    const announcementBox = shadow!.querySelector('.panel-announcement')
    expect(announcementBox?.classList.contains('visible')).toBe(true)

    // 版本提示行可见且有文案
    const notice = shadow!.querySelector('.panel-version-notice')
    expect(notice?.classList.contains('visible')).toBe(true)
    expect(notice?.textContent?.length).toBeGreaterThan(0)

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

    panel.renderOperations({ announcementHtml: '', newVersionAvailable: false })

    const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
    expect(shadow.querySelector('.panel-announcement')?.classList.contains('visible')).toBe(false)
    expect(shadow.querySelector('.panel-version-notice')?.classList.contains('visible')).toBe(false)
    // 空公告不注入（避免留下空容器内容）
    expect(shadow.querySelector('.panel-announcement')?.innerHTML).toBe('')

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

    panel.renderSearch({ status: 'complete', count: 20, format: 'csv' })
    const shadow = document.getElementById('gmap-extractor-panel-host')!.shadowRoot!
    const exportButton = shadow.querySelector('.panel-actions .panel-button-primary')!
    expect(exportButton.textContent).toContain('(.CSV)')
    expect(exportButton.textContent).toContain('20')

    panel.renderSearch({ status: 'complete', count: 20, format: 'json' })
    expect(exportButton.textContent).toContain('(.JSON)')

    panel.renderSearch({ status: 'complete', count: 20, format: 'xlsx' })
    expect(exportButton.textContent).toContain('(.XLSX)')

    panel.destroy()
  })
})
