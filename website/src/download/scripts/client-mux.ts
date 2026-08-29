/**
 * 客户端多轨 MP4 合成。
 *
 * Reddit hosted video 返回独立视频轨和音频轨。本模块先直连下载两条轨道，
 * 再使用 Mediabunny 复制 encoded packets 到新的 MP4 容器，不做转码。
 */

import {
  BlobSource,
  BufferTarget,
  EncodedAudioPacketSource,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  MP4,
  Mp4OutputFormat,
  Output,
  type AudioCodec,
  type VideoCodec
} from 'mediabunny'
import type {
  ClientMuxDownloadIntent,
  ClientMuxTrackIntent,
  DownloadProgressSnapshot
} from './types'

/** client_mux 当前阶段。 */
export type ClientMuxStage = 'download' | 'mux'

/** client_mux 进度快照。 */
export interface ClientMuxProgressSnapshot extends DownloadProgressSnapshot {
  /** 当前阶段。 */
  stage: ClientMuxStage
}

/** client_mux 失败。 */
export class ClientMuxDownloadError extends Error {
  /** 失败阶段。 */
  readonly reason: 'track_fetch_failed' | 'client_mux_failed' | 'client_mux_too_large'
  /** HTTP 状态码；0 表示 CORS 或网络层失败。 */
  readonly status: number
  /** 失败轨道。 */
  readonly trackKind?: 'video' | 'audio'

  constructor(
    reason: ClientMuxDownloadError['reason'],
    status: number,
    trackKind?: 'video' | 'audio'
  ) {
    super(`[client-mux] ${reason}, status=${status}, track=${trackKind ?? 'none'}`)
    this.name = 'ClientMuxDownloadError'
    this.reason = reason
    this.status = status
    this.trackKind = trackKind
  }
}

const CLIENT_MUX_MAX_BYTES = 50 * 1024 * 1024

function clampProgress(progress: number): number {
  return Math.max(0, Math.min(100, progress))
}

function isLikelyNetworkError(error: Error): boolean {
  if (error.name === 'AbortError') {
    return true
  }
  return error instanceof TypeError
}

function assertClientMuxSize(intent: ClientMuxDownloadIntent): void {
  const totalSize =
    typeof intent.videoTrack.size === 'number' && typeof intent.audioTrack.size === 'number'
      ? intent.videoTrack.size + intent.audioTrack.size
      : intent.size
  if (typeof totalSize === 'number' && totalSize > CLIENT_MUX_MAX_BYTES) {
    throw new ClientMuxDownloadError('client_mux_too_large', 0)
  }
}

async function fetchTrackWithProgress(
  track: ClientMuxTrackIntent,
  offsetBytes: number,
  knownTotalBytes: number | null,
  startedAt: number,
  onProgress?: (progress: ClientMuxProgressSnapshot) => void
): Promise<Blob> {
  let response: Response
  try {
    response = await fetch(track.url, {
      referrerPolicy: 'no-referrer'
    })
  } catch (error) {
    console.error(error)
    if (error instanceof Error && isLikelyNetworkError(error)) {
      throw new ClientMuxDownloadError('track_fetch_failed', 0, track.kind)
    }
    throw error
  }

  if (response.status !== 200 && response.status !== 206) {
    throw new ClientMuxDownloadError('track_fetch_failed', response.status, track.kind)
  }

  const body = response.body
  if (!body) {
    return response.blob()
  }

  const chunks: Uint8Array[] = []
  const reader = body.getReader()
  let trackBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    if (!value || value.byteLength === 0) {
      continue
    }
    chunks.push(value)
    trackBytes += value.byteLength

    const downloadedBytes = offsetBytes + trackBytes
    const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.001)
    onProgress?.({
      stage: 'download',
      downloadedBytes,
      totalBytes: knownTotalBytes,
      progress:
        knownTotalBytes !== null && knownTotalBytes > 0
          ? clampProgress((downloadedBytes / knownTotalBytes) * 80)
          : undefined,
      speedBytesPerSecond: downloadedBytes > 0 ? downloadedBytes / elapsedSeconds : null
    })
  }

  const parts = chunks.map(chunk => chunk.slice().buffer)
  return new Blob(parts, { type: track.mimeType || 'application/octet-stream' })
}

