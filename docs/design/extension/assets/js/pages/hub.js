/*
 * index.html（设计中枢）页面脚本：
 *   - Hero 地图舞台 + 「一次采集」仪表循环（Pin → Scan → Rows → Export；离屏不重启，减弱动效直接给终态）
 *   - 界面缩略图：iframe 以 data-vw × data-vh 渲染（?embed=1 隐藏状态坞），按卡片宽度等比缩放
 *   - 图标总数实测、复制预览命令
 */
;(function () {
  var MG = window.MG
  var UI = window.UI
  var Proto = window.Proto

  /* --------------------------------------------------------- 地图舞台 + pin */
  var stage = document.querySelector('[data-hub-stage]')
  var mapHost = stage.querySelector('[data-hub-map]')
  var PINS = [
    [12, 26], [26, 18], [8, 52], [30, 44], [18, 70], [34, 78], [22, 34], [10, 86]
  ]
  mapHost.innerHTML =
    Proto.mapArt() +
    PINS.map(function (p, i) {
      return '<span class="hub-pin" style="--x:' + p[0] + '%;--y:' + p[1] + '%;--i:' + i + '"></span>'
    }).join('')
  var pins = mapHost.querySelectorAll('.hub-pin')

  /* ------------------------------------------------------------ 采集仪表 */
  var ins = document.querySelector('[data-instrument]')
  var statusEl = ins.querySelector('[data-ins-status]')
  var ring = ins.querySelector('[data-ins-ring]')
  var ringLabel = ins.querySelector('[data-ins-ring-label]')
  var countEl = ins.querySelector('[data-ins-count]')
  var steps = ins.querySelectorAll('.flow-step')
  var rowsEl = ins.querySelector('[data-ins-rows]')
  var bar = ins.querySelector('[data-ins-progress]')
  var morph = ins.querySelector('[data-ins-btn] .morph')
  var TOTAL = 48
  var token = 0
  var visible = false
  var running = false

  var setStatus = function (kind, text) {
    statusEl.className = 'status status--' + kind
    statusEl.textContent = text
  }
  var setStep = function (active) {
    steps.forEach(function (s, i) {
      s.classList.toggle('is-done', i < active)
      s.classList.toggle('is-active', i === active)
    })
  }
  var setCount = function (n, instant) {
    var p = (n / TOTAL) * 100
    ring.style.setProperty('--p', p)
    bar.style.setProperty('--p', p)
    MG.roll(countEl, n, { instant: instant })
  }
  var rowHTML = function (place) {
    return (
      '<div class="hub-ins-row">' + UI.icon('check') +
      '<b>' + place.name + '</b><span class="mono">' + place.rating.toFixed(1) + ' · ' + MG.formatNumber(place.reviews) + '</span></div>'
    )
  }
  var addRow = function (i) {
    rowsEl.insertAdjacentHTML('afterbegin', rowHTML(Proto.places[i % Proto.places.length]))
    while (rowsEl.children.length > 3) rowsEl.lastElementChild.remove()
  }
  var setDone = function (done) {
    ring.classList.toggle('is-done', done)
    ring.classList.toggle('tone-ok', done)
    bar.classList.toggle('tone-ok', done)
    ringLabel.innerHTML = done ? UI.icon('check') : UI.icon('pin')
  }

  var finalState = function () {
    token++
    running = false
    setStatus('completed', 'Completed')
    setStep(4)
    ring.classList.remove('is-empty', 'is-live')
    bar.classList.remove('is-live')
    setDone(true)
    setCount(TOTAL, true)
    rowsEl.innerHTML = ''
    for (var i = 0; i < 3; i++) addRow(i)
    UI.morph(morph, 'done')
    pins.forEach(function (p) {
      p.classList.add('is-collected')
    })
  }

  var run = function () {
    var my = ++token
    running = true
    var at = function (ms, fn) {
      setTimeout(function () {
        if (my === token) fn()
      }, ms)
    }
    // 复位：Ready
    setStatus('idle', 'Ready')
    setStep(0)
    ring.classList.add('is-empty')
    ring.classList.remove('is-live')
    setDone(false)
    bar.classList.remove('is-live')
    rowsEl.innerHTML = ''
    setCount(0, true)
    UI.morph(morph, 'start')
    pins.forEach(function (p) {
      p.classList.remove('is-collected')
    })

    // Scan：计数滚动，每 6 条入列一行、点亮一个 pin
    at(1300, function () {
      setStatus('extracting', 'Extracting')
      setStep(1)
      ring.classList.remove('is-empty')
      ring.classList.add('is-live')
      ringLabel.innerHTML = UI.icon('scan')
      bar.classList.add('is-live')
      UI.morph(morph, 'run')
      var n = 0
      var added = 0
      var tick = function () {
        if (my !== token) return
        n = Math.min(TOTAL, n + (Math.random() < 0.35 ? 2 : 1))
        setCount(n)
        if (n >= 10) setStep(2)
        // 每 6 条入列一行（最多显示 3 行）、点亮一个 pin
        if (Math.floor(n / 6) > added && added < pins.length) {
          addRow(added)
          pins[added].classList.add('is-collected')
          added++
        }
        if (n < TOTAL) {
          setTimeout(tick, 120)
          return
        }
        // Export
        ring.classList.remove('is-live')
        bar.classList.remove('is-live')
        setDone(true)
        setStatus('completed', 'Completed')
        setStep(3)
        UI.morph(morph, 'export')
        at(1400, function () {
          UI.morph(morph, 'done')
          setStep(4)
        })
        at(4600, function () {
          if (visible) run()
          else running = false
        })
      }
      setTimeout(tick, 200)
    })
  }

  var start = function () {
    if (MG.reducedMotion()) finalState()
    else if (!running) run()
  }

  MG.inView(
    stage,
    function (isVisible) {
      visible = isVisible
      if (isVisible) start()
    },
    { once: false, threshold: 0.3 }
  )
  MG.onMotionChange(function (reduced) {
    if (reduced) finalState()
    else if (visible) run()
  })

  /* --------------------------------------------------------- 实时缩略图 */
  document.querySelectorAll('.hub-thumb iframe').forEach(function (frame) {
    var vw = Number(frame.dataset.vw || 1440)
    var vh = Number(frame.dataset.vh || 900)
    var thumb = frame.parentElement
    frame.style.setProperty('--vw', vw + 'px')
    frame.style.setProperty('--vh', vh + 'px')
    var fit = function () {
      frame.style.setProperty('--s', Math.max(thumb.clientWidth / vw, thumb.clientHeight / vh))
    }
    fit()
    if (window.ResizeObserver) new ResizeObserver(fit).observe(thumb)
    frame.addEventListener('load', function () {
      syncFrameTheme(frame)
    })
  })

  /* 缩略图跟随中枢主题：?theme= 只作用于本页，同源 iframe 直接同步 data-theme */
  function syncFrameTheme(frame) {
    var doc = frame.contentDocument
    if (!doc) return
    var mode = MG.theme.mode()
    if (mode === 'system') doc.documentElement.removeAttribute('data-theme')
    else doc.documentElement.setAttribute('data-theme', mode)
  }
  document.addEventListener('mg:theme', function () {
    document.querySelectorAll('.hub-thumb iframe').forEach(syncFrameTheme)
  })

  /* ------------------------------------------------------------ 杂项 */
  var iconTotal = document.querySelector('[data-icon-total]')
  fetch('assets/img/icons.svg')
    .then(function (res) {
      return res.text()
    })
    .then(function (svg) {
      iconTotal.textContent = (svg.match(/<symbol\b/g) || []).length
    })

  var copyBtn = document.querySelector('[data-copy-cmd]')
  copyBtn.addEventListener('click', function () {
    var text = 'cd docs/design/extension\npython3 -m http.server 7691 --bind 127.0.0.1'
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {})
    UI.toast({ title: 'Command copied', tone: 'ok', icon: 'copy' })
  })

  var top = document.querySelector('.hub-top')
  var onScroll = function () {
    top.classList.toggle('is-scrolled', window.scrollY > 8)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})()
