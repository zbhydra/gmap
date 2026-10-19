<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { loadCountries, loadRegion, type City, type Country, type RegionData } from '../../scripts/dashboard/region-data'

const props = defineProps<{
  copy: DashboardContent['create']['region']
  disabled: boolean
  resetKey: number
}>()
const emit = defineEmits<{ queries: [value: string[]] }>()

const countries = ref<Country[]>([])
const countryCode = ref('')
const region = ref<RegionData | null>(null)
const stateCode = ref('')
const citySearch = ref('')
const cityChoice = ref('')
const loadingCountries = ref(false)
const loadingRegion = ref(false)
const countriesError = ref(false)
const regionError = ref(false)
const baseText = ref('')
const finalText = ref('')
const mode = ref<'in' | 'near'>('in')
const selected = ref<{ key: string; label: string; query: string }[]>([])

const countryName = computed(() => countries.value.find(row => row[0] === countryCode.value)?.[1] ?? '')
const stateName = computed(() => region.value?.s.find(row => row[0] === stateCode.value)?.[1] ?? '')
const stateNames = computed(() => new Map(region.value?.s ?? []))
const cityChoices = computed(() => {
  const query = citySearch.value.trim().toLowerCase()
  if (query.length < 2) return []
  const matches = new Map<string, City>()
  for (const city of region.value?.c ?? []) {
    if (stateCode.value && city[1] !== stateCode.value) continue
    if (!city[0].toLowerCase().includes(query)) continue
    matches.set(`${city[0]}|${city[1]}`, city)
    if (matches.size === 50) break
  }
  return [...matches]
})

async function fetchCountries(): Promise<void> {
  loadingCountries.value = true
  countriesError.value = false
  try {
    countries.value = await loadCountries()
  } catch (error) {
    console.error(new Error('online region: countries load failed', { cause: error }))
    countriesError.value = true
  } finally {
    loadingCountries.value = false
  }
}

async function fetchRegion(code: string): Promise<void> {
  region.value = null
  regionError.value = false
  stateCode.value = ''
  citySearch.value = ''
  cityChoice.value = ''
  if (!code) return
  loadingRegion.value = true
  try {
    const loaded = await loadRegion(code)
    if (countryCode.value === code) region.value = loaded
  } catch (error) {
    console.error(new Error(`online region: ${code} load failed`, { cause: error }))
    if (countryCode.value === code) regionError.value = true
  } finally {
    if (countryCode.value === code) loadingRegion.value = false
  }
}

function add(key: string, label: string, query: string): void {
  if (!selected.value.some(place => place.key === key)) selected.value.push({ key, label, query })
}

function addCountry(): void {
  if (countryName.value) add(countryCode.value, countryName.value, countryName.value)
}

function addState(): void {
  if (stateName.value) add(`${countryCode.value}:${stateCode.value}`, `${stateName.value}, ${countryCode.value}`, `${stateName.value}, ${countryCode.value}`)
}

function addCity(): void {
  const city = cityChoices.value.find(([key]) => key === cityChoice.value)?.[1]
  if (!city) return
  const state = stateNames.value.get(city[1])
  const place = [city[0], state, countryCode.value].filter(Boolean).join(', ')
  add(`${countryCode.value}:${city[1]}:${city[0]}`, place, place)
}

function generate(): void {
  const bases = [...new Set(baseText.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean))]
  finalText.value = bases.flatMap(base => selected.value.map(place => `${base} ${mode.value} ${place.query}`)).join('\n')
}

watch(countryCode, code => { void fetchRegion(code) })
watch(finalText, value => emit('queries', [...new Set(value.split(/\r?\n/).map(line => line.trim()).filter(Boolean))]), { immediate: true })
watch(() => props.resetKey, () => {
  baseText.value = ''
  finalText.value = ''
  selected.value = []
  countryCode.value = ''
})
onMounted(() => { void fetchCountries() })
</script>

