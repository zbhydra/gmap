import type { SiteContent } from '../schema'
import { zhCNPricingContent } from '../pricing'

export const zhCN: SiteContent = {
  site: {
    name: 'Telegram 视频下载 | TG Downloader',
    description:
      '使用 TG Downloader 在 Telegram Web 中完成 Telegram 视频下载，保存已加载的视频、文件和媒体，并继续处理 Telegram 私人频道内容。',
    keywords:
      'Telegram 视频下载, Telegram 媒体下载, Telegram 视频保存, Telegram 文件下载, Telegram 私人频道'
  },
  layout: {
    nav: {
      brand: 'TG 下载器',
      home: '首页',
      pricing: '价格',
      solutions: '解决方案',
      changelog: '更新日志'
    },
    footer: {
      resources: '资源',
      rights: '© 2026 TG 下载器. 保留所有权利.'
    }
  },
  common: {
    installCta: '立即安装'
  },
  pages: {
    account: {
      auth: {
        eyebrow: '网页登录',
        title: '登录后同步积分',
        trigger: '登录',
        modalTitle: '登录后继续',
        closeLabel: '关闭',
        signedInAs: '当前登录账号',
        continueWithGoogle: '使用 Google 继续',
        googleLoading: '正在打开 Google...',
        or: '或',
        emailLabel: '邮箱',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: '使用邮箱继续',
        sendCode: '发送验证码',
        sendingCode: '发送中...',
        sendCodeSuccess: '验证码已发送。',
        sendAgain: '重新发送',
        codeLabel: '验证码',
        codePlaceholder: '123456',
        signIn: '登录',
        termsNotice: '登录即表示你同意',
        termsLink: '服务条款',
        privacyLink: '隐私政策',
        logout: '退出登录',
        creditsLabel: '积分',
        enterEmailFirst: '请先输入邮箱地址。',
        enterEmailAndCode: '请输入邮箱和验证码。',
        sendCodeFailed: '发送验证码失败。',
        googleSignInFailed: 'Google 登录失败。',
        googleClientMissing: 'Google 登录尚未配置。',
        signInFailed: '登录失败。',
      },
      checkin: {
        accountButtonLabel: '打开账户菜单',
        accountMenuLabel: '账户菜单',
      },
      creditPurchase: {
        title: '购买积分',
        description: '补充积分后即可继续在当前下载工作区下载。',
        successTitle: '积分已到账',
        successDescription: '余额已刷新。关闭弹窗后，请重新点击下载。',
        packageEyebrow: '按需购买',
        cardNote: '积分可用于网站下载，永久有效。',
        creditsAmount: '{credits} 积分',
        buyNow: '立即购买',
        selectPackage: '选择',
        paymentMethodLabel: '选择支付方式',
        paymentTitle: '选择支付方式',
        selectedPackageLabel: '已选商品',
        confirmPurchase: '继续支付',
        backToProducts: '返回',
        close: '关闭',
        agreementText: '我已阅读并同意购买条款、服务条款和隐私政策。',
        loadingConfigs: '正在加载积分套餐...',
        loadFailed: '加载积分套餐失败，请重试。',
        noConfigs: '当前没有可购买的积分套餐，请稍后重试。',
        ready: '请选择积分套餐。页面只展示美元价格。',
        creatingOrder: '正在创建订单...',
        pendingPayment: '请在新打开的标签页中完成支付。我们会自动检查结果。',
        pendingPaymentTitle: '等待支付',
        cancelPayment: '取消支付',
        supportMailPrefix: '反馈问题：',
        success: '支付完成，积分已可使用。',
        failed: '支付尚未完成，你可以重试或关闭弹窗。',
        successCredits: '+{credits} 积分已到账',
        successBalance: '当前余额：{balance} 积分',
        createFailed: '创建订单失败，请重试。',
        invalidPaymentData: '支付链接异常，请稍后重试。',
        priceUpdated: '价格已更新，请确认最新价格后重新购买。',
        gatewayFailed: '支付入口暂不可用，请稍后重试。',
        paymentCanceled: '支付已取消，请重新选择支付方式。',
        pollFailed: '刷新支付状态失败，请重试。',
        pollTimeout: '自动刷新已超时。支付后请手动刷新结果。',
        orderNotFound: '订单已不可用，请重新下单。',
        orderExpired: '订单已过期，请重新购买。',
        fulfillmentFailed: '支付已收到，但积分暂未到账，请稍后重试。',
        authExpired: '登录已失效，请重新登录后继续。'
      },
    },

    changelog: {
      title: 'Telegram 视频下载更新日志',
      description: '持续跟踪 Telegram 视频下载、网页流程和更长保存任务的最新变化。',
      seoTitle: 'Telegram 视频下载更新日志 | TG Downloader',
      seoDescription:
        '查看这份 Telegram 视频下载更新日志，了解网页流程、大文件支持和最新版本变化。',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: '性能提升',
          description: '重大性能改进，提供更好的用户体验。',
          features: ['资源检测速度提升 50%', '优化大文件下载稳定性', '增强界面响应速度']
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: '多语言支持',
          description: '新增全球 14 种语言支持。',
          features: ['新增日语、韩语等多种语言支持', '改进翻译准确性', '新增语言自动检测']
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: '侧边栏下载',
          description: '新增侧边栏下载功能，支持批量下载。',
          features: ['新增侧边栏单文件下载', '新增批量下载功能', '改进下载队列管理']
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: '安全与隐私',
          description: '安全改进和隐私增强。',
          features: ['移除所有分析追踪', '新增纯本地处理模式', '改进数据加密']
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: '初始版本',
          description: '首个版本，支持聊天窗口下载。',
          features: ['聊天窗口下载功能', '支持 Telegram Web K 和 A 版本', '基础媒体格式支持']
        }
      ],
      labels: {
        features: 'New Features',
        fixes: 'Bug Fixes'
      }
    } as SiteContent['pages']['changelog'] & {
      seoTitle: string
      seoDescription: string
    },
    pricing: zhCNPricingContent,
    extensionLoginV2: {
      title: '扩展登录 | TG Downloader',
      description: '登录 TG Downloader，将您的网站会话同步到浏览器扩展。',
      eyebrow: '浏览器扩展',
      heading: '登录 TG Downloader',
      checkingState: '正在检查会话',
      signInRequiredState: '需要登录',
      syncedState: '已登录',
      verificationFailedState: '验证失败',
      preparingTitle: '正在准备登录…',
      preparingText: 'TG Downloader 正在准备网站会话检查。',
      checkingSessionTitle: '正在检查网站会话…',
      checkingSessionText: 'TG Downloader 正在验证此浏览器中存储的网站令牌。',
      finishingGoogleTitle: '正在完成 Google 登录…',
      finishingGoogleText: 'TG Downloader 正在将 Google 登录结果兑换为网站会话。',
      signInRequiredTitle: '登录以继续',
      signInRequiredText: '请使用与网站相同的 TG Downloader 登录窗口。',
      signInButtonLabel: '登录',
      syncingTitle: '正在同步扩展令牌…',
      syncingText: 'TG Downloader 正在将您的网站会话兑换为扩展令牌。',
      syncedTitle: '登录成功',
      syncedText: '扩展已连接到您的 TG Downloader 账号。点击「返回 Telegram」即可返回。',
      returnButtonLabel: '返回 Telegram',
      returningButtonLabel: '返回中…',
      verificationFailedTitle: '无法完成扩展登录',
      retryButtonLabel: '重试',
    },
  }
}
