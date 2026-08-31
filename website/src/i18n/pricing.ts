import type { PricingPageContent } from './schema'

/**
 * Pricing 页面文案（en-US 基线，W5）。
 *
 * 三档套餐（C2 裁决口径）：Free 1,000 / Pro $39 100,000 / Business $99 500,000
 * records/月；Online / API 为占位卡，不可购（点击无效）。卡面价格为营销展示
 * 事实，真实扣价以下单时的支付配置为准。
 */
export const pricingContent: PricingPageContent = {
  seo: {
    title: 'Pricing — MapsGrab Extension Plans | MapsGrab',
    description:
      'MapsGrab extension plans: Free with 1,000 records per month, Pro at $39 with 100,000 records, Business at $99 with 500,000 records. Monthly billing, cancel anytime from your payment provider.'
  },
  hero: {
    eyebrow: 'Pricing',
    title: 'Plans that scale with your maps workflow',
    description:
      'Every MapsGrab plan runs the full 36-column extraction engine. Pick the monthly record volume that fits — upgrade or buy from this page in minutes.'
  },
  popularLabel: 'Most Popular',
  account: {
    loading: 'Checking your account...',
    signedOutTitle: 'Buying for your browser? Sign in first.',
    signedOutDescription: 'Plans are linked to your MapsGrab account and apply to the extension quota.',
    signInCta: 'Sign in',
    planLabel: 'Plan',
    noExpiry: 'No expiry',
    freePlan: 'Free',
    loadFailed: 'Failed to load your account. Retry from the sign-in button.'
  },
  cancellationGuide: {
    buttonLabel: 'How to cancel',
    title: 'How to cancel your subscription',
    paths: [
      {
        provider: 'PayPal',
        steps: [
          'Sign in to PayPal and open Settings.',
          'Go to Payments, then Automatic Payments.',
          'Select MapsGrab and choose Cancel.'
        ]
      }
    ],
    closeLabel: 'Close'
  },
  plans: {
    eyebrow: 'Extension plans',
    title: 'One extension, three record volumes',
    description:
      'Records are the businesses you extract. Every plan includes reviews, photos, email and social enrichment, and batch tasks — the ceiling is the only thing that changes.',
    cards: [
      {
        id: 'free',
        name: 'Free',
        tagline: 'Everything the extension does, on a small scale',
        price: '$0',
        periodLabel: 'forever',
        quota: '1,000 records / month',
        features: [
          'Full 36-column business extraction',
          'Reviews (11 columns) and photo URLs',
          'Email & social media enrichment',
          'Batch keyword and review-URL tasks',
          'CSV / JSON export with field selection'
        ],
        ctaLabel: 'Install the extension',
        status: 'free'
      },
      {
        id: 'pro',
        name: 'Pro',
        tagline: 'For freelancers and growing lead pipelines',
        price: '$39',
        periodLabel: 'per month',
        quota: '100,000 records / month',
        features: [
          'Everything in Free',
          '100,000 records every month',
          'Priority email & social enrichment',
          'Deduplication across runs by Place ID',
          'Optional Google Drive & HubSpot delivery'
        ],
        ctaLabel: 'Get Pro',
        status: 'buyable'
      },
      {
        id: 'business',
        name: 'Business',
        tagline: 'For agencies and data-heavy teams',
        price: '$99',
        periodLabel: 'per month',
        quota: '500,000 records / month',
        features: [
          'Everything in Pro',
          '500,000 records every month',
          'Room for multi-market batch tasks',
          'Highest enrichment throughput',
          'Same local-first export pipeline'
        ],
        ctaLabel: 'Get Business',
        status: 'buyable'
      }
    ],
    quotaNote:
      'A record is one business row extracted from Google Maps. Monthly usage resets on the 1st; unused records do not roll over.',
    loading: 'Loading payment options...',
    loadFailed: 'Failed to load payment options. Refresh the page to retry.',
    noChannels: 'No payment method is available for this plan right now.',
    alreadyActive: 'You already have an active plan on this account. It must expire before you can buy another one.'
  },
  checkout: {
    usageNotice: 'Applies to the MapsGrab browser extension monthly quota.',
    successTitle: 'Plan activated',
    successDescription: 'Your plan quota is live. The extension picks it up on the next quota refresh.',
    failedTitle: 'Payment incomplete',
    productTitlePrefix: 'MapsGrab'
  },
  comingSoon: {
    eyebrow: 'Also on the roadmap',
    title: 'Online and API are coming soon',
    description:
      'The same data engine without the browser. Online and API plans are announced here first — the extension plans above are available today.',
    comingSoonLabel: 'Coming soon',
    items: [
      {
        id: 'online',
        name: 'Online Scraper',
        tagline: 'Cloud runs without installing anything',
        description:
          'Paste keywords, get results — the hosted version of the MapsGrab engine, running on our infrastructure. Pricing is announced with the launch.'
      },
      {
        id: 'api',
        name: 'MapsGrab API',
        tagline: 'Programmatic access to the same data',
        description:
          'Query business data, reviews, and photos from your own applications with a simple HTTP API. Pricing is announced with the launch.'
      }
    ]
  },
  faq: {
    title: 'Questions before you buy?',
    description: 'The billing basics. Anything else, support is one email away.',
    items: [
      {
        question: 'What counts as a record?',
        answer:
          'A record is one business row extracted from Google Maps with the MapsGrab extension — the same unit the free plan counts. Reviews, photos, and enrichment attached to that business do not count as extra records.'
      },
      {
        question: 'Do I need the paid plan to try MapsGrab?',
        answer:
          'No. The Free tier includes 1,000 records per month with the full feature set — no credit card and no time limit. Pro and Business simply raise the monthly ceiling to 100,000 and 500,000 records.'
      },
      {
        question: 'How does the quota apply to my account?',
        answer:
          'Quota is counted per signed-in account (and per browser device when you are not signed in). Sign in to the extension with the account that owns the plan so the higher ceiling applies. When a plan expires, the account automatically returns to the Free 1,000 records per month.'
      },
      {
        question: 'Can I switch between Pro and Business?',
        answer:
          'Each plan runs as a monthly subscription. To change tiers, let the current plan expire at the end of its paid month and buy the other tier — your collected data is never affected.'
      },
      {
        question: 'How do payments and cancellations work?',
        answer:
          'Plans are billed monthly through PayPal and renewed automatically. You can cancel from your PayPal account at any time — the cancellation guide in your account area shows the exact steps. Your plan stays active until the end of the paid month.'
      },
      {
        question: 'When can I buy Online and API plans?',
        answer:
          'Online Scraper and API plans are in development and not purchasable yet. The cards on this page are placeholders — pricing appears here when the products launch.'
      }
    ]
  }
}
