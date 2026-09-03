/**
 * Maps 集成授权与同步核心（013 A10，U9）。
 *
 * 架构决策（已拍板）：Maps 官网不存在（015 未建），授权流简化为插件内直接
 * OAuth——
 * - Drive：`chrome.identity.getAuthToken`（Chrome 内置授权，免管理 client
 *   secret；client_id/scopes 声明在 manifest oauth2 段，构建占位待 hydra 申请）。
 *   token 由 Chrome 管理缓存与刷新，storage 记录的是「用户已授权」状态与
 *   revoke 所需的 token 快照；
 * - HubSpot：`chrome.identity.launchWebAuthFlow`（refresh token 模式，
 *   client_id/secret 为占位常量——真实凭证申请后替换，届时凭证入插件包的
 *   暴露面与竞品云函数代理方案一并重新评估）。
 *
 * 存储复用 settings 模式（静态类 + storageManager + STORAGE_KEYS 集中声明），
 * 一个 storage key 存双集成（`{drive, hubspot}`，未授权侧为 null）。
 *
 * 上传实现（竞品同构，逆向 06/07）：Drive REST multipart 直传由 background
 * SW 发起（host_permissions googleapis.com）；HubSpot 走 backend 代理端点。
 * 消费方：options 页（授权/revoke 联动）与 background 同步服务。
 */

import { storageManager } from '@/core/storage'
import { STORAGE_KEYS } from '@/core/api/config'
import { logger } from '@/core/utils/logger'
import { integrationApi } from '@/core/api'
import type {
  IntegrationHubspotBusiness,
  IntegrationHubspotSyncPayload
} from '@/core/api/integration/types'
import type { MapsPlaceRow } from '../content/parser/types'

// ============================================================================
// 常量与占位凭证
// ============================================================================

/** Drive 授权 scope：drive.file 最小授权（只可访问本插件创建的文件）。 */
export const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

/** HubSpot OAuth 授权端点。 */
const HUBSPOT_AUTHORIZE_URL = 'https://app.hubspot.com/oauth/authorize'

/** HubSpot OAuth token 端点（授权码换 token / refresh token 刷新共用）。 */
const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token'

/** HubSpot 授权 scope：仅写 companies（contacts 归 U8 之后按需扩展）。 */
const HUBSPOT_SCOPES = 'crm.objects.companies.write'

// TODO(maps): HubSpot OAuth client_id/secret 待 hydra 申请后替换；占位值
// 无法通过真实授权。secret 入插件包的暴露面风险见模块头注释。
const HUBSPOT_CLIENT_ID = 'placeholder-hubspot-client-id'
const HUBSPOT_CLIENT_SECRET = 'placeholder-hubspot-client-secret'

/** Drive multipart 上传端点（竞品同构，supportsAllDrives 兼容共享盘）。 */
const DRIVE_UPLOAD_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true'

/** Google OAuth token 吊销端点。 */
const GOOGLE_REVOKE_URL = 'https://accounts.google.com/o/oauth2/revoke'

/** HubSpot access token 刷新提前量（毫秒）：过期前 60s 即视为过期。 */
const HUBSPOT_TOKEN_EXPIRY_BUFFER_MS = 60_000

// ============================================================================
// 类型
// ============================================================================

/** Drive 授权记录（token 快照用于 revoke；上传用 Chrome 现取的有效 token）。 */
export interface DriveIntegrationAuth {
  /** 授权时返回的 access token（可能已被 Chrome 刷新，仅作 revoke 快照）。 */
  accessToken: string
  /** 授权时刻（毫秒时间戳）。 */
  grantedAt: number
}

/** HubSpot 授权记录（refresh token 模式，access token 短时效需刷新）。 */
export interface HubspotIntegrationAuth {
  /** 当前 access token。 */
  accessToken: string
  /** 长效 refresh token。 */
  refreshToken: string
  /** access token 过期时刻（毫秒时间戳）。 */
  expiresAt: number
}

/** 集成授权存储形状（未授权侧为 null）。 */
export interface MapsIntegrationAuth {
  drive: DriveIntegrationAuth | null
  hubspot: HubspotIntegrationAuth | null
}

/** launchWebAuthFlow 授权码回调的解析结果。 */
interface HubspotAuthCodeRedirect {
  code: string
}

// ============================================================================
// 授权存储（settings 模式：静态类 + storageManager）
// ============================================================================

const DEFAULT_INTEGRATION_AUTH: Readonly<MapsIntegrationAuth> = Object.freeze({
  drive: null,
  hubspot: null
})

