/**
 * proxy 下载方法。
 *
 * 流程：
 * 1. POST runner 把 download-v2 响应流写入 OPFS / Memory，并支持 Range 恢复。
 * 2. GET runner 只构造浏览器导航下载，浏览器直接保存文件。
 * 3. POST 存储预检失败时，download-methods 提供完整 GET fallback 合同。
 */

import {
  createMediaDownloadV2Session,
  isTemporaryProxyDownloadNodeError,
  MediaDownloadV2ReauthorizationRequiredError,
  openAuthorizedProxyDownloadV2NodeResponse
} from './media-download-v2'
import {
  AutoRangeResumeExhaustedError,
  hasRangeWriteProgress,
  RangeResumeResponseError,
  RangeStreamInterruptedError,
  pipeRangeResponseToWriter
} from './download-range-stream'
import {
  cleanupResumeTempFile,
  clearDownloadResumeMetadata,
  clearDownloadResumeRecord,
  createResumeObjectUrl,
  openResumeWriter,
  prepareResumeRecord,
  resourceFromResumeRecord,
  updateDownloadResumeRecord,
  type DownloadResumeRecord,
  type ProxyResumeAuthorization
} from './download-resume-store'
import { createObjectUrlCompletionFromResponse } from './response-download'
import {
  buildMediaDownloadV2BrowserUrl,
  type MediaDownloadPreV2Authorization,
  type MediaV2Node
} from './media-api'
import type {
  DownloadMethodContext,
  DownloadMethodOptions
} from './download-methods'
import type { DownloadCompletion, DownloadMethodResult } from './download-completion'
import type { MediaPost } from './types'

class IncompleteProxyDownloadError extends Error {
  readonly downloadedBytes: number
  readonly totalBytes: number | null

  constructor(sourceId: string, downloadedBytes: number, totalBytes: number | null, context: string) {
    super(
      `[proxy-download] ${context}: response ended before expected size, sourceId=${sourceId}, downloadedBytes=${downloadedBytes}, totalBytes=${totalBytes ?? 'unknown'}`
    )
    this.name = 'IncompleteProxyDownloadError'
    this.downloadedBytes = downloadedBytes
    this.totalBytes = totalBytes
  }
}

const MAX_AUTO_RANGE_RESUME_RETRIES = 3

function guessFilename(disposition: string | null, fallback: string): string {
  if (!disposition) {
    return fallback
  }

  const matchedName = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/)
  if (!matchedName?.[1]) {
    return fallback
  }

  try {
    return decodeURIComponent(matchedName[1])
  } catch (error) {
    console.error(error)
    return matchedName[1]
  }
}

function totalBytesForResource(resource: MediaPost): number | null {
  return typeof resource.size === 'number' && resource.size >= 0 ? resource.size : null
}

function assertCompleteDownload(
  sourceId: string,
  downloadedBytes: number,
  totalBytes: number | null,
  context: string
): void {
  if (totalBytes !== null && downloadedBytes < totalBytes) {
    throw new IncompleteProxyDownloadError(sourceId, downloadedBytes, totalBytes, context)
  }
}

function retryStartByteFromError(error: Error): number | null {
  if (error instanceof IncompleteProxyDownloadError) {
    return error.downloadedBytes
  }
  if (error instanceof RangeStreamInterruptedError) {
    return error.downloadedBytes
  }
  return null
}

function logAutoRangeResumeRetry(
  sourceId: string,
  nodeId: number,
  retryCount: number,
  consecutiveNetworkErrors: number,
  startByte: number,
  error: Error,
  action: 'retry_node' | 'switch_node'
): void {
  console.warn(
    `[proxy-download] auto Range resume ${action}, sourceId=${sourceId}, node_id=${nodeId}, retryCount=${retryCount}, consecutiveNetworkErrors=${consecutiveNetworkErrors}/${MAX_AUTO_RANGE_RESUME_RETRIES}, startByte=${startByte}, cause=${error.name}: ${error.message}`
  )
}

function logProxyNodeSkip(sourceId: string, nodeId: number, startByte: number, error: Error): void {
  console.warn(
    `[proxy-download] skip proxy node, sourceId=${sourceId}, node_id=${nodeId}, startByte=${startByte}, cause=${error.name}: ${error.message}`
  )
}

