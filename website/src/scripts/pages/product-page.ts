/**
 * 产品页演示脚本的共用件（工具页、公司页也在用）：data-* 文案读取、元素查询与模板克隆；
 * 叙事循环的可见性门控与数字滚动在站级动效运行时 scripts/site/motion.ts。
 *
 * 演示节点一律克隆组件里的 <template>，不用 createElement 拼 HTML：克隆出的节点带组件的 scoped 样式标记，
 * 界面文案也留在组件里走 i18n；脚本只回填运行时数字与样例数据。
 */

/** 读取元素上的 data-* 文案。 */
export function copyOf(element: HTMLElement, key: string): string {
  const value = element.dataset[key]
  if (value === undefined) throw new Error(`[product-page] <${element.tagName.toLowerCase()}> has no data copy "${key}".`)
  return value
}

/** 查询区块内脚本依赖的元素。 */
export function part<T extends Element>(root: ParentNode, selector: string, type: { new (): T; prototype: T }): T {
  const element = root.querySelector(selector)
  if (!(element instanceof type)) throw new Error(`[product-page] Expected ${type.name} at "${selector}".`)
  return element
}

/** 克隆 selector 指向的 <template> 的首个元素。 */
export function stamp<T extends Element>(root: ParentNode, selector: string, type: { new (): T; prototype: T }): T {
  const element = part(root, selector, HTMLTemplateElement).content.firstElementChild?.cloneNode(true)
  if (!(element instanceof type)) throw new Error(`[product-page] Template "${selector}" does not start with a ${type.name}.`)
  return element
}
