/**
 * 评论采集控制器（013 A2，在 Maps 地点工作页自治运行）。
 *
 * 链路：place 页点 Start Extracting Reviews → 同步 window.open 打开评论页
 * 新标签（URL 携带完整 fid）→ 评论页 content script boot 自动开始：页面兜底
 * 判定 → 主动
 * fetch GetLocalBoqProxy（完整 fid 定位、每页 10 条、字段掩码、翻页 token）→
 * txtToJson 解析 → 追加计数 → 有 token 等 reviewsPageDelayMs 翻页。
 *
 * 终止：达本次有效上限截断完成 /
 * 不足一页（reviewsPageSize）/ 无 token。页面兜底：无评论图、错误容器、
 * 标题含 500 → 0 条完成（原因在面板可见）。
 *
 * 采集开始上报 scrape_reviews_content 埋点（契约锁内新增，background 写 SLS）。
 */

import { logger } from '@/core/utils/logger'
import { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import { I18N_KEYS } from '@/core/constants/i18n'
import { interruptibleDelay } from '../scraper/feedScroll'
import { getMapsConfig, loadMapsConfig } from '../../config/loader'
import { i18nReady } from '@/locales'
import { parseReviewsRpcResponse, type ReviewRow } from '../parser/reviewsParser'
import { buildReviewsExport } from '../export/reviewsCsv'
import {
  getMapsUserSettingsSnapshot,
  initializeMapsUserSettings
} from '../../settings/userSettings'
import { downloadFile } from '../export/download'
import { ExtractionPanel, waitForBody } from '../panel/extractionPanel'
import { isReviewsPageUrl, readReviewsWorkFid } from '../extractionUrl'
import { readBulkReviewsMax, readBulkWorkParams } from '../bulkAuto'
import { BULK_LIMITS } from '@/background/batch/types'
import {
  createUsageSessionReporter,
  fetchUsageSnapshot,
  getRunLimit
} from '../../usage/usageClient'

/** 采集状态（单地点短流程，无暂停态）。 */
export type ReviewsScraperStatus = 'extracting' | 'complete' | 'stopped' | 'empty'
export type ReviewsScraperError = 'unknown-place' | 'google'

/** 采集器回调（面板渲染与错误可见性）。 */
export interface ReviewsScraperCallbacks {
  /** 任一状态/计数变化后触发。 */
  onStateChanged: (status: ReviewsScraperStatus, count: number) => void
  /** 需要用户可见的错误（面板错误行）。 */
  onError: (message: string, reason: ReviewsScraperError) => void
  /**
   * 每页新数据解析入库后触发（013 A6 批量模式：调度器据此重置卡死时钟——
   * 90s 判定 = 自上次进展以来）。缺省不回报（非批量页）。
   */
  onProgress?: () => void
}

/** 评论 RPC 的内部服务版本常量（竞品写死，03 逆向 §3.2）。 */
const REVIEWS_RPC_OPI = '89978449'

/** 评论 RPC 的 msc 标记。 */
const REVIEWS_RPC_MSC = 'gwsrpc'

/** 评论 RPC 端点路径（同源接口，content script 直接 fetch，无需主世界注入）。 */
const REVIEWS_RPC_PATH = '/httpservice/web/PrivateLocalSearchUiDataService/GetLocalBoqProxy'

export class ReviewsScraper {
  private readonly markEmitter: ChromeEventEmitter<ExtensionEvents>

  private readonly callbacks: ReviewsScraperCallbacks

  private status: ReviewsScraperStatus = 'extracting'

  private rows: ReviewRow[] = []

  constructor(
    private readonly place: { fid: string; hl: string; gl: string },
    markEmitter: ChromeEventEmitter<ExtensionEvents>,
    callbacks: ReviewsScraperCallbacks
  ) {
    this.markEmitter = markEmitter
    this.callbacks = callbacks
  }

  /** 开始采集：埋点 + 页面兜底判定 + 翻页循环。 */
  async start(maxReviews: number): Promise<void> {
    if (!this.place.fid) {
      const message = '[ReviewsScraper] 评论工作页缺少完整 fid 定位参数，无法请求评论 RPC'
      logger.error(message)
      this.callbacks.onError(message, 'unknown-place')
      this.complete('stopped')
      return
    }
    this.markEmitter.emit('mapsScrapeReviewsContentMark', {
      markMsg: `fid=${this.place.fid}`,
      pageUrl: location.href
    })

    const fallback = detectReviewsPageFallback()
    if (fallback !== null) {
      logger.warn(`[ReviewsScraper] 评论页兜底命中: ${fallback}，0 条完成`)
      this.callbacks.onError(fallbackMessage(fallback), 'google')
      this.complete(fallback === 'no-reviews' ? 'empty' : 'stopped')
      return
    }

    await this.runFetchLoop(null, maxReviews)
  }

  /** 当前采集状态。 */
  getStatus(): ReviewsScraperStatus {
    return this.status
  }

  /** 当前已采集条数。 */
  getCount(): number {
    return this.rows.length
  }

  /**
   * 导出当前结果：评论 11 列（格式随用户设置 exportFormat，013 簿记 2）+
   * export_results 打点（打点失败不影响下载）。
   */
  export(): void {
    const exportFormat = getMapsUserSettingsSnapshot().exportFormat
    const artifact = buildReviewsExport(this.rows, document.title, new Date(), exportFormat)
    downloadFile(artifact.content, artifact.filename, artifact.mime)

    // format 字段（feat.md 埋点表：export_results 含格式、条数）
    this.markEmitter.emit('mapsExportResultsMark', {
      markMsg: `count=${this.rows.length}, format=${exportFormat}, kind=reviews`,
      pageUrl: location.href
    })
  }

  /** 重置并重新开始（面板 Reset 按钮语义：清空重采）。 */
  reset(maxReviews: number): void {
    this.rows = []
    this.status = 'extracting'
    this.callbacks.onStateChanged(this.status, 0)
    void this.start(maxReviews)
  }

  /**
   * 翻页主循环：fetch 一页 → 解析追加 → 终止判定 → 延时翻页。
   * 每轮现读远程配置（Google 改版由服务端改配置，刷新页面生效）；
   * 本次上限由开始入口确定，翻页期间保持不变。
   */
  private async runFetchLoop(token: string | null, pageLimit: number): Promise<void> {
    while (this.status === 'extracting') {
      const { scrape, parseSchema, reviewsDom } = getMapsConfig()

      let parsedRows: ReviewRow[]
      let nextToken: string | null
      try {
        const raw = await fetchReviewsPage(this.place, token)
        const parsed = parseReviewsRpcResponse(raw, parseSchema, reviewsDom)
        parsedRows = parsed.rows
        nextToken = parsed.nextToken
      } catch (error) {
        logger.error('[ReviewsScraper] 评论页采集失败（保留已采结果）:', error)
        this.callbacks.onError(error instanceof Error ? error.message : String(error), 'google')
        this.complete('stopped')
        return
      }

      this.rows.push(...parsedRows.slice(0, pageLimit - this.rows.length))
      this.callbacks.onStateChanged(this.status, this.rows.length)
      // 新数据入库 = 进展：批量模式由调用方回报调度器重置卡死时钟
      if (parsedRows.length > 0) {
        this.callbacks.onProgress?.()
      }

      // 终止判定一：达到本次有效上限。
      if (this.rows.length >= pageLimit) {
        this.complete()
        return
      }
      // 终止判定二：不足一页（到底）
      if (parsedRows.length < scrape.reviewsPageSize) {
        this.complete()
        return
      }
      // 终止判定三：无翻页 token
      if (nextToken === null) {
        this.complete()
        return
      }

      await interruptibleDelay(scrape.reviewsPageDelayMs, () => this.status !== 'extracting')
      token = nextToken
    }
  }

  private complete(
    status: ReviewsScraperStatus = this.rows.length > 0 ? 'complete' : 'empty'
  ): void {
    this.status = status
    this.callbacks.onStateChanged(this.status, this.rows.length)
  }
}

/** 评论页面板宿主 id（挂载防重）。 */
export const REVIEWS_PANEL_HOST_ID = 'gmap-extractor-reviews-panel-host'

/** 评论页 boot 选项（U5 参数化：手动与批量两类入口复用同一 boot）。 */
export interface ReviewsBootOptions {
  /** boot 后是否自动开始（默认 true；面板 Reset 重采语义不受影响）。 */
  autoStart?: boolean
  /**
   * 批量模式参数：提供时单地点上限取批量值（默认 300，dashboard 可配），
   * 完成边沿强制导出并回报调度器推进下一链接。
   */
  bulk?: { taskId: string; itemIndex: number; itemCount: number; perStoreLimit: number }
}

/**
 * 评论页 boot：捕获初始工作参数、挂载面板并按选项自动开始采集。
 *
 * 仅带完整 fid 参数的 Maps 地点工作页触发。
 */
export async function bootReviewsPage(
  markEmitter: ChromeEventEmitter<ExtensionEvents>,
  options: ReviewsBootOptions = {}
): Promise<void> {
  const workUrl = new URL(location.href)
  if (!isReviewsPageUrl(workUrl)) {
    logger.info('[ReviewsScraper] 非我方评论工作页，跳过自动采集')
    return
  }

  // Google 会同文档清掉工作参数；翻页、批量回报与 Reset 共用初始上下文。
  const place = {
    fid: readReviewsWorkFid(workUrl) ?? '',
    hl: workUrl.searchParams.get('hl') ?? 'en',
    gl: workUrl.searchParams.get('gl') ?? 'us'
  }
  const bulk =
    options.bulk ??
    (() => {
      const fromUrl = readBulkWorkParams(workUrl)
      return fromUrl === null
        ? null
        : {
            ...fromUrl,
            perStoreLimit: readBulkReviewsMax(workUrl) ?? BULK_LIMITS.defaultReviewsPerStoreLimit
          }
    })()
  const reviewsMax = bulk?.perStoreLimit

  await loadMapsConfig()
  await i18nReady
  await initializeMapsUserSettings()
  await waitForBody()
  if (document.readyState === 'loading') {
    await new Promise<void>(resolve =>
      document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
    )
  }

  const panel = new ExtractionPanel(REVIEWS_PANEL_HOST_ID, I18N_KEYS.MAPS_PANEL.REVIEWS_EXPORT, {
    onExport: () => scraper.export(),
    onReset: () => startExtraction(true)
  })
  await panel.mount()

  panel.setBulkContext(bulk)
  let previousStatus: ReviewsScraperStatus = 'extracting'
  // 配额会话上报器（U7）：boot 自动开始即首个会话；Reset 重启换新幂等 ID
  const usageReporter = createUsageSessionReporter(markEmitter, 'reviews')
  const scraper = new ReviewsScraper(place, markEmitter, {
    onStateChanged: (status, count) => {
      panel.render({
        status,
        count,
        format: getMapsUserSettingsSnapshot().exportFormat
      })
      // 会话边界（U7）：Reset 重启 = 新会话；完成边沿上报本会话记录数
      //（批量工作页同样上报，任务消耗 = 各条目上报之和，服务端幂等去重）
      if (status === 'extracting' && previousStatus !== 'extracting') {
        usageReporter.beginSession()
      }
      if (status !== 'extracting' && previousStatus === 'extracting') {
        usageReporter.completeSession(count)
        if (bulk !== null) {
          // 批量模式完成边沿：强制导出（竞品 bulk 语义）并回报调度器推进队列
          if (count > 0) {
            scraper.export()
            panel.showExported()
          }
          markEmitter.emit('mapsBulkItemDone', {
            taskId: bulk.taskId,
            itemIndex: bulk.itemIndex,
            collected: count,
            pageUrl: location.href
          })
        } else if (count > 0 && getMapsUserSettingsSnapshot().autoDownload) {
          // 手动模式完成边沿：用户开启 auto_download 时自动导出（013 A9，
          // U11 接线；与搜索面板完成边沿同语义，复用用户设置快照）
          scraper.export()
          panel.showExported()
        }
      }
      previousStatus = status
    },
    // 批量模式：每页新数据回报调度器重置卡死时钟（90s = 自上次进展以来）
    onProgress:
      bulk === null
        ? undefined
        : () =>
            markEmitter.emit('mapsBulkItemProgress', {
              taskId: bulk.taskId,
              itemIndex: bulk.itemIndex,
              pageUrl: location.href
            }),
    onError: (_message, reason) => panel.setError(reason === 'unknown-place' ? reason : null)
  })
  const startExtraction = async (reset = false): Promise<void> => {
    panel.setChecking(true)
    try {
      const snapshot = await fetchUsageSnapshot()
      const pageLimit = getRunLimit(snapshot, 'reviews', reviewsMax)
      panel.setUsage(snapshot, pageLimit)
      if (pageLimit === 0) {
        panel.setError('quota')
        return
      }
      panel.setError(null)
      if (reset) {
        scraper.reset(pageLimit)
      } else {
        void scraper.start(pageLimit)
      }
      logger.info(
        `[ReviewsScraper] 评论采集已开始: fid=${place.fid}, limit=${pageLimit}, bulk=${String(bulk !== null)}`
      )
    } finally {
      panel.setChecking(false)
    }
  }
  if (options.autoStart ?? true) {
    await startExtraction()
  }
}

/** 构造并请求一页评论 RPC（同源 GET，reqpld 协议见 03 逆向 §3.2）。 */
async function fetchReviewsPage(
  place: { fid: string; hl: string; gl: string },
  token: string | null
): Promise<string> {
  // reqpld 数组布局按 03 逆向 §3.2：完整 fid 定位、每页 10 条、字段掩码、翻页 token
  const reqpld = [
    null,
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [
        null,
        1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        getMapsConfig().scrape.reviewsPageSize,
        null,
        [place.fid],
        null,
        null,
        null,
        null,
        [1, 1, null, [[3], [4], [5], [6], [7]]],
        null,
        null,
        token
      ]
    ]
  ]

  const query = new URLSearchParams({
    hl: place.hl,
    gl: place.gl,
    reqpld: JSON.stringify(reqpld),
    msc: REVIEWS_RPC_MSC,
    opi: REVIEWS_RPC_OPI
  })

  const response = await fetch(`${REVIEWS_RPC_PATH}?${query.toString()}`)
  if (!response.ok) {
    throw new Error(`[ReviewsScraper] 评论 RPC 请求失败: status=${response.status}`)
  }
  return response.text()
}

/** 页面兜底判定：错误容器 / 无评论图 / 标题含 500（03 逆向 §3.2 boot 判定）。 */
function detectReviewsPageFallback(): string | null {
  const { reviewsDom } = getMapsConfig()
  if (document.querySelector(reviewsDom.reviewsErrorContainer)) {
    return 'error'
  }
  if (document.querySelector(reviewsDom.reviewsNoReviewsImage)) {
    return 'no-reviews'
  }
  if (document.title.includes('500')) {
    return 'title-500'
  }
  return null
}

/** 兜底原因 → 用户可见消息。 */
function fallbackMessage(fallback: string): string {
  if (fallback === 'no-reviews') {
    return '[ReviewsScraper] 该地点没有评论（no_reviews）'
  }
  if (fallback === 'title-500') {
    return '[ReviewsScraper] 评论页返回错误（标题含 500）'
  }
  return '[ReviewsScraper] 评论页返回错误容器（af-error-container）'
}
