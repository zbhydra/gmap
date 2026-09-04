/**
 * Email/社媒补全单元测试（016 E6 二期验收行为直接覆盖）。
 *
 * 覆盖面：websiteKey（协议补齐/端口剥离/大小写/尾点/非法输入）、
 * collectEnrichTargets（无 website 跳过 / 同主机名去重 / 目标字段映射）、
 * enrichRows（先清占位、分批 batchSize、结果按主机名写回同域多行、失败
 * 批次收敛 ok=false 行保持空、enrich_complete 打点成功与失败均发）、
 * formatSocialMedias（canonical 平台序 + 未知平台后置 + 多行格式）。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { BingExportRow } from '../../src/sites/bing/content/parser'
import { PRO_ENHANCEMENT_PLACEHOLDER } from '../../src/sites/bing/content/parser'
import type { EnrichBusinessInput, EnrichResponse } from '../../src/sites/bing/enrich/types'
import {
  collectEnrichTargets,
  enrichRows,
  formatSocialMedias,
  websiteKey
} from '../../src/sites/bing/enrich/enrichClient'
import { MARK_TYPE } from '../../src/core/api/mark/types'

/** RPC 响应编排状态（vi.hoisted 提升到 mock 工厂之前）。 */
const rpcState = vi.hoisted(() => ({
  /** 每次调 enrichBusinesses 收到的批次入参。 */
  calls: [] as Array<Array<{ website: string }>>,
  /** 注入的响应器：返回响应载荷或抛错。 */
  respond: null as null | ((businesses: EnrichBusinessInput[]) => Promise<EnrichResponse>)
}))

vi.mock('../../src/content/rpc/background.rpc', () => ({
  BackgroundChannel: class {
    async enrichBusinesses(params: {
      businesses: EnrichBusinessInput[]
    }): Promise<EnrichResponse> {
      rpcState.calls.push(params.businesses)
      if (rpcState.respond === null) {
        throw new Error('no responder configured')
      }
      return rpcState.respond(params.businesses)
    }

    destroy(): void {}
  }
}))

vi.mock('../../src/sites/bing/content/marks', () => ({
  recordContentMark: vi.fn()
}))

import { recordContentMark } from '../../src/sites/bing/content/marks'

/** 行工厂：默认带 website，partial 覆盖 5 个云端挖掘列。 */
function makeRow(website: string, partial: Partial<BingExportRow> = {}): BingExportRow {
  return {
    id: `ypid:YN${Math.random().toString(16).slice(2, 18).toUpperCase()}`,
    name: 'Business',
    address: '1 Test St',
    featuredImage: '',
    bingMapsUrl: '',
    latitude: null,
    longitude: null,
    rating: null,
    ratingInfo: '',
    category: '',
    openHours: '',
    website,
    phone: '',
    emails: PRO_ENHANCEMENT_PLACEHOLDER,
    socialMedias: PRO_ENHANCEMENT_PLACEHOLDER,
    facebook: PRO_ENHANCEMENT_PLACEHOLDER,
    instagram: PRO_ENHANCEMENT_PLACEHOLDER,
    twitter: PRO_ENHANCEMENT_PLACEHOLDER,
    ...partial
  }
}

beforeEach(() => {
  rpcState.calls.length = 0
  rpcState.respond = null
  vi.mocked(recordContentMark).mockClear()
})

describe('websiteKey', () => {
  it('补齐协议后取主机名（大小写不敏感、去端口、去尾点）', () => {
    expect(websiteKey('https://Cafe.com/')).toBe('cafe.com')
    expect(websiteKey('cafe.com')).toBe('cafe.com')
    expect(websiteKey('https://cafe.com:8443/menu')).toBe('cafe.com')
    expect(websiteKey('https://cafe.com.')).toBe('cafe.com')
  })

  it('空串与非法输入返回空串', () => {
    expect(websiteKey('')).toBe('')
    expect(websiteKey('http://')).toBe('')
  })
})

describe('collectEnrichTargets', () => {
  it('无 website 行跳过；同主机名多行去重为一目标；domain 恒空串', () => {
    const rows = [
      makeRow('https://cafe.com'),
      makeRow('http://CAFE.com/other'),
      makeRow(''),
      makeRow('https://bar.com')
    ]
    const targets = collectEnrichTargets(rows)
    expect(targets).toHaveLength(2)
    expect(targets[0]).toEqual({
      domain: '',
      website: 'https://cafe.com',
      name: 'Business',
      address: '1 Test St'
    })
    expect(targets[1]?.website).toBe('https://bar.com')
  })
})

