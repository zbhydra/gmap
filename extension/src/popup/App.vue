<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <AppHeader />

    <!-- 批量任务入口（013 A6：dashboard 独立扩展页） -->
    <main class="app-main">
      <button type="button" class="dashboard-button" @click="openDashboard">
        {{ dashboardLabel }}
      </button>
    </main>

    <!-- 账号用量区（013 A11，U7）：匿名按设备归属也展示 -->
    <section v-if="usage !== null" class="usage-section">
      <div class="usage-row">
        <span class="usage-identity">{{ identityLabel }}</span>
        <span class="usage-counter">{{ usageCounter }}</span>
      </div>
      <div
        class="usage-bar"
        role="progressbar"
        :aria-valuenow="usage?.used"
        :aria-valuemax="usage?.total"
      >
        <div class="usage-bar-fill" :style="{ width: usagePercent }"></div>
      </div>
      <p class="usage-resets">{{ resetsLabel }}</p>
    </section>

    <!-- 底部联系入口 -->
    <AppFooter />

    <Toast :show="toastState.show" :message="toastState.message" :type="toastState.type" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/core/stores/authStore'
import { markApi, MARK_TYPE, type MarkType } from '@/core/api/mark'
import { logger } from '@/core/utils/logger'
import { I18N_KEYS } from '@/core/constants/i18n'
import { I18nService } from '@/locales'
import { BackgroundChannel } from './rpc/background.rpc'
import type { MapsUsageSnapshot } from '@/sites/maps/usage/types'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import Toast from '@/core/components/Toast.vue'
import { useToast } from '@/core/composables/useToast'

// Stores
const authStore = useAuthStore()
const { toastState, showError } = useToast()

// 按钮文案走 I18nService（不依赖 app.use(i18n)：Popup 全局 Toast 回归测试
// 在无 i18n 插件的裸挂载环境下渲染本组件）
const dashboardLabel = computed(() => I18nService.t(I18N_KEYS.APP.OPEN_DASHBOARD))

// 账号用量区（013 A11，U7）：经 background RPC 现拉；拉取失败整块隐藏（局部可失败）
const usage = ref<MapsUsageSnapshot | null>(null)

const identityLabel = computed(() =>
  authStore.isAuthenticated ? authStore.displayName : I18nService.t(I18N_KEYS.POPUP_USAGE.GUEST)
)

const usageCounter = computed(() =>
  usage.value === null
    ? ''
    : I18nService.t(I18N_KEYS.POPUP_USAGE.COUNTER, {
        used: usage.value.used,
        total: usage.value.total
      })
)

const usagePercent = computed(() => {
  if (usage.value === null || usage.value.total <= 0) {
    return '0%'
  }
  const percent = Math.min(100, Math.round((usage.value.used / usage.value.total) * 100))
  return `${percent}%`
})

const resetsLabel = computed(() =>
  usage.value === null
    ? ''
    : I18nService.t(I18N_KEYS.POPUP_USAGE.RESETS, { period: usage.value.period })
)

/** 现拉当月用量（匿名 device_id 归属同样返回；失败保持隐藏）。 */
async function refreshUsage(): Promise<void> {
  const channel = new BackgroundChannel()
  try {
    usage.value = await channel.getMapsUsage()
  } catch (error) {
    logger.error('[Popup] 用量查询失败:', error)
  } finally {
    channel.destroy()
  }
}

// 记录打点（异步，不阻塞业务）
function recordMark(markType: MarkType): void {
  markApi.record(markType).catch(error => {
    logger.error('[Popup] SLS 打点失败:', error)
  })
}

/** 打开批量任务 dashboard 独立页（新标签）。 */
function openDashboard(): void {
  try {
    window.open(chrome.runtime.getURL('src/dashboard.html'), '_blank')
  } catch (error) {
    logger.error('[Popup] 打开 dashboard 失败:', error)
    showError(I18nService.t(I18N_KEYS.APP_ERROR.TITLE))
  }
}

// 生命周期
onMounted(async () => {
  // 第一时间记录弹窗打开打点（不等待，不阻塞）
  recordMark(MARK_TYPE.POPUP_OPEN)

  await authStore.initialize()
  await refreshUsage()
})
</script>

<style scoped>
/* 色值一律消费 --gme-* 语义 token（src/styles/tokens.css），亮暗随系统。 */
.app-container {
  width: 100%;
  min-height: var(--popup-min-height);
  display: flex;
  flex-direction: column;
  background: var(--gme-surface);
  color: var(--gme-text);
  font-family: var(--gme-font-body);
}

.app-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

/* 主操作：primary 实底 pill（design.md 按钮规则，高 40 + -fg 字色） */
.dashboard-button {
  width: 100%;
  height: 40px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--gme-primary-fg);
  background: var(--gme-primary);
  border: none;
  border-radius: var(--gme-rounded-full);
  cursor: pointer;
}

.dashboard-button:hover {
  background: var(--gme-primary-hover);
}

.dashboard-button:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 2px;
}

/* 账号用量区（U7） */
.usage-section {
  padding: 8px 16px 12px;
  border-top: 1px solid var(--gme-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.usage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.usage-identity {
  font-size: 12px;
  font-weight: 600;
  color: var(--gme-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.usage-counter {
  font-size: 12px;
  color: var(--gme-text-2);
  flex-shrink: 0;
}

.usage-bar {
  height: 4px;
  border-radius: var(--gme-rounded-full);
  background: var(--gme-surface-2);
  overflow: hidden;
}

.usage-bar-fill {
  height: 100%;
  border-radius: var(--gme-rounded-full);
  background: var(--gme-primary);
}

.usage-resets {
  margin: 0;
  font-size: 11px;
  color: var(--gme-text-2);
}
</style>
