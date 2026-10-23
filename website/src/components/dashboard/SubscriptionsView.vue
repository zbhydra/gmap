<script setup lang="ts">
/**
 * 订阅视图：Online Scraper / Browser Extension / API 三张方案卡，数据来自会话里的三线订阅摘要，会话就绪即可渲染。
 *
 * - 有效 = active 且有到期时间；unavailable 显示暂不可用，绝不显示为 Free。
 * - 有效且自动续费才出现管理入口：在点击手势内同步预开空白窗口，拿到渠道 URL 再跳转；URL 为空时关窗并打开渠道内
 *   操作指引；预开被拦截或请求失败时在该卡片内提示。
 * - 选购跳 Pricing 对应产品；购买能力未交付（lib/capabilities.ts）时灰化为 Coming soon，存量订阅的管理不受影响。
 */
import { computed, ref } from 'vue'
import type { DashboardContent, DashboardLineId } from '../../i18n/schema'
import { capabilities, type Capability } from '../../lib/capabilities'
import type { RequestContext } from '../../scripts/homepage/api'
import type { HomepageUserInfo, HomepageUserSubscription } from '../../scripts/homepage/auth'
import { createSubscriptionManagementUrl } from '../../scripts/dashboard/api'
import { epochMs, fill, formatDate } from '../../scripts/dashboard/format'
import { isSessionExpiry } from '../../scripts/dashboard/workspace'
import CancelGuideDialog from './CancelGuideDialog.vue'

const props = defineProps<{
  copy: DashboardContent
  context: RequestContext
  user: HomepageUserInfo
  localePrefix: string
  /** 支付窗口被拦截时的引导文案（AccountContent 公共键）。 */
  popupBlocked: string
  /** 未交付能力提示（common.comingSoon）。 */
  comingSoon: string
}>()

interface PlanLine {
  id: DashboardLineId
  productKind: string
  subscriptionKey: 'maps_online_subscription' | 'maps_extension_subscription' | 'maps_api_subscription'
  /** 购买能力；null 为已交付。 */
  purchaseCapability: Capability | null
  icon: string
}

const LINES: readonly PlanLine[] = [
  { id: 'online', productKind: 'maps_online', subscriptionKey: 'maps_online_subscription', purchaseCapability: null, icon: 'cloud' },
  { id: 'extension', productKind: 'maps_extension', subscriptionKey: 'maps_extension_subscription', purchaseCapability: 'extensionPurchase', icon: 'puzzle' },
  { id: 'api', productKind: 'maps_api', subscriptionKey: 'maps_api_subscription', purchaseCapability: 'scraperApi', icon: 'code' }
]

/** 支付渠道品牌名，不翻译（与下单页一致）。 */
const PAYMENT_METHODS: Readonly<Record<string, string>> = { paypal: 'PayPal', clink: 'ClinkBill' }

const guideOpen = ref(false)
const managingLine = ref<DashboardLineId | null>(null)
/** 管理入口的卡内提示：只显示在最近一次操作的卡片上。 */
const manageMessage = ref<{ line: DashboardLineId; text: string } | null>(null)

/** 有效订阅（active 且有到期时间）的展示信息；其余按 Free 展示，unavailable 另行判断。 */
function activePlan(subscription: HomepageUserSubscription | null | undefined) {
  if (subscription?.status !== 'active' || subscription.expires_at == null) return null
  return {
    name: subscription.display_name,
    expires: formatDate(epochMs(subscription.expires_at)),
    autoRenew: subscription.auto_renew,
    payment: subscription.payment_method ? PAYMENT_METHODS[subscription.payment_method] : undefined
  }
}

const cards = computed(() => LINES.map(line => {
  const subscription = props.user[line.subscriptionKey]
  return {
    ...line,
    unavailable: subscription?.status === 'unavailable',
    plan: activePlan(subscription),
    canPurchase: line.purchaseCapability === null || capabilities[line.purchaseCapability],
    pricingHref: `${props.localePrefix}/pricing/?product_kind=${line.productKind}`
  }
}))

