import type { SiteContent } from '../schema'
import { pricingContent } from '../pricing'
import { dashboardContent } from '../dashboard'
import { toolsContent } from '../tools'
import { apiPageContent, photosApiContent, reviewsApiContent, scraperApiContent } from '../api'
import { scraperMcpContent } from '../mcp'
import { extensionContent } from '../extension'
import { onlineScraperContent } from '../online-scraper'

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
      primaryLabel: 'Primary navigation',
      mobileLabel: 'Mobile navigation',
      extension: 'Extension',
      online: 'Online',
      api: 'API',
      apiScraper: 'Scraper API',
      apiReviews: 'Reviews API',
      apiPhotos: 'Photos API',
      apiMcp: 'Scraper MCP',
      apiScraperDesc: 'Business data for any keyword and location, as JSON.',
      apiReviewsDesc: 'Full review threads with ratings and owner replies.',
      apiPhotosDesc: 'Public photo galleries as ready-to-use URL lists.',
      apiMcpDesc: 'Live Maps data for Claude Code, Cursor and VS Code.',
      apiFootNote: 'API and MCP share one monthly request quota.',
      apiPricing: 'API pricing',
      pricing: 'Pricing',
      freeTools: 'Free tools',
      signIn: 'Sign in',
      dashboard: 'Dashboard'
    },
    footer: {
      legalLabel: 'Legal',
      resources: 'Free tools',
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
    comingSoon: 'Coming soon',
    themeLabel: 'Color theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    faqLabel: 'FAQ',
    breadcrumbLabel: 'Breadcrumb',
    languageSwitcherLabel: 'Language switcher',
    mobileMenuLabel: 'Toggle menu',
    copied: 'Copied to clipboard',
    cancel: 'Cancel',
    continue: 'Continue'
  },
  dashboard: dashboardContent,
  pages: {
    home: {
      seo: {
        title: 'MapsGrab — Grab Google Maps Business Data into CSV & JSON',
        description:
          'MapsGrab is a browser extension and web toolkit that collects publicly available business information from Google Maps — names, phones, reviews, photos, emails — and exports it to CSV or JSON.'
      },
      hero: {
        announce: { badge: 'New', text: 'MCP server for AI agents' },
        title: { firstLine: 'Grab Google Maps data', secondLine: 'in', accent: 'one click', end: '.' },
        lead:
          'Collect public business data from Google Maps — names, phones, websites, reviews, photos and emails — and export clean CSV or JSON in seconds.',
        search: {
          label: 'Search keyword',
          typing: [
            'coffee shop in Portland',
            'dentist in Austin, TX',
            'plumber near Chicago',
            'yoga studio in Brooklyn',
            'hotels in Miami Beach'
          ],
          submit: 'Preview results',
          loading: 'Searching…',
          suggestLabel: 'Try',
          suggestions: ['coffee shop in Portland', 'dentist in Austin, TX', 'plumber near Chicago']
        },
        trust: ['No credit card required', '{records} free records / month', 'CSV & JSON export'],
        dashboard: 'Open Online Scraper',
        theater: {
          panelLabel: 'MapsGrab panel preview',
          extensionActive: 'MapsGrab extension active',
          mapFilters: ['Open now', 'Top rated', 'Price'],
          live: 'Live',
          done: 'Done',
          start: 'Start Extracting',
          pause: 'Pause',
          extracting: 'Extracting {count}…',
          finished: 'Done · {count} places',
          kpis: { phones: 'phones', emails: 'emails', websites: 'websites' },
          export: 'Export Detailed List - {count} (.CSV)',
          exportSaved: 'Export saved',
          emailFound: 'Email found',
          averageRating: 'Average rating',
          placeId: 'Place ID',
          ratingValue: '{rating} · {reviews} reviews'
        },
        preview: {
          badge: 'Preview',
          state: 'Preview · first results page',
          count: '{count} businesses on the first results page',
          reviews: '{count} reviews',
          locked: 'Sign in and submit your keywords in Online Scraper to collect and export results.',
          signIn: 'Sign in to start a full task',
          openOnline: 'Open Online Scraper',
          failed: 'Could not load the preview. Please try again.',
          empty: 'No businesses found on the first results page.'
        }
      },
      facts: {
        caption: 'MapsGrab by the numbers',
        items: [
          { value: 36, label: 'data columns per business' },
          { value: 11, label: 'review fields, owner replies included' },
          { value: 6, label: 'social networks matched per website' },
          { value: 'freeRecords', label: 'free records, every month' },
          { value: 3, plus: 1, label: 'ways to run it: Extension, Online, API — plus MCP' }
        ]
      },
      how: {
        head: {
          kicker: 'How it works',
          title: { lead: 'From a map search to a ', accent: 'spreadsheet', tail: ' in three steps' },
          lead: 'No code and no copy-paste. MapsGrab reads what Google Maps already shows you and turns it into structured rows.'
        },
        steps: [
          {
            title: 'Search Google Maps',
            body: 'Open Google Maps and search any business type and location — exactly like you normally would.'
          },
          {
            title: 'Start extracting',
            body: 'Click {action}. MapsGrab scrolls the results, collects the listings and, when enabled, enriches contacts.',
            action: 'Start Extracting'
          },
          {
            title: 'Export anywhere',
            body: 'Download CSV or JSON with the columns you choose — reviews and photos land in their own files, ready for Excel or your CRM.'
          }
        ],
        searchSample: 'bakery in Seattle',
        columnsUnit: 'columns',
        reviewsFile: 'reviews'
      },
      products: {
        head: {
          kicker: 'Products',
          title: { lead: 'Three ways to ', accent: 'grab', tail: ' Maps data.' },
          lead: 'Pick the browser extension, the cloud-based Online Scraper, or the API. The extension works inside your own browser; the Online Scraper and the API share one cloud engine.'
        },
        cards: {
          extension: {
            badge: 'Browser extension',
            title: 'Grab data while you browse Google Maps',
            body: 'Extract business data, reviews and photos from the Maps pages you open, then export everything locally. Edge, Firefox and Chromium.',
            link: 'Explore the extension'
          },
          online: {
            badge: 'Online Scraper',
            title: 'Cloud runs. Nothing to install.',
            body: 'Paste keywords, collect business details in the cloud and download CSV files or a ZIP bundle.',
            link: 'Explore Online Scraper'
          },
          api: {
            badge: 'API',
            title: 'Clean JSON over HTTP',
            body: 'Business data and reviews for your own applications — one API key.',
            link: 'Explore the API'
          },
          mcp: {
            badge: 'MCP server',
            title: 'Live Maps data for your AI agents',
            body: 'Search and reviews as MCP tools for Claude Code, Cursor, VS Code and Codex.',
            link: 'Explore the MCP server'
          }
        },
        extracting: 'Extracting {count}…',
        queue: { rows: '{count} rows', processing: 'Processing' },
        chat: {
          prompt: 'Find dentists in Austin rated 4.5+ with a website',
          answer: 'Found {count} matches. Top three:'
        }
      },
      fields: {
        head: {
          kicker: 'The data',
          title: { lead: '36 columns. ', accent: 'Every one', tail: ' useful.' },
          lead: 'The extension exports one schema from search results and business pages — contact details, location, profile, ratings and every identifier you need to match records later.'
        },
        filtersLabel: 'Field groups',
        all: 'All',
        groups: {
          contact: { filter: 'Contact', label: 'Contact' },
          location: { filter: 'Location', label: 'Location' },
          profile: { filter: 'Profile', label: 'Business profile' },
          reviews: { filter: 'Ratings', label: 'Ratings & reviews' },
          ids: { filter: 'IDs & links', label: 'IDs & links' }
        },
        sampleLabel: 'Sample value',
        emptySample: '(empty)',
        descriptions: {
          Name: 'Business name exactly as shown on the listing.',
          Description: 'Short description from the business profile.',
          Fulladdress: 'Complete, formatted street address.',
          Street: 'Street line of the address.',
          Municipality: 'City or locality.',
          Categories: 'Every category assigned to the business.',
          About: 'Attributes from the About tab.',
          'Plus Code': 'Column reserved for the Open Location Code — exported empty for now.',
          'Time Zone': 'IANA time zone of the location.',
          Price: 'Price level shown on the listing.',
          Note: 'Merchant note or highlight.',
          Amenities: 'Amenities and service options.',
          'Hotel Class': 'Star class for lodging listings.',
          Phone: 'Primary phone number shown on the listing.',
          Phones: 'Every phone number found for the business.',
          Claimed: 'Whether the owner has claimed the profile.',
          Owner: 'Owner name on the profile.',
          'Owner Id': 'Contributor ID of the owner account.',
          'Owner Link': 'Link to the owner’s contributor page.',
          Email: 'Email addresses found on the business website.',
          'Social Medias': 'Social profiles linked from the website.',
          'Review Count': 'Total number of reviews.',
          'Average Rating': 'Average star rating.',
          'Review URL': 'Direct link to the reviews panel.',
          'Google Maps URL': 'Stable short link built from the CID.',
          'Google Knowledge URL': 'Knowledge panel search link.',
          Latitude: 'Latitude in decimal degrees.',
          Longitude: 'Longitude in decimal degrees.',
          Website: 'Official website from the listing.',
          Domain: 'Registrable domain of the website.',
          'Opening Hours': 'Weekly hours, closed days marked.',
          'Featured Image': 'Cover photo URL of the listing.',
          Cid: 'Customer ID — the decimal form of the FID.',
          Fid: 'Feature ID made of two hexadecimal halves.',
          'Place Id': 'Stable Google Place ID.',
          Kgmid: 'Knowledge Graph machine ID.'
        },
        reviews: {
          title: '+ 11 review columns',
          body: 'Exported separately, paginated up to your plan limit.'
        },
        photos: {
          title: '+ photo URL lists',
          body: 'Public album photo URLs per business, Street View filtered out.'
        },
        sampleCsv: 'Download sample CSV'
      },
      enrichment: {
        head: {
          kicker: 'Enrichment',
          title: { lead: 'From a pin to a person you can ', accent: 'email', tail: '' },
          lead: 'When enrichment is on, MapsGrab checks the official website of each business and fills in direct contact channels while it extracts.'
        },
        points: [
          'Email addresses found on the business website',
          'Social profiles: Facebook, Instagram, LinkedIn, X, YouTube, TikTok',
          'On by default on paid Online plans, one setting in the extension',
          'Included in API search responses with one flag — no separate enrichment step'
        ]
      },
      developers: {
        head: {
          kicker: 'For developers',
          title: { lead: 'Plug Maps data into ', accent: 'anything', tail: ' you build' },
          lead: 'The cloud engine behind the Online Scraper, exposed as an HTTP API and an MCP server. Structured JSON, one key, no HTML to parse.'
        },
        listLabel: 'Developer products',
        items: {
          search: { title: 'Scraper API', description: 'Businesses for any keyword and location' },
          reviews: { title: 'Reviews API', description: 'Ratings, text and owner replies' },
          photos: { title: 'Photos API', description: 'Public photo URLs per business' },
          mcp: { title: 'MCP server', description: 'Search and reviews tools for any MCP client' }
        },
        langLabel: 'Language',
        copyLabel: 'Copy request',
        sending: 'Sending request…',
        response: 'Response · 200 OK · {ms} ms',
        toolCall: 'Tool call · {tool} · 200 OK',
        exploreApi: 'Explore the API',
        apiPricing: 'API pricing',
        worksWith: 'Works with the tools you already use',
        integrations: [
          'Claude Code',
          'Cursor',
          'VS Code',
          'Codex',
          'MCP Inspector',
          'Microsoft Excel',
          'CSV',
          'JSON',
          'ZIP bundles'
        ]
      },
      useCases: {
        head: {
          kicker: 'Use cases',
          title: { lead: 'Made for the work ', accent: 'after', tail: ' the search' }
        },
        cards: [
          {
            label: 'Lead generation',
            title: 'Local lead lists',
            body: 'Search a category and a city, then export the whole results page — phones, websites and emails included — into one spreadsheet.'
          },
          {
            label: 'Local SEO',
            title: 'Competitor benchmarks',
            body: 'Pull ratings and review counts for every competitor in an area in one pass, and build the report straight from the export.'
          },
          {
            label: 'Market research',
            title: 'Location datasets',
            body: 'Collect Place IDs and coordinates for every branch or competitor location, ready for your mapping and routing tools.'
          }
        ],
        leadTags: ['email', 'phone', 'email', 'site']
      },
      pricingTeaser: {
        head: {
          kicker: 'Pricing',
          title: { lead: 'Start free. ', accent: 'Scale', tail: ' when it pays off.' },
          lead: 'Every product has a free tier with no time limit. Upgrade only the surface you actually use.'
        },
        lines: {
          extension: { title: 'Browser Extension', billing: 'Monthly', link: 'See extension plans' },
          online: { title: 'Online Scraper', billing: 'One-time', link: 'See Online plans' },
          api: { title: 'API & MCP', billing: 'One-time', link: 'See API plans' }
        }
      },
      tools: {
        head: {
          kicker: 'Free tools',
          title: { lead: 'Small tools for Maps ', accent: 'power users', tail: '' },
          lead: 'Seven utilities that run entirely in your browser — what you paste never leaves your device.'
        },
        descriptions: {
          'place-id-finder': 'Paste a Maps place URL and read out its Place ID, CID and FID.',
          'review-link-generator': 'Get the direct “write a review” link for any business.',
          'email-checker': 'See instantly whether an email format is valid — with typo hints.',
          'lat-long-to-dms': 'Decimal coordinates to degrees, minutes and seconds.',
          'dms-to-dd': 'DMS coordinates back to clean decimal degrees.',
          'bulk-keywords-generator': 'Every “keyword + location” combination, ready to paste.',
          'merge-csv': 'Merge CSV exports into one file, aligned by header.'
        },
        more: 'More tools on the way'
      },
      faq: {
        kicker: 'FAQ',
        title: { lead: 'Frequently asked ', accent: 'questions', tail: '' },
        lead: 'The short answers. Anything else, support is one email away.',
        contact: 'Contact support',
        items: [
          {
            question: 'Is MapsGrab free to use?',
            answer:
              'Yes. The extension works without an account and includes a free monthly quota of records. Paid plans on the Pricing page raise the limits when you need more.'
          },
          {
            question: 'Which browsers are supported?',
            answer:
              'MapsGrab targets Microsoft Edge (Edge Add-ons) and Firefox (Firefox Add-ons). Chromium-based browsers can also load the extension directly from the release zip — see the install guide on the Extension page.'
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
              'Exports come as CSV or JSON with the field selection you choose, deduplicated by Place ID.'
          },
          {
            question: 'Does MapsGrab see the data I collect?',
            answer:
              'Your settings and results are stored locally in your browser. Our servers only handle remote configuration, account and quota status, optional email/social enrichment, and minimal usage logs.'
          }
        ]
      },
      cta: {
        kicker: 'Get started',
        title: { lead: 'Start grabbing in ', accent: 'minutes', tail: '' },
        lead: 'Install the extension, open Google Maps, search, and export your first list — no account required.',
        install: 'Install MapsGrab free',
        online: 'Try the Online Scraper',
        note: 'Free monthly quota included. No credit card.'
      }
    },
    extension: extensionContent,
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
        authExpired: 'Sign-in expired. Sign in again to continue.',
        popupBlocked: 'Your browser blocked the new window. Allow MapsGrab to open pop-ups and try again.'
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
    online: onlineScraperContent,
    apiPage: apiPageContent,
    scraperApi: scraperApiContent,
    reviewsApi: reviewsApiContent,
    photosApi: photosApiContent,
    scraperMcp: scraperMcpContent,
    tools: toolsContent,
  }
}
