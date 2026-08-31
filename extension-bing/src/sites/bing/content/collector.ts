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
 *   截断，Pro 订阅态有效 = null 无上限，见 ./gate）。
 */

import { logger } from '@/core/utils/logger'
import { MARK_TYPE } from '@/core/api/mark/types'
import { getBingConfig } from '@/sites/bing/config/loader'
import type { BingAdapterConfig } from '@/sites/bing/config/contract'
import { detectAdapter, resolveElement, resolveItems } from './detector'
import { parseBingRow, type BingExportRow } from './parser'
import { recordContentMark } from './marks'

/** 面板主状态（三态）。 */
export type BingPanelPhase = 'idle' | 'collecting' | 'completed'

/** 采集状态快照（面板渲染的唯一数据源）。 */
export interface BingCollectState {
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
  /** 是否手动停止（完成态文案依据）。 */
  stoppedManually: boolean
  /** 主循环连续零增长轮数（采集中区域提示依据）。 */
  failureStreak: number
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
    phase: 'idle',
    adapterName: null,
    listDetected: false,
    foundCount: 0,
    freeLimitReached: false,
    stoppedManually: false,
    failureStreak: 0
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

  /** 进入采集中：列表就绪等待 → search 打点 → 主循环。 */
  async start(): Promise<void> {
    if (this.state.phase !== 'idle') {
      return
    }
    const generation = ++this.generation
    this.updateState({ phase: 'collecting', stoppedManually: false, freeLimitReached: false })

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

    const adapterName = detectAdapter(getBingConfig().adapters)?.name ?? 'unknown'
    // 埋点表（feat.md）：search 含结果页形态（legacy/new）
    recordContentMark(MARK_TYPE.SEARCH, `version=${adapterName}`)

    await this.runLoop(generation)
  }

  /** 手动停止：使 in-flight 循环失效并立即进入完成态。 */
  stop(): void {
    if (this.state.phase !== 'collecting') {
      return
    }
    this.generation += 1
    this.updateState({ phase: 'completed', stoppedManually: true, failureStreak: 0 })
  }

  /** 返回待命（Go Back）：清空本轮数据并恢复检测轮询。 */
  reset(): void {
    this.generation += 1
    this.rows = []
    this.seenIds.clear()
    this.updateState({
      phase: 'idle',
      foundCount: 0,
      freeLimitReached: false,
      stoppedManually: false,
      failureStreak: 0
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
        this.updateState({
          phase: 'completed',
          freeLimitReached: true,
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
      this.updateState({ phase: 'completed' })
    }
    return true
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
    const rowLimit = this.stopPolicy.getRowLimit()
    let newRows = 0

    // 上轮已触及行数上限（含远程调小 freeRowLimit 的中途生效）：立即按截断完成
    if (rowLimit !== null && this.rows.length >= rowLimit) {
      return { newRows: 0, limitHit: true }
    }

    for (const item of items) {
      try {
        const row = parseBingRow(item, getBingConfig().parse)
        if (this.seenIds.has(row.id)) {
          continue
        }
        if (rowLimit !== null && this.rows.length >= rowLimit) {
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
    return { newRows, limitHit: rowLimit !== null && this.rows.length >= rowLimit }
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

  /** 合并状态快照并广播。 */
  private updateState(partial: Partial<BingCollectState>): void {
    this.state = { ...this.state, ...partial }
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }
}

/** 可中断睡眠（唤醒后由调用方核对 generation 决定去留）。 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms)
  })
}
