<script setup lang="ts">
/**
 * API 管理视图：API 合卡（ApiPlanCard）、API Key、连接地址与已连接应用四个面板。
 *
 * - Key 与连接地址决定视图能否使用：首次读取结束（成败都算）发 ready 让外壳换下骨架；失败整块换成重试面板。
 * - 新 Key 明文只在生成响应后保留在本视图内存，离开视图（active 变为 false）立即清除。
 * - 已连接应用服务端分页；断开前先确认，断开后行淡出、焦点回到区块标题，再重拉当前页（被清空时回到最后一页）。
 */
import { nextTick, onMounted, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { RequestContext } from '../../scripts/homepage/api'
import type { HomepageUserInfo } from '../../scripts/homepage/auth'
import {
  generateUserApiKey,
  getMapsApiConnection,
  getUserApiKey,
  type MapsApiConnection,
  type UserApiKeyMeta
} from '../../scripts/dashboard/api'
import { copyText, reducedMotion } from '../../scripts/dashboard/dom'
import { fill, formatDate, formatDateTime } from '../../scripts/dashboard/format'
import { isSessionExpiry } from '../../scripts/dashboard/workspace'
import { trackDashboardAction } from '../../scripts/homepage/web-mark'
import { listMcpOAuthGrants, revokeMcpOAuthGrant, type McpOAuthGrant } from '../../scripts/mcp-oauth/client'
import { confirmSiteAction } from '../../scripts/site/confirm'
import { notifySessionExpired } from '../../scripts/site/session'
import ApiPlanCard from './ApiPlanCard.vue'

const props = defineProps<{
  copy: DashboardContent
  context: RequestContext
  user: HomepageUserInfo
  localePrefix: string
  /** 订阅视图地址：合卡 Manage subscriptions 的真实链接。 */
  subscriptionsHref: string
  /** 是否为当前视图；离开（false）时清除新 Key 明文。 */
  active: boolean
}>()

const emit = defineEmits<{ ready: []; openSubscriptions: [] }>()

const GRANTS_PAGE_SIZE = 20

const keyMeta = ref<UserApiKeyMeta | null>(null)
const connection = ref<MapsApiConnection | null>(null)
const accessLoading = ref(false)
const accessFailed = ref(false)

const plaintextKey = ref('')
const generating = ref(false)
const keyFailed = ref(false)
/** 刚复制成功的按钮，短暂显示已复制状态。 */
const copied = ref<'key' | 'api' | 'mcp' | ''>('')
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const grants = ref<McpOAuthGrant[]>([])
const grantsLoading = ref(true)
/** 读取失败的页码：失败提示与重试都按它，成功读取任一页后清空。 */
const grantsFailedPage = ref<number | null>(null)
const page = ref(1)
const totalPages = ref(1)
const revokingId = ref<number | null>(null)
const leavingId = ref<number | null>(null)
const revokeFailedId = ref<number | null>(null)
let grantsSeq = 0

const copyKeyButton = ref<HTMLButtonElement | null>(null)
const appsTitle = ref<HTMLElement | null>(null)
const grantList = ref<HTMLElement | null>(null)

const pricingHref = `${props.localePrefix}/pricing/?product_kind=maps_api`
const [nameBefore, nameAfter] = props.copy.api.grants.selfDeclared.split('{name}')

async function loadAccess(): Promise<void> {
  accessLoading.value = true
  try {
    const [key, addresses] = await Promise.all([getUserApiKey(props.context), getMapsApiConnection(props.context)])
    keyMeta.value = key
    connection.value = addresses
    accessFailed.value = false
  } catch (error) {
    if (!isSessionExpiry(error)) console.error(new Error('[dashboard-api] load API key and connection addresses failed', { cause: error }))
    accessFailed.value = true
  } finally {
    accessLoading.value = false
  }
}

async function generateKey(): Promise<void> {
  if (generating.value) return
  if (keyMeta.value?.has_api_key && !await confirmSiteAction({
    title: props.copy.api.rotateTitle,
    message: props.copy.api.rotateMessage,
    confirmLabel: props.copy.api.rotateKey,
    cancelLabel: props.copy.api.cancel
  })) return
  trackDashboardAction('api_key_generate')
  generating.value = true
  keyFailed.value = false
  plaintextKey.value = ''
  try {
    const generated = await generateUserApiKey(props.context)
    keyMeta.value = {
      has_api_key: true,
      api_key_prefix: generated.api_key_prefix,
      api_key_created_at: generated.api_key_created_at
    }
    // 响应到达时已离开视图：按离开即清除的合同不写明文，Key 元数据照常更新
    if (!props.active) return
    plaintextKey.value = generated.api_key
    await nextTick()
    copyKeyButton.value?.focus()
  } catch (error) {
    if (!isSessionExpiry(error)) console.error(new Error('[dashboard-api] generate user API key failed', { cause: error }))
    keyFailed.value = true
  } finally {
    generating.value = false
  }
}

/** curl 快速上手：沿用 API 产品页的 Search 样例；Key 只放前缀加省略号（同密钥卡写法），没有 Key 时用 YOUR_API_KEY，从不读明文。 */
function curlSample(meta: UserApiKeyMeta, conn: MapsApiConnection): string {
  const key = meta.has_api_key ? `${meta.api_key_prefix}…` : 'YOUR_API_KEY'
  return [
    `curl ${conn.api_base_url}/search \\`,
    `  -H "Authorization: Bearer ${key}" \\`,
    '  -H "Content-Type: application/json" \\',
    `  -d '{"q": "coffee shop in Portland, OR", "extra": true}'`
  ].join('\n')
}

async function copyValue(value: string, target: 'key' | 'api' | 'mcp'): Promise<void> {
  if (!await copyText(value, props.copy.api)) return
  trackDashboardAction('api_value_copy', { target })
  copied.value = target
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = ''
  }, 1600)
}

