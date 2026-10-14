/*
 * About 页（about.html；#contact 同时是真实 /contact 路由的模板）
 *   - Hero 地球：canvas 正交投影的经纬网 + 城市周边的商家点簇；pin 落在城市上被“抓取”，数据光束汇入顶部 MapsGrab 节点。
 *     可拖拽旋转（带惯性），离屏 / 标签页隐藏时停帧；减弱动效下只画一帧静态终态
 *   - 连线：产品家族与数据流向的三次贝塞尔 + 流动光点；坐标取布局位置（offset 累加），不受显现动画的 transform 影响
 *   - 免费工具胶囊：由 MGChrome.tools 渲染，与导航 / 页脚同源
 *   - 联系表单：本地校验 → 加载态 → 成功态 + toast；原型不发送任何数据（真实 /contact 目前只有 mailto）
 */
;(function () {
  var MG = window.MG
  var Chrome = window.MGChrome
  var reduced = MG.reducedMotion()

  /* ------------------------------------------------------------ 品牌标 */
  document.querySelectorAll('[data-logo-mark]').forEach(function (slot) {
    slot.outerHTML = Chrome.logoMark()
  })

  /* ------------------------------------------------------ 免费工具胶囊 */
  var chips = document.querySelector('[data-tool-chips]')
  if (chips) {
    chips.innerHTML = Chrome.tools
      .map(function (t, i) {
        return '<a class="chip tool-chip" href="' + Chrome.toolHref(t) + '" style="--i: ' + i + '">' + Chrome.icon(t[1]) + t[0] + '</a>'
      })
      .join('')
  }

  /* -------------------------------------------------------------- 连线 */
  var SVG_NS = 'http://www.w3.org/2000/svg'
  var svgNode = function (name, attrs) {
    var el = document.createElementNS(SVG_NS, name)
    Object.keys(attrs).forEach(function (key) {
      el.setAttribute(key, attrs[key])
    })
    return el
  }

  // 布局坐标：沿 offsetParent 累加到连线根节点（根节点须为定位元素）
  var boxIn = function (el, root) {
    var x = 0
    var y = 0
    for (var node = el; node && node !== root; node = node.offsetParent) {
      x += node.offsetLeft
      y += node.offsetTop
    }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight }
  }

  var pt = function (p) {
    return Math.round(p[0] * 10) / 10 + ',' + Math.round(p[1] * 10) / 10
  }

  var curve = function (a, b, vertical) {
    var k = vertical ? (b[1] - a[1]) * 0.55 : (b[0] - a[0]) * 0.5
    var c1 = vertical ? [a[0], a[1] + k] : [a[0] + k, a[1]]
    var c2 = vertical ? [b[0], b[1] - k] : [b[0] - k, b[1]]
    return 'M' + pt(a) + ' C' + pt(c1) + ' ' + pt(c2) + ' ' + pt(b)
  }

  // build() 返回 { wires: [{ a, b, vertical, dashed, pulses: [{ color, rev, delay, dur }] }], dots: [[x, y]] }
  // 窄屏下 svg 被 CSS 隐藏，此时不绘制；尺寸变化（含断点切换）时整体重绘
  var setupWires = function (root, build) {
    var svg = root.querySelector('[data-wires]')
    var render = function () {
      svg.textContent = ''
      if (getComputedStyle(svg).display === 'none') return
      var spec = build()
      spec.wires.forEach(function (wire) {
        var d = curve(wire.a, wire.b, wire.vertical)
        svg.appendChild(svgNode('path', { class: wire.dashed ? 'wire wire--dashed' : 'wire', d: d }))
        wire.pulses.forEach(function (pulse) {
          var path = svgNode('path', { class: pulse.rev ? 'wire-pulse wire-pulse--rev' : 'wire-pulse', d: d, pathLength: 100 })
          path.style.cssText = '--pc: ' + pulse.color + '; --d: ' + pulse.delay + 's; --t: ' + pulse.dur + 's'
          svg.appendChild(path)
        })
      })
      spec.dots.forEach(function (p) {
        svg.appendChild(svgNode('circle', { class: 'wire-dot', cx: p[0], cy: p[1], r: 3.5 }))
      })
    }
    new ResizeObserver(render).observe(root)
    return render
  }

  var renders = []

  // 产品家族：引擎胶囊底边 → 四张卡片顶边
  var family = document.querySelector('[data-family]')
  if (family) {
    renders.push(
      setupWires(family, function () {
        var core = boxIn(family.querySelector('[data-wire-core]'), family)
        var start = [core.x + core.w / 2, core.y + core.h]
        var wires = Array.prototype.map.call(family.querySelectorAll('[data-wire-leaf]'), function (leaf, i) {
          var box = boxIn(leaf, family)
          var ai = leaf.classList.contains('family-card--ai')
          return {
            a: start,
            b: [box.x + box.w / 2, box.y],
            vertical: true,
            pulses: [{ color: ai ? 'var(--ai)' : 'var(--cyan)', delay: i * 0.55, dur: 2.4 }]
          }
        })
        return {
          wires: wires,
          dots: [start].concat(
            wires.map(function (wire) {
              return wire.b
            })
          )
        }
      })
    )
  }

  // 数据流向：Maps → 浏览器 → 后端四类用途（方向见 data-lane：in 下发 / out 上报 / both 往返）；浏览器 → 可选集成（虚线）
  var flow = document.querySelector('[data-flow]')
  if (flow) {
    renders.push(
      setupWires(flow, function () {
        var node = function (key) {
          return boxIn(flow.querySelector('[data-node="' + key + '"]'), flow)
        }
        var maps = node('maps')
        var browser = node('browser')
        var backend = node('backend')
        var yours = node('yours')
        var out = [browser.x + browser.w, browser.y + browser.h / 2]
        var wires = [
          {
            a: [maps.x + maps.w, maps.y + maps.h / 2],
            b: [browser.x, browser.y + browser.h / 2],
            pulses: [{ color: 'var(--cyan-400)', delay: 0, dur: 2.2 }]
          },
          {
            a: [browser.x + browser.w / 2, browser.y + browser.h],
            b: [yours.x + yours.w / 2, yours.y],
            vertical: true,
            dashed: true,
            pulses: [{ color: 'var(--green-400)', delay: 1.2, dur: 1.6 }]
          }
        ]
        flow.querySelectorAll('[data-lane]').forEach(function (lane, i) {
          var box = boxIn(lane, flow)
          var color = lane.querySelector('.lane-icon').style.getPropertyValue('--lc')
          var dir = lane.dataset.lane
          var pulses = []
          if (dir !== 'in') pulses.push({ color: color, delay: 0.5 + i * 0.4, dur: 2.6 })
          if (dir !== 'out') pulses.push({ color: color, rev: true, delay: 1.8 + i * 0.4, dur: 2.6 })
          wires.push({ a: out, b: [backend.x, box.y + box.h / 2], pulses: pulses })
        })
        return {
          wires: wires,
          dots: wires
            .map(function (wire) {
              return wire.b
            })
            .concat([wires[0].a, wires[1].a, out])
        }
      })
    )
  }

  // 字体换入后文字折行会变，补一次重绘
  if (document.fonts) {
    document.fonts.ready.then(function () {
      renders.forEach(function (render) {
        render()
      })
    })
  }

  /* -------------------------------------------------------------- 地球 */
  var setupGlobe = function (globe) {
    var canvas = globe.querySelector('[data-globe-canvas]')
    var ctx = canvas.getContext('2d')
    var node = globe.querySelector('[data-globe-node]')
    var hint = document.querySelector('[data-globe-hint]')
    var RAD = Math.PI / 180
    var BASE_SPEED = 0.00011 // 弧度 / 毫秒：约 57 秒一圈
    var GRAB_EVERY = 480

    var point = function (lat, lon) {
      return { lon: lon, cl: Math.cos(lat), sl: Math.sin(lat) }
    }

    // 固定种子的伪随机：每次加载点簇形状一致
    var seed = 20260831
    var rand = function () {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    // 真实城市坐标（纬度, 经度），只决定点簇与 pin 的位置
    var cities = [
      [40.71, -74.01], [34.05, -118.24], [41.88, -87.63], [43.65, -79.38], [49.28, -123.12], [29.76, -95.37],
      [19.43, -99.13], [4.71, -74.07], [-12.05, -77.04], [-23.55, -46.63], [-34.6, -58.38], [-33.45, -70.67],
      [51.51, -0.13], [48.86, 2.35], [52.52, 13.4], [40.42, -3.7], [41.9, 12.5], [59.33, 18.07],
      [41.01, 28.98], [30.04, 31.24], [6.52, 3.38], [-1.29, 36.82], [-26.2, 28.05], [33.57, -7.59],
      [25.2, 55.27], [24.71, 46.68], [19.08, 72.88], [28.61, 77.21], [12.97, 77.59], [13.76, 100.5],
      [1.35, 103.82], [-6.21, 106.85], [14.6, 120.98], [22.32, 114.17], [31.23, 121.47], [37.57, 126.98],
      [35.68, 139.69], [-33.87, 151.21], [-37.81, 144.96], [-36.85, 174.76], [21.31, -157.86], [64.15, -21.94]
    ].map(function (c) {
      var p = point(c[0] * RAD, c[1] * RAD)
      p.busy = false
      return p
    })

    // 商家点簇：每座城市周围一小撮点，大致勾勒出有人活动的陆地
    var spots = []
    cities.forEach(function (c) {
      var lat = Math.asin(c.sl)
      var n = 10 + Math.round(rand() * 12)
      for (var i = 0; i < n; i++) {
        var r = Math.sqrt(rand()) * 2.6 * RAD
        var a = rand() * Math.PI * 2
        spots.push(point(lat + Math.sin(a) * r, c.lon + (Math.cos(a) * r) / Math.max(0.35, c.cl)))
      }
    })

    // 背景点阵：斐波那契球面均匀分布
    var field = []
    for (var i = 0; i < 1000; i++) {
      field.push(point(Math.asin(1 - ((i + 0.5) / 1000) * 2), (i * Math.PI * (3 - Math.sqrt(5))) % (Math.PI * 2)))
    }

    // 经纬网：纬线 ±75°、经线每 15°；赤道与本初子午线单独加亮
    var lines = []
    var strong = []
    var lat
    var lon
    var line
    for (lat = -75; lat <= 75; lat += 15) {
      line = []
      for (lon = -180; lon <= 180; lon += 4) line.push(point(lat * RAD, lon * RAD))
      if (lat === 0) strong.push(line)
      else lines.push(line)
    }
    for (lon = -180; lon < 180; lon += 15) {
      line = []
      for (lat = -90; lat <= 90; lat += 4) line.push(point(lat * RAD, lon * RAD))
      if (lon === 0) strong.push(line)
      else lines.push(line)
    }

    /* ---------------- 投影 */
    var size = 0
    var cx = 0
    var cy = 0
    var R = 0
    var target = [0, 0]
    var rot = 0.62 // 初始让大西洋两岸朝前
    var tilt = 0.32
    var cosT = 0
    var sinT = 0
    var P = { x: 0, y: 0, z: 0 }

    var project = function (p, out) {
      var a = p.lon + rot
      var z = p.cl * Math.cos(a)
      out.x = cx + R * p.cl * Math.sin(a)
      out.y = cy - R * (p.sl * cosT - z * sinT)
      out.z = p.sl * sinT + z * cosT
      return out
    }

    /* ---------------- 颜色：读 token 的实际色值，主题切换时刷新 */
    var colors = {}
    var probe = document.createElement('span')
    probe.hidden = true
    globe.appendChild(probe)
    var swatch = document.createElement('canvas')
    swatch.width = 1
    swatch.height = 1
    var swatchCtx = swatch.getContext('2d', { willReadFrequently: true })
    var rgb = function (value) {
      probe.style.color = value
      swatchCtx.clearRect(0, 0, 1, 1)
      swatchCtx.fillStyle = getComputedStyle(probe).color
      swatchCtx.fillRect(0, 0, 1, 1)
      var d = swatchCtx.getImageData(0, 0, 1, 1).data
      return d[0] + ',' + d[1] + ',' + d[2]
    }
    var readColors = function () {
      colors.ink = rgb('var(--text)')
      colors.brand = rgb('var(--primary)')
      colors.beam = rgb('var(--cyan)')
      colors.pin = rgb('var(--pin)')
    }
    var rgba = function (c, a) {
      return 'rgba(' + c + ',' + a + ')'
    }

    /* ---------------- 绘制 */
    var strokeLines = function (list, front) {
      ctx.beginPath()
      list.forEach(function (pts) {
        var pen = false
        pts.forEach(function (p) {
          project(p, P)
          var visible = front ? P.z >= 0 : P.z < 0
          if (visible) {
            if (pen) ctx.lineTo(P.x, P.y)
            else ctx.moveTo(P.x, P.y)
          }
          pen = visible
        })
      })
      ctx.stroke()
    }

    var drawSphere = function () {
      // 大气辉光（只画球外的环）
      var glow = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 1.22)
      glow.addColorStop(0, rgba(colors.brand, 0.16))
      glow.addColorStop(1, rgba(colors.brand, 0))
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2)
      ctx.arc(cx, cy, R, 0, Math.PI * 2, true)
      ctx.fill()

      ctx.lineWidth = 1
      ctx.strokeStyle = rgba(colors.ink, 0.05)
      strokeLines(lines, false)

      var fill = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.1, cx, cy, R)
      fill.addColorStop(0, rgba(colors.brand, 0.11))
      fill.addColorStop(1, rgba(colors.brand, 0.03))
      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = rgba(colors.ink, 0.13)
      ctx.stroke()

      ctx.strokeStyle = rgba(colors.ink, 0.1)
      strokeLines(lines, true)
      ctx.strokeStyle = rgba(colors.brand, 0.32)
      strokeLines(strong, true)

      // 球缘高光：左上亮、右下隐去
      var rim = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.6, cy + R * 0.6)
      rim.addColorStop(0, rgba(colors.beam, 0.55))
      rim.addColorStop(1, rgba(colors.beam, 0))
      ctx.strokeStyle = rim
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2)
      ctx.stroke()
      ctx.lineWidth = 1

      ctx.fillStyle = rgba(colors.ink, 1)
      field.forEach(function (p) {
        project(p, P)
        if (P.z <= 0.02) return
        ctx.globalAlpha = 0.05 + 0.26 * P.z
        ctx.fillRect(P.x - 0.7, P.y - 0.7, 1.4, 1.4)
      })
      ctx.globalAlpha = 1

      // 城市热区：点簇下垫一层柔光
      cities.forEach(function (c) {
        project(c, P)
        if (P.z <= 0.05) return
        var r = 14 + 6 * P.z
        var heat = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, r)
        heat.addColorStop(0, rgba(colors.brand, 0.2 * P.z))
        heat.addColorStop(1, rgba(colors.brand, 0))
        ctx.fillStyle = heat
        ctx.fillRect(P.x - r, P.y - r, r * 2, r * 2)
      })

      ctx.fillStyle = rgba(colors.brand, 1)
      spots.forEach(function (p) {
        project(p, P)
        if (P.z <= 0.02) return
        ctx.globalAlpha = 0.3 + 0.65 * P.z
        ctx.beginPath()
        ctx.arc(P.x, P.y, 0.9 + 0.8 * P.z, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }

    // pin：水滴形，尖端落在城市投影点上
    var drawPin = function (x, y, s, alpha) {
      var r = 5.5 * s
      var hy = y - 13 * s
      var b = Math.acos(r / (y - hy))
      ctx.globalAlpha = alpha
      ctx.fillStyle = rgba(colors.pin, 1)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.arc(x, hy, r, Math.PI / 2 + b, Math.PI / 2 - b)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(x, hy, r * 0.42, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    var bez = function (a, b, c, d, t) {
      var u = 1 - t
      return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
    }
    var clamp01 = function (v) {
      return v < 0 ? 0 : v > 1 ? 1 : v
    }
    var easeInOut = function (t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    }

    // 光束：从 pin 头部竖直升起，自下而上汇入节点
    var beamCurve = function (x0, y0) {
      var h = (y0 - target[1]) * 0.5
      return [x0, y0, x0, y0 - h, target[0], target[1] + h, target[0], target[1]]
    }
    var tracePath = function (c, t0, t1) {
      ctx.beginPath()
      for (var k = 0; k <= 16; k++) {
        var t = t0 + ((t1 - t0) * k) / 16
        var x = bez(c[0], c[2], c[4], c[6], t)
        var y = bez(c[1], c[3], c[5], c[7], t)
        if (k) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
    }

    var pulseNode = function () {
      node.classList.remove('is-receiving')
      void node.offsetWidth
      node.classList.add('is-receiving')
    }

    // 一次“抓取”：0–320ms pin 落下（落点泛起涟漪）→ 260ms 起光束 1s 飞向节点（尾迹滞后 380ms）→ 1.5s 后 pin 淡出
    var grabs = []
    var clock = 0
    var nextGrab = 0
    var spawn = function () {
      var free = cities.filter(function (c) {
        return !c.busy && project(c, P).z > 0.3
      })
      if (!free.length) return
      var city = free[Math.floor(Math.random() * free.length)]
      city.busy = true
      grabs.push({ city: city, t0: clock })
    }

    var drawGrab = function (g) {
      var age = g.still ? 1e9 : clock - g.t0
      var alive = g.still || age < 2100
      var base = project(g.city, { x: 0, y: 0, z: 0 })
      var face = clamp01((base.z - 0.05) / 0.25) // 转向背面时淡出
      var s = 0.78 + 0.22 * base.z
      var fade = g.still ? 1 : 1 - clamp01((age - 1500) / 600)
      var alpha = face * fade * clamp01(age / 160)
      if (alpha <= 0) return alive
      var drop = 1 - Math.pow(1 - clamp01(age / 320), 3)
      var headY = base.y - 13 * s
      var c = beamCurve(base.x, headY)

      if (g.still) {
        var still = ctx.createLinearGradient(base.x, headY, target[0], target[1])
        still.addColorStop(0, rgba(colors.beam, 0))
        still.addColorStop(1, rgba(colors.beam, 0.55 * face))
        ctx.strokeStyle = still
        ctx.lineWidth = 1.6
        tracePath(c, 0, 1)
        ctx.stroke()
      } else {
        if (age > 220 && age < 1000) {
          var k = (age - 220) / 780
          ctx.strokeStyle = rgba(colors.pin, 0.55 * (1 - k) * face)
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.ellipse(base.x, base.y, 3 + 15 * k * s, (3 + 15 * k * s) * 0.42, 0, 0, Math.PI * 2)
          ctx.stroke()
        }
        var head = easeInOut(clamp01((age - 260) / 1000))
        var tail = easeInOut(clamp01((age - 640) / 1000))
        if (head > 0 && tail < 1) {
          ctx.strokeStyle = rgba(colors.beam, 0.16 * face)
          ctx.lineWidth = 1
          tracePath(c, 0, 1)
          ctx.stroke()
          var hx = bez(c[0], c[2], c[4], c[6], head)
          var hy = bez(c[1], c[3], c[5], c[7], head)
          var tx = bez(c[0], c[2], c[4], c[6], tail)
          var ty = bez(c[1], c[3], c[5], c[7], tail)
          // 外层柔光 + 内层亮芯
          var wide = ctx.createLinearGradient(tx, ty, hx, hy)
          wide.addColorStop(0, rgba(colors.beam, 0))
          wide.addColorStop(1, rgba(colors.beam, 0.22 * face))
          var core = ctx.createLinearGradient(tx, ty, hx, hy)
          core.addColorStop(0, rgba(colors.beam, 0))
          core.addColorStop(1, rgba(colors.beam, 0.95 * face))
          ctx.lineCap = 'round'
          tracePath(c, tail, head)
          ctx.strokeStyle = wide
          ctx.lineWidth = 6
          ctx.stroke()
          ctx.strokeStyle = core
          ctx.lineWidth = 2
          ctx.stroke()
          if (head < 1) {
            var halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 7)
            halo.addColorStop(0, rgba(colors.beam, 0.55 * face))
            halo.addColorStop(1, rgba(colors.beam, 0))
            ctx.fillStyle = halo
            ctx.beginPath()
            ctx.arc(hx, hy, 7, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        if (!g.arrived && head >= 1) {
          g.arrived = true
          pulseNode()
        }
      }
      drawPin(base.x, base.y - (1 - drop) * 16 * s, s, alpha)
      return alive
    }

    var render = function () {
      if (!size) return
      ctx.clearRect(0, 0, size, size)
      cosT = Math.cos(tilt)
      sinT = Math.sin(tilt)
      drawSphere()
      grabs = grabs.filter(function (g) {
        var alive = drawGrab(g)
        if (!alive) g.city.busy = false
        return alive
      })
    }

    /* ---------------- 循环：离屏 / 标签页隐藏时停帧 */
    var vel = BASE_SPEED
    var dragging = false
    var running = false
    var onScreen = false
    var raf = 0
    var last = 0

    var frame = function (now) {
      var dt = last ? Math.min(48, now - last) : 16
      last = now
      clock += dt
      if (!dragging) {
        vel += (BASE_SPEED - vel) * (1 - Math.pow(0.965, dt / 16.7))
        rot += vel * dt
      }
      if (clock >= nextGrab) {
        spawn()
        nextGrab = clock + GRAB_EVERY * (0.7 + Math.random() * 0.6)
      }
      render()
      raf = requestAnimationFrame(frame)
    }

    var sync = function () {
      var go = onScreen && !document.hidden && !reduced
      if (go && !running) {
        running = true
        last = 0
        raf = requestAnimationFrame(frame)
      } else if (!go && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }

    /* ---------------- 尺寸 / 主题 */
    var resize = function () {
      size = globe.clientWidth
      var dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      R = size * 0.37
      cx = size / 2
      cy = size * 0.585
      // 节点：标签在上、品牌标在下，光束落在品牌标中心
      var label = node.querySelector('.globe-node-label')
      var mark = node.querySelector('.brand-mark')
      var gap = parseFloat(getComputedStyle(node).rowGap) || 0
      target = [cx, node.offsetTop + label.offsetHeight + gap + parseFloat(getComputedStyle(mark).height) / 2]
      if (!running) render()
    }

    var retheme = function () {
      readColors()
      if (!running) render()
    }

    readColors()
    // 减弱动效：固定几座朝前城市的光束，画成静态终态
    if (reduced) {
      grabs = [0, 9, 12, 20].map(function (i) {
        return { city: cities[i], still: true }
      })
    }
    new ResizeObserver(resize).observe(globe)
    new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', retheme)
    MG.inView(
      globe,
      function (visible) {
        onScreen = visible
        sync()
      },
      { once: false, threshold: 0, rootMargin: '0px' }
    )
    document.addEventListener('visibilitychange', sync)

    /* ---------------- 拖拽旋转：横向转经度、纵向调俯仰，松手后惯性回落到巡航速度 */
    var dragX = 0
    var dragY = 0
    var dragT = 0
    canvas.addEventListener('pointerdown', function (e) {
      dragging = true
      dragX = e.clientX
      dragY = e.clientY
      dragT = e.timeStamp
      vel = 0
      canvas.setPointerCapture(e.pointerId)
      if (hint) hint.classList.add('is-used')
    })
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return
      var dx = e.clientX - dragX
      var dy = e.clientY - dragY
      rot += dx * 0.0062
      tilt = Math.min(0.62, Math.max(0.05, tilt + dy * 0.003))
      vel = (dx * 0.0062) / Math.max(1, e.timeStamp - dragT)
      dragX = e.clientX
      dragY = e.clientY
      dragT = e.timeStamp
      if (!running) render()
    })
    var release = function (e) {
      if (!dragging) return
      dragging = false
      // 停住再松手不甩动
      vel = e.timeStamp - dragT > 80 ? 0 : Math.max(-0.006, Math.min(0.006, vel))
    }
    canvas.addEventListener('pointerup', release)
    canvas.addEventListener('pointercancel', release)
  }

  var globe = document.querySelector('[data-globe]')
  if (globe) setupGlobe(globe)

  /* ---------------------------------------------------------- 联系表单 */
  var setupContact = function (form) {
    var body = form.querySelector('[data-cf-body]')
    var success = form.querySelector('[data-cf-success]')
    var submit = form.querySelector('[data-cf-submit]')
    var label = form.querySelector('[data-cf-label]')
    var note = form.querySelector('[data-privacy-note]')
    var successTitle = form.querySelector('[data-cf-success-title]')
    var successText = form.querySelector('[data-cf-success-text]')
    var fields = ['name', 'email', 'message'].map(function (name) {
      return form.elements[name]
    })
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    var REQUIRED = {
      name: 'Please enter your name.',
      email: 'Please enter your email address.',
      message: 'Please tell us what you need help with.'
    }
    var tried = false

    var setError = function (field, error) {
      var slot = field.parentElement.querySelector('.field-error')
      field.classList.toggle('is-invalid', !!error)
      field.setAttribute('aria-invalid', String(!!error))
      slot.hidden = !error
      slot.lastElementChild.textContent = error
    }

    var check = function (field) {
      var value = field.value.trim()
      var error = ''
      if (!value) error = REQUIRED[field.name]
      else if (field.name === 'email' && !EMAIL.test(value)) error = 'Please enter a valid email address, like name@company.com.'
      setError(field, error)
      return !error
    }

    var replay = function (cls) {
      form.classList.remove(cls)
      void form.offsetWidth
      form.classList.add(cls)
    }

    // 未提交过时，空字段失焦不报错；已报错的字段边输入边复查
    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (tried || field.value.trim()) check(field)
      })
      field.addEventListener('input', function () {
        if (field.classList.contains('is-invalid')) check(field)
      })
    })

    form.addEventListener('change', function (e) {
      if (e.target.name === 'topic') note.hidden = e.target.value !== 'privacy'
    })

    form.addEventListener('animationend', function (e) {
      if (e.target === form) form.classList.remove('is-shake', 'is-targeted')
    })

    form.addEventListener('submit', function (e) {
      e.preventDefault()
      tried = true
      var invalid = fields.filter(function (field) {
        return !check(field)
      })
      if (invalid.length) {
        invalid[0].focus()
        if (!MG.reducedMotion()) replay('is-shake')
        return
      }
      submit.classList.add('is-loading')
      submit.disabled = true
      submit.insertAdjacentHTML('afterbegin', '<span class="spinner" aria-hidden="true"></span>')
      label.textContent = 'Sending…'
      MG.wait(1100).then(function () {
        successText.textContent =
          form.elements.topic.value === 'privacy'
            ? 'Privacy requests may take a few days when we need to verify account ownership first.'
            : 'We answer support email within one business day, usually faster.'
        body.hidden = true
        success.hidden = false
        successTitle.focus()
        MG.toast('Prototype only — nothing was sent', 'The live contact page uses email: support@mapsgrab.com', 'info')
      })
    })

    form.querySelector('[data-cf-reset]').addEventListener('click', function () {
      form.reset()
      tried = false
      fields.forEach(function (field) {
        setError(field, '')
      })
      note.hidden = true
      submit.classList.remove('is-loading')
      submit.disabled = false
      submit.querySelector('.spinner').remove()
      label.textContent = 'Send message'
      success.hidden = true
      body.hidden = false
      fields[0].focus()
    })

    // 经 #contact 到达（首屏锚点、站内链接）时，表单进入视口后泛起光晕
    var glow = function () {
      MG.inView(
        form,
        function () {
          setTimeout(function () {
            replay('is-targeted')
          }, 300)
        },
        { threshold: 0.4 }
      )
    }
    if (location.hash === '#contact') glow()
    window.addEventListener('hashchange', function () {
      if (location.hash === '#contact') glow()
    })
    // 锚点未变化时浏览器不触发 hashchange，点击同一锚点也要能再次提示
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href$="#contact"]')
      if (link && link.pathname === location.pathname && location.hash === '#contact') glow()
    })
  }

  var form = document.querySelector('[data-contact-form]')
  if (form) setupContact(form)
})()
