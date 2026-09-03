/**
 * 评论 RPC 响应解析器（013 A2，03 逆向 §3.2）。
 *
 * 主解析器 txtToJson：响应按行 split，第 3 行 JSON.parse 得到根数组 d，
 * 列表在 d[1][10][2]、翻页 token 在 d[1][10][6]（下标全部由远程配置
 * parseSchema 驱动）。回退解析器（HTML DOM）由
 * parseSchema.reviewsHtmlFallbackEnabled 开关控制，默认关闭——竞品时代的
 * 评论区页面结构已不可信，开关仅作为服务端治理通道保留。
 *
 * 诚实标注：评论响应没有实录黄金样本（scratch 只 archived 了搜索样本），
 * 下标默认值按 03 号协议文档对齐并由构造样本单测覆盖；实录校准走远程
 * 配置覆盖，与 A1 的下标漂移治理同路。
 */

import type { MapsParseSchemaConfig, MapsReviewsDomConfig } from '../../config/contract'
import type { JsonValue } from '@/core/rpc/types'
import { compileSchemaPath, getValueAt } from './path'

/** 单条评论解析结果（导出 11 列的数据源，A5 评论区字段字典）。 */
export interface ReviewRow {
  /** 评分（1~5）。 */
  rating: string
  /** 相对日期原文（如 "3 weeks ago"）。 */
  date: string
  /** 作者名。 */
  author: string
  /** 作者头像 URL。 */
  avatar: string
  /** 作者主页 URL。 */
  authorUrl: string
  /** 点赞数。 */
  likes: string
  /** 评论正文。 */
  comment: string
  /** 内嵌照片 URL 列表（已统一尺寸参数）。 */
  photos: string[]
  /** 商家回复正文。 */
  reply: string
  /** 商家回复日期。 */
  replyDate: string
  /** 评论链接。 */
  reviewUrl: string
}

/** 一次评论响应的解析结果。 */
export interface ReviewsRpcParseResult {
  /** 本批评论（未去重）。 */
  rows: ReviewRow[]
  /** 翻页 token；无下一页为 null。 */
  nextToken: string | null
  /** 是否走了 HTML 回退解析（诊断用）。 */
  viaFallback: boolean
}

/**
 * 解析一次评论 RPC 响应。
 *
 * @param raw 完整响应文本。
 * @param schema 远程配置 parseSchema。
 * @param reviewsDom 评论/照片页选择器组（HTML 回退使用）。
 * @throws 主解析失败且回退未启用/也失败时抛错（失败必须可见）。
 */
export function parseReviewsRpcResponse(
  raw: string,
  schema: MapsParseSchemaConfig,
  reviewsDom: MapsReviewsDomConfig
): ReviewsRpcParseResult {
  if (schema.reviewsHtmlFallbackEnabled) {
    const fallback = parseReviewsHtmlFallback(raw, reviewsDom)
    if (fallback !== null) {
      return { ...fallback, viaFallback: true }
    }
  }

  const lines = raw.split('\n')
  const line = lines[schema.reviewsLineIndex]
  if (typeof line !== 'string' || line.trim().length === 0) {
    throw new Error(
      `[ReviewsParser] 响应第 ${schema.reviewsLineIndex + 1} 行缺失或为空，无法解析评论列表`
    )
  }

  let root: JsonValue
  try {
    root = JSON.parse(line) as JsonValue
  } catch (error) {
    console.error('[ReviewsParser] 评论 RPC JSON 解析失败:', error)
    throw new Error(
      `[ReviewsParser] 响应第 ${schema.reviewsLineIndex + 1} 行 JSON 解析失败: ${describeError(error)}`
    )
  }

  const listNode = getValueAt(root, compileSchemaPath(schema.reviewsListPath, 0))
  if (!Array.isArray(listNode)) {
    throw new Error(
      `[ReviewsParser] 评论列表定位失败: reviewsListPath=${schema.reviewsListPath}, head=${raw.slice(0, 32)}`
    )
  }

  const rows = listNode.map(item => parseReviewRow(item, schema))
  const tokenNode = getValueAt(root, compileSchemaPath(schema.reviewsTokenPath, 0))
  return {
    rows,
    nextToken: typeof tokenNode === 'string' && tokenNode.length > 0 ? tokenNode : null,
    viaFallback: false
  }
}

