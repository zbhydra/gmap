import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { LANGUAGE_SITEMAP_LOCALES } from '../src/sitemap/languageSitemap.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const repoDir = path.resolve(__dirname, '..')
const tempRootDir = path.join(repoDir, 'tmp')
const execFileAsync = promisify(execFile)
const GOOGLE_TEST_REQUEST_CONTEXT = {
  deviceId: 'test-google-device',
  token: null
}

async function createTempDir(prefix) {
  await mkdir(tempRootDir, { recursive: true })
  return mkdtemp(path.join(tempRootDir, prefix))
}

async function collectHtmlFiles(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true })
  const htmlFiles = []

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name)

    if (entry.isDirectory()) {
      htmlFiles.push(...(await collectHtmlFiles(fullPath)))
      continue
    }

    if (entry.isFile() && fullPath.endsWith('.html')) {
      htmlFiles.push(fullPath)
    }
  }

  return htmlFiles
}

function extractTagValues(xml, tagName) {
  return Array.from(xml.matchAll(new RegExp(`<${tagName}>([^<]+)</${tagName}>`, 'g'))).map(
    (match) => match[1]
  )
}

function extractCanonicalUrl(html) {
  const match = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)
  return match?.[1] ?? ''
}

function extractRobotsMeta(html) {
  const match = html.match(/<meta\b[^>]*name="robots"[^>]*content="([^"]+)"/i)
  return match?.[1] ?? ''
}

function extractTagWithAttribute(html, attribute) {
  const match = html.match(new RegExp(`<[^>]+\\s${attribute}(?:[\\s=>][^>]*)?>`, 'i'))
  assert.ok(match, `Expected built HTML to include [${attribute}]`)
  return match[0]
}

function tagHasBooleanAttribute(tag, attribute) {
  return new RegExp(`\\s${attribute}(?:[\\s=>]|$)`, 'i').test(tag)
}

async function flushBrowserTasks() {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

function readUiRecord(source, exportName) {
  const recordMatch = source.match(new RegExp(`export const ${exportName}:[\\s\\S]*?= \\{([\\s\\S]*?)\\n\\}`))
  assert.ok(recordMatch, `Expected src/i18n/ui.ts to export ${exportName}`)
  return new Map(
    Array.from(recordMatch[1].matchAll(/'([^']+)': '([^']*)'/g)).map((match) => [
      match[1],
      match[2]
    ])
  )
}

async function collectCanonicalUrls() {
  const htmlFiles = await collectHtmlFiles(distDir)
  const canonicalUrls = new Set()

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, 'utf8')
    const canonicalUrl = extractCanonicalUrl(html)
    assert.ok(canonicalUrl, `Expected ${path.relative(distDir, filePath)} to include canonical URL`)
    if (extractRobotsMeta(html).toLowerCase().includes('noindex')) {
      continue
    }
    canonicalUrls.add(canonicalUrl)
  }

  return canonicalUrls
}

test('Nginx configs canonicalize every built directory route directly to HTTPS', async () => {
  const configPaths = ['deploy/mapsgrab.conf', 'deploy/mapsgrab-test.conf']
  const htmlFiles = await collectHtmlFiles(distDir)
  const builtDirectoryRoutes = htmlFiles
    .filter((filePath) => path.basename(filePath) === 'index.html')
    .map((filePath) => {
      const relativeDirectory = path.relative(distDir, path.dirname(filePath))
      return relativeDirectory === '' ? '/' : `/${relativeDirectory.split(path.sep).join('/')}`
    })
    .filter((routePath) => routePath !== '/')

  assert.ok(builtDirectoryRoutes.length > 0, 'Expected the build to contain directory routes')

  for (const configPath of configPaths) {
    const source = await readFile(path.join(repoDir, configPath), 'utf8')
    const canonicalLocation = source.match(
      /location ~ "([^"]+)" \{\s*if \(-f \$request_filename\/index\.html\) \{\s*return 301 https:\/\/\$host\$uri\/\$is_args\$args;\s*\}\s*\}/
    )

    assert.ok(
      canonicalLocation,
      `Expected ${configPath} to canonicalize built index pages with one explicit HTTPS redirect`
    )

    const routePattern = new RegExp(canonicalLocation[1])
    assert.equal(routePattern.test('/a'), true)
    assert.equal(routePattern.test('/'), false)
    assert.equal(routePattern.test('/about/'), false)

    for (const routePath of builtDirectoryRoutes) {
      assert.equal(
        routePattern.test(routePath),
        true,
        `Expected ${configPath} to cover built route without trailing slash: ${routePath}`
      )
    }

    assert.equal(source.includes('features|guide|solutions|faq'), false)
  }
})

test('built pages do not reference TypeScript module scripts', async () => {
  const htmlFiles = await collectHtmlFiles(distDir)

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, 'utf8')
    const matches = Array.from(
      html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+\.ts(?:\?[^"]*)?)"[^>]*><\/script>/g)
    )

    assert.equal(
      matches.length,
      0,
      `Expected ${path.relative(distDir, filePath)} to avoid TypeScript module scripts, found: ${matches.map((match) => match[1]).join(', ')}`
    )
  }
})

test('language switch URL keeps the current query parameters', async () => {
  const { module, cleanup } = await importCompiledTypescriptModule(
    'src/scripts/site/language-switcher.ts',
    'language-switcher.js',
    'language-switcher-'
  )

  try {
    assert.equal(
      module.buildLanguageSwitchUrl(
        '/zh-cn/pricing/',
        'https://mapsgrab.com/pricing/?utm_source=extension&source=upgrade_modal'
      ),
      '/zh-cn/pricing/?utm_source=extension&source=upgrade_modal'
    )
    assert.equal(
      module.buildLanguageSwitchUrl(
        '/pricing/',
        'https://mapsgrab.com/zh-cn/pricing/'
      ),
      '/pricing/'
    )
  } finally {
    await cleanup()
  }
})

test('homepage keeps fonts off the critical path and leaves the GA4 slot empty', async () => {
  const html = await readFile(path.join(distDir, 'index.html'), 'utf8')

  assert.equal(html.includes('fonts.googleapis.com'), false)
  assert.equal(html.includes('fonts.gstatic.com'), false)
  // GA4 尚未接入（W6 回填 measurement ID）：不得出现硬编码测量 ID
  assert.equal(/googletagmanager\.com\/gtag\/js\?id=G-/.test(html), false)
  assert.equal(/<link\b[^>]+rel="stylesheet"/i.test(html), false)
})

test('Pricing copy keeps the three product-line tabs and checkout shell fields defined', async () => {
  const imported = await importCompiledTypescriptModule(
    'src/i18n/pricing.ts',
    'pricing.js',
    'pricing-i18n-'
  )

  try {
    const content = imported.module.pricingContent
    assert.ok(content, 'Expected pricing.ts to export pricingContent')
    assert.ok(content.seo.title)
    assert.ok(content.hero.title)
    assert.ok(content.account.signedOutTitle)
    // 三条产品线 tab 齐全
    assert.deepEqual(Object.keys(content.tabs), ['online', 'extension', 'api'])
    assert.deepEqual(Object.keys(content.tabLabels), ['online', 'extension', 'api'])
    // Extension 线 C2 套餐口径：Free 1,000 / Pro $39 100,000 / Business $99 500,000 records/月
    const extensionCards = content.tabs.extension.cards
    assert.deepEqual(extensionCards.map(card => card.id), ['free', 'pro', 'business'])
    assert.match(extensionCards[0].quota, /1,000 records/)
    assert.equal(extensionCards[1].price, '$39')
    assert.match(extensionCards[1].quota, /100,000 records/)
    assert.equal(extensionCards[2].price, '$99')
    assert.match(extensionCards[2].quota, /500,000 records/)
    // Free 引导安装，Pro/Business 接购买链路
    assert.deepEqual(extensionCards.map(card => card.status), ['free', 'buyable', 'buyable'])
    assert.deepEqual(extensionCards.map(card => card.productId), [null, 'maps_extension_pro', 'maps_extension_business'])
    // Online 线五档 SKU 与一次性口径
    assert.deepEqual(
      content.tabs.online.cards.map(card => card.productId),
      [null, 'online_lite', 'online_basic', 'online_growth', 'online_pro']
    )
    for (const card of content.tabs.online.cards.filter(item => item.status === 'buyable')) {
      assert.match(card.periodLabel, /one-time/)
    }
    // API 线五档 SKU 与一次性口径
    assert.deepEqual(
      content.tabs.api.cards.map(card => card.productId),
      [null, 'api_basic', 'api_professional', 'api_business', 'api_scale']
    )
    for (const card of content.tabs.api.cards.filter(item => item.status === 'buyable')) {
      assert.match(card.periodLabel, /one-time/)
    }
    assert.ok(content.faq.items.length > 0)
    // 取消指引：PayPal 渠道路径
    assert.ok(content.cancellationGuide.paths.length > 0)
    assert.ok(content.cancellationGuide.buttonLabel)
    assert.ok(content.cancellationGuide.closeLabel)
  } finally {
    await imported.cleanup()
  }
})

