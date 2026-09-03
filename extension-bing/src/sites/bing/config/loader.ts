/**
 * Bing 远程配置 loader（content 侧）。
 *
 * 实现 013 域拍板的五要素机制（T1 §2）：
 * 1. 编译期完整默认值（contract.ts 的 DEFAULT_BING_CONFIG，此处拷贝为模块级单例）；
 * 2. 每 document 一次拉取：`loadPromise ??= doLoad()` 记忆化，SPA 路由切换不重拉；
 * 3. 经 background RPC `getBingConfig` 读取带 TTL 缓存的远程覆盖，失败静默回退；
 * 4. Object.assign 分组浅覆盖到模块级单例（adapters 为整体替换），远程缺键保留包内值；
 * 5. try/catch 静默回退：拉取/解析失败仅 logger.error，绝不中断页面业务。
 *
 * 持久缓存与网络访问统一由 background 管理；content 仅保留当前 document 内存态。
 * 消费者每次运行时现读 `getBingConfig()` 活对象——远程改配置刷新页面即生效。
 */

import { logger } from '@/core/utils/logger'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import {
  DEFAULT_BING_CONFIG,
  type BingAdapterConfig,
  type BingAdapterSelectors,
  type BingRemoteConfig,
  type BingRemoteConfigOverride
} from './contract'

/** 模块级配置单例：组间、与 DEFAULT_BING_CONFIG 之间均不共享引用。 */
let bingConfig: BingRemoteConfig = cloneDefaultConfig()

/** 每 document 记忆化的加载 Promise，保证每 document 至多一次网络拉取。 */
let loadPromise: Promise<void> | null = null

/**
 * 读取生效中的 Bing 远程配置（活对象，消费方每次运行时现读）。
 */
export function getBingConfig(): BingRemoteConfig {
  return bingConfig
}

/**
 * 经 background 加载远程配置，失败静默回退包内默认值。
 * 每 document 至多触发一次 RPC。
 */
export function loadBingConfig(): Promise<void> {
  loadPromise ??= doLoad()
  return loadPromise
}

/** 仅测试用：重置配置单例与记忆化状态，隔离用例间污染。 */
export function resetBingConfigForTests(): void {
  bingConfig = cloneDefaultConfig()
  loadPromise = null
}

/** 执行一次加载，失败回退默认值。 */
async function doLoad(): Promise<void> {
  try {
    const override = await fetchOverride()
    applyOverride(override)
    logger.info('[BingRemoteConfig] background 配置读取并覆盖成功')
  } catch (error) {
    // 失败不静默到不可见：记录错误后保持包内默认值，功能不中断。
    logger.error('[BingRemoteConfig] 远程配置拉取失败，回退包内默认值:', error)
  }
}

/** 经 background RPC 透传拉取稀疏覆盖载荷。 */
async function fetchOverride(): Promise<BingRemoteConfigOverride> {
  const channel = new BackgroundChannel()
  try {
    return await channel.getBingConfig()
  } finally {
    channel.destroy()
  }
}

/** 分组覆盖到模块级单例：adapters 整体替换，其余组浅合并（不替换组对象本身）。 */
function applyOverride(override: BingRemoteConfigOverride): void {
  if (override.adapters) {
    bingConfig.adapters = override.adapters.map(cloneAdapter)
  }
  Object.assign(bingConfig.parse, override.parse)
  Object.assign(bingConfig.scrape, override.scrape)
  Object.assign(bingConfig.export, override.export)
  Object.assign(bingConfig.panel, override.panel)
}

/** 深拷贝默认配置（嵌套数组/选择器组不共享引用），保证覆盖不污染 DEFAULT_BING_CONFIG。 */
function cloneDefaultConfig(): BingRemoteConfig {
  return {
    adapters: DEFAULT_BING_CONFIG.adapters.map(cloneAdapter),
    parse: { ...DEFAULT_BING_CONFIG.parse },
    scrape: { ...DEFAULT_BING_CONFIG.scrape },
    export: { ...DEFAULT_BING_CONFIG.export },
    panel: { ...DEFAULT_BING_CONFIG.panel }
  }
}

/** 拷贝单版本适配器（探测与选择器数组均不共享引用，防覆盖污染默认值/载荷本体）。 */
function cloneAdapter(adapter: BingAdapterConfig): BingAdapterConfig {
  return {
    ...adapter,
    detectors: [...adapter.detectors],
    fallbackDetectors: [...adapter.fallbackDetectors],
    selectors: cloneSelectors(adapter.selectors)
  }
}

/** 选择器组逐键拷贝：数组值复制新实例，非数组值（infiniteScroll 布尔）原样保留。 */
function cloneSelectors(selectors: BingAdapterSelectors): BingAdapterSelectors {
  const clone: BingAdapterSelectors = { ...selectors }
  for (const key of Object.keys(clone)) {
    const value = clone[key]
    if (Array.isArray(value)) {
      clone[key] = [...value]
    }
  }
  return clone
}
