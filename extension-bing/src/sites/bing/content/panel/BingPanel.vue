<!--
  Bing Maps 采集面板（三态：待命 / 采集中 / 完成）。

  逐元素规格 = feat.md「界面与操作逻辑·面板(三态)」+ v3 登录（006 §4.4）
  「面板显示账号与订阅态」：
  - 待命：标题区（含账号/订阅态徽标；未登录同位显示 Sign in，已登录显示
    FREE/PRO 徽标，点击进 Pricing 视图）、Start Extraction 主按钮（未检测到
    列表禁用）、提示行（"Please search business first" + For Example 示例
    链接）、How to use 链接；
  - 采集中：加载指示、进度文案（免费 "Exporting N..." / Pro "Have found N
    businesses and still going..."，按门控态切换）、区域提示、Stop（ghost）；
  - 完成：完成/手动停止文案、免费达限警告条 + Upgrade to Pro Now（跳 Pricing
    视图）、Export Leads List 下拉（csv / xlsx）、Go Back。

  Pricing 视图（feat.md「Pricing 信息页」）：Free vs Pro 对比表（一次性导出
  ≤20 vs 无限；CSV/XLSX、官网 URL、电话为免费项；Email+社媒为 Pro 项，一期
  占位说明）+ Upgrade 按钮新标签打开官网订阅页（官网 base URL 集中声明于
  core/api/config.ts 的 WEBSITE，生产域名未定）+ VIP 祝贺态 + 账号行。

  视觉 = design.md / design.dark.md Material You token 合同（scoped CSS 内定义
  同名 CSS 变量并随系统亮暗切换；直插宿主页无法复用全局注入，token 就地声明）。
  停靠 = panel 契约组（top 80px / right 40px，宽 300–500px，高内容自适应，
  ResizeObserver 钳制超视口高度转内部滚动）。
-->

