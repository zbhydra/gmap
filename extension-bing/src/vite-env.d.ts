/// <reference types="vite/client" />

// 全局常量声明
declare const __API_BASE_URL__: string
declare const __DEV__: boolean
declare const __WEBSITE_BASE_URL__: string
/** 官网外部消息 origin 白名单（构建期注入，manifest 与运行时校验共用）。 */
declare const __WEBSITE_AUTH_ORIGINS__: readonly string[]
/** 插件端 SLS WebTracking mark-log 构建期配置。 */
declare const __ALI_SLS_MARK_CONFIG__: {
  readonly enabled: boolean
  readonly endpoint: string
  readonly logstore: string
  readonly topic: string
  readonly source: string
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css?inline' {
  const css: string
  export default css
}
