import { expect, test } from '@playwright/test'
import {
  extensionIdFromServiceWorker,
  injectExtensionAuth,
  launchRealBingContext,
  skipSmoke,
  waitForExtensionServiceWorker,
  type BingE2eAuth
} from './harness'

const rawAuth = process.env.E2E_BING_AUTH
const auth: BingE2eAuth | null = rawAuth ? (JSON.parse(rawAuth) as BingE2eAuth) : null

test('popup 登录态变化后查询 maps_extension 产品类别订阅', async () => {
  if (!auth) {
    skipSmoke('无登录态可注入:本地 backend 未运行或 seed 失败')
    return
  }

  const context = await launchRealBingContext()
  try {
    const serviceWorker = await waitForExtensionServiceWorker(context)
    const popup = await context.newPage()
    await popup.goto(
      `chrome-extension://${extensionIdFromServiceWorker(serviceWorker)}/src/popup.html`
    )
    await expect(popup.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
    const statusResponse = popup.waitForResponse(response => {
      return new URL(response.url()).pathname === '/api/client/subscription/status'
    })
    await injectExtensionAuth(serviceWorker, auth)
    const response = await statusResponse
    expect(new URL(response.url()).search).toBe('?product_kind=maps_extension')
    expect(response.status()).toBe(200)
    expect(await response.json()).toMatchObject({
      code: 10000,
      data: { status: 'active', period: 'month' }
    })
    await expect(popup.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
  } finally {
    await context.close()
  }
})
