/**
 * Maps Email/社媒补全单元测试（013 A4，U8 验收行为直接覆盖）。
 *
 * 覆盖面：设置开关门控基线（默认关 + 非法值回退）、collectEnrichTargets
 * （无 domain 跳过 / 同 domain 去重 / 目标字段映射）、enrichRows（分批 ≤50、
 * 结果按 domain 写回行、无 domain 行不动、失败收敛 ok=false、每批回调、
 * enrich_complete 打点成功与失败均发）、formatSocialMedias（平台序 + 行格式）。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChromeEventEmitter } from '../../src/core/rpc'
import type { ExtensionEvents } from '../../src/core/events/types'
import type { MapsPlaceRow } from '../../src/sites/maps/content/parser'
import type {
  MapsEnrichBusinessInput,
  MapsEnrichResponse
} from '../../src/sites/maps/enrich/types'
import { STORAGE_KEYS } from '../../src/core/api/config'
import {
  DEFAULT_MAPS_USER_SETTINGS,
  MapsUserSettingsManager
} from '../../src/sites/maps/settings/userSettings'
import {
  collectEnrichTargets,
  enrichRows,
  formatSocialMedias,
  ENRICH_BATCH_SIZE
} from '../../src/sites/maps/enrich/enrichClient'

/** RPC 响应编排状态（vi.hoisted 提升到 mock 工厂之前）。 */
const rpcState = vi.hoisted(() => ({
  /** 每次调 enrichMapsBusinesses 收到的批次入参。 */
  calls: [] as Array<Array<{ domain: string; website: string }>>,
  /** 注入的响应器：返回响应载荷或抛错。 */
  respond: null as null | ((businesses: MapsEnrichBusinessInput[]) => Promise<MapsEnrichResponse>)
}))

vi.mock('../../src/content/rpc/background.rpc', () => ({
  BackgroundChannel: class {
    async enrichMapsBusinesses(params: {
      businesses: MapsEnrichBusinessInput[]
    }): Promise<MapsEnrichResponse> {
      rpcState.calls.push(params.businesses)
      if (rpcState.respond === null) {
        throw new Error('no responder configured')
      }
      return rpcState.respond(params.businesses)
    }

    destroy(): void {}
  }
}))

type StorageData = Record<string, unknown>

const storageData: StorageData = {}

/** 重置进程内 storage 假实现（与 maps-user-settings.spec 同构）。 */
function resetStorage(): void {
  for (const key of Object.keys(storageData)) {
    delete storageData[key]
  }
  Object.assign(chrome.storage.local, {
    get: vi.fn((keys: string | string[] | Record<string, unknown> | null) => {
      const result: Record<string, unknown> = {}
      if (keys === null) {
        Object.assign(result, storageData)
      } else if (typeof keys === 'string') {
        result[keys] = storageData[keys]
      } else if (Array.isArray(keys)) {
        for (const key of keys) {
          result[key] = storageData[key]
        }
      } else {
        for (const key of Object.keys(keys)) {
          result[key] = key in storageData ? storageData[key] : keys[key]
        }
      }
      return Promise.resolve(result)
    }),
    set: vi.fn((items: Record<string, unknown>) => {
      Object.assign(storageData, items)
      return Promise.resolve()
    })
  })
}

/** 行工厂：默认带 domain，partial 覆盖其余字段。 */
function makeRow(partial: Partial<MapsPlaceRow> = {}): MapsPlaceRow {
  const domain = partial.domain ?? 'cafe.com'
  return {
    name: 'Cafe',
    categories: [],
    fullAddress: '1 Test St',
    street: '',
    municipality: '',
    description: '',
    about: '',
    timeZone: '',
    price: '',
    note: '',
    amenities: '',
    hotelClass: '',
    phone: '',
    phones: '',
    claimed: '',
    owner: '',
    ownerId: '',
    reviewUrl: '',
    rating: '',
    reviewCount: '',
    latitude: '',
    longitude: '',
    website: `https://${domain}`,
    domain,
    openingHours: '',
    featuredImage: '',
    cid: '',
    fid: '',
    placeId: 'p1',
    kgmid: '',
    email: '',
    socialMedias: '',
    ...partial
  }
}

/** 打点广播器替身：记录事件名与载荷。 */
function makeEmitter(): {
  emitter: ChromeEventEmitter<ExtensionEvents>
  emitted: Array<{ event: string; data: unknown }>
} {
  const emitted: Array<{ event: string; data: unknown }> = []
  const emitter = {
    emit: (event: string, data: unknown) => {
      emitted.push({ event, data })
    }
  } as unknown as ChromeEventEmitter<ExtensionEvents>
  return { emitter, emitted }
}

