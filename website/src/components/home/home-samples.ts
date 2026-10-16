/**
 * 首页样例数据（虚构，设计稿 README §10）：产品剧场、36 列字段样例、补全轨道与开发者代码台。
 *
 * - 商户名虚构，电话一律 555-01xx 号段；主样例 Ember & Oak Coffee 的 FID / CID / Place ID 按
 *   placeUrl.ts 算法互相自洽，其余商户的 Place ID 由名称哈希生成，仅作展示。
 * - 36 列字段样例是插件搜索结果导出：列序、表头与取值格式都按插件实际导出（extension/src/sites/maps/content/
 *   export/columns.ts、content/parser/placeParser.ts）——Website 带协议，About 每组一行，Opening Hours 24 小时制
 *   每天一行，Amenities 逗号无空格拼接，电话为美国国内写法。
 * - 代码台按 014 tech-API与MCP.md：REST `/api/client/maps/api/{search,reviews}` + Bearer 用户 Key，
 *   业务响应为 `{code,data,msg}` 信封；MCP 入口 `/mcp/`，工具 search_places / list_reviews；
 *   响应字段与取值格式取自 Provider DTO（GmapPlaceEntry / GmapReview，rpc/entry.py：Website 不带协议）。
 *   Photos 未实现，不提供示例。
 * 界面文案不在这里，走 i18n 的 pages.home。
 */
import type { HomeFieldColumn, HomeFieldGroup } from '../../i18n/schema'

/** 剧场单行：名称、评分、评论数、官网邮箱（空串表示未找到）。 */
type TheaterItem = readonly [name: string, rating: number, reviews: number, email: string]

/** 剧场演示的一组关键词结果。 */
export interface TheaterDataset {
  keyword: string
  category: string
  /** 面板行头像图标（icons.svg 名）。 */
  icon: string
  /** 电话区号（555-01xx 号段之前）。 */
  area: string
  /** 演示的首屏结果总数。 */
  total: number
  items: readonly TheaterItem[]
}

/** 剧场面板一行的展示值。 */
export interface TheaterRowView {
  name: string
  rating: string
  reviews: number
  email: string
  phone: string
  placeId: string
}

export const THEATER_DATASETS: readonly TheaterDataset[] = [
  {
    keyword: 'coffee shop in Portland',
    category: 'Coffee shop',
    icon: 'coffee',
    area: '503',
    total: 48,
    items: [
      ['Ember & Oak Coffee', 4.7, 1284, 'hello@emberandoak.coffee'],
      ['Rose City Roasters', 4.6, 892, 'orders@rosecityroasters.com'],
      ['Hawthorne Bean Co.', 4.8, 2106, 'hi@hawthornebean.co'],
      ['Willamette Brew Bar', 4.5, 641, ''],
      ['Cascade Espresso House', 4.4, 388, 'team@cascadeespresso.com'],
      ['Pearl District Coffee', 4.6, 1057, 'pearl@pdxcoffee.co'],
      ['Burnside Grind', 4.3, 276, ''],
      ['Alberta Street Café', 4.7, 934, 'hello@albertacafe.com'],
      ['Fernwood Coffee Lab', 4.9, 512, 'lab@fernwood.coffee'],
      ['Sellwood Steam & Co.', 4.5, 703, ''],
      ['Laurelhurst Coffee Club', 4.6, 448, 'club@laurelhurst.coffee'],
      ['Mt Tabor Morning Roast', 4.8, 1322, 'roast@mttabor.coffee'],
      ['Division Drip Bar', 4.4, 219, ''],
      ['Eastbank Espresso', 4.6, 587, 'shots@eastbank.coffee']
    ]
  },
  {
    keyword: 'dentist in Austin, TX',
    category: 'Dentist',
    icon: 'sparkles',
    area: '512',
    total: 62,
    items: [
      ['Lone Star Family Dentistry', 4.9, 1104, 'smile@lonestardental.com'],
      ['Bright Smile Dental Studio', 4.8, 762, 'front@brightsmile.studio'],
      ['Barton Springs Dental', 4.7, 538, ''],
      ['South Congress Smiles', 4.9, 1388, 'hello@socosmiles.com'],
      ['Zilker Park Dental Care', 4.6, 304, 'care@zilkerdental.com'],
      ['Capitol City Orthodontics', 4.8, 916, ''],
      ['Mueller Modern Dentistry', 4.7, 455, 'team@muellerdental.com'],
      ['Hyde Park Dental Group', 4.5, 287, ''],
      ['East Austin Dental Co.', 4.8, 649, 'hi@eastaustindental.co'],
      ['Riverside Gentle Dental', 4.4, 198, ''],
      ['Domain Dental Spa', 4.7, 823, 'spa@domaindental.com'],
      ['Travis Heights Family Dental', 4.9, 372, 'office@travisheights.dental'],
      ['Rainey Street Dental', 4.6, 261, ''],
      ['Clarksville Smile Center', 4.8, 590, 'hello@clarksvillesmile.com']
    ]
  },
  {
    keyword: 'plumber near Chicago',
    category: 'Plumber',
    icon: 'wrench',
    area: '312',
    total: 57,
    items: [
      ['Windy City Plumbing Pros', 4.8, 1532, 'dispatch@windycityplumbing.com'],
      ['Lakeview Pipe & Drain', 4.7, 689, ''],
      ['Wicker Park Plumbing Co.', 4.6, 412, 'service@wickerplumbing.co'],
      ['Lincoln Square Rooter', 4.9, 857, 'help@lsrooter.com'],
      ['Loop Emergency Plumbers', 4.5, 338, ''],
      ['Logan Square Water Heaters', 4.7, 521, 'hot@loganheaters.com'],
      ['Hyde Park Drain Experts', 4.6, 264, ''],
      ['Ravenswood Plumbing & Heat', 4.8, 743, 'office@ravenswoodph.com'],
      ['Pilsen Pipe Works', 4.5, 306, 'crew@pilsenpipe.works'],
      ['Andersonville Plumbing', 4.7, 455, ''],
      ['Bucktown Sewer & Drain', 4.4, 187, 'info@bucktowndrain.com'],
      ['Gold Coast Plumbing Group', 4.8, 902, 'service@goldcoastplumbing.com'],
      ['Bridgeport Pipe Masters', 4.6, 233, ''],
      ['Edgewater Flow Co.', 4.7, 398, 'hello@edgewaterflow.co']
    ]
  }
]

