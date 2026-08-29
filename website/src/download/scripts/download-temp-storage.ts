/**
 * 单次下载临时存储。
 *
 * 本阶段不保存可恢复状态，只在当前下载动作内收集 Response 流并生成 Blob。
 */

/** 单次下载临时文件结果。 */
export interface DownloadTempFileResult {
  /** 写入完成后的 Blob。 */
  blob: Blob
  /** 写入的字节数。 */
  bytesWritten: number
}

/** 单次下载临时写入器。 */
export interface DownloadTempWriter {
  /** 写入一个二进制分片。 */
  write(chunk: Uint8Array): void
  /** 完成写入并返回 Blob。 */
  finish(mimeType: string): DownloadTempFileResult
}

/** 创建当前下载动作内的内存临时写入器。 */
export function createMemoryDownloadTempWriter(): DownloadTempWriter {
  const chunks: Uint8Array[] = []
  let bytesWritten = 0

  return {
    write(chunk: Uint8Array): void {
      chunks.push(chunk.slice())
      bytesWritten += chunk.byteLength
    },
    finish(mimeType: string): DownloadTempFileResult {
      const parts = chunks.map(chunk => chunk.slice().buffer)
      return {
        blob: new Blob(parts, { type: mimeType || 'application/octet-stream' }),
        bytesWritten
      }
    }
  }
}
