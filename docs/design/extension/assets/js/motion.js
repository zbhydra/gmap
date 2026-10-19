/*
 * MapsGrab 扩展动效运行时（原生 JS，零依赖；移植自 website motion.js，删掉营销页专用行为）。
 * 声明式：HTML 上写 data-* 属性，本文件负责驱动；页面私有动画通过 window.MG 复用工具函数。
 *
 *   data-reveal[=fade-up|fade|zoom|left|right]   进入视口显现一次（长页面用；首屏用 CSS 的 .enter / .enter-group）
 *   data-reveal-delay="120"                     单个元素延迟（ms）
 *   data-stagger="40" [data-stagger-start="0"]  容器内 [data-reveal] 依序错峰
 *   data-count="1284" [data-count-prefix|suffix|decimals|duration]   进入视口时从 0 计数到终值（textContent 补间）
 *   data-roll="1284" [data-roll-class="roller"]  数字滚轮：首次渲染为静态终值，之后 MG.roll(el, n) 滚动到新值
 *   data-inview                                 离屏时暂停子树 CSS 动画（文档页的演示循环）
 *
 * 运行时（window.MG）：
 *   reducedMotion()            系统「减弱动态效果」或 <html data-motion="reduce">（状态坞模拟）
 *   onMotionChange(cb)         模拟开关变化时回调（'mg:motion' 事件）
 *   ease / wait(ms) / tween(duration, onUpdate, ease) / inView(el, cb, opts) / formatNumber(v, decimals)
 *   roll(el, value, opts)      数字滚轮更新；opts = { decimals, cls }，cls 默认 'roller'（页内面板传 'mgp-roll'）
 *   transition(update)         View Transitions 包裹一次 DOM 更新（共享元素）；不支持或减弱动效时直接执行
 *   replay(el, className)      移除再加回类名，重播一次性 CSS 动画
 *   token(name) / ms(name)     读取 :root 上的 token（字符串 / 毫秒数）
 *   init(scope)                绑定 scope 内的声明式属性；可重复调用，每个元素每种行为只绑定一次
 */
