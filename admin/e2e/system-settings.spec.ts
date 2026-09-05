/**
 * 系统设置 e2e。
 *
 * 覆盖：
 * - 已有 API Key 只显示前缀和生成时间。
 * - 已有 API Key 重新生成前必须确认。
 * - 生成成功后完整 API Key 只在一次性弹窗展示，关闭即消失。
 * - 完整 API Key 不写入 localStorage。
 * - 刷新配置缓存命中正确 POST，并展示刷新结果。
 * - Gosom API 配置回显、必填拦截、动态增删行与保存归一化。
 * - 对象存储多配置新增、启用切换、刷新、删除及已有定位只读。
 */
import { expect, test, type Page } from "@playwright/test";
import type { ObjectStorageConfig } from "../src/api/system-settings";
import { registerE2eBrowserIdentity } from "../scripts/playwright-browser-identity.mjs";

registerE2eBrowserIdentity(test);

/** Dashboard 页面最小 mock。 */
interface DashboardMockData {
  /** dashboard 汇总统计。 */
  summary: Record<string, number>;
  /** 诊断标记类型列表。 */
  mark_types: string[];
  /** 诊断行列表，本测试不关心具体结构。 */
  rows: string[];
}

/** API Key 元信息 mock。 */
interface ApiKeyMetaMockData {
  /** 是否已经生成 API Key。 */
  has_api_key: boolean;
  /** 可展示前缀。 */
  api_key_prefix: string;
  /** 生成时间，毫秒时间戳。 */
  api_key_created_at: number | null;
}

/** API Key 生成响应 mock。 */
interface GeneratedApiKeyMockData {
  /** 完整 API Key，只返回一次。 */
  api_key: string;
  /** 可展示前缀。 */
  api_key_prefix: string;
  /** 生成时间，毫秒时间戳。 */
  api_key_created_at: number;
}

/** 配置缓存刷新响应 mock。 */
interface ConfigCacheRefreshMockData {
  /** 已刷新服务名。 */
  refreshed_services: string[];
  /** 刷新完成时间，毫秒时间戳。 */
  refreshed_at: number;
}

/** gosom 引擎单条 API 配置 mock。 */
interface GosomApiItemMockData {
  /** gosom 引擎 API 根地址。 */
  base_url: string;
  /** gosom 引擎 API Key。 */
  api_key: string;
  /** 选择权重。 */
  weight: number;
}

/** gosom 引擎 API 配置 mock。 */
interface GosomApiConfigMockData {
  /** 全部 API 配置行。 */
  items: GosomApiItemMockData[];
}

/** Gmap 引擎配置 mock。 */
interface GmapEngineConfigMockData {
  provider: "http" | "gosom";
  proxies: string[];
  concurrency: number;
}

/** 本文件 route.fulfill 可返回的数据联合。 */
type MockResponseData =
  | DashboardMockData
  | ApiKeyMetaMockData
  | GeneratedApiKeyMockData
  | ConfigCacheRefreshMockData
  | GosomApiConfigMockData
  | GmapEngineConfigMockData
  | ObjectStorageConfig;

/** 后端统一成功响应。 */
function successResponse(data: MockResponseData) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code: 10000, data, msg: "" }),
  };
}

/** 注入登录 Token 并 mock 布局依赖。 */
async function loginAsAdmin(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("admin_token", "mock-admin-jwt-token");
    const testWindow = window as Window & { copiedTextForTest?: string };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          testWindow.copiedTextForTest = text;
        },
      },
    });
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

/** 切换系统设置顶部 tab。 */
async function openSettingsTab(page: Page, tab: "api-key" | "gosom-api" | "object-storage") {
  const tabText = {
    "api-key": "API Key",
    "gosom-api": "Gosom API",
    "object-storage": "对象存储",
  }[tab];
  await page.locator(".n-tabs-nav").getByText(tabText, { exact: true }).click();
}

