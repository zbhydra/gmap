/**
 * 批量任务状态持久化（013 A6）：IndexedDB 单键存储 + 形状归一化。
 *
 * 存储选型（U5 拍板说明）：选 **IndexedDB** 而非 storage.session——
 * 1. chrome.alarms 在浏览器重启后会恢复触发，IndexedDB 里的任务状态支撑
 *    「重启后继续收尾/恢复」；storage.session 随浏览器关闭清空，任务队列会
 *    无声蒸发；
 * 2. 任务历史（上限 150，含完成记录）跨会话保留，与竞品 IndexedDB 语义一致；
 * 3. dashboard 页可直接读取同一库（本模块导出的读写函数均可扩展页复用）。
 * 原生 API 薄封装，无新依赖。
 *
 * 单键（'queue'）整体读写：状态机步进天然是 read-modify-write 全量状态，
 * 单键事务保证一致性；数据体量（150 任务 × 500 条目上界）远在 IndexedDB
 * 舒适区内。controller 侧以串行队列避免并发步进交错。
 */

import { logger } from '@/core/utils/logger'
import type { BulkState, BulkTask, BulkTaskItem } from './types'
import { BULK_LIMITS } from './types'

/** 数据库名与版本（首版即 1）。 */
const DB_NAME = 'gmap-extractor-batch'
const DB_VERSION = 1
const STORE_NAME = 'kv'
const STATE_KEY = 'queue'

/** 持久化存储的最小接口（单测以内存实现替换 IndexedDB）。 */
export interface BulkStateStore {
  load(): Promise<BulkState | null>
  save(state: BulkState): Promise<void>
}

/** 打开（并按需升级）批量任务库。 */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('[BatchStore] IndexedDB 打开失败'))
  })
}

/** IndexedDB 实现：库惰性打开，失败上抛由 controller 记录（局部可失败）。 */
export class IdbBulkStateStore implements BulkStateStore {
  private dbPromise: Promise<IDBDatabase> | null = null

  async load(): Promise<BulkState | null> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const request = transaction.objectStore(STORE_NAME).get(STATE_KEY)
      request.onsuccess = () => resolve(normalizeBulkState(request.result))
      request.onerror = () => reject(request.error ?? new Error('[BatchStore] 读取失败'))
    })
  }

  async save(state: BulkState): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(state, STATE_KEY)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('[BatchStore] 写入失败'))
    })
  }

  private open(): Promise<IDBDatabase> {
    this.dbPromise ??= openDb()
    return this.dbPromise
  }
}

/** 模块单例（SW 与扩展页共用同一实现）。 */
export const bulkStateStore: BulkStateStore = new IdbBulkStateStore()

/** 空状态（无任务）。 */
export function emptyBulkState(): BulkState {
  return { version: 1, tasks: [] }
}

/** 判断值是否为普通对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** 逐字段归一化条目；形状非法的条目丢弃（损坏不致命，可重建任务）。 */
function normalizeItem(value: unknown): BulkTaskItem | null {
  if (!isRecord(value) || typeof value.value !== 'string' || value.value.length === 0) {
    return null
  }
  const status = value.status
  return {
    value: value.value,
    status:
      status === 'pending' || status === 'running' || status === 'complete' || status === 'skipped'
        ? status
        : 'pending',
    tries: typeof value.tries === 'number' && Number.isFinite(value.tries) ? value.tries : 0,
    collected:
      typeof value.collected === 'number' && Number.isFinite(value.collected) ? value.collected : 0,
    skipReason:
      value.skipReason === 'stuck' || value.skipReason === 'invalid-url' ? value.skipReason : null
  }
}

/** 逐字段归一化任务；items 全部非法时保留空任务（状态可见，不静默删任务）。 */
function normalizeTask(value: unknown): BulkTask | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0) {
    return null
  }
  const type = value.type
  const status = value.status
  const rawItems = Array.isArray(value.items) ? value.items : []
  const items = rawItems.map(normalizeItem).filter((item): item is BulkTaskItem => item !== null)
  const limit = value.reviewsPerStoreLimit

  return {
    id: value.id,
    name: typeof value.name === 'string' ? value.name : '',
    type: type === 'review-urls' ? 'review-urls' : 'keywords',
    status: status === 'running' || status === 'paused' || status === 'completed' ? status : 'idle',
    createdAt:
      typeof value.createdAt === 'number' && Number.isFinite(value.createdAt) ? value.createdAt : 0,
    reviewsPerStoreLimit:
      typeof limit === 'number' && Number.isInteger(limit) && limit >= 1 ? limit : null,
    items,
    cursor:
      typeof value.cursor === 'number' && Number.isInteger(value.cursor) && value.cursor >= 0
        ? Math.min(value.cursor, items.length)
        : 0,
    activeTabId:
      typeof value.activeTabId === 'number' && Number.isInteger(value.activeTabId)
        ? value.activeTabId
        : null,
    activeStartedAt:
      typeof value.activeStartedAt === 'number' && Number.isFinite(value.activeStartedAt)
        ? value.activeStartedAt
        : null
  }
}

/**
 * 归一化持久化载荷：任意损坏输入（缺库 / 形状漂移 / 旧版本）都回退到可用
 * 状态，绝不因反序列化失败中断调度（失败不静默：记 error 日志由调用方打印）。
 * running 状态原样保留——恢复语义由状态机 scan-tick 处理。
 */
export function normalizeBulkState(value: unknown): BulkState {
  if (!isRecord(value) || !Array.isArray(value.tasks)) {
    if (value !== null && value !== undefined) {
      logger.error('[BatchStore] 批量状态形状非法，按空状态处理')
    }
    return emptyBulkState()
  }

  const tasks = value.tasks
    .slice(0, BULK_LIMITS.maxTasks)
    .map(normalizeTask)
    .filter((task): task is BulkTask => task !== null)
  return { version: 1, tasks }
}
