/**
 * About 与 Contact 的文案类型、日期口径与领域入口。
 * 各语言静态文案统一存放在 i18n/lang/，产品卡与收尾 CTA 继续复用 pages.home。
 */
import type { AccentHeadingMessage, FloatChipMessage, ProductSectionHeadMessage } from '../i18n/schema'
import type { Locale } from '../i18n/ui'
import { getLocaleContent } from '../i18n/localized-content'

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

/** 返回指定 locale 的 About、Contact 与页脚文案。 */
export function getCompanyContent(locale: Locale): CompanyContent {
  return getLocaleContent(locale).company
}
