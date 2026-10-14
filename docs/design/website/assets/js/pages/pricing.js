/*
 * Pricing 页：三产品线方案（文案、价格、额度逐字来自 website/src/i18n/pricing.ts）、
 * 产品切换与 URL hash 双向同步（#online / #extension / #api，默认 Online，与 011 feat 一致）、
 * 价格滚动、用量估算条（月用量 → 最小够用档位）、对比表、用量口径动画（record / request）。
 * 落地时方案卡与对比表由 Astro 从 pricing.ts SSR 渲染；本文件的数据对象只是原型镜像。
 * 付费按钮在原型里打开站级登录弹窗（真实流程：未登录先登录 → 统一 checkout 选 PayPal / ClinkBill）。
 */
;(function () {
  var MG = window.MG
  var icon = window.MGChrome.icon
  var reduced = MG.reducedMotion()

  var TAB_KEYS = ['online', 'extension', 'api']

  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  /* =====================================================================
     pricing.ts 镜像：价格、额度、方案名、tagline、CTA 逐字。
     例外：Online 卖点按 014 合同（每任务关键词上限 2/5/10/20/50、地图 / 地区模式、
     CSV + ZIP）替换了 pricing.ts 里的占位条目（评论 / 照片 / 评论 URL 任务 / JSON / 跨次去重
     不在 Online 范围内），pricing.ts 需同步修订，见 README §10
     ===================================================================== */
  var PRICING = {
    popularLabel: 'Most Popular',
    tabs: {
      online: {
        unit: 'records',
        freeHref: 'online-scraper.html',
        eyebrow: 'Online Scraper plans',
        title: 'Cloud extraction, priced by records',
        description:
          'Run the MapsGrab engine on our infrastructure. A record is one business row collected. Paid plans include optional email and social media enrichment at no extra record cost.',
        // 计费方式：plans.billingOneTime + quotaNote / features 中的原句片段
        billing: [
          ['calendar', 'One-time payment'],
          ['clock', 'Covers one natural month'],
          ['refresh', 'No auto-renewal']
        ],
        cards: [
          {
            id: 'free',
            productId: null,
            name: 'Free',
            tagline: 'Try the cloud scraper on a small scale',
            price: '$0',
            periodLabel: 'forever',
            quota: '1,000 records / month',
            features: [
              'Business extraction with 36-column CSV export',
              'Up to 2 keywords per task',
              'Map and region modes for area searches',
              'Email & social enrichment on paid plans',
              'CSV per keyword, ZIP per task'
            ],
            ctaLabel: 'Start free',
            featured: false
          },
          {
            id: 'lite',
            productId: 'online_lite',
            name: 'Lite',
            tagline: 'For occasional one-off exports',
            price: '$19',
            periodLabel: 'one-time · 1 month',
            quota: '20,000 records / month',
            features: [
              'Everything in Free',
              '20,000 records for 1 month',
              'One-time payment — no auto-renewal',
              'Up to 5 keywords per task',
              'Email & social enrichment, on by default and optional'
            ],
            ctaLabel: 'Get Lite',
            featured: false
          },
          {
            id: 'basic',
            productId: 'online_basic',
            name: 'Basic',
            tagline: 'For steady weekly lead collection',
            price: '$49',
            periodLabel: 'one-time · 1 month',
            quota: '80,000 records / month',
            features: [
              'Everything in Lite',
              '80,000 records for 1 month',
              'One-time payment — no auto-renewal',
              'Up to 10 keywords per task'
            ],
            ctaLabel: 'Get Basic',
            featured: true
          },
          {
            id: 'growth',
            productId: 'online_growth',
            name: 'Growth',
            tagline: 'For growing lead pipelines',
            price: '$99',
            periodLabel: 'one-time · 1 month',
            quota: '250,000 records / month',
            features: [
              'Everything in Basic',
              '250,000 records for 1 month',
              'One-time payment — no auto-renewal',
              'Up to 20 keywords per task'
            ],
            ctaLabel: 'Get Growth',
            featured: false
          },
          {
            id: 'professional',
            productId: 'online_pro',
            name: 'Professional',
            tagline: 'For agencies and data-heavy teams',
            price: '$149',
            periodLabel: 'one-time · 1 month',
            quota: '500,000 records / month',
            features: [
              'Everything in Growth',
              '500,000 records for 1 month',
              'One-time payment — no auto-renewal',
              'Up to 50 keywords per task'
            ],
            ctaLabel: 'Get Professional',
            featured: false
          }
        ],
        quotaNote:
          'One-time payment covering one natural month — plans on this tab do not auto-renew. A record is one business row collected from Google Maps; usage resets on the 1st and unused records do not roll over.'
      },
      extension: {
        unit: 'records',
        freeHref: 'extension.html#install',
        eyebrow: 'Extension plans',
        title: 'One extension, three record volumes',
        description:
          // pricing.ts 原句结尾是 “the ceiling is the only thing that changes”，与 Pro 独有的跨次去重、
          // Drive / HubSpot 投递矛盾；与插件页统一改写（pricing.ts 需同步修订，见 README §10）
          'Records are the businesses you extract. Every plan includes reviews, photos, email and social enrichment, and batch tasks. Pro and Business add cross-run deduplication and Google Drive & HubSpot delivery.',
        // plans.billingAutoRenew + FAQ 原句片段
        billing: [
          ['refresh', 'Auto-renews until canceled'],
          ['calendar', 'Billed monthly'],
          ['settings', 'Manage at your payment provider']
        ],
        cards: [
          {
            id: 'free',
            productId: null,
            name: 'Free',
            tagline: 'Everything the extension does, on a small scale',
            price: '$0',
            periodLabel: 'forever',
            quota: '1,000 records / month',
            features: [
              'Full 36-column business extraction',
              'Reviews (11 columns) and photo URLs',
              'Email & social media enrichment',
              'Batch keyword and review-URL tasks',
              'CSV / JSON export with field selection'
            ],
            ctaLabel: 'Install the extension',
            featured: false
          },
          {
            id: 'pro',
            productId: 'maps_extension_pro',
            name: 'Pro',
            tagline: 'For freelancers and growing lead pipelines',
            price: '$39',
            periodLabel: 'per month',
            quota: '100,000 records / month',
            features: [
              'Everything in Free',
              '100,000 records every month',
              'Priority email & social enrichment',
              'Deduplication across runs by Place ID',
              'Optional Google Drive & HubSpot delivery'
            ],
            ctaLabel: 'Get Pro',
            featured: true
          },
          {
            id: 'business',
            productId: 'maps_extension_business',
            name: 'Business',
            tagline: 'For agencies and data-heavy teams',
            price: '$99',
            periodLabel: 'per month',
            quota: '500,000 records / month',
            features: [
              'Everything in Pro',
              '500,000 records every month',
              'Room for multi-market batch tasks',
              'Highest enrichment throughput',
              'Same local-first export pipeline'
            ],
            ctaLabel: 'Get Business',
            featured: false
          }
        ],
        quotaNote:
          'A record is one business row extracted from Google Maps. Monthly usage resets on the 1st; unused records do not roll over.'
      },
      api: {
        unit: 'requests',
        freeHref: 'google-maps-scraper-api.html',
        eyebrow: 'API plans',
        title: 'Programmatic access, priced by requests',
        description:
          'Query business data, reviews and photos from your own applications over a simple HTTP API. A request is one successful API call that returns data.',
        billing: [
          ['calendar', 'One-time payment'],
          ['clock', 'Covers one natural month'],
          ['refresh', 'No auto-renewal']
        ],
        cards: [
          {
            id: 'free',
            productId: null,
            name: 'Free',
            tagline: 'Evaluate the API on a small scale',
            price: '$0',
            periodLabel: 'forever',
            quota: '20 requests / month',
            features: [
              'Business search and Place ID lookup',
              'Reviews and photo endpoints',
              'JSON responses',
              'API key tied to your account',
              'Community support'
            ],
            ctaLabel: 'Start free',
            featured: false
          },
          {
            id: 'basic',
            productId: 'api_basic',
            name: 'Basic',
            tagline: 'For prototypes and light integrations',
            price: '$15',
            periodLabel: 'one-time · 1 month',
            quota: '1,000 requests / month',
            features: [
              'Everything in Free',
              '1,000 requests for 1 month',
              'One-time payment — no auto-renewal',
              'All data endpoints unlocked',
              'JSON responses'
            ],
            ctaLabel: 'Get Basic',
            featured: false
          },
          {
            id: 'professional',
            productId: 'api_professional',
            name: 'Professional',
            tagline: 'For production integrations',
            price: '$65',
            periodLabel: 'one-time · 1 month',
            quota: '5,000 requests / month',
            features: [
              'Everything in Basic',
              '5,000 requests for 1 month',
              'One-time payment — no auto-renewal',
              'Higher rate limits',
              'JSON responses'
            ],
            ctaLabel: 'Get Professional',
            featured: true
          },
          {
            id: 'business',
            productId: 'api_business',
            name: 'Business',
            tagline: 'For products built on MapsGrab data',
            price: '$115',
            periodLabel: 'one-time · 1 month',
            quota: '10,000 requests / month',
            features: [
              'Everything in Professional',
              '10,000 requests for 1 month',
              'One-time payment — no auto-renewal',
              'Higher rate limits',
              'JSON responses'
            ],
            ctaLabel: 'Get Business',
            featured: false
          },
          {
            id: 'scale',
            productId: 'api_scale',
            name: 'Scale',
            tagline: 'For high-volume data operations',
            price: '$365',
            periodLabel: 'one-time · 1 month',
            quota: '50,000 requests / month',
            features: [
              'Everything in Business',
              '50,000 requests for 1 month',
              'One-time payment — no auto-renewal',
              'Highest rate limits',
              'JSON responses'
            ],
            ctaLabel: 'Get Scale',
            featured: false
          }
        ],
        quotaNote:
          'One-time payment covering one natural month — plans on this tab do not auto-renew. A request is one successful API call that returns data; usage resets on the 1st and unused requests do not roll over.'
      }
    }
  }

  /*
   * 对比表：行名取自各档 features（Online 同上按 014），包含关系按卡面 “Everything in X” 继承展开。
   * 1 = 包含，0 = 卡面未列出，字符串 = 卡面原句里的档位差异。
   * MCP 行来源：en-US MCP FAQ（“the same key plans on the Pricing page cover”）。
   */
  var COMPARE = {
    online: [
      ['Data', [
        ['Business extraction with 36-column CSV export', [1, 1, 1, 1, 1]],
        ['Email & social enrichment', [0, 'On by default, optional', 'On by default, optional', 'On by default, optional', 'On by default, optional']]
      ]],
      ['Workflow', [
        ['Keywords per task', ['2', '5', '10', '20', '50']],
        ['Map and region modes', [1, 1, 1, 1, 1]],
        ['CSV per keyword, ZIP per task', [1, 1, 1, 1, 1]]
      ]]
    ],
    extension: [
      ['Data', [
        ['Full 36-column business extraction', [1, 1, 1]],
        ['Reviews (11 columns) and photo URLs', [1, 1, 1]],
        ['Email & social media enrichment', ['Included', 'Priority', 'Highest throughput']],
        ['Batch keyword and review-URL tasks', [1, 1, 1]],
        ['Room for multi-market batch tasks', [0, 0, 1]]
      ]],
      ['Export', [
        ['CSV / JSON export with field selection', [1, 1, 1]],
        ['Deduplication across runs by Place ID', [0, 1, 1]],
        ['Optional Google Drive & HubSpot delivery', [0, 1, 1]],
        ['Local-first export pipeline', [1, 1, 1]]
      ]]
    ],
    api: [
      ['Endpoints', [
        ['Business search and Place ID lookup', [1, 1, 1, 1, 1]],
        ['Reviews and photo endpoints', [1, 1, 1, 1, 1]],
        ['All data endpoints unlocked', [0, 1, 1, 1, 1]],
        ['JSON responses', [1, 1, 1, 1, 1]],
        ['MCP server with the same API key', [1, 1, 1, 1, 1]]
      ]],
      ['Access', [
        ['API key tied to your account', [1, 1, 1, 1, 1]],
        // Free / Basic 没有写限速档位：显示为基础档，避免 “—” 被读成“不限速”
        ['Rate limits', ['Standard', 'Standard', 'Higher', 'Higher', 'Highest']],
        ['Community support', [1, 1, 1, 1, 1]]
      ]]
    ]
  }

  var TAB_LABEL = { online: 'Online Scraper plans', extension: 'Extension plans', api: 'API plans' }

  var quotaNumber = function (quota) {
    return parseInt(quota.replace(/,/g, ''), 10)
  }
  var priceNumber = function (price) {
    return Number(price.replace('$', ''))
  }
  var shortNumber = function (n) {
    if (n >= 1000) return (n / 1000).toString().replace(/\.0$/, '') + 'k'
    return String(n)
  }

  /* =====================================================================
     用量估算条：对数刻度（下限 = Free 额度的一半，上限 = 最高档额度）
     ===================================================================== */
  var scaleFor = function (tab) {
    var quotas = tab.cards.map(function (c) {
      return quotaNumber(c.quota)
    })
    var lo = Math.log10(quotas[0] / 2)
    var hi = Math.log10(quotas[quotas.length - 1])
    return {
      quotas: quotas,
      toPos: function (v) {
        return (Math.log10(v) - lo) / (hi - lo)
      },
      toVal: function (p) {
        return Math.pow(10, lo + p * (hi - lo))
      }
    }
  }

  // 两位有效数字取整：63,412 → 63,000；731 → 730
  var nice = function (v) {
    var mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(v)) - 1))
    return Math.max(1, Math.round(v / mag) * mag)
  }

  /* =====================================================================
     渲染
     ===================================================================== */
  var cardHtml = function (key, card, i) {
    var tab = PRICING.tabs[key]
    var price = priceNumber(card.price)
    var cta = !card.productId
      ? '<a class="btn btn-secondary btn-block" href="' + tab.freeHref + '">' + esc(card.ctaLabel) + '</a>'
      : '<button class="btn ' + (card.featured ? 'btn-primary' : 'btn-secondary') + ' btn-block" type="button" data-signin data-plan-buy="' + card.productId + '">' +
        esc(card.ctaLabel) + '</button>'
    return (
      '<article class="price-card plan-card' + (card.featured ? ' is-featured' : '') + '" data-plan-card="' + card.id + '" style="--i:' + i + '">' +
      (card.featured ? '<span class="badge badge--solid price-flag">' + PRICING.popularLabel + '</span>' : '') +
      '<span class="plan-match" aria-hidden="true">' + icon('check') + 'Fits</span>' +
      '<div><h3 class="price-name">' + esc(card.name) + '</h3><p class="price-tagline">' + esc(card.tagline) + '</p></div>' +
      '<div class="plan-price"><span class="plan-cur">$</span><b data-price="' + price + '">' + price + '</b>' +
      '<span class="price-period">' + esc(card.periodLabel) + '</span></div>' +
      '<div class="price-quota">' + icon(tab.unit === 'requests' ? 'zap' : 'database') + esc(card.quota) + '</div>' +
      cta +
      '<ul class="check-list check-list--sm">' +
      card.features
        .map(function (f) {
          return '<li>' + esc(f) + '</li>'
        })
        .join('') +
      '</ul></article>'
    )
  }

  var finderHtml = function (key) {
    var tab = PRICING.tabs[key]
    var scale = scaleFor(tab)
    var lastX = -1
    var low = false
    var ticks = tab.cards
      .map(function (card, i) {
        var x = scale.toPos(scale.quotas[i])
        // 与前一个刻度距离过近（< 12%）时标签错到第二行，避免重叠
        low = x - lastX < 0.12 && !low
        lastX = x
        return (
          '<span class="finder-tick' + (low ? ' is-low' : '') + '" data-tick="' + i + '" style="--x:' + x.toFixed(4) + '">' +
          '<i></i><span class="tick-label"><b>' + esc(card.name) + '</b><small>' + shortNumber(scale.quotas[i]) + '</small></span></span>'
        )
      })
      .join('')
    return (
      '<div class="finder' + (/is-low/.test(ticks) ? ' has-low' : '') + '" data-finder>' +
      '<div class="finder-top">' +
      '<label class="finder-label" for="finder-' + key + '">How many ' + tab.unit + ' do you need a month?</label>' +
      '<output class="finder-out" for="finder-' + key + '"><b data-finder-value></b> ' + tab.unit + ' →' +
      '<span class="finder-plan">' + icon('check') + '<span data-finder-plan></span></span></output>' +
      '</div>' +
      '<div class="finder-track">' +
      '<span class="finder-rail"></span><span class="finder-fill"></span>' + ticks +
      '<input class="finder-range" id="finder-' + key + '" type="range" min="0" max="1000" step="1" value="0" />' +
      '</div></div>'
    )
  }

  var panelHtml = function (key) {
    var tab = PRICING.tabs[key]
    return (
      '<header class="plan-head">' +
      '<span class="kicker">' + esc(tab.eyebrow) + '</span>' +
      '<h2 class="h3 plan-title">' + esc(tab.title) + '</h2>' +
      '<p class="plan-desc">' + esc(tab.description) + '</p>' +
      '<div class="plan-billing">' +
      tab.billing
        .map(function (b) {
          return '<span class="chip">' + icon(b[0]) + esc(b[1]) + '</span>'
        })
        .join('') +
      '</div></header>' +
      finderHtml(key) +
      '<div class="plan-grid plan-grid--' + tab.cards.length + '" data-plan-grid>' +
      tab.cards
        .map(function (card, i) {
          return cardHtml(key, card, i)
        })
        .join('') +
      '</div>' +
      '<p class="plan-note">' + icon('info') + '<span>' + esc(tab.quotaNote) + '</span></p>'
    )
  }

  var cellHtml = function (v) {
    if (v === 1) return '<span class="cmp-yes">' + icon('check') + '<span class="sr-only">Included</span></span>'
    if (v === 0) return '<span class="cmp-no">—<span class="sr-only">Not included</span></span>'
    return '<span class="cmp-text">' + esc(v) + '</span>'
  }

  var compareHtml = function (key) {
    var tab = PRICING.tabs[key]
    var featured = tab.cards.findIndex(function (c) {
      return c.featured
    })
    var tdClass = function (i) {
      return i === featured ? ' class="is-featured"' : ''
    }
    var head =
      '<thead><tr><th scope="col" class="cmp-feature">Plan</th>' +
      tab.cards
        .map(function (c, i) {
          return (
            '<th scope="col" class="cmp-plan' + (i === featured ? ' is-featured' : '') + '">' +
            (i === featured ? '<span class="badge badge--solid">' + PRICING.popularLabel + '</span>' : '') +
            '<span class="cmp-name">' + esc(c.name) + '</span>' +
            '<span class="cmp-price">' + esc(c.price) + ' <small>' + esc(c.periodLabel) + '</small></span></th>'
          )
        })
        .join('') +
      '</tr></thead>'
    var row = 0
    var rowHtml = function (label, cells) {
      return '<tr style="--r:' + row++ + '"><th scope="row">' + esc(label) + '</th>' + cells.map(function (c, i) {
        return '<td' + tdClass(i) + '>' + c + '</td>'
      }).join('') + '</tr>'
    }
    var groupHtml = function (label) {
      return '<tr class="cmp-group" style="--r:' + row++ + '"><th scope="colgroup" colspan="' + (tab.cards.length + 1) + '">' + esc(label) + '</th></tr>'
    }
    // 额度与计费行直接取卡面 quota / periodLabel
    var body =
      groupHtml('Volume & billing') +
      rowHtml(tab.unit === 'requests' ? 'Requests per month' : 'Records per month', tab.cards.map(function (c) {
        return '<span class="cmp-mono">' + MG.formatNumber(quotaNumber(c.quota)) + '</span>'
      })) +
      rowHtml('Billing', tab.cards.map(function (c) {
        return '<span class="cmp-text">' + esc(c.periodLabel) + '</span>'
      }))
    COMPARE[key].forEach(function (group) {
      body += groupHtml(group[0])
      group[1].forEach(function (r) {
        body += rowHtml(r[0], r[1].map(cellHtml))
      })
    })
    return head + '<tbody>' + body + '</tbody>'
  }

  /* =====================================================================
     面板行为：价格滚动、估算条
     ===================================================================== */
  var animatePrices = function (panel) {
    panel.querySelectorAll('[data-price]').forEach(function (el, i) {
      var target = Number(el.dataset.price)
      if (reduced || target === 0) {
        el.textContent = target
        return
      }
      el.textContent = '0'
      setTimeout(function () {
        MG.tween(
          900,
          function (t) {
            el.textContent = Math.round(target * t)
          },
          MG.ease.outExpo
        )
      }, 120 + i * 70)
    })
  }

  var setupFinder = function (panel, key) {
    var tab = PRICING.tabs[key]
    var scale = scaleFor(tab)
    var finder = panel.querySelector('[data-finder]')
    var range = finder.querySelector('.finder-range')
    var track = finder.querySelector('.finder-track')
    var valueEl = finder.querySelector('[data-finder-value]')
    var planEl = finder.querySelector('[data-finder-plan]')
    var ticks = finder.querySelectorAll('[data-tick]')
    var cards = panel.querySelectorAll('[data-plan-card]')

    var update = function () {
      var p = Number(range.value) / 1000
      var volume = nice(scale.toVal(p))
      var match = scale.quotas.findIndex(function (q) {
        return q >= volume
      })
      if (match < 0) match = scale.quotas.length - 1
      track.style.setProperty('--p', p)
      valueEl.textContent = MG.formatNumber(volume)
      planEl.textContent = tab.cards[match].name
      range.setAttribute('aria-valuetext', MG.formatNumber(volume) + ' ' + tab.unit + ' a month — ' + tab.cards[match].name + ' plan')
      ticks.forEach(function (t, i) {
        t.classList.toggle('is-reached', scale.toPos(scale.quotas[i]) <= p + 0.0005)
        t.classList.toggle('is-match', i === match)
      })
      cards.forEach(function (c, i) {
        c.classList.toggle('is-match', i === match)
      })
    }

    // 初始值：推荐档的额度
    var featured = tab.cards.findIndex(function (c) {
      return c.featured
    })
    range.value = Math.round(scale.toPos(scale.quotas[featured]) * 1000)
    range.addEventListener('input', update)
    update()
  }

  // 横向滑动模式下，把推荐档滚到中间
  var centerFeatured = function (panel) {
    var grid = panel.querySelector('[data-plan-grid]')
    if (grid.scrollWidth <= grid.clientWidth + 2) return
    var card = grid.querySelector('.is-featured')
    if (!card) return
    grid.scrollLeft = card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2
  }

  /* =====================================================================
     初始化：面板 + tab / hash 同步 + 对比表
     ===================================================================== */
  var tabsEl = document.querySelector('[data-pricing-tabs]')
  var panels = {}
  TAB_KEYS.forEach(function (key) {
    var panel = document.querySelector('[data-plan-panel="' + key + '"]')
    panel.innerHTML = panelHtml(key)
    setupFinder(panel, key)
    panels[key] = panel
  })

  var table = document.querySelector('[data-compare-table]')
  var compareLead = document.querySelector('[data-compare-lead]')
  var compareSeg = document.querySelector('[data-compare-seg]')
  var segThumb = compareSeg.querySelector('.seg-thumb')
  var segButtons = Array.prototype.slice.call(compareSeg.querySelectorAll('[data-key]'))
  var current = null

  var placeSegThumb = function () {
    var btn = segButtons.find(function (b) {
      return b.getAttribute('aria-pressed') === 'true'
    })
    segThumb.style.width = btn.offsetWidth + 'px'
    segThumb.style.transform = 'translateX(' + btn.offsetLeft + 'px)'
  }

  var renderCompare = function (key, animate) {
    table.innerHTML = compareHtml(key)
    var tab = PRICING.tabs[key]
    compareLead.textContent = TAB_LABEL[key] + ' — ' + tab.title.charAt(0).toLowerCase() + tab.title.slice(1) + '.'
    segButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.key === key))
    })
    placeSegThumb()
    if (animate && !reduced) {
      table.classList.remove('is-swapping')
      void table.offsetWidth
      table.classList.add('is-swapping')
    }
  }

  var show = function (key, fromUser) {
    if (key === current) return
    var first = current === null
    current = key
    animatePrices(panels[key])
    requestAnimationFrame(function () {
      centerFeatured(panels[key])
    })
    renderCompare(key, !first)
    if (fromUser) history.replaceState(null, '', '#' + key)
  }

  var fromHash = function () {
    return TAB_KEYS.indexOf(location.hash.slice(1))
  }

  var ready = false
  tabsEl.addEventListener('tabchange', function (e) {
    show(e.detail.key, ready)
  })
  var initial = fromHash()
  if (initial > 0) tabsEl.selectTab(initial)
  else show(TAB_KEYS[Math.max(0, initial)], false)
  ready = true

  window.addEventListener('hashchange', function () {
    var i = fromHash()
    if (i >= 0) tabsEl.selectTab(i)
  })

  segButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      tabsEl.selectTab(TAB_KEYS.indexOf(b.dataset.key))
    })
  })
  if (document.fonts) document.fonts.ready.then(placeSegThumb)
  window.addEventListener('resize', placeSegThumb)

  /* =====================================================================
     ④ 用量口径动画（离屏暂停；减弱动效下为静态终态）
     ===================================================================== */
  // 进入视口时放行的闸门
  var gate = function (el) {
    var visible = false
    var waiting = []
    MG.inView(el, function (v) {
      visible = v
      if (v) waiting.splice(0).forEach(function (fn) {
        fn()
      })
    }, { once: false, threshold: 0.25 })
    return function () {
      return visible
        ? Promise.resolve()
        : new Promise(function (resolve) {
            waiting.push(resolve)
          })
    }
  }

  var bump = function (el, text) {
    el.textContent = text
    el.classList.remove('is-bump')
    void el.offsetWidth
    el.classList.add('is-bump')
  }

  // records：每来一行商家 +1；评论 / 照片 / 补全挂在行上，+0
  var recEl = document.querySelector('[data-usage-records]')
  if (recEl) {
    var BIZ = [
      ['Ember & Oak Coffee', '+1 503-555-0142', '4.7'],
      ['Rose City Roasters', '+1 503-555-0117', '4.6'],
      ['Hawthorne Bean Co.', '+1 503-555-0163', '4.8'],
      ['Willamette Brew Bar', '+1 503-555-0128', '4.5'],
      ['Fernwood Coffee Lab', '+1 503-555-0186', '4.9'],
      ['Alberta Street Café', '+1 503-555-0151', '4.7']
    ]
    var ATTACH = [
      ['review', '11 review columns'],
      ['image', 'Photo URLs'],
      ['mail', 'Email & socials']
    ]
    var recList = recEl.querySelector('[data-ur-list]')
    var recValue = recEl.querySelector('[data-meter-value]')
    var recBar = recEl.querySelector('[data-meter-bar]')
    var recUsed = 1284
    var REC_LIMIT = 20000

    var recRow = function (b) {
      var row = document.createElement('div')
      row.className = 'ur-row'
      row.innerHTML =
        '<span class="ur-pin"></span><div class="ur-main"><b></b><small></small></div>' +
        '<span class="ur-count">+1 record</span><div class="ur-attach"></div>'
      row.querySelector('b').textContent = b[0]
      row.querySelector('small').textContent = b[1] + ' · ★ ' + b[2]
      return row
    }
    var attachChip = function (a) {
      var chip = document.createElement('span')
      chip.className = 'ur-chip'
      chip.innerHTML = icon(a[0]) + '<span></span><em>+0</em>'
      chip.querySelector('span').textContent = a[1]
      return chip
    }
    var setRec = function (animate) {
      if (animate) bump(recValue, MG.formatNumber(recUsed))
      else recValue.textContent = MG.formatNumber(recUsed)
      recBar.style.setProperty('--p', ((recUsed / REC_LIMIT) * 100).toFixed(2) + '%')
    }

    // 预置两行（含附带数据），动画从顶部继续插入
    BIZ.slice(4, 6).forEach(function (b) {
      var row = recRow(b)
      ATTACH.forEach(function (a) {
        row.querySelector('.ur-attach').appendChild(attachChip(a))
      })
      recList.appendChild(row)
    })
    if (!reduced) {
      var recReady = gate(recEl)
      ;(async function () {
        for (var i = 0; ; i++) {
          await recReady()
          var row = recRow(BIZ[i % BIZ.length])
          recList.insertBefore(row, recList.firstChild)
          recUsed++
          setRec(true)
          // 旧行淡出，最多保留 3 行
          var rows = recList.querySelectorAll('.ur-row')
          if (rows.length > 3) {
            var old = rows[rows.length - 1]
            old.classList.add('is-leaving')
            setTimeout(old.remove.bind(old), 400)
          }
          await MG.wait(650)
          for (var j = 0; j < ATTACH.length; j++) {
            row.querySelector('.ur-attach').appendChild(attachChip(ATTACH[j]))
            await MG.wait(300)
          }
          await MG.wait(1500)
        }
      })()
    }
  }

  // requests：成功调用 +1，失败调用不计
  var reqEl = document.querySelector('[data-usage-requests]')
  if (reqEl) {
    var CALLS = [
      ['/v1/search?q=coffee+shop&location=Portland', 200],
      ['/v1/reviews?fid=0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab', 200],
      ['/v1/search?q=dentist&location=Austin', 401],
      ['/v1/search?q=plumber&location=Chicago', 200],
      ['/v1/reviews?fid=0x8085809c23193567:0xa64e70a2e1a9c0e5', 200]
    ]
    var reqList = reqEl.querySelector('[data-ul-list]')
    var reqValue = reqEl.querySelector('[data-meter-value]')
    var reqBar = reqEl.querySelector('[data-meter-bar]')
    var reqUsed = 412
    var REQ_LIMIT = 1000

    var callLine = function (c) {
      var ok = c[1] === 200
      var line = document.createElement('div')
      line.className = 'ul-line' + (ok ? '' : ' is-bad')
      line.innerHTML =
        '<span class="ul-verb">GET</span><span class="ul-path"></span>' +
        '<span class="ul-status' + (ok ? '' : ' is-bad') + '">' + c[1] + '</span>' +
        '<span class="ul-delta">' + (ok ? '+1' : '+0') + '</span>'
      line.querySelector('.ul-path').textContent = c[0]
      line.title = ok ? 'Successful call — counted' : 'Failed call — not counted'
      return line
    }
    var setReq = function () {
      bump(reqValue, MG.formatNumber(reqUsed))
      reqBar.style.setProperty('--p', ((reqUsed / REQ_LIMIT) * 100).toFixed(2) + '%')
    }

    // 预置三行日志
    CALLS.slice(2, 5).forEach(function (c) {
      reqList.appendChild(callLine(c))
    })
    if (!reduced) {
      var reqReady = gate(reqEl)
      ;(async function () {
        for (var i = 0; ; i++) {
          await reqReady()
          var c = CALLS[i % CALLS.length]
          reqList.insertBefore(callLine(c), reqList.firstChild)
          if (c[1] === 200) {
            reqUsed++
            setReq()
          }
          var lines = reqList.querySelectorAll('.ul-line')
          if (lines.length > 5) lines[lines.length - 1].remove()
          await MG.wait(1400)
        }
      })()
    }
  }
})()
