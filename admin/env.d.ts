/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端业务 API 根地址（生产从 deploy/production.conf 编译）；开发未配置时走 Vite proxy。 */
  readonly VITE_API_BASE_URL?: string;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