test('language sitemap output matches locale mapping and built canonical pages', async () => {
  const siteUrl = 'https://mapsgrab.com'
  const uiSource = await readFile(path.join(repoDir, 'src/i18n/ui.ts'), 'utf8')
  const localePaths = readUiRecord(uiSource, 'localePaths')
  const hreflangMap = readUiRecord(uiSource, 'hreflangMap')

  for (const language of LANGUAGE_SITEMAP_LOCALES) {
    assert.equal(localePaths.get(language.locale), language.pathPrefix)
    assert.equal(hreflangMap.get(language.locale), language.sitemapSlug)
  }

  assert.equal(LANGUAGE_SITEMAP_LOCALES.length, localePaths.size)

  const distFiles = await readdir(distDir)
  assert.equal(distFiles.includes('sitemap.xml'), true)
  assert.equal(distFiles.includes('sitemap_index.xml'), true)
  assert.equal(distFiles.includes('sitemap-0.xml'), true)

  const indexXml = await readFile(path.join(distDir, 'sitemap.xml'), 'utf8')
  const indexAliasXml = await readFile(path.join(distDir, 'sitemap_index.xml'), 'utf8')
  assert.equal(indexAliasXml, indexXml)
  assert.match(indexXml, /<\?xml-stylesheet type="text\/xsl" href="\/sitemap\.xsl"\?>/)
  assert.match(indexXml, /<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
  const sitemapStylesheet = await readFile(path.join(distDir, 'sitemap.xsl'), 'utf8')
  assert.match(sitemapStylesheet, /XML Sitemap Index \| MapsGrab/)
  assert.match(sitemapStylesheet, /sitemap:sitemapindex/)
  assert.match(sitemapStylesheet, /sitemap:urlset/)

  const indexLocs = extractTagValues(indexXml, 'loc')
  assert.equal(indexLocs.length, LANGUAGE_SITEMAP_LOCALES.length)
  assert.equal(indexLocs.some((loc) => loc.includes('sitemap-0.xml')), false)

  const canonicalUrls = await collectCanonicalUrls()
  const sitemapUrls = new Set()
  const legacyFlatXml = await readFile(path.join(distDir, 'sitemap-0.xml'), 'utf8')
  assert.match(legacyFlatXml, /<\?xml-stylesheet type="text\/xsl" href="\/sitemap\.xsl"\?>/)
  assert.match(legacyFlatXml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
  assert.equal(extractTagValues(legacyFlatXml, 'changefreq').length, 0)
  assert.equal(extractTagValues(legacyFlatXml, 'priority').length, 0)
  const legacyFlatLocs = extractTagValues(legacyFlatXml, 'loc')

  for (const language of LANGUAGE_SITEMAP_LOCALES) {
    const sitemapUrl = `${siteUrl}/${language.sitemapSlug}-sitemap.xml`
    assert.ok(indexLocs.includes(sitemapUrl), `Expected sitemap index to include ${sitemapUrl}`)

    const sitemapPath = path.join(distDir, `${language.sitemapSlug}-sitemap.xml`)
    const sitemapXml = await readFile(sitemapPath, 'utf8')
    assert.match(sitemapXml, /<\?xml-stylesheet type="text\/xsl" href="\/sitemap\.xsl"\?>/)
    assert.match(sitemapXml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)

    const locs = extractTagValues(sitemapXml, 'loc')
    const lastmods = extractTagValues(sitemapXml, 'lastmod')

    assert.ok(locs.length > 0, `Expected ${language.sitemapSlug}-sitemap.xml to contain URLs`)
    assert.equal(lastmods.length, locs.length)
    assert.equal(extractTagValues(sitemapXml, 'changefreq').length, 0)
    assert.equal(extractTagValues(sitemapXml, 'priority').length, 0)
    for (const lastmod of lastmods) {
      assert.equal(Number.isNaN(Date.parse(lastmod)), false, `Expected valid lastmod: ${lastmod}`)
    }

    for (const loc of locs) {
      const locSegments = new URL(loc).pathname.split('/').filter(Boolean)
      const lastSegment = locSegments[locSegments.length - 1] ?? ''
      assert.equal(
        ['features', 'guide', 'faq', 'solutions'].includes(lastSegment),
        false,
        `Expected sitemap to exclude retired information route: ${loc}`
      )
      sitemapUrls.add(loc)

      if (language.locale === 'en-US') {
        const firstSegment = new URL(loc).pathname.split('/').filter(Boolean)[0] ?? ''
        const languagePrefixes = new Set(
          LANGUAGE_SITEMAP_LOCALES
            .map((item) => item.pathPrefix)
            .filter((pathPrefix) => pathPrefix !== '')
        )
        assert.equal(languagePrefixes.has(firstSegment), false)
      } else {
        assert.ok(
          new URL(loc).pathname.startsWith(`/${language.pathPrefix}/`),
          `Expected ${loc} to use /${language.pathPrefix}/ prefix`
        )
      }
    }
  }

  const publicCanonicalUrls = canonicalUrls
  assert.deepEqual(sitemapUrls, publicCanonicalUrls)
  assert.deepEqual(new Set(legacyFlatLocs), publicCanonicalUrls)

  const robotsTxt = await readFile(path.join(distDir, 'robots.txt'), 'utf8')
  assert.match(robotsTxt, /Sitemap: https:\/\/mapsgrab\.com\/sitemap\.xml/)
  assert.match(robotsTxt, /^Disallow: \/paypal\/cancel\/$/m)
  assert.match(robotsTxt, /^Disallow: \/paypal\/success\/$/m)
  assert.equal(sitemapUrls.has(`${siteUrl}/paypal/cancel/`), false)
  assert.equal(sitemapUrls.has(`${siteUrl}/paypal/success/`), false)
  assert.equal(
    Array.from(sitemapUrls).some((url) => new URL(url).pathname.endsWith('/pricing/')),
    true
  )
})

test('About and Contact pages expose localized trust content and structured data', async () => {  const siteUrl = 'https://mapsgrab.com'

  for (const language of LANGUAGE_SITEMAP_LOCALES) {
    const languagePath = language.pathPrefix ? `${language.pathPrefix}/` : ''
    const aboutHtml = await readFile(path.join(distDir, languagePath, 'about/index.html'), 'utf8')
    const contactHtml = await readFile(path.join(distDir, languagePath, 'contact/index.html'), 'utf8')
    const expectedAboutUrl = `${siteUrl}/${languagePath}about/`
    const expectedContactUrl = `${siteUrl}/${languagePath}contact/`

    assert.equal(extractCanonicalUrl(aboutHtml), expectedAboutUrl)
    assert.equal(extractCanonicalUrl(contactHtml), expectedContactUrl)
    assert.match(aboutHtml, /"@type":"AboutPage"/)
    assert.match(contactHtml, /"@type":"ContactPage"/)
    assert.match(aboutHtml, /"datePublished":"2026-08-07"/)
    // dateModified 走独立审校日期常量（companyContent 的 COMPANY_PAGES_DATE_MODIFIED_ISO）
    assert.match(aboutHtml, /"dateModified":"2026-08-31"/)
    assert.match(contactHtml, /"dateModified":"2026-08-31"/)
    assert.match(aboutHtml, /"@id":"https:\/\/mapsgrab\.com\/#organization"/)
    assert.match(contactHtml, /"@id":"https:\/\/mapsgrab\.com\/#support"/)
    assert.equal(aboutHtml.includes(`href="/${languagePath}contact/"`), true)
    assert.equal(contactHtml.includes(`href="/${languagePath}about/"`), true)
    assert.match(contactHtml, /href="mailto:support@mapsgrab\.com\?subject=/)
    assert.match(contactHtml, /support@mapsgrab\.com/)
    assert.match(contactHtml, /data-ga-source="contact"/)
  }
})

test('every built page exposes complete title, description and Open Graph metadata', async () => {
  const htmlFiles = await collectHtmlFiles(distDir)
  // 19 内容页（含 Online Scraper / API / MCP / Bing 桥接）+ 2 个 PayPal 回跳页 + 1 个插件登录桥接页（noindex）
  assert.equal(htmlFiles.length, 22)

  const descriptionsByRoute = new Map()
  for (const filePath of htmlFiles) {
    const relative = path.relative(distDir, filePath)
    const html = await readFile(filePath, 'utf8')

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? ''
    assert.ok(title.length > 0, `Expected ${relative} to have a non-empty title`)

    const description = html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"/i)?.[1] ?? ''
    assert.ok(description.trim().length > 0, `Expected ${relative} to have a non-empty description`)

    for (const property of ['og:type', 'og:url', 'og:title', 'og:description', 'og:image', 'og:locale']) {
      const value = html.match(new RegExp(`<meta\\b[^>]*property="${property}"[^>]*content="([^"]*)"`))?.[1] ?? ''
      assert.ok(value.trim().length > 0, `Expected ${relative} to expose ${property}`)
    }

    // og:image 必须是位图：OG 消费平台不渲染 SVG
    const ogImage = html.match(/<meta\b[^>]*property="og:image"[^>]*content="([^"]*)"/)?.[1] ?? ''
    assert.equal(ogImage.endsWith('.svg'), false, `Expected ${relative} og:image to be a bitmap`)

    const twitterCard = html.match(/<meta\b[^>]*property="twitter:card"[^>]*content="([^"]*)"/)?.[1] ?? ''
    assert.ok(twitterCard.trim().length > 0, `Expected ${relative} to expose twitter:card`)

    assert.ok(extractCanonicalUrl(html), `Expected ${relative} to include a canonical URL`)

    descriptionsByRoute.set(relative.split(path.sep).join('/'), description)
  }

  // 工具矩阵 7 页各自独立 description（SEO 去重）
  const toolDescriptions = [...descriptionsByRoute].filter(([route]) => route.startsWith('tools/'))
  assert.equal(toolDescriptions.length, 7)
  assert.equal(
    new Set(toolDescriptions.map(([, description]) => description)).size,
    7,
    'Expected each tool page to have its own description'
  )

  // PayPal 回跳页不进索引（robots meta noindex + sitemap/robots 排除在既有测试覆盖）
  for (const route of ['paypal/cancel/index.html', 'paypal/success/index.html']) {
    const html = await readFile(path.join(distDir, route), 'utf8')
    assert.match(
      extractRobotsMeta(html),
      /noindex/i,
      `Expected ${route} to be noindex`
    )
  }

  const cancelHtml = await readFile(path.join(distDir, 'paypal/cancel/index.html'), 'utf8')
  assert.match(cancelHtml, /<title>Payment canceled \| MapsGrab<\/title>/)
  assert.match(
    cancelHtml,
    /<meta name="description" content="Your PayPal payment was canceled\."\s*\/?>/
  )
  assert.match(
    cancelHtml,
    /<meta property="og:description" content="Your PayPal payment was canceled\."\s*\/?>/
  )
  assert.match(cancelHtml, /This order was not paid\./)

  const homeHtml = await readFile(path.join(distDir, 'index.html'), 'utf8')
  assert.match(homeHtml, /aria-label="Language switcher"/)
  assert.match(homeHtml, /aria-label="Toggle menu"/)
  assert.match(homeHtml, /aria-label="Cancel"/)

  const mergeCsvHtml = await readFile(
    path.join(distDir, 'tools/merge-csv-files-online/index.html'),
    'utf8'
  )
  assert.match(mergeCsvHtml, /aria-label="Merged CSV preview"/)
})

test('llms.txt indexes every public content route and excludes paypal returns', async () => {
  const llms = await readFile(path.join(repoDir, 'public/llms.txt'), 'utf8')
  const publicRoutes = [
    '/',
    '/extension/',
    '/pricing/',
    '/tools/place-id-finder/',
    '/tools/review-link-generator/',
    '/tools/email-checker/',
    '/tools/lat-long-to-dms/',
    '/tools/dms-to-dd/',
    '/tools/bulk-keywords-generator/',
    '/tools/merge-csv-files-online/',
    '/about/',
    '/contact/',
    '/terms/',
    '/privacy/'
  ]

  for (const route of publicRoutes) {
    assert.ok(
      llms.includes(`https://mapsgrab.com${route}`),
      `Expected llms.txt to index ${route}`
    )
  }

  assert.equal(llms.includes('/paypal/'), false)
  assert.match(llms, /https:\/\/mapsgrab\.com\/sitemap\.xml/)
})



async function findFile(rootDir, filename) {
  const entries = await readdir(rootDir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      const matched = await findFile(fullPath, filename)
      if (matched) {
        return matched
      }
      continue
    }

    if (entry.isFile() && entry.name === filename) {
      return fullPath
    }
  }

  return null
}

async function collectFilesByExtension(rootDir, extension) {
  const entries = await readdir(rootDir, { withFileTypes: true })
  const matchedFiles = []

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      matchedFiles.push(...(await collectFilesByExtension(fullPath, extension)))
      continue
    }

    if (entry.isFile() && fullPath.endsWith(extension)) {
      matchedFiles.push(fullPath)
    }
  }

  return matchedFiles
}

async function patchCompiledBrowserModuleFiles(rootDir) {
  const jsFiles = await collectFilesByExtension(rootDir, '.js')
  for (const filePath of jsFiles) {
    let source = await readFile(filePath, 'utf8')
    source = source.replace(/from '((?:\.\.?\/)[^']+)'/g, (match, specifier) => {
      if (specifier.endsWith('.js') || specifier.endsWith('.json')) {
        return match
      }
      return `from '${specifier}.js'`
    })
    source = source.replace(/import\('((?:\.\.?\/)[^']+)'\)/g, (match, specifier) => {
      if (specifier.endsWith('.js') || specifier.endsWith('.json')) {
        return match
      }
      return `import('${specifier}.js')`
    })
    source = source.replace(/from '([^']+\.json)'/g, "from '$1' with { type: 'json' }")
    source = source.replace(
      /import\.meta\.env\.PUBLIC_GOOGLE_CLIENT_ID/g,
      "'pricing-google-client-id'"
    )
    source = source.replace(
      /import\.meta\.env\.PUBLIC_API_BASE_URL/g,
      "'https://api-mapsgrab.example.com/'"
    )
    source = source.replace(
      /import\.meta\.env\.PUBLIC_SHARED_COOKIE_DOMAIN/g,
      "'mapsgrab.com'"
    )
    source = source.replace(/import\.meta\.env\.PUBLIC_ALI_SLS_PROJECT/g, "'mapsgrab'")
    source = source.replace(/import\.meta\.env\.PUBLIC_ALI_SLS_HOST/g, "'ap-southeast-1.log.aliyuncs.com'")
    source = source.replace(/import\.meta\.env\.PUBLIC_ALI_SLS_ENDPOINT/g, "''")
    source = source.replace(/import\.meta\.env\.PUBLIC_ALI_SLS_LOGSTORE/g, "'mapsgrab-mark-log'")
    source = source.replace(/import\.meta\.env\.PUBLIC_ALI_SLS_ENABLED/g, "''")
    source = source.replace(/import\.meta\.env\.PUBLIC_ALI_SLS_TOPIC/g, "'mark-log'")
    source = source.replace(/import\.meta\.env\.PUBLIC_ALI_SLS_SOURCE/g, "''")
    await writeFile(filePath, source)
  }
}

function installLocalStorage() {
  const values = new Map()
  globalThis.window = {
    localStorage: {
      getItem(key) {
        return values.has(key) ? values.get(key) : null
      },
      setItem(key, value) {
        values.set(key, String(value))
      },
      removeItem(key) {
        values.delete(key)
      }
    }
  }

  return values
}


async function importHomepageApiModule() {
  const tempDir = await createTempDir('homepage-api-')
  await execFileAsync(
    'pnpm',
    [
      'exec',
      'tsc',
      'src/scripts/homepage/api.ts',
      '--target',
      'ES2022',
      '--module',
      'ES2022',
      '--moduleResolution',
      'Bundler',
      '--types',
      'astro/client',
      '--outDir',
      tempDir,
      '--skipLibCheck'
    ],
    { cwd: repoDir }
  )

  const compiledFile = await findFile(tempDir, 'api.js')
  assert.ok(compiledFile, 'Expected api.ts to compile to api.js')
  await patchCompiledBrowserModuleFiles(tempDir)
  const module = await import(`${pathToFileURL(compiledFile).href}?cache=${Date.now()}`)
  return {
    module,
    cleanup: async () => {
      await rm(tempDir, { recursive: true, force: true })
    }
  }
}

async function importHomepageMarkModule() {
  const tempDir = await createTempDir('homepage-mark-')
  await execFileAsync(
    'pnpm',
    [
      'exec',
      'tsc',
      'src/scripts/homepage/mark.ts',
      '--target',
      'ES2022',
      '--module',
      'ES2022',
      '--moduleResolution',
      'Bundler',
      '--types',
      'astro/client',
      '--outDir',
      tempDir,
      '--skipLibCheck'
    ],
    { cwd: repoDir }
  )

  const markFile = await findFile(tempDir, 'mark.js')
  const apiFile = await findFile(tempDir, 'api.js')
  assert.ok(markFile, 'Expected mark.ts to compile to mark.js')
  assert.ok(apiFile, 'Expected mark.ts dependency api.ts to compile to api.js')
  await patchCompiledBrowserModuleFiles(tempDir)
  const module = await import(`${pathToFileURL(markFile).href}?cache=${Date.now()}`)
  const apiModule = await import(pathToFileURL(apiFile).href)
  return {
    module,
    apiModule,
    cleanup: async () => {
      await rm(tempDir, { recursive: true, force: true })
    }
  }
}

async function importSharedHomepageMarkModule() {
  return importCompiledTypescriptModule(
    path.resolve(repoDir, 'src/scripts/homepage/mark.ts'),
    'mark.js',
    'shared-homepage-mark-'
  )
}

async function importHomepageSlsMarkModule(sourceFile, tempPrefix) {
  return importCompiledTypescriptModule(sourceFile, 'sls-mark.js', tempPrefix)
}

async function importFrontendErrorCaptureModule(sourceFile, tempPrefix) {
  return importCompiledTypescriptModule(sourceFile, 'frontend-error-capture.js', tempPrefix)
}

async function importGlobalClickEventsModule() {
  const tempDir = await createTempDir('global-click-events-')
  await execFileAsync(
    'pnpm',
    [
      'exec',
      'tsc',
      'src/scripts/globalClickEvents.ts',
      '--target',
      'ES2022',
      '--module',
      'ES2022',
      '--moduleResolution',
      'Bundler',
      '--types',
      'astro/client',
      '--outDir',
      tempDir,
      '--skipLibCheck'
    ],
    { cwd: repoDir }
  )

  const compiledFile = await findFile(tempDir, 'globalClickEvents.js')
  assert.ok(compiledFile, 'Expected globalClickEvents.ts to compile to globalClickEvents.js')
  await patchCompiledBrowserModuleFiles(tempDir)
  await import(`${pathToFileURL(compiledFile).href}?cache=${Date.now()}`)
  return {
    cleanup: async () => {
      await rm(tempDir, { recursive: true, force: true })
    }
  }
}

async function importHomepageMarkSanitizerModule() {
  return importCompiledTypescriptModule(
    'src/scripts/homepage/mark-sanitizer.ts',
    'mark-sanitizer.js',
    'homepage-mark-sanitizer-'
  )
}


async function importSharedDeviceModule() {
  return importCompiledTypescriptModule(
    path.resolve(repoDir, 'src/scripts/homepage/device.ts'),
    'device.js',
    'shared-device-'
  )
}

async function importSharedFirstOpenedMarkModule() {
  const imported = await importCompiledTypescriptModule(
    path.resolve(repoDir, 'src/scripts/homepage/first-opened-mark.ts'),
    'first-opened-mark.js',
    'shared-first-opened-mark-'
  )
  const deviceFile = await findFile(imported.tempDir, 'device.js')
  assert.ok(deviceFile, 'Expected first-opened-mark.ts dependency device.ts to compile to device.js')
  const deviceModule = await import(pathToFileURL(deviceFile).href)

  return {
    ...imported,
    deviceModule
  }
}


async function importCompiledTypescriptModule(sourceFile, compiledFilename, tempPrefix) {
  const tempDir = await createTempDir(tempPrefix)
  await execFileAsync(
    'pnpm',
    [
      'exec',
      'tsc',
      sourceFile,
      '--target',
      'ES2022',
      '--module',
      'ES2022',
      '--moduleResolution',
      'Bundler',
      '--types',
      'astro/client',
      '--outDir',
      tempDir,
      '--skipLibCheck'
    ],
    { cwd: repoDir }
  )

  const compiledFile = await findFile(tempDir, compiledFilename)
  assert.ok(compiledFile, `Expected ${sourceFile} to compile to ${compiledFilename}`)
  await patchCompiledBrowserModuleFiles(tempDir)
  const module = await import(`${pathToFileURL(compiledFile).href}?cache=${Date.now()}`)
  return {
    module,
    tempDir,
    cleanup: async () => {
      await rm(tempDir, { recursive: true, force: true })
    }
  }
}

