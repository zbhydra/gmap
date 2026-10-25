<script setup lang="ts">
/**
 * Dashboard 单页根组件：一个 Astro 入口装配，四个视图在同一页内切换（History API 最小路由，不引入 vue-router）。
 *
 * - 会话只在启动时恢复一次；登录成功、会话过期由站级事件驱动。登录后为该 token 建一份工作区数据，换号或过期即丢弃。
 * - 视图首次进入时挂载，之后 v-show 保活；每个视图分骨架 / 门槛 / 内容三层，数据到达后只淡入、不位移。
 * - 切换视图 pushState，History 的筛选与翻页 replaceState；前进后退恢复各视图的滚动位置，切换后焦点移到 h1。
 * - 侧栏收放时主区布局锁在起始宽（html[data-side-from]），T2 结束后一次切到目标宽对应的布局并淡入。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch, type ComponentPublicInstance } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { Locale } from '../../i18n/ui'
import { overlayOpen, reducedMotion, replayClass } from '../../scripts/dashboard/dom'
import { isRunningStatus } from '../../scripts/dashboard/jobs'
import {
  DASHBOARD_VIEWS,
  dashboardPath,
  HISTORY_DEFAULTS,
  historySearch,
  readHistoryQuery,
  viewFromPath,
  type DashboardView,
  type HistoryQuery
} from '../../scripts/dashboard/route'
import { createWorkspace, type DashboardWorkspace } from '../../scripts/dashboard/workspace'
import { ensureDeviceId } from '../../scripts/homepage/device'
import { closePop } from '../../scripts/site/pop'
import { getSiteSession, SITE_SESSION_EXPIRED_EVENT, type SiteSession } from '../../scripts/site/session'
import { SITE_AUTH_CLOSE_EVENT, SITE_AUTH_SUCCESS_EVENT } from '../auth/site-auth-controller'
import { trackDashboardAction } from '../../scripts/homepage/web-mark'
import DashboardSideNav from './DashboardSideNav.vue'
import DashboardSkeleton from './DashboardSkeleton.vue'
import DashboardUserCard from './DashboardUserCard.vue'
import JobHistory from './JobHistory.vue'
import OnlineComposer from './OnlineComposer.vue'
import RecentJobs from './RecentJobs.vue'
import ApiView from './ApiView.vue'
import SubscriptionsView from './SubscriptionsView.vue'

const props = defineProps<{
  /** 页面路由给出的首屏视图（构建期渲染骨架用）。 */
  initialView: DashboardView
  copy: DashboardContent
  /** 支付窗口被拦截时的引导文案（AccountContent 公共键）。 */
  popupBlocked: string
  /** 未交付能力提示（common.comingSoon），订阅视图灰化选购按钮用。 */
  comingSoon: string
  /** 当前语言路径前缀（en-US 为空）。 */
  localePrefix: string
  locale: Locale
}>()

type Part = 'skeleton' | 'gate' | 'content'

/** T2（--dur-3 = 360ms）加余量：收放过渡的 transitionend 丢失时仍能解除布局锁定。 */
const SIDE_UNLOCK_FALLBACK_MS = 480

const homeUrl = `${props.localePrefix}/`
const session = shallowRef<SiteSession | null>(null)
const workspace = shallowRef<DashboardWorkspace | null>(null)
/** 每换一份工作区（登录、换号）递增：视图内容按它重新挂载，不沿用上一个账号的组件状态。 */
const workspaceKey = ref(0)
const view = ref<DashboardView>(props.initialView)
const visited = reactive(new Set<DashboardView>([props.initialView]))
const historyQuery = ref<HistoryQuery>({ ...HISTORY_DEFAULTS })
/** History 与 API 视图首次加载结束（成功或失败）后才换下骨架；订阅视图只依赖会话。 */
const loaded = reactive({ history: false, api: false })
const historyLive = ref(false)
const drawerOpen = ref(false)
const narrow = ref(false)
const scrolled = ref(false)
const appEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const actionsEl = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)
const sideNav = ref<InstanceType<typeof DashboardSideNav> | null>(null)
/** History 在视图循环里渲染：模板 ref 按 Vue 约定收集为数组，最多一个实例。 */
const historyViews = ref<InstanceType<typeof JobHistory>[]>([])
const sections = new Map<DashboardView, HTMLElement>()
const scrollMemory = new Map<DashboardView, number>()
let deviceId = ''
let currentToken = ''
let shownPhases: Part[] = []
let narrowQuery: MediaQueryList | null = null
let unlockTimer: ReturnType<typeof setTimeout> | undefined

