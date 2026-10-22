/**
 * About 与 Contact 页文案（en-US 基线）。
 *
 * 路由、页脚链接、可见日期与结构化数据共用本模块，保证口径一致。
 * 品牌定位与数据边界口径与 legalContent / extension privacy.html 一致——只采集公开商家数据、
 * 本地 storage 优先、无广告无第三方追踪。Drive / HubSpot 集成按 013 A10 尚未承诺交付，公司页不展示。
 * About 的产品卡标题与正文、收尾 CTA 与首页同源（pages.home），这里只放公司页自有的文案。
 */
import type { AccentHeadingMessage, FloatChipMessage, ProductSectionHeadMessage } from '../i18n/schema'
import type { Locale } from '../i18n/ui'

/** 带标题、说明与入口文字的卡片。 */
export interface CompanyCardMessage {
  title: string
  text: string
  /** 卡片入口链接文字。 */
  link: string
}

/** 一条产品原则：标题 + 正文。 */
export interface CompanyPrincipleMessage {
  title: string
  text: string
}

/** About 页文案。 */
export interface AboutPageContent {
  /** 页脚链接文案。 */
  navLabel: string
  /** 浏览器与搜索结果标题。 */
  seoTitle: string
  /** 搜索结果摘要。 */
  seoDescription: string
  /** ① 首屏：定位文案 + 经纬网地球。 */
  hero: {
    eyebrow: string
    title: AccentHeadingMessage
    intro: string
    /** 主按钮：去 Contact 页。 */
    contactLabel: string
    /** 次按钮：插件产品页。 */
    extensionLabel: string
    /** 产品阶段（带实时圆点）。 */
    stageLabel: string
    /** 审校日期前的标签。 */
    updatedLabel: string
    /** 可读的审校日期（与 COMPANY_PAGES_DATE_MODIFIED_ISO 同一天）。 */
    updatedAt: string
    /** 地球周边三张浮卡：采集范围、结果去向、导出格式。 */
    chips: readonly [FloatChipMessage, FloatChipMessage, FloatChipMessage]
    /** 地球下方的拖拽提示（仅有指针悬停能力的设备显示）。 */
    dragHint: string
  }
  /** ② What we build：枢纽胶囊连到四个产品，下方是免费工具胶囊。 */
  build: ProductSectionHeadMessage & {
    /** 枢纽胶囊。 */
    hub: { title: string; detail: string }
    /** 各产品卡的三个标签（卡片徽标、标题、正文与入口取 pages.home.products.cards）。 */
    tags: Record<'extension' | 'online' | 'api' | 'mcp', readonly [string, string, string]>
    /** 免费工具说明：加粗引导语 + 正文。 */
    toolsLead: string
    toolsText: string
    /** 工具胶囊列表的无障碍名称。 */
    toolsLabel: string
  }
  /** ③ 原则：每条配一个微动画面板，最后一张卡指向法务文档。 */
  principles: ProductSectionHeadMessage & {
    /** 只采集公开数据：面板里的「可见」与「私有」贴纸。 */
    publicData: CompanyPrincipleMessage & { visibleTag: string; privateTag: string }
    /** 本地优先：浏览器窗口地址栏文字与三行存储项。 */
    localFirst: CompanyPrincipleMessage & { storage: string; rows: readonly [string, string, string] }
    /** 后端只做四件事：四个用途胶囊。 */
    backend: CompanyPrincipleMessage & { chips: readonly [string, string, string, string] }
    /** 绝不做的事：三个被划掉的胶囊。 */
    never: CompanyPrincipleMessage & { chips: readonly [string, string, string] }
    /** 书面承诺：链到隐私政策。 */
    inWriting: CompanyCardMessage & { kicker: string }
  }
  /** ④ 数据流向（恒暗主题岛）：Maps → 浏览器（本地）→ 后端四类用途。 */
  dataFlow: ProductSectionHeadMessage & {
    source: { label: string; title: string; text: string }
    browser: { label: string; storage: string; rows: readonly [string, string, string]; badge: string }
    /** 后端四类用途，顺序固定：远程配置（下发）、账号与额度（往返）、补全（往返）、使用记录（上报）。 */
    backend: {
      label: string
      lanes: readonly [CompanyPrincipleMessage, CompanyPrincipleMessage, CompanyPrincipleMessage, CompanyPrincipleMessage]
    }
    never: { label: string; items: readonly string[] }
    /** 网站分析说明 + 隐私政策入口。 */
    note: string
    noteLink: string
  }
  /** ⑤ 现状与定价。 */
  status: {
    kicker: string
    title: AccentHeadingMessage
    /** 早期访问：入口为插件页安装教程。 */
    access: CompanyCardMessage
    /** 免费额度：入口为插件定价。 */
    quota: CompanyCardMessage
    /** 付费方案：入口为定价页。 */
    paid: CompanyCardMessage
  }
}