function buildCompletion(
  record: DownloadResumeRecord,
  objectUrl: string,
  bytesWritten: number
): DownloadCompletion {
  return {
    kind: 'object_url',
    objectUrl,
    filename: record.filename,
    revokeAfterMs: 60_000,
    bytesWritten,
    objectUrlSource: 'file',
    cleanup: () => cleanupResumeTempFile(record)
  }
}

type ProxyResponseOpener = (startByte: number) => Promise<Response>
type ProxyNodeResponseOpener = (node: MediaV2Node, startByte: number) => Promise<Response>

function notifyUsedNodeFromResponse(
  response: Response,
  options: DownloadMethodOptions
): number | undefined {
  const nodeId = (response as Response & { tgDownloadNodeId?: number }).tgDownloadNodeId
  if (nodeId !== undefined) {
    options.onUsedNode?.(nodeId)
  }
  return nodeId
}

async function runProxyDownloadToOpfs(
  resource: MediaPost,
  options: DownloadMethodOptions,
  record: DownloadResumeRecord,
  startByte: number,
  openResponse: ProxyResponseOpener
): Promise<DownloadMethodResult> {
  let activeRecord = record
  const response = await openResponse(startByte)
  const usedNodeId = notifyUsedNodeFromResponse(response, options)
  const filename = guessFilename(response.headers.get('content-disposition'), activeRecord.filename)
  const fallbackTotalBytes = activeRecord.totalBytes ?? totalBytesForResource(resource)
  const writer = await openResumeWriter(activeRecord, startByte)
  const result = await pipeRangeResponseToWriter(response, {
    sourceId: resource.sourceId,
    startByte,
    fallbackTotalBytes,
    writer,
    onProgress: options.onProgress,
    onCheckpoint: async snapshot => {
      activeRecord = await updateDownloadResumeRecord(activeRecord, {
        downloadedBytes: snapshot.downloadedBytes,
        totalBytes: snapshot.totalBytes,
        mimeType: snapshot.mimeType,
        filename
      })
    }
  })
  activeRecord = await updateDownloadResumeRecord(activeRecord, {
    downloadedBytes: result.downloadedBytes,
    totalBytes: result.totalBytes,
    mimeType: result.mimeType,
    filename
  })
  assertCompleteDownload(
    resource.sourceId,
    activeRecord.downloadedBytes,
    activeRecord.totalBytes,
    'runProxyDownloadToOpfs'
  )

  const { objectUrl, bytesWritten } = await createResumeObjectUrl(activeRecord)
  const completion = buildCompletion(activeRecord, objectUrl, bytesWritten)
  await clearDownloadResumeMetadata()
  return {
    completion,
    retryCount: 0,
    usedNodeId
  }
}

async function runProxyDownloadToOpfsAcrossNodes(
  resource: MediaPost,
  options: DownloadMethodOptions,
  record: DownloadResumeRecord,
  initialStartByte: number,
  nodes: readonly MediaV2Node[],
  openNodeResponse: ProxyNodeResponseOpener
): Promise<DownloadMethodResult> {
  let retryCount = 0
  let startByte = initialStartByte
  let lastError: Error | null = null

  for (const node of nodes) {
    let nodeConsecutiveNetworkErrors = 0

    while (true) {
      try {
        const result = await runProxyDownloadToOpfs(
          resource,
          options,
          record,
          startByte,
          resumeStartByte => openNodeResponse(node, resumeStartByte)
        )
        return {
          ...result,
          retryCount: result.retryCount + retryCount
        }
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error
        }

        const retryStartByte = retryStartByteFromError(error)
        if (retryStartByte !== null) {
          const hasTransferredBytes = hasRangeWriteProgress(startByte, retryStartByte)
          startByte = retryStartByte
          retryCount += 1
          nodeConsecutiveNetworkErrors = hasTransferredBytes
            ? 0
            : nodeConsecutiveNetworkErrors + 1
          lastError = error
          const shouldSwitchNode =
            nodeConsecutiveNetworkErrors >= MAX_AUTO_RANGE_RESUME_RETRIES
          logAutoRangeResumeRetry(
            resource.sourceId,
            node.node_id,
            retryCount,
            nodeConsecutiveNetworkErrors,
            retryStartByte,
            error,
            shouldSwitchNode ? 'switch_node' : 'retry_node'
          )
          if (shouldSwitchNode) {
            break
          }
          continue
        }

        if (
          isTemporaryProxyDownloadNodeError(error) ||
          error instanceof RangeResumeResponseError
        ) {
          lastError = error
          logProxyNodeSkip(resource.sourceId, node.node_id, startByte, error)
          break
        }

        throw error
      }
    }
  }

  throw new AutoRangeResumeExhaustedError(
    resource.sourceId,
    startByte,
    totalBytesForResource(resource),
    retryCount,
    lastError ?? new Error('[proxy-download] all proxy nodes exhausted'),
    {
      reason: 'proxy_nodes_exhausted',
      retryLimit: MAX_AUTO_RANGE_RESUME_RETRIES,
      nodeCount: nodes.length
    }
  )
}

