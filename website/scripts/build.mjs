import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'

const websiteDir = fileURLToPath(new URL('../', import.meta.url))
const extensionDir = fileURLToPath(new URL('../../extension/', import.meta.url))
const mode = process.argv[2] ?? 'production'
const configFile = new URL(mode === 'production' ? '../deploy/production.conf' : `../.env.${mode}`, import.meta.url)
let buildEnv = { ...process.env }
if (mode === 'production') {
  // 生产文件中的空值也必须生效，防止 shell 或旧 .env 文件补入其他环境的参数。
  buildEnv = Object.fromEntries(Object.entries(buildEnv).filter(([key]) => !/^(PUBLIC_|EXTENSION_|VITE_|DEPLOY_)/.test(key)))
  buildEnv.NODE_ENV = 'production'
  Object.assign(buildEnv, Object.fromEntries(Object.entries(parseEnv(readFileSync(configFile, 'utf8')))
    .filter(([key]) => /^(PUBLIC_|EXTENSION_)/.test(key))))
} else if (existsSync(configFile)) {
  process.loadEnvFile(configFile)
  buildEnv = { ...process.env }
}
for (const key of ['PUBLIC_API_BASE_URL', 'PUBLIC_SITE_URL']) {
  if (!buildEnv[key]?.trim()) {
    throw new Error(`官网构建：${fileURLToPath(configFile)} 缺少 ${key}，请填写后重新构建`)
  }
}

const run = (args, cwd = websiteDir, env = buildEnv) =>
  execFileSync('pnpm', args, { cwd, env, stdio: 'inherit' })

run(['exec', 'astro', 'check'])
run(['exec', 'vue-tsc', '--noEmit'])
run(['type-check'], extensionDir)
run(['build:store', 'chrome', 'firefox'], extensionDir, {
  ...buildEnv,
  EXTENSION_API_BASE_URL: buildEnv.PUBLIC_API_BASE_URL,
  EXTENSION_WEBSITE_BASE_URL: buildEnv.PUBLIC_SITE_URL
})

const downloads = new URL('../public/downloads/', import.meta.url)
mkdirSync(downloads, { recursive: true })
copyFileSync(new URL('../../extension/dist.zip', import.meta.url), new URL('mapexporter.zip', downloads))
copyFileSync(new URL('../../extension/dist-firefox.zip', import.meta.url), new URL('mapexporter-firefox.zip', downloads))
run(['exec', 'astro', 'build', '--mode', mode])
