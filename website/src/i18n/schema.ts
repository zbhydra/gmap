/** Pricing / 扩展登录页共用的账户区文案（登录弹窗、Credits 购买、账户菜单）。 */
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

export interface ChangelogEntryMessage {
  version: string
  date: string
  title: string
  description: string
  features: string[]
  fixes?: string[]
}

/** 平台落地页特性卡片 */
/** 扩展登录页 v2（externally_connectable 协议）文案。 */
export interface ExtensionLoginV2PageContent {
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
  /** 状态 eyebrow：已同步。 */
  syncedState: string
  /** 状态 eyebrow：失败。 */
  verificationFailedState: string
  /** 进入页面准备阶段标题。 */
  preparingTitle: string
  /** 进入页面准备阶段正文。 */
  preparingText: string
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
  /** 需要登录时的按钮文案。 */
  signInButtonLabel: string
  /** 同步扩展 token 中标题。 */
  syncingTitle: string
  /** 同步扩展 token 中正文。 */
  syncingText: string
  /** 同步成功标题。 */
  syncedTitle: string
  /** 同步成功正文。 */
  syncedText: string
  /** 返回 Telegram 按钮文案。 */
  returnButtonLabel: string
  /** 返回中按钮文案。 */
  returningButtonLabel: string
  /** 失败状态标题。 */
  verificationFailedTitle: string
  /** 重试按钮文案。 */
  retryButtonLabel: string
}

/** Bing Maps 插件登录页文案（键结构与 v2 页对齐，返回目标为 Bing Maps 插件）。 */
export interface ExtensionLoginBingPageContent extends ExtensionLoginV2PageContent {}

/** 首页 Solutions 方案卡（标题 + 描述 + "use when" 条件列表） */
/** Pricing 页面内容。 */
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
  /** 主推商品的徽章文案（普通入口标记 Credits 中间档，插件入口标记订阅卡）。 */
  popularLabel: string
  /** 用户状态卡片。 */
  account: {
    title: string
    loading: string
    signedOutTitle: string
    signedOutDescription: string
    signInCta: string
    signedInLabel: string
    creditsLabel: string
    subscriptionLabel: string
    expiresLabel: string
    statusLabel: string
    dailyUsageLabel: string
    resetLabel: string
    autoRenewLabel: string
    active: string
    expired: string
    noExpiry: string
    freePlan: string
    unlimited: string
    loadFailed: string
  }
  /** 有效自动续费订阅的支付渠道取消指引。 */
  cancellationGuide: {
    /** 账号订阅行的取消入口文案。 */
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
  /** Unlimited 商品卡。 */
  subscription: {
    title: string
    eyebrow: string
    description: string
    /** 订阅卡的卖点清单，逐条 SSR 渲染。 */
    benefits: readonly string[]
    /** 购买按钮下的支付保障说明。 */
    trustNote: string
    monthlyLabel: string
    dailyLimitLabel: string
    autoRenewOn: string
    autoRenewOff: string
    /** 订阅商品在支付选择弹窗中的使用范围提示。 */
    usageNotice: string
    loading: string
    loadFailed: string
    noPlan: string
    noChannels: string
    buyNow: string
    loginToBuy: string
    /** 已有有效订阅时重复购买按钮提示。 */
    alreadyActive: string
    creatingOrder: string
    pendingPaymentTitle: string
    pendingPayment: string
    successTitle: string
    successDescription: string
    failedTitle: string
    close: string
    cancelPayment: string
    supportMailPrefix: string
    createFailed: string
    invalidPaymentData: string
    priceUpdated: string
    gatewayFailed: string
    orderNotFound: string
    orderExpired: string
    paymentCanceled: string
    fulfillmentFailed: string
    pollFailed: string
    pollTimeout: string
    authExpired: string
    /** 订阅购买前的插件安装确认标题。 */
    installConfirmTitle: string
    /** 订阅购买前的插件安装确认正文，{link} 会替换成安装链接。 */
    installConfirmMessage: string
    /** 订阅购买前的插件安装链接文案。 */
    installConfirmLinkLabel: string
    /** 订阅购买前确认框取消按钮。 */
    installConfirmCancel: string
    /** 订阅购买前确认框继续按钮。 */
    installConfirmContinue: string
    /** 仅向永久领取次数为 0 的账号展示的好评赠送流程。 */
    reviewReward: {
      /** 初始确认中的赠送说明。 */
      offerMessage: string
      /** 打开 Chrome Web Store 评价页的按钮。 */
      reviewButton: string
      /** 倒计时视图标题。 */
      checkingTitle: string
      /** 倒计时视图说明。 */
      checkingMessage: string
      /** 包含 {seconds} 的剩余时间模板。 */
      countdown: string
      /** 领取请求中的标题。 */
      claimingTitle: string
      /** 领取请求中的说明。 */
      claimingMessage: string
      /** 领取成功标题。 */
      successTitle: string
      /** 领取成功说明。 */
      successMessage: string
      /** 已领取结果标题。 */
      alreadyClaimedTitle: string
      /** 已领取结果说明。 */
      alreadyClaimedMessage: string
      /** 领取失败标题。 */
      failedTitle: string
      /** 普通领取失败说明。 */
      failedMessage: string
      /** 服务器繁忙说明。 */
      busyMessage: string
      /** 直接重试领取按钮。 */
      retry: string
      /** 关闭弹窗按钮。 */
      close: string
    }
  }
  /** Credits 一次性购买区。 */
  credits: {
    title: string
    description: string
    loading: string
    loadFailed: string
    noConfigs: string
    packageEyebrow: string
    creditsAmount: string
    /** Credits 卡价格旁的一次性标注（如 one-time）。 */
    oneTimeLabel: string
    buyNow: string
    loginToBuy: string
    noChannels: string
    /** Credits 卡片价格下方的使用范围提示。 */
    webOnlyNotice: string
  }
  /** 从插件额度入口进入 Pricing 页时的专属强化文案。 */
  extensionSource: {
    /** 已登录或普通升级按钮文案。 */
    primaryCta: string
    /** 未登录升级按钮文案。 */
    signedOutCta: string
    /** 符合资格账号在插件来源页看到的好评赠送标题。 */
    reviewRewardTitle: string
    /** 好评赠送入口的操作说明。 */
    reviewRewardDescription: string
    /** 插件来源页的专属 hero 标题（进入插件布局时替换通用 hero）。 */
    heroTitle: string
    /** 插件来源页的专属 hero 描述。 */
    heroDescription: string
  }
  /** 页底购买答疑（仅围绕积分购买和订阅）。 */
  faq: {
    /** 区块标题。 */
    title: string
    /** 区块描述。 */
    description?: string
    /** 问答列表。 */
    items: FAQItemMessage[]
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
      home: string
      pricing: string
      solutions: string
      changelog: string
    }
    footer: {
      /** Footer heading for legal and product-reference links. */
      resources: string
      rights: string
    }
  }
  common: {
    installCta: string
  }
  pages: {
    /** Pricing / 扩展登录页共用的账户区文案。 */
    account: AccountContent
    changelog: {
      title: string
      description: string
      seoTitle?: string
      seoDescription?: string
      entries: ChangelogEntryMessage[]
      labels: {
        features: string
        fixes: string
      }
    }
    /** Pricing 页面内容。 */
    pricing: PricingPageContent
    /** 扩展登录页 v2（externally_connectable 协议）文案 */
    extensionLoginV2: ExtensionLoginV2PageContent
    /** Bing Maps 插件登录页（externally_connectable 协议）文案 */
    extensionLoginBing: ExtensionLoginBingPageContent
  }
}
