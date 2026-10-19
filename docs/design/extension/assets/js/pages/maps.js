/*
 * panel.html（data-page="maps"）页面脚本：Maps 页内面板的全部状态（logic.md §3–4、L1–L4、L10、L11）。
 *
 *   ① panelHTML(s)      纯函数：状态 → 面板标记。design-system 的 panelHTML 的超集，是 Vue 模板的参照；
 *                       面板由插槽（data-slot）拼成：context · notice · status · task · msg · upgrade · actions · section
 *   ② patch(ctx)        增量更新同一块面板（环描边过渡、数字滚轮、按钮文案形变都需要元素不被替换）
 *   ③ 实时演示 · Maps    search / list / place 的真实状态机 + 宿主页面叙事（pin 点亮、结果行、扫描带）
 *   ④ 实时演示 · 工作页  reviews / photos：挂载即采集、Export、Reset 重查额度
 *   ⑤ 状态矩阵          全部状态的静态瓦片（每块独立 Shadow DOM），「Open live」把同一状态载入实时演示
 *   ⑥ 状态坞            分组（深链 ?s.<group>=）与「播放」流程
 *
 * 状态对象 s：
 *   mode   search | list | place | reviews | photos
 *   run    idle | extracting | paused | complete | blocked（额度用尽）| stopped（工作页因 Google 出错提前结束）| empty（无可采集）
 *   n / reason（limit | end）/ balance（月余额不足本次权益时的上限，L1：上限 = min(权益, 余额)）
 *   msg    消息键（L2，按原因；下一次成功动作清除）· notice（update | announce）· bulk（{ i, total, kind }，设计提案）
 *   task   收尾补全进度 { done, total } · primary / secondary 临时按钮态（checking | finishing | exported）· checking（Check again 中）
 *   rows   { reviews, photos }：ready | opened | blocked | error（L4）· rowMsg：详情区内的原因消息
 */
