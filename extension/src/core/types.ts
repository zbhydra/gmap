/**
 * 统一类型定义
 *
 * 设计原则：只定义跨模块通信的"契约"类型，内部实现细节不导出
 * 参考: @docs/analysis/04-event-communication.md - 事件通信机制
 */

import {
  RESOURCE_TYPES,
  RESOURCE_SOURCE_KINDS,
  type ResourceType,
  type ResourceSourceKind,
  MIME_TYPE_MAP,
  RESOURCE_EXTENSION_MAP,
  getDefaultResourceExtension,
  getExtensionFromMimeType
} from './constants/resource'

// ============================================================================
// 资源类型（重新导出）
// ============================================================================
export {
  RESOURCE_TYPES,
  RESOURCE_SOURCE_KINDS,
  type ResourceType,
  type ResourceSourceKind,
  MIME_TYPE_MAP,
  RESOURCE_EXTENSION_MAP,
  getDefaultResourceExtension,
  getExtensionFromMimeType
}

// ============================================================================
// 数据结构（跨模块传递）
// ============================================================================

/**
 * 下载元数据
 */
export interface DownloadMetadata {
  /** 所属消息 ID */
  messageId: string
}

/** Telegram A Document 的稳定查询身份。 */
export type TelegramAResourceIdentity =
  | { kind: 'document'; documentId: string }
  | { kind: 'message'; chatId: string; messageId: string }
  | { kind: 'webPage'; url: string }

/** Telegram A identity 的跨 content/injected 无歧义比较键。 */
export function getTelegramAResourceIdentityKey(identity: TelegramAResourceIdentity): string {
  switch (identity.kind) {
    case 'document':
      return `document\0${identity.documentId}`
    case 'message':
      return `message\0${identity.chatId}\0${identity.messageId}`
    case 'webPage':
      return `webPage\0${identity.url}`
  }
}

/**
 * 消息中的媒体资源
 */
export interface MediaResource {
  /** 跨 URL、来源与扫描轮次保持稳定的资源唯一 lookup key。 */
  id: string
  /** 所属消息ID */
  messageId: string
  /** Telegram 完整消息 ID（格式：${peerId}_${mid}），K 内部资源查找使用 */
  messageFullId?: string
  /** 在消息中的索引（0-based） */
  index: number
  /** 媒体URL */
  url: string
  /** 资源类型 */
  type: ResourceType
  /** 资源来源类型 */
  sourceKind: ResourceSourceKind
  /** 文件名 */
  filename?: string
  /** 文件大小 */
  size?: number
  /** 缩略图URL */
  thumbnail?: string
  /** MIME 类型，优先来自 Telegram document 元数据 */
  mimeType?: string
  /** Telegram document ID */
  documentId?: string
  /** Telegram A Document 查询与 prepare 共用的稳定身份。 */
  telegramAIdentity?: TelegramAResourceIdentity
  /** 视频编码信息 */
  codec?: string
  /** 媒体宽度 */
  width?: number
  /** 媒体高度 */
  height?: number
  /** 媒体时长（秒） */
  duration?: number
  /** 所属聊天ID */
  chatId?: string
  /** 下载元数据（下载时必填） */
  metadata: DownloadMetadata
}

/** 下载管理入口可见的未完成任务状态。 */
export type DownloadTaskStatus = 'waiting' | 'downloading' | 'failed'

/**
 * 单个未完成下载任务的只读快照。
 *
 * taskId 区分同一资源的重复点击；resourceId 只用于匹配来自页面下载器的进度事件。
 */
export interface DownloadTaskSnapshot {
  /** 本次下载任务 ID，同一资源重复下载时仍保持唯一。 */
  taskId: string
  /** 原始媒体资源 ID。 */
  resourceId: string
  /** 已确认的最终保存文件名；A 主消息 Document 等待解析时缺失。 */
  filename?: string
  /** 媒体类型。 */
  type: ResourceType
  /** 媒体在所属消息中的 0-based 索引。 */
  resourceIndex: number
  /** 当前未完成状态；取消完成后任务直接从快照移除。 */
  status: DownloadTaskStatus
  /** 活动传输是否拥有真实中止协议；waiting 的本地移除不受此字段限制。 */
  activeTransferCancellable: boolean
  /** 当前下载百分比；总大小未知或尚未开始报告时为 null。 */
  progress: number | null
  /** 已接收字节；没有可靠来源时为 null。 */
  receivedBytes: number | null
  /** 总字节；优先使用传输响应大小，其次使用资源声明大小。 */
  totalBytes: number | null
  /** 每秒接收字节；至少两个有效字节样本后才有值。 */
  bytesPerSecond: number | null
  /** 字节与速度是否由百分比和声明大小估算。 */
  bytesAreEstimated: boolean
}

/** 当前页面全部未完成下载任务的版本化快照。 */
export interface DownloadQueueSnapshot {
  /** 页面 content 生命周期唯一 ID，用于隔离不同标签页和页面重载。 */
  scopeId: string
  /** 每次任务或进度变化递增，用于丢弃乱序事件。 */
  revision: number
  /** 按任务创建顺序排列的未完成任务。 */
  tasks: DownloadTaskSnapshot[]
}

/**
 * 消息对象（核心数据结构）
 *
 * 扫描器直接返回此类型，包含消息及其所有资源
 */
export interface MessageObject {
  /** 聊天ID */
  chat_id: string
  /** 消息ID */
  message_id: string
  /** 是否已注入下载按钮 */
  is_injected: boolean
  /** 是否为相册（多附件） */
  is_album: boolean
  /** 消息中的媒体资源列表 */
  resources: MediaResource[]
}

// ============================================================================
// 认证相关类型
// ============================================================================

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  user_id: number
  /** 邮箱 */
  email: string | null
  /** 全名 */
  full_name: string | null
  /** 头像URL */
  avatar_url: string | null
  /** 创建时间戳 */
  created_at: number
}
