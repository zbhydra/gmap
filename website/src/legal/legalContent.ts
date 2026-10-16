/**
 * 法务页文案（Terms / Privacy，en-US 基线）。
 *
 * 法务文本集中在本模块，保证各 locale 路由渲染同一份审校口径。
 * W3 正式版：事实口径与 extension/public/privacy.html（插件版隐私政策，2026-08-30）一致并扩写——
 * 公开商家数据采集、本地 storage、自有后端四类用途（远程配置/账号配额/enrich/使用记录）、
 * 可选 Drive/HubSpot 用户授权、无广告无第三方追踪；GA4 为营销站唯一第三方分析豁免。
 * sections 是法律正文，改版只调整呈现；glance 只概括正文已明确写到的内容。
 */
import type { Locale } from '../i18n/ui'
import { DEVELOPER_EMAIL } from '../lib/contact'

/** 法务页路由标识。 */
export type LegalPageKind = 'terms' | 'privacy'

/** 法务文档中的一个区块。 */
export interface LegalSection {
  /** 小节锚点：目录、要点卡与外部链接都按它定位，各 locale 保持同值（en-US 标题的 slug）。 */
  id: string
  /** 可见 H2 标题。 */
  title: string
  /** 区块下的正文段落。 */
  paragraphs: string[]
  /** 可选的要点清单（义务、示例或用户权利）。 */
  items?: string[]
  /** 清单是禁止 / 绝不做的条目（以叉号标记）。 */
  prohibitions?: boolean
}

/** 「要点速览」卡：概括正文已写明的一点，点击跳到对应小节。 */
export interface LegalGlanceItem {
  /** 目标小节的 id。 */
  section: string
  /** 图标名（public/img/icons.svg 的 i-<name>）。 */
  icon: string
  /** 图标块色调（.icon-tile--<tone>），缺省为中性。 */
  tone?: 'ok' | 'pin'
  title: string
  text: string
}

/** 覆盖范围待补提示：正文尚未覆盖的产品，法务补稿前按设计稿以 TBD 标注。 */
export interface LegalCoverage {
  /** 提示区的无障碍名称。 */
  label: string
  badge: string
  /** 加粗的引导语。 */
  lead: string
  text: string
}

/** 渲染一份法务文档所需的文案。 */
export interface LegalDocumentContent {
  /** 页脚链接文案。 */
  navLabel: string
  /** HTML title。 */
  seoTitle: string
  /** meta description。 */
  seoDescription: string
  /** 页面 H1，同时是文档切换与插画上的文档名。 */
  title: string
  /** H1 下方的简短摘要。 */
  intro: string
  /** updatedAt 前显示的标签。 */
  updatedLabel: string
  /** 可读的最后更新日期。 */
  updatedAt: string
  /** 最后更新日期的 ISO 形态（time datetime 与 JSON-LD dateModified 共用）。 */
  updatedAtISO: string
  /** 一句话概括：另一份文档末尾「下一篇」卡片的说明。 */
  summary: string
  /** 目录下方求助卡的标题。 */
  helpTitle: string
  /** 要点速览卡（4 张）。 */
  glance: LegalGlanceItem[]
  /** 文档区块。 */
  sections: LegalSection[]
  /** 覆盖范围待补提示；正文已覆盖全部产品时省略。 */
  coverage?: LegalCoverage
}

/** 两份法务文档共用的页面文案；{key} 占位符由页面填充。 */
export interface LegalPageCopy {
  /** 面包屑：首页。 */
  crumbHome: string
  /** 面包屑：法务分组（不可点击）。 */
  crumbLegal: string
  /** 文档切换的无障碍名称。 */
  switchLabel: string
  /** 阅读时长，{minutes} 按正文 200 词 / 分钟估算。 */
  readTime: string
  /** 小节数，{count} 为数量。 */
  sectionCount: string
  /** 目录标题。 */
  tocTitle: string
  /** 目录的无障碍名称，{title} 为文档名。 */
  tocLabel: string
  /** 要点速览的小节标签。 */
  glanceKicker: string
  /** 要点速览的说明。 */
  glanceNote: string
  /** 小节链接（复制带锚点的地址）的无障碍名称，{title} 为小节标题。 */
  anchorLabel: string
  /** 复制支持邮箱按钮的无障碍名称，{email} 为邮箱。 */
  copyEmail: string
  /** 求助卡的联系支持入口。 */
  contactSupport: string
  /** 「下一篇」卡片标签。 */
  nextLabel: string
}

