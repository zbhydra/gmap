/**
 * 工具页共用 DOM 辅助（W4 工具矩阵）。
 *
 * 提供：结果复制（剪贴板 + toast 反馈）、进页埋点（tool_view）与通用元素
 * 查询。工具页 script 均为命令式 DOM，无框架依赖（spec-website §1）。
 */

import { showSiteToast } from '../site/toast'
import { collectUtmParams, reportGA4Event } from '../homepage/ga4'

/** 查询必需元素；缺失抛可定位错误（模板契约破坏必须显式暴露）。 */
export function queryRequired<T extends HTMLElement>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector)
  if (!element) {
    throw new Error(`[tool-dom] Missing element: ${selector}`)
  }
  return element
}

/**
 * 复制文本到剪贴板，成功后弹 toast 反馈。
 *
 * 剪贴板 API 不可用（http 环境/权限拒绝）时回退到临时 textarea + execCommand。
 */
export async function copyTextWithFeedback(text: string, feedback: string): Promise<void> {
  let copied = false
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      copied = true
    } catch (error) {
      console.error('[tool-dom] navigator.clipboard write failed, falling back.', error)
    }
  }
  if (!copied) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.append(textarea)
    textarea.select()
    try {
      copied = document.execCommand('copy')
    } catch (error) {
      console.error('[tool-dom] execCommand copy failed.', error)
    }
    textarea.remove()
  }

  if (copied) {
    showSiteToast(feedback, { type: 'info' })
  } else {
    showSiteToast(feedback, { type: 'error' })
  }
}

/** 上报工具页进入事件（015 feat 埋点表 tool_view，带页面 utm 归因；gtag 未注入时静默跳过）。 */
export function reportToolView(toolId: string): void {
  reportGA4Event('tool_view', { tool_id: toolId, ...collectUtmParams(window.location.href) })
}
