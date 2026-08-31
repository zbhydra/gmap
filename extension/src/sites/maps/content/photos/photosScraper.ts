/**
 * 照片采集控制器（013 A3，在 google.com/maps/uv 照片画廊页自治运行）。
 *
 * 链路：place 页点 Start Extracting Photos → 同步 window.open 打开 uv 页
 * 新标签（URL 携带 gme_lrd + lkt=LocalPoiPhotos）→ uv 页 content script boot
 * 自动开始：
 * 从页面 `<script>` 的 window.WIZ_global_data 抠 SNlM0e（XSRF AT token，
 * 03 逆向 §3.3 parseScriptToData 语义）→ POST batchexecute(rpcids=wTe8We)
 * → 解析 photoUrl/videoUrl 并过滤 streetview → 翻页。
 *
 * 终止：达上限（scrape.photosPageLimit，免费档默认 10，档位归 U7）截断完成 /
 * end 布尔 / 不足一页（photosPageSize）/ 无 token。
 */

import { logger } from '@/core/utils/logger'
import { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import { I18N_KEYS } from '@/core/constants/i18n'
import { interruptibleDelay } from '../scraper/feedScroll'
import { getMapsConfig, loadMapsConfig } from '../../config/loader'
import { i18nReady } from '@/locales'
import { parsePhotosRpcResponse } from '../parser/photosParser'
import { buildPhotosExport } from '../export/photosCsv'
import {
  getMapsUserSettingsSnapshot,
  initializeMapsUserSettings
} from '../../settings/userSettings'
import { downloadFile } from '../export/download'
import { ExtractionPanel, waitForBody } from '../panel/extractionPanel'
import { EXTRACTION_HOST_LRD_PARAM } from '../extractionUrl'
import { createUsageSessionReporter } from '../../usage/usageClient'

/** 采集状态。 */
export type PhotosScraperStatus = 'extracting' | 'complete'

/** 采集器回调。 */
export interface PhotosScraperCallbacks {
  /** 任一状态/计数变化后触发。 */
  onStateChanged: (status: PhotosScraperStatus, count: number) => void
  /** 需要用户可见的错误。 */
  onError: (message: string) => void
}

/** batchexecute 端点路径（同源 POST）。 */
const PHOTOS_RPC_PATH = 'https://www.google.com/wizrpcui/_/WizRpcUi/data/batchexecute'

/** 照片 RPC 的方法名（03 逆向 §3.3）。 */
const PHOTOS_RPC_ID = 'wTe8We'

/** 请求 payload 固定常量：图库类型标记（03 逆向 §3.3，竞品写死）。 */
const PHOTOS_RPC_GALLERY_FLAG = 'LU_PHOTO_GALLERY'

/** 请求 payload 固定常量（base64 图库标记，03 逆向 §3.3）。 */
const PHOTOS_RPC_FIXED_FLAG = 'CgIgAQ=='

/** `_reqid` 固定后缀（模仿前端 reqid 规则，03 逆向 §3.3）。 */
const PHOTOS_RPC_REQID_SUFFIX = '72138'

export class PhotosScraper {
  private readonly lrd: string

  private readonly callbacks: PhotosScraperCallbacks

  private status: PhotosScraperStatus = 'extracting'

  private urls: string[] = []

  constructor(lrd: string, callbacks: PhotosScraperCallbacks) {
    this.lrd = lrd
    this.callbacks = callbacks
  }

  /** 开始采集：抠 AT token + 翻页循环。 */
  async start(): Promise<void> {
    const atToken = extractSnlM0e()
    if (atToken === null) {
      const message = '[PhotosScraper] 页面未找到 WIZ_global_data/SNlM0e token，无法请求照片 RPC'
      logger.error(message)
      this.callbacks.onError(message)
      this.complete()
      return
    }

    await this.runFetchLoop(atToken)
  }

  /** 当前采集状态。 */
  getStatus(): PhotosScraperStatus {
    return this.status
  }

  /** 当前已采集张数。 */
  getCount(): number {
    return this.urls.length
  }

  /** 导出当前结果：URL 列表（格式随用户设置 exportFormat，013 簿记 2）。 */
  export(): void {
    const artifact = buildPhotosExport(
      this.urls,
      document.title,
      new Date(),
      getMapsUserSettingsSnapshot().exportFormat
    )
    downloadFile(artifact.content, artifact.filename, artifact.mime)
  }

  /** 重置并重新开始。 */
  reset(): void {
    this.urls = []
    this.status = 'extracting'
    this.callbacks.onStateChanged(this.status, 0)
    void this.start()
  }

  /**
   * 翻页主循环：POST 一页 → 解析过滤 → 终止判定 → 延时翻页。
   * 每轮现读远程配置；`_reqid` = 页码 + 固定后缀（模仿前端规则）。
   */
  private async runFetchLoop(atToken: string): Promise<void> {
    let page = 1
    let token: string | null = null

    while (this.status === 'extracting') {
      const { scrape, parseSchema } = getMapsConfig()

      let batchUrls: string[]
      let nextToken: string | null
      let end: boolean
      try {
        const raw = await fetchPhotosPage(this.lrd, token, atToken, page)
        const parsed = parsePhotosRpcResponse(raw, parseSchema)
        batchUrls = parsed.urls
        nextToken = parsed.nextToken
        end = parsed.end
      } catch (error) {
        logger.error('[PhotosScraper] 照片页采集失败（保留已采结果）:', error)
        this.callbacks.onError(error instanceof Error ? error.message : String(error))
        this.complete()
        return
      }

      this.urls.push(...batchUrls)
      this.callbacks.onStateChanged(this.status, this.urls.length)

      // 终止判定一：达上限截断完成（配额门控归 U7）
      if (this.urls.length >= scrape.photosPageLimit) {
        this.urls = this.urls.slice(0, scrape.photosPageLimit)
        this.complete()
        return
      }
      // 终止判定二：相册到底（end 布尔）
      if (end) {
        this.complete()
        return
      }
      // 终止判定三：不足一页（过滤 streetview 后计数）
      if (batchUrls.length < scrape.photosPageSize) {
        this.complete()
        return
      }
      // 终止判定四：无翻页 token
      if (nextToken === null) {
        this.complete()
        return
      }

      await interruptibleDelay(scrape.photosPageDelayMs, () => this.status !== 'extracting')
      page += 1
      token = nextToken
    }
  }

  private complete(): void {
    this.status = 'complete'
    this.callbacks.onStateChanged(this.status, this.urls.length)
  }
}

/** 照片页面板宿主 id。 */
export const PHOTOS_PANEL_HOST_ID = 'gmap-extractor-photos-panel-host'

/**
 * 照片页 boot：读取 lrd、挂载面板并自动开始采集。
 *
 * 仅我方打开的 uv 页（URL 携带 gme_lrd）触发；照片采集无独立埋点
 * （MARK_TYPE 契约本单元只新增 SCRAPE_REVIEWS_CONTENT）。完成边沿经
 * `mapsUsageReport` 上报配额（U7，background 幂等扣减，失败不阻断）。
 */
export async function bootPhotosPage(
  markEmitter: ChromeEventEmitter<ExtensionEvents>
): Promise<void> {
  const lrd = readWorkLrd()
  if (!lrd) {
    logger.info('[PhotosScraper] URL 未携带 gme_lrd，跳过自动采集')
    return
  }

  await loadMapsConfig()
  await i18nReady
  await initializeMapsUserSettings()
  await waitForBody()

  const panel = new ExtractionPanel(PHOTOS_PANEL_HOST_ID, I18N_KEYS.MAPS_PANEL.PHOTOS_EXPORT, {
    onExport: () => scraper.export(),
    onReset: () => {
      panel.setError(null)
      scraper.reset()
    }
  })
  await panel.mount()

  const usageReporter = createUsageSessionReporter(markEmitter, 'photos')
  let previousStatus: PhotosScraperStatus = 'extracting'
  const scraper = new PhotosScraper(lrd, {
    onStateChanged: (status, count) => {
      panel.render({
        status,
        count,
        format: getMapsUserSettingsSnapshot().exportFormat
      })
      // 会话边界（U7）：Reset 重启 = 新会话；完成边沿上报本会话记录数
      if (status === 'extracting' && previousStatus === 'complete') {
        usageReporter.beginSession()
      }
      if (status === 'complete' && previousStatus !== 'complete') {
        usageReporter.completeSession(count)
        // 用户开启 auto_download 时完成边沿自动导出（013 A9，U11 接线；
        // 与搜索面板/评论工作页同语义，复用用户设置快照）
        if (getMapsUserSettingsSnapshot().autoDownload) {
          scraper.export()
        }
      }
      previousStatus = status
    },
    onError: message => panel.setError(message)
  })
  void scraper.start()
  logger.info(
    `[PhotosScraper] 照片采集已开始: lrd=${lrd}, limit=${getMapsConfig().scrape.photosPageLimit}`
  )
}

/** 从当前页面 URL 读工作参数 lrd（仅 gme_lrd 查询参数）。 */
function readWorkLrd(): string | null {
  const explicit = new URLSearchParams(location.search).get(EXTRACTION_HOST_LRD_PARAM)
  return explicit && explicit.length > 0 ? explicit : null
}

/**
 * 从页面 `<script>` 抠 SNlM0e：找 `window.WIZ_global_data` 块，截取到
 * `window.IJ_values` 之间，取 `{...}` 边界 JSON.parse（03 逆向 §3.3）。
 * 找不到返回 null（调用方给出可见错误并完成）。
 */
export function extractSnlM0e(): string | null {
  for (const script of document.querySelectorAll('script')) {
    const text = script.textContent ?? ''
    const start = text.indexOf('window.WIZ_global_data')
    if (start === -1) {
      continue
    }
    const end = text.indexOf('window.IJ_values', start)
    const segment = end === -1 ? text.slice(start) : text.slice(start, end)

    const jsonStart = segment.indexOf('{')
    const jsonEnd = segment.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      continue
    }
    try {
      const parsed: unknown = JSON.parse(segment.slice(jsonStart, jsonEnd + 1))
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed) &&
        typeof (parsed as Record<string, unknown>).SNlM0e === 'string'
      ) {
        return (parsed as Record<string, string>).SNlM0e
      }
    } catch {
      // 该 script 块不是纯 JSON 对象，继续找下一块
    }
  }
  return null
}

