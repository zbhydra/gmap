/**
 * 手动检查测试
 *
 * 这个测试会保持浏览器打开，让你可以手动检查按钮注入情况
 */

import { test } from '../fixtures'
import { TELEGRAM_K_TARGET } from '../helpers'

test.describe('手动检查', () => {
  test('保持浏览器打开进行手动检查', async ({ page }) => {
    // 禁用测试超时，允许无限期手动检查
    test.setTimeout(0)

    // 导航到 Telegram K 版本
    await page.goto(TELEGRAM_K_TARGET.url)
    await page.waitForLoadState('domcontentloaded')

    console.log('')
    console.log('========================================')
    console.log('📱 浏览器已启动，请手动检查：')
    console.log('========================================')
    console.log('')
    console.log('1. 检查是否有下载按钮注入')
    console.log('2. 检查按钮位置是否正确')
    console.log('3. 点击按钮测试下载功能')
    console.log('')
    console.log('按 Ctrl+C 或关闭浏览器窗口结束测试')
    console.log('========================================')
    console.log('')

    // 等待用户手动检查（保持浏览器打开）
    await page.waitForTimeout(3000000) // 5分钟
  })
})
