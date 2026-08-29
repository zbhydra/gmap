/**
 * Legal page copy for TG Downloader website.
 *
 * Legal text is kept in one module so every locale route can render the same
 * reviewed fallback until each translation is explicitly approved.
 */
import type { Locale } from '../i18n/ui'
import { DEVELOPER_EMAIL } from '../lib/contact'

/** Legal page route identifiers. */
export type LegalPageKind = 'terms' | 'privacy'

/** One section in a legal document. */
export interface LegalSection {
  /** Visible H2 heading. */
  title: string
  /** Body paragraphs under this heading. */
  paragraphs: string[]
  /** Optional bullet list for obligations, examples, or user rights. */
  items?: string[]
}

/** Copy needed to render one legal page. */
export interface LegalPageContent {
  /** Footer and small-label text. */
  navLabel: string
  /** HTML title. */
  seoTitle: string
  /** Meta description. */
  seoDescription: string
  /** Page H1. */
  title: string
  /** Short summary below the H1. */
  intro: string
  /** Label shown before updatedAt. */
  updatedLabel: string
  /** Human-readable last-updated date. */
  updatedAt: string
  /** Document sections. */
  sections: LegalSection[]
}

/** Terms and privacy copy for one locale. */
interface LegalContent {
  /** Terms of Service page copy. */
  terms: LegalPageContent
  /** Privacy Policy page copy. */
  privacy: LegalPageContent
}

const termsLastUpdated = 'July 5, 2026'
const privacyLastUpdated = 'August 7, 2026'
const serviceName = 'TG Downloader'