<template>
  <section ref="rootRef" class="bing-panel-root" :style="panelStyle">
    <!-- Pricing 视图（面板内切换；feat.md「Pricing 信息页」规格） -->
    <template v-if="showPricing">
      <header class="title-row">
        <h2 class="pricing-title">{{ t(K.PRICING_TITLE) }}</h2>
      </header>

      <div v-if="isPro" class="vip-note" role="status">
        <span class="vip-icon" aria-hidden="true"></span>
        <span class="vip-text">{{ t(K.PRICING_VIP_NOTE) }}</span>
      </div>

      <div class="account-row">
        <span class="account-label">{{ t(K.PRICING_ACCOUNT) }}</span>
        <span class="account-value" :title="displayName || undefined">
          {{
            authenticated
              ? t(K.PRICING_SIGNED_IN_AS, { name: displayName })
              : t(K.PRICING_FREE_ACCOUNT)
          }}
        </span>
      </div>

      <table class="pricing-table">
        <thead>
          <tr>
            <th scope="col" class="feature-col"></th>
            <th scope="col">{{ t(K.PRICING_COLUMN_FREE) }}</th>
            <th scope="col">{{ t(K.PRICING_COLUMN_PRO) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ t(K.PRICING_ROW_EXPORT_LIMIT) }}</td>
            <td>{{ t(K.PRICING_EXPORT_LIMIT_FREE) }}</td>
            <td>{{ t(K.PRICING_EXPORT_LIMIT_PRO) }}</td>
          </tr>
          <tr>
            <td>{{ t(K.PRICING_FEATURE_CSV) }}</td>
            <td class="cell-included">{{ t(K.PRICING_INCLUDED) }}</td>
            <td class="cell-included">{{ t(K.PRICING_INCLUDED) }}</td>
          </tr>
          <tr>
            <td>{{ t(K.PRICING_FEATURE_WEBSITE) }}</td>
            <td class="cell-included">{{ t(K.PRICING_INCLUDED) }}</td>
            <td class="cell-included">{{ t(K.PRICING_INCLUDED) }}</td>
          </tr>
          <tr>
            <td>{{ t(K.PRICING_FEATURE_PHONE) }}</td>
            <td class="cell-included">{{ t(K.PRICING_INCLUDED) }}</td>
            <td class="cell-included">{{ t(K.PRICING_INCLUDED) }}</td>
          </tr>
          <tr>
            <td>{{ t(K.PRICING_FEATURE_EMAIL) }}</td>
            <td class="cell-pro-only">{{ t(K.PRICING_PRO_ONLY) }}</td>
            <td class="cell-included">{{ t(K.PRICING_INCLUDED) }}</td>
          </tr>
        </tbody>
      </table>
      <p class="pricing-footnote">{{ t(K.PRICING_EMAIL_COMING_SOON) }}</p>

      <button v-if="!isPro" class="button button-primary" type="button" @click="onOpenPricingPage">
        {{ t(K.PRICING_UPGRADE) }}
      </button>
      <button class="button button-ghost" type="button" @click="showPricing = false">
        {{ t(K.GO_BACK) }}
      </button>
    </template>

    <!-- 待命 -->
    <template v-else-if="phase === 'idle'">
      <header class="title-row">
        <h1 class="panel-title">{{ t(K.TITLE) }}</h1>
        <button
          v-if="authenticated"
          class="plan-badge"
          :class="{ pro: isPro }"
          type="button"
          @click="showPricing = true"
        >
          {{ isPro ? t(K.PRO_BADGE) : t(K.FREE_BADGE) }}
        </button>
        <!-- 未登录：徽标同位显示 Sign in（v3 插件发起登录，006 §4.4） -->
        <button v-else class="plan-badge" type="button" :disabled="signingIn" @click="onSignIn">
          {{ t(I18N_KEYS.AUTH.LOGIN) }}
        </button>
      </header>
      <button
        class="button button-primary"
        type="button"
        :disabled="!listDetected"
        @click="onStart"
      >
        {{ t(K.START) }}
      </button>
      <p v-if="!listDetected" class="hint-row">
        <span>{{ t(K.HINT_NO_LIST) }}</span>
        <a class="text-link" :href="exampleSearchUrl" target="_blank" rel="noopener noreferrer">
          {{ t(K.FOR_EXAMPLE) }}
        </a>
      </p>
      <p class="howto-row">
        <a class="text-link" :href="howToUseUrl" target="_blank" rel="noopener noreferrer">
          {{ t(K.HOW_TO_USE) }}
        </a>
      </p>
    </template>

    <!-- 采集中 -->
    <template v-else-if="phase === 'collecting'">
      <div class="collecting-row">
        <span class="spinner" aria-hidden="true"></span>
        <span class="progress-text">{{ progressText }}</span>
      </div>
      <p class="area-hint">{{ areaHint }}</p>
      <button class="button button-ghost" type="button" @click="onStop">{{ t(K.STOP) }}</button>
    </template>

    <!-- 完成 -->
    <template v-else>
      <p class="done-text">
        {{ stoppedManually ? t(K.MANUALLY_STOPPED) : t(K.SEARCH_COMPLETE) }}
      </p>
      <p class="done-count">{{ doneCountText }}</p>
      <div v-if="freeLimitReached" class="limit-alert" role="alert">
        <span class="alert-icon" aria-hidden="true"></span>
        <span class="alert-text">{{ t(K.FREE_LIMIT_NOTE) }}</span>
        <button class="alert-action text-link" type="button" @click="showPricing = true">
          {{ t(K.UPGRADE_TO_PRO) }}
        </button>
      </div>
      <div class="export-row">
        <button
          class="button button-outline"
          type="button"
          :disabled="foundCount === 0"
          :aria-expanded="menuOpen"
          @click="toggleMenu"
        >
          {{ t(K.EXPORT_LEADS_LIST) }}
          <span class="chevron" :class="{ open: menuOpen }" aria-hidden="true"></span>
        </button>
        <div v-if="menuOpen" class="dropdown" role="menu">
          <button class="dropdown-item" type="button" role="menuitem" @click="onExport('csv')">
            {{ t(K.DOWNLOAD_CSV) }}
          </button>
          <button class="dropdown-item" type="button" role="menuitem" @click="onExport('xlsx')">
            {{ t(K.DOWNLOAD_XLSX) }}
          </button>
        </div>
      </div>
      <button class="button button-ghost" type="button" @click="onGoBack">
        {{ t(K.GO_BACK) }}
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { logger } from '@/core/utils/logger'
import { buildPricingUrl, openExternalPage } from '@/core/utils/navigation'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { getBingConfig } from '@/sites/bing/config/loader'
import type { BingCollector } from '../collector'
import { getGateState, refreshGateState, subscribeGateState, type BingGateState } from '../gate'
import { exportRows, type BingExportFormat } from '../export/engine'

const K = I18N_KEYS.BING_PANEL

const props = defineProps<{
  /** 采集状态机实例（bootstrap 装配传入）。 */
  collector: BingCollector
}>()