const VIEW_TITLES = computed<Record<DashboardView, string>>(() => ({
  online: props.copy.shell.navOnline,
  history: props.copy.shell.navJobHistory,
  api: props.copy.shell.navApi,
  subscriptions: props.copy.shell.navSubscriptions
}))
const user = computed(() => session.value?.status === 'signed-in' ? session.value.user : null)
const recent = computed(() => workspace.value?.state.recent ?? null)
const onlineLive = computed(() => Boolean(recent.value && !recent.value.refreshError && recent.value.jobs.some(job => isRunningStatus(job.status))))

function viewReady(name: DashboardView): boolean {
  const state = workspace.value?.state
  if (!state) return false
  if (name === 'online') return state.optionsSettled && state.recent.settled
  if (name === 'subscriptions') return true
  return loaded[name]
}

function phase(name: DashboardView): Part {
  if (session.value === null) return 'skeleton'
  if (session.value.status !== 'signed-in') return 'gate'
  return viewReady(name) ? 'content' : 'skeleton'
}

function viewHref(name: DashboardView): string {
  return dashboardPath(props.localePrefix, name) + (name === 'history' ? historySearch(historyQuery.value) : '')
}

function signInPrompt(name: DashboardView): string {
  if (name === 'api') return props.copy.api.signInPrompt
  if (name === 'subscriptions') return props.copy.subscriptions.signInPrompt
  return props.copy.history.signInPrompt
}

/* ---------------------------------------------------------------- 会话与工作区 */

function applySession(next: SiteSession): void {
  const token = next.status === 'signed-in' ? next.token : ''
  if (token !== currentToken) {
    // 换号或退出：上一个账号的浮层（账户菜单等）一并收起
    closePop({ focus: false })
    workspace.value?.dispose()
    workspace.value = token ? createWorkspace({ deviceId, token }, props.copy) : null
    workspaceKey.value++
    loaded.history = false
    loaded.api = false
    historyLive.value = false
    currentToken = token
    void workspace.value?.loadOptions()
  }
  session.value = next
}

async function restoreSession(): Promise<void> {
  session.value = null
  const [restored, device] = await Promise.all([getSiteSession(), deviceId || ensureDeviceId()])
  deviceId = device
  applySession(restored)
}

function openSignIn(): void {
  window.siteAuthController?.open()
}

/** 登录成功：站级控制器已写入共享会话，直接采用，不再发起第二次 auth/me。 */
async function handleAuthSuccess(): Promise<void> {
  applySession(await getSiteSession())
}

/** 匿名取消登录时回当前语言主页（工作区没有公开内容）。 */
function handleAuthClose(): void {
  if (session.value?.status === 'signed-out') window.location.assign(homeUrl)
}

/** 业务请求 401（API 边界广播）：回到登录门槛，走同一站级登录流程。 */
function handleSessionExpired(): void {
  trackDashboardAction('session_expired', { view: view.value })
  applySession({ status: 'signed-out' })
}

// 最近任务在 Online 首次进入后开始加载与轮询，之后切到其他视图也继续（任务结束的提示不依赖当前视图）
watch([workspace, () => visited.has('online')], ([current, online]) => {
  if (current && online) current.startRecent()
}, { immediate: true })

/* ---------------------------------------------------------------- 路由 */

/** 骨架换成门槛或内容、侧栏收放后切换布局：当前可见层只淡入，不位移。 */
function revealPart(name: DashboardView): void {
  const part = sections.get(name)?.querySelector(`:scope > [data-part="${phase(name)}"]`)
  if (part) replayClass(part, 'is-revealed')
}

watch(() => DASHBOARD_VIEWS.map(phase), next => {
  next.forEach((part, index) => {
    if (part !== 'skeleton' && part !== shownPhases[index]) revealPart(DASHBOARD_VIEWS[index])
  })
  shownPhases = next
}, { flush: 'post' })

