#!/usr/bin/env node
/**
 * e2e 构建变体（013 计划 §0）。
 *
 * 与生产构建的差异：
 * - `__API_BASE_URL__` 与 SLS WebTracking endpoint 全部指向本地 mock 服务
 *   （端口 E2E_MOCK_PORT，默认 9577）。实测口径：Chromium 下 context.route
 *   能拦截 MV3 SW 请求（spec 内已对 127.0.0.1 显式放行），构建期改指向是
 *   不依赖 route 的双保险，保证零外网、零真实遥测；
 * - 产物输出 dist-e2e（playwright project extension-mv3 以 --load-extension 加载）；
 * - 不跑 vue-tsc / zip（类型与产物校验由 `pnpm build` 覆盖）。
 */

import { build } from 'vite'

const port = process.env.E2E_MOCK_PORT ?? '9577'
const mockOrigin = `http://127.0.0.1:${port}`

process.env.NODE_ENV = process.env.NODE_ENV ?? 'development'
process.env.EXTENSION_BUILD_OUT_DIR = 'dist-e2e'
process.env.EXTENSION_API_BASE_URL = mockOrigin
process.env.EXTENSION_WEBSITE_BASE_URL = process.env.EXTENSION_WEBSITE_BASE_URL ?? mockOrigin
process.env.EXTENSION_ALI_SLS_ENDPOINT = mockOrigin
process.env.EXTENSION_ALI_SLS_LOGSTORE = 'gmaps-mark-log'
process.env.EXTENSION_ALI_SLS_ENABLED = 'true'

try {
  await build({ mode: 'development' })
  console.log(`[build:e2e] 构建完成，API/SLS 指向本地 mock: ${mockOrigin}`)
} catch (error) {
  console.error('[build:e2e] 构建失败:', error)
  process.exit(1)
}
