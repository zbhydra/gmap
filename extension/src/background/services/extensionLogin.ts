/**
 * 插件登录 v3 · browser identity（docs/feat/007 用户系统 plans/006）。
 *
 * background 是登录 owner（popup 生命周期覆盖不了登录窗口）：popup 经
 * openExtensionLogin RPC 发起，全流程为——
 *
 *   PKCE(S256) 生成 → launchWebAuthFlow 打开官网 /extension-login 确认页
 *   → 回调 URL fragment 解析一次性 code → exchange 换插件 token 对（携带
 *   旧 token 供服务端 best-effort 撤销）→ 快照比对条件提交三键写入。
 *
 * 失败合同：任何一步失败（关窗 / 参数 / exchange / 提交冲突）统一捕获返回
 * {opened:false}——不重试、不清原登录态、不写半截态；登录最终结果以
 * chrome.storage 三键变化为准，不依赖本 RPC 返回值。
 */

import { authApi } from '@/core/api'
import { WEBSITE } from '@/core/api/config'
import { logger } from '@/core/utils/logger'
import type { BackgroundOpenExtensionLoginResponse } from '../types'

/** 登录回调 path（chrome.identity.getRedirectURL 的 path 段）。 */
const LOGIN_REDIRECT_PATH = 'extension-login'

/** PKCE verifier 的随机字节数（Base64URL 编码后固定 43 字符）。 */
const PKCE_VERIFIER_BYTES = 32

/** 官网登录确认页路径（website /extension-login，协议合同见 plans/006 §3）。 */
const WEBSITE_LOGIN_PATH = '/extension-login/'

/** RFC 4648 §5 Base64URL 编码（无 padding）。 */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * 生成 PKCE S256 校验对。
 *
 * verifier = 32 字节随机 → Base64URL（43 字符）；challenge =
 * BASE64URL(SHA256(verifier))。固定 S256 不传算法参数；无 state（PKCE 即
 * public client 的 CSRF 防护，RFC 9700 §2.1）。
 */
async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const random = new Uint8Array(PKCE_VERIFIER_BYTES)
  crypto.getRandomValues(random)
  const verifier = base64UrlEncode(random)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return { verifier, challenge: base64UrlEncode(new Uint8Array(digest)) }
}

/** launchWebAuthFlow 的 Promise 封装（用户关窗经 runtime.lastError 走 reject）。 */
function launchWebAuthFlow(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url, interactive: true }, redirectUrl => {
      const error = chrome.runtime.lastError
      if (error || typeof redirectUrl !== 'string' || redirectUrl.length === 0) {
        reject(
          new Error(`[ExtensionLogin] launchWebAuthFlow 失败: ${error?.message ?? '回调 URL 为空'}`)
        )
        return
      }
      resolve(redirectUrl)
    })
  })
}

/** 从回调 URL fragment 解析一次性 code；缺失返回 null（用户取消 / 非法回调）。 */
function parseCallbackCode(redirectUrl: string): string | null {
  try {
    const hash = new URL(redirectUrl).hash
    const code = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash).get('code')
    return code !== null && code.length > 0 ? code : null
  } catch {
    return null
  }
}

/**
 * 发起 v3 插件登录全流程（登录 owner 唯一入口）。
 *
 * opened=true 仅表示登录完成且 token 对已条件提交；完整登录常态超过 popup
 * 侧默认 30 秒 RPC 超时，调用方一律以 storage 三键变化感知结果。
 */
export async function openExtensionLogin(): Promise<BackgroundOpenExtensionLoginResponse> {
  try {
    const { verifier, challenge } = await createPkcePair()
    const redirectUri = chrome.identity.getRedirectURL(LOGIN_REDIRECT_PATH)
    const loginUrl = `${WEBSITE.BASE_URL}${WEBSITE_LOGIN_PATH}?${new URLSearchParams({
      redirect_uri: redirectUri,
      code_challenge: challenge
    }).toString()}`

    const finalUrl = await launchWebAuthFlow(loginUrl)
    const code = parseCallbackCode(finalUrl)
    if (code === null) {
      logger.warn('[ExtensionLogin] 回调缺少 code，放弃登录')
      return { opened: false }
    }

    // exchange 前读三键快照，提交前重读比对：覆盖窗口期内的登出/换号
    const snapshot = await authApi.getAuthSnapshot()
    const tokenResponse = await authApi.exchangeExtensionLogin({
      code,
      code_verifier: verifier,
      old_extension_access_token: snapshot.accessToken ?? undefined,
      old_extension_refresh_token: snapshot.refreshToken ?? undefined
    })

    const committed = await authApi.applyExtensionLogin(tokenResponse, snapshot)
    if (!committed) {
      logger.warn('[ExtensionLogin] storage 快照不一致，放弃写入')
      return { opened: false }
    }

    logger.info('[ExtensionLogin] 登录完成，user_id:', tokenResponse.user.user_id)
    return { opened: true }
  } catch (error) {
    logger.error('[ExtensionLogin] 登录流程失败:', error)
    return { opened: false }
  }
}
