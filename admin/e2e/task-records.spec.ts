/**
 * 任务记录 e2e。
 *
 * 覆盖：
 * - 菜单进入任务记录，Online 标签页加载列表；调用记录标签页首次进入才读取，且只请求一次。
 * - Online：筛选提交编号（去空白）、用户 ID、状态，刷新保留筛选，用户 ID 打开用户信息弹窗，详情展示进度与逐采样事实。
 * - 调用记录：来源、操作筛选，翻页保留筛选，详情原样展示参数 JSON、占位符与耗时，并从详情打开用户信息弹窗。
 * - 切回已进入过的标签页：保留原筛选与页码，并按其重新读取；页面不出现修改、重跑、删除类操作。
 */
import { expect, test, type Page } from "@playwright/test";
import { registerE2eBrowserIdentity } from "../scripts/playwright-browser-identity.mjs";

registerE2eBrowserIdentity(test);

/** JSON 原子值。 */
type JsonPrimitive = string | number | boolean | null;
/** JSON 对象。 */
interface JsonObject {
  /** JSON 字段值。 */
  [key: string]: JsonValue;
}
/** JSON 数组。 */
type JsonArray = JsonValue[];
/** JSON 值。 */
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/** Online 任务行 mock。 */
interface OnlineTaskMockData {
  job_no: string;
  user_id: number;
  keywords: string[];
  status: 10 | 20 | 30 | 40 | 50 | 60;
  sample_count: number;
  record_count: number;
  created_at: number;
  finished_at: number | null;
}

/** Online 逐采样事实 mock。 */
interface OnlineTaskItemMockData {
  item_index: number;
  result_count: number;
  completed: boolean;
  error_code: number | null;
  keyword: string;
  viewport: { lat: number; lng: number; zoom: number } | null;
}

/** Online 任务详情 mock。 */
interface OnlineTaskDetailMockData extends OnlineTaskMockData {
  run_no: string;
  include_contacts: boolean;
  export_locale: string;
  processed_count: number;
  has_file: boolean;
  node_name: string;
  error_code: number | null;
  started_at: number | null;
  items: OnlineTaskItemMockData[];
}

/** 调用记录行 mock。 */
interface ApiCallMockData {
  request_id: string;
  user_id: number;
  source: 2 | 3;
  operation: 1 | 2 | 3;
  status: 20 | 40 | 50 | 60;
  record_count: number | null;
  created_at: number;
  finished_at: number | null;
}

/** 调用记录详情 mock。 */
interface ApiCallDetailMockData extends ApiCallMockData {
  params: JsonObject;
  summary: JsonObject | null;
  error_code: number | null;
}

/** 分页列表 mock。 */
interface PageMockData<T> {
  rows: T[];
  total: number;
  page: number;
  page_size: number;
}

/** 用户信息弹窗 profile mock（后端 AdminUserProfileData 形状，排障字段留空值）。 */
interface UserProfileMockData {
  user: {
    user_id: number;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    register_source: string | null;
    register_method: string | null;
    register_user_agent: string | null;
    register_ip: string | null;
    register_country: string | null;
    last_login_at: number | null;
    last_login_ip: string | null;
    last_login_country: string | null;
    last_operation_ip: string | null;
    last_operation_country: string | null;
    login_count: number;
    locked_until: number | null;
    is_del: boolean;
    account_status: "normal" | "locked" | "deleted";
    created_at: number;
    updated_at: number;
  };
  credits: { balance: number };
  subscriptions: [];
  usage: [];
}

/** dashboard mock。 */
interface DashboardMockData {
  summary: Record<string, number>;
  mark_types: string[];
  rows: string[];
}

/** 本文件 route.fulfill 可返回的数据联合。 */
type MockResponseData =
  | PageMockData<OnlineTaskMockData>
  | OnlineTaskDetailMockData
  | PageMockData<ApiCallMockData>
  | ApiCallDetailMockData
  | PageMockData<never>
  | UserProfileMockData
  | DashboardMockData;

/** Online 列表请求参数。 */
interface OnlineRequestParams {
  page: string | null;
  job_no: string | null;
  user_id: string | null;
  status: string | null;
}

