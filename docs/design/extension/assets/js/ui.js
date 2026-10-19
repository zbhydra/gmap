/*
 * MapsGrab 扩展组件行为（原生 JS，零依赖）。依赖 theme.js、motion.js 先执行。
 * 声明式绑定在 UI.init(scope) 里（页面加载时对 document 调用一次；动态渲染后对容器再调用）。
 *
 *   [data-tabs]                 role=tablist 容器：按钮 role=tab（aria-controls 指向面板），.seg-thumb / .tab-ink 自动跟随
 *   [data-seg]                  role=radiogroup 分段：按钮 role=radio，派发 'ui:change'（detail.value = 按钮 data-value）
 *   [data-seg][data-theme-switch]  主题分段（L11）：value = system|light|dark，直接绑定 MG.theme（初值、切换、跨页同步）
 *   [role=switch]               开关：点击切换 aria-checked，派发 'ui:change'（detail.value = true/false）
 *   [data-menu="menuId"]        触发按钮：打开 #menuId（.menu[popover]），方向键 / Home / End / Esc；
 *                               选中项派发 'ui:select'（在菜单上，detail.value = 项的 data-value）
 *   [data-tooltip="文案"]       工具提示（悬停 / 键盘聚焦，上方优先，放不下翻到下方）
 *   textarea[data-counter]      实时计数：data-counter="lines|chars" data-max="500"，更新同一 .textarea-wrap 内的 .counter；
 *                               lines 模式按「去空行、去重」计数（与 Dashboard 规则一致），派发 'ui:count'
 *   .stepper                    [data-step="-1|1"] 按钮 + input[min,max,step]，派发 'ui:change'
 *
 * 命令式 API（window.UI）：
 *   UI.toast({ title, desc, tone: 'ok'|'primary'|'warn'|'bad', icon, action: { label, onClick }, duration, stack })
 *   UI.confirm({ title, desc, icon, tone, confirmLabel, cancelLabel, danger, within }) → Promise<boolean>
 *       within：在给定容器内居中（Popup 原型框内），不传则用顶层 modal
 *   UI.morph(el, key)           .morph / .mgp-morph 容器切换到 data-key=key 的文案
 *   UI.flip(el, mutate)         FLIP：记录位置 → mutate() → 用 transform 补间到新位置（面板左右停靠切换）
 *   UI.mountPanel(host, { html, css })   在 host 上挂 Shadow DOM 面板，主题 / 动效模拟随页面同步，返回 shadowRoot
 *   UI.icon(name, cls)          sprite 图标标记字符串
 *   UI.init(scope)
 */
