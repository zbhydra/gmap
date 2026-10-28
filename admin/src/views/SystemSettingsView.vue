<!--
  系统设置页面。

  功能：
  1. 刷新当前业务进程内配置读取缓存，并展示刷新时间和服务列表。
  2. 查询、生成和重新生成当前管理员外部 API Key；完整 key 仅在弹窗中一次性展示。
  3. 维护 Collector 节点、Key 与代理列表，支持检查、保存和重读。
  4. 维护 Cloudflare R2 与阿里云 OSS 对象存储配置。
  5. 维护 Reoon 邮箱验证账号，并逐行展示已保存账号的额度。
-->
<template>
  <div class="system-settings-view">
    <NCard>
      <NTabs v-model:value="activeTab" type="line" animated>
        <NTabPane
          name="config-cache"
          :tab="t('systemSettings.tabConfigCache')"
        >
          <section>
            <div class="tab-actions">
              <NButton
                type="primary"
                :loading="refreshingCache"
                @click="handleRefreshConfigCache"
              >
                {{ t("systemSettings.refreshConfigCache") }}
              </NButton>
            </div>

          <NAlert
            v-if="cacheRefreshResult"
            class="result-alert"
            type="success"
            :title="t('systemSettings.cacheRefreshSuccess')"
          >
            <NSpace vertical size="small">
              <NText>
                {{ t("systemSettings.refreshedAt") }}:
                {{ formatTime(cacheRefreshResult.refreshed_at) }}
              </NText>
              <NText>
                {{ t("systemSettings.refreshedServiceCount", {
                  count: cacheRefreshResult.refreshed_services.length,
                }) }}
              </NText>
              <NList
                v-if="cacheRefreshResult.refreshed_services.length > 0"
                size="small"
                bordered
              >
                <NListItem
                  v-for="service in cacheRefreshResult.refreshed_services"
                  :key="service"
                >
                  <code>{{ service }}</code>
                </NListItem>
              </NList>
            </NSpace>
          </NAlert>
          </section>
        </NTabPane>

        <NTabPane
          name="api-key"
          :tab="t('systemSettings.tabApiKey')"
        >
          <section>
            <div class="tab-actions">
              <NButton
                type="primary"
                ghost
                :loading="generatingApiKey"
                :disabled="!canGenerateApiKey"
                @click="handleGenerateApiKey"
              >
                {{ apiKeyMeta && apiKeyMeta.has_api_key
                  ? t("systemSettings.regenerateApiKey")
                  : t("systemSettings.generateApiKey") }}
              </NButton>
            </div>

          <NAlert
            v-if="showApiKeyUnknownAlert"
            class="unknown-alert"
            type="warning"
            :title="t('systemSettings.apiKeyUnknownTitle')"
          >
            <NSpace vertical size="small">
              <NText>{{ t("systemSettings.apiKeyUnknownDescription") }}</NText>
              <NButton size="small" :loading="apiKeyLoading" @click="loadApiKeyMeta">
                {{ t("common.refresh") }}
              </NButton>
            </NSpace>
          </NAlert>

          <NSpin :show="apiKeyLoading">
            <NDescriptions
              label-placement="left"
              :column="1"
              bordered
              size="small"
            >
              <NDescriptionsItem :label="t('systemSettings.apiKeyStatus')">
                <NTag :type="apiKeyMeta?.has_api_key ? 'success' : 'default'">
                  {{ apiKeyMeta?.has_api_key
                    ? t("systemSettings.generated")
                    : t("systemSettings.notGenerated") }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.apiKeyPrefix')">
                <code>{{ apiKeyMeta?.api_key_prefix || "-" }}</code>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.apiKeyCreatedAt')">
                {{ formatTime(apiKeyMeta?.api_key_created_at ?? null) }}
              </NDescriptionsItem>
            </NDescriptions>
          </NSpin>
          </section>
        </NTabPane>

        <NTabPane name="gmap-collector" :tab="t('systemSettings.tabGmapCollector')">
          <section>
            <NText class="collector-hint" depth="3">{{ t("systemSettings.collectorHint") }}</NText>
            <NAlert v-if="!collectorLoaded && !collectorLoading" type="warning" class="unknown-alert">
              {{ t("systemSettings.collectorLoadFailed") }}
            </NAlert>
            <NSpin :show="collectorLoading">
              <div class="collector-rows">
                <div v-for="(row, index) in collectorRows" :key="index" class="collector-row">
                  <NFormItem
                    :label="t('systemSettings.collectorUrl')"
                    :label-props="{ for: `collector-url-${index}` }"
                    label-placement="top"
                    :show-feedback="false"
                  >
                    <NInput
                      v-model:value="row.url"
                      :input-props="{ id: `collector-url-${index}`, autocomplete: 'off' }"
                      :placeholder="t('systemSettings.collectorUrlPlaceholder')"
                      :disabled="collectorDisabled"
                      @update:value="row.result = null"
                    />
                  </NFormItem>
                  <NFormItem
                    :label="t('systemSettings.collectorApiKey')"
                    :label-props="{ for: `collector-key-${index}` }"
                    label-placement="top"
                    :show-feedback="false"
                  >
                    <NInput
                      v-model:value="row.api_key"
                      type="password"
                      show-password-on="click"
                      :input-props="{ id: `collector-key-${index}`, autocomplete: 'off' }"
                      :disabled="collectorDisabled"
                      @update:value="row.result = null"
                    />
                  </NFormItem>
                  <NSpace align="center">
                    <NButton
                      :loading="row.checking"
                      :disabled="collectorDisabled || !row.url.trim() || !row.api_key.trim()"
                      @click="handleTestCollector(row)"
                    >{{ t("systemSettings.collectorTest") }}</NButton>
                    <NButton quaternary type="error" :disabled="collectorDisabled" @click="collectorRows.splice(index, 1)">
                      {{ t("systemSettings.collectorRemove") }}
                    </NButton>
                    <NText v-if="row.result" :type="row.result.ok ? 'success' : 'error'" role="status">
                      {{ row.result.ok
                        ? t("systemSettings.collectorTestOk")
                        : t(`systemSettings.collectorTestReason.${row.result.reason}`) }}
                    </NText>
                  </NSpace>
                </div>
              </div>
              <div class="collector-actions">
                <NButton dashed :disabled="collectorDisabled || collectorRows.length >= 16" @click="addCollector">
                  {{ t("systemSettings.collectorAdd") }}
                </NButton>
                <NButton :disabled="collectorDisabled" @click="openProxyChecker">
                  <template #icon><NIcon :component="CheckCircleOutlined" /></template>
                  {{ t("systemSettings.proxyChecker") }}
                </NButton>
              </div>
              <NFormItem :label="t('systemSettings.collectorProxies')" :label-props="{ for: 'collector-proxies' }" :show-feedback="false">
                <NInput
                  ref="collectorProxiesInput"
                  v-model:value="collectorProxies"
                  class="collector-proxies"
                  type="textarea"
                  :input-props="{ id: 'collector-proxies' }"
                  :placeholder="t('systemSettings.collectorProxiesPlaceholder')"
                  :disabled="collectorDisabled"
                />
              </NFormItem>
            </NSpin>
            <div class="tab-actions collector-actions">
              <NButton :loading="collectorLoading" :disabled="collectorBusy" @click="loadCollectorConfig">
                {{ t("common.refresh") }}
              </NButton>
              <NButton type="primary" :loading="collectorSaving" :disabled="collectorDisabled" @click="handleSaveCollectorConfig">
                {{ t("systemSettings.collectorSave") }}
              </NButton>
            </div>
          </section>
        </NTabPane>

        <NTabPane name="object-storage" :tab="t('systemSettings.tabObjectStorage')">
          <section>
            <NSpin :show="objectStorageLoading">
              <NEmpty
                v-if="!objectStorageConfig.items.length"
                :description="t('systemSettings.objectStorageEmpty')"
              />
              <NRadioGroup
                v-model:value="objectStorageConfig.active_id"
                name="object-storage-active"
                class="object-storage-list"
                :disabled="objectStorageDisabled"
              >
                <div
                  v-for="item in objectStorageConfig.items"
                  :key="item.id"
                  class="object-storage-row"
                >
                  <NRadio
                    :value="item.id"
                    :aria-label="t('systemSettings.objectStorageActivate', { name: item.name })"
                  />
                  <div class="object-storage-summary">
                    <NText strong>{{ item.name }}</NText>
                    <NText depth="3">{{
                      item.provider === "R2"
                        ? t("systemSettings.objectStorageR2")
                        : t("systemSettings.objectStorageAliOss")
                    }}</NText>
                    <code>{{ item.bucket }}</code>
                  </div>
                  <NSpace :wrap="false" size="small">
                    <NButton
                      quaternary
                      circle
                      :disabled="objectStorageDisabled"
                      :aria-label="t('systemSettings.objectStorageEdit', { name: item.name })"
                      :title="t('systemSettings.objectStorageEdit', { name: item.name })"
                      @click="editObjectStorage(item)"
                    >
                      <template #icon><NIcon :component="EditOutlined" /></template>
                    </NButton>
                    <NButton
                      quaternary
                      circle
                      type="error"
                      :disabled="objectStorageDisabled"
                      :aria-label="t('systemSettings.objectStorageDelete', { name: item.name })"
                      :title="t('systemSettings.objectStorageDelete', { name: item.name })"
                      @click="removeObjectStorage(item)"
                    >
                      <template #icon><NIcon :component="DeleteOutlined" /></template>
                    </NButton>
                  </NSpace>
                </div>
              </NRadioGroup>
            </NSpin>

            <div class="tab-actions object-storage-actions">
              <NButton :disabled="objectStorageDisabled" @click="addObjectStorage">
                <template #icon><NIcon :component="PlusOutlined" /></template>
                {{ t("systemSettings.objectStorageAdd") }}
              </NButton>
              <NButton
                type="primary"
                :loading="objectStorageSaving"
                :disabled="objectStorageDisabled"
                @click="handleSaveObjectStorageConfig"
              >
                {{ t("systemSettings.objectStorageSave") }}
              </NButton>
            </div>
          </section>
        </NTabPane>

        <NTabPane name="reoon" :tab="t('systemSettings.tabReoon')">
          <section>
            <NText class="collector-hint" depth="3">{{ t("systemSettings.reoonHint") }}</NText>
            <NAlert v-if="!reoonLoaded && !reoonLoading" type="warning" class="unknown-alert">
              {{ t("systemSettings.reoonLoadFailed") }}
            </NAlert>
            <NSpin :show="reoonLoading">
              <div class="collector-rows">
                <div
                  v-for="({ row, saved, balance }, index) in reoonRowViews"
                  :key="index"
                  class="collector-row reoon-row"
                >
                  <NFormItem
                    :label="t('systemSettings.reoonName')"
                    :label-props="{ for: `reoon-name-${index}` }"
                    label-placement="top"
                    :show-feedback="false"
                  >
                    <NInput
                      v-model:value="row.name"
                      :input-props="{ id: `reoon-name-${index}`, autocomplete: 'off' }"
                      :disabled="reoonDisabled"
                    />
                  </NFormItem>
                  <NFormItem
                    :label="t('systemSettings.reoonApiKey')"
                    :label-props="{ for: `reoon-key-${index}` }"
                    label-placement="top"
                    :show-feedback="false"
                  >
                    <NInput
                      v-model:value="row.api_key"
                      type="password"
                      show-password-on="click"
                      :input-props="{ id: `reoon-key-${index}`, autocomplete: 'off' }"
                      :disabled="reoonDisabled"
                    />
                  </NFormItem>
                  <NSpace align="center">
                    <NButton quaternary type="error" :disabled="reoonDisabled" @click="reoonRows.splice(index, 1)">
                      {{ t("systemSettings.reoonRemove") }}
                    </NButton>
                  </NSpace>
                  <template v-if="saved">
                    <NText v-if="reoonBalancesLoading" class="reoon-balance" depth="3" role="status">
                      {{ t("systemSettings.reoonBalanceLoading") }}
                    </NText>
                    <div v-else-if="balance?.ok" class="reoon-balance" role="status">
                      <span class="reoon-metric">
                        <NText depth="3">{{ t("systemSettings.reoonApiStatus") }}</NText>
                        <!-- Reoon 官方只公开 active 一种取值，其余值都提示管理员关注。 -->
                        <NTag size="small" :type="balance.api_status === 'active' ? 'success' : 'warning'">
                          {{ balance.api_status }}
                        </NTag>
                      </span>
                      <span class="reoon-metric">
                        <NText depth="3">{{ t("systemSettings.reoonDailyCredits") }}</NText>
                        <NText class="reoon-credits">{{ balance.daily_credits }}</NText>
                      </span>
                      <span class="reoon-metric">
                        <NText depth="3">{{ t("systemSettings.reoonInstantCredits") }}</NText>
                        <NText class="reoon-credits">{{ balance.instant_credits }}</NText>
                      </span>
                    </div>
                    <NText v-else-if="balance" class="reoon-balance" type="error" role="status">
                      {{ t(`systemSettings.reoonBalanceReason.${balance.reason}`) }}
                    </NText>
                  </template>
                </div>
              </div>
              <div class="collector-actions">
                <NButton dashed :disabled="reoonDisabled" @click="addReoonAccount">
                  {{ t("systemSettings.reoonAdd") }}
                </NButton>
                <NButton :loading="reoonBalancesLoading" :disabled="reoonDisabled" @click="loadReoonBalances">
                  {{ t("systemSettings.reoonRefreshBalances") }}
                </NButton>
              </div>
            </NSpin>
            <div class="tab-actions collector-actions">
              <NButton :loading="reoonLoading" :disabled="reoonBusy" @click="loadReoonConfig">
                {{ t("common.refresh") }}
              </NButton>
              <NButton type="primary" :loading="reoonSaving" :disabled="reoonDisabled" @click="handleSaveReoonConfig">
                {{ t("systemSettings.reoonSave") }}
              </NButton>
            </div>
          </section>
        </NTabPane>
      </NTabs>
    </NCard>

    <NModal
      :show="objectStorageDraft !== null"
      preset="card"
      class="object-storage-modal"
      :title="t('systemSettings.objectStorageDetails')"
      @update:show="objectStorageDraft = null"
    >
      <NForm
        v-if="objectStorageDraft"
        label-placement="top"
        :disabled="objectStorageDisabled"
        @submit.prevent="applyObjectStorageDraft"
      >
        <NFormItem :label="t('systemSettings.objectStorageName')" required>
          <NInput
            v-model:value="objectStorageDraft.name"
            :maxlength="100"
            :placeholder="t('systemSettings.objectStorageName')"
            :input-props="{ 'aria-label': t('systemSettings.objectStorageName') }"
          />
        </NFormItem>
        <NFormItem :label="t('systemSettings.objectStorageProvider')">
          <NRadioGroup
            :value="objectStorageDraft.provider"
            :disabled="objectStorageLocationLocked"
            @update:value="setObjectStorageProvider"
          >
            <NRadioButton value="R2">{{ t("systemSettings.objectStorageR2") }}</NRadioButton>
            <NRadioButton value="AliOSS">{{
              t("systemSettings.objectStorageAliOss")
            }}</NRadioButton>
          </NRadioGroup>
        </NFormItem>
        <NFormItem
          v-if="objectStorageDraft.provider === 'R2'"
          :label="t('systemSettings.objectStorageR2AccountId')"
          required
        >
          <NInput
            v-model:value="objectStorageDraft.account_id"
            :readonly="objectStorageLocationLocked"
            :maxlength="500"
            :placeholder="t('systemSettings.objectStorageR2AccountId')"
            :input-props="{ 'aria-label': t('systemSettings.objectStorageR2AccountId') }"
          />
        </NFormItem>
        <NFormItem v-else :label="t('systemSettings.objectStorageAliOssEndpoint')" required>
          <NInput
            v-model:value="objectStorageDraft.endpoint"
            :readonly="objectStorageLocationLocked"
            :maxlength="500"
            :placeholder="t('systemSettings.objectStorageAliOssEndpoint')"
            :input-props="{ 'aria-label': t('systemSettings.objectStorageAliOssEndpoint') }"
          />
        </NFormItem>
        <NFormItem :label="t('systemSettings.objectStorageBucket')" required>
          <NInput
            v-model:value="objectStorageDraft.bucket"
            :readonly="objectStorageLocationLocked"
            :maxlength="500"
            :placeholder="t('systemSettings.objectStorageBucket')"
            :input-props="{ 'aria-label': t('systemSettings.objectStorageBucket') }"
          />
        </NFormItem>
        <NFormItem :label="t('systemSettings.objectStorageAccessKeyId')" required>
          <NInput
            v-model:value="objectStorageDraft.access_key_id"
            :maxlength="500"
            :placeholder="t('systemSettings.objectStorageAccessKeyId')"
            :input-props="{ 'aria-label': t('systemSettings.objectStorageAccessKeyId') }"
          />
        </NFormItem>
        <NFormItem
          v-if="objectStorageDraft.provider === 'R2'"
          :label="t('systemSettings.objectStorageR2SecretAccessKey')"
          required
        >
          <NInput
            v-model:value="objectStorageDraft.secret_access_key"
            type="password"
            show-password-on="click"
            :maxlength="500"
            :placeholder="t('systemSettings.objectStorageR2SecretAccessKey')"
            :input-props="{ 'aria-label': t('systemSettings.objectStorageR2SecretAccessKey') }"
          />
        </NFormItem>
        <NFormItem v-else :label="t('systemSettings.objectStorageAliOssAccessKeySecret')" required>
          <NInput
            v-model:value="objectStorageDraft.access_key_secret"
            type="password"
            show-password-on="click"
            :maxlength="500"
            :placeholder="t('systemSettings.objectStorageAliOssAccessKeySecret')"
            :input-props="{ 'aria-label': t('systemSettings.objectStorageAliOssAccessKeySecret') }"
          />
        </NFormItem>
        <NSpace justify="end">
          <NButton @click="objectStorageDraft = null">{{ t("common.cancel") }}</NButton>
          <NButton type="primary" attr-type="submit">{{ t("common.confirm") }}</NButton>
        </NSpace>
      </NForm>
    </NModal>

    <NModal
      :show="showGeneratedApiKeyModal"
      preset="card"
      class="generated-api-key-modal"
      :title="t('systemSettings.generatedApiKeyTitle')"
      @update:show="handleGeneratedApiKeyModalUpdate"
    >
      <NSpace vertical size="small">
        <NAlert type="warning">
          {{ t("systemSettings.generatedApiKeyNotice") }}
        </NAlert>
        <div class="api-key-box">
          <code>{{ generatedApiKey }}</code>
          <NButton size="small" @click="handleCopyGeneratedApiKey">
            {{ t("systemSettings.copyApiKey") }}
          </NButton>
        </div>
      </NSpace>
    </NModal>
  </div>
  <NModal
    v-model:show="proxyCheckerVisible"
    preset="card"
    :title="t('systemSettings.proxyChecker')"
    :closable="!proxyChecking"
    :mask-closable="!proxyChecking"
    :close-on-esc="!proxyChecking"
    style="width: min(860px, calc(100vw - 32px))"
  >
    <NSpace vertical :size="16">
      <NText>{{ t("systemSettings.proxyCheckTarget") }}</NText>
      <NInput
        v-model:value="proxyCheckInput"
        type="textarea"
        :rows="6"
        :disabled="proxyChecking"
        :aria-label="t('systemSettings.collectorProxies')"
        :placeholder="t('systemSettings.collectorProxiesPlaceholder')"
      />
      <NSpace align="center" justify="space-between">
        <NText aria-live="polite">
          {{
            t("systemSettings.proxyCheckProgress", {
              done: proxyCheckResults.length,
              total: proxyCheckTotal,
              ok: proxyCheckResults.filter((item) => item.status === "ok").length,
            })
          }}
        </NText>
        <NButton
          v-if="proxyChecking"
          :disabled="proxyCheckStopRequested"
          @click="proxyCheckStopRequested = true"
        >
          {{ t("systemSettings.proxyCheckStop") }}
        </NButton>
        <NButton v-else type="primary" @click="handleCheckProxies">
          <template #icon><NIcon :component="CheckCircleOutlined" /></template>
          {{ t("systemSettings.proxyCheckStart") }}
        </NButton>
      </NSpace>
      <div v-if="proxyCheckResults.length" class="proxy-check-results">
        <NTable :single-line="false" size="small">
          <thead>
            <tr>
              <th>{{ t("systemSettings.proxyCheckIndex") }}</th>
              <th>{{ t("systemSettings.proxyCheckAddress") }}</th>
              <th>{{ t("systemSettings.proxyCheckResult") }}</th>
              <th>{{ t("systemSettings.proxyCheckDuration") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in proxyCheckResults" :key="index">
              <td>{{ index + 1 }}</td>
              <td class="proxy-check-address">{{ item.proxy }}</td>
              <td>
                <NText :type="item.status === 'ok' ? 'success' : 'error'">
                  {{ t(`systemSettings.proxyCheckStatus.${item.status}`) }}
                </NText>
                <span v-if="item.status_code !== null"> ({{ item.status_code }})</span>
              </td>
              <td>{{ item.duration_ms }} ms</td>
            </tr>
          </tbody>
        </NTable>
      </div>
    </NSpace>
  </NModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@vicons/antd";
import {
  NAlert,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NList,
  NListItem,
  NModal,
  NRadioButton,
  NRadio,
  NRadioGroup,
  NSpace,
  NSpin,
  NTabPane,
  NTable,
  NTabs,
  NTag,
  NText,
  useDialog,
  useMessage,
  type InputInst,
} from "naive-ui";
import {
  checkGmapProxies,
  generateAdminApiKey,
  getAdminApiKeyMeta,
  getGmapCollectorConfig,
  getObjectStorageConfig,
  getReoonBalances,
  getReoonConfig,
  refreshConfigCache,
  saveGmapCollectorConfig,
  saveReoonConfig,
  testGmapCollector,
  saveObjectStorageConfig,
  type AdminApiKeyMeta,
  type ConfigCacheRefreshResult,
  type GmapCollectorInstance,
  type GmapCollectorTestResult,
  type GmapProxyCheckResult,
  type ObjectStorageConfig,
  type ObjectStorageItem,
  type ReoonAccount,
  type ReoonBalance,
  type ReoonConfig,
} from "@/api/system-settings";
import { formatAdminTimeMs } from "@/utils/time";
import { BusinessError } from "@/api/request";

interface CollectorRow extends GmapCollectorInstance {
  checking: boolean;
  result: GmapCollectorTestResult | null;
}

const { t } = useI18n();
const dialog = useDialog();
const message = useMessage();

const refreshingCache = ref(false);
const apiKeyLoading = ref(false);
const generatingApiKey = ref(false);
const collectorLoading = ref(false);
const collectorSaving = ref(false);
const collectorLoaded = ref(false);
const collectorRows = ref<CollectorRow[]>([]);
const collectorProxies = ref("");
const collectorProxiesInput = ref<InputInst | null>(null);
const collectorBusy = computed(
  () => collectorLoading.value || collectorSaving.value || collectorRows.value.some(row => row.checking),
);
const collectorDisabled = computed(() => collectorBusy.value || !collectorLoaded.value);
const proxyCheckerVisible = ref(false);
const proxyCheckInput = ref("");
const proxyChecking = ref(false);
const proxyCheckStopRequested = ref(false);
const proxyCheckTotal = ref(0);
const proxyCheckResults = ref<GmapProxyCheckResult[]>([]);

function openProxyChecker() {
  proxyCheckInput.value = collectorProxies.value;
  proxyCheckResults.value = [];
  proxyCheckTotal.value = 0;
  proxyCheckerVisible.value = true;
}

async function handleCheckProxies() {
  const proxies = proxyCheckInput.value
    .split("\n")
    .map((proxy) => proxy.trim())
    .filter(Boolean);
  if (proxies.length === 0) {
    message.warning(t("systemSettings.proxyCheckEmpty"));
    return;
  }
  const invalidIndex = proxies.findIndex((proxy) => !isValidProxyUrl(proxy));
  if (invalidIndex !== -1) {
    message.warning(t("systemSettings.proxyInvalid", { index: invalidIndex + 1 }));
    return;
  }
  proxyChecking.value = true;
  proxyCheckStopRequested.value = false;
  proxyCheckResults.value = [];
  proxyCheckTotal.value = proxies.length;
  try {
    for (let offset = 0; offset < proxies.length && !proxyCheckStopRequested.value; offset += 20) {
      const result = await checkGmapProxies(proxies.slice(offset, offset + 20));
      proxyCheckResults.value.push(...result.items);
    }
  } catch (error) {
    message.error(
      error instanceof BusinessError ? error.message : t("systemSettings.proxyCheckFailed"),
    );
  } finally {
    proxyChecking.value = false;
  }
}
const objectStorageLoading = ref(false);
const objectStorageSaving = ref(false);
const activeTab = ref("config-cache");
const cacheRefreshResult = ref<ConfigCacheRefreshResult | null>(null);
const apiKeyMeta = ref<AdminApiKeyMeta | null>(null);
const generatedApiKey = ref("");
const showGeneratedApiKeyModal = ref(false);
const objectStorageConfig = ref<ObjectStorageConfig>({
  active_id: null,
  items: [],
});
const objectStorageLoaded = ref(false);
const objectStorageSavedIds = ref<string[]>([]);
const objectStorageDraft = ref<ObjectStorageItem | null>(null);
const objectStorageDisabled = computed(
  () => objectStorageLoading.value || objectStorageSaving.value || !objectStorageLoaded.value,
);
const objectStorageLocationLocked = computed(
  () =>
    objectStorageDraft.value !== null &&
    objectStorageSavedIds.value.includes(objectStorageDraft.value.id),
);

/** 只有已知 API Key 状态时才允许生成，避免加载失败时绕过重新生成确认。 */
const canGenerateApiKey = computed(
  () => !apiKeyLoading.value && !generatingApiKey.value && apiKeyMeta.value !== null,
);

/** API Key 状态未知时给管理员明确重试入口。 */
const showApiKeyUnknownAlert = computed(
  () => !apiKeyLoading.value && apiKeyMeta.value === null,
);

/** 格式化毫秒时间戳。 */
function formatTime(value: number | null) {
  return formatAdminTimeMs(value);
}

/** 初始加载 API Key 元信息。 */
async function loadApiKeyMeta() {
  apiKeyLoading.value = true;
  try {
    apiKeyMeta.value = null;
    apiKeyMeta.value = await getAdminApiKeyMeta();
  } catch (error) {
    console.error("SystemSettingsView.loadApiKeyMeta() 加载失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.apiKeyLoadFailed"),
      ),
    );
    apiKeyMeta.value = null;
  } finally {
    apiKeyLoading.value = false;
  }
}

/** 刷新配置读取缓存。 */
async function handleRefreshConfigCache() {
  refreshingCache.value = true;
  try {
    cacheRefreshResult.value = await refreshConfigCache();
    message.success(t("systemSettings.cacheRefreshSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleRefreshConfigCache() 刷新失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.cacheRefreshFailed"),
      ),
    );
  } finally {
    refreshingCache.value = false;
  }
}

