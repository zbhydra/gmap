/**
 * Maps 远程配置契约（dom / reviewsDom / parseSchema / exportConfig / scrape /
 * operations 六组）。
 *
 * 契约规则（与 013 域拍板的远程配置方案绑定，服务端与客户端共同遵守）：
 * - 包内 DEFAULT_MAPS_CONFIG 是编译期完整默认值，客户端功能永不因配置缺失而中断；
 * - 服务端下发的是**稀疏覆盖**：每组只含要覆盖的键，允许出现客户端未声明的键
 *   （各组带 index signature）；同名键**不做任何类型/取值校验**，原样 Object.assign 覆盖；
 * - 远程缺键保留包内值，覆盖失败/超时静默回退包内默认值；
 * - Google 改版（选择器/解析下标漂移）由服务端改配置，刷新页面即全端生效。
 *
 * 默认值依据 docs/feat/013.Maps插件/references/ 的实测事实：
 * - 列表模式触发标记：URL 含 `10m1!1e1`（A7/11 号调研实测）；
 * - 滚动间隔档位 [5, 6, 8, 9, 10] 秒，默认 8 秒（09 参数总表 REQUEST_INTERVALS）；
 * - 商家列表定位 `len-8` + 详情路径 `[i][1]`（V2 形态，03 号调研 toJson）；
 * - 新搜索框选择器（`#searchboxinput` 已死，11 号调研 #3）；
 * - 评论/照片 RPC 的解析下标、每页条数与翻页间隔（03 号调研 §3.2/§3.3 +
 *   09 参数总表 §4）。注意：评论/照片响应目前**没有实录黄金样本**（scratch
 *   只 archived 了搜索样本），其解析下标按协议文档对齐，实录校准走远程
 *   配置覆盖（与 A1 同路，见 001 计划 U3 的诚实标注）。
 */

/** Maps 页 DOM 选择器组。值均为 CSS 选择器字符串。 */
export interface MapsDomConfig {
  /** Maps 搜索框输入框（`#searchboxinput` 已失效，改用 role+name 稳定选择器）。 */
  searchInput: string
  /** 搜索表单提交按钮（重放搜索用）。 */
  searchSubmitButton: string
  /** 搜索结果列表滚动容器。 */
  feed: string
  /** Maps 主渲染区（UI 挂载前的存在性检测）。 */
  main: string
  /** 详情页"下一页"翻页按钮（辅助翻页路径）。 */
  paginationButton: string
  /** 「结果随地图移动」drag 复选开关。 */
  dragCheckbox: string
  /** 插件面板挂载点。 */
  panelMount: string
  /** feed 末项的结束提示文字片段（小写包含匹配；空串表示不启用该判定）。 */
  feedEndMarker: string
  /**
   * 列表模式 URL 触发子串（013 A7，U10）。
   *
   * 宽松匹配实测裁决：聚合页 `data=!4m2!10m1!1e1` 与深层列表页
   * `data=!4m6!1m2!10m1!1e1!11m2!2s{token}` 两形态仅 `10m1!1e1` 尾段共有
   * （竞品的精确子串 `data=!4m2!10m1!1e1` 在深层页全部漏判，A7 实测表）。
   */
  listModeUrlMark: string
  /**
   * 深层列表页区分子串：深层形态在触发标记后带列表 token 段
   * `!11m2!2s{listToken}`（A7 实测），聚合页无此段。命中时容器选择器
   * 优先用 listContainerDeep。
   */
  listModeDeepUrlMark: string
  /**
   * 聚合页列表滚动容器：`role=main` 末子 div（2026-08-30 登录态实测聚合页
   * 与竞品时代同构；竞品逆向 05 同款定位）。
   */
  listContainer: string
  /**
   * 深层列表页列表滚动容器。
   *
   * 实录校准点：A7 实测确认深层页 `role=main` 下子项数量/形态漂移，但具体
   * 稳定结构未经实录锁定。当前默认值按「深层页在 role=main 与列表容器之间
   * 多一层包装」的最优假设给出（e2e fixture 同构验证分流链路）；真实 Google
   * 登录态的稳定选择器须由服务端按实录 DOM 远程覆盖此键。
   */
  listContainerDeep: string
  /**
   * 列表项选择器（相对容器的直接子元素逐一匹配）：排除首尾——首尾为列表
   * 标题 / 装饰位（A7 实测「项 = 子 div 过滤首尾」，竞品「非首非尾」同语义）。
   */
  listItem: string
  /** 列表末项的结束提示文字片段（小写包含匹配；空串表示不启用该判定）。 */
  listEndMarker: string
  /** 允许服务端下发客户端未声明的选择器键。 */
  [key: string]: string
}