;(function () {
  var MG = (window.MG = window.MG || {})
  var root = document.documentElement
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  MG.reducedMotion = function () {
    return reduceQuery.matches || root.getAttribute('data-motion') === 'reduce'
  }

  MG.onMotionChange = function (cb) {
    document.addEventListener('mg:motion', function () {
      cb(MG.reducedMotion())
    })
    reduceQuery.addEventListener('change', function () {
      cb(MG.reducedMotion())
    })
  }

  MG.ease = {
    outCubic: function (t) {
      return 1 - Math.pow(1 - t, 3)
    },
    outExpo: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    },
    inOutCubic: function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
  }

  MG.wait = function (ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms)
    })
  }

  MG.token = function (name) {
    return getComputedStyle(root).getPropertyValue(name).trim()
  }

  MG.ms = function (name) {
    var value = MG.token(name)
    return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000
  }

  /** rAF 补间：onUpdate(easedProgress, rawProgress)；减弱动效下直接给终值 */
  MG.tween = function (duration, onUpdate, ease) {
    var easing = ease || MG.ease.outCubic
    if (MG.reducedMotion()) {
      onUpdate(1, 1)
      return Promise.resolve()
    }
    return new Promise(function (resolve) {
      var start = performance.now()
      var tick = function (now) {
        var p = Math.min(1, (now - start) / duration)
        onUpdate(easing(p), p)
        if (p < 1) requestAnimationFrame(tick)
        else resolve()
      }
      requestAnimationFrame(tick)
    })
  }

  /** 进入视口回调；once=false 时离开也回调 cb(false) */
  MG.inView = function (el, cb, options) {
    var opts = options || {}
    var once = opts.once !== false
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            cb(true, entry)
            if (once) io.unobserve(entry.target)
          } else if (!once) {
            cb(false, entry)
          }
        })
      },
      { threshold: opts.threshold == null ? 0.2 : opts.threshold, rootMargin: opts.rootMargin || '0px 0px -6% 0px' }
    )
    io.observe(el)
    return function () {
      io.disconnect()
    }
  }

  MG.formatNumber = function (value, decimals) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    })
  }

  MG.replay = function (el, className) {
    el.classList.remove(className)
    void el.offsetWidth
    el.classList.add(className)
  }

  MG.transition = function (update) {
    if (!document.startViewTransition || MG.reducedMotion()) {
      update()
      return Promise.resolve()
    }
    return document.startViewTransition(update).finished
  }

  /* -------------------------------------------------------------- 数字滚轮 */
  // 每位数字：.roller-digit > .roller-ghost（占位：宽度与基线）+ .roller-strip（0–9 竖带，--d 决定停在哪一位）
  // 结构不变（位数与分隔符位置相同）时只改 --d；结构变化时重建，旧数字按右对齐继承起点，新增位从 0 滚入
  var SR_STYLE = 'position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap'
  var STRIP = '<span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>'

  function shapeOf(text) {
    return text.replace(/\d/g, '0')
  }

  function buildRoller(el, text, cls) {
    el.textContent = ''
    var sr = document.createElement('span')
    sr.style.cssText = SR_STYLE
    sr.textContent = text
    el.appendChild(sr)
    var digits = []
    text.split('').forEach(function (ch) {
      if (/\d/.test(ch)) {
        var cell = document.createElement('span')
        cell.className = cls + '-digit'
        cell.setAttribute('aria-hidden', 'true')
        var ghost = document.createElement('span')
        ghost.className = cls + '-ghost'
        ghost.textContent = ch
        var strip = document.createElement('span')
        strip.className = cls + '-strip'
        strip.innerHTML = STRIP
        cell.appendChild(ghost)
        cell.appendChild(strip)
        el.appendChild(cell)
        digits.push({ cell: cell, ghost: ghost, strip: strip })
      } else {
        var sep = document.createElement('span')
        sep.className = cls + '-sep'
        sep.setAttribute('aria-hidden', 'true')
        sep.textContent = ch
        el.appendChild(sep)
      }
    })
    // 右侧为 0：滚动时从个位向左逐位延迟，像机械计数器
    digits.forEach(function (d, i) {
      d.strip.style.setProperty('--ri', digits.length - 1 - i)
    })
    return { sr: sr, digits: digits }
  }

  MG.roll = function (el, value, options) {
    var opts = options || {}
    var cls = opts.cls || el.dataset.rollClass || 'roller'
    var text = MG.formatNumber(value, opts.decimals || 0)
    var state = el._roll
    var instant = MG.reducedMotion() || opts.instant

    if (state && state.text === text) return
    if (state && shapeOf(state.text) === shapeOf(text)) {
      state.sr.textContent = text
      var chars = text.replace(/\D/g, '').split('')
      state.digits.forEach(function (d, i) {
        d.ghost.textContent = chars[i]
        if (instant) d.strip.style.transition = 'none'
        d.strip.style.setProperty('--d', chars[i])
        if (instant) {
          void d.strip.offsetWidth
          d.strip.style.transition = ''
        }
      })
      state.text = text
      return
    }

    // 结构变化：重建，旧值右对齐作为起点
    var oldDigits = state ? state.text.replace(/\D/g, '').split('') : []
    var next = buildRoller(el, text, cls)
    var newDigits = text.replace(/\D/g, '').split('')
    var offset = newDigits.length - oldDigits.length
    next.digits.forEach(function (d, i) {
      var from = oldDigits[i - offset]
      d.strip.style.transition = 'none'
      d.strip.style.setProperty('--d', instant || !state ? newDigits[i] : from == null ? 0 : from)
      if (state && from == null && !instant) d.cell.classList.add('is-new')
    })
    next.text = text
    el._roll = next
    void el.offsetWidth
    next.digits.forEach(function (d, i) {
      d.strip.style.transition = ''
      d.strip.style.setProperty('--d', newDigits[i])
    })
  }

  /* ----------------------------------------------------------- binding */
  var bound = new WeakMap()
  function all(scope, selector) {
    var list = Array.prototype.slice.call(scope.querySelectorAll(selector))
    if (scope.matches && scope.matches(selector)) list.unshift(scope)
    return list
  }
  function fresh(scope, selector, key) {
    return all(scope, selector).filter(function (el) {
      var keys = bound.get(el)
      if (!keys) bound.set(el, (keys = {}))
      if (keys[key]) return false
      keys[key] = true
      return true
    })
  }

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        revealObserver.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  )

  function setupReveal(scope) {
    all(scope, '[data-stagger]').forEach(function (group) {
      var step = Number(group.dataset.stagger) || 40
      var start = Number(group.dataset.staggerStart) || 0
      var i = 0
      group.querySelectorAll('[data-reveal]').forEach(function (el) {
        if (el.closest('[data-stagger]') !== group || el.dataset.revealDelay) return
        el.style.setProperty('--reveal-delay', start + i * step + 'ms')
        i++
      })
    })
    all(scope, '[data-reveal-delay]').forEach(function (el) {
      el.style.setProperty('--reveal-delay', el.dataset.revealDelay + 'ms')
    })
    fresh(scope, '[data-reveal]', 'reveal').forEach(function (el) {
      if (MG.reducedMotion()) el.classList.add('is-revealed')
      else revealObserver.observe(el)
    })
  }

  function setupCount(scope) {
    fresh(scope, '[data-count]', 'count').forEach(function (el) {
      var target = parseFloat(el.dataset.count)
      var decimals = Number(el.dataset.countDecimals || 0)
      var prefix = el.dataset.countPrefix || ''
      var suffix = el.dataset.countSuffix || ''
      var duration = Number(el.dataset.countDuration || MG.ms('--dur-5') * 1.6)
      var render = function (v) {
        el.textContent = prefix + MG.formatNumber(v, decimals) + suffix
      }
      if (MG.reducedMotion()) {
        render(target)
        return
      }
      render(0)
      MG.inView(
        el,
        function () {
          MG.tween(
            duration,
            function (t) {
              render(target * t)
            },
            MG.ease.outExpo
          )
        },
        { threshold: 0.6 }
      )
    })
  }

  function setupRoll(scope) {
    fresh(scope, '[data-roll]', 'roll').forEach(function (el) {
      MG.roll(el, parseFloat(el.dataset.roll), { instant: true, decimals: Number(el.dataset.rollDecimals || 0) })
    })
  }

  function setupInview(scope) {
    fresh(scope, '[data-inview]', 'inview').forEach(function (el) {
      MG.inView(
        el,
        function (visible) {
          el.classList.toggle('is-inview', visible)
        },
        { once: false, threshold: 0, rootMargin: '120px 0px 120px 0px' }
      )
    })
  }

  MG.init = function (scope) {
    var target = scope || document
    setupReveal(target)
    setupCount(target)
    setupRoll(target)
    setupInview(target)
  }

  // 状态坞切换模拟时：已在等待的显现元素直接呈现终态
  document.addEventListener('mg:motion', function () {
    if (!MG.reducedMotion()) return
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(function (el) {
      el.classList.add('is-revealed')
    })
  })

  MG.init(document)
})()
