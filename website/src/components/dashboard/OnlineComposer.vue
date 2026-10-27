<script setup lang="ts">
/**
 * Online 创建面板：关键词 / 地图 / 地区三种输入共用一套额度、联系方式开关与提交。
 *
 * - 地图模式输入单个关键词，按网格视口提交条目；关键词模式逐行输入，地区模式提交「最终查询」。
 * - 关键词逐行规范化去重（与后端口径一致），重复行只提示；数量、长度与地图条目上限都在提交前就地提示。
 * - 额度来自工作区（与侧栏用户卡同一份），用尽时提示并禁止提交；读取失败且没有数据时整块换成失败面板。
 * - 提交成功后清空当前模式的输入，由工作区高亮插入最近任务并刷新额度。
 */
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { createExportJob, type ExportItemInput } from '../../scripts/dashboard/api'
import { placeSegThumb, reducedMotion, replayClass } from '../../scripts/dashboard/dom'
import { fill, formatNumber, quotaLevel } from '../../scripts/dashboard/format'
import { keywordStats } from '../../scripts/dashboard/keywords'
import type { OnlineViewport } from '../../scripts/dashboard/map-grid'
import { isSessionExpiry, type DashboardWorkspace } from '../../scripts/dashboard/workspace'
import { HomepageApiError } from '../../scripts/homepage/api'
import { trackDashboardAction } from '../../scripts/homepage/web-mark'

const props = defineProps<{
  copy: DashboardContent
  workspace: DashboardWorkspace
  /** Online 档升级入口（Pricing 的 maps_online）。 */
  upgradeHref: string
}>()

// 地图（Leaflet）与地区数据只在首次切到对应模式时加载
const OnlineMapInput = defineAsyncComponent(() => import('./OnlineMapInput.vue'))
const OnlineRegionInput = defineAsyncComponent(() => import('./OnlineRegionInput.vue'))

type Mode = 'keywords' | 'map' | 'regions'
const MODES: readonly Mode[] = ['keywords', 'map', 'regions']
const MODE_ICONS: Record<Mode, string> = { keywords: 'list', map: 'map', regions: 'globe' }
/** T2（--dur-3 = 360ms）加余量：高度过渡的 transitionend 丢失时仍交还 auto 高度。 */
const SIZING_FALLBACK_MS = 480

const mode = ref<Mode>('keywords')
const mapOpened = ref(false)
const regionOpened = ref(false)
const keywordsText = ref('')
const mapKeyword = ref('')
const finalText = ref('')
const regionResetKey = ref(0)
const mapViewports = ref<OnlineViewport[]>([])
const includeContacts = ref(true)
const submitting = ref(false)
const submitError = ref('')
const segEl = ref<HTMLElement | null>(null)
const bodyEl = ref<HTMLElement | null>(null)
const keywordsPane = ref<HTMLElement | null>(null)
const regionPane = ref<HTMLElement | null>(null)
const finalEl = ref<HTMLTextAreaElement | null>(null)
let segObserver: ResizeObserver | null = null
let sizingTimer: ReturnType<typeof setTimeout> | undefined

const state = computed(() => props.workspace.state)
const options = computed(() => state.value.options)
const keywordInfo = computed(() => keywordStats(keywordsText.value))
const mapKeywordInfo = computed(() => keywordStats(mapKeyword.value))
const finalInfo = computed(() => keywordStats(finalText.value))
const stats = computed(() => mode.value === 'regions' ? finalInfo.value : mode.value === 'map' ? mapKeywordInfo.value : keywordInfo.value)
const keywordLimit = computed(() => mode.value === 'map' ? 1 : (options.value?.keyword_limit ?? 0))
const items = computed<ExportItemInput[]>(() => mode.value === 'map'
  ? stats.value.unique.flatMap(keyword => mapViewports.value.map(viewport => ({ keyword, viewport })))
  : stats.value.unique.map(keyword => ({ keyword })))
const keywordInvalid = computed(() => Boolean(options.value)
  && (stats.value.unique.length > keywordLimit.value || stats.value.tooLong))
