/**
 * 国际化翻译 Key 常量
 *
 * 提供类型安全的翻译 key，避免硬编码字符串
 * 遵循项目规范：IDE 友好、静态检测友好
 */

/**
 * 翻译键常量
 */
export const I18N_KEYS = {
  /** 扩展名称 */
  EXTENSION_NAME: 'extensionName',
  /** 扩展描述 */
  EXTENSION_DESCRIPTION: 'extensionDescription',
  /** 操作标题 */
  ACTION_TITLE: 'actionTitle',

  /** App 相关 */
  APP: {
    /** 应用标题 */
    TITLE: 'app.title',
    START_HINT: 'app.startHint',
    OPEN_MAPS: 'app.openMaps',
    BULK_KEYWORDS: 'app.bulkKeywords',
    BULK_REVIEWS: 'app.bulkReviews',
    HELP: 'app.help',
    CONTACT: 'app.contact',
    PLANS: 'app.plans',
    MANAGE_SUBSCRIPTION: 'app.manageSubscription'
  },

  /** 应用错误相关 */
  APP_ERROR: {
    /** 错误标题 */
    TITLE: 'app.error.title',
    /** 重试按钮 */
    RETRY: 'app.error.retry',
    /** 关闭按钮 */
    DISMISS: 'app.error.dismiss'
  },

  /** API 错误提示。 */
  API_ERROR: {
    /** 后端错误码无翻译或网络错误时的用户可见兜底。 */
    FALLBACK: 'apiError.fallback'
  },

  /** 批量工作页启动中转页。 */
  BULK_LAUNCH: {
    /** 页面标题。 */
    TITLE: 'bulkLaunch.title',
    /** 缺少 url 参数。 */
    MISSING_URL: 'bulkLaunch.missingUrl',
    /** url 参数不可解析。 */
    INVALID_URL: 'bulkLaunch.invalidUrl',
    /** 目标不在允许列表。 */
    TARGET_NOT_ALLOWED: 'bulkLaunch.targetNotAllowed'
  },

  /** 认证相关 */
  AUTH: {
    /** 登录按钮 */
    LOGIN: 'auth.login',
    /** 退出登录 */
    LOGOUT: 'auth.logout'
  },

  /** 订阅相关 */
  SUBSCRIPTION: {
    /** 订阅状态 */
    STATUS: 'subscription.status',
    /** 订阅周期 */
    PERIOD: 'subscription.period',
    /** 过期时间 */
    EXPIRES_AT: 'subscription.expiresAt',
    /** 激活订阅 */
    ACTIVATE: 'subscription.activate',
    /** 免费版 */
    FREE: 'subscription.free',
    /** 按月订阅 */
    MONTHLY: 'subscription.monthly',
    /** 登录后查看 */
    LOGIN_TO_VIEW: 'subscription.loginToView',
    /** 续费按钮 */
    RENEW: 'subscription.renew',
    /** 尚未开通提示 */
    NOT_AVAILABLE: 'subscription.notAvailable',
    /** 已复制 */
    COPIED: 'subscription.copied',
    /** 复制失败 */
    COPY_FAILED: 'subscription.copyFailed'
  },

  /** Maps 采集面板（013 A1，content script 注入 Maps 页） */
  MAPS_PANEL: {
    RELOAD: 'mapsPanel.reload',
    OPEN_TAB_ERROR: 'mapsPanel.openTabError',
    TITLE: 'mapsPanel.title',
    COMPLETE: 'mapsPanel.complete',
    PLACE_ERROR: 'mapsPanel.placeError',
    IDLE_HINT: 'mapsPanel.idleHint',
    START: 'mapsPanel.start',
    EXTRACTING: 'mapsPanel.extracting',
    PAUSE: 'mapsPanel.pause',
    RESUME: 'mapsPanel.resume',
    EXPORT: 'mapsPanel.export',
    RESET: 'mapsPanel.reset',
    TOGGLE_POSITION: 'mapsPanel.togglePosition',
    PARSE_ERROR: 'mapsPanel.parseError',
    REVIEWS_SECTION: 'mapsPanel.reviewsSection',
    PHOTOS_SECTION: 'mapsPanel.photosSection',
    START_REVIEWS: 'mapsPanel.startReviews',
    START_PHOTOS: 'mapsPanel.startPhotos',
    COLLECTING_NEW_TAB: 'mapsPanel.collectingNewTab',
    REVIEWS_EXPORT: 'mapsPanel.reviewsExport',
    PHOTOS_EXPORT: 'mapsPanel.photosExport',
    NEW_VERSION: 'mapsPanel.newVersionAvailable',
    LIST_SECTION: 'mapsPanel.listSection',
    LIST_IDLE_HINT: 'mapsPanel.listIdleHint',
    QUOTA_EXHAUSTED: 'mapsPanel.quotaExhausted',
    UPGRADE_PLAN: 'mapsPanel.upgradePlan',
    READY: 'mapsPanel.ready',
    MODE_SEARCH: 'mapsPanel.modeSearch',
    MODE_PLACE: 'mapsPanel.modePlace',
    PROGRESS: 'mapsPanel.progress',
    PAUSED: 'mapsPanel.paused',
    PAUSED_HINT: 'mapsPanel.pausedHint',
    SEARCH_LIVE: 'mapsPanel.searchLive',
    LIST_LIVE: 'mapsPanel.listLive',
    PLACE_HINT: 'mapsPanel.placeHint',
    LIMIT_REACHED: 'mapsPanel.limitReached',
    END_REACHED: 'mapsPanel.endReached',
    NOT_SEARCHED: 'mapsPanel.notSearched',
    GOOGLE_ERROR: 'mapsPanel.googleError',
    CHECKING: 'mapsPanel.checking',
    CHECK_AGAIN: 'mapsPanel.checkAgain',
    STILL_OUT: 'mapsPanel.stillOut',
    UNLOCKED: 'mapsPanel.unlocked',
    EXPORTED: 'mapsPanel.exported',
    CONTACTS_TITLE: 'mapsPanel.contactsTitle',
    CONTACTS_PROGRESS: 'mapsPanel.contactsProgress',
    CONTACTS_WAIT: 'mapsPanel.contactsWait',
    STOPPED: 'mapsPanel.stopped',
    STOPPED_HINT: 'mapsPanel.stoppedHint',
    NO_REVIEWS: 'mapsPanel.noReviews',
    NO_PHOTOS: 'mapsPanel.noPhotos',
    EMPTY_HINT: 'mapsPanel.emptyHint',
    NO_REVIEWS_HINT: 'mapsPanel.noReviewsHint',
    NO_PHOTOS_HINT: 'mapsPanel.noPhotosHint',
    REVIEWS_STOPPED: 'mapsPanel.reviewsStopped',
    PHOTOS_STOPPED: 'mapsPanel.photosStopped',
    REVIEWS_LIVE: 'mapsPanel.reviewsLive',
    PHOTOS_LIVE: 'mapsPanel.photosLive',
    UPGRADE_TITLE: 'mapsPanel.upgradeTitle',
    UPGRADE_HINT: 'mapsPanel.upgradeHint',
    QUOTA_HINT: 'mapsPanel.quotaHint',
    BULK_TASK: 'mapsPanel.bulkTask',
    DASHBOARD: 'mapsPanel.dashboard',
    HELP: 'mapsPanel.help',
    RUN_LIMIT: 'mapsPanel.runLimit',
    THIS_PLACE: 'mapsPanel.thisPlace',
    NEW_TAB_HINT: 'mapsPanel.newTabHint',
    REOPEN: 'mapsPanel.reopen',
    ROW_START: 'mapsPanel.rowStart'
  },

  /** popup 用量展示（013 A11，U7 账号区） */
  POPUP_USAGE: {
    /** 区块标题 */
    TITLE: 'popup.usage.title',
    /** 未登录归属标签 */
    GUEST: 'popup.usage.guest',
    LOADING: 'popupUsage.loading',
    UNAVAILABLE: 'popupUsage.unavailable',
    /** 用量计数行（{used} / {total}） */
    COUNTER: 'popup.usage.counter',
    /** 重置时间行（{date} = 下个纽约业务月的首日） */
    RESETS: 'popup.usage.resets',
    UNAVAILABLE_HINT: 'popupUsage.unavailableHint',
    SIGN_IN_HINT: 'popupUsage.signInHint',
    SIGN_IN_PENDING: 'popupUsage.signInPending',
    KEYWORDS_HINT: 'popupUsage.keywordsHint',
    REVIEWS_HINT: 'popupUsage.reviewsHint',
    BULK_TOOLS: 'popupUsage.bulkTools',
    ACCOUNT: 'popupUsage.account',
    NEAR_LIMIT: 'popupUsage.nearLimit',
    EXHAUSTED: 'popupUsage.exhausted',
    UPGRADE: 'popupUsage.upgrade'
  },

  /** 设置页（013 A9，U6 options） */
  OPTIONS: {
    /** 页面标题 */
    TITLE: 'options.title',
    /** 采集分组标题 */
    SECTION_EXTRACTION: 'options.section.extraction',
    /** 导出分组标题 */
    SECTION_EXPORT: 'options.section.export',
    /** 自动化分组标题 */
    SECTION_AUTOMATION: 'options.section.automation',
    /** 滚动/采集间隔标签 */
    REQUEST_INTERVAL: 'options.requestInterval',
    /** 滚动/采集间隔说明 */
    REQUEST_INTERVAL_HINT: 'options.requestIntervalHint',
    /** 补全官网 Email 开关（013 A4，U8；Pro 语义字段） */
    EXTRACT_EMAIL: 'options.extractEmail',
    /** 补全官网 Email 说明 */
    EXTRACT_EMAIL_HINT: 'options.extractEmailHint',
    /** 补全官网社媒开关（013 A4，U8；Pro 语义字段） */
    EXTRACT_SOCIAL_MEDIAS: 'options.extractSocialMedias',
    /** 补全官网社媒说明 */
    EXTRACT_SOCIAL_MEDIAS_HINT: 'options.extractSocialMediasHint',
    /** 间隔档位文案（{seconds} 秒） */
    INTERVAL_SECONDS: 'options.intervalSeconds',
    /** 导出格式标签 */
    EXPORT_FORMAT: 'options.exportFormat',
    /** 导出字段标签 */
    EXPORT_FIELDS: 'options.exportFields',
    /** 导出字段说明 */
    EXPORT_FIELDS_HINT: 'options.exportFieldsHint',
    /** Pro 列标注 */
    PRO_BADGE: 'options.proBadge',
    /** 完成后自动下载 */
    AUTO_DOWNLOAD: 'options.autoDownload',
    AUTO_DOWNLOAD_HINT: 'options.autoDownloadHint',
    SAVE_FAILED: 'options.saveFailed',
    /** 自动保存到 Google Drive */
    DRIVE_AUTO_SAVE: 'options.driveAutoSave',
    /** 自动保存到 HubSpot */
    HUBSPOT_AUTO_SAVE: 'options.hubspotAutoSave',
    /** Drive 集成说明（013 A10 授权联动） */
    INTEGRATION_HINT_DRIVE: 'options.integrationHintDrive',
    /** HubSpot 集成说明 */
    INTEGRATION_HINT_HUBSPOT: 'options.integrationHintHubspot',
    /** 集成已连接状态 */
    INTEGRATION_STATUS_CONNECTED: 'options.integrationStatusConnected',
    /** 集成未连接状态 */
    INTEGRATION_STATUS_NOT_CONNECTED: 'options.integrationStatusNotConnected',
    /** 授权失败提示（弹窗关闭 / 占位 client_id 拒绝等） */
    INTEGRATION_AUTH_FAILED: 'options.integrationAuthFailed',
    INTEGRATION_UNAVAILABLE: 'options.integrationUnavailable',
    /** 断开连接（revoke 授权并关闭开关） */
    INTEGRATION_DISCONNECT: 'options.integrationDisconnect',
    /** 批量卡死重试次数 */
    STUCK_MAX_RETRY: 'options.stuckMaxRetry',
    /** 批量卡死重试次数说明 */
    STUCK_MAX_RETRY_HINT: 'options.stuckMaxRetryHint',
    /** 隐私政策页脚链接（013 A13，U11） */
    PRIVACY_POLICY: 'options.privacyPolicy',
    /** 导出格式选项：CSV */
    FORMAT_CSV: 'options.format.csv',
    /** 导出格式选项：JSON */
    FORMAT_JSON: 'options.format.json',
    /** 导出格式选项：XLSX */
    FORMAT_XLSX: 'options.format.xlsx',
    /** 字段分组标题：基础信息 */
    GROUP_BASIC: 'options.fieldGroup.basic',
    /** 字段分组标题：地址与地理 */
    GROUP_ADDRESS: 'options.fieldGroup.address',
    /** 字段分组标题：联系方式 */
    GROUP_CONTACT: 'options.fieldGroup.contact',
    /** 字段分组标题：经营属性 */
    GROUP_BUSINESS: 'options.fieldGroup.business',
    /** 字段分组标题：评分与评论 */
    GROUP_REVIEWS: 'options.fieldGroup.reviews',
    /** 字段分组标题：关联与标识 */
    GROUP_IDENTIFIERS: 'options.fieldGroup.identifiers',
    /** 导出字段显示名。 */
    COLUMNS: {
      NAME: 'options.column.name',
      DESCRIPTION: 'options.column.description',
      FULL_ADDRESS: 'options.column.fullAddress',
      STREET: 'options.column.street',
      MUNICIPALITY: 'options.column.municipality',
      CATEGORIES: 'options.column.categories',
      ABOUT: 'options.column.about',
      PLUS_CODE: 'options.column.plusCode',
      TIME_ZONE: 'options.column.timeZone',
      PRICE: 'options.column.price',
      NOTE: 'options.column.note',
      AMENITIES: 'options.column.amenities',
      HOTEL_CLASS: 'options.column.hotelClass',
      PHONE: 'options.column.phone',
      PHONES: 'options.column.phones',
      CLAIMED: 'options.column.claimed',
      OWNER: 'options.column.owner',
      OWNER_ID: 'options.column.ownerId',
      OWNER_LINK: 'options.column.ownerLink',
      EMAIL: 'options.column.email',
      SOCIAL_MEDIAS: 'options.column.socialMedias',
      REVIEW_COUNT: 'options.column.reviewCount',
      AVERAGE_RATING: 'options.column.averageRating',
      REVIEW_URL: 'options.column.reviewUrl',
      GOOGLE_MAPS_URL: 'options.column.googleMapsUrl',
      GOOGLE_KNOWLEDGE_URL: 'options.column.googleKnowledgeUrl',
      LATITUDE: 'options.column.latitude',
      LONGITUDE: 'options.column.longitude',
      WEBSITE: 'options.column.website',
      DOMAIN: 'options.column.domain',
      OPENING_HOURS: 'options.column.openingHours',
      FEATURED_IMAGE: 'options.column.featuredImage',
      CID: 'options.column.cid',
      FID: 'options.column.fid',
      PLACE_ID: 'options.column.placeId',
      KGMID: 'options.column.kgmid'
    },
    SECTION_APPEARANCE: 'options.section.appearance',
    NAV_LABEL: 'options.navLabel',
    EXTRACTION_DESC: 'options.extractionDesc',
    EXPORT_DESC: 'options.exportDesc',
    AUTOMATION_DESC: 'options.automationDesc',
    APPEARANCE_DESC: 'options.appearanceDesc',
    EXPORT_FORMAT_HINT: 'options.exportFormatHint',
    PRO_FREE: 'options.proFree',
    PRO_FIELDS: 'options.proFields',
    SELECT_ALL: 'options.selectAll',
    CLEAR_FIELDS: 'options.clearFields',
    ALL_SAVED: 'options.allSaved',
    SAVING: 'options.saving',
    SAVED: 'options.saved',
    NOT_SAVED: 'options.notSaved',
    SAVE_FAILED_HINT: 'options.saveFailedHint',
    RELOAD: 'options.reload',
    FIELD_COUNT: 'options.fieldCount',
    ON: 'options.on',
    OFF: 'options.off',
    INTERVAL_SUMMARY: 'options.intervalSummary',
    EXPORT_SUMMARY: 'options.exportSummary',
    AUTOMATION_SUMMARY: 'options.automationSummary',
    APPEARANCE_SUMMARY: 'options.appearanceSummary',
    PREVIEW: 'options.preview',
    PREVIEW_SAMPLE: 'options.previewSample',
    PREVIEW_COLUMNS: 'options.previewColumns',
    PREVIEW_KEYS: 'options.previewKeys',
    PREVIEW_FORMAT_CSV: 'options.previewFormatCsv',
    PREVIEW_FORMAT_XLSX: 'options.previewFormatXlsx',
    PREVIEW_FORMAT_JSON: 'options.previewFormatJson',
    PREVIEW_EMPTY: 'options.previewEmpty',
    PREVIEW_EMAIL: 'options.previewEmail',
    PREVIEW_SOCIAL: 'options.previewSocial',
    PREVIEW_PLUS_CODE: 'options.previewPlusCode',
    INCREASE_RETRY: 'options.increaseRetry',
    DECREASE_RETRY: 'options.decreaseRetry',
    SKIPPED: 'options.skipped',
    ATTEMPTS: 'options.attempts',
    RETRY_SETTINGS_ONLY: 'options.retrySettingsOnly',
    INTEGRATIONS: 'options.integrations',
    THEME: 'options.theme',
    THEME_HINT: 'options.themeHint',
    THEME_SYSTEM: 'options.themeSystem',
    THEME_LIGHT: 'options.themeLight',
    THEME_DARK: 'options.themeDark',
    NOW_LIGHT: 'options.nowLight',
    NOW_DARK: 'options.nowDark',
    LANGUAGE: 'options.language',
    LANGUAGE_HINT: 'options.languageHint',
    LANGUAGE_FAILED: 'options.languageFailed'
  },

  /** 批量任务 dashboard 页（013 A6，U5） */
  DASHBOARD: {
    /** 页面标题 */
    TITLE: 'dashboard.title',
    CREATE_TASK: 'dashboard.createTask',
    CLEAR: 'dashboard.clear',
    HISTORY: 'dashboard.history',
    HISTORY_HINT: 'dashboard.historyHint',
    SPLIT_HINT: 'dashboard.splitHint',
    START_FIRST_TASK: 'dashboard.startFirstTask',
    SPLIT_START_HINT: 'dashboard.splitStartHint',
    ACTION_VIEW: 'dashboard.actionView',
    ACTION_COPY_PENDING: 'dashboard.actionCopyPending',
    BACK: 'dashboard.back',
    DELETE_CONFIRM: 'dashboard.deleteConfirm',
    ITEM_PENDING: 'dashboard.itemPending',
    ITEM_RUNNING: 'dashboard.itemRunning',
    ITEM_COMPLETE: 'dashboard.itemComplete',
    ITEM_STUCK: 'dashboard.itemStuck',
    ITEM_INVALID: 'dashboard.itemInvalid',
    COLLECTED: 'dashboard.collected',
    TASK_SAVED: 'dashboard.taskSaved',
    EXECUTION_HINT: 'dashboard.executionHint',
    ERROR_NAME_REQUIRED: 'dashboard.errorNameRequired',
    ERROR_ACTION: 'dashboard.errorAction',
    /** 新建任务分组标题 */
    SECTION_CREATE: 'dashboard.sectionCreate',
    /** 任务类型：关键词 */
    TYPE_KEYWORDS: 'dashboard.typeKeywords',
    /** 任务类型：评论链接 */
    TYPE_REVIEW_URLS: 'dashboard.typeReviewUrls',
    /** 任务名称标签 */
    TASK_NAME: 'dashboard.taskName',
    /** 任务名称占位符（竞品同款） */
    TASK_NAME_PLACEHOLDER: 'dashboard.taskNamePlaceholder',
    /** 关键词文本域占位符 */
    ITEMS_PLACEHOLDER_KEYWORDS: 'dashboard.itemsPlaceholderKeywords',
    /** 评论链接文本域占位符 */
    ITEMS_PLACEHOLDER_REVIEWS: 'dashboard.itemsPlaceholderReviews',
    /** 每店评论上限标签 */
    REVIEWS_PER_STORE_LIMIT: 'dashboard.reviewsPerStoreLimit',
    /** 每店评论上限说明 */
    REVIEWS_PER_STORE_LIMIT_HINT: 'dashboard.reviewsPerStoreLimitHint',
    /** 条目数量 */
    ITEM_COUNT: 'dashboard.itemCount',
    /** 创建并启动按钮（竞品文案 Start Extracting） */
    START_EXTRACTING: 'dashboard.startExtracting',
    /** 表头：序号 */
    COL_NO: 'dashboard.colNo',
    /** 表头：任务名称 */
    COL_TASK_NAME: 'dashboard.colTaskName',
    /** 表头：状态 */
    COL_STATUS: 'dashboard.colStatus',
    /** 表头：操作 */
    COL_ACTIONS: 'dashboard.colActions',
    /** 状态：未开始 */
    STATUS_IDLE: 'dashboard.statusIdle',
    /** 状态：运行中 */
    STATUS_RUNNING: 'dashboard.statusRunning',
    /** 状态：已停止 */
    STATUS_PAUSED: 'dashboard.statusPaused',
    /** 状态：已完成 */
    STATUS_COMPLETED: 'dashboard.statusCompleted',
    /** 进度（{done}/{total} 条） */
    PROGRESS_OF: 'dashboard.progressOf',
    /** 计数：尝试 */
    COUNT_TRY: 'dashboard.countTry',
    /** 计数：完成 */
    COUNT_COMPLETE: 'dashboard.countComplete',
    /** 计数：卡死 */
    COUNT_STUCK: 'dashboard.countStuck',
    /** 计数：跳过 */
    COUNT_SKIP: 'dashboard.countSkip',
    /** 行操作：复制全部 */
    ACTION_COPY_ALL: 'dashboard.actionCopyAll',
    /** 行操作：复制已完成 */
    ACTION_COPY_COMPLETED: 'dashboard.actionCopyCompleted',
    /** 行操作：启动 */
    ACTION_START: 'dashboard.actionStart',
    /** 行操作：暂停 */
    ACTION_STOP: 'dashboard.actionStop',
    /** 行操作：删除 */
    ACTION_DELETE: 'dashboard.actionDelete',
    /** 空列表提示 */
    EMPTY_HINT: 'dashboard.emptyHint',
    /** 错误：已有任务运行 */
    ERROR_MUTEX: 'dashboard.errorMutex',
    /** 错误：任务数达上限（150） */
    ERROR_LIMIT_TASKS: 'dashboard.errorLimitTasks',
    /** 错误：条目数达上限（500） */
    ERROR_LIMIT_ITEMS: 'dashboard.errorLimitItems',
    /** 错误：输入为空 */
    ERROR_EMPTY_INPUT: 'dashboard.errorEmptyInput',
    /** 错误：入参非法 */
    ERROR_INVALID_PARAM: 'dashboard.errorInvalidParam',
    /** 错误：任务不存在 */
    ERROR_NOT_FOUND: 'dashboard.errorNotFound',
    /** 错误：月度配额剩余不足（U7 前置校验拒绝） */
    ERROR_QUOTA_EXCEEDED: 'dashboard.errorQuotaExceeded',
    /** 复制成功 */
    COPIED: 'dashboard.copied',
    /** 复制失败 */
    COPY_FAILED: 'dashboard.copyFailed',
    ATTEMPTS: 'dashboard.attempts',
    CANCEL: 'dashboard.cancel',
    CHANGE_SETTINGS: 'dashboard.changeSettings',
    CLEANUP_HINT: 'dashboard.cleanupHint',
    CREATE_TASKS: 'dashboard.createTasks',
    DELETED: 'dashboard.deleted',
    DELETE_RUNNING: 'dashboard.deleteRunning',
    DELETE_TITLE: 'dashboard.deleteTitle',
    DOWNLOAD_HINT: 'dashboard.downloadHint',
    DUPLICATES_REMOVED: 'dashboard.duplicatesRemoved',
    EMPTY_REMOVED: 'dashboard.emptyRemoved',
    EMPTY_TITLE: 'dashboard.emptyTitle',
    FINISHED_ITEMS: 'dashboard.finishedItems',
    FORM_KEYWORDS: 'dashboard.formKeywords',
    FORM_REVIEWS: 'dashboard.formReviews',
    INVALID_LINKS: 'dashboard.invalidLinks',
    ITEMS_ASIDE: 'dashboard.itemsAside',
    ITEM_RETRYING: 'dashboard.itemRetrying',
    JUMP_CURRENT: 'dashboard.jumpCurrent',
    KEEPS_RUNNING: 'dashboard.keepsRunning',
    LEDE_KEYWORDS: 'dashboard.ledeKeywords',
    LEDE_REVIEWS: 'dashboard.ledeReviews',
    MORE_ACTIONS: 'dashboard.moreActions',
    NEW_KEYWORDS: 'dashboard.newKeywords',
    NEW_REVIEWS: 'dashboard.newReviews',
    OPEN_HISTORY: 'dashboard.openHistory',
    PAUSED_ITEM: 'dashboard.pausedItem',
    PROCESSED: 'dashboard.processed',
    QUOTA_AFTER: 'dashboard.quotaAfter',
    QUOTA_CHECK: 'dashboard.quotaCheck',
    QUOTA_FOOT_HINT: 'dashboard.quotaFootHint',
    QUOTA_LEFT: 'dashboard.quotaLeft',
    QUOTA_LOWER_REVIEWS: 'dashboard.quotaLowerReviews',
    QUOTA_REDUCE: 'dashboard.quotaReduce',
    QUOTA_RULE_KEYWORDS: 'dashboard.quotaRuleKeywords',
    QUOTA_RULE_REVIEWS: 'dashboard.quotaRuleReviews',
    QUOTA_TASK: 'dashboard.quotaTask',
    QUOTA_UNAVAILABLE: 'dashboard.quotaUnavailable',
    QUOTA_USED: 'dashboard.quotaUsed',
    READY_ITEMS: 'dashboard.readyItems',
    RECORDS_NEEDED: 'dashboard.recordsNeeded',
    RETRY_HINT: 'dashboard.retryHint',
    RETRY_VALUE: 'dashboard.retryValue',
    RUNNING_FOOT_HINT: 'dashboard.runningFootHint',
    RUN_AGAIN: 'dashboard.runAgain',
    SAVED_NOT_STARTED: 'dashboard.savedNotStarted',
    SET_IN_SETTINGS: 'dashboard.setInSettings',
    SKIPPED: 'dashboard.skipped',
    SKIP_BREAKDOWN: 'dashboard.skipBreakdown',
    SLOTS_HINT: 'dashboard.slotsHint',
    SUMMARY: 'dashboard.summary',
    SUMMARY_EMPTY: 'dashboard.summaryEmpty',
    SUMMARY_ONE: 'dashboard.summaryOne',
    TASK_COUNT: 'dashboard.taskCount',
    VIEW_RUNNING: 'dashboard.viewRunning',
    WORKING_ITEM: 'dashboard.workingItem'
  }
} as const

