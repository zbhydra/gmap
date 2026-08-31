/**
 * 远端运营通道的版本比较（A12，U6）。
 *
 * 竞品语义：运营配置携带远端版本号，与本地版本字符串比较决定是否附加
 * 「有新版本」提示。我方以 operations.minPluginVersion 承载远端版本：
 * 远端值 > 本地 manifest 版本 → 面板提示升级。纯字符串数值段比较，
 * 不引入 semver 语义（预发布段按 0 处理，插件版本号恒为三段数字）。
 */

/**
 * 比较两个点分版本号。
 *
 * @returns a < b 返回负数，相等返回 0，a > b 返回正数。
 */
export function compareVersions(a: string, b: string): number {
  const segmentsA = parseVersionSegments(a)
  const segmentsB = parseVersionSegments(b)
  const length = Math.max(segmentsA.length, segmentsB.length)

  for (let index = 0; index < length; index += 1) {
    // 段数不齐补 0（'1.0' 与 '1.0.0' 等价）
    const segmentA = segmentsA[index] ?? 0
    const segmentB = segmentsB[index] ?? 0
    if (segmentA !== segmentB) {
      return segmentA - segmentB
    }
  }
  return 0
}

/**
 * 是否应提示有新版本：远端最低版本严格大于本地版本时为 true；
 * 任一版本为空串视为运营未配置，不提示。
 */
export function isNewVersionAvailable(minPluginVersion: string, localVersion: string): boolean {
  if (minPluginVersion.length === 0 || localVersion.length === 0) {
    return false
  }
  return compareVersions(minPluginVersion, localVersion) > 0
}

/** 版本号拆为数值段：非数字段按 0 处理（脏数据不抛错，运营通道容错）。 */
function parseVersionSegments(version: string): number[] {
  return version
    .trim()
    .split('.')
    .map(segment => {
      const parsed = Number.parseInt(segment, 10)
      return Number.isNaN(parsed) ? 0 : parsed
    })
}
