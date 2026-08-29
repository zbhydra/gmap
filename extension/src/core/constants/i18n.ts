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
    /** 登录能力尚未接入提示 */
    LOGIN_NOT_AVAILABLE: 'auth.loginNotAvailable'
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
