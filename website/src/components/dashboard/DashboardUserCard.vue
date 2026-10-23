<script setup lang="ts">
/**
 * 侧栏底部用户卡：三种形态同构（头像位 + 身份行 + 尾图标），收起为图标栏时只留头像位，由样式裁剪淡出。
 *
 * - 恢复会话中：同尺寸骨架；未登录：Sign in；网络不通：无法连接的说明。
 * - 已登录：头像、姓名、邮箱，下方是 Online 档位徽标与本月 records 额度（数字 + 细进度条）；
 *   图标栏下头像外圈的额度环表示同一额度，阈值色一致。订阅读取失败显示 Unavailable，绝不显示为 Free。
 * - 已登录时头像行是账户菜单的触发按钮（DashboardAccountMenu）。
 */
import { computed } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { Locale } from '../../i18n/ui'
import type { OnlineOptions } from '../../scripts/dashboard/api'
import { fill, formatNumber, quotaLevel } from '../../scripts/dashboard/format'
import type { DashboardView } from '../../scripts/dashboard/route'
import type { SiteSession } from '../../scripts/site/session'
import DashboardAccountMenu from './DashboardAccountMenu.vue'

const props = defineProps<{
  copy: DashboardContent
  session: SiteSession | null
  options: OnlineOptions | null
  /** 额度读取失败且没有可用数据：额度行留空，不显示骨架。 */
  optionsError: boolean
  upgradeHref: string
  locale: Locale
  localePrefix: string
  view: DashboardView
  /** 宽屏图标栏：账户菜单在侧栏右侧弹出。 */
  rail: boolean
}>()

const emit = defineEmits<{
  signIn: []
  navigate: [view: DashboardView]
  menuOpen: []
}>()

const user = computed(() => props.session?.status === 'signed-in' ? props.session.user : null)
const name = computed(() => user.value?.full_name?.trim() || user.value?.email || '')
const initial = computed(() => (name.value.trim().charAt(0) || 'U').toUpperCase())
const avatarUrl = computed(() => user.value?.avatar_url?.trim() ?? '')
const plan = computed(() => {
  const subscription = user.value?.maps_online_subscription
  if (subscription?.status === 'unavailable') return { kind: 'unavailable', label: props.copy.account.planUnavailable } as const
  if (subscription?.status === 'active' && subscription.expires_at !== null) return { kind: 'active', label: subscription.display_name } as const
  return { kind: 'free', label: props.copy.subscriptions.free } as const
})
const usage = computed(() => props.options?.usage ?? null)
const level = computed(() => usage.value ? quotaLevel(usage.value.used, usage.value.total) : '')
/** 已用比例（0–100）：额度条用百分比宽度，额度环用 pathLength=100 的描边长度。 */
const ratio = computed(() => {
  const current = usage.value
  if (!current || current.total <= 0) return current ? 100 : 0
  return Math.min(100, Math.max(0, (current.used / current.total) * 100))
})
</script>

<template>
  <div v-if="props.session === null" class="user-box" aria-hidden="true">
    <div class="user-trigger">
      <span class="avatar-wrap"><span class="skel skel--circle avatar-skel"></span></span>
      <span class="user-ident skel-stack"><span class="skel" style="width: 70%"></span><span class="skel" style="width: 92%"></span></span>
    </div>
    <div class="user-plan-clip">
      <div class="user-plan">
        <span class="skel skel--pill" style="width: 96px; height: 22px"></span>
        <span class="skel" style="width: 74%"></span>
        <span class="skel skel--pill" style="height: 6px"></span>
      </div>
    </div>
  </div>

  <div v-else-if="props.session.status === 'signed-out'" class="user-box">
    <button class="user-trigger" type="button" :data-tip="props.copy.history.signInCta" @click="emit('signIn')">
      <span class="avatar-wrap">
        <span class="avatar avatar--muted" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-user" /></svg></span>
      </span>
      <span class="user-ident"><span class="user-name">{{ props.copy.history.signInCta }}</span></span>
      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-arrow-right" /></svg>
    </button>
  </div>

  <div v-else-if="props.session.status === 'unreachable'" class="user-box">
    <div class="user-trigger" :data-tip="props.copy.history.unreachable">
      <span class="avatar-wrap">
        <span class="avatar avatar--warn" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-alert" /></svg></span>
      </span>
      <span class="user-ident"><span class="user-note-text">{{ props.copy.history.unreachable }}</span></span>
    </div>
  </div>

  <div v-else class="user-box">
    <DashboardAccountMenu
      :copy="props.copy"
      :user="props.session.user"
      :token="props.session.token"
      :locale="props.locale"
      :locale-prefix="props.localePrefix"
      :view="props.view"
      :rail="props.rail"
      @navigate="view => emit('navigate', view)"
      @open="emit('menuOpen')"
    >
      <template #trigger="{ bind }">
        <!-- 套餐区在图标栏里被隐藏：aria-describedby 引用后读屏仍能读到套餐与额度 -->
        <button
          v-bind="bind"
          class="user-trigger"
          type="button"
          :aria-label="`${name}, ${props.copy.account.menuButtonLabel}`"
          aria-describedby="user-plan"
          :data-tip="name"
          data-dashboard-account-button
        >
          <span class="avatar-wrap">
            <span class="avatar" aria-hidden="true">
              <img v-if="avatarUrl" :src="avatarUrl" alt="" referrerpolicy="no-referrer" />
              <template v-else>{{ initial }}</template>
            </span>
            <svg
              class="avatar-ring"
              :class="{ 'is-empty': ratio < 0.5 }"
              viewBox="0 0 40 40"
              :data-level="level || undefined"
              :style="{ '--v': ratio.toFixed(1) }"
              aria-hidden="true"
            >
              <circle class="ring-track" cx="20" cy="20" r="19" pathLength="100" />
              <circle class="ring-value" cx="20" cy="20" r="19" pathLength="100" />
            </svg>
          </span>
          <span class="user-ident">
            <span class="user-name">{{ name }}</span>
            <span class="user-email">{{ user?.email }}</span>
          </span>
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-selector" /></svg>
        </button>
      </template>
    </DashboardAccountMenu>
    <div class="user-plan-clip">
      <div id="user-plan" class="user-plan">
        <div class="user-plan-row">
          <span v-if="plan.kind === 'unavailable'" class="badge badge--warn">
            <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>{{ plan.label }}
          </span>
          <span v-else-if="plan.kind === 'active'" class="badge">{{ plan.label }}</span>
          <template v-else>
            <span class="badge badge--muted">{{ plan.label }}</span>
            <a class="d-link user-up" :href="props.upgradeHref">{{ props.copy.account.upgrade }}</a>
          </template>
        </div>
        <template v-if="usage">
          <span class="user-quota">{{ fill(props.copy.account.usageShort, { used: formatNumber(usage.used), total: formatNumber(usage.total) }) }}</span>
          <div class="meter meter--thin" :data-level="level || undefined" aria-hidden="true"><i :style="{ '--v': `${ratio.toFixed(1)}%` }"></i></div>
        </template>
        <template v-else-if="!props.optionsError">
          <span class="skel" style="width: 72%" aria-hidden="true"></span>
          <span class="skel skel--pill" style="height: 4px" aria-hidden="true"></span>
        </template>
      </div>
    </div>
  </div>
</template>
