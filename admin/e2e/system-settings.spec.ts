/**
 * 系统设置 e2e。
 *
 * 覆盖：
 * - 已有 API Key 只显示前缀和生成时间。
 * - 已有 API Key 重新生成前必须确认。
 * - 生成成功后完整 API Key 只在一次性弹窗展示，关闭即消失。
 * - 完整 API Key 不写入 localStorage。
 * - 刷新配置缓存命中正确 POST，并展示刷新结果。
 * - Collector 节点检查、敏感 Key 往返、保存重读及加载失败拦截。
 * - 对象存储多配置新增、启用切换、刷新、删除及已有定位只读。
 * - Reoon 额度逐行展示（含查询中与单行失败）、增删保存及保存后重查额度。
 */
import { expect, test, type Page } from "@playwright/test";
import type {
  GmapCollectorConfig,
  GmapCollectorTestResult,
  ObjectStorageConfig,
  ReoonBalance,
  ReoonConfig,
} from "../src/api/system-settings";
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

/** 本文件 route.fulfill 可返回的数据联合。 */
type MockResponseData =
  | DashboardMockData
  | ApiKeyMetaMockData
  | GeneratedApiKeyMockData
  | ConfigCacheRefreshMockData
  | GmapCollectorConfig
  | GmapCollectorTestResult
  | ObjectStorageConfig
  | ReoonConfig
  | { items: ReoonBalance[] };

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
async function openSettingsTab(
  page: Page,
  tab: "api-key" | "gmap-collector" | "object-storage" | "reoon",
) {
  const tabText = {
    "api-key": "API Key",
    "gmap-collector": "Collector",
    "object-storage": "对象存储",
    reoon: "Reoon 邮箱验证",
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
  let collectorConfig: GmapCollectorConfig = {
    collectors: [
      { url: "http://collector.example.com", api_key: "collector_key_old" },
      { url: "https://backup.example.com", api_key: "collector_key_backup" },
    ],
    proxies: [],
  };
  let collectorReadCallCount = 0;
  let collectorSaveCallCount = 0;
  let collectorLastPayload: GmapCollectorConfig | null = null;
  let collectorTestResult: GmapCollectorTestResult = { ok: true };
  let collectorTestPayload: { url: string; api_key: string } | null = null;
  let objectStorageConfig: ObjectStorageConfig = { active_id: null, items: [] };
  let objectStorageSaveCallCount = 0;
  let objectStorageLastPayload: ObjectStorageConfig | null = null;
  let reoonConfig: ReoonConfig = {
    accounts: [
      { name: "main", api_key: "reoon_key_main" },
      { name: "backup", api_key: "reoon_key_invalid" },
    ],
  };
  let reoonSaveCallCount = 0;
  let reoonLastPayload: ReoonConfig | null = null;
  let reoonBalanceCallCount = 0;

  await page.route("**/api/admin/system-settings/reoon", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(successResponse(reoonConfig));
      return;
    }
    expect(route.request().method()).toBe("POST");
    reoonSaveCallCount += 1;
    const payload: ReoonConfig = route.request().postDataJSON();
    reoonLastPayload = payload;
    reoonConfig = payload;
    await route.fulfill(successResponse(reoonConfig));
  });
  await page.route("**/api/admin/system-settings/reoon/balances", async (route) => {
    expect(route.request().method()).toBe("GET");
    reoonBalanceCallCount += 1;
    const items: ReoonBalance[] = reoonConfig.accounts.map(({ name, api_key }) =>
      api_key === "reoon_key_invalid"
        ? { name, ok: false, reason: "unauthorized" }
        : { name, ok: true, api_status: "active", daily_credits: 20, instant_credits: 100 },
    );
    await route.fulfill(successResponse({ items }));
  });

  await page.route("**/api/admin/system-settings/gmap-collector", async (route) => {
    if (route.request().method() === "GET") {
      collectorReadCallCount += 1;
      await route.fulfill(successResponse(collectorConfig));
      return;
    }
    expect(route.request().method()).toBe("POST");
    collectorSaveCallCount += 1;
    const payload: GmapCollectorConfig = route.request().postDataJSON();
    collectorLastPayload = payload;
    collectorConfig = {
      collectors: payload.collectors.map(({ url, api_key }) => ({ url: new URL(url).origin, api_key })),
      proxies: payload.proxies,
    };
    await route.fulfill(successResponse(collectorConfig));
  });
  await page.route("**/api/admin/system-settings/gmap-collector/test", async (route) => {
    expect(route.request().method()).toBe("POST");
    collectorTestPayload = route.request().postDataJSON();
    await route.fulfill(successResponse(collectorTestResult));
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
    collectorReadCallCount: () => collectorReadCallCount,
    collectorSaveCallCount: () => collectorSaveCallCount,
    collectorLastPayload: () => collectorLastPayload,
    collectorTestPayload: () => collectorTestPayload,
    collectorConfig: () => collectorConfig,
    setCollectorTestResult: (result: GmapCollectorTestResult) => { collectorTestResult = result; },
    /** 当前对象存储保存接口调用次数。 */
    objectStorageSaveCallCount: () => objectStorageSaveCallCount,
    /** 最近一次对象存储保存请求体。 */
    objectStorageLastPayload: () => objectStorageLastPayload,
    reoonSaveCallCount: () => reoonSaveCallCount,
    reoonLastPayload: () => reoonLastPayload,
    reoonBalanceCallCount: () => reoonBalanceCallCount,
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

test("代理双端校验提示与批量连通性结果", async ({ page }, testInfo) => {
  await loginAsAdmin(page);
  await mockSystemSettingsApi(page);
  let saveCalls = 0;
  let checkCalls = 0;
  const backendMessage = "proxies 字段第 2 项格式错误：请使用完整代理 URL";
  await page.route("**/api/admin/system-settings/gmap-collector", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(successResponse({ collectors: [], proxies: [] }));
    } else {
      saveCalls += 1;
      expect(route.request().headers()["accept-language"]).toBe("zh-CN");
      await route.fulfill({ json: { code: 999, data: {}, msg: backendMessage } });
    }
  });
  await page.route("**/api/admin/system-settings/gmap-collector/check-proxies", async (route) => {
    checkCalls += 1;
    const body: { proxies: string[] } = route.request().postDataJSON();
    expect(body.proxies.length).toBeLessThanOrEqual(20);
    await route.fulfill({
      json: {
        code: 10000,
        data: {
          items: body.proxies.map((proxy, index) => ({
            proxy: proxy.replace("user:secret@", ""),
            status: index % 2 === 0 ? "ok" : "timeout",
            status_code: index % 2 === 0 ? 204 : null,
            duration_ms: 25,
          })),
        },
        msg: "",
      },
    });
  });
  await page.goto("/system-settings");
  await page.locator(".n-tabs-nav").getByText("Collector", { exact: true }).click();
  const input = page.locator(".collector-proxies textarea");
  await input.fill("127.0.0.1:8080:user:secret");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText(/proxies 字段第 1 项格式错误/)).toBeVisible();
  expect(saveCalls).toBe(0);
  await input.fill("http://user:secret@127.0.0.1:80");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText(backendMessage, { exact: true })).toBeVisible();
  expect(saveCalls).toBe(1);
  await page.getByRole("button", { name: "代理校验器", exact: true }).click();
  const modal = page.locator(".n-modal").filter({ hasText: "Google 连通性" });
  await modal.getByRole("textbox").fill("127.0.0.1:8080:user:secret");
  await modal.getByRole("button", { name: "开始校验" }).click();
  expect(checkCalls).toBe(0);
  await modal
    .getByRole("textbox")
    .fill(
      Array.from({ length: 21 }, (_, i) => `http://user:secret@proxy-${i}.example:8080`).join("\n"),
    );
  await modal.getByRole("button", { name: "开始校验" }).click();
  await expect(modal.getByText("已校验 21 / 21，可用 11")).toBeVisible();
  expect(checkCalls).toBe(2);
  await expect(modal.locator("tbody tr")).toHaveCount(21);
  await expect(modal.locator("tbody")).not.toContainText("secret");
  await expect(page.locator(".n-message")).toHaveCount(0, { timeout: 10000 });
  await page.screenshot({ path: testInfo.outputPath("proxy-checker-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(modal.getByRole("button", { name: "开始校验" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("proxy-checker-mobile.png") });
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

test("Collector 节点检查不保存，Key 编辑后保存重读且支持清空", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);
  await page.goto("/system-settings");
  await openSettingsTab(page, "gmap-collector");
  const urls = page.getByLabel("节点 URL", { exact: true });
  const keys = page.getByLabel("节点 Key", { exact: true });
  const proxies = page.getByLabel("代理 URL", { exact: true });
  await expect(urls).toHaveCount(2);
  await expect(keys.nth(0)).toHaveAttribute("type", "password");
  await urls.nth(0).fill("http://edited.example.com/");
  await keys.nth(0).fill("rotated_key");
  await page.getByRole("button", { name: "检查连接", exact: true }).first().click();
  await expect(page.getByText("节点连接正常", { exact: true })).toBeVisible();
  expect(api.collectorTestPayload()).toEqual({ url: "http://edited.example.com/", api_key: "rotated_key" });
  expect(api.collectorSaveCallCount()).toBe(0);
  expect(api.collectorConfig().collectors[0]?.api_key).toBe("collector_key_old");
  await urls.nth(0).fill("http://edited.example.com:80/");
  await expect(page.getByText("节点连接正常", { exact: true })).toHaveCount(0);
  api.setCollectorTestResult({ ok: false, reason: "unauthorized" });
  await page.getByRole("button", { name: "检查连接", exact: true }).first().click();
  await expect(page.getByText("节点拒绝鉴权，请检查 Key", { exact: true })).toBeVisible();
  expect(api.collectorSaveCallCount()).toBe(0);
  await keys.nth(0).fill("");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("每个节点的 URL 和 Key 均不能为空", { exact: true })).toBeVisible();
  expect(api.collectorSaveCallCount()).toBe(0);
  await keys.nth(0).fill("rotated_key");
  await page.getByRole("button", { name: "添加节点", exact: true }).click();
  await urls.nth(2).fill(" http://new.example.com:80/ ");
  await keys.nth(2).fill(" new_key ");
  await proxies.fill("http://user:secret@proxy.example:8080\n\nhttp://user:secret@proxy.example:8080");
  const reads = api.collectorReadCallCount();
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("Collector 配置已保存并重读", { exact: true })).toBeVisible();
  expect(api.collectorReadCallCount()).toBe(reads + 1);
  expect(api.collectorLastPayload()?.collectors).toEqual([
    { url: "http://edited.example.com:80/", api_key: "rotated_key" },
    { url: "https://backup.example.com", api_key: "collector_key_backup" },
    { url: "http://new.example.com:80/", api_key: "new_key" },
  ]);
  await expect(urls.nth(0)).toHaveValue("http://edited.example.com");
  await expect(keys.nth(1)).toHaveValue("collector_key_backup");
  await expect(proxies).toHaveValue("http://user:secret@proxy.example:8080\nhttp://user:secret@proxy.example:8080");
  await page.reload();
  await openSettingsTab(page, "gmap-collector");
  await expect(keys.nth(0)).toHaveValue("rotated_key");
  await expect(keys.nth(1)).toHaveValue("collector_key_backup");
  const storage = await page.evaluate(() => Object.values(localStorage).join("\n"));
  expect(storage).not.toContain("rotated_key");
  expect(storage).not.toContain("collector_key_backup");
  expect(storage).not.toContain("user:secret");
  for (let index = 0; index < 3; index += 1) {
    await page.getByRole("button", { name: "删除节点", exact: true }).first().click();
  }
  await proxies.fill("");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(urls).toHaveCount(0);
  await expect(page.getByRole("button", { name: "保存", exact: true })).toBeEnabled();
  expect(api.collectorLastPayload()).toEqual({ collectors: [], proxies: [] });
});

