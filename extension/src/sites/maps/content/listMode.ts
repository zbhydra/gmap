/**
 * Maps 列表模式检测（013 A7，U10 采集链路）。
 *
 * 实测事实（013 references/A7、11 号调研）：Google 搜索与 Maps 的"地点列表"
 * 页面 URL 的 data 参数含触发标记 `10m1!1e1`，以此作为列表模式的宽松判定，
 * 避免依赖易漂移的 DOM 结构。两种实测形态：
 * - 聚合页：`data=!4m2!10m1!1e1`；
 * - 深层列表页：`data=!4m6!1m2!10m1!1e1!11m2!2s{token}!3e1`
 *   （竞品精确子串 `data=!4m2!10m1!1e1` 在此形态全部漏判）。
 *
 * 触发标记与深层区分子串均入远程配置 dom 组（listModeUrlMark /
 * listModeDeepUrlMark），服务端可覆盖；本文件常量仅作包内回退基线。
 */

/** 列表模式 URL 触发标记（包内默认，与 dom.listModeUrlMark 默认值一致）。 */
export const MAPS_LIST_MODE_URL_MARK = '10m1!1e1'

/** 深层列表页区分子串（包内默认，与 dom.listModeDeepUrlMark 默认值一致）。 */
export const MAPS_LIST_MODE_DEEP_URL_MARK = '!11m2!2s'

/** 当前 document 的列表模式状态（模块级运行时态，仅 boot 日志消费）。 */
let listMode = false

/**
 * 判断 URL 是否命中列表模式触发标记。
 *
 * @param url 完整页面 URL（含 hash 与查询参数）。
 * @param mark 触发子串；缺省用包内默认（运行时消费方应传远程配置生效值）。
 */
export function detectMapsListMode(url: string, mark: string = MAPS_LIST_MODE_URL_MARK): boolean {
  return mark.length > 0 && url.includes(mark)
}

/**
 * 判断 URL 是否为深层列表页形态（带列表 token 段）。
 *
 * @param url 完整页面 URL。
 * @param deepMark 深层区分子串；缺省用包内默认。
 */
export function detectDeepListMode(
  url: string,
  deepMark: string = MAPS_LIST_MODE_DEEP_URL_MARK
): boolean {
  return deepMark.length > 0 && url.includes(deepMark)
}

/**
 * 按当前页面 URL 记录列表模式状态，返回记录结果。
 *
 * boot 时刻配置可能尚未加载，此处用包内默认标记（仅日志用途）；采集循环
 * 与面板的运行时判定各自现读远程配置生效值，不依赖本记录。
 */
export function recordListModeState(): boolean {
  listMode = detectMapsListMode(location.href)
  return listMode
}

/** 读取当前记录的列表模式状态。 */
export function isMapsListMode(): boolean {
  return listMode
}

/** 仅测试用：重置列表模式状态。 */
export function resetListModeForTests(): void {
  listMode = false
}