const { t } = useI18n()

// —— 状态绑定（订阅 collector 快照） ——
const state = ref(props.collector.getState())
const unsubscribe = props.collector.subscribe(next => {
  state.value = next
})
const phase = computed(() => state.value.phase)
const listDetected = computed(() => state.value.listDetected)
const foundCount = computed(() => state.value.foundCount)
const freeLimitReached = computed(() => state.value.freeLimitReached)
const stoppedManually = computed(() => state.value.stoppedManually)

// —— 门控态绑定（账号/订阅快照，background 判定 + 采集轮增量刷新） ——
const gate = ref<BingGateState>(getGateState())
const unsubscribeGate = subscribeGateState(next => {
  gate.value = next
})
const authenticated = computed(() => gate.value.authenticated)
const isPro = computed(() => gate.value.isPro)
const displayName = computed(() => gate.value.displayName ?? '')

// —— 采集中文案 ——
// 进度文案：免费 "Exporting N..."；Pro "Have found N businesses and still
// going..."（feat.md 采集中态规格），按门控快照即时切换。
const progressText = computed(() =>
  isPro.value
    ? t(K.FOUND_STILL_GOING, { count: foundCount.value })
    : t(K.EXPORTING, { count: foundCount.value })
)
// 区域提示：首轮零增长即认为列表收敛（连续 ≥2 轮防抖），引导移动地图；阈值
// 为实现假设（竞品仅文案实证，切换条件未逆向到）。
const MOVE_MAP_HINT_STREAK = 2
const areaHint = computed(() =>
  state.value.failureStreak >= MOVE_MAP_HINT_STREAK ? t(K.HINT_MOVE_MAP) : t(K.HINT_WAIT_MOMENT)
)
// 完成态计数（主流程「完成:显示计数」）
const doneCountText = computed(() => t(K.DONE_COUNT, { count: foundCount.value }))

// —— Pricing 视图与导出下拉 ——
const showPricing = ref(false)
const menuOpen = ref(false)

// —— 登录入口（未登录徽标位 Sign in，006 §4.4） ——
const signingIn = ref(false)

/**
 * 发起 v3 browser identity 登录（popup 同款 RPC，同一失败口径）：
 * {opened:false} 或 RPC 默认 30 秒超时都静默复位按钮态；登录最终结果
 * 以 storage 三键变化为准，此处主动收敛一次门控快照让徽标随结果切换。
 */
async function onSignIn(): Promise<void> {
  if (signingIn.value) {
    return
  }
  signingIn.value = true
  const channel = new BackgroundChannel()
  try {
    await channel.openExtensionLogin()
  } catch (error) {
    logger.warn('[BingPanel] 登录未在 RPC 时限内确认完成:', error)
  } finally {
    channel.destroy()
    signingIn.value = false
    void refreshGateState()
  }
}

// 打开 Pricing 时重取门控态（登录/订阅在面板打开后变化的兜底刷新）
watch(showPricing, opened => {
  if (opened) {
    void refreshGateState()
  }
})

// —— 停靠与自适应 ——
const panel = getBingConfig().panel
const DEFAULT_WIDTH_PX = 360
const rootRef = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const panelStyle = computed(() => ({
  top: `${panel.dockTopPx}px`,
  right: `${panel.dockRightPx}px`,
  width: `clamp(${panel.minWidthPx}px, ${DEFAULT_WIDTH_PX}px, ${panel.maxWidthPx}px)`
}))

onMounted(() => {
  // 高度内容自适应的视口钳制：内容高超过视口可用高度时转面板内滚动
  resizeObserver = new ResizeObserver(() => {
    const el = rootRef.value
    if (!el) {
      return
    }
    const maxHeight = window.innerHeight - panel.dockTopPx - 16
    if (el.scrollHeight > maxHeight) {
      el.style.maxHeight = `${maxHeight}px`
      el.style.overflowY = 'auto'
    } else {
      el.style.maxHeight = ''
      el.style.overflowY = ''
    }
  })
  if (rootRef.value) {
    resizeObserver.observe(rootRef.value)
  }

  // 导出下拉的点击外部收起
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  unsubscribe()
  unsubscribeGate()
  resizeObserver?.disconnect()
  document.removeEventListener('click', onDocumentClick)
})

