/*
 * MapsGrab 动效运行时（原生 JS，零依赖）。
 * 声明式：HTML 上写 data-* 属性，本文件负责驱动；页面私有动画通过 window.MG 复用工具函数。
 *
 *   data-reveal[=fade-up|fade|zoom|blur|left|right|rise|clip]  进入视口显现一次
 *   data-reveal-delay="120"                                   单个元素延迟（ms）
 *   data-reveal-onload="650"                                  首屏视觉（剧场 / 插画）：加载后按延时显现，不等进入视口
 *   data-enter [style="--enter-delay: 180ms"]                 首屏文案：纯 CSS 首帧启动、起始可见的入场，本文件不处理
 *   data-stagger="70" [data-stagger-start="0"]               容器内 [data-reveal] 依序错峰
 *   data-split                                                标题逐词上升（.accent/.text-grad 整体为一个单元）
 *   data-split="static"                                       首屏标题：HTML 已拆好 .w/.wi，CSS 首帧启动，本文件不处理
 *   data-count="36" [data-count-prefix|suffix|decimals|duration]  数字滚动
 *   data-spotlight / data-spotlight-group                    指针聚光（写 --mx/--my）
 *   data-tilt="6"                                             3D 倾斜（最大角度）
 *   data-magnetic="0.25"                                      磁吸按钮
 *   data-marquee                                              跑马灯（自动复制轨道）
 *   data-parallax="0.12"                                      滚动视差（用 translate 属性，不占用 transform）
 *   data-typing='["a","b"]'                                   打字循环（input 写 placeholder）
 *   data-inview                                               离屏时暂停子树 CSS 动画
 *   data-scroll-progress                                      顶部阅读进度条
 *
 * 减弱动效（prefers-reduced-motion）下：显现直接到终态，倾斜 / 磁吸 / 视差 / 打字停用，数字直接显示终值。
 */
