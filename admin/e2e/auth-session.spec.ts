import { expect, test, type Page, type Route } from "@playwright/test";
import { registerE2eBrowserIdentity } from "../scripts/playwright-browser-identity.mjs";

registerE2eBrowserIdentity(test);

function tokenPair(account: string) {
  return { access_token: `${account}-access`, refresh_token: `${account}-refresh` };
}

async function succeed(route: Route, data: object) {
  await route.fulfill({ json: { code: 10000, data, msg: "" } });
}

async function openAdmin(page: Page, delayedProfiles?: Route[]) {
  await page.route("**/api/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/auth/me")) {
      const isB = route.request().headers().authorization === "Bearer B-access";
      if (delayedProfiles && !isB) {
        delayedProfiles.push(route);
      } else {
        await succeed(route, { admin_id: isB ? 2 : 1, username: isB ? "admin-B" : "admin-A" });
      }
    } else if (path.endsWith("/auth/captcha")) {
      await succeed(route, {
        captcha_id: "session-captcha",
        image_base64:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      });
    } else if (path.endsWith("/auth/login")) {
      await succeed(route, tokenPair("B"));
    } else if (path.endsWith("/dashboard")) {
      await succeed(route, {
        summary: {
          total_users: 1,
          new_users: 0,
          new_users_yesterday_same_period: 0,
          new_users_yesterday_same_period_change_percent: null,
          active_users_24h: 0,
          active_users_7d: 0,
        },
        mark_types: [],
        rows: [],
      });
    } else {
      await route.fulfill({ status: 404 });
    }
  });
  await page.addInitScript(() => {
    localStorage.setItem("admin_token", "A-access");
    localStorage.setItem("admin_refresh_token", "A-refresh");
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "账户菜单" })).toBeVisible();
  if (!delayedProfiles) {
    await expect(page.getByRole("button", { name: "账户菜单" })).toContainText("admin-A");
  }
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "账户菜单" }).click();
  await page.getByText("退出登录", { exact: true }).click();
  await page.getByRole("button", { name: "确认", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function loginB(page: Page) {
  await page.getByPlaceholder("用户名", { exact: true }).fill("admin-B");
  await page.getByPlaceholder("密码", { exact: true }).fill("password-B");
  await page.getByPlaceholder("请输入验证码").fill("1234");
  await page.getByRole("button", { name: "登 录" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "账户菜单" })).toContainText("admin-B");
}

async function readSession(page: Page) {
  return page.evaluate(async () => {
    const moduleUrl = "/src/stores/auth.ts";
    const { useAuthStore }: typeof import("../src/stores/auth") = await import(moduleUrl);
    const auth = useAuthStore();
    return {
      token: auth.token,
      refreshToken: auth.refreshToken,
      username: auth.username,
      isLoggedIn: auth.isLoggedIn,
      storedToken: localStorage.getItem("admin_token"),
      storedRefreshToken: localStorage.getItem("admin_refresh_token"),
    };
  });
}

function startRequest(page: Page, path: string) {
  return page.evaluate(async (url) => {
    const moduleUrl = "/src/api/request.ts";
    const { default: request }: typeof import("../src/api/request") = await import(moduleUrl);
    try {
      await request.get(url);
      return "fulfilled";
    } catch {
      return "rejected";
    }
  }, path);
}

async function holdRefreshes(page: Page) {
  const routes: Route[] = [];
  await page.route("**/api/admin/auth/refresh", (route) => {
    routes.push(route);
  });
  return routes;
}

async function mockUnauthorizedRequests(page: Page) {
  const calls = new Map<string, string[]>();
  await page.route("**/api/admin/session-race/*", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const headers = route.request().headers();
    expect(headers["x-admin-auth-retry"]).toBeUndefined();
    const tokens = calls.get(path) ?? [];
    tokens.push(headers.authorization ?? "");
    calls.set(path, tokens);
    if (tokens.length === 1) {
      await route.fulfill({ status: 401 });
    } else {
      await succeed(route, {});
    }
  });
  return calls;
}

const sessionB = {
  token: "B-access",
  refreshToken: "B-refresh",
  username: "admin-B",
  isLoggedIn: true,
  storedToken: "B-access",
  storedRefreshToken: "B-refresh",
};

test("退出时刷新仍在途：迟到成功响应不能恢复登录或重试旧请求", async ({ page }) => {
  await openAdmin(page);
  const refreshes = await holdRefreshes(page);
  const calls = await mockUnauthorizedRequests(page);
  const pending = startRequest(page, "/session-race/logout");
  await expect.poll(() => refreshes.length).toBe(1);

  await logout(page);
  await succeed(refreshes[0]!, tokenPair("A-renewed"));

  expect(await pending).toBe("rejected");
  expect(await readSession(page)).toEqual({
    token: "",
    refreshToken: "",
    username: "",
    isLoggedIn: false,
    storedToken: null,
    storedRefreshToken: null,
  });
  expect(calls.get("/api/admin/session-race/logout")).toEqual(["Bearer A-access"]);
  await expect(page).toHaveURL(/\/login$/);
});

