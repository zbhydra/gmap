/**
 * 系统设置 e2e。
 *
 * 覆盖：
 * - 已有 API Key 只显示前缀和生成时间。
 * - 已有 API Key 重新生成前必须确认。
 * - 生成成功后完整 API Key 只在一次性弹窗展示，关闭即消失。
 * - 完整 API Key 不写入 localStorage。
 * - 刷新配置缓存命中正确 POST，并展示刷新结果。
 * - Google 数据采集状态、授权跳转、断开授权和手动采集关键路径。
 */
import { expect, test, type Page } from "@playwright/test";
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

/** Google 数据状态 mock。 */
interface GoogleDataStatusMockData {
  /** 后端配置是否完整。 */
  configured: boolean;
  /** 是否已授权。 */
  authorized: boolean;
  /** 最近授权时间。 */
  last_authorized_at: number | null;
  /** 最近 GSC 成功时间。 */
  last_gsc_success_at: number | null;
  /** 最近 GSC 错误摘要。 */
  last_gsc_error_msg: string;
  /** 最近 GA4 成功时间。 */
  last_ga4_success_at: number | null;
  /** 最近 GA4 错误摘要。 */
  last_ga4_error_msg: string;
  /** GSC Site URL。 */
  gsc_site_url: string;
  /** GA4 Property ID。 */
  ga4_property_id: string;
  /** Google OAuth Client ID。 */
  client_id: string;
  /** 是否已配置 Google OAuth Client Secret。 */
  client_secret_configured: boolean;
  /** Google OAuth 回调地址。 */
  redirect_uri: string;
}

/** Google 数据配置保存请求 mock。 */
interface GoogleDataConfigUpdateMockData {
  /** Google OAuth Client ID。 */
  client_id: string;
  /** Google OAuth Client Secret；留空表示保留旧值。 */
  client_secret: string;
  /** GSC Site URL。 */
  gsc_site_url: string;
  /** GA4 Property ID。 */
  ga4_property_id: string;
}

/** Google OAuth 授权 URL mock。 */
interface GoogleDataAuthorizationUrlMockData {
  /** OAuth 授权跳转地址。 */
  authorization_url: string;
}

/** Google OAuth 授权 URL 创建请求 mock。 */
interface GoogleDataAuthorizationUrlRequestMockData {
  /** 授权完成后的 Admin 回跳根地址。 */
  admin_return_base_url: string;
}

/** Google 数据断开授权 mock。 */
interface GoogleDataDisconnectMockData {
  /** 是否已断开授权。 */
  disconnected: boolean;
}

/** Google 数据单次采集 mock。 */
interface GoogleDataCollectOnceMockData {
  /** GSC 是否保存。 */
  gsc_saved: boolean;
  /** GA4 是否保存。 */
  ga4_saved: boolean;
  /** 错误摘要。 */
  errors: string[];
  /** 采集完成时间。 */
  collected_at: number;
}

/** 本文件 route.fulfill 可返回的数据联合。 */
type MockResponseData =
  | DashboardMockData
  | ApiKeyMetaMockData
  | GeneratedApiKeyMockData
  | ConfigCacheRefreshMockData
  | GoogleDataStatusMockData
  | GoogleDataConfigUpdateMockData
  | GoogleDataAuthorizationUrlMockData
  | GoogleDataDisconnectMockData
  | GoogleDataCollectOnceMockData;

/** 后端统一成功响应。 */
function successResponse(data: MockResponseData) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code: 10000, data, msg: "success" }),
  };
}

/** 后端失败响应。 */
function failedResponse(message: string) {
  return {
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ code: 50000, msg: message }),
  };
}

/** 后端业务失败响应。 */
function businessFailedResponse(code: number, message: string) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ code, data: {}, msg: message }),
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
  tab: "api-key" | "google-data",
) {
  const tabText = {
    "api-key": "API Key",
    "google-data": "google 数据采集",
  }[tab];
  await page.locator(".n-tabs-nav").getByText(tabText, { exact: true }).click();
}

