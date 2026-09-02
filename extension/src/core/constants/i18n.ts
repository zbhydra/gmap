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
  /** 弹窗描述 */
  POPUP_DESCRIPTION: 'popupDescription',

  /** App 相关 */
  APP: {
    /** 应用标题 */
    TITLE: 'app.title',
    /** 刷新按钮 */
    REFRESH: 'app.refresh',
    /** 底部支持联系方式 */
    SUPPORT_CONTACT: 'app.supportContact',
    /** 复制支持邮箱按钮 */
    COPY_SUPPORT_EMAIL: 'app.copySupportEmail',
    /** 支持邮箱复制成功 */
    SUPPORT_EMAIL_COPIED: 'app.supportEmailCopied',
    /** 支持邮箱复制失败 */
    SUPPORT_EMAIL_COPY_FAILED: 'app.supportEmailCopyFailed',
    /** 打开批量任务 dashboard 按钮 */
    OPEN_DASHBOARD: 'app.openDashboard'
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
    /** 面板标题（产品名） */
    TITLE: 'mapsPanel.title',
    /** 待命说明 */
    IDLE_HINT: 'mapsPanel.idleHint',
    /** 开始采集按钮（竞品文案 Start Extracting） */
    START: 'mapsPanel.start',
    /** 采集中文案（Extracting {count}…） */
    EXTRACTING: 'mapsPanel.extracting',
    /** 暂停按钮 */
    PAUSE: 'mapsPanel.pause',
    /** 恢复按钮 */
    RESUME: 'mapsPanel.resume',
    /** 导出按钮（Export Detailed List - {count} (.CSV)） */
    EXPORT: 'mapsPanel.export',
    /** 重置按钮 */
    RESET: 'mapsPanel.reset',
    /** 左右位置切换按钮 */
    TOGGLE_POSITION: 'mapsPanel.togglePosition',
    /** 响应解析失败提示（失败不静默：UI 可见） */
    PARSE_ERROR: 'mapsPanel.parseError',
    /** place 页 Reviews 区块标签 */
    REVIEWS_SECTION: 'mapsPanel.reviewsSection',
    /** place 页 Photos 区块标签 */
    PHOTOS_SECTION: 'mapsPanel.photosSection',
    /** place 页评论采集开始按钮（竞品文案 Start Extracting Reviews） */
    START_REVIEWS: 'mapsPanel.startReviews',
    /** place 页照片采集开始按钮（竞品文案 Start Extracting Photos） */
    START_PHOTOS: 'mapsPanel.startPhotos',
    /** place 页区块已发起采集的状态文案 */
    COLLECTING_NEW_TAB: 'mapsPanel.collectingNewTab',
    /** 评论页导出按钮（Export Reviews - {count} (.CSV)） */
    REVIEWS_EXPORT: 'mapsPanel.reviewsExport',
    /** 照片页导出按钮（Export Photos - {count} (.CSV)） */
    PHOTOS_EXPORT: 'mapsPanel.photosExport',
    /** 面板新版本提示（A12：远端最低版本 > 本地版本） */
    NEW_VERSION: 'mapsPanel.newVersionAvailable',
    /** 列表模式区块标签（A7：URL 命中保存列表/搜索侧栏列表触发标记） */
    LIST_SECTION: 'mapsPanel.listSection',
    /** 列表模式待命说明 */
    LIST_IDLE_HINT: 'mapsPanel.listIdleHint',
    /** 配额耗尽提示（A11/U7：月度额度用尽 + 订阅引导） */
    QUOTA_EXHAUSTED: 'mapsPanel.quotaExhausted',
    /** 订阅引导按钮（W7：额度用尽时打开远程下发的 pricingUrl 落地页；未配置不渲染） */
    UPGRADE_PLAN: 'mapsPanel.upgradePlan'
  },

  /** popup 用量展示（013 A11，U7 账号区） */
  POPUP_USAGE: {
    /** 区块标题 */
    TITLE: 'popup.usage.title',
    /** 未登录归属标签 */
    GUEST: 'popup.usage.guest',
    /** 用量计数行（{used} / {total}） */
    COUNTER: 'popup.usage.counter',
    /** 重置时间行（{period} = 当前归属周期） */
    RESETS: 'popup.usage.resets'
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
    GROUP_IDENTIFIERS: 'options.fieldGroup.identifiers'
  },

  /** 批量任务 dashboard 页（013 A6，U5） */
  DASHBOARD: {
    /** 页面标题 */
    TITLE: 'dashboard.title',
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
    /** 条目计数提示（{count}/{max} 条） */
    ITEM_COUNT: 'dashboard.itemCount',
    /** 创建并启动按钮（竞品文案 Start Extracting） */
    START_EXTRACTING: 'dashboard.startExtracting',
    /** 任务列表分组标题 */
    SECTION_TASKS: 'dashboard.sectionTasks',
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
    /** 行操作：停止 */
    ACTION_STOP: 'dashboard.actionStop',
    /** 行操作：删除 */
    ACTION_DELETE: 'dashboard.actionDelete',
    /** 空列表提示 */
    EMPTY_HINT: 'dashboard.emptyHint',
    /** 错误：已有任务运行（互斥，竞品同构 danger 提示） */
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
    /** 默认任务名（{index} 序号） */
    DEFAULT_TASK_NAME: 'dashboard.defaultTaskName'
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
