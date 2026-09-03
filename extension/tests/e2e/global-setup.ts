/**
 * e2e globalSetup:校验 dist-real 构建产物 + 条件 seed 登录态。
 *
 * - 构建产物:断言 dist-real/manifest.json 存在(产物由 `pnpm test:e2e` 的
 *   构建前置 `pnpm build:real` 产出);缺产物直接失败,不启动浏览器;
 * - 登录态 seed:探测本地真实 backend(127.0.0.1:7600)可达时,spawn 后端
 *   `e2e_seed_user.py --scenario maps-extension-pro`(创建 e2e 账号 + maps_extension
 *   Pro 订阅 + 签发与插件 exchange 同构的 token 对并注册 Redis 白名单),
 *   结果写入 process.env.E2E_MAPS_AUTH 供登录态 spec 注入 chrome.storage;
 * - backend 不可达或 seed 失败只降级(登录态用例 skip,匿名用例不受影响),
 *   绝不让 globalSetup 抛错杀掉整轮——产物缺失除外(那是 runner 用法错误)。
 */

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/** 后端项目根目录:extension/ 与 backend/ 同级父目录下。 */
const BACKEND_DIR = resolve(process.cwd(), '../backend')
/** 后端 python,用于跑 seed 脚本;runner 可用 E2E_BACKEND_PYTHON 显式覆盖。 */
const BACKEND_PYTHON = process.env.E2E_BACKEND_PYTHON || resolve(BACKEND_DIR, '.venv/bin/python')
/** 本地真实 backend origin(与 scripts/build-real.mjs 的 EXTENSION_API_BASE_URL 同源)。 */
const BACKEND_API_ORIGIN = 'http://127.0.0.1:7600'
/** 登录态 seed 场景(e2e_seed_user.py 显式选择)。 */
const SEED_SCENARIO = 'maps-extension-pro'

/** seed 脚本 stdout 最后一行 JSON 的结构(与 e2e_seed_user.py 输出同源)。 */
interface SeedResult {
  token: string
  refresh_token: string
  expires_in: number
  user_id: number
  email: string
  user: {
    user_id: number
    email: string | null
    full_name: string | null
    avatar_url: string | null
    created_at: number
    credits_balance: number
  }
  scenario: string
}

/** 探测本地 backend 是否存活:任意 HTTP 响应(含 404)都算存活。 */
async function isBackendReachable(): Promise<boolean> {
  try {
    await fetch(BACKEND_API_ORIGIN, { signal: AbortSignal.timeout(2000), method: 'GET' })
    return true
  } catch {
    return false
  }
}

/** 同步执行 seed 脚本并解析 stdout 最后一行 JSON(website 真实 smoke 同款)。 */
function runSeed(): SeedResult {
  const stdout = execFileSync(
    BACKEND_PYTHON,
    ['scripts/e2e_seed_user.py', '--action', 'seed', '--scenario', SEED_SCENARIO],
    { cwd: BACKEND_DIR, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }
  )
  const lastLine = stdout.trim().split('\n').pop() ?? ''
  return JSON.parse(lastLine) as SeedResult
}

export default async function globalSetup(): Promise<void> {
  const distDir = resolve(process.cwd(), 'dist-real')
  if (!existsSync(resolve(distDir, 'manifest.json'))) {
    throw new Error(
      '[e2e] 缺少构建产物 dist-real/manifest.json;请用 pnpm test:e2e 运行(内含构建前置 pnpm build:real)'
    )
  }

  if (!(await isBackendReachable())) {
    console.log(
      '[e2e] 本地 backend(127.0.0.1:7600)不可达:登录态用例将跳过,匿名用例不受影响。' +
        '启动方式:cd backend && uv run server'
    )
    return
  }

  try {
    const seed = runSeed()
    process.env.E2E_MAPS_AUTH = JSON.stringify({
      access_token: seed.token,
      refresh_token: seed.refresh_token,
      user: seed.user
    })
    console.log(`[e2e] ${SEED_SCENARIO} 登录态已 seed: user_id=${seed.user_id}`)
  } catch (error) {
    // seed 失败(DB/Redis 异常等)只降级登录态用例,详细信息打满便于定位
    console.error('[e2e] 登录态 seed 失败,登录态用例将跳过:', error)
  }
}
