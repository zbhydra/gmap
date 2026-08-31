#!/usr/bin/env node
/**
 * Bing Maps e2e fixture 页生成器(T1 §6 离线 fixture 层)。
 *
 * 以 docs/feat/016.Bing插件/references/golden-samples/data-entity-samples.json
 * 的 3 条真实 data-entity 样本为结构模板,按索引确定性合成 30 个条目并输出
 * bing-maps-fixture.html。合成规则:结构字段(infoboxHtml、评分、营业时间、
 * 分类等)逐字保留;仅标识字段变异——entity.id 序号化、title 加 "#N " 前缀、
 * address 门牌号偏移、phone 尾号偏移、坐标随 N 微移。同一输入重复运行输出
 * 逐字节一致(禁止手写数据漂移的唯一来源是本脚本)。
 *
 * 执行:node tests/e2e/fixtures/generate-fixture.mjs
 * (test:e2e 的 globalSetup 每次运行前自动重新生成,保证与脚本同步)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** 黄金样本(docs 域引用资产,真实抓取的 data-entity 属性值字符串数组)。 */
const GOLDEN_SAMPLES_PATH = resolve(
  __dirname,
  '../../../../docs/feat/016.Bing插件/references/golden-samples/data-entity-samples.json'
)

/** 输出的 fixture 页。 */
const OUTPUT_PATH = resolve(__dirname, 'bing-maps-fixture.html')

/** 合成条目总数(契约 ≥25;留出 loadMore 注入余量)。 */
export const FIXTURE_TOTAL = 30

/** 未带 URL 参数时的初始渲染条数。 */
export const FIXTURE_DEFAULT_INITIAL = 25

/** 单次 loadMore / 滚动翻页追加的条数。 */
const LOAD_MORE_BATCH = 5

/** 读取黄金样本并解析为 data-entity 对象数组。 */
function loadGoldenEntities() {
  const raw = JSON.parse(readFileSync(GOLDEN_SAMPLES_PATH, 'utf-8'))
  return raw.map(item => JSON.parse(item))
}

/**
 * 合成第 index 个条目:以模板 index % templates.length 为基底深拷贝,
 * 仅变异标识字段,其余字段逐字保留。
 */
function synthEntity(templates, index) {
  const entity = JSON.parse(JSON.stringify(templates[index % templates.length]))

  // id 序号化:ypid:YN + 16 位大写十六进制(与真实 ypid 形态一致)
  entity.entity.id = `ypid:YN${(index + 1).toString(16).toUpperCase().padStart(16, '0')}`
  // title 加序号前缀(全局唯一,后续导出断言可按 #N 抽检)
  entity.entity.title = `#${index + 1} ${entity.entity.title}`
  // address 门牌号确定性偏移
  entity.entity.address = entity.entity.address.replace(/^(\d+)/, houseNumber =>
    String(Number(houseNumber) + index)
  )
  // phone 尾 4 位确定性偏移
  entity.entity.phone = entity.entity.phone.replace(
    /(\d{4})$/,
    tail => String((Number(tail) + index) % 10000).padStart(4, '0')
  )

  // 坐标随 index 微移:lat + N×1e-5、lon − N×1e-5,保持坐标与变异地址的绑定关系
  const latDelta = index * 1e-5
  const lonDelta = -index * 1e-5
  entity.geometry.y += latDelta
  entity.geometry.x += lonDelta
  // 实测 bounds 形态 [lat, lon, lat, lon]:偶数位纬度、奇数位经度
  entity.geometry.bounds = entity.geometry.bounds.map(
    (value, axis) => value + (axis % 2 === 0 ? latDelta : lonDelta)
  )
  entity.routablePoint.latitude += latDelta
  entity.routablePoint.longitude += lonDelta

  return entity
}