for (const status of [200, 401]) {
  test(`换号后 A 的刷新返回 ${status}：保留 B 会话并拒绝所有 A 等待请求`, async ({ page }) => {
    await openAdmin(page);
    const refreshes = await holdRefreshes(page);
    const calls = await mockUnauthorizedRequests(page);
    const first = startRequest(page, "/session-race/first");
    const second = startRequest(page, "/session-race/second");
    await expect.poll(() => refreshes.length).toBe(1);
    await expect.poll(() => calls.size).toBe(2);

    await logout(page);
    await loginB(page);
    if (status === 200) {
      await succeed(refreshes[0]!, tokenPair("A-renewed"));
    } else {
      await refreshes[0]!.fulfill({ status });
    }

    expect(await Promise.all([first, second])).toEqual(["rejected", "rejected"]);
    expect(await readSession(page)).toEqual(sessionB);
    expect([...calls.values()]).toEqual([["Bearer A-access"], ["Bearer A-access"]]);
    expect(refreshes).toHaveLength(1);
    await expect(page).toHaveURL("/");
  });
}

test("A 的 401 在换号后才返回：不能触发 B 刷新或用 B 重试", async ({ page }) => {
  await openAdmin(page);
  const refreshes = await holdRefreshes(page);
  const requests: Route[] = [];
  await page.route("**/api/admin/session-race/late-401", (route) => {
    requests.push(route);
  });
  const pending = startRequest(page, "/session-race/late-401");
  await expect.poll(() => requests.length).toBe(1);

  await logout(page);
  await loginB(page);
  await requests[0]!.fulfill({ status: 401 });

  expect(await pending).toBe("rejected");
  expect(refreshes).toHaveLength(0);
  expect(requests).toHaveLength(1);
  expect(await readSession(page)).toEqual(sessionB);
});

test("新代际独立刷新，旧刷新结束不能清掉新代际的并发去重", async ({ page }) => {
  await openAdmin(page);
  const calls = await mockUnauthorizedRequests(page);
  const refreshes: Route[] = [];
  await page.route("**/api/admin/auth/refresh", async (route) => {
    refreshes.push(route);
    if (refreshes.length > 2) await succeed(route, tokenPair("B-unexpected"));
  });
  const oldRequest = startRequest(page, "/session-race/old");
  await expect.poll(() => refreshes.length).toBe(1);

  await logout(page);
  await loginB(page);
  const first = startRequest(page, "/session-race/new-first");
  await expect.poll(() => refreshes.length).toBe(2);
  expect(refreshes.map((route) => route.request().postDataJSON())).toEqual([
    { refresh_token: "A-refresh" },
    { refresh_token: "B-refresh" },
  ]);
  await succeed(refreshes[0]!, tokenPair("A-renewed"));
  expect(await oldRequest).toBe("rejected");

  const unauthorized = page.waitForResponse(
    (response) => response.url().endsWith("/session-race/new-second") && response.status() === 401,
  );
  const second = startRequest(page, "/session-race/new-second");
  await (await unauthorized).finished();
  await readSession(page);
  await succeed(refreshes[1]!, tokenPair("B-renewed"));

  expect(await Promise.all([first, second])).toEqual(["fulfilled", "fulfilled"]);
  expect(refreshes).toHaveLength(2);
  expect(calls.get("/api/admin/session-race/new-first")).toEqual([
    "Bearer B-access",
    "Bearer B-renewed-access",
  ]);
  expect(calls.get("/api/admin/session-race/new-second")).toEqual([
    "Bearer B-access",
    "Bearer B-renewed-access",
  ]);
  expect(await readSession(page)).toEqual({
    ...sessionB,
    token: "B-renewed-access",
    refreshToken: "B-renewed-refresh",
    storedToken: "B-renewed-access",
    storedRefreshToken: "B-renewed-refresh",
  });
});

test("刷新已成功但等待请求尚未恢复时换号：拒绝旧请求并保留 B", async ({ page }) => {
  await openAdmin(page);
  const refreshes = await holdRefreshes(page);
  const calls = await mockUnauthorizedRequests(page);
  const unauthorized = page.waitForResponse(
    (response) => response.url().endsWith("/session-race/resume") && response.status() === 401,
  );
  const pending = page.evaluate(async () => {
    const requestUrl = "/src/api/request.ts";
    const authUrl = "/src/stores/auth.ts";
    const {
      default: request,
      refreshAdminTokenAfterUnauthorized,
    }: typeof import("../src/api/request") = await import(requestUrl);
    const { useAuthStore }: typeof import("../src/stores/auth") = await import(authUrl);
    const auth = useAuthStore();
    // 先注册换号，让它在刷新成功后、原请求的 await 恢复前执行。
    const changed = refreshAdminTokenAfterUnauthorized().then(() => {
      auth.setTokens("B-access", "B-refresh");
      auth.username = "admin-B";
    });
    const result = request.get("/session-race/resume").then(
      () => "fulfilled",
      () => "rejected",
    );
    await changed;
    return result;
  });
  await expect.poll(() => refreshes.length).toBe(1);
  await (await unauthorized).finished();
  await readSession(page);
  await succeed(refreshes[0]!, tokenPair("A-renewed"));

  expect(await pending).toBe("rejected");
  expect(calls.get("/api/admin/session-race/resume")).toEqual(["Bearer A-access"]);
  expect(await readSession(page)).toEqual(sessionB);
});

