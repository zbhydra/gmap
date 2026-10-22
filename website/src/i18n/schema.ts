/** Pricing 页共用的账户区文案（登录弹窗、Credits 购买、账户菜单）。 */
export interface AccountContent {
  auth: {
    eyebrow: string
    title: string
    trigger?: string
    modalTitle?: string
    modalDescription?: string
    closeLabel?: string
    signedInAs: string
    continueWithGoogle: string
    googleLoading: string
    or: string
    emailLabel: string
    emailPlaceholder: string
    continueWithEmail: string
    sendCode: string
    sendingCode: string
    sendCodeSuccess: string
    sendAgain: string
    codeLabel: string
    codePlaceholder: string
    signIn: string
    termsNotice: string
    termsLink: string
    privacyLink: string
    logout: string
    /** website 积分单位文案。 */
    creditsLabel: string
    /** 未输入邮箱时点击发送验证码的提示。 */
    enterEmailFirst: string
    /** 未输入邮箱或验证码时点击登录的提示。 */
    enterEmailAndCode: string
    /** 验证码发送失败提示。 */
    sendCodeFailed: string
    /** Google 登录失败提示。 */
    googleSignInFailed: string
    /** Google Client ID 未配置提示。 */
    googleClientMissing: string
    /** 登录失败通用提示。 */
    signInFailed: string
  }
  /** PayPal 回跳页文案（success 页确认态按产品线区分展示语义）。 */
  paypalReturn: {
    /** 支付渠道标签。 */
    providerLabel: string
    /** 用户取消支付后的页面标题。 */
    canceledTitle: string
    /** 用户取消支付后的说明。 */
    canceledMessage: string
    /** 用户取消支付页的 meta / Open Graph description。 */
    canceledMetaDescription: string
    /** 等待态标题（产品线中立）。 */
    waitingTitle: string
    /** 等待态说明（产品线中立，不预支 Credits/套餐结果）。 */
    waitingMessage: string
    /** 确认态标题（插件下载线 = Credits 口径）。 */
    confirmedCreditsTitle: string
    /** 确认态说明（Credits 口径）。 */
    confirmedCreditsMessage: string
    /** 确认态标题（Maps 订阅线）。 */
    confirmedSubscriptionTitle: string
    /** 确认态说明（Maps 订阅线）。 */
    confirmedSubscriptionMessage: string
    /** 失败态标题（产品线中立）。 */
    failedTitle: string
    /** 失败态说明。 */
    failedMessage: string
  }
  checkin: {
    /** 账户按钮无障碍文案。 */
    accountButtonLabel: string
    /** 账户菜单无障碍文案。 */
    accountMenuLabel: string
  }
  /** Credits 不足时打开的购买弹窗文案。 */
  creditPurchase: {
    /** 弹窗标题。 */
    title: string
    /** 弹窗描述。 */
    description: string
    /** success 态标题。 */
    successTitle: string
    /** success 态描述。 */
    successDescription: string
    /** 商品卡片 eyebrow。 */
    packageEyebrow: string
    /** 商品卡片说明。 */
    cardNote: string
    /** Credits 数量文案，支持 {credits}。 */
    creditsAmount: string
    /** 主购买按钮。 */
    buyNow: string
    /** 未选中商品卡片按钮。 */
    selectPackage?: string
    /** 支付渠道选择标题。 */
    paymentMethodLabel?: string
    /** 支付方式确认弹窗标题。 */
    paymentTitle?: string
    /** 已选商品摘要标签。 */
    selectedPackageLabel?: string
    /** 确认购买按钮。 */
    confirmPurchase?: string
    /** 返回商品列表按钮。 */
    backToProducts?: string
    /** 关闭按钮无障碍文案。 */
    close: string
    /** 协议勾选文案。 */
    agreementText: string
    /** 配置加载中文案。 */
    loadingConfigs: string
    /** 配置加载失败文案。 */
    loadFailed: string
    /** 无可售商品文案。 */
    noConfigs: string
    /** 可购买状态文案。 */
    ready: string
    /** 创建订单中文案。 */
    creatingOrder: string
    /** 支付中默认文案。 */
    pendingPayment: string
    /** 订单等待弹窗标题。 */
    pendingPaymentTitle?: string
    /** 取消支付按钮文案。 */
    cancelPayment?: string
    /** 支付等待页支持邮箱前缀。 */
    supportMailPrefix?: string
    /** 成功状态文案。 */
    success: string
    /** 失败状态文案。 */
    failed: string
    /** success 态到账文案，支持 {credits}。 */
    successCredits: string
    /** success 态余额文案，支持 {balance}。 */
    successBalance: string
    /** 创建订单失败文案。 */
    createFailed: string
    /** 支付数据不合法文案。 */
    invalidPaymentData: string
    /** 价格更新文案。 */
    priceUpdated: string
    /** 支付网关失败文案。 */
    gatewayFailed: string
    /** 用户主动取消外部支付后的文案。 */
    paymentCanceled?: string
    /** 轮询失败文案。 */
    pollFailed: string
    /** 轮询超时文案。 */
    pollTimeout: string
    /** 订单不存在文案。 */
    orderNotFound: string
    /** 订单过期文案。 */
    orderExpired: string
    /** 履约失败文案。 */
    fulfillmentFailed: string
    /** 登录失效文案。 */
    authExpired: string
    /** 弹窗被浏览器拦截时的引导文案。 */
    popupBlocked: string
  }
}

export interface FAQItemMessage {
  question: string
  answer: string
}

/** 首页区块头：小节标签 + 标题 + 导语。 */
export interface HomeSectionHeadMessage {
  /** 小节标签（kicker）。 */
  kicker: string
  /** 区块标题。 */
  title: AccentHeadingMessage
  /** 标题下导语。 */
  lead?: string
}

/** 首页字段浏览器的分组（插件 / Online 导出 36 列的语义分组）。 */
export type HomeFieldGroup = 'contact' | 'location' | 'profile' | 'reviews' | 'ids'

/** 插件 / Online 导出的 36 列表头：与 extension 导出列 columns.ts 同名，表头是数据合同原文，不翻译。 */
export type HomeFieldColumn =
  | 'Name'
  | 'Description'
  | 'Fulladdress'
  | 'Street'
  | 'Municipality'
  | 'Categories'
  | 'About'
  | 'Plus Code'
  | 'Time Zone'
  | 'Price'
  | 'Note'
  | 'Amenities'
  | 'Hotel Class'
  | 'Phone'
  | 'Phones'
  | 'Claimed'
  | 'Owner'
  | 'Owner Id'
  | 'Owner Link'
  | 'Email'
  | 'Social Medias'
  | 'Review Count'
  | 'Average Rating'
  | 'Review URL'
  | 'Google Maps URL'
  | 'Google Knowledge URL'
  | 'Latitude'
  | 'Longitude'
  | 'Website'
  | 'Domain'
  | 'Opening Hours'
  | 'Featured Image'
  | 'Cid'
  | 'Fid'
  | 'Place Id'
  | 'Kgmid'

