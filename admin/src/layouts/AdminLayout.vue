<!--
  管理后台布局：侧边栏 + 顶栏

  结构：
  NLayout
  ├── NLayoutSider（可折叠侧边栏）
  │   └── NMenu（Dashboard / 订单管理 / 系统设置）
  └── NLayout
      ├── NLayoutHeader（顶栏：标题 + 登出按钮）
      └── NLayoutContent（RouterView）
-->
<template>
  <NLayout has-sider class="admin-layout">
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="sider-header">
        <span v-if="!collapsed" class="sider-title">{{ t("app.title") }}</span>
        <span v-else class="sider-title-short">A</span>
      </div>
      <NMenu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="currentRoute"
        @update:value="handleMenuClick"
      />
    </NLayoutSider>

    <NLayout>
      <NLayoutHeader bordered class="admin-header">
        <div class="header-right">
          <NButton text @click="handleLogout">
            {{ t("layout.logout") }}
          </NButton>
        </div>
      </NLayoutHeader>

      <NLayoutContent class="admin-content">
        <RouterView />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<script setup lang="ts">
import { ref, computed, h, type Component } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NButton,
  NIcon,
  useDialog,
  type MenuOption,
} from "naive-ui";
import {
  DashboardOutlined,
  SettingOutlined,
  ProfileOutlined,
} from "@vicons/antd";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const dialog = useDialog();
const auth = useAuthStore();

const collapsed = ref(false);

/** 当前路由名用于菜单高亮 */
const currentRoute = computed(() => route.name as string);

/** 渲染图标辅助函数 */
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

/** 菜单选项 */
const menuOptions = computed<MenuOption[]>(() => [
  {
    label: t("layout.dashboard"),
    key: "Dashboard",
    icon: renderIcon(DashboardOutlined),
  },
  {
    label: t("layout.orders"),
    key: "Orders",
    icon: renderIcon(ProfileOutlined),
  },
  {
    label: t("layout.systemSettings"),
    key: "SystemSettings",
    icon: renderIcon(SettingOutlined),
  },
]);

/** 菜单点击跳转 */
function handleMenuClick(key: string) {
  const routeMap: Record<string, string> = {
    Dashboard: "/",
    Orders: "/orders",
    SystemSettings: "/system-settings",
  };
  const path = routeMap[key];
  if (path) router.push(path);
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
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.sider-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--n-border-color);
  font-weight: 600;
  font-size: 15px;
}

.sider-title {
  white-space: nowrap;
  overflow: hidden;
}

.sider-title-short {
  font-size: 18px;
  font-weight: 700;
}

.admin-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-content {
  padding: 24px;
  overflow-y: auto;
}
</style>
