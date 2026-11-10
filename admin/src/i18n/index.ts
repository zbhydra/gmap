/**
 * vue-i18n 国际化实例
 *
 * 仅支持 zh-CN / en-US 两种语言
 */
import { createI18n } from "vue-i18n";
import { watch } from "vue";
import zhCN from "./zh-CN.json";
import enUS from "./en-US.json";

const LOCALE_KEY = "admin_locale";
const savedLocale = localStorage.getItem(LOCALE_KEY);

const i18n = createI18n({
  legacy: false,
  locale: savedLocale === "en-US" ? "en-US" : "zh-CN",
  fallbackLocale: "zh-CN",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
});

watch(
  i18n.global.locale,
  (locale) => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en";
  },
  { immediate: true, flush: "sync" },
);

export default i18n;
