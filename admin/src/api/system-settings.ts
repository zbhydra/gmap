/**
 * 系统设置 API。
 *
 * 提供配置缓存刷新、管理员外部 API Key 与采集引擎配置操作。
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

/** gosom 引擎单条 API 配置；weight 参与按权重随机选择。 */
export interface GosomApiItem {
  /** gosom 引擎 API 根地址，http(s):// 开头，无末尾斜杠。 */
  base_url: string;
  /** gosom 引擎 API Key，明文保存。 */
  api_key: string;
  /** 选择权重，1-10000；多条配置按权重加权随机选用。 */
  weight: number;
}

/** gosom 引擎 API 配置；整表覆盖保存，items 为空即清空配置。 */
export interface GosomApiConfig {
  /** 全部 API 配置行。 */
  items: GosomApiItem[];
}

/** Gmap 采集引擎配置；代理按列表顺序使用，concurrency 为每进程预算。 */
export interface GmapEngineConfig {
  provider: "http" | "gosom";
  proxies: string[];
  concurrency: number;
}

/** Cloudflare R2 对象存储配置。 */
export interface R2StorageConfig {
  account_id: string;
  bucket: string;
  access_key_id: string;
  secret_access_key: string;
}

/** 阿里云 OSS 对象存储配置。 */
export interface AliOssStorageConfig {
  endpoint: string;
  bucket: string;
  access_key_id: string;
  access_key_secret: string;
}

/** 对象存储配置；保存时始终完整提交两组配置。 */
export interface ObjectStorageConfig {
  active: "R2" | "AliOSS";
  R2: R2StorageConfig;
  AliOSS: AliOssStorageConfig;
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

/** 查询 gosom 引擎 API 配置。 */
export function getGosomApiConfig() {
  return request.get<never, GosomApiConfig>("/system-settings/gosom-api");
}

/** 保存 gosom 引擎 API 配置。 */
export function saveGosomApiConfig(config: GosomApiConfig) {
  return request.post<never, GosomApiConfig>("/system-settings/gosom-api", config);
}

/** 查询 Gmap 采集引擎配置。 */
export function getGmapEngineConfig() {
  return request.get<never, GmapEngineConfig>("/system-settings/gmap-engine");
}

/** 保存 Gmap 采集引擎配置，并返回后端归一化结果。 */
export function saveGmapEngineConfig(config: GmapEngineConfig) {
  return request.post<never, GmapEngineConfig>("/system-settings/gmap-engine", config);
}

/** 查询对象存储配置。 */
export function getObjectStorageConfig() {
  return request.get<never, ObjectStorageConfig>("/system-settings/object-storage");
}

/** 完整保存两组对象存储配置，并返回后端归一化结果。 */
export function saveObjectStorageConfig(config: ObjectStorageConfig) {
  return request.post<never, ObjectStorageConfig>(
    "/system-settings/object-storage",
    config,
  );
}