/**
 * 评论/照片域的 DOM 选择器组（013 A2/A3）。
 *
 * 评论页兜底与 HTML 回退解析的选择器取自 03 号调研 §3.2 的竞品形态；
 * 该页面结构在竞品时代之后已经漂移，因此 HTML 回退默认关闭
 * （parseSchema.reviewsHtmlFallbackEnabled），选择器仅作服务端治理通道保留。
 */
export interface MapsReviewsDomConfig {
  /** 评论页错误容器（af-error 错误页兜底判定）。 */
  reviewsErrorContainer: string
  /** 评论页「无评论」提示图片（src 子串匹配，0 评论兜底判定）。 */
  reviewsNoReviewsImage: string
  /** HTML 回退：评论行根选择器。 */
  reviewsHtmlReviewRow: string
  /** HTML 回退：作者名节点。 */
  reviewsHtmlAuthor: string
  /** HTML 回退：评分节点（aria-label 形态）。 */
  reviewsHtmlRating: string
  /** HTML 回退：正交节点。 */
  reviewsHtmlText: string
  /** HTML 回退：商家回复节点。 */
  reviewsHtmlReply: string
  /** HTML 回退：翻页 token 节点（data-next-page-token）。 */
  reviewsHtmlNextToken: string
  /** 允许服务端下发客户端未声明的选择器键。 */
  [key: string]: string
}

/**
 * 字段名 → 商家详情数组的下标路径（逐层下钻，空层即取值失败）。
 *
 * 全集 = A5 字段字典 36 列中所有 RPC 可直取列（逆向 04 的下标表，黄金样本
 * 20/20 勘验）；Email / Social Medias 数据源归 U8，不入本表；Plus Code
 * 后置：数据源未实现，列位与 Pro 门控已锁（见 export/columns.ts）。
 */
