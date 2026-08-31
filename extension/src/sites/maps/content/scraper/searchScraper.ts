/**
 * Maps 搜索采集控制器：响应处理管线 + 滚动驱动循环 + 状态机。
 *
 * 状态机（013 逆向 02 小结）：idle 待命 → extracting 采集中 → complete 完成；
 * extracting ⇄ paused（Pause/Resume）。
 *
 * 双形态滚动循环（同一采集引擎，A7 列表模式为 A1 的列表分支）：
 * - 搜索形态：start 时重放当前搜索（触发首批 RPC），滚 feed 到底换新一批；
 * - 列表形态（start 时 URL 命中 dom.listModeUrlMark，A7/U10）：不重放搜索，
 *   逐项点击列表项打开详情（详情 RPC 仍走 injected 拦截的同一条通道），
 *   列表容器每轮 +500px 触发加载更多；该形态禁用「结果 <2 条直接完成」
 *   判定——逐项采集每项单行是常态，完成由列表结束提示/无增长兜底驱动。
 *
 * 采集闭环：injected 捕获的响应经 handleRpcResponse 进入解析 → 去重 →
 * 计数 → 完成判定。完成判定：结果 <2 条直接完成（仅搜索形态）、达到免费
 * 行数上限截断完成、末项结束提示或连续无增长轮数达限完成。
 */