/** 由名称派生稳定的伪 Place ID（只用于展示）。 */
function fakePlaceId(name: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  let hash = 2166136261
  let out = 'ChIJ'
  for (let i = 0; i < 23; i++) {
    hash ^= name.charCodeAt(i % name.length) + i
    hash = Math.imul(hash, 16777619) >>> 0
    out += chars[hash % chars.length]
  }
  return out
}

/** 剧场第 index 行的展示值（电话按 555-01xx 号段生成）。 */
export function theaterRow(dataset: TheaterDataset, index: number): TheaterRowView {
  const [name, rating, reviews, email] = dataset.items[index % dataset.items.length]
  return {
    name,
    rating: rating.toFixed(1),
    reviews,
    email,
    phone: `(${dataset.area}) 555-01${String((index * 7 + 11) % 100).padStart(2, '0')}`,
    placeId: fakePlaceId(name)
  }
}

/** 地图上的落点位置（剧场面积百分比坐标），按 x 排序后依次被扫描命中。 */
export const PIN_SPOTS: ReadonlyArray<readonly [number, number]> = [
  [9, 46], [15, 66], [21, 36], [25, 82], [30, 54], [35, 30], [39, 70],
  [44, 46], [48, 86], [52, 26], [55, 60], [59, 38], [62, 76], [65, 52]
]

/** 36 列字段样例：表头、分组、图标与主样例取值（空串表示恒空列）。 */
export interface FieldSample {
  header: HomeFieldColumn
  group: HomeFieldGroup
  icon: string
  sample: string
}

