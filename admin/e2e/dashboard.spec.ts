/**
 * Dashboard 数据看板 e2e
 *
 * 覆盖：
 * - 统计卡片渲染（总用户数、今日新增、24H 活跃、7D 活跃）
 * - 数据表格渲染（日期行、mark_type 动态列）
 * - 图表渲染（60 天注册柱状图 + 打点事件折线图、加载失败错误占位）
 * - 空数据处理
 */
import { expect, test, type Page } from "@playwright/test";
import { registerE2eBrowserIdentity } from "../scripts/playwright-browser-identity.mjs";

registerE2eBrowserIdentity(test);

/** Dashboard 顶部统计 mock 数据。 */
interface DashboardSummaryMock {
  total_users: number;
  new_users: number;
  new_users_yesterday_same_period: number;
  new_users_yesterday_same_period_change_percent: number | null;
  active_users_24h: number;
  active_users_7d: number;
}

/** 后端统一成功响应 */
function successResponse(data: Record<string, object>) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code: 10000, data, msg: "success" }),
  };
}

/** 注入登录 Token */
async function loginAsAdmin(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("admin_token", "mock-admin-jwt-token");
  });
}

/** Dashboard 顶部统计 mock。 */
function dashboardSummary(partial: Partial<DashboardSummaryMock> = {}) {
  return {
    total_users: 500,
    new_users: 10,
    new_users_yesterday_same_period: 5,
    new_users_yesterday_same_period_change_percent: 100,
    active_users_24h: 120,
    active_users_7d: 260,
    ...partial,
  };
}

// ========== 测试 ==========

test.describe("Dashboard 统计卡片", () => {
  test("显示总用户数、今日新增和活跃人数", async ({ page }) => {
    await loginAsAdmin(page);

    await page.route("**/api/admin/dashboard", async (route) => {
      await route.fulfill(
        successResponse({
          summary: dashboardSummary({
            total_users: 1024,
            new_users: 42,
            new_users_yesterday_same_period: 21,
            new_users_yesterday_same_period_change_percent: 100,
            active_users_24h: 88,
            active_users_7d: 320,
          }),
          mark_types: ["tg_video"],
          rows: [],
        }),
      );
    });

    await page.goto("/");
    await expect(page.getByText("1024")).toBeVisible();
    await expect(page.getByText("42")).toBeVisible();
    await expect(page.getByText("88")).toBeVisible();
    await expect(page.getByText("320")).toBeVisible();
    await expect(page.getByText("总用户数")).toBeVisible();
    await expect(
      page.getByText("今日新增 (昨日同期 21 (100%↑))"),
    ).toBeVisible();
    await expect(page.getByText("24H 活跃人数")).toBeVisible();
    await expect(page.getByText("7D 活跃人数")).toBeVisible();
  });
});

test.describe("Dashboard 数据表格", () => {
  test("渲染日期行和动态 mark_type 列", async ({ page }) => {
    await loginAsAdmin(page);

    await page.route("**/api/admin/dashboard", async (route) => {
      await route.fulfill(
        successResponse({
          summary: dashboardSummary(),
          mark_types: [
            "content_open",
            "web_first_opened",
            "web_pricing_open_from_extension",
            "web_extension_store_review_click",
            "tg_video",
            "tg_audio",
            "popup_open",
            "web_page_open",
          ],
          rows: [
            {
              date_label: "2026-06-01",
              registered_count: 5,
              metrics: {
                tg_video: { event_count: 100, device_count: 80 },
                tg_audio: { event_count: 30, device_count: 20 },
                web_first_opened: { event_count: 12, device_count: 11 },
                web_pricing_open_from_extension: { event_count: 6, device_count: 5 },
                web_extension_store_review_click: { event_count: 4, device_count: 3 },
                content_open: { event_count: 9, device_count: 8 },
                popup_open: { event_count: 5, device_count: 4 },
              },
            },
            {
              date_label: "2026-05-31",
              registered_count: 8,
              metrics: {
                tg_video: { event_count: 200, device_count: 150 },
                tg_audio: { event_count: 60, device_count: 40 },
                web_first_opened: { event_count: 20, device_count: 19 },
                web_pricing_open_from_extension: { event_count: 8, device_count: 7 },
                web_extension_store_review_click: { event_count: 2, device_count: 2 },
                content_open: { event_count: 18, device_count: 16 },
                popup_open: { event_count: 10, device_count: 8 },
              },
            },
          ],
        }),
      );
    });

    await page.goto("/");

    // 表头
    await expect(page.getByRole("columnheader", { name: "日期" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "注册数" })).toBeVisible();

    // mark_type 列头（每个 mark_type 一列，列名就是 mark_type 本身）
    await expect(
      page.getByRole("columnheader", { name: "web_first_opened" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", {
        name: "web_extension_store_review_click",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "tg_video" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "tg_audio" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "content_open" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "popup_open" }),
    ).toBeVisible();
    // web_page_open 仍属隐藏列；死成员（web_parse_input_click 等）已无枚举与上报方，不再进入 mock
    await expect(
      page.getByRole("columnheader", { name: "web_page_open" }),
    ).toHaveCount(0);

    const headerNames = (await page.getByRole("columnheader").allTextContents()).map(
      (text) => text.trim(),
    );
    expect(headerNames.indexOf("web_first_opened")).toBe(2);
    expect(headerNames.indexOf("web_first_opened")).toBeLessThan(
      headerNames.indexOf("web_pricing_open_from_extension"),
    );
    expect(headerNames.indexOf("web_pricing_open_from_extension")).toBeLessThan(
      headerNames.indexOf("web_extension_store_review_click"),
    );
    expect(headerNames.indexOf("web_extension_store_review_click")).toBeLessThan(
      headerNames.indexOf("tg_video"),
    );
    expect(headerNames.indexOf("tg_audio")).toBeLessThan(
      headerNames.indexOf("content_open"),
    );
    expect(headerNames.indexOf("content_open")).toBeLessThan(
      headerNames.indexOf("popup_open"),
    );

    // 数据行
    await expect(page.getByRole("cell", { name: "2026-06-01" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "2026-05-31" })).toBeVisible();

    // 单元格内 "事件数/设备数" 格式
    await expect(page.getByRole("cell", { name: "12/11" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "20/19" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "4/3" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "2/2" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "100/80" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "30/20" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "200/150" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "60/40" })).toBeVisible();
  });

  test("不分页，直接展示 60 条数据", async ({ page }) => {
    await loginAsAdmin(page);

    const rows = Array.from({ length: 65 }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return {
        date_label: `day-${day}`,
        registered_count: index + 1,
        metrics: {
          tg_video: { event_count: index + 1, device_count: index + 1 },
        },
      };
    });

    await page.route("**/api/admin/dashboard", async (route) => {
      await route.fulfill(
        successResponse({
          summary: dashboardSummary(),
          mark_types: ["tg_video"],
          rows,
        }),
      );
    });

    await page.goto("/");

    await expect(page.locator(".n-pagination")).toHaveCount(0);
    await expect(page.getByRole("cell", { name: "day-01" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "day-60" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "day-61" })).toHaveCount(0);
  });
});