test("Collector 加载或保存后重读失败时禁止覆盖配置，刷新后恢复", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);
  let failRead = true;
  await page.route("**/api/admin/system-settings/gmap-collector", async route => {
    if (route.request().method() === "GET" && failRead) {
      await route.fulfill({ json: { code: 999, msg: "read failed", data: null } });
      return;
    }
    await route.fallback();
  });
  await page.goto("/system-settings");
  await openSettingsTab(page, "gmap-collector");
  const save = page.getByRole("button", { name: "保存", exact: true });
  await expect(save).toBeDisabled();
  await expect(page.getByRole("button", { name: "添加节点", exact: true })).toBeDisabled();
  failRead = false;
  await page.getByRole("button", { name: "刷新", exact: true }).click();
  await expect(save).toBeEnabled();
  failRead = true;
  await save.click();
  await expect(save).toBeDisabled();
  await expect(page.locator(".n-alert").getByText("Collector 配置加载失败，请点击刷新重试", { exact: true })).toBeVisible();
  expect(api.collectorSaveCallCount()).toBe(1);
  failRead = false;
  await page.getByRole("button", { name: "刷新", exact: true }).click();
  await expect(save).toBeEnabled();
  await expect(page.getByLabel("节点 Key", { exact: true }).nth(1)).toHaveValue("collector_key_backup");
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

