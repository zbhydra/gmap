/**
 * 真实 Bing smoke(T1 §6 第二层:辅助验收,允许条件化失败不阻塞)。
 *
 * 与离线 fixture 层隔离的实网用例:打开真实 bing.com/maps 演示词,断言
 * 面板注入 + Start Extraction 存在 + 列表进入检测态(最多 60s)。
 *
 * - 不复用 harness 默认 DNS 断绝(会挡真实 Bing):单独以 resolverRules 覆盖
 *   启动 context,仍加载 dist 构建产物扩展;
 * - 遥测域定点断 DNS(SLS WebTracking 生产端点 + 占位后端域):install/search
 *   等打点在实网下不得污染生产日志库,且规避离线层同款 route 注册竞态
 *   (与 vite.config.ts DEFAULT_PROD_ALI_SLS_* / DEFAULT_PROD_API_BASE_URL 同源,
 *   变更需同步);bing.com 及其 CDN 一律真实出网;
 * - 降级条件自动化(T1 §6「遇人机验证/改版自动跳过并记录」):人机验证、
 *   打开/注入/检测超时、改版迹象 → test.skip 并在输出记录原因,本用例
 *   绝不让整体 test:e2e 退出码变红;
 * - 不点 Start:采集/导出行为验收归离线 fixture 层(第一层主验收)。
 */

import { expect, test, type Page } from '@playwright/test'
import { MAPS_URL, launchExtensionContext, waitForExtensionServiceWorker } from './harness'

/** 面板根(自建 fixed 容器内的直插面板,与离线用例同选择器)。 */
const PANEL_ROOT = '#bing-maps-scraper-panel-host .bing-panel-root'

/**
 * 遥测域定点断网规则(host-resolver-rules 逐条 MAP ~NOTFOUND)。
 * DNS 层确定性失败:install 打点在 SW 注册与任何 route 生效前即可能发出。
 */
const TELEMETRY_RESOLVER_RULES = [
  'MAP bingmaps.ap-southeast-1.log.aliyuncs.com ~NOTFOUND',
  'MAP api.example.com ~NOTFOUND'
]

/** 条件化跳过:原因落到测试输出与报告标注(skip-reason),不阻塞整体退出码。 */
function skipSmoke(reason: string): void {
  console.warn(`[real-bing-smoke] SKIP: ${reason}`)
  test.info().annotations.push({ type: 'skip-reason', description: reason })
  test.skip(true, reason)
}

/**
 * 人机验证/挑战页启发式探测:命中返回特征描述,未命中返回 null。
 * Bing 挑战页无稳定单一标记,按标题/正文文案 + 挑战表单特征多路匹配。
 */
async function detectChallenge(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      const title = document.title.toLowerCase()
      const bodyText = (document.body?.innerText ?? '').slice(0, 4000).toLowerCase()
      if (
        /verify (that you are|you are) human|human verification|are you human|unusual traffic/.test(
          `${title} ${bodyText}`
        )
      ) {
        return `页面文案命中人机验证特征(标题: ${document.title})`
      }
      if (
        document.querySelector(
          '#challengeForm, form[action*="challenge"], iframe[src*="challenge"], input[name="bpaccuracy"]'
        )
      ) {
        return '页面存在挑战表单/iframe 元素'
      }
      return null
    })
  } catch {
    // 页面已跳转/销毁等评测环境异常:按未命中处理,由后续超时路径兜底
    return null
  }
}

/**
 * 落地域偏离描述(manifest 仅匹配 https://www.bing.com/maps*):真实环境常按
 * 地域 302 到 cn.bing.com 等子域,content script 不注入——记录实际落地域供归因。
 */
async function describeLandingHost(page: Page): Promise<string> {
  try {
    const host = new URL(page.url()).host
    return host && host !== 'www.bing.com' ? `;实际落地域 ${host}` : ''
  } catch {
    return ''
  }
}

test.describe('真实 Bing smoke(允许条件化跳过)', () => {
  test('真实 bing.com/maps 可达 → 面板注入 → 列表检测态(最多 60s)', async () => {
    // 全链路最坏路径(SW 20s + 打开 45s + 面板 20s + 按钮 10s + 检测 60s)有界
    test.setTimeout(180_000)

    const context = await launchExtensionContext({ resolverRules: TELEMETRY_RESOLVER_RULES })
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      // 扩展产物加载成功的硬前提(SW 未注册 = 产物问题,不属降级条件)
      await waitForExtensionServiceWorker(context)

      try {
        await page.goto(MAPS_URL, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      } catch (error) {
        skipSmoke(`真实 Bing Maps 打开失败(网络不可达或被环境拦截): ${String(error)}`)
      }

      const challengeOnLoad = await detectChallenge(page)
      if (challengeOnLoad) {
        skipSmoke(`人机验证拦截: ${challengeOnLoad}`)
      }

      // 面板容器出现(T1 §6:断言面板出现且检测态正确)
      const panelRoot = page.locator(PANEL_ROOT)
      try {
        await expect(panelRoot).toBeVisible({ timeout: 20_000 })
      } catch {
        skipSmoke(
          `面板容器 20s 未出现:content script 未注入(疑似 bing.com/maps 形态变化${await describeLandingHost(
            page
          )})`
        )
      }

      const startButton = panelRoot.getByRole('button', { name: 'Start Extraction' })
      try {
        await expect(startButton).toBeVisible({ timeout: 10_000 })
      } catch {
        skipSmoke('面板已注入但未见 Start Extraction 按钮(疑似面板文案或结构变化)')
      }

      // 列表检测态 = listDetected → Start 解禁;60s 上限(T1 §6 smoke 口径)
      try {
        await expect(startButton).toBeEnabled({ timeout: 60_000 })
      } catch {
        const challenge = await detectChallenge(page)
        skipSmoke(
          challenge ??
            '60s 内列表未进入检测态:适配器选择器未命中(疑似 Bing DOM 改版,由远程配置热修兜底)'
        )
      }
    } finally {
      await context.close()
    }
  })
})
