<script setup lang="ts">
/**
 * 地图模式：在 Leaflet + OSM 瓦片上选中心点（点地图或输入坐标），按半径与网格间距生成搜索视口；
 * 关键词 × 视口即提交条目，总数受 logical_sample_limit 约束，超限时不画网格点。
 *
 * 舞台高度由样式按地图列宽计算；舞台尺寸变化（含从隐藏切回、侧栏收放）后通知 Leaflet 重新计算视口。
 * 覆盖圈、网格点与中心针的颜色走 CSS（随主题切换），不在脚本里取色。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Circle, LayerGroup, LeafletMouseEvent, Map as LeafletMap, Marker } from 'leaflet'
import type { DashboardContent } from '../../i18n/schema'
import { reducedMotion, replayClass } from '../../scripts/dashboard/dom'
import { fill } from '../../scripts/dashboard/format'
import { gridViewports, type OnlineViewport } from '../../scripts/dashboard/map-grid'

const props = defineProps<{
  copy: DashboardContent['create']['map']
  disabled: boolean
  keywordCount: number
  logicalSampleLimit: number
}>()

const emit = defineEmits<{ viewports: [value: OnlineViewport[]] }>()

/** 连续 4 张瓦片失败才提示，偶发失败不打扰。 */
const TILE_ERROR_THRESHOLD = 4

// type=number 的 v-model 会把可解析的输入转成数字，清空时仍是空字符串
const lat = ref<number | string>('')
const lng = ref<number | string>('')
const radiusKm = ref(5)
const spacingKm = ref(5)
const tilesFailed = ref(false)
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
const total = computed(() => props.keywordCount * viewports.value.length)
const overLimit = computed(() => total.value > props.logicalSampleLimit)

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
  resizeObserver?.disconnect()
  map?.remove()
})

watch(center, (next, previous) => {
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
    <div ref="stageEl" class="map-stage">
      <div ref="canvasEl" class="map-canvas" :aria-label="props.copy.mapLabel"></div>
      <span v-if="!center" class="map-hint">
        <svg class="icon icon--sm" aria-hidden="true"><use href="/img/icons.svg#i-locate" /></svg>{{ props.copy.chooseCenter }}
      </span>
    </div>
    <div v-if="tilesFailed" class="callout callout--warn" role="status">
      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
      <div class="callout-body"><span>{{ props.copy.tilesUnavailable }}</span></div>
    </div>
    <!-- 滑杆的 label 里还有显示当前值的 output（也是可标注元素）：用 for 显式指向输入框，值由滑杆自身播报 -->
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
      <label class="mini-field" for="map-radius">
        <span class="mini-label">{{ props.copy.radius }}<output for="map-radius" aria-hidden="true">{{ radiusKm }}</output></span>
        <input id="map-radius" v-model.number="radiusKm" class="range" type="range" min="0" max="50" step="1" :disabled="props.disabled" />
      </label>
      <label class="mini-field" for="map-spacing">
        <span class="mini-label">{{ props.copy.spacing }}<output for="map-spacing" aria-hidden="true">{{ spacingKm }}</output></span>
        <input id="map-spacing" v-model.number="spacingKm" class="range" type="range" min="1" max="20" step="1" :disabled="props.disabled" />
      </label>
    </div>
    <div class="map-sum" aria-live="polite">
      <span class="map-sum-calc">{{
        center ? fill(props.copy.points, { points: viewports.length, keywords: props.keywordCount }) : props.copy.chooseCenter
      }}</span>
      <span class="map-sum-total" :data-state="overLimit ? 'over' : undefined">{{
        fill(props.copy.sampleCount, { count: total, limit: props.logicalSampleLimit })
      }}</span>
    </div>
    <p class="attribution">
      &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{{ props.copy.attribution }}</a>
    </p>
  </div>
</template>
