/**
 * astro check / tsc 的 `.vue` 模块声明。
 *
 * 普通 tsc 不解析 SFC；Vue 单文件组件的 props 类型由构建门禁中的
 * `vue-tsc --noEmit` 检查，这里只保证 `.astro` 与 `.ts` 文件里的导入可解析。
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- 声明边界，非逃逸用途
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}
