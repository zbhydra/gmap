/*
 * Home 页叙事动画：
 *   ① 首屏剧场：地图搜索 → pin 落点 → 扫描 → 面板逐行采集 → 导出（循环）；
 *      用户提交搜索后切到「匿名预览」态：3 行结果 + 锁定行 + 登录引导（对应真实首页预览合同）。
 *   ⑤ 36 列字段浏览器（分组筛选 + 检查器 + 空闲自动巡游）
 *   ⑥ Email / 社媒补全轨道
 *   ⑦ 开发者代码台（产品 × 语言切换，请求打字 + 响应逐行流入）
 * 工具网格、CTA pin 雨、代码高亮属于站级行为，见 site.js。
 * 原型数据均为虚构（555-01xx 号段、虚构商户名），落地时预览数据来自真实预览接口。
 */
;(function () {
  var MG = window.MG
  var icon = window.MGChrome.icon
  var reduced = MG.reducedMotion()

  var pad = function (n) {
    return String(n).padStart(2, '0')
  }
  var today = function () {
    var d = new Date()
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
  }
  var slugify = function (s) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  // 由名称派生稳定的伪 Place ID（只用于展示）
  var fakePlaceId = function (name) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
    var h = 2166136261
    var out = 'ChIJ'
    for (var i = 0; i < 23; i++) {
      h ^= name.charCodeAt(i % name.length) + i
      h = Math.imul(h, 16777619) >>> 0
      out += chars[h % chars.length]
    }
    return out
  }

  /* =====================================================================
     数据
     ===================================================================== */
  var DATASETS = [
    {
      keyword: 'coffee shop in Portland',
      category: 'Coffee shop',
      icon: 'coffee',
      area: '503',
      total: 48,
      items: [
        ['Ember & Oak Coffee', 4.7, 1284, 'hello@emberandoak.coffee'],
        ['Rose City Roasters', 4.6, 892, 'orders@rosecityroasters.com'],
        ['Hawthorne Bean Co.', 4.8, 2106, 'hi@hawthornebean.co'],
        ['Willamette Brew Bar', 4.5, 641, ''],
        ['Cascade Espresso House', 4.4, 388, 'team@cascadeespresso.com'],
        ['Pearl District Coffee', 4.6, 1057, 'pearl@pdxcoffee.co'],
        ['Burnside Grind', 4.3, 276, ''],
        ['Alberta Street Café', 4.7, 934, 'hello@albertacafe.com'],
        ['Fernwood Coffee Lab', 4.9, 512, 'lab@fernwood.coffee'],
        ['Sellwood Steam & Co.', 4.5, 703, ''],
        ['Laurelhurst Coffee Club', 4.6, 448, 'club@laurelhurst.coffee'],
        ['Mt Tabor Morning Roast', 4.8, 1322, 'roast@mttabor.coffee'],
        ['Division Drip Bar', 4.4, 219, ''],
        ['Eastbank Espresso', 4.6, 587, 'shots@eastbank.coffee']
      ]
    },
    {
      keyword: 'dentist in Austin, TX',
      category: 'Dentist',
      icon: 'sparkles',
      area: '512',
      total: 62,
      items: [
        ['Lone Star Family Dentistry', 4.9, 1104, 'smile@lonestardental.com'],
        ['Bright Smile Dental Studio', 4.8, 762, 'front@brightsmile.studio'],
        ['Barton Springs Dental', 4.7, 538, ''],
        ['South Congress Smiles', 4.9, 1388, 'hello@socosmiles.com'],
        ['Zilker Park Dental Care', 4.6, 304, 'care@zilkerdental.com'],
        ['Capitol City Orthodontics', 4.8, 916, ''],
        ['Mueller Modern Dentistry', 4.7, 455, 'team@muellerdental.com'],
        ['Hyde Park Dental Group', 4.5, 287, ''],
        ['East Austin Dental Co.', 4.8, 649, 'hi@eastaustindental.co'],
        ['Riverside Gentle Dental', 4.4, 198, ''],
        ['Domain Dental Spa', 4.7, 823, 'spa@domaindental.com'],
        ['Travis Heights Family Dental', 4.9, 372, 'office@travisheights.dental'],
        ['Rainey Street Dental', 4.6, 261, ''],
        ['Clarksville Smile Center', 4.8, 590, 'hello@clarksvillesmile.com']
      ]
    },
    {
      keyword: 'plumber near Chicago',
      category: 'Plumber',
      icon: 'wrench',
      area: '312',
      total: 57,
      items: [
        ['Windy City Plumbing Pros', 4.8, 1532, 'dispatch@windycityplumbing.com'],
        ['Lakeview Pipe & Drain', 4.7, 689, ''],
        ['Wicker Park Plumbing Co.', 4.6, 412, 'service@wickerplumbing.co'],
        ['Lincoln Square Rooter', 4.9, 857, 'help@lsrooter.com'],
        ['Loop Emergency Plumbers', 4.5, 338, ''],
        ['Logan Square Water Heaters', 4.7, 521, 'hot@loganheaters.com'],
        ['Hyde Park Drain Experts', 4.6, 264, ''],
        ['Ravenswood Plumbing & Heat', 4.8, 743, 'office@ravenswoodph.com'],
        ['Pilsen Pipe Works', 4.5, 306, 'crew@pilsenpipe.works'],
        ['Andersonville Plumbing', 4.7, 455, ''],
        ['Bucktown Sewer & Drain', 4.4, 187, 'info@bucktowndrain.com'],
        ['Gold Coast Plumbing Group', 4.8, 902, 'service@goldcoastplumbing.com'],
        ['Bridgeport Pipe Masters', 4.6, 233, ''],
        ['Edgewater Flow Co.', 4.7, 398, 'hello@edgewaterflow.co']
      ]
    }
  ]

  var ADJ = ['Golden', 'Riverside', 'Maple', 'Harbor', 'Summit', 'Union', 'Parkside', 'Northside', 'Old Town', 'Bright', 'Cedar', 'Lakeside', 'Copper', 'Willow']
  var NOUN = ['Co.', 'Studio', 'House', 'Collective', 'Group', 'Lab', 'Room', 'Works', 'Corner', 'Club', 'Place', 'Hub', 'Den', 'Supply']

  // 任意关键词 → 原型数据（“X in Y” / “X near Y”）
  var buildDataset = function (keyword) {
    var known = DATASETS.find(function (d) {
      return d.keyword.toLowerCase() === keyword.toLowerCase()
    })
    if (known) return known
    var m = keyword.match(/^(.*?)\s+(?:in|near|around)\s+(.+)$/i)
    var what = (m ? m[1] : keyword).trim()
    var where = (m ? m[2] : 'your area').replace(/,.*$/, '').trim()
    var cap = function (s) {
      return s.replace(/\b\w/g, function (c) {
        return c.toUpperCase()
      })
    }
    var category = cap(what.replace(/s$/i, '')) || 'Business'
    var city = cap(where)
    var items = []
    for (var i = 0; i < 14; i++) {
      var name =
        i % 3 === 0
          ? city + ' ' + category + ' ' + NOUN[i % NOUN.length]
          : ADJ[(i * 5) % ADJ.length] + ' ' + category + ' ' + NOUN[(i * 3) % NOUN.length]
      var rating = Math.round((4.2 + ((i * 37) % 8) / 10) * 10) / 10
      var reviews = 120 + ((i * 397) % 1400)
      var domain = slugify(name).replace(/-/g, '') + '.com'
      items.push([name, rating, reviews, i % 3 === 1 ? '' : 'hello@' + domain])
    }
    return { keyword: keyword, category: category, icon: 'building', area: '555', total: 18 + (keyword.length % 9), items: items }
  }

  var itemView = function (ds, item, index) {
    return {
      name: item[0],
      rating: item[1].toFixed(1),
      reviews: MG.formatNumber(item[2]),
      email: item[3],
      phone: '+1 ' + ds.area + '-555-01' + pad((index * 7 + 11) % 100),
      placeId: fakePlaceId(item[0])
    }
  }

  /* =====================================================================
     ① 首屏剧场
     ===================================================================== */
  var stage = document.querySelector('[data-hero-stage]')
  if (stage) {
    var $ = function (sel) {
      return stage.querySelector(sel)
    }
    var map = $('[data-stage-map]')
    var pinsLayer = $('[data-map-pins]')
    var scan = $('[data-map-scan]')
    var query = $('[data-map-query]')
    var url = $('[data-stage-url]')
    var panel = $('[data-panel]')
    var stateEl = $('[data-panel-state]')
    var badgeText = $('[data-panel-badge-text]')
    var progress = $('[data-panel-progress]')
    var list = $('[data-panel-list]')
    var lock = $('[data-panel-lock]')
    var lockCount = $('[data-lock-count]')
    var exportBtn = $('[data-panel-export]')
    var exportCount = $('[data-export-count]')
    var toast = $('[data-panel-toast]')
    var toastFile = $('[data-panel-file]')
    var kpi = {
      phone: $('[data-kpi="phone"]'),
      email: $('[data-kpi="email"]'),
      web: $('[data-kpi="web"]')
    }
    var chips = {
      email: stage.querySelector('[data-fc-email]'),
      rating: stage.querySelector('[data-fc-rating]'),
      id: stage.querySelector('[data-fc-id]')
    }

    var PIN_SPOTS = [
      [9, 46], [15, 66], [21, 36], [25, 82], [30, 54], [35, 30], [39, 70],
      [44, 46], [48, 86], [52, 26], [55, 60], [59, 38], [62, 76], [65, 52]
    ]

    var runId = 0
    var visible = false
    var wakeups = []
    MG.inView(
      stage,
      function (v) {
        visible = v
        if (v) {
          wakeups.splice(0).forEach(function (fn) {
            fn()
          })
        }
      },
      { once: false, threshold: 0.15, rootMargin: '0px' }
    )
    var whenVisible = function () {
      return visible
        ? Promise.resolve()
        : new Promise(function (resolve) {
            wakeups.push(resolve)
          })
    }

    var setState = function (mode, html) {
      panel.classList.toggle('is-running', mode === 'running')
      panel.classList.toggle('is-done', mode === 'done')
      panel.classList.toggle('is-preview', mode === 'preview')
      stateEl.innerHTML = html
    }

    var setProgress = function (p) {
      progress.style.setProperty('--p', Math.round(p * 100) + '%')
    }

    var setKpis = function (count) {
      kpi.phone.textContent = Math.round(count * 0.94)
      kpi.email.textContent = Math.round(count * 0.61)
      kpi.web.textContent = Math.round(count * 0.9)
      exportCount.textContent = count
    }

    var updateChip = function (el, text) {
      if (!el) return
      var chip = el.closest('.float-chip')
      chip.classList.add('is-updating')
      setTimeout(function () {
        el.textContent = text
        chip.classList.remove('is-updating')
      }, 220)
    }

    var rowHtml = function (ds, v) {
      return (
        '<span class="mgp-avatar">' + icon(ds.icon) + '</span>' +
        '<div style="min-width:0"><div class="mgp-name"></div><div class="mgp-meta"></div></div>' +
        '<span class="rating">' + icon('star') + v.rating + '</span>'
      )
    }

    var addRow = function (ds, v, opts) {
      var row = document.createElement('div')
      row.className = 'mgp-row' + (opts && opts.locked ? ' is-locked' : ' is-new')
      row.innerHTML = rowHtml(ds, v)
      row.querySelector('.mgp-name').textContent = v.name
      row.querySelector('.mgp-meta').textContent = ds.category + ' · ' + v.phone
      if (opts && opts.append) list.appendChild(row)
      else list.insertBefore(row, list.firstChild)
      while (list.children.length > 9) list.lastChild.remove()
      setTimeout(function () {
        row.classList.remove('is-new')
      }, 900)
      return row
    }

    var addSkeleton = function () {
      var row = document.createElement('div')
      row.className = 'mgp-row is-skeleton'
      row.innerHTML = '<span class="mgp-avatar"></span><div><span class="skel"></span><span class="skel"></span></div><span class="skel" style="width:34px"></span>'
      list.appendChild(row)
      return row
    }

    var reset = function (ds) {
      pinsLayer.classList.remove('is-leaving')
      pinsLayer.innerHTML = ''
      list.innerHTML = ''
      lock.hidden = true
      toast.classList.remove('is-on')
      exportBtn.classList.remove('is-ready', 'is-pressed')
      scan.classList.remove('is-on')
      scan.style.translate = ''
      setProgress(0)
      setKpis(0)
      badgeText.textContent = 'Live'
      setState('idle', '<span class="mgp-start">' + icon('play') + 'Start Extracting</span>')
      query.textContent = ''
      url.textContent = 'google.com/maps/search/' + encodeURIComponent(ds.keyword.toLowerCase()).replace(/%20/g, '+')
    }

    var typeQuery = function (text, alive, speed) {
      query.classList.add('is-typing')
      return new Promise(function (resolve) {
        var i = 0
        var tick = function () {
          if (!alive()) return resolve()
          query.textContent = text.slice(0, ++i)
          if (i < text.length) setTimeout(tick, speed + Math.random() * speed)
          else {
            setTimeout(function () {
              query.classList.remove('is-typing')
              resolve()
            }, 300)
          }
        }
        tick()
      })
    }

    var dropPins = function (count, alive, gap) {
      var pins = []
      return new Promise(function (resolve) {
        var i = 0
        var next = function () {
          if (!alive()) return resolve(pins)
          var spot = PIN_SPOTS[i]
          var pin = document.createElement('i')
          pin.className = 'map-pin'
          pin.style.setProperty('--x', spot[0] + '%')
          pin.style.setProperty('--y', spot[1] + '%')
          pin.innerHTML = '<span class="pin-ring"></span>'
          pinsLayer.appendChild(pin)
          requestAnimationFrame(function () {
            pin.classList.add('is-dropped')
          })
          pins.push(pin)
          i++
          if (i < count) setTimeout(next, gap)
          else setTimeout(function () { resolve(pins) }, 500)
        }
        next()
      })
    }

    // 线性扫描；扫描线右缘经过 pin 时触发 onHit（按 x 排序依次命中）
    var sweep = function (pins, duration, alive, onHit) {
      var width = map.clientWidth
      var order = pins
        .map(function (pin) {
          return { pin: pin, x: (parseFloat(pin.style.getPropertyValue('--x')) / 100) * width }
        })
        .sort(function (a, b) {
          return a.x - b.x
        })
      var hit = 0
      scan.classList.add('is-on')
      return new Promise(function (resolve) {
        var start = performance.now()
        var frame = function (now) {
          if (!alive()) return resolve()
          var p = Math.min(1, (now - start) / duration)
          var edge = -10 + p * (width + 20)
          scan.style.translate = edge - 160 + 'px 0'
          while (hit < order.length && order[hit].x <= edge) {
            onHit(order[hit].pin, hit, order.length)
            hit++
          }
          if (p < 1) requestAnimationFrame(frame)
          else {
            scan.classList.remove('is-on')
            resolve()
          }
        }
        requestAnimationFrame(frame)
      })
    }

    var playExtraction = async function (ds, id) {
      var alive = function () {
        return id === runId
      }
      await whenVisible()
      if (!alive()) return
      reset(ds)
      await MG.wait(500)
      await typeQuery(ds.keyword, alive, 45)
      if (!alive()) return
      var pins = await dropPins(PIN_SPOTS.length, alive, 90)
      if (!alive()) return
      // 模拟点击 Start Extracting
      var start = stateEl.querySelector('.mgp-start')
      if (start) start.classList.add('is-pressed')
      await MG.wait(380)
      if (!alive()) return
      setState('running', '<span>Extracting <b data-run-count>0</b>…</span>')
      var countEl = stateEl.querySelector('[data-run-count]')
      await sweep(pins, 6200, alive, function (pin, index, total) {
        pin.classList.add('is-active')
        var v = itemView(ds, ds.items[index % ds.items.length], index)
        addRow(ds, v)
        var count = Math.round((ds.total * (index + 1)) / total)
        countEl.textContent = count
        setProgress((index + 1) / total)
        setKpis(count)
        if (index % 3 === 0 && v.email) updateChip(chips.email, v.email)
        if (index % 3 === 1) updateChip(chips.rating, v.rating + ' · ' + v.reviews + ' reviews')
        if (index % 3 === 2) updateChip(chips.id, v.placeId.slice(0, 16) + '…')
      })
      if (!alive()) return
      setState('done', icon('check-circle') + '<span>Done · ' + ds.total + ' places</span>')
      badgeText.textContent = 'Done'
      exportBtn.classList.add('is-ready')
      await MG.wait(1200)
      if (!alive()) return
      exportBtn.classList.remove('is-ready')
      exportBtn.classList.add('is-pressed')
      await MG.wait(160)
      exportBtn.classList.remove('is-pressed')
      // 与插件 export/csv.ts 的 buildSearchExportFilename 同格式：前缀-条数-关键词（空格转 +）-日期
      toastFile.textContent = 'MapsGrab-Extractor-' + ds.total + '-' + ds.keyword.replace(/ /g, '+') + '-' + today() + '.csv'
      toast.classList.add('is-on')
      await MG.wait(2800)
      if (!alive()) return
      toast.classList.remove('is-on')
      pinsLayer.classList.add('is-leaving')
      await MG.wait(600)
    }

    var loop = async function () {
      var id = ++runId
      var i = 0
      while (id === runId) {
        await playExtraction(DATASETS[i % DATASETS.length], id)
        i++
      }
    }

    // 匿名预览：对应真实首页「单关键词预览 3 行 + 登录后正式任务」合同
    var form = document.querySelector('[data-hero-search]')
    var input = document.querySelector('[data-hero-input]')
    var submit = document.querySelector('[data-hero-submit]')
    var submitLabel = document.querySelector('[data-hero-submit-label]')

    var preview = async function (keyword) {
      var id = ++runId
      var alive = function () {
        return id === runId
      }
      var ds = buildDataset(keyword)
      submit.classList.add('is-loading')
      submitLabel.textContent = 'Searching…'
      submit.insertAdjacentHTML('afterbegin', '<span class="spinner" data-spin></span>')
      var rect = stage.getBoundingClientRect()
      if (rect.top > window.innerHeight * 0.5) {
        stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
      }
      reset(ds)
      badgeText.textContent = 'Preview'
      setState('preview', icon('eye') + '<span>Preview · first results page</span>')
      var typing = typeQuery(ds.keyword, alive, reduced ? 0 : 18)
      var skeletons = [addSkeleton(), addSkeleton(), addSkeleton()]
      await typing
      var pins = await dropPins(PIN_SPOTS.length, alive, reduced ? 0 : 45)
      await MG.wait(reduced ? 0 : 700)
      if (!alive()) return
      skeletons.forEach(function (row) {
        row.remove()
      })
      for (var i = 0; i < 3; i++) {
        var v = itemView(ds, ds.items[i], i)
        addRow(ds, v, { append: true })
        pins[i].classList.add('is-active')
        await MG.wait(reduced ? 0 : 140)
      }
      for (var j = 3; j < 7; j++) addRow(ds, itemView(ds, ds.items[j], j), { append: true, locked: true })
      setProgress(3 / 20)
      setKpis(3)
      lockCount.textContent = (ds.total > 20 ? 20 : ds.total) + ' businesses on the first results page'
      lock.hidden = false
      submit.classList.remove('is-loading')
      var spin = submit.querySelector('[data-spin]')
      if (spin) spin.remove()
      submitLabel.textContent = 'Preview results'
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault()
        var keyword = input.value.trim() || 'coffee shop in Portland'
        preview(keyword)
      })
      document.querySelectorAll('[data-suggest]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          input.value = chip.dataset.suggest
          preview(chip.dataset.suggest)
        })
      })
    }

    if (reduced) {
      // 减弱动效：静态终态画面
      var ds0 = DATASETS[0]
      reset(ds0)
      query.textContent = ds0.keyword
      PIN_SPOTS.forEach(function (spot, i) {
        var pin = document.createElement('i')
        pin.className = 'map-pin is-dropped' + (i < 9 ? ' is-active' : '')
        pin.style.setProperty('--x', spot[0] + '%')
        pin.style.setProperty('--y', spot[1] + '%')
        pinsLayer.appendChild(pin)
      })
      for (var r = 6; r >= 0; r--) addRow(ds0, itemView(ds0, ds0.items[r], r))
      setState('done', icon('check-circle') + '<span>Done · ' + ds0.total + ' places</span>')
      setProgress(1)
      setKpis(ds0.total)
    } else {
      loop()
    }
  }

  /* =====================================================================
     ⑤ 字段浏览器
     ===================================================================== */
  var FIELDS = [
    ['Name', 'profile', 'tag', 'Business name exactly as shown on the listing.', 'Ember & Oak Coffee'],
    ['Description', 'profile', 'list', 'Short description from the business profile.', 'Small-batch roaster and espresso bar'],
    ['Fulladdress', 'location', 'pin', 'Complete, formatted street address.', '3021 SE Division St, Portland, OR 97202'],
    ['Street', 'location', 'route', 'Street line of the address.', '3021 SE Division St'],
    ['Municipality', 'location', 'building', 'City or locality.', 'Portland'],
    ['Categories', 'profile', 'list', 'Every category assigned to the business.', 'Coffee shop, Espresso bar, Cafe'],
    ['About', 'profile', 'info', 'Attributes from the About tab.', 'Dine-in · Takeout · Free Wi-Fi'],
    // 真实导出中 Plus Code 列位已锁、数据源后置，当前恒为空（extension/.../export/columns.ts）
    ['Plus Code', 'location', 'hash', 'Column reserved for the Open Location Code — exported empty for now.', '(empty)'],
    ['Time Zone', 'location', 'clock', 'IANA time zone of the location.', 'America/Los_Angeles'],
    ['Price', 'profile', 'tag', 'Price level shown on the listing.', '$$'],
    ['Note', 'profile', 'review', 'Merchant note or highlight.', 'Known for seasonal pour-overs'],
    ['Amenities', 'profile', 'sparkles', 'Amenities and service options.', 'Outdoor seating, Good for laptops'],
    ['Hotel Class', 'profile', 'star', 'Star class for lodging listings.', '4-star hotel'],
    ['Phone', 'contact', 'phone', 'Primary phone number shown on the listing.', '+1 503-555-0142'],
    ['Phones', 'contact', 'phone', 'Every phone number found for the business.', '+1 503-555-0142, +1 503-555-0199'],
    ['Claimed', 'profile', 'shield', 'Whether the owner has claimed the profile.', 'TRUE'],
    ['Owner', 'profile', 'user', 'Owner name on the profile.', 'Ember & Oak Coffee (Owner)'],
    ['Owner Id', 'profile', 'user', 'Contributor ID of the owner account.', '104287731665220398123'],
    ['Owner Link', 'profile', 'link', 'Link to the owner’s contributor page.', 'google.com/maps/contrib/1042877316…'],
    ['Email', 'contact', 'mail', 'Email addresses found on the business website.', 'hello@emberandoak.coffee'],
    ['Social Medias', 'contact', 'users', 'Social profiles linked from the website.', 'Instagram: instagram.com/emberandoak'],
    ['Review Count', 'reviews', 'review', 'Total number of reviews.', '1284'],
    ['Average Rating', 'reviews', 'star', 'Average star rating.', '4.7'],
    ['Review URL', 'reviews', 'link', 'Direct link to the reviews panel.', 'search.google.com/local/reviews?placeid=ChIJ…'],
    ['Latitude', 'location', 'locate', 'Latitude in decimal degrees.', '45.504912'],
    ['Longitude', 'location', 'locate', 'Longitude in decimal degrees.', '-122.635377'],
    ['Website', 'contact', 'web', 'Official website from the listing.', 'https://emberandoak.coffee'],
    ['Domain', 'contact', 'globe', 'Registrable domain of the website.', 'emberandoak.coffee'],
    ['Opening Hours', 'profile', 'clock', 'Weekly hours, closed days marked.', 'Monday: [07:00-18:00], Tuesday: [07:00-18:00] …'],
    ['Featured Image', 'profile', 'image', 'Cover photo URL of the listing.', 'lh5.googleusercontent.com/p/AF1Qip…'],
    ['Cid', 'ids', 'hash', 'Customer ID — the decimal form of the FID.', '13741790825100206251'],
    ['Fid', 'ids', 'hash', 'Feature ID made of two hexadecimal halves.', '0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab'],
    ['Place Id', 'ids', 'scan', 'Stable Google Place ID.', 'ChIJ8Qv2kSIKlVQRq-DRw_KltL4'],
    ['Kgmid', 'ids', 'hash', 'Knowledge Graph machine ID.', '/g/11c5x9_qk_'],
    ['Google Maps URL', 'ids', 'map', 'Stable short link built from the CID.', 'maps.google.com/?cid=13741790825100206251'],
    ['Google Knowledge URL', 'ids', 'link', 'Knowledge panel search link.', 'google.com/search?kgmid=/g/11c5x9_qk_']
  ]
  var GROUP_LABEL = { contact: 'Contact', location: 'Location', profile: 'Business profile', reviews: 'Ratings & reviews', ids: 'IDs & links' }

  var cloud = document.querySelector('[data-field-cloud]')
  if (cloud) {
    var inspector = document.querySelector('[data-inspector]')
    var filters = document.querySelector('[data-field-filters]')
    var ins = {
      icon: inspector.querySelector('[data-insp-icon]'),
      name: inspector.querySelector('[data-insp-name]'),
      group: inspector.querySelector('[data-insp-group]'),
      index: inspector.querySelector('[data-insp-index]'),
      desc: inspector.querySelector('[data-insp-desc]'),
      sample: inspector.querySelector('[data-insp-sample]')
    }
    cloud.innerHTML = FIELDS.map(function (f, i) {
      return '<button class="field-chip" type="button" data-group="' + f[1] + '" data-field="' + i + '">' + icon(f[2]) + f[0] + '</button>'
    }).join('')
    var chipsEls = Array.prototype.slice.call(cloud.children)
    var current = -1
    var group = 'all'
    var pausedUntil = 0

    var inspect = function (i) {
      if (i === current) return
      current = i
      var f = FIELDS[i]
      chipsEls.forEach(function (c, j) {
        c.classList.toggle('is-active', j === i)
      })
      inspector.classList.remove('is-swapping')
      void inspector.offsetWidth
      inspector.classList.add('is-swapping')
      ins.icon.innerHTML = icon(f[2])
      ins.name.textContent = f[0]
      ins.group.textContent = GROUP_LABEL[f[1]]
      ins.index.textContent = i + 1 + ' / 36'
      ins.desc.textContent = f[3]
      ins.sample.textContent = f[4]
    }

    var visibleIndexes = function () {
      return FIELDS.map(function (f, i) {
        return group === 'all' || f[1] === group ? i : -1
      }).filter(function (i) {
        return i >= 0
      })
    }

    var applyFilter = function (g) {
      group = g
      filters.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-selected', String(b.dataset.filter === g))
      })
      chipsEls.forEach(function (c) {
        c.classList.toggle('is-dim', g !== 'all' && c.dataset.group !== g)
      })
      inspect(visibleIndexes()[0])
    }

    cloud.addEventListener('pointerover', function (e) {
      var chip = e.target.closest('.field-chip')
      if (!chip) return
      pausedUntil = Date.now() + 6000
      inspect(Number(chip.dataset.field))
    })
    cloud.addEventListener('focusin', function (e) {
      var chip = e.target.closest('.field-chip')
      if (!chip) return
      pausedUntil = Date.now() + 6000
      inspect(Number(chip.dataset.field))
    })
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('button')
      if (!btn) return
      pausedUntil = Date.now() + 6000
      applyFilter(btn.dataset.filter)
    })

    inspect(13)
    if (!reduced) {
      var cloudVisible = false
      MG.inView(cloud, function (v) { cloudVisible = v }, { once: false, threshold: 0.3 })
      setInterval(function () {
        if (!cloudVisible || Date.now() < pausedUntil || document.hidden) return
        var idx = visibleIndexes()
        var pos = idx.indexOf(current)
        inspect(idx[(pos + 1) % idx.length])
      }, 2300)
    }
  }

  /* =====================================================================
     ⑥ 补全轨道
     ===================================================================== */
  var orbit = document.querySelector('[data-orbit]')
  if (orbit) {
    var NODES = [
      ['mail', 'var(--accent)', 'hello@emberandoak.coffee'],
      ['instagram', '#e1306c', 'instagram.com/emberandoak'],
      ['facebook', '#1877f2', 'facebook.com/emberandoakcoffee'],
      ['linkedin', '#0a66c2', 'linkedin.com/company/ember-oak'],
      ['x-social', 'var(--text)', 'x.com/emberandoak'],
      ['youtube', '#ff0033', 'youtube.com/@emberandoak'],
      ['tiktok', '#14b8c4', 'tiktok.com/@emberandoak']
    ]
    var spokesEl = orbit.querySelector('[data-orbit-spokes]')
    var nodesEl = orbit.querySelector('[data-orbit-nodes]')
    // 结果列表在中心卡片内，随发现逐行增长（最多保留 4 行）
    var resultsEl = orbit.querySelector('[data-orbit-results]')

    var spokeEls = []
    var nodeEls = []
    NODES.forEach(function (n, i) {
      var angle = -90 + (360 / NODES.length) * i
      var spoke = document.createElement('span')
      spoke.className = 'orbit-spoke'
      spoke.style.setProperty('--a', angle + 'deg')
      spoke.style.setProperty('--node-c', n[1])
      spokesEl.appendChild(spoke)
      var node = document.createElement('span')
      node.className = 'orbit-node'
      node.style.setProperty('--a', angle + 'deg')
      node.style.setProperty('--node-c', n[1])
      node.innerHTML = icon(n[0]) + '<span class="node-check">' + icon('check') + '</span>'
      nodesEl.appendChild(node)
      spokeEls.push(spoke)
      nodeEls.push(node)
    })

    var addResult = function (n) {
      var row = document.createElement('div')
      row.className = 'or-row'
      row.style.setProperty('--node-c', n[1])
      row.innerHTML = icon(n[0]) + '<span></span>' + icon('check', 'icon-check')
      row.querySelector('span').textContent = n[2]
      resultsEl.appendChild(row)
      while (resultsEl.children.length > 4) resultsEl.firstChild.remove()
    }

    var orbitVisible = false
    var orbitWake = null
    MG.inView(orbit, function (v) {
      orbitVisible = v
      if (v && orbitWake) {
        orbitWake()
        orbitWake = null
      }
    }, { once: false, threshold: 0.35 })

    var orbitLoop = async function () {
      for (;;) {
        if (!orbitVisible) {
          await new Promise(function (resolve) {
            orbitWake = resolve
          })
        }
        for (var i = 0; i < NODES.length; i++) {
          spokeEls[i].classList.add('is-active')
          await MG.wait(650)
          nodeEls[i].classList.add('is-found')
          addResult(NODES[i])
          await MG.wait(450)
        }
        await MG.wait(2600)
        spokeEls.forEach(function (s) {
          s.classList.remove('is-active')
        })
        nodeEls.forEach(function (n) {
          n.classList.remove('is-found')
        })
        resultsEl.innerHTML = ''
        await MG.wait(900)
      }
    }

    if (reduced) {
      spokeEls.forEach(function (s) { s.classList.add('is-active') })
      nodeEls.forEach(function (n) { n.classList.add('is-found') })
      NODES.slice(0, 4).forEach(addResult)
    } else {
      orbitLoop()
    }
  }

  /* =====================================================================
     ⑦ 开发者代码台
     ===================================================================== */
  var devList = document.querySelector('[data-dev-list]')
  if (devList) {
    var reqEl = document.querySelector('[data-dev-request]')
    var resEl = document.querySelector('[data-dev-response]')
    var statusEl = document.querySelector('[data-dev-status]')
    var langs = document.querySelector('[data-dev-langs]')
    // 示例请求对齐 014 已确认的参数合同（feat.md、references/B2-API竞品口径.md）：同步 REST，POST + JSON body；
    // Search 接受 q / pages（抓取页数）/ hl（可选 ll），Reviews 以 fid 为键、sort_by 排序、cursor 翻页；
    // 响应字段与 API 页一致（取自 tech-引擎Provider层 DTO）。端点路径为示意写法
    var FID = '0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab'
    var post = function (path, body, pyBody, jsBody, pyOut, jsOut) {
      return [
        'curl https://api.mapsgrab.com/v1/' + path + ' \\\n  -H "Authorization: Bearer $MAPSGRAB_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'' + body + '\'',
        'import os\nimport requests\n\nAPI_KEY = os.environ["MAPSGRAB_API_KEY"]\n\nresp = requests.post(\n    "https://api.mapsgrab.com/v1/' + path + '",\n    headers={"Authorization": f"Bearer {API_KEY}"},\n    json=' + pyBody + ',\n)\n' + pyOut,
        'const res = await fetch("https://api.mapsgrab.com/v1/' + path + '", {\n  method: "POST",\n  headers: {\n    Authorization: `Bearer ${process.env.MAPSGRAB_API_KEY}`,\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify(' + jsBody + '),\n});\n' + jsOut
      ]
    }

    var CODE = {
      search: {
        langs: ['cURL', 'Python', 'Node.js'],
        req: post(
          'search',
          '{"q": "coffee shop in Portland", "hl": "en"}',
          '{"q": "coffee shop in Portland", "hl": "en"}',
          '{ q: "coffee shop in Portland", hl: "en" }',
          'places = resp.json()["places"]',
          'const { places } = await res.json();'
        ),
        status: 'Response · 200 OK · 412 ms',
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
      },
      reviews: {
        langs: ['cURL', 'Python', 'Node.js'],
        req: post(
          'reviews',
          '{"fid": "' + FID + '", "sort_by": 2}',
          '{"fid": "' + FID + '", "sort_by": 2}',
          '{ fid: "' + FID + '", sort_by: 2 }',
          'reviews = resp.json()["reviews"]',
          'const { reviews, next_cursor } = await res.json();'
        ),
        status: 'Response · 200 OK · 538 ms',
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
      },
      photos: {
        langs: ['cURL', 'Python', 'Node.js'],
        req: post(
          'photos',
          '{"fid": "' + FID + '"}',
          '{"fid": "' + FID + '"}',
          '{ fid: "' + FID + '" }',
          'urls = [p["url"] for p in resp.json()["photos"]]',
          'const { photos } = await res.json();'
        ),
        status: 'Response · 200 OK · 296 ms',
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
      },
      mcp: {
        langs: ['Claude Code', 'Cursor', 'VS Code'],
        req: [
          '# Add the MapsGrab MCP server to Claude Code\nclaude mcp add --transport http mapsgrab \\\n  https://mcp.mapsgrab.com/mcp \\\n  --header "Authorization: Bearer $MAPSGRAB_API_KEY"',
          '// .cursor/mcp.json\n{\n  "mcpServers": {\n    "mapsgrab": {\n      "url": "https://mcp.mapsgrab.com/mcp",\n      "headers": { "Authorization": "Bearer YOUR_API_KEY" }\n    }\n  }\n}',
          '// .vscode/mcp.json\n{\n  "servers": {\n    "mapsgrab": {\n      "type": "http",\n      "url": "https://mcp.mapsgrab.com/mcp",\n      "headers": { "Authorization": "Bearer ${input:mapsgrab-key}" }\n    }\n  }\n}'
        ],
        status: 'Tool call · search_businesses · 200 OK',
        res: [
          '// → tools/call search_businesses',
          '{ "q": "dentist in Austin, TX", "hl": "en" }',
          '',
          '// ← result',
          '{',
          '  "places": [',
          '    { "name": "Lone Star Family Dentistry", "average_rating": 4.9, "review_count": 1104 },',
          '    { "name": "South Congress Smiles", "average_rating": 4.9, "review_count": 1388 },',
          '    { "name": "Bright Smile Dental Studio", "average_rating": 4.8, "review_count": 762 },',
          '    …',
          '  ]',
          '}'
        ].join('\n')
      }
    }

    var product = 'search'
    var langIndex = 0
    var token = 0

    var render = async function () {
      var id = ++token
      var alive = function () {
        return id === token
      }
      var spec = CODE[product]
      langs.querySelectorAll('[role="tab"]').forEach(function (tab, i) {
        tab.textContent = spec.langs[i]
        tab.setAttribute('aria-selected', String(i === langIndex))
      })
      var req = spec.req[langIndex]
      resEl.innerHTML = ''
      statusEl.textContent = 'Sending request…'
      if (reduced) {
        reqEl.innerHTML = MG.highlight(req)
        resEl.innerHTML = MG.highlight(spec.res)
        statusEl.textContent = spec.status
        return
      }
      // 请求：按字符块快速打出
      for (var i = 0; i <= req.length; i += 3) {
        if (!alive()) return
        reqEl.innerHTML = MG.highlight(req.slice(0, i)) + '<span class="caret"></span>'
        await MG.wait(8)
      }
      reqEl.innerHTML = MG.highlight(req)
      await MG.wait(420)
      if (!alive()) return
      statusEl.textContent = spec.status
      // 响应：逐行流入
      var lines = spec.res.split('\n')
      for (var l = 1; l <= lines.length; l++) {
        if (!alive()) return
        resEl.innerHTML = MG.highlight(lines.slice(0, l).join('\n')) + (l < lines.length ? '<span class="caret"></span>' : '')
        await MG.wait(55)
      }
    }

    devList.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-dev]')
      if (!btn) return
      product = btn.dataset.dev
      langIndex = 0
      devList.querySelectorAll('[data-dev]').forEach(function (b) {
        b.setAttribute('aria-selected', String(b === btn))
      })
      render()
    })
    langs.addEventListener('click', function (e) {
      var tab = e.target.closest('[role="tab"]')
      if (!tab) return
      langIndex = Array.prototype.indexOf.call(langs.children, tab)
      render()
    })

    MG.inView(devList, function () {
      render()
    }, { threshold: 0.3 })
  }
})()
