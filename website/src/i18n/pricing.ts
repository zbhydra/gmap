import type { PricingPageContent } from './schema'

/**
 * Pricing 页面文案（en-US 基线，三产品线 tab 版）。
 *
 * Online（maps_online）/ Extension（maps）/ API（maps_api）三条产品线各一个
 * tab；卡面价格为营销展示事实，真实扣价以下单时的支付配置为准。Online / API
 * 付费档为 30 天一次性 PayPal 支付（不自动续费），Extension 档保持按月订阅口径。
 */
export const pricingContent: PricingPageContent = {
  seo: {
    title: 'Pricing — Online, Extension and API Plans | MapsGrab',
    description:
      'MapsGrab plans for every surface: Online Scraper from $19, browser Extension from $39, and API from $15. Free tiers included with every product — pay once for 30 days, no auto-renewal on Online and API.'
  },
  hero: {
    eyebrow: 'Pricing',
    title: 'One data engine, three ways to buy it',
    description:
      'Pick the surface that fits your workflow — cloud Online Scraper, browser Extension, or HTTP API — then pick the monthly volume. Upgrade or buy from this page in minutes.'
  },
  popularLabel: 'Most Popular',
  account: {
    loading: 'Checking your account...',
    signedOutTitle: 'Buying a plan? Sign in first.',
    signedOutDescription:
      'Plans are linked to your MapsGrab account and apply to the product line you buy.',
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
  tabLabels: {
    online: 'Online',
    extension: 'Extension',
    api: 'API'
  },
  tabs: {
    online: {
      eyebrow: 'Online Scraper plans',
      title: 'Cloud extraction, priced by records',
      description:
        'Run the MapsGrab engine on our infrastructure. A record is one business row collected — reviews, photos and enrichment attached to it are always included.',
      cards: [
        {
          id: 'free',
          productId: null,
          name: 'Free',
          tagline: 'Try the cloud scraper on a small scale',
          price: '$0',
          periodLabel: 'forever',
          quota: '1,000 records / month',
          features: [
            'Full 36-column business extraction',
            'Reviews (11 columns) and photo URLs',
            'Email & social media enrichment',
            'Keyword and review-URL tasks',
            'CSV / JSON download'
          ],
          ctaLabel: 'Start free',
          status: 'free',
          featured: false
        },
        {
          id: 'lite',
          productId: 'online_lite',
          name: 'Lite',
          tagline: 'For occasional one-off exports',
          price: '$19',
          periodLabel: 'one-time · 30 days',
          quota: '20,000 records / month',
          features: [
            'Everything in Free',
            '20,000 records for 30 days',
            'One-time payment — no auto-renewal',
            'Priority email & social enrichment',
            'CSV / JSON download'
          ],
          ctaLabel: 'Get Lite',
          status: 'buyable',
          featured: false
        },
        {
          id: 'basic',
          productId: 'online_basic',
          name: 'Basic',
          tagline: 'For steady weekly lead collection',
          price: '$49',
          periodLabel: 'one-time · 30 days',
          quota: '80,000 records / month',
          features: [
            'Everything in Lite',
            '80,000 records for 30 days',
            'One-time payment — no auto-renewal',
            'Deduplication across runs by Place ID',
            'CSV / JSON download'
          ],
          ctaLabel: 'Get Basic',
          status: 'buyable',
          featured: true
        },
        {
          id: 'growth',
          productId: 'online_growth',
          name: 'Growth',
          tagline: 'For growing lead pipelines',
          price: '$99',
          periodLabel: 'one-time · 30 days',
          quota: '250,000 records / month',
          features: [
            'Everything in Basic',
            '250,000 records for 30 days',
            'One-time payment — no auto-renewal',
            'Room for large batch tasks',
            'CSV / JSON download'
          ],
          ctaLabel: 'Get Growth',
          status: 'buyable',
          featured: false
        },
        {
          id: 'professional',
          productId: 'online_pro',
          name: 'Professional',
          tagline: 'For agencies and data-heavy teams',
          price: '$149',
          periodLabel: 'one-time · 30 days',
          quota: '500,000 records / month',
          features: [
            'Everything in Growth',
            '500,000 records for 30 days',
            'One-time payment — no auto-renewal',
            'Highest enrichment throughput',
            'CSV / JSON download'
          ],
          ctaLabel: 'Get Professional',
          status: 'buyable',
          featured: false
        }
      ],
      quotaNote:
        'One-time payment covering 30 days — plans on this tab do not auto-renew. A record is one business row collected from Google Maps; usage resets on the 1st and unused records do not roll over.',
      checkout: {
        usageNotice: 'Applies to the MapsGrab Online Scraper monthly record quota.',
        successTitle: 'Plan activated',
        successDescription:
          'Your one-time 30-day plan is live. The Online Scraper picks it up on the next quota refresh.'
      }
    },
    extension: {
      eyebrow: 'Extension plans',
      title: 'One extension, three record volumes',
      description:
        'Records are the businesses you extract. Every plan includes reviews, photos, email and social enrichment, and batch tasks — the ceiling is the only thing that changes.',
      cards: [
        {
          id: 'free',
          productId: null,
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
          status: 'free',
          featured: false
        },
        {
          id: 'pro',
          productId: 'maps_extension_pro',
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
          status: 'buyable',
          featured: true
        },
        {
          id: 'business',
          productId: 'maps_extension_business',
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
          status: 'buyable',
          featured: false
        }
      ],
      quotaNote:
        'A record is one business row extracted from Google Maps. Monthly usage resets on the 1st; unused records do not roll over.',
      checkout: {
        usageNotice: 'Applies to the MapsGrab browser extension monthly quota.',
        successTitle: 'Plan activated',
        successDescription:
          'Your plan quota is live. The extension picks it up on the next quota refresh.'
      }
    },
    api: {
      eyebrow: 'API plans',
      title: 'Programmatic access, priced by requests',
      description:
        'Query business data, reviews and photos from your own applications over a simple HTTP API. A request is one successful API call that returns data.',
      cards: [
        {
          id: 'free',
          productId: null,
          name: 'Free',
          tagline: 'Evaluate the API on a small scale',
          price: '$0',
          periodLabel: 'forever',
          quota: '20 requests / month',
          features: [
            'Business search and Place ID lookup',
            'Reviews and photo endpoints',
            'JSON responses',
            'API key tied to your account',
            'Community support'
          ],
          ctaLabel: 'Start free',
          status: 'free',
          featured: false
        },
        {
          id: 'basic',
          productId: 'api_basic',
          name: 'Basic',
          tagline: 'For prototypes and light integrations',
          price: '$15',
          periodLabel: 'one-time · 30 days',
          quota: '1,000 requests / month',
          features: [
            'Everything in Free',
            '1,000 requests for 30 days',
            'One-time payment — no auto-renewal',
            'All data endpoints unlocked',
            'JSON responses'
          ],
          ctaLabel: 'Get Basic',
          status: 'buyable',
          featured: false
        },
        {
          id: 'professional',
          productId: 'api_professional',
          name: 'Professional',
          tagline: 'For production integrations',
          price: '$65',
          periodLabel: 'one-time · 30 days',
          quota: '5,000 requests / month',
          features: [
            'Everything in Basic',
            '5,000 requests for 30 days',
            'One-time payment — no auto-renewal',
            'Higher rate limits',
            'JSON responses'
          ],
          ctaLabel: 'Get Professional',
          status: 'buyable',
          featured: true
        },
        {
          id: 'business',
          productId: 'api_business',
          name: 'Business',
          tagline: 'For products built on MapsGrab data',
          price: '$115',
          periodLabel: 'one-time · 30 days',
          quota: '10,000 requests / month',
          features: [
            'Everything in Professional',
            '10,000 requests for 30 days',
            'One-time payment — no auto-renewal',
            'Higher rate limits',
            'JSON responses'
          ],
          ctaLabel: 'Get Business',
          status: 'buyable',
          featured: false
        },
        {
          id: 'scale',
          productId: 'api_scale',
          name: 'Scale',
          tagline: 'For high-volume data operations',
          price: '$365',
          periodLabel: 'one-time · 30 days',
          quota: '50,000 requests / month',
          features: [
            'Everything in Business',
            '50,000 requests for 30 days',
            'One-time payment — no auto-renewal',
            'Highest rate limits',
            'JSON responses'
          ],
          ctaLabel: 'Get Scale',
          status: 'buyable',
          featured: false
        }
      ],
      quotaNote:
        'One-time payment covering 30 days — plans on this tab do not auto-renew. A request is one successful API call that returns data; usage resets on the 1st and unused requests do not roll over.',
      checkout: {
        usageNotice: 'Applies to the MapsGrab API monthly request quota.',
        successTitle: 'Plan activated',
        successDescription:
          'Your one-time 30-day plan is live. Your API key picks up the new quota on the next request.'
      }
    }
  },
  plans: {
    loading: 'Loading payment options...',
    loadFailed: 'Failed to load payment options. Refresh the page to retry.',
    noChannels: 'No payment method is available for this plan right now.',
    alreadyActive:
      'You already have an active plan on this product line. It must expire before you can buy another one.',
    productTitlePrefix: 'MapsGrab',
    failedTitle: 'Payment incomplete'
  },
  faq: {
    title: 'Questions before you buy?',
    description: 'The billing basics. Anything else, support is one email away.',
    items: [
      {
        question: 'What counts as a record?',
        answer:
          'A record is one business row collected from Google Maps — the same unit the free plans count. Reviews, photos, and enrichment attached to that business do not count as extra records. On the API tab, usage is counted in successful requests instead.'
      },
      {
        question: 'Do I need a paid plan to try MapsGrab?',
        answer:
          'No. Every product has a free tier — the Online Scraper and the extension include 1,000 records per month and the API includes 20 requests per month, with the full feature set and no time limit. Paid plans simply raise the ceiling.'
      },
      {
        question: 'How does the quota apply to my account?',
        answer:
          'Quota is counted per signed-in account (and per browser device for the extension when you are not signed in). Sign in with the account that owns the plan so the higher ceiling applies. When a plan expires, the account automatically returns to the free tier.'
      },
      {
        question: 'Are payments one-time or subscriptions?',
        answer:
          'Online and API plans are one-time payments through PayPal covering 30 days — they never auto-renew. Extension Pro and Business are billed monthly as subscriptions; you can cancel from your PayPal account at any time using the guide in your account area.'
      },
      {
        question: 'Can I switch between tiers?',
        answer:
          'Yes. Let your current plan run out (or expire at the end of its paid month on the extension) and buy a different tier — your collected data is never affected. Plans on different tabs are independent, so you can hold an Online plan and an API plan at the same time.'
      }
    ]
  }
}
