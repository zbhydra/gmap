/**
 * 管理后台任务记录只读查询 API。
 *
 * Online 任务与 API/MCP 调用记录是两组独立的列表与详情，各自分页、筛选。
 * 编号格式为 32 位小写 hex 加两位分表槽号，筛选时精确匹配；时间筛选为毫秒闭开区间。
 */
import request from "./request";
import type { JsonObject } from "./orders";

/** Online 任务状态：10=排队，20=采集中，30=发布中，40=完成，50=局部成功，60=失败。 */
export type OnlineTaskStatus = 10 | 20 | 30 | 40 | 50 | 60;

/** 调用记录状态：20=处理中，40=完成，50=局部成功，60=失败；同步调用没有排队与发布阶段。 */
export type ApiCallStatus = 20 | 40 | 50 | 60;

/** 调用来源：2=API，3=MCP（用 API Key 调用 MCP 也记为 MCP）。 */
export type ApiCallSource = 2 | 3;

/** 调用操作：1=搜索，2=评论，3=照片。 */
export type ApiCallOperation = 1 | 2 | 3;

/** Online 任务列表行。 */
export interface AdminOnlineTask {
  /** 任务编号。 */
  job_no: string;
  /** 用户 ID。 */
  user_id: number;
  /** 去重后的关键词，保持输入顺序。 */
  keywords: string[];
  /** 任务状态。 */
  status: OnlineTaskStatus;
  /** 逻辑采样项数。 */
  sample_count: number;
  /** CSV 已写行数，与用户端历史的结果数同义。 */
  record_count: number;
  /** 创建时间，毫秒时间戳。 */
  created_at: number;
  /** 结束时间，毫秒时间戳；未结束为 null。 */
  finished_at: number | null;
}

/** 采样视口。 */
export interface AdminOnlineTaskViewport {
  /** 纬度。 */
  lat: number;
  /** 经度。 */
  lng: number;
  /** 地图缩放级别，1-21。 */
  zoom: number;
}

/** Online 任务逐采样执行事实。 */
export interface AdminOnlineTaskItem {
  /** 采样项在任务输入中的下标，从 0 开始。 */
  item_index: number;
  /** 该采样已写入的结果数。 */
  result_count: number;
  /** 该采样是否已采集完毕。 */
  completed: boolean;
  /** 该采样的错误码；无错误为 null。 */
  error_code: number | null;
  /** 采样关键词。 */
  keyword: string;
  /** 采样视口；未限定视口为 null。 */
  viewport: AdminOnlineTaskViewport | null;
}

/** Online 任务详情：列表行加唯一 Run 的执行进度与逐采样事实。 */
export interface AdminOnlineTaskDetail extends AdminOnlineTask {
  /** 执行编号。 */
  run_no: string;
  /** 是否采集联系方式。 */
  include_contacts: boolean;
  /** 导出语言。 */
  export_locale: string;
  /** 已采集完毕的采样项数。 */
  processed_count: number;
  /** 结果文件是否已发布。 */
  has_file: boolean;
  /** 执行节点名。 */
  node_name: string;
  /** 任务错误码；无错误为 null。 */
  error_code: number | null;
  /** 开始执行时间，毫秒时间戳；未开始为 null。 */
  started_at: number | null;
  /** 逐采样执行事实。 */
  items: AdminOnlineTaskItem[];
}

/** Online 任务列表筛选参数。 */
export interface AdminOnlineTaskListParams {
  /** 页码，从 1 开始。 */
  page: number;
  /** 每页数量，1-100。 */
  page_size: number;
  /** 任务编号（精确匹配）。 */
  job_no?: string;
  /** 用户 ID。 */
  user_id?: number;
  /** 任务状态。 */
  status?: OnlineTaskStatus;
  /** 创建时间起点，毫秒时间戳（含）。 */
  created_from_ms?: number;
  /** 创建时间终点，毫秒时间戳（不含）。 */
  created_to_ms?: number;
}

/** Online 任务列表响应。 */
export interface AdminOnlineTaskListData {
  /** 任务行，按创建时间、任务编号倒序。 */
  rows: AdminOnlineTask[];
  /** 符合筛选条件的总数。 */
  total: number;
  /** 页码。 */
  page: number;
  /** 每页数量。 */
  page_size: number;
}

/** API/MCP 调用记录列表行。 */
export interface AdminApiCall {
  /** 请求编号，同时是用量流水的 request_id。 */
  request_id: string;
  /** 用户 ID。 */
  user_id: number;
  /** 调用来源。 */
  source: ApiCallSource;
  /** 调用操作。 */
  operation: ApiCallOperation;
  /** 调用状态。 */
  status: ApiCallStatus;
  /** 结果数量，取自摘要；处理中与失败为 null。 */
  record_count: number | null;
  /** 开始时间，毫秒时间戳。 */
  created_at: number;
  /** 结束时间，毫秒时间戳；处理中为 null。 */
  finished_at: number | null;
}

/** API/MCP 调用记录详情。 */
export interface AdminApiCallDetail extends AdminApiCall {
  /** 校验后的业务参数，按操作原样回显。 */
  params: JsonObject;
  /** 终态摘要，按操作原样回显；处理中与失败为 null。 */
  summary: JsonObject | null;
  /** 失败错误码；未失败为 null。 */
  error_code: number | null;
}

/** 调用记录列表筛选参数。 */
export interface AdminApiCallListParams {
  /** 页码，从 1 开始。 */
  page: number;
  /** 每页数量，1-100。 */
  page_size: number;
  /** 请求编号（精确匹配）。 */
  request_id?: string;
  /** 用户 ID。 */
  user_id?: number;
  /** 调用状态。 */
  status?: ApiCallStatus;
  /** 调用来源。 */
  source?: ApiCallSource;
  /** 调用操作。 */
  operation?: ApiCallOperation;
  /** 开始时间起点，毫秒时间戳（含）。 */
  created_from_ms?: number;
  /** 开始时间终点，毫秒时间戳（不含）。 */
  created_to_ms?: number;
}

/** 调用记录列表响应。 */
export interface AdminApiCallListData {
  /** 调用行，按开始时间、请求编号倒序。 */
  rows: AdminApiCall[];
  /** 符合筛选条件的总数。 */
  total: number;
  /** 页码。 */
  page: number;
  /** 每页数量。 */
  page_size: number;
}

/** 查询 Online 任务列表。 */
export function getAdminOnlineTasks(params: AdminOnlineTaskListParams) {
  return request.get<never, AdminOnlineTaskListData>("/task-records/online", { params });
}

/** 查询 Online 任务详情。 */
export function getAdminOnlineTaskDetail(jobNo: string) {
  return request.get<never, AdminOnlineTaskDetail>(
    `/task-records/online/${encodeURIComponent(jobNo)}`,
  );
}

/** 查询 API/MCP 调用记录列表。 */
export function getAdminApiCalls(params: AdminApiCallListParams) {
  return request.get<never, AdminApiCallListData>("/task-records/calls", { params });
}

/** 查询 API/MCP 调用记录详情。 */
export function getAdminApiCallDetail(requestId: string) {
  return request.get<never, AdminApiCallDetail>(
    `/task-records/calls/${encodeURIComponent(requestId)}`,
  );
}
