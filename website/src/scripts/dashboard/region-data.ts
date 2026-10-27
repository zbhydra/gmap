import countriesUrl from '../../data/gmap-regions/countries.json?url&no-inline'

export type Country = [code: string, name: string]
export type State = [code: string, name: string]
export type City = [name: string, stateCode: string]
export interface RegionData { s: State[]; c: City[] }

const regionUrls = import.meta.glob<string>('../../data/gmap-regions/[A-Z][A-Z].json', {
  query: '?url&no-inline', import: 'default', eager: true
})
let countriesPromise: Promise<Country[]> | null = null
const regionPromises = new Map<string, Promise<RegionData>>()

async function readJson(url: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`region data: GET ${url} HTTP ${response.status}`)
  return await response.json()
}

function pairs(value: unknown): value is [string, string][] {
  return Array.isArray(value) && value.every(row => Array.isArray(row)
    && row.length === 2 && typeof row[0] === 'string' && typeof row[1] === 'string')
}

export function loadCountries(): Promise<Country[]> {
  countriesPromise ??= readJson(countriesUrl).then(value => {
    if (!pairs(value)) throw new Error('region data: countries.json has invalid shape')
    return value
  }).catch(error => {
    countriesPromise = null
    throw error
  })
  return countriesPromise
}

export function loadRegion(code: string): Promise<RegionData> {
  const cached = regionPromises.get(code)
  if (cached) return cached
  const url = regionUrls[`../../data/gmap-regions/${code}.json`]
  if (!url) return Promise.reject(new Error(`region data: no JSON for country ${code}`))
  const loading = readJson(url).then(value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)
      || !('s' in value) || !('c' in value) || !pairs(value.s) || !pairs(value.c)) {
      throw new Error(`region data: ${code}.json has invalid shape`)
    }
    return { s: value.s, c: value.c }
  }).catch(error => {
    regionPromises.delete(code)
    throw error
  })
  regionPromises.set(code, loading)
  return loading
}

/**
 * 国家 combobox 的候选：输入为空时返回全部；否则不区分大小写，按「代码完全相同 > 名称前缀 > 名称包含」排序，
 * 同档保持原顺序（行尾显示国家代码）。
 */
export function rankCountries(countries: readonly Country[], text: string): Country[] {
  const needle = text.trim().toLowerCase()
  if (!needle) return [...countries]
  const ranked: [rank: number, country: Country][] = []
  for (const pair of countries) {
    const name = pair[1].toLowerCase()
    const rank = pair[0].toLowerCase() === needle ? 0 : name.startsWith(needle) ? 1 : name.includes(needle) ? 2 : 3
    if (rank < 3) ranked.push([rank, pair])
  }
  return ranked.sort((a, b) => a[0] - b[0]).map(([, country]) => country)
}
