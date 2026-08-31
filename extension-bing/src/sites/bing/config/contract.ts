/**
 * Bing 远程配置契约（adapters / parse / scrape / export / panel 五组）。
 *
 * 契约规则（与 013 域拍板的远程配置方案同构，服务端与客户端共同遵守）：
 * - 包内 DEFAULT_BING_CONFIG 是编译期完整默认值，客户端功能永不因配置缺失而中断；
 * - 服务端下发的是**稀疏覆盖**：组内只含要覆盖的键，允许出现客户端未声明的键
 *   （各组带 index signature）；同名键不做任何类型/取值校验，原样 Object.assign 覆盖；
 * - `adapters` 是数组组，语义为**整体替换**（对齐竞品 SYNC-BING-MAPS-CONFIG 下发
 *   `bingMapsVersions` 整体覆盖/追加内置适配器的行为，见竞品调研 §4.2）；
 * - 远程缺键保留包内值，拉取失败/超时静默回退包内默认值；
 * - Bing 改版（选择器漂移）由服务端改配置，刷新页面即生效。
 *
 * 默认值依据（逐项对照，不得凭空新增）：
 * - 适配器选择器候选：竞品 v2.4.9 chunk-f1caaee2 内置适配器逐字抄录
 *   （docs/research/bing-maps-scraper-竞品调研.md §4.2 表格的数据源）；
 * - 采集节奏参数：竞品调研 §3 流程实测值；
 * - 面板停靠/示例搜索词：T1 §2 契约值与竞品调研 §3。
 */

/** 单版本 DOM 适配器的候选选择器组。数组语义 = 按顺序试探，querySelector 命中即用。 */
export interface BingAdapterSelectors {
  /** 列表容器候选。 */
  listContainer: string[]
  /** 主条目候选（含 data-entity 属性的元素）。 */
  listItems: string[]
  /** 兜底条目候选（主候选空时按序试探）。 */
  listItemsAlt: string[]
  /** 无限滚动容器候选（legacy 无限滚动关闭，为空数组）。 */
  scrollContainer: string[]
  /** "Search this area" 按钮候选（仅 new 版翻页路径使用）。 */
  searchAreaButton: string[]
  /** 加载态指示候选（检测翻页/滚动是否生效）。 */
  loadingIndicator: string[]
  /** 营业时间节点候选（条目内）。 */
  openHours: string[]
  /**
   * 翻页按钮候选。空数组 = 该版本无按钮翻页（new 版走无限滚动）；
   * 以「空数组表示无候选」统一各选择器语义，等价 T1 §2 的可省略 `paginationButton?`。
   */
  paginationButton: string[]
  /** 是否启用无限滚动翻页（true 时忽略 paginationButton）。 */
  infiniteScroll: boolean
  /** 允许服务端下发客户端未声明的选择器键。 */
  [key: string]: string[] | boolean
}

/** 单版本 DOM 适配器（竞品 chunk-f1caaee2 同构；竞品的 urlPatterns/nextPageContainer 不入契约：选择器探测已覆盖版本判定，legacy 翻页只需按钮本身）。 */
export interface BingAdapterConfig {
  /** 版本名（探测优先级相同时按名字典序稳定排序）。 */
  name: 'legacy' | 'new'
  /** 探测优先级，小者优先。 */
  priority: number
  /** 主探测器：任一命中即选定该版本。 */
  detectors: string[]
  /** 兜底探测器：主探测器全部未命中时按序试探。 */
  fallbackDetectors: string[]
  /** 候选选择器组。 */
  selectors: BingAdapterSelectors
}

/** data-entity 解析契约组。 */
export interface BingParseConfig {
  /** 列表项上承载结构化 JSON 的属性名。 */
  dataEntityAttr: string
  /** 是否优先读结构化评分 entity.ratingValue / ratingSourceName。 */
  ratingFromEntityEnabled: boolean
  /** 结构化评分缺失时是否走 infoboxHtml 星级图二次解析兜底。 */
  ratingInfoboxFallbackEnabled: boolean
  /** 行去重键（entity 内字段路径；竞品用 Set 按 entity.id 去重，见调研 §4.2）。 */
  dedupeKey: string
  /** 允许服务端下发客户端未声明的解析键。 */
  [key: string]: string | boolean
}

/** 采集运行参数组（值 = 竞品调研 §3 端到端流程实测）。 */
export interface BingScrapeConfig {
  /** 列表检测轮询间隔（毫秒；竞品 HomePage 每 1.5s 检测列表）。 */
  detectPollMs: number
  /** 采集主循环轮间隔（毫秒；竞品轮间隔 500ms）。 */
  loopIntervalMs: number
  /** 翻页/滚动触发后的等待（毫秒；竞品 sleep 2s）。 */
  paginationDelayMs: number
  /** 主循环连续失败轮数上限，达到即退出（防死循环；竞品 12 次）。 */
  maxConsecutiveFailures: number
  /** 列表就绪等待总时长（毫秒）。 */
  listReadyTimeoutMs: number
  /** 列表就绪轮询间隔（毫秒）。 */
  listReadyPollMs: number
  /** 免费档单次采集行数上限（超出截断并停止；门控归 U4，此处只做截断依据）。 */
  freeRowLimit: number
  /** 允许服务端下发客户端未声明的运行参数键。 */
  [key: string]: number
}

/** 导出行为配置组。 */
export interface BingExportConfig {
  /** 导出文件名前缀（竞品 `Bing_Maps_Scraper_{条数}_{timestamp}`，调研 §5）。 */
  fileNamePrefix: string
  /** CSV 字段分隔符。 */
  csvDelimiter: string
  /** CSV 行分隔符。 */
  csvNewline: string
  /** CSV 是否写入 UTF-8 BOM（Excel 中文兼容，调研 §5）。 */
  csvBomEnabled: boolean
  /** 允许服务端下发客户端未声明的导出键。 */
  [key: string]: string | number | boolean
}

