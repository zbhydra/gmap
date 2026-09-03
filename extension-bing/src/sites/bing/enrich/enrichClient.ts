/**
 * Email/社媒补全 content 侧编排（016 E6 二期）。
 *
 * 职责：Pro 会话采集完成边沿，把行内 5 个云端挖掘列（Emails / Social
 * Medias / Facebook / Instagram / Twitter）从 `###PRO###` 占位换为服务端
 * 补全结果——免费/匿名行保持占位（营销锁定钩子），Pro 行先清占位（权益已
 * 解锁，无数据留空），再按结果写回。
 *
 * 编排与 gmap 线 `extension/src/sites/maps/enrich/enrichClient.ts` 同构：
 * 从采集行收集有 website 的目标 → 按 website 主机名去重分批（≤50）→ 经
 * background RPC 调 enrich 端点（content 不直连后端，零 CORS 面）→ 写回
 * 行对象 → enrich_complete 打点（成功/失败均报）。
 *
 * 失败语义（局部可失败）：单批异常不上抛也不中止循环——该批行保持空值、
 * ok 置 false，继续剩余批次；用户可见的是部分行为空，而非中断。无 website
 * 行无数据源可挖，跳过请求但同样清占位。
 */

import { logger } from '@/core/utils/logger'
import { MARK_TYPE } from '@/core/api/mark/types'
import { BackgroundChannel } from '@/content/rpc/background.rpc'
import { recordContentMark } from '../content/marks'
import type { BingExportRow } from '../content/parser'
import type { EnrichBusinessInput, EnrichResult } from './types'
import { ENRICH_PLATFORM_ORDER } from './types'

/** 单批商家数上限（服务端 pydantic 同款上限，超出 422）。 */
export const ENRICH_BATCH_SIZE = 50

/** 补全运行结果摘要（打点与观测用）。 */
export interface EnrichRunSummary {
  /** 本次提交补全的目标数（按 website 主机名去重后）。 */
  totalTargets: number
  /** 写回数据的行数（同域名多行都会写）。 */
  writtenRows: number
  /** 批预算截断标注（服务端返回）。 */
  partial: boolean
  /** 整体是否成功（任何批次异常为 false）。 */
  ok: boolean
}

/**
 * 归一化 website 主机名（补协议后解析，去端口，小写，去尾点）——去重与
 * 写回匹配的统一键；非法/空 website 返回空串。
 */
export function websiteKey(website: string): string {
  const source = website.includes('://') ? website : `https://${website}`
  if (!URL.canParse(source)) {
    return ''
  }
  return new URL(source).hostname.toLowerCase().replace(/\.$/, '')
}

/** 社媒结果 → Social Medias 聚合列文本：`平台: url` 多行（canonical 平台序）。 */
export function formatSocialMedias(medias: Record<string, string>): string {
  const platforms = [
    ...ENRICH_PLATFORM_ORDER.filter(platform => platform in medias),
    ...Object.keys(medias).filter(platform => !ENRICH_PLATFORM_ORDER.includes(platform))
  ]
  return platforms.map(platform => `${platform}: ${medias[platform]}`).join('\n')
}

/**
 * 收集补全目标：有 website 的行按主机名去重（同域多行共用一次补全），
 * 无 website 行跳过。顺序保持首见序，保证与批次结果位置对齐可稳定写回。
 */
export function collectEnrichTargets(rows: readonly BingExportRow[]): EnrichBusinessInput[] {
  const seen = new Set<string>()
  const targets: EnrichBusinessInput[] = []
  for (const row of rows) {
    const key = websiteKey(row.website)
    if (key.length === 0 || seen.has(key)) {
      continue
    }
    seen.add(key)
    targets.push({ domain: '', website: row.website, name: row.name, address: row.address })
  }
  return targets
}

/** 清空单行 5 个云端挖掘列（Pro 行去占位：权益已解锁，无数据留空）。 */
function clearProPlaceholders(row: BingExportRow): void {
  row.emails = ''
  row.socialMedias = ''
  row.facebook = ''
  row.instagram = ''
  row.twitter = ''
}

/** 把单条补全结果写回同主机名的全部行（5 列就地覆盖），返回写回行数。 */
function applyResultToRows(
  rows: readonly BingExportRow[],
  key: string,
  result: EnrichResult
): number {
  let written = 0
  for (const row of rows) {
    if (websiteKey(row.website) !== key) {
      continue
    }
    row.emails = result.emails.join(',')
    row.socialMedias = formatSocialMedias(result.medias)
    row.facebook = result.medias.facebook ?? ''
    row.instagram = result.medias.instagram ?? ''
    row.twitter = result.medias.twitter ?? ''
    written += 1
  }
  return written
}

/** enrichRows 运行选项。 */
export interface EnrichRunOptions {
  /** 批大小（默认 50；测试注入小值验证分批）。 */
  batchSize?: number
}

/**
 * 对采集行执行补全并写回（调用时机：Pro 会话 complete 边沿；免费/匿名会话
 * 不调用，行保持 ###PRO### 占位）。
 *
 * 失败语义（per-batch continue）：单批异常（RpcTimeoutError 等）不上抛也不
 * 中止循环——该批行保持空值、ok 置 false，继续剩余批次；整次结束后统一发
 * enrich_complete 打点。调用方（complete 边沿）无需感知失败（局部可失败）。
 *
 * @param rows 采集行（就地写回 5 个云端挖掘列；占位先清后写）。
 */
export async function enrichRows(
  rows: readonly BingExportRow[],
  options: EnrichRunOptions = {}
): Promise<EnrichRunSummary> {
  const batchSize = options.batchSize ?? ENRICH_BATCH_SIZE
  // 先统一清占位：无论后续批次成败，Pro 行不再携带 ###PRO###（锁定标记仅对
  // 免费档有意义）；批量开始前清空也避免「部分行占位部分行数据」的混合形态。
  for (const row of rows) {
    clearProPlaceholders(row)
  }

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
        const response = await channel.enrichBusinesses({ businesses: batch })
        summary.partial = summary.partial || response.partial
        response.results.forEach((result, index) => {
          const target = batch[index]
          if (target) {
            summary.writtenRows += applyResultToRows(rows, websiteKey(target.website), result)
          }
        })
      } catch (error) {
        // 单批失败只损失该批（行保持空串），继续剩余批次——不中止整次补全。
        summary.ok = false
        logger.error('[BingEnrich] 批次补全失败（该批按空结果跳过，继续剩余批次）:', error)
      }
    }
  } finally {
    channel.destroy()
  }

  recordContentMark(
    MARK_TYPE.ENRICH_COMPLETE,
    `count=${summary.totalTargets}, written=${summary.writtenRows}, ` +
      `partial=${summary.partial}, ok=${summary.ok}`
  )
  return summary
}
