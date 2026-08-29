/**
 * 系统设置 API。
 *
 * 提供配置缓存刷新、当前管理员外部 API Key、Google 数据采集、Telegram DOM 和 Telegram Config 配置操作。
 */
import request from "./request";

/** 后端可原样保存的 JSON value。 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** Telegram DOM 全局稀疏覆盖对象。 */
export interface TelegramDomConfig {
  /** 配置键由扩展消费；Admin 不维护字段清单。 */
  [key: string]: JsonValue;
}

/** 新版扩展使用的 Telegram 全局稀疏配置对象。 */
export interface TelegramConfig {
  /** 配置键由扩展消费；Admin 不维护字段清单。 */
  [key: string]: JsonValue;
}

/** 当前管理员 API Key 展示元信息。 */
export interface AdminApiKeyMeta {
  /** 是否已经生成 API Key。 */
  has_api_key: boolean;
  /** 可展示前缀；未生成时为空字符串。 */
  api_key_prefix: string;
  /** API Key 生成时间，毫秒时间戳；未生成时为空。 */
  api_key_created_at: number | null;
}

/** 新生成的管理员 API Key；完整 key 只在本次响应返回。 */
export interface GeneratedAdminApiKey {
  /** 完整 API Key。 */
  api_key: string;
  /** 可展示前缀。 */
  api_key_prefix: string;
  /** API Key 生成时间，毫秒时间戳。 */
  api_key_created_at: number;
}

/** 配置缓存刷新结果。 */
export interface ConfigCacheRefreshResult {
  /** 已刷新服务名。 */
  refreshed_services: string[];
  /** 刷新完成时间，毫秒时间戳。 */
  refreshed_at: number;
}

/** Google 数据采集配置、授权与最近采集状态。 */
export interface GoogleDataStatus {
  /** 后端 Google OAuth、GSC、GA4 必要配置是否完整。 */
  configured: boolean;
  /** 是否已有有效 Google 授权。 */
  authorized: boolean;
  /** 最近授权完成时间，毫秒时间戳；未授权时为空。 */
  last_authorized_at: number | null;
  /** 最近 GSC 采集成功时间，毫秒时间戳；未成功时为空。 */
  last_gsc_success_at: number | null;
  /** 最近 GSC 错误摘要；无错误时为空字符串。 */
  last_gsc_error_msg: string;
  /** 最近 GA4 采集成功时间，毫秒时间戳；未成功时为空。 */
  last_ga4_success_at: number | null;
  /** 最近 GA4 错误摘要；无错误时为空字符串。 */
  last_ga4_error_msg: string;
  /** 已配置的 Google Search Console 站点 URL。 */
  gsc_site_url: string;
  /** 已配置的 Google Analytics 4 Property ID。 */
  ga4_property_id: string;
  /** 已配置的 Google OAuth Client ID。 */
  client_id: string;
  /** 是否已配置 Google OAuth Client Secret。 */
  client_secret_configured: boolean;
  /** 已配置的 Google OAuth 回调地址。 */
  redirect_uri: string;
}

/** Google 数据采集配置保存请求。 */
export interface GoogleDataConfigUpdateRequest {
  /** Google OAuth Web Client ID。 */
  client_id: string;
  /** Google OAuth Web Client Secret；留空表示保留旧值。 */
  client_secret: string;
  /** Google Search Console Site URL。 */
  gsc_site_url: string;
  /** Google Analytics 4 Property ID。 */
  ga4_property_id: string;
}

/** Google OAuth 授权跳转地址。 */
export interface GoogleDataAuthorizationUrl {
  /** 管理员需要跳转到的 Google OAuth URL。 */
  authorization_url: string;
}

/** 创建 Google OAuth 授权 URL 请求。 */
export interface GoogleDataAuthorizationUrlRequest {
  /** 发起授权的 Admin SPA 根地址，授权完成后按此地址跳回。 */
  admin_return_base_url: string;
}

/** Google 数据采集断开授权结果。 */
export interface GoogleDataDisconnectResult {
  /** 是否已断开有效授权。 */
  disconnected: boolean;
}

/** 手动触发一次 Google 数据采集的结果。 */
export interface GoogleDataCollectOnceResult {
  /** 本次是否保存了 GSC 指标快照。 */
  gsc_saved: boolean;
  /** 本次是否保存了 GA4 指标快照。 */
  ga4_saved: boolean;
  /** 本次采集失败摘要列表；空数组表示无错误。 */
  errors: string[];
  /** 采集完成时间，毫秒时间戳。 */
  collected_at: number;
}

/** 查询当前管理员 API Key 元信息。 */
export function getAdminApiKeyMeta() {
  return request.get<never, AdminApiKeyMeta>("/system-settings/api-key");
}

/** 生成或重新生成当前管理员 API Key。 */
export function generateAdminApiKey() {
  return request.post<never, GeneratedAdminApiKey>("/system-settings/api-key");
}

/** 刷新当前业务进程内配置读取缓存。 */
export function refreshConfigCache() {
  return request.post<never, ConfigCacheRefreshResult>(
    "/system-settings/config-cache/refresh",
  );
}

/** 读取 Telegram DOM 全局稀疏覆盖。 */
export function getTelegramDomConfig() {
  return request.get<never, TelegramDomConfig>(
    "/system-settings/telegram-dom",
  );
}

/** 原样覆盖保存 Telegram DOM 全局稀疏对象。 */
export function saveTelegramDomConfig(data: TelegramDomConfig) {
  return request.post<TelegramDomConfig, TelegramDomConfig>(
    "/system-settings/telegram-dom",
    data,
  );
}

/** 读取新版扩展使用的 Telegram 全局稀疏配置。 */
export function getTelegramConfig() {
  return request.get<never, TelegramConfig>(
    "/system-settings/telegram-config",
  );
}

/** 原样覆盖保存新版扩展使用的 Telegram 全局稀疏对象。 */
export function saveTelegramConfig(data: TelegramConfig) {
  return request.post<TelegramConfig, TelegramConfig>(
    "/system-settings/telegram-config",
    data,
  );
}

/** 查询 Google 数据采集配置、授权与最近采集状态。 */
export function getGoogleDataStatus() {
  return request.get<never, GoogleDataStatus>(
    "/system-settings/google-data/status",
  );
}

/** 保存 Google 数据采集配置。 */
export function saveGoogleDataConfig(data: GoogleDataConfigUpdateRequest) {
  return request.post<GoogleDataConfigUpdateRequest, GoogleDataStatus>(
    "/system-settings/google-data/config",
    data,
  );
}

/** 创建 Google 数据采集 OAuth 授权 URL。 */
export function createGoogleDataAuthorizationUrl(
  data: GoogleDataAuthorizationUrlRequest,
) {
  return request.post<
    GoogleDataAuthorizationUrlRequest,
    GoogleDataAuthorizationUrl
  >(
    "/system-settings/google-data/oauth/authorize",
    data,
  );
}

/** 断开 Google 数据采集授权。 */
export function disconnectGoogleData() {
  return request.post<never, GoogleDataDisconnectResult>(
    "/system-settings/google-data/disconnect",
  );
}

/** 手动触发一次 Google 数据采集。 */
export function collectGoogleDataOnce() {
  return request.post<never, GoogleDataCollectOnceResult>(
    "/system-settings/google-data/collect-once",
  );
}
