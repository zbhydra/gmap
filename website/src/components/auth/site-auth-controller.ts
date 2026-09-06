/**
 * 站级登录弹窗控制器（全站唯一一份，由 Layout 装配）。
 *
 * 复用 AuthModal 的 DOM 与 homepage auth 登录能力，保留 open/close、Google
 * redirect 换票、邮箱验证码和登录成功事件。导航登录通过 open({ redirectTo })
 * 声明登录后目的地（仅限本站确定路由，持久化到 sessionStorage 以跨 Google
 * OAuth 回跳）；Pricing 待购与 Dashboard 工作区不带 redirect，登录后留在原页。
 */

import {
  cancelGoogleRedirectPrompt,
  clearGoogleRedirectResult,
  DEFAULT_PUBLIC_GOOGLE_CLIENT_ID,
  exchangeGoogleLoginCode,
  getCurrentUser,
  isEmailVerificationRequiredResponse,
  logGoogleAuthStage,
  loginWithEmailCode,
  readGoogleRedirectResult,
  renderGoogleRedirectButton,
  requestGoogleRedirectPrompt,
  sendEmailCode,
  type GoogleLoginResponse,
  type GoogleRedirectPromptOptions,
  type HomepageUserInfo
} from '../../scripts/homepage/auth'
import { ensureDeviceId } from '../../scripts/homepage/device'
import type { RequestContext } from '../../scripts/homepage/api'
import { createSendCodeCooldown } from '../../scripts/homepage/sendCodeCooldown'
import { invalidateSiteSession, setSiteSession } from '../../scripts/site/session'

/** 站级登录成功事件。 */
export const SITE_AUTH_SUCCESS_EVENT = 'site-auth:success'
/** 用户主动关闭登录弹窗事件。 */
export const SITE_AUTH_CLOSE_EVENT = 'site-auth:close'

/** 登录后允许跳转的本站路由（当前即 Dashboard 工作区三页）。 */
const AUTH_REDIRECT_PATHS = ['/dashboard/', '/dashboard/api/', '/dashboard/subscriptions/']
/** 同 tab Google OAuth 回跳后恢复登录后跳转的会话键。 */
const PENDING_AUTH_REDIRECT_KEY = 'site_auth_pending_redirect'

/** 站级登录弹窗 controller 对外接口。 */
export interface SiteAuthController {
  /** 打开登录弹窗；redirectTo 只接受本站确定路由。 */
  open(options?: SiteAuthOpenOptions): void
  /** 关闭登录弹窗。 */
  close(): void
}

/** open() 的触发上下文选项。 */
export interface SiteAuthOpenOptions {
  /** 登录成功后的跳转路由；缺省留在当前页。 */
  redirectTo?: string
}

/** 登录成功事件 payload。 */
export interface SiteAuthSuccessPayload {
  /** 最新 access token。 */
  token: string
  /** auth/me 刷新的用户资料。 */
  user: HomepageUserInfo
}

/** 登录弹窗 DOM 集合。 */
interface SiteAuthElements {
  /** 弹窗根节点。 */
  modal: HTMLElement
  /** 关闭按钮。 */
  closeButtons: HTMLButtonElement[]
  /** 错误文本。 */
  authError: HTMLElement
  /** 邮箱验证码表单。 */
  authForm: HTMLFormElement
  /** 邮箱验证码区域。 */
  emailCodeArea: HTMLElement
  /** 邮箱继续按钮。 */
  emailContinueButton: HTMLButtonElement
  /** Google 登录容器。 */
  googleLoginButton: HTMLElement
  /** 邮箱入口容器。 */
  emailEntry: HTMLElement
  /** 邮箱入口按钮。 */
  emailEntryButton: HTMLButtonElement
  /** 邮箱输入框。 */
  loginEmail: HTMLInputElement
  /** 验证码输入框。 */
  loginCode: HTMLInputElement
  /** 发送验证码按钮。 */
  sendCodeButton: HTMLButtonElement
  /** 验证码状态。 */
  sendCodeStatus: HTMLElement
  /** 登录提交按钮。 */
  loginSubmit: HTMLButtonElement
}