/**
 * 构造并请求一页照片 batchexecute（同源 POST，协议见 03 逆向 §3.3）。
 *
 * 请求 payload：`["{lrd}",null,{next或null},"CgIgAQ==",…,"LU_PHOTO_GALLERY",…,0]`；
 * body 尾部 `&` 为竞品形态残留，无语义，我方不附加（声明）。
 */
async function fetchPhotosPage(
  lrd: string,
  token: string | null,
  atToken: string,
  page: number
): Promise<string> {
  const params = new URLSearchParams(location.search)
  const hl = params.get('hl') ?? 'en'

  const rpcPayload = JSON.stringify([
    lrd,
    null,
    token,
    PHOTOS_RPC_FIXED_FLAG,
    null,
    null,
    null,
    null,
    null,
    null,
    PHOTOS_RPC_GALLERY_FLAG,
    null,
    null,
    0
  ])
  const fReq = JSON.stringify([[[PHOTOS_RPC_ID, rpcPayload, null, 'generic']]])

  const query = new URLSearchParams({
    rpcids: PHOTOS_RPC_ID,
    'source-path': '/search',
    hl,
    _reqid: `${page}${PHOTOS_RPC_REQID_SUFFIX}`,
    rt: 'c'
  })
  const body = new URLSearchParams({ 'f.req': fReq, at: atToken })

  const response = await fetch(`${PHOTOS_RPC_PATH}?${query.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: body.toString()
  })
  if (!response.ok) {
    throw new Error(`[PhotosScraper] 照片 RPC 请求失败: status=${response.status}`)
  }
  return response.text()
}
