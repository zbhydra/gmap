<!--
  用户管理页面（只读）。

  功能：
  1. 按用户 ID（精确）、邮箱（模糊）、账号状态、注册时间范围筛选用户分页列表。
  2. 用户 ID 可点击，打开通用 UserInfoDialog 查看按线订阅与当月用量。
  3. 无任何写操作。
-->
<template>
  <div class="users-view">
    <NCard class="users-panel">
      <NForm
        :label-placement="isMobile ? 'top' : 'left'"
        :label-width="isMobile ? undefined : 92"
        :show-feedback="false"
        class="users-filter"
      >
        <div class="users-filter-grid">
          <NFormItem :label="t('users.userId')">
            <NInputNumber
              v-model:value="filters.userId"
              clearable
              :min="1"
              :precision="0"
              :placeholder="t('users.userIdPlaceholder')"
              style="width: 100%"
              @keydown.enter="handleSearch"
            />
          </NFormItem>
          <NFormItem :label="t('users.userEmail')">
            <NInput
              v-model:value="filters.userEmail"
              clearable
              :placeholder="t('users.userEmailPlaceholder')"
              @keydown.enter="handleSearch"
            />
          </NFormItem>
          <NFormItem :label="t('users.status')">
            <NSelect
              v-model:value="filters.status"
              :options="statusOptions"
              data-testid="user-status-select"
            />
          </NFormItem>
          <NFormItem :label="t('users.createdRange')" class="span-2">
            <NDatePicker
              v-model:value="filters.createdRange"
              type="datetimerange"
              clearable
              :format="ADMIN_DATETIME_FORMAT"
              style="width: 100%"
            />
          </NFormItem>
        </div>
        <div class="users-filter-actions">
          <NSpace :size="8">
            <NButton type="primary" :loading="loading" @click="handleSearch">
              <template #icon>
                <NIcon>
                  <SearchOutlined />
                </NIcon>
              </template>
              {{ t("users.search") }}
            </NButton>
            <NButton @click="handleReset">
              {{ t("users.reset") }}
            </NButton>
          </NSpace>
        </div>
      </NForm>

      <NDataTable
        :columns="columns"
        :data="rows"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: AdminUserListItem) => row.user_id"
        :scroll-x="1210"
        :bordered="false"
        striped
        remote
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </NCard>

    <UserInfoDialog ref="userInfoDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NEllipsis,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
  type SelectOption,
} from "naive-ui";
import { SearchOutlined } from "@vicons/antd";
import {
  getAdminUsers,
  type AdminUserAccountStatus,
  type AdminUserListItem,
  type AdminUserListParams,
} from "@/api/users";
import UserInfoDialog from "@/components/UserInfoDialog.vue";
import { ADMIN_DATETIME_FORMAT, formatAdminTimeMs } from "@/utils/time";
import { useIsMobile } from "@/composables/useResponsive";

type TagType = "default" | "success" | "warning" | "error" | "info";
type DateRangeValue = [number, number] | null;

interface UserFilters {
  /** 用户 ID（精确）。 */
  userId: number | null;
  /** 邮箱包含（模糊）。 */
  userEmail: string;
  /** 账号状态，空串 = 全部（NSelect 不接受 null 选项值）。 */
  status: AdminUserAccountStatus | "";
  /** 注册时间范围。 */
  createdRange: DateRangeValue;
}

interface UserInfoDialogExpose {
  /** 打开用户信息弹窗。 */
  open: (userId: number) => void;
}

const { t } = useI18n();
const message = useMessage();
const isMobile = useIsMobile();

const loading = ref(false);
const rows = ref<AdminUserListItem[]>([]);
const userInfoDialogRef = ref<UserInfoDialogExpose | null>(null);

const filters = reactive<UserFilters>({
  userId: null,
  userEmail: "",
  status: "",
  createdRange: null,
});

const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  pageSizes: [20, 50, 100],
  showSizePicker: true,
});

const statusOptions = computed<SelectOption[]>(() => [
  { label: t("users.statusAll"), value: "" },
  { label: t("userInfo.accountNormal"), value: "normal" },
  { label: t("userInfo.accountLocked"), value: "locked" },
  { label: t("userInfo.accountDeleted"), value: "deleted" },
]);

