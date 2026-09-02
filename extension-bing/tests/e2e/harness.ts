/**
 * e2e 共享 harness(真实界面层,016 T1 §6)。
 *
 * - MV3 扩展 content script 只在 persistent context 注入,launchPersistentContext
 *   + --load-extension 自管上下文,headful 为扩展要求的运行形态;
 * - 真实界面铁律(2026-09-02 hydra 拍板,替代离线 fixture 层):打开真实
 *   www.bing.com/maps 采集真实数据,零 route mock、零本地 fixture 页;
 * - 反自动化身份:去掉 Playwright 默认 --enable-automation、追加
 *   --disable-blink-features=AutomationControlled,并注入身份兜底 init
 *   script(website scripts/playwright-browser-identity.mjs 同款)——只消除
 *   已知自曝字段,不承诺绕过第三方 bot 检测;
 * - 产物 = dist-real(build:real 变体:API 指向本地真实 backend、SLS 构建期
 *   禁用)。登录流程不做 e2e;登录态用例的 token 由 globalSetup 经后端
 *   e2e_seed_user.py(bing-extension-pro 场景)签发,本 harness 提供经扩展
 *   service worker 直写 chrome.storage 三键的注入;
 * - 环境降级分界:人机验证/网络不可达/落地域偏离/DOM 改版迹象 → skipSmoke
 *   条件跳过并记录原因;插件自身行为(门控/计数/导出)失败照常 fail。
 */

import { resolve } from 'node:path'
import {
  chromium,
  test,
  type BrowserContext,
  type Download,
  type Locator,
  type Page,
  type Worker
} from '@playwright/test'

/** 真实 e2e 构建产物目录(由 test:e2e 的构建前置 pnpm build:real 产出)。 */
export const PATH_TO_EXTENSION = resolve(process.cwd(), 'dist-real')

/** 演示搜索词 URL(真实出网;结果量远超免费 20 条上限)。 */
export const MAPS_URL = 'https://www.bing.com/maps?q=auto+repair+near+new+york+city'

/** 免费档单次行数上限(contract scrape.freeRowLimit)。 */
export const FREE_ROW_LIMIT = 20

/** 免费档导出末行提示(竞品逐字抄录)。 */
export const FREE_LIMIT_NOTE = 'Free accounts can export up to 20 data entries.'

/** 18 列表头基线(golden-samples/export.csv,与 parser BING_EXPORT_COLUMNS 同源)。 */
export const EXPECTED_HEADERS = [
  'ID',
  'Name',
  'Address',
  'Featured image',
  'Bing Maps URL',
  'Latitude',
  'Longitude',
  'Rating',
  'Rating Info',
  'Category',
  'Open Hours',
  'Website',
  'Phone',
  'Emails',
  'Social Medias',
  'Facebook',
  'Instagram',
  'Twitter'
]

/** 面板根(自建 fixed 容器内的直插面板)。 */
const PANEL_ROOT_SELECTOR = '#bing-maps-scraper-panel-host .bing-panel-root'

/**
 * 文档开始前执行的身份兜底脚本(website playwright-browser-identity.mjs 同款):
 * webdriver 置否 + Client Hints brands 去 Headless 标记。headful 下 brands
 * 本无 Headless 标记,此处为防御性兜底;脚本对扩展 content script 无影响
 * (隔离 world 不执行页面 init script)。
 */
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

/**
 * globalSetup seed 输出经 env 传递的登录态(e2e_seed_user.py
 * bing-extension-pro 场景;token 与 /auth/extension-login/exchange 同构)。
 */
export interface BingE2eAuth {
  access_token: string
  refresh_token: string
  user: {
    user_id: number
    email: string | null
    full_name: string | null
    avatar_url: string | null
    created_at: number
  }
}

/** 面板根 locator(各 spec 共用同选择器)。 */
export function panel(page: Page): Locator {
  return page.locator(PANEL_ROOT_SELECTOR)
}

/** Start Extraction 按钮。 */
export function startButton(page: Page): Locator {
  return panel(page).getByRole('button', { name: 'Start Extraction' })
}

/** 去掉 BOM 并按行拆分(导出数据不含引号内换行,行拆分安全)。 */
export function csvLines(content: string): string[] {
  return content
    .replace(/^\uFEFF/, '')
    .split('\n')
    .filter(line => line.length > 0)
}

/**
 * 引号感知的单行 CSV 字段解析(RFC4180 简版):引号包裹字段可含逗号,
 * 引号内 `"` 双写转义;列级断言必须用它,`split(',')` 会被地址字段内的
 * 逗号错位(真实 Bing 地址常含逗号)。
 */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

