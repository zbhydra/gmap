/**
 * Bing Maps 采集状态机。
 *
 * 三态：待命（idle）→ 采集中（collecting）→ 完成（completed）。
 *
 * - 待命：每 detectPollMs（1.5s）轮询一次列表就绪（适配器探测 + 条目命中），
 *   就绪后面板 Start 可用（feat.md「主流程」步骤 1）。
 * - 采集中：主循环（竞品 FindingPage N() 同构，调研 §3）——解析当前列表容器
 *   outerHTML → parser 解析 → entity.id 去重累计 → 触发翻页（legacy 点翻页
 *   按钮；new 版优先 searchThisAreaButton、否则滚动容器到底）；翻页后等
 *   paginationDelayMs（2s），未翻页轮等 loopIntervalMs（500ms）。单条解析失败
 *   跳过并记日志（不静默、不中断整页）；连续 maxConsecutiveFailures（12）轮
 *   零增长自动完成。
 * - 停止：手动 Stop → completed（stoppedManually）；行数上限经
 *   BingStopPolicy 读取点每轮现读判定（U4 门控：免费档 freeRowLimit
 *   截断，Pro 无单次上限；两者均受共享月余额限制。
 * - 收尾：完成态的补全中子状态（013 同源交互）。进入完成即锁定 Export / Go Back，
 *   门控确认后 Pro 补全写回、免费/匿名跳过，结束或失败都放行。
 */

import { logger } from '@/core/utils/logger'
import { MARK_TYPE } from '@/core/api/mark/types'
import { getBingConfig } from '@/sites/bing/config/loader'
import type { BingAdapterConfig } from '@/sites/bing/config/contract'
import { detectAdapter, resolveElement, resolveItems } from './detector'
import { parseBingRow, type BingExportRow } from './parser'
import { recordContentMark } from './marks'
import { getGateState, refreshGateState } from './gate'
import { enrichRows } from '../enrich/enrichClient'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import type { BingUsageReport } from '../usage/types'
import { parsePluginVersionCheck, type PluginVersionCheck } from '@/core/api/plugin-version/types'

/** 面板主状态（三态）。 */
export type BingPanelPhase = 'idle' | 'collecting' | 'completed'

/** 完成态收尾进度（单位：按 website 去重后的补全目标数）。 */
export interface BingFinishingProgress {
  /** 已结束（含失败）的目标数。 */
  done: number
  /** 目标总数；0 = 门控确认中或无补全目标，面板不显示批次进度。 */
  total: number
}

/** 采集状态快照（面板渲染的唯一数据源）。 */
export interface BingCollectState {
  pluginVersion: PluginVersionCheck | null
  versionCheckFailed: boolean
  checkingVersion: boolean
  /** 主状态。 */
  phase: BingPanelPhase
  /** 当前命中适配器版本名（未探测到为 null）。 */
  adapterName: string | null
  /** 待命期列表就绪判定（true 时 Start 可用）。 */
  listDetected: boolean
  /** 已采集条数（去重后）。 */
  foundCount: number
  /** 是否因免费上限截断停止（完成态警告条依据）。 */
  freeLimitReached: boolean
  usageNotice: 'exhausted' | 'unavailable' | 'reportFailed' | null
  /** 是否手动停止（完成态文案依据）。 */
  stoppedManually: boolean
  /** 主循环连续零增长轮数（采集中区域提示依据）。 */
  failureStreak: number
  /**
   * 完成态收尾进度；非 null 时 Export / Go Back 等待（补全中）。与 phase=completed
   * 同一快照置位，面板不会渲染「已完成且可导出」的中间帧。
   */
  finishing: BingFinishingProgress | null
}

/** 停止条件读取点（实现见 ./gate 的 createBingStopPolicy；免费/Pro 门控经此注入）。 */
export interface BingStopPolicy {
  /** 单次采集行数上限；null = 无上限（Pro）。每次判定现读，远程改配置即生效。 */
  getRowLimit(): number | null
}

/** 状态变更订阅函数。 */
export type BingCollectListener = (state: BingCollectState) => void

