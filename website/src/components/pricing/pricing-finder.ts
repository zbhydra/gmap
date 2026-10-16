/**
 * Pricing 用量估算条的对数刻度（纯函数，构建期渲染初值与浏览器端拖动共用）。
 *
 * 刻度下限为最低档额度的一半、上限为最高档额度；滑杆位置 0–1，取值按两位有效数字取整后
 * 匹配第一个额度不低于它的档位。
 */

/** 卡面额度里的数字（如 1,000 records / month → 1000）；各语言的千分位写法都只保留数字。 */
export function quotaValue(quota: string): number {
  const digits = quota.replace(/\D/g, '')
  if (!digits) throw new Error(`[pricing] Cannot read a number from quota "${quota}".`)
  return Number(digits)
}

/** 估算条刻度。 */
export interface FinderScale {
  lo: number
  hi: number
}

/** 由各档额度（升序）建立刻度。 */
export function finderScale(quotas: readonly number[]): FinderScale {
  return { lo: Math.log10(quotas[0] / 2), hi: Math.log10(quotas[quotas.length - 1]) }
}

/** 额度在刻度上的位置（0–1）。 */
export function finderPosition(scale: FinderScale, value: number): number {
  return (Math.log10(value) - scale.lo) / (scale.hi - scale.lo)
}

/** 滑杆位置对应的月用量，两位有效数字取整：63,412 → 63,000；731 → 730。 */
export function finderVolume(scale: FinderScale, position: number): number {
  const value = 10 ** (scale.lo + position * (scale.hi - scale.lo))
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(value)) - 1)
  return Math.max(1, Math.round(value / magnitude) * magnitude)
}

/** 满足月用量的最小档位下标；超过最高档时取最高档。 */
export function finderMatch(quotas: readonly number[], volume: number): number {
  const index = quotas.findIndex(quota => quota >= volume)
  return index < 0 ? quotas.length - 1 : index
}
