/*
 * Extension 页动画：
 *   ① Hero 剧场：Maps 结果列表自动滚动 → 卡片被捕获 → 面板逐行入列 → Extract complete → 导出到浏览器下载（三组数据循环）
 *   ③ 视图卡片：搜索计数、商家页评论 / 照片计数、保存列表逐项打开
 *   ④ 能力展台：6 组能力自动轮播（进度条走完切下一项；悬停 / 聚焦暂停；离屏暂停）
 *   ⑤ 批量任务：任务名与关键词打字 → Start Extracting → 逐项状态 → 完成并自动导出（循环）
 *   ⑦ 安装区：tab 切换时同步说明文字
 * 导出文件名沿用真实插件格式 MapsGrab-Extractor-{行数}-{关键词}-{YYYY-MM-DD}.{ext}。
 * 原型数据均为虚构（555-01xx 号段、虚构商户名）。
 */
;(function () {
  var MG = window.MG
  var icon = window.MGChrome.icon
  var reduced = MG.reducedMotion()

  var pad2 = function (n) {
    return String(n).padStart(2, '0')
  }
  var today = function () {
    var d = new Date()
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
  }
  var exportName = function (rows, keyword, ext) {
    return 'MapsGrab-Extractor-' + rows + '-' + keyword.replace(/ /g, '+') + '-' + today() + '.' + ext
  }

  // 可见性门控：离屏时循环停在下一个 nap 处，回到视口继续
  var gate = function (el, threshold) {
    var on = false
    var waiters = []
    MG.inView(
      el,
      function (v) {
        on = v
        if (v) {
          waiters.splice(0).forEach(function (fn) {
            fn()
          })
        }
      },
      { once: false, threshold: threshold == null ? 0.15 : threshold, rootMargin: '0px' }
    )
    var wait = function () {
      return on && !document.hidden
        ? Promise.resolve()
        : new Promise(function (resolve) {
            waiters.push(resolve)
          })
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && on) {
        waiters.splice(0).forEach(function (fn) {
          fn()
        })
      }
    })
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

  /* =====================================================================
     ① Hero 剧场
     ===================================================================== */
  var SETS = [
    {
      q: 'bakery in Seattle',
      area: '206',
      cat: 'Bakery',
      icon: 'coffee',
      total: 24,
      items: [
        ['Pike Street Bakehouse', 4.8, 2031, '1420 Pike St', '6 PM', 28],
        ['Ballard Rye & Co.', 4.7, 864, '5311 Ballard Ave NW', '5 PM', 200],
        ['Capitol Crumb', 4.6, 512, '1517 E Olive Way', '7 PM', 340],
        ['Fremont Flour Works', 4.9, 1288, '3507 Fremont Ave N', '4 PM', 120],
        ['Queen Anne Pastry Lab', 4.5, 377, '2 Boston St', '6 PM', 46],
        ['Belltown Bread Club', 4.7, 693, '2407 1st Ave', '3 PM', 168],
        ['Wallingford Oven', 4.8, 941, '1815 N 45th St', '5 PM', 260],
        ['Georgetown Sourdough', 4.6, 288, '5900 Airport Way S', '2 PM', 14],
        ['Alki Morning Bakery', 4.4, 205, '2620 Alki Ave SW', '4 PM', 300],
        ['Green Lake Croissant Co.', 4.8, 1107, '7200 E Green Lake Dr N', '6 PM', 80]
      ]
    },
    {
      q: 'yoga studio in Brooklyn',
      area: '718',
      cat: 'Yoga studio',
      icon: 'users',
      total: 31,
      items: [
        ['Prospect Flow Studio', 4.9, 742, '214 Flatbush Ave', '9 PM', 190],
        ['Park Slope Yoga House', 4.8, 516, '377 5th Ave', '8 PM', 260],
        ['Williamsburg Breath Co.', 4.7, 398, '118 N 6th St', '9 PM', 320],
        ['DUMBO Stretch Lab', 4.6, 287, '55 Washington St', '8 PM', 210],
        ['Bushwick Vinyasa Room', 4.8, 466, '1037 Flushing Ave', '10 PM', 290],
        ['Greenpoint Mat Club', 4.7, 341, '879 Manhattan Ave', '9 PM', 170],
        ['Fort Greene Yoga Loft', 4.9, 603, '20 Lafayette Ave', '8 PM', 230],
        ['Cobble Hill Calm', 4.5, 222, '244 Court St', '7 PM', 150],
        ['Red Hook Yoga Barn', 4.8, 189, '300 Van Brunt St', '8 PM', 30],
        ['Bed-Stuy Balance', 4.7, 254, '1205 Fulton St', '9 PM', 340]
      ]
    },
    {
      q: 'florist in Denver',
      area: '303',
      cat: 'Florist',
      icon: 'sparkles',
      total: 19,
      items: [
        ['Larimer Stem & Petal', 4.9, 438, '1430 Larimer St', '6 PM', 330],
        ['RiNo Flower Bar', 4.8, 312, '2650 Walnut St', '7 PM', 300],
        ['Highlands Bloom Co.', 4.7, 276, '3301 W 32nd Ave', '6 PM', 120],
        ['Cherry Creek Florals', 4.6, 401, '2800 E 2nd Ave', '6 PM', 350],
        ['Wash Park Wildflower', 4.9, 188, '1090 S Gaylord St', '5 PM', 90],
        ['LoDo Petal Works', 4.5, 167, '1601 Wazee St', '6 PM', 10],
        ['Tennyson Garden Room', 4.8, 245, '4110 Tennyson St', '6 PM', 140],
        ['Baker District Blooms', 4.7, 199, '30 S Broadway', '7 PM', 280],
        ['Congress Park Posies', 4.6, 132, '1220 Josephine St', '5 PM', 40],
        ['Sloan Lake Stems', 4.8, 154, '4949 W 25th Ave', '6 PM', 200]
      ]
    }
  ]

  // 地图可见条带内的落点（面板停靠右侧，地图左侧约 30% 可见）
  var PIN_SPOTS = [[10, 18], [22, 30], [14, 44], [26, 56], [9, 66], [20, 76], [28, 22], [12, 86], [24, 40], [17, 60]]

  var stage = document.querySelector('[data-xh]')
  if (stage) {
    var hero = gate(stage, 0.12)
    var $ = function (sel) {
      return stage.querySelector(sel)
    }
    var track = $('[data-xh-track]')
    var query = $('[data-xh-query]')
    var url = $('[data-xh-url]')
    var pins = $('[data-xh-pins]')
    var panel = $('[data-xh-panel]')
    var stateEl = $('[data-xh-state]')
    var pill = $('[data-xh-pill]')
    var progress = $('[data-xh-progress]')
    var list = $('[data-xh-list]')
    var exportBtn = $('[data-xh-export]')
    var countEl = $('[data-xh-count]')
    var dl = $('[data-xh-dl]')
    var dlpop = $('[data-xh-dlpop]')
    var fileEl = $('[data-xh-file]')
    var kpi = {
      phone: $('[data-xh-kpi="phone"]'),
      site: $('[data-xh-kpi="site"]'),
      email: $('[data-xh-kpi="email"]')
    }
    var CARD_H = 100
    var runId = 0

    var phone = function (set, i) {
      return '+1 ' + set.area + '-555-01' + pad2((i * 13 + 21) % 100)
    }

    var buildCards = function (set) {
      track.innerHTML = ''
      set.items.forEach(function (it) {
        var card = document.createElement('div')
        card.className = 'xh-card'
        card.innerHTML =
          '<div class="xh-card-main">' +
          '<span class="xh-card-name"></span>' +
          '<span class="xh-card-rating">' + it[1].toFixed(1) + ' <span class="xh-stars" style="--r:' + it[1] + '"></span> (' + MG.formatNumber(it[2]) + ')</span>' +
          '<span class="xh-card-meta"></span>' +
          '<span class="xh-card-open"><b>Open</b> · Closes ' + it[4] + '</span>' +
          '</div>' +
          '<span class="xh-card-thumb" style="--h:' + it[5] + '"></span>' +
          '<span class="xh-card-check">' + icon('check') + '</span>'
        card.querySelector('.xh-card-name').textContent = it[0]
        card.querySelector('.xh-card-meta').textContent = set.cat + ' · ' + it[3]
        track.appendChild(card)
      })
      var end = document.createElement('div')
      end.className = 'xh-end'
      end.textContent = 'You’ve reached the end of the list.'
      track.appendChild(end)
    }

    var scrollTo = function (offset, animate) {
      var max = Math.max(0, track.scrollHeight - track.parentElement.clientHeight)
      track.classList.toggle('is-scrolling', animate !== false)
      track.style.transform = 'translate3d(0,' + -Math.min(offset, max) + 'px,0)'
    }

    var setKpis = function (count) {
      kpi.phone.textContent = Math.round(count * 0.96)
      kpi.site.textContent = Math.round(count * 0.83)
      kpi.email.textContent = Math.round(count * 0.62)
      countEl.textContent = count
    }

    // 面板三态：idle（Start Extracting）/ running（Extracting N… + Pause）/ done（Extract complete. + Reset）
    var setIdle = function () {
      panel.classList.remove('is-running', 'is-done')
      stateEl.innerHTML = '<span class="xh-start">' + icon('play') + 'Start Extracting</span>'
      pill.innerHTML = ''
    }
    var setRunning = function (n) {
      panel.classList.add('is-running')
      stateEl.innerHTML = '<span class="spinner"></span><span>Extracting <b data-xh-run>' + n + '</b>…</span>'
      pill.innerHTML = icon('pause') + 'Pause'
    }
    var setDone = function (n) {
      panel.classList.remove('is-running')
      panel.classList.add('is-done')
      stateEl.innerHTML = icon('check-circle') + '<span>Extract complete.</span>'
      pill.innerHTML = icon('refresh') + 'Reset'
      setKpis(n)
    }

    var addRow = function (set, i) {
      var it = set.items[i]
      var row = document.createElement('div')
      row.className = 'mgp-row is-new'
      row.innerHTML =
        '<span class="mgp-avatar">' + icon(set.icon) + '</span>' +
        '<div style="min-width:0"><div class="mgp-name"></div><div class="mgp-meta"></div></div>' +
        '<span class="rating">' + icon('star', 'icon--fill') + it[1].toFixed(1) + '</span>'
      row.querySelector('.mgp-name').textContent = it[0]
      row.querySelector('.mgp-meta').textContent = set.cat + ' · ' + phone(set, i)
      list.insertBefore(row, list.firstChild)
      while (list.children.length > 8) list.lastChild.remove()
      setTimeout(function () {
        row.classList.remove('is-new')
      }, 900)
    }

    var dropPin = function (i, instant) {
      var spot = PIN_SPOTS[i % PIN_SPOTS.length]
      var pin = document.createElement('i')
      pin.className = 'map-pin is-active' + (instant ? '' : ' is-dropped')
      pin.style.setProperty('--x', spot[0] + '%')
      pin.style.setProperty('--y', spot[1] + '%')
      if (!instant) pin.innerHTML = '<span class="pin-ring"></span>'
      pins.appendChild(pin)
    }

    var reset = function (set) {
      buildCards(set)
      scrollTo(0, false)
      list.innerHTML = ''
      pins.innerHTML = ''
      progress.style.setProperty('--p', '0%')
      setKpis(0)
      setIdle()
      exportBtn.classList.remove('is-ready', 'is-pressed')
      dl.classList.remove('is-on', 'is-done')
      dlpop.classList.remove('is-on')
      query.textContent = set.q
      url.textContent = 'google.com/maps/search/' + set.q.toLowerCase().replace(/ /g, '+')
    }

    var typeQuery = async function (text, alive) {
      query.textContent = ''
      query.classList.add('is-typing')
      for (var i = 1; i <= text.length; i++) {
        if (!alive()) return
        query.textContent = text.slice(0, i)
        await hero.nap(38 + Math.random() * 40)
      }
      query.classList.remove('is-typing')
    }

    var play = async function (set, id) {
      var alive = function () {
        return id === runId
      }
      await hero.wait()
      reset(set)
      await typeQuery(set.q, alive)
      await hero.nap(500)
      if (!alive()) return
      var start = stateEl.querySelector('.xh-start')
      if (start) start.classList.add('is-pressed')
      await hero.nap(320)
      if (!alive()) return
      setRunning(0)
      var cards = track.querySelectorAll('.xh-card')
      for (var i = 0; i < cards.length; i++) {
        if (!alive()) return
        cards[i].classList.add('is-captured')
        addRow(set, i)
        dropPin(i)
        var count = Math.round((set.total * (i + 1)) / cards.length)
        var run = stateEl.querySelector('[data-xh-run]')
        if (run) run.textContent = count
        progress.style.setProperty('--p', Math.round(((i + 1) / cards.length) * 100) + '%')
        setKpis(count)
        await hero.nap(560)
        if (!alive()) return
        // 自动滚动：保持当前捕获项在列表上部，到底时露出结束提示
        if (i >= 1) scrollTo((i - 0.4) * CARD_H)
        await hero.nap(260)
      }
      if (!alive()) return
      scrollTo(9999)
      setDone(set.total)
      exportBtn.classList.add('is-ready')
      await hero.nap(1300)
      if (!alive()) return
      exportBtn.classList.remove('is-ready')
      exportBtn.classList.add('is-pressed')
      await hero.nap(160)
      exportBtn.classList.remove('is-pressed')
      fileEl.textContent = exportName(set.total, set.q, 'csv')
      dl.classList.add('is-on')
      await hero.nap(60)
      dl.classList.add('is-done')
      await hero.nap(900)
      if (!alive()) return
      dlpop.classList.add('is-on')
      await hero.nap(2800)
      if (!alive()) return
      dlpop.classList.remove('is-on')
      pins.querySelectorAll('.map-pin').forEach(function (p) {
        p.classList.add('is-leaving')
      })
      await hero.nap(700)
    }

    if (reduced) {
      // 减弱动效：完成态静帧
      var s0 = SETS[0]
      reset(s0)
      s0.items.forEach(function (_, i) {
        track.children[i].classList.add('is-captured')
        if (i < 7) addRow(s0, 6 - i)
        dropPin(i, true)
      })
      list.querySelectorAll('.is-new').forEach(function (r) {
        r.classList.remove('is-new')
      })
      scrollTo(9999, false)
      progress.style.setProperty('--p', '100%')
      setDone(s0.total)
      fileEl.textContent = exportName(s0.total, s0.q, 'csv')
    } else {
      reset(SETS[0])
      ;(async function () {
        var id = ++runId
        var k = 0
        for (;;) {
          await play(SETS[k % SETS.length], id)
          k++
        }
      })()
    }
  }

  /* =====================================================================
     ③ 视图卡片：计数与保存列表逐项打开
     ===================================================================== */
  var views = document.querySelector('#views')
  if (views) {
    var counters = views.querySelectorAll('[data-xv-count]')
    var saved = views.querySelector('.xv-saved')
    var rows = saved ? Array.prototype.slice.call(saved.querySelectorAll('.xv-srow')) : []
    var hl = saved ? saved.querySelector('.xv-saved-hl') : null

    if (reduced) {
      rows.forEach(function (r) {
        r.classList.add('is-done')
      })
    } else {
      var vg = gate(views, 0.2)
      // 计数：从 0 涨到目标值后停留，再归零循环
      counters.forEach(function (el, n) {
        var target = Number(el.textContent)
        ;(async function () {
          for (;;) {
            await vg.wait()
            await MG.tween(4200 + n * 600, function (t) {
              el.textContent = Math.round(target * t)
            }, MG.ease.inOutCubic)
            await vg.nap(2200)
            el.textContent = '0'
            await vg.nap(400)
          }
        })()
      })
      // 保存列表：高亮逐行下移，打开过的行打勾
      ;(async function () {
        for (;;) {
          await vg.wait()
          saved.classList.add('is-walking')
          for (var i = 0; i < rows.length; i++) {
            hl.style.setProperty('--row', i)
            await vg.nap(650)
            rows[i].classList.add('is-done')
            await vg.nap(350)
          }
          saved.classList.remove('is-walking')
          await vg.nap(1800)
          rows.forEach(function (r) {
            r.classList.remove('is-done')
          })
          hl.style.setProperty('--row', 0)
          await vg.nap(500)
        }
      })()
    }
  }

  /* =====================================================================
     ④ 能力展台：自动轮播
     ===================================================================== */
  var xs = document.querySelector('[data-xs]')
  if (xs) {
    var tabs = Array.prototype.slice.call(xs.querySelectorAll('.xs-tab'))
    var panels = tabs.map(function (t) {
      return document.getElementById(t.getAttribute('aria-controls'))
    })
    var current = 0
    var stageCard = xs.querySelector('.xs-stage')

    // JS 接管后改用类名切换以支持交叉淡入
    panels.forEach(function (p) {
      p.hidden = false
    })

    var select = function (i, focus) {
      current = i
      tabs.forEach(function (t, j) {
        var on = j === i
        t.setAttribute('aria-selected', String(on))
        t.tabIndex = on ? 0 : -1
        panels[j].classList.toggle('is-active', on)
        panels[j].setAttribute('aria-hidden', String(!on))
      })
      if (focus) tabs[i].focus()
      // 移动端横向标签：把当前项滚进可视区
      var strip = tabs[i].parentElement
      if (strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: reduced ? 'auto' : 'smooth' })
      }
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        select(i)
      })
      // 进度条走完：自动切到下一项
      t.querySelector('.xs-bar i').addEventListener('animationend', function () {
        if (i === current) select((current + 1) % tabs.length)
      })
    })
    xs.querySelector('[role="tablist"]').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        select((current + 1) % tabs.length, true)
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        select((current - 1 + tabs.length) % tabs.length, true)
      }
    })

    if (!reduced) {
      xs.classList.add('is-auto')
      // 悬停 / 键盘聚焦时暂停自动轮播
      var pause = function () {
        xs.classList.add('is-paused')
      }
      var resume = function () {
        if (!xs.contains(document.activeElement)) xs.classList.remove('is-paused')
      }
      stageCard.addEventListener('pointerenter', pause)
      stageCard.addEventListener('pointerleave', resume)
      xs.addEventListener('focusin', pause)
      xs.addEventListener('focusout', function () {
        setTimeout(resume, 0)
      })
    }
    select(0)
  }

  /* =====================================================================
     ⑤ 批量任务：插件 Dashboard 演示
     ===================================================================== */
  var xb = document.querySelector('[data-xb]')
  if (xb) {
    var nameEl = xb.querySelector('[data-xb-name]')
    var area = xb.querySelector('[data-xb-area]')
    var linesEl = xb.querySelector('[data-xb-lines]')
    var startBtn = xb.querySelector('[data-xb-start]')
    var rowsEl = xb.querySelector('[data-xb-rows]')
    var toastEl = xb.querySelector('[data-xb-toast]')
    var toastFile = xb.querySelector('[data-xb-file]')
    var TASKS = [
      { name: 'Pacific Northwest bakeries', kws: ['bakery in Seattle', 'bakery in Tacoma', 'bakery in Everett', 'bakery in Bellevue', 'bakery in Portland', 'bakery in Spokane'], rows: [24, 17, 0, 21, 33, 14], stuck: 2 },
      { name: 'Texas dental clinics', kws: ['dentist in Austin, TX', 'dentist in Dallas, TX', 'dentist in Houston, TX', 'dentist in El Paso, TX', 'dentist in Waco, TX'], rows: [62, 58, 71, 0, 19], stuck: 3 }
    ]
    var bg = gate(xb, 0.25)

    var typeInto = async function (el, text, speed) {
      el.classList.add('is-typing')
      for (var i = 1; i <= text.length; i++) {
        el.textContent = text.slice(0, i)
        await bg.nap(speed)
      }
      el.classList.remove('is-typing')
    }

    // 关键词行：<span 关键词><em 状态>
    var makeLine = function (text, state) {
      var line = document.createElement('div')
      line.innerHTML = '<span></span><em></em>'
      if (text) line.firstChild.textContent = text
      if (state) setLine(line, state)
      return line
    }
    var LINE_TEXT = { run: 'extracting…', done: 'complete', stuck: 'stuck · skipped' }
    var setLine = function (line, state) {
      line.className = state ? 'is-' + state : ''
      line.lastChild.textContent = state ? LINE_TEXT[state] : ''
    }

    var newRow = function (task) {
      var tr = document.createElement('div')
      tr.className = 'xb-tr is-new'
      tr.innerHTML =
        '<span class="xb-task"></span>' +
        '<span class="xb-status"><span><span class="badge" data-xb-badge>Running</span><em class="mono" data-xb-prog>0 / ' + task.kws.length + '</em></span>' +
        '<span class="progress"><i data-xb-bar></i></span></span>' +
        '<span class="xb-acts">' + icon('copy') + icon('x') + '</span>'
      tr.querySelector('.xb-task').textContent = task.name
      rowsEl.insertBefore(tr, rowsEl.firstChild)
      while (rowsEl.children.length > 3) rowsEl.lastChild.remove()
      return tr
    }

    var playTask = async function (task) {
      await bg.wait()
      nameEl.textContent = ''
      area.innerHTML = ''
      linesEl.textContent = '0 / 500'
      startBtn.classList.add('is-disabled')
      await bg.nap(500)
      await typeInto(nameEl, task.name, 34)
      await bg.nap(250)
      var lineEls = []
      for (var i = 0; i < task.kws.length; i++) {
        var line = makeLine()
        area.appendChild(line)
        lineEls.push(line)
        await typeInto(line.firstChild, task.kws[i], 16)
        linesEl.textContent = i + 1 + ' / 500'
      }
      startBtn.classList.remove('is-disabled')
      await bg.nap(450)
      startBtn.classList.add('is-pressed')
      await bg.nap(180)
      startBtn.classList.remove('is-pressed')
      var tr = newRow(task)
      var badge = tr.querySelector('[data-xb-badge]')
      var prog = tr.querySelector('[data-xb-prog]')
      var bar = tr.querySelector('[data-xb-bar]')
      var done = 0
      var stuck = 0
      for (var k = 0; k < lineEls.length; k++) {
        setLine(lineEls[k], 'run')
        await bg.nap(k === task.stuck ? 1500 : 950)
        if (k === task.stuck) {
          setLine(lineEls[k], 'stuck')
          stuck++
        } else {
          setLine(lineEls[k], 'done')
          done++
        }
        prog.textContent = done + ' / ' + task.kws.length + (stuck ? ' · ' + stuck + ' stuck' : '')
        bar.style.setProperty('--p', Math.round(((k + 1) / lineEls.length) * 100) + '%')
      }
      badge.className = 'badge badge--ok'
      badge.textContent = 'Complete'
      prog.textContent = done + ' / ' + task.kws.length + ' · exported'
      // 完成即自动导出（真实插件行为）：框内提示文件名
      var total = task.rows.reduce(function (a, b) {
        return a + b
      }, 0)
      toastFile.textContent = exportName(total, task.name, 'csv')
      await bg.nap(300)
      toastEl.classList.add('is-on')
      await bg.nap(2600)
      toastEl.classList.remove('is-on')
      await bg.nap(600)
    }

    if (reduced) {
      var t0 = TASKS[0]
      nameEl.textContent = t0.name
      t0.kws.forEach(function (kw, i) {
        area.appendChild(makeLine(kw, i === t0.stuck ? 'stuck' : 'done'))
      })
      linesEl.textContent = t0.kws.length + ' / 500'
      var tr0 = newRow(t0)
      tr0.classList.remove('is-new')
      tr0.querySelector('[data-xb-badge]').className = 'badge badge--ok'
      tr0.querySelector('[data-xb-badge]').textContent = 'Complete'
      tr0.querySelector('[data-xb-prog]').textContent = t0.kws.length - 1 + ' / ' + t0.kws.length + ' · exported'
      tr0.querySelector('[data-xb-bar]').style.setProperty('--p', '100%')
    } else {
      ;(async function () {
        var n = 0
        for (;;) {
          await playTask(TASKS[n % TASKS.length])
          n++
        }
      })()
    }
  }

  /* =====================================================================
     ⑦ 安装区：tab 说明
     ===================================================================== */
  var note = document.querySelector('[data-xi-note]')
  if (note) {
    var NOTES = {
      chromium: 'Edge, Chrome, Brave and other Chromium browsers',
      firefox: 'Temporary add-on until the Firefox Add-ons listing is live'
    }
    note.closest('[data-tabs]').addEventListener('tabchange', function (e) {
      note.textContent = NOTES[e.detail.key]
    })
  }

  // 展台导出面板与 Hero 下载气泡沿用真实文件名格式
  document.querySelectorAll('[data-xp-file]').forEach(function (el) {
    el.textContent = exportName(24, 'bakery in Seattle', 'csv')
  })
})()
