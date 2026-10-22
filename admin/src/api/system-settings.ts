/**
 * 系统设置 API。
 *
 * 提供配置缓存刷新、管理员外部 API Key 与 Collector 配置操作。
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

export interface GmapCollectorInstance {
  url: string;
  api_key: string;
}

export interface GmapCollectorConfig {
  collectors: GmapCollectorInstance[];
  proxies: string[];
}

export type GmapCollectorTestResult =
  | { ok: true }
  | {
      ok: false;
      reason: "timeout" | "transport" | "unauthorized" | "http_error" | "invalid_response";
    };

/** Cloudflare R2 对象存储配置。 */
export interface R2StorageConfig {
  id: string;
  name: string;
  provider: "R2";
  account_id: string;
  bucket: string;
  access_key_id: string;
  secret_access_key: string;
}

/** 阿里云 OSS 对象存储配置。 */
export interface AliOssStorageConfig {
  id: string;
  name: string;
  provider: "AliOSS";
  endpoint: string;
  bucket: string;
  access_key_id: string;
  access_key_secret: string;
}

export type ObjectStorageItem = R2StorageConfig | AliOssStorageConfig;

/** 全部配置与供新任务使用的唯一启用项，整对象提交。 */
export interface ObjectStorageConfig {
  active_id: string | null;
  items: ObjectStorageItem[];
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
  return request.post<never, ConfigCacheRefreshResult>("/system-settings/config-cache/refresh");
}

export function getGmapCollectorConfig() {
  return request.get<never, GmapCollectorConfig>("/system-settings/gmap-collector");
}

export function saveGmapCollectorConfig(config: GmapCollectorConfig) {
  return request.post<never, GmapCollectorConfig>("/system-settings/gmap-collector", config);
}

export function testGmapCollector(collector: GmapCollectorInstance) {
  return request.post<never, GmapCollectorTestResult>("/system-settings/gmap-collector/test", collector);
}

export interface GmapProxyCheckResult {
  proxy: string;
  status: "ok" | "http_error" | "timeout" | "connection_error";
  status_code: number | null;
  duration_ms: number;
}

export function checkGmapProxies(proxies: string[]) {
  return request.post<never, { items: GmapProxyCheckResult[] }>(
    "/system-settings/gmap-collector/check-proxies",
    { proxies },
  );
}

/** 查询对象存储配置。 */
export function getObjectStorageConfig() {
  return request.get<never, ObjectStorageConfig>("/system-settings/object-storage");
}

/** 保存全部对象存储配置，并返回后端归一化结果。 */
export function saveObjectStorageConfig(config: ObjectStorageConfig) {
  return request.post<never, ObjectStorageConfig>("/system-settings/object-storage", config);
}
