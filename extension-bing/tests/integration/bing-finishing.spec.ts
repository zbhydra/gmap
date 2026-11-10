/**
 * 完成边沿「补全中」集成测试（016 E6）。
 *
 * 真实 collector + gate + enrichClient + BingPanel，只替身 content → background 的 RPC
 * 边界。真实 Bing 主路径见 e2e/real-bing-signed-in.spec.ts；这里覆盖真实界面造不出的分支：
 * 批次失败、门控失败、收尾异常与批次进度逐步推进，证明 Export / Go Back 首帧即锁定且一定放行。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import enUS from '@/locales/en-US.json'
import TRANSLATIONS from '@/locales/messages'
import { PRO_ENHANCEMENT_PLACEHOLDER } from '@/sites/bing/content/parser'
import type { BingCollectState, BingCollector } from '@/sites/bing/content/collector'
import type { BingGateState } from '@/sites/bing/content/gate'
import type { EnrichBusinessInput, EnrichResponse } from '@/sites/bing/enrich/types'

const rpc = vi.hoisted(() => ({
  checkPluginVersion: vi.fn(),
  getBingUsage: vi.fn().mockResolvedValue({ used: 0, total: 100000, period: '2026-11', exhausted: false, identity: 'user:1' }),
  reportBingUsage: vi.fn().mockResolvedValue(undefined),
  getGateState: vi.fn<() => Promise<BingGateState>>(),
  enrichBusinesses: vi.fn<
    (params: { businesses: EnrichBusinessInput[] }) => Promise<EnrichResponse>
  >(),
  recordMark: vi.fn<() => Promise<{ recorded: boolean }>>()
}))

const download = vi.hoisted(() => ({ file: vi.fn<(content: BlobPart) => void>() }))

vi.mock('@/content/rpc/background.rpc', () => ({
  BackgroundChannel: class {
    checkPluginVersion = rpc.checkPluginVersion
    getGateState = rpc.getGateState
    getBingUsage = rpc.getBingUsage
    reportBingUsage = rpc.reportBingUsage
    enrichBusinesses = rpc.enrichBusinesses
    recordMark = rpc.recordMark
    destroy(): void {}
  }
}))

vi.mock('@/sites/bing/content/export/download', () => ({ downloadFile: download.file }))

const PRO: BingGateState = { authenticated: true, isPro: true }
const FREE: BingGateState = { authenticated: true, isPro: false }
const ANONYMOUS: BingGateState = { authenticated: false, isPro: false }

const FINISHING_TEXT = 'Finishing up…'
const CONTACTS_TEXT = 'Adding emails & social links'

/** 单元测试手动结算的 RPC 响应。 */
function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason: Error) => void
} {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/** 排空收尾异步链并等面板落盘。 */
async function settle(): Promise<void> {
  await flushPromises()
  await nextTick()
}

/** 按入参构造逐目标命中的补全响应。 */
function enrichedResponse(businesses: EnrichBusinessInput[]): EnrichResponse {
  return {
    results: businesses.map(business => ({
      key: new URL(business.website).hostname,
      emails: [`owner@${new URL(business.website).hostname}`],
      medias: {}
    })),
    partial: false
  }
}

/** 渲染真实 Bing legacy 形态列表（collector 从 data-entity 解析）。 */
function renderList(rowCount: number, withWebsite: boolean): void {
  const list = document.createElement('div')
  list.className = 'b_vList'
  for (let id = 0; id < rowCount; id++) {
    const item = document.createElement('a')
    item.className = 'listings-item'
    item.setAttribute(
      'data-entity',
      JSON.stringify({
        entity: {
          id: `place-${id}`,
          title: `Place ${id}`,
          ...(withWebsite ? { website: `https://site-${id}.example` } : {})
        }
      })
    )
    list.append(item)
  }
  document.body.replaceChildren(list)
}

/** 当前用例的面板装配（afterEach 统一卸载）。 */
interface PanelHarness {
  collector: BingCollector
  wrapper: VueWrapper
  /** 面板之外独立记录的全部状态快照（证明不存在可导出的中间帧）。 */
  snapshots: BingCollectState[]
}

let harness: PanelHarness | null = null

async function mountPanel(rowCount: number, withWebsite = true): Promise<PanelHarness> {
  // gate 模块级快照按用例隔离：每次都从匿名初始快照起步
  vi.resetModules()
  const { BingCollector } = await import('@/sites/bing/content/collector')
  const gate = await import('@/sites/bing/content/gate')
  const { default: BingPanel } = await import('@/sites/bing/content/panel/BingPanel.vue')
  renderList(rowCount, withWebsite)
  const collector = new BingCollector(gate.createBingStopPolicy())
  const snapshots: BingCollectState[] = []
  collector.subscribe(state => {
    snapshots.push(state)
  })
  const i18n = createI18n({ legacy: false, locale: 'en-US', messages: { 'en-US': enUS } })
  const wrapper = mount(BingPanel, { props: { collector }, global: { plugins: [i18n] } })
  harness = { collector, wrapper, snapshots }
  return harness
}

function button(wrapper: VueWrapper, label: string) {
  const found = wrapper.findAll('button').find(item => item.text().startsWith(label))
  if (!found) {
    throw new Error(`面板缺少按钮: label=${label}, text=${wrapper.text()}`)
  }
  return found
}

function firstCompleted(snapshots: readonly BingCollectState[]): BingCollectState | undefined {
  return snapshots.find(state => state.phase === 'completed')
}

function expectLocked(wrapper: VueWrapper): void {
  expect(button(wrapper, 'Export Leads List').element.disabled).toBe(true)
  expect(button(wrapper, 'Go Back').element.disabled).toBe(true)
  expect(wrapper.find('[role="status"]').exists()).toBe(true)
}

function expectReleased(wrapper: VueWrapper): void {
  expect(button(wrapper, 'Export Leads List').element.disabled).toBe(false)
  expect(button(wrapper, 'Go Back').element.disabled).toBe(false)
  expect(wrapper.find('[role="status"]').exists()).toBe(false)
}

/** Start 后等首轮解析入列（Pro 无上限，采集持续到 Stop）。 */
async function startUntilFound(panel: PanelHarness, count: number): Promise<void> {
  await button(panel.wrapper, 'Start Extraction').trigger('click')
  await vi.waitFor(() => {
    expect(panel.collector.getState().foundCount).toBe(count)
  })
  await nextTick()
}

/** 经面板下拉导出 CSV，返回写入下载的文本。 */
async function exportCsv(wrapper: VueWrapper): Promise<string> {
  await button(wrapper, 'Export Leads List').trigger('click')
  await button(wrapper, 'Download data to csv').trigger('click')
  return String(download.file.mock.lastCall?.[0])
}

function enrichedColumns(panel: PanelHarness): string[] {
  return panel.collector
    .getRows()
    .flatMap(row => [row.emails, row.socialMedias, row.facebook, row.instagram, row.twitter])
}

beforeEach(() => {
  rpc.checkPluginVersion.mockReset().mockResolvedValue({ status: 'current', update: null })
  rpc.getBingUsage.mockReset().mockResolvedValue({ used: 0, total: 100000, period: '2026-11', exhausted: false, identity: 'user:1' })
  rpc.reportBingUsage.mockReset().mockResolvedValue(undefined)
  rpc.getGateState.mockReset()
  rpc.enrichBusinesses.mockReset()
  rpc.recordMark.mockReset().mockResolvedValue({ recorded: true })
  download.file.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  harness?.collector.destroy()
  harness?.wrapper.unmount()
  harness = null
})

describe('完成边沿补全中', () => {
  it('Pro：Stop 首帧锁定 → 门控确认 → 批次进度 → 放行并导出补全结果', async () => {
    rpc.getGateState.mockResolvedValue(PRO)
    const panel = await mountPanel(52)
    await startUntilFound(panel, 52)

    const gateCheck = deferred<BingGateState>()
    const batches = [deferred<EnrichResponse>(), deferred<EnrichResponse>()]
    rpc.getGateState.mockReturnValue(gateCheck.promise)
    rpc.enrichBusinesses
      .mockReturnValueOnce(batches[0].promise)
      .mockReturnValueOnce(batches[1].promise)

    await button(panel.wrapper, 'Stop').trigger('click')

    // phase 与锁定同一快照广播：不存在「已完成且可导出」的中间帧
    expect(firstCompleted(panel.snapshots)?.finishing).toEqual({ done: 0, total: 0 })
    expect(panel.wrapper.text()).toContain('Manually stopped.')
    expectLocked(panel.wrapper)
    expect(panel.wrapper.find('[role="status"]').text()).toContain(FINISHING_TEXT)

    gateCheck.resolve(PRO)
    await settle()
    expectLocked(panel.wrapper)
    expect(panel.wrapper.find('[role="status"]').text()).toContain(CONTACTS_TEXT)
    expect(panel.wrapper.find('[role="status"]').text()).toContain('0 of 52 websites checked')
    // 批次期间占位已清，但结果未回填：这正是旧实现会被导出的空列窗口
    expect(panel.collector.getRows()[0].emails).toBe('')

    const firstBatch = rpc.enrichBusinesses.mock.calls[0][0].businesses
    expect(firstBatch).toHaveLength(50)
    batches[0].resolve(enrichedResponse(firstBatch))
    await settle()
    expectLocked(panel.wrapper)
    expect(panel.wrapper.find('[role="status"]').text()).toContain('50 of 52 websites checked')

    const secondBatch = rpc.enrichBusinesses.mock.calls[1][0].businesses
    expect(secondBatch).toHaveLength(2)
    batches[1].resolve(enrichedResponse(secondBatch))
    await settle()
    expectReleased(panel.wrapper)
    expect(panel.collector.getState().finishing).toBeNull()

    const csv = await exportCsv(panel.wrapper)
    expect(csv).toContain('owner@site-51.example')
    expect(csv).not.toContain(PRO_ENHANCEMENT_PLACEHOLDER)
  })

  it('补全批次全部失败：收敛为空列后放行导出', async () => {
    rpc.getGateState.mockResolvedValue(PRO)
    rpc.enrichBusinesses.mockRejectedValue(new Error('rpc timeout'))
    const panel = await mountPanel(3)
    await startUntilFound(panel, 3)

    await button(panel.wrapper, 'Stop').trigger('click')
    expectLocked(panel.wrapper)
    await settle()

    expect(rpc.enrichBusinesses).toHaveBeenCalledTimes(1)
    expectReleased(panel.wrapper)
    expect(enrichedColumns(panel).every(column => column === '')).toBe(true)
    expect(await exportCsv(panel.wrapper)).not.toContain(PRO_ENHANCEMENT_PLACEHOLDER)
  })

  it.each([
    ['免费', FREE],
    ['匿名', ANONYMOUS]
  ])('%s：达限完成先锁定确认门控，放行后保持 PRO 占位且不发补全', async (_label, gateState) => {
    const gateCheck = deferred<BingGateState>()
    rpc.getGateState.mockResolvedValueOnce(gateState).mockReturnValue(gateCheck.promise)
    const panel = await mountPanel(22)

    await button(panel.wrapper, 'Start Extraction').trigger('click')
    await vi.waitFor(() => {
      expect(panel.collector.getState().phase).toBe('completed')
    })
    await nextTick()

    expect(firstCompleted(panel.snapshots)).toMatchObject({
      freeLimitReached: true,
      foundCount: 20,
      finishing: { done: 0, total: 0 }
    })
    expectLocked(panel.wrapper)
    // 门控未确认前不能向免费用户宣称正在补全联系方式
    expect(panel.wrapper.text()).toContain(FINISHING_TEXT)
    expect(panel.wrapper.text()).not.toContain(CONTACTS_TEXT)

    gateCheck.resolve(gateState)
    await settle()

    expectReleased(panel.wrapper)
    expect(rpc.enrichBusinesses).not.toHaveBeenCalled()
    expect(enrichedColumns(panel).every(column => column === PRO_ENHANCEMENT_PLACEHOLDER)).toBe(
      true
    )
  })

  it('Pro 无补全目标：不发请求，清占位后放行', async () => {
    rpc.getGateState.mockResolvedValue(PRO)
    const panel = await mountPanel(3, false)
    await startUntilFound(panel, 3)

    await button(panel.wrapper, 'Stop').trigger('click')
    expectLocked(panel.wrapper)
    await settle()

    expect(rpc.enrichBusinesses).not.toHaveBeenCalled()
    expectReleased(panel.wrapper)
    expect(enrichedColumns(panel).every(column => column === '')).toBe(true)
  })

  it.each([
    ['Pro 快照沿用并继续补全', PRO, 1, ''],
    ['免费快照沿用并保持占位', FREE, 0, PRO_ENHANCEMENT_PLACEHOLDER]
  ])('门控刷新失败：%s，最终放行', async (_label, snapshot, enrichCalls, column) => {
    rpc.getGateState.mockResolvedValue(snapshot)
    rpc.enrichBusinesses.mockImplementation(async ({ businesses }) => ({
      results: businesses.map(() => ({ key: '', emails: [], medias: {} })),
      partial: false
    }))
    const panel = await mountPanel(3)
    await startUntilFound(panel, 3)

    rpc.getGateState.mockRejectedValue(new Error('gate rpc down'))
    await button(panel.wrapper, 'Stop').trigger('click')
    expectLocked(panel.wrapper)
    await settle()

    expect(rpc.enrichBusinesses).toHaveBeenCalledTimes(enrichCalls)
    expectReleased(panel.wrapper)
    expect(enrichedColumns(panel).every(value => value === column)).toBe(true)
  })

  it('收尾链路抛出未预期异常：finally 仍然放行', async () => {
    rpc.getGateState.mockResolvedValue(PRO)
    const panel = await mountPanel(3)
    await startUntilFound(panel, 3)
    panel.collector.subscribe(state => {
      if (state.finishing !== null && state.finishing.total > 0) {
        throw new Error('progress listener boom')
      }
    })

    await button(panel.wrapper, 'Stop').trigger('click')
    expectLocked(panel.wrapper)
    await settle()

    expect(panel.collector.getState().finishing).toBeNull()
    expectReleased(panel.wrapper)
  })

  it('补全中点击守卫：disabled 被移除也不能导出或返回待命', async () => {
    rpc.getGateState.mockResolvedValue(PRO)
    const panel = await mountPanel(3)
    await startUntilFound(panel, 3)
    const gateCheck = deferred<BingGateState>()
    rpc.getGateState.mockReturnValue(gateCheck.promise)
    await button(panel.wrapper, 'Stop').trigger('click')
    rpc.recordMark.mockClear()

    for (const label of ['Export Leads List', 'Go Back']) {
      const target = button(panel.wrapper, label).element
      target.removeAttribute('disabled')
      target.click()
    }
    await nextTick()

    expect(panel.wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(panel.collector.getState().phase).toBe('completed')
    expect(rpc.recordMark).not.toHaveBeenCalled()
    // 状态机入口同样拒绝：补全写回中的行不能被清空
    panel.collector.reset()
    expect(panel.collector.getState().phase).toBe('completed')

    gateCheck.resolve(PRO)
    await settle()
    expect(panel.collector.getState().finishing).toBeNull()
  })

  it('放行后 Go Back 回待命，新一轮完成再次进入补全中', async () => {
    rpc.getGateState.mockResolvedValue(PRO)
    rpc.enrichBusinesses.mockImplementation(async ({ businesses }) =>
      enrichedResponse(businesses)
    )
    const panel = await mountPanel(3)
    await startUntilFound(panel, 3)
    await button(panel.wrapper, 'Stop').trigger('click')
    await settle()
    expectReleased(panel.wrapper)

    await button(panel.wrapper, 'Go Back').trigger('click')
    expect(panel.collector.getState().phase).toBe('idle')

    await startUntilFound(panel, 3)
    await button(panel.wrapper, 'Stop').trigger('click')
    expectLocked(panel.wrapper)
    await settle()
    expectReleased(panel.wrapper)
    expect(rpc.enrichBusinesses).toHaveBeenCalledTimes(2)
  })

  it('自动收敛（连续零增长）：首帧同样锁定，收尾后放行', async () => {
    rpc.getGateState.mockResolvedValue(PRO)
    rpc.enrichBusinesses.mockImplementation(async ({ businesses }) =>
      enrichedResponse(businesses)
    )
    const panel = await mountPanel(3)
    vi.useFakeTimers()

    await button(panel.wrapper, 'Start Extraction').trigger('click')
    // 包内默认：连续 12 轮零增长 × 无翻页按钮时每轮 500ms
    await vi.advanceTimersByTimeAsync(12 * 500)
    await nextTick()

    expect(firstCompleted(panel.snapshots)?.finishing).toEqual({ done: 0, total: 0 })
    expect(panel.wrapper.text()).toContain('Search complete.')
    expect(panel.collector.getState().finishing).toBeNull()
    expectReleased(panel.wrapper)
    expect(panel.collector.getRows()[2].emails).toBe('owner@site-2.example')
    expect(rpc.reportBingUsage).toHaveBeenCalledWith(expect.objectContaining({ records: 3 }))
  })
})

describe('月用量面板提示', () => {
  it.each(['exhausted', 'unavailable'] as const)('%s 回待命并提示，不采集或上报', async reason => {
    rpc.getGateState.mockResolvedValue(FREE)
    if (reason === 'exhausted') {
      rpc.getBingUsage.mockResolvedValue({ used: 1000, total: 1000, exhausted: true })
    } else {
      rpc.getBingUsage.mockRejectedValue(new Error('usage offline'))
    }
    const panel = await mountPanel(22, false)
    await button(panel.wrapper, 'Start Extraction').trigger('click')
    await settle()
    expect(panel.collector.getState()).toMatchObject({ phase: 'idle', foundCount: 0, usageNotice: reason })
    expect(panel.wrapper.get('[role="alert"]').text()).toContain(
      reason === 'exhausted' ? 'monthly record quota is used up' : 'Please try starting again'
    )
    expect(rpc.reportBingUsage).not.toHaveBeenCalled()
  })

  it('上报失败可导出；Retry 只补报同一会话，不重新采集或补全', async () => {
    rpc.getGateState.mockResolvedValue(FREE)
    rpc.reportBingUsage.mockRejectedValueOnce(new Error('report offline'))
    const panel = await mountPanel(22, false)
    await button(panel.wrapper, 'Start Extraction').trigger('click')
    await settle()
    expectReleased(panel.wrapper)
    expect(panel.wrapper.text()).toContain('Could not save usage')
    await button(panel.wrapper, 'Retry').trigger('click')
    await settle()
    expect(rpc.reportBingUsage).toHaveBeenCalledTimes(2)
    expect(rpc.reportBingUsage.mock.calls[0]).toEqual(rpc.reportBingUsage.mock.calls[1])
    expect(panel.wrapper.text()).not.toContain('Could not save usage')
    expect(panel.collector.getState().foundCount).toBe(20)
    expect(rpc.enrichBusinesses).not.toHaveBeenCalled()
  })
})

describe('补全中文案', () => {
  it.each(Object.entries(TRANSLATIONS))('%s 覆盖全部键且保留进度占位符', (_locale, messages) => {
    const K = I18N_KEYS.BING_PANEL
    expect(messages[K.MONTHLY_EXHAUSTED]).toBeTruthy()
    expect(messages[K.USAGE_UNAVAILABLE]).toBeTruthy()
    expect(messages[K.USAGE_REPORT_FAILED]).toBeTruthy()
    expect(messages[K.FINISHING]).toBeTruthy()
    expect(messages[K.CONTACTS_TITLE]).toBeTruthy()
    expect(messages[K.CONTACTS_PROGRESS]).toContain('{done}')
    expect(messages[K.CONTACTS_PROGRESS]).toContain('{total}')
    for (const key of Object.values(I18N_KEYS.PLUGIN_VERSION)) {
      expect(messages[key]).toBeTruthy()
    }
    expect(messages[I18N_KEYS.PLUGIN_VERSION.UPDATE_AVAILABLE]).toContain('{version}')
  })
})

describe('版本门控', () => {
  it('普通新版显示版本和下载地址，仍可采集；采集中禁用不影响完成与导出', async () => {
    rpc.getGateState.mockResolvedValue(PRO)
    rpc.checkPluginVersion.mockResolvedValue({
      status: 'update_available', update: { version: '2.0.0', url: 'https://example.com/update' }
    })
    const panel = await mountPanel(3, false)
    await startUntilFound(panel, 3)
    expect(panel.wrapper.text()).toContain('Version 2.0.0 is available.')
    expect(panel.wrapper.get('a[href="https://example.com/update"]').text()).toBe('Download update')
    rpc.checkPluginVersion.mockResolvedValue({ status: 'disabled', update: null })
    await panel.collector.checkPluginVersion()
    expect(panel.collector.getState().phase).toBe('collecting')
    await button(panel.wrapper, 'Stop').trigger('click')
    await settle()
    expectReleased(panel.wrapper)
    expect(await exportCsv(panel.wrapper)).toContain('Place 0')
  })

  it.each(['disabled', 'failure', 'invalid'])('%s 拒绝新采集，重试后可恢复', async result => {
    rpc.getGateState.mockResolvedValue(FREE)
    const panel = await mountPanel(22, false)
    if (result === 'failure') rpc.checkPluginVersion.mockRejectedValue(new Error('version offline'))
    else rpc.checkPluginVersion.mockResolvedValue({ status: result, update: null })
    await button(panel.wrapper, 'Start Extraction').trigger('click')
    await settle()
    expect(panel.collector.getState()).toMatchObject({ phase: 'idle', foundCount: 0 })
    expect(rpc.getBingUsage).not.toHaveBeenCalled()
    expect(panel.wrapper.text()).toContain(result === 'disabled' ? 'This version is disabled.' : 'Could not check this version.')
    if (result === 'disabled') expect(panel.wrapper.text()).toContain('No update is available.')
    rpc.checkPluginVersion.mockResolvedValue({ status: 'current', update: null })
    await button(panel.wrapper, 'Retry').trigger('click')
    await settle()
    await button(panel.wrapper, 'Start Extraction').trigger('click')
    await settle()
    expect(panel.collector.getState()).toMatchObject({ phase: 'completed', foundCount: 20 })
    expect(rpc.checkPluginVersion).toHaveBeenCalledTimes(3)
  })

  it('已打开页面的新开始仍现查，完成结果可在禁用提示下导出', async () => {
    rpc.getGateState.mockResolvedValue(FREE)
    const panel = await mountPanel(22, false)
    await button(panel.wrapper, 'Start Extraction').trigger('click')
    await settle()
    rpc.checkPluginVersion.mockResolvedValue({ status: 'disabled', update: null })
    await panel.collector.checkPluginVersion()
    await nextTick()
    expect(await exportCsv(panel.wrapper)).toContain('Place 0')
    await button(panel.wrapper, 'Go Back').trigger('click')
    const checksBefore = rpc.checkPluginVersion.mock.calls.length
    await button(panel.wrapper, 'Start Extraction').trigger('click')
    await settle()
    expect(rpc.checkPluginVersion).toHaveBeenCalledTimes(checksBefore + 1)
    expect(panel.collector.getState()).toMatchObject({ phase: 'idle', foundCount: 0 })
    expect(rpc.getBingUsage).toHaveBeenCalledTimes(1)
  })
})
