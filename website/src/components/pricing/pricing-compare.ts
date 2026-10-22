import type { PricingCompareCell } from '../../i18n/schema'

/** 对比表单元格的呈现形态，桌面表格与移动端对比卡共用。 */
export type CompareCellView = { kind: 'yes' } | { kind: 'no' } | { kind: 'text'; text: string } | { kind: 'mono'; text: string }

export const compareCell = (cell: PricingCompareCell): CompareCellView =>
  cell === true ? { kind: 'yes' } : cell === false ? { kind: 'no' } : { kind: 'text', text: cell }

/** 单元格取值的比较键，用于判断一行在各档是否相同。 */
export const compareCellKey = (cell: CompareCellView) => ('text' in cell ? `${cell.kind}:${cell.text}` : cell.kind)