async function manageSubscription(line: PlanLine): Promise<void> {
  if (managingLine.value) return
  // 预开必须留在点击手势的同步调用栈内，否则会被浏览器拦截
  const manageWindow = window.open('', '_blank')
  manageMessage.value = null
  if (!manageWindow) {
    manageMessage.value = { line: line.id, text: props.popupBlocked }
    return
  }
  manageWindow.opener = null
  managingLine.value = line.id
  try {
    const url = await createSubscriptionManagementUrl(props.context, line.productKind)
    if (!url) {
      manageWindow.close()
      guideOpen.value = true
    } else if (!manageWindow.closed) {
      manageWindow.location.href = url
    }
  } catch (error) {
    manageWindow.close()
    if (!isSessionExpiry(error)) {
      console.error(new Error(`[dashboard-subscriptions] management URL request failed: product_kind=${line.productKind}`, { cause: error }))
      manageMessage.value = { line: line.id, text: props.copy.subscriptions.manageFailed }
    }
  } finally {
    managingLine.value = null
  }
}
</script>

<template>
  <div class="view-stack">
    <p class="view-intro">{{ props.copy.subscriptions.description }}</p>

    <div class="plans-grid">
      <article
        v-for="card in cards"
        :key="card.id"
        class="d-panel plan-card"
        :aria-labelledby="`subs-plan-${card.id}`"
        :data-subscription-line="card.id"
      >
        <div class="plan-head">
          <span class="icon-tile" aria-hidden="true"><svg class="icon"><use :href="`/img/icons.svg#i-${card.icon}`" /></svg></span>
          <h2 :id="`subs-plan-${card.id}`" class="plan-line">{{ props.copy.subscriptions.lines[card.id] }}</h2>
        </div>

        <div class="plan-body">
          <div v-if="card.unavailable" class="callout callout--warn">
            <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
            <div class="callout-body">{{ props.copy.subscriptions.unavailable }}</div>
          </div>
          <template v-else>
            <div class="plan-name-wrap">
              <span class="d-label">{{ props.copy.subscriptions.planLabel }}</span>
              <span class="plan-big">{{ card.plan ? card.plan.name : props.copy.subscriptions.free }}</span>
            </div>
            <template v-if="card.plan">
              <dl class="kv">
                <div>
                  <dt>{{ props.copy.subscriptions.expiresLabel }}</dt>
                  <dd>{{ card.plan.expires }}</dd>
                </div>
              </dl>
              <ul class="plan-meta">
                <li :data-auto-renew="card.plan.autoRenew ? 'on' : 'off'">
                  <svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
                  {{ card.plan.autoRenew ? props.copy.subscriptions.autoRenewOn : props.copy.subscriptions.autoRenewOff }}
                </li>
                <li v-if="card.plan.payment">
                  <svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-credit-card" /></svg>
                  {{ fill(props.copy.subscriptions.paidVia, { method: card.plan.payment }) }}
                </li>
              </ul>
            </template>
          </template>
        </div>

        <div class="plan-foot">
          <div class="plan-actions">
            <button
              v-if="card.plan?.autoRenew"
              class="btn btn-secondary btn-xs"
              :class="{ 'is-busy': managingLine === card.id }"
              type="button"
              :data-subs-manage="card.id"
              :aria-busy="managingLine === card.id ? 'true' : undefined"
              @click="manageSubscription(card)"
            >
              <template v-if="managingLine === card.id">
                <span class="spinner spinner--sm" aria-hidden="true"></span>{{ props.copy.subscriptions.managingSubscription }}
              </template>
              <template v-else>{{ props.copy.subscriptions.manageSubscription }}</template>
            </button>
            <a
              v-if="card.canPurchase"
              class="btn btn-xs"
              :class="card.id === 'online' ? 'btn-primary' : 'btn-secondary'"
              :href="card.pricingHref"
              :data-subs-buy="card.id"
            >
              {{ props.copy.subscriptions.subscribeCta }}
            </a>
            <button v-else class="btn btn-secondary btn-xs is-unavailable" type="button" aria-disabled="true" :data-subs-buy="card.id">
              {{ props.copy.subscriptions.subscribeCta }}<span class="badge badge--muted soon-badge">{{ props.comingSoon }}</span>
            </button>
          </div>
          <p v-if="manageMessage?.line === card.id" class="inline-err" role="alert">{{ manageMessage.text }}</p>
        </div>
      </article>
    </div>

    <CancelGuideDialog :open="guideOpen" :copy="props.copy.cancelGuide" @close="guideOpen = false" />
  </div>
</template>
