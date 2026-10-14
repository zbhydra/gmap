/*
 * MCP 落地页：
 *   - Hero Agent 会话：四个场景循环（输入框打字 → 发送 → 思考 → 工具调用卡运行 / 完成、结果逐行流入 → 回答逐词浮现），
 *     客户端名在 Claude Code / Cursor / VS Code / Codex 间轮换；离屏或标签页隐藏时暂停，减弱动效直接给场景一终态
 *   - 连接拓扑：按节点布局位置计算 SVG 连线，请求 / 响应光点沿线往返；≤960 改纵向堆叠（无连线，只轮换高亮）
 *   - 接入配置：代码按行包裹，切换客户端时由 CSS 逐行重放
 * 工具名与端点为示意，以 014 B3 合同为准；参数沿用 API 口径（q / pages / hl / ll；fid / sort_by / cursor；fid / page）。
 * 示例商家均为虚构，电话用 555-01xx。
 */
;(function () {
  var MG = window.MG
  var icon = window.MGChrome.icon
  var reduced = MG.reducedMotion()

  var $ = function (sel, scope) {
    return (scope || document).querySelector(sel)
  }
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel))
  }
  var esc = function (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  // 可见性闸门：元素离屏或标签页隐藏时 await gate() 挂起，回到可见再继续
  var visibilityGate = function (el, threshold) {
    var visible = false
    var waiters = []
    var flush = function () {
      if (!visible || document.hidden) return
      waiters.splice(0).forEach(function (resolve) {
        resolve()
      })
    }
    MG.inView(el, function (v) {
      visible = v
      flush()
    }, { once: false, threshold: threshold })
    document.addEventListener('visibilitychange', flush)
    return function () {
      return visible && !document.hidden
        ? Promise.resolve()
        : new Promise(function (resolve) {
            waiters.push(resolve)
          })
    }
  }

  /* =====================================================================
     ① Agent 会话
     ===================================================================== */
  var CLIENTS = [
    ['terminal', 'Claude Code'],
    ['cursor', 'Cursor'],
    ['code', 'VS Code'],
    ['sparkles', 'Codex']
  ]

  // 场景：prompt → calls（工具、参数、完成态、结果预览行）→ answer（可含 <b>）+ 可选列表行 [名称, 评分, 电话] 或缩略图色相
  var SCENES = [
    {
      prompt: 'Find dentists in Austin, TX rated 4.8 or higher and list their phone numbers.',
      calls: [
        {
          tool: 'search_businesses',
          args: '{"q": "dentist in Austin, TX"}',
          state: '20 places',
          out: [
            '{"name": "Bluebonnet Family Dental", "average_rating": 4.9, "phone": "+1 512-555-0134", …}',
            '{"name": "Barton Hills Smile Studio", "average_rating": 4.8, "phone": "+1 512-555-0161", …}',
            '{"name": "Live Oak Dentistry", "average_rating": 4.8, "phone": "+1 512-555-0187", …}'
          ],
          more: '+ 17 more places'
        }
      ],
      answer: 'Three of the first 20 results are rated <b>4.8 or higher</b>:',
      rows: [
        ['Bluebonnet Family Dental', '4.9', '+1 512-555-0134'],
        ['Barton Hills Smile Studio', '4.8', '+1 512-555-0161'],
        ['Live Oak Dentistry', '4.8', '+1 512-555-0187']
      ]
    },
    {
      prompt: 'What are people saying in the newest reviews of Ember & Oak Coffee in Portland?',
      calls: [
        {
          tool: 'search_businesses',
          args: '{"q": "Ember & Oak Coffee, Portland, OR"}',
          state: '1 place',
          out: ['{"name": "Ember & Oak Coffee", "fid": "0x5495…e0ab", "average_rating": 4.7, …}']
        },
        {
          tool: 'get_reviews',
          args: '{"fid": "0x5495…e0ab", "sort_by": 2}',
          state: '60 reviews',
          out: [
            '{"rating": 5, "text": "Best cortado on Division. Friendly crew.", …}',
            '{"rating": 4, "text": "Great beans. Cozy but small — come early on weekends.", …}',
            '{"rating": 5, "text": "Oat flat white is excellent and the staff remembers names.", …}'
          ],
          more: '"next_cursor": "…"'
        }
      ],
      answer:
        'Mostly <b>5-star</b> — people praise the espresso and the friendly staff. The one recurring note: <b>seating is tight on weekends</b>.'
    },
    {
      prompt: "Which plumbers in Chicago don't list a website? Put them in a table.",
      calls: [
        {
          tool: 'search_businesses',
          args: '{"q": "plumber in Chicago, IL"}',
          state: '20 places',
          out: [
            '{"name": "Windy City Pipe Works", "website": null, "phone": "+1 312-555-0112", …}',
            '{"name": "Lakeview Drain & Sewer", "website": null, "phone": "+1 312-555-0148", …}',
            '{"name": "North Branch Plumbing", "website": null, "phone": "+1 312-555-0175", …}'
          ],
          more: '+ 17 more places'
        }
      ],
      answer: '<b>4 of 20</b> have no website listed. The first three:',
      rows: [
        ['Windy City Pipe Works', '4.6', '+1 312-555-0112'],
        ['Lakeview Drain & Sewer', '4.4', '+1 312-555-0148'],
        ['North Branch Plumbing', '4.8', '+1 312-555-0175']
      ]
    },
    {
      prompt: 'Grab the public photos of Rose City Roasters in Portland for our listing audit.',
      calls: [
        {
          tool: 'search_businesses',
          args: '{"q": "Rose City Roasters, Portland, OR"}',
          state: '1 place',
          out: ['{"name": "Rose City Roasters", "fid": "0x5495…8f7a", "average_rating": 4.6, …}']
        },
        {
          tool: 'get_photos',
          args: '{"fid": "0x5495…8f7a"}',
          state: '24 photos',
          out: [
            '{"url": "https://lh3.googleusercontent.com/p/AF1QipN…=w1600"}',
            '{"url": "https://lh3.googleusercontent.com/p/AF1QipO…=w1600"}',
            '{"url": "https://lh3.googleusercontent.com/p/AF1QipP…=w1600"}'
          ],
          more: '+ 21 more photos'
        }
      ],
      answer: '<b>24 public photos</b>, Street View already filtered out. A first look:',
      thumbs: [28, 200, 150, 36]
    }
  ]

  // 回答逐词：保留内联标签，其余按空白切成 .w
  var words = function (html) {
    var i = 0
    return html.replace(/(<[^>]+>)|([^\s<]+)/g, function (m, tag) {
      return tag ? tag : '<span class="w" style="--i:' + i++ + '">' + m + '</span>'
    })
  }

  var userMsg = function (text) {
    return '<div class="mcp-msg mcp-msg--user mcp-in">' + esc(text) + '</div>'
  }

  var thinkMsg = function () {
    return '<p class="mcp-think mcp-in">' + icon('sparkles') + '<span>Thinking…</span></p>'
  }

  var outLine = function (line) {
    return '<p class="mcp-in-line"><span class="mcp-arrow">←</span> ' + MG.highlight(line) + '</p>'
  }

  var moreLine = function (c) {
    return c.more ? '<p class="mcp-call-more mcp-in-line">' + esc(c.more) + '</p>' : ''
  }

  // done = 直接渲染完成态（减弱动效用）；collapsed = 多步场景里已完成的上一张卡
  var callCard = function (c, done, collapsed) {
    return (
      '<div class="mcp-call mcp-in' + (done ? ' is-done' : '') + (collapsed ? ' is-collapsed' : '') + '">' +
      '<div class="mcp-call-head">' +
      '<span class="mcp-call-ic">' + icon('plug') + '</span>' +
      '<span class="mcp-call-name"><span>mapsgrab ·</span> ' + c.tool + '</span>' +
      '<span class="mcp-call-state">' + (done ? c.state : 'running') + '</span>' +
      '</div>' +
      '<div class="mcp-call-fold"><div class="mcp-call-io"><div class="mcp-call-code">' +
      '<p><span class="mcp-arrow">→</span> ' + MG.highlight(c.args) + '</p>' +
      '<div class="mcp-call-out">' + (done ? c.out.map(outLine).join('') + moreLine(c) : '') + '</div>' +
      '</div></div></div>' +
      '</div>'
    )
  }

  var answerMsg = function (s) {
    var rows = (s.rows || [])
      .map(function (r, i) {
        return (
          '<span class="mcp-answer-row" style="--d:' + (i * 120 + 420) + '">' +
          '<i>' + (i + 1) + '</i><b>' + esc(r[0]) + '</b>' +
          '<span class="mcp-star">' + icon('star', 'icon--fill') + r[1] + '</span>' +
          '<code>' + r[2] + '</code></span>'
        )
      })
      .join('')
    var thumbs = (s.thumbs || [])
      .map(function (h, i) {
        return '<i style="--h:' + h + '; --d:' + (i * 110 + 420) + '"></i>'
      })
      .join('')
    return (
      '<div class="mcp-msg mcp-msg--agent mcp-in"><p>' + words(s.answer) + '</p>' +
      (rows ? '<span class="mcp-answer-list">' + rows + '</span>' : '') +
      (thumbs ? '<span class="mcp-thumbs">' + thumbs + '</span>' : '') +
      '</div>'
    )
  }

  var agent = $('[data-agent]')
  if (agent) {
    var log = $('[data-a-log]', agent)
    var draft = $('[data-a-draft]', agent)
    var input = $('[data-a-input]', agent)
    var client = $('[data-a-client]', agent)
    var placeholder = draft.textContent
    var sysLine = log.innerHTML

    var follow = function () {
      log.scrollTo({ top: log.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
    }
    var append = function (html) {
      log.insertAdjacentHTML('beforeend', html)
      follow()
      return log.lastElementChild
    }
    var setClient = function (k) {
      var c = CLIENTS[k % CLIENTS.length]
      client.innerHTML = icon(c[0]) + '<span>' + c[1] + '</span>'
      client.classList.remove('is-swap')
      void client.offsetWidth
      client.classList.add('is-swap')
    }

    if (reduced) {
      var first = SCENES[0]
      log.innerHTML =
        sysLine +
        userMsg(first.prompt) +
        first.calls.map(function (c) {
          return callCard(c, true, false)
        }).join('') +
        answerMsg(first)
      // 静态终态停在最新一条，与动画时的跟随一致
      log.scrollTop = log.scrollHeight
    } else {
      var gate = visibilityGate(agent, 0.3)
      // 每个停顿之后过一次闸门：离屏时停在当前画面，回来接着播
      var hold = async function (ms) {
        await MG.wait(ms)
        await gate()
      }

      var play = async function (s, k) {
        setClient(k)
        input.classList.add('is-composing')
        for (var i = 2; i < s.prompt.length; i += 2) {
          draft.innerHTML = esc(s.prompt.slice(0, i)) + '<span class="mcp-caret"></span>'
          await MG.wait(22)
        }
        draft.innerHTML = esc(s.prompt) + '<span class="mcp-caret"></span>'
        await hold(420)

        input.classList.add('is-sent')
        append(userMsg(s.prompt))
        draft.textContent = placeholder
        input.classList.remove('is-composing')
        await hold(280)
        input.classList.remove('is-sent')

        var think = append(thinkMsg())
        await hold(900)
        think.remove()

        for (var n = 0; n < s.calls.length; n++) {
          var c = s.calls[n]
          var card = append(callCard(c))
          await hold(1100)
          card.classList.add('is-done')
          $('.mcp-call-state', card).textContent = c.state
          var out = $('.mcp-call-out', card)
          for (var l = 0; l < c.out.length; l++) {
            out.insertAdjacentHTML('beforeend', outLine(c.out[l]))
            follow()
            await MG.wait(230)
          }
          out.insertAdjacentHTML('beforeend', moreLine(c))
          follow()
          if (n < s.calls.length - 1) {
            await hold(900)
            card.classList.add('is-collapsed')
            await MG.wait(480)
          } else {
            await hold(700)
          }
        }

        append(answerMsg(s))
        await hold(4600)

        log.classList.add('is-clearing')
        await MG.wait(450)
        log.innerHTML = sysLine
        log.scrollTop = 0
        log.classList.remove('is-clearing')
        await hold(500)
      }

      // 首屏视觉加载后 0.5s 才立起，等它到位再开始第一段
      MG.inView(agent, async function () {
        await MG.wait(1100)
        for (var k = 0; ; k++) {
          await gate()
          await play(SCENES[k % SCENES.length], k)
        }
      }, { threshold: 0.3 })
    }
  }

  /* =====================================================================
     ③ 连接拓扑
     ===================================================================== */
  var net = $('[data-net]')
  if (net) {
    var svg = $('[data-net-svg]', net)
    var hub = $('[data-hub]', net)
    var callLabel = $('[data-hub-call]', net)
    var clientNodes = $$('[data-client]', net)
    var toolNodes = $$('[data-tool]', net)
    var narrow = window.matchMedia('(max-width: 960px)')
    var wires = { c: [], t: [] }
    // 三个工具轮流被调用：[工具名, 返回摘要]
    var LIVE = [
      ['search_businesses', '20 places'],
      ['get_reviews', '60 reviews'],
      ['get_photos', '24 photos']
    ]

    $('[data-hub-mark]', net).innerHTML = window.MGChrome.logoMark()

    // 节点相对 .mcp-net 的布局坐标：走 offset 链，不受入场 transform 影响
    var box = function (el) {
      var x = 0
      var y = 0
      for (var n = el; n && n !== net; n = n.offsetParent) {
        x += n.offsetLeft
        y += n.offsetTop
      }
      return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight }
    }
    var curve = function (x1, y1, x2, y2) {
      var mx = (x1 + x2) / 2
      return 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2
    }

    var layout = function () {
      wires = { c: [], t: [] }
      if (narrow.matches) {
        svg.innerHTML = ''
        return
      }
      var w = net.offsetWidth
      var h = net.offsetHeight
      svg.setAttribute('width', w)
      svg.setAttribute('height', h)
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h)
      var hb = box(hub)
      var hy = hb.y + hb.h / 2
      // 连线在中枢边缘略微散开，避免汇成一个点
      var spread = function (i, count) {
        return (i - (count - 1) / 2) * 12
      }
      clientNodes.forEach(function (el, i) {
        var b = box(el)
        wires.c.push(curve(b.x + b.w, b.y + b.h / 2, hb.x + 2, hy + spread(i, clientNodes.length)))
      })
      toolNodes.forEach(function (el, i) {
        var b = box(el)
        wires.t.push(curve(hb.x + hb.w - 2, hy + spread(i, toolNodes.length), b.x, b.y + b.h / 2))
      })
      svg.innerHTML =
        '<defs><linearGradient id="mcp-wire-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + w + '" y2="0">' +
        '<stop offset="0" stop-color="#a78bfa"/><stop offset=".5" stop-color="#818cf8"/><stop offset="1" stop-color="#22d3ee"/>' +
        '</linearGradient></defs>' +
        wires.c.map(function (d, i) {
          return '<path class="mcp-wire" data-wire="c' + i + '" d="' + d + '"/>'
        }).join('') +
        wires.t.map(function (d, i) {
          return '<path class="mcp-wire" data-wire="t' + i + '" d="' + d + '"/>'
        }).join('')
    }

    layout()
    if (document.fonts) document.fonts.ready.then(layout)
    var resizeTimer = 0
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(layout, 150)
    })

    if (!reduced) {
      var packet = function (cls) {
        var p = document.createElement('i')
        p.className = 'mcp-packet ' + cls
        p.setAttribute('aria-hidden', 'true')
        net.appendChild(p)
        return p
      }
      var reqDot = packet('is-req')
      var resDot = packet('is-res')

      // 光点沿连线移动；back = 从终点回到起点。窄屏无连线时只等待同样时长
      var travel = function (p, d, back, ms) {
        if (!d) return MG.wait(ms)
        p.style.offsetPath = 'path("' + d + '")'
        var from = back ? '100%' : '0%'
        var to = back ? '0%' : '100%'
        return p.animate(
          [
            { offsetDistance: from, opacity: 0 },
            { opacity: 1, offset: 0.14 },
            { opacity: 1, offset: 0.86 },
            { offsetDistance: to, opacity: 0 }
          ],
          { duration: ms, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }
        ).finished
      }
      var wire = function (key) {
        return svg.querySelector('[data-wire="' + key + '"]')
      }
      var setCall = function (text) {
        callLabel.innerHTML = '<span>' + text + '</span>'
      }
      var toggle = function (el, cls, on) {
        if (el) el.classList.toggle(cls, on)
      }

      var netGate = visibilityGate(net, 0.3)
      var cycle = async function (k) {
        var ci = k % clientNodes.length
        var ti = k % LIVE.length
        var cNode = clientNodes[ci]
        var tNode = toolNodes[ti]
        var cWire = wire('c' + ci)
        var tWire = wire('t' + ti)

        cNode.classList.add('is-active')
        toggle(cWire, 'is-active', true)
        setCall('tools/call · ' + LIVE[ti][0])
        await travel(reqDot, wires.c[ci], false, 900)
        hub.classList.add('is-hit')
        await MG.wait(240)
        tNode.classList.add('is-active')
        toggle(tWire, 'is-active', true)
        await travel(reqDot, wires.t[ti], false, 780)
        await MG.wait(420)

        // 结果原路返回
        setCall('result · ' + LIVE[ti][1])
        tNode.classList.replace('is-active', 'is-back')
        toggle(tWire, 'is-active', false)
        toggle(tWire, 'is-back', true)
        await travel(resDot, wires.t[ti], true, 740)
        hub.classList.remove('is-hit')
        toggle(cWire, 'is-active', false)
        toggle(cWire, 'is-back', true)
        await travel(resDot, wires.c[ci], true, 860)
        cNode.classList.replace('is-active', 'is-back')
        await MG.wait(1000)

        cNode.classList.remove('is-back')
        tNode.classList.remove('is-back')
        toggle(cWire, 'is-back', false)
        toggle(tWire, 'is-back', false)
        await MG.wait(450)
      }

      MG.inView(net, async function () {
        await MG.wait(700)
        for (var k = 0; ; k++) {
          await netGate()
          await cycle(k)
        }
      }, { threshold: 0.3 })
    }
  }

  /* =====================================================================
     ④ 接入配置：高亮后的代码按行包裹，供 CSS 逐行入场
     ===================================================================== */
  $$('.mcp-cfg pre').forEach(function (pre) {
    pre.innerHTML = pre.innerHTML
      .split('\n')
      .map(function (line, i) {
        return '<span class="ln" style="--i:' + i + '">' + line + '</span>'
      })
      .join('\n')
  })
})()
