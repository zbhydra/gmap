/**
 * 构建产物 manifest 核验(016 U5,T1 §7 U5「构建产物复核」;离线可跑)。
 *
 * 读 dist/manifest.json(freshness 由 test:e2e 的构建前置 pnpm build 保证,
 * globalSetup 已断言产物存在),断言 feat.md「非功能性需求·权限」口径:
 *
 * - permissions 仅 storage、零 host_permissions;
 * - content_scripts 仅注入 Bing Maps 搜索页(document_end);
 * - externally_connectable 为构建期 https 官网白名单(标准构建 = 占位官网域);
 * - manifest key 推导 ID = 固定扩展 ID(website 登录桥按此发消息,漂移即桥断)。
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { EXTENSION_ID, PATH_TO_EXTENSION } from './harness'

/** dist/manifest.json 的最小类型(只声明核验涉及字段,不引 any)。 */
interface DistManifest {
  manifest_version: number
  permissions?: string[]
  host_permissions?: string[]
  content_scripts?: Array<{
    matches?: string[]
    js?: string[]
    run_at?: string
  }>
  externally_connectable?: { matches?: string[] }
  key?: string
}

const manifest = JSON.parse(
  readFileSync(resolve(PATH_TO_EXTENSION, 'manifest.json'), 'utf-8')
) as DistManifest

/**
 * Chrome 扩展 ID 推导:sha256(key DER 编码)前 16 字节逐字节十六进制展开,
 * hex 位 0-f 映射 a-p(已用仓库固定 key 实测对账 pgcpggcfmfdmobpheojngndpcmnkibmm)。
 */
function extensionIdFromKey(keyBase64: string): string {
  const digest = createHash('sha256').update(Buffer.from(keyBase64, 'base64')).digest()
  return [...digest.subarray(0, 16)]
    .map(byte => 'abcdefghijklmnop'[byte >> 4] + 'abcdefghijklmnop'[byte & 0xf])
    .join('')
}

test.describe('构建产物 manifest 核验', () => {
  test('权限最小化:permissions 仅 storage、零 host_permissions', () => {
    expect(manifest.permissions).toEqual(['storage'])
    expect(manifest.host_permissions).toEqual([])
  })

  test('content_scripts 仅注入 Bing Maps 搜索页且 document_end', () => {
    expect(manifest.content_scripts).toHaveLength(1)
    const script = manifest.content_scripts?.[0]
    expect(script?.matches).toEqual(['https://www.bing.com/maps*'])
    expect(script?.run_at).toBe('document_end')
    expect(script?.js?.length ?? 0).toBeGreaterThan(0)
  })

  test('externally_connectable 为构建期 https 官网白名单', () => {
    const matches = manifest.externally_connectable?.matches ?? []
    expect(matches.length).toBeGreaterThan(0)
    for (const pattern of matches) {
      // 单一 https origin 的通配路径形态,禁止通配 scheme / 多级通配
      expect(pattern).toMatch(/^https:\/\/[^/*]+\/\*$/)
    }
    if (process.env.EXTENSION_WEBSITE_BASE_URL) {
      // 自定义官网域构建:白名单随构建期环境变量收窄
      expect(matches).toEqual([`${new URL(process.env.EXTENSION_WEBSITE_BASE_URL).origin}/*`])
    } else {
      // 标准构建(pnpm build / test:e2e):占位官网域(vite.config.ts TODO(maps))
      expect(matches).toEqual(['https://www.example.com/*'])
    }
  })

  test('manifest key 推导 ID = 固定扩展 ID(website 登录桥同源)', () => {
    expect(manifest.key, 'manifest 必须内嵌固定 key(丢失则 ID 漂移、官网桥失效)').toBeTruthy()
    expect(extensionIdFromKey(manifest.key ?? '')).toBe(EXTENSION_ID)
  })
})
