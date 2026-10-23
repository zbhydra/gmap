/**
 * CSV 签名下载地址的本机真实 HTTP 服务（每个 worker 按需启动一个）。
 *
 * WebKit 对 page.route 拦截返回的 attachment 响应不触发 Playwright 的 download 事件，
 * 真实 HTTP 响应在各内核都会触发。用例只断言下载文件名，响应体固定。
 */
import { createServer } from 'node:http'

let origin: Promise<string> | null = null

function start(): Promise<string> {
  const server = createServer((request, response) => {
    // 路径即文件名，与签名下载响应头里的 attachment 文件名一致
    const filename = (request.url ?? '/').split('?')[0].slice(1)
    response.writeHead(200, { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${filename}"` })
    response.end('#,Name\nRow number,Business name\n1,Cafe\n')
  })
  // 不阻止 worker 退出；用例失败时也无需单独关闭
  server.unref()
  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address === null || typeof address === 'string') reject(new Error('[e2e-csv-download] CSV 服务未拿到 TCP 端口'))
      else resolve(`http://127.0.0.1:${address.port}`)
    })
  })
}

/** 指向本机服务的签名下载地址，下载文件名为 filename。 */
export async function csvDownloadUrl(filename: string): Promise<string> {
  origin ??= start()
  return `${await origin}/${filename}`
}