async function runProxyDownloadToMemory(
  resource: MediaPost,
  openResponse: ProxyResponseOpener,
  options: DownloadMethodOptions
): Promise<DownloadMethodResult> {
  const response = await openResponse(0)
  const usedNodeId = notifyUsedNodeFromResponse(response, options)
  const completion = await createObjectUrlCompletionFromResponse(
    response,
    resource.filename,
    options.onProgress,
    '[proxy-download] runProxyDownloadToMemory'
  )
  return {
    completion,
    retryCount: 0,
    usedNodeId
  }
}

function proxyAuthorizationFromRecord(
  record: DownloadResumeRecord
): ProxyResumeAuthorization | null {
  return record.methodState.kind === 'single_file_range'
    ? record.methodState.proxyAuthorization ?? null
    : null
}

function proxyAuthorizationForRecord(
  resource: MediaPost,
  authorization: MediaDownloadPreV2Authorization
): ProxyResumeAuthorization {
  if (authorization.downloadMode !== 'proxy') {
    throw new Error(
      `[proxy-download] proxyAuthorizationForRecord: authorization mode mismatch, sourceId=${resource.sourceId}, actual=${authorization.downloadMode}`
    )
  }

  return {
    token: authorization.token,
    expiresAt: authorization.expiresAt,
    downloadMode: 'proxy',
    nodes: authorization.nodes
  }
}

function hasFreshProxyAuthorization(record: DownloadResumeRecord): boolean {
  const authorization = proxyAuthorizationFromRecord(record)
  if (!authorization) {
    return false
  }

  return authorization.expiresAt > Math.floor(Date.now() / 1000)
}

/** 判断 proxy 恢复记录是否可用。 */
export function canResumeProxyDownload(
  record: DownloadResumeRecord,
  context: DownloadMethodContext
): boolean {
  void context
  return (
    record.mode === 'proxy' &&
    (
      (
        record.storageType === 'opfs' &&
        record.recoveryMode === 'resumable' &&
        record.methodState.kind === 'single_file_range' &&
        hasFreshProxyAuthorization(record)
      ) ||
      (
        record.storageType === 'indexeddb' &&
        record.recoveryMode === 'restartable'
      )
    )
  )
}

/** 清理 proxy 恢复记录。 */
export async function clearProxyResume(record: DownloadResumeRecord): Promise<void> {
  await clearDownloadResumeRecord(record)
}

/** 恢复 proxy 下载。 */
async function runProxyResumeDownload(
  record: DownloadResumeRecord,
  resource: MediaPost,
  context: DownloadMethodContext,
  options: DownloadMethodOptions
): Promise<DownloadMethodResult> {
  if (record.storageType === 'indexeddb' && record.recoveryMode === 'restartable') {
    await clearDownloadResumeRecord(record)
    return runProxyDownloadFromStartWithReauthorization(resource, context, options)
  }

  if (
    record.storageType !== 'opfs' ||
    record.recoveryMode !== 'resumable' ||
    record.methodState.kind !== 'single_file_range'
  ) {
    await clearDownloadResumeRecord(record)
    throw new Error(
      `[proxy-download] runProxyDownload: unsupported resume record, sourceId=${record.sourceId}, storageType=${record.storageType}, recoveryMode=${record.recoveryMode}`
    )
  }

  const authorization = proxyAuthorizationFromRecord(record)
  if (!authorization) {
    await clearDownloadResumeRecord(record)
    throw new Error(
      `[proxy-download] runProxyDownload: missing stored proxy authorization, sourceId=${record.sourceId}`
    )
  }
  const openNodeResponse = (node: MediaV2Node, startByte: number): Promise<Response> =>
    openAuthorizedProxyDownloadV2NodeResponse(
      resource,
      context,
      authorization,
      node,
      startByte > 0 ? startByte : null
    )

  try {
    return await runProxyDownloadToOpfsAcrossNodes(
      resource,
      options,
      record,
      record.downloadedBytes,
      authorization.nodes,
      openNodeResponse
    )
  } catch (error) {
    if (error instanceof AutoRangeResumeExhaustedError) {
      throw error
    }
    console.error(error)
    await clearDownloadResumeRecord(record)
    throw error
  }
}

