<template>
  <div class="options-page">
    <header class="options-header">
      <div class="options-header-inner">
        <h1 class="options-title">{{ t(I18N_KEYS.OPTIONS.TITLE) }}</h1>
        <span class="options-brand">{{ t(I18N_KEYS.MAPS_PANEL.TITLE) }}</span>
      </div>
    </header>

    <main class="options-main">
      <!-- 采集 -->
      <section class="options-card">
        <h2 class="options-section-title">{{ t(I18N_KEYS.OPTIONS.SECTION_EXTRACTION) }}</h2>

        <div class="options-field">
          <span class="options-label">{{ t(I18N_KEYS.OPTIONS.REQUEST_INTERVAL) }}</span>
          <p class="options-hint">{{ t(I18N_KEYS.OPTIONS.REQUEST_INTERVAL_HINT) }}</p>
          <div
            class="options-segmented"
            role="radiogroup"
            :aria-label="t(I18N_KEYS.OPTIONS.REQUEST_INTERVAL)"
          >
            <button
              v-for="seconds in intervalOptions"
              :key="seconds"
              type="button"
              class="options-segment"
              role="radio"
              :aria-checked="settings.requestIntervalSec === seconds"
              :class="{ 'options-segment-active': settings.requestIntervalSec === seconds }"
              @click="patch({ requestIntervalSec: seconds })"
            >
              {{ t(I18N_KEYS.OPTIONS.INTERVAL_SECONDS, { seconds }) }}
            </button>
          </div>
        </div>

        <div class="options-toggle-row">
          <div class="options-toggle-text">
            <span class="options-label options-label-with-badge">
              {{ t(I18N_KEYS.OPTIONS.EXTRACT_EMAIL) }}
              <span class="options-pro-badge">{{ t(I18N_KEYS.OPTIONS.PRO_BADGE) }}</span>
            </span>
            <p class="options-hint">{{ t(I18N_KEYS.OPTIONS.EXTRACT_EMAIL_HINT) }}</p>
          </div>
          <label class="options-switch">
            <input
              type="checkbox"
              :checked="settings.extractEmail"
              @change="patch({ extractEmail: ($event.target as HTMLInputElement).checked })"
            />
            <span class="options-switch-track" aria-hidden="true"></span>
          </label>
        </div>

        <div class="options-toggle-row">
          <div class="options-toggle-text">
            <span class="options-label options-label-with-badge">
              {{ t(I18N_KEYS.OPTIONS.EXTRACT_SOCIAL_MEDIAS) }}
              <span class="options-pro-badge">{{ t(I18N_KEYS.OPTIONS.PRO_BADGE) }}</span>
            </span>
            <p class="options-hint">{{ t(I18N_KEYS.OPTIONS.EXTRACT_SOCIAL_MEDIAS_HINT) }}</p>
          </div>
          <label class="options-switch">
            <input
              type="checkbox"
              :checked="settings.extractSocialMedias"
              @change="patch({ extractSocialMedias: ($event.target as HTMLInputElement).checked })"
            />
            <span class="options-switch-track" aria-hidden="true"></span>
          </label>
        </div>
      </section>

      <!-- 导出 -->
      <section class="options-card">
        <h2 class="options-section-title">{{ t(I18N_KEYS.OPTIONS.SECTION_EXPORT) }}</h2>

        <div class="options-field">
          <span class="options-label">{{ t(I18N_KEYS.OPTIONS.EXPORT_FORMAT) }}</span>
          <div
            class="options-segmented"
            role="radiogroup"
            :aria-label="t(I18N_KEYS.OPTIONS.EXPORT_FORMAT)"
          >
            <button
              v-for="option in formatOptions"
              :key="option.value"
              type="button"
              class="options-segment"
              role="radio"
              :aria-checked="settings.exportFormat === option.value"
              :class="{ 'options-segment-active': settings.exportFormat === option.value }"
              @click="patch({ exportFormat: option.value })"
            >
              {{ t(option.labelKey) }}
            </button>
          </div>
        </div>

        <div class="options-field">
          <span class="options-label">{{ t(I18N_KEYS.OPTIONS.EXPORT_FIELDS) }}</span>
          <p class="options-hint">{{ t(I18N_KEYS.OPTIONS.EXPORT_FIELDS_HINT) }}</p>
          <div class="options-field-groups">
            <fieldset v-for="group in columnGroups" :key="group.key" class="options-field-group">
              <legend class="options-field-group-legend">{{ t(group.labelKey) }}</legend>
              <label v-for="column in group.columns" :key="column.header" class="options-checkbox">
                <input
                  type="checkbox"
                  :checked="settings.exportFieldHeaders.includes(column.header)"
                  @change="toggleColumn(column.header, ($event.target as HTMLInputElement).checked)"
                />
                <span class="options-checkbox-label">{{ column.header }}</span>
                <span v-if="column.pro" class="options-pro-badge">
                  {{ t(I18N_KEYS.OPTIONS.PRO_BADGE) }}
                </span>
              </label>
            </fieldset>
          </div>
        </div>
      </section>

      <!-- 自动化 -->
      <section class="options-card">
        <h2 class="options-section-title">{{ t(I18N_KEYS.OPTIONS.SECTION_AUTOMATION) }}</h2>

        <div class="options-toggle-row">
          <div class="options-toggle-text">
            <span class="options-label">{{ t(I18N_KEYS.OPTIONS.AUTO_DOWNLOAD) }}</span>
          </div>
          <label class="options-switch">
            <input
              type="checkbox"
              :checked="settings.autoDownload"
              @change="patch({ autoDownload: ($event.target as HTMLInputElement).checked })"
            />
            <span class="options-switch-track" aria-hidden="true"></span>
          </label>
        </div>

        <div class="options-toggle-row">
          <div class="options-toggle-text">
            <span class="options-label">{{ t(I18N_KEYS.OPTIONS.DRIVE_AUTO_SAVE) }}</span>
            <p class="options-hint">{{ t(I18N_KEYS.OPTIONS.INTEGRATION_HINT_DRIVE) }}</p>
            <p class="options-hint options-integration-status">
              {{
                driveConnected
                  ? t(I18N_KEYS.OPTIONS.INTEGRATION_STATUS_CONNECTED)
                  : t(I18N_KEYS.OPTIONS.INTEGRATION_STATUS_NOT_CONNECTED)
              }}
            </p>
            <p v-if="driveAuthError" class="options-error">
              {{ t(I18N_KEYS.OPTIONS.INTEGRATION_AUTH_FAILED) }}
            </p>
          </div>
          <div class="options-toggle-controls">
            <button
              v-if="driveConnected"
              type="button"
              class="options-link-button"
              @click="disconnectDrive"
            >
              {{ t(I18N_KEYS.OPTIONS.INTEGRATION_DISCONNECT) }}
            </button>
            <label class="options-switch">
              <input
                type="checkbox"
                :checked="settings.autoSaveToGoogleDrive"
                @change="onDriveToggle($event)"
              />
              <span class="options-switch-track" aria-hidden="true"></span>
            </label>
          </div>
        </div>

        <div class="options-toggle-row">
          <div class="options-toggle-text">
            <span class="options-label">{{ t(I18N_KEYS.OPTIONS.HUBSPOT_AUTO_SAVE) }}</span>
            <p class="options-hint">{{ t(I18N_KEYS.OPTIONS.INTEGRATION_HINT_HUBSPOT) }}</p>
            <p class="options-hint options-integration-status">
              {{
                hubspotConnected
                  ? t(I18N_KEYS.OPTIONS.INTEGRATION_STATUS_CONNECTED)
                  : t(I18N_KEYS.OPTIONS.INTEGRATION_STATUS_NOT_CONNECTED)
              }}
            </p>
            <p v-if="hubspotAuthError" class="options-error">
              {{ t(I18N_KEYS.OPTIONS.INTEGRATION_AUTH_FAILED) }}
            </p>
          </div>
          <div class="options-toggle-controls">
            <button
              v-if="hubspotConnected"
              type="button"
              class="options-link-button"
              @click="disconnectHubspot"
            >
              {{ t(I18N_KEYS.OPTIONS.INTEGRATION_DISCONNECT) }}
            </button>
            <label class="options-switch">
              <input
                type="checkbox"
                :checked="settings.autoSaveToHubspot"
                @change="onHubspotToggle($event)"
              />
              <span class="options-switch-track" aria-hidden="true"></span>
            </label>
          </div>
        </div>

        <div class="options-field">
          <span class="options-label">{{ t(I18N_KEYS.OPTIONS.STUCK_MAX_RETRY) }}</span>
          <p class="options-hint">{{ t(I18N_KEYS.OPTIONS.STUCK_MAX_RETRY_HINT) }}</p>
          <input
            class="options-number-input"
            type="number"
            min="0"
            :max="MAX_STUCK_RETRY"
            :value="settings.stuckMaxRetry"
            @change="onStuckMaxRetryChange($event)"
          />
        </div>
      </section>
    </main>

    <!-- 隐私政策入口（013 A13，U11）：独立扩展页，商店上架与审核可见性要求 -->
    <footer class="options-footer">
      <a class="options-privacy-link" :href="privacyUrl" target="_blank" rel="noreferrer">
        {{ t(I18N_KEYS.OPTIONS.PRIVACY_POLICY) }}
      </a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { logger } from '@/core/utils/logger'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import {
  DEFAULT_MAPS_USER_SETTINGS,
  MapsUserSettingsManager,
  type MapsUserSettings
} from '@/sites/maps/settings/userSettings'
import {
  MapsIntegrationAuthManager,
  authorizeDrive,
  authorizeHubspot,
  revokeDriveAuth
} from '@/sites/maps/settings/integrations'
import {
  SEARCH_EXPORT_COLUMN_GROUPS,
  SEARCH_EXPORT_COLUMNS,
  type SearchExportColumn
} from '@/sites/maps/content/export/columns'
import type { SearchExportFormat } from '@/sites/maps/content/export/engine'