(function () {
  var MG = (window.MG = window.MG || {})
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  var fineQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

  MG.reducedMotion = function () {
    return reduceQuery.matches
  }
  MG.finePointer = function () {
    return fineQuery.matches
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

  /** rAF 补间：onUpdate(easedProgress, rawProgress) */
  MG.tween = function (duration, onUpdate, ease) {
    var easing = ease || MG.ease.outCubic
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
      { threshold: opts.threshold == null ? 0.2 : opts.threshold, rootMargin: opts.rootMargin || '0px 0px -8% 0px' }
    )
    io.observe(el)
    return function () {
      io.disconnect()
    }
  }

  MG.formatNumber = function (value, decimals) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    })
  }

  /* ----------------------------------------------------------- binding */
  // MG.init(scope) 可重复调用：scope 自身也参与匹配，每个元素每种行为只绑定一次（供动态渲染的节点使用）。
  // 错峰 / 延迟只写 CSS 变量，可重复执行，不加绑定保护（容器先空后填时也能生效）
  var bound = new WeakMap()
  function all(scope, selector) {
    var list = Array.prototype.slice.call(scope.querySelectorAll(selector))
    if (scope.matches && scope.matches(selector)) list.unshift(scope)
    return list
  }
  function $$(scope, selector, key) {
    return all(scope, selector).filter(function (el) {
      var keys = bound.get(el)
      if (!keys) bound.set(el, (keys = {}))
      if (keys[key]) return false
      keys[key] = true
      return true
    })
  }

  /* -------------------------------------------------------------- split */
  function splitText(el) {
    // static：HTML 已拆好，动画由 CSS 首帧启动，运行时不碰
    if (el.dataset.splitReady || el.dataset.split === 'static') return
    var index = 0
    var makeUnit = function () {
      var w = document.createElement('span')
      w.className = 'w'
      var wi = document.createElement('span')
      wi.className = 'wi'
      wi.style.setProperty('--i', index++)
      w.appendChild(wi)
      return { w: w, wi: wi }
    }
    var walk = function (parent) {
      Array.prototype.slice.call(parent.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var frag = document.createDocumentFragment()
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part))
              return
            }
            var unit = makeUnit()
            unit.wi.textContent = part
            frag.appendChild(unit.w)
          })
          parent.replaceChild(frag, node)
        } else if (node.nodeType === 1 && node.tagName !== 'BR') {
          // 渐变 / 衬线强调词整体位移，否则 background-clip:text 会随子元素位移失效
          if (node.matches('.accent, .text-grad, [data-split-unit]')) {
            var unit = makeUnit()
            parent.replaceChild(unit.w, node)
            unit.wi.appendChild(node)
          } else {
            walk(node)
          }
        }
      })
    }
    walk(el)
    el.dataset.splitReady = '1'
  }

  /* ------------------------------------------------------------- reveal */
  // clip 变体初始被 clip-path 裁成 0 高，Chrome 的 IntersectionObserver 会计入目标自身裁剪而永不相交，
  // 因此改为观察父元素（proxies：父元素 → 待显现的 clip 子元素）
  var selfTargets = new WeakSet()
  var proxies = new Map()
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return
        var target = entry.target
        if (selfTargets.has(target)) target.classList.add('is-revealed')
        var waiting = proxies.get(target)
        if (waiting) {
          waiting.forEach(function (el) {
            el.classList.add('is-revealed')
          })
          proxies.delete(target)
        }
        revealObserver.unobserve(target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  )
  function observeReveal(el) {
    var parent = el.parentElement
    if (el.dataset.reveal === 'clip' && parent) {
      if (!proxies.has(parent)) proxies.set(parent, [])
      proxies.get(parent).push(el)
      revealObserver.observe(parent)
    } else {
      selfTargets.add(el)
      revealObserver.observe(el)
    }
  }

  function setupReveal(scope) {
    all(scope, '[data-stagger]').forEach(function (group) {
      var step = Number(group.dataset.stagger) || 70
      var start = Number(group.dataset.staggerStart) || 0
      var i = 0
      group.querySelectorAll('[data-reveal], [data-split]').forEach(function (el) {
        if (el.closest('[data-stagger]') !== group || el.dataset.revealDelay) return
        var delay = start + i * step
        i++
        // static 标题占一个错峰序号，但延迟已写在 HTML 内联（动画首帧已开始，此时再改会跳帧）
        if (el.dataset.split === 'static') return
        el.style.setProperty('--reveal-delay', delay + 'ms')
        el.style.setProperty('--split-delay', delay + 'ms')
      })
    })
    all(scope, '[data-reveal-delay]').forEach(function (el) {
      el.style.setProperty('--reveal-delay', el.dataset.revealDelay + 'ms')
      el.style.setProperty('--split-delay', el.dataset.revealDelay + 'ms')
    })
    $$(scope, '[data-split]', 'split').forEach(splitText)
    $$(scope, '[data-reveal], [data-split]', 'reveal').forEach(function (el) {
      if (el.dataset.split === 'static') return
      if (MG.reducedMotion()) el.classList.add('is-revealed')
      else if (el.dataset.revealOnload) {
        // 首屏关键视觉：不等进入视口，加载后按延时显现
        setTimeout(function () {
          el.classList.add('is-revealed')
        }, Number(el.dataset.revealOnload) || 0)
      } else observeReveal(el)
    })
  }

  /* -------------------------------------------------------------- count */
  function setupCount(scope) {
    $$(scope, '[data-count]', 'count').forEach(function (el) {
      var target = parseFloat(el.dataset.count)
      var decimals = Number(el.dataset.countDecimals || 0)
      var prefix = el.dataset.countPrefix || ''
      var suffix = el.dataset.countSuffix || ''
      var duration = Number(el.dataset.countDuration || 1800)
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

  /* ---------------------------------------------------------- spotlight */
  function setupSpotlight(scope) {
    if (!MG.finePointer()) return
    var setPos = function (el, x, y) {
      var r = el.getBoundingClientRect()
      el.style.setProperty('--mx', x - r.left + 'px')
      el.style.setProperty('--my', y - r.top + 'px')
    }
    $$(scope, '[data-spotlight-group]', 'spotlight-group').forEach(function (group) {
      group.addEventListener('pointermove', function (e) {
        group.querySelectorAll('[data-spotlight]').forEach(function (el) {
          setPos(el, e.clientX, e.clientY)
        })
      })
    })
    $$(scope, '[data-spotlight]', 'spotlight').forEach(function (el) {
      if (el.closest('[data-spotlight-group]')) return
      el.addEventListener('pointermove', function (e) {
        setPos(el, e.clientX, e.clientY)
      })
    })
  }

  /* --------------------------------------------------------------- tilt */
  function setupTilt(scope) {
    if (!MG.finePointer() || MG.reducedMotion()) return
    $$(scope, '[data-tilt]', 'tilt').forEach(function (el) {
      var max = Number(el.dataset.tilt) || 6
      var frame = 0
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect()
        var px = (e.clientX - r.left) / r.width - 0.5
        var py = (e.clientY - r.top) / r.height - 0.5
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(function () {
          el.style.transform =
            'perspective(1600px) rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg)'
        })
      })
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(frame)
        el.style.transform = ''
      })
    })
  }

  /* ----------------------------------------------------------- magnetic */
  function setupMagnetic(scope) {
    if (!MG.finePointer() || MG.reducedMotion()) return
    $$(scope, '[data-magnetic]', 'magnetic').forEach(function (el) {
      var strength = Number(el.dataset.magnetic) || 0.25
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect()
        var x = e.clientX - (r.left + r.width / 2)
        var y = e.clientY - (r.top + r.height / 2)
        el.style.transform = 'translate(' + (x * strength).toFixed(1) + 'px,' + (y * strength).toFixed(1) + 'px)'
      })
      el.addEventListener('pointerleave', function () {
        el.style.transform = ''
      })
    })
  }

  /* ------------------------------------------------------------ marquee */
  function setupMarquee(scope) {
    $$(scope, '[data-marquee]', 'marquee').forEach(function (m) {
      if (m.dataset.marqueeReady) return
      var track = m.querySelector('.marquee-track')
      if (!track) return
      var clone = track.cloneNode(true)
      clone.setAttribute('aria-hidden', 'true')
      m.appendChild(clone)
      m.dataset.marqueeReady = '1'
    })
  }

  /* ----------------------------------------------------------- parallax */
  function setupParallax(scope) {
    if (MG.reducedMotion()) return
    var items = $$(scope, '[data-parallax]', 'parallax')
    if (!items.length) return
    var offsets = new WeakMap()
    var ticking = false
    var update = function () {
      var vh = window.innerHeight
      items.forEach(function (el) {
        var current = offsets.get(el) || 0
        var r = el.getBoundingClientRect()
        var top = r.top - current
        if (top > vh + 300 || top + r.height < -300) return
        var factor = Number(el.dataset.parallax) || 0.1
        var next = -(top + r.height / 2 - vh / 2) * factor
        offsets.set(el, next)
        el.style.translate = '0 ' + next.toFixed(1) + 'px'
      })
      ticking = false
    }
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return
        ticking = true
        requestAnimationFrame(update)
      },
      { passive: true }
    )
    update()
  }

  /* ------------------------------------------------------------- typing */
  function setupTyping(scope) {
    $$(scope, '[data-typing]', 'typing').forEach(function (el) {
      var phrases = JSON.parse(el.dataset.typing)
      var isField = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      var set = function (v) {
        if (isField) el.placeholder = v
        else el.textContent = v
      }
      if (MG.reducedMotion()) {
        set(phrases[0])
        return
      }
      var pi = 0
      var ci = 0
      var deleting = false
      var tick = function () {
        // 用户正在输入时暂停，不和真实输入抢占 placeholder
        if (isField && (document.activeElement === el || el.value)) {
          setTimeout(tick, 500)
          return
        }
        var phrase = phrases[pi]
        ci += deleting ? -1 : 1
        set(phrase.slice(0, ci))
        var delay = deleting ? 26 : 48 + Math.random() * 46
        if (!deleting && ci >= phrase.length) {
          deleting = true
          delay = 2000
        } else if (deleting && ci <= 0) {
          deleting = false
          pi = (pi + 1) % phrases.length
          delay = 360
        }
        setTimeout(tick, delay)
      }
      set('')
      MG.inView(el, function () {
        setTimeout(tick, 500)
      })
    })
  }

  /* ------------------------------------------------------------- inview */
  function setupInview(scope) {
    $$(scope, '[data-inview]', 'inview').forEach(function (el) {
      MG.inView(
        el,
        function (visible) {
          el.classList.toggle('is-inview', visible)
        },
        { once: false, threshold: 0, rootMargin: '120px 0px 120px 0px' }
      )
    })
  }

  /* ----------------------------------------------------- scroll progress */
  function setupProgress() {
    var bar = document.querySelector('[data-scroll-progress]')
    if (!bar) return
    var ticking = false
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight
      bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0).toFixed(4) + ')'
      ticking = false
    }
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return
        ticking = true
        requestAnimationFrame(update)
      },
      { passive: true }
    )
    update()
  }

  MG.init = function (scope) {
    var root = scope || document
    setupReveal(root)
    setupCount(root)
    setupSpotlight(root)
    setupTilt(root)
    setupMagnetic(root)
    setupMarquee(root)
    setupParallax(root)
    setupTyping(root)
    setupInview(root)
  }

  MG.init(document)
  setupProgress()
})()
