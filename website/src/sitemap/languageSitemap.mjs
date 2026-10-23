/**
 * Builds the production sitemap index and per-language sitemap files.
 *
 * Flow:
 * Astro build pages -> collect canonical URLs -> group by locale prefix ->
 * resolve page lastmod from Git/file metadata -> write XML files.
 */
import { execFile } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9'
const SITEMAP_INDEX_FILENAMES = ['sitemap.xml', 'sitemap_index.xml']
const LEGACY_FLAT_SITEMAP_FILENAME = 'sitemap-0.xml'
const SITEMAP_STYLESHEET_PATH = '/sitemap.xsl'
const STATUS_CODE_PAGES = new Set(['404', '500'])
const SEARCH_BOT_BLOCKED_ROUTE_PATHS = new Set([
  '/clink/cancel/',
  '/clink/success/',
  '/paypal/cancel/',
  '/paypal/success/',
  '/extension-login/',
  // Dashboard 工作区 noindex：四个视图地址都是私有工作区，不进搜索与 sitemap。
  '/dashboard/',
  '/dashboard/history/',
  '/dashboard/api/',
  '/dashboard/subscriptions/',
  // MCP OAuth 确认页 noindex（014 U2）：授权流程中间页，不进 sitemap。
  '/oauth/consent/'
])
const WEBSITE_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
const ATLAS_TOKENS = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8')
const SITEMAP_XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>XML Sitemap Index | MapsGrab</title>
        <style>
          <![CDATA[${ATLAS_TOKENS}]]>

          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: var(--font-sans);
          }

          main {
            width: min(1040px, calc(100vw - 48px));
            margin: 64px auto;
          }

          h1 {
            margin: 0;
            color: var(--text);
            font-family: var(--font-sans);
            font-size: clamp(32px, 5vw, 56px);
            line-height: 1;
          }

          .brand {
            margin: 22px 0 16px;
            color: var(--text);
            font-family: var(--font-sans);
            font-size: var(--fs-h2);
            font-weight: 700;
          }

          .summary {
            margin: 0 0 var(--s-8);
            color: var(--text-2);
            font-size: 16px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border-radius: var(--r-sm);
            background: var(--surface);
            box-shadow: var(--shadow-sm);
          }

          th,
          td {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border);
            text-align: left;
            font-size: 15px;
          }

          th {
            color: var(--text);
            background: var(--surface-2);
            font-size: 16px;
          }

          tr:nth-child(even) td {
            background: var(--surface-2);
          }

          a {
            color: var(--primary-text);
            font-weight: 700;
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>XML Sitemap</h1>
          <p class="brand">MapsGrab</p>
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <p class="summary">
                This sitemap index contains
                <strong><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)" /></strong>
                language sitemaps.
              </p>
            </xsl:when>
            <xsl:otherwise>
              <p class="summary">
                This sitemap contains
                <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)" /></strong>
                URLs.
              </p>
            </xsl:otherwise>
          </xsl:choose>
          <table>
            <thead>
              <tr>
                <th>
                  <xsl:choose>
                    <xsl:when test="sitemap:sitemapindex">Sitemap</xsl:when>
                    <xsl:otherwise>URL</xsl:otherwise>
                  </xsl:choose>
                </th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc" />
                    </a>
                  </td>
                  <td><xsl:value-of select="sitemap:lastmod" /></td>
                </tr>
              </xsl:for-each>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc" />
                    </a>
                  </td>
                  <td><xsl:value-of select="sitemap:lastmod" /></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`

/**
 * Sitemap locale mapping. Keep this aligned with src/i18n/ui.ts:
 * locale -> localePaths pathPrefix + hreflangMap sitemapSlug.
 */
export const LANGUAGE_SITEMAP_LOCALES = [
  { locale: 'en-US', pathPrefix: '', sitemapSlug: 'en' },
  { locale: 'zh-CN', pathPrefix: 'zh-cn', sitemapSlug: 'zh-cn' },
  { locale: 'ja-JP', pathPrefix: 'ja', sitemapSlug: 'ja' },
  { locale: 'ko-KR', pathPrefix: 'ko', sitemapSlug: 'ko' },
  { locale: 'zh-TW', pathPrefix: 'zh-tw', sitemapSlug: 'zh-tw' },
  { locale: 'es-ES', pathPrefix: 'es', sitemapSlug: 'es' },
  { locale: 'pt-BR', pathPrefix: 'pt', sitemapSlug: 'pt-br' },
  { locale: 'de-DE', pathPrefix: 'de', sitemapSlug: 'de' },
  { locale: 'fr-FR', pathPrefix: 'fr', sitemapSlug: 'fr' },
  { locale: 'ru-RU', pathPrefix: 'ru', sitemapSlug: 'ru' },
  { locale: 'it-IT', pathPrefix: 'it', sitemapSlug: 'it' },
  { locale: 'vi-VN', pathPrefix: 'vi', sitemapSlug: 'vi' },
  { locale: 'th-TH', pathPrefix: 'th', sitemapSlug: 'th' },
  { locale: 'id-ID', pathPrefix: 'id', sitemapSlug: 'id' }
]

const DEFAULT_LANGUAGE = LANGUAGE_SITEMAP_LOCALES.find((language) => language.locale === 'en-US')
const PREFIX_LANGUAGE_MAP = new Map(
  LANGUAGE_SITEMAP_LOCALES
    .filter((language) => language.pathPrefix !== '')
    .map((language) => [language.pathPrefix, language])
)

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function normalizeRoutePath(routePath) {
  if (!routePath || routePath === '/') {
    return '/'
  }

  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

/** 拆出语言前缀：/zh-tw/pricing/ → zh-TW + /pricing/；无前缀归默认语言。 */
function splitLanguagePrefix(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  const prefixedLanguage = segments.length > 0 ? PREFIX_LANGUAGE_MAP.get(segments[0]) : undefined
  const routeSegments = prefixedLanguage ? segments.slice(1) : segments

  return {
    language: prefixedLanguage ?? DEFAULT_LANGUAGE,
    routePath: routeSegments.length === 0 ? '/' : `/${routeSegments.join('/')}/`
  }
}

/** 屏蔽清单按去掉语言前缀后的路由匹配，根路径与各语言前缀版本一并排除。 */
function isIgnoredRoutePath(routePath) {
  const normalized = splitLanguagePrefix(normalizeRoutePath(routePath)).routePath
  if (SEARCH_BOT_BLOCKED_ROUTE_PATHS.has(normalized)) {
    return true
  }

  const segments = normalized.split('/').filter(Boolean)
  if (segments.length === 1 && STATUS_CODE_PAGES.has(segments[0])) {
    return true
  }

  return false
}

function getBuildBaseUrl(astroConfig) {
  return new URL(astroConfig.base, astroConfig.site)
}

function toAbsolutePageUrl(pathname, astroConfig) {
  const baseUrl = getBuildBaseUrl(astroConfig)
  const cleanPathname = String(pathname ?? '').replace(/^\/+/, '')
  let basePath = baseUrl.pathname
  if (!basePath.endsWith('/')) {
    basePath = `${basePath}/`
  }

  let fullPath = `${basePath}${cleanPathname}`
  if (
    astroConfig.trailingSlash !== 'never' &&
    astroConfig.build.format === 'directory' &&
    fullPath !== '/' &&
    !fullPath.endsWith('/')
  ) {
    fullPath = `${fullPath}/`
  }

  return new URL(fullPath, baseUrl).href
}

function collectPageUrls(pages, routes, astroConfig) {
  const urls = new Set()

  for (const page of pages) {
    if (!isIgnoredRoutePath(page.pathname)) {
      urls.add(toAbsolutePageUrl(page.pathname, astroConfig))
    }
  }

  for (const route of routes) {
    if (route.type !== 'page' || !route.pathname || isIgnoredRoutePath(route.pathname)) {
      continue
    }

    urls.add(toAbsolutePageUrl(route.generate(route.pathname), astroConfig))
  }

  return [...urls].sort((left, right) => left.localeCompare(right, 'en', { numeric: true }))
}

export function classifySitemapUrl(url) {
  return splitLanguagePrefix(new URL(url).pathname)
}

function getRouteSourceFiles(routePath) {
  const normalized = normalizeRoutePath(routePath)

  if (normalized === '/') {
    return ['src/pages/index.astro', 'src/pages/[lang]/index.astro', 'src/components/pages/HomePage.astro']
  }

  // 插件页与云端页：root + [lang] 双路由，区块组件与演示数据在 components/extension|online/，
  // 两页共用 components/product/ 与演示脚本 product-page.ts，方案卡的价格与额度取自 i18n/pricing.ts。
  const PRODUCT_SHARED_SOURCES = [
    'src/components/product/AccentHeading.astro',
    'src/components/product/ProductCta.astro',
    'src/components/product/ProductFacts.astro',
    'src/components/product/ProductFaq.astro',
    'src/components/product/ProductSectionHead.astro',
    'src/components/product/copy.ts',
    'src/components/product/faq-schema.ts',
    'src/scripts/pages/product-page.ts',
    'src/i18n/pricing.ts'
  ]

  if (normalized === '/extension/') {
    return [
      'src/pages/extension.astro',
      'src/pages/[lang]/extension.astro',
      'src/components/pages/ExtensionPage.astro',
      'src/components/extension/ExtensionHero.astro',
      'src/components/extension/ExtensionViews.astro',
      'src/components/extension/ExtensionShowcase.astro',
      'src/components/extension/ExtensionBatch.astro',
      'src/components/extension/ExtensionPrivacy.astro',
      'src/components/extension/ExtensionInstall.astro',
      'src/components/extension/StarBar.astro',
      'src/components/extension/extension-samples.ts',
      'src/i18n/extension.ts',
      ...PRODUCT_SHARED_SOURCES
    ]
  }

  if (normalized === '/online-scraper/') {
    return [
      'src/pages/online-scraper.astro',
      'src/pages/[lang]/online-scraper.astro',
      'src/components/pages/OnlineScraperPage.astro',
      'src/components/online/OnlineHero.astro',
      'src/components/online/OnlineFlow.astro',
      'src/components/online/OnlineModes.astro',
      'src/components/online/OnlineResults.astro',
      'src/components/online/OnlineUsage.astro',
      'src/components/online/online-samples.ts',
      'src/i18n/online-scraper.ts',
      ...PRODUCT_SHARED_SOURCES
    ]
  }

  if (normalized === '/terms/' || normalized === '/privacy/') {
    const pageName = normalized.split('/').filter(Boolean)[0]
    return [
      `src/pages/${pageName}.astro`,
      `src/pages/[lang]/${pageName}.astro`,
      'src/components/pages/LegalPage.astro',
      'src/components/legal/LegalHero.astro',
      'src/components/legal/LegalDocument.astro',
      'src/legal/legalContent.ts'
    ]
  }

  // 公司页：About 的区块组件与地球 / 连线脚本、Contact 的联系区都在 components/company/。
  if (normalized === '/about/' || normalized === '/contact/') {
    const pageName = normalized.split('/').filter(Boolean)[0]
    const pageSources =
      pageName === 'about'
        ? [
            'src/components/company/AboutHero.astro',
            'src/components/company/AboutBuild.astro',
            'src/components/company/AboutPrinciples.astro',
            'src/components/company/AboutDataFlow.astro',
            'src/components/company/AboutStatus.astro',
            'src/components/company/about-globe.ts',
            'src/components/company/about-wires.ts',
            'src/components/company/about-wires.css'
          ]
        : ['src/components/company/ContactSection.astro']
    return [
      `src/pages/${pageName}.astro`,
      `src/pages/[lang]/${pageName}.astro`,
      'src/components/pages/CompanyPage.astro',
      'src/company/companyContent.ts',
      ...pageSources
    ]
  }

  if (normalized === '/pricing/') {
    return [
      'src/pages/pricing.astro',
      'src/pages/[lang]/pricing.astro',
      'src/components/pages/PricingPage.astro',
      'src/i18n/pricing.ts',
      'src/components/pricing/PricingPageShell.astro',
      'src/components/pricing/pricing-page-controller.ts'
    ]
  }

  // /paypal/* 与 /clink/* 回跳页在 SEARCH_BOT_BLOCKED_ROUTE_PATHS 中被提前过滤，
  // 不会进入本映射，因此没有对应的源文件分支。

  // 工具矩阵（D1 七个公开工具）：root + [lang] 双路由，共用 components/pages/tools/ 装配。
  // 外壳 ToolShell 复用产品页的区块头 / FAQ / CTA；Place ID Finder 另有面板与讲解组件，其余工具共用 ToolGuide。
  const TOOL_SHARED_SOURCES = [
    'src/components/tools/ToolShell.astro',
    'src/components/tools/tool-catalog.ts',
    'src/components/tools/tool-panel.css',
    'src/i18n/tools.ts',
    'src/components/product/AccentHeading.astro',
    'src/components/product/ProductCta.astro',
    'src/components/product/ProductFaq.astro',
    'src/components/product/ProductSectionHead.astro',
    'src/components/product/faq-schema.ts'
  ]
  const TOOL_GUIDE = 'src/components/tools/ToolGuide.astro'
  const TOOL_ROUTE_SOURCES = {
    '/tools/place-id-finder/': [
      'src/components/pages/tools/PlaceIdFinderPage.astro',
      'src/scripts/tools/placeIdFinder.ts',
      'src/scripts/tools/lib/placeUrl.ts',
      'src/components/tools/PlaceIdPanel.astro',
      'src/components/tools/PlaceIdGuide.astro',
      'src/components/tools/place-id-samples.ts',
      'src/components/product/copy.ts',
      'src/scripts/pages/product-page.ts'
    ],
    '/tools/review-link-generator/': ['src/components/pages/tools/ReviewLinkGeneratorPage.astro', 'src/scripts/tools/reviewLinkGenerator.ts', 'src/scripts/tools/lib/placeUrl.ts', TOOL_GUIDE],
    '/tools/email-checker/': ['src/components/pages/tools/EmailCheckerPage.astro', 'src/scripts/tools/emailChecker.ts', 'src/scripts/tools/lib/emailCheck.ts', TOOL_GUIDE],
    '/tools/lat-long-to-dms/': ['src/components/pages/tools/LatLongToDmsPage.astro', 'src/scripts/tools/latLongToDms.ts', 'src/scripts/tools/lib/coordinates.ts', TOOL_GUIDE],
    '/tools/dms-to-dd/': ['src/components/pages/tools/DmsToDdPage.astro', 'src/scripts/tools/dmsToDd.ts', 'src/scripts/tools/lib/coordinates.ts', TOOL_GUIDE],
    '/tools/bulk-keywords-generator/': ['src/components/pages/tools/BulkKeywordsGeneratorPage.astro', 'src/scripts/tools/bulkKeywords.ts', 'src/scripts/tools/lib/keywords.ts', TOOL_GUIDE],
    '/tools/merge-csv-files-online/': ['src/components/pages/tools/MergeCsvPage.astro', 'src/scripts/tools/mergeCsv.ts', 'src/scripts/tools/lib/csv.ts', TOOL_GUIDE]
  }
  const toolSourceFiles = TOOL_ROUTE_SOURCES[normalized]
  if (toolSourceFiles) {
    const slug = normalized.slice('/tools/'.length, -1)
    return [
      `src/pages/tools/${slug}.astro`,
      `src/pages/[lang]/tools/${slug}.astro`,
      ...toolSourceFiles,
      ...TOOL_SHARED_SOURCES
    ]
  }

  // W4：API 三页共用 ApiPage（按 variant 渲染），MCP 页为 McpPage；root + [lang] 双路由，
  // 文案在 i18n/api.ts / mcp.ts，共用区块在 components/api/，标题 / FAQ / 收尾 CTA 复用 components/product/，
  // 套餐卡与额度取自 i18n/pricing.ts。
  const API_SHARED_SOURCES = [
    'src/components/api/CodeText.astro',
    'src/components/api/JsonLine.astro',
    'src/components/api/endpoints.ts',
    'src/components/product/AccentHeading.astro',
    'src/components/product/ProductCta.astro',
    'src/components/product/ProductFaq.astro',
    'src/components/product/faq-schema.ts',
    'src/i18n/api.ts',
    'src/i18n/pricing.ts'
  ]
  const API_PAGE_SOURCES = ['src/components/pages/ApiPage.astro', 'src/scripts/pages/api-page.ts']
  const MCP_PAGE_SOURCES = [
    'src/components/pages/McpPage.astro',
    'src/components/api/McpScene.astro',
    'src/i18n/mcp.ts',
    'src/scripts/pages/mcp-page.ts'
  ]
  const API_ROUTE_SOURCES = {
    '/google-maps-scraper-api/': API_PAGE_SOURCES,
    '/google-maps-reviews-scraper-api/': API_PAGE_SOURCES,
    '/google-maps-photos-api/': API_PAGE_SOURCES,
    '/google-maps-scraper-mcp/': MCP_PAGE_SOURCES
  }
  const apiPageSources = API_ROUTE_SOURCES[normalized]
  if (apiPageSources) {
    const slug = normalized.slice(1, -1)
    return [`src/pages/${slug}.astro`, `src/pages/[lang]/${slug}.astro`, ...apiPageSources, ...API_SHARED_SOURCES]
  }

  throw new Error(`languageSitemap: route source files are not mapped for routePath=${normalized}`)
}

function getUrlSourceFiles(routePath, locale) {
  return [
    ...getRouteSourceFiles(routePath),
    'src/i18n/content.ts',
    'src/i18n/localized-content.ts',
    `src/i18n/lang/${locale}.ts`
  ]
}

async function getGitLastmod(files) {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['log', '-1', '--format=%cI', '--', ...files],
      { cwd: WEBSITE_ROOT }
    )
    const lastmod = stdout.trim().split('\n').filter(Boolean)[0]
    if (lastmod) {
      return lastmod
    }
  } catch (error) {
    console.error(new Error('languageSitemap: git lastmod lookup failed.', { cause: error }))
  }

  return ''
}

async function getMtimeLastmod(url, files, logger) {
  let latestMtimeMs = 0
  let latestFile = ''

  for (const file of files) {
    const fileStat = await stat(path.join(WEBSITE_ROOT, file))
    if (fileStat.mtimeMs > latestMtimeMs) {
      latestMtimeMs = fileStat.mtimeMs
      latestFile = file
    }
  }

  if (latestMtimeMs === 0) {
    throw new Error(`languageSitemap: unable to resolve lastmod for url=${url}`)
  }

  const lastmod = new Date(latestMtimeMs).toISOString()
  logger.warn(`languageSitemap: using file mtime fallback for url=${url}, file=${latestFile}, lastmod=${lastmod}`)
  return lastmod
}

async function resolveLastmod(url, routePath, locale, logger) {
  const files = getUrlSourceFiles(routePath, locale)
  const gitLastmod = await getGitLastmod(files)
  if (gitLastmod) {
    return gitLastmod
  }

  return getMtimeLastmod(url, files, logger)
}

function createEmptyLanguageGroups() {
  return new Map(LANGUAGE_SITEMAP_LOCALES.map((language) => [language.locale, {
    language,
    entries: []
  }]))
}

export async function buildLanguageSitemapGroups(urls, logger) {
  const groups = createEmptyLanguageGroups()

  for (const url of urls) {
    const { language, routePath } = classifySitemapUrl(url)
    const lastmod = await resolveLastmod(url, routePath, language.locale, logger)
    const group = groups.get(language.locale)
    group.entries.push({
      url,
      lastmod
    })
  }

  for (const group of groups.values()) {
    group.entries.sort((left, right) => {
      const leftPath = new URL(left.url).pathname
      const rightPath = new URL(right.url).pathname
      return leftPath.localeCompare(rightPath, 'en', { numeric: true })
    })
  }

  return groups
}

function validateGroups(groups) {
  for (const { language, entries } of groups.values()) {
    if (entries.length === 0) {
      throw new Error(`languageSitemap: ${language.locale} has no sitemap entries`)
    }

    for (const entry of entries) {
      if (Number.isNaN(Date.parse(entry.lastmod))) {
        throw new Error(`languageSitemap: invalid lastmod=${entry.lastmod} for url=${entry.url}`)
      }
    }
  }
}

function renderLanguageSitemap(entries) {
  const urlsXml = entries
    .map((entry) => [
      '  <url>',
      `    <loc>${escapeXml(entry.url)}</loc>`,
      `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
      '  </url>'
    ].join('\n'))
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<?xml-stylesheet type="text/xsl" href="${SITEMAP_STYLESHEET_PATH}"?>`,
    `<urlset xmlns="${SITEMAP_NAMESPACE}">`,
    urlsXml,
    '</urlset>',
    ''
  ].join('\n')
}

function renderSitemapIndex(groups, siteUrl) {
  const sitemapXml = [...groups.values()]
    .map(({ language, entries }) => {
      const lastmod = entries
        .map((entry) => entry.lastmod)
        .sort((left, right) => Date.parse(right) - Date.parse(left))[0]
      const loc = new URL(`/${language.sitemapSlug}-sitemap.xml`, siteUrl).href

      return [
        '  <sitemap>',
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
        '  </sitemap>'
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<?xml-stylesheet type="text/xsl" href="${SITEMAP_STYLESHEET_PATH}"?>`,
    `<sitemapindex xmlns="${SITEMAP_NAMESPACE}">`,
    sitemapXml,
    '</sitemapindex>',
    ''
  ].join('\n')
}

