/**
 * 统一类型定义
 *
 * 设计原则：只定义跨模块通信的"契约"类型，内部实现细节不导出。
 * Maps 插件的采集数据结构（商家/评论/照片行）在 013 域实现时按
 * docs/feat/013.Maps插件/references/A5 的导出 schema 定义于此。
 */

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
