/*
 * Design system 页：
 *   ① 抓取示例原始标记（本文件在 motion.js 之前执行；运行时会拆词、克隆跑马灯轨道，必须先读）
 *   ② DOMContentLoaded 后：色板实测、字号实测、间距 / 圆角 / 投影、图标网格、缓动曲线、动效重放、页面索引
 */
;(function () {
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

  // ① 抓取
  var snippets = []
  document.querySelectorAll('.ds-demo[data-snippet] > .ds-stage').forEach(function (stage) {
    snippets.push({ demo: stage.parentElement, html: dedent(stage.innerHTML) })
  })

  document.addEventListener('DOMContentLoaded', function () {
    var MG = window.MG
    var icon = window.MGChrome.icon
    var rootStyle = getComputedStyle(document.documentElement)
    var tokenValue = function (name) {
      return rootStyle.getPropertyValue(name).trim()
    }

    var copy = function (text, title) {
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {})
      MG.toast(title || 'Copied to clipboard')
    }

    /* ------------------------------------------------------------ 标记折叠 */
    var highlightHtml = function (src) {
      var esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return esc.replace(/(&lt;\/?)([a-zA-Z][\w-]*)|(\s)([a-zA-Z_:][-\w:.]*)(=)("[^"]*")|(\/?&gt;)/g, function (m, open, tag, sp, attr, eq, val, close) {
        if (tag) return '<span class="tok-punc">' + open + '</span><span class="tok-key">' + tag + '</span>'
        if (attr) return sp + '<span class="tok-fn">' + attr + '</span><span class="tok-punc">=</span><span class="tok-str">' + val + '</span>'
        return '<span class="tok-punc">' + close + '</span>'
      })
    }

    snippets.forEach(function (s) {
      var details = document.createElement('details')
      details.className = 'ds-code'
      details.innerHTML =
        '<summary>' + icon('chevron-right') + 'Markup</summary>' +
        '<div class="ds-code-body"><button class="codewin-copy" type="button" aria-label="Copy markup">' + icon('copy') + '</button><pre></pre></div>'
      details.querySelector('pre').innerHTML = highlightHtml(s.html)
      details.querySelector('.codewin-copy').addEventListener('click', function () {
        copy(s.html, 'Markup copied')
      })
      s.demo.appendChild(details)
    })

    /* ---------------------------------------------------------------- 颜色 */
    // rgb()/rgba() → #rrggbb；带透明度时保留 rgba 写法
    var toHex = function (color) {
      var m = color.match(/rgba?\(([^)]+)\)/)
      if (!m) return color
      var parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
      if (parts.length > 3 && parts[3] < 1) {
        return 'rgba(' + parts.slice(0, 3).join(',') + ',' + Math.round(parts[3] * 100) / 100 + ')'
      }
      return (
        '#' +
        parts
          .slice(0, 3)
          .map(function (v) {
            return Math.round(v).toString(16).padStart(2, '0')
          })
          .join('')
      )
    }
    var isLight = function (color) {
      var m = color.match(/rgba?\(([^)]+)\)/)
      if (!m) return false
      var p = m[1].split(/[\s,/]+/).map(Number)
      return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2] > 168
    }

    var PRIMS = [
      ['Blue', ['--blue-300', '--blue-400', '--blue-500', '--blue-600', '--blue-700']],
      ['Cyan', ['--cyan-400', '--cyan-500']],
      ['Green', ['--green-400', '--green-500']],
      ['Coral', ['--coral-400', '--coral-500']],
      ['Amber', ['--amber-400', '--amber-500']],
      ['Violet', ['--violet-400', '--violet-600']]
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
      el.classList.toggle('is-light', isLight(bg))
    })

    var TOKENS = [
      ['Surfaces', [['--bg', 'Page background'], ['--bg-2', 'Alternating bands, footer'], ['--surface', 'Cards, popovers, inputs'], ['--surface-2', 'Hover fills, table heads, input wells'], ['--surface-3', 'Segmented track, skeletons'], ['--border', 'Hairlines and dividers'], ['--border-2', 'Input borders, strong separators']]],
      ['Text', [['--text', 'Headings and body copy'], ['--text-2', 'Secondary copy and leads'], ['--text-3', 'Captions and hints, ≥ 12px'], ['--text-inverse', 'Text on inverted fills']]],
      ['Action', [['--primary', 'The only action color: buttons, active states'], ['--primary-hover', 'Primary hover'], ['--primary-text', 'Links, kickers, icons'], ['--primary-soft', 'Soft fills: chips, badges, selection'], ['--ring', 'Focus ring']]],
      ['Narrative — illustration & data only', [['--pin', 'Map pins and place markers'], ['--accent', 'Collected / enriched in stories'], ['--star', 'Ratings'], ['--ai', 'MCP and AI context'], ['--cyan', 'Gradient mid-stop, water']]],
      ['Status', [['--ok', 'Success'], ['--warn', 'Warning'], ['--bad', 'Error'], ['--ok-soft', 'Success fill'], ['--warn-soft', 'Warning fill'], ['--bad-soft', 'Error fill']]],
      ['Map illustration', [['--map-land', 'Land'], ['--map-block', 'City blocks'], ['--map-water', 'Water'], ['--map-park', 'Parks'], ['--map-road', 'Roads'], ['--map-label', 'Street labels']]],
      ['Code — constant dark', [['--code-bg', 'Code window'], ['--code-text', 'Code text'], ['--syn-key', 'Keys and tags'], ['--syn-str', 'Strings'], ['--syn-num', 'Numbers'], ['--syn-fn', 'Keywords and attributes'], ['--syn-comment', 'Comments']]]
    ]
    var tokensEl = document.querySelector('[data-tokens]')
    tokensEl.innerHTML = TOKENS.map(function (g) {
      return (
        '<div class="ds-tgroup"><span>' + g[0] + '</span><div class="ds-tgrid">' +
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

    /* ------------------------------------------------------------ 字号实测 */
    var rows = Array.prototype.slice.call(document.querySelectorAll('.ds-scale-row'))
    var measure = function () {
      rows.forEach(function (row) {
        var sample = row.querySelector('.ds-scale-sample')
        var el = sample.querySelector('.kicker') || sample
        var cs = getComputedStyle(el)
        var fs = parseFloat(cs.fontSize)
        var lh = cs.lineHeight === 'normal' ? 'normal' : (parseFloat(cs.lineHeight) / fs).toFixed(2)
        row.querySelector('[data-metrics]').textContent = Math.round(fs) + 'px / ' + lh + ' · ' + cs.fontWeight
      })
    }
    measure()
    if (document.fonts) document.fonts.ready.then(measure)
    var measureQueued = false
    window.addEventListener('resize', function () {
      if (measureQueued) return
      measureQueued = true
      requestAnimationFrame(function () {
        measure()
        measureQueued = false
      })
    })

    /* ------------------------------------------------- 间距 / 圆角 / 投影 */
    document.querySelector('[data-space]').innerHTML = ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-8', '--s-10', '--s-12', '--s-16', '--s-20', '--s-24', '--s-32']
      .map(function (name) {
        return '<div class="ds-space-row"><code>' + name + '</code><span>' + tokenValue(name) + '</span><i style="--w: var(' + name + ')"></i></div>'
      })
      .join('')

    document.querySelector('[data-radii]').innerHTML = ['--r-xs', '--r-sm', '--r-md', '--r-lg', '--r-xl', '--r-full']
      .map(function (name) {
        return '<div class="ds-radius"><i style="--r: var(' + name + ')"></i><span>' + name + '<br />' + tokenValue(name) + '</span></div>'
      })
      .join('')

    document.querySelector('[data-shadows]').innerHTML = ['--shadow-xs', '--shadow-sm', '--shadow-md', '--shadow-lg', '--glow-soft', '--glow-primary']
      .map(function (name) {
        return '<div class="ds-shadow"><i style="--sh: var(' + name + ')"></i><span>' + name + '</span></div>'
      })
      .join('')

    /* ---------------------------------------------------------------- 图标 */
    var iconsEl = document.querySelector('[data-icons]')
    var filter = document.querySelector('[data-icon-filter]')
    var countEl = document.querySelector('[data-icon-count]')
    var iconMarkup = function (name) {
      return '<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#i-' + name + '" /></svg>'
    }
    fetch('assets/img/icons.svg')
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
            return '<button class="ds-icon" type="button" data-name="' + name + '" title="Copy i-' + name + '">' + icon(name) + '<span>' + name + '</span></button>'
          })
          .join('')
        countEl.textContent = names.length + ' icons'
      })
    iconsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.ds-icon')
      if (btn) copy(iconMarkup(btn.dataset.name), 'Copied i-' + btn.dataset.name)
    })
    filter.addEventListener('input', function () {
      var q = filter.value.trim().toLowerCase()
      var shown = 0
      iconsEl.querySelectorAll('.ds-icon').forEach(function (btn) {
        var on = !q || btn.dataset.name.indexOf(q) >= 0
        btn.hidden = !on
        if (on) shown++
      })
      countEl.textContent = shown + (q ? ' matching' : ' icons')
    })

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

    /* ---------------------------------------------------------------- 重放 */
    var restartClass = function (el, cls, delay) {
      el.classList.remove(cls)
      void el.offsetWidth
      setTimeout(function () {
        el.classList.add(cls)
      }, delay || 60)
    }
    document.querySelectorAll('[data-replay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.querySelector('[data-replay-target="' + btn.dataset.replay + '"]')
        target.querySelectorAll('[data-reveal], [data-split]').forEach(function (el) {
          restartClass(el, 'is-revealed', 120)
        })
        target.querySelectorAll('[data-count]').forEach(function (el) {
          var fresh = el.cloneNode(true)
          el.replaceWith(fresh)
          MG.init(fresh)
        })
        target.querySelectorAll('.map-pin.is-dropped').forEach(function (pin) {
          restartClass(pin, 'is-dropped', 30)
        })
      })
    })

    /* ---------------------------------------------------------------- 反馈 */
    document.querySelectorAll('[data-ds-toast]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.dataset.dsToast === 'info') MG.toast('Prototype note', 'Payments open the real checkout once this page ships.', 'info')
        else MG.toast('Export ready', 'MapsGrab-Extractor-48-coffee+shop+in+Portland-2026-10-13.csv was saved.')
      })
    })

    /* ------------------------------------------------------------ 页面索引 */
    // [标题, 原型地址, 真实路由, 图标]；登录弹窗对应真实的 /extension-login 页
    var PAGES = [
      ['Home', 'index.html', '/', 'map'],
      ['Browser Extension', 'extension.html', '/extension', 'puzzle'],
      ['Online Scraper', 'online-scraper.html', '/online-scraper', 'cloud'],
      ['Scraper API', 'google-maps-scraper-api.html', '/google-maps-scraper-api', 'database'],
      ['Reviews API', 'google-maps-scraper-api.html?api=reviews', '/google-maps-reviews-scraper-api', 'review'],
      ['Photos API', 'google-maps-scraper-api.html?api=photos', '/google-maps-photos-api', 'image'],
      ['Scraper MCP', 'google-maps-scraper-mcp.html', '/google-maps-scraper-mcp', 'bot'],
      ['Pricing', 'pricing.html', '/pricing', 'tag'],
      ['Free tools (template)', 'place-id-finder.html', '/tools/<id>/ · ?tool=<id>', 'wrench'],
      ['Privacy Policy', 'privacy.html', '/privacy', 'shield'],
      ['Terms of Service', 'privacy.html?doc=terms', '/terms', 'book'],
      ['About', 'about.html', '/about', 'building'],
      ['Contact', 'about.html#contact', '/contact', 'mail'],
      ['Sign-in dialog', '#pages', '/extension-login', 'key', 'signin']
    ]
    var pagesEl = document.querySelector('[data-pages]')
    pagesEl.innerHTML = PAGES.map(function (p) {
      return (
        '<a class="ds-page card card-link card--lift" href="' + p[1] + '"' + (p[4] ? ' data-signin' : '') + ' data-spotlight data-reveal>' +
        '<span class="icon-tile">' + icon(p[3]) + '</span>' +
        '<span><b>' + p[0] + '</b><small>' + p[2].replace(/</g, '&lt;') + '</small></span>' +
        icon('arrow-up-right') +
        '</a>'
      )
    }).join('')
    MG.init(pagesEl)
  })
})()
