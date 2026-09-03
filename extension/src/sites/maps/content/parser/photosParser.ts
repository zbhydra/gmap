/**
 * 照片 RPC（batchexecute / wTe8We）响应解析器（013 A3，03 逆向 §3.3）。
 *
 * 剥壳复用主搜索的格式 B 通道（slice 尾哨兵 → `d` 字段 → 去 XSSI 前缀 →
 * parse），得到 chunk 数组；每个 chunk 的 payload 字符串再 JSON.parse 得到
 * payload。照片项按 `photoUrl` / `videoUrl` **键名**递归收集（键名比下标
 * 抗漂移），过滤 URL 含 `streetview` 的项（竞品 removeStreeViweImg 语义）。
 * end 布尔与翻页 token 按 payload 根下标（远程配置可覆盖）。
 *
 * 诚实标注：照片响应没有实录黄金样本，`photosListPath` / `photosNextIndex`
 * 默认值按构造样本约定（end=第 10 位有 03 文档依据）；实录校准走远程配置。
 */

import type { MapsParseSchemaConfig } from '../../config/contract'
import type { JsonObject, JsonValue } from '@/core/rpc/types'
import { unwrapRpcPayload } from './shell'

/** 街景图 URL 特征（竞品 removeStreeViweImg 过滤标记）。 */
const STREETVIEW_URL_MARK = 'streetview'

/** 一次照片响应的解析结果。 */
export interface PhotosRpcParseResult {
  /** 本批媒体 URL（photoUrl/videoUrl，已过滤 streetview，未去重）。 */
  urls: string[]
  /** 翻页 token；无下一页为 null。 */
  nextToken: string | null
  /** 是否已到相册末尾。 */
  end: boolean
}

/**
 * 解析一次照片 batchexecute 响应。
 *
 * @param raw 完整响应文本。
 * @param schema 远程配置 parseSchema。
 * @throws 剥壳失败、chunk 定位失败时抛错（失败必须可见）。
 */
export function parsePhotosRpcResponse(
  raw: string,
  schema: MapsParseSchemaConfig
): PhotosRpcParseResult {
  const { data } = unwrapRpcPayload(raw, schema)
  const urls: string[] = []
  let nextToken: string | null = null
  let end = false

  for (const chunk of data) {
    if (!Array.isArray(chunk)) {
      continue
    }
    const payloadNode = chunk[schema.photosChunkPayloadIndex]
    if (typeof payloadNode !== 'string') {
      continue
    }

    let payload: JsonValue
    try {
      payload = JSON.parse(payloadNode) as JsonValue
    } catch (error) {
      console.error('[PhotosParser] 照片 RPC 候选 JSON 解析失败，继续尝试下一项:', error)
      continue
    }
    if (!Array.isArray(payload)) {
      continue
    }

    collectMediaUrls(payload, urls)

    const nextNode = payload[schema.photosNextIndex]
    if (typeof nextNode === 'string' && nextNode.length > 0) {
      nextToken = nextNode
    }
    if (payload[schema.photosEndIndex] === true) {
      end = true
    }
  }

  return { urls: urls.filter(url => !url.includes(STREETVIEW_URL_MARK)), nextToken, end }
}

/** 递归收集含 `photoUrl` / `videoUrl` 键的对象（键名驱动，抗内层结构漂移）。 */
function collectMediaUrls(value: JsonValue | undefined, output: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectMediaUrls(item, output)
    }
    return
  }
  if (!isJsonObject(value)) {
    return
  }

  const photoUrl = value.photoUrl
  if (typeof photoUrl === 'string' && photoUrl.length > 0) {
    output.push(photoUrl)
  }
  const videoUrl = value.videoUrl
  if (typeof videoUrl === 'string' && videoUrl.length > 0) {
    output.push(videoUrl)
  }
  for (const child of Object.values(value)) {
    if (typeof child === 'object' && child !== null) {
      collectMediaUrls(child, output)
    }
  }
}

/** JSON 对象守卫。 */
function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
