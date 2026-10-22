import type { PricingPageContent } from './schema'

/**
 * Pricing 页面文案（en-US 基线，三产品线 tab 版）。
 *
 * Online（maps_online）/ Extension（maps）/ API（maps_api）三条产品线各一个
 * tab；卡面价格为营销展示事实，真实扣价以下单时的支付配置为准。Online / API
 * 付费档按商品配置的计费模式购买，升级资格与补差以服务端报价为准。
 * Online 卖点按 014 合同（每任务关键词上限 Free 2 / Lite 5 / Basic 10 / Growth 20 / Pro 50、
 * 关键词 / 地图 / 地区模式、整任务去重的单份 37 列 CSV、付费档补全默认开启可关闭）。
 * 对比表行名逐字取自各档卖点，包含关系按卡面「Everything in X」继承展开。
 */
export const pricingContent: PricingPageContent = {
  seo: {
    title: 'Pricing — Online, Extension and API Plans | MapsGrab',
    description:
      'MapsGrab plans for every surface: Online Scraper from $19, browser Extension from $39, and API from $15. Free tiers included with every product — one-time natural-month plans on Online and API, monthly subscriptions on Extension.'
  },
  hero: {
    kicker: 'Pricing',
    title: { lead: 'Plans for ', accent: 'three ways', tail: ' to grab Maps data' },
    lead:
      'Pick the surface that fits your workflow — cloud Online Scraper, browser Extension, or HTTP API — then pick the monthly volume. Upgrade or buy from this page in minutes.',
    meta: ['Free tier on every product', 'Pay with PayPal', 'Upgrade by paying the difference'],
    switchLabel: 'Product line'
  },
  popularLabel: 'Most Popular',
  tabs: {
    online: {
      name: 'Online Scraper',
      shortName: 'Online',
      switchMeta: 'From {price} · one-time',
      unit: 'records',
      eyebrow: 'Online Scraper plans',
      title: 'Cloud extraction, priced by records',
      description:
        'Run the MapsGrab engine on our infrastructure. A record is one business row collected. Paid plans include optional email and social media enrichment at no extra record cost.',
      billingChips: ['One-time payment', 'Covers one natural month', 'No auto-renewal'],
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
            'Business extraction with 37-column CSV export',
            'Up to 2 keywords per task',
            'Map and region modes for area searches',
            'Email & social enrichment on paid plans',
            'One deduplicated CSV per task'
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
          periodLabel: 'one-time · 1 month',
          quota: '20,000 records / month',
          features: [
            'Everything in Free',
            '20,000 records for 1 month',
            'One-time payment — no auto-renewal',
            'Up to 5 keywords per task',
            'Email & social enrichment, on by default and optional'
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
          periodLabel: 'one-time · 1 month',
          quota: '80,000 records / month',
          features: [
            'Everything in Lite',
            '80,000 records for 1 month',
            'One-time payment — no auto-renewal',
            'Up to 10 keywords per task'
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
          periodLabel: 'one-time · 1 month',
          quota: '250,000 records / month',
          features: [
            'Everything in Basic',
            '250,000 records for 1 month',
            'One-time payment — no auto-renewal',
            'Up to 20 keywords per task'
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
          periodLabel: 'one-time · 1 month',
          quota: '500,000 records / month',
          features: [
            'Everything in Growth',
            '500,000 records for 1 month',
            'One-time payment — no auto-renewal',
            'Up to 50 keywords per task'
          ],
          ctaLabel: 'Get Professional',
          status: 'buyable',
          featured: false
        }
      ],
      quotaNote:
        'One-time payment covering one natural month — plans on this tab do not auto-renew. A record is one business row collected from Google Maps; usage resets on the 1st and unused records do not roll over.',
      compare: {
        lead: 'Online Scraper plans — cloud extraction, priced by records.',
        volume: 'Records per month',
        groups: [
          {
            label: 'Data',
            rows: [
              { label: 'Business extraction with 37-column CSV export', cells: [true, true, true, true, true] },
              {
                label: 'Email & social enrichment',
                cells: [
                  false,
                  'On by default, optional',
                  'On by default, optional',
                  'On by default, optional',
                  'On by default, optional'
                ]
              }
            ]
          },
          {
            label: 'Workflow',
            rows: [
              { label: 'Keywords per task', cells: ['2', '5', '10', '20', '50'] },
              { label: 'Map and region modes', cells: [true, true, true, true, true] },
              { label: 'One deduplicated CSV per task', cells: [true, true, true, true, true] }
            ]
          }
        ]
      },
      checkout: {
        usageNotice: 'Applies to the MapsGrab Online Scraper monthly record quota.',
        successTitle: 'Plan activated',
        successDescription:
          'Your one-time 1-month plan is live. The Online Scraper picks it up on the next quota refresh.'
      }
    },
    extension: {
      name: 'Extension',
      shortName: 'Extension',
      switchMeta: 'From {price} · one-time',
      unit: 'records',
      eyebrow: 'Extension plans',
      title: 'Browser extraction, priced by records',
      description:
        'Every row the extension collects — a business, a review or a photo — counts as one record. All plans include reviews, photos and batch tasks; paid plans export all 36 columns, including email and social enrichment.',
      billingChips: ['One-time payment', '1 month of access', 'No auto-renewal'],
      cards: [
        {
          id: 'free',
          productId: null,
          name: 'Free',
          tagline: 'Core extraction, on a small scale',
          price: '$0',
          periodLabel: 'forever',
          quota: '1,000 records / month',
          features: [
            'Business data extraction',
            'Reviews (11 columns) and photo URLs',
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
          periodLabel: 'one-time · 1 month',
          quota: '100,000 records / month',
          features: [
            'Everything in Free',
            '100,000 records every month',
            'Full 36-column business extraction',
            'Email & social media enrichment'
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
          periodLabel: 'one-time · 1 month',
          quota: '500,000 records / month',
          features: [
            'Everything in Pro',
            '500,000 records every month',
            'Room for multi-market batch tasks',
            'Same local-first export pipeline'
          ],
          ctaLabel: 'Get Business',
          status: 'buyable',
          featured: false
        }
      ],
      quotaNote:
        'Each row the extension collects counts as one record: a business from a search or saved list, a review, or a photo. Email and social enrichment does not add records. Monthly usage resets on the 1st; unused records do not roll over.',
      compare: {
        lead: 'Extension plans — browser extraction, priced by records.',
        volume: 'Records per month',
        groups: [
          {
            label: 'Data',
            rows: [
              { label: 'Business data extraction', cells: [true, true, true] },
              { label: 'Full 36-column business extraction', cells: [false, true, true] },
              { label: 'Reviews (11 columns) and photo URLs', cells: [true, true, true] },
              { label: 'Email & social media enrichment', cells: [false, true, true] },
              { label: 'Batch keyword and review-URL tasks', cells: [true, true, true] }
            ]
          },
          {
            label: 'Export',
            rows: [
              { label: 'CSV / JSON export with field selection', cells: [true, true, true] },
              { label: 'Local-first export pipeline', cells: [true, true, true] }
            ]
          }
        ]
      },
      checkout: {
        usageNotice: 'Applies to the MapsGrab browser extension monthly quota.',
        successTitle: 'Plan activated',
        successDescription:
          'Your one-time 1-month plan is live. The extension picks it up on the next quota refresh.'
      }
    },
    api: {
      name: 'API & MCP',
      shortName: 'API & MCP',
      switchMeta: 'From {price} · one-time',
      unit: 'requests',
      eyebrow: 'API plans',
      title: 'Programmatic access, priced by requests',
      description:
        'Search Google Maps businesses and fetch their reviews from your own applications over a simple HTTP API. Each successful call counts as one request, even when it returns no results or partial data.',
      billingChips: ['One-time payment', 'Covers one natural month', 'No auto-renewal'],
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
            'Business search by keyword and location',
            'Reviews endpoint with sorting and paging',
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
          periodLabel: 'one-time · 1 month',
          quota: '1,000 requests / month',
          features: [
            'Everything in Free',
            '1,000 requests for 1 month',
            'One-time payment — no auto-renewal',
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
          periodLabel: 'one-time · 1 month',
          quota: '5,000 requests / month',
          features: [
            'Everything in Basic',
            '5,000 requests for 1 month',
            'One-time payment — no auto-renewal',
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
          periodLabel: 'one-time · 1 month',
          quota: '10,000 requests / month',
          features: [
            'Everything in Professional',
            '10,000 requests for 1 month',
            'One-time payment — no auto-renewal',
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
          periodLabel: 'one-time · 1 month',
          quota: '50,000 requests / month',
          features: [
            'Everything in Business',
            '50,000 requests for 1 month',
            'One-time payment — no auto-renewal',
            'JSON responses'
          ],
          ctaLabel: 'Get Scale',
          status: 'buyable',
          featured: false
        }
      ],
      quotaNote:
        'One-time payment covering one natural month — plans on this tab do not auto-renew. Each successful API or MCP call counts as one request, including empty and partial results; failed calls are not counted. Usage resets on the 1st and unused requests do not roll over.',
      compare: {
        lead: 'API plans — programmatic access, priced by requests.',
        volume: 'Requests per month',
        groups: [
          {
            label: 'Endpoints',
            rows: [
              { label: 'Business search by keyword and location', cells: [true, true, true, true, true] },
              { label: 'Reviews endpoint with sorting and paging', cells: [true, true, true, true, true] },
              { label: 'JSON responses', cells: [true, true, true, true, true] },
              { label: 'MCP server with the same API key', cells: [true, true, true, true, true] }
            ]
          },
          {
            label: 'Access',
            rows: [
              { label: 'API key tied to your account', cells: [true, true, true, true, true] },
              { label: 'Community support', cells: [true, true, true, true, true] }
            ]
          }
        ]
      },
      checkout: {
        usageNotice: 'Applies to the MapsGrab API monthly request quota.',
        successTitle: 'Plan activated',
        successDescription:
          'Your one-time 1-month plan is live. Your API key picks up the new quota on the next request.'
      }
    }
  },
  plansSection: {
    label: 'Plans',
    finder: {
      label: 'How many {unit} do you need a month?',
      result: '{value} {unit}',
      valueText: '{value} {unit} a month — {plan} plan',
      fits: 'Fits'
    }
  },
  compare: {
    kicker: 'Compare',
    title: { lead: 'Every plan, ', accent: 'side by side', tail: '' },
    plan: 'Plan',
    volumeGroup: 'Volume & billing',
    billing: 'Billing',
    included: 'Included',
    notIncluded: 'Not included',
    allPlans: 'Included in every plan'
  },
  usage: {
    head: {
      kicker: 'Usage',
      title: { lead: 'What counts toward your ', accent: 'quota', tail: '' },
      lead:
        'Two units: records for the extension and the Online Scraper, requests for the API — and both reset on the 1st of every month.'
    },
    records: {
      meter: 'Records used this month',
      badge: 'Extension · Online',
      title: '1 record = 1 collected row',
      body:
        'Each row you collect counts as one record: a business on the Online Scraper; a business, a review or a photo in the extension. Email and social enrichment does not add records.',
      count: '+1 record',
      attachments: ['Phone & website', 'Opening hours', 'Email & socials']
    },
    requests: {
      meter: 'Requests used this month',
      badge: 'API · MCP',
      title: '1 request = 1 successful call',
      body:
        'A request is one successful API call, even when it returns no results or partial data; failed calls are not counted. MCP tool calls draw on the same request quota.',
      counted: 'Successful call — counted',
      notCounted: 'Failed call — not counted'
    },
    reset: {
      title: 'Resets on the 1st',
      body: 'Usage resets on the 1st of every month. Unused records and requests do not roll over.',
      limit: 'Plan limit',
      unused: 'Unused · doesn’t roll over',
      flag: 'Reset'
    }
  },
  billing: {
    head: {
      kicker: 'Billing',
      title: { lead: 'Simple billing, ', accent: 'no surprises', tail: '' },
      lead: 'How payment, renewal and upgrades work across the three product lines.'
    },
    items: {
      channels: {
        title: 'PayPal',
        body: 'Pay for any plan through PayPal. Complete your payment on PayPal and return here to activate your plan.'
      },
      cadence: {
        title: 'One-time payment',
        body:
          'Every paid plan covers one natural month. Pay once with no automatic charges; purchase again when you need another month.'
      },
      upgrade: {
        title: 'Upgrade by paying the difference',
        body:
          'Move an active plan to an eligible higher tier through your current payment provider. Your expiry date and usage so far stay unchanged.'
      },
      independent: {
        title: 'Independent plans',
        body:
          'Plans on different tabs are independent. When a plan expires, the account automatically returns to the free tier.'
      }
    }
  },
  plans: {
    loading: 'Loading payment options...',
    loadFailed: 'Failed to load payment options. Refresh the page to retry.',
    noChannels: 'No payment method is available for this plan right now.',
    productTitlePrefix: 'MapsGrab',
    failedTitle: 'Payment incomplete',
    billingPeriodMonthly: '1 month',
    billingAutoRenew: 'Auto-renews until canceled',
    billingOneTime: 'One-time payment'
  },
  upgrade: {
    currentPlan: 'Current Plan',
    button: 'Upgrade · {amount}',
    title: 'Upgrade your plan',
    confirm: 'Confirm upgrade',
    oneTime: 'One-time difference via {channel}. Your expiry date stays {date}.',
    autoRenew: 'The difference will be charged immediately via {channel}. Your expiry date stays {date}; future renewals use the new plan price.',
    pendingTitle: 'Waiting for your upgrade',
    pendingDescription: 'Your payment provider is applying the upgrade. Your current plan stays active until it is confirmed.',
    successTitle: 'Plan upgraded',
    successDescription: 'Your new quota is active. Your expiry date stays {date}.',
    quoteFailed: 'Could not load your upgrade price. Refresh the page to retry.',
    failed: 'Your upgrade could not be confirmed. Refresh the page to check your plan before trying again.',
    reasons: {
      no_active_subscription: 'Your plan is no longer active. Refresh the page to choose a plan.',
      not_higher_tier: 'Choose a higher tier to upgrade, or wait until your plan expires to change tiers.',
      non_positive_diff: 'Your remaining plan value is not lower than this tier. You can change tiers after your plan expires.',
      channel_unavailable: 'Upgrades are unavailable with your current payment method. You can change plans after expiry.'
    }
  },
  faq: {
    kicker: 'FAQ',
    title: { lead: 'Questions before you ', accent: 'buy?', tail: '' },
    lead: 'The billing basics. Anything else, support is one email away.',
    contact: 'Contact support',
    items: [
      {
        question: 'What counts as a record?',
        answer:
          'A record is one collected row — the same unit the free plans count. On the Online Scraper that is one business; in the extension, each business, review or photo it collects is one record. Email and social enrichment does not add records. On the API tab, usage is counted in successful requests instead.'
      },
      {
        question: 'Do I need a paid plan to try MapsGrab?',
        answer:
          'No. Every product has a free tier with no time limit: the Online Scraper and the extension include 1,000 records per month, and the API includes 20 requests per month. The Online Scraper and extension free plans do not include email or social media enrichment. Paid Online plans include it by default, and you can turn it off for each task.'
      },
      {
        question: 'How does the quota apply to my account?',
        answer:
          'Quota is counted per signed-in account (and per browser device for the extension when you are not signed in). Sign in with the account that owns the plan so the higher ceiling applies. When a plan expires, the account automatically returns to the free tier.'
      },
      {
        question: 'Will my plan renew automatically?',
        answer:
          'No. All plans are one-time PayPal payments covering one natural month. When your plan expires, you return to the free tier. Purchase again to continue with a paid plan.'
      },
      {
        question: 'Can I switch between tiers?',
        answer:
          'You can upgrade an active plan to an eligible higher tier by paying the difference through PayPal. Your expiry date and usage so far stay unchanged. Plans on different tabs are independent.'
      }
    ]
  },
  cta: {
    kicker: 'Get started',
    title: { lead: 'Start on the ', accent: 'free tier', tail: '' },
    lead:
      'Every product has a free tier with no time limit — 1,000 records a month on the extension and the Online Scraper, 20 requests a month on the API.',
    primary: 'Install the extension',
    secondary: 'Try the Online Scraper',
    note: 'Free monthly quota included. No credit card.'
  }
}
