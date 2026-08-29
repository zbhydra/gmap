/** Background 统一订阅升级弹窗事件并写入 SLS。 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExtensionMarkReporter } from '@/background/services/ExtensionMarkReporter'
import { MARK_TYPE } from '@/core/api/mark/types'

const mocks = vi.hoisted(() => ({
  eventOn: vi.fn(),
  eventDestroy: vi.fn(),
  unsubscribe: vi.fn(),
  recordMark: vi.fn(),
  loggerError: vi.fn()
}))

vi.mock('@/core/rpc/ChromeEventBus', () => ({
  ChromeEventSubscriber: class {
    on = mocks.eventOn
    destroy = mocks.eventDestroy
  }
}))

vi.mock('@/core/api/mark', () => ({
  markApi: { record: mocks.recordMark }
}))

vi.mock('@/core/utils/logger', () => ({
  logger: { error: mocks.loggerError }
}))

describe('ExtensionMarkReporter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.eventOn.mockReturnValue(mocks.unsubscribe)
    mocks.recordMark.mockResolvedValue({ recorded: true })
  })

  it('subscribes once and records upgrade_modal_open', () => {
    const reporter = new ExtensionMarkReporter()
    reporter.setup()
    reporter.setup()

    expect(mocks.eventOn).toHaveBeenCalledOnce()
    expect(mocks.eventOn).toHaveBeenCalledWith('upgradeModalOpened', expect.any(Function))

    const handleUpgradeModalOpened = mocks.eventOn.mock.calls[0]?.[1] as () => void
    handleUpgradeModalOpened()

    expect(mocks.recordMark).toHaveBeenCalledOnce()
    expect(mocks.recordMark).toHaveBeenCalledWith(MARK_TYPE.UPGRADE_MODAL_OPEN)

    reporter.destroy()
    expect(mocks.unsubscribe).toHaveBeenCalledOnce()
    expect(mocks.eventDestroy).toHaveBeenCalledOnce()
  })

  it('logs SLS failures without throwing into the event handler', async () => {
    const error = new Error('controlled SLS failure')
    mocks.recordMark.mockRejectedValue(error)
    const reporter = new ExtensionMarkReporter()
    reporter.setup()

    const handleUpgradeModalOpened = mocks.eventOn.mock.calls[0]?.[1] as () => void
    expect(() => handleUpgradeModalOpened()).not.toThrow()
    await Promise.resolve()

    expect(mocks.loggerError).toHaveBeenCalledWith(
      '[ExtensionMarkReporter] 升级弹窗 SLS 打点失败:',
      error
    )

    reporter.destroy()
  })
})
