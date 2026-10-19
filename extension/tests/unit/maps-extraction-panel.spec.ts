import { describe, expect, it, vi } from 'vitest'
import { I18N_KEYS } from '@/core/constants/i18n'
import { I18nService, i18nReady } from '@/locales'
import { ExtractionPanel } from '@/sites/maps/content/panel/extractionPanel'

const K = I18N_KEYS.MAPS_PANEL

describe('评论与照片工作面板', () => {
  it('提前停止保留导出入口；空结果没有导出按钮', async () => {
    await i18nReady
    const onExport = vi.fn()
    const panel = new ExtractionPanel('work-states-test', K.REVIEWS_EXPORT, {
      onExport,
      onReset: async () => undefined
    })
    await panel.mount()
    try {
      const shadow = document.getElementById('work-states-test')!.shadowRoot!
      const primary = shadow.querySelector<HTMLButtonElement>('[data-primary]')!
      panel.render({ status: 'stopped', count: 7, format: 'csv' })
      expect(shadow.querySelector('.mgp-status')?.getAttribute('data-state')).toBe('stopped')
      expect(primary.hidden).toBe(false)
      primary.click()
      expect(onExport).toHaveBeenCalledOnce()
      expect(primary.querySelector('.is-active')?.textContent).toBe(I18nService.t(K.EXPORTED))
      panel.render({ status: 'empty', count: 0, format: 'csv' })
      expect(primary.hidden).toBe(true)
      expect(shadow.querySelector('[data-state-label]')?.textContent).toBe(
        I18nService.t(K.NO_REVIEWS)
      )
    } finally {
      panel.destroy()
    }
  })

  it('重查额度期间禁止 Export 与重复 Reset，额度仍不足时保留旧结果', async () => {
    let release: () => void = () => undefined
    const pending = new Promise<void>(resolve => {
      release = resolve
    })
    const onExport = vi.fn()
    const onReset = vi.fn(async () => {
      await pending
      panel.setError('quota')
    })
    const panel = new ExtractionPanel('work-reset-test', K.REVIEWS_EXPORT, { onExport, onReset })
    await panel.mount()
    panel.render({ status: 'complete', count: 7, format: 'csv' })
    const shadow = document.getElementById('work-reset-test')!.shadowRoot!
    const reset = shadow.querySelector<HTMLButtonElement>('[data-secondary]')!
    const primary = shadow.querySelector<HTMLButtonElement>('[data-primary]')!
    try {
      reset.click()
      reset.click()
      primary.click()
      expect(onReset).toHaveBeenCalledOnce()
      expect(onExport).not.toHaveBeenCalled()
      expect(reset.getAttribute('aria-busy')).toBe('true')
      release()
      await vi.waitFor(() => expect(reset.getAttribute('aria-busy')).toBe('false'))
      expect(shadow.querySelector<HTMLElement>('.mgp-upgrade')!.hidden).toBe(false)
      expect(reset.hidden).toBe(true)
      expect(shadow.querySelector('[data-message]')?.textContent).toContain(
        I18nService.t(K.STILL_OUT)
      )
      expect(primary.querySelector('.is-active')?.textContent).toContain('7')
      expect(primary.getAttribute('aria-disabled')).toBe('false')
    } finally {
      panel.destroy()
    }
  })
})
