/*
 * 站级交互：主题切换（圆形揭示）、导航收拢 / hover 胶囊 / 下拉、移动菜单、
 * 分段 tab、手风琴动画、登录弹窗、Toast、复制、代码高亮、工具网格、CTA pin 雨、目录滚动高亮。
 * 依赖 chrome.js 与 motion.js 先执行。
 */
(function () {
  var MG = window.MG
  var root = document.documentElement

  /* ------------------------------------------------------------- toast */
  var stack = document.querySelector('[data-toast-stack]')
  // icon：图标名，默认 check（成功确认）；原型说明类提示用 info
  MG.toast = function (title, desc, icon) {
    if (!stack) return
    var el = document.createElement('div')
    el.className = 'toast' + (icon && icon !== 'check' ? ' toast--note' : '')
    el.setAttribute('role', 'status')
    el.innerHTML =
      '<span class="toast-icon">' + window.MGChrome.icon(icon || 'check') + '</span>' +
      '<div><div class="toast-title"></div>' + (desc ? '<div class="toast-desc"></div>' : '') + '</div>'
    el.querySelector('.toast-title').textContent = title
    if (desc) el.querySelector('.toast-desc').textContent = desc
    stack.appendChild(el)
    setTimeout(function () {
      el.classList.add('is-leaving')
      el.addEventListener('animationend', function () {
        el.remove()
      })
    }, 3600)
  }

  /* ------------------------------------------------------------- theme */
  var resolvedTheme = function () {
    return root.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = resolvedTheme() === 'dark' ? 'light' : 'dark'
      var apply = function () {
        root.dataset.theme = next
        try {
          localStorage.setItem('mg-theme', next)
        } catch (error) {
          // 存储不可用时本次会话内仍生效
        }
      }
      if (!document.startViewTransition || MG.reducedMotion()) {
        apply()
        return
      }
      // 从按钮位置圆形揭示新主题
      var r = btn.getBoundingClientRect()
      var x = r.left + r.width / 2
      var y = r.top + r.height / 2
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      root.classList.add('theme-switching')
      var transition = document.startViewTransition(apply)
      transition.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
        )
      })
      transition.finished.then(function () {
        root.classList.remove('theme-switching')
      })
    })
  })

  /* --------------------------------------------------------------- nav */
  var nav = document.querySelector('[data-nav]')
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  // hover 胶囊跟随
  var links = document.querySelector('[data-nav-links]')
  if (links && MG.finePointer()) {
    var pill = links.querySelector('.nav-pill')
    links.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('pointerenter', function () {
        pill.style.setProperty('--pill-x', link.offsetLeft + (link.closest('.dd') ? link.closest('.dd').offsetLeft : 0) + 'px')
        pill.style.setProperty('--pill-w', link.offsetWidth + 'px')
        links.classList.add('has-hover')
      })
    })
    links.addEventListener('pointerleave', function () {
      links.classList.remove('has-hover')
    })
  }

  // 下拉：桌面 hover 打开，点击 / 键盘同样可用，Esc 关闭
  document.querySelectorAll('[data-dropdown]').forEach(function (dd) {
    var trigger = dd.querySelector('[data-dropdown-trigger]')
    var timer = 0
    var setOpen = function (open) {
      dd.classList.toggle('is-open', open)
      trigger.setAttribute('aria-expanded', String(open))
    }
    trigger.addEventListener('click', function () {
      setOpen(!dd.classList.contains('is-open'))
    })
    if (MG.finePointer()) {
      dd.addEventListener('pointerenter', function () {
        clearTimeout(timer)
        setOpen(true)
      })
      dd.addEventListener('pointerleave', function () {
        timer = setTimeout(function () {
          setOpen(false)
        }, 140)
      })
    }
    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) setOpen(false)
    })
    dd.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.focus()
      }
    })
  })

  // 移动菜单
  document.querySelectorAll('[data-menu-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = !root.classList.contains('menu-open')
      root.classList.toggle('menu-open', open)
      btn.setAttribute('aria-expanded', String(open))
      document.body.style.overflow = open ? 'hidden' : ''
    })
  })

  /* -------------------------------------------------------------- tabs */
  MG.setupTabs = function (scope) {
    ;(scope || document).querySelectorAll('[data-tabs]').forEach(function (tabs) {
      if (tabs.dataset.tabsReady) return
      tabs.dataset.tabsReady = '1'
      var list = tabs.querySelector('[role="tablist"]')
      var buttons = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'))
      var thumb = list.querySelector('.seg-thumb')
      var placeThumb = function (btn) {
        if (!thumb) return
        thumb.style.width = btn.offsetWidth + 'px'
        thumb.style.transform = 'translateX(' + btn.offsetLeft + 'px)'
      }
      var select = function (index, focus) {
        buttons.forEach(function (btn, i) {
          var on = i === index
          btn.setAttribute('aria-selected', String(on))
          btn.tabIndex = on ? 0 : -1
          var panel = document.getElementById(btn.getAttribute('aria-controls'))
          if (panel) panel.hidden = !on
        })
        placeThumb(buttons[index])
        if (focus) buttons[index].focus()
        tabs.dispatchEvent(new CustomEvent('tabchange', { detail: { index: index, key: buttons[index].dataset.tab } }))
      }
      buttons.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          select(i)
        })
      })
      list.addEventListener('keydown', function (e) {
        var i = buttons.indexOf(document.activeElement)
        if (i < 0) return
        if (e.key === 'ArrowRight') select((i + 1) % buttons.length, true)
        if (e.key === 'ArrowLeft') select((i - 1 + buttons.length) % buttons.length, true)
      })
      var initial = buttons.findIndex(function (b) {
        return b.getAttribute('aria-selected') === 'true'
      })
      select(initial < 0 ? 0 : initial)
      // 字体加载完成后按钮宽度会变化，重新定位滑块
      if (document.fonts) document.fonts.ready.then(function () {
        placeThumb(buttons[buttons.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true' })])
      })
      window.addEventListener('resize', function () {
        placeThumb(buttons[buttons.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true' })])
      })
      tabs.selectTab = select
    })
  }
  MG.setupTabs()

  /* --------------------------------------------------------- accordion */
  document.querySelectorAll('details.acc').forEach(function (d) {
    var summary = d.querySelector('summary')
    var body = d.querySelector('.acc-body')
    summary.addEventListener('click', function (e) {
      if (MG.reducedMotion() || !body) return
      e.preventDefault()
      if (d.open) {
        var h = body.offsetHeight
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], {
          duration: 320,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }).onfinish = function () {
          d.open = false
        }
      } else {
        d.open = true
        var target = body.offsetHeight
        body.animate([{ height: '0px', opacity: 0 }, { height: target + 'px', opacity: 1 }], {
          duration: 460,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        })
      }
    })
  })

  /* ------------------------------------------------------------ dialog */
  var modal = document.getElementById('signin-modal')
  if (modal) {
    var step1 = modal.querySelector('[data-signin-step="1"]')
    var step2 = modal.querySelector('[data-signin-step="2"]')
    var showStep = function (n) {
      step1.hidden = n !== 1
      step2.hidden = n !== 2
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-signin]')) {
        e.preventDefault()
        root.classList.remove('menu-open')
        document.body.style.overflow = ''
        showStep(1)
        modal.showModal()
      }
    })
    modal.querySelector('[data-modal-close]').addEventListener('click', function () {
      modal.close()
    })
    // 点击遮罩关闭
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.close()
    })
    modal.querySelector('[data-signin-form]').addEventListener('submit', function (e) {
      e.preventDefault()
      var email = e.target.querySelector('input').value
      modal.querySelector('[data-signin-sent]').textContent = 'We sent a 6-digit code to ' + email + '.'
      showStep(2)
      modal.querySelector('[data-otp] input').focus()
    })
    modal.querySelector('[data-signin-back]').addEventListener('click', function () {
      showStep(1)
    })
    modal.querySelector('[data-signin-code]').addEventListener('submit', function (e) {
      e.preventDefault()
      modal.close()
      MG.toast('Signed in', 'Prototype only — no request was sent.')
    })
    // OTP：输入后自动跳到下一格，退格回到上一格
    var otp = Array.prototype.slice.call(modal.querySelectorAll('[data-otp] input'))
    otp.forEach(function (input, i) {
      input.addEventListener('input', function () {
        input.value = input.value.replace(/\D/g, '').slice(-1)
        if (input.value && otp[i + 1]) otp[i + 1].focus()
      })
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !input.value && otp[i - 1]) otp[i - 1].focus()
      })
    })
  }

  /* -------------------------------------------------------------- copy */
  document.addEventListener('click', function (e) {
    // data-copy="文本" 直接复制；data-copy-target="选择器" 复制目标元素的 innerText（两者任一即可）
    var btn = e.target.closest('[data-copy], [data-copy-target]')
    if (!btn) return
    var source = btn.dataset.copyTarget ? document.querySelector(btn.dataset.copyTarget) : null
    var text = source ? source.innerText : btn.dataset.copy
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {})
    MG.toast('Copied to clipboard')
  })

  /* ---------------------------------------------------------- highlight */
  // 极简代码高亮（字符串 / 注释（# // /* */）/ 数字 / 关键字 / JSON 键）。原型够用；落地改为构建期高亮（如 Shiki）
  var escapeHtml = function (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  MG.highlight = function (code) {
    var re = /("(?:[^"\\]|\\.)*"(\s*:)?|'[^']*'|`[^`]*`|\/\*[\s\S]*?\*\/|(?<![\w"])# [^\n]*|(?<![:\w])\/\/[^\n]*|\b(?:import|from|const|await|let|return|true|false|null)\b|\b\d+(?:\.\d+)?\b|[{}[\](),:])/g
    var out = ''
    var last = 0
    code.replace(re, function (m, str, colon, offset) {
      out += escapeHtml(code.slice(last, offset))
      var cls = 'tok-punc'
      if (str && colon) cls = 'tok-key'
      else if (/^["'`]/.test(m)) cls = 'tok-str'
      else if (/^(#|\/\/|\/\*)/.test(m)) cls = 'tok-com'
      else if (/^\d/.test(m)) cls = 'tok-num'
      else if (/^(true|false|null)$/.test(m)) cls = 'tok-bool'
      else if (/^[a-z]/.test(m)) cls = 'tok-fn'
      out += '<span class="' + cls + '">' + escapeHtml(m) + '</span>'
      last = offset + m.length
      return m
    })
    return out + escapeHtml(code.slice(last))
  }
  // <pre data-highlight> 内写纯文本代码，加载时高亮
  document.querySelectorAll('[data-highlight]').forEach(function (el) {
    el.innerHTML = MG.highlight(el.textContent)
  })

  /* --------------------------------------------------------- tools grid */
  // <div class="tools-grid" data-tools-grid [data-exclude="place-id-finder"] [data-more]>
  MG.renderTools = function (grid) {
    var icon = window.MGChrome.icon
    var exclude = grid.dataset.exclude
    grid.innerHTML =
      window.MGChrome.tools
        .filter(function (t) {
          return t[2] !== exclude
        })
        .map(function (t) {
          return (
            '<a class="tool-card card card-link card--lift" href="' + window.MGChrome.toolHref(t) + '" data-spotlight data-reveal>' +
            '<span class="icon-tile">' + icon(t[1]) + '</span>' +
            '<span class="tool-go">' + icon('arrow-up-right') + '</span>' +
            '<h3>' + t[0] + '</h3><p>' + t[3] + '</p></a>'
          )
        })
        .join('') +
      (grid.hasAttribute('data-more')
        ? '<div class="tool-more" data-reveal>' + icon('wrench', 'icon--lg') + '<span>More tools on the way</span></div>'
        : '')
    MG.init(grid)
  }
  document.querySelectorAll('[data-tools-grid]').forEach(MG.renderTools)

  /* ----------------------------------------------------------- cta pins */
  // 收尾 CTA 面板背景的 pin 雨：进入视口时循环落点，离屏 / 后台暂停
  document.querySelectorAll('[data-cta-pins]').forEach(function (layer) {
    if (MG.reducedMotion()) return
    var visible = false
    MG.inView(layer, function (v) {
      visible = v
    }, { once: false, threshold: 0.1 })
    var spots = [[8, 30], [14, 72], [22, 46], [80, 26], [88, 64], [74, 78], [92, 38], [30, 84], [68, 18], [6, 58]]
    var k = 0
    setInterval(function () {
      if (!visible || document.hidden) return
      var spot = spots[k++ % spots.length]
      var pin = document.createElement('i')
      pin.className = 'map-pin is-dropped'
      pin.style.setProperty('--x', spot[0] + '%')
      pin.style.setProperty('--y', spot[1] + '%')
      pin.innerHTML = '<span class="pin-ring"></span>'
      layer.appendChild(pin)
      setTimeout(function () {
        pin.style.transition = 'opacity .6s'
        pin.style.opacity = '0'
        setTimeout(function () {
          pin.remove()
        }, 700)
      }, 4200)
    }, 650)
  })

  /* ---------------------------------------------------------------- toc */
  // <nav class="toc" data-toc> 内的 a[href="#id"]：滚动时高亮当前小节
  document.querySelectorAll('[data-toc]').forEach(function (toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'))
    var targets = links
      .map(function (a) {
        return document.getElementById(a.getAttribute('href').slice(1))
      })
      .filter(Boolean)
    if (!targets.length) return
    var update = function () {
      var line = window.innerHeight * 0.3
      var current = targets[0]
      targets.forEach(function (t) {
        if (t.getBoundingClientRect().top <= line) current = t
      })
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + current.id
        a.classList.toggle('is-active', on)
        if (on) a.setAttribute('aria-current', 'true')
        else a.removeAttribute('aria-current')
      })
    }
    var ticking = false
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return
        ticking = true
        requestAnimationFrame(function () {
          update()
          ticking = false
        })
      },
      { passive: true }
    )
    update()
  })

  /* ------------------------------------------------ prototype-only notes */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-proto-note]')
    if (!el) return
    e.preventDefault()
    MG.toast('Prototype note', el.dataset.protoNote, 'info')
  })

  document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      MG.toast('English', 'More languages ship with the 010 i18n rollout.', 'globe')
    })
  })
})()
