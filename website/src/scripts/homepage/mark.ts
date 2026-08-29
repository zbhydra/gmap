import { postJson, type RequestContext } from './api'
import { ensureFirstOpenedAt } from './device'
import { sanitizeMarkText, sanitizeMarkUrl } from './mark-sanitizer'
import { reportHomepageMarkToSls } from './sls-mark'

export const HOMEPAGE_MARK_TYPE = {
  WEB_FIRST_OPENED: 'web_first_opened',
  WEB_PRICING_OPEN_FROM_EXTENSION: 'web_pricing_open_from_extension',
  WEB_EXTENSION_STORE_REVIEW_CLICK: 'web_extension_store_review_click',
  WEB_EXTENSION_INSTALL_CLICK: 'web_extension_install_click',
  WEB_CREDIT_PURCHASE_MODAL_OPEN: 'web_credit_purchase_modal_open',
  WEB_CREDIT_PURCHASE_BUY_CLICK: 'web_credit_purchase_buy_click'
} as const

type HomepageMarkType = (typeof HOMEPAGE_MARK_TYPE)[keyof typeof HOMEPAGE_MARK_TYPE]

interface HomepageMarkResponse {
  recorded: boolean
}

const MAX_MARK_MSG_LENGTH = 1000
const MAX_MARK_URL_LENGTH = 240
const MAX_MARK_FILENAME_LENGTH = 80
const MAX_MARK_RESOURCE_COUNT = 3

/** 埋点里允许出现的资源摘要字段。 */
export interface HomepageMarkResource {
  sourceId: string
  filename: string
  type: string
  size: number | null
  link?: string
  platform?: string
}

interface HomepageMarkResourceSummary {
  source_id: string
  filename: string
  type: string
  size: number
  message_id?: string
}

function truncateText(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : value.slice(0, maxLength)
}

function summarizeResource(resource: HomepageMarkResource): HomepageMarkResourceSummary {
  const summary: HomepageMarkResourceSummary = {
    source_id: truncateText(sanitizeMarkText(resource.sourceId), 64),
    filename: truncateText(sanitizeMarkText(resource.filename), MAX_MARK_FILENAME_LENGTH),
    type: truncateText(resource.type, 32),
    size: resource.size ?? 0
  }

  return summary
}

/** 构造 mark_msg JSON；整体超长时逐级降级，禁止切出无效 JSON。 */
export function buildHomepageMarkMessage(
  url: string,
  resources?: HomepageMarkResource | HomepageMarkResource[]
): string {
  const normalizedUrl = truncateText(sanitizeMarkUrl(url), MAX_MARK_URL_LENGTH)
  const resourceList = Array.isArray(resources) ? resources : resources ? [resources] : []

  if (resourceList.length === 0) {
    return JSON.stringify({ url: normalizedUrl })
  }

  const summarizedResources = resourceList
    .slice(0, MAX_MARK_RESOURCE_COUNT)
    .map(summarizeResource)

  const fullPayload = {
    url: normalizedUrl,
    resource_count: resourceList.length,
    resources: summarizedResources
  }
  const fullPayloadText = JSON.stringify(fullPayload)
  if (fullPayloadText.length <= MAX_MARK_MSG_LENGTH) {
    return fullPayloadText
  }

  const reducedPayloadText = JSON.stringify({
    url: normalizedUrl,
    resource_count: resourceList.length,
    resources: summarizedResources.map(resource => ({
      source_id: resource.source_id,
      type: resource.type
    }))
  })
  if (reducedPayloadText.length <= MAX_MARK_MSG_LENGTH) {
    return reducedPayloadText
  }

  return JSON.stringify({ resource_count: resourceList.length })
}

export async function recordHomepageMark(
  markType: HomepageMarkType,
  context: RequestContext,
  markMsg = ''
): Promise<void> {
  reportHomepageMarkToSls(markType, context, markMsg)

  await postJson<HomepageMarkResponse>('/api/client/mark/record', context, {
    mark_type: markType,
    mark_msg: markMsg,
    first_opened_at: ensureFirstOpenedAt()
  })
}