export interface MapsParseSchemaFieldsConfig {
  /** 商家名。 */
  name: number[]
  /** 主电话。 */
  phone: number[]
  /** 纬度。 */
  lat: number[]
  /** 经度。 */
  lng: number[]
  /** 类目。 */
  categories: number[]
  /** Google Place ID（导出去重键）。 */
  placeId: number[]
  /** 评分。 */
  rating: number[]
  /** 评论数。 */
  reviewsCount: number[]
  /** 官网地址。 */
  website: number[]
  /** 完整地址（超 200 字符置空防脏数据）。 */
  fullAddress: number[]
  /** 商家 fid（形如 `0x…:0x…`，cid 由其第二段 hex 衍生）。 */
  fid: number[]
  /** 商家简介主文本（与 descriptionExtra 拼接，逆向 04 Description 拼接规则）。 */
  description: number[]
  /** 商家简介附加文本段（数组时逐项换行拼接后并入 description）。 */
  descriptionExtra: number[]
  /** 街道（数组 join 成串）。 */
  street: number[]
  /** 市镇（数组 join 成串）。 */
  municipality: number[]
  /** About 分组数组（组内 [1]=组名、[2]=项列表，项名在项的 [2][1][0][1]）。 */
  about: number[]
  /** 时区名。 */
  timeZone: number[]
  /** 价位主路径（$$ 符号或区间文本）。 */
  price: number[]
  /** 价位回退路径（主路径为空时取，竞品 `a[35][9] 或 a[4][2]` 语义）。 */
  priceFallback: number[]
  /** 附加注记。 */
  note: number[]
  /** 设施列表（项名下标由 amenitiesItemNameIndex 指定）。 */
  amenities: number[]
  /** 酒店星级。 */
  hotelClass: number[]
  /** 其余电话列表（项文本下标由 phonesItemTextIndex 指定）。 */
  phones: number[]
  /** 认领状态源值（URL 含 claimedUnclaimedMarker 即未认领）。 */
  claimed: number[]
  /** 商家主名。 */
  owner: number[]
  /** 商家主 ID（Owner Link 由其衍生）。 */
  ownerId: number[]
  /** 评论页链接（非 https 置空）。 */
  reviewUrl: number[]
  /** 官网域名。 */
  domain: number[]
  /** 营业时间日条目数组（结构化解析见 04：`周几(日期): [HH:mm-HH:mm,…]`）。 */
  openingHours: number[]
  /** 封面图（非 http(s) 置空）。 */
  featuredImage: number[]
  /** Knowledge Graph ID（Google Knowledge URL 由其衍生）。 */
  kgmid: number[]
  /** 允许服务端下发客户端未声明的字段路径键。 */
  [key: string]: number[]
}

/**
 * 字段名 → 评论对象数组的下标路径（03 逆向 §3.2 的 r[...] 下标）。
 * 与搜索 fields 分离：两者的字段集合与下标语义完全不同。仅声明当前
 * 消费的字段（评论 11 列导出所需）；竞品解析的 id(r[5])、时间戳(r[2][2])
 * 无导出消费，未入契约。
 */
export interface ReviewsParseFieldsConfig {
  /** 评分。 */
  rate: number[]
  /** 相对日期原文。 */
  date: number[]
  /** 作者名。 */
  name: number[]
  /** 作者头像。 */
  avatar: number[]
  /** 作者主页。 */
  authorUrl: number[]
  /** 商家回复日期。 */
  replyDate: number[]
  /** 商家回复正文。 */
  reply: number[]
  /** 点赞数。 */
  like: number[]
  /** 评论链接。 */
  reviewUrl: number[]
  /** 内嵌照片容器。 */
  photos: number[]
  /** 评论正文。 */
  comment: number[]
  /** 允许服务端下发客户端未声明的字段路径键。 */
  [key: string]: number[]
}