/** 首页内容（设计稿 README §7 首页 ①–⑫）。 */
export interface HomePageContent {
  /** SEO 元信息。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** ① 首屏：公告胶囊、标题、搜索命令条（匿名预览）、信任条与产品剧场。 */
  hero: {
    /** 公告胶囊（指向 MCP 介绍页；能力未交付时徽章换成 Coming soon）。 */
    announce: { badge: string; text: string }
    /** H1（构建期拆词）：第一行 + 第二行强调词前的引导 + 强调词 + 结尾标点。 */
    title: { firstLine: string; secondLine: string; accent: string; end: string }
    /** 导语。 */
    lead: string
    /** 搜索命令条：单关键词匿名首屏预览（014 首页预览合同）。 */
    search: {
      /** 输入框的无障碍名称。 */
      label: string
      /** placeholder 打字循环的示例关键词；空提交时预览第一条。 */
      typing: readonly string[]
      /** 提交按钮。 */
      submit: string
      /** 提交中。 */
      loading: string
      /** 建议词前缀。 */
      suggestLabel: string
      /** 建议词（点击即预览）。 */
      suggestions: readonly string[]
    }
    /** 信任条；`{records}` 由页面按 pricing.ts Online Free 档月额度填入。 */
    trust: readonly string[]
    /** 已登录时首屏操作区的 Dashboard 入口（正式任务在 Dashboard 手动提交）。 */
    dashboard: string
    /** 产品剧场：插件面板演示，状态文案与真实插件面板一致。 */
    theater: {
      /** 面板的无障碍名称。 */
      panelLabel: string
      /** 浏览器工具栏插件图标的提示。 */
      extensionActive: string
      /** 地图上的筛选胶囊（插画）。 */
      mapFilters: readonly string[]
      /** 状态徽章：运行中。 */
      live: string
      /** 状态徽章：完成。 */
      done: string
      /** 开始采集按钮。 */
      start: string
      /** 暂停胶囊。 */
      pause: string
      /** 采集中，{count} 为已采集数。 */
      extracting: string
      /** 采集完成，{count} 为总数。 */
      finished: string
      /** 实时计数行的单位（数字在前）。 */
      kpis: { phones: string; emails: string; websites: string }
      /** 导出按钮，{count} 为条数。 */
      export: string
      /** 导出完成提示。 */
      exportSaved: string
      /** 周边浮动卡：找到邮箱。 */
      emailFound: string
      /** 周边浮动卡：平均评分。 */
      averageRating: string
      /** 周边浮动卡：Place ID。 */
      placeId: string
      /** 评分浮动卡取值，{rating} 与 {reviews}。 */
      ratingValue: string
    }
    /** 匿名预览态：首屏前 3 行 + 占位锁定行 + 登录引导。 */
    preview: {
      /** 面板徽章。 */
      badge: string
      /** 面板状态行。 */
      state: string
      /** 首屏条数，{count} 只称本次首屏条数。 */
      count: string
      /** 评论数，{count}。 */
      reviews: string
      /** 锁定说明。 */
      locked: string
      /** 登录后进入 Dashboard。 */
      signIn: string
      /** Online Scraper 介绍页入口。 */
      openOnline: string
      /** 失败，就地提示重试。 */
      failed: string
      /** 首屏零结果。 */
      empty: string
    }
  }
  /** ② 产品事实条：只写真实产品参数。 */
  facts: {
    /** 条上方说明。 */
    caption: string
    /**
     * value 为数字滚动终值；'freeRecords' 取 pricing.ts Online Free 档月额度（首页不另写数字）；
     * plus 为附加的「+N」（不滚动）。
     */
    items: readonly { value: number | 'freeRecords'; plus?: number; label: string }[]
  }
  /** ③ 三步流程。 */
  how: {
    head: HomeSectionHeadMessage
    /** 三步；body 中的 {action} 替换为加粗的 action。 */
    steps: readonly { title: string; body: string; action?: string }[]
    /** 第一步插画里的搜索词。 */
    searchSample: string
    /** 第二步插画环形计数的单位。 */
    columnsUnit: string
    /** 第三步插画的评论文件卡。 */
    reviewsFile: string
  }
  /** ④ 产品 bento：插件 / Online / API / MCP。 */
  products: {
    head: HomeSectionHeadMessage
    /** 产品卡：徽章、标题、说明与入口文案。 */
    cards: Record<'extension' | 'online' | 'api' | 'mcp', { badge: string; title: string; body: string; link: string }>
    /** 插件卡插画：采集中，{count}。 */
    extracting: string
    /** Online 卡插画：关键词行状态（{count} 为行数）。 */
    queue: { rows: string; processing: string }
    /** MCP 卡插画：用户提问与回答（{count} 为匹配数）。 */
    chat: { prompt: string; answer: string }
  }
  /** ⑤ 36 列字段浏览器。 */
  fields: {
    head: HomeSectionHeadMessage
    /** 分组筛选的无障碍名称。 */
    filtersLabel: string
    /** 「全部」筛选。 */
    all: string
    /** 分组：筛选按钮文案与检查器里的组名。 */
    groups: Record<HomeFieldGroup, { filter: string; label: string }>
    /** 检查器样例值标签。 */
    sampleLabel: string
    /** 恒空列（Plus Code 保留列）的样例占位。 */
    emptySample: string
    /** 每列说明。 */
    descriptions: Record<HomeFieldColumn, string>
    /** 评论列卡。 */
    reviews: { title: string; body: string }
    /** 照片 URL 卡。 */
    photos: { title: string; body: string }
    /** 样例 CSV 下载。 */
    sampleCsv: string
  }
  /** ⑥ Email / 社媒补全轨道。 */
  enrichment: {
    head: HomeSectionHeadMessage
    /** 要点清单。 */
    points: readonly string[]
  }
  /** ⑦ 开发者（暗色岛）：代码台按 014 API / MCP 合同示例。 */
  developers: {
    head: HomeSectionHeadMessage
    /** 产品列表的无障碍名称。 */
    listLabel: string
    /** 产品列表项。 */
    items: Record<'search' | 'reviews' | 'photos' | 'mcp', { title: string; description: string }>
    /** 语言 tab 的无障碍名称。 */
    langLabel: string
    /** 复制按钮的无障碍名称。 */
    copyLabel: string
    /** 请求发送中。 */
    sending: string
    /** REST 响应状态行，{ms}。 */
    response: string
    /** MCP 工具调用状态行，{tool}。 */
    toolCall: string
    /** API 介绍页入口。 */
    exploreApi: string
    /** API 定价入口。 */
    apiPricing: string
    /** 跑马灯标题。 */
    worksWith: string
    /** 跑马灯条目。 */
    integrations: readonly string[]
  }
  /** ⑧ 用例：用法描述，不是证言。 */
  useCases: {
    head: HomeSectionHeadMessage
    /** 三张用例卡。 */
    cards: readonly { label: string; title: string; body: string }[]
    /** 线索名单插画的字段标签。 */
    leadTags: readonly string[]
  }
  /** ⑨ 定价预告：价格、额度与方案名逐字取自 pricing.ts。 */
  pricingTeaser: {
    head: HomeSectionHeadMessage
    /** 各产品线卡：标题、计费方式徽章与入口文案。 */
    lines: Record<PricingTabId, { title: string; billing: string; link: string }>
  }
  /** ⑩ 免费工具（工具名与路径来自 layout.footer.tools）。 */
  tools: {
    head: HomeSectionHeadMessage
    /** 每个工具的一句话说明。 */
    descriptions: Record<FooterToolLinkMessage['id'], string>
    /** 网格末尾的占位卡。 */
    more: string
  }
  /** ⑪ FAQ（同时输出 FAQPage 结构化数据）。 */
  faq: {
    kicker: string
    title: AccentHeadingMessage
    lead: string
    /** 联系支持入口。 */
    contact: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** ⑫ 收尾 CTA。 */
  cta: {
    kicker: string
    title: AccentHeadingMessage
    lead: string
    /** 安装（受插件安装能力开关控制）。 */
    install: string
    /** Online Scraper 介绍页入口。 */
    online: string
    /** 按钮下的说明。 */
    note: string
  }
}

/** 营销页带强调词的标题（首页、产品页、工具页、API / MCP 页共用）：lead + accent（衬线斜体 .accent，一个标题最多一处）+ tail。 */
export interface AccentHeadingMessage {
  /** 强调词之前（含与强调词之间的空格）。 */
  lead: string
  /** 强调词。 */
  accent: string
  /** 强调词之后（含开头的空格或标点，可为空）。 */
  tail: string
}

/** 产品页区块头：小节标签 + 标题 + 导语。 */
export interface ProductSectionHeadMessage {
  kicker: string
  title: AccentHeadingMessage
  lead: string
}

/** 产品页事实条的一格：数字滚动到 value，suffix 是紧跟数字的单位（如「 min」）。 */
export interface ProductFactMessage {
  value: number
  suffix?: string
  label: string
}

/** 剧场周边的浮动数据卡：小字说明 + 主值。 */
export interface FloatChipMessage {
  label: string
  value: string
}

/** 产品页 FAQ 区（同时输出 FAQPage 结构化数据）。 */
export interface ProductFaqMessage {
  kicker: string
  title: AccentHeadingMessage
  lead: string
  /** 联系支持入口。 */
  contact: string
  items: readonly FAQItemMessage[]
}

/** 产品页收尾 CTA 面板。 */
export interface ProductCtaMessage {
  kicker: string
  title: AccentHeadingMessage
  lead: string
  /** 主按钮（插件页为安装，受能力开关控制）。 */
  primary: string
  /** 次按钮（套餐对比）。 */
  secondary: string
  /** 按钮下的说明。 */
  note: string
}

/** 行内富文本片段：纯文本或等宽代码（安装步骤里的 about:debugging、manifest.json）。 */
export type InlineTextPart = string | { code: string }

/** 插件安装教程的一步；shot 为真实截图的替代文本。 */
export interface ExtensionInstallStepMessage {
  title: string
  description: readonly InlineTextPart[]
  shot: string
}

/** 插件页能力展台的 6 组能力（数组顺序即自动轮播顺序）。 */
export type ExtensionFeatureId = 'business' | 'reviews' | 'photos' | 'enrichment' | 'batch' | 'export'

/**
 * 插件产品页（设计稿 README §7「插件」①–⑩）。安装与购买入口受 lib/capabilities.ts 控制；
 * 套餐卡逐字消费 pricing.ts 的 extension tab，这里只放页面自己的文案。
 */
export interface ExtensionPageContent {
  seo: {
    title: string
    description: string
  }
  /** ① 首屏：版本胶囊、标题、两个安装入口、信任行与浏览器剧场。 */
  hero: {
    /** 版本胶囊（指向页内 #release-notes）；badge 含 {version}。 */
    announce: { badge: string; text: string }
    title: AccentHeadingMessage
    lead: string
    downloadCta: string
    installCta: string
    /** 信任行。 */
    meta: readonly string[]
    /** 浏览器剧场：Maps 结果侧栏 + MapsGrab 面板，面板文案与真实插件面板一致。 */
    theater: {
      /** 面板的无障碍名称。 */
      panelLabel: string
      /** 浏览器工具栏插件图标的悬停提示。 */
      extensionActive: string
      /** 面板停靠切换按钮的悬停提示。 */
      dock: string
      /** Maps 侧栏的筛选胶囊。 */
      filters: readonly string[]
      /** 结果卡营业状态。 */
      open: string
      /** 含 {time} 的打烊时间。 */
      closes: string
      /** Maps 列表到底提示。 */
      endOfList: string
      /** 面板三态：待命按钮、采集中（含 {count}）、暂停、完成、重置。 */
      start: string
      extracting: string
      pause: string
      complete: string
      reset: string
      /** 实时计数行的单位（数字在前）。 */
      kpis: { phones: string; websites: string; emails: string }
      /** 含 {count} 的导出按钮（键名避开 export：Astro frontmatter 会把 `.export` 误判为导出语句）。 */
      exportCta: string
      /** 浏览器下载气泡的说明。 */
      saved: string
      scrollChip: FloatChipMessage
      dedupeChip: FloatChipMessage
    }
  }
  /** ② 事实条（只写产品事实）。 */
  facts: { caption: string; items: readonly ProductFactMessage[] }
  /** ③ 三种 Maps 视图：搜索结果、商家页、保存列表。 */
  views: {
    head: ProductSectionHeadMessage
    search: { title: string; description: string }
    place: {
      title: string
      description: string
      /** 商家页的两个标签（Overview / Reviews & Photos）。 */
      tabs: readonly [string, string]
      reviewsCta: string
      photosCta: string
      /** 含 {count}。 */
      reviewsCount: string
      /** 含 {count}。 */
      photosCount: string
    }
    /** listName 含 {count}。 */
    saved: { title: string; description: string; listName: string }
  }
  /** ④ 能力展台：tab 与场景面板一一对应，自动轮播。 */
  features: {
    head: ProductSectionHeadMessage
    /** tab 列表的无障碍名称。 */
    tabsLabel: string
    tabs: readonly { id: ExtensionFeatureId; title: string; description: string }[]
    business: {
      /** Claimed 列为真时的徽章。 */
      claimed: string
      fields: {
        phone: string
        website: string
        rating: string
        hours: string
        timeZone: string
        coordinates: string
        placeId: string
        mapsUrl: string
      }
      /** 含 {count}。 */
      reviewCount: string
      /** 含 {count} 的整行列数。 */
      columns: string
      /** Plus Code 列位保留、当前恒为空（README §10），如实标注。 */
      reserved: string
      /** 含 {count} 的未展示列数。 */
      more: string
    }
    /** columns 含 {count}。 */
    reviews: { title: string; columns: string; ownerReply: string; loading: string }
    /** 街景图被过滤的标注。 */
    photos: { streetView: string }
    /** moreNetworks：卡片未展开的社媒也会检查。 */
    enrichment: { website: string; moreNetworks: string }
    /** complete / stuck / total / done 含 {count}；skipped 为 90 秒无进展跳过。 */
    batch: {
      complete: string
      stuck: string
      total: string
      done: string
      skipped: string
      running: string
      queued: string
      autoExport: string
    }
    /** 导出面板（tab id 为 export，键名同样避开 export）。 */
    files: {
      /** 站点文案只写 CSV / JSON（README §10）。 */
      formats: readonly string[]
      /** 含 {rows}、{selected}、{total}。 */
      fileMeta: string
      /** 导出去向卡：本地下载、字段选择、自动下载。 */
      destinations: readonly { title: string; description: string }[]
    }
  }
  /** ⑤ 批量任务（暗色岛）：插件 Dashboard 页 mock，界面文案与真实批量面板一致。 */
  batch: {
    head: ProductSectionHeadMessage
    checks: readonly string[]
    mock: {
      /** 两个标签页：关键词任务 / 评论 URL 任务。 */
      tabs: readonly [string, string]
      taskName: string
      taskPlaceholder: string
      keywords: string
      /** 含 {count}、{limit}。 */
      lineCount: string
      start: string
      columns: { task: string; status: string; actions: string }
      running: string
      complete: string
      /** 进度：{done}、{total}，卡住时加 {stuck}，完成后标已导出。 */
      progress: string
      progressStuck: string
      progressExported: string
      /** 关键词行状态。 */
      lines: { run: string; done: string; stuck: string }
      toast: string
      chip: FloatChipMessage
    }
  }
  /** ⑥ 本地优先：浏览器内与服务端的数据流示意。 */
  privacy: {
    head: ProductSectionHeadMessage
    checks: readonly string[]
    diagram: {
      browser: string
      servers: string
      nodes: {
        mapsTab: string
        panel: string
        storage: string
        exports: string
        config: string
        quota: string
        enrichment: string
      }
      /** 连线上的数据标签。 */
      flows: { rows: string; rules: string; usage: string; websites: string }
    }
  }
  /** ⑦ 官网 ZIP 下载、分浏览器步骤、帮助与版本说明。 */
  install: {
    head: ProductSectionHeadMessage
    /** meta 含 {version}。 */
    zip: { title: string; description: string; button: string; firefoxButton: string; meta: string }
    /** 浏览器切换的无障碍名称。 */
    browserLabel: string
    channels: readonly {
      id: 'chromium' | 'firefox'
      tab: string
      /** 切到该渠道时更新的说明。 */
      note: string
      steps: readonly ExtensionInstallStepMessage[]
    }[]
    help: { title: string; description: string; cta: string }
    /** 版本说明（锚点 #release-notes，承接 changelog 职能）；version 同时供胶囊与 zip 卡使用。 */
    notes: { kicker: string; version: string; status: string; date: string; items: readonly string[] }
  }
  /** ⑧ 方案摘要区块文案；note 为卡片下的计量说明。 */
  plans: { head: ProductSectionHeadMessage; note: string; compare: string }
  faq: ProductFaqMessage
  cta: ProductCtaMessage
}

/** 云端页展示的公开列子集；精确顺序由 provider/export/gmap_columns.py 拥有。 */
export type OnlineCsvField =
  | '#'
  | 'Name'
  | 'Fulladdress'
  | 'Categories'
  | 'Phone'
  | 'Review Count'
  | 'Average Rating'
  | 'Website'
  | 'Emails'
  | 'Search Keyword'

/** 云端页能力项（图标由页面组件按 id 选择）。 */
export type OnlineFeatureId = 'keywords' | 'history' | 'details' | 'enrichment' | 'downloads' | 'browser'

/**
 * 云端采集介绍页（设计稿 README §7「云端」①–⑩）。剧场与模式演示里和 Dashboard 相同的界面文案
 * 直接消费 dashboard 段，套餐卡逐字消费 pricing.ts 的 online tab，这里只放页面自己的文案。
 */
export interface OnlineScraperPageContent {
  seo: {
    title: string
    description: string
  }
  /** ① 首屏：模式胶囊、标题、开始采集与定价入口、信任行与 Dashboard 剧场。 */
  hero: {
    /** 指向页内 #modes。 */
    announce: { badge: string; text: string }
    title: AccentHeadingMessage
    lead: string
    primaryCta: string
    pricingCta: string
    meta: readonly string[]
    theater: {
      /** 单份 CSV 的下载气泡说明。 */
      files: string
      /** 整个 Job 的 CSV 下载按钮。 */
      csv: string
      parallelChip: FloatChipMessage
      billingChip: FloatChipMessage
    }
  }
  /** ② 事实条（只写产品事实）。 */
  facts: { caption: string; items: readonly ProductFactMessage[] }
  /** ③ 五步流程：首页预览 → 登录 → 创建 → 并行执行 → 下载。 */
  flow: {
    head: ProductSectionHeadMessage
    steps: readonly { title: string; description: string }[]
    /** 预览迷你画面的登录引导。 */
    lock: string
    /** 登录迷你画面的邮箱占位。 */
    email: string
    links: { preview: string; dashboard: string }
  }
  /** ④ 三种创建模式演示（关键词 / 地图 / 地区）。 */
  modes: {
    head: ProductSectionHeadMessage
    /** 模式切换的无障碍名称。 */
    tabsLabel: string
    /** 切换模式时更新的说明。 */
    notes: { keywords: string; map: string; regions: string }
    keywords: {
      hint: string
      /** 空行、重复行被丢弃的标注。 */
      blank: string
      duplicate: string
      /** 各档每任务关键词上限。 */
      limitsTitle: string
      limitsCaption: string
      limitsHint: string
    }
    map: {
      /** 含 {keywords}、{points}。 */
      formula: string
      /** 比例尺，含 {value}（公里）。 */
      scale: string
      facts: readonly string[]
    }
    regions: { hint: string }
  }
  /** ⑤ 单 Job CSV 与采样行数；第一行字段名、第二行字段说明、第三行起数据。 */
  results: {
    head: ProductSectionHeadMessage
    /** 含 {count}。 */
    csvMeta: string
    /** 含 {count}。 */
    rows: string
    /** 采样交付行数列表标题。 */
    searches: string
    notes: readonly string[]
    /** 任务语言即创建时的界面语言；站点仅 en-US，不做语言切换演示（README §10）。 */
    language: string
    /** 行号列的读屏名称。 */
    rowLabel: string
    legend: { fields: string; labels: string; data: string }
    /** 含 {count}。 */
    more: string
    /** 第二行字段说明，与公开列同口径。 */
    csvLabels: Readonly<Record<OnlineCsvField, string>>
  }
  /** ⑥ 能力（meta 为卡底的等宽规格行）。 */
  features: {
    head: ProductSectionHeadMessage
    items: readonly { id: OnlineFeatureId; title: string; description: string; meta: string }[]
  }
  /** ⑦ 计量（暗色岛）：用 Free 档演示提交不预扣、完成后按交付行计量、用完禁止提交。 */
  usage: {
    head: ProductSectionHeadMessage
    checks: readonly string[]
    mock: {
      recordsLabel: string
      /** 含 {count}。 */
      left: string
      exhausted: string
      /** 含 {id}。 */
      task: string
      /** 运行中已交付、尚未计量。 */
      pending: string
      counted: string
      /** 含 {count}。 */
      rows: string
      running: string
      /** 含 {count} 的计量增量。 */
      delta: string
    }
  }
  /** ⑧ 方案摘要：spec 行补充每任务关键词上限与补全权益（014）；note 为卡片下的计费说明。 */
  plans: {
    head: ProductSectionHeadMessage
    specs: { keywords: string; contacts: string; included: string; excluded: string }
    note: string
    compare: string
  }
  faq: ProductFaqMessage
  cta: ProductCtaMessage
}

/** Pricing 页 tab 标识：Online Scraper / Extension / API 三条产品线。 */
export type PricingTabId = 'online' | 'extension' | 'api'

/** Dashboard 订阅管理展示的三条产品线（不含 Telegram / Bing，与 auth/me 三线订阅字段对齐）。 */
export type DashboardLineId = PricingTabId

/** Pricing 页的套餐卡（SSR 静态展示事实；真实扣价以支付配置为准）。 */
export interface PricingPlanCardMessage {
  /** 卡片标识，同 tab 内唯一（如 free / pro / business），用于渲染分支与测试锚点。 */
  id: string
  /**
   * 可购买商品 SKU（与后端 product_id 对齐，如 maps_extension_pro / online_lite），
   * 购买按钮与 GA4 plan 维度直接使用；免费卡为 null（不可购买，引导下载）。
   */
  productId: string | null
  /** 档位名。 */
  name: string
  /** 一句话定位。 */
  tagline: string
  /** 展示价文本（如 $39）。 */
  price: string
  /** 价格周期说明（per month / one-time · 30 days）。 */
  periodLabel: string
  /** 月度额度行（如 100,000 records / month）。 */
  quota: string
  /** 档位功能清单（对齐产品已交付能力）。 */
  features: readonly string[]
  /** 按钮文案。 */
  ctaLabel: string
  /** free = 引导去下载页；buyable = 接购买链路。 */
  status: 'free' | 'buyable'
  /** 该产品线的主推档位（卡面加 Most Popular 徽章）。 */
  featured: boolean
}

/** Pricing 对比表单元格：true = 包含，false = 卡面未列出，字符串 = 卡面原句里的档位差异。 */
export type PricingCompareCell = boolean | string

/** Pricing 对比表的一组行：行名取自各档卖点，cells 与该线档位卡一一对应。 */
export interface PricingCompareGroupMessage {
  /** 分组名。 */
  label: string
  rows: readonly {
    /** 行名。 */
    label: string
    /** 各档取值，顺序与长度同 cards。 */
    cells: readonly PricingCompareCell[]
  }[]
}

/** Pricing 单条产品线（一个 tab）的套餐区内容。 */
export interface PricingTabContent {
  /** 产品名（产品切换胶囊、结构化数据 Offer 名）。 */
  name: string
  /** 短名（对比表分段按钮）。 */
  shortName: string
  /** 产品切换胶囊的副标题，{price} 为本线首个付费档的卡面价。 */
  switchMeta: string
  /** 额度单位（records / requests），用于用量估算条。 */
  unit: string
  /** tab 内小标签。 */
  eyebrow: string
  /** tab 内区块标题。 */
  title: string
  /** tab 内区块说明。 */
  description: string
  /** 计费方式标签，顺序对应页面图标。 */
  billingChips: readonly [string, string, string]
  /** 档位卡。 */
  cards: readonly PricingPlanCardMessage[]
  /** 额度口径脚注。 */
  quotaNote: string
  /** 对比表：额度与计费两行由卡面 quota / periodLabel 生成，其余行按分组列出。 */
  compare: {
    /** 切到本线时的区块导语。 */
    lead: string
    /** 额度行行名。 */
    volume: string
    groups: readonly PricingCompareGroupMessage[]
  }
  /** 本产品线购买流程文案（下单摘要/成功口径，供 checkout 弹窗装配）。 */
  checkout: {
    /** 商品在支付弹窗中的使用范围提示。 */
    usageNotice: string
    /** 支付成功标题。 */
    successTitle: string
    /** 支付成功说明。 */
    successDescription: string
  }
}

/** Pricing 计费说明区的四项事实。 */
export type PricingBillingFactId = 'channels' | 'cadence' | 'upgrade' | 'independent'

/** Pricing 页面内容（设计稿 README §7「定价」①–⑦，三条产品线 tab 套餐）。 */
export interface PricingPageContent {
  /** SEO 元信息。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** ① 首屏：标题区与产品切换。 */
  hero: {
    kicker: string
    title: AccentHeadingMessage
    lead: string
    /** 信任行。 */
    meta: readonly string[]
    /** 产品切换（tablist）与对比表分段按钮组的无障碍名称。 */
    switchLabel: string
  }
  /** 主推档位徽章文案（标在各线 featured 卡上）。 */
  popularLabel: string
  /** 三条产品线套餐区（键为 PricingTabId，键序即 tab 顺序）。 */
  tabs: Record<PricingTabId, PricingTabContent>
  /** ② 方案区：区块无障碍名称与用量估算条。 */
  plansSection: {
    label: string
    finder: {
      /** 估算条标题，含 {unit}。 */
      label: string
      /** 估算结果，含 {value} 与 {unit}。 */
      result: string
      /** 滑杆读屏取值，含 {value}、{unit} 与 {plan}。 */
      valueText: string
      /** 命中档位徽章。 */
      fits: string
    }
  }
  /** ③ 对比表（导语随当前产品线取 tabs[*].compare.lead）。 */
  compare: {
    kicker: string
    title: AccentHeadingMessage
    /** 首列表头。 */
    plan: string
    /** 额度与计费分组名。 */
    volumeGroup: string
    /** 计费行行名。 */
    billing: string
    /** 包含 / 未列出的读屏文案。 */
    included: string
    notIncluded: string
  }
  /** ④ 额度单位：records 卡、requests 卡与每月 1 日重置曲线。 */
  usage: {
    head: ProductSectionHeadMessage
    records: {
      meter: string
      badge: string
      title: string
      body: string
      /** 每入列一行商户的计数徽章。 */
      count: string
      /** 挂在商户行上、不计额度的附带数据。 */
      attachments: readonly [string, string, string]
    }
    requests: {
      meter: string
      badge: string
      title: string
      body: string
      /** 请求日志行的悬停说明。 */
      counted: string
      notCounted: string
    }
    reset: {
      title: string
      body: string
      /** 额度上限虚线标签。 */
      limit: string
      /** 月末未用部分的标注。 */
      unused: string
      /** 1 日重置旗标。 */
      flag: string
    }
  }
  /** ⑤ 计费说明。 */
  billing: {
    head: ProductSectionHeadMessage
    items: Record<PricingBillingFactId, { title: string; body: string }>
  }
  /** 购买链路全局状态文案（跨 tab 共用）。 */
  plans: {
    /** 支付配置加载中文案。 */
    loading: string
    /** 支付配置加载失败文案。 */
    loadFailed: string
    /** 商品无可用支付渠道文案。 */
    noChannels: string
    /** 支付弹窗商品标题前缀。 */
    productTitlePrefix: string
    /** 支付未完成标题。 */
    failedTitle: string
    /** 支付选项的周期说明（当前商品均为月度）。 */
    billingPeriodMonthly: string
    /** 自动续费商品的计费说明。 */
    billingAutoRenew: string
    /** 一次性商品的计费说明。 */
    billingOneTime: string
  }
  /** 升级报价、确认与结果文案。 */
  upgrade: {
    /** 当前档按钮标签。 */
    currentPlan: string
    /** 更高档按钮标签，含 {amount}。 */
    button: string
    /** 升级确认标题。 */
    title: string
    /** 确认扣款按钮。 */
    confirm: string
    /** 一次性补差说明，含 {date} 与 {channel}。 */
    oneTime: string
    /** 自动续费立即扣款说明，含 {date} 与 {channel}。 */
    autoRenew: string
    /** 等待渠道生效标题。 */
    pendingTitle: string
    /** 等待渠道生效说明。 */
    pendingDescription: string
    /** 升级完成标题。 */
    successTitle: string
    /** 升级完成说明，含 {date}。 */
    successDescription: string
    /** 报价失败提示。 */
    quoteFailed: string
    /** 确认失败提示。 */
    failed: string
    /** 服务端不可升级原因对应的用户提示。 */
    reasons: {
      /** 无有效订阅。 */
      no_active_subscription: string
      /** 同档或低档。 */
      not_higher_tier: string
      /** 补差不为正。 */
      non_positive_diff: string
      /** 当前渠道不可用于升级。 */
      channel_unavailable: string
    }
  }
  /** ⑥ 购买答疑（同时输出 FAQPage 结构化数据）。 */
  faq: ProductFaqMessage
  /** ⑦ 收尾 CTA：主按钮安装插件（受能力开关控制），次按钮 Online Scraper。 */
  cta: ProductCtaMessage
}

/** 用户 Dashboard 工作区文案（侧栏 + 历史 / API / 订阅三视图，015 U2）。 */
export interface DashboardContent {
  /** 正式任务创建表单。 */
  create: {
    title: string
    modeLabel: string
    modes: { keywords: string; map: string; regions: string }
    keywords: string
    placeholder: string
    count: string
    contacts: string
    contactsPaid: string
    usage: string
    reset: string
    loading: string
    optionsFailed: string
    submit: string
    submitting: string
    failed: string
    exhausted: string
    invalid: string
    map: {
      latitude: string
      longitude: string
      radius: string
      spacing: string
      sampleCount: string
      overLimit: string
      chooseCenter: string
      mapLabel: string
      tilesUnavailable: string
      attribution: string
    }
    region: {
      baseKeywords: string
      basePlaceholder: string
      country: string
      state: string
      citySearch: string
      cityPlaceholder: string
      city: string
      selectCountry: string
      allStates: string
      selectCity: string
      loading: string
      loadFailed: string
      retry: string
      addCountry: string
      addState: string
      addCity: string
      selectedRegions: string
      remove: string
      matchMode: string
      inMode: string
      nearMode: string
      generate: string
      finalQueries: string
      finalPlaceholder: string
      attribution: string
    }
  }
  /** 工作区页面 SEO 元信息（noindex 页仅作 title/description 展示）。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** 工作区骨架（侧栏菜单与窄屏开关）。 */
  shell: {
    /** 会话恢复中占位文案。 */
    loading: string
    /** 会话恢复失败的重试按钮（工作区级面板）。 */
    retry: string
    /** 侧栏菜单：在线导出历史。 */
    navHistory: string
    /** 侧栏菜单：API 管理。 */
    navApi: string
    /** 侧栏菜单：订阅管理。 */
    navSubscriptions: string
    /** 窄屏展开侧栏按钮。 */
    openMenu: string
    /** 窄屏收起侧栏按钮。 */
    closeMenu: string
  }
  /** 侧栏底部个人信息与退出。 */
  account: {
    /** 个人信息按钮无障碍文案。 */
    menuButtonLabel: string
    /** 展开菜单无障碍文案。 */
    menuLabel: string
    /** 退出登录按钮。 */
    logout: string
  }
  /** 在线导出历史视图。 */
  history: {
    /** 视图标题。 */
    title: string
    /** 视图说明。 */
    description: string
    /** 手动刷新按钮。 */
    refresh: string
    /** 列表加载中文案。 */
    loading: string
    /** 列表加载失败文案。 */
    loadFailed: string
    /** 加载失败重试按钮。 */
    retry: string
    /** 无历史标题。 */
    emptyTitle: string
    /** 无历史说明。 */
    emptyHint: string
    /** 列表表头。 */
    columns: {
      /** 任务编号。 */
      taskNo: string
      /** 创建时间（含时区标注）。 */
      createdAt: string
      /** 逻辑采样总数。 */
      samples: string
      /** 已处理数。 */
      processed: string
      /** 结果条数。 */
      records: string
      /** 状态。 */
      status: string
    }
    /** Job 的六种公开状态。 */
    status: {
      /** 排队。 */
      queued: string
      /** 采集中。 */
      collecting: string
      /** 正在准备 CSV。 */
      publishing: string
      /** 已完成。 */
      completed: string
      /** 局部成功。 */
      partial: string
      /** 失败。 */
      failed: string
    }
    /** 创建时间的时区标注（America/New_York）。 */
    timezone: string
    /** 分页控件。 */
    pagination: {
      /** 上一页。 */
      previous: string
      /** 下一页。 */
      next: string
      /** 区间摘要，含 {from} {to} {total}。 */
      summary: string
    }
    /** 关键词明细展开区。 */
    detail: {
      /** 展开明细按钮。 */
      show: string
      /** 收起明细按钮。 */
      hide: string
      /** 明细加载中文案。 */
      loading: string
      /** 明细加载失败文案。 */
      loadFailed: string
      /** 明细关键词列头。 */
      keyword: string
      /** 明细记录数列头。 */
      records: string
      /** 真实执行编号。 */
      runNo: string
      /** 开始时间，纽约时区。 */
      startedAt: string
      /** 结束时间，纽约时区。 */
      finishedAt: string
      /** 联系方式选项快照。 */
      contacts: string
      /** 本任务启用联系方式。 */
      contactsEnabled: string
      /** 本任务关闭联系方式。 */
      contactsDisabled: string
      /** 已成功收口。 */
      completed: string
      /** 尚未收口。 */
      pending: string
      /** 视口来源，含 {lat} {lng} {zoom}。 */
      viewport: string
    }
    /** 整 Job CSV 下载按钮。 */
    downloadCsv: string
    /** 终态没有可下载文件。 */
    noFile: string
    /** 采集、局部结果、忙及发布失败业务码文案。 */
    errors: Readonly<Record<31301 | 31302 | 31303 | 31304, string>>
    /** 其他已报告错误的通用提示。 */
    errorFailed: string
    /** 下载请求进行中文案。 */
    downloading: string
    /** 无可下载文件或签名已过期的就地提示。 */
    downloadUnavailable: string
    /** 下载请求失败提示。 */
    downloadFailed: string
    /** 未登录访问工作区提示。 */
    signInPrompt: string
    /** 未登录访问工作区的登录按钮。 */
    signInCta: string
    /** 会话恢复网络失败提示（可重试，不误判为退出）。 */
    unreachable: string
  }
  /** API 凭证、额度与 MCP 授权管理。 */
  api: {
    /** 视图标题。 */
    title: string
    /** API 与 MCP 接入说明。 */
    description: string
    /** API 产品营销页链接文案。 */
    docsLink: string
    /** 未登录访问工作区提示。 */
    signInPrompt: string
    /** 未登录访问工作区的登录按钮。 */
    signInCta: string
    /** 会话恢复网络失败提示。 */
    unreachable: string
    /** 接入信息加载状态。 */
    loading: string
    /** 接入信息读取失败。 */
    loadFailed: string
    /** 重新读取。 */
    retry: string
    /** 刷新当前用量和凭证摘要。 */
    refresh: string
    /** 凭证区标题。 */
    keyTitle: string
    /** 未生成凭证。 */
    keyEmpty: string
    /** 首次生成。 */
    generateKey: string
    /** 轮换现有凭证。 */
    rotateKey: string
    /** 生成过程中。 */
    generatingKey: string
    /** 明文只展示一次的提示。 */
    keyOnce: string
    /** 凭证生成时间标签。 */
    keyCreated: string
    /** 轮换确认标题。 */
    rotateTitle: string
    /** 轮换立即使旧凭证失效。 */
    rotateMessage: string
    /** 取消操作。 */
    cancel: string
    /** 复制当前明文凭证。 */
    copyKey: string
    /** 复制完成。 */
    copied: string
    /** 复制失败。 */
    copyFailed: string
    /** 凭证生成失败。 */
    keyFailed: string
    /** 月额度区标题。 */
    usageTitle: string
    /** 含 {used} 与 {total}，单位为请求。 */
    usageValue: string
    /** 含 {period} 的计量周期。 */
    usagePeriod: string
    /** 当前额度已耗尽。 */
    quotaExhausted: string
    /** 额度重置时区说明。 */
    quotaReset: string
    /** 当前 API 套餐。 */
    planTitle: string
    /** 前往既有订阅管理。 */
    managePlan: string
    /** 连接信息区标题。 */
    connectionsTitle: string
    /** REST 接口基础地址。 */
    apiUrl: string
    /** MCP 服务地址。 */
    mcpUrl: string
    /** MCP 客户端登录授权说明。 */
    mcpHint: string
    /** 未配置 MCP 连接地址。 */
    mcpUnavailable: string
    /** 复制连接地址。 */
    copyUrl: string
    /** 本人有效 OAuth 授权。 */
    grants: {
      /** 区块标题。 */
      title: string
      /** 授权范围与账号额度说明。 */
      description: string
      /** 正在读取。 */
      loading: string
      /** 尚无授权。 */
      empty: string
      /** 列表读取失败。 */
      loadFailed: string
      /** 含 {name}，标明名称由应用自报。 */
      selfDeclared: string
      /** 授权时间标签。 */
      createdLabel: string
      /** 最近刷新时间标签。 */
      refreshedLabel: string
      /** 从未刷新。 */
      notRefreshed: string
      /** 撤销授权。 */
      revoke: string
      /** 撤销确认标题。 */
      revokeTitle: string
      /** 含 {host} 的撤销影响说明。 */
      revokeMessage: string
      /** 撤销失败。 */
      revokeFailed: string
      /** 分页导航读屏标签。 */
      paginationLabel: string
      /** 含 {page}、{pages}。 */
      pageOf: string
    }
  }
  /** 订阅管理视图（Online / Extension / API 三线）。 */
  subscriptions: {
    /** 视图标题。 */
    title: string
    /** 视图说明。 */
    description: string
    /** 加载中文案。 */
    loading: string
    /** 加载失败文案。 */
    loadFailed: string
    /** 加载失败重试按钮。 */
    retry: string
    /** 三线展示名（键为 DashboardLineId）。 */
    lines: Record<DashboardLineId, string>
    /** 当前套餐标签。 */
    planLabel: string
    /** 到期时间标签。 */
    expiresLabel: string
    /** 无到期时间文案。 */
    noExpiry: string
    /** 无有效付费订阅状态。 */
    free: string
    /** 订阅配置不可用状态（不得伪装成未订阅）。 */
    unavailable: string
    /** 自动续费开启文案。 */
    autoRenewOn: string
    /** 自动续费关闭文案。 */
    autoRenewOff: string
    /** 订阅按钮（跳 Pricing 对应 tab）。 */
    subscribeCta: string
    /** 有效自动续费订阅的渠道管理入口按钮。 */
    manageSubscription: string
    /** 管理入口请求期间的加载文案。 */
    managingSubscription: string
    /** 未登录访问工作区提示。 */
    signInPrompt: string
    /** 未登录访问工作区的登录按钮。 */
    signInCta: string
    /** 会话恢复网络失败提示。 */
    unreachable: string
  }
  /** 渠道内操作指引（管理入口 URL 为空时的兜底展示，自 Pricing 页迁入）。 */
  cancelGuide: {
    /** 操作指引弹窗标题。 */
    title: string
    /** 各支付渠道内的操作路径。 */
    paths: readonly {
      /** 支付渠道名称。 */
      provider: string
      /** 渠道后台内依次进入的页面或执行的操作。 */
      steps: readonly string[]
    }[]
    /** 操作指引弹窗关闭按钮文案。 */
    closeLabel: string
  }
}

/** MCP OAuth 确认页文案；协议权限映射为本仓 Search / Reviews 能力。 */
export interface McpOAuthContent {
  /** 浏览器标题。 */
  seoTitle: string
  /** 页面标题。 */
  title: string
  /** 确认连接来源的提示。 */
  intro: string
  /** 加载状态。 */
  loading: string
  /** 回调主机标签。 */
  hostLabel: string
  /** 含 {name} 的应用自报名称。 */
  selfDeclared: string
  /** 本机应用警示标题。 */
  loopbackTitle: string
  /** 回环地址无法证明开发者身份。 */
  loopbackText: string
  /** 回环地址的展示名称。 */
  loopbackHost: string
  /** 当前账号标签。 */
  accountLabel: string
  /** 切换账号。 */
  switchAccount: string
  /** 权限标题。 */
  permissionsTitle: string
  /** 固定 scope 的业务权限说明。 */
  permissions: readonly string[]
  /** 撤销授权的入口说明。 */
  revokeNote: string
  /** 同意授权。 */
  approve: string
  /** 含 {host} 的拒绝按钮。 */
  deny: string
  /** 回环客户端的拒绝按钮。 */
  denyLoopback: string
  /** 正在返回客户端。 */
  redirecting: string
  /** 无效票据标题。 */
  invalidTitle: string
  /** 无效票据后续操作。 */
  invalidText: string
  /** 授权端错误标题。 */
  errorTitle: string
  /** 授权端固定原因码文案。 */
  errorReasons: Record<import('../scripts/mcp-oauth/client').McpOAuthErrorReason, string>
  /** 授权端错误后续操作。 */
  errorHint: string
  /** 登录提示标题。 */
  signInTitle: string
  /** 登录提示。 */
  signInText: string
  /** 打开现有登录弹窗。 */
  signIn: string
  /** 读取确认信息失败。 */
  loadFailed: string
  /** 提交决定或切换账号失败。 */
  decideFailed: string
  /** 重试读取。 */
  retry: string
}

/** 站内工具链接（页脚 Resources 组与工具页「相关工具」互链共用）。 */
export interface FooterToolLinkMessage {
  /** 工具 ID（与 data-tool-page 值一致，用于渲染分支与测试锚点）。 */
  id:
    | 'place-id-finder'
    | 'review-link-generator'
    | 'email-checker'
    | 'lat-long-to-dms'
    | 'dms-to-dd'
    | 'bulk-keywords-generator'
    | 'merge-csv'
  /** 锚文本（工具名）。 */
  label: string
  /** 站内路径（locale 前缀由消费方拼接）。 */
  path: string
}

/** 工具页 SEO 元信息（H1 = 工具名，独立于 hero 供 title/meta 复用）。 */
export interface ToolSeoMessage {
  /** HTML title。 */
  title: string
  /** meta description。 */
  description: string
}

/** 工具页首屏（H1 = 工具名 + 一句话说明）。 */
export interface ToolHeroMessage {
  /** H1（工具名 = 目标搜索词）；accent 为衬线强调词。 */
  title: AccentHeadingMessage
  /** H1 下说明。 */
  description: string
}

/** 工具页 SEO 正文（what is / how to use）的一个小节。 */
export interface ToolHowToSectionMessage {
  /** 小节标题。 */
  heading: string
  /** 小节正文（1-2 段真实内容）。 */
  body: string
}

/** 插件统一登录页（/extension-login，v3 browser identity，Maps 与 Bing 插件共用，noindex）。 */
export interface ExtensionLoginPageContent {
  /** <title>。 */
  title: string
  /** <meta description>。 */
  description: string
  /** 顶部 eyebrow。 */
  eyebrow: string
  /** H1 标题。 */
  heading: string
  /** 状态 eyebrow：检查中。 */
  checkingState: string
  /** 状态 eyebrow：需要登录。 */
  signInRequiredState: string
  /** 状态 eyebrow：账号确认。 */
  confirmState: string
  /** 状态 eyebrow：失败。 */
  errorState: string
  /** 进入页面准备阶段标题。 */
  preparingTitle: string
  /** 进入页面准备阶段正文。 */
  preparingText: string
  /** 入口参数非法标题（redirect_uri / code_challenge 校验不过，页面终止）。 */
  invalidParamsTitle: string
  /** 入口参数非法正文。 */
  invalidParamsText: string
  /** 检查已存在 website 登录态标题。 */
  checkingSessionTitle: string
  /** 检查已存在 website 登录态正文。 */
  checkingSessionText: string
  /** Google 回跳换票中标题。 */
  finishingGoogleTitle: string
  /** Google 回跳换票中正文。 */
  finishingGoogleText: string
  /** 需要登录标题。 */
  signInRequiredTitle: string
  /** 需要登录正文。 */
  signInRequiredText: string
  /** 需要登录时的按钮文案（打开登录弹窗）。 */
  signInButtonLabel: string
  /** 账号确认卡标题。 */
  confirmTitle: string
  /** 账号确认卡正文。 */
  confirmText: string
  /** 确认并继续按钮文案（显式确认后才签发一次性 code）。 */
  continueButtonLabel: string
  /** 切换账号按钮文案（清 website 会话回登录弹窗）。 */
  useAnotherAccountLabel: string
  /** 签发一次性 code 中标题。 */
  issuingTitle: string
  /** 签发一次性 code 中正文。 */
  issuingText: string
  /** 签发 / 验证失败标题。 */
  issueFailedTitle: string
  /** 失败重试按钮文案。 */
  retryButtonLabel: string
  /** website 会话验证失败错误前缀（拼接不可翻译的后端原始错误）。 */
  verificationFailedPrefix: string
  /** 一次性 code 签发失败错误前缀（拼接不可翻译的后端原始错误）。 */
  issueFailedPrefix: string
  /** Google 登录失败错误前缀（拼接原始错误）。 */
  googleSignInFailedPrefix: string
  /** Google 登录无法完成错误前缀（拼接原始错误）。 */
  googleCompletionFailedPrefix: string
}

/** 工具页外壳共用文案（面包屑、用法区、相关工具、FAQ 与收尾 CTA 的共用部分）与结果区交互文案。 */
export interface ToolCommonMessage {
  /** 面包屑根节点（指向首页免费工具区）。 */
  crumbRoot: string
  /** 用法区区块头（Place ID Finder 以外的工具，正文为各工具 howTo 三节）。 */
  guide: ProductSectionHeadMessage
  /** 相关工具区区块头（工具卡名称与描述取首页工具区同一份文案）。 */
  related: ProductSectionHeadMessage
  /** FAQ 区共用文案；标题与问答由各工具提供。 */
  faq: {
    kicker: string
    lead: string
    /** 联系支持入口。 */
    contact: string
  }
  /** 收尾 CTA 共用文案；标题与导语由各工具提供，主按钮受 extensionInstall 开关控制。 */
  cta: {
    kicker: string
    /** 安装插件主按钮。 */
    primary: string
    /** 查看插件套餐次按钮。 */
    secondary: string
    /** 按钮下的说明。 */
    note: string
  }
  /** 结果区标题。 */
  resultHeading: string
  /** 复制按钮。 */
  copy: string
  /** 复制成功反馈。 */
  copied: string
  /** 结果下载为 CSV 按钮。 */
  downloadCsv: string
  /** 通用执行错误（就地展示，可重试）。 */
  genericError: string
}

/** 工具页 FAQ（同一份问答输出 FAQPage 结构化数据）。 */
export interface ToolFaqMessage {
  /** 区块标题。 */
  title: AccentHeadingMessage
  /** 问答列表。 */
  items: readonly FAQItemMessage[]
}

/** 工具页收尾 CTA 的工具专属部分（kicker、按钮与说明见 ToolCommonMessage.cta）。 */
export interface ToolCtaMessage {
  /** 区块标题。 */
  title: AccentHeadingMessage
  /** 标题下导语。 */
  lead: string
}

/** 七个工具页共有的页面文案。 */
export interface ToolPageMessage {
  /** SEO 元信息。 */
  seo: ToolSeoMessage
  /** 首屏。 */
  hero: ToolHeroMessage
  /** 页面 FAQ。 */
  faq: ToolFaqMessage
  /** 收尾 CTA。 */
  cta: ToolCtaMessage
}

/** Place Id Finder 工具内容（用法与讲解区为本工具专属，替代通用 howTo）。 */
export interface PlaceIdFinderContent extends ToolPageMessage {
  /** 输入区文案。 */
  form: {
    /** 输入框标签。 */
    urlLabel: string
    /** 输入框占位。 */
    urlPlaceholder: string
    /** 提交按钮。 */
    submit: string
    /** 短链不支持错误。 */
    errorShortLink: string
    /** 非 Maps 地点链接错误。 */
    errorInvalidUrl: string
    /** 链接中未找到地点标识错误。 */
    errorNoIds: string
    /** 示例按钮组前的提示词。 */
    examplesLabel: string
    /** 示例按钮（城市、虚构商户、短链报错态）。 */
    examples: {
      city: string
      business: string
      shortLink: string
    }
  }
  /** 结果区文案。 */
  result: {
    /** Place ID 字段。 */
    placeId: string
    /** CID 字段。 */
    cid: string
    /** FID 字段。 */
    fid: string
    /** 各字段的推导说明（字段名下的小字）。 */
    placeIdNote: string
    cidNote: string
    fidNote: string
    /** URL 解剖区：两段 FID 的图例与空态提示。 */
    anatomy: {
      fidHigh: string
      fidLow: string
      empty: string
    }
    /** 链接里不含该标识时的占位。 */
    missing: string
    /** 复制按钮无障碍名称，{label} 为字段名。 */
    copyLabel: string
    /** 面板底部的隐私说明。 */
    privacy: string
  }
  /** 首屏工具面板两侧的浮动说明卡。 */
  chips: readonly FloatChipMessage[]
  /** 三步用法（同时作为 HowTo 结构化数据的步骤）。 */
  steps: {
    head: ProductSectionHeadMessage
    /** 三步：标题 + 说明。 */
    items: readonly ToolHowToSectionMessage[]
    /** 第二步插画里的「已复制」提示。 */
    copiedBadge: string
    /** 短链说明。 */
    note: string
  }
  /** 三种标识与本地换算。 */
  identifiers: {
    head: ProductSectionHeadMessage
    /** 三种标识各自的一句话说明。 */
    keys: {
      placeId: string
      fid: string
      cid: string
    }
    /** 推导图文案（数值由脚本按最近一次解析结果填充）。 */
    derive: {
      /** 推导图整体的无障碍说明。 */
      label: string
      /** 顶部 FID 的说明。 */
      source: string
      /** Place ID 支线第一步：拼 protobuf 字节。 */
      protobuf: string
      /** Place ID 支线第二步：base64url 编码。 */
      base64: string
      /** CID 支线第一步：取 FID 后半段。 */
      secondHalf: string
      /** CID 支线第二步：十六进制转十进制。 */
      hexToDecimal: string
    }
    /** 本地换算的三条要点。 */
    features: readonly ToolHowToSectionMessage[]
  }
}

/** 使用通用用法区的工具：howTo 三节为 SEO 正文与 HowTo 结构化数据的来源。 */
export interface ToolGuideMessage extends ToolPageMessage {
  /** SEO 正文小节。 */
  howTo: readonly ToolHowToSectionMessage[]
}

/** Review Link Generator 工具内容。 */
export interface ReviewLinkGeneratorContent extends ToolGuideMessage {
  /** 输入区文案（与 Place Id Finder 同款链接输入）。 */
  form: {
    /** 输入框标签。 */
    urlLabel: string
    /** 输入框占位。 */
    urlPlaceholder: string
    /** 提交按钮。 */
    submit: string
    /** 短链不支持错误。 */
    errorShortLink: string
    /** 非 Maps 地点链接错误。 */
    errorInvalidUrl: string
    /** 链接中未找到地点标识错误。 */
    errorNoIds: string
  }
  /** 结果区文案。 */
  result: {
    /** 评论直链字段标签。 */
    linkLabel: string
    /** 打开评论页链接文案。 */
    open: string
  }
}

/** Email Checker 校验问题码（lib 与文案字典的稳定契约）。 */
export type EmailIssueCode =
  | 'empty'
  | 'multipleAt'
  | 'missingAt'
  | 'localEmpty'
  | 'localTooLong'
  | 'localInvalidChars'
  | 'localDotPosition'
  | 'domainEmpty'
  | 'domainNoTld'
  | 'domainInvalidChars'
  | 'domainLabelHyphen'
  | 'domainEmptyLabel'
  | 'domainTooLong'
  | 'typoDomain'

/** Email Checker 工具内容。 */
export interface EmailCheckerContent extends ToolGuideMessage {
  /** 输入区文案。 */
  form: {
    /** 输入框标签。 */
    emailLabel: string
    /** 输入框占位。 */
    emailPlaceholder: string
    /** 提交按钮。 */
    submit: string
    /** 校验通过标题。 */
    validHeading: string
    /** 校验未通过标题。 */
    invalidHeading: string
    /** 问题码 → 用户可见文案。 */
    issues: Record<EmailIssueCode, string>
  }
}

/** Lat Long → DMS 转换工具内容。 */
export interface LatLongToDmsContent extends ToolGuideMessage {
  /** 输入区文案。 */
  form: {
    /** 纬度输入标签。 */
    latitudeLabel: string
    /** 经度输入标签。 */
    longitudeLabel: string
    /** 输入占位。 */
    placeholder: string
    /** 提交按钮。 */
    submit: string
    /** 纬度非法错误（含范围口径）。 */
    errorLatitude: string
    /** 经度非法错误。 */
    errorLongitude: string
  }
  /** 结果区字段标签。 */
  result: {
    /** DMS 输出标签。 */
    dms: string
  }
}

/** DMS → DD 转换工具内容。 */
export interface DmsToDdContent extends ToolGuideMessage {
  /** 输入区文案。 */
  form: {
    /** 纬度组标题。 */
    latitudeHeading: string
    /** 经度组标题。 */
    longitudeHeading: string
    /** 度输入标签。 */
    degreesLabel: string
    /** 分输入标签。 */
    minutesLabel: string
    /** 秒输入标签。 */
    secondsLabel: string
    /** 纬度半球选择标签。 */
    latitudeHemisphereLabel: string
    /** 经度半球选择标签。 */
    longitudeHemisphereLabel: string
    /** 提交按钮。 */
    submit: string
    /** 度分秒数值非法错误（含负值与越界口径）。 */
    errorValues: string
  }
  /** 结果区字段标签。 */
  result: {
    /** 十进制度输出标签。 */
    dd: string
  }
}

/** Bulk Keywords Generator 工具内容。 */
export interface BulkKeywordsContent extends ToolGuideMessage {
  /** 输入区文案。 */
  form: {
    /** 关键词列表标签。 */
    keywordsLabel: string
    /** 关键词列表占位。 */
    keywordsPlaceholder: string
    /** 地点列表标签。 */
    locationsLabel: string
    /** 地点列表占位。 */
    locationsPlaceholder: string
    /** 组合顺序标签。 */
    orderLabel: string
    /** 关键词在前选项。 */
    keywordFirst: string
    /** 地点在前选项。 */
    locationFirst: string
    /** 提交按钮。 */
    submit: string
    /** 生成的组合数模板，{count} 为数量。 */
    resultCount: string
    /** 关键词为空错误。 */
    errorKeywords: string
    /** 地点为空错误。 */
    errorLocations: string
  }
}

/** Merge CSV Files Online 工具内容。 */
export interface MergeCsvContent extends ToolGuideMessage {
  /** 输入区文案。 */
  form: {
    /** 文件选择标签。 */
    filesLabel: string
    /** 文件选择说明（多选 + 纯浏览器处理）。 */
    filesHint: string
    /** 每文件第二行译名跳过选项；{name} 为文件名。 */
    translationRow: string
    /** 合并按钮。 */
    submit: string
    /** 未选择文件错误。 */
    errorNoFiles: string
    /** 文件无表头行错误。 */
    errorEmptyFile: string
    /** 每文件行数摘要模板，{name}/{rows} 为文件名与数据行数。 */
    fileSummary: string
    /** 合并结果统计模板，{files}/{rows}/{columns} 为文件数/数据行数/列数。 */
    resultSummary: string
    /** 合并结果预览框无障碍文案。 */
    previewLabel: string
  }
}

/** API / MCP 落地页带图标的说明卡（能力、要点、特性）。 */
export interface ApiCardMessage {
  /** public/img/icons.svg 的图标名（不含 i- 前缀）。 */
  icon: string
  /** 卡片标题。 */
  title: string
  /** 卡片正文；反引号包住的片段渲染为行内代码。 */
  description: string
}

/** API 页代码台旁的浮动数据卡。 */
export interface ApiChipMessage {
  /** 小字标签。 */
  label: string
  /** 主值。 */
  value: string
}

/** 请求参数表的一行（参数名、类型与约束取自 014 API 合同）。 */
export interface ApiParamMessage {
  /** 参数名。 */
  name: string
  /** JSON 类型。 */
  type: string
  /** 是否必填。 */
  required: boolean
  /** 说明；反引号片段渲染为行内代码。 */
  description: string
}

/** 响应字段表的一行（字段名取自 Provider DTO，示例为虚构的 JSON 字面量）。 */
export interface ApiFieldMessage {
  /** 字段名。 */
  name: string
  /** JSON 类型。 */
  type: string
  /** 示例值（JSON 字面量文本）。 */
  example: string
  /** 字段名旁的小标签（如仅 extra 时返回、所属端点）；省略则不显示。 */
  badge?: string
}

/** 响应字段分组（参考区分段切换的一页）。 */
export interface ApiFieldGroupMessage {
  /** 分组名。 */
  label: string
  /** 组内字段。 */
  fields: readonly ApiFieldMessage[]
}

/**
 * API 页参考区：endpoint 为已有合同的端点（参数表 + 响应字段分组）；
 * pending 为尚无合同的端点（Photos），只给状态说明与其他端点里已有的相关字段，不写占位接口。
 */
export type ApiReferenceMessage =
  | {
      kind: 'endpoint'
      /** 响应 data 的结构示意。 */
      shape: string
      /** 请求参数。 */
      params: readonly ApiParamMessage[]
      /** 响应字段分组。 */
      groups: readonly ApiFieldGroupMessage[]
    }
  | {
      kind: 'pending'
      /** 状态卡标题。 */
      statusTitle: string
      /** 状态说明。 */
      status: string
      /** 相关字段卡标题。 */
      fieldsTitle: string
      /** 其他端点里已有的相关字段。 */
      fields: readonly ApiFieldMessage[]
    }

/** API 落地页单个变体（Scraper / Reviews / Photos 三个路由）的文案（W4）。 */
export interface ApiVariantContent {
  /** SEO 元信息。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** 首屏。 */
  hero: {
    /** H1。 */
    title: AccentHeadingMessage
    /** H1 下导语。 */
    lead: string
    /** 勾选行；{quota} 替换为 pricing.ts API 免费档额度。 */
    meta: readonly string[]
    /** 代码台两侧的浮动数据卡（两张）。 */
    chips: readonly ApiChipMessage[]
  }
  /** 端点区里本变体那张卡。 */
  endpoint: {
    /** 端点名。 */
    name: string
    /** 说明；反引号片段渲染为行内代码。 */
    description: string
    /** 卡片链接文案。 */
    link: string
  }
  /** 能力清单。 */
  caps: {
    /** 区块标题。 */
    title: AccentHeadingMessage
    /** 区块导语。 */
    lead: string
    /** 能力卡。 */
    items: readonly ApiCardMessage[]
  }
  /** 参考区。 */
  reference: ApiReferenceMessage
  /** FAQ。 */
  faq: {
    /** 区块标题。 */
    title: AccentHeadingMessage
    /** 问答（正文为纯文本，同时输出 FAQPage 结构化数据）。 */
    items: readonly FAQItemMessage[]
  }
  /** 收尾 CTA。 */
  cta: {
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
  }
}

/** API 落地页三个变体共用的文案（W4）；CTA、FAQ 侧栏与收尾区的通用词也供 MCP 页使用。 */
export interface ApiPageSharedContent {
  /** 端点切换胶囊的无障碍名称。 */
  switchLabel: string
  /** 端点切换项。 */
  switchItems: {
    search: string
    reviews: string
    photos: string
  }
  /** 获取 Key 主按钮（API 与 MCP 页共用）。 */
  primaryCta: string
  /** 查看 API 定价按钮（API 与 MCP 页共用）。 */
  pricingCta: string
  /** 首屏代码台。 */
  console: {
    /** 代码台区域名称。 */
    label: string
    /** 请求语言 tab 组名称。 */
    langLabel: string
    /** 请求语言 tab。 */
    langs: {
      curl: string
      python: string
      node: string
    }
    /** 复制当前请求按钮。 */
    copy: string
    /** 重放按钮。 */
    replay: string
    /** 状态栏：就绪。 */
    ready: string
    /** 状态栏：正在编写请求。 */
    composing: string
    /** 状态栏：发送中。 */
    sending: string
    /** 状态栏：响应完成。 */
    done: string
    /** 响应区等待占位（代码注释形式）。 */
    waiting: string
    /** 响应区名称。 */
    response: string
  }
  /** 端点区。 */
  endpoints: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语；反引号片段渲染为行内代码。 */
    lead: string
    /** 当前页端点卡的标记。 */
    here: string
    /** 参数芯片组的无障碍名称。 */
    paramsLabel: string
    /** 指向 MCP 页的横幅。 */
    mcp: {
      /** 横幅标题。 */
      title: string
      /** 横幅说明。 */
      description: string
      /** 链接文案。 */
      link: string
    }
  }
  /** fid 串联演示（暗色岛）。 */
  chain: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语；反引号片段渲染为行内代码。 */
    lead: string
    /** 演示图的整体替代文本。 */
    label: string
    /** Search 结果示例（虚构商户）。 */
    places: readonly {
      /** 商户名。 */
      name: string
      /** 评分与评论数。 */
      meta: string
    }[]
    /** Reviews 结果示例（虚构评论）。 */
    reviews: readonly {
      /** 星级 1–5。 */
      rating: number
      /** 评论正文。 */
      text: string
      /** 作者与时间。 */
      meta: string
      /** 商家回复；没有则为空串。 */
      reply: string
    }[]
    /** Photos 步骤（尚未提供，不写接口）。 */
    photos: {
      /** 步骤名。 */
      title: string
      /** 状态说明。 */
      note: string
    }
  }
  /** 参考区通用文案。 */
  reference: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语；反引号片段渲染为行内代码。 */
    lead: string
    /** 基础地址行标签。 */
    baseUrl: string
    /** 复制基础地址按钮。 */
    copyBaseUrl: string
    /** 请求卡标题。 */
    request: string
    /** 响应卡标题。 */
    response: string
    /** 表头。 */
    columns: {
      parameter: string
      field: string
      type: string
      description: string
      example: string
    }
    /** 必填标记。 */
    required: string
    /** 字段分组切换的无障碍名称。 */
    groupsLabel: string
    /** 参考区下方的要点卡。 */
    notes: readonly ApiCardMessage[]
  }
  /** API 方案区（卡片内容逐字取自 pricing.ts 的 API tab）。 */
  plans: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
  }
  /** FAQ 侧栏（API 与 MCP 页共用）。 */
  faq: {
    /** 侧栏导语。 */
    lead: string
    /** 联系支持按钮。 */
    contact: string
  }
  /** 收尾 CTA 通用文案（API 与 MCP 页共用）。 */
  cta: {
    /** 小标签。 */
    kicker: string
    /** 按钮下的说明。 */
    note: string
  }
}

