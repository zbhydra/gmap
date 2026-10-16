/**
 * About 首屏地球（设计稿 about.html ①）：canvas 正交投影的经纬网 + 城市周边的商家点簇；
 * pin 落在城市上被「抓取」，数据光束汇入顶部 MapsGrab 节点。
 *
 * 可拖拽旋转（带惯性），离屏 / 标签页隐藏时停帧（T4 循环由脚本启停）；减弱动效下只画一帧静态终态。
 * 颜色读 token 的实际色值，主题切换时刷新。
 */
import { part } from '../../scripts/pages/product-page'
import { inView, reducedMotion } from '../../scripts/site/motion'

interface GlobePoint {
  lon: number
  /** cos(纬度) */
  cl: number
  /** sin(纬度) */
  sl: number
}

interface City extends GlobePoint {
  busy: boolean
}

interface Projected {
  x: number
  y: number
  z: number
}

interface Grab {
  city: City
  t0: number
  /** 减弱动效下的静态光束。 */
  still: boolean
  arrived: boolean
}

type Curve = readonly [number, number, number, number, number, number, number, number]

const RAD = Math.PI / 180
/** 弧度 / 毫秒：约 57 秒一圈。 */
const BASE_SPEED = 0.00011
const GRAB_EVERY = 480
/** 减弱动效下画成静态光束的城市（CITIES 下标：纽约、圣保罗、伦敦、拉各斯）。 */
const STILL_CITIES = [0, 9, 12, 20]

/** 真实城市坐标（纬度, 经度），只决定点簇与 pin 的位置。 */
const CITIES: ReadonlyArray<readonly [number, number]> = [
  [40.71, -74.01], [34.05, -118.24], [41.88, -87.63], [43.65, -79.38], [49.28, -123.12], [29.76, -95.37],
  [19.43, -99.13], [4.71, -74.07], [-12.05, -77.04], [-23.55, -46.63], [-34.6, -58.38], [-33.45, -70.67],
  [51.51, -0.13], [48.86, 2.35], [52.52, 13.4], [40.42, -3.7], [41.9, 12.5], [59.33, 18.07],
  [41.01, 28.98], [30.04, 31.24], [6.52, 3.38], [-1.29, 36.82], [-26.2, 28.05], [33.57, -7.59],
  [25.2, 55.27], [24.71, 46.68], [19.08, 72.88], [28.61, 77.21], [12.97, 77.59], [13.76, 100.5],
  [1.35, 103.82], [-6.21, 106.85], [14.6, 120.98], [22.32, 114.17], [31.23, 121.47], [37.57, 126.98],
  [35.68, 139.69], [-33.87, 151.21], [-37.81, 144.96], [-36.85, 174.76], [21.31, -157.86], [64.15, -21.94]
]

const point = (lat: number, lon: number): GlobePoint => ({ lon, cl: Math.cos(lat), sl: Math.sin(lat) })
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const bez = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