/** Maps 内部 RPC 响应解析 schema 组。 */
export interface MapsParseSchemaConfig {
  /** 列表定位规则：商家数组在剥壳后根数组的倒数第 8 个元素（格式 `len-N`）。 */
  listLocator: string
  /** 详情数组定位路径模板：V2 形态下列表项对象的 values 取法（`i` 为列表项索引占位）。 */
  detailPath: string
  /** V1（旧形态）行数组定位路径模板（`i` 为索引占位）。 */
  v1ListPath: string
  /** V1（旧形态）单行内详情数组的固定下标。 */
  v1DetailIndex: number
  /** 搜索关键词在剥壳后根数组的下标路径模板。 */
  queryPath: string
  /** 是否启用格式 A（直接导航响应）解析分支。 */
  formatADirectNavEnabled: boolean
  /** 是否启用格式 B（SPA XHR 响应）解析分支。 */
  formatBSpaXhrEnabled: boolean
  /** 字段下标路径表。 */
  fields: MapsParseSchemaFieldsConfig
  /** 评论响应 txtToJson：JSON.parse 目标所在行下标（按行 split，第 3 行 = 2）。 */
  reviewsLineIndex: number
  /** 评论列表在剥壳后根数组的下标路径（03 逆向 §3.2 `d[1][10][2]`）。 */
  reviewsListPath: string
  /** 评论翻页 token 的下标路径（03 逆向 §3.2 `d[1][10][6]`）。 */
  reviewsTokenPath: string
  /** 评论字段下标路径表（键 → 逐层下标）。 */
  reviewsFields: ReviewsParseFieldsConfig
  /** 评论内嵌照片项数组的取项下标（`r[14][*][0]` 的 `0`）。 */
  reviewsPhotosItemIndex: number
  /** 评论内嵌照片 URL 的统一尺寸参数（`split("=")[0] + "=" + 该值`）。 */
  reviewsPhotoSizeParam: string
  /** 评论 HTML 回退解析开关（默认关：竞品时代的页面结构已不可信）。 */
  reviewsHtmlFallbackEnabled: boolean
  /** 其余电话列表项的文本下标（项形如 `[电话, 类型]`）。 */
  phonesItemTextIndex: number
  /** 设施列表项的名称下标（逆向 04「每项 `[2]`」）。 */
  amenitiesItemNameIndex: number
  /** 营业时间日条目内「休/营业」标记的下标（04：`[5]==2` 表示休）。 */
  openingHoursClosedFlagIndex: number
  /** 营业时间「休」标记值（命中即该日输出 Closed）。 */
  openingHoursClosedFlagValue: number
  /** 未认领标记子串：claimed 源 URL 含该子串即输出 NO，否则 YES。 */
  claimedUnclaimedMarker: string
  /** 照片 batchexecute chunk 内 payload 字符串的下标（chunk[1]）。 */
  photosChunkPayloadIndex: number
  /** 照片 end 布尔在 payload 根的下标（03 逆向 §3.3「第 10 位」）。 */
  photosEndIndex: number
  /** 照片翻页 token 在 payload 根的下标（构造样本约定，实录校准走远程覆盖）。 */
  photosNextIndex: number
  /** place URL 十六进制段的最大长度（超出视为误匹配丢弃，09 参数总表 §6）。 */
  placeIdHexMaxLength: number
  /** 允许服务端下发客户端未声明的解析键。 */
  [key: string]: string | boolean | number | MapsParseSchemaFieldsConfig | ReviewsParseFieldsConfig
}

/**
 * 导出行为配置组（A8，U4 契约扩展）。
 *
 * 当前无账号体系：proColumnsEnabled 默认 true（全列可用）；U7/U8 接入
 * 凭证与订阅后由服务端按账号态下发覆盖，免费用户导出时静默剔除 Pro 列。
 */
export interface MapsExportConfig {
  /** Pro 专属列是否随导出生成；false 时 12 个 Pro 列在导出层剔除。 */
  proColumnsEnabled: boolean
  /** 允许服务端下发客户端未声明的导出配置键。 */
  [key: string]: string | boolean | number
}

/** Maps 采集运行参数组。 */
export interface MapsScrapeConfig {
  /** 滚动/采集轮询间隔（秒）。 */
  scrollIntervalSec: number
  /** 允许的间隔档位（秒），用户设置只能在档位内取值。 */
  scrollIntervalOptionsSec: number[]
  /** 滚动到底的动画时长下限（毫秒，拟人随机区间）。 */
  scrollAnimMinMs: number
  /** 滚动到底的动画时长上限（毫秒，拟人随机区间）。 */
  scrollAnimMaxMs: number
  /** 连续无新增数据的滚动轮数上限，达到即判定采集完成（防死滚兜底）。 */
  noGrowthRetryLimit: number
  /** 免费档单次导出行数上限（超出截断并提前完成；配额门控归 U7，此处只做截断）。 */
  freeExportRowLimit: number
  /** Maps 预取模式单批响应的参考条数（实测初始批 20 条）。 */
  listPageRows: number
  /** 单次配置/协议请求超时（毫秒）。 */
  requestTimeoutMs: number
  /** 协议请求失败重试次数。 */
  requestRetryCount: number
  /** 评论单地点采集上限（免费档默认，档位分档归 U7；09 表 free 20）。 */
  reviewsPageLimit: number
  /** 评论每页条数（reqpld 参数 + 不足一页判定，09 表 10 条/请求）。 */
  reviewsPageSize: number
  /** 评论翻页间隔（毫秒，09 表固定 2 秒）。 */
  reviewsPageDelayMs: number
  /** 照片单地点采集上限（免费档默认，档位分档归 U7；09 表 free 10）。 */
  photosPageLimit: number
  /** 照片每页参考条数（不足一页判定基准，09 表 10 张）。 */
  photosPageSize: number
  /** 照片翻页间隔（毫秒，09 表 3 秒）。 */
  photosPageDelayMs: number
  /** 允许服务端下发客户端未声明的运行参数键。 */
  [key: string]: number | number[]
}