/** 登录弹窗文案。 */
interface SiteAuthCopy {
  /** 发送验证码中。 */
  sendingCode: string
  /** 验证码发送成功。 */
  sendCodeSuccess: string
  /** Google 按钮文案。 */
  continueWithGoogle: string
  /** Google 跳转中文案。 */
  googleLoading: string
  /** 必填邮箱错误。 */
  enterEmailFirst: string
  /** 邮箱和验证码必填错误。 */
  enterEmailAndCode: string
  /** 发送验证码失败。 */
  sendCodeFailed: string
  /** Google 登录失败。 */
  googleSignInFailed: string
  /** Google Client ID 缺失。 */
  googleClientMissing: string
  /** 邮箱登录失败。 */
  signInFailed: string
}

let deviceIdPromise: Promise<string> | null = null

/** 创建站级登录弹窗 controller。 */
export function createSiteAuthController(root: HTMLElement): SiteAuthController {
  const elements = getSiteAuthElements(root)
  const copy = getSiteAuthCopy(root)
  const sendCodeCooldown = createSendCodeCooldown(
    elements.sendCodeButton,
    elements.sendCodeButton.textContent?.trim() || 'Send again'
  )
  let googleRedirectButtonRendered = false
  let token: string | null = null

  const buildRequestContext = async (): Promise<RequestContext> => ({
    deviceId: await getSiteDeviceId(),
    token
  })

  const openEmailForm = (): void => {
    setHidden(elements.authForm, false)
    setHidden(elements.emailEntry, true)
    elements.loginEmail.focus()
  }

  const openCodeArea = (): void => {
    setHidden(elements.authForm, false)
    setHidden(elements.emailEntry, true)
    setHidden(elements.emailCodeArea, false)
    setHidden(elements.loginSubmit, false)
    setHidden(elements.emailContinueButton, true)
  }

  const resetToGoogleFirst = (): void => {
    setMessage(elements.authError, '')
    setHidden(elements.authForm, true)
    setHidden(elements.emailEntry, false)
    setHidden(elements.emailCodeArea, true)
    setHidden(elements.loginSubmit, true)
    setHidden(elements.emailContinueButton, false)
    elements.sendCodeStatus.textContent = ''
  }

  const hide = (): void => {
    cancelGoogleRedirectPrompt('Site auth modal closed.')
    setHidden(elements.modal, true)
  }

  const close = (): void => {
    hide()
    clearPendingAuthRedirect()
    window.dispatchEvent(new CustomEvent(SITE_AUTH_CLOSE_EVENT))
  }

  const finishLogin = async (accessToken: string): Promise<void> => {
    token = accessToken
    invalidateSiteSession()
    const user = await getCurrentUser(await buildRequestContext())
    // 登录结果直接写入共享会话：导航入口与工作区消费同一份数据，不再二次 auth/me。
    setSiteSession({ status: 'signed-in', token: accessToken, user })
    hide()
    window.dispatchEvent(new CustomEvent<SiteAuthSuccessPayload>(SITE_AUTH_SUCCESS_EVENT, {
      detail: { token: accessToken, user }
    }))
    const redirect = consumePendingAuthRedirect()
    if (redirect) {
      window.location.assign(redirect)
    }
  }

  const handleGoogleCredentialLogin = async (
    response: GoogleLoginResponse,
    credentialSource: string
  ): Promise<void> => {
    logGoogleAuthStage('info', 'site_google_one_tap_backend_response', {
      credentialSource,
      requiresEmailVerification: isEmailVerificationRequiredResponse(response)
    })

    if (isEmailVerificationRequiredResponse(response)) {
      controller.open()
      openEmailForm()
      elements.loginEmail.value = response.email
      elements.loginCode.value = ''
      elements.sendCodeStatus.textContent = copy.sendCodeSuccess
      openCodeArea()
      sendCodeCooldown.start()
      return
    }

    await finishLogin(response.access_token)
  }

  const ensureGoogleRedirectButtonRendered = (): void => {
    if (googleRedirectButtonRendered) {
      return
    }
    const clientId = getGoogleClientId()
    if (!clientId) {
      // PUBLIC_GOOGLE_CLIENT_ID 为占位空值是预期配置状态（购买链路接入时回填），warn 级即可，
      // error 级会被 Lighthouse best-practices 计为 console error。
      logGoogleAuthStage('warn', 'site_redirect_button_client_id_missing')
      setMessage(elements.authError, copy.googleClientMissing)
      return
    }

    try {
      renderGoogleRedirectButton(elements.googleLoginButton, clientId, {
        source: 'site_google_button',
        label: copy.continueWithGoogle,
        loadingLabel: copy.googleLoading
      })
      googleRedirectButtonRendered = true
    } catch (error) {
      console.error(error)
      setMessage(elements.authError, error instanceof Error ? error.message : copy.googleSignInFailed)
    }
  }

  const runGoogleLogin = async (options: GoogleRedirectPromptOptions = {}): Promise<void> => {
    const clientId = getGoogleClientId()
    if (!clientId) {
      setMessage(elements.authError, copy.googleClientMissing)
      return
    }

    try {
      await requestGoogleRedirectPrompt(clientId, await buildRequestContext(), {
        ...options,
        onCredentialLogin: handleGoogleCredentialLogin
      })
    } catch (error) {
      console.error(
        '[site-auth] Google Identity prompt failed.',
        { source: options.source ?? 'site_prompt' },
        error
      )
      if (!options.silentFailure) {
        setMessage(elements.authError, error instanceof Error ? error.message : copy.googleSignInFailed)
      }
    }
  }

  const handleGoogleRedirectResult = async (): Promise<void> => {
    const result = readGoogleRedirectResult()
    if (!result) {
      return
    }

    clearGoogleRedirectResult()
    if (result.emailVerificationEmail) {
      controller.open()
      openEmailForm()
      elements.loginEmail.value = result.emailVerificationEmail
      elements.loginCode.value = ''
      elements.sendCodeStatus.textContent = copy.sendCodeSuccess
      openCodeArea()
      sendCodeCooldown.start()
      return
    }

    if (result.error || !result.code) {
      controller.open()
      setMessage(elements.authError, copy.googleSignInFailed)
      return
    }

    try {
      const response = await exchangeGoogleLoginCode(result.code, await buildRequestContext())
      await finishLogin(response.access_token)
    } catch (error) {
      console.error(error)
      controller.open()
      setMessage(elements.authError, error instanceof Error ? error.message : copy.googleSignInFailed)
    }
  }

  const controller: SiteAuthController = {
    open(options: SiteAuthOpenOptions = {}): void {
      savePendingAuthRedirect(options.redirectTo)
      resetToGoogleFirst()
      setHidden(elements.modal, false)
      ensureGoogleRedirectButtonRendered()
      void runGoogleLogin({ silentFailure: true, source: 'site_auto_prompt' })
    },
    close
  }

  elements.closeButtons.forEach(button => {
    button.addEventListener('click', () => controller.close())
  })
  elements.emailEntryButton.addEventListener('click', () => {
    cancelGoogleRedirectPrompt('Email code login selected on site.')
    openEmailForm()
  })
  elements.emailContinueButton.addEventListener('click', () => {
    void sendCode()
  })
  elements.sendCodeButton.addEventListener('click', () => {
    void sendCode()
  })
  elements.authForm.addEventListener('submit', event => {
    event.preventDefault()
    void loginWithCode()
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !elements.modal.hidden) {
      controller.close()
    }
  })

  ensureGoogleRedirectButtonRendered()
  void handleGoogleRedirectResult()

  return controller

  async function sendCode(): Promise<void> {
    const email = elements.loginEmail.value.trim()
    if (!email) {
      setMessage(elements.authError, copy.enterEmailFirst)
      return
    }

    setMessage(elements.authError, '')
    elements.sendCodeButton.disabled = true
    elements.emailContinueButton.disabled = true
    elements.sendCodeStatus.textContent = copy.sendingCode

    try {
      await sendEmailCode(email, await buildRequestContext())
      elements.sendCodeStatus.textContent = copy.sendCodeSuccess
      openCodeArea()
      sendCodeCooldown.start()
    } catch (error) {
      console.error(error)
      setMessage(elements.authError, error instanceof Error ? error.message : copy.sendCodeFailed)
      elements.sendCodeStatus.textContent = ''
      sendCodeCooldown.reset()
    } finally {
      if (!sendCodeCooldown.isActive()) {
        elements.sendCodeButton.disabled = false
      }
      elements.emailContinueButton.disabled = false
    }
  }

  async function loginWithCode(): Promise<void> {
    const email = elements.loginEmail.value.trim()
    const code = elements.loginCode.value.trim()
    if (!email || !code) {
      setMessage(elements.authError, copy.enterEmailAndCode)
      return
    }

    setMessage(elements.authError, '')
    elements.loginSubmit.disabled = true
    try {
      const response = await loginWithEmailCode(email, code, await buildRequestContext())
      await finishLogin(response.access_token)
    } catch (error) {
      console.error(error)
      setMessage(elements.authError, error instanceof Error ? error.message : copy.signInFailed)
    } finally {
      elements.loginSubmit.disabled = false
    }
  }
}

