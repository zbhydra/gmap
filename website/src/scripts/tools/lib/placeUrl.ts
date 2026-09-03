/**
 * Google Maps place URL 的纯前端标识解析（W4 工具矩阵）。
 *
 * 解析规则移植 013 插件 parser/placeId.ts 的实现思路（hex 段提取 + fid →
 * Place ID 本地确定性换算），在网站侧重新实现为无依赖纯函数：
 * - URL 中全部 `0x…` hex 段（单段长度超上限的丢弃），取最后两段拼 fid；
 * - cid = fid 第二段 hex 转十进制；
 * - Place ID = base64url(protobuf `0a 12 09 <fid1 小端 8 字节> 11 <fid2 小端
 *   8 字节>`)，`ChIJ` 前缀即头部字节 `0a 12 09` 的编码产物；
 * - 链接里若已带 `!1sChIJ…`（Google 直接下发的 Place ID），优先采用。
 */

/** hex 标识正则（0x 前缀，与插件端同款）。 */
const HEX_ID_REGEX = /0x[0-9a-fA-F]+/g

/** 单段 hex 最大长度（013 远程配置 parseSchema.placeIdHexMaxLength 默认值）。 */
const HEX_MAX_LENGTH = 20

/** base64url 字符表（RFC 4648 §5，无 padding）。 */
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/** Google Maps 主域后缀（其余域一律视为非 Maps 地点页）。 */
const MAPS_HOST_SUFFIXES = ['google.com', 'google.co', 'maps.google.com']

/** 地点 URL 解析失败的稳定原因码（文案映射在页面层）。 */
export type PlaceUrlErrorCode = 'short-link' | 'invalid-url' | 'no-ids'

/** 地点 URL 解析结果。 */
export type PlaceUrlResult =
  | {
      /** 解析成功。 */
      ok: true
      /** `0x…:0x…` 形态的 fid。 */
      fid: string
      /** fid 第二段转十进制的 cid。 */
      cid: string
      /** `ChIJ…` 形态的 Place ID（URL 内建时用原值，否则由 fid 换算）。 */
      placeId: string
    }
  | {
      /** 解析失败。 */
      ok: false
      /** 失败原因码。 */
      error: PlaceUrlErrorCode
    }

/**
 * 从用户粘贴的 Maps 链接提取 Place ID / CID / FID。
 *
 * @param input 用户输入（完整 place URL；短链返回 short-link）。
 */
export function parsePlaceUrl(input: string): PlaceUrlResult {
  const url = normalizeUrl(input.trim())
  if (url === null) {
    return { ok: false, error: 'invalid-url' }
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    console.error(new Error('[place-url] Failed to parse a Maps URL; value redacted.'))
    return { ok: false, error: 'invalid-url' }
  }

  const host = parsed.hostname.toLowerCase()
  if (host.endsWith('app.goo.gl')) {
    // 跨域展开与纯前端约束冲突，短链明确不支持（plans N2 钉死）。
    return { ok: false, error: 'short-link' }
  }
  const isMapsHost =
    host === 'maps.google.com' ||
    (host.endsWith('google.com') &&
      MAPS_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith(`.${suffix}`)))
  if (!isMapsHost || !parsed.pathname.toLowerCase().includes('/maps/')) {
    return { ok: false, error: 'invalid-url' }
  }

  // URL 中直接内建 Place ID 的形态（`!1sChIJ…`）：优先采用原值。
  const directPlaceId = /!1s(ChIJ[A-Za-z0-9_-]+)/.exec(url)
  const hexIds = [...url.matchAll(HEX_ID_REGEX)].map(match => match[0]).filter(hex => hex.length <= HEX_MAX_LENGTH)
  const secondLast = hexIds[hexIds.length - 2]
  const last = hexIds[hexIds.length - 1]
  if (!secondLast || !last) {
    if (directPlaceId) {
      return { ok: true, fid: '', cid: '', placeId: directPlaceId[1] }
    }
    return { ok: false, error: 'no-ids' }
  }

  const fid = `${secondLast}:${last}`
  return {
    ok: true,
    fid,
    cid: deriveCidFromLrd(last),
    placeId: directPlaceId ? directPlaceId[1] : derivePlaceIdFromFid(fid)
  }
}

/** 补全协议前缀；无法补全时返回原值交由 URL 构造报错。 */
function normalizeUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) {
    return input
  }
  if (input.startsWith('//')) {
    return `https:${input}`
  }
  return `https://${input}`
}

/** lrd（fid 第二段 hex）转十进制 cid；非法返回空串。 */
export function deriveCidFromLrd(lrd: string): string {
  const hexLiteral = /^(?:0[xX])?([0-9a-fA-F]+)$/.exec(lrd.trim())
  if (!hexLiteral) {
    return ''
  }
  try {
    return BigInt(`0x${hexLiteral[1] as string}`).toString(10)
  } catch (error) {
    console.error(error)
    return ''
  }
}

/**
 * fid（`0x…:0x…`）→ Google Place ID（`ChIJ…`）的本地确定性换算。
 *
 * protobuf 布局：field 1（length-delimited，长度 18）内含两个 fixed64，分别
 * 是 fid 第一/第二段的小端字节序；整体 base64url 去掉 padding 后即为 Place ID。
 */
export function derivePlaceIdFromFid(fid: string): string {
  const [first = '', second = ''] = fid.split(':').map(part => part.trim())
  const firstValue = parseHexLiteral(first)
  const secondValue = parseHexLiteral(second)
  if (firstValue === null || secondValue === null) {
    return ''
  }

  const bytes = [0x0a, 0x12, 0x09, ...toUint64LittleEndian(firstValue), 0x11, ...toUint64LittleEndian(secondValue)]
  return base64UrlEncode(bytes)
}

/** 解析 `0x…` / 裸 hex 字面量为 BigInt；非法返回 null。 */
function parseHexLiteral(text: string): bigint | null {
  const match = /^(?:0[xX])?([0-9a-fA-F]+)$/.exec(text)
  if (!match) {
    return null
  }
  return BigInt(`0x${match[1] as string}`)
}

/** BigInt → 固定 8 字节小端序列（fid 段恒 < 2^64，超界按低 8 字节截断）。 */
function toUint64LittleEndian(value: bigint): number[] {
  const bytes: number[] = []
  for (let shift = 0; shift < 64; shift += 8) {
    bytes.push(Number((value >> BigInt(shift)) & 0xffn))
  }
  return bytes
}

/** 字节序列 base64url 编码（无 padding；Place ID 有效载荷恒 20 字节无余数问题）。 */
function base64UrlEncode(bytes: readonly number[]): string {
  let output = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const byte0 = bytes[i] as number
    const byte1 = i + 1 < bytes.length ? (bytes[i + 1] as number) : 0
    const byte2 = i + 2 < bytes.length ? (bytes[i + 2] as number) : 0
    const hasByte1 = i + 1 < bytes.length
    const hasByte2 = i + 2 < bytes.length

    output += BASE64URL_ALPHABET[byte0 >> 2]
    output += BASE64URL_ALPHABET[((byte0 & 0x03) << 4) | (byte1 >> 4)]
    if (hasByte1) {
      output += BASE64URL_ALPHABET[((byte1 & 0x0f) << 2) | (byte2 >> 6)]
    }
    if (hasByte2) {
      output += BASE64URL_ALPHABET[byte2 & 0x3f]
    }
  }
  return output
}
