/**
 * Playwright 配置。
 *
 * 两类 e2e 互相隔离，不能混跑：
 * 1. mock/UI 跑（download-workspace.spec.ts / website.spec.ts）：
 *    webServer 把 PUBLIC_API_BASE_URL 指向假地址 http://homepage-api.test，
 *    spec 内 page.route 拦截后端请求，验证的是前端 UI 行为。
 * 2. 真实回归 smoke（parse-download-smoke.spec.ts）：
 *    真实网络，dev server 指向本地真实后端，globalSetup 注入 seed token。
 *    仅在显式 --project=parse-download-smoke 且设了 E2E_REAL_API_BASE_URL 时跑。
 *
 * 隔离手段：
 * - smoke 用独立 project（testMatch 只匹配 smoke spec）；
 * - 现有 4 个浏览器 project 用 testIgnore 排除 smoke spec；
 * - webServer.command 按 E2E_REAL_API_BASE_URL 切 base：设了就指真实后端，
 *   不设维持假地址（保护 mock 跑不受影响）；
 * - globalSetup 内部用同一 env 做守卫，未设时直接 no-op。
 */
import { defineConfig, devices } from '@playwright/test';

import {
  createChromiumProjectUse,
  createHeadlessChromiumProjectUse,
  createNativeBrowserProjectUse,
} from './scripts/playwright-browser-identity.mjs';

// smoke spec 文件匹配模式：新增 project 用它做 testMatch，现有 project 用它做 testIgnore。
const PARSE_SMOKE_SPEC = /parse-download-smoke\.spec\.ts$/;
// Pricing 好评赠送真实账号 smoke，与默认 mock project 完全隔离。
const PRICING_REVIEW_REWARD_SMOKE_SPEC = /pricing-review-reward-smoke\.spec\.ts$/;
const REAL_SMOKE_SPECS = [PARSE_SMOKE_SPEC, PRICING_REVIEW_REWARD_SMOKE_SPEC];

// 真实后端 base；设了才跑真实 smoke，否则 webServer 退回假地址、globalSetup no-op。
const realApiBaseUrl = process.env.E2E_REAL_API_BASE_URL;
// 允许并行工作区用独立端口跑 website e2e，避免复用其他 checkout 的 dev server。
const webPort = process.env.E2E_WEB_PORT ?? '7620';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: './tmp/test-results',
  reporter: [['html', { open: 'never', outputFolder: './tmp/playwright-report' }]],
  // 真实 smoke 的 seed 注入：仅当 E2E_REAL_API_BASE_URL 存在时生效（见 global-setup.ts）。
  globalSetup: './e2e/global-setup.ts',
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
      testIgnore: REAL_SMOKE_SPECS,
    },
    {
      name: 'firefox',
      use: createNativeBrowserProjectUse(devices['Desktop Firefox']),
      testIgnore: REAL_SMOKE_SPECS,
    },
    {
      name: 'webkit',
      use: createNativeBrowserProjectUse(devices['Desktop Safari']),
      testIgnore: REAL_SMOKE_SPECS,
    },
    {
      name: 'Mobile Chrome',
      metadata: { browserIdentityMobile: true },
      use: createChromiumProjectUse(devices['Pixel 5'], { mobile: true }),
      testIgnore: REAL_SMOKE_SPECS,
    },
    {
      // 真实解析+下载回归，仅在显式 --project=parse-download-smoke 时执行。
      name: 'parse-download-smoke',
      metadata: { browserIdentityHeadlessChromium: true },
      testMatch: PARSE_SMOKE_SPEC,
      use: createHeadlessChromiumProjectUse(devices['Desktop Chrome']),
    },
    {
      // 真实 Pricing 好评赠送，仅在显式指定该 project 时执行。
      name: 'pricing-review-reward-smoke',
      metadata: { browserIdentityHeadlessChromium: true },
      testMatch: PRICING_REVIEW_REWARD_SMOKE_SPEC,
      use: createHeadlessChromiumProjectUse(devices['Desktop Chrome']),
    },
  ],

  webServer: {
    // 设了 E2E_REAL_API_BASE_URL 则 dev server 指真实后端（跑 smoke）；
    // 否则维持假地址，mock 跑行为与改动前一致。
    command:
      `PUBLIC_API_BASE_URL=${realApiBaseUrl ?? 'http://homepage-api.test'} ` +
      `pnpm dev --host 127.0.0.1 --port ${webPort}`,
    url: `http://127.0.0.1:${webPort}`,
    // 真实 API 模式必须启动本轮源码；mock 模式继续允许复用开发服务。
    reuseExistingServer: !realApiBaseUrl,
    timeout: 300000,
  },
});
