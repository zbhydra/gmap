<!--
  系统设置页面。

  功能：
  1. 刷新当前业务进程内配置读取缓存，并展示刷新时间和服务列表。
  2. 查询、生成和重新生成当前管理员外部 API Key；完整 key 仅在弹窗中一次性展示。
-->
<template>
  <div class="system-settings-view">
    <NCard>
      <NTabs v-model:value="activeTab" type="segment" animated>
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

        <NTabPane
          name="gosom-api"
          :tab="t('systemSettings.tabGosomApi')"
        >
          <section>
            <NSpin :show="gosomLoading">
              <div class="gosom-form">
                <div class="gosom-field">
                  <NText class="gosom-label">
                    {{ t("systemSettings.gosomBaseUrl") }}
                  </NText>
                  <NInput
                    v-model:value="gosomConfig.base_url"
                    :placeholder="t('systemSettings.gosomBaseUrlPlaceholder')"
                    :disabled="gosomLoading"
                  />
                </div>
                <div class="gosom-field">
                  <NText class="gosom-label">
                    {{ t("systemSettings.gosomApiKey") }}
                  </NText>
                  <NInput
                    v-model:value="gosomConfig.api_key"
                    :placeholder="t('systemSettings.gosomApiKeyPlaceholder')"
                    :disabled="gosomLoading"
                  />
                </div>
              </div>
            </NSpin>
            <div class="tab-actions">
              <NButton
                type="primary"
                :loading="gosomSaving"
                :disabled="gosomLoading"
                @click="handleSaveGosomConfig"
              >
                {{ t("systemSettings.gosomSave") }}
              </NButton>
            </div>
          </section>
        </NTabPane>

      </NTabs>
    </NCard>

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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  NAlert,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NInput,
  NList,
  NListItem,
  NModal,
  NSpace,
  NSpin,
  NTabPane,
  NTabs,
  NTag,
  NText,
  useDialog,
  useMessage,
} from "naive-ui";
import {
  generateAdminApiKey,
  getAdminApiKeyMeta,
  getGosomApiConfig,
  refreshConfigCache,
  saveGosomApiConfig,
  type AdminApiKeyMeta,
  type ConfigCacheRefreshResult,
  type GosomApiConfig,
} from "@/api/system-settings";
import { formatAdminTimeMs } from "@/utils/time";

const { t } = useI18n();
const dialog = useDialog();
const message = useMessage();

const refreshingCache = ref(false);
const apiKeyLoading = ref(false);
const generatingApiKey = ref(false);
const gosomLoading = ref(false);
const gosomSaving = ref(false);
const activeTab = ref("config-cache");
const cacheRefreshResult = ref<ConfigCacheRefreshResult | null>(null);
const apiKeyMeta = ref<AdminApiKeyMeta | null>(null);
const generatedApiKey = ref("");
const showGeneratedApiKeyModal = ref(false);
const gosomConfig = ref<GosomApiConfig>({ base_url: "", api_key: "" });

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

/** 加载 gosom 引擎 API 配置。 */
async function loadGosomConfig() {
  gosomLoading.value = true;
  try {
    gosomConfig.value = await getGosomApiConfig();
  } catch (error) {
    console.error("SystemSettingsView.loadGosomConfig() 加载失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.gosomLoadFailed"),
      ),
    );
  } finally {
    gosomLoading.value = false;
  }
}

/** 保存 gosom 引擎 API 配置；两端均为必填，空白视为未填。 */
async function handleSaveGosomConfig() {
  const base_url = gosomConfig.value.base_url.trim();
  const api_key = gosomConfig.value.api_key.trim();
  if (!base_url || !api_key) {
    message.warning(t("systemSettings.gosomRequired"));
    return;
  }

  gosomSaving.value = true;
  try {
    gosomConfig.value = await saveGosomApiConfig({ base_url, api_key });
    message.success(t("systemSettings.gosomSaveSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleSaveGosomConfig() 保存失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.gosomSaveFailed"),
      ),
    );
  } finally {
    gosomSaving.value = false;
  }
}

onMounted(() => {
  void loadApiKeyMeta();
  void loadGosomConfig();
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

.gosom-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gosom-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gosom-label {
  font-size: 14px;
}

.api-key-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--n-border-color);
  border-radius: 6px;
  background: var(--n-color);
}

.api-key-box code {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

:deep(.generated-api-key-modal) {
  max-width: 720px;
}

@media (max-width: 560px) {
  .api-key-box {
    align-items: stretch;
    flex-direction: column;
  }

  .tab-actions {
    justify-content: stretch;
  }
}
</style>
