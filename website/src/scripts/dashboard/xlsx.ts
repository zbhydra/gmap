/**
 * 整 Job CSV → XLSX（浏览器内转换）。
 *
 * SheetJS 按需动态加载，只在用户点 Excel 下载时进入；raw 解析让单元格全部保持文本，
 * 避免电话、Place ID 等长数字被 Excel 数值化丢精度。
 */

/** 返回 xlsx 工作簿 Blob；首行英文列名、第二行列说明随 CSV 原样保留。 */
export async function csvToXlsx(csv: string): Promise<Blob> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(csv, { type: 'string', raw: true })
  const bytes: ArrayBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  return new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
