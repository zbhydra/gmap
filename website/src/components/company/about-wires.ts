/**
 * About 页连线层（产品家族、数据流向共用，样式见 about-wires.css）：三次贝塞尔 + 流动光点。
 *
 * 坐标取布局位置（offset 累加到连线根节点），不受显现动画的 transform 影响；
 * 窄屏下 svg 被 CSS 隐藏时不绘制，根节点尺寸变化（含断点切换）与字体换入后整体重绘。
 */
import { part } from '../../scripts/pages/product-page'

export type WirePoint = readonly [number, number]

export interface WirePulse {
  /** 光点颜色（CSS 颜色值，取 token）。 */
  color: string
  /** 起播延迟（秒）。 */
  delay: number
  /** 单轮时长（秒）。 */
  duration: number
  /** 逆着路径方向流动。 */
  reverse?: boolean
}

export interface Wire {
  from: WirePoint
  to: WirePoint
  /** 纵向连线（控制点沿 y 轴拉开），默认横向。 */
  vertical?: boolean
  dashed?: boolean
  pulses: readonly WirePulse[]
}

export interface WireSpec {
  wires: readonly Wire[]
  /** 端点圆点。 */
  dots: readonly WirePoint[]
}

export interface WireBox {
  x: number
  y: number
  w: number
  h: number
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 元素相对连线根节点（须为定位元素）的布局框。 */
export function boxIn(element: HTMLElement, root: HTMLElement): WireBox {
  let x = 0
  let y = 0
  for (let node: Element | null = element; node instanceof HTMLElement && node !== root; node = node.offsetParent) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x, y, w: element.offsetWidth, h: element.offsetHeight }
}

const coordinate = ([x, y]: WirePoint) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`

function curve(from: WirePoint, to: WirePoint, vertical: boolean): string {
  const k = vertical ? (to[1] - from[1]) * 0.55 : (to[0] - from[0]) * 0.5
  const c1: WirePoint = vertical ? [from[0], from[1] + k] : [from[0] + k, from[1]]
  const c2: WirePoint = vertical ? [to[0], to[1] - k] : [to[0] - k, to[1]]
  return `M${coordinate(from)} C${coordinate(c1)} ${coordinate(c2)} ${coordinate(to)}`
}

function svgNode(name: string, attributes: Record<string, string>): SVGElement {
  const element = document.createElementNS(SVG_NS, name)
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
  return element
}

/** 在 root 内的 [data-wires] svg 上按 build() 的结果绘制连线。 */
export function setupWires(root: HTMLElement, build: () => WireSpec): void {
  const svg = part(root, '[data-wires]', SVGSVGElement)
  const render = () => {
    svg.replaceChildren()
    if (getComputedStyle(svg).display === 'none') return
    const spec = build()
    for (const wire of spec.wires) {
      const d = curve(wire.from, wire.to, wire.vertical ?? false)
      svg.append(svgNode('path', { class: wire.dashed ? 'wire wire--dashed' : 'wire', d }))
      for (const pulse of wire.pulses) {
        const path = svgNode('path', { class: pulse.reverse ? 'wire-pulse wire-pulse--rev' : 'wire-pulse', d, pathLength: '100' })
        path.style.setProperty('--pc', pulse.color)
        path.style.setProperty('--d', `${pulse.delay}s`)
        path.style.setProperty('--t', `${pulse.duration}s`)
        svg.append(path)
      }
    }
    for (const [cx, cy] of spec.dots) svg.append(svgNode('circle', { class: 'wire-dot', cx: String(cx), cy: String(cy), r: '3.5' }))
  }
  new ResizeObserver(render).observe(root)
  void document.fonts.ready.then(render)
}