async function runProxyDownloadFromStart(
  resource: MediaPost,
  context: DownloadMethodContext,
  options: DownloadMethodOptions
): Promise<DownloadMethodResult> {
  const session = await createMediaDownloadV2Session(resource, context)
  const openResponse = (startByte: number): Promise<Response> =>
    session.openNextProxyResponse(startByte > 0 ? startByte : null)
  const record = await prepareResumeRecord(resource, context, {
    proxyAuthorization: proxyAuthorizationForRecord(resource, session.getAuthorization()),
    preferredNodeId: resource.preferredNodeId
  })
  if (record.storageType !== 'opfs') {
    const result = await runProxyDownloadToMemory(resource, openResponse, options)
    await clearDownloadResumeRecord(record)
    return { ...result, latestCreditsBalance: session.getLatestCreditsBalance() }
  }

  const openNodeResponse = (node: MediaV2Node, startByte: number): Promise<Response> =>
    session.openProxyNodeResponse(node, startByte > 0 ? startByte : null)
  const authorization = session.getAuthorization()
  const result = await runProxyDownloadToOpfsAcrossNodes(
    resource,
    options,
    record,
    0,
    authorization.nodes,
    openNodeResponse
  )
  return {
    ...result,
    latestCreditsBalance: session.getLatestCreditsBalance()
  }
}

async function runProxyDownloadFromStartWithReauthorization(
  resource: MediaPost,
  context: DownloadMethodContext,
  options: DownloadMethodOptions
): Promise<DownloadMethodResult> {
  try {
    return await runProxyDownloadFromStart(resource, context, options)
  } catch (error) {
    if (!(error instanceof MediaDownloadV2ReauthorizationRequiredError)) {
      throw error
    }

    console.error(error)
    const result = await runProxyDownloadFromStart(resource, context, options)
    return {
      ...result,
      retryCount: result.retryCount + 1
    }
  }
}

/** 执行浏览器原生 GET proxy 下载，不创建前端恢复记录。 */
export async function runProxyBrowserGetDownload(
  resource: MediaPost,
  _resumeRecord: DownloadResumeRecord | undefined,
  context: DownloadMethodContext,
  _options: DownloadMethodOptions
): Promise<DownloadMethodResult> {
  const session = await createMediaDownloadV2Session(resource, context)
  const authorization = session.getAuthorization()
  const node = authorization.nodes[0]
  if (!node) {
    throw new Error(
      `[proxy-download] runProxyBrowserGetDownload: empty download-v2 node list, sourceId=${resource.sourceId}`
    )
  }

  return {
    completion: {
      kind: 'navigation_url',
      url: buildMediaDownloadV2BrowserUrl(node.url, authorization.token),
      filename: resource.filename,
      referrerPolicy: 'no-referrer'
    },
    retryCount: 0,
    latestCreditsBalance: session.getLatestCreditsBalance()
  }
}

/** 执行后端代理下载。 */
export async function runProxyDownload(
  resource: MediaPost,
  resumeRecord: DownloadResumeRecord | undefined,
  context: DownloadMethodContext,
  options: DownloadMethodOptions
): Promise<DownloadMethodResult> {
  if (!resumeRecord) {
    return runProxyDownloadFromStartWithReauthorization(resource, context, options)
  }

  return runProxyResumeDownload(
    resumeRecord,
    resourceFromResumeRecord(resumeRecord),
    context,
    options
  )
}