/** mock 系统设置接口。 */
async function mockSystemSettingsApi(page: Page) {
  const fullApiKey = "tdm_test_full_api_key_only_once";
  const authorizationUrl = "https://accounts.google.test/oauth?state=e2e";
  let apiKeyMeta: ApiKeyMetaMockData = {
    has_api_key: true,
    api_key_prefix: "tdm_existing",
    api_key_created_at: 1780977600000,
  };
  let googleDataStatus: GoogleDataStatusMockData = {
    configured: true,
    authorized: true,
    last_authorized_at: 1780977000000,
    last_gsc_success_at: 1780977100000,
    last_gsc_error_msg: "GSC daily quota warning",
    last_ga4_success_at: 1780977200000,
    last_ga4_error_msg: "",
    gsc_site_url: "sc-domain:example.com",
    ga4_property_id: "123456789",
    client_id: "client-id.apps.googleusercontent.com",
    client_secret_configured: true,
    redirect_uri: "https://api.example.com/api/admin/system-settings/google-data/oauth/callback",
  };
  let generateCallCount = 0;
  let refreshCacheCallCount = 0;
  let googleDataStatusCallCount = 0;
  let googleDataAuthorizeCallCount = 0;
  let googleDataDisconnectCallCount = 0;
  let googleDataCollectCallCount = 0;
  let googleDataConfigSaveCallCount = 0;
  let lastGoogleDataConfigSaveBody: GoogleDataConfigUpdateMockData | null = null;
  let lastGoogleDataAuthorizeBody: GoogleDataAuthorizationUrlRequestMockData | null =
    null;
  let failGoogleDataStatus = false;
  let googleDataAuthorizeFailure: { code: number; message: string } | null = null;

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

  await page.route(
    "**/api/admin/system-settings/config-cache/refresh",
    async (route) => {
      expect(route.request().method()).toBe("POST");
      refreshCacheCallCount += 1;
      await route.fulfill(
        successResponse({
          refreshed_services: [
            "config_public_service",
            "payment_config_service",
          ],
          refreshed_at: 1780977800000,
        }),
      );
    },
  );

  await page.route("**/api/admin/system-settings/google-data/status", async (route) => {
    expect(route.request().method()).toBe("GET");
    googleDataStatusCallCount += 1;
    if (failGoogleDataStatus) {
      await route.fulfill(failedResponse("google data status failed"));
      return;
    }
    await route.fulfill(successResponse(googleDataStatus));
  });

  await page.route("**/api/admin/system-settings/google-data/config", async (route) => {
    expect(route.request().method()).toBe("POST");
    googleDataConfigSaveCallCount += 1;
    const payload = route.request().postDataJSON() as GoogleDataConfigUpdateMockData;
    lastGoogleDataConfigSaveBody = payload;
    googleDataStatus = {
      ...googleDataStatus,
      configured: Boolean(
        payload.client_id &&
          (payload.client_secret || googleDataStatus.client_secret_configured) &&
          payload.gsc_site_url &&
          payload.ga4_property_id,
      ),
      client_id: payload.client_id,
      client_secret_configured:
        Boolean(payload.client_secret) || googleDataStatus.client_secret_configured,
      gsc_site_url: payload.gsc_site_url,
      ga4_property_id: payload.ga4_property_id,
    };
    await route.fulfill(successResponse(googleDataStatus));
  });

  await page.route(
    "**/api/admin/system-settings/google-data/oauth/authorize",
    async (route) => {
      expect(route.request().method()).toBe("POST");
      googleDataAuthorizeCallCount += 1;
      lastGoogleDataAuthorizeBody =
        route.request().postDataJSON() as GoogleDataAuthorizationUrlRequestMockData;
      if (googleDataAuthorizeFailure !== null) {
        await route.fulfill(
          businessFailedResponse(
            googleDataAuthorizeFailure.code,
            googleDataAuthorizeFailure.message,
          ),
        );
        return;
      }
      await route.fulfill(successResponse({ authorization_url: authorizationUrl }));
    },
  );

  await page.route(
    "**/api/admin/system-settings/google-data/disconnect",
    async (route) => {
      expect(route.request().method()).toBe("POST");
      googleDataDisconnectCallCount += 1;
      googleDataStatus = {
        ...googleDataStatus,
        authorized: false,
        last_authorized_at: null,
      };
      await route.fulfill(successResponse({ disconnected: true }));
    },
  );

  await page.route(
    "**/api/admin/system-settings/google-data/collect-once",
    async (route) => {
      expect(route.request().method()).toBe("POST");
      googleDataCollectCallCount += 1;
      googleDataStatus = {
        ...googleDataStatus,
        last_gsc_success_at: 1780977900000,
        last_ga4_error_msg: "GA4 quota exceeded",
      };
      await route.fulfill(
        successResponse({
          gsc_saved: true,
          ga4_saved: false,
          errors: ["GA4 quota exceeded"],
          collected_at: 1780977900000,
        }),
      );
    },
  );

  await page.route("https://accounts.google.test/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>Google OAuth Mock</title>",
    });
  });

  return {
    /** 完整 API Key。 */
    fullApiKey,
    /** Google OAuth 授权地址。 */
    authorizationUrl,
    /** 更新 Google 数据状态 mock。 */
    setGoogleDataStatus: (next: GoogleDataStatusMockData) => {
      googleDataStatus = next;
    },
    /** 控制 Google 数据状态接口是否失败。 */
    setGoogleDataStatusFailure: (next: boolean) => {
      failGoogleDataStatus = next;
    },
    /** 控制 Google 授权接口业务失败文案。 */
    setGoogleDataAuthorizeBusinessFailure: (code: number, message: string) => {
      googleDataAuthorizeFailure = { code, message };
    },
    /** 当前生成接口调用次数。 */
    generateCallCount: () => generateCallCount,
    /** 当前刷新缓存接口调用次数。 */
    refreshCacheCallCount: () => refreshCacheCallCount,
    /** 当前 Google 数据状态查询次数。 */
    googleDataStatusCallCount: () => googleDataStatusCallCount,
    /** 当前 Google 授权链接接口调用次数。 */
    googleDataAuthorizeCallCount: () => googleDataAuthorizeCallCount,
    /** 当前 Google 断开授权接口调用次数。 */
    googleDataDisconnectCallCount: () => googleDataDisconnectCallCount,
    /** 当前 Google 单次采集接口调用次数。 */
    googleDataCollectCallCount: () => googleDataCollectCallCount,
    /** 当前 Google 配置保存接口调用次数。 */
    googleDataConfigSaveCallCount: () => googleDataConfigSaveCallCount,
    /** 最近一次 Google 授权创建请求。 */
    lastGoogleDataAuthorizeBody: () => lastGoogleDataAuthorizeBody,
    /** 最近一次 Google 配置保存请求。 */
    lastGoogleDataConfigSaveBody: () => lastGoogleDataConfigSaveBody,
  };
}

