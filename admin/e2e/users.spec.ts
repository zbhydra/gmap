/**
 * 用户管理 e2e。
 *
 * 覆盖：
 * - 菜单进入用户管理，列表加载与状态 tag 渲染。
 * - 筛选提交用户 ID、邮箱、账号状态（参数断言）、重置、分页翻页。
 * - 用户 ID 点击打开用户信息弹窗，权益区渲染四线订阅 + 三线用量。
 * - 空数据占位。
 * - 页面不出现用户写操作。
 */
import { expect, test, type Page } from "@playwright/test";
import { registerE2eBrowserIdentity } from "../scripts/playwright-browser-identity.mjs";

registerE2eBrowserIdentity(test);

/** 账号状态。 */
type AccountStatus = "normal" | "locked" | "deleted";

/** 用户列表行 mock。 */
interface AdminUserRowMockData {
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
  account_status: AccountStatus;
  /** 登录次数。 */
  login_count: number;
  /** 最后登录时间。 */
  last_login_at: number | null;
  /** 注册时间。 */
  created_at: number;
}

/** 用户列表 mock。 */
interface AdminUsersListMockData {
  /** 用户行。 */
  rows: AdminUserRowMockData[];
  /** 总数。 */
  total: number;
  /** 页码。 */
  page: number;
  /** 每页数量。 */
  page_size: number;
}

/** 单产品线订阅摘要 mock。 */
interface SubscriptionLineMockData {
  /** 产品线标识。 */
  product_line: string;
  /** 是否有效订阅。 */
  has_subscription: boolean;
  /** 原始过期时间。 */
  expires_at: number | null;
}

/** 单产品线用量 mock。 */
interface UsageLineMockData {
  /** 产品线标识。 */
  product_line: string;
  /** 业务月 YYYYMM。 */
  ym: number;
  /** 已用量。 */
  used: number;
  /** 配额总量。 */
  total: number;
  /** 是否耗尽。 */
  exhausted: boolean;
}

/** profile mock。 */
interface UserProfileMockData {
  /** 基础信息（后端 AdminUserBasicInfo 形状，排障字段留空值）。 */
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
    account_status: AccountStatus;
    created_at: number;
    updated_at: number;
  };
  /** Credits。 */
  credits: { balance: number };
  /** 订阅摘要四行。 */
  subscriptions: SubscriptionLineMockData[];
  /** 用量快照三行。 */
  usage: UsageLineMockData[];
}

/** 用户订单分页 mock。 */
interface UserOrdersMockData {
  /** 订单行。 */
  rows: [];
  /** 总数。 */
  total: number;
  /** 页码。 */
  page: number;
  /** 每页数量。 */
  page_size: number;
}

/** 本文件 route.fulfill 可返回的数据联合。 */
type MockResponseData =
  | AdminUsersListMockData
  | UserProfileMockData
  | UserOrdersMockData;

/** 最近一次用户列表请求参数。 */
interface UsersRequestParams {
  /** 页码。 */
  page: string | null;
  /** 每页数量。 */
  page_size: string | null;
  /** 用户 ID。 */
  user_id: string | null;
  /** 邮箱。 */
  email: string | null;
  /** 账号状态。 */
  status: string | null;
  /** 注册时间起点。 */
  created_start: string | null;
  /** 注册时间终点。 */
  created_end: string | null;
}

/** 后端统一成功响应。 */
function successResponse(data: MockResponseData) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code: 10000, data, msg: "" }),
  };
}

