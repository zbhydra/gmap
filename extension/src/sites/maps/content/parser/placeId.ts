/**
 * place URL 的 hex 标识解析与 fid → Place ID 本地换算（013 A2 入口）。
 *
 * 入口解析（03 逆向 §3.2 getReviewsURL）：正则提取 URL 中全部 `0x…` 十六进制
 * 段（长度超上限的丢弃），最后两段拼 fid、最后一段即 lrd，cid 由 lrd 转十进制。
 *
 * Place ID 换算是**纯本地确定性编码**，无需后端/Google 通道：`ChIJ…` 形态的
 * Place ID 是 base64url(protobuf `0a 12 09 <fid1 小端 8 字节> 11 <fid2 小端
 * 8 字节>`)。该换算已用 U2 真实黄金样本验证：format-B 样本内 20 组
 * (fid, place_id) 配对 20/20 与换算结果一致（maps-placeid.spec.ts）。
 */

/** hex 标识正则（0x 前缀，03 逆向 §3.2 `/(0x[a-zA-Z0-9]+)/gm`）。 */
const HEX_ID_REGEX = /0x[0-9a-zA-Z]+/g

/** base64url 字符表（RFC 4648 §5，无 padding）。 */
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

/** place URL 的 hex 标识解析结果。 */
export interface PlaceUrlIds {
  /** `0x…:0x…` 形态的 fid（倒数第二段:最后一段）。 */
  fid: string
  /** lrd（最后一段 hex，评论/照片 RPC 的定位参数）。 */
  lrd: string
}

/**
 * 从 place 详情页 URL 提取 fid 与 lrd。
 *
 * @param url 页面 URL（含 data 参数）。
 * @param hexMaxLength 单段 hex 最大长度（远程配置 parseSchema.placeIdHexMaxLength）。
 * @returns 解析失败（hex 段不足两个）返回 null，由调用方给出用户可见错误。
 */
export function extractPlaceUrlIds(url: string, hexMaxLength: number): PlaceUrlIds | null {
  const hexIds = [...url.matchAll(HEX_ID_REGEX)]
    .map(match => match[0])
    .filter(hex => hex.length <= hexMaxLength)

  const secondLast = hexIds[hexIds.length - 2]
  const last = hexIds[hexIds.length - 1]
  if (!secondLast || !last) {
    return null
  }

  return { fid: `${secondLast}:${last}`, lrd: last }
}

/**
 * 由 fid 衍生 lrd（fid 第二段；缺失返回空串）。
 */
export function deriveLrdFromFid(fid: string): string {
  return fid.split(':')[1]?.trim() ?? ''
}

/**
 * 由 lrd 衍生 cid（hex 转十进制；等价 U2 的 deriveCidFromFid 第二段逻辑）。
 */
export function deriveCidFromLrd(lrd: string): string {
  const hexLiteral = /^(?:0[xX])?([0-9a-fA-F]+)$/.exec(lrd.trim())
  if (!hexLiteral) {
    return ''
  }
  try {
    return BigInt(`0x${hexLiteral[1] as string}`).toString(10)
  } catch (error) {
    console.error('[PlaceId] 十六进制 CID 转十进制失败:', error)
    return ''
  }
}

/**
 * fid（`0x…:0x…`）→ Google Place ID（`ChIJ…`）的本地确定性换算。
 *
 * protobuf 布局：field 1（length-delimited，长度 18）内含两个 fixed64，
 * 分别是 fid 第一/第二段的小端字节序；整体 base64url 去掉 padding 后
 * 即为 Place ID——`ChIJ` 正是头部字节 `0a 12 09` 的编码产物，无需手工叠加。
 *
 * @param fid 形如 `0x89c2…:0x64f5…`。
 * @returns 27 字符 Place ID；fid 形状非法时返回空串（调用方给出可见错误）。
 */
export function derivePlaceIdFromFid(fid: string): string {
  const [first = '', second = ''] = fid.split(':').map(part => part.trim())
  const firstValue = parseHexLiteral(first)
  const secondValue = parseHexLiteral(second)
  if (firstValue === null || secondValue === null) {
    return ''
  }

  const bytes = [
    0x0a,
    0x12,
    0x09,
    ...toUint64LittleEndian(firstValue),
    0x11,
    ...toUint64LittleEndian(secondValue)
  ]
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

/** BigInt → 固定 8 字节小端序列（超 64 位按低 8 字节截断， fid 段恒 < 2^64）。 */
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