/** mock 系统设置接口。 */
async function mockSystemSettingsApi(page: Page) {
  const fullApiKey = "tdm_test_full_api_key_only_once";
  let apiKeyMeta: ApiKeyMetaMockData = {
    has_api_key: true,
    api_key_prefix: "tdm_existing",
    api_key_created_at: 1780977600000,
  };
  let generateCallCount = 0;
  let refreshCacheCallCount = 0;
  let gosomConfig: GosomApiConfigMockData = {
    items: [
      { base_url: "https://gosom.example.com", api_key: "gosom_key_old", weight: 1 },
      { base_url: "https://backup.example.com", api_key: "gosom_key_backup", weight: 3 },
    ],
  };
  let gosomSaveCallCount = 0;
  let gosomLastPayload: GosomApiConfigMockData | null = null;
  let objectStorageConfig: ObjectStorageConfig = { active_id: null, items: [] };
  let objectStorageSaveCallCount = 0;
  let objectStorageLastPayload: ObjectStorageConfig | null = null;

  await page.route("**/api/admin/system-settings/gmap-engine", async (route) => {
    await route.fulfill(successResponse({ provider: "http", proxies: [], concurrency: 1 }));
  });

  await page.route("**/api/admin/system-settings/object-storage", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(successResponse(objectStorageConfig));
      return;
    }

    expect(route.request().method()).toBe("POST");
    objectStorageSaveCallCount += 1;
    const payload: ObjectStorageConfig = route.request().postDataJSON();
    objectStorageLastPayload = payload;
    objectStorageConfig = {
      ...payload,
      items: payload.items.map((item) =>
        item.provider === "R2"
          ? item
          : {
              ...item,
              endpoint: item.endpoint.trim().replace(/\/+$/, ""),
            },
      ),
    };
    await route.fulfill(successResponse(objectStorageConfig));
  });

  await page.route("**/api/admin/system-settings/gosom-api", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(successResponse(gosomConfig));
      return;
    }

    expect(route.request().method()).toBe("POST");
    gosomSaveCallCount += 1;
    gosomLastPayload = JSON.parse(route.request().postData() ?? "{}") as GosomApiConfigMockData;
    // 镜像后端契约：保存前剥掉每行 base_url 末尾斜杠，并在响应中回显归一化结果。
    gosomConfig = {
      items: gosomLastPayload.items.map((item) => ({
        ...item,
        base_url: item.base_url.replace(/\/+$/, ""),
      })),
    };
    await route.fulfill(successResponse(gosomConfig));
  });

  await page.route("**/api/admin/system-settings/api-key", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(successResponse(apiKeyMeta));
      return;
    }

    expect(route.request().method()).toBe("POST");
    generateCallCount += 1;
    apiKeyMeta = {
      has_api_key: true,
      api_key_prefix: "tdm_test_ful",
      api_key_created_at: 1780977700000,
    };
    await route.fulfill(
      successResponse({
        api_key: fullApiKey,
        api_key_prefix: apiKeyMeta.api_key_prefix,
        api_key_created_at: apiKeyMeta.api_key_created_at,
      }),
    );
  });

  await page.route("**/api/admin/system-settings/config-cache/refresh", async (route) => {
    expect(route.request().method()).toBe("POST");
    refreshCacheCallCount += 1;
    await route.fulfill(
      successResponse({
        refreshed_services: ["config_public_service", "payment_config_service"],
        refreshed_at: 1780977800000,
      }),
    );
  });

  return {
    /** 完整 API Key。 */
    fullApiKey,
    /** 当前生成接口调用次数。 */
    generateCallCount: () => generateCallCount,
    /** 当前刷新缓存接口调用次数。 */
    refreshCacheCallCount: () => refreshCacheCallCount,
    /** 当前 gosom 保存接口调用次数。 */
    gosomSaveCallCount: () => gosomSaveCallCount,
    /** 最近一次 gosom 保存请求体。 */
    gosomLastPayload: () => gosomLastPayload,
    /** 当前对象存储保存接口调用次数。 */
    objectStorageSaveCallCount: () => objectStorageSaveCallCount,
    /** 最近一次对象存储保存请求体。 */
    objectStorageLastPayload: () => objectStorageLastPayload,
  };
}

test("API Key 轮换使用确认弹窗，完整 Key 只在一次性弹窗展示", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);

  await page.goto("/system-settings");
  await openSettingsTab(page, "api-key");
  await expect(page.getByText("tdm_existing")).toBeVisible();
  await expect(page.getByText(api.fullApiKey)).toHaveCount(0);

  await page.getByRole("button", { name: "重新生成 API Key" }).click();
  await expect(page.getByText("旧 API Key 会立即失效")).toBeVisible();
  expect(api.generateCallCount()).toBe(0);

  await page.getByRole("button", { name: "确认" }).click();
  await expect(page.getByText(api.fullApiKey)).toBeVisible();
  await expect(page.getByText("请立即保存本次生成的 API Key")).toBeVisible();

  await page.getByRole("button", { name: "复制" }).click();
  await expect(page.locator(".n-message__content", { hasText: "已复制" })).toBeVisible();
  const copiedText = await page.evaluate(() => {
    return (window as Window & { copiedTextForTest?: string }).copiedTextForTest ?? "";
  });
  expect(copiedText).toBe(api.fullApiKey);
  const localStorageSnapshot = await page.evaluate(() => {
    const values: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key) {
        values.push(window.localStorage.getItem(key) ?? "");
      }
    }
    return values.join("\\n");
  });
  expect(localStorageSnapshot).not.toContain(api.fullApiKey);

  await page.keyboard.press("Escape");
  await expect(page.getByText(api.fullApiKey)).toHaveCount(0);
  await expect(page.getByText("tdm_test_ful")).toBeVisible();
});

