/**
 * 插件页演示数据（虚构，设计稿 README §10）：首屏剧场、视图卡、能力展台与批量任务岛。
 *
 * - 商户名虚构，电话一律 555-01xx 号段；Place ID / CID 仅作展示。
 * - 字段格式与插件导出一致：美国号码为国内格式 (xxx) xxx-xxxx，官网保留协议，
 *   Google Maps URL 为 https://www.google.com/maps?cid={cid}（export/columns.ts）。
 * - 导出文件名与插件 export/csv.ts 同格式：MapsGrab-Extractor-{行数}-{关键词}-{YYYY-MM-DD}.{扩展名}。
 * - tone 是缩略图 / 头像取色的叙事色 token 名（插画用，不做行动色）。
 * 界面文案不在这里，走 i18n 的 pages.extension。
 */

/** 插画取色：对应 tokens.css 的叙事色。 */
export type SampleTone = 'primary' | 'cyan' | 'accent' | 'pin' | 'star'

/** 剧场结果卡：名称、评分、评论数、地址、打烊时间、缩略图色调。 */
export type TheaterItem = readonly [name: string, rating: number, reviews: number, address: string, closes: string, tone: SampleTone]

/** 剧场演示的一组 Maps 搜索。 */
export interface TheaterSet {
  query: string
  category: string
  /** 面板行头像图标（icons.svg 名）。 */
  icon: string
  /** 电话区号（555-01xx 号段之前）。 */
  area: string
  /** 完成时的总条数（列表只展示前 10 条）。 */
  total: number
  items: readonly TheaterItem[]
}

export const THEATER_SETS: readonly TheaterSet[] = [
  {
    query: 'bakery in Seattle',
    category: 'Bakery',
    icon: 'coffee',
    area: '206',
    total: 24,
    items: [
      ['Pike Street Bakehouse', 4.8, 2031, '1420 Pike St', '6 PM', 'star'],
      ['Ballard Rye & Co.', 4.7, 864, '5311 Ballard Ave NW', '5 PM', 'cyan'],
      ['Capitol Crumb', 4.6, 512, '1517 E Olive Way', '7 PM', 'pin'],
      ['Fremont Flour Works', 4.9, 1288, '3507 Fremont Ave N', '4 PM', 'accent'],
      ['Queen Anne Pastry Lab', 4.5, 377, '2 Boston St', '6 PM', 'star'],
      ['Belltown Bread Club', 4.7, 693, '2407 1st Ave', '3 PM', 'primary'],
      ['Wallingford Oven', 4.8, 941, '1815 N 45th St', '5 PM', 'pin'],
      ['Georgetown Sourdough', 4.6, 288, '5900 Airport Way S', '2 PM', 'star'],
      ['Alki Morning Bakery', 4.4, 205, '2620 Alki Ave SW', '4 PM', 'primary'],
      ['Green Lake Croissant Co.', 4.8, 1107, '7200 E Green Lake Dr N', '6 PM', 'accent']
    ]
  },
  {
    query: 'yoga studio in Brooklyn',
    category: 'Yoga studio',
    icon: 'users',
    area: '718',
    total: 31,
    items: [
      ['Prospect Flow Studio', 4.9, 742, '214 Flatbush Ave', '9 PM', 'cyan'],
      ['Park Slope Yoga House', 4.8, 516, '377 5th Ave', '8 PM', 'primary'],
      ['Williamsburg Breath Co.', 4.7, 398, '118 N 6th St', '9 PM', 'pin'],
      ['DUMBO Stretch Lab', 4.6, 287, '55 Washington St', '8 PM', 'primary'],
      ['Bushwick Vinyasa Room', 4.8, 466, '1037 Flushing Ave', '10 PM', 'pin'],
      ['Greenpoint Mat Club', 4.7, 341, '879 Manhattan Ave', '9 PM', 'cyan'],
      ['Fort Greene Yoga Loft', 4.9, 603, '20 Lafayette Ave', '8 PM', 'accent'],
      ['Cobble Hill Calm', 4.5, 222, '244 Court St', '7 PM', 'accent'],
      ['Red Hook Yoga Barn', 4.8, 189, '300 Van Brunt St', '8 PM', 'star'],
      ['Bed-Stuy Balance', 4.7, 254, '1205 Fulton St', '9 PM', 'pin']
    ]
  },
  {
    query: 'florist in Denver',
    category: 'Florist',
    icon: 'sparkles',
    area: '303',
    total: 19,
    items: [
      ['Larimer Stem & Petal', 4.9, 438, '1430 Larimer St', '6 PM', 'pin'],
      ['RiNo Flower Bar', 4.8, 312, '2650 Walnut St', '7 PM', 'pin'],
      ['Highlands Bloom Co.', 4.7, 276, '3301 W 32nd Ave', '6 PM', 'accent'],
      ['Cherry Creek Florals', 4.6, 401, '2800 E 2nd Ave', '6 PM', 'star'],
      ['Wash Park Wildflower', 4.9, 188, '1090 S Gaylord St', '5 PM', 'accent'],
      ['LoDo Petal Works', 4.5, 167, '1601 Wazee St', '6 PM', 'star'],
      ['Tennyson Garden Room', 4.8, 245, '4110 Tennyson St', '6 PM', 'cyan'],
      ['Baker District Blooms', 4.7, 199, '30 S Broadway', '7 PM', 'pin'],
      ['Congress Park Posies', 4.6, 132, '1220 Josephine St', '5 PM', 'star'],
      ['Sloan Lake Stems', 4.8, 154, '4949 W 25th Ave', '6 PM', 'primary']
    ]
  }
]