// —— 链接 ——
// 示例搜索词 = panel 契约组（竞品同款演示词，调研 §3）。
const exampleSearchUrl = panel.exampleSearchUrl
// How to use：官网 FAQ 未就绪，暂跳现有联系页（feat.md 待命态规格）。
const howToUseUrl = new URL('/contact', __WEBSITE_BASE_URL__).toString()

// —— 动作 ——
function onStart(): void {
  props.collector.start().catch(error => {
    logger.error('[BingPanel] 启动采集失败:', error)
  })
}

function onStop(): void {
  props.collector.stop()
}

function onGoBack(): void {
  menuOpen.value = false
  props.collector.reset()
}

function toggleMenu(): void {
  menuOpen.value = !menuOpen.value
}

function onDocumentClick(event: MouseEvent): void {
  if (!menuOpen.value) {
    return
  }
  const el = rootRef.value
  if (el && event.target instanceof Node && el.contains(event.target)) {
    return
  }
  menuOpen.value = false
}

function onExport(format: BingExportFormat): void {
  menuOpen.value = false
  // 免费档导出末行提示与采集停止条件同源（有行数上限 = 免费档，Pro 无末行）
  exportRows(props.collector.getRows(), format, {
    includeFreeNote: props.collector.hasRowLimit()
  })
}

/** 订阅引导：新标签打开官网订阅页（官网 base URL 集中声明，生产域名未定）。 */
function onOpenPricingPage(): void {
  void openExternalPage(buildPricingUrl('bing_panel'), 'pricing:bing_panel')
}
</script>

<style scoped>
/* —— Material You 语义 token（design.md 亮色 / design.dark.md 暗色；Shadow DOM 内自含，
     gme- 前缀防宿主页面 CSS 变量渗透，与 src/styles/tokens.css 同一套取值） —— */
.bing-panel-root {
  --gme-surface: #ffffff;
  --gme-surface-2: #f0f4f9;
  --gme-border: #dde3ea;
  --gme-border-strong: #b9c2cd;
  --gme-text: #1f1f1f;
  --gme-text-2: #5f6368;
  --gme-primary: #1a73e8;
  --gme-primary-hover: #1765cc;
  --gme-primary-fg: #ffffff;
  --gme-primary-soft: #e8f0fe;
  --gme-warn: #b26a00;
  --gme-warn-fg: #ffffff;
  --gme-warn-soft: #fef7e0;
  --gme-link: #1a73e8;
  --gme-ring: #1a73e8;
  --gme-shadow-pop: 0 4px 10px rgba(60, 64, 67, 0.14), 0 14px 36px rgba(60, 64, 67, 0.14);
  --gme-rounded-md: 16px;
  --gme-rounded-full: 999px;

  position: fixed;
  z-index: 2147483647;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--gme-surface);
  border: 1px solid var(--gme-border);
  border-radius: var(--gme-rounded-md);
  box-shadow: var(--gme-shadow-pop);
  color: var(--gme-text);
  font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
}

@media (prefers-color-scheme: dark) {
  .bing-panel-root {
    --gme-surface: #1d2026;
    --gme-surface-2: #262a31;
    --gme-border: #31353d;
    --gme-border-strong: #4c515b;
    --gme-text: #e8eaed;
    --gme-text-2: #9aa0a6;
    --gme-primary: #8ab4f8;
    --gme-primary-hover: #aecbfa;
    --gme-primary-fg: #0d2b45;
    --gme-primary-soft: rgba(138, 180, 248, 0.15);
    --gme-warn: #fdd663;
    --gme-warn-fg: #2d2000;
    --gme-warn-soft: rgba(253, 214, 99, 0.13);
    --gme-link: #8ab4f8;
    --gme-ring: #8ab4f8;
    --gme-shadow-pop: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
}

.bing-panel-root h1,
.bing-panel-root h2,
.bing-panel-root p {
  margin: 0;
}

/* —— 标题区 —— */
.title-row {
  display: flex;
  align-items: center;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.015em;
}

/* —— 按钮（design.md：pill 圆角、五语义、禁用 0.42） —— */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: var(--gme-rounded-full);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1),
    color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1),
    border-color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.button:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 2px;
}

.button-primary {
  background: var(--gme-primary);
  color: var(--gme-primary-fg);
}

.button-primary:hover:not(:disabled) {
  background: var(--gme-primary-hover);
}

.button-outline {
  background: var(--gme-surface);
  border: 1px solid var(--gme-border-strong);
  color: var(--gme-text);
}

.button-outline:hover:not(:disabled) {
  background: var(--gme-surface-2);
}

