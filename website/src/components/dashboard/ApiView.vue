<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { HomepageUserInfo } from '../../scripts/homepage/auth'
import { HomepageApiError } from '../../scripts/homepage/api'
import {
  generateUserApiKey, getMapsApiConnection, getMapsApiUsage, getUserApiKey,
  type MapsApiConnection, type MapsApiUsage, type UserApiKeyMeta
} from '../../scripts/dashboard/api'
import {
  listMcpOAuthGrants, MCP_OAUTH_CODE, revokeMcpOAuthGrant, type McpOAuthGrant
} from '../../scripts/mcp-oauth/client'
import { notifySessionExpired } from '../../scripts/site/session'
import { confirmSiteAction } from '../../scripts/site/confirm'
import { showSiteToast } from '../../scripts/site/toast'

const props = defineProps<{
  copy: DashboardContent
  localePrefix: string
  user: HomepageUserInfo
  token: string
  deviceId: string
}>()

const accessLoading = ref(true)
const accessFailed = ref(false)
const keyMeta = ref<UserApiKeyMeta | null>(null)
const usage = ref<MapsApiUsage | null>(null)
const connection = ref<MapsApiConnection | null>(null)
const plaintextKey = ref('')
const generating = ref(false)
const grants = ref<McpOAuthGrant[]>([])
const grantsLoading = ref(true)
const grantsFailed = ref(false)
const page = ref(1)
const totalPages = ref(1)
const revoking = ref(false)
const PAGE_SIZE = 20
let grantRequestSeq = 0

const subscription = computed(() => props.user.maps_api_subscription)
const context = () => ({ deviceId: props.deviceId, token: props.token })
const [nameBefore, nameAfter] = props.copy.api.grants.selfDeclared.split('{name}')

function formatTime(ms: number): string {
  return new Intl.DateTimeFormat(document.documentElement.lang, {
    timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date(ms))
}

async function loadAccess(): Promise<void> {
  accessLoading.value = true
  accessFailed.value = false
  try {
    const [key, monthlyUsage, addresses] = await Promise.all([
      getUserApiKey(context()), getMapsApiUsage(context()), getMapsApiConnection(context())
    ])
    keyMeta.value = key
    usage.value = monthlyUsage
    connection.value = addresses
  } catch (error) {
    if (!(error instanceof HomepageApiError && error.status === 401)) {
      console.error('[dashboard-api] 读取接入信息失败', error)
      accessFailed.value = true
    }
  } finally {
    accessLoading.value = false
  }
}

async function generateKey(): Promise<void> {
  if (keyMeta.value?.has_api_key && !await confirmSiteAction({
    title: props.copy.api.rotateTitle,
    message: props.copy.api.rotateMessage,
    confirmLabel: props.copy.api.rotateKey,
    cancelLabel: props.copy.api.cancel
  })) return
  generating.value = true
  plaintextKey.value = ''
  try {
    const generated = await generateUserApiKey(context())
    plaintextKey.value = generated.api_key
    keyMeta.value = {
      has_api_key: true,
      api_key_prefix: generated.api_key_prefix,
      api_key_created_at: generated.api_key_created_at
    }
  } catch (error) {
    if (!(error instanceof HomepageApiError && error.status === 401)) {
      console.error('[dashboard-api] 生成用户 API Key 失败', error)
      showSiteToast(props.copy.api.keyFailed, { type: 'error' })
    }
  } finally {
    generating.value = false
  }
}

async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
    showSiteToast(props.copy.api.copied, { type: 'success' })
  } catch (error) {
    console.error('[dashboard-api] 写入剪贴板失败', error)
    showSiteToast(props.copy.api.copyFailed, { type: 'error' })
  }
}

