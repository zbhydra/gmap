/*
 * Legal 页：Privacy / Terms 两份文档同页切换（?doc=terms，与真实 /privacy、/terms 路由一一对应）。
 *   - 加载阶段（本文件早于 motion.js / site.js 执行）：按 URL 写入初始文档；默认文档的标题已在 HTML 预拆（static），其他文档改回运行时拆词由 motion.js 入场
 *   - 交互阶段（DOMContentLoaded）：切换时同步 URL / title / 摘要，标题逐词重播，文档叠放插画洗牌
 *   - 小节链接复制、手机端吸顶目录横向跟随当前小节
 */
;(function () {
  var tabs = document.querySelector('[data-doc-tabs]')
  if (!tabs) return
  var titleEl = document.querySelector('[data-doc-title]')
  var intro = document.querySelector('[data-doc-intro]')
  var meta = document.querySelector('[data-doc-meta]')
  var crumb = document.querySelector('[data-doc-crumb]')
  var updated = document.querySelector('[data-doc-updated]')
  var read = document.querySelector('[data-doc-read]')
  var count = document.querySelector('[data-doc-count]')
  var description = document.querySelector('meta[name="description"]')
  var stack = document.querySelector('[data-doc-stack]')
  var panels = {}
  document.querySelectorAll('[data-doc]').forEach(function (panel) {
    panels[panel.dataset.doc] = panel
  })

  // 阅读时长按正文词数估算（200 词 / 分钟）
  var readMinutes = function (panel) {
    var words = panel.querySelector('.legal-prose').textContent.trim().split(/\s+/).length
    return Math.max(1, Math.round(words / 200))
  }

  var fill = function (key) {
    var panel = panels[key]
    document.title = panel.dataset.docSeoTitle
    if (description) description.setAttribute('content', panel.dataset.docDescription)
    crumb.textContent = panel.dataset.docTitle
    intro.textContent = panel.dataset.docIntro
    updated.textContent = panel.dataset.docUpdated
    updated.setAttribute('datetime', panel.dataset.docUpdatedIso)
    read.textContent = readMinutes(panel) + ' min read'
    count.textContent = panel.querySelectorAll('.legal-section').length + ' sections'
  }

  var setSheets = function (key, animate) {
    if (!stack) return
    stack.querySelectorAll('[data-sheet]').forEach(function (sheet) {
      var front = sheet.dataset.sheet === key
      if (animate && !front && sheet.classList.contains('is-front')) {
        sheet.classList.add('is-leaving')
        sheet.addEventListener('animationend', function done() {
          sheet.classList.remove('is-leaving')
          sheet.removeEventListener('animationend', done)
        })
      }
      sheet.classList.toggle('is-front', front)
    })
  }

  /* ------------------------------------------------------- 初始文档 */
  // ?doc=terms，或锚点指向 Terms 内的小节时，直接以 Terms 渲染（避免 motion.js 拆词后再换字）
  var current = new URLSearchParams(location.search).get('doc') === 'terms' ? 'terms' : 'privacy'
  var hashTarget = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
  var hashPanel = hashTarget ? hashTarget.closest('[data-doc]') : null
  if (hashPanel) current = hashPanel.dataset.doc

  fill(current)
  // HTML 里的标题是默认文档的预拆结构（data-split="static"）；初始文档不同时改回运行时拆词，交给 motion.js 入场
  var initialTitle = panels[current].dataset.docTitle
  if (titleEl.textContent.replace(/\s+/g, ' ').trim() !== initialTitle) {
    titleEl.setAttribute('data-split', '')
    titleEl.textContent = initialTitle
  }
  tabs.querySelectorAll('[role="tab"]').forEach(function (btn) {
    btn.setAttribute('aria-selected', String(btn.dataset.tab === current))
  })
  Object.keys(panels).forEach(function (key) {
    panels[key].hidden = key !== current
  })
  setSheets(current, false)

  /* ----------------------------------------------------------- 交互 */
  document.addEventListener('DOMContentLoaded', function () {
    var MG = window.MG
    var smooth = function () {
      return MG.reducedMotion() ? 'auto' : 'smooth'
    }

    var replay = function (el) {
      el.classList.remove('is-swapping')
      void el.offsetWidth
      el.classList.add('is-swapping')
    }

    // 标题换字：克隆一个未拆分的新节点交给 MG.init，复用 data-split 的逐词上升
    var swapTitle = function (text) {
      var fresh = titleEl.cloneNode(false)
      fresh.setAttribute('data-split', '')
      fresh.removeAttribute('data-split-ready')
      fresh.classList.remove('is-revealed')
      fresh.textContent = text
      titleEl.replaceWith(fresh)
      titleEl = fresh
      MG.init(fresh)
    }

    var show = function (key) {
      if (key === current) return
      current = key
      fill(key)
      swapTitle(panels[key].dataset.docTitle)
      replay(intro)
      replay(meta)
      setSheets(key, !MG.reducedMotion())
      var url = new URL(location.href)
      if (key === 'terms') url.searchParams.set('doc', 'terms')
      else url.searchParams.delete('doc')
      url.hash = ''
      history.replaceState(null, '', url)
      // 目录高亮由 site.js 在 scroll 时计算，切换后主动刷新一次
      window.dispatchEvent(new Event('scroll'))
    }

    tabs.addEventListener('tabchange', function (e) {
      show(e.detail.key)
    })

    // 「下一篇」：回到顶部再切换
    var tabButtons = Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]'))
    document.querySelectorAll('[data-doc-switch]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault()
        var index = tabButtons.findIndex(function (btn) {
          return btn.dataset.tab === link.dataset.docSwitch
        })
        window.scrollTo({ top: 0, behavior: smooth() })
        tabs.selectTab(index)
      })
    })

    // 小节链接：滚动到位并复制带锚点的完整 URL
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('[data-anchor-copy]')
      if (!anchor) return
      e.preventDefault()
      var id = anchor.getAttribute('href').slice(1)
      var url = new URL(location.href)
      url.hash = id
      history.replaceState(null, '', url)
      document.getElementById(id).scrollIntoView({ behavior: smooth(), block: 'start' })
      if (navigator.clipboard) navigator.clipboard.writeText(url.href).catch(function () {})
      MG.toast('Link copied', 'A direct link to this section is on your clipboard.')
    })

    // 手机端吸顶目录：当前小节变化时把对应胶囊滚到中间
    var lastActive = null
    var followToc = function () {
      var toc = panels[current].querySelector('.legal-toc')
      if (toc.scrollWidth <= toc.clientWidth) return
      var active = toc.querySelector('a.is-active')
      if (!active || active === lastActive) return
      lastActive = active
      var a = active.getBoundingClientRect()
      var t = toc.getBoundingClientRect()
      toc.scrollBy({ left: a.left + a.width / 2 - (t.left + t.width / 2), behavior: smooth() })
    }
    var ticking = false
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return
        ticking = true
        requestAnimationFrame(function () {
          followToc()
          ticking = false
        })
      },
      { passive: true }
    )

    // 初始锚点落在原本隐藏的面板里时，浏览器不会自动定位，这里补一次
    if (hashTarget) {
      window.addEventListener('load', function () {
        hashTarget.scrollIntoView({ block: 'start' })
      })
    }
  })
})()
