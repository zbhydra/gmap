/**
 * Playwright 配置。
 *
 * mock/UI 跑（website.spec.ts / browser-identity.spec.ts）：
 * webServer 把 PUBLIC_API_BASE_URL 指向假地址 http://homepage-api.test，
 * spec 内 page.route 拦截后端请求，验证的是前端 UI 行为。
 *
 * 端口：默认 7630（本工程专属）；允许 E2E_WEB_PORT 覆盖，供并行工作区隔离。
 * 真实后端回归 smoke（seed 注入 / globalSetup）待 W5 购买链路接入时随真实场景重建。
 */
import { defineConfig, devices } from '@playwright/test';

import {
  createChromiumProjectUse,
  createHeadlessChromiumProjectUse,
  createNativeBrowserProjectUse,
} from './scripts/playwright-browser-identity.mjs';

// 允许并行工作区用独立端口跑 e2e，避免复用其他 checkout 的 dev server。
const webPort = process.env.E2E_WEB_PORT ?? '7630';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: './tmp/test-results',
  reporter: [['html', { open: 'never', outputFolder: './tmp/playwright-report' }]],
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      metadata: { browserIdentityHeadlessChromium: true },
      use: createHeadlessChromiumProjectUse(devices['Desktop Chrome']),
    },
    {
      name: 'firefox',
      use: createNativeBrowserProjectUse(devices['Desktop Firefox']),
    },
    {
      name: 'webkit',
      use: createNativeBrowserProjectUse(devices['Desktop Safari']),
    },
    {
      name: 'Mobile Chrome',
      metadata: { browserIdentityMobile: true },
      use: createChromiumProjectUse(devices['Pixel 5'], { mobile: true }),
    },
  ],

  webServer: {
    // mock 跑固定假地址；后续真实后端 smoke 恢复时再按 E2E_REAL_API_BASE_URL 切换。
    command:
      `PUBLIC_API_BASE_URL=${process.env.E2E_REAL_API_BASE_URL ?? 'http://homepage-api.test'} ` +
      `pnpm dev --host 127.0.0.1 --port ${webPort}`,
    url: `http://127.0.0.1:${webPort}`,
    reuseExistingServer: !process.env.E2E_REAL_API_BASE_URL,
    timeout: 300000,
  },
});
