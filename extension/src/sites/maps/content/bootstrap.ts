/**
 * Maps content script 编排（隔离 world 入口的业务装配）。
 *
 * 按 URL 分流（013 U2/U3）：
 * 1. 带采集意图的 Maps 地点工作页 → 评论采集自治 boot
 *    （boot 后自动开始，翻页/导出/埋点独立运行）；
 * 2. 原生照片图库 → 核对标签页采集意图后自治 boot；
 * 3. 其余 /maps 页 → 注入 injected 到页面主世界（hook 必须先于页面 RPC）、
 *    初始化远程配置、按 URL 触发列表模式标记，并挂载采集面板（search /
 *    place 扩展区，SPA 内自动切换；place 页发起评论/照片采集开新标签）。
 */

import { logger } from '@/core/utils/logger'
import { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import { i18nReady } from '@/locales'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { getMapsConfig, loadMapsConfig } from '../config/loader'
import { isNewVersionAvailable } from '../config/operations'
import {
  getMapsUserSettingsSnapshot,
  initializeMapsUserSettings,
  type MapsUserSettings
} from '../settings/userSettings'
import { detectMapsListMode, recordListModeState } from './listMode'
import { MAPS_RPC_RESPONSE_EVENT, type MapsRpcResponseDetail } from './rpcEvents'
import { MapsSearchScraper, type MapsScraperStatus } from './scraper/searchScraper'
import { buildSearchExport, dedupeRowsForExport } from './export/engine'
import { buildHubspotBusinesses } from '../settings/integrations'
import { downloadFile } from './export/download'
import { MapsPanel, PANEL_HOST_ID } from './panel/mapsPanel'
import { openPanelPricing } from './panel/panelView'
import { extractPlaceUrlIds, derivePlaceIdFromFid } from './parser/placeId'
import { buildReviewsPageUrl, isPhotosPageUrl, isReviewsPageUrl } from './extractionUrl'
import { bootReviewsPage } from './reviews/reviewsScraper'
import { bootPhotosPage } from './photos/photosScraper'
import { readBulkWorkParams, type BulkWorkParams } from './bulkAuto'
import { createUsageSessionReporter, getRunLimit } from '../usage/usageClient'
import { isUsageExhausted, type MapsUsageSnapshot } from '../usage/types'
import { collectEnrichTargets, ENRICH_BATCH_SIZE, enrichRows } from '../enrich/enrichClient'

/** 构建产物中 injected 入口的路径（与 vite additionalInputs 的输出文件名一致）。 */
const INJECTED_SCRIPT_PATH = 'src/injected/index.js'

/** 业务事件广播器（content 只广播，background 统一写 SLS）。 */
const markEmitter = new ChromeEventEmitter<ExtensionEvents>()

/** Maps content script 初始化入口。失败不中断：各步骤独立 catch 记录。 */
export function bootstrapMapsContent(): void {
  const url = new URL(location.href)
  if (!isReviewsPageUrl(url) && !isPhotosPageUrl(url) && !url.pathname.startsWith('/maps')) {
    return
  }

  // content_open（feat.md 埋点表）：任意命中页初始化即报；失败由广播通道静默。
  // 带上页面形态与列表模式，新用户首次触达的入口类型可直接按此分组。
  const pageKind = isReviewsPageUrl(url)
    ? 'reviews'
    : isPhotosPageUrl(url)
      ? 'photos'
      : location.pathname.includes('/search/')
        ? 'search'
        : location.pathname.includes('/place/')
          ? 'place'
          : 'other'
  markEmitter.emit('contentOpenMark', {
    markMsg: `page_kind=${pageKind}, list_mode=${detectMapsListMode(location.href, getMapsConfig().dom.listModeUrlMark)}`,
    pageUrl: location.href
  })

  // 评论/照片工作页自治运行，不注入 injected hook、不挂搜索面板
  if (isReviewsPageUrl(url)) {
    void bootReviewsPage(markEmitter)
    return
  }
  if (isPhotosPageUrl(url)) {
    void bootPhotosPage(markEmitter)
    return
  }

  injectMapsInjectedScript()
  logger.info(`[MapsContent] 列表模式标记: ${String(recordListModeState())}`)

  void mountMapsExtractionUi()
}

/** 经 web_accessible_resources 通道把 injected 入口注入页面主世界。 */
function injectMapsInjectedScript(): void {
  try {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL(INJECTED_SCRIPT_PATH)
    script.onload = () => script.remove()
    document.documentElement.appendChild(script)
  } catch (error) {
    logger.error('[MapsContent] 注入 injected 脚本失败:', error)
  }
}

/**
 * 挂载采集面板并把 RPC 响应接入采集控制器；仅 /maps 页执行（/maps/uv 除外，
 * 它是照片工作页形态）。await i18nReady 保证面板文案使用设置语言；
 * await loadMapsConfig 保证 Start 前滚动/截断/翻页参数为远程生效值（失败已在
 * loader 内静默回退包内默认值，不会阻塞挂载）；await initializeMapsUserSettings
 * 在远程覆盖之后应用用户覆盖层（用户设置优先）并建立设置快照；运营区随挂载
 * 渲染（公告 + 新版本提示，远端免发版触达）。
 */
async function mountMapsExtractionUi(): Promise<void> {
  try {
    const isMapsPage = location.pathname.startsWith('/maps') && location.pathname !== '/maps/uv'
    if (!isMapsPage || document.getElementById(PANEL_HOST_ID)) {
      return
    }

    await loadMapsConfig()
    await i18nReady
    await initializeMapsUserSettings()
    if (document.readyState === 'loading') {
      await new Promise<void>(resolve => {
        document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
      })
    }

    const { dom, operations } = getMapsConfig()
    // 面板按钮统一走 ui_action：按钮名进 mark_msg，避免每加一个按钮扩一次事件合同。
    const markPanelAction = (action: string): void => {
      markEmitter.emit('mapsUiActionMark', {
        markMsg: `action=${action}, surface=panel`,
        pageUrl: location.href
      })
    }
    const panel = new MapsPanel({
      onStart: () => {
        markPanelAction('start')
        if (
          !location.pathname.includes('/search/') &&
          !location.pathname.includes('/place/') &&
          !detectMapsListMode(location.href, getMapsConfig().dom.listModeUrlMark)
        ) {
          panel.setSearchError('not-searched')
          return
        }
        void guardStartThen(snapshot => {
          lastLimit = getRunLimit(snapshot, 'search')
          scraper.start(lastLimit)
        })
      },
      onPause: () => {
        markPanelAction('pause')
        scraper.pause()
      },
      onResume: () => {
        markPanelAction('resume')
        scraper.resume()
      },
      onExport: () => {
        markPanelAction('export')
        exportRows(scraper)
      },
      onReset: () => {
        markPanelAction('reset')
        scraper.reset()
      },
      onStartReviews: () => {
        markPanelAction('start_reviews')
        void guardStartThen(() => startReviewsExtraction(panel), 'reviews')
      },
      onStartPhotos: () => {
        markPanelAction('start_photos')
        void guardStartThen(() => startPhotosExtraction(panel), 'photos')
      },
      // 订阅引导（U7 遗留接线，W7）：content 无 tabs 能力，经 background
      // chrome.tabs.create 代开（URL 组装与失败吞并在 pricing 模块内）
      onOpenPricing: () => {
        markPanelAction('open_pricing')
        void openPanelPricing()
      }
    })
    // 批量模式参数（URL 携带 gme_bulk）：自动开始 + 完成强制导出 + 回报调度器
    const bulkWork = readBulkWorkParams(new URL(location.href))
    // 面板态缓存：设置变更时据此重放渲染（无新采集事件也能刷新格式后缀）
    let lastStatus: MapsScraperStatus = 'idle'
    let lastCount = 0
    let lastLimit = getRunLimit(null, 'search')
    // 配额（U7）：会话上报器（每个 start→complete 会话一个幂等 ID）+ 门控
    const usageReporter = createUsageSessionReporter(markEmitter, 'search')
    const guardStartThen = async (
      start: (snapshot: MapsUsageSnapshot | null) => void | Promise<void>,
      source: 'search' | 'reviews' | 'photos' | 'bulk' = 'search'
    ): Promise<void> => {
      // Start 前现拉最新 usage（竞品「每次 start 前查用量」同构）；查询失败
      // 放行（fail-open），耗尽则禁用 Start 并显示额度用尽提示
      const snapshot = await panel.checkQuota(false)
      if (isUsageExhausted(snapshot)) {
        // 配额拦截是订阅漏斗的关键节点：用户在这里看到了升级提示但没有进入采集。
        markEmitter.emit('mapsUiActionMark', {
          markMsg: `action=quota_blocked, source=${source}`,
          pageUrl: location.href
        })
        return
      }
      panel.setSearchError(null)
      await start(snapshot)
    }
    // 订阅回调直接消费归一化入参（快照经异步链路刷新，此处不依赖其时序）
    const renderSearchForSettings = (settings: MapsUserSettings): void => {
      panel.renderSearch({
        status: lastStatus,
        count: lastCount,
        limit: lastLimit,
        format: settings.exportFormat
      })
    }
    const scraper = new MapsSearchScraper(markEmitter, {
      onStateChanged: (status, count) => {
        const previousStatus = lastStatus
        if (
          count > lastCount ||
          status === 'idle' ||
          (status === 'extracting' && previousStatus !== 'extracting')
        ) {
          panel.setSearchError(null)
        }
        lastStatus = status
        lastCount = count
        renderSearchForSettings(getMapsUserSettingsSnapshot())
        // 会话边界（U7）：非 Pause 恢复的进入采集 = 新会话（换幂等 ID）；
        // 完成边沿上报本会话记录数（批量工作页同样上报，任务消耗 = 条目之和）
        if (
          status === 'extracting' &&
          (previousStatus === 'idle' || previousStatus === 'complete')
        ) {
          usageReporter.beginSession()
        }
        if (status === 'complete' && previousStatus !== 'complete') {
          usageReporter.completeSession(count)
          // 采集终态打点：stop_reason 由终态来源决定，limit 命中说明是免费额度截断，
          // 这是判断免费→付费转化的直接依据。
          const stopReason = count >= lastLimit && lastLimit > 0 ? 'limit' : 'end'
          markEmitter.emit('mapsSearchFinishMark', {
            markMsg:
              `count=${count}, stop_reason=${stopReason}, ` +
              `limit=${lastLimit}, ` +
              `mode=${detectMapsListMode(location.href, getMapsConfig().dom.listModeUrlMark) ? 'list' : 'search'}`,
            pageUrl: location.href
          })
          // 完成边沿收尾（U8 重构为异步 finalize）：补全（若开关开）先行写回
          // Email/社媒 → 自动导出/集成同步/批量回报消费补全后的行。async 收尾
          // 不阻塞状态机（complete 态已稳定，面板渲染不依赖 finalize 时序）
          void finalizeCompleteSession(scraper, panel, bulkWork, count).catch(error => {
            logger.error('[MapsContent] 采集收尾失败:', error)
          })
        }
      },
      // 批量模式：每批新数据回报调度器重置卡死时钟（90s = 自上次进展以来）
      onProgress:
        bulkWork === null
          ? undefined
          : () =>
              markEmitter.emit('mapsBulkItemProgress', {
                taskId: bulkWork.taskId,
                itemIndex: bulkWork.itemIndex,
                pageUrl: location.href
              }),
      onError: (_message, reason) => panel.setSearchError(reason)
    })

    await panel.mount(dom.panelMount, dom.main)
    panel.setBulkContext(bulkWork)
    panel.renderOperations({
      announcementHtml: operations.announcementHtml,
      newVersionAvailable: isNewVersionAvailable(
        operations.minPluginVersion,
        chrome.runtime.getManifest().version
      )
    })
    // 挂载即门控预检（U7）：已耗尽则直接禁用 Start 并显示额度用尽提示，
    // 用户无需点击后才被发现；查询失败不门控（放行，Start 点击时再校验）
    if (bulkWork === null) await panel.checkQuota(false)
    document.addEventListener(MAPS_RPC_RESPONSE_EVENT, event => {
      const detail = (event as CustomEvent<MapsRpcResponseDetail>).detail
      if (detail && typeof detail.str === 'string') {
        scraper.handleRpcResponse(detail.str)
      }
    })
    // 批量模式：面板就绪后自动开始（无需用户点击 Start）
    if (bulkWork !== null) {
      await guardStartThen(snapshot => {
        lastLimit = getRunLimit(snapshot, 'search')
        scraper.start(lastLimit)
        logger.info(
          `[MapsContent] 批量自动采集已开始: task=${bulkWork.taskId}, item=${bulkWork.itemIndex}`
        )
      }, 'bulk')
    }
    logger.info('[MapsContent] 采集面板已挂载')
  } catch (error) {
    logger.error('[MapsContent] 采集面板装配失败:', error)
  }
}

/**
 * 导出当前采集结果：导出引擎（Place Id 去重 + Pro 门控 + 字段勾选 + 格式
 * 构建）→ 浏览器下载 → export_results 打点。打点失败不影响下载（局部可失败）。
 *
 * 格式与字段勾选来自用户设置（013 A9，options 页改动即时生效于下次导出）；
 * Pro 门控开关来自远程配置 exportConfig（无账号体系时默认全列可用），
 * 免费用户勾选的 Pro 列在导出层交集剔除。
 */
function exportRows(scraper: MapsSearchScraper): void {
  const settings = getMapsUserSettingsSnapshot()
  const artifact = buildSearchExport(scraper.getRows(), scraper.getKeyword(), new Date(), {
    format: settings.exportFormat,
    proColumnsEnabled: getMapsConfig().exportConfig.proColumnsEnabled,
    enabledHeaders: settings.exportFieldHeaders
  })
  downloadFile(artifact.content, artifact.filename, artifact.mime)

  // format 字段（feat.md 埋点表：export_results 含格式、条数）
  markEmitter.emit('mapsExportResultsMark', {
    markMsg: `count=${artifact.rowCount}, format=${settings.exportFormat}, kw=${scraper.getKeyword()}`,
    pageUrl: location.href
  })
}

/**
 * auto_save 边沿（013 A10）：构建集成产物并广播给 background 同步。
 *
 * 集成产物固定 CSV（竞品 uploadCSVToGoogleDrive 同构，与用户导出格式设置
 * 无关）；HubSpot 商家数组与 CSV 同一批去重行（竞品 syncTo(arr, fields) 同构）。
 * 空数据静默跳过（无内容可同步）；构建失败仅记录，不影响导出与采集状态。
 */
function dispatchAutoSaveExport(scraper: MapsSearchScraper): void {
  try {
    const settings = getMapsUserSettingsSnapshot()
    const artifact = buildSearchExport(scraper.getRows(), scraper.getKeyword(), new Date(), {
      format: 'csv',
      proColumnsEnabled: getMapsConfig().exportConfig.proColumnsEnabled,
      enabledHeaders: settings.exportFieldHeaders
    })
    const csvContent = artifact.content
    if (artifact.rowCount === 0 || typeof csvContent !== 'string' || csvContent.length === 0) {
      return
    }
    markEmitter.emit('mapsAutoSaveExport', {
      csvContent,
      filename: artifact.filename,
      keyword: scraper.getKeyword(),
      rowCount: artifact.rowCount,
      businesses: buildHubspotBusinesses(dedupeRowsForExport(scraper.getRows())),
      pageUrl: location.href
    })
  } catch (error) {
    logger.error('[MapsContent] auto_save 集成产物构建失败:', error)
  }
}

/**
 * 采集完成边沿收尾（013 A4，U8：补全 + 导出 + 集成 + 批量回报）。
 *
 * 补全先行：extractEmail/extractSocialMedias 任一开启时，先把 enrich 结果
 * 写回行（分批 ≤50 经 background 调服务端），后续导出/集成都消费补全后的行
 * ——与竞品「勾选即补全后导出」语义一致，且只产一份含全量数据的产物。批量
 * 模式经 onBatchSettled 回报进展（补全过程对调度器可见，不触发 90s 卡死误判）。
 *
 * 失败语义：补全失败已收敛为空结果（enrichRows 内部吞异常 + 失败打点），
 * 导出/同步/批量回报照常执行；会话在补全期间被 Reset/重开（状态离开
 * complete）则丢弃本次收尾，防陈旧行导出。
 */
async function finalizeCompleteSession(
  scraper: MapsSearchScraper,
  panel: MapsPanel,
  bulkWork: BulkWorkParams | null,
  count: number
): Promise<void> {
  const snapshot = getMapsUserSettingsSnapshot()
  if (snapshot.extractEmail || snapshot.extractSocialMedias) {
    const total = collectEnrichTargets(scraper.getRows()).length
    let done = 0
    panel.setFinishing({ done, total })
    try {
      await enrichRows(scraper.getRows(), markEmitter, {
        onBatchSettled: () => {
          done = Math.min(total, done + ENRICH_BATCH_SIZE)
          panel.setFinishing({ done, total })
          if (bulkWork !== null) {
            markEmitter.emit('mapsBulkItemProgress', {
              taskId: bulkWork.taskId,
              itemIndex: bulkWork.itemIndex,
              pageUrl: location.href
            })
          }
        }
      })
    } finally {
      panel.setFinishing(null)
    }
  }
  if (scraper.getStatus() !== 'complete') {
    logger.info('[MapsContent] 会话在收尾期间被重置，丢弃本次导出/同步')
    return
  }
  // 自动导出：auto_download（用户设置，默认关）或批量模式（强制，竞品 bulk
  // 语义）→ 与面板手动 Export 同一条导出管线；批量模式导出后回报调度器推进
  // 下一关键词。auto_save（013 A10）在同一收尾构建集成产物并广播给 background
  // （单路失败不阻断导出）
  if (snapshot.autoDownload || bulkWork !== null) {
    exportRows(scraper)
    panel.showExported()
  }
  if (snapshot.autoSaveToGoogleDrive || snapshot.autoSaveToHubspot) {
    dispatchAutoSaveExport(scraper)
  }
  if (bulkWork !== null) {
    markEmitter.emit('mapsBulkItemDone', {
      taskId: bulkWork.taskId,
      itemIndex: bulkWork.itemIndex,
      collected: count,
      pageUrl: location.href
    })
  }
}

/**
 * place 页发起评论采集：URL 提取 fid/lrd → 本地换算 placeId → 打开评论工作页
 * （自治采集）。埋点 scrape_reviews_content 由评论页 boot 上报。
 *
 * 打开用同步 window.open（点击手势内调用，避免弹窗拦截）；不用
 * background tabs.create——其实测会绕过 Playwright route（e2e 零外网依赖
 * route），且省一条 background RPC 能力。
 */
function startReviewsExtraction(panel: MapsPanel): void {
  const ids = extractPlaceIds()
  if (ids === null) {
    panel.setPlaceSectionError('reviews', 'unknown-place')
    return
  }
  const placeId = derivePlaceIdFromFid(ids.fid)
  if (placeId.length === 0) {
    logger.error('[MapsContent] fid 换算 Place ID 失败')
    panel.setPlaceSectionError('reviews', 'unknown-place')
    return
  }

  panel.setPlaceSectionError('reviews', null)
  if (openWorkTab(buildReviewsPageUrl(placeId, ids.fid))) {
    panel.setPlaceSectionWorking('reviews', true)
  } else {
    panel.setPlaceSectionError('reviews', 'open-tab')
  }
}

/**
 * place 页发起照片采集：background 记录一次性标签页意图并打开原生图库。
 */
async function startPhotosExtraction(panel: MapsPanel): Promise<void> {
  const ids = extractPlaceIds()
  if (ids === null) {
    panel.setPlaceSectionError('photos', 'unknown-place')
    return
  }

  panel.setPlaceSectionError('photos', null)
  const channel = new BackgroundChannel()
  try {
    const result = await channel.photosWorkPage({ action: 'open', fid: ids.fid })
    if (result.opened) panel.setPlaceSectionWorking('photos', true)
    else panel.setPlaceSectionError('photos', 'open-tab')
  } catch (error) {
    logger.error('[MapsContent] 打开照片工作页失败:', error)
    panel.setPlaceSectionError('photos', 'open-tab')
  } finally {
    channel.destroy()
  }
}

/** 从当前 place URL 提取 fid/lrd（hex 段长度上限由远程配置驱动）。 */
function extractPlaceIds(): { fid: string; lrd: string } | null {
  const ids = extractPlaceUrlIds(location.href, getMapsConfig().parseSchema.placeIdHexMaxLength)
  if (ids === null) {
    logger.error('[MapsContent] place URL 未找到 hex 标识，无法发起评论/照片采集')
  }
  return ids
}

/** 打开采集工作标签页；被弹窗策略拦截时返回 false（调用方不置 working 态）。 */
function openWorkTab(url: string): boolean {
  const workTab = window.open(url, '_blank')
  if (workTab === null) {
    logger.error(`[MapsContent] 工作标签页被弹窗策略拦截: ${url}`)
  }
  return workTab !== null
}
