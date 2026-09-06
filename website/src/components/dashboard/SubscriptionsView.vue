<script setup lang="ts">
/**
 * 订阅管理视图：同屏展示 Online / Extension / API 三线订阅的套餐、状态、
 * 到期与自动续费；选购 / 升级统一跳 Pricing 对应产品 tab；有效自动续费订阅
 * 在此打开渠道管理页（URL 为空时回退渠道内操作指引，窗口被拦截时就地提示）。
 */
import { ref } from 'vue'
import type { DashboardContent, DashboardLineId } from '../../i18n/schema'
import type { HomepageUserInfo, HomepageUserSubscription } from '../../scripts/homepage/auth'
import { createSubscriptionManagementUrl } from '../../scripts/dashboard/api'
import CancelGuideDialog from './CancelGuideDialog.vue'

export interface Props {
  copy: DashboardContent
  user: HomepageUserInfo
  token: string
  deviceId: string
  /** 支付窗口被拦截时的引导文案（AccountContent 公共键）。 */
  popupBlocked: string
  localePrefix: string
}

const props = defineProps<Props>()

/** 展示线与 auth/me 三线订阅字段、后端 product_kind 的映射。 */
const LINES: readonly {
  id: DashboardLineId
  productKind: string
  subscriptionKey: 'maps_online_subscription' | 'maps_extension_subscription' | 'maps_api_subscription'
}[] = [
  { id: 'online', productKind: 'maps_online', subscriptionKey: 'maps_online_subscription' },
  { id: 'extension', productKind: 'maps_extension', subscriptionKey: 'maps_extension_subscription' },
  { id: 'api', productKind: 'maps_api', subscriptionKey: 'maps_api_subscription' }
]

const guideOpen = ref(false)
const managingLine = ref<DashboardLineId | null>(null)
const actionMessage = ref('')

const context = () => ({ deviceId: props.deviceId, token: props.token })

function subscriptionOf(subscriptionKey: (typeof LINES)[number]['subscriptionKey']): HomepageUserSubscription | null {
  return props.user[subscriptionKey] ?? null
}

/** 订阅配置异常（unavailable）必须显示不可用，不得伪装成未订阅。 */
function isUnavailable(subscription: HomepageUserSubscription | null): boolean {
  return subscription?.status === 'unavailable'
}

/** 有效订阅 = active 且有到期时间。 */
function isActive(subscription: HomepageUserSubscription | null): boolean {
  return subscription?.status === 'active' && subscription.expires_at != null
}

let dateFormatter: Intl.DateTimeFormat | null = null