async function loadGrants(targetPage = page.value): Promise<void> {
  const seq = ++grantRequestSeq
  grantsLoading.value = true
  try {
    const data = await listMcpOAuthGrants(context(), targetPage, PAGE_SIZE)
    if (seq !== grantRequestSeq) return
    const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
    if (data.items.length === 0 && targetPage > pages) {
      void loadGrants(pages)
      return
    }
    grants.value = data.items
    totalPages.value = pages
    page.value = targetPage
    grantsFailed.value = false
  } catch (error) {
    if (seq !== grantRequestSeq) return
    if (error instanceof HomepageApiError && error.status === 401) {
      notifySessionExpired()
      return
    }
    console.error('[dashboard-api] 读取本人 MCP 授权失败，页码=' + targetPage, error)
    if (grants.value.length === 0) grantsFailed.value = true
    else showSiteToast(props.copy.api.grants.loadFailed, { type: 'error' })
  } finally {
    if (seq === grantRequestSeq) grantsLoading.value = false
  }
}

async function revokeGrant(grant: McpOAuthGrant): Promise<void> {
  let message = props.copy.api.grants.revokeMessage.replace('{host}', grant.redirect_host)
  if (grant.client_name) message += '\n' + props.copy.api.grants.selfDeclared.replace('{name}', grant.client_name)
  message += '\n' + props.copy.api.grants.createdLabel + ': ' + formatTime(grant.created_at)
  if (!await confirmSiteAction({
    title: props.copy.api.grants.revokeTitle,
    message,
    confirmLabel: props.copy.api.grants.revoke,
    cancelLabel: props.copy.api.cancel
  })) return
  revoking.value = true
  try {
    await revokeMcpOAuthGrant(context(), grant.grant_id)
    await loadGrants()
  } catch (error) {
    if (error instanceof HomepageApiError && error.status === 401) {
      notifySessionExpired()
      return
    }
    console.error('[dashboard-api] 撤销 MCP 授权失败，grant_id=' + grant.grant_id, error)
    showSiteToast(props.copy.api.grants.revokeFailed, { type: 'error' })
    if (error instanceof HomepageApiError && error.code === MCP_OAUTH_CODE.NOT_FOUND) await loadGrants()
  } finally {
    revoking.value = false
  }
}

onMounted(() => {
  void loadAccess()
  void loadGrants()
})
onBeforeUnmount(() => { grantRequestSeq++ })
</script>

