/**
 * 批量任务队列与步进状态机的类型契约（013 A6，U5 契约锁内新建模块）。
 *
 * 架构基线（scratch 11 号 #5，已拍板）：**状态落盘的步进状态机**——采集主循环
 * 留在 content script（页面进程天然长命），SW 只做无状态 tab/window 代理：
 * 每完成一步把任务状态持久化，SW 被任意事件（工作页回报 / alarm / 标签关闭）
 * 唤醒后读状态推进一步。不用心跳续命、不用 offscreen worker。
 *
 * 本模块是纯类型与常量（无 chrome API 依赖），被 background 调度器、dashboard
 * 页与单元测试共同消费。
 */

/** 任务持久化与步进的硬上限（09 参数总表 §3：任务 150 个、条目 500 个）。 */
export const BULK_LIMITS = {
  /** 任务保存上限（竞品 MAX_TASKS_SAVED）。 */
  maxTasks: 150,
  /** 单任务条目上限（关键词或评论 URL，竞品 500）。 */
  maxItemsPerTask: 500,
  /** 单条目 90 秒无进展判卡死（竞品 SKIP_STUCK_TIME = 60s × 1.5）。 */
  stuckMs: 90_000,
  /** 批量每店评论上限默认值（竞品 reviews_max_export 默认 300）。 */
  defaultReviewsPerStoreLimit: 300
} as const

/** 批量任务类型：关键词队列 / 评论 URL 队列。 */
export type BulkTaskType = 'keywords' | 'review-urls'

/** 单条目状态。 */
export type BulkItemStatus = 'pending' | 'running' | 'complete' | 'skipped'

/** 任务状态：idle 未开始 → running 运行中 ⇄ paused 手动停止 → completed 全部处理完。 */
export type BulkTaskStatus = 'idle' | 'running' | 'paused' | 'completed'

/** 跳过原因：卡死（重试耗尽）/ 评论 URL 换算失败。 */
export type BulkSkipReason = 'stuck' | 'invalid-url'

/** 批量任务队列中的单条目（一个关键词或一个评论 URL）。 */
export interface BulkTaskItem {
  /** 条目载荷：关键词文本或 Maps place URL（原始输入，trim 后）。 */
  value: string
  /** 条目状态。 */
  status: BulkItemStatus
  /** 已尝试次数：每次启动 +1（含首次）；卡死后重试与否消费 stuckMaxRetry。 */
  tries: number
  /** 本条目采集条数（搜索结果行数 / 评论条数），完成回报时回填。 */
  collected: number
  /** 跳过原因（仅 skipped 时非 null）。 */
  skipReason: BulkSkipReason | null
}

/** 批量任务。 */
export interface BulkTask {
  /** 任务 id（crypto.randomUUID）。 */
  id: string
  /** 任务名（dashboard 输入；空则用默认名）。 */
  name: string
  /** 任务类型。 */
  type: BulkTaskType
  /** 任务状态。 */
  status: BulkTaskStatus
  /** 创建时间（毫秒时间戳）。 */
  createdAt: number
  /** 批量每店评论上限（仅 review-urls 类型；dashboard 可配，默认 300）。 */
  reviewsPerStoreLimit: number | null
  /** 条目队列（有序，按输入顺序处理）。 */
  items: BulkTaskItem[]
  /** 处理游标：运行中 = 当前条目下标；暂停/待开始 = 下一个待处理条目下标。 */
  cursor: number
  /** 当前工作标签页 id（null = 未启动或已丢失，由 alarm 兜底重启）。 */
  activeTabId: number | null
  /** 当前条目启动时间（卡死判定基准；null = 尚未启动）。 */
  activeStartedAt: number | null
}

/** 批量任务状态根（IndexedDB 单键持久化）。 */
export interface BulkState {
  /** 结构版本（归一化迁移用）。 */
  version: 1
  /** 任务列表（创建序）。 */
  tasks: BulkTask[]
}

/** 命令/事件被状态机拒绝的错误码（dashboard 据此映射 i18n 文案）。 */
export type BulkErrorCode =
  | 'limit-tasks'
  | 'limit-items'
  | 'empty-input'
  | 'mutex'
  | 'not-found'
  | 'invalid-param'
  /** 月度配额剩余不足（U7 前置校验；预估消耗 = 条目数 × 单批上限）。 */
  | 'quota-exceeded'

/**
 * 状态机输入事件（controller 从 RPC 命令 / 工作页回报 / alarm / 标签事件
 * 翻译而来）。纯 reducer 只认这组事件。
 */
export type BulkMachineEvent =
  | {
      kind: 'create-task'
      name: string
      type: BulkTaskType
      values: string[]
      reviewsPerStoreLimit: number | null
    }
  | { kind: 'start-task'; taskId: string }
  | { kind: 'stop-task'; taskId: string }
  | { kind: 'delete-task'; taskId: string }
  /** 工作标签页已创建（回填 activeTabId；丢失时由 alarm 兜底重启）。 */
  | { kind: 'item-launched'; taskId: string; itemIndex: number; tabId: number }
  | { kind: 'item-done'; taskId: string; itemIndex: number; collected: number }
  /**
   * 条目进展回报（工作页每页/每批采到新数据）：仅重置卡死时钟——90s 判定
   * 语义是「自上次进展以来」，慢而有进展的采集不被误杀。
   */
  | { kind: 'item-progress'; taskId: string; itemIndex: number }
  /** 工作标签页被关闭（用户手关/崩溃）：立即走重试或跳过，不等 90s。 */
  | { kind: 'tab-gone'; tabId: number; stuckMaxRetry: number }
  /** alarm 兜底扫描（30s 级）：卡死判定 + 启动丢失恢复。 */
  | { kind: 'scan-tick'; stuckMaxRetry: number }

/** 待打开的工作标签页描述（controller 据此 tabs.create 并回填 item-launched）。 */
export interface BulkLaunchPlan {
  taskId: string
  itemIndex: number
  url: string
}

/** 状态机产出的副作用（controller 执行；reducer 保持纯函数）。 */
export interface BulkEffects {
  /** 打开工作标签页的计划。 */
  launches: BulkLaunchPlan[]
  /** 需要关闭的标签页 id。 */
  closeTabIds: number[]
  /** 兜底扫描 alarm 开关：on 创建、off 清除、keep 不动。 */
  scanAlarm: 'on' | 'off' | 'keep'
}

/** 状态机步进结果。state 与输入同引用 = 无变化（controller 跳过落盘）。 */
export interface BulkReduceResult {
  state: BulkState
  effects: BulkEffects
  /** 非 null = 事件被拒绝，state 保持不变。 */
  error: BulkErrorCode | null
}

/** dashboard → background 的任务命令（RPC params）。 */
export interface BulkCreateTaskParams {
  name: string
  type: BulkTaskType
  values: string[]
  reviewsPerStoreLimit: number | null
}

/** background → dashboard 的命令结果：业务错误用 code 承载（不抛 RPC 错误）。 */
export interface BulkCommandResult {
  ok: boolean
  /** 拒绝原因；ok = true 时为 null。 */
  code: BulkErrorCode | null
  /** 命令后的最新状态（含未变化时的现值），dashboard 直接渲染。 */
  state: BulkState
}
