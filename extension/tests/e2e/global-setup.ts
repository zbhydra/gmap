/**
 * e2e globalSetup：启动本地 mock 服务并等待就绪。
 *
 * dist-e2e 缺失时直接失败并提示构建命令（构建变体把 API/SLS 指到本端口，
 * 不允许误用生产产物跑 e2e）。返回 teardown 函数，由 Playwright 在结束时调用。
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import createMockServer from './mock/server.mjs'

/** 与 scripts/build-e2e.mjs 一致的端口约定。 */
const E2E_MOCK_PORT = Number(process.env.E2E_MOCK_PORT ?? 9577)

export default async function globalSetup() {
  const distE2e = resolve(process.cwd(), 'dist-e2e')
  if (!existsSync(distE2e)) {
    throw new Error(
      `[e2e] 缺少 e2e 构建产物 ${distE2e}，请先执行: pnpm build:e2e`
    )
  }

  const server = createMockServer(E2E_MOCK_PORT)
  await server.start()
  console.log(`[e2e] mock 服务已就绪: http://127.0.0.1:${E2E_MOCK_PORT}`)

  return async () => {
    await server.stop()
    console.log('[e2e] mock 服务已关闭')
  }
}