function collectFlatSitemapEntries(groups) {
  return [...groups.values()]
    .flatMap((group) => group.entries)
    .sort((left, right) => {
      const leftPath = new URL(left.url).pathname
      const rightPath = new URL(right.url).pathname
      return leftPath.localeCompare(rightPath, 'en', { numeric: true })
    })
}

async function writeSitemaps(groups, outputDir, siteUrl) {
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'sitemap.xsl'), SITEMAP_XSL)
  const sitemapIndexXml = renderSitemapIndex(groups, siteUrl)
  for (const filename of SITEMAP_INDEX_FILENAMES) {
    await writeFile(path.join(outputDir, filename), sitemapIndexXml)
  }
  await writeFile(
    path.join(outputDir, LEGACY_FLAT_SITEMAP_FILENAME),
    renderLanguageSitemap(collectFlatSitemapEntries(groups))
  )

  for (const { language, entries } of groups.values()) {
    await writeFile(
      path.join(outputDir, `${language.sitemapSlug}-sitemap.xml`),
      renderLanguageSitemap(entries)
    )
  }
}

export default function languageSitemap() {
  let resolvedRoutes = []
  let astroConfig

  return {
    name: 'language-sitemap',
    hooks: {
      'astro:routes:resolved': ({ routes }) => {
        resolvedRoutes = routes
      },
      'astro:config:done': ({ config }) => {
        astroConfig = config
      },
      'astro:build:done': async ({ dir, pages, logger }) => {
        if (!astroConfig.site) {
          logger.warn('languageSitemap: missing astro config site; sitemap generation skipped')
          return
        }

        const urls = collectPageUrls(pages, resolvedRoutes, astroConfig)
        const groups = await buildLanguageSitemapGroups(urls, logger)
        validateGroups(groups)
        await writeSitemaps(groups, fileURLToPath(dir), getBuildBaseUrl(astroConfig))
        logger.info(`languageSitemap: wrote ${urls.length} URLs into ${groups.size} language sitemaps`)
      }
    }
  }
}