test("刷新配置缓存命中 POST 并展示成功结果", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);

  await page.goto("/system-settings");
  await expect(page.locator(".n-card-header__main")).toHaveCount(0);
  await expect(page.locator(".section-header")).toHaveCount(0);
  await page.getByRole("button", { name: "刷新配置缓存" }).click();

  await expect(page.locator(".n-alert-body__title", { hasText: "配置缓存刷新成功" })).toBeVisible();
  await expect(page.getByText("已刷新 2 个服务")).toBeVisible();
  await expect(page.getByText("config_public_service")).toBeVisible();
  await expect(page.getByText("payment_config_service")).toBeVisible();
  expect(api.refreshCacheCallCount()).toBe(1);
});

test("Gosom API 配置回显、必填拦截、动态增删行与保存归一化", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);

  await page.goto("/system-settings");
  await openSettingsTab(page, "gosom-api");

  const baseUrlInputs = page.getByPlaceholder("如 https://gosom.example.com");
  const apiKeyInputs = page.getByPlaceholder("gosom 引擎 API Key");
  const weightInputs = page.getByPlaceholder("1-10000");
  await expect(baseUrlInputs.nth(0)).toHaveValue("https://gosom.example.com");
  await expect(baseUrlInputs.nth(1)).toHaveValue("https://backup.example.com");
  await expect(apiKeyInputs.nth(1)).toHaveValue("gosom_key_backup");
  await expect(weightInputs.nth(1)).toHaveValue("3");

  // 任一行字段为空白时前端直接拦截，不发保存请求。
  await apiKeyInputs.nth(0).fill("");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(
    page.locator(".n-message__content", {
      hasText: "每行的 API 地址、API Key 和权重均不能为空",
    }),
  ).toBeVisible();
  expect(api.gosomSaveCallCount()).toBe(0);
  await apiKeyInputs.nth(0).fill("gosom_key_old");

  // 动态增删行：新增第三行并填写，删除原第二行。
  await page.getByRole("button", { name: "添加 API" }).click();
  await expect(baseUrlInputs).toHaveCount(3);
  await baseUrlInputs.nth(2).fill("https://new.example.com");
  await apiKeyInputs.nth(2).fill("gosom_key_new");
  await weightInputs.nth(2).fill("10");
  await page.getByRole("button", { name: "删除" }).nth(1).click();
  await expect(baseUrlInputs).toHaveCount(2);

  // 保存命中 POST；请求体原样携带输入值，输入框回填后端归一化(剥末尾斜杠)结果。
  await baseUrlInputs.nth(0).fill("https://gosom.internal:8080/");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(
    page.locator(".n-message__content", { hasText: "Gosom API 配置已保存" }),
  ).toBeVisible();
  expect(api.gosomSaveCallCount()).toBe(1);
  expect(api.gosomLastPayload()).toEqual({
    items: [
      {
        base_url: "https://gosom.internal:8080/",
        api_key: "gosom_key_old",
        weight: 1,
      },
      { base_url: "https://new.example.com", api_key: "gosom_key_new", weight: 10 },
    ],
  });
  await expect(baseUrlInputs.nth(0)).toHaveValue("https://gosom.internal:8080");
});

