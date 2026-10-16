/**
 * 云端页演示数据。商户、关键词与任务号均为虚构（电话一律 555-01xx 段，任务号为随机十六进制）；
 * 字段格式与后端 CSV 实际产出一致：美国号码为国内格式 (xxx) xxx-xxxx，官网去掉协议（如 example.com/）；
 * 规则类常量取自 014 合同：各档每任务关键词上限、地图模式搜索位置上限、CSV 列顺序。
 */
import type { OnlineCsvField } from '../../i18n/schema'
import { gridViewports } from '../../scripts/dashboard/map-grid'

/** 剧场浏览器地址栏显示的 Dashboard 路径。 */
export const DASHBOARD_URL = 'mapsgrab.com/dashboard/'

/** 各 Online 档每个任务的关键词上限（014；键为 pricing.ts online 卡片 id）。 */
export const KEYWORD_LIMITS = { free: 2, lite: 5, basic: 10, growth: 20, professional: 50 } as const

/** 按 pricing.ts 卡片 id 取关键词上限；卡片与上限表对不上时构建失败。 */
export function keywordLimitOf(planId: string): number {
  const entry = Object.entries(KEYWORD_LIMITS).find(([id]) => id === planId)
  if (!entry) throw new Error(`[online-samples] No keyword limit for Online plan "${planId}".`)
  return entry[1]
}

/** 演示所用档位（pricing.ts 的主推卡 Basic）：关键词上限与月度额度。 */
export const DEMO_PLAN = { keywordLimit: KEYWORD_LIMITS.basic, records: 80000 } as const

/** 地图模式单个任务的搜索位置上限：关键词数 × 网格点数（014）。 */
export const MAP_SAMPLE_LIMIT = 50

/** 剧场一轮任务：关键词、交付行数、完成耗时（毫秒，关键词之间并行）。 */
export interface TheaterRun {
  no: string
  items: readonly (readonly [keyword: string, rows: number, ms: number])[]
}

export const THEATER_RUNS: readonly TheaterRun[] = [
  {
    no: '7c41e2d98b0f4a6c9e15d3a27b8f60c4',
    items: [
      ['coffee shop in Portland', 46, 1500],
      ['bakery in Seattle', 31, 2600],
      ['florist in Denver', 18, 2000]
    ]
  },
  {
    no: 'e3a90b5f1d2c47e8a6b4f09c8d71e2a5',
    items: [
      ['dentist in Austin, TX', 58, 2300],
      ['plumber in Chicago', 64, 1400],
      ['yoga studio in Brooklyn', 41, 2900],
      ['car wash in Phoenix', 27, 1900]
    ]
  },
  {
    no: '1f8d6c3b92e04a57b8c1d4e6f0a9b372',
    items: [
      ['hotels in Miami Beach', 73, 2400],
      ['bike shop in Boulder', 12, 1300]
    ]
  }
]

/** 剧场开场时本月已用记录数。 */
export const THEATER_USED = 12480

/** 历史列表里预置的已完成任务。 */
export const THEATER_HISTORY = [
  { no: 'a19f03d7c25b48e1906f3ab4d8e1c720', keywords: 5, records: 212 },
  { no: '5d2b8e61f0a94c3d8b27e5c19a04f6d3', keywords: 2, records: 87 }
] as const

/** 历史列表任务号只显示前 6 位。 */
export const shortTaskNo = (no: string) => `${no.slice(0, 6)}…`

/** ③ 流程迷你画面：首页预览的前 3 行、验证码、创建表单里的关键词。 */
export const FLOW_PREVIEW_ROWS = [
  ['Ember & Oak Coffee', '4.7'],
  ['Rose City Espresso', '4.8'],
  ['Willamette Roasting', '4.6']
] as const
export const FLOW_CODE = ['4', '8', '1', '9', '', ''] as const
export const FLOW_KEYWORDS = ['coffee shop in Portland', 'bakery in Seattle', 'florist in Denver'] as const

/** ④ 关键词模式逐行输入的样例（含空行与重复行，演示去空去重后计数）。 */
export const KEYWORD_DEMO_LINES = [
  'coffee shop in Portland',
  'restaurant in Austin',
  '',
  'coffee shop in Portland',
  'dentist in Miami',
  'florist in Denver'
] as const

/** 关键词行的去留：被丢弃的原因，或 null 表示计入。 */
export type KeywordLineSkip = 'blank' | 'duplicate' | null

/** 与 Dashboard 表单同一口径：去首尾空白、去空行、按出现顺序去重；count 为截至该行的关键词数。 */
export function judgeKeywordLines(lines: readonly string[]): { text: string; skip: KeywordLineSkip; count: number }[] {
  const seen = new Set<string>()
  return lines.map(text => {
    const keyword = text.trim()
    const skip: KeywordLineSkip = !keyword ? 'blank' : seen.has(keyword) ? 'duplicate' : null
    if (!skip) seen.add(keyword)
    return { text, skip, count: seen.size }
  })
}

/** ④ 地图模式：中心、关键词、滑杆范围与自动演示的 [半径, 间距] 序列（第三步超限被阻止）。 */
export const MAP_DEMO = {
  center: { lat: 45.5152, lng: -122.6784 },
  keywords: ['coffee shop', 'bakery'],
  radius: { min: 0, max: 30, value: 10 },
  spacing: { min: 1, max: 20, value: 5 },
  steps: [
    [10, 5],
    [5, 5],
    [15, 5],
    [15, 8],
    [10, 5]
  ]
} as const

