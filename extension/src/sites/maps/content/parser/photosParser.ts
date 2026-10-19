/** 照片 wTe8We 响应解析；照片与视频保留在同一媒体行，供计数与导出共享。 */

import type { MapsParseSchemaConfig } from '../../config/contract'
import type { JsonValue } from '@/core/rpc/types'
import { compileSchemaPath, getValueAt } from './path'

export interface PhotoRow {
  photoUrl: string
  videoUrl: string
}

export interface PhotosRpcParseResult {
  rows: PhotoRow[]
  nextToken: string | null
  end: boolean
}

/** 解析 Google batchexecute 的长度行与 JSON 块；下标由远程 schema 统一管理。 */
export function parsePhotosRpcResponse(
  raw: string,
  schema: MapsParseSchemaConfig
): PhotosRpcParseResult {
  const rows: PhotoRow[] = []
  let nextToken: string | null = null
  let foundPayload = false
  const listPath = compileSchemaPath(schema.photosListPath, 0)
  const photoPath = compileSchemaPath(schema.photosPhotoUrlPath, 0)
  const videoPath = compileSchemaPath(schema.photosVideoUrlPath, 0)

  for (const line of raw.split('\n')) {
    if (!line.startsWith('[[')) {
      continue
    }
    const chunks: JsonValue = JSON.parse(line) as JsonValue
    if (!Array.isArray(chunks)) {
      continue
    }
    for (const chunk of chunks) {
      if (!Array.isArray(chunk) || chunk[1] !== 'wTe8We') {
        continue
      }
      const payloadNode = chunk[schema.photosChunkPayloadIndex]
      if (typeof payloadNode !== 'string') {
        throw new Error('[PhotosParser] wTe8We 响应缺少 payload 字符串')
      }
      const payload: JsonValue = JSON.parse(payloadNode) as JsonValue
      const items = getValueAt(payload, listPath)
      if (!Array.isArray(payload) || !Array.isArray(items)) {
        throw new Error(`[PhotosParser] wTe8We 照片列表不是数组: path=${schema.photosListPath}`)
      }
      foundPayload = true
      const token = payload[schema.photosNextIndex]
      nextToken = typeof token === 'string' && token.length > 0 ? token : null

      for (const item of items) {
        const photo = getValueAt(item, photoPath)
        const video = getValueAt(item, videoPath)
        if (typeof photo !== 'string' || photo.length === 0) {
          throw new Error(`[PhotosParser] wTe8We 照片项缺少 URL: path=${schema.photosPhotoUrlPath}`)
        }
        if (photo.includes('streetview')) {
          continue
        }
        const photoUrl = photo.startsWith('//') ? `https:${photo}` : photo
        rows.push({
          photoUrl: photoUrl.split('=')[0] ?? '',
          videoUrl: typeof video === 'string' ? video : ''
        })
      }
    }
  }
  if (!foundPayload) {
    throw new Error('[PhotosParser] 响应未包含 wTe8We 照片数据块')
  }
  return { rows, nextToken, end: nextToken === null }
}
