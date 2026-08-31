import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import webExtension, { type PluginOptions } from 'vite-plugin-web-extension'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import { resolve } from 'path'

type ExtensionDevWebExtensionConfig = Partial<Pick<PluginOptions, 'disableAutoLaunch'>>

/**
 * 上架目标渠道（013 A13，U11）：由 `EXTENSION_BUILD_TARGET` 注入。
 * - chrome：默认渠道（Chromium manifest，含 dev 装载与 Chrome 产物基线）；
 * - edge：Edge Add-ons，Chromium 内核 manifest 与 chrome 完全一致（独立 zip 便于归档）；
 * - firefox：Firefox AMO，MV3 background 是事件页（无 service_worker），
 *   按 AMO 政策调整 manifest（见 buildFirefoxManifestExtras）。
 */
type ExtensionBuildTarget = 'chrome' | 'edge' | 'firefox'

const BUILD_TARGETS: readonly ExtensionBuildTarget[] = ['chrome', 'edge', 'firefox']

/** `scripts/dev-edge-current.mjs` 注入的开发浏览器模式标识。 */
const EDGE_CURRENT_DEV_BROWSER = 'edge-current'

/** 读取并校验构建目标渠道（非法值直接 fail build，禁止静默回退）。 */
function resolveBuildTarget(target: string | undefined): ExtensionBuildTarget {
  const value = target?.trim() || 'chrome'
  if (!(BUILD_TARGETS as readonly string[]).includes(value)) {
    throw new Error(
      `[vite-config] 非法 EXTENSION_BUILD_TARGET: ${value}（可选 ${BUILD_TARGETS.join(' | ')}）`
    )
  }
  return value
}

const DEFAULT_DEV_API_BASE_URL = 'http://localhost:9600'
// TODO(maps): Maps 产品后端域名确定后替换。
const DEFAULT_PROD_API_BASE_URL = 'https://api.example.com'
const DEFAULT_DEV_WEBSITE_BASE_URL = 'http://localhost:9620'
// TODO(maps): Maps 官网域名确定后替换。
const DEFAULT_PROD_WEBSITE_BASE_URL = 'https://www.example.com'
const PROD_WWW_WEBSITE_BASE_URL = 'https://www.example.com'
// TODO(maps): Google OAuth client_id 待 hydra 申请后经 EXTENSION_GOOGLE_OAUTH_CLIENT_ID
// 注入（013 A10，U9）。占位值无法通过真实授权（Chrome 会报 OAuth2 client 校验失败），
// 授权流程与单测/e2e 均按占位口径验证。
const DEFAULT_GOOGLE_OAUTH_CLIENT_ID = 'placeholder-google-oauth-client-id'
const DEFAULT_PROD_ALI_SLS_PROJECT = 'gmaps'
const DEFAULT_PROD_ALI_SLS_HOST = 'ap-southeast-1.log.aliyuncs.com'
const DEFAULT_PROD_ALI_SLS_LOGSTORE = 'gmaps-mark-log'
const DEFAULT_ALI_SLS_TOPIC = 'mark-log'
const DEFAULT_ALI_SLS_SOURCE = 'extension'
const DEFAULT_PROD_WEBSITE_ORIGIN = toOrigin(DEFAULT_PROD_WEBSITE_BASE_URL)
const PROD_WWW_WEBSITE_ORIGIN = toOrigin(PROD_WWW_WEBSITE_BASE_URL)

interface ExtensionBuildProcessEnv {
  NODE_ENV?: string
  EXTENSION_RELEASE_CHANNEL?: string
  EXTENSION_BUILD_TARGET?: string
  EXTENSION_API_BASE_URL?: string
  EXTENSION_WEBSITE_BASE_URL?: string
  EXTENSION_GOOGLE_OAUTH_CLIENT_ID?: string
  EXTENSION_ALI_SLS_PROJECT?: string
  EXTENSION_ALI_SLS_HOST?: string
  EXTENSION_ALI_SLS_ENDPOINT?: string
  EXTENSION_ALI_SLS_LOGSTORE?: string
  EXTENSION_ALI_SLS_TOPIC?: string
  EXTENSION_ALI_SLS_SOURCE?: string
  EXTENSION_ALI_SLS_ENABLED?: string
  PUBLIC_ALI_SLS_PROJECT?: string
  PUBLIC_ALI_SLS_HOST?: string
  PUBLIC_ALI_SLS_ENDPOINT?: string
  PUBLIC_ALI_SLS_LOGSTORE?: string
  PUBLIC_ALI_SLS_TOPIC?: string
  PUBLIC_ALI_SLS_SOURCE?: string
  PUBLIC_ALI_SLS_ENABLED?: string
}