<template>
  <section class="api" aria-labelledby="dashboard-api-title">
    <header class="api-heading">
      <div>
        <h1 id="dashboard-api-title">{{ props.copy.api.title }}</h1>
        <p>{{ props.copy.api.description }}</p>
      </div>
      <a :href="props.localePrefix + '/google-maps-scraper-api/'">{{ props.copy.api.docsLink }}</a>
    </header>

    <p v-if="accessLoading" role="status">{{ props.copy.api.loading }}</p>
    <div v-else-if="accessFailed" class="api-card" role="alert">
      <p>{{ props.copy.api.loadFailed }}</p>
      <button type="button" class="btn btn-secondary" @click="loadAccess">{{ props.copy.api.retry }}</button>
    </div>
    <template v-else-if="keyMeta && usage && connection">
      <section class="api-card" aria-labelledby="api-key-title">
        <div class="api-row">
          <h2 id="api-key-title">{{ props.copy.api.keyTitle }}</h2>
          <button type="button" class="btn btn-primary" :disabled="generating" @click="generateKey">
            {{ generating ? props.copy.api.generatingKey : keyMeta.has_api_key ? props.copy.api.rotateKey : props.copy.api.generateKey }}
          </button>
        </div>
        <template v-if="plaintextKey">
          <p>{{ props.copy.api.keyOnce }}</p>
          <div class="api-value">
            <code data-api-key-plaintext>{{ plaintextKey }}</code>
            <button type="button" class="btn btn-secondary" @click="copyText(plaintextKey)">{{ props.copy.api.copyKey }}</button>
          </div>
        </template>
        <code v-else-if="keyMeta.has_api_key" data-api-key-prefix>{{ keyMeta.api_key_prefix }}…</code>
        <p v-else>{{ props.copy.api.keyEmpty }}</p>
        <p v-if="keyMeta.api_key_created_at !== null" class="api-muted">
          {{ props.copy.api.keyCreated }}: {{ formatTime(keyMeta.api_key_created_at) }}
        </p>
      </section>

      <div class="api-grid">
        <section class="api-card" aria-labelledby="api-usage-title">
          <div class="api-row">
            <h2 id="api-usage-title">{{ props.copy.api.usageTitle }}</h2>
            <button type="button" class="btn btn-ghost btn-sm" :disabled="generating" @click="loadAccess">{{ props.copy.api.refresh }}</button>
          </div>
          <p class="api-number" data-api-usage>{{ props.copy.api.usageValue.replace('{used}', String(usage.used)).replace('{total}', String(usage.total)) }}</p>
          <p>{{ props.copy.api.usagePeriod.replace('{period}', usage.period) }}</p>
          <p v-if="usage.exhausted" class="api-warning">{{ props.copy.api.quotaExhausted }}</p>
          <p class="api-muted">{{ props.copy.api.quotaReset }}</p>
        </section>
        <section class="api-card" aria-labelledby="api-plan-title">
          <h2 id="api-plan-title">{{ props.copy.api.planTitle }}</h2>
          <p v-if="!subscription || subscription.status === 'unavailable'" class="api-warning">{{ props.copy.subscriptions.unavailable }}</p>
          <template v-else>
            <p class="api-number" data-api-plan>{{ subscription.display_name }}</p>
            <template v-if="subscription.expires_at !== null">
              <p>{{ props.copy.subscriptions.expiresLabel }}: {{ formatTime(subscription.expires_at) }}</p>
              <p>{{ subscription.auto_renew ? props.copy.subscriptions.autoRenewOn : props.copy.subscriptions.autoRenewOff }}</p>
            </template>
          </template>
          <a :href="props.localePrefix + '/dashboard/subscriptions/'">{{ props.copy.api.managePlan }}</a>
        </section>
      </div>

      <section class="api-card" aria-labelledby="api-connections-title">
        <h2 id="api-connections-title">{{ props.copy.api.connectionsTitle }}</h2>
        <h3>{{ props.copy.api.apiUrl }}</h3>
        <div class="api-value">
          <code data-api-base-url>{{ connection.api_base_url }}</code>
          <button type="button" class="btn btn-secondary" @click="copyText(connection.api_base_url)">{{ props.copy.api.copyUrl }}</button>
        </div>
        <h3>{{ props.copy.api.mcpUrl }}</h3>
        <template v-if="connection.mcp_url">
          <div class="api-value">
            <code data-mcp-url>{{ connection.mcp_url }}</code>
            <button type="button" class="btn btn-secondary" @click="copyText(connection.mcp_url)">{{ props.copy.api.copyUrl }}</button>
          </div>
          <p class="api-muted">{{ props.copy.api.mcpHint }}</p>
        </template>
        <p v-else>{{ props.copy.api.mcpUnavailable }}</p>
      </section>
    </template>

    <section class="api-card" aria-labelledby="api-grants-title">
      <div class="api-row">
        <h2 id="api-grants-title">{{ props.copy.api.grants.title }}</h2>
        <button type="button" class="btn btn-ghost btn-sm" :disabled="grantsLoading || revoking" @click="loadGrants()">{{ props.copy.api.refresh }}</button>
      </div>
      <p class="api-muted">{{ props.copy.api.grants.description }}</p>
      <div v-if="grantsFailed" role="alert">
        <p>{{ props.copy.api.grants.loadFailed }}</p>
        <button type="button" class="btn btn-secondary" :disabled="grantsLoading" @click="loadGrants()">{{ props.copy.api.retry }}</button>
      </div>
      <p v-else-if="grantsLoading && grants.length === 0" role="status">{{ props.copy.api.grants.loading }}</p>
      <p v-else-if="grants.length === 0">{{ props.copy.api.grants.empty }}</p>
      <ul v-else class="api-grants" :aria-busy="grantsLoading">
        <li v-for="grant in grants" :key="grant.grant_id" :data-mcp-grant="grant.grant_id">
          <div>
            <bdi class="api-host" dir="ltr">{{ grant.redirect_host }}</bdi>
            <p v-if="grant.client_name">{{ nameBefore }}<bdi>{{ grant.client_name }}</bdi>{{ nameAfter }}</p>
            <p class="api-muted">{{ props.copy.api.grants.createdLabel }}: {{ formatTime(grant.created_at) }}</p>
            <p class="api-muted">{{ props.copy.api.grants.refreshedLabel }}: {{ grant.last_refreshed_at === null ? props.copy.api.grants.notRefreshed : formatTime(grant.last_refreshed_at) }}</p>
          </div>
          <button type="button" class="btn btn-secondary" :disabled="revoking || grantsLoading" @click="revokeGrant(grant)">{{ props.copy.api.grants.revoke }}</button>
        </li>
      </ul>
      <nav v-if="totalPages > 1" class="api-row" :aria-label="props.copy.api.grants.paginationLabel">
        <button type="button" class="btn btn-secondary" :disabled="page <= 1 || grantsLoading || revoking" @click="loadGrants(page - 1)">{{ props.copy.history.pagination.previous }}</button>
        <span>{{ props.copy.api.grants.pageOf.replace('{page}', String(page)).replace('{pages}', String(totalPages)) }}</span>
        <button type="button" class="btn btn-secondary" :disabled="page >= totalPages || grantsLoading || revoking" @click="loadGrants(page + 1)">{{ props.copy.history.pagination.next }}</button>
      </nav>
    </section>
  </section>
