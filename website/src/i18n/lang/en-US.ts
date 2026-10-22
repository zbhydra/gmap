import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'
import { DEVELOPER_EMAIL } from '../../lib/contact'
import { pricingContent } from '../pricing'
import { dashboardContent } from '../dashboard'
import { toolsContent } from '../tools'
import { apiPageContent, photosApiContent, reviewsApiContent, scraperApiContent } from '../api'
import { scraperMcpContent } from '../mcp'
import { extensionContent } from '../extension'
import { onlineScraperContent } from '../online-scraper'

export const site: SiteContent = {
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
          title: 'Results',
          count: '{count} businesses on the first results page',
          columns: { name: 'Name', address: 'Address', category: 'Category', rating: 'Rating', reviews: 'Reviews', phone: 'Phone' },
          locked: 'Sign in and submit your keywords in Online Scraper to collect and export results.',
          signIn: 'Sign in to start a full task',
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
            body: 'Paste keywords, collect business details in the cloud and download one deduplicated 37-column CSV per task.',
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
              'Download MapsGrab from the Extension page. Chrome, Edge and Brave load the unpacked ZIP; Firefox uses a separate temporary add-on that must be reloaded after a restart. The page includes installation and update instructions.'
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

export const company: CompanyContent = {
  footerGroupLabel: 'Company',
  about: {
    navLabel: 'About',
    seoTitle: 'About MapsGrab | Product and Boundaries',
    seoDescription:
      'MapsGrab is a maps data toolkit for public business data: a browser extension, a cloud Online Scraper, API and MCP server, and free web tools. Learn where the data boundary is.',
    hero: {
      eyebrow: 'About MapsGrab',
      title: { lead: 'Maps data, grabbed the ', accent: 'straightforward', tail: ' way' },
      intro:
        'MapsGrab builds tools that collect publicly available business information from Google Maps and turn it into clean, structured data — a browser extension for Edge and Firefox, a cloud-based Online Scraper, API and MCP server, plus free web tools that run entirely in your browser.',
      contactLabel: 'Contact Support',
      extensionLabel: 'Explore the Extension',
      stageLabel: 'Early access',
      updatedLabel: 'Published and reviewed',
      updatedAt: 'August 31, 2026',
      chips: [
        { label: 'Collects', value: 'Public data only' },
        { label: 'Extension results', value: 'In your browser' },
        { label: 'Exports', value: 'CSV · JSON' }
      ],
      dragHint: 'Drag to spin'
    },
    build: {
      kicker: 'What we build',
      title: { lead: 'One toolkit, ', accent: 'four', tail: ' ways in' },
      lead: 'Pick the browser extension, the cloud-based Online Scraper, or the API. The extension works inside your own browser; the Online Scraper and the API share one cloud engine, and the MCP server brings that API to AI agents.',
      hub: {
        title: 'MapsGrab data toolkit',
        detail: 'Business data · reviews · photos · email & social enrichment'
      },
      tags: {
        extension: ['36-column extraction', 'Reviews & photos', 'Batch tasks'],
        online: ['Batch keywords', 'Contact enrichment', 'One 37-column CSV per task'],
        api: ['Business data', 'Reviews', 'Structured JSON'],
        mcp: ['Two tools', 'Streamable HTTP', 'OAuth or API key']
      },
      toolsLead: 'Plus free web tools.',
      toolsText:
        'The free web tools on this site handle small jobs — place IDs, review links, coordinate conversions, CSV merging — without installing anything.',
      toolsLabel: 'Free web tools'
    },
    principles: {
      kicker: 'Principles',
      title: { lead: 'Where the ', accent: 'boundary', tail: ' is' },
      lead: 'MapsGrab is deliberately conservative about data. These are the product rules we hold ourselves to.',
      publicData: {
        title: 'Public data only',
        text: 'Only publicly available business information — what any visitor to the page can already see.',
        visibleTag: 'Visible to any visitor',
        privateTag: 'Private accounts'
      },
      localFirst: {
        title: 'Local-first',
        text: 'With the extension and the free web tools, your settings and results live in your browser, not on our servers. The Online Scraper, the API and the MCP server run in our cloud, and Online Scraper results are saved to your account.',
        storage: 'local storage',
        rows: ['Settings', 'Results', 'Batch tasks']
      },
      backend: {
        title: 'Extension & free tools: four backend jobs',
        text: 'For the extension and the free web tools, our backend handles exactly four things: remote configuration, account and quota status, optional email/social enrichment, and minimal usage logs.',
        chips: ['Config', 'Quota', 'Enrichment', 'Usage logs']
      },
      never: {
        title: 'No ads. No trackers. No data sales.',
        text: 'No ads, no third-party trackers in the extension, and no selling or renting of data.',
        chips: ['Ads', 'Third-party trackers', 'Selling data']
      },
      inWriting: {
        kicker: 'In writing',
        title: 'Privacy Policy & Terms',
        text: 'Each of these rules is spelled out in the Privacy Policy and the Terms of Service.',
        link: 'Read the Privacy Policy'
      }
    },
    dataFlow: {
      kicker: 'How data moves',
      title: { lead: 'What stays with you, and what ', accent: 'reaches us', tail: '' },
      lead: 'The extension works on publicly displayed data and keeps results in your browser. For the extension and the free web tools, our backend only powers configuration, quotas, optional enrichment, and minimal usage logs. The Online Scraper, the API and the MCP server run in our cloud instead, and Online Scraper results are saved to your account.',
      source: {
        label: 'Source',
        title: 'Google Maps pages you visit',
        text: 'Public business data — name, address, phone, website, rating, reviews, photos.'
      },
      browser: {
        label: 'Your browser · local-first',
        storage: 'local storage · IndexedDB',
        rows: ['Settings', 'Extraction results', 'Batch task state'],
        badge: 'Stored in your browser'
      },
      backend: {
        label: 'MapsGrab backend · four purposes',
        lanes: [
          { title: 'Remote configuration', text: 'Page-structure presets that keep extraction working' },
          { title: 'Account & quota', text: 'Sign-in, plan status, monthly usage accounting' },
          { title: 'Email & social enrichment', text: 'Publicly listed contacts, when the feature is used' },
          { title: 'Usage logging', text: 'Minimal records of feature usage and errors' }
        ]
      },
      never: {
        label: 'Never',
        items: [
          'No ads',
          'No third-party trackers in the extension',
          'No selling or renting of personal data',
          'No collection of your browsing history beyond the Google Maps pages you extract from'
        ]
      },
      note: 'This website uses Google Analytics 4 to measure aggregate page usage — the extension itself contains no analytics.',
      noteLink: 'Read the Privacy Policy'
    },
    status: {
      kicker: 'Status',
      title: { lead: 'Early access, ', accent: 'free', tail: ' to start' },
      access: {
        title: 'Early access',
        text: 'The product is in early access. Store listings for Edge Add-ons and Firefox Add-ons are being finalized.',
        link: 'Install guide'
      },
      quota: {
        title: 'Free monthly quota',
        text: 'The extension works without an account within a free monthly quota.',
        link: "What's included"
      },
      paid: {
        title: 'Paid plans for heavier use',
        text: 'Paid plans raise the limits for heavier use. See the Pricing page for the current tiers.',
        link: 'See pricing'
      }
    }
  },
  contact: {
    navLabel: 'Contact',
    seoTitle: 'Contact MapsGrab Support',
    seoDescription: 'Contact MapsGrab about accounts, the browser extension, billing, tools, or privacy requests.',
    eyebrow: 'Contact MapsGrab',
    title: { lead: 'Talk to a ', accent: 'human', tail: '' },
    intro: 'Write to us and a person will read it. Support is currently handled directly by the team that builds MapsGrab.',
    emailCardLabel: 'Support email',
    copyEmail: 'Copy {email}',
    emailLabel: 'Email Support',
    emailSubject: 'MapsGrab support request',
    responseTimes:
      'We answer support email within one business day, usually faster. Privacy requests may take a few days when we need to verify account ownership first.',
    include: {
      title: 'What to include',
      text: 'A precise report helps us identify the affected workflow without asking for sensitive account information.',
      items: [
        'The page URL and the action you attempted',
        'Your browser name and version',
        'The exact error message and a screenshot when useful',
        'An order number for billing questions, without payment card details'
      ]
    },
    topics: {
      title: 'What we can help with',
      items: [
        'Installation and setup of the browser extension',
        'Account access and sign-in issues',
        'Quotas, subscriptions, renewals, and payment questions',
        'Web tool problems and feature requests',
        'Privacy and account data requests'
      ]
    },
    aboutLabel: 'About',
    privacyLabel: 'Privacy Policy',
    termsLabel: 'Terms of Service'
  }
}

const termsLastUpdatedISO = '2026-08-31'
const privacyLastUpdatedISO = '2026-10-16'
const serviceName = 'MapsGrab'
const supportEmail = DEVELOPER_EMAIL

export const legal: LegalContent = {
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

export const mcpOAuth: McpOAuthContent = {
  seoTitle: 'Authorize an AI app | MapsGrab',
  title: 'Connect an AI app to your account',
  intro: 'An app is asking to access your MapsGrab account. Allow it only if you started this connection yourself.',
  loading: 'Loading the connection request...',
  hostLabel: 'App address',
  selfDeclared: 'Name the app gives itself: {name}',
  loopbackTitle: 'Local app',
  loopbackText: 'This app runs on a computer, so its address cannot show who made it. Allow it only if you just started this connection from an app you trust.',
  loopbackHost: 'This computer',
  accountLabel: 'Signed in as',
  switchAccount: 'Switch account',
  permissionsTitle: 'If you allow it, this app can',
  permissions: [
    'Search for businesses and read their reviews and public photos on Google Maps.',
    'Use your API plan’s monthly request allowance.'
  ],
  revokeNote: 'You can disconnect it anytime under Connected apps in API management.',
  approve: 'Allow',
  deny: 'Deny and return to {host}',
  denyLoopback: 'Deny and return to the app',
  redirecting: 'Returning to the app...',
  invalidTitle: 'This connection request is invalid or has expired',
  invalidText: 'Go back to your AI app and start connecting again.',
  errorTitle: 'This connection request cannot be completed',
  errorReasons: {
    rate_limited: 'Too many connection attempts came from your network. Wait a few minutes before trying again.',
    invalid_client: 'The app is not registered, or its registration is incomplete.',
    invalid_redirect_uri: 'The return address sent by the app does not match the one it registered.',
    unsupported_response_type: 'The app asked for an authorization type that is not supported.',
    invalid_pkce: 'The app did not send the required security check (PKCE with S256).',
    invalid_resource: 'The app did not ask for access to the MapsGrab MCP server, or asked for a different server.',
    server_error: 'MapsGrab could not save this request right now. Please try again shortly.'
  },
  errorHint: 'Start the connection again from your AI app. If the problem continues, contact the app’s developer.',
  signInTitle: 'Sign in to continue',
  signInText: 'Sign in to the MapsGrab account you want to connect. This request will wait for you.',
  signIn: 'Sign in',
  loadFailed: 'Could not load the connection request. Check your network and try again.',
  decideFailed: 'Could not complete this action. Check your network and try again.',
  retry: 'Try again'
}

export const clink: ClinkReturnContent = {
  success: {
    waiting: {
      title: 'Payment submitted',
      description:
        'We are confirming your payment. The original tab will update automatically.'
    },
    confirmedCredits: {
      title: 'Credits added',
      description:
        'Your ClinkBill payment is confirmed and the Credits have been added. You can return to the original tab.'
    },
    confirmedSubscription: {
      title: 'Plan activated',
      description:
        'Your ClinkBill payment is confirmed and your MapsGrab plan is active. You can return to the original tab.'
    },
    failed: {
      title: 'Payment needs attention',
      description: 'We could not confirm this order. Return to the original tab and try again.'
    }
  },
  cancel: {
    title: 'Payment canceled',
    description: 'No payment was completed. You can return and choose another payment method.'
  }
}
