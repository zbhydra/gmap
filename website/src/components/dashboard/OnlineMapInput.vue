<script setup lang="ts">
/**
 * 地图模式：通过区域选择、地图点选或坐标输入设置中心，按半径与网格间距生成搜索视口；
 * 关键词 × 视口即提交条目，总数受 logical_sample_limit 约束，超限时不画网格点。
 *
 * 舞台高度由样式按地图列宽计算；舞台尺寸变化（含从隐藏切回、侧栏收放）后通知 Leaflet 重新计算视口。
 * 覆盖圈、网格点与中心针的颜色走 CSS（随主题切换），不在脚本里取色。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Circle, LayerGroup, LeafletMouseEvent, Map as LeafletMap, Marker } from 'leaflet'
import type { DashboardContent } from '../../i18n/schema'
import { reducedMotion, replayClass } from '../../scripts/dashboard/dom'
import { fill, foldText } from '../../scripts/dashboard/format'
import { gridViewports, type OnlineViewport } from '../../scripts/dashboard/map-grid'
import { loadMapLocations, type MapLocation } from '../../scripts/dashboard/map-locations'
import { closePop, isPopOpen, openPop } from '../../scripts/site/pop'

const props = defineProps<{
  copy: DashboardContent['create']['map']
  regionCopy: DashboardContent['create']['region']
  disabled: boolean
  hasKeyword: boolean
  logicalSampleLimit: number
}>()

const emit = defineEmits<{ viewports: [value: OnlineViewport[]] }>()

/** 连续 4 张瓦片失败才提示，偶发失败不打扰。 */
const TILE_ERROR_THRESHOLD = 4
/** 跨层搜索只渲染前若干条，避免短查询一次铺开上千个按钮。 */
const SEARCH_RESULT_LIMIT = 50

interface LocationEntry {
  path: MapLocation[]
  key: string
  parents: string
}

// type=number 的 v-model 会把可解析的输入转成数字，清空时仍是空字符串
const lat = ref<number | string>('')
const lng = ref<number | string>('')
const radiusKm = ref(5)
const spacingKm = ref(5)
const tilesFailed = ref(false)
const locations = ref<MapLocation[]>([])
const locationQuery = ref('')
const locationPath = ref<MapLocation[]>([])
const locationLevel = ref<0 | 1 | 2>(0)
const locationsLoading = ref(false)
const locationsFailed = ref(false)
const locationExpanded = ref(false)
const locationTrigger = ref<HTMLElement | null>(null)
const locationPop = ref<HTMLElement | null>(null)
const locationSearch = ref<HTMLInputElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLElement | null>(null)
let leaflet: typeof import('leaflet') | null = null
let map: LeafletMap | null = null
let pin: Marker | null = null
let coverage: Circle | null = null
let points: LayerGroup | null = null
let resizeObserver: ResizeObserver | null = null

function coordinate(value: number | string, max: number): number | null {
  const text = String(value).trim()
  if (!text) return null
  const number = Number(text)
  return Number.isFinite(number) && Math.abs(number) <= max ? number : null
}

