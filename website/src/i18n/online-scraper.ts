import type { OnlineScraperPageContent } from './schema'

/**
 * Online Scraper 介绍页文案（en-US 基线，设计稿 online-scraper.html）。
 *
 * 事实口径：014 feat 与 tech（关键词 / 地图 / 地区三种模式、每任务关键词上限 2 / 5 / 10 / 20 / 50、
 * 地图模式 50 个搜索位置、每任务 60 分钟采集期限、完成后按交付行计量、付费档默认补全联系方式）。
 * 与 Dashboard 相同的界面文案（表单、历史列表、地图与地区输入）不在这里，直接消费 dashboard 段。
 */
export const onlineScraperContent: OnlineScraperPageContent = {
  seo: {
    title: 'Online Google Maps Scraper — Run Extraction in the Cloud | MapsGrab',
    description:
      'Run Google Maps keyword searches in the cloud, collect business data, and download CSV files or a ZIP bundle.'
  },
  hero: {
    announce: { badge: '3 modes', text: 'Keywords, a map area or whole regions' },
    title: { lead: 'Google Maps extraction ', accent: 'in the cloud,', tail: ' no install' },
    lead: 'Submit keywords, collect business details in the cloud, and download CSV files or a ZIP bundle from your dashboard.',
    primaryCta: 'Start scraping',
    pricingCta: 'View pricing',
    meta: ['1,000 free records / month', 'Works in any browser', 'One CSV per keyword, plus a ZIP'],
    theater: {
      files: '{count} CSV files · Saved to Downloads',
      zip: 'ZIP',
      parallelChip: { label: 'Keywords run', value: 'In parallel' },
      billingChip: { label: 'Billed by', value: 'Delivered rows' }
    }
  },
  facts: {
    caption: 'The Online Scraper at a glance',
    items: [
      { value: 36, label: 'columns in every CSV, from name to Place ID' },
      { value: 6, label: 'social profile columns on paid plans' },
      { value: 50, label: 'search locations per map-mode task' },
      { value: 60, suffix: ' min', label: 'collection window for each task' },
      { value: 1000, label: 'free records every month' }
    ]
  },
  flow: {
    head: {
      kicker: 'How it works',
      title: { lead: 'From a quick preview to a ', accent: 'full export', tail: '' },
      lead: 'Try one keyword on the homepage without an account. When you want the whole list, sign in and run it as a task in your Dashboard.'
    },
    steps: [
      {
        title: 'Preview on the homepage',
        description: 'One keyword, no account. See how many businesses the first results page holds, with the first 3 rows.'
      },
      {
        title: 'Sign in',
        description: 'Previews are not saved and never use your quota. After signing in, you submit the keyword again.'
      },
      {
        title: 'Create the task',
        description:
          'In Dashboard › Online Scraper, enter one keyword per line — or let a map area or regions build the list.'
      },
      {
        title: 'Keywords run in parallel',
        description:
          'The task stays Processing until every keyword finishes. Your history refreshes every 5 seconds meanwhile.'
      },
      {
        title: 'Download',
        description: 'Grab a CSV for each keyword from the task details, or every file at once as one ZIP.'
      }
    ],
    lock: 'Sign in for the full list',
    email: 'you@company.com',
    links: { preview: 'Try the homepage preview', dashboard: 'Open Dashboard › Online Scraper' }
  },
  modes: {
    head: {
      kicker: 'Search modes',
      title: { lead: 'Three ways to say ', accent: 'where to look', tail: '' },
      lead: 'Type keywords line by line, sample a map area around a center point, or turn countries, states and cities into ready-made queries.'
    },
    tabsLabel: 'Search mode',
    notes: {
      keywords: 'One keyword per line, up to your plan’s limit',
      map: 'Sample a circle around a center point',
      regions: 'Countries, states and cities from GeoNames'
    },
    keywords: {
      hint: 'One keyword per line. Blank lines and duplicates are dropped before counting, and every keyword gets its own CSV.',
      blank: 'Blank line · skipped',
      duplicate: 'Duplicate · skipped',
      limitsTitle: 'Keywords per task',
      limitsCaption: 'by Online plan',
      limitsHint:
        'Start scraping stays disabled while the list is empty, over your plan’s limit, or your monthly quota is used up.'
    },
    map: {
      formula: '{keywords} keywords × {points} grid points',
      scale: '{value} km',
      facts: [
        'Points are searched from the center outward.',
        'The circle only places search centers — results are not clipped to it.',
        'A business found at several points is kept once per keyword.'
      ]
    },
    regions: { hint: 'You can edit the generated queries before submitting. Each one counts as a keyword.' }
  },
  results: {
    head: {
      kicker: 'Results',
      title: { lead: 'One CSV per keyword, ', accent: 'one ZIP', tail: ' per task' },
      lead: 'Every keyword gets its own CSV with all 36 columns. Download files one by one from the task details, or the whole task as a single ZIP.'
    },
    zipMeta: 'Task ZIP · {count} CSV files',
    rows: '{count} rows',
    headersOnly: 'Headers only',
    notes: [
      'Row 1 keeps the fixed field names, so imports and scripts keep working.',
      'Row 2 labels each column in the interface language you used when creating the task.',
      'A keyword that finds nothing still gets a file with both header rows.',
      'The label row never counts toward your records.'
    ],
    language: 'Task language: English',
    rowLabel: 'Row',
    legend: { fields: 'Row 1 · field names', labels: 'Row 2 · task language', data: 'Row 3+ · businesses' },
    more: '+{count} more columns',
    csvLabels: {
      Name: 'Name',
      Fulladdress: 'Full address',
      Categories: 'Categories',
      Phone: 'Phone',
      'Review Count': 'Review Count',
      'Average Rating': 'Average Rating',
      Website: 'Website',
      Emails: 'Email',
      'Search Keyword': 'Search Keyword'
    }
  },
  features: {
    head: {
      kicker: 'Capabilities',
      title: { lead: 'What the Online Scraper ', accent: 'does', tail: '' },
      lead: 'Business details collected in the cloud, with optional emails and social profiles on paid plans.'
    },
    items: [
      {
        id: 'keywords',
        title: 'Keyword tasks',
        description:
          'Submit business types and locations as separate keywords. Your plan determines the keyword limit and monthly record quota.',
        meta: '2 · 5 · 10 · 20 · 50 keywords per task'
      },
      {
        id: 'history',
        title: 'Task history',
        description: 'Follow task progress and view the record count for each keyword in your dashboard.',
        meta: 'Processing → Completed'
      },
      {
        id: 'details',
        title: 'Business details',
        description:
          'Collect names, addresses, phone numbers, websites, ratings, hours, coordinates, and place identifiers when available.',
        meta: '36 columns per business'
      },
      {
        id: 'enrichment',
        title: 'Email and social enrichment',
        description:
          'With a paid Online plan, business websites are checked for email addresses and social profiles by default. You can turn this off for each task.',
        meta: 'Paid plans · on by default'
      },
      {
        id: 'downloads',
        title: 'CSV and ZIP downloads',
        description: 'Download a CSV for each keyword or all available files as one ZIP bundle.',
        meta: '{item}_{keyword}.csv · {task}.zip'
      },
      {
        id: 'browser',
        title: 'Nothing to install',
        description:
          'Runs in the cloud from any browser — Edge, Firefox, or anything else. Download results from your task history.',
        meta: 'Edge · Firefox · any browser'
      }
    ]
  },
  usage: {
    head: {
      kicker: 'Usage',
      title: { lead: 'Billed by the rows ', accent: 'you actually get', tail: '' },
      lead: 'Online tasks are metered by delivered business rows once a task completes. Nothing is set aside when you submit, and the label row in each CSV is never counted.'
    },
    checks: [
      'Submitting a task reserves nothing from your quota',
      'A task that is already running finishes, even past your remaining quota',
      'Once the quota is used up, new tasks can’t be submitted',
      'Usage resets on the 1st in New York time; unused records don’t roll over'
    ],
    mock: {
      recordsLabel: 'Records this month',
      left: '{count} left',
      exhausted: 'Quota exhausted',
      task: 'Task {id}…',
      pending: 'Delivered so far · counted when the task completes',
      counted: 'Counted toward this month',
      rows: '{count} rows',
      running: 'Running',
      delta: '+{count} records'
    }
  },
  plans: {
    head: {
      kicker: 'Online Scraper plans',
      title: { lead: 'Cloud extraction, ', accent: 'priced by records', tail: '' },
      lead: 'Run the MapsGrab engine on our infrastructure. A record is one business row delivered; paid plans include email and social enrichment at no extra record cost.'
    },
    specs: {
      keywords: 'Keywords per task',
      contacts: 'Emails & social',
      included: 'On by default',
      excluded: 'Not included'
    },
    note: 'One-time payment covering one natural month — Online plans do not auto-renew. Usage resets on the 1st in New York time and unused records do not roll over.',
    compare: 'Compare all plans'
  },
  faq: {
    kicker: 'FAQ',
    title: { lead: 'Online Scraper ', accent: 'questions', tail: '' },
    lead: 'The short answers. Anything else, support is one email away.',
    contact: 'Contact support',
    items: [
      {
        question: 'How is the Online Scraper different from the extension?',
        answer:
          'The extension collects data in your browser. Online Scraper runs keyword tasks in the cloud and delivers the results to your dashboard.'
      },
      {
        question: 'Where does the data come from, and is it legal to collect?',
        answer:
          'MapsGrab only collects information that is publicly displayed on Google Maps — the same details any visitor can read. We do not access private accounts, gated content, or non-public data.'
      },
      {
        question: 'What formats can I export to?',
        answer:
          'Each keyword produces a CSV file. Download individual files or a ZIP bundle from the task history.'
      },
      {
        question: 'How much does it cost?',
        answer:
          'The Online Scraper follows the MapsGrab plans on the Pricing page, including the free monthly quota of records. Paid plans raise the limits when you need more.'
      },
      {
        question: 'Do I need a paid plan for emails and social profiles?',
        answer:
          'Online Free does not include email or social media enrichment. Paid Online plans include it by default, and you can turn it off for each task. The choice is fixed once the task is submitted.'
      },
      {
        question: 'How long can a task run?',
        answer:
          'Each task has a 60-minute collection window. When it closes, keywords that already found businesses still deliver them, along with any emails and social profiles found so far.'
      },
      {
        question: 'Is my homepage preview saved when I sign in?',
        answer:
          'No. The homepage preview is a quick look that is not stored. After you sign in, open Online Scraper in your Dashboard and submit the keyword again as a full task.'
      }
    ]
  },
  cta: {
    kicker: 'Get started',
    title: { lead: 'Queue your first ', accent: 'cloud task', tail: '' },
    lead: 'Submit keywords, follow your task progress, and download business data from your dashboard.',
    primary: 'Start scraping',
    secondary: 'View pricing',
    note: 'Free monthly quota included. No credit card.'
  }
}
