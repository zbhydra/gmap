<script setup lang="ts">
/**
 * 首页首屏交互区：搜索命令条 + 信任条 + 预览结果表 + 产品剧场，014 首页预览合同里唯一的预览状态 owner。
 *
 * - 演示：剧场循环「输入关键词 → pin 落点 → 扫描命中 → 行入列 → 导出」，数据是 home-samples.ts 的虚构样例；
 *   离屏 / 后台暂停，减弱动效下停在终态。预览不接管剧场，演示照常循环。
 * - 预览：提交或点建议词后在信任条下方展开结果表，请求真实匿名首屏接口；只展示服务端返回的最多 3 行，其余由
 *   占位行表达（不下发、不遮挡未授权数据），数量只称本次首屏条数，并给出登录引导。
 * - 匿名关键词与结果只在内存：登录、pagehide 时清空，不写存储或 URL；已登录用户首屏改为 Dashboard 入口。
 *
 * 剧场外层 .hero-stage 由站级动效加 is-revealed（data-reveal-onload），用 data-allow-mismatch 放过水合比对；
 * motion.ts 顶层依赖浏览器 API，SSR 渲染时不能静态导入，按需动态加载（与 Layout 共用同一模块实例）。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Locale } from '../../i18n/content'
import type { HomePageContent } from '../../i18n/schema'
import { previewKeyword, type PreviewResult, type PreviewRow } from '../../scripts/homepage/preview'
import { getSiteSession } from '../../scripts/site/session'
import { SITE_AUTH_SUCCESS_EVENT } from '../auth/site-auth-controller'
import { PIN_SPOTS, THEATER_DATASETS, theaterRow, type TheaterDataset } from './home-samples'

type Motion = typeof import('../../scripts/site/motion')
type PanelMode = 'idle' | 'running' | 'done'
type ChipKey = 'email' | 'rating' | 'id'

interface PanelRow {
  key: number
  icon: string
  name: string
  meta: string
  rating: string
  fresh: boolean
}

interface Pin {
  key: number
  x: number
  y: number
  active: boolean
}

interface PreviewState {
  status: 'loading' | 'failed' | 'empty' | 'result'
  keyword: string
  count: number
  rows: PreviewRow[]
}

const props = defineProps<{
  copy: HomePageContent['hero']
  locale: Locale
  /** 已登录入口与登录后回跳：当前语言的 Dashboard。 */
  dashboardUrl: string
}>()

const SUGGEST_ICONS = ['coffee', 'sparkles', 'wrench']
const MAX_ROWS = 9
const MAX_LOCKED_ROWS = 4

const numberFormat = new Intl.NumberFormat(props.locale)
const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
const icon = (name: string) => `/img/icons.svg#i-${name}`
const mapsUrl = (keyword: string) => `google.com/maps/search/${encodeURIComponent(keyword.toLowerCase()).replace(/%20/g, '+')}`

const firstDataset = THEATER_DATASETS[0]
const firstRow = theaterRow(firstDataset, 0)

const keyword = ref('')
const loading = ref(false)
const signedIn = ref(false)
const mode = ref<PanelMode>('idle')
const badge = ref(props.copy.theater.live)
const runCount = ref(0)
const total = ref(0)
const progress = ref(0)
const kpis = ref({ phones: 0, emails: 0, websites: 0 })
const exportCount = ref(0)
const exportState = ref<'' | 'is-ready' | 'is-pressed'>('')
const toastOn = ref(false)
const toastFile = ref('')
const query = ref(firstDataset.keyword)
const queryTyping = ref(false)
const url = ref(mapsUrl(firstDataset.keyword))
const startPressed = ref(false)
const scanOn = ref(false)
const pins = ref<Pin[]>([])
const pinsLeaving = ref(false)
const rows = ref<PanelRow[]>([])
const preview = ref<PreviewState | null>(null)
const chips = ref<Record<ChipKey, string>>({
  email: firstRow.email,
  rating: fill(props.copy.theater.ratingValue, { rating: firstRow.rating, reviews: numberFormat.format(firstRow.reviews) }),
  id: `${firstRow.placeId.slice(0, 16)}…`
})
const chipUpdating = ref<Record<ChipKey, boolean>>({ email: false, rating: false, id: false })

