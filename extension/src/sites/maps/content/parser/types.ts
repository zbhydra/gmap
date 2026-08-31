/**
 * Maps 搜索 RPC 解析器的数据模型。
 *
 * RPC 响应是任意深度的 JSON 结构，统一用 core/rpc 的 JsonValue 建模
 * （递归结构无法给出静态形状，又不允许 any/unknown）。
 */

import type { JsonArray } from '@/core/rpc/types'

/** 响应格式标记。 */
export type MapsRpcFormat = 'A' | 'B'

/** 剥壳结果：格式 A/B 剥壳后得到的根大数组。 */
export interface UnwrappedRpcPayload {
  /** 响应格式（A 直接导航 / B SPA XHR，见 10 号实测报告）。 */
  format: MapsRpcFormat
  /** 剥壳后的根数组（含关键词、商家列表等所有顶层段）。 */
  data: JsonArray
}

/**
 * 单条商家解析结果 = A5 字段字典 36 列中全部 RPC 可直取列（其余列在导出层：
 * 衍生列由 columns.ts 现算，Email/Social Medias/Plus Code 数据源归 U8）。
 * 全字段文本化（数值/布尔转字符串，缺失为空串），数值语义由导出层还原。
 */
export interface MapsPlaceRow {
  /** 商家名。 */
  name: string
  /** 类目（多个以逗号拼接导出）。 */
  categories: string[]
  /** 完整地址（超 200 字符置空防脏数据，A5 规则）。 */
  fullAddress: string
  /** 街道（数组 join 成串）。 */
  street: string
  /** 市镇（数组 join 成串）。 */
  municipality: string
  /** 商家简介（主文本 + 附加段拼接，逆向 04 规则）。 */
  description: string
  /** About 分组解析结果 `组名: [项, 项]`（组间换行）。 */
  about: string
  /** 时区名。 */
  timeZone: string
  /** 价位（`$$` 或 `$1–10` 区间文本）。 */
  price: string
  /** 附加注记。 */
  note: string
  /** 设施（逗号拼接）。 */
  amenities: string
  /** 酒店星级。 */
  hotelClass: string
  /** 主电话。 */
  phone: string
  /** 其余电话（逗号拼接）。 */
  phones: string
  /** 认领状态（YES/NO，claimed 源 URL 含未认领标记即 NO）。 */
  claimed: string
  /** 商家主名。 */
  owner: string
  /** 商家主 ID（Owner Link 由其衍生）。 */
  ownerId: string
  /** 评论页链接（非 https 置空）。 */
  reviewUrl: string
  /** 评分（缺失为空串）。 */
  rating: string
  /** 评论数（缺失为空串）。 */
  reviewCount: string
  /** 纬度。 */
  latitude: string
  /** 经度。 */
  longitude: string
  /** 官网（不含 http(s) 的脏值置空）。 */
  website: string
  /** 官网域名。 */
  domain: string
  /** 营业时间 `周几(YYYY-MM-DD): [HH:mm-HH:mm,…]`（歇业 Closed，日间换行）。 */
  openingHours: string
  /** 封面图（非 http(s) 置空）。 */
  featuredImage: string
  /** cid（fid 第二段 hex 转十进制；fid 缺失为空串）。 */
  cid: string
  /** fid（形如 `0x…:0x…`）。 */
  fid: string
  /** Google Place ID。 */
  placeId: string
  /** Knowledge Graph ID（Google Knowledge URL 由其衍生）。 */
  kgmid: string
  /** 官网 Email（逗号分隔；解析态恒空，采集完成边沿由 enrich 补全写入，U8）。 */
  email: string
  /** 官网社媒链接（`平台: url` 多行；解析态恒空，enrich 写入，U8）。 */
  socialMedias: string
}

/** 一次搜索 RPC 响应的解析结果。 */
export interface MapsRpcParseResult {
  /** 搜索关键词（剥壳后根数组首元素，A1 拍板：不读 DOM）。 */
  query: string
  /** 本批解析出的商家行（未去重）。 */
  rows: MapsPlaceRow[]
  /** 命中的响应格式。 */
  format: MapsRpcFormat
}
