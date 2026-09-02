/**
 * 真实 Bing 匿名采集全链路(016 T1 §6 主验收)。
 *
 * 真实 www.bing.com/maps 界面采集真实数据(2026-09-02 hydra 拍板,零 mock):
 * 打开演示词 → 面板注入 + 列表检测态 → Start → 免费档 20 条截断自动停止 →
 * 完成态(计数 + 免费超限警告条 + Upgrade 引导)→ 匿名 Pricing 视图 →
 * CSV 导出(18 列表头 + 20 数据行 + 末行免费提示)。
 *
 * 断言分界:环境/上游问题(网络不可达、人机验证、落地域偏离、DOM 改版)
 * → skipSmoke 条件跳过;插件自身行为(截断/计数/警告条/导出)→ 失败即 fail。
 * 面板文案用英文基线定位(vue-i18n fallback = en-US),context locale 固定
 * en-US 保证演示词结果形态稳定。
 */

import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import {
  EXPECTED_HEADERS,
  FREE_LIMIT_NOTE,
  FREE_ROW_LIMIT,
  MAPS_URL,
  csvLines,
  detectChallenge,
  describeLandingHost,
  launchRealBingContext,
  panel,
  parseCsvLine,
  readDownload,
  skipSmoke,
  startButton,
  waitForExtensionServiceWorker
} from './harness'

test.describe('真实 Bing 匿名采集(免费 20 条截断)', () => {
  test('真实界面采集 → 免费 20 截断 → 完成态 → CSV 导出(18 列 + 末行提示)', async () => {
    // 全链路最坏路径(打开 45s + 面板 20s + 检测 60s + 截断收敛 90s + 导出)有界
    test.setTimeout(300_000)
    const context = await launchRealBingContext()
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

      // 面板容器出现 = content script 已注入真实页面
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

      // 匿名态:徽标位为 Sign in,无 FREE/PRO
      await expect(panelRoot.getByRole('button', { name: 'Sign in' })).toBeVisible({
        timeout: 15_000
      })
      await expect(panelRoot.getByRole('button', { name: 'FREE', exact: true })).toHaveCount(0)

      // 列表检测态 = listDetected → Start 解禁
      const start = startButton(page)
      try {
        await expect(start).toBeEnabled({ timeout: 60_000 })
      } catch {
        const challenge = await detectChallenge(page)
        skipSmoke(
          challenge ??
            '60s 内列表未进入检测态:适配器选择器未命中(疑似 Bing DOM 改版,由远程配置热修兜底)'
        )
      }

      // ===== 以下为插件行为硬断言(失败即 fail,不降级) =====
      await start.click()

      // 真实页面首屏结果即超 20 条,免费档达限自动停止(完成态收敛有界)
      await expect(panelRoot.getByText('Search complete.')).toBeVisible({ timeout: 90_000 })
      await expect(panelRoot.getByText(`${FREE_ROW_LIMIT} businesses found.`)).toBeVisible()
      await expect(panelRoot.getByText(FREE_LIMIT_NOTE)).toBeVisible()
      const upgradeButton = panelRoot.getByRole('button', { name: 'Upgrade to Pro Now' })
      await expect(upgradeButton).toBeVisible()

      // 匿名 Pricing 实体视图:对比表 + Upgrade 引导;匿名免费账号态
      await upgradeButton.click()
      await expect(panelRoot.getByRole('heading', { name: 'Upgrade to Pro' })).toBeVisible()
      await expect(panelRoot.getByText('Not signed in (free account)')).toBeVisible()
      await expect(panelRoot.getByRole('button', { name: 'Upgrade Now' })).toBeVisible()
      await panelRoot.getByRole('button', { name: 'Go Back' }).click()
      await expect(panelRoot.getByText('Search complete.')).toBeVisible()

      // 导出并断言下载文件:文件名 / 18 列表头 / 20 数据行 / 末行免费提示
      await panelRoot.getByRole('button', { name: 'Export Leads List' }).click()
      const csvItem = panelRoot.getByRole('menuitem', { name: 'Download data to csv' })
      await expect(panelRoot.getByRole('menuitem', { name: 'Download data to xlsx' })).toBeVisible()
      const download = await readDownload(page, () => csvItem.click())
      expect(download.suggestedFilename()).toMatch(
        new RegExp(`^Bing_Maps_Scraper_${FREE_ROW_LIMIT}_\\d{14}\\.csv$`)
      )
      const lines = csvLines(readFileSync((await download.path()) ?? '', 'utf-8'))
      expect(lines[0].split(',')).toEqual(EXPECTED_HEADERS)
      expect(lines).toHaveLength(1 + FREE_ROW_LIMIT + 1)
      expect(lines[lines.length - 1]).toBe(FREE_LIMIT_NOTE)

      // E6:免费行云端挖掘 5 列保持 ###PRO### 占位(Pro 锁定,不触发补全)
      const dataLines = lines.slice(1, 1 + FREE_ROW_LIMIT)
      for (const line of dataLines) {
        const columns = parseCsvLine(line)
        for (const index of [13, 14, 15, 16, 17]) {
          expect(columns[index], `免费导出行第 ${index + 1} 列应为 PRO 占位: ${line}`).toBe(
            '###PRO###'
          )
        }
      }
    } finally {
      await context.close()
    }
  })
})