/** 优先展示后端返回的业务错误 msg，避免丢失可定位原因。 */
function getErrorMessage(error: Error | null, fallback: string) {
  return error?.message || fallback;
}

/** 根据当前状态决定直接生成或先确认重新生成。 */
function handleGenerateApiKey() {
  if (apiKeyMeta.value === null) {
    message.warning(t("systemSettings.apiKeyUnknownDescription"));
    return;
  }

  if (!apiKeyMeta.value.has_api_key) {
    void generateApiKeyAfterConfirm();
    return;
  }

  dialog.warning({
    title: t("systemSettings.regenerateApiKey"),
    content: t("systemSettings.regenerateConfirm"),
    positiveText: t("common.confirm"),
    negativeText: t("common.cancel"),
    onPositiveClick: () => {
      void generateApiKeyAfterConfirm();
    },
  });
}

/** 生成 API Key，并将完整 key 仅保存到当前页面状态中。 */
async function generateApiKeyAfterConfirm() {
  generatingApiKey.value = true;
  try {
    const data = await generateAdminApiKey();
    apiKeyMeta.value = {
      has_api_key: true,
      api_key_prefix: data.api_key_prefix,
      api_key_created_at: data.api_key_created_at,
    };
    generatedApiKey.value = data.api_key;
    showGeneratedApiKeyModal.value = true;
    message.success(t("systemSettings.apiKeyGenerateSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.generateApiKeyAfterConfirm() 生成失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.apiKeyGenerateFailed"),
      ),
    );
  } finally {
    generatingApiKey.value = false;
  }
}

