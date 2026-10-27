/*
 * MapsGrab Dashboard 设计稿交互（原型，零依赖）
 * ---------------------------------------------------------------------------
 * 落地映射见 README §9：路由与外壳 → DashboardApp（含侧栏收起）；用户卡与账户菜单 → DashboardUserCard / DashboardAccountMenu；
 * Online 视图 → OnlineComposer（MapInput / RegionInput）+ RecentJobs；History 视图 → JobHistory（工具栏 + 列表 + 分页）；
 * API 视图 → ApiView；订阅视图 → SubscriptionsView + CancelGuideDialog。
 * 原型专用、落地删除：mock 数据与延迟、失败注入、任务进度模拟、样例 CSV、调试面板。
 */
;(() => {
  'use strict'

  /* =========================================================================
     0 · 工具
     ========================================================================= */
  const root = document.documentElement
  const body = document.body
  const $ = (selector, scope = document) => scope.querySelector(selector)
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector))
  const SPRITE = '../assets/img/icons.svg'
  // Dashboard 新增图标暂放页内 sprite（index.html 顶部），并入 icons.svg 后删除此分支
  const LOCAL_ICONS = new Set(['logout', 'monitor', 'alert', 'selector', 'history', 'sidebar', 'chevron-left'])
  const icon = (name, cls = '') =>
    `<svg class="icon${cls ? ` ${cls}` : ''}" aria-hidden="true"><use href="${LOCAL_ICONS.has(name) ? '' : SPRITE}#i-${name}"/></svg>`
  const spinner = (cls = '') => `<span class="spinner${cls ? ` ${cls}` : ''}" aria-hidden="true"></span>`
  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  const esc = value => String(value).replace(/[&<>"']/g, ch => ESCAPES[ch])
  const fmt = (template, vars) => template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
  const num = value => Number(value).toLocaleString('en-US')
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const reducedMotion = () => root.classList.contains('force-reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches
  const replay = (el, cls) => {
    el.classList.remove(cls)
    void el.offsetWidth
    el.classList.add(cls)
  }
  // 重试类按钮：点击即进入进行中，结果到达后由所在区域整段重绘替换
  const markBusy = btn => {
    btn.classList.add('is-busy')
    btn.setAttribute('aria-busy', 'true')
    const glyph = btn.querySelector('svg.icon')
    if (glyph) glyph.outerHTML = `<span class="spinner spinner--sm" aria-hidden="true"></span>`
  }

  /**
   * 局部重绘：HTML 不变则跳过；保留区域内焦点（按 data-fk 找回）与 meter 宽度过渡。
   * 落地由 Vue 的 keyed diff 承担，这里只是让原型的整段 innerHTML 不打断键盘操作与动效。
   */
  const patch = (el, html) => {
    if (!el || el._html === html) return
    const active = document.activeElement
    const focusKey = active && el.contains(active) ? active.getAttribute('data-fk') : null
    const oldMeters = $$('.meter > i', el).map(bar => bar.style.getPropertyValue('--v'))
    el.innerHTML = html
    el._html = html
    const bars = $$('.meter > i', el)
    if (bars.length === oldMeters.length) {
      bars.forEach((bar, index) => {
        const target = bar.style.getPropertyValue('--v')
        if (!oldMeters[index] || oldMeters[index] === target) return
        bar.style.setProperty('--v', oldMeters[index])
        void bar.offsetWidth
        bar.style.setProperty('--v', target)
      })
    }
    if (focusKey) $(`[data-fk="${CSS.escape(focusKey)}"]`, el)?.focus({ preventScroll: true })
  }

  // 额度提醒阈值：≥ 80% 进入提醒色，用尽进入错误色（80% 为本稿提议，见 README §13）
  const quotaLevel = (used, total) => (used >= total ? 'bad' : used >= total * 0.8 ? 'warn' : '')
  const meter = (used, total, { thin = false, levels = true } = {}) => {
    const lvl = levels ? quotaLevel(used, total) : ''
    const value = total > 0 ? clamp((used / total) * 100, 0, 100) : 0
    return `<div class="meter${thin ? ' meter--thin' : ''}"${lvl ? ` data-level="${lvl}"` : ''} aria-hidden="true"><i style="--v: ${value.toFixed(2)}%"></i></div>`
  }

  // 业务时区统一 America/New_York（backend utils/time.py），界面显式标注 ET
  const TZ = 'America/New_York'
  const dateTimeFormat = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  const dateFormat = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' })
  const periodFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' })
  const dateTimeNoYear = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  const yearFormat = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric' })
  // 当年的时间省略年份（列表更紧凑），跨年才显示
  const fmtTime = ms => {
    if (ms == null) return '—'
    const sameYear = yearFormat.format(new Date(ms)) === yearFormat.format(new Date())
    return (sameYear ? dateTimeNoYear : dateTimeFormat).format(new Date(ms))
  }
  const fmtDate = ms => dateFormat.format(new Date(ms))
  const currentPeriod = () => periodFormat.format(new Date()).slice(0, 7)

  // 日期（YYYY-MM-DD，ET 日历日）与 ET 零点毫秒互转：History 的时间范围按纽约日界换算成 created_from / created_to
  const ymdFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
  const etPartsFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  const dayLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
  const dayYearLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
  const etYmd = ms => ymdFormat.format(new Date(ms))
  const ymdToUtc = ymd => {
    const [y, m, d] = ymd.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  const addDays = (ymd, days) => new Date(ymdToUtc(ymd) + days * 86_400_000).toISOString().slice(0, 10)
  const etOffsetMs = ms => {
    const parts = Object.fromEntries(etPartsFormat.formatToParts(new Date(ms)).map(part => [part.type, part.value]))
    return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second) - Math.floor(ms / 1000) * 1000
  }
  // ET 零点：先按 UTC 零点取当日偏移（-4h / -5h），夏令时切换日两次校正即可收敛
  const etMidnight = ymd => {
    const base = ymdToUtc(ymd)
    let guess = base - etOffsetMs(base)
    guess = base - etOffsetMs(guess)
    return guess
  }
  const fmtDay = ymd => dayLabel.format(new Date(ymdToUtc(ymd)))
  const fmtDayYear = ymd => dayYearLabel.format(new Date(ymdToUtc(ymd)))

  // 原型数据用固定种子，评审截图与刷新前后一致
  const rng = seed => () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const hashSeed = text => {
    let hash = 2166136261
    for (const ch of text) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619)
    return hash >>> 0
  }
  const randomChars = (random, length, alphabet) =>
    Array.from({ length }, () => alphabet[Math.floor(random() * alphabet.length)]).join('')
  const HEX = '0123456789abcdef'
  const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  /* =========================================================================
     0b · 浮层基础组件：menu / listbox / combobox 共用一套浮层（.pop，README §3.8）
     - 同一时间只开一个；顶层渲染（popover="manual"），按触发器定位：首选一侧放不下、另一侧更宽时翻转
       （例如靠近视口底部时向上弹出），左右夹在视口内，最大高度取所在一侧的剩余空间，超出时面板内部滚动。
     - 点击外部或焦点移出时关闭；Esc 由各模式处理（子面板先返回上一层）；从浮层内关闭时焦点回到触发器。
     - 进出、子面板横向滑动与高度变化只用 T2；减弱动效时直接切换。
     落地抽成无框架的 pop 模块（定位 / 开关 / 子面板）加 Menu、Listbox、Combobox 三个组件。
     ========================================================================= */
  const Pop = (() => {
    const GAP = 8 // 与触发器的间距（--s-2）
    const EDGE = 16 // 与视口边缘的最小距离（--s-4）
    const ITEMS = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]'
    const FOCUSABLE = 'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [tabindex="0"]'
    let cur = null
    let frame = 0

    const token = name => getComputedStyle(root).getPropertyValue(name).trim()
    const motion = () => (reducedMotion() ? null : { duration: parseFloat(token('--dur-3')) || 0, easing: token('--ease-out') || 'ease-out' })
    const isOpen = el => (el ? cur?.el === el : Boolean(cur))

    function place() {
      if (!cur) return
      const { el, opts } = cur
      const a = opts.anchor()
      if (!a) {
        close({ focus: false })
        return
      }
      const vw = root.clientWidth
      const vh = window.innerHeight
      if (opts.match) el.style.width = `${Math.round(Math.min(Math.max(a.width, opts.minWidth ?? 0), vw - 2 * EDGE))}px`
      const w = el.offsetWidth
      if (cur.side === 'right') {
        // 图标栏里的账户菜单：贴侧栏右侧，底边与触发器对齐（至少离视口底边 EDGE），向上展开
        const bottom = Math.max(EDGE, vh - a.bottom)
        el.style.setProperty('--pop-max', `${Math.round(vh - bottom - EDGE)}px`)
        el.style.left = `${Math.round(Math.min(a.right + GAP, vw - w - EDGE))}px`
        el.style.top = 'auto'
        el.style.bottom = `${Math.round(bottom)}px`
        return
      }
      const gap = opts.gap ?? GAP
      const room = { bottom: vh - a.bottom - gap - EDGE, top: a.top - gap - EDGE }
      if (!cur.resolved) {
        // 方向只在打开时决定：之后滚动或内容变化只更新坐标，不来回翻转。量自然高度时放开 --pop-max（仍受 --pop-cap 限制）
        el.style.setProperty('--pop-max', '100000px')
        const other = cur.side === 'top' ? 'bottom' : 'top'
        if (el.offsetHeight > room[cur.side] && room[other] > room[cur.side]) cur.side = other
        cur.resolved = true
        el.dataset.side = cur.side
      }
      el.style.setProperty('--pop-max', `${Math.round(Math.max(room[cur.side], 120))}px`)
      el.style.top = cur.side === 'bottom' ? `${Math.round(a.bottom + gap)}px` : 'auto'
      el.style.bottom = cur.side === 'top' ? `${Math.round(vh - a.top + gap)}px` : 'auto'
      const end = opts.align === 'end' || (opts.align === 'auto' && a.left + a.width / 2 > vw / 2)
      el.style.left = `${Math.round(clamp(end ? a.right - w : a.left, EDGE, vw - w - EDGE))}px`
    }

    /** opts：anchor() → 矩形；trigger() → 关闭后接回焦点的元素；owns(target) → 视作浮层一部分（不触发外部关闭）；
     *  side：'bottom' | 'top' | 'right'；align：'start' | 'end' | 'auto'；match：宽度跟随锚点；onClose。 */
    function open(el, opts) {
      if (cur?.el === el) return
      close({ focus: false })
      cur = { el, opts, side: opts.side ?? 'bottom', resolved: opts.side === 'right' }
      el.dataset.side = cur.side
      el.showPopover()
      place()
      opts.trigger?.()?.setAttribute('aria-expanded', 'true')
    }

    function close({ focus = true } = {}) {
      if (!cur) return
      const { el, opts } = cur
      cur = null
      cancelAnimationFrame(frame)
      frame = 0
      const trigger = opts.trigger?.()
      const inside = el.contains(document.activeElement)
      trigger?.setAttribute('aria-expanded', 'false')
      if (el.matches(':popover-open')) el.hidePopover()
      opts.onClose?.()
      if (focus && inside && trigger?.isConnected) trigger.focus({ preventScroll: true })
    }

    document.addEventListener(
      'pointerdown',
      event => {
        if (cur && !cur.el.contains(event.target) && !cur.opts.owns?.(event.target)) close({ focus: false })
      },
      true
    )
    document.addEventListener('focusin', event => {
      if (cur && !cur.el.contains(event.target) && !cur.opts.owns?.(event.target)) close({ focus: false })
    })
    window.addEventListener(
      'scroll',
      event => {
        if (!cur || frame || (event.target instanceof Node && cur.el.contains(event.target))) return
        frame = requestAnimationFrame(() => {
          frame = 0
          place()
        })
      },
      { capture: true, passive: true }
    )

    // 子面板切换：新面板从 dir 一侧滑入，旧面板向另一侧淡出，容器高度同步过渡（T2）
    function slide(next, dir) {
      const box = next.parentElement
      box._settle?.()
      const prev = $$(':scope > .pop-panel', box).find(panel => !panel.hidden)
      if (!prev || prev === next) return
      const from = box.offsetHeight
      prev.hidden = true
      next.hidden = false
      const m = motion()
      if (!m) return
      const to = box.offsetHeight
      prev.hidden = false
      prev.inert = true
      // 三段同时结束、都保持终态，直到 settle 一起撤掉，避免中间某一帧两个面板同时撑开容器
      const timing = { ...m, fill: 'forwards' }
      const anims = [
        box.animate([{ height: `${from}px` }, { height: `${to}px` }], timing),
        next.animate([{ transform: `translateX(${dir * 100}%)` }, { transform: 'none' }], timing),
        prev.animate([{ transform: 'none', opacity: 1 }, { transform: `translateX(${dir * -30}%)`, opacity: 0 }], timing)
      ]
      const settle = () => {
        box._settle = null
        anims.forEach(animation => animation.cancel())
        prev.hidden = true
        prev.inert = false
      }
      box._settle = settle
      anims[2].finished.then(() => box._settle === settle && settle(), () => {})
    }

    function resetPanels(el) {
      const box = $('.pop-panels', el)
      if (!box) return
      box._settle?.()
      $$(':scope > .pop-panel', box).forEach((panel, index) => {
        panel.hidden = index > 0
        panel.inert = false
      })
      for (const owner of $$('[aria-haspopup][aria-expanded="true"]', box)) owner.setAttribute('aria-expanded', 'false')
    }

    /* ---------------------------------------------------------------- menu（APG Menu Button，子菜单就地滑入） */
    function menu(el, cfg) {
      const panels = () => $$(':scope > .pop-panels > .pop-panel', el)
      const activePanel = () => panels().find(panel => !panel.hidden && !panel.inert) ?? panels()[0]
      const itemsIn = panel => $$(ITEMS, panel)
      const owner = () => $('[aria-haspopup][aria-expanded="true"]', panels()[0])
      let via = 'click'

      // 每次打开都从根面板开始（内容由 render 重建）；关闭时不复位，避免淡出途中面板跳回根层
      function open({ last = false } = {}) {
        if (isOpen(el)) return
        cfg.render()
        resetPanels(el)
        const side = typeof cfg.side === 'function' ? cfg.side() : cfg.side
        Pop.open(el, { ...cfg, side })
        const items = itemsIn(panels()[0])
        ;(last ? items.at(-1) : (cfg.initial?.(items) ?? items[0]))?.focus()
      }

      function enter(item) {
        const target = $(`#${CSS.escape(item.getAttribute('aria-controls'))}`, el)
        const panel = target?.closest('.pop-panel')
        if (!panel) return
        item.setAttribute('aria-expanded', 'true')
        slide(panel, 1)
        const focus = $('[aria-checked="true"], [data-autofocus]', panel) ?? itemsIn(panel)[0] ?? $(FOCUSABLE, panel)
        focus?.focus({ preventScroll: true })
        focus?.scrollIntoView({ block: 'nearest' })
      }

      function back() {
        const item = owner()
        if (!item) return false
        item.setAttribute('aria-expanded', 'false')
        slide(panels()[0], -1)
        item.focus({ preventScroll: true })
        return true
      }

      el.addEventListener('keydown', event => {
        if (!isOpen(el)) return
        const item = event.target.closest(ITEMS)
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          if (!back()) close()
          return
        }
        if (event.key === 'Tab') {
          // 菜单里 Tab 关闭菜单、焦点从触发器继续；表单子面板只在首尾越界时关闭
          const focusables = $$(FOCUSABLE, activePanel())
          if (item || event.target === (event.shiftKey ? focusables[0] : focusables.at(-1))) close()
          return
        }
        if (!item) return
        const items = itemsIn(activePanel())
        const index = items.indexOf(item)
        const go = to => {
          event.preventDefault()
          items[(to + items.length) % items.length]?.focus()
        }
        switch (event.key) {
          case 'ArrowDown':
            go(index + 1)
            return
          case 'ArrowUp':
            go(index - 1)
            return
          case 'Home':
            go(0)
            return
          case 'End':
            go(items.length - 1)
            return
          case 'ArrowRight':
          case 'ArrowLeft': {
            // 横排的单选组（主题）：左右在组内移动；其余左键返回上一层、右键打开子菜单
            const row = item.closest('[data-pop-row]')
            if (row) {
              const group = $$(ITEMS, row)
              const at = group.indexOf(item) + (event.key === 'ArrowRight' ? 1 : -1)
              event.preventDefault()
              group[(at + group.length) % group.length].focus()
            } else if (event.key === 'ArrowRight' && item.hasAttribute('aria-haspopup')) {
              event.preventDefault()
              enter(item)
            } else if (event.key === 'ArrowLeft' && back()) event.preventDefault()
            return
          }
          case 'Enter':
          case ' ':
            event.preventDefault()
            via = event.key === 'Enter' ? 'enter' : 'space'
            item.click()
        }
      })

      el.addEventListener('click', event => {
        const how = via
        via = 'click'
        if (event.target.closest('[data-pop-back]')) {
          back()
          return
        }
        const item = event.target.closest(ITEMS)
        if (!item) return
        if (item.getAttribute('aria-disabled') === 'true') {
          event.preventDefault()
          return
        }
        if (item.hasAttribute('aria-haspopup')) {
          event.preventDefault()
          enter(item)
          return
        }
        // 菜单项返回 'stay' 时保持打开（多组菜单里点选单选项）；Enter 按 APG 总是激活并关闭
        if (cfg.onSelect(item, how, event) !== 'stay' || how === 'enter') close()
      })

      return { open, toggle: () => (isOpen(el) ? close() : open()), isOpen: () => isOpen(el) }
    }

    /* ---------------------------------------------------------------- listbox（按钮 + 弹出 listbox，少量固定选项） */
    function listbox(el, cfg) {
      const list = $('[role="listbox"]', el)
      const options = () => $$('[role="option"]:not([aria-disabled="true"])', list)

      function open() {
        cfg.render(list)
        Pop.open(el, { ...cfg, match: true })
        const all = options()
        ;(all.find(option => option.getAttribute('aria-selected') === 'true') ?? all[0])?.focus()
      }

      function choose(option) {
        close()
        cfg.onSelect(option.dataset.value)
      }

      list.addEventListener('keydown', event => {
        const all = options()
        const index = all.indexOf(event.target.closest('[role="option"]'))
        const go = to => {
          event.preventDefault()
          all[clamp(to, 0, all.length - 1)]?.focus()
        }
        switch (event.key) {
          case 'ArrowDown':
            go(index + 1)
            return
          case 'ArrowUp':
            go(index - 1)
            return
          case 'Home':
            go(0)
            return
          case 'End':
            go(all.length - 1)
            return
          case 'Enter':
          case ' ':
            event.preventDefault()
            if (index >= 0) choose(all[index])
            return
          case 'Escape':
            event.preventDefault()
            event.stopPropagation()
            close()
            return
          case 'Tab':
            close()
        }
      })
      list.addEventListener('click', event => {
        const option = event.target.closest('[role="option"]')
        if (option && option.getAttribute('aria-disabled') !== 'true') choose(option)
      })

      return { open, toggle: () => (isOpen(el) ? close() : open()) }
    }

    /* ---------------------------------------------------------------- combobox（可输入过滤，选项多时用） */
    // mode 'value'：持有一个值（国家、州），失焦时文本精确匹配则选中，否则恢复为当前值；
    // mode 'action'：选中即执行（城市加入已选地点），输入框随即清空。
    function combobox(cfg) {
      const { input, toggle, field, pop } = cfg
      const list = $('[role="listbox"]', pop)
      let matches = []
      let active = -1
      let typed = false

      const optionId = index => `${list.id}-${index}`

      function setActive(index) {
        const prev = list.querySelector('.is-active')
        prev?.classList.remove('is-active')
        prev?.setAttribute('aria-selected', 'false')
        active = index
        const next = index >= 0 ? $(`#${optionId(index)}`, list) : null
        if (!next) {
          input.removeAttribute('aria-activedescendant')
          return
        }
        next.classList.add('is-active')
        next.setAttribute('aria-selected', 'true')
        input.setAttribute('aria-activedescendant', next.id)
        next.scrollIntoView({ block: 'nearest' })
      }

      // 返回 false 表示输入不足 minChars，不显示列表
      function refresh() {
        const q = typed ? input.value.trim() : ''
        if (q.length < (cfg.minChars ?? 0)) {
          matches = []
          if (isOpen(pop)) close({ focus: false })
          return false
        }
        matches = cfg.source(q)
        list.innerHTML = matches.length
          ? matches
              .map(
                (match, index) =>
                  `<li class="pop-item${match.current ? ' is-current' : ''}" role="option" id="${optionId(index)}" aria-selected="false" data-index="${index}">` +
                  `<span class="pop-item-label">${esc(match.label)}</span>${match.sub ? `<span class="pop-item-sub">${esc(match.sub)}</span>` : ''}` +
                  `${icon('check', 'pop-check')}</li>`
              )
              .join('')
          : `<li class="pop-empty" role="option" aria-disabled="true">${esc(cfg.empty)}</li>`
        active = -1
        if (matches.length) setActive(typed ? 0 : Math.max(0, matches.findIndex(match => match.current)))
        else input.removeAttribute('aria-activedescendant')
        return true
      }

      function show() {
        if (!isOpen(pop)) {
          Pop.open(pop, {
            anchor: () => (field.isConnected ? field.getBoundingClientRect() : null),
            trigger: () => input,
            owns: target => field.contains(target),
            side: 'bottom',
            align: 'start',
            match: true,
            minWidth: 220,
            gap: 4,
            onClose: () => {
              toggle?.setAttribute('aria-expanded', 'false')
              input.removeAttribute('aria-activedescendant')
              active = -1
            }
          })
        }
        toggle?.setAttribute('aria-expanded', 'true')
        if (active >= 0) $(`#${optionId(active)}`, list)?.scrollIntoView({ block: 'nearest' })
      }

      function choose(index) {
        const match = matches[index]
        if (!match) return
        typed = false
        if (isOpen(pop)) close({ focus: false })
        input.value = cfg.mode === 'action' ? '' : cfg.label(match.value)
        cfg.onSelect(match)
      }

      // 失焦：精确匹配则选中，否则恢复当前值（允许空值的字段清空即选「全部」）
      function commit() {
        if (cfg.mode !== 'value') return
        if (typed) {
          typed = false
          const q = input.value.trim().toLowerCase()
          const exact = q ? cfg.source(q).find(match => match.label.toLowerCase() === q) : cfg.allowEmpty ? { value: '' } : null
          if (exact && exact.value !== cfg.value()) {
            input.value = cfg.label(exact.value)
            cfg.onSelect(exact)
            return
          }
        }
        input.value = cfg.label(cfg.value())
      }

      input.addEventListener('input', () => {
        typed = true
        if (refresh()) show()
      })
      input.addEventListener('keydown', event => {
        if (event.isComposing) return
        const open = isOpen(pop)
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowUp':
            event.preventDefault()
            if (!open) {
              if (!event.altKey || event.key === 'ArrowDown') refresh() && show()
              return
            }
            if (event.altKey) {
              if (event.key === 'ArrowUp') close({ focus: false })
              return
            }
            if (matches.length) {
              const step = event.key === 'ArrowDown' ? 1 : -1
              setActive(active < 0 ? (step > 0 ? 0 : matches.length - 1) : (active + step + matches.length) % matches.length)
            }
            return
          case 'Enter':
            if (open) {
              event.preventDefault()
              if (active >= 0) choose(active)
            }
            return
          case 'Escape':
            if (open) {
              event.preventDefault()
              event.stopPropagation()
              close({ focus: false })
              if (cfg.mode === 'value') {
                typed = false
                input.value = cfg.label(cfg.value())
              }
            }
        }
      })
      input.addEventListener('click', () => {
        if (cfg.mode === 'value' && !isOpen(pop) && refresh()) show()
      })
      input.addEventListener('blur', commit)
      // 列表与展开按钮不抢焦点：输入框始终持有焦点，选项用 aria-activedescendant 指示
      list.addEventListener('pointerdown', event => event.preventDefault())
      list.addEventListener('click', event => {
        const option = event.target.closest('[data-index]')
        if (option) choose(Number(option.dataset.index))
      })
      toggle?.addEventListener('pointerdown', event => event.preventDefault())
      toggle?.addEventListener('click', () => {
        if (input.disabled) return
        if (isOpen(pop)) close({ focus: false })
        else {
          typed = false
          if (refresh()) show()
        }
        input.focus()
      })

      return {
        // 外部改了当前值（换国家、重置）后同步输入框文本
        sync() {
          if (document.activeElement !== input || !typed) input.value = cfg.label(cfg.value())
        },
        clear() {
          typed = false
          input.value = ''
          if (isOpen(pop)) close({ focus: false })
        }
      }
    }

    return { open, close, place, isOpen, slide, menu, listbox, combobox }
  })()

  /* =========================================================================
     1 · 文案（英文占位）
     未标注的键取自 website/src/i18n/dashboard.ts；标注「新增」的键见 README §11。
     ========================================================================= */
  const T = {
    seo: { title: 'Dashboard | MapsGrab' },
    shell: {
      loading: 'Loading your workspace...',
      retry: 'Retry',
      navOnline: 'Online Scraper', // 改名：原 navHistory（值不变），见 README §11
      navJobHistory: 'History', // 新增
      navApi: 'API management',
      navSubscriptions: 'Subscriptions',
      openMenu: 'Open workspace menu',
      closeMenu: 'Close workspace menu',
      collapseSidebar: 'Collapse sidebar', // 新增
      expandSidebar: 'Expand sidebar', // 新增
      back: 'Back' // 新增：浮层子面板的返回按钮
    },
    account: {
      menuButtonLabel: 'Open account menu',
      menuLabel: 'Account menu',
      logout: 'Log out',
      upgrade: 'Upgrade', // 新增
      usageShort: '{used} / {total} records', // 新增
      planUnavailable: 'Unavailable', // 新增
      theme: 'Theme', // 新增
      themeLight: 'Light', // 新增
      themeDark: 'Dark', // 新增
      themeSystem: 'System', // 新增
      language: 'Language' // 新增（可复用站级 langLabel）
    },
    create: {
      count: '{count} / {limit} keywords',
      optionsFailed: 'Could not load your task limits. Please retry.',
      contactsPaid: 'Available with a paid Online plan.',
      usage: '{used} / {total} records this month',
      reset: 'Monthly quota resets on the 1st in New York time.',
      submit: 'Start scraping',
      submitting: 'Submitting...',
      failed: 'Task submission failed. Refresh the history before trying again.',
      exhausted: 'Your monthly quota is exhausted.',
      invalid: 'Enter up to {limit} keywords, each no longer than 500 characters.',
      duplicates: 'Duplicate lines ignored: {count}', // 新增
      submitted: 'Task submitted', // 新增
      map: {
        sampleCount: '{count} / {limit} search locations',
        overLimit: 'Reduce the radius or increase grid spacing to stay within {limit} search locations.',
        chooseCenter: 'Choose a center on the map or enter coordinates.',
        points: 'Grid points: {points} · Keywords: {keywords}' // 新增
      },
      region: {
        allStates: 'All states or regions',
        loading: 'Loading locations...',
        loadFailed: 'Locations could not load. Please retry.',
        retry: 'Retry',
        remove: 'Remove {name}',
        noMatch: 'No matches' // 改名：原 noCity（No matching cities），国家 / 州 / 城市三个 combobox 共用
      }
    },
    history: {
      title: 'Online export history',
      refresh: 'Refresh',
      loadFailed: 'Failed to load your export history.',
      retry: 'Retry',
      emptyTitle: 'No exports yet',
      emptyHint: 'Run a task on the Online Scraper and it will show up here.',
      columns: { taskNo: 'Job', createdAt: 'Created (ET)', samples: 'Searches', records: 'Records', status: 'Status' },
      status: {
        queued: 'Queued',
        collecting: 'Collecting',
        publishing: 'Preparing CSV',
        completed: 'Completed',
        partial: 'Partial success',
        failed: 'Failed'
      },
      timezone: 'ET',
      pagination: {
        previous: 'Previous',
        next: 'Next',
        summary: '{from}–{to} of {total}',
        label: 'Pagination', // 新增
        page: 'Page {page}', // 新增
        pageSize: 'Rows per page' // 新增
      },
      detail: {
        show: 'Details',
        loadFailed: 'Failed to load searches for this task.',
        keyword: 'Keyword',
        records: 'Records',
        runNo: 'Run',
        startedAt: 'Started (ET)',
        finishedAt: 'Finished (ET)',
        contacts: 'Emails and social profiles',
        contactsEnabled: 'Enabled for this task',
        contactsDisabled: 'Off for this task',
        completed: 'Completed',
        pending: 'Pending',
        viewport: '{lat}, {lng} · zoom {zoom}'
      },
      downloadCsv: 'Download CSV',
      noFile: 'No CSV',
      errors: {
        31301: 'Could not collect this search.',
        31302: 'Some results are unavailable. Delivered rows are retained.',
        31303: 'The collector is busy. Try again.',
        31304: 'Could not publish this export.'
      },
      errorFailed: 'Could not complete this search.',
      downloading: 'Preparing...',
      downloadUnavailable: 'No downloadable CSV. The file may have expired.',
      downloadFailed: 'The download could not be started. Please try again.',
      signInPrompt: 'Sign in to see your Online export history.',
      signInCta: 'Sign in',
      unreachable: 'Could not reach MapsGrab right now.',
      autoRefresh: 'Auto-refresh on', // 新增
      refreshFailed: 'Could not refresh. Showing the last loaded results.', // 新增
      copyJob: 'Copy job number', // 新增
      finished: 'Task {job}: {status}', // 新增
      finishedRecords: '{count} records', // 新增
      dedupeHint: 'Records are counted after duplicates are removed across the whole task.', // 新增
      description: 'Tasks you ran on the Online Scraper, newest first. Times are shown in Eastern Time (New York).',
      recentTitle: 'Recent tasks', // 新增
      viewAll: 'View all', // 新增
      recentEmptyHint: 'Tasks you start above will show up here.', // 新增
      emptyCta: 'Go to Online Scraper', // 新增
      moreKeywordsShort: '+{count}', // 新增
      moreKeywords: 'and {count} more', // 新增（读屏）
      search: {
        label: 'Search tasks', // 新增
        placeholder: 'Search by job number or keyword', // 新增
        clear: 'Clear search' // 新增
      },
      filters: {
        label: 'Filter tasks', // 新增
        button: 'Filters', // 新增
        status: 'Status', // 新增
        all: 'All', // 新增
        running: 'Running', // 新增（= queued + collecting + publishing）
        clear: 'Clear filters' // 新增
      },
      range: {
        label: 'Time range', // 新增
        last7: 'Last 7 days', // 新增
        last30: 'Last 30 days', // 新增
        all: 'All time', // 新增
        custom: 'Custom range', // 新增
        from: 'From', // 新增
        to: 'To', // 新增
        apply: 'Apply', // 新增
        invalid: 'Choose a start date on or before the end date.', // 新增
        hint: 'Dates use Eastern Time (New York).' // 新增
      },
      noMatchTitle: 'No matching tasks', // 新增
      noMatchHint: 'Try a different job number or keyword, or clear the filters.' // 新增
    },
    api: {
      description: 'Manage your API key, monthly request allowance and connected AI apps.',
      docsLink: 'View API products',
      signInPrompt: 'Sign in to manage your API access.',
      loadFailed: 'Could not load your API access. Please try again.',
      retry: 'Retry',
      refresh: 'Refresh',
      keyTitle: 'API key',
      keyEmpty: 'You have not generated an API key yet.',
      generateKey: 'Generate API key',
      rotateKey: 'Replace API key',
      generatingKey: 'Generating...',
      keyOnce: 'Copy this key now. You will not be able to view it again after leaving or refreshing this page.',
      keyCreated: 'Created',
      rotateTitle: 'Replace your API key?',
      rotateMessage: 'Your current key will stop working immediately. Update any apps that use it with the new key.',
      cancel: 'Cancel',
      copyKey: 'Copy API key',
      copied: 'Copied',
      copyFailed: 'Could not copy. Select the text and copy it manually.',
      keyFailed: 'Could not generate an API key. Please try again.',
      usageTitle: 'Monthly API usage',
      usageFailed: 'Could not load your API usage. Please try again.', // 新增
      usageValue: '{used} / {total} requests',
      usagePeriod: 'Period: {period}',
      quotaExhausted: 'Your monthly request allowance is exhausted.',
      quotaReset: 'Resets on the 1st of each month in New York time. API and MCP share this allowance.',
      planTitle: 'API plan',
      managePlan: 'Manage subscriptions',
      connectionsTitle: 'Connection addresses',
      apiUrl: 'API base URL',
      mcpUrl: 'MCP server URL',
      mcpHint: 'Add this URL in your MCP client. Sign in and approve the connection when it opens this website.',
      mcpUnavailable: 'The MCP connection address is not available yet.',
      copyUrl: 'Copy URL',
      grants: {
        title: 'Connected apps',
        description: 'Apps you have allowed to search businesses and read reviews and public photos using your API allowance.',
        empty: 'No apps are connected.',
        loadFailed: 'Could not load connected apps. Please try again.',
        selfDeclared: 'Name the app gives itself: {name}',
        createdLabel: 'Connected (ET)',
        refreshedLabel: 'Last refreshed (ET)',
        notRefreshed: 'Not yet',
        paginationLabel: 'Connected apps pages',
        pageOf: 'Page {page} of {pages}',
        revoke: 'Disconnect',
        revokeTitle: 'Disconnect this app?',
        revokeMessage: '{host} will lose access immediately and will need your approval to connect again.',
        revokeFailed: 'Could not disconnect this app. Please try again.'
      }
    },
    subscriptions: {
      title: 'Subscriptions',
      description: 'Plans and renewal status for the Online Scraper, the browser extension and the API. Buy or upgrade on the Pricing page.',
      lines: { online: 'Online Scraper', extension: 'Browser Extension', api: 'API' },
      planLabel: 'Plan',
      expiresLabel: 'Renews / expires',
      free: 'Free',
      unavailable: 'Temporarily unavailable',
      autoRenewOn: 'Auto-renewal on',
      autoRenewOff: 'Auto-renewal off',
      subscribeCta: 'Choose a plan',
      manageSubscription: 'Manage subscription',
      managingSubscription: 'Opening...',
      signInPrompt: 'Sign in to see your subscriptions.',
      pricingLink: 'View pricing', // 新增
      paidVia: 'Paid via {method}', // 新增
      manageFailed: 'Could not open subscription management. Please try again.' // 新增（替代现状复用的 loadFailed）
    }
  }

  // 与 website/src/i18n/ui.ts 的 locales / localeNames 同序同名（站点头部语言切换器用的同一份清单）
  const LOCALES = [
    ['zh-CN', '简体中文'], ['en-US', 'English'], ['ja-JP', '日本語'], ['ko-KR', '한국어'], ['zh-TW', '繁體中文'],
    ['es-ES', 'Español'], ['pt-BR', 'Português'], ['de-DE', 'Deutsch'], ['fr-FR', 'Français'], ['ru-RU', 'Русский'],
    ['it-IT', 'Italiano'], ['vi-VN', 'Tiếng Việt'], ['th-TH', 'ไทย'], ['id-ID', 'Bahasa Indonesia']
  ]
  const CURRENT_LOCALE = 'en-US'

  /* =========================================================================
     2 · 原型参数（地址栏）：view / subs / state / quota / sim / motion
     ========================================================================= */
  const VIEWS = ['online', 'history', 'api', 'subscriptions']
  const VIEW_TITLE = { online: T.shell.navOnline, history: T.shell.navJobHistory, api: T.shell.navApi, subscriptions: T.shell.navSubscriptions }
  const PROTO_DEFAULTS = { combo: 'online', state: 'ready', quota: 'normal', sim: 'on', motion: 'full' }
  const PROTO_PARAM = { combo: 'subs', state: 'state', quota: 'quota', sim: 'sim', motion: 'motion' }
  const PROTO_VALUES = {
    combo: ['none', 'online', 'multi', 'unavailable'],
    state: ['ready', 'loading', 'signedout', 'offline', 'empty', 'errors'],
    quota: ['normal', 'near', 'exhausted'],
    sim: ['on', 'off'],
    motion: ['full', 'reduced']
  }
  const params = new URLSearchParams(location.search)
  const proto = {}
  for (const key of Object.keys(PROTO_DEFAULTS)) {
    const value = params.get(PROTO_PARAM[key])
    proto[key] = PROTO_VALUES[key].includes(value) ? value : PROTO_DEFAULTS[key]
  }

  /*
   * History 查询（筛选 + 页码）同步到地址栏，刷新后保持；非默认值才写入：
   * q（任务号或关键词）/ status（all|running|completed|partial|failed）/ range（7d|30d|all|custom）
   * from / to（custom 时的 ET 日历日，含两端）/ page / size（20|50|100）
   */
  const HIST_DEFAULTS = { q: '', status: 'all', range: 'all', from: '', to: '', page: 1, size: 20 }
  const HIST_STATUSES = ['all', 'running', 'completed', 'partial', 'failed']
  const HIST_RANGES = ['7d', '30d', 'all', 'custom']
  const PAGE_SIZES = [20, 50, 100]
  const YMD = /^\d{4}-\d{2}-\d{2}$/

  function readHistQuery(search) {
    const source = new URLSearchParams(search)
    const status = source.get('status')
    const size = Number(source.get('size'))
    const query = {
      q: (source.get('q') ?? '').trim().slice(0, 100),
      status: HIST_STATUSES.includes(status) ? status : 'all',
      range: HIST_RANGES.includes(source.get('range')) ? source.get('range') : 'all',
      from: source.get('from') ?? '',
      to: source.get('to') ?? '',
      page: Math.max(1, Math.floor(Number(source.get('page'))) || 1),
      size: PAGE_SIZES.includes(size) ? size : HIST_DEFAULTS.size
    }
    const customOk = query.range === 'custom' && YMD.test(query.from) && YMD.test(query.to) && query.from <= query.to
    if (query.range === 'custom' && !customOk) query.range = 'all'
    if (query.range !== 'custom') query.from = query.to = ''
    return query
  }

  const histQuery = readHistQuery(location.search)

  const urlFor = (view, hq = histQuery) => {
    const next = new URLSearchParams()
    if (view !== 'online') next.set('view', view)
    if (view === 'history') {
      for (const key of Object.keys(HIST_DEFAULTS)) {
        if (hq[key] !== HIST_DEFAULTS[key]) next.set(key, String(hq[key]))
      }
    }
    for (const key of Object.keys(PROTO_DEFAULTS)) {
      if (proto[key] !== PROTO_DEFAULTS[key]) next.set(PROTO_PARAM[key], proto[key])
    }
    const query = next.toString()
    return location.pathname + (query ? `?${query}` : '')
  }

  /* =========================================================================
     3 · Mock 数据（原型专用）
     ========================================================================= */
  const NOW = Date.now()
  const MIN = 60_000
  const HOUR = 60 * MIN
  const DAY = 24 * HOUR
  const RECENT_LIMIT = 5
  const GRANTS_PAGE_SIZE = 20
  const LOGICAL_SAMPLE_LIMIT = 50
  const PORTLAND = { lat: 45.5152, lng: -122.6784 }
  const USER = { full_name: 'Avery Chen', email: 'avery.chen@example.com' }

  // auth/me 三线订阅摘要：有效订阅 = active 且有到期时间；unavailable 为配置异常，不得伪装成未订阅
  const FREE_SUB = { status: 'active', period: 'free', display_name: 'Free', expires_at: null, auto_renew: false, payment_method: null }
  const UNAVAILABLE_SUB = { status: 'unavailable', period: 'unavailable', display_name: '', expires_at: null, auto_renew: false, payment_method: null }
  const paidSub = (displayName, days, paymentMethod, autoRenew = false) => ({
    status: 'active',
    period: 'month',
    display_name: displayName,
    expires_at: NOW + days * DAY,
    auto_renew: autoRenew,
    payment_method: paymentMethod
  })
  const isActiveSub = sub => sub.status === 'active' && sub.expires_at != null

  // 关键词档位：Free 2 / Lite 5 / Basic 10 / Growth 20 / Pro 50；Online 以 records 计量
  const COMBOS = {
    none: {
      subs: { online: FREE_SUB, extension: FREE_SUB, api: FREE_SUB },
      online: { keyword_limit: 2, contacts_allowed: false, used: 640, total: 1000 },
      api: { used: 7, total: 20 }
    },
    online: {
      subs: { online: paidSub('Online Basic', 23, 'paypal'), extension: FREE_SUB, api: FREE_SUB },
      online: { keyword_limit: 10, contacts_allowed: true, used: 12480, total: 80000 },
      api: { used: 7, total: 20 }
    },
    multi: {
      subs: {
        online: paidSub('Online Growth', 18, 'paypal'),
        extension: paidSub('Maps Pro', 12, 'clink', true),
        api: paidSub('API Professional', 25, 'paypal')
      },
      online: { keyword_limit: 20, contacts_allowed: true, used: 61840, total: 250000 },
      api: { used: 1284, total: 5000 }
    },
    // 配置异常：Online 与 API 两条线的订阅摘要都不可用（API 合卡只有头部受影响，用量区照常）
    unavailable: {
      subs: { online: UNAVAILABLE_SUB, extension: paidSub('Maps Pro', 12, 'clink', true), api: UNAVAILABLE_SUB },
      online: null,
      api: { used: 7, total: 20 }
    }
  }

  /** 与 website/src/scripts/dashboard/map-grid.ts 同算法（原样移植）。 */
  function gridViewports(center, radiusKm, spacingKm) {
    const zoom = Math.max(1, Math.min(21, Math.round(14 + Math.log2(10 / spacingKm))))
    const steps = Math.floor(radiusKm / spacingKm)
    const latStep = spacingKm / 111.32
    const lngStep = spacingKm / (111.32 * Math.cos((center.lat * Math.PI) / 180))
    const points = []
    for (let dy = -steps; dy <= steps; dy++) {
      for (let dx = -steps; dx <= steps; dx++) {
        const distance = Math.hypot(dx, dy)
        if (distance * spacingKm > radiusKm + 1e-9) continue
        const lat = center.lat + dy * latStep
        if (Math.abs(lat) > 90) continue
        const rawLng = center.lng + dx * lngStep
        const lng = ((((rawLng + 180) % 360) + 360) % 360) - 180
        points.push({ lat, lng, distance, dx, dy })
      }
    }
    points.sort((a, b) => a.distance - b.distance || a.dy - b.dy || a.dx - b.dx)
    return points.map(point => ({ lat: point.lat, lng: point.lng, zoom }))
  }

  const OLDER_SETS = [
    ['hair salon in Chicago, IL', 'barber shop in Chicago, IL', 'nail salon in Chicago, IL'],
    ['yoga studio in San Diego, CA', 'pilates studio in San Diego, CA'],
    ['real estate agency in Miami, FL'],
    ['auto repair in Dallas, TX', 'tire shop in Dallas, TX', 'car wash in Dallas, TX', 'auto parts store in Dallas, TX'],
    ['veterinarian in Boston, MA', 'pet groomer in Boston, MA'],
    ['roofing contractor in Atlanta, GA', 'gutter cleaning in Atlanta, GA'],
    ['italian restaurant in Brooklyn, NY', 'pizza in Brooklyn, NY', 'wine bar in Brooklyn, NY'],
    { keywords: ['gym'], center: { lat: 39.7392, lng: -104.9903 }, radius: 4, spacing: 2 },
    ['dentist in Seattle, WA', 'orthodontist in Seattle, WA'],
    ['coworking space in Austin, TX'],
    ['bakery near Toronto, Ontario, CA', 'cafe near Toronto, Ontario, CA'],
    ['landscaping in Phoenix, AZ', 'pool cleaning in Phoenix, AZ'],
    ['electrician in Nashville, TN'],
    ['bookstore in Portland, OR', 'record store in Portland, OR'],
    ['physiotherapy in London, England, GB', 'chiropractor in London, England, GB'],
    ['hotel in New Orleans, LA'],
    ['moving company in Houston, TX', 'storage facility in Houston, TX'],
    ['florist in Minneapolis, MN']
  ]
  // 更早的任务按固定种子生成：行业 × 城市，约 90 天内分布，覆盖完成 / 部分成功 / 失败 / 零结果 / 文件过期
  const GEN_CATEGORIES = [
    'dentist', 'plumber', 'electrician', 'hvac contractor', 'law firm', 'accountant', 'insurance agency', 'car dealership',
    'daycare', 'tutoring center', 'printing service', 'furniture store', 'pharmacy', 'sushi restaurant', 'coffee shop',
    'bakery', 'physical therapy', 'pet groomer', 'yoga studio', 'roofing contractor', 'wedding venue', 'bike shop'
  ]
  const GEN_CITIES = [
    'Charlotte, NC', 'Columbus, OH', 'Kansas City, MO', 'Salt Lake City, UT', 'Raleigh, NC', 'Tampa, FL', 'Las Vegas, NV',
    'San Jose, CA', 'Pittsburgh, PA', 'St. Louis, MO', 'Baltimore, MD', 'Milwaukee, WI', 'Austin, TX', 'Denver, CO',
    'Seattle, WA', 'Portland, OR', 'Chicago, IL', 'Boston, MA'
  ]
  const GENERATED_COUNT = 36

  /** 62 个任务覆盖全部状态：排队 / 采集 / 生成 CSV / 部分成功 / 完成 / 零结果 / 失败 / 文件过期。 */
  function buildJobs(combo) {
    const random = rng(20261022)
    const free = combo === 'none'
    const newNo = () => randomChars(random, 32, HEX) + '07'
    const jobs = []
    const add = spec => {
      // Free 档最多 2 个关键词：历史任务也按当前组合裁剪，保证原型自洽
      const keywords = free ? spec.keywords.slice(0, 2) : spec.keywords
      const pairs = spec.viewports
        ? keywords.flatMap(keyword => spec.viewports.map(viewport => [keyword, viewport]))
        : keywords.map(keyword => [keyword, null])
      const items = pairs.map(([keyword, viewport], index) => {
        const result = spec.results?.[index]
        const error = spec.errors?.[index] ?? null
        return {
          item_index: index,
          keyword,
          viewport,
          result_count: result ?? 0,
          completed: result !== undefined || error !== null,
          error_code: error
        }
      })
      const createdAt = NOW - spec.ago
      const terminal = ['completed', 'partial', 'failed'].includes(spec.status)
      const recordCount = spec.status === 'failed' ? 0 : items.reduce((sum, item) => sum + item.result_count, 0)
      jobs.push({
        job_no: newNo(),
        run_no: newNo(),
        status: spec.status,
        include_contacts: !free && spec.contacts !== false,
        total_count: items.length,
        processed_count: items.filter(item => item.completed).length,
        record_count: recordCount,
        has_file: (spec.status === 'completed' || spec.status === 'partial') && recordCount > 0,
        created_at: createdAt,
        started_at: spec.status === 'queued' ? null : createdAt + 38_000,
        finished_at: terminal ? createdAt + (spec.duration ?? 7 * MIN) : null,
        error_code: spec.jobError ?? null,
        items,
        expired: Boolean(spec.expired)
      })
    }

    add({ ago: 2 * MIN, status: 'queued', keywords: ['dentist in Austin, TX', 'orthodontist in Austin, TX'] })
    add({
      ago: 6 * MIN,
      status: 'collecting',
      keywords: ['coffee shop in Portland, OR', 'bakery in Portland, OR', 'tea house in Portland, OR', 'juice bar in Portland, OR', 'donut shop in Portland, OR'],
      results: [74, 41]
    })
    add({
      ago: 25 * MIN,
      status: 'publishing',
      keywords: ['coffee shop'],
      viewports: gridViewports(PORTLAND, 8, 4),
      results: [41, 33, 28, 30, 25, 29, 22, 27, 24, 21, 20, 19, 22]
    })
    add({
      ago: 2 * HOUR + 14 * MIN,
      status: 'partial',
      keywords: ['plumber in Denver, CO', 'plumber in Aurora, CO', 'plumber in Lakewood, CO', 'plumber in Boulder, CO', 'plumber in Littleton, CO'],
      results: [58, 0, 61, 49, 44],
      errors: { 1: 31301 },
      jobError: 31302
    })
    add({
      ago: 26 * HOUR,
      status: 'completed',
      keywords: ['plumber in Seattle, Washington, US', 'plumber in Spokane, Washington, US', 'plumber in Tacoma, Washington, US'],
      results: [41, 22, 24],
      contacts: false
    })
    add({ ago: 2 * DAY + 3 * HOUR, status: 'completed', keywords: ['vegan butcher in Nome, AK'], results: [0], duration: 2 * MIN })
    add({
      ago: 3 * DAY + 5 * HOUR,
      status: 'failed',
      keywords: ['florist in Miami, FL', 'florist in Tampa, FL', 'florist in Orlando, FL'],
      results: [58, 33, 40],
      jobError: 31304
    })
    add({
      ago: 9 * DAY + 2 * HOUR,
      status: 'completed',
      keywords: ['car wash in Phoenix, AZ', 'auto detailing in Phoenix, AZ'],
      results: [88, 68],
      expired: true
    })

    // 10–92 天前：精选 18 组与生成 36 组交错排列，时间单调递减
    const older = OLDER_SETS.map(set => (Array.isArray(set) ? { keywords: set } : set))
    for (let index = 0; index < GENERATED_COUNT; index += 1) {
      const pick = list => list[Math.floor(random() * list.length)]
      const city = pick(GEN_CITIES)
      const category = pick(GEN_CATEGORIES)
      const count = 1 + Math.floor(random() * 4)
      // 一半是「同一行业 × 多个城市」，一半是「同一城市 × 多个行业」
      const keywords =
        index % 2 === 0
          ? [...new Set(Array.from({ length: count }, () => `${category} in ${pick(GEN_CITIES)}`))]
          : [...new Set(Array.from({ length: count }, () => `${pick(GEN_CATEGORIES)} in ${city}`))]
      const roll = random()
      const status = roll < 0.1 ? 'failed' : roll < 0.22 ? 'partial' : 'completed'
      older.splice(1 + Math.floor(random() * older.length), 0, { keywords, status, zero: status === 'completed' && random() < 0.06 })
    }
    older.forEach((spec, index) => {
      const viewports = spec.center ? gridViewports(spec.center, spec.radius, spec.spacing) : null
      const count = (free ? Math.min(spec.keywords.length, 2) : spec.keywords.length) * (viewports ? viewports.length : 1)
      const status = spec.status ?? 'completed'
      const results = Array.from({ length: count }, () => (spec.zero ? 0 : (viewports ? 6 : 18) + Math.floor(random() * (viewports ? 40 : 120))))
      const errors = {}
      if (status === 'partial') errors[Math.floor(random() * count)] = 31301
      const ago = 10 * DAY + index * 1.52 * DAY + Math.floor(random() * 6) * HOUR
      add({
        ago,
        status,
        keywords: spec.keywords,
        viewports,
        results: status === 'partial' ? results.map((value, item) => (item in errors ? 0 : value)) : results,
        errors: status === 'partial' ? errors : undefined,
        jobError: status === 'partial' ? 31302 : status === 'failed' ? (index % 2 ? 31303 : 31304) : undefined,
        contacts: random() > 0.25,
        duration: (4 + Math.floor(random() * 30)) * MIN,
        // 原型示意：两个月前的部分文件已被对象存储清理，下载返回 404
        expired: ago > 60 * DAY && random() < 0.35
      })
    })
    return jobs
  }

  function buildDb() {
    const combo = COMBOS[proto.combo]
    const empty = proto.state === 'empty'
    const online = combo.online
    let onlineUsed = online ? online.used : 0
    if (online && proto.quota === 'near') onlineUsed = Math.round(online.total * 0.86)
    // 运行中的任务允许超出剩余额度，因此「用尽」可能略高于总额
    if (online && proto.quota === 'exhausted') onlineUsed = online.total + Math.round(online.total * 0.032)
    return {
      jobs: empty ? [] : buildJobs(proto.combo),
      onlineUsed,
      faults: new Set(
        proto.state === 'errors' ? ['options', 'recent', 'history', 'poll', 'submit', 'api', 'usage', 'grants', 'keygen', 'revoke', 'manage', 'region'] : []
      ),
      failedOnce: new Set(),
      api: {
        key: empty
          ? { has_api_key: false, api_key_prefix: '', api_key_created_at: null }
          : { has_api_key: true, api_key_prefix: 'maps_Q7v2kZx', api_key_created_at: NOW - 19 * DAY },
        used: combo.api.used,
        total: combo.api.total,
        connection: { api_base_url: 'https://api.mapsgrab.com/api/external/maps', mcp_url: 'https://mcp.mapsgrab.com/mcp' },
        grants: empty ? [] : buildGrants(proto.combo)
      }
    }
  }

  // MCP 客户端每次安装都会动态注册新客户端，授权会累积；多产品组合给 23 个（超过一页 20 个）以演示服务端分页
  function buildGrants(combo) {
    const grants = [
      { grant_id: 'g_7f2c', client_name: 'Claude', redirect_host: 'claude.ai', created_at: NOW - 19 * DAY + 3 * HOUR, last_refreshed_at: NOW - 5 * HOUR },
      { grant_id: 'g_51ad', client_name: 'Cursor', redirect_host: '127.0.0.1', created_at: NOW - 6 * DAY, last_refreshed_at: null },
      { grant_id: 'g_93e0', client_name: 'Visual Studio Code', redirect_host: 'vscode.dev', created_at: NOW - 2 * DAY, last_refreshed_at: NOW - 40 * MIN }
    ]
    if (combo !== 'multi') return grants
    const clients = [['Claude Code', '127.0.0.1'], ['Windsurf', '127.0.0.1'], ['ChatGPT', 'chatgpt.com'], ['Zed', '127.0.0.1'], ['Cline', 'vscode.dev']]
    for (let i = 0; i < 20; i += 1) {
      const [name, host] = clients[i % clients.length]
      grants.push({
        grant_id: `g_${(0x2a10 + i * 37).toString(16)}`,
        client_name: name,
        redirect_host: host,
        created_at: NOW - (22 + i * 5) * DAY,
        last_refreshed_at: i % 3 === 0 ? null : NOW - (20 + i * 5) * DAY
      })
    }
    return grants
  }

  // 国家清单与 website/src/data/gmap-regions/countries.json 一致（252 个，GeoNames）
  const REGION_COUNTRIES = [
    ['AF', 'Afghanistan'], ['AX', 'Aland Islands'], ['AL', 'Albania'], ['DZ', 'Algeria'], ['AS', 'American Samoa'], ['AD', 'Andorra'],
    ['AO', 'Angola'], ['AI', 'Anguilla'], ['AQ', 'Antarctica'], ['AG', 'Antigua and Barbuda'], ['AR', 'Argentina'], ['AM', 'Armenia'], ['AW', 'Aruba'],
    ['AU', 'Australia'], ['AT', 'Austria'], ['AZ', 'Azerbaijan'], ['BS', 'Bahamas'], ['BH', 'Bahrain'], ['BD', 'Bangladesh'], ['BB', 'Barbados'],
    ['BY', 'Belarus'], ['BE', 'Belgium'], ['BZ', 'Belize'], ['BJ', 'Benin'], ['BM', 'Bermuda'], ['BT', 'Bhutan'], ['BO', 'Bolivia'],
    ['BQ', 'Bonaire, Saint Eustatius and Saba '], ['BA', 'Bosnia and Herzegovina'], ['BW', 'Botswana'], ['BV', 'Bouvet Island'], ['BR', 'Brazil'],
    ['IO', 'British Indian Ocean Territory'], ['VG', 'British Virgin Islands'], ['BN', 'Brunei'], ['BG', 'Bulgaria'], ['BF', 'Burkina Faso'],
    ['BI', 'Burundi'], ['CV', 'Cabo Verde'], ['KH', 'Cambodia'], ['CM', 'Cameroon'], ['CA', 'Canada'], ['KY', 'Cayman Islands'],
    ['CF', 'Central African Republic'], ['TD', 'Chad'], ['CL', 'Chile'], ['CN', 'China'], ['CX', 'Christmas Island'], ['CC', 'Cocos Islands'],
    ['CO', 'Colombia'], ['KM', 'Comoros'], ['CK', 'Cook Islands'], ['CR', 'Costa Rica'], ['HR', 'Croatia'], ['CU', 'Cuba'], ['CW', 'Curacao'],
    ['CY', 'Cyprus'], ['CZ', 'Czechia'], ['CD', 'Democratic Republic of the Congo'], ['DK', 'Denmark'], ['DJ', 'Djibouti'], ['DM', 'Dominica'],
    ['DO', 'Dominican Republic'], ['EC', 'Ecuador'], ['EG', 'Egypt'], ['SV', 'El Salvador'], ['GQ', 'Equatorial Guinea'], ['ER', 'Eritrea'],
    ['EE', 'Estonia'], ['SZ', 'Eswatini'], ['ET', 'Ethiopia'], ['FK', 'Falkland Islands'], ['FO', 'Faroe Islands'], ['FJ', 'Fiji'], ['FI', 'Finland'],
    ['FR', 'France'], ['GF', 'French Guiana'], ['PF', 'French Polynesia'], ['TF', 'French Southern Territories'], ['GA', 'Gabon'], ['GM', 'Gambia'],
    ['GE', 'Georgia'], ['DE', 'Germany'], ['GH', 'Ghana'], ['GI', 'Gibraltar'], ['GR', 'Greece'], ['GL', 'Greenland'], ['GD', 'Grenada'],
    ['GP', 'Guadeloupe'], ['GU', 'Guam'], ['GT', 'Guatemala'], ['GG', 'Guernsey'], ['GN', 'Guinea'], ['GW', 'Guinea-Bissau'], ['GY', 'Guyana'],
    ['HT', 'Haiti'], ['HM', 'Heard Island and McDonald Islands'], ['HN', 'Honduras'], ['HK', 'Hong Kong'], ['HU', 'Hungary'], ['IS', 'Iceland'],
    ['IN', 'India'], ['ID', 'Indonesia'], ['IR', 'Iran'], ['IQ', 'Iraq'], ['IE', 'Ireland'], ['IM', 'Isle of Man'], ['IL', 'Israel'], ['IT', 'Italy'],
    ['CI', 'Ivory Coast'], ['JM', 'Jamaica'], ['JP', 'Japan'], ['JE', 'Jersey'], ['JO', 'Jordan'], ['KZ', 'Kazakhstan'], ['KE', 'Kenya'],
    ['KI', 'Kiribati'], ['XK', 'Kosovo'], ['KW', 'Kuwait'], ['KG', 'Kyrgyzstan'], ['LA', 'Laos'], ['LV', 'Latvia'], ['LB', 'Lebanon'],
    ['LS', 'Lesotho'], ['LR', 'Liberia'], ['LY', 'Libya'], ['LI', 'Liechtenstein'], ['LT', 'Lithuania'], ['LU', 'Luxembourg'], ['MO', 'Macao'],
    ['MG', 'Madagascar'], ['MW', 'Malawi'], ['MY', 'Malaysia'], ['MV', 'Maldives'], ['ML', 'Mali'], ['MT', 'Malta'], ['MH', 'Marshall Islands'],
    ['MQ', 'Martinique'], ['MR', 'Mauritania'], ['MU', 'Mauritius'], ['YT', 'Mayotte'], ['MX', 'Mexico'], ['FM', 'Micronesia'], ['MD', 'Moldova'],
    ['MC', 'Monaco'], ['MN', 'Mongolia'], ['ME', 'Montenegro'], ['MS', 'Montserrat'], ['MA', 'Morocco'], ['MZ', 'Mozambique'], ['MM', 'Myanmar'],
    ['NA', 'Namibia'], ['NR', 'Nauru'], ['NP', 'Nepal'], ['AN', 'Netherlands Antilles'], ['NC', 'New Caledonia'], ['NZ', 'New Zealand'],
    ['NI', 'Nicaragua'], ['NE', 'Niger'], ['NG', 'Nigeria'], ['NU', 'Niue'], ['NF', 'Norfolk Island'], ['KP', 'North Korea'],
    ['MK', 'North Macedonia'], ['MP', 'Northern Mariana Islands'], ['NO', 'Norway'], ['OM', 'Oman'], ['PK', 'Pakistan'], ['PW', 'Palau'],
    ['PS', 'Palestinian Territory'], ['PA', 'Panama'], ['PG', 'Papua New Guinea'], ['PY', 'Paraguay'], ['PE', 'Peru'], ['PH', 'Philippines'],
    ['PN', 'Pitcairn'], ['PL', 'Poland'], ['PT', 'Portugal'], ['PR', 'Puerto Rico'], ['QA', 'Qatar'], ['CG', 'Republic of the Congo'],
    ['RE', 'Reunion'], ['RO', 'Romania'], ['RU', 'Russia'], ['RW', 'Rwanda'], ['BL', 'Saint Barthelemy'], ['SH', 'Saint Helena'],
    ['KN', 'Saint Kitts and Nevis'], ['LC', 'Saint Lucia'], ['MF', 'Saint Martin'], ['PM', 'Saint Pierre and Miquelon'],
    ['VC', 'Saint Vincent and the Grenadines'], ['WS', 'Samoa'], ['SM', 'San Marino'], ['ST', 'Sao Tome and Principe'], ['SA', 'Saudi Arabia'],
    ['SN', 'Senegal'], ['RS', 'Serbia'], ['CS', 'Serbia and Montenegro'], ['SC', 'Seychelles'], ['SL', 'Sierra Leone'], ['SG', 'Singapore'],
    ['SX', 'Sint Maarten'], ['SK', 'Slovakia'], ['SI', 'Slovenia'], ['SB', 'Solomon Islands'], ['SO', 'Somalia'], ['ZA', 'South Africa'],
    ['GS', 'South Georgia and the South Sandwich Islands'], ['KR', 'South Korea'], ['SS', 'South Sudan'], ['ES', 'Spain'], ['LK', 'Sri Lanka'],
    ['SD', 'Sudan'], ['SR', 'Suriname'], ['SJ', 'Svalbard and Jan Mayen'], ['SE', 'Sweden'], ['CH', 'Switzerland'], ['SY', 'Syria'], ['TW', 'Taiwan'],
    ['TJ', 'Tajikistan'], ['TZ', 'Tanzania'], ['TH', 'Thailand'], ['NL', 'The Netherlands'], ['TL', 'Timor Leste'], ['TG', 'Togo'], ['TK', 'Tokelau'],
    ['TO', 'Tonga'], ['TT', 'Trinidad and Tobago'], ['TN', 'Tunisia'], ['TR', 'Turkey'], ['TM', 'Turkmenistan'], ['TC', 'Turks and Caicos Islands'],
    ['TV', 'Tuvalu'], ['VI', 'U.S. Virgin Islands'], ['UG', 'Uganda'], ['UA', 'Ukraine'], ['AE', 'United Arab Emirates'], ['GB', 'United Kingdom'],
    ['US', 'United States'], ['UM', 'United States Minor Outlying Islands'], ['UY', 'Uruguay'], ['UZ', 'Uzbekistan'], ['VU', 'Vanuatu'],
    ['VA', 'Vatican'], ['VE', 'Venezuela'], ['VN', 'Vietnam'], ['WF', 'Wallis and Futuna'], ['EH', 'Western Sahara'], ['YE', 'Yemen'],
    ['ZM', 'Zambia'], ['ZW', 'Zimbabwe']
  ]
  // 州 / 省为对应国家 JSON 的完整清单；城市只取示意子集。其余国家原型不带数据（见 README §14）
  // s = [州代码, 州名]，c = [城市, 州代码]，与 region-data.ts 的结构一致
  const REGION_DATA = {
    US: {
      s: [
        ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'],
        ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
        ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
        ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'],
        ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
        ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
        ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'],
        ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']
      ],
      c: [
        ['Los Angeles', 'CA'], ['San Diego', 'CA'], ['San Francisco', 'CA'], ['San Jose', 'CA'], ['Sacramento', 'CA'], ['New York City', 'NY'],
        ['Buffalo', 'NY'], ['Rochester', 'NY'], ['Portland', 'OR'], ['Eugene', 'OR'], ['Salem', 'OR'], ['Austin', 'TX'], ['Dallas', 'TX'],
        ['Houston', 'TX'], ['San Antonio', 'TX'], ['Seattle', 'WA'], ['Spokane', 'WA'], ['Tacoma', 'WA']
      ]
    },
    CA: {
      s: [
        ['01', 'Alberta'], ['02', 'British Columbia'], ['03', 'Manitoba'], ['04', 'New Brunswick'], ['05', 'Newfoundland and Labrador'],
        ['13', 'Northwest Territories'], ['07', 'Nova Scotia'], ['14', 'Nunavut'], ['08', 'Ontario'], ['09', 'Prince Edward Island'], ['10', 'Quebec'],
        ['11', 'Saskatchewan'], ['12', 'Yukon']
      ],
      c: [
        ['Vancouver', '02'], ['Victoria', '02'], ['Toronto', '08'], ['Ottawa', '08'], ['Mississauga', '08'], ['Montreal', '10'], ['Quebec City', '10']
      ]
    },
    GB: {
      s: [
        ['ENG', 'England'], ['NIR', 'Northern Ireland'], ['SCT', 'Scotland'], ['WLS', 'Wales']
      ],
      c: [
        ['London', 'ENG'], ['Manchester', 'ENG'], ['Birmingham', 'ENG'], ['Edinburgh', 'SCT'], ['Glasgow', 'SCT'], ['Cardiff', 'WLS']
      ]
    },
    AU: {
      s: [
        ['01', 'Australian Capital Territory'], ['02', 'New South Wales'], ['03', 'Northern Territory'], ['04', 'Queensland'],
        ['05', 'South Australia'], ['06', 'Tasmania'], ['07', 'Victoria'], ['08', 'Western Australia']
      ],
      c: [
        ['Sydney', '02'], ['Newcastle', '02'], ['Brisbane', '04'], ['Gold Coast', '04'], ['Melbourne', '07'], ['Geelong', '07']
      ]
    }
  }

  /* =========================================================================
     4 · 模拟接口（原型专用）：延迟、失败注入与 014 / 015 的响应形状一致
     ========================================================================= */
  let db = buildDb()
  const LATENCY = 420
  const simulatedError = (where, code) => Object.assign(new Error(`原型模拟失败：${where}`), { code })
  // 「局部失败」状态下每个故障点只失败一次，重试即恢复，演示可自行修正的路径
  const fault = key => db.faults.delete(key)
  const failOncePer = key => {
    if (proto.state !== 'errors' || db.failedOnce.has(key)) return false
    db.failedOnce.add(key)
    return true
  }
  // 摘要 = 现有 12 个字段 + 本稿提议的 keyword_preview / keyword_count（README §12「落地所需后端改动」）
  const summary = (job, q = '') => {
    const { items, expired, ...rest } = job
    const keywords = [...new Set(items.map(item => item.keyword))]
    const needle = q.toLowerCase()
    const hit = needle ? keywords.find(keyword => keyword.toLowerCase().includes(needle)) : undefined
    return { ...rest, keyword_preview: hit ?? keywords[0] ?? '', keyword_count: keywords.length }
  }

  // History 查询参数（README §12）：status 为公开状态数组，接口里是重复参数（Running = queued + collecting + publishing）；时间为 ET 日界毫秒，created_to 不含
  const HEXISH = /^[0-9a-f]+$/
  function matchJob(job, { q, statuses, from, to }) {
    if (statuses && !statuses.includes(job.status)) return false
    if (from != null && job.created_at < from) return false
    if (to != null && job.created_at >= to) return false
    if (!q) return true
    const needle = q.toLowerCase()
    if (HEXISH.test(needle) && job.job_no.startsWith(needle)) return true
    return job.items.some(item => item.keyword.toLowerCase().includes(needle))
  }

  const fakeApi = {
    async options() {
      const store = db
      await sleep(LATENCY)
      const conf = COMBOS[proto.combo].online
      if (!conf) throw simulatedError('GET /api/client/maps-online/options', 500)
      if (fault('options')) throw simulatedError('GET /api/client/maps-online/options')
      return {
        keyword_limit: conf.keyword_limit,
        logical_sample_limit: LOGICAL_SAMPLE_LIMIT,
        contacts_allowed: conf.contacts_allowed,
        usage: { used: store.onlineUsed, total: conf.total, period: currentPeriod(), exhausted: store.onlineUsed >= conf.total }
      }
    },
    /** GET /api/client/export/jobs?offset&limit[&q&status&created_from&created_to]；faultKey 仅原型用于区分最近任务与 History。 */
    async listJobs({ offset = 0, limit = 20, q = '', statuses = null, from = null, to = null }, faultKey = 'history') {
      const store = db
      await sleep(LATENCY)
      if (fault(faultKey)) throw simulatedError('GET /api/client/export/jobs')
      const matched = store.jobs.filter(job => matchJob(job, { q, statuses, from, to }))
      return { jobs: matched.slice(offset, offset + limit).map(job => summary(job, q)), total: matched.length, offset, limit }
    },
    async jobDetail(jobNo) {
      const store = db
      await sleep(LATENCY + 120)
      if (failOncePer(`detail:${jobNo}`)) throw simulatedError(`GET /api/client/export/jobs/${jobNo}`)
      const job = store.jobs.find(item => item.job_no === jobNo)
      return { job: summary(job), items: job.items.map(item => ({ ...item, viewport: item.viewport && { ...item.viewport } })) }
    },
    async createJob(items, includeContacts) {
      const store = db
      await sleep(900)
      if (fault('submit')) throw simulatedError('POST /api/client/export/jobs')
      const random = rng(hashSeed(`${Date.now()}`))
      const job = {
        job_no: randomChars(random, 32, HEX) + '07',
        run_no: randomChars(random, 32, HEX) + '07',
        status: 'queued',
        include_contacts: includeContacts,
        total_count: items.length,
        processed_count: 0,
        record_count: 0,
        has_file: false,
        created_at: Date.now(),
        started_at: null,
        finished_at: null,
        error_code: null,
        items: items.map((item, index) => ({
          item_index: index,
          keyword: item.keyword,
          viewport: item.viewport ?? null,
          result_count: 0,
          completed: false,
          error_code: null
        })),
        expired: false
      }
      store.jobs.unshift(job)
      return summary(job)
    },
    async download(jobNo) {
      const store = db
      await sleep(650)
      const job = store.jobs.find(item => item.job_no === jobNo)
      // 签名 URL 有效期 300 秒；对象已移除或无文件时为 404 业务码
      if (!job.has_file || job.expired) throw simulatedError(`GET /api/client/export/jobs/${jobNo}/download`, 404)
      if (failOncePer(`download:${jobNo}`)) throw simulatedError(`GET /api/client/export/jobs/${jobNo}/download`)
      return { filename: `${jobNo}.csv`, csv: buildCsv(job) }
    },
    // Key 与连接地址决定视图能否使用，一起加载；用量单独加载，失败只影响合卡的用量区
    async apiAccess() {
      const store = db
      await sleep(LATENCY + 80)
      if (fault('api')) throw simulatedError('GET /api/client/maps-api/key|connection')
      return { key: { ...store.api.key }, connection: { ...store.api.connection } }
    },
    async apiUsage() {
      const store = db
      await sleep(LATENCY + 160)
      if (fault('usage')) throw simulatedError('GET /api/client/maps-api/usage')
      return { used: store.api.used, total: store.api.total, period: currentPeriod(), exhausted: store.api.used >= store.api.total }
    },
    async grants(page) {
      const store = db
      await sleep(LATENCY)
      if (fault('grants')) throw simulatedError(`GET /api/client/mcp-oauth/grants?page=${page}`)
      // 与后端一致：按创建时间倒序，服务端分页
      const sorted = [...store.api.grants].sort((a, b) => b.created_at - a.created_at)
      const start = (page - 1) * GRANTS_PAGE_SIZE
      return { items: sorted.slice(start, start + GRANTS_PAGE_SIZE).map(grant => ({ ...grant })), total: sorted.length }
    },
    async generateKey() {
      const store = db
      await sleep(800)
      if (fault('keygen')) throw simulatedError('POST /api/client/maps-api/key/generate')
      const random = rng(hashSeed(`${Date.now()}key`))
      const apiKey = `maps_${randomChars(random, 43, BASE62)}`
      store.api.key = { has_api_key: true, api_key_prefix: apiKey.slice(0, 12), api_key_created_at: Date.now() }
      return { api_key: apiKey, ...store.api.key }
    },
    async revoke(grantId) {
      const store = db
      await sleep(600)
      if (fault('revoke')) throw simulatedError(`POST /api/client/mcp-oauth/grants/${grantId}/revoke`)
      store.api.grants = store.api.grants.filter(grant => grant.grant_id !== grantId)
    },
    async manageUrl(productKind) {
      await sleep(700)
      if (fault('manage')) throw simulatedError(`POST /api/client/subscription/management ${productKind}`)
      // 原型统一返回 null，演示渠道内操作指引；落地为渠道 URL 时在预开的窗口内跳转
      return null
    },
    async regionCountries() {
      await sleep(260)
      return REGION_COUNTRIES
    },
    async region(code) {
      await sleep(320)
      if (code === 'AU' && fault('region')) throw simulatedError(`GET gmap-regions/${code}.json`)
      return REGION_DATA[code] ?? { s: [], c: [] }
    }
  }

  /* =========================================================================
     5 · 样例 CSV（原型专用）：列顺序与 backend provider/export/gmap_columns.py 一致
     落地时由后端签名 URL 直接下载，前端不生成文件。
     ========================================================================= */
  const CSV_COLUMNS = [
    '#', 'Name', 'Fulladdress', 'Street', 'Municipality', 'Categories', 'About', 'Phone', 'Phones', 'Claimed', 'Owner',
    'Owner Id', 'Owner Link', 'Review Count', 'Average Rating', 'Review URL', 'Cid', 'Fid', 'Latitude', 'Longitude',
    'Featured Image', 'Time Zone', 'Website', 'Domain', 'Opening Hours', 'Google Knowledge URL', 'Kgmid', 'Google Maps URL',
    'Place Id', 'Emails', 'Facebook Links', 'Instagram Links', 'Youtube Links', 'Tiktok Links', 'Linkedin Links',
    'Twitter Links', 'Search Keyword'
  ]
  const CSV_DESCRIPTIONS = [
    'Row number', 'Business name', 'Full address', 'Street address', 'City or locality', 'Business categories',
    'Business attributes', 'Primary phone', 'Other phone numbers', 'YES only when an owner ID is known', 'Owner name',
    'Google owner ID', 'Google owner profile', 'Number of reviews', 'Average review rating', 'Reviews page',
    'Numeric Google CID', 'Google feature ID', 'Latitude', 'Longitude', 'Featured image URL', 'Local time zone',
    'Business website', 'Website domain', 'Opening hours', 'Google knowledge page', 'Google knowledge ID',
    'Google Maps page', 'Google Place ID', 'Public website emails', 'Facebook profiles', 'Instagram profiles',
    'YouTube channels', 'TikTok profiles', 'LinkedIn profiles', 'X or Twitter profiles', 'Search keyword'
  ]
  const CITY_COORDS = {
    Portland: [45.5152, -122.6784], Austin: [30.2672, -97.7431], Denver: [39.7392, -104.9903], Aurora: [39.7294, -104.8319],
    Lakewood: [39.7047, -105.0814], Boulder: [40.015, -105.2705], Littleton: [39.6133, -105.0166], Seattle: [47.6062, -122.3321],
    Spokane: [47.6588, -117.426], Tacoma: [47.2529, -122.4443], Nome: [64.5011, -165.4064], Miami: [25.7617, -80.1918],
    Tampa: [27.9506, -82.4572], Orlando: [28.5384, -81.3789], Phoenix: [33.4484, -112.074], Chicago: [41.8781, -87.6298],
    'San Diego': [32.7157, -117.1611], Dallas: [32.7767, -96.797], Boston: [42.3601, -71.0589], Atlanta: [33.749, -84.388],
    Brooklyn: [40.6782, -73.9442], Toronto: [43.6532, -79.3832], Nashville: [36.1627, -86.7816], London: [51.5072, -0.1276],
    'New Orleans': [29.9511, -90.0715], Houston: [29.7604, -95.3698], Minneapolis: [44.9778, -93.265]
  }
  const NAME_A = ['Ember', 'North', 'Cedar', 'Harbor', 'Maple', 'Juniper', 'Copper', 'Willow', 'Granite', 'Bluebird', 'Lantern', 'Fern', 'Summit', 'Riverside', 'Pioneer', 'Alder']
  const NAME_B = ['& Oak', 'Street', 'House', 'Collective', 'Corner', 'Works', 'Room', 'Supply', 'Studio', 'Lane']
  const STREETS = ['NW 23rd Ave', 'SE Hawthorne Blvd', 'N Mississippi Ave', 'SW Alder St', 'NE Broadway', 'Main St', 'Market St', 'Pine St', '2nd Ave', 'Elm St']
  const ABOUT = ['Wi-Fi · Outdoor seating', 'Wheelchair accessible entrance · Credit cards', 'Appointments recommended · Free parking', 'Delivery · Takeout · Dine-in', 'Women-owned · LGBTQ+ friendly']
  const HOURS = ['Mon-Fri 7AM-6PM; Sat-Sun 8AM-4PM', 'Mon-Sat 9AM-7PM; Sun Closed', 'Open 24 hours', 'Tue-Sun 11AM-10PM; Mon Closed']

  const titleCase = text => text.replace(/\b\w/g, ch => ch.toUpperCase())
  const timeZoneFor = (lat, lng) =>
    lng > -30 ? 'Europe/London' : lng < -150 ? 'America/Nome' : lng < -115 ? 'America/Los_Angeles' : lng < -109 && lat < 37 ? 'America/Phoenix' : lng < -101 ? 'America/Denver' : lng < -86 ? 'America/Chicago' : 'America/New_York'

  function csvRow(rowNo, item, contacts, random) {
    const pick = list => list[Math.floor(random() * list.length)]
    const chance = p => random() < p
    const [base, place = ''] = item.keyword.split(/ (?:in|near) /)
    const placeParts = place.split(',').map(part => part.trim()).filter(Boolean)
    const city = placeParts[0] ?? 'Portland'
    const regionCode = placeParts.slice(1).join(', ') || 'OR'
    const [cityLat, cityLng] = CITY_COORDS[city] ?? [item.viewport?.lat ?? PORTLAND.lat, item.viewport?.lng ?? PORTLAND.lng]
    const lat = (item.viewport?.lat ?? cityLat) + (random() - 0.5) * 0.03
    const lng = (item.viewport?.lng ?? cityLng) + (random() - 0.5) * 0.03
    const category = titleCase(base)
    const name = `${pick(NAME_A)} ${pick(NAME_B)} ${category}`
    const slug = name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const domain = `${slug}.example`
    const street = `${100 + Math.floor(random() * 8900)} ${pick(STREETS)}`
    const london = city === 'London'
    // 555-01xx（北美）与 020 7946 0xxx（英国）均为影视保留号段，不会命中真实号码
    const phone = london
      ? `+44 20 7946 0${String(Math.floor(random() * 1000)).padStart(3, '0')}`
      : `+1 ${200 + (hashSeed(city) % 700)}-555-01${String(Math.floor(random() * 100)).padStart(2, '0')}`
    const fidHigh = randomChars(random, 16, HEX)
    const fidLow = randomChars(random, 16, HEX)
    const placeId = `ChIJ${randomChars(random, 23, `${BASE62}-_`)}`
    const kgmid = `/g/11${randomChars(random, 9, 'abcdefghijklmnopqrstuvwxyz0123456789')}`
    const ownerId = String(1 + Math.floor(random() * 9)) + randomChars(random, 20, '0123456789')
    const claimed = chance(0.72)
    const website = chance(0.78)
    return [
      rowNo,
      name,
      `${street}, ${city}, ${regionCode} ${10000 + Math.floor(random() * 89999)}`,
      street,
      city,
      category,
      pick(ABOUT),
      phone,
      chance(0.2) ? phone.replace(/\d$/, digit => String((Number(digit) + 3) % 10)) : '',
      claimed ? 'YES' : '',
      claimed ? name : '',
      claimed ? ownerId : '',
      claimed ? `https://www.google.com/maps/contrib/${ownerId}` : '',
      3 + Math.floor(random() * 1800),
      (3.6 + random() * 1.3).toFixed(1),
      `https://search.google.com/local/reviews?placeid=${placeId}`,
      // CID 即 FID 第二段的十进制形式
      BigInt(`0x${fidLow}`).toString(),
      `0x${fidHigh}:0x${fidLow}`,
      lat.toFixed(7),
      lng.toFixed(7),
      `https://lh5.googleusercontent.com/p/AF1Qip${randomChars(random, 30, `${BASE62}-_`)}=w408-h306-k-no`,
      timeZoneFor(lat, lng),
      website ? `https://${domain}/` : '',
      website ? domain : '',
      pick(HOURS),
      `https://www.google.com/search?kgmid=${encodeURIComponent(kgmid)}`,
      kgmid,
      `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      placeId,
      contacts && website && chance(0.6) ? `hello@${domain}` : '',
      contacts && chance(0.55) ? `https://www.facebook.com/${slug.replace(/-/g, '')}` : '',
      contacts && chance(0.5) ? `https://www.instagram.com/${slug.replace(/-/g, '')}` : '',
      contacts && chance(0.1) ? `https://www.youtube.com/@${slug}` : '',
      contacts && chance(0.12) ? `https://www.tiktok.com/@${slug}` : '',
      contacts && chance(0.15) ? `https://www.linkedin.com/company/${slug}` : '',
      contacts && chance(0.15) ? `https://x.com/${slug.replace(/-/g, '')}` : '',
      item.keyword
    ]
  }

  function buildCsv(job) {
    const random = rng(hashSeed(job.job_no))
    const cell = value => {
      const text = String(value ?? '')
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }
    const rows = [CSV_COLUMNS, CSV_DESCRIPTIONS]
    let rowNo = 0
    for (const item of job.items) {
      for (let index = 0; index < item.result_count; index++) rows.push(csvRow(++rowNo, item, job.include_contacts, random))
    }
    // UTF-8 BOM + 两行表头（英文列名、创建语言的列说明），第三行起为数据
    return `﻿${rows.map(row => row.map(cell).join(',')).join('\r\n')}\r\n`
  }

  /* =========================================================================
     6 · 运行时状态（每次 boot 重建；异步回调用 boot 令牌丢弃过期结果）
     ========================================================================= */
  let bootToken = 0
  let session = null
  let online = null
  let recent = null
  let hist = null
  let downloads = null
  let apiView = null
  let subsView = null
  // 本会话观察到「运行中」的任务：任一列表先看到它结束就通知一次并移除，两张列表不重复弹提示
  let watching = new Map()
  const route = { current: VIEWS.includes(params.get('view')) ? params.get('view') : 'online', scroll: new Map() }

  function resetState() {
    db = buildDb()
    session = { subs: COMBOS[proto.combo].subs, user: USER }
    online = {
      started: false,
      ready: false,
      optionsPromise: null,
      options: null,
      optionsLoading: false,
      optionsError: false,
      mode: 'keywords',
      includeContacts: true,
      submitting: false,
      submitError: '',
      map: { center: null, radius: 5, spacing: 5, pinMoved: false },
      region: {
        opened: false,
        countries: [],
        countriesLoading: false,
        code: '',
        data: null,
        dataLoading: false,
        dataError: false,
        stateCode: '',
        selected: []
      }
    }
    // Online「最近任务」：最新 5 条，无展开
    recent = { started: false, jobs: [], total: 0, loading: false, loadError: false, refreshError: false, highlight: '' }
    // History：查询条件在 histQuery（地址栏状态，boot 不清空）；这里只放结果与加载状态
    hist = {
      started: false,
      ready: false,
      jobs: [],
      total: 0,
      seq: 0,
      loading: false,
      // initial：首屏骨架；swap：翻页 / 改筛选，列表区换骨架；busy：刷新，保留结果降不透明度；silent：轮询
      mode: '',
      reveal: false,
      loadError: false,
      refreshError: false,
      stale: false,
      loadedKey: '',
      expanded: new Set(),
      details: new Map(),
      detailErrors: new Set()
    }
    // 下载状态按任务号共享：同一任务可能同时出现在最近任务与 History
    downloads = { busy: new Set(), messages: new Map() }
    watching = new Map()
    apiView = {
      started: false,
      ready: false,
      loading: false,
      error: false,
      key: null,
      plainKey: '',
      generating: false,
      keyError: '',
      usage: null,
      usageLoading: false,
      usageError: false,
      connection: null,
      grants: [],
      grantsPage: 1,
      grantsTotal: 0,
      grantsLoading: false,
      grantsError: false,
      revoking: new Set(),
      grantMessages: new Map()
    }
    subsView = { managing: '', message: '', messageLine: '' }
  }

  /* =========================================================================
     7 · 外壳：全局状态、路由、侧栏（选中态 / 宽屏收起 / 图标栏提示）、顶栏、抽屉
     ========================================================================= */
  const sections = Object.fromEntries(VIEWS.map(view => [view, $(`[data-view="${view}"]`)]))
  const sideEl = $('#dash-side')
  const navEl = $('[data-nav]')
  const topbar = $('[data-topbar]')
  const titleEl = $('#view-title')
  const actionsEl = $('[data-topbar-actions]')
  const srStatus = $('[data-sr-status]')
  const userSlot = $('[data-user-slot]')
  const USER_SKELETON = userSlot.innerHTML

  const globalState = () => body.dataset.state
  const viewReady = view =>
    view === 'subscriptions' || (view === 'online' ? online.ready : view === 'history' ? hist.ready : apiView.ready)

  function setGlobalState(state) {
    body.dataset.state = state
    srStatus.textContent = state === 'loading' ? T.shell.loading : ''
    renderParts()
    renderUserSlot()
    renderTopbarActions()
  }

  /** 每个视图三段：首屏骨架 / 门禁（未登录、网络失败）/ 内容；骨架到内容只淡入，不位移。 */
  function renderParts() {
    const state = globalState()
    for (const view of VIEWS) {
      const part = state === 'loading' ? 'skeleton' : state === 'ready' ? (viewReady(view) ? 'content' : 'skeleton') : 'gate'
      for (const el of $$(':scope > [data-part]', sections[view])) {
        const show = el.dataset.part === part
        if (show && el.hidden && part !== 'skeleton') replay(el, 'is-revealed')
        el.hidden = !show
      }
      if (part === 'gate') renderGate(view)
    }
    placeSegThumb()
    placeSegThumb(histStatusEl, { instant: true })
  }

  function renderGate(view) {
    const gate = $(':scope > [data-part="gate"]', sections[view])
    if (globalState() === 'signedout') {
      const prompt = { online: T.history.signInPrompt, history: T.history.signInPrompt, api: T.api.signInPrompt, subscriptions: T.subscriptions.signInPrompt }[view]
      patch(
        gate,
        `<div class="gate"><span class="icon-tile">${icon('lock')}</span><p class="gate-text">${prompt}</p>` +
          `<button class="btn btn-primary btn-sm" type="button" data-signin-open data-fk="gate-signin">${T.history.signInCta}</button></div>`
      )
    } else {
      patch(
        gate,
        `<div class="gate"><span class="icon-tile">${icon('plug')}</span><p class="gate-text">${T.history.unreachable}</p>` +
          `<button class="btn btn-secondary btn-sm" type="button" data-boot-retry data-fk="gate-retry">${icon('refresh')}${T.shell.retry}</button></div>`
      )
    }
  }

  const liveNote = () => `<span class="live-note"><i class="dot" aria-hidden="true"></i><span>${T.history.autoRefresh}</span></span>`

  function renderTopbarActions() {
    let html = ''
    if (globalState() === 'ready' && viewReady(route.current)) {
      if (route.current === 'online') {
        // 刷新：最近任务 + 本月额度；轮询不转按钮，只有手动刷新时显示进行中
        const live = proto.sim === 'on' && !recent.refreshError && recent.jobs.some(isRunning)
        const busy = recent.loading && recent.manual
        html =
          (live ? liveNote() : '') +
          `<button class="btn btn-secondary btn-xs" type="button" data-refresh data-fk="refresh"${busy ? ' aria-busy="true"' : ''}>` +
          `${busy ? spinner('spinner--sm') : icon('refresh')}<span class="btn-label-wide">${T.history.refresh}</span></button>`
      } else if (route.current === 'history') {
        // History 的刷新在工具栏里，顶栏只保留自动刷新提示
        const live = proto.sim === 'on' && !hist.refreshError && hist.jobs.some(isRunning)
        html = live ? liveNote() : ''
      } else if (route.current === 'api') {
        html = `<a class="btn btn-secondary btn-xs" href="../google-maps-scraper-api.html" title="${T.api.docsLink}"><span class="btn-label-wide">${T.api.docsLink}</span>${icon('arrow-up-right')}</a>`
      } else {
        html = `<a class="btn btn-secondary btn-xs" href="../pricing.html" title="${T.subscriptions.pricingLink}"><span class="btn-label-wide">${T.subscriptions.pricingLink}</span>${icon('arrow-up-right')}</a>`
      }
    }
    patch(actionsEl, html)
  }

  function placeNavThumb() {
    const link = $(`[data-route="${route.current}"]`, navEl)
    navEl.style.setProperty('--thumb-y', `${link.offsetTop}px`)
    if (!navEl.classList.contains('has-thumb')) {
      navEl.classList.add('has-thumb')
      requestAnimationFrame(() => navEl.classList.add('is-ready'))
    }
  }

  function applyRoute({ animate }) {
    const view = route.current
    for (const name of VIEWS) sections[name].hidden = name !== view
    for (const link of $$('[data-route]', navEl)) {
      if (link.dataset.route === view) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    }
    placeNavThumb()
    titleEl.textContent = VIEW_TITLE[view]
    document.title = `${VIEW_TITLE[view]} · ${T.seo.title}`
    renderTopbarActions()
    if (animate) {
      replay(sections[view], 'is-entering')
      replay(titleEl, 'is-swapping')
      replay(actionsEl, 'is-swapping')
    }
    placeSegThumb()
    placeSegThumb(histStatusEl, { instant: true })
  }

  const closePopovers = () => Pop.close({ focus: false })

  function navigate(view, { push = true, restore = false } = {}) {
    closeDrawer({ returnFocus: false })
    closePopovers()
    hideTip()
    if (view === route.current) {
      window.scrollTo({ top: 0, behavior: reducedMotion() ? 'instant' : 'smooth' })
      if (view === 'history') activateView('history')
      return
    }
    route.scroll.set(route.current, window.scrollY)
    // 明文 Key 只存在于 API 视图内存：离开即丢弃（与「离开或刷新后不可再看」的文案一致）
    if (route.current === 'api' && apiView.plainKey) {
      apiView.plainKey = ''
      renderApiKey()
    }
    route.current = view
    if (push) history.pushState({ view }, '', urlFor(view))
    applyRoute({ animate: true })
    window.scrollTo({ top: restore ? route.scroll.get(view) ?? 0 : 0, behavior: 'instant' })
    titleEl.focus({ preventScroll: true })
    activateView(view)
  }

  function syncRouteHrefs() {
    for (const link of $$('a[data-route]')) link.href = urlFor(link.dataset.route)
  }

  // 抽屉（< 960px）：打开时主区 inert，Esc / 遮罩 / 关闭按钮收起，焦点回到菜单按钮
  const drawerQuery = matchMedia('(max-width: 959.98px)')
  const menuBtn = $('[data-menu-btn]')
  const mainEl = $('[data-main]')

  function openDrawer() {
    body.classList.add('drawer-open')
    menuBtn.setAttribute('aria-expanded', 'true')
    mainEl.inert = true
    syncSideInert()
    $('[data-side-close]').focus()
  }

  function closeDrawer({ returnFocus = true } = {}) {
    if (!body.classList.contains('drawer-open')) return
    body.classList.remove('drawer-open')
    menuBtn.setAttribute('aria-expanded', 'false')
    mainEl.inert = false
    syncSideInert()
    if (returnFocus) menuBtn.focus()
  }

  // 窄屏下抽屉关闭时侧栏整体不可聚焦；宽屏下侧栏常驻
  function syncSideInert() {
    sideEl.inert = drawerQuery.matches && !body.classList.contains('drawer-open')
  }

  /* ---------------------------------------------------------------- 宽屏收起为图标栏 */
  // 状态写在 html[data-side]，首帧由 index.html 头部脚本从 localStorage 恢复；窄屏抽屉不读这个状态
  const sideToggle = $('[data-side-toggle]')
  const SIDE_KEY = 'mg-dash-side'
  const IS_MAC = /Mac|iPhone|iPad|iPod/.test(navigator.userAgentData?.platform || navigator.platform || '')
  const MOD_B = IS_MAC ? '⌘B' : 'Ctrl+B'
  const sideCollapsed = () => root.dataset.side === 'collapsed'
  const railActive = () => sideCollapsed() && !drawerQuery.matches

  function syncSideToggle() {
    const collapsed = sideCollapsed()
    sideToggle.setAttribute('aria-expanded', String(!collapsed))
    sideToggle.setAttribute('aria-label', collapsed ? T.shell.expandSidebar : T.shell.collapseSidebar)
    sideToggle.setAttribute('aria-keyshortcuts', IS_MAC ? '[ Meta+B' : '[ Control+B')
  }

  function setSideCollapsed(collapsed) {
    if (collapsed === sideCollapsed() || drawerQuery.matches) return
    // 账户菜单按用户卡定位、提示按菜单项定位：切换前先收起（焦点在菜单里时交还用户卡）
    if (Pop.isOpen(accountMenu)) Pop.close()
    hideTip()
    // 收起后被隐藏的可聚焦项（品牌链接、套餐区 Upgrade）若持有焦点，交给收起按钮
    if (collapsed && document.activeElement?.closest('.side-brand, .user-plan-clip')) sideToggle.focus()
    if (collapsed) root.dataset.side = 'collapsed'
    else delete root.dataset.side
    syncSideToggle()
    try {
      localStorage.setItem(SIDE_KEY, collapsed ? 'collapsed' : 'expanded')
    } catch {
      // 隐私模式等场景不可写：本次会话内仍然生效
    }
  }

  /* ---------------------------------------------------------------- 图标栏提示 */
  const tipEl = $('[data-side-tip]')
  let tipTarget = null
  let tipTimer = 0
  let tipWarmUntil = 0

  // 收起按钮在展开 / 收起两态都给提示（含快捷键）；其余项只在图标栏状态下提示
  function showTip(el, { immediate = false } = {}) {
    if (drawerQuery.matches || (el !== sideToggle && !railActive())) return
    clearTimeout(tipTimer)
    const reveal = () => {
      const toggle = el === sideToggle
      const text = toggle ? (sideCollapsed() ? T.shell.expandSidebar : T.shell.collapseSidebar) : el.dataset.tip
      if (!text) return
      tipTarget = el
      tipEl.innerHTML = `<span>${esc(text)}</span>${toggle ? `<kbd>[</kbd><kbd>${MOD_B}</kbd>` : ''}`
      const rect = el.getBoundingClientRect()
      tipEl.style.left = `${Math.round(sideEl.getBoundingClientRect().right + 8)}px`
      tipEl.style.top = `${Math.round(rect.top + rect.height / 2)}px`
      tipEl.classList.add('is-shown')
    }
    // 首个提示稍候再出；刚显示过（相邻项之间移动）时立即切换
    if (immediate || tipEl.classList.contains('is-shown') || performance.now() < tipWarmUntil) reveal()
    else tipTimer = setTimeout(reveal, 320)
  }

  function hideTip() {
    clearTimeout(tipTimer)
    if (tipEl.classList.contains('is-shown')) tipWarmUntil = performance.now() + 400
    tipTarget = null
    tipEl.classList.remove('is-shown')
  }

  /* =========================================================================
     8 · 用户卡与账户菜单
     ========================================================================= */
  const accountMenu = $('[data-account-menu]')
  const initialOf = name => (name.trim().charAt(0) || 'U').toUpperCase()

  /** 三种形态同构（头像位 + 身份行 + 尾图标），收起为图标栏时只留头像位，见 dashboard.css §4 / §4b。 */
  function renderUserSlot() {
    const state = globalState()
    let html = USER_SKELETON
    if (state === 'signedout') {
      html =
        `<div class="user-box"><button class="user-trigger" type="button" data-signin-open data-tip="${T.history.signInCta}" data-fk="user-signin">` +
        `<span class="avatar-wrap"><span class="avatar avatar--muted" aria-hidden="true">${icon('user')}</span></span>` +
        `<span class="user-ident"><span class="user-name">${T.history.signInCta}</span></span>${icon('arrow-right')}</button></div>`
    } else if (state === 'offline') {
      html =
        `<div class="user-box"><div class="user-trigger" data-tip="${T.history.unreachable}">` +
        `<span class="avatar-wrap"><span class="avatar avatar--warn" aria-hidden="true">${icon('alert')}</span></span>` +
        `<span class="user-ident"><span class="user-note-text">${T.history.unreachable}</span></span></div></div>`
    } else if (state === 'ready') {
      const name = session.user.full_name || session.user.email
      // 套餐区在图标栏里被隐藏，用 aria-describedby 引用后读屏仍能读到套餐与额度
      html =
        `<div class="user-box">` +
        `<button class="user-trigger" type="button" aria-haspopup="menu" aria-controls="account-menu-list" aria-expanded="${Pop.isOpen(accountMenu)}" ` +
        `aria-label="${esc(name)}, ${T.account.menuButtonLabel}" aria-describedby="user-plan" data-tip="${esc(name)}" data-user-trigger data-fk="user">` +
        `<span class="avatar-wrap"><span class="avatar" aria-hidden="true">${initialOf(name)}</span>` +
        `<svg class="avatar-ring" viewBox="0 0 40 40" aria-hidden="true" data-user-ring>` +
        `<circle class="ring-track" cx="20" cy="20" r="19" pathLength="100"/><circle class="ring-value" cx="20" cy="20" r="19" pathLength="100"/></svg></span>` +
        `<span class="user-ident"><span class="user-name">${esc(name)}</span><span class="user-email">${esc(session.user.email)}</span></span>` +
        `${icon('selector')}</button>` +
        `<div class="user-plan-clip"><div class="user-plan" id="user-plan" data-user-plan></div></div></div>`
    }
    patch(userSlot, html)
    renderUserPlan()
  }

  /** 用户卡以 Online 为主：套餐徽标 + 本月 records 额度（与创建面板共用 options）；图标栏用头像外圈环表示同一额度。 */
  function renderUserPlan() {
    const el = $('[data-user-plan]', userSlot)
    if (!el) return
    const sub = session.subs.online
    const badge =
      sub.status === 'unavailable'
        ? `<span class="badge badge--warn">${icon('alert')}${T.account.planUnavailable}</span>`
        : isActiveSub(sub)
          ? `<span class="badge">${esc(sub.display_name)}</span>`
          : `<span class="badge badge--muted">${T.subscriptions.free}</span><a class="d-link user-up" href="../pricing.html#online">${T.account.upgrade}</a>`
    const options = online.options
    let quota = ''
    if (options) {
      quota =
        `<span class="user-quota">${fmt(T.account.usageShort, { used: num(options.usage.used), total: num(options.usage.total) })}</span>` +
        meter(options.usage.used, options.usage.total, { thin: true })
    } else if (online.optionsLoading || !online.optionsPromise) {
      quota = `<span class="skel" style="width: 72%"></span><span class="skel skel--pill" style="height: 4px"></span>`
    }
    patch(el, `<div class="user-plan-row">${badge}</div>${quota}`)

    // 额度环：与 meter 同一阈值（≥ 80% 提醒色，用尽错误色）；额度未知时只显示轨道
    const ring = $('[data-user-ring]', userSlot)
    const usage = options?.usage
    const value = usage && usage.total > 0 ? clamp((usage.used / usage.total) * 100, 0, 100) : 0
    ring.style.setProperty('--v', value.toFixed(1))
    ring.classList.toggle('is-empty', value < 0.5)
    const lvl = usage ? quotaLevel(usage.used, usage.total) : ''
    if (lvl) ring.dataset.level = lvl
    else delete ring.dataset.level
  }

  const LINE_ICONS = { online: 'cloud', extension: 'puzzle', api: 'code' }

  function themePref() {
    const value = root.getAttribute('data-theme')
    return value === 'light' || value === 'dark' ? value : 'system'
  }

  /**
   * 账户菜单（APG Menu Button，.pop 浮层）：身份区在 role="menu" 之外；订阅行、管理订阅、主题单选组、
   * 语言（子菜单：同一浮层内横向切到语言面板）与退出都是菜单项。每次打开按会话重建。
   */
  function renderAccountMenu() {
    const name = session.user.full_name || session.user.email
    const subs = Object.keys(LINE_ICONS)
      .map(line => {
        const sub = session.subs[line]
        let plan = '<span></span>'
        let meta
        let attrs
        if (sub.status === 'unavailable') {
          meta = `<span class="menu-sub-meta is-warn">${icon('alert', 'icon--xs')}${T.subscriptions.unavailable}</span>`
          attrs = 'aria-disabled="true"'
        } else if (isActiveSub(sub)) {
          plan = `<span class="menu-sub-plan">${esc(sub.display_name)}</span>`
          meta = `<span class="menu-sub-meta">${T.subscriptions.expiresLabel} ${fmtDate(sub.expires_at)}</span>`
          attrs = `href="${urlFor('subscriptions')}" data-route="subscriptions"`
        } else {
          plan = `<span class="menu-sub-plan is-free">${T.subscriptions.free}</span>`
          meta = `<span class="menu-sub-meta is-link">${T.account.upgrade}${icon('arrow-up-right', 'icon--xs')}</span>`
          attrs = `href="../pricing.html#${line}"`
        }
        return (
          `<a class="pop-item menu-sub" role="menuitem" tabindex="-1" ${attrs}>${icon(LINE_ICONS[line])}` +
          `<span class="menu-sub-line">${T.subscriptions.lines[line]}</span>${plan}${meta}</a>`
        )
      })
      .join('')
    const pref = themePref()
    const themeItem = (value, iconName, label) =>
      `<button type="button" role="menuitemradio" tabindex="-1" aria-checked="${pref === value}" aria-label="${label}" title="${label}" data-theme-set="${value}">${icon(iconName)}</button>`
    const languages = LOCALES.map(
      ([code, label]) =>
        `<button class="pop-item" type="button" role="menuitemradio" tabindex="-1" aria-checked="${code === CURRENT_LOCALE}" lang="${code}" data-locale="${code}">` +
        `<span class="pop-item-label">${label}</span>${icon('check', 'pop-check')}</button>`
    ).join('')
    const currentName = LOCALES.find(([code]) => code === CURRENT_LOCALE)[1]
    accountMenu.innerHTML =
      `<div class="pop-panels"><div class="pop-panel"><div class="pop-body">` +
      `<div class="menu-id"><span class="avatar" aria-hidden="true">${initialOf(name)}</span>` +
      `<span class="user-ident"><span class="user-name">${esc(name)}</span><span class="user-email">${esc(session.user.email)}</span></span></div>` +
      `<div class="pop-sep"></div>` +
      `<div role="menu" id="account-menu-list" aria-label="${T.account.menuLabel}">` +
      `<div role="group" aria-label="${T.subscriptions.title}"><span class="pop-label d-label" aria-hidden="true">${T.subscriptions.title}</span>${subs}</div>` +
      `<a class="pop-item" role="menuitem" tabindex="-1" href="${urlFor('subscriptions')}" data-route="subscriptions">${icon('tag')}<span class="pop-item-label">${T.api.managePlan}</span></a>` +
      `<div class="pop-sep" role="separator"></div>` +
      `<div class="menu-row" role="group" aria-label="${T.account.theme}" data-pop-row><span aria-hidden="true">${T.account.theme}</span><div class="mini-seg">` +
      themeItem('light', 'sun', T.account.themeLight) +
      themeItem('dark', 'moon', T.account.themeDark) +
      themeItem('system', 'monitor', T.account.themeSystem) +
      `</div></div>` +
      `<button class="pop-item" type="button" role="menuitem" tabindex="-1" aria-haspopup="menu" aria-expanded="false" aria-controls="account-lang-list">` +
      `${icon('globe')}<span class="pop-item-label">${T.account.language}</span><span class="pop-item-end">${currentName}${icon('chevron-right', 'icon--xs')}</span></button>` +
      `<div class="pop-sep" role="separator"></div>` +
      `<button class="pop-item" type="button" role="menuitem" tabindex="-1" data-logout>${icon('logout')}<span class="pop-item-label">${T.account.logout}</span></button>` +
      `</div></div></div>` +
      `<div class="pop-panel" hidden><div class="pop-head">` +
      `<button class="icon-btn icon-btn--sm" type="button" tabindex="-1" aria-label="${T.shell.back}" data-pop-back>${icon('chevron-left')}</button>` +
      `<span class="pop-title" id="account-lang-title">${T.account.language}</span></div>` +
      `<div class="pop-body" role="menu" id="account-lang-list" aria-labelledby="account-lang-title">${languages}</div>` +
      `</div></div>`
  }

  // 展开时在用户卡上方左对齐（底部空间不够也不会向下翻）；图标栏时在侧栏右侧、底边与头像对齐
  const accountCtl = Pop.menu(accountMenu, {
    anchor() {
      const trigger = $('[data-user-trigger]', userSlot)
      if (!trigger) return null
      if (!railActive()) return trigger.closest('.user-box').getBoundingClientRect()
      const rect = trigger.getBoundingClientRect()
      const right = sideEl.getBoundingClientRect().right
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right, width: right - rect.left, height: rect.height }
    },
    trigger: () => $('[data-user-trigger]', userSlot),
    owns: target => Boolean(target.closest('[data-user-trigger]')),
    side: () => (railActive() ? 'right' : 'top'),
    align: 'start',
    render() {
      hideTip()
      renderAccountMenu()
    },
    onSelect(item) {
      if (item.dataset.themeSet) {
        setTheme(item.dataset.themeSet)
        return 'stay'
      }
      if (item.dataset.locale) {
        if (item.dataset.locale !== CURRENT_LOCALE) {
          toast('原型说明', `落地时跳转到 ${item.dataset.locale} 前缀下的同一 Dashboard 视图。`, 'note', 'zh-CN')
        }
        return
      }
      if (item.hasAttribute('data-logout')) {
        Pop.close({ focus: false })
        proto.state = 'signedout'
        history.replaceState({ view: route.current }, '', urlFor(route.current))
        syncRouteHrefs()
        boot()
        toast('原型说明', '落地时退出后清除本站登录态并回到当前语言首页。', 'note', 'zh-CN')
      }
      // 其余是链接（订阅、管理订阅、升级）：交给默认导航与 data-route 委托
    }
  })

  /* =========================================================================
     9 · Online：创建面板（关键词 / 地图 / 地区）
     ========================================================================= */
  const composer = $('[data-composer]')
  const kwInput = $('[data-kw]')
  const finalInput = $('[data-region-final]')
  const baseInput = $('[data-region-base]')
  const segEl = $('[data-modes]', composer)
  const composerBody = $('[data-composer-body]')
  const MODE_TABS = { keywords: 'tab-keywords', map: 'tab-map', regions: 'tab-regions' }

  const isRunning = job => job.status === 'queued' || job.status === 'collecting' || job.status === 'publishing'
  const normalizeKeyword = line => line.trim().replace(/\s+/g, ' ')

  function keywordStats(text) {
    const lines = text.split(/\r?\n/).map(normalizeKeyword).filter(Boolean)
    const unique = [...new Set(lines)]
    return { unique, duplicates: lines.length - unique.length, tooLong: unique.some(keyword => keyword.length > 500) }
  }

  function mapViewports() {
    const { center, radius, spacing } = online.map
    return center ? gridViewports(center, radius, spacing) : []
  }

  /** 与现状 HistoryView 一致：关键词去重；地图模式 items = 关键词 × 视口，总数受 logical_sample_limit 约束。 */
  function composerModel() {
    const stats = keywordStats(online.mode === 'regions' ? finalInput.value : kwInput.value)
    const viewports = online.mode === 'map' ? mapViewports() : null
    const items = viewports
      ? stats.unique.flatMap(keyword => viewports.map(viewport => ({ keyword, viewport })))
      : stats.unique.map(keyword => ({ keyword }))
    const options = online.options
    const keywordInvalid = Boolean(options) && (stats.unique.length > options.keyword_limit || stats.tooLong)
    const overLimit = Boolean(options) && items.length > options.logical_sample_limit
    const invalid = !options || !items.length || keywordInvalid || overLimit
    return { stats, viewports, items, keywordInvalid, overLimit, invalid }
  }

  // 分段滑块：创建面板的模式 tab（aria-selected）与 History 的状态筛选（aria-checked）共用
  function placeSegThumb(group = segEl, { instant = false } = {}) {
    const active = $('[aria-selected="true"], [aria-checked="true"]', group)
    const thumb = $('.seg-thumb', group)
    if (!active || !active.offsetWidth) return
    if (instant) thumb.style.transition = 'none'
    thumb.style.width = `${active.offsetWidth}px`
    thumb.style.transform = `translateX(${active.offsetLeft}px)`
    if (instant) {
      void thumb.offsetWidth
      thumb.style.transition = ''
    }
  }

  function setMode(next, { focus = false } = {}) {
    if (online.submitting || next === online.mode) return
    const from = composerBody.offsetHeight
    online.mode = next
    for (const tab of $$('[role="tab"]', segEl)) {
      const on = tab.dataset.mode === next
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
    }
    composerBody.setAttribute('aria-labelledby', MODE_TABS[next])
    placeSegThumb()
    applyModeLayout()
    if (focus) $(`[data-mode="${next}"]`, segEl).focus()
    if (next === 'regions' && !online.region.opened) loadCountries()
    renderComposer()
    // 面板高度 T2 过渡：先锁定旧高度再过渡到新高度，结束后交还 auto
    const to = composerBody.offsetHeight
    const pane = next === 'regions' ? $('[data-region-panel]') : $('[data-kw-wrap]')
    replay(pane, 'is-entering')
    if (reducedMotion() || from === to) return
    composerBody.style.height = `${from}px`
    composerBody.classList.add('is-sizing')
    void composerBody.offsetHeight
    composerBody.style.height = `${to}px`
    const done = () => {
      composerBody.style.height = ''
      composerBody.classList.remove('is-sizing')
    }
    composerBody.addEventListener('transitionend', done, { once: true })
    setTimeout(done, 480)
  }

  function applyModeLayout() {
    const mode = online.mode
    const kwWrap = $('[data-kw-wrap]')
    kwWrap.hidden = mode === 'regions'
    kwWrap.dataset.layout = mode === 'map' ? 'map' : 'keywords'
    $('[data-map-panel]').hidden = mode !== 'map'
    $('[data-region-panel]').hidden = mode !== 'regions'
  }

  function renderComposer() {
    if (!online) return
    const options = online.options
    const main = $('[data-composer-main]')
    const errBox = $('[data-composer-err]')
    const showError = !options && online.optionsError
    main.hidden = showError
    errBox.hidden = !showError
    segEl.hidden = showError
    if (showError) {
      const busy = online.optionsLoading
      patch(
        errBox,
        `<div class="callout callout--bad" role="alert">${icon('alert')}<div class="callout-body"><span>${T.create.optionsFailed}</span>` +
          `<button class="btn btn-secondary btn-xs${busy ? ' is-busy' : ''}" type="button" data-retry-options data-fk="options-retry"${busy ? ' aria-busy="true"' : ''}>` +
          `${busy ? spinner('spinner--sm') : icon('refresh')}${T.shell.retry}</button></div></div>`
      )
      return
    }

    const model = composerModel()
    const busy = online.submitting
    // 提交中锁定全部输入；地区下拉的可用性另由 renderRegion 按数据加载状态决定
    for (const el of [kwInput, finalInput, baseInput, ...$$('[data-map-panel] input'), ...$$('[name="phrasing"]'), ...$$('[role="tab"]', segEl)]) {
      el.disabled = busy
    }

    // 关键词计数（地区模式计「最终查询」）
    const limit = options ? options.keyword_limit : 0
    const countText = options ? fmt(T.create.count, { count: model.stats.unique.length, limit }) : ''
    const over = Boolean(options) && model.stats.unique.length > limit
    const countEl = online.mode === 'regions' ? $('[data-final-count]') : $('[data-kw-count]')
    const dupEl = online.mode === 'regions' ? $('[data-final-dup]') : $('[data-kw-dup]')
    countEl.textContent = countText
    countEl.dataset.state = over ? 'over' : ''
    dupEl.textContent = model.stats.duplicates ? fmt(T.create.duplicates, { count: model.stats.duplicates }) : ''
    ;(online.mode === 'regions' ? finalInput : kwInput).classList.toggle('is-invalid', model.keywordInvalid)

    if (online.mode === 'map') renderMap(model)
    if (online.mode === 'regions') renderRegion()

    // 联系方式：Free 档禁用并说明原因；付费档默认开启、可关闭
    const contacts = $('[data-contacts]')
    const allowed = Boolean(options?.contacts_allowed)
    contacts.disabled = !allowed || busy
    contacts.checked = allowed && online.includeContacts
    $('[data-contacts-hint]').hidden = allowed

    // 额度
    const usageEl = $('[data-usage-mini]')
    if (options) {
      const { used, total } = options.usage
      const lvl = quotaLevel(used, total)
      patch(
        usageEl,
        `<div class="usage-mini-text"><span>${fmt(T.create.usage, { used: `<b>${num(used)}</b>`, total: num(total) })}</span></div>` +
          meter(used, total) +
          // 用尽时提示条已含重置说明，这里只在接近上限时补充
          (lvl === 'warn' ? `<span class="d-hint">${T.create.reset}</span>` : '')
      )
    }

    // 提示：额度用尽 > 关键词非法 > 地图超限 > 提交失败
    const messages = []
    if (options?.usage.exhausted) {
      messages.push(
        `<div class="callout callout--warn">${icon('alert')}<div class="callout-body"><span><b>${T.create.exhausted}</b> ${T.create.reset}</span>` +
          `<a class="d-link" href="../pricing.html#online">${T.account.upgrade}${icon('arrow-up-right')}</a></div></div>`
      )
    } else if (model.keywordInvalid) {
      messages.push(`<div class="callout callout--bad">${icon('alert')}<div class="callout-body">${fmt(T.create.invalid, { limit })}</div></div>`)
    }
    if (online.mode === 'map' && model.overLimit && !options?.usage.exhausted) {
      messages.push(`<div class="callout callout--bad">${icon('alert')}<div class="callout-body">${fmt(T.create.map.overLimit, { limit: options.logical_sample_limit })}</div></div>`)
    }
    if (online.submitError) messages.push(`<div class="callout callout--bad">${icon('alert')}<div class="callout-body">${online.submitError}</div></div>`)
    patch($('[data-composer-msgs]'), messages.join(''))

    const submit = $('[data-submit]')
    const blocked = busy || !options || options.usage.exhausted || model.invalid
    submit.disabled = blocked && !busy
    submit.classList.toggle('is-busy', busy)
    submit.setAttribute('aria-busy', String(busy))
    submit.innerHTML = busy ? `${spinner('spinner--sm')}${T.create.submitting}` : T.create.submit
  }

  /* ---------------------------------------------------------------- 地图 */
  // 原型示意地图：世界坐标固定的程序化街网，覆盖圈恒定约 200px（等价于落地 Leaflet 的 fitBounds）
  const mapSvg = $('[data-map-svg]')
  const mapPin = $('[data-map-pin]')
  const KM_PER_DEG = 111.32
  let mapFrame = { center: PORTLAND, k: 40 }

  const unit = (i, j, salt) => {
    const value = Math.sin(i * 127.1 + j * 311.7 + salt * 74.7) * 43758.5453
    return value - Math.floor(value)
  }

  function renderMap(model) {
    const { center, radius, spacing } = online.map
    const viewCenter = center ?? PORTLAND
    const k = 200 / Math.max(radius, 2)
    mapFrame = { center: viewCenter, k }
    const cos0 = Math.cos((PORTLAND.lat * Math.PI) / 180)
    const cx = (viewCenter.lng - PORTLAND.lng) * KM_PER_DEG * cos0
    const cy = (viewCenter.lat - PORTLAND.lat) * KM_PER_DEG
    const X = wx => (400 + (wx - cx) * k).toFixed(1)
    const Y = wy => (250 - (wy - cy) * k).toFixed(1)
    const x0 = cx - 400 / k
    const x1 = cx + 400 / k
    const y0 = cy - 250 / k
    const y1 = cy + 250 / k

    // 街网：取屏幕间距 ≥ 26px 的整间距，每 4 条一条主干道
    const step = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20].find(s => s * k >= 26) ?? 20
    let minor = ''
    let major = ''
    for (let i = Math.ceil(x0 / step); i <= Math.floor(x1 / step); i++) {
      const seg = `M${X(i * step)} -10V510`
      if (i % 4 === 0) major += seg
      else minor += seg
    }
    for (let j = Math.ceil(y0 / step); j <= Math.floor(y1 / step); j++) {
      const seg = `M-10 ${Y(j * step)}H810`
      if (j % 4 === 0) major += seg
      else minor += seg
    }
    const avenue = `M${X(x0 - 2)} ${Y(0.55 * (x0 - 2) + 1.2)}L${X(x1 + 2)} ${Y(0.55 * (x1 + 2) + 1.2)}`

    // 公园：3km 网格内按哈希随机落位，只在放大时绘制
    let parks = ''
    if (k >= 20) {
      for (let i = Math.floor(x0 / 3) - 1; i <= Math.ceil(x1 / 3); i++) {
        for (let j = Math.floor(y0 / 3) - 1; j <= Math.ceil(y1 / 3); j++) {
          if (unit(i, j, 1) < 0.45) continue
          const w = (0.5 + unit(i, j, 2) * 0.7) * k
          const h = (0.4 + unit(i, j, 3) * 0.5) * k
          const px = i * 3 + 0.3 + unit(i, j, 4) * 1.6
          const py = j * 3 + 0.4 + unit(i, j, 5) * 1.4
          parks += `<rect class="m-park" x="${X(px)}" y="${Y(py)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="6"/>`
        }
      }
    }

    // 河流：以纬向为参数的正弦曲线，每 36km 一条
    let rivers = ''
    const riverWidth = clamp(0.32 * k, 5, 34).toFixed(1)
    for (let n = Math.floor((x0 - 4) / 36); n <= Math.ceil((x1 + 4) / 36); n++) {
      const base = n * 36 - 1.5
      if (base < x0 - 4 || base > x1 + 4) continue
      const samples = 64
      let d = ''
      for (let s = 0; s <= samples; s++) {
        const wy = y0 - 1 + ((y1 - y0 + 2) * s) / samples
        const wx = base + 1.4 * Math.sin(wy / 2.3 + n) + 0.5 * Math.sin(wy / 0.8)
        d += `${s ? 'L' : 'M'}${X(wx)} ${Y(wy)}`
      }
      rivers += `<path class="mv-river" d="${d}" stroke-width="${riverWidth}"/>`
    }

    let overlay = ''
    if (center) {
      overlay += `<circle class="mv-coverage" cx="400" cy="250" r="${(radius * k).toFixed(1)}"/>`
      const points = model.viewports ?? []
      // 点数超过上限时不画点（与现状一致），只保留覆盖圈与超限提示
      if (points.length && points.length <= LOGICAL_SAMPLE_LIMIT) {
        const cosC = Math.cos((center.lat * Math.PI) / 180)
        const r = clamp(spacing * k * 0.16, 3, 6).toFixed(1)
        overlay +=
          `<g class="mv-points">` +
          points
            .map(point => {
              const px = 400 + (point.lng - center.lng) * KM_PER_DEG * cosC * k
              const py = 250 - (point.lat - center.lat) * KM_PER_DEG * k
              return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}"/>`
            })
            .join('') +
          `</g>`
      }
    }

    const html =
      `<rect class="m-land" width="800" height="500"/>${parks}` +
      `<g class="m-streets"><path d="${minor}"/></g>${rivers}` +
      `<g class="m-major"><path class="casing" d="${major}${avenue}"/><path class="road" d="${major}${avenue}"/></g>${overlay}`
    if (mapSvg._html !== html) {
      mapSvg.innerHTML = html
      mapSvg._html = html
    }

    mapPin.hidden = !center
    if (center && online.map.pinMoved) {
      online.map.pinMoved = false
      replay(mapPin, 'is-placed')
    }
    $('[data-map-hint]').hidden = Boolean(center)

    const limit = online.options?.logical_sample_limit ?? LOGICAL_SAMPLE_LIMIT
    const points = model.viewports?.length ?? 0
    $('[data-map-calc]').textContent = center
      ? fmt(T.create.map.points, { points, keywords: model.stats.unique.length })
      : T.create.map.chooseCenter
    const total = $('[data-map-total]')
    total.textContent = fmt(T.create.map.sampleCount, { count: model.items.length, limit })
    total.dataset.state = model.overLimit ? 'over' : ''
  }

  function setMapCenter(lat, lng, { fromInput = false } = {}) {
    const valid = Number.isFinite(lat) && Math.abs(lat) <= 85 && Number.isFinite(lng) && Math.abs(lng) <= 180
    online.map.center = valid ? { lat, lng } : null
    online.map.pinMoved = valid
    if (!fromInput && valid) {
      $('[data-map-lat]').value = String(lat)
      $('[data-map-lng]').value = String(lng)
    }
    renderComposer()
  }

  /* ---------------------------------------------------------------- 地区 */
  async function loadCountries() {
    const token = bootToken
    const region = online.region
    region.opened = true
    region.countriesLoading = true
    renderRegion()
    const countries = await fakeApi.regionCountries()
    if (token !== bootToken) return
    region.countries = countries
    region.countriesLoading = false
    renderRegion()
  }

  async function loadRegion(code) {
    const token = bootToken
    const region = online.region
    region.code = code
    region.data = null
    region.dataError = false
    region.stateCode = ''
    cityCombo.clear()
    if (!code) {
      renderRegion()
      return
    }
    region.dataLoading = true
    renderRegion()
    try {
      const data = await fakeApi.region(code)
      if (token !== bootToken || region.code !== code) return
      region.data = data
      // 原型专用：mock 只带四个国家的州与城市
      if (!REGION_DATA[code]) toast('原型说明', '原型只内置了 US / CA / GB / AU 的州与城市；落地时按国家加载 gmap-regions/{code}.json。', 'note', 'zh-CN')
    } catch {
      if (token !== bootToken || region.code !== code) return
      region.dataError = true
    } finally {
      if (token === bootToken && region.code === code) {
        region.dataLoading = false
        renderRegion()
      }
    }
  }

  function renderRegion() {
    const region = online.region
    const busy = online.submitting
    for (const [input, off] of [
      [countryInput, busy || region.countriesLoading || !region.countries.length],
      [stateInput, busy || !region.data]
    ]) {
      input.disabled = off
      $('[data-combo-toggle]', input.parentElement).disabled = off
    }
    countryCombo.sync()
    stateCombo.sync()
    $('[data-add-country]').disabled = busy || !region.code
    $('[data-add-state]').disabled = busy || !region.stateCode
    cityInput.disabled = busy || !region.data
    $('[data-generate]').disabled = busy || !baseInput.value.trim() || !region.selected.length

    let note = ''
    if (region.countriesLoading || region.dataLoading) note = `<p class="d-hint" role="status">${T.create.region.loading}</p>`
    else if (region.dataError) {
      note =
        `<div class="callout callout--bad" role="alert">${icon('alert')}<div class="callout-body"><span>${T.create.region.loadFailed}</span>` +
        `<button class="btn btn-secondary btn-xs" type="button" data-region-retry data-fk="region-retry">${icon('refresh')}${T.create.region.retry}</button></div></div>`
    }
    patch($('[data-region-note]'), note)
    patch(
      $('[data-region-chips]'),
      region.selected
        .map(
          place =>
            `<li class="place-chip"><span>${esc(place.label)}</span>` +
            `<button type="button" aria-label="${esc(fmt(T.create.region.remove, { name: place.label }))}" data-chip-remove="${esc(place.key)}"${busy ? ' disabled' : ''}>${icon('x')}</button></li>`
        )
        .join('')
    )
  }

  function addPlace(key, label) {
    const region = online.region
    if (!region.selected.some(place => place.key === key)) region.selected.push({ key, label, query: label })
    renderComposer()
  }

  // 过滤并排序：代码完全相同 > 名称前缀 > 名称包含（同级保持原顺序）；q 为空时原样返回
  function rankPairs(pairs, q, { byCode = false } = {}) {
    const needle = q.trim().toLowerCase()
    if (!needle) return pairs
    const score = ([code, name]) => {
      const lower = name.toLowerCase()
      if (byCode && code.toLowerCase() === needle) return 0
      if (lower.startsWith(needle)) return 1
      return lower.includes(needle) ? 2 : 3
    }
    return pairs
      .map(pair => [score(pair), pair])
      .filter(([rank]) => rank < 3)
      .sort((a, b) => a[0] - b[0])
      .map(([, pair]) => pair)
  }

  // 国家（252 个）、州 / 省：可输入过滤的 combobox，失焦时文本与某项完全相同才生效，否则恢复；清空 = 不选 / 全部州
  const countryInput = $('[data-region-country]')
  const stateInput = $('[data-region-state]')
  const cityInput = $('[data-city-input]')
  const countryCombo = Pop.combobox({
    input: countryInput,
    toggle: $('[data-combo="country"] [data-combo-toggle]'),
    field: $('[data-combo="country"]'),
    pop: $('[data-pop="country"]'),
    mode: 'value',
    allowEmpty: true,
    empty: T.create.region.noMatch,
    value: () => online.region.code,
    label: code => online.region.countries.find(([value]) => value === code)?.[1] ?? '',
    source: q =>
      rankPairs(online.region.countries, q, { byCode: true }).map(([code, name]) => ({ value: code, label: name, sub: code, current: code === online.region.code })),
    onSelect: match => loadRegion(match.value)
  })
  const stateCombo = Pop.combobox({
    input: stateInput,
    toggle: $('[data-combo="state"] [data-combo-toggle]'),
    field: $('[data-combo="state"]'),
    pop: $('[data-pop="state"]'),
    mode: 'value',
    allowEmpty: true,
    empty: T.create.region.noMatch,
    value: () => online.region.stateCode,
    label: code => (code ? (online.region.data?.s.find(([value]) => value === code)?.[1] ?? '') : ''),
    source: q =>
      rankPairs([['', T.create.region.allStates], ...(online.region.data?.s ?? [])], q).map(([code, name]) => ({
        value: code,
        label: name,
        current: code === online.region.stateCode
      })),
    onSelect(match) {
      online.region.stateCode = match.value
      cityCombo.clear()
      renderRegion()
    }
  })
  // 城市：输入两个字母起搜索（受所选州限制，最多 50 条），选中即加入已选地点并清空输入
  const cityCombo = Pop.combobox({
    input: cityInput,
    field: cityInput,
    pop: $('[data-pop="city"]'),
    mode: 'action',
    minChars: 2,
    empty: T.create.region.noMatch,
    source(q) {
      const region = online.region
      if (!region.data) return []
      const states = new Map(region.data.s)
      const needle = q.toLowerCase()
      return region.data.c
        .filter(([city, stateCode]) => (!region.stateCode || stateCode === region.stateCode) && city.toLowerCase().includes(needle))
        .slice(0, 50)
        .map(([city, stateCode]) => ({ value: `${stateCode}:${city}`, label: city, sub: states.get(stateCode) ?? '', city, stateCode }))
    },
    onSelect(match) {
      const region = online.region
      addPlace(`${region.code}:${match.stateCode}:${match.city}`, [match.city, match.sub, region.code].filter(Boolean).join(', '))
    }
  })

  function generateQueries() {
    const region = online.region
    const phrasing = $('[name="phrasing"]:checked').value
    const bases = [...new Set(baseInput.value.split(/\r?\n/).map(normalizeKeyword).filter(Boolean))]
    finalInput.value = bases.flatMap(base => region.selected.map(place => `${base} ${phrasing} ${place.query}`)).join('\n')
    replay(finalInput, 'is-filled')
    renderComposer()
  }

  function resetRegion() {
    const region = online.region
    baseInput.value = ''
    finalInput.value = ''
    region.selected = []
    loadRegion('')
  }

  /* ---------------------------------------------------------------- 加载与提交 */
  function loadOptions() {
    const token = bootToken
    // 失败面板在重试期间保持显示（按钮进入进行中），结果到达再切换，避免表单闪现
    online.optionsLoading = true
    renderUserPlan()
    renderComposer()
    online.optionsPromise = fakeApi
      .options()
      .then(options => {
        if (token !== bootToken) return
        online.options = options
        online.optionsError = false
        if (!options.contacts_allowed) online.includeContacts = false
      })
      .catch(() => {
        if (token !== bootToken) return
        online.options = null
        online.optionsError = true
      })
      .finally(() => {
        if (token !== bootToken) return
        online.optionsLoading = false
        renderUserPlan()
        renderComposer()
      })
    return online.optionsPromise
  }

  async function submitJob(event) {
    event.preventDefault()
    const model = composerModel()
    if (online.submitting || !online.options || online.options.usage.exhausted || model.invalid) return
    const token = bootToken
    online.submitting = true
    online.submitError = ''
    renderComposer()
    try {
      const job = await fakeApi.createJob(model.items, online.includeContacts && online.options.contacts_allowed)
      if (token !== bootToken) return
      if (online.mode === 'regions') resetRegion()
      else kwInput.value = ''
      // 新任务插到最近任务顶部并高亮；History 下次进入时按当前筛选重新拉取
      recent.highlight = job.job_no
      hist.stale = true
      toast(T.create.submitted, `${T.history.columns.taskNo} ${shortNo(job.job_no)}`)
    } catch {
      if (token !== bootToken) return
      online.submitError = T.create.failed
    } finally {
      if (token === bootToken) {
        online.submitting = false
        renderComposer()
        await loadRecent()
        if (!online.submitError) loadOptions()
      }
    }
  }

  /* =========================================================================
     10 · 任务列表：行组件（History 与最近任务共用）、最近任务、History（工具栏 / 列表 / 分页）
     ========================================================================= */
  const recentHost = $('[data-recent]')
  const histHost = $('[data-hist-jobs]')
  const histBar = $('[data-hist-bar]')
  const histAnnounce = $('[data-hist-announce]')
  const histInput = $('[data-hist-q]')
  const histClearBtn = $('[data-hist-clear]')
  const histStatusEl = $('[data-hist-status]')
  const rangeBtn = $('[data-hist-range-btn]')
  const filterBtn = $('[data-hist-filter-btn]')
  const histRefreshBtn = $('[data-hist-refresh]')
  const rangePop = $('[data-range-pop]')
  const filterPop = $('[data-filter-pop]')
  const sizePop = $('[data-size-pop]')

  const shortNo = jobNo => `${jobNo.slice(0, 8)}…`
  const errorLabel = code => T.history.errors[code] ?? T.history.errorFailed
  const RUNNING_STATUSES = ['queued', 'collecting', 'publishing']
  const STATUS_BADGE = {
    queued: ['badge--muted', icon('clock')],
    collecting: ['', spinner('spinner--xs')],
    publishing: ['', spinner('spinner--xs')],
    completed: ['badge--ok', icon('check')],
    partial: ['badge--warn', icon('alert')],
    failed: ['badge--bad', icon('x')]
  }

  /* ---------------------------------------------------------------- 行组件 */
  // 搜索命中高亮：只标第一处，大小写不敏感
  function highlight(text, q) {
    const index = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
    if (index < 0) return esc(text)
    return `${esc(text.slice(0, index))}<mark class="hl">${esc(text.slice(index, index + q.length))}</mark>${esc(text.slice(index + q.length))}`
  }

  // 任务格：关键词预览为主行（+ 其余数量），次行为创建时间（ET）与任务号前 8 位
  function identHtml(job, q = '') {
    const more = job.keyword_count - 1
    const no = job.job_no.slice(0, 8)
    const needle = q.toLowerCase()
    const noHtml =
      needle && HEXISH.test(needle) && job.job_no.startsWith(needle)
        ? `<mark class="hl">${esc(no.slice(0, needle.length))}</mark>${esc(no.slice(needle.length))}`
        : esc(no)
    return (
      `<span class="job-kw"><span class="job-kw-text">${highlight(job.keyword_preview, q)}</span>` +
      (more > 0
        ? `<span class="job-kw-more"><span aria-hidden="true">${fmt(T.history.moreKeywordsShort, { count: more })}</span>` +
          `<span class="sr-only">${fmt(T.history.moreKeywords, { count: more })}</span></span>`
        : '') +
      `</span><span class="job-sub"><span class="job-time">${fmtTime(job.created_at)} ${T.history.timezone}</span>` +
      `<span class="job-no"><span class="sr-only">${T.history.columns.taskNo} </span>${noHtml}…</span></span>`
    )
  }

  function progressCell(job) {
    const running = isRunning(job)
    const text = `<span class="job-prog-text"><b class="mono-num">${job.processed_count}</b> / <span class="mono-num">${job.total_count}</span></span>`
    return running ? text + meter(job.processed_count, job.total_count, { thin: true, levels: false }) : text
  }

  function statusCell(job) {
    const [cls, glyph] = STATUS_BADGE[job.status]
    return `<span class="badge${cls ? ` ${cls}` : ''}">${glyph}${T.history.status[job.status]}</span>`
  }

  // 任务级错误说明独立成格：宽屏排在徽标下方，窄屏卡片里独占一行
  const errCell = job => (job.error_code !== null ? `<p class="job-err">${errorLabel(job.error_code)}</p>` : '')

  function actionCell(job) {
    const jobNo = job.job_no
    let html = ''
    if (job.has_file) {
      const busy = downloads.busy.has(jobNo)
      html =
        `<button class="btn btn-secondary btn-xs${busy ? ' is-busy' : ''}" type="button" data-download="${jobNo}" data-fk="dl-${jobNo}" ` +
        `aria-label="${T.history.downloadCsv} ${shortNo(jobNo)}"${busy ? ' aria-busy="true"' : ''}>` +
        `${busy ? `${spinner('spinner--sm')}${T.history.downloading}` : `${icon('download')}${T.history.downloadCsv}`}</button>`
    } else if (!isRunning(job)) html = `<span class="job-nofile">${T.history.noFile}</span>`
    const message = downloads.messages.get(jobNo)
    if (message) html += `<p class="inline-err" role="alert">${message}</p>`
    return html
  }

  function itemState(item, job) {
    if (item.error_code !== null) return `<span class="item-state is-bad">${icon('x')}${errorLabel(item.error_code)}</span>`
    if (item.completed) return `<span class="item-state is-ok">${icon('check')}${T.history.detail.completed}</span>`
    return `<span class="item-state">${isRunning(job) ? icon('clock') : icon('minus')}${T.history.detail.pending}</span>`
  }

  function detailCell(job) {
    const jobNo = job.job_no
    if (hist.detailErrors.has(jobNo)) {
      return (
        `<div class="callout callout--bad" role="alert">${icon('alert')}<div class="callout-body"><span>${T.history.detail.loadFailed}</span>` +
        `<button class="btn btn-secondary btn-xs" type="button" data-detail-retry="${jobNo}" data-fk="dr-${jobNo}">${icon('refresh')}${T.history.retry}</button></div></div>`
      )
    }
    const detail = hist.details.get(jobNo)
    if (!detail) {
      return (
        `<div class="skel-stack" aria-hidden="true"><span class="skel skel--block" style="height: 72px"></span>` +
        `<span class="skel skel--block" style="height: 132px"></span></div>`
      )
    }
    const meta = detail.job
    const maxRecords = Math.max(1, ...detail.items.map(item => item.result_count))
    const rows = detail.items
      .map((item, index) => {
        const repeat = index > 0 && detail.items[index - 1].keyword === item.keyword
        const viewport = item.viewport
          ? `<span class="item-vp">${fmt(T.history.detail.viewport, { lat: item.viewport.lat.toFixed(4), lng: item.viewport.lng.toFixed(4), zoom: item.viewport.zoom })}</span>`
          : ''
        // 行内条只表达同一任务内的相对量，数值以文字为准
        const bar = item.completed
          ? `<span class="item-bar" aria-hidden="true"><i style="--v: ${((item.result_count / maxRecords) * 100).toFixed(1)}%"></i></span>`
          : ''
        return (
          `<tr role="row"><td role="cell" class="is-idx mono-num">${item.item_index + 1}</td>` +
          `<td role="cell"><div class="item-kw${repeat ? ' is-repeat' : ''}"><b>${highlight(item.keyword, histQuery.q)}</b>${viewport}</div></td>` +
          `<td role="cell" class="is-num"><span class="item-rec">${bar}<span class="mono-num">${item.completed ? num(item.result_count) : '—'}</span></span></td>` +
          `<td role="cell">${itemState(item, meta)}</td></tr>`
        )
      })
      .join('')
    return (
      `<dl class="detail-meta">` +
      `<div class="is-wide"><dt class="d-label">${T.history.columns.taskNo}</dt><dd><code class="mono-num">${jobNo}</code>` +
      `<button class="icon-btn" type="button" aria-label="${T.history.copyJob}" title="${T.history.copyJob}" data-copy="${jobNo}" data-fk="cp-${jobNo}">${icon('copy')}</button></dd></div>` +
      `<div class="is-wide"><dt class="d-label">${T.history.detail.runNo}</dt><dd><code class="mono-num">${meta.run_no}</code></dd></div>` +
      `<div><dt class="d-label">${T.history.detail.startedAt}</dt><dd>${fmtTime(meta.started_at)}</dd></div>` +
      `<div><dt class="d-label">${T.history.detail.finishedAt}</dt><dd>${fmtTime(meta.finished_at)}</dd></div>` +
      `<div class="is-wide"><dt class="d-label">${T.history.detail.contacts}</dt><dd>${meta.include_contacts ? T.history.detail.contactsEnabled : T.history.detail.contactsDisabled}</dd></div>` +
      `</dl>` +
      // 显式 ARIA 角色：窄屏把表格改成网格排版时仍保留表格语义
      `<div class="items" tabindex="0" role="region" aria-label="${T.history.detail.keyword}"><table role="table">` +
      `<thead role="rowgroup"><tr role="row"><th role="columnheader" class="is-idx d-label" scope="col">#</th><th role="columnheader" class="d-label" scope="col">${T.history.detail.keyword}</th>` +
      `<th role="columnheader" class="is-num d-label" scope="col">${T.history.detail.records}</th><th role="columnheader" class="d-label" scope="col">${T.history.columns.status}</th></tr></thead>` +
      `<tbody role="rowgroup">${rows}</tbody></table></div>` +
      `<p class="d-hint">${T.history.dedupeHint}</p>`
    )
  }

  // 最近任务（compact）：任务格是去 History 定位该任务的链接，没有展开明细
  function createJobRow(job, compact) {
    const li = document.createElement('li')
    li.className = 'job'
    li.dataset.job = job.job_no
    const ident = compact
      ? `<a class="job-link job-ident" href="${urlFor('history', { ...HIST_DEFAULTS, q: job.job_no })}" data-hist-link="${job.job_no}" data-cell="ident"></a>`
      : `<button class="job-toggle" type="button" aria-expanded="false" aria-controls="jd-${job.job_no}" data-toggle>` +
        `<span class="job-caret" aria-hidden="true">${icon('chevron-right')}</span><span class="job-ident" data-cell="ident"></span></button>`
    li.innerHTML =
      `<div class="job-row"${compact ? '' : ' data-row'}>` +
      `<div class="jc jc-id">${ident}</div>` +
      `<div class="jc jc-prog"><span class="jc-label d-label">${T.history.columns.samples}</span><div class="jc-body" data-cell="prog"></div></div>` +
      `<div class="jc jc-rec"><span class="jc-label d-label">${T.history.columns.records}</span><div class="jc-body" data-cell="rec"></div></div>` +
      `<div class="jc jc-status"><span class="jc-label d-label">${T.history.columns.status}</span><div class="jc-body" data-cell="status"></div></div>` +
      `<div class="jc jc-err" data-cell="err"></div>` +
      `<div class="jc jc-act" data-cell="act"></div>` +
      `</div>` +
      (compact
        ? ''
        : `<div class="job-detail" id="jd-${job.job_no}" role="region" aria-label="${T.history.detail.show} ${shortNo(job.job_no)}" inert>` +
          `<div class="job-detail-inner"><div class="job-detail-pad" data-cell="detail"></div></div></div>`)
    return li
  }

  function updateJobRow(li, job, { compact, q }) {
    const status = $('[data-cell="status"]', li)
    const before = status._html
    patch($('[data-cell="ident"]', li), identHtml(job, q))
    patch($('[data-cell="prog"]', li), progressCell(job))
    patch($('[data-cell="rec"]', li), `<span class="job-records mono-num">${job.status === 'queued' ? '—' : num(job.record_count)}</span>`)
    patch(status, statusCell(job))
    if (before && before !== status._html) $('.badge', status)?.classList.add('is-changed')
    patch($('[data-cell="err"]', li), errCell(job))
    patch($('[data-cell="act"]', li), actionCell(job))
    if (compact) return
    const open = hist.expanded.has(job.job_no)
    li.classList.toggle('is-open', open)
    $('[data-toggle]', li).setAttribute('aria-expanded', String(open))
    const detail = $('.job-detail', li)
    detail.inert = !open
    if (open) {
      const scroller = $('.items', li)
      const scrollTop = scroller ? scroller.scrollTop : 0
      patch($('[data-cell="detail"]', li), detailCell(job))
      const nextScroller = $('.items', li)
      if (nextScroller && scrollTop) nextScroller.scrollTop = scrollTop
    }
  }

  // keyed diff：按任务号复用行，展开动画、下载状态与焦点不被整段重绘打断（落地由 Vue keyed v-for 承担）
  function syncRows(list, jobs, { compact = false, q = '', fresh = '' } = {}) {
    for (const skel of $$(':scope > .is-skel', list)) skel.remove()
    delete list.dataset.skel
    const existing = new Map($$(':scope > .job', list).map(li => [li.dataset.job, li]))
    let cursor = list.firstElementChild
    for (const job of jobs) {
      let li = existing.get(job.job_no)
      if (!li) {
        li = createJobRow(job, compact)
        if (job.job_no === fresh) {
          li.classList.add('is-new')
          setTimeout(() => li.classList.remove('is-new'), 1600)
        }
      }
      existing.delete(job.job_no)
      if (li !== cursor) list.insertBefore(li, cursor)
      else cursor = cursor.nextElementSibling
      updateJobRow(li, job, { compact, q })
    }
    for (const stale of existing.values()) stale.remove()
  }

  const jobsHeadHtml = () =>
    `<span class="d-label">${T.history.columns.taskNo} · ${T.history.columns.createdAt}</span>` +
    `<span class="d-label">${T.history.columns.samples}</span><span class="d-label is-num">${T.history.columns.records}</span>` +
    `<span class="d-label">${T.history.columns.status}</span><span></span>`

  const SKEL_ROW =
    `<div class="job-row"><span class="skel-stack"><span class="skel" style="width: 72%"></span><span class="skel" style="width: 132px"></span></span>` +
    `<span class="skel" style="width: 64%"></span><span class="skel" style="width: 40px; justify-self: end"></span>` +
    `<span class="skel skel--pill" style="width: 96px; height: 22px"></span><span class="skel skel--pill" style="width: 120px; height: 32px; justify-self: end"></span></div>`

  function renderBanner(el, show, scope) {
    el.hidden = !show
    patch(
      el,
      show
        ? `<div class="callout callout--warn" role="status">${icon('alert')}<div class="callout-body"><span>${T.history.refreshFailed}</span>` +
            `<button class="btn btn-secondary btn-xs" type="button" data-list-refresh="${scope}" data-fk="banner-refresh">${icon('refresh')}${T.history.refresh}</button></div></div>`
        : ''
    )
  }

  // 任一列表观察到任务从运行中变为结束：刷新额度并提示一次（两张列表共用 watching，不重复）
  function observeJobs(jobs) {
    const finished = []
    for (const job of jobs) {
      if (isRunning(job)) watching.set(job.job_no, job.status)
      else if (watching.delete(job.job_no)) finished.push(job)
    }
    if (!finished.length) return
    loadOptions()
    finished.forEach(notifyFinished)
    // History 里同一批任务的状态已过期：下次进入或轮询时静默刷新
    if (hist.started) hist.stale = true
  }

  function notifyFinished(job) {
    const tone = job.status === 'failed' ? 'error' : job.status === 'partial' ? 'note' : 'ok'
    toast(
      fmt(T.history.finished, { job: shortNo(job.job_no), status: T.history.status[job.status] }),
      job.status === 'failed' ? errorLabel(job.error_code) : fmt(T.history.finishedRecords, { count: num(job.record_count) }),
      tone
    )
  }

  async function downloadCsv(jobNo) {
    if (downloads.busy.has(jobNo)) return
    const token = bootToken
    downloads.busy.add(jobNo)
    downloads.messages.delete(jobNo)
    renderLists()
    try {
      const file = await fakeApi.download(jobNo)
      if (token !== bootToken) return
      const url = URL.createObjectURL(new Blob([file.csv], { type: 'text/csv;charset=utf-8' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = file.filename
      anchor.rel = 'noopener'
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch (error) {
      if (token !== bootToken) return
      downloads.messages.set(jobNo, error.code === 404 ? T.history.downloadUnavailable : T.history.downloadFailed)
    } finally {
      if (token === bootToken) {
        downloads.busy.delete(jobNo)
        renderLists()
      }
    }
  }

  function renderLists() {
    renderRecent()
    renderHistory()
  }

  /* ---------------------------------------------------------------- 最近任务（Online） */
  async function loadRecent({ silent = false } = {}) {
    if (recent.loading) return
    const token = bootToken
    recent.loading = true
    recent.manual = !silent
    if (!silent) $('[data-recent-list]', recentHost)?.setAttribute('aria-busy', 'true')
    renderTopbarActions()
    try {
      const data = await fakeApi.listJobs({ offset: 0, limit: RECENT_LIMIT }, 'recent')
      if (token !== bootToken) return
      recent.jobs = data.jobs
      recent.total = data.total
      recent.loadError = false
      recent.refreshError = false
      observeJobs(data.jobs)
    } catch {
      if (token !== bootToken) return
      // 轮询 / 刷新失败保留上次结果，只有首次加载失败才整块替换为失败面板
      if (recent.jobs.length) recent.refreshError = true
      else recent.loadError = true
    } finally {
      if (token === bootToken) {
        recent.loading = false
        recent.manual = false
        renderRecent()
        renderTopbarActions()
      }
    }
  }

  function refreshOnline() {
    if (recent.loading) return
    recent.refreshError = false
    loadRecent()
    loadOptions()
  }

  function renderRecent() {
    if (!recent || !recent.started) return
    $('[data-recent-all]').hidden = !recent.jobs.length
    if (recent.loadError && !recent.jobs.length) {
      recentHost.dataset.mode = 'fail'
      patch(
        recentHost,
        `<div class="fail"><p class="fail-text">${icon('alert')}${T.history.loadFailed}</p>` +
          `<button class="btn btn-secondary btn-xs" type="button" data-recent-retry data-fk="recent-retry">${icon('refresh')}${T.history.retry}</button></div>`
      )
      return
    }
    if (!recent.jobs.length) {
      recentHost.dataset.mode = 'empty'
      patch(
        recentHost,
        `<div class="empty empty--compact"><span class="icon-tile">${icon('table')}</span><p class="empty-title">${T.history.emptyTitle}</p>` +
          `<p class="empty-hint">${T.history.recentEmptyHint}</p></div>`
      )
      return
    }
    if (recentHost.dataset.mode !== 'list') {
      recentHost.dataset.mode = 'list'
      recentHost._html = ''
      recentHost.innerHTML =
        `<div class="jobs-banner" data-recent-banner hidden></div>` +
        `<div class="jobs-head" aria-hidden="true">${jobsHeadHtml()}</div>` +
        `<ul class="jobs-list" aria-label="${T.history.recentTitle}" aria-busy="false" data-recent-list></ul>`
    }
    renderBanner($('[data-recent-banner]', recentHost), recent.refreshError, 'recent')
    const list = $('[data-recent-list]', recentHost)
    list.setAttribute('aria-busy', String(recent.loading && recent.manual))
    syncRows(list, recent.jobs, { compact: true, fresh: recent.highlight })
    recent.highlight = ''
  }

  /* ---------------------------------------------------------------- History：查询与加载 */
  const hasFilters = (hq = histQuery) => Boolean(hq.q) || hq.status !== 'all' || hq.range !== 'all'
  const queryKey = () => JSON.stringify(histQuery)
  const FULL_JOB_NO = /^[0-9a-f]{34}$/

  // 筛选 → 接口参数：Running 展开为三个运行中公开状态；时间范围按 ET 日界换算为毫秒（created_to 不含）
  function histApiQuery() {
    const today = etYmd(Date.now())
    let from = null
    let to = null
    if (histQuery.range === '7d') from = etMidnight(addDays(today, -6))
    else if (histQuery.range === '30d') from = etMidnight(addDays(today, -29))
    else if (histQuery.range === 'custom') {
      from = etMidnight(histQuery.from)
      to = etMidnight(addDays(histQuery.to, 1))
    }
    const statuses = histQuery.status === 'all' ? null : histQuery.status === 'running' ? RUNNING_STATUSES : [histQuery.status]
    return { offset: (histQuery.page - 1) * histQuery.size, limit: histQuery.size, q: histQuery.q, statuses, from, to }
  }

  // 筛选与页码只改当前历史记录（replaceState），刷新后保持，不污染后退栈
  function syncHistUrl() {
    if (route.current === 'history') history.replaceState({ view: 'history' }, '', urlFor('history'))
    syncRouteHrefs()
  }

  /** 修改查询：筛选变化回到第 1 页，列表区换骨架后重新拉取；工具栏与分页条保持原位。 */
  function setHistQuery(next, { resetPage = true } = {}) {
    Object.assign(histQuery, next)
    if (resetPage) histQuery.page = 1
    hist.expanded.clear()
    syncHistUrl()
    loadHist({ mode: 'swap' })
  }

  function resetHistFilters() {
    histInput.value = ''
    setHistQuery({ q: '', status: 'all', range: 'all', from: '', to: '' })
  }

  // 从最近任务定位某个任务（q = 任务号）或「View all」（q 为空）：其余筛选回到默认，保留每页条数
  function openHistory(q) {
    Object.assign(histQuery, { ...HIST_DEFAULTS, size: histQuery.size, q })
    histInput.value = q
    hist.expanded.clear()
    if (route.current === 'history') {
      syncHistUrl()
      loadHist({ mode: 'swap' })
    } else navigate('history')
  }

  async function loadHist({ mode = 'swap' } = {}) {
    const token = bootToken
    const seq = ++hist.seq
    const key = queryKey()
    hist.loading = true
    hist.loadingKey = key
    hist.mode = mode
    if (mode === 'swap') {
      renderHistory()
      scrollToHistTop()
    } else if (mode === 'busy') renderHistory()
    let expand = ''
    try {
      const data = await fakeApi.listJobs(histApiQuery())
      if (token !== bootToken || seq !== hist.seq) return
      // 页码越界（筛选后结果变少、地址栏手改）：回到最后一页
      const pages = Math.max(1, Math.ceil(data.total / histQuery.size))
      if (histQuery.page > pages) {
        histQuery.page = pages
        syncHistUrl()
        loadHist({ mode })
        return
      }
      hist.jobs = data.jobs
      hist.total = data.total
      hist.loadedKey = key
      hist.loadError = false
      hist.refreshError = false
      hist.stale = false
      hist.reveal = mode === 'swap' || mode === 'initial'
      observeJobs(data.jobs)
      // 搜索完整任务号且命中：自动展开该任务
      if (FULL_JOB_NO.test(histQuery.q) && data.jobs.some(job => job.job_no === histQuery.q) && !hist.expanded.has(histQuery.q)) {
        hist.expanded.add(histQuery.q)
        expand = histQuery.q
      }
    } catch {
      if (token !== bootToken || seq !== hist.seq) return
      // 刷新 / 轮询失败保留上次结果并提示；首屏、翻页与改筛选失败则列表区换成失败面板
      if ((mode === 'busy' || mode === 'silent') && hist.jobs.length && !hist.loadError) hist.refreshError = true
      else {
        hist.loadError = true
        hist.jobs = []
        hist.total = 0
      }
    } finally {
      if (token === bootToken && seq === hist.seq) {
        hist.loading = false
        hist.mode = ''
        if (!hist.ready) {
          hist.ready = true
          renderParts()
        }
        renderHistory()
        renderTopbarActions()
        if (mode !== 'silent') {
          histAnnounce.textContent = hist.loadError
            ? T.history.loadFailed
            : hist.refreshError
              ? T.history.refreshFailed
              : !hist.total
                ? hasFilters()
                  ? T.history.noMatchTitle
                  : T.history.emptyTitle
                : histRange().summary
        }
        if (expand) loadDetail(expand)
        for (const job of hist.jobs) {
          if (job.job_no !== expand && hist.expanded.has(job.job_no) && isRunning(job)) loadDetail(job.job_no, { silent: true })
        }
      }
    }
  }

  function refreshHist() {
    if (hist.loading && hist.mode !== 'silent') return
    hist.refreshError = false
    loadHist({ mode: 'busy' })
  }

  // 翻页 / 改筛选后回到列表顶部：只在工具栏已滚出视口时滚动（吸顶顶栏由 scroll-padding-top 让出）
  function scrollToHistTop() {
    const anchor = histBar.hidden ? histHost : histBar
    if (anchor.getBoundingClientRect().top < topbar.offsetHeight) {
      anchor.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' })
    }
  }

  async function loadDetail(jobNo, { silent = false } = {}) {
    const token = bootToken
    if (!silent) {
      hist.detailErrors.delete(jobNo)
      renderHistory()
    }
    try {
      const detail = await fakeApi.jobDetail(jobNo)
      if (token !== bootToken) return
      hist.details.set(jobNo, detail)
      hist.detailErrors.delete(jobNo)
    } catch {
      if (token !== bootToken) return
      if (!hist.details.has(jobNo)) hist.detailErrors.add(jobNo)
    } finally {
      if (token === bootToken) renderHistory()
    }
  }

  function toggleDetail(jobNo) {
    if (hist.expanded.has(jobNo)) {
      hist.expanded.delete(jobNo)
      renderHistory()
      return
    }
    hist.expanded.add(jobNo)
    renderHistory()
    loadDetail(jobNo)
  }

  /* ---------------------------------------------------------------- History：渲染 */
  // 页码固定 7 格（首尾 + 当前页附近 + 省略号），翻页时分页条宽度不变
  function pageItems(page, pages) {
    if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, 'gap', pages]
    if (page >= pages - 3) return [1, 'gap', pages - 4, pages - 3, pages - 2, pages - 1, pages]
    return [1, 'gap', page - 1, page, page + 1, 'gap', pages]
  }

  function histRange() {
    const pages = Math.max(1, Math.ceil(hist.total / histQuery.size))
    const page = Math.min(histQuery.page, pages)
    const from = hist.total ? (page - 1) * histQuery.size + 1 : 0
    const to = Math.min(page * histQuery.size, hist.total)
    return { pages, page, summary: fmt(T.history.pagination.summary, { from: num(from), to: num(to), total: num(hist.total) }) }
  }

  // 边界按钮用 aria-disabled 而不是 disabled：翻到末页时焦点仍留在按钮上
  function histPagerHtml() {
    const { pages, page, summary } = histRange()
    const edge = flag => (flag ? ' aria-disabled="true"' : '')
    const numbers = pageItems(page, pages)
      .map(item =>
        item === 'gap'
          ? `<span class="page-gap" aria-hidden="true">…</span>`
          : `<button class="page-btn" type="button" data-hist-page="${item}" data-fk="pg-${item}" aria-label="${fmt(T.history.pagination.page, { page: item })}"${item === page ? ' aria-current="page"' : ''}>${item}</button>`
      )
      .join('')
    return (
      `<span class="jobs-range">${summary}</span>` +
      `<div class="pager">` +
      `<button class="btn btn-secondary btn-xs" type="button" data-hist-page="${page - 1}" data-fk="pg-prev"${edge(page <= 1)}>${T.history.pagination.previous}</button>` +
      `<div class="pager-pages">${numbers}</div>` +
      `<button class="btn btn-secondary btn-xs" type="button" data-hist-page="${page + 1}" data-fk="pg-next"${edge(page >= pages)}>${T.history.pagination.next}</button>` +
      `</div>` +
      `<div class="pager-size"><span id="hist-size-label">${T.history.pagination.pageSize}</span>` +
      `<button class="select-btn" type="button" id="hist-size-btn" aria-haspopup="listbox" aria-expanded="${Pop.isOpen(sizePop)}" aria-controls="hist-size-list" ` +
      `aria-labelledby="hist-size-label hist-size-btn" data-hist-size data-fk="pg-size"><span>${histQuery.size}</span>${icon('chevron-down', 'pop-caret')}</button></div>`
    )
  }

  function histPanelHtml(view) {
    if (view === 'fail') {
      return (
        `<div class="fail"><p class="fail-text">${icon('alert')}${T.history.loadFailed}</p>` +
        `<button class="btn btn-secondary btn-xs${hist.loading ? ' is-busy' : ''}" type="button" data-hist-retry data-fk="hist-retry"${hist.loading ? ' aria-busy="true"' : ''}>` +
        `${hist.loading ? spinner('spinner--sm') : icon('refresh')}${T.history.retry}</button></div>`
      )
    }
    // 两种空态：有筛选时是「无匹配结果」（可一键清除筛选），无筛选时才是「还没有任务」
    if (view === 'nomatch') {
      return (
        `<div class="empty"><span class="icon-tile">${icon('search')}</span><p class="empty-title">${T.history.noMatchTitle}</p>` +
        `<p class="empty-hint">${T.history.noMatchHint}</p><div class="empty-actions">` +
        `<button class="btn btn-secondary btn-xs" type="button" data-hist-reset data-fk="hist-reset">${icon('x')}${T.history.filters.clear}</button></div></div>`
      )
    }
    return (
      `<div class="empty"><span class="icon-tile">${icon('table')}</span><p class="empty-title">${T.history.emptyTitle}</p>` +
      `<p class="empty-hint">${T.history.emptyHint}</p><div class="empty-actions">` +
      `<a class="btn btn-primary btn-xs" href="${urlFor('online')}" data-route="online">${icon('cloud')}${T.history.emptyCta}</a></div></div>`
    )
  }

  function renderHistory() {
    if (!hist || !hist.started) return
    syncHistToolbar()
    const swapping = hist.loading && (hist.mode === 'swap' || hist.mode === 'initial')
    const view = swapping ? 'skeleton' : hist.loadError ? 'fail' : !hist.total ? (hasFilters() ? 'nomatch' : 'empty') : 'list'
    // 还没有任何任务时不显示筛选工具栏
    histBar.hidden = view === 'empty'

    if (!histHost.dataset.frame) {
      histHost.dataset.frame = 'ready'
      histHost.innerHTML =
        `<div class="jobs-banner" data-hist-banner hidden></div>` +
        `<div class="jobs-head" aria-hidden="true" data-hist-head>${jobsHeadHtml()}</div>` +
        `<div data-hist-body></div>` +
        `<nav class="jobs-foot" aria-label="${T.history.pagination.label}" data-hist-foot hidden></nav>`
    }
    const rows = view === 'skeleton' || view === 'list'
    const bodyEl = $('[data-hist-body]', histHost)
    $('[data-hist-head]', histHost).hidden = !rows
    renderBanner($('[data-hist-banner]', histHost), view === 'list' && hist.refreshError, 'history')

    if (rows) {
      let list = $('[data-hist-list]', bodyEl)
      if (!list) {
        bodyEl._html = ''
        bodyEl.innerHTML = `<ul class="jobs-list" aria-label="${T.history.title}" aria-busy="false" data-hist-list></ul>`
        list = $('[data-hist-list]', bodyEl)
      }
      if (view === 'skeleton') {
        // 与当前行数一致的骨架（至少 3 行），列表区高度在加载中保持不变
        const count = String(clamp(hist.jobs.length || 5, 3, histQuery.size))
        list.setAttribute('aria-busy', 'true')
        if (list.dataset.skel !== count) {
          list.classList.remove('is-revealed')
          list.innerHTML = Array.from({ length: Number(count) }, () => `<li class="job is-skel" aria-hidden="true">${SKEL_ROW}</li>`).join('')
          list.dataset.skel = count
        }
      } else {
        list.setAttribute('aria-busy', String(hist.loading && hist.mode === 'busy'))
        syncRows(list, hist.jobs, { q: histQuery.q })
        if (hist.reveal) {
          hist.reveal = false
          replay(list, 'is-revealed')
        }
      }
    } else patch(bodyEl, histPanelHtml(view))

    const foot = $('[data-hist-foot]', histHost)
    foot.hidden = !rows || !hist.total
    if (!foot.hidden) patch(foot, histPagerHtml())
  }

  /* ---------------------------------------------------------------- History：工具栏 */
  function rangeLabel() {
    if (histQuery.range === '7d') return T.history.range.last7
    if (histQuery.range === '30d') return T.history.range.last30
    if (histQuery.range === 'custom') return `${fmtDay(histQuery.from)} – ${fmtDayYear(histQuery.to)}`
    return T.history.range.all
  }

  function syncHistToolbar() {
    // 输入框聚焦时以用户正在输入的内容为准，不回写
    if (document.activeElement !== histInput && histInput.value !== histQuery.q) histInput.value = histQuery.q
    histClearBtn.hidden = !histInput.value
    for (const btn of $$('[data-status]', histStatusEl)) {
      const on = btn.dataset.status === histQuery.status
      btn.setAttribute('aria-checked', String(on))
      btn.tabIndex = on ? 0 : -1
    }
    placeSegThumb(histStatusEl)
    $('[data-hist-range-label]').textContent = rangeLabel()
    const count = (histQuery.status !== 'all') + (histQuery.range !== 'all')
    const badge = $('[data-hist-filter-count]')
    badge.hidden = !count
    badge.textContent = String(count)
    const busy = hist.loading && hist.mode === 'busy'
    histRefreshBtn.classList.toggle('is-spinning', busy)
    histRefreshBtn.setAttribute('aria-busy', String(busy))
  }

  // 搜索：输入停顿 300ms 生效，Enter 立即生效，Esc / 清除按钮一键清空
  let searchTimer = 0

  function applySearch() {
    clearTimeout(searchTimer)
    const q = histInput.value.trim().slice(0, 100)
    if (q !== histQuery.q) setHistQuery({ q })
  }

  /* ---------------------------------------------------------------- 时间范围 / 窄屏筛选菜单（.pop + APG menu） */
  // 预设项点选即生效；「Custom range」进入同一浮层里的日期子面板，Apply 才生效（日期为 ET 日历日，含两端）
  let rangeDraft = { from: '', to: '' }

  function openRangeDraft() {
    const today = etYmd(Date.now())
    rangeDraft = histQuery.range === 'custom' ? { from: histQuery.from, to: histQuery.to } : { from: addDays(today, -6), to: today }
  }

  const draftValid = () => YMD.test(rangeDraft.from) && YMD.test(rangeDraft.to) && rangeDraft.from <= rangeDraft.to

  const radioItem = (checked, label, attrs) =>
    `<button class="pop-item" type="button" role="menuitemradio" tabindex="-1" aria-checked="${checked}" ${attrs}>` +
    `<span class="pop-item-label">${label}</span>${icon('check', 'pop-check')}</button>`

  // 两个菜单共用：三个预设单选项 + 进入日期子面板的「Custom range」；p 区分 id 与 data-fk（rp 时间范围菜单，fp 筛选菜单）
  function rangeItemsHtml(p) {
    const presets = [['7d', T.history.range.last7], ['30d', T.history.range.last30], ['all', T.history.range.all]]
      .map(([value, label]) => radioItem(histQuery.range === value, label, `data-range="${value}" data-fk="${p}-r-${value}"`))
      .join('')
    const custom = histQuery.range === 'custom'
    return (
      presets +
      `<button class="pop-item${custom ? ' is-current' : ''}" type="button" role="menuitem" tabindex="-1" aria-haspopup="dialog" aria-expanded="false" aria-controls="${p}-custom" data-fk="${p}-r-custom">` +
      `<span class="pop-item-label">${T.history.range.custom}</span>` +
      `<span class="pop-item-end">${custom ? `${fmtDay(histQuery.from)} – ${fmtDay(histQuery.to)}` : ''}${icon('chevron-right', 'icon--xs')}</span></button>`
    )
  }

  // 日期子面板：返回按钮在表单里是 Tab 停靠点（Shift+Tab 越过它即关闭菜单）；Esc / ← 回上一层
  function customPanelHtml(p) {
    const today = etYmd(Date.now())
    const date = (key, label, value) =>
      `<label><span class="d-label">${label}</span><input class="input input--sm" type="date" value="${value}" max="${today}" aria-describedby="${p}-hint" ` +
      `data-range-${key}${key === 'from' ? ' data-autofocus' : ''} data-fk="${p}-${key}" /></label>`
    return (
      `<div class="pop-panel" hidden><div class="pop-head">` +
      `<button class="icon-btn icon-btn--sm" type="button" aria-label="${T.shell.back}" data-pop-back data-fk="${p}-back">${icon('chevron-left')}</button>` +
      `<span class="pop-title" id="${p}-custom-title">${T.history.range.custom}</span></div>` +
      `<div class="pop-body"><div class="pop-form" role="group" id="${p}-custom" aria-labelledby="${p}-custom-title">` +
      `<div class="pop-dates">${date('from', T.history.range.from, rangeDraft.from)}${date('to', T.history.range.to, rangeDraft.to)}</div>` +
      `<div class="pop-foot"><span class="d-hint" id="${p}-hint" data-range-hint></span>` +
      `<button class="btn btn-primary btn-xs" type="button" data-range-apply data-fk="${p}-apply">${T.history.range.apply}</button></div>` +
      `</div></div></div>`
    )
  }

  // 只更新提示与 Apply 状态，不重绘日期输入框（避免打断正在输入的日期分段）
  function syncRangeValidity(pop) {
    const hint = $('[data-range-hint]', pop)
    const valid = draftValid()
    hint.textContent = valid ? T.history.range.hint : T.history.range.invalid
    hint.classList.toggle('inline-err', !valid)
    $('[data-range-apply]', pop).setAttribute('aria-disabled', String(!valid))
  }

  function renderRangeMenu() {
    patch(
      rangePop,
      `<div class="pop-panels"><div class="pop-panel">` +
        `<div class="pop-body" role="menu" id="hist-range-menu" aria-label="${T.history.range.label}">${rangeItemsHtml('rp')}</div>` +
        `</div>${customPanelHtml('rp')}</div>`
    )
    syncRangeValidity(rangePop)
  }

  function renderFilterMenu() {
    const labels = {
      all: T.history.filters.all,
      running: T.history.filters.running,
      completed: T.history.status.completed,
      partial: T.history.status.partial,
      failed: T.history.status.failed
    }
    const statuses = HIST_STATUSES.map(value =>
      radioItem(histQuery.status === value, labels[value], `data-status-opt="${value}" data-fk="fp-s-${value}"`)
    ).join('')
    const group = (label, items) =>
      `<div role="group" aria-label="${label}"><span class="pop-label d-label" aria-hidden="true">${label}</span>${items}</div>`
    patch(
      filterPop,
      `<div class="pop-panels"><div class="pop-panel">` +
        `<div class="pop-body" role="menu" id="hist-filter-menu" aria-label="${T.history.filters.label}">` +
        group(T.history.filters.status, statuses) +
        `<div class="pop-sep" role="separator"></div>` +
        group(T.history.range.label, rangeItemsHtml('fp')) +
        `<div class="pop-sep" role="separator"></div>` +
        `<button class="pop-item" type="button" role="menuitem" tabindex="-1" aria-disabled="${!hasFilters()}" data-filters-clear data-fk="fp-clear">` +
        `${icon('x')}<span class="pop-item-label">${T.history.filters.clear}</span></button>` +
        `</div></div>${customPanelHtml('fp')}</div>`
    )
    syncRangeValidity(filterPop)
  }

  // 宽屏时间范围：单一用途菜单，打开时聚焦当前范围，选中预设即关闭
  const rangeCtl = Pop.menu(rangePop, {
    anchor: () => rangeBtn.getBoundingClientRect(),
    trigger: () => rangeBtn,
    owns: target => rangeBtn.contains(target),
    side: 'bottom',
    align: 'end',
    initial: items => items.find(item => item.getAttribute('aria-checked') === 'true' || item.classList.contains('is-current')),
    render() {
      openRangeDraft()
      rangePop._html = '' // 每次打开都重建，丢掉上次没有 Apply 的日期输入
      renderRangeMenu()
    },
    onSelect(item) {
      const range = item.dataset.range
      if (range !== histQuery.range) setHistQuery({ range, from: '', to: '' })
    }
  })

  // 窄屏「Filters」：状态与时间范围两组单选，点选后保持打开并就地更新（Enter 按 APG 激活并关闭）
  const filterCtl = Pop.menu(filterPop, {
    anchor: () => filterBtn.getBoundingClientRect(),
    trigger: () => filterBtn,
    owns: target => filterBtn.contains(target),
    side: 'bottom',
    align: 'end',
    render() {
      openRangeDraft()
      filterPop._html = '' // 同上
      renderFilterMenu()
    },
    onSelect(item) {
      if (item.hasAttribute('data-filters-clear')) {
        resetHistFilters()
        return
      }
      const { statusOpt: status, range } = item.dataset
      if (status && status !== histQuery.status) setHistQuery({ status })
      if (range && range !== histQuery.range) setHistQuery({ range, from: '', to: '' })
      renderFilterMenu()
      return 'stay'
    }
  })

  /* =========================================================================
     11 · 任务进度模拟（原型专用）：真实为 5 秒轮询，原型 2.6 秒推进一步
     ========================================================================= */
  let simTimer = 0

  function advanceJob(job) {
    const now = Date.now()
    if (job.status === 'queued') {
      job.status = 'collecting'
      job.started_at = now
      return
    }
    if (job.status === 'collecting') {
      const random = rng(hashSeed(`${job.job_no}${job.processed_count}`))
      const pending = job.items.filter(item => !item.completed)
      for (const item of pending.slice(0, pending.length > 3 ? 2 : 1)) {
        item.completed = true
        item.result_count = item.viewport ? 8 + Math.floor(random() * 40) : 20 + Math.floor(random() * 110)
      }
      job.processed_count = job.items.filter(item => item.completed).length
      job.record_count = job.items.reduce((sum, item) => sum + item.result_count, 0)
      if (job.processed_count === job.total_count) job.status = 'publishing'
      return
    }
    // 发布：有失败采样则部分成功（31302）；合法零结果为 completed 且无文件、不扣量
    const partial = job.items.some(item => item.error_code !== null)
    job.status = partial ? 'partial' : 'completed'
    job.error_code = partial ? 31302 : null
    job.has_file = job.record_count > 0
    job.finished_at = now
    db.onlineUsed += job.record_count
  }

  function simTick() {
    if (document.hidden || globalState() !== 'ready') return
    const running = db.jobs.filter(isRunning)
    if (!running.length) return
    running.forEach(advanceJob)
    // 最近任务里有运行中任务就轮询（切到其他视图也继续，用于完成提示）；失败后停止，直到用户手动刷新
    if (recent.started && !recent.refreshError && !recent.loading && recent.jobs.some(isRunning)) {
      if (fault('poll')) {
        recent.refreshError = true
        renderRecent()
        renderTopbarActions()
      } else loadRecent({ silent: true })
    }
    // History 只在当前视图、且当前页有运行中任务时轮询当前页
    if (route.current === 'history' && hist.started && !hist.refreshError && !hist.loading && hist.jobs.some(isRunning)) {
      loadHist({ mode: 'silent' })
    }
  }

  function startSim() {
    stopSim()
    if (proto.sim === 'on') simTimer = setInterval(simTick, 2600)
  }

  function stopSim() {
    clearInterval(simTimer)
    simTimer = 0
  }

  /* =========================================================================
     12 · API 管理
     ========================================================================= */
  const apiContent = $('[data-view="api"] [data-part="content"]')

  function renderApi() {
    if (!apiView.started) return
    if (apiView.error) {
      apiContent.dataset.mode = 'fail'
      patch(
        apiContent,
        `<div class="view-stack"><p class="view-intro">${T.api.description}</p>` +
          `<div class="d-panel fail"><p class="fail-text">${icon('alert')}${T.api.loadFailed}</p>` +
          `<button class="btn btn-secondary btn-xs" type="button" data-api-retry data-fk="api-retry">${icon('refresh')}${T.api.retry}</button></div></div>`
      )
      return
    }
    if (!apiView.key) return
    if (apiContent.dataset.mode !== 'ready') {
      apiContent.dataset.mode = 'ready'
      apiContent._html = ''
      // 合卡：头部（套餐，来自会话）与用量区（usage 接口）各自加载、各自失败
      apiContent.innerHTML =
        `<div class="view-stack"><p class="view-intro">${T.api.description}</p><div class="api-grid">` +
        `<section class="d-panel api-plan" data-area="plan" aria-labelledby="api-plan-title">` +
        `<div class="api-plan-head" data-api-plan-head></div>` +
        `<section class="api-usage" aria-labelledby="api-usage-title" data-api-usage></section></section>` +
        `<section class="d-panel" data-area="key" aria-labelledby="api-key-title"><div class="d-panel-head"><h2 class="d-panel-title" id="api-key-title">${T.api.keyTitle}</h2></div>` +
        `<div class="key-body" data-api-key></div></section>` +
        `<section class="d-panel" data-area="conn" aria-labelledby="api-conn-title"><div class="d-panel-head"><h2 class="d-panel-title" id="api-conn-title">${T.api.connectionsTitle}</h2></div>` +
        `<div class="d-panel-body"><div class="conn-grid" data-api-conn></div></div></section>` +
        `<section class="d-panel" data-area="apps" aria-labelledby="api-apps-title"><div class="d-panel-head"><div><h2 class="d-panel-title" id="api-apps-title" tabindex="-1">${T.api.grants.title}</h2>` +
        `<p class="d-section-desc">${T.api.grants.description}</p></div></div><div class="d-panel-body" data-api-apps></div></section>` +
        `</div></div>`
    }
    renderApiPlan()
    renderApiUsage()
    renderApiKey()
    renderApiConn()
    renderGrants()
  }

  function renderApiKey() {
    const el = $('[data-api-key]', apiContent)
    if (!el) return
    const key = apiView.key
    const busy = apiView.generating
    let html = ''
    if (key.has_api_key) {
      html +=
        `<div class="key-line"><span class="key-chip">${icon('key')}${esc(key.api_key_prefix)}…</span>` +
        `<span class="d-hint">${T.api.keyCreated} ${fmtDate(key.api_key_created_at)}</span></div>`
    } else html += `<p class="d-muted key-line">${T.api.keyEmpty}</p>`
    if (apiView.plainKey) {
      html +=
        `<div class="callout callout--warn">${icon('alert')}<div class="callout-body"><span>${T.api.keyOnce}</span>` +
        `<div class="copy-field"><code class="copy-value copy-value--wrap" data-plain-key>${esc(apiView.plainKey)}</code></div>` +
        `<button class="btn btn-primary btn-xs" type="button" data-copy="${esc(apiView.plainKey)}" data-fk="copy-key">${icon('copy')}${T.api.copyKey}</button></div></div>`
    }
    if (apiView.keyError) html += `<p class="inline-err" role="alert">${apiView.keyError}</p>`
    const label = busy ? `${spinner('spinner--sm')}${T.api.generatingKey}` : key.has_api_key ? `${icon('refresh')}${T.api.rotateKey}` : `${icon('key')}${T.api.generateKey}`
    const style = key.has_api_key ? 'btn-secondary' : 'btn-primary'
    html += `<div class="key-actions"><button class="btn ${style} btn-xs${busy ? ' is-busy' : ''}" type="button" data-gen-key data-fk="gen-key"${busy ? ' aria-busy="true"' : ''}>${label}</button></div>`
    patch(el, html)
  }

  /** 合卡头部：套餐名 + 状态（续期 / 到期日与自动续费，措辞与账户菜单、订阅页一致）；右侧刷新 + 管理订阅或升级。 */
  function renderApiPlan() {
    const el = $('[data-api-plan-head]', apiContent)
    if (!el) return
    const sub = session.subs.api
    const refreshing = apiView.usageLoading
    const refresh =
      `<button class="icon-btn icon-btn--sm${refreshing ? ' is-spinning' : ''}" type="button" aria-label="${T.api.refresh}" title="${T.api.refresh}" ` +
      `data-usage-refresh data-fk="usage-refresh"${refreshing ? ' aria-busy="true"' : ''}>${icon('refresh')}</button>`
    let ident
    let action = ''
    if (sub.status === 'unavailable') {
      // 订阅摘要不可用只影响头部：不伪装成 Free，也不给管理入口；用量区照常
      ident = `<div class="callout callout--warn">${icon('alert')}<div class="callout-body">${T.subscriptions.unavailable}</div></div>`
    } else if (isActiveSub(sub)) {
      ident =
        `<span class="plan-big">${esc(sub.display_name)}</span>` +
        `<p class="api-plan-status"><span>${T.subscriptions.expiresLabel} ${fmtDate(sub.expires_at)}</span>` +
        `<span>${icon('refresh', 'icon--xs')}${sub.auto_renew ? T.subscriptions.autoRenewOn : T.subscriptions.autoRenewOff}</span></p>`
      action = `<a class="btn btn-secondary btn-xs" href="${urlFor('subscriptions')}" data-route="subscriptions">${icon('tag')}${T.api.managePlan}</a>`
    } else {
      ident = `<span class="plan-big">${T.subscriptions.free}</span>`
      action = `<a class="btn btn-secondary btn-xs" href="../pricing.html#api">${T.account.upgrade}${icon('arrow-up-right')}</a>`
    }
    patch(
      el,
      `<div class="api-plan-id"><h2 class="d-label" id="api-plan-title">${T.api.planTitle}</h2>${ident}</div>` +
        `<div class="api-plan-actions">${refresh}${action}</div>`
    )
  }

  /** 合卡用量区：大数字 + 「/ 上限 requests」+ meter（≥ 80% 提醒）+ 周期与重置说明；失败只在这里出重试。 */
  function renderApiUsage() {
    const el = $('[data-api-usage]', apiContent)
    if (!el) return
    const usage = apiView.usage
    const title = `<h3 class="d-label" id="api-usage-title">${T.api.usageTitle}</h3>`
    el.setAttribute('aria-busy', String(apiView.usageLoading && Boolean(usage)))
    let html
    if (!usage && apiView.usageError) {
      const busy = apiView.usageLoading
      html =
        title +
        `<div class="callout callout--bad" role="alert">${icon('alert')}<div class="callout-body"><span>${T.api.usageFailed}</span>` +
        `<button class="btn btn-secondary btn-xs${busy ? ' is-busy' : ''}" type="button" data-usage-retry data-fk="usage-retry"${busy ? ' aria-busy="true"' : ''}>` +
        `${busy ? spinner('spinner--sm') : icon('refresh')}${T.api.retry}</button></div></div>`
    } else if (!usage) {
      html =
        title +
        `<div class="skel-stack" aria-hidden="true"><span class="skel" style="width: 46%; height: 28px"></span>` +
        `<span class="skel skel--pill" style="height: 6px"></span><span class="skel" style="width: 82%"></span></div>`
    } else {
      const { used, total, period, exhausted } = usage
      html =
        title +
        `<p class="stat">${fmt(T.api.usageValue, { used: `<span class="stat-big">${num(used)}</span>`, total: num(total) })}</p>` +
        meter(used, total) +
        `<p class="d-hint">${fmt(T.api.usagePeriod, { period })} · ${T.api.quotaReset}</p>` +
        (exhausted ? `<div class="callout callout--warn">${icon('alert')}<div class="callout-body">${T.api.quotaExhausted}</div></div>` : '') +
        // 刷新失败保留上次数值，只补一行提示
        (apiView.usageError ? `<p class="inline-err" role="alert">${T.api.usageFailed}</p>` : '')
    }
    patch(el, html)
  }

  function renderApiConn() {
    const el = $('[data-api-conn]', apiContent)
    if (!el) return
    const { api_base_url: apiUrl, mcp_url: mcpUrl } = apiView.connection
    const field = (value, fk) =>
      `<div class="copy-field"><code class="copy-value">${esc(value)}</code>` +
      `<button class="icon-btn icon-btn--sm copy-btn" type="button" aria-label="${T.api.copyUrl}" title="${T.api.copyUrl}" data-copy="${esc(value)}" data-fk="${fk}">${icon('copy')}</button></div>`
    patch(
      el,
      `<div class="conn-row"><span class="conn-label">${T.api.apiUrl}</span>${field(apiUrl, 'copy-api')}</div>` +
        `<div class="conn-row"><span class="conn-label">${T.api.mcpUrl}</span>` +
        (mcpUrl ? `${field(mcpUrl, 'copy-mcp')}<p class="d-hint">${T.api.mcpHint}</p>` : `<p class="d-muted">${T.api.mcpUnavailable}</p>`) +
        `</div>`
    )
  }

  function renderGrants() {
    const el = $('[data-api-apps]', apiContent)
    if (!el) return
    let html
    if (apiView.grantsError) {
      html =
        `<div class="callout callout--bad" role="alert">${icon('alert')}<div class="callout-body"><span>${T.api.grants.loadFailed}</span>` +
        `<button class="btn btn-secondary btn-xs" type="button" data-grants-retry data-fk="grants-retry">${icon('refresh')}${T.api.retry}</button></div></div>`
    } else if (apiView.grantsLoading && !apiView.grants.length) {
      html = `<div class="skel-stack" aria-hidden="true"><span class="skel skel--block" style="height: 56px"></span><span class="skel skel--block" style="height: 56px"></span></div>`
    } else if (!apiView.grants.length) {
      html = `<p class="d-muted">${T.api.grants.empty}</p>`
    } else {
      html =
        `<ul class="grants">` +
        apiView.grants
          .map(grant => {
            const busy = apiView.revoking.has(grant.grant_id)
            const message = apiView.grantMessages.get(grant.grant_id)
            return (
              `<li class="grant" data-grant="${grant.grant_id}"><span class="icon-tile" aria-hidden="true">${icon('bot')}</span>` +
              `<div class="grant-main"><span class="grant-host">${esc(grant.redirect_host)}</span>` +
              `<span class="grant-name">${esc(fmt(T.api.grants.selfDeclared, { name: grant.client_name }))}</span>` +
              `<span class="grant-meta"><span>${T.api.grants.createdLabel} ${fmtTime(grant.created_at)}</span>` +
              `<span>${T.api.grants.refreshedLabel} ${grant.last_refreshed_at ? fmtTime(grant.last_refreshed_at) : T.api.grants.notRefreshed}</span></span>` +
              (message ? `<p class="inline-err" role="alert">${message}</p>` : '') +
              `</div><button class="btn btn-secondary btn-xs${busy ? ' is-busy' : ''}" type="button" data-revoke="${grant.grant_id}" data-fk="rv-${grant.grant_id}" ` +
              `aria-label="${T.api.grants.revoke} ${esc(grant.redirect_host)}"${busy ? ' aria-busy="true"' : ''}>${busy ? spinner('spinner--sm') : ''}${T.api.grants.revoke}</button></li>`
            )
          })
          .join('') +
        `</ul>` +
        grantsPager()
    }
    patch(el, html)
  }

  // 超过一页才显示；加载或撤销进行中禁用翻页（与现有 ApiView 一致）
  function grantsPager() {
    const pages = Math.max(1, Math.ceil(apiView.grantsTotal / GRANTS_PAGE_SIZE))
    if (pages <= 1) return ''
    const busy = apiView.grantsLoading || apiView.revoking.size > 0
    const page = apiView.grantsPage
    return (
      `<nav class="grants-foot" aria-label="${T.api.grants.paginationLabel}">` +
      `<span class="jobs-range">${fmt(T.api.grants.pageOf, { page, pages })}</span><div class="pager">` +
      `<button class="btn btn-secondary btn-xs" type="button" data-grants-page="${page - 1}" data-fk="gp-prev"${page <= 1 || busy ? ' disabled' : ''}>${T.history.pagination.previous}</button>` +
      `<button class="btn btn-secondary btn-xs" type="button" data-grants-page="${page + 1}" data-fk="gp-next"${page >= pages || busy ? ' disabled' : ''}>${T.history.pagination.next}</button>` +
      `</div></nav>`
    )
  }

  // Key 与连接地址决定视图能否使用（失败整块重试）；用量并行单独加载，失败只影响合卡用量区
  async function loadApi() {
    const token = bootToken
    apiView.loading = true
    apiView.error = false
    renderApi()
    if (!apiView.usage) loadUsage()
    try {
      const data = await fakeApi.apiAccess()
      if (token !== bootToken) return
      apiView.key = data.key
      apiView.connection = data.connection
    } catch {
      if (token !== bootToken) return
      apiView.error = true
    } finally {
      if (token === bootToken) {
        apiView.loading = false
        apiView.ready = true
        renderParts()
        renderApi()
        renderTopbarActions()
        if (!apiView.error) loadGrants()
      }
    }
  }

  async function loadUsage() {
    if (apiView.usageLoading) return
    const token = bootToken
    apiView.usageLoading = true
    renderApiPlan()
    renderApiUsage()
    try {
      const usage = await fakeApi.apiUsage()
      if (token !== bootToken) return
      apiView.usage = usage
      apiView.usageError = false
    } catch {
      if (token !== bootToken) return
      apiView.usageError = true
    } finally {
      if (token === bootToken) {
        apiView.usageLoading = false
        renderApiPlan()
        renderApiUsage()
      }
    }
  }

  async function loadGrants(page = apiView.grantsPage) {
    const token = bootToken
    apiView.grantsLoading = true
    apiView.grantsError = false
    renderGrants()
    try {
      const data = await fakeApi.grants(page)
      if (token !== bootToken) return
      const pages = Math.max(1, Math.ceil(data.total / GRANTS_PAGE_SIZE))
      // 撤销后当前页可能被清空：回退到最后一页
      if (!data.items.length && page > pages) {
        loadGrants(pages)
        return
      }
      apiView.grants = data.items
      apiView.grantsTotal = data.total
      apiView.grantsPage = page
    } catch {
      if (token !== bootToken) return
      apiView.grantsError = true
    } finally {
      if (token === bootToken) {
        apiView.grantsLoading = false
        renderGrants()
      }
    }
  }

  async function generateKey() {
    if (apiView.generating) return
    if (apiView.key.has_api_key) {
      const confirmed = await confirmDialog({ title: T.api.rotateTitle, message: T.api.rotateMessage, confirm: T.api.rotateKey })
      if (!confirmed) return
    }
    const token = bootToken
    apiView.generating = true
    apiView.keyError = ''
    renderApiKey()
    try {
      const result = await fakeApi.generateKey()
      if (token !== bootToken) return
      apiView.key = { has_api_key: true, api_key_prefix: result.api_key_prefix, api_key_created_at: result.api_key_created_at }
      apiView.plainKey = result.api_key
    } catch {
      if (token !== bootToken) return
      apiView.keyError = T.api.keyFailed
    } finally {
      if (token === bootToken) {
        apiView.generating = false
        renderApiKey()
        if (apiView.plainKey) $('[data-fk="copy-key"]', apiContent)?.focus()
      }
    }
  }

  async function revokeGrant(grantId) {
    const grant = apiView.grants.find(item => item.grant_id === grantId)
    if (!grant || apiView.revoking.has(grantId)) return
    const confirmed = await confirmDialog({
      title: T.api.grants.revokeTitle,
      message: fmt(T.api.grants.revokeMessage, { host: grant.redirect_host }),
      confirm: T.api.grants.revoke
    })
    if (!confirmed) return
    const token = bootToken
    apiView.revoking.add(grantId)
    apiView.grantMessages.delete(grantId)
    renderGrants()
    try {
      await fakeApi.revoke(grantId)
      if (token !== bootToken) return
      const row = $(`[data-grant="${grantId}"]`, apiContent)
      if (row && !reducedMotion()) {
        row.classList.add('is-leaving')
        await sleep(220)
      }
      apiView.grants = apiView.grants.filter(item => item.grant_id !== grantId)
      apiView.grantsTotal -= 1
      $('#api-apps-title')?.focus()
    } catch {
      if (token !== bootToken) return
      apiView.grantMessages.set(grantId, T.api.grants.revokeFailed)
    } finally {
      if (token === bootToken) {
        apiView.revoking.delete(grantId)
        renderGrants()
      }
    }
    // 服务端分页：撤销后重新拉取当前页，让下一页的记录补位
    if (token === bootToken && !apiView.grantMessages.has(grantId)) loadGrants()
  }

  /* =========================================================================
     13 · 订阅
     ========================================================================= */
  const subsContent = $('[data-view="subscriptions"] [data-part="content"]')
  const PRODUCT_KIND = { online: 'maps_online', extension: 'maps_extension', api: 'maps_api' }
  const PAYMENT_LABEL = { paypal: 'PayPal', clink: 'ClinkBill' }

  function renderSubscriptions() {
    if (!session) return
    const cards = Object.keys(LINE_ICONS)
      .map(line => {
        const sub = session.subs[line]
        const active = isActiveSub(sub)
        let bodyHtml
        if (sub.status === 'unavailable') {
          bodyHtml = `<div class="callout callout--warn">${icon('alert')}<div class="callout-body">${T.subscriptions.unavailable}</div></div>`
        } else {
          bodyHtml =
            `<div class="plan-name-wrap"><span class="d-label">${T.subscriptions.planLabel}</span><span class="plan-big">${active ? esc(sub.display_name) : T.subscriptions.free}</span></div>` +
            (active
              ? `<dl class="kv"><div><dt>${T.subscriptions.expiresLabel}</dt><dd>${fmtDate(sub.expires_at)}</dd></div></dl>` +
                `<ul class="plan-meta"><li>${icon('refresh', 'icon--xs')}${sub.auto_renew ? T.subscriptions.autoRenewOn : T.subscriptions.autoRenewOff}</li>` +
                (sub.payment_method ? `<li>${icon('credit-card', 'icon--xs')}${fmt(T.subscriptions.paidVia, { method: PAYMENT_LABEL[sub.payment_method] ?? sub.payment_method })}</li>` : '') +
                `</ul>`
              : '')
        }
        const managing = subsView.managing === line
        const manage =
          active && sub.auto_renew
            ? `<button class="btn btn-secondary btn-xs${managing ? ' is-busy' : ''}" type="button" data-manage="${line}" data-fk="manage-${line}"${managing ? ' aria-busy="true"' : ''}>` +
              `${managing ? `${spinner('spinner--sm')}${T.subscriptions.managingSubscription}` : T.subscriptions.manageSubscription}</button>`
            : ''
        const buy = `<a class="btn ${line === 'online' ? 'btn-primary' : 'btn-secondary'} btn-xs" href="../pricing.html#${line}">${T.subscriptions.subscribeCta}</a>`
        const message = subsView.messageLine === line && subsView.message ? `<p class="inline-err" role="alert">${subsView.message}</p>` : ''
        return (
          `<article class="d-panel plan-card" aria-labelledby="plan-${line}" data-line="${line}">` +
          `<div class="plan-head"><span class="icon-tile" aria-hidden="true">${icon(LINE_ICONS[line])}</span><h2 class="plan-line" id="plan-${line}">${T.subscriptions.lines[line]}</h2></div>` +
          `<div class="plan-body">${bodyHtml}</div>` +
          `<div class="plan-foot"><div class="plan-actions">${manage}${buy}</div>${message}</div></article>`
        )
      })
      .join('')
    patch(subsContent, `<div class="view-stack"><p class="view-intro">${T.subscriptions.description}</p><div class="plans-grid">${cards}</div></div>`)
  }

  async function manageSubscription(line) {
    if (subsView.managing) return
    const token = bootToken
    subsView.managing = line
    subsView.message = ''
    renderSubscriptions()
    try {
      // 落地：先在用户手势内预开空白窗口，拿到 URL 后跳转；URL 为空时关闭窗口并显示渠道指引
      const url = await fakeApi.manageUrl(PRODUCT_KIND[line])
      if (token !== bootToken) return
      if (!url) $('#guide-dialog').showModal()
    } catch {
      if (token !== bootToken) return
      subsView.message = T.subscriptions.manageFailed
      subsView.messageLine = line
    } finally {
      if (token === bootToken) {
        subsView.managing = ''
        renderSubscriptions()
      }
    }
  }

  /* =========================================================================
     14 · 视图数据：会话就绪后按需加载，切走保留（KeepAlive）
     ========================================================================= */
  function activateView(view) {
    if (globalState() !== 'ready') return
    if (view === 'online' && !online.started) {
      const token = bootToken
      online.started = true
      recent.started = true
      Promise.allSettled([online.optionsPromise, loadRecent()]).then(() => {
        if (token !== bootToken) return
        online.ready = true
        renderParts()
        renderComposer()
        renderRecent()
        renderTopbarActions()
      })
    }
    if (view === 'history') {
      if (!hist.started) {
        hist.started = true
        loadHist({ mode: 'initial' })
      } else if ((hist.loading ? hist.loadingKey : hist.loadedKey) !== queryKey()) {
        // 查询在别处改过（最近任务定位、地址栏后退）：列表区换骨架重新拉取
        loadHist({ mode: hist.ready ? 'swap' : 'initial' })
      } else if (!hist.loading && (hist.stale || hist.jobs.some(isRunning))) {
        // 有新提交或运行中的任务：静默刷新当前页，不闪骨架
        loadHist({ mode: 'silent' })
      }
    }
    if (view === 'api' && !apiView.started) {
      apiView.started = true
      loadApi()
    }
  }

  async function boot({ first = false } = {}) {
    const token = ++bootToken
    stopSim()
    for (const dialog of $$('dialog[open]')) dialog.close()
    closePopovers()
    resetState()
    resetComposerDom()
    recentHost.dataset.mode = ''
    delete histHost.dataset.frame
    histHost.innerHTML = ''
    histHost._html = ''
    apiContent.dataset.mode = ''
    setGlobalState('loading')
    syncProtoPanel()
    if (proto.state === 'loading') return
    // 会话（auth/me）先到：用户卡先出现，视图数据随后各自到达
    await sleep(first ? 420 : 320)
    if (token !== bootToken) return
    if (proto.state === 'signedout' || proto.state === 'offline') {
      setGlobalState(proto.state)
      return
    }
    setGlobalState('ready')
    renderSubscriptions()
    loadOptions()
    activateView(route.current)
    startSim()
  }

  function resetComposerDom() {
    kwInput.value = ''
    finalInput.value = ''
    baseInput.value = ''
    $('[data-map-lat]').value = ''
    $('[data-map-lng]').value = ''
    $('[data-map-radius]').value = '5'
    $('[data-map-spacing]').value = '5'
    $('[data-map-radius-out]').textContent = '5'
    $('[data-map-spacing-out]').textContent = '5'
    countryInput.value = ''
    stateInput.value = ''
    cityCombo.clear()
    for (const tab of $$('[role="tab"]', segEl)) {
      const on = tab.dataset.mode === 'keywords'
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
    }
    composerBody.setAttribute('aria-labelledby', MODE_TABS.keywords)
    applyModeLayout()
    placeSegThumb(segEl, { instant: true })
  }

  /* =========================================================================
     15 · 弹窗、Toast、复制
     ========================================================================= */
  const confirmEl = $('#confirm-dialog')

  function confirmDialog({ title, message, confirm }) {
    $('[data-confirm-title]', confirmEl).textContent = title
    $('[data-confirm-msg]', confirmEl).textContent = message
    $('[data-confirm-ok]', confirmEl).textContent = confirm
    $('[data-confirm-cancel]', confirmEl).textContent = T.api.cancel
    confirmEl.returnValue = ''
    confirmEl.showModal()
    // 破坏性操作默认聚焦取消
    $('[data-confirm-cancel]', confirmEl).focus()
    return new Promise(resolve => {
      confirmEl.addEventListener('close', () => resolve(confirmEl.returnValue === 'confirm'), { once: true })
    })
  }

  const toastStack = $('[data-toast-stack]')

  function toast(title, desc = '', tone = 'ok', lang = '') {
    const el = document.createElement('div')
    el.className = `toast${tone === 'note' ? ' toast--note' : tone === 'error' ? ' toast--error' : ''}`
    if (lang) el.lang = lang
    el.innerHTML =
      `<span class="toast-icon">${icon(tone === 'error' ? 'alert' : tone === 'note' ? 'info' : 'check')}</span>` +
      `<div><div class="toast-title"></div>${desc ? '<div class="toast-desc"></div>' : ''}</div>`
    $('.toast-title', el).textContent = title
    if (desc) $('.toast-desc', el).textContent = desc
    toastStack.append(el)
    // 最多同时 3 条：模拟任务批量结束时不堆满屏幕
    while (toastStack.children.length > 3) toastStack.firstElementChild.remove()
    setTimeout(() => {
      el.classList.add('is-leaving')
      el.addEventListener('animationend', () => el.remove(), { once: true })
    }, 4200)
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text)
      toast(T.api.copied)
      if (button) {
        button.classList.add('is-copied')
        setTimeout(() => button.classList.remove('is-copied'), 1600)
      }
    } catch {
      toast(T.api.copyFailed, '', 'error')
    }
  }

  /* ---------------------------------------------------------------- 登录弹窗 */
  const signinEl = $('#signin-dialog')

  function openSignin() {
    showSigninStep(1)
    signinEl.showModal()
  }

  function showSigninStep(step) {
    for (const el of $$('[data-signin-step]', signinEl)) el.hidden = el.dataset.signinStep !== String(step)
  }

  function finishSignin() {
    signinEl.close()
    proto.state = 'ready'
    history.replaceState({ view: route.current }, '', urlFor(route.current))
    syncRouteHrefs()
    boot()
  }

  /* =========================================================================
     16 · 主题与原型调试面板
     ========================================================================= */
  function setTheme(value) {
    if (value === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', value)
    try {
      if (value === 'system') localStorage.removeItem('mg-theme')
      else localStorage.setItem('mg-theme', value)
    } catch {
      // 隐私模式等场景不可写：本次会话内仍然生效
    }
    for (const btn of $$('[data-theme-set]', accountMenu)) btn.setAttribute('aria-checked', String(btn.dataset.themeSet === value))
    syncProtoPanel()
  }

  function applyMotion() {
    root.classList.toggle('force-reduced', proto.motion === 'reduced')
  }

  function syncProtoPanel() {
    const current = { ...proto, theme: themePref() }
    for (const group of $$('[data-proto-key]')) {
      for (const btn of $$('button', group)) btn.setAttribute('aria-pressed', String(current[group.dataset.protoKey] === btn.dataset.v))
    }
  }

  function setProto(key, value) {
    if (key === 'theme') {
      setTheme(value)
      return
    }
    proto[key] = value
    history.replaceState({ view: route.current }, '', urlFor(route.current))
    syncRouteHrefs()
    syncProtoPanel()
    if (key === 'motion') applyMotion()
    else if (key === 'sim') {
      if (value === 'on' && globalState() === 'ready') startSim()
      else stopSim()
      renderTopbarActions()
    } else boot()
  }

  /* =========================================================================
     17 · 事件绑定
     ========================================================================= */
  const plainClick = event => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

  document.addEventListener('click', event => {
    const target = event.target
    // 最近任务里的任务链接 / View all：带上查询去 History（修饰键交给浏览器开新标签）
    const histLink = target.closest('a[data-hist-link]')
    if (histLink) {
      if (!plainClick(event)) return
      event.preventDefault()
      openHistory(histLink.dataset.histLink === 'all' ? '' : histLink.dataset.histLink)
      return
    }
    const routeLink = target.closest('a[data-route]')
    if (routeLink) {
      // 修饰键 / 中键交给浏览器（新标签打开真实地址）
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      navigate(routeLink.dataset.route)
      return
    }
    if (target.closest('[data-signin-open]')) {
      openSignin()
      return
    }
    if (target.closest('[data-boot-retry]')) {
      // 原型：重试即恢复，演示「网络失败 → 重试 → 骨架 → 内容」
      proto.state = 'ready'
      history.replaceState({ view: route.current }, '', urlFor(route.current))
      syncRouteHrefs()
      boot()
      return
    }
    const copyBtn = target.closest('[data-copy]')
    if (copyBtn) {
      copyText(copyBtn.dataset.copy, copyBtn)
      return
    }
    if (target.closest('[data-refresh]')) refreshOnline()
  })

  navEl.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const links = $$('[data-route]', navEl)
    const index = links.indexOf(document.activeElement)
    if (index < 0) return
    event.preventDefault()
    links[(index + (event.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length].focus()
  })

  window.addEventListener('popstate', event => {
    const search = new URLSearchParams(location.search)
    const view = event.state?.view ?? (VIEWS.includes(search.get('view')) ? search.get('view') : 'online')
    // 回到 History 记录时按地址栏恢复筛选与页码；与当前不同则由 activateView 重新拉取
    if (view === 'history') {
      Object.assign(histQuery, readHistQuery(location.search))
      syncRouteHrefs()
      if (route.current === 'history') activateView('history')
    }
    navigate(view, { push: false, restore: true })
  })

  window.addEventListener('scroll', () => topbar.toggleAttribute('data-scrolled', window.scrollY > 2), { passive: true })

  menuBtn.addEventListener('click', openDrawer)
  $('[data-side-close]').addEventListener('click', () => closeDrawer())
  $('[data-scrim]').addEventListener('click', () => closeDrawer())
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && body.classList.contains('drawer-open') && !Pop.isOpen()) closeDrawer()
  })
  drawerQuery.addEventListener('change', () => {
    closeDrawer({ returnFocus: false })
    syncSideInert()
    hideTip()
  })

  // 宽屏收起 / 展开：按钮、[ 键（不在输入框内）、⌘B / Ctrl+B；有弹窗或浮层打开、窄屏时不响应
  sideToggle.addEventListener('click', () => setSideCollapsed(!sideCollapsed()))
  const isEditable = el => Boolean(el?.closest?.('input, textarea, [contenteditable]:not([contenteditable="false"])'))
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || drawerQuery.matches || $('dialog[open]') || Pop.isOpen()) return
    const modB =
      (event.key === 'b' || event.key === 'B') &&
      !event.altKey &&
      !event.shiftKey &&
      (IS_MAC ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey)
    const bracket = event.key === '[' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target)
    if (!modB && !bracket) return
    event.preventDefault()
    if (!event.repeat) setSideCollapsed(!sideCollapsed())
  })

  // 图标栏提示：悬停（非触摸）或键盘聚焦时出现，离开 / 失焦 / 菜单区滚动时收起
  const TIP_TARGET = '[data-tip], [data-side-toggle]'
  sideEl.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return
    const el = event.target.closest(TIP_TARGET)
    if (el && el !== tipTarget) showTip(el)
  })
  sideEl.addEventListener('pointerout', event => {
    const el = event.target.closest(TIP_TARGET)
    if (el && !el.contains(event.relatedTarget)) hideTip()
  })
  sideEl.addEventListener('focusin', event => {
    const el = event.target.closest(TIP_TARGET)
    if (el && el.matches(':focus-visible')) showTip(el, { immediate: true })
  })
  sideEl.addEventListener('focusout', hideTip)
  navEl.addEventListener('scroll', hideTip, { passive: true })

  // 账户菜单（popover）：顶层渲染，不受侧栏滚动区裁剪
  // 账户菜单按钮（APG Menu Button）：点击 / Enter / Space 开关，↓ 打开并聚焦首项，↑ 打开并聚焦末项
  userSlot.addEventListener('click', event => {
    if (event.target.closest('[data-user-trigger]')) accountCtl.toggle()
  })
  userSlot.addEventListener('keydown', event => {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && event.target.closest('[data-user-trigger]')) {
      event.preventDefault()
      accountCtl.open({ last: event.key === 'ArrowUp' })
    }
  })
  // 只在宽度变化时收起菜单：移动端地址栏伸缩只改高度，不应误关
  let lastWidth = window.innerWidth
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return
    lastWidth = window.innerWidth
    closePopovers()
  })

  // 创建面板
  composer.addEventListener('submit', submitJob)
  segEl.addEventListener('click', event => {
    const tab = event.target.closest('[role="tab"]')
    if (tab) setMode(tab.dataset.mode)
  })
  segEl.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const modes = Object.keys(MODE_TABS)
    const index = modes.indexOf(online.mode)
    setMode(modes[(index + (event.key === 'ArrowRight' ? 1 : modes.length - 1)) % modes.length], { focus: true })
  })
  new ResizeObserver(() => placeSegThumb(segEl, { instant: true })).observe(segEl)
  kwInput.addEventListener('input', () => {
    online.submitError = ''
    renderComposer()
  })
  finalInput.addEventListener('input', () => {
    online.submitError = ''
    renderComposer()
  })
  baseInput.addEventListener('input', () => renderRegion())
  $('[data-contacts]').addEventListener('change', event => {
    online.includeContacts = event.target.checked
  })
  composer.addEventListener('click', event => {
    if (event.target.closest('[data-retry-options]')) loadOptions()
  })

  $('[data-map-stage]').addEventListener('click', event => {
    if (online.submitting) return
    // 示意地图以 slice 铺满舞台（舞台只变宽不变高，宽高比会变），按同一缩放换算回 800 × 500 视框坐标
    const rect = mapSvg.getBoundingClientRect()
    const scale = Math.max(rect.width / 800, rect.height / 500)
    const sx = 400 + (event.clientX - rect.left - rect.width / 2) / scale
    const sy = 250 + (event.clientY - rect.top - rect.height / 2) / scale
    const { center, k } = mapFrame
    const lat = center.lat + (250 - sy) / k / KM_PER_DEG
    const lng = center.lng + (sx - 400) / k / (KM_PER_DEG * Math.cos((center.lat * Math.PI) / 180))
    setMapCenter(Number(lat.toFixed(6)), Number(lng.toFixed(6)))
  })
  for (const input of [$('[data-map-lat]'), $('[data-map-lng]')]) {
    input.addEventListener('input', () => {
      const lat = $('[data-map-lat]').value.trim()
      const lng = $('[data-map-lng]').value.trim()
      setMapCenter(lat ? Number(lat) : NaN, lng ? Number(lng) : NaN, { fromInput: true })
      const invalid = (value, max) => value !== '' && !(Math.abs(Number(value)) <= max)
      $('[data-map-lat]').classList.toggle('is-invalid', invalid(lat, 85))
      $('[data-map-lng]').classList.toggle('is-invalid', invalid(lng, 180))
    })
  }
  $('[data-map-radius]').addEventListener('input', event => {
    online.map.radius = Number(event.target.value)
    $('[data-map-radius-out]').textContent = event.target.value
    renderComposer()
  })
  $('[data-map-spacing]').addEventListener('input', event => {
    online.map.spacing = Number(event.target.value)
    $('[data-map-spacing-out]').textContent = event.target.value
    renderComposer()
  })

  $('[data-add-country]').addEventListener('click', () => {
    const region = online.region
    const name = region.countries.find(([code]) => code === region.code)?.[1]
    if (name) addPlace(region.code, name)
  })
  $('[data-add-state]').addEventListener('click', () => {
    const region = online.region
    const name = region.data?.s.find(([code]) => code === region.stateCode)?.[1]
    if (name) addPlace(`${region.code}:${region.stateCode}`, `${name}, ${region.code}`)
  })
  $('[data-region-panel]').addEventListener('click', event => {
    const remove = event.target.closest('[data-chip-remove]')
    if (remove) {
      online.region.selected = online.region.selected.filter(place => place.key !== remove.dataset.chipRemove)
      renderComposer()
      cityInput.disabled ? baseInput.focus() : cityInput.focus()
      return
    }
    if (event.target.closest('[data-region-retry]')) loadRegion(online.region.code)
    if (event.target.closest('[data-generate]')) generateQueries()
  })
  // 任务列表：最近任务与 History 共用一套委托
  function onListClick(event) {
    const target = event.target
    const download = target.closest('[data-download]')
    if (download) {
      downloadCsv(download.dataset.download)
      return
    }
    const retryDetail = target.closest('[data-detail-retry]')
    if (retryDetail) {
      loadDetail(retryDetail.dataset.detailRetry)
      return
    }
    if (target.closest('[data-recent-retry]')) {
      markBusy(target.closest('[data-recent-retry]'))
      loadRecent()
      return
    }
    if (target.closest('[data-hist-retry]')) {
      refreshHist()
      return
    }
    const refresh = target.closest('[data-list-refresh]')
    if (refresh) {
      if (refresh.dataset.listRefresh === 'recent') refreshOnline()
      else refreshHist()
      return
    }
    if (target.closest('[data-hist-reset]')) {
      resetHistFilters()
      histInput.focus()
      return
    }
    const page = target.closest('[data-hist-page]')
    if (page) {
      if (page.getAttribute('aria-disabled') === 'true' || (hist.loading && hist.mode !== 'silent')) return
      const next = Number(page.dataset.histPage)
      if (next !== histQuery.page) setHistQuery({ page: next }, { resetPage: false })
      return
    }
    const row = target.closest('[data-row]')
    if (!row || target.closest('a, input, textarea, button:not([data-toggle])')) return
    // 选中文本时不折叠 / 展开，避免复制任务号时误触
    if (!target.closest('[data-toggle]') && String(window.getSelection())) return
    toggleDetail(row.closest('.job').dataset.job)
  }
  recentHost.addEventListener('click', onListClick)
  histHost.addEventListener('click', onListClick)
  // 每页条数：按钮 + 弹出 listbox（选项少，不需要输入过滤）；靠近视口底部时向上弹出
  const sizeCtl = Pop.listbox(sizePop, {
    anchor: () => $('[data-hist-size]', histHost)?.getBoundingClientRect() ?? null,
    trigger: () => $('[data-hist-size]', histHost),
    owns: target => Boolean(target.closest('[data-hist-size]')),
    side: 'bottom',
    align: 'end',
    minWidth: 96,
    render(list) {
      list.innerHTML = PAGE_SIZES.map(size => {
        const on = size === histQuery.size
        return (
          `<li class="pop-item${on ? ' is-current' : ''}" role="option" tabindex="-1" aria-selected="${on}" data-value="${size}">` +
          `<span class="pop-item-label">${size}</span>${icon('check', 'pop-check')}</li>`
        )
      }).join('')
    },
    onSelect(value) {
      if (Number(value) !== histQuery.size) setHistQuery({ size: Number(value) })
    }
  })
  histHost.addEventListener('click', event => {
    if (event.target.closest('[data-hist-size]')) sizeCtl.toggle()
  })
  histHost.addEventListener('keydown', event => {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && event.target.closest('[data-hist-size]')) {
      event.preventDefault()
      sizeCtl.open()
    }
  })

  // History 工具栏
  histInput.addEventListener('input', () => {
    histClearBtn.hidden = !histInput.value
    clearTimeout(searchTimer)
    searchTimer = setTimeout(applySearch, 300)
  })
  histInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      applySearch()
    } else if (event.key === 'Escape' && histInput.value) {
      event.preventDefault()
      histInput.value = ''
      histClearBtn.hidden = true
      applySearch()
    }
  })
  histClearBtn.addEventListener('click', () => {
    histInput.value = ''
    histClearBtn.hidden = true
    applySearch()
    histInput.focus()
  })
  histStatusEl.addEventListener('click', event => {
    const btn = event.target.closest('[data-status]')
    if (btn && btn.dataset.status !== histQuery.status) setHistQuery({ status: btn.dataset.status })
  })
  histStatusEl.addEventListener('keydown', event => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    if (!(event.key in keys) && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const count = HIST_STATUSES.length
    const index = HIST_STATUSES.indexOf(histQuery.status)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (index + keys[event.key] + count) % count
    setHistQuery({ status: HIST_STATUSES[next] })
    $(`[data-status="${HIST_STATUSES[next]}"]`, histStatusEl).focus()
  })
  new ResizeObserver(() => placeSegThumb(histStatusEl, { instant: true })).observe(histStatusEl)
  histRefreshBtn.addEventListener('click', refreshHist)

  // 时间范围 / Filters 按钮（APG Menu Button）与日期子面板
  for (const [btn, ctl] of [[rangeBtn, rangeCtl], [filterBtn, filterCtl]]) {
    btn.addEventListener('click', () => ctl.toggle())
    btn.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      ctl.open({ last: event.key === 'ArrowUp' })
    })
  }
  for (const pop of [rangePop, filterPop]) {
    pop.addEventListener('click', event => {
      if (!event.target.closest('[data-range-apply]') || !draftValid()) return
      Pop.close()
      setHistQuery({ range: 'custom', from: rangeDraft.from, to: rangeDraft.to })
    })
    pop.addEventListener('input', event => {
      if (event.target.matches('[data-range-from]')) rangeDraft.from = event.target.value
      else if (event.target.matches('[data-range-to]')) rangeDraft.to = event.target.value
      else return
      syncRangeValidity(pop)
    })
  }

  // API 视图
  apiContent.addEventListener('click', event => {
    const target = event.target
    if (target.closest('[data-api-retry]')) {
      markBusy(target.closest('[data-api-retry]'))
      loadApi()
    }
    else if (target.closest('[data-gen-key]')) generateKey()
    else if (target.closest('[data-usage-refresh], [data-usage-retry]')) loadUsage()
    else if (target.closest('[data-grants-retry]')) loadGrants()
    else if (target.closest('[data-grants-page]')) loadGrants(Number(target.closest('[data-grants-page]').dataset.grantsPage))
    else if (target.closest('[data-revoke]')) revokeGrant(target.closest('[data-revoke]').dataset.revoke)
  })

  // 订阅视图
  subsContent.addEventListener('click', event => {
    const manage = event.target.closest('[data-manage]')
    if (manage) manageSubscription(manage.dataset.manage)
  })

  // 弹窗：点遮罩关闭
  for (const dialog of $$('dialog.modal')) {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close('cancel')
    })
  }
  $('[data-signin-close]').addEventListener('click', () => signinEl.close())
  $('[data-signin-google]').addEventListener('click', finishSignin)
  $('[data-signin-email]').addEventListener('submit', event => {
    event.preventDefault()
    const email = $('input', event.target).value
    $('[data-signin-sent]', signinEl).textContent = `We sent a 6-digit code to ${email}.`
    showSigninStep(2)
    $('[data-otp] input', signinEl).focus()
  })
  $('[data-signin-back]').addEventListener('click', () => showSigninStep(1))
  $('[data-signin-code]').addEventListener('submit', event => {
    event.preventDefault()
    finishSignin()
  })
  const otpInputs = $$('[data-otp] input', signinEl)
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(-1)
      if (input.value && otpInputs[index + 1]) otpInputs[index + 1].focus()
    })
    input.addEventListener('keydown', event => {
      if (event.key === 'Backspace' && !input.value && otpInputs[index - 1]) otpInputs[index - 1].focus()
    })
  })

  // 原型调试面板
  const protoToggle = $('[data-proto-toggle]')
  const protoPanel = $('#proto-panel')
  protoToggle.addEventListener('click', () => {
    protoPanel.hidden = !protoPanel.hidden
    protoToggle.setAttribute('aria-expanded', String(!protoPanel.hidden))
  })
  $('[data-proto]').addEventListener('click', event => {
    const btn = event.target.closest('[data-proto-key] button')
    if (btn) {
      setProto(btn.closest('[data-proto-key]').dataset.protoKey, btn.dataset.v)
      return
    }
    if (event.target.closest('[data-proto-reset]')) {
      Object.assign(proto, PROTO_DEFAULTS)
      setTheme('system')
      applyMotion()
      history.replaceState({ view: route.current }, '', urlFor(route.current))
      syncRouteHrefs()
      boot()
    }
  })
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncProtoPanel)

  /* =========================================================================
     18 · 启动
     ========================================================================= */
  history.scrollRestoration = 'manual'
  history.replaceState({ view: route.current }, '', urlFor(route.current))
  applyMotion()
  syncRouteHrefs()
  syncSideInert()
  syncSideToggle()
  applyRoute({ animate: false })
  boot({ first: true })
})()