export interface ExtensionBuildEnvConfig {
  /** 当前构建是否使用生产环境默认域名和压缩策略。 */
  isProductionBuild: boolean
  /** Manifest 使用商店身份还是独立预发布身份。 */
  releaseChannel: 'store' | 'pre-release'
  /** 插件运行时请求的后端 API base URL。 */
  apiBaseUrl: string
  /** 插件统一登录桥接使用的官网 base URL。 */
  websiteBaseUrl: string
  /** Manifest oauth2.client_id（Chrome identity 授权用，占位待 hydra 申请）。 */
  googleOauthClientId: string
  /** 插件 SLS WebTracking 配置。 */
  aliSlsMark: ExtensionAliSlsMarkConfig
  /** Manifest externally_connectable.matches（官网外部消息来源白名单）。 */
  externallyConnectableMatches: readonly string[]
}

export interface ExtensionAliSlsMarkConfig {
  /** 是否启用插件端 SLS mark-log 上报。 */
  enabled: boolean
  /** SLS WebTracking endpoint，不含末尾斜杠。 */
  endpoint: string
  /** SLS Logstore 名称。 */
  logstore: string
  /** SLS topic。 */
  topic: string
  /** SLS source。 */
  source: string
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

function resolveBaseUrl(value: string | undefined, fallback: string): string {
  const trimmedValue = value?.trim()
  return normalizeBaseUrl(trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback)
}

function readEnvValue(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmedValue = value?.trim()
    if (trimmedValue) {
      return trimmedValue
    }
  }

  return ''
}

