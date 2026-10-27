<script setup lang="ts">
/**
 * API 管理视图：API 合卡（ApiPlanCard）、API Key 与接入面板。
 *
 * - 接入面板按 API / MCP（OAuth 登录）/ MCP + API Key 三个 tab 切换，每个 tab 只放该方式需要的地址与示例；
 *   已连接应用是 OAuth 授权，只在 MCP tab 内出现。
 * - Key 与连接地址决定视图能否使用：首次读取结束（成败都算）发 ready 让外壳换下骨架；失败整块换成重试面板。
 * - 新 Key 明文只在生成响应后保留在本视图内存，离开视图（active 变为 false）立即清除。
 * - 已连接应用服务端分页；断开前先确认，断开后行淡出、焦点回到区块标题，再重拉当前页（被清空时回到最后一页）。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
import { copyText, placeSegThumb, reducedMotion } from '../../scripts/dashboard/dom'
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

const CONNECT_TABS = ['api', 'mcp', 'mcpKey'] as const
type ConnectTab = (typeof CONNECT_TABS)[number]
const CONNECT_TAB_ICONS: Record<ConnectTab, string> = { api: 'code', mcp: 'bot', mcpKey: 'key' }
/** 各接入方式的使用文档：API 产品页字段参考、MCP 产品页客户端接入、MCP 产品页 API Key 接入卡片。 */
const CONNECT_DOCS: Record<ConnectTab, string> = {
  api: '/google-maps-scraper-api/#reference',
  mcp: '/google-maps-scraper-mcp/#setup',
  mcpKey: '/google-maps-scraper-mcp/#api-key'
}

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

const tab = ref<ConnectTab>('api')
const tabsEl = ref<HTMLElement | null>(null)
let tabsObserver: ResizeObserver | null = null

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

/** 示例里的 Key 只放前缀加省略号（同密钥卡写法），没有 Key 时用 YOUR_API_KEY，从不读明文。 */
function sampleKey(meta: UserApiKeyMeta): string {
  return meta.has_api_key ? `${meta.api_key_prefix}…` : 'YOUR_API_KEY'
}

/** curl 快速上手：沿用 API 产品页的 Search 样例。 */
function curlSample(meta: UserApiKeyMeta, conn: MapsApiConnection): string {
  return [
    `curl ${conn.api_base_url}/search \\`,
    `  -H "Authorization: Bearer ${sampleKey(meta)}" \\`,
    '  -H "Content-Type: application/json" \\',
    `  -d '{"q": "coffee shop in Portland, OR", "extra": true}'`
  ].join('\n')
}

/** MCP 客户端配置：通用 mcpServers 写法；OAuth 只写地址，API Key 方式加 Authorization 请求头（同 MCP 产品页兜底配置）。 */
function mcpSample(meta: UserApiKeyMeta, mcpUrl: string, withKey: boolean): string {
  const server = withKey ? { url: mcpUrl, headers: { Authorization: `Bearer ${sampleKey(meta)}` } } : { url: mcpUrl }
  return JSON.stringify({ mcpServers: { mapsgrab: server } }, null, 2)
}

/** 当前 tab 的连接地址与示例；MCP 两个 tab 在没有 MCP 地址时为 null，显示不可用说明。 */
const connect = computed(() => {
  const meta = keyMeta.value
  const conn = connection.value
  if (!meta || !conn) return null
  const api = props.copy.api
  if (tab.value === 'api') {
    return { label: api.apiUrl, url: conn.api_base_url, target: 'api' as const, hint: '', title: api.curlTitle, sampleHint: api.curlHint, sample: curlSample(meta, conn) }
  }
  if (!conn.mcp_url) return null
  const withKey = tab.value === 'mcpKey'
  return {
    label: api.mcpUrl,
    url: conn.mcp_url,
    target: 'mcp' as const,
    hint: withKey ? api.mcpKeyHint : api.mcpHint,
    title: api.mcpConfigTitle,
    sampleHint: withKey ? api.curlHint : api.mcpConfigHint,
    sample: mcpSample(meta, conn.mcp_url, withKey)
  }
})

