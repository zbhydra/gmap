/** 产品页文案占位符工具：构建期组件与浏览器端演示脚本共用（无浏览器依赖）。 */

/** 填充 {key} 占位符；没有对应值的占位符原样保留。 */
export function fillCopy(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

/** 按 {key} 把文案拆成前后两段，组件在占位处放可回填的元素（滚动的数字、脚本更新的计数）。 */
export function splitCopy(template: string, key: string): [string, string] {
  const token = `{${key}}`
  const index = template.indexOf(token)
  if (index < 0) throw new Error(`[product-copy] "${template}" has no ${token} placeholder.`)
  return [template.slice(0, index), template.slice(index + token.length)]
}
