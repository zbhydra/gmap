/**
 * Axios 实例 + 请求/响应拦截器
 *
 * - 请求拦截：注入 Authorization Bearer Token
 * - 响应拦截：解包 { code, data, msg }，code !== 10000 时 reject
 * - 401 在当前会话内续签并重试一次，失败清 Token 跳登录页
 * - 同代际刷新通过 Promise 去重，过期会话的响应和重试均拒绝
 */
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore, type AdminSessionSnapshot } from "@/stores/auth";
import i18n from "@/i18n";

/**
 * 后端业务 API 根地址。
 * - 生产：deploy.sh build 时注入 VITE_API_BASE_URL（如 https://api.telegramvideodownload.pro），admin 直连后端公网 API。
 * - 开发：不注入 → 空串 → 走相对路径，由 vite proxy 转发到本地后端（vite.config.ts 的 /api → localhost:7600）。
 * 后端 CORS 为 Access-Control-Allow-Origin: *，直连无跨域问题。
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

interface AdminTokenData {
  /** 管理员 Access Token */
  access_token?: string;
  /** 管理员 Refresh Token */
  refresh_token?: string;
}

interface AdminApiEnvelope<T> {
  /** 业务状态码 */
  code?: number;
  /** 响应数据 */
  data?: T;
  /** 响应消息 */
  msg?: string;
}

interface AdminAuthRetryRequestConfig extends InternalAxiosRequestConfig {
  /** 仅供 axios 响应拦截器内部判断，不能写入真实 HTTP header，避免跨域预检失败。 */
  adminAuthRetried?: boolean;
  adminSession?: AdminSessionSnapshot;
}

/**
 * 业务错误：后端返回 code !== 10000
 *
 * 保留错误码，供调用方按 code 分支处理。
 * 向后兼容：instanceof Error 仍然为 true。
 */
export class BusinessError extends Error {
  /** 业务错误码（如 30006） */
  readonly code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = "BusinessError";
    this.code = code;
  }
}

const request = axios.create({
  baseURL: `${API_BASE}/api/admin`,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: {
  epoch: number;
  promise: Promise<AdminSessionSnapshot | null>;
} | null = null;
let isRedirectingToLogin = false;

/** 当前页面作为登录后的回跳地址；登录页自身不需要再套 redirect。 */
function getLoginUrl(): string {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (window.location.pathname === "/login") {
    return "/login";
  }
  return `/login?redirect=${encodeURIComponent(currentPath)}`;
}

/** 清理失效登录态并跳转登录页。 */
function expireAdminSession() {
  const auth = useAuthStore();
  auth.clearToken();

  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;
  window.location.replace(getLoginUrl());
}

/** 刷新 Token */
async function refreshToken(session: AdminSessionSnapshot): Promise<AdminSessionSnapshot | null> {
  const auth = useAuthStore();
  if (!session.refreshToken) {
    expireAdminSession();
    return null;
  }

  try {
    const res = await axios.post<AdminApiEnvelope<AdminTokenData>>(
      `${API_BASE}/api/admin/auth/refresh`,
      {
        refresh_token: session.refreshToken,
      },
      { headers: { "Accept-Language": i18n.global.locale.value } },
    );
    const newToken = res.data?.data?.access_token;
    const newRefreshToken = res.data?.data?.refresh_token;
    if (newToken && newRefreshToken) {
      if (!auth.setTokens(newToken, newRefreshToken, session)) return null;
      return auth.getSessionSnapshot();
    }
  } catch (error) {
    if (!auth.isCurrentSession(session)) return null;
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      console.error(
        "request.refreshToken() 续签请求失败:",
        error instanceof Error ? error.stack : "未知错误",
      );
    }
  }

  if (auth.isCurrentSession(session)) expireAdminSession();
  return null;
}

/** Access Token 被后端拒绝后，统一尝试续签；续签失败时清登录态并跳登录页。 */
export async function refreshAdminTokenAfterUnauthorized(): Promise<AdminSessionSnapshot | null> {
  const session = useAuthStore().getSessionSnapshot();
  if (!refreshPromise || refreshPromise.epoch !== session.epoch) {
    const promise = refreshToken(session).finally(() => {
      // 旧代际结束时不能清掉新会话正在等待的刷新。
      if (refreshPromise?.promise === promise) refreshPromise = null;
    });
    refreshPromise = { epoch: session.epoch, promise };
  }

  return refreshPromise.promise;
}

// 请求拦截器
request.interceptors.request.use((config: AdminAuthRetryRequestConfig) => {
  config.headers["Accept-Language"] = i18n.global.locale.value;
  const auth = useAuthStore();
  if (config.adminSession && !auth.isCurrentSession(config.adminSession)) {
    throw new Error(i18n.global.t("login.sessionChanged"));
  }
  config.adminSession = auth.getSessionSnapshot();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const session = (response.config as AdminAuthRetryRequestConfig).adminSession;
    if (session && session.epoch !== useAuthStore().epoch) {
      return Promise.reject(new Error(i18n.global.t("login.sessionChanged")));
    }
    const { code, data, msg } = response.data;
    if (code === 10000) {
      return data;
    }
    return Promise.reject(new BusinessError(code, msg || `业务错误 code=${code}`));
  },
  async (error) => {
    const retryConfig = error.config as AdminAuthRetryRequestConfig | undefined;
    const auth = useAuthStore();
    const session = retryConfig?.adminSession;
    if (session && session.epoch !== auth.epoch) {
      return Promise.reject(new Error(i18n.global.t("login.sessionChanged")));
    }
    const requestUrl = typeof retryConfig?.url === "string" ? retryConfig.url : "";
    const isRefreshRequest = requestUrl.includes("/auth/refresh");
    const hasRetried = retryConfig?.adminAuthRetried === true;

    if (error.response?.status === 401 && !isRefreshRequest && !hasRetried) {
      // 同一代际已完成续签时，迟到的 401 直接使用轮换后的令牌。
      const refreshed =
        session && !auth.isCurrentSession(session)
          ? auth.getSessionSnapshot()
          : await refreshAdminTokenAfterUnauthorized();
      if (
        (session && session.epoch !== auth.epoch) ||
        (refreshed && !auth.isCurrentSession(refreshed))
      ) {
        return Promise.reject(new Error(i18n.global.t("login.sessionChanged")));
      }
      if (refreshed && retryConfig) {
        // 用新 Token 重发原请求
        retryConfig.adminAuthRetried = true;
        retryConfig.adminSession = refreshed;
        retryConfig.headers = retryConfig.headers ?? {};
        retryConfig.headers.Authorization = `Bearer ${refreshed.token}`;
        return request(retryConfig);
      }
    }

    const message =
      error.response?.data?.msg ||
      error.response?.data?.detail ||
      error.message ||
      "网络请求失败";
    return Promise.reject(new Error(message));
  },
);

export default request;
