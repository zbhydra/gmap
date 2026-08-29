/**
 * API 统一配置
 *
 * 集中管理所有服务的端点，完整路径便于搜索
 */

/**
 * API 配置
 */
export const API = {
  /** API 基础 URL */
  BASE_URL: __API_BASE_URL__,
  /** 请求超时时间（毫秒） */
  TIMEOUT: 10000,
  /** 重试次数 */
  RETRY_COUNT: 2,
  /** 重试延迟（毫秒） */
  RETRY_DELAY: 1000,

  /** API 端点（完整路径） */
  ENDPOINTS: {
    // ========== 认证 ==========
    /** 使用官网 access token 换取插件 token */
    AUTH_EXTENSION_TOKEN: '/api/client/auth/extension-token',
    /** 刷新访问令牌 */
    AUTH_REFRESH: '/api/client/auth/refresh',
    /** 获取当前用户信息 */
    AUTH_ME: '/api/client/auth/me',
    /** 退出登录 */
    AUTH_LOGOUT: '/api/client/auth/logout',

    // ========== 配额 ==========
    /** 检查并消耗配额 */
    QUOTA_CHECK: '/api/client/quota/check',

    // ========== Telegram DOM ==========
    /** 获取 Telegram DOM 全局稀疏覆盖 */
    TELEGRAM_DOM_CONFIG: '/api/client/tg/dom-config',

    // ========== Telegram Config ==========
    /** 获取 Telegram 统一远端稀疏覆盖 */
    TELEGRAM_CONFIG: '/api/client/tg/config',

    // ========== 订阅兼容状态 ==========
    /** 获取订阅状态 */
    SUBSCRIPTION_STATUS: '/api/client/subscription/status'
  }
} as const

/** 官网配置 */
export const WEBSITE = {
  /** 官网基础 URL */
  BASE_URL: __WEBSITE_BASE_URL__,
  /** 官网裸域生产 URL，用于外部消息来源白名单。 */
  PRODUCTION_BASE_URL: 'https://telegramdownloadmedia.com',
  /** 官网 www 生产 URL，用于外部消息来源白名单。 */
  WWW_BASE_URL: 'https://www.telegramdownloadmedia.com',
  /** 新版插件统一登录页路径；旧 /extension-login 保留给已发布旧扩展。 */
  EXTENSION_LOGIN_PATH: '/extension-login-v2',
  /** Pricing 页路径 */
  PRICING_PATH: '/pricing/'
} as const

const WEBSITE_BASE_ORIGIN = new URL(WEBSITE.BASE_URL).origin

/** 官网外部消息可接受的 origin（externally_connectable 来源白名单）。 */
export const WEBSITE_AUTH_ORIGINS = [
  WEBSITE_BASE_ORIGIN,
  ...(WEBSITE_BASE_ORIGIN === WEBSITE.PRODUCTION_BASE_URL ? [WEBSITE.WWW_BASE_URL] : [])
] as const

/** 兼容旧代码的导出别名 */
export const API_CONFIG = {
  BASE_URL: API.BASE_URL,
  TIMEOUT: API.TIMEOUT,
  RETRY_COUNT: API.RETRY_COUNT,
  RETRY_DELAY: API.RETRY_DELAY
} as const

/** 插件端阿里云 SLS WebTracking mark-log 配置。 */
export const ALI_SLS_MARK =
  typeof __ALI_SLS_MARK_CONFIG__ !== 'undefined'
    ? __ALI_SLS_MARK_CONFIG__
    : {
        enabled: false,
        endpoint: '',
        logstore: '',
        topic: 'mark-log',
        source: 'extension'
      }

export const API_ENDPOINTS = API.ENDPOINTS
export const API_PATHS = API.ENDPOINTS

/** HTTP Headers 常量 */
export const HTTP_HEADERS = {
  /** Authorization 前缀 */
  AUTH_PREFIX: 'Bearer ',
  /** Content-Type */
  CONTENT_TYPE: 'application/json',
  /** 设备 ID 请求头 */
  DEVICE_ID: 'X-Device-Id',
  /** 客户端产品请求头 */
  CLIENT_PRODUCT: 'X-Client-Product',
  /** Accept-Language 请求头 */
  ACCEPT_LANGUAGE: 'Accept-Language'
} as const

/** Storage 键常量 */
export const STORAGE_KEYS = {
  /** 访问令牌 */
  ACCESS_TOKEN: 'auth_access_token',
  /** 刷新令牌 */
  REFRESH_TOKEN: 'auth_refresh_token',
  /** 用户信息 */
  USER_INFO: 'auth_user_info',
  /** 设备 ID */
  DEVICE_ID: 'counter_device_id',
  /** 生产构建 DEBUG 日志开关 */
  DEBUG_LOGGING: 'debug_logging'
} as const
