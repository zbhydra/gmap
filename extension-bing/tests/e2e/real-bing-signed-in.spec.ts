/**
 * 真实 Bing 登录态 Pro 采集(016 T1 §6 登录态主验收)。
 *
 * 登录流程不做 e2e(2026-09-02 hydra 拍板):登录态由 globalSetup 经后端
 * e2e_seed_user.py(bing-extension-pro 场景)签发真实 token(与插件 exchange
 * 同构、已注册 Redis 白名单、账号持 maps_extension Pro 订阅),spec 内经
 * 扩展 service worker 直写 chrome.storage 三键注入——auth/me 与
 * subscription/status?product_line=maps_extension 全部走本地真实 backend
 * 的真实验证链。
 *
 * 断言链:PRO 徽标(真实订阅判定生效)→ Start → Pro 进度文案 → 采集无
 * 20 条截断(计数 > 20)→ 中途手动 Stop → E6 补全(Emails/社媒 5 列脱离
 * ###PRO### 占位,本地真实 backend /maps/enrich 回填)→ 部分数据导出
 * (末行为数据行,无免费提示)。真实免费档首轮解析即达限,手动 Stop 只在
 * Pro 长窗口内可测。
 */

import { readFileSync } from 'node:fs'
import { expect, test, type Response } from '@playwright/test'
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

      // E6 补全信号(先于 Stop 注册,防错过):completed 边沿的 enrichRows 先同步
      // 清占位再发批次请求,故任一 /maps/enrich 请求到达即证明 5 列已脱离占位。
      // 行全无 website 时不发请求,超时兜底后照常导出(清占位仍已完成)。
      const enrichSettled = context
        .waitForEvent('response', {
          predicate: (response: Response) =>
            response.url().includes('/api/client/maps/enrich'),
          timeout: 45_000
        })
        .catch(() => null)

      await start.click()

      // Pro 进度文案变体(feat.md 采集中态);翻页持续,窗口充足
      await expect(
        panelRoot.getByText(/Have found \d+ businesses and still going\.\.\./)
      ).toBeVisible({ timeout: 30_000 })

      // 中途手动 Stop:Pro 无上限,采集处于滚动翻页长窗口内
      await panelRoot.getByRole('button', { name: 'Stop', exact: true }).click()
      await expect(panelRoot.getByText('Manually stopped.')).toBeVisible({ timeout: 30_000 })

      // 计数 N > 20 = 无免费截断的实证;免费超限警告条不出现
      const foundText = await panelRoot.getByText(/^\d+ businesses found\.$/).innerText()
      const found = Number(foundText.match(/^(\d+) businesses found\.$/)?.[1] ?? 0)
      expect(found, `采集计数应超免费上限 20,实际 ${found}`).toBeGreaterThan(FREE_ROW_LIMIT)
      await expect(panelRoot.getByText(FREE_LIMIT_NOTE)).toHaveCount(0)

      // E6:等补全信号(响应到达后写回在 SW 内同步执行,1s 跨进程时序缓冲)
      await enrichSettled
      await page.waitForTimeout(1_000)

      // 部分导出:1+N 行,末行为数据行而非免费提示
      await panelRoot.getByRole('button', { name: 'Export Leads List' }).click()
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
      for (const line of lines.slice(1)) {
        const columns = parseCsvLine(line)
        for (const index of ENRICH_COLUMN_INDEXES) {
          expect(columns[index], `Pro 导出行第 ${index + 1} 列应脱离占位: ${line}`).not.toBe(
            PRO_PLACEHOLDER
          )
        }
      }
    } finally {
      await context.close()
    }
  })
})
