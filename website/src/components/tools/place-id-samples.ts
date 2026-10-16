/**
 * Place ID Finder 的示例链接与插画样例（虚构数据，README §10）。
 *
 * - 城市示例与 e2e/tools.spec.ts 是同一条 URL，首屏自动演示与推导图初始值都用它；
 * - 咖啡店为虚构商户 Ember & Oak Coffee，FID / CID / Place ID 按 lib/placeUrl.ts 算法自洽；
 * - 短链示例用于展示短链报错态。
 */
import { parsePlaceUrl } from '../../scripts/tools/lib/placeUrl'

export const PLACE_EXAMPLES = {
  city: 'https://www.google.com/maps/place/San+Francisco/@37.774929,-122.419416,17z/data=!3m1!4b1!4m5!3m4!1s0x8085809c23193567:0xa64e70a2e1a9c0e5!8m2!3d37.774929!4d-122.419416',
  business:
    'https://www.google.com/maps/place/Ember+%26+Oak+Coffee/@45.504912,-122.635377,17z/data=!3m1!4b1!4m6!3m5!1s0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab!8m2!3d45.504912!4d-122.635377!16s%2Fg%2F11c5x9_qk_',
  shortLink: 'https://maps.app.goo.gl/x8Qw2Lr5Zp7Kd3Vt9'
} as const

/** 城市示例的解析结果（构建期计算）：推导图初始值与三步插画里的截断值。 */
export function citySample(): { fid: string; cid: string; placeId: string } {
  const outcome = parsePlaceUrl(PLACE_EXAMPLES.city)
  if (!outcome.ok || !outcome.fid) throw new Error('[place-id-samples] The city example must decode to a FID.')
  return { fid: outcome.fid, cid: outcome.cid, placeId: outcome.placeId }
}

/** 插画里的截断写法：保留前 length 个字符并接省略号。 */
export function clip(value: string, length: number): string {
  return `${value.slice(0, length)}…`
}
