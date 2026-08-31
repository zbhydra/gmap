/**
 * 法务页文案（Terms / Privacy，en-US 基线）。
 *
 * 法务文本集中在本模块，保证各 locale 路由渲染同一份审校口径。
 * W3 正式版：事实口径与 extension/public/privacy.html（插件版隐私政策，2026-08-30）一致并扩写——
 * 公开商家数据采集、本地 storage、自有后端四类用途（远程配置/账号配额/enrich/使用记录）、
 * 可选 Drive/HubSpot 用户授权、无广告无第三方追踪；GA4 为营销站唯一第三方分析豁免。
 */
import type { Locale } from '../i18n/ui'
import { DEVELOPER_EMAIL } from '../lib/contact'

/** 法务页路由标识。 */
export type LegalPageKind = 'terms' | 'privacy'

/** 法务文档中的一个区块。 */
export interface LegalSection {
  /** 可见 H2 标题。 */
  title: string
  /** 区块下的正文段落。 */
  paragraphs: string[]
  /** 可选的要点清单（义务、示例或用户权利）。 */
  items?: string[]
}

/** 渲染一个法务页所需的文案。 */
export interface LegalPageContent {
  /** 页脚与小标签文案。 */
  navLabel: string
  /** HTML title。 */
  seoTitle: string
  /** meta description。 */
  seoDescription: string
  /** 页面 H1。 */
  title: string
  /** H1 下方的简短摘要。 */
  intro: string
  /** updatedAt 前显示的标签。 */
  updatedLabel: string
  /** 可读的最后更新日期。 */
  updatedAt: string
  /** 最后更新日期的 ISO 形态（time datetime 与 JSON-LD dateModified 共用）。 */
  updatedAtISO: string
  /** 文档区块。 */
  sections: LegalSection[]
}

/** 单一 locale 的 Terms 与 Privacy 文案。 */
interface LegalContent {
  /** 服务条款页文案。 */
  terms: LegalPageContent
  /** 隐私政策页文案。 */
  privacy: LegalPageContent
}

const termsLastUpdatedISO = '2026-08-31'
const privacyLastUpdatedISO = '2026-08-31'
const serviceName = 'MapsGrab'
const supportEmail = DEVELOPER_EMAIL