/** MCP 示例会话回答的文本片段：字符串为普通文字，{ strong } 为加粗。 */
export type McpTextPart = string | { strong: string }

/** MCP 接入客户端标识（顺序与配置代码由页面组件定义）。 */
export type McpClientId = 'claude' | 'cursor' | 'vscode' | 'codex'

/** MCP 示例会话里的一次工具调用（参数与结果为虚构的 JSON 文本）。 */
export interface McpCallMessage {
  /** 工具名（014 合同）。 */
  tool: string
  /** 调用参数（单行 JSON）。 */
  args: string
  /** 完成态标签。 */
  state: string
  /** 结果预览行（单行 JSON）。 */
  out: readonly string[]
  /** 预览之后的省略说明。 */
  more: string
}

/** MCP 首屏示例会话的一个场景。 */
export interface McpSceneMessage {
  /** 用户提问。 */
  prompt: string
  /** 工具调用序列。 */
  calls: readonly McpCallMessage[]
  /** 回答。 */
  answer: readonly McpTextPart[]
  /** 回答下方的结果行 [名称, 评分, 电话]；没有则为空数组。 */
  rows: readonly (readonly [string, string, string])[]
}

/** MCP 工具卡（工具名与参数取自 014 合同）。 */
export interface McpToolMessage {
  /** 工具名。 */
  name: string
  /** 图标名。 */
  icon: string
  /** 卡片标题。 */
  title: string
  /** 卡片说明。 */
  description: string
  /** 参数说明；反引号片段渲染为行内代码。 */
  args: readonly {
    name: string
    description: string
  }[]
  /** 返回值摘要。 */
  returns: string
  /** 指向对应 API 页的链接文案。 */
  link: string
}