/**
 * 远端运营配置组（A12，U6 契约扩展；pricingUrl 为 U7 遗留接线/W7 契约扩展）。
 *
 * 承载「免发版触达用户」的运营能力：面板公告、新版本提示与订阅落地页。每次
 * boot 随远程配置通道现拉、只进内存（随 loader 模块级单例存活），不落用户
 * 数据——与用户设置（A9，全本地个人偏好）分层，同名冲突时用户设置优先
 * （分层裁决见 sites/maps/settings/userSettings.ts 模块注释）。
 *
 * GA4 Measurement Protocol 裁决（2026-08-30）：行为分析走 SLS 通道，不做真
 * GA4；需要 measurement_id 时另行立项。本组只承载公告/版本/订阅落地页，
 * 不含埋点配置。
 */
export interface MapsOperationsConfig {
  /** 公告 HTML 片段（空串 = 无公告）；面板 innerHTML 注入（竞品同构，来源为本仓库 backend，可信通道）。 */
  announcementHtml: string
  /** 公告版本标识（服务端运营治理用，客户端当前不消费）。 */
  announcementVersion: string
  /** 最低插件版本：远端值 > 本地 manifest 版本时面板提示有新版本（空串 = 不提示）。 */
  minPluginVersion: string
  /**
   * 订阅落地页（013 U7 遗留接线，W7）：面板「额度用尽」提示旁的跳转按钮
   * 目标页，插件打开时追加 `utm_source=extension` 归因参数。空串 = 未配置，
   * 按钮不渲染（优雅降级为纯文案，与 U7 旧行为一致）。
   */
  pricingUrl: string
  /** 允许服务端下发客户端未声明的运营键。 */
  [key: string]: string
}

/** Maps 远程配置整体（dom / reviewsDom / parseSchema / exportConfig / scrape / operations 六组）。 */
export interface MapsRemoteConfig {
  /** Maps 页选择器。 */
  dom: MapsDomConfig
  /** 评论/照片页选择器。 */
  reviewsDom: MapsReviewsDomConfig
  /** 响应解析 schema。 */
  parseSchema: MapsParseSchemaConfig
  /** 导出行为配置（Pro 门控等）。 */
  exportConfig: MapsExportConfig
  /** 采集运行参数。 */
  scrape: MapsScrapeConfig
  /** 远端运营配置（公告/版本提示）。 */
  operations: MapsOperationsConfig
}

/** 剔除字符串索引签名，仅保留显式声明键（索引键经 [key: string]: unknown 通道进入）。 */
type WithoutIndexSignature<T> = {
  [K in keyof T as string extends K ? never : K]: T[K]
}

/**
 * parseSchema 组的稀疏覆盖形态：组内标量键照常稀疏；fields / reviewsFields
 * 两张下标表**按键稀疏**（服务端只下发要改的字段，未下发字段保留包内默认，
 * 整表替换会清空未下发字段的路径，抽取层取值直接崩溃——2026-09-02 真实
 * e2e 实测回归，禁止回退）。
 */