const columns = computed<DataTableColumns<AdminUserListItem>>(() => [
  {
    title: t("users.userId"),
    key: "user_id",
    width: 110,
    render: (row) => renderUserIdButton(row.user_id),
  },
  {
    title: t("users.userEmail"),
    key: "email",
    minWidth: 220,
    render: (row) => renderEmail(row.email),
  },
  {
    title: t("userInfo.registerSource"),
    key: "register_source",
    width: 130,
    render: (row) => row.register_source || "-",
  },
  {
    title: t("userInfo.registerMethod"),
    key: "register_method",
    width: 130,
    render: (row) => row.register_method || "-",
  },
  {
    title: t("users.registerCountry"),
    key: "register_country",
    width: 110,
    render: (row) => row.register_country || "-",
  },
  {
    title: t("users.status"),
    key: "account_status",
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: accountStatusTagType(row.account_status), size: "small" },
        { default: () => accountStatusLabel(row.account_status) },
      ),
  },
  {
    title: t("userInfo.loginCount"),
    key: "login_count",
    width: 100,
    render: (row) => row.login_count,
  },
  {
    title: t("userInfo.lastLoginAt"),
    key: "last_login_at",
    width: 170,
    render: (row) => formatAdminTimeMs(row.last_login_at),
  },
  {
    title: t("userInfo.createdAt"),
    key: "created_at",
    width: 170,
    render: (row) => formatAdminTimeMs(row.created_at),
  },
]);

/** 加载用户列表。 */
async function loadUsers() {
  loading.value = true;
  try {
    const data = await getAdminUsers(buildListParams());
    rows.value = data.rows;
    pagination.itemCount = data.total;
    pagination.page = data.page;
    pagination.pageSize = data.page_size;
  } catch (error) {
    console.error("UsersView.loadUsers() 加载失败:", error);
    message.error(t("users.loadFailed"));
    rows.value = [];
    pagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
}

/** 查询并回到第一页。 */
function handleSearch() {
  pagination.page = 1;
  void loadUsers();
}

/** 重置筛选条件。 */
function handleReset() {
  filters.userId = null;
  filters.userEmail = "";
  filters.status = "";
  filters.createdRange = null;
  pagination.page = 1;
  void loadUsers();
}

/** 切换页码。 */
function handlePageChange(page: number) {
  pagination.page = page;
  void loadUsers();
}

/** 切换每页数量。 */
function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  void loadUsers();
}

/** 构造列表请求参数，空筛选不下发。 */
function buildListParams(): AdminUserListParams {
  const params: AdminUserListParams = {
    page: pagination.page ?? 1,
    page_size: pagination.pageSize ?? 20,
  };
  if (filters.userId !== null) {
    params.user_id = filters.userId;
  }
  const trimmedEmail = filters.userEmail.trim();
  if (trimmedEmail) {
    params.email = trimmedEmail;
  }
  if (filters.status !== "") {
    params.status = filters.status;
  }
  if (filters.createdRange) {
    const [fromMs, toMs] = filters.createdRange;
    params.created_start = fromMs;
    params.created_end = toMs;
  }
  return params;
}

/** 渲染用户信息弹窗入口。 */
function renderUserIdButton(userId: number) {
  return h(
    NButton,
    {
      text: true,
      type: "primary",
      onClick: () => openUserInfo(userId),
    },
    { default: () => userId },
  );
}

/** 渲染邮箱列，空值占位。 */
function renderEmail(email: string | null) {
  if (!email) {
    return "-";
  }
  return h(NEllipsis, { tooltip: true }, { default: () => email });
}

/** 打开通用用户信息弹窗。 */
function openUserInfo(userId: number) {
  userInfoDialogRef.value?.open(userId);
}

/** 账号状态标签文案。 */
function accountStatusLabel(status: AdminUserAccountStatus): string {
  const labels: Record<AdminUserAccountStatus, string> = {
    normal: t("userInfo.accountNormal"),
    locked: t("userInfo.accountLocked"),
    deleted: t("userInfo.accountDeleted"),
  };
  return labels[status];
}

/** 账号状态标签颜色。 */
function accountStatusTagType(status: AdminUserAccountStatus): TagType {
  const types: Record<AdminUserAccountStatus, TagType> = {
    normal: "success",
    locked: "warning",
    deleted: "error",
  };
  return types[status];
}

onMounted(() => {
  void loadUsers();
});
</script>

<style scoped>
.users-view {
  min-width: 0;
}

.users-panel {
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.04);
}

.users-filter {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.users-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px 16px;
  align-items: start;
}

.users-filter :deep(.n-form-item-label) {
  color: #4d4d4d;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
}

.users-filter :deep(.n-form-item-blank) {
  min-width: 0;
}

.span-2 {
  grid-column: span 2;
}

.users-filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 960px) {
  .users-filter-grid {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
  }
}

@media (max-width: 560px) {
  .users-filter-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }
}
</style>