/** 创建测试用户行。 */
function userRow(partial: Partial<AdminUserRowMockData>): AdminUserRowMockData {
  return {
    user_id: 2001,
    email: "alpha@example.com",
    register_source: "web",
    register_method: "google",
    register_country: "US",
    account_status: "normal",
    login_count: 12,
    last_login_at: 1780100000000,
    created_at: 1780100000000,
    ...partial,
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

/** mock 用户列表、profile 和弹窗订单接口。 */
async function mockUsersApi(page: Page, requests: UsersRequestParams[]) {
  const firstUser = userRow({});
  const secondUser = userRow({
    user_id: 2002,
    email: "beta@example.com",
    account_status: "locked",
    login_count: 3,
  });
  const thirdUser = userRow({
    user_id: 2003,
    email: null,
    account_status: "deleted",
    register_source: null,
    register_country: null,
    last_login_at: null,
  });

  await page.route(/\/api\/admin\/users(?:\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    requests.push({
      page: url.searchParams.get("page"),
      page_size: url.searchParams.get("page_size"),
      user_id: url.searchParams.get("user_id"),
      email: url.searchParams.get("email"),
      status: url.searchParams.get("status"),
      created_start: url.searchParams.get("created_start"),
      created_end: url.searchParams.get("created_end"),
    });
    const pageNo = Number(url.searchParams.get("page") ?? "1");
    await route.fulfill(
      successResponse({
        rows: pageNo === 1 ? [firstUser, secondUser, thirdUser] : [secondUser],
        total: 51,
        page: pageNo,
        page_size: Number(url.searchParams.get("page_size") ?? "20"),
      }),
    );
  });

  const profile: UserProfileMockData = {
    user: {
      user_id: 2001,
      email: "alpha@example.com",
      full_name: null,
      avatar_url: null,
      register_source: "web",
      register_method: "google",
      register_user_agent: null,
      register_ip: "127.0.0.1",
      register_country: "US",
      last_login_at: 1780100000000,
      last_login_ip: "127.0.0.1",
      last_login_country: "US",
      last_operation_ip: null,
      last_operation_country: null,
      login_count: 12,
      locked_until: null,
      is_del: false,
      account_status: "normal",
      created_at: 1780100000000,
      updated_at: 1780100000000,
    },
    credits: { balance: 66 },
    subscriptions: [
      { product_line: "extension", has_subscription: true, expires_at: 1780100000000 },
      { product_line: "maps_extension", has_subscription: false, expires_at: 1780100000000 },
      { product_line: "maps_online", has_subscription: false, expires_at: null },
      { product_line: "maps_api", has_subscription: true, expires_at: 1780100000000 },
    ],
    usage: [
      { product_line: "maps_extension", ym: 202609, used: 320, total: 1000, exhausted: false },
      { product_line: "maps_online", ym: 202609, used: 40, total: 40, exhausted: true },
      { product_line: "maps_api", ym: 202609, used: 5, total: 100, exhausted: false },
    ],
  };

  await page.route(/\/api\/admin\/users\/\d+\/profile$/, async (route) => {
    await route.fulfill(successResponse(profile));
  });

  await page.route(/\/api\/admin\/users\/\d+\/orders(?:\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill(
      successResponse({
        rows: [],
        total: 0,
        page: Number(url.searchParams.get("page") ?? "1"),
        page_size: Number(url.searchParams.get("page_size") ?? "20"),
      }),
    );
  });
}

test("用户管理支持筛选、分页和弹窗权益区展示", async ({ page }) => {
  const requests: UsersRequestParams[] = [];
  await loginAsAdmin(page);
  await mockUsersApi(page, requests);

  await page.goto("/");
  await page.getByRole("menu").getByText("用户管理").click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByText("alpha@example.com").first()).toBeVisible();
  await expect(page.getByText("beta@example.com").first()).toBeVisible();
  await expect(page.getByText("2026-05-30 08:13:20").first()).toBeVisible();

  // 账号状态 tag：正常 / 锁定 / 已注销
  await expect(page.getByText("正常", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("锁定", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("已注销", { exact: true }).first()).toBeVisible();

  // 筛选提交：用户 ID、邮箱、账号状态（下拉第二项 = 锁定）
  await page.getByPlaceholder("用户 ID").fill("2001");
  await page.getByPlaceholder("邮箱包含匹配").fill("alpha@example.com");
  await page.getByTestId("user-status-select").click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "查询" }).click();

  await expect.poll(() => requests.at(-1)?.user_id).toBe("2001");
  await expect.poll(() => requests.at(-1)?.email).toBe("alpha@example.com");
  await expect.poll(() => requests.at(-1)?.status).toBe("locked");

  await page.getByRole("button", { name: "重置" }).click();
  await expect.poll(() => requests.at(-1)?.user_id).toBeNull();
  await expect.poll(() => requests.at(-1)?.email).toBeNull();
  await expect.poll(() => requests.at(-1)?.status).toBeNull();

  // 用户 ID 点击打开弹窗，权益区渲染四线订阅 + 三线用量
  await page.getByRole("button", { name: "2001", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // 产品线 label：TG 插件仅订阅区一行，maps 三线在订阅区 + 用量区各一行
  await expect(dialog.getByText("TG 插件", { exact: true })).toHaveCount(1);
  await expect(dialog.getByText("Maps 插件", { exact: true })).toHaveCount(2);
  await expect(dialog.getByText("Maps 云端", { exact: true })).toHaveCount(2);
  await expect(dialog.getByText("Maps API", { exact: true })).toHaveCount(2);
  await expect(dialog.getByText("订阅中", { exact: true })).toHaveCount(2);
  await expect(dialog.getByText("未订阅", { exact: true })).toHaveCount(2);
  // 过期行保留原始过期时间（maps_extension 已过期）；未订阅行不显示时间
  await expect(dialog.getByText("2026-05-30 08:13:20").first()).toBeVisible();
  await expect(dialog.getByText("2026-09 · 320/1000")).toBeVisible();
  await expect(dialog.getByText("2026-09 · 40/40")).toBeVisible();
  await expect(dialog.getByText("2026-09 · 5/100")).toBeVisible();
  await expect(dialog.getByText("已耗尽", { exact: true })).toBeVisible();

  await page.keyboard.press("Escape");

  // 分页翻页（第 2 页只含 2002）
  await page.locator(".n-pagination").getByText("2", { exact: true }).click();
  await expect.poll(() => requests.at(-1)?.page).toBe("2");

  // 只读页面：不出现用户写操作
  await expect(page.getByRole("button", { name: "编辑" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "封禁" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "充值" })).toHaveCount(0);
});

test("无匹配用户时列表显示空态占位", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("admin_token", "mock-admin-jwt-token");
  });

  await page.route(/\/api\/admin\/users(?:\?.*)?$/, async (route) => {
    await route.fulfill(
      successResponse({ rows: [], total: 0, page: 1, page_size: 20 }),
    );
  });

  await page.goto("/users");
  await expect(page.locator(".n-data-table-empty")).toBeVisible();
  await expect(page.getByRole("button", { name: "2001" })).toHaveCount(0);
});
