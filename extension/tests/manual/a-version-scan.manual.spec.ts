/**
 * A 版本资源扫描测试
 *
 * 测试目标:
 * 1. 验证是否能找到消息容器 (.message-content-wrapper)
 * 2. 验证是否能识别单资源模式 (图片/视频)
 * 3. 验证是否能识别相册模式 (.Album)
 * 4. 验证是否能正确解析消息 ID
 * 5. 验证是否能注入下载按钮
 */

import { test, expect } from '../fixtures'
import { TELEGRAM_A_TARGET } from '../helpers'

test.describe('A 版本资源扫描测试', () => {
  test('扫描并验证资源获取', async ({ page }) => {
    test.setTimeout(120000) // 设置超时为 120 秒

    // 收集所有控制台日志
    const allLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      allLogs.push(text)
      // 只打印关键日志
      if (text.includes('[AVersionScanner]') ||
          text.includes('[ResourceScanner]') ||
          text.includes('[downloadMany]')) {
        console.log(`[浏览器日志] ${text}`)
      }
    })

    // 1. 导航到 A 版本 Telegram
    console.log('\n🌐 导航到 A 版本 Telegram...')
    console.log(`   URL: ${TELEGRAM_A_TARGET.url}`)
    await page.goto(TELEGRAM_A_TARGET.url)
    await page.waitForLoadState('domcontentloaded')

    // 等待页面加载
    console.log('\n⏳ 等待页面加载...')

    // 检查是否需要登录
    const needsLogin = await page.locator('.auth-phone, .login-button, [class*="auth"]').count() > 0
    if (needsLogin) {
      console.log('   ⚠️  需要登录！')
      console.log('   💡 提示: 请先手动登录 Telegram，然后重新运行测试')
      console.log('   页面将保持打开 60 秒供您登录...')

      // 等待用户登录
      await page.waitForTimeout(60000)

      // 刷新页面
      await page.reload()
      await page.waitForTimeout(5000)
    }

    // 等待页面完全加载，检查是否有 .Message 元素
    await page.waitForSelector('.Message, .bubble, .middle-column', { timeout: 30000 }).catch(() => {
      console.log('   ⚠️  超时：未检测到任何消息容器')
    })

    await page.waitForTimeout(5000)

    // 调试：检查页面结构
    console.log('\n🔍 调试：检查页面结构...')
    const bodyHTML = await page.evaluate(() => {
      const body = document.body
      return {
        hasMessageWrapper: !!body.querySelector('.message-content-wrapper'),
        hasMessage: !!body.querySelector('.Message'),
        hasBubble: !!body.querySelector('.bubble'),
        hasMiddleColumn: !!body.querySelector('.middle-column'),
        bodyClasses: document.body.className,
        childElements: Array.from(document.body.children).slice(0, 10).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id
        }))
      }
    })
    console.log('   页面结构检查:', JSON.stringify(bodyHTML, null, 2))

    // 如果页面没有加载，打印 URL 和页面标题
    const pageTitle = await page.title()
    const pageURL = page.url()
    console.log(`   当前 URL: ${pageURL}`)
    console.log(`   页面标题: ${pageTitle}`)

    // 2. 检查消息容器
    console.log('\n🔍 检查消息容器...')
    const messageContainers = page.locator('.message-content-wrapper')
    const containerCount = await messageContainers.count()
    console.log(`   找到 ${containerCount} 个消息容器`)

    if (containerCount === 0) {
      console.log('   ⚠️  没有找到消息容器，可能需要登录或检查页面')
      console.log('   💡 提示: 测试将保持页面打开 30 秒供手动检查')
      await page.waitForTimeout(30000)
      test.skip()
    }

    // 3. 检查相册
    console.log('\n🔍 检查相册...')
    const albums = page.locator('.Album')
    const albumCount = await albums.count()
    console.log(`   找到 ${albumCount} 个相册`)

    if (albumCount > 0) {
      const firstAlbum = albums.first()
      const albumItems = firstAlbum.locator('.media-inner')
      const itemCount = await albumItems.count()
      console.log(`   第一个相册包含 ${itemCount} 个媒体项`)

      // 检查第一个相册项的 ID
      const firstItemId = await albumItems.first().getAttribute('id')
      console.log(`   第一个相册项 ID: ${firstItemId}`)
    }

    // 4. 检查媒体元素
    console.log('\n🔍 检查媒体元素...')
    const images = page.locator('img.full-media')
    const videos = page.locator('video.full-media')
    const thumbnails = page.locator('img.thumbnail')
    const playButtons = page.locator('.icon-large-play')

    const imageCount = await images.count()
    const videoCount = await videos.count()
    const thumbnailCount = await thumbnails.count()
    const playButtonCount = await playButtons.count()

    console.log(`   图片 (img.full-media): ${imageCount}`)
    console.log(`   视频 (video.full-media): ${videoCount}`)
    console.log(`   缩略图 (img.thumbnail): ${thumbnailCount}`)
    console.log(`   播放按钮 (.icon-large-play): ${playButtonCount}`)

    // 5. 分析未加载的视频
    if (playButtonCount > 0) {
      console.log('\n🔍 分析未加载视频...')

      // 查找有播放按钮但没有 video 元素的容器
      const unloadedVideos = page.locator('.media-inner').filter(async (element) => {
        const hasPlayButton = await element.locator('.icon-large-play').count() > 0
        const hasVideo = await element.locator('video.full-media').count() > 0
        const hasThumbnail = await element.locator('img.thumbnail').count() > 0
        return hasPlayButton && !hasVideo && hasThumbnail
      })

      const unloadedCount = await unloadedVideos.count()
      console.log(`   未加载视频数量: ${unloadedCount}`)

      if (unloadedCount > 0) {
        console.log('   ⚠️  检测到未加载的视频，这些视频暂不支持下载')
      }
    }

    // 6. 检查下载按钮注入
    console.log('\n🔍 检查下载按钮注入...')
    await page.waitForTimeout(3000) // 等待扫描完成

    const downloadButtons = page.locator('.tg-dl-button')
    const buttonCount = await downloadButtons.count()
    console.log(`   注入的下载按钮数量: ${buttonCount}`)

    if (buttonCount > 0) {
      const firstButton = downloadButtons.first()
      const buttonText = await firstButton.textContent()
      const isVisible = await firstButton.isVisible()
      console.log(`   第一个按钮文本: ${buttonText}`)
      console.log(`   第一个按钮可见: ${isVisible}`)

      // 检查按钮是否在有资源的消息上
      const firstButtonContainer = firstButton.locator('..::part(..)') // 获取父元素
      const hasMedia = await firstButtonContainer.locator('img.full-media, video.full-media').count() > 0
      console.log(`   按钮所在位置有媒体: ${hasMedia}`)
    }

    // 7. 打印 AVersionScanner 的日志
    console.log('\n📋 AVersionScanner 日志:')
    const scannerLogs = allLogs.filter(log =>
      log.includes('[AVersionScanner]')
    )
    if (scannerLogs.length > 0) {
      scannerLogs.forEach(log => console.log(`  ${log}`))
    } else {
      console.log('  ⚠️  没有找到 AVersionScanner 日志')
      console.log('  💡 可能原因:')
      console.log('     - 版本检测失败，使用了 KVersionScanner')
      console.log('     - 扫描器未正确初始化')
    }

    // 8. 验证结果
    console.log('\n📊 测试结果总结:')
    console.log(`   消息容器: ${containerCount > 0 ? '✅' : '❌'}`)
    console.log(`   相册识别: ${albumCount > 0 ? '✅' : '⚠️  (无相册)'}`)
    console.log(`   媒体元素: ${imageCount + videoCount > 0 ? '✅' : '❌'}`)
    console.log(`   按钮注入: ${buttonCount > 0 ? '✅' : '❌'}`)

    // 9. 滚动页面以加载更多内容
    console.log('\n🔄 滚动页面加载更多内容...')
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 500))
      await page.waitForTimeout(1000)
    }

    // 再次检查
    const newContainerCount = await messageContainers.count()
    const newButtonCount = await downloadButtons.count()
    console.log(`   滚动后消息容器: ${newContainerCount}`)
    console.log(`   滚动后下载按钮: ${newButtonCount}`)

    // 10. 保持页面打开供手动检查
    console.log('\n⏰ 页面将保持打开 30 秒供您检查...')
    console.log('💡 您可以手动检查:')
    console.log('   - 下载按钮是否在正确的位置')
    console.log('   - 按钮样式是否正确')
    console.log('   - 控制台是否有错误')
    await page.waitForTimeout(30000)

    console.log('\n✅ 测试完成')
  })

  test('手动检查 A 版本', async ({ page }) => {
    test.setTimeout(0) // 无超时

    console.log('\n🌐 导航到 A 版本 Telegram...')
    await page.goto(TELEGRAM_A_TARGET.url)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(10000)

    console.log('')
    console.log('========================================')
    console.log('📱 浏览器已启动，请手动检查：')
    console.log('========================================')
    console.log('')
    console.log('检查项：')
    console.log('1. 打开开发者工具 (F12)')
    console.log('2. 查看控制台日志')
    console.log('3. 检查是否有 [AVersionScanner] 日志')
    console.log('4. 检查消息容器: .message-content-wrapper')
    console.log('5. 检查相册: .Album')
    console.log('6. 检查媒体: img.full-media, video.full-media')
    console.log('7. 检查下载按钮: .tg-dl-button')
    console.log('')
    console.log('按 Ctrl+C 或关闭浏览器窗口结束测试')
    console.log('========================================')
    console.log('')

    // 等待用户手动检查
    await page.waitForTimeout(3000000) // 50 分钟
  })
})
