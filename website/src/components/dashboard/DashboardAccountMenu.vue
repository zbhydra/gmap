<script setup lang="ts">
/**
 * 账户菜单（APG Menu Button，§3.6 / §3.8）：由用户卡按钮触发；展开时在用户卡上方左对齐，图标栏时在侧栏右侧、底边与头像对齐。
 *
 * - 身份区在 role="menu" 之外，只展示。三条产品线的订阅都是菜单项：有效订阅进 Subscriptions 视图，
 *   Free 进 Pricing 对应产品，读取失败为不可用项（可聚焦、不能激活）。
 * - 主题三项横排单选，点选或 Space 立即生效、菜单保持打开；语言在同一浮层的子面板里，选中后跳到该语言下的同一视图。
 * - 退出后清除本站登录态并回当前语言主页；后端只撤销当前 token，请求失败也照常清除本地登录态。
 */
import { computed, ref } from 'vue'
import type { DashboardContent, DashboardLineId } from '../../i18n/schema'
import { localeNames, localePaths, locales, type Locale } from '../../i18n/ui'
import { epochMs, formatDate } from '../../scripts/dashboard/format'
import { dashboardPath, isPlainClick, type DashboardView } from '../../scripts/dashboard/route'
import {
  clearStoredAccessToken,
  logoutCurrentUser,
  type HomepageUserInfo,
  type HomepageUserSubscription
} from '../../scripts/homepage/auth'
import { ensureDeviceId } from '../../scripts/homepage/device'
import { switchSiteLanguage } from '../../scripts/site/language-switcher'
import type { PopRect } from '../../scripts/site/pop'
import { invalidateSiteSession } from '../../scripts/site/session'
import { applySiteTheme, readSiteTheme, type SiteTheme } from '../../scripts/site/theme'
import PopMenu, { type PopMenuPanel } from './PopMenu.vue'

const props = defineProps<{
  copy: DashboardContent
  user: HomepageUserInfo
  token: string
  locale: Locale
  /** 当前语言路径前缀（en-US 为空）。 */
  localePrefix: string
  /** 当前视图：切换语言后停在同一视图。 */
  view: DashboardView
  /** 宽屏图标栏：菜单在侧栏右侧弹出。 */
  rail: boolean
}>()

const emit = defineEmits<{
  navigate: [view: DashboardView]
  /** 菜单即将打开：侧栏收起图标栏的提示。 */
  open: []
}>()

const MENU_ID = 'account-menu'

interface PlanLine {
  id: DashboardLineId
  productKind: string
  subscriptionKey: 'maps_online_subscription' | 'maps_extension_subscription' | 'maps_api_subscription'
  icon: string
}

/** 三条产品线，顺序与 Subscriptions 视图一致。 */
const LINES: readonly PlanLine[] = [
  { id: 'online', productKind: 'maps_online', subscriptionKey: 'maps_online_subscription', icon: 'cloud' },
  { id: 'extension', productKind: 'maps_extension', subscriptionKey: 'maps_extension_subscription', icon: 'puzzle' },
  { id: 'api', productKind: 'maps_api', subscriptionKey: 'maps_api_subscription', icon: 'code' }
]

const THEMES: readonly { value: SiteTheme; icon: string }[] = [
  { value: 'light', icon: 'sun' },
  { value: 'dark', icon: 'moon' },
  { value: 'system', icon: 'monitor' }
]

/** 打开时从页面读取，与页头等其他入口改过的主题保持一致。 */
const theme = ref<SiteTheme>('system')
const loggingOut = ref(false)

const name = computed(() => props.user.full_name?.trim() || props.user.email)
const initial = computed(() => (name.value.trim().charAt(0) || 'U').toUpperCase())
const avatarUrl = computed(() => props.user.avatar_url?.trim() ?? '')
const subscriptionsHref = computed(() => dashboardPath(props.localePrefix, 'subscriptions'))
const panels = computed<PopMenuPanel[]>(() => [{ id: 'account-lang', title: props.copy.account.language }])
/** 订阅行：读取失败为不可用；有效订阅显示套餐名与到期日；其余按 Free 显示升级入口。 */
const lines = computed(() => LINES.map(line => {
  const subscription = props.user[line.subscriptionKey]
  return {
    ...line,
    unavailable: subscription?.status === 'unavailable',
    plan: activePlan(subscription),
    pricingHref: `${props.localePrefix}/pricing/?product_kind=${line.productKind}`
  }
}))

/** 有效订阅：active 且有到期时间。 */
function activePlan(subscription: HomepageUserSubscription | null | undefined) {
  if (subscription?.status !== 'active' || subscription.expires_at == null) return null
  return { name: subscription.display_name, expires: formatDate(epochMs(subscription.expires_at)) }
}

/** 展开时贴用户卡整体；图标栏时上下与左缘取头像按钮，右缘取侧栏，菜单在侧栏外侧弹出。 */
function anchor(): PopRect | null {
  const trigger = document.getElementById(`${MENU_ID}-btn`)
  const box = trigger?.closest('.user-box')
  if (!trigger || !box) return null
  if (!props.rail) return box.getBoundingClientRect()
  const rect = trigger.getBoundingClientRect()
  const right = trigger.closest('.dash-side')?.getBoundingClientRect().right ?? rect.right
  return { top: rect.top, bottom: rect.bottom, left: rect.left, right, width: right - rect.left }
}

function handleOpen(): void {
  theme.value = readSiteTheme()
  emit('open')
}

function openSubscriptions(event: MouseEvent): void {
  if (!isPlainClick(event)) return
  event.preventDefault()
  emit('navigate', 'subscriptions')
}

