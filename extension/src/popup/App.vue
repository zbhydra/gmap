<template>
  <div class="pp" :data-account="accountState">
    <AppHeader
      :plan="usage?.plan_name ?? 'Free'"
      :signed-in="authStore.isAuthenticated && usage !== null"
      :scrolled="scrolled"
    />
    <main class="pp-body enter-group" @scroll="onScroll">
      <Transition name="pp-notice">
        <div v-if="newVersionAvailable || announcementHtml" class="pp-notices">
          <div v-if="newVersionAvailable" class="notice tone-warn" role="status">
            <Icon :name="IconName.REFRESH" />
            <p class="notice-desc">{{ t(I18N_KEYS.MAPS_PANEL.NEW_VERSION) }}</p>
          </div>
          <div v-if="announcementHtml" class="notice notice--announce tone-primary">
            <Icon :name="IconName.MEGAPHONE" />
            <div class="notice-desc" v-html="announcementHtml"></div>
          </div>
        </div>
      </Transition>
      <section class="pp-start">
        <p class="pp-lead">{{ t(I18N_KEYS.APP.START_HINT) }}</p>
        <button
          type="button"
          class="btn btn-lg btn-block pp-open"
          :class="usage?.exhausted ? 'btn-secondary' : 'btn-primary'"
          @click="openMaps"
        >
          <Icon :name="IconName.PIN" class="icon-pin" />
          {{ t(I18N_KEYS.APP.OPEN_MAPS) }}
          <Icon :name="IconName.ARROW_UP_RIGHT" class="icon-out" />
        </button>
      </section>
      <nav class="pp-tools" :aria-label="t(I18N_KEYS.POPUP_USAGE.BULK_TOOLS)">
        <button
          v-for="tool in tools"
          :key="tool.type"
          type="button"
          class="card card--interactive pp-tool"
          @click="openDashboard(tool.type)"
        >
          <span class="icon-tile icon-tile--sm icon-tile--soft"><Icon :name="tool.icon" /></span>
          <span class="pp-tool-title">{{ t(tool.title) }}</span>
          <Icon :name="IconName.ARROW_UP_RIGHT" class="pp-tool-go" />
          <span class="pp-tool-desc">{{ t(tool.description) }}</span>
        </button>
      </nav>
      <section class="card pp-card" :aria-label="t(I18N_KEYS.POPUP_USAGE.ACCOUNT)">
        <div class="pp-account">
          <span class="pp-avatar" :class="{ 'is-pending': loginInFlight }" aria-hidden="true">
            <span class="avatar" :class="{ 'avatar--guest': !authStore.isAuthenticated }">
              <template v-if="authStore.isAuthenticated">{{ initials }}</template>
              <Icon v-else :name="IconName.USER" />
            </span>
            <span v-if="loginInFlight" class="pp-avatar-orbit"></span>
          </span>
          <div class="pp-who" aria-live="polite">
            <Transition name="pp-word" mode="out-in">
              <span :key="identityLabel" class="pp-name truncate">{{ identityLabel }}</span>
            </Transition>
            <span class="pp-meta" :class="{ truncate: authStore.isAuthenticated }">{{
              accountMeta
            }}</span>
          </div>
          <button
            type="button"
            class="btn btn-sm pp-auth"
            :class="[
              authStore.isAuthenticated ? 'btn-ghost' : 'btn-secondary',
              { 'is-loading': loginInFlight || authStore.loading }
            ]"
            :disabled="loginInFlight || authStore.loading"
            :aria-busy="loginInFlight || authStore.loading"
            @click="authStore.isAuthenticated ? signOut() : signIn()"
          >
            <span
              v-if="loginInFlight || authStore.loading"
              class="spinner"
              aria-hidden="true"
            ></span>
            <Icon v-else :name="authStore.isAuthenticated ? IconName.LOGOUT : IconName.LOGIN" />
            {{ t(authStore.isAuthenticated ? I18N_KEYS.AUTH.LOGOUT : I18N_KEYS.AUTH.LOGIN) }}
          </button>
        </div>
        <div class="pp-usage">
          <div
            v-if="loadingUsage"
            class="pp-meter pp-skel"
            role="status"
            aria-busy="true"
            :aria-label="t(I18N_KEYS.POPUP_USAGE.LOADING)"
          >
            <div class="pp-meter-head">
              <span class="kicker">{{ t(I18N_KEYS.POPUP_USAGE.TITLE) }}</span
              ><span class="skel pp-skel-reset"></span>
            </div>
            <span class="skel skel--num pp-skel-num"></span>
            <span class="skel pp-skel-bar"></span>
          </div>
          <div v-else-if="usage === null" class="pp-meter" role="status">
            <div class="pp-meter-head">
              <span class="kicker">{{ t(I18N_KEYS.POPUP_USAGE.TITLE) }}</span>
            </div>
            <div class="pp-uerror-box">
              <Icon :name="IconName.CIRCLE_DASHED" />
              <div>
                <p class="pp-uerror-title">{{ t(I18N_KEYS.POPUP_USAGE.UNAVAILABLE) }}</p>
                <p class="pp-uerror-desc">{{ t(I18N_KEYS.POPUP_USAGE.UNAVAILABLE_HINT) }}</p>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm pp-retry"
                  @click="refreshUsage"
                >
                  <Icon :name="IconName.REFRESH" />{{ t(I18N_KEYS.APP_ERROR.RETRY) }}
                </button>
              </div>
            </div>
          </div>
          <div
            v-else
            class="pp-meter"
            :class="{ 'tone-warn': nearLimit, 'tone-bad': usage.exhausted }"
            aria-live="polite"
          >
            <div class="pp-meter-head">
              <span class="kicker">{{ t(I18N_KEYS.POPUP_USAGE.TITLE) }}</span
              ><span class="pp-reset">{{
                t(I18N_KEYS.POPUP_USAGE.RESETS, { date: resetDate })
              }}</span>
            </div>
            <div class="pp-meter-value">
              <Transition name="pp-word" mode="out-in"
                ><span :key="usage.used" class="pp-used num">{{ n(usage.used) }}</span></Transition
              >
              <span class="pp-total mono">/ {{ n(usage.total) }}</span>
              <span class="pp-pct mono">{{ percent }}%</span>
            </div>
            <div
              class="progress pp-bar"
              :style="{ '--p': percent }"
              role="progressbar"
              :aria-label="usageCounter"
              :aria-valuenow="usage.used"
              :aria-valuemax="usage.total"
              :aria-valuemin="0"
            >
              <span class="progress-fill"></span>
            </div>
            <p v-if="nearLimit" class="pp-meter-note">
              <Icon :name="IconName.ALERT" /><span
                >{{
                  t(I18N_KEYS.POPUP_USAGE.NEAR_LIMIT, {
                    count: n(Math.max(0, usage.total - usage.used)),
                    date: resetDate
                  })
                }}
                <button type="button" class="link" @click="openPricingPage('quota_upgrade_button')">
                  {{ t(I18N_KEYS.APP.PLANS) }}
                </button></span
              >
            </p>
            <div v-if="usage.exhausted" class="pp-out">
              <p class="pp-meter-note">
                <Icon :name="IconName.LOCK" /><span>{{
                  t(I18N_KEYS.POPUP_USAGE.EXHAUSTED, { total: n(usage.total), date: resetDate })
                }}</span>
              </p>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                @click="openPricingPage('quota_upgrade_button')"
              >
                <Icon :name="IconName.CROWN" />{{
                  t(
                    usage.plan_name === 'Business'
                      ? I18N_KEYS.APP.PLANS
                      : I18N_KEYS.POPUP_USAGE.UPGRADE
                  )
                }}
              </button>
            </div>
          </div>
        </div>
        <div class="card-foot pp-plans">
          <button type="button" class="link-arrow" @click="openPricingPage('quota_upgrade_button')">
            {{ t(I18N_KEYS.APP.PLANS) }}<Icon :name="IconName.ARROW_RIGHT" />
          </button>
          <a
            class="link link--quiet pp-manage"
            :href="subscriptionsUrl"
            target="_blank"
            rel="noreferrer"
            >{{ t(I18N_KEYS.APP.MANAGE_SUBSCRIPTION) }}<Icon :name="IconName.EXTERNAL_LINK"
          /></a>
        </div>
      </section>
    </main>
    <AppFooter />
    <Toast :show="toastState.show" :message="toastState.message" :type="toastState.type" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/core/stores/authStore'
