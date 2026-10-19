/*
 * dashboard.html（Phase B）数据与调度模拟——只属于原型，不进产品代码。
 * 模型与状态机对齐 extension/src/background/batch：types.ts（任务 / 条目字段）· machine.ts（步进规则）·
 * workUrl.ts（评论 URL 判定）· quota.ts（额度预估）。样例数据全部虚构（店名、坐标、fid、placeid 均为生成值）。
 *
 * window.DBSim
 *   NOW / LIMITS / usage / retry      时钟基准（2026-10-18 11:30）、硬上限、本月用量（Pro 线）、卡死重试次数（设置页全局值）
 *   world({ fill })                   两个工具的样例任务；fill = 补足到 150 个（任务位已满）
 *   snapshot(task, status, opts)      把任务摆到某个状态（idle / running / paused / completed），opts.at = 已处理条数
 *   parse(text)                       去首尾空白、去空行、保序去重 → { values, dupes, empty }
 *   reviewUrlOk(url)                  与 buildReviewWorkUrl 同判定
 *   estimate(type, n, perPlace)       关键词 ×10、评论 × 每店上限
 *   counts(task)                      { done, complete, stuck, invalid, tries, retries, records, open }
 *   engine                            调度：start / pause / remove / on；同时只运行一个任务（mutex）
 *   samples                           表单样例（valid / split / over-quota …）
 */