const latInvalid = computed(() => String(lat.value).trim() !== '' && coordinate(lat.value, 85) === null)
const lngInvalid = computed(() => String(lng.value).trim() !== '' && coordinate(lng.value, 180) === null)
const center = computed(() => {
  const latitude = coordinate(lat.value, 85)
  const longitude = coordinate(lng.value, 180)
  return latitude === null || longitude === null ? null : { lat: latitude, lng: longitude }
})
const viewports = computed(() => center.value ? gridViewports(center.value, radiusKm.value, spacingKm.value) : [])
const total = computed(() => props.hasKeyword ? viewports.value.length : 0)
const overLimit = computed(() => total.value > props.logicalSampleLimit)
const locationName = computed(() => {
  const selected = locationPath.value.at(-1)
  return selected && center.value?.lat === selected.lat && center.value.lng === selected.lng
    ? locationPath.value.map(location => location.name).join(' / ') : ''
})
const locationLevels = computed(() => [
  { level: 0, label: props.regionCopy.country, disabled: false },
  { level: 1, label: props.regionCopy.state, disabled: !locationPath.value[0]?.children.length },
  { level: 2, label: props.regionCopy.city, disabled: !locationPath.value[1]?.children.length }
] as const)
const locationIndex = computed(() => {
  const entries: LocationEntry[] = []
  const visit = (nodes: MapLocation[], parents: MapLocation[]): void => {
    for (const node of nodes) {
      const path = [...parents, node]
      entries.push({ path, key: foldText(node.name), parents: parents.map(location => location.name).join(' / ') })
      visit(node.children, path)
    }
  }
  visit(locations.value, [])
  return entries
})
const locationOptions = computed(() => {
  const choices = locationLevel.value === 0 ? locations.value : (locationPath.value[locationLevel.value - 1]?.children ?? [])
  return choices.map(location => ({ path: [...locationPath.value.slice(0, locationLevel.value), location], parents: '' }))
})
/** 有查询时不受当前层级限制：全量匹配，按全等 > 前缀 > 词首 > 包含排序，同级时上层行政区在前。 */
const locationMatches = computed(() => {
  const query = foldText(locationQuery.value.trim())
  if (!query) return null
  const rank = (key: string): number => key === query ? 0 : key.startsWith(query) ? 1 : key.includes(` ${query}`) ? 2 : 3
  return locationIndex.value
    .filter(entry => entry.key.includes(query))
    .map(entry => ({ entry, rank: rank(entry.key) }))
    .sort((a, b) => a.rank - b.rank || a.entry.path.length - b.entry.path.length || a.entry.key.localeCompare(b.entry.key))
    .slice(0, SEARCH_RESULT_LIMIT)
    .map(({ entry }) => entry)
})
const locationItems = computed(() => locationMatches.value ?? locationOptions.value)

async function fetchLocations(): Promise<void> {
  if (locations.value.length || locationsLoading.value) return
  locationsLoading.value = true
  locationsFailed.value = false
  try {
    locations.value = await loadMapLocations()
  } catch (error) {
    console.error(new Error('online map: locations load failed', { cause: error }))
    locationsFailed.value = true
  } finally {
    locationsLoading.value = false
  }
}

function closeLocations(): void {
  if (locationPop.value && isPopOpen(locationPop.value)) closePop()
}

async function toggleLocations(): Promise<void> {
  const pop = locationPop.value
  const trigger = locationTrigger.value
  if (!pop || !trigger) return
  if (isPopOpen(pop)) {
    closeLocations()
    return
  }
  if (!locationName.value) locationPath.value = []
  locationLevel.value = locationPath.value[1]?.children.length ? 2 : locationPath.value[0]?.children.length ? 1 : 0
  locationQuery.value = ''
  locationExpanded.value = true
  void fetchLocations()
  openPop(pop, {
    trigger,
    anchor: () => trigger.getBoundingClientRect(),
    owns: target => trigger.contains(target),
    side: 'bottom',
    align: 'start',
    matchWidth: 480,
    gap: 4,
    onClose: () => { locationExpanded.value = false }
  })
  await nextTick()
  locationSearch.value?.focus()
}

function changeLocationLevel(level: 0 | 1 | 2): void {
  locationLevel.value = level
  locationQuery.value = ''
}

/** 浏览与搜索共用：path 是从国家到所选节点的完整路径，有下级时进入下一层继续细化。 */
async function selectLocation(path: MapLocation[]): Promise<void> {
  const location = path[path.length - 1]
  locationPath.value = path
  if (location.lat !== null && location.lng !== null) placeCenter(location.lat, location.lng)
  else {
    lat.value = ''
    lng.value = ''
  }
  if (!location.children.length || path.length === 3) {
    closeLocations()
    return
  }
  changeLocationLevel(path.length === 1 ? 1 : 2)
  await nextTick()
  locationSearch.value?.focus()
}

/** 重画覆盖圈与网格点；中心或半径变化时按覆盖圈取景。 */
function redraw(reframe: boolean): void {
  if (!leaflet || !map || !points) return
  points.clearLayers()
  if (!center.value) {
    pin?.remove()
    coverage?.remove()
    pin = null
    coverage = null
    return
  }
  const point = leaflet.latLng(center.value.lat, center.value.lng)
  if (coverage) coverage.setLatLng(point).setRadius(radiusKm.value * 1000)
  else coverage = leaflet.circle(point, { radius: radiusKm.value * 1000, className: 'map-coverage', interactive: false }).addTo(map)
  if (pin) pin.setLatLng(point)
  else {
    pin = leaflet.marker(point, {
      icon: leaflet.divIcon({ className: 'map-marker', html: '<i class="map-pin"></i>', iconSize: [0, 0] }),
      interactive: false,
      keyboard: false
    }).addTo(map)
  }
  if (!overLimit.value) {
    for (const viewport of viewports.value) {
      leaflet.circleMarker([viewport.lat, viewport.lng], { radius: 4, className: 'map-point', interactive: false }).addTo(points)
    }
  }
  if (!reframe) return
  const animate = !reducedMotion()
  if (radiusKm.value < 0.5) map.setView(point, 14, { animate })
  else map.fitBounds(coverage.getBounds(), { padding: [24, 24], animate })
}

