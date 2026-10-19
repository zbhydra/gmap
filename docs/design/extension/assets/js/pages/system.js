/*
 * design-system.html 页面脚本。
 *   ① 立即执行（defer 顺序在 motion.js / ui.js 之前）：抓取示例原始标记、预置半选复选框
 *   ② DOMContentLoaded：色板与实测对比度、字号实测、尺寸刻度、缓动曲线、动效演示、组件交互、
 *      页内面板（真实 Shadow DOM：实时面板 + 状态图集 + 标记）、图标网格、目录高亮
 * 页内面板标记由 panelHTML() 生成，是 panel.css 词汇的参考实现；Phase B 的 panel.html 以它为起点。
 */
;(function () {
  var SPRITE = 'assets/img/icons.svg'

  var dedent = function (html) {
    var lines = html.replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n')
    var min = Infinity
    lines.forEach(function (line) {
      if (line.trim()) min = Math.min(min, line.match(/^ */)[0].length)
    })
    return lines
      .map(function (line) {
        return line.slice(min)
      })
      .join('\n')
  }

  /* ① 抓取 —— 运行时会改写的 DOM（滚轮、tab 隐藏、滑块定位）在此之前保持原样 */
  var snippets = []
  document.querySelectorAll('.ds-demo[data-snippet] > .ds-stage').forEach(function (stage) {
    snippets.push({ demo: stage.parentElement, html: dedent(stage.innerHTML) })
  })

  document.querySelectorAll('[data-indeterminate]').forEach(function (el) {
    el.indeterminate = true
  })

  document.addEventListener('DOMContentLoaded', function () {
    var MG = window.MG
    var UI = window.UI
    var Proto = window.Proto
    var rootStyle = getComputedStyle(document.documentElement)
    var tokenValue = function (name) {
      return rootStyle.getPropertyValue(name).trim()
    }
    var esc = function (s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    }

    var copy = function (text, title) {
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {})
      UI.toast({ title: title || 'Copied to clipboard', tone: 'ok', icon: 'copy' })
    }

    /* ------------------------------------------------------------ 标记折叠 */
    var highlightHtml = function (src) {
      var safe = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return safe.replace(/(&lt;\/?)([a-zA-Z][\w-]*)|(\s)([a-zA-Z_:][-\w:.]*)(=)("[^"]*")|(\/?&gt;)/g, function (m, open, tag, sp, attr, eq, val, close) {
        if (tag) return '<span class="tok-punc">' + open + '</span><span class="tok-key">' + tag + '</span>'
        if (attr) return sp + '<span class="tok-fn">' + attr + '</span><span class="tok-punc">=</span><span class="tok-str">' + val + '</span>'
        return '<span class="tok-punc">' + close + '</span>'
      })
    }

    var codeDetails = function (src, label) {
      var details = document.createElement('details')
      details.className = 'ds-code'
      details.innerHTML =
        '<summary>' + UI.icon('chevron-right') + (label || 'Markup') + '</summary>' +
        '<div class="ds-code-body"><button class="icon-btn icon-btn--sm ds-code-copy" type="button" aria-label="Copy markup">' + UI.icon('copy') + '</button><pre></pre></div>'
      details.querySelector('pre').innerHTML = highlightHtml(src)
      details.querySelector('.ds-code-copy').addEventListener('click', function () {
        copy(src, 'Markup copied')
      })
      return details
    }

    snippets.forEach(function (s) {
      s.demo.appendChild(codeDetails(s.html))
    })

    document.querySelectorAll('[data-copy-from]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        copy(document.getElementById(btn.dataset.copyFrom).textContent, 'Copied')
      })
    })

    /* ---------------------------------------------------------------- 颜色 */
    var parseColor = function (color) {
      var m = color.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      var p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
    }
    var toHex = function (color) {
      var c = parseColor(color)
      if (!c) return color
      if (c.a < 1) return 'rgba(' + [c.r, c.g, c.b].join(',') + ',' + Math.round(c.a * 100) / 100 + ')'
      return (
        '#' +
        [c.r, c.g, c.b]
          .map(function (v) {
            return Math.round(v).toString(16).padStart(2, '0')
          })
          .join('')
      )
    }
    var over = function (fg, bg) {
      return { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 }
    }
    var luminance = function (c) {
      var ch = function (v) {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b)
    }
    var ratio = function (a, b) {
      var la = luminance(a)
      var lb = luminance(b)
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
    }

    var PRIMS = [
      ['Blue', ['--blue-300', '--blue-400', '--blue-500', '--blue-600', '--blue-700']],
      ['Cyan', ['--cyan-400', '--cyan-500']],
      ['Green', ['--green-400', '--green-500']],
      ['Coral', ['--coral-400', '--coral-500']],
      ['Amber', ['--amber-400', '--amber-500']]
    ]
    var prims = document.querySelector('[data-prims]')
    prims.innerHTML = PRIMS.map(function (g) {
      return (
        '<div class="ds-prim-group" style="--n:' + g[1].length + '"><span>' + g[0] + '</span><div class="ds-prim-row">' +
        g[1]
          .map(function (name) {
            return '<div class="ds-prim' + (name === '--blue-500' ? ' is-brand' : '') + '" style="--c: var(' + name + ')"><b>' + name.replace('--', '') + '</b><span data-hex></span></div>'
          })
          .join('') +
        '</div></div>'
      )
    }).join('')
    prims.querySelectorAll('.ds-prim').forEach(function (el) {
      var bg = getComputedStyle(el).backgroundColor
      el.querySelector('[data-hex]').textContent = toHex(bg)
      el.classList.toggle('is-light', luminance(parseColor(bg)) > 0.4)
    })

    var TOKENS = [
      ['Surfaces', [['--bg', 'Popup and page background'], ['--bg-2', 'Dashboard and Options canvas'], ['--surface', 'Cards, menus, inputs, the panel'], ['--surface-2', 'Hover, table heads, wells'], ['--surface-3', 'Segmented track, skeletons'], ['--raised', 'Thumb inside a track'], ['--border', 'Hairlines and dividers'], ['--border-2', 'Inputs, strong separators']]],
      ['Text', [['--text', 'Headings and body'], ['--text-2', 'Secondary copy'], ['--text-3', 'Hints and captions — not on surface-3'], ['--text-inverse', 'Text on inverted fills']]],
      ['Action', [['--primary', 'The only action color'], ['--primary-hover', 'Primary hover'], ['--primary-text', 'Links, active labels, icons'], ['--primary-soft', 'Selected fills, info notices'], ['--ring', 'Focus ring']]],
      ['Status', [['--ok', 'Completed, saved'], ['--ok-soft', 'Success fill'], ['--warn', 'Paused, near limit'], ['--warn-soft', 'Warning fill'], ['--bad', 'Errors, skipped, limit'], ['--bad-soft', 'Error fill'], ['--neutral', 'Idle, pending'], ['--neutral-soft', 'Neutral fill']]],
      ['Graphics — fills only, never text', [['--primary-solid', 'Live dot, progress, ring'], ['--ok-solid', 'Done ring and dot'], ['--warn-solid', 'Paused ring'], ['--bad-solid', 'Error ring'], ['--track', 'Progress and ring track'], ['--switch-off', 'Switch track, off']]],
      ['Narrative — illustration only', [['--pin', 'Map pins'], ['--star', 'Ratings'], ['--map-land', 'Map land'], ['--map-water', 'Map water'], ['--map-park', 'Map parks'], ['--map-road', 'Map roads']]]
    ]
    var tokensEl = document.querySelector('[data-tokens]')
    tokensEl.innerHTML = TOKENS.map(function (g) {
      return (
        '<div class="ds-tgroup"><span class="kicker">' + g[0] + '</span><div class="ds-tgrid">' +
        g[1]
          .map(function (t) {
            return (
              '<div class="ds-token" style="--c: var(' + t[0] + ')">' +
              '<div class="ds-token-swatch"><i class="scheme-light"></i><i class="scheme-dark"></i></div>' +
              '<div class="ds-token-meta"><code>' + t[0] + '</code><div class="ds-token-hex"><span data-hex-light></span><span data-hex-dark></span></div><p>' + t[1] + '</p></div></div>'
            )
          })
          .join('') +
        '</div></div>'
      )
    }).join('')
    tokensEl.querySelectorAll('.ds-token').forEach(function (card) {
      var halves = card.querySelectorAll('.ds-token-swatch i')
      card.querySelector('[data-hex-light]').textContent = toHex(getComputedStyle(halves[0]).backgroundColor)
      card.querySelector('[data-hex-dark]').textContent = toHex(getComputedStyle(halves[1]).backgroundColor)
    })

    // 对比度：两个主题岛里探针取解析后的颜色，软底先合成到 --surface 上
    var PAIRS = [
      ['--text', '--surface', 'Body copy', 4.5],
      ['--text-2', '--surface', 'Secondary copy', 4.5],
      ['--text-3', '--surface', 'Hints and captions', 4.5],
      ['--text-3', '--surface-2', 'Table heads, wells', 4.5],
      ['--text-3', '--bg-2', 'Captions on the page canvas', 4.5],
      ['--primary-text', '--surface', 'Links, active labels', 4.5],
      ['--primary-text', '--primary-soft', 'Selected chips, info notices', 4.5],
      ['--primary-fg', '--primary', 'Primary buttons', 4.5],
      ['--ok', '--ok-soft', 'Completed chip, saved', 4.5],
      ['--warn', '--warn-soft', 'Paused chip, near limit', 4.5],
      ['--bad', '--bad-soft', 'Errors, skipped', 4.5],
      ['--neutral', '--neutral-soft', 'Idle, pending', 4.5],
      ['--bad-fg', '--bad', 'Danger button', 4.5],
      ['--tooltip-fg', '--tooltip-bg', 'Tooltips', 4.5],
      ['--switch-off', '--surface', 'Switch track (non-text)', 3]
    ]
    var probeHost = document.createElement('div')
    probeHost.setAttribute('aria-hidden', 'true')
    probeHost.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    document.body.appendChild(probeHost)
    var probe = function (scheme, fg, bg) {
      var el = document.createElement('i')
      el.className = 'scheme-' + scheme
      el.style.color = 'var(' + fg + ')'
      el.style.backgroundColor = 'var(' + bg + ')'
      probeHost.appendChild(el)
      var cs = getComputedStyle(el)
      var out = { fg: parseColor(cs.color), bg: parseColor(cs.backgroundColor) }
      el.remove()
      return out
    }
    var measurePair = function (scheme, fg, bg) {
      var surface = probe(scheme, '--text', '--surface').bg
      var p = probe(scheme, fg, bg)
      var back = over(p.bg, surface)
      return ratio(over(p.fg, back), back)
    }
    var contrastBody = document.querySelector('[data-contrast]')
    contrastBody.innerHTML = PAIRS.map(function (pair) {
      var cell = function (scheme) {
        var r = measurePair(scheme, pair[0], pair[1])
        var pass = r >= pair[3]
        return (
          '<td><span class="row" style="--row-gap: var(--s-2)">' +
          '<span class="ds-pair scheme-' + scheme + '" style="color: var(' + pair[0] + '); background: var(' + pair[1] + ')">Aa</span>' +
          '<span class="mono">' + r.toFixed(2) + '</span>' +
          '<span class="badge ' + (pass ? 'tone-ok' : 'tone-bad') + '">' + (pass ? (pair[3] < 4.5 ? '3:1' : 'AA') : 'Fail') + '</span>' +
          '</span></td>'
        )
      }
      return '<tr><td class="cell-mono">' + pair[0] + ' on ' + pair[1] + '</td>' + cell('light') + cell('dark') + '<td>' + pair[2] + '</td></tr>'
    }).join('')

    /* ------------------------------------------------------------ 字号实测 */
    var scaleRows = Array.prototype.slice.call(document.querySelectorAll('.ds-scale-row'))
    var measureType = function () {
      scaleRows.forEach(function (row) {
        var sample = row.querySelector('.ds-scale-sample')
        var el = sample.querySelector('.kicker') || sample
        var cs = getComputedStyle(el)
        var fs = parseFloat(cs.fontSize)
        var lh = cs.lineHeight === 'normal' ? 'normal' : (parseFloat(cs.lineHeight) / fs).toFixed(2)
        row.querySelector('[data-metrics]').textContent = Math.round(fs * 10) / 10 + 'px / ' + lh + ' · ' + cs.fontWeight
      })
    }
    measureType()
    if (document.fonts) document.fonts.ready.then(measureType)

    /* ------------------------------------------------- 间距 / 圆角 / 投影 */
    document.querySelector('[data-space]').innerHTML = ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-8', '--s-10', '--s-12', '--s-16', '--s-20', '--s-24']
      .map(function (name) {
        return '<div class="ds-space-row"><code>' + name + '</code><span>' + tokenValue(name) + '</span><i style="--w: var(' + name + ')"></i></div>'
      })
      .join('')

    document.querySelector('[data-radii]').innerHTML = [
      ['--r-2xs', 'marks'],
      ['--r-xs', 'item'],
      ['--r-sm', 'control'],
      ['--r-md', 'card'],
      ['--r-lg', 'dialog'],
      ['--r-full', 'pill']
    ]
      .map(function (r) {
        return '<div class="ds-radius"><i style="--r: var(' + r[0] + ')"></i><span>' + r[0] + ' · ' + tokenValue(r[0]) + '<br />' + r[1] + '</span></div>'
      })
      .join('')

    document.querySelector('[data-shadows]').innerHTML = ['--shadow-xs', '--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-pop', '--shadow-primary']
      .map(function (name) {
        return '<div class="ds-shadow"><i style="--sh: var(' + name + ')"></i><span>' + name + '</span></div>'
      })
      .join('')

    /* ------------------------------------------------------------ 缓动曲线 */
    document.querySelectorAll('.ds-curve[data-bezier]').forEach(function (el) {
      var b = el.dataset.bezier.split(',').map(Number)
      var p1 = [b[0] * 100, 100 - b[1] * 100]
      var p2 = [b[2] * 100, 100 - b[3] * 100]
      el.querySelector('svg').innerHTML =
        '<rect class="ds-c-box" x="0" y="0" width="100" height="100" />' +
        '<line class="ds-c-handle" x1="0" y1="100" x2="' + p1[0] + '" y2="' + p1[1] + '" />' +
        '<line class="ds-c-handle" x1="100" y1="0" x2="' + p2[0] + '" y2="' + p2[1] + '" />' +
        '<path class="ds-c-path" d="M0,100 C' + p1.join(',') + ' ' + p2.join(',') + ' 100,0" />' +
        '<circle class="ds-c-dot" cx="' + p1[0] + '" cy="' + p1[1] + '" r="3.5" />' +
        '<circle class="ds-c-dot" cx="' + p2[0] + '" cy="' + p2[1] + '" r="3.5" />'
    })

    /* ------------------------------------------------------------ 动效演示 */
    // 入场重放：克隆替换，CSS 首帧动画重新播放
    document.querySelectorAll('[data-replay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.querySelector('[data-replay-target="' + btn.dataset.replay + '"]')
        target.querySelectorAll('.enter-group, .enter').forEach(function (el) {
          el.replaceWith(el.cloneNode(true))
        })
      })
    })

    // 数字滚轮
    var rollEl = document.querySelector('[data-roll-demo]')
    var rollValue = Number(rollEl.dataset.roll)
    document.querySelectorAll('[data-roll-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var add = btn.dataset.rollAdd
        rollValue = add === 'jump' ? (rollValue < 10000 ? 48090 : 1284) : rollValue + Number(add)
        MG.roll(rollEl, rollValue)
      })
    })

    // 进度：推进 + live 开关
    var progressDemo = document.querySelector('[data-progress-demo]')
    var progressValue = 30
    var progressRing = progressDemo.querySelector('.ring')
    var progressBar = progressDemo.querySelector('.progress.is-live, .progress:not(.is-indeterminate)')
    var progressLabel = progressDemo.querySelector('[data-progress-label]')
    var liveBtn = document.querySelector('[data-progress-live]')
    document.querySelector('[data-progress-step]').addEventListener('click', function () {
      progressValue = progressValue >= 100 ? 8 : Math.min(100, progressValue + 17)
      var done = progressValue >= 100
      progressRing.style.setProperty('--p', progressValue)
      progressRing.setAttribute('aria-valuenow', progressValue)
      progressBar.style.setProperty('--p', progressValue)
      progressRing.classList.toggle('is-done', done)
      progressRing.classList.toggle('tone-ok', done)
      progressBar.classList.toggle('tone-ok', done)
      progressLabel.innerHTML = done ? UI.icon('check') : progressValue + '%'
      if (done) {
        progressRing.classList.remove('is-live')
        progressBar.classList.remove('is-live')
        liveBtn.setAttribute('aria-pressed', 'false')
      }
    })
    liveBtn.addEventListener('click', function () {
      var on = liveBtn.getAttribute('aria-pressed') !== 'true'
      liveBtn.setAttribute('aria-pressed', String(on))
      progressRing.classList.toggle('is-live', on)
      progressBar.classList.toggle('is-live', on)
    })

    // 状态形变（任务：Idle → Running → Paused → Completed）
    var MORPH_STATES = [
      { key: 'start', status: 'idle', label: 'Idle', count: '0 / 120' },
      { key: 'pause', status: 'running', label: 'Running', count: '37 / 120' },
      { key: 'resume', status: 'paused', label: 'Paused', count: '37 / 120' },
      { key: 'again', status: 'completed', label: 'Completed', count: '120 / 120' }
    ]
    var morphIndex = 0
    var morphPrimary = document.querySelector('[data-morph-primary]')
    var morphStatus = document.querySelector('[data-morph-status]')
    var morphCount = document.querySelector('[data-morph-count]')
    var nextMorph = function () {
      morphIndex = (morphIndex + 1) % MORPH_STATES.length
      var s = MORPH_STATES[morphIndex]
      UI.morph(morphPrimary.querySelector('.morph'), s.key)
      morphStatus.className = 'status status--' + s.status
      morphStatus.textContent = s.label
      morphCount.textContent = s.count
    }
    morphPrimary.addEventListener('click', nextMorph)
    document.querySelector('[data-morph-next]').addEventListener('click', nextMorph)

    document.querySelectorAll('[data-morph-cycle]').forEach(function (btn) {
      var keys = btn.dataset.morphCycle.split(',')
      var i = 0
      btn.addEventListener('click', function () {
        i = (i + 1) % keys.length
        UI.morph(btn.querySelector('.morph'), keys[i])
      })
    })

    // 叙事条：Pin → Scan → Rows → Export
    var flowDemo = document.querySelector('[data-flow-demo]')
    var flowSteps = flowDemo.querySelectorAll('.flow-step')
    var flowRows = flowDemo.querySelector('[data-flow-rows]')
    var flowToken = 0
    var flowRow = function (p, i) {
      return '<div class="ds-flow-row" style="animation-delay:' + i * 60 + 'ms">' + UI.icon('pin') + '<b>' + esc(p.name) + '</b><span class="mono">' + p.rating.toFixed(1) + ' · ' + MG.formatNumber(p.reviews) + '</span></div>'
    }
    var runFlow = function () {
      var token = ++flowToken
      flowSteps.forEach(function (s) {
        s.classList.remove('is-active', 'is-done')
      })
      flowRows.innerHTML = ''
      if (MG.reducedMotion()) {
        flowSteps.forEach(function (s) {
          s.classList.add('is-done')
        })
        flowRows.innerHTML = Proto.places.slice(0, 3).map(flowRow).join('')
        return
      }
      var at = function (ms, fn) {
        setTimeout(function () {
          if (token === flowToken) fn()
        }, ms)
      }
      var activate = function (i) {
        if (i > 0) {
          flowSteps[i - 1].classList.remove('is-active')
          flowSteps[i - 1].classList.add('is-done')
        }
        if (i < flowSteps.length) flowSteps[i].classList.add('is-active')
      }
      at(0, function () {
        activate(0)
      })
      at(800, function () {
        activate(1)
      })
      at(1700, function () {
        activate(2)
      })
      ;[0, 1, 2].forEach(function (i) {
        at(1800 + i * 260, function () {
          flowRows.insertAdjacentHTML('beforeend', flowRow(Proto.places[i], 0))
        })
      })
      at(2900, function () {
        activate(3)
      })
      at(3700, function () {
        activate(4)
      })
    }
    MG.inView(flowDemo, runFlow, { threshold: 0.5 })
    document.querySelector('[data-flow-replay]').addEventListener('click', runFlow)

    /* ------------------------------------------------------------ 组件交互 */
    var TOASTS = {
      ok: { title: 'Export ready', desc: 'MapsGrab-coffee-near-Manhattan-2026-10-18.csv · 48 places', tone: 'ok', icon: 'download' },
      primary: { title: 'Task started', desc: 'Coffee shops · Austin runs in background tabs.', tone: 'primary', icon: 'play' },
      warn: { title: 'Google is limiting requests', desc: 'Paused for a minute. The task resumes on its own.', tone: 'warn', icon: 'hourglass' },
      bad: { title: 'Couldn’t save settings', desc: 'Check your connection and try again.', tone: 'bad', icon: 'x', action: { label: 'Retry', onClick: function () {} } }
    }
    document.querySelectorAll('[data-toast-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        UI.toast(TOASTS[btn.dataset.toastDemo])
      })
    })

    var confirmDelete = function (name) {
      return UI.confirm({
        title: 'Delete this task?',
        descHtml: '<b>' + esc(name || 'Coffee shops · Austin') + '</b> and its progress will be removed. Files you already exported stay on your computer.',
        icon: 'trash',
        danger: true,
        confirmLabel: 'Delete task',
        cancelLabel: 'Cancel'
      }).then(function (ok) {
        if (ok) UI.toast({ title: 'Task deleted', tone: 'ok', icon: 'trash' })
      })
    }
    document.querySelectorAll('[data-confirm-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        confirmDelete()
      })
    })
    document.querySelectorAll('[data-confirm-plain]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        UI.confirm({
          title: 'Save as 3 tasks?',
          desc: '1,240 keywords is more than 500 per task. They will be saved as 3 tasks and only the first one starts now.',
          icon: 'layers',
          confirmLabel: 'Start first task',
          cancelLabel: 'Back to editing'
        }).then(function (ok) {
          if (ok) UI.toast(TOASTS.primary)
        })
      })
    })

    var nudgeInput = document.querySelector('[data-nudge-target]')
    document.querySelector('[data-nudge-demo]').addEventListener('click', function () {
      nudgeInput.setAttribute('aria-invalid', 'true')
      MG.replay(nudgeInput, 'is-shake')
      setTimeout(function () {
        nudgeInput.removeAttribute('aria-invalid')
        nudgeInput.classList.remove('is-shake')
      }, 1600)
    })

    document.querySelectorAll('[data-loading-demo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.classList.add('is-loading')
        btn.setAttribute('aria-busy', 'true')
        setTimeout(function () {
          btn.classList.remove('is-loading')
          btn.removeAttribute('aria-busy')
        }, 1800)
      })
    })

    document.querySelectorAll('[data-save-demo]').forEach(function (sw) {
      var tick = sw.closest('.setting').querySelector('[data-saved]')
      var timer = 0
      sw.addEventListener('ui:change', function () {
        clearTimeout(timer)
        tick.classList.add('is-on')
        timer = setTimeout(function () {
          tick.classList.remove('is-on')
        }, 1600)
      })
    })

    var taskMenu = document.getElementById('ds-task-menu')
    taskMenu.addEventListener('ui:select', function (e) {
      var row = e.detail.trigger && e.detail.trigger.closest('tr')
      var name = row ? row.querySelector('.cell-strong').textContent : 'this task'
      if (e.detail.value === 'delete') {
        confirmDelete(name)
        return
      }
      var what = { 'copy-completed': 'completed', 'copy-pending': 'pending', 'copy-all': 'all' }[e.detail.value]
      UI.toast({ title: 'Copied ' + what + ' keywords', desc: name, tone: 'ok', icon: 'copy' })
    })
    document.getElementById('ds-lang-menu').addEventListener('ui:select', function (e) {
      var trigger = e.detail.trigger
      trigger.innerHTML = UI.icon('globe') + esc(e.detail.item.textContent) + UI.icon('chevron-down')
    })

    /* ====================================================== 页内面板（Shadow DOM） */
    var pi = function (name) {
      return '<svg class="mgp-icon" aria-hidden="true"><use href="' + SPRITE + '#i-' + name + '"/></svg>'
    }
    var MODES = {
      search: { tag: 'Search', icon: 'search', side: 'left', unit: ['place', 'places'], limit: 10, plan: 'Free · 10 places per run', url: 'google.com/maps/search/<b>coffee+near+Manhattan</b>' },
      list: { tag: 'List', icon: 'list', side: 'left', unit: ['place', 'places'], limit: 10, plan: 'Free · 10 places per run', url: 'google.com/maps/<b>@40.74,-73.99,14z/data=…10m1!1e1</b>' },
      place: { tag: 'Place', icon: 'pin', side: 'right', unit: ['place', 'places'], limit: 1, plan: 'Free · 10 places per run', url: 'google.com/maps/place/<b>Ember+%26+Oak+Coffee</b>' },
      reviews: { tag: 'Reviews', icon: 'review', work: true, unit: ['review', 'reviews'], limit: 20, plan: 'Free · 20 reviews per place', url: 'search.google.com/local/<b>reviews?placeid=…</b>' },
      photos: { tag: 'Photos', icon: 'image', work: true, unit: ['photo', 'photos'], limit: 10, plan: 'Free · 10 photos per place', url: 'google.com/maps/<b>uv?pb=…</b>' }
    }
    var MSGS = {
      'not-searched': { icon: 'search', html: 'Search for something first, like <b>coffee in Austin</b>, then press Start.' },
      parse: { tone: 'bad', icon: 'alert-circle', html: 'Couldn’t read the results on this page. <button class="mgp-msg-action" type="button" data-proto-link>Reload page</button>' },
      'no-reviews': { tone: 'neutral', icon: 'review', html: 'This place has no reviews to collect yet.' },
      google: { tone: 'warn', icon: 'hourglass', html: 'Google Maps is limiting requests. Wait a minute, then press Resume.' },
      'unknown-place': { tone: 'neutral', icon: 'help', html: 'Couldn’t identify this place. Open it from the search results and try again.' },
      'still-out': { tone: 'bad', icon: 'lock', html: 'Still at your monthly limit. Records reset on Nov 1.' }
    }
    var unit = function (m, n) {
      return n === 1 ? m.unit[0] : m.unit[1]
    }
    var fmt = MG.formatNumber

    var view = function (s) {
      var m = MODES[s.mode]
      var n = s.state === 'blocked' ? 1000 : s.n
      var limit = s.state === 'blocked' ? 1000 : m.limit
      return {
        m: m,
        n: n,
        limit: limit,
        p: s.state === 'idle' ? 0 : Math.round((n / limit) * 100),
        core: { idle: m.icon === 'search' || m.icon === 'list' ? 'pin' : m.icon, extracting: 'scan', paused: 'pause', complete: 'check', blocked: 'lock' }[s.state],
        stateText: {
          idle: 'Ready',
          extracting: 'Extracting',
          paused: 'Paused · ' + fmt(s.n) + ' ' + unit(m, s.n),
          complete: 'Complete',
          blocked: 'Monthly limit reached'
        }[s.state],
        caption:
          s.state === 'idle'
            ? { search: 'Search on Google Maps, then press Start.', list: 'Opens each place in this list and collects it.', place: 'Collects this place’s details.' }[s.mode] || ''
            : s.state === 'extracting'
              ? { search: 'Scrolling the results list…', list: 'Opening places one by one…', place: 'Reading this place…', reviews: 'Reading review pages…', photos: 'Collecting photo links…' }[s.mode]
              : s.state === 'paused'
                ? 'Resume to continue, or export what you have.'
                : s.state === 'complete'
                  ? s.reason === 'end'
                    ? 'Reached the end of the results.'
                    : 'Reached this run’s limit (' + fmt(m.limit) + ').'
                  : 'Records used this month · resets Nov 1',
        primaryKey: s.state === 'idle' || s.state === 'blocked' ? 'start' : 'export',
        secondaryKey: { extracting: 'pause', paused: 'resume', complete: 'reset' }[s.state] || null
      }
    }

    var rowHTML = function (kind, state) {
      var rev = kind === 'reviews'
      var sub =
        state === 'opened'
          ? pi('check') + 'Collecting in a new tab'
          : state === 'blocked'
            ? 'No records left this month'
            : state === 'unknown'
              ? 'Place not identified'
              : rev
                ? '1,284 reviews'
                : '312 photos'
      // 已打开：「再次打开」收成方形图标按钮，把宽度让给确认文案（长语言也不截断）
      var action =
        state === 'opened'
          ? '<button class="mgp-btn mgp-btn--secondary mgp-btn--sm mgp-btn--icon" type="button" data-row-action aria-label="Reopen ' + (rev ? 'reviews' : 'photos') + ' tab" title="Reopen">' + pi('external-link') + '</button>'
          : '<button class="mgp-btn mgp-btn--secondary mgp-btn--sm" type="button" data-row-action' + (state === 'blocked' || state === 'unknown' ? ' disabled' : '') + '>Start</button>'
      return (
        '<div class="mgp-row" data-state="' + state + '" data-row="' + kind + '">' +
        '<span class="mgp-row-icon' + (rev ? ' mgp-row-icon--star' : '') + '">' + pi(rev ? 'star' : 'image') + '</span>' +
        '<span class="mgp-row-text"><span class="mgp-row-title">' + (rev ? 'Reviews' : 'Photos') + '</span><span class="mgp-row-sub">' + sub + '</span></span>' +
        action +
        '<span class="mgp-row-timer" aria-hidden="true"></span>' +
        '</div>'
      )
    }

    var msgHTML = function (key) {
      var msg = MSGS[key]
      if (!msg) return ''
      return '<p class="mgp-msg"' + (msg.tone ? ' data-tone="' + msg.tone + '"' : '') + ' role="' + (msg.tone === 'bad' ? 'alert' : 'status') + '">' + pi(msg.icon) + '<span>' + msg.html + '</span></p>'
    }

    var panelHTML = function (s) {
      var v = view(s)
      var m = v.m
      var side = s.side || m.side
      var morphItem = function (key, active, content) {
        return '<span data-key="' + key + '"' + (active ? ' class="is-active"' : ' aria-hidden="true"') + '>' + content + '</span>'
      }
      var notice =
        s.notice === 'update'
          ? '<div class="mgp-notice" role="status">' + pi('sparkles') + '<span>Update MapsGrab to keep extracting. <a class="mgp-notice-link" href="#" data-proto-link>How to update</a></span></div>'
          : s.notice === 'announce'
            ? '<div class="mgp-notice mgp-notice--announce" role="status">' + pi('megaphone') + '<span>New: export to XLSX — choose it in Settings.</span></div>'
            : ''
      return (
        '<section class="mgp ' + (m.work ? 'mgp--work' : 'mgp--' + side) + '" role="region" aria-label="MapsGrab">' +
        '<header class="mgp-head">' +
        '<img class="mgp-mark" src="assets/img/logo.svg" alt="" />' +
        '<span class="mgp-title">MapsGrab</span>' +
        '<span class="mgp-mode">' + pi(m.icon) + m.tag + '</span>' +
        (m.work ? '' : '<button class="mgp-icon-btn" type="button" data-dock aria-label="Move panel to the ' + (side === 'left' ? 'right' : 'left') + '">' + pi(side === 'left' ? 'dock-right' : 'dock-left') + '</button>') +
        '</header>' +
        '<div class="mgp-body">' +
        notice +
        '<div class="mgp-status" data-state="' + s.state + '">' +
        '<div class="mgp-ring" role="progressbar" aria-label="Run progress" aria-valuemin="0" aria-valuemax="' + v.limit + '" aria-valuenow="' + v.n + '" style="--p: ' + v.p + '">' +
        '<svg class="mgp-ring-svg" viewBox="0 0 48 48" aria-hidden="true"><circle class="mgp-ring-track" cx="24" cy="24" r="20" pathLength="100" /><circle class="mgp-ring-fill" cx="24" cy="24" r="20" pathLength="100" /></svg>' +
        '<span class="mgp-ring-scan" aria-hidden="true"></span>' +
        '<span class="mgp-ring-core" aria-hidden="true">' + pi(v.core) + '</span>' +
        '</div>' +
        '<div class="mgp-readout">' +
        '<span class="mgp-state" aria-live="polite"><span class="mgp-dot" aria-hidden="true"></span>' + v.stateText + '</span>' +
        '<span class="mgp-count"><span class="mgp-roll">' + fmt(v.n) + '</span><span class="mgp-of">/ ' + fmt(v.limit) + '</span></span>' +
        '<span class="mgp-caption">' + v.caption + '</span>' +
        '</div>' +
        '</div>' +
        msgHTML(s.msg) +
        (s.state === 'blocked'
          ? '<div class="mgp-upgrade"><span class="mgp-upgrade-title">Need more records?</span><span class="mgp-upgrade-text">Pro includes 100,000 records a month and up to 99,999 places per run.</span><a class="mgp-btn mgp-btn--secondary mgp-btn--sm" href="#" data-proto-link>View plans' + pi('arrow-up-right') + '</a></div>'
          : '') +
        '<div class="mgp-actions">' +
        '<button class="mgp-btn mgp-btn--primary" type="button" data-primary' + (v.primaryKey === 'export' && s.n === 0 ? ' disabled' : '') + '>' +
        '<span class="mgp-morph">' +
        morphItem('start', v.primaryKey === 'start', pi('play') + 'Start extracting') +
        morphItem('export', v.primaryKey === 'export', pi('download') + '<span data-export-label>Export ' + fmt(s.n) + ' ' + unit(m, s.n) + '</span><span class="mgp-btn-tag">' + (s.format || 'CSV') + '</span>') +
        '</span>' +
        '</button>' +
        '<button class="mgp-btn mgp-btn--secondary" type="button" data-secondary' + (v.secondaryKey && !(m.work && v.secondaryKey !== 'reset') ? '' : ' hidden') + '>' +
        '<span class="mgp-morph">' +
        morphItem('pause', v.secondaryKey === 'pause', pi('pause') + 'Pause') +
        morphItem('resume', v.secondaryKey === 'resume', pi('resume') + 'Resume') +
        morphItem('reset', v.secondaryKey === 'reset', pi('reset') + 'Reset') +
        '</span>' +
        '</button>' +
        '</div>' +
        (s.mode === 'place'
          ? '<div class="mgp-section"><span class="mgp-section-label">This place</span>' + rowHTML('reviews', (s.rows && s.rows.reviews) || 'ready') + rowHTML('photos', (s.rows && s.rows.photos) || 'ready') + '</div>'
          : '') +
        '</div>' +
        '<footer class="mgp-foot"><span>' + m.plan + '</span><a href="#" data-proto-link>Help</a></footer>' +
        '</section>'
      )
    }

    // 带缩进的标记序列化：子元素都是叶子（文本 / 图标 / 无子元素的 span）时整行输出
    var VOID = { img: 1, input: 1, br: 1, circle: 1, use: 1 }
    var isLeaf = function (el) {
      return Array.prototype.every.call(el.children, function (child) {
        return child.tagName.toLowerCase() === 'svg' || child.children.length === 0
      })
    }
    var serialize = function (node, depth) {
      var pad = new Array(depth + 1).join('  ')
      if (node.nodeType === 3) {
        var text = node.textContent.trim()
        return text ? pad + text : ''
      }
      if (node.nodeType !== 1) return ''
      var tag = node.tagName.toLowerCase()
      if (tag === 'svg' || isLeaf(node)) return pad + node.outerHTML.replace(/<(use|circle)([^>]*)><\/\1>/g, '<$1$2 />')
      var attrs = Array.prototype.map
        .call(node.attributes, function (a) {
          return ' ' + a.name + (a.value === '' ? '' : '="' + a.value + '"')
        })
        .join('')
      if (VOID[tag]) return pad + '<' + tag + attrs + ' />'
      var inner = Array.prototype.map
        .call(node.childNodes, function (child) {
          return serialize(child, depth + 1)
        })
        .filter(Boolean)
        .join('\n')
      return pad + '<' + tag + attrs + '>\n' + inner + '\n' + pad + '</' + tag + '>'
    }
    var prettyPanel = function (html) {
      var tpl = document.createElement('template')
      tpl.innerHTML = html
      return Array.prototype.map
        .call(tpl.content.childNodes, function (n) {
          return serialize(n, 0)
        })
        .join('\n')
    }

    // 状态图集
    var MAP = Proto.mapArt()
    var TILES = [
      { title: 'Search · Ready', note: 'Run limit shown up front (L1)', s: { mode: 'search', state: 'idle', n: 0 } },
      { title: 'List · Extracting', note: 'Ring + rolling count, scan arc while live', s: { mode: 'list', state: 'extracting', n: 6 } },
      { title: 'Search · Paused', note: '“Paused · N places” (L1)', s: { mode: 'search', state: 'paused', n: 7 } },
      { title: 'Search · Complete', note: 'Export stays primary, Reset secondary', s: { mode: 'search', state: 'complete', n: 10 } },
      { title: 'Limit reached', note: 'Upgrade entry always shown (L3)', s: { mode: 'search', state: 'blocked', n: 0 } },
      { title: 'Place · Reviews opened', note: 'New tab, reopen, 4s reset (L4)', s: { mode: 'place', state: 'idle', n: 0, rows: { reviews: 'opened', photos: 'ready' } } },
      { title: 'Error · Not searched', note: 'Reason + next step (L2)', s: { mode: 'search', state: 'idle', n: 0, msg: 'not-searched' } },
      { title: 'Error · Parse failed', note: 'Cleared by the next successful action', s: { mode: 'search', state: 'idle', n: 0, msg: 'parse' } },
      { title: 'Error · Rate limited', note: 'Google error, paused with a way out', s: { mode: 'list', state: 'paused', n: 4, msg: 'google' } },
      { title: 'Place · Not identified', note: 'Place could not be resolved', s: { mode: 'place', state: 'idle', n: 0, msg: 'unknown-place', rows: { reviews: 'unknown', photos: 'unknown' } } },
      { title: 'Reviews page · Complete', note: 'Work page: Export + Reset, no dock toggle', s: { mode: 'reviews', state: 'complete', n: 20 } },
      { title: 'Notice · Update required', note: 'Remote config; hidden if it fails to load', s: { mode: 'search', state: 'idle', n: 0, notice: 'update' } }
    ]
    var tilesEl = document.querySelector('[data-panel-tiles]')
    tilesEl.innerHTML = TILES.map(function (t, i) {
      var m = MODES[t.s.mode]
      return (
        '<figure class="ds-panel-tile" style="margin: 0">' +
        '<figcaption><b>' + t.title + '</b><span class="mono">.mgp' + (m.work ? '--work' : '--' + m.side) + '</span><span class="ds-tile-note">' + t.note + '</span></figcaption>' +
        '<div class="ds-panel-stage" style="--stage-h: ' + (t.s.mode === 'place' || t.s.state === 'blocked' ? 520 : 440) + 'px">' + MAP +
        '<div class="proto-panel-host" data-tile="' + i + '"></div></div>' +
        '</figure>'
      )
    }).join('')
    tilesEl.querySelectorAll('[data-tile]').forEach(function (host) {
      UI.mountPanel(host, { html: panelHTML(TILES[Number(host.dataset.tile)].s) })
    })

    var markupEl = document.querySelector('[data-panel-markup]')
    var markupSrc = prettyPanel(panelHTML({ mode: 'list', state: 'extracting', n: 6 }))
    var markupDetails = codeDetails(markupSrc, 'Panel markup')
    markupDetails.open = true
    markupEl.appendChild(markupDetails)

    // 实时面板：真实状态机 + 计时器模拟数据到达；模式 / 额度 / 错误 / 公告由状态坞驱动
    var live = { mode: 'search', state: 'idle', n: 0, side: null, msg: null, notice: null, quota: 'ok', rows: { reviews: 'ready', photos: 'ready' }, reason: 'limit', format: 'CSV' }
    var liveHost = document.querySelector('[data-live-panel]')
    var livePage = document.querySelector('[data-live-host-page]')
    var liveUrl = document.querySelector('[data-live-url]')
    var liveRoot = null
    var ticker = 0
    var rowTimers = {}
    var ready = false

    var q = function (sel) {
      return liveRoot.querySelector(sel)
    }

    var stopTicker = function () {
      clearInterval(ticker)
      ticker = 0
    }

    var startTicker = function () {
      stopTicker()
      var m = MODES[live.mode]
      ticker = setInterval(function () {
        var step = live.mode === 'reviews' ? 2 : Math.random() < 0.3 ? 2 : 1
        live.n = Math.min(m.limit, live.n + step)
        if (live.n >= m.limit) {
          live.reason = 'limit'
          setState('complete')
        } else {
          refreshCounts()
        }
      }, live.mode === 'reviews' ? 450 : 750)
    }

    var refreshCounts = function () {
      var v = view(live)
      var ring = q('.mgp-ring')
      ring.style.setProperty('--p', v.p)
      ring.setAttribute('aria-valuenow', v.n)
      ring.setAttribute('aria-valuemax', v.limit)
      MG.roll(q('.mgp-roll'), v.n, { cls: 'mgp-roll' })
      q('.mgp-of').textContent = '/ ' + fmt(v.limit)
      q('[data-export-label]').textContent = 'Export ' + fmt(live.n) + ' ' + unit(v.m, live.n)
      q('[data-primary]').disabled = v.primaryKey === 'export' && live.n === 0
    }

    var setState = function (next) {
      var prev = live.state
      live.state = next
      if (next === 'extracting') startTicker()
      else stopTicker()
      var v = view(live)
      q('.mgp-status').dataset.state = next
      if (prev !== next) {
        q('.mgp-ring-core').innerHTML = pi(v.core)
        var stateEl = q('.mgp-state')
        var fresh = stateEl.cloneNode(false)
        fresh.innerHTML = '<span class="mgp-dot" aria-hidden="true"></span>' + v.stateText
        stateEl.replaceWith(fresh)
      }
      q('.mgp-caption').textContent = v.caption
      refreshCounts()
      UI.morph(q('[data-primary] .mgp-morph'), v.primaryKey)
      var secondary = q('[data-secondary]')
      var showSecondary = v.secondaryKey && !(v.m.work && v.secondaryKey !== 'reset')
      secondary.hidden = !showSecondary
      if (showSecondary) UI.morph(secondary.querySelector('.mgp-morph'), v.secondaryKey)
    }

    var setMsg = function (key) {
      live.msg = key
      var old = q('.mgp-msg')
      var html = msgHTML(key)
      if (old && !html) {
        old.classList.add('is-leaving')
        setTimeout(function () {
          old.remove()
        }, MG.reducedMotion() ? 0 : 180)
        return
      }
      if (!html) return
      var tpl = document.createElement('template')
      tpl.innerHTML = html
      if (old) old.replaceWith(tpl.content)
      else q('.mgp-status').after(tpl.content)
    }

    var openRow = function (kind) {
      var row = q('[data-row="' + kind + '"]')
      clearTimeout(rowTimers[kind])
      var tpl = document.createElement('template')
      tpl.innerHTML = rowHTML(kind, 'opened')
      var fresh = tpl.content.firstChild
      row.replaceWith(fresh)
      // 整行替换会丢焦点：键盘用户留在新按钮上
      fresh.querySelector('[data-row-action]').focus({ preventScroll: true })
      live.rows[kind] = 'opened'
      rowTimers[kind] = setTimeout(function () {
        var current = q('[data-row="' + kind + '"]')
        if (!current) return
        var refocus = current.contains(current.getRootNode().activeElement)
        tpl.innerHTML = rowHTML(kind, 'ready')
        var next = tpl.content.firstChild
        current.replaceWith(next)
        if (refocus) next.querySelector('[data-row-action]').focus({ preventScroll: true })
        live.rows[kind] = 'ready'
      }, MG.ms('--dur-toast') || 4000)
    }

    var mountLive = function () {
      stopTicker()
      var m = MODES[live.mode]
      if (!live.side) live.side = m.side
      Proto.gmap(livePage, { mode: live.mode })
      liveUrl.innerHTML = m.url
      var shadow = UI.mountPanel(liveHost, { html: panelHTML(live) })
      liveRoot = shadow.querySelector('.mgp')
      MG.roll(q('.mgp-roll'), view(live).n, { cls: 'mgp-roll', instant: true })
      if (live.state === 'extracting') startTicker()
    }

    var resetLive = function () {
      var m = MODES[live.mode]
      live.n = 0
      live.side = null
      live.rows = { reviews: 'ready', photos: 'ready' }
      live.state = live.quota === 'out' ? 'blocked' : m.work ? 'extracting' : 'idle'
    }

    liveHost.attachShadow({ mode: 'open' }).addEventListener('click', function (e) {
      var t = e.target.closest('button, a')
      if (!t) return
      if (t.hasAttribute('data-proto-link')) {
        e.preventDefault()
        UI.toast({ title: 'Opens in a new tab', desc: 'The real panel links to mapsgrab.com.', tone: 'primary', icon: 'external-link' })
        return
      }
      if (t.hasAttribute('data-dock')) {
        live.side = live.side === 'left' ? 'right' : 'left'
        UI.flip(liveRoot, function () {
          liveRoot.classList.toggle('mgp--left', live.side === 'left')
          liveRoot.classList.toggle('mgp--right', live.side === 'right')
        })
        t.setAttribute('aria-label', 'Move panel to the ' + (live.side === 'left' ? 'right' : 'left'))
        t.innerHTML = pi(live.side === 'left' ? 'dock-right' : 'dock-left')
        return
      }
      if (t.hasAttribute('data-row-action')) {
        openRow(t.closest('[data-row]').dataset.row)
        return
      }
      if (t.hasAttribute('data-primary')) {
        if (live.state === 'blocked') {
          setMsg('still-out')
          return
        }
        if (live.state === 'idle') {
          if (live.msg) setMsg(null)
          live.n = 0
          setState('extracting')
          return
        }
        if (live.msg) setMsg(null)
        UI.toast({
          title: 'Exported ' + fmt(live.n) + ' ' + unit(MODES[live.mode], live.n),
          desc: 'MapsGrab-coffee-near-Manhattan-2026-10-18.' + live.format.toLowerCase(),
          tone: 'ok',
          icon: 'download'
        })
        return
      }
      if (t.hasAttribute('data-secondary')) {
        if (live.state === 'extracting') setState('paused')
        else if (live.state === 'paused') {
          if (live.msg) setMsg(null)
          setState('extracting')
        } else if (live.state === 'complete') {
          live.n = 0
          setState(MODES[live.mode].work ? 'extracting' : 'idle')
        }
      }
    })

    // 状态坞：深链 ?s.panel-mode=place 等可直接打开某状态
    var dockGroup = function (group, label, options, apply) {
      Proto.states({
        group: group,
        label: label,
        options: options,
        onChange: function (value) {
          if (ready) apply(value)
        }
      })
    }
    dockGroup('panel-mode', 'Panel mode', [
      { value: 'search', label: 'Search' },
      { value: 'list', label: 'List' },
      { value: 'place', label: 'Place' },
      { value: 'reviews', label: 'Reviews' },
      { value: 'photos', label: 'Photos' }
    ], function (value) {
      live.mode = value
      live.msg = null
      resetLive()
      mountLive()
    })
    dockGroup('panel-quota', 'Quota', [
      { value: 'ok', label: 'Available' },
      { value: 'out', label: 'Used up' }
    ], function (value) {
      live.quota = value
      live.msg = null
      resetLive()
      mountLive()
    })
    dockGroup('panel-msg', 'Message · L2', [
      { value: 'none', label: 'None' },
      { value: 'not-searched', label: 'Not searched' },
      { value: 'parse', label: 'Parse failed' },
      { value: 'no-reviews', label: 'No reviews' },
      { value: 'google', label: 'Rate limited' },
      { value: 'unknown-place', label: 'Unknown place' }
    ], function (value) {
      setMsg(value === 'none' ? null : value)
    })
    dockGroup('panel-notice', 'Notice', [
      { value: 'none', label: 'None' },
      { value: 'update', label: 'Update' },
      { value: 'announce', label: 'Announcement' }
    ], function (value) {
      live.notice = value === 'none' ? null : value
      mountLive()
    })
    Proto.flow('Run a search', function (p) {
      p.set('panel-quota', 'ok')
      p.set('panel-msg', 'none')
      p.set('panel-notice', 'none')
      p.set('panel-mode', 'search')
      live.msg = null
      resetLive()
      mountLive()
      p.step('Ready')
      return p
        .wait(900)
        .then(function () {
          p.step('Extracting…')
          q('[data-primary]').click()
          return p.wait(4200)
        })
        .then(function () {
          p.step('Paused')
          if (live.state === 'extracting') q('[data-secondary]').click()
          return p.wait(1600)
        })
        .then(function () {
          p.step('Resumed')
          if (live.state === 'paused') q('[data-secondary]').click()
          return p.wait(5200)
        })
        .then(function () {
          p.step('Complete · export')
          if (live.state === 'complete') q('[data-primary]').click()
        })
    })

    live.mode = Proto.get('panel-mode')
    live.quota = Proto.get('panel-quota')
    live.notice = Proto.get('panel-notice') === 'none' ? null : Proto.get('panel-notice')
    resetLive()
    live.msg = Proto.get('panel-msg') === 'none' ? null : Proto.get('panel-msg')
    mountLive()
    ready = true

    /* ---------------------------------------------------------------- 图标 */
    var iconsEl = document.querySelector('[data-icons]')
    var filter = document.querySelector('[data-icon-filter]')
    var countEl = document.querySelector('[data-icon-count]')
    fetch(SPRITE)
      .then(function (res) {
        return res.text()
      })
      .then(function (svg) {
        var names = []
        svg.replace(/<symbol[^>]*\bid="i-([a-z0-9-]+)"/g, function (m, name) {
          names.push(name)
          return m
        })
        iconsEl.innerHTML = names
          .map(function (name) {
            return '<button class="ds-icon" type="button" data-name="' + name + '" aria-label="Copy i-' + name + '">' + UI.icon(name) + '<span>' + name + '</span></button>'
          })
          .join('')
        countEl.textContent = names.length + ' icons'
      })
    iconsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.ds-icon')
      if (btn) copy('<svg class="icon" aria-hidden="true"><use href="' + SPRITE + '#i-' + btn.dataset.name + '" /></svg>', 'Copied i-' + btn.dataset.name)
    })
    filter.addEventListener('input', function () {
      var term = filter.value.trim().toLowerCase()
      var shown = 0
      iconsEl.querySelectorAll('.ds-icon').forEach(function (btn) {
        var on = !term || btn.dataset.name.indexOf(term) >= 0
        btn.hidden = !on
        if (on) shown++
      })
      countEl.textContent = shown + (term ? ' matching' : ' icons')
    })

    /* ------------------------------------------------------------ 目录高亮 */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.ds-nav a[href^="#"]'))
    var sections = navLinks
      .map(function (a) {
        return document.getElementById(a.getAttribute('href').slice(1))
      })
      .filter(Boolean)
    var setCurrent = function (id) {
      navLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id
        a.classList.toggle('is-current', on)
        if (on) a.setAttribute('aria-current', 'true')
        else a.removeAttribute('aria-current')
      })
    }
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -65% 0px' }
    )
    sections.forEach(function (s) {
      spy.observe(s)
    })

    // 页头滚动后出现分隔线
    var top = document.querySelector('.ds-top')
    var onScroll = function () {
      top.classList.toggle('is-scrolled', window.scrollY > 8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    MG.init(document)
    UI.init(document)
  })
})()