/** 地图可见条带内的落点（百分比坐标，面板停靠在右侧）。 */
export const PIN_SPOTS: readonly (readonly [number, number])[] = [
  [10, 18], [22, 30], [14, 44], [26, 56], [9, 66], [20, 76], [28, 22], [12, 86], [24, 40], [17, 60]
]

/** 剧场电话号码：555-01xx 号段，按行序生成。 */
export function theaterPhone(set: TheaterSet, index: number): string {
  return `(${set.area}) 555-01${String((index * 13 + 21) % 100).padStart(2, '0')}`
}

/** 本地日期 YYYY-MM-DD（导出文件名的日期段）。 */
export function exportDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 插件导出文件名（与 extension export/csv.ts 同格式，关键词空格换成 +）。 */
export function exportFileName(rows: number, keyword: string, date: Date): string {
  return `MapsGrab-Extractor-${rows}-${keyword.replace(/ /g, '+')}-${exportDate(date)}.csv`
}

/** ③ 三种视图卡：搜索计数、商家页评论 / 照片计数、保存列表。 */
export const VIEW_SAMPLES = {
  searchQuery: 'florist in Denver',
  searchRatings: [4.9, 4.6, 4.8, 4.7, 4.5],
  searchCount: 36,
  reviewsCount: 184,
  photosCount: 64,
  savedCount: 6,
  /** 保存列表可见行数（逐项打开的演示行）。 */
  savedRows: 5
} as const

/** ④ 能力展台的主样例商户。 */
export const RECORD_SAMPLE = {
  name: 'Pike Street Bakehouse',
  summary: 'Bakery · Café · 1420 Pike St, Seattle, WA',
  phone: '(206) 555-0147',
  website: 'https://pikestreetbakehouse.com/',
  rating: 4.8,
  reviews: 2031,
  hours: 'Mon–Sun · 06:30–18:00',
  timeZone: 'America/Los_Angeles',
  coordinates: '47.61084, -122.33837',
  placeId: 'ChIJ1ePxxLJqkFQRGeDEt2IaP40',
  mapsUrl: 'https://www.google.com/maps?cid=10177882694172860441',
  /** 插件导出列总数（extension export/columns.ts）。 */
  totalColumns: 36,
  /** 评论导出列数（extension export/reviewsCsv.ts）。 */
  reviewColumns: 11
} as const

export interface ReviewSample {
  initial: string
  author: string
  rating: number
  date: string
  text: string
  tone: SampleTone
  owner?: { date: string; text: string }
}

export const REVIEW_SAMPLES: readonly ReviewSample[] = [
  {
    initial: 'M',
    author: 'Maya R.',
    rating: 5,
    date: '2026-09-28',
    text: 'Cardamom buns sell out by ten — worth the early alarm.',
    tone: 'primary',
    owner: { date: '2026-09-29', text: 'Thank you, Maya! A fresh batch comes out at 7 every morning.' }
  },
  {
    initial: 'J',
    author: 'Jonah K.',
    rating: 4,
    date: '2026-09-21',
    text: 'Great sourdough and friendly staff. Seating is tight at lunch.',
    tone: 'accent'
  },
  {
    initial: 'P',
    author: 'Priya S.',
    rating: 5,
    date: '2026-09-14',
    text: 'Best croissant I’ve had in the city. Two photos attached.',
    tone: 'pin'
  }
]