function placeCenter(latitude: number, longitude: number): void {
  lat.value = latitude.toFixed(6)
  lng.value = longitude.toFixed(6)
}

onMounted(async () => {
  if (!document.querySelector('link[data-online-map-style]')) {
    const style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = (await import('leaflet/dist/leaflet.css?url')).default
    style.dataset.onlineMapStyle = ''
    document.head.append(style)
  }
  const module = await import('leaflet')
  leaflet = module.default ?? module
  if (!canvasEl.value || !stageEl.value) return
  // 版权说明在舞台下方单独展示（含译文），不用 Leaflet 自带的角标
  map = leaflet.map(canvasEl.value, { center: [20, 0], zoom: 2, attributionControl: false })
  const tiles = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
  let tileErrors = 0
  tiles.on('tileerror', () => {
    tileErrors += 1
    if (tileErrors >= TILE_ERROR_THRESHOLD) tilesFailed.value = true
  })
  tiles.on('tileload', () => {
    tileErrors = 0
    tilesFailed.value = false
  })
  points = leaflet.layerGroup().addTo(map)
  map.on('click', (event: LeafletMouseEvent) => {
    if (!props.disabled) placeCenter(event.latlng.lat, event.latlng.lng)
  })
  resizeObserver = new ResizeObserver(() => map?.invalidateSize())
  resizeObserver.observe(stageEl.value)
  redraw(true)
})

onBeforeUnmount(() => {
  closeLocations()
  resizeObserver?.disconnect()
  map?.remove()
})

watch(center, (next, previous) => {
  const selected = locationPath.value.at(-1)
  if (next && selected && (next.lat !== selected.lat || next.lng !== selected.lng)) locationPath.value = []
  redraw(true)
  // 新放下的针落位一次；坐标输入逐字变化时只移动不重播
  if (next && !previous) {
    const element = pin?.getElement()?.firstElementChild
    if (element) replayClass(element, 'is-placed')
  }
})
watch(radiusKm, () => redraw(true))
watch([spacingKm, overLimit], () => redraw(false))
watch(viewports, value => emit('viewports', value), { immediate: true })
</script>