/** Contact 页文案。 */
export interface ContactPageContent {
  /** 页脚链接文案。 */
  navLabel: string
  /** 浏览器与搜索结果标题。 */
  seoTitle: string
  /** 搜索结果摘要。 */
  seoDescription: string
  eyebrow: string
  title: AccentHeadingMessage
  intro: string
  /** 邮箱卡上的小标签。 */
  emailCardLabel: string
  /** 复制邮箱按钮的无障碍名称，{email} 为邮箱。 */
  copyEmail: string
  /** mailto 主按钮文案。 */
  emailLabel: string
  /** mailto 预填的邮件主题。 */
  emailSubject: string
  /** 回复时效说明。 */
  responseTimes: string
  /** 写信时建议附带的信息。 */
  include: { title: string; text: string; items: readonly string[] }
  /** 可以咨询的主题，顺序固定：安装、账号、额度与付款、网页工具、隐私（页面按序配图标）。 */
  topics: { title: string; items: readonly [string, string, string, string, string] }
  /** 相关页面链接。 */
  aboutLabel: string
  privacyLabel: string
  termsLabel: string
}

/** 公司导航与页面内容。 */
export interface CompanyContent {
  /** 公司链接组的页脚标题。 */
  footerGroupLabel: string
  /** About 页内容。 */
  about: AboutPageContent
  /** Contact 页内容。 */
  contact: ContactPageContent
}

/** About 与 Contact 内容首次发布的 ISO 日期（JSON-LD datePublished 口径）。 */
export const COMPANY_PAGES_PUBLISHED_DATE = '2026-08-07'

/** About 与 Contact 内容最近一次审校的 ISO 日期（time datetime 与 JSON-LD dateModified 共用）。 */
export const COMPANY_PAGES_DATE_MODIFIED_ISO = '2026-08-31'