async function loadGrants(target = page.value): Promise<void> {
  const seq = ++grantsSeq
  grantsLoading.value = true
  try {
    const data = await listMcpOAuthGrants(props.context, target, GRANTS_PAGE_SIZE)
    if (seq !== grantsSeq) return
    const pages = Math.max(1, Math.ceil(data.total / GRANTS_PAGE_SIZE))
    // 断开后当前页可能已被清空：回到最后一页
    if (!data.items.length && target > pages) {
      void loadGrants(pages)
      return
    }
    grants.value = data.items
    page.value = target
    totalPages.value = pages
    grantsFailedPage.value = null
  } catch (error) {
    if (seq !== grantsSeq) return
    // 授权接口不经 dashboard/api 的会话失效边界，401 在这里汇入站级会话失效
    if (isSessionExpiry(error)) {
      notifySessionExpired()
      return
    }
    console.error(new Error(`[dashboard-api] list MCP OAuth grants failed: page=${target}`, { cause: error }))
    grantsFailedPage.value = target
  } finally {
    if (seq === grantsSeq) grantsLoading.value = false
  }
}

function goToPage(target: number): void {
  if (grantsLoading.value || revokingId.value !== null || target < 1 || target > totalPages.value) return
  void loadGrants(target)
}

/** 回调主机与自报名称、连接时间都不保证唯一，确认框一并列出，便于区分同一主机下的多个授权。 */
function confirmRevoke(grant: McpOAuthGrant): Promise<boolean> {
  const grantsCopy = props.copy.api.grants
  const lines = [fill(grantsCopy.revokeMessage, { host: grant.redirect_host })]
  if (grant.client_name) lines.push(fill(grantsCopy.selfDeclared, { name: grant.client_name }))
  lines.push(`${grantsCopy.createdLabel}: ${formatDateTime(grant.created_at)}`)
  return confirmSiteAction({
    title: grantsCopy.revokeTitle,
    message: lines.join('\n'),
    confirmLabel: grantsCopy.revoke,
    cancelLabel: props.copy.api.cancel
  })
}