async function setTab(next: ConnectTab, focus = false): Promise<void> {
  if (next === tab.value) return
  tab.value = next
  await nextTick()
  if (tabsEl.value) placeSegThumb(tabsEl.value)
  if (focus) tabsEl.value?.querySelector<HTMLElement>(`[data-connect-tab="${next}"]`)?.focus()
}

/** tablist 的方向键：左右循环切换并聚焦（roving tabindex）。 */
function handleTabKeydown(event: KeyboardEvent): void {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  event.preventDefault()
  const index = CONNECT_TABS.indexOf(tab.value)
  const step = event.key === 'ArrowRight' ? 1 : CONNECT_TABS.length - 1
  void setTab(CONNECT_TABS[(index + step) % CONNECT_TABS.length], true)
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

// tab 在 Key 与地址到达后才渲染；字体加载、视图从隐藏切回与宽度变化都会改变按钮尺寸：滑块直接对齐，不做过渡
watch(tabsEl, element => {
  tabsObserver?.disconnect()
  if (!element) return
  placeSegThumb(element, true)
  tabsObserver = new ResizeObserver(() => placeSegThumb(element, true))
  tabsObserver.observe(element)
}, { flush: 'post' })

onBeforeUnmount(() => tabsObserver?.disconnect())

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
          <div class="conn-head">
            <h2 id="api-conn-title" class="d-panel-title">{{ props.copy.api.connectionsTitle }}</h2>
            <div ref="tabsEl" class="seg seg--sm" role="tablist" :aria-label="props.copy.api.connectTabsLabel" @keydown="handleTabKeydown">
              <span class="seg-thumb" aria-hidden="true"></span>
              <button
                v-for="item in CONNECT_TABS"
                :id="`api-tab-${item}`"
                :key="item"
                class="seg-btn"
                type="button"
                role="tab"
                :aria-selected="item === tab ? 'true' : 'false'"
                aria-controls="api-conn-panel"
                :tabindex="item === tab ? 0 : -1"
                :data-connect-tab="item"
                @click="setTab(item)"
              >
                <svg class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${CONNECT_TAB_ICONS[item]}`" /></svg>{{ props.copy.api.connectTabs[item] }}
              </button>
            </div>
          </div>
          <div id="api-conn-panel" class="d-panel-body conn-body" role="tabpanel" :aria-labelledby="`api-tab-${tab}`">
            <template v-if="connect">
              <div class="conn-row">
                <span id="api-conn-url" class="conn-label">{{ connect.label }}</span>
                <div class="copy-field">
                  <code class="copy-value" :data-connect-url="connect.target">{{ connect.url }}</code>
                  <button
                    class="icon-btn icon-btn--sm"
                    :class="{ 'is-copied': copied === connect.target }"
                    type="button"
                    :data-copy="connect.target"
                    :aria-label="props.copy.api.copyUrl"
                    aria-describedby="api-conn-url"
                    :title="props.copy.api.copyUrl"
                    @click="copyValue(connect.url, connect.target)"
                  >
                    <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-copy" /></svg>
                  </button>
                </div>
                <p v-if="connect.hint" class="d-hint">{{ connect.hint }}</p>
              </div>
              <div class="conn-sample">
                <div class="conn-sample-head">
                  <div>
                    <h3 class="conn-label">{{ connect.title }}</h3>
                    <p class="d-hint">{{ connect.sampleHint }}</p>
                  </div>
                  <a class="btn btn-secondary btn-xs" :href="`${props.localePrefix}${CONNECT_DOCS[tab]}`" data-connect-docs>
                    <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-book" /></svg>{{ props.copy.api.connectDocs[tab] }}
                  </a>
                </div>
                <div class="codewin">
                  <pre tabindex="0"><code data-connect-sample>{{ connect.sample }}</code></pre>
                </div>
              </div>
            </template>
            <p v-else class="d-muted">{{ props.copy.api.mcpUnavailable }}</p>

            <!-- 已连接应用是 OAuth 授权，只属于 MCP（登录授权）方式 -->
            <div v-if="tab === 'mcp'" class="conn-apps">
              <div>
                <h3 id="api-apps-title" ref="appsTitle" class="conn-label" tabindex="-1">{{ props.copy.api.grants.title }}</h3>
                <p class="d-hint">{{ props.copy.api.grants.description }}</p>
              </div>
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
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
