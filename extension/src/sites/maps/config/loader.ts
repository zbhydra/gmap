/**
 * Maps 远程配置 loader（content 侧）。
 *
 * 实现 013 域拍板的五要素机制：
 * 1. 编译期完整默认值（contract.ts 的 DEFAULT_MAPS_CONFIG，此处拷贝为模块级单例）；
 * 2. 每 document 一次拉取：`loadPromise ??= doLoad()` 记忆化，SPA 路由切换不重拉；
 * 3. 经 background RPC `getMapsConfig` 读取带 TTL 缓存的远程覆盖，失败静默回退；
 * 4. 分组覆盖到模块级单例（组内键浅合并；parseSchema 的两张下标表按键
 *    稀疏合并），远程缺键保留包内值、多余键原样进入；
 * 5. try/catch 静默回退：拉取/解析失败仅 logger.error，绝不中断页面业务。
 *
 * 持久缓存与网络访问统一由 background 管理；content 仅保留当前 document 内存态。
 * 消费者每次运行时现读 `getMapsConfig()` 活对象——远程改配置刷新页面即生效。
 */

import { logger } from '@/core/utils/logger'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import {
  DEFAULT_MAPS_CONFIG,
  type MapsParseSchemaOverride,
  type MapsRemoteConfig,
  type MapsRemoteConfigOverride
} from './contract'

/** 模块级配置单例：组间、与 DEFAULT_MAPS_CONFIG 之间均不共享引用。 */
let mapsConfig: MapsRemoteConfig = cloneDefaultConfig()

/** 每 document 记忆化的加载 Promise，保证每 document 至多一次网络拉取。 */
let loadPromise: Promise<void> | null = null

/**
 * 读取生效中的 Maps 远程配置（活对象，消费方每次运行时现读）。
 */
export function getMapsConfig(): MapsRemoteConfig {
  return mapsConfig
}

/**
 * 经 background 加载远程配置，失败静默回退包内默认值。
 * 每 document 至多触发一次 RPC。
 */
export function loadMapsConfig(): Promise<void> {
  loadPromise ??= doLoad()
  return loadPromise
}

/** 仅测试用：重置配置单例与记忆化状态，隔离用例间污染。 */
export function resetMapsConfigForTests(): void {
  mapsConfig = cloneDefaultConfig()
  loadPromise = null
}

/** 执行一次加载，失败回退默认值。 */
async function doLoad(): Promise<void> {
  try {
    const override = await fetchOverride()
    applyOverride(override)
    logger.info('[MapsRemoteConfig] background 配置读取并覆盖成功')
  } catch (error) {
    // 失败不静默到不可见：记录错误后保持包内默认值，功能不中断。
    logger.error('[MapsRemoteConfig] 远程配置拉取失败，回退包内默认值:', error)
  }
}

/** 经 background RPC 透传拉取稀疏覆盖载荷。 */
async function fetchOverride(): Promise<MapsRemoteConfigOverride> {
  const channel = new BackgroundChannel()
  try {
    return await channel.getMapsConfig()
  } finally {
    channel.destroy()
  }
}

/** 分组浅覆盖到模块级单例：只替换组内键值，不替换组对象本身。 */
function applyOverride(override: MapsRemoteConfigOverride): void {
  Object.assign(mapsConfig.dom, override.dom)
  Object.assign(mapsConfig.reviewsDom, override.reviewsDom)
  applyParseSchemaOverride(override.parseSchema)
  Object.assign(mapsConfig.exportConfig, override.exportConfig)
  Object.assign(mapsConfig.scrape, override.scrape)
  Object.assign(mapsConfig.operations, override.operations)
}

/**
 * parseSchema 组覆盖：标量键浅合并；fields / reviewsFields 两张下标表必须
 * **按键稀疏合并**——Object.assign 整表替换会把服务端未下发字段的路径清成
 * undefined，抽取层 getValueAt 迭代 undefined 直接抛错、整批解析失败
 * （2026-09-02 真实 e2e 实测回归：服务端只下发 10 字段旧快照时全部采集
 * 崩溃为 0 条，mock 层下发全量表掩盖了该缺陷）。
 */
function applyParseSchemaOverride(sparse: MapsParseSchemaOverride | undefined): void {
  if (sparse === undefined) {
    return
  }
  const { fields, reviewsFields, ...groupKeys } = sparse
  Object.assign(mapsConfig.parseSchema, groupKeys)
  if (fields !== undefined) {
    Object.assign(mapsConfig.parseSchema.fields, fields)
  }
  if (reviewsFields !== undefined) {
    Object.assign(mapsConfig.parseSchema.reviewsFields, reviewsFields)
  }
}

/** 深拷贝默认配置（fields 组不共享引用），保证覆盖不污染 DEFAULT_MAPS_CONFIG。 */
function cloneDefaultConfig(): MapsRemoteConfig {
  return {
    dom: { ...DEFAULT_MAPS_CONFIG.dom },
    reviewsDom: { ...DEFAULT_MAPS_CONFIG.reviewsDom },
    parseSchema: {
      ...DEFAULT_MAPS_CONFIG.parseSchema,
      fields: { ...DEFAULT_MAPS_CONFIG.parseSchema.fields },
      reviewsFields: { ...DEFAULT_MAPS_CONFIG.parseSchema.reviewsFields }
    },
    exportConfig: { ...DEFAULT_MAPS_CONFIG.exportConfig },
    scrape: { ...DEFAULT_MAPS_CONFIG.scrape },
    operations: { ...DEFAULT_MAPS_CONFIG.operations }
  }
}