async function revokeGrant(grant: McpOAuthGrant): Promise<void> {
  if (revokingId.value !== null || !await confirmRevoke(grant)) return
  trackDashboardAction('mcp_grant_revoke', { redirect_host: grant.redirect_host })
  revokingId.value = grant.grant_id
  revokeFailedId.value = null
  try {
    await revokeMcpOAuthGrant(props.context, grant.grant_id)
  } catch (error) {
    if (isSessionExpiry(error)) notifySessionExpired()
    else {
      console.error(new Error(`[dashboard-api] revoke MCP OAuth grant failed: grant_id=${grant.grant_id}`, { cause: error }))
      revokeFailedId.value = grant.grant_id
    }
    revokingId.value = null
    return
  }
  if (!reducedMotion()) {
    leavingId.value = grant.grant_id
    await nextTick()
    const row = grantList.value?.querySelector(`[data-mcp-grant="${grant.grant_id}"]`)
    await Promise.allSettled(row?.getAnimations().map(animation => animation.finished) ?? [])
  }
  grants.value = grants.value.filter(item => item.grant_id !== grant.grant_id)
  leavingId.value = null
  revokingId.value = null
  appsTitle.value?.focus()
  // 服务端分页：重拉当前页，让下一页的记录补位
  void loadGrants()
}

watch(() => props.active, active => {
  if (!active) plaintextKey.value = ''
})

onMounted(async () => {
  void loadGrants()
  await loadAccess()
  emit('ready')
})
</script>

