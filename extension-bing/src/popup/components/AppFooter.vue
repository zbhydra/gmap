<!--
  Popup 底部联系入口。

  联系文案由 vue-i18n 负责语序和标点，邮箱地址支持打开邮件客户端或直接复制。
  Popup 只安装全局 composer，因此 I18nT 必须显式使用 global scope，避免默认查找父级 scope。
-->
<template>
  <footer class="support-footer">
    <div class="support-content">
      <div class="support-row support-email-row">
        <I18nT :keypath="I18N_KEYS.APP.SUPPORT_CONTACT" tag="p" scope="global" class="support-text">
          <template #email>
            <a class="support-link" :href="SUPPORT_MAILTO">{{ SUPPORT_EMAIL }}</a>
          </template>
        </I18nT>
        <button class="support-action-button" type="button" @click="copySupportEmail">
          <Icon :name="IconName.DOCUMENT_DUPLICATE" :size="IconSize.XS" aria-hidden="true" />
          <span>{{ t(I18N_KEYS.APP.COPY_SUPPORT_EMAIL) }}</span>
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Icon, IconName, IconSize } from '@/core/components/icons'
import { useToast } from '@/core/composables/useToast'
import { I18N_KEYS } from '@/core/constants/i18n'
import { logger } from '@/core/utils/logger'

const { t } = useI18n()
const { showSuccess, showError } = useToast()

/** 用户支持邮箱。 */
const SUPPORT_EMAIL = 'support@example.com'

/** 点击邮箱时交给系统默认邮件客户端。 */
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`

/** 将支持邮箱写入剪贴板，并通过 Popup 的全局 Toast 返回结果。 */
async function copySupportEmail(): Promise<void> {
  try {
    await navigator.clipboard.writeText(SUPPORT_EMAIL)
    showSuccess(t(I18N_KEYS.APP.SUPPORT_EMAIL_COPIED))
  } catch (error) {
    logger.error(`[Popup AppFooter] 复制支持邮箱失败: email=${SUPPORT_EMAIL}`, error)
    showError(t(I18N_KEYS.APP.SUPPORT_EMAIL_COPY_FAILED))
  }
}
</script>

<style scoped>
/* 色值一律消费 --gme-* 语义 token（src/styles/tokens.css），亮暗随系统。 */
.support-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 4px 16px;
  box-sizing: border-box;
  border-top: 1px solid var(--gme-border);
  background: var(--gme-surface-2);
}

.support-content {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.support-row {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.support-text {
  max-width: 100%;
  margin: 0;
  color: var(--gme-text-2);
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0;
  text-align: center;
  white-space: nowrap;
}

.support-link {
  color: var(--gme-link);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.support-link:hover {
  color: var(--gme-primary-hover);
}

.support-link:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 2px;
}

.support-action-button {
  flex-shrink: 0;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;
  border: 1px solid var(--gme-border-strong);
  border-radius: var(--gme-rounded-full);
  background: var(--gme-surface);
  color: var(--gme-text);
  font: inherit;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.support-action-button:hover {
  background: var(--gme-surface-2);
}

.support-action-button:active {
  background: var(--gme-surface-2);
}

.support-action-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.support-action-button:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .support-action-button {
    transition: none;
  }
}
</style>
