/**
 * Auth Store — 管理员 Token 管理
 *
 * Access Token 和 Refresh Token 存储在 localStorage，页面刷新后自动恢复登录态；
 * 当前管理员用户名只放内存，由布局进入时向后端拉取。
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";

const TOKEN_KEY = "admin_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";

export interface AdminSessionSnapshot {
  token: string;
  refreshToken: string;
  epoch: number;
}

export const useAuthStore = defineStore("auth", () => {
  /** 管理员 Access Token */
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) ?? "");

  /** 管理员 Refresh Token */
  const refreshToken = ref<string>(localStorage.getItem(REFRESH_TOKEN_KEY) ?? "");

  /** 当前管理员用户名，未加载时为空串 */
  const username = ref("");

  // 退出后即使用相同 token 再登录，也属于不同会话。
  const epoch = ref(0);

  /** 是否已登录 */
  const isLoggedIn = computed(() => token.value.length > 0);

  function getSessionSnapshot(): AdminSessionSnapshot {
    return { token: token.value, refreshToken: refreshToken.value, epoch: epoch.value };
  }

  function isCurrentSession(session: AdminSessionSnapshot): boolean {
    return (
      epoch.value === session.epoch &&
      token.value === session.token &&
      refreshToken.value === session.refreshToken
    );
  }

  /** 登录开启新代际；续签仅允许写回捕获的会话，保留代际和用户名。 */
  function setTokens(
    newToken: string,
    newRefreshToken: string,
    session?: AdminSessionSnapshot,
  ): boolean {
    if (session) {
      if (!isCurrentSession(session)) return false;
    } else {
      epoch.value++;
      username.value = "";
    }
    token.value = newToken;
    refreshToken.value = newRefreshToken;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    return true;
  }

  /** 清除管理员 token pair */
  function clearToken() {
    epoch.value++;
    token.value = "";
    refreshToken.value = "";
    username.value = "";
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  return {
    token,
    refreshToken,
    username,
    epoch,
    isLoggedIn,
    getSessionSnapshot,
    isCurrentSession,
    setTokens,
    clearToken,
  };
});
