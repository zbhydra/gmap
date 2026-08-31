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
  }
}

export interface FAQItemMessage {
  question: string
  answer: string
}

/** CTA 归因通道（cta_click 事件，GA4 通道已接）共用的行动区文案。 */
export interface CtaBandMessage {
  /** 区块标题。 */
  title: string
  /** 区块说明。 */
  description: string
  /** 主按钮文案。 */
  button: string
  /** 按钮下的辅助说明（如免费额度口径）。 */
  note?: string
}

/** 首页产品形态卡。 */
export interface HomeProductCardMessage {
  /** 卡片标识：extension / online / api，用于渲染分支与测试锚点。 */
  id: 'extension' | 'online' | 'api'
  /** 卡片名称。 */
  name: string
  /** 一句话定位。 */
  tagline: string
  /** 卡片说明段落。 */
  description: string
  /** 能力要点清单。 */
  bullets: readonly string[]
  /** 卡片行动文案。 */
  ctaLabel: string
  /** available = 已上线卡片渲染链接；coming-soon = 占位卡片不渲染链接（点击无效，不 404）。 */
  status: 'available' | 'coming-soon'
  /** available 卡片的站内跳转路径；coming-soon 卡片忽略该字段。 */
  href: string
}

/** 首页用户评价占位区的一条评价。 */
export interface HomeTestimonialMessage {
  /** 评价引文（早期用户场景描述，不含虚构人名）。 */
  quote: string
  /** 评价者角色标签（不虚构具体身份信息）。 */
  role: string
}

/** 首页内容。 */
export interface HomePageContent {
  /** SEO 元信息。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** 首屏 hero。 */
  hero: {
    /** 小标签。 */
    eyebrow: string
    /** H1（产品一句话）。 */
    title: string
    /** H1 下说明。 */
    description: string
    /** 主 CTA（安装，指向下载页）。 */
    primaryCta: string
    /** 次 CTA（产品介绍页）。 */
    secondaryCta: string
  }
  /** 三产品形态卡区。 */
  products: {
    /** 小标签。 */
    eyebrow: string
    /** 区块标题。 */
    title: string
    /** 区块说明。 */
    description: string
    /** 已上线徽章。 */
    availableLabel: string
    /** 占位徽章（Coming soon）。 */
    comingSoonLabel: string
    /** 卡片列表（固定三张：插件 / Online / API）。 */
    items: readonly HomeProductCardMessage[]
  }
  /** 社证占位区。 */
  testimonials: {
    /** 小标签。 */
    eyebrow: string
    /** 区块标题。 */
    title: string
    /** 占位区说明（诚实标注评价正在收集中）。 */
    note: string
    /** 评价卡列表。 */
    items: readonly HomeTestimonialMessage[]
  }
  /** 首页 FAQ。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 区块说明。 */
    description?: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** 页底 CTA 行动区。 */
  cta: CtaBandMessage
}

/** 产品页功能组。 */
export interface ExtensionFeatureGroupMessage {
  /** 功能组标题。 */
  title: string
  /** 功能组说明。 */
  description: string
  /** 能力要点（对齐 A5 36 列口径）。 */
  items: readonly string[]
}

/** 版本说明段的一条发版记录（承接 changelog 职能）。 */
export interface ExtensionReleaseMessage {
  /** 版本号（含发布通道标注）。 */
  version: string
  /** 可读发布时间。 */
  date: string
  /** 变更要点。 */
  changes: readonly string[]
}

/** 安装引导的一个步骤。 */
export interface InstallStepMessage {
  /** 步骤标题。 */
  title: string
  /** 步骤细节（可多行）。 */
  details: readonly string[]
}

