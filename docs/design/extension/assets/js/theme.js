/*
 * 扩展页面首帧引导 + 主题 API（<head> 内同步执行，不加 defer，避免首帧闪烁）。
 *
 *  1. html.js 标记：[data-reveal] 的初始隐藏只在 JS 可用时生效，无 JS 时内容直接可读。
 *  2. 主题（L11，Popup / Dashboard / Options / 页内面板共享）：
 *       localStorage 'mg-ext-theme' = 'light' | 'dark'；缺省 = 跟随系统（不写 data-theme）。
 *       落地时存储换成 chrome.storage.local，变更经 storage 监听同步到所有界面（含页内面板宿主的 data-theme）。
 *  3. 原型状态坞的「减弱动效」模拟：sessionStorage 'mg-proto-motion' = 'reduce' → <html data-motion="reduce">。
 *  4. URL 参数 ?theme=light|dark|system、?motion=reduce 供截图与深链使用（只作用于本次打开）。
 *
 * 运行时：
 *   MG.theme.mode()              'system' | 'light' | 'dark'
 *   MG.theme.resolved()          'light' | 'dark'（system 时按系统偏好求值）
 *   MG.theme.set(mode, { origin })  切换并持久化；传入触发元素时用圆形揭示（View Transitions，减弱动效下直接切换）
 *   document 事件 'mg:theme'     detail = { mode, resolved }；系统偏好变化且处于 system 时也会派发
 */
;(function () {
  var root = document.documentElement
  var KEY = 'mg-ext-theme'
  var MOTION_KEY = 'mg-proto-motion'
  var params = new URLSearchParams(location.search)
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  root.classList.add('js')

  var storage = function (area, op, value) {
    try {
      if (op === 'get') return window[area].getItem(value)
      if (op === 'remove') return window[area].removeItem(value[0])
      window[area].setItem(value[0], value[1])
    } catch (error) {
      // 隐私模式等场景存储不可用：本次会话内仍生效，只是不持久
    }
    return null
  }

  var writeAttr = function (mode) {
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode)
    else root.removeAttribute('data-theme')
  }

  var urlTheme = params.get('theme')
  writeAttr(urlTheme || storage('localStorage', 'get', KEY))

  var urlMotion = params.get('motion')
  if ((urlMotion || storage('sessionStorage', 'get', MOTION_KEY)) === 'reduce') root.setAttribute('data-motion', 'reduce')

  var MG = (window.MG = window.MG || {})

  var mode = function () {
    var value = root.getAttribute('data-theme')
    return value === 'light' || value === 'dark' ? value : 'system'
  }

  var resolve = function (value) {
    if (value === 'light' || value === 'dark') return value
    return darkQuery.matches ? 'dark' : 'light'
  }

  var emit = function () {
    document.dispatchEvent(new CustomEvent('mg:theme', { detail: { mode: mode(), resolved: resolve(mode()) } }))
  }

  var apply = function (next) {
    writeAttr(next)
    if (next === 'light' || next === 'dark') storage('localStorage', 'set', [KEY, next])
    else storage('localStorage', 'remove', [KEY])
    emit()
  }

  var cssValue = function (name, fallback) {
    var value = getComputedStyle(root).getPropertyValue(name).trim()
    return value || fallback
  }

  MG.theme = {
    mode: mode,
    resolved: function () {
      return resolve(mode())
    },
    set: function (next, options) {
      if (next === mode()) return
      var origin = options && options.origin
      var reduced = reduceQuery.matches || root.getAttribute('data-motion') === 'reduce'
      if (!origin || !document.startViewTransition || reduced || resolve(next) === resolve(mode())) {
        apply(next)
        return
      }
      // 从触发元素中心圆形揭示新主题（与 website 同一手法）
      var rect = origin.getBoundingClientRect()
      var x = rect.left + rect.width / 2
      var y = rect.top + rect.height / 2
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      root.classList.add('theme-switching')
      var transition = document.startViewTransition(function () {
        apply(next)
      })
      transition.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          {
            duration: parseFloat(cssValue('--dur-4', '560ms')),
            easing: cssValue('--ease-out', 'ease-out'),
            pseudoElement: '::view-transition-new(root)'
          }
        )
      })
      transition.finished.then(function () {
        root.classList.remove('theme-switching')
      })
    }
  }

  darkQuery.addEventListener('change', function () {
    if (mode() === 'system') emit()
  })

  // 其他标签页改了主题（落地时对应 chrome.storage.onChanged）
  window.addEventListener('storage', function (event) {
    if (event.key !== KEY) return
    writeAttr(event.newValue)
    emit()
  })
})()