const { t } = useI18n()

/** 隐私政策扩展页地址（产物根 privacy.html，013 A13，U11）。 */
const privacyUrl = chrome.runtime.getURL('privacy.html')

/** 批量卡死重试次数上限（防误输入；默认 1，竞品语义）。 */
const MAX_STUCK_RETRY = 9

/** 设置响应态：挂载时读 storage，变更即时写回（即时保存，竞品同语义）。 */
const settings = ref<MapsUserSettings>(MapsUserSettingsManager.getDefaultSettings())

/** 双集成的授权状态（挂载时读 storage，授权/断开后即时更新）。 */
const driveConnected = ref(false)
const hubspotConnected = ref(false)

/** 授权失败提示（一次性；用户重试或改设置后仍在，直到成功或刷新）。 */
const driveAuthError = ref(false)
const hubspotAuthError = ref(false)

/** 授权进行中标志（防重复弹窗：授权中忽略再次切换）。 */
let authorizing: 'drive' | 'hubspot' | null = null

onMounted(async () => {
  settings.value = await MapsUserSettingsManager.getSettings()
  const auth = await MapsIntegrationAuthManager.getAuth()
  driveConnected.value = auth.drive !== null
  hubspotConnected.value = auth.hubspot !== null
})

/**
 * Drive 开关切换（013 A10 授权联动）：
 * - 开且未授权 → 先走授权，成功才落开关；失败提示错误并回弹开关；
 * - 已授权 → 直接写开关（关开关不断开授权，授权由 Disconnect 管理）。
 */