export const FIELD_SAMPLES: readonly FieldSample[] = [
  { header: 'Name', group: 'profile', icon: 'tag', sample: 'Ember & Oak Coffee' },
  { header: 'Description', group: 'profile', icon: 'list', sample: 'Small-batch roaster and espresso bar' },
  { header: 'Fulladdress', group: 'location', icon: 'pin', sample: '3021 SE Division St, Portland, OR 97202' },
  { header: 'Street', group: 'location', icon: 'route', sample: '3021 SE Division St' },
  { header: 'Municipality', group: 'location', icon: 'building', sample: 'Portland, OR 97202' },
  { header: 'Categories', group: 'profile', icon: 'list', sample: 'Coffee shop, Espresso bar, Cafe' },
  { header: 'About', group: 'profile', icon: 'info', sample: 'Service options: [Dine-in, Takeout]\nHighlights: [Great coffee]' },
  // 列位与 Pro 门控已锁、数据源后置，导出恒为空（columns.ts）
  { header: 'Plus Code', group: 'location', icon: 'hash', sample: '' },
  { header: 'Time Zone', group: 'location', icon: 'clock', sample: 'America/Los_Angeles' },
  { header: 'Price', group: 'profile', icon: 'tag', sample: '$$' },
  { header: 'Note', group: 'profile', icon: 'review', sample: 'Known for seasonal pour-overs' },
  { header: 'Amenities', group: 'profile', icon: 'sparkles', sample: 'Outdoor seating,Good for laptops' },
  { header: 'Hotel Class', group: 'profile', icon: 'star', sample: '4-star hotel' },
  { header: 'Phone', group: 'contact', icon: 'phone', sample: '(503) 555-0142' },
  { header: 'Phones', group: 'contact', icon: 'phone', sample: '(503) 555-0142, +1 503-555-0142' },
  { header: 'Claimed', group: 'profile', icon: 'shield', sample: 'YES' },
  { header: 'Owner', group: 'profile', icon: 'user', sample: 'Ember & Oak Coffee (Owner)' },
  { header: 'Owner Id', group: 'profile', icon: 'user', sample: '104287731665220398123' },
  { header: 'Owner Link', group: 'profile', icon: 'link', sample: 'https://www.google.com/maps/contrib/104287731665220398123' },
  { header: 'Email', group: 'contact', icon: 'mail', sample: 'hello@emberandoak.coffee' },
  { header: 'Social Medias', group: 'contact', icon: 'users', sample: 'instagram: https://www.instagram.com/emberandoak' },
  { header: 'Review Count', group: 'reviews', icon: 'review', sample: '1284' },
  { header: 'Average Rating', group: 'reviews', icon: 'star', sample: '4.7' },
  { header: 'Review URL', group: 'reviews', icon: 'link', sample: 'https://search.google.com/local/reviews?placeid=ChIJ8Qv2kSIKlVQRq-DRw_KltL4&q=coffee+shop+in+Portland&authuser=0&hl=en&gl=US' },
  { header: 'Google Maps URL', group: 'ids', icon: 'map', sample: 'https://www.google.com/maps?cid=13741790825100206251' },
  { header: 'Google Knowledge URL', group: 'ids', icon: 'link', sample: 'https://www.google.com/search?kgmid=/g/11c5x9_qk_' },
  { header: 'Latitude', group: 'location', icon: 'locate', sample: '45.504912' },
  { header: 'Longitude', group: 'location', icon: 'locate', sample: '-122.635377' },
  { header: 'Website', group: 'contact', icon: 'web', sample: 'https://emberandoak.coffee/' },
  { header: 'Domain', group: 'contact', icon: 'globe', sample: 'emberandoak.coffee' },
  { header: 'Opening Hours', group: 'profile', icon: 'clock', sample: 'Monday(2026-10-12): [07:00-18:00]\nTuesday(2026-10-13): [07:00-18:00]' },
  { header: 'Featured Image', group: 'profile', icon: 'image', sample: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTW-sample=w408-h544-k-no' },
  { header: 'Cid', group: 'ids', icon: 'hash', sample: '13741790825100206251' },
  { header: 'Fid', group: 'ids', icon: 'hash', sample: '0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab' },
  { header: 'Place Id', group: 'ids', icon: 'scan', sample: 'ChIJ8Qv2kSIKlVQRq-DRw_KltL4' },
  { header: 'Kgmid', group: 'ids', icon: 'hash', sample: '/g/11c5x9_qk_' }
]

/** 字段浏览器初始检查的列（Phone）。 */
export const FIELD_INITIAL_INDEX = 13

/**
 * 样例 CSV（BOM + 表头 + 主样例一行，RFC4180 全字段加引号），与插件导出的表头和列序一致，
 * 作为 data URI 直接挂在下载链接上，不需要脚本。
 */
export function sampleCsvDataUri(): string {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`
  const csv = [FIELD_SAMPLES.map(field => field.header), FIELD_SAMPLES.map(field => field.sample)]
    .map(row => row.map(quote).join(','))
    .join('\r\n')
  return `data:text/csv;charset=utf-8,${encodeURIComponent(`﻿${csv}\r\n`)}`
}

/** 补全轨道的渠道节点：邮箱 + 6 个社媒（与 contact_scraper 的社媒平台一致）。 */
export const ORBIT_NODES: ReadonlyArray<{ id: string; icon: string; value: string }> = [
  { id: 'email', icon: 'mail', value: 'hello@emberandoak.coffee' },
  { id: 'instagram', icon: 'instagram', value: 'instagram.com/emberandoak' },
  { id: 'facebook', icon: 'facebook', value: 'facebook.com/emberandoakcoffee' },
  { id: 'linkedin', icon: 'linkedin', value: 'linkedin.com/company/ember-oak' },
  { id: 'x', icon: 'x-social', value: 'x.com/emberandoak' },
  { id: 'youtube', icon: 'youtube', value: 'youtube.com/@emberandoak' },
  { id: 'tiktok', icon: 'tiktok', value: 'tiktok.com/@emberandoak' }
]

/** 主样例商户（补全轨道中心卡）。 */
export const ORBIT_BUSINESS = { name: 'Ember & Oak Coffee', site: 'emberandoak.coffee' }

/** MCP 卡插画的对话结果（取自牙医样例）。 */
export const CHAT_MATCHES = { count: 18, top: [['Lone Star Family Dentistry', '4.9'], ['South Congress Smiles', '4.9'], ['Bright Smile Dental Studio', '4.8']] } as const

/** 代码台一段代码：Shiki 语言与源码。 */
export interface CodeSample {
  lang: 'bash' | 'python' | 'js' | 'json' | 'jsonc'
  code: string
}

/** 代码台的一个产品：语言 tab 名、各语言请求、响应与状态行参数。 */
export interface DeveloperSample {
  langs: readonly [string, string, string]
  requests: readonly [CodeSample, CodeSample, CodeSample]
  response: CodeSample
  /** REST 响应耗时（ms）；MCP 为 null，状态行改写工具名。 */
  latencyMs: number | null
  /** MCP 工具名。 */
  tool: string | null
}

/** 主样例 Ember & Oak Coffee 的 FID（Pricing 请求日志复用）。 */
export const SAMPLE_FID = '0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab'

/** 同一请求的 cURL / Python / Node.js 三种写法。 */
function restRequests(url: string, body: { json: string; python: string; js: string }, pythonOut: string, jsOut: string): DeveloperSample['requests'] {
  return [
    {
      lang: 'bash',
      code: `curl ${url} \\\n  -H "Authorization: Bearer $MAPSGRAB_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${body.json}'`
    },
    {
      lang: 'python',
      code: `import os\nimport requests\n\nAPI_KEY = os.environ["MAPSGRAB_API_KEY"]\n\nresp = requests.post(\n    "${url}",\n    headers={"Authorization": f"Bearer {API_KEY}"},\n    json=${body.python},\n)\n${pythonOut}`
    },
    {
      lang: 'js',
      code: `const res = await fetch("${url}", {\n  method: "POST",\n  headers: {\n    Authorization: \`Bearer \${process.env.MAPSGRAB_API_KEY}\`,\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify(${body.js}),\n});\n${jsOut}`
    }
  ]
}