/** 调用记录列表请求参数。 */
interface CallRequestParams {
  page: string | null;
  source: string | null;
  operation: string | null;
}

const JOB_NO = "5d41402abc4b2a76b9719d911017c59201";
const RUN_NO = "7d793037a0760186574b0282f2f435e701";
const CALL_REQUEST_ID = "acbd18db4cc2f85cedef654fccc4a4d801";
const RECORD_NO_PLACEHOLDER = "完整编号，精确匹配";

/** 后端统一成功响应。 */
function successResponse(data: MockResponseData) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code: 10000, data, msg: "" }),
  };
}

/** 注入登录 Token 和布局依赖。 */
async function loginAsAdmin(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("admin_token", "mock-admin-jwt-token");
  });

  await page.route("**/api/admin/dashboard", async (route) => {
    await route.fulfill(
      successResponse({
        summary: {
          total_users: 0,
          new_users: 0,
          active_users_24h: 0,
          active_users_7d: 0,
        },
        mark_types: [],
        rows: [],
      }),
    );
  });
}

/** mock 两组任务记录列表与详情。 */
async function mockTaskRecordsApi(
  page: Page,
  onlineRequests: OnlineRequestParams[],
  callRequests: CallRequestParams[],
) {
  const completedTask: OnlineTaskMockData = {
    job_no: JOB_NO,
    user_id: 2001,
    keywords: ["coffee", "tea"],
    status: 40,
    sample_count: 2,
    record_count: 37,
    created_at: 1780100000000,
    finished_at: 1780100600000,
  };
  const collectingTask: OnlineTaskMockData = {
    job_no: "6f1ed002ab5595859014ebf0951522d902",
    user_id: 2002,
    keywords: ["bakery"],
    status: 20,
    sample_count: 1,
    record_count: 0,
    created_at: 1780099000000,
    finished_at: null,
  };
  const failedCall: ApiCallMockData = {
    request_id: CALL_REQUEST_ID,
    user_id: 2001,
    source: 3,
    operation: 3,
    status: 60,
    record_count: null,
    created_at: 1780100000000,
    finished_at: 1780100001500,
  };
  const partialCall: ApiCallMockData = {
    request_id: "37b51d194a7513e45b56f6524f2d51f202",
    user_id: 2002,
    source: 2,
    operation: 1,
    status: 50,
    record_count: 3,
    created_at: 1780099000000,
    finished_at: 1780099002000,
  };

  await page.route(/\/api\/admin\/task-records\/online(?:\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    onlineRequests.push({
      page: url.searchParams.get("page"),
      job_no: url.searchParams.get("job_no"),
      user_id: url.searchParams.get("user_id"),
      status: url.searchParams.get("status"),
    });
    await route.fulfill(
      successResponse({
        rows: [completedTask, collectingTask],
        total: 2,
        page: Number(url.searchParams.get("page") ?? "1"),
        page_size: Number(url.searchParams.get("page_size") ?? "20"),
      }),
    );
  });

  await page.route(new RegExp(`/api/admin/task-records/online/${JOB_NO}$`), async (route) => {
    await route.fulfill(
      successResponse({
        ...completedTask,
        run_no: RUN_NO,
        include_contacts: true,
        export_locale: "en-US",
        processed_count: 2,
        has_file: true,
        node_name: "gmap-server",
        error_code: null,
        started_at: 1780100005000,
        items: [
          {
            item_index: 0,
            result_count: 20,
            completed: true,
            error_code: null,
            keyword: "coffee",
            viewport: { lat: 40.7128, lng: -74.006, zoom: 12 },
          },
          {
            item_index: 1,
            result_count: 17,
            completed: true,
            error_code: null,
            keyword: "tea",
            viewport: null,
          },
        ],
      }),
    );
  });

  await page.route(/\/api\/admin\/task-records\/calls(?:\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    callRequests.push({
      page: url.searchParams.get("page"),
      source: url.searchParams.get("source"),
      operation: url.searchParams.get("operation"),
    });
    const pageNo = Number(url.searchParams.get("page") ?? "1");
    await route.fulfill(
      successResponse({
        rows: pageNo === 1 ? [partialCall, failedCall] : [failedCall],
        total: 21,
        page: pageNo,
        page_size: Number(url.searchParams.get("page_size") ?? "20"),
      }),
    );
  });

  await page.route(
    new RegExp(`/api/admin/task-records/calls/${CALL_REQUEST_ID}$`),
    async (route) => {
      await route.fulfill(
        successResponse({
          ...failedCall,
          params: { fid: "0x123456789abc:0xabcdef123456", max_results: 200 },
          summary: null,
          error_code: 40013,
        }),
      );
    },
  );
}