/** 插件产品页内容。 */
export interface ExtensionPageContent {
  /** SEO 元信息。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** 首屏 hero。 */
  hero: {
    /** 小标签。 */
    eyebrow: string
    /** H1。 */
    title: string
    /** H1 下说明。 */
    description: string
    /** 主 CTA（安装，指向下载页）。 */
    primaryCta: string
    /** 次 CTA（查看定价）。 */
    secondaryCta: string
  }
  /** 功能清单区。 */
  features: {
    /** 小标签。 */
    eyebrow: string
    /** 区块标题。 */
    title: string
    /** 区块说明。 */
    description: string
    /** 功能组列表。 */
    groups: readonly ExtensionFeatureGroupMessage[]
  }
  /** 版本说明段（承接 changelog 职能）。 */
  versionNotes: {
    /** 小标签。 */
    eyebrow: string
    /** 区块标题。 */
    title: string
    /** 区块说明。 */
    description: string
    /** 发版记录列表。 */
    releases: readonly ExtensionReleaseMessage[]
  }
  /** 安装引导区。 */
  install: {
    /** 小标签。 */
    eyebrow: string
    /** 区块标题。 */
    title: string
    /** 区块说明。 */
    description: string
    /** 通用三步引导。 */
    steps: readonly InstallStepMessage[]
    /** 指向下载页的按钮文案。 */
    downloadCta: string
  }
  /** 页底 CTA 行动区。 */
  cta: CtaBandMessage
}

/** 下载页的一个商店/直装渠道。 */
export interface DownloadChannelMessage {
  /** 渠道标识：edge / firefox，用于渲染分支与测试锚点。 */
  id: 'edge' | 'firefox'
  /** 浏览器渠道名。 */
  name: string
  /** 商店名（Edge Add-ons / Firefox Add-ons (AMO)）。 */
  storeName: string
  /** 商店链接状态说明（上架前为占位说明）。 */
  storeStatus: string
  /** 商店跳转按钮文案（上架前 href 占位不可用）。 */
  storeCta: string
  /** 直装（zip）小节标题。 */
  manualTitle: string
  /** 直装步骤。 */
  steps: readonly InstallStepMessage[]
}

/** 下载页内容。 */
export interface DownloadPageContent {
  /** SEO 元信息。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** 首屏 hero。 */
  hero: {
    /** 小标签。 */
    eyebrow: string
    /** H1。 */
    title: string
    /** H1 下说明。 */
    description: string
  }
  /** 直装 zip 资产说明（release 资产占位）。 */
  zip: {
    /** 小节标题。 */
    title: string
    /** 小节说明。 */
    description: string
    /** 下载按钮文案（指向 release 资产占位）。 */
    button: string
    /** 按钮下的占位说明。 */
    note: string
  }
  /** 浏览器渠道列表（Edge / Firefox）。 */
  channels: readonly DownloadChannelMessage[]
  /** 帮助区。 */
  help: {
    /** 区块标题。 */
    title: string
    /** 区块说明。 */
    description: string
    /** 联系支持按钮文案。 */
    contactCta: string
  }
}

/** Pricing 页的套餐卡（SSR 静态展示事实；真实扣价以支付配置为准）。 */
export interface PricingPlanCardMessage {
  /** 卡片标识：free / pro / business，用于渲染分支与测试锚点。 */
  id: 'free' | 'pro' | 'business'
  /** 档位名。 */
  name: string
  /** 一句话定位。 */
  tagline: string
  /** 展示价文本（如 $39）。 */
  price: string
  /** 价格周期说明（per month）。 */
  periodLabel: string
  /** 月度额度行（如 100,000 records / month）。 */
  quota: string
  /** 档位功能清单（对齐插件已交付能力）。 */
  features: readonly string[]
  /** 按钮文案。 */
  ctaLabel: string
  /** free = 当前档（引导去下载页）；buyable = 接购买链路。 */
  status: 'free' | 'buyable'
}

/** Pricing 页的占位产品卡（Online / API，不可购）。 */
export interface PricingComingSoonCardMessage {
  /** 卡片标识：online / api，用于渲染分支与测试锚点。 */
  id: 'online' | 'api'
  /** 产品名。 */
  name: string
  /** 一句话定位。 */
  tagline: string
  /** 说明段落。 */
  description: string
}