/** 判断值是否为 Drive 授权记录形状（storage 垃圾值归 null）。 */
function isDriveAuth(value: unknown): value is DriveIntegrationAuth {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as DriveIntegrationAuth).accessToken === 'string' &&
    typeof (value as DriveIntegrationAuth).grantedAt === 'number'
  )
}

/** 判断值是否为 HubSpot 授权记录形状（storage 垃圾值归 null）。 */
function isHubspotAuth(value: unknown): value is HubspotIntegrationAuth {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as HubspotIntegrationAuth).accessToken === 'string' &&
    typeof (value as HubspotIntegrationAuth).refreshToken === 'string' &&
    typeof (value as HubspotIntegrationAuth).expiresAt === 'number'
  )
}

/** 归一化存储形状：非法/缺失字段回 null（保另一侧授权不受污染）。 */
function normalizeIntegrationAuth(stored: unknown): MapsIntegrationAuth {
  if (typeof stored !== 'object' || stored === null) {
    return { ...DEFAULT_INTEGRATION_AUTH }
  }
  const record = stored as Partial<MapsIntegrationAuth>
  return {
    drive: isDriveAuth(record.drive) ? record.drive : null,
    hubspot: isHubspotAuth(record.hubspot) ? record.hubspot : null
  }
}

/**
 * 集成授权管理器（MapsUserSettingsManager 同构：静态类 + storageManager）。
 */
export class MapsIntegrationAuthManager {
  /** 读取双集成授权状态（storage 缺失/形状非法按未授权归一化）。 */
  static async getAuth(): Promise<MapsIntegrationAuth> {
    const stored = await storageManager.get<unknown>(STORAGE_KEYS.MAPS_INTEGRATION_AUTH)
    return normalizeIntegrationAuth(stored)
  }

  /** 写入 Drive 授权记录（保留 HubSpot 侧）。 */
  static async setDriveAuth(value: DriveIntegrationAuth): Promise<void> {
    await this.setSide('drive', value)
  }

  /** 写入 HubSpot 授权记录（保留 Drive 侧）。 */
  static async setHubspotAuth(value: HubspotIntegrationAuth): Promise<void> {
    await this.setSide('hubspot', value)
  }

  /** 写入一侧授权（保留另一侧）。 */
  private static async setSide<K extends 'drive' | 'hubspot'>(
    side: K,
    value: MapsIntegrationAuth[K]
  ): Promise<void> {
    const current = await this.getAuth()
    const next: MapsIntegrationAuth = { ...current, [side]: value }
    await storageManager.set(STORAGE_KEYS.MAPS_INTEGRATION_AUTH, next)
  }

  /** 清除一侧授权（保留另一侧）。 */
  static async clearDriveAuth(): Promise<void> {
    await this.setSide('drive', null)
  }

  /** 清除 HubSpot 授权。 */
  static async clearHubspotAuth(): Promise<void> {
    await this.setSide('hubspot', null)
  }
}

// ============================================================================
// chrome.identity Promise 封装
// ============================================================================

/** 读取 chrome.runtime.lastError 语义的错误消息（回调式 API）。 */
function lastErrorMessage(): string {
  const error = chrome.runtime.lastError
  return error?.message ?? 'unknown identity error'
}

/** getAuthToken 的 Promise 封装（失败抛 Error，消息取自 runtime.lastError）。 */
function getAuthTokenPromise(details: chrome.identity.TokenDetails): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    chrome.identity.getAuthToken(details, result => {
      const token = result?.token
      const error = chrome.runtime.lastError
      if (error || typeof token !== 'string' || token.length === 0) {
        reject(new Error(`chrome.identity.getAuthToken 失败: ${lastErrorMessage()}`))
        return
      }
      resolve(token)
    })
  })
}

/** launchWebAuthFlow 的 Promise 封装。 */
function launchWebAuthFlowPromise(details: chrome.identity.WebAuthFlowDetails): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(details, redirectUrl => {
      const error = chrome.runtime.lastError
      if (error || typeof redirectUrl !== 'string' || redirectUrl.length === 0) {
        reject(new Error(`chrome.identity.launchWebAuthFlow 失败: ${lastErrorMessage()}`))
        return
      }
      resolve(redirectUrl)
    })
  })
}

// ============================================================================
// Drive 授权
// ============================================================================

/**
 * 发起 Drive 授权（交互式；options 页开关点击时调用）。
 *
 * 成功后把授权记录写入 storage（「已授权」状态 + revoke 快照）。
 */
