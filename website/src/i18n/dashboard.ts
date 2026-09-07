import type { DashboardContent } from './schema'

/**
 * 用户 Dashboard 工作区文案（en-US 基线，015 U2）。
 *
 * 侧栏三视图：在线导出历史（列表 / 明细 / CSV 与 ZIP 下载）、API 管理
 * （本轮未开放）、订阅管理（三线摘要与渠道管理）。渠道内操作指引自
 * Pricing 页迁入，随有效自动续费订阅的管理入口展示。
 */
export const dashboardContent: DashboardContent = {
  create: {
    title: 'Online Scraper',
    keywords: 'Keywords',
    placeholder: 'coffee shop in Portland\nrestaurant in Austin',
    count: '{count} / {limit} keywords',
    contacts: 'Find emails and social profiles',
    contactsPaid: 'Available with a paid Online plan.',
    usage: '{used} / {total} records this month',
    reset: 'Monthly quota resets on the 1st in New York time.',
    loading: 'Loading your limits...',
    optionsFailed: 'Could not load your task limits. Please retry.',
    submit: 'Start scraping',
    submitting: 'Submitting...',
    failed: 'Task submission failed. Refresh the history before trying again.',
    exhausted: 'Your monthly quota is exhausted.',
    invalid: 'Enter up to {limit} keywords, each no longer than 500 characters.'
  },
  seo: {
    title: 'Dashboard | MapsGrab',
    description: 'Manage your MapsGrab exports, API access and subscriptions in one workspace.'
  },
  shell: {
    loading: 'Loading your workspace...',
    retry: 'Retry',
    navHistory: 'Online Scraper',
    navApi: 'API management',
    navSubscriptions: 'Subscriptions',
    openMenu: 'Open workspace menu',
    closeMenu: 'Close workspace menu'
  },
  account: {
    menuButtonLabel: 'Open account menu',
    menuLabel: 'Account menu',
    logout: 'Log out'
  },
  history: {
    title: 'Online export history',
    description:
      'Tasks you ran on the Online Scraper, newest first. Times are shown in Eastern Time (New York).',
    refresh: 'Refresh',
    loading: 'Loading your exports...',
    loadFailed: 'Failed to load your export history.',
    retry: 'Retry',
    emptyTitle: 'No exports yet',
    emptyHint: 'Run a task on the Online Scraper and it will show up here.',
    columns: {
      taskNo: 'Task',
      createdAt: 'Created (ET)',
      keywords: 'Keywords',
      processed: 'Processed',
      records: 'Records',
      status: 'Status'
    },
    status: {
      processing: 'Processing',
      completed: 'Completed'
    },
    timezone: 'ET',
    pagination: {
      previous: 'Previous',
      next: 'Next',
      summary: '{from}–{to} of {total}'
    },
    detail: {
      show: 'Details',
      hide: 'Hide details',
      loading: 'Loading keywords...',
      loadFailed: 'Failed to load keywords for this task.',
      keyword: 'Keyword',
      records: 'Records',
      downloadCsv: 'CSV'
    },
    downloadZip: 'Download ZIP',
    downloading: 'Preparing...',
    downloadUnavailable: 'No downloadable file for this item. It may have expired.',
    downloadFailed: 'The download could not be started. Please try again.',
    signInPrompt: 'Sign in to see your Online export history.',
    signInCta: 'Sign in',
    unreachable: 'Could not reach MapsGrab right now.'
  },
  api: {
    title: 'API management',
    description:
      'The MapsGrab API is not open for self-service keys yet. Your API quota is managed with your API plan — product details stay on the API pages.',
    badge: 'Not open yet',
    docsLink: 'View API products',
    signInPrompt: 'Sign in to manage your API access.',
    signInCta: 'Sign in',
    unreachable: 'Could not reach MapsGrab right now.'
  },
  subscriptions: {
    title: 'Subscriptions',
    description:
      'Plans and renewal status for the Online Scraper, the browser extension and the API. Buy or upgrade on the Pricing page.',
    loading: 'Loading your subscriptions...',
    loadFailed: 'Failed to load your subscriptions.',
    retry: 'Retry',
    lines: {
      online: 'Online Scraper',
      extension: 'Browser Extension',
      api: 'API'
    },
    planLabel: 'Plan',
    expiresLabel: 'Renews / expires',
    noExpiry: 'No expiry',
    free: 'Free',
    unavailable: 'Temporarily unavailable',
    autoRenewOn: 'Auto-renewal on',
    autoRenewOff: 'Auto-renewal off',
    subscribeCta: 'Choose a plan',
    manageSubscription: 'Manage subscription',
    managingSubscription: 'Opening...',
    signInPrompt: 'Sign in to see your subscriptions.',
    signInCta: 'Sign in',
    unreachable: 'Could not reach MapsGrab right now.'
  },
  cancelGuide: {
    title: 'Manage your subscription at the payment provider',
    paths: [
      {
        provider: 'PayPal',
        steps: [
          'Sign in to PayPal and open Settings.',
          'Go to Payments, then Automatic Payments.',
          'Select MapsGrab and choose Cancel.'
        ]
      },
      {
        provider: 'ClinkBill',
        steps: [
          'Open the Customer Portal link from your purchase email.',
          'Sign in and select your MapsGrab subscription.',
          'Choose Cancel.'
        ]
      }
    ],
    closeLabel: 'Close'
  }
}
