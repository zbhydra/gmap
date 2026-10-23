<script setup lang="ts">
/**
 * 地区模式的构建列：基础关键词 → 国家 / 州 / 城市 → 已选地点 chips → 措辞 In / Near。
 *
 * - 国家、州 / 省是持有值的 combobox：候选按「代码完全相同 > 名称前缀 > 名称包含」排序，州列表首项是全部州；
 *   城市是选中即加入的 combobox：两个字母起搜索，受所选州限制，最多 50 条。
 * - 基础关键词 × 已选地点按措辞组合成候选查询，交给创建面板的 Generate 写入可编辑的最终查询。
 * - 国家列表在首次进入地区模式时加载，州与城市在选中国家后加载；失败时就地重试。
 *   州、城市只看是否选了国家：加载期间照常可聚焦（Tab 换国家后落点不失效），候选随数据到达出现，期间显示加载提示。
 */
import { computed, onMounted, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { fill } from '../../scripts/dashboard/format'
import {
  CITY_MIN_CHARS,
  loadCountries,
  loadRegion,
  rankPairs,
  searchCities,
  type Country,
  type RegionData,
  type State
} from '../../scripts/dashboard/region-data'
import PopCombobox, { type ComboOption } from './PopCombobox.vue'

const props = defineProps<{
  copy: DashboardContent['create']['region']
  disabled: boolean
  /** 提交成功后递增：清空输入与已选地点。 */
  resetKey: number
}>()

const emit = defineEmits<{
  /** 基础关键词 × 已选地点组合出的候选查询；为空时不能生成。 */
  generated: [queries: string[]]
}>()

interface Place {
  key: string
  label: string
}

const countries = ref<Country[]>([])
const countryCode = ref('')
const region = ref<RegionData | null>(null)
const stateCode = ref('')
const countryQuery = ref('')
const stateQuery = ref('')
const cityQuery = ref('')
const loadingCountries = ref(false)
const loadingRegion = ref(false)
const countriesError = ref(false)
const regionError = ref(false)
const baseText = ref('')
const phrasing = ref<'in' | 'near'>('in')
const selected = ref<Place[]>([])
const cityCombo = ref<InstanceType<typeof PopCombobox> | null>(null)

const countryName = computed(() => countries.value.find(([code]) => code === countryCode.value)?.[1] ?? '')
const stateName = computed(() => region.value?.s.find(([code]) => code === stateCode.value)?.[1] ?? '')
const countryOptions = computed<ComboOption[]>(() => rankPairs(countries.value, countryQuery.value, true)
  .map(([code, name]) => ({ value: code, label: name, sub: code })))
const stateOptions = computed<ComboOption[]>(() => rankPairs<State>([['', props.copy.allStates], ...(region.value?.s ?? [])], stateQuery.value)
  .map(([code, name]) => ({ value: code, label: name })))
// 城市的 value 是「州代码:城市名」，sub 是州名：选中后据此拼出地点，不再回查列表
const cityOptions = computed<ComboOption[]>(() => {
  if (!region.value) return []
  const states = new Map(region.value.s)
  return searchCities(region.value, stateCode.value, cityQuery.value)
    .map(([city, state]) => ({ value: `${state}:${city}`, label: city, sub: states.get(state) ?? '' }))
})
const generated = computed(() => {
  const bases = [...new Set(baseText.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean))]
  return bases.flatMap(base => selected.value.map(place => `${base} ${phrasing.value} ${place.label}`))
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

/** 换国家：州回到全部、城市输入清空，再加载该国的州与城市；连续切换时只采用最后一次。 */
async function fetchRegion(code: string): Promise<void> {
  region.value = null
  regionError.value = false
  stateCode.value = ''
  cityCombo.value?.clear()
  loadingRegion.value = Boolean(code)
  if (!code) return
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

function selectCountry(code: string): void {
  if (code === countryCode.value) return
  countryCode.value = code
  void fetchRegion(code)
}

function selectState(code: string): void {
  if (code === stateCode.value) return
  stateCode.value = code
  cityCombo.value?.clear()
}

function retry(): void {
  if (countriesError.value) void fetchCountries()
  else void fetchRegion(countryCode.value)
}

function add(key: string, label: string): void {
  if (!selected.value.some(place => place.key === key)) selected.value.push({ key, label })
}

function addCountry(): void {
  add(countryCode.value, countryName.value)
}

function addState(): void {
  add(`${countryCode.value}:${stateCode.value}`, `${stateName.value}, ${countryCode.value}`)
}

function addCity(option: ComboOption): void {
  add(`${countryCode.value}:${option.value}`, [option.label, option.sub, countryCode.value].filter(Boolean).join(', '))
}

function remove(key: string): void {
  selected.value = selected.value.filter(place => place.key !== key)
}

watch(generated, value => emit('generated', value), { immediate: true })

watch(() => props.resetKey, () => {
  baseText.value = ''
  selected.value = []
  countryCode.value = ''
  void fetchRegion('')
})

onMounted(() => {
  void fetchCountries()
})
</script>

<template>
  <div class="region-build">
    <div class="kw-field">
      <label class="field-label" for="region-base">{{ props.copy.baseKeywords }}</label>
      <textarea
        id="region-base"
        v-model="baseText"
        class="textarea textarea--dash"
        rows="3"
        spellcheck="false"
        :placeholder="props.copy.basePlaceholder"
        :disabled="props.disabled"
      ></textarea>
    </div>

    <div class="region-pick">
      <div class="mini-field">
        <label class="mini-label" for="region-country">{{ props.copy.country }}</label>
        <PopCombobox
          id="region-country"
          :label="props.copy.country"
          :options="countryOptions"
          :no-match="props.copy.noMatch"
          mode="value"
          :model-value="countryCode"
          :value-label="countryName"
          allow-empty
          :placeholder="props.copy.selectCountry"
          :disabled="props.disabled || !countries.length"
          @query="q => countryQuery = q"
          @update:model-value="selectCountry"
        />
      </div>
      <div class="mini-field">
        <label class="mini-label" for="region-state">{{ props.copy.state }}</label>
        <PopCombobox
          id="region-state"
          :label="props.copy.state"
          :options="stateOptions"
          :no-match="props.copy.noMatch"
          mode="value"
          :model-value="stateCode"
          :value-label="stateName"
          allow-empty
          :placeholder="props.copy.allStates"
          :disabled="props.disabled || !countryCode"
          @query="q => stateQuery = q"
          @update:model-value="selectState"
        />
      </div>
    </div>

    <div class="region-adds">
      <button class="btn btn-secondary btn-xs" type="button" :disabled="props.disabled || !countryName" @click="addCountry">
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-plus" /></svg>{{ props.copy.addCountry }}
      </button>
      <button class="btn btn-secondary btn-xs" type="button" :disabled="props.disabled || !stateName" @click="addState">
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-plus" /></svg>{{ props.copy.addState }}
      </button>
    </div>

    <div class="mini-field">
      <label class="mini-label" for="region-city">{{ props.copy.citySearch }}</label>
      <PopCombobox
        id="region-city"
        ref="cityCombo"
        :label="props.copy.city"
        :options="cityOptions"
        :no-match="props.copy.noMatch"
        mode="action"
        :min-chars="CITY_MIN_CHARS"
        :placeholder="props.copy.cityPlaceholder"
        :disabled="props.disabled || !countryCode"
        @query="q => cityQuery = q"
        @select="addCity"
      />
    </div>

    <p v-if="loadingCountries || loadingRegion" class="d-hint" role="status">{{ props.copy.loading }}</p>
    <div v-else-if="countriesError || regionError" class="callout callout--bad" role="alert">
      <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
      <div class="callout-body">
        <span>{{ props.copy.loadFailed }}</span>
        <button class="btn btn-secondary btn-xs" type="button" @click="retry">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>{{ props.copy.retry }}
        </button>
      </div>
    </div>

    <ul v-if="selected.length" class="place-chips" :aria-label="props.copy.selectedRegions">
      <li v-for="place in selected" :key="place.key" class="place-chip">
        <span>{{ place.label }}</span>
        <button
          type="button"
          :aria-label="fill(props.copy.remove, { name: place.label })"
          :disabled="props.disabled"
          @click="remove(place.key)"
        >
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-x" /></svg>
        </button>
      </li>
    </ul>

    <fieldset class="phrasing" :disabled="props.disabled">
      <legend>{{ props.copy.matchMode }}</legend>
      <label><input v-model="phrasing" type="radio" value="in" />{{ props.copy.inMode }}</label>
      <label><input v-model="phrasing" type="radio" value="near" />{{ props.copy.nearMode }}</label>
    </fieldset>
  </div>
</template>
