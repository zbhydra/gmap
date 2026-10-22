import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const websiteDir = fileURLToPath(new URL('../', import.meta.url))
const extensionDir = fileURLToPath(new URL('../../extension/', import.meta.url))
const mode = process.argv[2] ?? 'production'
const envFile = new URL(`../.env.${mode}`, import.meta.url)
if (existsSync(envFile)) process.loadEnvFile(envFile)
for (const key of ['PUBLIC_API_BASE_URL', 'PUBLIC_SITE_URL']) {
  if (!process.env[key]?.trim()) {
    throw new Error(`官网构建：缺少 ${key}，请配置 .env.${mode} 或同名环境变量`)
  }
}

const run = (args, cwd = websiteDir, env = process.env) =>
  execFileSync('pnpm', args, { cwd, env, stdio: 'inherit' })

run(['exec', 'astro', 'check'])
run(['exec', 'vue-tsc', '--noEmit'])
run(['type-check'], extensionDir)
run(['build:store', 'chrome', 'firefox'], extensionDir, {
  ...process.env,
  EXTENSION_API_BASE_URL: process.env.PUBLIC_API_BASE_URL,
  EXTENSION_WEBSITE_BASE_URL: process.env.PUBLIC_SITE_URL
})

const downloads = new URL('../public/downloads/', import.meta.url)
mkdirSync(downloads, { recursive: true })
copyFileSync(new URL('../../extension/dist.zip', import.meta.url), new URL('mapsgrab.zip', downloads))
copyFileSync(new URL('../../extension/dist-firefox.zip', import.meta.url), new URL('mapsgrab-firefox.zip', downloads))
run(['exec', 'astro', 'build', '--mode', mode])
