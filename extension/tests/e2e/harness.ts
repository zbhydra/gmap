/**
 * e2e 共享 harness(真实界面层,013 Maps 域)。
 *
 * - MV3 扩展 content script 只在 persistent context 注入,launchPersistentContext
 *   + --load-extension 自管上下文,headful 为扩展要求的运行形态;
 * - 真实界面铁律(2026-09-02 hydra 拍板,替代离线 fixture/mock 层):打开真实
 *   www.google.com/maps 采集真实数据,零 route mock、零本地 fixture 页、零
 *   本地 mock 服务(与 extension-bing 同口径);
 * - 反自动化身份:去掉 Playwright 默认 --enable-automation、追加
 *   --disable-blink-features=AutomationControlled,并注入身份兜底 init
 *   script(website scripts/playwright-browser-identity.mjs 同款)——只消除
 *   已知自曝字段,不承诺绕过第三方 bot 检测;
 * - 产物 = dist-real(build:real 变体:API 指向本地真实 backend、SLS 构建期
 *   禁用)。登录流程不做 e2e;登录态用例的 token 由 globalSetup 经后端
 *   e2e_seed_user.py(maps-extension-pro 场景)签发,本 harness 提供经扩展
 *   service worker 直写 chrome.storage 三键的注入;
 * - 运行参数注入:采集间隔默认 8s 太慢,经 chrome.storage 写用户显式偏好
 *   5s 档(scrollIntervalOptionsSec 最小档,真实用户可设的同一通道);
 * - 环境降级分界:同意页自动接受,人机验证/网络不可达/DOM 改版迹象 →
 *   skipSmoke 条件跳过并记录原因;插件自身行为(计数/截断/导出)失败照常 fail。
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

/**
 * 演示搜索词 URL(真实出网)。freeExportRowLimit 截断使完成时长与结果总量
 * 无关(首批判析 ≥10 即截断完成),选稳定有结果的常用词即可。
 */
export const MAPS_URL = 'https://www.google.com/maps/search/coffee+roasters+in+greenwich+village'

/**
 * 免费档单次导出行数上限(contract scrape.freeExportRowLimit,首批判析达限
 * 即截断并完成——当前对所有账号态无条件生效,Pro 差异在月度配额与 enrich)。
 */
export const FREE_ROW_LIMIT = 10

/** 面板宿主(light DOM 唯一锚点,面板本体在其 open shadow DOM 内)。 */
const PANEL_HOST_SELECTOR = '#gmap-extractor-panel-host'

/** 36 列表头基线(columns.ts SEARCH_EXPORT_COLUMNS 固定列序,默认全列导出)。 */
export const EXPECTED_HEADERS = [
  'Name',
  'Description',
  'Fulladdress',
  'Street',
  'Municipality',
  'Categories',
  'About',
  'Plus Code',
  'Time Zone',
  'Price',
  'Note',
  'Amenities',
  'Hotel Class',
  'Phone',
  'Phones',
  'Claimed',
  'Owner',
  'Owner Id',
  'Owner Link',
  'Email',
  'Social Medias',
  'Review Count',
  'Average Rating',
  'Review URL',
  'Google Maps URL',
  'Google Knowledge URL',
  'Latitude',
  'Longitude',
  'Website',
  'Domain',
  'Opening Hours',
  'Featured Image',
  'Cid',
  'Fid',
  'Place Id',
  'Kgmid'
]

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
 * maps-extension-pro 场景;token 与插件 exchange 同构)。
 */
export interface MapsE2eAuth {
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

/** 面板宿主 locator(零尺寸元素,存在性用 toHaveCount 断言;面板 UI 在其 open shadow DOM 内,由 role/text locator 直接穿透定位)。 */
export function panelHost(page: Page): Locator {
  return page.locator(PANEL_HOST_SELECTOR)
}

/** Start Extracting 按钮(idle 态)。 */
export function startButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Start Extracting' })
}

/** 完成态导出按钮(名称含实时计数,如 `Export Detailed List - 32 (.CSV)`)。 */
export function exportButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Export Detailed List - \d+ \(\.CSV\)$/ })
}

