/**
 * Email/社媒补全共享类型（016 E6 二期；服务端为 013 A4 自研能力，gmap/bing
 * 两线共享同一端点与合同，输入为商家官网 URL，平台无关）。
 *
 * 形状对齐 gmap 线 `extension/src/sites/maps/enrich/types.ts` 与竞品 findV3
 * 出参（`{emails[], medias{}}`，A4 调研）；服务端契约见 backend
 * `POST /api/client/maps/enrich`。
 */

/** 待补全的单条商家（Bing 18 列行无独立 domain 字段，归属键取 website 主机名）。 */
export interface EnrichBusinessInput {
  /** 官网域名（Bing 行恒空串：服务端回退 website 主机名做归属键）。 */
  domain: string
  /** 完整官网 URL。 */
  website: string
  /** 商家名（服务端预留：搜索兜底数据源，当前未消费）。 */
  name: string
  /** 地址（预留：同上）。 */
  address: string
}

/** 单条商家补全结果（与请求 businesses 位置对齐）。 */
export interface EnrichResult {
  /** 归属键 = website 主机名（无官网为空串）。 */
  key: string
  /** 官网抽取的邮箱（mailto 优先 + 文本正则，已滤典型误报）。 */
  emails: string[]
  /** 社媒链接，键为平台名（instagram/facebook/youtube/tiktok/linkedin/twitter）。 */
  medias: Record<string, string>
}

/** 补全端点响应载荷。 */
export interface EnrichResponse {
  /** 与请求 businesses 位置对齐的结果数组。 */
  results: EnrichResult[]
  /** 批预算超时截断标注（true = 部分条目因超时返回空）。 */
  partial: boolean
}

/** 平台输出顺序（Social Medias 聚合列的平台行序，与 A4 调研枚举一致）。 */
export const ENRICH_PLATFORM_ORDER: readonly string[] = [
  'instagram',
  'facebook',
  'youtube',
  'tiktok',
  'linkedin',
  'twitter'
]