/** 面板停靠配置组。 */
export interface BingPanelConfig {
  /** 面板距视口顶部（px）。 */
  dockTopPx: number
  /** 面板距视口右侧（px）。 */
  dockRightPx: number
  /** 面板最小宽度（px）。 */
  minWidthPx: number
  /** 面板最大宽度（px）。 */
  maxWidthPx: number
  /** 面板示例搜索词链接（未检测到列表时的引导跳转，调研 §3）。 */
  exampleSearchUrl: string
  /** 允许服务端下发客户端未声明的面板键。 */
  [key: string]: string | number
}

/** Bing 远程配置整体（adapters / parse / scrape / export / panel 五组）。 */
export interface BingRemoteConfig {
  /** 双版本 DOM 适配器（服务端下发时整体替换本数组）。 */
  adapters: BingAdapterConfig[]
  /** data-entity 解析契约。 */
  parse: BingParseConfig
  /** 采集运行参数。 */
  scrape: BingScrapeConfig
  /** 导出行为配置。 */
  export: BingExportConfig
  /** 面板停靠配置。 */
  panel: BingPanelConfig
}

/** 服务端下发的稀疏覆盖载荷：组可缺省，组内仅含要覆盖的键；adapters 整体替换。 */
export interface BingRemoteConfigOverride {
  /** 适配器数组整体替换载荷。 */
  adapters?: BingAdapterConfig[]
  /** parse 组稀疏覆盖。 */
  parse?: Partial<BingParseConfig>
  /** scrape 组稀疏覆盖。 */
  scrape?: Partial<BingScrapeConfig>
  /** export 组稀疏覆盖。 */
  export?: Partial<BingExportConfig>
  /** panel 组稀疏覆盖。 */
  panel?: Partial<BingPanelConfig>
}

/** 编译期完整默认值。覆盖走分组浅合并，组间、与 DEFAULT_BING_CONFIG 之间不共享引用。 */
export const DEFAULT_BING_CONFIG: BingRemoteConfig = {
  adapters: [
    {
      // —— legacy 适配器（竞品 chunk-f1caaee2 逐字抄录，调研 §4.2 表行 1）——
      name: 'legacy',
      priority: 1,
      detectors: ['.b_vList', '.bm_oneMap'],
      fallbackDetectors: [],
      selectors: {
        listContainer: ['.b_vList'],
        listItems: ['a.listings-item[data-entity]'],
        listItemsAlt: ['li a'],
        // legacy 无限滚动关闭，无滚动容器与 searchThisArea 路径
        scrollContainer: [],
        searchAreaButton: [],
        loadingIndicator: ['.bm_waitlayer'],
        openHours: ['.opHours'],
        paginationButton: ['a.bm_rightChevron'],
        infiniteScroll: false
      }
    },
    {
      // —— new 版适配器（竞品 chunk-f1caaee2 逐字抄录，调研 §4.2 表行 2）——
      name: 'new',
      priority: 2,
      detectors: ['.b_lstcards', '#appShellRoot'],
      fallbackDetectors: ['[data-automation-id="resultsList"]'],
      selectors: {
        listContainer: ['.b_lstcards', '.listingsPanel', '[data-automation-id="resultsList"]'],
        listItems: ['[data-entity]'],
        listItemsAlt: [
          'li .b_split_card',
          'button .listingContent_fjvwG',
          'li[data-key]',
          '[data-entity-id]'
        ],
        scrollContainer: [
          '.b_lstcards',
          '.b_split_cards_cont',
          '[data-automation-id="resultsList"]'
        ],
        searchAreaButton: [
          "button[class*='searchThisAreaButton']",
          "button[data-automation-id='searchThisAreaButton']",
          "[class*='searchThisAreaButton'][role='button']",
          "button[aria-label*='Search this area']",
          "button[data-bm='137']"
        ],
        // 加载态 7 候选：末两项为 new 版骨架屏类名（调研 §4.2）
        loadingIndicator: [
          '.b_waitlayer',
          "[class*='waitlayer']",
          "[class*='loading']",
          "[class*='spinner']",
          "[class*='loader']",
          "[class*='pageSkeletonContainer']",
          "[class*='skeletonItemRoot']"
        ],
        openHours: ['.opHours'],
        // new 版无按钮翻页，走无限滚动 + searchThisAreaButton
        paginationButton: [],
        infiniteScroll: true
      }
    }
  ],
  parse: {
    dataEntityAttr: 'data-entity',
    // 实测 new 版 data-entity 已自带结构化评分字段，结构化优先、星级图兜底（调研 §4.1）
    ratingFromEntityEnabled: true,
    ratingInfoboxFallbackEnabled: true,
    dedupeKey: 'entity.id'
  },
  scrape: {
    detectPollMs: 1500,
    loopIntervalMs: 500,
    paginationDelayMs: 2000,
    maxConsecutiveFailures: 12,
    listReadyTimeoutMs: 8000,
    listReadyPollMs: 250,
    freeRowLimit: 20
  },
  export: {
    fileNamePrefix: 'Bing_Maps_Scraper_',
    csvDelimiter: ',',
    csvNewline: '\n',
    csvBomEnabled: true
  },
  panel: {
    dockTopPx: 80,
    dockRightPx: 40,
    minWidthPx: 300,
    maxWidthPx: 500,
    exampleSearchUrl: 'https://www.bing.com/maps?q=auto+repair+near+new+york+city'
  }
}
