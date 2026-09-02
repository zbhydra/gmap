import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import webExtension, { type PluginOptions } from 'vite-plugin-web-extension'
import tailwindcss from '@tailwindcss/vite'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import { resolve } from 'path'

type ExtensionDevWebExtensionConfig = Partial<Pick<PluginOptions, 'disableAutoLaunch'>>

/** `scripts/dev-edge-current.mjs` 注入的开发浏览器模式标识。 */
const EDGE_CURRENT_DEV_BROWSER = 'edge-current'

const DEFAULT_DEV_API_BASE_URL = 'http://localhost:7600'
// TODO(maps): Maps 产品后端域名确定后替换。
const DEFAULT_PROD_API_BASE_URL = 'https://api.example.com'
const DEFAULT_DEV_WEBSITE_BASE_URL = 'http://localhost:7620'
// TODO(maps): Maps 官网域名确定后替换。
const DEFAULT_PROD_WEBSITE_BASE_URL = 'https://www.example.com'
const DEFAULT_PROD_ALI_SLS_PROJECT = 'bingmaps'
const DEFAULT_PROD_ALI_SLS_HOST = 'ap-southeast-1.log.aliyuncs.com'
const DEFAULT_PROD_ALI_SLS_LOGSTORE = 'bingmaps-mark-log'
const DEFAULT_ALI_SLS_TOPIC = 'mark-log'
const DEFAULT_ALI_SLS_SOURCE = 'extension'

interface ExtensionBuildProcessEnv {
  NODE_ENV?: string
  EXTENSION_RELEASE_CHANNEL?: string
  EXTENSION_API_BASE_URL?: string
  EXTENSION_WEBSITE_BASE_URL?: string
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
  /** 插件 SLS WebTracking 配置。 */
  aliSlsMark: ExtensionAliSlsMarkConfig
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

  return {
    isProductionBuild,
    releaseChannel,
    apiBaseUrl,
    websiteBaseUrl,
    aliSlsMark
  }
}

const extensionBuildEnv = createExtensionBuildEnv({
  NODE_ENV: process.env.NODE_ENV,
  EXTENSION_RELEASE_CHANNEL: process.env.EXTENSION_RELEASE_CHANNEL,
  EXTENSION_API_BASE_URL: process.env.EXTENSION_API_BASE_URL,
  EXTENSION_WEBSITE_BASE_URL: process.env.EXTENSION_WEBSITE_BASE_URL,
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
    tailwindcss(),
    webExtension({
      ...devWebExtensionConfig,
      skipManifestValidation: true, // 禁用schema验证 ,不然会卡主很多
      manifest: () => ({
        manifest_version: 3,
        name: '__MSG_extensionName__',
        version: '0.1.0',
        default_locale: 'en',
        description: '__MSG_extensionDescription__',
        // identity：v3 browser identity 登录（chrome.identity.launchWebAuthFlow +
        // PKCE，006 §3 协议合同），不登记扩展 ID、无 externally_connectable。
        permissions: ['storage', 'identity'],
        host_permissions: [],
        content_scripts: [
          {
            // Bing Maps 主战场（竞品同口径 *://*.bing.com/maps*，收紧为 https）；
            // 纯 DOM 采集无 MAIN world hook，document_end 注入即可
            matches: ['https://www.bing.com/maps*'],
            js: ['src/content/index.ts'],
            run_at: 'document_end'
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
        icons: {
          '16': 'icons/16.png',
          '24': 'icons/24.png',
          '32': 'icons/32.png',
          '48': 'icons/48.png',
          '64': 'icons/64.png',
          '128': 'icons/128.png'
        },
        background: {
          service_worker: 'src/background/index.ts'
        }
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