test("API Key 轮换使用确认弹窗，完整 Key 只在一次性弹窗展示", async ({
  page,
}) => {
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

  await expect(
    page.locator(".n-alert-body__title", { hasText: "配置缓存刷新成功" }),
  ).toBeVisible();
  await expect(page.getByText("已刷新 2 个服务")).toBeVisible();
  await expect(page.getByText("config_public_service")).toBeVisible();
  await expect(page.getByText("payment_config_service")).toBeVisible();
  expect(api.refreshCacheCallCount()).toBe(1);
});

test("Google 数据状态失败时不影响 API Key 区块，并提供重试入口", async ({
  page,
}) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);
  api.setGoogleDataStatusFailure(true);

  await page.goto("/system-settings");
  await openSettingsTab(page, "api-key");

  await expect(page.getByText("tdm_existing")).toBeVisible();
  await openSettingsTab(page, "google-data");
  await expect(page.getByText("Google 数据状态未知")).toBeVisible();
  await expect(page.getByText("google data status failed")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "授权 Google 数据" }),
  ).toBeDisabled();

  api.setGoogleDataStatusFailure(false);
  await page
    .locator(".n-alert", { hasText: "Google 数据状态未知" })
    .getByRole("button", { name: "刷新" })
    .click();

  await expect(page.getByText("sc-domain:example.com")).toBeVisible();
  await expect(page.getByText("GSC daily quota warning")).toBeVisible();
  expect(api.googleDataStatusCallCount()).toBeGreaterThanOrEqual(2);
});

test("Google 数据配置不完整时禁用授权和采集", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);
  api.setGoogleDataStatus({
    configured: false,
    authorized: false,
    last_authorized_at: null,
    last_gsc_success_at: null,
    last_gsc_error_msg: "",
    last_ga4_success_at: null,
    last_ga4_error_msg: "",
    gsc_site_url: "",
    ga4_property_id: "",
    client_id: "",
    client_secret_configured: false,
    redirect_uri: "",
  });

  await page.goto("/system-settings");
  await openSettingsTab(page, "google-data");

  await expect(page.getByText("Google 数据配置不完整")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "授权 Google 数据" }),
  ).toBeDisabled();
  await expect(page.locator(".n-tag__content", { hasText: "未配置" }).first()).toBeVisible();
  expect(api.googleDataAuthorizeCallCount()).toBe(0);
});

test("未授权 Google 数据时点击授权会跳转到授权 URL", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);
  api.setGoogleDataStatus({
    configured: false,
    authorized: false,
    last_authorized_at: null,
    last_gsc_success_at: null,
    last_gsc_error_msg: "",
    last_ga4_success_at: null,
    last_ga4_error_msg: "",
    gsc_site_url: "sc-domain:example.com",
    ga4_property_id: "123456789",
    client_id: "client-id.apps.googleusercontent.com",
    client_secret_configured: true,
    redirect_uri: "https://api.example.com/api/admin/system-settings/google-data/oauth/callback",
  });

  await page.goto("/system-settings");
  await openSettingsTab(page, "google-data");
  await page.getByRole("button", { name: "授权 Google 数据" }).click();

  await expect(page).toHaveURL(api.authorizationUrl);
  expect(api.googleDataConfigSaveCallCount()).toBe(1);
  expect(api.googleDataAuthorizeCallCount()).toBe(1);
  expect(api.lastGoogleDataAuthorizeBody()).toEqual({
    admin_return_base_url: "http://127.0.0.1:9610",
  });
});

