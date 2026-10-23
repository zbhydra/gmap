<script setup lang="ts">
/**
 * API 合卡：卡头是会话里的 API 订阅摘要（套餐、续期 / 到期日、自动续费），卡身是本月用量接口。
 * 两区各自加载、各自失败：订阅不可用只让卡头显示 Unavailable（绝不显示为 Free），用量失败只影响卡身。
 * 刷新按钮只重新拉取用量；刷新失败保留上次的数值，只在下方补一行说明。
 */
import { computed, onMounted, ref } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { RequestContext } from '../../scripts/homepage/api'
import type { HomepageUserSubscription } from '../../scripts/homepage/auth'
import { getMapsApiUsage, type MapsApiUsage } from '../../scripts/dashboard/api'
import { epochMs, fill, formatDate, formatNumber, quotaLevel } from '../../scripts/dashboard/format'
import { isPlainClick } from '../../scripts/dashboard/route'
import { isSessionExpiry } from '../../scripts/dashboard/workspace'

const props = defineProps<{
  copy: DashboardContent
  context: RequestContext
  subscription?: HomepageUserSubscription | null
  subscriptionsHref: string
  /** Free 档的 Upgrade：Pricing 的 API 产品。 */
  pricingHref: string
}>()

const emit = defineEmits<{ openSubscriptions: [] }>()

const usage = ref<MapsApiUsage | null>(null)
const loading = ref(false)
const failed = ref(false)

const [usedBefore, usedAfter] = props.copy.api.usageValue.split('{used}')

/** 有效订阅：active 且有到期时间；其余（含后端缺省）按 Free 展示，只有 unavailable 显示不可用。 */
const activePlan = computed(() => {
  const subscription = props.subscription
  if (subscription?.status !== 'active' || subscription.expires_at == null) return null
  return {
    name: subscription.display_name,
    expires: formatDate(epochMs(subscription.expires_at)),
    autoRenew: subscription.auto_renew
  }
})

const meter = computed(() => {
  if (!usage.value) return null
  const { used, total } = usage.value
  return { level: quotaLevel(used, total), width: `${Math.min(100, (used / total) * 100)}%` }
})

async function loadUsage(): Promise<void> {
  if (loading.value) return
  loading.value = true
  try {
    usage.value = await getMapsApiUsage(props.context)
    failed.value = false
  } catch (error) {
    if (!isSessionExpiry(error)) console.error(new Error('[dashboard-api] load monthly API usage failed', { cause: error }))
    failed.value = true
  } finally {
    loading.value = false
  }
}

function openSubscriptions(event: MouseEvent): void {
  if (!isPlainClick(event)) return
  event.preventDefault()
  emit('openSubscriptions')
}

onMounted(loadUsage)
</script>

<template>
  <section class="d-panel api-plan" data-area="plan" aria-labelledby="api-plan-title">
    <div class="api-plan-head">
      <div class="api-plan-id">
        <h2 id="api-plan-title" class="d-label">{{ props.copy.api.planTitle }}</h2>
        <div v-if="props.subscription?.status === 'unavailable'" class="callout callout--warn">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
          <div class="callout-body">{{ props.copy.subscriptions.unavailable }}</div>
        </div>
        <template v-else-if="activePlan">
          <span class="plan-big" data-api-plan>{{ activePlan.name }}</span>
          <p class="api-plan-status">
            <span>{{ props.copy.subscriptions.expiresLabel }} {{ activePlan.expires }}</span>
            <span>
              <svg class="icon icon--xs" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
              {{ activePlan.autoRenew ? props.copy.subscriptions.autoRenewOn : props.copy.subscriptions.autoRenewOff }}
            </span>
          </p>
        </template>
        <span v-else class="plan-big" data-api-plan>{{ props.copy.subscriptions.free }}</span>
      </div>
      <div class="api-plan-actions">
        <button
          class="icon-btn icon-btn--sm"
          :class="{ 'is-spinning': loading }"
          type="button"
          :aria-label="props.copy.api.refresh"
          :title="props.copy.api.refresh"
          :aria-busy="loading ? 'true' : undefined"
          @click="loadUsage"
        >
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
        </button>
        <a v-if="activePlan" class="btn btn-secondary btn-xs" :href="props.subscriptionsHref" @click="openSubscriptions">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-tag" /></svg>{{ props.copy.api.managePlan }}
        </a>
        <a v-else-if="props.subscription?.status !== 'unavailable'" class="btn btn-secondary btn-xs" :href="props.pricingHref">
          {{ props.copy.account.upgrade }}<svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-arrow-up-right" /></svg>
        </a>
      </div>
    </div>

    <section class="api-usage" aria-labelledby="api-usage-title" :aria-busy="loading && usage ? 'true' : 'false'">
      <h3 id="api-usage-title" class="d-label">{{ props.copy.api.usageTitle }}</h3>
      <div v-if="!usage && failed" class="callout callout--bad" role="alert">
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
        <div class="callout-body">
          <span>{{ props.copy.api.usageFailed }}</span>
          <button
            class="btn btn-secondary btn-xs"
            :class="{ 'is-busy': loading }"
            type="button"
            :aria-busy="loading ? 'true' : undefined"
            @click="loadUsage"
          >
            <span v-if="loading" class="spinner spinner--sm" aria-hidden="true"></span>
            <svg v-else class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
            {{ props.copy.api.retry }}
          </button>
        </div>
      </div>
      <div v-else-if="!usage" class="skel-stack">
        <span class="sr-only" role="status">{{ props.copy.api.loading }}</span>
        <span class="skel" style="width: 46%; height: 28px" aria-hidden="true"></span>
        <span class="skel skel--pill" style="height: 6px" aria-hidden="true"></span>
        <span class="skel" style="width: 82%" aria-hidden="true"></span>
      </div>
      <template v-else>
        <!-- 周期放在大数字旁，下方说明只剩重置时间与 API / MCP 共用额度一句 -->
        <p class="stat">
          <span data-api-usage>{{ usedBefore }}<span class="stat-big">{{ formatNumber(usage.used) }}</span>{{ fill(usedAfter, { total: formatNumber(usage.total) }) }}</span>
          <span class="stat-period">{{ fill(props.copy.api.usagePeriod, { period: usage.period }) }}</span>
        </p>
        <div class="meter" :data-level="meter?.level || undefined" aria-hidden="true"><i :style="{ '--v': meter?.width }"></i></div>
        <p class="d-hint">{{ props.copy.api.quotaReset }}</p>
        <div v-if="usage.exhausted" class="callout callout--warn">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
          <div class="callout-body">{{ props.copy.api.quotaExhausted }}</div>
        </div>
        <p v-if="failed" class="inline-err" role="alert">{{ props.copy.api.usageFailed }}</p>
      </template>
    </section>
  </section>
</template>
