/**
 * 真实 Bing 登录态 Pro 采集(016 T1 §6 登录态主验收)。
 *
 * 登录流程不做 e2e(2026-09-02 hydra 拍板):登录态由 globalSetup 经后端
 * e2e_seed_user.py(bing-extension-pro 场景)签发真实 token(与插件 exchange
 * 同构、已注册 Redis 白名单、账号持 maps_extension Pro 订阅),spec 内经
 * 扩展 service worker 直写 chrome.storage 三键注入——auth/me 与
 * subscription/status?product_kind=maps_extension 全部走本地真实 backend
 * 的真实验证链。
 *
 * 断言链:PRO 徽标(真实订阅判定生效)→ Start → Pro 进度文案 → 采集无
 * 20 条截断(计数 > 20)→ 中途手动 Stop → 补全中首帧锁定 Export/Go Back
 * 并显示进度(本地真实 backend /maps/enrich 回填)→ 放行 → 部分数据导出
 * (Emails/社媒 5 列脱离 ###PRO### 占位,末行为数据行,无免费提示)。真实免费档
 * 首轮解析即达限,手动 Stop 只在 Pro 长窗口内可测。
 */

import { readFileSync } from 'node:fs'
import { expect, test, type Locator } from '@playwright/test'
import {
  EXPECTED_HEADERS,
  FREE_LIMIT_NOTE,
  FREE_ROW_LIMIT,
  MAPS_URL,
  csvLines,
  detectChallenge,
  describeLandingHost,
  injectExtensionAuth,
  launchRealBingContext,
  panel,
  parseCsvLine,
  readDownload,
  readMonthlyUsage,
  reportMonthlyUsage,
  skipSmoke,
  startButton,
  waitForExtensionServiceWorker,
  type BingE2eAuth
} from './harness'

/** globalSetup 注入的登录态 env;缺失 = 本地 backend 不可用或 seed 失败。 */
const rawAuth = process.env.E2E_BING_AUTH
const auth: BingE2eAuth | null = rawAuth ? (JSON.parse(rawAuth) as BingE2eAuth) : null

/** 免费行云端挖掘列占位符(与 parser PRO_ENHANCEMENT_PLACEHOLDER 同值)。 */
const PRO_PLACEHOLDER = '###PRO###'

/** 云端挖掘列在 18 列表头中的下标(Emails / Social Medias / FB / IG / Twitter)。 */
const ENRICH_COLUMN_INDEXES = [13, 14, 15, 16, 17]

/** Website 列在 18 列表头中的下标。 */
const WEBSITE_COLUMN_INDEX = 11

/** Stop 到放行之间的面板轨迹。 */
interface FinishingTrace {
  /** 完成态首帧 Export 是否已禁用。 */
  exportDisabledOnFirstFrame: boolean
  /** 完成态首帧 Go Back 是否已禁用。 */
  goBackDisabledOnFirstFrame: boolean
  /** 补全中状态行依次出现过的文本。 */
  statusTexts: string[]
}

/**
 * 在 Stop 前挂页内观察器,放行时返回轨迹。真实后端有共享缓存,补全窗口可能被压到
 * 毫秒级,locator 轮询会错过首帧;这里要证明的正是「第一帧就已锁定」。
 */
function traceFinishing(panelRoot: Locator): Promise<FinishingTrace> {
  return panelRoot.evaluate(
    root =>
      new Promise<FinishingTrace>(resolve => {
        const buttonByLabel = (label: string): HTMLButtonElement | undefined =>
          [...root.querySelectorAll('button')].find(item => item.textContent?.includes(label))
        const statusTexts: string[] = []
        let firstFrame: { exportDisabled: boolean; goBackDisabled: boolean } | null = null
        const observer = new MutationObserver(() => {
          const exportButton = buttonByLabel('Export Leads List')
          const goBackButton = buttonByLabel('Go Back')
          if (!exportButton || !goBackButton) {
            return
          }
          firstFrame ??= {
            exportDisabled: exportButton.disabled,
            goBackDisabled: goBackButton.disabled
          }
          const status = root.querySelector('[role="status"]')
          if (status === null) {
            observer.disconnect()
            resolve({
              exportDisabledOnFirstFrame: firstFrame.exportDisabled,
              goBackDisabledOnFirstFrame: firstFrame.goBackDisabled,
              statusTexts
            })
            return
          }
          const text = status.textContent ?? ''
          if (statusTexts.at(-1) !== text) {
            statusTexts.push(text)
          }
        })
        observer.observe(root, { childList: true, subtree: true, characterData: true })
      })
  )
}

