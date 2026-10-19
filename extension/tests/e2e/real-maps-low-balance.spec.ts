/** 真实隔离账号的月余额裁剪与照片页重置验收；仅退回本轮预占。 */
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import type { MapsUsageSnapshot } from '../../src/sites/maps/usage/types'
import type { MapsUsageReportResponse } from '../../src/sites/maps/usage/usageApi'
import {
  injectExtensionAuth,
  launchRealMapsContext,
  parseCsv,
  readDownload,
  skipSmoke,
  waitForExtensionServiceWorker,
  type MapsE2eAuth
} from './harness'

const rawAuth = process.env.E2E_MAPS_AUTH
const auth: MapsE2eAuth | null = rawAuth ? (JSON.parse(rawAuth) as MapsE2eAuth) : null
const apiOrigin = 'http://127.0.0.1:7600'
const placeUrl =
  'https://www.google.com/maps/place/Gold+coffee/@40.7451277,-73.9783508,17z/data=!3m1!4b1!4m6!3m5!1s0x89c2597ca044ec9b:0xa0acdb1716592b4d!8m2!3d40.7451277!4d-73.9783508!16s%2Fg%2F11kqkzz1cl?hl=en'
const quotaMessage = 'Your monthly records are used up. View plans or check again after upgrading.'

test('月余额 2 截断真实照片，额度 0 时 Reset 保留结果并提示', async () => {
  test.setTimeout(180_000)
  if (!auth) {
    skipSmoke('本地 backend 或隔离 seed 不可用')
    return
  }
  const context = await launchRealMapsContext()
  const drainId = randomUUID()
  const refundId = `${drainId}:refund`
  const headers = { Authorization: `Bearer ${auth.access_token}` }
  let drained = 0
  try {
    const baselineResponse = await context.request.get(`${apiOrigin}/api/client/maps/usage`, {
      headers
    })
    const baseline: { code: number; data: MapsUsageSnapshot } = await baselineResponse.json()
    expect(baseline.code).toBe(10000)
    const drainRecords = baseline.data.total - baseline.data.used - 2
    expect(drainRecords).toBeGreaterThan(0)
    const drainResponse = await context.request.post(
      `${apiOrigin}/api/client/maps/usage/report`,
      { headers, data: { records: drainRecords, request_id: drainId } }
    )
    const drain: { code: number; data: MapsUsageReportResponse } = await drainResponse.json()
    expect(drain.code).toBe(10000)
    expect(drain.data.deducted).toBe(true)
    drained = drainRecords
    expect(drain.data.total - drain.data.used).toBe(2)

    const serviceWorker = await waitForExtensionServiceWorker(context)
    await injectExtensionAuth(serviceWorker, auth)
    const place = context.pages()[0] ?? (await context.newPage())
    await place.goto(placeUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 })
    await expect(place.getByRole('heading', { name: 'Gold coffee', exact: true })).toBeVisible()
    const photosButton = place.getByRole('button', {
      name: 'Start Extracting Photos',
      exact: true
    })
    await expect(photosButton).toBeEnabled({ timeout: 30_000 })
    const photoPageOpened = context.waitForEvent('page')
    const reported = context
      .waitForEvent('response', {
        predicate: response =>
          response.request().method() === 'POST' &&
          response.url().endsWith('/api/client/maps/usage/report'),
        timeout: 90_000
      })
      .catch(() => null)
    await photosButton.click()
    const photos = await photoPageOpened
    const panel = photos.locator('#gmap-extractor-photos-panel-host .mgp')
    const exportPhotos = panel.getByRole('button', {
      name: /^Export 2 photos\s*CSV$/,
      exact: true
    })
    await expect(exportPhotos).toBeVisible({ timeout: 60_000 })
    await expect(panel.getByRole('button', { name: 'Reset', exact: true })).toBeVisible()
    const reportResponse = await reported
    expect(reportResponse, '照片完成后应真实上报用量').not.toBeNull()
    if (reportResponse === null) throw new Error('照片完成后未上报用量')
    const report: { code: number; data: MapsUsageReportResponse } =
      await reportResponse.json()
    expect(report.code).toBe(10000)
    expect(report.data.deducted).toBe(true)
    expect(report.data.used).toBe(drain.data.used + 2)
    expect(report.data.exhausted).toBe(true)
    await photos.screenshot({ path: test.info().outputPath('photos-balance-two.png') })
    const download = await readDownload(photos, () => exportPhotos.click())
    const csvPath = test.info().outputPath('photos-balance-two.csv')
    await download.saveAs(csvPath)
    const rows = parseCsv(readFileSync(csvPath, 'utf8'))
    expect(rows[0]).toEqual(['Photo URL', 'Video URL'])
    expect(rows).toHaveLength(3)

    let photoRequestsAfterReset = 0
    photos.on('request', request => {
      if (request.url().includes('rpcids=wTe8We')) photoRequestsAfterReset += 1
    })
    await panel.getByRole('button', { name: 'Reset', exact: true }).click()
    await expect(panel.getByText(quotaMessage, { exact: true })).toBeVisible()
    await expect(exportPhotos).toBeVisible()
    await photos.waitForTimeout(500)
    expect(photoRequestsAfterReset).toBe(0)
    await photos.screenshot({ path: test.info().outputPath('photos-quota-zero-reset.png') })
    writeFileSync(
      test.info().outputPath('low-balance-usage.json'),
      JSON.stringify({ baseline, drain, report, photoRequestsAfterReset, drainId, refundId }, null, 2)
    )
  } finally {
    try {
      await context.close()
    } finally {
      if (drained > 0) {
      // 用现有退回服务抵消本轮预占；真实采集的两条消费保留。
      const backendDir = resolve(process.cwd(), '../backend')
      const cleanup = execFileSync(
        resolve(backendDir, '.venv/bin/python'),
        [
          '-c',
          `import asyncio,json,sys
from app.core.database import get_engine
from app.services.usage_service import extension_usage_service
async def main():
 await extension_usage_service.refund(user_id=int(sys.argv[1]),records=int(sys.argv[2]),request_id=sys.argv[3])
 print(json.dumps((await extension_usage_service.get_usage("u:"+sys.argv[1],user_id=int(sys.argv[1])))._asdict()))
 await get_engine().dispose()
asyncio.run(main())`,
          String(auth.user.user_id),
          String(drained),
          refundId
        ],
        { cwd: backendDir, stdio: ['ignore', 'pipe', 'pipe'] }
      )
      writeFileSync(test.info().outputPath('low-balance-refund.json'), cleanup)
      }
    }
  }
})