/** en-US 正式法务文案（当前唯一 locale）。 */
const englishLegalContent: LegalContent = {
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
    sections: [
      {
        title: 'Acceptance of terms',
        paragraphs: [
          `By accessing or using ${serviceName}, you agree to these Terms. If you do not agree with them, do not install the extension or use the website and tools.`
        ]
      },
      {
        title: 'What the service does',
        paragraphs: [
          `${serviceName} helps you collect information that is publicly displayed on Google Maps pages you visit — business details, reviews, photos, and related contact information — and export it. The service consists of a browser extension for Microsoft Edge and Firefox, this website, and free web tools that run in your browser.`
        ]
      },
      {
        title: 'Publicly available data',
        paragraphs: [
          'The service is designed to work only with information that is publicly shown on the pages you browse. It does not access private accounts, gated content, or data that requires special access beyond what any visitor can see.'
        ]
      },
      {
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
        ]
      },
      {
        title: 'Accounts and quotas',
        paragraphs: [
          'The extension works without an account within a free monthly quota. Some features — higher limits, purchases, cloud integrations — require an account. You are responsible for keeping your account credentials secure and for activity that happens under your account.'
        ]
      },
      {
        title: 'Purchases and subscriptions',
        paragraphs: [
          'Paid plans are described on the Pricing page. Prices, quotas, and billing periods are shown before you buy, and purchases are handled through the payment providers offered at checkout. Subscription plans renew automatically until canceled, and you can cancel at any time; cancellation stops future renewals.'
        ]
      },
      {
        title: 'The service is provided as is',
        paragraphs: [
          `The service is provided "as is" and "as available". Platforms change frequently, and collection features can stop working partially or entirely at any time. ${serviceName} makes no warranties, express or implied, about uninterrupted availability, completeness of collected data, or fitness for a particular purpose.`,
          'We may change, suspend, or discontinue any part of the service, and we may update these Terms. When the changes are material, we will announce them on this website. Continued use after changes take effect means you accept the updated Terms.'
        ]
      },
      {
        title: 'Limitation of liability',
        paragraphs: [
          `To the maximum extent permitted by law, ${serviceName} and its operators are not liable for indirect, incidental, special, or consequential damages — including lost profits or data — arising from your use of or inability to use the service.`
        ]
      },
      {
        title: 'Contact',
        paragraphs: [
          `Questions about these Terms can be sent to ${supportEmail}.`
        ]
      }
    ]
  },
  privacy: {
    navLabel: 'Privacy',
    seoTitle: `Privacy Policy | ${serviceName}`,
    seoDescription:
      'The MapsGrab Privacy Policy: what data the extension and website process, where it is stored, what our backend is used for, and the boundaries we follow.',
    title: 'Privacy Policy',
    intro: `This policy explains what data ${serviceName} handles, where it is stored, and what reaches our servers. The short version: the extension works on publicly displayed data and keeps results in your browser, our backend only powers configuration, quotas, optional enrichment, and minimal usage logs, and we run no ads and no third-party trackers in the extension.`,
    updatedLabel: 'Last updated',
    updatedAt: 'August 31, 2026',
    updatedAtISO: privacyLastUpdatedISO,
    sections: [
      {
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
        title: 'Where data is stored',
        paragraphs: [
          'Settings, extraction results, and batch task state are stored locally in your browser (extension local storage and IndexedDB). They never leave your device unless you trigger an export or one of the optional integrations described below.',
          'Google Drive and HubSpot OAuth tokens, if you connect them, are also stored only in your browser.'
        ]
      },
      {
        title: 'What our backend processes',
        paragraphs: [
          'The extension and this website contact our own servers for four purposes:'
        ],
        items: [
          'Remote configuration — page-structure presets that keep extraction working when Google changes its pages.',
          'Account and quota services — sign-in, plan status, and monthly usage accounting.',
          'Email and social media enrichment — looking up publicly listed contact details on collected business websites when the feature is used.',
          'Usage logging — minimal records of feature usage and errors used to maintain and improve the service.'
        ]
      },
      {
        title: 'Optional Google Drive and HubSpot integrations',
        paragraphs: [
          'Only if you explicitly connect them in settings, exported data is uploaded to your own Google Drive or synced to your own HubSpot account. These integrations use your authorization, act on your behalf, and can be revoked at any time from the extension settings or from your Google / HubSpot account.'
        ]
      },
      {
        title: 'Website analytics',
        paragraphs: [
          'This website uses Google Analytics 4 (GA4) to measure aggregate page usage. GA4 is the only third-party analytics we use, and it runs on this website only — the extension itself contains no analytics.'
        ]
      },
      {
        title: 'What we never do',
        paragraphs: ['These boundaries hold across the extension and the website:'],
        items: [
          'No ads.',
          'No third-party trackers in the extension.',
          'No selling or renting of personal data.',
          'No collection of your browsing history beyond the Google Maps pages you extract from.'
        ]
      },
      {
        title: 'Data removal',
        paragraphs: [
          `Removing the extension deletes all locally stored data. If you want your backend account data deleted, contact us at ${supportEmail} and we will remove it.`
        ]
      },
      {
        title: 'Changes to this policy',
        paragraphs: [
          'We update this policy when the service changes. The date above reflects the latest revision, and material changes will be announced on this website.'
        ]
      },
      {
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

/** 返回指定 locale 的单个法务页，缺失时回退英文。 */
export function getLegalPageContent(locale: Locale, pageKind: LegalPageKind): LegalPageContent {
  return getLegalContent(locale)[pageKind]
}
