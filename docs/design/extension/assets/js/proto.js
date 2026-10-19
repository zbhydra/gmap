/*
 * 原型专用「状态坞」（State dock）——只存在于设计稿，不进产品代码。
 * 左下角的深色工具条：切换页面声明的状态组、主题（System / Light / Dark）、减弱动效模拟、自动播放流程。
 * 依赖 theme.js、motion.js、ui.js 先执行（均 defer，按 <head> 顺序）。
 *
 * API（window.Proto）——页面脚本里调用：
 *   Proto.states({ group, label, options, value, onChange })
 *       group     唯一键；URL 参数 ?s.<group>=<value> 可深链到某个状态（截图、hub 缩略图用）
 *       label     状态坞里的显示名（缺省 = group）
 *       options   ['idle', 'running'] 或 [{ value: 'idle', label: 'Idle' }]；超过 6 项时渲染为下拉框
 *       value     初始值（URL 参数优先，其次此值，再次第一项）
 *       onChange  (value, prev) => void；注册时立即以初始值调用一次（prev 为 null）
 *   Proto.set(group, value)        程序化切换（同步状态坞、URL、[data-show]、onChange）
 *   Proto.get(group)               当前值
 *   Proto.flow(label, run)         注册「播放」按钮；run(p) 返回 Promise，p = { set, wait, step, signal }
 *                                  p.wait(ms) 在点 Stop 后 reject，流程随之中断；p.step('说明') 显示在状态坞
 *   Proto.refresh(scope)           页面脚本动态插入带 [data-show] / [data-hide] 的节点后调用一次，按当前状态显隐
 *   Proto.places                   虚构样例商户（名称虚构、电话 555-01xx，与 website 诚实约定一致）
 *   Proto.mapArt()                 风格化地图 SVG 字符串（文档页的面板舞台用）
 *   Proto.gmap(el, { mode, query, place })   在 el 里渲染宿主页面模拟，供页内面板落位：
 *                                  search / list / place（Maps）、reviews（评论工作页）、photos（照片图库）
 *
 * 声明式：
 *   <el data-show="group:a|b">     仅当 group 处于 a 或 b 时显示（hidden 切换）
 *   <el data-hide="group:a">       处于 a 时隐藏
 *   <html data-s-<group>="value">  当前值同步到根元素，页面 CSS 可直接写状态选择器
 *
 * URL 参数：?s.<group>=<value>、?theme=light|dark|system、?motion=reduce、?dock=0（隐藏状态坞）、?embed=1（缩略图嵌入：隐藏状态坞）
 * 默认折叠：<body data-dock="collapsed">（文档页用；原型页默认展开）
 */
