import { postJson, type JsonValue } from './api'
import { ensureDeviceId } from './device'

export interface PreviewRow {
  name: string
  address: string | null
  category: string | null
  rating: number | null
  review_count: number | null
  phone: string | null
}

export interface PreviewResult {
  count: number
  rows: PreviewRow[]
}

function isRow(value: JsonValue): value is PreviewRow & Record<string, JsonValue> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && typeof value.name === 'string'
    && (value.address === null || typeof value.address === 'string')
    && (value.category === null || typeof value.category === 'string')
    && (value.phone === null || typeof value.phone === 'string')
    && (value.rating === null || typeof value.rating === 'number')
    && (value.review_count === null || typeof value.review_count === 'number')
}

export async function previewKeyword(keyword: string): Promise<PreviewResult> {
  const data = await postJson<JsonValue>('/api/client/maps-online/preview',
    { deviceId: await ensureDeviceId() }, { keyword })
  if (!data || typeof data !== 'object' || Array.isArray(data)
    || typeof data.count !== 'number' || !Array.isArray(data.rows)
    || data.rows.length > 3 || !data.rows.every(isRow)) {
    throw new Error('homepage preview: invalid first-page response')
  }
  return { count: data.count, rows: data.rows }
}