beforeEach(() => {
  rpcState.calls = []
  rpcState.respond = null
  resetStorage()
})

describe('设置开关（U8 门控基线）', () => {
  it('extractEmail/extractSocialMedias 默认关', () => {
    expect(DEFAULT_MAPS_USER_SETTINGS.extractEmail).toBe(false)
    expect(DEFAULT_MAPS_USER_SETTINGS.extractSocialMedias).toBe(false)
    expect(DEFAULT_MAPS_USER_SETTINGS.exportFieldHeaders).toHaveLength(36)
  })

  it('归一化：显式布尔保留；非布尔/缺失回默认关', async () => {
    storageData[STORAGE_KEYS.MAPS_USER_SETTINGS] = {
      extractEmail: true,
      extractSocialMedias: 'yes'
    }

    const settings = await MapsUserSettingsManager.getSettings()

    expect(settings.extractEmail).toBe(true)
    expect(settings.extractSocialMedias).toBe(false)
  })
})

describe('collectEnrichTargets', () => {
  it('无 domain 行跳过；同 domain 去重；目标映射 name/address/website', () => {
    const targets = collectEnrichTargets([
      makeRow({ domain: '' }), // 无官网：跳过
      makeRow({ domain: 'Cafe.com', name: 'Cafe A', fullAddress: '1 St' }),
      makeRow({ domain: 'cafe.com', name: 'Cafe B' }), // 同域（大小写不敏感）：去重
      makeRow({ domain: 'shop.org', name: 'Shop' })
    ])

    expect(targets).toEqual([
      // website 透传行原文（服务端优先用它拼抓取 URL）；domain 已归一化
      { domain: 'cafe.com', website: 'https://Cafe.com', name: 'Cafe A', address: '1 St' },
      { domain: 'shop.org', website: 'https://shop.org', name: 'Shop', address: '1 Test St' }
    ])
  })
})

