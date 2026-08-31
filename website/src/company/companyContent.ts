/**
 * About 与 Contact 页文案（en-US 基线）。
 *
 * 路由、页脚链接、可见日期与结构化数据共用本模块，保证口径一致。
 * W3 正式版：品牌定位与数据边界口径与 legalContent / extension privacy.html 一致——
 * 只采集公开商家数据、本地 storage 优先、可选 Drive/HubSpot 用户授权、无广告无第三方追踪。
 */
import type { Locale } from '../i18n/ui'

/** 公司信息页的一个语义区块。 */
export interface CompanyPageSection {
  /** 可见区块标题。 */
  title: string
  /** 可选列表前显示的说明段落。 */
  paragraphs: string[]
  /** 可选的要点/说明清单。 */
  items?: string[]
}

/** About 与 Contact 渲染器共用的文案。 */
interface CompanyPageBaseContent {
  /** 页脚链接文案。 */
  navLabel: string
  /** 浏览器与搜索结果标题。 */
  seoTitle: string
  /** 搜索结果摘要。 */
  seoDescription: string
  /** 页面标题上方的小标签。 */
  eyebrow: string
  /** 可见 H1。 */
  title: string
  /** H1 下方的介绍摘要。 */
  intro: string
  /** 内容日期旁的标签。 */
  updatedLabel: string
  /** 当前 locale 的可读内容日期。 */
  updatedAt: string
  /** 页面正文区块。 */
  sections: CompanyPageSection[]
  /** 隐私页链接文案。 */
  privacyLabel: string
  /** 条款页链接文案。 */
  termsLabel: string
}

/** About 页文案及页面专属动作。 */
export interface AboutPageContent extends CompanyPageBaseContent {
  /** 指向 Contact 页的链接文案。 */
  contactLabel: string
  /** 指向插件产品页的链接文案。 */
  extensionLabel: string
}

/** Contact 页文案及页面专属动作。 */
export interface ContactPageContent extends CompanyPageBaseContent {
  /** 主邮箱动作文案。 */
  emailLabel: string
  /** 返回 About 页的链接文案。 */
  aboutLabel: string
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
      'MapsGrab is a maps data toolkit: a browser extension and web tools for publicly available business information. Learn what we build and where the data boundary is.',
    eyebrow: 'About MapsGrab',
    title: 'Maps data, grabbed the straightforward way',
    intro:
      'MapsGrab builds tools that collect publicly available business information from Google Maps and turn it into clean, structured files — a browser extension for Edge and Firefox, plus free web tools that run entirely in your browser.',
    updatedLabel: 'Published and reviewed',
    updatedAt: 'August 31, 2026',
    sections: [
      {
        title: 'What we build',
        paragraphs: [
          'The MapsGrab extension extracts business data, reviews, and photos from the Google Maps pages you browse, enriches records with publicly listed emails and social profiles, runs batch keyword and review tasks, and exports everything to CSV or JSON. The free web tools on this site handle small jobs — place IDs, review links, coordinate conversions, CSV merging — without installing anything.',
          'The product is in early access. Store listings for Edge Add-ons and Firefox Add-ons are being finalized, and direct installation is available from the Download page.'
        ]
      },
      {
        title: 'Where the boundary is',
        paragraphs: [
          'MapsGrab is deliberately conservative about data. These are the product rules we hold ourselves to:'
        ],
        items: [
          'Only publicly available business information — what any visitor to the page can already see.',
          'Local-first: your settings and results live in your browser, not on our servers.',
          'Our backend handles exactly four things: remote configuration, account and quota status, optional email/social enrichment, and minimal usage logs.',
          'Integrations like Google Drive and HubSpot run on your own authorization and your own accounts, and can be revoked anytime.',
          'No ads, no third-party trackers in the extension, and no selling or renting of data.'
        ]
      },
      {
        title: 'How it is priced',
        paragraphs: [
          'The extension works without an account within a free monthly quota. Paid plans raise the limits for heavier use. See the Pricing page for the current tiers.'
        ]
      }
    ],
    contactLabel: 'Contact Support',
    extensionLabel: 'Explore the Extension',
    privacyLabel: 'Privacy Policy',
    termsLabel: 'Terms of Service'
  },
  contact: {
    navLabel: 'Contact',
    seoTitle: 'Contact MapsGrab Support',
    seoDescription:
      'Contact MapsGrab about accounts, the browser extension, billing, tools, or privacy requests.',
    eyebrow: 'Contact MapsGrab',
    title: 'Talk to a human',
    intro:
      'Write to us and a person will read it. Support is currently handled directly by the team that builds MapsGrab.',
    updatedLabel: 'Published and reviewed',
    updatedAt: 'August 31, 2026',
    sections: [
      {
        title: 'What we can help with',
        paragraphs: [],
        items: [
          'Installation and setup of the browser extension',
          'Account access and sign-in issues',
          'Quotas, subscriptions, renewals, and payment questions',
          'Web tool problems and feature requests',
          'Privacy and account data requests'
        ]
      },
      {
        title: 'What to include',
        paragraphs: [
          'A precise report helps us identify the affected workflow without asking for sensitive account information.'
        ],
        items: [
          'The page URL and the action you attempted',
          'Your browser name and version',
          'The exact error message and a screenshot when useful',
          'An order number for billing questions, without payment card details'
        ]
      },
      {
        title: 'Response times',
        paragraphs: [
          'We answer support email within one business day, usually faster. Privacy requests may take a few days when we need to verify account ownership first.'
        ]
      }
    ],
    emailLabel: 'Email Support',
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