async function importPricingPageControllerModule() {
  const tempDir = await createTempDir('pricing-page-loader-')
  const sourceFile = path.resolve(
    repoDir,
    'src/components/pricing/pricing-page-controller.ts'
  )
  const confirmSource = path.resolve(repoDir, 'src/scripts/site/confirm.ts')
  const tsconfigPath = path.join(tempDir, 'tsconfig.json')
  await writeFile(
    tsconfigPath,
    JSON.stringify({
      extends: path.join(repoDir, 'tsconfig.json'),
      compilerOptions: {
        outDir: tempDir,
        noEmit: false,
        allowImportingTsExtensions: false,
        types: []
      },
      files: [sourceFile, confirmSource]
    })
  )
  await execFileAsync('pnpm', ['exec', 'tsc', '--project', tsconfigPath], { cwd: repoDir })

  const compiledFile = await findFile(tempDir, 'pricing-page-controller.js')
  assert.ok(compiledFile, 'Expected pricing-page-controller.ts to compile to pricing-page-controller.js')
  await patchCompiledBrowserModuleFiles(tempDir)
  const module = await import(`${pathToFileURL(compiledFile).href}?cache=${Date.now()}`)
  return {
    module,
    cleanup: async () => {
      await rm(tempDir, { recursive: true, force: true })
    }
  }
}

async function importHomepageAuthModule(sourceFile, tempPrefix) {
  return importCompiledTypescriptModule(sourceFile, 'auth.js', tempPrefix)
}

async function importPayPalReturnModule() {
  return importCompiledTypescriptModule(
    path.resolve(repoDir, 'src/components/credit-purchase/paypal-return.ts'),
    'paypal-return.js',
    'paypal-return-'
  )
}

async function importSiteToastModule(tempPrefix) {
  return importCompiledTypescriptModule(
    'src/scripts/site/toast.ts',
    'toast.js',
    tempPrefix
  )
}

async function importSiteConfirmModule(tempPrefix) {
  return importCompiledTypescriptModule(
    'src/scripts/site/confirm.ts',
    'confirm.js',
    tempPrefix
  )
}

function installGoogleScriptDom() {
  const scripts = []
  const storageValues = new Map()
  const assignedLocations = []

  class FakeScriptElement {
    constructor() {
      this.async = false
      this.defer = false
      this.removed = false
      this.src = ''
      this.listeners = new Map()
    }

    addEventListener(type, listener, options = {}) {
      const listeners = this.listeners.get(type) ?? []
      listeners.push({
        listener,
        once: Boolean(options.once)
      })
      this.listeners.set(type, listeners)
    }

    dispatch(type) {
      const listeners = [...(this.listeners.get(type) ?? [])]
      for (const item of listeners) {
        item.listener({ type, target: this })
      }
      this.listeners.set(
        type,
        (this.listeners.get(type) ?? []).filter(item => !item.once)
      )
    }

    remove() {
      this.removed = true
    }
  }

  class FakeDomElement {
    constructor(tagName) {
      this.tagName = tagName
      this.type = ''
      this.className = ''
      this.dataset = {}
      this.disabled = false
      this.textContent = ''
      this.children = []
      this.listeners = new Map()
      this.attributes = new Map()
    }

    append(...children) {
      this.children.push(...children)
    }

    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? []
      listeners.push(listener)
      this.listeners.set(type, listeners)
    }

    dispatch(type) {
      for (const listener of this.listeners.get(type) ?? []) {
        listener({ target: this })
      }
    }

    click() {
      this.dispatch('click')
    }

    setAttribute(name, value) {
      this.attributes.set(name, String(value))
    }

    getAttribute(name) {
      return this.attributes.get(name) ?? null
    }

    querySelector(selector) {
      if (selector !== '[data-google-oauth-button-label]') {
        return null
      }
      return this.children.find(child => child.dataset?.googleOauthButtonLabel === 'true') ?? null
    }
  }

  globalThis.window = {
    localStorage: {
      getItem(key) {
        return storageValues.has(key) ? storageValues.get(key) : null
      },
      setItem(key, value) {
        storageValues.set(key, String(value))
      },
      removeItem(key) {
        storageValues.delete(key)
      }
    },
    setTimeout: () => 1,
    clearTimeout: () => {},
    location: Object.assign(new URL('https://mapsgrab.com/'), {
      assign(url) {
        assignedLocations.push(String(url))
      }
    }),
    history: {
      state: null,
      replaceState() {}
    }
  }
  globalThis.document = {
    documentElement: { lang: 'en-US' },
    createElement(tagName) {
      if (tagName === 'script') {
        return new FakeScriptElement()
      }
      return new FakeDomElement(tagName)
    },
    head: {
      append(script) {
        scripts.push(script)
      }
    },
    querySelector(selector) {
      const srcMatch = selector.match(/^script\[src="(.+)"\]$/)
      if (!srcMatch) {
        return null
      }
      return scripts.find(script => !script.removed && script.src === srcMatch[1]) ?? null
    }
  }

  return {
    scripts,
    storageValues,
    assignedLocations,
    cleanup: () => {
      delete globalThis.document
      delete globalThis.window
    }
  }
}

function installPromptingGoogleIdentity() {
  let initializeCount = 0
  let promptCount = 0
  let initializeConfig = null

  globalThis.window.google = {
    accounts: {
      id: {
        cancel() {},
        initialize(config) {
          initializeCount += 1
          initializeConfig = config
        },
        prompt(listener) {
          promptCount += 1
          queueMicrotask(() => {
            listener?.({
              isDismissedMoment: () => true,
              getDismissedReason: () => 'credential_returned'
            })
          })
        }
      }
    }
  }

  return {
    get initializeCount() {
      return initializeCount
    },
    get promptCount() {
      return promptCount
    },
    get initializeConfig() {
      return initializeConfig
    }
  }
}

function installGoogleRedirectDom(
  href = 'https://mapsgrab.com/pricing/?plan=month&google_login_code=old'
) {
  const dom = installGoogleScriptDom()
  const locationUrl = new URL(href)
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  let replacedUrl = ''
  const createLocation = url =>
    Object.assign(new URL(url), {
      assign(nextUrl) {
        dom.assignedLocations.push(String(nextUrl))
      }
    })

  globalThis.window.location = createLocation(locationUrl.toString())
  globalThis.window.history = {
    state: { source: 'test' },
    replaceState(_state, _title, url) {
      replacedUrl = String(url)
      globalThis.window.location = createLocation(replacedUrl)
    }
  }
  globalThis.document.documentElement = { lang: 'en-US' }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language: 'en-US' }
  })

  return {
    scripts: dom.scripts,
    assignedLocations: dom.assignedLocations,
    get replacedUrl() {
      return replacedUrl
    },
    cleanup: () => {
      dom.cleanup()
      if (previousNavigator) {
        Object.defineProperty(globalThis, 'navigator', previousNavigator)
        return
      }
      delete globalThis.navigator
    }
  }
}

async function assertGoogleScriptLoadRetriesAfterError(sourceFile, tempPrefix) {
  const { module, cleanup } = await importHomepageAuthModule(sourceFile, tempPrefix)
  const dom = installGoogleScriptDom()

  try {
    const firstRequest = module.requestGoogleRedirectPrompt('client-id', GOOGLE_TEST_REQUEST_CONTEXT)
    const concurrentRequest = module.requestGoogleRedirectPrompt('client-id', GOOGLE_TEST_REQUEST_CONTEXT)
    assert.equal(dom.scripts.length, 1)

    dom.scripts[0].dispatch('error')

    await assert.rejects(firstRequest, /Failed to load Google Identity Services/)
    await assert.rejects(concurrentRequest, /Failed to load Google Identity Services/)
    assert.equal(dom.scripts[0].removed, true)

    const retryRequest = module.requestGoogleRedirectPrompt('client-id', GOOGLE_TEST_REQUEST_CONTEXT)
    assert.equal(dom.scripts.length, 2)
    const googleIdentity = installPromptingGoogleIdentity()
    dom.scripts[1].dispatch('load')

    await retryRequest
    assert.equal(googleIdentity.initializeCount, 1)
    assert.equal(googleIdentity.promptCount, 1)
    assert.equal(typeof googleIdentity.initializeConfig.callback, 'function')
  } finally {
    dom.cleanup()
    await cleanup()
  }
}

async function assertGoogleIdentityInitializesOnce(sourceFile, tempPrefix) {
  const { module, cleanup } = await importHomepageAuthModule(sourceFile, tempPrefix)
  const dom = installGoogleScriptDom()

  try {
    const firstRequest = module.requestGoogleRedirectPrompt('client-id', GOOGLE_TEST_REQUEST_CONTEXT)
    assert.equal(dom.scripts.length, 1)

    const googleIdentity = installPromptingGoogleIdentity()
    dom.scripts[0].dispatch('load')

    await firstRequest
    assert.equal(googleIdentity.initializeCount, 1)
    assert.equal(googleIdentity.promptCount, 1)
    assert.equal(typeof googleIdentity.initializeConfig.callback, 'function')
    assert.equal(googleIdentity.initializeConfig.state_cookie_domain, undefined)

    await module.requestGoogleRedirectPrompt('client-id', GOOGLE_TEST_REQUEST_CONTEXT)
    assert.equal(googleIdentity.initializeCount, 1)
    assert.equal(googleIdentity.promptCount, 2)
  } finally {
    dom.cleanup()
    await cleanup()
  }
}

async function assertGoogleRedirectButtonUsesOAuthAuthorize(sourceFile, tempPrefix) {
  const { module, cleanup } = await importHomepageAuthModule(sourceFile, tempPrefix)
  const dom = installGoogleRedirectDom()

  try {
    const container = {
      textContent: 'loading',
      children: [],
      attributes: new Map([['aria-label', 'Continue with Google']]),
      append(...children) {
        this.children.push(...children)
      },
      getAttribute(name) {
        return this.attributes.get(name) ?? null
      }
    }
    module.renderGoogleRedirectButton(container, 'client-id', {
      source: 'test_redirect_button'
    })

    assert.equal(dom.scripts.length, 0)
    assert.equal(container.textContent, '')
    assert.equal(container.children.length, 1)
    assert.equal(container.children[0].dataset.googleOauthButton, 'true')
    assert.equal(container.children[0].children[0].className, 'google-oauth-button-icon')
    assert.match(container.children[0].children[0].innerHTML, /viewBox="12 10 20 20"/)
    assert.match(container.children[0].children[0].innerHTML, /fill="#4285F4"/)

    container.children[0].click()

    assert.equal(container.children[0].disabled, true)
    assert.equal(dom.assignedLocations.length, 1)

    const authorizeUrl = new URL(dom.assignedLocations[0])
    assert.equal(authorizeUrl.origin, 'https://api-mapsgrab.example.com')
    assert.equal(authorizeUrl.pathname, '/api/client/auth/google/oauth/authorize')
    assert.equal(
      authorizeUrl.searchParams.get('return_to'),
      'https://mapsgrab.com/pricing/?plan=month'
    )
  } finally {
    dom.cleanup()
    await cleanup()
  }
}