function setSection(name: DashboardView, el: Element | ComponentPublicInstance | null): void {
  if (el instanceof HTMLElement) sections.set(name, el)
}

async function navigate(next: DashboardView, options: { push?: boolean; restore?: boolean } = {}): Promise<void> {
  // 收起浮层与抽屉：切换视图时焦点随后交给视图 h1；停在同一视图时焦点回到各自的触发器
  const same = next === view.value
  closePop({ focus: same })
  closeDrawer(same)
  if (same) {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'instant' : 'smooth' })
    return
  }
  trackDashboardAction('view_switch', { from: view.value, to: next })
  scrollMemory.set(view.value, window.scrollY)
  view.value = next
  visited.add(next)
  if (options.push !== false) history.pushState(null, '', viewHref(next))
  document.title = `${VIEW_TITLES.value[next]} · ${props.copy.seo.title}`
  await nextTick()
  const section = sections.get(next)
  if (section) replayClass(section, 'is-entering')
  if (titleEl.value) replayClass(titleEl.value, 'is-swapping')
  if (actionsEl.value) replayClass(actionsEl.value, 'is-swapping')
  window.scrollTo({ top: options.restore ? scrollMemory.get(next) ?? 0 : 0, behavior: 'instant' })
  titleEl.value?.focus({ preventScroll: true })
}

/** History 的筛选与翻页只改当前历史记录，刷新后保持，不污染后退栈。 */
function updateHistoryQuery(next: HistoryQuery): void {
  historyQuery.value = next
  if (view.value === 'history') history.replaceState(history.state, '', viewHref('history'))
}

/** 从最近任务定位任务（q 为完整任务号）或 View all（q 为空）：其余筛选回到默认，保留每页条数。 */
async function openHistory(q: string): Promise<void> {
  historyQuery.value = { ...HISTORY_DEFAULTS, size: historyQuery.value.size, q }
  await navigate('history')
  // 每次定位都展开该任务：由 History 直接展开，不取决于查询是否变化、新列表是否已返回
  if (q) historyViews.value[0]?.revealJob(q)
}

function handlePopState(): void {
  const next = viewFromPath(window.location.pathname)
  if (next === 'history') historyQuery.value = readHistoryQuery(window.location.search)
  // 同视图的 popstate 只来自页内锚点（如 Skip to content），不改视图也不滚动
  if (next !== view.value) void navigate(next, { push: false, restore: true })
}

/* ---------------------------------------------------------------- 抽屉与侧栏收放 */

function openDrawer(): void {
  drawerOpen.value = true
  void nextTick(() => sideNav.value?.focusClose())
}

function closeDrawer(returnFocus: boolean): void {
  if (!drawerOpen.value) return
  drawerOpen.value = false
  if (returnFocus) menuButton.value?.focus()
}

function handleNarrowChange(event: MediaQueryListEvent): void {
  narrow.value = event.matches
  if (!event.matches) closeDrawer(false)
}

/** 收放开始：主区布局锁在起始宽；过渡中途反向切换时保留最初的起点。减弱动效没有中间帧，不锁。 */
function lockLayout(from: 'expanded' | 'collapsed'): void {
  if (reducedMotion()) return
  const root = document.documentElement
  root.dataset.sideFrom ??= from
  clearTimeout(unlockTimer)
  unlockTimer = setTimeout(unlockLayout, SIDE_UNLOCK_FALLBACK_MS)
}

function unlockLayout(): void {
  clearTimeout(unlockTimer)
  const root = document.documentElement
  const from = root.dataset.sideFrom
  if (!from) return
  delete root.dataset.sideFrom
  const to = root.dataset.side === 'collapsed' ? 'collapsed' : 'expanded'
  if (from !== to) revealPart(view.value)
}

function handleTransitionEnd(event: TransitionEvent): void {
  if (event.target === appEl.value && event.propertyName === '--side-cur') unlockLayout()
}

/* ---------------------------------------------------------------- 全局事件 */

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && drawerOpen.value && !overlayOpen()) closeDrawer(true)
}

function handleScroll(): void {
  scrolled.value = window.scrollY > 2
}

