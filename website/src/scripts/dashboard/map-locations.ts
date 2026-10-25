import locationsUrl from '../../data/gmap-regions/map-locations.json?url&no-inline'

type LocationRow = [path: string[], lat: number, lng: number]

export interface MapLocation {
  name: string
  lat: number | null
  lng: number | null
  children: MapLocation[]
}

let locationsPromise: Promise<MapLocation[]> | null = null

function isLocations(value: unknown): value is LocationRow[] {
  return Array.isArray(value) && value.every(row => Array.isArray(row) && row.length === 3
    && Array.isArray(row[0]) && row[0].length >= 1 && row[0].length <= 3
    && row[0].every(part => typeof part === 'string' && part.length > 0)
    && typeof row[1] === 'number' && typeof row[2] === 'number'
    && Number.isFinite(row[1]) && Math.abs(row[1]) <= 85
    && Number.isFinite(row[2]) && Math.abs(row[2]) <= 180)
}

/** 行政区没有独立坐标时仍保留层级，允许继续选择有坐标的下属城市。 */
function locationTree(rows: LocationRow[]): MapLocation[] {
  const root: MapLocation = { name: '', lat: null, lng: null, children: [] }
  for (const [path, lat, lng] of rows) {
    let parent = root
    for (const name of path) {
      let child = parent.children.find(location => location.name === name)
      if (!child) {
        child = { name, lat: null, lng: null, children: [] }
        parent.children.push(child)
      }
      parent = child
    }
    parent.lat = lat
    parent.lng = lng
  }
  return root.children
}

/** 首次使用区域选择框时加载，失败后可重试。 */
export function loadMapLocations(): Promise<MapLocation[]> {
  locationsPromise ??= fetch(locationsUrl).then(async response => {
    if (!response.ok) throw new Error(`map locations: GET ${locationsUrl} HTTP ${response.status}`)
    const value: unknown = await response.json()
    if (!isLocations(value)) throw new Error('map locations: map-locations.json has invalid shape')
    return locationTree(value)
  }).catch(error => {
    locationsPromise = null
    throw error
  })
  return locationsPromise
}
