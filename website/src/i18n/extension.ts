import type { ExtensionPageContent } from './schema'

/**
 * 插件产品页文案（en-US 基线，设计稿 extension.html）。
 *
 * 事实口径：013 feat 与插件导出代码（36 列、11 个评论列、6 个社媒、批量 ≤500 项 / 150 个任务、
 * 90 秒卡住跳过、导出 CSV / JSON）。安装与购买入口灰化与否只由 lib/capabilities.ts 决定，
 * 文案不写「审核中 / 已上线」这类随开关变化的状态。Drive / HubSpot（A10 待确定）与跨次去重
 * 不在 013 交付范围，本文件文案不宣传（套餐卡卖点逐字取自 pricing.ts）；记录数按插件实际计量口径
 * （商家、评论、照片各算一条）。
 */
export const extensionContent: ExtensionPageContent = {
  seo: {
    title: 'MapsGrab for Edge & Firefox — Google Maps Extractor Extension',
    description:
      'Extract 36 columns of business data, reviews, and photos from Google Maps, enrich records with emails and social links, run batch tasks, and export to CSV or JSON.'
  },
  hero: {
    announce: { badge: 'v{version}', text: 'Pre-release for Edge, Firefox & Chromium' },
    title: { lead: 'The Google Maps extractor for ', accent: 'Edge & Firefox', tail: '' },
    lead: 'Open any Google Maps search or business page and grab what is publicly shown there — business data, reviews, photos and contact details. Everything exports to CSV or JSON, right from your browser.',
    edgeCta: 'Install for Edge',
    browsersCta: 'Chrome & Firefox',
    meta: ['No account required', '1,000 free records / month', 'Exports stay on your machine'],
    theater: {
      panelLabel: 'MapsGrab panel preview',
      extensionActive: 'MapsGrab is active on this page',
      dock: 'Dock left / right',
      filters: ['Open now', 'Top rated', 'Price'],
      open: 'Open',
      closes: 'Closes {time}',
      endOfList: 'You’ve reached the end of the list.',
      start: 'Start Extracting',
      extracting: 'Extracting {count}…',
      pause: 'Pause',
      complete: 'Extract complete.',
      reset: 'Reset',
      kpis: { phones: 'phones', websites: 'websites', emails: 'emails' },
      exportCta: 'Export Detailed List - {count} (.CSV)',
      saved: 'Saved to Downloads',
      scrollChip: { label: 'Auto-scroll', value: 'Human-paced, 5–10 s' },
      dedupeChip: { label: 'Deduplicated', value: 'by Place ID' }
    }
  },
  facts: {
    caption: 'The extension at a glance',
    items: [
      { value: 36, label: 'columns per business, from name to Place ID' },
      { value: 11, label: 'review columns, owner replies included' },
      { value: 6, label: 'social networks matched per website' },
      { value: 1000, label: 'free records every month, no account needed' },
      { value: 500, label: 'keywords or review URLs per batch task' }
    ]
  },
  views: {
    head: {
      kicker: 'Where it works',
      title: { lead: 'One panel for every ', accent: 'Maps view', tail: '' },
      lead: 'The MapsGrab panel appears right on Google Maps. Search results, business pages and saved lists each get the right extraction mode — no copy-paste, no tab juggling.'
    },
    search: {
      title: 'Search results',
      description:
        'Press Start Extracting on any search. MapsGrab scrolls the results list at a human pace and collects each listing as it loads.'
    },
    place: {
      title: 'Business pages',
      description:
        'On a business page, the Reviews & Photos tab pages through reviews and photo albums — reviews export with 11 columns, photos as URL lists.',
      tabs: ['Overview', 'Reviews & Photos'],
      reviewsCta: 'Start Extracting Reviews',
      photosCta: 'Start Extracting Photos',
      reviewsCount: '{count} reviews',
      photosCount: '{count} photos'
    },
    saved: {
      title: 'Saved lists',
      description:
        'Open a saved list and press Start once. MapsGrab opens each place in turn and collects it — no per-item clicks.',
      listName: 'Favorites · {count} places'
    }
  },
  features: {
    head: {
      kicker: 'Features',
      title: { lead: 'Everything a Maps page shows, ', accent: 'structured', tail: '' },
      lead: 'One extraction schema across search results and business pages, tuned against the current Google Maps interface and updated remotely when Google changes.'
    },
    tabsLabel: 'Extension features',
    tabs: [
      { id: 'business', title: 'Business data', description: '36 columns per business, captured as the list scrolls.' },
      { id: 'reviews', title: 'Reviews', description: 'Reviews with owner replies, paged automatically.' },
      { id: 'photos', title: 'Photos', description: 'Album photos as ready-to-use URL lists.' },
      { id: 'enrichment', title: 'Email & social enrichment', description: 'Direct contact channels from the official website.' },
      { id: 'batch', title: 'Batch tasks', description: 'A queue of keywords or review URLs, walked item by item.' },
      { id: 'export', title: 'Export', description: 'CSV or JSON, saved straight to your machine.' }
    ],
    business: {
      claimed: 'Claimed',
      fields: {
        phone: 'Phone',
        website: 'Website',
        rating: 'Average rating',
        hours: 'Opening hours',
        timeZone: 'Time zone',
        coordinates: 'Coordinates',
        placeId: 'Place ID',
        mapsUrl: 'Google Maps URL'
      },
      reviewCount: '{count} reviews',
      columns: '{count} columns per business',
      reserved: 'Plus Code reserved',
      more: '+{count} more'
    },
    reviews: {
      title: 'Reviews',
      columns: '{count} columns',
      ownerReply: 'Response from the owner',
      loading: 'Loading the next page of reviews'
    },
    photos: { streetView: 'Street View · filtered' },
    enrichment: { website: 'Official website', moreNetworks: 'X, YouTube and TikTok checked too' },
    batch: {
      complete: '{count} complete',
      stuck: '{count} stuck',
      total: '{count} total',
      done: 'Complete · {count}',
      skipped: 'No progress for 90 s · skipped',
      running: 'Extracting…',
      queued: 'Queued',
      autoExport: 'Exports automatically when the task finishes'
    },
    files: {
      formats: ['.CSV', '.JSON'],
      fileMeta: '{rows} rows · {selected} of {total} columns selected · deduplicated by Place ID',
      destinations: [
        { title: 'Downloads', description: 'Saved by your browser' },
        { title: 'Column picker', description: 'Export only the columns you need' },
        { title: 'Auto-download', description: 'Saves as soon as extraction finishes' }
      ]
    }
  },
  batch: {
    head: {
      kicker: 'Batch tasks',
      title: { lead: 'Queue the list. ', accent: 'Walk away.', tail: '' },
      lead: 'Paste up to 500 keywords or review URLs into one task. MapsGrab walks through them item by item with live progress, skips anything that stalls, and exports automatically when the task finishes.'
    },
    checks: [
      'Keyword tasks run one Maps search per keyword',
      'Review-URL tasks collect reviews business by business',
      'Task state is saved to disk — it picks up again after a browser restart',
      'Up to 150 saved tasks, one batch running at a time'
    ],
    mock: {
      tabs: ['Bulk Keyword Data Tool', 'Bulk Google Reviews Extractor'],
      taskName: 'Task Name',
      taskPlaceholder: 'e.g. 100 keywords, design agency',
      keywords: 'Keywords · one per line',
      lineCount: '{count} / {limit}',
      start: 'Start Extracting',
      columns: { task: 'Task Name', status: 'Status', actions: 'Actions' },
      running: 'Running',
      complete: 'Complete',
      progress: '{done} / {total}',
      progressStuck: '{done} / {total} · {stuck} stuck',
      progressExported: '{done} / {total} · exported',
      lines: { run: 'extracting…', done: 'complete', stuck: 'stuck · skipped' },
      toast: 'Task complete — exported',
      chip: { label: 'Task state', value: 'Saved to disk' }
    }
  },
  privacy: {
    head: {
      kicker: 'Local-first',
      title: { lead: 'Your results stay ', accent: 'in your browser', tail: '' },
      lead: 'Settings and results are stored locally. Our servers only handle remote configuration, account and quota status, optional email and social enrichment, and minimal usage logs.'
    },
    checks: [
      'Exports are generated on your machine',
      'Column selection and Place ID deduplication run locally before the file is saved',
      'Remote configuration keeps the panel current when Google Maps changes — no reinstall',
      'If something can’t be read, the panel shows an error instead of failing silently'
    ],
    diagram: {
      browser: 'Your browser',
      servers: 'MapsGrab servers',
      nodes: {
        mapsTab: 'Google Maps tab',
        panel: 'MapsGrab panel',
        storage: 'Local storage',
        exports: 'Your exports',
        config: 'Remote config',
        quota: 'Account & quota',
        enrichment: 'Enrichment'
      },
      flows: {
        rows: 'business rows',
        rules: 'rules',
        usage: 'usage',
        websites: 'business websites → emails & socials'
      }
    }
  },
  install: {
    head: {
      kicker: 'Install',
      title: { lead: 'Install ', accent: 'MapsGrab', tail: '' },
      lead: 'Edge and Firefox install from their official add-on stores. Chrome and other Chromium browsers load the release zip directly — the same build, step by step below.'
    },
    stores: [
      {
        id: 'edge',
        name: 'Microsoft Edge',
        store: 'Edge Add-ons',
        note: 'Install from Microsoft’s official add-on store and get updates automatically.',
        cta: 'Open Edge Add-ons'
      },
      {
        id: 'firefox',
        name: 'Mozilla Firefox',
        store: 'Firefox Add-ons (AMO)',
        note: 'Install from Mozilla’s official add-on store so the extension stays put across restarts.',
        cta: 'Open Firefox Add-ons'
      }
    ],
    zip: {
      title: 'Direct install (release zip)',
      description:
        'Every release ships a zip you can load by hand — the install route for Chrome, Brave and other Chromium browsers.',
      button: 'Download release zip',
      meta: 'Version {version} · pre-release'
    },
    browserLabel: 'Browser',
    channels: [
      {
        id: 'chromium',
        tab: 'Edge & Chromium',
        note: 'Edge, Chrome, Brave and other Chromium browsers',
        steps: [
          {
            title: 'Download and unzip',
            description: ['Download the release zip and unzip it to a folder you keep.'],
            shot: 'The release zip in the browser downloads bar'
          },
          {
            title: 'Open the extensions page',
            description: ['In Edge, Chrome, Chromium or Brave, open the extensions management page.'],
            shot: 'The extensions management page'
          },
          {
            title: 'Enable Developer mode',
            description: ['Toggle Developer mode in the extensions page sidebar.'],
            shot: 'Developer mode toggled on'
          },
          {
            title: 'Load the unpacked folder',
            description: [
              'Click “Load unpacked” and select the unzipped folder. The MapsGrab panel appears on Google Maps search pages.'
            ],
            shot: 'Load unpacked with the MapsGrab card added'
          }
        ]
      },
      {
        id: 'firefox',
        tab: 'Firefox',
        note: 'Temporary add-on until the Firefox Add-ons listing is live',
        steps: [
          {
            title: 'Download and unzip',
            description: ['Download the release zip and unzip it to a folder you keep.'],
            shot: 'The release zip in the browser downloads bar'
          },
          {
            title: 'Open the debugging page',
            description: ['Navigate to ', { code: 'about:debugging' }, ', then choose “This Firefox”.'],
            shot: 'about:debugging with “This Firefox” selected'
          },
          {
            title: 'Load the add-on',
            description: [
              'Click “Load Temporary Add-on…” and pick ',
              { code: 'manifest.json' },
              ' inside the unzipped folder. A temporary add-on unloads when Firefox restarts — the Firefox Add-ons listing makes it permanent once live.'
            ],
            shot: 'Load Temporary Add-on picking manifest.json'
          }
        ]
      }
    ],
    shotKicker: 'Screenshot',
    help: {
      title: 'Installation trouble?',
      description: 'Send us the browser name and what you saw — we will get you unblocked.',
      cta: 'Contact support'
    },
    notes: {
      kicker: 'Release notes',
      version: '0.1.0',
      status: 'Pre-release',
      date: 'August 2026',
      items: [
        'First pre-release of the MapsGrab extension',
        'Google Maps search extraction with automatic scrolling and the 36-column schema',
        'Review and photo extraction from business pages',
        'Email and social media enrichment per business',
        'Batch keyword and review-URL tasks with on-disk task state',
        'CSV / JSON export with field selection and Place ID deduplication',
        'Builds for Microsoft Edge and Firefox'
      ]
    }
  },
  plans: {
    head: {
      kicker: 'Extension plans',
      title: { lead: 'One extension, three ', accent: 'plans', tail: '' },
      lead: 'Every row the extension collects — a business, a review or a photo — counts as one record. All plans include reviews, photos and batch tasks; paid plans export all 36 columns, including email and social enrichment, with a larger monthly volume.'
    },
    note: 'Monthly usage resets on the 1st in New York time; unused records do not roll over.',
    compare: 'Compare all plans'
  },
  faq: {
    kicker: 'FAQ',
    title: { lead: 'Extension ', accent: 'questions', tail: '' },
    lead: 'The short answers. Anything else, support is one email away.',
    contact: 'Contact support',
    items: [
      {
        question: 'Is the extension free to use?',
        answer:
          'Yes. The extension works without an account and includes 1,000 records every month. Paid plans on the Pricing page add all 36 columns with email and social media enrichment, and raise the monthly volume.'
      },
      {
        question: 'Which browsers are supported?',
        answer:
          'MapsGrab is built for Microsoft Edge (Edge Add-ons) and Firefox (Firefox Add-ons). Chrome and other Chromium-based browsers load the extension directly from the release zip — see the install steps above.'
      },
      {
        question: 'Do I need to sign in?',
        answer:
          'No. Core extraction works without an account. Quota is counted per signed-in account, or per browser device when you are not signed in — sign in with the account that owns a plan so its higher volume applies.'
      },
      {
        question: 'What counts as a record?',
        answer:
          'Each row the extension collects counts as one record: a business from a search or saved list, a review, or a photo. Email and social enrichment does not add records.'
      },
      {
        question: 'What happens when Google Maps changes?',
        answer:
          'Extraction rules ship as remote configuration, so fixes reach the panel without reinstalling the extension. If a page can’t be read, the panel shows an error instead of failing silently.'
      },
      {
        question: 'Does MapsGrab see the data I collect?',
        answer:
          'Your settings and results are stored locally in your browser. Our servers only handle remote configuration, account and quota status, optional email and social enrichment, and minimal usage logs.'
      },
      {
        question: 'Where does the data come from, and is it legal to collect?',
        answer:
          'MapsGrab only collects information that is publicly displayed on the Google Maps pages you visit — the same details any visitor can read. We do not access private accounts, gated content, or non-public data.'
      }
    ]
  },
  cta: {
    kicker: 'Get started',
    title: { lead: 'Grab your first list ', accent: 'today', tail: '' },
    lead: 'Install the extension, search Google Maps, and export a clean spreadsheet — no account required.',
    primary: 'Install MapsGrab',
    secondary: 'Compare plans',
    note: 'Free monthly quota included. No credit card.'
  }
}
