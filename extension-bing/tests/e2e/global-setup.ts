/**
 * e2e globalSetup:校验构建产物存在 + 幂等重生成 fixture 页。
 *
 * - 构建产物:assert dist/manifest.json 存在(产物由 `pnpm test:e2e` 的构建前置
 *   `pnpm build` 产出,生产形态 dist;不允许在缺产物时启动浏览器);
 * - fixture:每次运行前调用 generate-fixture.mjs 从黄金样本确定性重合成,
 *   保证 fixture 页永不与生成脚本漂移(手改会被覆盖)。
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export default async function globalSetup(): Promise<void> {
  const distDir = resolve(process.cwd(), 'dist')
  if (!existsSync(resolve(distDir, 'manifest.json'))) {
    throw new Error(
      `[e2e] 缺少构建产物 ${distDir}/manifest.json;请用 pnpm test:e2e 运行(内含构建前置 pnpm build)`
    )
  }

  const generateModule = await import(
    pathToFileURL(resolve(process.cwd(), 'tests/e2e/fixtures/generate-fixture.mjs')).href
  )
  const output = generateModule.generateFixture()
  console.log(`[e2e] fixture 页已从黄金样本重合成: ${output}`)
}
