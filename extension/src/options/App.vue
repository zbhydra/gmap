<template>
  <div class="op-page">
    <header class="appbar op-appbar" :class="{ 'is-scrolled': scrolled }">
      <span class="brand"
        ><img class="brand-mark" :src="brandIconUrl" alt="" />{{ t(I18N_KEYS.APP.TITLE) }}</span
      >
      <span class="op-appbar-sep" aria-hidden="true"></span>
      <h1 class="appbar-title">{{ t(K.TITLE) }}</h1>
      <div class="appbar-actions">
        <span class="op-save" :data-state="saveState" role="status" aria-live="polite"
          ><span v-if="saveState === 'saving'" class="spinner"></span
          ><Icon
            v-else
            :name="saveState === 'failed' ? IconName.ALERT_CIRCLE : IconName.CHECK_CIRCLE"
          /><span>{{ t(saveLabels[saveState]) }}</span></span
        >
      </div>
    </header>
    <div class="op-shell">
      <nav class="op-nav" :aria-label="t(K.NAV_LABEL)">
        <span
          class="op-nav-ink"
          aria-hidden="true"
          :style="{ '--nav-index': sections.findIndex(section => section.id === activeSection) }"
        ></span>
        <a
          v-for="section in sections"
          :key="section.id"
          class="op-nav-link"
          :href="`#${section.id}`"
          :aria-current="activeSection === section.id ? 'location' : undefined"
          @click.prevent="goTo(section.id)"
        >
          <span class="op-nav-icon"><Icon :name="section.icon" /></span
          ><span class="op-nav-text"
            ><span class="op-nav-label">{{ t(section.label) }}</span
            ><span class="op-nav-sum mono">{{ sectionSummary(section.id) }}</span></span
          >
        </a>
      </nav>
      <main class="op-main">
        <div v-if="failedRow" class="op-alert notice notice--banner tone-bad" role="alert">
          <Icon :name="IconName.ALERT_CIRCLE" />
          <div>
            <p class="notice-title">{{ t(K.SAVE_FAILED, { setting: t(rowLabels[failedRow]) }) }}</p>
            <p class="notice-desc">
              {{ t(K.SAVE_FAILED_HINT, { value: currentValue(failedRow) }) }}
            </p>
            <div class="notice-actions">
              <button type="button" class="btn btn-secondary btn-sm" @click="reloadPage">
                <Icon :name="IconName.REFRESH" />{{ t(K.RELOAD) }}
              </button>
            </div>
          </div>
        </div>
        <div class="op-form">
          <section id="extraction" class="op-section enter" aria-labelledby="heading-extraction">
            <header class="op-section-head">
              <h2 id="heading-extraction" class="op-section-title" tabindex="-1">
                {{ t(K.SECTION_EXTRACTION) }}
              </h2>
              <p class="op-section-desc">{{ t(K.EXTRACTION_DESC) }}</p>
            </header>
            <div class="card op-card">
              <div class="op-setting">
                <div class="op-setting-text">
                  <span id="interval-label" class="op-setting-label">{{
                    t(K.REQUEST_INTERVAL)
                  }}</span
                  ><span id="interval-hint" class="op-setting-hint">{{
                    t(K.REQUEST_INTERVAL_HINT)
                  }}</span>
                </div>
                <div class="op-ctl">
                  <SaveFeedback :state="feedback('requestIntervalSec')" />
                  <div
                    class="seg seg--sm op-interval"
                    role="radiogroup"
                    aria-labelledby="interval-label"
                    aria-describedby="interval-hint"
                  >
                    <span
                      class="seg-thumb"
                      :style="
                        segmentStyle(
                          intervalOptions.indexOf(settings.requestIntervalSec),
                          intervalOptions.length
                        )
                      "
                      aria-hidden="true"
                    ></span
                    ><button
                      v-for="seconds in intervalOptions"
                      :key="seconds"
                      class="seg-btn"
                      type="button"
                      role="radio"
                      :aria-checked="settings.requestIntervalSec === seconds"
                      @click="patch({ requestIntervalSec: seconds }, 'requestIntervalSec')"
                    >
                      {{ t(K.INTERVAL_SECONDS, { seconds }) }}
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-for="option in enrichOptions"
                :id="option.key"
                :key="option.key"
                class="op-setting"
              >
                <div class="op-setting-text">
                  <span :id="`${option.key}-label`" class="op-setting-label"
                    >{{ t(option.label)
                    }}<span class="badge badge--pro"
                      ><Icon :name="IconName.CROWN" />{{ t(K.PRO_BADGE) }}</span
                    ></span
                  ><span :id="`${option.key}-hint`" class="op-setting-hint">{{
                    t(option.hint)
                  }}</span
                  ><span
                    v-if="option.key === 'extractSocialMedias'"
                    class="op-social"
                    aria-hidden="true"
                    ><Icon v-for="icon in socialIcons" :key="icon" :name="icon" /></span
                  ><span class="op-plan-note"
                    ><Icon :name="IconName.SPARKLE" />{{ t(K.PRO_FREE) }}</span
                  >
                </div>
                <div class="op-ctl">
                  <SaveFeedback :state="feedback(option.key)" /><button
                    type="button"
                    class="switch"
                    role="switch"
                    :aria-checked="settings[option.key]"
                    :aria-labelledby="`${option.key}-label`"
                    :aria-describedby="`${option.key}-hint`"
                    @click="patch({ [option.key]: !settings[option.key] }, option.key)"
                  >
                    <span class="switch-knob"></span>
                  </button>
                </div>
              </div>
            </div>
          </section>
          <section id="export" class="op-section enter" aria-labelledby="heading-export">
            <header class="op-section-head">
              <h2 id="heading-export" class="op-section-title" tabindex="-1">
                {{ t(K.SECTION_EXPORT) }}
              </h2>
              <p class="op-section-desc">{{ t(K.EXPORT_DESC) }}</p>
            </header>
            <div class="card op-card">
              <div class="op-setting">
                <div class="op-setting-text">
                  <span id="format-label" class="op-setting-label">{{ t(K.EXPORT_FORMAT) }}</span
                  ><span id="format-hint" class="op-setting-hint">{{
                    t(K.EXPORT_FORMAT_HINT)
                  }}</span>
                </div>
                <div class="op-ctl">
                  <SaveFeedback :state="feedback('exportFormat')" />
                  <div
                    class="seg seg--sm op-format"
                    role="radiogroup"
                    aria-labelledby="format-label"
                    aria-describedby="format-hint"
                  >
                    <span
                      class="seg-thumb"
                      :style="
                        segmentStyle(
                          formatOptions.findIndex(option => option.value === settings.exportFormat),
                          formatOptions.length
                        )
                      "
                      aria-hidden="true"
                    ></span
                    ><button
                      v-for="option in formatOptions"
                      :key="option.value"
                      class="seg-btn"
                      type="button"
                      role="radio"
                      :aria-checked="settings.exportFormat === option.value"
                      @click="patch({ exportFormat: option.value }, 'exportFormat')"
                    >
                      <Icon :name="option.icon" />{{ t(option.label) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <ExportPreview :settings="settings" @jump="jumpToSetting" />
            <div class="card op-card op-fields">
              <div class="op-row-head">
                <div class="op-setting-text">
                  <span id="fields-label" class="op-setting-label">{{ t(K.EXPORT_FIELDS) }}</span
                  ><span class="op-setting-hint">{{ t(K.EXPORT_FIELDS_HINT) }}</span>
                </div>
                <div class="op-ctl">
                  <SaveFeedback :state="feedback('exportFieldHeaders')" /><span
                    class="op-count mono"
                    ><Transition name="count" mode="out-in"
                      ><span :key="settings.exportFieldHeaders.length" class="op-count-num">{{
                        settings.exportFieldHeaders.length
                      }}</span></Transition
                    ><span class="muted">/ {{ SEARCH_EXPORT_COLUMNS.length }}</span></span
                  >
                </div>
              </div>
              <div class="op-fields-bar">
                <span class="op-legend"
                  ><span class="op-pro-mini"><Icon :name="IconName.CROWN" /></span
                  >{{ t(K.PRO_FIELDS) }}</span
                ><span class="cluster"
                  ><button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    @click="
                      patch(
                        { exportFieldHeaders: SEARCH_EXPORT_COLUMNS.map(column => column.header) },
                        'exportFieldHeaders'
                      )
                    "
                  >
                    <Icon :name="IconName.LIST_CHECKS" />{{ t(K.SELECT_ALL) }}</button
                  ><button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    @click="patch({ exportFieldHeaders: [] }, 'exportFieldHeaders')"
                  >
                    <Icon :name="IconName.X" />{{ t(K.CLEAR_FIELDS) }}
                  </button></span
                >
              </div>
              <div class="op-groups">
                <fieldset v-for="group in columnGroups" :key="group.key" class="op-group">
                  <legend class="sr-only">{{ t(group.labelKey) }}</legend>
                  <div class="op-group-head">
                    <label class="check-row op-group-toggle"
                      ><input
                        class="check"
                        type="checkbox"
                        :checked="selectedInGroup(group) === group.columns.length"
                        :indeterminate="
                          selectedInGroup(group) > 0 &&
                          selectedInGroup(group) < group.columns.length
                        "
                        @change="toggleGroup(group, $event)"
                      /><span class="op-group-name">{{ t(group.labelKey) }}</span></label
                    ><span
                      class="badge badge--count mono"
                      :class="{ 'tone-primary': selectedInGroup(group) === group.columns.length }"
                      >{{ selectedInGroup(group) }} / {{ group.columns.length }}</span
                    >
                  </div>
                  <div class="op-field-grid">
                    <label
                      v-for="column in group.columns"
                      :key="column.header"
                      class="check-row op-field"
                      ><input
                        class="check"
                        type="checkbox"
                        :checked="settings.exportFieldHeaders.includes(column.header)"
                        @change="toggleColumn(column.header, $event)" /><span
                        class="op-field-name"
                        >{{ t(column.labelKey) }}</span
                      ><span v-if="column.pro" class="op-pro-mini" :title="t(K.PRO_BADGE)"
                        ><Icon :name="IconName.CROWN" /></span
                    ></label>
                  </div>
                </fieldset>
              </div>
            </div>
          </section>
          <section id="automation" class="op-section enter" aria-labelledby="heading-automation">
            <header class="op-section-head">
              <h2 id="heading-automation" class="op-section-title" tabindex="-1">
                {{ t(K.SECTION_AUTOMATION) }}
              </h2>
              <p class="op-section-desc">{{ t(K.AUTOMATION_DESC) }}</p>
            </header>
            <div class="card op-card">
              <div class="op-setting op-setting--download">
                <div class="op-setting-text">
                  <span id="download-label" class="op-setting-label">{{ t(K.AUTO_DOWNLOAD) }}</span>
                </div>
                <div class="op-ctl">
                  <SaveFeedback :state="feedback('autoDownload')" /><button
                    class="switch"
                    type="button"
                    role="switch"
                    :aria-checked="settings.autoDownload"
                    aria-labelledby="download-label"
                    @click="patch({ autoDownload: !settings.autoDownload }, 'autoDownload')"
                  >
                    <span class="switch-knob"></span>
                  </button>
                </div>
                <Transition name="download"
                  ><div v-if="settings.autoDownload" class="op-download">
                    <Icon :name="IconName.DOWNLOAD" />
                    <div>
                      <p>{{ t(K.AUTO_DOWNLOAD_HINT) }}</p>
                      <span class="op-download-file mono">{{ downloadFilename }}</span>
                    </div>
                  </div></Transition
                >
              </div>
              <div class="op-setting">
                <div class="op-setting-text">
                  <label for="options-retry" class="op-setting-label">{{
                    t(K.STUCK_MAX_RETRY)
                  }}</label
                  ><span class="op-setting-hint">{{ t(K.STUCK_MAX_RETRY_HINT) }}</span>
                </div>
                <div class="op-ctl">
                  <SaveFeedback :state="feedback('stuckMaxRetry')" />
                  <div class="op-stepper">
                    <button
                      type="button"
                      class="icon-btn icon-btn--sm"
                      :disabled="settings.stuckMaxRetry <= 0"
                      :aria-label="t(K.DECREASE_RETRY)"
                      @click="patch({ stuckMaxRetry: settings.stuckMaxRetry - 1 }, 'stuckMaxRetry')"
                    >
                      <Icon :name="IconName.MINUS" /></button
                    ><input
                      id="options-retry"
                      type="number"
                      min="0"
                      :max="MAX_STUCK_RETRY"
                      :value="settings.stuckMaxRetry"
                      @change="onStuckMaxRetryChange"
                    /><button
                      type="button"
                      class="icon-btn icon-btn--sm"
                      :disabled="settings.stuckMaxRetry >= MAX_STUCK_RETRY"
                      :aria-label="t(K.INCREASE_RETRY)"
                      @click="patch({ stuckMaxRetry: settings.stuckMaxRetry + 1 }, 'stuckMaxRetry')"
                    >
                      <Icon :name="IconName.PLUS" />
                    </button>
                  </div>
                </div>
                <div class="op-attempts">
                  <TransitionGroup name="attempt" tag="span" class="op-pips"
                    ><span
                      v-for="attempt in settings.stuckMaxRetry + 1"
                      :key="attempt"
                      class="op-pip"
                      :class="{ 'op-pip--first': attempt === 1 }"
                      >{{ attempt }}</span
                    ></TransitionGroup
                  ><Icon :name="IconName.ARROW_RIGHT" /><span class="badge tone-bad"
                    ><Icon :name="IconName.SKIP" />{{ t(K.SKIPPED) }}</span
                  ><span class="op-attempts-text">{{
                    t(K.ATTEMPTS, { count: settings.stuckMaxRetry + 1 })
                  }}</span
                  ><span class="op-setting-hint">{{ t(K.RETRY_SETTINGS_ONLY) }}</span>
                </div>
              </div>
            </div>
            <div class="card op-card">
              <h3 class="op-integrations-title">
                <Icon :name="IconName.PUZZLE" />{{ t(K.INTEGRATIONS) }}
              </h3>
              <div
                v-for="integration in integrationOptions"
                :key="integration.side"
                class="op-setting op-integration"
              >
                <span class="icon-tile icon-tile--sm"><Icon :name="integration.icon" /></span>
                <div class="op-setting-text">
                  <span :id="`${integration.side}-label`" class="op-setting-label">{{
                    t(integration.label)
                  }}</span
                  ><span class="op-setting-hint">{{ t(integration.hint) }}</span
                  ><span
                    v-if="!integrationAvailability[integration.side]"
                    class="op-setting-hint"
                    >{{ t(K.INTEGRATION_UNAVAILABLE) }}</span
                  ><template v-else
                    ><span class="op-setting-hint">{{
                      t(
                        connected[integration.side]
                          ? K.INTEGRATION_STATUS_CONNECTED
                          : K.INTEGRATION_STATUS_NOT_CONNECTED
                      )
                    }}</span
                    ><span v-if="integrationErrors[integration.side]" class="field-error">{{
                      t(K.INTEGRATION_AUTH_FAILED)
                    }}</span
                    ><button
                      v-if="connected[integration.side]"
                      type="button"
                      class="link"
                      @click="disconnectIntegration(integration.side)"
                    >
                      {{ t(K.INTEGRATION_DISCONNECT) }}
                    </button></template
                  >
                </div>
                <div class="op-ctl">
                  <SaveFeedback :state="feedback(integration.key)" /><button
                    type="button"
                    class="switch"
                    role="switch"
                    :disabled="!integrationAvailability[integration.side] || authorizing !== null"
                    :aria-checked="settings[integration.key]"
                    :aria-labelledby="`${integration.side}-label`"
                    @click="toggleIntegration(integration.side)"
                  >
                    <span class="switch-knob"></span>
                  </button>
                </div>
              </div>
            </div>
          </section>
          <section id="appearance" class="op-section enter" aria-labelledby="heading-appearance">
            <header class="op-section-head">
              <h2 id="heading-appearance" class="op-section-title" tabindex="-1">
                {{ t(K.SECTION_APPEARANCE) }}
              </h2>
              <p class="op-section-desc">{{ t(K.APPEARANCE_DESC) }}</p>
            </header>
            <div class="card op-card">
              <div class="op-setting op-setting--stack">
                <div class="op-row-head">
                  <div class="op-setting-text">
                    <span id="theme-label" class="op-setting-label">{{ t(K.THEME) }}</span
                    ><span class="op-setting-hint">{{ t(K.THEME_HINT) }}</span>
                  </div>
                  <SaveFeedback :state="feedback('theme')" />
                </div>
                <div class="op-themes" role="radiogroup" aria-labelledby="theme-label">
                  <button
                    v-for="theme in themeOptions"
                    :key="theme.value"
                    type="button"
                    class="op-theme"
                    role="radio"
                    :aria-checked="settings.theme === theme.value"
                    @click="changeTheme(theme.value, $event)"
                  >
                    <span class="op-theme-art" aria-hidden="true"
                      ><span
                        class="op-theme-half"
                        :data-theme="theme.value === 'system' ? 'light' : theme.value"
                        ><span class="op-mini"
                          ><i class="op-mini-logo"></i><i class="op-mini-line"></i
                          ><i class="op-mini-line op-mini-line--short"></i
                          ><i class="op-mini-meter"></i><i class="op-mini-button"></i></span></span
                      ><span
                        v-if="theme.value === 'system'"
                        class="op-theme-half op-theme-half--dark"
                        data-theme="dark"
                        ><span class="op-mini"
                          ><i class="op-mini-logo"></i><i class="op-mini-line"></i
                          ><i class="op-mini-line op-mini-line--short"></i
                          ><i class="op-mini-meter"></i
                          ><i class="op-mini-button"></i></span></span></span
                    ><span class="op-theme-foot"
                      ><span class="op-theme-radio"></span><span>{{ t(theme.label) }}</span
                      ><Icon :name="theme.icon" /></span
                    ><span v-if="theme.value === 'system'" class="op-theme-now">{{
                      t(systemDark ? K.NOW_DARK : K.NOW_LIGHT)
                    }}</span>
                  </button>
                </div>
              </div>
              <div class="op-setting">
                <div class="op-setting-text">
                  <label class="op-setting-label" for="options-language">{{ t(K.LANGUAGE) }}</label
                  ><span class="op-setting-hint">{{ t(K.LANGUAGE_HINT) }}</span>
                </div>
                <div class="op-ctl">
                  <SaveFeedback :state="feedback('language')" />
                  <div class="select-wrap op-lang">
                    <select
                      id="options-language"
                      class="select"
                      :value="locale"
                      @change="changeLanguage"
                    >
                      <option
                        v-for="lang in LANGUAGES"
                        :key="lang.value"
                        :value="lang.value"
                        :lang="lang.value"
                      >
                        {{ lang.label }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <footer class="op-foot">
          <span class="op-foot-brand"
            ><img :src="brandIconUrl" alt="" width="18" height="18" />{{ t(I18N_KEYS.APP.TITLE)
            }}<span class="mono">v{{ version }}</span></span
          ><a class="link link--quiet" :href="privacyUrl" target="_blank" rel="noreferrer"
            >{{ t(K.PRIVACY_POLICY) }}<Icon :name="IconName.EXTERNAL_LINK"
          /></a>
        </footer>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { WEBSITE } from '@/core/api/config'
import { Icon, IconName } from '@/core/components/icons'
import { logger } from '@/core/utils/logger'
import { LANGUAGES } from '@/core/services/languageService'
import { I18nService } from '@/locales'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import {
  MapsUserSettingsManager,
  type MapsUserSettings,
  type ThemeMode
} from '@/sites/maps/settings/userSettings'
import {
  MapsIntegrationAuthManager,
  authorizeDrive,
  authorizeHubspot,
  getMapsIntegrationAvailability,
  revokeDriveAuth
} from '@/sites/maps/settings/integrations'
import {
  SEARCH_EXPORT_COLUMN_GROUPS,
  SEARCH_EXPORT_COLUMNS,
  type SearchExportColumn
} from '@/sites/maps/content/export/columns'
import { buildSearchExportFilename } from '@/sites/maps/content/export/csv'
import ExportPreview from './ExportPreview.vue'
import SaveFeedback from './SaveFeedback.vue'

const { t, locale } = useI18n()
const K = I18N_KEYS.OPTIONS
const privacyUrl = new URL('/privacy/', WEBSITE.BASE_URL).toString()
const brandIconUrl = chrome.runtime.getURL('icons/32.png')
const version = chrome.runtime.getManifest().version
const MAX_STUCK_RETRY = 9
const settings = ref<MapsUserSettings>(MapsUserSettingsManager.getDefaultSettings())
type Row = keyof MapsUserSettings | 'language'
type SaveState = 'idle' | 'saving' | 'saved' | 'failed'
const saveState = ref<SaveState>('idle')
const savedRow = ref<Row | null>(null)
const failedRow = ref<Row | null>(null)
const saveLabels = { idle: K.ALL_SAVED, saving: K.SAVING, saved: K.SAVED, failed: K.NOT_SAVED }
const rowLabels: Record<Row, string> = {
  requestIntervalSec: K.REQUEST_INTERVAL,
  exportFormat: K.EXPORT_FORMAT,
  exportFieldHeaders: K.EXPORT_FIELDS,
  extractEmail: K.EXTRACT_EMAIL,
  extractSocialMedias: K.EXTRACT_SOCIAL_MEDIAS,
  autoDownload: K.AUTO_DOWNLOAD,
  autoSaveToGoogleDrive: K.DRIVE_AUTO_SAVE,
  autoSaveToHubspot: K.HUBSPOT_AUTO_SAVE,
  stuckMaxRetry: K.STUCK_MAX_RETRY,
  theme: K.THEME,
  language: K.LANGUAGE
}
const intervalOptions = DEFAULT_MAPS_CONFIG.scrape.scrollIntervalOptionsSec
const enrichOptions = [
  { key: 'extractEmail', label: K.EXTRACT_EMAIL, hint: K.EXTRACT_EMAIL_HINT },
  { key: 'extractSocialMedias', label: K.EXTRACT_SOCIAL_MEDIAS, hint: K.EXTRACT_SOCIAL_MEDIAS_HINT }
] as const
const socialIcons = [
  IconName.FACEBOOK,
  IconName.INSTAGRAM,
  IconName.YOUTUBE,
  IconName.TIKTOK,
  IconName.LINKEDIN,
  IconName.X_SOCIAL
]
const formatOptions = [
  { value: 'csv', label: K.FORMAT_CSV, icon: IconName.FILE_CSV },
  { value: 'json', label: K.FORMAT_JSON, icon: IconName.FILE_JSON },
  { value: 'xlsx', label: K.FORMAT_XLSX, icon: IconName.FILE_XLSX }
] as const
const themeOptions = [
  { value: 'system', label: K.THEME_SYSTEM, icon: IconName.GLOBE },
  { value: 'light', label: K.THEME_LIGHT, icon: IconName.SUN },
  { value: 'dark', label: K.THEME_DARK, icon: IconName.MOON }
] as const
const sections = [
  { id: 'extraction', label: K.SECTION_EXTRACTION, icon: IconName.SCAN },
  { id: 'export', label: K.SECTION_EXPORT, icon: IconName.EXPORT },
  { id: 'automation', label: K.SECTION_AUTOMATION, icon: IconName.ZAP },
  { id: 'appearance', label: K.SECTION_APPEARANCE, icon: IconName.EYE }
] as const
type Section = (typeof sections)[number]['id']
const activeSection = ref<Section>('extraction')
const scrolled = ref(false)
const systemMedia = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(systemMedia.matches)
function onSystemChange(event: MediaQueryListEvent): void {
  systemDark.value = event.matches
}
const downloadFilename = computed(() =>
  buildSearchExportFilename(48, 'coffee near Manhattan', new Date(), settings.value.exportFormat)
)
const groupLabels: Record<string, string> = {
  basic: K.GROUP_BASIC,
  address: K.GROUP_ADDRESS,
  contact: K.GROUP_CONTACT,
  business: K.GROUP_BUSINESS,
  reviews: K.GROUP_REVIEWS,
  identifiers: K.GROUP_IDENTIFIERS
}
interface UiColumnGroup {
  key: string
  labelKey: string
  columns: readonly SearchExportColumn[]
}
const columnGroups: readonly UiColumnGroup[] = SEARCH_EXPORT_COLUMN_GROUPS.map(group => ({
  key: group.key,
  labelKey: groupLabels[group.key],
  columns: group.headers.map(
    header => SEARCH_EXPORT_COLUMNS.find(column => column.header === header)!
  )
}))
function selectedInGroup(group: UiColumnGroup): number {
  return group.columns.filter(column => settings.value.exportFieldHeaders.includes(column.header))
    .length
}
function feedback(row: Row): SaveState {
  return savedRow.value === row ? saveState.value : 'idle'
}
let savedTimer: ReturnType<typeof setTimeout> | undefined
function startSave(row: Row): void {
  clearTimeout(savedTimer)
  savedRow.value = row
  failedRow.value = null
  saveState.value = 'saving'
}
function finishSave(): void {
  saveState.value = 'saved'
  savedTimer = setTimeout(() => {
    saveState.value = 'idle'
    savedRow.value = null
  }, 2400)
}
async function patch(
  updates: Partial<MapsUserSettings>,
  row: keyof MapsUserSettings
): Promise<void> {
  const previous = settings.value
  startSave(row)
  settings.value = { ...previous, ...updates }
  try {
    settings.value = await MapsUserSettingsManager.updateSettings(updates)
    finishSave()
  } catch (error) {
    settings.value = previous
    saveState.value = 'failed'
    failedRow.value = row
    logger.error(`[Options] 设置 ${row} 保存失败:`, error)
  }
}
async function changeTheme(theme: ThemeMode, event: MouseEvent): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await patch({ theme }, 'theme')
    return
  }
  const x = event.clientX
  const y = event.clientY
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = document.startViewTransition(async () => {
    await patch({ theme }, 'theme')
    document.documentElement.dataset.theme = settings.value.theme
  })
  await transition.ready
  const style = getComputedStyle(document.documentElement)
  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    {
      duration: Number.parseFloat(style.getPropertyValue('--dur-4')),
      easing: style.getPropertyValue('--ease-out').trim(),
      pseudoElement: '::view-transition-new(root)'
    }
  )
}
async function changeLanguage(event: Event): Promise<void> {
  if (!(event.target instanceof HTMLSelectElement)) return
  const input = event.target
  const language = LANGUAGES.find(lang => lang.value === input.value)?.value
  if (!language) return
  const previous = locale.value
  startSave('language')
  try {
    await I18nService.setLanguage(language)
    finishSave()
  } catch (error) {
    input.value = previous
    saveState.value = 'failed'
    failedRow.value = 'language'
    logger.error('[Options] 语言保存失败:', error)
  }
}
function currentValue(row: Row): string {
  if (row === 'language')
    return LANGUAGES.find(lang => lang.value === locale.value)?.label ?? locale.value
  const value = settings.value[row]
  if (row === 'theme') return t(themeOptions.find(option => option.value === value)!.label)
  if (row === 'requestIntervalSec')
    return t(K.INTERVAL_SECONDS, { seconds: settings.value.requestIntervalSec })
  if (Array.isArray(value))
    return t(K.FIELD_COUNT, { count: value.length, total: SEARCH_EXPORT_COLUMNS.length })
  if (typeof value === 'boolean') return t(value ? K.ON : K.OFF)
  return String(value)
}
function sectionSummary(section: Section): string {
  if (section === 'extraction')
    return t(K.INTERVAL_SUMMARY, { seconds: settings.value.requestIntervalSec })
  if (section === 'export')
    return t(K.EXPORT_SUMMARY, {
      format: settings.value.exportFormat.toUpperCase(),
      count: settings.value.exportFieldHeaders.length,
      total: SEARCH_EXPORT_COLUMNS.length
    })
  if (section === 'automation')
    return t(K.AUTOMATION_SUMMARY, {
      download: t(settings.value.autoDownload ? K.ON : K.OFF),
      count: settings.value.stuckMaxRetry
    })
  return t(K.APPEARANCE_SUMMARY, {
    theme: t(themeOptions.find(option => option.value === settings.value.theme)!.label),
    language: LANGUAGES.find(lang => lang.value === locale.value)?.label ?? locale.value
  })
}
function segmentStyle(index: number, count: number): Record<string, string> {
  return {
    width: `calc((100% - 8px - ${(count - 1) * 2}px) / ${count})`,
    transform: `translateX(calc(${index} * (100% + 2px)))`
  }
}
function toggleColumn(header: string, event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  const selected = new Set(settings.value.exportFieldHeaders)
  if (event.target.checked) selected.add(header)
  else selected.delete(header)
  void patch({ exportFieldHeaders: [...selected] }, 'exportFieldHeaders')
}
function toggleGroup(group: UiColumnGroup, event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  const selected = new Set(settings.value.exportFieldHeaders)
  for (const column of group.columns) {
    if (event.target.checked) selected.add(column.header)
    else selected.delete(column.header)
  }
  void patch({ exportFieldHeaders: [...selected] }, 'exportFieldHeaders')
}
function onStuckMaxRetryChange(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  const parsed = Number.parseInt(event.target.value, 10)
  const value = Number.isNaN(parsed)
    ? settings.value.stuckMaxRetry
    : Math.min(MAX_STUCK_RETRY, Math.max(0, parsed))
  event.target.value = String(value)
  void patch({ stuckMaxRetry: value }, 'stuckMaxRetry')
}
function goTo(section: Section): void {
  const heading = document.getElementById(`heading-${section}`)!
  history.replaceState(null, '', `#${section}`)
  activeSection.value = section
  heading.focus({ preventScroll: true })
  document.getElementById(section)!.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  })
}
async function jumpToSetting(row: 'extractEmail' | 'extractSocialMedias'): Promise<void> {
  goTo('extraction')
  await nextTick()
  document.getElementById(row)!.querySelector('button')!.focus({ preventScroll: true })
  document
    .getElementById(row)!
    .animate([{ backgroundColor: 'var(--primary-soft)' }, { backgroundColor: 'transparent' }], {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900
    })
}
function onScroll(): void {
  scrolled.value = window.scrollY > 0
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    activeSection.value = 'appearance'
    return
  }
  const threshold = window.innerWidth <= 1040 ? 150 : 100
  activeSection.value =
    [...sections]
      .reverse()
      .find(
        section => document.getElementById(section.id)!.getBoundingClientRect().top <= threshold
      )?.id ?? 'extraction'
}
function reloadPage(): void {
  window.location.reload()
}
const integrationAvailability = getMapsIntegrationAvailability()
const integrationOptions = [
  {
    side: 'drive',
    key: 'autoSaveToGoogleDrive',
    label: K.DRIVE_AUTO_SAVE,
    hint: K.INTEGRATION_HINT_DRIVE,
    icon: IconName.CLOUD_UPLOAD
  },
  {
    side: 'hubspot',
    key: 'autoSaveToHubspot',
    label: K.HUBSPOT_AUTO_SAVE,
    hint: K.INTEGRATION_HINT_HUBSPOT,
    icon: IconName.BUILDING
  }
] as const
const connected = ref({ drive: false, hubspot: false })
const integrationErrors = ref({ drive: false, hubspot: false })
const authorizing = ref<'drive' | 'hubspot' | null>(null)
async function toggleIntegration(side: 'drive' | 'hubspot'): Promise<void> {
  const key = side === 'drive' ? 'autoSaveToGoogleDrive' : 'autoSaveToHubspot'
  const checked = !settings.value[key]
  integrationErrors.value[side] = false
  if (checked && !connected.value[side]) {
    authorizing.value = side
    try {
      if (side === 'drive') await authorizeDrive()
      else await authorizeHubspot()
      connected.value[side] = true
    } catch (error) {
      logger.error(`[Options] ${side} 授权失败:`, error)
      integrationErrors.value[side] = true
      return
    } finally {
      authorizing.value = null
    }
  }
  await patch({ [key]: checked }, key)
}
async function disconnectIntegration(side: 'drive' | 'hubspot'): Promise<void> {
  try {
    if (side === 'drive') await revokeDriveAuth()
    else await MapsIntegrationAuthManager.clearHubspotAuth()
    connected.value[side] = false
    const key = side === 'drive' ? 'autoSaveToGoogleDrive' : 'autoSaveToHubspot'
    await patch({ [key]: false }, key)
  } catch (error) {
    logger.error(`[Options] ${side} 断开授权失败:`, error)
    integrationErrors.value[side] = true
  }
}
let unsubscribeSettings: (() => void) | undefined
let unsubscribeLanguage: (() => void) | undefined
onMounted(async () => {
  settings.value = await MapsUserSettingsManager.getSettings()
  const auth = await MapsIntegrationAuthManager.getAuth()
  connected.value = { drive: auth.drive !== null, hubspot: auth.hubspot !== null }
  unsubscribeSettings = MapsUserSettingsManager.onSettingsChanged(value => {
    settings.value = value
  })
  unsubscribeLanguage = I18nService.onLanguageChange(() => {
    document.documentElement.lang = I18nService.getCurrentLanguage()
    document.title = t(K.TITLE)
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  systemMedia.addEventListener('change', onSystemChange)
  const section = sections.find(item => `#${item.id}` === window.location.hash)
  if (section) goTo(section.id)
})
onUnmounted(() => {
  clearTimeout(savedTimer)
  unsubscribeSettings?.()
  unsubscribeLanguage?.()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  systemMedia.removeEventListener('change', onSystemChange)
})
</script>
<style scoped src="./options.css"></style>
