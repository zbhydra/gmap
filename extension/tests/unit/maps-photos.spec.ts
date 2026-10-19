/** 照片协议以当前 Google wTe8We 实录为基线；翻页边界用同协议构造响应覆盖。 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import type { JsonValue } from '@/core/rpc/types'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { getMapsConfig, resetMapsConfigForTests } from '@/sites/maps/config/loader'
import { parsePhotosRpcResponse } from '@/sites/maps/content/parser/photosParser'
import { PhotosScraper, waitForPhotosGallery } from '@/sites/maps/content/photos/photosScraper'
import { buildPhotosExport } from '@/sites/maps/content/export/photosCsv'

function photo(id: string, videoUrl: string | null = null): JsonValue[] {
  return [[`https://lh3.example/p/${id}=w800-h600`], null, videoUrl]
}

function response(entries: JsonValue[], next: string | null): string {
  const block = JSON.stringify([['wrb.fr', 'wTe8We', JSON.stringify([null, next, entries])]])
  return `)]}'\n\n${block.length}\n${block}\n`
}

beforeEach(() => {
  resetMapsConfigForTests()
})

describe('照片 wTe8We 协议', () => {
  it('当前 Google 实录：20 条媒体保留 4 个视频与下一页 token', () => {
    const raw = readFileSync(
      resolve(process.cwd(), 'tests/fixtures/golden-samples/photos-wTe8We-response.txt'),
      'utf-8'
    )
    const result = parsePhotosRpcResponse(raw, DEFAULT_MAPS_CONFIG.parseSchema)
    expect(result.rows).toHaveLength(20)
    expect(result.rows.filter(row => row.videoUrl)).toHaveLength(4)
    expect(result.rows.every(row => row.photoUrl.startsWith('https://'))).toBe(true)
    expect(result.rows.every(row => !row.photoUrl.includes('='))).toBe(true)
    expect(result.nextToken).toBeTruthy()
    expect(result.end).toBe(false)
  })

  it('街景整行剔除，协议相对 URL 补 https，照片和视频计为同一条', () => {
    const result = parsePhotosRpcResponse(
      response(
        [photo('A', 'https://video.example/a'), [['//lh3.example/p/B=w100']], photo('streetview/1')],
        null
      ),
      DEFAULT_MAPS_CONFIG.parseSchema
    )
    expect(result.rows).toEqual([
      { photoUrl: 'https://lh3.example/p/A', videoUrl: 'https://video.example/a' },
      { photoUrl: 'https://lh3.example/p/B', videoUrl: '' }
    ])
    expect(result.end).toBe(true)
  })

  it('缺失当前方法或媒体字段时抛错，不把协议漂移当作空相册', () => {
    expect(() => parsePhotosRpcResponse(")]}'\n[]", DEFAULT_MAPS_CONFIG.parseSchema)).toThrow(
      'wTe8We'
    )
    expect(() =>
      parsePhotosRpcResponse(response([[null]], null), DEFAULT_MAPS_CONFIG.parseSchema)
    ).toThrow('照片项缺少 URL')
  })
})

describe('照片导出两列', () => {
  const rows = [
    { photoUrl: 'https://photo.example/a', videoUrl: 'https://video.example/a' },
    { photoUrl: 'https://photo.example/b', videoUrl: '' }
  ]
  const now = new Date(2026, 7, 30)

  it('CSV 保留 Photo URL、Video URL 与媒体行数', () => {
    const artifact = buildPhotosExport(rows, 'Gold coffee', now, 'csv')
    expect(artifact.content).toBe(
      '\uFEFFPhoto URL,Video URL\r\nhttps://photo.example/a,https://video.example/a\r\nhttps://photo.example/b,\r\n'
    )
    expect(artifact.filename).toBe('MapsGrab-Extractor-Photos-Gold coffee-2-2026-08-30.csv')
  })

  it('JSON 与 XLSX 保持同一组媒体字段', () => {
    const json = buildPhotosExport(rows, 'Gold coffee', now, 'json')
    expect(typeof json.content).toBe('string')
    expect(JSON.parse(String(json.content))).toEqual([
      { photoURL: 'https://photo.example/a', videoURL: 'https://video.example/a' },
      { photoURL: 'https://photo.example/b', videoURL: '' }
    ])

    const xlsx = buildPhotosExport(rows, 'Gold coffee', now, 'xlsx')
    const workbook = XLSX.read(xlsx.content, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0] ?? '']
    expect(sheet && XLSX.utils.sheet_to_json(sheet, { header: 1 })).toEqual([
      ['Photo URL', 'Video URL'],
      ['https://photo.example/a', 'https://video.example/a'],
      ['https://photo.example/b', '']
    ])
  })
})

describe('照片采集边界', () => {
  it('图库网格与地点元数据分属不同 dialog 时，仍只接受意图绑定的 fid', async () => {
    const fid = '0x89c2597ca044ec9b:0xa0acdb1716592b4d'
    document.body.innerHTML = `
      <div role="dialog"><div data-feature-id="0xa:0xb"></div></div>
      <div role="dialog"><div data-feature-id="${fid}"></div></div>
      <div role="dialog"><div role="grid"></div></div>
    `
    await expect(waitForPhotosGallery(fid)).resolves.toBe(true)
    vi.useFakeTimers()
    try {
      const missingPlace = waitForPhotosGallery('0xc:0xd')
      await vi.advanceTimersByTimeAsync(10_000)
      await expect(missingPlace).resolves.toBe(false)
    } finally {
      vi.useRealTimers()
      document.body.innerHTML = ''
    }
  })
  it('缺少页面 AT token 时可见报错并结束，不发请求', async () => {
    const onError = vi.fn()
    const scraper = new PhotosScraper('0xa:0xb', { onStateChanged: vi.fn(), onError })
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await scraper.start(getMapsConfig().scrape.photosPageLimit)
    expect(fetch).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('SNlM0e'))
    expect(scraper.getStatus()).toBe('stopped')
  })

  it('完整 fid 进入请求，按媒体条数翻页并截断上限', async () => {
    getMapsConfig().scrape.photosPageDelayMs = 0
    document.body.innerHTML = '<script>window.WIZ_global_data={"SNlM0e":"test-at"};</script>'
    const fetch = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >()
      .mockResolvedValueOnce(new Response(response(
        Array.from({ length: 10 }, (_, i) => photo(String(i), 'https://video.example/a')),
        'next'
      )))
      .mockResolvedValueOnce(new Response(response([photo('11'), photo('12'), photo('13')], null)))
    vi.stubGlobal('fetch', fetch)
    const scraper = new PhotosScraper('0xa:0xb', { onStateChanged: vi.fn(), onError: vi.fn() })
    await scraper.start(12)
    expect(scraper.getCount()).toBe(12)
    expect(fetch).toHaveBeenCalledTimes(2)
    const requestBody = fetch.mock.calls[0]?.[1]?.body
    expect(decodeURIComponent(String(requestBody))).toContain('0xa:0xb')
    expect(scraper.getStatus()).toBe('complete')
  })
})
