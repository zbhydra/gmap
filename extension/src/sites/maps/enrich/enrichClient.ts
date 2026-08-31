/**
 * Maps Email/社媒补全 content 侧编排（013 A4，U8）。
 *
 * 职责：从采集行收集有官网（domain）的目标 → 按 ≤50 条/批经 background RPC
 * 调 enrich 端点（content 不直连后端，零 CORS 面，与 usage 通道同构）→
 * 把结果写回行对象（Email 列逗号分隔、Social Medias 列 `平台: url` 多行，
 * 逆向 04 列格式）→ 发 enrich_complete 打点（成功/失败均报）。
 *
 * 无 domain 行跳过（服务端也无数据源可抓）；失败语义与「失败收敛空结果」
 * 声明一致：单批失败只损失该批（行 Email/Social Medias 保持空串），记录后
 * 继续剩余批次，不中止整次补全；存在失败批次时 ok=false（enrich_complete
 * 打点携带），导出与批量推进照常执行——用户可见的是部分行为空，而非中断。
 */

import { logger } from '@/core/utils/logger'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import type { ChromeEventEmitter } from '@/core/rpc'
import type { ExtensionEvents } from '@/core/events/types'
import type { MapsPlaceRow } from '../content/parser'
import type { MapsEnrichBusinessInput, MapsEnrichResult } from './types'
import { ENRICH_PLATFORM_ORDER } from './types'

/** 单批商家数上限（服务端 pydantic 同款上限，超出 422）。 */
export const ENRICH_BATCH_SIZE = 50

/** 补全运行结果摘要（打点与观测用）。 */
export interface EnrichRunSummary {
  /** 本次提交补全的目标数（按 domain 去重后）。 */
  totalTargets: number
  /** 写回数据的行数（同域名多行都会写）。 */
  writtenRows: number
  /** 批预算截断标注（服务端返回）。 */
  partial: boolean
  /** 整体是否成功（任何批次异常为 false；失败仍返回空结果语义）。 */
  ok: boolean
}

/** enrichRows 运行选项。 */
export interface EnrichRunOptions {
  /** 批大小（默认 50；测试注入小值验证分批）。 */
  batchSize?: number
  /** 每批完成（含失败）后回调（批量模式借此回报进展、重置卡死时钟）。 */
  onBatchSettled?: () => void
}

/** 归一化域名用于去重与写回匹配（大小写不敏感）。 */
function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase()
}

/**
 * 收集补全目标：有 domain 的行按 domain 去重（同域多行共用一次补全），
 * 无 domain 行跳过。顺序保持首见序，保证与批次结果位置对齐可稳定写回。
 */
export function collectEnrichTargets(rows: readonly MapsPlaceRow[]): MapsEnrichBusinessInput[] {
  const seen = new Set<string>()
  const targets: MapsEnrichBusinessInput[] = []
  for (const row of rows) {
    const domain = normalizeDomain(row.domain)
    if (domain.length === 0 || seen.has(domain)) {
      continue
    }
    seen.add(domain)
    targets.push({
      domain,
      website: row.website,
      name: row.name,
      address: row.fullAddress
    })
  }
  return targets
}

/** 社媒结果 → 导出列文本：`平台: url` 多行（canonical 平台序，逆向 04 格式）。 */
export function formatSocialMedias(medias: Record<string, string>): string {
  const platforms = [
    ...ENRICH_PLATFORM_ORDER.filter(platform => platform in medias),
    ...Object.keys(medias).filter(platform => !ENRICH_PLATFORM_ORDER.includes(platform))
  ]
  return platforms.map(platform => `${platform}: ${medias[platform]}`).join('\n')
}

/** 把单条补全结果写回同域名的全部行，返回写回行数。 */
function applyResultToRows(
  rows: readonly MapsPlaceRow[],
  domain: string,
  result: MapsEnrichResult
): number {
  let written = 0
  for (const row of rows) {
    if (normalizeDomain(row.domain) !== domain) {
      continue
    }
    row.email = result.emails.join(',')
    row.socialMedias = formatSocialMedias(result.medias)
    written += 1
  }
  return written
}

/**
 * 对采集行执行补全并写回（调用时机：采集 complete 边沿、开关开启时）。
 *
 * 失败语义（per-batch continue）：单批异常（RpcTimeoutError 等）不上抛也不
 * 中止循环——该批行保持空值、ok 置 false，继续剩余批次；整次结束后统一发
 * enrich_complete 打点。调用方（finalize 边沿）无需感知失败即可继续导出与
 * 批量推进（局部可失败）。
 *
 * @param rows 采集行（就地写回 email/socialMedias 字段）。
 * @param emitter 业务事件广播器（enrich_complete 打点经 background 写 SLS）。
 * @param options 批大小与每批完成回调。
 */
export async function enrichRows(
  rows: readonly MapsPlaceRow[],
  emitter: ChromeEventEmitter<ExtensionEvents>,
  options: EnrichRunOptions = {}
): Promise<EnrichRunSummary> {
  const batchSize = options.batchSize ?? ENRICH_BATCH_SIZE
  const targets = collectEnrichTargets(rows)
  const summary: EnrichRunSummary = {
    totalTargets: targets.length,
    writtenRows: 0,
    partial: false,
    ok: true
  }

  const channel = new BackgroundChannel()
  try {
    for (let start = 0; start < targets.length; start += batchSize) {
      const batch = targets.slice(start, start + batchSize)
      try {
        const response = await channel.enrichMapsBusinesses({ businesses: batch })
        summary.partial = summary.partial || response.partial
        response.results.forEach((result, index) => {
          const target = batch[index]
          if (target) {
            summary.writtenRows += applyResultToRows(rows, target.domain, result)
          }
        })
      } catch (error) {
        // 单批失败只损失该批（行保持空串），继续剩余批次——不中止整次补全。
        summary.ok = false
        logger.error('[MapsEnrich] 批次补全失败（该批按空结果跳过，继续剩余批次）:', error)
      } finally {
        options.onBatchSettled?.()
      }
    }
  } finally {
    channel.destroy()
  }

  emitter.emit('mapsEnrichCompleteMark', {
    markMsg:
      `count=${summary.totalTargets}, written=${summary.writtenRows}, ` +
      `partial=${summary.partial}, ok=${summary.ok}`,
    pageUrl: location.href
  })
  return summary
}