test("对象存储四配置新增、切换、刷新、删除与已有定位只读", async ({ page }, testInfo) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);
  await page.goto("/system-settings");
  await openSettingsTab(page, "object-storage");
  await expect(page.getByText("暂无对象存储配置")).toBeVisible();

  for (const [index, provider] of ["R2", "R2", "AliOSS", "AliOSS"].entries()) {
    await page.getByRole("button", { name: "新增存储" }).click();
    const modal = page.locator(".object-storage-modal");
    if (index === 0) {
      await modal.getByRole("button", { name: "确认", exact: true }).click();
      await expect(page.getByText("请填写该存储配置的全部字段")).toBeVisible();
      expect(api.objectStorageSaveCallCount()).toBe(0);
    }
    await modal.getByRole("textbox", { name: "名称", exact: true }).fill(`storage-${index}`);
    if (provider === "AliOSS") {
      await modal.locator(".n-radio-button", { hasText: "阿里云 OSS" }).click();
      await modal
        .getByRole("textbox", { name: "Endpoint", exact: true })
        .fill("https://oss-cn-hangzhou.aliyuncs.com/");
      await modal.getByLabel("Access Key Secret", { exact: true }).fill(`secret-${index}`);
    } else {
      await modal.getByRole("textbox", { name: "账户 ID", exact: true }).fill(`account-${index}`);
      await modal.getByLabel("Secret Access Key", { exact: true }).fill(`secret-${index}`);
    }
    await modal.getByRole("textbox", { name: "Bucket", exact: true }).fill(`bucket-${index}`);
    await modal
      .getByRole("textbox", { name: "Access Key ID", exact: true })
      .fill(`access-${index}`);
    await modal.getByRole("button", { name: "确认", exact: true }).click();
    await expect(modal).toBeHidden();
  }
  await expect(page.getByRole("radio", { name: "启用 storage-0", exact: true })).toBeChecked();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("对象存储配置已保存")).toBeVisible();
  const saved = api.objectStorageLastPayload();
  expect(saved?.items.map((item) => item.provider)).toEqual(["R2", "R2", "AliOSS", "AliOSS"]);
  expect(new Set(saved?.items.map((item) => item.id)).size).toBe(4);
  for (const item of saved?.items ?? []) expect(item.id).toMatch(/^[0-9a-f-]{36}$/);

  await page.reload();
  await openSettingsTab(page, "object-storage");
  await expect(page.locator(".object-storage-row")).toHaveCount(4);
  await page.locator('.n-radio[aria-label="启用 storage-3"]').click();
  await page.getByRole("button", { name: "编辑 storage-0", exact: true }).click();
  const modal = page.locator(".object-storage-modal");
  await expect(modal.getByRole("textbox", { name: "账户 ID", exact: true })).toHaveAttribute(
    "readonly",
  );
  await expect(modal.getByRole("textbox", { name: "Bucket", exact: true })).toHaveAttribute(
    "readonly",
  );
  await expect(modal.getByRole("radio", { name: "阿里云 OSS", exact: true })).toBeDisabled();
  await expect(modal.getByLabel("Secret Access Key", { exact: true })).toHaveValue("secret-0");
  await modal.getByRole("textbox", { name: "名称", exact: true }).fill("storage-renamed");
  await modal.getByLabel("Secret Access Key", { exact: true }).fill("secret-rotated");
  await modal.getByRole("button", { name: "确认", exact: true }).click();
  await page.getByRole("button", { name: "编辑 storage-2", exact: true }).click();
  await expect(modal.getByRole("textbox", { name: "Endpoint", exact: true })).toHaveValue(
    "https://oss-cn-hangzhou.aliyuncs.com",
  );
  await expect(modal.getByRole("textbox", { name: "Endpoint", exact: true })).toHaveAttribute(
    "readonly",
  );
  await modal.getByRole("button", { name: "取消", exact: true }).click();

  await page.getByRole("button", { name: "删除 storage-1", exact: true }).click();
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await expect(page.locator(".object-storage-row")).toHaveCount(4);
  await page.getByRole("button", { name: "删除 storage-1", exact: true }).click();
  await page.getByRole("button", { name: "确认", exact: true }).click();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect.poll(api.objectStorageSaveCallCount).toBe(2);
  const changed = api.objectStorageLastPayload();
  expect(changed?.active_id).toBe(saved?.items[3]?.id);
  expect(changed?.items.map((item) => item.id)).toEqual(
    saved?.items.filter((_, index) => index !== 1).map((item) => item.id),
  );
  expect(changed?.items[0]).toMatchObject({
    name: "storage-renamed",
    secret_access_key: "secret-rotated",
    account_id: "account-0",
  });
  await page.reload();
  await openSettingsTab(page, "object-storage");
  await expect(page.getByRole("radio", { name: "启用 storage-3", exact: true })).toBeChecked();
  await expect(page.locator(".object-storage-row")).toHaveCount(3);
  await page.screenshot({
    path: testInfo.outputPath("object-storage-desktop.png"),
    fullPage: true,
    animations: "disabled",
  });

  await page.getByRole("button", { name: "删除 storage-3", exact: true }).click();
  await page.getByRole("button", { name: "确认", exact: true }).click();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("请先选择一项启用存储再保存")).toBeVisible();
  expect(api.objectStorageSaveCallCount()).toBe(2);
  await page.locator('.n-radio[aria-label="启用 storage-2"]').click();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect.poll(api.objectStorageSaveCallCount).toBe(3);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("object-storage-mobile.png"), fullPage: true, animations: "disabled" });
});