;(function () {
  var MG = window.MG
  var UI = window.UI
  var root = document.documentElement
  var params = new URLSearchParams(location.search)
  var hidden = params.get('dock') === '0' || params.get('embed') === '1'
  var groups = Object.create(null)
  var order = []

  if (params.get('embed') === '1') root.classList.add('is-embed')

  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  /* ------------------------------------------------------------- dock DOM */
  var dock = document.createElement('aside')
  dock.className = 'proto-dock'
  dock.setAttribute('aria-label', 'Prototype state dock')
  dock.innerHTML =
    '<header class="proto-dock-head">' +
    '<span class="proto-tape" aria-hidden="true"><b>PROTO</b></span>' +
    '<span class="proto-dock-title">State dock</span>' +
    '<span class="proto-dock-meta" data-proto-meta></span>' +
    '<button class="proto-dock-toggle" type="button" aria-expanded="true" aria-label="Collapse state dock">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>' +
    '</header>' +
    '<div class="proto-dock-body">' +
    '<div class="proto-groups" data-proto-groups></div>' +
    '<div class="proto-sep" data-proto-sep hidden></div>' +
    '<div class="proto-groups" data-proto-system></div>' +
    '<div class="proto-flows" data-proto-flows hidden></div>' +
    '</div>'
  var groupsEl = dock.querySelector('[data-proto-groups]')
  var systemEl = dock.querySelector('[data-proto-system]')
  var flowsEl = dock.querySelector('[data-proto-flows]')
  var metaEl = dock.querySelector('[data-proto-meta]')
  var sepEl = dock.querySelector('[data-proto-sep]')

  var toggleBtn = dock.querySelector('.proto-dock-toggle')
  var setCollapsed = function (collapsed) {
    dock.classList.toggle('is-collapsed', collapsed)
    toggleBtn.setAttribute('aria-expanded', String(!collapsed))
    toggleBtn.setAttribute('aria-label', collapsed ? 'Expand state dock' : 'Collapse state dock')
    try {
      sessionStorage.setItem('mg-proto-dock', collapsed ? 'collapsed' : 'open')
    } catch (error) {
      // 存储不可用时只影响折叠状态的记忆
    }
  }
  toggleBtn.addEventListener('click', function () {
    setCollapsed(!dock.classList.contains('is-collapsed'))
  })
  // 默认展开；文档页可在 <body data-dock="collapsed"> 声明默认折叠；本会话手动开合过则以记忆为准
  var remembered = null
  try {
    remembered = sessionStorage.getItem('mg-proto-dock')
  } catch (error) {
    // 同上
  }
  if (remembered ? remembered === 'collapsed' : document.body.dataset.dock === 'collapsed') {
    dock.classList.add('is-collapsed')
    toggleBtn.setAttribute('aria-expanded', 'false')
    toggleBtn.setAttribute('aria-label', 'Expand state dock')
  }

  if (!hidden) document.body.appendChild(dock)

  /* ---------------------------------------------------- group rendering */
  function normalize(options) {
    return options.map(function (o) {
      return typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label || o.value }
    })
  }

  function renderGroup(container, g) {
    var row = document.createElement('div')
    row.className = 'proto-group'
    var labelId = 'proto-label-' + g.key.replace(/[^a-z0-9-]/gi, '')
    var html = '<span class="proto-group-label" id="' + labelId + '">' + esc(g.label) + '</span>'
    if (g.options.length > 6) {
      html +=
        '<select class="proto-select" aria-labelledby="' + labelId + '">' +
        g.options
          .map(function (o) {
            return '<option value="' + esc(o.value) + '">' + esc(o.label) + '</option>'
          })
          .join('') +
        '</select>'
    } else {
      html +=
        '<div class="proto-seg" role="radiogroup" aria-labelledby="' + labelId + '">' +
        g.options
          .map(function (o) {
            return '<button type="button" role="radio" aria-checked="false" data-value="' + esc(o.value) + '">' + esc(o.label) + '</button>'
          })
          .join('') +
        '</div>'
    }
    row.innerHTML = html
    var select = row.querySelector('select')
    if (select) {
      select.addEventListener('change', function () {
        g.set(select.value)
      })
    } else {
      row.querySelectorAll('[role="radio"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          g.set(btn.dataset.value)
        })
      })
    }
    g.sync = function (value) {
      if (select) select.value = value
      row.querySelectorAll('[role="radio"]').forEach(function (btn) {
        btn.setAttribute('aria-checked', String(btn.dataset.value === value))
      })
    }
    container.appendChild(row)
  }

  function applyVisibility(scope) {
    ;(scope || document).querySelectorAll('[data-show], [data-hide]').forEach(function (el) {
      var rule = el.dataset.show || el.dataset.hide
      var parts = rule.split(':')
      var g = groups[parts[0]]
      if (!g) return
      var match = parts[1].split('|').indexOf(g.value) >= 0
      el.hidden = el.dataset.show ? !match : match
    })
  }

  function writeUrl() {
    var next = new URLSearchParams(location.search)
    order.forEach(function (key) {
      if (groups[key].system) return
      next.set('s.' + key, groups[key].value)
    })
    var query = next.toString().replace(/%3A/g, ':').replace(/%7C/g, '|')
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash)
  }

  function updateMeta() {
    var count = order.filter(function (k) {
      return !groups[k].system
    }).length
    metaEl.textContent = count ? count + (count === 1 ? ' group' : ' groups') : ''
    sepEl.hidden = !count
  }

  /* --------------------------------------------------------------- API */
  var Proto = (window.Proto = window.Proto || {})

  Proto.states = function (def) {
    var key = def.group
    var options = normalize(def.options)
    var g = {
      key: key,
      label: def.label || key,
      options: options,
      onChange: def.onChange,
      system: !!def.system,
      value: null
    }
    var fromUrl = params.get('s.' + key)
    var initial = [fromUrl, def.value, options[0].value].find(function (v) {
      return (
        v != null &&
        options.some(function (o) {
          return o.value === v
        })
      )
    })
    g.set = function (value, opts) {
      if (
        !options.some(function (o) {
          return o.value === value
        })
      )
        return
      var prev = g.value
      if (prev === value && !(opts && opts.force)) return
      g.value = value
      root.setAttribute('data-s-' + key, value)
      if (g.sync) g.sync(value)
      applyVisibility()
      if (!g.system) writeUrl()
      if (g.onChange) g.onChange(value, prev)
    }
    groups[key] = g
    order.push(key)
    renderGroup(g.system ? systemEl : groupsEl, g)
    updateMeta()
    g.set(initial, { force: true })
    return g
  }

  Proto.set = function (key, value) {
    if (groups[key]) groups[key].set(value)
  }

  Proto.get = function (key) {
    return groups[key] ? groups[key].value : null
  }

  Proto.refresh = function (scope) {
    applyVisibility(scope)
  }

  /* -------------------------------------------------------------- flows */
  var running = null
  Proto.flow = function (label, run) {
    flowsEl.hidden = false
    var row = document.createElement('div')
    row.className = 'proto-flow'
    row.innerHTML =
      '<button type="button" class="proto-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l11-7z"/></svg><span></span></button>' +
      '<span class="proto-step" aria-live="polite"></span>'
    var btn = row.querySelector('.proto-play')
    var stepEl = row.querySelector('.proto-step')
    btn.querySelector('span').textContent = label
    var stop = function () {
      if (!running) return
      running.controller.abort()
    }
    btn.addEventListener('click', function () {
      if (running && running.btn === btn) {
        stop()
        return
      }
      stop()
      var controller = new AbortController()
      running = { controller: controller, btn: btn }
      btn.classList.add('is-playing')
      btn.querySelector('span').textContent = 'Stop'
      var p = {
        signal: controller.signal,
        set: Proto.set,
        step: function (text) {
          stepEl.textContent = text
        },
        wait: function (ms) {
          return new Promise(function (resolve, reject) {
            if (controller.signal.aborted) return reject(new Error('flow stopped'))
            var t = setTimeout(resolve, MG.reducedMotion() ? Math.min(ms, 400) : ms)
            controller.signal.addEventListener('abort', function () {
              clearTimeout(t)
              reject(new Error('flow stopped'))
            })
          })
        }
      }
      Promise.resolve()
        .then(function () {
          return run(p)
        })
        .catch(function (error) {
          if (!controller.signal.aborted) throw error
        })
        .finally(function () {
          if (running && running.btn === btn) running = null
          btn.classList.remove('is-playing')
          btn.querySelector('span').textContent = label
          stepEl.textContent = controller.signal.aborted ? 'Stopped' : 'Done'
        })
    })
    flowsEl.appendChild(row)
  }

  /* ------------------------------------------------- system groups（主题 / 动效） */
  Proto.states({
    group: 'theme',
    label: 'Theme',
    system: true,
    options: [
      { value: 'system', label: 'System' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' }
    ],
    value: MG.theme.mode(),
    onChange: function (value, prev) {
      if (prev !== null) MG.theme.set(value)
    }
  })
  document.addEventListener('mg:theme', function (e) {
    if (groups.theme.value !== e.detail.mode) {
      groups.theme.value = e.detail.mode
      root.setAttribute('data-s-theme', e.detail.mode)
      groups.theme.sync(e.detail.mode)
    }
  })

  Proto.states({
    group: 'motion',
    label: 'Motion',
    system: true,
    options: [
      { value: 'full', label: 'Full' },
      { value: 'reduce', label: 'Reduced' }
    ],
    value: root.getAttribute('data-motion') === 'reduce' ? 'reduce' : 'full',
    onChange: function (value, prev) {
      if (prev === null) return
      if (value === 'reduce') root.setAttribute('data-motion', 'reduce')
      else root.removeAttribute('data-motion')
      try {
        if (value === 'reduce') sessionStorage.setItem('mg-proto-motion', 'reduce')
        else sessionStorage.removeItem('mg-proto-motion')
      } catch (error) {
        // 存储不可用：本页有效
      }
      document.dispatchEvent(new CustomEvent('mg:motion', { detail: { reduced: MG.reducedMotion() } }))
    }
  })

  /* ------------------------------------------------- 样例数据（全部虚构） */
  Proto.places = [
    { name: 'Ember & Oak Coffee', category: 'Coffee shop', address: '214 W 23rd St', rating: 4.7, reviews: 1284, phone: '(212) 555-0142', hours: 'Closes 7 PM', price: '$$' },
    { name: 'Halfmoon Roasters', category: 'Coffee roasters', address: '88 Orchard St', rating: 4.6, reviews: 932, phone: '(212) 555-0177', hours: 'Closes 6 PM', price: '$$' },
    { name: 'Copper Kettle Café', category: 'Café', address: '51 Grand St', rating: 4.4, reviews: 610, phone: '(212) 555-0119', hours: 'Closes 8 PM', price: '$' },
    { name: 'Northline Espresso Bar', category: 'Espresso bar', address: '305 Park Ave S', rating: 4.8, reviews: 2047, phone: '(212) 555-0163', hours: 'Closes 5 PM', price: '$$' },
    { name: 'Basil & Bean', category: 'Coffee shop', address: '17 Bleecker St', rating: 4.3, reviews: 418, phone: '(212) 555-0128', hours: 'Closes 9 PM', price: '$' },
    { name: 'Driftwood Coffee Co.', category: 'Coffee shop', address: '742 9th Ave', rating: 4.5, reviews: 776, phone: '(212) 555-0190', hours: 'Closes 7 PM', price: '$$' },
    { name: 'Lantern Street Café', category: 'Café', address: '9 Doyers St', rating: 4.6, reviews: 1153, phone: '(212) 555-0136', hours: 'Closes 10 PM', price: '$$' },
    { name: 'Quarry Hill Roastery', category: 'Coffee roasters', address: '120 Water St', rating: 4.7, reviews: 589, phone: '(212) 555-0151', hours: 'Closes 4 PM', price: '$$$' }
  ]

  /* -------------------------------------------------- Google Maps 宿主模拟 */
  // 风格化、无品牌标识的 Maps 外观：左侧搜索结果 / 地点详情 + 右侧地图（恒亮，宿主页面不随扩展主题翻转）
  var MAP_SVG =
    '<svg class="gmap-art" viewBox="0 0 1000 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<rect width="1000" height="720" class="gm-land"/>' +
    '<g class="gm-blocks">' +
    '<rect x="40" y="40" width="150" height="110" rx="6"/><rect x="220" y="40" width="170" height="110" rx="6"/><rect x="420" y="30" width="140" height="120" rx="6"/>' +
    '<rect x="40" y="180" width="150" height="130" rx="6"/><rect x="220" y="180" width="170" height="130" rx="6"/><rect x="600" y="40" width="160" height="110" rx="6"/>' +
    '<rect x="40" y="340" width="150" height="120" rx="6"/><rect x="220" y="340" width="120" height="120" rx="6"/><rect x="780" y="40" width="190" height="110" rx="6"/>' +
    '<rect x="600" y="180" width="160" height="120" rx="6"/><rect x="780" y="180" width="190" height="120" rx="6"/><rect x="420" y="180" width="140" height="130" rx="6"/>' +
    '<rect x="600" y="330" width="160" height="110" rx="6"/><rect x="780" y="330" width="190" height="110" rx="6"/><rect x="40" y="490" width="150" height="190" rx="6"/>' +
    '<rect x="220" y="490" width="160" height="190" rx="6"/><rect x="780" y="470" width="190" height="210" rx="6"/>' +
    '</g>' +
    '<path class="gm-park" d="M418 342h156a8 8 0 0 1 8 8v96a8 8 0 0 1-8 8H418a8 8 0 0 1-8-8v-96a8 8 0 0 1 8-8Z"/>' +
    '<path class="gm-water" d="M560 720c20-70 58-110 120-140s92-70 100-140c6-60 40-96 100-110s100-60 120-110v520Z"/>' +
    '<g class="gm-roads-casing"><path d="M0 165h1000M0 325h600M0 475h560M205 0v720M405 0v720M590 0v540M770 0v460"/></g>' +
    '<g class="gm-roads"><path d="M0 165h1000M0 325h600M0 475h560M205 0v720M405 0v720M590 0v540M770 0v460"/></g>' +
    '<path class="gm-highway-casing" d="M-20 610C180 590 300 520 420 470S700 360 1020 300"/>' +
    '<path class="gm-highway" d="M-20 610C180 590 300 520 420 470S700 360 1020 300"/>' +
    '<g class="gm-labels"><text x="92" y="262">CHELSEA</text><text x="452" y="398">MADISON SQ</text><text x="640" y="262">GRAMERCY</text><text x="852" y="612" class="gm-water-label">East River</text><text x="236" y="600">GREENWICH</text></g>' +
    '</svg>'

  Proto.mapArt = function () {
    return MAP_SVG
  }

  var PIN_SPOTS = [
    [38, 30], [52, 44], [30, 58], [64, 26], [46, 66], [72, 52], [58, 74], [24, 40]
  ]

  Proto.gmap = function (el, options) {
    var o = options || {}
    var mode = o.mode || 'search'
    var place = o.place || Proto.places[0]
    var query = o.query || (mode === 'list' ? 'Coffee to try' : 'coffee near Manhattan')
    var stars = function (r) {
      return '<span class="gmap-stars" style="--r:' + r + '" aria-hidden="true"></span>'
    }
    var rate = function (p) {
      return '<span class="gmap-rate">' + p.rating.toFixed(1) + ' ' + stars(p.rating) + ' <span>(' + MG.formatNumber(p.reviews) + ')</span></span>'
    }
    var searchBox =
      '<div class="gmap-search"><span>' + esc(mode === 'place' ? place.name : query) + '</span>' +
      '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.6-4.6"/></svg></div>'
    var cards = Proto.places
      .slice(0, 6)
      .map(function (p) {
        return (
          '<article class="gmap-card">' +
          '<div class="gmap-card-text"><b>' + esc(p.name) + '</b>' + rate(p) +
          '<span>' + esc(p.category) + ' · ' + esc(p.price) + ' · ' + esc(p.address) + '</span>' +
          '<span><em class="gmap-open">Open</em> · ' + esc(p.hours) + '</span></div>' +
          '<i class="gmap-thumb"></i>' +
          '</article>'
        )
      })
      .join('')

    el.classList.add('gmap')
    el.classList.toggle('gmap--page', mode === 'reviews')
    el.classList.toggle('gmap--gallery', mode === 'photos')
    el.setAttribute('aria-hidden', 'true')

    // 评论工作页：单列评论流（无地图）
    if (mode === 'reviews') {
      var reviews = [
        ['Maya R.', 5, 'Best cortado in Chelsea. Friendly staff and quick service even at rush hour.'],
        ['Daniel K.', 4, 'Great beans and a calm back room for laptop work. Seating fills up after 10.'],
        ['Priya S.', 5, 'The seasonal pour-over was excellent. Will be back.'],
        ['Tom W.', 3, 'Good coffee, but the line can be long on weekends.']
      ]
      el.innerHTML =
        '<div class="gmap-sheet"><div class="gmap-sheet-head"><h2>' + esc(place.name) + '</h2>' + rate(place) + '</div>' +
        reviews
          .map(function (r) {
            return '<div class="gmap-review"><i></i><b>' + esc(r[0]) + '</b>' + stars(r[1]) + '<p>' + esc(r[2]) + '</p></div>'
          })
          .join('') +
        '</div>'
      return el
    }

    // 照片图库：左侧缩略栏 + 大图
    if (mode === 'photos') {
      el.innerHTML = '<div class="gmap-strip"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="gmap-photo"></div>'
      return el
    }

    var side
    if (mode === 'place') {
      side =
        '<div class="gmap-place">' +
        '<div class="gmap-hero"></div>' +
        '<div class="gmap-place-head"><h2>' + esc(place.name) + '</h2>' + rate(place) +
        '<span>' + esc(place.category) + ' · ' + esc(place.price) + '</span></div>' +
        '<div class="gmap-tabs"><span class="is-on">Overview</span><span>Reviews</span><span>About</span></div>' +
        '<ul class="gmap-info"><li><i></i>' + esc(place.address) + ', New York, NY</li>' +
        '<li><i></i><span><em class="gmap-open">Open</em> · ' + esc(place.hours) + '</span></li>' +
        '<li><i></i>' + esc(place.phone) + '</li><li><i></i>emberandoak.example</li></ul>' +
        '</div>'
    } else if (mode === 'list') {
      side =
        '<div class="gmap-list-head"><b>' + esc(query) + '</b><span>Private · 8 places</span></div>' +
        '<div class="gmap-results">' + cards + '</div>'
    } else {
      side =
        '<div class="gmap-chips"><span>Price</span><span>Rating</span><span>Hours</span><span>All filters</span></div>' +
        '<div class="gmap-results">' + cards + '</div>'
    }

    var single = mode === 'place'
    el.innerHTML =
      '<div class="gmap-side' + (single ? ' gmap-side--place' : '') + '">' + searchBox + side + '</div>' +
      '<div class="gmap-map">' + MAP_SVG +
      PIN_SPOTS.slice(0, single ? 1 : PIN_SPOTS.length)
        .map(function (spot, i) {
          var x = single ? 52 : spot[0]
          var y = single ? 48 : spot[1]
          return '<span class="gmap-pin' + (single ? ' is-selected' : '') + '" style="--x:' + x + '%;--y:' + y + '%;--i:' + i + '"></span>'
        })
        .join('') +
      '<div class="gmap-zoom"><span>+</span><span>−</span></div>' +
      '</div>'
    return el
  }

  // 其他脚本先于状态坞声明的 [data-show] 元素：首次应用一次
  applyVisibility()
  if (UI && UI.init) UI.init(dock)
})()