/**
 * 翻译键类型
 */
export type I18nKey = (typeof I18N_KEYS)[keyof typeof I18N_KEYS]
export type I18nKeyWithPath = typeof I18N_KEYS

/**
 * 支持的语言
 */
export const SUPPORTED_LANGUAGES = {
  /** 英文 (默认) */
  EN_US: 'en-US',
  /** 简体中文 */
  ZH_CN: 'zh-CN',
  /** 繁体中文 */
  ZH_TW: 'zh-TW',
  /** 日语 */
  JA_JP: 'ja-JP',
  /** 韩语 */
  KO_KR: 'ko-KR',
  /** 西班牙语 */
  ES_ES: 'es-ES',
  /** 葡萄牙语 (巴西) */
  PT_BR: 'pt-BR',
  /** 德语 */
  DE_DE: 'de-DE',
  /** 法语 */
  FR_FR: 'fr-FR',
  /** 俄语 */
  RU_RU: 'ru-RU',
  /** 意大利语 */
  IT_IT: 'it-IT',
  /** 越南语 */
  VI_VN: 'vi-VN',
  /** 泰语 */
  TH_TH: 'th-TH',
  /** 印度尼西亚语 */
  ID_ID: 'id-ID'
} as const

/**
 * 支持的语言类型
 */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES]