/** 单一 locale 的法务页文案。 */
export interface LegalContent {
  /** 两份文档共用的页面文案。 */
  page: LegalPageCopy
  /** 服务条款。 */
  terms: LegalDocumentContent
  /** 隐私政策。 */
  privacy: LegalDocumentContent
}

const termsLastUpdatedISO = '2026-08-31'
const privacyLastUpdatedISO = '2026-10-16'
const serviceName = 'MapsGrab'
const supportEmail = DEVELOPER_EMAIL

/** en-US 正式法务文案（当前唯一 locale）。 */
const englishLegalContent: LegalContent = {
  page: {
    crumbHome: 'Home',
    crumbLegal: 'Legal',
    switchLabel: 'Legal documents',
    readTime: '{minutes} min read',
    sectionCount: '{count} sections',
    tocTitle: 'On this page',
    tocLabel: '{title} sections',
    glanceKicker: 'At a glance',
    glanceNote: 'A summary of the full text below.',
    anchorLabel: 'Copy link to “{title}”',
    copyEmail: 'Copy {email}',
    contactSupport: 'Contact support',
    nextLabel: 'Next document'
  },
  terms: {
    navLabel: 'Terms',
    seoTitle: `Terms of Service | ${serviceName}`,
    seoDescription:
      'The MapsGrab Terms of Service: acceptable use, user responsibility for collected data, purchases, disclaimers, and how to contact us.',
    title: 'Terms of Service',
    intro: `These Terms govern your use of ${serviceName}: the browser extension, this website, and the free web tools. Please read them before using the service.`,
    updatedLabel: 'Last updated',
    updatedAt: 'August 31, 2026',
    updatedAtISO: termsLastUpdatedISO,
    summary: 'Acceptable use, user responsibility for collected data, purchases, disclaimers, and how to contact us.',
    helpTitle: 'Questions about these Terms?',
    glance: [
      {
        section: 'publicly-available-data',
        icon: 'eye',
        tone: 'ok',
        title: 'Public data only',
        text: 'The service works only with information publicly shown on the pages you browse.'
      },
      {
        section: 'your-responsibility',
        icon: 'user',
        tone: 'pin',
        title: 'Your use, your responsibility',
        text: 'You decide what to collect and how to use it — within the laws that apply to you.'
      },
      {
        section: 'accounts-and-quotas',
        icon: 'key',
        title: 'No account needed to start',
        text: 'The extension works without an account within a free monthly quota.'
      },
      {
        section: 'purchases-and-subscriptions',
        icon: 'refresh',
        title: 'Cancel anytime',
        text: 'Subscriptions renew until canceled; cancellation stops future renewals.'
      }
    ],
    sections: [
      {
        id: 'acceptance-of-terms',
        title: 'Acceptance of terms',
        paragraphs: [
          `By accessing or using ${serviceName}, you agree to these Terms. If you do not agree with them, do not install the extension or use the website and tools.`
        ]
      },
      {
        id: 'what-the-service-does',
        title: 'What the service does',
        paragraphs: [
          `${serviceName} helps you collect information that is publicly displayed on Google Maps pages you visit — business details, reviews, photos, and related contact information — and export it. The service consists of a browser extension for Microsoft Edge and Firefox, this website, and free web tools that run in your browser.`
        ]
      },
      {
        id: 'publicly-available-data',
        title: 'Publicly available data',
        paragraphs: [
          'The service is designed to work only with information that is publicly shown on the pages you browse. It does not access private accounts, gated content, or data that requires special access beyond what any visitor can see.'
        ]
      },
      {
        id: 'your-responsibility',
        title: 'Your responsibility',
        paragraphs: [
          'You decide what to collect and how to use it, and you are responsible for that use. When you use collected information, comply with the laws that apply to you and to your purpose.',
          'In particular, you agree not to:'
        ],
        items: [
          'Use the service for any unlawful activity or in violation of third-party rights.',
          'Re-identify individuals or build profiles of private persons from collected business data.',
          'Use collected contact details for spam or unsolicited bulk messaging.',
          'Resell raw collected data as a competing data product without a separate agreement with us.',
          'Interfere with, overload, or attempt to disrupt the service or the platforms it works with.'
        ],
        prohibitions: true
      },
      {
        id: 'accounts-and-quotas',
        title: 'Accounts and quotas',
        paragraphs: [
          'The extension works without an account within a free monthly quota. Some features — higher limits, purchases, cloud integrations — require an account. You are responsible for keeping your account credentials secure and for activity that happens under your account.'
        ]
      },
      {
        id: 'purchases-and-subscriptions',
        title: 'Purchases and subscriptions',
        paragraphs: [
          'Paid plans are described on the Pricing page. Prices, quotas, and billing periods are shown before you buy, and purchases are handled through the payment providers offered at checkout. Subscription plans renew automatically until canceled, and you can cancel at any time; cancellation stops future renewals.'
        ]
      },
      {
        id: 'the-service-is-provided-as-is',
        title: 'The service is provided as is',
        paragraphs: [
          `The service is provided "as is" and "as available". Platforms change frequently, and collection features can stop working partially or entirely at any time. ${serviceName} makes no warranties, express or implied, about uninterrupted availability, completeness of collected data, or fitness for a particular purpose.`,
          'We may change, suspend, or discontinue any part of the service, and we may update these Terms. When the changes are material, we will announce them on this website. Continued use after changes take effect means you accept the updated Terms.'
        ]
      },
      {
        id: 'limitation-of-liability',
        title: 'Limitation of liability',
        paragraphs: [
          `To the maximum extent permitted by law, ${serviceName} and its operators are not liable for indirect, incidental, special, or consequential damages — including lost profits or data — arising from your use of or inability to use the service.`
        ]
      },
      {
        id: 'contact',
        title: 'Contact',
        paragraphs: [
          `Questions about these Terms can be sent to ${supportEmail}.`
        ]
      }
    ],
    coverage: {
      label: 'Coverage note',
      badge: 'TBD',
      lead: 'Not covered yet:',
      text: 'the Online Scraper (cloud runs), the Scraper / Reviews / Photos API and the MCP server. The text above describes the extension, this website and the free web tools.'
    }
  },
  privacy: {
    navLabel: 'Privacy',
    seoTitle: `Privacy Policy | ${serviceName}`,
    seoDescription:
      'The MapsGrab Privacy Policy: what data the extension and website process, where it is stored, what our backend is used for, and the boundaries we follow.',
    title: 'Privacy Policy',
    intro: `This policy explains what data ${serviceName} handles, where it is stored, and what reaches our servers. The short version: the extension works on publicly displayed data and keeps results in your browser; apart from our cloud services, our backend only powers configuration, quotas, optional enrichment, and minimal usage logs; and we run no ads and no third-party trackers in the extension. Requests to our cloud services — the Online Scraper, the API and the MCP server — are processed on our servers, and Online Scraper results are linked to your account so you can download them.`,
    updatedLabel: 'Last updated',
    updatedAt: 'October 16, 2026',
    updatedAtISO: privacyLastUpdatedISO,
    summary: 'What data the extension and website process, where it is stored, what our backend is used for, and the boundaries we follow.',
    helpTitle: 'Questions about this policy?',
    glance: [
      {
        section: 'where-data-is-stored',
        icon: 'lock',
        tone: 'ok',
        title: 'Where results are stored',
        text: 'The extension and the free web tools keep your data in your browser; Online Scraper results are linked to your account.'
      },
      {
        section: 'what-our-backend-processes',
        icon: 'database',
        title: 'What reaches our servers',
        text: 'Requests to the Online Scraper, API and MCP server, plus configuration, account and quotas, optional enrichment and minimal usage logs.'
      },
      {
        section: 'what-we-never-do',
        icon: 'shield',
        tone: 'pin',
        title: 'No ads, no trackers',
        text: 'No third-party trackers in the extension, and no selling or renting of personal data.'
      },
      {
        section: 'data-removal',
        icon: 'x',
        title: 'Data removal',
        text: 'Removing the extension deletes local data; email us to delete backend account data.'
      }
    ],
    sections: [
      {
        id: 'data-the-extension-processes',
        title: 'Data the extension processes',
        paragraphs: ['The extension handles the following categories of data:'],
        items: [
          'Public business data — information displayed on the Google Maps pages you visit (name, address, phone, website, rating, reviews, photos, etc.) while you use the extraction features.',
          'Your settings — preferences you configure (export format, field selection, automation switches, interface language).',
          'Technical and interaction data — minimal usage events (feature usage counters, error messages) used to keep the extension working against Google page changes.',
          'Account identifiers we issue — an anonymous device identifier and, if you sign in, your account email and plan or quota status.'
        ]
      },
      {
        id: 'where-data-is-stored',
        title: 'Where data is stored',
        paragraphs: [
          'With the extension, settings, extraction results, and batch task state are stored locally in your browser (extension local storage and IndexedDB). They never leave your device unless you trigger an export or one of the optional integrations described below. The free web tools also process what you enter in your browser.',
          'Google Drive and HubSpot OAuth tokens, if you connect them, are also stored only in your browser.',
          'Online Scraper tasks run on our servers. Their results are stored with your account so you can download them from your Dashboard.'
        ]
      },
      {
        id: 'what-our-backend-processes',
        title: 'What our backend processes',
        paragraphs: [
          'Requests you make to our cloud services — the Online Scraper, the API and the MCP server — are processed on our servers. Our servers also manage access to these services, including your API key and the MCP client authorizations you approve, and keep records of your usage.',
          'An MCP client you authorize receives the results of the requests it makes. You can revoke an authorization from your Dashboard.',
          'Apart from these cloud services, the extension and this website contact our own servers for four purposes:'
        ],
        items: [
          'Remote configuration — page-structure presets that keep extraction working when Google changes its pages.',
          'Account and quota services — sign-in, plan status, and monthly usage accounting.',
          'Email and social media enrichment — looking up publicly listed contact details on collected business websites when the feature is used.',
          'Usage logging — minimal records of feature usage and errors used to maintain and improve the service.'
        ]
      },
      {
        id: 'optional-google-drive-and-hubspot-integrations',
        title: 'Optional Google Drive and HubSpot integrations',
        paragraphs: [
          'Only if you explicitly connect them in settings, exported data is uploaded to your own Google Drive or synced to your own HubSpot account. These integrations use your authorization, act on your behalf, and can be revoked at any time from the extension settings or from your Google / HubSpot account.'
        ]
      },
      {
        id: 'website-analytics',
        title: 'Website analytics',
        paragraphs: [
          'This website uses Google Analytics 4 (GA4) to measure aggregate page usage. GA4 is the only third-party analytics we use, and it runs on this website only — the extension itself contains no analytics.'
        ]
      },
      {
        id: 'what-we-never-do',
        title: 'What we never do',
        paragraphs: ['These boundaries hold across the extension and the website:'],
        items: [
          'No ads.',
          'No third-party trackers in the extension.',
          'No selling or renting of personal data.',
          'No collection of your browsing history beyond the Google Maps pages you extract from.'
        ],
        prohibitions: true
      },
      {
        id: 'data-removal',
        title: 'Data removal',
        paragraphs: [
          `Removing the extension deletes all locally stored data. If you want your backend account data deleted, contact us at ${supportEmail} and we will remove it.`
        ]
      },
      {
        id: 'changes-to-this-policy',
        title: 'Changes to this policy',
        paragraphs: [
          'We update this policy when the service changes. The date above reflects the latest revision, and material changes will be announced on this website.'
        ]
      },
      {
        id: 'contact',
        title: 'Contact',
        paragraphs: [
          `Questions or requests about privacy can be sent to ${supportEmail}.`
        ]
      }
    ]
  }
}

const legalContentByLocale: Partial<Record<Locale, LegalContent>> = {
  'en-US': englishLegalContent
}

/** 返回指定 locale 的法务文案，缺失时回退英文。 */
export function getLegalContent(locale: Locale): LegalContent {
  return legalContentByLocale[locale] ?? englishLegalContent
}