async function addVideoPackets(input: Input<BlobSource>, source: EncodedVideoPacketSource): Promise<void> {
  const track = await input.getPrimaryVideoTrack()
  if (!track) {
    throw new ClientMuxDownloadError('client_mux_failed', 0, 'video')
  }
  const decoderConfig = await track.getDecoderConfig()
  const sink = new EncodedPacketSink(track)
  const firstTimestamp = await track.getFirstTimestamp()

  for await (const packet of sink.packets(undefined, undefined, { verifyKeyPackets: true })) {
    const timestamp = Math.max(0, packet.timestamp - firstTimestamp)
    await source.add(packet.clone({ timestamp }), {
      decoderConfig: decoderConfig ?? undefined
    })
  }
  source.close()
}

async function addAudioPackets(input: Input<BlobSource>, source: EncodedAudioPacketSource): Promise<void> {
  const track = await input.getPrimaryAudioTrack()
  if (!track) {
    throw new ClientMuxDownloadError('client_mux_failed', 0, 'audio')
  }
  const decoderConfig = await track.getDecoderConfig()
  const sink = new EncodedPacketSink(track)
  const firstTimestamp = await track.getFirstTimestamp()

  for await (const packet of sink.packets()) {
    const timestamp = Math.max(0, packet.timestamp - firstTimestamp)
    await source.add(packet.clone({ timestamp }), {
      decoderConfig: decoderConfig ?? undefined
    })
  }
  source.close()
}

async function muxToMp4(videoBlob: Blob, audioBlob: Blob): Promise<Blob> {
  const videoInput = new Input({
    formats: [MP4],
    source: new BlobSource(videoBlob)
  })
  const audioInput = new Input({
    formats: [MP4],
    source: new BlobSource(audioBlob)
  })

  try {
    const videoTrack = await videoInput.getPrimaryVideoTrack()
    const audioTrack = await audioInput.getPrimaryAudioTrack()
    if (!videoTrack || !audioTrack) {
      throw new ClientMuxDownloadError('client_mux_failed', 0)
    }

    const videoCodec = await videoTrack.getCodec()
    const audioCodec = await audioTrack.getCodec()
    if (!videoCodec || !audioCodec) {
      throw new ClientMuxDownloadError('client_mux_failed', 0)
    }

    const target = new BufferTarget()
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
      target
    })
    const videoSource = new EncodedVideoPacketSource(videoCodec as VideoCodec)
    const audioSource = new EncodedAudioPacketSource(audioCodec as AudioCodec)
    output.addVideoTrack(videoSource, {
      rotation: await videoTrack.getRotation()
    })
    output.addAudioTrack(audioSource)
    await output.start()
    await Promise.all([
      addVideoPackets(videoInput, videoSource),
      addAudioPackets(audioInput, audioSource)
    ])
    await output.finalize()

    if (!target.buffer) {
      throw new ClientMuxDownloadError('client_mux_failed', 0)
    }
    return new Blob([target.buffer], { type: 'video/mp4' })
  } catch (error) {
    if (error instanceof ClientMuxDownloadError) {
      throw error
    }
    console.error(error)
    throw new ClientMuxDownloadError('client_mux_failed', 0)
  } finally {
    videoInput.dispose()
    audioInput.dispose()
  }
}

/**
 * 下载并合成 client_mux 资源。
 */
export async function downloadClientMuxResource(
  intent: ClientMuxDownloadIntent,
  onProgress?: (progress: ClientMuxProgressSnapshot) => void
): Promise<{ blob: Blob; filename: string }> {
  assertClientMuxSize(intent)

  const knownTotalBytes =
    typeof intent.videoTrack.size === 'number' && typeof intent.audioTrack.size === 'number'
      ? intent.videoTrack.size + intent.audioTrack.size
      : intent.size
  const startedAt = Date.now()
  const videoBlob = await fetchTrackWithProgress(
    intent.videoTrack,
    0,
    knownTotalBytes,
    startedAt,
    onProgress
  )
  const audioBlob = await fetchTrackWithProgress(
    intent.audioTrack,
    videoBlob.size,
    knownTotalBytes,
    startedAt,
    onProgress
  )
  onProgress?.({
    stage: 'mux',
    progress: 90,
    downloadedBytes: videoBlob.size + audioBlob.size,
    totalBytes: knownTotalBytes,
    speedBytesPerSecond: null
  })

  const blob = await muxToMp4(videoBlob, audioBlob)
  onProgress?.({
    stage: 'mux',
    progress: 100,
    downloadedBytes: videoBlob.size + audioBlob.size,
    totalBytes: knownTotalBytes,
    speedBytesPerSecond: null
  })
  return { blob, filename: intent.filename }
}