export type MapsParseSchemaOverride = Partial<WithoutIndexSignature<MapsParseSchemaConfig>> & {
  /** 字段下标表按键稀疏覆盖。 */
  fields?: Partial<MapsParseSchemaFieldsConfig>
  /** 评论字段下标表按键稀疏覆盖。 */
  reviewsFields?: Partial<ReviewsParseFieldsConfig>
  /** 允许服务端下发客户端未声明的解析键。 */
  [key: string]: unknown
}

/** 服务端下发的稀疏覆盖载荷：每组可缺省，仅含要覆盖的键。 */
export interface MapsRemoteConfigOverride {
  /** dom 组稀疏覆盖。 */
  dom?: Partial<MapsDomConfig>
  /** 评论/照片页选择器组稀疏覆盖。 */
  reviewsDom?: Partial<MapsReviewsDomConfig>
  /** parseSchema 组稀疏覆盖（两张下标表按键稀疏）。 */
  parseSchema?: MapsParseSchemaOverride
  /** 导出行为组稀疏覆盖。 */
  exportConfig?: Partial<MapsExportConfig>
  /** scrape 组稀疏覆盖。 */
  scrape?: Partial<MapsScrapeConfig>
  /** 远端运营组稀疏覆盖（公告/版本提示，免发版触达）。 */
  operations?: Partial<MapsOperationsConfig>
}

