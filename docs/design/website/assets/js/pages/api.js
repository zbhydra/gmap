/*
 * API 落地页：
 *   - ?api=search|reviews|photos 三个变体（对应三个真实路由）：替换 [data-v] 文案、能力清单、参考表、FAQ、CTA 与代码台
 *   - 代码台：语言切换、请求打字 → 发送 → 响应逐行流入（跟随到底，结束回顶）、重放
 *   - fid 串联：相位循环（离屏暂停，减弱动效直接终态）
 *   - 端点切换胶囊、字段分组的滑块
 * 端点路径为示意（POST + JSON body + Bearer，以 014 B2 合同为准）；参数：Search q / pages / hl / ll（pages 为抓取页数，
 * 对应 Provider 的 max_depth，不是页码），Reviews fid / sort_by / cursor，
 * Photos fid / page；响应顶层键 places / reviews + next_cursor / photos，字段名取 tech-引擎Provider层 的 DTO。
 * Photos 按 014 仍待实现，差距由主线程写入 README 交 hydra 裁决，原型按现网文案呈现。
 */
;(function () {
  var MG = window.MG
  var icon = window.MGChrome.icon
  var reduced = MG.reducedMotion()
  var requested = new URLSearchParams(location.search).get('api')
  var variant = requested === 'reviews' || requested === 'photos' ? requested : 'search'

  var FID = '0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab'
  var BASE = 'https://api.mapsgrab.com'

  // 三种语言的请求样例。b = 各语言的请求体写法；out = 各语言取结果的末行；pre = 请求前的变量行
  var requestSamples = function (path, b, out, pre) {
    var p = pre || {}
    return {
      curl:
        'curl ' + BASE + path + ' \\\n' +
        '  -H "Authorization: Bearer $MAPSGRAB_API_KEY" \\\n' +
        '  -H "Content-Type: application/json" \\\n' +
        "  -d '" + b.curl + "'",
      python:
        'import os\nimport requests\n\n' +
        'API_KEY = os.environ["MAPSGRAB_API_KEY"]\n' +
        (p.python || '') +
        '\nresp = requests.post(\n' +
        '    "' + BASE + path + '",\n' +
        '    headers={"Authorization": f"Bearer {API_KEY}"},\n' +
        '    json=' + b.python + ',\n' +
        ')\n' +
        out.python,
      node:
        (p.node || '') +
        'const res = await fetch("' + BASE + path + '", {\n' +
        '  method: "POST",\n' +
        '  headers: {\n' +
        '    Authorization: `Bearer ${process.env.MAPSGRAB_API_KEY}`,\n' +
        '    "Content-Type": "application/json",\n' +
        '  },\n' +
        '  body: JSON.stringify(' + b.node + '),\n' +
        '});\n' +
        out.node
    }
  }

  var COMMON_FAQ = {
    legal: [
      'Is the data legal to collect?',
      'The API only returns information that is publicly displayed on Google Maps — the same details any visitor can read. We do not access private accounts, gated content, or non-public data.'
    ],
    counted: [
      'How are requests counted?',
      'A request is one successful API call that returns data. Usage resets on the 1st of each month and unused requests do not roll over.'
    ]
  }

  /* =====================================================================
     变体数据（文案以 website/src/i18n/lang/en-US.ts 为底，按 014 合同修正）
     ===================================================================== */
  var VARIANTS = {
    search: {
      seoTitle: 'Google Maps Scraper API — Business Data in JSON | MapsGrab',
      seoDesc:
        'The MapsGrab Scraper API returns Google Maps business data as clean JSON: names, phones, ratings, hours, coordinates, Place IDs, emails, and social profiles — powered by the same engine as the extension.',
      title: 'Google Maps <span class="accent text-grad">Scraper</span> API',
      lead:
        'Query Google Maps business data over a simple HTTP API and get clean JSON back: name, address, phone, website, rating, opening hours, coordinates, Place ID, plus email and social enrichment.',
      chips: [['Per place', '36 data fields'], ['Per page', 'Up to 20 places']],
      capsTitle: 'What the <span class="accent">Scraper API</span> returns',
      capsLead:
        'One request per keyword and location, answered with the same structured fields the extension exports — built for your own applications.',
      caps: [
        ['search', 'Search by keyword and location', 'Send a keyword with an optional location bias and receive the businesses a Google Maps search would show.'],
        ['table', 'The 36-column business schema', 'Name, categories, full address, phone, website, rating and review count, opening hours, latitude / longitude, Place ID, CID, and more.'],
        ['mail', 'Email and social enrichment', 'Responses include email addresses and social profiles found on each business website — no separate enrichment step.'],
        ['braces', 'Clean JSON responses', 'Structured, predictable field names ready for your CRM, spreadsheet pipeline, or backend — no HTML to parse.'],
        ['shield', 'Public data only', 'The API returns only what is publicly displayed on Google Maps — the same details any visitor can read.'],
        ['zap', 'Same engine as the extension', 'The API is backed by the MapsGrab extraction engine, tuned against the current Google Maps interface and updated remotely when Google changes.']
      ],
      path: '/v1/search',
      shape: '{ places: place[] }',
      params: [
        ['q', 'string', 'What to search for — a business type plus a place, e.g. <code>coffee shop in Portland</code>.', true],
        ['pages', 'integer', 'Result pages to collect, 1–10. Each page adds up to 20 places, returned together in one response; collection stops early when a page has no new places. Default <code>1</code>.'],
        ['hl', 'string', 'Language for names, categories and addresses, e.g. <code>en</code>.'],
        ['ll', 'string', 'Optional location bias as <code>@lat,lng,zoom</code>. Tells Maps where to search — results aren’t clipped to a radius.']
      ],
      // 29 个核心字段 + email + social_medias（6 个网络）= 36 列
      groups: [
        ['Identity', [
          ['name', 'string', '"Ember & Oak Coffee"'],
          ['categories', 'string[]', '["Coffee shop", "Espresso bar"]'],
          ['place_id', 'string', '"ChIJ8Qv2kSIKlVQRq-DRw_KltL4"'],
          ['cid', 'string', '"13741790825100206251"'],
          ['fid', 'string', '"' + FID + '"'],
          ['kgmid', 'string', '"/g/11c5x9_qk_"'],
          ['google_maps_url', 'string', '"https://maps.google.com/?cid=13741790825100206251"'],
          ['google_knowledge_url', 'string', '"https://www.google.com/search?kgmid=/g/11c5x9_qk_"'],
          ['search_keyword', 'string', '"coffee shop in Portland"']
        ]],
        ['Contact', [
          ['phone', 'string', '"+1 503-555-0142"'],
          ['phones', 'string[]', '["+1 503-555-0142", "+1 503-555-0199"]'],
          ['website', 'string', '"https://emberandoak.coffee"'],
          ['domain', 'string', '"emberandoak.coffee"'],
          ['email', 'string', '"hello@emberandoak.coffee"'],
          ['social_medias', 'object', '{ "instagram": "instagram.com/emberandoak", … }']
        ]],
        ['Location', [
          ['full_address', 'string', '"3021 SE Division St, Portland, OR 97202"'],
          ['street', 'string', '"3021 SE Division St"'],
          ['municipality', 'string', '"Portland"'],
          ['latitude', 'number', '45.504912'],
          ['longitude', 'number', '-122.635377'],
          ['time_zone', 'string', '"America/Los_Angeles"']
        ]],
        ['Ratings', [
          ['average_rating', 'number', '4.7'],
          ['review_count', 'integer', '1284'],
          ['review_url', 'string', '"https://search.google.com/local/reviews?placeid=ChIJ…"']
        ]],
        ['Profile', [
          ['about', 'string', '"Dine-in · Takeout · Free Wi-Fi"'],
          ['opening_hours', 'object[]', '[{ "name": "Monday", "values": ["7 AM–6 PM"] }, …]'],
          ['claimed', 'boolean', 'true'],
          ['owner', 'string', '"Ember & Oak Coffee (Owner)"'],
          ['owner_id', 'string', '"104287731665220398123"'],
          ['owner_link', 'string', '"https://www.google.com/maps/contrib/1042877316…"'],
          ['featured_image', 'string', '"https://lh5.googleusercontent.com/p/AF1Qip…"']
        ]]
      ],
      faqTitle: 'Scraper API <span class="accent">questions</span>',
      faq: [
        ['What does the Scraper API return?', 'Structured JSON with the MapsGrab 36-column business schema: name, address, phone, website, rating, review count, opening hours, coordinates, Place ID, and email / social enrichment where available.'],
        ['How do I authenticate?', 'Requests are authorized with a MapsGrab API key sent as a bearer token. Keys are issued per account and follow the API plans on the Pricing page, including 20 free requests per month.'],
        COMMON_FAQ.legal,
        ['Can I also get reviews and photos?', 'Yes — pass the fid from any Scraper API result to the Reviews API or the Photos API, using the same API key.'],
        COMMON_FAQ.counted
      ],
      ctaTitle: 'Put Maps data in your <span class="accent text-grad is-animated">application</span>',
      ctaLead: 'One HTTP request per search, structured JSON in the response — the same extraction quality the extension delivers.',
      code: {
        req: requestSamples(
          '/v1/search',
          {
            curl: '{"q": "coffee shop in Portland", "hl": "en"}',
            python: '{"q": "coffee shop in Portland", "hl": "en"}',
            // Node 单行会超出代码台宽度，拆成三行
            node: '{\n    q: "coffee shop in Portland", hl: "en",\n  }'
          },
          { python: 'places = resp.json()["places"]', node: 'const { places } = await res.json();' }
        ),
        status: 'Response · 200 OK · application/json',
        res: [
          '{',
          '  "places": [',
          '    {',
          '      "name": "Ember & Oak Coffee",',
          '      "categories": ["Coffee shop", "Espresso bar"],',
          '      "full_address": "3021 SE Division St, Portland, OR 97202",',
          '      "phone": "+1 503-555-0142",',
          '      "website": "https://emberandoak.coffee",',
          '      "email": "hello@emberandoak.coffee",',
          '      "social_medias": { "instagram": "instagram.com/emberandoak" },',
          '      "average_rating": 4.7,',
          '      "review_count": 1284,',
          '      "latitude": 45.504912,',
          '      "longitude": -122.635377,',
          '      "place_id": "ChIJ8Qv2kSIKlVQRq-DRw_KltL4",',
          '      "fid": "' + FID + '"',
          '    },',
          '    …',
          '  ]',
          '}'
        ].join('\n')
      }
    },

    reviews: {
      seoTitle: 'Google Maps Reviews Scraper API — Reviews in JSON | MapsGrab',
      seoDesc:
        'The MapsGrab Reviews API returns the reviews of any Google Maps business as clean JSON: reviewer names, ratings, review text, dates, photos, and owner replies.',
      title: 'Google Maps <span class="accent text-grad">Reviews</span> Scraper API',
      lead:
        'Request the reviews of any Google Maps business and get structured JSON back: author, rating, review text, date, review photos, and owner replies — page by page with a cursor.',
      chips: [['Per page', 'Up to 60 reviews'], ['Sort by', 'Relevance · newest · rating']],
      capsTitle: 'What the <span class="accent">Reviews API</span> returns',
      capsLead: 'Every public review for a business — ratings, text, photos and owner replies, delivered over HTTP as JSON.',
      caps: [
        ['review', 'Reviews by business', 'Address the API with a business fid and page through its reviews with a cursor — sorted by relevance, newest, highest or lowest rating.'],
        ['list', 'Full review fields', 'Author, rating, review text with its translation and language, and the publish date for every entry.'],
        ['image', 'Review photos', 'Photo URLs attached to reviews come back in the response, ready for download or analysis.'],
        ['user', 'Owner replies', 'Business owner replies are included with their dates, so your monitoring sees the full conversation.'],
        ['braces', 'Clean JSON responses', 'Structured field names ready for review monitoring, local SEO research, or reputation reporting workflows.'],
        ['shield', 'Public data only', 'The API returns only reviews that are publicly displayed on Google Maps — the same content any visitor can read.']
      ],
      path: '/v1/reviews',
      shape: '{ reviews: review[], next_cursor }',
      params: [
        ['fid', 'string', 'Business feature ID, e.g. <code>0x5495…:0xbeb4…</code>. Every Scraper API result includes it.', true],
        ['sort_by', 'integer', '<code>1</code> most relevant · <code>2</code> newest · <code>3</code> highest rating · <code>4</code> lowest rating. Default <code>1</code>.'],
        ['cursor', 'string', 'The <code>next_cursor</code> from the previous page. Omit it for the first page.']
      ],
      groups: [
        ['Review', [
          ['review_id', 'string', '"ChdDSUhNMG9nS0VJQ0FnSUR3…"'],
          ['rating', 'integer', '5'],
          ['text', 'string', '"Best cortado on Division. Friendly crew."'],
          ['translated_text', 'string', 'null'],
          ['language', 'string', '"en"'],
          ['published_at_ms', 'integer', '1790553600000'],
          ['relative_date', 'string', '"2 weeks ago"'],
          ['images', 'string[]', '["https://lh5.googleusercontent.com/p/AF1QipN…"]'],
          ['origin', 'string', '"Google"']
        ]],
        ['Author', [
          ['author_name', 'string', '"Maya R."'],
          ['author_url', 'string', '"https://www.google.com/maps/contrib/1123…"'],
          ['author_review_count', 'integer', '38'],
          ['author_is_local_guide', 'boolean', 'true']
        ]],
        ['Owner reply', [
          ['owner_response', 'string', '"Thanks Maya — see you soon!"'],
          ['owner_response_at_ms', 'integer', '1790640000000']
        ]],
        ['Page', [
          ['reviews', 'review[]', '[{ … }, …]'],
          ['next_cursor', 'string', '"CAESBkVnSUlDZw…"']
        ]]
      ],
      faqTitle: 'Reviews API <span class="accent">questions</span>',
      faq: [
        ['How do I address a specific business?', 'Each request takes the business fid — returned with every Scraper API result and readable with the free Place ID Finder — so you can chain the two endpoints.'],
        ['What fields does a review include?', 'Review ID, author name and profile link, Local Guide status, rating, review text with its translation and language, publish date, review photos, and the owner reply with its date.'],
        ['How many reviews can I collect?', 'Each request returns one page of up to 60 reviews plus a next_cursor. Pass it back to read the next page — every successful request counts toward your monthly API quota.'],
        COMMON_FAQ.legal,
        COMMON_FAQ.counted
      ],
      ctaTitle: 'Monitor reviews <span class="accent text-grad is-animated">at scale</span>',
      ctaLead: 'Cursor-paged review threads in clean JSON — built for monitoring, research, and reporting.',
      code: {
        req: requestSamples(
          '/v1/reviews',
          {
            curl: '{"fid": "' + FID + '", "sort_by": 2}',
            python: '{"fid": FID, "sort_by": 2}',
            node: '{ fid, sort_by: 2 }'
          },
          { python: 'reviews = resp.json()["reviews"]', node: 'const { reviews, next_cursor } = await res.json();' },
          { python: 'FID = "' + FID + '"\n', node: 'const fid = "' + FID + '";\n' }
        ),
        status: 'Response · 200 OK · application/json',
        res: [
          '{',
          '  "reviews": [',
          '    {',
          '      "review_id": "ChdDSUhNMG9nS0VJQ0FnSUR3…",',
          '      "author_name": "Maya R.",',
          '      "author_is_local_guide": true,',
          '      "rating": 5,',
          '      "text": "Best cortado on Division. Friendly crew.",',
          '      "language": "en",',
          '      "published_at_ms": 1790553600000,',
          '      "relative_date": "2 weeks ago",',
          '      "images": ["https://lh5.googleusercontent.com/p/AF1QipN…"],',
          '      "owner_response": "Thanks Maya — see you soon!",',
          '      "owner_response_at_ms": 1790640000000',
          '    },',
          '    …',
          '  ],',
          '  "next_cursor": "CAESBkVnSUlDZw…"',
          '}'
        ].join('\n')
      }
    },

    photos: {
      seoTitle: 'Google Maps Photos API — Business Photos as URLs | MapsGrab',
      seoDesc:
        'The MapsGrab Photos API returns the public photo galleries of Google Maps businesses as ready-to-use URL lists, with Street View imagery filtered out.',
      title: 'Google Maps <span class="accent text-grad">Photos</span> API',
      lead:
        'Request the photo gallery of any Google Maps business and get a clean list of image URLs back — public album photos only, with Street View imagery filtered out.',
      chips: [['Returns', 'Image URL lists'], ['Filtered', 'No Street View']],
      capsTitle: 'What the <span class="accent">Photos API</span> returns',
      capsLead: 'The same photo dataset the extension collects, delivered over HTTP as ready-to-use URL lists.',
      caps: [
        ['image', 'Photos by business', 'Address the API with a Google Maps business identifier and receive its public album photo URLs.'],
        ['link', 'Ready-to-use URL lists', 'Responses are plain image URL lists — feed them straight into downloaders, audits, or enrichment pipelines.'],
        ['filter', 'Street View filtered out', 'Street View imagery is excluded automatically, so you only get photos of the business itself.'],
        ['layers', 'Pairs with the other APIs', 'Combine with the Scraper API and Reviews API using the same API key to get the full picture per business.'],
        ['braces', 'Clean JSON responses', 'Structured field names, no HTML to parse — the same export quality the extension delivers.'],
        ['shield', 'Public data only', 'The API returns only photos that are publicly displayed on Google Maps — the same images any visitor can see.']
      ],
      path: '/v1/photos',
      shape: '{ photos: [{ url }] }',
      params: [
        ['fid', 'string', 'Business feature ID, e.g. <code>0x5495…:0xbeb4…</code>. Every Scraper API result includes it.', true],
        ['page', 'integer', 'Results page for large galleries. Default <code>1</code>.']
      ],
      groups: [
        ['Photos', [
          ['photos', 'object[]', '[{ "url": "…" }, …]'],
          ['photos[].url', 'string', '"https://lh3.googleusercontent.com/p/AF1QipN…=w1600"']
        ]]
      ],
      faqTitle: 'Photos API <span class="accent">questions</span>',
      faq: [
        ['What exactly do I get back?', 'A list of public photo URLs for the requested Google Maps business — album photos only, with Street View imagery filtered out.'],
        ['How do I address a specific business?', 'Each request takes the business fid — returned with every Scraper API result and readable with the free Place ID Finder.'],
        ['Does it download the images for me?', 'No — the API returns URLs; you download or process the images on your side. That keeps responses fast and keeps you in control of storage.'],
        ['How much does it cost?', 'The Photos API follows the API plans on the Pricing page, including 20 free requests per month. A request is one successful API call that returns data.'],
        COMMON_FAQ.legal
      ],
      ctaTitle: 'Enrich records with <span class="accent text-grad is-animated">real photos</span>',
      ctaLead: 'One request per business, public photo URLs in the response — ready for audits, listings, and enrichment.',
      code: {
        req: requestSamples(
          '/v1/photos',
          { curl: '{"fid": "' + FID + '"}', python: '{"fid": FID}', node: '{ fid }' },
          { python: 'photos = resp.json()["photos"]', node: 'const { photos } = await res.json();' },
          { python: 'FID = "' + FID + '"\n', node: 'const fid = "' + FID + '";\n' }
        ),
        status: 'Response · 200 OK · application/json',
        res: [
          '{',
          '  "photos": [',
          '    { "url": "https://lh3.googleusercontent.com/p/AF1QipN…=w1600" },',
          '    { "url": "https://lh3.googleusercontent.com/p/AF1QipO…=w1600" },',
          '    { "url": "https://lh3.googleusercontent.com/p/AF1QipP…=w1600" },',
          '    …',
          '  ]',
          '}'
        ].join('\n')
      }
    }
  }

  var spec = VARIANTS[variant]

  /* =====================================================================
     工具
     ===================================================================== */
  var $ = function (sel, scope) {
    return (scope || document).querySelector(sel)
  }
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel))
  }

  // 带 data-split 的标题换文案：换成新节点重新拆词并显现（保留错峰延迟）；首屏 static 标题换文案后改走运行时拆词
  var swapSplit = function (el, html) {
    if (!el) return
    var fresh = el.cloneNode(false)
    fresh.dataset.split = ''
    delete fresh.dataset.splitReady
    fresh.classList.remove('is-revealed')
    fresh.innerHTML = html
    el.replaceWith(fresh)
    MG.init(fresh)
  }

  // 分段控件滑块：与 site.js setupTabs 同算法
  var placeThumb = function (seg, btn) {
    var thumb = seg.querySelector('.seg-thumb')
    if (!thumb || !btn) return
    thumb.style.width = btn.offsetWidth + 'px'
    thumb.style.transform = 'translateX(' + btn.offsetLeft + 'px)'
  }
  var keepThumb = function (seg, getActive) {
    var update = function () {
      placeThumb(seg, getActive())
    }
    update()
    if (document.fonts) document.fonts.ready.then(update)
    window.addEventListener('resize', update)
  }

  /* =====================================================================
     ① 变体文案
     ===================================================================== */
  var switcher = $('[data-api-switch]')
  if (switcher) {
    $$('[data-api]', switcher).forEach(function (a) {
      if (a.dataset.api === variant) a.setAttribute('aria-current', 'page')
      else a.removeAttribute('aria-current')
    })
    keepThumb(switcher, function () {
      return $('[aria-current="page"]', switcher)
    })
  }

  $$('.api-ep[data-ep]').forEach(function (card) {
    card.classList.toggle('is-current', card.dataset.ep === variant)
  })

  if (variant !== 'search') {
    document.title = spec.seoTitle
    var meta = $('meta[name="description"]')
    if (meta) meta.setAttribute('content', spec.seoDesc)

    swapSplit($('[data-v="title"]'), spec.title)
    $('[data-v="lead"]').textContent = spec.lead
    $('[data-v="chipA-label"]').textContent = spec.chips[0][0]
    $('[data-v="chipA"]').textContent = spec.chips[0][1]
    $('[data-v="chipB-label"]').textContent = spec.chips[1][0]
    $('[data-v="chipB"]').textContent = spec.chips[1][1]

    swapSplit($('[data-v="capsTitle"]'), spec.capsTitle)
    $('[data-v="capsLead"]').textContent = spec.capsLead
    $$('[data-caps] .feature').forEach(function (card, i) {
      var cap = spec.caps[i]
      $('.icon-tile', card).innerHTML = icon(cap[0])
      $('h3', card).textContent = cap[1]
      $('p', card).textContent = cap[2]
    })

    swapSplit($('[data-v="faqTitle"]'), spec.faqTitle)
    $$('[data-faq] details').forEach(function (d, i) {
      $('[data-q]', d).textContent = spec.faq[i][0]
      $('[data-a]', d).textContent = spec.faq[i][1]
    })

    swapSplit($('[data-v="ctaTitle"]'), spec.ctaTitle)
    $('[data-v="ctaLead"]').textContent = spec.ctaLead
  }

  /* =====================================================================
     ⑤ 参考：参数表 + 字段分组
     ===================================================================== */
  var esc = function (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  var refEndpoint = $('[data-ref-endpoint]')
  if (refEndpoint) {
    refEndpoint.innerHTML = '<b>POST</b>' + spec.path
    $('[data-ref-shape]').textContent = spec.shape
    $('[data-ref-params]').innerHTML = spec.params
      .map(function (p) {
        return (
          '<tr><td><code>' + p[0] + '</code>' + (p[3] ? '<span class="badge api-req-badge">required</span>' : '') + '</td>' +
          '<td class="cell-mono">' + p[1] + '</td><td>' + p[2] + '</td></tr>'
        )
      })
      .join('')

    var groupsNav = $('[data-ref-groups]')
    var fieldsBody = $('[data-ref-fields]')
    var renderFields = function (index) {
      fieldsBody.innerHTML = spec.groups[index][1]
        .map(function (f, i) {
          return (
            '<tr style="--i:' + i + '"><td><code>' + f[0] + '</code></td><td class="cell-mono">' + f[1] + '</td>' +
            '<td class="cell-mono" title="' + esc(f[2]).replace(/"/g, '&quot;') + '">' + esc(f[2]) + '</td></tr>'
          )
        })
        .join('')
      $$('.seg-btn', groupsNav).forEach(function (b, i) {
        b.setAttribute('aria-pressed', String(i === index))
      })
      placeThumb(groupsNav, $$('.seg-btn', groupsNav)[index])
    }
    groupsNav.insertAdjacentHTML(
      'beforeend',
      spec.groups
        .map(function (g, i) {
          return '<button class="seg-btn" type="button" aria-pressed="false" data-group="' + i + '">' + g[0] + ' <small>' + g[1].length + '</small></button>'
        })
        .join('')
    )
    groupsNav.hidden = spec.groups.length < 2
    groupsNav.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-group]')
      if (btn) renderFields(Number(btn.dataset.group))
    })
    renderFields(0)
    keepThumb(groupsNav, function () {
      return $('[aria-pressed="true"]', groupsNav)
    })
  }

  /* =====================================================================
     ① 代码台
     ===================================================================== */
  var consoleEl = $('[data-console]')
  if (consoleEl) {
    var LANGS = ['curl', 'python', 'node']
    var reqEl = $('[data-c-request]', consoleEl)
    var resEl = $('[data-c-response]', consoleEl)
    var bar = $('[data-c-statusbar]', consoleEl)
    var statusEl = $('[data-c-status]', consoleEl)
    var langs = $('[data-c-langs]', consoleEl)
    var code = spec.code
    var langIndex = 0
    var token = 0

    $('[data-c-endpoint]', consoleEl).innerHTML = '<b>POST</b>' + spec.path
    // 动画开始前先给出当前变体的静态请求，避免露出默认变体的无 JS 兜底内容
    reqEl.innerHTML = MG.highlight(code.req.curl)
    statusEl.textContent = 'Ready'

    var settle = function () {
      bar.classList.remove('is-sending')
      bar.classList.add('is-ok')
      statusEl.textContent = code.status
    }

    var run = async function () {
      var id = ++token
      var alive = function () {
        return id === token
      }
      var req = code.req[LANGS[langIndex]]
      $$('[role="tab"]', langs).forEach(function (tab, i) {
        tab.setAttribute('aria-selected', String(i === langIndex))
      })
      bar.classList.remove('is-ok', 'is-sending')
      resEl.innerHTML = ''
      if (reduced) {
        reqEl.innerHTML = MG.highlight(req)
        resEl.innerHTML = MG.highlight(code.res)
        settle()
        return
      }
      statusEl.textContent = 'Composing request…'
      for (var i = 0; i <= req.length; i += 3) {
        if (!alive()) return
        reqEl.innerHTML = MG.highlight(req.slice(0, i)) + '<span class="caret"></span>'
        await MG.wait(9)
      }
      reqEl.innerHTML = MG.highlight(req)
      bar.classList.add('is-sending')
      statusEl.textContent = 'Sending request…'
      await MG.wait(700)
      if (!alive()) return
      settle()
      var lines = code.res.split('\n')
      for (var l = 1; l <= lines.length; l++) {
        if (!alive()) return
        resEl.innerHTML = MG.highlight(lines.slice(0, l).join('\n')) + (l < lines.length ? '<span class="caret"></span>' : '')
        resEl.scrollTop = resEl.scrollHeight
        await MG.wait(46)
      }
      await MG.wait(900)
      if (!alive()) return
      resEl.scrollTo({ top: 0, behavior: 'smooth' })
    }

    langs.addEventListener('click', function (e) {
      var tab = e.target.closest('[role="tab"]')
      if (!tab) return
      langIndex = LANGS.indexOf(tab.dataset.lang)
      run()
    })
    $('[data-c-replay]', consoleEl).addEventListener('click', run)

    // 首屏视觉在加载后 0.5s 立起，等它到位再开始打字
    MG.inView(consoleEl, function () {
      setTimeout(run, reduced ? 0 : 900)
    }, { threshold: 0.25 })
  }

  /* =====================================================================
     ④ fid 串联：Search → Reviews → Photos 相位循环
     ===================================================================== */
  var chain = $('[data-chain]')
  if (chain) {
    var PHASES = ['is-search', 'is-pick', 'is-travel', 'is-fill', 'is-reviews', 'is-travel2', 'is-fill2', 'is-photos']
    if (reduced) {
      PHASES.forEach(function (p) {
        chain.classList.add(p)
      })
    } else {
      var chainVisible = false
      var wake = null
      MG.inView(chain, function (v) {
        chainVisible = v
        if (v && wake) {
          wake()
          wake = null
        }
      }, { once: false, threshold: 0.3 })
      var gate = function () {
        return chainVisible && !document.hidden
          ? Promise.resolve()
          : new Promise(function (resolve) {
              wake = resolve
            })
      }
      var step = async function (cls, ms) {
        await gate()
        chain.classList.add(cls)
        await MG.wait(ms)
      }
      ;(async function loop() {
        for (;;) {
          await step('is-search', 1500)
          await step('is-pick', 700)
          await step('is-travel', 1150)
          await step('is-fill', 650)
          await step('is-reviews', 1500)
          await step('is-travel2', 1150)
          await step('is-fill2', 650)
          await step('is-photos', 3400)
          chain.classList.add('is-reset')
          await MG.wait(520)
          chain.classList.remove.apply(chain.classList, PHASES.concat('is-reset'))
          await MG.wait(700)
        }
      })()
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && chainVisible && wake) {
          wake()
          wake = null
        }
      })
    }
  }
})()