async function onDriveToggle(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const checked = input.checked
  driveAuthError.value = false
  if (checked && !driveConnected.value) {
    if (authorizing !== null) {
      input.checked = false
      return
    }
    authorizing = 'drive'
    try {
      await authorizeDrive()
      driveConnected.value = true
      await patch({ autoSaveToGoogleDrive: true })
    } catch (error) {
      logger.error('[Options] Drive 授权失败:', error)
      driveAuthError.value = true
      input.checked = false
    } finally {
      authorizing = null
    }
    return
  }
  await patch({ autoSaveToGoogleDrive: checked })
}

/** HubSpot 开关切换（与 Drive 同构：开 + 未授权 → 先授权）。 */
async function onHubspotToggle(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const checked = input.checked
  hubspotAuthError.value = false
  if (checked && !hubspotConnected.value) {
    if (authorizing !== null) {
      input.checked = false
      return
    }
    authorizing = 'hubspot'
    try {
      await authorizeHubspot()
      hubspotConnected.value = true
      await patch({ autoSaveToHubspot: true })
    } catch (error) {
      logger.error('[Options] HubSpot 授权失败:', error)
      hubspotAuthError.value = true
      input.checked = false
    } finally {
      authorizing = null
    }
    return
  }
  await patch({ autoSaveToHubspot: checked })
}

