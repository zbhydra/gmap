/**
 * Bing 远程配置 loader（content 侧）。
 *
 * 实现 013 域拍板的五要素机制（T1 §2）：
 * 1. 编译期完整默认值（contract.ts 的 DEFAULT_BING_CONFIG，此处拷贝为模块级单例）；
 * 2. 每 document 一次拉取：`loadPromise ??= doLoad()` 记忆化，SPA 路由切换不重拉；
 * 3. 经 background RPC `getBingConfig` 透传 HTTP 拉取，失败静默回退；
 * 4. Object.assign 分组浅覆盖到模块级单例（adapters 为整体替换），远程缺键保留包内值；
 * 5. try/catch 静默回退：拉取/解析失败仅 logger.error，绝不中断页面业务。
 *
 * 拉取时机按时间控制：storage 记录上次成功拉取的时间戳与覆盖载荷，1 小时内
 * 不重复发 HTTP（直接应用上次结果）；无缓存或缓存过期才走网络。
 * 消费者每次运行时现读 `getBingConfig()` 活对象——远程改配置刷新页面即生效。
 */

import { logger } from '@/core/utils/logger'
import { storageManager } from '@/core/storage'
import { STORAGE_KEYS } from '@/core/api/config'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import {
  DEFAULT_BING_CONFIG,
  type BingAdapterConfig,
  type BingAdapterSelectors,
  type BingRemoteConfig,
  type BingRemoteConfigOverride
} from './contract'

/** 远程配置缓存有效期：1 小时内不重复拉取。 */
const CACHE_TTL_MS = 60 * 60 * 1000

/** storage 缓存条目。 */
interface BingRemoteConfigCache {
  /** 上次拉取成功的毫秒时间戳。 */
  fetchedAt: number
  /** 上次成功应用的稀疏覆盖载荷。 */
  override: BingRemoteConfigOverride
}

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
 * 加载远程配置：1 小时内命中缓存直接应用；否则经 background 拉取并更新缓存；
 * 失败静默回退包内默认值。每 document 至多触发一次网络请求。
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

/** 执行一次加载：缓存命中走缓存，否则走网络，失败回退默认值。 */
async function doLoad(): Promise<void> {
  const cached = await readCache()

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    applyOverride(cached.override)
    logger.info('[BingRemoteConfig] 命中 1 小时内缓存，跳过远程拉取')
    return
  }

  try {
    const override = await fetchOverride()
    applyOverride(override)
    await writeCache({ fetchedAt: Date.now(), override })
    logger.info('[BingRemoteConfig] 远程配置拉取并覆盖成功')
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

/** 读取 storage 缓存；缺失或形状非法返回 null（视为无缓存）。 */
async function readCache(): Promise<BingRemoteConfigCache | null> {
  const cached = await storageManager.get<BingRemoteConfigCache>(STORAGE_KEYS.BING_REMOTE_CONFIG)

  if (
    cached &&
    typeof cached.fetchedAt === 'number' &&
    cached.override !== null &&
    typeof cached.override === 'object'
  ) {
    return cached
  }

  return null
}

/** 写入 storage 缓存；写失败不影响本次已生效的覆盖结果。 */
async function writeCache(cache: BingRemoteConfigCache): Promise<void> {
  try {
    await storageManager.set(STORAGE_KEYS.BING_REMOTE_CONFIG, cache)
  } catch (error) {
    logger.error('[BingRemoteConfig] 写入远程配置缓存失败:', error)
  }
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