const overLimit = computed(() => Boolean(options.value) && items.value.length > (options.value?.logical_sample_limit ?? 0))
const exhausted = computed(() => options.value?.usage.exhausted ?? false)
const blocked = computed(() => !options.value || exhausted.value || !items.value.length || keywordInvalid.value || overLimit.value)
const contactsAllowed = computed(() => options.value?.contacts_allowed ?? false)
const level = computed(() => options.value ? quotaLevel(options.value.usage.used, options.value.usage.total) : '')
const usageRatio = computed(() => {
  const usage = options.value?.usage
  if (!usage) return '0%'
  return usage.total > 0 ? `${Math.min(100, (usage.used / usage.total) * 100).toFixed(1)}%` : '100%'
})
/** 用量文案里 {used} 加粗：按占位符拆成前后两段渲染，不拼 HTML。 */
const usageParts = computed(() => {
  const usage = options.value?.usage
  const [before, after = ''] = props.copy.create.usage.split('{used}')
  return usage
    ? { before: fill(before, { total: formatNumber(usage.total) }), used: formatNumber(usage.used), after: fill(after, { total: formatNumber(usage.total) }) }
    : null
})
const hasMessages = computed(() => exhausted.value || keywordInvalid.value
  || (mode.value === 'map' && overLimit.value) || Boolean(submitError.value))

function countText(info: { unique: string[] }): string {
  return options.value ? fill(props.copy.create.count, { count: info.unique.length, limit: options.value.keyword_limit }) : ''
}

function countOver(info: { unique: string[] }): boolean {
  return Boolean(options.value) && info.unique.length > (options.value?.keyword_limit ?? 0)
}

function duplicatesText(info: { duplicates: number }): string {
  return info.duplicates ? fill(props.copy.create.duplicates, { count: info.duplicates }) : ''
}

/* ---------------------------------------------------------------- 模式切换 */

function finishSizing(): void {
  clearTimeout(sizingTimer)
  if (!bodyEl.value) return
  bodyEl.value.style.height = ''
  bodyEl.value.classList.remove('is-sizing')
}

function handleBodyTransitionEnd(event: TransitionEvent): void {
  if (event.target === bodyEl.value && event.propertyName === 'height') finishSizing()
}

/** 面板高度 T2 过渡：先锁定旧高度再过渡到新高度，结束后交还 auto；新面板只淡入。 */
async function setMode(next: Mode, focus = false): Promise<void> {
  if (submitting.value || next === mode.value) return
  const body = bodyEl.value
  const from = body?.offsetHeight ?? 0
  mode.value = next
  if (next === 'map') mapOpened.value = true
  if (next === 'regions') regionOpened.value = true
  await nextTick()
  if (segEl.value) placeSegThumb(segEl.value)
  if (focus) segEl.value?.querySelector<HTMLElement>(`[data-mode="${next}"]`)?.focus()
  const pane = next === 'regions' ? regionPane.value : keywordsPane.value
  if (pane) replayClass(pane, 'is-entering')
  if (!body) return
  finishSizing()
  const to = body.offsetHeight
  if (reducedMotion() || from === to) return
  body.style.height = `${from}px`
  body.classList.add('is-sizing')
  body.getBoundingClientRect()
  body.style.height = `${to}px`
  sizingTimer = setTimeout(finishSizing, SIZING_FALLBACK_MS)
}

/** tablist 的方向键：左右循环切换并聚焦（roving tabindex）。 */
function handleModeKeydown(event: KeyboardEvent): void {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  event.preventDefault()
  const index = MODES.indexOf(mode.value)
  const step = event.key === 'ArrowRight' ? 1 : MODES.length - 1
  void setMode(MODES[(index + step) % MODES.length], true)
}

/* ---------------------------------------------------------------- 地区 */

function generate(queries: string[]): void {
  finalText.value = queries.join('\n')
  submitError.value = ''
  if (finalEl.value) replayClass(finalEl.value, 'is-filled')
}

/* ---------------------------------------------------------------- 提交 */

function toggleContacts(event: Event): void {
  if (event.target instanceof HTMLInputElement) includeContacts.value = event.target.checked
}

async function submit(): Promise<void> {
  const current = options.value
  if (submitting.value || !current || blocked.value) return
  submitting.value = true
  submitError.value = ''
  try {
    trackDashboardAction('job_submit', {
      mode: mode.value,
      item_count: items.value.length,
      contacts: includeContacts.value && current.contacts_allowed
    })
    const detail = await createExportJob(props.workspace.context, items.value, includeContacts.value && current.contacts_allowed)
    if (mode.value === 'regions') {
      finalText.value = ''
      regionResetKey.value += 1
    } else if (mode.value === 'map') mapKeyword.value = ''
    else keywordsText.value = ''
    void props.workspace.jobSubmitted(detail.job)
  } catch (error) {
    trackDashboardAction('job_submit_failed', {
      mode: mode.value,
      item_count: items.value.length,
      code: error instanceof HomepageApiError ? (error.code ?? '') : ''
    })
    if (!isSessionExpiry(error)) console.error(new Error('[dashboard-composer] create export job failed', { cause: error }))
    submitError.value = error instanceof HomepageApiError && typeof error.code === 'number' ? error.message : props.copy.create.failed
    // 请求可能已在服务端建成任务（如超时）：刷新最近任务，避免用户重复提交
    props.workspace.refreshOnline()
  } finally {
    submitting.value = false
  }
}