/** 编译期完整默认值。覆盖走分组浅合并（下标表按键稀疏），组内引用不可共享。 */
export const DEFAULT_MAPS_CONFIG: MapsRemoteConfig = {
  dom: {
    searchInput: 'div[role=search] input[name=q]',
    searchSubmitButton: 'div[role=search] button[aria-label="Search"]',
    feed: 'div[role=feed]',
    main: 'div[role=main]',
    paginationButton: 'button[jsaction="pane.paginationSection.nextPage"]',
    dragCheckbox: 'button[role=checkbox][aria-checked]',
    panelMount: 'body',
    // 实测结束提示 "You've reached the end of the list"，取稳定片段做小写包含匹配
    feedEndMarker: 'reached the end',
    // —— A7 列表模式（U10）：触发与容器选择器（依据见各字段注释）——
    listModeUrlMark: '10m1!1e1',
    listModeDeepUrlMark: '!11m2!2s',
    listContainer: 'div[role=main] > div:last-child',
    // 实录校准点：深层页容器结构漂移未经实录锁定，真实稳定值由服务端远程覆盖
    listContainerDeep: 'div[role=main] > div:last-child > div:last-child',
    listItem: 'div:not(:first-child):not(:last-child)',
    listEndMarker: 'reached the end'
  },
  reviewsDom: {
    // 0 评论/错误页兜底（03 逆向 §3.2 rsScript boot 判定）
    reviewsErrorContainer: '#af-error-container',
    reviewsNoReviewsImage: 'img[src*="no_reviews"]',
    // HTML 回退解析选择器（竞品形态；默认关闭，仅作服务端治理通道）
    reviewsHtmlReviewRow: '.gws-localreviews__google-review',
    reviewsHtmlAuthor: '.gws-localreviews__google-review__author',
    reviewsHtmlRating: 'span[role=img][aria-label]',
    reviewsHtmlText: '.review-full-text',
    reviewsHtmlReply: '[data-orc="lororc"]',
    reviewsHtmlNextToken: '[data-next-page-token]'
  },
  parseSchema: {
    listLocator: 'len-8',
    detailPath: '[i][1]',
    v1ListPath: '[0][1]',
    v1DetailIndex: 14,
    queryPath: '[0][0]',
    formatADirectNavEnabled: true,
    formatBSpaXhrEnabled: true,
    fields: {
      name: [11],
      phone: [178, 0, 0],
      lat: [9, 2],
      lng: [9, 3],
      categories: [13],
      placeId: [78],
      rating: [4, 7],
      reviewsCount: [4, 8],
      website: [7, 0],
      fullAddress: [39],
      // 下标依据 03 号逆向 parseDetails 表 + 黄金样本 20/20 实测命中
      fid: [10],
      // —— U4 扩展：36 列全 schema 的剩余 RPC 直取列（下标依据 03/04 逆向
      //    parseDetails 表，黄金样本双格式 40 行逐一勘验命中；Note/Amenities/
      //    Hotel Class/price 主路径在样本中无数据，按文档对齐待实录校准）——
      description: [32, 1, 1],
      descriptionExtra: [32, 2, 7, 0],
      street: [183, 0, 0, 1, 1],
      municipality: [183, 0, 0, 1, 2],
      about: [100, 1],
      timeZone: [30],
      price: [35, 9],
      priceFallback: [4, 2],
      note: [25, 15, 0, 2],
      amenities: [35, 32, 0, 0, 1, 0],
      hotelClass: [35, 6],
      phones: [178, 0, 1],
      claimed: [49, 0],
      owner: [57, 1],
      ownerId: [57, 2],
      reviewUrl: [4, 3, 0],
      domain: [7, 1],
      openingHours: [203, 0],
      featuredImage: [37, 0, 0, 6, 0],
      kgmid: [89]
    },
    // 评论 txtToJson 下标依据 03 逆向 §3.2（响应无实录样本，按协议文档对齐）
    reviewsLineIndex: 2,
    reviewsListPath: '[1][10][2]',
    reviewsTokenPath: '[1][10][6]',
    reviewsFields: {
      rate: [1],
      date: [2, 0],
      name: [3, 0],
      avatar: [3, 1],
      authorUrl: [3, 2],
      replyDate: [4, 1],
      reply: [4, 2],
      like: [11],
      reviewUrl: [12],
      photos: [14],
      comment: [27]
    },
    reviewsPhotosItemIndex: 0,
    reviewsPhotoSizeParam: 'w1000',
    // 回退是 HTML DOM 解析，竞品时代的页面结构已不可信，默认关闭
    reviewsHtmlFallbackEnabled: false,
    // U4：列表项取值下标与判定标记（04 逆向「每项 [2]」「[5]==2 表示休」等规则）
    phonesItemTextIndex: 0,
    amenitiesItemNameIndex: 2,
    openingHoursClosedFlagIndex: 5,
    openingHoursClosedFlagValue: 2,
    claimedUnclaimedMarker: 'create?fp=',
    // 照片 payload 下标按 03 逆向 §3.3 构造样本约定（end=第 10 位有文档依据）
    photosChunkPayloadIndex: 1,
    photosEndIndex: 10,
    photosNextIndex: 11,
    placeIdHexMaxLength: 20
  },
  // 当前无账号体系，Pro 门控默认全开（剔除逻辑由导出引擎实现，单测覆盖）
  exportConfig: {
    proColumnsEnabled: true
  },
  scrape: {
    scrollIntervalSec: 8,
    scrollIntervalOptionsSec: [5, 6, 8, 9, 10],
    // 竞品拟人区间 1.5~3.5s（jQuery animate 随机时长）
    scrollAnimMinMs: 1500,
    scrollAnimMaxMs: 3500,
    noGrowthRetryLimit: 2,
    freeExportRowLimit: 10,
    listPageRows: 20,
    requestTimeoutMs: 10000,
    requestRetryCount: 2,
    // 评论/照片按免费档默认（配额体系 U7 接入后再分档）
    reviewsPageLimit: 20,
    reviewsPageSize: 10,
    reviewsPageDelayMs: 2000,
    photosPageLimit: 10,
    photosPageSize: 10,
    photosPageDelayMs: 3000
  },
  // 公告默认空（发公告只需服务端改配置，插件免发版生效）；
  // pricingUrl 默认空 = 未配置，订阅跳转按钮不渲染（优雅降级为纯文案）
  operations: {
    announcementHtml: '',
    announcementVersion: '',
    minPluginVersion: '',
    pricingUrl: ''
  }
}
