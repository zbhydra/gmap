/*
 * 免费工具模板页：Place ID Finder（可用）+ ?tool=<id> 同模板变体。
 * 解析规则逐行移植 website/src/scripts/tools/lib/placeUrl.ts（hex 段提取 + fid → Place ID 本地确定性换算），
 * 只输出 Place ID / CID / FID 三项，与真实工具一致；另外返回命中位置，供 URL 解剖高亮使用。
 * 解析动画：URL 扫描 → FID 两段点亮 → FID 打出 → CID 数字滚动 → Place ID 字符解码（按推导顺序自下而上）。
 * 文案逐字来自 website/src/i18n/tools.ts。
 */
;(function () {
  var MG = window.MG
  var C = window.MGChrome
  var reduced = MG.reducedMotion()

  /* =====================================================================
     tools.ts 文案（Hero 标题 / 描述、CTA 标题 / 描述）
     ===================================================================== */
  var TOOL_COPY = {
    'place-id-finder': {
      title: 'Place ID Finder',
      description:
        'Paste a full Google Maps place URL and read out its Place ID, CID, and FID in one click. Everything is decoded in your browser — the URL is never uploaded.',
      cta: [
        'Need Place IDs at scale?',
        'MapsGrab extracts the Place ID, CID, and FID for every business it collects — alongside 33 other columns — and exports straight to CSV or JSON.'
      ]
    },
    'review-link-generator': {
      title: 'Google Review Link Generator',
      description:
        'Paste a Google Maps place URL and get the direct "write a review" link for that business — the shortest path from a happy customer to a Google review.',
      cta: [
        'Track every review you earn',
        'MapsGrab pulls the reviews of any business page — rating, text, date, and owner replies — so you can watch feedback land and answer it faster.'
      ]
    },
    'email-checker': {
      title: 'Email Checker',
      description:
        'Type an email address and instantly see whether its format is valid — plus hints for the most common typos. Everything runs in your browser.',
      cta: [
        'Collect emails that are worth verifying',
        "MapsGrab finds the email addresses and social profiles behind every business it extracts — straight from each business's own website."
      ]
    },
    'lat-long-to-dms': {
      title: 'Convert Lat Long to DMS',
      description:
        'Enter decimal latitude and longitude and read the same coordinates in degrees, minutes, seconds — with hemisphere letters, ready to copy.',
      cta: [
        'Coordinates for every business, already extracted',
        'MapsGrab writes latitude and longitude into each row it exports — no manual coordinate lookup for your next routing or territory project.'
      ]
    },
    'dms-to-dd': {
      title: 'Convert DMS to DD (Lat, Long)',
      description:
        'Enter degrees, minutes, and seconds for both axes and get clean decimal degrees — the format Google Maps, spreadsheets, and MapsGrab understand.',
      cta: [
        'Skip manual coordinate work at scale',
        'MapsGrab exports decimal latitude and longitude for every business it collects, next to the address, phone, and Place ID columns.'
      ]
    },
    'bulk-keywords-generator': {
      title: 'Bulk Keywords Generator',
      description:
        'Paste your keywords and your locations, and get every "keyword + location" combination as a ready-to-paste list or CSV — the fastest way to seed a local search campaign.',
      cta: [
        'Turn the keyword list into results',
        'MapsGrab batch tasks run every keyword as a Maps search and export the businesses behind them — CSV or JSON, with reviews, photos, and contact enrichment.'
      ]
    },
    'merge-csv': {
      title: 'Merge CSV Files Online',
      description:
        'Upload two or more CSV files and download a single merged file. Columns are aligned by header — missing fields are left empty. Files never leave your browser.',
      cta: [
        'One export per run — or one dataset',
        'MapsGrab exports clean CSV/JSON per session with field selection and Place ID deduplication, so multi-run datasets start almost merged already.'
      ]
    }
  }

  // tools.ts placeIdFinder.form 错误文案
  var ERRORS = {
    'short-link':
      'Short links (maps.app.goo.gl) are not supported. Open the link in your browser and paste the full URL from the address bar.',
    'invalid-url':
      'This does not look like a Google Maps place URL. Open a place in Google Maps and copy the full URL (it should contain "/maps/place/" and "@" or "data=").',
    'no-ids':
      'No place identifiers were found in this URL. Make sure you copied the URL of a place page, not a search results page.'
  }

  // 示例：San Francisco 与 website e2e 用例同一条 URL；咖啡店为虚构商户
  var EXAMPLES = {
    sf: 'https://www.google.com/maps/place/San+Francisco/@37.774929,-122.419416,17z/data=!3m1!4b1!4m5!3m4!1s0x8085809c23193567:0xa64e70a2e1a9c0e5!8m2!3d37.774929!4d-122.419416',
    coffee:
      'https://www.google.com/maps/place/Ember+%26+Oak+Coffee/@45.504912,-122.635377,17z/data=!3m1!4b1!4m6!3m5!1s0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab!8m2!3d45.504912!4d-122.635377!16s%2Fg%2F11c5x9_qk_',
    short: 'https://maps.app.goo.gl/x8Qw2Lr5Zp7Kd3Vt9'
  }

  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  /* =====================================================================
     解析（移植 placeUrl.ts）
     ===================================================================== */
  var HEX_ID_REGEX = /0x[0-9a-fA-F]+/g
  var HEX_MAX_LENGTH = 20
  var BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  var MAPS_HOST_SUFFIXES = ['google.com', 'google.co', 'maps.google.com']

  var normalizeUrl = function (input) {
    if (/^https?:\/\//i.test(input)) return input
    if (input.startsWith('//')) return 'https:' + input
    return 'https://' + input
  }

  var parseHexLiteral = function (text) {
    var m = /^(?:0[xX])?([0-9a-fA-F]+)$/.exec(text)
    return m ? BigInt('0x' + m[1]) : null
  }

  // lrd（fid 第二段 hex）→ 十进制 cid
  var deriveCidFromLrd = function (lrd) {
    var value = parseHexLiteral(lrd.trim())
    return value === null ? '' : value.toString(10)
  }

  var toUint64LittleEndian = function (value) {
    var bytes = []
    for (var shift = 0; shift < 64; shift += 8) bytes.push(Number((value >> BigInt(shift)) & BigInt(255)))
    return bytes
  }

  // protobuf：0a 12 09 <fid1 小端 8 字节> 11 <fid2 小端 8 字节>
  var placeIdBytes = function (fid) {
    var parts = fid.split(':').map(function (p) {
      return p.trim()
    })
    var a = parseHexLiteral(parts[0] || '')
    var b = parseHexLiteral(parts[1] || '')
    if (a === null || b === null) return null
    return [0x0a, 0x12, 0x09].concat(toUint64LittleEndian(a), [0x11], toUint64LittleEndian(b))
  }

  var base64UrlEncode = function (bytes) {
    var out = ''
    for (var i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i]
      var b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
      var b2 = i + 2 < bytes.length ? bytes[i + 2] : 0
      out += BASE64URL_ALPHABET[b0 >> 2]
      out += BASE64URL_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)]
      if (i + 1 < bytes.length) out += BASE64URL_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)]
      if (i + 2 < bytes.length) out += BASE64URL_ALPHABET[b2 & 0x3f]
    }
    return out
  }

  var derivePlaceIdFromFid = function (fid) {
    var bytes = placeIdBytes(fid)
    return bytes ? base64UrlEncode(bytes) : ''
  }

  var parsePlaceUrl = function (input) {
    var url = normalizeUrl(input.trim())
    var parsed
    try {
      parsed = new URL(url)
    } catch (e) {
      return { ok: false, error: 'invalid-url' }
    }
    var host = parsed.hostname.toLowerCase()
    // 短链需要跨域展开，与纯前端约束冲突，明确不支持
    if (host.endsWith('app.goo.gl')) return { ok: false, error: 'short-link' }
    var isMapsHost =
      host === 'maps.google.com' ||
      (host.endsWith('google.com') &&
        MAPS_HOST_SUFFIXES.some(function (suffix) {
          return host === suffix || host.endsWith('.' + suffix)
        }))
    if (!isMapsHost || !parsed.pathname.toLowerCase().includes('/maps/')) return { ok: false, error: 'invalid-url' }

    // URL 内建 Place ID（!1sChIJ…）时优先采用原值
    var direct = /!1s(ChIJ[A-Za-z0-9_-]+)/.exec(url)
    var hexIds = Array.from(url.matchAll(HEX_ID_REGEX)).filter(function (m) {
      return m[0].length <= HEX_MAX_LENGTH
    })
    var a = hexIds[hexIds.length - 2]
    var b = hexIds[hexIds.length - 1]
    // 命中位置（原型的 URL 解剖高亮用，不影响解析结果）
    var marks = []
    if (direct) marks.push({ start: direct.index + 3, end: direct.index + 3 + direct[1].length, cls: 'is-place' })
    if (!a || !b) {
      if (direct) return { ok: true, url: url, fid: '', cid: '', placeId: direct[1], marks: marks }
      return { ok: false, error: 'no-ids' }
    }
    marks.push({ start: a.index, end: a.index + a[0].length, cls: 'is-a' })
    marks.push({ start: b.index, end: b.index + b[0].length, cls: 'is-b' })
    var fid = a[0] + ':' + b[0]
    return {
      ok: true,
      url: url,
      fid: fid,
      cid: deriveCidFromLrd(b[0]),
      placeId: direct ? direct[1] : derivePlaceIdFromFid(fid),
      marks: marks
    }
  }

  /* =====================================================================
     ?tool=<id> 变体：替换 Hero / CTA 文案，工具面板换同模板占位
     ===================================================================== */
  // 替换已拆词的标题：克隆空壳（保留错峰延迟等内联样式），写入新内容后改走运行时拆词并重新初始化
  var replaceSplit = function (el, html) {
    var fresh = el.cloneNode(false)
    fresh.setAttribute('data-split', '')
    fresh.removeAttribute('data-split-ready')
    fresh.classList.remove('is-revealed')
    fresh.innerHTML = html
    el.replaceWith(fresh)
    MG.init(fresh)
  }

  // 衬线强调：标题尾部括号整体 / 最后一个词；CTA 额外带上 ≤3 字母的前一词（at / you / one）
  var accentTail = function (text, withShortLead) {
    var m = /^(.*?)(\s*\([^)]*\))$/.exec(text)
    if (m) return esc(m[1]) + ' <span class="accent text-grad is-animated">' + esc(m[2].trim()) + '</span>'
    var words = text.split(' ')
    var n = withShortLead && words.length > 2 && words[words.length - 2].length <= 3 ? 2 : 1
    return (
      esc(words.slice(0, -n).join(' ')) +
      ' <span class="accent text-grad is-animated">' +
      esc(words.slice(-n).join(' ')) +
      '</span>'
    )
  }

  var toolId = new URLSearchParams(location.search).get('tool')
  var variant = toolId && toolId !== 'place-id-finder' && TOOL_COPY[toolId] ? toolId : null

  if (variant) {
    var meta = C.tools.find(function (t) {
      return t[2] === variant
    })
    var copy = TOOL_COPY[variant]
    document.title = copy.title + ' — Free tool | MapsGrab'
    replaceSplit(document.querySelector('[data-tool-title]'), accentTail(copy.title, false))
    document.querySelector('[data-tool-desc]').textContent = copy.description
    document.querySelector('[data-tool-crumb]').textContent = meta[0]
    document.querySelector('[data-tool-icon]').innerHTML = C.icon(meta[1])
    document.querySelector('[data-tool-slot-icon]').innerHTML = C.icon(meta[1])
    document.querySelector('[data-pid]').hidden = true
    document.querySelector('[data-tool-slot]').hidden = false
    document.querySelectorAll('[data-pid-only]').forEach(function (el) {
      el.hidden = true
    })
    replaceSplit(document.querySelector('[data-tool-cta-title]'), accentTail(copy.cta[0], true))
    document.querySelector('[data-tool-cta-desc]').textContent = copy.cta[1]
    var grid = document.querySelector('[data-tools-grid]')
    grid.dataset.exclude = variant
    MG.renderTools(grid)
    setTimeout(function () {
      MG.toast('Prototype note', 'Only Place ID Finder is implemented — ' + meta[0] + ' reuses this template.', 'info')
    }, 900)
    return
  }

  /* =====================================================================
     解析动画工具
     ===================================================================== */
  var DIGITS = '0123456789'

  // 字符解码：已定位的字符从左到右落定，其余随机
  var scramble = function (el, text, charset, duration, alive) {
    if (reduced || !text) {
      el.textContent = text || '—'
      return Promise.resolve()
    }
    return new Promise(function (resolve) {
      var start = performance.now()
      var frame = function (now) {
        if (!alive()) return resolve()
        var p = Math.min(1, (now - start) / duration)
        var settled = Math.floor(MG.ease.outCubic(p) * text.length)
        var out = text.slice(0, settled)
        for (var i = settled; i < text.length; i++) {
          out += charset ? charset[(Math.random() * charset.length) | 0] : ''
        }
        el.textContent = out
        if (p < 1) requestAnimationFrame(frame)
        else {
          el.textContent = text
          resolve()
        }
      }
      requestAnimationFrame(frame)
    })
  }

  /* =====================================================================
     推导图：FID → protobuf 字节 → base64url → Place ID；FID 后半 → 十进制 → CID
     ===================================================================== */
  var derive = document.querySelector('[data-derive]')
  var deriveFid = '0x8085809c23193567:0xa64e70a2e1a9c0e5'
  var deriveRun = 0
  var deriveVisible = false
  var deriveWake = null

  var renderDerive = function (fid) {
    var parts = fid.split(':')
    var bytes = placeIdBytes(fid)
    var cells = bytes
      .map(function (byte, k) {
        // 0-2 头部，3-10 前半，11 分隔，12-19 后半
        var cls = k >= 3 && k <= 10 ? ' is-a' : k >= 12 ? ' is-b' : ''
        return '<span class="dv-byte' + cls + '" style="--k:' + k + '">' + ('0' + byte.toString(16)).slice(-2) + '</span>'
      })
      .join('')
    derive.innerHTML =
      '<div class="dv-head"><span class="dv-label">FID from the URL</span><span class="dv-fid">' +
      '<span class="dv-hex dv-hex--a">' + parts[0] + '</span><span class="dv-colon">:</span>' +
      '<span class="dv-hex dv-hex--b">' + parts[1] + '</span></span></div>' +
      '<div class="dv-paths">' +
      '<div class="dv-path dv-path--place">' +
      '<span class="dv-step" data-dv-step="1"><span>protobuf · little-endian</span></span>' +
      '<div class="dv-bytes">' + cells + '</div>' +
      '<span class="dv-step" data-dv-step="2"><span>base64url</span></span>' +
      '<div class="dv-out"><small>Place ID</small><code data-dv-place>—</code></div>' +
      '</div>' +
      '<div class="dv-path dv-path--cid">' +
      '<span class="dv-step" data-dv-step="1"><span>2nd half</span></span>' +
      '<div class="dv-hexbox"><code>' + parts[1] + '</code></div>' +
      '<span class="dv-step" data-dv-step="2"><span>hex → decimal</span></span>' +
      '<div class="dv-out dv-out--cid"><small>CID</small><code data-dv-cid>—</code></div>' +
      '</div></div>'
  }

  var playDerive = async function () {
    var id = ++deriveRun
    var alive = function () {
      return id === deriveRun
    }
    renderDerive(deriveFid)
    var placeEl = derive.querySelector('[data-dv-place]')
    var cidEl = derive.querySelector('[data-dv-cid]')
    var steps = derive.querySelectorAll('[data-dv-step]')
    var placeId = derivePlaceIdFromFid(deriveFid)
    var cid = deriveCidFromLrd(deriveFid.split(':')[1])
    if (reduced) {
      derive.classList.add('is-s1', 'is-s2', 'is-s3')
      steps.forEach(function (s) {
        s.classList.add('is-on')
      })
      placeEl.textContent = placeId
      cidEl.textContent = cid
      return
    }
    for (;;) {
      if (!deriveVisible) {
        await new Promise(function (resolve) {
          deriveWake = resolve
        })
      }
      if (!alive()) return
      derive.classList.remove('is-s1', 'is-s2', 'is-s3')
      steps.forEach(function (s) {
        s.classList.remove('is-on')
      })
      placeEl.textContent = '—'
      cidEl.textContent = '—'
      await MG.wait(500)
      if (!alive()) return
      derive.classList.add('is-s1')
      await MG.wait(700)
      if (!alive()) return
      derive.querySelectorAll('[data-dv-step="1"]').forEach(function (s) {
        s.classList.add('is-on')
      })
      derive.classList.add('is-s2')
      await MG.wait(1100)
      if (!alive()) return
      derive.querySelectorAll('[data-dv-step="2"]').forEach(function (s) {
        s.classList.add('is-on')
      })
      await Promise.all([
        scramble(placeEl, placeId, BASE64URL_ALPHABET, 1100, alive),
        scramble(cidEl, cid, DIGITS, 1100, alive)
      ])
      if (!alive()) return
      derive.classList.add('is-s3')
      await MG.wait(4200)
    }
  }

  MG.inView(
    derive,
    function (v) {
      deriveVisible = v
      if (v && deriveWake) {
        deriveWake()
        deriveWake = null
      }
    },
    { once: false, threshold: 0.3 }
  )
  playDerive()

  /* =====================================================================
     工具面板
     ===================================================================== */
  var form = document.querySelector('[data-pid-form]')
  var input = document.querySelector('[data-pid-input]')
  var bar = document.querySelector('[data-pid-bar]')
  var errorBox = document.querySelector('[data-pid-error]')
  var urlBox = document.querySelector('[data-pid-url]')
  var rows = {}
  ;['place', 'cid', 'fid'].forEach(function (key) {
    var row = document.querySelector('[data-pid-row="' + key + '"]')
    rows[key] = { row: row, out: row.querySelector('[data-pid-out]'), copy: row.querySelector('.pid-copy') }
  })
  var exampleChips = document.querySelectorAll('[data-pid-example]')
  var run = 0
  var demoPending = true

  var setError = function (code) {
    if (!code) {
      errorBox.hidden = true
      errorBox.textContent = ''
      return
    }
    errorBox.innerHTML = C.icon('info') + '<span></span>'
    errorBox.querySelector('span').textContent = ERRORS[code]
    errorBox.hidden = false
    bar.classList.remove('is-shake')
    void bar.offsetWidth
    bar.classList.add('is-shake')
  }

  var resetRows = function () {
    Object.keys(rows).forEach(function (key) {
      var r = rows[key]
      r.row.classList.remove('is-done', 'is-decoding')
      r.out.textContent = '—'
      r.copy.disabled = true
      r.copy.classList.remove('is-copied')
    })
  }

  // 源 URL 渲染：按命中位置包 <mark>
  var renderUrl = function (res) {
    var marks = res.marks.slice().sort(function (x, y) {
      return x.start - y.start
    })
    var html = ''
    var last = 0
    marks.forEach(function (m) {
      html += esc(res.url.slice(last, m.start)) + '<mark class="pid-mark ' + m.cls + '">' + esc(res.url.slice(m.start, m.end)) + '</mark>'
      last = m.end
    })
    urlBox.innerHTML = html + esc(res.url.slice(last))
    // 命中段滚入可见区域（长 URL 时）
    var first = urlBox.querySelector('.pid-mark.is-a') || urlBox.querySelector('.pid-mark')
    if (first) urlBox.scrollTop = Math.max(0, first.offsetTop - urlBox.clientHeight / 2)
  }

  var decodeRow = async function (key, value, charset, duration, alive) {
    var r = rows[key]
    r.row.classList.add('is-decoding')
    await scramble(r.out, value, charset, duration, alive)
    if (!alive()) return
    r.row.classList.remove('is-decoding')
    if (value) {
      r.row.classList.add('is-done')
      r.copy.disabled = false
    } else {
      r.out.textContent = 'Not in this link'
    }
  }

  var decode = async function (raw) {
    var id = ++run
    var alive = function () {
      return id === run
    }
    demoPending = false
    var res = parsePlaceUrl(raw)
    resetRows()
    if (!res.ok) {
      setError(res.error)
      urlBox.innerHTML = '<span class="pid-url-empty">Paste a place URL — the identifiers it carries light up here.</span>'
      return
    }
    setError(null)
    renderUrl(res)
    if (!reduced) {
      urlBox.classList.remove('is-scanning')
      void urlBox.offsetWidth
      urlBox.classList.add('is-scanning')
    }
    var marks = urlBox.querySelectorAll('.pid-mark')
    for (var i = 0; i < marks.length; i++) {
      await MG.wait(reduced ? 0 : 260)
      if (!alive()) return
      marks[i].classList.add('is-lit')
    }
    // 推导顺序：FID → CID → Place ID
    await decodeRow('fid', res.fid, '', reduced ? 0 : 520, alive)
    if (!alive()) return
    await decodeRow('cid', res.cid, DIGITS, reduced ? 0 : 640, alive)
    if (!alive()) return
    await decodeRow('place', res.placeId, BASE64URL_ALPHABET, reduced ? 0 : 820, alive)
    // 推导图同步为本次 FID
    if (res.fid && res.fid !== deriveFid) {
      deriveFid = res.fid
      playDerive()
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    exampleChips.forEach(function (c) {
      c.classList.remove('is-active')
    })
    decode(input.value)
  })

  exampleChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      exampleChips.forEach(function (c) {
        c.classList.toggle('is-active', c === chip)
      })
      input.value = EXAMPLES[chip.dataset.pidExample]
      decode(input.value)
    })
  })

  // 聚焦即全选，粘贴直接覆盖示例
  input.addEventListener('focus', function () {
    demoPending = false
    input.select()
  })

  // 复制按钮的就地反馈（复制本身由 site.js 的 [data-copy] 处理）
  document.querySelectorAll('.pid-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.add('is-copied')
      setTimeout(function () {
        btn.classList.remove('is-copied')
      }, 1400)
    })
  })

  // 首屏演示：面板显现后自动输入 San Francisco 示例并解析；用户先操作则取消
  var demo = async function () {
    var chip = document.querySelector('[data-pid-example="sf"]')
    var url = EXAMPLES.sf
    if (reduced) {
      chip.classList.add('is-active')
      input.value = url
      decode(url)
      return
    }
    await MG.wait(1300)
    if (!demoPending) return
    chip.classList.add('is-active')
    for (var i = 0; i <= url.length; i += 4) {
      if (!demoPending) return
      input.value = url.slice(0, i)
      input.scrollLeft = input.scrollWidth
      await MG.wait(14)
    }
    input.value = url
    input.scrollLeft = 0
    await MG.wait(260)
    if (demoPending) decode(url)
  }
  demo()
})()