;(function () {
  var MG = window.MG
  var UI = (window.UI = window.UI || {})
  var SPRITE = 'assets/img/icons.svg'
  var uid = 0

  UI.icon = function (name, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="' + SPRITE + '#i-' + name + '"/></svg>'
  }

  var bound = new WeakMap()
  function fresh(scope, selector, key) {
    var list = Array.prototype.slice.call(scope.querySelectorAll(selector))
    if (scope.matches && scope.matches(selector)) list.unshift(scope)
    return list.filter(function (el) {
      var keys = bound.get(el)
      if (!keys) bound.set(el, (keys = {}))
      if (keys[key]) return false
      keys[key] = true
      return true
    })
  }

  function emit(el, name, detail) {
    el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }))
  }

  /* ------------------------------------------------- 滑块定位（tab / seg 共用） */
  // 首次定位不过渡；字体加载完成与窗口尺寸变化后重新定位（按钮宽度会变）
  function placeIndicator(container, indicator, btn, instant) {
    if (!indicator || !btn) return
    if (instant) container.classList.add('is-instant')
    indicator.style.width = btn.offsetWidth + 'px'
    indicator.style.transform = 'translateX(' + btn.offsetLeft + 'px)'
    if (instant) {
      void indicator.offsetWidth
      requestAnimationFrame(function () {
        container.classList.remove('is-instant')
      })
    }
  }

  function trackIndicator(container, indicator, current) {
    var reposition = function () {
      placeIndicator(container, indicator, current(), true)
    }
    if (document.fonts) document.fonts.ready.then(reposition)
    if (window.ResizeObserver) new ResizeObserver(reposition).observe(container)
  }

  /* -------------------------------------------------------------- tabs */
  function setupTabs(scope) {
    fresh(scope, '[data-tabs]', 'tabs').forEach(function (list) {
      var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'))
      var indicator = list.querySelector('.seg-thumb, .tab-ink')
      var selectedIndex = function () {
        var i = tabs.findIndex(function (t) {
          return t.getAttribute('aria-selected') === 'true'
        })
        return i < 0 ? 0 : i
      }
      var select = function (index, opts) {
        var o = opts || {}
        tabs.forEach(function (tab, i) {
          var on = i === index
          tab.setAttribute('aria-selected', String(on))
          tab.tabIndex = on ? 0 : -1
          var panel = tab.getAttribute('aria-controls') && document.getElementById(tab.getAttribute('aria-controls'))
          if (panel) panel.hidden = !on
        })
        placeIndicator(list, indicator, tabs[index], o.instant)
        if (o.focus) tabs[index].focus()
        if (!o.silent) emit(list, 'ui:change', { index: index, value: tabs[index].dataset.value || tabs[index].id })
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          select(i)
        })
      })
      list.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(document.activeElement)
        if (i < 0) return
        var next = null
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
        if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
        if (e.key === 'Home') next = 0
        if (e.key === 'End') next = tabs.length - 1
        if (next == null) return
        e.preventDefault()
        select(next, { focus: true })
      })
      select(selectedIndex(), { instant: true, silent: true })
      trackIndicator(list, indicator, function () {
        return tabs[selectedIndex()]
      })
      list.selectTab = function (index) {
        select(index)
      }
    })
  }

  /* ------------------------------------------------- segmented（radiogroup） */
  function setupSeg(scope) {
    fresh(scope, '[data-seg]', 'seg').forEach(function (group) {
      var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'))
      var thumb = group.querySelector('.seg-thumb')
      var checkedIndex = function () {
        var i = radios.findIndex(function (r) {
          return r.getAttribute('aria-checked') === 'true'
        })
        return i < 0 ? 0 : i
      }
      var check = function (index, opts) {
        var o = opts || {}
        radios.forEach(function (r, i) {
          r.setAttribute('aria-checked', String(i === index))
          r.tabIndex = i === index ? 0 : -1
        })
        placeIndicator(group, thumb, radios[index], o.instant)
        if (o.focus) radios[index].focus()
        if (!o.silent) emit(group, 'ui:change', { index: index, value: radios[index].dataset.value, origin: radios[index] })
      }
      radios.forEach(function (r, i) {
        r.addEventListener('click', function () {
          if (i !== checkedIndex()) check(i)
        })
      })
      group.addEventListener('keydown', function (e) {
        var i = radios.indexOf(document.activeElement)
        if (i < 0) return
        var next = null
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % radios.length
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + radios.length) % radios.length
        if (next == null) return
        e.preventDefault()
        check(next, { focus: true })
      })
      check(checkedIndex(), { instant: true, silent: true })
      trackIndicator(group, thumb, function () {
        return radios[checkedIndex()]
      })
      group.setValue = function (value) {
        var i = radios.findIndex(function (r) {
          return r.dataset.value === value
        })
        if (i >= 0) check(i, { silent: true })
      }
    })
  }

  /* ------------------------------------------------------- theme switch */
  // 必须先于 setupSeg：在滑块首次定位前写好当前主题，避免首帧从 System 滑过去
  function setupThemeSwitch(scope) {
    fresh(scope, '[data-theme-switch]', 'theme').forEach(function (group) {
      var mode = MG.theme.mode()
      group.querySelectorAll('[role="radio"]').forEach(function (radio) {
        radio.setAttribute('aria-checked', String(radio.dataset.value === mode))
      })
      group.addEventListener('ui:change', function (e) {
        MG.theme.set(e.detail.value, { origin: e.detail.origin })
      })
      document.addEventListener('mg:theme', function (e) {
        if (group.setValue) group.setValue(e.detail.mode)
      })
    })
  }

  /* ------------------------------------------------------------ switch */
  function setupSwitches(scope) {
    fresh(scope, '[role="switch"]', 'switch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        if (sw.disabled) return
        var on = sw.getAttribute('aria-checked') !== 'true'
        sw.setAttribute('aria-checked', String(on))
        emit(sw, 'ui:change', { value: on })
      })
    })
  }

  /* -------------------------------------------------------------- menu */
  // 菜单放进顶层（popover="auto"）：不受表格 overflow / transform 影响，点外部与 Esc 由浏览器关闭
  function positionFloating(el, anchor, opts) {
    var o = opts || {}
    var gap = o.gap == null ? 6 : o.gap
    var a = anchor.getBoundingClientRect()
    var w = el.offsetWidth
    var h = el.offsetHeight
    var left = o.align === 'start' ? a.left : a.right - w
    left = Math.max(8, Math.min(left, innerWidth - w - 8))
    var below = a.bottom + gap + h <= innerHeight - 8
    var top = below ? a.bottom + gap : a.top - gap - h
    el.style.left = Math.round(left) + 'px'
    el.style.top = Math.round(Math.max(8, top)) + 'px'
    el.style.setProperty('--menu-origin', (below ? 'top ' : 'bottom ') + (o.align === 'start' ? 'left' : 'right'))
    return below
  }

  function menuItems(menu) {
    return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"], [role="menuitemradio"]')).filter(function (it) {
      return it.getAttribute('aria-disabled') !== 'true'
    })
  }

  function setupMenus(scope) {
    fresh(scope, '[data-menu]', 'menu').forEach(function (trigger) {
      var menu = document.getElementById(trigger.dataset.menu)
      if (!menu) return
      if (!menu.hasAttribute('popover')) menu.setAttribute('popover', 'auto')
      trigger.setAttribute('aria-haspopup', 'menu')
      trigger.setAttribute('aria-expanded', 'false')
      if (!menu.id) menu.id = 'menu-' + ++uid
      trigger.setAttribute('aria-controls', menu.id)

      trigger.addEventListener('click', function () {
        if (menu.matches(':popover-open')) {
          menu.hidePopover()
          return
        }
        menu._trigger = trigger
        menu.showPopover()
        positionFloating(menu, trigger, { align: trigger.dataset.menuAlign })
        var first = menuItems(menu)[0]
        if (first) first.focus({ preventScroll: true })
      })

      if (bound.get(menu) && bound.get(menu).menuItems) return
      bound.set(menu, Object.assign(bound.get(menu) || {}, { menuItems: true }))

      menu.addEventListener('toggle', function (e) {
        var open = e.newState === 'open'
        if (menu._trigger) menu._trigger.setAttribute('aria-expanded', String(open))
        if (!open && menu._trigger && menu.contains(document.activeElement)) menu._trigger.focus()
      })
      menu.addEventListener('keydown', function (e) {
        var items = menuItems(menu)
        var i = items.indexOf(document.activeElement)
        var next = null
        if (e.key === 'ArrowDown') next = (i + 1) % items.length
        if (e.key === 'ArrowUp') next = (i - 1 + items.length) % items.length
        if (e.key === 'Home') next = 0
        if (e.key === 'End') next = items.length - 1
        if (e.key === 'Tab') menu.hidePopover()
        if (next == null) return
        e.preventDefault()
        items[next].focus()
      })
      menu.addEventListener('click', function (e) {
        var item = e.target.closest('[role="menuitem"], [role="menuitemradio"]')
        if (!item || item.getAttribute('aria-disabled') === 'true') return
        if (item.getAttribute('role') === 'menuitemradio') {
          menu.querySelectorAll('[role="menuitemradio"]').forEach(function (r) {
            r.setAttribute('aria-checked', String(r === item))
          })
        }
        emit(menu, 'ui:select', { value: item.dataset.value, item: item, trigger: menu._trigger })
        menu.hidePopover()
        if (menu._trigger) menu._trigger.focus()
      })
      window.addEventListener('resize', function () {
        if (menu.matches(':popover-open')) menu.hidePopover()
      })
    })
  }

  /* ----------------------------------------------------------- tooltip */
  var tip = null
  var tipTimer = 0
  function showTip(target) {
    if (!tip) {
      tip = document.createElement('div')
      tip.className = 'tooltip'
      tip.id = 'ui-tooltip'
      tip.setAttribute('role', 'tooltip')
      tip.setAttribute('popover', 'manual')
      document.body.appendChild(tip)
    }
    tip.textContent = target.dataset.tooltip
    target.setAttribute('aria-describedby', tip.id)
    tip.classList.remove('is-on')
    if (!tip.matches(':popover-open')) tip.showPopover()
    var a = target.getBoundingClientRect()
    var w = tip.offsetWidth
    var h = tip.offsetHeight
    var left = Math.max(8, Math.min(a.left + a.width / 2 - w / 2, innerWidth - w - 8))
    var above = a.top - h - 8 >= 8
    tip.dataset.side = above ? 'top' : 'bottom'
    tip.style.left = Math.round(left) + 'px'
    tip.style.top = Math.round(above ? a.top - h - 8 : a.bottom + 8) + 'px'
    tip.style.setProperty('--arrow-x', Math.round(a.left + a.width / 2 - left) + 'px')
    requestAnimationFrame(function () {
      tip.classList.add('is-on')
    })
  }
  function hideTip(target) {
    clearTimeout(tipTimer)
    if (target) target.removeAttribute('aria-describedby')
    if (!tip) return
    tip.classList.remove('is-on')
    if (tip.matches(':popover-open')) tip.hidePopover()
  }
  function setupTooltips(scope) {
    fresh(scope, '[data-tooltip]', 'tooltip').forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        clearTimeout(tipTimer)
        tipTimer = setTimeout(function () {
          showTip(el)
        }, 350)
      })
      el.addEventListener('pointerleave', function () {
        hideTip(el)
      })
      el.addEventListener('focus', function () {
        if (el.matches(':focus-visible')) showTip(el)
      })
      el.addEventListener('blur', function () {
        hideTip(el)
      })
      el.addEventListener('click', function () {
        hideTip(el)
      })
    })
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideTip(null)
  })

  /* ----------------------------------------------------------- counter */
  // lines 模式：去首尾空白、去空行、保序去重后的条数（与 Dashboard 新建表单规则一致）
  UI.countLines = function (text) {
    var seen = Object.create(null)
    var n = 0
    text.split('\n').forEach(function (line) {
      var v = line.trim()
      if (!v || seen[v]) return
      seen[v] = true
      n++
    })
    return n
  }

  function setupCounters(scope) {
    fresh(scope, 'textarea[data-counter]', 'counter').forEach(function (ta) {
      var wrap = ta.closest('.textarea-wrap')
      var counter = wrap && wrap.querySelector('.counter')
      var max = Number(ta.dataset.max || 0)
      var last = -1
      var update = function () {
        var n = ta.dataset.counter === 'chars' ? ta.value.length : UI.countLines(ta.value)
        if (counter) {
          counter.innerHTML = '<b>' + MG.formatNumber(n) + '</b>' + (max ? ' / ' + MG.formatNumber(max) : '')
          counter.classList.toggle('is-over', max > 0 && n > max)
          counter.classList.toggle('is-near', max > 0 && n <= max && n >= max * 0.9)
          if (last >= 0 && n !== last && !MG.reducedMotion()) MG.replay(counter, 'is-bump')
        }
        if (n !== last) emit(ta, 'ui:count', { count: n, max: max })
        last = n
      }
      ta.addEventListener('input', update)
      update()
    })
  }

  /* ----------------------------------------------------------- stepper */
  function setupSteppers(scope) {
    fresh(scope, '.stepper', 'stepper').forEach(function (stepper) {
      var input = stepper.querySelector('input')
      var buttons = stepper.querySelectorAll('[data-step]')
      var min = Number(input.min)
      var max = Number(input.max)
      var step = Number(input.step || 1)
      var sync = function () {
        var v = Number(input.value)
        buttons.forEach(function (b) {
          var dir = Number(b.dataset.step)
          b.disabled = dir < 0 ? v <= min : v >= max
        })
      }
      var set = function (v) {
        var clamped = Math.max(min, Math.min(max, Math.round(v / step) * step))
        input.value = clamped
        sync()
        emit(stepper, 'ui:change', { value: clamped })
      }
      buttons.forEach(function (b) {
        b.addEventListener('click', function () {
          set(Number(input.value) + Number(b.dataset.step) * step)
        })
      })
      input.addEventListener('change', function () {
        set(Number(input.value) || min)
      })
      sync()
    })
  }

  /* ------------------------------------------------------------- morph */
  UI.morph = function (container, key) {
    var items = Array.prototype.slice.call(container.children)
    var next = items.find(function (it) {
      return it.dataset.key === key
    })
    var current = items.find(function (it) {
      return it.classList.contains('is-active')
    })
    if (!next || next === current) return
    if (current) {
      current.classList.remove('is-active')
      current.classList.add('is-leaving')
      current.setAttribute('aria-hidden', 'true')
      setTimeout(function () {
        current.classList.remove('is-leaving')
      }, MG.ms('--dur-3') || 280)
    }
    next.classList.remove('is-leaving')
    next.classList.add('is-active')
    next.removeAttribute('aria-hidden')
  }

  /* -------------------------------------------------------------- flip */
  UI.flip = function (el, mutate) {
    var before = el.getBoundingClientRect()
    mutate()
    if (MG.reducedMotion()) return
    var after = el.getBoundingClientRect()
    var dx = before.left - after.left
    var dy = before.top - after.top
    if (!dx && !dy) return
    el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], {
      duration: MG.ms('--dur-4') || 560,
      easing: MG.token('--ease-emph') || 'ease-out'
    })
  }

  /* ------------------------------------------------------------- toast */
  var TONE_ICON = { ok: 'check', primary: 'info', warn: 'alert', bad: 'x' }
  UI.toast = function (options) {
    var o = options || {}
    var stack = o.stack || document.querySelector('[data-toast-stack]')
    if (!stack) {
      stack = document.createElement('div')
      stack.className = 'toast-stack'
      stack.setAttribute('data-toast-stack', '')
      document.body.appendChild(stack)
    }
    var tone = o.tone || 'ok'
    var duration = o.duration || MG.ms('--dur-toast') || 4000
    var el = document.createElement('div')
    el.className = 'toast tone-' + tone
    el.setAttribute('role', tone === 'bad' ? 'alert' : 'status')
    el.style.setProperty('--dur-toast', duration + 'ms')
    el.innerHTML =
      '<span class="toast-icon">' + UI.icon(o.icon || TONE_ICON[tone] || 'check') + '</span>' +
      '<div><div class="toast-title"></div>' + (o.desc ? '<div class="toast-desc"></div>' : '') +
      (o.action ? '<div class="toast-action"><button class="link" type="button"></button></div>' : '') + '</div>' +
      '<button class="icon-btn icon-btn--sm toast-close" type="button" aria-label="Dismiss">' + UI.icon('x') + '</button>' +
      '<span class="toast-timer" aria-hidden="true"></span>'
    el.querySelector('.toast-title').textContent = o.title || ''
    if (o.desc) el.querySelector('.toast-desc').textContent = o.desc
    var leave = function () {
      if (el.classList.contains('is-leaving')) return
      el.classList.add('is-leaving')
      var done = function () {
        el.remove()
      }
      if (MG.reducedMotion()) done()
      else el.addEventListener('animationend', done, { once: true })
    }
    if (o.action) {
      var btn = el.querySelector('.toast-action button')
      btn.textContent = o.action.label
      btn.addEventListener('click', function () {
        o.action.onClick()
        leave()
      })
    }
    el.querySelector('.toast-close').addEventListener('click', leave)
    // 自动消失走 JS 计时（减弱动效下计时条动画会瞬间结束，不能拿它当计时器）；悬停暂停，与计时条同步
    var remaining = duration
    var startedAt = 0
    var timer = 0
    var run = function () {
      startedAt = Date.now()
      timer = setTimeout(leave, remaining)
    }
    el.addEventListener('pointerenter', function () {
      clearTimeout(timer)
      remaining -= Date.now() - startedAt
    })
    el.addEventListener('pointerleave', run)
    stack.appendChild(el)
    run()
    return { close: leave, el: el }
  }

  /* ------------------------------------------------------------ dialog */
  // 站内确认（L6：删除改为站内弹窗，替代 window.confirm）；危险操作默认聚焦「取消」
  UI.confirm = function (options) {
    var o = options || {}
    return new Promise(function (resolve) {
      var tone = o.tone || (o.danger ? 'bad' : 'primary')
      var dialog = document.createElement('dialog')
      dialog.className = 'dialog' + (o.within ? ' is-contained' : '')
      var titleId = 'dlg-title-' + ++uid
      var descId = 'dlg-desc-' + uid
      dialog.setAttribute('aria-labelledby', titleId)
      dialog.setAttribute('aria-describedby', descId)
      dialog.innerHTML =
        '<div class="dialog-body">' +
        (o.icon ? '<span class="icon-tile icon-tile--soft tone-' + tone + '">' + UI.icon(o.icon) + '</span>' : '') +
        '<h2 class="dialog-title" id="' + titleId + '"></h2>' +
        '<p class="dialog-desc" id="' + descId + '"></p>' +
        '</div>' +
        '<div class="dialog-actions">' +
        '<button class="btn btn-secondary" type="button" data-answer="no"></button>' +
        '<button class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" type="button" data-answer="yes"></button>' +
        '</div>'
      dialog.querySelector('.dialog-title').textContent = o.title || ''
      // desc 允许 <b> 包住对象名（如任务名）；其余内容以文本写入
      var desc = dialog.querySelector('.dialog-desc')
      if (o.descHtml) desc.innerHTML = o.descHtml
      else desc.textContent = o.desc || ''
      dialog.querySelector('[data-answer="no"]').textContent = o.cancelLabel || 'Cancel'
      dialog.querySelector('[data-answer="yes"]').textContent = o.confirmLabel || 'Confirm'

      var host = o.within || document.body
      var scrim = null
      if (o.within) {
        scrim = document.createElement('div')
        scrim.className = 'dialog-scrim'
        host.appendChild(scrim)
      }
      host.appendChild(dialog)

      var finish = function (answer) {
        if (dialog._done) return
        dialog._done = true
        dialog.close()
        if (scrim) scrim.classList.remove('is-on')
        setTimeout(function () {
          dialog.remove()
          if (scrim) scrim.remove()
        }, MG.reducedMotion() ? 0 : MG.ms('--dur-3') || 280)
        resolve(answer)
      }
      dialog.addEventListener('click', function (e) {
        var answer = e.target.closest('[data-answer]')
        if (answer) finish(answer.dataset.answer === 'yes')
        else if (e.target === dialog && !o.within) finish(false)
      })
      dialog.addEventListener('cancel', function (e) {
        e.preventDefault()
        finish(false)
      })
      if (o.within) {
        dialog.show()
        requestAnimationFrame(function () {
          scrim.classList.add('is-on')
        })
        scrim.addEventListener('click', function () {
          finish(false)
        })
        dialog.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') finish(false)
        })
      } else {
        dialog.showModal()
      }
      dialog.querySelector(o.danger ? '[data-answer="no"]' : '[data-answer="yes"]').focus()
    })
  }

  /* ------------------------------------------------------- panel mount */
  // 原型里把页内面板挂进真正的 Shadow DOM，验证 panel.css 的自含性；
  // 宿主元素的 data-theme / data-motion 跟随页面（落地时由内容脚本读取扩展设置写入）
  UI.mountPanel = function (host, options) {
    var o = options || {}
    var shadow = host.shadowRoot || host.attachShadow({ mode: 'open' })
    // 样式表只挂一次：重复挂载只换内容，不重新加载 CSS；首次加载完成前隐藏宿主，避免无样式闪烁
    var link = shadow.querySelector('link[data-panel-css]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = o.css || 'assets/css/panel.css'
      link.setAttribute('data-panel-css', '')
      host.style.visibility = 'hidden'
      var reveal = function () {
        host.style.visibility = ''
      }
      link.addEventListener('load', reveal, { once: true })
      link.addEventListener('error', reveal, { once: true })
      shadow.appendChild(link)
    }
    while (link.nextSibling) shadow.removeChild(link.nextSibling)
    var tpl = document.createElement('template')
    tpl.innerHTML = o.html || ''
    shadow.appendChild(tpl.content)
    var sync = function () {
      var theme = document.documentElement.getAttribute('data-theme')
      if (theme) host.setAttribute('data-theme', theme)
      else host.removeAttribute('data-theme')
      if (MG.reducedMotion()) host.setAttribute('data-motion', 'reduce')
      else host.removeAttribute('data-motion')
    }
    sync()
    if (!host._mgSync) {
      host._mgSync = true
      document.addEventListener('mg:theme', sync)
      document.addEventListener('mg:motion', sync)
    }
    return shadow
  }

  /* -------------------------------------------------------------- init */
  UI.init = function (scope) {
    var target = scope || document
    setupTabs(target)
    setupThemeSwitch(target)
    setupSeg(target)
    setupSwitches(target)
    setupMenus(target)
    setupTooltips(target)
    setupCounters(target)
    setupSteppers(target)
  }

  UI.init(document)
})()
