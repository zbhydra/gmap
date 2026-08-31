/**
 * 面板触发的文件下载（content 上下文，Blob + a[download]，调研 §8 竞品同形态）。
 *
 * 不新增 chrome.downloads 权限（manifest 最小权限）；blob URL 延迟回收，
 * 给浏览器下载管线留出启动窗口。
 */

/**
 * 把内容作为文件触发浏览器下载。
 *
 * @param content 文件内容（文本格式为字符串，XLSX 为二进制字节）。
 * @param filename 下载文件名。
 * @param mime MIME 类型（默认 text/csv）。
 */
export function downloadFile(content: BlobPart, filename: string, mime = 'text/csv'): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