</template>

<style scoped>
.api { display: grid; gap: var(--s-6); min-width: 0; }
.api-heading, .api-row, .api-value { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-3); }
.api-heading h1 { font-size: var(--fs-h3); }
.api-heading p { margin-top: var(--s-2); color: var(--text-2); }
.api h2 { font-size: var(--fs-h4); }
.api h3 { font-size: 14px; }
.api a { color: var(--primary-text); text-decoration: underline; text-underline-offset: 3px; }
.api-card { display: grid; align-content: start; gap: var(--s-4); padding: var(--s-6); border: 1px solid var(--border); border-radius: var(--r-lg); background: var(--surface); }
.api-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s-6); }
.api-number { font-size: var(--fs-h4); font-variant-numeric: tabular-nums; }
.api-muted { color: var(--text-2); font-size: 13px; line-height: 1.6; }
.api-warning { color: var(--warn); background: var(--warn-soft); padding: var(--s-3); border-radius: var(--r-sm); }
.api code, .api-host { overflow-wrap: anywhere; font-family: var(--font-mono); font-variant-ligatures: none; font-size: 13px; }
.api-value code { flex: 1; min-width: 0; padding: var(--s-3); background: var(--surface-2); border-radius: var(--r-sm); }
.api-grants { list-style: none; padding: 0; }
.api-grants li { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); padding: var(--s-4) 0; border-top: 1px solid var(--border); }
.api-grants li > div { min-width: 0; }
.api-grants p { margin-top: var(--s-2); font-size: 13px; overflow-wrap: anywhere; }
.api .btn-primary { box-shadow: none; }
.api .btn-primary::before, .api .btn-primary::after { content: none; }
@media (max-width: 960px) {
  .api-grid { grid-template-columns: 1fr; }
  .api-card { padding: var(--s-4); }
  .api-grants li { align-items: flex-start; flex-direction: column; }
  .api .btn { white-space: normal; height: auto; min-height: 46px; padding-block: var(--s-2); }
}
</style>
