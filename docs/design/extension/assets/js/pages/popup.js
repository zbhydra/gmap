/*
 * popup.html（Phase B）页面脚本：Popup 状态渲染 + 原型交互 + 状态矩阵。
 * 状态来自 logic.md §2 + L3 / L5 / L11，状态组与取值见 README §10「Popup」。
 *
 *   apply(root, state, { instant, fromZero, delay })
 *       把一组状态写进某个 Popup 根（.pp）：实时 Popup 走过渡与形变，矩阵缩略图 instant 直接给终态。
 *       Vue 落地时这里的每一处写入都对应一个响应式绑定（类名、data-*、文案、aria）。
 *   状态组（深链 ?s.<group>=）：account · plan · usage · notice · menu
 *
 * 样例数据全部虚构；套餐名 Free / Pro / Business 与额度取自 011 Pricing（Extension 线），
 * 「账号信息携带套餐」是本稿的假设（当前 usage 快照与 user 信息都不含套餐名）。
 */
;(function () {
  var MG = window.MG
  var UI = window.UI
  var Proto = window.Proto

  var root = document.querySelector('[data-pp]')
  var frame = document.querySelector('[data-pp-frame]')
  var head = root.querySelector('[data-pp-head]')
  var body = root.querySelector('[data-pp-body]')
  var foot = root.querySelector('[data-pp-foot]')
  var live = root.querySelector('[data-pp-live]')
  var langBtn = root.querySelector('[data-pp-lang]')
  var langMenu = document.getElementById('pp-lang-menu')

  // 缩略图母版：任何状态写入之前克隆静态 HTML
  var pristine = root.cloneNode(true)

  /* ------------------------------------------------------------ 样例数据 */
  var RESET = 'Nov 1'
  var USER = 'Jordan Rivera'
  var PLANS = {
    free: { label: 'Free', total: 1000, badge: 'badge--outline', icon: '' },
    pro: { label: 'Pro', total: 100000, badge: 'badge--pro', icon: 'crown' },
    business: { label: 'Business', total: 500000, badge: 'badge--pro', icon: 'building' }
  }
  var USED = {
    normal: { free: 312, pro: 41280, business: 126400 },
    near: { free: 864, pro: 86450, business: 431900 }
  }
  // 官网链接在原型里只提示去向（Toast），不离开原型
  var LINKS = {
    pricing: 'Pricing',
    subscriptions: 'your subscriptions',
    help: 'Help & FAQ',
    contact: 'the contact page',
    update: 'the update guide'
  }
  // 打开编排里卡片落位后再滚数字（卡片是中段第 4 个子元素：40 + 3 × 40 ms 起步）
  var OPEN_DELAY = 320

  /** 访客与无订阅按 Free；已登录取账号套餐 */
  var figures = function (s) {
    var tier = s.account === 'signed-in' ? s.plan : 'free'
    var total = PLANS[tier].total
    var used = s.usage === 'out' ? total : USED[s.usage === 'near' ? 'near' : 'normal'][tier]
    return {
      tier: tier,
      total: total,
      used: used,
      left: total - used,
      pct: (used / total) * 100,
      shown: Math.floor((used / total) * 100)
    }
  }

  /* ------------------------------------------------------------ 渲染 */
  // .morph 切换：实时走 UI.morph（旧词上移、新词自下而上），缩略图直接落到目标
  var setKey = function (container, key, animate) {
    if (animate) {
      UI.morph(container, key)
      return
    }
    Array.prototype.forEach.call(container.children, function (item) {
      var on = item.dataset.key === key
      item.classList.toggle('is-active', on)
      item.classList.remove('is-leaving')
      if (on) item.removeAttribute('aria-hidden')
      else item.setAttribute('aria-hidden', 'true')
    })
  }

  var fillTo = function (bar, p, instant) {
    var fill = bar.querySelector('.progress-fill')
    if (instant) fill.style.transition = 'none'
    bar.style.setProperty('--p', p.toFixed(2))
    if (instant) {
      void fill.offsetWidth
      fill.style.transition = ''
    }
  }

  // 读数：mode = instant（终值）| zero（从 0 滚到终值：打开、加载完成）| update（从当前值滚到新值）
  var meter = function (el, f, mode, delay) {
    var used = el.querySelector('[data-pp-used]')
    var pct = el.querySelector('[data-pp-pct]')
    var bar = el.querySelector('[data-pp-bar]')
    clearTimeout(el._ppMeter)
    var go = function () {
      MG.roll(used, f.used)
      MG.roll(pct, f.shown)
      fillTo(bar, f.pct)
      MG.replay(bar, 'is-beaming')
    }
    if (mode === 'instant' || MG.reducedMotion()) {
      MG.roll(used, f.used, { instant: true })
      MG.roll(pct, f.shown, { instant: true })
      fillTo(bar, f.pct, true)
      return
    }
    if (mode === 'zero') {
      MG.roll(used, 0, { instant: true })
      MG.roll(pct, 0, { instant: true })
      fillTo(bar, 0, true)
      el._ppMeter = setTimeout(go, delay || 40)
      return
    }
    go()
  }

  // 运营提示槽：出现时高度展开 + 提示滑入；全部收起时先收槽，过渡结束再隐藏内容
  var notices = function (el, want, animate) {
    var slot = el.querySelector('[data-pp-notices]')
    var items = el.querySelectorAll('[data-pp-notice]')
    var any = want.update || want.announce
    clearTimeout(slot._ppHide)
    if (!any && animate && slot.classList.contains('is-open')) {
      slot.classList.remove('is-open')
      slot._ppHide = setTimeout(function () {
        items.forEach(function (n) {
          n.hidden = true
        })
      }, MG.ms('--dur-4'))
      return
    }
    slot.classList.toggle('is-open', any)
    items.forEach(function (n) {
      var on = !!want[n.getAttribute('data-pp-notice')]
      var was = !n.hidden
      n.hidden = !on
      if (on && !was && animate) MG.replay(n, 'is-entering')
    })
  }

  var apply = function (el, s, o) {
    var opts = o || {}
    var animate = !opts.instant
    var prev = el._pp || {}
    var f = figures(s)
    var q = function (sel) {
      return el.querySelector(sel)
    }
    var signed = s.account === 'signed-in'
    var pending = s.account === 'signing-in'

    el.setAttribute('data-account', s.account)
    el.setAttribute('data-usage', s.usage)
    el.setAttribute('data-tier', f.tier)

    // 账号：访客 / 登录中（L5：按钮加载、说明改为去新标签完成）/ 已登录
    setKey(q('[data-pp-name]'), signed ? 'user' : 'guest', animate)
    setKey(q('[data-pp-meta]'), signed ? 'user' : pending ? 'pending' : 'guest', animate)
    var auth = q('[data-pp-auth]')
    auth.classList.toggle('btn-secondary', !signed)
    auth.classList.toggle('btn-ghost', signed)
    auth.classList.toggle('is-loading', pending)
    auth.setAttribute('aria-busy', String(pending))
    setKey(q('[data-pp-auth-label]'), signed ? 'out' : 'in', animate)
    if (animate && !opts.initial && signed && prev.account && prev.account !== 'signed-in') MG.replay(q('[data-pp-avatar]'), 'is-ping')

    var plan = PLANS[f.tier]
    var badge = q('[data-pp-plan]')
    badge.hidden = !signed
    badge.className = 'badge pp-plan ' + plan.badge
    badge.innerHTML = (plan.icon ? UI.icon(plan.icon) : '') + plan.label
    if (animate && !opts.initial && signed && (prev.account !== 'signed-in' || prev.tier !== f.tier)) MG.replay(badge, 'is-pop')

    // 用量：加载中 / 不可用 / 读数（正常 · 接近上限 · 用尽）
    var block = s.usage === 'loading' ? 'loading' : s.usage === 'error' ? 'error' : 'meter'
    el.querySelectorAll('[data-pp-u]').forEach(function (node) {
      var on = node.getAttribute('data-pp-u') === block
      node.hidden = !on
      if (on && animate && prev.block && prev.block !== block) MG.replay(node, 'pp-in')
    })

    var near = s.usage === 'near'
    var out = s.usage === 'out'
    var m = q('[data-pp-meter]')
    m.classList.toggle('is-near', near)
    m.classList.toggle('is-out', out)
    q('[data-pp-total]').textContent = '/ ' + MG.formatNumber(f.total)
    var bar = q('[data-pp-bar]')
    bar.setAttribute('aria-valuemax', f.total)
    bar.setAttribute('aria-valuenow', f.used)
    bar.setAttribute('aria-valuetext', MG.formatNumber(f.used) + ' of ' + MG.formatNumber(f.total) + ' records')
    q('[data-pp-left]').textContent = MG.formatNumber(f.left) + ' records left until ' + RESET + '.'
    q('[data-pp-out-text]').textContent = 'All ' + MG.formatNumber(f.total) + ' records used. Extraction resumes ' + RESET + '.'
    // 最高档用尽时没有可升级的档位，入口仍指向 Pricing（L3），文案改为 View plans
    q('[data-pp-upgrade-label]').textContent = f.tier === 'business' ? 'View plans' : 'Upgrade plan'
    ;[
      ['near', near],
      ['out', out]
    ].forEach(function (pair) {
      var note = q('[data-pp-note="' + pair[0] + '"]')
      var was = !note.hidden
      note.hidden = !pair[1]
      if (pair[1] && !was && animate && !opts.initial) MG.replay(note, 'pp-in')
    })
    if (block === 'meter') {
      var mode = opts.instant ? 'instant' : opts.fromZero || prev.block !== 'meter' ? 'zero' : 'update'
      meter(el, f, mode, opts.delay)
    }

    // 用尽（L3）：升级成为唯一 primary，Open Google Maps 退为 secondary（仍可打开、导出已有结果）
    var open = q('[data-pp-open]')
    open.classList.toggle('btn-primary', !out)
    open.classList.toggle('btn-secondary', out)

    // 运营提示
    notices(
      el,
      {
        update: s.notice === 'update' || s.notice === 'both',
        announce: s.notice === 'announce' || s.notice === 'both'
      },
      animate
    )

    el._pp = { account: s.account, usage: s.usage, tier: f.tier, block: block }
    return f
  }

  /* ------------------------------------------------- 读屏播报（只播变化） */
  var speak = function (s, f, prev) {
    var parts = []
    if (prev.account !== s.account) {
      if (s.account === 'signing-in') parts.push('Signing in. Continue in the new tab.')
      else if (s.account === 'signed-in') parts.push('Signed in as ' + USER + ', ' + PLANS[f.tier].label + ' plan.')
      else parts.push('Signed out.')
    }
    if (prev.usage !== s.usage || prev.tier !== f.tier) {
      var total = MG.formatNumber(f.total)
      if (s.usage === 'loading') parts.push('Loading usage.')
      else if (s.usage === 'error') parts.push('Usage didn’t load. Retry is available.')
      else if (s.usage === 'out') parts.push('All ' + total + ' records used. Upgrade to keep extracting.')
      else {
        parts.push(MG.formatNumber(f.used) + ' of ' + total + ' records used this month.')
        if (s.usage === 'near') parts.push(MG.formatNumber(f.left) + ' left until ' + RESET + '.')
      }
    }
    if (parts.length) live.textContent = parts.join(' ')
  }

  /* ----------------------------------------------------------- 状态组 */
  var state = {}
  var queued = false
  var initial = true
  // 同一轮里的多次 Proto.set（流程、矩阵加载）合并成一次渲染
  var schedule = function () {
    if (queued) return
    queued = true
    Promise.resolve().then(function () {
      queued = false
      var prev = root._pp || {}
      var first = initial
      initial = false
      var f = apply(root, state, first ? { initial: true, fromZero: true, delay: OPEN_DELAY } : {})
      if (!first) speak(state, f, prev)
    })
  }

  var group = function (def) {
    def.onChange = function (value) {
      state[def.group] = value
      schedule()
    }
    Proto.states(def)
  }

  group({
    group: 'account',
    label: 'Account · L5',
    value: 'guest',
    options: [
      { value: 'guest', label: 'Guest' },
      { value: 'signing-in', label: 'Signing in' },
      { value: 'signed-in', label: 'Signed in' }
    ]
  })
  group({
    group: 'plan',
    label: 'Plan · when signed in',
    value: 'pro',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
      { value: 'business', label: 'Business' }
    ]
  })
  group({
    group: 'usage',
    label: 'Usage · L5 / L3',
    value: 'normal',
    options: [
      { value: 'loading', label: 'Loading' },
      { value: 'normal', label: 'Normal' },
      { value: 'near', label: '≥ 80%' },
      { value: 'out', label: 'Used up' },
      { value: 'error', label: 'Unavailable' }
    ]
  })
  group({
    group: 'notice',
    label: 'Notice',
    value: 'none',
    options: [
      { value: 'none', label: 'None' },
      { value: 'update', label: 'Update' },
      { value: 'announce', label: 'Announcement' },
      { value: 'both', label: 'Both' }
    ]
  })

  /* ------------------------------------------------- 语言菜单（14 语） */
  var openMenu = function () {
    if (!langMenu.matches(':popover-open')) langBtn.click()
  }
  var closeMenu = function () {
    if (langMenu.matches(':popover-open')) langMenu.hidePopover()
  }
  // 深链打开菜单要等字体与 Popup 展开动画结束，定位才准
  var ready = (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    return MG.wait(MG.reducedMotion() ? 0 : 380)
  })

  Proto.states({
    group: 'menu',
    label: 'Language menu',
    value: 'closed',
    options: [
      { value: 'closed', label: 'Closed' },
      { value: 'open', label: 'Open' }
    ],
    onChange: function (value, prev) {
      if (prev === null) {
        if (value === 'open') ready.then(openMenu)
        return
      }
      if (value === 'open') openMenu()
      else closeMenu()
    }
  })

  langMenu.addEventListener('toggle', function (e) {
    Proto.set('menu', e.newState === 'open' ? 'open' : 'closed')
  })
  langMenu.addEventListener('ui:select', function (e) {
    var item = e.detail.item
    var code = root.querySelector('[data-pp-lang-code]')
    code.textContent = item.dataset.code
    langBtn.setAttribute('aria-label', 'Language: ' + item.dataset.code + ' (' + item.textContent.trim() + ')')
    MG.replay(code, 'is-bump')
  })
  // 原型里页面可滚动：菜单按视口定位，滚动时收起，避免与触发器错位
  window.addEventListener(
    'scroll',
    function () {
      closeMenu()
    },
    { passive: true }
  )

  /* ------------------------------------------------- Popup 自身的交互 */
  var timers = []
  var later = function (ms, fn) {
    timers.push(setTimeout(fn, MG.reducedMotion() ? Math.min(ms, 300) : ms))
  }
  var clearTimers = function () {
    timers.forEach(clearTimeout)
    timers = []
  }

  // Sign in：后台拉起官网登录，成功经存储监听即时切换（L5）；Sign out：即时回到访客。两者都重拉用量
  var onAuth = function () {
    var account = Proto.get('account')
    if (account === 'signing-in') return
    clearTimers()
    if (account === 'guest') {
      Proto.set('account', 'signing-in')
      later(2200, function () {
        if (Proto.get('account') !== 'signing-in') return
        Proto.set('account', 'signed-in')
        Proto.set('usage', 'loading')
        later(1000, function () {
          if (Proto.get('usage') === 'loading') Proto.set('usage', 'normal')
        })
      })
      return
    }
    Proto.set('account', 'guest')
    Proto.set('usage', 'loading')
    later(800, function () {
      if (Proto.get('usage') === 'loading') Proto.set('usage', 'normal')
    })
  }

  var onRetry = function () {
    clearTimers()
    Proto.set('usage', 'loading')
    later(1000, function () {
      if (Proto.get('usage') === 'loading') Proto.set('usage', 'normal')
    })
  }

  root.addEventListener('click', function (e) {
    var link = e.target.closest('[data-pp-link]')
    if (link) {
      e.preventDefault()
      UI.toast({
        title: 'Opens ' + LINKS[link.dataset.ppLink] + ' on mapsgrab.com',
        desc: 'In a new tab — outside this prototype.',
        tone: 'primary',
        icon: 'external-link',
        duration: 2600
      })
      return
    }
    if (e.target.closest('[data-pp-auth]')) onAuth()
    else if (e.target.closest('[data-pp-retry]')) onRetry()
  })

  // 中段滚动后页头出现分隔线
  body.addEventListener(
    'scroll',
    function () {
      head.classList.toggle('is-scrolled', body.scrollTop > 0)
    },
    { passive: true }
  )

  /* ------------------------------------------------- 打开编排（可重播） */
  var replayOpen = function () {
    closeMenu()
    frame.style.animation = 'none'
    void frame.offsetWidth
    frame.style.animation = ''
    MG.replay(head, 'enter')
    MG.replay(body, 'enter-group')
    MG.replay(foot, 'enter')
    if (root._pp && root._pp.block === 'meter') meter(root, figures(state), 'zero', OPEN_DELAY)
  }

  /* ------------------------------------------------- 壁纸：插画地图 + 落点 pin */
  var PINS = [
    [16, 52], [22, 64], [31, 26], [38, 74], [47, 44], [55, 22], [60, 66], [9, 78]
  ]
  document.querySelector('[data-pp-wall]').innerHTML =
    Proto.mapArt() +
    PINS.map(function (spot, i) {
      return '<span class="pp-pin' + (i % 3 === 1 ? ' is-collected' : '') + '" style="--x:' + spot[0] + '%;--y:' + spot[1] + '%;--i:' + i + '"></span>'
    }).join('')

  /* ------------------------------------------------- 状态矩阵 */
  var DEFAULTS = { account: 'guest', plan: 'pro', usage: 'normal', notice: 'none', menu: 'closed' }
  var CELLS = [
    { title: 'Guest', sub: 'Free records, counted on this browser', s: {} },
    { title: 'Signing in', sub: 'L5 · spinner until the sign-in tab reports back', s: { account: 'signing-in' } },
    { title: 'Signed in · Pro', sub: 'Name, email and plan', s: { account: 'signed-in' } },
    { title: 'Loading usage', sub: 'Fetched every time the popup opens', s: { account: 'signed-in', plan: 'business', usage: 'loading' } },
    { title: 'Near the limit', sub: 'L5 · 80% or more, amber + plans link', s: { account: 'signed-in', plan: 'free', usage: 'near' } },
    { title: 'Used up', sub: 'L3 · upgrade becomes the main action', s: { usage: 'out' } },
    { title: 'Usage unavailable', sub: 'L2 · reason, next step, Retry', s: { account: 'signed-in', usage: 'error' } },
    { title: 'Update required', sub: 'Version below the remote minimum', s: { account: 'signed-in', notice: 'update' } },
    { title: 'Announcement', sub: 'Remote HTML · hidden if config fails', s: { notice: 'announce' } },
    { title: 'Language menu', sub: '14 languages in two columns', s: { menu: 'open' } },
    // alt：与当前页面主题相反的主题岛（页面亮 → 暗色缩略图；页面暗 → 亮色缩略图）
    { title: 'near the limit', sub: 'Follows the shared theme (L11)', s: { account: 'signed-in', usage: 'near' }, alt: true },
    { title: 'used up', sub: 'Same states, other theme', s: { usage: 'out' }, alt: true }
  ]
  var altCells = []
  var syncAlt = function () {
    var dark = MG.theme.resolved() === 'light'
    altCells.forEach(function (c) {
      c.box.classList.toggle('scheme-dark', dark)
      c.box.classList.toggle('scheme-light', !dark)
      c.load.textContent = (dark ? 'Dark · ' : 'Light · ') + c.title
      c.load.setAttribute('aria-label', 'Load state in the popup: ' + c.load.textContent)
    })
  }
  document.addEventListener('mg:theme', syncAlt)

  var STRIP_ATTRS = ['id', 'data-tooltip', 'data-menu', 'aria-live', 'aria-controls', 'aria-haspopup', 'aria-describedby', 'popover']
  var strip = function (node) {
    STRIP_ATTRS.forEach(function (attr) {
      node.querySelectorAll('[' + attr + ']').forEach(function (n) {
        n.removeAttribute(attr)
      })
    })
    node.querySelectorAll('.enter, .enter-group').forEach(function (n) {
      n.classList.remove('enter', 'enter-group')
    })
  }

  var loadCell = function (s) {
    clearTimers()
    closeMenu()
    ;['account', 'plan', 'usage', 'notice'].forEach(function (key) {
      Proto.set(key, s[key])
    })
    var maxTop = document.documentElement.scrollHeight - window.innerHeight
    var top = Math.max(0, Math.min(maxTop, window.scrollY + document.getElementById('popup').getBoundingClientRect().top))
    window.scrollTo({ top: top, behavior: MG.reducedMotion() ? 'auto' : 'smooth' })
    if (s.menu !== 'open') return
    // 菜单按视口定位、页面滚动会收起它：等页面真正停在场景顶部再打开（不依赖 scrollend，惯性滚动会提前触发它）
    var started = performance.now()
    var settle = function () {
      if (Math.abs(window.scrollY - top) < 2 || performance.now() - started > 1500) {
        setTimeout(function () {
          Proto.set('menu', 'open')
        }, 80)
        return
      }
      requestAnimationFrame(settle)
    }
    requestAnimationFrame(settle)
  }

  var matrix = document.querySelector('[data-pp-matrix]')
  CELLS.forEach(function (cell) {
    var s = Object.assign({}, DEFAULTS, cell.s)
    var fig = document.createElement('figure')
    fig.className = 'pp-cell'
    var box = document.createElement('div')
    box.className = 'proto-popup pp-cell-frame'
    box.setAttribute('inert', '')
    box.setAttribute('aria-hidden', 'true')
    var clone = pristine.cloneNode(true)
    strip(clone)
    clone.classList.add('pp--static')
    box.appendChild(clone)
    var cap = document.createElement('figcaption')
    cap.className = 'pp-cell-cap'
    cap.innerHTML = '<button class="pp-cell-load" type="button"></button><span class="pp-cell-sub"></span>'
    var load = cap.querySelector('button')
    load.textContent = cell.title
    load.setAttribute('aria-label', 'Load state in the popup: ' + cell.title)
    cap.querySelector('.pp-cell-sub').textContent = cell.sub
    fig.appendChild(box)
    fig.appendChild(cap)
    matrix.appendChild(fig)
    apply(clone, s, { instant: true })
    if (s.menu === 'open') {
      var menu = clone.querySelector('.pp-lang-menu')
      menu.classList.add('pp-lang-menu--static')
      clone.querySelector('[data-pp-lang]').setAttribute('aria-expanded', 'true')
    }
    fig.addEventListener('click', function () {
      loadCell(s)
    })
    if (cell.alt) altCells.push({ box: box, load: load, title: cell.title })
  })
  syncAlt()

  /* ------------------------------------------------- 流程（状态坞「播放」） */
  var reset = function () {
    clearTimers()
    closeMenu()
  }

  Proto.flow('Open popup', function (p) {
    reset()
    p.step('Sections stagger in, usage rolls up')
    replayOpen()
    return p.wait(1600)
  })

  Proto.flow('Sign in', function (p) {
    reset()
    p.set('account', 'guest')
    p.set('usage', 'normal')
    p.step('Guest · free records on this browser')
    return p
      .wait(1400)
      .then(function () {
        p.set('account', 'signing-in')
        p.step('Signing in · finish in the new tab')
        return p.wait(2200)
      })
      .then(function () {
        p.set('account', 'signed-in')
        p.set('usage', 'loading')
        p.step('Signed in · usage reloads for the account')
        return p.wait(1100)
      })
      .then(function () {
        p.set('usage', 'normal')
        p.step(PLANS[state.plan].label + ' usage rolls in')
        return p.wait(1600)
      })
  })

  Proto.flow('Run out of records', function (p) {
    reset()
    p.set('usage', 'normal')
    p.step('Normal usage')
    return p
      .wait(1400)
      .then(function () {
        p.set('usage', 'near')
        p.step('80% or more · amber, plans link')
        return p.wait(2400)
      })
      .then(function () {
        p.set('usage', 'out')
        p.step('Used up · upgrade takes the lead')
        return p.wait(1600)
      })
  })

  Proto.flow('Retry usage', function (p) {
    reset()
    p.set('usage', 'error')
    p.step('Usage didn’t load')
    return p
      .wait(1800)
      .then(function () {
        p.set('usage', 'loading')
        p.step('Retry · loading')
        return p.wait(1000)
      })
      .then(function () {
        p.set('usage', 'normal')
        p.step('Loaded')
        return p.wait(1400)
      })
  })

  Proto.flow('Sign out', function (p) {
    reset()
    p.set('account', 'signed-in')
    p.set('usage', 'normal')
    p.step('Signed in')
    return p
      .wait(1200)
      .then(function () {
        p.set('account', 'guest')
        p.set('usage', 'loading')
        p.step('Signed out at once · usage reloads')
        return p.wait(900)
      })
      .then(function () {
        p.set('usage', 'normal')
        p.step('Back to free records on this browser')
        return p.wait(1400)
      })
  })

  Proto.flow('Notices arrive', function (p) {
    reset()
    p.set('notice', 'none')
    p.step('No notices')
    return p
      .wait(900)
      .then(function () {
        p.set('notice', 'update')
        p.step('Update required slides in')
        return p.wait(1800)
      })
      .then(function () {
        p.set('notice', 'both')
        p.step('Announcement joins')
        return p.wait(1800)
      })
  })
})()