<template>
  <div class="map-card">
    <div class="map-setup">
      <div class="kw-field">
        <label class="field-label" for="map-location">{{ props.copy.locate }}</label>
        <button
          id="map-location"
          ref="locationTrigger"
          class="input map-location-trigger"
          type="button"
          :aria-label="props.copy.locate"
          aria-describedby="map-location-value"
          aria-haspopup="dialog"
          aria-controls="map-location-pop"
          :aria-expanded="locationExpanded"
          :disabled="props.disabled"
          @click="toggleLocations"
        >
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-locate" /></svg>
          <span id="map-location-value" :class="{ 'is-placeholder': !locationName }">{{ locationName || props.copy.locationPlaceholder }}</span>
          <svg class="icon icon--sm" aria-hidden="true"><use href="/img/icons.svg#i-chevron-down" /></svg>
        </button>
      </div>
      <!-- output 也是可标注元素，for 显式指向滑杆，避免当前值混入控件名称。 -->
      <div class="map-controls">
        <label class="mini-field" for="map-radius">
          <span class="mini-label">{{ props.copy.radius }}<output for="map-radius" aria-hidden="true">{{ radiusKm }}</output></span>
          <input id="map-radius" v-model.number="radiusKm" class="range" type="range" min="0" max="50" step="1" :disabled="props.disabled" />
        </label>
        <label class="mini-field" for="map-spacing">
          <span class="mini-label">{{ props.copy.spacing }}<output for="map-spacing" aria-hidden="true">{{ spacingKm }}</output></span>
          <input id="map-spacing" v-model.number="spacingKm" class="range" type="range" min="1" max="20" step="1" :disabled="props.disabled" />
        </label>
      </div>
      <details class="map-coordinates">
        <summary>{{ props.copy.coordinates }}</summary>
        <div class="map-controls">
          <label class="mini-field" for="map-lat">
            <span class="mini-label">{{ props.copy.latitude }}</span>
            <input
              id="map-lat"
              v-model="lat"
              class="input input--sm input--mono"
              :class="{ 'is-invalid': latInvalid }"
              type="number"
              min="-85"
              max="85"
              step="any"
              inputmode="decimal"
              :disabled="props.disabled"
            />
          </label>
          <label class="mini-field" for="map-lng">
            <span class="mini-label">{{ props.copy.longitude }}</span>
            <input
              id="map-lng"
              v-model="lng"
              class="input input--sm input--mono"
              :class="{ 'is-invalid': lngInvalid }"
              type="number"
              min="-180"
              max="180"
              step="any"
              inputmode="decimal"
              :disabled="props.disabled"
            />
          </label>
        </div>
      </details>
    </div>
    <div class="map-preview">
      <div ref="stageEl" class="map-stage">
        <div ref="canvasEl" class="map-canvas" :aria-label="props.copy.mapLabel"></div>
      </div>
      <div v-if="tilesFailed" class="callout callout--warn" role="status">
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
        <div class="callout-body"><span>{{ props.copy.tilesUnavailable }}</span></div>
      </div>
      <div class="map-sum" aria-live="polite">
        <span class="map-sum-calc">{{
          center ? fill(props.copy.points, { points: viewports.length }) : props.copy.chooseCenter
        }}</span>
        <span class="map-sum-total" :data-state="overLimit ? 'over' : undefined">{{
          fill(props.copy.sampleCount, { count: total, limit: props.logicalSampleLimit })
        }}</span>
      </div>
      <p class="attribution">
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{{ props.copy.attribution }}</a>
      </p>
    </div>
    <div
      id="map-location-pop"
      ref="locationPop"
      class="pop map-location-pop"
      popover="manual"
      role="dialog"
      :aria-label="props.copy.locate"
      @keydown.esc.stop.prevent="closeLocations"
    >
      <div class="map-location-levels" role="group" :aria-label="props.copy.locate">
        <button
          v-for="item in locationLevels"
          :key="item.level"
          class="map-location-level"
          type="button"
          :aria-pressed="locationLevel === item.level"
          :disabled="item.disabled"
          :title="locationPath[item.level]?.name"
          @click="changeLocationLevel(item.level)"
        >{{ item.label }}</button>
      </div>
      <div class="map-location-search">
        <input
          ref="locationSearch"
          v-model="locationQuery"
          class="input input--sm"
          type="search"
          autocomplete="off"
          spellcheck="false"
          :aria-label="props.copy.locationSearch"
          :placeholder="props.copy.locationSearch"
          @keydown.enter.prevent
        />
      </div>
      <p v-if="locationsLoading" class="map-location-status" role="status">{{ props.regionCopy.loading }}</p>
      <div v-else-if="locationsFailed" class="map-location-status" role="alert">
        <span>{{ props.regionCopy.loadFailed }}</span>
        <button class="btn btn-secondary btn-xs" type="button" @click="fetchLocations">{{ props.regionCopy.retry }}</button>
      </div>
      <div v-else class="map-location-list" :class="{ 'is-search': locationMatches }">
        <button
          v-for="item in locationItems"
          :key="item.path.map(location => location.name).join('\u0000')"
          class="pop-item"
          :class="{ 'is-current': locationPath[item.path.length - 1] === item.path.at(-1) }"
          type="button"
          :title="item.parents ? `${item.path.at(-1)?.name} · ${item.parents}` : item.path.at(-1)?.name"
          @click="selectLocation(item.path)"
        >
          <span class="pop-item-label">{{ item.path.at(-1)?.name }}</span>
          <span v-if="item.parents" class="pop-item-sub">{{ item.parents }}</span>
          <svg v-if="item.path.at(-1)?.children.length" class="icon icon--sm" aria-hidden="true"><use href="/img/icons.svg#i-chevron-right" /></svg>
        </button>
        <p v-if="!locationItems.length" class="map-location-status">{{ props.regionCopy.noMatch }}</p>
      </div>
    </div>
  </div>
</template>
