import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

/** 当前配置文件路径，用于解析 dist 与报告目录。 */
const __filename = fileURLToPath(import.meta.url)

/** extension 包根目录。 */
const __dirname = path.dirname(__filename)

/** 默认忽略目录，避免 unit/构建产物进入 Playwright E2E。 */
const testIgnore = ['**/node_modules/**', '**/dist/**', '**/unit/**', '**/mock/**']

export default defineConfig({
  testDir: './tests',
  testIgnore,
  outputDir: './tests/logs/test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  globalSetup: './tests/e2e/global-setup.ts',
  reporter: [['html', { outputFolder: './tests/logs/playwright-report', open: 'never' }], ['list']],

  use: {
    ...devices['Desktop Chrome'],
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      // 013 计划 §0：扩展 context 由 spec 内 launchPersistentContext 自管
      // （非 persistent context 属隐身语义，MV3 扩展 content script 不注入），
      // project 只承载测试编排与 globalSetup。
      name: 'extension-mv3',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
})