test("Google 授权创建业务失败时展示后端返回消息", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);
  api.setGoogleDataStatus({
    configured: false,
    authorized: false,
    last_authorized_at: null,
    last_gsc_success_at: null,
    last_gsc_error_msg: "",
    last_ga4_success_at: null,
    last_ga4_error_msg: "",
    gsc_site_url: "sc-domain:example.com",
    ga4_property_id: "123456789",
    client_id: "client-id.apps.googleusercontent.com",
    client_secret_configured: true,
    redirect_uri: "https://api.example.com/api/admin/system-settings/google-data/oauth/callback",
  });
  api.setGoogleDataAuthorizeBusinessFailure(
    31001,
    "Google 数据采集配置不完整",
  );

  await page.goto("/system-settings");
  await openSettingsTab(page, "google-data");
  await page.getByRole("button", { name: "授权 Google 数据" }).click();

  await expect(
    page.locator(".n-message__content", { hasText: "Google 数据采集配置不完整" }),
  ).toBeVisible();
  expect(api.googleDataConfigSaveCallCount()).toBe(1);
  expect(api.googleDataAuthorizeCallCount()).toBe(1);
  expect(api.lastGoogleDataAuthorizeBody()).toEqual({
    admin_return_base_url: "http://127.0.0.1:9610",
  });
});

test("已授权 Google 数据支持手动采集并刷新状态", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);

  await page.goto("/system-settings");
  await openSettingsTab(page, "google-data");
  await expect(page.getByText("sc-domain:example.com")).toBeVisible();
  await page.getByRole("button", { name: "立即采集一次" }).click();

  const collectResult = page.locator(".n-alert", { hasText: "本次采集结果" });
  await expect(collectResult).toBeVisible();
  await expect(
    page.locator(".n-message__content", {
      hasText: "Google 数据部分采集失败",
    }),
  ).toBeVisible();
  await expect(collectResult.getByText("GA4 quota exceeded")).toBeVisible();
  await expect(collectResult.getByText("未保存")).toBeVisible();
  expect(api.googleDataCollectCallCount()).toBe(1);
  expect(api.googleDataStatusCallCount()).toBeGreaterThanOrEqual(2);
});

test("已授权 Google 数据断开授权前必须确认", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);

  await page.goto("/system-settings");
  await openSettingsTab(page, "google-data");
  await page.getByRole("button", { name: "断开授权" }).click();
  await expect(page.getByText("已有采集快照不会被删除")).toBeVisible();
  expect(api.googleDataDisconnectCallCount()).toBe(0);

  await page.getByRole("button", { name: "确认" }).click();
  await expect(page.getByRole("button", { name: "授权 Google 数据" })).toBeVisible();
  expect(api.googleDataDisconnectCallCount()).toBe(1);
});

test("Google 数据配置可在后台保存，密钥留空表示保留", async ({ page }) => {
  await loginAsAdmin(page);
  const api = await mockSystemSettingsApi(page);

  await page.goto("/system-settings");
  await openSettingsTab(page, "google-data");
  await expect(page.getByText("OAuth 回调地址")).toHaveCount(0);
  await page
    .getByPlaceholder("sc-domain:example.com")
    .fill("sc-domain:new-example.com");
  await page.getByPlaceholder("123456789").fill("987654321");
  await page.getByRole("button", { name: "保存 Google 配置" }).click();

  await expect(
    page.locator(".n-message__content", { hasText: "Google 数据配置已保存" }),
  ).toBeVisible();
  await expect(page.getByText("sc-domain:new-example.com")).toBeVisible();
  expect(api.googleDataConfigSaveCallCount()).toBe(1);
  expect(api.lastGoogleDataConfigSaveBody()).toEqual({
    client_id: "client-id.apps.googleusercontent.com",
    client_secret: "",
    gsc_site_url: "sc-domain:new-example.com",
    ga4_property_id: "987654321",
  });
});

test("Google 数据 OAuth callback 展示结果并清理 query", async ({ page }) => {
  await loginAsAdmin(page);
  await mockSystemSettingsApi(page);

  await page.goto("/system-settings?foo=bar&google_data_authorized=1#section");
  await expect(page.locator(".n-message__content", { hasText: "Google 数据授权成功" })).toBeVisible();
  await expect(page).toHaveURL(/\/system-settings\?foo=bar#section$/);

  await page.goto("/system-settings?foo=baz&google_data_error=access_denied#failed");
  await expect(
    page.locator(".n-message__content", { hasText: "Google 数据授权失败：access_denied" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/system-settings\?foo=baz#failed$/);
});