async function assertGoogleOneTapCallbackPostsCredential(sourceFile, tempPrefix) {
  const { module, cleanup } = await importHomepageAuthModule(sourceFile, tempPrefix)
  const dom = installGoogleScriptDom()
  const previousFetch = globalThis.fetch
  const fetchCalls = []
  let receivedLoginResponse = null

  globalThis.fetch = async (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    fetchCalls.push({
      path: parsedUrl.pathname,
      method: init.method ?? 'GET',
      body: init.body ? JSON.parse(String(init.body)) : null
    })
    return new Response(
      JSON.stringify({
        code: 10000,
        data: {
          access_token: 'one-tap-access-token',
          refresh_token: 'one-tap-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            user_id: 11,
            email: 'one-tap@example.com',
            avatar_url: 'https://cdn.example.test/one-tap.png',
          }
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  try {
    const promptRequest = module.requestGoogleRedirectPrompt(
      'client-id',
      GOOGLE_TEST_REQUEST_CONTEXT,
      {
        source: 'test_one_tap',
        onCredentialLogin(response) {
          receivedLoginResponse = response
        }
      }
    )
    assert.equal(dom.scripts.length, 1)

    const googleIdentity = installPromptingGoogleIdentity()
    dom.scripts[0].dispatch('load')
    await promptRequest

    googleIdentity.initializeConfig.callback({
      credential: 'fake-google-id-token',
      select_by: 'user_1tap'
    })
    await flushBrowserTasks()

    assert.deepEqual(fetchCalls, [
      {
        path: '/api/client/auth/google-login',
        method: 'POST',
        body: {
          credential: 'fake-google-id-token'
        }
      }
    ])
    assert.equal(receivedLoginResponse?.access_token, 'one-tap-access-token')
    assert.equal(dom.storageValues.get('homepage_access_token'), 'one-tap-access-token')
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    dom.cleanup()
    await cleanup()
  }
}

async function assertGoogleRedirectResultCanBeCleared(sourceFile, tempPrefix) {
  const { module, cleanup } = await importHomepageAuthModule(sourceFile, tempPrefix)
  const dom = installGoogleRedirectDom(
    'https://mapsgrab.com/pricing/?plan=month&google_login_code=code-1&google_login_error=bad&google_email_verification=user%40example.com'
  )

  try {
    assert.deepEqual(module.readGoogleRedirectResult(), {
      code: 'code-1',
      emailVerificationEmail: 'user@example.com',
      error: 'bad'
    })

    module.clearGoogleRedirectResult()
    assert.equal(dom.replacedUrl, 'https://mapsgrab.com/pricing/?plan=month')
  } finally {
    dom.cleanup()
    await cleanup()
  }
}

async function assertStoredTokenWritesPersistAccessToken(sourceFile, tempPrefix) {
  const { module, cleanup } = await importHomepageAuthModule(sourceFile, tempPrefix)
  const dom = installGoogleScriptDom()
  const previousFetch = globalThis.fetch
  const fetchCalls = []

  globalThis.fetch = async (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    fetchCalls.push({
      path: parsedUrl.pathname,
      method: init.method ?? 'GET',
      body: init.body ? JSON.parse(String(init.body)) : null
    })
    return new Response(
      JSON.stringify({
        code: 10000,
        data: {
          access_token: parsedUrl.pathname.includes('email')
            ? 'email-access-token'
            : 'google-access-token',
          user: {
            user_id: 21,
            email: 'auth-change@example.com',
            credits_balance: 0
          }
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  try {
    module.setStoredAccessToken('direct-access-token')
    assert.equal(dom.storageValues.get('homepage_access_token'), 'direct-access-token')

    await module.loginWithEmailCode('auth-change@example.com', '123456', GOOGLE_TEST_REQUEST_CONTEXT)
    await module.exchangeGoogleLoginCode('google-code-1', GOOGLE_TEST_REQUEST_CONTEXT)

    assert.deepEqual(fetchCalls, [
      {
        path: '/api/client/auth/email-verify-login',
        method: 'POST',
        body: {
          email: 'auth-change@example.com',
          code: '123456'
        }
      },
      {
        path: '/api/client/auth/google/exchange',
        method: 'POST',
        body: {
          code: 'google-code-1'
        }
      }
    ])
    assert.equal(dom.storageValues.get('homepage_access_token'), 'google-access-token')
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    dom.cleanup()
    await cleanup()
  }
}

function installSlsBrowserGlobals({
  href = 'https://mapsgrab.com/extension/',
  language = 'zh-CN',
  userAgent = 'Mozilla/5.0 SLS test browser',
  viewport = { width: 1365, height: 768 }
} = {}) {
  const previousLocation = Object.getOwnPropertyDescriptor(globalThis, 'location')
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const previousDocument = globalThis.document
  const previousWindow = globalThis.window

  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: new URL(href)
  })
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language, userAgent }
  })
  globalThis.window = {
    innerWidth: viewport.width,
    innerHeight: viewport.height
  }
  globalThis.document = {
    documentElement: { lang: language }
  }

  return () => {
    if (previousLocation) {
      Object.defineProperty(globalThis, 'location', previousLocation)
    } else {
      delete globalThis.location
    }
    if (previousNavigator) {
      Object.defineProperty(globalThis, 'navigator', previousNavigator)
    } else {
      delete globalThis.navigator
    }
    if (previousWindow === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = previousWindow
    }
    if (previousDocument === undefined) {
      delete globalThis.document
    } else {
      globalThis.document = previousDocument
    }
  }
}

function installFirstOpenedMarkBrowserGlobals({
  href = 'https://mapsgrab.com/',
  language = 'zh-CN',
  userAgent = 'Mozilla/5.0 first opened mark test',
  viewport = { width: 1365, height: 768 },
  storageUnavailable = false,
  storageWriteFails = false,
  deviceId = '123e4567-e89b-42d3-a456-426614174111',
  firstOpenedAt,
  submittedAt
} = {}) {
  const previousLocation = Object.getOwnPropertyDescriptor(globalThis, 'location')
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const previousDocument = globalThis.document
  const previousWindow = globalThis.window
  const previousFetch = globalThis.fetch
  const storage = new Map([['homepage_device_id_v2', deviceId]])
  if (firstOpenedAt !== undefined) {
    storage.set('homepage_first_opened_at', String(firstOpenedAt))
  }
  if (submittedAt !== undefined) {
    storage.set('homepage_web_first_opened_submitted_at', String(submittedAt))
  }
  const calls = []
  const storageObject = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null
    },
    setItem(key, value) {
      if (storageWriteFails) {
        throw new Error(`localStorage.setItem failed for ${key}`)
      }
      storage.set(key, String(value))
    },
    removeItem(key) {
      storage.delete(key)
    }
  }
  const windowObject = {
    innerWidth: viewport.width,
    innerHeight: viewport.height
  }

  if (storageUnavailable) {
    Object.defineProperty(windowObject, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('localStorage unavailable for first opened mark test')
      }
    })
  } else {
    windowObject.localStorage = storageObject
  }

  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: new URL(href)
  })
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language, userAgent }
  })
  globalThis.window = windowObject
  globalThis.document = {
    documentElement: { lang: language }
  }
  globalThis.fetch = async (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    calls.push({
      href: parsedUrl.href,
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: init.method ?? 'GET',
      credentials: init.credentials,
      keepalive: init.keepalive === true,
      body: init.body ? JSON.parse(String(init.body)) : null,
      markType: parsedUrl.searchParams.get('mark_type'),
      markMsg: parsedUrl.searchParams.get('mark_msg'),
      firstOpenedAt: parsedUrl.searchParams.get('first_opened_at')
    })

    return new Response(JSON.stringify({ code: 10000, data: { recorded: true } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return {
    calls,
    storage,
    restore() {
      if (previousLocation) {
        Object.defineProperty(globalThis, 'location', previousLocation)
      } else {
        delete globalThis.location
      }
      if (previousNavigator) {
        Object.defineProperty(globalThis, 'navigator', previousNavigator)
      } else {
        delete globalThis.navigator
      }
      if (previousWindow === undefined) {
        delete globalThis.window
      } else {
        globalThis.window = previousWindow
      }
      if (previousDocument === undefined) {
        delete globalThis.document
      } else {
        globalThis.document = previousDocument
      }
      if (previousFetch === undefined) {
        delete globalThis.fetch
      } else {
        globalThis.fetch = previousFetch
      }
    }
  }
}

function installFrontendErrorBrowserGlobals({
  href = 'https://mapsgrab.com/extension/',
  language = 'zh-CN',
  userAgent = 'Mozilla/5.0 Frontend error SLS test',
  viewport = { width: 1365, height: 768 },
  deviceId = '123e4567-e89b-42d3-a456-426614174000'
} = {}) {
  const previousLocation = Object.getOwnPropertyDescriptor(globalThis, 'location')
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const previousDocument = globalThis.document
  const previousWindow = globalThis.window
  const listeners = new Map()
  const storage = new Map([['homepage_device_id_v2', deviceId]])
  const windowObject = {
    innerWidth: viewport.width,
    innerHeight: viewport.height,
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null
      },
      setItem(key, value) {
        storage.set(key, String(value))
      },
      removeItem(key) {
        storage.delete(key)
      }
    },
    addEventListener(type, listener) {
      listeners.set(type, listener)
    }
  }

  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: new URL(href)
  })
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language, userAgent }
  })
  globalThis.window = windowObject
  globalThis.document = {
    documentElement: { lang: language }
  }

  return {
    deviceId,
    listeners,
    windowObject,
    restore() {
      if (previousLocation) {
        Object.defineProperty(globalThis, 'location', previousLocation)
      } else {
        delete globalThis.location
      }
      if (previousNavigator) {
        Object.defineProperty(globalThis, 'navigator', previousNavigator)
      } else {
        delete globalThis.navigator
      }
      if (previousWindow === undefined) {
        delete globalThis.window
      } else {
        globalThis.window = previousWindow
      }
      if (previousDocument === undefined) {
        delete globalThis.document
      } else {
        globalThis.document = previousDocument
      }
    }
  }
}

function restoreGlobalProperty(name, descriptor) {
  if (descriptor) {
    Object.defineProperty(globalThis, name, descriptor)
    return
  }

  delete globalThis[name]
}

function installFooterBrandBrowser({
  href = 'https://mapsgrab.com/',
  deviceId = '01234567-89ab-4def-8123-456789abcdef'
} = {}) {
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  const cookieWrites = []
  const imageSrcAssignments = []
  const storage = new Map([
    ['homepage_device_id_v2', deviceId],
    ['homepage_device_id', 'web-device-obsolete'],
    ['homepage_legacy_device_ids', '["web-fp-v1-obsolete"]']
  ])
  const mount = {
    children: [],
    querySelector(selector) {
      if (selector !== 'img') {
        return null
      }
      return this.children.find(child => child.tagName === 'IMG') ?? null
    },
    append(child) {
      this.children.push(child)
    }
  }

  class FakeImageElement {
    constructor() {
      this.tagName = 'IMG'
      this.width = 0
      this.height = 0
      this.alt = ''
      this.decoding = ''
      this.srcValue = ''
    }

    set src(value) {
      const next = String(value)
      imageSrcAssignments.push({
        value: next,
        cookieWriteCount: cookieWrites.length
      })
      this.srcValue = next
    }

    get src() {
      return this.srcValue
    }
  }

  const documentObject = {
    querySelector(selector) {
      if (selector === '[data-footer-brand-icon]') {
        return mount
      }
      return null
    },
    createElement(tagName) {
      assert.equal(tagName, 'img')
      return new FakeImageElement()
    }
  }
  Object.defineProperty(documentObject, 'cookie', {
    configurable: true,
    get() {
      return cookieWrites.join('; ')
    },
    set(value) {
      cookieWrites.push(String(value))
    }
  })

  globalThis.window = {
    localStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null
      },
      setItem(key, value) {
        storage.set(key, String(value))
      },
      removeItem(key) {
        storage.delete(key)
      }
    },
    location: new URL(href)
  }
  globalThis.document = documentObject

  return {
    cookieWrites,
    imageSrcAssignments,
    mount,
    storage,
    restore() {
      if (previousWindow === undefined) {
        delete globalThis.window
      } else {
        globalThis.window = previousWindow
      }
      if (previousDocument === undefined) {
        delete globalThis.document
      } else {
        globalThis.document = previousDocument
      }
    }
  }
}

test('shared device builds host-only client uuid cookie attributes', async () => {
  const { module, cleanup } = await importSharedDeviceModule()

  try {
    assert.equal(module.CLIENT_UUID_COOKIE_NAME, 'client_uuid')
    assert.equal(
      module.buildClientUuidCookieString('01234567-89ab-4def-8123-456789abcdef', { protocol: 'https:' }),
      'client_uuid=01234567-89ab-4def-8123-456789abcdef; Max-Age=604800; Path=/; SameSite=Lax; Secure'
    )
    assert.equal(
      module.buildClientUuidCookieString('01234567-89ab-4def-8123-456789abcdef', { protocol: 'http:' }),
      'client_uuid=01234567-89ab-4def-8123-456789abcdef; Max-Age=604800; Path=/; SameSite=Lax'
    )
  } finally {
    await cleanup()
  }
})

