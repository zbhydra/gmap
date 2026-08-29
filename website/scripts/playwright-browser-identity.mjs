/**
 * Playwright 浏览器身份工具。
 *
 * 原实现随顶层 scripts/ 迁出仓库后按既有调用契约重建:
 * - headless Chromium:UA 覆盖去掉 HeadlessChrome 标记,launch 参数 + init script 消除
 *   navigator.webdriver 与 Client Hints brands 中的自动化标识;
 * - chromium(channel: 'chrome',宿主稳定版 Chrome):本体身份真实,只加 webdriver 消除参数;
 * - firefox / webkit:Playwright 自带浏览器本体,身份天然真实,不做伪装;
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

function stripHeadlessChromeMarker(userAgent) {
  return userAgent ? userAgent.replace(/HeadlessChrome/g, 'Chrome') : userAgent
}

/** headless Chromium project(website chromium 与两个真实 smoke project)。 */
export function createHeadlessChromiumProjectUse(device) {
  return {
    ...device,
    headless: true,
    launchOptions: { args: [AUTOMATION_CONTROLLED_ARG] },
    contextOptions: { userAgent: stripHeadlessChromeMarker(device.userAgent) }
  }
}

/** 宿主稳定版 Chrome project(Mobile Chrome)。本体身份真实,移动 UA 由 device 提供,options 不影响身份。 */
export function createChromiumProjectUse(device, options = {}) {
  return {
    ...device,
    channel: 'chrome',
    headless: true,
    launchOptions: { args: [AUTOMATION_CONTROLLED_ARG] }
  }
}

/** firefox / webkit project:浏览器本体,原样使用。 */
export function createNativeBrowserProjectUse(device) {
  return { ...device }
}

/** 每 spec 身份 hook:每个用例的 context 注入兜底伪装脚本。 */
export function registerE2eBrowserIdentity(test) {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(IDENTITY_INIT_SCRIPT)
  })
}

/** 身份门禁断言:按 project metadata 分支校验对应身份不暴露自动化标识。 */
export async function expectE2eBrowserIdentity(page, testInfo, expect) {
  const metadata = testInfo.project.metadata ?? {}
  const userAgent = await page.evaluate(() => navigator.userAgent)
  const webdriver = await page.evaluate(() => navigator.webdriver)

  if (metadata.browserIdentityHeadlessChromium) {
    expect(userAgent, 'headless Chromium UA 应为正常 Chrome 标识').toContain('Chrome/')
    expect(userAgent, 'headless Chromium UA 不得暴露 HeadlessChrome').not.toContain('HeadlessChrome')
    expect(webdriver, 'navigator.webdriver 不得暴露自动化标识').toBe(false)
    return
  }

  if (metadata.browserIdentityMobile) {
    expect(userAgent, '移动端 UA 应为 Android Chrome').toContain('Android')
    expect(userAgent, '移动端 UA 不得暴露自动化标识').not.toContain('Headless')
    expect(webdriver, 'navigator.webdriver 不得暴露自动化标识').toBe(false)
    return
  }

  expect(userAgent, 'native 浏览器 UA 应存在').toBeTruthy()
  expect(userAgent, 'native 浏览器 UA 不得暴露 Headless 标记').not.toContain('Headless')
}