/** 单条评论解析（schema 下标 + 缺失容错，任一字段缺失为空串）。 */
function parseReviewRow(item: JsonValue | undefined, schema: MapsParseSchemaConfig): ReviewRow {
  const entry = Array.isArray(item) ? item : []
  const fields = schema.reviewsFields

  const photosNode = getValueAt(entry, fields.photos ?? [])
  const photos = collectPhotoUrls(
    photosNode,
    schema.reviewsPhotosItemIndex,
    schema.reviewsPhotoSizeParam
  )

  return {
    rating: textAt(entry, fields.rate),
    date: textAt(entry, fields.date),
    author: textAt(entry, fields.name),
    avatar: textAt(entry, fields.avatar),
    authorUrl: textAt(entry, fields.authorUrl),
    likes: textAt(entry, fields.like),
    comment: textAt(entry, fields.comment),
    photos,
    reply: textAt(entry, fields.reply),
    replyDate: textAt(entry, fields.replyDate),
    reviewUrl: textAt(entry, fields.reviewUrl)
  }
}

/** 评论内嵌照片 URL 收集：`r[14][*][itemIndex]`，统一 `=w1000` 尺寸（A2 规则）。 */
function collectPhotoUrls(
  photosNode: JsonValue | undefined,
  itemIndex: number,
  sizeParam: string
): string[] {
  if (!Array.isArray(photosNode)) {
    return []
  }
  return photosNode
    .map(entry => (Array.isArray(entry) ? entry[itemIndex] : undefined))
    .filter((url): url is string => typeof url === 'string' && url.length > 0)
    .map(url => normalizePhotoUrl(url, sizeParam))
}

/** 照片 URL 统一尺寸：取 `=` 前段 + `=` + 配置尺寸参数（竞品 split('=')[0]+"=w1000"）。 */
function normalizePhotoUrl(url: string, sizeParam: string): string {
  if (sizeParam.length === 0) {
    return url
  }
  return `${url.split('=')[0] ?? url}=${sizeParam}`
}

/**
 * HTML 回退解析（默认关闭）：DOMParser 解析响应文本，按 dom 组选择器逐行取值。
 *
 * 响应不是可解析的评论 HTML（如 JSON 形态）时返回 null，由调用方回退主解析。
 */
function parseReviewsHtmlFallback(
  raw: string,
  reviewsDom: MapsReviewsDomConfig
): Omit<ReviewsRpcParseResult, 'viaFallback'> | null {
  const doc = new DOMParser().parseFromString(raw, 'text/html')
  const rowNodes = doc.querySelectorAll(reviewsDom.reviewsHtmlReviewRow)
  if (rowNodes.length === 0) {
    return null
  }

  const rows: ReviewRow[] = []
  for (const node of rowNodes) {
    const ratingNode = node.querySelector(reviewsDom.reviewsHtmlRating)
    const ratingLabel = ratingNode?.getAttribute('aria-label') ?? ''
    rows.push({
      rating: extractLeadingNumber(ratingLabel),
      date: '',
      author: (node.querySelector(reviewsDom.reviewsHtmlAuthor)?.textContent ?? '').trim(),
      avatar: '',
      authorUrl: '',
      likes: '',
      comment: (node.querySelector(reviewsDom.reviewsHtmlText)?.textContent ?? '').trim(),
      photos: [],
      reply: (node.querySelector(reviewsDom.reviewsHtmlReply)?.textContent ?? '').trim(),
      replyDate: '',
      reviewUrl: ''
    })
  }

  const tokenNode = doc.querySelector(reviewsDom.reviewsHtmlNextToken)
  const nextToken = tokenNode?.getAttribute('data-next-page-token') ?? tokenNode?.textContent ?? ''

  return { rows, nextToken: nextToken.length > 0 ? nextToken : null }
}

/** 从 aria-label 文案（如 "5 stars"）抽数值文本；无数字为空串。 */
function extractLeadingNumber(label: string): string {
  const match = /\d+(?:\.\d+)?/.exec(label)
  return match ? (match[0] as string) : ''
}

/** 评论行的文本取值（路径缺失容错，非字符串为空串）。 */
function textAt(entry: readonly JsonValue[], path: number[] | undefined): string {
  const value = getValueAt(entry, path ?? [])
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
}

/** 错误消息简述。 */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
