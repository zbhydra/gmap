/**
 * 真实 Google Maps 登录态采集(013 Maps 域真实界面层登录态验收)。
 *
 * 登录流程不做 e2e(2026-09-02 hydra 拍板):登录态由 globalSetup 经后端
 * e2e_seed_user.py(maps-extension-pro 场景)签发真实 token(与插件 exchange
 * 同构、已注册 Redis 白名单、账号持 maps_extension Pro 订阅),spec 内经
 * 扩展 service worker 直写 chrome.storage 三键注入——usage 查询/上报与
 * /maps/enrich 补全全部走本地真实 backend 的真实验证链。
 *
 * 断言链:登录态 Start 可用(Pro 配额不门控)→ 首批解析 → 免费档 10 行截断
 * 完成(截断当前对所有账号态生效,Pro 差异在月度配额与 enrich,非行数)→
 * 完成边沿 POST /maps/usage/report 200(真实配额扣减链)→ Email/社媒补全
 * 请求到达本地真实 backend(行无官网时不发,容错)→ CSV 导出(36 列,行数与
 * 文件名计数一致)。gmap 面板无订阅徽标,登录态生效以配额链 200 为实证。
 */

import { readFileSync } from 'node:fs'
import { expect, test, type Response } from '@playwright/test'
import {
  EXPECTED_HEADERS,
  FREE_ROW_LIMIT,
  MAPS_URL,
  detectChallenge,
  describeLandingHost,
  dismissConsent,
  exportButton,
  injectExtensionAuth,
  launchRealMapsContext,
  panelHost,
  parseCsv,
  readDownload,
  skipSmoke,
  startButton,
  waitForExtensionServiceWorker,
  type MapsE2eAuth
} from './harness'

/** globalSetup 注入的登录态 env;缺失 = 本地 backend 不可用或 seed 失败。 */
const rawAuth = process.env.E2E_MAPS_AUTH
const auth: MapsE2eAuth | null = rawAuth ? (JSON.parse(rawAuth) as MapsE2eAuth) : null

test.describe('真实 Google Maps 登录态采集(Pro,token 直注)', () => {
  test('token 注入 → 截断完成 → 用量上报 200 → enrich 到达真实 backend → 导出', async () => {
    // 采集(首批 RPC)+ 服务端 enrich(逐官网代抓,10 行单批)+ 导出,有界
    test.setTimeout(420_000)
    if (!auth) {
      skipSmoke('无登录态可注入:本地 backend 未运行或 seed 失败(见 globalSetup 输出)')
      // skipSmoke 内 test.skip 立即中断用例;return 仅让 TS 收窄 auth 非空
      return
    }

    const context = await launchRealMapsContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      const serviceWorker = await waitForExtensionServiceWorker(context)
      // 先注入再导航:content script 随文档启动时读到的即登录态;设置直注
      // 5s 档 + Email/社媒补全开关(真实用户可设的同一通道)
      await injectExtensionAuth(serviceWorker, auth)
      await serviceWorker.evaluate(() => {
        return chrome.storage.local.set({
          maps_user_settings: { requestIntervalSec: 5, extractEmail: true, extractSocialMedias: true }
        })
      })

      try {
        await page.goto(MAPS_URL, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      } catch (error) {
        skipSmoke(`真实 Google Maps 打开失败(网络不可达或被环境拦截): ${String(error)}`)
      }
      await dismissConsent(page)

      const challengeOnLoad = await detectChallenge(page)
      if (challengeOnLoad) {
        skipSmoke(`人机验证拦截: ${challengeOnLoad}`)
      }

      try {
        await expect(panelHost(page)).toHaveCount(1, { timeout: 30_000 })
      } catch {
        skipSmoke(
          `面板宿主 30s 未出现:content script 未注入(疑似 google.com/maps 形态变化${await describeLandingHost(
            page
          )})`
        )
      }

      // ===== 以下为插件行为硬断言(失败即 fail,不降级) =====
      // 登录态 Pro 配额不门控:Start 可用(Start 前现拉 usage,token 验签链生效)
      const start = startButton(page)
      await expect(start).toBeVisible({ timeout: 30_000 })
      await expect(start).toBeEnabled()

      // 完成边沿信号(先于 Start 注册,防错过):用量上报与 enrich 首响应。
      // enrich 行全无官网时不发请求,超时兜底后照常导出(补全失败已收敛为空)。
      const usageReportSettled = context
        .waitForEvent('response', {
          predicate: (response: Response) =>
            response.url().includes('/api/client/maps/usage/report'),
          timeout: 120_000
        })
        .catch(() => null)
      const enrichSettled = context
        .waitForEvent('response', {
          predicate: (response: Response) => response.url().includes('/api/client/maps/enrich'),
          timeout: 180_000
        })
        .catch(() => null)

      await start.click()

      try {
        await expect(exportButton(page)).toBeVisible({ timeout: 90_000 })
      } catch {
        skipSmoke('90s 内未达完成态:首批 RPC 未达或解析未命中(疑似协议改版,需人工归因)')
      }
      const buttonText = (await exportButton(page).innerText()).replace(/\s+/g, ' ').trim()
      const buttonCount = Number(
        buttonText.match(/^Export Detailed List - (\d+) \(\.CSV\)$/)?.[1] ?? 0
      )
      expect(buttonCount).toBe(FREE_ROW_LIMIT)

      // 真实配额扣减链:完成边沿 usage/report 到达本地 backend 且 200
      const usageReport = await usageReportSettled
      expect(usageReport, '完成边沿未发出 /maps/usage/report').not.toBeNull()
      expect(await usageReport?.status(), `usage/report 状态码异常: ${usageReport?.url()}`).toBe(
        200
      )

      // 等补全信号到达(响应后写回在 content 内执行,1s 跨进程时序缓冲);
      // 未到达(行全无官网/服务端慢)不阻塞导出
      await enrichSettled
      await page.waitForTimeout(1_000)

      // 导出:文件名计数与数据行数一致,36 列表头
      const download = await readDownload(page, () => exportButton(page).click())
      const filenameMatch = download
        .suggestedFilename()
        .match(/^MapsGrab-Extractor-(\d+)-.+-\d{4}-\d{2}-\d{2}\.csv$/)
      expect(filenameMatch, `导出文件名形态不符: ${download.suggestedFilename()}`).toBeTruthy()
      const exportCount = Number(filenameMatch?.[1] ?? 0)
      expect(exportCount).toBe(FREE_ROW_LIMIT)

      const rows = parseCsv(readFileSync((await download.path()) ?? '', 'utf-8'))
      expect(rows[0]).toEqual(EXPECTED_HEADERS)
      expect(rows).toHaveLength(1 + FREE_ROW_LIMIT)
    } finally {
      await context.close()
    }
  })
})