.button-ghost {
  background: transparent;
  color: var(--gme-text);
}

.button-ghost:hover {
  background: var(--gme-surface-2);
}

/* —— 链接 —— */
.text-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--gme-link);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.text-link:hover {
  color: var(--gme-primary-hover);
}

.text-link:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 2px;
}

/* —— 待命提示行 —— */
.hint-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--gme-text-2);
}

.howto-row {
  color: var(--gme-text-2);
}

/* —— 采集中 —— */
.collecting-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-weight: 500;
}

/* spinner：22px / 2.5px 边 / primary 22% 轨道（design.md 进度规格） */
.spinner {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 2.5px solid color-mix(in srgb, var(--gme-primary) 22%, transparent);
  border-top-color: var(--gme-primary);
  border-radius: 50%;
  animation: bing-panel-spin 1s linear infinite;
}

@keyframes bing-panel-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}

.area-hint {
  color: var(--gme-text-2);
}

/* —— 完成 —— */
.done-text {
  font-weight: 500;
}

.done-count {
  color: var(--gme-text-2);
  font-variant-numeric: tabular-nums;
}

/* 警告条：-soft 底 + 状态色 35% 边 + 左侧 20px 实心圆图标（design.md alert） */
.limit-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: var(--gme-warn-soft);
  border: 1px solid color-mix(in srgb, var(--gme-warn) 35%, transparent);
  border-radius: var(--gme-rounded-md);
}

.alert-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gme-warn);
}

.alert-text {
  flex: 1;
  color: var(--gme-text);
}

.alert-action {
  flex-shrink: 0;
  align-self: center;
  font-weight: 500;
}

/* —— Export Leads List 下拉 —— */
.export-row {
  position: relative;
  display: flex;
}

.export-row .button {
  width: 100%;
}

.chevron {
  width: 8px;
  height: 8px;
  border-right: 2px solid currentcolor;
  border-bottom: 2px solid currentcolor;
  transform: rotate(45deg) translate(-1px, -1px);
  transition: transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.chevron.open {
  transform: rotate(225deg) translate(-1px, -1px);
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: var(--gme-surface);
  border: 1px solid var(--gme-border);
  border-radius: var(--gme-rounded-md);
  box-shadow: var(--gme-shadow-pop);
}

.dropdown-item {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 14px;
  border: none;
  border-radius: var(--gme-rounded-full);
  background: transparent;
  color: var(--gme-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.dropdown-item:hover {
  background: var(--gme-surface-2);
}

.dropdown-item:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: -2px;
}

/* —— Pricing 视图 —— */
.pricing-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

/* 祝贺条：primary-soft 底 + primary 左圆点（design.md 强调态） */
.vip-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: var(--gme-primary-soft);
  border-radius: var(--gme-rounded-md);
}

.vip-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gme-primary);
}

.vip-text {
  flex: 1;
  color: var(--gme-text);
}

.account-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.account-label {
  flex-shrink: 0;
  color: var(--gme-text-2);
}

.account-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* 对比表：特性列左对齐、值列居中；表头次要色、行间细分隔线 */
.pricing-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.pricing-table th,
.pricing-table td {
  padding: 8px 6px;
  border-bottom: 1px solid var(--gme-border);
  text-align: center;
  vertical-align: top;
}

.pricing-table th {
  color: var(--gme-text-2);
  font-weight: 500;
}

.pricing-table tbody td:first-child {
  text-align: left;
  color: var(--gme-text);
}

.pricing-table .feature-col {
  width: 46%;
}

.pricing-table tbody tr:last-child td {
  border-bottom: none;
}

.cell-included {
  color: var(--gme-primary);
  font-weight: 500;
}

.cell-pro-only {
  color: var(--gme-text-2);
}

.pricing-footnote {
  color: var(--gme-text-2);
  font-size: 12px;
}

/* 标题区账号/订阅态徽标（点击进 Pricing 视图） */
.plan-badge {
  margin-left: auto;
  padding: 4px 8px;
  border: 1px solid var(--gme-border-strong);
  border-radius: var(--gme-rounded-full);
  background: var(--gme-surface-2);
  color: var(--gme-text-2);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.plan-badge.pro {
  background: var(--gme-primary);
  border-color: var(--gme-primary);
  color: var(--gme-primary-fg);
}

.plan-badge:disabled {
  opacity: 0.42;
  cursor: default;
}

.plan-badge:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 2px;
}
</style>
