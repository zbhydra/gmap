/**
 * 官网登录来源校验工具与 externally_connectable 桥接协议。
 *
 * background 使用统一 origin 白名单与外部消息契约，确保全站同步消息只能来自官网官方来源。
 */

import { WEBSITE, WEBSITE_AUTH_ORIGINS } from '@/core/api/config'

/** 官网通知插件登录态已变化的固定消息类型（externally_connectable）。 */
export const EXTENSION_AUTH_CHANGED_MESSAGE_TYPE = 'TG_DOWNLOAD_EXTENSION_AUTH_CHANGED_V2' as const

/** 官网 v2 登录页请求返回 Telegram 的固定消息类型（externally_connectable）。 */
export const EXTENSION_RETURN_MESSAGE_TYPE = 'TG_DOWNLOAD_EXTENSION_RETURN_V2' as const

/** externally_connectable 消息回执结构。 */
export interface ExternalBridgeResponse {
  /** 是否已处理成功。 */
  ok: boolean
  /** 失败时的可排查错误。 */
  message?: string
}

/** 构建插件统一登录页 URL。 */
export function buildExtensionLoginUrl(): string {
  return new URL(WEBSITE.EXTENSION_LOGIN_PATH, WEBSITE.BASE_URL).toString()
}

/** 判断 origin 是否属于允许的官网来源。 */
export function isAllowedWebsiteAuthOrigin(origin: string): boolean {
  return WEBSITE_AUTH_ORIGINS.some(allowedOrigin => origin === allowedOrigin)
}
