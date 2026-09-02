/**
 * e2e 冒烟用例(T1 §6 离线 fixture 层,U1 验收断言链):
 *
 * 扩展 SW 注册 ✓ → route 拦截生效(URL 保持 bing.com/maps + fixture 内容)✓
 * → content script 注入生效 ✓。
 *
 * 共享装配(扩展 context / route 拦截 / 注入判定)在 ./harness;
 * 本文件只保留 U1 冒烟特有的 fixture 形态与零外网断言链。
 */

import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import {
  FIXTURE_DEFAULT_INITIAL,
  FIXTURE_PATH,
  FIXTURE_TOTAL,
  MAPS_URL,
  assertContentScriptInjected,
  extensionIdFromServiceWorker,
  launchExtensionContext,
  setupRoutes,
  waitForExtensionServiceWorker
} from './harness'

test.describe('Bing 插件 e2e 基建冒烟', () => {
  test('扩展加载 → fixture 拦截 → content script 注入;全程零外网', async () => {
    test.setTimeout(120_000)
    const fixtureHtml = readFileSync(FIXTURE_PATH, 'utf-8')
    const context = await launchExtensionContext()
    const page = context.pages()[0] ?? (await context.newPage())

    try {
      // 断言链 1:扩展 MV3 service worker 已注册(url 为扩展域下 SW 脚本;
      // 固定 key 移除后扩展 ID 从 SW URL 动态反解)
      const serviceWorker = await waitForExtensionServiceWorker(context)
      const extensionId = extensionIdFromServiceWorker(serviceWorker)
      expect(extensionId).toMatch(/^[a-p]{32}$/)
      expect(serviceWorker.url()).toMatch(
        new RegExp(`^chrome-extension://${extensionId}/.+\\.js$`)
      )

      const { fulfilled, intercepted } = await setupRoutes(context, fixtureHtml)
      // 真实网络层成功完成的 http(s) 请求白名单:route fulfill 的响应同样会
      // 触发 requestfinished,故零出网的铁证是「成功集 ⊆ fixture 导航」——
      // 被 abort/DNS 拒绝的请求(含遥测,无论何时发出)都不会进入该集合
      const finishedRequests: string[] = []
      context.on('requestfinished', request => {
        const url = request.url()
        if (url.startsWith('http')) finishedRequests.push(url)
      })

      // 断言链 2 + 3:route 拦截生效(URL 为 bing.com/maps 且返回 fixture 内容)
      // + content script 注入(隔离 world chrome.runtime.id 命中扩展 ID)
      const cdp = await context.newCDPSession(page)
      await assertContentScriptInjected(cdp, page)

      expect(page.url()).toBe(MAPS_URL)
      await expect(page.locator('html[data-fixture="bing-maps-e2e"]')).toHaveCount(1)
      await expect(page.locator('#appShellRoot')).toHaveCount(1)
      await expect(page.locator('ul.b_lstcards')).toHaveCount(1)
      const cards = page.locator('[data-entity]')
      await expect(cards).toHaveCount(FIXTURE_DEFAULT_INITIAL)

      // fixture 数据形态冒烟:属性值可双重解析、id 序号化、title 带序号前缀
      const firstEntity = JSON.parse((await cards.first().getAttribute('data-entity')) ?? '')
      expect(firstEntity.entity.id).toMatch(/^ypid:YN[0-9A-F]{16}$/)
      expect(firstEntity.entity.title).toContain('#1 ')

      // 「加载更多」注入钩子:fixtureInitial 控制初始条数 + loadAll 注入余量
      await page.goto(`${MAPS_URL}&fixtureInitial=3`)
      await expect(page.locator('[data-entity]')).toHaveCount(3)
      await page.evaluate(() => window.bingFixture.loadAll())
      await expect(page.locator('[data-entity]')).toHaveCount(FIXTURE_TOTAL)

      // 零外网断言(基于导航完成后的 route 层真实记录):
      // 1) 放行集恰为两次 fixture 导航,无任何其他 fulfill
      expect([...fulfilled].sort()).toEqual([MAPS_URL, `${MAPS_URL}&fixtureInitial=3`].sort())
      // 2) 拦截层实证:页面主动发起第三域探针,必须被 abort 层确定性拦下
      //    (fetch 被拦会 reject,吞掉以保证 evaluate 不抛)
      const PROBE_URL = 'https://e2e-route-probe.invalid/ping'
      await page.evaluate(probeUrl =>
        fetch(probeUrl, { mode: 'no-cors' }).catch(() => undefined), PROBE_URL)
      expect(intercepted).toContain(PROBE_URL)
      // 3) 零出网铁证:整个生命周期内真实网络层成功完成的 http(s) 请求只能是
      //    fixture 导航——SW 遥测(SLS/mark RPC)无论在 route 注册前后发出,
      //    都分别落入 abort 拦截或 DNS 断绝,不可能进入该集合
      for (const url of finishedRequests) {
        expect(url.startsWith('https://www.bing.com/maps')).toBe(true)
      }
    } finally {
      await context.close()
    }
  })
})