import { markApi, MARK_TYPE } from '@/core/api/mark'
import { STORAGE_KEYS, WEBSITE } from '@/core/api/config'
import { storageManager } from '@/core/storage'
import { logger } from '@/core/utils/logger'
import { I18N_KEYS } from '@/core/constants/i18n'
import { Icon, IconName } from '@/core/components/icons'
import { openBulkDashboard, openExternalPage, openPricingPage } from '@/core/utils/navigation'
import { recordUiAction } from '@/core/api/mark/actions'
import { isNewVersionAvailable } from '@/sites/maps/config/operations'
import { BackgroundChannel } from './rpc/background.rpc'
import type { MapsUsageSnapshot } from '@/sites/maps/usage/types'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import Toast from '@/core/components/Toast.vue'
import { useToast } from '@/core/composables/useToast'

const authStore = useAuthStore()
const { toastState, showError } = useToast()
const { t, n, locale } = useI18n()
watch(locale, language => {
  document.documentElement.lang = language
})
const subscriptionsUrl = new URL('/dashboard/subscriptions/', WEBSITE.BASE_URL).toString()
const announcementHtml = ref('')
const newVersionAvailable = ref(false)
const usage = ref<MapsUsageSnapshot | null>(null)
const loadingUsage = ref(true)
const loginInFlight = ref(false)
const scrolled = ref(false)
const tools = [
  {
    type: '0',
    icon: IconName.LIST_PLUS,
    title: I18N_KEYS.APP.BULK_KEYWORDS,
    description: I18N_KEYS.POPUP_USAGE.KEYWORDS_HINT
  },
  {
    type: '1',
    icon: IconName.REVIEW,
    title: I18N_KEYS.APP.BULK_REVIEWS,
    description: I18N_KEYS.POPUP_USAGE.REVIEWS_HINT
  }
] as const
const accountState = computed(() =>
  authStore.isAuthenticated ? 'signed-in' : loginInFlight.value ? 'signing-in' : 'guest'
)
const identityLabel = computed(() =>
  authStore.isAuthenticated ? authStore.displayName : t(I18N_KEYS.POPUP_USAGE.GUEST)
)
const accountMeta = computed(() =>
  authStore.isAuthenticated
    ? authStore.user?.email
    : t(
        loginInFlight.value
          ? I18N_KEYS.POPUP_USAGE.SIGN_IN_PENDING
          : I18N_KEYS.POPUP_USAGE.SIGN_IN_HINT
      )
)
const initials = computed(() =>
  authStore.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
)
const percent = computed(() =>
  usage.value ? Math.min(100, Math.round((usage.value.used / usage.value.total) * 100)) : 0
)
const nearLimit = computed(
  () =>
    usage.value !== null && !usage.value.exhausted && usage.value.used / usage.value.total >= 0.8
)
const usageCounter = computed(() =>
  usage.value
    ? t(I18N_KEYS.POPUP_USAGE.COUNTER, { used: n(usage.value.used), total: n(usage.value.total) })
    : ''
)
// period 是纽约业务月；用下月 1 日中午的固定偏移避免本机时区把日期挪到前一天。
const resetDate = computed(() => {
  if (!usage.value) return ''
  const [year, month] = usage.value.period.split('-').map(Number)
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York'
  }).format(new Date(Date.UTC(year, month, 1, 12)))
})
function onScroll(event: Event): void {
  if (event.target instanceof HTMLElement) scrolled.value = event.target.scrollTop > 0
}
async function refreshUsage(): Promise<void> {
  loadingUsage.value = true
  const channel = new BackgroundChannel()
  try {
    usage.value = await channel.getMapsUsage()
  } catch (error) {
    usage.value = null
    logger.error('[Popup] 用量查询失败:', error)
  } finally {
    loadingUsage.value = false
    channel.destroy()
  }
}
async function loadOperations(): Promise<void> {
  const channel = new BackgroundChannel()
  try {
    const { operations } = await channel.getMapsConfig()
    announcementHtml.value = operations?.announcementHtml ?? ''
    newVersionAvailable.value = isNewVersionAvailable(
      operations?.minPluginVersion ?? '',
      chrome.runtime.getManifest().version
    )
  } catch (error) {
    logger.error('[Popup] 运营配置读取失败:', error)
  } finally {
    channel.destroy()
  }
}
// 登录完成以存储通知为准；完整官网登录可能长于默认 RPC 窗口。
async function signIn(): Promise<void> {
  loginInFlight.value = true
  recordUiAction('sign_in', 'popup', { signed_in: false })
  const channel = new BackgroundChannel()
  try {
    await channel.openExtensionLogin()
  } catch (error) {
    logger.error('[Popup] 登录 RPC 未在窗口期内完成（结果以 storage 为准）:', error)
  } finally {
    channel.destroy()
    loginInFlight.value = false
  }
}
async function signOut(): Promise<void> {
  recordUiAction('sign_out', 'popup')
  try {
    await authStore.logout()
  } catch (error) {
    logger.error('[Popup] 登出失败:', error)
  }
}
let refreshScheduled = false
let removeStorageListeners: Array<() => void> = []
function scheduleAccountRefresh(): void {
  if (refreshScheduled) return
  refreshScheduled = true
  setTimeout(() => {
    refreshScheduled = false
    void refreshAccountState()
  }, 0)
}
async function refreshAccountState(): Promise<void> {
  await authStore.initialize()
  usage.value = null
  await refreshUsage()
}
async function openDashboard(type: '0' | '1'): Promise<void> {
  recordUiAction('open_bulk_dashboard', 'popup', { type: type === '1' ? 'reviews' : 'keywords' })
  if (!(await openBulkDashboard(type))) showError(t(I18N_KEYS.APP_ERROR.TITLE))
}
async function openMaps(): Promise<void> {
  recordUiAction('open_maps', 'popup')
  if (!(await openExternalPage('https://www.google.com/maps', 'maps')))
    showError(t(I18N_KEYS.APP_ERROR.TITLE))
}
onMounted(async () => {
  // popup_open 是插件侧最主要的日活口径。登录态不做猜测：SLS 字段的
  // `user_id`（0 = 匿名）由存储实时读取，比在这里提前读 authStore 更准。
  markApi
    .record(MARK_TYPE.POPUP_OPEN, '', { surface: 'popup' })
    .catch(error => logger.error('[Popup] SLS 打点失败:', error))
  void loadOperations()
  removeStorageListeners = [
    storageManager.onChanged<string | undefined>(STORAGE_KEYS.ACCESS_TOKEN, token => {
      // 仅退出时清内存；资料回写触发的通知不能打断进行中的账号恢复。
      if (!token) authStore.clearAuth()
      scheduleAccountRefresh()
    }),
    storageManager.onChanged(STORAGE_KEYS.REFRESH_TOKEN, scheduleAccountRefresh),
    storageManager.onChanged(STORAGE_KEYS.USER_INFO, scheduleAccountRefresh)
  ]
  await authStore.initialize()
  await refreshUsage()
})
onUnmounted(() => removeStorageListeners.forEach(remove => remove()))
</script>

<style scoped src="./popup.css"></style>