/** 保存登录后跳转意图；只在白名单路由内覆盖。无 redirectTo 的 open()（Pricing
 * 待购、工作区重开、Google 补邮箱验证回跳分支）保留既有意图，不丢失导航目的地。 */
function savePendingAuthRedirect(redirectTo?: string): void {
  if (redirectTo && AUTH_REDIRECT_PATHS.includes(redirectTo)) {
    window.sessionStorage.setItem(PENDING_AUTH_REDIRECT_KEY, redirectTo)
  }
}

/** 登录成功时读取并清除跳转意图。 */
function consumePendingAuthRedirect(): string | null {
  const redirect = window.sessionStorage.getItem(PENDING_AUTH_REDIRECT_KEY)
  window.sessionStorage.removeItem(PENDING_AUTH_REDIRECT_KEY)
  return redirect && AUTH_REDIRECT_PATHS.includes(redirect) ? redirect : null
}

/** 用户放弃登录时清除跳转意图。 */
function clearPendingAuthRedirect(): void {
  window.sessionStorage.removeItem(PENDING_AUTH_REDIRECT_KEY)
}

function getSiteAuthElements(root: HTMLElement): SiteAuthElements {
  const query = <T extends HTMLElement>(selector: string): T => {
    const element = root.querySelector<T>(selector)
    if (!element) {
      throw new Error(`[site-auth-controller] Missing element: ${selector}`)
    }
    return element
  }

  return {
    modal: query<HTMLElement>('[data-download-auth-modal]'),
    closeButtons: Array.from(root.querySelectorAll<HTMLButtonElement>('[data-download-auth-close]')),
    authError: query<HTMLElement>('[data-download-auth-error]'),
    authForm: query<HTMLFormElement>('[data-download-auth-form]'),
    emailCodeArea: query<HTMLElement>('[data-download-email-code-area]'),
    emailContinueButton: query<HTMLButtonElement>('[data-download-continue-email]'),
    googleLoginButton: query<HTMLElement>('[data-download-google-login]'),
    emailEntry: query<HTMLElement>('[data-download-email-entry]'),
    emailEntryButton: query<HTMLButtonElement>('[data-download-email-entry-button]'),
    loginEmail: query<HTMLInputElement>('[data-download-login-email]'),
    loginCode: query<HTMLInputElement>('[data-download-login-code]'),
    sendCodeButton: query<HTMLButtonElement>('[data-download-send-code]'),
    sendCodeStatus: query<HTMLElement>('[data-download-send-code-status]'),
    loginSubmit: query<HTMLButtonElement>('[data-download-login-submit]')
  }
}