export async function authorizeDrive(): Promise<DriveIntegrationAuth> {
  const token = await getAuthTokenPromise({ interactive: true, scopes: [DRIVE_FILE_SCOPE] })
  const auth: DriveIntegrationAuth = { accessToken: token, grantedAt: Date.now() }
  await MapsIntegrationAuthManager.setDriveAuth(auth)
  return auth
}

/**
 * 现取有效 Drive token（background 上传用；Chrome 自动走缓存/刷新）。
 *
 * 静默模式（interactive:false）：未授权或需要交互时直接失败返回 null，
 * 不弹窗打断导出链路。
 */
export async function getDriveAccessToken(): Promise<string | null> {
  try {
    return await getAuthTokenPromise({ interactive: false, scopes: [DRIVE_FILE_SCOPE] })
  } catch (error) {
    logger.error('[MapsIntegrations] 获取 Drive token 失败:', error)
    return null
  }
}

/**
 * 吊销 Drive 授权：移除 Chrome 缓存 token + 调 Google 吊销端点 + 清 storage。
 *
 * 网络吊销失败不阻断本地清理（局部可失败：storage 已清，导出链路不会再拿
 * 到 token；吊销端点偶发不可达时 Google 侧 token 自然过期）。
 */
export async function revokeDriveAuth(): Promise<void> {
  const { drive } = await MapsIntegrationAuthManager.getAuth()
  if (drive === null) {
    return
  }

  try {
    await new Promise<void>((resolve, reject) => {
      chrome.identity.removeCachedAuthToken({ token: drive.accessToken }, () => {
        const error = chrome.runtime.lastError
        if (error) {
          reject(new Error(`removeCachedAuthToken 失败: ${error.message}`))
          return
        }
        resolve()
      })
    })
  } catch (error) {
    logger.error('[MapsIntegrations] 移除缓存 Drive token 失败:', error)
  }

  try {
    await fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(drive.accessToken)}`, {
      method: 'POST'
    })
  } catch (error) {
    logger.error('[MapsIntegrations] 吊销 Drive token 请求失败:', error)
  }

  await MapsIntegrationAuthManager.clearDriveAuth()
}

// ============================================================================
// HubSpot 授权（launchWebAuthFlow + refresh token 模式）
// ============================================================================

/** 构造 launchWebAuthFlow 的 redirect_uri（扩展回调域）。 */
function hubspotRedirectUri(): string {
  return chrome.identity.getRedirectURL()
}

/** 构造 HubSpot OAuth 授权页 URL。 */
function buildHubspotAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: HUBSPOT_CLIENT_ID,
    scopes: HUBSPOT_SCOPES,
    redirect_uri: hubspotRedirectUri(),
    response_type: 'code'
  })
  return `${HUBSPOT_AUTHORIZE_URL}?${params.toString()}`
}

/** 从回调 URL 解析授权码；用户拒绝（error 参数）或缺失 code 时返回 null。 */
function parseHubspotAuthCode(redirectUrl: string): HubspotAuthCodeRedirect | null {
  if (!URL.canParse(redirectUrl)) {
    return null
  }
  const code = new URL(redirectUrl).searchParams.get('code')
  return code !== null && code.length > 0 ? { code } : null
}

/** HubSpot token 端点响应形状（需要的字段）。 */
interface HubspotTokenResponse {
  access_token?: unknown
  refresh_token?: unknown
  expires_in?: unknown
}

/** 校验并提取 token 响应字段。 */
function parseHubspotTokenResponse(body: HubspotTokenResponse): {
  accessToken: string
  refreshToken: string | null
  expiresAt: number
} | null {
  if (typeof body.access_token !== 'string' || typeof body.expires_in !== 'number') {
    return null
  }
  return {
    accessToken: body.access_token,
    refreshToken: typeof body.refresh_token === 'string' ? body.refresh_token : null,
    expiresAt: Date.now() + body.expires_in * 1000
  }
}

/**
 * 发起 HubSpot 授权（交互式弹窗；授权码换 token 后落 storage）。
 *
 * 刷新 token 缺失时拒绝写入（refresh token 模式必须拿到长效凭证）。
 */
export async function authorizeHubspot(): Promise<HubspotIntegrationAuth> {
  const redirectUrl = await launchWebAuthFlowPromise({
    url: buildHubspotAuthorizeUrl(),
    interactive: true
  })
  const redirect = parseHubspotAuthCode(redirectUrl)
  if (redirect === null) {
    throw new Error('[MapsIntegrations] HubSpot 授权回调缺少 code（用户拒绝或授权失败）')
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: redirect.code,
    redirect_uri: hubspotRedirectUri(),
    client_id: HUBSPOT_CLIENT_ID,
    client_secret: HUBSPOT_CLIENT_SECRET
  })
  const response = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  if (!response.ok) {
    throw new Error(`HubSpot token 交换失败: HTTP ${response.status}`)
  }

  const parsed = parseHubspotTokenResponse((await response.json()) as HubspotTokenResponse)
  if (parsed === null || parsed.refreshToken === null) {
    throw new Error('[MapsIntegrations] HubSpot token 响应形状非法')
  }

  const auth: HubspotIntegrationAuth = {
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken,
    expiresAt: parsed.expiresAt
  }
  await MapsIntegrationAuthManager.setHubspotAuth(auth)
  return auth
}

/**
 * 现取有效 HubSpot token：未过期直接用；过期（或临近过期）用 refresh token
 * 刷新并更新 storage。
 *
 * 刷新失败抛错（调用方按单路失败处理）；无授权记录返回 null。
 */
export async function getHubspotAccessToken(): Promise<string | null> {
  const { hubspot } = await MapsIntegrationAuthManager.getAuth()
  if (hubspot === null) {
    return null
  }
  if (hubspot.expiresAt - HUBSPOT_TOKEN_EXPIRY_BUFFER_MS > Date.now()) {
    return hubspot.accessToken
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: hubspot.refreshToken,
    client_id: HUBSPOT_CLIENT_ID,
    client_secret: HUBSPOT_CLIENT_SECRET
  })
  const response = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  if (!response.ok) {
    throw new Error(`HubSpot token 刷新失败: HTTP ${response.status}`)
  }

  const parsed = parseHubspotTokenResponse((await response.json()) as HubspotTokenResponse)
  if (parsed === null) {
    throw new Error('[MapsIntegrations] HubSpot 刷新响应形状非法')
  }

  // refresh token 响应可以不带新 refresh_token（HubSpot 语义：沿用旧的）
  const next: HubspotIntegrationAuth = {
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken ?? hubspot.refreshToken,
    expiresAt: parsed.expiresAt
  }
  await MapsIntegrationAuthManager.setHubspotAuth(next)
  return next.accessToken
}

// ============================================================================
// Drive 上传（REST multipart，竞品 background mod_176 同构）
// ============================================================================

/**
 * 构建 Drive multipart 请求体（纯函数，单测直接断言构造）。
 *
 * 形态（multipart/related，两段）：metadata JSON（文件名 + MIME）+ CSV 文本。
 * 各段 header 与 body 之间严格单空行（RFC 2046）——多余空行会被 Drive 当作
 * CSV 首行。boundary 取随机 UUID，与 CSV 内容碰撞概率可忽略，文本原样内嵌。
 */
export function buildDriveMultipartBody(
  boundary: string,
  filename: string,
  csvContent: string
): string {
  const metadata = JSON.stringify({ name: filename, mimeType: 'text/csv' })
  return [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    'Content-Type: text/csv',
    '',
    csvContent,
    `--${boundary}--`,
    ''
  ].join('\r\n')
}

/**
 * 上传 CSV 到 Google Drive（调用方需先取得有效 token）。
 *
 * 非 2xx 抛错（调用方按单路失败处理，不阻断导出与另一路同步）。
 */
export async function uploadCsvToDrive(
  token: string,
  filename: string,
  csvContent: string
): Promise<void> {
  const boundary = `gme-drive-${crypto.randomUUID()}`
  const response = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: buildDriveMultipartBody(boundary, filename, csvContent)
  })
  if (!response.ok) {
    throw new Error(`Drive 上传失败: HTTP ${response.status}`)
  }
}

// ============================================================================
// HubSpot 商家映射与同步
// ============================================================================

/**
 * 把去重后的商家行映射为 HubSpot companies 载荷（缺街道回退完整地址）。
 */
export function buildHubspotBusinesses(
  rows: readonly MapsPlaceRow[]
): IntegrationHubspotBusiness[] {
  return rows.map(row => ({
    name: row.name,
    domain: row.domain,
    phone: row.phone,
    address: row.street.length > 0 ? row.street : row.fullAddress,
    city: row.municipality
  }))
}

/**
 * 经 backend 代理端点同步商家到 HubSpot（token 放请求体，见 integrationApi 注释）。
 */
export async function syncBusinessesToHubspot(
  token: string,
  businesses: readonly IntegrationHubspotBusiness[]
): Promise<{ synced: number }> {
  const payload: IntegrationHubspotSyncPayload = {
    token,
    businesses: businesses.map(business => ({ ...business }))
  }
  return integrationApi.syncBusinessesToHubspot(payload)
}