/** en-US 正式文案（当前唯一 locale）。 */
const enUS: CompanyContent = {
  footerGroupLabel: 'Company',
  about: {
    navLabel: 'About',
    seoTitle: 'About MapsGrab | Product and Boundaries',
    seoDescription:
      'MapsGrab is a maps data toolkit for public business data: a browser extension, a cloud Online Scraper, API and MCP server, and free web tools. Learn where the data boundary is.',
    hero: {
      eyebrow: 'About MapsGrab',
      title: { lead: 'Maps data, grabbed the ', accent: 'straightforward', tail: ' way' },
      intro:
        'MapsGrab builds tools that collect publicly available business information from Google Maps and turn it into clean, structured data — a browser extension for Edge and Firefox, a cloud-based Online Scraper, API and MCP server, plus free web tools that run entirely in your browser.',
      contactLabel: 'Contact Support',
      extensionLabel: 'Explore the Extension',
      stageLabel: 'Early access',
      updatedLabel: 'Published and reviewed',
      updatedAt: 'August 31, 2026',
      chips: [
        { label: 'Collects', value: 'Public data only' },
        { label: 'Extension results', value: 'In your browser' },
        { label: 'Exports', value: 'CSV · JSON' }
      ],
      dragHint: 'Drag to spin'
    },
    build: {
      kicker: 'What we build',
      title: { lead: 'One toolkit, ', accent: 'four', tail: ' ways in' },
      lead: 'Pick the browser extension, the cloud-based Online Scraper, or the API. The extension works inside your own browser; the Online Scraper and the API share one cloud engine, and the MCP server brings that API to AI agents.',
      hub: {
        title: 'MapsGrab data toolkit',
        detail: 'Business data · reviews · photos · email & social enrichment'
      },
      tags: {
        extension: ['36-column extraction', 'Reviews & photos', 'Batch tasks'],
        online: ['Batch keywords', 'Contact enrichment', 'One 37-column CSV per task'],
        api: ['Business data', 'Reviews', 'Structured JSON'],
        mcp: ['Two tools', 'Streamable HTTP', 'OAuth or API key']
      },
      toolsLead: 'Plus free web tools.',
      toolsText:
        'The free web tools on this site handle small jobs — place IDs, review links, coordinate conversions, CSV merging — without installing anything.',
      toolsLabel: 'Free web tools'
    },
    principles: {
      kicker: 'Principles',
      title: { lead: 'Where the ', accent: 'boundary', tail: ' is' },
      lead: 'MapsGrab is deliberately conservative about data. These are the product rules we hold ourselves to.',
      publicData: {
        title: 'Public data only',
        text: 'Only publicly available business information — what any visitor to the page can already see.',
        visibleTag: 'Visible to any visitor',
        privateTag: 'Private accounts'
      },
      localFirst: {
        title: 'Local-first',
        text: 'With the extension and the free web tools, your settings and results live in your browser, not on our servers. The Online Scraper, the API and the MCP server run in our cloud, and Online Scraper results are saved to your account.',
        storage: 'local storage',
        rows: ['Settings', 'Results', 'Batch tasks']
      },
      backend: {
        title: 'Extension & free tools: four backend jobs',
        text: 'For the extension and the free web tools, our backend handles exactly four things: remote configuration, account and quota status, optional email/social enrichment, and minimal usage logs.',
        chips: ['Config', 'Quota', 'Enrichment', 'Usage logs']
      },
      never: {
        title: 'No ads. No trackers. No data sales.',
        text: 'No ads, no third-party trackers in the extension, and no selling or renting of data.',
        chips: ['Ads', 'Third-party trackers', 'Selling data']
      },
      inWriting: {
        kicker: 'In writing',
        title: 'Privacy Policy & Terms',
        text: 'Each of these rules is spelled out in the Privacy Policy and the Terms of Service.',
        link: 'Read the Privacy Policy'
      }
    },
    dataFlow: {
      kicker: 'How data moves',
      title: { lead: 'What stays with you, and what ', accent: 'reaches us', tail: '' },
      lead: 'The extension works on publicly displayed data and keeps results in your browser. For the extension and the free web tools, our backend only powers configuration, quotas, optional enrichment, and minimal usage logs. The Online Scraper, the API and the MCP server run in our cloud instead, and Online Scraper results are saved to your account.',
      source: {
        label: 'Source',
        title: 'Google Maps pages you visit',
        text: 'Public business data — name, address, phone, website, rating, reviews, photos.'
      },
      browser: {
        label: 'Your browser · local-first',
        storage: 'local storage · IndexedDB',
        rows: ['Settings', 'Extraction results', 'Batch task state'],
        badge: 'Stored in your browser'
      },
      backend: {
        label: 'MapsGrab backend · four purposes',
        lanes: [
          { title: 'Remote configuration', text: 'Page-structure presets that keep extraction working' },
          { title: 'Account & quota', text: 'Sign-in, plan status, monthly usage accounting' },
          { title: 'Email & social enrichment', text: 'Publicly listed contacts, when the feature is used' },
          { title: 'Usage logging', text: 'Minimal records of feature usage and errors' }
        ]
      },
      never: {
        label: 'Never',
        items: [
          'No ads',
          'No third-party trackers in the extension',
          'No selling or renting of personal data',
          'No collection of your browsing history beyond the Google Maps pages you extract from'
        ]
      },
      note: 'This website uses Google Analytics 4 to measure aggregate page usage — the extension itself contains no analytics.',
      noteLink: 'Read the Privacy Policy'
    },
    status: {
      kicker: 'Status',
      title: { lead: 'Early access, ', accent: 'free', tail: ' to start' },
      access: {
        title: 'Early access',
        text: 'The product is in early access. Store listings for Edge Add-ons and Firefox Add-ons are being finalized.',
        link: 'Install guide'
      },
      quota: {
        title: 'Free monthly quota',
        text: 'The extension works without an account within a free monthly quota.',
        link: "What's included"
      },
      paid: {
        title: 'Paid plans for heavier use',
        text: 'Paid plans raise the limits for heavier use. See the Pricing page for the current tiers.',
        link: 'See pricing'
      }
    }
  },
  contact: {
    navLabel: 'Contact',
    seoTitle: 'Contact MapsGrab Support',
    seoDescription: 'Contact MapsGrab about accounts, the browser extension, billing, tools, or privacy requests.',
    eyebrow: 'Contact MapsGrab',
    title: { lead: 'Talk to a ', accent: 'human', tail: '' },
    intro: 'Write to us and a person will read it. Support is currently handled directly by the team that builds MapsGrab.',
    emailCardLabel: 'Support email',
    copyEmail: 'Copy {email}',
    emailLabel: 'Email Support',
    emailSubject: 'MapsGrab support request',
    responseTimes:
      'We answer support email within one business day, usually faster. Privacy requests may take a few days when we need to verify account ownership first.',
    include: {
      title: 'What to include',
      text: 'A precise report helps us identify the affected workflow without asking for sensitive account information.',
      items: [
        'The page URL and the action you attempted',
        'Your browser name and version',
        'The exact error message and a screenshot when useful',
        'An order number for billing questions, without payment card details'
      ]
    },
    topics: {
      title: 'What we can help with',
      items: [
        'Installation and setup of the browser extension',
        'Account access and sign-in issues',
        'Quotas, subscriptions, renewals, and payment questions',
        'Web tool problems and feature requests',
        'Privacy and account data requests'
      ]
    },
    aboutLabel: 'About',
    privacyLabel: 'Privacy Policy',
    termsLabel: 'Terms of Service'
  }
}

/** 按 website 路由使用的 locale 联合类型索引的本地化内容。 */
const companyContent: Record<Locale, CompanyContent> = {
  'en-US': enUS
}

/** 返回指定 locale 的 About、Contact 与页脚文案。 */
export function getCompanyContent(locale: Locale): CompanyContent {
  return companyContent[locale] ?? enUS
}