import { logger } from '@/core/utils/logger'
import { getMapsConfig } from '../../config/loader'
import { filterNewRows, parseSearchRpcResponse, type MapsPlaceRow } from '../parser'
import { detectMapsListMode } from '../listMode'
import { readBulkWorkParams } from '../bulkAuto'
import type { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import {
  animateScrollBy,
  animateScrollToBottom,
  findFeed,
  interruptibleDelay,
  isFeedEndReached,
  nextScrollDelayMs,
  randomBetween
} from './feedScroll'
import { findListContainer, findListItems } from './listScroll'

/** 列表模式每轮滚动步进（竞品 scrollPlaceListToNext 同款 +500px）。 */
const LIST_SCROLL_STEP_PX = 500

/** 采集状态。 */
export type MapsScraperStatus = 'idle' | 'extracting' | 'paused' | 'complete'

/** 采集器对外回调（面板渲染与错误可见性）。 */
export interface MapsScraperCallbacks {
  /** 任一状态/计数变化后触发（面板据此重渲染）。 */
  onStateChanged: (status: MapsScraperStatus, count: number) => void
  /** 解析/选择器失败等需要用户可见的错误（面板错误行）。 */
  onError: (message: string) => void
  /**
   * 每批新数据入库后触发（013 A6 批量模式：调度器据此重置卡死时钟——
   * 90s 判定 = 自上次进展以来）。缺省不回报（非批量页）。
   */
  onProgress?: () => void
}

export class MapsSearchScraper {
  /** 业务事件广播器（search 埋点经 background 统一写 SLS）。 */
  private readonly markEmitter: ChromeEventEmitter<ExtensionEvents>

  private readonly callbacks: MapsScraperCallbacks

  private status: MapsScraperStatus = 'idle'

  private rows: MapsPlaceRow[] = []

  private seenKeys: Set<string> = new Set()

  private keyword = ''

  /**
   * 本会话是否为列表形态（A7）：start 时按 URL 判定并锁定（SPA 打开详情后
   * data 段的标记是否保留未实录，锁定保证会话语义确定），reset 时清除。
   */
  private listSession = false

  /** 列表模式已点击项（逐项去重：容器滚动重建后新元素视为新项）。 */
  private clickedListItems: Set<HTMLElement> = new Set()

  /** 滚动循环代际：start/resume 递增，旧循环在每个检查点自行退出（防双循环）。 */
  private loopGeneration = 0

  constructor(markEmitter: ChromeEventEmitter<ExtensionEvents>, callbacks: MapsScraperCallbacks) {
    this.markEmitter = markEmitter
    this.callbacks = callbacks
  }

  /** 当前采集状态。 */
  getStatus(): MapsScraperStatus {
    return this.status
  }

  /** 当前已采集行数。 */
  getCount(): number {
    return this.rows.length
  }

  /** 搜索关键词（首个成功响应的解析结果，非 DOM）。 */
  getKeyword(): string {
    return this.keyword
  }

  /** 已采集行（导出用；完成前调用方不消费）。 */
  getRows(): readonly MapsPlaceRow[] {
    return this.rows
  }

  /** 当前滚动循环代际（仅测试/诊断用：断言旧循环随代际递增被取消）。 */
  getLoopGenerationForTests(): number {
    return this.loopGeneration
  }

  /** 进入采集中：清空会话、按 URL 形态分支（列表不重放搜索）、启动滚动循环。 */
  start(): void {
    if (this.status === 'extracting') {
      return
    }
    this.rows = []
    this.seenKeys = new Set()
    this.keyword = ''
    // 列表会话锁定：start 时刻的 URL 形态决定本会话的循环与完成语义
    const { dom } = getMapsConfig()
    this.listSession = detectMapsListMode(location.href, dom.listModeUrlMark)
    this.clickedListItems = new Set()
    // 代际 +1：令此前仍卡在延时/动画检查点的旧循环（如 pause 后快速 restart、
    // complete 边缘窗口内的残留循环）在下一个检查点自行退出，防双循环
    this.loopGeneration += 1
    this.setStatus('extracting')
    if (!this.listSession) {
      this.triggerSearchReplay()
    }
    void this.runScrollLoop()
  }

  /** 暂停：滚动循环在下一个检查点挂起，响应处理同步丢弃。 */
  pause(): void {
    if (this.status === 'extracting') {
      this.setStatus('paused')
    }
  }

  /** 恢复：重启滚动循环（代际 +1，卡在检查点的旧循环退出，防双循环）。 */
  resume(): void {
    if (this.status === 'paused') {
      this.loopGeneration += 1
      this.setStatus('extracting')
      void this.runScrollLoop()
    }
  }

  /** 重置：清空会话回到待命。 */
  reset(): void {
    this.rows = []
    this.seenKeys = new Set()
    this.keyword = ''
    this.listSession = false
    this.clickedListItems = new Set()
    this.loopGeneration += 1
    this.setStatus('idle')
  }

  /**
   * injected 转发的响应入口；非采集中状态直接丢弃（竞品 status 必须=1 语义）。
   *
   * @param raw 完整响应文本。
   */
  handleRpcResponse(raw: string): void {
    if (this.status !== 'extracting') {
      return
    }

    let query: string
    let parsedRows: MapsPlaceRow[]
    try {
      const parsed = parseSearchRpcResponse(raw, getMapsConfig().parseSchema)
      query = parsed.query
      parsedRows = filterNewRows(parsed.rows, this.seenKeys)
    } catch (error) {
      logger.error('[MapsScraper] 响应解析失败（等待下一批）:', error)
      this.callbacks.onError(error instanceof Error ? error.message : String(error))
      return
    }

    if (this.keyword.length === 0 && query.length > 0) {
      this.keyword = query
      // bulk 标志（feat.md 埋点表）：与 reviews 同构，现读工作页 URL 批量参数，
      // 无需经调用方传入
      const bulk = readBulkWorkParams(new URL(location.href)) !== null
      this.markEmitter.emit('mapsSearchMark', {
        markMsg: `kw=${this.keyword}, bulk=${String(bulk)}`,
        pageUrl: location.href
      })
    }

    this.rows.push(...parsedRows)
    this.callbacks.onStateChanged(this.status, this.rows.length)
    // 新数据入库 = 进展：批量模式由调用方回报调度器重置卡死时钟
    if (parsedRows.length > 0) {
      this.callbacks.onProgress?.()
    }

    // 完成判定一：结果 <2 条直接完成（竞品语义）。仅搜索形态生效——列表形态
    // 逐项点击每项详情单行是常态，提前完成会丢掉整个列表（A7/U10 裁决）
    if (!this.listSession && this.rows.length < 2) {
      this.complete()
      return
    }

    // 完成判定二：达到免费行数上限，截断并完成（配额门控归 U7）
    const limit = getMapsConfig().scrape.freeExportRowLimit
    if (this.rows.length >= limit) {
      this.rows = this.rows.slice(0, limit)
      this.complete()
    }
  }

  /**
   * 滚动驱动循环：按会话形态分支——列表形态走逐项点击 + 步进滚动，
   * 搜索形态滚 feed 到底，直到出现结束提示、达到无增长轮数上限或状态
   * 离开 extracting。
   */
  private async runScrollLoop(): Promise<void> {
    if (this.listSession) {
      await this.runListLoop()
      return
    }

    const generation = this.loopGeneration
    const isCancelled = (): boolean =>
      this.status !== 'extracting' || this.loopGeneration !== generation

    let noGrowthRounds = 0
    let lastCount = this.rows.length

    while (this.status === 'extracting' && this.loopGeneration === generation) {
      const { dom, scrape } = getMapsConfig()
      const feed = findFeed(dom.feed)

      if (feed && isFeedEndReached(feed, dom.feedEndMarker)) {
        this.complete()
        return
      }

      if (feed) {
        const animMin = Math.max(scrape.scrollAnimMinMs, 0)
        const animMax = Math.max(scrape.scrollAnimMaxMs, animMin)
        await animateScrollToBottom(feed, randomBetween(animMin, animMax), isCancelled)
      } else {
        logger.warn(`[MapsScraper] feed 容器未就绪: selector=${dom.feed}`)
      }

      await interruptibleDelay(nextScrollDelayMs(scrape.scrollIntervalSec), isCancelled)
      if (isCancelled()) {
        return
      }

      // 增长检查：连续无增长（含 feed 缺失）达限即完成（防死滚兜底）
      if (this.rows.length === lastCount) {
        noGrowthRounds += 1
        if (noGrowthRounds >= scrape.noGrowthRetryLimit) {
          this.complete()
          return
        }
      } else {
        noGrowthRounds = 0
        lastCount = this.rows.length
      }
    }
  }

  /**
   * 列表模式循环（A7/U10）：每轮点击一个未采集的列表项打开详情（详情 RPC
   * 仍走 injected 拦截通道）+ 列表容器步进 +500px 触发加载更多；可见项全部
   * 点击过且末项出现结束提示即完成。
   *
   * 等待语义：每轮间隔复用 scrape.scrollIntervalSec；竞品的 Email +2s /
   * Social +3s 是给服务端补全留时，本单元无 U8 数据源，仅用普通间隔。
   */
  private async runListLoop(): Promise<void> {
    const generation = this.loopGeneration
    const isCancelled = (): boolean =>
      this.status !== 'extracting' || this.loopGeneration !== generation

    let noGrowthRounds = 0
    let lastCount = this.rows.length

    while (this.status === 'extracting' && this.loopGeneration === generation) {
      const { dom, scrape } = getMapsConfig()
      const container = findListContainer(location.href, dom)

      if (!container) {
        logger.warn('[MapsScraper] 列表容器未就绪（可能已离开列表页）')
      } else {
        const items = findListItems(container, dom.listItem)

        // 结束判定与 feed 同构：容器末子元素（结束提示位，被列表项选择器排除）
        // 出现提示文字；可见列表项全部点击过后才允许完成（先清完再终止）
        if (isFeedEndReached(container, dom.listEndMarker)) {
          const hasUnclicked = items.some(item => !this.clickedListItems.has(item))
          if (!hasUnclicked) {
            this.complete()
            return
          }
        }

        // 逐项节奏：每轮至多点击一项（竞品同款；点击后 Maps 打开详情并异步
        // 发 RPC，响应在后续轮次的间隔窗口内到达，由 handleRpcResponse 入库）
        const next = items.find(item => !this.clickedListItems.has(item))
        if (next) {
          this.clickedListItems.add(next)
          this.clickListItem(next)
        }

        // 步进滚动触发列表加载更多（未到列表底部时有剩余可滚量）
        const animMin = Math.max(scrape.scrollAnimMinMs, 0)
        const animMax = Math.max(scrape.scrollAnimMaxMs, animMin)
        await animateScrollBy(
          container,
          LIST_SCROLL_STEP_PX,
          randomBetween(animMin, animMax),
          isCancelled
        )
      }

      await interruptibleDelay(nextScrollDelayMs(scrape.scrollIntervalSec), isCancelled)
      if (isCancelled()) {
        return
      }

      // 增长检查：连续无增长（含容器缺失、逐项点击无响应）达限即完成（防死滚兜底）
      if (this.rows.length === lastCount) {
        noGrowthRounds += 1
        if (noGrowthRounds >= scrape.noGrowthRetryLimit) {
          this.complete()
          return
        }
      } else {
        noGrowthRounds = 0
        lastCount = this.rows.length
      }
    }
  }

  /** 点击单个列表项打开详情；真实 Maps 的事件委托对合成 click 的响应性归 real smoke 校准。 */
  private clickListItem(item: HTMLElement): void {
    item.click()
  }

  /** 点击搜索提交按钮重放当前搜索，触发 Maps 首批 RPC。 */
  private triggerSearchReplay(): void {
    const selector = getMapsConfig().dom.searchSubmitButton
    const button = document.querySelector(selector)
    if (button instanceof HTMLElement) {
      button.click()
      return
    }
    const message = `[MapsScraper] 搜索重放按钮未找到: selector=${selector}，等待页面自身请求`
    logger.error(message)
    this.callbacks.onError(message)
  }

  private complete(): void {
    this.setStatus('complete')
  }

  private setStatus(status: MapsScraperStatus): void {
    this.status = status
    this.callbacks.onStateChanged(status, this.rows.length)
  }
}
