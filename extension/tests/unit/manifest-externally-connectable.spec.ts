import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** extension 包根目录。 */
const extensionRoot = path.resolve(__dirname, '../..')
/** 构建产物 manifest 路径。 */
const distManifestPath = path.join(extensionRoot, 'dist', 'manifest.json')
/** vite build 单次约 1 分钟，远超全局 testTimeout。 */
const BUILD_TIMEOUT_MS = 120_000

/** 构建产物 manifest 的最小类型。 */
interface BuiltManifest {
  /** Chrome Web Store public key，用于固定 unpacked 扩展 ID。 */
  key?: string
  /** 站点业务 content scripts。 */
  content_scripts?: Array<{ matches?: string[] }>
  /** 平台域 host 权限。 */
  host_permissions?: string[]
  /** 官网外部消息来源白名单。 */
  externally_connectable?: { matches?: string[] }
  /** 扩展页面 CSP；主扩展应省略并使用 Chrome MV3 默认策略。 */
  content_security_policy?: { extension_pages?: string }
}

/** 按 Chrome 规则从 manifest public key 推导扩展 ID。 */
function deriveChromeExtensionId(publicKey: string): string {
  const digest = createHash('sha256')
    .update(Buffer.from(publicKey, 'base64'))
    .digest()
    .subarray(0, 16)
  return Array.from(digest, byte => {
    const high = String.fromCharCode(97 + (byte >> 4))
    const low = String.fromCharCode(97 + (byte & 15))
    return `${high}${low}`
  }).join('')
}

describe('manifest build artifacts', () => {
  it(
    'keeps the website domain out of content_scripts and host_permissions, only in externally_connectable',
    () => {
      // 测试自身触发生产构建，不依赖残留 dist/，确保断言的是当前 vite.config 组装结果。
      const viteBin = path.join(extensionRoot, 'node_modules', '.bin', 'vite')
      execFileSync(viteBin, ['build'], {
        cwd: extensionRoot,
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      })

      const manifest = JSON.parse(readFileSync(distManifestPath, 'utf8')) as BuiltManifest

      expect(manifest.key).toBeTruthy()
      expect(deriveChromeExtensionId(manifest.key ?? '')).toBe(
        'lflkobgaibapekhjnfhkaeagdnojjnla'
      )
      // 官网来源只经 externally_connectable 授权：恰为官网裸域 + www 两项。
      expect(manifest.externally_connectable?.matches).toEqual([
        'https://telegramdownloadmedia.com/*',
        'https://www.telegramdownloadmedia.com/*'
      ])
      // 官网 content script（旧 bridge）已退役，content_scripts 不得注入官网域。
      const allContentScriptMatches =
        manifest.content_scripts?.flatMap(script => script.matches ?? []) ?? []
      expect(
        allContentScriptMatches.some(match => match.includes('telegramdownloadmedia.com'))
      ).toBe(false)
      // 官网域依赖 externally_connectable，不进 host_permissions（不产生 host access 警告）。
      expect(
        manifest.host_permissions?.some(host => host.includes('telegramdownloadmedia.com'))
      ).toBe(false)
      expect(manifest.content_security_policy).toBeUndefined()
    },
    BUILD_TIMEOUT_MS
  )

  it(
    'keeps the development unpacked build on its separate fixed extension id',
    () => {
      const viteBin = path.join(extensionRoot, 'node_modules', '.bin', 'vite')
      execFileSync(viteBin, ['build'], {
        cwd: extensionRoot,
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'development' }
      })

      const manifest = JSON.parse(readFileSync(distManifestPath, 'utf8')) as BuiltManifest

      expect(manifest.key).toBeTruthy()
      expect(deriveChromeExtensionId(manifest.key ?? '')).toBe(
        'cknimihpjagocmakbkplpjdcgjlbnkec'
      )
      expect(manifest.externally_connectable?.matches).toEqual(['http://localhost:9620/*'])
      expect(manifest.content_security_policy).toBeUndefined()
    },
    BUILD_TIMEOUT_MS
  )

  it(
    'keeps the pre-release build on production services with its separate fixed extension id',
    () => {
      const viteBin = path.join(extensionRoot, 'node_modules', '.bin', 'vite')
      execFileSync(viteBin, ['build'], {
        cwd: extensionRoot,
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'production',
          EXTENSION_RELEASE_CHANNEL: 'pre-release'
        }
      })

      const manifest = JSON.parse(readFileSync(distManifestPath, 'utf8')) as BuiltManifest

      expect(manifest.key).toBeTruthy()
      expect(deriveChromeExtensionId(manifest.key ?? '')).toBe(
        'cknimihpjagocmakbkplpjdcgjlbnkec'
      )
      expect(manifest.externally_connectable?.matches).toEqual([
        'https://telegramdownloadmedia.com/*',
        'https://www.telegramdownloadmedia.com/*'
      ])
      expect(manifest.content_security_policy).toBeUndefined()
    },
    BUILD_TIMEOUT_MS
  )
})