test.describe('真实 Bing 登录态采集(Pro,token 直注)', () => {
  test('token 注入 → PRO 徽标 → 采集无 20 截断 → 手动 Stop → 部分导出', async () => {
    // Pro 采集持续翻页(滚动加载 2s 级 × 多轮)+ Stop 收敛,放宽有界上限
    test.setTimeout(360_000)
    if (!auth) {
      skipSmoke('无登录态可注入:本地 backend 未运行或 seed 失败(见 globalSetup 输出)')
      // skipSmoke 内 test.skip 立即中断用例;return 仅让 TS 收窄 auth 非空
      return
    }

    const context = await launchRealBingContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const serviceWorker = await waitForExtensionServiceWorker(context)
      // 先注入再导航:content script 随文档启动时读到的即登录态
      await injectExtensionAuth(serviceWorker, auth)

      try {
        await page.goto(MAPS_URL, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      } catch (error) {
        skipSmoke(`真实 Bing Maps 打开失败(网络不可达或被环境拦截): ${String(error)}`)
      }

      const challengeOnLoad = await detectChallenge(page)
      if (challengeOnLoad) {
        skipSmoke(`人机验证拦截: ${challengeOnLoad}`)
      }

      const panelRoot = panel(page)
      try {
        await expect(panelRoot).toBeVisible({ timeout: 20_000 })
      } catch {
        skipSmoke(
          `面板容器 20s 未出现:content script 未注入(疑似 bing.com/maps 形态变化${await describeLandingHost(
            page
          )})`
        )
      }

      // ===== 以下为插件行为硬断言(失败即 fail,不降级) =====
      // PRO 徽标 = 真实登录链生效:auth/me 验签 + maps_extension 订阅判定 month
      const proBadge = panelRoot.getByRole('button', { name: 'PRO', exact: true })
      await expect(proBadge).toBeVisible({ timeout: 30_000 })

      const start = startButton(page)
      await expect(start).toBeEnabled({ timeout: 60_000 })

      const usageBefore = await readMonthlyUsage(context, serviceWorker)
      const anonymousBefore = await readMonthlyUsage(context, serviceWorker, true)
      await start.click()

      // Pro 进度文案变体(feat.md 采集中态);首屏条数随落地形态变化,越过免费上限后再
      // Stop,否则「无 20 条截断」无从证明
      const progress = panelRoot.getByText(/Have found \d+ businesses and still going\.\.\./)
      await expect(progress).toBeVisible({ timeout: 30_000 })
      await expect
        .poll(async () => Number((await progress.innerText()).match(/\d+/)?.[0] ?? 0), {
          timeout: 60_000
        })
        .toBeGreaterThan(FREE_ROW_LIMIT)

      // 用真实签名的过期 token 模拟采集中到期，必须在扣量前 401 并刷新。
      await serviceWorker.evaluate(token => chrome.storage.local.set({ auth_access_token: token }), auth.expired_access_token)
      const rejectedReport = context.waitForEvent('response', { predicate: response =>
        new URL(response.url()).pathname === '/api/client/maps/usage/report' && response.status() === 401
      })
      const reportedRequest = context.waitForEvent('request', { predicate: request =>
        new URL(request.url()).pathname === '/api/client/maps/usage/report' && request.method() === 'POST'
      })
      const finishingTrace = traceFinishing(panelRoot)
      await panelRoot.getByRole('button', { name: 'Stop', exact: true }).click()
      await expect(panelRoot.getByText('Manually stopped.')).toBeVisible({ timeout: 30_000 })

      // 计数 N > 20 = 无免费截断的实证;免费超限警告条不出现
      const foundText = await panelRoot.getByText(/^\d+ businesses found\.$/).innerText()
      const found = Number(foundText.match(/^(\d+) businesses found\.$/)?.[1] ?? 0)
      expect(found, `采集计数应超免费上限 20,实际 ${found}`).toBeGreaterThan(FREE_ROW_LIMIT)
      await expect(panelRoot.getByText(FREE_LIMIT_NOTE)).toHaveCount(0)

      // 补全中:完成边沿首帧即锁定;放行由面板状态决定,不再猜测响应到达后的时序
      const trace = await finishingTrace
      expect(trace.exportDisabledOnFirstFrame, '完成态首帧 Export 应禁用').toBe(true)
      expect(trace.goBackDisabledOnFirstFrame, '完成态首帧 Go Back 应禁用').toBe(true)
      expect(trace.statusTexts[0]).toContain('Finishing up…')
      const exportButton = panelRoot.getByRole('button', { name: 'Export Leads List' })
      await expect(exportButton).toBeEnabled()
      await expect(panelRoot.getByRole('button', { name: 'Go Back', exact: true })).toBeEnabled()
      await expect(panelRoot.getByRole('status')).toHaveCount(0)
      expect((await rejectedReport).status()).toBe(401)
      expect((await readMonthlyUsage(context, serviceWorker)).used).toBe(usageBefore.used + found)
      expect((await readMonthlyUsage(context, serviceWorker, true)).used).toBe(anonymousBefore.used)
      expect(await serviceWorker.evaluate(() => chrome.storage.local.get('bing_usage_pending'))).toEqual({ bing_usage_pending: [] })
      expect(new URL((await reportedRequest).url()).searchParams.get('expected_user_id')).toBe(String(auth.user.user_id))
      const report = (await reportedRequest).postDataJSON() as { records: number; request_id: string }
      expect(report.records).toBe(found)
      expect((await reportMonthlyUsage(context, serviceWorker, found, report.request_id)).deducted).toBe(false)
      expect((await readMonthlyUsage(context, serviceWorker)).used).toBe(usageBefore.used + found)

      // 部分导出:1+N 行,末行为数据行而非免费提示
      await exportButton.click()
      const download = await readDownload(page, () =>
        panelRoot.getByRole('menuitem', { name: 'Download data to csv' }).click()
      )
      expect(download.suggestedFilename()).toMatch(
        new RegExp(`^Bing_Maps_Scraper_${found}_\\d{14}\\.csv$`)
      )
      const lines = csvLines(readFileSync((await download.path()) ?? '', 'utf-8'))
      expect(lines[0].split(',')).toEqual(EXPECTED_HEADERS)
      expect(lines).toHaveLength(1 + found)
      expect(lines[lines.length - 1]).not.toBe(FREE_LIMIT_NOTE)

      // E6 断言:Pro 行云端挖掘 5 列脱离 ###PRO### 占位(有数据回填/无数据留空)
      const rows = lines.slice(1).map(parseCsvLine)
      for (const columns of rows) {
        for (const index of ENRICH_COLUMN_INDEXES) {
          expect(columns[index], `Pro 导出行第 ${index + 1} 列应脱离占位: ${columns}`).not.toBe(
            PRO_PLACEHOLDER
          )
        }
      }

      // 真实结果有官网时才有补全目标,此时补全中必须显示过批次进度
      if (rows.some(columns => columns[WEBSITE_COLUMN_INDEX].length > 0)) {
        expect(trace.statusTexts.join('\n')).toMatch(
          /Adding emails & social links.*\d+ of \d+ websites checked/
        )
      }
    } finally {
      await context.close()
    }
  })
})