/** 代码台样例；apiBase 为部署注入的 PUBLIC_API_BASE_URL（与 /connection 的 api_base_url、mcp.public_url 同源）。 */
export function developerSamples(apiBase: string): Record<'search' | 'reviews' | 'mcp', DeveloperSample> {
  const restBase = `${apiBase}/api/client/maps/api`
  const mcpUrl = `${apiBase}/mcp/`
  return {
    search: {
      langs: ['cURL', 'Python', 'Node.js'],
      requests: restRequests(
        `${restBase}/search`,
        {
          json: '{"q": "coffee shop in Portland", "page": 1, "extra": true}',
          python: '{"q": "coffee shop in Portland", "page": 1, "extra": True}',
          js: '{ q: "coffee shop in Portland", page: 1, extra: true }'
        },
        'places = resp.json()["data"]["places"]',
        'const { data } = await res.json();'
      ),
      response: {
        lang: 'json',
        code: [
          '{',
          '  "code": 10000,',
          '  "data": {',
          '    "places": [',
          '      {',
          '        "name": "Ember & Oak Coffee",',
          `        "fid": "${SAMPLE_FID}",`,
          '        "categories": ["Coffee shop", "Espresso bar"],',
          '        "full_address": "3021 SE Division St, Portland, OR 97202",',
          '        "phone": "(503) 555-0142",',
          '        "website": "emberandoak.coffee/",',
          '        "average_rating": 4.7,',
          '        "review_count": 1284,',
          '        "latitude": 45.504912,',
          '        "longitude": -122.635377,',
          '        "place_id": "ChIJ8Qv2kSIKlVQRq-DRw_KltL4",',
          '        "emails": ["hello@emberandoak.coffee"],',
          '        "medias": { "instagram": "https://www.instagram.com/emberandoak" }',
          '      },',
          '      …',
          '    ],',
          '    "partial": false,',
          '    "warnings": []',
          '  },',
          '  "msg": ""',
          '}'
        ].join('\n')
      },
      latencyMs: 412,
      tool: null
    },
    reviews: {
      langs: ['cURL', 'Python', 'Node.js'],
      requests: restRequests(
        `${restBase}/reviews`,
        {
          json: `{"fid": "${SAMPLE_FID}", "sort_by": 2}`,
          python: `{"fid": "${SAMPLE_FID}", "sort_by": 2}`,
          js: `{ fid: "${SAMPLE_FID}", sort_by: 2 }`
        },
        'reviews = resp.json()["data"]["reviews"]',
        'const { data } = await res.json();'
      ),
      response: {
        lang: 'json',
        code: [
          '{',
          '  "code": 10000,',
          '  "data": {',
          '    "reviews": [',
          '      {',
          '        "review_id": "ChdDSUhNMG9nS0VJQ0FnSUR3…",',
          '        "author_name": "Maya R.",',
          '        "origin": "Google",',
          '        "published_at_ms": 1790553600000,',
          '        "rating": 5,',
          '        "relative_date": "2 weeks ago",',
          '        "text": "Best cortado on Division. Friendly crew.",',
          '        "language": "en",',
          '        "owner_response": "Thanks Maya — see you soon!",',
          '        "owner_response_at_ms": 1790640000000,',
          '        "author_is_local_guide": true,',
          '        "images": ["https://lh5.googleusercontent.com/p/AF1QipN…"]',
          '      },',
          '      …',
          '    ],',
          '    "next_cursor": "CAESBkVnSUlDZw…"',
          '  },',
          '  "msg": ""',
          '}'
        ].join('\n')
      },
      latencyMs: 538,
      tool: null
    },
    mcp: {
      langs: ['Claude Code', 'Cursor', 'VS Code'],
      requests: [
        {
          lang: 'bash',
          code: `claude mcp add --transport http mapsgrab \\\n  ${mcpUrl} \\\n  --header "Authorization: Bearer $MAPSGRAB_API_KEY"`
        },
        {
          lang: 'jsonc',
          code: `// .cursor/mcp.json\n{\n  "mcpServers": {\n    "mapsgrab": {\n      "url": "${mcpUrl}",\n      "headers": { "Authorization": "Bearer YOUR_API_KEY" }\n    }\n  }\n}`
        },
        {
          lang: 'jsonc',
          code: `// .vscode/mcp.json\n{\n  "inputs": [\n    { "type": "promptString", "id": "mapsgrab-key", "description": "MapsGrab API key", "password": true }\n  ],\n  "servers": {\n    "mapsgrab": {\n      "type": "http",\n      "url": "${mcpUrl}",\n      "headers": { "Authorization": "Bearer \${input:mapsgrab-key}" }\n    }\n  }\n}`
        }
      ],
      response: {
        lang: 'jsonc',
        code: [
          '// → tools/call search_places',
          '{ "q": "dentist in Austin, TX" }',
          '',
          '// ← structuredContent',
          '{',
          '  "places": [',
          '    { "name": "Lone Star Family Dentistry", "average_rating": 4.9, "review_count": 1104 },',
          '    { "name": "South Congress Smiles", "average_rating": 4.9, "review_count": 1388 },',
          '    { "name": "Bright Smile Dental Studio", "average_rating": 4.8, "review_count": 762 },',
          '    …',
          '  ],',
          '  "partial": false,',
          '  "warnings": []',
          '}'
        ].join('\n')
      },
      latencyMs: null,
      tool: 'search_places'
    }
  }
}

/** bento API 卡的迷你请求行（与代码台 Search 示例同一端点）。 */
export const MINI_API_REQUEST = { verb: 'POST', path: '/api/client/maps/api/search' }