<template>
  <div class="view-stack">
    <p class="view-intro">{{ props.copy.api.description }}</p>

    <div v-if="accessFailed" class="d-panel fail">
      <p class="fail-text">
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>{{ props.copy.api.loadFailed }}
      </p>
      <button
        class="btn btn-secondary btn-xs"
        :class="{ 'is-busy': accessLoading }"
        type="button"
        :aria-busy="accessLoading ? 'true' : undefined"
        @click="loadAccess"
      >
        <span v-if="accessLoading" class="spinner spinner--sm" aria-hidden="true"></span>
        <svg v-else class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
        {{ props.copy.api.retry }}
      </button>
    </div>

    <div v-else class="api-grid">
      <ApiPlanCard
        :copy="props.copy"
        :context="props.context"
        :subscription="props.user.maps_api_subscription"
        :subscriptions-href="props.subscriptionsHref"
        :pricing-href="pricingHref"
        @open-subscriptions="emit('openSubscriptions')"
      />

      <template v-if="keyMeta && connection">
        <section class="d-panel" data-area="key" aria-labelledby="api-key-title">
          <div class="d-panel-head"><h2 id="api-key-title" class="d-panel-title">{{ props.copy.api.keyTitle }}</h2></div>
          <div class="key-body">
            <div v-if="keyMeta.has_api_key" class="key-line">
              <span class="key-chip" data-api-key-prefix>
                <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-key" /></svg>{{ keyMeta.api_key_prefix }}…
              </span>
              <span v-if="keyMeta.api_key_created_at !== null" class="d-hint">
                {{ props.copy.api.keyCreated }} {{ formatDate(keyMeta.api_key_created_at) }}
              </span>
            </div>
            <p v-else class="d-muted key-line">{{ props.copy.api.keyEmpty }}</p>

            <div v-if="plaintextKey" class="callout callout--warn">
              <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
              <div class="callout-body">
                <span>{{ props.copy.api.keyOnce }}</span>
                <div class="copy-field"><code class="copy-value copy-value--wrap" data-api-key-plaintext>{{ plaintextKey }}</code></div>
                <!-- 有 Key 后视图不再有 primary：复制明文也用次级按钮 -->
                <button
                  ref="copyKeyButton"
                  class="btn btn-secondary btn-xs"
                  :class="{ 'is-copied': copied === 'key' }"
                  type="button"
                  data-copy="key"
                  @click="copyValue(plaintextKey, 'key')"
                >
                  <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-copy" /></svg>{{ props.copy.api.copyKey }}
                </button>
              </div>
            </div>
            <p v-if="keyFailed" class="inline-err" role="alert">{{ props.copy.api.keyFailed }}</p>

            <div class="key-actions">
              <button
                class="btn btn-xs"
                :class="[keyMeta.has_api_key ? 'btn-secondary' : 'btn-primary', { 'is-busy': generating }]"
                type="button"
                :aria-busy="generating ? 'true' : undefined"
                @click="generateKey"
              >
                <template v-if="generating">
                  <span class="spinner spinner--sm" aria-hidden="true"></span>{{ props.copy.api.generatingKey }}
                </template>
                <template v-else-if="keyMeta.has_api_key">
                  <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>{{ props.copy.api.rotateKey }}
                </template>
                <template v-else>
                  <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-key" /></svg>{{ props.copy.api.generateKey }}
                </template>
              </button>
            </div>
          </div>
        </section>

        <section class="d-panel" data-area="conn" aria-labelledby="api-conn-title">
          <div class="d-panel-head"><h2 id="api-conn-title" class="d-panel-title">{{ props.copy.api.connectionsTitle }}</h2></div>
          <div class="d-panel-body">
            <div class="conn-grid">
              <div class="conn-row">
                <span id="api-conn-base" class="conn-label">{{ props.copy.api.apiUrl }}</span>
                <div class="copy-field">
                  <code class="copy-value" data-api-base-url>{{ connection.api_base_url }}</code>
                  <button
                    class="icon-btn icon-btn--sm"
                    :class="{ 'is-copied': copied === 'api' }"
                    type="button"
                    data-copy="api"
                    :aria-label="props.copy.api.copyUrl"
                    aria-describedby="api-conn-base"
                    :title="props.copy.api.copyUrl"
                    @click="copyValue(connection.api_base_url, 'api')"
                  >
                    <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-copy" /></svg>
                  </button>
                </div>
              </div>
              <div class="conn-row">
                <span id="api-conn-mcp" class="conn-label">{{ props.copy.api.mcpUrl }}</span>
                <template v-if="connection.mcp_url">
                  <div class="copy-field">
                    <code class="copy-value" data-mcp-url>{{ connection.mcp_url }}</code>
                    <button
                      class="icon-btn icon-btn--sm"
                      :class="{ 'is-copied': copied === 'mcp' }"
                      type="button"
                      data-copy="mcp"
                      :aria-label="props.copy.api.copyUrl"
                      aria-describedby="api-conn-mcp"
                      :title="props.copy.api.copyUrl"
                      @click="copyValue(connection.mcp_url, 'mcp')"
                    >
                      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-copy" /></svg>
                    </button>
                  </div>
                  <p class="d-hint">{{ props.copy.api.mcpHint }}</p>
                </template>
                <p v-else class="d-muted">{{ props.copy.api.mcpUnavailable }}</p>
              </div>
            </div>
            <div class="conn-curl">
              <h3 id="api-curl-title" class="conn-label">{{ props.copy.api.curlTitle }}</h3>
              <p class="d-hint">{{ props.copy.api.curlHint }}</p>
              <div class="codewin">
                <pre tabindex="0"><code data-api-curl>{{ curlSample(keyMeta, connection) }}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </template>

      <section class="d-panel" data-area="apps" aria-labelledby="api-apps-title">
        <div class="d-panel-head">
          <div>
            <h2 id="api-apps-title" ref="appsTitle" class="d-panel-title" tabindex="-1">{{ props.copy.api.grants.title }}</h2>
            <p class="d-section-desc">{{ props.copy.api.grants.description }}</p>
          </div>
        </div>
        <div class="d-panel-body">
          <div v-if="grantsFailedPage !== null" class="callout callout--bad" role="alert">
            <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
            <div class="callout-body">
              <span>{{ props.copy.api.grants.loadFailed }}</span>
              <button
                class="btn btn-secondary btn-xs"
                :class="{ 'is-busy': grantsLoading }"
                type="button"
                :aria-busy="grantsLoading ? 'true' : undefined"
                @click="loadGrants(grantsFailedPage)"
              >
                <span v-if="grantsLoading" class="spinner spinner--sm" aria-hidden="true"></span>
                <svg v-else class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
                {{ props.copy.api.retry }}
              </button>
            </div>
          </div>

          <template v-if="grants.length">
            <ul ref="grantList" class="grants" :aria-busy="grantsLoading ? 'true' : 'false'">
              <li
                v-for="grant in grants"
                :key="grant.grant_id"
                class="grant"
                :class="{ 'is-leaving': leavingId === grant.grant_id }"
                :data-mcp-grant="grant.grant_id"
              >
                <span class="icon-tile" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-bot" /></svg></span>
                <div class="grant-main">
                  <bdi :id="`api-grant-${grant.grant_id}`" class="grant-host" dir="ltr">{{ grant.redirect_host }}</bdi>
                  <span v-if="grant.client_name" class="grant-name">{{ nameBefore }}<bdi>{{ grant.client_name }}</bdi>{{ nameAfter }}</span>
                  <span class="grant-meta">
                    <span>{{ props.copy.api.grants.createdLabel }} {{ formatDateTime(grant.created_at) }}</span>
                    <span>
                      {{ props.copy.api.grants.refreshedLabel }}
                      {{ grant.last_refreshed_at === null ? props.copy.api.grants.notRefreshed : formatDateTime(grant.last_refreshed_at) }}
                    </span>
                  </span>
                  <p v-if="revokeFailedId === grant.grant_id" class="inline-err" role="alert">{{ props.copy.api.grants.revokeFailed }}</p>
                </div>
                <button
                  class="btn btn-secondary btn-xs"
                  :class="{ 'is-busy': revokingId === grant.grant_id }"
                  type="button"
                  :aria-describedby="`api-grant-${grant.grant_id}`"
                  :aria-busy="revokingId === grant.grant_id ? 'true' : undefined"
                  @click="revokeGrant(grant)"
                >
                  <span v-if="revokingId === grant.grant_id" class="spinner spinner--sm" aria-hidden="true"></span>
                  {{ props.copy.api.grants.revoke }}
                </button>
              </li>
            </ul>
            <nav v-if="totalPages > 1" class="grants-foot" :aria-label="props.copy.api.grants.paginationLabel">
              <span class="d-muted">{{ fill(props.copy.api.grants.pageOf, { page, pages: totalPages }) }}</span>
              <div class="pager">
                <button
                  class="btn btn-secondary btn-xs"
                  type="button"
                  :aria-disabled="page <= 1 || grantsLoading || revokingId !== null ? 'true' : undefined"
                  @click="goToPage(page - 1)"
                >
                  {{ props.copy.history.pagination.previous }}
                </button>
                <button
                  class="btn btn-secondary btn-xs"
                  type="button"
                  :aria-disabled="page >= totalPages || grantsLoading || revokingId !== null ? 'true' : undefined"
                  @click="goToPage(page + 1)"
                >
                  {{ props.copy.history.pagination.next }}
                </button>
              </div>
            </nav>
          </template>
          <div v-else-if="grantsFailedPage === null && grantsLoading" class="skel-stack">
            <span class="sr-only" role="status">{{ props.copy.api.grants.loading }}</span>
            <span class="skel skel--block" style="height: 56px" aria-hidden="true"></span>
            <span class="skel skel--block" style="height: 56px" aria-hidden="true"></span>
          </div>
          <p v-else-if="grantsFailedPage === null" class="d-muted">{{ props.copy.api.grants.empty }}</p>
        </div>
      </section>
    </div>
  </div>
</template>