/** fixture 页内嵌脚本:初始渲染条数受 URL 参数控制 + 可脚本控制的加载更多。 */
function buildReplayScript() {
  return `(function () {
  'use strict'
  var TOTAL = ${JSON.stringify(FIXTURE_TOTAL)}
  var DEFAULT_INITIAL = ${JSON.stringify(FIXTURE_DEFAULT_INITIAL)}
  var BATCH = ${JSON.stringify(LOAD_MORE_BATCH)}
  var entities = JSON.parse(document.getElementById('bing-fixture-data').textContent)
  var list = document.querySelector('ul.b_lstcards')
  var rendered = 0
  var scrollPaging = false

  function renderOne(entityJson, key) {
    var entity = JSON.parse(entityJson)
    var li = document.createElement('li')
    li.className = 'b_algoliath_card'
    li.setAttribute('data-key', String(key))
    li.setAttribute('data-entity-id', entity.entity.id)
    var button = document.createElement('button')
    button.type = 'button'
    button.className = 'b_split_card'
    button.setAttribute('data-entity', entityJson)
    var box = document.createElement('div')
    box.className = 'listingContent_fjvwG'
    var title = document.createElement('div')
    title.className = 'b_title'
    title.textContent = entity.entity.title
    var address = document.createElement('div')
    address.className = 'b_address'
    address.textContent = entity.entity.address
    var hours = document.createElement('div')
    hours.className = 'opHours'
    hours.textContent = entity.entity.openHoursText
    box.appendChild(title)
    box.appendChild(address)
    box.appendChild(hours)
    button.appendChild(box)
    li.appendChild(button)
    list.appendChild(li)
    rendered += 1
  }

  function loadMore(count) {
    var target = Math.min(rendered + (typeof count === 'number' ? count : BATCH), TOTAL)
    while (rendered < target) renderOne(entities[rendered], rendered)
  }

  list.addEventListener('scroll', function () {
    if (!scrollPaging) return
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) loadMore(BATCH)
  })

  window.bingFixture = {
    total: TOTAL,
    renderedCount: function () { return rendered },
    loadMore: loadMore,
    loadAll: function () { loadMore(TOTAL) },
    enableScrollPaging: function () { scrollPaging = true },
    disableScrollPaging: function () { scrollPaging = false }
  }

  var initial = parseInt(new URLSearchParams(window.location.search).get('fixtureInitial'), 10)
  loadMore(isNaN(initial) || initial < 0 ? DEFAULT_INITIAL : initial)
})()`
}

/** 组装 fixture 页 html(数据经 json script 标签内嵌,`<` 统一转义防提前闭合)。 */
function renderHtml(entityJsonStrings) {
  const dataJson = JSON.stringify(entityJsonStrings).replace(/</g, '\\u003c')
  return `<!doctype html>
<!-- 本文件由 generate-fixture.mjs 从黄金样本确定性合成,禁止手改;重新生成: node tests/e2e/fixtures/generate-fixture.mjs -->
<html lang="en" data-fixture="bing-maps-e2e">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>auto repair near New York, NY - Bing Maps</title>
</head>
<body>
<div id="appShellRoot">
  <main class="listingsPanel" role="main">
    <ul class="b_lstcards" data-automation-id="resultsList"></ul>
    <div class="bm_endOfList" data-automation-id="fixtureEndMarker" hidden>You've reached the end of the list.</div>
  </main>
</div>
<script id="bing-fixture-data" type="application/json">${dataJson}</script>
<script>${buildReplayScript()}</script>
</body>
</html>
`
}

/** 生成 fixture 页(幂等,输出确定性)。 */
export function generateFixture() {
  const templates = loadGoldenEntities()
  const entities = []
  for (let index = 0; index < FIXTURE_TOTAL; index += 1) {
    entities.push(JSON.stringify(synthEntity(templates, index)))
  }
  writeFileSync(OUTPUT_PATH, renderHtml(entities))
  return OUTPUT_PATH
}

// CLI 直跑(import 方式不触发)
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`[generate-fixture] 已生成 ${generateFixture()}`)
}