/**
 * 地图模式取点：直接调用 Dashboard 的 gridViewports（圆内网格、由近及远），
 * 再换算回相对中心的网格步数（dx 向东、dy 向北）供插画定位。
 */
export function mapGridSteps(radiusKm: number, spacingKm: number): { dx: number; dy: number }[] {
  const { center } = MAP_DEMO
  const latStep = spacingKm / 111.32
  const lngStep = spacingKm / (111.32 * Math.cos((center.lat * Math.PI) / 180))
  return gridViewports(center, radiusKm, spacingKm).map(point => ({
    dx: Math.round((point.lng - center.lng) / lngStep),
    dy: Math.round((point.lat - center.lat) / latStep)
  }))
}

/** ④ 地区模式：基础词 × 地点生成「{base} {in|near} {city}, {state}, {code}」。 */
export const REGION_DEMO = {
  bases: ['dentist', 'plumber'],
  country: 'United States',
  countryCode: 'US',
  state: 'Texas',
  cities: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso']
} as const

/** 搜索措辞：与 Dashboard 地区输入的 In / Near 单选值一致。 */
export type RegionPhrasing = 'in' | 'near'

/** 城市标签与查询里的地点写法同 Dashboard：「城市, 州, 国家代码」。 */
export const regionPlace = (city: string) => `${city}, ${REGION_DEMO.state}, ${REGION_DEMO.countryCode}`

/** 每个基础词 × 每个地点生成一条查询（同 Dashboard：`${base} ${in|near} ${place}`）。 */
export function regionQueries(cities: readonly string[], phrasing: RegionPhrasing): string[] {
  return REGION_DEMO.bases.flatMap(base => cities.map(city => `${base} ${phrasing} ${regionPlace(city)}`))
}

/** ⑤ 结果：整任务 ZIP 内的文件（零结果关键词只有两行表头）。 */
export const RESULT_TASK_NO = THEATER_RUNS[0].no
export const RESULT_FILES = [
  { item: 4821, keyword: 'coffee shop in Portland', rows: 46 },
  { item: 4822, keyword: 'bakery in Seattle', rows: 31 },
  { item: 4823, keyword: 'ski rental in Key West', rows: 0 }
] as const

/** Online CSV 总列数（backend maps_online.CSV_HEADERS）。 */
export const CSV_TOTAL_COLUMNS = 36

/** 表格展示的列：列号与 CSV_HEADERS 位置一致，skip 表示与前一列之间有隐藏列。 */
export const CSV_SHOWN_COLUMNS: readonly { letter: string; field: OnlineCsvField; skip: boolean; mono?: boolean; strong?: boolean }[] = [
  { letter: 'A', field: 'Name', skip: false, strong: true },
  { letter: 'B', field: 'Fulladdress', skip: false },
  { letter: 'E', field: 'Categories', skip: true },
  { letter: 'G', field: 'Phone', skip: true, mono: true },
  { letter: 'M', field: 'Review Count', skip: true, mono: true },
  { letter: 'N', field: 'Average Rating', skip: false, mono: true },
  { letter: 'V', field: 'Website', skip: true },
  { letter: 'AC', field: 'Emails', skip: true },
  { letter: 'AJ', field: 'Search Keyword', skip: true }
]

/** 第 3 行起的商户数据（第一个文件的前三行；空串表示该商户没有这一列）。 */
export const CSV_ROWS: readonly Readonly<Record<OnlineCsvField, string>>[] = [
  {
    'Name': 'Ember & Oak Coffee',
    'Fulladdress': '3021 SE Division St, Portland, OR 97202',
    'Categories': 'Coffee shop',
    'Phone': '(503) 555-0142',
    'Review Count': '1284',
    'Average Rating': '4.7',
    'Website': 'emberandoak.coffee/',
    'Emails': 'hello@emberandoak.coffee',
    'Search Keyword': 'coffee shop in Portland'
  },
  {
    'Name': 'Rose City Espresso Bar',
    'Fulladdress': '415 SE Hawthorne Blvd, Portland, OR 97214',
    'Categories': 'Espresso bar',
    'Phone': '(503) 555-0119',
    'Review Count': '377',
    'Average Rating': '4.8',
    'Website': 'rosecityespresso.com/',
    'Emails': 'info@rosecityespresso.com',
    'Search Keyword': 'coffee shop in Portland'
  },
  {
    'Name': 'Willamette Roasting Co.',
    'Fulladdress': '2130 NE Alberta St, Portland, OR 97211',
    'Categories': 'Coffee roasters',
    'Phone': '(503) 555-0178',
    'Review Count': '642',
    'Average Rating': '4.6',
    'Website': 'willametteroasting.com/',
    'Emails': '',
    'Search Keyword': 'coffee shop in Portland'
  }
]

/** ⑦ 计量演示用 Free 档（1,000 records）：第二阶段跑完越过额度，演示运行中任务照常完成、之后不能再提交。 */
export const USAGE_TOTAL = 1000

/** 计量演示的一个阶段：开场已用量、任务号前缀、各关键词交付行数与耗时。 */
export interface UsagePhase {
  used: number
  no: string
  items: readonly (readonly [keyword: string, rows: number, ms: number])[]
}

export const USAGE_PHASES: readonly UsagePhase[] = [
  {
    used: 120,
    no: '5d2b8e',
    items: [
      ['coffee shop in Portland', 128, 1500],
      ['bakery in Seattle', 120, 2300]
    ]
  },
  {
    used: 640,
    no: 'e3a90b',
    items: [
      ['dentist in Austin, TX', 214, 1800],
      ['plumber in Chicago', 198, 2600]
    ]
  }
]