/** 照片墙色调；streetView 为被过滤的街景图位置。 */
export const PHOTO_SAMPLES = {
  tones: ['star', 'cyan', 'primary', 'pin', 'star', 'accent'] as readonly SampleTone[],
  streetView: 2,
  urls: [
    'https://lh5.googleusercontent.com/p/AF1QipN…=w1600',
    'https://lh5.googleusercontent.com/p/AF1QipO…=w1600',
    'https://lh5.googleusercontent.com/p/AF1QipP…=w1600'
  ]
} as const

/** 官网补全命中的联系渠道（图标为 icons.svg 名）。 */
export const ENRICH_SAMPLES = {
  domain: 'pikestreetbakehouse.com',
  found: [
    { icon: 'mail', tone: 'accent', value: 'hello@pikestreetbakehouse.com' },
    { icon: 'facebook', tone: 'primary', value: 'facebook.com/pikestreetbakehouse' },
    { icon: 'instagram', tone: 'pin', value: 'instagram.com/pikestbake' },
    { icon: 'linkedin', tone: 'cyan', value: 'linkedin.com/company/pike-street-bakehouse' }
  ] as readonly { icon: string; tone: SampleTone; value: string }[],
  /** 也会检查、但卡片未展开的社媒。 */
  more: ['x-social', 'youtube', 'tiktok']
} as const

/** 能力展台的批量任务快照：rows 为完成项条数，run / queued 为未完成项。 */
/** 批量任务内单个关键词的状态：完成 / 90 秒无进展被跳过 / 采集中 / 排队。 */
export type BatchItemState = 'done' | 'stuck' | 'run' | 'queued'

export const BATCH_PANEL_SAMPLE: {
  name: string
  complete: number
  stuck: number
  total: number
  items: readonly { keyword: string; state: BatchItemState; rows: number }[]
} = {
  name: 'Pacific Northwest bakeries',
  complete: 9,
  stuck: 1,
  total: 12,
  items: [
    { keyword: 'bakery in Seattle', state: 'done', rows: 24 },
    { keyword: 'bakery in Tacoma', state: 'done', rows: 17 },
    { keyword: 'bakery in Everett', state: 'stuck', rows: 0 },
    { keyword: 'bakery in Bellevue', state: 'done', rows: 21 },
    { keyword: 'bakery in Portland', state: 'run', rows: 0 },
    { keyword: 'bakery in Spokane', state: 'queued', rows: 0 }
  ]
}

/** 能力展台的导出快照。 */
export const EXPORT_SAMPLE = { rows: 24, selectedColumns: 31, keyword: 'bakery in Seattle' } as const

/** ⑤ 批量任务岛：逐字输入的任务；stuck 为 90 秒无进展被跳过的关键词序号。 */
export interface BatchTask {
  name: string
  keywords: readonly string[]
  rows: readonly number[]
  stuck: number
}

export const BATCH_TASKS: readonly BatchTask[] = [
  {
    name: 'Pacific Northwest bakeries',
    keywords: ['bakery in Seattle', 'bakery in Tacoma', 'bakery in Everett', 'bakery in Bellevue', 'bakery in Portland', 'bakery in Spokane'],
    rows: [24, 17, 0, 21, 33, 14],
    stuck: 2
  },
  {
    name: 'Texas dental clinics',
    keywords: ['dentist in Austin, TX', 'dentist in Dallas, TX', 'dentist in Houston, TX', 'dentist in El Paso, TX', 'dentist in Waco, TX'],
    rows: [62, 58, 71, 0, 19],
    stuck: 3
  }
]

/** 批量面板任务表里已完成的历史任务。 */
export const BATCH_HISTORY = [
  { name: 'Austin dentists', done: 24, total: 24 },
  { name: 'Chicago plumbers · reviews', done: 40, total: 40 }
] as const

/** 批量任务每次最多的关键词 / 评论 URL 数（013 A6）。 */
export const BATCH_LINE_LIMIT = 500

/** 插件 Dashboard 页地址栏（mock）。 */
export const BATCH_DASHBOARD_URL = 'extension://mapsgrab/dashboard'
