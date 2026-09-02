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
    SUPPORT_EMAIL_COPY_FAILED: 'app.supportEmailCopyFailed'
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

  /** Bing Maps 采集面板（016 U3，sites/bing/content/panel） */
  BING_PANEL: {
    /** 面板标题 */
    TITLE: 'bingPanel.title',
    /** Start Extraction 主按钮 */
    START: 'bingPanel.start',
    /** 未检测到列表提示行 */
    HINT_NO_LIST: 'bingPanel.hintNoList',
    /** 示例搜索链接文案 */
    FOR_EXAMPLE: 'bingPanel.forExample',
    /** How to use 链接 */
    HOW_TO_USE: 'bingPanel.howToUse',
    /** 采集中进度文案（免费） */
    EXPORTING: 'bingPanel.exporting',
    /** 采集中进度文案（Pro，U4 门控接入后启用） */
    FOUND_STILL_GOING: 'bingPanel.foundStillGoing',
    /** 采集中区域提示（采集进行中） */
    HINT_WAIT_MOMENT: 'bingPanel.hintWaitMoment',
    /** 采集中区域提示（列表收敛，引导移动地图） */
    HINT_MOVE_MAP: 'bingPanel.hintMoveMap',
    /** Stop 按钮 */
    STOP: 'bingPanel.stop',
    /** 完成态文案（自然收敛） */
    SEARCH_COMPLETE: 'bingPanel.searchComplete',
    /** 完成态文案（手动停止） */
    MANUALLY_STOPPED: 'bingPanel.manuallyStopped',
    /** 完成态采集计数（主流程「完成:显示计数」） */
    DONE_COUNT: 'bingPanel.doneCount',
    /** 免费达限警告条说明 */
    FREE_LIMIT_NOTE: 'bingPanel.freeLimitNote',
    /** Upgrade to Pro Now 按钮 */
    UPGRADE_TO_PRO: 'bingPanel.upgradeToPro',
    /** Export Leads List 下拉按钮 */
    EXPORT_LEADS_LIST: 'bingPanel.exportLeadsList',
    /** 下拉项：导出 CSV */
    DOWNLOAD_CSV: 'bingPanel.downloadCsv',
    /** 下拉项：导出 XLSX */
    DOWNLOAD_XLSX: 'bingPanel.downloadXlsx',
    /** Go Back 按钮 */
    GO_BACK: 'bingPanel.goBack',
    /** 标题区账号/订阅态徽标（免费档，点击进 Pricing 视图） */
    FREE_BADGE: 'bingPanel.freeBadge',
    /** 标题区账号/订阅态徽标（Pro 档，点击进 Pricing 视图） */
    PRO_BADGE: 'bingPanel.proBadge',
    /** Pricing 视图标题 */
    PRICING_TITLE: 'bingPanel.pricingTitle',
    /** Pricing 视图：账号行标签 */
    PRICING_ACCOUNT: 'bingPanel.pricingAccount',
    /** Pricing 视图：已登录账号展示 */
    PRICING_SIGNED_IN_AS: 'bingPanel.pricingSignedInAs',
    /** Pricing 视图：匿名账号展示 */
    PRICING_FREE_ACCOUNT: 'bingPanel.pricingFreeAccount',
    /** Pricing 视图：已订阅祝贺态 */
    PRICING_VIP_NOTE: 'bingPanel.pricingVipNote',
    /** Pricing 对比表：Free 列头 */
    PRICING_COLUMN_FREE: 'bingPanel.pricingColumnFree',
    /** Pricing 对比表：Pro 列头 */
    PRICING_COLUMN_PRO: 'bingPanel.pricingColumnPro',
    /** Pricing 对比表行：一次性导出条数 */
    PRICING_ROW_EXPORT_LIMIT: 'bingPanel.pricingRowExportLimit',
    /** Pricing 对比表：一次性导出条数（免费档值） */
    PRICING_EXPORT_LIMIT_FREE: 'bingPanel.pricingExportLimitFree',
    /** Pricing 对比表：一次性导出条数（Pro 值） */
    PRICING_EXPORT_LIMIT_PRO: 'bingPanel.pricingExportLimitPro',
    /** Pricing 对比表行：导出 CSV/XLSX */
    PRICING_FEATURE_CSV: 'bingPanel.pricingFeatureCsv',
    /** Pricing 对比表行：提取官网 URL */
    PRICING_FEATURE_WEBSITE: 'bingPanel.pricingFeatureWebsite',
    /** Pricing 对比表行：提取电话 */
    PRICING_FEATURE_PHONE: 'bingPanel.pricingFeaturePhone',
    /** Pricing 对比表行：提取 Email/社媒 */
    PRICING_FEATURE_EMAIL: 'bingPanel.pricingFeatureEmail',
    /** Pricing 对比表单元格：包含 */
    PRICING_INCLUDED: 'bingPanel.pricingIncluded',
    /** Pricing 对比表单元格：需 Pro */
    PRICING_PRO_ONLY: 'bingPanel.pricingProOnly',
    /** Pricing 视图：Email/社媒一期占位说明 */
    PRICING_EMAIL_COMING_SOON: 'bingPanel.pricingEmailComingSoon',
    /** Pricing 视图：订阅引导按钮（新标签打开官网订阅页） */
    PRICING_UPGRADE: 'bingPanel.pricingUpgrade'
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
    /** 续费按钮 */
    RENEW: 'subscription.renew',
    /** 尚未开通提示 */
    NOT_AVAILABLE: 'subscription.notAvailable',
    /** 已复制 */
    COPIED: 'subscription.copied',
    /** 复制失败 */
    COPY_FAILED: 'subscription.copyFailed'
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
