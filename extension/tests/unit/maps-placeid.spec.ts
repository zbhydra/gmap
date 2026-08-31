/**
 * place URL hex 标识解析与 fid → Place ID 本地换算单元测试。
 *
 * 基线说明：fid ↔ Place ID 的换算规则已用 U2 真实黄金样本验证——
 * format-B-spa-xhr-20places.txt 内按解析路径（len-8 → [i][1] → a[10]/a[78]）
 * 提取的 20 组 (fid, place_id) 配对，与本模块换算结果逐对严格相等（20/20）；
 * 该样本是搜索响应实录，可作换算正确性基线。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  deriveCidFromLrd,
  deriveLrdFromFid,
  derivePlaceIdFromFid,
  extractPlaceUrlIds
} from '@/sites/maps/content/parser/placeId'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { resetMapsConfigForTests } from '@/sites/maps/config/loader'
import { parseSearchRpcResponse } from '@/sites/maps/content/parser'

const PLACE_URL =
  'https://www.google.com/maps/place/Gold+coffee/@40.745,=-73.978,17z/data=!4m2!3m1!1s0x89c2597ca044ec9b:0xa0acdb1716592b4d!8m2!3d40.745!4d-73.978'

beforeEach(() => {
  resetMapsConfigForTests()
})

describe('place URL hex 标识提取', () => {
  it('取最后两个 hex 段拼 fid，最后一段为 lrd', () => {
    expect(extractPlaceUrlIds(PLACE_URL, 20)).toEqual({
      fid: '0x89c2597ca044ec9b:0xa0acdb1716592b4d',
      lrd: '0xa0acdb1716592b4d'
    })
  })

  it('超长 hex 段被过滤（上限 20），剩余不足两段返回 null', () => {
    const url = `${PLACE_URL}&hint=${'0x' + 'ab'.repeat(12)}`
    expect(extractPlaceUrlIds(url, 20)).toEqual({
      fid: '0x89c2597ca044ec9b:0xa0acdb1716592b4d',
      lrd: '0xa0acdb1716592b4d'
    })
    expect(extractPlaceUrlIds('https://www.google.com/maps/place/x', 20)).toBeNull()
    expect(extractPlaceUrlIds('https://www.google.com/maps/place/x?q=0x1234', 20)).toBeNull()
  })

  it('lrd 衍生 cid（hex 转十进制），非法输入为空串', () => {
    expect(deriveLrdFromFid('0x89c2597ca044ec9b:0xa0acdb1716592b4d')).toBe('0xa0acdb1716592b4d')
    expect(deriveCidFromLrd('0xa0acdb1716592b4d')).toBe('11577869634268375885')
    expect(deriveCidFromLrd('nothex')).toBe('')
  })
})

describe('fid → Place ID 本地换算', () => {
  it('固定样本：黄金样本第一组配对', () => {
    expect(derivePlaceIdFromFid('0x89c2590014a48ff9:0x34466e9af9759422')).toBe(
      'ChIJ-Y-kFABZwokRIpR1-ZpuRjQ'
    )
  })

  it('fid 形状非法时返回空串（调用方给出可见错误）', () => {
    expect(derivePlaceIdFromFid('not-a-fid')).toBe('')
    expect(derivePlaceIdFromFid('0xzz:0x1234')).toBe('')
  })

  it('真实黄金样本基线：20 组 (fid, place_id) 配对与换算结果逐对相等', () => {
    // 黄金样本为搜索 RPC 实录响应；place_id 与 fid 是同一 feature id 的两种
    // 编码。配对提取走 U2 的解析路径（schema 驱动：len-8 → [i][1] →
    // fid=a[10] / placeId=a[78]，与 maps-parser.spec 同一解析基线），
    // 逐对断言 derivePlaceIdFromFid(fid) === place_id，严格相等 20/20。
    const raw = readFileSync(
      resolve(process.cwd(), 'tests/fixtures/golden-samples/format-B-spa-xhr-20places.txt'),
      'utf-8'
    )
    const result = parseSearchRpcResponse(raw, DEFAULT_MAPS_CONFIG.parseSchema)

    expect(result.rows).toHaveLength(20)
    for (const row of result.rows) {
      expect(row.fid).toMatch(/^0x[0-9a-f]+:0x[0-9a-f]+$/)
      expect(row.placeId).toMatch(/^ChIJ[0-9A-Za-z_-]{23}$/)
      expect(derivePlaceIdFromFid(row.fid)).toBe(row.placeId)
    }
  })
})
