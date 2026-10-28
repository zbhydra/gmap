<!--
  侧边栏底部用户入口：展示当前管理员用户名，点击弹出菜单切换主题（跟随系统 / 浅色 / 深色）与退出登录。
  桌面侧边栏与移动端抽屉共用；侧边栏折叠时只显示头像图标。
-->
<template>
  <NDropdown
    trigger="click"
    placement="top-start"
    :options="options"
    @select="handleSelect"
  >
    <button
      type="button"
      class="user-menu"
      :class="{ collapsed }"
      :aria-label="t('layout.account')"
    >
      <span class="avatar">
        <NIcon :size="16"><UserOutlined /></NIcon>
      </span>
      <span v-if="!collapsed" class="username">{{ auth.username }}</span>
    </button>
  </NDropdown>
</template>

<script setup lang="ts">
import { computed, h, onMounted, type Component } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { NDropdown, NIcon, useDialog, type DropdownOption } from "naive-ui";
import { CheckOutlined, LogoutOutlined, UserOutlined } from "@vicons/antd";
import { getProfile } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
import { useTheme, type ThemeMode } from "@/composables/useTheme";

defineProps<{ collapsed?: boolean }>();

const { t } = useI18n();
const router = useRouter();
const dialog = useDialog();
const auth = useAuthStore();
const { mode, setThemeMode } = useTheme();

const THEME_OPTIONS: { mode: ThemeMode; labelKey: string }[] = [
  { mode: "system", labelKey: "layout.themeSystem" },
  { mode: "light", labelKey: "layout.themeLight" },
  { mode: "dark", labelKey: "layout.themeDark" },
];
const LOGOUT_KEY = "logout";

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

/** 当前主题项带勾；其余项不给图标，图标列由 Naive UI 统一占位对齐。 */
const options = computed<DropdownOption[]>(() => [
  {
    type: "group",
    key: "theme",
    label: t("layout.theme"),
    children: THEME_OPTIONS.map((item) => ({
      key: item.mode,
      label: t(item.labelKey),
      icon: item.mode === mode.value ? renderIcon(CheckOutlined) : undefined,
    })),
  },
  { type: "divider", key: "divider" },
  { key: LOGOUT_KEY, label: t("layout.logout"), icon: renderIcon(LogoutOutlined) },
]);

function handleSelect(key: string) {
  if (key === LOGOUT_KEY) {
    handleLogout();
    return;
  }
  const theme = THEME_OPTIONS.find((item) => item.mode === key);
  if (theme) setThemeMode(theme.mode);
}

/** 退出登录 */
function handleLogout() {
  dialog.warning({
    title: t("layout.logout"),
    content: t("layout.logoutConfirm"),
    positiveText: t("common.confirm"),
    negativeText: t("common.cancel"),
    onPositiveClick: () => {
      auth.clearToken();
      router.push("/login");
    },
  });
}

/** 用户名只在内存，桌面侧边栏与移动抽屉共用 store 里的同一份，已加载则不重复请求。 */
onMounted(async () => {
  if (auth.username) return;
  try {
    const profile = await getProfile();
    auth.username = profile.username;
  } catch (err) {
    console.error("UserMenu.onMounted() 加载管理员信息失败:", err);
  }
});
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 8px 12px;
  border: 0;
  border-radius: var(--rounded-sm);
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.user-menu:hover {
  background: var(--surface-2);
}

.user-menu:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}

.user-menu.collapsed {
  justify-content: center;
  padding: 8px 0;
}

.avatar {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--rounded-full);
  background: var(--primary-soft);
  color: var(--primary);
}

.username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