test('shared device writes client uuid cookie before mounting footer brand image', async () => {
  const { module, cleanup } = await importSharedDeviceModule()
  const browser = installFooterBrandBrowser()

  try {
    await module.initializeFooterBrandIcon()

    assert.equal(browser.cookieWrites.length, 1)
    assert.equal(
      browser.cookieWrites[0],
      'client_uuid=01234567-89ab-4def-8123-456789abcdef; Max-Age=604800; Path=/; SameSite=Lax; Secure'
    )
    assert.equal(browser.mount.children.length, 1)
    assert.equal(browser.mount.children[0].width, 32)
    assert.equal(browser.mount.children[0].height, 32)
    assert.equal(browser.mount.children[0].alt, '')
    assert.equal(browser.imageSrcAssignments.length, 1)
    assert.equal(browser.imageSrcAssignments[0].cookieWriteCount, 1)
    assert.equal(browser.imageSrcAssignments[0].value, '/assets/icons/logo.svg?v=20260706')
    assert.equal(Number(browser.storage.get('homepage_first_opened_at')) > 0, true)
    assert.equal(browser.storage.has('homepage_device_id'), false)
    assert.equal(browser.storage.has('homepage_legacy_device_ids'), false)
    const firstOpenedAt = browser.storage.get('homepage_first_opened_at')

    await module.initializeFooterBrandIcon()

    assert.equal(browser.cookieWrites.length, 2)
    assert.equal(browser.mount.children.length, 1)
    assert.equal(browser.imageSrcAssignments.length, 1)
    assert.equal(browser.storage.get('homepage_first_opened_at'), firstOpenedAt)
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('website first opened mark reports once after first_opened_at is stored', async () => {
  const { module, cleanup } = await importSharedFirstOpenedMarkModule()
  const browser = installFirstOpenedMarkBrowserGlobals()

  try {
    module.initializeWebsiteFirstOpenedMark()
    await flushBrowserTasks()
    await flushBrowserTasks()

    const firstOpenedAt = Number(browser.storage.get('homepage_first_opened_at'))
    assert.equal(Number.isInteger(firstOpenedAt), true)
    assert.equal(firstOpenedAt > 0, true)
    assert.equal(browser.calls.length, 2)
    assert.equal(browser.calls[0].path, '/logstores/mapsgrab-mark-log/track')
    assert.equal(browser.calls[0].method, 'GET')
    assert.equal(browser.calls[0].credentials, 'omit')
    assert.equal(browser.calls[0].keepalive, true)
    assert.equal(browser.calls[0].markType, 'web_first_opened')
    assert.equal(browser.calls[0].markMsg, '')
    assert.equal(Number(browser.calls[0].firstOpenedAt), firstOpenedAt)
    assert.equal(browser.calls[1].path, '/api/client/mark/record')
    assert.equal(browser.calls[1].method, 'POST')
    assert.equal(browser.calls[1].keepalive, true)
    assert.equal(browser.calls[1].body.mark_type, 'web_first_opened')
    assert.equal(browser.calls[1].body.mark_msg, '')
    assert.equal(browser.calls[1].body.first_opened_at, firstOpenedAt)
    assert.equal(
      browser.storage.get(module.WEB_FIRST_OPENED_MARK_SUBMITTED_AT_STORAGE_KEY),
      String(firstOpenedAt)
    )

    module.initializeWebsiteFirstOpenedMark()
    await flushBrowserTasks()

    assert.equal(browser.calls.length, 2)
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('website first opened mark reports stored first_opened_at when submitted marker is missing', async () => {
  const { module, cleanup } = await importSharedFirstOpenedMarkModule()
  const browser = installFirstOpenedMarkBrowserGlobals({ firstOpenedAt: '1762345678901' })

  try {
    module.initializeWebsiteFirstOpenedMark()
    await flushBrowserTasks()
    await flushBrowserTasks()

    assert.equal(browser.calls.length, 2)
    assert.equal(browser.calls[0].markType, 'web_first_opened')
    assert.equal(browser.calls[0].firstOpenedAt, '1762345678901')
    assert.equal(browser.calls[1].body.mark_type, 'web_first_opened')
    assert.equal(browser.calls[1].body.first_opened_at, 1762345678901)
    assert.equal(
      browser.storage.get(module.WEB_FIRST_OPENED_MARK_SUBMITTED_AT_STORAGE_KEY),
      '1762345678901'
    )
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('website first opened mark skips after submitted marker exists', async () => {
  const { module, cleanup } = await importSharedFirstOpenedMarkModule()
  const browser = installFirstOpenedMarkBrowserGlobals({
    firstOpenedAt: '1762345678901',
    submittedAt: '1762345678901'
  })

  try {
    module.initializeWebsiteFirstOpenedMark()
    await flushBrowserTasks()

    assert.equal(browser.calls.length, 0)
    assert.equal(
      browser.storage.get(module.WEB_FIRST_OPENED_MARK_SUBMITTED_AT_STORAGE_KEY),
      '1762345678901'
    )
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('website first opened mark reports when device setup creates first_opened_at first', async () => {
  const { module, deviceModule, cleanup } = await importSharedFirstOpenedMarkModule()
  const browser = installFirstOpenedMarkBrowserGlobals()

  try {
    await deviceModule.ensureDeviceId()

    const firstOpenedAt = Number(browser.storage.get('homepage_first_opened_at'))
    assert.equal(Number.isInteger(firstOpenedAt), true)
    assert.equal(firstOpenedAt > 0, true)
    assert.equal(browser.calls.length, 0)

    module.initializeWebsiteFirstOpenedMark()
    await flushBrowserTasks()
    await flushBrowserTasks()

    assert.equal(browser.calls.length, 2)
    assert.equal(browser.calls[0].markType, 'web_first_opened')
    assert.equal(Number(browser.calls[0].firstOpenedAt), firstOpenedAt)
    assert.equal(browser.calls[1].body.mark_type, 'web_first_opened')
    assert.equal(browser.calls[1].body.first_opened_at, firstOpenedAt)
    assert.equal(
      browser.storage.get(module.WEB_FIRST_OPENED_MARK_SUBMITTED_AT_STORAGE_KEY),
      String(firstOpenedAt)
    )

    module.initializeWebsiteFirstOpenedMark()
    await flushBrowserTasks()

    assert.equal(browser.calls.length, 2)
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('website first opened mark reports storage unavailable when localStorage fails', async () => {
  const { module, cleanup } = await importSharedFirstOpenedMarkModule()
  const browser = installFirstOpenedMarkBrowserGlobals({ storageUnavailable: true })

  try {
    module.initializeWebsiteFirstOpenedMark()
    await flushBrowserTasks()
    await flushBrowserTasks()

    assert.equal(browser.calls.length, 2)
    assert.equal(browser.calls[0].markType, 'web_first_opened')
    assert.equal(browser.calls[0].markMsg, '{"reason":"localStorage_unavailable"}')
    assert.equal(Number(browser.calls[0].firstOpenedAt) > 0, true)
    assert.equal(browser.calls[1].body.mark_type, 'web_first_opened')
    assert.equal(browser.calls[1].body.mark_msg, '{"reason":"localStorage_unavailable"}')
    assert.equal(Number.isInteger(browser.calls[1].body.first_opened_at), true)
    assert.equal(browser.calls[1].body.first_opened_at > 0, true)
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('website first opened mark reports storage unavailable when localStorage write fails', async () => {
  const { module, cleanup } = await importSharedFirstOpenedMarkModule()
  const browser = installFirstOpenedMarkBrowserGlobals({ storageWriteFails: true })

  try {
    module.initializeWebsiteFirstOpenedMark()
    await flushBrowserTasks()
    await flushBrowserTasks()

    assert.equal(browser.storage.has('homepage_first_opened_at'), false)
    assert.equal(browser.calls.length, 2)
    assert.equal(browser.calls[0].markType, 'web_first_opened')
    assert.equal(browser.calls[0].markMsg, '{"reason":"localStorage_unavailable"}')
    assert.equal(browser.calls[1].body.mark_type, 'web_first_opened')
    assert.equal(browser.calls[1].body.mark_msg, '{"reason":"localStorage_unavailable"}')
    assert.equal(Number.isInteger(browser.calls[1].body.first_opened_at), true)
  } finally {
    browser.restore()
    await cleanup()
  }
})

async function assertSlsMarkBuildsWebTrackingUrl(sourceFile, tempPrefix, expectedSite, href) {
  const { module, cleanup } = await importHomepageSlsMarkModule(sourceFile, tempPrefix)
  const restoreBrowser = installSlsBrowserGlobals({
    href,
    language: 'en-SG',
    userAgent: 'Mozilla/5.0 SLS mark URL test',
    viewport: { width: 1440, height: 900 }
  })

  try {
    const config = module.getSlsMarkConfig()
    const fields = module.buildSlsMarkFields(
      'web_parse_click',
      { deviceId: 'device-for-sls-url', token: 'secret-token' },
      'hello-from-module-test'
    )
    const url = new URL(module.buildSlsMarkUrl(config, fields))

    assert.equal(config.enabled, true)
    assert.equal(url.origin, 'https://mapsgrab.ap-southeast-1.log.aliyuncs.com')
    assert.equal(url.pathname, '/logstores/mapsgrab-mark-log/track')
    assert.equal(url.searchParams.get('APIVersion'), '0.6.0')
    assert.equal(url.searchParams.get('__topic__'), 'mark-log')
    assert.equal(url.searchParams.get('__source__'), expectedSite)
    assert.equal(url.searchParams.get('event'), 'mark-log')
    assert.equal(url.searchParams.get('site'), expectedSite)
    assert.equal(url.searchParams.get('client_product'), 'web')
    assert.equal(url.searchParams.get('mark_type'), 'web_parse_click')
    assert.equal(url.searchParams.get('mark_msg'), 'hello-from-module-test')
    assert.equal(url.searchParams.get('device_id'), 'device-for-sls-url')
    assert.equal(url.searchParams.get('page_path'), new URL(href).pathname)
    assert.equal(Number(url.searchParams.get('first_opened_at')) > 0, true)
    assert.equal(url.searchParams.get('user_agent'), 'Mozilla/5.0 SLS mark URL test')
    assert.equal(url.searchParams.get('language'), 'en-SG')
    assert.equal(url.searchParams.get('viewport'), '1440x900')
    assert.equal(Array.from(url.searchParams.values()).some(value => value.includes('secret-token')), false)
  } finally {
    restoreBrowser()
    await cleanup()
  }
}

test('homepage SLS mark builds WebTracking URL for website', async () => {
  await assertSlsMarkBuildsWebTrackingUrl(
    'src/scripts/homepage/sls-mark.ts',
    'homepage-sls-mark-',
    'website',
    'https://mapsgrab.com/some-page/'
  )
  await assertSlsMarkBuildsWebTrackingUrl(
    path.resolve(repoDir, 'src/scripts/homepage/sls-mark.ts'),
    'shared-homepage-sls-mark-',
    'website',
    'https://mapsgrab.com/some-tool/'
  )
})

test('homepage SLS mark_msg strips user URL query and secret fields', async () => {
  const { module, cleanup } = await importHomepageSlsMarkModule(
    'src/scripts/homepage/sls-mark.ts',
    'homepage-sls-mark-sanitize-'
  )
  const restoreBrowser = installSlsBrowserGlobals()

  try {
    const fields = module.buildSlsMarkFields(
      'web_parse_click',
      { deviceId: 'device-for-sls-sanitize', token: null },
      JSON.stringify({
        url: 'https://t.me/c/12345/67890?token=secret-input-token&sig=secret-sig#fragment',
        access_token: 'secret-access-token',
        direct_url: 'https://cdn.example.com/private.mp4?download_token=secret-download-token'
      })
    )
    const url = new URL(module.buildSlsMarkUrl(module.getSlsMarkConfig(), fields))
    const markMsg = url.searchParams.get('mark_msg') ?? ''

    assert.equal(markMsg.includes('?token='), false)
    assert.equal(markMsg.includes('secret-input-token'), false)
    assert.equal(markMsg.includes('secret-sig'), false)
    assert.equal(markMsg.includes('secret-access-token'), false)
    assert.equal(markMsg.includes('secret-download-token'), false)
    assert.equal(markMsg.includes('download_token'), false)
    assert.match(markMsg, /https:\/\/t\.me\/c\/12345\/67890/)
    assert.match(markMsg, /"access_token":"\[redacted\]"/)
    assert.match(markMsg, /"direct_url":"\[redacted\]"/)
  } finally {
    restoreBrowser()
    await cleanup()
  }
})

test('homepage SLS plain mark_msg does not report a JSON parse error', async () => {
  const { module, cleanup } = await importHomepageSlsMarkModule(
    'src/scripts/homepage/sls-mark.ts',
    'homepage-sls-mark-plain-'
  )
  const restoreBrowser = installSlsBrowserGlobals()
  const previousConsoleError = console.error
  const errors = []
  console.error = (...args) => errors.push(args)

  try {
    const context = { deviceId: 'device-for-sls-plain', token: null }
    assert.equal(module.buildSlsMarkFields('empty', context, '').mark_msg, '')
    assert.equal(module.buildSlsMarkFields('plain', context, 'plain text').mark_msg, 'plain text')
    assert.equal(errors.length, 0)

    const malformed = module.buildSlsMarkFields(
      'malformed',
      context,
      '{"token":"TOPSECRET"'
    ).mark_msg
    assert.equal(errors.length, 1)
    assert.equal(errors[0].length, 2)
    assert.deepEqual(errors[0][1], { markMsg: '[redacted]', errorName: 'SyntaxError' })
    assert.doesNotMatch(malformed, /TOPSECRET/)
    assert.doesNotMatch(
      errors[0].map(value => value instanceof Error ? String(value) : JSON.stringify(value)).join(' '),
      /TOPSECRET/
    )
  } finally {
    console.error = previousConsoleError
    restoreBrowser()
    await cleanup()
  }
})

test('homepage SLS keeps oversized structured mark_msg as valid JSON', async () => {
  const { module, cleanup } = await importHomepageSlsMarkModule(
    'src/scripts/homepage/sls-mark.ts',
    'homepage-sls-mark-json-limit-'
  )
  const restoreBrowser = installSlsBrowserGlobals()

  try {
    const fields = module.buildSlsMarkFields(
      'web_download_storage_preflight_blocked',
      { deviceId: 'device-for-sls-json-limit', token: null },
      JSON.stringify({ message: 'x'.repeat(1100) })
    )

    assert.deepEqual(JSON.parse(fields.mark_msg), {
      reason: 'mark_msg_exceeded_sls_limit'
    })

    const headerLikeFields = module.buildSlsMarkFields(
      'web_download_storage_preflight_blocked',
      { deviceId: 'device-for-sls-json-sanitize', token: null },
      JSON.stringify({ message: `authorization: Bearer ${'x'.repeat(1050)}` })
    )
    const headerLikePayload = JSON.parse(headerLikeFields.mark_msg)
    assert.equal(headerLikePayload.message, 'authorization=[redacted]')
    assert.equal(headerLikeFields.mark_msg.includes('x'.repeat(100)), false)
  } finally {
    restoreBrowser()
    await cleanup()
  }
})

test('frontend error capture dispatches uncaught Error to callback', async () => {
  const { module, cleanup } = await importFrontendErrorCaptureModule(
    'src/scripts/homepage/frontend-error-capture.ts',
    'frontend-error-capture-'
  )
  const browser = installFrontendErrorBrowserGlobals()
  const capturedErrors = []

  try {
    module.installFrontendErrorCapture(capturedError => {
      capturedErrors.push(capturedError)
    })
    const listener = browser.listeners.get('error')
    assert.equal(typeof listener, 'function')

    listener({
      target: browser.windowObject,
      error: new TypeError('Boom token=secret-token'),
      message: 'Boom token=secret-token',
      filename: 'https://mapsgrab.com/assets/app.js?token=secret-token',
      lineno: 12,
      colno: 34
    })

    assert.equal(capturedErrors.length, 1)
    assert.equal(capturedErrors[0].errorKind, 'error_event')
    assert.equal(capturedErrors[0].errorName, 'TypeError')
    assert.equal(capturedErrors[0].errorMessage, 'Boom token=secret-token')
    assert.equal(capturedErrors[0].pagePath, '/extension/')
    assert.equal(capturedErrors[0].sourceFile, 'https://mapsgrab.com/assets/app.js?token=secret-token')
    assert.equal(capturedErrors[0].line, 12)
    assert.equal(capturedErrors[0].column, 34)
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('frontend captured error SLS callback sends uncaught Error to SLS only', async () => {
  const { module, cleanup } = await importHomepageSlsMarkModule(
    'src/scripts/homepage/sls-mark.ts',
    'frontend-captured-error-sls-'
  )
  const browser = installFrontendErrorBrowserGlobals()
  const previousFetch = globalThis.fetch
  const calls = []

  globalThis.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method ?? 'GET',
      body: init.body ? String(init.body) : ''
    })
    return new Response('', { status: 200 })
  }

  try {
    module.reportFrontendCapturedErrorToSls({
      errorKind: 'error_event',
      errorName: 'TypeError',
      errorMessage: 'Boom token=secret-token',
      pagePath: '/extension/',
      sourceFile: 'https://mapsgrab.com/assets/app.js?token=secret-token',
      line: 12,
      column: 34
    })
    await flushBrowserTasks()

    assert.equal(calls.length, 1)
    const url = new URL(calls[0].url)
    assert.equal(url.pathname, '/logstores/mapsgrab-mark-log/track')
    assert.equal(url.searchParams.get('mark_type'), 'web_frontend_uncaught_error')
    assert.equal(url.searchParams.get('device_id'), browser.deviceId)
    assert.equal(calls.some(call => new URL(call.url).pathname === '/api/client/mark/record'), false)

    const markMsg = JSON.parse(url.searchParams.get('mark_msg') ?? '{}')
    assert.equal(markMsg.error_kind, 'error_event')
    assert.equal(markMsg.error_name, 'TypeError')
    assert.equal(markMsg.error_message.includes('secret-token'), false)
    assert.equal(markMsg.source_file, 'https://mapsgrab.com/assets/app.js')
    assert.equal(markMsg.line, 12)
    assert.equal(markMsg.column, 34)
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    browser.restore()
    await cleanup()
  }
})

test('shared frontend error capture dispatches unhandled rejection to callback', async () => {
  const { module, cleanup } = await importFrontendErrorCaptureModule(
    path.resolve(repoDir, 'src/scripts/homepage/frontend-error-capture.ts'),
    'shared-frontend-error-capture-'
  )
  const browser = installFrontendErrorBrowserGlobals({
    href: 'https://mapsgrab.com/some-tool/'
  })
  const capturedErrors = []

  try {
    module.installFrontendErrorCapture(capturedError => {
      capturedErrors.push(capturedError)
    })
    const listener = browser.listeners.get('unhandledrejection')
    assert.equal(typeof listener, 'function')

    listener({
      target: browser.windowObject,
      reason: new Error('Async failed with access_token=secret-token')
    })

    assert.equal(capturedErrors.length, 1)
    assert.equal(capturedErrors[0].errorKind, 'unhandled_rejection')
    assert.equal(capturedErrors[0].errorName, 'Error')
    assert.equal(capturedErrors[0].errorMessage, 'Async failed with access_token=secret-token')
    assert.equal(capturedErrors[0].pagePath, '/some-tool/')
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('shared frontend captured error SLS callback reports website site', async () => {
  const { module, cleanup } = await importHomepageSlsMarkModule(
    path.resolve(repoDir, 'src/scripts/homepage/sls-mark.ts'),
    'shared-frontend-captured-error-sls-'
  )
  const browser = installFrontendErrorBrowserGlobals({
    href: 'https://mapsgrab.com/some-tool/'
  })
  const previousFetch = globalThis.fetch
  const calls = []

  globalThis.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method ?? 'GET',
      body: init.body ? String(init.body) : ''
    })
    return new Response('', { status: 200 })
  }

  try {
    module.reportFrontendCapturedErrorToSls({
      errorKind: 'unhandled_rejection',
      errorName: 'Error',
      errorMessage: 'Async failed with access_token=secret-token',
      pagePath: '/some-tool/',
      sourceFile: '',
      line: 0,
      column: 0
    })
    await flushBrowserTasks()

    assert.equal(calls.length, 1)
    const url = new URL(calls[0].url)
    assert.equal(url.searchParams.get('mark_type'), 'web_frontend_uncaught_error')
    assert.equal(url.searchParams.get('site'), 'website')
    assert.equal(calls.some(call => new URL(call.url).pathname === '/api/client/mark/record'), false)

    const markMsg = JSON.parse(url.searchParams.get('mark_msg') ?? '{}')
    assert.equal(markMsg.error_kind, 'unhandled_rejection')
    assert.equal(markMsg.error_name, 'Error')
    assert.equal(markMsg.error_message.includes('secret-token'), false)
    assert.equal(markMsg.page_path, '/some-tool/')
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    browser.restore()
    await cleanup()
  }
})

test('frontend error capture ignores resource errors and deduplicates same error', async () => {
  const { module, cleanup } = await importFrontendErrorCaptureModule(
    'src/scripts/homepage/frontend-error-capture.ts',
    'frontend-error-capture-dedupe-'
  )
  const browser = installFrontendErrorBrowserGlobals()
  const capturedErrors = []

  try {
    module.installFrontendErrorCapture(capturedError => {
      capturedErrors.push(capturedError)
    })
    const listener = browser.listeners.get('error')
    assert.equal(typeof listener, 'function')

    listener({
      target: { tagName: 'IMG' },
      message: '',
      filename: '',
      lineno: 0,
      colno: 0
    })
    assert.equal(capturedErrors.length, 0)

    const event = {
      target: browser.windowObject,
      error: new Error('Same frontend failure'),
      message: 'Same frontend failure',
      filename: 'https://mapsgrab.com/assets/app.js',
      lineno: 56,
      colno: 78
    }
    listener(event)
    listener(event)

    assert.equal(capturedErrors.length, 1)
  } finally {
    browser.restore()
    await cleanup()
  }
})

test('homepage record mark keeps backend post when SLS fails', async () => {
  const { module, cleanup } = await importHomepageMarkModule()
  const restoreBrowser = installSlsBrowserGlobals()
  const previousFetch = globalThis.fetch
  const previousConsoleError = console.error
  const calls = []

  console.error = () => {}
  globalThis.fetch = async (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    calls.push({
      path: parsedUrl.pathname,
      method: init.method ?? 'GET',
      credentials: init.credentials,
      keepalive: init.keepalive === true,
      body: init.body ? JSON.parse(String(init.body)) : null
    })

    if (parsedUrl.hostname.includes('log.aliyuncs.com')) {
      return new Response('', { status: 500, statusText: 'SLS failed' })
    }

    return new Response(JSON.stringify({ code: 10000, data: { recorded: true } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    await module.recordHomepageMark(
      module.HOMEPAGE_MARK_TYPE.WEB_CREDIT_PURCHASE_BUY_CLICK,
      { deviceId: 'device-for-sls-failure', token: 'access-token' },
      'sls failure should not block backend'
    )
    await flushBrowserTasks()

    assert.equal(calls.length, 2)
    assert.equal(calls[0].path, '/logstores/mapsgrab-mark-log/track')
    assert.equal(calls[0].method, 'GET')
    assert.equal(calls[0].credentials, 'omit')
    assert.equal(calls[0].keepalive, true)
    assert.equal(calls[1].path, '/api/client/mark/record')
    assert.equal(calls[1].method, 'POST')
    assert.equal(calls[1].body.mark_type, 'web_credit_purchase_buy_click')
    assert.equal(calls[1].body.mark_msg, 'sls failure should not block backend')
    assert.equal(Number.isInteger(calls[1].body.first_opened_at), true)
    assert.equal(calls[1].body.first_opened_at > 0, true)
  } finally {
    restoreBrowser()
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    console.error = previousConsoleError
    await cleanup()
  }
})

test('homepage record mark sends SLS before backend failure is thrown', async () => {
  const { module, cleanup } = await importHomepageMarkModule()
  const restoreBrowser = installSlsBrowserGlobals()
  const previousFetch = globalThis.fetch
  const calls = []

  globalThis.fetch = async (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    calls.push({
      path: parsedUrl.pathname,
      method: init.method ?? 'GET',
      keepalive: init.keepalive === true
    })

    if (parsedUrl.hostname.includes('log.aliyuncs.com')) {
      return new Response('', { status: 200 })
    }

    return new Response(JSON.stringify({ code: 50001, msg: 'backend mark failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    await assert.rejects(
      () =>
        module.recordHomepageMark(
          module.HOMEPAGE_MARK_TYPE.WEB_EXTENSION_STORE_REVIEW_CLICK,
          { deviceId: 'device-for-backend-failure', token: null },
          'backend failure should not cancel SLS'
        ),
      /backend mark failed/
    )

    assert.deepEqual(
      calls.map(call => call.path),
      ['/logstores/mapsgrab-mark-log/track', '/api/client/mark/record']
    )
  } finally {
    restoreBrowser()
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    await cleanup()
  }
})

class FakeGlobalClickElement {
  constructor({ href = '', attributes = {} } = {}) {
    this.href = href
    this.attributes = Object.entries(attributes).map(([name, value]) => ({
      name,
      value
    }))
    this.attributeMap = new Map(Object.entries(attributes))
  }

  getAttribute(name) {
    return this.attributeMap.get(name) ?? null
  }

  closest(selector) {
    if (selector === 'a[href]' && this.href) {
      return this
    }
    if (selector === '[data-ga-event]' && this.attributeMap.has('data-ga-event')) {
      return this
    }
    return null
  }
}

test('global install CTA click sends SLS and keepalive mark', async () => {
  const previous = {
    document: globalThis.document,
    window: globalThis.window,
    Element: globalThis.Element,
    HTMLElement: globalThis.HTMLElement,
    HTMLAnchorElement: globalThis.HTMLAnchorElement,
    location: Object.getOwnPropertyDescriptor(globalThis, 'location'),
    navigator: Object.getOwnPropertyDescriptor(globalThis, 'navigator'),
    fetch: globalThis.fetch
  }
  const clickListeners = []
  const fetchCalls = []
  const localStorageValues = new Map([
    ['homepage_device_id_v2', '123e4567-e89b-42d3-a456-426614174000'],
    ['homepage_first_opened_at', '1762345678901'],
    ['homepage_access_token', 'install-click-token']
  ])

  globalThis.Element = FakeGlobalClickElement
  globalThis.HTMLElement = FakeGlobalClickElement
  globalThis.HTMLAnchorElement = FakeGlobalClickElement
  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: new URL('https://mapsgrab.com/')
  })
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      language: 'en-US',
      userAgent: 'Mozilla/5.0 install CTA test'
    }
  })
  globalThis.window = {
    innerWidth: 390,
    innerHeight: 844,
    localStorage: {
      getItem(key) {
        return localStorageValues.get(key) ?? null
      },
      setItem(key, value) {
        localStorageValues.set(key, String(value))
      },
      removeItem(key) {
        localStorageValues.delete(key)
      }
    }
  }
  globalThis.document = {
    title: 'MapsGrab',
    documentElement: { lang: 'en-US' },
    addEventListener(type, listener) {
      if (type === 'click') {
        clickListeners.push(listener)
      }
    }
  }
  globalThis.fetch = async (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    fetchCalls.push({
      href: parsedUrl.href,
      path: parsedUrl.pathname,
      method: init.method ?? 'GET',
      keepalive: init.keepalive === true,
      credentials: init.credentials,
      body: init.body ? JSON.parse(String(init.body)) : null
    })
    return new Response(JSON.stringify({ code: 10000, data: { recorded: true } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const importedModule = await importGlobalClickEventsModule()

  try {
    const target = new FakeGlobalClickElement({
      href: 'https://chromewebstore.google.com/detail/mapsgrab/example',
      attributes: {
        'data-ga-event': 'chrome_web_store_click',
        'data-ga-source': 'hero_install'
      }
    })
    // 两个 click 委派：data-ga-event 业务事件 + data-cta 漏斗事件（W6 cta_click）
    assert.equal(clickListeners.length, 2)
    clickListeners[0]({ target })
    await flushBrowserTasks()
    await flushBrowserTasks()

    assert.equal(fetchCalls.length, 2)
    assert.equal(new URL(fetchCalls[0].href).hostname, 'mapsgrab.ap-southeast-1.log.aliyuncs.com')
    assert.equal(fetchCalls[0].path, '/logstores/mapsgrab-mark-log/track')
    assert.equal(fetchCalls[0].credentials, 'omit')
    assert.equal(fetchCalls[0].keepalive, true)
    assert.equal(new URL(fetchCalls[0].href).searchParams.get('mark_type'), 'web_extension_install_click')
    assert.equal(new URL(fetchCalls[0].href).searchParams.get('user_agent'), 'Mozilla/5.0 install CTA test')
    assert.equal(new URL(fetchCalls[0].href).searchParams.get('first_opened_at'), '1762345678901')
    assert.equal(fetchCalls[1].path, '/api/client/mark/record')
    assert.equal(fetchCalls[1].method, 'POST')
    assert.equal(fetchCalls[1].keepalive, true)
    assert.equal(fetchCalls[1].body.mark_type, 'web_extension_install_click')
    assert.equal(fetchCalls[1].body.first_opened_at, 1762345678901)
  } finally {
    await importedModule.cleanup()
    if (previous.document === undefined) {
      delete globalThis.document
    } else {
      globalThis.document = previous.document
    }
    if (previous.window === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = previous.window
    }
    if (previous.Element === undefined) {
      delete globalThis.Element
    } else {
      globalThis.Element = previous.Element
    }
    if (previous.HTMLElement === undefined) {
      delete globalThis.HTMLElement
    } else {
      globalThis.HTMLElement = previous.HTMLElement
    }
    if (previous.HTMLAnchorElement === undefined) {
      delete globalThis.HTMLAnchorElement
    } else {
      globalThis.HTMLAnchorElement = previous.HTMLAnchorElement
    }
    restoreGlobalProperty('location', previous.location)
    restoreGlobalProperty('navigator', previous.navigator)
    if (previous.fetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previous.fetch
    }
  }
})

test('homepage auth failure classifier keeps token for network and server errors', async () => {
  const { module, cleanup } = await importHomepageApiModule()

  try {
    assert.equal(module.isHomepageAuthFailure(new TypeError('Failed to fetch')), false)
    assert.equal(
      module.isHomepageAuthFailure(new module.HomepageApiError('server unavailable', 503)),
      false
    )
    assert.equal(
      module.isHomepageAuthFailure(new module.HomepageApiError('token expired', 401, 10013)),
      true
    )
    assert.equal(
      module.isHomepageAuthFailure(new module.HomepageApiError('token revoked', 200, 10014)),
      false
    )
  } finally {
    await cleanup()
  }
})

test('homepage postJson wraps timeout as detailed API error', async () => {
  const { module, cleanup } = await importHomepageApiModule()
  const previousFetch = globalThis.fetch
  const previousDocument = globalThis.document
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')

  globalThis.document = { documentElement: { lang: 'en-US' } }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language: 'en-US' }
  })
  globalThis.fetch = (_url, init = {}) =>
    new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })

  try {
    await assert.rejects(
      () =>
        module.postJson(
          '/api/client/media/parse-pre-v2',
          GOOGLE_TEST_REQUEST_CONTEXT,
          { link: 'https://t.me/example/123' },
          { timeoutMs: 1 }
        ),
      (error) => {
        assert.equal(error instanceof module.HomepageApiError, true)
        assert.equal(error.code, 'REQUEST_TIMEOUT')
        assert.equal(error.status, 0)
        assert.match(error.failureReason, /api_post_failed: path=\/api\/client\/media\/parse-pre-v2/)
        assert.match(error.failureReason, /reason=REQUEST_TIMEOUT after 1ms/)
        return true
      }
    )
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    if (previousDocument === undefined) {
      delete globalThis.document
    } else {
      globalThis.document = previousDocument
    }
    if (previousNavigator) {
      Object.defineProperty(globalThis, 'navigator', previousNavigator)
    } else {
      delete globalThis.navigator
    }
    await cleanup()
  }
})

test('homepage api reports backend network failure to SLS only', async () => {
  const { module, cleanup } = await importHomepageApiModule()
  const restoreBrowser = installSlsBrowserGlobals()
  const previousFetch = globalThis.fetch
  const previousConsoleError = console.error
  const calls = []

  console.error = () => {}
  globalThis.fetch = async (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    calls.push({
      url: String(url),
      method: init.method ?? 'GET',
      body: init.body ? String(init.body) : ''
    })

    if (parsedUrl.hostname.includes('log.aliyuncs.com')) {
      return new Response('', { status: 200 })
    }

    throw new TypeError('Failed to fetch token=secret-token')
  }

  try {
    await assert.rejects(
      () =>
        module.postJson('/api/client/media/parse-pre-v2', GOOGLE_TEST_REQUEST_CONTEXT, {
          link: 'https://t.me/example/123'
        }),
      (error) => {
        assert.equal(error instanceof module.HomepageApiError, true)
        assert.equal(error.code, 'NETWORK_ERROR')
        assert.equal(error.status, 0)
        return true
      }
    )
    await flushBrowserTasks()

    const slsCalls = calls.filter(call => new URL(call.url).hostname.includes('log.aliyuncs.com'))
    assert.equal(slsCalls.length, 1)
    assert.equal(calls.some(call => new URL(call.url).pathname === '/api/client/mark/record'), false)

    const url = new URL(slsCalls[0].url)
    const markMsg = JSON.parse(url.searchParams.get('mark_msg') ?? '{}')
    assert.equal(url.searchParams.get('mark_type'), 'web_backend_connect_failed')
    assert.equal(markMsg.method, 'POST')
    assert.equal(markMsg.api_path, '/api/client/media/parse-pre-v2')
    assert.equal(markMsg.failure_reason, 'NETWORK_ERROR')
    assert.equal(markMsg.error_name, 'TypeError')
    assert.equal(markMsg.error_message.includes('secret-token'), false)
    assert.equal(markMsg.timeout_ms, null)
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    console.error = previousConsoleError
    restoreBrowser()
    await cleanup()
  }
})

test('homepage api reports backend timeout to SLS only', async () => {
  const { module, cleanup } = await importHomepageApiModule()
  const restoreBrowser = installSlsBrowserGlobals()
  const previousFetch = globalThis.fetch
  const previousConsoleError = console.error
  const calls = []

  console.error = () => {}
  globalThis.fetch = (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    calls.push({
      url: String(url),
      method: init.method ?? 'GET'
    })

    if (parsedUrl.hostname.includes('log.aliyuncs.com')) {
      return Promise.resolve(new Response('', { status: 200 }))
    }

    return new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })
  }

  try {
    await assert.rejects(
      () =>
        module.postJson(
          '/api/client/media/parse-pre-v2',
          GOOGLE_TEST_REQUEST_CONTEXT,
          { link: 'https://t.me/example/123' },
          { timeoutMs: 1 }
        ),
      (error) => {
        assert.equal(error instanceof module.HomepageApiError, true)
        assert.equal(error.code, 'REQUEST_TIMEOUT')
        assert.equal(error.status, 0)
        return true
      }
    )
    await flushBrowserTasks()

    const slsCalls = calls.filter(call => new URL(call.url).hostname.includes('log.aliyuncs.com'))
    assert.equal(slsCalls.length, 1)

    const markMsg = JSON.parse(new URL(slsCalls[0].url).searchParams.get('mark_msg') ?? '{}')
    assert.equal(markMsg.method, 'POST')
    assert.equal(markMsg.api_path, '/api/client/media/parse-pre-v2')
    assert.equal(markMsg.failure_reason, 'REQUEST_TIMEOUT')
    assert.equal(markMsg.error_name, 'AbortError')
    assert.equal(markMsg.timeout_ms, 1)
    assert.equal(calls.some(call => new URL(call.url).pathname === '/api/client/mark/record'), false)
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    console.error = previousConsoleError
    restoreBrowser()
    await cleanup()
  }
})

test('homepage api does not report HTTP failures as backend connect failures', async () => {
  const { module, cleanup } = await importHomepageApiModule()
  const restoreBrowser = installSlsBrowserGlobals()
  const previousFetch = globalThis.fetch
  const calls = []

  globalThis.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method ?? 'GET'
    })
    return new Response(JSON.stringify({ code: 50001, msg: 'backend failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }

  try {
    await assert.rejects(
      () =>
        module.postJson('/api/client/media/parse-pre-v2', GOOGLE_TEST_REQUEST_CONTEXT, {
          link: 'https://t.me/example/123'
        }),
      /backend failed/
    )

    assert.equal(calls.length, 1)
    assert.equal(calls.some(call => new URL(call.url).hostname.includes('log.aliyuncs.com')), false)
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    restoreBrowser()
    await cleanup()
  }
})

test('homepage postJson preserves backend error data failure reason', async () => {
  const { module, cleanup } = await importHomepageApiModule()
  const previousFetch = globalThis.fetch
  const previousDocument = globalThis.document
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')

  const failureReason =
    'media_parse_failed: platform=example, code=INTERNAL_SERVER_ERROR(500), detail=parse timeout'

  globalThis.document = { documentElement: { lang: 'en-US' } }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language: 'en-US' }
  })
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        code: 50001,
        msg: 'backend parse failed',
        data: {
          failure_reason: failureReason,
          retryable: false
        }
      }),
      {
        status: 400,
        headers: { 'content-type': 'application/json' }
      }
    )

  try {
    await assert.rejects(
      () =>
        module.postJson('/api/client/media/parse-pre-v2', GOOGLE_TEST_REQUEST_CONTEXT, {
          link: 'https://t.me/example/123'
        }),
      (error) => {
        assert.equal(error instanceof module.HomepageApiError, true)
        assert.equal(error.status, 400)
        assert.equal(error.code, 50001)
        assert.equal(error.failureReason, failureReason)
        assert.deepEqual(error.data, {
          failure_reason: failureReason,
          retryable: false
        })
        return true
      }
    )
  } finally {
    if (previousFetch === undefined) {
      delete globalThis.fetch
    } else {
      globalThis.fetch = previousFetch
    }
    if (previousDocument === undefined) {
      delete globalThis.document
    } else {
      globalThis.document = previousDocument
    }
    if (previousNavigator) {
      Object.defineProperty(globalThis, 'navigator', previousNavigator)
    } else {
      delete globalThis.navigator
    }
    await cleanup()
  }
})

test('homepage mark sanitizer redacts JSON and dict-like secret fields', async () => {
  const { module, cleanup } = await importHomepageMarkSanitizerModule()

  try {
    const sanitized = module.sanitizeMarkText(
      '{"access_token":"secret-token","sig":"secret-sig"} ' +
        '{"headers":{"Authorization":"Bearer secret-header","Cookie":"sid=secret-cookie"}} ' +
        '{"download_url":"https://direct.example.com/file.mp4?access_token=secret-direct"} ' +
        "{'direct_url': 'https://single.example.com/file.mp4?token=secret-single'}"
    )

    assert.match(sanitized, /"access_token":"\[redacted\]"/)
    assert.match(sanitized, /"sig":"\[redacted\]"/)
    assert.match(sanitized, /"headers":"\[redacted\]"/)
    assert.match(sanitized, /"download_url":"\[redacted\]"/)
    assert.match(sanitized, /'direct_url':'\[redacted\]'/)
    assert.doesNotMatch(sanitized, /secret-token/)
    assert.doesNotMatch(sanitized, /secret-sig/)
    assert.doesNotMatch(sanitized, /secret-header/)
    assert.doesNotMatch(sanitized, /secret-cookie/)
    assert.doesNotMatch(sanitized, /direct\.example\.com/)
    assert.doesNotMatch(sanitized, /single\.example\.com/)
    assert.doesNotMatch(sanitized, /secret-direct/)
    assert.doesNotMatch(sanitized, /secret-single/)
  } finally {
    await cleanup()
  }
})

test('Google Identity script loader retries after a failed load', async () => {
  await assertGoogleScriptLoadRetriesAfterError(
    'src/scripts/homepage/auth.ts',
    'homepage-auth-'
  )
  await assertGoogleScriptLoadRetriesAfterError(
    path.resolve(repoDir, 'src/scripts/homepage/auth.ts'),
    'shared-homepage-auth-'
  )
})

test('Google Identity initializes once per page runtime', async () => {
  await assertGoogleIdentityInitializesOnce(
    'src/scripts/homepage/auth.ts',
    'homepage-auth-init-once-'
  )
  await assertGoogleIdentityInitializesOnce(
    path.resolve(repoDir, 'src/scripts/homepage/auth.ts'),
    'shared-homepage-auth-init-once-'
  )
})

test('Google Identity normalizes primitive initialize and prompt failures', async () => {
  const { module, cleanup } = await importHomepageAuthModule(
    'src/scripts/homepage/auth.ts',
    'homepage-auth-primitive-errors-'
  )
  const dom = installGoogleScriptDom()

  try {
    globalThis.window.google = {
      accounts: {
        id: {
          cancel() {},
          initialize() {
            throw 'initialize primitive'
          },
          prompt() {}
        }
      }
    }
    await assert.rejects(
      module.requestGoogleRedirectPrompt('client-id', GOOGLE_TEST_REQUEST_CONTEXT),
      error => {
        assert.equal(error.message, 'Google Identity Services initialize failed.')
        assert.equal(error.cause, 'initialize primitive')
        return true
      }
    )

    globalThis.window.google.accounts.id = {
      cancel() {},
      initialize() {},
      prompt() {
        throw 7
      }
    }
    await assert.rejects(
      module.requestGoogleRedirectPrompt('client-id', GOOGLE_TEST_REQUEST_CONTEXT),
      error => {
        assert.equal(error.message, 'Google Identity Services prompt failed.')
        assert.equal(error.cause, 7)
        return true
      }
    )
  } finally {
    dom.cleanup()
    await cleanup()
  }
})

test('Google manual button uses backend OAuth authorize and return_to', async () => {
  await assertGoogleRedirectButtonUsesOAuthAuthorize(
    'src/scripts/homepage/auth.ts',
    'homepage-auth-redirect-button-'
  )
  await assertGoogleRedirectButtonUsesOAuthAuthorize(
    path.resolve(repoDir, 'src/scripts/homepage/auth.ts'),
    'shared-homepage-auth-redirect-button-'
  )
})

test('Google One Tap callback posts credential to backend login', async () => {
  await assertGoogleOneTapCallbackPostsCredential(
    'src/scripts/homepage/auth.ts',
    'homepage-auth-one-tap-callback-'
  )
  await assertGoogleOneTapCallbackPostsCredential(
    path.resolve(repoDir, 'src/scripts/homepage/auth.ts'),
    'shared-homepage-auth-one-tap-callback-'
  )
})

test('homepage auth token writes persist access token to storage', async () => {
  await assertStoredTokenWritesPersistAccessToken(
    'src/scripts/homepage/auth.ts',
    'homepage-auth-token-change-'
  )
  await assertStoredTokenWritesPersistAccessToken(
    path.resolve(repoDir, 'src/scripts/homepage/auth.ts'),
    'shared-homepage-auth-token-change-'
  )
})


test('extension-sourced Pricing entry tags buy buttons for attribution before first load', async () => {
  const source = await readFile(
    path.resolve(repoDir, 'src/components/pricing/pricing-page-controller.ts'),
    'utf8'
  )
  // 插件升级入口（W7 接线）：utm_source=extension 只做归因（购买按钮 ga-source），
  // 在首次账户/配置加载前应用，保证首屏事件即携带来源。
  const utmReadIndex = source.indexOf("get('utm_source') === EXTENSION_UTM_SOURCE")
  const attributionIndex = source.indexOf('applyExtensionAttribution(elements, state)')
  const initLoadIndex = source.indexOf('await Promise.all([restoreUser(elements, copy, state), loadPlans(elements, copy, state)])')

  assert.notEqual(utmReadIndex, -1)
  assert.notEqual(attributionIndex, -1)
  assert.notEqual(initLoadIndex, -1)
  assert.ok(attributionIndex < initLoadIndex)
})

test('Google redirect result reader clears only Google URL params', async () => {
  await assertGoogleRedirectResultCanBeCleared(
    'src/scripts/homepage/auth.ts',
    'homepage-auth-redirect-clear-'
  )
  await assertGoogleRedirectResultCanBeCleared(
    path.resolve(repoDir, 'src/scripts/homepage/auth.ts'),
    'shared-homepage-auth-redirect-clear-'
  )
})

test('Credits checkout helpers parse invoice URL and classify paid callback success only', async () => {
  const { module, cleanup } = await importCompiledTypescriptModule(
    path.resolve(repoDir, 'src/components/credit-purchase/credit-checkout.ts'),
    'credit-checkout.js',
    'credit-checkout-'
  )

  try {
    assert.equal(module.readTelegramInvoiceUrl({ url: 'https://t.me/$credit_invoice' }), 'https://t.me/$credit_invoice')
    assert.equal(module.readTelegramInvoiceUrl({ url: 'https://example.com/pay' }), null)
    assert.equal(module.readTelegramInvoiceUrl({}), null)
    assert.equal(
      module.readPaymentUrl(
        { payment_url: 'https://www.sandbox.paypal.com/checkoutnow?token=credit' },
        'paypal'
      ),
      'https://www.sandbox.paypal.com/checkoutnow?token=credit'
    )
    assert.equal(
      module.readPaymentUrl({ payment_url: 'https://evil.example.com/pay' }, 'paypal'),
      null
    )
    const creditPlan = {
      product_class: 2,
      product_id: 'credit_800',
      product_name: '800 Credits',
      credits_amount: 800,
      display_currency: 'USD',
      display_amount: 14990000,
      payment_channels: []
    }
    assert.equal(module.formatCreditDisplayPrice(creditPlan), '$14.99')
    assert.equal(module.formatCreditUnitLabel('{credits} Credits'), 'Credits')
    assert.equal(
      module.formatCreditDisplayUnitPrice(creditPlan, module.formatCreditUnitLabel('{credits} Credits')),
      '$0.0187/Credits'
    )

    const baseStatus = {
      order_no: 'ORD-CREDIT-1',
      product_class: 2,
      product_id: 'credit_200',
      product_name: '200 Credits',
      amount: 850000000,
      currency: 'XTR',
      payment_method: 'telegram_stars',
      paid_at: null,
      created_at: Date.now(),
      expired_at: Date.now() + 30 * 60 * 1000
    }

    assert.equal(
      module.classifyCreditPurchaseOrderStatus({
        ...baseStatus,
        order_status: module.ORDER_STATUS_PAID,
        callback_status: module.CALLBACK_STATUS_SUCCESS
      }),
      'paid'
    )
    assert.equal(
      module.classifyCreditPurchaseOrderStatus({
        ...baseStatus,
        order_status: module.ORDER_STATUS_PAID,
        callback_status: module.CALLBACK_STATUS_PENDING
      }),
      'pending'
    )
    assert.equal(
      module.classifyCreditPurchaseOrderStatus({
        ...baseStatus,
        order_status: module.ORDER_STATUS_PAID,
        callback_status: module.CALLBACK_STATUS_FAILED
      }),
      'failed'
    )
    assert.equal(
      module.classifyCreditPurchaseOrderStatus({
        ...baseStatus,
        order_status: module.ORDER_STATUS_CANCELLED,
        callback_status: module.CALLBACK_STATUS_NOT_CALLED
      }),
      'cancelled'
    )
  } finally {
    await cleanup()
  }
})

test('Credits checkout client uses Credits configs and never unfinished orders', async () => {
  const { module, cleanup } = await importCompiledTypescriptModule(
    path.resolve(repoDir, 'src/components/credit-purchase/credit-checkout.ts'),
    'credit-checkout.js',
    'credit-checkout-api-'
  )
  const fetchCalls = []
  const previousFetch = globalThis.fetch
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  globalThis.document = { documentElement: { lang: 'en-US' } }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language: 'en-US' }
  })
  globalThis.fetch = async (url, init = {}) => {
    const parsedUrl = new URL(String(url))
    fetchCalls.push({ path: parsedUrl.pathname, method: init.method ?? 'GET' })
    if (parsedUrl.pathname === '/api/client/credit/checkout-configs') {
      return new Response(JSON.stringify({
        code: 10000,
        msg: '',
        data: {
          checkout_configs: [
            {
              product_class: 2,
              product_id: 'credit_50',
              product_name: '50 Credits',
              credits_amount: 50,
              display_currency: 'USD',
              display_amount: 6300000,
              payment_channels: [
                {
                  payment_method: 'paypal',
                  payment_method_name: 'PayPal',
                  currency: 'USD',
                  amount: 6300000,
                  provider_sku: 'credit-50-paypal'
                },
                {
                  payment_method: 'telegram_stars',
                  payment_method_name: 'Telegram Stars',
                  currency: 'XTR',
                  amount: 350000000,
                  provider_sku: 'credit-50-telegram-stars'
                }
              ]
            }
          ]
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    if (parsedUrl.pathname === '/api/client/order/create') {
      return new Response(JSON.stringify({
        code: 10000,
        msg: '',
        data: {
          order_no: 'ORD-CREDIT-CREATE',
          amount: 6300000,
          currency: 'USD',
          expired_at: Date.now() + 30 * 60 * 1000,
          payment_data: {
            payment_url: 'https://www.sandbox.paypal.com/checkoutnow?token=credit',
            channel_order_id: 'PAYPAL-ORDER-123'
          }
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    if (parsedUrl.pathname === '/api/client/order/status/ORD-CREDIT-CREATE') {
      return new Response(JSON.stringify({
        code: 10000,
        msg: '',
        data: {
          order_no: 'ORD-CREDIT-CREATE',
          product_class: 2,
          product_id: 'credit_50',
          product_name: '50 Credits',
          amount: 6300000,
          currency: 'USD',
          order_status: 2,
          callback_status: 3,
          payment_method: 'paypal',
          paid_at: Date.now(),
          created_at: Date.now(),
          expired_at: Date.now() + 30 * 60 * 1000
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    throw new Error('Unexpected Credits checkout test request: ' + parsedUrl.pathname)
  }

  try {
    const context = { deviceId: 'test-device', token: 'token' }
    const plans = await module.listCreditCheckoutConfigs(context)
    assert.equal(plans.length, 1)
    const channel = module.getDefaultCreditPaymentChannel(plans[0])
    assert.equal(channel.payment_method, 'paypal')
    const order = await module.createCreditOrder(
      context,
      module.buildCreateCreditOrderRequest(plans[0], channel)
    )
    assert.equal(order.order_no, 'ORD-CREDIT-CREATE')
    const status = await module.getCreditOrderStatus(context, order.order_no)
    assert.equal(module.classifyCreditPurchaseOrderStatus(status), 'paid')
    assert.deepEqual(fetchCalls.map(call => call.path), [
      '/api/client/credit/checkout-configs',
      '/api/client/order/create',
      '/api/client/order/status/ORD-CREDIT-CREATE'
    ])
    assert.equal(fetchCalls.some(call => call.path === '/api/client/order/unfinished'), false)
  } finally {
    globalThis.fetch = previousFetch
    delete globalThis.document
    if (previousNavigator) {
      Object.defineProperty(globalThis, 'navigator', previousNavigator)
    } else {
      delete globalThis.navigator
    }
    await cleanup()
  }
})

test('Pricing checkout client loads maps plans and creates subscription orders', async () => {
  const { module, cleanup } = await importCompiledTypescriptModule(
    path.resolve(repoDir, 'src/components/pricing/pricing-checkout.ts'),
    'pricing-checkout.js',
    'pricing-checkout-api-'
  )
  const fetchCalls = []
  const mapsPlan = (productId, amount) => ({
    code: 10000,
    msg: '',
    data: {
      checkout_configs: [
        {
          product_class: 1,
          product_id: productId,
          product_line: 'maps_extension',
          product_name: productId === 'maps_extension_pro' ? 'Maps Pro' : 'Maps Business',
          display_currency: 'USD',
          display_amount: amount,
          period: 'month',
          duration_days: 30,
          auto_renew: true,
          monthly_quota: productId === 'maps_extension_pro' ? 100000 : 500000,
          payment_channels: [{
            payment_method: 'paypal',
            payment_method_name: 'PayPal',
            currency: 'USD',
            amount,
            provider_sku: `${productId}-monthly-paypal`
          }]
        },
        {
          product_class: 1,
          product_id: 'unlimited',
          product_line: 'extension',
          product_name: 'Unlimited',
          display_currency: 'USD',
          display_amount: 9990000,
          period: 'month',
          duration_days: 30,
          auto_renew: true,
          monthly_quota: null,
          payment_channels: [{
            payment_method: 'paypal',
            payment_method_name: 'PayPal',
            currency: 'USD',
            amount: 9990000,
            provider_sku: 'unlimited-monthly-paypal'
          }]
        }
      ]
    }
  })

  const previousFetch = globalThis.fetch
  const previousDocument = globalThis.document
  globalThis.document = { documentElement: { lang: 'en-US' } }
  globalThis.fetch = async (url, options = {}) => {
    fetchCalls.push({ url: String(url), body: options.body ? JSON.parse(String(options.body)) : null })
    return new Response(JSON.stringify(mapsPlan('maps_extension_pro', 39000000)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const context = { deviceId: 'pricing-device', token: 'pricing-token' }
    const subscriptionData = await module.listSubscriptionCheckoutConfigs(context)
    assert.equal(subscriptionData.plans.length, 2)

    // pickPlansByLine 只取 maps_extension 产品线，按 product_id 索引
    const mapsPlans = module.pickPlansByLine(subscriptionData.plans, 'maps_extension')
    assert.equal([...mapsPlans.keys()].sort().join(','), 'maps_extension_pro')
    const plan = mapsPlans.get('maps_extension_pro')
    assert.equal(plan.product_line, 'maps_extension')
    assert.equal(plan.monthly_quota, 100000)
    assert.equal(module.formatPricingDisplayPrice(plan), '$39.00')

    const channel = module.getDefaultPricingPaymentChannel(plan.payment_channels)
    const request = module.buildCreateSubscriptionOrderRequest(plan, channel)
    await module.createPricingOrder(context, request)
    assert.deepEqual(fetchCalls, [
      { url: 'https://api-mapsgrab.example.com/api/client/subscription/checkout-configs', body: null },
      {
        url: 'https://api-mapsgrab.example.com/api/client/order/create',
        body: {
          product_class: 1,
          product_id: 'maps_extension_pro',
          payment_method: 'paypal',
          currency: 'USD',
          amount: 39000000
        }
      }
    ])
  } finally {
    globalThis.fetch = previousFetch
    globalThis.document = previousDocument
    await cleanup()
  }
})

test('Pricing maps loader rejects bad configs and ignores stale anonymous responses', async () => {
  const previousFetch = globalThis.fetch
  const previousDocument = globalThis.document
  const previousWindow = globalThis.window
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const previousConsoleError = console.error
  const pendingResponses = []
  const makeElement = () => ({
    textContent: '',
    hidden: false,
    disabled: false,
    classList: {
      remove() {},
      toggle() {},
      add() {}
    },
    setAttribute() {},
    removeAttribute() {}
  })
  const buyableCards = new Map()
  for (const productId of ['maps_extension_pro', 'maps_extension_business']) {
    buyableCards.set(productId, { line: 'extension', buy: makeElement(), error: makeElement() })
  }
  const elements = {
    accountError: makeElement(),
    plansStatus: makeElement(),
    buyableCards
  }
  const copy = {
    plans: {
      loading: 'Loading payment options...',
      loadFailed: 'Failed to load payment options.',
      noChannels: 'No payment method is available for this plan right now.',
      alreadyActive: 'Already active.'
    }
  }
  const state = {
    deviceId: 'pricing-race-device',
    token: null,
    user: null,
    plans: new Map(),
    loadVersion: 0,
    isExtensionSource: false
  }
  const planData = (productId, amount) => ({
    code: 10000,
    msg: '',
    data: {
      checkout_configs: [{
        product_class: 1,
        product_id: productId,
        product_line: 'maps_extension',
        product_name: 'Maps Pro',
        display_currency: 'USD',
        display_amount: amount,
        period: 'month',
        duration_days: 30,
        auto_renew: true,
        monthly_quota: 100000,
        payment_channels: [{
          payment_method: 'paypal',
          payment_method_name: 'PayPal',
          currency: 'USD',
          amount,
          provider_sku: 'pricing-race-paypal'
        }]
      }]
    }
  })

  globalThis.document = {
    documentElement: { lang: 'en-US' },
    querySelector() { return null }
  }
  globalThis.window = {}
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language: 'en-US' }
  })
  globalThis.fetch = () => new Promise(resolve => pendingResponses.push(resolve))

  const { module, cleanup } = await importPricingPageControllerModule()

  try {
    const anonymousLoad = module.loadPlans(elements, copy, state)
    state.token = 'signed-in-token'
    const signedInLoad = module.loadPlans(elements, copy, state)

    pendingResponses[1](new Response(JSON.stringify(planData('maps_extension_pro', 39000000)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }))
    await signedInLoad
    pendingResponses[0](new Response(JSON.stringify(planData('maps_extension_pro', 29000000)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }))
    await anonymousLoad

    const card = elements.buyableCards.get('maps_extension_pro')
    // 旧响应不得覆盖新登录态：价格取自登录态那次加载
    assert.equal(elements.plansStatus.textContent, '')
    assert.equal(card.buy.disabled, false)

    console.error = () => {}
    const badLoad = module.loadPlans(elements, copy, state)
    pendingResponses[2](new Response('{"code":50000,"msg":"server error"}', {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }))
    await badLoad
    assert.equal(elements.plansStatus.textContent, copy.plans.loadFailed)
    assert.equal(card.buy.disabled, true)
  } finally {
    globalThis.fetch = previousFetch
    console.error = previousConsoleError
    globalThis.document = previousDocument
    globalThis.window = previousWindow
    if (previousNavigator) {
      Object.defineProperty(globalThis, 'navigator', previousNavigator)
    } else {
      delete globalThis.navigator
    }
    await cleanup()
  }
})

test('PayPal success return page polls order status every 3 seconds and switches copy by product line', async () => {
  const PAYPAL_RETURN_COPY_PAYLOAD = JSON.stringify({
    waitingTitle: 'Payment submitted',
    waitingMessage:
      'You can return to the original tab. We are checking PayPal confirmation every 3 seconds, and the result will appear here automatically.',
    confirmedCreditsTitle: 'Credits added',
    confirmedCreditsMessage:
      'Your PayPal payment is confirmed and the Credits have been added. You can close this tab and continue in the original window.',
    confirmedSubscriptionTitle: 'Subscription activated',
    confirmedSubscriptionMessage:
      'Your PayPal payment is confirmed and your MapsGrab plan is active. You can close this tab and continue in the original window.',
    failedTitle: 'Payment needs attention',
    failedMessage:
      'We could not confirm this order automatically. Return to the original window or try refreshing your payment status there.'
  })

  const runScenario = async ({ productId, productClass, expectedTitle, expectedMessageFragment }) => {
    const { module, cleanup } = await importPayPalReturnModule()
    const previousFetch = globalThis.fetch
    const previousWindow = globalThis.window
    const previousDocument = globalThis.document
    const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
    const titleElement = { textContent: 'Payment submitted' }
    const messageElement = { textContent: '' }
    const copyElement = { textContent: PAYPAL_RETURN_COPY_PAYLOAD }
    const storageValues = new Map([
      ['homepage_access_token', 'test-token'],
      ['homepage_device_id_v2', '01234567-89ab-4def-8123-456789abcdef']
    ])
    const fetchCalls = []
    const intervals = []
    const clearedIntervals = []
    const openerMessages = []

    globalThis.window = {
      localStorage: {
        getItem(key) {
          return storageValues.get(key) ?? null
        },
        setItem(key, value) {
          storageValues.set(key, String(value))
        },
        removeItem(key) {
          storageValues.delete(key)
        }
      },
      location: {
        origin: 'https://mapsgrab.com',
        search: '?order_no=ORD-PAYPAL-RETURN'
      },
      opener: {
        postMessage(message, origin) {
          openerMessages.push({ message, origin })
        }
      },
      setInterval(callback, intervalMs) {
        intervals.push({ callback, intervalMs })
        return intervals.length
      },
      clearInterval(timerId) {
        clearedIntervals.push(timerId)
      }
    }
    globalThis.document = {
      documentElement: { lang: 'en-US' },
      querySelector(selector) {
        if (selector === '[data-paypal-return-title]') {
          return titleElement
        }
        if (selector === '[data-paypal-return-message]') {
          return messageElement
        }
        if (selector === '[data-paypal-return-copy]') {
          return copyElement
        }
        return null
      }
    }
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { language: 'en-US' }
    })
    globalThis.fetch = async (url, init = {}) => {
      const parsedUrl = new URL(String(url))
      fetchCalls.push({ path: parsedUrl.pathname, method: init.method ?? 'GET' })
      assert.equal(parsedUrl.pathname, '/api/client/order/status/ORD-PAYPAL-RETURN')
      const paid = fetchCalls.length >= 2
      return new Response(
        JSON.stringify({
          code: 10000,
          msg: '',
          data: {
            order_no: 'ORD-PAYPAL-RETURN',
            product_class: productClass,
            product_id: productId,
            product_name: productId,
            amount: 39000000,
            currency: 'USD',
            order_status: paid ? 2 : 1,
            callback_status: paid ? 3 : 1,
            payment_method: 'paypal',
            paid_at: paid ? Date.now() : null,
            created_at: Date.now(),
            expired_at: Date.now() + 30 * 60 * 1000
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    try {
      module.initPayPalReturnPage({
        status: 'success',
        orderNo: null
      })
      await flushBrowserTasks()

      assert.equal(intervals.length, 1)
      assert.equal(intervals[0].intervalMs, module.PAYPAL_SUCCESS_POLL_INTERVAL_MS)
      assert.equal(module.PAYPAL_SUCCESS_POLL_INTERVAL_MS, 3000)
      assert.equal(fetchCalls.length, 1)
      assert.equal(titleElement.textContent, 'Payment submitted')

      intervals[0].callback()
      await flushBrowserTasks()

      assert.equal(fetchCalls.length, 2)
      assert.equal(titleElement.textContent, expectedTitle)
      assert.equal(messageElement.textContent.includes(expectedMessageFragment), true)
      assert.deepEqual(clearedIntervals, [1])
      assert.equal(openerMessages.length, 2)
      assert.equal(openerMessages[0].message.type, 'credit_purchase_paypal_return')
      assert.equal(openerMessages[1].message.orderNo, 'ORD-PAYPAL-RETURN')
    } finally {
      globalThis.fetch = previousFetch
      if (previousWindow === undefined) {
        delete globalThis.window
      } else {
        globalThis.window = previousWindow
      }
      if (previousDocument === undefined) {
        delete globalThis.document
      } else {
        globalThis.document = previousDocument
      }
      if (previousNavigator) {
        Object.defineProperty(globalThis, 'navigator', previousNavigator)
      } else {
        delete globalThis.navigator
      }
      await cleanup()
    }
  }

  // Credits 订单（product_class=RECHARGE）保持 Credits 口径
  await runScenario({
    productId: 'credit_50',
    productClass: 2,
    expectedTitle: 'Credits added',
    expectedMessageFragment: 'Credits have been added'
  })
  await runScenario({
    productId: 'unlimited',
    productClass: 2,
    expectedTitle: 'Credits added',
    expectedMessageFragment: 'Credits have been added'
  })
  // 订阅类订单（maps_extension / maps_online 各线）按 product_class 切换为订阅口径
  await runScenario({
    productId: 'maps_extension_pro',
    productClass: 1,
    expectedTitle: 'Subscription activated',
    expectedMessageFragment: 'MapsGrab plan is active'
  })
  await runScenario({
    productId: 'online_lite',
    productClass: 1,
    expectedTitle: 'Subscription activated',
    expectedMessageFragment: 'MapsGrab plan is active'
  })
})
