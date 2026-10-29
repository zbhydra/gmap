<!--
  管理后台布局：桌面侧边栏 / 移动抽屉导航

  结构：
  NLayout（桌面 has-sider，移动单列）
  ├── NLayoutSider（仅桌面，可折叠侧边栏）
  │   ├── NMenu（Dashboard / 用户管理 / 订单管理 / 任务记录 / 系统设置）
  │   └── UserMenu（底部：用户名 + 主题切换 / 退出登录）
  └── NLayout
      ├── NLayoutHeader（仅移动端：汉堡 + 标题）
      └── NLayoutContent（RouterView）

  移动端（视口 ≤ 960px，见 useResponsive.ts）：
  NDrawer（左侧抽屉，承载与侧边栏同一份菜单与 UserMenu，跳转后自动关闭）
-->
<template>
  <NLayout :has-sider="!isMobile" class="admin-layout">
    <NLayoutSider
      v-if="!isMobile"
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
      content-class="sider-content"
    >
      <div class="sider-header">
        <span v-if="!collapsed" class="sider-title">{{ t("app.title") }}</span>
        <span v-else class="sider-title-short">A</span>
      </div>
      <NMenu
        class="sider-menu"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="currentRoute"
        @update:value="handleMenuClick"
      />
      <div class="sider-footer">
        <UserMenu :collapsed="collapsed" />
      </div>
    </NLayoutSider>

    <NLayout>
      <NLayoutHeader v-if="isMobile" bordered class="admin-header">
        <NButton
          quaternary
          circle
          :aria-label="t('layout.openMenu')"
          @click="navDrawerVisible = true"
        >
          <template #icon>
            <NIcon>
              <MenuOutlined />
            </NIcon>
          </template>
        </NButton>
        <span class="header-title">{{ t("app.title") }}</span>
      </NLayoutHeader>

      <NLayoutContent class="admin-content">
        <RouterView />
      </NLayoutContent>
    </NLayout>
  </NLayout>

  <NDrawer v-model:show="navDrawerVisible" placement="left" :width="280">
    <NDrawerContent :title="t('app.title')" closable>
      <NMenu
        :options="menuOptions"
        :value="currentRoute"
        @update:value="handleMenuClick"
      />
      <template #footer>
        <UserMenu />
      </template>
    </NDrawerContent>
  </NDrawer>
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
  NDrawer,
  NDrawerContent,
  NIcon,
  type MenuOption,
} from "naive-ui";
import {
  DashboardOutlined,
  HistoryOutlined,
  SettingOutlined,
  ProfileOutlined,
  TeamOutlined,
  MenuOutlined,
} from "@vicons/antd";
import UserMenu from "@/components/UserMenu.vue";
import { useIsMobile } from "@/composables/useResponsive";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const isMobile = useIsMobile();
const collapsed = ref(false);
const navDrawerVisible = ref(false);

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
    label: t("layout.users"),
    key: "Users",
    icon: renderIcon(TeamOutlined),
  },
  {
    label: t("layout.orders"),
    key: "Orders",
    icon: renderIcon(ProfileOutlined),
  },
  {
    label: t("layout.taskRecords"),
    key: "TaskRecords",
    icon: renderIcon(HistoryOutlined),
  },
  {
    label: t("layout.systemSettings"),
    key: "SystemSettings",
    icon: renderIcon(SettingOutlined),
  },
]);

/** 菜单点击跳转，并收起移动端抽屉（桌面无抽屉，置 false 无副作用） */
function handleMenuClick(key: string) {
  navDrawerVisible.value = false;
  const routeMap: Record<string, string> = {
    Dashboard: "/",
    Users: "/users",
    Orders: "/orders",
    TaskRecords: "/task-records",
    SystemSettings: "/system-settings",
  };
  const path = routeMap[key];
  if (path) router.push(path);
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  height: 100dvh;
}

/* 侧边栏内容竖向排布：菜单撑满可滚动，用户入口固定在底部 */
:deep(.sider-content) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sider-menu {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.sider-footer {
  padding: 8px;
  border-top: 1px solid var(--n-border-color);
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
  font-size: 16px;
  font-weight: 700;
}

.admin-header {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.header-title {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-content {
  padding: 24px;
  overflow-y: auto;
}

/* 移动端：内容区收窄留白 */
@media (max-width: 960px) {
  .admin-content {
    padding: 16px;
  }
}
</style>
