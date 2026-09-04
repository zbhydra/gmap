<!--
  根组件：Naive UI Provider 包裹
  NConfigProvider → NMessageProvider → NDialogProvider → RouterView
-->
<template>
  <NConfigProvider :theme="isDark ? darkTheme : null" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <NDialogProvider>
        <RouterView />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  darkTheme,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  type GlobalThemeOverrides,
} from "naive-ui";
import { computed } from "vue";
import { usePrefersDark } from "@/composables/useResponsive";

const isDark = usePrefersDark();
const themeOverrides = computed<GlobalThemeOverrides>(() => {
  void isDark.value;
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    common: {
      bodyColor: token("--bg"),
      cardColor: token("--surface"),
      modalColor: token("--surface"),
      popoverColor: token("--surface"),
      tableColor: token("--surface"),
      tableHeaderColor: token("--surface-2"),
      hoverColor: token("--surface-2"),
      borderColor: token("--border"),
      dividerColor: token("--border"),
      textColor1: token("--text"),
      textColor2: token("--text-2"),
      textColor3: token("--text-3"),
      primaryColor: token("--primary"),
      primaryColorHover: token("--primary-hover"),
      primaryColorPressed: token("--primary-hover"),
      primaryColorSuppl: token("--primary"),
      successColor: token("--ok"),
      warningColor: token("--warn"),
      errorColor: token("--bad"),
      fontFamily: "var(--font-body)",
      fontFamilyMono: "var(--font-mono)",
      borderRadius: "var(--rounded-md)",
      borderRadiusSmall: "var(--rounded-sm)",
      boxShadow1: "var(--shadow-card)",
      boxShadow2: "var(--shadow-pop)",
      boxShadow3: "var(--shadow-modal)",
    },
    Button: {
      borderRadiusTiny: "var(--rounded-full)",
      borderRadiusSmall: "var(--rounded-full)",
      borderRadiusMedium: "var(--rounded-full)",
      borderRadiusLarge: "var(--rounded-full)",
      textColorPrimary: "var(--primary-fg)",
      textColorHoverPrimary: "var(--primary-fg)",
      textColorPressedPrimary: "var(--primary-fg)",
      textColorFocusPrimary: "var(--primary-fg)",
      textColorDisabledPrimary: "var(--primary-fg)",
      textColorInfo: "var(--primary-fg)",
      textColorHoverInfo: "var(--primary-fg)",
      textColorPressedInfo: "var(--primary-fg)",
      textColorFocusInfo: "var(--primary-fg)",
      textColorDisabledInfo: "var(--primary-fg)",
      textColorSuccess: "var(--ok-fg)",
      textColorHoverSuccess: "var(--ok-fg)",
      textColorPressedSuccess: "var(--ok-fg)",
      textColorFocusSuccess: "var(--ok-fg)",
      textColorDisabledSuccess: "var(--ok-fg)",
      textColorWarning: "var(--warn-fg)",
      textColorHoverWarning: "var(--warn-fg)",
      textColorPressedWarning: "var(--warn-fg)",
      textColorFocusWarning: "var(--warn-fg)",
      textColorDisabledWarning: "var(--warn-fg)",
      textColorError: "var(--bad-fg)",
      textColorHoverError: "var(--bad-fg)",
      textColorPressedError: "var(--bad-fg)",
      textColorFocusError: "var(--bad-fg)",
      textColorDisabledError: "var(--bad-fg)",
    },
    Card: {
      borderRadius: "var(--rounded-md)",
      boxShadow: "var(--shadow-card)",
    },
    Input: {
      borderRadius: "var(--rounded-sm)",
    },
  };
});
</script>
