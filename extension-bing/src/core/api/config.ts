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

    // ========== Bing Config ==========
    /** 获取 Bing 远程配置（adapters/parse/scrape/export/panel 五组稀疏覆盖） */
    BING_CONFIG: '/api/client/bing/config',

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
  /** 官网基础 URL */
  BASE_URL: __WEBSITE_BASE_URL__,
  /** Pricing 页路径 */
  PRICING_PATH: '/pricing/'
} as const

/**
 * 官网外部消息可接受 origin（externally_connectable 来源白名单）。
 *
 * 唯一派生源在构建期：vite 把完整白名单经 `__WEBSITE_AUTH_ORIGINS__` 注入，
 * manifest matches 与运行时 `onMessageExternal` 的 sender.origin 校验读同一
 * 份值（真实域名确定后改 EXTENSION_WEBSITE_BASE_URL 一处即全端生效）。
 * 此处兜底仅覆盖无 define 注入的环境（单测），退化为 base URL 单一 origin。
 */
export const WEBSITE_AUTH_ORIGINS: readonly string[] =
  typeof __WEBSITE_AUTH_ORIGINS__ !== 'undefined'
    ? __WEBSITE_AUTH_ORIGINS__
    : [new URL(WEBSITE.BASE_URL).origin]

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
  /** Bing 远程配置缓存（时间戳 + 稀疏覆盖载荷） */
  BING_REMOTE_CONFIG: 'bing_remote_config'
} as const
