/**
 * 管理后台用户管理 API。
 *
 * 封装用户分页列表（用户管理页）和弹窗共用的 profile、订单列表三个只读接口。
 */
import request from "./request";
import type { AdminOrder } from "./orders";

/** 用户账号状态。 */
export type AdminUserAccountStatus = "normal" | "locked" | "deleted";

/** 产品线标识，与后端 subscription 常量一致。 */
export type AdminUserProductLine =
  | "extension"
  | "maps_extension"
  | "maps_online"
  | "maps_api";

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

/** 单产品线订阅摘要（无付费行为 = expires_at null，过期行保留原始过期时间）。 */
export interface AdminUserSubscriptionLineInfo {
  /** 产品线标识。 */
  product_line: AdminUserProductLine;
  /** 该线是否持有有效付费订阅。 */
  has_subscription: boolean;
  /** 订阅原始过期时间，毫秒时间戳。 */
  expires_at: number | null;
}

/** 单产品线当月用量快照。 */
export interface AdminUserUsageLineInfo {
  /** 产品线标识。 */
  product_line: AdminUserProductLine;
  /** 业务月，格式 YYYYMM。 */
  ym: number;
  /** 当月已用量。 */
  used: number;
  /** 当月配额总量。 */
  total: number;
  /** 当月配额是否已耗尽。 */
  exhausted: boolean;
}

/** 用户 profile 聚合响应。 */
export interface AdminUserProfileData {
  /** 用户基础信息。 */
  user: AdminUserBasicInfo;
  /** Credits 信息。 */
  credits: AdminUserCreditsInfo;
  /** 订阅摘要，固定四行：extension / maps_extension / maps_online / maps_api。 */
  subscriptions: AdminUserSubscriptionLineInfo[];
  /** 当月用量快照，固定三行：maps 三线。 */
  usage: AdminUserUsageLineInfo[];
}

/** 用户列表行。 */
export interface AdminUserListItem {
  /** 用户 ID。 */
  user_id: number;
  /** 当前邮箱。 */
  email: string | null;
  /** 注册来源。 */
  register_source: string | null;
  /** 首次注册方式。 */
  register_method: string | null;
  /** 注册时国家/地区。 */
  register_country: string | null;
  /** 账号状态。 */
  account_status: AdminUserAccountStatus;
  /** 登录次数。 */
  login_count: number;
  /** 最后登录时间，毫秒时间戳。 */
  last_login_at: number | null;
  /** 注册时间，毫秒时间戳。 */
  created_at: number;
}

/** 用户列表筛选参数。 */
export interface AdminUserListParams {
  /** 页码，从 1 开始。 */
  page: number;
  /** 每页数量，1-100。 */
  page_size: number;
  /** 用户 ID（精确匹配）。 */
  user_id?: number;
  /** 当前邮箱包含（模糊）。 */
  email?: string;
  /** 账号状态，不传 = 全部。 */
  status?: AdminUserAccountStatus;
  /** 注册时间起点，毫秒时间戳（闭开区间）。 */
  created_start?: number;
  /** 注册时间终点，毫秒时间戳（闭开区间）。 */
  created_end?: number;
}

/** 用户列表分页响应。 */
export interface AdminUsersPageData {
  /** 用户行，按 user_id 倒序。 */
  rows: AdminUserListItem[];
  /** 符合筛选条件的总数。 */
  total: number;
  /** 页码。 */
  page: number;
  /** 每页数量。 */
  page_size: number;
}

/** 分页参数。 */
export interface AdminUserPageParams {
  /** 页码，从 1 开始。 */
  page: number;
  /** 每页数量。 */
  page_size: number;
}

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

/** 查询用户分页列表。 */
export function getAdminUsers(params: AdminUserListParams) {
  return request.get<never, AdminUsersPageData>("/users", { params });
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
