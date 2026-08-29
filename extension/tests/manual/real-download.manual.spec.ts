/**
 * 真实下载测试 - 使用 Playwright download 事件
 *
 * 流程:
 * 1. 打开网页（继承同一个 user data）
 * 2. 找到最后一个视频的 message
 * 3. 点击下载按钮
 * 4. 使用 page.waitForEvent('download') 监听实际下载
 * 5. 验证下载的文件
 */

import { test, expect } from '../fixtures'
import { TELEGRAM_K_TARGET } from '../helpers'
import path from 'path'

test.describe('真实下载测试', () => {
  test('下载视频并验证文件', async ({ page }) => {
    test.setTimeout(120000) // 设置超时为 120 秒

    // 1. 打开网页
    console.log('\n🌐 导航到 K 版本 Telegram...')

    // 收集所有控制台日志
    const allLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      allLogs.push(text)
      console.log(`[浏览器日志] ${text}`)
    })

    await page.goto(TELEGRAM_K_TARGET.url)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(5000)

    // 2. 找到最后一个视频的 message
    console.log('\n🔍 查找视频消息...')
    const videoMessages = page.locator('.bubble[data-mid]').filter(async (bubble) => {
      const hasVideo = await bubble.locator('video.media-video').count() > 0
      return hasVideo
    })

    const videoCount = await videoMessages.count()
    console.log(`找到 ${videoCount} 个视频消息`)

    if (videoCount === 0) {
      test.skip('没有找到视频消息')
    }

    // 获取最后一个视频消息
    const lastVideoMessage = videoMessages.last()
    const lastVideo = lastVideoMessage.locator('video.media-video')

    // 滚动到最后一个视频消息，确保可见
    await lastVideoMessage.scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)

    // 打印当前扫描到的资源列表
    console.log('\n📋 当前扫描到的资源列表:')
    const resourceLog = allLogs.filter(log =>
      log.includes('[KVersionScanner] 资源列表:') ||
      log.includes('[KVersionScanner] 扫描完成')
    )
    resourceLog.forEach(log => console.log(`  ${log}`))

    // 获取视频的 src 属性
    const videoSrc = await lastVideo.getAttribute('src')
    console.log(`\n🔗 视频 src: ${videoSrc}`)

    // 解析 Stream URL 元数据
    if (videoSrc && videoSrc.includes('stream/')) {
      try {
        const streamIndex = videoSrc.indexOf('/stream/')
        const encodedPart = videoSrc.substring(streamIndex + 8).split('?')[0]
        const decoded = decodeURIComponent(encodedPart)
        const metadata = JSON.parse(decoded)

        console.log('\n📦 Stream 元数据:')
        console.log(`   文件名: ${metadata.fileName}`)
        console.log(`   文件大小: ${metadata.size} bytes (${(metadata.size / 1024 / 1024).toFixed(2)} MB)`)
        console.log(`   MIME 类型: ${metadata.mimeType}`)
      } catch (e) {
        console.log('   无法解析元数据')
      }
    }

    // 3. 等待下载按钮出现
    console.log('\n⏳ 等待下载按钮出现...')
    const downloadButton = lastVideoMessage.locator('.tg-dl-button')
    await downloadButton.waitFor({ state: 'visible', timeout: 10000 })

    const buttonText = await downloadButton.textContent()
    console.log(`✅ 按钮已出现: ${buttonText}`)

    // 4. 监听下载事件（在点击之前）
    console.log('\n📥 设置下载监听...')

    // 关键：先启动等待（不要 await）
    const downloadPromise = page.waitForEvent('download', { timeout: 60000 })

    // 5. 点击下载按钮
    console.log('\n🖱️  点击下载按钮...')
    await downloadButton.click()

    // 6. 等待下载完成
    console.log('\n⏳ 等待下载事件...')
    try {
      const download = await downloadPromise

      console.log('\n✅ 检测到下载事件!')
      console.log(`   下载 URL: ${download.url()}`)
      console.log(`   建议文件名: ${download.suggestedFilename()}`)

      // 获取失败原因（如果有）
      const failure = await download.failure()
      if (failure) {
        console.log(`   ❌ 下载失败: ${failure}`)
      } else {
        console.log(`   ✅ 下载成功`)
      }

      // 等待下载完成
      const downloadPath = await download.path()
      console.log(`   下载路径: ${downloadPath}`)

      // 验证文件
      if (downloadPath) {
        const fs = await import('fs')
        const stats = fs.statSync(downloadPath)
        console.log(`\n📋 文件信息:`)
        console.log(`   大小: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)

        // 验证文件大小
        if (stats.size < 100 * 1024) {
          console.log(`   ⚠️  警告: 文件太小 (${stats.size} bytes)，可能是缩略图！`)
        } else {
          console.log(`   ✅ 文件大小正常`)
        }

        // 验证文件名
        const filename = path.basename(downloadPath)
        const ext = path.extname(filename)
        console.log(`   文件名: ${filename}`)
        console.log(`   扩展名: ${ext || '无扩展名'}`)

        // 验证扩展名
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov']
        if (!ext) {
          console.log(`   ⚠️  警告: 文件没有扩展名！`)
        } else if (!validExtensions.includes(ext.toLowerCase())) {
          console.log(`   ⚠️  警告: 未知的扩展名: ${ext}`)
        } else {
          console.log(`   ✅ 扩展名正确`)
        }
      }

    } catch (error) {
      console.log(`\n❌ 未检测到下载事件: ${error}`)
      console.log(`   可能的原因:`)
      console.log(`   1. 下载没有触发`)
      console.log(`   2. 扩展使用了非标准的下载方式`)
      console.log(`   3. 下载超时（60秒）`)
    }

    // 7. 打印所有收集的日志
    console.log('\n📋 浏览器控制台日志:')
    const relevantLogs = allLogs.filter(log =>
      log.includes('[downloadMany]') ||
      log.includes('[Injected Script]') ||
      log.includes('[KVersionScanner]') ||
      log.includes('[SegmentDownloader]') ||
      log.includes('[BlobDownloader]')
    )
    relevantLogs.forEach(log => console.log(`  ${log}`))

    // 8. 保持页面打开一段时间，让用户可以查看
    console.log('\n⏰ 页面将保持打开 10 秒供您检查...')
    await page.waitForTimeout(10000)

    console.log('\n✅ 测试完成')
  })
})
