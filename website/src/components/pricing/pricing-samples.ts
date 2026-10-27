/**
 * Pricing ④ 额度单位动画的样例（虚构，设计稿 README §10）。
 *
 * - records 卡：商户沿用首页剧场的 Portland 咖啡店（名称、评分、555-01xx 电话一致）；
 * - requests 卡：请求日志按 014 tech-API与MCP.md 的 REST 路径（POST /api/external/maps/{search,reviews}），
 *   关键词沿用首页剧场三组，401 一行演示失败调用不计额度。
 * - 用量表的已用量只是演示数字；上限由页面取 Online / API 首个付费档的卡面额度。
 * 界面文案不在这里，走 i18n 的 pages.pricing.usage。
 */
import { SAMPLE_FID, THEATER_DATASETS, theaterRow, type TheaterRowView } from '../home/home-samples'

const [COFFEE, DENTISTS, PLUMBERS] = THEATER_DATASETS

/** records 卡依次入列的商户（剧场第 0、1、2、3、8、7 行）。 */
export const USAGE_BUSINESSES: readonly TheaterRowView[] = [0, 1, 2, 3, 8, 7].map(index => theaterRow(COFFEE, index))

/** records 卡首屏预置的商户（带齐附带数据）。 */
export const USAGE_BUSINESS_PRESET = [4, 5] as const

/** 请求日志的一行：路径、主要参数与 HTTP 状态。 */
export interface UsageCall {
  path: string
  param: string
  status: 200 | 401
}

const REST_PATH = '/api/external/maps'

export const USAGE_CALLS: readonly UsageCall[] = [
  { path: `${REST_PATH}/search`, param: COFFEE.keyword, status: 200 },
  { path: `${REST_PATH}/reviews`, param: SAMPLE_FID, status: 200 },
  { path: `${REST_PATH}/search`, param: DENTISTS.keyword, status: 401 },
  { path: `${REST_PATH}/search`, param: PLUMBERS.keyword, status: 200 },
  { path: `${REST_PATH}/reviews`, param: '0x8085809c23193567:0xa64e70a2e1a9c0e5', status: 200 }
]

/** 请求日志首屏预置的行。 */
export const USAGE_CALL_PRESET = [2, 3, 4] as const

/** 用量表演示的本月已用量。 */
export const USAGE_USED = { records: 1284, requests: 412 } as const

/** 每月 1 日重置曲线的横轴日期（只取月日展示，年份无意义）。 */
export const RESET_AXIS_DATES: readonly Date[] = [
  [9, 1], [9, 15], [10, 1], [10, 15], [11, 1]
].map(([month, day]) => new Date(Date.UTC(2026, month, day)))