function themeLabel(value: SiteTheme): string {
  if (value === 'light') return props.copy.account.themeLight
  if (value === 'dark') return props.copy.account.themeDark
  return props.copy.account.themeSystem
}

function selectTheme(value: SiteTheme): void {
  applySiteTheme(value)
  theme.value = value
}

function selectLanguage(code: Locale): void {
  if (code === props.locale) return
  const prefix = localePaths[code] ? `/${localePaths[code]}` : ''
  switchSiteLanguage(code, dashboardPath(prefix, props.view))
}

async function logout(): Promise<void> {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await logoutCurrentUser({ deviceId: await ensureDeviceId(), token: props.token })
  } catch (error) {
    // 后端只撤销当前 token；本地登录态照常清除，用户重试一次可自行修正。
    console.error(new Error('[dashboard-account] logout request failed.', { cause: error }))
  } finally {
    clearStoredAccessToken()
    invalidateSiteSession()
    window.location.assign(`${props.localePrefix}/`)
  }
}
</script>

<template>
  <PopMenu
    :id="MENU_ID"
    :label="props.copy.account.menuLabel"
    :back-label="props.copy.shell.back"
    :panels="panels"
    :side="props.rail ? 'right' : 'top'"
    align="start"
    :anchor="anchor"
    pop-class="account-pop"
    @open="handleOpen"
  >
    <template #trigger="scope"><slot name="trigger" v-bind="scope" /></template>

    <template #before>
      <div class="menu-id">
        <span class="avatar" aria-hidden="true">
          <img v-if="avatarUrl" :src="avatarUrl" alt="" referrerpolicy="no-referrer" />
          <template v-else>{{ initial }}</template>
        </span>
        <span class="user-ident">
          <span class="user-name">{{ name }}</span>
          <span class="user-email">{{ props.user.email }}</span>
        </span>
      </div>
      <div class="pop-sep"></div>
    </template>

    <div role="group" :aria-label="props.copy.subscriptions.title">
      <span class="pop-label d-label" aria-hidden="true">{{ props.copy.subscriptions.title }}</span>
      <template v-for="line in lines" :key="line.id">
        <a v-if="line.unavailable" class="pop-item menu-sub" role="menuitem" tabindex="-1" aria-disabled="true">
          <svg class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${line.icon}`" /></svg>
          <span class="menu-sub-line">{{ props.copy.subscriptions.lines[line.id] }}</span>
          <span></span>
          <span class="menu-sub-meta is-warn">
            <svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>{{ props.copy.subscriptions.unavailable }}
          </span>
        </a>
        <a
          v-else-if="line.plan"
          class="pop-item menu-sub"
          role="menuitem"
          tabindex="-1"
          :href="subscriptionsHref"
          @click="openSubscriptions"
        >
          <svg class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${line.icon}`" /></svg>
          <span class="menu-sub-line">{{ props.copy.subscriptions.lines[line.id] }}</span>
          <span class="menu-sub-plan">{{ line.plan.name }}</span>
          <span class="menu-sub-meta">{{ props.copy.subscriptions.expiresLabel }} {{ line.plan.expires }}</span>
        </a>
        <a v-else class="pop-item menu-sub" role="menuitem" tabindex="-1" :href="line.pricingHref">
          <svg class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${line.icon}`" /></svg>
          <span class="menu-sub-line">{{ props.copy.subscriptions.lines[line.id] }}</span>
          <span class="menu-sub-plan is-free">{{ props.copy.subscriptions.free }}</span>
          <span class="menu-sub-meta is-link">
            {{ props.copy.account.upgrade }}<svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-arrow-up-right" /></svg>
          </span>
        </a>
      </template>
    </div>
    <a class="pop-item" role="menuitem" tabindex="-1" :href="subscriptionsHref" @click="openSubscriptions">
      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-tag" /></svg>
      <span class="pop-item-label">{{ props.copy.api.managePlan }}</span>
    </a>
    <div class="pop-sep" role="separator"></div>
    <div class="menu-row" role="group" :aria-label="props.copy.account.theme" data-pop-row>
      <span aria-hidden="true">{{ props.copy.account.theme }}</span>
      <div class="mini-seg">
        <button
          v-for="item in THEMES"
          :key="item.value"
          type="button"
          role="menuitemradio"
          tabindex="-1"
          :aria-checked="theme === item.value ? 'true' : 'false'"
          :aria-label="themeLabel(item.value)"
          :title="themeLabel(item.value)"
          data-pop-stay
          @click="selectTheme(item.value)"
        >
          <svg class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${item.icon}`" /></svg>
        </button>
      </div>
    </div>
    <button class="pop-item" type="button" role="menuitem" tabindex="-1" aria-haspopup="menu" aria-controls="account-lang">
      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-globe" /></svg>
      <span class="pop-item-label">{{ props.copy.account.language }}</span>
      <span class="pop-item-end">
        {{ localeNames[props.locale] }}<svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-chevron-right" /></svg>
      </span>
    </button>
    <div class="pop-sep" role="separator"></div>
    <button class="pop-item" type="button" role="menuitem" tabindex="-1" data-dashboard-logout @click="logout">
      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-logout" /></svg>
      <span class="pop-item-label">{{ props.copy.account.logout }}</span>
    </button>

    <template #account-lang>
      <button
        v-for="code in locales"
        :key="code"
        class="pop-item"
        type="button"
        role="menuitemradio"
        tabindex="-1"
        :aria-checked="code === props.locale ? 'true' : 'false'"
        :lang="code"
        @click="selectLanguage(code)"
      >
        <span class="pop-item-label">{{ localeNames[code] }}</span>
        <svg class="icon pop-check" aria-hidden="true"><use href="/img/icons.svg#i-check" /></svg>
      </button>
    </template>
  </PopMenu>
</template>