describe('enrichRows', () => {
  it('分批 ≤50：51 个目标拆 50+1 两批', async () => {
    rpcState.respond = async businesses => ({
      results: businesses.map(business => ({ key: business.domain, emails: [], medias: {} })),
      partial: false
    })

    const rows = Array.from({ length: 51 }, (_, i) =>
      makeRow({ domain: `site${i}.com`, placeId: `p${i}` })
    )
    const { emitter } = makeEmitter()
    const summary = await enrichRows(rows, emitter)

    expect(ENRICH_BATCH_SIZE).toBe(50)
    expect(rpcState.calls.map(batch => batch.length)).toEqual([50, 1])
    expect(summary).toEqual({
      totalTargets: 51,
      writtenRows: 51,
      partial: false,
      ok: true
    })
  })

  it('结果按 domain 写回行：Email 逗号分隔、Social Medias 多行；无 domain 行不动', async () => {
    rpcState.respond = async businesses => ({
      results: businesses.map(business =>
        business.domain === 'cafe.com'
          ? {
              key: 'cafe.com',
              emails: ['info@cafe.com', 'hello@cafe.com'],
              medias: {
                instagram: 'https://www.instagram.com/cafe',
                twitter: 'https://x.com/cafe'
              }
            }
          : { key: business.domain, emails: [], medias: {} }
      ),
      partial: false
    })

    const cafeRow = makeRow()
    const cafeRowDuplicate = makeRow({ placeId: 'p2' }) // 同域第二行
    const noDomainRow = makeRow({ domain: '', placeId: 'p3' })
    const { emitter } = makeEmitter()
    const summary = await enrichRows([cafeRow, cafeRowDuplicate, noDomainRow], emitter)

    expect(summary.writtenRows).toBe(2)
    expect(cafeRow.email).toBe('info@cafe.com,hello@cafe.com')
    expect(cafeRowDuplicate.email).toBe('info@cafe.com,hello@cafe.com')
    expect(cafeRow.socialMedias).toBe(
      'instagram: https://www.instagram.com/cafe\ntwitter: https://x.com/cafe'
    )
    expect(noDomainRow.email).toBe('')
    expect(noDomainRow.socialMedias).toBe('')
  })

  it('成功后发 enrich_complete 打点（ok=true 携带计数）', async () => {
    rpcState.respond = async businesses => ({
      results: businesses.map(business => ({
        key: business.domain,
        emails: ['a@b.com'],
        medias: {}
      })),
      partial: false
    })

    const { emitter, emitted } = makeEmitter()
    await enrichRows([makeRow()], emitter)

    const marks = emitted.filter(item => item.event === 'mapsEnrichCompleteMark')
    expect(marks).toHaveLength(1)
    expect(marks[0]?.data).toMatchObject({
      markMsg: 'count=1, written=1, partial=false, ok=true'
    })
  })

  it('批次失败收敛：ok=false、行不写、失败打点仍发（成功/失败均报）', async () => {
    rpcState.respond = async () => {
      throw new Error('enrich endpoint down')
    }

    const row = makeRow()
    const { emitter, emitted } = makeEmitter()
    const summary = await enrichRows([row], emitter)

    expect(summary).toEqual({ totalTargets: 1, writtenRows: 0, partial: false, ok: false })
    expect(row.email).toBe('')
    const marks = emitted.filter(item => item.event === 'mapsEnrichCompleteMark')
    expect(marks).toHaveLength(1)
    expect(marks[0]?.data).toMatchObject({
      markMsg: 'count=1, written=0, partial=false, ok=false'
    })
  })

  it('每批完成后回调 onBatchSettled（批量模式重置卡死时钟）', async () => {
    rpcState.respond = async businesses => ({
      results: businesses.map(business => ({ key: business.domain, emails: [], medias: {} })),
      partial: false
    })

    const rows = Array.from({ length: 51 }, (_, i) =>
      makeRow({ domain: `site${i}.com`, placeId: `p${i}` })
    )
    const onBatchSettled = vi.fn()
    const { emitter } = makeEmitter()
    await enrichRows(rows, emitter, { batchSize: 50, onBatchSettled })

    expect(onBatchSettled).toHaveBeenCalledTimes(2)
  })

  it('partial=true 透传进打点与摘要', async () => {
    rpcState.respond = async businesses => ({
      results: businesses.map(business => ({ key: business.domain, emails: [], medias: {} })),
      partial: true
    })

    const { emitter, emitted } = makeEmitter()
    const summary = await enrichRows([makeRow()], emitter)

    expect(summary.partial).toBe(true)
    const marks = emitted.filter(item => item.event === 'mapsEnrichCompleteMark')
    expect(marks[0]?.data).toMatchObject({
      markMsg: 'count=1, written=1, partial=true, ok=true'
    })
  })

  it('单批失败不中止整次补全：失败批行保持空、剩余批次照常写回（ok=false）', async () => {
    let calls = 0
    rpcState.respond = async businesses => {
      calls += 1
      if (calls === 1) {
        throw new Error('rpc timeout')
      }
      return {
        results: businesses.map(business => ({
          key: business.domain,
          emails: [`info@${business.domain}`],
          medias: {}
        })),
        partial: false
      }
    }

    const failedRows = Array.from({ length: 50 }, (_, i) =>
      makeRow({ domain: `fail${i}.com`, placeId: `f${i}` })
    )
    const okRow = makeRow({ domain: 'last.com', placeId: 'p-last' })
    const { emitter, emitted } = makeEmitter()
    const summary = await enrichRows([...failedRows, okRow], emitter)

    // 第 1 批（50 条）失败后被跳过，第 2 批（1 条）继续执行并写回
    expect(rpcState.calls.map(batch => batch.length)).toEqual([50, 1])
    expect(summary).toEqual({
      totalTargets: 51,
      writtenRows: 1,
      partial: false,
      ok: false
    })
    expect(okRow.email).toBe('info@last.com')
    expect(failedRows[0]?.email).toBe('')
    const marks = emitted.filter(item => item.event === 'mapsEnrichCompleteMark')
    expect(marks).toHaveLength(1)
    expect(marks[0]?.data).toMatchObject({
      markMsg: 'count=51, written=1, partial=false, ok=false'
    })
  })
})

describe('formatSocialMedias', () => {
  it('按 canonical 平台序输出 `平台: url` 多行', () => {
    expect(
      formatSocialMedias({
        twitter: 'https://x.com/cafe',
        instagram: 'https://www.instagram.com/cafe',
        facebook: 'https://facebook.com/cafe'
      })
    ).toBe(
      'instagram: https://www.instagram.com/cafe\nfacebook: https://facebook.com/cafe\ntwitter: https://x.com/cafe'
    )
  })

  it('空结果为空串', () => {
    expect(formatSocialMedias({})).toBe('')
  })
})
