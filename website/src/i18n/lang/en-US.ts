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
      download: 'Download',
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
    installCta: 'Install Now'
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
        primaryCta: 'Install MapsGrab',
        secondaryCta: 'See what it grabs'
      },
      products: {
        eyebrow: 'Products',
        title: 'One toolkit, three ways to grab',
        description:
          'Start with the browser extension today. The same data engine is expanding to the cloud and an API.',
        availableLabel: 'Available now',
        comingSoonLabel: 'Coming soon',
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
            status: 'available',
            href: '/extension/'
          },
          {
            id: 'online',
            name: 'Online Scraper',
            tagline: 'Cloud runs without installing anything',
            description:
              'A hosted version of the same extraction engine. Paste keywords, get results — no browser required.',
            bullets: [],
            ctaLabel: 'Coming soon',
            status: 'coming-soon',
            href: ''
          },
          {
            id: 'api',
            name: 'MapsGrab API',
            tagline: 'Programmatic access to the same data',
            description:
              'Query business data, reviews, and photos from your own applications with a simple HTTP API.',
            bullets: [],
            ctaLabel: 'Coming soon',
            status: 'coming-soon',
            href: ''
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
        primaryCta: 'Install MapsGrab',
        secondaryCta: 'View pricing',
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
      versionNotes: {
        eyebrow: 'Release notes',
        title: 'Version notes',
        description:
          'MapsGrab ships through Edge Add-ons and Firefox Add-ons, with pre-release builds published on the Download page. This section tracks what changed in each release.',
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
        title: 'Get the extension in three steps',
        description:
          'Store listings for Edge Add-ons and Firefox Add-ons are in progress. Until they are live, install directly from the release zip.',
        steps: [
          {
            title: 'Download',
            details: [
              'Grab the Edge or Firefox build from the Download page.',
              'The zip is the same package that ships to the stores.'
            ]
          },
          {
            title: 'Load it in your browser',
            details: [
              'Edge / Chromium: enable Developer mode on the extensions page and load the unzipped folder.',
              'Firefox: load the add-on temporarily from the debugging page.'
            ]
          },
          {
            title: 'Open Google Maps and grab',
            details: [
              'Search on Google Maps — the MapsGrab panel appears on the page.',
              'Start extracting, then export when the run finishes.'
            ]
          }
        ],
        downloadCta: 'Go to the Download page'
      },
      cta: {
        title: 'Grab your first list today',
        description:
          'Install the extension, search Google Maps, and export a clean spreadsheet in minutes — no account required.',
        button: 'Install MapsGrab',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    download: {
      seo: {
        title: 'Download MapsGrab — Install on Edge and Firefox',
        description:
          'Install MapsGrab from Edge Add-ons or Firefox Add-ons, or load the release zip directly in Chromium and Firefox browsers. Step-by-step guide included.'
      },
      hero: {
        eyebrow: 'Download',
        title: 'Install MapsGrab',
        description:
          'Pick your browser below. Store listings are being finalized — until then, the direct-install zip carries the exact same package.'
      },
      zip: {
        title: 'Direct install (release zip)',
        description:
          'The release zip is the identical package submitted to both stores. Load it manually while store listings are in review.',
        button: 'Download release zip',
        note: 'Release asset link is being prepared — it will attach to the public release of version 0.1.0.'
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
              details: ['Download the release zip above and unzip it to a folder you keep.']
            },
            {
              title: 'Open the extensions page',
              details: ['In Edge, Chromium, or Brave, open the extensions management page.']
            },
            {
              title: 'Enable Developer mode',
              details: ['Toggle Developer mode in the extensions page sidebar.']
            },
            {
              title: 'Load the unpacked folder',
              details: [
                'Click "Load unpacked" and select the unzipped folder.',
                'The MapsGrab panel appears on Google Maps search pages.'
              ]
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
              details: ['Download the release zip above and unzip it to a folder you keep.']
            },
            {
              title: 'Open the debugging page',
              details: ['Navigate to about:debugging, then choose "This Firefox".']
            },
            {
              title: 'Load the add-on',
              details: [
                'Click "Load Temporary Add-on…" and pick manifest.json inside the unzipped folder.',
                'A temporary add-on reloads when Firefox restarts — the AMO listing above makes it permanent once live.'
              ]
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
    extensionLoginBing: {
      title: 'Extension Login | Bing Maps Scraper',
      description: 'Sign in to sync your website session to the Bing Maps Scraper extension.',
      eyebrow: 'Browser Extension',
      heading: 'Bing Maps Scraper Extension Login',
      checkingState: 'Checking',
      signInRequiredState: 'Sign-in required',
      syncedState: 'Synced',
      verificationFailedState: 'Error',
      preparingTitle: 'Preparing your sign-in',
      preparingText: 'Setting up the Bing Maps Scraper login bridge.',
      checkingSessionTitle: 'Checking your session',
      checkingSessionText: 'Verifying your existing website session.',
      finishingGoogleTitle: 'Finishing Google sign-in',
      finishingGoogleText: 'Exchanging your Google authorization for a website session.',
      signInRequiredTitle: 'Sign in to continue',
      signInRequiredText: 'Sign in to sync your website session to the Bing Maps Scraper extension.',
      signInButtonLabel: 'Sign In',
      syncingTitle: 'Syncing to extension',
      syncingText: 'Sending your session to the Bing Maps Scraper extension.',
      syncedTitle: 'Session synced',
      syncedText: 'Your website session is now connected to the Bing Maps Scraper extension.',
      returnButtonLabel: 'Return to Bing Maps Scraper',
      returningButtonLabel: 'Returning...',
      verificationFailedTitle: 'Something went wrong',
      retryButtonLabel: 'Retry',
    },
    tools: toolsContent,
  }
}
