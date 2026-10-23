/*
 * Online Scraper 页动画与交互：
 *   ① Hero 剧场：Dashboard 输入关键词 → Start scraping → 历史列表新任务 Processing（关键词并行完成）
 *      → Completed 后按实际交付行数计量 → 下载整任务 CSV（三组任务循环）
 *   ③ 流程轨道：五步依次高亮
 *   ④ 三种创建模式：关键词去空行/去重计数；地图采样（与 website 的 gridViewports 同一算法，
 *      关键词数 × 点数 ≤ 50，超限阻止不截断）；地区批量（`${base} ${in|near} ${place}` 生成查询词）
 *   ⑤ 结果 CSV：第二行字段说明按创建任务的语言切换（取自 backend provider/export/gmap_columns.py 的 GMAP_DESCRIPTIONS）
 *   ⑦ 计量：提交不预扣，完成后按交付行计量；运行中任务可超额，exhausted 后不能再提交
 * 原型数据均为虚构（任务号为随机十六进制，商户与关键词为示例）。
 */
;(function () {
  var MG = window.MG
  var icon = window.MGChrome.icon
  var reduced = MG.reducedMotion()

  // 可见性门控：离屏或页面隐藏时，循环停在下一个 nap 处，回到视口继续
  var gate = function (el, threshold) {
    var on = false
    var waiters = []
    var flush = function () {
      waiters.splice(0).forEach(function (fn) {
        fn()
      })
    }
    MG.inView(
      el,
      function (v) {
        on = v
        if (v) flush()
      },
      { once: false, threshold: threshold == null ? 0.15 : threshold, rootMargin: '0px' }
    )
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && on) flush()
    })
    var wait = function () {
      return on && !document.hidden
        ? Promise.resolve()
        : new Promise(function (resolve) {
            waiters.push(resolve)
          })
    }
    return {
      visible: function () {
        return on
      },
      wait: wait,
      nap: function (ms) {
        return MG.wait(ms).then(wait)
      }
    }
  }

  var fmt = function (n) {
    return MG.formatNumber(n, 0)
  }

  var shortNo = function (no) {
    return no.slice(0, 6) + '…'
  }

  // 数字从 from 滚到 to（减弱动效直接终值）
  var countTo = function (el, from, to, ms) {
    if (reduced) {
      el.textContent = fmt(to)
      return Promise.resolve()
    }
    return MG.tween(ms || 700, function (t) {
      el.textContent = fmt(Math.round(from + (to - from) * t))
    }, MG.ease.outCubic)
  }

  /* =====================================================================
     ① Hero 剧场
     ===================================================================== */
  var RUNS = [
    {
      no: '7c41e2d98b0f4a6c9e15d3a27b8f60c400',
      items: [['coffee shop in Portland', 46, 1500], ['bakery in Seattle', 31, 2600], ['florist in Denver', 18, 2000]]
    },
    {
      no: 'e3a90b5f1d2c47e8a6b4f09c8d71e2a500',
      items: [['dentist in Austin, TX', 58, 2300], ['plumber in Chicago', 64, 1400], ['yoga studio in Brooklyn', 41, 2900], ['car wash in Phoenix', 27, 1900]]
    },
    {
      no: '1f8d6c3b92e04a57b8c1d4e6f0a9b37200',
      items: [['hotels in Miami Beach', 73, 2400], ['bike shop in Boulder', 12, 1300]]
    }
  ]
  var PLAN_TOTAL = 80000

  var hero = document.querySelector('[data-oh]')
  if (hero) {
    var hg = gate(hero, 0.12)
    var $ = function (sel) {
      return hero.querySelector(sel)
    }
    var kw = $('[data-oh-kw]')
    var countEl = $('[data-oh-count]')
    var submit = $('[data-oh-submit]')
    var usedEl = $('[data-oh-used]')
    var usageBar = $('[data-oh-usage]')
    var rowsEl = $('[data-oh-rows]')
    var refresh = hero.querySelector('.oh-refresh')
    var dl = $('[data-oh-dl]')
    var dlpop = $('[data-oh-dlpop]')
    var fileEl = $('[data-oh-file]')
    var used = 12480

    var setUsage = function (n) {
      usageBar.style.setProperty('--p', ((n / PLAN_TOTAL) * 100).toFixed(2) + '%')
    }

    var buildTask = function (run) {
      var task = document.createElement('div')
      task.className = 'oh-task'
      task.innerHTML =
        '<div class="oh-tr">' +
        '<span class="mono oh-no">' + shortNo(run.no) + '</span>' +
        '<span class="mono">' + run.items.length + '</span>' +
        '<span class="mono" data-p>0 / ' + run.items.length + '</span>' +
        '<span class="mono" data-r>0</span>' +
        '<span class="oh-status"><span class="badge badge--ai" data-s>Processing</span></span>' +
        '</div><div class="oh-detail"></div>'
      var detail = task.querySelector('.oh-detail')
      run.items.forEach(function (it, i) {
        var item = document.createElement('div')
        item.className = 'oh-item'
        item.style.setProperty('--i', i)
        item.innerHTML =
          '<span class="oh-item-kw mono"></span>' +
          '<span class="oh-item-state"><span class="oh-bar"></span><span class="oh-item-rec mono">' + icon('check') + '<span data-n>0</span></span></span>' +
          '<span class="oh-csv">Completed</span>'
        item.querySelector('.oh-item-kw').textContent = it[0]
        detail.appendChild(item)
      })
      return task
    }

    var completeTask = function (task, run) {
      var status = task.querySelector('.oh-status')
      status.innerHTML = '<span class="badge badge--ok">Completed</span><span class="oh-zip">' + icon('file-sheet') + 'CSV</span>'
    }

    var typeLine = async function (text, alive) {
      var line = document.createElement('div')
      kw.appendChild(line)
      line.classList.add('is-typing')
      for (var i = 1; i <= text.length; i++) {
        if (!alive()) return
        line.textContent = text.slice(0, i)
        await hg.nap(22 + Math.random() * 26)
      }
      line.classList.remove('is-typing')
    }

    var runId = 0
    var play = async function (run, id) {
      var alive = function () {
        return id === runId
      }
      await hg.wait()
      kw.innerHTML = ''
      countEl.textContent = '0'
      kw.classList.add('is-focus')
      await hg.nap(400)
      for (var i = 0; i < run.items.length; i++) {
        await typeLine(run.items[i][0], alive)
        if (!alive()) return
        countEl.textContent = i + 1
        await hg.nap(160)
      }
      kw.classList.remove('is-focus')
      await hg.nap(450)
      if (!alive()) return

      // 提交：按下 → Submitting... → 成功后清空输入并刷新历史第一页
      submit.classList.add('is-pressed')
      await hg.nap(150)
      submit.classList.remove('is-pressed')
      submit.innerHTML = '<span class="spinner"></span>Submitting...'
      await hg.nap(750)
      if (!alive()) return
      submit.textContent = 'Start scraping'
      kw.innerHTML = ''
      countEl.textContent = '0'
      refresh.classList.remove('is-spin')
      void refresh.offsetWidth
      refresh.classList.add('is-spin')

      var task = buildTask(run)
      task.classList.add('is-new')
      rowsEl.insertBefore(task, rowsEl.firstChild)
      while (rowsEl.children.length > 3) rowsEl.lastChild.remove()
      var pEl = task.querySelector('[data-p]')
      var rEl = task.querySelector('[data-r]')
      var items = task.querySelectorAll('.oh-item')

      // 关键词之间并行：各自按自己的耗时完成（完成顺序与输入顺序无关）
      var processed = 0
      var records = 0
      await Promise.all(
        run.items.map(function (it, i) {
          return hg.nap(it[2]).then(function () {
            if (!alive()) return
            items[i].classList.add('is-done')
            countTo(items[i].querySelector('[data-n]'), 0, it[1], 500)
            processed++
            pEl.textContent = processed + ' / ' + run.items.length
            var before = records
            records += it[1]
            countTo(rEl, before, records, 500)
          })
        })
      )
      if (!alive()) return
      await hg.nap(500)

      // 全部收口并完成实际用量计量后进入 Completed：用量此时才增加（提交时不预扣）
      completeTask(task, run)
      var before = used
      used += records
      setUsage(used)
      countTo(usedEl, before, used, 900)
      await hg.nap(1000)
      if (!alive()) return

      var zip = task.querySelector('.oh-zip')
      zip.classList.add('is-ready')
      await hg.nap(1200)
      if (!alive()) return
      zip.classList.remove('is-ready')
      zip.classList.add('is-pressed')
      await hg.nap(160)
      zip.classList.remove('is-pressed')
      fileEl.textContent = run.no + '.csv'
      dl.classList.add('is-on')
      await hg.nap(60)
      dl.classList.add('is-done')
      await hg.nap(900)
      if (!alive()) return
      dlpop.classList.add('is-on')
      await hg.nap(2600)
      if (!alive()) return
      dlpop.classList.remove('is-on')
      dl.classList.remove('is-on', 'is-done')
      // 收起明细，变回普通历史行
      var detail = task.querySelector('.oh-detail')
      if (detail) detail.remove()
      task.classList.remove('is-new')
      await hg.nap(900)
    }

    setUsage(used)
    if (reduced) {
      // 减弱动效：第一组任务的完成态静帧
      var r0 = RUNS[0]
      var t0 = buildTask(r0)
      var sum = 0
      t0.querySelectorAll('.oh-item').forEach(function (item, i) {
        item.classList.add('is-done')
        item.querySelector('[data-n]').textContent = r0.items[i][1]
        sum += r0.items[i][1]
      })
      t0.querySelector('[data-p]').textContent = r0.items.length + ' / ' + r0.items.length
      t0.querySelector('[data-r]').textContent = sum
      completeTask(t0, r0)
      rowsEl.insertBefore(t0, rowsEl.firstChild)
      used += sum
      usedEl.textContent = fmt(used)
      setUsage(used)
    } else {
      ;(async function () {
        var id = ++runId
        for (var k = 0; ; k++) {
          await play(RUNS[k % RUNS.length], id)
        }
      })()
    }
  }

  /* =====================================================================
     ③ 流程轨道：五步依次高亮
     ===================================================================== */
  var rail = document.querySelector('[data-of]')
  if (rail && !reduced) {
    var steps = rail.querySelectorAll('.of-step')
    var fg = gate(rail, 0.3)
    ;(async function () {
      for (var i = 0; ; i = (i + 1) % steps.length) {
        await fg.wait()
        steps.forEach(function (s, j) {
          s.classList.toggle('is-active', j === i)
        })
        await fg.nap(2400)
      }
    })()
  }

  /* =====================================================================
     ④ 三种创建模式
     ===================================================================== */
  var modes = document.querySelector('.om[data-tabs]')
  if (modes) {
    var NOTES = {
      keywords: 'One keyword per line, up to your plan’s limit',
      map: 'Sample a circle around a center point',
      regions: 'Countries, states and cities from GeoNames'
    }
    var noteEl = modes.querySelector('[data-om-note]')
    var mg = gate(modes, 0.2)
    var panelOn = function (el) {
      return !el.closest('[role="tabpanel"]').hidden
    }
    // 面板可见且在视口内才推进演示
    var waitPanel = async function (el) {
      for (;;) {
        await mg.wait()
        if (panelOn(el)) return
        await MG.wait(400)
      }
    }
    var listeners = []
    modes.addEventListener('tabchange', function (e) {
      noteEl.textContent = NOTES[e.detail.key]
      listeners.forEach(function (fn) {
        fn(e.detail.key)
      })
    })

    /* ---------- 4.1 关键词：去空行与重复后计数 ---------- */
    var omk = modes.querySelector('[data-omk]')
    if (omk) {
      var linesEl = omk.querySelector('[data-omk-lines]')
      var kCount = omk.querySelector('[data-omk-count]')
      var KW_LINES = ['coffee shop in Portland', 'restaurant in Austin', '', 'coffee shop in Portland', 'dentist in Miami', 'florist in Denver']
      var LIMIT = 10
      var kwRun = 0

      var addLine = function (text, i) {
        var li = document.createElement('li')
        li.className = 'is-new'
        li.style.setProperty('--i', 0)
        li.innerHTML = '<span></span><em></em>'
        li.firstChild.textContent = text
        linesEl.appendChild(li)
        return li
      }

      // 与真实表单一致：去首尾空白、去空行、按出现顺序去重
      var judge = function (li, text, seen) {
        var t = text.trim()
        if (!t) {
          li.classList.add('is-skip')
          li.lastChild.textContent = 'Blank line · skipped'
        } else if (seen[t]) {
          li.classList.add('is-skip')
          li.lastChild.textContent = 'Duplicate · skipped'
        } else {
          seen[t] = true
        }
        return Object.keys(seen).length
      }

      var playKw = async function () {
        var id = ++kwRun
        linesEl.innerHTML = ''
        kCount.textContent = '0 / ' + LIMIT + ' keywords'
        var seen = {}
        for (var i = 0; i < KW_LINES.length; i++) {
          if (!reduced) await waitPanel(omk)
          if (id !== kwRun) return
          var li = addLine(KW_LINES[i], i)
          if (!reduced) await MG.wait(380)
          var n = judge(li, KW_LINES[i], seen)
          kCount.textContent = n + ' / ' + LIMIT + ' keywords'
        }
      }

      listeners.push(function (key) {
        if (key === 'keywords') playKw()
      })
      if (panelOn(omk)) playKw()
    }

    /* ---------- 4.2 地图：中心 + 半径 + 网格间距 ---------- */
    var omm = modes.querySelector('[data-omm]')
    if (omm) {
      var stage = omm.querySelector('.om-stage')
      var art = omm.querySelector('[data-omm-art]')
      var cover = omm.querySelector('[data-omm-cover]')
      var scan = omm.querySelector('[data-omm-scan]')
      var dotsG = omm.querySelector('[data-omm-dots]')
      var scaleBar = omm.querySelector('[data-omm-scale]')
      var scaleLabel = omm.querySelector('[data-omm-scale-label]')
      var radiusIn = omm.querySelector('[data-omm-radius]')
      var spacingIn = omm.querySelector('[data-omm-spacing]')
      var rv = omm.querySelector('[data-omm-rv]')
      var sv = omm.querySelector('[data-omm-sv]')
      var readout = omm.querySelector('[data-omm-readout]')
      var countOut = omm.querySelector('[data-omm-count]')
      var pOut = omm.querySelector('[data-omm-p]')
      var meter = omm.querySelector('[data-omm-meter]')
      var errorEl = omm.querySelector('[data-omm-error]')
      var submitEl = omm.querySelector('[data-omm-submit]')
      var KEYWORDS = 2
      var SAMPLE_LIMIT = 50
      var NS = 'http://www.w3.org/2000/svg'
      var lastKey = ''

      // 与 website/src/scripts/dashboard/map-grid.ts 相同：圆内网格点，按距离由近及远（同距按 dy、dx）
      var gridPoints = function (radius, spacing) {
        var steps = Math.floor(radius / spacing)
        var pts = []
        for (var dy = -steps; dy <= steps; dy++) {
          for (var dx = -steps; dx <= steps; dx++) {
            var d = Math.hypot(dx, dy)
            if (d * spacing > radius + 1e-9) continue
            pts.push({ dx: dx, dy: dy, d: d })
          }
        }
        pts.sort(function (a, b) {
          return a.d - b.d || a.dy - b.dy || a.dx - b.dx
        })
        return pts
      }

      var fill = function (input) {
        var min = Number(input.min)
        var max = Number(input.max)
        input.style.setProperty('--fill', ((Number(input.value) - min) / (max - min)) * 100 + '%')
      }

      var NICE = [1, 2, 5, 10, 20, 50]
      var render = function (animate) {
        var r = Number(radiusIn.value)
        var sp = Number(spacingIn.value)
        rv.textContent = r
        sv.textContent = sp
        fill(radiusIn)
        fill(spacingIn)
        var pts = gridPoints(r, sp)
        var count = KEYWORDS * pts.length
        var over = count > SAMPLE_LIMIT

        // 比例：半径 ≥ 3 km 时覆盖圆保持 150 单位，地图底图随之缩放（类似 setView）
        var s = 150 / Math.max(r, 3)
        art.style.transform = 'scale(' + (s / 15).toFixed(4) + ')'
        cover.setAttribute('r', (r * s).toFixed(2))
        cover.style.r = (r * s).toFixed(2) + 'px'
        scan.setAttribute('r', Math.max(r * s, 8).toFixed(2))

        // 比例尺：挑一个落在 40–110 屏幕像素之间的整数距离
        var px = stage.getBoundingClientRect().width / 400 || 1
        var nice = NICE[0]
        for (var i = 0; i < NICE.length; i++) {
          if (NICE[i] * s * px <= 110) nice = NICE[i]
        }
        scaleBar.style.setProperty('--w', Math.round(nice * s * px) + 'px')
        scaleLabel.textContent = nice + ' km'

        countOut.textContent = count
        pOut.textContent = pts.length
        meter.style.setProperty('--p', Math.min(100, (count / SAMPLE_LIMIT) * 100) + '%')
        readout.classList.toggle('is-over', over)
        stage.classList.toggle('is-over', over)
        errorEl.hidden = !over
        submitEl.classList.toggle('is-disabled', over)

        // 超限时真实地图不绘制采样点；未超限时按由近及远的顺序逐个出现
        var key = r + '/' + sp
        if (over) {
          dotsG.classList.add('om-dots-out')
        } else if (key !== lastKey || dotsG.classList.contains('om-dots-out')) {
          dotsG.classList.remove('om-dots-out')
          dotsG.innerHTML = ''
          pts.forEach(function (p, idx) {
            var c = document.createElementNS(NS, 'circle')
            c.setAttribute('class', 'om-dot')
            c.setAttribute('cx', (200 + p.dx * sp * s).toFixed(2))
            c.setAttribute('cy', (200 + p.dy * sp * s).toFixed(2))
            c.setAttribute('r', '4.5')
            c.style.setProperty('--i', animate ? idx : 0)
            dotsG.appendChild(c)
          })
        }
        lastKey = key
        if (animate && !reduced) {
          scan.classList.remove('is-on')
          void scan.getBoundingClientRect()
          scan.classList.add('is-on')
        }
      }

      var touched = false
      var touch = function () {
        touched = true
      }
      ;[radiusIn, spacingIn].forEach(function (input) {
        input.addEventListener('input', function () {
          touch()
          render(true)
        })
        input.addEventListener('pointerdown', touch)
        input.addEventListener('keydown', touch)
      })
      window.addEventListener('resize', function () {
        render(false)
      })
      render(false)

      // 自动演示：正常 → 缩小 → 超限被阻止 → 加大间距恢复 → 回到默认；用户一操作就停止
      if (!reduced) {
        var DEMO = [[10, 5], [5, 5], [15, 5], [15, 8], [10, 5]]
        ;(async function () {
          for (var i = 0; ; i = (i + 1) % DEMO.length) {
            await waitPanel(omm)
            if (touched) return
            radiusIn.value = DEMO[i][0]
            spacingIn.value = DEMO[i][1]
            render(true)
            await MG.wait(3000)
          }
        })()
      }
    }

    /* ---------- 4.3 地区：国家 / 州 / 城市 → 最终查询词 ---------- */
    var omr = modes.querySelector('[data-omr]')
    if (omr) {
      var placesEl = omr.querySelector('[data-omr-places]')
      var nextEl = omr.querySelector('[data-omr-next]')
      var addBtn = omr.querySelector('[data-omr-add]')
      var genBtn = omr.querySelector('[data-omr-generate]')
      var queriesEl = omr.querySelector('[data-omr-queries]')
      var qCount = omr.querySelector('[data-omr-count]')
      var qError = omr.querySelector('[data-omr-error]')
      var modeBtns = omr.querySelectorAll('[data-omr-mode]')
      var BASES = ['dentist', 'plumber']
      var CITIES = ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso']
      var Q_LIMIT = 10
      var places = []
      var phrasing = 'in'
      var cursor = 0
      var userTouched = false

      var nextCity = function () {
        for (var i = 0; i < CITIES.length; i++) {
          var c = CITIES[(cursor + i) % CITIES.length]
          if (places.indexOf(c) < 0) return c
        }
        return null
      }

      var renderPlaces = function () {
        placesEl.innerHTML = ''
        places.forEach(function (city) {
          var chip = document.createElement('span')
          chip.className = 'om-place'
          chip.innerHTML = '<span></span><button type="button">' + icon('x') + '</button>'
          // 真实城市标签：城市, 州, 国家代码
          chip.firstChild.textContent = city + ', Texas, US'
          chip.lastChild.setAttribute('aria-label', 'Remove ' + city + ', Texas, US')
          chip.lastChild.addEventListener('click', function () {
            userTouched = true
            places.splice(places.indexOf(city), 1)
            renderPlaces()
          })
          placesEl.appendChild(chip)
        })
        var n = nextCity()
        nextEl.textContent = n || '—'
        addBtn.disabled = !n
      }

      var add = function () {
        var c = nextCity()
        if (!c) return
        places.push(c)
        cursor = (CITIES.indexOf(c) + 1) % CITIES.length
        renderPlaces()
      }

      var setPhrasing = function (mode) {
        phrasing = mode
        modeBtns.forEach(function (b) {
          b.setAttribute('aria-checked', String(b.dataset.omrMode === mode))
        })
      }

      // 与真实组件一致：每个基础词 × 每个地点，`${base} ${in|near} ${place}`
      var generate = function () {
        var qs = []
        BASES.forEach(function (base) {
          places.forEach(function (city) {
            qs.push(base + ' ' + phrasing + ' ' + city + ', Texas, US')
          })
        })
        queriesEl.innerHTML = ''
        qs.forEach(function (q, i) {
          var li = document.createElement('li')
          li.style.setProperty('--i', i)
          li.innerHTML = '<span></span>'
          li.firstChild.textContent = q
          queriesEl.appendChild(li)
        })
        qCount.textContent = qs.length + ' / ' + Q_LIMIT + ' keywords'
        var over = qs.length > Q_LIMIT
        qError.hidden = !over
        qCount.style.color = over ? 'var(--warn)' : ''
      }

      var press = async function (btn) {
        btn.classList.add('is-pressed')
        await MG.wait(150)
        btn.classList.remove('is-pressed')
      }

      addBtn.addEventListener('click', function () {
        userTouched = true
        add()
      })
      genBtn.addEventListener('click', function () {
        userTouched = true
        generate()
      })
      modeBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          userTouched = true
          setPhrasing(b.dataset.omrMode)
        })
      })

      var resetRegions = function () {
        places = []
        cursor = 0
        setPhrasing('in')
        queriesEl.innerHTML = ''
        qCount.textContent = '0 / ' + Q_LIMIT + ' keywords'
        qCount.style.color = ''
        qError.hidden = true
        renderPlaces()
      }

      if (reduced) {
        resetRegions()
        add()
        add()
        add()
        generate()
      } else {
        resetRegions()
        // 自动演示：逐个添加城市 → Generate queries；用户一操作就停止
        ;(async function () {
          for (;;) {
            await waitPanel(omr)
            if (userTouched) return
            resetRegions()
            for (var i = 0; i < 3; i++) {
              await MG.wait(700)
              await waitPanel(omr)
              if (userTouched) return
              await press(addBtn)
              add()
            }
            await MG.wait(800)
            if (userTouched) return
            await press(genBtn)
            generate()
            await MG.wait(5200)
          }
        })()
      }
    }
  }

  /* =====================================================================
     ⑤ 结果 CSV：第二行译名随任务语言切换
     ===================================================================== */
  var sheet = document.querySelector('[data-oc]')
  if (sheet) {
    // 字段说明逐字取自 backend/src/app/provider/export/gmap_columns.py 的 GMAP_DESCRIPTIONS
    // 列顺序：# / Name / Fulladdress / Categories / Phone / Review Count / Average Rating / Website / Emails / Search Keyword
    var LANGS = [
      ['en-US', 'English', ['Row number', 'Business name', 'Full address', 'Business categories', 'Primary phone', 'Number of reviews', 'Average review rating', 'Business website', 'Public website emails', 'Search keyword']],
      ['es-ES', 'Español', ['Número de fila', 'Nombre del negocio', 'Dirección completa', 'Categorías del negocio', 'Teléfono principal', 'Número de reseñas', 'Valoración media', 'Sitio web del negocio', 'Correos públicos del sitio', 'Palabra clave de búsqueda']],
      ['de-DE', 'Deutsch', ['Zeilennummer', 'Unternehmensname', 'Vollständige Adresse', 'Unternehmenskategorien', 'Haupttelefonnummer', 'Anzahl der Bewertungen', 'Durchschnittliche Bewertung', 'Unternehmenswebsite', 'Öffentliche Website-E-Mails', 'Suchbegriff']],
      ['fr-FR', 'Français', ['Numéro de ligne', "Nom de l'établissement", 'Adresse complète', 'Catégories', 'Téléphone principal', "Nombre d'avis", 'Note moyenne', "Site de l'établissement", 'E-mails publics du site', 'Mot-clé recherché']],
      ['pt-BR', 'Português', ['Número da linha', 'Nome da empresa', 'Endereço completo', 'Categorias', 'Telefone principal', 'Quantidade de avaliações', 'Nota média', 'Site da empresa', 'Emails públicos do site', 'Palavra-chave pesquisada']],
      ['ja-JP', '日本語', ['行番号', '店舗名', '住所全体', '業種', '代表電話番号', '口コミ件数', '平均評価', '公式サイト', '公式サイトの公開メール', '検索キーワード']],
      ['ko-KR', '한국어', ['행 번호', '업체명', '전체 주소', '업체 카테고리', '대표 전화', '리뷰 수', '평균 평점', '업체 웹사이트', '사이트 공개 이메일', '검색 키워드']],
      ['zh-CN', '简体中文', ['行序号', '商家名称', '完整地址', '商家类别', '主要电话', '评论数量', '平均评分', '商家官网', '官网公开邮箱', '搜索关键词']]
    ]
    var langsEl = sheet.querySelector('[data-oc-langs]')
    var labelCells = Array.prototype.slice.call(sheet.querySelectorAll('[data-oc-labels] td:not(.oc-rn)'))
    var current = 0
    var picked = false
    var buttons = LANGS.map(function (lang, i) {
      var b = document.createElement('button')
      b.type = 'button'
      b.lang = lang[0]
      b.textContent = lang[1]
      b.setAttribute('aria-pressed', String(i === 0))
      b.addEventListener('click', function () {
        picked = true
        show(i)
      })
      langsEl.appendChild(b)
      return b
    })

    var show = function (i) {
      current = i
      buttons.forEach(function (b, j) {
        b.setAttribute('aria-pressed', String(j === i))
      })
      labelCells.forEach(function (td, j) {
        td.textContent = LANGS[i][2][j]
        td.lang = LANGS[i][0]
        if (!reduced) {
          td.classList.remove('is-flip')
          void td.offsetWidth
          td.style.animationDelay = j * 35 + 'ms'
          td.classList.add('is-flip')
        }
      })
    }

    if (!reduced) {
      var sg = gate(sheet, 0.35)
      ;(async function () {
        await sg.nap(1600)
        while (!picked) {
          show((current + 1) % LANGS.length)
          await sg.nap(2600)
        }
      })()
    }
  }

  /* =====================================================================
     ⑦ 计量演示（Free 档 1,000 records：正常计量 → 月末超出后 exhausted）
     ===================================================================== */
  var ou = document.querySelector('[data-ou]')
  if (ou) {
    var card = ou.querySelector('.ou-card')
    var q = function (sel) {
      return ou.querySelector(sel)
    }
    var usedOut = q('[data-ou-used]')
    var totalOut = q('[data-ou-total]')
    var planOut = q('[data-ou-plan]')
    var fillEl = q('[data-ou-fill]')
    var ghostEl = q('[data-ou-ghost]')
    var leftOut = q('[data-ou-left]')
    var taskOut = q('[data-ou-task]')
    var statusOut = q('[data-ou-status]')
    var itemsOut = q('[data-ou-items]')
    var noteOut = q('[data-ou-note]')
    var sumOut = q('[data-ou-sum]')
    var msgOut = q('[data-ou-msg]')
    var deltaOut = q('[data-ou-delta]')
    var TOTAL = 1000
    var PHASES = [
      { used: 120, no: '5d2b8e', items: [['coffee shop in Portland', 128, 1500], ['bakery in Seattle', 120, 2300]] },
      { used: 640, no: 'e3a90b', items: [['dentist in Austin, TX', 214, 1800], ['plumber in Chicago', 198, 2600]] }
    ]
    var MSG_RESET = 'Monthly quota resets on the 1st in New York time.'
    var MSG_EXHAUSTED = 'Your monthly quota is exhausted.'

    var pct = function (n) {
      return Math.min(100, (n / TOTAL) * 100).toFixed(2) + '%'
    }

    var setMeter = function (usedN, delivered) {
      fillEl.style.setProperty('--p', pct(usedN))
      ghostEl.style.setProperty('--p', pct(usedN))
      ghostEl.style.setProperty('--g', Math.max(0, Math.min(100, ((usedN + delivered) / TOTAL) * 100) - Math.min(100, (usedN / TOTAL) * 100)).toFixed(2) + '%')
      var left = TOTAL - usedN
      leftOut.textContent = left > 0 ? fmt(left) + ' left' : 'Quota exhausted'
      card.classList.toggle('is-over', usedN >= TOTAL)
    }

    var setupPhase = function (ph) {
      card.classList.remove('is-exhausted', 'is-over')
      planOut.textContent = 'Free'
      totalOut.textContent = fmt(TOTAL)
      usedOut.textContent = fmt(ph.used)
      setMeter(ph.used, 0)
      taskOut.textContent = 'Task ' + ph.no + '…'
      statusOut.className = 'badge badge--ai'
      statusOut.textContent = 'Processing'
      noteOut.textContent = 'Delivered so far · counted when the task completes'
      sumOut.textContent = '0'
      msgOut.textContent = MSG_RESET
      itemsOut.innerHTML = ''
      return ph.items.map(function (it) {
        var row = document.createElement('div')
        row.className = 'ou-item'
        row.innerHTML = '<span class="mono"></span><b class="mono"><span class="spinner"></span>Running</b>'
        row.firstChild.textContent = it[0]
        itemsOut.appendChild(row)
        return row
      })
    }

    var finishItem = function (row, n) {
      row.classList.add('is-done')
      row.lastChild.innerHTML = icon('check') + '<span>' + fmt(n) + ' rows</span>'
    }

    var meterPhase = function (ph, delivered) {
      var after = ph.used + delivered
      statusOut.className = 'badge badge--ok'
      statusOut.textContent = 'Completed'
      noteOut.textContent = 'Counted toward this month'
      setMeter(after, 0)
      countTo(usedOut, ph.used, after, 900)
      deltaOut.textContent = '+' + fmt(delivered) + ' records'
      if (!reduced) {
        deltaOut.classList.remove('is-on')
        void deltaOut.offsetWidth
        deltaOut.classList.add('is-on')
      }
      if (after >= TOTAL) {
        card.classList.add('is-exhausted')
        msgOut.textContent = MSG_EXHAUSTED
      }
    }

    if (reduced) {
      // 减弱动效：第二阶段（超出后 exhausted）的静帧，最能说明规则
      var ph1 = PHASES[1]
      var rows1 = setupPhase(ph1)
      var total1 = 0
      ph1.items.forEach(function (it, i) {
        finishItem(rows1[i], it[1])
        total1 += it[1]
      })
      sumOut.textContent = fmt(total1)
      meterPhase(ph1, total1)
    } else {
      var ug = gate(ou, 0.3)
      ;(async function () {
        for (var p = 0; ; p = (p + 1) % PHASES.length) {
          await ug.wait()
          var ph = PHASES[p]
          var rows = setupPhase(ph)
          await ug.nap(900)
          // 运行中：交付行只显示为条纹占位，不计入已用量
          var delivered = 0
          await Promise.all(
            ph.items.map(function (it, i) {
              return ug.nap(it[2]).then(function () {
                finishItem(rows[i], it[1])
                var before = delivered
                delivered += it[1]
                countTo(sumOut, before, delivered, 500)
                setMeter(ph.used, delivered)
              })
            })
          )
          await ug.nap(900)
          meterPhase(ph, delivered)
          await ug.nap(p === PHASES.length - 1 ? 4200 : 3000)
        }
      })()
    }
  }
})()