export function setupGlobe(globe: HTMLElement): void {
  const canvas = part(globe, '[data-globe-canvas]', HTMLCanvasElement)
  const node = part(globe, '[data-globe-node]', HTMLElement)
  const mark = part(node, '[data-globe-mark]', HTMLElement)
  const hint = globe.parentElement?.querySelector<HTMLElement>('[data-globe-hint]')
  const context = canvas.getContext('2d')
  if (!context) return
  const ctx = context
  const reduced = reducedMotion()

  // 固定种子的伪随机：每次加载点簇形状一致
  let seed = 20260831
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  const cities: City[] = CITIES.map(([lat, lon]) => ({ ...point(lat * RAD, lon * RAD), busy: false }))

  // 商家点簇：每座城市周围一小撮点，大致勾勒出有人活动的陆地
  const spots: GlobePoint[] = []
  for (const city of cities) {
    const lat = Math.asin(city.sl)
    const count = 10 + Math.round(rand() * 12)
    for (let index = 0; index < count; index++) {
      const radius = Math.sqrt(rand()) * 2.6 * RAD
      const angle = rand() * Math.PI * 2
      spots.push(point(lat + Math.sin(angle) * radius, city.lon + (Math.cos(angle) * radius) / Math.max(0.35, city.cl)))
    }
  }

  // 背景点阵：斐波那契球面均匀分布
  const field: GlobePoint[] = []
  for (let index = 0; index < 1000; index++) {
    field.push(point(Math.asin(1 - ((index + 0.5) / 1000) * 2), (index * Math.PI * (3 - Math.sqrt(5))) % (Math.PI * 2)))
  }

  // 经纬网：纬线 ±75°、经线每 15°；赤道与本初子午线单独加亮
  const lines: GlobePoint[][] = []
  const strong: GlobePoint[][] = []
  for (let lat = -75; lat <= 75; lat += 15) {
    const line: GlobePoint[] = []
    for (let lon = -180; lon <= 180; lon += 4) line.push(point(lat * RAD, lon * RAD))
    if (lat === 0) strong.push(line)
    else lines.push(line)
  }
  for (let lon = -180; lon < 180; lon += 15) {
    const line: GlobePoint[] = []
    for (let lat = -90; lat <= 90; lat += 4) line.push(point(lat * RAD, lon * RAD))
    if (lon === 0) strong.push(line)
    else lines.push(line)
  }

  /* ---------------- 投影 */
  let size = 0
  let cx = 0
  let cy = 0
  let radius = 0
  let target: [number, number] = [0, 0]
  let rot = 0.62 // 初始让大西洋两岸朝前
  let tilt = 0.32
  let cosT = 0
  let sinT = 0
  const scratch: Projected = { x: 0, y: 0, z: 0 }

  const project = (p: GlobePoint, out: Projected): Projected => {
    const a = p.lon + rot
    const z = p.cl * Math.cos(a)
    out.x = cx + radius * p.cl * Math.sin(a)
    out.y = cy - radius * (p.sl * cosT - z * sinT)
    out.z = p.sl * sinT + z * cosT
    return out
  }

  /* ---------------- 颜色：把 token（含 light-dark()）解析成 rgb 分量 */
  const colors = { ink: '', brand: '', beam: '', pin: '', dot: '' }
  const probe = document.createElement('span')
  probe.hidden = true
  globe.append(probe)
  const swatch = document.createElement('canvas')
  swatch.width = 1
  swatch.height = 1
  const swatchCtx = swatch.getContext('2d', { willReadFrequently: true })
  const rgb = (value: string) => {
    if (!swatchCtx) return '0,0,0'
    probe.style.color = value
    swatchCtx.clearRect(0, 0, 1, 1)
    swatchCtx.fillStyle = getComputedStyle(probe).color
    swatchCtx.fillRect(0, 0, 1, 1)
    const [r, g, b] = swatchCtx.getImageData(0, 0, 1, 1).data
    return `${r},${g},${b}`
  }
  const readColors = () => {
    colors.ink = rgb('var(--text)')
    colors.brand = rgb('var(--primary)')
    colors.beam = rgb('var(--cyan)')
    colors.pin = rgb('var(--pin)')
    colors.dot = rgb('var(--pin-dot)')
  }
  const rgba = (color: string, alpha: number) => `rgba(${color},${alpha})`

  /* ---------------- 绘制 */
  const strokeLines = (list: GlobePoint[][], front: boolean) => {
    ctx.beginPath()
    for (const points of list) {
      let pen = false
      for (const p of points) {
        project(p, scratch)
        const visible = front ? scratch.z >= 0 : scratch.z < 0
        if (visible) {
          if (pen) ctx.lineTo(scratch.x, scratch.y)
          else ctx.moveTo(scratch.x, scratch.y)
        }
        pen = visible
      }
    }
    ctx.stroke()
  }

  const drawSphere = () => {
    // 大气辉光（只画球外的环）
    const glow = ctx.createRadialGradient(cx, cy, radius, cx, cy, radius * 1.22)
    glow.addColorStop(0, rgba(colors.brand, 0.16))
    glow.addColorStop(1, rgba(colors.brand, 0))
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2)
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true)
    ctx.fill()

    ctx.lineWidth = 1
    ctx.strokeStyle = rgba(colors.ink, 0.05)
    strokeLines(lines, false)

    const fill = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.45, radius * 0.1, cx, cy, radius)
    fill.addColorStop(0, rgba(colors.brand, 0.11))
    fill.addColorStop(1, rgba(colors.brand, 0.03))
    ctx.fillStyle = fill
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = rgba(colors.ink, 0.13)
    ctx.stroke()

    ctx.strokeStyle = rgba(colors.ink, 0.1)
    strokeLines(lines, true)
    ctx.strokeStyle = rgba(colors.brand, 0.32)
    strokeLines(strong, true)

    // 球缘高光：左上亮、右下隐去
    const rim = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius * 0.6, cy + radius * 0.6)
    rim.addColorStop(0, rgba(colors.beam, 0.55))
    rim.addColorStop(1, rgba(colors.beam, 0))
    ctx.strokeStyle = rim
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, radius - 0.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 1

    ctx.fillStyle = rgba(colors.ink, 1)
    for (const p of field) {
      project(p, scratch)
      if (scratch.z <= 0.02) continue
      ctx.globalAlpha = 0.05 + 0.26 * scratch.z
      ctx.fillRect(scratch.x - 0.7, scratch.y - 0.7, 1.4, 1.4)
    }
    ctx.globalAlpha = 1

    // 城市热区：点簇下垫一层柔光
    for (const city of cities) {
      project(city, scratch)
      if (scratch.z <= 0.05) continue
      const r = 14 + 6 * scratch.z
      const heat = ctx.createRadialGradient(scratch.x, scratch.y, 0, scratch.x, scratch.y, r)
      heat.addColorStop(0, rgba(colors.brand, 0.2 * scratch.z))
      heat.addColorStop(1, rgba(colors.brand, 0))
      ctx.fillStyle = heat
      ctx.fillRect(scratch.x - r, scratch.y - r, r * 2, r * 2)
    }

    ctx.fillStyle = rgba(colors.brand, 1)
    for (const p of spots) {
      project(p, scratch)
      if (scratch.z <= 0.02) continue
      ctx.globalAlpha = 0.3 + 0.65 * scratch.z
      ctx.beginPath()
      ctx.arc(scratch.x, scratch.y, 0.9 + 0.8 * scratch.z, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // pin：水滴形，尖端落在城市投影点上
  const drawPin = (x: number, y: number, scale: number, alpha: number) => {
    const r = 5.5 * scale
    const headY = y - 13 * scale
    const b = Math.acos(r / (y - headY))
    ctx.globalAlpha = alpha
    ctx.fillStyle = rgba(colors.pin, 1)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, headY, r, Math.PI / 2 + b, Math.PI / 2 - b)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = rgba(colors.dot, 1)
    ctx.beginPath()
    ctx.arc(x, headY, r * 0.42, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // 光束：从 pin 头部竖直升起，自下而上汇入节点
  const beamCurve = (x0: number, y0: number): Curve => {
    const h = (y0 - target[1]) * 0.5
    return [x0, y0, x0, y0 - h, target[0], target[1] + h, target[0], target[1]]
  }
  const tracePath = (c: Curve, t0: number, t1: number) => {
    ctx.beginPath()
    for (let k = 0; k <= 16; k++) {
      const t = t0 + ((t1 - t0) * k) / 16
      const x = bez(c[0], c[2], c[4], c[6], t)
      const y = bez(c[1], c[3], c[5], c[7], t)
      if (k) ctx.lineTo(x, y)
      else ctx.moveTo(x, y)
    }
  }

  const pulseNode = () => {
    node.classList.remove('is-receiving')
    void node.offsetWidth
    node.classList.add('is-receiving')
  }

  // 一次「抓取」：0–320ms pin 落下（落点泛起涟漪）→ 260ms 起光束 1s 飞向节点（尾迹滞后 380ms）→ 1.5s 后 pin 淡出
  let grabs: Grab[] = []
  let clock = 0
  let nextGrab = 0
  const spawn = () => {
    const free = cities.filter(city => !city.busy && project(city, scratch).z > 0.3)
    if (!free.length) return
    const city = free[Math.floor(Math.random() * free.length)]
    city.busy = true
    grabs.push({ city, t0: clock, still: false, arrived: false })
  }

  const drawGrab = (grab: Grab): boolean => {
    const age = grab.still ? 1e9 : clock - grab.t0
    const alive = grab.still || age < 2100
    const base = project(grab.city, { x: 0, y: 0, z: 0 })
    const face = clamp01((base.z - 0.05) / 0.25) // 转向背面时淡出
    const scale = 0.78 + 0.22 * base.z
    const fade = grab.still ? 1 : 1 - clamp01((age - 1500) / 600)
    const alpha = face * fade * clamp01(age / 160)
    if (alpha <= 0) return alive
    const drop = 1 - Math.pow(1 - clamp01(age / 320), 3)
    const headY = base.y - 13 * scale
    const curve = beamCurve(base.x, headY)

    if (grab.still) {
      const still = ctx.createLinearGradient(base.x, headY, target[0], target[1])
      still.addColorStop(0, rgba(colors.beam, 0))
      still.addColorStop(1, rgba(colors.beam, 0.55 * face))
      ctx.strokeStyle = still
      ctx.lineWidth = 1.6
      tracePath(curve, 0, 1)
      ctx.stroke()
    } else {
      if (age > 220 && age < 1000) {
        const k = (age - 220) / 780
        ctx.strokeStyle = rgba(colors.pin, 0.55 * (1 - k) * face)
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.ellipse(base.x, base.y, 3 + 15 * k * scale, (3 + 15 * k * scale) * 0.42, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      const head = easeInOut(clamp01((age - 260) / 1000))
      const tail = easeInOut(clamp01((age - 640) / 1000))
      if (head > 0 && tail < 1) {
        ctx.strokeStyle = rgba(colors.beam, 0.16 * face)
        ctx.lineWidth = 1
        tracePath(curve, 0, 1)
        ctx.stroke()
        const hx = bez(curve[0], curve[2], curve[4], curve[6], head)
        const hy = bez(curve[1], curve[3], curve[5], curve[7], head)
        const tx = bez(curve[0], curve[2], curve[4], curve[6], tail)
        const ty = bez(curve[1], curve[3], curve[5], curve[7], tail)
        // 外层柔光 + 内层亮芯
        const wide = ctx.createLinearGradient(tx, ty, hx, hy)
        wide.addColorStop(0, rgba(colors.beam, 0))
        wide.addColorStop(1, rgba(colors.beam, 0.22 * face))
        const core = ctx.createLinearGradient(tx, ty, hx, hy)
        core.addColorStop(0, rgba(colors.beam, 0))
        core.addColorStop(1, rgba(colors.beam, 0.95 * face))
        ctx.lineCap = 'round'
        tracePath(curve, tail, head)
        ctx.strokeStyle = wide
        ctx.lineWidth = 6
        ctx.stroke()
        ctx.strokeStyle = core
        ctx.lineWidth = 2
        ctx.stroke()
        if (head < 1) {
          const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 7)
          halo.addColorStop(0, rgba(colors.beam, 0.55 * face))
          halo.addColorStop(1, rgba(colors.beam, 0))
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(hx, hy, 7, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (!grab.arrived && head >= 1) {
        grab.arrived = true
        pulseNode()
      }
    }
    drawPin(base.x, base.y - (1 - drop) * 16 * scale, scale, alpha)
    return alive
  }

  const render = () => {
    if (!size) return
    ctx.clearRect(0, 0, size, size)
    cosT = Math.cos(tilt)
    sinT = Math.sin(tilt)
    drawSphere()
    grabs = grabs.filter(grab => {
      const alive = drawGrab(grab)
      if (!alive) grab.city.busy = false
      return alive
    })
  }

  /* ---------------- 循环：离屏 / 标签页隐藏时停帧（inView 已把页面后台算作不可见） */
  let velocity = BASE_SPEED
  let dragging = false
  let running = false
  let frameId = 0
  let last = 0

  const frame = (now: number) => {
    const dt = last ? Math.min(48, now - last) : 16
    last = now
    clock += dt
    if (!dragging) {
      velocity += (BASE_SPEED - velocity) * (1 - Math.pow(0.965, dt / 16.7))
      rot += velocity * dt
    }
    if (clock >= nextGrab) {
      spawn()
      nextGrab = clock + GRAB_EVERY * (0.7 + Math.random() * 0.6)
    }
    render()
    frameId = requestAnimationFrame(frame)
  }

  const setRunning = (go: boolean) => {
    if (go && !running) {
      running = true
      last = 0
      frameId = requestAnimationFrame(frame)
    } else if (!go && running) {
      running = false
      cancelAnimationFrame(frameId)
    }
  }

  /* ---------------- 尺寸 / 主题 */
  const resize = () => {
    size = globe.clientWidth
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    radius = size * 0.37
    cx = size / 2
    cy = size * 0.585
    // 光束落在品牌标中心（布局坐标，不受节点脉冲的 transform 影响）
    target = [cx, node.offsetTop + mark.offsetTop + mark.offsetHeight / 2]
    if (!running) render()
  }

  const retheme = () => {
    readColors()
    if (!running) render()
  }

  readColors()
  if (reduced) grabs = STILL_CITIES.map(index => ({ city: cities[index], t0: 0, still: true, arrived: true }))
  new ResizeObserver(resize).observe(globe)
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', retheme)
  inView(globe, visible => setRunning(visible && !reduced), { once: false, threshold: 0 })

  /* ---------------- 拖拽旋转：横向转经度、纵向调俯仰，松手后惯性回落到巡航速度 */
  let dragX = 0
  let dragY = 0
  let dragT = 0
  canvas.addEventListener('pointerdown', event => {
    dragging = true
    dragX = event.clientX
    dragY = event.clientY
    dragT = event.timeStamp
    velocity = 0
    canvas.setPointerCapture(event.pointerId)
    hint?.classList.add('is-used')
  })
  canvas.addEventListener('pointermove', event => {
    if (!dragging) return
    const dx = event.clientX - dragX
    const dy = event.clientY - dragY
    rot += dx * 0.0062
    tilt = Math.min(0.62, Math.max(0.05, tilt + dy * 0.003))
    velocity = (dx * 0.0062) / Math.max(1, event.timeStamp - dragT)
    dragX = event.clientX
    dragY = event.clientY
    dragT = event.timeStamp
    if (!running) render()
  })
  const release = (event: PointerEvent) => {
    if (!dragging) return
    dragging = false
    // 停住再松手不甩动
    velocity = event.timeStamp - dragT > 80 ? 0 : Math.max(-0.006, Math.min(0.006, velocity))
  }
  canvas.addEventListener('pointerup', release)
  canvas.addEventListener('pointercancel', release)
}
