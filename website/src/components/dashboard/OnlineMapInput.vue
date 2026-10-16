<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Circle, CircleMarker, LayerGroup, LeafletMouseEvent, Map as LeafletMap } from 'leaflet'
import type { DashboardContent } from '../../i18n/schema'
import { gridViewports, type OnlineViewport } from '../../scripts/dashboard/map-grid'

const props = defineProps<{
  copy: DashboardContent['create']['map']
  active: boolean
  disabled: boolean
  keywordCount: number
  logicalSampleLimit: number
}>()
const emit = defineEmits<{ viewports: [value: OnlineViewport[]] }>()

const lat = ref<number | string>('')
const lng = ref<number | string>('')
const radiusKm = ref<number | string>(5)
const spacingKm = ref<number | string>(5)
const tilesFailed = ref(false)
const mapElement = ref<HTMLDivElement | null>(null)
let leaflet: typeof import('leaflet') | null = null
let map: LeafletMap | null = null
let centerMarker: CircleMarker | null = null
let coverage: Circle | null = null
let gridLayer: LayerGroup | null = null

function inputNumber(value: number | string): number | null {
  if (typeof value === 'string' && !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const latitude = computed(() => inputNumber(lat.value))
const longitude = computed(() => inputNumber(lng.value))
const radius = computed(() => inputNumber(radiusKm.value))
const spacing = computed(() => inputNumber(spacingKm.value))
const center = computed(() => {
  if (latitude.value === null || longitude.value === null) return null
  return Math.abs(latitude.value) <= 85 && Math.abs(longitude.value) <= 180
    ? { lat: latitude.value, lng: longitude.value } : null
})
const viewports = computed(() => {
  if (!center.value || radius.value === null || spacing.value === null
    || radius.value < 0 || radius.value > 50 || spacing.value < 1 || spacing.value > 20) return []
  return gridViewports(center.value, radius.value, spacing.value)
})
const logicalCount = computed(() => props.keywordCount * viewports.value.length)
const overLimit = computed(() => logicalCount.value > props.logicalSampleLimit)

function redraw(): void {
  if (!leaflet || !map || !gridLayer || !mapElement.value) return
  gridLayer.clearLayers()
  if (!center.value || radius.value === null || radius.value < 0 || radius.value > 50) {
    centerMarker?.remove()
    coverage?.remove()
    centerMarker = null
    coverage = null
    return
  }
  const point = leaflet.latLng(center.value.lat, center.value.lng)
  const styles = getComputedStyle(mapElement.value)
  const primary = styles.getPropertyValue('--primary').trim()
  const accent = styles.getPropertyValue('--accent').trim()
  if (!centerMarker) centerMarker = leaflet.circleMarker(point, { radius: 7, color: accent, fillColor: accent, fillOpacity: 1, interactive: false }).addTo(map)
  else centerMarker.setLatLng(point)
  if (!coverage) coverage = leaflet.circle(point, { radius: radius.value * 1000, color: primary, fillColor: primary, fillOpacity: .1, weight: 2, interactive: false }).addTo(map)
  else coverage.setLatLng(point).setRadius(radius.value * 1000)
  if (!overLimit.value) {
    for (const viewport of viewports.value) {
      leaflet.circleMarker([viewport.lat, viewport.lng], { radius: 3, color: primary, fillColor: primary, fillOpacity: .85, weight: 1, interactive: false }).addTo(gridLayer)
    }
  }
  map.setView(point, Math.max(map.getZoom(), 9))
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
  if (!mapElement.value) return
  map = leaflet.map(mapElement.value, { center: [20, 0], zoom: 2 })
  const tiles = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: props.copy.attribution
  }).addTo(map)
  let tileErrors = 0
  tiles.on('tileerror', () => { if (++tileErrors >= 4) tilesFailed.value = true })
  tiles.on('tileload', () => { tilesFailed.value = false })
  gridLayer = leaflet.layerGroup().addTo(map)
  map.on('click', (event: LeafletMouseEvent) => {
    if (props.disabled || !props.active) return
    lat.value = Number(event.latlng.lat.toFixed(6))
    lng.value = Number(event.latlng.lng.toFixed(6))
  })
  redraw()
  await nextTick()
  map.invalidateSize()
})
onBeforeUnmount(() => { map?.remove() })
watch([center, radiusKm, spacingKm, overLimit], redraw)
watch(viewports, value => emit('viewports', value), { immediate: true })
watch(() => props.active, async active => { if (active) { await nextTick(); map?.invalidateSize() } })
</script>

<template>
  <div class="map-input">
    <fieldset class="map-fields" :disabled="disabled || !active">
      <label>{{ copy.latitude }}<input v-model.number="lat" type="number" min="-85" max="85" step="any" /></label>
      <label>{{ copy.longitude }}<input v-model.number="lng" type="number" min="-180" max="180" step="any" /></label>
      <label>{{ copy.radius }}<input v-model.number="radiusKm" type="number" min="0" max="50" step="1" /></label>
      <label>{{ copy.spacing }}<input v-model.number="spacingKm" type="number" min="1" max="20" step="1" /></label>
    </fieldset>
    <p class="map-summary" aria-live="polite">{{ copy.sampleCount.replace('{count}', String(logicalCount)).replace('{limit}', String(logicalSampleLimit)) }}</p>
    <p v-if="overLimit" class="map-error" role="alert">{{ copy.overLimit.replace('{limit}', String(logicalSampleLimit)) }}</p>
    <p v-else-if="!center" class="map-summary">{{ copy.chooseCenter }}</p>
    <div ref="mapElement" class="map-surface" :aria-label="copy.mapLabel" />
    <p v-if="tilesFailed" class="map-error" role="status">{{ copy.tilesUnavailable }}</p>
  </div>
</template>

<style scoped>
.map-input { display: grid; gap: var(--s-3); min-width: 0; }
.map-fields { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--s-3); margin: 0; padding: 0; border: 0; }
.map-fields label { display: grid; gap: var(--s-2); min-width: 0; }
.map-fields input { width: 100%; min-width: 0; padding: var(--s-3); border: 1px solid var(--border-2); border-radius: var(--r-sm); background: var(--surface); color: var(--text); font: inherit; }
.map-fields input:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
.map-surface { width: 100%; min-height: 280px; height: 400px; max-height: 50vh; border: 1px solid var(--border); border-radius: var(--r-sm); z-index: 0; isolation: isolate; }
.map-summary { margin: 0; color: var(--text-2); font-size: 14px; }
.map-error { margin: 0; color: var(--bad); font-size: 14px; }
@media (max-width: 960px) { .map-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); } .map-surface { height: 320px; } }
@media (max-width: 480px) { .map-fields { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
</style>