;(function () {
  var DBSim = (window.DBSim = {})

  /* ============================================================ 基础 */
  DBSim.NOW = new Date(2026, 9, 18, 11, 30)
  DBSim.LIMITS = { maxTasks: 150, maxItems: 500, perKeyword: 10, perPlaceDefault: 300 }
  // 与 Popup 的 Pro 样例同值：本月 100,000 条，已用 41,280，11 月 1 日重置
  DBSim.usage = { total: 100000, used: 41280, reset: 'Nov 1' }
  DBSim.retry = 1

  // 可复现的伪随机（mulberry32）：同一个种子永远生成同一组样例
  var rng = function (seed) {
    var s = seed >>> 0
    return function () {
      s = (s + 0x6d2b79f5) | 0
      var t = Math.imul(s ^ (s >>> 15), 1 | s)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  var seedOf = function (text) {
    var h = 2166136261
    for (var i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
    return h >>> 0
  }
  var between = function (r, a, b) {
    return a + Math.floor(r() * (b - a + 1))
  }
  var hex = function (r, n) {
    var out = ''
    for (var i = 0; i < n; i++) out += '0123456789abcdef'[Math.floor(r() * 16)]
    return out
  }
  var chars = function (r, n) {
    var set = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
    var out = ''
    for (var i = 0; i < n; i++) out += set[Math.floor(r() * set.length)]
    return out
  }
  var at = function (d, h, m) {
    return new Date(2026, 9, d, h, m)
  }

  /* ============================================================ 样例词表 */
  var BROOKLYN = ['Park Slope', 'Williamsburg', 'Greenpoint', 'Bushwick', 'DUMBO', 'Brooklyn Heights', 'Cobble Hill', 'Carroll Gardens', 'Red Hook', 'Fort Greene', 'Clinton Hill', 'Prospect Heights', 'Crown Heights', 'Bed-Stuy', 'Sunset Park', 'Bay Ridge', 'Dyker Heights', 'Bensonhurst', 'Borough Park', 'Flatbush', 'Midwood', 'Sheepshead Bay', 'Brighton Beach', 'Coney Island', 'Gravesend', 'Kensington', 'Windsor Terrace', 'Gowanus', 'Boerum Hill', 'Vinegar Hill', 'East Williamsburg', 'Ditmas Park', 'Prospect Lefferts Gardens', 'Canarsie', 'East New York', 'Brownsville', 'Cypress Hills', 'Marine Park', 'Mill Basin', 'Bergen Beach', 'Manhattan Beach', 'Downtown Brooklyn', 'Columbia Waterfront', 'Navy Yard']
  var QUEENS = ['Astoria', 'Long Island City', 'Sunnyside', 'Woodside', 'Jackson Heights', 'Elmhurst', 'Corona', 'Flushing', 'Bayside', 'Whitestone', 'College Point', 'Forest Hills', 'Rego Park', 'Kew Gardens', 'Richmond Hill', 'Ridgewood', 'Maspeth', 'Middle Village', 'Glendale', 'Woodhaven', 'Ozone Park', 'Howard Beach', 'Jamaica', 'Hollis', 'Bellerose', 'Fresh Meadows', 'Douglaston', 'Little Neck', 'Briarwood', 'St. Albans', 'Rockaway Beach', 'Far Rockaway']
  var MANHATTAN = ['Upper East Side', 'Upper West Side', 'Harlem', 'East Harlem', 'Washington Heights', 'Inwood', 'Morningside Heights', 'Hamilton Heights', 'Midtown', 'Midtown East', 'Hell’s Kitchen', 'Chelsea', 'Flatiron', 'Gramercy', 'Murray Hill', 'Kips Bay', 'Union Square', 'Greenwich Village', 'West Village', 'East Village', 'SoHo', 'NoHo', 'Nolita', 'Tribeca', 'Lower East Side', 'Chinatown', 'Little Italy', 'Financial District', 'Battery Park City', 'Two Bridges', 'Stuyvesant Town', 'Lenox Hill', 'Yorkville', 'Carnegie Hill', 'Lincoln Square', 'Manhattan Valley', 'Sugar Hill', 'Hudson Yards', 'Koreatown', 'NoMad', 'Garment District', 'Turtle Bay', 'Sutton Place', 'Roosevelt Island', 'Meatpacking District', 'Hudson Square', 'Civic Center', 'Marble Hill']
  var JERSEY = ['Downtown Jersey City', 'Paulus Hook', 'Harsimus Cove', 'Hamilton Park', 'Van Vorst Park', 'The Heights', 'Journal Square', 'Bergen-Lafayette', 'Greenville', 'West Side', 'McGinley Square', 'Newport', 'Exchange Place', 'Liberty Harbor', 'Marion', 'Society Hill', 'Lincoln Park', 'Hudson City', 'Country Village', 'West Bergen']
  var HOBOKEN = ['Washington St', 'Hudson St', 'Bloomfield St', 'Garden St', 'Park Ave', 'Willow Ave', 'Clinton St', 'Grand St', 'Adams St', 'Jefferson St', 'Madison St', 'Monroe St', 'Jackson St', 'Harrison St', 'Observer Hwy', 'Newark St', '1st St', '2nd St', '3rd St', '4th St', '5th St', '6th St', '7th St', '8th St', '9th St']
  var BRONX = ['Mott Haven', 'Port Morris', 'Melrose', 'Morrisania', 'Hunts Point', 'Longwood', 'Highbridge', 'Concourse', 'Fordham', 'Belmont', 'Tremont', 'Kingsbridge', 'Riverdale', 'Norwood', 'Bedford Park', 'University Heights', 'Morris Park', 'Pelham Bay', 'Throggs Neck', 'Country Club', 'City Island', 'Parkchester', 'Soundview', 'Castle Hill', 'Wakefield', 'Williamsbridge']
  // 虚构面包店（下东城评论任务）：名字刻意生造，避免与真实商户重名
  var BAKERIES = ['Larkspur Bakehouse', 'Bramble Bread Co.', 'Thistle & Rye', 'Copperleaf Ovens', 'Juniper Loaf', 'Saltmeadow Pastry', 'Morrow Bakeshop', 'Quillfeather Bakery', 'Wrenfield Breads', 'Hearthstone Crumb', 'Marigold Oven', 'Fennel & Flour', 'Cinderfield Bakery', 'Oakmoss Patisserie', 'Tallow Lane Bakery', 'Driftseed Breadworks', 'Pennywhistle Pastry', 'Sorrel Street Bakery', 'Amberwheat Bakehouse', 'Nettlecroft Bakery', 'Kestrel Crumb Co.', 'Honeyreed Pastry', 'Mapleknot Bakery', 'Bluefern Breads', 'Starling Oven', 'Cobblestone Rise', 'Lindenfold Bakery', 'Rookery Rolls', 'Hollowpine Bakeshop', 'Glimmerloaf', 'Briarpatch Batch', 'Sablewing Pastry', 'Featherstone Bread', 'Pippin & Proof', 'Wildoat Bakery', 'Tidewater Crust', 'Ashgrove Ovens', 'Mossbank Pastry', 'Lanternfly Bakery', 'Elderberry Rise']
  var ROASTERS = ['Tinderbox Roasters', 'Gullwing Coffee', 'Slate & Steam', 'Fieldnote Roastery', 'Moonrake Coffee', 'Harrow Bean Co.', 'Cobalt Kettle', 'Pinewick Roasters', 'Second Draw Coffee', 'Wheelhouse Roastery', 'Brasswing Coffee', 'Lowtide Roasters', 'Kiln & Crema', 'Northfold Coffee', 'Saltbox Roasting Co.', 'Ironbark Espresso']
  var ZIPS = []
  for (var z = 10001; z <= 10282; z++) ZIPS.push(String(z))

  var cross = function (places, patterns) {
    var out = []
    places.forEach(function (p) {
      patterns.forEach(function (pattern) {
        out.push(pattern.replace('{p}', p))
      })
    })
    return out
  }

  /* ============================================================ 评论 URL */
  // 生成：约 70% Maps place 链接（两段 hex fid）、30% Google 评论链接（placeid）；坐标落在下东城一带
  var placeUrl = function (name, r) {
    var lat = (40.714 + r() * 0.012).toFixed(4)
    var lng = (-73.992 + r() * 0.014).toFixed(4)
    var slug = name.replace(/&/g, '%26').replace(/\s+/g, '+')
    return 'https://www.google.com/maps/place/' + slug + '/@' + lat + ',' + lng + ',17z/data=!4m6!3m5!1s0x89c25' + hex(r, 11) + ':0x' + hex(r, 16) + '!8m2!3d' + lat + '!4d' + lng + '!16s%2Fg%2F11' + chars(r, 8).toLowerCase() + '?entry=ttu'
  }
  var reviewsUrl = function (r) {
    return 'https://search.google.com/local/reviews?placeid=ChIJ' + chars(r, 23)
  }
  var reviewList = function (names, seed) {
    var r = rng(seed)
    return names.map(function (name) {
      return r() < 0.3 ? reviewsUrl(r) : placeUrl(name, r)
    })
  }
  // 三种真实会粘进来、但 buildReviewWorkUrl 会拒绝的链接：分享短链、http、Maps 搜索页
  var INVALID = {
    short: 'https://maps.app.goo.gl/q7XbN2Lw9cRf3TzP8',
    http: 'http://www.google.com/maps/place/Juniper+Loaf/@40.7191,-73.9857,17z',
    search: 'https://www.google.com/maps/search/bakery+near+Orchard+St'
  }

  DBSim.reviewUrlOk = function (value) {
    var u
    try {
      u = new URL(value)
    } catch (error) {
      return false
    }
    if (u.protocol !== 'https:') return false
    if (u.hostname === 'search.google.com' && u.pathname === '/local/reviews') {
      return /^[A-Za-z0-9_-]+$/.test(u.searchParams.get('placeid') || '')
    }
    if (u.hostname !== 'www.google.com' || u.pathname.indexOf('/maps/place/') !== 0) return false
    return (value.match(/0x[0-9a-f]+/gi) || []).length >= 2
  }

  /* ============================================================ 输入解析 · 额度 */
  DBSim.parse = function (text) {
    var seen = Object.create(null)
    var values = []
    var dupes = 0
    var empty = 0
    var lines = text.split('\n')
    // 末尾的单个换行不算空行（粘贴列表常带一个）
    if (lines.length > 1 && lines[lines.length - 1].trim() === '') lines.pop()
    lines.forEach(function (line) {
      var v = line.trim()
      if (!v) {
        empty++
        return
      }
      if (seen[v]) {
        dupes++
        return
      }
      seen[v] = true
      values.push(v)
    })
    return { values: values, dupes: dupes, empty: text.trim() ? empty : 0 }
  }

  DBSim.perItem = function (type, perPlace) {
    return type === 'reviews' ? perPlace || DBSim.LIMITS.perPlaceDefault : DBSim.LIMITS.perKeyword
  }
  DBSim.estimate = function (type, n, perPlace) {
    return n * DBSim.perItem(type, perPlace)
  }
  DBSim.left = function () {
    return Math.max(0, DBSim.usage.total - DBSim.usage.used)
  }

  /* ============================================================ 任务与条目 */
  // 每个条目自带剧本：plan[k] = 第 k+1 次尝试的结果（done / stuck），yield = 完成时回填的记录数，dur = 一次采集的演示时长
  var reviewCount = function (r) {
    return r() < 0.72 ? between(r, 310, 2400) : between(r, 18, 290)
  }
  var makeItems = function (def) {
    var r = rng(seedOf(def.id + '|' + def.name))
    var plans = def.plans || {}
    return def.values.map(function (value, i) {
      var y = def.type === 'reviews' ? Math.min(def.perPlace, reviewCount(r)) : between(r, 14, 118)
      return { value: value, status: 'pending', tries: 0, collected: 0, skipReason: null, plan: plans[i] || ['done'], yield: y, dur: between(r, 1500, 2600) }
    })
  }

  // 瞬间跑完一个条目的剧本（摆状态用）：与 machine.ts 相同的重试判定 tries ≥ retry + 1 → 跳过
  var settle = function (task, it) {
    if (task.type === 'reviews' && !DBSim.reviewUrlOk(it.value)) {
      it.status = 'skipped'
      it.skipReason = 'invalid-url'
      return
    }
    for (;;) {
      it.tries++
      if ((it.plan[it.tries - 1] || 'done') === 'done') {
        it.status = 'complete'
        it.collected = it.yield
        return
      }
      if (it.tries >= DBSim.retry + 1) {
        it.status = 'skipped'
        it.skipReason = 'stuck'
        return
      }
    }
  }

  /**
   * 把任务摆到某个状态。opts.at = 已处理条数（running / paused 用，缺省为默认进度）；
   * opts.retrying = 当前条目处于第 2 次尝试（卡死后重开）
   */
  DBSim.snapshot = function (task, status, opts) {
    var o = opts || {}
    var n = task.items.length
    var stop = status === 'completed' ? n : status === 'idle' ? 0 : Math.min(o.at == null ? task.at : o.at, n - 1)
    task.items.forEach(function (it, i) {
      it.status = 'pending'
      it.tries = 0
      it.collected = 0
      it.skipReason = null
      it.plan = task.plans[i] || ['done']
      if (i < stop) settle(task, it)
    })
    // 游标停在无效 URL 上时，调度器会顺路跳过它（launchFrom 的级联跳过）
    while (status !== 'completed' && status !== 'idle' && stop < n - 1 && task.type === 'reviews' && !DBSim.reviewUrlOk(task.items[stop].value)) {
      settle(task, task.items[stop])
      stop++
    }
    task.status = status
    task.cursor = status === 'completed' ? n : stop
    task.finishedAt = status === 'completed' ? task.finishedDefault || new Date(DBSim.NOW.getTime() - 40 * 60000) : null
    var cur = task.items[stop]
    if (status === 'running' && cur) {
      cur.status = 'running'
      cur.tries = o.retrying ? 2 : 1
      if (o.retrying) cur.plan = ['stuck', o.retryOutcome || 'done']
    }
    return task
  }

  var makeTask = function (def) {
    var task = {
      id: def.id,
      seq: def.seq,
      name: def.name,
      type: def.type,
      status: 'idle',
      createdAt: def.createdAt,
      perPlace: def.type === 'reviews' ? def.perPlace : null,
      items: null,
      plans: def.plans || {},
      cursor: 0,
      at: def.at || 0,
      focus: !!def.focus,
      finishedAt: null,
      finishedDefault: def.finishedAt || null
    }
    task.items = makeItems(def)
    return DBSim.snapshot(task, def.status || 'idle', { at: def.at })
  }

  DBSim.createTask = function (fields) {
    return makeTask({
      id: 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
      seq: fields.seq,
      name: fields.name,
      type: fields.type,
      values: fields.values,
      perPlace: fields.perPlace,
      createdAt: new Date(DBSim.NOW.getTime() + (Date.now() - BOOT)),
      plans: fields.plans
    })
  }
  var BOOT = Date.now()
  DBSim.now = function () {
    return new Date(DBSim.NOW.getTime() + (Date.now() - BOOT))
  }

  DBSim.counts = function (task) {
    var c = { total: task.items.length, done: 0, complete: 0, stuck: 0, invalid: 0, tries: 0, launched: 0, records: 0 }
    task.items.forEach(function (it) {
      c.tries += it.tries
      if (it.tries > 0) c.launched++
      if (it.status === 'complete') {
        c.complete++
        c.records += it.collected
      } else if (it.status === 'skipped') {
        if (it.skipReason === 'stuck') c.stuck++
        else c.invalid++
      }
    })
    c.done = c.complete + c.stuck + c.invalid
    c.skipped = c.stuck + c.invalid
    c.open = c.total - c.complete // Copy pending：未完成的条目（含跳过的，便于重跑）
    c.retries = c.tries - c.launched
    return c
  }

  /* ============================================================ 样例世界 */
  var S = 'stuck'
  var D = 'done'
  DBSim.world = function (opts) {
    var o = opts || {}
    var places = (window.Proto && window.Proto.places) || []
    var bakery = reviewList(BAKERIES, 7)
    bakery[6] = INVALID.short
    bakery[19] = INVALID.http
    bakery[31] = INVALID.search
    var roast = reviewList(ROASTERS.concat(places.map(function (p) { return p.name })), 11)
    roast[Math.min(17, roast.length - 1)] = 'https://maps.app.goo.gl/Vd3sK8mQp2LxW7nE6'
    var cafes = reviewList(['Ember & Oak Coffee', 'Lantern Street Café', 'Copper Kettle Café', 'Gullwing Coffee', 'Moonrake Coffee', 'Northfold Coffee', 'Kiln & Crema', 'Lowtide Roasters', 'Brasswing Coffee', 'Saltbox Roasting Co.', 'Cobalt Kettle', 'Pinewick Roasters'], 23)
    var florists = ['W 63rd St', 'W 65th St', 'W 67th St', 'W 69th St', 'W 70th St', 'W 72nd St', 'W 74th St', 'W 76th St', 'W 78th St', 'W 79th St', 'W 81st St', 'W 83rd St', 'W 85th St', 'W 86th St', 'W 88th St', 'W 90th St', 'W 92nd St', 'W 96th St']
    var shift = o.fill ? 140 : 0

    var defs = [
      { id: 'k07', seq: 7, type: 'keywords', name: 'Coffee shops · Brooklyn', createdAt: at(18, 9, 42), focus: true, status: 'running', at: 84,
        values: cross(BROOKLYN, ['coffee shops in {p}', 'espresso bars in {p}', 'cafes with wifi in {p}']).slice(0, 128),
        plans: { 23: [S, D], 37: [S, S], 61: [S, S], 92: [S, D], 110: [S, S] } },
      { id: 'k06', seq: 6, type: 'keywords', name: 'Dentists · Queens', createdAt: at(18, 8, 15), status: 'idle',
        values: cross(QUEENS, ['dentists in {p}', 'pediatric dentists in {p}']), plans: { 17: [S, D] } },
      { id: 'k05', seq: 5, type: 'keywords', name: 'Yoga studios · Manhattan', createdAt: at(17, 16, 5), status: 'paused', at: 41,
        values: cross(MANHATTAN, ['yoga studios in {p}', 'pilates studios in {p}']), plans: { 12: [S, D] } },
      { id: 'k04', seq: 4, type: 'keywords', name: 'Bakeries · Jersey City', createdAt: at(16, 14, 20), status: 'completed', finishedAt: at(16, 15, 2),
        values: cross(JERSEY, ['bakeries in {p}', 'bagel shops in {p}']), plans: { 9: [S, S], 27: [S, S], 30: [S, D] } },
      { id: 'k03', seq: 3, type: 'keywords', name: 'Gyms · Hoboken', createdAt: at(14, 10, 8), status: 'completed', finishedAt: at(14, 10, 31),
        values: HOBOKEN.map(function (s) { return 'gyms near ' + s + ', Hoboken' }) },
      { id: 'k02', seq: 2, type: 'keywords', name: 'Florists · Upper West Side', createdAt: at(11, 17, 40), status: 'completed', finishedAt: at(11, 17, 58),
        values: florists.map(function (s) { return 'florists near ' + s }), plans: { 5: [S, D] } },
      { id: 'k01', seq: 1, type: 'keywords', name: 'Barbershops · Bronx', createdAt: at(7, 13, 5), status: 'completed', finishedAt: at(7, 13, 56),
        values: cross(BRONX, ['barbershops in {p}', 'hair salons in {p}']), plans: { 44: [S, S] } },
      { id: 'r03', seq: 3, type: 'reviews', name: 'Bakery reviews · Lower East Side', createdAt: at(18, 10, 20), focus: true, status: 'idle', at: 24, perPlace: 300,
        values: bakery, plans: { 14: [S, S], 27: [S, D] } },
      { id: 'r02', seq: 2, type: 'reviews', name: 'Coffee roaster reviews', createdAt: at(15, 11, 12), status: 'completed', finishedAt: at(15, 12, 40), perPlace: 500,
        values: roast, plans: { 9: [S, S] } },
      { id: 'r01', seq: 1, type: 'reviews', name: 'Café reviews · Chelsea', createdAt: at(12, 9, 50), status: 'idle', perPlace: 200, values: cafes }
    ]
    var tasks = defs.map(function (d) {
      if (d.type === 'keywords') d.seq += shift
      return makeTask(d)
    })
    if (o.fill) tasks = tasks.concat(fillers())
    return tasks
  }

  // 任务位已满（150 / 150）用的旧任务：140 个已完成的关键词任务，九月建
  var fillers = function () {
    var trades = ['Plumbers', 'Electricians', 'Locksmiths', 'Roofers', 'HVAC contractors', 'Movers', 'Painters', 'Landscapers', 'Pest control', 'House cleaners']
    var areas = ['Astoria', 'Flushing', 'Harlem', 'Chelsea', 'Bushwick', 'Bay Ridge', 'Riverdale', 'Tribeca', 'Hoboken', 'Newport', 'Jamaica', 'SoHo', 'Inwood', 'Midwood']
    var out = []
    var r = rng(99)
    var n = 0
    areas.forEach(function (area) {
      trades.forEach(function (trade) {
        n++
        var start = between(r, 0, ZIPS.length - 32)
        var size = between(r, 10, 30)
        var created = new Date(2026, 8, 1 + Math.floor((n - 1) / 5), 9 + ((n * 3) % 8), (n * 7) % 60)
        out.push(
          makeTask({
            id: 'f' + n,
            seq: n,
            type: 'keywords',
            name: trade + ' · ' + area,
            createdAt: created,
            finishedAt: new Date(created.getTime() + size * 45000),
            status: 'completed',
            values: ZIPS.slice(start, start + size).map(function (zip) {
              return trade.toLowerCase() + ' near ' + zip
            })
          })
        )
      })
    })
    return out
  }

  /* ============================================================ 调度模拟 */
  // 与 machine.ts 同规则：start（互斥 mutex；completed 即清零重跑）· pause（当前条目退回 pending）·
  // done → 下一条 · stuck → tries ≥ retry + 1 跳过，否则同一条目重开（tries 累加）· 走到底 → completed。
  // 原型把 90 秒卡死判定压缩成 STUCK_MS；单条时长取剧本里的 dur；engine.speed 是全局倍率（流程播放时加速）。
  // 与现状的一处差异（提案）：暂停打断的那次尝试不计入 tries，续跑仍是 try 1，不吃掉重试机会。
  var STUCK_MS = 3600
  var engine = (DBSim.engine = { task: null, speed: 1, frozen: false, timer: 0, listeners: [] })

  engine.on = function (fn) {
    engine.listeners.push(fn)
  }
  var emit = function (type, task, index) {
    engine.listeners.forEach(function (fn) {
      fn(type, task, index)
    })
  }

  var schedule = function (task, i, ms) {
    clearTimeout(engine.timer)
    if (engine.frozen) return
    var it = task.items[i]
    var outcome = it.plan[it.tries - 1] || 'done'
    var wait = ms == null ? (outcome === 'done' ? it.dur : STUCK_MS) * engine.speed : ms
    engine.timer = setTimeout(function () {
      if (engine.task !== task || task.status !== 'running' || task.cursor !== i || it.status !== 'running') return
      if (outcome === 'done') finish(task, i)
      else interrupt(task, i)
    }, wait)
  }

  var launchFrom = function (task, from) {
    for (var i = Math.max(0, from); i < task.items.length; i++) {
      var it = task.items[i]
      if (it.status !== 'pending') continue
      if (task.type === 'reviews' && !DBSim.reviewUrlOk(it.value)) {
        it.status = 'skipped'
        it.skipReason = 'invalid-url'
        emit('skip', task, i)
        continue
      }
      it.status = 'running'
      it.tries++
      task.cursor = i
      emit('item', task, i)
      schedule(task, i)
      return
    }
    clearTimeout(engine.timer)
    task.status = 'completed'
    task.cursor = task.items.length
    task.finishedAt = DBSim.now()
    if (engine.task === task) engine.task = null
    emit('task', task)
  }

  var finish = function (task, i) {
    var it = task.items[i]
    it.status = 'complete'
    it.collected = it.yield
    emit('done', task, i)
    launchFrom(task, i + 1)
  }

  var interrupt = function (task, i) {
    var it = task.items[i]
    if (it.tries >= DBSim.retry + 1) {
      it.status = 'skipped'
      it.skipReason = 'stuck'
      emit('skip', task, i)
      launchFrom(task, i + 1)
      return
    }
    it.status = 'pending'
    launchFrom(task, i)
  }

  /** 启动 / 续跑 / 重跑。返回 { ok, code, running }；code = 'mutex' 时 running 是正在运行的任务 */
  engine.start = function (task, all) {
    var other = all.filter(function (t) {
      return t.status === 'running' && t !== task
    })[0]
    if (other) return { ok: false, code: 'mutex', running: other }
    if (task.status === 'running') return { ok: true }
    if (task.status === 'completed') {
      task.items.forEach(function (it, i) {
        it.status = 'pending'
        it.tries = 0
        it.collected = 0
        it.skipReason = null
        it.plan = task.plans[i] || ['done']
      })
      task.cursor = 0
      task.finishedAt = null
    }
    task.status = 'running'
    engine.task = task
    emit('task', task)
    launchFrom(task, task.cursor)
    return { ok: true }
  }

  engine.pause = function (task) {
    if (task.status !== 'running') return
    clearTimeout(engine.timer)
    var it = task.items[task.cursor]
    if (it && it.status === 'running') {
      it.status = 'pending'
      it.tries = Math.max(0, it.tries - 1)
    }
    task.status = 'paused'
    if (engine.task === task) engine.task = null
    emit('task', task)
  }

  /** 接管一个已摆成 running 的任务（状态坞 / 深链）：从当前条目继续计时 */
  engine.adopt = function (task) {
    clearTimeout(engine.timer)
    engine.task = task
    if (task.status === 'running' && task.items[task.cursor]) schedule(task, task.cursor)
  }

  engine.halt = function () {
    clearTimeout(engine.timer)
    engine.task = null
  }

  engine.remove = function (task) {
    if (engine.task === task) engine.halt()
  }

  /** 改写当前条目从本次尝试起的剧本并重新计时（流程演示：卡死 → 重开 → 跳过） */
  engine.script = function (task, rest, ms) {
    var it = task.items[task.cursor]
    if (!it || it.status !== 'running') return
    it.plan = it.plan.slice(0, it.tries - 1).concat(rest)
    schedule(task, task.cursor, ms)
  }

  /* ============================================================ 表单样例 */
  var EATERY_A = ['Amber', 'Birch', 'Cedar', 'Dune', 'Ember', 'Fable', 'Grove', 'Harbor', 'Iris', 'Juniper', 'Kestrel', 'Linden', 'Maple', 'Nimbus', 'Opal', 'Pine', 'Quill', 'Rowan', 'Sable', 'Thorn', 'Umber', 'Vale', 'Willow', 'Yarrow']
  var EATERY_B = ['Bakery', 'Café', 'Bistro', 'Kitchen', 'Pantry', 'Deli', 'Diner', 'Tavern', 'Eatery', 'Grill', 'Noodle Bar', 'Taqueria', 'Bagels', 'Creamery', 'Roasters', 'Patisserie', 'Pizzeria', 'Ramen', 'Smokehouse', 'Juice Bar', 'Tea House', 'Brasserie']
  var withNoise = function (lines, dupes, blanks) {
    var out = lines.slice()
    dupes.forEach(function (d) {
      out.splice(d[1], 0, lines[d[0]])
    })
    blanks.forEach(function (pos) {
      out.splice(pos, 0, '')
    })
    return out.join('\n')
  }

  DBSim.samples = function (type, kind) {
    if (type === 'reviews') {
      if (kind === 'split') {
        var names = []
        EATERY_A.forEach(function (a) {
          EATERY_B.forEach(function (b) {
            names.push(a + ' ' + b)
          })
        })
        return { name: 'Restaurant reviews · NYC', perPlace: 100, text: reviewList(names.slice(0, 520), 53).join('\n') }
      }
      if (kind === 'over-quota') return { name: 'Bakery reviews · Brooklyn', perPlace: 300, text: reviewList(BAKERIES.slice(10, 34), 41).join('\n') }
      var urls = reviewList(['Crumbwell Bakery', 'Rosehip Pastry', 'Fernleaf Bakehouse', 'Gilded Crust', 'Meadowlark Bread', 'Pebblestone Bakery', 'Kindling Oven', 'Orchardine Pastry', 'Tamarack Breads', 'Hazelmere Bakery'], 31)
      urls.splice(4, 0, INVALID.short)
      return { name: 'Bakery reviews · Williamsburg', perPlace: 300, text: withNoise(urls, [[1, 7]], [9]) }
    }
    if (kind === 'split') {
      return { name: 'Home services · NYC ZIPs', text: cross(ZIPS, ['plumbers near {p}', 'electricians near {p}', 'locksmiths near {p}', 'roofers near {p}', 'movers near {p}']).slice(0, 1240).join('\n') }
    }
    if (kind === 'over-quota') {
      return { name: 'Plumbers · Brooklyn', text: cross(BROOKLYN.slice(0, 32), ['plumbers in {p}', 'electricians in {p}', 'locksmiths in {p}']).join('\n') }
    }
    var lines = cross(QUEENS.slice(0, 15), ['pet groomers in {p}', 'dog groomers in {p}'])
    return { name: 'Pet groomers · Queens', text: withNoise(lines, [[3, 8], [10, 17], [21, 26]], [12, 24]) }
  }

  /* ============================================================ 显示格式 */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  DBSim.time = function (d) {
    var h = d.getHours()
    var m = d.getMinutes()
    return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM')
  }
  /** Today, 9:42 AM · Yesterday, 4:05 PM · Oct 14, 10:08 AM（相对 NOW，截图稳定） */
  DBSim.when = function (d) {
    var day = function (x) {
      return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
    }
    var diff = Math.round((day(DBSim.NOW) - day(d)) / 86400000)
    var date = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : MONTHS[d.getMonth()] + ' ' + d.getDate()
    return date + ', ' + DBSim.time(d)
  }
})()
