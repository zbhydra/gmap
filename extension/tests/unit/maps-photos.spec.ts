/**
 * 照片解析器与采集控制器单元测试（013 A3）。
 *
 * 诚实标注：照片 batchexecute 响应没有实录黄金样本，本 spec 的响应
 * fixture 按 03 号协议文档 §3.3 的剥壳/字段结构手工构造（构造样本，
 * 非实录）：格式 B 包裹（尾哨兵 + d 字段 + XSSI 前缀）、chunk[1] 为
 * payload 字符串、end 布尔在第 10 位（文档依据）；photoUrl/videoUrl
 * 按键名收集。实录下标校准走远程配置覆盖。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import type { JsonObject, JsonValue } from '@/core/rpc/types'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { getMapsConfig, resetMapsConfigForTests } from '@/sites/maps/config/loader'
import { parsePhotosRpcResponse } from '@/sites/maps/content/parser/photosParser'
import {
  PhotosScraper,
  extractSnlM0e
} from '@/sites/maps/content/photos/photosScraper'
import {
  buildPhotosCsv,
  buildPhotosExportFilename
} from '@/sites/maps/content/export/photosCsv'

/** 构造照片 batchexecute 响应（构造样本，非实录）。 */
function buildPhotosResponse(
  entries: JsonObject[],
  next: string | null,
  end: boolean
): string {
  // payload 根：照片项递归按键名收集；end 在第 10 位；next 在第 11 位
  const payload: JsonValue[] = new Array(12)
  payload[0] = entries
  payload[10] = end
  payload[11] = next
  const chunk = ['wte8We', JSON.stringify(payload), null, 'generic']
  // d 内部形态对齐真实格式 B（U2 黄金样本同构）：XSSI 前缀 + JSON 数组，无长度行
  const inner = [")]}'", JSON.stringify([chunk])].join('\n')
  return `${JSON.stringify({ c: 3, d: inner })}/*""*/`
}

/** 构造一个照片项（对象带 photoUrl/videoUrl 键）。 */
function makePhoto(id: string, extra: JsonObject = {}): JsonObject {
  return { photoUrl: `https://lh3.example/p/${id}=w800-h600`, ...extra }
}

beforeEach(() => {
  resetMapsConfigForTests()
})

describe('照片解析（构造样本，非实录）', () => {
  it('格式 B 剥壳 + photoUrl/videoUrl 键名收集 + streetview 过滤', () => {
    const result = parsePhotosRpcResponse(
      buildPhotosResponse(
        [
          makePhoto('A'),
          makePhoto('B'),
          { photoUrl: 'https://www.google.com/maps/uv/streetview?x=1' },
          { videoUrl: 'https://lh3.example/v/vid1' }
        ],
        'photo-token-1',
        false
      ),
      DEFAULT_MAPS_CONFIG.parseSchema
    )

    expect(result.urls).toEqual([
      'https://lh3.example/p/A=w800-h600',
      'https://lh3.example/p/B=w800-h600',
      'https://lh3.example/v/vid1'
    ])
    expect(result.nextToken).toBe('photo-token-1')
    expect(result.end).toBe(false)
  })

  it('嵌套结构中的 photoUrl 键同样被收集（键名驱动，抗下标漂移）', () => {
    const nested: JsonObject = {
      wrapper: [[makePhoto('N1'), makePhoto('N2')]],
      label: 'deep'
    }
    const result = parsePhotosRpcResponse(
      buildPhotosResponse([nested], null, true),
      DEFAULT_MAPS_CONFIG.parseSchema
    )

    expect(result.urls).toEqual([
      'https://lh3.example/p/N1=w800-h600',
      'https://lh3.example/p/N2=w800-h600'
    ])
    expect(result.end).toBe(true)
    expect(result.nextToken).toBeNull()
  })

  it('多 chunk 逐个解析（多响应块场景）', () => {
    const chunkPayload = (id: string): JsonValue => {
      const payload: JsonValue[] = new Array(12)
      payload[0] = [makePhoto(id)]
      payload[10] = false
      payload[11] = `token-${id}`
      return payload
    }
    const inner = [")]}'", JSON.stringify([
      ['wte8We', JSON.stringify(chunkPayload('C1')), null, 'generic'],
      ['wte8We', JSON.stringify(chunkPayload('C2')), null, 'generic']
    ])].join('\n')
    const raw = `${JSON.stringify({ c: 3, d: inner })}/*""*/`

    const result = parsePhotosRpcResponse(raw, DEFAULT_MAPS_CONFIG.parseSchema)
    expect(result.urls).toHaveLength(2)
    expect(result.nextToken).toBe('token-C2')
  })
})

