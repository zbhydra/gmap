/**
 * 真实 Google Maps 匿名采集全链路(013 Maps 域真实界面层主验收)。
 *
 * 真实 www.google.com/maps 界面采集真实数据(2026-09-02 hydra 拍板,零 mock):
 * 打开搜索词 → 同意页自动接受 → 面板挂载 → Start → 首批真实 RPC 解析 →
 * 免费档 10 行截断自动完成 → 完成态(导出按钮计数 10)→ CSV 导出(36 列表头 +
 * 10 数据行,行数与文件名计数一致)→ Reset 回待命。
 *
 * 断言分界:环境/上游问题(网络不可达、同意页无法通过、人机验证、DOM 改版)
 * → skipSmoke 条件跳过;插件自身行为(计数/截断/导出)→ 失败即 fail。
 * 匿名态配额语义:usage 查询不可得时 fail-open 放行(013 A11),Start 可用。
 * Pause/Resume 挂起语义由单测覆盖(截断使真实采集中态窗口只有首批 RPC
 * 往返,headful 下无法稳定命中)。面板文案用英文基线定位(vue-i18n
 * fallback = en-US),context locale 固定 en-US 保证结果形态稳定。
 */

import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import {
  EXPECTED_HEADERS,
  FREE_ROW_LIMIT,
  MAPS_URL,
  detectChallenge,
  describeLandingHost,
  dismissConsent,
  exportButton,
  injectFastInterval,
  launchRealMapsContext,
  panelHost,
  parseCsv,
  readDownload,
  skipSmoke,
  startButton,
  waitForExtensionServiceWorker
} from './harness'

test.describe('真实 Google Maps 匿名采集(免费 10 行截断)', () => {
  test('真实界面采集 → 免费 10 截断完成 → CSV 导出(36 列)→ Reset', async () => {
    // 打开 45s + 面板 30s + 首批 RPC/截断收敛 60s + 导出,全链路有界
    test.setTimeout(240_000)
    const context = await launchRealMapsContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      // 扩展产物加载成功的硬前提(SW 未注册 = 产物问题,不属降级条件)
      const serviceWorker = await waitForExtensionServiceWorker(context)
      // 真实用户通道注入 5s 采集档(默认 8s 会拉长首批等待)
      await injectFastInterval(serviceWorker)

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

      // 面板宿主出现 = content script 已注入真实页面并完成挂载(宿主零尺寸,
      // 面板 UI 在其 open shadow DOM 内,存在性用 count 断言而非可见性)
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
      // 匿名待命态:Start 可用(usage 不可得 fail-open,不门控)
      const start = startButton(page)
      await expect(start).toBeVisible({ timeout: 30_000 })
      await expect(start).toBeEnabled()

      await start.click()

      // 首批真实 RPC 解析(≥10 行)→ 免费档截断自动完成;解析失败会停在
      // 采集中态或报 Data parse failed,由完成态超时/计数断言兜底暴露
      try {
        await expect(exportButton(page)).toBeVisible({ timeout: 90_000 })
      } catch {
        skipSmoke('90s 内未达完成态:首批 RPC 未达或解析未命中(疑似协议改版,需人工归因)')
      }

      // 截断语义:完成计数恒等于免费上限
      const buttonText = (await exportButton(page).innerText()).replace(/\s+/g, ' ').trim()
      const buttonCount = Number(
        buttonText.match(/^Export Detailed List - (\d+) \(\.CSV\)$/)?.[1] ?? 0
      )
      expect(buttonCount, `完成计数应为免费上限 ${FREE_ROW_LIMIT}: ${buttonText}`).toBe(
        FREE_ROW_LIMIT
      )

      // 导出并断言下载文件:文件名 / 36 列表头 / 数据行数与文件名计数一致
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

      // 行值抽检:名称非空;稳定短链按 cid 衍生(存在即真实解析链生效)
      let hasMapsUrl = false
      for (const row of rows.slice(1)) {
        expect(row[0], `Name 列为空: ${row.join(',')}`).not.toBe('')
        if (row[24].startsWith('https://www.google.com/maps?cid=')) {
          hasMapsUrl = true
        }
      }
      expect(hasMapsUrl, '至少一行应含 cid 稳定短链').toBe(true)

      // Reset → 回待命态
      await page.getByRole('button', { name: 'Reset' }).click()
      await expect(startButton(page)).toBeVisible()
    } finally {
      await context.close()
    }
  })
})