/** 关闭一次性 API Key 弹窗时立即清空完整 key。 */
function handleGeneratedApiKeyModalUpdate(show: boolean) {
  showGeneratedApiKeyModal.value = show;
  if (!show) {
    generatedApiKey.value = "";
  }
}

/** 复制本次生成的完整 API Key。 */
async function handleCopyGeneratedApiKey() {
  if (!generatedApiKey.value) return;

  try {
    await navigator.clipboard.writeText(generatedApiKey.value);
    message.success(t("systemSettings.copySuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleCopyGeneratedApiKey() 复制失败:", error);
    message.error(t("systemSettings.copyFailed"));
  }
}

async function loadCollectorConfig() {
  collectorLoading.value = true;
  collectorLoaded.value = false;
  try {
    const config = await getGmapCollectorConfig();
    collectorRows.value = config.collectors.map(collector => ({ ...collector, checking: false, result: null }));
    collectorProxies.value = config.proxies.join("\n");
    collectorLoaded.value = true;
  } catch {
    // 配置响应可能包含凭据，不能记录原始异常。
    console.error("SystemSettingsView.loadCollectorConfig() 加载 Collector 配置失败");
    message.error(t("systemSettings.collectorLoadFailed"));
  } finally {
    collectorLoading.value = false;
  }
}

function addCollector() {
  collectorRows.value.push({ url: "", api_key: "", checking: false, result: null });
}

async function handleTestCollector(row: CollectorRow) {
  row.checking = true;
  row.result = null;
  try {
    row.result = await testGmapCollector({ url: row.url.trim(), api_key: row.api_key.trim() });
  } catch (error) {
    console.error("SystemSettingsView.handleTestCollector() 检查 Collector 节点失败");
    message.error(error instanceof BusinessError ? error.message : t("systemSettings.collectorTestFailed"));
  } finally {
    row.checking = false;
  }
}

/** 使用原生 URL 解析，并校验代理协议、显式端口和凭据格式。 */
function isValidProxyUrl(value: string): boolean {
  if (value.length > 2048 || /[\s\\]/u.test(value)) return false;
  try {
    const url = new URL(value);
    const authority = /^[a-z][a-z0-9+.-]*:\/\/([^/?#]+)\/?$/i.exec(value)?.[1] ?? "";
    const userinfo = authority.includes("@")
      ? authority.slice(0, authority.lastIndexOf("@"))
      : null;
    return (
      ["http:", "https:", "socks5:", "socks5h:"].includes(url.protocol) &&
      Boolean(url.hostname) &&
      (url.hostname.startsWith("[") ||
        url.hostname
          .split(".")
          .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) &&
      /:\d+$/.test(authority) &&
      Number(authority.slice(authority.lastIndexOf(":") + 1)) <= 65535 &&
      !value.includes("?") &&
      !value.includes("#") &&
      (url.pathname === "" || url.pathname === "/") &&
      (userinfo === null ||
        (userinfo.length > 0 &&
          !userinfo.startsWith(":") &&
          /^(?:[a-zA-Z0-9._~!$&'()*+,;=:-]|%[0-9a-fA-F]{2})*$/.test(userinfo)))
    );
  } catch {
    return false;
  }
}

async function handleSaveCollectorConfig() {
  const collectors = collectorRows.value.map(({ url, api_key }) => ({ url: url.trim(), api_key: api_key.trim() }));
  if (collectors.some(collector => !collector.url || !collector.api_key)) {
    message.warning(t("systemSettings.collectorRequired"));
    return;
  }
  const proxies = collectorProxies.value.split("\n").map(proxy => proxy.trim()).filter(Boolean);
  const invalidProxyIndex = proxies.findIndex(proxy => !isValidProxyUrl(proxy));
  if (invalidProxyIndex !== -1) {
    message.warning(t("systemSettings.proxyInvalid", { index: invalidProxyIndex + 1 }));
    collectorProxiesInput.value?.focus();
    return;
  }
  collectorSaving.value = true;
  try {
    await saveGmapCollectorConfig({ collectors, proxies });
    await loadCollectorConfig();
    if (collectorLoaded.value) message.success(t("systemSettings.collectorSaveSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleSaveCollectorConfig() 保存 Collector 配置失败");
    message.error(error instanceof BusinessError ? error.message : t("systemSettings.collectorSaveFailed"));
  } finally {
    collectorSaving.value = false;
  }
}

/** 加载完整对象存储配置。 */
async function loadObjectStorageConfig() {
  objectStorageLoading.value = true;
  try {
    objectStorageConfig.value = await getObjectStorageConfig();
    objectStorageSavedIds.value = objectStorageConfig.value.items.map((item) => item.id);
    objectStorageLoaded.value = true;
  } catch {
    // 异常响应可能携带对象存储密钥，禁止把完整响应写入日志。
    console.error("SystemSettingsView.loadObjectStorageConfig() 加载失败");
    message.error(t("systemSettings.objectStorageLoadFailed"));
  } finally {
    objectStorageLoading.value = false;
  }
}

function addObjectStorage() {
  objectStorageDraft.value = {
    id: crypto.randomUUID(),
    name: "",
    provider: "R2",
    account_id: "",
    bucket: "",
    access_key_id: "",
    secret_access_key: "",
  };
}

function editObjectStorage(item: ObjectStorageItem) {
  objectStorageDraft.value = { ...item };
}

function setObjectStorageProvider(provider: string | number) {
  if (!objectStorageDraft.value) return;
  const { id, name, bucket, access_key_id } = objectStorageDraft.value;
  const common = { id, name, bucket, access_key_id };
  objectStorageDraft.value =
    provider === "R2"
      ? { ...common, provider: "R2", account_id: "", secret_access_key: "" }
      : { ...common, provider: "AliOSS", endpoint: "", access_key_secret: "" };
}

function applyObjectStorageDraft() {
  const draft = objectStorageDraft.value;
  if (!draft) return;
  if (Object.values(draft).some((value) => !value.trim())) {
    message.warning(t("systemSettings.objectStorageRequired"));
    return;
  }
  if (draft.provider === "AliOSS" && !isValidAliOssEndpoint(draft.endpoint)) {
    message.warning(t("systemSettings.objectStorageAliOssEndpointInvalid"));
    return;
  }
  const index = objectStorageConfig.value.items.findIndex((item) => item.id === draft.id);
  if (index < 0) {
    objectStorageConfig.value.items.push(draft);
    if (objectStorageConfig.value.items.length === 1)
      objectStorageConfig.value.active_id = draft.id;
  } else {
    objectStorageConfig.value.items[index] = draft;
  }
  objectStorageDraft.value = null;
}

function removeObjectStorage(item: ObjectStorageItem) {
  dialog.warning({
    title: t("systemSettings.objectStorageDelete", { name: item.name }),
    content: t("systemSettings.objectStorageDeleteConfirm"),
    positiveText: t("common.confirm"),
    negativeText: t("common.cancel"),
    onPositiveClick: () => {
      objectStorageConfig.value.items = objectStorageConfig.value.items.filter(
        (row) => row.id !== item.id,
      );
      if (objectStorageConfig.value.active_id === item.id)
        objectStorageConfig.value.active_id = null;
    },
  });
}

async function handleSaveObjectStorageConfig() {
  if (objectStorageConfig.value.items.length && objectStorageConfig.value.active_id === null) {
    message.warning(t("systemSettings.objectStorageActiveRequired"));
    return;
  }

  objectStorageSaving.value = true;
  try {
    objectStorageConfig.value = await saveObjectStorageConfig(objectStorageConfig.value);
    objectStorageSavedIds.value = objectStorageConfig.value.items.map((item) => item.id);
    message.success(t("systemSettings.objectStorageSaveSuccess"));
  } catch {
    // Axios 错误对象包含请求体，不得把存储密钥写入日志或通知。
    console.error("SystemSettingsView.handleSaveObjectStorageConfig() 保存失败");
    message.error(t("systemSettings.objectStorageSaveFailed"));
  } finally {
    objectStorageSaving.value = false;
  }
}

/** AliOSS endpoint 只接受不携带路径、凭据、查询和片段的 HTTP(S) 服务地址。 */
function isValidAliOssEndpoint(value: string) {
  const rawEndpoint = value.trim();
  if (!/^https?:\/\/[^/?#\\]+\/?$/i.test(rawEndpoint)) {
    return false;
  }

  try {
    const endpoint = new URL(rawEndpoint);
    return (
      ["http:", "https:"].includes(endpoint.protocol) &&
      Boolean(endpoint.hostname) &&
      !endpoint.username &&
      !endpoint.password &&
      !endpoint.search &&
      !endpoint.hash &&
      (endpoint.pathname === "" || endpoint.pathname === "/")
    );
  } catch {
    return false;
  }
}

const reoonLoading = ref(false);
const reoonSaving = ref(false);
const reoonLoaded = ref(false);
const reoonBalancesLoading = ref(false);
const reoonRows = ref<ReoonAccount[]>([]);
/** 后端当前保存的账号，也就是额度查询的对象。 */
const reoonSavedAccounts = ref<ReoonAccount[]>([]);
const reoonBalances = ref<ReoonBalance[]>([]);
const reoonBusy = computed(
  () => reoonLoading.value || reoonSaving.value || reoonBalancesLoading.value,
);
const reoonDisabled = computed(() => reoonBusy.value || !reoonLoaded.value);

/**
 * 额度按后端已保存配置查询：只有名称与 Key 都和已保存账号一致的行才展示额度，
 * 新增或改过的行保存前不展示，避免把旧 Key 的额度显示在新 Key 上。
 */
const reoonRowViews = computed(() =>
  reoonRows.value.map((row) => {
    const name = row.name.trim();
    return {
      row,
      saved: reoonSavedAccounts.value.some(
        (account) => account.name === name && account.api_key === row.api_key.trim(),
      ),
      balance: reoonBalances.value.find((item) => item.name === name),
    };
  }),
);

function applyReoonConfig(config: ReoonConfig) {
  reoonSavedAccounts.value = config.accounts;
  reoonRows.value = config.accounts.map((account) => ({ ...account }));
}

async function loadReoonConfig() {
  reoonLoading.value = true;
  reoonLoaded.value = false;
  try {
    applyReoonConfig(await getReoonConfig());
    reoonLoaded.value = true;
  } catch {
    // 配置响应包含 API Key，不能记录原始异常。
    console.error("SystemSettingsView.loadReoonConfig() 加载 Reoon 配置失败");
    message.error(t("systemSettings.reoonLoadFailed"));
  } finally {
    reoonLoading.value = false;
  }
}

/** 单账号失败由后端放进该行 reason；这里只处理整次请求失败。 */
async function loadReoonBalances() {
  reoonBalancesLoading.value = true;
  reoonBalances.value = [];
  try {
    reoonBalances.value = (await getReoonBalances()).items;
  } catch (error) {
    console.error("SystemSettingsView.loadReoonBalances() 查询 Reoon 额度失败:", error);
    message.error(
      error instanceof BusinessError ? error.message : t("systemSettings.reoonBalancesFailed"),
    );
  } finally {
    reoonBalancesLoading.value = false;
  }
}

function addReoonAccount() {
  reoonRows.value.push({ name: "", api_key: "" });
}

async function handleSaveReoonConfig() {
  const accounts = reoonRows.value.map(({ name, api_key }) => ({
    name: name.trim(),
    api_key: api_key.trim(),
  }));
  if (accounts.some((account) => !account.name || !account.api_key)) {
    message.warning(t("systemSettings.reoonRequired"));
    return;
  }
  // 后端对重名只返回通用参数错误，前端先指出具体名称。
  const names = accounts.map((account) => account.name);
  const duplicateName = names.find((name, index) => names.indexOf(name) !== index);
  if (duplicateName !== undefined) {
    message.warning(t("systemSettings.reoonDuplicateName", { name: duplicateName }));
    return;
  }
  reoonSaving.value = true;
  try {
    applyReoonConfig(await saveReoonConfig({ accounts }));
    message.success(t("systemSettings.reoonSaveSuccess"));
    // 已保存账号变了，旧额度可能属于旧 Key，按新配置重查。
    void loadReoonBalances();
  } catch (error) {
    console.error("SystemSettingsView.handleSaveReoonConfig() 保存 Reoon 配置失败");
    message.error(
      error instanceof BusinessError ? error.message : t("systemSettings.reoonSaveFailed"),
    );
  } finally {
    reoonSaving.value = false;
  }
}

onMounted(() => {
  void loadApiKeyMeta();
  void loadCollectorConfig();
  void loadObjectStorageConfig();
  void loadReoonConfig();
  void loadReoonBalances();
});
</script>

<style scoped>
.system-settings-view {
  max-width: 960px;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.result-alert {
  margin-top: 16px;
}

.unknown-alert {
  margin-bottom: 16px;
}

.collector-hint {
  display: block;
  margin-bottom: 16px;
}

.collector-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.collector-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(160px, 1fr);
  gap: 12px;
  align-items: end;
}

.collector-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.collector-proxies {
  width: 100%;
  min-height: 200px;
}

.proxy-check-results {
  max-height: 360px;
  overflow: auto;
}

.proxy-check-address {
  overflow-wrap: anywhere;
  min-width: 140px;
}

.object-storage-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.object-storage-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.object-storage-summary {
  display: flex;
  flex-direction: column;
  overflow-wrap: anywhere;
  min-width: 0;
}

.object-storage-actions {
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

:deep(.object-storage-modal) {
  width: min(560px, calc(100% - 32px));
}

.api-key-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--rounded-sm);
  background: var(--surface);
}

.api-key-box code {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

:deep(.generated-api-key-modal) {
  max-width: 720px;
}

.reoon-row {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
}

.reoon-balance {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
}

.reoon-metric {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.reoon-credits {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 560px) {
  .api-key-box {
    align-items: stretch;
    flex-direction: column;
  }

  .tab-actions {
    justify-content: stretch;
  }

  .collector-row {
    grid-template-columns: 100%;
  }

}
</style>
