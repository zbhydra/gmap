/**
 * 批量模式工作页的 URL 参数契约（013 A6，content 侧）。
 *
 * 调度器（background）打开工作页时在 URL 上携带批量标记：工作页 content
 * script 据此自动开始采集、完成后强制导出并向 background 回报条目完成。
 * 与既有 `gme_lrd` 的「我方打开」判定同构（extractionUrl.ts）——用户手动
 * 打开的无参数页面不触发任何自动行为。
 *
 * 参数名常量以本模块为唯一事实来源；background 构造工作页 URL 时从这里导入。
 */

/** 批量模式激活标记（值必须为 `1`）。 */
export const BULK_PARAM = 'gme_bulk'

/** 批量任务 id 传递参数名（回报完成时回传给 background 匹配）。 */
export const BULK_TASK_PARAM = 'gme_bulk_task'

/** 批量条目下标传递参数名（与 task id 一起构成防陈旧回报的匹配键）。 */
export const BULK_ITEM_PARAM = 'gme_bulk_item'

/** 批量评论任务每店上限传递参数名（仅评论工作页）。 */
export const BULK_MAX_PARAM = 'gme_bulk_max'

/** 工作页批量参数（从 URL 解析）。 */
export interface BulkWorkParams {
  /** 批量任务 id。 */
  taskId: string
  /** 条目下标（任务队列内）。 */
  itemIndex: number
}

/**
 * 从工作页 URL 解析批量参数；非批量页或参数残缺返回 null（按普通页面处理）。
 */
export function readBulkWorkParams(url: URL): BulkWorkParams | null {
  if (url.searchParams.get(BULK_PARAM) !== '1') {
    return null
  }
  const taskId = url.searchParams.get(BULK_TASK_PARAM) ?? ''
  const rawIndex = url.searchParams.get(BULK_ITEM_PARAM) ?? ''
  const itemIndex = Number.parseInt(rawIndex, 10)
  if (taskId.length === 0 || !Number.isInteger(itemIndex) || itemIndex < 0) {
    return null
  }
  return { taskId, itemIndex }
}

/**
 * 从批量评论工作页 URL 解析每店上限；非批量页或非法值返回 null
 * （调用方回退远程配置默认上限）。
 */
export function readBulkReviewsMax(url: URL): number | null {
  if (url.searchParams.get(BULK_PARAM) !== '1') {
    return null
  }
  const raw = url.searchParams.get(BULK_MAX_PARAM) ?? ''
  const max = Number.parseInt(raw, 10)
  if (!Number.isInteger(max) || max < 1) {
    return null
  }
  return max
}