;(function () {
  var MG = window.MG
  var UI = window.UI
  var Proto = window.Proto
  var SPRITE = 'assets/img/icons.svg'
  var fmt = MG.formatNumber

  var pi = function (name) {
    return '<svg class="mgp-icon" aria-hidden="true"><use href="' + SPRITE + '#i-' + name + '"/></svg>'
  }
  var toEl = function (html) {
    var tpl = document.createElement('template')
    tpl.innerHTML = html.trim()
    return tpl.content.firstElementChild
  }
  var plain = function (html) {
    return toEl('<span>' + html + '</span>').textContent
  }
  var reduced = function () {
    return MG.reducedMotion()
  }

  // hub 缩略图（?embed=1 且没指定状态）展示完成态：pin 全部点亮、Export 10 places、没有常驻循环。
  // 必须在注册状态组之前读 URL（注册时状态坞会把当前取值写回地址栏）
  var startParams = new URLSearchParams(location.search)
  var hero = startParams.get('embed') === '1' && !Array.from(startParams.keys()).some(function (k) {
    return k.indexOf('s.') === 0
  })

  /* ================================================================ 模式与文案 */
  var QUOTA_TOTAL = 1000
  var RESET_ON = 'Nov 1'
  var MODES = {
    search: {
      tag: 'Search', icon: 'search', side: 'left', core: 'pin', limit: 10, unit: ['place', 'places'], plan: 'Free · 10 places per run',
      idle: 'Search on Google Maps, then press Start.', live: 'Scrolling the results list…', end: 'Reached the end of the results.',
      url: 'google.com/maps/search/<b>coffee+near+Manhattan</b>'
    },
    list: {
      tag: 'List mode', icon: 'list', side: 'left', core: 'pin', limit: 10, unit: ['place', 'places'], plan: 'Free · 10 places per run',
      idle: 'Opens each place in this list and collects it.', live: 'Opening places one by one…', end: 'Reached the end of the list.',
      url: 'google.com/maps/<b>@40.7411,-73.9897,14z/data=!4m3!11m2!2s…!10m1!1e1</b>'
    },
    place: {
      tag: 'Place', icon: 'pin', side: 'right', core: 'pin', limit: 1, unit: ['place', 'places'], plan: 'Free · 10 places per run',
      idle: 'Collects this place’s details.', live: 'Reading this place…', end: 'Collected this place.',
      url: 'google.com/maps/place/<b>Ember+%26+Oak+Coffee</b>'
    },
    reviews: {
      tag: 'Reviews', icon: 'review', work: true, core: 'review', limit: 20, unit: ['review', 'reviews'], plan: 'Free · 20 reviews per place',
      live: 'Reading review pages…', end: 'Reached the last review.', empty: 'No reviews found',
      url: 'search.google.com/local/<b>reviews?placeid=ChIJ…&amp;hl=en</b>'
    },
    photos: {
      tag: 'Photos', icon: 'image', work: true, core: 'image', limit: 10, unit: ['photo', 'photos'], plan: 'Free · 10 photos per place',
      live: 'Collecting photo links…', end: 'Reached the last photo.', empty: 'No photos found',
      url: 'google.com/maps/<b>uv?pb=!1s0x89c259a…!3m1!7e115</b>'
    }
  }

  var MSGS = {
    'not-searched': { icon: 'search', html: 'Search for something first, like <b>coffee in Austin</b>, then press Start.' },
    parse: { tone: 'bad', icon: 'alert-circle', html: 'Couldn’t read the latest results. MapsGrab keeps trying — if this stays, <button class="mgp-msg-action" type="button" data-link="reload">reload the page</button>.' },
    google: { tone: 'warn', icon: 'hourglass', html: 'Google Maps is limiting requests, so the run paused. Wait a minute, then press Resume.' },
    'unknown-place': { tone: 'neutral', icon: 'help', html: 'Couldn’t identify this place. <button class="mgp-msg-action" type="button" data-link="reload">Reload the page</button>, then try again.' },
    'still-out': { tone: 'bad', icon: 'lock', html: 'Checked just now — still no records left this month.' },
    unlocked: { tone: 'ok', icon: 'check', html: 'Records available again. Press Start to continue.' },
    downloaded: { tone: 'ok', icon: 'download', html: '<b>Downloaded automatically.</b> Find the file in your browser’s downloads.' },
    'bulk-done': { tone: 'ok', icon: 'check', html: 'Exported and reported to the bulk task. This tab closes and the next keyword opens.' },
    'no-reviews': { tone: 'neutral', icon: 'review', html: 'This place has no reviews yet. Open another place to collect its reviews.' },
    'google-reviews': { tone: 'warn', icon: 'hourglass', html: 'Google stopped returning reviews. Export what you have, or wait a minute and press Reset.' },
    'google-photos': { tone: 'warn', icon: 'hourglass', html: 'Google stopped returning photos. Export what you have, or wait a minute and press Reset.' }
  }

  var LINKS = {
    pricing: { title: 'Opens Pricing in a new tab', desc: 'mapsgrab.com/pricing — the default target for every upgrade entry (L3).' },
    help: { title: 'Opens Help & FAQ in a new tab', desc: 'mapsgrab.com/help' },
    update: { title: 'Opens the update guide', desc: 'Chrome updates extensions automatically; the guide shows how to update now.' },
    dashboard: { title: 'Switches to the Bulk Tasks dashboard', desc: 'Reuses the open dashboard tab for this task type.' },
    reload: { title: 'Reloads the Google Maps page', desc: 'The panel mounts again and the error clears.' }
  }

  var unit = function (m, n) {
    return n === 1 ? m.unit[0] : m.unit[1]
  }

  var S = function (o) {
    return Object.assign(
      { mode: 'search', run: 'idle', n: 0, reason: 'limit', msg: null, notice: null, bulk: null, task: null, primary: null, secondary: null, checking: false, rows: { reviews: 'ready', photos: 'ready' }, rowMsg: null, balance: null, format: 'CSV', side: null, plan: null, limit: null, finish: 'plain', query: null, blank: false },
      o
    )
  }

  var sideOf = function (s) {
    return MODES[s.mode].work ? 'work' : s.side || MODES[s.mode].side
  }

  /* ================================================================ 状态 → 视图 */
  var view = function (s) {
    var m = MODES[s.mode]
    var blocked = s.run === 'blocked'
    var limit = blocked ? QUOTA_TOTAL : s.limit || (s.balance != null ? Math.min(m.limit, s.balance) : m.limit)
    var n = blocked ? QUOTA_TOTAL : s.n
    var caption = {
      // 有原因消息时说明行只讲「发生了什么」，下一步交给消息行，避免同一句话出现两次
      idle: s.msg === 'not-searched' ? 'No search on this page yet.' : s.balance != null ? 'Only ' + fmt(s.balance) + ' records left this month · resets ' + RESET_ON : m.idle,
      extracting: s.mode === 'reviews' ? 'Reading review page ' + (Math.floor(s.n / 10) + 1) + '…' : m.live,
      paused: s.msg === 'google' ? 'Paused automatically.' : 'Resume to continue, or export what you have.',
      complete: s.reason === 'end' || s.mode === 'place' ? m.end : m.work ? 'Reached the per-place limit (' + fmt(limit) + ').' : 'Reached this run’s limit (' + fmt(limit) + ').',
      blocked: 'Records used this month · resets ' + RESET_ON,
      stopped: 'Ended early at ' + fmt(s.n) + ' of ' + fmt(limit) + '.',
      empty: 'Nothing to export.'
    }[s.run]
    // 工作页额度用尽只有升级卡；没有可采集时不给 Export（Reset 仍可重试）
    var primary = s.primary || (s.run === 'idle' || (blocked && !m.work) ? 'start' : blocked || s.run === 'empty' ? null : 'export')
    var secondary = s.secondary || (m.work ? (/^(complete|stopped|empty)$/.test(s.run) ? 'reset' : null) : { extracting: 'pause', paused: 'resume', complete: 'reset' }[s.run] || null)
    return {
      m: m,
      state: s.run,
      n: n,
      limit: limit,
      p: s.run === 'idle' || s.run === 'empty' ? 0 : Math.min(100, Math.round((n / limit) * 100)),
      core: { idle: m.core, extracting: 'scan', paused: 'pause', complete: 'check', blocked: 'lock', stopped: 'alert', empty: m.core }[s.run],
      stateText: {
        idle: 'Ready',
        extracting: 'Extracting',
        paused: 'Paused · ' + fmt(s.n) + ' ' + unit(m, s.n),
        complete: 'Complete',
        blocked: 'Monthly limit reached',
        stopped: 'Stopped early',
        empty: m.empty || 'Nothing found'
      }[s.run],
      ringLabel: blocked ? 'Records used this month' : 'Run progress',
      caption: caption,
      primary: primary,
      // 真 disabled 只给额度挡住的 Start；其余暂不可用（0 条时的 Export、工作页重查额度期间）用 aria-disabled，键盘焦点不丢
      primaryDisabled: primary === 'start' && blocked,
      primarySoft: (primary === 'export' && s.n === 0) || s.secondary === 'checking',
      primaryBusy: primary === 'checking' || primary === 'finishing',
      secondary: secondary,
      secondaryBusy: secondary === 'checking'
    }
  }

  // 读屏播报：状态变化即时、采集中计数节流（见 announce）
  var srText = function (s, v) {
    var m = v.m
    var what = fmt(s.n) + ' ' + unit(m, s.n)
    var text = {
      idle: 'Ready to extract',
      extracting: 'Extracting, ' + fmt(s.n) + ' of ' + fmt(v.limit) + ' ' + m.unit[1],
      paused: 'Paused, ' + what,
      complete: 'Complete, ' + what,
      blocked: 'Monthly limit reached',
      stopped: 'Stopped early, ' + what,
      empty: v.stateText
    }[s.run]
    if (s.task) text += '. Adding contact details'
    if (s.msg) text += '. ' + plain(MSGS[s.msg].html)
    return text
  }

  /* ================================================================ ① 标记 */
  var headHTML = function (s) {
    var m = MODES[s.mode]
    var side = sideOf(s)
    var other = side === 'left' ? 'right' : 'left'
    return (
      '<header class="mgp-head">' +
      '<img class="mgp-mark" src="assets/img/logo.svg" alt="" />' +
      '<span class="mgp-title">MapsGrab</span>' +
      '<span class="mgp-mode">' + pi(m.icon) + m.tag + '</span>' +
      (m.work ? '' : '<button class="mgp-icon-btn" type="button" data-dock aria-label="Move panel to the ' + other + '" title="Move to the ' + other + '">' + pi(side === 'left' ? 'dock-right' : 'dock-left') + '</button>') +
      '</header>'
    )
  }

  // 批量任务上下文条（设计提案：只读展示 + 去 Dashboard 的链接；任务总数需要内容脚本向后台查询）
  var contextHTML = function (s) {
    if (!s.bulk) return ''
    var b = s.bulk
    var noun = b.kind === 'reviews' ? 'URL' : 'keyword'
    return (
      '<a class="mgp-context" href="#" data-slot="context" data-link="dashboard" aria-label="Bulk task, ' + noun + ' ' + b.i + ' of ' + b.total + '. Open the dashboard">' +
      pi('stack') +
      '<span class="mgp-context-label">Bulk task</span>' +
      '<span class="mgp-context-count">' + b.i + ' / ' + b.total + '</span>' +
      '<span class="mgp-context-link">Dashboard' + pi('arrow-up-right') + '</span>' +
      '<span class="mgp-context-bar" style="--p: ' + ((b.i - 1) / b.total) * 100 + '" aria-hidden="true"></span>' +
      '</a>'
    )
  }

  var noticeHTML = function (s) {
    if (s.notice === 'update') {
      return '<div class="mgp-notice" data-slot="notice" data-key="update" role="status">' + pi('sparkles') + '<span>Update MapsGrab to keep extracting. <a class="mgp-notice-link" href="#" data-link="update">How to update</a></span></div>'
    }
    if (s.notice === 'announce') {
      return '<div class="mgp-notice mgp-notice--announce" data-slot="notice" data-key="announce" role="status">' + pi('megaphone') + '<span>New: export to XLSX — choose the format in Settings.</span></div>'
    }
    return ''
  }

  var statusHTML = function (s, v) {
    return (
      '<div class="mgp-status" data-slot="status" data-state="' + v.state + '">' +
      '<div class="mgp-ring" role="progressbar" aria-label="' + v.ringLabel + '" aria-valuemin="0" aria-valuemax="' + v.limit + '" aria-valuenow="' + v.n + '" style="--p: ' + v.p + '">' +
      '<svg class="mgp-ring-svg" viewBox="0 0 48 48" aria-hidden="true"><circle class="mgp-ring-track" cx="24" cy="24" r="20" pathLength="100" /><circle class="mgp-ring-fill" cx="24" cy="24" r="20" pathLength="100" /></svg>' +
      '<span class="mgp-ring-scan" aria-hidden="true"></span>' +
      '<span class="mgp-ring-core" aria-hidden="true">' + pi(v.core) + '</span>' +
      '</div>' +
      '<div class="mgp-readout">' +
      '<span class="mgp-state"><span class="mgp-dot" aria-hidden="true"></span>' + v.stateText + '</span>' +
      '<span class="mgp-count"><span class="mgp-roll">' + fmt(v.n) + '</span><span class="mgp-of">/ ' + fmt(v.limit) + '</span></span>' +
      '<span class="mgp-caption">' + v.caption + '</span>' +
      '</div>' +
      '</div>'
    )
  }

  // 收尾补全（设置里开了 Email / 社媒）：完成后逐批补全，Export 等它结束（导出的才是完整数据）
  var taskHTML = function (s) {
    if (!s.task) return ''
    return (
      '<div class="mgp-task" data-slot="task" role="group" aria-label="Adding contact details">' +
      '<span class="mgp-task-icon">' + pi('mail') + '</span>' +
      '<span class="mgp-task-title">Adding emails &amp; social links</span>' +
      '<span class="mgp-task-sub" data-task-sub>' + taskSub(s.task) + '</span>' +
      '<span class="mgp-task-bar" aria-hidden="true"><span data-task-bar style="--p: ' + taskPct(s.task) + '"></span></span>' +
      '</div>'
    )
  }
  var taskSub = function (t) {
    return fmt(t.done) + ' of ' + fmt(t.total) + ' websites checked'
  }
  var taskPct = function (t) {
    return Math.round((t.done / t.total) * 100)
  }

  var msgHTML = function (key, slot) {
    var msg = MSGS[key]
    if (!msg) return ''
    return (
      '<p class="mgp-msg" data-slot="' + (slot || 'msg') + '" data-key="' + key + '"' + (msg.tone ? ' data-tone="' + msg.tone + '"' : '') + (msg.tone === 'bad' ? ' role="alert"' : '') + '>' +
      pi(msg.icon) + '<span>' + msg.html + '</span></p>'
    )
  }

  var checkHTML = function (s) {
    return s.checking
      ? '<button class="mgp-btn mgp-btn--ghost mgp-btn--sm" type="button" data-check aria-busy="true" aria-disabled="true"><span class="mgp-spinner" aria-hidden="true"></span>Checking…</button>'
      : '<button class="mgp-btn mgp-btn--ghost mgp-btn--sm" type="button" data-check>' + pi('refresh') + 'Check again</button>'
  }

  // 额度用尽（L3）：升级入口恒显示，默认指向官网 Pricing；Check again 是 Start 禁用时的重查入口
  var upgradeHTML = function (s) {
    if (s.run !== 'blocked') return ''
    var text = MODES[s.mode].work ? 'Pro includes 100,000 records a month and higher limits per place.' : 'Pro includes 100,000 records a month and up to 99,999 places per run.'
    return (
      '<div class="mgp-upgrade" data-slot="upgrade" data-key="blocked">' +
      '<span class="mgp-upgrade-title">Need more records?</span>' +
      '<span class="mgp-upgrade-text">' + text + '</span>' +
      '<div class="mgp-upgrade-actions">' +
      '<a class="mgp-btn mgp-btn--secondary mgp-btn--sm" href="#" data-link="pricing">View plans' + pi('arrow-up-right') + '</a>' +
      checkHTML(s) +
      '</div>' +
      '</div>'
    )
  }

  var morphItem = function (key, active, content) {
    return '<span data-key="' + key + '"' + (active ? ' class="is-active"' : ' aria-hidden="true"') + '>' + content + '</span>'
  }
  var spinner = '<span class="mgp-spinner" aria-hidden="true"></span>'
  var busyAttrs = function (busy, disabled, soft) {
    return (busy ? ' aria-busy="true"' : '') + (busy || soft ? ' aria-disabled="true"' : '') + (disabled && !busy ? ' disabled' : '')
  }

  var actionsHTML = function (s, v) {
    var m = v.m
    return (
      '<div class="mgp-actions" data-slot="actions"' + (v.primary || v.secondary ? '' : ' hidden') + '>' +
      '<button class="mgp-btn mgp-btn--primary" type="button" data-primary' + busyAttrs(v.primaryBusy, v.primaryDisabled, v.primarySoft) + (v.primary ? '' : ' hidden') + '>' +
      '<span class="mgp-morph">' +
      morphItem('start', v.primary === 'start', pi('play') + 'Start extracting') +
      morphItem('checking', v.primary === 'checking', spinner + 'Checking records…') +
      morphItem('export', v.primary === 'export', pi('download') + '<span data-export-label>Export ' + fmt(s.n) + ' ' + unit(m, s.n) + '</span><span class="mgp-btn-tag">' + s.format + '</span>') +
      morphItem('finishing', v.primary === 'finishing', spinner + 'Adding contact details…') +
      morphItem('exported', v.primary === 'exported', pi('check') + 'Exported') +
      '</span>' +
      '</button>' +
      '<button class="mgp-btn mgp-btn--secondary" type="button" data-secondary' + busyAttrs(v.secondaryBusy, false, false) + (v.secondary ? '' : ' hidden') + '>' +
      '<span class="mgp-morph">' +
      morphItem('pause', v.secondary === 'pause', pi('pause') + 'Pause') +
      morphItem('resume', v.secondary === 'resume', pi('resume') + 'Resume') +
      morphItem('reset', v.secondary === 'reset', pi('reset') + 'Reset') +
      morphItem('checking', v.secondary === 'checking', spinner + 'Checking records…') +
      '</span>' +
      '</button>' +
      '</div>'
    )
  }

  // 详情页 Reviews / Photos 入口（L4）
  var rowState = function (s, kind) {
    var st = s.rows[kind]
    // 额度用尽同样关住两个入口（已打开 / 无法识别保留原状）
    return s.run === 'blocked' && st === 'ready' ? 'blocked' : st
  }
  var rowHTML = function (kind, state) {
    var rev = kind === 'reviews'
    var sub = {
      ready: rev ? '1,284 reviews' : '312 photos',
      opened: pi('check') + 'Collecting in a new tab',
      blocked: 'No records left this month',
      error: 'Place not identified'
    }[state]
    var action =
      state === 'opened'
        ? '<button class="mgp-btn mgp-btn--secondary mgp-btn--sm mgp-btn--icon" type="button" data-row-action aria-label="Reopen the ' + kind + ' tab" title="Reopen tab">' + pi('external-link') + '</button>'
        : '<button class="mgp-btn mgp-btn--secondary mgp-btn--sm" type="button" data-row-action aria-label="Start extracting ' + kind + '"' + (state === 'blocked' || state === 'error' ? ' disabled' : '') + '>Start</button>'
    return (
      '<div class="mgp-row" data-state="' + state + '" data-row="' + kind + '">' +
      '<span class="mgp-row-icon' + (rev ? ' mgp-row-icon--star' : '') + '">' + pi(rev ? 'star' : 'image') + '</span>' +
      '<span class="mgp-row-text"><span class="mgp-row-title">' + (rev ? 'Reviews' : 'Photos') + '</span><span class="mgp-row-sub">' + sub + '</span></span>' +
      action +
      '<span class="mgp-row-timer" aria-hidden="true"></span>' +
      '</div>'
    )
  }
  var sectionHTML = function (s) {
    if (s.mode !== 'place') return ''
    return (
      '<div class="mgp-section" data-slot="section" role="group" aria-labelledby="mgp-place-label">' +
      '<span class="mgp-section-label" id="mgp-place-label">This place</span>' +
      (s.rowMsg ? msgHTML(s.rowMsg, 'rowmsg') : '') +
      rowHTML('reviews', rowState(s, 'reviews')) +
      rowHTML('photos', rowState(s, 'photos')) +
      '</div>'
    )
  }

  var panelHTML = function (s, opts) {
    var o = opts || {}
    var v = view(s)
    var side = sideOf(s)
    return (
      '<section class="mgp mgp--' + side + (o.steady ? ' is-steady' : '') + '" role="region" aria-label="MapsGrab panel">' +
      headHTML(s) +
      contextHTML(s) +
      '<div class="mgp-body">' +
      noticeHTML(s) +
      statusHTML(s, v) +
      taskHTML(s) +
      msgHTML(s.msg) +
      upgradeHTML(s) +
      actionsHTML(s, v) +
      sectionHTML(s) +
      '</div>' +
      '<footer class="mgp-foot"><span>' + (s.plan || v.m.plan) + '</span><a href="#" data-link="help">Help</a></footer>' +
      '<span class="mgp-sr" aria-live="polite" data-sr>' + (o.live ? '' : srText(s, v)) + '</span>' +
      '</section>'
    )
  }

  /* ================================================================ ② 增量更新 */
  var SLOT_ORDER = ['notice', 'status', 'task', 'msg', 'upgrade', 'actions', 'section']

  var leave = function (el) {
    if (reduced()) {
      el.remove()
      return
    }
    el.classList.add('is-leaving')
    el.removeAttribute('data-slot')
    setTimeout(function () {
      el.remove()
    }, MG.ms('--dur-2') || 180)
  }

  // 按 data-key 对比：键相同不动（避免重播入场），不同则替换 / 插入 / 离场
  var putSlot = function (parent, name, html, order) {
    var list = order || SLOT_ORDER
    var old = parent.querySelector(':scope > [data-slot="' + name + '"]')
    var next = html ? toEl(html) : null
    if (old && next && old.dataset.key && old.dataset.key === next.dataset.key) return old
    if (old && !next) {
      leave(old)
      return null
    }
    if (old) {
      old.replaceWith(next)
      return next
    }
    if (!next) return null
    var before = null
    for (var i = list.indexOf(name) + 1; i < list.length && !before; i++) {
      before = parent.querySelector(':scope > [data-slot="' + list[i] + '"]')
    }
    parent.insertBefore(next, before)
    return next
  }

  var patchStatus = function (el, s, v) {
    var prev = el.dataset.state
    el.dataset.state = v.state
    var ring = el.querySelector('.mgp-ring')
    ring.style.setProperty('--p', v.p)
    ring.setAttribute('aria-valuenow', v.n)
    ring.setAttribute('aria-valuemax', v.limit)
    ring.setAttribute('aria-label', v.ringLabel)
    var stateEl = el.querySelector('.mgp-state')
    if (prev !== v.state) {
      el.querySelector('.mgp-ring-core').innerHTML = pi(v.core)
      var fresh = stateEl.cloneNode(false)
      fresh.innerHTML = '<span class="mgp-dot" aria-hidden="true"></span>' + v.stateText
      stateEl.replaceWith(fresh)
    } else if (stateEl.textContent !== v.stateText) {
      stateEl.innerHTML = '<span class="mgp-dot" aria-hidden="true"></span>' + v.stateText
    }
    MG.roll(el.querySelector('.mgp-roll'), v.n, { cls: 'mgp-roll' })
    el.querySelector('.mgp-of').textContent = '/ ' + fmt(v.limit)
    var cap = el.querySelector('.mgp-caption')
    if (cap.textContent !== v.caption) cap.textContent = v.caption
  }

  var setBusy = function (btn, busy, disabled, soft) {
    btn.disabled = !busy && !!disabled
    if (busy) btn.setAttribute('aria-busy', 'true')
    else btn.removeAttribute('aria-busy')
    if (busy || soft) btn.setAttribute('aria-disabled', 'true')
    else btn.removeAttribute('aria-disabled')
  }

  var patchActions = function (body, s, v) {
    var actions = body.querySelector('[data-slot="actions"]')
    actions.hidden = !v.primary && !v.secondary
    var pb = actions.querySelector('[data-primary]')
    pb.hidden = !v.primary
    if (v.primary) {
      UI.morph(pb.querySelector('.mgp-morph'), v.primary)
      setBusy(pb, v.primaryBusy, v.primaryDisabled, v.primarySoft)
    }
    pb.querySelector('[data-export-label]').textContent = 'Export ' + fmt(s.n) + ' ' + unit(v.m, s.n)
    pb.querySelector('.mgp-btn-tag').textContent = s.format
    var sb = actions.querySelector('[data-secondary]')
    sb.hidden = !v.secondary
    if (v.secondary) {
      UI.morph(sb.querySelector('.mgp-morph'), v.secondary)
      setBusy(sb, v.secondaryBusy, false, false)
    }
  }

  var patchTask = function (body, s) {
    var el = body.querySelector(':scope > [data-slot="task"]')
    if (!s.task) {
      if (el) leave(el)
      return
    }
    if (!el) {
      putSlot(body, 'task', taskHTML(s))
      return
    }
    el.querySelector('[data-task-sub]').textContent = taskSub(s.task)
    el.querySelector('[data-task-bar]').style.setProperty('--p', taskPct(s.task))
  }

  var patchSection = function (body, s) {
    var section = body.querySelector('[data-slot="section"]')
    if (!section) return
    // 详情区内的原因消息紧跟分组标签
    var old = section.querySelector(':scope > [data-slot="rowmsg"]')
    if (!old || old.dataset.key !== (s.rowMsg || '')) {
      var next = s.rowMsg ? toEl(msgHTML(s.rowMsg, 'rowmsg')) : null
      if (old && next) old.replaceWith(next)
      else if (old) leave(old)
      else if (next) section.querySelector('.mgp-section-label').after(next)
    }
    ;['reviews', 'photos'].forEach(function (kind) {
      var row = section.querySelector('[data-row="' + kind + '"]')
      var state = rowState(s, kind)
      if (row.dataset.state === state) return
      var refocus = row.contains(row.getRootNode().activeElement)
      var next = toEl(rowHTML(kind, state))
      row.replaceWith(next)
      // 整行替换会丢焦点：键盘用户留在新按钮上
      if (refocus) next.querySelector('[data-row-action]').focus({ preventScroll: true })
    })
  }

  var patchContext = function (root, s) {
    var el = root.querySelector('[data-slot="context"]')
    if (!s.bulk) {
      if (el) el.remove()
      return
    }
    var next = toEl(contextHTML(s))
    if (el) el.replaceWith(next)
    else root.querySelector('.mgp-head').after(next)
  }

  // 计数播报节流：状态 / 消息变化立即播，采集中的纯计数变化至少间隔 3 秒
  var announce = function (ctx, s, v) {
    var sr = ctx.root.querySelector('[data-sr]')
    var text = srText(s, v)
    var key = s.run + '|' + (s.msg || '') + '|' + (s.task ? 1 : 0)
    var now = Date.now()
    if (key === ctx.srKey && now - ctx.srAt < 3000) return
    ctx.srKey = key
    ctx.srAt = now
    if (sr.textContent !== text) sr.textContent = text
  }

  // 焦点所在的控件被隐藏 / 禁用 / 替换 / 离场时（Reset 回到 Ready、Start 被额度挡住、解锁后升级卡离场），
  // 把焦点交给下一个可操作的控件，避免键盘用户落回页面开头
  var FOCUS_PICKS = ['[data-primary]', '[data-secondary]', '[data-slot="upgrade"] a', '[data-slot="upgrade"] [data-check]', '[data-dock]']
  var lostFocus = function (el) {
    return !el.isConnected || el.disabled || !!el.closest('[hidden], .is-leaving')
  }
  var rescueFocus = function (root, had) {
    var shadow = root.getRootNode()
    if (!had || !lostFocus(had) || (shadow.activeElement && shadow.activeElement !== had)) return
    for (var i = 0; i < FOCUS_PICKS.length; i++) {
      var el = root.querySelector(FOCUS_PICKS[i])
      if (el && !lostFocus(el)) {
        el.focus({ preventScroll: true })
        return
      }
    }
  }

  var patch = function (ctx) {
    var s = ctx.s
    var v = view(s)
    var root = ctx.root
    var had = root.getRootNode().activeElement
    var body = root.querySelector('.mgp-body')
    patchContext(root, s)
    putSlot(body, 'notice', noticeHTML(s))
    patchStatus(body.querySelector('[data-slot="status"]'), s, v)
    patchTask(body, s)
    putSlot(body, 'msg', msgHTML(s.msg))
    var upgrade = putSlot(body, 'upgrade', upgradeHTML(s))
    if (upgrade) {
      var check = upgrade.querySelector('[data-check]')
      var busy = check.getAttribute('aria-busy') === 'true'
      if (busy !== !!s.checking) {
        var fresh = toEl(checkHTML(s))
        check.replaceWith(fresh)
        if (had === check) fresh.focus({ preventScroll: true })
      }
    }
    patchActions(body, s, v)
    patchSection(body, s)
    announce(ctx, s, v)
    rescueFocus(root, had)
  }

  /* ================================================================ 宿主页面叙事 */
  // 第二家门店（虚构）：让 Free 的 10 条上限落在结果列表中段，看得出「达到上限」而不是「到底」
  var MORE = [
    { name: 'Ember & Oak Coffee', category: 'Coffee shop', address: '410 Broome St', rating: 4.6, reviews: 388, hours: 'Closes 6 PM', price: '$$' },
    { name: 'Halfmoon Roasters', category: 'Coffee roasters', address: '61 Franklin St', rating: 4.5, reviews: 254, hours: 'Closes 5 PM', price: '$$' },
    { name: 'Copper Kettle Café', category: 'Café', address: '233 E 14th St', rating: 4.3, reviews: 197, hours: 'Closes 9 PM', price: '$' },
    { name: 'Northline Espresso Bar', category: 'Espresso bar', address: '18 W 45th St', rating: 4.7, reviews: 803, hours: 'Closes 6 PM', price: '$$' }
  ]
  var MORE_PINS = [
    [80, 36],
    [14, 82],
    [86, 62],
    [70, 88]
  ]
  var MORE_REVIEWS = [
    ['Alex P.', 5, 'Flat white was perfect and the oat milk is not an upcharge.'],
    ['Jordan M.', 4, 'Cozy corner seats, strong Wi-Fi. A little loud at lunch.'],
    ['Sam T.', 5, 'Friendly baristas who remember your order.'],
    ['Riley C.', 4, 'Pastries sell out early — go before 9.']
  ]
  var AVAILABLE = { search: 12, list: 8, place: 1 }

  var esc = function (text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  var cardHTML = function (p) {
    return (
      '<article class="gmap-card">' +
      '<div class="gmap-card-text"><b>' + esc(p.name) + '</b>' +
      '<span class="gmap-rate">' + p.rating.toFixed(1) + ' <span class="gmap-stars" style="--r:' + p.rating + '" aria-hidden="true"></span> <span>(' + fmt(p.reviews) + ')</span></span>' +
      '<span>' + esc(p.category) + ' · ' + esc(p.price) + ' · ' + esc(p.address) + '</span>' +
      '<span><em class="gmap-open">Open</em> · ' + esc(p.hours) + '</span></div>' +
      '<i class="gmap-thumb"></i>' +
      '</article>'
    )
  }
  var reviewHTML = function (r) {
    return '<div class="gmap-review"><i></i><b>' + esc(r[0]) + '</b><span class="gmap-stars" style="--r:' + r[1] + '" aria-hidden="true"></span><p>' + esc(r[2]) + '</p></div>'
  }

  var buildHost = function (ctx, s) {
    var page = ctx.page
    var mode = s.mode
    page.classList.remove('mp-blank', 'mp-run', 'mp-sheet-page', 'mp-gallery')
    if (mode === 'reviews') {
      Proto.gmap(page, { mode: 'reviews' })
      var sheet = page.querySelector('.gmap-sheet')
      sheet.classList.add('mp-sheet')
      sheet.insertAdjacentHTML('beforeend', MORE_REVIEWS.map(reviewHTML).join(''))
      sheet.insertAdjacentHTML('afterbegin', '<div class="mp-sweep" aria-hidden="true"></div>')
      ctx.items = Array.prototype.slice.call(sheet.querySelectorAll('.gmap-review'))
      ctx.items.forEach(function (row) {
        row.insertAdjacentHTML('beforeend', '<b class="mp-badge" aria-hidden="true"></b>')
      })
      ctx.pins = []
    } else if (mode === 'photos') {
      Proto.gmap(page, { mode: 'photos' })
      page.classList.add('mp-gallery')
      var photo = page.querySelector('.gmap-photo')
      photo.innerHTML = '<i class="mp-photo-alt"></i><div class="mp-sweep" aria-hidden="true"></div>'
      ctx.items = Array.prototype.slice.call(page.querySelectorAll('.gmap-strip i'))
      ctx.items.forEach(function (thumb) {
        thumb.innerHTML = '<b class="mp-badge" aria-hidden="true"></b>'
      })
      ctx.pins = []
    } else {
      Proto.gmap(page, { mode: mode, query: s.blank ? 'Search Google Maps' : s.query || undefined })
      page.classList.toggle('mp-blank', !!s.blank)
      var results = page.querySelector('.gmap-results')
      if (results) {
        var extra = mode === 'search' ? Proto.places.slice(6).concat(MORE) : Proto.places.slice(6)
        results.insertAdjacentHTML('beforeend', extra.map(cardHTML).join(''))
        var feed = document.createElement('div')
        feed.className = 'mp-feed'
        while (results.firstChild) feed.appendChild(results.firstChild)
        results.appendChild(feed)
        ctx.feed = feed
        ctx.items = Array.prototype.slice.call(feed.querySelectorAll('.gmap-card'))
        ctx.items.forEach(function (card) {
          card.insertAdjacentHTML('beforeend', '<b class="mp-badge" aria-hidden="true"></b>')
        })
      } else {
        ctx.feed = null
        ctx.items = []
      }
      var map = page.querySelector('.gmap-map')
      if (mode === 'search') {
        map.insertAdjacentHTML(
          'beforeend',
          MORE_PINS.map(function (spot, i) {
            return '<span class="gmap-pin" style="--x:' + spot[0] + '%;--y:' + spot[1] + '%;--i:' + (8 + i) + '"></span>'
          }).join('')
        )
      }
      map.querySelector('.gmap-art').insertAdjacentHTML('afterend', '<div class="mp-sweep" aria-hidden="true"></div>')
      ctx.pins = Array.prototype.slice.call(map.querySelectorAll('.gmap-pin'))
      ctx.pins.forEach(function (pin) {
        pin.insertAdjacentHTML('beforeend', '<i class="mp-ping"></i><b class="mp-pin-badge"></b>')
      })
    }
    ctx.sweep = page.querySelector('.mp-sweep')
    ctx.marked = 0
    ctx.hostKey = hostKey(s)
  }

  var hostKey = function (s) {
    return s.mode + (s.blank ? ':blank' : '') + (s.query ? ':' + s.query : '')
  }

  // 按 n 与运行态同步宿主标记：pin 点亮（新点亮的播一次波纹）、结果行、扫描带、结果流平移
  var hostSync = function (ctx) {
    var s = ctx.s
    var page = ctx.page
    var run = s.run === 'extracting' || s.run === 'paused' || s.run === 'complete'
    var count = run ? s.n : 0
    var work = MODES[s.mode].work
    var done = work ? Math.round((count / Math.max(1, view(s).limit)) * ctx.items.length) : count
    if (s.mode === 'place') done = 0
    page.classList.toggle('mp-run', run && !work)
    ctx.items.forEach(function (item, i) {
      item.classList.toggle('mp-done', i < done)
      item.classList.toggle('mp-reading', (s.run === 'extracting' || s.run === 'paused') && i === done && s.mode !== 'photos')
      if (s.mode === 'list') item.classList.toggle('is-active', s.run === 'extracting' && i === done)
    })
    ctx.pins.forEach(function (pin, i) {
      pin.classList.toggle('mp-pin-done', i < (s.mode === 'place' ? count : done))
    })
    if (ctx.sweep) ctx.sweep.classList.toggle('is-on', s.run === 'extracting')
    if (s.mode === 'photos') {
      var photo = page.querySelector('.gmap-photo')
      if (photo) photo.classList.toggle('mp-flip', count > 0 && Math.floor(count / 3) % 2 === 1)
    }
    // 结果流：正在读的行保持在可见区第三行
    if (ctx.feed && ctx.items.length) {
      var anchor = Math.min(done, ctx.items.length - 1)
      var offset = anchor > 2 ? ctx.items[anchor].offsetTop - ctx.items[2].offsetTop : 0
      var max = Math.max(0, ctx.feed.scrollHeight - ctx.feed.parentElement.clientHeight)
      ctx.feed.style.transform = 'translateY(' + -Math.min(offset, max) + 'px)'
    }
  }

  /* ================================================================ 公共：链接、导出 */
  // 演示叙事：在额度用尽时点 View plans 视为用户去定价页升级了，回到面板按 Check again 就能读到新额度
  var linkToast = function (key, ctx) {
    var link = LINKS[key]
    var upgraded = key === 'pricing' && ctx && ctx.server === 'out'
    if (upgraded) ctx.server = 'ok'
    UI.toast({
      title: link.title,
      desc: upgraded ? link.desc + ' Demo: press Check again to pick up the new records.' : link.desc,
      tone: 'primary',
      icon: key === 'reload' ? 'refresh' : 'external-link'
    })
  }

  var exportName = function (s) {
    var m = MODES[s.mode]
    var subject = m.work ? 'Ember+Oak+Coffee-' + m.unit[1] : (s.query || 'coffee near Manhattan').replace(/ /g, '+')
    return 'MapsGrab-Extractor-' + s.n + '-' + subject + '-2026-10-18.' + s.format.toLowerCase()
  }

  var exportToast = function (s, auto) {
    UI.toast({
      title: (auto ? 'Downloaded ' : 'Exported ') + fmt(s.n) + ' ' + unit(MODES[s.mode], s.n),
      desc: exportName(s),
      tone: 'ok',
      icon: 'download'
    })
  }

  // 一次性回执：按钮内「Exported」1.6 秒后形变回 Export N
  var flashExported = function (ctx) {
    var s = ctx.s
    clearTimeout(ctx.exportedTimer)
    s.primary = 'exported'
    patch(ctx)
    ctx.exportedTimer = setTimeout(function () {
      if (s.primary !== 'exported') return
      s.primary = null
      patch(ctx)
    }, 1600)
  }

  /* ================================================================ 状态坞同步 */
  var syncing = false
  var dockSet = function (group, value) {
    if (Proto.get(group) === value) return
    syncing = true
    Proto.set(group, value)
    syncing = false
  }

  /* ================================================================ ③ 实时演示 · Maps */
  var live = {
    page: document.querySelector('[data-host-page]'),
    host: document.querySelector('[data-panel-host]'),
    url: document.querySelector('[data-url]'),
    s: S(),
    root: null,
    server: 'ok', // 「服务端」额度：L3 演示 Start / Check again 时重新读取它
    timers: {}
  }

  var stopTimers = function (ctx) {
    clearInterval(ctx.ticker)
    clearInterval(ctx.finTimer)
    clearTimeout(ctx.stallTimer)
    clearTimeout(ctx.exportedTimer)
    clearTimeout(ctx.pendingTimer)
    Object.keys(ctx.timers).forEach(function (k) {
      clearTimeout(ctx.timers[k])
    })
    ctx.ticker = 0
    ctx.finTimer = 0
  }

  var urlFor = function (s) {
    if (s.blank) return 'google.com/maps/<b>@40.7411,-73.9897,14z</b>'
    if (s.bulk && s.mode === 'search') return 'google.com/maps/search/<b>' + s.query.replace(/ /g, '+') + '</b>/?gme_bulk=1&amp;gme_bulk_task=t_8f2c&amp;gme_bulk_item=' + (s.bulk.i - 1)
    return MODES[s.mode].url
  }

  var mount = function (ctx, opts) {
    var o = opts || {}
    var s = ctx.s
    stopTimers(ctx)
    if (o.host || ctx.hostKey !== hostKey(s)) buildHost(ctx, s)
    ctx.url.innerHTML = urlFor(s)
    var prev = ctx.root && o.flip ? ctx.root.getBoundingClientRect() : null
    var steady = !!ctx.root
    var shadow = UI.mountPanel(ctx.host, { html: panelHTML(s, { steady: steady, live: true }) })
    if (!ctx.bound) {
      ctx.bound = true
      shadow.addEventListener('click', ctx.onClick)
    }
    ctx.root = shadow.querySelector('.mgp')
    ctx.srKey = null
    if (prev && !reduced()) {
      var next = ctx.root.getBoundingClientRect()
      var dx = prev.left - next.left
      if (dx) ctx.root.animate([{ transform: 'translateX(' + dx + 'px)' }, { transform: 'none' }], { duration: MG.ms('--dur-4') || 560, easing: MG.token('--ease-emph') || 'ease-out' })
    }
    MG.roll(ctx.root.querySelector('.mgp-roll'), view(s).n, { cls: 'mgp-roll', instant: true })
    announce(ctx, s, view(s))
    hostSync(ctx)
    ctx.marked = s.n
    if (s.run === 'extracting') ctx.start()
    if (s.task) startFinishing(ctx)
  }

  var stopTicker = function (ctx) {
    clearInterval(ctx.ticker)
    ctx.ticker = 0
  }

  // 采集计时器：模拟数据批次到达
  var mapsStart = function () {
    var ctx = live
    stopTicker(ctx)
    ctx.ticker = setInterval(function () {
      var s = ctx.s
      if (s.run !== 'extracting') {
        stopTicker(ctx)
        return
      }
      // 解析失败（L2）：本批读不出、计数停住；下一批成功即清除消息
      if (s.msg === 'parse') {
        if (!ctx.stallTimer) {
          ctx.stallTimer = setTimeout(function () {
            ctx.stallTimer = 0
            if (ctx.s.msg !== 'parse') return
            ctx.s.msg = null
            dockSet('error', 'none')
            patch(ctx)
          }, 4200)
        }
        return
      }
      var v = view(s)
      var step = s.mode === 'search' && Math.random() < 0.35 ? 2 : 1
      s.n = Math.min(v.limit, AVAILABLE[s.mode], s.n + step)
      hostSync(ctx)
      if (s.n >= v.limit || s.n >= AVAILABLE[s.mode]) {
        s.reason = s.n >= v.limit ? 'limit' : 'end'
        mapsComplete()
      } else {
        patch(ctx)
      }
    }, { search: 650, list: 900, place: 1300 }[ctx.s.mode])
  }
  live.start = mapsStart

  var mapsComplete = function () {
    var ctx = live
    var s = ctx.s
    stopTicker(ctx)
    s.run = 'complete'
    // 余额只够这一次：完成上报后服务端额度归零，Reset 回到待命即被拦（L3）
    if (s.balance != null) ctx.server = 'out'
    dockSet('run', 'complete')
    if (s.finish === 'contacts' || s.finish === 'both') {
      s.task = { done: 0, total: Math.max(1, Math.round(s.n * 0.8)) }
      s.primary = 'finishing'
      patch(ctx)
      hostSync(ctx)
      startFinishing(ctx)
      return
    }
    patch(ctx)
    hostSync(ctx)
    afterFinish(ctx)
  }

  // 完成后的自动导出：批量模式强制、或设置开了自动下载
  var afterFinish = function (ctx) {
    var s = ctx.s
    if (s.bulk) {
      s.msg = 'bulk-done'
      exportToast(s, true)
    } else if (s.finish === 'download' || s.finish === 'both') {
      s.msg = 'downloaded'
      exportToast(s, true)
    } else {
      return
    }
    patch(ctx)
  }

  var startFinishing = function (ctx) {
    clearInterval(ctx.finTimer)
    ctx.finTimer = setInterval(function () {
      var s = ctx.s
      if (!s.task) {
        clearInterval(ctx.finTimer)
        return
      }
      s.task.done = Math.min(s.task.total, s.task.done + 1 + Math.round(Math.random() * 2))
      if (s.task.done >= s.task.total) {
        clearInterval(ctx.finTimer)
        patch(ctx)
        ctx.timers.fin = setTimeout(function () {
          s.task = null
          s.primary = null
          patch(ctx)
          afterFinish(ctx)
        }, 500)
        return
      }
      patch(ctx)
    }, 520)
  }

  var mapsStartClick = function () {
    var ctx = live
    var s = ctx.s
    // L3：每次 Start 都重新读取额度
    s.primary = 'checking'
    patch(ctx)
    ctx.pendingTimer = setTimeout(function () {
      s.primary = null
      if (ctx.server === 'out') {
        s.run = 'blocked'
        s.msg = null
        dockSet('quota', 'out')
        dockSet('error', 'none')
        patch(ctx)
        return
      }
      // L2：未搜索时找不到搜索按钮 → 留在待命并说明下一步；成功开始则清掉旧消息
      if (s.blank) {
        s.msg = 'not-searched'
        dockSet('error', 'not-searched')
        patch(ctx)
        return
      }
      s.msg = null
      s.run = 'extracting'
      s.n = 0
      s.reason = 'limit'
      ctx.marked = 0
      dockSet('error', 'none')
      dockSet('run', 'extracting')
      patch(ctx)
      hostSync(ctx)
      mapsStart()
    }, 520)
  }

  var toggleDock = function (ctx, btn) {
    var s = ctx.s
    s.side = sideOf(s) === 'left' ? 'right' : 'left'
    var apply = function () {
      ctx.root.classList.toggle('mgp--left', s.side === 'left')
      ctx.root.classList.toggle('mgp--right', s.side === 'right')
    }
    UI.flip(ctx.root, apply)
    var other = s.side === 'left' ? 'right' : 'left'
    btn.setAttribute('aria-label', 'Move panel to the ' + other)
    btn.setAttribute('title', 'Move to the ' + other)
    btn.innerHTML = pi(s.side === 'left' ? 'dock-right' : 'dock-left')
  }

  // L4：打开新标签采集 → 「Collecting in a new tab」+ 方形再次打开，4 秒后复位
  var openRow = function (ctx, kind) {
    var s = ctx.s
    var wasOpen = s.rows[kind] === 'opened'
    s.rows[kind] = 'opened'
    patch(ctx)
    UI.toast({
      title: (wasOpen ? 'Reopened the ' : 'Opened the ') + kind + ' page in a new tab',
      desc: 'Collection runs there with its own panel; this one stays free.',
      tone: 'primary',
      icon: 'external-link'
    })
    clearTimeout(ctx.timers[kind])
    ctx.timers[kind] = setTimeout(function () {
      s.rows[kind] = 'ready'
      patch(ctx)
      if (Proto.get('rows') === 'opened') dockSet('rows', 'ready')
    }, MG.ms('--dur-toast') || 4000)
    dockSet('rows', 'opened')
  }

  var checkAgain = function (ctx) {
    var s = ctx.s
    s.checking = true
    patch(ctx)
    ctx.pendingTimer = setTimeout(function () {
      s.checking = false
      if (ctx.server === 'out') {
        s.msg = 'still-out'
        patch(ctx)
        return
      }
      s.run = MODES[s.mode].work ? 'extracting' : 'idle'
      s.n = 0
      s.msg = MODES[s.mode].work ? null : 'unlocked'
      ctx === live ? dockSet('quota', 'ok') : dockSet('wstate', 'extracting')
      patch(ctx)
      hostSync(ctx)
      if (s.run === 'extracting') ctx.start()
    }, 900)
  }

  live.onClick = function (e) {
    var ctx = live
    var t = e.target.closest('button, a')
    if (!t || !ctx.root || !ctx.root.contains(t)) return
    if (t.tagName === 'A') e.preventDefault()
    if (t.disabled || t.getAttribute('aria-disabled') === 'true') return
    var s = ctx.s
    if (t.hasAttribute('data-link')) {
      linkToast(t.dataset.link, ctx)
      return
    }
    if (t.hasAttribute('data-dock')) {
      toggleDock(ctx, t)
      return
    }
    if (t.hasAttribute('data-row-action')) {
      openRow(ctx, t.closest('[data-row]').dataset.row)
      return
    }
    if (t.hasAttribute('data-check')) {
      checkAgain(ctx)
      return
    }
    if (t.hasAttribute('data-primary')) {
      if (s.run === 'idle') {
        mapsStartClick()
        return
      }
      exportToast(s, false)
      flashExported(ctx)
      return
    }
    if (t.hasAttribute('data-secondary')) {
      if (s.run === 'extracting') {
        s.run = 'paused'
        stopTicker(ctx)
        dockSet('run', 'paused')
      } else if (s.run === 'paused') {
        // 恢复即「下一次成功动作」：Google 限流消息清除（L2）
        if (s.msg === 'google') {
          s.msg = null
          dockSet('error', 'none')
        }
        s.run = 'extracting'
        dockSet('run', 'extracting')
        mapsStart()
      } else if (s.run === 'complete') {
        clearInterval(ctx.finTimer)
        clearTimeout(ctx.timers.fin)
        s.task = null
        s.primary = null
        s.msg = null
        s.n = 0
        s.run = ctx.server === 'out' ? 'blocked' : 'idle'
        dockSet('run', 'idle')
        if (ctx.server === 'out') dockSet('quota', 'out')
      }
      patch(ctx)
      hostSync(ctx)
    }
  }

  // 状态坞 → 状态（连带关系在这里收敛：选一个错误会把模式 / 运行态拨到它会出现的地方）
  var MAPS_GROUPS = ['mode', 'run', 'quota', 'error', 'rows', 'finish', 'extra']
  var mapsDock = function () {
    var d = {}
    MAPS_GROUPS.forEach(function (g) {
      d[g] = Proto.get(g)
    })
    return d
  }

  var mapsCohere = function (d, changed) {
    if (changed === 'error') {
      if (d.error === 'not-searched') {
        d.mode = 'search'
        d.run = 'idle'
      } else if (d.error === 'parse' || d.error === 'google') {
        if (d.mode === 'place') d.mode = 'search'
        d.run = d.error === 'parse' ? 'extracting' : 'paused'
      } else if (d.error === 'unknown-place') {
        d.mode = 'place'
        d.rows = 'error'
      }
      if (d.error !== 'none') {
        d.quota = 'ok'
        if (d.extra === 'bulk' && d.error !== 'parse' && d.error !== 'google') d.extra = 'none'
      }
      if (d.error !== 'unknown-place' && d.rows === 'error') d.rows = 'ready'
    }
    if (changed === 'mode') {
      if (d.error === 'not-searched' && d.mode !== 'search') d.error = 'none'
      if (d.error === 'unknown-place' && d.mode !== 'place') d.error = 'none'
      if ((d.error === 'parse' || d.error === 'google') && d.mode === 'place') d.error = 'none'
      if (d.mode !== 'search' && d.extra === 'bulk') d.extra = 'none'
    }
    if (changed === 'run') {
      if (d.error === 'not-searched' && d.run !== 'idle') d.error = 'none'
      if (d.error === 'google' && d.run !== 'paused') d.error = 'none'
      if (d.error === 'parse' && d.run !== 'extracting') d.error = 'none'
    }
    if (changed === 'quota' && d.quota === 'out') {
      d.run = 'idle'
      if (d.error !== 'unknown-place') d.error = 'none'
      if (d.extra === 'bulk') d.extra = 'none'
    }
    if (changed === 'rows') {
      d.mode = 'place'
      if (d.rows === 'error') d.error = 'unknown-place'
      else if (d.error === 'unknown-place') d.error = 'none'
      if (d.rows === 'blocked') {
        d.quota = 'out'
        d.run = 'idle'
      } else if (d.quota === 'out') {
        d.quota = 'ok'
      }
    }
    if (changed === 'finish' && d.finish !== 'plain') {
      d.run = 'complete'
      if (d.error !== 'unknown-place') d.error = 'none'
    }
    if (changed === 'extra' && d.extra === 'bulk') {
      d.mode = 'search'
      d.run = 'extracting'
      d.error = 'none'
      d.quota = 'ok'
    }
    return d
  }

  var mapsState = function (d) {
    var m = MODES[d.mode]
    var s = S({ mode: d.mode, finish: d.finish })
    s.notice = d.extra === 'update' || d.extra === 'announce' ? d.extra : null
    s.balance = d.quota === 'low' ? 3 : null
    s.run = d.quota === 'out' && d.run === 'idle' ? 'blocked' : d.run
    if (d.extra === 'bulk' && d.mode === 'search') {
      s.bulk = { i: 3, total: 40, kind: 'keywords' }
      s.query = 'coffee in Brooklyn'
    }
    var limit = s.balance != null ? Math.min(m.limit, s.balance) : m.limit
    if (s.run === 'extracting') s.n = Math.min(limit - 1, { search: 6, list: 3, place: 0 }[d.mode])
    if (s.run === 'paused') s.n = Math.min(limit - 1, d.error === 'google' ? 4 : { search: 7, list: 5, place: 0 }[d.mode])
    if (s.run === 'extracting' && d.error === 'parse') s.n = Math.min(limit - 1, 4)
    if (s.run === 'complete') {
      s.n = d.mode === 'list' ? Math.min(limit, AVAILABLE.list) : limit
      s.reason = d.mode === 'list' && limit > AVAILABLE.list ? 'end' : 'limit'
      if (d.finish === 'contacts' || d.finish === 'both') {
        s.task = { done: Math.round(s.n * 0.3), total: Math.max(1, Math.round(s.n * 0.8)) }
        s.primary = 'finishing'
      } else if (s.bulk) {
        s.msg = 'bulk-done'
      } else if (d.finish === 'download') {
        s.msg = 'downloaded'
      }
    }
    if (d.error === 'not-searched') {
      s.blank = true
      s.msg = 'not-searched'
    }
    if (d.error === 'parse' || d.error === 'google') s.msg = d.error
    if (d.error === 'unknown-place') s.rowMsg = 'unknown-place'
    s.rows = { reviews: d.rows === 'opened' ? 'opened' : d.rows, photos: d.rows === 'opened' ? 'ready' : d.rows }
    if (d.rows === 'blocked') s.rows = { reviews: 'ready', photos: 'ready' }
    return s
  }

  var mapsRebuild = function (changed) {
    var d = mapsDock()
    if (changed) {
      d = mapsCohere(d, changed)
      MAPS_GROUPS.forEach(function (g) {
        dockSet(g, d[g])
      })
    }
    var prevSide = live.root ? sideOf(live.s) : null
    live.s = mapsState(d)
    live.server = d.quota === 'out' ? 'out' : 'ok'
    // 换模式时停靠方向重置（详情默认右）：左右变化时补间过去
    mount(live, { flip: prevSide && prevSide !== sideOf(live.s) })
    if (live.s.rows.reviews === 'opened') {
      live.timers.reviews = setTimeout(function () {
        live.s.rows.reviews = 'ready'
        patch(live)
        dockSet('rows', 'ready')
      }, 4000)
    }
  }

  /* ================================================================ ④ 实时演示 · 工作页 */
  var work = {
    page: document.querySelector('[data-work-page]'),
    host: document.querySelector('[data-work-host]'),
    url: document.querySelector('[data-work-url]'),
    s: S({ mode: 'reviews', run: 'extracting' }),
    root: null,
    server: 'ok',
    timers: {}
  }

  work.start = function () {
    var ctx = work
    stopTicker(ctx)
    ctx.ticker = setInterval(function () {
      var s = ctx.s
      if (s.run !== 'extracting') {
        stopTicker(ctx)
        return
      }
      var v = view(s)
      // 评论按页（每页 10 条）；照片按批次到达
      var step = s.mode === 'reviews' ? 10 : 2 + Math.round(Math.random())
      s.n = Math.min(v.limit, s.n + step)
      if (s.n >= v.limit) {
        s.run = 'complete'
        s.reason = 'limit'
        stopTicker(ctx)
        dockSet('wstate', 'complete')
      }
      patch(ctx)
      hostSync(ctx)
    }, work.s.mode === 'reviews' ? 1500 : 600)
  }

  work.onClick = function (e) {
    var ctx = work
    var t = e.target.closest('button, a')
    if (!t || !ctx.root || !ctx.root.contains(t)) return
    if (t.tagName === 'A') e.preventDefault()
    if (t.disabled || t.getAttribute('aria-disabled') === 'true') return
    var s = ctx.s
    if (t.hasAttribute('data-link')) {
      linkToast(t.dataset.link, ctx)
      return
    }
    if (t.hasAttribute('data-check')) {
      checkAgain(ctx)
      return
    }
    if (t.hasAttribute('data-primary')) {
      exportToast(s, false)
      flashExported(ctx)
      return
    }
    if (t.hasAttribute('data-secondary')) {
      // Reset：重查额度期间 Export / Reset 都不可用（logic.md §4）
      s.secondary = 'checking'
      dockSet('wstate', 'checking')
      patch(ctx)
      resolveCheck(ctx, 900)
    }
  }

  var resolveCheck = function (ctx, delay) {
    clearTimeout(ctx.pendingTimer)
    ctx.pendingTimer = setTimeout(function () {
      var s = ctx.s
      s.secondary = null
      s.msg = null
      s.n = 0
      if (ctx.server === 'out') {
        s.run = 'blocked'
        dockSet('wstate', 'quota')
      } else {
        s.run = 'extracting'
        dockSet('wstate', 'extracting')
      }
      patch(ctx)
      hostSync(ctx)
      if (s.run === 'extracting') ctx.start()
    }, delay)
  }

  var workRebuild = function (changed) {
    var d = { work: Proto.get('work'), wstate: Proto.get('wstate') }
    if (changed === 'wstate' && d.wstate === 'no-reviews') dockSet('work', (d.work = 'reviews'))
    if (changed === 'work' && d.work === 'photos' && d.wstate === 'no-reviews') dockSet('wstate', (d.wstate = 'complete'))
    var m = MODES[d.work]
    var s = S({ mode: d.work })
    var st = d.wstate
    if (st === 'quota') s.run = 'blocked'
    else if (st === 'no-reviews') {
      s.run = 'empty'
      s.msg = 'no-reviews'
    } else if (st === 'google') {
      s.run = 'stopped'
      s.n = d.work === 'reviews' ? 10 : 4
      s.msg = 'google-' + d.work
    } else if (st === 'extracting') {
      s.run = 'extracting'
      s.n = d.work === 'reviews' ? 10 : 4
    } else {
      s.run = 'complete'
      s.n = m.limit
      if (st === 'checking') s.secondary = 'checking'
    }
    work.s = s
    work.server = st === 'quota' ? 'out' : 'ok'
    mount(work)
    // 从状态坞选中的「重查中」停留久一点，便于查看；点击触发的 0.9 秒
    if (st === 'checking') resolveCheck(work, 2600)
  }

  /* ================================================================ ⑤ 状态矩阵 */
  var MAP_ART = Proto.mapArt()
  var GROUPS = [
    {
      id: 'run', kicker: 'Run · L1', title: 'Main run', desc: 'The ring is N / this run’s limit; Start becomes Export N in the same button, Pause → Resume → Reset in the other.',
      tiles: [
        { title: 'Search · Ready', note: 'Run limit is visible before Start', s: S({}), live: { mode: 'search', run: 'idle' } },
        { title: 'List mode · Ready', note: 'List Mode tag; opens places one by one', s: S({ mode: 'list' }), live: { mode: 'list', run: 'idle' } },
        { title: 'Extracting', note: 'Rolling count, ring, scan arc and pulse dot', s: S({ run: 'extracting', n: 6 }), live: { mode: 'search', run: 'extracting' } },
        { title: 'Paused', note: '“Paused · 7 places” — export or resume (L1)', s: S({ run: 'paused', n: 7 }), live: { mode: 'search', run: 'paused' } },
        { title: 'Complete · limit', note: 'Export stays primary, Reset secondary', s: S({ run: 'complete', n: 10 }), live: { mode: 'search', run: 'complete' } },
        { title: 'Complete · end of list', note: 'Ended before the limit; the caption says why', s: S({ mode: 'list', run: 'complete', n: 8, reason: 'end' }), live: { mode: 'list', run: 'complete' } },
        { title: 'Place · Complete', note: 'One place per run, docked right', s: S({ mode: 'place', run: 'complete', n: 1 }), live: { mode: 'place', run: 'complete' } },
        { title: 'Dock toggle', note: 'Search docked right after the toggle (not persisted)', s: S({ run: 'extracting', n: 4, side: 'right' }) }
      ]
    },
    {
      id: 'finish', kicker: 'After complete', title: 'Finishing up', desc: 'Optional email & social enrichment runs after the last place; Export waits for it so the file is complete. Auto-download leaves a note instead of a surprise.',
      tiles: [
        { title: 'Adding contact details', note: 'Settings: extract emails / social links', s: S({ run: 'complete', n: 10, task: { done: 5, total: 8 }, primary: 'finishing' }), live: { mode: 'search', finish: 'contacts' } },
        { title: 'Downloaded automatically', note: 'Settings: auto-download; Export gives another copy', s: S({ run: 'complete', n: 10, msg: 'downloaded' }), live: { mode: 'search', finish: 'download' } },
        { title: 'Exported', note: 'One-shot receipt in the button, back after 1.6 s', s: S({ run: 'complete', n: 10, primary: 'exported' }) }
      ]
    },
    {
      id: 'quota', kicker: 'Quota · L3', title: 'Monthly records', desc: 'The upgrade entry is always there when records run out (Pricing by default). Start re-reads the quota every time; while it is disabled, Check again does.',
      tiles: [
        { title: 'Monthly limit reached', note: 'Start disabled, upgrade entry shown', s: S({ run: 'blocked' }), live: { quota: 'out', run: 'idle', error: 'none' } },
        { title: 'Still at the limit', note: 'Check again re-read the quota', s: S({ run: 'blocked', msg: 'still-out' }) },
        { title: 'Records available again', note: 'After upgrading, Check again unlocks Start', s: S({ run: 'idle', msg: 'unlocked' }) },
        { title: 'Low balance', note: 'Run limit = min(plan, records left)', s: S({ balance: 3 }), live: { quota: 'low', run: 'idle' } }
      ]
    },
    {
      id: 'errors', kicker: 'Errors · L2', title: 'Reason and next step', desc: 'Each failure names its cause and the next step; the next successful action clears it. No generic “Data parse failed”.',
      tiles: [
        { title: 'Not searched yet', note: 'Start on the Maps home page', s: S({ msg: 'not-searched' }), live: { error: 'not-searched' } },
        { title: 'Couldn’t read results', note: 'Keeps trying; next good batch clears it', s: S({ run: 'extracting', n: 4, msg: 'parse' }), live: { error: 'parse' } },
        { title: 'Google is limiting', note: 'Auto-paused with a way out', s: S({ run: 'paused', n: 4, msg: 'google' }), live: { error: 'google' } },
        { title: 'Place not identified', note: 'Scoped to the Reviews / Photos entries', s: S({ mode: 'place', rowMsg: 'unknown-place', rows: { reviews: 'error', photos: 'error' } }), live: { error: 'unknown-place' } }
      ]
    },
    {
      id: 'place', kicker: 'This place · L4', title: 'Reviews & Photos entries', desc: 'Both entries behave the same: open a work tab, say so, offer Reopen, reset after 4 s — the reviews entry no longer sticks.',
      tiles: [
        { title: 'Ready', note: 'Counts from the place page', s: S({ mode: 'place' }), live: { mode: 'place', rows: 'ready' } },
        { title: 'Collecting in a new tab', note: 'Square Reopen + 4 s countdown line', s: S({ mode: 'place', rows: { reviews: 'opened', photos: 'ready' } }), live: { mode: 'place', rows: 'opened' } },
        { title: 'No records left', note: 'Quota gates the entries too', s: S({ mode: 'place', run: 'blocked' }), live: { rows: 'blocked' } }
      ]
    },
    {
      id: 'ops', kicker: 'Notices & bulk', title: 'Remote notices and bulk tasks', desc: 'Notices come from remote config and hide if it fails to load. The bulk strip is a design proposal: display-only context plus a link back to the dashboard.',
      tiles: [
        { title: 'Update required', note: 'Below the minimum version', s: S({ notice: 'update' }), live: { extra: 'update' } },
        { title: 'Announcement', note: 'Remote HTML, quiet tone', s: S({ notice: 'announce' }), live: { extra: 'announce' } },
        { title: 'Bulk task · running', note: 'Proposal: auto-started item 3 of 40', s: S({ run: 'extracting', n: 5, bulk: { i: 3, total: 40, kind: 'keywords' } }), live: { extra: 'bulk' } },
        { title: 'Bulk task · item done', note: 'Forced export, reported, next item opens', s: S({ run: 'complete', n: 10, bulk: { i: 3, total: 40, kind: 'keywords' }, msg: 'bulk-done' }) }
      ]
    },
    {
      id: 'work', kicker: 'Work pages · §4', title: 'Reviews and photos work pages', desc: 'Pinned left, no dock toggle, no Pause. Extracting starts on mount; Reset re-checks records first and disables both buttons meanwhile.',
      stage: true,
      tiles: [
        { title: 'Reviews · Extracting', note: 'Pages of 10, export any time', s: S({ mode: 'reviews', run: 'extracting', n: 10 }), live: { work: 'reviews', wstate: 'extracting' } },
        { title: 'Reviews · Complete', note: 'Export + Reset', s: S({ mode: 'reviews', run: 'complete', n: 20 }), live: { work: 'reviews', wstate: 'complete' } },
        { title: 'Reviews · Checking records', note: 'Reset re-checks the quota first', s: S({ mode: 'reviews', run: 'complete', n: 20, secondary: 'checking' }), live: { work: 'reviews', wstate: 'checking' } },
        { title: 'Reviews · No reviews', note: 'Nothing to collect — not a success tick', s: S({ mode: 'reviews', run: 'empty', msg: 'no-reviews' }), live: { work: 'reviews', wstate: 'no-reviews' } },
        { title: 'Reviews · Google stopped', note: 'Ended early, partial results kept', s: S({ mode: 'reviews', run: 'stopped', n: 10, msg: 'google-reviews' }), live: { work: 'reviews', wstate: 'google' } },
        { title: 'Reviews · Monthly limit', note: 'Upgrade entry; Check again restarts', s: S({ mode: 'reviews', run: 'blocked' }), live: { work: 'reviews', wstate: 'quota' } },
        { title: 'Reviews · Bulk task', note: 'Proposal: URL 5 of 12, task limit 300', s: S({ mode: 'reviews', run: 'extracting', n: 120, limit: 300, bulk: { i: 5, total: 12, kind: 'reviews' }, plan: 'Bulk task · 300 reviews per place' }) },
        { title: 'Photos · Extracting', note: 'Street View filtered out', s: S({ mode: 'photos', run: 'extracting', n: 6 }), live: { work: 'photos', wstate: 'extracting' } },
        { title: 'Photos · Complete', note: 'Photo URL + Video URL columns', s: S({ mode: 'photos', run: 'complete', n: 10 }), live: { work: 'photos', wstate: 'complete' } },
        { title: 'Photos · Google stopped', note: 'Same pattern as reviews', s: S({ mode: 'photos', run: 'stopped', n: 4, msg: 'google-photos' }), live: { work: 'photos', wstate: 'google' } }
      ]
    }
  ]

  var tilesEl = document.querySelector('[data-tiles]')
  var jumpEl = document.querySelector('[data-jump]')
  var tileIndex = []

  tilesEl.innerHTML = GROUPS.map(function (g) {
    return (
      '<section class="mp-group" id="states-' + g.id + '" aria-labelledby="states-' + g.id + '-title">' +
      '<header class="mp-group-head"><span class="kicker">' + g.kicker + '</span><h3 class="mp-group-title" id="states-' + g.id + '-title">' + g.title + '</h3><p class="mp-group-desc">' + g.desc + '</p></header>' +
      '<div class="mp-tiles">' +
      g.tiles
        .map(function (t) {
          var i = tileIndex.push(t) - 1
          var side = sideOf(t.s)
          return (
            '<figure class="mp-tile">' +
            '<figcaption><b>' + t.title + '</b><span class="mp-tile-class">.mgp--' + side + '</span>' +
            '<span class="mp-tile-note">' + t.note + (t.live ? '<a class="mp-tile-live" href="#' + (MODES[t.s.mode].work ? 'work' : 'live') + '" data-live="' + i + '">Open live' + UI.icon('arrow-up') + '</a>' : '') + '</span></figcaption>' +
            '<div class="mp-stage-tile" data-stage="' + i + '">' + (MODES[t.s.mode].work ? '' : MAP_ART) + '<div class="proto-panel-host" data-tile="' + i + '"></div></div>' +
            '</figure>'
          )
        })
        .join('') +
      '</div>' +
      '</section>'
    )
  }).join('')

  jumpEl.innerHTML = GROUPS.map(function (g) {
    return '<a href="#states-' + g.id + '">' + g.title + '<span>' + g.tiles.length + '</span></a>'
  }).join('')

  // 舞台高度按面板实测（面板 fixed，不撑开舞台）
  var fitStage = window.ResizeObserver
    ? new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          var stage = entry.target.getRootNode().host.parentElement
          stage.style.minHeight = Math.ceil(entry.target.offsetHeight + 32) + 'px'
        })
      })
    : null

  tilesEl.querySelectorAll('[data-tile]').forEach(function (hostEl) {
    var t = tileIndex[Number(hostEl.dataset.tile)]
    if (MODES[t.s.mode].work) {
      var backdrop = document.createElement('div')
      hostEl.parentElement.insertBefore(backdrop, hostEl)
      Proto.gmap(backdrop, { mode: t.s.mode })
    }
    var shadow = UI.mountPanel(hostEl, { html: panelHTML(t.s) })
    if (fitStage) fitStage.observe(shadow.querySelector('.mgp'))
    // 瓦片里的链接与按钮只做演示回执，不改状态
    shadow.addEventListener('click', function (e) {
      var a = e.target.closest('a')
      if (a) e.preventDefault()
    })
  })

  tilesEl.addEventListener('click', function (e) {
    var a = e.target.closest('[data-live]')
    if (!a) return
    e.preventDefault()
    var t = tileIndex[Number(a.dataset.live)]
    openLive(t.live, MODES[t.s.mode].work ? 'work' : 'live')
  })

  // 把一组状态坞取值一次性载入实时演示（不走连带收敛，取值本身就是一致的）
  var openLive = function (values, target) {
    var maps = target === 'live'
    var base = maps ? { mode: 'search', run: 'idle', quota: 'ok', error: 'none', rows: 'ready', finish: 'plain', extra: 'none' } : { work: 'reviews', wstate: 'extracting' }
    var all = Object.assign(base, values)
    Object.keys(all).forEach(function (g) {
      dockSet(g, all[g])
    })
    if (maps) mapsRebuild(null)
    else workRebuild(null)
    document.getElementById(target).scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
  }

  /* ================================================================ ⑥ 状态坞 */
  var ready = false
  var group = function (def, rebuild) {
    def.onChange = function (value, prev) {
      if (!ready || syncing || prev === null) return
      rebuild(def.group)
    }
    Proto.states(def)
  }

  group({ group: 'mode', label: 'Mode · §3.1', options: [{ value: 'search', label: 'Search' }, { value: 'list', label: 'List' }, { value: 'place', label: 'Place' }] }, mapsRebuild)
  group(
    {
      group: 'run',
      label: 'Run · L1',
      value: hero ? 'complete' : 'idle',
      options: [
        { value: 'idle', label: 'Idle' },
        { value: 'extracting', label: 'Extracting' },
        { value: 'paused', label: 'Paused' },
        { value: 'complete', label: 'Complete' }
      ]
    },
    mapsRebuild
  )
  group({ group: 'quota', label: 'Quota · L3', options: [{ value: 'ok', label: 'Available' }, { value: 'low', label: '3 left' }, { value: 'out', label: 'Used up' }] }, mapsRebuild)
  group(
    {
      group: 'error',
      label: 'Error · L2',
      options: [
        { value: 'none', label: 'None' },
        { value: 'not-searched', label: 'Not searched' },
        { value: 'parse', label: 'Parse failed' },
        { value: 'google', label: 'Google limiting' },
        { value: 'unknown-place', label: 'Place unknown' }
      ]
    },
    mapsRebuild
  )
  group(
    {
      group: 'rows',
      label: 'Place entries · L4',
      options: [
        { value: 'ready', label: 'Ready' },
        { value: 'opened', label: 'New tab' },
        { value: 'blocked', label: 'Quota' },
        { value: 'error', label: 'Unknown' }
      ]
    },
    mapsRebuild
  )
  group(
    {
      group: 'finish',
      label: 'On complete · settings',
      options: [
        { value: 'plain', label: 'Off' },
        { value: 'contacts', label: 'Contacts' },
        { value: 'download', label: 'Auto-download' },
        { value: 'both', label: 'Both' }
      ]
    },
    mapsRebuild
  )
  group(
    {
      group: 'extra',
      label: 'Notice · bulk',
      options: [
        { value: 'none', label: 'None' },
        { value: 'update', label: 'Update' },
        { value: 'announce', label: 'Announcement' },
        { value: 'bulk', label: 'Bulk task' }
      ]
    },
    mapsRebuild
  )
  group({ group: 'work', label: 'Work page · §4', options: [{ value: 'reviews', label: 'Reviews' }, { value: 'photos', label: 'Photos' }] }, workRebuild)
  group(
    {
      group: 'wstate',
      label: 'Work page state',
      options: [
        { value: 'extracting', label: 'Extracting' },
        { value: 'complete', label: 'Complete' },
        { value: 'checking', label: 'Checking' },
        { value: 'no-reviews', label: 'No reviews' },
        { value: 'google', label: 'Google error' },
        { value: 'quota', label: 'Used up' }
      ]
    },
    workRebuild
  )

  /* ------------------------------------------------------------ 播放流程 */
  var clickIn = function (ctx, sel) {
    var el = ctx.root && ctx.root.querySelector(sel)
    if (el) el.click()
  }
  var until = function (p, test, limit) {
    var waited = 0
    var loop = function () {
      if (test() || waited >= (limit || 20000)) return Promise.resolve()
      waited += 200
      return p.wait(200).then(loop)
    }
    return loop()
  }
  var resetMaps = function (p, values) {
    var all = Object.assign({ mode: 'search', run: 'idle', quota: 'ok', error: 'none', rows: 'ready', finish: 'plain', extra: 'none' }, values || {})
    Object.keys(all).forEach(function (g) {
      dockSet(g, all[g])
    })
    mapsRebuild(null)
    document.getElementById('live').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
  }

  Proto.flow('Search run', function (p) {
    resetMaps(p)
    p.step('Ready on a search')
    return p
      .wait(1000)
      .then(function () {
        p.step('Start · re-reads the quota (L3)')
        clickIn(live, '[data-primary]')
        return p.wait(2600)
      })
      .then(function () {
        p.step('Dock right to watch the list')
        clickIn(live, '[data-dock]')
        return p.wait(1200)
      })
      .then(function () {
        p.step('Pause · “Paused · N places”')
        if (live.s.run === 'extracting') clickIn(live, '[data-secondary]')
        return p.wait(2000)
      })
      .then(function () {
        p.step('Resume')
        if (live.s.run === 'paused') clickIn(live, '[data-secondary]')
        return until(p, function () {
          return live.s.run === 'complete'
        })
      })
      .then(function () {
        p.step('Complete · Export')
        return p.wait(900)
      })
      .then(function () {
        clickIn(live, '[data-primary]')
        return p.wait(2000)
      })
      .then(function () {
        p.step('Dock back left')
        clickIn(live, '[data-dock]')
      })
  })

  Proto.flow('List mode', function (p) {
    resetMaps(p, { mode: 'list' })
    p.step('List page detected')
    return p
      .wait(1000)
      .then(function () {
        p.step('Opens places one by one')
        clickIn(live, '[data-primary]')
        return until(p, function () {
          return live.s.run === 'complete'
        })
      })
      .then(function () {
        p.step('End of the list before the limit')
      })
  })

  Proto.flow('Place · reviews & photos', function (p) {
    resetMaps(p, { mode: 'place' })
    p.step('Place page · docked right')
    return p
      .wait(1000)
      .then(function () {
        p.step('Collect this place')
        clickIn(live, '[data-primary]')
        return until(p, function () {
          return live.s.run === 'complete'
        })
      })
      .then(function () {
        p.step('Reviews · opens a work tab (L4)')
        return p.wait(800)
      })
      .then(function () {
        clickIn(live, '[data-row="reviews"] [data-row-action]')
        return p.wait(2000)
      })
      .then(function () {
        p.step('Photos · same behavior')
        clickIn(live, '[data-row="photos"] [data-row-action]')
        return p.wait(4600)
      })
      .then(function () {
        p.step('Both entries reset after 4 s')
      })
  })

  Proto.flow('Limit & upgrade', function (p) {
    resetMaps(p)
    p.step('Records ran out in another tab')
    live.server = 'out'
    return p
      .wait(1000)
      .then(function () {
        p.step('Start re-reads the quota → blocked (L3)')
        clickIn(live, '[data-primary]')
        return p.wait(2200)
      })
      .then(function () {
        p.step('Check again · still at the limit')
        clickIn(live, '[data-check]')
        return p.wait(2600)
      })
      .then(function () {
        p.step('Upgraded on mapsgrab.com')
        live.server = 'ok'
        return p.wait(1200)
      })
      .then(function () {
        p.step('Check again · records available')
        clickIn(live, '[data-check]')
        return p.wait(2200)
      })
      .then(function () {
        p.step('Start')
        clickIn(live, '[data-primary]')
      })
  })

  Proto.flow('Errors (L2)', function (p) {
    resetMaps(p, { error: 'not-searched' })
    p.step('Maps home · nothing searched')
    return p
      .wait(1800)
      .then(function () {
        p.step('Searched “coffee near Manhattan”')
        resetMaps(p)
        return p.wait(900)
      })
      .then(function () {
        p.step('Start · the old message is gone')
        clickIn(live, '[data-primary]')
        return p.wait(2400)
      })
      .then(function () {
        p.step('Google limits requests → auto-pause')
        var s = live.s
        if (s.run === 'extracting') {
          s.run = 'paused'
          s.msg = 'google'
          stopTicker(live)
          dockSet('run', 'paused')
          dockSet('error', 'google')
          patch(live)
          hostSync(live)
        }
        return p.wait(3000)
      })
      .then(function () {
        p.step('Resume clears it')
        if (live.s.run === 'paused') clickIn(live, '[data-secondary]')
        return until(p, function () {
          return live.s.run === 'complete'
        })
      })
      .then(function () {
        p.step('Complete')
      })
  })

  Proto.flow('Finish · contacts & download', function (p) {
    resetMaps(p, { finish: 'both' })
    p.step('Settings: contacts + auto-download')
    // 从完成前两条开始，直接看收尾
    live.s.run = 'idle'
    return p
      .wait(800)
      .then(function () {
        clickIn(live, '[data-primary]')
        return until(p, function () {
          return live.s.run === 'extracting'
        })
      })
      .then(function () {
        live.s.n = 7
        p.step('Last places…')
        return until(p, function () {
          return live.s.run === 'complete'
        })
      })
      .then(function () {
        p.step('Adding emails & social links')
        return until(p, function () {
          return !live.s.task && live.s.msg === 'downloaded'
        })
      })
      .then(function () {
        p.step('Downloaded automatically')
      })
  })

  Proto.flow('Bulk task item', function (p) {
    resetMaps(p, { extra: 'bulk', run: 'extracting' })
    p.step('Opened by the bulk scheduler · auto-start')
    return until(p, function () {
      return live.s.run === 'complete'
    }).then(function () {
      p.step('Forced export · reported · next keyword')
    })
  })

  Proto.flow('Reviews work page', function (p) {
    dockSet('work', 'reviews')
    dockSet('wstate', 'extracting')
    work.s = S({ mode: 'reviews', run: 'extracting' })
    work.server = 'ok'
    mount(work)
    document.getElementById('work').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
    p.step('Mounted · extracting page 1')
    return until(p, function () {
      return work.s.run === 'complete'
    })
      .then(function () {
        p.step('Export')
        clickIn(work, '[data-primary]')
        return p.wait(2200)
      })
      .then(function () {
        p.step('Reset · re-checks records')
        clickIn(work, '[data-secondary]')
        return until(p, function () {
          return work.s.run === 'extracting'
        })
      })
      .then(function () {
        p.step('Extracting again')
      })
  })

  /* ------------------------------------------------------------ 启动 */
  ready = true
  mapsRebuild(null)
  workRebuild(null)
})()