/** 等待下载完成并返回下载对象。 */
export async function readDownload(page: Page, trigger: () => Promise<void>): Promise<Download> {
  const downloadPromise = page.waitForEvent('download')
  await trigger()
  return downloadPromise
}

/**
 * 启动加载扩展的 headful persistent context(每用例独立临时 profile),
 * 附带反自动化身份处理(见文件头);真实出网,无任何 route 拦截。
 */
export async function launchRealBingContext(): Promise<BrowserContext> {
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: false,
    locale: 'en-US',
    // --enable-automation 会置 navigator.webdriver=true 并显示自动化提示条,
    // 去掉后 Playwright 其余能力(CDP)不受影响
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      `--disable-extensions-except=${PATH_TO_EXTENSION}`,
      `--load-extension=${PATH_TO_EXTENSION}`,
      '--disable-blink-features=AutomationControlled'
    ]
  })
  await context.addInitScript(IDENTITY_INIT_SCRIPT)
  return context
}

/** 等待扩展 MV3 service worker 注册完成并返回。 */
export async function waitForExtensionServiceWorker(context: BrowserContext): Promise<Worker> {
  const existing = context
    .serviceWorkers()
    .find(worker => worker.url().startsWith('chrome-extension://'))
  if (existing) return existing
  return context.waitForEvent('serviceworker', {
    predicate: worker => worker.url().startsWith('chrome-extension://'),
    timeout: 20_000
  })
}

/**
 * 从扩展 service worker URL 反解扩展 ID。manifest 无固定 key,unpacked
 * 安装的扩展 ID 按 profile 派生不可预知,一律动态提取。
 */
export function extensionIdFromServiceWorker(worker: Worker): string {
  return new URL(worker.url()).host
}

/**
 * 登录态直注:经扩展 service worker 把 seed 签发的 token 对与用户信息写入
 * chrome.storage.local 三键(键名与 core/api/config.ts STORAGE_KEYS 同源,
 * 与 applyExtensionLogin 的持久化落点一致)。登录流程本身不做 e2e
 * (2026-09-02 hydra 拍板);content script 在后续导航中读到即登录态。
 */
export async function injectExtensionAuth(serviceWorker: Worker, auth: BingE2eAuth): Promise<void> {
  // set 的 Promise 作为 evaluate 返回值:Playwright 会等它 resolve,保证
  // 注入函数返回时三键已落盘,后续导航的 content script 必然读到登录态
  await serviceWorker.evaluate(seed => {
    return chrome.storage.local.set({
      auth_access_token: seed.access_token,
      auth_refresh_token: seed.refresh_token,
      auth_user_info: seed.user
    })
  }, auth)
}

/** 条件化跳过:原因落到测试输出与报告标注(skip-reason),不阻塞整体退出码。 */
export function skipSmoke(reason: string): void {
  console.warn(`[real-bing] SKIP: ${reason}`)
  test.info().annotations.push({ type: 'skip-reason', description: reason })
  test.skip(true, reason)
}

/**
 * 人机验证/挑战页启发式探测:命中返回特征描述,未命中返回 null。
 * Bing 挑战页无稳定单一标记,按标题/正文文案 + 挑战表单特征多路匹配。
 */
export async function detectChallenge(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      const title = document.title.toLowerCase()
      const bodyText = (document.body?.innerText ?? '').slice(0, 4000).toLowerCase()
      if (
        /verify (that you are|you are) human|human verification|are you human|unusual traffic/.test(
          `${title} ${bodyText}`
        )
      ) {
        return `页面文案命中人机验证特征(标题: ${document.title})`
      }
      if (
        document.querySelector(
          '#challengeForm, form[action*="challenge"], iframe[src*="challenge"], input[name="bpaccuracy"]'
        )
      ) {
        return '页面存在挑战表单/iframe 元素'
      }
      return null
    })
  } catch {
    // 页面已跳转/销毁等评测环境异常:按未命中处理,由后续超时路径兜底
    return null
  }
}

/**
 * 落地域偏离描述(manifest 仅匹配 https://www.bing.com/maps*):真实环境常按
 * 地域 302 到 cn.bing.com 等子域,content script 不注入——记录实际落地域供归因。
 */
export async function describeLandingHost(page: Page): Promise<string> {
  try {
    const host = new URL(page.url()).host
    return host && host !== 'www.bing.com' ? `;实际落地域 ${host}` : ''
  } catch {
    return ''
  }
}
