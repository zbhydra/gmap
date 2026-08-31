<!--
  管理后台通用用户信息弹窗。

  页面通过 ref 调用 open(userId)，组件内部负责 profile 和订单列表分页。
-->
<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="dialogTitle"
    :style="modalStyle"
    class="user-info-dialog"
  >
    <NSpin :show="profileLoading">
      <NAlert
        v-if="profileError"
        type="error"
        :show-icon="false"
        class="user-info-alert"
      >
        {{ profileError }}
      </NAlert>

      <template v-else-if="profile">
        <div class="user-info-sections">
          <NDescriptions bordered size="small" :column="isMobile ? 1 : 2" label-placement="left">
            <NDescriptionsItem :label="t('userInfo.userId')">
              {{ profile.user.user_id }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.email')">
              {{ profile.user.email || "-" }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.accountStatus')">
              <NTag :type="accountStatusTagType(profile.user.account_status)" size="small">
                {{ accountStatusLabel(profile.user.account_status) }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.loginCount')">
              {{ profile.user.login_count }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.registerSource')">
              {{ profile.user.register_source || "-" }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.registerMethod')">
              {{ profile.user.register_method || "-" }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.registerIp')">
              {{ formatIpGeo(profile.user.register_ip, profile.user.register_country) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.lastLoginIp')">
              {{ formatIpGeo(profile.user.last_login_ip, profile.user.last_login_country) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.lastOperationIp')">
              {{
                formatIpGeo(
                  profile.user.last_operation_ip,
                  profile.user.last_operation_country,
                )
              }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.createdAt')">
              {{ formatAdminTimeMs(profile.user.created_at) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.updatedAt')">
              {{ formatAdminTimeMs(profile.user.updated_at) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.lastLoginAt')">
              {{ formatAdminTimeMs(profile.user.last_login_at) }}
            </NDescriptionsItem>
          </NDescriptions>

          <NDescriptions bordered size="small" :column="isMobile ? 1 : 3" label-placement="left">
            <NDescriptionsItem :label="t('userInfo.creditsBalance')">
              {{ profile.credits.balance }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.hasSubscription')">
              <NTag
                :type="profile.subscription.has_subscription ? 'success' : 'default'"
                size="small"
              >
                {{
                  profile.subscription.has_subscription
                    ? t("common.yes")
                    : t("common.no")
                }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('userInfo.subscriptionExpiresAt')">
              {{ formatAdminTimeMs(profile.subscription.expires_at) }}
            </NDescriptionsItem>
          </NDescriptions>
        </div>

        <NDataTable
          :columns="orderColumns"
          :data="orderRows"
          :loading="ordersLoading"
          :pagination="ordersPagination"
          :row-key="(row: AdminOrder) => row.order_no"
          :scroll-x="1320"
          :bordered="false"
          striped
          remote
          @update:page="handleOrdersPageChange"
          @update:page-size="handleOrdersPageSizeChange"
        />
      </template>
    </NSpin>
  </NModal>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  NAlert,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NEllipsis,
  NModal,
  NSpin,
  NTag,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
} from "naive-ui";
import {
  getAdminUserOrders,
  getAdminUserProfile,
  type AdminUserAccountStatus,
  type AdminUserProfileData,
} from "@/api/users";
import type { AdminOrder, CallbackStatus, OrderStatus } from "@/api/orders";
import { formatAdminTimeMs } from "@/utils/time";
import { useIsMobile } from "@/composables/useResponsive";

type TagType = "default" | "success" | "warning" | "error" | "info";

const { t } = useI18n();
const message = useMessage();
const isMobile = useIsMobile();

const visible = ref(false);
const currentUserId = ref<number | null>(null);
const profileLoading = ref(false);
const profileError = ref("");
const profile = ref<AdminUserProfileData | null>(null);

const ordersLoading = ref(false);
const ordersLoaded = ref(false);
const orderRows = ref<AdminOrder[]>([]);
const ordersPagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  pageSizes: [10, 20, 50, 100],
  showSizePicker: true,
});

const modalStyle = {
  width: "min(960px, calc(100vw - 32px))",
};

const dialogTitle = computed(() => {
  if (profile.value?.user.user_id) {
    return `${t("userInfo.title")} · ${profile.value.user.user_id}`;
  }
  if (currentUserId.value !== null) {
    return `${t("userInfo.title")} · ${currentUserId.value}`;
  }
  return t("userInfo.title");
});

const orderColumns = computed<DataTableColumns<AdminOrder>>(() => [
  {
    title: t("userInfo.orderCreatedAt"),
    key: "created_at",
    width: 170,
    render: (row) => formatAdminTimeMs(row.created_at),
  },
  {
    title: t("userInfo.orderNo"),
    key: "order_no",
    minWidth: 210,
    render: (row) => renderText(row.order_no),
  },
  {
    title: t("userInfo.orderProduct"),
    key: "product",
    minWidth: 220,
    render: (row) => renderProduct(row),
  },
  {
    title: t("userInfo.orderAmount"),
    key: "amount",
    width: 130,
    render: (row) => formatAmount(row.amount, row.currency),
  },
  {
    title: t("userInfo.orderStatus"),
    key: "order_status",
    width: 120,
    render: (row) =>
      h(
        NTag,
        { type: orderStatusTagType(row.order_status), size: "small" },
        { default: () => orderStatusLabel(row.order_status) },
      ),
  },
  {
    title: t("userInfo.callbackStatus"),
    key: "callback_status",
    width: 130,
    render: (row) =>
      h(
        NTag,
        { type: callbackStatusTagType(row.callback_status), size: "small" },
        { default: () => callbackStatusLabel(row.callback_status) },
      ),
  },
  {
    title: t("userInfo.paymentMethod"),
    key: "payment_method",
    width: 140,
    render: (row) => row.payment_method || "-",
  },
  {
    title: t("userInfo.channelOrderNo"),
    key: "payment_channel_order_no",
    minWidth: 220,
    render: (row) => renderText(row.payment_channel_order_no),
  },
]);

/** 打开弹窗并重置分页状态。 */
function open(userId: number): void {
  currentUserId.value = userId;
  visible.value = true;
  profile.value = null;
  profileError.value = "";
  resetOrders();
  void loadInitial(userId);
}

defineExpose({ open });

/** 首次打开先加载 profile，成功后加载订单列表。 */
async function loadInitial(userId: number) {
  await loadProfile(userId);
  if (!profile.value) {
    return;
  }
  await loadOrders();
}

/** 加载 profile。 */
async function loadProfile(userId: number) {
  profileLoading.value = true;
  try {
    profile.value = await getAdminUserProfile(userId);
  } catch (error) {
    console.error("UserInfoDialog.loadProfile() 加载失败:", error);
    profileError.value = t("userInfo.profileLoadFailed");
    message.error(t("userInfo.profileLoadFailed"));
  } finally {
    profileLoading.value = false;
  }
}

/** 加载订单分页。 */
async function loadOrders() {
  if (currentUserId.value === null) return;
  ordersLoading.value = true;
  try {
    const data = await getAdminUserOrders(currentUserId.value, {
      page: ordersPagination.page ?? 1,
      page_size: ordersPagination.pageSize ?? 20,
    });
    orderRows.value = data.rows;
    ordersPagination.itemCount = data.total;
    ordersPagination.page = data.page;
    ordersPagination.pageSize = data.page_size;
    ordersLoaded.value = true;
  } catch (error) {
    console.error("UserInfoDialog.loadOrders() 加载失败:", error);
    message.error(t("userInfo.ordersLoadFailed"));
    orderRows.value = [];
    ordersPagination.itemCount = 0;
  } finally {
    ordersLoading.value = false;
  }
}

function handleOrdersPageChange(page: number) {
  ordersPagination.page = page;
  void loadOrders();
}

function handleOrdersPageSizeChange(pageSize: number) {
  ordersPagination.pageSize = pageSize;
  ordersPagination.page = 1;
  void loadOrders();
}

function resetOrders() {
  orderRows.value = [];
  ordersLoaded.value = false;
  ordersPagination.page = 1;
  ordersPagination.pageSize = 20;
  ordersPagination.itemCount = 0;
}

function formatIpGeo(ip: string | null, country: string | null): string {
  if (!ip && !country) {
    return "-";
  }
  return `${ip || "-"} (${country || "-"})`;
}

function accountStatusLabel(status: AdminUserAccountStatus): string {
  const labels: Record<AdminUserAccountStatus, string> = {
    normal: t("userInfo.accountNormal"),
    locked: t("userInfo.accountLocked"),
    deleted: t("userInfo.accountDeleted"),
  };
  return labels[status];
}

function accountStatusTagType(status: AdminUserAccountStatus): TagType {
  const types: Record<AdminUserAccountStatus, TagType> = {
    normal: "success",
    locked: "warning",
    deleted: "error",
  };
  return types[status];
}

function renderText(value: string | null) {
  if (!value) {
    return "-";
  }
  return h(NEllipsis, { tooltip: true }, { default: () => value });
}

function renderProduct(row: AdminOrder) {
  return h("div", { class: "user-info-product" }, [
    h(NEllipsis, { tooltip: true }, { default: () => row.product_name }),
    h("span", { class: "user-info-muted" }, row.product_id),
  ]);
}

function formatAmount(amount: number, currency: string): string {
  const humanAmount = amount / 1_000_000;
  if (currency === "USD") {
    return `${currency} ${humanAmount.toFixed(2)}`;
  }
  return `${currency} ${humanAmount.toFixed(6).replace(/\.?0+$/, "")}`;
}

function orderStatusLabel(value: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    1: t("orders.statusPending"),
    2: t("orders.statusPaid"),
    3: t("orders.statusCancelled"),
    4: t("orders.statusRefunded"),
    5: t("orders.statusExpired"),
  };
  return labels[value];
}

function orderStatusTagType(value: OrderStatus): TagType {
  const types: Record<OrderStatus, TagType> = {
    1: "warning",
    2: "success",
    3: "default",
    4: "info",
    5: "error",
  };
  return types[value];
}

function callbackStatusLabel(value: CallbackStatus): string {
  const labels: Record<CallbackStatus, string> = {
    1: t("orders.callbackNotCalled"),
    2: t("orders.callbackPending"),
    3: t("orders.callbackSuccess"),
    4: t("orders.callbackFailed"),
    5: t("orders.callbackMaxRetry"),
  };
  return labels[value];
}

function callbackStatusTagType(value: CallbackStatus): TagType {
  const types: Record<CallbackStatus, TagType> = {
    1: "default",
    2: "warning",
    3: "success",
    4: "error",
    5: "error",
  };
  return types[value];
}
</script>

<style scoped>
.user-info-dialog {
  max-width: calc(100vw - 32px);
}

.user-info-alert {
  margin-bottom: 12px;
}

.user-info-sections {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.user-info-product {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-info-muted {
  color: #667085;
  font-size: 12px;
}
</style>
