/**
 * 亮暗主题 composable
 *
 * 管理员可选「跟随系统 / 浅色 / 深色」，选择存 localStorage（仅本浏览器偏好）。
 * 实际生效的亮暗写到 <html data-theme>，global.css 的暗色 token 只认该属性，
 * Naive UI 与 Canvas 图表通过 isDark 读取同一结果。
 */
import { ref } from "vue";

export type ThemeMode = "system" | "light" | "dark";

const THEME_MODE_KEY = "admin_theme_mode";
const THEME_MODES: readonly ThemeMode[] = ["system", "light", "dark"];

const mode = ref<ThemeMode>("system");
const isDark = ref(false);

let systemQuery: MediaQueryList | null = null;

/** 先写 data-theme 再更新 isDark，保证依赖 isDark 的计算读到的是新 token 值。 */
function apply() {
  const dark = mode.value === "dark" || (mode.value === "system" && systemQuery?.matches === true);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  isDark.value = dark;
}

/** 模块级单例：首次调用时读取偏好并绑定系统主题监听。 */
function bindOnce() {
  if (systemQuery) {
    return;
  }
  systemQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const saved = localStorage.getItem(THEME_MODE_KEY);
  mode.value = THEME_MODES.find((item) => item === saved) ?? "system";
  systemQuery.addEventListener("change", apply);
  apply();
}

/** 切换主题模式并持久化。 */
function setThemeMode(next: ThemeMode) {
  mode.value = next;
  localStorage.setItem(THEME_MODE_KEY, next);
  apply();
}

export function useTheme() {
  bindOnce();
  return { mode, isDark, setThemeMode };
}
