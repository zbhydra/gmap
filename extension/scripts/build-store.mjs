#!/usr/bin/env node
/**
 * 上架渠道构建（013 A13，U11）：chrome / edge / firefox 三渠道独立产物 + zip。
 *
 * 用法：
 * - `pnpm build:store`              → 三渠道全量（chrome → dist + dist.zip；
 *                                     edge → dist-edge + dist-edge.zip；
 *                                     firefox → dist-firefox + dist-firefox.zip）
 * - `pnpm build:store firefox`      → 只构建指定渠道（可多值：`build:store edge firefox`）
 *
 * 与 `pnpm build` 的差异：
 * - 全部 NODE_ENV=production（商店产物口径：压缩、生产默认域名）；
 * - 每个渠道独立子进程跑 `vite build`——vite.config.ts 的 manifest 工厂在模块
 *   加载时读取 EXTENSION_BUILD_TARGET，同进程连续 build 会复用首次解析结果，
 *   子进程隔离保证每渠道拿到自己的 manifest；
 * - 不跑 vue-tsc（类型校验由 `pnpm build` / `pnpm type-check` 覆盖）。
 *
 * Edge = Chromium 同款 manifest，独立产物仅为上架归档（产物内容与 chrome 渠道
 * 一致，构建两次以保持「每渠道产物来自独立构建」的可追溯性）。
 */

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(scriptDir, '..')
const viteBin = join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const zipScript = join(scriptDir, 'zip-dist.js')

const CHANNELS = {
  chrome: { outDir: 'dist', zip: 'dist.zip' },
  edge: { outDir: 'dist-edge', zip: 'dist-edge.zip' },
  firefox: { outDir: 'dist-firefox', zip: 'dist-firefox.zip' }
}

const requested = process.argv.slice(2)
const validTargets = Object.keys(CHANNELS)
const invalid = requested.filter(target => !validTargets.includes(target))
if (invalid.length > 0) {
  console.error(`[build:store] 非法渠道: ${invalid.join(', ')}（可选 ${validTargets.join(' | ')}）`)
  process.exit(1)
}
const targets = requested.length > 0 ? requested : validTargets

for (const target of targets) {
  const { outDir, zip } = CHANNELS[target]
  console.log(`\n=== [build:store] 构建 ${target} → ${outDir}/ ===`)

  const result = spawnSync(process.execPath, [viteBin, 'build'], {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      EXTENSION_BUILD_TARGET: target,
      EXTENSION_BUILD_OUT_DIR: outDir
    }
  })
  if (result.status !== 0) {
    console.error(`[build:store] ${target} 构建失败`)
    process.exit(result.status ?? 1)
  }

  const zipped = spawnSync(process.execPath, [zipScript, outDir, zip], {
    stdio: 'inherit',
    cwd: projectRoot
  })
  if (zipped.status !== 0) {
    console.error(`[build:store] ${target} 打包失败`)
    process.exit(zipped.status ?? 1)
  }
}

console.log('\n✅ [build:store] 全部渠道产物完成:')
for (const target of targets) {
  console.log(`   ${target}: ${CHANNELS[target].outDir}/ → ${CHANNELS[target].zip}`)
}
