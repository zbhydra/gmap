/*
 * dashboard.html（Phase B）批量任务 Dashboard 页面脚本：渲染、交互、状态坞与演示流程。
 * 状态来自 logic.md §5 + L6（主操作 + More 菜单 + 站内确认）· L7（Start / Resume / Run again）·
 * L8（Back 不暂停）· L9（重试只读）；数据与调度在 dashboard-sim.js（对齐 background/batch）。
 *
 *   视图        new（表单 + 摘要栏）· history（列表）· detail（详情，history 的下一层）
 *   实时        调度事件 → 原位更新（chip 形变、数字滚动、进度光束、当前行高亮并保持在视野内），不整表重绘
 *   提示        吸顶提示条：错误（原因 + 下一步，L2）持续到下一次成功操作或手动关闭；成功提示 4 秒自动消失
 *   状态坞组    tool · view · task · item · form · alert（深链 ?s.<group>=，README §10「Dashboard」）
 *
 * Vue 落地时，这里每一处 DOM 写入都对应一个响应式绑定；patch*() 的「原位更新」就是 keyed 列表的行复用。
 */
;(function () {
  var MG = window.MG
  var UI = window.UI
  var Proto = window.Proto
  var Sim = window.DBSim
  var doc = document

  // 必须在注册状态组之前读 URL（注册时状态坞会把当前取值写回地址栏）
  var params = new URLSearchParams(location.search)
  var EMBED = params.get('embed') === '1'
  var booting = true
  // hub 缩略图：静态终态，调度不计时（状态坞注册时就会接管运行中的任务，所以要在注册前冻结）
  Sim.engine.frozen = EMBED

  var $ = function (sel, scope) {
    return (scope || doc).querySelector(sel)
  }
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(sel))
  }
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }
  var fmt = function (n) {
    return MG.formatNumber(n)
  }
  var pad = function (n, w) {
    var s = String(n)
    while (s.length < (w || 2)) s = '0' + s
    return s
  }
  // 首屏装配与减弱动效下一律给终态
  var still = function () {
    return booting || MG.reducedMotion()
  }
  var dur = function (name, fallback) {
    return MG.ms(name) || fallback
  }
  var EMPH = MG.token('--ease-emph') || 'ease-out'
  var OUT = MG.token('--ease-out') || 'ease-out'

  /* ============================================================ 文案（en-US，按 i18n 值书写） */
  var TOOL = {
    keywords: {
      h1: 'Bulk keywords',
      lede: 'Run up to 500 Google Maps searches per task. Each keyword opens in its own tab and downloads its own file when it finishes.',
      formTitle: 'New keyword task',
      formDesc: 'Each line is one Google Maps search. Searches run one at a time, in order.',
      label: 'Keywords',
      aside: 'One per line · up to 500 per task',
      placeholder: 'coffee shops in Park Slope\ndentists near 11215\nyoga studios in Williamsburg',
      one: 'keyword',
      many: 'keywords',
      Many: 'Keywords',
      col: 'Keyword',
      icon: 'list-plus',
      list: 'Keyword tasks',
      emptyTitle: 'No keyword tasks yet',
      emptyDesc: 'Paste up to 500 keywords in New task. Each one runs as its own Google Maps search, one after another.',
      emptyErr: 'Paste at least one keyword.',
      tab: 'tab',
      retryUnit: 'keyword'
    },
    reviews: {
      h1: 'Bulk reviews',
      lede: 'Collect reviews from up to 500 places per task. Paste Google Maps place links or Google review links, one per line.',
      formTitle: 'New review task',
      formDesc: 'Each line is one place. Places run one at a time, in order, up to the review limit you set.',
      label: 'Review URLs',
      aside: 'One link per line · up to 500 per task',
      placeholder: 'https://www.google.com/maps/place/…\nhttps://search.google.com/local/reviews?placeid=…',
      one: 'URL',
      many: 'URLs',
      Many: 'URLs',
      col: 'Review URL',
      icon: 'review',
      list: 'Review tasks',
      emptyTitle: 'No review tasks yet',
      emptyDesc: 'Paste up to 500 Google Maps place links in New task. MapsGrab opens each place’s reviews and collects them one place at a time.',
      emptyErr: 'Paste at least one review URL.',
      tab: 'tab',
      retryUnit: 'place'
    }
  }
  var TASK_LABEL = { idle: 'Idle', running: 'Running', paused: 'Paused', completed: 'Completed' }
  var ACT = {
    start: { label: 'Start', icon: 'play' },
    pause: { label: 'Pause', icon: 'pause' },
    resume: { label: 'Resume', icon: 'resume' },
    again: { label: 'Run again', icon: 'refresh' }
  }
  var actKey = function (t) {
    return { idle: 'start', running: 'pause', paused: 'resume', completed: 'again' }[t.status]
  }
  var plural = function (n, one, many) {
    return fmt(n) + ' ' + (n === 1 ? one : many)
  }

  /* ============================================================ 状态 */
  var S = {
    tool: 'keywords',
    view: 'new',
    detailId: null,
    hidden: null, // 'empty' 演示态：隐藏该工具的全部任务
    fill: false,
    item: 'extracting',
    tasks: Sim.world({})
  }
  var focusOf = function (tool) {
    return S.tasks.filter(function (t) {
      return t.focus && t.type === tool
    })[0]
  }
  var find = function (id) {
    return S.tasks.filter(function (t) {
      return t.id === id
    })[0]
  }
  var tasksOf = function (tool) {
    if (S.hidden === tool) return []
    return S.tasks
      .filter(function (t) {
        return t.type === tool
      })
      .sort(function (a, b) {
        return b.seq - a.seq
      })
  }
  var runningTask = function () {
    return S.tasks.filter(function (t) {
      return t.status === 'running'
    })[0]
  }
  // 名额：全部任务（两个工具共用 150）；empty 演示态隐藏的那批不计
  var slotsUsed = function () {
    return S.tasks.filter(function (t) {
      return t.type !== S.hidden
    }).length
  }
  var nextSeq = function (tool) {
    return (
      S.tasks
        .filter(function (t) {
          return t.type === tool
        })
        .reduce(function (m, t) {
          return Math.max(m, t.seq)
        }, 0) + 1
    )
  }

  /* ============================================================ 元素 */
  var el = {
    appbar: $('[data-db-appbar]'),
    runpill: $('[data-db-runpill]'),
    runName: $('[data-db-runpill-name]'),
    runDone: $('[data-db-runpill-done]'),
    runOf: $('[data-db-runpill-of]'),
    help: $('[data-db-help]'),
    h1: $('[data-db-h1]'),
    lede: $('[data-db-lede]'),
    tool: $('[data-db-tool]'),
    tabs: $('[data-db-tabs]'),
    count: $('[data-db-count]'),
    slots: $('[data-db-slots]'),
    slotsUsed: $('[data-db-slots-used]'),
    slotsBar: $('.db-slots-bar'),
    alerts: $('[data-db-alerts]'),
    stage: $('[data-db-stage]'),
    form: $('[data-db-form]'),
    formIcon: $('[data-db-form-icon]'),
    formTitle: $('[data-db-form-title]'),
    formDesc: $('[data-db-form-desc]'),
    name: $('[data-db-name]'),
    nameErr: $('[data-db-error="name"]'),
    items: $('[data-db-items]'),
    itemsLabel: $('[data-db-items-label]'),
    itemsAside: $('[data-db-items-aside]'),
    itemsErr: $('[data-db-error="items"]'),
    itemsErrText: $('[data-db-items-error-text]'),
    counter: $('[data-db-counter]'),
    cleanup: $('[data-db-cleanup]'),
    perplace: $('[data-db-perplace]'),
    retryText: $('[data-db-retry-text]'),
    pips: $('[data-db-pips]'),
    clear: $('[data-db-clear]'),
    footHint: $('[data-db-foot-hint]'),
    footHintText: $('[data-db-foot-hint-text]'),
    create: $('[data-db-create]'),
    createLabel: $('[data-db-create-label]'),
    createSplit: $('[data-db-create-split]'),
    start: $('[data-db-start]'),
    startLabel: $('[data-db-start-label]'),
    sumCount: $('[data-db-sum-count]'),
    sumUnit: $('[data-db-sum-unit]'),
    sumTasks: $('[data-db-sum-tasks]'),
    sumDesc: $('[data-db-sum-desc]'),
    split: $('[data-db-split]'),
    splitBar: $('[data-db-split-bar]'),
    splitList: $('[data-db-split-list]'),
    splitNote: $('[data-db-split-note]'),
    quota: $('[data-db-quota]'),
    quotaRule: $('[data-db-quota-rule]'),
    quotaNeed: $('[data-db-quota-need]'),
    qbar: $('[data-db-qbar]'),
    qUsed: $('[data-db-quota-used]'),
    qTask: $('[data-db-quota-task]'),
    qAfter: $('[data-db-quota-after]'),
    qNote: $('[data-db-quota-note]'),
    qWarn: $('[data-db-quota-warn]'),
    qWarnDesc: $('[data-db-quota-warn-desc]'),
    menu: $('#db-task-menu'),
    sr: $('[data-db-sr]')
  }

  /* ============================================================ 通用件 */
  // 读屏播报：状态变化立即播；纯进度至少间隔 8 秒（不刷屏）
  var lastSay = 0
  var say = function (text, progress) {
    if (progress && Date.now() - lastSay < 8000) return
    lastSay = Date.now()
    el.sr.textContent = ''
    setTimeout(function () {
      el.sr.textContent = text
    }, 40)
  }

  var link = function (label) {
    UI.toast({ title: label + ' opens in a new tab', desc: 'In the extension this goes to the MapsGrab website. The prototype stays on this page.', tone: 'primary', icon: 'external' })
  }

  // 状态 chip：同一个元素换语气与文案。形变 = 宽度补间 + 文案自下而上 + 字形弹一下（T2，一次性）
  var CHIP_CLASS = { retry: 'status db-status--retry' }
  var chipHTML = function (kind, label) {
    return '<span class="' + (CHIP_CLASS[kind] || 'status status--' + kind) + '" data-kind="' + kind + '"><span class="db-chip-text">' + esc(label) + '</span></span>'
  }
  var chip = function (node, kind, label, animate) {
    if (!node) return
    var text = $('.db-chip-text', node)
    if (node.dataset.kind === kind && text.textContent === label) return
    var w0 = node.getBoundingClientRect().width
    node.className = CHIP_CLASS[kind] || 'status status--' + kind
    node.dataset.kind = kind
    text.textContent = label
    if (!animate || still() || !node.isConnected) return
    var w1 = node.getBoundingClientRect().width
    MG.replay(node, 'is-morphing')
    clearTimeout(node._morph)
    node._morph = setTimeout(function () {
      node.classList.remove('is-morphing')
    }, dur('--dur-4', 560))
    if (Math.abs(w1 - w0) > 0.5) node.animate([{ width: w0 + 'px' }, { width: w1 + 'px' }], { duration: dur('--dur-3', 280), easing: EMPH })
    text.animate([{ opacity: 0, transform: 'translate3d(0, 70%, 0)' }, { opacity: 1, transform: 'none' }], { duration: dur('--dur-3', 280), easing: EMPH })
  }

  // 主操作按钮：四个文案叠在一个 .morph 里（宽度取最宽项）；详情页大按钮 Pause 为次要样式，其余为 primary
  var actHTML = function (t, size) {
    var key = actKey(t)
    var cls = size === 'lg' ? 'btn ' + (key === 'pause' ? 'btn-secondary' : 'btn-primary') : 'btn btn-secondary btn-sm'
    return (
      '<button class="' + cls + ' db-act" type="button" data-act="primary" data-key="' + key + '" aria-describedby="db-name-' + t.id + '">' +
      '<span class="morph">' +
      Object.keys(ACT)
        .map(function (k) {
          return '<span data-key="' + k + '"' + (k === key ? ' class="is-active"' : ' aria-hidden="true"') + '>' + UI.icon(ACT[k].icon) + ACT[k].label + '</span>'
        })
        .join('') +
      '</span></button>'
    )
  }
  var morphAct = function (btn, t) {
    if (!btn) return
    var key = actKey(t)
    if (btn.dataset.key === key) return
    btn.dataset.key = key
    var box = $('.morph', btn)
    if (still()) {
      $$('[data-key]', box).forEach(function (s) {
        var on = s.dataset.key === key
        s.classList.toggle('is-active', on)
        s.classList.remove('is-leaving')
        if (on) s.removeAttribute('aria-hidden')
        else s.setAttribute('aria-hidden', 'true')
      })
    } else UI.morph(box, key)
    if (!btn.classList.contains('btn-sm')) {
      btn.classList.toggle('btn-primary', key !== 'pause')
      btn.classList.toggle('btn-secondary', key === 'pause')
    }
  }

  var fillBar = function (bar, p, live, instant) {
    if (!bar) return
    var fill = $('.progress-fill', bar)
    if (instant || still()) fill.style.transition = 'none'
    bar.style.setProperty('--p', p.toFixed(2))
    bar.classList.toggle('is-live', !!live)
    if (instant || still()) {
      void fill.offsetWidth
      fill.style.transition = ''
    }
  }
  var pctOf = function (c) {
    return c.total ? (c.done / c.total) * 100 : 0
  }
  var roll = function (node, n) {
    if (!node) return
    // hub 缩略图整体缩小后，滚轮竖带会因亚像素错位露出邻位数字：嵌入时直接写终值
    if (EMBED) node.textContent = MG.formatNumber(n, 0)
    else MG.roll(node, n, { instant: still() })
  }

  /* ============================================================ 吸顶提示条 */
  // 一次只留一条：新提示替换旧提示。错误（bad / warn）role=alert，成功 role=status；auto = 4 秒后自动消失（悬停暂停）
  var ALERT_ICON = { ok: 'check-circle', warn: 'alert', bad: 'alert-circle', primary: 'info' }
  var current = null
  var dropAlert = function (node, instant) {
    if (!node || node._gone) return
    node._gone = true
    clearTimeout(node._timer)
    if (instant || still()) {
      node.remove()
      return
    }
    node.classList.add('is-leaving')
    node.addEventListener('animationend', function () {
      node.remove()
    }, { once: true })
  }
  var clearAlert = function (instant) {
    dropAlert(current, instant)
    current = null
  }
  var showAlert = function (o) {
    clearAlert(true)
    var node = doc.createElement('div')
    node.className = 'db-alert tone-' + o.tone
    node.innerHTML =
      '<div class="notice notice--banner tone-' + o.tone + '" role="' + (o.tone === 'bad' || o.tone === 'warn' ? 'alert' : 'status') + '">' +
      UI.icon(o.icon || ALERT_ICON[o.tone]) +
      '<div><p class="notice-title"></p><p class="notice-desc"></p>' + (o.actions ? '<div class="notice-actions"></div>' : '') + '</div>' +
      '<button class="icon-btn icon-btn--sm" type="button" aria-label="Dismiss">' + UI.icon('x') + '</button></div>' +
      (o.auto ? '<span class="db-alert-timer" aria-hidden="true"></span>' : '')
    $('.notice-title', node).textContent = o.title
    $('.notice-desc', node).innerHTML = o.descHtml
    ;(o.actions || []).forEach(function (a) {
      var b = doc.createElement('button')
      b.type = 'button'
      b.className = a.primary ? 'btn btn-secondary btn-sm' : 'link link--quiet'
      b.innerHTML = (a.icon ? UI.icon(a.icon) : '') + esc(a.label)
      b.addEventListener('click', function () {
        a.run()
      })
      $('.notice-actions', node).appendChild(b)
    })
    $('.notice > .icon-btn', node).addEventListener('click', function () {
      if (current === node) current = null
      dropAlert(node)
    })
    if (o.hold) node.classList.add('is-held')
    if (o.auto && !o.hold) {
      var left = dur('--dur-toast', 4000)
      var since = 0
      var run = function () {
        since = Date.now()
        node._timer = setTimeout(function () {
          if (current === node) current = null
          dropAlert(node)
        }, left)
      }
      node.addEventListener('pointerenter', function () {
        clearTimeout(node._timer)
        left -= Date.now() - since
      })
      node.addEventListener('pointerleave', run)
      run()
    }
    el.alerts.appendChild(node)
    current = node
    // 吸顶条在视口外（页面顶部之上）时，把它带回视野：错误必须被看到
    if (!booting && el.alerts.getBoundingClientRect().top < 0) el.alerts.scrollIntoView({ block: 'nearest', behavior: still() ? 'auto' : 'smooth' })
    return node
  }
  var q = function (s) {
    return '“' + esc(s) + '”'
  }
  // 纯文本场景（textContent、Toast 标题）用的引号
  var qt = function (s) {
    return '“' + s + '”'
  }

  /* ============================================================ 页头 · 工具 · 计数 */
  var paintChrome = function () {
    var run = runningTask()
    var onIt = run && S.view === 'detail' && S.detailId === run.id
    el.runpill.hidden = !run || !!onIt
    if (run) {
      var c = Sim.counts(run)
      el.runName.textContent = run.name
      roll(el.runDone, c.done)
      el.runOf.textContent = ' / ' + fmt(c.total)
      el.runpill.setAttribute('aria-label', 'Running: ' + run.name + ', ' + c.done + ' of ' + c.total + ' processed. Open task.')
    }
    ;['keywords', 'reviews'].forEach(function (tool) {
      $('[data-db-tool-live="' + tool + '"]').hidden = !(run && run.type === tool)
    })
    roll(el.count, tasksOf(S.tool).length)
    var used = slotsUsed()
    roll(el.slotsUsed, used)
    fillBar(el.slotsBar, (used / Sim.LIMITS.maxTasks) * 100, false)
    el.slots.dataset.level = used >= Sim.LIMITS.maxTasks ? 'full' : used >= 140 ? 'near' : 'ok'
    el.slots.setAttribute('title', used + ' of 150 task slots used. Tasks are saved on this device and shared by both tools.')
  }

  // 工具文案：标题、表单标签、占位、每店评论数（data-show 由 Proto 处理）、重试读数
  var paintToolCopy = function () {
    var cfg = TOOL[S.tool]
    el.h1.textContent = cfg.h1
    el.lede.textContent = cfg.lede
    el.formIcon.setAttribute('href', 'assets/img/icons.svg#i-' + cfg.icon)
    el.formTitle.textContent = cfg.formTitle
    el.formDesc.textContent = cfg.formDesc
    el.itemsLabel.textContent = cfg.label
    el.itemsAside.textContent = cfg.aside
    el.items.placeholder = cfg.placeholder
    el.itemsErrText.textContent = cfg.emptyErr
    if (el.tool.setValue) el.tool.setValue(S.tool)
    paintRetry()
  }

  // L9：重试只读。读数 + 尝试圆点（1 … retry+1 → Skip）
  var paintRetry = function () {
    var r = Sim.retry
    var unit = TOOL[S.tool].retryUnit
    el.retryText.textContent =
      r === 0
        ? 'No retries — a stuck ' + unit + ' is skipped right away.'
        : (r === 1 ? '1 retry' : r + ' retries') + ' — up to ' + (r + 1) + ' attempts per ' + unit + ', then it’s skipped.'
    var pips = ''
    for (var i = 1; i <= r + 1; i++) pips += '<li>' + i + '</li>'
    el.pips.innerHTML = pips + '<li class="db-pip-arrow">' + UI.icon('arrow-right') + '</li><li class="db-pip-skip">Skip</li>'
  }

  var tabbing = false
  var paintTopTabs = function () {
    var want = S.view === 'new' ? 0 : 1
    var tabs = $$('[role="tab"]', el.tabs)
    if (tabs[want].getAttribute('aria-selected') === 'true' || !el.tabs.selectTab) return
    tabbing = true
    el.tabs.selectTab(want)
    tabbing = false
  }

  /* ============================================================ 历史列表 */
  var countsHTML = function (c) {
    return (
      '<span>try ' + fmt(c.tries) + '</span>' +
      '<span>complete ' + fmt(c.complete) + '</span>' +
      '<span' + (c.stuck ? ' class="is-warn"' : '') + '>stuck ' + fmt(c.stuck) + '</span>' +
      '<span' + (c.invalid ? ' class="is-warn"' : '') + '>skip ' + fmt(c.invalid) + '</span>'
    )
  }

  var rowHTML = function (t, fresh) {
    var c = Sim.counts(t)
    var cfg = TOOL[t.type]
    var cls = [t.status === 'running' ? 'is-active' : '', fresh ? 'db-row-new' : ''].join(' ').trim()
    var meta = plural(c.total, cfg.one, cfg.many) + (t.perPlace ? ' · ' + fmt(t.perPlace) + ' reviews per place' : '') + ' · ' + Sim.when(t.createdAt)
    return (
      '<tr data-task="' + t.id + '"' + (cls ? ' class="' + cls + '"' : '') + '>' +
      '<td class="cell-index">' + pad(t.seq) + '</td>' +
      '<td class="db-cell-task"><span class="cell-strong db-task-name" id="db-name-' + t.id + '">' + esc(t.name) + '</span><span class="cell-sub">' + esc(meta) + '</span></td>' +
      '<td>' + chipHTML(t.status, TASK_LABEL[t.status]) + '</td>' +
      '<td class="cell-num"><div class="db-prog">' +
      '<span class="db-prog-num"><span class="roller" data-r="done" data-roll="' + c.done + '">' + c.done + '</span><span class="db-prog-of"> / ' + fmt(c.total) + '</span></span>' +
      '<span class="progress progress--sm' + (t.status === 'running' ? ' is-live' : '') + '" style="--p: ' + pctOf(c).toFixed(2) + '" aria-hidden="true"><span class="progress-fill"></span></span>' +
      '<span class="db-counts" data-r="counts">' + countsHTML(c) + '</span>' +
      '</div></td>' +
      '<td class="cell-actions"><div class="row">' +
      '<button class="btn btn-ghost btn-sm" type="button" data-act="view" aria-describedby="db-name-' + t.id + '">' + UI.icon('eye') + 'View</button>' +
      actHTML(t, 'sm') +
      '<button class="icon-btn icon-btn--sm" type="button" data-menu="db-task-menu" aria-label="More actions for ' + esc(t.name) + '">' + UI.icon('more') + '</button>' +
      '</div></td></tr>'
    )
  }

  var emptyHTML = function () {
    var cfg = TOOL[S.tool]
    return (
      '<div class="empty db-empty">' +
      '<div class="empty-art" aria-hidden="true"><span class="empty-map"><span class="empty-drop"><span class="empty-pin"></span></span></span>' +
      UI.icon('arrow-right', 'empty-arrow') + '<span class="empty-rows"><i></i><i></i><i></i></span></div>' +
      '<p class="empty-title">' + cfg.emptyTitle + '</p>' +
      '<p class="empty-desc">' + cfg.emptyDesc + '</p>' +
      '<button class="btn btn-primary" type="button" data-act="new">' + UI.icon('plus') + 'New task</button>' +
      '<p class="db-empty-note">Tasks are saved on this device. ' + fmt(slotsUsed()) + ' of 150 slots are in use across both tools.</p>' +
      '</div>'
    )
  }

  var listHTML = function (fresh) {
    var list = tasksOf(S.tool)
    if (!list.length) return emptyHTML()
    var cfg = TOOL[S.tool]
    var run = runningTask()
    var meta = plural(list.length, 'task', 'tasks') + ' · newest first' + (run && run.type === S.tool ? ' · 1 running' : '')
    return (
      '<div class="db-list">' +
      '<div class="db-list-head"><h2 class="h3">' + cfg.list + '</h2><span class="db-list-meta">' + meta + '</span></div>' +
      '<div class="table-wrap"><table class="table table--stagger db-table">' +
      '<caption class="sr-only">' + cfg.list + ', newest first</caption>' +
      '<colgroup><col class="db-col-index" /><col /><col class="db-col-status" /><col class="db-col-progress" /><col class="db-col-actions" /></colgroup>' +
      '<thead><tr><th scope="col">#</th><th scope="col">Task</th><th scope="col">Status</th><th scope="col" class="cell-num">Progress</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>' +
      '<tbody>' +
      list
        .map(function (t) {
          return rowHTML(t, fresh && fresh.indexOf(t.id) >= 0)
        })
        .join('') +
      '</tbody></table></div></div>'
    )
  }

  // 原位更新一行（调度事件）：chip 形变、数字滚动、进度条与光束、计数、主操作换词
  var patchRow = function (t) {
    var row = $('tr[data-task="' + t.id + '"]', el.stage)
    if (!row) return
    var c = Sim.counts(t)
    chip($('.status', row), t.status, TASK_LABEL[t.status], true)
    row.classList.toggle('is-active', t.status === 'running')
    roll($('[data-r="done"]', row), c.done)
    fillBar($('.progress', row), pctOf(c), t.status === 'running')
    $('[data-r="counts"]', row).innerHTML = countsHTML(c)
    morphAct($('[data-act="primary"]', row), t)
  }

  /* ============================================================ 任务详情 */
  // 单项状态 → chip（L7 文案）：Pending / Extracting / Retrying · try n / Completed / Skipped: no progress / Skipped: invalid URL
  var itemState = function (t, it) {
    if (it.status === 'running') return it.tries > 1 ? { kind: 'retry', label: 'Retrying · try ' + it.tries } : { kind: 'extracting', label: 'Extracting' }
    if (it.status === 'complete') return { kind: 'completed', label: 'Completed' }
    if (it.status === 'skipped') return { kind: 'skipped', label: it.skipReason === 'invalid-url' ? 'Skipped: invalid URL' : 'Skipped: no progress' }
    return { kind: 'pending', label: 'Pending' }
  }

  // 评论 URL：主机名淡、路径实（解码 %26 / +，读得出店名）；无效 URL 原样显示且不做成链接
  var valueHTML = function (t, it) {
    if (t.type !== 'reviews') return '<span class="db-kw" title="' + esc(it.value) + '">' + esc(it.value) + '</span>'
    if (!Sim.reviewUrlOk(it.value)) return '<span class="db-url is-invalid" title="' + esc(it.value) + '"><span class="db-url-path">' + esc(it.value) + '</span></span>'
    var bare = it.value.replace(/^https:\/\//, '').replace(/^www\./, '')
    var cut = bare.indexOf('/maps/place/') >= 0 ? bare.indexOf('/maps/place/') + 12 : bare.indexOf('?')
    var path = bare.slice(cut)
    try {
      path = decodeURIComponent(path.replace(/\+/g, ' '))
    } catch (error) {
      // 解码失败就显示原文
    }
    return '<a class="db-url" href="' + esc(it.value) + '" target="_blank" rel="noreferrer" title="' + esc(it.value) + '"><span class="db-url-host">' + esc(bare.slice(0, cut)) + '</span><span class="db-url-path">' + esc(path) + '</span></a>'
  }

  var DOTS = '<span class="db-dots" aria-hidden="true"><i></i><i></i><i></i></span>'
  var NONE = '<span class="db-rec-none">—</span>'
  var recHTML = function (it) {
    if (it.status === 'complete') return fmt(it.collected)
    return it.status === 'running' ? DOTS : NONE
  }

  var itemRowHTML = function (t, it, i) {
    var st = itemState(t, it)
    var on = t.status === 'running' && i === t.cursor
    var cls = on ? ' class="is-active' + (it.tries > 1 ? ' is-retry' : '') + '"' : ''
    return '<tr data-i="' + i + '"' + cls + '><td class="cell-index">' + pad(i + 1, 3) + '</td><td>' + valueHTML(t, it) + '</td><td>' + chipHTML(st.kind, st.label) + '</td><td class="cell-num" data-rec>' + recHTML(it) + '</td></tr>'
  }

  var STAT = {
    completed: { label: 'Completed', icon: 'check-circle', tone: 'tone-ok' },
    records: { label: 'Records', icon: 'database', tone: '' },
    skipped: { label: 'Skipped', icon: 'skip', tone: 'tone-bad' },
    tries: { label: 'Attempts', icon: 'refresh', tone: '' }
  }
  var statSub = function (key, t, c) {
    if (key === 'completed') return c.total ? Math.round((c.complete / c.total) * 100) + '% of ' + TOOL[t.type].many : '—'
    if (key === 'records') return t.type === 'reviews' ? 'Up to ' + fmt(t.perPlace) + ' per place' : 'Rows across all searches'
    if (key === 'skipped') {
      if (!c.skipped) return 'Nothing skipped'
      if (t.type === 'reviews') return fmt(c.stuck) + ' no progress · ' + (c.invalid === 1 ? '1 invalid URL' : fmt(c.invalid) + ' invalid URLs')
      return c.stuck === 1 ? '1 with no progress' : fmt(c.stuck) + ' with no progress'
    }
    return c.retries === 1 ? '1 retry' : fmt(c.retries) + ' retries'
  }
  var statHTML = function (key, t, c) {
    var s = STAT[key]
    var value = key === 'tries' ? c.tries : key === 'skipped' ? c.skipped : c[key === 'completed' ? 'complete' : 'records']
    return (
      '<div class="db-stat ' + s.tone + (key === 'skipped' && c.skipped ? ' is-alert' : '') + '" data-stat="' + key + '">' +
      '<dt>' + UI.icon(s.icon) + s.label + '</dt>' +
      '<dd class="mono"><span class="roller" data-roll="' + value + '">' + value + '</span></dd>' +
      '<span class="db-stat-sub" data-sub>' + esc(statSub(key, t, c)) + '</span></div>'
    )
  }

  // 读数下方的一句话：现在在哪、从哪继续、何时结束
  var stateLine = function (t, c) {
    var cfg = TOOL[t.type]
    var n = t.cursor + 1
    if (t.status === 'running') return 'Working on <b>' + cfg.one + ' ' + fmt(n) + ' of ' + fmt(c.total) + '</b> in a background ' + cfg.tab
    if (t.status === 'paused') return 'Paused — resumes at <b>' + cfg.one + ' ' + fmt(n) + '</b>'
    if (t.status === 'completed') return 'Finished <b>' + Sim.when(t.finishedAt) + '</b>'
    return 'Not started — runs from <b>' + cfg.one + ' 1</b>, in order'
  }
  // 评论 URL 的可读名：Maps place 链接取路径里的店名，评论链接取 placeid 开头，其余原样
  var placeName = function (value) {
    var m = value.match(/\/maps\/place\/([^/@?]+)/)
    if (m) {
      try {
        return decodeURIComponent(m[1].replace(/\+/g, ' '))
      } catch (error) {
        return m[1]
      }
    }
    var id = value.match(/placeid=([A-Za-z0-9_-]+)/)
    return id ? 'Place ID ' + id[1].slice(0, 12) + '…' : value
  }
  var itemsMeta = function (t, c) {
    var it = t.items[t.cursor]
    if (t.status === 'running' && it) return 'Now: <b>#' + fmt(t.cursor + 1) + '</b> ' + esc(t.type === 'reviews' ? placeName(it.value) : it.value)
    if (t.status === 'paused' && it) return 'Resumes at <b>#' + fmt(t.cursor + 1) + '</b>'
    if (t.status === 'completed') return fmt(c.complete) + ' completed · ' + fmt(c.skipped) + ' skipped'
    return plural(c.total, TOOL[t.type].one, TOOL[t.type].many) + ', run in this order'
  }
  var heroMeta = function (t) {
    var cfg = TOOL[t.type]
    var parts = [plural(t.items.length, cfg.one, cfg.many)]
    if (t.perPlace) parts.push('up to ' + fmt(t.perPlace) + ' reviews per place')
    parts.push('created ' + Sim.when(t.createdAt))
    return parts.join(' · ')
  }

  var detailHTML = function (t) {
    var c = Sim.counts(t)
    var cfg = TOOL[t.type]
    var pct = Math.floor(pctOf(c))
    return (
      '<div class="db-detail" data-detail="' + t.id + '">' +
      '<nav class="db-crumbs" aria-label="Breadcrumb">' +
      '<button class="btn btn-ghost btn-sm db-back" type="button" data-act="back">' + UI.icon('arrow-left') + 'Back</button>' +
      '<span class="db-crumb-sep" aria-hidden="true">/</span><span>Task history</span><span class="db-crumb-sep" aria-hidden="true">/</span>' +
      '<span class="db-crumb-current" aria-current="page">' + esc(t.name) + '</span></nav>' +
      '<section class="card db-hero" aria-labelledby="db-name-' + t.id + '">' +
      '<div class="db-hero-head">' +
      '<span class="icon-tile icon-tile--lg icon-tile--soft">' + UI.icon(cfg.icon) + '</span>' +
      '<div class="db-hero-main"><div class="db-hero-title"><h2 class="h2 db-hero-name" id="db-name-' + t.id + '">' + esc(t.name) + '</h2>' + chipHTML(t.status, TASK_LABEL[t.status]) + '</div>' +
      '<p class="db-hero-meta">' + esc(heroMeta(t)) + '</p></div>' +
      '<div class="db-hero-actions">' + actHTML(t, 'lg') +
      '<button class="icon-btn icon-btn--bordered" type="button" data-menu="db-task-menu" aria-label="More actions for ' + esc(t.name) + '">' + UI.icon('more') + '</button></div>' +
      '</div>' +
      '<div class="db-meter">' +
      '<div class="db-meter-read"><span class="db-big mono"><span class="roller" data-h="done" data-roll="' + c.done + '">' + c.done + '</span></span>' +
      '<span class="db-big-of mono">/ ' + fmt(c.total) + '</span><span class="db-meter-label">' + cfg.many + ' processed</span>' +
      '<span class="db-pct mono"><span class="roller" data-h="pct" data-roll="' + pct + '">' + pct + '</span>%</span></div>' +
      '<span class="progress progress--lg' + (t.status === 'running' ? ' is-live' : '') + '" style="--p: ' + pctOf(c).toFixed(2) + '" role="progressbar" aria-label="' + esc(t.name) + ' progress" aria-valuemin="0" aria-valuemax="' + c.total + '" aria-valuenow="' + c.done + '" data-h="bar"><span class="progress-fill"></span></span>' +
      '<div class="db-meter-foot"><span data-h="line">' + stateLine(t, c) + '</span><span>Each ' + cfg.one + ' downloads its own file when it finishes</span></div>' +
      '</div>' +
      '<dl class="db-stats">' + statHTML('completed', t, c) + statHTML('records', t, c) + statHTML('skipped', t, c) + statHTML('tries', t, c) + '</dl>' +
      '<div class="notice db-keep" data-h="keep"' + (t.status === 'running' ? '' : ' hidden') + '>' + UI.icon('info') +
      '<div><p class="notice-title">Keep the browser open while this task runs</p>' +
      '<p class="notice-desc">Each ' + cfg.one + ' opens in its own tab and closes when it’s done. Going back or closing this page doesn’t pause the task — progress is saved as it goes.</p></div></div>' +
      '</section>' +
      '<section class="db-items" aria-labelledby="db-items-title">' +
      '<header class="db-items-head"><h3 class="h3" id="db-items-title">' + cfg.Many + '</h3><span class="db-items-meta" data-h="meta">' + itemsMeta(t, c) + '</span></header>' +
      '<div class="table-wrap db-items-wrap" role="region" tabindex="0" aria-labelledby="db-items-title" data-h="wrap">' +
      '<table class="table table--compact table--stagger db-items-table"><caption class="sr-only">' + cfg.Many + ' in ' + esc(t.name) + ', in run order</caption>' +
      '<colgroup><col class="db-col-index" /><col /><col class="db-col-status" /><col class="db-col-rec" /></colgroup>' +
      '<thead><tr><th scope="col">#</th><th scope="col">' + cfg.col + '</th><th scope="col">Status</th><th scope="col" class="cell-num">Records</th></tr></thead>' +
      '<tbody>' +
      t.items
        .map(function (it, i) {
          return itemRowHTML(t, it, i)
        })
        .join('') +
      '</tbody></table></div>' +
      '<button class="btn btn-secondary btn-sm db-jump" type="button" data-act="jump" hidden>' + UI.icon('arrow-down') + 'Jump to current ' + cfg.one + '</button>' +
      '</section></div>'
    )
  }

  // 原位更新一个条目行：chip 形变、记录数（完成时从 0 滚到终值）、当前行高亮、完成 / 跳过闪一次
  var paintItem = function (t, i, animate) {
    var row = $('tr[data-i="' + i + '"]', el.stage)
    if (!row) return
    var it = t.items[i]
    var st = itemState(t, it)
    var on = t.status === 'running' && i === t.cursor && it.status === 'running'
    row.classList.toggle('is-active', on)
    row.classList.toggle('is-retry', on && it.tries > 1)
    chip($('.status', row), st.kind, st.label, animate)
    var rec = $('[data-rec]', row)
    var kind = it.status === 'complete' ? 'n' + it.collected : it.status === 'running' ? 'live' : 'none'
    if (rec.dataset.k === kind) return
    rec.dataset.k = kind
    if (it.status === 'complete' && animate && !still()) {
      rec.innerHTML = '<span class="roller db-rec-roll">0</span>'
      var r = $('.roller', rec)
      MG.roll(r, 0, { instant: true })
      requestAnimationFrame(function () {
        MG.roll(r, it.collected)
      })
      // 滚完后回到与其他行一致的普通数字（强调只留在落定那一下）
      setTimeout(function () {
        if (rec.dataset.k === kind) rec.textContent = fmt(it.collected)
      }, dur('--dur-5', 480) + 900)
    } else rec.innerHTML = recHTML(it)
    if (animate && !still() && (it.status === 'complete' || it.status === 'skipped')) MG.replay(row, 'is-flash')
  }

  var patchDetail = function (t, i, type) {
    var root = $('[data-detail="' + t.id + '"]', el.stage)
    if (!root) return
    var c = Sim.counts(t)
    var h = function (key) {
      return $('[data-h="' + key + '"]', root)
    }
    chip($('.db-hero-title .status', root), t.status, TASK_LABEL[t.status], true)
    morphAct($('.db-hero-actions [data-act="primary"]', root), t)
    roll(h('done'), c.done)
    roll(h('pct'), Math.floor(pctOf(c)))
    var bar = h('bar')
    fillBar(bar, pctOf(c), t.status === 'running')
    bar.setAttribute('aria-valuenow', c.done)
    h('line').innerHTML = stateLine(t, c)
    h('meta').innerHTML = itemsMeta(t, c)
    var keep = h('keep')
    keep.hidden = t.status !== 'running'
    $$('.db-stat', root).forEach(function (node) {
      var key = node.dataset.stat
      roll($('.roller', node), key === 'tries' ? c.tries : key === 'skipped' ? c.skipped : key === 'completed' ? c.complete : c.records)
      $('[data-sub]', node).textContent = statSub(key, t, c)
      if (key === 'skipped') node.classList.toggle('is-alert', c.skipped > 0)
    })
    if (type === 'task') {
      // 启动 / 暂停 / 重跑 / 完成：整列重新对齐（重跑会清零所有条目），只有当前行做形变
      t.items.forEach(function (it, k) {
        paintItem(t, k, k === t.cursor)
      })
    } else if (i != null) {
      paintItem(t, i, true)
      // 级联跳过（无效 URL）后游标前进：前一个活动行要去掉高亮
      $$('tr.is-active', root).forEach(function (row) {
        if (Number(row.dataset.i) !== t.cursor) paintItem(t, Number(row.dataset.i), false)
      })
    }
    follow(root)
  }

  // 当前行保持在视野内：只滚条目表自己的容器，不动整页；用户 4 秒内手动滚过就不抢，改为显示「跳到当前」
  var follow = function (root, force) {
    var wrap = $('[data-h="wrap"]', root)
    var jump = $('[data-act="jump"]', root)
    if (!wrap) return
    var row = $('tr.is-active', wrap)
    if (!row) {
      jump.hidden = true
      return
    }
    if (!force && Date.now() - (wrap._userAt || 0) < 4000) {
      checkJump(root)
      return
    }
    // 当前行停在可视区约 38% 处，并对齐行边界（吸顶表头下不露半行）
    var delta = row.getBoundingClientRect().top - wrap.getBoundingClientRect().top
    var head = $('thead', wrap)
    var headH = head ? head.offsetHeight : 0
    var rowH = row.offsetHeight || 44
    var lead = Math.floor(((wrap.clientHeight - headH) * 0.38) / rowH)
    var target = Math.max(0, wrap.scrollTop + delta - headH - lead * rowH)
    if (Math.abs(target - wrap.scrollTop) < 4) return
    wrap._autoAt = Date.now()
    wrap.scrollTo({ top: target, behavior: still() || force === 'instant' ? 'auto' : 'smooth' })
    jump.hidden = true
  }
  var checkJump = function (root) {
    var wrap = $('[data-h="wrap"]', root)
    var jump = $('[data-act="jump"]', root)
    var row = wrap && $('tr.is-active', wrap)
    if (!row) {
      if (jump) jump.hidden = true
      return
    }
    var a = row.getBoundingClientRect()
    var b = wrap.getBoundingClientRect()
    jump.hidden = a.top >= b.top + 36 && a.bottom <= b.bottom
  }
  var bindFollow = function (root) {
    var wrap = $('[data-h="wrap"]', root)
    if (!wrap) return
    var mark = function () {
      wrap._userAt = Date.now()
    }
    wrap.addEventListener('wheel', mark, { passive: true })
    wrap.addEventListener('touchmove', mark, { passive: true })
    wrap.addEventListener('keydown', mark)
    wrap.addEventListener('pointerdown', mark)
    wrap.addEventListener('scroll', function () {
      if (wrap._raf) return
      wrap._raf = requestAnimationFrame(function () {
        wrap._raf = 0
        checkJump(root)
      })
    }, { passive: true })
  }

  /* ============================================================ 视图切换 */
  // history ⇄ detail 是层级：进入详情从右滑入，返回从左滑入；切工具是同层，上下交叉淡化。
  // 旧内容先淡出（T1），再换内容并入场（T2）；连续切换只认最后一次
  var swapSeq = 0
  var swap = function (render, dir, instant) {
    var seq = ++swapSeq
    var stage = el.stage
    var apply = function () {
      if (seq !== swapSeq) return
      stage.innerHTML = render()
      MG.init(stage)
      UI.init(stage)
      Proto.refresh(stage)
      var root = $('[data-detail]', stage)
      if (root) {
        bindFollow(root)
        requestAnimationFrame(function () {
          follow(root, 'instant')
        })
      }
      if (instant || still() || !stage.firstElementChild) return
      var x = dir || 0
      stage.firstElementChild.animate(
        [
          { opacity: 0, transform: 'translate3d(' + 18 * x + 'px, ' + (x ? 0 : 8) + 'px, 0)' },
          { opacity: 1, transform: 'none' }
        ],
        { duration: dur('--dur-3', 280) + 60, easing: EMPH }
      )
    }
    var old = stage.firstElementChild
    if (instant || still() || !old || el.stage.closest('[hidden]')) {
      apply()
      return
    }
    var x = dir || 0
    old
      .animate(
        [
          { opacity: 1, transform: 'none' },
          { opacity: 0, transform: 'translate3d(' + -12 * x + 'px, ' + (x ? 0 : -4) + 'px, 0)' }
        ],
        { duration: dur('--dur-1', 120) + 20, easing: 'ease-in', fill: 'forwards' }
      )
      .finished.then(apply, apply)
  }

  var renderStage = function (dir, fresh, instant) {
    swap(function () {
      if (S.view === 'detail') {
        var t = find(S.detailId)
        if (t) return detailHTML(t)
        S.view = 'history'
      }
      return listHTML(fresh)
    }, dir, instant)
  }

  /* ============================================================ 新建表单 */
  var lastForm = { n: -1, keys: '' }
  var readForm = function () {
    var p = Sim.parse(el.items.value)
    var n = p.values.length
    var per = Sim.perItem(S.tool, Number(el.perplace.value))
    var need = n * per
    var left = Sim.left()
    return {
      p: p,
      n: n,
      name: el.name.value.trim(),
      tasks: Math.max(1, Math.ceil(n / Sim.LIMITS.maxItems)),
      per: per,
      need: need,
      left: left,
      over: n > 0 && need > left,
      invalid: S.tool === 'reviews'
        ? p.values.filter(function (v) {
            return !Sim.reviewUrlOk(v)
          }).length
        : 0
    }
  }

  // 清理反馈：每条一句完整文案（复数各自成句，不拼片段）
  var cleanupHTML = function (f) {
    var out = []
    var chipOf = function (key, icon, html, warn) {
      out.push({ key: key, html: '<span class="db-clean' + (warn ? ' db-clean--warn' : '') + '" data-k="' + key + '">' + UI.icon(icon) + '<span>' + html + '</span></span>' })
    }
    if (f.p.dupes) chipOf('d', 'copy', f.p.dupes === 1 ? '<b>1</b> duplicate removed' : '<b>' + fmt(f.p.dupes) + '</b> duplicates removed')
    if (f.p.empty) chipOf('e', 'minus', f.p.empty === 1 ? '<b>1</b> empty line removed' : '<b>' + fmt(f.p.empty) + '</b> empty lines removed')
    if (f.invalid) {
      chipOf('i', 'alert', f.invalid === 1 ? '<b>1</b> link isn’t a Google Maps place or review link — it will be skipped' : '<b>' + fmt(f.invalid) + '</b> links aren’t Google Maps place or review links — they will be skipped', true)
    }
    return out
  }

  var renderForm = function () {
    var f = readForm()
    var cfg = TOOL[S.tool]
    var split = f.tasks > 1

    // 计数胶囊：n / 500；超过 500 换主色并带出任务数
    el.counter.innerHTML = '<b>' + fmt(f.n) + '</b> / 500' + (split ? '<span class="db-counter-split">· ' + f.tasks + ' tasks</span>' : '')
    el.counter.classList.toggle('is-split', split)
    el.counter.classList.toggle('is-near', !split && f.n >= 450)
    if (lastForm.n >= 0 && f.n !== lastForm.n && !still()) MG.replay(el.counter, 'is-bump')

    var chips = cleanupHTML(f)
    var keys = chips
      .map(function (c) {
        return c.key
      })
      .join('')
    el.cleanup.innerHTML = chips.length
      ? chips
          .map(function (c) {
            return c.html
          })
          .join('')
      : '<p class="field-hint">' + UI.icon('info') + 'Duplicates and empty lines are removed automatically. The order is kept.</p>'
    if (!still()) {
      $$('.db-clean', el.cleanup).forEach(function (node) {
        if (lastForm.keys.indexOf(node.dataset.k) < 0) node.classList.add('is-new')
      })
    }
    lastForm = { n: f.n, keys: keys }

    // 摘要：条数 → 任务数
    roll(el.sumCount, f.n)
    el.sumUnit.textContent = f.n === 1 ? cfg.one : cfg.many
    el.sumTasks.textContent = f.n ? (f.tasks === 1 ? '1 task' : f.tasks + ' tasks') : 'no task yet'
    el.sumTasks.classList.toggle('is-split', split)
    el.sumDesc.textContent = !f.n
      ? 'Paste a list to see how it will be saved.'
      : split
        ? fmt(f.n) + ' ' + cfg.many + ' will be saved as ' + f.tasks + ' tasks, with up to 500 ' + cfg.many + ' each.'
        : 'Saved as one task. ' + cfg.Many + ' run one at a time, in order.'
    paintSplit(f)
    paintQuota(f)

    // 按钮：拆分时 Start extracting → Start first task，Create task → Create k tasks
    el.createSplit.textContent = 'Create ' + f.tasks + ' tasks'
    var key = split ? 'split' : 'one'
    if (el.startLabel.querySelector('.is-active').dataset.key !== key) {
      if (still()) {
        ;[el.startLabel, el.createLabel].forEach(function (box) {
          $$('[data-key]', box).forEach(function (s) {
            s.classList.toggle('is-active', s.dataset.key === key)
            s.classList.remove('is-leaving')
            if (s.dataset.key === key) s.removeAttribute('aria-hidden')
            else s.setAttribute('aria-hidden', 'true')
          })
        })
      } else {
        UI.morph(el.startLabel, key)
        UI.morph(el.createLabel, key)
      }
    }
    el.clear.disabled = !el.items.value && !el.name.value
    // 按钮旁的一句原因：额度不够优先（点了也会失败），否则提示另一任务在跑（新任务会排队）
    var run = runningTask()
    el.footHint.hidden = !f.over && !run
    el.footHint.dataset.tone = f.over ? 'quota' : 'run'
    if (f.over) el.footHintText.textContent = 'Not enough records left this month for this list. See Quota check.'
    else if (run) el.footHintText.innerHTML = q(run.name) + ' is running. A new task waits in Task history until it finishes.'
  }

  var paintSplit = function (f) {
    el.split.hidden = f.tasks < 2
    if (f.tasks < 2) return
    el.splitNote.textContent = 'Start first task runs task 1 now. Start ' + (f.tasks === 2 ? 'task 2' : 'the others') + ' from Task history when it finishes.'
    var base = f.name || 'Untitled'
    var sizes = []
    for (var k = 0; k < f.tasks; k++) sizes.push(Math.min(Sim.LIMITS.maxItems, f.n - k * Sim.LIMITS.maxItems))
    var sig = sizes.join(',')
    if (el.splitBar.dataset.sig !== sig) {
      el.splitBar.dataset.sig = sig
      el.splitBar.innerHTML = sizes
        .map(function (s, k) {
          return '<li style="--w: ' + s + '; --i: ' + k + '"></li>'
        })
        .join('')
    }
    var shown = sizes.slice(0, 5)
    el.splitList.innerHTML =
      shown
        .map(function (s, k) {
          return '<li><i class="db-split-key" aria-hidden="true"></i><span class="db-split-name">' + esc(base) + '_' + (k + 1) + '</span><span class="db-split-n">' + fmt(s) + '</span></li>'
        })
        .join('') + (sizes.length > 5 ? '<li><span class="db-split-name">and ' + (sizes.length - 5) + ' more</span></li>' : '')
  }

  // 额度检查（quota.ts）：关键词 ×10、评论 × 每店上限；与本月剩余比较，超出给原因 + 下一步（L2 / L3）
  var shortfallHint = function (f) {
    var cfg = TOOL[S.tool]
    var keep = Math.floor(f.left / f.per)
    var cut = f.n - keep
    var parts = []
    if (keep > 0) parts.push('remove ' + plural(cut, cfg.one, cfg.many))
    if (S.tool === 'reviews') {
      var fit = Math.floor(f.left / f.n / 100) * 100
      if (fit >= 100 && fit < f.per) parts.push('lower reviews per place to ' + fmt(fit))
    }
    parts.push('upgrade your plan')
    var last = parts.pop()
    var first = parts.join(', ')
    var text = first ? first + (parts.length > 1 ? ', or ' : ' or ') + last : last
    return text.charAt(0).toUpperCase() + text.slice(1) + '.'
  }
  var quotaDesc = function (f) {
    return 'This list needs ' + fmt(f.need) + ' records for the quota check, but ' + fmt(f.left) + ' are left this month. ' + shortfallHint(f)
  }
  var paintQuota = function (f) {
    var u = Sim.usage
    el.quota.dataset.state = !f.n ? 'idle' : f.over ? 'over' : 'some'
    el.quotaRule.textContent = S.tool === 'reviews' ? fmt(f.per) + ' per place' : '10 per keyword'
    roll(el.quotaNeed, f.need)
    var usedPct = (u.used / u.total) * 100
    var taskPct = (Math.min(f.need, f.left) / u.total) * 100
    el.qbar.style.setProperty('--used', usedPct.toFixed(2))
    el.qbar.style.setProperty('--task', taskPct.toFixed(3))
    el.qUsed.textContent = fmt(u.used)
    el.qTask.textContent = fmt(f.need)
    el.qAfter.textContent = f.over ? '−' + fmt(f.need - f.left) : fmt(f.left - f.need)
    el.qNote.textContent = fmt(f.left) + ' of ' + fmt(u.total) + ' records left this month · resets ' + u.reset
    el.qWarn.hidden = !f.over
    if (f.over) el.qWarnDesc.textContent = quotaDesc(f)
  }

  /* ---------------------------------------------------------- 校验与提交 */
  var setFieldError = function (key, on) {
    var input = key === 'name' ? el.name : el.items
    var err = key === 'name' ? el.nameErr : el.itemsErr
    err.hidden = !on
    if (on) input.setAttribute('aria-invalid', 'true')
    else input.removeAttribute('aria-invalid')
  }
  var shake = function (node) {
    if (still()) return
    MG.replay(node, node.matches('.input, .textarea') ? 'is-shake' : 'db-shake')
  }

  var validate = function (f, focus) {
    var bad = []
    if (!f.name) bad.push('name')
    if (!f.n) bad.push('items')
    setFieldError('name', bad.indexOf('name') >= 0)
    setFieldError('items', bad.indexOf('items') >= 0)
    if (!bad.length) return true
    var first = bad[0] === 'name' ? el.name : el.items
    bad.forEach(function (k) {
      shake(k === 'name' ? el.name : el.items)
    })
    if (focus) first.focus({ preventScroll: true })
    if (focus && first.getBoundingClientRect().top < 80) first.scrollIntoView({ block: 'center', behavior: still() ? 'auto' : 'smooth' })
    say(bad.length === 2 ? 'Enter a task name and paste at least one line.' : bad[0] === 'name' ? 'Enter a task name.' : TOOL[S.tool].emptyErr)
    return false
  }

  var alertFull = function (f) {
    var free = Sim.LIMITS.maxTasks - slotsUsed()
    showAlert({
      tone: 'bad',
      title: 'Task list is full',
      descHtml:
        f.tasks > 1 && free > 0
          ? 'This list needs ' + f.tasks + ' tasks, but only ' + free + ' of 150 slots ' + (free === 1 ? 'is' : 'are') + ' free across both tools. Delete finished tasks in Task history, then try again.'
          : 'All 150 task slots are in use across both tools. Delete finished tasks in Task history, then create this one again.',
      actions: [{ label: 'Open Task history', icon: 'history', primary: true, run: function () { Proto.set('view', 'history') } }]
    })
  }
  // 表单额度不足：原因已在右栏 Quota check 与按钮旁，提交时把视线引过去，不再叠一条同文案的顶部提示
  var flagQuota = function (f) {
    var box = el.quota.getBoundingClientRect()
    if (box.top < 0 || box.bottom > innerHeight) el.quota.scrollIntoView({ block: 'center', behavior: still() ? 'auto' : 'smooth' })
    shake(el.quota)
    shake(el.footHint)
    say('Not enough records left this month. ' + quotaDesc(f))
  }

  var clearForm = function () {
    el.name.value = ''
    el.items.value = ''
    setFieldError('name', false)
    setFieldError('items', false)
    renderForm()
  }

  // 保存：拆分只在输入边界完成（与现有 createTasks 一致：名字 _1 _2 …），每个任务仍是单一持久模型
  var saveTasks = function (f) {
    var made = []
    for (var k = 0; k < f.tasks; k++) {
      var t = Sim.createTask({
        seq: nextSeq(S.tool),
        name: f.tasks > 1 ? f.name + '_' + (k + 1) : f.name,
        type: S.tool,
        values: f.p.values.slice(k * Sim.LIMITS.maxItems, (k + 1) * Sim.LIMITS.maxItems),
        perPlace: S.tool === 'reviews' ? f.per : null,
        plans: k === 0 ? S.flowPlans : null
      })
      S.tasks.push(t)
      made.push(t)
    }
    return made
  }

  var busy = function (btn, on) {
    btn.classList.toggle('is-loading', on)
    if (on) btn.setAttribute('aria-busy', 'true')
    else btn.removeAttribute('aria-busy')
  }

  var submit = function (startNow) {
    var f = readForm()
    if (!validate(f, true)) return Promise.resolve(false)
    clearAlert()
    var btn = startNow ? el.start : el.create
    busy(btn, true)
    // 原型模拟一次 RPC（创建 + 服务端额度预估）
    return MG.wait(still() ? 0 : 560).then(function () {
      busy(btn, false)
      if (slotsUsed() + f.tasks > Sim.LIMITS.maxTasks) {
        alertFull(f)
        return false
      }
      if (f.over) {
        flagQuota(f)
        return false
      }
      var made = saveTasks(f)
      clearForm()
      paintChrome()
      if (!startNow) {
        showAlert({
          tone: 'ok',
          auto: true,
          title: made.length === 1 ? 'Task saved' : 'Saved ' + made.length + ' tasks',
          descHtml: made.length === 1 ? q(made[0].name) + ' is at the top of Task history. Start it whenever you’re ready.' : 'They’re at the top of Task history. Start them one at a time.'
        })
        goHistory(made)
        return true
      }
      var first = made[0]
      var res = Sim.engine.start(first, S.tasks)
      if (!res.ok) {
        alertNotStarted(first, res.running)
        return true
      }
      openDetail(first, 1)
      if (made.length > 1) {
        showAlert({
          tone: 'ok',
          auto: true,
          title: 'The first of ' + made.length + ' tasks is running',
          descHtml: 'The other ' + (made.length - 1 === 1 ? 'task is' : made.length - 1 + ' tasks are') + ' saved in Task history. Start ' + (made.length - 1 === 1 ? 'it' : 'them') + ' when this one finishes.'
        })
      }
      return true
    })
  }

  var alertNotStarted = function (t, run) {
    showAlert({
      tone: 'warn',
      title: 'Saved, but not started',
      descHtml: q(run.name) + ' is still running, and only one task runs at a time. Start ' + q(t.name) + ' from Task history when it finishes.',
      actions: [
        { label: 'View running task', icon: 'eye', primary: true, run: function () { openDetail(run, 1) } },
        { label: 'Open Task history', run: function () { goHistory([t]) } }
      ]
    })
  }
  var alertMutex = function (t, run) {
    showAlert({
      tone: 'warn',
      title: 'Another task is running',
      descHtml: 'Only one task runs at a time. Pause ' + q(run.name) + ' or wait for it to finish, then start ' + q(t.name) + '.',
      actions: [{ label: 'View running task', icon: 'eye', primary: true, run: function () { openDetail(run, 1) } }]
    })
  }

  /* ---------------------------------------------------------- 任务操作 */
  var goHistory = function (fresh) {
    var from = S.view
    S.view = 'history'
    S.hidden = null
    syncDock('view', 'history')
    paintTopTabs()
    renderStage(from === 'detail' ? -1 : 0, fresh && fresh.map(function (t) { return t.id }))
    paintChrome()
  }

  var openDetail = function (t, dir) {
    if (t.type !== S.tool) {
      S.tool = t.type
      syncDock('tool', t.type)
      paintToolCopy()
      Proto.refresh(doc)
      renderForm()
    }
    S.view = 'detail'
    S.detailId = t.id
    S.hidden = null
    syncDock('view', 'detail')
    if (t.focus) syncDock('task', t.status)
    paintTopTabs()
    renderStage(dir == null ? 1 : dir)
    paintChrome()
    el.appbar.classList.toggle('is-scrolled', scrollY > 8)
  }

  var back = function () {
    var t = find(S.detailId)
    goHistory()
    if (t && t.status === 'running') {
      UI.toast({
        tone: 'primary',
        icon: 'info',
        title: qt(t.name) + ' keeps running',
        desc: 'Back doesn’t pause the task. Open it again from the Running bar at the top.',
        action: { label: 'View task', onClick: function () { openDetail(t, 1) } }
      })
    }
  }

  // 估算续跑所需额度：未完成的条目（Run again = 全部条目，提案：现状 startTask 只数 pending）
  var startNeed = function (t) {
    var n = t.status === 'completed' ? t.items.length : t.items.filter(function (it) { return it.status === 'pending' }).length
    return Sim.estimate(t.type, n, t.perPlace)
  }

  var primary = function (t) {
    if (t.status === 'running') {
      Sim.engine.pause(t)
      return
    }
    var need = startNeed(t)
    if (need > Sim.left()) {
      showAlert({
        tone: 'bad',
        title: 'Not enough records left to start ' + qt(t.name),
        descHtml: 'It needs ' + fmt(need) + ' records for the quota check and ' + fmt(Sim.left()) + ' are left this month. Upgrade your plan, or wait until the quota resets on ' + Sim.usage.reset + '.',
        actions: [{ label: 'View plans', icon: 'crown', primary: true, run: function () { link('Pricing') } }]
      })
      return
    }
    var res = Sim.engine.start(t, S.tasks)
    if (!res.ok) {
      alertMutex(t, res.running)
      return
    }
    clearAlert()
  }

  /* ---------------------------------------------------------- More 菜单（L6） */
  var menuTask = null
  el.menu.addEventListener('beforetoggle', function (e) {
    if (e.newState !== 'open') return
    var trigger = el.menu._trigger
    var host = trigger && trigger.closest('[data-task], [data-detail]')
    menuTask = host ? find(host.dataset.task || host.dataset.detail) : null
    if (!menuTask) return
    var c = Sim.counts(menuTask)
    var set = function (value, n) {
      var item = $('[data-value="' + value + '"]', el.menu)
      $('.menu-item-meta', item).textContent = fmt(n)
      if (n) item.removeAttribute('aria-disabled')
      else item.setAttribute('aria-disabled', 'true')
    }
    set('copy-completed', c.complete)
    set('copy-pending', c.open)
    set('copy-all', c.total)
  })

  var copy = function (t, scope) {
    var cfg = TOOL[t.type]
    var list = t.items
      .filter(function (it) {
        return scope === 'all' || (scope === 'completed' ? it.status === 'complete' : it.status !== 'complete')
      })
      .map(function (it) {
        return it.value
      })
    var desc = {
      completed: 'Completed ' + cfg.many + ' from ' + t.name + '.',
      pending: 'Everything not completed yet, including skipped ' + cfg.many + ' — paste them into a new task to try again.',
      all: 'Every ' + cfg.one + ' in ' + t.name + ', in run order.'
    }[scope]
    var done = function () {
      UI.toast({ tone: 'ok', icon: 'copy', title: 'Copied ' + plural(list.length, cfg.one, cfg.many), desc: desc })
    }
    var fail = function () {
      UI.toast({ tone: 'bad', title: 'Couldn’t copy to the clipboard', desc: 'The browser blocked clipboard access. Allow it for this page, then try again.' })
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(list.join('\n')).then(done, fail)
    else fail()
  }

  var removeTask = function (t) {
    Sim.engine.remove(t)
    S.tasks = S.tasks.filter(function (x) {
      return x !== t
    })
    UI.toast({ tone: 'ok', icon: 'trash', title: 'Task deleted', desc: t.name + ' and its saved progress were removed.' })
    say('Deleted ' + t.name)
    if (S.view === 'detail') {
      goHistory()
      return
    }
    var row = $('tr[data-task="' + t.id + '"]', el.stage)
    if (!row || still()) {
      renderStage(0)
      paintChrome()
      return
    }
    // 离场：行淡出右移，下面的行 FLIP 上移
    var rest = $$('tr', row.parentNode).filter(function (r) {
      return r !== row
    })
    var before = rest.map(function (r) {
      return r.getBoundingClientRect().top
    })
    row.classList.add('is-leaving')
    setTimeout(function () {
      row.remove()
      rest.forEach(function (r, k) {
        var dy = before[k] - r.getBoundingClientRect().top
        if (dy) r.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: dur('--dur-3', 280) + 80, easing: EMPH })
      })
      if (!tasksOf(S.tool).length) renderStage(0)
      paintChrome()
      var head = $('.db-list-meta', el.stage)
      if (head) head.textContent = plural(tasksOf(S.tool).length, 'task', 'tasks') + ' · newest first' + (runningTask() && runningTask().type === S.tool ? ' · 1 running' : '')
    }, dur('--dur-3', 280))
  }

  var confirmDelete = function (t) {
    return UI.confirm({
      title: 'Delete this task?',
      descHtml:
        (t.status === 'running' ? '<b>' + esc(t.name) + '</b> is running — deleting it stops the task. ' : '<b>' + esc(t.name) + '</b> and its saved progress will be removed. ') +
        'Files that were already downloaded stay on your computer. This can’t be undone.',
      icon: 'trash',
      danger: true,
      confirmLabel: 'Delete task',
      cancelLabel: 'Cancel'
    }).then(function (yes) {
      if (yes && find(t.id)) removeTask(t)
      return yes
    })
  }

  el.menu.addEventListener('ui:select', function (e) {
    var t = menuTask
    if (!t) return
    var v = e.detail.value
    if (v === 'delete') confirmDelete(t)
    else copy(t, v.replace('copy-', ''))
  })

  /* ============================================================ 调度事件 → 原位更新 */
  var STATUS_SAY = {
    running: function (t) { return t.name + ' is running.' },
    paused: function (t) { return t.name + ' is paused.' },
    completed: function (t) {
      var c = Sim.counts(t)
      return t.name + ' finished: ' + c.complete + ' completed, ' + c.skipped + ' skipped.'
    },
    idle: function (t) { return t.name + ' is idle.' }
  }
  Sim.engine.on(function (type, t, i) {
    if (S.view === 'detail' && S.detailId === t.id) patchDetail(t, i, type)
    else if (S.view !== 'new' && t.type === S.tool) patchRow(t)
    paintChrome()
    if (S.view === 'new') renderForm()
    if (t.focus && t.type === S.tool) syncDock('task', t.status)
    if (type === 'task') {
      say(STATUS_SAY[t.status](t))
      if (t.status === 'completed' && !(S.view === 'detail' && S.detailId === t.id)) {
        var c = Sim.counts(t)
        UI.toast({ tone: 'ok', title: qt(t.name) + ' finished', desc: fmt(c.complete) + ' completed · ' + fmt(c.skipped) + ' skipped · ' + fmt(c.records) + ' records', action: { label: 'View task', onClick: function () { openDetail(t, 1) } } })
      }
      var head = $('.db-list-meta', el.stage)
      if (head) head.textContent = plural(tasksOf(S.tool).length, 'task', 'tasks') + ' · newest first' + (runningTask() && runningTask().type === S.tool ? ' · 1 running' : '')
    } else if (type === 'done' || type === 'skip') {
      var cc = Sim.counts(t)
      say(t.name + ': ' + cc.done + ' of ' + cc.total + ' processed.', true)
    }
  })

  /* ============================================================ 事件绑定 */
  el.stage.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]')
    if (!btn) return
    var act = btn.dataset.act
    var host = btn.closest('[data-task], [data-detail]')
    var t = host && find(host.dataset.task || host.dataset.detail)
    if (act === 'view' && t) openDetail(t, 1)
    else if (act === 'primary' && t) primary(t)
    else if (act === 'back') back()
    else if (act === 'new') Proto.set('view', 'new')
    else if (act === 'jump') {
      var root = $('[data-detail]', el.stage)
      $('[data-h="wrap"]', root)._userAt = 0
      follow(root, true)
    }
  })

  el.runpill.addEventListener('click', function () {
    var run = runningTask()
    if (run) openDetail(run, 1)
  })
  el.help.addEventListener('click', function (e) {
    e.preventDefault()
    link('Help & FAQ')
  })
  $('[data-db-plans]').addEventListener('click', function (e) {
    e.preventDefault()
    link('Pricing')
  })

  el.tool.addEventListener('ui:change', function (e) {
    Proto.set('tool', e.detail.value)
  })
  // 用户点标签（程序化选中由 tabbing 挡掉）：详情里再点 Task history 回到列表
  el.tabs.addEventListener('ui:change', function (e) {
    if (tabbing) return
    var v = e.detail.value
    if (v !== S.view) Proto.set('view', v)
  })

  var formFrame = 0
  var onFormInput = function (e) {
    if (e && e.target === el.name && el.name.value.trim()) setFieldError('name', false)
    if (e && e.target === el.items && el.items.value.trim()) setFieldError('items', false)
    if (formFrame) return
    formFrame = requestAnimationFrame(function () {
      formFrame = 0
      renderForm()
    })
  }
  el.name.addEventListener('input', onFormInput)
  el.items.addEventListener('input', onFormInput)
  el.perplace.addEventListener('change', onFormInput)
  el.form.addEventListener('submit', function (e) {
    e.preventDefault()
    submit(true)
  })
  el.create.addEventListener('click', function () {
    submit(false)
  })
  el.clear.addEventListener('click', function () {
    clearForm()
    clearAlert()
    el.name.focus()
  })

  var ticking = false
  window.addEventListener(
    'scroll',
    function () {
      if (ticking) return
      ticking = true
      requestAnimationFrame(function () {
        ticking = false
        el.appbar.classList.toggle('is-scrolled', scrollY > 8)
      })
    },
    { passive: true }
  )

  /* ============================================================ 状态坞 */
  // syncDock：页面自己改了状态（点了按钮）时，把状态坞与 URL 对齐，不触发摆放逻辑
  var syncing = false
  var syncDock = function (group, value) {
    if (Proto.get(group) === null || Proto.get(group) === value) return
    syncing = true
    Proto.set(group, value)
    syncing = false
  }

  // 表单草稿按工具分开存：切工具不丢已输入的内容
  var drafts = {}
  var saveDraft = function (tool) {
    drafts[tool] = { name: el.name.value, text: el.items.value, per: el.perplace.value }
  }

  var rebuildWorld = function (fill) {
    var keep = { keywords: focusOf('keywords').status, reviews: focusOf('reviews').status }
    var mine = S.tasks.filter(function (t) {
      return t.id.charAt(0) === 'n'
    })
    Sim.engine.halt()
    S.fill = fill
    S.tasks = Sim.world({ fill: fill }).concat(mine)
    ;['keywords', 'reviews'].forEach(function (tool) {
      var f = focusOf(tool)
      Sim.snapshot(f, keep[tool], { at: f.at, retrying: keep[tool] === 'running' && S.item === 'retrying' })
    })
    var run = runningTask()
    if (run) Sim.engine.adopt(run)
  }

  // 把当前工具的重点任务摆到某个状态；running 时先暂停别的运行中任务（互斥）
  var applyTask = function (v) {
    var f = focusOf(S.tool)
    var run = runningTask()
    if (v === 'running' && run && run !== f) Sim.engine.pause(run)
    if (Sim.engine.task === f) Sim.engine.halt()
    Sim.snapshot(f, v, { at: f.at, retrying: v === 'running' && S.item === 'retrying' })
    if (v !== 'running') return
    Sim.engine.adopt(f)
    // 深链里的「第 2 次尝试」多停一会儿便于查看，之后照常成功并继续下一条
    if (S.item === 'retrying') Sim.engine.script(f, ['done'], 8000)
  }

  var refreshAll = function (dir) {
    renderStage(dir || 0)
    renderForm()
    paintChrome()
  }

  // 表单样例：按当前工具填入 form 组对应的样例（额度不足样例同时把本月已用调到够不着）
  var FORM_USAGE = { keywords: 99360, reviews: 94200 }
  var fillForm = function (v) {
    Sim.usage.used = v === 'over-quota' ? FORM_USAGE[S.tool] : 41280
    var sample = v === 'blank' ? { name: '', text: '' } : Sim.samples(S.tool, v === 'split' || v === 'over-quota' ? v : 'valid')
    el.name.value = v === 'no-name' ? '' : sample.name
    el.items.value = v === 'empty' ? '' : sample.text
    el.perplace.value = String(sample.perPlace || Sim.LIMITS.perPlaceDefault)
    setFieldError('name', v === 'no-name')
    setFieldError('items', v === 'empty')
  }
  var applyForm = function (v) {
    if ((v === 'full') !== S.fill) rebuildWorld(v === 'full')
    fillForm(v)
    drafts = {}
    clearAlert(true)
    renderForm()
    if (v === 'full') alertFull(readForm())
  }

  var switchTool = function (prev) {
    if (prev) saveDraft(prev)
    paintToolCopy()
    var d = drafts[S.tool]
    if (d) {
      el.name.value = d.name
      el.items.value = d.text
      el.perplace.value = d.per
      setFieldError('name', false)
      setFieldError('items', false)
    } else fillForm(Proto.get('form'))
    syncDock('task', focusOf(S.tool).status)
    S.hidden = null
    if (S.view === 'detail') {
      S.view = 'history'
      syncDock('view', 'history')
    }
    clearAlert()
    if (S.view === 'new' && !still()) {
      el.form.animate([{ opacity: 0, transform: 'translate3d(0, 8px, 0)' }, { opacity: 1, transform: 'none' }], { duration: dur('--dur-3', 280) + 60, easing: EMPH })
    }
    if (!still()) el.h1.parentNode.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: dur('--dur-3', 280), easing: OUT })
    refreshAll(0)
  }

  var applyView = function (v) {
    var from = S.view
    S.hidden = v === 'empty' ? S.tool : null
    if (v === 'detail') S.detailId = focusOf(S.tool).id
    S.view = v === 'empty' ? 'history' : v
    if (booting) return
    clearAlert()
    paintTopTabs()
    // 顶层标签切换（new ⇄ history）由面板自己的入场动画承担；history ⇄ detail 走层级滑动
    var tabLevel = from === 'new' || S.view === 'new'
    if (S.view !== 'new') renderStage(S.view === 'detail' ? 1 : from === 'detail' ? -1 : 0, null, tabLevel)
    renderForm()
    paintChrome()
  }

  // 提示条深链：顺带摆好它出现时的视图与数据（与 Panel 的 error 组同理）
  var savedDemo = null
  var applyAlert = function (v) {
    clearAlert(true)
    if (v === 'none') return
    var run = runningTask()
    var ensureRunning = function () {
      if (!runningTask()) {
        applyTask('running')
        syncDock('task', 'running')
      }
      return runningTask()
    }
    if (v === 'saved') {
      if (!savedDemo || !find(savedDemo.id)) {
        var s = Sim.samples(S.tool, 'valid')
        savedDemo = Sim.createTask({ seq: nextSeq(S.tool), name: s.name, type: S.tool, values: Sim.parse(s.text).values, perPlace: s.perPlace })
        S.tasks.push(savedDemo)
      }
      goHistory([savedDemo])
      showAlert({ tone: 'ok', auto: true, hold: true, title: 'Task saved', descHtml: q(savedDemo.name) + ' is at the top of Task history. Start it whenever you’re ready.' })
    } else if (v === 'split-started') {
      if (run) Sim.engine.pause(run)
      var sp = Sim.samples(S.tool, 'split')
      var values = Sim.parse(sp.text).values
      var made = []
      for (var k = 0; k * 500 < values.length; k++) {
        var t = Sim.createTask({ seq: nextSeq(S.tool), name: sp.name + '_' + (k + 1), type: S.tool, values: values.slice(k * 500, (k + 1) * 500), perPlace: sp.perPlace })
        S.tasks.push(t)
        made.push(t)
      }
      Sim.engine.start(made[0], S.tasks)
      openDetail(made[0], 1)
      showAlert({ tone: 'ok', auto: true, hold: true, title: 'The first of ' + made.length + ' tasks is running', descHtml: 'The other ' + (made.length - 1) + ' tasks are saved in Task history. Start them when this one finishes.' })
    } else if (v === 'not-started') {
      run = ensureRunning()
      var ns = Sim.samples(S.tool, 'valid')
      var nt = Sim.createTask({ seq: nextSeq(S.tool), name: ns.name, type: S.tool, values: Sim.parse(ns.text).values, perPlace: ns.perPlace })
      S.tasks.push(nt)
      S.view = 'new'
      S.hidden = null
      syncDock('view', 'new')
      paintTopTabs()
      clearForm()
      paintChrome()
      alertNotStarted(nt, run)
    } else if (v === 'mutex') {
      run = ensureRunning()
      var idle = tasksOf(S.tool).filter(function (t) {
        return t.status === 'idle'
      })[0]
      goHistory()
      alertMutex(idle || tasksOf(S.tool)[1], run)
    }
  }

  // 未指定 s.view 时的落点：嵌入 → 历史；给了表单态 → 新建；有任务在跑 → 它的详情；否则新建
  var startView = function () {
    if (EMBED) return 'history'
    if (params.get('s.form')) return 'new'
    var task = params.get('s.task') || 'running'
    return task === 'running' ? 'detail' : 'new'
  }

  Proto.states({
    group: 'tool',
    label: 'Tool',
    value: 'keywords',
    options: [
      { value: 'keywords', label: 'Keywords' },
      { value: 'reviews', label: 'Review URLs' }
    ],
    onChange: function (v, prev) {
      S.tool = v
      if (syncing || booting || prev === null) return
      switchTool(prev)
    }
  })
  // item 先于 task 注册：task 摆运行快照时要读到 S.item（retrying 深链）
  Proto.states({
    group: 'item',
    label: 'Current item',
    value: 'extracting',
    options: [
      { value: 'extracting', label: 'Extracting' },
      { value: 'retrying', label: 'Retrying · try 2' }
    ],
    onChange: function (v) {
      S.item = v
      if (syncing || booting) return
      applyTask('running')
      syncDock('task', 'running')
      if (S.view !== 'detail') Proto.set('view', 'detail')
      else refreshAll(0)
    }
  })
  Proto.states({
    group: 'task',
    label: 'Task · L7',
    value: 'running',
    options: [
      { value: 'idle', label: 'Idle' },
      { value: 'running', label: 'Running' },
      { value: 'paused', label: 'Paused' },
      { value: 'completed', label: 'Completed' }
    ],
    onChange: function (v) {
      if (syncing) return
      applyTask(v)
      if (!booting) refreshAll(0)
    }
  })
  Proto.states({
    group: 'form',
    label: 'Form',
    value: 'valid',
    options: [
      { value: 'blank', label: 'Blank' },
      { value: 'valid', label: 'Valid · cleaned up' },
      { value: 'split', label: '> 500 · split' },
      { value: 'no-name', label: 'Error · no name' },
      { value: 'empty', label: 'Error · empty list' },
      { value: 'over-quota', label: 'Error · over quota' },
      { value: 'full', label: 'Error · 150 tasks' }
    ],
    onChange: function (v) {
      if (syncing) return
      applyForm(v)
      if (!booting) {
        if (S.view !== 'new') Proto.set('view', 'new')
        paintChrome()
      }
    }
  })
  Proto.states({
    group: 'view',
    label: 'View',
    value: startView(),
    options: [
      { value: 'new', label: 'New task' },
      { value: 'history', label: 'History' },
      { value: 'empty', label: 'History · empty' },
      { value: 'detail', label: 'Task detail' }
    ],
    onChange: function (v) {
      if (syncing) return
      applyView(v)
    }
  })
  var bootAlert = 'none'
  Proto.states({
    group: 'alert',
    label: 'Notice',
    value: 'none',
    options: [
      { value: 'none', label: 'None' },
      { value: 'saved', label: 'Saved' },
      { value: 'split-started', label: 'Split · started' },
      { value: 'not-started', label: 'Saved · not started' },
      { value: 'mutex', label: 'Mutex' }
    ],
    onChange: function (v) {
      if (syncing) return
      if (booting) bootAlert = v
      else applyAlert(v)
    }
  })

  /* ============================================================ 演示流程 */
  // 程序化点击也给出按下反馈（:active 不会因 click() 触发）
  var press = function (node) {
    if (!node) return
    node.classList.add('db-press')
    setTimeout(function () {
      node.classList.remove('db-press')
    }, 180)
    node.click()
  }
  var waitFor = function (p, cond, max) {
    var spent = 0
    var tick = function () {
      if (cond() || spent >= max) return Promise.resolve()
      spent += 250
      return p.wait(250).then(tick)
    }
    return tick()
  }
  var typeInto = function (p, input, text, step) {
    var i = 0
    input.value = ''
    var tick = function () {
      if (i >= text.length) return Promise.resolve()
      input.value += text.charAt(i++)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      return p.wait(step).then(tick)
    }
    return tick()
  }
  var freeTheQueue = function () {
    var run = runningTask()
    if (run) Sim.engine.pause(run)
  }
  var FLOW_LIST = ['bike shops in Astoria', 'bike repair in Astoria', 'e-bike shops in Astoria', 'bike rentals in Astoria', 'bike shops in Long Island City', 'bike repair in Long Island City', '', 'e-bike shops in Long Island City', 'bike shops in Astoria', 'bike rentals in Long Island City', 'bike shops in Sunnyside', 'bike repair in Sunnyside'].join('\n')

  Proto.flow('Create → run → complete', function (p) {
    var speed = Sim.engine.speed
    return Promise.resolve()
      .then(function () {
        Proto.set('tool', 'keywords')
        freeTheQueue()
        Proto.set('form', 'blank')
        Proto.set('view', 'new')
        p.step('New task')
        return p.wait(800)
      })
      .then(function () {
        p.step('Name the task')
        el.name.focus()
        return typeInto(p, el.name, 'Bike shops · Queens', 45)
      })
      .then(function () {
        p.step('Paste 12 lines · 1 duplicate, 1 empty line removed')
        el.items.focus()
        el.items.value = FLOW_LIST
        el.items.dispatchEvent(new Event('input', { bubbles: true }))
        return p.wait(2000)
      })
      .then(function () {
        p.step('Start extracting')
        Sim.engine.speed = 0.55
        S.flowPlans = { 3: ['stuck', 'done'] }
        press(el.start)
        return p.wait(1400)
      })
      .then(function () {
        p.step('One tab at a time · keyword 4 retries')
        return waitFor(p, function () {
          var t = find(S.detailId)
          return t && t.status === 'completed'
        }, 45000)
      })
      .then(function () {
        p.step('Completed · Run again is the main action now')
        return p.wait(2600)
      })
      .then(function () {
        p.step('Back to Task history')
        press($('[data-act="back"]', el.stage))
        return p.wait(1800)
      })
      .finally(function () {
        Sim.engine.speed = speed
        S.flowPlans = null
      })
  })

  Proto.flow('Stuck item → retry → skip', function (p) {
    var f
    return Promise.resolve()
      .then(function () {
        Proto.set('tool', 'keywords')
        Proto.set('item', 'extracting')
        f = focusOf('keywords')
        if (f.status !== 'running') Proto.set('task', 'running')
        if (S.view !== 'detail' || S.detailId !== f.id) Proto.set('view', 'detail')
        p.step('The current keyword stops making progress…')
        return p.wait(600)
      })
      .then(function () {
        // 条目表在首屏以下：把它带进视野，当前条目由 follow() 保持可见
        var items = $('.db-items', el.stage)
        if (items) items.scrollIntoView({ block: 'end', behavior: still() ? 'auto' : 'smooth' })
        return p.wait(500)
      })
      .then(function () {
        Sim.engine.script(f, ['stuck', 'stuck'], 2600)
        return waitFor(p, function () {
          var it = f.items[f.cursor]
          return it.status === 'running' && it.tries > 1
        }, 9000)
      })
      .then(function () {
        p.step('90 s without progress → reopened · Retrying, try 2')
        var at = f.cursor
        Sim.engine.script(f, ['stuck'], 3000)
        return waitFor(p, function () {
          return f.items[at].status === 'skipped'
        }, 9000)
      })
      .then(function () {
        p.step('Still stuck → Skipped: no progress · the task moves on')
        return p.wait(2600)
      })
  })

  Proto.flow('Over 500 → split → start first', function (p) {
    return Promise.resolve()
      .then(function () {
        Proto.set('tool', 'keywords')
        freeTheQueue()
        Proto.set('form', 'split')
        Proto.set('view', 'new')
        p.step('1,240 keywords → 3 tasks of up to 500')
        return p.wait(3000)
      })
      .then(function () {
        p.step('Start first task')
        press(el.start)
        return p.wait(2600)
      })
      .then(function () {
        p.step('Task 1 runs · tasks 2 and 3 wait in Task history')
        return p.wait(2400)
      })
  })

  Proto.flow('Start while another runs', function (p) {
    return Promise.resolve()
      .then(function () {
        Proto.set('tool', 'keywords')
        if (focusOf('keywords').status !== 'running') Proto.set('task', 'running')
        Proto.set('view', 'history')
        p.step('Coffee shops · Brooklyn is running')
        return p.wait(1600)
      })
      .then(function () {
        p.step('Start Dentists · Queens')
        var row = $('tr[data-task="k06"]', el.stage)
        press(row && $('[data-act="primary"]', row))
        return p.wait(2800)
      })
      .then(function () {
        p.step('Only one task runs at a time')
        return p.wait(1200)
      })
  })

  Proto.flow('Delete a task', function (p) {
    var target
    return Promise.resolve()
      .then(function () {
        Proto.set('view', 'history')
        target = tasksOf(S.tool)
          .filter(function (t) {
            return t.status === 'completed'
          })
          .slice(-1)[0]
        p.step('More → Delete task…')
        return p.wait(900)
      })
      .then(function () {
        var row = target && $('tr[data-task="' + target.id + '"]', el.stage)
        press(row && $('[data-menu]', row))
        return p.wait(1200)
      })
      .then(function () {
        var del = $('[data-value="delete"]', el.menu)
        if (el.menu.matches(':popover-open')) {
          del.focus()
          return p.wait(500).then(function () {
            del.click()
          })
        }
      })
      .then(function () {
        p.step('Confirm in the page — not window.confirm')
        return p.wait(2000)
      })
      .then(function () {
        press($('dialog[open] [data-answer="yes"]'))
        p.step('Row leaves · the rest move up')
        return p.wait(1800)
      })
  })

  /* ============================================================ 启动 */
  paintToolCopy()
  Proto.refresh(doc)
  el.tabs.classList.add('is-instant')
  paintTopTabs()
  requestAnimationFrame(function () {
    el.tabs.classList.remove('is-instant')
  })
  renderStage(0)
  renderForm()
  paintChrome()
  if (bootAlert !== 'none') applyAlert(bootAlert)
  el.appbar.classList.toggle('is-scrolled', scrollY > 8)
  requestAnimationFrame(function () {
    booting = false
  })
})()
