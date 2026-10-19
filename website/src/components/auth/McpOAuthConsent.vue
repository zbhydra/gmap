<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import type { McpOAuthContent } from '../../i18n/schema'
import { HomepageApiError } from '../../scripts/homepage/api'
import { getStoredAccessToken, logoutCurrentUser } from '../../scripts/homepage/auth'
import { ensureDeviceId } from '../../scripts/homepage/device'
import {
  getSiteSession, invalidateSiteSession, notifySessionExpired, SITE_SESSION_EXPIRED_EVENT
} from '../../scripts/site/session'
import { SITE_AUTH_SUCCESS_EVENT } from './site-auth-controller'
import {
  clearConsentRequest, decideConsent, getConsentDetail, MCP_OAUTH_CODE,
  McpOAuthCredentialChangedError, readConsentEntry,
  type ConsentDetail, type McpOAuthErrorReason
} from '../../scripts/mcp-oauth/client'

const props = defineProps<{ copy: McpOAuthContent }>()
type State = 'loading' | 'signin' | 'ready' | 'redirecting' | 'invalid' | 'request-error' | 'failed'
const TERMINAL_STATES: readonly State[] = ['redirecting', 'invalid', 'request-error']
const headingId = useId()
const state = ref<State>('loading')
const detail = ref<ConsentDetail | null>(null)
const reason = ref<McpOAuthErrorReason | null>(null)
const deciding = ref<'approve' | 'deny' | null>(null)
const switching = ref(false)
const actionError = ref('')
let request = ''
let detailCredential: string | null = null
let requestSeq = 0
const [nameBefore, nameAfter] = props.copy.selfDeclared.split('{name}')
const [denyBefore, denyAfter] = props.copy.deny.split('{host}')

function openSignIn(): void {
  // Google 回跳可能已打开补邮箱验证，保留原登录弹窗正在处理的步骤。
  if (document.querySelector<HTMLElement>('[data-download-auth-modal]')?.hidden === false) return
  window.siteAuthController?.open()
}

function applyKnownError(error: Error): boolean {
  if (!(error instanceof HomepageApiError)) return false
  if (error.code === MCP_OAUTH_CODE.REQUEST_INVALID || error.code === MCP_OAUTH_CODE.VALIDATION_ERROR) {
    clearConsentRequest()
    state.value = 'invalid'
    return true
  }
  if (error.status === 401) {
    notifySessionExpired()
    return true
  }
  return false
}

async function load(): Promise<void> {
  if (TERMINAL_STATES.includes(state.value)) return
  const entry = readConsentEntry()
  if (entry.kind === 'error') {
    reason.value = entry.reason
    state.value = 'request-error'
    return
  }
  if (entry.kind === 'invalid') {
    state.value = 'invalid'
    return
  }
  request = entry.request
  actionError.value = ''
  const seq = ++requestSeq
  state.value = 'loading'
  try {
    const session = await getSiteSession()
    if (seq !== requestSeq) return
    if (session.status === 'signed-out') {
      state.value = 'signin'
      openSignIn()
      return
    }
    if (session.status === 'unreachable') {
      state.value = 'failed'
      return
    }
    const context = { token: session.token, deviceId: await ensureDeviceId() }
    const data = await getConsentDetail(context, request)
    if (seq !== requestSeq) return
    detailCredential = context.token
    detail.value = data
    state.value = 'ready'
  } catch (error) {
    if (seq !== requestSeq) return
    if (error instanceof McpOAuthCredentialChangedError) {
      invalidateSiteSession()
      void load()
      return
    }
    if (error instanceof Error && applyKnownError(error)) return
    console.error('[mcp-oauth] 读取授权确认信息失败', error)
    state.value = 'failed'
  }
}

async function decide(approved: boolean): Promise<void> {
  if (state.value !== 'ready' || deciding.value || switching.value) return
  const seq = ++requestSeq
  deciding.value = approved ? 'approve' : 'deny'
  actionError.value = ''
  try {
    const context = { token: detailCredential, deviceId: await ensureDeviceId() }
    const redirectUrl = new URL(await decideConsent(context, request, approved))
    // 与注册回调的协议边界一致，只导航到服务端返回的 HTTP(S) 地址。
    if (redirectUrl.protocol !== 'https:' && redirectUrl.protocol !== 'http:') {
      throw new Error('[mcp-oauth] decide 返回不支持的回跳协议：' + redirectUrl.protocol)
    }
    clearConsentRequest()
    requestSeq++
    state.value = 'redirecting'
    window.location.assign(redirectUrl.href)
  } catch (error) {
    deciding.value = null
    if (seq !== requestSeq) return
    if (error instanceof McpOAuthCredentialChangedError) {
      invalidateSiteSession()
      void load()
      return
    }
    if (error instanceof Error && applyKnownError(error)) return
    console.error('[mcp-oauth] 提交授权决定失败，approved=' + approved, error)
    actionError.value = props.copy.decideFailed
  }
}

async function switchAccount(): Promise<void> {
  if (switching.value || deciding.value) return
  switching.value = true
  actionError.value = ''
  try {
    await logoutCurrentUser({ token: getStoredAccessToken(), deviceId: await ensureDeviceId() })
    notifySessionExpired()
  } catch (error) {
    if (error instanceof Error && applyKnownError(error)) return
    console.error('[mcp-oauth] 切换授权账号时退出失败', error)
    actionError.value = props.copy.decideFailed
  } finally {
    switching.value = false
  }
}

function onAuthSuccess(): void { void load() }

function onSessionExpired(): void {
  if (TERMINAL_STATES.includes(state.value)) return
  requestSeq++
  deciding.value = null
  state.value = 'signin'
  openSignIn()
}

