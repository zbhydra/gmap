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

/** 城市候选从两个字母起搜索，最多 50 条。 */
export const CITY_MIN_CHARS = 2
const CITY_LIMIT = 50

/**
 * 国家、州 / 省 combobox 的候选：输入为空时返回全部；否则不区分大小写，按「代码完全相同 > 名称前缀 > 名称包含」排序，
 * 同档保持原顺序。代码匹配只用于国家（行尾显示国家代码）。
 */
export function rankPairs<T extends readonly [string, string]>(pairs: readonly T[], text: string, byCode = false): T[] {
  const needle = text.trim().toLowerCase()
  if (!needle) return [...pairs]
  const ranked: [rank: number, pair: T][] = []
  for (const pair of pairs) {
    const name = pair[1].toLowerCase()
    const rank = byCode && pair[0].toLowerCase() === needle ? 0 : name.startsWith(needle) ? 1 : name.includes(needle) ? 2 : 3
    if (rank < 3) ranked.push([rank, pair])
  }
  return ranked.sort((a, b) => a[0] - b[0]).map(([, pair]) => pair)
}

/** 城市候选：名称包含输入（不区分大小写），选了州时只在该州内；同名同州只留一条。 */
export function searchCities(region: RegionData, stateCode: string, text: string): City[] {
  const needle = text.trim().toLowerCase()
  if (needle.length < CITY_MIN_CHARS) return []
  const matches = new Map<string, City>()
  for (const city of region.c) {
    if (stateCode && city[1] !== stateCode) continue
    if (!city[0].toLowerCase().includes(needle)) continue
    matches.set(`${city[0]}|${city[1]}`, city)
    if (matches.size === CITY_LIMIT) break
  }
  return [...matches.values()]
}
