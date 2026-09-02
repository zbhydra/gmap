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
    /** v3 插件登录：一次性 code 换插件 token 对（无 Bearer，PKCE S256 绑定） */
    AUTH_EXTENSION_LOGIN_EXCHANGE: '/api/client/auth/extension-login/exchange',
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

    // ========== Maps Config ==========
    /** 获取 Maps 远程配置（dom/parseSchema/scrape 三组稀疏覆盖） */
    MAPS_CONFIG: '/api/client/maps/config',

    // ========== Maps 集成 ==========
    /** HubSpot 商家同步代理（插件传用户 access token，服务端转发 HubSpot API） */
    MAPS_HUBSPOT_SYNC: '/api/client/maps/hubspot/sync',

    // ========== Maps 配额（013 A11，U7） ==========
    /** 查询当月配额用量（used/total/period/exhausted） */
    MAPS_USAGE: '/api/client/maps/usage',
    /** 采集完成上报扣减（request_id 幂等） */
    MAPS_USAGE_REPORT: '/api/client/maps/usage/report',

    // ========== Maps 补全（013 A4，U8） ==========
    /** 官网 Email/社媒补全（服务端自研，结果与入参位置对齐） */
    MAPS_ENRICH: '/api/client/maps/enrich',

    // ========== 打点 ==========
    /** 后端 mark 通道（install 事件双报使用） */
    MARK_RECORD: '/api/client/mark/record',

    // ========== 订阅兼容状态 ==========
    /** 获取订阅状态 */
    SUBSCRIPTION_STATUS: '/api/client/subscription/status'
  }
} as const

/** 官网配置 */
export const WEBSITE = {
  /** 官网基础 URL（v3 登录确认页 /extension-login 的宿主） */
  BASE_URL: __WEBSITE_BASE_URL__,
  /** Pricing 页路径 */
  PRICING_PATH: '/pricing/'
} as const

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
  DEBUG_LOGGING: 'debug_logging',
  /** Maps 远程配置缓存（时间戳 + 稀疏覆盖载荷） */
  MAPS_REMOTE_CONFIG: 'maps_remote_config',
  /** Maps 用户设置（个人偏好：间隔/导出格式/字段勾选/自动化开关，013 A9） */
  MAPS_USER_SETTINGS: 'maps_user_settings',
  /** Maps 集成授权（Drive / HubSpot 的 OAuth token 与状态，013 A10） */
  MAPS_INTEGRATION_AUTH: 'maps_integration_auth'
} as const
