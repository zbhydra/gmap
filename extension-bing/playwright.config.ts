import { defineConfig, devices } from '@playwright/test'

/** 默认忽略目录,避免 unit/构建产物进入 Playwright E2E。 */
const testIgnore = ['**/node_modules/**', '**/dist/**', '**/unit/**', '**/mocks/**']

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
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      // T1 §7 U1:扩展 context 由 spec 内 launchPersistentContext 自管
      // (headful + --load-extension=dist),project 只承载测试编排与 globalSetup。
      name: 'extension-mv3',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
})