test.describe("Dashboard 图表", () => {
  test("渲染 60 天注册柱状图与打点事件折线图", async ({ page }) => {
    await loginAsAdmin(page);

    await page.route("**/api/admin/dashboard", async (route) => {
      await route.fulfill(
        successResponse({
          summary: dashboardSummary(),
          mark_types: ["tg_video", "tg_audio"],
          rows: [
            {
              date_label: "2026-06-01",
              registered_count: 5,
              metrics: {
                tg_video: { event_count: 100, device_count: 80 },
                tg_audio: { event_count: 30, device_count: 20 },
              },
            },
            {
              date_label: "2026-05-31",
              registered_count: 8,
              metrics: {
                tg_video: { event_count: 200, device_count: 150 },
                tg_audio: { event_count: 60, device_count: 40 },
              },
            },
            {
              date_label: "2026-05-30",
              registered_count: 3,
              metrics: {
                tg_video: { event_count: 150, device_count: 90 },
                tg_audio: { event_count: 45, device_count: 25 },
              },
            },
          ],
        }),
      );
    });

    await page.goto("/");

    // 两个图表卡片标题
    await expect(page.getByText("60 天注册趋势")).toBeVisible();
    await expect(page.getByText("60 天打点事件趋势")).toBeVisible();

    // 两个图表各渲染一个 canvas，且有实际绘制内容（非全透明位图）
    const canvases = page.locator(".dashboard-view canvas");
    await expect(canvases).toHaveCount(2);
    await expect
      .poll(async () =>
        canvases.evaluateAll((nodes) =>
          nodes.map((node) => {
            if (!(node instanceof HTMLCanvasElement)) {
              return false;
            }
            const context = node.getContext("2d");
            if (!context) {
              return false;
            }
            const { data } = context.getImageData(
              0,
              0,
              node.width,
              node.height,
            );
            for (let index = 3; index < data.length; index += 4) {
              if (data[index] !== 0) {
                return true;
              }
            }
            return false;
          }),
        ),
      )
      .toEqual([true, true]);
  });

  test("加载失败时图表区显示错误占位且表格不受影响", async ({ page }) => {
    await loginAsAdmin(page);

    await page.route("**/api/admin/dashboard", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ code: 50000, msg: "mock internal error" }),
      });
    });

    await page.goto("/");

    // 两个图表卡片都显示错误占位，不再渲染 canvas
    await expect(page.getByText("图表加载失败")).toHaveCount(2);
    await expect(page.locator(".dashboard-view canvas")).toHaveCount(0);

    // 下方表格卡片仍正常渲染（空数据），不被图表错误拖垮
    await expect(page.getByRole("columnheader", { name: "日期" })).toBeVisible();
  });
});

test.describe("Dashboard 空数据", () => {
  test("无数据时统计卡片显示 0", async ({ page }) => {
    await loginAsAdmin(page);

    await page.route("**/api/admin/dashboard", async (route) => {
      await route.fulfill(
        successResponse({
          summary: dashboardSummary({
            total_users: 0,
            new_users: 0,
            new_users_yesterday_same_period: 0,
            new_users_yesterday_same_period_change_percent: 0,
            active_users_24h: 0,
            active_users_7d: 0,
          }),
          mark_types: [],
          rows: [],
        }),
      );
    });

    await page.goto("/");

    // 统计卡片显示 0
    const zeros = page.getByText("0", { exact: true });
    await expect(zeros.first()).toBeVisible();
  });
});
