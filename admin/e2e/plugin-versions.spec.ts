import { expect, test } from "@playwright/test";
import { registerE2eBrowserIdentity } from "../scripts/playwright-browser-identity.mjs";
import type { PluginVersion, PluginVersionCreate } from "../src/api/plugin-versions";

registerE2eBrowserIdentity(test);

test("插件版本支持校验、失败保留、筛选分页和启停确认", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("admin_token", "plugin-version-admin-token");
    localStorage.setItem("admin_locale", "zh-CN");
  });
  await page.route("**/api/admin/auth/me", (route) =>
    route.fulfill({
      json: { code: 10000, data: { username: "versions-admin" }, msg: "" },
    }),
  );
  const timestamp = 1793952000000;
  const records: PluginVersion[] = Array.from({ length: 19 }, (_, index) => ({
    id: index + 1,
    plugin: "maps",
    version: `1.0.${index}`,
    is_enabled: false,
    update_url: "https://example.com/maps",
    created_at: timestamp,
    updated_at: timestamp,
    is_recommended: false,
  }));
  const high: PluginVersion = {
    id: 21,
    plugin: "maps",
    version: "1.10.0",
    is_enabled: true,
    is_recommended: true,
    update_url: "https://example.com/maps",
    created_at: timestamp,
    updated_at: timestamp,
  };
  records.push({ ...high, id: 20, plugin: "bing" }, high);
  const created: PluginVersion = { ...high, id: 22, version: "1.9.0", is_recommended: false };
  const createBody: PluginVersionCreate = {
    plugin: "maps",
    version: "1.9.0",
    is_enabled: true,
    update_url: "https://example.com/maps",
  };
  const editedUrl = "https://example.com/maps/new";
  const mutations = [
    { path: "/plugin-versions", body: { ...createBody, version: "1.10.0" }, code: 400, row: null },
    { path: "/plugin-versions", body: createBody, code: 10000, row: created },
    { path: "/plugin-versions/22", body: { update_url: editedUrl }, code: 500, row: null },
    {
      path: "/plugin-versions/22",
      body: { update_url: editedUrl },
      code: 10000,
      row: { ...created, update_url: editedUrl },
    },
    {
      path: "/plugin-versions/22",
      body: { is_enabled: false },
      code: 10000,
      row: { ...created, update_url: editedUrl, is_enabled: false },
    },
    {
      path: "/plugin-versions/22",
      body: { is_enabled: true },
      code: 10000,
      row: { ...created, update_url: editedUrl },
    },
  ];
  const requests: URL[] = [];
  await page.route(/\/api\/admin\/plugin-versions(?:\/\d+)?(?:\?.*)?$/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "GET") {
      requests.push(url);
      const plugin = url.searchParams.get("plugin");
      const pageNo = Number(url.searchParams.get("page"));
      const pageSize = Number(url.searchParams.get("page_size"));
      const filtered = records
        .filter((row) => !plugin || row.plugin === plugin)
        .sort((a, b) => b.id - a.id);
      await route.fulfill({
        json: {
          code: 10000,
          msg: "",
          data: {
            rows: filtered.slice((pageNo - 1) * pageSize, pageNo * pageSize),
            total: filtered.length,
            page: pageNo,
            page_size: pageSize,
          },
        },
      });
      return;
    }
    const mutation = mutations.shift();
    expect(mutation).toBeDefined();
    if (!mutation) throw new Error("插件版本收到多余的保存请求");
    expect(url.pathname).toBe(`/api/admin${mutation.path}`);
    expect(request.postDataJSON()).toEqual(mutation.body);
    if (mutation.row) {
      const index = records.findIndex((row) => row.id === mutation.row.id);
      if (index < 0) records.push(mutation.row);
      else records[index] = mutation.row;
    }
    await route.fulfill({ json: { code: mutation.code, data: mutation.row, msg: "" } });
  });

  await page.goto("/plugin-versions");
  await expect(page.getByRole("menu").getByText("插件版本", { exact: true })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Bing 插件" })).toBeVisible();
  await page.getByRole("button", { name: "新增版本", exact: true }).click();
  const editor = page.getByRole("dialog");
  await expect(editor.getByRole("switch")).toBeChecked();
  await editor.getByLabel("版本号", { exact: true }).fill("01.2.3");
  await editor.getByLabel("更新地址", { exact: true }).fill("ftp://example.com/maps");
  await editor.getByRole("button", { name: "保存", exact: true }).click();
  await expect(editor.getByText(/请输入三段数字版本号/)).toBeVisible();
  await expect(editor.getByText("请输入有效的 HTTP 或 HTTPS 更新地址")).toBeVisible();
  expect(mutations).toHaveLength(6);

  await editor.getByLabel("版本号", { exact: true }).fill("1.10.0");
  await editor.getByLabel("更新地址", { exact: true }).fill(createBody.update_url);
  await editor.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("该插件的版本号已存在，请修改版本号后重试")).toBeVisible();
  await expect(editor.getByLabel("版本号", { exact: true })).toHaveValue("1.10.0");
  await editor.getByLabel("版本号", { exact: true }).fill(" 1.9.0 ");
  await editor.getByRole("button", { name: "保存", exact: true }).click();
  await expect(editor).not.toBeVisible();
  const lowRow = page
    .getByRole("row")
    .filter({ has: page.getByRole("cell", { name: "1.9.0", exact: true }) });
  const highRow = page
    .getByRole("row")
    .filter({ has: page.getByRole("cell", { name: "1.10.0", exact: true }) });
  await expect(lowRow).toContainText("已启用");
  await expect(highRow).toContainText("推荐版本");
  await expect(page.getByRole("row").filter({ hasText: "Bing 插件" })).toHaveCount(0);
  await expect.poll(() => requests.at(-1)?.searchParams.get("plugin")).toBe("maps");
  await page.locator(".n-pagination").getByText("2", { exact: true }).click();
  await expect.poll(() => requests.at(-1)?.searchParams.get("page")).toBe("2");
  await page.locator(".plugin-filter").click();
  await page.locator(".n-base-select-option").getByText("Bing 插件", { exact: true }).click();
  await expect.poll(() => requests.at(-1)?.searchParams.get("page")).toBe("1");
  await expect(page.getByRole("row").filter({ hasText: "Bing 插件" })).toBeVisible();
  await page.locator(".plugin-filter").click();
  await page
    .locator(".n-base-select-option")
    .getByText("Google Maps 插件", { exact: true })
    .click();
  await expect(lowRow).toBeVisible();
  await lowRow.getByRole("button", { name: "修改更新地址" }).click();
  await expect(editor.getByLabel("版本号", { exact: true })).toHaveAttribute("readonly");
  await expect(editor.locator(".n-base-selection")).toHaveClass(/n-base-selection--disabled/);
  await editor.getByLabel("更新地址", { exact: true }).fill(editedUrl);
  await editor.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("保存失败，请重试")).toBeVisible();
  await expect(editor.getByLabel("更新地址", { exact: true })).toHaveValue(editedUrl);
  await editor.getByRole("button", { name: "保存", exact: true }).click();
  await expect(editor).not.toBeVisible();
  await expect(lowRow).toContainText(editedUrl);

  await lowRow.getByRole("button", { name: "禁用", exact: true }).click();
  const confirmation = page.getByRole("dialog");
  await expect(confirmation).toContainText("禁用 Google Maps 插件 1.9.0？");
  await expect(confirmation).toContainText("仍有更高的启用版本");
  await confirmation.getByRole("button", { name: "禁用", exact: true }).click();
  await expect(confirmation).not.toBeVisible();
  await expect(lowRow).toContainText("已禁用");
  await lowRow.getByRole("button", { name: "重新启用", exact: true }).click();
  await expect(lowRow).toContainText("已启用");
  await highRow.getByRole("button", { name: "禁用", exact: true }).click();
  await expect(confirmation).toContainText("暂无更高的启用版本");
  await confirmation.getByRole("button", { name: "取消", exact: true }).click();
  expect(mutations).toHaveLength(0);
});
