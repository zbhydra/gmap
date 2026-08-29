/**
 * Playwright 浏览器身份工具(admin e2e)。
 *
 * 原实现随顶层 scripts/ 迁出仓库后按既有调用契约重建:
 * - chromium:宿主稳定版 Google Chrome(channel: 'chrome'),headless 跑,只加 webdriver 消除参数;
 * - firefox:Playwright 自带浏览器本体,身份天然真实,不做伪装;
 * - 只消除已知自曝字段,不承诺绕过第三方 WAF 或 bot 检测。
 */

const AUTOMATION_CONTROLLED_ARG = '--disable-blink-features=AutomationControlled'

/** 文档开始前执行的兜底伪装:webdriver 置否、Client Hints brands 去掉 Headless 标记。 */
const IDENTITY_INIT_SCRIPT = `
(() => {
  try {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false, configurable: true })
  } catch (error) {}
  const uaData = navigator.userAgentData
  if (uaData && Array.isArray(uaData.brands) && uaData.brands.some((brand) => brand.brand.toLowerCase().includes('headless'))) {
    const brands = uaData.brands.map((brand) =>
      brand.brand.toLowerCase().includes('headless') ? { ...brand, brand: 'Google Chrome' } : brand
    )
    try {
      Object.defineProperty(Navigator.prototype, 'userAgentData', {
        get: () => ({ ...uaData, brands }),
        configurable: true
      })
    } catch (error) {}
  }
})()
`

/** 宿主稳定版 Chrome project。本体身份真实,无需 UA 覆盖。 */
export function createChromiumProjectUse(device) {
  return {
    ...device,
    channel: 'chrome',
    headless: true,
    launchOptions: { args: [AUTOMATION_CONTROLLED_ARG] }
  }
}

/** firefox project:浏览器本体,原样使用。 */
export function createNativeBrowserProjectUse(device) {
  return { ...device }
}

/** 每 spec 身份 hook:每个用例的 context 注入兜底伪装脚本。 */
export function registerE2eBrowserIdentity(test) {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(IDENTITY_INIT_SCRIPT)
  })
}

/** 身份门禁断言:chromium 断言 UA 与 webdriver 干净;firefox 断言 UA 真实无 Headless 标记。 */
export async function expectE2eBrowserIdentity(page, testInfo, expect) {
  const userAgent = await page.evaluate(() => navigator.userAgent)
  const webdriver = await page.evaluate(() => navigator.webdriver)

  expect(userAgent, '浏览器 UA 应存在').toBeTruthy()
  expect(userAgent, '浏览器 UA 不得暴露 Headless 标记').not.toContain('Headless')
  if (testInfo.project.name === 'chromium') {
    expect(webdriver, 'navigator.webdriver 不得暴露自动化标识').toBe(false)
  }
}
