/**
 * 坐标转换纯函数（W4 工具矩阵：十进制度 ↔ 度分秒）。
 *
 * 转换为确定性算术：负号只由半球字母表达（DMS），反向转换时半球字母决定符号；
 * 秒保留两位小数（≈0.3m 地面分辨率），十进制度输出 6 位（≈0.1m）。
 */

/** 一次 DD → DMS 转换结果。 */
export interface DmsCoordinate {
  /** 度（非负整数，方向由 hemisphere 表达）。 */
  degrees: number
  /** 分（0 ≤ min < 60）。 */
  minutes: number
  /** 秒（0 ≤ sec < 60，两位小数）。 */
  seconds: number
  /** 半球字母：纬度 N/S，经度 E/W。 */
  hemisphere: 'N' | 'S' | 'E' | 'W'
}

/**
 * 十进制度 → 度分秒。
 *
 * @param value 十进制度。
 * @param axis 'lat' | 'lng'，决定半球字母集合。
 */
export function ddToDms(value: number, axis: 'lat' | 'lng'): DmsCoordinate {
  const hemisphere = pickHemisphere(value, axis)
  const absolute = Math.abs(value)
  const degrees = Math.floor(absolute)
  const minutesFloat = (absolute - degrees) * 60
  const minutes = Math.floor(minutesFloat)
  // 四舍五入到两位小数；60.00 的边界回退到进位后的分（浮点安全：先算秒再校正）。
  const seconds = Math.round((minutesFloat - minutes) * 60 * 100) / 100
  const carry = seconds >= 60
  return {
    degrees,
    minutes: carry ? minutes + 1 : minutes,
    seconds: carry ? 0 : seconds,
    hemisphere
  }
}

/** 按符号选半球字母：纬度 N/S，经度 E/W。 */
function pickHemisphere(value: number, axis: 'lat' | 'lng'): DmsCoordinate['hemisphere'] {
  if (axis === 'lat') {
    return value < 0 ? 'S' : 'N'
  }
  return value < 0 ? 'W' : 'E'
}

/** DMS 坐标文本格式（`37° 46' 29.74" N`）。 */
export function formatDms(coordinate: DmsCoordinate): string {
  const seconds = coordinate.seconds.toFixed(2)
  return `${coordinate.degrees}° ${coordinate.minutes}' ${seconds}" ${coordinate.hemisphere}`
}

/** DMS 转换输入（度/分/秒 + 半球字母）。 */
export interface DmsInput {
  degrees: number
  minutes: number
  seconds: number
  hemisphere: 'N' | 'S' | 'E' | 'W'
}

/** DMS → 十进制度输入校验结果（error 为空即合法）。 */
export type DmsValidation = { ok: true } | { ok: false; error: 'values' }

/**
 * 校验 DMS 输入：度为非负整数、分秒 ∈ [0, 60)。
 *
 * 半球与正负号冲突检查在页面层做（负值输入按 values 非法上报）。
 */
export function validateDmsInput(
  degrees: number,
  minutes: number,
  seconds: number
): DmsValidation {
  if (
    !Number.isFinite(degrees) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds)
  ) {
    return { ok: false, error: 'values' }
  }
  if (degrees < 0 || minutes < 0 || seconds < 0) {
    return { ok: false, error: 'values' }
  }
  if (!Number.isInteger(degrees) || minutes >= 60 || seconds >= 60) {
    return { ok: false, error: 'values' }
  }
  return { ok: true }
}

/**
 * DMS → 十进制度（度 + 分/60 + 秒/3600，半球字母定符号）。
 *
 * @param input 已通过 validateDmsInput 的输入。
 */
export function dmsToDd(input: DmsInput): number {
  const absolute = input.degrees + input.minutes / 60 + input.seconds / 3600
  const isNegative = input.hemisphere === 'S' || input.hemisphere === 'W'
  const signed = isNegative ? -absolute : absolute
  // 固定 6 位小数（≈11cm），避免二进制浮点的长尾输出。
  return Math.round(signed * 1_000_000) / 1_000_000
}