describe('照片 CSV 导出', () => {
  it('单列 URL 列表，文件名按 Photos 规则', () => {
    const csv = buildPhotosCsv(['https://lh3.example/p/A=w800-h600'])
    expect(csv.startsWith('\uFEFFPhoto URL\r\n')).toBe(true)
    expect(csv).toContain('https://lh3.example/p/A=w800-h600')

    const filename = buildPhotosExportFilename(10, 'Gold coffee', new Date(2026, 7, 30), 'csv')
    expect(filename).toBe('MapsGrab-Extractor-Photos-Gold coffee-10-2026-08-30.csv')
  })
})

describe('照片采集控制器：翻页/过滤/截断', () => {
  function buildScraper(): PhotosScraper {
    return new PhotosScraper('0xa0acdb1716592b4d', {
      onStateChanged: () => undefined,
      onError: () => undefined
    })
  }

  /** 构造 fetch mock：按调用序返回批次（含过滤前的原始项），记录请求元数据。 */
  function stubFetch(
    batches: Array<{ entries: JsonObject[]; next: string | null; end: boolean }>
  ): { requests: Array<{ url: string; body: string }> } {
    const requests: Array<{ url: string; body: string }> = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const batch = batches[requests.length]
        if (!batch) {
          throw new Error('测试用例未预期的额外请求')
        }
        requests.push({ url: String(input), body: String(init?.body ?? '') })
        return {
          ok: true,
          status: 200,
          text: async () => buildPhotosResponse(batch.entries, batch.next, batch.end)
        }
      })
    )
    return { requests }
  }

  it('抠不到 SNlM0e 时给出可见错误并 0 张完成', async () => {
    const errors: string[] = []
    const scraper = new PhotosScraper('0xa0acdb1716592b4d', {
      onStateChanged: () => undefined,
      onError: message => errors.push(message)
    })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await scraper.start()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(scraper.getCount()).toBe(0)
    expect(scraper.getStatus()).toBe('complete')
    expect(errors[0]).toContain('SNlM0e')
  })

  it('streetview 过滤 + 有 token 翻页 + end 到底完成', async () => {
    getMapsConfig().scrape.photosPageDelayMs = 0
    // 上限提到 15：让第一批（10 张）不触发截断，走翻页路径
    getMapsConfig().scrape.photosPageLimit = 15
    document.body.innerHTML = `<script>window.WIZ_global_data = {"SNlM0e": "AT-token-x"}; window.IJ_values = [];</script>`
    try {
      const batch1 = {
        entries: [
          ...Array.from({ length: 10 }, (_, i) => makePhoto(`P${i}`)),
          { photoUrl: 'https://maps.example/streetview/1' }
        ],
        next: 'p1',
        end: false
      }
      const batch2 = {
        entries: [makePhoto('C')],
        next: null,
        end: true
      }
      const { requests } = stubFetch([batch1, batch2])
      const scraper = buildScraper()

      await scraper.start()

      // streetview 项不计入（第一批 10 有效 + 第二批 1）；end 命中即到底
      expect(scraper.getCount()).toBe(11)
      expect(scraper.getStatus()).toBe('complete')
      expect(requests).toHaveLength(2)
      expect(requests[0]?.url).toContain('/wizrpcui/_/WizRpcUi/data/batchexecute')
      expect(requests[0]?.url).toContain('rpcids=wTe8We')
      expect(requests[0]?.url).toContain('_reqid=172138')
      expect(requests[1]?.url).toContain('_reqid=272138')
      // AT token 与固定常量进入请求体
      expect(requests[0]?.body).toContain('AT-token-x')
      expect(decodeURIComponent(requests[0]?.body ?? '')).toContain('LU_PHOTO_GALLERY')
      expect(decodeURIComponent(requests[0]?.body ?? '')).toContain('CgIgAQ==')
      expect(decodeURIComponent(requests[0]?.body ?? '')).toContain('0xa0acdb1716592b4d')
    } finally {
      document.body.innerHTML = ''
    }
  })

  it('不足一页（过滤后 <photosPageSize）完成；达上限截断并停止翻页', async () => {
    getMapsConfig().scrape.photosPageDelayMs = 0
    getMapsConfig().scrape.photosPageLimit = 12
    document.body.innerHTML = `<script>window.WIZ_global_data = {"SNlM0e": "AT-token-x"};</script>`
    try {
      const bigBatch = {
        entries: Array.from({ length: 12 }, (_, i) => makePhoto(`P${i}`)),
        next: 'go-on',
        end: false
      }
      const { requests } = stubFetch([bigBatch, bigBatch])
      const scraper = buildScraper()

      await scraper.start()

      // 第一批 12 张即达上限截断，不再请求第二页
      expect(scraper.getCount()).toBe(12)
      expect(scraper.getStatus()).toBe('complete')
      expect(requests).toHaveLength(1)
    } finally {
      document.body.innerHTML = ''
    }
  })

  it('页面无 WIZ_global_data script 时 extractSnlM0e 返回 null', () => {
    document.body.innerHTML = '<script>var other = 1;</script>'
    expect(extractSnlM0e()).toBeNull()
  })
})