/** 到期时间格式化器；Astro SSR 也会执行组件模块，读取 DOM 必须推迟到客户端。 */
function expiryFormatter(): Intl.DateTimeFormat {
  if (!dateFormatter) {
    dateFormatter = new Intl.DateTimeFormat(document.documentElement.lang || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return dateFormatter
}

function formatExpiry(value: number | null): string {
  if (!value) {
    return props.copy.subscriptions.noExpiry
  }
  const ms = value < 10_000_000_000 ? value * 1000 : value
  return expiryFormatter().format(new Date(ms))
}

function pricingUrl(productKind: string): string {
  return `${props.localePrefix}/pricing/?product_kind=${productKind}`
}

function lineName(id: DashboardLineId): string {
  return props.copy.subscriptions.lines[id]
}

/** 同步预开空白渠道管理窗口：必须在用户手势调用栈内执行，避免 popup 被拦截后已发管理请求。 */
function openManageWindow(): Window | null {
  const popup = window.open('', '_blank')
  if (popup) {
    popup.opener = null
  }
  return popup
}

async function manageSubscription(lineId: DashboardLineId, productKind: string): Promise<void> {
  if (guideOpen.value || managingLine.value) {
    return
  }

  const manageWindow = openManageWindow()
  if (!manageWindow) {
    actionMessage.value = props.popupBlocked
    return
  }

  actionMessage.value = ''
  managingLine.value = lineId
  try {
    const url = await createSubscriptionManagementUrl(context(), productKind)
    if (url) {
      if (!manageWindow.closed) {
        manageWindow.location.href = url
      }
    } else {
      manageWindow.close()
      guideOpen.value = true
    }
  } catch (error) {
    console.error(new Error(`[dashboard-subscriptions] management URL request failed: product_kind=${productKind}`, { cause: error }))
    manageWindow.close()
    actionMessage.value = props.copy.subscriptions.loadFailed
  } finally {
    managingLine.value = null
  }
}
</script>

<template>
  <section class="subs" aria-labelledby="dashboard-subs-title">
    <header class="subs-head">
      <h1 id="dashboard-subs-title">{{ props.copy.subscriptions.title }}</h1>
      <p class="subs-description">{{ props.copy.subscriptions.description }}</p>
    </header>

    <div class="subs-grid">
      <article
        v-for="line in LINES"
        :key="line.id"
        class="subs-card"
        :data-subscription-line="line.id"
      >
        <h2 class="subs-line">{{ lineName(line.id) }}</h2>
        <template v-for="subscription in [subscriptionOf(line.subscriptionKey)]" :key="line.id">
          <p v-if="isUnavailable(subscription)" class="subs-state" :data-state="'unavailable'">
            {{ props.copy.subscriptions.unavailable }}
          </p>
          <template v-else>
            <p class="subs-plan">
              <span class="subs-plan-label">{{ props.copy.subscriptions.planLabel }}</span>
              <span class="subs-plan-name">{{ isActive(subscription) ? subscription?.display_name : props.copy.subscriptions.free }}</span>
            </p>
            <p v-if="isActive(subscription)" class="subs-meta">
              <span>{{ props.copy.subscriptions.expiresLabel }}</span>
              <span>{{ formatExpiry(subscription?.expires_at ?? null) }}</span>
            </p>
            <p v-if="isActive(subscription)" class="subs-meta" :data-auto-renew="subscription?.auto_renew ? 'on' : 'off'">
              {{ subscription?.auto_renew ? props.copy.subscriptions.autoRenewOn : props.copy.subscriptions.autoRenewOff }}
            </p>
          </template>
        </template>

        <div class="subs-actions">
          <button
            v-if="isActive(subscriptionOf(line.subscriptionKey)) && subscriptionOf(line.subscriptionKey)?.auto_renew"
            type="button"
            class="subs-manage"
            :data-subs-manage="line.id"
            :disabled="managingLine === line.id"
            @click="manageSubscription(line.id, line.productKind)"
          >
            {{ managingLine === line.id ? props.copy.subscriptions.managingSubscription : props.copy.subscriptions.manageSubscription }}
          </button>
          <a class="subs-buy" :data-subs-buy="line.id" :href="pricingUrl(line.productKind)">
            {{ props.copy.subscriptions.subscribeCta }}
          </a>
        </div>
      </article>
    </div>

    <p v-if="actionMessage" class="subs-action-error" role="alert">{{ actionMessage }}</p>

    <CancelGuideDialog
      :open="guideOpen"
      :copy="props.copy.cancelGuide"
      @close="guideOpen = false"
    />
  </section>
</template>

<style scoped>
.subs {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}

.subs-head h1 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 32px;
}

.subs-description {
  margin-top: var(--space-1);
  color: var(--text-2);
  font-size: 13.5px;
  line-height: 1.6;
}

.subs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.subs-card {
  display: grid;
  align-content: start;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-6);
  border: 1px solid var(--border);
  border-radius: var(--rounded-md);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.subs-line {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.subs-state {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--warn);
  border-radius: var(--rounded-sm);
  background: var(--warn-soft);
  color: var(--warn);
  font-size: 13px;
  font-weight: 600;
}

.subs-plan {
  display: grid;
  gap: var(--space-1);
}

.subs-plan-label {
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.subs-plan-name {
  color: var(--text);
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  overflow-wrap: anywhere;
}

.subs-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  color: var(--text-2);
  font-size: 13px;
  line-height: 18px;
}

.subs-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border);
}

.subs-manage {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 var(--space-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--rounded-full);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.subs-manage:hover:not(:disabled) {
  background: var(--surface-2);
}

.subs-manage:disabled {
  cursor: wait;
  color: var(--text-3);
  opacity: 0.72;
}

.subs-manage:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.subs-buy {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--rounded-full);
  background: var(--primary);
  color: var(--primary-fg);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.subs-buy:hover {
  background: var(--primary-hover);
}

.subs-buy:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.subs-action-error {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--bad);
  border-radius: var(--rounded-sm);
  background: var(--bad-soft);
  color: var(--bad);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}
</style>