watch([keywordsText, mapKeyword, finalText], () => {
  submitError.value = ''
})

// 模式 tab 在额度到达后才渲染；字体加载、视图从隐藏切回与宽度变化都会改变按钮尺寸：滑块直接对齐，不做过渡
watch(segEl, element => {
  segObserver?.disconnect()
  if (!element) return
  placeSegThumb(element, true)
  segObserver = new ResizeObserver(() => placeSegThumb(element, true))
  segObserver.observe(element)
}, { flush: 'post' })

onBeforeUnmount(() => {
  clearTimeout(sizingTimer)
  segObserver?.disconnect()
})
</script>

<template>
  <form class="d-panel composer" aria-labelledby="composer-title" novalidate @submit.prevent="submit">
    <div class="composer-head">
      <h2 id="composer-title" class="d-panel-title">{{ props.copy.create.newTask }}</h2>
      <div
        v-if="options"
        ref="segEl"
        class="seg seg--sm"
        role="tablist"
        :aria-label="props.copy.create.modeLabel"
        @keydown="handleModeKeydown"
      >
        <span class="seg-thumb" aria-hidden="true"></span>
        <button
          v-for="item in MODES"
          :id="`tab-${item}`"
          :key="item"
          class="seg-btn"
          type="button"
          role="tab"
          :aria-selected="item === mode ? 'true' : 'false'"
          aria-controls="mode-panel"
          :tabindex="item === mode ? 0 : -1"
          :disabled="submitting"
          :data-mode="item"
          @click="setMode(item)"
        >
          <svg class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${MODE_ICONS[item]}`" /></svg>{{ props.copy.create.modes[item] }}
        </button>
      </div>
    </div>

    <template v-if="options">
      <div
        id="mode-panel"
        ref="bodyEl"
        class="composer-body"
        role="tabpanel"
        :aria-labelledby="`tab-${mode}`"
        @transitionend="handleBodyTransitionEnd"
      >
        <div v-show="mode !== 'regions'" ref="keywordsPane" class="composer-grid mode-pane" :data-layout="mode === 'map' ? 'map' : 'keywords'">
          <div class="kw-field">
            <template v-if="mode === 'map'">
              <label class="field-label" for="map-keyword">{{ props.copy.create.map.keyword }}</label>
              <input
                id="map-keyword"
                v-model="mapKeyword"
                class="input"
                :class="{ 'is-invalid': keywordInvalid }"
                type="text"
                autocomplete="off"
                spellcheck="false"
                :placeholder="props.copy.create.map.keywordPlaceholder"
                :disabled="submitting"
              />
            </template>
            <div v-else class="field-head kw-head">
              <label class="field-label" for="kw-input">{{ props.copy.create.keywords }}</label>
              <button class="btn btn-secondary btn-xs kw-regions-cta" type="button" :disabled="submitting" @click="setMode('regions')">
                <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-globe" /></svg>{{ props.copy.create.regionsCta }}
              </button>
            </div>
            <div v-if="mode !== 'map'" class="kw-box">
              <textarea
                id="kw-input"
                v-model="keywordsText"
                class="textarea textarea--dash"
                :class="{ 'is-invalid': mode !== 'regions' && keywordInvalid }"
                rows="6"
                spellcheck="false"
                :placeholder="props.copy.create.placeholder"
                aria-describedby="kw-meta"
                :disabled="submitting"
              ></textarea>
              <div id="kw-meta" class="kw-meta">
                <span>{{ duplicatesText(keywordInfo) }}</span>
                <span class="kw-count" aria-live="polite" :data-state="countOver(keywordInfo) ? 'over' : undefined">{{ countText(keywordInfo) }}</span>
              </div>
            </div>
          </div>
          <OnlineMapInput
            v-if="mapOpened"
            v-show="mode === 'map'"
            :copy="props.copy.create.map"
            :region-copy="props.copy.create.region"
            :disabled="submitting"
            :has-keyword="mapKeywordInfo.unique.length > 0"
            :logical-sample-limit="options.logical_sample_limit"
            @viewports="value => mapViewports = value"
          />
        </div>

        <div v-if="regionOpened" v-show="mode === 'regions'" ref="regionPane" class="region-grid mode-pane">
          <OnlineRegionInput
            :copy="props.copy.create.region"
            :disabled="submitting"
            :reset-key="regionResetKey"
            @generate="generate"
          />
          <div class="region-final">
            <div class="kw-field">
              <label class="field-label" for="region-final">{{ props.copy.create.region.finalQueries }}</label>
              <div class="kw-box">
                <textarea
                  id="region-final"
                  ref="finalEl"
                  v-model="finalText"
                  class="textarea textarea--dash"
                  :class="{ 'is-invalid': mode === 'regions' && keywordInvalid }"
                  rows="8"
                  spellcheck="false"
                  :placeholder="props.copy.create.region.finalPlaceholder"
                  aria-describedby="final-meta"
                  :disabled="submitting"
                ></textarea>
                <div id="final-meta" class="kw-meta">
                  <span>{{ duplicatesText(finalInfo) }}</span>
                  <span class="kw-count" aria-live="polite" :data-state="countOver(finalInfo) ? 'over' : undefined">{{ countText(finalInfo) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示优先级：额度用尽 > 关键词不合法；地图超限与提交失败另行追加 -->
      <div v-if="hasMessages" class="composer-msgs">
        <div v-if="exhausted" class="callout callout--warn">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
          <div class="callout-body">
            <span><b>{{ props.copy.create.exhausted }}</b> {{ props.copy.create.reset }}</span>
            <a class="d-link" :href="props.upgradeHref">
              {{ props.copy.account.upgrade }}<svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-arrow-up-right" /></svg>
            </a>
          </div>
        </div>
        <div v-else-if="keywordInvalid" class="callout callout--bad">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
          <div class="callout-body">{{ mode === 'map' ? props.copy.create.map.invalidKeyword : fill(props.copy.create.invalid, { limit: keywordLimit }) }}</div>
        </div>
        <div v-if="mode === 'map' && overLimit && !exhausted" class="callout callout--bad">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
          <div class="callout-body">{{ fill(props.copy.create.map.overLimit, { limit: options.logical_sample_limit }) }}</div>
        </div>
        <div v-if="submitError" class="callout callout--bad" role="alert">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
          <div class="callout-body">{{ submitError }}</div>
        </div>
      </div>

      <div class="composer-foot">
        <div class="contacts">
          <span class="switch">
            <input
              id="contacts"
              type="checkbox"
              role="switch"
              :checked="contactsAllowed && includeContacts"
              :disabled="!contactsAllowed || submitting"
              :aria-describedby="contactsAllowed ? undefined : 'contacts-hint'"
              @change="toggleContacts"
            />
            <span class="switch-track" aria-hidden="true"></span>
          </span>
          <span class="contacts-text">
            <label class="contacts-label" for="contacts">{{ props.copy.create.contacts }}</label>
            <span v-if="!contactsAllowed" id="contacts-hint" class="contacts-hint">
              {{ props.copy.create.contactsPaid }} <a class="d-link" :href="props.upgradeHref">{{ props.copy.account.upgrade }}</a>
            </span>
          </span>
        </div>
        <div class="foot-actions">
          <div v-if="usageParts" class="usage-mini">
            <div class="usage-mini-text">
              <span>{{ usageParts.before }}<b>{{ usageParts.used }}</b>{{ usageParts.after }}</span>
            </div>
            <div class="meter" :data-level="level || undefined" aria-hidden="true"><i :style="{ '--v': usageRatio }"></i></div>
            <!-- 用尽时提示条已含重置说明，这里只在接近上限时补充 -->
            <span v-if="level === 'warn'" class="d-hint">{{ props.copy.create.reset }}</span>
          </div>
          <button
            class="btn btn-primary btn-sm"
            :class="{ 'is-busy': submitting }"
            type="submit"
            :disabled="blocked && !submitting"
            :aria-busy="submitting ? 'true' : undefined"
          >
            <span v-if="submitting" class="spinner spinner--sm" aria-hidden="true"></span>
            {{ submitting ? props.copy.create.submitting : props.copy.create.submit }}
          </button>
        </div>
      </div>
    </template>

    <div v-else class="composer-err">
      <div class="callout callout--bad" role="alert">
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
        <div class="callout-body">
          <span>{{ props.copy.create.optionsFailed }}</span>
          <button
            class="btn btn-secondary btn-xs"
            :class="{ 'is-busy': state.optionsLoading }"
            type="button"
            :aria-busy="state.optionsLoading ? 'true' : undefined"
            @click="props.workspace.loadOptions()"
          >
            <span v-if="state.optionsLoading" class="spinner spinner--sm" aria-hidden="true"></span>
            <svg v-else class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
            {{ props.copy.shell.retry }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>