/** MCP 接入步骤（单个客户端）。 */
export interface McpClientSetupMessage {
  /** 配置代码窗标题（文件名或终端）。 */
  file: string
  /** 三步指引；说明里反引号片段渲染为行内代码。 */
  steps: readonly {
    title: string
    description: string
  }[]
}

/** MCP 示例提示词卡。 */
export interface McpPromptMessage {
  /** 图标名。 */
  icon: string
  /** 场景标签。 */
  tag: string
  /** 提示词。 */
  quote: string
  /** 会调用的工具（按顺序）。 */
  tools: readonly string[]
  /** 涉及的参数或字段；没有则为空串。 */
  fields: string
}

/** MCP 落地页文案（W4）。 */
export interface McpPageContent {
  /** SEO 元信息。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** 客户端名称（会话轮换、拓扑节点与接入 tab 共用）。 */
  clients: Record<McpClientId, string>
  /** 首屏。 */
  hero: {
    /** 小标签。 */
    kicker: string
    /** H1。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
    /** 勾选行；{quota} 替换为 pricing.ts API 免费档额度。 */
    meta: readonly string[]
    /** 会话窗两侧的浮动数据卡（两张）。 */
    chips: readonly ApiChipMessage[]
  }
  /** 首屏示例会话。 */
  agent: {
    /** 会话窗的整体替代文本。 */
    label: string
    /** 窗口标题。 */
    session: string
    /** 连接提示；{server} 替换为加粗的服务名。 */
    connected: string
    /** 输入框占位。 */
    placeholder: string
    /** 思考中提示。 */
    thinking: string
    /** 工具调用运行中标签。 */
    running: string
    /** 场景（循环播放）。 */
    scenes: readonly McpSceneMessage[]
  }
  /** 工具区。 */
  tools: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
    /** 卡片类型标签。 */
    kind: string
    /** 返回值标签。 */
    returns: string
    /** 工具卡。 */
    items: readonly McpToolMessage[]
    /** 照片工具（尚未提供，不写工具名）。 */
    photos: {
      /** 卡片标题。 */
      title: string
      /** 卡片说明。 */
      description: string
      /** 指向 Photos API 页的链接文案。 */
      link: string
    }
  }
  /** 连接拓扑（暗色岛）。 */
  flow: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
    /** 拓扑图的整体替代文本。 */
    label: string
    /** 客户端列标题。 */
    clientsLabel: string
    /** 任意客户端节点。 */
    anyClient: string
    /** 工具列标题。 */
    toolsLabel: string
    /** 中枢名称。 */
    hub: string
    /** 照片节点名称（尚未提供）。 */
    photos: string
    /** 工具列脚注。 */
    publicData: string
    /** 中枢下方调用标签里结果的前缀词。 */
    resultLabel: string
    /** 各工具的返回摘要（与工具卡顺序一致）。 */
    results: readonly string[]
    /** 三步说明。 */
    steps: readonly {
      title: string
      description: string
    }[]
  }
  /** 客户端接入。 */
  setup: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
    /** 客户端 tab 组名称。 */
    tabsLabel: string
    /** 复制配置按钮。 */
    copy: string
    /** 各客户端步骤。 */
    clients: Record<McpClientId, McpClientSetupMessage>
    /** OAuth 登录接入说明。 */
    oauth: {
      title: string
      description: string
    }
    /** 通用客户端规格条。 */
    spec: {
      title: string
      subtitle: string
      transport: string
      transportValue: string
      endpoint: string
      copyEndpoint: string
      auth: string
      authValue: string
    }
  }
  /** 示例提示词墙（两行）。 */
  prompts: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
    /** 两行提示词卡。 */
    rows: readonly (readonly McpPromptMessage[])[]
  }
  /** 认证与数据边界。 */
  trust: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
    /** 请求检视器。 */
    inspector: {
      /** 整体替代文本。 */
      label: string
      /** 请求标签。 */
      request: string
      /** 响应标签。 */
      response: string
      /** 凭证校验通过标签。 */
      verified: string
    }
    /** 要点卡。 */
    items: readonly ApiCardMessage[]
  }
  /** 计费区（额度与价格逐字取自 pricing.ts 的 API tab）。 */
  billing: {
    /** 小标签。 */
    kicker: string
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
    /** 比较方案链接。 */
    compare: string
    /** 阶梯表头。 */
    head: {
      plan: string
      requests: string
      scale: string
      price: string
    }
  }
  /** FAQ。 */
  faq: {
    /** 区块标题。 */
    title: AccentHeadingMessage
    /** 问答。 */
    items: readonly FAQItemMessage[]
  }
  /** 收尾 CTA。 */
  cta: {
    /** 标题。 */
    title: AccentHeadingMessage
    /** 导语。 */
    lead: string
  }
}