onMounted(() => {
  window.addEventListener(SITE_AUTH_SUCCESS_EVENT, onAuthSuccess)
  window.addEventListener(SITE_SESSION_EXPIRED_EVENT, onSessionExpired)
  void load()
})
onBeforeUnmount(() => {
  requestSeq++
  window.removeEventListener(SITE_AUTH_SUCCESS_EVENT, onAuthSuccess)
  window.removeEventListener(SITE_SESSION_EXPIRED_EVENT, onSessionExpired)
})
</script>

<template>
  <div class="consent">
    <header class="consent-header">
      <h1>{{ props.copy.title }}</h1>
      <p>{{ props.copy.intro }}</p>
    </header>

    <p v-if="state === 'loading'" class="consent-card" role="status">{{ props.copy.loading }}</p>
    <section v-else-if="state === 'signin'" class="consent-card" :aria-labelledby="headingId">
      <h2 :id="headingId">{{ props.copy.signInTitle }}</h2>
      <p>{{ props.copy.signInText }}</p>
      <button type="button" class="btn btn-primary" @click="openSignIn">{{ props.copy.signIn }}</button>
    </section>
    <section v-else-if="state === 'invalid'" class="consent-card" role="alert" :aria-labelledby="headingId">
      <h2 :id="headingId">{{ props.copy.invalidTitle }}</h2>
      <p>{{ props.copy.invalidText }}</p>
    </section>
    <section v-else-if="state === 'request-error' && reason" class="consent-card" role="alert" :aria-labelledby="headingId">
      <h2 :id="headingId">{{ props.copy.errorTitle }}</h2>
      <p>{{ props.copy.errorReasons[reason] }}</p>
      <p>{{ props.copy.errorHint }}</p>
      <code dir="ltr">{{ reason }}</code>
    </section>
    <section v-else-if="state === 'failed'" class="consent-card" role="alert">
      <p>{{ props.copy.loadFailed }}</p>
      <button type="button" class="btn btn-secondary" @click="load">{{ props.copy.retry }}</button>
    </section>
    <section v-else-if="detail" class="consent-card" :aria-labelledby="headingId" :aria-busy="state === 'redirecting'">
      <div>
        <p class="consent-label">{{ props.copy.hostLabel }}</p>
        <h2 :id="headingId">
          <template v-if="detail.is_loopback">{{ props.copy.loopbackHost }}</template>
          <bdi v-else dir="ltr">{{ detail.redirect_host }}</bdi>
        </h2>
        <p v-if="detail.client_name">{{ nameBefore }}<bdi>{{ detail.client_name }}</bdi>{{ nameAfter }}</p>
      </div>
      <div v-if="detail.is_loopback" class="consent-warning">
        <h3>{{ props.copy.loopbackTitle }}</h3>
        <p>{{ props.copy.loopbackText }}</p>
      </div>
      <div class="consent-account">
        <div>
          <p class="consent-label">{{ props.copy.accountLabel }}</p>
          <bdi dir="ltr" data-consent-email>{{ detail.user_email }}</bdi>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" :disabled="switching || deciding !== null" @click="switchAccount">{{ props.copy.switchAccount }}</button>
      </div>
      <div>
        <h3>{{ props.copy.permissionsTitle }}</h3>
        <ul class="consent-permissions">
          <li v-for="permission in props.copy.permissions" :key="permission">{{ permission }}</li>
        </ul>
        <p class="consent-note">{{ props.copy.revokeNote }}</p>
      </div>
      <p v-if="actionError" class="consent-error" role="alert">{{ actionError }}</p>
      <p v-if="state === 'redirecting'" role="status">{{ props.copy.redirecting }}</p>
      <div class="consent-actions">
        <button type="button" class="btn btn-secondary" :disabled="deciding !== null || switching" @click="decide(false)">
          <template v-if="detail.is_loopback">{{ props.copy.denyLoopback }}</template>
          <template v-else>{{ denyBefore }}<bdi dir="ltr">{{ detail.redirect_host }}</bdi>{{ denyAfter }}</template>
        </button>
        <button type="button" class="btn btn-primary" :disabled="deciding !== null || switching" @click="decide(true)">{{ props.copy.approve }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.consent { display: grid; gap: var(--s-6); width: min(calc(100% - 2 * var(--gutter)), var(--container-narrow)); margin: calc(var(--nav-h) + var(--s-8)) auto var(--s-16); }
.consent-header h1 { font-size: var(--fs-h3); }
.consent-header p { margin-top: var(--s-3); color: var(--text-2); }
.consent-card { display: grid; gap: var(--s-6); padding: var(--s-8); border: 1px solid var(--border); border-radius: var(--r-lg); background: var(--surface); overflow-wrap: anywhere; }
.consent-card h2 { font-size: var(--fs-h4); }
.consent-card h3 { font-size: 16px; }
.consent-card p { line-height: 1.6; }
.consent-label, .consent-note { color: var(--text-2); font-size: 13px; }
.consent-label { margin-bottom: var(--s-2); }
.consent-account, .consent-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-3); }
.consent-warning { display: grid; gap: var(--s-2); padding: var(--s-4); border-radius: var(--r-md); background: var(--warn-soft); color: var(--warn); }
.consent-permissions { display: grid; gap: var(--s-2); padding-left: var(--s-5); margin: var(--s-3) 0; list-style: disc; }
.consent-error { color: var(--bad); }
.consent code { font-family: var(--font-mono); font-variant-ligatures: none; }
.consent .btn { height: auto; min-height: 46px; padding-block: var(--s-2); white-space: normal; }
@media (max-width: 960px) {
  .consent { margin-bottom: var(--s-8); }
  .consent-card { padding: var(--s-4); }
  .consent-actions { align-items: stretch; flex-direction: column; }
}
</style>