/** 断开 Drive：吊销授权 + 清 storage + 关闭开关。 */
async function disconnectDrive(): Promise<void> {
  await revokeDriveAuth()
  driveConnected.value = false
  await patch({ autoSaveToGoogleDrive: false })
}

/** 断开 HubSpot：清本地授权（HubSpot 无用户侧吊销端点）+ 关闭开关。 */
async function disconnectHubspot(): Promise<void> {
  await MapsIntegrationAuthManager.clearHubspotAuth()
  hubspotConnected.value = false
  await patch({ autoSaveToHubspot: false })
}

/** 间隔档位（包内默认档；远程档位收窄时由覆盖层按生效档位校验回退）。 */
const intervalOptions = DEFAULT_MAPS_CONFIG.scrape.scrollIntervalOptionsSec

/** 导出格式选项（格式名跨语言一致）。 */
const formatOptions: readonly { value: SearchExportFormat; labelKey: string }[] = [
  { value: 'csv', labelKey: I18N_KEYS.OPTIONS.FORMAT_CSV },
  { value: 'json', labelKey: I18N_KEYS.OPTIONS.FORMAT_JSON },
  { value: 'xlsx', labelKey: I18N_KEYS.OPTIONS.FORMAT_XLSX }
]

/** 分组 key → i18n 标题。 */
const GROUP_LABEL_KEYS: Record<string, string> = {
  basic: I18N_KEYS.OPTIONS.GROUP_BASIC,
  address: I18N_KEYS.OPTIONS.GROUP_ADDRESS,
  contact: I18N_KEYS.OPTIONS.GROUP_CONTACT,
  business: I18N_KEYS.OPTIONS.GROUP_BUSINESS,
  reviews: I18N_KEYS.OPTIONS.GROUP_REVIEWS,
  identifiers: I18N_KEYS.OPTIONS.GROUP_IDENTIFIERS
}

/** 勾选 UI 的分组视图（列定义以 SEARCH_EXPORT_COLUMNS 为唯一事实来源）。 */
interface UiColumnGroup {
  key: string
  labelKey: string
  columns: readonly SearchExportColumn[]
}

const columnByHeader = new Map(SEARCH_EXPORT_COLUMNS.map(column => [column.header, column]))
const columnGroups: readonly UiColumnGroup[] = SEARCH_EXPORT_COLUMN_GROUPS.map(group => ({
  key: group.key,
  labelKey: GROUP_LABEL_KEYS[group.key] ?? I18N_KEYS.OPTIONS.GROUP_BASIC,
  columns: group.headers
    .map(header => columnByHeader.get(header))
    .filter((column): column is SearchExportColumn => column !== undefined)
}))

/** 合并写回设置（normalize 在 manager 内兜底，响应态用返回值校准）。 */
async function patch(updates: Partial<MapsUserSettings>): Promise<void> {
  settings.value = await MapsUserSettingsManager.updateSettings(updates)
}