test("写回同时核对 token 对和代际，正常续签保留代际与用户名", async ({ page }) => {
  await openAdmin(page);
  const result = await page.evaluate(async () => {
    const moduleUrl = "/src/stores/auth.ts";
    const { useAuthStore }: typeof import("../src/stores/auth") = await import(moduleUrl);
    const auth = useAuthStore();
    const initial = auth.getSessionSnapshot();
    const refreshed = auth.setTokens("A-rotated-access", initial.refreshToken, initial);
    const rotated = auth.getSessionSnapshot();
    const usernameAfterRefresh = auth.username;
    const staleAccessWrite = auth.setTokens("stale-access", "stale-refresh", initial);
    auth.setTokens(rotated.token, "A-rotated-refresh", rotated);
    const staleRefreshWrite = auth.setTokens("stale-access", "stale-refresh", rotated);
    const beforeLogout = auth.getSessionSnapshot();
    auth.clearToken();
    auth.setTokens(beforeLogout.token, beforeLogout.refreshToken);
    const staleEpochWrite = auth.setTokens("stale-access", "stale-refresh", beforeLogout);
    return {
      refreshed,
      sameEpoch: initial.epoch === rotated.epoch,
      usernameAfterRefresh,
      staleAccessWrite,
      staleRefreshWrite,
      staleEpochWrite,
      epochAdvancedTwice: auth.epoch === beforeLogout.epoch + 2,
    };
  });
  expect(result).toEqual({
    refreshed: true,
    sameEpoch: true,
    usernameAfterRefresh: "admin-A",
    staleAccessWrite: false,
    staleRefreshWrite: false,
    staleEpochWrite: false,
    epochAdvancedTwice: true,
  });
  expect(await readSession(page)).toMatchObject({
    token: "A-rotated-access",
    refreshToken: "A-rotated-refresh",
    username: "",
    isLoggedIn: true,
    storedToken: "A-rotated-access",
    storedRefreshToken: "A-rotated-refresh",
  });
});

test("正常并发 401 只刷新一次，轮换后的迟到 401 继续使用当前令牌", async ({ page }) => {
  await openAdmin(page);
  const refreshes = await holdRefreshes(page);
  const calls = await mockUnauthorizedRequests(page);
  const first = startRequest(page, "/session-race/normal-first");
  const second = startRequest(page, "/session-race/normal-second");
  await expect.poll(() => refreshes.length).toBe(1);
  await expect.poll(() => calls.size).toBe(2);
  const lateRequests: Route[] = [];
  await page.route("**/api/admin/session-race/normal-late", async (route) => {
    lateRequests.push(route);
    if (lateRequests.length > 1) await succeed(route, {});
  });
  const late = startRequest(page, "/session-race/normal-late");
  await expect.poll(() => lateRequests.length).toBe(1);

  await succeed(refreshes[0]!, tokenPair("A-renewed"));
  expect(await Promise.all([first, second])).toEqual(["fulfilled", "fulfilled"]);
  await lateRequests[0]!.fulfill({ status: 401 });
  expect(await late).toBe("fulfilled");
  expect(refreshes).toHaveLength(1);
  expect(lateRequests[1]!.request().headers().authorization).toBe("Bearer A-renewed-access");
  expect(await readSession(page)).toMatchObject({
    token: "A-renewed-access",
    refreshToken: "A-renewed-refresh",
    username: "admin-A",
    isLoggedIn: true,
    storedToken: "A-renewed-access",
    storedRefreshToken: "A-renewed-refresh",
  });
});

test("A 的迟到 profile 成功响应不能覆盖 B 用户名", async ({ page }) => {
  const profiles: Route[] = [];
  await openAdmin(page, profiles);
  await expect.poll(() => profiles.length).toBe(1);

  await logout(page);
  await loginB(page);
  const response = page.waitForResponse("**/api/admin/auth/me");
  await succeed(profiles[0]!, { admin_id: 1, username: "admin-A-late" });
  await (await response).finished();
  expect(await readSession(page)).toEqual(sessionB);
  await expect(page.getByRole("button", { name: "账户菜单" })).toContainText("admin-B");
});
