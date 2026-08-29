import { test, expect } from '../fixtures';

/**
 * 手动功能检查测试
 *
 * 用途：打开 Telegram Web 页面供手动检查功能
 * - 不执行任何操作，仅打开页面
 * - 收集控制台输出
 * - 每秒检测窗口是否被关闭来判断测试结束
 * - 使用持久化上下文继承之前的状态
 */

test('手动功能检查 - pingrangTV', async ({ page }) => {
  // 禁用超时，无限期等待直到手动关闭窗口
  test.setTimeout(0);

  // 存储控制台消息
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];

  // 监听控制台输出
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      consoleErrors.push(text);
      console.error('[Console Error]', text);
    } else if (type === 'warning') {
      console.warn('[Console Warning]', text);
    } else {
      consoleLogs.push(text);
      console.log('[Console Log]', text);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.error('[Page Error]', error.message);
  });

  // 监听请求失败
  page.on('requestfailed', request => {
    console.error('[Request Failed]', request.url(), request.failure()?.errorText);
  });

  console.log('正在打开 Telegram Web...');
  await page.goto('https://web.telegram.org/k/#@pingrangTV', {
    waitUntil: 'domcontentloaded',
    timeout: 600000,
  });

  console.log('页面已加载，等待手动检查...');
  console.log('请检查以下功能：');
  console.log('1. 下载按钮是否正确注入');
  console.log('2. 点击下载按钮是否正常工作');
  console.log('3. 徽章计数是否正确');
  console.log('4. 控制台是否有错误');
  console.log('');
  console.log('关闭窗口以结束测试...');

  // 每秒检测窗口是否被关闭
  let isRunning = true;
  const checkInterval = setInterval(async () => {
    try {
      // 检查页面是否仍然可达
      await page.evaluate(() => document.title);
    } catch {
      isRunning = false;
      clearInterval(checkInterval);
    }
  }, 1000);

  // 等待窗口关闭
  // await new Promise<void>(resolve => {
  //   const checkClosed = setInterval(() => {
  //     if (!isRunning) {
  //       clearInterval(checkClosed);
  //       resolve();
  //     }
  //   }, 500);
  // });
  await page.waitForTimeout(10000000);

  // 输出收集的统计信息
  console.log('');
  console.log('========== 测试结束 ==========');
  console.log(`控制台日志数: ${consoleLogs.length}`);
  console.log(`控制台错误数: ${consoleErrors.length}`);
  console.log('');

  if (consoleErrors.length > 0) {
    console.log('发现的错误：');
    consoleErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
  }

  // 测试总是通过，因为这是手动检查
  // fixtures 会自动管理 context 生命周期
  expect(true).toBe(true);
});