/** 勾选/取消单列（保持 schema 列序由导出层保证，此处只存 header 集合）。 */
function toggleColumn(header: string, checked: boolean): void {
  const selected = new Set(settings.value.exportFieldHeaders)
  if (checked) {
    selected.add(header)
  } else {
    selected.delete(header)
  }
  void patch({ exportFieldHeaders: [...selected] })
}

/** 重试次数输入：取整并夹到 [0, MAX]，非法回默认 1（normalize 兜底）。 */
function onStuckMaxRetryChange(event: Event): void {
  const parsed = Number.parseInt((event.target as HTMLInputElement).value, 10)
  const clamped = Number.isNaN(parsed)
    ? DEFAULT_MAPS_USER_SETTINGS.stuckMaxRetry
    : Math.min(Math.max(parsed, 0), MAX_STUCK_RETRY)
  void patch({ stuckMaxRetry: clamped })
}
</script>

<style scoped>
/* design.md / design.dark.md 语义 token（变量名与 YAML 键一致，前缀 --gme-）；
   禁止在 token 之外硬编码色值/字体/圆角/阴影。 */
.options-page {
  --gme-bg: #ffffff;
  --gme-bg-image: linear-gradient(
    180deg,
    #e9f1fd 0%,
    rgba(233, 241, 253, 0.55) 300px,
    rgba(233, 241, 253, 0) 560px
  );
  --gme-surface: #ffffff;
  --gme-surface-2: #f0f4f9;
  --gme-border: #dde3ea;
  --gme-border-strong: #b9c2cd;
  --gme-text: #1f1f1f;
  --gme-text-2: #5f6368;
  --gme-text-3: #80868b;
  --gme-primary: #1a73e8;
  --gme-primary-hover: #1765cc;
  --gme-primary-fg: #ffffff;
  --gme-primary-soft: #e8f0fe;
  --gme-ring: #1a73e8;
  --gme-bad: #d93025;
  --gme-shadow-card: 0 1px 2px rgba(60, 64, 67, 0.1), 0 3px 8px rgba(60, 64, 67, 0.06);
  --gme-font-body: 'Plus Jakarta Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --gme-font-mono: 'Azeret Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;

  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--gme-bg);
  background-image: var(--gme-bg-image);
  color: var(--gme-text);
  font-family: var(--gme-font-body);
}

@media (prefers-color-scheme: dark) {
  .options-page {
    --gme-bg: #15171c;
    --gme-bg-image: linear-gradient(
      180deg,
      rgba(26, 115, 232, 0.16) 0%,
      rgba(26, 115, 232, 0.06) 300px,
      rgba(26, 115, 232, 0) 560px
    );
    --gme-surface: #1d2026;
    --gme-surface-2: #262a31;
    --gme-border: #31353d;
    --gme-border-strong: #4c515b;
    --gme-text: #e8eaed;
    --gme-text-2: #9aa0a6;
    --gme-text-3: #7c828c;
    --gme-primary: #8ab4f8;
    --gme-primary-hover: #aecbfa;
    --gme-primary-fg: #0d2b45;
    --gme-primary-soft: rgba(138, 180, 248, 0.15);
    --gme-ring: #8ab4f8;
    --gme-bad: #f28b82;
    --gme-shadow-card: 0 2px 8px rgba(0, 0, 0, 0.35);
  }
}

* {
  box-sizing: border-box;
}

.options-header {
  padding: 24px 28px 16px;
}

.options-header-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.options-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: -0.015em;
  color: var(--gme-text);
}

.options-brand {
  font-family: var(--gme-font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gme-text-3);
}

.options-main {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 28px 64px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.options-card {
  margin: 0;
  padding: 24px;
  background: var(--gme-surface);
  border: 1px solid var(--gme-border);
  border-radius: 16px;
  box-shadow: var(--gme-shadow-card);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.options-section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--gme-text);
}

.options-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.options-label {
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: var(--gme-text);
}

/* 标签行内联 Pro 徽章时的对齐（徽章 baseline 随文字） */
.options-label-with-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.options-hint {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--gme-text-2);
}