/** Pricing 页面内容（MapsGrab 三档套餐 + 占位产品卡）。 */
export interface PricingPageContent {
  /** SEO 元信息。 */
  seo: {
    /** HTML title。 */
    title: string
    /** meta description。 */
    description: string
  }
  /** 首屏标题区。 */
  hero: {
    /** 小标题。 */
    eyebrow: string
    /** H1。 */
    title: string
    /** 首屏说明。 */
    description: string
  }
  /** 主推档位徽章文案（标在 Pro 卡上）。 */
  popularLabel: string
  /** 用户状态卡片（登录态 + 当前套餐摘要）。 */
  account: {
    /** 加载中文案。 */
    loading: string
    /** 未登录标题。 */
    signedOutTitle: string
    /** 未登录说明。 */
    signedOutDescription: string
    /** 登录按钮。 */
    signInCta: string
    /** 当前套餐行前缀标签。 */
    planLabel: string
    /** 无到期时间文案。 */
    noExpiry: string
    /** Free 档展示名。 */
    freePlan: string
    /** 账号区加载失败文案。 */
    loadFailed: string
  }
  /** 有效自动续费订阅的支付渠道取消指引。 */
  cancellationGuide: {
    /** 账号套餐行的取消入口文案。 */
    buttonLabel: string
    /** 取消指引弹窗标题。 */
    title: string
    /** 各支付渠道内的取消路径。 */
    paths: readonly {
      /** 支付渠道名称。 */
      provider: string
      /** 渠道后台内依次进入的页面或执行的操作。 */
      steps: readonly string[]
    }[]
    /** 取消指引弹窗关闭按钮文案。 */
    closeLabel: string
  }
  /** 套餐卡区。 */
  plans: {
    /** 小标签。 */
    eyebrow: string
    /** 区块标题。 */
    title: string
    /** 区块说明。 */
    description: string
    /** 档位卡（固定三张：free / pro / business）。 */
    cards: readonly PricingPlanCardMessage[]
    /** 额度口径脚注（records 的计算口径）。 */
    quotaNote: string
    /** 支付配置加载中文案。 */
    loading: string
    /** 支付配置加载失败文案。 */
    loadFailed: string
    /** 商品无可用支付渠道文案。 */
    noChannels: string
    /** 已有有效套餐时按钮点击的提示。 */
    alreadyActive: string
  }
  /** 购买流程文案（下单/等待/结果，供 checkout 弹窗装配）。 */
  checkout: {
    /** 商品在支付弹窗中的使用范围提示。 */
    usageNotice: string
    /** 支付成功标题。 */
    successTitle: string
    /** 支付成功说明。 */
    successDescription: string
    /** 支付未完成标题。 */
    failedTitle: string
    /** 商品标题（弹窗摘要行）。 */
    productTitlePrefix: string
  }
  /** Online / API 占位卡区（不可购）。 */
  comingSoon: {
    /** 小标签。 */
    eyebrow: string
    /** 区块标题。 */
    title: string
    /** 区块说明。 */
    description: string
    /** 占位徽章（Coming soon）。 */
    comingSoonLabel: string
    /** 占位卡列表。 */
    items: readonly PricingComingSoonCardMessage[]
  }
  /** 页底购买答疑。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 区块描述。 */
    description?: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
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
  /** H1（工具名 = 目标搜索词）。 */
  title: string
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

/** 工具页通用交互文案（结果区/复制/下载 + 壳的通用区标题）。 */
export interface ToolCommonMessage {
  /** 「相关工具」互链区标题。 */
  relatedHeading: string
  /** 全部 7 个工具的互链注册表（壳渲染时排除当前工具）。 */
  relatedTools: readonly FooterToolLinkMessage[]
  /** 壳通用区 eyebrow（Free tool）。 */
  eyebrowLabel: string
  /** SEO 正文区标题（About this tool）。 */
  aboutHeading: string
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

/** 工具页页底 CTA 行动区（安装插件 / 查看套餐）。 */
export interface ToolCtaBandMessage {
  /** 区块标题。 */
  title: string
  /** 区块说明。 */
  description: string
  /** 安装插件主按钮。 */
  installButton: string
  /** 查看套餐次按钮。 */
  pricingButton: string
}

/** Place Id Finder 工具内容。 */
export interface PlaceIdFinderContent {
  /** SEO 元信息。 */
  seo: ToolSeoMessage
  /** 首屏。 */
  hero: ToolHeroMessage
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
  }
  /** 结果区字段标签。 */
  result: {
    /** Place ID 字段。 */
    placeId: string
    /** CID 字段。 */
    cid: string
    /** FID 字段。 */
    fid: string
  }
  /** SEO 正文小节。 */
  howTo: readonly ToolHowToSectionMessage[]
  /** 页面 FAQ。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** 页底 CTA。 */
  cta: ToolCtaBandMessage
}

/** Review Link Generator 工具内容。 */
export interface ReviewLinkGeneratorContent {
  /** SEO 元信息。 */
  seo: ToolSeoMessage
  /** 首屏。 */
  hero: ToolHeroMessage
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
  /** SEO 正文小节。 */
  howTo: readonly ToolHowToSectionMessage[]
  /** 页面 FAQ。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** 页底 CTA。 */
  cta: ToolCtaBandMessage
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
export interface EmailCheckerContent {
  /** SEO 元信息。 */
  seo: ToolSeoMessage
  /** 首屏。 */
  hero: ToolHeroMessage
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
  /** SEO 正文小节（说明仅格式校验，不做 SMTP）。 */
  howTo: readonly ToolHowToSectionMessage[]
  /** 页面 FAQ。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** 页底 CTA。 */
  cta: ToolCtaBandMessage
}

/** Lat Long → DMS 转换工具内容。 */
export interface LatLongToDmsContent {
  /** SEO 元信息。 */
  seo: ToolSeoMessage
  /** 首屏。 */
  hero: ToolHeroMessage
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
  /** SEO 正文小节。 */
  howTo: readonly ToolHowToSectionMessage[]
  /** 页面 FAQ。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** 页底 CTA。 */
  cta: ToolCtaBandMessage
}

/** DMS → DD 转换工具内容。 */
export interface DmsToDdContent {
  /** SEO 元信息。 */
  seo: ToolSeoMessage
  /** 首屏。 */
  hero: ToolHeroMessage
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
  /** SEO 正文小节。 */
  howTo: readonly ToolHowToSectionMessage[]
  /** 页面 FAQ。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** 页底 CTA。 */
  cta: ToolCtaBandMessage
}

/** Bulk Keywords Generator 工具内容。 */
export interface BulkKeywordsContent {
  /** SEO 元信息。 */
  seo: ToolSeoMessage
  /** 首屏。 */
  hero: ToolHeroMessage
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
  /** SEO 正文小节。 */
  howTo: readonly ToolHowToSectionMessage[]
  /** 页面 FAQ。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** 页底 CTA。 */
  cta: ToolCtaBandMessage
}

/** Merge CSV Files Online 工具内容。 */
export interface MergeCsvContent {
  /** SEO 元信息。 */
  seo: ToolSeoMessage
  /** 首屏。 */
  hero: ToolHeroMessage
  /** 输入区文案。 */
  form: {
    /** 文件选择标签。 */
    filesLabel: string
    /** 文件选择说明（多选 + 纯浏览器处理）。 */
    filesHint: string
    /** 文件选择按钮。 */
    browse: string
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
  }
  /** SEO 正文小节。 */
  howTo: readonly ToolHowToSectionMessage[]
  /** 页面 FAQ。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 问答列表。 */
    items: FAQItemMessage[]
  }
  /** 页底 CTA。 */
  cta: ToolCtaBandMessage
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
      home: string
      /** 导航：插件产品页入口。 */
      extension: string
      /** 导航：Online 占位入口（不指向功能页，点击无效不 404，与首页占位卡同语义）。 */
      online: string
      /** 导航：下载页入口。 */
      download: string
      pricing: string
    }
    footer: {
      /** Footer heading for legal and product-reference links. */
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
  }
  pages: {
    /** 首页内容（W2）。 */
    home: HomePageContent
    /** 插件产品页内容（W2）。 */
    extension: ExtensionPageContent
    /** 下载页内容（W2）。 */
    download: DownloadPageContent
    /** Pricing 页共用的账户区文案（登录弹窗、支付弹窗、账户菜单）。 */
    account: AccountContent
    /** Pricing 页面内容（MapsGrab 三档套餐，W5）。 */
    pricing: PricingPageContent
    /** 免费工具矩阵内容（W4，每工具一键段）。 */
    tools: {
      /** 工具矩阵通用文案（结果区/复制/下载）。 */
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