<template>
  <div class="region-input">
    <label for="online-region-base">{{ copy.baseKeywords }}</label>
    <textarea id="online-region-base" v-model="baseText" rows="3" :placeholder="copy.basePlaceholder" :disabled="disabled" />
    <div class="region-fields">
      <label>
        {{ copy.country }}
        <select v-model="countryCode" class="input" :disabled="disabled || loadingCountries || countriesError">
          <option value="">{{ copy.selectCountry }}</option>
          <option v-for="country in countries" :key="country[0]" :value="country[0]">{{ country[1] }}</option>
        </select>
      </label>
      <label>
        {{ copy.state }}
        <select v-model="stateCode" class="input" :disabled="disabled || !region || regionError">
          <option value="">{{ copy.allStates }}</option>
          <option v-for="state in region?.s ?? []" :key="state[0]" :value="state[0]">{{ state[1] }}</option>
        </select>
      </label>
      <label>
        {{ copy.citySearch }}
        <input v-model="citySearch" type="search" :placeholder="copy.cityPlaceholder" :disabled="disabled || !region || regionError" @input="cityChoice = ''" />
      </label>
      <label>
        {{ copy.city }}
        <select v-model="cityChoice" class="input" :disabled="disabled || cityChoices.length === 0">
          <option value="">{{ copy.selectCity }}</option>
          <option v-for="[key, city] in cityChoices" :key="key" :value="key">{{ city[0] }}{{ stateNames.get(city[1]) ? `, ${stateNames.get(city[1])}` : '' }}</option>
        </select>
      </label>
    </div>
    <p v-if="loadingCountries || loadingRegion" class="region-note" role="status">{{ copy.loading }}</p>
    <p v-if="countriesError || regionError" class="region-error" role="alert">
      {{ copy.loadFailed }}
      <button type="button" class="region-command" @click="countriesError ? fetchCountries() : fetchRegion(countryCode)">{{ copy.retry }}</button>
    </p>
    <div class="region-actions">
      <button type="button" class="region-command" :disabled="disabled || !countryName" @click="addCountry">{{ copy.addCountry }}</button>
      <button type="button" class="region-command" :disabled="disabled || !stateName" @click="addState">{{ copy.addState }}</button>
      <button type="button" class="region-command" :disabled="disabled || !cityChoice" @click="addCity">{{ copy.addCity }}</button>
    </div>
    <ul v-if="selected.length" class="region-selected" :aria-label="copy.selectedRegions">
      <li v-for="place in selected" :key="place.key">
        <span>{{ place.label }}</span>
        <button type="button" :title="copy.remove.replace('{name}', place.label)" :aria-label="copy.remove.replace('{name}', place.label)" :disabled="disabled" @click="selected = selected.filter(item => item.key !== place.key)">×</button>
      </li>
    </ul>
    <fieldset class="region-mode" :disabled="disabled">
      <legend>{{ copy.matchMode }}</legend>
      <label><input v-model="mode" type="radio" value="in" />{{ copy.inMode }}</label>
      <label><input v-model="mode" type="radio" value="near" />{{ copy.nearMode }}</label>
    </fieldset>
    <button type="button" class="region-generate" :disabled="disabled || !baseText.trim() || !selected.length" @click="generate">{{ copy.generate }}</button>
    <label for="online-region-final">{{ copy.finalQueries }}</label>
    <textarea id="online-region-final" v-model="finalText" rows="5" :placeholder="copy.finalPlaceholder" :disabled="disabled" />
    <p class="region-note"><a href="https://www.geonames.org/export/" target="_blank" rel="noopener noreferrer">{{ copy.attribution }}</a></p>
  </div>
</template>

<style scoped>
.region-input { display: grid; gap: var(--s-3); min-width: 0; }
.region-input textarea, .region-input input[type='search'] { width: 100%; min-width: 0; padding: var(--s-3); border: 1px solid var(--border-2); border-radius: var(--r-sm); background: var(--surface); color: var(--text); font: inherit; }
.region-input textarea:focus-visible, .region-input input:focus-visible, .region-input button:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
.region-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s-3); }
.region-fields label { display: grid; gap: var(--s-2); min-width: 0; }
.region-actions { display: flex; flex-wrap: wrap; gap: var(--s-2); }
.region-command, .region-generate { min-height: 36px; padding: 0 var(--s-3); border: 1px solid var(--border-2); border-radius: var(--r-full); background: var(--surface); color: var(--text); font: inherit; cursor: pointer; }
.region-generate { justify-self: start; border-color: var(--primary); color: var(--primary-text); }
.region-command:disabled, .region-generate:disabled { opacity: .5; cursor: not-allowed; }
.region-selected { display: flex; flex-wrap: wrap; gap: var(--s-2); margin: 0; padding: 0; list-style: none; }
.region-selected li { display: inline-flex; align-items: center; gap: var(--s-2); max-width: 100%; padding: 2px var(--s-2); border: 1px solid var(--border); border-radius: var(--r-full); }
.region-selected li span { overflow-wrap: anywhere; }
.region-selected li button { border: 0; background: none; color: var(--text-2); font-size: var(--fs-h4); cursor: pointer; }
.region-mode { display: flex; flex-wrap: wrap; gap: var(--s-4); margin: 0; padding: 0; border: 0; }
.region-mode legend { margin-bottom: var(--s-2); }
.region-mode label { display: inline-flex; align-items: center; gap: var(--s-2); }
.region-note { margin: 0; color: var(--text-2); font-size: 13px; }
.region-note a { color: var(--primary-text); }
.region-error { margin: 0; color: var(--bad); }
@media (max-width: 960px) { .region-fields { grid-template-columns: minmax(0, 1fr); } }
</style>
