/*
 * options.html（Phase B）设置页脚本。状态来自 logic.md §6 / §7 + L9（重试只在此处可写）/ L11（主题）。
 *
 *   即改即存   每次改动 saving → saved → idle：页头胶囊 + 控件旁回执；失败时控件回滚 + 吸顶提示（原因 + 下一步，L2）
 *   分区导航   scroll-spy + 墨块滑动 + 每区一行取值读数
 *   导出       36 列 6 组勾选 + 实时预览（CSV / XLSX 表格、JSON 记录；列 / 键 FLIP 滑入滑出，样例为空的列给出原因）
 *   自动化     下载说明展开、重试读数（尝试 → 跳过）、Drive / HubSpot 五态（A10 未决，默认不可用占位）
 *   外观       主题卡片与 [data-theme-switch] 同一绑定（MG.theme），语言 14 种
 *
 * 状态坞组：save · plan · format · fields · download · integrations；流程「Edit settings」「Connect Google Drive」。
 * 样例数据只用 Proto.places（虚构，电话 555-01xx）与 .example 域名。
 */
;(function () {
  var MG = window.MG
  var UI = window.UI
  var Proto = window.Proto
  var doc = document
  var booting = true

  var $ = function (sel, scope) {
    return (scope || doc).querySelector(sel)
  }
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(sel))
  }
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
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

  /* ============================================================ 数据 */
  // 36 列，顺序 = 导出列序（extension/src/sites/maps/content/export/columns.ts）。
  // h = 导出表头原文（文件与预览里不翻译）；label = 勾选项显示名（i18n options.column.*，en-US 取值）
  var LABEL = { Fulladdress: 'Full address', 'Owner Id': 'Owner ID', 'Social Medias': 'Social Media', Cid: 'CID', Fid: 'FID', 'Place Id': 'Place ID', Kgmid: 'KGMID' }
  var COLS = [
    ['Name'], ['Description'], ['Fulladdress'], ['Street'], ['Municipality'], ['Categories'], ['About', 'pro'], ['Plus Code', 'pro'],
    ['Time Zone'], ['Price', 'pro'], ['Note', 'pro'], ['Amenities'], ['Hotel Class', 'pro'], ['Phone'], ['Phones'], ['Claimed'],
    ['Owner', 'pro'], ['Owner Id', 'pro'], ['Owner Link', 'pro'], ['Email', 'pro'], ['Social Medias', 'pro'], ['Review Count', 'num'],
    ['Average Rating', 'num'], ['Review URL'], ['Google Maps URL'], ['Google Knowledge URL', 'pro'], ['Latitude', 'num'], ['Longitude', 'num'],
    ['Website'], ['Domain'], ['Opening Hours'], ['Featured Image'], ['Cid'], ['Fid'], ['Place Id'], ['Kgmid', 'pro']
  ].map(function (c) {
    return { h: c[0], label: LABEL[c[0]] || c[0], pro: c[1] === 'pro', num: c[1] === 'num' }
  })
  var COL = {}
  COLS.forEach(function (c) {
    COL[c.h] = c
  })
  var TOTAL = COLS.length

  // 展示分组（只切分、不改列序）：基础 6 + 地址 6 + 联系 6 + 经营 6 + 评分评论 3 + 标识关联 9
  var GROUPS = [
    { key: 'basic', label: 'Basic', cols: ['Name', 'Description', 'Categories', 'Time Zone', 'Claimed', 'Note'] },
    { key: 'address', label: 'Address & Geo', cols: ['Fulladdress', 'Street', 'Municipality', 'Latitude', 'Longitude', 'Plus Code'] },
    { key: 'contact', label: 'Contact', cols: ['Phone', 'Phones', 'Website', 'Domain', 'Email', 'Social Medias'] },
    { key: 'business', label: 'Business', cols: ['Price', 'Amenities', 'Hotel Class', 'About', 'Opening Hours', 'Featured Image'] },
    { key: 'reviews', label: 'Reviews', cols: ['Review Count', 'Average Rating', 'Review URL'] },
    { key: 'identifiers', label: 'Identifiers & Links', cols: ['Owner', 'Owner Id', 'Owner Link', 'Google Maps URL', 'Google Knowledge URL', 'Cid', 'Fid', 'Place Id', 'Kgmid'] }
  ]

  // 「Custom」预设：部分组半选、含 Pro 列，用于评审半选与混合态
  var CUSTOM = ['Name', 'Categories', 'Fulladdress', 'Municipality', 'Latitude', 'Longitude', 'Phone', 'Website', 'Email', 'Opening Hours', 'Review Count', 'Average Rating', 'Google Maps URL', 'Place Id']

  // 样例：Proto.places 前 3 家 + 解析层格式的补充字段（全部虚构）
  var ROWS = 3
  var KEYWORD = 'coffee+near+Manhattan'
  var FILE_BASE = 'MapsGrab-Extractor-' + Proto.places.length + '-' + KEYWORD + '-2026-10-18'
  var DL_BASE = 'MapsGrab-Extractor-48-' + KEYWORD + '-2026-10-18'
  var EXTRA = [
    { zip: '10011', desc: 'House-roasted espresso and fresh pastries.', cats: 'Coffee shop, Espresso bar', amen: 'Wi-Fi, Restroom', claimed: 'YES', phones: '(212) 555-0143', lat: '40.7449', lng: '-73.9963', site: 'emberandoak.example', mail: 'hello@emberandoak.example', social: 'Instagram: https://instagram.com/emberandoak', owner: '104857392018465730281', fid: '0x89c259b4f1e8a1d3:0x445c2e1f9a3b7d1a', place: 'ChIJ8f3kqZBZwokR7xq1Lm2pTQA', kg: '/g/11c4kq7v2r', img: 'AF1QipMx3kq7Vb2Lr9', hours: 'Saturday(2026-10-17): [07:00-19:00]' },
    { zip: '10002', desc: 'Single-origin roastery with a tasting bar.', cats: 'Coffee roasters, Coffee shop', amen: 'Wi-Fi, Outdoor seating', claimed: 'YES', phones: '', lat: '40.7178', lng: '-73.9902', site: 'halfmoonroasters.example', mail: 'shop@halfmoonroasters.example', social: 'Instagram: https://instagram.com/halfmoonroasters', owner: '113920485716203948572', fid: '0x89c25987d2c4a6b1:0x9b3e1f04c8d27a65', place: 'ChIJ2Wq0yXRZwokRmT8bQe5vC1M', kg: '/g/11h0f3r9xk', img: 'AF1QipNa8Rt2Wm5Kd1', hours: 'Saturday(2026-10-17): [08:00-18:00]' },
    { zip: '10013', desc: 'Corner café with sandwiches and pour-over.', cats: 'Café, Bakery', amen: 'Restroom', claimed: 'NO', phones: '', lat: '40.7212', lng: '-74.0036', site: 'copperkettle.example', mail: 'hi@copperkettle.example', social: 'Facebook: https://facebook.com/copperkettlecafe', owner: '109283746501928374650', fid: '0x89c2598a1f0b3c27:0x1d6a4e9b7c3f8e02', place: 'ChIJy4N7a1pZwokRk2Hq9fT3s0E', kg: '/g/11b7t5w2qn', img: 'AF1QipPq4Ln7Xs3Hc6', hours: 'Saturday(2026-10-17): [07:30-20:00]' }
  ]
  // Cid = fid 第二段 hex 转十进制（与解析层一致）
  var cidOf = function (fid) {
    return BigInt(fid.split(':')[1]).toString()
  }

  /* ============================================================ 设置状态 */
  var DEFAULTS = { interval: 8, email: false, social: false, format: 'csv', download: false, retry: 1, language: 'en-US' }
  var state = Object.assign({}, DEFAULTS)
  var selected = {}
  COLS.forEach(function (c) {
    selected[c.h] = true
  })
  var plan = 'free'
  var INT = { drive: 'unavailable', hubspot: 'unavailable' }
  var INT_ON = { drive: false, hubspot: false }

  var valueOf = function (h, i) {
    var p = Proto.places[i]
    var x = EXTRA[i]
    switch (h) {
      case 'Name':
      case 'Owner':
        return p.name
      case 'Description':
        return x.desc
      case 'Fulladdress':
        return p.address + ', New York, NY ' + x.zip
      case 'Street':
        return p.address
      case 'Municipality':
        return 'New York'
      case 'Categories':
        return x.cats
      case 'About':
        return 'Service options: [Dine-in, Takeout]'
      case 'Time Zone':
        return 'America/New_York'
      case 'Price':
        return p.price
      case 'Amenities':
        return x.amen
      case 'Phone':
        return p.phone
      case 'Phones':
        return x.phones
      case 'Claimed':
        return x.claimed
      case 'Owner Id':
        return x.owner
      case 'Owner Link':
        return 'https://www.google.com/maps/contrib/' + x.owner
      case 'Email':
        return state.email ? x.mail : ''
      case 'Social Medias':
        return state.social ? x.social : ''
      case 'Review Count':
        return String(p.reviews)
      case 'Average Rating':
        return p.rating.toFixed(1)
      case 'Review URL':
        return 'https://search.google.com/local/reviews?placeid=' + x.place
      case 'Google Maps URL':
        return 'https://www.google.com/maps?cid=' + cidOf(x.fid)
      case 'Google Knowledge URL':
        return 'https://www.google.com/search?kgmid=' + x.kg
      case 'Latitude':
        return x.lat
      case 'Longitude':
        return x.lng
      case 'Website':
        return 'https://' + x.site + '/'
      case 'Domain':
        return x.site
      case 'Opening Hours':
        return x.hours
      case 'Featured Image':
        return 'https://lh5.googleusercontent.com/p/' + x.img
      case 'Cid':
        return cidOf(x.fid)
      case 'Fid':
        return x.fid
      case 'Place Id':
        return x.place
      case 'Kgmid':
        return x.kg
    }
    // Plus Code（数据源后置，恒空）、Note、Hotel Class（咖啡店没有）
    return ''
  }

  // 预览列宽按表头与样例值估算（含补全后的 Email / 社媒，开关切换时列宽不跳）
  var WIDTH = {}
  ;(function () {
    var keep = [state.email, state.social]
    state.email = state.social = true
    COLS.forEach(function (c) {
      var len = c.h.length + (c.pro ? 2 : 0)
      for (var i = 0; i < ROWS; i++) len = Math.max(len, Math.min(valueOf(c.h, i).length, 28))
      WIDTH[c.h] = Math.round(Math.max(64, Math.min(212, 20 + len * 6.9)))
    })
    state.email = keep[0]
    state.social = keep[1]
  })()

  var locked = function (c) {
    return plan === 'gated' && c.pro
  }
  var exportCols = function () {
    return COLS.filter(function (c) {
      return selected[c.h] && !locked(c)
    })
  }

  // 状态坞同步：控件改动反写坞里的组，期间屏蔽该组 onChange 的回放
  var syncing = false
  var reflect = function (group, value) {
    if (Proto.get(group) === null || Proto.get(group) === value) return
    syncing = true
    Proto.set(group, value)
    syncing = false
  }

  var setSwitch = function (el, on) {
    el.setAttribute('aria-checked', String(on))
  }
  var rowEl = function (row) {
    return $('[data-row="' + row + '"]')
  }

  /* ============================================================ 即改即存 */
  var LABELS = {
    interval: 'Scroll interval',
    email: 'Extract email address',
    social: 'Extract social media links',
    format: 'Export format',
    fields: 'Export fields',
    download: 'Auto download on completion',
    retry: 'Stuck retry count',
    drive: 'Auto save to Google Drive',
    hubspot: 'Auto save to HubSpot',
    theme: 'Theme',
    language: 'Language'
  }
  var PILL = { idle: 'All changes saved', saving: 'Saving…', saved: 'Saved', failed: 'Not saved' }
  var saveEl = $('[data-op-save]')
  var saveText = $('[data-op-save-text]')
  var alertEl = $('[data-op-alert]')
  var save = { row: 'interval', fail: null, timer: 0, internal: false }

  var paintPill = function (v) {
    if (saveEl.dataset.state === v) return
    var from = saveEl.getBoundingClientRect().width
    saveEl.dataset.state = v
    saveText.textContent = PILL[v]
    if (still()) return
    var to = saveEl.getBoundingClientRect().width
    if (Math.abs(to - from) > 0.5) {
      saveEl.animate([{ width: from + 'px' }, { width: to + 'px' }], { duration: dur('--dur-3', 280), easing: EMPH })
    }
    saveText.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: dur('--dur-3', 280), easing: OUT })
  }

  var renderSave = function (v) {
    paintPill(v)
    $$('.op-ctl .saved-tick.is-on').forEach(function (t) {
      t.classList.remove('is-on')
    })
    $$('.setting.is-unsaved').forEach(function (r) {
      r.classList.remove('is-unsaved')
    })
    if (v === 'saved') {
      var tick = $('.op-ctl .saved-tick', rowEl(save.row))
      if (tick) MG.replay(tick, 'is-on')
    }
    if (v === 'failed' && save.fail) {
      MG.replay(rowEl(save.fail.row), 'is-unsaved')
      $('[data-op-alert-title]').textContent = 'Couldn’t save “' + LABELS[save.fail.row] + '”'
      $('[data-op-alert-desc]').textContent = 'The browser didn’t accept the change. ' + save.fail.still + ' Try again — if it keeps failing, reload this page.'
    }
    alertEl.hidden = v !== 'failed'
    placeAlert()
  }

  // 失败提示与导出预览托盘都吸顶：提示可见时把托盘的吸顶位置往下让出提示高度
  var placeAlert = function () {
    if (alertEl.hidden) doc.body.style.removeProperty('--op-alert-h')
    else doc.body.style.setProperty('--op-alert-h', alertEl.offsetHeight + 12 + 'px')
  }

  var setSave = function (v) {
    save.internal = true
    if (Proto.get('save') !== v) Proto.set('save', v)
    else renderSave(v)
    save.internal = false
  }

  // fail = { still, revert, retry }：写入被拒时回滚控件、说明当前仍生效的值、提供重试
  var commit = function (row, fail) {
    clearTimeout(save.timer)
    save.row = row
    save.fail = null
    setSave('saving')
    save.timer = setTimeout(function () {
      if (fail) {
        fail.revert()
        save.fail = { row: row, still: fail.still, retry: fail.retry }
        setSave('failed')
        return
      }
      setSave('saved')
      save.timer = setTimeout(function () {
        setSave('idle')
      }, 2400)
    }, MG.reducedMotion() ? 160 : 520)
  }

  var failOf = function (still, revert, retry) {
    return { still: still, revert: revert, retry: retry }
  }

  // 坞里直接选 Failed：用一次具体的写入失败做代表（滚动间隔改到 10s 被拒）
  var representativeFail = function () {
    var from = state.interval
    var to = from === 10 ? 5 : 10
    return {
      row: 'interval',
      still: 'Scroll interval is still ' + from + 's.',
      retry: function () {
        setIntervalSec(to, { commit: true })
      }
    }
  }

  $('[data-op-retry-save]').addEventListener('click', function () {
    if (save.fail) save.fail.retry()
  })
  $('[data-op-reload]').addEventListener('click', function () {
    setSave('idle')
    location.reload()
  })

  /* ============================================================ 分区导航 · scroll-spy */
  var appbar = $('[data-op-appbar]')
  var nav = $('[data-op-nav]')
  var ink = $('[data-op-ink]')
  var links = $$('.op-nav-link', nav)
  var sections = links.map(function (a) {
    return doc.getElementById(a.dataset.sec)
  })
  var barQuery = window.matchMedia('(max-width: 1040px)')
  var active = null
  var lock = null
  var lockTimer = 0

  var stickyTop = function () {
    return appbar.offsetHeight + (barQuery.matches ? nav.offsetHeight : 0)
  }
  var linkOf = function (id) {
    return links.filter(function (a) {
      return a.dataset.sec === id
    })[0]
  }

  var placeInk = function (instant) {
    var link = linkOf(active)
    if (!link) return
    if (instant) ink.classList.add('is-instant')
    ink.style.width = link.offsetWidth + 'px'
    ink.style.height = link.offsetHeight + 'px'
    ink.style.transform = 'translate(' + link.offsetLeft + 'px, ' + link.offsetTop + 'px)'
    if (instant) {
      void ink.offsetWidth
      requestAnimationFrame(function () {
        ink.classList.remove('is-instant')
      })
    }
  }

  var setActive = function (id, instant) {
    if (id === active && !instant) return
    active = id
    links.forEach(function (a) {
      if (a.dataset.sec === id) a.setAttribute('aria-current', 'location')
      else a.removeAttribute('aria-current')
    })
    placeInk(instant || still())
    if (barQuery.matches) {
      var link = linkOf(id)
      nav.scrollTo({ left: Math.max(0, link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2), behavior: still() ? 'auto' : 'smooth' })
    }
  }

  // 判定线在吸顶区下方 30% 处；滚到底时点亮最后一区（外观区较短，到不了判定线）
  var spy = function () {
    if (lock) return
    var top = stickyTop()
    var line = top + (innerHeight - top) * 0.3
    var id = sections[0].id
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= line) id = s.id
    })
    if (innerHeight + scrollY >= doc.documentElement.scrollHeight - 2) id = sections[sections.length - 1].id
    setActive(id)
  }

  // 平滑滚动期间锁住导航，避免墨块途经中间分区
  var goTo = function (id, opts) {
    var o = opts || {}
    var target = o.target || doc.getElementById(id)
    var top = target.getBoundingClientRect().top + scrollY - (o.target ? innerHeight / 3 : stickyTop() + 24)
    lock = id
    setActive(id)
    clearTimeout(lockTimer)
    var release = function () {
      clearTimeout(lockTimer)
      lock = null
      spy()
    }
    window.addEventListener('scrollend', release, { once: true })
    lockTimer = setTimeout(release, 1100)
    window.scrollTo({ top: Math.max(0, top), behavior: still() ? 'auto' : 'smooth' })
    history.replaceState(null, '', location.pathname + location.search + '#' + id)
  }

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault()
      goTo(a.dataset.sec)
      var title = $('.op-section-title', doc.getElementById(a.dataset.sec))
      title.setAttribute('tabindex', '-1')
      title.focus({ preventScroll: true })
    })
  })

  /* ============================================================ 读数（导航每区一行） */
  var THEME_NAME = { system: 'System', light: 'Light', dark: 'Dark' }
  var FORMAT_NAME = { csv: 'CSV', json: 'JSON', xlsx: 'XLSX' }
  var langSel = $('[data-op="language"]')
  var LANG_NAME = {}
  $$('option', langSel).forEach(function (o) {
    LANG_NAME[o.value] = o.textContent
  })
  var sumEls = {}
  $$('[data-sum]').forEach(function (el) {
    sumEls[el.dataset.sum] = el
  })
  var setSum = function (key, text) {
    var el = sumEls[key]
    if (el.textContent === text) return
    el.textContent = text
    if (!still()) MG.replay(el, 'is-bump')
  }
  var sums = function () {
    var extras = []
    if (state.email && plan !== 'gated') extras.push('Email')
    if (state.social && plan !== 'gated') extras.push('Social')
    setSum('extraction', state.interval + 's' + (extras.length ? ' · ' + extras.join(' + ') : ' interval'))
    setSum('export', FORMAT_NAME[state.format] + ' · ' + exportCols().length + ' / ' + TOTAL)
    setSum('automation', (state.download ? 'Download on' : 'Download off') + ' · retry ' + state.retry)
    setSum('appearance', THEME_NAME[MG.theme.mode()] + ' · ' + LANG_NAME[state.language])
  }

  /* ============================================================ 采集 */
  var intervalSeg = $('[data-op="interval"]')
  var emailSw = $('[data-op="email"]')
  var socialSw = $('[data-op="social"]')

  var setIntervalSec = function (v, opts) {
    var o = opts || {}
    var prev = state.interval
    state.interval = v
    if (intervalSeg.setValue) intervalSeg.setValue(String(v))
    sums()
    if (o.commit) {
      commit('interval', o.fail ? failOf('Scroll interval is still ' + prev + 's.', function () {
        setIntervalSec(prev)
      }, function () {
        setIntervalSec(v, { commit: true })
      }) : null)
    }
  }
  intervalSeg.addEventListener('ui:change', function (e) {
    setIntervalSec(Number(e.detail.value), { commit: true })
  })

  var setEnrich = function (key, on, opts) {
    var o = opts || {}
    var prev = state[key]
    state[key] = on
    setSwitch(key === 'email' ? emailSw : socialSw, on && plan !== 'gated')
    renderPreview()
    sums()
    if (o.commit) {
      commit(key, o.fail ? failOf(LABELS[key] + ' is still ' + (prev ? 'on.' : 'off.'), function () {
        setEnrich(key, prev)
      }, function () {
        setEnrich(key, on, { commit: true })
      }) : null)
    }
  }
  emailSw.addEventListener('ui:change', function (e) {
    setEnrich('email', e.detail.value, { commit: true })
  })
  socialSw.addEventListener('ui:change', function (e) {
    setEnrich('social', e.detail.value, { commit: true })
  })

  /* ============================================================ 导出 · 字段 */
  var groupsEl = $('[data-op-groups]')
  var countEl = $('[data-op-count]')
  var countWrap = $('[data-op-count-wrap]')
  var allBtn = $('[data-op-fields-all]')
  var noneBtn = $('[data-op-fields-none]')
  var PRO_BADGE =
    '<span class="op-pro-mini op-pro">' +
    '<svg class="icon op-ico-crown" aria-hidden="true"><use href="assets/img/icons.svg#i-crown"/></svg>' +
    '<svg class="icon op-ico-lock" aria-hidden="true"><use href="assets/img/icons.svg#i-lock"/></svg>' +
    '<span class="sr-only">Pro</span></span>'

  groupsEl.innerHTML = GROUPS.map(function (g) {
    return (
      '<div class="op-group" role="group" aria-labelledby="op-g-' + g.key + '" data-group="' + g.key + '">' +
      '<div class="op-group-head">' +
      '<label class="check-row op-group-toggle"><input class="check" type="checkbox" data-group-toggle="' + g.key + '" aria-label="All ' + esc(g.label) + ' fields" />' +
      '<span class="op-group-name" id="op-g-' + g.key + '">' + esc(g.label) + '</span></label>' +
      '<span class="badge badge--count op-group-count" data-group-count="' + g.key + '"></span>' +
      '</div>' +
      '<div class="op-field-grid">' +
      g.cols
        .map(function (h) {
          var c = COL[h]
          return (
            '<label class="check-row op-field' + (c.pro ? ' is-pro' : '') + '">' +
            '<input class="check" type="checkbox" data-col="' + esc(h) + '" />' +
            '<span class="op-field-name">' + esc(c.label) + '</span>' + (c.pro ? PRO_BADGE : '') +
            '</label>'
          )
        })
        .join('') +
      '</div></div>'
    )
  }).join('')

  var groupOf = function (key) {
    return GROUPS.filter(function (g) {
      return g.key === key
    })[0]
  }
  var openCols = function (g) {
    return g.cols.filter(function (h) {
      return !locked(COL[h])
    })
  }

  var syncFieldControls = function () {
    $$('[data-col]', groupsEl).forEach(function (input) {
      var c = COL[input.dataset.col]
      // 门控时 Pro 列不进文件：显示为未选（选择仍记在 selected 里，升级后原样恢复）
      input.checked = !!selected[c.h] && !locked(c)
      input.disabled = locked(c)
    })
    GROUPS.forEach(function (g) {
      var open = openCols(g)
      var on = open.filter(function (h) {
        return selected[h]
      }).length
      var toggle = $('[data-group-toggle="' + g.key + '"]', groupsEl)
      toggle.checked = open.length > 0 && on === open.length
      toggle.indeterminate = on > 0 && on < open.length
      var count = $('[data-group-count="' + g.key + '"]', groupsEl)
      count.textContent = on + ' / ' + g.cols.length
      count.classList.toggle('is-all', on === g.cols.length)
    })
    var free = COLS.filter(function (c) {
      return !locked(c)
    })
    allBtn.setAttribute('aria-disabled', String(free.every(function (c) {
      return selected[c.h]
    })))
    noneBtn.setAttribute('aria-disabled', String(free.every(function (c) {
      return !selected[c.h]
    })))
  }

  var paintCount = function () {
    var n = exportCols().length
    MG.roll(countEl, n, { instant: still() })
    countWrap.classList.toggle('is-warn', n === 0)
  }

  var fieldsPreset = function () {
    var n = COLS.filter(function (c) {
      return selected[c.h]
    }).length
    return n === TOTAL ? 'all' : n === 0 ? 'none' : 'custom'
  }

  var applyFields = function (changed, opts) {
    var o = opts || {}
    syncFieldControls()
    paintCount()
    renderPreview({ changed: changed })
    sums()
    reflect('fields', fieldsPreset())
    if (o.commit) commit('fields')
  }

  var toggleGroup = function (key, on, opts) {
    var open = openCols(groupOf(key))
    var changed = open.filter(function (h) {
      return !!selected[h] !== on
    })
    open.forEach(function (h) {
      selected[h] = on
    })
    applyFields(changed, opts)
  }

  var setAll = function (on, opts) {
    var changed = []
    COLS.forEach(function (c) {
      if (locked(c) || !!selected[c.h] === on) return
      selected[c.h] = on
      changed.push(c.h)
    })
    applyFields(changed, opts)
  }

  var applyPreset = function (v) {
    var changed = []
    COLS.forEach(function (c) {
      var on = v === 'all' ? true : v === 'none' ? false : CUSTOM.indexOf(c.h) >= 0
      if (!!selected[c.h] !== on) changed.push(c.h)
      selected[c.h] = on
    })
    applyFields(changed)
  }

  groupsEl.addEventListener('change', function (e) {
    var t = e.target
    if (t.dataset.col) {
      selected[t.dataset.col] = t.checked
      applyFields([t.dataset.col], { commit: true })
      return
    }
    if (t.dataset.groupToggle) {
      var g = groupOf(t.dataset.groupToggle)
      var all = openCols(g).every(function (h) {
        return selected[h]
      })
      toggleGroup(g.key, !all, { commit: true })
    }
  })
  allBtn.addEventListener('click', function () {
    if (allBtn.getAttribute('aria-disabled') !== 'true') setAll(true, { commit: true })
  })
  noneBtn.addEventListener('click', function () {
    if (noneBtn.getAttribute('aria-disabled') !== 'true') setAll(false, { commit: true })
  })

  /* ============================================================ 导出 · 格式 */
  var formatSeg = $('[data-op="format"]')
  var setFormat = function (v, opts) {
    var o = opts || {}
    var prev = state.format
    if (prev === v) return
    state.format = v
    if (formatSeg.setValue) formatSeg.setValue(v)
    renderPreview()
    paintDownloadFile()
    sums()
    reflect('format', v)
    if (o.commit) {
      commit('format', o.fail ? failOf('Export format is still ' + FORMAT_NAME[prev] + '.', function () {
        setFormat(prev)
      }, function () {
        setFormat(v, { commit: true })
      }) : null)
    }
  }
  formatSeg.addEventListener('ui:change', function (e) {
    setFormat(e.detail.value, { commit: true })
  })

  /* ============================================================ 导出 · 预览 */
  var pvEl = $('[data-op-preview]')
  var stage = $('[data-op-pv-stage]')
  var pvIcon = $('[data-op-pv-icon]')
  var pvName = $('[data-op-pv-name]')
  var pvMeta = $('[data-op-pv-meta]')
  var pvNotes = $('[data-op-pv-notes]')
  var pvSr = $('[data-op-pv-sr]')
  var exportSec = doc.getElementById('export')
  var pv = { body: null, kind: null }
  var FORMAT_META = { csv: 'UTF-8 · comma-separated', xlsx: 'Sheet1 · cells as text', json: 'Array · numbers kept' }

  var letter = function (n) {
    var s = ''
    n += 1
    while (n > 0) {
      var m = (n - 1) % 26
      s = String.fromCharCode(65 + m) + s
      n = Math.floor((n - 1) / 26)
    }
    return s
  }
  var camel = function (h) {
    var w = h.split(/\s+/)
    return w[0].toLowerCase() + w.slice(1).join('')
  }

  var paintHead = function (cols) {
    var icon = 'file-' + state.format
    if (pvIcon.dataset.icon !== icon) {
      pvIcon.dataset.icon = icon
      pvIcon.innerHTML = UI.icon(icon)
      if (!still()) MG.replay(pvIcon, 'is-swap')
    }
    pvName.innerHTML = '<span class="op-pv-base">' + esc(FILE_BASE) + '</span><span class="op-pv-ext">.' + state.format + '</span>'
    var n = cols.length
    var unit = state.format === 'json' ? (n === 1 ? ' key' : ' keys') : n === 1 ? ' column' : ' columns'
    pvMeta.innerHTML =
      '<span><b>' + n + '</b>' + unit + ' · ' + FORMAT_META[state.format] + '</span>' +
      '<span>Sample · ' + ROWS + ' of ' + Proto.places.length + ' places</span>'
    pvSr.textContent = n
      ? 'Preview of the ' + FORMAT_NAME[state.format] + ' file: ' + n + unit + '.'
      : 'No fields selected. Exports would have no columns.'
  }

  // 注记：样例里为空的列说明原因（可点的跳到对应开关），门控时说明 Pro 列被剔除；尽量一行放下
  var paintNotes = function (cols) {
    var hs = cols.map(function (c) {
      return c.h
    })
    var mail = hs.indexOf('Email') >= 0 && !state.email
    var social = hs.indexOf('Social Medias') >= 0 && !state.social
    var keys = []
    var html = ''
    if (plan === 'gated') {
      keys.push('gated')
      html += '<button class="op-pv-note tone-primary" type="button" data-note="plans">' + UI.icon('lock') + '<span>12 Pro fields are left out · <span class="op-pv-note-go">View plans</span></span></button>'
    }
    if (mail && social) {
      keys.push('both')
      html += '<button class="op-pv-note tone-warn" type="button" data-note="email">' + UI.icon('info') + '<span>Email and Social Media stay empty — <span class="op-pv-note-go">turn on extraction</span></span></button>'
    } else if (mail) {
      keys.push('email')
      html += '<button class="op-pv-note tone-warn" type="button" data-note="email">' + UI.icon('info') + '<span>Email stays empty — <span class="op-pv-note-go">turn on Extract email address</span></span></button>'
    } else if (social) {
      keys.push('social')
      html += '<button class="op-pv-note tone-warn" type="button" data-note="social">' + UI.icon('info') + '<span>Social Media stays empty — <span class="op-pv-note-go">turn on Extract social media links</span></span></button>'
    }
    if (hs.indexOf('Plus Code') >= 0) {
      keys.push('plus')
      html += '<span class="op-pv-note tone-neutral">' + UI.icon('info') + '<span>Plus Code isn’t collected yet</span></span>'
    }
    var key = keys.join('|')
    if (pvNotes.dataset.key === key) return
    pvNotes.dataset.key = key
    pvNotes.innerHTML = html
  }

  var cellHTML = function (h, i) {
    var v = valueOf(h, i)
    return '<span class="op-pv-cell' + (v ? '' : ' is-empty') + '" data-i="' + i + '">' + esc(v) + '</span>'
  }

  var colEl = function (c, xlsx) {
    var el = doc.createElement('div')
    el.className = 'op-pv-col' + (c.num ? ' is-num' : '')
    el.dataset.h = c.h
    el.style.setProperty('--w', WIDTH[c.h] + 'px')
    var html = (xlsx ? '<span class="op-pv-letter"></span>' : '') +
      '<span class="op-pv-cell op-pv-cell--head">' + (c.pro ? UI.icon('crown') : '') + '<span>' + esc(c.h) + '</span></span>'
    for (var i = 0; i < ROWS; i++) html += cellHTML(c.h, i)
    el.innerHTML = html
    return el
  }

  var edge = function (grid) {
    grid.classList.toggle('has-more', grid.scrollLeft + grid.clientWidth < grid.scrollWidth - 2)
  }

  var relabel = function (track) {
    $$('.op-pv-col:not(.is-leaving)', track).forEach(function (el, i) {
      var l = $('.op-pv-letter', el)
      if (l) l.textContent = letter(i)
    })
  }

  var buildTable = function (cols, xlsx) {
    var body = doc.createElement('div')
    body.className = 'op-pv-body op-pv-body--' + (xlsx ? 'xlsx' : 'csv')
    body.innerHTML = '<div class="op-pv-grid"><div class="op-pv-track"></div></div>'
    var grid = $('.op-pv-grid', body)
    var track = $('.op-pv-track', body)
    if (xlsx) {
      var gutter = doc.createElement('div')
      gutter.className = 'op-pv-gutter'
      var g = '<span class="op-pv-letter"></span>'
      for (var r = 1; r <= ROWS + 1; r++) g += '<span class="op-pv-cell">' + r + '</span>'
      gutter.innerHTML = g
      track.appendChild(gutter)
    }
    cols.forEach(function (c) {
      track.appendChild(colEl(c, xlsx))
    })
    relabel(track)
    grid.addEventListener(
      'scroll',
      function () {
        edge(grid)
      },
      { passive: true }
    )
    return body
  }

  var jsonValue = function (c) {
    var v = valueOf(c.h, 0)
    if (c.num && v !== '' && isFinite(Number(v))) return '<span class="op-j-n">' + esc(String(Number(v))) + '</span>'
    return '<span class="op-j-s">' + esc(JSON.stringify(v)) + '</span>'
  }

  var lineEl = function (c) {
    var el = doc.createElement('span')
    el.className = 'op-pv-line'
    el.dataset.h = c.h
    el.dataset.val = valueOf(c.h, 0)
    el.innerHTML =
      '<span class="op-j-p">    </span><span class="op-j-k">"' + esc(camel(c.h)) + '"</span><span class="op-j-p">: </span>' +
      '<span data-v>' + jsonValue(c) + '</span><span class="op-j-p" data-comma>,</span>'
    return el
  }

  var commas = function (lines) {
    var all = $$('.op-pv-line:not(.is-leaving)', lines)
    all.forEach(function (el, i) {
      $('[data-comma]', el).textContent = i < all.length - 1 ? ',' : ''
    })
  }

  var buildJson = function (cols) {
    var body = doc.createElement('div')
    body.className = 'op-pv-body op-pv-body--json'
    body.innerHTML =
      '<pre class="op-pv-code">' +
      '<span class="op-pv-line"><span class="op-j-p">[</span></span>' +
      '<span class="op-pv-line"><span class="op-j-p">  {</span></span>' +
      '<span class="op-pv-lines"></span>' +
      '<span class="op-pv-line"><span class="op-j-p">  },</span></span>' +
      '<span class="op-pv-line op-j-more">  … ' + (Proto.places.length - 1) + ' more records</span>' +
      '<span class="op-pv-line"><span class="op-j-p">]</span></span>' +
      '</pre>'
    var lines = $('.op-pv-lines', body)
    cols.forEach(function (c) {
      lines.appendChild(lineEl(c))
    })
    commas(lines)
    return body
  }

  var buildEmpty = function () {
    var body = doc.createElement('div')
    body.className = 'op-pv-body op-pv-body--empty'
    body.innerHTML =
      '<div class="op-pv-empty">' +
      '<span class="icon-tile icon-tile--soft tone-warn">' + UI.icon('columns') + '</span>' +
      '<p class="op-pv-empty-title">No fields selected</p>' +
      '<p class="op-pv-empty-desc">Exports would have no columns. Select at least one field.</p>' +
      '</div>'
    return body
  }

  // 格式 / 空态切换：新旧两版叠在同一格里交叉淡化（舞台定高，托盘不跳）
  var swapBody = function (body, kind) {
    var prev = pv.body
    var h0 = stage.offsetHeight
    pv.body = body
    pv.kind = kind
    stage.appendChild(body)
    var grid = $('.op-pv-grid', body)
    if (grid) edge(grid)
    if (!prev) return
    if (still()) {
      prev.remove()
      return
    }
    var h1 = body.offsetHeight
    if (h1 !== h0) stage.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: dur('--dur-3', 280) + 60, easing: EMPH })
    prev.style.pointerEvents = 'none'
    prev.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: OUT, fill: 'forwards' }).finished.then(function () {
      prev.remove()
    })
    body.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: dur('--dur-3', 280) + 60, easing: OUT, delay: 80, fill: 'backwards' })
  }

  var flashNew = function (el) {
    el.classList.remove('is-new')
    void el.offsetWidth
    el.classList.add('is-new')
  }

  // 值变化（如打开 Email 补全）：单元格换值并闪一下
  var refreshCells = function (track) {
    $$('.op-pv-col:not(.is-leaving)', track).forEach(function (col) {
      $$('.op-pv-cell[data-i]', col).forEach(function (cell) {
        var v = valueOf(col.dataset.h, Number(cell.dataset.i))
        if (cell.textContent === v) return
        cell.textContent = v
        cell.classList.toggle('is-empty', !v)
        if (!still()) {
          cell.classList.remove('is-changed')
          void cell.offsetWidth
          cell.classList.add('is-changed')
        }
      })
    })
  }

  // 按原始值比较（innerHTML 序列化不转义引号，不能拿来比）
  var refreshJson = function (lines) {
    $$('.op-pv-line:not(.is-leaving)', lines).forEach(function (line) {
      var v = valueOf(line.dataset.h, 0)
      if (line.dataset.val === v) return
      line.dataset.val = v
      $('[data-v]', line).innerHTML = jsonValue(COL[line.dataset.h])
      if (!still()) flashNew(line)
    })
  }

  // 自动滚到最靠前的变化处，让刚滑入 / 滑出的列落在视野里
  // base：条目容器在滚动内容里的偏移（JSON 的键行前面还有 `[` / `{` 两行）
  var revealChange = function (scroller, items, changed, first, axis, base) {
    if (!changed || !changed.length || still()) return
    var best = null
    changed.forEach(function (h) {
      var el = items[h]
      var at = el ? (axis === 'x' ? el.offsetLeft + el.offsetWidth / 2 : el.offsetTop) : first[h]
      if (at != null && (best === null || at < best)) best = at
    })
    if (best === null) return
    best += base || 0
    if (axis === 'x') scroller.scrollTo({ left: Math.max(0, best - scroller.clientWidth / 2), behavior: 'smooth' })
    else scroller.scrollTo({ top: Math.max(0, best - scroller.clientHeight / 3), behavior: 'smooth' })
  }

  // FLIP：记录旧位置 → 重排 DOM → 留下的平移回位、新来的落入并高亮、离开的原地淡出后移除
  var diff = function (container, cols, changed, make, axis) {
    $$('.is-leaving', container).forEach(function (el) {
      el.remove()
    })
    var selector = axis === 'x' ? '.op-pv-col' : '.op-pv-line'
    var existing = {}
    var first = {}
    $$(selector, container).forEach(function (el) {
      existing[el.dataset.h] = el
      first[el.dataset.h] = axis === 'x' ? el.offsetLeft : el.offsetTop
    })
    var want = {}
    var entering = []
    var ordered = cols.map(function (c) {
      want[c.h] = true
      var el = existing[c.h]
      if (!el) {
        el = make(c)
        entering.push(el)
      }
      return el
    })
    var leaving = Object.keys(existing)
      .filter(function (h) {
        return !want[h]
      })
      .map(function (h) {
        return existing[h]
      })
    ordered.forEach(function (el) {
      container.appendChild(el)
    })
    leaving.forEach(function (el) {
      el.classList.add('is-leaving')
      if (axis === 'x') el.style.left = first[el.dataset.h] + 'px'
      else el.style.top = first[el.dataset.h] + 'px'
      container.appendChild(el)
    })
    var placed = {}
    ordered.forEach(function (el) {
      placed[el.dataset.h] = el
    })
    if (still()) {
      leaving.forEach(function (el) {
        el.remove()
      })
      return { placed: placed, first: first }
    }
    var prop = axis === 'x' ? 'translateX' : 'translateY'
    ordered.forEach(function (el) {
      var h = el.dataset.h
      if (first[h] == null) return
      var d = first[h] - (axis === 'x' ? el.offsetLeft : el.offsetTop)
      if (d) el.animate([{ transform: prop + '(' + d + 'px)' }, { transform: 'none' }], { duration: 440, easing: EMPH })
    })
    entering.forEach(function (el, i) {
      var from = axis === 'x' ? 'translateY(-10px)' : 'translateX(-8px)'
      // 等留下的条目大致归位（强调缓动前段走完大部分位移）再落入，减少交叠
      el.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], { duration: 380, easing: OUT, delay: 180 + Math.min(i, 8) * 28, fill: 'backwards' })
      flashNew(el)
    })
    leaving.forEach(function (el) {
      var to = axis === 'x' ? 'translateY(10px)' : 'translateX(8px)'
      el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: to }], { duration: 240, easing: OUT, fill: 'forwards' }).finished.then(function () {
        el.remove()
      })
    })
    return { placed: placed, first: first }
  }

  var renderPreview = function (opts) {
    var o = opts || {}
    var cols = exportCols()
    paintHead(cols)
    paintNotes(cols)
    var kind = cols.length ? state.format : 'empty'
    if (!pv.body || pv.kind !== kind) {
      swapBody(kind === 'empty' ? buildEmpty() : kind === 'json' ? buildJson(cols) : buildTable(cols, kind === 'xlsx'), kind)
      return
    }
    if (kind === 'json') {
      var code = $('.op-pv-code', pv.body)
      var lines = $('.op-pv-lines', pv.body)
      var rj = diff(lines, cols, o.changed, lineEl, 'y')
      commas(lines)
      refreshJson(lines)
      revealChange(code, rj.placed, o.changed, rj.first, 'y', lines.offsetTop - code.offsetTop + code.scrollTop)
      return
    }
    var xlsx = kind === 'xlsx'
    var grid = $('.op-pv-grid', pv.body)
    var track = $('.op-pv-track', pv.body)
    var rt = diff(track, cols, o.changed, function (c) {
      return colEl(c, xlsx)
    }, 'x')
    relabel(track)
    refreshCells(track)
    edge(grid)
    revealChange(grid, rt.placed, o.changed, rt.first, 'x')
  }

  // 托盘吸顶时加深投影（自然位置或随分区离开时恢复）
  var stuck = function () {
    var top = parseFloat(getComputedStyle(pvEl).top) || 0
    pvEl.classList.toggle('is-stuck', Math.abs(pvEl.getBoundingClientRect().top - top) < 1 && scrollY > 0)
  }

  pvNotes.addEventListener('click', function (e) {
    var b = e.target.closest('[data-note]')
    if (!b) return
    if (b.dataset.note === 'plans') openPlans()
    else focusSetting(b.dataset.note)
  })

  // 预览注记里的「去打开」：滚到对应设置行、聚焦开关并高亮一次
  var focusSetting = function (row) {
    var r = rowEl(row)
    goTo(r.closest('.op-section').id, { target: r })
    setTimeout(function () {
      var ctl = $('.op-ctl > :last-child', r)
      if (ctl) ctl.focus({ preventScroll: true })
      MG.replay(r, 'is-pulse')
    }, MG.reducedMotion() ? 0 : 600)
  }

  /* ============================================================ 自动化 */
  var dlSw = $('[data-op="download"]')
  var dlDetail = $('[data-op-download-detail]')
  var dlFile = $('[data-op-download-file]')
  var paintDownloadFile = function () {
    dlFile.innerHTML = '<span class="op-path-base">' + esc(DL_BASE) + '</span><span class="op-path-ext">.' + state.format + '</span>'
  }
  var setDownload = function (on, opts) {
    var o = opts || {}
    var prev = state.download
    state.download = on
    setSwitch(dlSw, on)
    dlDetail.classList.toggle('is-open', on)
    dlDetail.inert = !on
    sums()
    reflect('download', on ? 'on' : 'off')
    if (o.commit) {
      commit('download', o.fail ? failOf('Auto download is still ' + (prev ? 'on.' : 'off.'), function () {
        setDownload(prev)
      }, function () {
        setDownload(on, { commit: true })
      }) : null)
    }
  }
  dlSw.addEventListener('ui:change', function (e) {
    setDownload(e.detail.value, { commit: true })
  })

  // 重试读数：第 1 次尝试 + N 次重试 → 跳过（一项卡住 = 90 秒无进展或标签被关）
  var retryStepper = $('[data-op="retry"]')
  var retryInput = $('input', retryStepper)
  var pipsEl = $('[data-op-pips]')
  var attemptsText = $('[data-op-attempts-text]')

  var paintPips = function () {
    var n = state.retry + 1
    if (!pipsEl.firstChild) {
      pipsEl.innerHTML = '<li class="op-pip-arrow">' + UI.icon('arrow-right') + '</li><li class="op-pip op-pip--skip">Skipped</li>'
    }
    var arrow = $('.op-pip-arrow', pipsEl)
    var pips = $$('.op-pip--n:not(.is-gone)', pipsEl)
    while (pips.length < n) {
      var li = doc.createElement('li')
      li.className = 'op-pip op-pip--n' + (pips.length === 0 ? ' op-pip--try' : '')
      li.textContent = String(pips.length + 1)
      pipsEl.insertBefore(li, arrow)
      if (!still()) li.classList.add('is-new')
      pips.push(li)
    }
    while (pips.length > n) {
      var gone = pips.pop()
      if (still()) {
        gone.remove()
        continue
      }
      gone.classList.add('is-gone')
      gone.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.6)' }], { duration: 180, easing: OUT, fill: 'forwards' }).finished.then(
        (function (el) {
          return function () {
            el.remove()
          }
        })(gone)
      )
    }
    attemptsText.textContent = n === 1 ? 'One attempt per item, then it’s skipped.' : 'Up to ' + n + ' attempts per item, then it’s skipped.'
  }

  var setRetry = function (v, opts) {
    var o = opts || {}
    var prev = state.retry
    v = Math.max(0, Math.min(9, v))
    state.retry = v
    retryInput.value = v
    $$('[data-step]', retryStepper).forEach(function (b) {
      b.disabled = Number(b.dataset.step) < 0 ? v <= 0 : v >= 9
    })
    paintPips()
    sums()
    if (o.commit) {
      commit('retry', o.fail ? failOf('Stuck retry count is still ' + prev + '.', function () {
        setRetry(prev)
      }, function () {
        setRetry(v, { commit: true })
      }) : null)
    }
  }
  retryStepper.addEventListener('ui:change', function (e) {
    setRetry(e.detail.value, { commit: true })
  })

  // 集成（A10 未决）：unavailable / not-connected / connecting / connected / failed；坞里一次设两行，行内交互只改本行
  var connectTimers = {}
  var intRow = function (key) {
    return $('[data-int="' + key + '"]')
  }
  var paintInt = function (key) {
    var row = intRow(key)
    var st = INT[key]
    var sw = $('[data-int-switch]', row)
    row.classList.toggle('is-disabled', st === 'unavailable')
    $$('[data-int-state]', row).forEach(function (el) {
      el.classList.toggle('is-on', el.dataset.intState === st)
    })
    sw.disabled = st === 'unavailable'
    sw.setAttribute('aria-busy', String(st === 'connecting'))
    if (st === 'connecting') sw.setAttribute('aria-disabled', 'true')
    else sw.removeAttribute('aria-disabled')
    setSwitch(sw, st === 'connecting' || (st === 'connected' && INT_ON[key]))
  }
  var startConnect = function (key) {
    clearTimeout(connectTimers[key])
    INT[key] = 'connecting'
    paintInt(key)
    connectTimers[key] = setTimeout(function () {
      INT[key] = 'connected'
      INT_ON[key] = true
      paintInt(key)
      commit(key)
    }, MG.reducedMotion() ? 300 : 1800)
  }
  var setIntegrations = function (v) {
    ;['drive', 'hubspot'].forEach(function (key) {
      clearTimeout(connectTimers[key])
      INT[key] = v
      INT_ON[key] = v === 'connected'
      paintInt(key)
    })
  }
  ;['drive', 'hubspot'].forEach(function (key) {
    var row = intRow(key)
    var sw = $('[data-int-switch]', row)
    sw.addEventListener('ui:change', function (e) {
      var st = INT[key]
      if (st === 'connecting') {
        setSwitch(sw, true)
        return
      }
      if (st === 'connected') {
        INT_ON[key] = e.detail.value
        paintInt(key)
        commit(key)
        return
      }
      // 未连接 / 授权失败：打开开关即发起授权，成功后才落开关
      if (e.detail.value) startConnect(key)
    })
    $('[data-int-disconnect]', row).addEventListener('click', function () {
      INT[key] = 'not-connected'
      INT_ON[key] = false
      paintInt(key)
      commit(key)
    })
  })

  /* ============================================================ 外观 */
  var themesEl = $('[data-op-themes]')
  var nowEl = $('[data-op-theme-now]')
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
  var paintNow = function () {
    var key = darkQuery.matches ? 'dark' : 'light'
    if (!still()) {
      UI.morph(nowEl, key)
      return
    }
    Array.prototype.forEach.call(nowEl.children, function (el) {
      var on = el.dataset.key === key
      el.classList.toggle('is-active', on)
      if (on) el.removeAttribute('aria-hidden')
      else el.setAttribute('aria-hidden', 'true')
    })
  }
  darkQuery.addEventListener('change', paintNow)
  themesEl.addEventListener('ui:change', function () {
    commit('theme')
  })
  doc.addEventListener('mg:theme', function () {
    sums()
  })

  langSel.addEventListener('change', function () {
    state.language = langSel.value
    sums()
    commit('language')
  })

  /* ============================================================ 套餐（plan） */
  var applyPlan = function (v) {
    plan = v
    ;[['email', emailSw], ['social', socialSw]].forEach(function (pair) {
      pair[1].disabled = v === 'gated'
      setSwitch(pair[1], state[pair[0]] && v !== 'gated')
      rowEl(pair[0]).classList.toggle('is-disabled', v === 'gated')
    })
    syncFieldControls()
    paintCount()
    renderPreview({
      changed: COLS.filter(function (c) {
        return c.pro
      }).map(function (c) {
        return c.h
      })
    })
    sums()
  }

  var openPlans = function () {
    UI.toast({ title: 'Opens Pricing on the MapsGrab website', desc: 'Prototype only — no page opens here.', tone: 'primary', icon: 'external' })
  }
  $$('[data-op-plans]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault()
      openPlans()
    })
  })
  $('[data-op-privacy]').addEventListener('click', function (e) {
    e.preventDefault()
    UI.toast({ title: 'Opens the Privacy Policy in a new tab', desc: 'Prototype only — no page opens here.', tone: 'primary', icon: 'shield' })
  })

  /* ============================================================ 装配（无动画） */
  syncFieldControls()
  paintCount()
  renderPreview()
  paintDownloadFile()
  dlDetail.inert = true
  setRetry(state.retry)
  setIntegrations('unavailable')
  paintNow()

  var restoreDefaults = function () {
    clearTimeout(save.timer)
    setIntervalSec(DEFAULTS.interval)
    setEnrich('email', false)
    setEnrich('social', false)
    setAll(true)
    setFormat(DEFAULTS.format)
    setDownload(false)
    setRetry(DEFAULTS.retry)
    langSel.value = DEFAULTS.language
    state.language = DEFAULTS.language
    sums()
    setSave('idle')
  }

  /* ============================================================ 状态坞 */
  Proto.states({
    group: 'save',
    label: 'Save',
    value: 'idle',
    options: [
      { value: 'idle', label: 'Idle' },
      { value: 'saving', label: 'Saving' },
      { value: 'saved', label: 'Saved' },
      { value: 'failed', label: 'Failed' }
    ],
    onChange: function (v) {
      if (!save.internal) {
        clearTimeout(save.timer)
        save.fail = v === 'failed' ? save.fail || representativeFail() : null
      }
      renderSave(v)
    }
  })
  Proto.states({
    group: 'plan',
    label: 'Plan · Pro fields',
    value: 'free',
    options: [
      { value: 'free', label: 'Free · now' },
      { value: 'gated', label: 'Free · gated' },
      { value: 'pro', label: 'Pro' }
    ],
    onChange: function (v) {
      applyPlan(v)
    }
  })
  Proto.states({
    group: 'format',
    label: 'Export format',
    value: 'csv',
    options: [
      { value: 'csv', label: 'CSV' },
      { value: 'json', label: 'JSON' },
      { value: 'xlsx', label: 'XLSX' }
    ],
    onChange: function (v) {
      if (!syncing) setFormat(v)
    }
  })
  Proto.states({
    group: 'fields',
    label: 'Export fields',
    value: 'all',
    options: [
      { value: 'all', label: 'All 36' },
      { value: 'custom', label: 'Custom' },
      { value: 'none', label: 'None' }
    ],
    onChange: function (v) {
      if (!syncing) applyPreset(v)
    }
  })
  Proto.states({
    group: 'download',
    label: 'Auto-download',
    value: 'off',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' }
    ],
    onChange: function (v) {
      if (!syncing) setDownload(v === 'on')
    }
  })
  Proto.states({
    group: 'integrations',
    label: 'Integrations · A10',
    value: 'unavailable',
    options: [
      { value: 'unavailable', label: 'Unavailable' },
      { value: 'not-connected', label: 'Not connected' },
      { value: 'connecting', label: 'Connecting' },
      { value: 'connected', label: 'Connected' },
      { value: 'failed', label: 'Auth failed' }
    ],
    onChange: function (v) {
      setIntegrations(v)
    }
  })

  Proto.flow('Edit settings', function (p) {
    p.step('Export as JSON')
    goTo('export')
    return p
      .wait(900)
      .then(function () {
        setFormat('json', { commit: true })
        return p.wait(1800)
      })
      .then(function () {
        p.step('Drop the Contact fields')
        toggleGroup('contact', false, { commit: true })
        return p.wait(2200)
      })
      .then(function () {
        p.step('Turn on auto-download')
        goTo('automation')
        return p.wait(900)
      })
      .then(function () {
        setDownload(true, { commit: true })
        return p.wait(1800)
      })
      .then(function () {
        p.step('Storage rejects a change')
        setRetry(3, { commit: true, fail: true })
        return p.wait(2800)
      })
      .then(function () {
        p.step('Try again')
        if (save.fail) save.fail.retry()
        return p.wait(2200)
      })
      .then(function () {
        p.step('Back to defaults')
        restoreDefaults()
        goTo('extraction')
      })
  })

  Proto.flow('Connect Google Drive', function (p) {
    Proto.set('integrations', 'not-connected')
    goTo('automation', { target: intRow('drive') })
    p.step('Not connected yet')
    return p
      .wait(1400)
      .then(function () {
        p.step('Signing in with Google…')
        startConnect('drive')
        return p.wait(2600)
      })
      .then(function () {
        p.step('Connected · auto save on')
      })
  })

  /* ============================================================ 滚动 · 尺寸 */
  var ticking = false
  window.addEventListener(
    'scroll',
    function () {
      if (ticking) return
      ticking = true
      requestAnimationFrame(function () {
        ticking = false
        appbar.classList.toggle('is-scrolled', scrollY > 8)
        spy()
        stuck()
      })
    },
    { passive: true }
  )
  var relayout = function () {
    placeAlert()
    placeInk(true)
    spy()
    stuck()
    var grid = pv.body && $('.op-pv-grid', pv.body)
    if (grid) edge(grid)
  }
  window.addEventListener('resize', relayout)
  barQuery.addEventListener('change', relayout)
  if (doc.fonts) doc.fonts.ready.then(relayout)

  appbar.classList.toggle('is-scrolled', scrollY > 8)
  sums()
  spy()
  stuck()
  requestAnimationFrame(function () {
    booting = false
  })
})()