/** 从完成态导出按钮名称解析采集计数。 */
export async function readCollectedCount(page: Page): Promise<number> {
  const name = (await exportButton(page).innerText()).trim()
  return Number(name.match(/^Export Detailed List - (\d+) \(\.CSV\)$/)?.[1] ?? 0)
}

/**
 * RFC4180 引号感知的整文 CSV 解析(状态机):引号包裹字段可含逗号与**换行**
 * (gmap 的 About/Amenities 实数据多行,裸按 \n 切行会碎行),引号内 `"`
 * 双写转义;BOM 剥离、CRLF 行尾、末尾空行过滤。列级断言一律用它。
 */
export function parseCsv(content: string): string[][] {
  const text = content.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter(item => !(item.length === 1 && item[0] === ''))
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
export async function launchRealMapsContext(): Promise<BrowserContext> {
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
 * 与 v3 登录持久化落点一致)。登录流程本身不做 e2e(2026-09-02 hydra
 * 拍板);content script 在后续导航中读到即登录态。
 */
export async function injectExtensionAuth(serviceWorker: Worker, auth: MapsE2eAuth): Promise<void> {
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

/**
 * 用户设置直注(同一真实通道,等价用户在 options 页选过档位):稀疏写入
 * maps_user_settings,5s 为远程档位最小值,把整轮真实采集时长压进有界窗口。
 */
export async function injectFastInterval(serviceWorker: Worker): Promise<void> {
  await serviceWorker.evaluate(() => {
    return chrome.storage.local.set({ maps_user_settings: { requestIntervalSec: 5 } })
  })
}

/** 条件化跳过:原因落到测试输出与报告标注(skip-reason),不阻塞整体退出码。 */
export function skipSmoke(reason: string): void {
  console.warn(`[real-maps] SKIP: ${reason}`)
  test.info().annotations.push({ type: 'skip-reason', description: reason })
  test.skip(true, reason)
}

/**
 * Google 同意页(Cookie Consent)自动接受:en-US 下按钮为「Accept all」;
 * 未出现同意页时静默通过。同意页不处理则 content script 挂载目标页不可达。
 */
export async function dismissConsent(page: Page): Promise<void> {
  try {
    const accept = page.getByRole('button', { name: 'Accept all' })
    await accept.click({ timeout: 5_000 })
    await page.waitForURL(url => !url.href.includes('consent.google.com'), { timeout: 15_000 })
  } catch {
    // 无同意页(常见于非欧盟出口 IP):正常路径
  }
}

/**
 * 人机验证/挑战页启发式探测:命中返回特征描述,未命中返回 null。
 * Google 挑战形态:/sorry/ 路径(图片验证码)、unusual traffic 文案、
 * recaptcha iframe。
 */
export async function detectChallenge(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      const href = location.href
      const title = document.title.toLowerCase()
      const bodyText = (document.body?.innerText ?? '').slice(0, 4000).toLowerCase()
      if (href.includes('/sorry/') || href.includes('/sorry?')) {
        return `落地 /sorry/ 人机验证页(标题: ${document.title})`
      }
      if (/unusual traffic|not a robot|verify (that you are|you are) human/.test(`${title} ${bodyText}`)) {
        return `页面文案命中人机验证特征(标题: ${document.title})`
      }
      if (document.querySelector('iframe[src*="recaptcha"], iframe[title*="recaptcha" i]')) {
        return '页面存在 recaptcha iframe'
      }
      return null
    })
  } catch {
    // 页面已跳转/销毁等评测环境异常:按未命中处理,由后续超时路径兜底
    return null
  }
}

/** 落地域偏离描述(manifest 仅匹配 www.google.com):记录实际落地 host 供归因。 */
export async function describeLandingHost(page: Page): Promise<string> {
  try {
    const host = new URL(page.url()).host
    return host && host !== 'www.google.com' ? `;实际落地域 ${host}` : ''
  } catch {
    return ''
  }
}
