import type { SiteContent } from '../schema'
import { pricingContent } from '../pricing'
import { toolsContent } from '../tools'

/**
 * en-US 站点文案字典（当前唯一 locale，EN 首批基线）。
 *
 * 首页/插件产品页/下载页（W2）、法务/公司页（W3）、Pricing 三档购买页（W5）
 * 与工具矩阵（W4）文案已落正式 MapsGrab 文案。
 */
export const enUS: SiteContent = {
  site: {
    name: 'MapsGrab',
    description:
      'MapsGrab is a maps data toolkit: grab publicly available business information from maps, review links, place IDs, and more with a browser extension and web tools.',
    keywords:
      'maps data, google maps extractor, place id finder, review link generator, maps tools'
  },
  layout: {
    nav: {
      brand: 'MapsGrab',
      home: 'Home',
      extension: 'Extension',
      online: 'Online',
      api: 'API',
      apiScraper: 'Scraper API',
      apiReviews: 'Reviews API',
      apiPhotos: 'Photos API',
      apiMcp: 'Scraper MCP',
      pricing: 'Pricing'
    },
    footer: {
      resources: 'Resources',
      product: 'Product',
      rights: '© 2026 MapsGrab. All rights reserved.',
      tools: [
        { id: 'place-id-finder', label: 'Place ID Finder', path: '/tools/place-id-finder/' },
        { id: 'review-link-generator', label: 'Review Link Generator', path: '/tools/review-link-generator/' },
        { id: 'email-checker', label: 'Email Checker', path: '/tools/email-checker/' },
        { id: 'lat-long-to-dms', label: 'Lat Long to DMS Converter', path: '/tools/lat-long-to-dms/' },
        { id: 'dms-to-dd', label: 'DMS to Decimal Converter', path: '/tools/dms-to-dd/' },
        { id: 'bulk-keywords-generator', label: 'Bulk Keywords Generator', path: '/tools/bulk-keywords-generator/' },
        { id: 'merge-csv', label: 'Merge CSV Files Online', path: '/tools/merge-csv-files-online/' }
      ]
    }
  },
  common: {
    installCta: 'Install Now',
    faqLabel: 'FAQ',
    breadcrumbLabel: 'Breadcrumb',
    languageSwitcherLabel: 'Language switcher',
    mobileMenuLabel: 'Toggle menu',
    cancel: 'Cancel',
    continue: 'Continue'
  },
  pages: {
    home: {
      seo: {
        title: 'MapsGrab — Grab Google Maps Business Data into CSV & JSON',
        description:
          'MapsGrab is a browser extension and web toolkit that collects publicly available business information from Google Maps — names, phones, reviews, photos, emails — and exports it to CSV or JSON.'
      },
      hero: {
        eyebrow: 'Maps data toolkit',
        title: 'Grab Google Maps business data in one click',
        description:
          'MapsGrab collects publicly available business information as you browse Google Maps — names, phones, reviews, photos, emails and more — and exports everything to clean CSV or JSON files.',
        highlights: [
          'No credit card required',
          '1,000 free records / month',
          'CSV & JSON export'
        ],
        scraperCard: {
          label: 'Enter your keywords',
          hint: 'One keyword or Google Maps URL per line',
          textareaLabel: 'Keywords, one per line',
          sampleKeywords: [
            'coffee shop in Portland',
            'restaurant in Austin',
            'hotel near Central Park, NY'
          ],
          submitLabel: 'Start scraping free',
          note:
            'The hosted Online Scraper is rolling out — until then, the browser extension grabs the same data while you browse.'
        },
        primaryCta: 'Install MapsGrab',
        secondaryCta: 'See what it grabs'
      },
      products: {
        eyebrow: 'Products',
        title: 'One toolkit, three ways to grab',
        description:
          'Pick the browser extension, the cloud-based Online Scraper, or the API — the same extraction engine behind all three.',
        availableLabel: 'Available now',
        items: [
          {
            id: 'extension',
            name: 'Browser Extension',
            tagline: 'Grab data while you browse Google Maps',
            description:
              'The MapsGrab extension for Edge and Firefox extracts business data, reviews, and photos from the Google Maps pages you open, then exports everything locally.',
            bullets: [
              '36-column business data extraction',
              'Reviews and photo URL scraping',
              'Email and social media enrichment',
              'Batch keyword and review-URL tasks',
              'CSV / JSON export with field selection'
            ],
            ctaLabel: 'Explore the extension',
            href: '/extension/'
          },
          {
            id: 'online',
            name: 'Online Scraper',
            tagline: 'Cloud runs without installing anything',
            description:
              'A hosted version of the same extraction engine. Paste keywords, get results — no browser required.',
            bullets: [
              'Keyword and review-URL cloud tasks',
              'Same 36-column schema as the extension',
              'CSV / JSON export with field selection'
            ],
            ctaLabel: 'Explore the Online Scraper',
            href: '/online-scraper/'
          },
          {
            id: 'api',
            name: 'MapsGrab API',
            tagline: 'Programmatic access to the same data',
            description:
              'Query business data, reviews, and photos from your own applications with a simple HTTP API.',
            bullets: [
              'Business data, reviews, and photos endpoints',
              'Clean JSON responses',
              'Same extraction engine as the extension'
            ],
            ctaLabel: 'Explore the API',
            href: '/google-maps-scraper-api/'
          }
        ]
      },
      testimonials: {
        eyebrow: 'Early access',
        title: 'What early users build with MapsGrab',
        note:
          'MapsGrab is in early access. These are the workflows we hear about most — verified customer stories will be published here as the program grows.',
        items: [
          {
            quote:
              'Building a local lead list used to mean copying rows out of Maps by hand. Now the whole search page lands in a spreadsheet with phones and websites included.',
            role: 'Local lead generation'
          },
          {
            quote:
              'Review counts and ratings for hundreds of competitors, exported in one pass — that is the report my clients actually ask for.',
            role: 'Local SEO consulting'
          },
          {
            quote:
              'Place IDs and coordinates for every branch location, ready to feed straight into our routing tools.',
            role: 'Market research'
          }
        ]
      },
      faq: {
        title: 'Frequently asked questions',
        description: 'The short answers. Anything else, support is one email away.',
        items: [
          {
            question: 'Is MapsGrab free to use?',
            answer:
              'Yes. The extension works without an account and includes a free monthly quota of records. Paid plans on the Pricing page raise the limits when you need more.'
          },
          {
            question: 'Which browsers are supported?',
            answer:
              'MapsGrab targets Microsoft Edge (Edge Add-ons) and Firefox (Firefox Add-ons). Chromium-based browsers can also load the extension directly from the release zip — see the Download page.'
          },
          {
            question: 'Where does the data come from, and is it legal to collect?',
            answer:
              'MapsGrab only collects information that is publicly displayed on the Google Maps pages you visit — the same details any visitor can read. We do not access private accounts, gated content, or non-public data.'
          },
          {
            question: 'Do I need to install anything for the web tools?',
            answer:
              'No. The free web tools run entirely in your browser — your input never leaves your device.'
          },
          {
            question: 'What formats can I export to?',
            answer:
              'Exports come as CSV or JSON with the field selection you choose, deduplicated by Place ID. Results can also be delivered to your own Google Drive or HubSpot account if you connect them.'
          },
          {
            question: 'Does MapsGrab see the data I collect?',
            answer:
              'Your settings and results are stored locally in your browser. Our servers only handle remote configuration, account and quota status, optional email/social enrichment, and minimal usage logs.'
          }
        ]
      },
      cta: {
        title: 'Start grabbing in minutes',
        description:
          'Install the extension, open Google Maps, search, and export your first list — no account required.',
        button: 'Get MapsGrab',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    extension: {
      seo: {
        title: 'MapsGrab for Edge & Firefox — Google Maps Extractor Extension',
        description:
          'Extract 36 columns of business data, reviews, and photos from Google Maps, enrich records with emails and social links, run batch tasks, and export to CSV or JSON.'
      },
      hero: {
        eyebrow: 'Browser extension',
        title: 'The Google Maps extractor for Edge and Firefox',
        description:
          'Open any Google Maps search or business page and grab what is publicly shown there: business data, reviews, photos, contact details. Everything exports to CSV or JSON, right from your browser.',
        edgeCta: 'Install for Edge',
        chromeCta: 'Install for Chrome',
        visualLabel:
          'The MapsGrab panel running on a Google Maps search — screenshot coming soon'
      },
      showcase: {
        eyebrow: 'See it in action',
        title: 'From Google Maps to a clean spreadsheet',
        description:
          'Open a Google Maps search, run the panel, and export every result with all 36 columns. Reviews and photos land in their own files, ready for Excel or your CRM.',
        panelLabel:
          'MapsGrab panel collecting a Google Maps search — screenshot coming soon',
        exportLabel:
          'Exported business data opened in a spreadsheet — screenshot coming soon',
        demoCta: 'Download demo data',
        demoNote:
          'A sample export of a real search, so you can see the exact columns before installing.'
      },
      features: {
        eyebrow: 'Features',
        title: 'What MapsGrab extracts',
        description:
          'One extraction schema across search results and business pages, tuned against the current Google Maps interface and updated remotely when Google changes.',
        groups: [
          {
            icon: 'business',
            title: 'Business data',
            description:
              'A 36-column schema per business, captured from search results with automatic scrolling to load every result.',
            items: [
              'Name, description, categories, and full address',
              'Phone numbers, website, and domain',
              'Review count and average rating',
              'Opening hours, time zone, and amenities',
              'Latitude / longitude and claimed status',
              'Place ID, CID, FID, and stable Google Maps URL'
            ]
          },
          {
            icon: 'reviews',
            title: 'Reviews',
            description:
              'Grab the reviews of any business page, paginated automatically up to your plan limit.',
            items: [
              'Author, rating, text, and review date',
              'Review photos and likes',
              'Owner replies with dates',
              'Author profile and direct review URL',
              '11 review columns per row, exported separately'
            ]
          },
          {
            icon: 'photos',
            title: 'Photos',
            description: 'Collect the photo galleries of business pages as ready-to-use URL lists.',
            items: [
              'All album photo URLs per business',
              'Street View imagery filtered out',
              'Exports alongside reviews or on its own'
            ]
          },
          {
            icon: 'enrichment',
            title: 'Email & social media enrichment',
            description:
              'For every collected business, MapsGrab looks up its official website and fills in direct contact channels.',
            items: [
              'Email addresses found on the business website',
              'Social profiles: Facebook, Instagram, LinkedIn, X, YouTube, TikTok',
              'Runs automatically during extraction — no extra clicks'
            ]
          },
          {
            icon: 'batch',
            title: 'Batch tasks',
            description:
              'Queue up work and let MapsGrab walk through it item by item with live progress.',
            items: [
              'Keyword-list tasks: one Maps search per keyword',
              'Review-URL tasks: per-business review collection',
              'Per-item try / stuck / complete counters with auto-skip on stalls',
              'Finished tasks export automatically'
            ]
          },
          {
            icon: 'export',
            title: 'Export',
            description:
              'Everything lands in clean files on your machine — or in your own cloud, if you connect it.',
            items: [
              'CSV and JSON export formats',
              'Field selection: export exactly the columns you need',
              'Deduplication by Place ID across runs',
              'Auto-download on completion',
              'Optional delivery to your Google Drive or HubSpot account'
            ]
          }
        ]
      },
      demo: {
        eyebrow: 'Demo',
        title: 'Watch the full workflow',
        description:
          'A short walkthrough of the whole loop: install, search on Google Maps, collect, enrich, and export.',
        videoLabel: 'Product demo video — coming soon'
      },
      versionNotes: {
        eyebrow: 'Release notes',
        title: 'Version notes',
        description:
          'MapsGrab ships through Edge Add-ons and Firefox Add-ons, with pre-release builds attached to the public release. This section tracks what changed in each release.',
        releases: [
          {
            version: '0.1.0 (pre-release)',
            date: 'August 2026',
            changes: [
              'First public pre-release of the MapsGrab extension.',
              'Google Maps search extraction with automatic scrolling and the 36-column schema.',
              'Review and photo extraction from business pages.',
              'Email and social media enrichment per business.',
              'Batch keyword and review-URL tasks with on-disk task state.',
              'CSV / JSON export with field selection and Place ID deduplication.',
              'Builds for Microsoft Edge and Firefox.'
            ]
          }
        ]
      },
      install: {
        eyebrow: 'Install',
        title: 'Install MapsGrab',
        description:
          'Edge installs straight from Edge Add-ons. Chrome and other Chromium browsers install from the release zip below — the identical package submitted to the stores. Firefox follows the temporary add-on steps.',
        zip: {
          title: 'Direct install (release zip)',
          description:
            'The release zip is the identical package submitted to both stores. Load it manually while store listings are in review.',
          button: 'Download release zip',
          note: 'Release asset link is being prepared — it will attach to the public release of version 0.1.0.',
          visualLabel: 'The MapsGrab release zip file — screenshot coming soon'
        },
        channels: [
          {
            id: 'edge',
            name: 'Microsoft Edge',
            storeName: 'Edge Add-ons',
            storeStatus: 'Listing in review — the store link goes live here as soon as Edge Add-ons approves it.',
            storeCta: 'Open Edge Add-ons',
            manualTitle: 'Direct install for Edge and Chromium browsers',
            steps: [
              {
                title: 'Download and unzip',
                details: ['Download the release zip above and unzip it to a folder you keep.'],
                mediaLabel:
                  'The release zip in the browser downloads bar — screenshot coming soon'
              },
              {
                title: 'Open the extensions page',
                details: ['In Edge, Chromium, or Brave, open the extensions management page.'],
                mediaLabel:
                  'The Edge extensions management page — screenshot coming soon'
              },
              {
                title: 'Enable Developer mode',
                details: ['Toggle Developer mode in the extensions page sidebar.'],
                mediaLabel:
                  'Developer mode toggled on in the extensions page sidebar — screenshot coming soon'
              },
              {
                title: 'Load the unpacked folder',
                details: [
                  'Click "Load unpacked" and select the unzipped folder.',
                  'The MapsGrab panel appears on Google Maps search pages.'
                ],
                mediaLabel:
                  'Load unpacked with the MapsGrab card added — screenshot coming soon'
              }
            ]
          },
          {
            id: 'firefox',
            name: 'Mozilla Firefox',
            storeName: 'Firefox Add-ons (AMO)',
            storeStatus: 'Listing in review — the store link goes live here as soon as Firefox Add-ons approves it.',
            storeCta: 'Open Firefox Add-ons',
            manualTitle: 'Direct install for Firefox',
            steps: [
              {
                title: 'Download and unzip',
                details: ['Download the release zip above and unzip it to a folder you keep.'],
                mediaLabel:
                  'The release zip in the browser downloads bar — screenshot coming soon'
              },
              {
                title: 'Open the debugging page',
                details: ['Navigate to about:debugging, then choose "This Firefox".'],
                mediaLabel:
                  'The about:debugging page with "This Firefox" selected — screenshot coming soon'
              },
              {
                title: 'Load the add-on',
                details: [
                  'Click "Load Temporary Add-on…" and pick manifest.json inside the unzipped folder.',
                  'A temporary add-on reloads when Firefox restarts — the AMO listing above makes it permanent once live.'
                ],
                mediaLabel:
                  'Load Temporary Add-on picking manifest.json — screenshot coming soon'
              }
            ]
          }
        ],
        help: {
          title: 'Installation trouble?',
          description:
            'If a step does not work in your browser version, send us the browser name and what you saw — we will get you unblocked.',
          contactCta: 'Contact support'
        }
      },
      cta: {
        title: 'Grab your first list today',
        description:
          'Install the extension, search Google Maps, and export a clean spreadsheet in minutes — no account required.',
        button: 'Install MapsGrab',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    account: {
      auth: {
        eyebrow: 'Website Access',
        title: 'Sign in to sync your Credits',
        trigger: 'Sign in',
        modalTitle: 'Sign in to continue',
        closeLabel: 'Close',
        signedInAs: 'Signed in as',
        continueWithGoogle: 'Continue with Google',
        googleLoading: 'Opening Google...',
        or: 'or',
        emailLabel: 'Email',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: 'Continue with email',
        sendCode: 'Send code',
        sendingCode: 'Sending...',
        sendCodeSuccess: 'Verification code sent.',
        sendAgain: 'Send again',
        codeLabel: 'Verification code',
        codePlaceholder: '123456',
        signIn: 'Sign in',
        termsNotice: 'By signing in, you agree to the',
        termsLink: 'Terms',
        privacyLink: 'Privacy Policy',
        logout: 'Log out',
        creditsLabel: 'Credits',
        enterEmailFirst: 'Please enter your email address first.',
        enterEmailAndCode: 'Please enter both email and verification code.',
        sendCodeFailed: 'Failed to send verification code.',
        googleSignInFailed: 'Google sign-in failed.',
        googleClientMissing: 'Google sign-in is not configured.',
        signInFailed: 'Failed to sign in.',
      },
      paypalReturn: {
        providerLabel: 'PayPal',
        canceledTitle: 'Payment canceled',
        canceledMessage:
          'This order was not paid. You can close this tab and choose a payment method again in the original window.',
        canceledMetaDescription: 'Your PayPal payment was canceled.',
        waitingTitle: 'Payment submitted',
        waitingMessage:
          'You can return to the original tab. We are checking PayPal confirmation every 3 seconds, and the result will appear here automatically.',
        confirmedCreditsTitle: 'Credits added',
        confirmedCreditsMessage:
          'Your PayPal payment is confirmed and the Credits have been added. You can close this tab and continue in the original window.',
        confirmedSubscriptionTitle: 'Subscription activated',
        confirmedSubscriptionMessage:
          'Your PayPal payment is confirmed and your MapsGrab plan is active. You can close this tab and continue in the original window.',
        failedTitle: 'Payment needs attention',
        failedMessage:
          'We could not confirm this order automatically. Return to the original window or try refreshing your payment status there.'
      },
      checkin: {
        accountButtonLabel: 'Open account menu',
        accountMenuLabel: 'Account menu',
      },
      creditPurchase: {
        title: 'Get more Credits',
        description: 'Add Credits and continue using paid features in this workspace.',
        successTitle: 'Credits added',
        successDescription: 'Your balance has been refreshed. Close this window and continue.',
        packageEyebrow: 'Pay as you go',
        cardNote: 'Use Credits for paid website features. Credits never expire.',
        creditsAmount: '{credits} Credits',
        buyNow: 'Buy Now',
        selectPackage: 'Select',
        paymentMethodLabel: 'Choose payment method',
        paymentTitle: 'Choose payment method',
        selectedPackageLabel: 'Selected package',
        confirmPurchase: 'Continue to payment',
        backToProducts: 'Back',
        close: 'Close',
        agreementText: 'I agree to the purchase terms, Terms, and Privacy Policy.',
        loadingConfigs: 'Loading Credits packages...',
        loadFailed: 'Failed to load Credits packages. Please try again.',
        noConfigs: 'No Credits packages are available right now. Please try again later.',
        ready: 'Choose a Credits package. Prices are shown in USD.',
        creatingOrder: 'Creating order...',
        pendingPayment: 'Complete payment in the newly opened tab. We will check the result automatically.',
        pendingPaymentTitle: 'Waiting for payment',
        cancelPayment: 'Cancel payment',
        supportMailPrefix: 'Report an issue: ',
        success: 'Payment complete. Credits are available now.',
        failed: 'Payment is not complete. You can retry or close this window.',
        successCredits: '+{credits} Credits added',
        successBalance: 'Current balance: {balance} Credits',
        createFailed: 'Failed to create order. Please try again.',
        invalidPaymentData: 'Payment link is invalid. Please try again later.',
        priceUpdated: 'Price changed. Review the latest price and buy again.',
        gatewayFailed: 'Payment entry is temporarily unavailable. Please try again later.',
        paymentCanceled: 'Payment was canceled. Choose a payment method and try again.',
        pollFailed: 'Failed to refresh payment status. Please try again.',
        pollTimeout: 'Automatic refresh timed out. Use the refresh button after payment.',
        orderNotFound: 'Order is no longer available. Create a new order.',
        orderExpired: 'Order expired. Please buy again.',
        fulfillmentFailed: 'Payment was received but Credits were not added yet. Please retry later.',
        authExpired: 'Sign-in expired. Sign in again to continue.'
      },
    },
    pricing: pricingContent,
    extensionLogin: {
      title: 'Extension Sign-in | MapsGrab',
      description: 'Sign in to connect your MapsGrab website session to the browser extension.',
      eyebrow: 'Browser Extension',
      heading: 'Extension Sign-in',
      checkingState: 'Checking',
      signInRequiredState: 'Sign-in required',
      confirmState: 'Confirm account',
      errorState: 'Error',
      preparingTitle: 'Preparing your sign-in',
      preparingText: 'Setting up the extension sign-in bridge.',
      invalidParamsTitle: 'Invalid sign-in link',
      invalidParamsText:
        'This sign-in link is missing required security parameters. Please start the sign-in again from the extension.',
      checkingSessionTitle: 'Checking your session',
      checkingSessionText: 'Verifying your existing website session.',
      finishingGoogleTitle: 'Finishing Google sign-in',
      finishingGoogleText: 'Exchanging your Google authorization for a website session.',
      signInRequiredTitle: 'Sign in to continue',
      signInRequiredText: 'Sign in to connect your website session to the extension.',
      signInButtonLabel: 'Sign In',
      confirmTitle: 'Confirm your account',
      confirmText:
        'The extension is requesting to sign in with the account below. Continue only if you just started sign-in from the extension.',
      continueButtonLabel: 'Continue',
      useAnotherAccountLabel: 'Use another account',
      issuingTitle: 'Completing sign-in',
      issuingText: 'Issuing a one-time sign-in code for the extension.',
      issueFailedTitle: 'Something went wrong',
      retryButtonLabel: 'Retry',
      verificationFailedPrefix: 'Website token verification failed',
      issueFailedPrefix: 'Extension login code request failed',
      googleSignInFailedPrefix: 'Google sign-in failed',
      googleCompletionFailedPrefix: 'Google sign-in could not complete',
    },
    onlineScraper: {
      seo: {
        title: 'Online Google Maps Scraper — Run Extraction in the Cloud | MapsGrab',
        description:
          'The MapsGrab Online Scraper runs the same extraction engine as the extension in the cloud: paste keywords, collect business data, reviews, and photos, and download CSV or JSON.'
      },
      hero: {
        eyebrow: 'Online scraper',
        title: 'Google Maps extraction in the cloud, no install',
        description:
          'The Online Scraper is the hosted version of the MapsGrab extraction engine. Queue keywords or review URLs, let the cloud do the scrolling and collecting, and download clean CSV or JSON files.',
        primaryCta: 'Start scraping',
        secondaryCta: 'View pricing',
        visualLabel:
          'The MapsGrab Online Scraper dashboard running keyword tasks — screenshot coming soon'
      },
      features: {
        eyebrow: 'Capabilities',
        title: 'What the Online Scraper does',
        description:
          'The same 36-column extraction schema as the browser extension, executed on cloud infrastructure so nothing runs on your machine.',
        items: [
          {
            title: 'Keyword tasks',
            description:
              'Paste a list of Google Maps keywords — one search per keyword, with automatic scrolling to load every result, just like the extension.'
          },
          {
            title: 'Review-URL tasks',
            description:
              'Queue business pages by URL to collect their reviews: author, rating, text, date, photos, and owner replies.'
          },
          {
            title: 'The 36-column business schema',
            description:
              'Name, address, phone, website, rating, hours, coordinates, Place ID, and more — identical to the extension output.'
          },
          {
            title: 'Email and social enrichment',
            description:
              'Every collected business gets its website checked for email addresses and social profiles automatically.'
          },
          {
            title: 'CSV / JSON export',
            description:
              'Download exactly the columns you need, deduplicated by Place ID across runs.'
          },
          {
            title: 'Nothing to install',
            description:
              'Runs in the cloud from any browser — Edge, Firefox, or anything else. Results stay downloadable from your account.'
          }
        ]
      },
      faq: {
        title: 'Online Scraper questions',
        items: [
          {
            question: 'How is the Online Scraper different from the extension?',
            answer:
              'The extension runs inside your browser while you browse Google Maps; the Online Scraper runs the same extraction engine on cloud infrastructure, so you can queue keywords and walk away. The output schema is identical.'
          },
          {
            question: 'Where does the data come from, and is it legal to collect?',
            answer:
              'MapsGrab only collects information that is publicly displayed on Google Maps — the same details any visitor can read. We do not access private accounts, gated content, or non-public data.'
          },
          {
            question: 'What formats can I export to?',
            answer:
              'Exports come as CSV or JSON with the field selection you choose, deduplicated by Place ID. Optional delivery to your Google Drive or HubSpot account is supported when connected.'
          },
          {
            question: 'How much does it cost?',
            answer:
              'The Online Scraper follows the MapsGrab plans on the Pricing page, including the free monthly quota of records. Paid plans raise the limits when you need more.'
          }
        ]
      },
      cta: {
        title: 'Queue your first cloud task',
        description:
          'Paste keywords, let the cloud collect, and download a clean spreadsheet — the same schema you get from the extension.',
        button: 'Start scraping',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    scraperApi: {
      seo: {
        title: 'Google Maps Scraper API — Business Data in JSON | MapsGrab',
        description:
          'The MapsGrab Scraper API returns Google Maps business data as clean JSON: names, phones, ratings, hours, coordinates, Place IDs, emails, and social profiles — powered by the same engine as the extension.'
      },
      hero: {
        eyebrow: 'Scraper API',
        title: 'Google Maps Scraper API',
        description:
          'Query Google Maps business data over a simple HTTP API and get clean JSON back: name, address, phone, website, rating, opening hours, coordinates, Place ID, plus email and social enrichment.',
        primaryCta: 'Get API key',
        secondaryCta: 'View pricing',
        visualLabel:
          'A MapsGrab API request and its JSON response in an API client — screenshot coming soon'
      },
      features: {
        eyebrow: 'Capabilities',
        title: 'What the Scraper API returns',
        description:
          'One request per keyword and location, answered with the same structured fields the extension exports — built for your own applications.',
        items: [
          {
            title: 'Search by keyword and location',
            description:
              'Send a keyword with an optional location parameter and receive the businesses a Google Maps search would show.'
          },
          {
            title: 'The 36-column business schema',
            description:
              'Name, categories, full address, phone, website, rating and review count, opening hours, latitude / longitude, Place ID, CID, and more.'
          },
          {
            title: 'Email and social enrichment',
            description:
              'Responses include email addresses and social profiles found on each business website — no separate enrichment step.'
          },
          {
            title: 'Clean JSON responses',
            description:
              'Structured, predictable field names ready for your CRM, spreadsheet pipeline, or backend — no HTML to parse.'
          },
          {
            title: 'Public data only',
            description:
              'The API returns only what is publicly displayed on Google Maps — the same details any visitor can read.'
          },
          {
            title: 'Same engine as the extension',
            description:
              'The API is backed by the MapsGrab extraction engine, tuned against the current Google Maps interface and updated remotely when Google changes.'
          }
        ]
      },
      faq: {
        title: 'Scraper API questions',
        items: [
          {
            question: 'What does the Scraper API return?',
            answer:
              'Structured JSON with the MapsGrab 36-column business schema: name, address, phone, website, rating, review count, opening hours, coordinates, Place ID, and email / social enrichment where available.'
          },
          {
            question: 'How do I authenticate?',
            answer:
              'Requests are authorized with a MapsGrab API key. Keys are issued per account and follow the plans on the Pricing page, including the free monthly quota of records.'
          },
          {
            question: 'Is the data legal to collect?',
            answer:
              'The API only returns information that is publicly displayed on Google Maps — the same details any visitor can read. We do not access private accounts, gated content, or non-public data.'
          },
          {
            question: 'Can I also get reviews and photos?',
            answer:
              'Yes — the Reviews API and Photos API cover those datasets as dedicated endpoints, using the same API key.'
          }
        ]
      },
      cta: {
        title: 'Put Maps data in your application',
        description:
          'One HTTP request per search, structured JSON in the response — the same extraction quality the extension delivers.',
        button: 'Get API key',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    reviewsApi: {
      seo: {
        title: 'Google Maps Reviews Scraper API — Reviews in JSON | MapsGrab',
        description:
          'The MapsGrab Reviews API returns the reviews of any Google Maps business as clean JSON: reviewer names, ratings, review text, dates, photos, and owner replies.'
      },
      hero: {
        eyebrow: 'Reviews API',
        title: 'Google Maps Reviews Scraper API',
        description:
          'Request the reviews of any Google Maps business and get structured JSON back: author, rating, review text, date, review photos, and owner replies — paginated up to your plan limit.',
        primaryCta: 'Get API key',
        secondaryCta: 'View pricing',
        visualLabel:
          'A MapsGrab Reviews API request and its JSON response in an API client — screenshot coming soon'
      },
      features: {
        eyebrow: 'Capabilities',
        title: 'What the Reviews API returns',
        description:
          'The same review dataset the extension exports — 11 review columns per row, delivered over HTTP as JSON.',
        items: [
          {
            title: 'Reviews by business',
            description:
              'Address the API with a Google Maps business identifier and collect its reviews, paginated automatically up to your plan limit.'
          },
          {
            title: 'Full review fields',
            description:
              'Author, rating, review text, and review date for every entry — the same 11-column schema the extension exports.'
          },
          {
            title: 'Review photos and likes',
            description:
              'Photo URLs attached to reviews come back in the response, ready for download or analysis.'
          },
          {
            title: 'Owner replies',
            description:
              'Business owner replies are included with their dates, so your monitoring sees the full conversation.'
          },
          {
            title: 'Clean JSON responses',
            description:
              'Structured field names ready for review monitoring, local SEO research, or reputation reporting workflows.'
          },
          {
            title: 'Public data only',
            description:
              'The API returns only reviews that are publicly displayed on Google Maps — the same content any visitor can read.'
          }
        ]
      },
      faq: {
        title: 'Reviews API questions',
        items: [
          {
            question: 'How do I address a specific business?',
            answer:
              'Requests target a Google Maps business identifier (such as the Place ID from a Scraper API response or any Maps place URL), so you can chain the two endpoints.'
          },
          {
            question: 'What fields does a review include?',
            answer:
              'Author, rating, review text, and review date, plus review photos, likes, owner replies with dates, and the direct review URL.'
          },
          {
            question: 'How many reviews can I collect?',
            answer:
              'Collection is paginated up to your plan limit. The plans on the Pricing page include a free monthly quota of records.'
          },
          {
            question: 'Is the data legal to collect?',
            answer:
              'The API only returns reviews that are publicly displayed on Google Maps — the same content any visitor can read. We do not access private accounts, gated content, or non-public data.'
          }
        ]
      },
      cta: {
        title: 'Monitor reviews at scale',
        description:
          'One request per business, full review threads in the response — built for monitoring, research, and reporting.',
        button: 'Get API key',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    photosApi: {
      seo: {
        title: 'Google Maps Photos API — Business Photos as URLs | MapsGrab',
        description:
          'The MapsGrab Photos API returns the public photo galleries of Google Maps businesses as ready-to-use URL lists, with Street View imagery filtered out.'
      },
      hero: {
        eyebrow: 'Photos API',
        title: 'Google Maps Photos API',
        description:
          'Request the photo gallery of any Google Maps business and get a clean list of image URLs back — public album photos only, with Street View imagery filtered out.',
        primaryCta: 'Get API key',
        secondaryCta: 'View pricing',
        visualLabel:
          'A MapsGrab Photos API request and its URL list response in an API client — screenshot coming soon'
      },
      features: {
        eyebrow: 'Capabilities',
        title: 'What the Photos API returns',
        description:
          'The same photo dataset the extension collects, delivered over HTTP as ready-to-use URL lists.',
        items: [
          {
            title: 'Photos by business',
            description:
              'Address the API with a Google Maps business identifier and receive its public album photo URLs.'
          },
          {
            title: 'Ready-to-use URL lists',
            description:
              'Responses are plain image URL lists — feed them straight into downloaders, audits, or enrichment pipelines.'
          },
          {
            title: 'Street View filtered out',
            description:
              'Street View imagery is excluded automatically, so you only get photos of the business itself.'
          },
          {
            title: 'Pairs with the other APIs',
            description:
              'Combine with the Scraper API and Reviews API using the same API key to get the full picture per business.'
          },
          {
            title: 'Clean JSON responses',
            description:
              'Structured field names, no HTML to parse — the same export quality the extension delivers.'
          },
          {
            title: 'Public data only',
            description:
              'The API returns only photos that are publicly displayed on Google Maps — the same images any visitor can see.'
          }
        ]
      },
      faq: {
        title: 'Photos API questions',
        items: [
          {
            question: 'What exactly do I get back?',
            answer:
              'A list of public photo URLs for the requested Google Maps business — album photos only, with Street View imagery filtered out.'
          },
          {
            question: 'How do I address a specific business?',
            answer:
              'Requests target a Google Maps business identifier (such as the Place ID from a Scraper API response or any Maps place URL).'
          },
          {
            question: 'Does it download the images for me?',
            answer:
              'No — the API returns URLs; you download or process the images on your side. That keeps responses fast and keeps you in control of storage.'
          },
          {
            question: 'How much does it cost?',
            answer:
              'The Photos API follows the MapsGrab plans on the Pricing page, including the free monthly quota of records.'
          }
        ]
      },
      cta: {
        title: 'Enrich records with real photos',
        description:
          'One request per business, public photo URLs in the response — ready for audits, listings, and enrichment.',
        button: 'Get API key',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    scraperMcp: {
      seo: {
        title: 'Google Maps Scraper MCP Server | MapsGrab',
        description:
          'Connect AI agents to live Google Maps data with the MapsGrab MCP server: search businesses, collect reviews, and retrieve photos over one secure MCP connection.'
      },
      hero: {
        eyebrow: 'MCP server',
        title: 'Google Maps Scraper MCP Server',
        description:
          'The MapsGrab MCP server exposes Google Maps search, reviews, and photos to AI agents over one secure MCP connection — live, structured data for Claude Code, Cursor, VS Code, and any MCP client.',
        primaryCta: 'Get API key',
        secondaryCta: 'View pricing',
        visualLabel:
          'An MCP client querying the MapsGrab MCP server — screenshot coming soon'
      },
      features: {
        eyebrow: 'Capabilities',
        title: 'What the MCP server exposes',
        description:
          'Three tools over one endpoint, backed by the same extraction engine as the extension and the APIs.',
        items: [
          {
            title: 'Search businesses',
            description:
              'Keyword and location searches that return the listing details a Google Maps search would show — names, phones, ratings, hours, coordinates, Place IDs.'
          },
          {
            title: 'Collect reviews',
            description:
              'Ratings, review text, reviewer details, dates, and owner replies for any business your agent is investigating.'
          },
          {
            title: 'Retrieve photos',
            description:
              'Public photo URLs per business, with Street View imagery filtered out — useful for enrichment and audits.'
          },
          {
            title: 'One endpoint, one auth header',
            description:
              'A single MCP endpoint authorized with your MapsGrab API key — no per-client plumbing beyond the standard config block.'
          },
          {
            title: 'Works with your MCP client',
            description:
              'Standard streamable HTTP transport, so Claude Code, Cursor, VS Code, Codex, MCP Inspector, and any MCP-compatible client can connect.'
          },
          {
            title: 'Public data only',
            description:
              'The server returns only information publicly displayed on Google Maps — the same details any visitor can read.'
          }
        ]
      },
      faq: {
        title: 'MCP server questions',
        items: [
          {
            question: 'What is the MapsGrab MCP server?',
            answer:
              'It is an MCP (Model Context Protocol) server that lets AI agents query live Google Maps data — business search, reviews, and photos — through the same MapsGrab extraction engine used by the extension and the APIs.'
          },
          {
            question: 'Which clients can connect?',
            answer:
              'Any MCP-compatible client: Claude Code, Cursor, VS Code, Codex, MCP Inspector, and others. Connection is a standard config block pointing at the MapsGrab MCP endpoint with your API key.'
          },
          {
            question: 'How is it authenticated?',
            answer:
              'With a MapsGrab API key passed as a bearer token — the same key plans on the Pricing page cover, including the free monthly quota of records.'
          },
          {
            question: 'What data can my agent retrieve?',
            answer:
              'Business search results with the 36-column schema, review threads with ratings and owner replies, and public photo URL lists per business.'
          }
        ]
      },
      cta: {
        title: 'Give your agent live Maps data',
        description:
          'One MCP connection, three tools, structured results — search, reviews, and photos for data-aware AI workflows.',
        button: 'Get API key',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    tools: toolsContent,
  }
}
