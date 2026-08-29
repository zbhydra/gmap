/**
 * 管理后台通用用户信息弹窗 API。
 *
 * 封装用户 profile 和订单列表两个只读接口。
 */
import request from "./request";
import type { AdminOrder } from "./orders";

/** 用户账号状态。 */
export type AdminUserAccountStatus = "normal" | "locked" | "deleted";

/** 用户基础信息。 */
export interface AdminUserBasicInfo {
  /** 用户 ID。 */
  user_id: number;
  /** 当前邮箱。 */
  email: string | null;
  /** 当前用户昵称。 */
  full_name: string | null;
  /** 当前头像 URL。 */
  avatar_url: string | null;
  /** 注册来源。 */
  register_source: string | null;
  /** 首次注册方式。 */
  register_method: string | null;
  /** 注册 User-Agent。 */
  register_user_agent: string | null;
  /** 注册 IP。 */
  register_ip: string | null;
  /** 注册 IP 归属地。 */
  register_country: string | null;
  /** 最后登录时间，毫秒时间戳。 */
  last_login_at: number | null;
  /** 最后登录 IP。 */
  last_login_ip: string | null;
  /** 最后登录 IP 归属地。 */
  last_login_country: string | null;
  /** 最后操作 IP。 */
  last_operation_ip: string | null;
  /** 最后操作 IP 归属地。 */
  last_operation_country: string | null;
  /** 登录次数。 */
  login_count: number;
  /** 锁定截止时间，毫秒时间戳。 */
  locked_until: number | null;
  /** 是否已注销。 */
  is_del: boolean;
  /** 账号状态。 */
  account_status: AdminUserAccountStatus;
  /** 注册时间，毫秒时间戳。 */
  created_at: number;
  /** 更新时间，毫秒时间戳。 */
  updated_at: number;
}

/** 用户 Credits 信息。 */
export interface AdminUserCreditsInfo {
  /** 当前 Credits 余额。 */
  balance: number;
}

/** 用户订阅信息。 */
export interface AdminUserSubscriptionInfo {
  /** 是否有有效订阅。 */
  has_subscription: boolean;
  /** 原始订阅过期时间，毫秒时间戳。 */
  expires_at: number | null;
}

/** 用户 profile 聚合响应。 */
export interface AdminUserProfileData {
  /** 用户基础信息。 */
  user: AdminUserBasicInfo;
  /** Credits 信息。 */
  credits: AdminUserCreditsInfo;
  /** 订阅信息。 */
  subscription: AdminUserSubscriptionInfo;
}

/** 分页参数。 */
export interface AdminUserPageParams {
  /** 页码，从 1 开始。 */
  page: number;
  /** 每页数量。 */
  page_size: number;
}

/** 用户最近下载分页响应。 */
/** 用户订单分页响应。 */
export interface AdminUserOrdersPageData {
  /** 订单行。 */
  rows: AdminOrder[];
  /** 总数。 */
  total: number;
  /** 页码。 */
  page: number;
  /** 每页数量。 */
  page_size: number;
}

/** 查询用户 profile 聚合信息。 */
export function getAdminUserProfile(userId: number) {
  return request.get<never, AdminUserProfileData>(`/users/${userId}/profile`);
}

/** 查询用户订单分页。 */
export function getAdminUserOrders(userId: number, params: AdminUserPageParams) {
  return request.get<never, AdminUserOrdersPageData>(`/users/${userId}/orders`, {
    params,
  });
}
