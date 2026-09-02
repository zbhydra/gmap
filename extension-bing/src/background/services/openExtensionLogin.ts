/**
 * v3 browser identity 登录 provider（006 §3 协议合同）。
 *
 * PKCE（verifier = 32 随机字节 Base64URL、challenge = S256、无 state）→
 * chrome.identity.getRedirectURL('extension-login') 回调 → launchWebAuthFlow
 * 打开官网 /extension-login/ 确认页 → fragment 解析一次性 code →
 * authStore.applyExtensionLogin（exchange + 响应合同校验 + 快照比对提交 +
 * 订阅联动）。登录 owner 唯一入口：popup 与面板两处登录按钮都走本 RPC。
 *
 * 任何失败（关窗、缺 code、exchange、提交冲突）统一返回 {opened:false}，
 * 不写半截态、不重试、不清原登录态；登录最终结果以 storage 变化为准
 * （完整登录常态超过 RPC 30 秒默认超时，调用方按超时静默复位即可）。
 */

import { WEBSITE } from '@/core/api/config'
import type { JsonValue, RpcContext } from '@/core/rpc/types'
import { logger } from '@/core/utils/logger'
import type { BackgroundOpenExtensionLoginResponse } from '../types'
import { getBackgroundAuthStore } from './backgroundStores'

/** 官网 v3 登录确认页路径（Maps / Bing 插件共用同一页）。 */
const EXTENSION_LOGIN_PATH = '/extension-login/'
/** browser identity 回调 path 段（getRedirectURL 拼进 chromiumapp.org 回调域）。 */
const REDIRECT_PATH = 'extension-login'
/** 32 随机字节 Base64URL 后恰为 RFC 7636 最短 43 字符 verifier。 */
const PKCE_VERIFIER_BYTE_LENGTH = 32

/**
 * 发起 v3 browser identity 登录。
 *
 * @returns opened=true 表示登录已提交完成；false 表示任一步失败，
 *   插件登录态保持原状，用户可直接再次点击登录。
 */
export async function handleOpenExtensionLogin(
  _params: JsonValue | undefined,
  _context: RpcContext
): Promise<BackgroundOpenExtensionLoginResponse> {
  try {
    const codeVerifier = createCodeVerifier()
    const codeChallenge = await createCodeChallenge(codeVerifier)
    const redirectUri = chrome.identity.getRedirectURL(REDIRECT_PATH)
    const loginUrl = new URL(EXTENSION_LOGIN_PATH, WEBSITE.BASE_URL)
    loginUrl.searchParams.set('redirect_uri', redirectUri)
    loginUrl.searchParams.set('code_challenge', codeChallenge)

    const callbackUrl = await launchWebAuthFlow(loginUrl.toString())
    const code = parseFragmentCode(callbackUrl)
    if (!code) {
      logger.warn('[openExtensionLogin] 登录回调缺少 code，放弃登录')
      return { opened: false }
    }

    await getBackgroundAuthStore().applyExtensionLogin(code, codeVerifier)
    logger.info('[openExtensionLogin] v3 登录提交完成')
    return { opened: true }
  } catch (error) {
    logger.error('[openExtensionLogin] v3 登录失败:', error)
    return { opened: false }
  }
}

/** 生成 RFC 7636 S256 verifier：32 随机字节 → 无 padding Base64URL。 */
function createCodeVerifier(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(PKCE_VERIFIER_BYTE_LENGTH))
  return encodeBase64Url(bytes)
}

/** 按 RFC 7636 S256 生成 challenge：BASE64URL(SHA256(verifier))。 */
async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  return encodeBase64Url(new Uint8Array(digest))
}

/** Uint8Array → RFC 4648 Base64URL（去 padding）。 */
function encodeBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** launchWebAuthFlow 的 Promise 封装（lastError / 缺回调 URL 即失败）。 */
function launchWebAuthFlow(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url, interactive: true }, redirectUrl => {
      const lastError = chrome.runtime.lastError
      if (lastError) {
        reject(new Error(`[openExtensionLogin] launchWebAuthFlow 失败: ${lastError.message}`))
        return
      }
      if (!redirectUrl) {
        reject(new Error('[openExtensionLogin] launchWebAuthFlow 未返回回调 URL'))
        return
      }
      resolve(redirectUrl)
    })
  })
}

/** 从回调 URL fragment 解析一次性 code（code 只走 fragment，不进 server 日志）。 */
function parseFragmentCode(callbackUrl: string): string | null {
  const fragment = new URL(callbackUrl).hash.slice(1)
  return new URLSearchParams(fragment).get('code')
}
