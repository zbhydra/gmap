<script setup lang="ts">
/**
 * 地区模式的构建列：基础关键词 → 国家（单选）/ 州（多选）→ 城市（多选）→ 措辞 In / Near → Generate queries。
 *
 * - 国家是持有值的 combobox，候选按「代码完全相同 > 名称前缀 > 名称包含」排序。
 * - 州 / 省可不选；城市候选限于所选州，没选州时是全国。改州时移除不在所选州内的已选城市。
 * - 地点取最细的一层：选了城市按城市，否则选了州按州，否则按国家；基础关键词 × 地点按措辞组合成查询，
 *   点 Generate queries 交给创建面板写入可编辑的最终查询。
 * - 国家列表在首次进入地区模式时加载，州与城市在选中国家后加载；失败时就地重试。
 */
import { computed, onMounted, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { fill } from '../../scripts/dashboard/format'
import { loadCountries, loadRegion, rankCountries, type Country, type RegionData } from '../../scripts/dashboard/region-data'
import PopChecklist, { type CheckOption } from './PopChecklist.vue'
import PopCombobox, { type ComboOption } from './PopCombobox.vue'

const props = defineProps<{
  copy: DashboardContent['create']['region']
  disabled: boolean
  /** 提交成功后递增：清空输入与所选地点。 */
  resetKey: number
}>()

const emit = defineEmits<{
  /** 点 Generate queries：基础关键词 × 地点组合出的查询。 */
  generate: [queries: string[]]
}>()

const countries = ref<Country[]>([])
const countryCode = ref('')
const region = ref<RegionData | null>(null)
const stateCodes = ref<string[]>([])
/** 已选城市，键为「州代码:城市名」。 */
const cityKeys = ref<string[]>([])
const countryQuery = ref('')
const loadingCountries = ref(false)
const loadingRegion = ref(false)
const countriesError = ref(false)
const regionError = ref(false)
const baseText = ref('')
const phrasing = ref<'in' | 'near'>('in')

const countryName = computed(() => countries.value.find(([code]) => code === countryCode.value)?.[1] ?? '')
const stateNames = computed(() => new Map(region.value?.s ?? []))
const countryOptions = computed<ComboOption[]>(() => rankCountries(countries.value, countryQuery.value)
  .map(([code, name]) => ({ value: code, label: name, sub: code })))
const stateOptions = computed<CheckOption[]>(() => (region.value?.s ?? []).map(([code, name]) => ({ value: code, label: name })))
// 同名同州只留一条
const cityOptions = computed<CheckOption[]>(() => {
  if (!region.value) return []
  const scope = stateCodes.value.length ? new Set(stateCodes.value) : null
  const options = new Map<string, CheckOption>()
  for (const [city, state] of region.value.c) {
    if (scope && !scope.has(state)) continue
    const value = `${state}:${city}`
    if (!options.has(value)) options.set(value, { value, label: city, sub: stateNames.value.get(state) ?? '' })
  }
  return [...options.values()]
})
const stateSummary = computed(() => summarize(stateCodes.value.map(code => stateNames.value.get(code) ?? code)))
const citySummary = computed(() => summarize(cityKeys.value.map(key => key.slice(key.indexOf(':') + 1))))
const places = computed(() => {
  const code = countryCode.value
  if (!code) return []
  if (cityKeys.value.length) {
    return cityKeys.value.map(key => {
      const split = key.indexOf(':')
      return [key.slice(split + 1), stateNames.value.get(key.slice(0, split)), code].filter(Boolean).join(', ')
    })
  }
  if (stateCodes.value.length) return stateCodes.value.map(state => `${stateNames.value.get(state) ?? state}, ${code}`)
  return [countryName.value]
})
const queries = computed(() => {
  const bases = [...new Set(baseText.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean))]
  return bases.flatMap(base => places.value.map(place => `${base} ${phrasing.value} ${place}`))
})
/** 生成按钮旁的说明：按表单顺序提示第一个缺项（提醒色），齐全时显示将生成的条数。 */
const missingHint = computed(() => !baseText.value.trim() ? props.copy.needBase : !countryCode.value ? props.copy.needCountry : '')
const checklistCopy = computed(() => ({
  filter: props.copy.filter,
  selectAll: props.copy.selectAll,
  clear: props.copy.clear,
  noMatch: props.copy.noMatch,
  more: props.copy.more
}))

/** 触发按钮摘要：两项以内列名称，更多时显示数量。 */
function summarize(names: string[]): string {
  return names.length > 2 ? fill(props.copy.selectedCount, { count: names.length }) : names.join(', ')
}

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

/** 换国家：清空州与城市，再加载该国数据；连续切换时只采用最后一次。 */
async function fetchRegion(code: string): Promise<void> {
  region.value = null
  regionError.value = false
  stateCodes.value = []
  cityKeys.value = []
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

function selectStates(codes: string[]): void {
  stateCodes.value = codes
  if (!codes.length) return
  const scope = new Set(codes)
  cityKeys.value = cityKeys.value.filter(key => scope.has(key.slice(0, key.indexOf(':'))))
}

function retry(): void {
  if (countriesError.value) void fetchCountries()
  else void fetchRegion(countryCode.value)
}

watch(() => props.resetKey, () => {
  baseText.value = ''
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
        <PopChecklist
          id="region-state"
          :label="props.copy.state"
          :options="stateOptions"
          :model-value="stateCodes"
          :summary="stateSummary"
          :placeholder="props.copy.allStates"
          :copy="checklistCopy"
          :disabled="props.disabled || !region"
          @update:model-value="selectStates"
        />
      </div>
    </div>

    <div class="mini-field">
      <label class="mini-label" for="region-city">{{ props.copy.citySearch }}</label>
      <PopChecklist
        id="region-city"
        :label="props.copy.city"
        :options="cityOptions"
        :model-value="cityKeys"
        :summary="citySummary"
        :placeholder="props.copy.cityPlaceholder"
        :copy="checklistCopy"
        :disabled="props.disabled || !region"
        @update:model-value="value => cityKeys = value"
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

    <fieldset class="phrasing" :disabled="props.disabled">
      <legend>{{ props.copy.matchMode }}</legend>
      <label><input v-model="phrasing" type="radio" value="in" />{{ props.copy.inMode }}</label>
      <label><input v-model="phrasing" type="radio" value="near" />{{ props.copy.nearMode }}</label>
    </fieldset>

    <div class="region-generate">
      <button
        class="btn btn-secondary btn-sm"
        type="button"
        aria-describedby="region-generate-hint"
        :disabled="props.disabled || !queries.length"
        @click="emit('generate', queries)"
      >
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-list-plus" /></svg>{{ props.copy.generate }}
      </button>
      <span id="region-generate-hint" class="region-generate-hint" :data-state="missingHint ? 'warn' : undefined" aria-live="polite">
        <svg v-if="missingHint" class="icon icon--sm" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
        {{ missingHint || fill(props.copy.willGenerate, { count: queries.length }) }}
      </span>
    </div>
  </div>
</template>