/** mock 用户信息弹窗的 profile 与订单接口。 */
async function mockUserInfoApi(page: Page) {
  await page.route(/\/api\/admin\/users\/\d+\/profile$/, async (route) => {
    await route.fulfill(
      successResponse({
        user: {
          user_id: 2001,
          email: "alpha@example.com",
          full_name: null,
          avatar_url: null,
          register_source: "web",
          register_method: "google",
          register_user_agent: null,
          register_ip: null,
          register_country: null,
          last_login_at: null,
          last_login_ip: null,
          last_login_country: null,
          last_operation_ip: null,
          last_operation_country: null,
          login_count: 1,
          locked_until: null,
          is_del: false,
          account_status: "normal",
          created_at: 1780100000000,
          updated_at: 1780100000000,
        },
        credits: { balance: 0 },
        subscriptions: [],
        usage: [],
      }),
    );
  });

  await page.route(/\/api\/admin\/users\/\d+\/orders(?:\?.*)?$/, async (route) => {
    await route.fulfill(successResponse({ rows: [], total: 0, page: 1, page_size: 20 }));
  });
}

test("任务记录两个标签页各自筛选、分页、详情并打开用户信息弹窗", async ({ page }) => {
  const onlineRequests: OnlineRequestParams[] = [];
  const callRequests: CallRequestParams[] = [];
  await loginAsAdmin(page);
  await mockTaskRecordsApi(page, onlineRequests, callRequests);
  await mockUserInfoApi(page);

  await page.goto("/");
  await page.getByRole("menu").getByText("任务记录").click();
  await expect(page).toHaveURL(/\/task-records$/);

  const onlineTab = page
    .locator(".task-records-tab")
    .filter({ has: page.getByTestId("online-status-select") });
  await expect(onlineTab.getByText(JOB_NO)).toBeVisible();
  await expect(onlineTab.getByText("coffee, tea")).toBeVisible();
  await expect(onlineTab.getByText("完成", { exact: true })).toBeVisible();
  await expect(onlineTab.getByText("采集中", { exact: true })).toBeVisible();
  await expect(onlineTab.getByText("2026-05-30 08:23:20")).toBeVisible();
  expect(callRequests).toHaveLength(0);

  // 筛选：编号去空白、用户 ID、状态（下拉第四项 = 完成）；刷新沿用当前筛选
  await onlineTab.getByPlaceholder(RECORD_NO_PLACEHOLDER).fill(` ${JOB_NO} `);
  await onlineTab.getByPlaceholder("用户 ID").fill("2001");
  await page.getByTestId("online-status-select").click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await onlineTab.getByRole("button", { name: "查询" }).click();
  await expect.poll(() => onlineRequests.at(-1)?.job_no).toBe(JOB_NO);
  await expect.poll(() => onlineRequests.at(-1)?.user_id).toBe("2001");
  await expect.poll(() => onlineRequests.at(-1)?.status).toBe("40");
  await onlineTab.getByRole("button", { name: "刷新" }).click();
  await expect.poll(() => onlineRequests.length).toBe(3);
  expect(onlineRequests.at(-1)?.job_no).toBe(JOB_NO);

  // 列表用户 ID 打开通用用户信息弹窗
  const profileRequest = page.waitForRequest(/\/api\/admin\/users\/2001\/profile$/);
  await onlineTab
    .getByRole("row", { name: new RegExp(JOB_NO) })
    .getByRole("button", { name: "2001", exact: true })
    .click();
  await profileRequest;
  const userDialog = page.getByRole("dialog").filter({ hasText: "alpha@example.com" });
  await expect(userDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(userDialog).toBeHidden();

  await onlineTab
    .getByRole("row", { name: new RegExp(JOB_NO) })
    .getByRole("button", { name: "查看" })
    .click();
  const onlineDrawer = page.getByRole("dialog").filter({ hasText: "Online 任务详情" });
  await expect(onlineDrawer.getByText(RUN_NO)).toBeVisible();
  await expect(onlineDrawer.getByText("2/2")).toBeVisible();
  await expect(onlineDrawer.getByText("en-US")).toBeVisible();
  await expect(onlineDrawer.getByText("40.7128, -74.006，缩放 12")).toBeVisible();
  // 未限定视口与无错误码都显示占位符
  const teaItemRow = onlineDrawer
    .getByRole("row")
    .filter({ has: page.getByRole("cell", { name: "tea", exact: true }) });
  await expect(teaItemRow.getByRole("cell", { name: "-", exact: true })).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(onlineDrawer).toBeHidden();

  // 调用记录标签页首次进入才读取列表
  await page.getByText("API/MCP 调用记录", { exact: true }).click();
  const callsTab = page
    .locator(".task-records-tab")
    .filter({ has: page.getByTestId("call-status-select") });
  await expect(callsTab.getByText(CALL_REQUEST_ID)).toBeVisible();
  expect(callRequests).toHaveLength(1);
  const failedRow = callsTab.getByRole("row", { name: new RegExp(CALL_REQUEST_ID) });
  await expect(failedRow).toContainText("MCP");
  await expect(failedRow).toContainText("照片");
  await expect(failedRow).toContainText("失败");
  await expect(failedRow).toContainText("2026-05-30 08:13:21");
  await expect(callsTab.getByText("局部成功", { exact: true })).toBeVisible();

  // 来源（第二项 = MCP）、操作（第三项 = 照片）筛选；翻页沿用筛选
  await page.getByTestId("call-source-select").click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByTestId("call-operation-select").click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await callsTab.getByRole("button", { name: "查询" }).click();
  await expect.poll(() => callRequests.at(-1)?.source).toBe("3");
  await expect.poll(() => callRequests.at(-1)?.operation).toBe("3");
  await callsTab.locator(".n-pagination").getByText("2", { exact: true }).click();
  await expect.poll(() => callRequests.at(-1)?.page).toBe("2");
  expect(callRequests.at(-1)?.source).toBe("3");

  await failedRow.getByRole("button", { name: "查看" }).click();
  const callDrawer = page.getByRole("dialog").filter({ hasText: "调用记录详情" });
  await expect(callDrawer.getByText('"max_results": 200')).toBeVisible();
  await expect(callDrawer.getByText("40013")).toBeVisible();
  await expect(callDrawer.getByText("1500 ms")).toBeVisible();
  const callProfileRequest = page.waitForRequest(/\/api\/admin\/users\/2001\/profile$/);
  await callDrawer.getByRole("button", { name: "2001", exact: true }).click();
  await callProfileRequest;
  await expect(userDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(userDialog).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(callDrawer).toBeHidden();

  // 切回 Online：保留原筛选，并按其重新读取一次
  await page.getByText("Online 任务", { exact: true }).click();
  await expect.poll(() => onlineRequests.length).toBe(4);
  expect(onlineRequests.at(-1)).toEqual({
    page: "1",
    job_no: JOB_NO,
    user_id: "2001",
    status: "40",
  });
  await expect(onlineTab.getByPlaceholder(RECORD_NO_PLACEHOLDER)).toHaveValue(` ${JOB_NO} `);

  // 再切回调用记录：沿用第 2 页与来源、操作筛选重新读取一次
  const callRequestCount = callRequests.length;
  await page.getByText("API/MCP 调用记录", { exact: true }).click();
  await expect.poll(() => callRequests.length).toBe(callRequestCount + 1);
  expect(callRequests.at(-1)).toEqual({ page: "2", source: "3", operation: "3" });

  await expect(page.getByRole("button", { name: "修改" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "重跑" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "删除" })).toHaveCount(0);
});