export interface SiteContent {
  site: {
    name: string
    description: string
    keywords: string
  }
  layout: {
    nav: {
      brand: string
      /** 主导航无障碍名称。 */
      primaryLabel: string
      /** 移动导航无障碍名称。 */
      mobileLabel: string
      /** 导航：插件产品页入口。 */
      extension: string
      /** 导航：Online 落地页入口（/online-scraper/）。 */
      online: string
      /** 导航：API 下拉入口标签（桌面端，展开 4 个 API 子项）。 */
      api: string
      /** API 下拉子项：Scraper API 落地页。 */
      apiScraper: string
      /** API 下拉子项：Reviews API 落地页。 */
      apiReviews: string
      /** API 下拉子项：Photos API 落地页。 */
      apiPhotos: string
      /** API 下拉子项：Scraper MCP 落地页。 */
      apiMcp: string
      /** API 下拉子项说明（与 apiScraper / apiReviews / apiPhotos / apiMcp 一一对应）。 */
      apiScraperDesc: string
      apiReviewsDesc: string
      apiPhotosDesc: string
      apiMcpDesc: string
      /** API 下拉底栏说明（API 与 MCP 共用请求月额度）。 */
      apiFootNote: string
      /** API 下拉底栏链接：Pricing 的 API 套餐。 */
      apiPricing: string
      pricing: string
      /** 移动菜单：免费工具入口（指向 Place ID Finder）。 */
      freeTools: string
      /** 导航登录按钮（匿名态，打开站级登录弹窗）。 */
      signIn: string
      /** 导航 Dashboard 链接（登录态）。 */
      dashboard: string
    }
    footer: {
      /** 法务链接组无障碍名称。 */
      legalLabel: string
      /** Footer 免费工具链接组标题。 */
      resources: string
      /** Footer 产品链接组标题（插件/下载/定价）。 */
      product: string
      rights: string
      /** Footer Resources 组的免费工具链接（工具名即锚文本，站内权重入口）。 */
      tools: readonly FooterToolLinkMessage[]
    }
  }
  common: {
    installCta: string
    /** 尚未交付的能力提示。 */
    comingSoon: string
    /** 主题选择器无障碍名称。 */
    themeLabel: string
    /** 亮色主题选项。 */
    themeLight: string
    /** 暗色主题选项。 */
    themeDark: string
    /** 跟随系统主题选项。 */
    themeSystem: string
    /** FAQ 区块短标签。 */
    faqLabel: string
    /** 面包屑导航无障碍文案。 */
    breadcrumbLabel: string
    /** 语言切换按钮无障碍文案。 */
    languageSwitcherLabel: string
    /** 移动导航按钮无障碍文案。 */
    mobileMenuLabel: string
    /** 站级复制动作（[data-copy]）成功提示。 */
    copied: string
    /** 通用取消动作。 */
    cancel: string
    /** 通用继续动作。 */
    continue: string
  }
  /** 用户 Dashboard 工作区（015 U2）。 */
  dashboard: DashboardContent
  pages: {
    /** 首页内容（W2）。 */
    home: HomePageContent
    /** 插件产品页内容（营销 + 页内安装教程一体）。 */
    extension: ExtensionPageContent
    /** Pricing 页共用的账户区文案（登录弹窗、支付弹窗、账户菜单）。 */
    account: AccountContent
    /** Pricing 页面内容（MapsGrab 三档套餐，W5）。 */
    pricing: PricingPageContent
    /** Online Scraper 介绍页（/online-scraper/）。 */
    online: OnlineScraperPageContent
    /** API 落地页三个变体的共用文案（W4）。 */
    apiPage: ApiPageSharedContent
    /** Scraper API 落地页（W4，Search 端点）。 */
    scraperApi: ApiVariantContent
    /** Reviews API 落地页（W4，Reviews 端点）。 */
    reviewsApi: ApiVariantContent
    /** Photos API 落地页（W4，端点尚未提供）。 */
    photosApi: ApiVariantContent
    /** Scraper MCP 落地页（W4）。 */
    scraperMcp: McpPageContent
    /** 插件统一登录页内容（v3，noindex，不在语言站内层枚举）。 */
    extensionLogin: ExtensionLoginPageContent
    /** 免费工具矩阵内容（每工具一键段）。 */
    tools: {
      /** 工具页外壳与结果区共用文案。 */
      common: ToolCommonMessage
      placeIdFinder: PlaceIdFinderContent
      reviewLinkGenerator: ReviewLinkGeneratorContent
      emailChecker: EmailCheckerContent
      latLongToDms: LatLongToDmsContent
      dmsToDd: DmsToDdContent
      bulkKeywords: BulkKeywordsContent
      mergeCsv: MergeCsvContent
    }
  }
}
