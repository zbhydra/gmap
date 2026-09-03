/**
 * InstallMarkReporter - 扩展安装埋点（SW onInstalled）。
 *
 * 按 013 域拍板 install 事件双报：
 * - 分析通道：SLS WebTracking mark-log（插件端等价 GA4 的分析通道，经 markApi）；
 * - 后端 mark 通道：POST /api/client/mark/record（经 recordBackendMark）。
 *
 * 两路相互独立，任一路失败只记录错误，不影响另一路与扩展业务（局部可失败）。
 */

import { logger } from '@/core/utils/logger'
import { markApi, recordBackendMark, MARK_TYPE } from '@/core/api/mark'

/** 上报前置任务：确保 device_id 已初始化（后端通道依赖 X-Device-Id 游客身份）。 */
type EnsureDeviceId = () => Promise<void>

/** 构造 install 打点的附加信息（版本号 + 触发原因）。 */
function buildInstallMarkMsg(reason: string): string {
  let version = ''
  try {
    version = chrome.runtime.getManifest().version
  } catch (error) {
    logger.error('[InstallMarkReporter] 读取扩展版本失败，按空版本继续:', error)
    version = ''
  }

  return `reason=${reason}, version=${version}`
}

/**
 * 双报 install 埋点。
 *
 * @param reason onInstalled 触发原因字符串（install/update/chrome_update/...）。
 * @param ensureDeviceId device_id 初始化任务，两路上报前都等待其完成。
 */
export async function reportInstallMark(
  reason: string,
  ensureDeviceId: EnsureDeviceId
): Promise<void> {
  const markMsg = buildInstallMarkMsg(reason)

  try {
    await ensureDeviceId()
  } catch (error) {
    logger.error('[InstallMarkReporter] device_id 初始化失败，仍继续上报:', error)
  }

  await reportAnalyticsLeg(markMsg)
  await reportBackendLeg(markMsg)
}

/** 分析通道（SLS WebTracking）：失败仅记录，不抛出。 */
async function reportAnalyticsLeg(markMsg: string): Promise<void> {
  try {
    const result = await markApi.record(MARK_TYPE.INSTALL, markMsg)
    logger.info(`[InstallMarkReporter] SLS 打点完成: recorded=${String(result.recorded)}`)
  } catch (error) {
    logger.error('[InstallMarkReporter] SLS install 打点失败:', error)
  }
}

/** 后端 mark 通道（/api/client/mark/record）：失败仅记录，不抛出。 */
async function reportBackendLeg(markMsg: string): Promise<void> {
  try {
    const result = await recordBackendMark(MARK_TYPE.INSTALL, markMsg)
    logger.info(`[InstallMarkReporter] 后端打点完成: recorded=${String(result.recorded)}`)
  } catch (error) {
    logger.error('[InstallMarkReporter] 后端 install 打点失败:', error)
  }
}