/** 采集单轮结果。 */
interface CollectRoundResult {
  /** 本轮新增行数。 */
  newRows: number
  /** 本轮是否触达行数上限（立即完成）。 */
  limitHit: boolean
}

export class BingCollector {
  /** 状态快照。 */
  private state: BingCollectState = {
    pluginVersion: null,
    versionCheckFailed: false,
    checkingVersion: false,
    phase: 'idle',
    adapterName: null,
    listDetected: false,
    foundCount: 0,
    freeLimitReached: false,
    usageNotice: null,
    stoppedManually: false,
    failureStreak: 0,
    finishing: null
  }

  /** 去重后的累计行（导出数据源）。 */
  private rows: BingExportRow[] = []

  /** 去重键集合（entity.id，contract.parse.dedupeKey 语义）。 */
  private readonly seenIds = new Set<string>()

  /** 状态订阅者。 */
  private readonly listeners = new Set<BingCollectListener>()

  /** 待命检测轮询定时器。 */
  private detectTimer: number | null = null

  /**
   * 采集会话代号：start/stop/reset 递增，使 in-flight 异步循环醒来后自行退出，
   * 不再写状态（Stop 的即时生效机制）。
   */
  private generation = 0

  private monthlyRemaining = 0
  private usageReport: BingUsageReport | null = null

  /** 停止条件读取点。 */
  private readonly stopPolicy: BingStopPolicy

  constructor(stopPolicy: BingStopPolicy) {
    this.stopPolicy = stopPolicy
    this.startDetectionPolling()
  }

  /** 读取状态快照。 */
  getState(): BingCollectState {
    return this.state
  }

  /** 读取当前累计行（导出数据源）。 */
  getRows(): readonly BingExportRow[] {
    return this.rows
  }

  /** 当前行数上限是否生效（免费档）。false = 无上限（Pro），导出无末行提示。 */
  hasRowLimit(): boolean {
    return this.stopPolicy.getRowLimit() !== null
  }