/* 集成授权状态行：比 hint 更弱化，mono 强调连接态 */
.options-integration-status {
  font-family: var(--gme-font-mono);
  font-size: 11.5px;
  letter-spacing: 0.02em;
  color: var(--gme-text-3);
}

/* 授权失败提示（失败不静默：UI 可见） */
.options-error {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--gme-bad);
}

/* 开关行右侧控件组（Disconnect 文字按钮 + 开关） */
.options-toggle-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* 文字按钮（Disconnect）：文本按钮规则，无底色 */
.options-link-button {
  padding: 0;
  font-family: var(--gme-font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--gme-primary);
  background: none;
  border: none;
  cursor: pointer;
}

.options-link-button:hover {
  color: var(--gme-primary-hover);
  text-decoration: underline;
}

.options-link-button:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 2px;
}

/* 隐私政策页脚（013 A13，U11）：弱化居中链接 */
.options-footer {
  display: flex;
  justify-content: center;
  padding: 4px 0 20px;
}

.options-privacy-link {
  font-family: var(--gme-font-body);
  font-size: 13px;
  color: var(--gme-text-3);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.options-privacy-link:hover {
  color: var(--gme-primary);
}

.options-privacy-link:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 2px;
}

/* 分段选择（间隔档位 / 导出格式）：pill 段，激活 = primary 实底 + -fg 字 */
.options-segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.options-segment {
  height: 33px;
  padding: 0 16px;
  font-family: var(--gme-font-body);
  font-size: 14px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--gme-text);
  background: var(--gme-surface);
  border: 1px solid var(--gme-border-strong);
  border-radius: 999px;
  cursor: pointer;
}

.options-segment:hover {
  background: var(--gme-surface-2);
}

.options-segment:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
}

.options-segment-active,
.options-segment-active:hover {
  background: var(--gme-primary);
  border-color: var(--gme-primary);
  color: var(--gme-primary-fg);
}

/* 36 列分组勾选 */
.options-field-groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.options-field-group {
  margin: 0;
  padding: 12px;
  border: 1px solid var(--gme-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.options-field-group-legend {
  padding: 0 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--gme-text-3);
}

.options-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
  cursor: pointer;
}

.options-checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--gme-primary);
  cursor: pointer;
}

.options-checkbox input:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
}

.options-checkbox-label {
  font-size: 13px;
  line-height: 18px;
  color: var(--gme-text);
}

/* Pro 列标注：mono chip（-soft 底 + 同色文字，design.md 徽章规则） */
.options-pro-badge {
  padding: 2px 8px;
  font-family: var(--gme-font-mono);
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1;
  border-radius: 999px;
  background: var(--gme-primary-soft);
  color: var(--gme-primary);
}

/* 开关行 */
.options-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.options-toggle-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.options-switch {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  cursor: pointer;
}

.options-switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
}

.options-switch-track {
  width: 40px;
  height: 22px;
  border-radius: 999px;
  background: var(--gme-surface-2);
  border: 1px solid var(--gme-border-strong);
  transition: background 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.options-switch-track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--gme-surface);
  border: 1px solid var(--gme-border-strong);
  transition: transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

.options-switch input:checked + .options-switch-track {
  background: var(--gme-primary);
  border-color: var(--gme-primary);
}

.options-switch input:checked + .options-switch-track::after {
  transform: translateX(18px);
  background: var(--gme-primary-fg);
  border-color: var(--gme-primary);
}

.options-switch input:focus-visible + .options-switch-track {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
}

/* 数字输入（重试次数）：高 40 + border-strong + sm 圆角，design.md 输入规则 */
.options-number-input {
  width: 96px;
  height: 40px;
  padding: 0 14px;
  font-family: var(--gme-font-body);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--gme-text);
  background: var(--gme-surface);
  border: 1px solid var(--gme-border-strong);
  border-radius: 10px;
}

.options-number-input:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
  border-color: var(--gme-ring);
}
</style>
