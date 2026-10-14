/*
 * 站级外壳：导航、移动菜单、页脚、登录弹窗、Toast 容器。
 * 原型里由 JS 注入以保持 9 个页面一致；落地 Astro 时对应 Layout.astro 的 header / footer
 * 与 SiteAuthModal，结构与 class 原样迁移即可。
 *
 * 页面约定：
 *   <body data-page="home|extension|online|api|mcp|pricing|tool|legal|company|system">
 *   <div data-chrome="nav"></div> ... <div data-chrome="footer"></div>
 */
(function () {
  var page = document.body.dataset.page || ''
  var uid = 0

  var ICONS = 'assets/img/icons.svg'
  var icon = function (name, cls) {
    return (
      '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="' + ICONS + '#i-' + name + '"/></svg>'
    )
  }

  // 品牌标：渐变方块 + 白色 pin + 下载箭头（“从地点抓取”）
  var logoMark = function (cls) {
    var id = 'mg-grad-' + uid++
    return (
      '<svg class="brand-mark ' + (cls || '') + '" viewBox="0 0 32 32" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#1a73e8"/><stop offset=".55" stop-color="#0aa5d6"/><stop offset="1" stop-color="#14b37d"/>' +
      '</linearGradient></defs>' +
      '<rect width="32" height="32" rx="9" fill="url(#' + id + ')"/>' +
      '<path d="M16 6.2c-4.42 0-8 3.36-8 7.66 0 5.5 6.64 11.04 7.4 11.66.35.28.85.28 1.2 0 .76-.62 7.4-6.16 7.4-11.66 0-4.3-3.58-7.66-8-7.66Z" fill="#fff"/>' +
      '<path d="M16 10.1v6.2m-2.9-2.9 2.9 2.9 2.9-2.9" fill="none" stroke="#1a73e8" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    )
  }

  var current = function (key) {
    return page === key ? ' aria-current="page"' : ''
  }

  var apiItems = [
    { href: 'google-maps-scraper-api.html', icon: 'database', title: 'Scraper API', desc: 'Business data for any keyword and location, as JSON.' },
    { href: 'google-maps-scraper-api.html?api=reviews', icon: 'review', title: 'Reviews API', desc: 'Full review threads with ratings and owner replies.' },
    { href: 'google-maps-scraper-api.html?api=photos', icon: 'image', title: 'Photos API', desc: 'Public photo galleries as ready-to-use URL lists.' },
    { href: 'google-maps-scraper-mcp.html', icon: 'bot', title: 'Scraper MCP', desc: 'Live Maps data for Claude Code, Cursor and VS Code.', ai: true }
  ]

  // 免费工具：[名称, 图标, id（对应真实路由 /tools/<id>/）, 一句话描述]
  // 原型只做一张工具模板页，其余工具以 ?tool=<id> 复用同一模板
  var tools = [
    ['Place ID Finder', 'scan', 'place-id-finder', 'Paste a Maps place URL and read out its Place ID, CID and FID.'],
    ['Review Link Generator', 'review', 'review-link-generator', 'Get the direct “write a review” link for any business.'],
    ['Email Checker', 'at', 'email-checker', 'See instantly whether an email format is valid — with typo hints.'],
    ['Lat Long to DMS Converter', 'locate', 'lat-long-to-dms', 'Decimal coordinates to degrees, minutes and seconds.'],
    ['DMS to Decimal Converter', 'swap', 'dms-to-dd', 'DMS coordinates back to clean decimal degrees.'],
    ['Bulk Keywords Generator', 'list-plus', 'bulk-keywords-generator', 'Every “keyword + location” combination, ready to paste.'],
    ['Merge CSV Files Online', 'merge', 'merge-csv', 'Merge CSV exports into one file, aligned by header.']
  ]
  var toolHref = function (t) {
    return t[2] === 'place-id-finder' ? 'place-id-finder.html' : 'place-id-finder.html?tool=' + t[2]
  }

  /* ------------------------------------------------------------------ nav */
  var navHtml =
    '<div class="scroll-progress" data-scroll-progress aria-hidden="true"></div>' +
    '<header class="site-nav" data-nav>' +
    '<div class="nav-inner">' +
    '<a class="brand" href="index.html" aria-label="MapsGrab home">' + logoMark() + '<span>MapsGrab</span></a>' +
    '<nav class="nav-links" aria-label="Primary" data-nav-links>' +
    '<span class="nav-pill" aria-hidden="true"></span>' +
    '<a class="nav-link" href="extension.html"' + current('extension') + '>Extension</a>' +
    '<a class="nav-link" href="online-scraper.html"' + current('online') + '>Online</a>' +
    '<div class="dd" data-dropdown>' +
    '<button class="nav-link" type="button" aria-expanded="false" aria-haspopup="true" data-dropdown-trigger' +
    (page === 'api' || page === 'mcp' ? ' aria-current="page"' : '') + '>API ' + icon('chevron-down') + '</button>' +
    '<div class="dd-panel" data-dropdown-panel>' +
    apiItems
      .map(function (item) {
        return (
          '<a class="dd-item" href="' + item.href + '">' +
          '<span class="dd-icon' + (item.ai ? ' dd-icon--ai' : '') + '">' + icon(item.icon) + '</span>' +
          '<span><span class="dd-title">' + item.title + (item.ai ? ' <span class="badge badge--ai">AI</span>' : '') + '</span>' +
          '<span class="dd-desc">' + item.desc + '</span></span></a>'
        )
      })
      .join('') +
    '<div class="dd-foot"><span>One API key covers all four endpoints.</span><a href="pricing.html#api">API pricing ' + icon('arrow-right', 'icon--sm') + '</a></div>' +
    '</div></div>' +
    '<a class="nav-link" href="pricing.html"' + current('pricing') + '>Pricing</a>' +
    '</nav>' +
    '<div class="nav-actions">' +
    '<button class="icon-btn hide-sm" type="button" aria-label="Language: English" data-lang-toggle>' + icon('globe') + '</button>' +
    '<button class="icon-btn theme-toggle" type="button" aria-label="Toggle color theme" data-theme-toggle>' +
    icon('sun', 'i-sun') + icon('moon', 'i-moon') + '</button>' +
    '<button class="btn btn-ghost btn-sm hide-sm" type="button" data-signin>Sign in</button>' +
    '<a class="btn btn-primary btn-sm hide-sm" href="extension.html#install">Install free ' + icon('arrow-right', 'icon-arrow') + '</a>' +
    '<button class="icon-btn nav-burger" type="button" aria-label="Open menu" aria-expanded="false" data-menu-toggle>' + icon('menu') + '</button>' +
    '</div></div></header>' +
    '<nav class="mobile-menu" aria-label="Mobile" data-mobile-menu>' +
    [
      ['Extension', 'extension.html', ''],
      ['Online Scraper', 'online-scraper.html', ''],
      ['Scraper API', 'google-maps-scraper-api.html', 'sub'],
      ['Reviews API', 'google-maps-scraper-api.html?api=reviews', 'sub'],
      ['Photos API', 'google-maps-scraper-api.html?api=photos', 'sub'],
      ['Scraper MCP', 'google-maps-scraper-mcp.html', 'sub'],
      ['Pricing', 'pricing.html', ''],
      ['Free tools', 'place-id-finder.html', '']
    ]
      .map(function (item, i) {
        return '<a class="' + item[2] + '" href="' + item[1] + '" style="--i:' + i + '">' + item[0] + icon('arrow-up-right') + '</a>'
      })
      .join('') +
    '<button class="btn btn-secondary btn-lg" type="button" data-signin>Sign in</button>' +
    '<a class="btn btn-primary btn-lg" href="extension.html#install">Install MapsGrab free</a>' +
    '</nav>'

  /* --------------------------------------------------------------- footer */
  var col = function (title, links) {
    return (
      '<div class="footer-col"><h4>' + title + '</h4>' +
      links
        .map(function (l) {
          return '<a href="' + l[1] + '"' + (l[2] ? ' ' + l[2] : '') + '>' + l[0] + '</a>'
        })
        .join('') +
      '</div>'
    )
  }

  var footerHtml =
    '<footer class="site-footer">' +
    '<div class="container footer-grid" data-stagger="60">' +
    '<div class="footer-brand" data-reveal>' +
    '<a class="brand" href="index.html">' + logoMark() + '<span>MapsGrab</span></a>' +
    '<p>Turn public Google Maps listings into clean, export-ready data — with a browser extension, a cloud scraper, and an API.</p>' +
    '<div class="footer-meta"><span class="chip chip--mono"><span class="dot dot--live" style="color:var(--ok)"></span>Early access</span>' +
    '<span class="chip chip--mono">' + icon('globe') + 'English</span></div>' +
    '</div>' +
    '<div data-reveal>' + col('Product', [
      ['Browser Extension', 'extension.html'],
      ['Online Scraper', 'online-scraper.html'],
      ['Pricing', 'pricing.html'],
      ['Dashboard', '#', 'data-proto-note="The Dashboard workspace is outside this redesign prototype."']
    ]) + '</div>' +
    '<div data-reveal>' + col('API', [
      ['Scraper API', 'google-maps-scraper-api.html'],
      ['Reviews API', 'google-maps-scraper-api.html?api=reviews'],
      ['Photos API', 'google-maps-scraper-api.html?api=photos'],
      ['Scraper MCP', 'google-maps-scraper-mcp.html']
    ]) + '</div>' +
    '<div data-reveal>' + col('Free tools', tools.map(function (t) { return [t[0], toolHref(t)] })) + '</div>' +
    '<div data-reveal>' + col('Company', [
      ['About', 'about.html'],
      ['Contact', 'about.html#contact'],
      ['Privacy Policy', 'privacy.html'],
      ['Terms of Service', 'privacy.html?doc=terms'],
      ['Design system', 'design-system.html']
    ]) + '</div>' +
    '</div>' +
    '<div class="footer-wordmark" aria-hidden="true" data-reveal="blur">MapsGrab</div>' +
    '<div class="container footer-bottom">' +
    '<span>© 2026 MapsGrab. All rights reserved.</span>' +
    '<nav aria-label="Legal"><a href="privacy.html?doc=terms">Terms</a><a href="privacy.html">Privacy</a><a href="about.html#contact">Contact</a></nav>' +
    '</div></footer>'

  /* ------------------------------------------------------ sign-in dialog */
  var signinHtml =
    '<dialog class="modal" id="signin-modal" aria-labelledby="signin-title">' +
    '<div class="modal-body">' +
    '<button class="icon-btn modal-close" type="button" aria-label="Close" data-modal-close>' + icon('x') + '</button>' +
    '<div class="modal-hero">' + logoMark() +
    '<h2 class="modal-title" id="signin-title">Sign in to MapsGrab</h2>' +
    '<p class="modal-sub">Sync your plan and quota across the extension, Online Scraper and API.</p></div>' +
    '<div data-signin-step="1">' +
    '<button class="btn btn-google btn-lg" type="button">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>' +
    'Continue with Google</button>' +
    '<div class="divider-or">or</div>' +
    '<form class="stack" style="--stack-gap:12px" data-signin-form>' +
    '<label class="field"><span class="field-label">Email</span><input class="input" type="email" required placeholder="name@example.com" autocomplete="email"></label>' +
    '<button class="btn btn-primary btn-lg btn-block" type="submit">Continue with email ' + icon('arrow-right', 'icon-arrow') + '</button>' +
    '</form></div>' +
    '<div data-signin-step="2" hidden>' +
    '<form class="stack" style="--stack-gap:14px" data-signin-code>' +
    '<p class="body-sm muted" data-signin-sent>We sent a 6-digit code to your inbox.</p>' +
    '<div class="otp" data-otp>' + '<input class="input" inputmode="numeric" maxlength="1" aria-label="Digit">'.repeat(6) + '</div>' +
    '<button class="btn btn-primary btn-lg btn-block" type="submit">Sign in</button>' +
    '<button class="btn btn-ghost btn-sm" type="button" data-signin-back>Use another email</button>' +
    '</form></div>' +
    '<p class="modal-legal">By signing in, you agree to the <a href="privacy.html?doc=terms">Terms</a> and <a href="privacy.html">Privacy Policy</a>.</p>' +
    '</div></dialog>' +
    '<div class="toast-stack" data-toast-stack aria-live="polite"></div>'

  var mount = function (key, html) {
    var slot = document.querySelector('[data-chrome="' + key + '"]')
    if (slot) slot.outerHTML = html
  }

  mount('nav', navHtml)
  mount('footer', footerHtml)
  document.body.insertAdjacentHTML('beforeend', signinHtml)

  // 供页面脚本复用
  window.MGChrome = { icon: icon, logoMark: logoMark, tools: tools, toolHref: toolHref }
})()