  /** 订阅状态变更；返回取消订阅函数。 */
  subscribe(listener: BingCollectListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** 进入采集中：列表就绪等待 → 门控强刷 → search 打点 → 主循环。 */
  async start(): Promise<void> {
    if (this.state.phase !== 'idle' || this.state.checkingVersion) {
      return
    }
    const generation = ++this.generation
    if (!(await this.checkPluginVersion()) || generation !== this.generation) return
    this.usageReport = null
    this.updateState({
      phase: 'collecting',
      stoppedManually: false,
      freeLimitReached: false,
      usageNotice: null
    })

    const ready = await this.waitListReady(generation)
    if (generation !== this.generation) {
      return
    }
    if (!ready) {
      // 列表就绪超时：回待命，提示行引导用户先搜索（feat.md 异常分支）
      logger.error('[BingCollector] 列表就绪等待超时，回到待命')
      this.updateState({ phase: 'idle', listDetected: false })
      return
    }

    await refreshGateState({ force: true })
    if (generation !== this.generation) {
      return
    }

    const channel = new BackgroundChannel()
    try {
      const usage = await channel.getBingUsage()
      if (generation !== this.generation) return
      this.monthlyRemaining = Math.max(0, usage.total - usage.used)
      if (usage.exhausted || this.monthlyRemaining === 0) {
        this.updateState({ phase: 'idle', usageNotice: 'exhausted' })
        return
      }
      this.usageReport = {
        identity: usage.identity,
        requestId: crypto.randomUUID(),
        records: 0,
        createdAt: Date.now()
      }
    } catch (error) {
      logger.error('[BingCollector] 开始前月用量查询/补报失败，拒绝本次采集:', error)
      if (generation === this.generation) {
        this.updateState({ phase: 'idle', usageNotice: 'unavailable' })
      }
      return
    } finally {
      channel.destroy()
    }

    const adapterName = detectAdapter(getBingConfig().adapters)?.name ?? 'unknown'
    // 埋点表（feat.md）：search 含结果页形态（legacy/new）
    recordContentMark(MARK_TYPE.SEARCH, `version=${adapterName}`)

    await this.runLoop(generation)
  }

  /** 页面打开与每次新采集分别现查；失败只拒绝这次开始。 */
  async checkPluginVersion(): Promise<boolean> {
    if (this.state.checkingVersion) return false
    this.updateState({ checkingVersion: true })
    const channel = new BackgroundChannel()
    try {
      const pluginVersion = parsePluginVersionCheck(await channel.checkPluginVersion())
      this.updateState({ pluginVersion, versionCheckFailed: false })
      return pluginVersion.status !== 'disabled'
    } catch (error) {
      logger.error('[BingCollector] 版本检查失败，拒绝本次新采集:', error)
      this.updateState({ pluginVersion: null, versionCheckFailed: true })
      return false
    } finally {
      channel.destroy()
      this.updateState({ checkingVersion: false })
    }
  }

  /** 手动停止：使 in-flight 循环失效并立即进入完成态。 */
  stop(): void {
    if (this.state.phase !== 'collecting') {
      return
    }
    this.generation += 1
    this.complete({ stoppedManually: true, failureStreak: 0 })
  }

  /** 返回待命（Go Back）：清空本轮数据并恢复检测轮询。 */
  reset(): void {
    // 补全写回期间不能换代：旧会话的放行会提前解锁新一轮
    if (this.state.finishing !== null) {
      return
    }
    this.generation += 1
    this.rows = []
    this.seenIds.clear()
    this.updateState({
      phase: 'idle',
      foundCount: 0,
      freeLimitReached: false,
      stoppedManually: false,
      failureStreak: 0,
      usageNotice: null
    })
    this.detectTick()
  }

  /** 释放轮询定时器（页面卸载由浏览器回收，防御性入口供宿主清理）。 */
  destroy(): void {
    this.generation += 1
    if (this.detectTimer !== null) {
      window.clearInterval(this.detectTimer)
      this.detectTimer = null
    }
    this.listeners.clear()
  }

  /** 待命检测轮询（每 detectPollMs 一次；采集中空转，由主循环接管判定）。 */
  private startDetectionPolling(): void {
    if (this.detectTimer !== null) {
      return
    }
    this.detectTick()
    this.detectTimer = window.setInterval(() => {
      this.detectTick()
    }, getBingConfig().scrape.detectPollMs)
  }

  /** 单次检测：适配器探测 + 条目命中 → 列表就绪判定。 */
  private detectTick(): void {
    if (this.state.phase === 'collecting') {
      return
    }
    const adapter = detectAdapter(getBingConfig().adapters)
    const listDetected = adapter !== null && resolveItems(document, adapter).length > 0
    this.updateState({ adapterName: adapter?.name ?? null, listDetected })
  }

  /** 列表就绪等待（listReadyTimeoutMs 总时长 / listReadyPollMs 轮询）。 */
  private async waitListReady(generation: number): Promise<boolean> {
    const scrape = getBingConfig().scrape
    const deadline = Date.now() + scrape.listReadyTimeoutMs
    while (Date.now() < deadline) {
      if (generation !== this.generation) {
        return false
      }
      const adapter = detectAdapter(getBingConfig().adapters)
      if (adapter && resolveItems(document, adapter).length > 0) {
        return true
      }
      await sleep(scrape.listReadyPollMs)
    }
    return false
  }

  /** 采集主循环：解析 → 去重 → 翻页 → 节奏等待，直至上限/收敛/手动停止。 */
  private async runLoop(generation: number): Promise<void> {
    let failureStreak = 0
    while (generation === this.generation) {
      const scrape = getBingConfig().scrape
      const adapter = detectAdapter(getBingConfig().adapters)
      if (!adapter) {
        failureStreak += 1
        this.updateState({ failureStreak })
        if (this.finishOnFailureStreak(generation, failureStreak)) {
          return
        }
        await sleep(scrape.loopIntervalMs)
        continue
      }

      const round = this.collectRound(adapter)
      if (generation !== this.generation) {
        return
      }
      if (round.limitHit) {
        const singleLimit = this.stopPolicy.getRowLimit()
        const monthlyLimitHit = this.rows.length >= this.monthlyRemaining
        this.complete({
          freeLimitReached: singleLimit !== null && this.rows.length >= singleLimit,
          usageNotice: monthlyLimitHit ? 'exhausted' : null,
          failureStreak: 0
        })
        return
      }

      failureStreak = round.newRows > 0 ? 0 : failureStreak + 1
      this.updateState({ failureStreak })
      if (this.finishOnFailureStreak(generation, failureStreak)) {
        return
      }

      // 翻页策略按适配器 infiniteScroll 分派（调研 §3）；实际触发翻页的轮等
      // paginationDelayMs，未触发（列表收敛）的轮等 loopIntervalMs
      const paginated = this.triggerPagination(adapter)
      await sleep(paginated ? scrape.paginationDelayMs : scrape.loopIntervalMs)
    }
  }

  /** 连续失败轮数达到上限 → 自动完成已采集部分（feat.md 异常分支）。 */
  private finishOnFailureStreak(generation: number, failureStreak: number): boolean {
    if (failureStreak < getBingConfig().scrape.maxConsecutiveFailures) {
      return false
    }
    if (generation === this.generation) {
      logger.error(`[BingCollector] 连续 ${failureStreak} 轮零增长，自动完成`)
      this.complete()
    }
    return true
  }

  /**
   * 进入完成态并启动收尾（手动停止 / 行数上限 / 连续失败三个入口共用）。
   *
   * 收尾归状态机而不是外部订阅者：phase 与 finishing 必须同一快照广播，放行也必须
   * 与置位同一所有者，否则订阅顺序变化会露出可导出的中间帧，订阅者缺席会永久禁用。
   */
  private complete(partial: Partial<BingCollectState> = {}): void {
    if (this.state.phase !== 'collecting') return
    if (this.usageReport) this.usageReport.records = this.rows.length
    this.updateState({ ...partial, phase: 'completed', finishing: { done: 0, total: 0 } })
    void this.finishSession()
  }

  /**
   * 完成收尾（016 E6）：先刷新门控再判 Pro，免费/匿名跳过补全，行保持 ###PRO### 占位。
   *
   * 门控与批次失败已在各自边界收敛（保留快照 / 空列），RPC 均有超时上界，这里的 finally
   * 是补全中的唯一放行点；Go Back 在此期间被锁定，收尾不会跨会话写状态。
   */
  private async finishSession(): Promise<void> {
    try {
      await this.reportUsage()
      await refreshGateState()
      if (getGateState().isPro) {
        await enrichRows(this.rows, {
          onProgress: (done, total) => this.updateState({ finishing: { done, total } })
        })
      }
    } catch (error) {
      logger.error(`[BingCollector] 完成收尾异常，按当前行放行: rows=${this.rows.length}`, error)
    } finally {
      this.updateState({ finishing: null })
    }
  }

  /** 只重试同一份用量，不重新采集或补全。 */
  async retryUsageReport(): Promise<void> {
    if (this.state.finishing !== null || this.state.usageNotice !== 'reportFailed') return
    this.updateState({ finishing: { done: 0, total: 0 } })
    try {
      await this.reportUsage()
    } finally {
      this.updateState({ finishing: null })
    }
  }

  private async reportUsage(): Promise<void> {
    if (!this.usageReport || this.usageReport.records === 0) return
    const channel = new BackgroundChannel()
    try {
      await channel.reportBingUsage(this.usageReport)
      this.updateState({
        usageNotice: this.rows.length >= this.monthlyRemaining ? 'exhausted' : null
      })
    } catch (error) {
      logger.error(
        `[BingCollector] 月用量上报失败: requestId=${this.usageReport.requestId}, records=${this.usageReport.records}`,
        error
      )
      this.updateState({ usageNotice: 'reportFailed' })
    } finally {
      channel.destroy()
    }
  }

  /**
   * 单轮采集：列表容器 outerHTML → 静态文档解析 → 去重累计。
   *
   * 取 outerHTML 进 DOMParser 静态解析（T1 §1），与宿主页 re-render 解耦，
   * 避免解析中途 DOM 被宿主改写；.opHours 兜底在静态条目内查找，语义不变。
   */
  private collectRound(adapter: BingAdapterConfig): CollectRoundResult {
    const container = resolveElement(document, adapter.selectors.listContainer)
    if (!container) {
      logger.error('[BingCollector] 未解析到列表容器，本轮按失败计')
      return { newRows: 0, limitHit: false }
    }

    const staticDoc = new DOMParser().parseFromString(container.outerHTML, 'text/html')
    const items = resolveItems(staticDoc, adapter)
    const rowLimit = Math.min(this.stopPolicy.getRowLimit() ?? Infinity, this.monthlyRemaining)
    let newRows = 0

    // 上轮已触及行数上限（含远程调小 freeRowLimit 的中途生效）：立即按截断完成
    if (this.rows.length >= rowLimit) {
      return { newRows: 0, limitHit: true }
    }

    for (const item of items) {
      try {
        const row = parseBingRow(item, getBingConfig().parse)
        if (this.seenIds.has(row.id)) {
          continue
        }
        if (this.rows.length >= rowLimit) {
          break
        }
        this.seenIds.add(row.id)
        this.rows.push(row)
        newRows += 1
      } catch (error) {
        // 单条解析失败：跳过并继续（不静默吞错、不中断整页，feat.md 异常分支）
        logger.error('[BingCollector] 单条解析失败，已跳过:', error)
      }
    }

    if (newRows > 0) {
      this.updateState({ foundCount: this.rows.length })
    }
    return { newRows, limitHit: this.rows.length >= rowLimit }
  }

  /**
   * 触发翻页（竞品分派语义，调研 §3）。
   *
   * - infiniteScroll（new 版）：优先点 searchThisAreaButton；否则滚动容器
   *   scrollTop = scrollHeight 触发无限滚动；
   * - 按钮翻页（legacy）：翻页按钮 scrollIntoView 后 click。
   *
   * @returns 是否实际触发了翻页动作（决定本轮等待节奏）。
   */
  private triggerPagination(adapter: BingAdapterConfig): boolean {
    if (adapter.selectors.infiniteScroll) {
      const searchAreaButton = resolveElement(document, adapter.selectors.searchAreaButton)
      if (searchAreaButton instanceof HTMLElement) {
        searchAreaButton.click()
        return true
      }
      const scrollContainer = resolveElement(document, adapter.selectors.scrollContainer)
      if (scrollContainer instanceof HTMLElement) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
        return true
      }
      return false
    }

    const paginationButton = resolveElement(document, adapter.selectors.paginationButton)
    if (paginationButton instanceof HTMLElement) {
      paginationButton.scrollIntoView({ block: 'center' })
      paginationButton.click()
      return true
    }
    return false
  }

  /** 合并状态快照并广播；采集终态在此统一打点，避免每处 return 各写一遍。 */
  private updateState(partial: Partial<BingCollectState>): void {
    const previousPhase = this.state.phase
    this.state = { ...this.state, ...partial }
    for (const listener of this.listeners) {
      listener(this.state)
    }
    // 只在进入终态的那一次记录；采集中的状态抖动不打点，否则日志会被轮询淹没。
    if (previousPhase === 'collecting' && this.state.phase === 'completed') {
      const stopReason = this.state.freeLimitReached
        ? 'free_limit'
        : this.state.stoppedManually
          ? 'manual'
          : this.state.failureStreak > 0
            ? 'failure'
            : 'end'
      recordContentMark(
        MARK_TYPE.SEARCH_FINISH,
        `count=${this.state.foundCount}, stop_reason=${stopReason}, ` +
          `adapter=${this.state.adapterName ?? 'unknown'}`
      )
      if (this.state.freeLimitReached) {
        recordContentMark(MARK_TYPE.FREE_LIMIT_REACHED, `count=${this.state.foundCount}`)
      }
    }
  }
}

/** 可中断睡眠（唤醒后由调用方核对 generation 决定去留）。 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms)
  })
}
