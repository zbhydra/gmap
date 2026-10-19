import { describe, expect, it } from 'vitest'
import { buildReviewWorkUrl } from '@/background/batch/workUrl'
import {
  isPhotosPageUrl,
  isGoogleReviewsUrl,
  isReviewsPageUrl,
  readReviewsWorkFid
} from '@/sites/maps/content/extractionUrl'

const PLACE_ID = 'ChIJm-xEoHxZwokRTStZFhfbrKA'
const FID = '0x89c2597ca044ec9b:0xa0acdb1716592b4d'

describe('采集工作页入口', () => {
  it.each([
    `https://search.google.com/local/reviews?placeid=${PLACE_ID}&hl=ja&gl=jp`,
    `https://www.google.com/maps/place/Gold+coffee/data=!1s${FID}?hl=ja&gl=jp`
  ])('两类输入统一转为 Maps 工作页并保留 locale：%s', input => {
    const result = buildReviewWorkUrl(
      input,
      'task',
      2,
      300,
      12
    )
    const url = new URL(result ?? '')
    expect(url.origin).toBe('https://www.google.com')
    expect(url.pathname).toBe('/maps/place/')
    expect(url.searchParams.get('q')).toBe(`place_id:${PLACE_ID}`)
    expect(readReviewsWorkFid(url)).toBe(FID)
    expect(url.searchParams.get('hl')).toBe('ja')
    expect(url.searchParams.get('gl')).toBe('jp')
    expect(isReviewsPageUrl(url)).toBe(true)
    expect(url.searchParams.get('gme_bulk_task')).toBe('task')
    expect(url.searchParams.get('gme_bulk_item')).toBe('2')
    expect(url.searchParams.get('gme_bulk_max')).toBe('300')
    expect(url.searchParams.get('gme_bulk_total')).toBe('12')
  })

  it('输入边界拒绝非 Google 页面、非 https 与缺少 Place ID 的评论链接', () => {
    for (const url of [
      'https://example.com/maps/place/0xa:0xb',
      'http://search.google.com/local/reviews?placeid=ChIJfoo',
      'https://search.google.com/local/reviews',
      'https://search.google.com/local/reviews?placeid=bad%20id',
      'https://search.google.com/local/reviews?placeid=ChIJfoo'
    ]) {
      expect(buildReviewWorkUrl(url, 'task', 0, 300, 12)).toBeNull()
    }
    const input = new URL(`https://search.google.com/local/reviews?placeid=${PLACE_ID}`)
    expect(isGoogleReviewsUrl(input)).toBe(true)
    expect(isReviewsPageUrl(input)).toBe(false)
    expect(isReviewsPageUrl(new URL('https://www.google.com/maps/place/Gold+coffee'))).toBe(false)
    expect(readReviewsWorkFid(new URL('https://www.google.com/maps/place/?gme_fid=0x1234'))).toBeNull()
  })

  it('图库候选严格限定已观察到的 Google host、path 与原生 lkt 标记', () => {
    expect(isPhotosPageUrl(new URL('https://www.google.com.hk/search?q=coffee#lkt=LocalPoiPhotos'))).toBe(true)
    expect(isPhotosPageUrl(new URL('https://www.google.com.hk/search?q=coffee'))).toBe(false)
    expect(isPhotosPageUrl(new URL('https://example.com/search#lkt=LocalPoiPhotos'))).toBe(false)
  })
})