function normalizeSlsHost(host: string): string {
  return host.replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

function normalizeSlsEndpoint(endpoint: string): string {
  return endpoint.replace(/\/+$/, '')
}

function isExplicitlyDisabled(value: string): boolean {
  return value.toLowerCase() === 'false'
}

function resolveAliSlsMarkConfig(
  env: ExtensionBuildProcessEnv,
  isProductionBuild: boolean
): ExtensionAliSlsMarkConfig {
  const endpointFromEnv = normalizeSlsEndpoint(
    readEnvValue(env.EXTENSION_ALI_SLS_ENDPOINT, env.PUBLIC_ALI_SLS_ENDPOINT)
  )
  const project =
    readEnvValue(env.EXTENSION_ALI_SLS_PROJECT, env.PUBLIC_ALI_SLS_PROJECT) ||
    (isProductionBuild ? DEFAULT_PROD_ALI_SLS_PROJECT : '')
  const host =
    normalizeSlsHost(readEnvValue(env.EXTENSION_ALI_SLS_HOST, env.PUBLIC_ALI_SLS_HOST)) ||
    (isProductionBuild ? DEFAULT_PROD_ALI_SLS_HOST : '')
  const endpoint = endpointFromEnv || (project && host ? `https://${project}.${host}` : '')
  const logstore =
    readEnvValue(env.EXTENSION_ALI_SLS_LOGSTORE, env.PUBLIC_ALI_SLS_LOGSTORE) ||
    (isProductionBuild ? DEFAULT_PROD_ALI_SLS_LOGSTORE : '')
  const enabledValue = readEnvValue(env.EXTENSION_ALI_SLS_ENABLED, env.PUBLIC_ALI_SLS_ENABLED)

  return {
    enabled: !isExplicitlyDisabled(enabledValue) && Boolean(endpoint && logstore),
    endpoint,
    logstore,
    topic:
      readEnvValue(env.EXTENSION_ALI_SLS_TOPIC, env.PUBLIC_ALI_SLS_TOPIC) ||
      DEFAULT_ALI_SLS_TOPIC,
    source:
      readEnvValue(env.EXTENSION_ALI_SLS_SOURCE, env.PUBLIC_ALI_SLS_SOURCE) ||
      DEFAULT_ALI_SLS_SOURCE
  }
}

function toOrigin(value: string): string {
  return new URL(value).origin
}

function toMatchPattern(origin: string): string {
  return `${origin}/*`
}

function uniqueValues(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function resolveRuntimeWebsiteAuthOrigins(websiteOrigin: string): string[] {
  return uniqueValues([
    websiteOrigin,
    ...(websiteOrigin === DEFAULT_PROD_WEBSITE_ORIGIN ? [PROD_WWW_WEBSITE_ORIGIN] : [])
  ])
}

export function createExtensionBuildEnv(env: ExtensionBuildProcessEnv): ExtensionBuildEnvConfig {
  const isProductionBuild = env.NODE_ENV === 'production'
  const releaseChannel =
    isProductionBuild && env.EXTENSION_RELEASE_CHANNEL !== 'pre-release'
      ? 'store'
      : 'pre-release'
  const apiBaseUrl = resolveBaseUrl(
    env.EXTENSION_API_BASE_URL,
    isProductionBuild ? DEFAULT_PROD_API_BASE_URL : DEFAULT_DEV_API_BASE_URL
  )
  const websiteBaseUrl = resolveBaseUrl(
    env.EXTENSION_WEBSITE_BASE_URL,
    isProductionBuild ? DEFAULT_PROD_WEBSITE_BASE_URL : DEFAULT_DEV_WEBSITE_BASE_URL
  )
  const aliSlsMark = resolveAliSlsMarkConfig(env, isProductionBuild)
  const googleOauthClientId =
    env.EXTENSION_GOOGLE_OAUTH_CLIENT_ID?.trim() || DEFAULT_GOOGLE_OAUTH_CLIENT_ID
  const websiteOrigin = toOrigin(websiteBaseUrl)
  const runtimeWebsiteAuthOrigins = resolveRuntimeWebsiteAuthOrigins(websiteOrigin)
  const externallyConnectableMatches = runtimeWebsiteAuthOrigins.map(toMatchPattern)

  return {
    isProductionBuild,
    releaseChannel,
    apiBaseUrl,
    websiteBaseUrl,
    googleOauthClientId,
    aliSlsMark,
    externallyConnectableMatches
  }
}

const extensionBuildEnv = createExtensionBuildEnv({
  NODE_ENV: process.env.NODE_ENV,
  EXTENSION_RELEASE_CHANNEL: process.env.EXTENSION_RELEASE_CHANNEL,
  EXTENSION_BUILD_TARGET: process.env.EXTENSION_BUILD_TARGET,
  EXTENSION_API_BASE_URL: process.env.EXTENSION_API_BASE_URL,
  EXTENSION_WEBSITE_BASE_URL: process.env.EXTENSION_WEBSITE_BASE_URL,
  EXTENSION_GOOGLE_OAUTH_CLIENT_ID: process.env.EXTENSION_GOOGLE_OAUTH_CLIENT_ID,
  EXTENSION_ALI_SLS_PROJECT: process.env.EXTENSION_ALI_SLS_PROJECT,
  EXTENSION_ALI_SLS_HOST: process.env.EXTENSION_ALI_SLS_HOST,
  EXTENSION_ALI_SLS_ENDPOINT: process.env.EXTENSION_ALI_SLS_ENDPOINT,
  EXTENSION_ALI_SLS_LOGSTORE: process.env.EXTENSION_ALI_SLS_LOGSTORE,
  EXTENSION_ALI_SLS_TOPIC: process.env.EXTENSION_ALI_SLS_TOPIC,
  EXTENSION_ALI_SLS_SOURCE: process.env.EXTENSION_ALI_SLS_SOURCE,
  EXTENSION_ALI_SLS_ENABLED: process.env.EXTENSION_ALI_SLS_ENABLED,
  PUBLIC_ALI_SLS_PROJECT: process.env.PUBLIC_ALI_SLS_PROJECT,
  PUBLIC_ALI_SLS_HOST: process.env.PUBLIC_ALI_SLS_HOST,
  PUBLIC_ALI_SLS_ENDPOINT: process.env.PUBLIC_ALI_SLS_ENDPOINT,
  PUBLIC_ALI_SLS_LOGSTORE: process.env.PUBLIC_ALI_SLS_LOGSTORE,
  PUBLIC_ALI_SLS_TOPIC: process.env.PUBLIC_ALI_SLS_TOPIC,
  PUBLIC_ALI_SLS_SOURCE: process.env.PUBLIC_ALI_SLS_SOURCE,
  PUBLIC_ALI_SLS_ENABLED: process.env.PUBLIC_ALI_SLS_ENABLED
})

/** `scripts/dev-edge-current.mjs` 注入的开发浏览器模式。 */
function resolveDevWebExtensionConfig(): ExtensionDevWebExtensionConfig {
  return process.env.EXTENSION_DEV_BROWSER === EDGE_CURRENT_DEV_BROWSER
    ? { disableAutoLaunch: false }
    : {}
}

const devWebExtensionConfig = resolveDevWebExtensionConfig()

/** 当前构建的目标渠道（模块级一次性解析；`scripts/build-store.mjs` 按渠道独立子进程构建）。 */
const buildTarget = resolveBuildTarget(process.env.EXTENSION_BUILD_TARGET)

/**
 * Firefox AMO 专属 manifest 段（013 A13，U11；逐项依据见 docs/feat/013.Maps插件/plans/002.上架清单.md）：
 * - gecko.id：AMO 签名与更新的永久身份，占位值待 hydra 拍板后替换（TODO）；
 * - strict_min_version：data_collection_permissions 的内置授权体验要求 Firefox 140+，
 *   低于该版本本 manifest 键会被忽略、采集类声明缺失；
 * - data_collection_permissions：AMO 2025-11-03 起新扩展强制声明。required 只保留
 *   websiteContent（采集引擎必然处理用户浏览的 Maps 页面内容）；SLS 行为打点归
 *   optional 的 technicalAndInteraction（Mozilla 规定该项不可 required，由用户
 *   授权开关控制）；
 * - background 用 scripts（事件页）替代 service_worker——Firefox MV3 不支持
 *   SW（A13/11 号 #5：事件页常驻语义下落盘状态机天然兼容，调度代码零改动）。
 * Chromium 专属差异：oauth2 键（chrome.identity.getAuthToken 专用，Firefox 无此
 * API，Drive 直传在 Firefox 不可用）与 externally_connectable（Firefox 不支持）
 * 均不进入 Firefox manifest；identity 权限保留（HubSpot 的 launchWebAuthFlow
 * 在 Firefox 可用）。
 */
interface FirefoxManifestExtras {
  background: { scripts: string[] }
  browser_specific_settings: {
    gecko: {
      id: string
      strict_min_version: string
      data_collection_permissions: { required: string[]; optional: string[] }
    }
  }
}

// TODO(maps): gecko.id 为上架永久身份，占位待 hydra 拍板后替换。
const FIREFOX_GECKO_ID = 'mapsgrab@example.com'

function buildFirefoxManifestExtras(): FirefoxManifestExtras {
  return {
    background: { scripts: ['src/background/index.ts'] },
    browser_specific_settings: {
      gecko: {
        id: FIREFOX_GECKO_ID,
        strict_min_version: '140.0',
        data_collection_permissions: {
          required: ['websiteContent'],
          optional: ['technicalAndInteraction']
        }
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  // 定义全局常量，避免在 Service Worker 中使用 import.meta.env
  define: {
    __API_BASE_URL__: JSON.stringify(extensionBuildEnv.apiBaseUrl),
    __DEV__: JSON.stringify(!extensionBuildEnv.isProductionBuild),
    __WEBSITE_BASE_URL__: JSON.stringify(extensionBuildEnv.websiteBaseUrl),
    __ALI_SLS_MARK_CONFIG__: JSON.stringify(extensionBuildEnv.aliSlsMark)
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  plugins: [
    vue(),
    VueI18n({
      include: [resolve(__dirname, './src/locales/**/*.json')],
      runtimeOnly: false
    }),
    webExtension({
      ...devWebExtensionConfig,
      // injected 入口只经 web_accessible_resources + runtime.getURL 注入，
      // manifest 不直接引用，需显式声明为构建入口；dashboard 页（013 A6）
      // 是独立扩展页（经 runtime.getURL 打开）；bulk-launch 是批量工作页的
      // 启动中转页（SW tabs.create 的主框架导航在 Playwright 下绕过 route，
      // 由扩展页渲染进程发起跳转以保证 e2e 可拦截）——均不在 manifest 引用。
      additionalInputs: ['src/injected/index.ts', 'src/dashboard.html', 'src/bulk-launch.html'],
      skipManifestValidation: true, // 禁用schema验证 ,不然会卡主很多
      manifest: () => ({
        manifest_version: 3,
        name: '__MSG_extensionName__',
        version: '0.1.0',
        default_locale: 'en',
        description: '__MSG_extensionDescription__',
        // 商店主页（官网，占位域名）；Firefox 忽略该键，渠道差异见下方 firefox 分支
        ...(buildTarget === 'firefox' ? {} : { homepage_url: extensionBuildEnv.websiteBaseUrl }),
        // alarms：批量任务兜底扫描（013 A6 步进状态机的恢复/卡死判定通道）
        // identity：Drive 直传授权（013 A10，chrome.identity.getAuthToken），
        // client_id/scopes 由下方 oauth2 段声明（占位 client_id，待 hydra 申请）
        permissions: ['storage', 'alarms', 'identity'],
        // googleapis.com：Drive REST multipart 上传仅由 background SW 发起；
        // HubSpot 商家同步经 backend 代理端点转发，但 OAuth token 交换/刷新
        // 直连 api.hubapi.com（integrations.ts，凭 CORS 放行，待 real smoke
        // 验证；失败则补 api.hubapi.com host_permissions）
        host_permissions: ['https://www.googleapis.com/*'],
        // OAuth2 客户端（chrome.identity.getAuthToken 从 manifest 读取）。
        // scope 用 drive.file 最小授权：只能访问本插件创建的文件。
        // Firefox 无 getAuthToken，oauth2 键不进入 Firefox manifest。
        ...(buildTarget === 'firefox'
          ? {}
          : {
              oauth2: {
                client_id: extensionBuildEnv.googleOauthClientId,
                scopes: ['https://www.googleapis.com/auth/drive.file']
              }
            }),
        content_scripts: [
          {
            matches: [
              'https://www.google.com/maps/*',
              'https://www.google.com/search*',
              'https://search.google.com/local/reviews*'
            ],
            js: ['src/content/index.ts'],
            // injected hook 必须赶在 Maps 页面脚本发起内部 RPC 之前就位；
            // 评论工作页（search.google.com）由 bootstrap 按 URL 分流自治 boot
            run_at: 'document_start'
          }
        ],
        web_accessible_resources: [
          {
            resources: ['src/injected/index.js'],
            matches: ['https://www.google.com/*']
          }
        ],
        action: {
          default_popup: 'src/popup.html',
          default_title: '__MSG_actionTitle__',
          default_icon: {
            '16': 'icons/16.png',
            '24': 'icons/24.png',
            '32': 'icons/32.png',
            '48': 'icons/48.png',
            '64': 'icons/64.png',
            '128': 'icons/128.png'
          }
        },
        // 设置页独立标签页打开（013 A9：设置项全集放不下弹窗）
        options_ui: {
          page: 'src/options.html',
          open_in_tab: true
        },
        icons: {
          '16': 'icons/16.png',
          '24': 'icons/24.png',
          '32': 'icons/32.png',
          '48': 'icons/48.png',
          '64': 'icons/64.png',
          '128': 'icons/128.png'
        },
        // Firefox MV3：background 是事件页（scripts），并追加 AMO 政策段；
        // Chromium 渠道保持 service_worker。见 buildFirefoxManifestExtras 注释。
        ...(buildTarget === 'firefox'
          ? buildFirefoxManifestExtras()
          : {
              background: {
                service_worker: 'src/background/index.ts'
              }
            }),
        // TODO(maps): 官网登录桥决策后恢复 externally_connectable 白名单。
        // Firefox 不支持该键（运行时外部消息能力另有模型），不进入 Firefox manifest。
        ...(buildTarget === 'firefox'
          ? {}
          : {
              externally_connectable: {
                matches: []
              }
            })
      })
    })
  ],
  server: {
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 5173,
    strictPort: true
  },
  build: {
    // e2e 构建变体经 EXTENSION_BUILD_OUT_DIR 指到 dist-e2e（scripts/build-e2e.mjs），
    // 插件对 inline override 处理不一致，必须由 config 本身读取环境变量
    outDir: process.env.EXTENSION_BUILD_OUT_DIR ?? 'dist',
    emptyOutDir: true,
    // 为 Service Worker 禁用某些优化，避免 document 引用问题
    rollupOptions: {
      output: {
        // 确保每个 chunk 是独立的
        inlineDynamicImports: false
      }
    },
    // 开发模式：禁用压缩以便调试
    minify: extensionBuildEnv.isProductionBuild ? 'esbuild' : false,
    // 生成 source map 以便调试
    sourcemap: !extensionBuildEnv.isProductionBuild ? true : false
  }
})
