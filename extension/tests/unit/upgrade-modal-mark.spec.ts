/** 升级弹窗每次进入显示状态时广播一次打点事件。 */

import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import UpgradeModal from '@/core/content/components/UpgradeModal.vue'

const mocks = vi.hoisted(() => ({
  emit: vi.fn()
}))

vi.mock('@/core/rpc/ChromeEventBus', () => ({
  ChromeEventEmitter: class {
    emit = mocks.emit
  }
}))

/** 创建带最小翻译上下文的升级弹窗。 */
function mountUpgradeModal(show: boolean, resetAt = 0): VueWrapper {
  const i18n = createI18n({
    legacy: false,
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages: {
      'en-US': {
        'quota.upgradeTitle': 'Upgrade',
        'quota.upgradeMessage': 'Daily quota reached',
        'quota.upgradeButton': 'Upgrade now',
        'quota.resetInHoursMinutes': 'Next refresh in {hours}h {minutes}m',
        'quota.resetInHours': 'Next refresh in {hours}h',
        'quota.resetInMinutes': 'Next refresh in {minutes}m',
        'quota.resetReady': 'Refreshing download limit',
        'quota.resetAt': 'Next refresh: {time}',
        'app.error.dismiss': 'Close'
      }
    }
  })

  return mount(UpgradeModal, {
    props: { show, resetAt, useTeleport: false },
    global: {
      plugins: [i18n],
      stubs: { Icon: true }
    }
  })
}

describe('UpgradeModal SLS event', () => {
  let wrapper: VueWrapper | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime('2026-08-13T10:00:00.000Z')
    mocks.emit.mockReset()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.useRealTimers()
  })

  it('broadcasts once for each hidden-to-visible transition', async () => {
    wrapper = mountUpgradeModal(false)
    expect(mocks.emit).not.toHaveBeenCalled()

    await wrapper.setProps({ show: true })
    expect(mocks.emit).toHaveBeenCalledTimes(1)
    expect(mocks.emit).toHaveBeenLastCalledWith('upgradeModalOpened', undefined)

    await wrapper.setProps({ show: true })
    expect(mocks.emit).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ show: false })
    await wrapper.setProps({ show: true })
    expect(mocks.emit).toHaveBeenCalledTimes(2)
  })

  it('broadcasts when mounted already visible', () => {
    wrapper = mountUpgradeModal(true)

    expect(mocks.emit).toHaveBeenCalledOnce()
    expect(mocks.emit).toHaveBeenCalledWith('upgradeModalOpened', undefined)
  })

  it('renders the refresh prompt between the limit message and upgrade action', () => {
    const resetAt = Date.now() + 88 * 60_000
    wrapper = mountUpgradeModal(true, resetAt)

    const prompt = wrapper.find('.tg-dl-upgrade-modal-reset')
    expect(prompt.find('.tg-dl-upgrade-modal-reset-countdown').text()).toBe(
      'Next refresh in 1h 28m'
    )
    expect(prompt.find('.tg-dl-upgrade-modal-reset-time').text()).toContain('Next refresh:')

    const contentClasses = Array.from(
      wrapper.find('.tg-dl-upgrade-modal-content').element.children
    ).map(element => element.className)
    expect(contentClasses).toEqual([
      'tg-dl-upgrade-modal-icon',
      'tg-dl-upgrade-modal-title',
      'tg-dl-upgrade-modal-message',
      'tg-dl-upgrade-modal-reset',
      'tg-dl-upgrade-modal-btn'
    ])
  })

  it('旧后端未提供刷新时间时仍显示额度不足弹窗', () => {
    wrapper = mountUpgradeModal(true)

    expect(wrapper.find('.tg-dl-upgrade-modal-container').exists()).toBe(true)
    expect(wrapper.find('.tg-dl-upgrade-modal-reset').exists()).toBe(false)
  })

  it('switches from minute countdown to the refresh-in-progress state', async () => {
    const resetAt = Date.now() + 28 * 60_000
    wrapper = mountUpgradeModal(true, resetAt)

    expect(wrapper.find('.tg-dl-upgrade-modal-reset-countdown').text()).toBe(
      'Next refresh in 28m'
    )

    vi.setSystemTime(resetAt)
    await vi.advanceTimersByTimeAsync(30_000)
    expect(wrapper.find('.tg-dl-upgrade-modal-reset-countdown').text()).toBe(
      'Refreshing download limit'
    )
  })
})