const englishLegalContent: LegalContent = {
  terms: {
    navLabel: 'Terms',
    seoTitle: `Terms of Service | ${serviceName}`,
    seoDescription:
      'Read the TG Downloader Terms of Service, including acceptable use, account access, downloads, subscriptions, disclaimers, and contact details.',
    title: 'Terms of Service',
    intro:
      'These terms explain how you may use TG Downloader, including the website, browser extension, download tools, account features, and subscription-related workflows.',
    updatedLabel: 'Last updated',
    updatedAt: termsLastUpdated,
    sections: [
      {
        title: 'Acceptance',
        paragraphs: [
          `By accessing or using ${serviceName}, you agree to these Terms. If you do not agree, do not use the service.`,
          'These Terms apply to the website, extension, download workflows, account features, support communications, and any related services we operate.'
        ]
      },
      {
        title: 'What the service does',
        paragraphs: [
          `${serviceName} helps users save media that is already accessible to them in supported browsers and supported platforms. The service does not grant membership to private channels, recover content you cannot access, or provide rights to redistribute third-party content.`,
          'Some features may run locally in your browser extension, while website parsing, account, quota, and subscription features may communicate with our backend services.'
        ]
      },
      {
        title: 'Acceptable use',
        paragraphs: [
          'You are responsible for how you use downloaded or saved content. Use the service only for content you own, have permission to keep, or are otherwise legally allowed to use.'
        ],
        items: [
          'Do not use the service to infringe copyright, privacy rights, publicity rights, or other rights of another person.',
          'Do not use the service to bypass membership, authentication, payment, technical access controls, or platform restrictions you are not allowed to bypass.',
          'Do not upload, distribute, sell, or repost content unless you have the necessary rights.',
          'Do not use the service for malware, phishing, spam, surveillance, scraping unrelated to the visible user-facing feature, or illegal activity.'
        ]
      },
      {
        title: 'Accounts and access',
        paragraphs: [
          'Some website features may require signing in with Google or email. You must provide accurate information and keep your account access secure.',
          'We may limit, suspend, or terminate access if we believe the service is being abused, used illegally, or used in a way that creates risk for users, platforms, or our systems.'
        ]
      },
      {
        title: 'Paid features, Credits, and subscriptions',
        paragraphs: [
          'Paid or upgraded features, if available, may include quotas, limits, billing periods, or manual activation steps shown on the pricing page or in direct support messages.',
          'Credits and subscriptions are separate products with separate usage scopes. Credits may be used only for website download features, while paid subscriptions apply only to supported desktop browser extension download features. A subscription does not include website download Credits, and Credits do not extend or replace subscription benefits.',
          'Credits are one-time purchases for website download features. Purchased Credits are added to the purchasing account after payment is confirmed, do not auto-renew, do not expire, and are not refundable, transferable, or redeemable for cash.',
          'Subscription payments are final and non-refundable. You may turn off auto-renewal at any time through the original payment provider or by contacting support before the next renewal. Once auto-renewal is turned off, no future renewal charge will be made, and your paid subscription remains available until the end of the current billing period.'
        ]
      },
      {
        title: 'Third-party platforms',
        paragraphs: [
          `${serviceName} is not affiliated with Telegram, TikTok, Instagram, Threads, X, Vimeo, Google, or any other supported third-party platform unless explicitly stated.`,
          'Your use of third-party platforms remains subject to their own terms, policies, copyright rules, account rules, and technical limitations.'
        ]
      },
      {
        title: 'No legal advice',
        paragraphs: [
          'The service and these Terms do not provide legal advice. Whether you may save, copy, or share specific content depends on permission, platform rules, copyright law, privacy law, and local law.'
        ]
      },
      {
        title: 'Disclaimers',
        paragraphs: [
          'The service is provided on an "as is" and "as available" basis. We do not promise that every link, file, platform, browser version, private channel, or restricted media item will work.',
          'We may change, pause, remove, or limit features when needed for reliability, security, compliance, abuse prevention, or platform changes.'
        ]
      },
      {
        title: 'Changes to these Terms',
        paragraphs: [
          'We may update these Terms as the product, law, or platform policies change. The updated date above shows when this page last changed.',
          'Continuing to use the service after changes means you accept the updated Terms.'
        ]
      },
      {
        title: 'Contact',
        paragraphs: [
          `Questions about these Terms can be sent to ${DEVELOPER_EMAIL}.`
        ]
      }
    ]
  },
  privacy: {
    navLabel: 'Privacy Policy',
    seoTitle: `Privacy Policy | ${serviceName}`,
    seoDescription:
      'Read the TG Downloader Privacy Policy, including what data is collected, how Google sign-in data is used, analytics, storage, sharing, retention, and contact details.',
    title: 'Privacy Policy',
    intro:
      'This policy explains what information TG Downloader collects, why we use it, how it is stored or shared, and what choices you have.',
    updatedLabel: 'Last updated',
    updatedAt: privacyLastUpdated,
    sections: [
      {
        title: 'Information we process',
        paragraphs: [
          'Depending on how you use the service, we may process account information, authentication information, submitted links, download request metadata, quota usage, subscription status, support messages, device identifiers, browser storage values, logs, and analytics events.',
          'When you use the browser extension, media detection and download workflows are designed to run from the browser context needed for the user-facing feature. The extension should not ask for your Telegram password or Telegram API credentials.'
        ]
      },
      {
        title: 'Google sign-in data',
        paragraphs: [
          'If you sign in with Google, we use the basic identity information Google provides, such as your email address and profile identity, to create or access your TG Downloader account.',
          'The use and transfer of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.'
        ]
      },
      {
        title: 'How we use information',
        paragraphs: [
          'We use information to operate the service, authenticate users, enforce quotas, provide downloads and playback workflows, prevent abuse, improve reliability, answer support requests, maintain security, and comply with legal obligations.'
        ],
        items: [
          'We do not sell personal information.',
          'We do not use user data for personalized advertising.',
          'We do not ask for Telegram passwords or Telegram API credentials.',
          'We use data only for disclosed service, security, analytics, support, and compliance purposes.'
        ]
      },
      {
        title: 'Analytics',
        paragraphs: [
          'The website may use analytics tools, including Google Analytics and Microsoft Clarity, to understand page usage, navigation, interactions, session replays, conversion, and product reliability. Analytics data is not used to sell user data or build personalized advertising profiles for TG Downloader.'
        ]
      },
      {
        title: 'Storage and security',
        paragraphs: [
          'Account tokens, device identifiers, quota state, and UI state may be stored in browser storage or on our backend systems when needed to keep the product working.',
          'We use reasonable technical and organizational safeguards, including HTTPS for supported network communications. No system can be guaranteed to be completely secure.'
        ]
      },
      {
        title: 'Sharing',
        paragraphs: [
          'We share information only when needed to operate or improve the service, provide infrastructure, process authentication, run analytics, respond to support, prevent abuse, comply with law, or complete a business transfer such as a merger or asset sale.',
          'Third-party services may process data under their own terms and privacy policies.'
        ]
      },
      {
        title: 'Retention',
        paragraphs: [
          'We keep information only as long as reasonably needed for the purposes described in this policy, including account operation, security, abuse prevention, legal obligations, accounting, and dispute resolution.',
          'Local browser data may remain on your device until you clear it, uninstall the extension, sign out, or reset browser storage.'
        ]
      },
      {
        title: 'Your choices',
        paragraphs: [
          'You can stop using the service, sign out, uninstall the extension, clear browser storage, or contact us about account or data requests.',
          `For privacy questions or account data requests, contact ${DEVELOPER_EMAIL}. We may need to verify your email address before acting on a request.`
        ]
      },
      {
        title: 'Children',
        paragraphs: [
          'The service is not intended for children under the age required by applicable law to use online services without parental consent. Do not use the service if you are not old enough to agree to this policy.'
        ]
      },
      {
        title: 'Changes to this policy',
        paragraphs: [
          'We may update this policy as the product, law, or platform policies change. The updated date above shows when this page last changed.'
        ]
      }
    ]
  }
}

const legalContentByLocale: Partial<Record<Locale, LegalContent>> = {
  'en-US': englishLegalContent
}

/** Returns reviewed legal copy for the requested locale, falling back to English. */
export function getLegalContent(locale: Locale): LegalContent {
  return legalContentByLocale[locale] ?? englishLegalContent
}

/** Returns one reviewed legal page for the requested locale, falling back to English. */
export function getLegalPageContent(locale: Locale, pageKind: LegalPageKind): LegalPageContent {
  return getLegalContent(locale)[pageKind]
}
