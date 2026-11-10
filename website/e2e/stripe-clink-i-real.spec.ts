/** 本轮真实沙箱验收；读取独立种子身份，不替换任何支付出口。 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { expect, test } from '@playwright/test'
import { expectE2eBrowserIdentity, registerE2eBrowserIdentity } from '../scripts/playwright-browser-identity.mjs'

registerE2eBrowserIdentity(test)
test.use({ channel: 'chrome', trace: 'off', screenshot: 'off', baseURL: 'http://localhost:7620' })

interface Session {
  user_id: number
  email: string
  device_id: string
  access_token: string
  product_id: string
  channel: string
  order_no?: string
  checkout_url?: string
  session_id?: string
  amount?: number
  currency?: string
}
interface Manifest { sessions: Record<string, Session> }
interface CreatedOrder {
  code: number
  data: { order_no: string; amount: number; currency: string; payment_data: { checkoutUrl: string; sessionId: string } }
}

test('I 真实官网接线与 Hosted Checkout', async ({ context, page }, testInfo) => {
  test.setTimeout(120_000)
  const authPath = process.env.I_AUTH_PATH
  if (!authPath) throw new Error('I_AUTH_PATH 缺失')
  const manifest: Manifest = JSON.parse(readFileSync(authPath, 'utf8'))
  const scenario = process.env.I_SCENARIO ?? 'clink_once'
  const session = manifest.sessions[scenario]
  expect(session).toBeTruthy()
  const network: { host: string; status?: number; error?: string }[] = []
  context.on('response', response => { network.push({ host: new URL(response.url()).host, status: response.status() }) })
  context.on('requestfailed', request => { network.push({ host: new URL(request.url()).host, error: request.failure()?.errorText }) })
  await context.addInitScript(({ accessToken, deviceId }) => {
    if (location.origin === 'http://localhost:7620') {
      localStorage.setItem('homepage_access_token', accessToken)
      localStorage.setItem('homepage_device_id_v2', deviceId)
    }
  }, { accessToken: session.access_token, deviceId: session.device_id })
  const configsPromise = page.waitForResponse(response => response.url().includes('/api/client/subscription/checkout-configs'))
  await page.goto('/pricing/?product_kind=maps_api')
  await expectE2eBrowserIdentity(page, testInfo, expect)
  const configs = await configsPromise
  expect(new URL(configs.url()).port).toBe('7676')
  expect(configs.status()).toBe(200)
  let checkout
  if (!session.checkout_url) {
    await page.locator(`[data-pricing-buy="${session.product_id}"]`).click()
    await page.locator(`[data-order-checkout-payment-method="${session.channel}"]`).click()
    const createdPromise = page.waitForResponse(response => response.url().endsWith('/api/client/order/create'))
    const popupPromise = page.waitForEvent('popup')
    await page.locator('[data-order-checkout-submit]').click()
    const created: CreatedOrder = await (await createdPromise).json()
    expect(created.code).toBe(10000)
    session.order_no = created.data.order_no
    session.checkout_url = created.data.payment_data.checkoutUrl
    session.session_id = created.data.payment_data.sessionId
    session.amount = created.data.amount
    session.currency = created.data.currency
    writeFileSync(authPath, JSON.stringify(manifest, null, 2), { mode: 0o600 })
    checkout = await popupPromise
  } else {
    checkout = await context.newPage()
    await checkout.goto(session.checkout_url)
  }
  await expect(checkout).toHaveURL(/https:\/\/(uat-checkout\.clinkbill\.com|checkout\.stripe\.com)\//, { timeout: 45_000 })
  await checkout.waitForLoadState('domcontentloaded')
  await expect(checkout.locator('body')).not.toBeEmpty({ timeout: 30_000 })
  try {
    await expect(checkout.locator('body')).toContainText(/Pay|Email|USD|支付/i, { timeout: 45_000 })
    if (process.env.I_ACTION === 'pay') {
      expect(session.channel).toBe('clink')
      expect(session.amount).toBeGreaterThan(0)
      await expect(checkout.locator('body')).toContainText(`USD ${((session.amount ?? 0) / 1_000_000).toFixed(2)}`)
      await checkout.getByPlaceholder('1234 1234 1234 1234').fill('4242 4242 4242 4242')
      await checkout.getByPlaceholder('MM / YY').fill('12 / 30')
      await checkout.getByPlaceholder('CVV', { exact: true }).fill('123')
      await checkout.getByPlaceholder('Name on Card').fill('GMAP Integration I')
      await checkout.getByRole('button', { name: 'Pay Now', exact: true }).click()
      await checkout.waitForURL(url => url.origin === 'http://localhost:7620' && url.pathname.includes('/clink/success'), { timeout: 60_000 })
      await expect(checkout.locator('[data-payment-return-title]')).toHaveText('Plan activated', { timeout: 30_000 })
    }
  } finally {
    await checkout.screenshot({ path: join(dirname(authPath), `${scenario}-checkout.png`), fullPage: true })
    writeFileSync(join(dirname(authPath), `${scenario}-network.json`), JSON.stringify(network, null, 2), { mode: 0o600 })
    writeFileSync(join(dirname(authPath), `${scenario}-page-text.txt`), await checkout.locator('body').innerText(), { mode: 0o600 })
  }
  const inspection = {
    scenario,
    order_no: session.order_no,
    host: new URL(checkout.url()).host,
    text: await checkout.locator('body').innerText(),
    fields: await checkout.locator('input, select, button').evaluateAll(elements => elements.map(element => ({ tag: element.tagName, name: element.getAttribute('name'), type: element.getAttribute('type'), placeholder: element.getAttribute('placeholder'), text: element.tagName === 'BUTTON' ? element.textContent?.trim() : undefined })))
  }
  writeFileSync(join(dirname(authPath), `${scenario}-checkout-inspection.json`), JSON.stringify(inspection, null, 2), { mode: 0o600 })
  console.log(JSON.stringify({ scenario, order_no: session.order_no, host: inspection.host, website_api_port: 7676 }))
})