onMounted(() => {
  history.scrollRestoration = 'manual'
  if (view.value === 'history') historyQuery.value = readHistoryQuery(window.location.search)
  narrowQuery = matchMedia('(max-width: 959.98px)')
  narrow.value = narrowQuery.matches
  narrowQuery.addEventListener('change', handleNarrowChange)
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('popstate', handlePopState)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener(SITE_AUTH_SUCCESS_EVENT, handleAuthSuccess)
  window.addEventListener(SITE_AUTH_CLOSE_EVENT, handleAuthClose)
  window.addEventListener(SITE_SESSION_EXPIRED_EVENT, handleSessionExpired)
  void restoreSession()
})

onBeforeUnmount(() => {
  workspace.value?.dispose()
  clearTimeout(unlockTimer)
  narrowQuery?.removeEventListener('change', handleNarrowChange)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('popstate', handlePopState)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener(SITE_AUTH_SUCCESS_EVENT, handleAuthSuccess)
  window.removeEventListener(SITE_AUTH_CLOSE_EVENT, handleAuthClose)
  window.removeEventListener(SITE_SESSION_EXPIRED_EVENT, handleSessionExpired)
})
</script>

<template>
  <div ref="appEl" class="dash-app" :class="{ 'drawer-open': drawerOpen }" @transitionend="handleTransitionEnd">
    <a class="skip-link" href="#main">{{ props.copy.shell.skipToContent }}</a>

    <DashboardSideNav
      ref="sideNav"
      :copy="props.copy"
      :view="view"
      :view-href="viewHref"
      :home-href="homeUrl"
      :drawer-open="drawerOpen"
      :narrow="narrow"
      @navigate="name => navigate(name)"
      @close-drawer="closeDrawer(true)"
      @collapse="lockLayout"
    >
      <template #brand><slot name="brand" /></template>
      <template #default="{ rail }">
        <DashboardUserCard
          :copy="props.copy"
          :session="session"
          :options="workspace?.state.options ?? null"
          :options-error="workspace?.state.optionsError ?? false"
          :upgrade-href="`${props.localePrefix}/pricing/?product_kind=maps_online`"
          :locale="props.locale"
          :locale-prefix="props.localePrefix"
          :view="view"
          :rail="rail"
          @sign-in="openSignIn"
          @navigate="name => navigate(name)"
          @menu-open="sideNav?.hideTip()"
        />
      </template>
    </DashboardSideNav>
    <div class="dash-scrim" @click="closeDrawer(true)"></div>

    <div class="dash-main" :inert="drawerOpen">
      <header class="dash-topbar" :data-scrolled="scrolled ? '' : undefined">
        <div class="topbar-inner">
          <button
            ref="menuButton"
            class="icon-btn topbar-menu"
            type="button"
            aria-controls="dash-side"
            :aria-expanded="drawerOpen ? 'true' : 'false'"
            :aria-label="props.copy.shell.openMenu"
            @click="openDrawer"
          >
            <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-menu" /></svg>
          </button>
          <h1 id="view-title" ref="titleEl" class="topbar-title" tabindex="-1">{{ VIEW_TITLES[view] }}</h1>
          <div ref="actionsEl" class="topbar-actions">
            <template v-if="workspace && phase(view) === 'content'">
              <template v-if="view === 'online' && recent">
                <span v-if="onlineLive" class="live-note">
                  <i class="dot" aria-hidden="true"></i><span>{{ props.copy.history.autoRefresh }}</span>
                </span>
                <button
                  class="btn btn-secondary btn-xs"
                  type="button"
                  :title="props.copy.history.refresh"
                  :aria-busy="recent.loading && recent.manual ? 'true' : undefined"
                  @click="workspace.refreshOnline()"
                >
                  <span v-if="recent.loading && recent.manual" class="spinner spinner--sm" aria-hidden="true"></span>
                  <svg v-else class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
                  <span class="btn-label-wide">{{ props.copy.history.refresh }}</span>
                </button>
              </template>
              <span v-else-if="view === 'history' && historyLive" class="live-note">
                <i class="dot" aria-hidden="true"></i><span>{{ props.copy.history.autoRefresh }}</span>
              </span>
              <a
                v-else-if="view === 'api'"
                class="btn btn-secondary btn-xs"
                :href="`${props.localePrefix}/google-maps-scraper-api/`"
                :title="props.copy.api.docsLink"
              >
                <span class="btn-label-wide">{{ props.copy.api.docsLink }}</span>
                <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-arrow-up-right" /></svg>
              </a>
              <a
                v-else-if="view === 'subscriptions'"
                class="btn btn-secondary btn-xs"
                :href="`${props.localePrefix}/pricing/`"
                :title="props.copy.subscriptions.pricingLink"
              >
                <span class="btn-label-wide">{{ props.copy.subscriptions.pricingLink }}</span>
                <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-arrow-up-right" /></svg>
              </a>
            </template>
          </div>
        </div>
      </header>

      <main id="main" class="dash-content" tabindex="-1">
        <!-- 视图骨架整块对读屏隐藏：会话恢复期间在这里播报加载中，视图内的加载与结果由各视图自己播报 -->
        <p class="sr-only" role="status">{{ session === null ? props.copy.shell.loading : '' }}</p>

        <section
          v-for="name in DASHBOARD_VIEWS"
          v-show="name === view"
          :key="name"
          :ref="el => setSection(name, el)"
          class="dash-view"
          :data-view="name"
          aria-labelledby="view-title"
        >
          <template v-if="visited.has(name)">
            <DashboardSkeleton v-if="phase(name) === 'skeleton'" data-part="skeleton" :view="name" />

            <div v-else-if="phase(name) === 'gate'" data-part="gate">
              <div v-if="session?.status === 'signed-out'" class="gate">
                <span class="icon-tile" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-lock" /></svg></span>
                <p class="gate-text">{{ signInPrompt(name) }}</p>
                <button class="btn btn-primary btn-sm" type="button" data-site-auth-entry @click="openSignIn">
                  {{ props.copy.history.signInCta }}
                </button>
              </div>
              <div v-else class="gate">
                <span class="icon-tile" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-plug" /></svg></span>
                <p class="gate-text">{{ props.copy.history.unreachable }}</p>
                <button class="btn btn-secondary btn-sm" type="button" @click="restoreSession">
                  <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>{{ props.copy.shell.retry }}
                </button>
              </div>
            </div>

            <template v-if="workspace && user">
              <div v-if="name === 'online'" v-show="phase(name) === 'content'" :key="workspaceKey" class="view-stack" data-part="content">
                <OnlineComposer
                  :copy="props.copy"
                  :workspace="workspace"
                  :upgrade-href="`${props.localePrefix}/pricing/?product_kind=maps_online`"
                />
                <RecentJobs
                  :copy="props.copy"
                  :workspace="workspace"
                  :history-href="q => dashboardPath(props.localePrefix, 'history') + historySearch({ ...HISTORY_DEFAULTS, size: historyQuery.size, q })"
                  @open-history="openHistory"
                />
              </div>
              <JobHistory
                v-else-if="name === 'history'"
                v-show="phase(name) === 'content'"
                ref="historyViews"
                :key="workspaceKey"
                data-part="content"
                :copy="props.copy"
                :workspace="workspace"
                :active="view === 'history'"
                :query="historyQuery"
                :online-href="dashboardPath(props.localePrefix, 'online')"
                @update:query="updateHistoryQuery"
                @open-online="navigate('online')"
                @ready="loaded.history = true"
                @live="value => historyLive = value"
              />
              <ApiView
                v-else-if="name === 'api'"
                v-show="phase(name) === 'content'"
                :key="workspaceKey"
                data-part="content"
                :copy="props.copy"
                :context="workspace.context"
                :user="user"
                :locale-prefix="props.localePrefix"
                :subscriptions-href="viewHref('subscriptions')"
                :active="view === 'api'"
                @ready="loaded.api = true"
                @open-subscriptions="navigate('subscriptions')"
              />
              <SubscriptionsView
                v-else
                v-show="phase(name) === 'content'"
                :key="workspaceKey"
                data-part="content"
                :copy="props.copy"
                :context="workspace.context"
                :user="user"
                :locale-prefix="props.localePrefix"
                :popup-blocked="props.popupBlocked"
                :coming-soon="props.comingSoon"
              />
            </template>
          </template>
        </section>
      </main>
    </div>
  </div>
</template>
