#!/usr/bin/env node
/**
 * 真实界面 e2e 构建变体（013 域真实界面层）。
 *
 * 与生产构建的差异：
 * - API base 指向本地真实 backend（`backend/config.yaml` 的 127.0.0.1:7600），
 *   插件的 usage 查询/上报、enrich、订阅等请求走真实验证链，不再依赖
 *   route mock；
 * - SLS WebTracking 构建期禁用（enabled=false）：真实 e2e 不得污染生产
 *   SLS 日志库，打点失败由插件打点层容错，不阻塞采集；
 * - 产物输出 dist-real（playwright 以 --load-extension=dist-real 加载）；
 * - 不跑 vue-tsc / zip（类型与产物校验由 `pnpm build` 覆盖）。
 *
 * 运行前置：本地 backend 已启动（`cd backend && uv run server`），未启动时
 * 登录态用例由 globalSetup 条件跳过，匿名用例不受影响。
 */

import { build } from 'vite'

process.env.NODE_ENV = process.env.NODE_ENV ?? 'development'
process.env.EXTENSION_BUILD_OUT_DIR = 'dist-real'
process.env.EXTENSION_API_BASE_URL = 'http://127.0.0.1:7600'
process.env.EXTENSION_ALI_SLS_ENABLED = 'false'

try {
  await build({ mode: 'development' })
  console.log('[build:real] 构建完成，API 指向本地 backend http://127.0.0.1:7600，SLS 已禁用')
} catch (error) {
  console.error('[build:real] 构建失败:', error)
  process.exit(1)
}