test("Reoon 额度逐行展示且单行失败不影响其他行，改动保存后重查额度", async ({ page }, testInfo) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);
  let releaseBalances = () => {};
  const balancesGate = new Promise<void>((resolve) => {
    releaseBalances = resolve;
  });
  await page.route("**/api/admin/system-settings/reoon/balances", async (route) => {
    await balancesGate;
    await route.fallback();
  });
  await page.goto("/system-settings");
  await openSettingsTab(page, "reoon");
  const names = page.getByLabel("账号名称", { exact: true });
  const keys = page.getByLabel("API Key", { exact: true });
  const balances = page.locator(".reoon-balance");
  const save = page.getByRole("button", { name: "保存", exact: true });
  await expect(names).toHaveCount(2);
  await expect(keys.nth(0)).toHaveAttribute("type", "password");
  await expect(balances.filter({ hasText: "正在查询额度…" })).toHaveCount(2);
  await expect(save).toBeDisabled();
  releaseBalances();
  await expect(balances.nth(0)).toContainText(/active.*当日剩余\s*20.*一次性剩余\s*100/);
  await expect(balances.nth(1)).toHaveText("Reoon 拒绝该 API Key，请检查后重新保存");

  await keys.nth(1).fill("reoon_key_rotated");
  await page.getByRole("button", { name: "添加账号", exact: true }).click();
  await names.nth(2).fill(" main ");
  await keys.nth(2).fill(" reoon_key_new ");
  await expect(balances).toHaveCount(1);
  await save.click();
  await expect(page.getByText("账号名称重复：main", { exact: true })).toBeVisible();
  expect(api.reoonSaveCallCount()).toBe(0);
  await names.nth(2).fill(" third ");
  const balanceCalls = api.reoonBalanceCallCount();
  await save.click();
  await expect(page.getByText("Reoon 配置已保存", { exact: true })).toBeVisible();
  expect(api.reoonLastPayload()).toEqual({
    accounts: [
      { name: "main", api_key: "reoon_key_main" },
      { name: "backup", api_key: "reoon_key_rotated" },
      { name: "third", api_key: "reoon_key_new" },
    ],
  });
  await expect(names.nth(2)).toHaveValue("third");
  await expect(balances.filter({ hasText: "active" })).toHaveCount(3);
  expect(api.reoonBalanceCallCount()).toBe(balanceCalls + 1);
  await page.screenshot({ path: testInfo.outputPath("reoon-desktop.png"), fullPage: true, animations: "disabled" });

  await page.reload();
  await openSettingsTab(page, "reoon");
  await expect(keys.nth(1)).toHaveValue("reoon_key_rotated");
  await expect(balances.filter({ hasText: "active" })).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    await page.getByRole("button", { name: "删除账号", exact: true }).first().click();
  }
  await save.click();
  await expect.poll(api.reoonSaveCallCount).toBe(2);
  expect(api.reoonLastPayload()).toEqual({ accounts: [] });
  await expect(names).toHaveCount(0);
});