function getSiteAuthCopy(root: HTMLElement): SiteAuthCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-site-auth-copy]')
  if (!element?.textContent) {
    throw new Error('[site-auth-controller] Missing site auth copy payload.')
  }
  return JSON.parse(element.textContent) as SiteAuthCopy
}

function getGoogleClientId(): string {
  return import.meta.env.PUBLIC_GOOGLE_CLIENT_ID?.trim() || DEFAULT_PUBLIC_GOOGLE_CLIENT_ID
}

function getSiteDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = ensureDeviceId()
  }
  return deviceIdPromise
}

function setHidden(element: HTMLElement, hidden: boolean): void {
  element.hidden = hidden
}

function setMessage(element: HTMLElement, message: string): void {
  element.textContent = message
  element.hidden = message.length === 0
}

declare global {
  interface Window {
    /** 站级登录弹窗 controller。 */
    siteAuthController?: SiteAuthController
  }
}

/**
 * 装配站级登录弹窗（由 SiteAuthModal.astro 的客户端 script 调用，全站仅一份）。
 *
 * 不做模块级自装配：本模块的事件常量被 Vue 工作区与站级脚本引用，Astro SSR
 * 渲染 Vue 组件时会执行整个依赖图，模块顶层访问 document 会直接失败。
 */
export function mountSiteAuthController(root: HTMLElement): SiteAuthController {
  const controller = createSiteAuthController(root)
  window.siteAuthController = controller
  return controller
}