describe('formatSocialMedias', () => {
  it('canonical 平台序在前、未知平台后置，行格式 `平台: url`', () => {
    const text = formatSocialMedias({
      twitter: 'https://x.com/cafe',
      facebook: 'https://facebook.com/cafe',
      mastodon: 'https://mastodon.social/@cafe'
    })
    expect(text).toBe(
      [
        'facebook: https://facebook.com/cafe',
        'twitter: https://x.com/cafe',
        'mastodon: https://mastodon.social/@cafe'
      ].join('\n')
    )
  })
})

describe('enrichRows', () => {
  it('先清占位再写回：5 列覆盖为结果，无 website 行同样清占位留空', async () => {
    const withSite = makeRow('https://cafe.com')
    const noSite = makeRow('')
    rpcState.respond = async businesses => ({
      results: businesses.map(business => ({
        key: websiteKey(business.website),
        emails: ['hi@cafe.com', 'hi2@cafe.com'],
        medias: { facebook: 'https://facebook.com/cafe', instagram: 'https://instagram.com/cafe' }
      })),
      partial: false
    })

    const summary = await enrichRows([withSite, noSite])

    expect(summary).toEqual({ totalTargets: 1, writtenRows: 1, partial: false, ok: true })
    expect(withSite.emails).toBe('hi@cafe.com,hi2@cafe.com')
    expect(withSite.socialMedias).toBe(
      'instagram: https://instagram.com/cafe\nfacebook: https://facebook.com/cafe'
    )
    expect(withSite.facebook).toBe('https://facebook.com/cafe')
    expect(withSite.instagram).toBe('https://instagram.com/cafe')
    expect(withSite.twitter).toBe('')
    for (const column of [noSite.emails, noSite.socialMedias, noSite.facebook, noSite.instagram, noSite.twitter]) {
      expect(column).toBe('')
    }
  })

  it('同主机名多行共用一次补全并全部写回；分批按 batchSize 切片', async () => {
    const rows = [
      makeRow('https://a.com'),
      makeRow('https://a.com'),
      makeRow('https://b.com'),
      makeRow('https://c.com')
    ]
    rpcState.respond = async businesses => ({
      results: businesses.map(business => ({
        key: websiteKey(business.website),
        emails: [`owner@${websiteKey(business.website)}`],
        medias: {}
      })),
      partial: true
    })

    const summary = await enrichRows(rows, { batchSize: 2 })

    expect(rpcState.calls.map(batch => batch.length)).toEqual([2, 1])
    expect(summary.totalTargets).toBe(3)
    expect(summary.writtenRows).toBe(4)
    expect(summary.partial).toBe(true)
    expect(rows[0]?.emails).toBe('owner@a.com')
    expect(rows[1]?.emails).toBe('owner@a.com')
    expect(rows[3]?.emails).toBe('owner@c.com')
  })

  it('单批失败收敛：ok=false、该批行保持空、继续剩余批次、打点失败也发', async () => {
    const failed = makeRow('https://bad.com')
    const succeeded = makeRow('https://good.com')
    rpcState.respond = async businesses => {
      if (businesses.some(business => websiteKey(business.website) === 'bad.com')) {
        throw new Error('rpc timeout')
      }
      return {
        results: businesses.map(business => ({
          key: websiteKey(business.website),
          emails: ['ok@good.com'],
          medias: {}
        })),
        partial: false
      }
    }

    const summary = await enrichRows([failed, succeeded], { batchSize: 1 })

    expect(summary.ok).toBe(false)
    expect(summary.writtenRows).toBe(1)
    expect(failed.emails).toBe('')
    expect(succeeded.emails).toBe('ok@good.com')
    expect(recordContentMark).toHaveBeenCalledWith(
      MARK_TYPE.ENRICH_COMPLETE,
      'count=2, written=1, partial=false, ok=false'
    )
  })

  it('全部成功也发 enrich_complete 打点（含摘要）', async () => {
    rpcState.respond = async () => ({ results: [], partial: false })
    await enrichRows([makeRow('https://a.com')])
    expect(recordContentMark).toHaveBeenCalledWith(
      MARK_TYPE.ENRICH_COMPLETE,
      'count=1, written=0, partial=false, ok=true'
    )
  })
})
