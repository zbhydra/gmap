/**
 * Maps Email/社媒补全共享类型（013 A4，U8）。
 *
 * 形状对齐竞品 findV3 出参（`{emails[], medias{}}`，A4 调研）；服务端契约见
 * backend `POST /api/client/maps/enrich`。
 */

/** 待补全的单条商家（字段与 36 列导出行对应）。 */
export interface MapsEnrichBusinessInput {
  /** 官网域名（空串 = 无官网，服务端直接空结果）。 */
  domain: string
  /** 完整官网 URL（优先于 domain 拼 URL）。 */
  website: string
  /** 商家名（预留：搜索兜底数据源，当前未消费）。 */
  name: string
  /** 地址（预留：同上）。 */
  address: string
}

/** 单条商家补全结果（与请求 businesses 位置对齐）。 */
export interface MapsEnrichResult {
  /** 归属键 = domain（无官网为空串）。 */
  key: string
  /** 官网抽取的邮箱（mailto 优先 + 文本正则，已滤典型误报）。 */
  emails: string[]
  /** 社媒链接，键为平台名（instagram/facebook/youtube/tiktok/linkedin/twitter）。 */
  medias: Record<string, string>
}

/** 补全端点响应载荷。 */
export interface MapsEnrichResponse {
  /** 与请求 businesses 位置对齐的结果数组。 */
  results: MapsEnrichResult[]
  /** 批预算超时截断标注（true = 部分条目因超时返回空）。 */
  partial: boolean
}

/** 平台输出顺序（导出 Social Medias 列的行序，与 A4 调研枚举一致）。 */
export const ENRICH_PLATFORM_ORDER: readonly string[] = [
  'instagram',
  'facebook',
  'youtube',
  'tiktok',
  'linkedin',
  'twitter'
]
