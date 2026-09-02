/**
 * 构建产物 manifest 核验(006 §4.4 v3 browser identity 口径;离线可跑)。
 *
 * 读 dist/manifest.json(freshness 由 test:e2e 的构建前置 pnpm build 保证,
 * globalSetup 已断言产物存在),断言:
 *
 * - permissions = storage + identity(v3 登录 chrome.identity.launchWebAuthFlow)、
 *   零 host_permissions;
 * - 无 externally_connectable、无固定 key(v2 官网推送桥已整体删除,不登记
 *   扩展 ID,扩展 ID 不再可预知);
 * - content_scripts 仅注入 Bing Maps 搜索页(document_end)。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { PATH_TO_EXTENSION } from './harness'

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

test.describe('构建产物 manifest 核验', () => {
  test('permissions = storage + identity(v3 登录)、零 host_permissions', () => {
    expect(manifest.permissions).toEqual(['storage', 'identity'])
    expect(manifest.host_permissions).toEqual([])
  })

  test('v2 官网推送桥残留清零:无 externally_connectable、无固定 key', () => {
    expect(manifest.externally_connectable).toBeUndefined()
    expect(manifest.key).toBeUndefined()
  })

  test('content_scripts 仅注入 Bing Maps 搜索页且 document_end', () => {
    expect(manifest.content_scripts).toHaveLength(1)
    const script = manifest.content_scripts?.[0]
    expect(script?.matches).toEqual(['https://www.bing.com/maps*'])
    expect(script?.run_at).toBe('document_end')
    expect(script?.js?.length ?? 0).toBeGreaterThan(0)
  })
})
