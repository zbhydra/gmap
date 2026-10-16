import type { DashboardContent } from './schema'

/**
 * 用户 Dashboard 工作区文案（en-US 基线，015 U2）。
 *
 * 侧栏三视图：在线导出历史、API / MCP 接入、订阅管理。渠道内操作指引自
 * Pricing 页迁入，随有效自动续费订阅的管理入口展示。
 */
export const dashboardContent: DashboardContent = {
  create: {
    title: 'Online Scraper',
    modeLabel: 'Search mode',
    modes: { keywords: 'Keywords', map: 'Map', regions: 'Regions' },
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
    invalid: 'Enter up to {limit} keywords, each no longer than 500 characters.',
    map: {
      latitude: 'Latitude',
      longitude: 'Longitude',
      radius: 'Radius (km)',
      spacing: 'Grid spacing (km)',
      sampleCount: '{count} / {limit} search locations',
      overLimit: 'Reduce the radius or increase grid spacing to stay within {limit} search locations.',
      chooseCenter: 'Choose a center on the map or enter coordinates.',
      mapLabel: 'Choose a search center on the map',
      tilesUnavailable: 'Map tiles could not load. You can still enter coordinates.',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    },
    region: {
      baseKeywords: 'Base keywords',
      basePlaceholder: 'coffee shop\nrestaurant',
      country: 'Country',
      state: 'State or region',
      citySearch: 'Find a city',
      cityPlaceholder: 'Type at least two letters',
      city: 'City',
      selectCountry: 'Select a country',
      allStates: 'All states or regions',
      selectCity: 'Select a city',
      loading: 'Loading locations...',
      loadFailed: 'Locations could not load. Please retry.',
      retry: 'Retry',
      addCountry: 'Add country',
      addState: 'Add state',
      addCity: 'Add city',
      selectedRegions: 'Selected locations',
      remove: 'Remove {name}',
      matchMode: 'Search phrasing',
      inMode: 'In',
      nearMode: 'Near',
      generate: 'Generate queries',
      finalQueries: 'Final queries',
      finalPlaceholder: 'Generated queries appear here. You can edit them.',
      attribution: 'Location data: GeoNames (CC BY)'
    }
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
      'Manage your API key, monthly request allowance and connected AI apps.',
    docsLink: 'View API products',
    signInPrompt: 'Sign in to manage your API access.',
    signInCta: 'Sign in',
    unreachable: 'Could not reach MapsGrab right now.',
    loading: 'Loading your API access...',
    loadFailed: 'Could not load your API access. Please try again.',
    retry: 'Retry',
    refresh: 'Refresh',
    keyTitle: 'API key',
    keyEmpty: 'You have not generated an API key yet.',
    generateKey: 'Generate API key',
    rotateKey: 'Replace API key',
    generatingKey: 'Generating...',
    keyOnce: 'Copy this key now. You will not be able to view it again after leaving or refreshing this page.',
    keyCreated: 'Created',
    rotateTitle: 'Replace your API key?',
    rotateMessage: 'Your current key will stop working immediately. Update any apps that use it with the new key.',
    cancel: 'Cancel',
    copyKey: 'Copy API key',
    copied: 'Copied',
    copyFailed: 'Could not copy. Select the text and copy it manually.',
    keyFailed: 'Could not generate an API key. Please try again.',
    usageTitle: 'Monthly API usage',
    usageValue: '{used} / {total} requests',
    usagePeriod: 'Period: {period}',
    quotaExhausted: 'Your monthly request allowance is exhausted.',
    quotaReset: 'Resets on the 1st of each month in New York time. API and MCP share this allowance.',
    planTitle: 'API plan',
    managePlan: 'Manage subscriptions',
    connectionsTitle: 'Connection addresses',
    apiUrl: 'API base URL',
    mcpUrl: 'MCP server URL',
    mcpHint: 'Add this URL in your MCP client. Sign in and approve the connection when it opens this website.',
    mcpUnavailable: 'The MCP connection address is not available yet.',
    copyUrl: 'Copy URL',
    grants: {
      title: 'Connected apps',
      description: 'Apps you have allowed to search businesses and read reviews using your API allowance.',
      loading: 'Loading connected apps...',
      empty: 'No apps are connected.',
      loadFailed: 'Could not load connected apps. Please try again.',
      selfDeclared: 'Name the app gives itself: {name}',
      createdLabel: 'Connected (ET)',
      refreshedLabel: 'Last refreshed (ET)',
      notRefreshed: 'Not yet',
      revoke: 'Disconnect',
      revokeTitle: 'Disconnect this app?',
      revokeMessage: '{host} will lose access immediately and will need your approval to connect again.',
      revokeFailed: 'Could not disconnect this app. Please try again.',
      paginationLabel: 'Connected apps pages',
      pageOf: 'Page {page} of {pages}'
    }
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