const stage = ref<HTMLElement | null>(null)
const map = ref<HTMLElement | null>(null)
const scan = ref<HTMLElement | null>(null)
const results = ref<HTMLElement | null>(null)

const typing = JSON.stringify(props.copy.search.typing)
const extractingParts = computed(() => props.copy.theater.extracting.split('{count}'))
const panelClass = computed(() => ({
  'is-running': mode.value === 'running',
  'is-done': mode.value === 'done'
}))
const lockedRows = computed(() =>
  preview.value?.status === 'result' ? Math.min(preview.value.count - preview.value.rows.length, MAX_LOCKED_ROWS) : 0)

let runId = 0
let previewId = 0
let rowKey = 0
let pinKey = 0
let visible = false
let unmounted = false
let stopInView: (() => void) | null = null
let motionPromise: Promise<Motion> | null = null
const wakeups: Array<() => void> = []

const loadMotion = () => (motionPromise ??= import('../../scripts/site/motion'))

function whenVisible(): Promise<void> {
  return visible ? Promise.resolve() : new Promise(resolve => wakeups.push(resolve))
}

function today(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function setKpis(count: number): void {
  // 演示数据的补全比例（虚构）：电话 94%、邮箱 61%、官网 90%
  kpis.value = { phones: Math.round(count * 0.94), emails: Math.round(count * 0.61), websites: Math.round(count * 0.9) }
  exportCount.value = count
}

function resetPanel(keywordText: string): void {
  pins.value = []
  pinsLeaving.value = false
  rows.value = []
  toastOn.value = false
  exportState.value = ''
  scanOn.value = false
  if (scan.value) scan.value.style.translate = ''
  progress.value = 0
  setKpis(0)
  badge.value = props.copy.theater.live
  mode.value = 'idle'
  startPressed.value = false
  query.value = ''
  queryTyping.value = false
  url.value = mapsUrl(keywordText)
}

function addRow(row: Omit<PanelRow, 'key' | 'fresh'>, append: boolean): void {
  const key = ++rowKey
  const next = { ...row, key, fresh: !append }
  rows.value = append ? [...rows.value, next] : [next, ...rows.value].slice(0, MAX_ROWS)
  if (append) return
  window.setTimeout(() => {
    const target = rows.value.find(item => item.key === key)
    if (target) target.fresh = false
  }, 900)
}

function updateChip(key: ChipKey, text: string): void {
  chipUpdating.value[key] = true
  window.setTimeout(() => {
    chips.value[key] = text
    chipUpdating.value[key] = false
  }, 220)
}

async function typeQuery(m: Motion, text: string, isAlive: () => boolean, speed: number): Promise<void> {
  queryTyping.value = true
  for (let index = 1; index <= text.length; index++) {
    if (!isAlive()) return
    query.value = text.slice(0, index)
    if (speed) await m.wait(speed + Math.random() * speed)
  }
  if (speed) await m.wait(300)
  queryTyping.value = false
}

async function dropPins(m: Motion, count: number, isAlive: () => boolean, gap: number): Promise<void> {
  for (let index = 0; index < count; index++) {
    if (!isAlive()) return
    const [x, y] = PIN_SPOTS[index]
    pins.value.push({ key: ++pinKey, x, y, active: false })
    if (gap) await m.wait(gap)
  }
  if (gap) await m.wait(500)
}

/** 扫描光束匀速扫过地图；右缘经过 pin 时按 x 顺序依次命中。 */
function sweep(duration: number, isAlive: () => boolean, onHit: (pin: Pin, index: number, count: number) => void): Promise<void> {
  const width = map.value?.clientWidth ?? 0
  const beam = scan.value
  const order = pins.value.map(pin => ({ pin, x: (pin.x / 100) * width })).sort((a, b) => a.x - b.x)
  let hit = 0
  scanOn.value = true
  return new Promise(resolve => {
    const start = performance.now()
    const frame = (now: number) => {
      if (!isAlive()) return resolve()
      const elapsed = Math.min(1, (now - start) / duration)
      const edge = -10 + elapsed * (width + 20)
      if (beam) beam.style.translate = `${edge - 160}px 0`
      while (hit < order.length && order[hit].x <= edge) {
        onHit(order[hit].pin, hit, order.length)
        hit++
      }
      if (elapsed < 1) requestAnimationFrame(frame)
      else {
        scanOn.value = false
        resolve()
      }
    }
    requestAnimationFrame(frame)
  })
}

async function playExtraction(m: Motion, dataset: TheaterDataset, id: number): Promise<void> {
  const isAlive = () => id === runId
  await whenVisible()
  if (!isAlive()) return
  resetPanel(dataset.keyword)
  await m.wait(500)
  await typeQuery(m, dataset.keyword, isAlive, 45)
  if (!isAlive()) return
  await dropPins(m, PIN_SPOTS.length, isAlive, 90)
  if (!isAlive()) return
  startPressed.value = true
  await m.wait(380)
  if (!isAlive()) return
  mode.value = 'running'
  runCount.value = 0
  await sweep(6200, isAlive, (pin, index, count) => {
    pin.active = true
    const row = theaterRow(dataset, index)
    addRow({ icon: dataset.icon, name: row.name, meta: `${dataset.category} · ${row.phone}`, rating: row.rating }, false)
    const collected = Math.round((dataset.total * (index + 1)) / count)
    runCount.value = collected
    progress.value = (index + 1) / count
    setKpis(collected)
    if (index % 3 === 0 && row.email) updateChip('email', row.email)
    if (index % 3 === 1) updateChip('rating', fill(props.copy.theater.ratingValue, { rating: row.rating, reviews: numberFormat.format(row.reviews) }))
    if (index % 3 === 2) updateChip('id', `${row.placeId.slice(0, 16)}…`)
  })
  if (!isAlive()) return
  mode.value = 'done'
  total.value = dataset.total
  badge.value = props.copy.theater.done
  exportState.value = 'is-ready'
  await m.wait(1200)
  if (!isAlive()) return
  exportState.value = 'is-pressed'
  await m.wait(160)
  exportState.value = ''
  // 与插件 export/csv.ts 的 buildSearchExportFilename 同格式：前缀-条数-关键词（空格转 +）-日期
  toastFile.value = `MapsGrab-Extractor-${dataset.total}-${dataset.keyword.replace(/ /g, '+')}-${today()}.csv`
  toastOn.value = true
  await m.wait(2800)
  if (!isAlive()) return
  toastOn.value = false
  pinsLeaving.value = true
  await m.wait(600)
}

/** 减弱动效：停在第一组样例的完成态。 */
function showStaticDemo(): void {
  const dataset = firstDataset
  resetPanel(dataset.keyword)
  query.value = dataset.keyword
  pins.value = PIN_SPOTS.map(([x, y], index) => ({ key: ++pinKey, x, y, active: index < 9 }))
  for (let index = 0; index < 7; index++) {
    const row = theaterRow(dataset, index)
    addRow({ icon: dataset.icon, name: row.name, meta: `${dataset.category} · ${row.phone}`, rating: row.rating }, true)
  }
  mode.value = 'done'
  total.value = dataset.total
  badge.value = props.copy.theater.done
  progress.value = 1
  setKpis(dataset.total)
}

async function startDemo(): Promise<void> {
  const id = ++runId
  const m = await loadMotion()
  if (id !== runId) return
  if (m.reducedMotion()) return showStaticDemo()
  for (let index = 0; id === runId; index++) {
    await playExtraction(m, THEATER_DATASETS[index % THEATER_DATASETS.length], id)
  }
}

async function runPreview(value: string): Promise<void> {
  const id = ++previewId
  loading.value = true
  preview.value = { status: 'loading', keyword: value, count: 0, rows: [] }
  await nextTick()
  const box = results.value?.getBoundingClientRect()
  if (box && box.bottom > innerHeight) {
    const m = await loadMotion()
    results.value?.scrollIntoView({ behavior: m.reducedMotion() ? 'auto' : 'smooth', block: 'nearest' })
  }
  let result: PreviewResult
  try {
    result = await previewKeyword(value)
  } catch (error) {
    console.error(new Error('homepage preview: search failed', { cause: error }))
    if (id !== previewId) return
    preview.value = { status: 'failed', keyword: value, count: 0, rows: [] }
    loading.value = false
    return
  }
  if (id !== previewId) return
  preview.value = { status: result.count ? 'result' : 'empty', keyword: value, count: result.count, rows: result.rows }
  loading.value = false
}

function submit(): void {
  if (loading.value) return
  const value = keyword.value.trim() || props.copy.search.typing[0]
  keyword.value = value
  void runPreview(value)
}

function suggest(value: string): void {
  if (loading.value) return
  keyword.value = value
  void runPreview(value)
}

/** 清空匿名关键词与结果（含进行中的请求）。 */
function clearPreview(): void {
  previewId++
  keyword.value = ''
  preview.value = null
  loading.value = false
}

function signIn(): void {
  clearPreview()
  window.siteAuthController?.open({ redirectTo: props.dashboardUrl })
}

async function restoreSession(): Promise<void> {
  const session = await getSiteSession()
  signedIn.value = session.status !== 'signed-out'
  if (signedIn.value) clearPreview()
}

onMounted(async () => {
  window.addEventListener(SITE_AUTH_SUCCESS_EVENT, restoreSession)
  window.addEventListener('pagehide', clearPreview)
  void restoreSession()
  const m = await loadMotion()
  if (unmounted || !stage.value) return
  stopInView = m.inView(stage.value, active => {
    visible = active
    if (active) wakeups.splice(0).forEach(resolve => resolve())
  }, { once: false, threshold: 0.15 })
  void startDemo()
})

onBeforeUnmount(() => {
  unmounted = true
  runId++
  stopInView?.()
  window.removeEventListener(SITE_AUTH_SUCCESS_EVENT, restoreSession)
  window.removeEventListener('pagehide', clearPreview)
})
</script>

<template>
  <div class="hero-live">
    <div class="container hero-copy hero-copy--live">
      <form v-if="!signedIn" class="hero-search" data-enter style="--enter-delay: 270ms" autocomplete="off" @submit.prevent="submit">
        <div class="searchbar">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-search" /></svg>
          <label class="sr-only" for="hero-q">{{ copy.search.label }}</label>
          <input id="hero-q" v-model="keyword" type="text" maxlength="500" enterkeyhint="search" :disabled="loading" :data-typing="typing" />
          <span class="kbd hide-md" aria-hidden="true">↵</span>
          <button class="btn btn-primary" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            <span class="hero-submit-label">{{ loading ? copy.search.loading : copy.search.submit }}</span>
            <svg v-if="!loading" class="icon icon-arrow" aria-hidden="true"><use href="/img/icons.svg#i-arrow-right" /></svg>
          </button>
        </div>
        <div class="hero-suggest" data-inview>
          <span class="hero-suggest-label">{{ copy.search.suggestLabel }}</span>
          <button
            v-for="(suggestion, index) in copy.search.suggestions"
            :key="suggestion"
            class="chip"
            :class="{ 'hide-md': index === 2 }"
            type="button"
            :disabled="loading"
            @click="suggest(suggestion)"
          >
            <svg class="icon" aria-hidden="true"><use :href="icon(SUGGEST_ICONS[index] ?? 'search')" /></svg>{{ suggestion }}
          </button>
        </div>
      </form>
      <div v-else class="hero-search hero-search--member">
        <a class="btn btn-primary btn-lg" :href="dashboardUrl">
          {{ copy.dashboard }}<svg class="icon icon-arrow" aria-hidden="true"><use href="/img/icons.svg#i-arrow-right" /></svg>
        </a>
      </div>
      <p class="sr-only" role="status">{{ loading ? copy.search.loading : '' }}</p>

      <ul class="hero-trust" role="list" data-enter style="--enter-delay: 360ms">
        <li v-for="item in copy.trust" :key="item">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-check" /></svg>{{ item }}
        </li>
      </ul>
    </div>

    <!-- 预览结果表：服务端最多 3 行 + 占位锁定行（不承载数据）+ 登录引导 -->
    <section v-if="preview" ref="results" class="container hero-results" :aria-label="copy.preview.title">
      <div class="hero-results-card">
        <div class="hero-results-head">
          <span class="icon-tile icon-tile--brand"><svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-table" /></svg></span>
          <div class="hero-results-heading">
            <h2 class="hero-results-title">{{ copy.preview.title }}</h2>
            <p class="hero-results-sub">
              <span class="hero-results-keyword">{{ preview.keyword }}</span>
              <template v-if="preview.status === 'result'"> · {{ fill(copy.preview.count, { count: numberFormat.format(preview.count) }) }}</template>
            </p>
          </div>
          <div v-if="preview.status === 'result'" class="hero-results-actions">
            <button class="btn btn-primary btn-sm" type="button" @click="signIn">
              {{ copy.preview.signIn }}<svg class="icon icon-arrow" aria-hidden="true"><use href="/img/icons.svg#i-arrow-right" /></svg>
            </button>
          </div>
        </div>

        <p v-if="preview.status === 'failed'" class="hero-results-message" role="alert">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-info" /></svg>{{ copy.preview.failed }}
        </p>
        <p v-else-if="preview.status === 'empty'" class="hero-results-message" role="status">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-search" /></svg>{{ copy.preview.empty }}
        </p>
        <div v-else class="dtable-wrap hero-results-table">
          <table class="dtable">
            <thead>
              <tr>
                <th scope="col">{{ copy.preview.columns.name }}</th>
                <th scope="col">{{ copy.preview.columns.address }}</th>
                <th scope="col">{{ copy.preview.columns.category }}</th>
                <th scope="col">{{ copy.preview.columns.rating }}</th>
                <th scope="col" class="cell-num">{{ copy.preview.columns.reviews }}</th>
                <th scope="col">{{ copy.preview.columns.phone }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="preview.status === 'loading'">
                <tr v-for="index in 3" :key="`skeleton-${index}`" aria-hidden="true">
                  <td v-for="cell in 6" :key="cell"><span class="skel"></span></td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="(row, index) in preview.rows" :key="index" data-preview-row>
                  <td class="cell-strong cell-clip" :title="row.name">{{ row.name }}</td>
                  <td class="cell-clip" :title="row.address ?? undefined">{{ row.address ?? '—' }}</td>
                  <td class="cell-clip" :title="row.category ?? undefined">{{ row.category ?? '—' }}</td>
                  <td>
                    <span v-if="row.rating !== null" class="rating"><svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-star" /></svg>{{ row.rating.toFixed(1) }}</span>
                    <template v-else>—</template>
                  </td>
                  <td class="cell-num">{{ row.review_count === null ? '—' : numberFormat.format(row.review_count) }}</td>
                  <td class="cell-mono">{{ row.phone ?? '—' }}</td>
                </tr>
                <tr
                  v-for="index in lockedRows"
                  :key="`locked-${index}`"
                  class="is-locked"
                  :style="{ opacity: 0.65 - (index - 1) * 0.15 }"
                  aria-hidden="true"
                  data-preview-locked
                >
                  <td v-for="cell in 6" :key="cell"><span class="lock-line"></span></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <p v-if="preview.status === 'result'" class="hero-results-note">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-lock" /></svg>{{ copy.preview.locked }}
        </p>
      </div>
    </section>

    <div class="container-wide hero-stage-wrap">
      <div ref="stage" class="hero-stage" data-reveal="rise" data-reveal-onload="650" data-allow-mismatch="class">
        <div class="browser stage-frame">
          <div class="browser-bar">
            <div class="win-dots" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="browser-url">
              <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-lock" /></svg>
              <span>{{ url }}</span>
            </div>
            <span class="stage-ext" :title="copy.theater.extensionActive">
              <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-puzzle" /></svg>
              <i class="ext-dot"></i>
            </span>
          </div>

          <div class="stage-body">
            <!-- 风格化地图（纯 SVG，颜色全部走 --map-* token） -->
            <div ref="map" class="stage-map">
              <svg class="map-svg" viewBox="0 0 860 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                  <clipPath id="clip-west"><path d="M-10 -10H262C250 80 300 150 282 230C266 300 214 360 226 440C236 500 262 530 254 580H-10Z" /></clipPath>
                  <clipPath id="clip-east"><path d="M326 -10C312 80 362 150 348 230C334 300 284 370 292 430C300 480 326 520 318 580H880V-10Z" /></clipPath>
                </defs>
                <rect class="m-land" width="860" height="560" />
                <g class="m-streets" clip-path="url(#clip-east)">
                  <path d="M380 0V560M432 0V560M484 0V560M536 0V560M588 0V560M640 0V560M692 0V560M744 0V560M796 0V560M848 0V560" />
                  <path d="M300 30H860M300 76H860M300 122H860M300 214H860M300 260H860M300 306H860M300 352H860M300 444H860M300 490H860M300 536H860" />
                </g>
                <g class="m-streets" clip-path="url(#clip-west)">
                  <g transform="rotate(-9 130 280)">
                    <path d="M-60 -40V620M-20 -40V620M20 -40V620M60 -40V620M100 -40V620M140 -40V620M180 -40V620M220 -40V620M260 -40V620M300 -40V620" />
                    <path d="M-80 20H340M-80 60H340M-80 100H340M-80 140H340M-80 180H340M-80 220H340M-80 260H340M-80 300H340M-80 340H340M-80 380H340M-80 420H340M-80 460H340M-80 500H340M-80 540H340" />
                  </g>
                </g>
                <path class="m-park" d="M598 86c0-10 8-18 18-18h112c10 0 18 8 18 18v58c0 10-8 18-18 18H616c-10 0-18-8-18-18z" />
                <path class="m-park" d="M668 396c18-40 92-46 118-14 24 30 8 82-34 96-46 14-102-36-84-82z" />
                <path class="m-park" d="M226 300c10-36 26-52 40-70l6 6c-14 22-26 40-32 66-6 30-14 64-6 100l-10 2c-8-36-6-70 2-104z" />
                <path class="m-park" d="M64 440c0-12 10-22 22-22h50c12 0 22 10 22 22v26c0 12-10 22-22 22H86c-12 0-22-10-22-22z" />
                <path class="m-water" d="M262 -10C250 80 300 150 282 230C266 300 214 360 226 440C236 500 262 530 254 580H318C326 520 300 480 292 430C284 370 334 300 348 230C362 150 312 80 326 -10Z" />
                <path class="m-water-edge draw" pathLength="1" d="M262 -10C250 80 300 150 282 230C266 300 214 360 226 440C236 500 262 530 254 580" />
                <path class="m-water-edge draw" pathLength="1" d="M326 -10C312 80 362 150 348 230C334 300 284 370 292 430C300 480 326 520 318 580" />
                <g class="m-major">
                  <path class="casing" d="M-10 168H870" />
                  <path class="casing" d="M-10 398H870" />
                  <path class="casing" d="M366 -10C378 120 358 260 378 340C398 420 366 500 378 580" />
                  <path class="casing" d="M486 168C560 120 700 40 790 -10" />
                  <path class="road draw" pathLength="1" d="M-10 168H870" />
                  <path class="road draw" pathLength="1" d="M-10 398H870" />
                  <path class="road draw" pathLength="1" d="M366 -10C378 120 358 260 378 340C398 420 366 500 378 580" />
                  <path class="road draw" pathLength="1" d="M486 168C560 120 700 40 790 -10" />
                </g>
                <g class="m-labels">
                  <text x="560" y="160">E BURNSIDE ST</text>
                  <text x="470" y="390">SE HAWTHORNE BLVD</text>
                  <text x="640" y="72" class="m-label-sm">LAURELHURST PARK</text>
                  <text x="702" y="440" class="m-label-sm">MT TABOR</text>
                  <text x="70" y="120" class="m-district">PEARL</text>
                  <text x="62" y="300" class="m-district">DOWNTOWN</text>
                  <text x="604" y="122" transform="rotate(-27 604 122)" class="m-label-sm">NE SANDY BLVD</text>
                  <text class="m-water-label" transform="translate(296 330) rotate(-78)">WILLAMETTE RIVER</text>
                </g>
              </svg>

              <div class="map-search" aria-hidden="true">
                <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-search" /></svg>
                <span class="map-query" :class="{ 'is-typing': queryTyping }">{{ query }}</span>
              </div>
              <div class="map-filters" aria-hidden="true">
                <span v-for="filter in copy.theater.mapFilters" :key="filter">{{ filter }}</span>
              </div>
              <div class="map-pins" :class="{ 'is-leaving': pinsLeaving }" aria-hidden="true">
                <i
                  v-for="pin in pins"
                  :key="pin.key"
                  class="map-pin is-dropped"
                  :class="{ 'is-active': pin.active }"
                  :style="{ '--x': `${pin.x}%`, '--y': `${pin.y}%` }"
                ><span class="pin-ring"></span></i>
              </div>
              <div ref="scan" class="map-scan" :class="{ 'is-on': scanOn }" aria-hidden="true"></div>
              <div class="map-zoom" aria-hidden="true"><span>+</span><span>−</span></div>
            </div>

            <aside class="mgp stage-panel" :class="panelClass" :aria-label="copy.theater.panelLabel">
              <div class="mgp-head">
                <slot name="brand" />
                <span class="mgp-title">MapsGrab</span>
                <span class="badge badge--ok panel-live"><span class="dot dot--live"></span><span>{{ badge }}</span></span>
              </div>
              <div class="mgp-status">
                <div class="mgp-status-row">
                  <span class="panel-state">
                    <span v-if="mode === 'idle'" class="mgp-start" :class="{ 'is-pressed': startPressed }">
                      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-play" /></svg>{{ copy.theater.start }}
                    </span>
                    <span v-else-if="mode === 'running'">{{ extractingParts[0] }}<b>{{ runCount }}</b>{{ extractingParts[1] }}</span>
                    <template v-else>
                      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-check-circle" /></svg>
                      <span>{{ fill(copy.theater.finished, { count: total }) }}</span>
                    </template>
                  </span>
                  <span class="mgp-pause" aria-hidden="true">
                    <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-pause" /></svg>{{ copy.theater.pause }}
                  </span>
                </div>
                <div class="progress"><i :style="{ '--p': `${Math.round(progress * 100)}%` }"></i></div>
                <div class="mgp-kpis">
                  <span><b>{{ kpis.phones }}</b> {{ copy.theater.kpis.phones }}</span>
                  <span><b>{{ kpis.emails }}</b> {{ copy.theater.kpis.emails }}</span>
                  <span><b>{{ kpis.websites }}</b> {{ copy.theater.kpis.websites }}</span>
                </div>
              </div>
              <div class="mgp-list">
                <div v-for="row in rows" :key="row.key" class="mgp-row" :class="{ 'is-new': row.fresh }">
                  <span class="mgp-avatar"><svg class="icon" aria-hidden="true"><use :href="icon(row.icon)" /></svg></span>
                  <div class="mgp-copy">
                    <div class="mgp-name">{{ row.name }}</div>
                    <div class="mgp-meta">{{ row.meta }}</div>
                  </div>
                  <span class="rating"><svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-star" /></svg>{{ row.rating }}</span>
                </div>
              </div>

              <div class="mgp-foot">
                <button class="btn btn-primary" :class="exportState" type="button" tabindex="-1" aria-hidden="true">
                  <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-download" /></svg>
                  <span>{{ fill(copy.theater.export, { count: exportCount }) }}</span>
                </button>
              </div>
              <div class="panel-toast" :class="{ 'is-on': toastOn }" aria-hidden="true">
                <span class="toast-icon"><svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-check" /></svg></span>
                <div>
                  <div class="toast-title">{{ copy.theater.exportSaved }}</div>
                  <div class="toast-desc mono">{{ toastFile }}</div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <!-- 剧场周边浮动数据卡（视差 + 漂浮） -->
        <div class="float-chip fc-email floaty" :class="{ 'is-updating': chipUpdating.email }" data-parallax="0.05" aria-hidden="true">
          <span class="icon-tile icon-tile--ok"><svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-mail" /></svg></span>
          <span><small>{{ copy.theater.emailFound }}</small><span class="fc-value">{{ chips.email }}</span></span>
        </div>
        <div class="float-chip fc-rating floaty" :class="{ 'is-updating': chipUpdating.rating }" data-parallax="-0.04" aria-hidden="true">
          <span class="icon-tile icon-tile--pin"><svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-star" /></svg></span>
          <span><small>{{ copy.theater.averageRating }}</small><span class="fc-value">{{ chips.rating }}</span></span>
        </div>
        <div class="float-chip fc-id floaty" :class="{ 'is-updating': chipUpdating.id }" data-parallax="0.07" aria-hidden="true">
          <span class="icon-tile"><svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-hash" /></svg></span>
          <span><small>{{ copy.theater.placeId }}</small><span class="fc-value mono">{{ chips.id }}</span></span>
        </div>
      </div>
    </div>
  </div>
</template>
