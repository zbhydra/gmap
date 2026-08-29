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
  /** 选项 */
  OPTIONS: 'options',

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
    /** 加入 Telegram 反馈群 */
    JOIN_FEEDBACK_GROUP: 'app.joinFeedbackGroup',
    /** Telegram 反馈群打开失败 */
    FEEDBACK_GROUP_OPEN_FAILED: 'app.feedbackGroupOpenFailed'
  },

  /** Store 错误相关 */
  STORE_ERROR: {
    /** 无法获取标签页 */
    TAB_NOT_FOUND: 'store.error.tabNotFound',
    /** 获取资源失败 */
    FETCH_FAILED: 'store.error.fetchFailed',
    /** 下载失败 */
    DOWNLOAD_FAILED: 'store.error.downloadFailed',
    /** 批量下载失败 */
    BATCH_DOWNLOAD_FAILED: 'store.error.batchDownloadFailed',
    /** 清理缓冲区失败 */
    CLEAR_BUFFER_FAILED: 'store.error.clearBufferFailed',
    /** Content script 未连接 */
    CONTENT_SCRIPT_NOT_CONNECTED: 'store.error.contentScriptNotConnected'
  },

  /** 资源项相关 */
  RESOURCE_ITEM: {
    /** 下载 */
    DOWNLOAD: 'resourceItem.download',
    /** 下载视频 */
    DOWNLOAD_VIDEO: 'resourceItem.download.video',
    /** 下载图片 */
    DOWNLOAD_IMAGE: 'resourceItem.download.image',
    /** 下载封面 */
    DOWNLOAD_COVER: 'resourceItem.download.cover',
    /** 类型 - 照片 */
    TYPE_PHOTO: 'resourceItem.type.photo',
    /** 类型 - 图片 */
    TYPE_IMAGE: 'resourceItem.type.image',
    /** 类型 - 视频 */
    TYPE_VIDEO: 'resourceItem.type.video',
    /** 类型 - 圆视频 */
    TYPE_ROUND: 'resourceItem.type.round',
    /** 类型 - GIF */
    TYPE_GIF: 'resourceItem.type.gif',
    /** 类型 - 音频 */
    TYPE_AUDIO: 'resourceItem.type.audio',
    /** 类型 - 语音 */
    TYPE_VOICE: 'resourceItem.type.voice',
    /** 类型 - 文档 */
    TYPE_DOCUMENT: 'resourceItem.type.document',
    /** 下载中 */
    DOWNLOADING: 'resourceItem.downloading',
    /** 排队中 */
    QUEUING: 'resourceItem.queuing',
    /** 等待中 */
    WAITING: 'resourceItem.waiting'
  },

  /** 资源列表相关 */
  RESOURCE_LIST: {
    /** 全选 */
    SELECT_ALL: 'resourceList.selectAll',
    /** 批量下载 */
    BATCH_DOWNLOAD: 'resourceList.batchDownload',
    /** 资源总数 */
    TOTAL_COUNT: 'resourceList.totalCount',
    /** 类型统计 */
    TYPE_BREAKDOWN: 'resourceList.typeBreakdown',
    /** 扫描中 */
    SCANNING: 'resourceList.scanning',
    /** 加载中 */
    LOADING: 'resourceList.loading',
    /** 下载中 */
    DOWNLOADING: 'resourceList.downloading',
    /** 暂无资源 */
    EMPTY: 'resourceList.empty',
    /** 重试 */
    RETRY: 'resourceList.retry',
    /** 全部下载 */
    DOWNLOAD_ALL: 'resourceList.downloadAll',
    /** 下载选中 */
    DOWNLOAD_SELECTED: 'resourceList.downloadSelected',
    /** 刷新 */
    REFRESH: 'resourceList.refresh',
    /** 清理缓冲区 */
    CLEAR_BUFFER: 'resourceList.clearBuffer',
    /** 表头 - 文件 */
    HEADER_FILE: 'resourceList.header.file',
    /** 表头 - 大小 */
    HEADER_SIZE: 'resourceList.header.size',
    /** 每日次数 */
    TIMES_PER_DAY: 'resourceList.timesPerDay'
  },

  /** Popup 下载状态相关 */
  DOWNLOAD_STATUS: {
    /** 下载任务浮层标题 */
    TITLE: 'downloadStatus.title',
    /** 顶部入口的完整状态说明 */
    SUMMARY: 'downloadStatus.summary',
    /** 下载中分组标题 */
    DOWNLOADING_COUNT: 'downloadStatus.downloadingCount',
    /** 等待中分组标题 */
    WAITING_COUNT: 'downloadStatus.waitingCount',
    /** 失败分组标题 */
    FAILED_COUNT: 'downloadStatus.failedCount',
    /** 下载失败状态 */
    FAILED: 'downloadStatus.failed',
    /** 无法计算的进度 */
    UNKNOWN_PROGRESS: 'downloadStatus.unknownProgress',
    /** 百分比进度 */
    PROGRESS: 'downloadStatus.progress',
    /** 队首尚在解析最终文件名 */
    RESOLVING_FILENAME: 'downloadStatus.resolvingFilename',
    /** 单任务 progress 可访问名称 */
    TASK_PROGRESS: 'downloadStatus.taskProgress',
    /** 取消单个任务的可访问名称 */
    CANCEL_TASK: 'downloadStatus.cancelTask',
    /** 重试单个失败任务的可访问名称 */
    RETRY_TASK: 'downloadStatus.retryTask',
    /** 清除全部任务的可访问名称 */
    CLEAR_ALL: 'downloadStatus.clearAll',
    /** 清空等待任务的可访问名称 */
    CLEAR_WAITING: 'downloadStatus.clearWaiting',
    /** Telegram 页面入口完整状态 */
    PAGE_SUMMARY: 'downloadStatus.pageSummary'
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
    LOGOUT: 'auth.logout',
    /** 官网登录页打开失败 */
    OPEN_LOGIN_FAILED: 'auth.openLoginFailed'
  },

  /** 订阅相关 */
  SUBSCRIPTION: {
    /** 订阅状态 */
    STATUS: 'subscription.status',
    /** 订阅周期 */
    PERIOD: 'subscription.period',
    /** 过期时间 */
    EXPIRES_AT: 'subscription.expiresAt',
    /** 每日限制 */
    DAILY_LIMIT: 'subscription.dailyLimit',
    /** 激活订阅 */
    ACTIVATE: 'subscription.activate',
    /** 免费版 */
    FREE: 'subscription.free',
    /** 按月订阅 */
    MONTHLY: 'subscription.monthly',
    /** 无限制 */
    UNLIMITED: 'subscription.unlimited',
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

  /** 配额相关 */
  QUOTA: {
    /** 升级弹窗标题 */
    UPGRADE_TITLE: 'quota.upgradeTitle',
    /** 升级弹窗消息 */
    UPGRADE_MESSAGE: 'quota.upgradeMessage',
    /** 升级按钮 */
    UPGRADE_BUTTON: 'quota.upgradeButton',
    /** 距离刷新还有小时和分钟 */
    RESET_IN_HOURS_MINUTES: 'quota.resetInHoursMinutes',
    /** 距离刷新还有整小时 */
    RESET_IN_HOURS: 'quota.resetInHours',
    /** 距离刷新还有分钟 */
    RESET_IN_MINUTES: 'quota.resetInMinutes',
    /** 刷新时刻已到 */
    RESET_READY: 'quota.resetReady',
    /** 本地绝对刷新时间 */
    RESET_AT: 'quota.resetAt',
    /** 提示 - 正常状态 */
    TOOLTIP_NORMAL: 'quota.tooltip.normal',
    /** 提示 - 次数用完 */
    TOOLTIP_EXHAUSTED: 'quota.tooltip.exhausted'
  },

  /** 下载按钮相关 */
  DOWNLOAD_BUTTON: {
    /** 下载按钮文本 */
    DOWNLOAD: 'downloadButton.download',
    /** 等待中 */
    WAITING: 'downloadButton.waiting',
    /** 排队中 */
    QUEUING: 'downloadButton.queuing',
    /** 剩余任务进度（新格式：{remaining}↓ {progress}%） */
    REMAINING_PROGRESS: 'downloadButton.remainingProgress'
  },

  /** 侧边栏相关 */
  SIDEBAR: {
    /** 下载按钮 */
    DOWNLOAD: 'sidebar.download',
    /** 全部下载 */
    DOWNLOAD_ALL: 'sidebar.downloadAll',
    /** 下载中 */
    DOWNLOADING: 'sidebar.downloading',
    /** 进度显示 */
    PROGRESS: 'sidebar.progress',
    /** 确认对话框标题 */
    CONFIRM_TITLE: 'sidebar.confirm.title',
    /** 确认对话框消息 */
    CONFIRM_MESSAGE: 'sidebar.confirm.message',
    /** 确认下载按钮 */
    CONFIRM_DOWNLOAD: 'sidebar.confirm.download',
    /** 取消按钮 */
    CONFIRM_CANCEL: 'sidebar.confirm.cancel',
    /** 不再询问 */
    DONT_ASK_AGAIN: 'sidebar.confirm.dontAskAgain'
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
