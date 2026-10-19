import { expect, test } from '@playwright/test'
import {
  extensionIdFromServiceWorker,
  launchRealMapsContext,
  waitForExtensionServiceWorker
} from './harness'

test('Popup 入口、设置持久化与批量拆分保存可实际操作', async () => {
  test.setTimeout(90_000)
  const context = await launchRealMapsContext()
  try {
    const worker = await waitForExtensionServiceWorker(context)
    const extensionId = extensionIdFromServiceWorker(worker)
    const popup = await context.newPage()
    await popup.goto(`chrome-extension://${extensionId}/src/popup.html`)
    await expect(popup.getByRole('button', { name: 'Open Google Maps', exact: true })).toBeVisible()
    await expect(popup.getByRole('link', { name: 'Help & FAQ', exact: true })).toHaveAttribute('href', /\/extension\/#faq$/)
    await expect(popup.getByRole('link', { name: 'Contact support', exact: true })).toHaveAttribute('href', /\/contact\/$/)

    const reviewPageOpened = context.waitForEvent('page')
    await popup.getByRole('button', { name: 'Bulk Google Reviews Extractor', exact: true }).click()
    const reviews = await reviewPageOpened
    await reviews.waitForLoadState('domcontentloaded')
    await expect(reviews).toHaveURL(/dashboard\.html\?type=1$/)
    await expect(reviews.getByLabel('Reviews per place', { exact: true })).toHaveValue('300')
    const pageCount = context.pages().length
    await popup.getByRole('button', { name: 'Bulk Google Reviews Extractor', exact: true }).click()
    await expect.poll(() => context.pages().length).toBe(pageCount)

    const optionsOpened = context.waitForEvent('page')
    await popup.getByRole('link', { name: 'Settings', exact: true }).click()
    const options = await optionsOpened
    await options.getByRole('radio', { name: 'JSON', exact: true }).click()
    await options.getByLabel('Auto download on completion', { exact: true }).check()
    await expect(options.getByText('Files are saved to your browser’s download folder.', { exact: false })).toBeVisible()
    await options.reload()
    await expect(options.getByRole('radio', { name: 'JSON', exact: true })).toHaveAttribute('aria-checked', 'true')
    await expect(options.getByLabel('Auto download on completion', { exact: true })).toBeChecked()
    await expect(options.getByLabel('Auto save to HubSpot', { exact: true })).toBeDisabled()

    const dashboard = await context.newPage()
    await dashboard.goto(`chrome-extension://${extensionId}/src/dashboard.html?type=0`)
    await dashboard.getByLabel('Task Name', { exact: true }).fill('逐页验收临时拆分')
    const keywords = Array.from({ length: 501 }, (_, index) => `coffee area ${index}`)
    await dashboard.getByLabel('Keywords', { exact: true }).fill([...keywords, keywords[0], ''].join('\n'))
    await expect(dashboard.getByText('501 items will be saved as 2 tasks', { exact: false })).toBeVisible()
    await expect(dashboard.getByRole('button', { name: 'Start first task', exact: true })).toBeVisible()
    await dashboard.getByRole('button', { name: 'Create Task', exact: true }).click()
    await expect(dashboard.getByRole('cell', { name: '逐页验收临时拆分_1', exact: true })).toBeVisible()
    await expect(dashboard.getByRole('cell', { name: '逐页验收临时拆分_2', exact: true })).toBeVisible()
    await expect(dashboard.getByText('Idle', { exact: true })).toHaveCount(2)
    await dashboard.reload()
    await dashboard.getByRole('button', { name: /^Task History/ }).click()
    await expect(dashboard.getByRole('cell', { name: '逐页验收临时拆分_1', exact: true })).toBeVisible()
    await dashboard.getByRole('button', { name: 'View task', exact: true }).first().click()
    await expect(dashboard.getByRole('cell', { name: 'coffee area 500', exact: true })).toBeVisible()
    await expect(dashboard.getByText('Pending', { exact: true })).toHaveCount(1)
  } finally {
    await context.close()
  }
})
